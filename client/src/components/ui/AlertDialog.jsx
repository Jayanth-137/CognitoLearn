import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, Check, LogOut } from 'lucide-react';

const AlertDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'danger',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading = false
}) => {
    const config = {
        danger: { icon: AlertTriangle, color: 'text-red-500', btnBg: 'bg-red-500 hover:bg-red-600' },
        warning: { icon: AlertTriangle, color: 'text-amber-500', btnBg: 'bg-amber-500 hover:bg-amber-600' },
        info: { icon: Info, color: 'text-blue-500', btnBg: 'bg-blue-500 hover:bg-blue-600' },
        success: { icon: Check, color: 'text-green-500', btnBg: 'bg-green-500 hover:bg-green-600' },
        logout: { icon: LogOut, color: 'text-red-500', btnBg: 'bg-red-500 hover:bg-red-600' }
    };

    const style = config[type] || config.info;
    const Icon = style.icon;

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-5">
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${style.color}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                        {title}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-1.5 ${style.btnBg} ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AlertDialog;
