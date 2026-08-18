const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  handleDoubt,
  handleRuralExample,
  handleMistake,
  generateQuiz,
  generateContent
} = require('../controllers/aiController');

const router = express.Router();

router.post('/doubt', protect, handleDoubt);
router.post('/rural-example', protect, handleRuralExample);
router.post('/mistake', protect, handleMistake);
router.post('/generate-quiz', protect, authorize('teacher', 'admin'), generateQuiz);
router.post('/generate-content', protect, authorize('teacher', 'admin'), generateContent);

module.exports = router;
