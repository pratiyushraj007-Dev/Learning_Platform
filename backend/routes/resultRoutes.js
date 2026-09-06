const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMyResults, getResultById } = require('../controllers/quizResultController');

const router = express.Router();

router.get('/me', protect, authorize('student'), getMyResults);
router.get('/:attemptId', protect, getResultById);

module.exports = router;
