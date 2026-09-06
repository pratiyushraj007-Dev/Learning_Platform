const QuizAttempt = require('../models/QuizAttempt');
const { WEAK_THRESHOLD, RECENT_ATTEMPTS_COUNT } = require('../constants/scoring');
const { calculateRecommendedDifficulty } = require('./quiz.service');

/**
 * Recommends the next topic to practice based on rule-based historical + recent performance.
 */
const getRecommendation = async (studentId) => {
  const attempts = await QuizAttempt.find({ studentId })
    .populate('quizId', 'topic title')
    .sort('-createdAt');

  if (attempts.length === 0) {
    return {
      recommendedTopic: null,
      reason: 'No quiz performance data available yet. Attempt a quiz to receive recommendations.',
      difficulty: 'easy'
    };
  }

  // 1. Group topic data historically and recently
  const topicStats = {};

  attempts.forEach((attempt, index) => {
    const isRecent = index < RECENT_ATTEMPTS_COUNT;
    const attemptDate = attempt.createdAt ? new Date(attempt.createdAt).getTime() : 0;

    // Check if attempt has structured topicPerformance
    if (Array.isArray(attempt.topicPerformance) && attempt.topicPerformance.length > 0) {
      attempt.topicPerformance.forEach((tp) => {
        const topic = tp.topic;
        if (!topic) return;
        if (!topicStats[topic]) {
          topicStats[topic] = {
            totalHist: 0,
            correctHist: 0,
            totalRecent: 0,
            correctRecent: 0,
            latestAttemptTime: 0
          };
        }
        topicStats[topic].totalHist += tp.total || 0;
        topicStats[topic].correctHist += tp.correct || 0;
        if (isRecent) {
          topicStats[topic].totalRecent += tp.total || 0;
          topicStats[topic].correctRecent += tp.correct || 0;
        }
        if (attemptDate > topicStats[topic].latestAttemptTime) {
          topicStats[topic].latestAttemptTime = attemptDate;
        }
      });
    } else if (attempt.quizId && attempt.quizId.topic) {
      const topic = attempt.quizId.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = {
          totalHist: 0,
          correctHist: 0,
          totalRecent: 0,
          correctRecent: 0,
          latestAttemptTime: 0
        };
      }
      const totalQ = attempt.totalQuestions || 10;
      const correctQ = attempt.correctAnswers || Math.round(((attempt.percentage ?? attempt.score) / 100) * totalQ);
      topicStats[topic].totalHist += totalQ;
      topicStats[topic].correctHist += correctQ;
      if (isRecent) {
        topicStats[topic].totalRecent += totalQ;
        topicStats[topic].correctRecent += correctQ;
      }
      if (attemptDate > topicStats[topic].latestAttemptTime) {
        topicStats[topic].latestAttemptTime = attemptDate;
      }
    }
  });

  const topicList = Object.entries(topicStats).map(([topic, stats]) => {
    const histPct = stats.totalHist > 0 ? Math.round((stats.correctHist / stats.totalHist) * 100) : 100;
    const recentPct =
      stats.totalRecent > 0 ? Math.round((stats.correctRecent / stats.totalRecent) * 100) : histPct;

    // Weighted score calculation: 40% historical + 60% recent performance
    const weightedScore = stats.totalRecent > 0 ? Math.round(0.4 * histPct + 0.6 * recentPct) : histPct;

    return {
      topic,
      histPct,
      recentPct,
      weightedScore,
      latestAttemptTime: stats.latestAttemptTime
    };
  });

  if (topicList.length === 0) {
    return {
      recommendedTopic: null,
      reason: 'No topic data available yet.',
      difficulty: 'easy'
    };
  }

  // Filter weak topics based on weighted score or recent score
  const weakTopics = topicList.filter((t) => t.weightedScore < WEAK_THRESHOLD || t.recentPct < WEAK_THRESHOLD);

  let chosenTopic = null;

  if (weakTopics.length > 0) {
    // Sort weak topics: lowest weighted score first; if tie, most recently attempted first
    weakTopics.sort((a, b) => {
      if (a.weightedScore !== b.weightedScore) {
        return a.weightedScore - b.weightedScore;
      }
      return b.latestAttemptTime - a.latestAttemptTime;
    });
    chosenTopic = weakTopics[0];
  } else {
    // If all topics are strong (>= 60%), sort all topics by lowest weighted score
    topicList.sort((a, b) => {
      if (a.weightedScore !== b.weightedScore) {
        return a.weightedScore - b.weightedScore;
      }
      return b.latestAttemptTime - a.latestAttemptTime;
    });
    chosenTopic = topicList[0];
  }

  const difficulty = calculateRecommendedDifficulty(chosenTopic.recentPct);

  let reason = `Your recent performance in ${chosenTopic.topic} is ${chosenTopic.recentPct}%, below your target score.`;
  if (chosenTopic.weightedScore >= WEAK_THRESHOLD) {
    reason = `Great work! Your weakest topic is ${chosenTopic.topic} (${chosenTopic.weightedScore}%). Keep practicing to maintain mastery.`;
  }

  return {
    recommendedTopic: chosenTopic.topic,
    reason,
    difficulty,
    metrics: {
      historicalPercentage: chosenTopic.histPct,
      recentPercentage: chosenTopic.recentPct,
      weightedScore: chosenTopic.weightedScore
    }
  };
};

module.exports = {
  getRecommendation
};
