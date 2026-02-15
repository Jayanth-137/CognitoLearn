import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, Calendar, ArrowLeft, Zap, Trophy, Target, Clock, Loader2 } from 'lucide-react';
import api from '../api/client';

const QuizReview = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [animDirection, setAnimDirection] = useState(1);

    useEffect(() => {
        const fetchAttempt = async () => {
            if (!attemptId) return;

            setLoading(true);
            try {
                const response = await api.get(`/quizzes/attempts/${attemptId}`);
                if (response.data.success) {
                    setAttempt(response.data.attempt);
                    setQuiz(response.data.attempt.quizId);
                } else {
                    setError('Failed to load attempt details');
                }
            } catch (err) {
                console.error('Fetch attempt error:', err);
                setError('Failed to load quiz review');
            } finally {
                setLoading(false);
            }
        };

        fetchAttempt();
    }, [attemptId]);

    const handleNext = () => {
        if (quiz && currentQuestion < quiz.questions.length - 1) {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !attempt || !quiz) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Error Loading Review</h3>
                    <p className="text-slate-500 mb-4">{error || 'Review could not be found'}</p>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                        Back to History
                    </button>
                </div>
            </div>
        );
    }

    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const question = quiz.questions[currentQuestion];

    // Find user's answer for this question (match by questionId for pool-based quizzes)
    const userAnswerData = attempt.answers.find(a =>
        a.questionId ? a.questionId === question.id : a.questionIndex === currentQuestion
    );
    const userAnswerIndex = userAnswerData ? userAnswerData.selectedAnswer : null;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-3 md:p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(attempt.completedAt)}
                        </div>
                        <div className={`flex items-center gap-1 font-medium ${attempt.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {attempt.passed ? <Trophy size={12} /> : <Target size={12} />}
                            {attempt.score}% Score
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white truncate flex-1">
                        Review: {quiz.title || quiz.topic}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium whitespace-nowrap">
                        Review Mode
                    </span>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {currentQuestion + 1}/{quiz.questions.length}
                    </span>
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait" custom={animDirection}>
                <motion.div
                    key={currentQuestion}
                    custom={animDirection}
                    initial={{ opacity: 0, x: animDirection * 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: animDirection * -30 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden"
                >
                    {/* Question */}
                    <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                                {currentQuestion + 1}
                            </span>
                            <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white leading-snug">
                                {question.question}
                            </h2>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex-1 p-3 md:p-4 overflow-y-auto custom-scrollbar">
                        <div className="grid gap-2">
                            {question.options.map((option, index) => {
                                const isSelected = userAnswerIndex === index;
                                const isCorrectAnswer = question.correctAnswer === index;

                                let optionStyles = 'border-slate-200 dark:border-slate-700 opacity-60';
                                let labelStyles = 'bg-slate-100 dark:bg-slate-700 text-slate-500';

                                if (isCorrectAnswer) {
                                    optionStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 opacity-100';
                                    labelStyles = 'bg-emerald-500 text-white';
                                } else if (isSelected && !isCorrectAnswer) {
                                    optionStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 opacity-100';
                                    labelStyles = 'bg-rose-500 text-white';
                                } else if (isSelected) {
                                    // Should not happen if logic is correct, but fallback
                                    optionStyles = 'border-blue-500 opacity-100';
                                }

                                return (
                                    <div
                                        key={index}
                                        className={`w-full p-3 rounded-xl border-2 transition-all ${optionStyles}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${labelStyles}`}>
                                                {isCorrectAnswer ? (
                                                    <CheckCircle size={14} />
                                                ) : isSelected && !isCorrectAnswer ? (
                                                    <XCircle size={14} />
                                                ) : (
                                                    String.fromCharCode(65 + index)
                                                )}
                                            </span>
                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{option}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        {question.explanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            >
                                <div className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-0.5">Explanation</p>
                                        <p className="text-blue-600 dark:text-blue-400 text-xs leading-relaxed">{question.explanation}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentQuestion === 0
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <ChevronLeft size={18} /> Prev
                        </button>

                        {/* Question dots */}
                        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar max-w-[150px] sm:max-w-none px-2">
                            {quiz.questions.map((_, idx) => {
                                const q = quiz.questions[idx];
                                const qAnswer = attempt.answers.find(a =>
                                    a.questionId ? a.questionId === q.id : a.questionIndex === idx
                                );
                                const isCorrect = qAnswer?.isCorrect;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setAnimDirection(idx > currentQuestion ? 1 : -1);
                                            setCurrentQuestion(idx);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${idx === currentQuestion
                                            ? 'w-4 bg-blue-500'
                                            : isCorrect
                                                ? 'bg-emerald-400'
                                                : 'bg-rose-400'
                                            }`}
                                    />
                                );
                            })}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentQuestion === quiz.questions.length - 1}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentQuestion === quiz.questions.length - 1
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default QuizReview;
