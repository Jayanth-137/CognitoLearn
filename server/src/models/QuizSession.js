const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  topicId: { type: String, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },

  status: {
    type: String,
    enum: ['active', 'completed_mastered', 'completed_not_mastered', 'abandoned'],
    default: 'active'
  },

  // Ordered list of question IDs to serve (shuffled from pool)
  questionQueue: [{ type: String }],

  // Index of the next question to serve (0-based)
  currentIndex: { type: Number, default: 0 },

  // Answers given so far
  answers: [{
    questionId:     { type: String, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect:      { type: Boolean, required: true },
    pL_after:       { type: Number, required: true },
    answeredAt:     { type: Date, default: Date.now }
  }],

  // BKT state at session start (carried over from KnowledgeState)
  pL_start: { type: Number, default: 0.15 },

  // Final state (set on completion)
  pL_final:       { type: Number },
  mastered:       { type: Boolean, default: false },
  totalQuestions:  { type: Number },
  correctAnswers: { type: Number },
  score:          { type: Number },

  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

// Fast lookup for active sessions per user/topic
quizSessionSchema.index({ userId: 1, roadmapId: 1, topicId: 1, status: 1 });

module.exports = mongoose.model('QuizSession', quizSessionSchema);
