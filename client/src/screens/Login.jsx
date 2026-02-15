import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { toast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields', { title: 'Missing Credentials' });
            return;
        }

        setLoading(true);
        const result = await login(email, password, rememberMe);
        setLoading(false);

        if (result.success) {
            toast.success('Welcome back to CognitoLearn!', { title: 'Login Successful' });
            navigate('/');
        } else {
            console.log(result.error);
            toast.error(result.error, { title: 'Login Failed' });
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-500">

            {/* Animated Gradient Orbs Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-indigo-500/40 dark:bg-indigo-600/30 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-[-30%] right-[-20%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-purple-500/40 dark:bg-purple-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-pink-500/30 dark:bg-pink-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
                <div className="absolute bottom-[20%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-sky-400/30 dark:bg-sky-500/20 rounded-full blur-[80px] animate-blob animation-delay-2000" />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-3.5 rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/20 transition-all shadow-lg shadow-black/5"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Main Layout: Side Text + Card */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex items-center gap-12 lg:gap-20 relative z-10 w-full max-w-5xl px-4"
            >
                {/* Left Side - Branding Text (Hidden on mobile) */}
                <motion.div variants={item} className="hidden lg:block flex-1 text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/20 mb-6 shadow-lg shadow-indigo-500/10">
                        <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Welcome back!</span>
                    </div>
                    <h1 className="text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                        Sign in to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                            CognitoLearn
                        </span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed max-w-md">
                        Continue your learning journey with AI-powered courses and personalized mentorship.
                    </p>
                </motion.div>

                {/* Right Side - Glass Card */}
                <motion.div
                    variants={item}
                    className="relative w-full max-w-md flex-shrink-0"
                >
                    {/* Decorative floating glass shards */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-white/50 to-white/20 dark:from-white/20 dark:to-white/5 rounded-2xl backdrop-blur-xl border border-white/50 dark:border-white/10 rotate-12 hidden md:block" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-gradient-to-br from-white/50 to-white/20 dark:from-white/20 dark:to-white/5 rounded-xl backdrop-blur-xl border border-white/50 dark:border-white/10 -rotate-6 hidden md:block" />

                    <div className="backdrop-blur-2xl bg-white/50 dark:bg-slate-900/50 p-8 md:p-10 rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/10 dark:shadow-black/20 relative overflow-hidden">
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5 pointer-events-none" />

                        {/* Mobile Header (visible only on small screens) */}
                        <div className="lg:hidden text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                Sign in to{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                    CognitoLearn
                                </span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Continue your learning journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-11 pr-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium text-sm"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
                                </label>
                                <button type="button" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={22} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-2">
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
