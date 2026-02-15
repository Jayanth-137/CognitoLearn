import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Trophy, Target, Calendar, Clock, ChevronRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api/client';
import CircularProgress from '../components/ui/CircularProgress';

const Quizzes = () => {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'passed', 'failed'

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const response = await api.get('/quizzes/attempts');
                if (response.data.success) {
                    setAttempts(response.data.attempts);
                }
            } catch (error) {
                console.error('Failed to fetch quiz attempts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    const filteredAttempts = attempts.filter(attempt => {
        if (filter === 'passed') return attempt.passed;
        if (filter === 'failed') return !attempt.passed;
        return true;
    });

    const stats = {
        total: attempts.length,
        passed: attempts.filter(a => a.passed).length,
        failed: attempts.filter(a => !a.passed).length,
        avgScore: attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : 0
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">Loading quiz history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-4 md:p-6 lg:p-8">
            {/* Ambient Background Blobs for Glassmorphism */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Header with Stats Card */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-2">
                            Quiz History
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Your learning milestones and achievements
                        </p>
                    </div>

                    {/* Glass Stats Card */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 sm:gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-3 rounded-2xl border border-white/50 dark:border-white/10 shadow-lg ring-1 ring-black/5"
                    >
                        <div className="text-center px-2">
                            <div className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200/50 dark:bg-slate-700/50" />
                        <div className="text-center px-2">
                            <div className="text-xl font-bold text-emerald-500">{stats.passed}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passed</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200/50 dark:bg-slate-700/50" />
                        <div className="text-center px-2">
                            <div className="text-xl font-bold text-rose-500">{stats.failed}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failed</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200/50 dark:bg-slate-700/50" />
                        <div className="text-center px-2">
                            <div className="text-xl font-bold text-amber-500">{stats.avgScore}%</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg</div>
                        </div>
                    </motion.div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8">
                    {[
                        { id: 'all', label: 'All Attempts' },
                        { id: 'passed', label: 'Passed' },
                        { id: 'failed', label: 'Needs Practice' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${filter === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800 backdrop-blur-sm border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/30'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Glassmorphic List */}
                <AnimatePresence mode="popLayout">
                    {filteredAttempts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-24 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/50 dark:border-white/5 shadow-xl"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                {filter === 'all'
                                    ? <ClipboardList className="w-10 h-10 text-slate-400" />
                                    : <AlertCircle className="w-10 h-10 text-slate-400" />
                                }
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                {filter === 'all' ? 'No quizzes taken yet' : `No ${filter} attempts found`}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                {filter === 'all'
                                    ? 'Start a topic in your roadmap to take your first quiz!'
                                    : 'Adjust the filter to see more results'}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAttempts.map((attempt, index) => (
                                <motion.div
                                    key={attempt._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-3 md:p-4 border border-white/60 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                    onClick={() => navigate(`/quiz-review/${attempt._id}`)}
                                >
                                    {/* Left Border Status Indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${attempt.passed
                                            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600'
                                            : 'bg-gradient-to-b from-rose-400 to-rose-600'
                                        }`} />

                                    {/* Content Wrapper */}
                                    <div className="flex items-center gap-4 pl-3">

                                        {/* Date Box */}
                                        <div className="hidden md:flex flex-col items-center justify-center w-12 h-12 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/50 dark:border-white/5 shadow-sm">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">{new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-lg font-black text-slate-700 dark:text-slate-200 leading-none">{new Date(attempt.completedAt).getDate()}</span>
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {attempt.quizId?.topic || attempt.quizId?.title || 'General Knowledge Quiz'}
                                                </h3>
                                                {attempt.passed && (
                                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                                                        PASSED
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-md">
                                                    <ClipboardList size={12} className="text-indigo-500" />
                                                    {attempt.correctAnswers}/{attempt.totalQuestions} Questions
                                                </span>
                                                <span className="hidden sm:flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatTime(attempt.completedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side: Circular Progress */}
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="text-right hidden sm:block">
                                                <div className={`text-sm font-bold ${attempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {attempt.passed ? 'Excellent' : 'Failed'}
                                                </div>
                                                <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-end gap-1 group-hover:text-indigo-500 transition-colors">
                                                    Review <ChevronRight size={10} />
                                                </div>
                                            </div>

                                            <div className="relative group-hover:scale-110 transition-transform duration-300">
                                                <CircularProgress
                                                    progress={attempt.score}
                                                    size={48}
                                                    strokeWidth={4}
                                                    variant={attempt.passed ? 'success' : 'danger'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Quizzes;
