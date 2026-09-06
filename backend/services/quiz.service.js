const { STRONG_THRESHOLD, AVERAGE_THRESHOLD, WEAK_THRESHOLD } = require('../constants/scoring');

/**
 * Strips correct answers from quiz questions before sending to students.
 * Optionally randomizes question order if requested.
 */
const sanitizeQuizForStudent = (quizDoc, options = {}) => {
  const quizObj = quizDoc.toObject ? quizDoc.toObject() : JSON.parse(JSON.stringify(quizDoc));
  
  let questions = (quizObj.questions || []).map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    topic: q.topic || quizObj.topic,
    difficulty: q.difficulty || quizObj.difficulty
    // correctAnswer is EXCLUDED
  }));

  if (options.randomize) {
    questions = [...questions].sort(() => Math.random() - 0.5);
  }

  return {
    ...quizObj,
    questions
  };
};

/**
 * Calculates difficulty recommendation based on percentage score.
 */
const calculateRecommendedDifficulty = (percentage) => {
  if (percentage >= STRONG_THRESHOLD) return 'hard';
  if (percentage >= AVERAGE_THRESHOLD) return 'medium';
  return 'easy';
};

/**
 * Scores a quiz attempt server-side.
 * Handles both new structured format [{ questionId, selectedOption }]
 * and legacy positional array format.
 */
const scoreQuiz = (quiz, submittedAnswers) => {
  const questions = quiz.questions || [];
  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      score: 0,
      percentage: 0,
      topicPerformance: [],
      wrongAnswerDetails: [],
      weakTopics: [],
      recommendedDifficulty: 'easy',
      questionsReview: []
    };
  }

  let correctAnswers = 0;
  const wrongAnswerDetails = [];
  const questionsReview = [];
  const topicStats = {};

  const normalizeAnswers = (answers) => {
    if (!Array.isArray(answers)) return [];
    return answers;
  };

  const rawAnswers = normalizeAnswers(submittedAnswers);

  // Map question IDs to question objects for fast lookup
  const questionMap = new Map();
  questions.forEach((q, idx) => {
    const qId = q._id ? q._id.toString() : idx.toString();
    questionMap.set(qId, { q, index: idx });
  });

  questions.forEach((q, index) => {
    const topic = q.topic || quiz.topic || 'General';
    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, correct: 0 };
    }
    topicStats[topic].total += 1;

    const qIdStr = q._id ? q._id.toString() : index.toString();
    let studentAnsObj = null;

    // Check if input format is [{ questionId, selectedOption }] or simple positional array
    const structuredMatch = rawAnswers.find(
      (a) => a && typeof a === 'object' && a.questionId && a.questionId.toString() === qIdStr
    );

    let selectedAnswerVal = null;
    let selectedOptionIdx = -1;

    if (structuredMatch) {
      selectedAnswerVal = structuredMatch.selectedOption;
    } else if (rawAnswers[index] !== undefined) {
      selectedAnswerVal = rawAnswers[index];
    }

    // Determine correct answer representation
    const correctVal = q.correctAnswer;
    let isCorrect = false;

    if (typeof correctVal === 'number') {
      // Correct answer stored as 0-based option index
      if (typeof selectedAnswerVal === 'number') {
        selectedOptionIdx = selectedAnswerVal;
        isCorrect = selectedAnswerVal === correctVal;
      } else if (typeof selectedAnswerVal === 'string') {
        // String option value matching
        const optionIdx = q.options.indexOf(selectedAnswerVal);
        selectedOptionIdx = optionIdx;
        isCorrect = optionIdx === correctVal || String(selectedAnswerVal) === String(q.options[correctVal]);
      }
    } else {
      // Correct answer stored as string (legacy format or text match)
      const correctStr = String(correctVal).trim();
      if (typeof selectedAnswerVal === 'number' && q.options[selectedAnswerVal] !== undefined) {
        selectedOptionIdx = selectedAnswerVal;
        isCorrect = String(q.options[selectedAnswerVal]).trim() === correctStr;
      } else if (selectedAnswerVal != null) {
        isCorrect = String(selectedAnswerVal).trim() === correctStr;
        selectedOptionIdx = q.options.findIndex((opt) => String(opt).trim() === String(selectedAnswerVal).trim());
      }
    }

    if (isCorrect) {
      correctAnswers += 1;
      topicStats[topic].correct += 1;
    } else {
      wrongAnswerDetails.push({
        questionId: q._id,
        question: q.question,
        selectedAnswer: selectedAnswerVal != null ? selectedAnswerVal : null,
        correctAnswer: q.correctAnswer,
        topic
      });
    }

    const studentDisplayAns =
      selectedOptionIdx >= 0 && q.options[selectedOptionIdx] !== undefined
        ? q.options[selectedOptionIdx]
        : selectedAnswerVal;

    const correctDisplayAns =
      typeof q.correctAnswer === 'number' && q.options[q.correctAnswer] !== undefined
        ? q.options[q.correctAnswer]
        : q.correctAnswer;

    questionsReview.push({
      questionId: q._id,
      question: q.question,
      options: q.options,
      correctAnswer: correctDisplayAns,
      studentAnswer: studentDisplayAns,
      isCorrect,
      topic
    });
  });

  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const topicPerformance = Object.entries(topicStats).map(([topicName, stats]) => ({
    topic: topicName,
    total: stats.total,
    correct: stats.correct,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }));

  const weakTopics = topicPerformance
    .filter((t) => t.percentage < WEAK_THRESHOLD)
    .map((t) => t.topic);

  const recommendedDifficulty = calculateRecommendedDifficulty(percentage);

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    score: percentage, // percentage score (0-100) or correctAnswers count
    rawScore: correctAnswers,
    percentage,
    topicPerformance,
    wrongAnswerDetails,
    weakTopics,
    recommendedDifficulty,
    questionsReview
  };
};

module.exports = {
  sanitizeQuizForStudent,
  calculateRecommendedDifficulty,
  scoreQuiz
};
