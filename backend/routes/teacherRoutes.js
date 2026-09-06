const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getPerformance, getStudentDetailForTeacher } = require('../controllers/teacherController');

const router = express.Router();

router.get('/performance', protect, authorize('teacher', 'admin'), getPerformance);
router.get('/students/:studentId', protect, authorize('teacher', 'admin'), getStudentDetailForTeacher);

module.exports = router;
