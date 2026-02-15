import { Check, Lock, MessageCircle, Play, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Subtopic Node Component (smaller nodes branching from main topic)
const SubtopicNode = ({ subtopic, onToggle, isLocked, subtopicNumber }) => {
    const isCompleted = subtopic.completed;

    return (
        <div
            onClick={() => !isLocked && onToggle?.()}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer text-sm
                ${isLocked
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50 cursor-not-allowed'
                    : isCompleted
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 hover:border-green-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                }
            `}
        >
            {/* Number Badge */}
            <span className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isLocked
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                }
            `}>
                {subtopicNumber}
            </span>

            <span className={`font-medium ${isLocked ? 'text-slate-400' :
                isCompleted ? 'text-green-700 dark:text-green-400 line-through' :
                    'text-slate-700 dark:text-slate-200'
                }`}>
                {subtopic.title}
            </span>
        </div>
    );
};

// Main Topic Card Component - Responsive
const TopicCard = ({ topic, topicNumber, onSubtopicToggle, showSubtopics = false }) => {
    const navigate = useNavigate();

    const isLocked = topic.status === 'locked';
    const isCompleted = topic.status === 'completed';
    const isActive = topic.status === 'in-progress';

    const completedCount = topic.subtopics?.filter(s => s.completed).length || 0;
    const totalCount = topic.subtopics?.length || 0;

    const handleStartLearning = () => {
        if (!isLocked) navigate(`/learn/${topic.id}`);
    };

    const handleChat = () => {
        if (!isLocked) navigate(`/mentor?topic=${encodeURIComponent(topic.title)}`);
    };

    return (
        <div className={`
            relative w-full max-w-xs md:w-72 lg:w-80 rounded-2xl border-2 shadow-lg transition-all duration-300 bg-white dark:bg-slate-800
            ${isCompleted ? 'border-green-400 dark:border-green-500' : ''}
            ${isActive ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-200/50 dark:ring-amber-800/30' : ''}
            ${isLocked ? 'border-slate-200 dark:border-slate-700 opacity-60' : ''}
            ${!isLocked ? 'hover:shadow-xl' : ''}
        `}>
            {/* Status Badge */}
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border-2 border-white dark:border-slate-900
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isActive ? 'bg-amber-500 text-white' : ''}
                ${isLocked ? 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300' : ''}
            `}>
                {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Locked'}
            </div>

            <div className="p-4 md:p-5 pt-5 md:pt-6">
                {/* Topic Number & Title */}
                <div className="text-center mb-3">
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                        Topic {topicNumber}
                    </span>
                    <h3 className={`text-lg md:text-xl font-bold mt-1 ${isLocked ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {topic.title}
                    </h3>
                    <p
                        className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2"
                        title={topic.description || `Learn ${topic.title}`}
                    >
                        {topic.description || `Learn ${topic.title}`}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{completedCount}/{totalCount}</span>
                </div>

                {/* Mobile: Inline Subtopics */}
                {showSubtopics && topic.subtopics?.length > 0 && (
                    <div className="mb-4 space-y-2">
                        {topic.subtopics.map((sub, idx) => (
                            <SubtopicNode
                                key={sub.id}
                                subtopic={sub}
                                isLocked={isLocked}
                                subtopicNumber={idx + 1}
                                onToggle={() => onSubtopicToggle?.(topic.id, sub.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleStartLearning}
                        disabled={isLocked}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
                            ${isLocked
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                                : isCompleted
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg'
                            }
                        `}
                    >
                        {isCompleted ? <><Check size={16} /> Review</> : <><Play size={16} /> Start</>}
                    </button>
                    <button
                        onClick={handleChat}
                        disabled={isLocked}
                        className={`p-2.5 rounded-xl transition-all
                            ${isLocked
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300'
                            }
                        `}
                        title="Chat with AI"
                    >
                        <MessageCircle size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Quiz Milestone Component
// status: 'locked' (topic not completed), 'available' (topic completed, ready for quiz), 'completed' (quiz passed)
const QuizMilestone = ({ roadmapId, topicId, topicTitle, status }) => {
    const navigate = useNavigate();
    const isLocked = status === 'locked';
    const isAvailable = status === 'available';
    const isCompleted = status === 'completed';

    return (
        <div className="relative py-1">
            {/* Glow effect for available quizzes */}
            {isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-400/30 animate-ping" />
                </div>
            )}
            <button
                onClick={() => !isLocked && navigate(`/quiz/${roadmapId}/${topicId}`, { state: { topicTitle } })}
                disabled={isLocked}
                title={isLocked ? 'Complete the topic first' : `Take quiz for ${topicTitle}`}
                className={`group relative w-12 h-12 md:w-14 md:h-14 rounded-full border-4 flex items-center justify-center transition-all shadow-lg z-10
                    ${isCompleted ? 'border-green-400 bg-green-500 text-white shadow-green-500/40' : ''}
                    ${isAvailable ? 'border-amber-400 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/50 ring-4 ring-amber-300/50 dark:ring-amber-500/30' : ''}
                    ${isLocked ? 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : ''}
                    ${!isLocked ? 'hover:scale-110 cursor-pointer' : ''}
                `}
            >
                {isCompleted ? <Check size={20} strokeWidth={3} /> : isLocked ? <Lock size={16} /> : <HelpCircle size={22} />}
            </button>
            {/* Label on the side - clean glass style */}
            {isAvailable && (
                <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold text-amber-500 dark:text-amber-400">
                    Take Quiz
                </span>
            )}
        </div>
    );
};

// Vertical Connector Line with optional Quiz Milestone
// topic: the topic object (to get id, title, status, quizRecommended, quizPassed)
const VerticalConnector = ({ topic, roadmapId, isLast }) => {
    const allSubtopicsComplete = topic.subtopics?.every(st => st.completed) || false;
    const hasQuiz = topic.quizRecommended !== false; // Default to true if not specified
    const quizPassed = topic.quizPassed === true;

    // If it's the last topic and there's no quiz, we don't need a connector
    if (isLast && !hasQuiz) return null;

    // Quiz status:
    // - 'locked' if subtopics not all complete
    // - 'available' if subtopics complete but quiz not passed
    // - 'completed' if quiz passed
    let quizStatus = 'locked';
    if (quizPassed) {
        quizStatus = 'completed';
    } else if (allSubtopicsComplete) {
        quizStatus = 'available';
    }

    // Top line color: green if quiz passed, amber if subtopics done, gray otherwise
    const topLineColor = quizPassed ? 'bg-green-400' : allSubtopicsComplete ? 'bg-amber-400' : topic.status === 'in-progress' ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700';

    // Bottom line color: green if quiz passed, amber if available, gray if locked
    const bottomLineColor = quizPassed ? 'bg-green-400' : allSubtopicsComplete ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700';

    return (
        <div className="flex flex-col items-center py-2">
            {/* Top connector line */}
            <div className={`w-1 h-6 md:h-8 rounded-full ${topLineColor}`} />
            {hasQuiz && (
                <>
                    <QuizMilestone
                        roadmapId={roadmapId}
                        topicId={topic.id}
                        topicTitle={topic.title}
                        status={quizStatus}
                    />
                    {/* Bottom connector line - hide if last */}
                    {!isLast && <div className={`w-1 h-6 md:h-8 rounded-full ${bottomLineColor}`} />}
                </>
            )}
            {!hasQuiz && !isLast && (
                <div className={`w-1 h-6 md:h-8 rounded-full ${bottomLineColor}`} />
            )}
        </div>
    );
};

// Horizontal Connector for Desktop
const HorizontalConnector = ({ status }) => {
    const isCompleted = status === 'completed';
    const isActive = status === 'in-progress';

    return (
        <div className={`w-6 lg:w-8 h-0.5 flex-shrink-0 ${isCompleted ? 'bg-green-300' :
            isActive ? 'bg-amber-300' :
                'bg-slate-200 dark:bg-slate-700'
            }`} />
    );
};

// Main Roadmap Container - Responsive Layout
const RoadmapContainer = ({ data, roadmapId, onSubtopicToggle }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                No topics available for this roadmap.
            </div>
        );
    }

    return (
        <div className="w-full overflow-y-auto py-6 md:py-8 px-4">
            <div className="flex flex-col items-center max-w-5xl mx-auto">
                {data.map((topic, index) => {
                    const isLast = index === data.length - 1;
                    const leftSubtopics = topic.subtopics?.slice(0, Math.ceil(topic.subtopics.length / 2)) || [];
                    const rightSubtopics = topic.subtopics?.slice(Math.ceil(topic.subtopics.length / 2)) || [];

                    return (
                        <div key={topic.id} className="flex flex-col items-center w-full">
                            {/* Mobile: Simple vertical layout with subtopics inside card */}
                            <div className="block lg:hidden w-full max-w-xs mx-auto">
                                <TopicCard
                                    topic={topic}
                                    topicNumber={index + 1}
                                    onSubtopicToggle={onSubtopicToggle}
                                    showSubtopics={true}
                                />
                            </div>

                            {/* Desktop: Branching layout */}
                            <div className="hidden lg:flex items-center justify-center gap-2 w-full">
                                {/* Left Subtopics */}
                                <div className="flex flex-col items-end gap-2 flex-1 min-w-0">
                                    {leftSubtopics.map((sub, idx) => (
                                        <div key={sub.id} className="flex items-center gap-2">
                                            <SubtopicNode
                                                subtopic={sub}
                                                isLocked={topic.status === 'locked'}
                                                subtopicNumber={idx + 1}
                                                onToggle={() => onSubtopicToggle?.(topic.id, sub.id)}
                                            />
                                            <HorizontalConnector status={topic.status} />
                                        </div>
                                    ))}
                                </div>

                                {/* Main Topic Card */}
                                <TopicCard
                                    topic={topic}
                                    topicNumber={index + 1}
                                    onSubtopicToggle={onSubtopicToggle}
                                    showSubtopics={false}
                                />

                                {/* Right Subtopics */}
                                <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
                                    {rightSubtopics.map((sub, idx) => (
                                        <div key={sub.id} className="flex items-center gap-2">
                                            <HorizontalConnector status={topic.status} />
                                            <SubtopicNode
                                                subtopic={sub}
                                                isLocked={topic.status === 'locked'}
                                                subtopicNumber={leftSubtopics.length + idx + 1}
                                                onToggle={() => onSubtopicToggle?.(topic.id, sub.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vertical Connector to Next Topic (with Quiz if recommended) */}
                            <VerticalConnector topic={topic} roadmapId={roadmapId} isLast={isLast} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoadmapContainer;
