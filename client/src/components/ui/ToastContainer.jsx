import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Bell, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const Toast = ({ toast, removeToast }) => {
    const { id, message, type, title, duration = 4000 } = toast;
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 50));
                if (newProgress <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return newProgress;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [duration]);

    const variants = {
        initial: { opacity: 0, x: 20, scale: 0.95 },
        animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } },
        exit: { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.15 } }
    };

    const config = {
        success: { icon: <CheckCircle size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500', title: title || 'Success' },
        error: { icon: <AlertCircle size={16} />, color: 'text-red-500', bg: 'bg-red-500', title: title || 'Error' },
        warning: { icon: <AlertTriangle size={16} />, color: 'text-amber-500', bg: 'bg-amber-500', title: title || 'Warning' },
        info: { icon: <Info size={16} />, color: 'text-blue-500', bg: 'bg-blue-500', title: title || 'Info' },
        alert: { icon: <Bell size={16} />, color: 'text-purple-500', bg: 'bg-purple-500', title: title || 'Alert' },
        notification: { icon: <Sparkles size={16} />, color: 'text-indigo-500', bg: 'bg-indigo-500', title: title || 'Notification' }
    };

    const c = config[type] || config.info;

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pointer-events-auto w-full max-w-xs overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
        >
            <div className="p-3 flex items-start gap-2.5">
                <div className={`flex-shrink-0 ${c.color}`}>{c.icon}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{c.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={() => removeToast(id)}
                    className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
            <div className="h-0.5 bg-slate-100 dark:bg-slate-700">
                <motion.div className={`h-full ${c.bg}`} style={{ width: `${progress}%` }} />
            </div>
        </motion.div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none max-w-xs w-full">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} removeToast={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
