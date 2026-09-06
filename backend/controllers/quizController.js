const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { sanitizeQuizForStudent, scoreQuiz } = require('../services/quiz.service');

// Create a quiz (teacher/admin only)
const createQuiz = async (req, res) => {
  try {
    const { title, courseId, chapterId, topic, difficulty, questions, isPublished } = req.body;

    if (!title || !courseId || !topic) {
      return res.status(400).json({ success: false, message: 'Title, courseId, and topic are required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz must contain at least one question' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have question text and at least 2 options`
        });
      }
      if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer === '') {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must specify a correct answer`
        });
      }
    }

    const quiz = await Quiz.create({
      title,
      courseId,
      chapterId: chapterId || undefined,
      topic,
      difficulty: difficulty || 'medium',
      questions,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz by ID — strip correctAnswer for students
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if published for student view
    if (req.user.role === 'student' && quiz.isPublished === false) {
      return res.status(403).json({ success: false, message: 'Quiz is not available' });
    }

    // If student, strip correct answers securely
    if (req.user.role === 'student') {
      const sanitized = sanitizeQuizForStudent(quiz);
      return res.json({ success: true, data: sanitized });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all quizzes (optional courseId, chapterId, topic filters)
const getQuizzes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.chapterId) filter.chapterId = req.query.chapterId;
    if (req.query.topic) filter.topic = req.query.topic;

    // Students only see published quizzes
    if (req.user.role === 'student') {
      filter.isPublished = true;
    }

    const quizzes = await Quiz.find(filter)
      .populate('courseId', 'title')
      .populate('chapterId', 'title')
      .sort('-createdAt');

    // If student, sanitize all returned quizzes
    if (req.user.role === 'student') {
      const sanitizedQuizzes = quizzes.map((q) => sanitizeQuizForStudent(q));
      return res.json({ success: true, data: sanitizedQuizzes });
    }

    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quiz (teacher/admin only)
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Authorization check: creator or admin
    if (req.user.role !== 'admin' && String(quiz.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this quiz' });
    }

    const { title, courseId, chapterId, topic, difficulty, questions, isPublished } = req.body;

    if (title) quiz.title = title;
    if (courseId) quiz.courseId = courseId;
    if (chapterId !== undefined) quiz.chapterId = chapterId;
    if (topic) quiz.topic = topic;
    if (difficulty) quiz.difficulty = difficulty;
    if (questions) quiz.questions = questions;
    if (isPublished !== undefined) quiz.isPublished = isPublished;

    await quiz.save();

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete quiz (teacher/admin only)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Authorization check: creator or admin
    if (req.user.role !== 'admin' && String(quiz.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    }

    await quiz.deleteOne();

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz answers — calculate score on backend & protect against duplicates
const submitQuiz = async (req, res) => {
  try {
    const { answers, submissionKey } = req.body;
    const quizId = req.params.id;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.isPublished && req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Quiz is not active' });
    }

    // Idempotency check: if submissionKey provided and already submitted, return existing attempt
    if (submissionKey) {
      const existingAttempt = await QuizAttempt.findOne({ submissionKey, studentId });
      if (existingAttempt) {
        return res.json({
          success: true,
          message: 'Duplicate submission detected. Returning previous result.',
          data: {
            attemptId: existingAttempt._id,
            attemptNumber: existingAttempt.attemptNumber,
            score: existingAttempt.percentage,
            totalQuestions: existingAttempt.totalQuestions,
            correctAnswers: existingAttempt.correctAnswers,
            wrongAnswers: existingAttempt.wrongAnswers,
            weakTopics: existingAttempt.weakTopics,
            recommendedDifficulty: existingAttempt.recommendedDifficulty,
            topicPerformance: existingAttempt.topicPerformance
          }
        });
      }
    }

    // Score quiz using quiz.service
    const scoringResult = scoreQuiz(quiz, answers);

    // Calculate attempt number safely for student & quiz
    const previousAttemptsCount = await QuizAttempt.countDocuments({ studentId, quizId });
    const attemptNumber = previousAttemptsCount + 1;

    let attempt;
    try {
      attempt = await QuizAttempt.create({
        studentId,
        quizId: quiz._id,
        courseId: quiz.courseId,
        chapterId: quiz.chapterId,
        attemptNumber,
        answers,
        score: scoringResult.percentage,
        percentage: scoringResult.percentage,
        totalQuestions: scoringResult.totalQuestions,
        correctAnswers: scoringResult.correctAnswers,
        wrongAnswers: scoringResult.wrongAnswers,
        topicPerformance: scoringResult.topicPerformance,
        wrongAnswerDetails: scoringResult.wrongAnswerDetails,
        weakTopics: scoringResult.weakTopics,
        recommendedDifficulty: scoringResult.recommendedDifficulty,
        submissionKey: submissionKey || undefined
      });
    } catch (err) {
      // Handle duplicate attemptNumber race condition
      if (err.code === 11000) {
        const latestAttempt = await QuizAttempt.findOne({ studentId, quizId }).sort('-attemptNumber');
        return res.status(409).json({
          success: false,
          message: 'Concurrent submission detected',
          data: latestAttempt
        });
      }
      throw err;
    }

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        attemptNumber: attempt.attemptNumber,
        score: scoringResult.percentage,
        percentage: scoringResult.percentage,
        totalQuestions: scoringResult.totalQuestions,
        correctAnswers: scoringResult.correctAnswers,
        wrongAnswers: scoringResult.wrongAnswers,
        weakTopics: scoringResult.weakTopics,
        recommendedDifficulty: scoringResult.recommendedDifficulty,
        topic: quiz.topic,
        topicPerformance: scoringResult.topicPerformance,
        questions: scoringResult.questionsReview
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizById,
  getQuizzes,
  updateQuiz,
  deleteQuiz,
  submitQuiz
};
