const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

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

    const allProgress = await Progress.find({ studentId });
    const totalCompleted = allProgress.filter((p) => p.completed).length;
    const totalInProgress = allProgress.filter((p) => !p.completed && p.videoProgress > 0).length;

    const recentAttempts = await QuizAttempt.find({ studentId })
      .populate('quizId', 'title topic')
      .sort('-createdAt')
      .limit(10);

    const allAttempts = await QuizAttempt.find({ studentId }).populate('quizId', 'topic');
    const topicScores = {};

    allAttempts.forEach((attempt) => {
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

    const recommendations = [];

    weakTopics.slice(0, 2).forEach((wt) => {
      recommendations.push({
        type: 'practice',
        message: `Practice more on "${wt.topic}" — your average score is ${wt.averageScore}%`
      });
    });

    const inProgressLessons = allProgress.filter((p) => !p.completed && p.videoProgress > 0);
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
        recentAttempts,
        weakTopics,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProgress, getLessonProgress, saveProgress, getDashboard };
