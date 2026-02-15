import { motion } from 'framer-motion';

const Background = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            {/* Mesh Gradient Blobs */}
            <div className="absolute inset-0 opacity-30 dark:opacity-20">
                {/* Top Left - Purple/Indigo */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[15%] -left-[15%] w-[30vw] h-[30vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[100px] bg-purple-300 dark:bg-indigo-600"
                />

                {/* Top Right - Blue/Cyan */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -20, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[15%] -right-[15%] w-[30vw] h-[30vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[100px] bg-blue-300 dark:bg-cyan-600"
                />

                {/* Bottom Left - Pink/Fuchsia */}
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-[15%] -left-[15%] w-[30vw] h-[30vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[100px] bg-rose-300 dark:bg-fuchsia-600"
                />

                {/* Bottom Right - Violet/Blue */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-[15%] -right-[15%] w-[30vw] h-[30vw] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[100px] bg-indigo-300 dark:bg-violet-600"
                />
            </div>

            {/* Noise Overlay for Texture/Grain - Reduced opacity */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

            {/* Optional: Very subtle base grid for structure (very low opacity) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        </div>
    );
};

export default Background;
