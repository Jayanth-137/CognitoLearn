const Activity = require('../models/Activity');
const QuizAttempt = require('../models/QuizAttempt');
const Roadmap = require('../models/Roadmap');

// Helper to calculate streaks
const calculateStreaks = (activities) => {
    if (!activities || activities.length === 0) {
        return { current: 0, longest: 0 };
    }

    const dates = activities.map(a => new Date(a.date).toDateString());
    const uniqueDates = [...new Set(dates)];
    const today = new Date().toDateString();
    
    // Current Streak
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check if today is present
    if (uniqueDates.includes(today)) {
        // Continue loop
    } else {
        // Start from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
        const dateStr = checkDate.toDateString();
        if (uniqueDates.includes(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    // Longest Streak
    let longestStreak = 0;
    if (uniqueDates.length > 0) {
        // Sort ascending
        const sortedDates = uniqueDates.map(d => new Date(d)).sort((a,b) => a - b);
        
        let tempStreak = 1;
        let maxSt = 1;
        
        for (let i = 1; i < sortedDates.length; i++) {
            const diffTime = Math.abs(sortedDates[i] - sortedDates[i - 1]);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            if (tempStreak > maxSt) maxSt = tempStreak;
        }
        longestStreak = maxSt;
    }
    
    return { current: currentStreak, longest: longestStreak };
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Calculate dynamic stats
    const quizzesCompleted = await QuizAttempt.countDocuments({ userId });
    const quizzesPassed = await QuizAttempt.countDocuments({ userId, passed: true });
    const roadmapsCreated = await Roadmap.countDocuments({ userId });
    const roadmapsCompleted = await Roadmap.countDocuments({ userId, progress: 100 });

    // Calculate streaks
    const activities = await Activity.find({ userId }).sort({ date: -1 }).select('date');
    const { current: currentStreak, longest: longestStreak } = calculateStreaks(activities);

    const recentActivities = await Activity.find({ userId }).sort({ date: -1 }).limit(10);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = await Activity.countDocuments({ userId, date: { $gte: weekAgo } });

    res.json({
      success: true,
      dashboard: {
        currentStreak,
        longestStreak,
        quizzesCompleted,
        quizzesPassed,
        roadmapsCreated,
        roadmapsCompleted,
        weeklyActivities,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard' });
  }
};

exports.getProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const quizzesCompleted = await QuizAttempt.countDocuments({ userId });
        const quizzesPassed = await QuizAttempt.countDocuments({ userId, passed: true });
        
        const activities = await Activity.find({ userId }).sort({ date: -1 }).select('date');
        const { current: currentStreak, longest: longestStreak } = calculateStreaks(activities);

        res.json({ 
            success: true, 
            progress: {
                quizzesCompleted,
                quizzesPassed,
                currentStreak,
                longestStreak
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get progress' });
    }
};

exports.logActivity = async (req, res) => {
  try {
    const { type, metadata } = req.body;
    
    const activity = await Activity.create({ 
        userId: req.user.userId, 
        type, 
        metadata 
    });

    res.status(201).json({ success: true, activity });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
};

exports.getStreaks = async (req, res) => {
    try {
         const userId = req.user.userId;
         const activities = await Activity.find({ userId }).sort({ date: -1 }).select('date');
         const { current, longest } = calculateStreaks(activities);
         
         const lastActivity = activities.length > 0 ? activities[0].date : null;

         res.json({
             success: true,
             streaks: { current, longest, lastActivity }
         });
    } catch (error) {
        console.error('Get streaks error:', error);
         res.status(500).json({ error: 'Failed to get streaks' });
    }
};
