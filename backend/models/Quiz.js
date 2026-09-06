const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // numeric index or text matching option index
    topic: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questions: [questionSchema],
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

quizSchema.index({ courseId: 1, topic: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
