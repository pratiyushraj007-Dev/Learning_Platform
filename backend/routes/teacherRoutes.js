const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getPerformance } = require('../controllers/teacherController');

const router = express.Router();

router.get('/performance', protect, authorize('teacher', 'admin'), getPerformance);

module.exports = router;
