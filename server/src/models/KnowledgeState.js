const mongoose = require('mongoose');

const knowledgeStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  topicId: { type: String, required: true },

  // BKT parameters (per-topic, allows future per-student tuning)
  params: {
    pL0: { type: Number, default: 0.15 },
    pT:  { type: Number, default: 0.10 },
    pG:  { type: Number, default: 0.20 },
    pS:  { type: Number, default: 0.10 }
  },

  // Current BKT state
  pL:                 { type: Number, default: 0.15 },
  mastered:           { type: Boolean, default: false },
  totalOpportunities: { type: Number, default: 0 },
  correctCount:       { type: Number, default: 0 },

  // Full answer history for replay/audit
  history: [{
    correct:    { type: Boolean, required: true },
    questionId: { type: String },
    sessionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'QuizSession' },
    timestamp:  { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// One KnowledgeState per user per topic per roadmap
knowledgeStateSchema.index({ userId: 1, roadmapId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('KnowledgeState', knowledgeStateSchema);
