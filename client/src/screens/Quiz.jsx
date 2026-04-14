import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, RotateCcw, ArrowLeft, Target, Eye, XCircle,
    CheckCircle2, Loader2, Brain, Zap, ChevronRight, Lightbulb, X
} from 'lucide-react';
import api from '../api/client';
import { useStats } from '../context/StatsContext';

// ─── MASTERY BAR ───
const MasteryBar = ({ percentage, previousPercentage, threshold = 90 }) => {
    const getBarColor = (pct) => {
        if (pct >= 90) return 'from-emerald-500 to-green-400';
        if (pct >= 60) return 'from-amber-500 to-yellow-400';
        if (pct >= 30) return 'from-indigo-500 to-purple-400';
        return 'from-slate-400 to-slate-300';
    };

    const delta = previousPercentage !== null && previousPercentage !== undefined
        ? percentage - previousPercentage : null;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between text-xs font-medium mb-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Brain size={13} />
                    <span>Mastery</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-700 dark:text-slate-200 font-bold tabular-nums">{percentage}%</span>
                    {delta !== null && delta !== 0 && (
                        <motion.span
                            initial={{ opacity: 0, y: -4, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`text-xs font-bold ${delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                        >
                            {delta > 0 ? '+' : ''}{delta}%
                        </motion.span>
                    )}
                </div>
            </div>
            <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                <motion.div
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getBarColor(percentage)}`}
                    initial={{ width: `${previousPercentage ?? 0}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                {/* Threshold marker */}
                <div
                    className="absolute inset-y-0 w-0.5 bg-slate-400/60 dark:bg-slate-500/60"
                    style={{ left: `${threshold}%` }}
                />
                <div
                    className="absolute -top-5 text-[9px] font-bold text-slate-400 dark:text-slate-500"
                    style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
                >
                    {threshold}%
                </div>
            </div>
        </div>
    );
};

// ─── MASTERY RING ───
const MasteryRing = ({ percentage, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle className="text-slate-200 dark:text-slate-700" strokeWidth={strokeWidth}
                    stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <motion.circle strokeWidth={strokeWidth} strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round" stroke={color} fill="transparent"
                    r={radius} cx={size / 2} cy={size / 2}
                    style={{ filter: `drop-shadow(0 0 6px ${color}40)` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{percentage}%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">mastery</span>
            </div>
        </div>
    );
};

// ─── MAIN QUIZ COMPONENT ───
const Quiz = () => {
    const { roadmapId, topicId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshStreak } = useStats();

    const topicTitle = location.state?.topicTitle || topicId?.replace(/-/g, ' ') || 'Quiz';

    // Phase: info | question | results
    const [phase, setPhase] = useState('info');  // Start with info card immediately
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Background fetch state
    const [dataReady, setDataReady] = useState(false);
    const [fetchingInBackground, setFetchingInBackground] = useState(true);
    const [userClickedStart, setUserClickedStart] = useState(false);
    const fetchedDataRef = useRef(null); // stores { session, question, mastery, alreadyMastered, resumed }

    // Session
    const [session, setSession] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // Inline feedback state
    const [answered, setAnswered] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // BKT mastery
    const [currentMastery, setCurrentMastery] = useState(15);
    const [previousMastery, setPreviousMastery] = useState(null);
    const [isFirstAttempt, setIsFirstAttempt] = useState(true);

    // Quiz completion
    const [quizComplete, setQuizComplete] = useState(false);
    const [result, setResult] = useState(null);
    const [attemptId, setAttemptId] = useState(null);

    // ─── BACKGROUND FETCH ───
    const fetchQuizData = useCallback(async () => {
        setFetchingInBackground(true);
        setDataReady(false);
        setError(null);
        fetchedDataRef.current = null;

        try {
            const response = await api.post(`/roadmaps/${roadmapId}/topics/${topicId}/quiz/start`);
            const data = response.data;
            fetchedDataRef.current = data;
            setDataReady(true);
        } catch (err) {
            console.error('Start quiz error:', err);
            setError(err.response?.data?.error || 'Failed to start quiz. Please try again.');
        } finally {
            setFetchingInBackground(false);
        }
    }, [roadmapId, topicId]);

    // Start background fetch immediately
    useEffect(() => {
        if (!roadmapId || !topicId) {
            setError('Invalid quiz URL');
            return;
        }
        fetchQuizData();
    }, [roadmapId, topicId, fetchQuizData]);

    // When data arrives AND user already clicked start → transition
    useEffect(() => {
        if (dataReady && userClickedStart && fetchedDataRef.current) {
            applyFetchedData(fetchedDataRef.current);
        }
    }, [dataReady, userClickedStart]);

    // Apply fetched data to state and transition to appropriate phase
    const applyFetchedData = (data) => {
        if (data.alreadyMastered) {
            setCurrentMastery(data.mastery.level);
            setResult({
                mastered: true,
                masteryLevel: data.mastery.level,
                totalQuestions: 0,
                correctAnswers: 0,
                score: 100
            });
            setPhase('results');
            return;
        }

        if (data.success) {
            setSession(data.session);
            setCurrentQuestion(data.question);
            setCurrentMastery(data.session.currentMastery);
            setIsFirstAttempt(data.session.currentMastery <= 15);

            // For resumed sessions or retakes, skip info and go straight to question
            if (data.resumed || data.session.currentMastery > 15) {
                setPhase('question');
            } else {
                setPhase('question'); // User already saw info card, go to question
            }
        }
    };

    // Called when user clicks "Start Quiz" on info card
    const handleStartClick = () => {
        setUserClickedStart(true);
        if (dataReady && fetchedDataRef.current) {
            applyFetchedData(fetchedDataRef.current);
        }
        // If not ready yet, button will show spinner; useEffect above handles transition
    };

    // Retake: reset everything and re-fetch
    const handleRetake = () => {
        setPhase('info');
        setUserClickedStart(false);
        setSelectedAnswer(null);
        setAnswered(false);
        setFeedback(null);
        setQuizComplete(false);
        setResult(null);
        setPreviousMastery(null);
        fetchQuizData();
    };

    // ─── SUBMIT ANSWER (inline feedback) ───
    const handleSubmitAnswer = async () => {
        if (selectedAnswer === null || !currentQuestion || !session) return;
        setSubmitting(true);
        setPreviousMastery(currentMastery);

        try {
            const response = await api.post(`/roadmaps/${roadmapId}/topics/${topicId}/quiz/answer`, {
                sessionId: session._id,
                questionId: currentQuestion.id,
                selectedAnswer
            });
            const data = response.data;

            // Show inline feedback on the same card
            setFeedback(data.feedback);
            setCurrentMastery(data.mastery.level);
            setAnswered(true);

            if (data.quizComplete) {
                setQuizComplete(true);
                setResult(data.result);
                setAttemptId(data.result?.attemptId);
                refreshStreak();
            } else if (data.nextQuestion) {
                // Store next question — we'll show it when user clicks "Next"
                setSession(prev => ({
                    ...prev,
                    _nextQuestion: data.nextQuestion,
                    questionNumber: data.nextQuestion.questionNumber,
                    questionsAnswered: data.mastery.questionsAnswered
                }));
            }
        } catch (err) {
            console.error('Answer submission error:', err);
            setError(err.response?.data?.error || 'Failed to submit answer.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── NEXT QUESTION (or results) ───
    const handleNext = () => {
        if (quizComplete) {
            setPhase('results');
            return;
        }
        // Move to next question
        if (session?._nextQuestion) {
            setCurrentQuestion(session._nextQuestion);
            setSession(prev => {
                const { _nextQuestion, ...rest } = prev;
                return rest;
            });
        }
        setSelectedAnswer(null);
        setAnswered(false);
        setFeedback(null);
        setPreviousMastery(currentMastery);
    };

    const handleBack = () => navigate(roadmapId ? `/roadmap/${roadmapId}` : '/roadmap');
    const handleReview = () => attemptId && navigate(`/quiz-review/${attemptId}`);

    // ─── ERROR ───
    if (error) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Oops! Something went wrong</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={handleBack} className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            Go Back
                        </button>
                        <button onClick={fetchQuizData} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all">
                            Try Again
                        </button>
                    </div>
                </motion.div>
            </div>,
            document.body
        );
    }

    // ─── INFO CARD (shows immediately, quiz generates in background) ───
    if (phase === 'info') {
        const isWaiting = userClickedStart && fetchingInBackground;

        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        {/* Gradient header */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-6 text-white">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                                        <Brain size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Adaptive Quiz</h2>
                                        <p className="text-sm text-white/70">{topicTitle}</p>
                                    </div>
                                </div>
                                {/* Live generation status pill */}
                                <AnimatePresence>
                                    {fetchingInBackground && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-2.5 py-1"
                                        >
                                            <motion.div
                                                className="w-1.5 h-1.5 rounded-full bg-emerald-300"
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 1.2, repeat: Infinity }}
                                            />
                                            <span className="text-[10px] font-semibold text-white/80">Generating…</span>
                                        </motion.div>
                                    )}
                                    {!fetchingInBackground && dataReady && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-2.5 py-1"
                                        >
                                            <CheckCircle2 size={10} className="text-emerald-300" />
                                            <span className="text-[10px] font-semibold text-white/80">Ready!</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Info items */}
                        <div className="px-6 py-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 mt-0.5">
                                    <Target size={16} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Reach 90% mastery to pass</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">The quiz uses Bayesian tracking — each answer updates your mastery probability.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mt-0.5">
                                    <Zap size={16} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Quiz ends when you prove mastery</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Minimum 5 questions, up to 15 max. Get enough right and it stops early.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5">
                                    <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">Learn as you go</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">You'll get instant feedback and an explanation after each question.</p>
                                </div>
                            </div>
                        </div>

                        {/* Start button — spins if user clicked but data not ready yet */}
                        <div className="px-6 pb-6 space-y-2">
                            {fetchingInBackground && !userClickedStart && (
                                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                                    Generating your questions in the background…
                                </p>
                            )}
                            <button
                                onClick={handleStartClick}
                                disabled={isWaiting}
                                className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                                    ${isWaiting
                                        ? 'bg-indigo-400 dark:bg-indigo-700 cursor-wait text-white'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                                    }`}
                            >
                                {isWaiting ? (
                                    <><Loader2 size={18} className="animate-spin" /> Preparing Quiz…</>
                                ) : (
                                    <>Start Quiz <ChevronRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>,
            document.body
        );
    }

    // ─── QUESTION VIEW (with inline feedback) ───
    if (phase === 'question' && currentQuestion) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200/50 dark:border-slate-800"
                >
                    {/* ── Header ── */}
                    <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                <Brain size={16} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[200px] sm:max-w-none">{topicTitle}</h1>
                                <span className="text-[11px] text-slate-400">
                                    Question {currentQuestion.questionNumber} of {session?.totalQuestionsInPool || '?'} max
                                </span>
                            </div>
                        </div>

                        {/* Retake mastery banner (for returning users) */}
                        {!isFirstAttempt && !answered && currentMastery > 15 && (
                            <span className="hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                                Current: {currentMastery}% → Target: 90%
                            </span>
                        )}

                        <button
                            onClick={handleBack}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            title="Exit Quiz"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* ── Mastery Bar ── */}
                    <div className="px-5 pt-4 pb-1">
                        <MasteryBar percentage={currentMastery} previousPercentage={previousMastery} />
                    </div>

                    {/* ── Scrollable Content ── */}
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion.id}
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Question text */}
                                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-5 leading-relaxed">
                                    {currentQuestion.question}
                                </h2>

                                {/* Options */}
                                <div className="grid gap-2.5">
                                    {currentQuestion.options.map((option, index) => {
                                        const isSelected = selectedAnswer === index;
                                        const isCorrect = feedback?.correctAnswer === index;
                                        const isWrongSelection = answered && isSelected && !feedback?.isCorrect;

                                        let optionStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
                                        let badgeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400';
                                        let textStyle = 'text-slate-700 dark:text-slate-200';
                                        let icon = null;

                                        if (answered) {
                                            // After submission — reveal correct/incorrect
                                            if (isCorrect) {
                                                optionStyle = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-400/30';
                                                badgeStyle = 'bg-emerald-500 text-white';
                                                textStyle = 'text-emerald-900 dark:text-emerald-100 font-semibold';
                                                icon = <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />;
                                            } else if (isWrongSelection) {
                                                optionStyle = 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 ring-1 ring-rose-400/30';
                                                badgeStyle = 'bg-rose-500 text-white';
                                                textStyle = 'text-rose-900 dark:text-rose-100';
                                                icon = <XCircle size={18} className="text-rose-500 flex-shrink-0" />;
                                            } else {
                                                optionStyle = 'border-slate-200/60 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/30 opacity-50';
                                                badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500';
                                                textStyle = 'text-slate-400 dark:text-slate-500';
                                            }
                                        } else if (isSelected) {
                                            optionStyle = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm';
                                            badgeStyle = 'bg-indigo-500 text-white';
                                            textStyle = 'text-indigo-900 dark:text-white';
                                            icon = <CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0" />;
                                        }

                                        return (
                                            <motion.button
                                                key={index}
                                                whileHover={!answered ? { scale: 1.005 } : {}}
                                                whileTap={!answered ? { scale: 0.98 } : {}}
                                                onClick={() => !answered && setSelectedAnswer(index)}
                                                disabled={answered}
                                                className={`relative w-full p-3 rounded-xl text-left border transition-all duration-200 flex items-center gap-3 ${optionStyle}
                                                    ${!answered ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700' : 'cursor-default'}
                                                `}
                                            >
                                                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${badgeStyle}`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className={`text-sm md:text-base font-medium flex-1 transition-colors ${textStyle}`}>
                                                    {option}
                                                </span>
                                                {icon}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* ── Inline Explanation (slides in after answer) ── */}
                                <AnimatePresence>
                                    {answered && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        >
                                            <div className={`p-4 rounded-xl border ${
                                                feedback?.isCorrect
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
                                                    : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800/50'
                                            }`}>
                                                {/* Correct / Incorrect label */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    {feedback?.isCorrect ? (
                                                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <XCircle size={16} className="text-rose-600 dark:text-rose-400" />
                                                    )}
                                                    <span className={`text-sm font-bold ${
                                                        feedback?.isCorrect
                                                            ? 'text-emerald-700 dark:text-emerald-300'
                                                            : 'text-rose-700 dark:text-rose-300'
                                                    }`}>
                                                        {feedback?.isCorrect ? 'Correct!' : 'Incorrect'}
                                                    </span>
                                                </div>

                                                {/* Explanation */}
                                                {feedback?.explanation ? (
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                        <Lightbulb size={14} className="inline mr-1.5 text-amber-500 -mt-0.5" />
                                                        {feedback.explanation}
                                                    </p>
                                                ) : !feedback?.isCorrect ? (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        The correct answer is <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                            {String.fromCharCode(65 + feedback?.correctAnswer)}
                                                        </span>.
                                                    </p>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        {answered ? (
                            <>
                                {/* After answer: show mastery achieved or questions info */}
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {quizComplete
                                        ? (result?.mastered ? '🎉 Mastery achieved!' : 'Quiz complete')
                                        : `${session?.questionsAnswered || currentQuestion.questionNumber} answered`
                                    }
                                </span>
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.97] shadow-md shadow-indigo-500/20"
                                >
                                    {quizComplete ? (
                                        <><Trophy size={16} /> View Results</>
                                    ) : (
                                        <>Next Question <ChevronRight size={16} /></>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    Select an answer
                                </span>
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedAnswer === null || submitting}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg
                                        ${selectedAnswer === null || submitting
                                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 active:scale-[0.97] shadow-indigo-500/20'
                                        }`}
                                >
                                    {submitting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>Submit </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>,
            document.body
        );
    }

    // ─── RESULTS VIEW ───
    if (phase === 'results' && result) {
        const mastered = result.mastered;

        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full max-w-md relative"
                >
                    {/* Glowing background behind card */}
                    <div className={`absolute inset-0 blur-3xl -z-10 rounded-full opacity-40 mix-blend-screen 
                        ${mastered ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                    />

                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 shadow-2xl shadow-slate-900/50">
                        {/* Beautiful gradient header area */}
                        <div className={`relative px-8 pt-10 pb-16 ${mastered
                            ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600'
                            : 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500'
                            }`}>
                            
                            {/* Decorative background shapes */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/20 blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/40 outline-none to-transparent" />

                            <div className="relative z-10 flex flex-col items-center text-center text-white">
                                <motion.div
                                    initial={{ scale: 0, rotate: -15 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                                    className="w-24 h-24 mb-5 rounded-[2rem] bg-white/20 shadow-lg shadow-black/10 backdrop-blur-md border border-white/30 flex items-center justify-center"
                                >
                                    {mastered ? <Trophy className="w-12 h-12 text-white drop-shadow-md" /> : <Target className="w-12 h-12 text-white drop-shadow-md" />}
                                </motion.div>

                                <h1 className="text-3xl font-extrabold mb-2 drop-shadow-sm tracking-tight">
                                    {mastered ? 'Topic Mastered!' : 'Keep Practicing!'}
                                </h1>
                                
                                {mastered && result.totalQuestions === 0 ? (
                                    <p className="text-white/90 text-sm font-medium">You've already proven mastery!</p>
                                ) : !mastered ? (
                                    <p className="text-white/90 text-sm font-medium max-w-[250px]">Reach 90% mastery to unlock the next topic.</p>
                                ) : null}
                            </div>
                        </div>

                        {/* Stats card overlapping the header slightly */}
                        <div className="px-6 pb-8 relative -mt-10">
                            {result.totalQuestions > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-6">
                                    <div className="flex justify-center -mt-12 mb-6 drop-shadow-xl">
                                        <div className="p-2 rounded-full bg-white dark:bg-slate-800">
                                            <MasteryRing percentage={result.masteryLevel} size={110} strokeWidth={8} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
                                        <div className="text-center px-2">
                                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                                {result.totalQuestions}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Questions</p>
                                        </div>
                                        <div className="text-center px-2">
                                            <p className="text-2xl font-black text-emerald-500">
                                                {result.correctAnswers}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Correct</p>
                                        </div>
                                        <div className="text-center px-2">
                                            <p className="text-2xl font-black text-indigo-500">
                                                {result.score}%
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Accuracy</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {attemptId && (
                                    <button onClick={handleReview} className="w-full py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-2 border-slate-100 hover:border-slate-200 dark:border-slate-700/50 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                        <Eye size={18} /> Review Answers
                                    </button>
                                )}
                                {!mastered && (
                                    <button onClick={() => { setPhase('initial'); setSession(null); }} className="w-full py-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-100 hover:border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                        <RotateCcw size={18} /> Continue Practice
                                    </button>
                                )}
                                <button onClick={handleBack} className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]">
                                    <ArrowLeft size={18} /> Back to Roadmap
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>,
            document.body
        );
    }

    return null;
};

export default Quiz;
