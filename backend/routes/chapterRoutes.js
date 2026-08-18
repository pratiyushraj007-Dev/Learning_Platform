const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createChapter, getLessonsByChapter } = require('../controllers/chapterController');

const router = express.Router();

router.post('/', protect, authorize('teacher', 'admin'), createChapter);
router.get('/:chapterId/lessons', protect, getLessonsByChapter);

module.exports = router;
