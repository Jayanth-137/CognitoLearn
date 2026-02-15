import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, BookOpen, Flame, BarChart3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoadmapCard from '../components/roadmap/RoadmapCard';
import { useRoadmaps } from '../context/RoadmapContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

// Circular Progress Component
const CircularProgress = ({ progress, size = 120, strokeWidth = 10, color = 'indigo' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-slate-100 dark:text-slate-700"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`text-${color}-500 transition-all duration-700 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ stroke: color === 'indigo' ? '#6366f1' : color === 'green' ? '#22c55e' : '#f59e0b' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{progress}%</span>
                <span className="text-xs text-slate-500">Overall</span>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subtext, color = 'indigo', trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow`}
    >
        <div className="flex items-start justify-between">
            <div className={`p-2 sm:p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
                <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} style={{ color: color === 'indigo' ? '#6366f1' : color === 'green' ? '#22c55e' : color === 'orange' ? '#f97316' : '#8b5cf6' }} />
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
    </motion.div>
);

const Analytics = () => {
    const navigate = useNavigate();
    const { roadmaps, loading: roadmapsLoading, deleteRoadmap } = useRoadmaps();
    const toast = useToast();
    const [streakData, setStreakData] = useState({ current: 0 });
    const [streakLoading, setStreakLoading] = useState(true);

    // Fetch streak data (separate from roadmaps)
    useEffect(() => {
        const fetchStreakData = async () => {
            try {
                setStreakLoading(true);
                const streakResponse = await api.get('/analytics/streaks');
                if (streakResponse.data.success) {
                    setStreakData(streakResponse.data.streaks);
                }
            } catch (err) {
                console.log('Streaks endpoint not available, using default');
            } finally {
                setStreakLoading(false);
            }
        };

        fetchStreakData();
    }, []);

    const loading = roadmapsLoading || streakLoading;

    // Calculate analytics
    const analytics = useMemo(() => {
        const totalRoadmaps = roadmaps.length;
        const completedRoadmaps = roadmaps.filter(r => r.progress === 100).length;
        const inProgress = roadmaps.filter(r => r.progress > 0 && r.progress < 100).length;
        const totalTopics = roadmaps.reduce((sum, r) => sum + (r.totalTopics || r.topics?.length || 0), 0);
        const completedTopics = roadmaps.reduce((sum, r) => sum + (r.completedTopics || 0), 0);
        const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
            totalRoadmaps,
            completedRoadmaps,
            inProgress,
            totalTopics,
            completedTopics,
            overallProgress,
            activeStreak: streakData.current || 0,
        };
    }, [roadmaps, streakData]);

    const handleRoadmapSelect = (id) => {
        navigate(`/roadmap/${id}`);
    };

    const handleRoadmapDelete = async (id) => {
        const result = await deleteRoadmap(id);
        if (!result.success) {
            toast.error(result.error || 'Failed to delete roadmap. Please try again.');
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen"
        >
            {/* ANALYTICS DASHBOARD VIEW */}
            <div className="space-y-6 sm:space-y-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                            My Learning Journey
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Track your progress across all roadmaps
                        </p>
                    </div>
                    {analytics.activeStreak > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25">
                            <Flame size={20} className="animate-pulse" />
                            <span className="font-bold">{analytics.activeStreak} Day Streak!</span>
                        </div>
                    )}
                </motion.div>

                {/* Stats Overview with Circular Progress */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Circular Progress */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center col-span-1"
                    >
                        <CircularProgress progress={analytics.overallProgress} size={140} strokeWidth={12} />
                    </motion.div>

                    <StatCard
                        icon={Target}
                        label="Total Roadmaps"
                        value={analytics.totalRoadmaps}
                        subtext={`${analytics.completedRoadmaps} completed`}
                        color="indigo"
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Topics Completed"
                        value={analytics.completedTopics}
                        subtext={`of ${analytics.totalTopics} total`}
                        color="green"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="In Progress"
                        value={analytics.inProgress}
                        subtext="Active roadmaps"
                        color="orange"
                    />
                </div>

                {/* Roadmaps Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BarChart3 size={20} className="text-indigo-500" />
                            Your Roadmaps
                        </h2>
                        <span className="text-sm text-slate-500">{roadmaps.length} roadmaps</span>
                    </div>
                    {roadmaps.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400 mb-4">No roadmaps yet</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Create your first roadmap
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                        >
                            {roadmaps.map((roadmap, index) => (
                                <motion.div
                                    key={roadmap._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                >
                                    <RoadmapCard
                                        id={roadmap._id}
                                        title={roadmap.title}
                                        description={roadmap.description}
                                        progress={roadmap.progress}
                                        totalTopics={roadmap.totalTopics || roadmap.topics?.length || 0}
                                        completedTopics={roadmap.completedTopics || 0}
                                        difficulty={roadmap.difficulty}
                                        onClick={handleRoadmapSelect}
                                        onDelete={handleRoadmapDelete}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
