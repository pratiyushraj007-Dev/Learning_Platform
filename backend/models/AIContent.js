const mongoose = require('mongoose');

const aiContentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['example', 'summary', 'practice'], required: true },
    topic: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIContent', aiContentSchema);
