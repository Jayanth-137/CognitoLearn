import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import ToastContainer from '../components/ui/ToastContainer';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    /**
     * Show a toast notification
     * @param {Object|string} options - Toast options or message string
     * @param {string} options.message - Toast message
     * @param {string} options.type - Toast type: 'success' | 'error' | 'warning' | 'info' | 'alert' | 'notification'
     * @param {string} options.title - Optional custom title
     * @param {number} options.duration - Auto-dismiss duration in ms (default: 4000)
     * @param {string} type - Toast type if first param is a string
     */
    const showToast = useCallback((options, type = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        // Support both object and simple string arguments
        const toastData = typeof options === 'string'
            ? { id, message: options, type, duration: 4000 }
            : { id, type: 'info', duration: 4000, ...options };

        setToasts((prev) => [...prev, toastData]);

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id);
        }, toastData.duration);

        return id;
    }, [removeToast]);

    // Convenience methods for different toast types
    const toast = useMemo(() => ({
        // Base method
        show: showToast,

        // Success toast
        success: (message, options = {}) =>
            showToast({ message, type: 'success', ...options }),

        // Error toast
        error: (message, options = {}) =>
            showToast({ message, type: 'error', duration: 5000, ...options }),

        // Warning toast
        warning: (message, options = {}) =>
            showToast({ message, type: 'warning', ...options }),

        // Info toast
        info: (message, options = {}) =>
            showToast({ message, type: 'info', ...options }),

        // Alert toast (for important notifications)
        alert: (message, options = {}) =>
            showToast({ message, type: 'alert', duration: 6000, ...options }),

        // Special notification toast (for achievements, etc.)
        notification: (message, options = {}) =>
            showToast({ message, type: 'notification', ...options }),

        // Dismiss a specific toast
        dismiss: removeToast,

        // Dismiss all toasts
        dismissAll: () => setToasts([])
    }), [showToast, removeToast]);

    return (
        <ToastContext.Provider value={{ showToast, removeToast, toast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
