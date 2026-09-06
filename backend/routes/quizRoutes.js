const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createQuiz,
  getQuizById,
  getQuizzes,
  updateQuiz,
  deleteQuiz,
  submitQuiz
} = require('../controllers/quizController');

const router = express.Router();

router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuizById);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);

module.exports = router;
