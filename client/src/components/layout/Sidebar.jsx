import { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart2, Settings, Plus, X, Loader2, ClipboardList } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useRoadmaps } from '../../context/RoadmapContext';
import { useToast } from '../../context/ToastContext';
import AlertDialog from '../ui/AlertDialog';
import logo from '../../assets/logo.png';

const Sidebar = ({ isOpen, isCollapsed, onClose, toggleCollapse }) => {
    const { theme } = useTheme();
    const { roadmaps, loading, deleteRoadmap } = useRoadmaps();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // State for delete confirmation
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const handleMobileClose = () => {
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const handleRoadmapClick = (roadmapId) => {
        navigate(`/roadmap/${roadmapId}`);
        handleMobileClose();
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setDeleteId(id);
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        const result = await deleteRoadmap(deleteId);
        setShowDeleteAlert(false);
        setDeleteId(null);

        if (result.success) {
            toast.success('Roadmap deleted successfully', { title: 'Deleted' });
            // If we were on the deleted roadmap page, go home
            if (location.pathname === `/roadmap/${deleteId}`) {
                navigate('/');
            }
        } else {
            toast.error(result.error || 'Failed to delete roadmap', { title: 'Error' });
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed z-50 flex flex-col transition-all duration-300 ease-in-out
                    bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-2xl
                    
                    /* Mobile: Full height drawer from left */
                    left-0 top-0 bottom-0 rounded-none
                    lg:left-4 lg:top-3 lg:bottom-4 lg:rounded-2xl
                    
                    /* Width */
                    ${isCollapsed ? 'lg:w-20' : 'w-72 sm:w-80 lg:w-64'}
                    
                    /* Mobile visibility */
                    ${isOpen
                        ? 'translate-x-0 opacity-100'
                        : '-translate-x-full opacity-0 pointer-events-none lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto'
                    }
                `}
            >
                {/* Mobile Header with Close */}
                <div className={`p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                        {!isCollapsed && (
                            <span className="font-bold text-lg text-slate-800 dark:text-white lg:hidden">
                                CognitoLearn
                            </span>
                        )}
                    </div>

                    {/* Desktop Collapse Trigger */}
                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Desktop Expand Button (When Collapsed) */}
                {isCollapsed && (
                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:block mx-auto mt-2 p-2 text-slate-400 hover:text-slate-600"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}

                {/* Middle: New Roadmap + List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
                    {/* New Roadmap Button */}
                    <NavLink
                        to="/"
                        onClick={handleMobileClose}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg
                            ${isCollapsed ? 'justify-center px-2' : ''}
                            bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-[1.02] active:scale-95
                        `}
                        title="Create New Roadmap"
                    >
                        <Plus size={20} strokeWidth={3} />
                        {!isCollapsed && <span className="font-semibold">New Roadmap</span>}
                    </NavLink>

                    {/* Existing Roadmaps List */}
                    <div className="flex flex-col gap-2">
                        {!isCollapsed && (
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                                My Roadmaps
                            </h3>
                        )}
                        {!isCollapsed && loading && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 size={16} className="animate-spin text-slate-400" />
                            </div>
                        )}
                        {!isCollapsed && !loading && roadmaps.length === 0 && (
                            <p className="text-xs text-slate-400 px-2 py-2">No roadmaps yet</p>
                        )}
                        {!isCollapsed && roadmaps.map((roadmap) => {
                            const isActive = location.pathname === `/roadmap/${roadmap._id}`;
                            // Display only part before colon, or full title if no colon
                            const displayTitle = roadmap.title.includes(':')
                                ? roadmap.title.split(':')[0].trim()
                                : roadmap.title;
                            return (
                                <button
                                    key={roadmap._id}
                                    onClick={() => handleRoadmapClick(roadmap._id)}
                                    className={`text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium truncate
                                        ${isActive
                                            ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                    title={roadmap.title}
                                >
                                    {displayTitle}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom: Quizzes, Analytics & Settings */}
                <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-2">
                    {/* Quizzes Button */}
                    <NavLink
                        to="/quizzes"
                        onClick={handleMobileClose}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium
                            ${isCollapsed ? 'justify-center px-2' : ''}
                            ${isActive ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                        `}
                        title="Quiz History"
                    >
                        <ClipboardList size={20} />
                        {!isCollapsed && <span>Quizzes</span>}
                    </NavLink>

                    {/* Analytics Button */}
                    <NavLink
                        to="/analytics"
                        onClick={handleMobileClose}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium
                            ${isCollapsed ? 'justify-center px-2' : ''}
                            ${isActive ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                        `}
                        title="Analytics"
                    >
                        <BarChart2 size={20} />
                        {!isCollapsed && <span>Analytics</span>}
                    </NavLink>

                    {/* Settings Button */}
                    <button
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700
                            ${isCollapsed ? 'justify-center px-2' : ''}
                        `}
                        title="Settings"
                    >
                        <Settings size={20} />
                        {!isCollapsed && <span>Settings</span>}
                    </button>
                </div>
            </aside>

            {/* Delete Confirmation Alert */}
            <AlertDialog
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                onConfirm={confirmDelete}
                title="Delete Roadmap"
                description="Are you sure you want to delete this roadmap? All related quizzes and quiz attempts will also be permanently deleted. This action cannot be undone."
                type="danger"
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </>
    );
};




export default Sidebar;
