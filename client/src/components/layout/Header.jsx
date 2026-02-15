import { useState, useEffect } from 'react';
import { Flame, User, Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import AlertDialog from '../ui/AlertDialog';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useStats } from '../../context/StatsContext';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const { streak } = useStats();
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const [roadmapTitle, setRoadmapTitle] = useState('');
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const { toast } = useToast();

    // Fetch roadmap title when on roadmap page with ID
    useEffect(() => {
        const fetchRoadmapTitle = async () => {
            // Check if we're on a roadmap page with an ID
            const pathMatch = location.pathname.match(/^\/roadmap\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
                try {
                    const response = await api.get(`/roadmaps/${pathMatch[1]}`);
                    if (response.data.success) {
                        setRoadmapTitle(response.data.roadmap.title);
                    }
                } catch (err) {
                    console.error('Failed to fetch roadmap title:', err);
                    setRoadmapTitle('Roadmap');
                }
            } else {
                setRoadmapTitle('');
            }
        };

        fetchRoadmapTitle();
    }, [location.pathname]);



    // Calculate Dynamic Title
    const getPageTitle = () => {
        const path = location.pathname;

        // Show roadmap title when on roadmap page
        if (path.startsWith('/roadmap/') && roadmapTitle) {
            return roadmapTitle;
        }

        switch (path) {
            case '/': return 'Home';
            case '/analytics': return 'Analytics';
            case '/roadmap': return 'Roadmap';
            case '/mentor': return 'AI Mentor';
            case '/profile': return 'Profile';
            case '/summarizer': return 'Summarizer';
            default:
                if (path.startsWith('/quiz')) return 'Quiz';
                return 'CognitoLearn';
        }
    };

    const handleLogout = () => {
        setShowLogoutAlert(true);
    };

    const confirmLogout = () => {
        setShowLogoutAlert(false);
        logout();
        navigate('/login');
        toast.success('Logged out successfully', { title: 'Logout' });
    };

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    return (
        <header className="sticky top-2 sm:top-3 z-30 mx-2 sm:mx-4 lg:mx-8 mb-3 sm:mb-4 h-14 sm:h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between
            bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-lg shadow-slate-200/20 dark:shadow-black/20">

            {/* 1. Left: Mobile Toggle + Website Name */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <span className="sr-only">Toggle Sidebar</span>
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Website Name - Gradient & Clickable */}
                <button
                    onClick={() => navigate('/')}
                    className="text-lg sm:text-xl font-bold font-display tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                    CognitoLearn
                </button>
            </div>

            {/* Centered Page Title / Dynamic Roadmap Name - Hidden on mobile */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-sm md:text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 font-display whitespace-nowrap hidden md:block max-w-[200px] lg:max-w-none truncate">
                {getPageTitle()}
            </h1>

            {/* 2 & 3. Right: Streak, Theme & Profile */}
            <div className="flex items-center gap-2 sm:gap-4">

                {/* Streak - Compact on mobile */}
                {/* Streak - Compact on mobile */}
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50">
                    <Flame size={16} className={`fill-orange-500 text-orange-500 ${streak === 0 ? 'grayscale opacity-50' : ''}`} />
                    <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">
                        <span className="hidden sm:inline">{streak} Day{streak !== 1 ? 's' : ''}</span>
                        <span className="sm:hidden">{streak}</span>
                    </span>
                </div>

                {/* Divider - hidden on mobile */}
                <div className="h-6 sm:h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {/* Profile Button with Hover Tooltip */}
                <div className="relative group">
                    <button className="flex items-center gap-2 focus:outline-none">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-800 shadow-md">
                            <span className="font-bold text-xs sm:text-sm">{getInitials()}</span>
                        </div>
                    </button>

                    {/* Hover Tooltip / Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50 p-3 sm:p-4">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                                <span className="font-bold text-sm">{getInitials()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.profession || 'Learner'}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Email:</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{user?.email || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Member since:</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                        </div>
                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>


            {/* Logout Confirmation Alert */}
            <AlertDialog
                isOpen={showLogoutAlert}
                onClose={() => setShowLogoutAlert(false)}
                onConfirm={confirmLogout}
                title="Log Out"
                description="Are you sure you want to log out of your account? You will need to sign in again to access your roadmaps."
                type="logout"
                confirmLabel="Log Out"
                cancelLabel="Cancel"
            />
        </header >
    );
};

export default Header;
