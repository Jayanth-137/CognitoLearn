import { motion } from 'framer-motion';

/**
 * PageLoader - Full-page loading screen for route transitions and auth checks
 * Features animated logo and gradient spinner
 */
const PageLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Gradient glow background */}
            <motion.div
                className="absolute w-64 h-64 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Logo */}
            <motion.img
                src="/logo.png"
                alt="CognitoLearn"
                className="w-20 h-20 relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                    filter: 'drop-shadow(0 10px 25px rgba(99, 102, 241, 0.3))',
                }}
            />

            {/* Pulsing animation on logo */}
            <motion.div
                className="absolute w-20 h-20 rounded-full border-2 border-indigo-400/30"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                }}
            />

            {/* Brand name */}
            <motion.h2
                className="mt-6 text-2xl font-bold font-display text-slate-800 dark:text-white tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                CognitoLearn
            </motion.h2>

            {/* Loading message */}
            <motion.p
                className="mt-2 text-sm text-slate-500 dark:text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {message}
            </motion.p>

            {/* Spinner */}
            <motion.div
                className="mt-6 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="w-10 h-10 relative">
                    {/* Outer ring */}
                    <div
                        className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
                        style={{
                            borderTopColor: '#6366f1',
                            borderRightColor: '#a855f7',
                            animationDuration: '1s',
                        }}
                    />
                    {/* Inner ring */}
                    <div
                        className="absolute inset-[6px] rounded-full border-2 border-transparent animate-spin"
                        style={{
                            borderTopColor: '#818cf8',
                            borderRightColor: '#c084fc',
                            animationDuration: '0.8s',
                            animationDirection: 'reverse',
                        }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default PageLoader;
