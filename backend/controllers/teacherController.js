const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');

const getPerformance = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const courses = await Course.find({ createdBy: teacherId });
    const courseIds = courses.map((c) => c._id);

    const quizzes = await Quiz.find({ courseId: { $in: courseIds } });
    const quizIds = quizzes.map((q) => q._id);

    const attempts = await QuizAttempt.find({ quizId: { $in: quizIds } })
      .populate('studentId', 'name')
      .populate('quizId', 'title topic')
      .sort('-createdAt');

    const studentIds = [...new Set(attempts.map((a) => String(a.studentId?._id)))];
    const totalStudents = studentIds.filter(Boolean).length;

    const averageScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0;

    const topicScores = {};
    attempts.forEach((attempt) => {
      const topic = attempt.quizId?.topic;
      if (!topic) return;
      if (!topicScores[topic]) topicScores[topic] = { total: 0, count: 0 };
      topicScores[topic].total += attempt.score;
      topicScores[topic].count += 1;
    });

    const weakTopics = Object.entries(topicScores)
      .map(([topic, data]) => ({
        topic,
        averageScore: Math.round(data.total / data.count)
      }))
      .filter((t) => t.averageScore < 50)
      .sort((a, b) => a.averageScore - b.averageScore);

    const lowScoreStudents = attempts
      .filter((a) => a.score < 50)
      .slice(0, 10)
      .map((a) => ({
        studentName: a.studentId?.name || 'Unknown',
        quizTitle: a.quizId?.title || 'Quiz',
        topic: a.quizId?.topic || '-',
        score: a.score
      }));

    const performanceTable = attempts.map((a) => ({
      studentName: a.studentId?.name || 'Unknown',
      quizTitle: a.quizId?.title || 'Quiz',
      topic: a.quizId?.topic || '-',
      score: a.score,
      date: a.createdAt
    }));

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalQuizzes: quizzes.length,
        totalStudents,
        averageScore,
        weakTopics,
        lowScoreStudents,
        performanceTable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPerformance };
