import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X, PartyPopper } from 'lucide-react';

/**
 * CelebrationModal - Premium glassmorphic achievement unlock
 */
const CelebrationModal = ({
    isOpen,
    onClose,
    title = "Congratulations!",
    message,
    stats = [],
    buttonText = "Keep Learning!",
    autoClose = true,
    autoCloseDuration = 5000
}) => {
    // Auto-close logic
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => onClose?.(), autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDuration, onClose]);

    // Particle configuration
    const particleCount = 20;
    const particles = Array.from({ length: particleCount });

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Ambient Glow Behind Modal */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 via-purple-500/30 to-pink-500/30 blur-3xl rounded-full transform scale-125 opacity-70 animate-pulse" />

                        {/* Glass Card */}
                        <div className="relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 p-1 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">

                            {/* Inner Content Container */}
                            <div className="bg-gradient-to-b from-white/60 to-white/30 dark:from-slate-800/40 dark:to-slate-900/40 rounded-[1.4rem] p-8 text-center relative overflow-hidden">

                                {/* Shine Effect */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent skew-x-12 opacity-50" />

                                {/* Subtle Floating Particles */}
                                {particles.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            x: Math.random() * 300 - 150,
                                            y: Math.random() * 300 - 150,
                                            scale: 0
                                        }}
                                        animate={{
                                            y: [null, Math.random() * -100],
                                            opacity: [0, 1, 0],
                                            scale: [0, Math.random() * 0.5 + 0.5, 0]
                                        }}
                                        transition={{
                                            duration: Math.random() * 2 + 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute w-2 h-2 rounded-full bg-yellow-400/60 dark:bg-yellow-400 blur-[1px]"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)'
                                        }}
                                    />
                                ))}

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors z-20"
                                >
                                    <X size={18} />
                                </button>

                                {/* Trophy Section */}
                                <div className="relative mb-6">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                        className="w-28 h-28 mx-auto bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 relative z-10"
                                    >
                                        <div className="absolute inset-1 rounded-full border border-white/30" />
                                        <Trophy size={56} className="text-white drop-shadow-md" />
                                    </motion.div>

                                    {/* Rotating Halo */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-dashed border-amber-500/30 rounded-full"
                                    />
                                </div>

                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 dark:from-amber-200 dark:via-yellow-400 dark:to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
                                        {title}

                                    </h2>

                                    <div
                                        className="text-slate-600 dark:text-slate-300 mb-8 max-w-[80%] mx-auto leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: message }}
                                    />
                                </motion.div>

                                {/* Stats Grid */}
                                {stats.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="grid grid-cols-3 gap-2 mb-8 bg-slate-50/50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5"
                                    >
                                        {stats.map((stat, i) => (
                                            <div key={i} className="flex flex-col items-center justify-center">
                                                <span className={`text-xl font-bold ${stat.color || 'text-indigo-500 dark:text-indigo-400'}`}>
                                                    {stat.value}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mt-1">
                                                    {stat.label}
                                                </span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Action Button */}
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={onClose}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-bold text-lg shadow-xl shadow-indigo-600/20 overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {buttonText} <Sparkles size={18} />
                                    </span>

                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                                </motion.button>

                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CelebrationModal;
