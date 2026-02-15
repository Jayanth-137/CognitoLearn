import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Circle, PlayCircle, Star } from 'lucide-react';

const RoadmapNode = ({
    id,
    title,
    status = 'locked',
    type = 'lesson',
    subtopics = [],
    onClick,
    index
}) => {
    const navigate = useNavigate();

    // Status Logic
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isActive = status === 'in-progress';
    const isMilestone = type === 'milestone';

    // Animation Variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, delay: index * 0.1 }
        }
    };

    const getStatusColor = () => {
        if (isCompleted) return 'text-green-500 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800';
        if (isActive) return 'text-indigo-600 border-indigo-500 bg-white dark:bg-slate-800 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500';
        return 'text-slate-400 border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700';
    };

    const getStatusIcon = () => {
        if (isCompleted) return <Check size={18} className="text-green-500" />;
        if (isActive) return <Circle size={18} className="text-indigo-500 fill-indigo-500" />;
        return <Lock size={18} className="text-slate-400" />;
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4 relative shrink-0"
        >
            {/* Connector Dot on the Line */}
            <div className={`
                w-4 h-4 rounded-full border-2 z-10 bg-white dark:bg-slate-900 absolute top-[5.5rem]
                ${isCompleted ? 'border-green-500 bg-green-500' : ''}
                ${isActive ? 'border-indigo-500 bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/30' : ''}
                ${isLocked ? 'border-slate-300 dark:border-slate-600' : ''}
            `} />

            {/* The Card */}
            <div
                onClick={() => !isLocked && onClick()}
                className={`
                    w-72 p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                    ${getStatusColor()}
                    ${!isLocked ? 'hover:-translate-y-1 hover:shadow-xl' : 'cursor-not-allowed opacity-80'}
                `}
            >
                {/* Header: Concept & Icon */}
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>
                        {type === 'milestone' ? 'MILESTONE' : `CONCEPT ${index + 1}`}
                    </span>
                    {getStatusIcon()}
                </div>

                {/* Title & Desc */}
                <h3 className={`text-lg font-bold mb-2 leading-tight ${isLocked ? 'text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                    {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {subtopics.length > 0 ? `Includes ${subtopics.length} topics: ${subtopics.map(s => s.title).join(', ')}` : 'Master this concept to progress.'}
                </p>

                {/* Action Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isLocked) navigate(`/quiz/${id}`);
                    }}
                    disabled={isLocked}
                    className={`
                        w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
                        ${isActive
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                            : isCompleted
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                        }
                    `}
                >
                    {isCompleted ? (
                        <>
                            <Check size={16} /> Completed
                        </>
                    ) : (
                        <>
                            {isActive ? 'Start Quiz' : 'Locked'}
                        </>
                    )}
                </button>
            </div>

            {/* Mirror Reflection / Shadow Effect (Optional polish) */}
            {isActive && (
                <div className="absolute -bottom-4 w-[90%] h-4 bg-indigo-500/20 blur-xl rounded-full" />
            )}
        </motion.div>
    );
};

export default RoadmapNode;
