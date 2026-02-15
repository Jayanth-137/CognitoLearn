import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Zap, Layout, ArrowRight, Loader2, ChevronDown, Search } from 'lucide-react';
import api from '../api/client';
import { useRoadmaps } from '../context/RoadmapContext';
import { useToast } from '../context/ToastContext';

const LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
];

const Dashboard = () => {
    const [skill, setSkill] = useState('');
    const [level, setLevel] = useState('beginner');
    const [levelOpen, setLevelOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addRoadmap } = useRoadmaps();
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!skill.trim()) {
            toast.warning('Please enter a skill to learn', { title: 'Skill Required' });
            return;
        }

        setLoading(true);

        try {
            const prompt = `${skill.trim()} for ${level} level`;
            const response = await api.post('/roadmaps/generate', { prompt, level });
            if (response.data.success && response.data.roadmap) {
                addRoadmap(response.data.roadmap);
                toast.success('Your learning roadmap is ready!', { title: 'Roadmap Generated' });
                navigate(`/roadmap/${response.data.roadmap._id}`);
            } else {
                toast.error('Failed to generate roadmap. Please try again.', { title: 'Generation Failed' });
            }
        } catch (err) {
            console.error('Generate roadmap error:', err);
            const msg = err.response?.data?.error || 'Failed to generate roadmap. Please try again.';
            toast.error(msg, { title: 'Error' });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleGenerate();
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative z-10"
        >
            {/* Floating Badge */}
            <motion.div variants={item} className="mb-8">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-medium shadow-sm">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span>AI-Powered Adaptive Learning</span>
                </div>
            </motion.div>

            {/* Main Hero Text */}
            <motion.div variants={item} className="text-center max-w-4xl mb-10">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight text-slate-900 dark:text-white mb-6 leading-normal">
                    Master any skill with
                    <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2">
                        Intelligent Roadmaps
                    </span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    CognitoLearn uses generative AI to build personalized, mastery-based curriculum graphs. Stop guessing what to learn next.
                </p>
            </motion.div>

            {/* Input Section: Unified card with labels inside */}
            <motion.div variants={item} className="w-full max-w-4xl relative mb-4">
                {/* Unified Input Row */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />

                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-stretch">

                        {/* Skill Input */}
                        <div className="flex-1 px-4 py-3">
                            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                                Skill
                            </label>
                            <div className="flex items-center gap-2">
                                <Search size={18} className="text-slate-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={skill}
                                    onChange={(e) => setSkill(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="React, Python, Machine Learning..."
                                    className="w-full bg-transparent border-none outline-none text-base text-slate-800 dark:text-white placeholder-slate-400 font-medium"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:flex items-stretch">
                            <div className="w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                        </div>

                        {/* Level Dropdown */}
                        <div className="relative px-5 py-3 md:w-52">
                            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                                Level
                            </label>
                            <button
                                type="button"
                                onClick={() => setLevelOpen(!levelOpen)}
                                disabled={loading}
                                className="w-full flex items-center justify-between text-base font-medium text-slate-800 dark:text-white"
                            >
                                <span>{LEVELS.find(l => l.value === level)?.label}</span>
                                <ChevronDown size={18} className={`text-purple-500 transition-transform ${levelOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {levelOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setLevelOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 right-0 mt-2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                                    >
                                        {LEVELS.map((lvl) => (
                                            <button
                                                key={lvl.value}
                                                type="button"
                                                onClick={() => {
                                                    setLevel(lvl.value);
                                                    setLevelOpen(false);
                                                }}
                                                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center gap-2 ${level === lvl.value
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {level === lvl.value && <CheckCircle2 size={14} />}
                                                {lvl.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="hidden md:flex items-stretch">
                            <div className="w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                        </div>

                        {/* Generate Button - matching input style */}
                        <div className="group/gen px-6 py-3 md:min-w-[160px] rounded-r-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10">
                            <label className="block text-xs font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wide mb-1 cursor-pointer">
                                Generate
                            </label>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="group flex items-center gap-3 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group-hover/gen:scale-105 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={22} className="animate-spin text-indigo-500" />
                                        <span className="text-lg font-medium text-slate-500">Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm group-hover/gen:drop-shadow-lg transition-all">
                                            Roadmap
                                        </span>
                                        <ArrowRight size={22} className="text-pink-500 group-hover/gen:translate-x-1 group-hover/gen:scale-110 transition-all duration-300" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Feature Pills with Hover Animation */}
            <motion.div variants={item} className="flex flex-wrap justify-center gap-4 md:gap-8 mt-4">
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm cursor-default px-3 py-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span>Mastery Checks</span>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm cursor-default px-3 py-1.5 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                    <Zap size={18} className="text-amber-500" />
                    <span>AI Mentor</span>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm cursor-default px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                    <Layout size={18} className="text-blue-500" />
                    <span>Dynamic Graph</span>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
