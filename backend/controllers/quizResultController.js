const QuizAttempt = require('../models/QuizAttempt');
const { getStudentQuizStats } = require('../services/progress.service');
const { getRecommendation } = require('../services/recommendation.service');

// GET /api/results/me — get current student's quiz attempts
const getMyResults = async (req, res) => {
  try {
    const studentId = req.user._id;
    const attempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title topic difficulty courseId')
      .sort('-createdAt');

    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/results/:attemptId — get specific quiz attempt result
const getResultById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId)
      .populate('studentId', 'name email')
      .populate('quizId', 'title topic questions difficulty');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz result not found' });
    }

    // Authorization check: student can only view own result; teacher/admin can view any
    if (req.user.role === 'student' && String(attempt.studentId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this result' });
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students/:studentId/progress — overall student progress for teacher/admin or self
const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Authorization check
    if (req.user.role === 'student' && String(studentId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view other student progress' });
    }

    const quizStats = await getStudentQuizStats(studentId);
    const recommendation = await getRecommendation(studentId);

    res.json({
      success: true,
      data: {
        studentId,
        averageScore: quizStats.averageScore,
        recentAverageScore: quizStats.recentAverageScore,
        quizzesAttempted: quizStats.quizzesAttempted,
        topicPerformance: quizStats.topicPerformance,
        weakTopics: quizStats.weakTopics,
        strongTopics: quizStats.strongTopics,
        recommendedTopic: recommendation?.recommendedTopic || null,
        recommendedDifficulty: quizStats.recommendedDifficulty,
        recommendationReason: recommendation?.reason || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students/:studentId/recommendations — topic recommendation for student
const getStudentRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Authorization check
    if (req.user.role === 'student' && String(studentId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view other student recommendations' });
    }

    const recommendation = await getRecommendation(studentId);

    res.json({
      success: true,
      data: {
        recommendedTopic: recommendation.recommendedTopic,
        reason: recommendation.reason,
        difficulty: recommendation.difficulty,
        metrics: recommendation.metrics || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyResults,
  getResultById,
  getStudentProgress,
  getStudentRecommendations
};
