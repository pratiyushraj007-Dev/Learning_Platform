const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    videoProgress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

progressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
