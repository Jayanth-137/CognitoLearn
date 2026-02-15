import { motion } from 'framer-motion';

/**
 * ContentLoader - Skeleton loading component for content areas
 * @param {string} variant - 'card' | 'list' | 'text' | 'avatar'
 * @param {number} count - Number of skeleton items to show
 */
const ContentLoader = ({ variant = 'card', count = 1, className = '' }) => {
    const shimmerClass = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]';

    const renderSkeleton = (index) => {
        switch (variant) {
            case 'card':
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50"
                    >
                        <div className={`h-4 w-3/4 rounded ${shimmerClass} mb-4`} />
                        <div className={`h-3 w-full rounded ${shimmerClass} mb-2`} />
                        <div className={`h-3 w-5/6 rounded ${shimmerClass} mb-4`} />
                        <div className={`h-8 w-24 rounded-lg ${shimmerClass}`} />
                    </motion.div>
                );

            case 'list':
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60"
                    >
                        <div className={`w-10 h-10 rounded-lg ${shimmerClass}`} />
                        <div className="flex-1">
                            <div className={`h-4 w-2/3 rounded ${shimmerClass} mb-2`} />
                            <div className={`h-3 w-1/2 rounded ${shimmerClass}`} />
                        </div>
                    </motion.div>
                );

            case 'text':
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="space-y-2"
                    >
                        <div className={`h-4 w-full rounded ${shimmerClass}`} />
                        <div className={`h-4 w-11/12 rounded ${shimmerClass}`} />
                        <div className={`h-4 w-4/5 rounded ${shimmerClass}`} />
                    </motion.div>
                );

            case 'avatar':
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <div className={`w-12 h-12 rounded-full ${shimmerClass}`} />
                        <div className="flex-1">
                            <div className={`h-4 w-24 rounded ${shimmerClass} mb-2`} />
                            <div className={`h-3 w-16 rounded ${shimmerClass}`} />
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }, (_, i) => renderSkeleton(i))}
        </div>
    );
};

/**
 * InlineLoader - Small inline loader for buttons and text
 */
export const InlineLoader = ({ text = 'Loading', className = '' }) => {
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <motion.span
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-current"
                        animate={{
                            y: [0, -4, 0],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </motion.span>
            {text}
        </span>
    );
};

export default ContentLoader;
