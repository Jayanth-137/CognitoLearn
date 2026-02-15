const mongoose = require('mongoose');

const subtopicSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const topicSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['completed', 'in-progress', 'locked'], default: 'locked' },
  type: { type: String, default: 'milestone' },
  quizRecommended: { type: Boolean, default: true },
  quizPassed: { type: Boolean, default: false },
  subtopics: [subtopicSchema]
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true, trim: true },
  prompt: { type: String, required: true },
  description: { type: String, default: '' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  totalTopics: { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  topics: [topicSchema]
}, { timestamps: true });

// Calculate progress before saving
roadmapSchema.pre('save', function(next) {
  if (this.topics && this.topics.length > 0) {
    let totalSubtopics = 0;
    let completedSubtopics = 0;
    let completedTopicsCount = 0;

    this.topics.forEach(topic => {
      if (topic.subtopics && topic.subtopics.length > 0) {
        totalSubtopics += topic.subtopics.length;
        const completed = topic.subtopics.filter(st => st.completed).length;
        completedSubtopics += completed;
        if (completed === topic.subtopics.length) completedTopicsCount++;
      }
    });

    this.totalTopics = this.topics.length;
    this.completedTopics = completedTopicsCount;
    this.progress = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
  }
  next();
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
