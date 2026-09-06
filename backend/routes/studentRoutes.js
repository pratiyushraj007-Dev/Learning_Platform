const express = require('express');
const { protect } = require('../middleware/auth');
const { getStudentProgress, getStudentRecommendations } = require('../controllers/quizResultController');

const router = express.Router();

router.get('/:studentId/progress', protect, getStudentProgress);
router.get('/:studentId/recommendations', protect, getStudentRecommendations);

module.exports = router;
