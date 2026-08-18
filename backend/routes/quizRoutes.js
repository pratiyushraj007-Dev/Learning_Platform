const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createQuiz,
  getQuizById,
  getQuizzes,
  submitQuiz
} = require('../controllers/quizController');

const router = express.Router();

router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);

module.exports = router;
