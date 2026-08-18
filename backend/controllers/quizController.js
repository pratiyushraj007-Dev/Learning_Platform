const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Create a quiz (teacher only)
const createQuiz = async (req, res) => {
  try {
    const { title, courseId, topic, difficulty, questions } = req.body;
    const quiz = await Quiz.create({ title, courseId, topic, difficulty, questions });
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

    // If the user is a student, hide correct answers
    if (req.user.role === 'student') {
      const sanitized = quiz.toObject();
      sanitized.questions = sanitized.questions.map(q => ({
        question: q.question,
        options: q.options
        // correctAnswer is NOT included
      }));
      return res.json({ success: true, data: sanitized });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all quizzes (optionally by courseId query param)
const getQuizzes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;
    const quizzes = await Quiz.find(filter).populate('courseId', 'title').sort('-createdAt');
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz answers — calculate score on the backend
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of student answers in order
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;

    // Compare each answer with the correct answer
    quiz.questions.forEach((q, index) => {
      if (answers[index] != null && String(answers[index]) === String(q.correctAnswer)) {
        correctAnswers++;
      }
    });

    const wrongAnswers = totalQuestions - correctAnswers;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const attempt = await QuizAttempt.create({
      studentId: req.user._id,
      quizId: quiz._id,
      answers,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers
    });

    // Return results with correct answers for review
    const questionsWithAnswers = quiz.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      studentAnswer: answers[index] != null ? answers[index] : null,
      isCorrect: answers[index] != null && String(answers[index]) === String(q.correctAnswer)
    }));

    // Determine weak topic
    const weakTopic = score < 50 ? quiz.topic : null;

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        weakTopic,
        topic: quiz.topic,
        questions: questionsWithAnswers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createQuiz, getQuizById, getQuizzes, submitQuiz };
