const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createLesson, getLessonById } = require('../controllers/lessonController');

const router = express.Router();

router.post('/', protect, authorize('teacher', 'admin'), createLesson);
router.get('/:id', protect, getLessonById);

module.exports = router;
