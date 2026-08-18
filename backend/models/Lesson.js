const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    topic: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: '' },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
