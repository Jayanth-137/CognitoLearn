const ChatMessage = require('../models/ChatMessage');
const Roadmap = require('../models/Roadmap');
const axios = require('axios');
const config = require('../config');

const MAX_MESSAGES_PER_ROADMAP = 200;
const CONTEXT_WINDOW_SIZE = 20;

// Build roadmap context object for the AI
const buildRoadmapContext = (roadmap) => {
  const totalSubtopics = roadmap.topics?.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0) || 0;
  const completedSubtopics = roadmap.topics?.reduce((acc, t) =>
    acc + (t.subtopics?.filter(s => s.completed).length || 0), 0) || 0;
  const progress = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

  return {
    title: roadmap.title,
    description: roadmap.description,
    difficulty: roadmap.difficulty,
    progress,
    topics: roadmap.topics.map(t => ({
      title: t.title,
      description: t.description,
      status: t.status,
      subtopics: t.subtopics?.map(s => s.title) || [],
      completedSubtopics: t.subtopics?.filter(s => s.completed).map(s => s.title) || []
    }))
  };
};

// GET /api/chat/:roadmapId — Fetch chat history
exports.getMessages = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.userId;

    // Verify the roadmap belongs to the user
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    const messages = await ChatMessage.find({ userId, roadmapId })
      .sort({ createdAt: 1 })
      .limit(MAX_MESSAGES_PER_ROADMAP)
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// POST /api/chat/:roadmapId — Send message and get AI response
exports.sendMessage = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify the roadmap belongs to the user
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    // 1. Save user message
    const userMsg = await ChatMessage.create({
      userId,
      roadmapId,
      role: 'user',
      text: message.trim()
    });

    // 2. Build roadmap context
    const roadmapContext = buildRoadmapContext(roadmap);

    // 3. Load recent chat history for context
    const recentMessages = await ChatMessage.find({ userId, roadmapId })
      .sort({ createdAt: -1 })
      .limit(CONTEXT_WINDOW_SIZE)
      .lean();

    // Reverse to chronological order (oldest first), exclude the message we just saved
    const history = recentMessages
      .reverse()
      .slice(0, -1) // exclude the user message we just saved (it's sent separately)
      .map(m => ({ role: m.role, text: m.text }));

    // 4. Call Python Gemini service
    const aiResponse = await axios.post(`${config.aiServiceUrl}/chat`, {
      message: message.trim(),
      history,
      roadmapContext
    }, { timeout: 30000 });

    if (!aiResponse.data.success || !aiResponse.data.reply) {
      throw new Error('Invalid AI response');
    }

    // 5. Save AI response
    const aiMsg = await ChatMessage.create({
      userId,
      roadmapId,
      role: 'ai',
      text: aiResponse.data.reply
    });

    // 6. Enforce message cap — delete oldest messages if over limit
    const totalCount = await ChatMessage.countDocuments({ userId, roadmapId });
    if (totalCount > MAX_MESSAGES_PER_ROADMAP) {
      const excess = totalCount - MAX_MESSAGES_PER_ROADMAP;
      const oldest = await ChatMessage.find({ userId, roadmapId })
        .sort({ createdAt: 1 })
        .limit(excess)
        .select('_id');
      await ChatMessage.deleteMany({ _id: { $in: oldest.map(m => m._id) } });
    }

    res.json({
      success: true,
      userMessage: userMsg,
      aiMessage: aiMsg
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
};

// DELETE /api/chat/:roadmapId — Clear chat history
exports.clearChat = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.userId;

    const result = await ChatMessage.deleteMany({ userId, roadmapId });

    res.json({
      success: true,
      message: 'Chat history cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
