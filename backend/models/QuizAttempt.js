const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    attemptNumber: { type: Number, required: true, default: 1 },
    answers: [{ type: mongoose.Schema.Types.Mixed }],
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    topicPerformance: [
      {
        topic: { type: String, required: true },
        total: { type: Number, required: true },
        correct: { type: Number, required: true },
        percentage: { type: Number, required: true }
      }
    ],
    wrongAnswerDetails: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        question: { type: String },
        selectedAnswer: { type: mongoose.Schema.Types.Mixed },
        correctAnswer: { type: mongoose.Schema.Types.Mixed },
        topic: { type: String }
      }
    ],
    weakTopics: [{ type: String }],
    recommendedDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    submissionKey: { type: String, sparse: true }
  },
  { timestamps: true }
);

quizAttemptSchema.index({ studentId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });
quizAttemptSchema.index({ submissionKey: 1 }, { unique: true, sparse: true });
quizAttemptSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
