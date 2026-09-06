const Progress = require('../models/Progress');
const { getStudentQuizStats } = require('../services/progress.service');
const { getRecommendation } = require('../services/recommendation.service');

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.user._id })
      .populate('lessonId', 'title topic')
      .sort('-updatedAt');
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLessonProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      studentId: req.user._id,
      lessonId: req.params.lessonId
    });
    res.json({ success: true, data: progress || { videoProgress: 0, completed: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveProgress = async (req, res) => {
  try {
    const { lessonId, videoProgress, completed } = req.body;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'lessonId is required' });
    }

    const progress = await Progress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        studentId: req.user._id,
        lessonId,
        videoProgress: videoProgress ?? 0,
        completed: completed ?? false
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Lesson progress stats
    const allLessonProgress = await Progress.find({ studentId });
    const totalCompleted = allLessonProgress.filter((p) => p.completed).length;
    const totalInProgress = allLessonProgress.filter((p) => !p.completed && p.videoProgress > 0).length;

    // Quiz progress stats & recommendations
    const quizStats = await getStudentQuizStats(studentId);
    const recommendation = await getRecommendation(studentId);

    const weakTopicsList = (quizStats.weakTopics || []).map((topicName) => {
      const tp = quizStats.topicPerformance.find((t) => t.topic === topicName);
      return {
        topic: topicName,
        averageScore: tp ? tp.percentage : 0
      };
    });

    const recommendations = [];

    if (recommendation && recommendation.recommendedTopic) {
      recommendations.push({
        type: 'practice',
        recommendedTopic: recommendation.recommendedTopic,
        recommendedDifficulty: recommendation.difficulty,
        message: recommendation.reason
      });
    }

    const inProgressLessons = allLessonProgress.filter((p) => !p.completed && p.videoProgress > 0);
    if (inProgressLessons.length > 0) {
      recommendations.push({
        type: 'continue',
        message: 'Continue your in-progress lessons to stay on track'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'explore',
        message: 'Explore courses and take quizzes to get personalized recommendations'
      });
    }

    res.json({
      success: true,
      data: {
        totalCompleted,
        totalInProgress,
        averageScore: quizStats.averageScore,
        recentAverageScore: quizStats.recentAverageScore,
        quizzesAttempted: quizStats.quizzesAttempted,
        recentAttempts: quizStats.recentAttempts,
        topicPerformance: quizStats.topicPerformance,
        weakTopics: weakTopicsList,
        strongTopics: quizStats.strongTopics,
        recommendedTopic: recommendation?.recommendedTopic || null,
        recommendedDifficulty: quizStats.recommendedDifficulty,
        recommendationReason: recommendation?.reason || null,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuizStats = async (req, res) => {
  try {
    const studentId = req.user._id;
    const stats = await getStudentQuizStats(studentId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProgress,
  getLessonProgress,
  saveProgress,
  getDashboard,
  getQuizStats
};
