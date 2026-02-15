import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import RoadmapContainer from '../components/roadmap/RoadmapContainer';
import CelebrationModal from '../components/ui/CelebrationModal';
import api from '../api/client';
import { useRoadmaps } from '../context/RoadmapContext';
import { useToast } from '../context/ToastContext';

const Roadmap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateRoadmap: updateRoadmapInContext } = useRoadmaps();
    const { toast } = useToast();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const prevProgressRef = useRef(null);

    // Fetch roadmap on mount or when ID changes
    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');
                const response = await api.get(`/roadmaps/${id}`);
                if (response.data.success) {
                    setRoadmap(response.data.roadmap);
                } else {
                    const msg = 'Failed to load roadmap';
                    setError(msg);
                    toast.error(msg, { title: 'Load Error' });
                }
            } catch (err) {
                console.error('Fetch roadmap error:', err);
                const msg = err.response?.data?.error || 'Failed to load roadmap';
                setError(msg);
                toast.error(msg, { title: 'Fetch Error' });
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [id]);

    const handleBack = () => {
        navigate('/analytics');
    };

    const handleSubtopicToggle = useCallback(async (topicId, subtopicId) => {
        if (!roadmap || saving) return;

        // Find the current topic and check if it was already completed before this toggle
        const currentTopic = roadmap.topics.find(t => t.id === topicId);
        const wasTopicCompleted = currentTopic?.subtopics?.every(s => s.completed) || false;

        // Optimistic update
        const updatedTopics = roadmap.topics.map(topic => {
            if (topic.id !== topicId) return topic;
            return {
                ...topic,
                subtopics: topic.subtopics.map(sub => {
                    if (sub.id !== subtopicId) return sub;
                    return { ...sub, completed: !sub.completed };
                })
            };
        });

        // Check if this toggle completed the topic
        const updatedTopic = updatedTopics.find(t => t.id === topicId);
        const isNowCompleted = updatedTopic?.subtopics?.every(s => s.completed) || false;

        setRoadmap(prev => ({ ...prev, topics: updatedTopics }));

        // Show toast if topic just became completed
        if (isNowCompleted && !wasTopicCompleted) {
            const hasQuiz = updatedTopic.quizRecommended !== false;
            if (hasQuiz) {
                toast.info(`🎉 "${updatedTopic.title}" completed! Take the quiz to test your knowledge.`, {
                    title: 'Topic Completed!'
                });
            } else {
                toast.success(`🎉 "${updatedTopic.title}" completed! Next topic is now unlocked.`, {
                    title: 'Great Progress!'
                });
            }
        }

        // Save to backend
        try {
            setSaving(true);
            const response = await api.put(`/roadmaps/${id}`, { topics: updatedTopics });
            // Update local state with server response to sync progress and completion status
            if (response.data.success && response.data.roadmap) {
                setRoadmap(response.data.roadmap);
                // Also update the shared context so sidebar/analytics stay in sync
                updateRoadmapInContext(response.data.roadmap);
            }
        } catch (err) {
            console.error('Save roadmap error:', err);
            toast.error('Failed to save progress', { title: 'Update Failed' });
            // Revert on error (optional: could show a toast)
        } finally {
            setSaving(false);
        }
    }, [roadmap, id, saving, updateRoadmapInContext, toast]);

    // Calculate progress from topics (before any early returns!)
    const totalSubtopics = roadmap?.topics?.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0) || 0;
    const completedSubtopics = roadmap?.topics?.reduce((acc, t) =>
        acc + (t.subtopics?.filter(s => s.completed).length || 0), 0) || 0;
    const progress = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
    const completedTopics = roadmap?.topics?.filter(t =>
        t.subtopics?.every(s => s.completed)).length || 0;

    // Trigger celebration when progress hits 100%
    useEffect(() => {
        if (loading) {
            prevProgressRef.current = null;
            return;
        }
        if (prevProgressRef.current !== null && prevProgressRef.current < 100 && progress === 100) {
            setShowCelebration(true);
        }
        prevProgressRef.current = progress;
    // }, [progress, loading]);
    }, [progress]);

    // Loading state
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Loading roadmap...</p>
                </div>
            </motion.div>
        );
    }

    // No roadmap ID or not found
    if (!id || error || !roadmap) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {error || 'No roadmap selected'}
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go to Analytics
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen"
        >
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="text-sm text-slate-500 hover:text-indigo-500 transition-colors flex items-center gap-1.5 mb-4"
            >
                <ArrowLeft size={20} />
                Back to Analytics
            </button>

            {/* Compact Header Bar - Responsive */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-slate-200/50 dark:border-slate-700/50">
                    {/* Description - Left */}
                    <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-5">
                        {roadmap.description}
                    </p>

                    {/* Progress + Stats */}
                    <div className="flex items-center gap-3 sm:flex-1 sm:justify-end">
                        {/* Progress Bar */}
                        <div className="flex-1 sm:flex-initial flex items-center gap-2 sm:w-40 md:w-48 lg:w-56">
                            <div className="flex-1 h-2.5 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {progress}%
                            </span>
                        </div>

                        {/* Divider - hidden on mobile */}
                        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

                        {/* Stats */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm flex-shrink-0">
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {completedTopics}<span className="hidden sm:inline"> Done</span>
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="font-semibold text-red-500 dark:text-red-400">
                                {roadmap.topics.length - completedTopics}<span className="hidden sm:inline"> Left</span>
                            </span>
                            <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
                            <span className="hidden md:inline font-semibold text-slate-500 dark:text-slate-400">
                                {roadmap.topics.length} Total
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Learning Path Roadmap */}
            <h2 className="text-lg md:text-xl font-bold mb-4 text-slate-800 dark:text-white">
                Learning Path
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <RoadmapContainer
                    data={roadmap.topics}
                    roadmapId={roadmap._id}
                    onSubtopicToggle={handleSubtopicToggle}
                />
            </div>

            {/* Celebration Modal */}
            <CelebrationModal
                isOpen={showCelebration}
                onClose={() => setShowCelebration(false)}
                title="Congratulations!"
                message={`You've completed <span class="font-bold text-indigo-600 dark:text-indigo-400">${roadmap.title}</span>!`}
                stats={[
                    { label: 'Topics', value: roadmap.topics.length, color: 'text-green-500' },
                    { label: 'Subtopics', value: totalSubtopics, color: 'text-purple-500' },
                    { label: 'Complete', value: '100%', color: 'text-yellow-500' }
                ]}
                buttonText="Keep Learning!"
            />
        </motion.div>
    );
};

export default Roadmap;
