const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for fast retrieval of chat history per user+roadmap
chatMessageSchema.index({ userId: 1, roadmapId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
