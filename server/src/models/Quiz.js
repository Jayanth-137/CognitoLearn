const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  question: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true-false'], default: 'mcq' },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' }
});

const quizSchema = new mongoose.Schema({
  // User context - makes quiz user-specific
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  topicId: { type: String, required: true }, // Matches topic.id in roadmap
  
  // Quiz metadata
  title: { type: String, required: true, trim: true },
  topic: { type: String, required: true }, // Topic title for display
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  passingScore: { type: Number, default: 70 },
  timeLimit: { type: Number, default: 10 },
  
  // Pool configuration
  questionsPerAttempt: { type: Number, default: 5 },
  
  // Question pool (full set, random subset served per attempt)
  questions: [questionSchema]
}, { timestamps: true });

// Compound index for efficient lookup
quizSchema.index({ userId: 1, roadmapId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('Quiz', quizSchema);
