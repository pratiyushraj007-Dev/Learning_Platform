const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAIContent,
  approveContent,
  rejectContent
} = require('../controllers/aiContentController');

const router = express.Router();

router.get('/', protect, authorize('teacher', 'admin'), getAIContent);
router.post('/:id/approve', protect, authorize('teacher', 'admin'), approveContent);
router.post('/:id/reject', protect, authorize('teacher', 'admin'), rejectContent);

module.exports = router;
