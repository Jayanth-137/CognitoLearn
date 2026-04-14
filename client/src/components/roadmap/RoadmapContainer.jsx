import { Check, Lock, MessageCircle, HelpCircle, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Subtopic Node Component (smaller nodes branching from main topic)
const SubtopicNode = ({ subtopic, onToggle, isLocked, subtopicNumber }) => {
    const isCompleted = subtopic.completed;

    return (
        <div
            onClick={() => !isLocked && onToggle?.()}
            className={`
                group flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 cursor-pointer text-sm
                ${isLocked
                    ? 'border-transparent bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 opacity-70 grayscale cursor-not-allowed'
                    : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/80 dark:bg-emerald-900/10 dark:border-emerald-800 hover:border-emerald-400 shadow-sm shadow-emerald-500/5'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg shadow-indigo-500/10'
                }
            `}
        >
            {/* Number/Check Badge */}
            <span className={`
                relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                ${isLocked
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    : isCompleted
                        ? 'bg-emerald-500 text-white shadow-inner scale-105'
                        : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-md'
                }
            `}>
                {isCompleted ? <Check size={14} strokeWidth={4} /> : subtopicNumber}
                {/* Ring for active items */}
                {!isLocked && !isCompleted && (
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-700/50 scale-125 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                )}
            </span>

            <span className={`font-semibold transition-colors duration-300 ${isLocked ? 'text-slate-400' :
                isCompleted ? 'text-emerald-800 dark:text-emerald-300 opacity-90' :
                    'text-slate-700 dark:text-slate-200 group-hover:text-indigo-900 dark:group-hover:text-indigo-100'
                }`}>
                {subtopic.title}
            </span>
            
            {isCompleted && (
                <span className="hidden sm:block ml-auto text-[10px] uppercase tracking-widest font-black text-emerald-500/60 transition-opacity">
                    Done
                </span>
            )}
        </div>
    );
};

// Main Topic Card Component - Responsive
const TopicCard = ({ topic, topicNumber, onSubtopicToggle, onChatTopic, onMarkAllDone, showSubtopics = false }) => {
    const navigate = useNavigate();

    const isLocked = topic.status === 'locked';
    const isCompleted = topic.status === 'completed';
    const isActive = topic.status === 'in-progress';

    const completedCount = topic.subtopics?.filter(s => s.completed).length || 0;
    const totalCount = topic.subtopics?.length || 0;

    const allSubtopicsDone = topic.subtopics?.length > 0 && topic.subtopics.every(s => s.completed);

    const handleMarkDone = () => {
        if (isLocked) return;
        onMarkAllDone?.(topic.id);
    };

    const handleChat = () => {
        if (!isLocked && onChatTopic) onChatTopic(topic.title);
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
                    {/* Mark Done — subtle outlined style */}
                    <button
                        onClick={handleMarkDone}
                        disabled={isLocked || allSubtopicsDone}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold border transition-all
                            ${isLocked
                                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50'
                                : allSubtopicsDone
                                    ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                                    : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]'
                            }
                        `}
                        title={allSubtopicsDone ? 'All subtopics completed' : 'Mark all subtopics as done'}
                    >
                        {allSubtopicsDone
                            ? <><CheckCheck size={16} /> Completed</>
                            : <><Check size={16} /> Mark Done</>
                        }
                    </button>

                    {/* Ask AI — gradient border via wrapper trick */}
                    {isLocked ? (
                        <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold border border-slate-200 text-slate-400 cursor-not-allowed dark:border-slate-700"
                        >
                            <MessageCircle size={15} />
                            <span>Ask AI</span>
                        </button>
                    ) : (
                        <div className="flex-1 p-[1.5px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <button
                                onClick={handleChat}
                                className="w-full flex items-center justify-center gap-1.5 py-[9px] rounded-full text-sm font-semibold bg-white dark:bg-slate-800"
                                title="Ask AI about this topic"
                            >
                                <MessageCircle size={15} className="text-indigo-500" />
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                    Ask AI
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Premium Quiz Milestone Component with BKT mastery ring
// status: 'locked' (topic not completed), 'available' (topic completed, ready for quiz), 'completed' (quiz passed)
const QuizMilestone = ({ roadmapId, topicId, topicTitle, status, masteryLevel = 0 }) => {
    const navigate = useNavigate();
    const isLocked = status === 'locked';
    const isAvailable = status === 'available';
    const isCompleted = status === 'completed';
    const masteryPct = Math.round((masteryLevel || 0) * 100);
    const hasPartialMastery = masteryPct > 0 && !isCompleted;

    // Mini SVG mastery ring perfectly sized to wrap the inner button
    const MiniMasteryRing = ({ pct, size = 68 }) => {
        const strokeWidth = 4;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (pct / 100) * circumference;
        // Replaced violet with a vivid cyan/blue for better contrast
        const color = pct >= 60 ? '#f59e0b' : '#0ea5e9'; 
        return (
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-90 pointer-events-none drop-shadow-md z-20" width={size} height={size}>
                <circle strokeWidth={strokeWidth} stroke="rgba(100,116,139,0.15)" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" stroke={color} fill="transparent" r={radius} cx={size / 2} cy={size / 2}
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </svg>
        );
    };

    return (
        <div className="relative py-2 flex flex-col items-center group">
            {/* Ambient Background Glow for available items */}
            {isAvailable && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
            )}
            
            <button
                onClick={() => !isLocked && navigate(`/quiz/${roadmapId}/${topicId}`, { state: { topicTitle } })}
                disabled={isLocked}
                title={isLocked ? 'Complete the topic first' : `Take quiz for ${topicTitle}${hasPartialMastery ? ` (${masteryPct}% mastery)` : ''}`}
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted ? 'bg-gradient-to-tr from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-100 dark:ring-emerald-900/30' : ''}
                    ${isAvailable ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-500/40 hover:scale-110 active:scale-95 hover:shadow-orange-500/50' : ''}
                    ${isLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700 cursor-not-allowed grayscale opacity-70' : ''}
                `}
            >
                {/* Mastery ring overlay for in-progress perfectly wrapping the 48px standard button (48 + padding = 68px) */}
                {hasPartialMastery && !isLocked && <MiniMasteryRing pct={masteryPct} size={60} />}
                
                {isCompleted ? <Check size={24} strokeWidth={3} className="drop-shadow-sm" /> : isLocked ? <Lock size={20} /> : <HelpCircle size={22} className="drop-shadow-sm" />}
                
                {/* Embedded pulse ring inside the button to avoid clipping */}
                {isAvailable && !hasPartialMastery && (
                    <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 animate-ping" />
                )}
            </button>
            
            {/* Elegant Floating Labels */}
            {isAvailable && (
                <>
                    {/* Left side: Mastery percentage */}
                    {hasPartialMastery && (
                        <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 flex items-center z-20 pointer-events-none transition-all duration-300 group-hover:-translate-x-1">
                            <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-cyan-200 dark:border-cyan-700/50 shadow-lg shadow-cyan-500/10 order-1">
                                <span className="whitespace-nowrap text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent tracking-wide">
                                    {masteryPct}% Mastery
                                </span>
                            </div>
                            <div className="w-2 h-0.5 bg-cyan-400 dark:bg-cyan-500/60 rounded-full ml-1 opacity-50 order-2" />
                        </div>
                    )}

                    {/* Right side: Action Prompt */}
                    <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 flex items-center z-20 pointer-events-none transition-all duration-300 group-hover:translate-x-1">
                        <div className="w-2 h-0.5 bg-amber-400 dark:bg-amber-500/60 rounded-full mr-1 opacity-50" />
                        <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-amber-200 dark:border-amber-700/50 shadow-lg shadow-amber-500/10">
                            <span className="whitespace-nowrap text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent tracking-wide">
                                {hasPartialMastery ? 'Retake Quiz' : 'Take Quiz'}
                            </span>
                        </div>
                    </div>
                </>
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
                        masteryLevel={topic.masteryLevel}
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
const RoadmapContainer = ({ data, roadmapId, onSubtopicToggle, onMarkAllDone, onChatTopic }) => {
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
                                    onMarkAllDone={onMarkAllDone}
                                    onChatTopic={onChatTopic}
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
                                    onMarkAllDone={onMarkAllDone}
                                    onChatTopic={onChatTopic}
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
