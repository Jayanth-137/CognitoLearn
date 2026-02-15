import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, ChevronRight, Trash2 } from 'lucide-react';
import AlertDialog from '../ui/AlertDialog';

const RoadmapCard = ({
    id,
    title,
    description,
    color = 'from-indigo-500 to-purple-500',
    progress = 0,
    totalTopics = 0,
    completedTopics = 0,
    onClick,
    onDelete
}) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const leftTopics = totalTopics - completedTopics;

    // Determine status
    const isNotStarted = progress === 0;
    const isInProgress = progress > 0 && progress < 100;
    const isCompleted = progress === 100;

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        await onDelete(id);
        setIsDeleting(false);
        setShowDeleteDialog(false);
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onClick(id)}
                className="cursor-pointer group"
            >
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
                    {/* Content */}
                    <div className="p-5">
                        {/* Header: Title + Actions */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {title}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                {/* Delete Button - appears on hover */}
                                {onDelete && (
                                    <button
                                        onClick={handleDeleteClick}
                                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete roadmap"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <ChevronRight
                                    size={20}
                                    className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                                />
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                            {description}
                        </p>

                        {/* Topic Count */}
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                            <Target size={14} className="text-slate-400" />
                            <span>{totalTopics} topics</span>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        {completedTopics} done
                                    </span>
                                    {leftTopics > 0 && (
                                        <>
                                            <span className="text-slate-300 dark:text-slate-600">•</span>
                                            <span className="text-slate-500">{leftTopics} left</span>
                                        </>
                                    )}
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                                />
                            </div>
                        </div>

                        {/* Status Badge + Hover Action */}
                        <div className="mt-4 flex items-center justify-between">
                            <AnimatePresence mode="wait">
                                {isNotStarted && (
                                    <motion.span
                                        key="not-started"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                    >
                                        Not Started
                                    </motion.span>
                                )}
                                {isInProgress && (
                                    <motion.span
                                        key="in-progress"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                                    >
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                        In Progress
                                    </motion.span>
                                )}
                                {isCompleted && (
                                    <motion.span
                                        key="completed"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center gap-1"
                                    >
                                        <Trophy size={12} />
                                        Completed
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Hover Action Text */}
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isNotStarted ? 'Start Learning →' : isCompleted ? 'Review →' : 'Continue →'}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
                type="danger"
                title="Delete Roadmap"
                description={`Are you sure you want to delete "${title}"? All related quizzes and quiz attempts will also be permanently deleted. This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isLoading={isDeleting}
            />
        </>
    );
};

export default RoadmapCard;
