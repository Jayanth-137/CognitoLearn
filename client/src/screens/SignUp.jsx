import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Briefcase, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const PROFESSIONS = [
    { value: 'student', label: 'Student' },
    { value: 'professional', label: 'Professional' },
    { value: 'educator', label: 'Educator' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'other', label: 'Other' }
];

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        profession: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const { toast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getPasswordStrength = () => {
        const { password } = formData;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { label: 'Weak', color: 'bg-red-500' },
            { label: 'Fair', color: 'bg-orange-500' },
            { label: 'Good', color: 'bg-yellow-500' },
            { label: 'Strong', color: 'bg-green-500' },
            { label: 'Very Strong', color: 'bg-emerald-500' }
        ];

        return { strength, ...levels[Math.min(strength - 1, 4)] };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error('Please fill in all required fields', { title: 'Incomplete Form' });
            return;
        }

        if (!formData.profession) {
            toast.error('Please select your profession', { title: 'Missing Info' });
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters', { title: 'Weak Password' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match', { title: 'Password Mismatch' });
            return;
        }

        setLoading(true);
        const result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            profession: PROFESSIONS.find(p => p.value === formData.profession)?.label || formData.profession
        });
        setLoading(false);

        if (result.success) {
            toast.success('Your account has been created!', { title: 'Welcome Aboard' });
            navigate('/');
        } else {
            toast.error(result.error, { title: 'Registration Failed' });
        }
    };

    const passwordStrength = getPasswordStrength();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
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
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-purple-500/40 dark:bg-purple-600/30 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-[-25%] left-[-15%] w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] bg-indigo-500/40 dark:bg-indigo-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-[30%] left-[5%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] bg-pink-500/30 dark:bg-pink-600/20 rounded-full blur-[80px] animate-blob animation-delay-4000" />
                <div className="absolute bottom-[10%] right-[15%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] bg-sky-400/30 dark:bg-sky-500/20 rounded-full blur-[70px] animate-blob animation-delay-2000" />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-3.5 rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/20 transition-all shadow-lg shadow-black/5"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Main Layout: Card + Side Text */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex items-center gap-12 lg:gap-20 relative z-10 w-full max-w-5xl px-4"
            >
                {/* Left Side - Glass Card */}
                <motion.div
                    variants={item}
                    className="relative w-full max-w-lg flex-shrink-0"
                >
                    {/* Decorative floating glass shards */}
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-white/50 to-white/20 dark:from-white/20 dark:to-white/5 rounded-2xl backdrop-blur-xl border border-white/50 dark:border-white/10 -rotate-12 hidden md:block" />
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-white/50 to-white/20 dark:from-white/20 dark:to-white/5 rounded-xl backdrop-blur-xl border border-white/50 dark:border-white/10 rotate-6 hidden md:block" />

                    <div className="backdrop-blur-2xl bg-white/50 dark:bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-2xl shadow-purple-500/10 dark:shadow-black/20 relative overflow-hidden">
                        {/* Inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5 pointer-events-none" />

                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-5">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                Join{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                                    CognitoLearn
                                </span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Create your account to begin</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                                <div className="relative group">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full pl-11 pr-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium text-sm"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full pl-11 pr-4 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium text-sm"
                                    />
                                </div>
                            </div>

                            {/* Profession */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Profession</label>
                                <div className="relative group">
                                    <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                    <select
                                        name="profession"
                                        value={formData.profession}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-10 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer text-slate-900 dark:text-white font-medium text-sm"
                                    >
                                        <option value="" className="text-slate-400">Select profession</option>
                                        {PROFESSIONS.map((prof) => (
                                            <option key={prof.value} value={prof.value} className="bg-white dark:bg-slate-800">
                                                {prof.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {/* Strength Indicator */}
                                {formData.password && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex flex-1 gap-1 h-1.5">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.strength ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500 font-semibold w-20 text-right">{passwordStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full pl-11 pr-12 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-2 rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium text-sm ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-white/60 dark:border-slate-700/60 focus:border-purple-500/50 focus:ring-purple-500/20'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-500 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-bold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={22} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-5 pt-5 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:underline underline-offset-2">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Branding Text (Hidden on mobile) */}
                <motion.div variants={item} className="hidden lg:block flex-1 text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/20 mb-6 shadow-lg shadow-purple-500/10">
                        <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Start your journey</span>
                    </div>
                    <h1 className="text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                        Join{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
                            CognitoLearn
                        </span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed max-w-md">
                        Create your account to access personalized courses, AI mentorship, and a global community of learners.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SignUp;
