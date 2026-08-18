const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getCourses,
  getCourseById,
  createCourse,
  getChaptersByCourse
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', protect, getCourses);
router.get('/:courseId/chapters', protect, getChaptersByCourse);
router.get('/:id', protect, getCourseById);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);

module.exports = router;
