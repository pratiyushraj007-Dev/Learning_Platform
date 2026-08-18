const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getProgress,
  getLessonProgress,
  saveProgress,
  getDashboard
} = require('../controllers/progressController');

const router = express.Router();

router.get('/dashboard', protect, authorize('student'), getDashboard);
router.get('/lesson/:lessonId', protect, authorize('student'), getLessonProgress);
router.get('/', protect, authorize('student'), getProgress);
router.post('/', protect, authorize('student'), saveProgress);

module.exports = router;
