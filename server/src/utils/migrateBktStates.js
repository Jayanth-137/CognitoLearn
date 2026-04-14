/**
 * Migration Script: Initialize BKT KnowledgeState for existing users
 * 
 * Run this once after deploying the BKT system to backfill KnowledgeState
 * documents from existing QuizAttempt records.
 * 
 * Usage: node server/src/utils/migrateBktStates.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load config
const config = require(path.join(__dirname, '..', 'config'));

// Models
const QuizAttempt = require(path.join(__dirname, '..', 'models', 'QuizAttempt'));
const Quiz = require(path.join(__dirname, '..', 'models', 'Quiz'));
const Roadmap = require(path.join(__dirname, '..', 'models', 'Roadmap'));
const KnowledgeState = require(path.join(__dirname, '..', 'models', 'KnowledgeState'));
const bkt = require(path.join(__dirname, 'bktEngine'));

async function migrate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected\n');

    // 1. Find all quizzes
    const quizzes = await Quiz.find({}).lean();
    console.log(`📋 Found ${quizzes.length} quizzes\n`);

    let created = 0;
    let skipped = 0;
    let backfilled = 0;

    for (const quiz of quizzes) {
      const { userId, roadmapId, topicId } = quiz;

      if (!userId || !roadmapId || !topicId) {
        skipped++;
        continue;
      }

      // Check if KnowledgeState already exists
      const existing = await KnowledgeState.findOne({ userId, roadmapId, topicId });
      if (existing) {
        skipped++;
        continue;
      }

      // Get all attempts for this quiz, sorted chronologically
      const attempts = await QuizAttempt.find({ userId, quizId: quiz._id })
        .sort({ completedAt: 1 })
        .lean();

      if (attempts.length === 0) {
        skipped++;
        continue;
      }

      // Build history from attempts
      const history = [];
      for (const attempt of attempts) {
        if (attempt.answers && Array.isArray(attempt.answers)) {
          for (const answer of attempt.answers) {
            history.push({
              correct: answer.isCorrect === true,
              questionId: answer.questionId || `legacy-${history.length}`,
              timestamp: attempt.completedAt || attempt.createdAt || new Date()
            });
          }
        }
      }

      // Compute mastery from history
      const defaults = bkt.getDefaultParams();
      const result = bkt.computeMasteryFromHistory(history, defaults);
      const mastered = bkt.isMastered(result.pL);

      // Check if topic was already passed in roadmap
      const roadmap = await Roadmap.findById(roadmapId).lean();
      const topic = roadmap?.topics?.find(t => t.id === topicId);
      const wasPassed = topic?.quizPassed === true;

      // If quiz was passed, set mastery to 1.0
      const finalPL = wasPassed ? 1.0 : result.pL;
      const finalMastered = wasPassed || mastered;

      // Create KnowledgeState
      await KnowledgeState.create({
        userId,
        roadmapId,
        topicId,
        params: { pL0: defaults.pL0, pT: defaults.pT, pG: defaults.pG, pS: defaults.pS },
        pL: finalPL,
        mastered: finalMastered,
        totalOpportunities: result.totalOpportunities,
        correctCount: result.correctCount,
        history
      });

      // Backfill masteryLevel on Roadmap topic
      if (roadmap && topic) {
        await Roadmap.updateOne(
          { _id: roadmapId, 'topics.id': topicId },
          { $set: { 'topics.$.masteryLevel': finalPL } }
        );
        backfilled++;
      }

      created++;
      console.log(`  ✅ ${quiz.topic || topicId}: P(L)=${finalPL.toFixed(3)} mastered=${finalMastered} (${history.length} answers)`);
    }

    console.log(`\n📊 Migration Complete:`);
    console.log(`   Created:    ${created} KnowledgeState documents`);
    console.log(`   Backfilled: ${backfilled} roadmap topics with masteryLevel`);
    console.log(`   Skipped:    ${skipped} (already existed or no data)`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrate();
