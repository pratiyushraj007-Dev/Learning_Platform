const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { ATTENTION_THRESHOLD, WEAK_THRESHOLD } = require('../constants/scoring');

const getPerformance = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Admin can see all courses; teacher sees only own courses
    const courseFilter = req.user.role === 'admin' ? {} : { createdBy: teacherId };
    const courses = await Course.find(courseFilter);
    const courseIds = courses.map((c) => c._id);

    const quizzes = await Quiz.find({ courseId: { $in: courseIds } });
    const quizIds = quizzes.map((q) => q._id);

    const attempts = await QuizAttempt.find({ quizId: { $in: quizIds } })
      .populate('studentId', 'name email')
      .populate('quizId', 'title topic courseId')
      .sort('-createdAt');

    const studentIds = [...new Set(attempts.map((a) => String(a.studentId?._id)))].filter(Boolean);
    const studentCount = studentIds.length;

    const classAverage =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage ?? a.score ?? 0), 0) / attempts.length)
        : 0;

    // Student-level aggregation across attempts
    const studentStats = {};
    attempts.forEach((a) => {
      const sId = String(a.studentId?._id);
      if (!sId) return;
      if (!studentStats[sId]) {
        studentStats[sId] = {
          studentId: sId,
          name: a.studentId?.name || 'Unknown',
          email: a.studentId?.email || '',
          totalScore: 0,
          attemptsCount: 0
        };
      }
      studentStats[sId].totalScore += a.percentage ?? a.score ?? 0;
      studentStats[sId].attemptsCount += 1;
    });

    const studentsNeedingAttention = Object.values(studentStats)
      .map((s) => ({
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        averageScore: Math.round(s.totalScore / s.attemptsCount),
        attemptsCount: s.attemptsCount
      }))
      .filter((s) => s.averageScore < ATTENTION_THRESHOLD)
      .sort((a, b) => a.averageScore - b.averageScore);

    // Topic-level aggregation across attempts
    const topicStats = {};
    attempts.forEach((attempt) => {
      if (Array.isArray(attempt.topicPerformance) && attempt.topicPerformance.length > 0) {
        attempt.topicPerformance.forEach((tp) => {
          const topic = tp.topic;
          if (!topic) return;
          if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
          topicStats[topic].total += tp.total || 0;
          topicStats[topic].correct += tp.correct || 0;
        });
      } else if (attempt.quizId?.topic) {
        const topic = attempt.quizId.topic;
        if (!topicStats[topic]) topicStats[topic] = { total: 0, count: 0, sum: 0 };
        topicStats[topic].sum += attempt.percentage ?? attempt.score ?? 0;
        topicStats[topic].count += 1;
      }
    });

    const weakTopics = Object.entries(topicStats)
      .map(([topic, data]) => {
        let averagePercentage = 0;
        if (data.total > 0) {
          averagePercentage = Math.round((data.correct / data.total) * 100);
        } else if (data.count > 0) {
          averagePercentage = Math.round(data.sum / data.count);
        }
        return {
          topic,
          averagePercentage,
          averageScore: averagePercentage
        };
      })
      .filter((t) => t.averagePercentage < WEAK_THRESHOLD)
      .sort((a, b) => a.averagePercentage - b.averagePercentage);

    const lowScoreStudents = attempts
      .filter((a) => (a.percentage ?? a.score) < ATTENTION_THRESHOLD)
      .slice(0, 10)
      .map((a) => ({
        studentName: a.studentId?.name || 'Unknown',
        quizTitle: a.quizId?.title || 'Quiz',
        topic: a.quizId?.topic || '-',
        score: a.percentage ?? a.score,
        attemptNumber: a.attemptNumber || 1
      }));

    const performanceTable = attempts.map((a) => ({
      studentName: a.studentId?.name || 'Unknown',
      quizTitle: a.quizId?.title || 'Quiz',
      topic: a.quizId?.topic || '-',
      score: a.percentage ?? a.score,
      attemptNumber: a.attemptNumber || 1,
      date: a.createdAt
    }));

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        totalStudents: studentCount,
        studentCount,
        averageScore: classAverage,
        classAverage,
        weakTopics,
        studentsNeedingAttention,
        lowScoreStudents,
        performanceTable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentDetailForTeacher = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user._id;

    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get quizzes for this teacher's courses
    const courseFilter = req.user.role === 'admin' ? {} : { createdBy: teacherId };
    const teacherCourses = await Course.find(courseFilter);
    const courseIds = teacherCourses.map((c) => c._id);
    const teacherQuizzes = await Quiz.find({ courseId: { $in: courseIds } });
    const quizIds = teacherQuizzes.map((q) => q._id);

    const attempts = await QuizAttempt.find({
      studentId,
      quizId: { $in: quizIds }
    })
      .populate('quizId', 'title topic difficulty')
      .sort('-createdAt');

    const totalAttempts = attempts.length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage ?? a.score ?? 0), 0) / totalAttempts)
        : 0;

    res.json({
      success: true,
      data: {
        student,
        totalAttempts,
        averageScore,
        attempts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPerformance, getStudentDetailForTeacher };
