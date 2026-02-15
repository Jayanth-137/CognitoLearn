import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Trophy, RotateCcw, ArrowLeft, Sparkles, Target, Eye, Send, XCircle, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/client';
import { useStats } from '../context/StatsContext';

const Quiz = () => {
    const { roadmapId, topicId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshStreak } = useStats();

    const topicTitle = location.state?.topicTitle || topicId?.replace(/-/g, ' ') || 'General Knowledge';

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questionOrder, setQuestionOrder] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [animDirection, setAnimDirection] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [latestAttempt, setLatestAttempt] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!roadmapId || !topicId) {
                setError('Invalid quiz URL');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/roadmaps/${roadmapId}/topics/${topicId}/quiz`);

                if (response.data.success && response.data.quiz) {
                    setQuiz(response.data.quiz);
                    setQuestionOrder((response.data.quiz.questions || []).map((question) => question.id));
                    setLatestAttempt(response.data.latestAttempt);

                    if (response.data.quizPassed && response.data.latestAttempt) {
                        setShowResults(true);
                    }
                } else {
                    throw new Error('Failed to load quiz');
                }
            } catch (err) {
                console.error('Quiz fetch error:', err);
                setError(err.response?.data?.error || 'Failed to load quiz. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [roadmapId, topicId]);

    useEffect(() => {
        setCurrentQuestion(0);
        setAnswers({});
        setQuestionOrder([]);
        setShowResults(false);
    }, [topicId]);

    const orderedQuestions = questionOrder
        .map((questionId) => quiz?.questions?.find((question) => question.id === questionId))
        .filter(Boolean);

    const reorderQuestions = (mode) => {
        if (!quiz?.questions?.length) return;

        const currentQuestionId = orderedQuestions[currentQuestion]?.id;
        const baseOrder = (quiz.questions || []).map((question) => question.id);
        let nextOrder = baseOrder;

        if (mode === 'shuffle') {
            nextOrder = [...baseOrder].sort(() => Math.random() - 0.5);
        } else if (mode === 'unanswered') {
            const unanswered = baseOrder.filter((id) => answers[id] === undefined);
            const answered = baseOrder.filter((id) => answers[id] !== undefined);
            nextOrder = [...unanswered, ...answered];
        }

        setQuestionOrder(nextOrder);
        if (currentQuestionId) {
            const nextIndex = nextOrder.indexOf(currentQuestionId);
            setCurrentQuestion(nextIndex >= 0 ? nextIndex : 0);
        } else {
            setCurrentQuestion(0);
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        const question = orderedQuestions[currentQuestion];
        if (!question?.id) return;
        setAnswers({ ...answers, [question.id]: answerIndex });
    };

    const handleNext = () => {
        if (orderedQuestions.length > 0 && currentQuestion < orderedQuestions.length - 1) {
            setAnimDirection(1);
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setAnimDirection(-1);
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            questionId,
            selectedAnswer
        }));

        if (roadmapId && topicId) {
            try {
                const response = await api.post(`/roadmaps/${roadmapId}/topics/${topicId}/quiz-passed`, {
                    answers: answersArray
                });
                if (response.data?.attempt) {
                    setLatestAttempt(response.data.attempt);
                } else {
                    setLatestAttempt({ _id: response.data.attemptId, answers: answersArray });
                }
                // Update global streak immediately
                refreshStreak();
            } catch (error) {
                console.error('Failed to update quiz status:', error);
            }
        }

        setSubmitting(false);
        setShowResults(true);
    };

    const handleRetakeQuiz = async () => {
        // Re-fetch quiz to get a fresh random subset from the question pool
        setShowResults(false);
        setCurrentQuestion(0);
        setAnswers({});
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/roadmaps/${roadmapId}/topics/${topicId}/quiz`);
            if (response.data.success && response.data.quiz) {
                setQuiz(response.data.quiz);
                setQuestionOrder((response.data.quiz.questions || []).map((question) => question.id));
                setLatestAttempt(null);
            } else {
                throw new Error('Failed to load quiz');
            }
        } catch (err) {
            console.error('Quiz re-fetch error:', err);
            setError(err.response?.data?.error || 'Failed to load quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = () => {
        if (latestAttempt && latestAttempt._id) {
            navigate(`/quiz-review/${latestAttempt._id}`);
        } else {
            console.error("No attempt ID available for review");
        }
    };

    // Loading state
    if (loading) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <motion.div
                            className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900"
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-indigo-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Generating Quiz
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Creating questions for <span className="font-medium text-slate-700 dark:text-slate-300">{topicTitle}</span>
                    </p>
                </motion.div>
            </div>,
            document.body
        );
    }

    // Error state
    if (error) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </motion.div>
            </div>,
            document.body
        );
    }

    if (!quiz) return null;

    // Results view
    if (showResults) {
        const displayScore = latestAttempt?.score ?? 0;
        const displayPassed = latestAttempt?.passed ?? false;
        const correctCount = latestAttempt?.correctAnswers ?? 0;

        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg"
                >
                    <div className={`relative overflow-hidden rounded-3xl p-8 ${displayPassed
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-rose-500 to-pink-600'
                        }`}>
                        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />

                        <div className="relative z-10 text-center text-white">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                            >
                                {displayPassed ? <Trophy className="w-10 h-10" /> : <Target className="w-10 h-10" />}
                            </motion.div>

                            <h1 className="text-3xl font-bold mb-2">
                                {displayPassed ? 'Congratulations!' : 'Keep Learning!'}
                            </h1>
                            <p className="text-white/80 mb-6">
                                {displayPassed ? 'You passed the quiz!' : 'You can do better next time'}
                            </p>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.3 }}
                                className="text-7xl font-black mb-2"
                            >
                                {displayScore}%
                            </motion.div>
                            <p className="text-white/70 text-sm mb-6">
                                {Object.keys(answers).length > 0 ? correctCount : Math.round((displayScore / 100) * (quiz.questions?.length || 0))} of {quiz.questions?.length || 0} correct
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {latestAttempt && latestAttempt._id && (
                            <button
                                onClick={handleReview}
                                className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                            >
                                <Eye size={20} /> Review Your Answers
                            </button>
                        )}

                        {!displayPassed && (
                            <button
                                onClick={handleRetakeQuiz}
                                className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                            >
                                <RotateCcw size={20} /> Try Again
                            </button>
                        )}

                        <button
                            onClick={() => navigate(roadmapId ? `/roadmap/${roadmapId}` : '/roadmap')}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                        >
                            <ArrowLeft size={20} /> Back to Roadmap
                        </button>
                    </div>
                </motion.div>
            </div>,
            document.body
        );
    }

    // Active Question View – defensive: re-sync questionOrder if stale
    if (!orderedQuestions.length) {
        if (quiz?.questions?.length && questionOrder.length === 0) {
            // questionOrder was cleared or never set — recover from quiz data
            setQuestionOrder(quiz.questions.map((q) => q.id));
        }
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Preparing questions…</p>
                </div>
            </div>,
            document.body
        );
    }
    const question = orderedQuestions[currentQuestion];
    if (!question || !question.options) return null;
    const userAnswer = question?.id ? answers[question.id] : undefined;
    const totalQuestions = orderedQuestions.length;

    // Modal Focus Mode Overlay - Using Portal to escape stacking context
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white max-w-[60%]">
                        {quiz.title || `${topicTitle} Quiz`}
                    </h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => reorderQuestions('original')}
                            className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Original order"
                        >
                            Original
                        </button>
                        <button
                            onClick={() => reorderQuestions('shuffle')}
                            className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Shuffle questions"
                        >
                            Shuffle
                        </button>
                        <button
                            onClick={() => reorderQuestions('unanswered')}
                            className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Unanswered first"
                        >
                            Unanswered
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            title="Exit Quiz"
                        >
                            <XCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar (Segmented) */}
                <div className="px-6 pt-4 pb-2">
                    <div className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                        <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                        <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
                    </div>
                    <div className="flex gap-1 h-1.5">
                        {orderedQuestions.map((_, idx) => {
                            let activeState = 'bg-slate-100 dark:bg-slate-800';
                            if (idx < currentQuestion) activeState = 'bg-indigo-500';
                            if (idx === currentQuestion) activeState = 'bg-indigo-500';

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scaleY: 0 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex-1 rounded-full transition-colors duration-300 ${activeState}`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <AnimatePresence mode="wait" custom={animDirection}>
                        <motion.div
                            key={currentQuestion}
                            custom={animDirection}
                            initial={{ opacity: 0, x: animDirection * 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: animDirection * -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Question Text */}
                            <h2 className="text-xl md:text-xl font-bold text-slate-800 dark:text-white mb-6 leading-relaxed">
                                {question.question}
                            </h2>

                            {/* Options */}
                            <div className="grid gap-3">
                                {question.options.map((option, index) => {
                                    const isSelected = userAnswer === index;
                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.005, backgroundColor: isSelected ? undefined : 'rgba(99, 102, 241, 0.05)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswerSelect(index)}
                                            className={`
                                                relative w-full p-3.5 rounded-xl text-left border transition-all flex items-center gap-3 group
                                                ${isSelected
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all
                                                ${isSelected
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                                }
                                            `}>
                                                {String.fromCharCode(65 + index)}
                                            </div>

                                            <span className={`text-base font-medium flex-1 transition-colors ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {option}
                                            </span>

                                            {isSelected && (
                                                <div className="flex-shrink-0 text-indigo-500">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className={`text-sm font-medium transition-colors flex items-center gap-1
                            ${currentQuestion === 0
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    {currentQuestion === totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={userAnswer === undefined || submitting}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-emerald-500/20
                                ${userAnswer === undefined || submitting
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/30 active:scale-95'
                                }`}
                        >
                            {submitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>Submit <Send size={16} /></>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={userAnswer === undefined}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20
                                ${userAnswer === undefined
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-95'
                                }`}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default Quiz;
