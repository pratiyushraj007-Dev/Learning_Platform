const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
