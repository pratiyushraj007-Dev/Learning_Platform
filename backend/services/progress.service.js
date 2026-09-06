const QuizAttempt = require('../models/QuizAttempt');
const { STRONG_THRESHOLD, WEAK_THRESHOLD, RECENT_ATTEMPTS_COUNT } = require('../constants/scoring');
const { calculateRecommendedDifficulty } = require('./quiz.service');

/**
 * Aggregates topic performance across multiple quiz attempts.
 */
const aggregateTopicPerformance = (attempts) => {
  const topicMap = {};

  attempts.forEach((attempt) => {
    if (Array.isArray(attempt.topicPerformance) && attempt.topicPerformance.length > 0) {
      attempt.topicPerformance.forEach((tp) => {
        const topicName = tp.topic;
        if (!topicName) return;
        if (!topicMap[topicName]) {
          topicMap[topicName] = { total: 0, correct: 0 };
        }
        topicMap[topicName].total += tp.total || 0;
        topicMap[topicName].correct += tp.correct || 0;
      });
    } else if (attempt.quizId && attempt.quizId.topic) {
      const topicName = attempt.quizId.topic;
      if (!topicMap[topicName]) {
        topicMap[topicName] = { total: 0, correct: 0 };
      }
      const totalQ = attempt.totalQuestions || 10;
      const correctQ = attempt.correctAnswers || Math.round((attempt.score / 100) * totalQ);
      topicMap[topicName].total += totalQ;
      topicMap[topicName].correct += correctQ;
    }
  });

  return Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    total: data.total,
    correct: data.correct,
    percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
  }));
};

/**
 * Calculates overall and recent quiz statistics for a student.
 */
const getStudentQuizStats = async (studentId) => {
  const attempts = await QuizAttempt.find({ studentId })
    .populate('quizId', 'title topic courseId')
    .sort('-createdAt');

  if (attempts.length === 0) {
    return {
      quizzesAttempted: 0,
      uniqueQuizzesCount: 0,
      averageScore: 0,
      recentAverageScore: 0,
      topicPerformance: [],
      weakTopics: [],
      strongTopics: [],
      recommendedDifficulty: 'easy',
      recentAttempts: []
    };
  }

  const quizzesAttempted = attempts.length;
  const uniqueQuizIds = new Set(attempts.map((a) => a.quizId?._id?.toString() || a.quizId?.toString()));
  const uniqueQuizzesCount = uniqueQuizIds.size;

  // Average score across ALL attempts
  const totalScoreSum = attempts.reduce((sum, a) => sum + (a.percentage ?? a.score ?? 0), 0);
  const averageScore = Math.round(totalScoreSum / quizzesAttempted);

  // Average score across RECENT attempts
  const recentAttempts = attempts.slice(0, RECENT_ATTEMPTS_COUNT);
  const recentScoreSum = recentAttempts.reduce((sum, a) => sum + (a.percentage ?? a.score ?? 0), 0);
  const recentAverageScore = Math.round(recentScoreSum / recentAttempts.length);

  // Aggregated topic-wise performance
  const topicPerformance = aggregateTopicPerformance(attempts);

  const weakTopics = topicPerformance
    .filter((tp) => tp.percentage < WEAK_THRESHOLD)
    .map((tp) => tp.topic);

  const strongTopics = topicPerformance
    .filter((tp) => tp.percentage >= STRONG_THRESHOLD)
    .map((tp) => tp.topic);

  // Recommended difficulty based on recent performance
  const recommendedDifficulty = calculateRecommendedDifficulty(recentAverageScore);

  return {
    quizzesAttempted,
    uniqueQuizzesCount,
    averageScore,
    recentAverageScore,
    topicPerformance,
    weakTopics,
    strongTopics,
    recommendedDifficulty,
    recentAttempts: recentAttempts.map((a) => ({
      _id: a._id,
      quizId: a.quizId?._id || a.quizId,
      quizTitle: a.quizId?.title || 'Quiz',
      topic: a.quizId?.topic || 'General',
      score: a.percentage ?? a.score,
      attemptNumber: a.attemptNumber || 1,
      createdAt: a.createdAt
    }))
  };
};

module.exports = {
  aggregateTopicPerformance,
  getStudentQuizStats
};
