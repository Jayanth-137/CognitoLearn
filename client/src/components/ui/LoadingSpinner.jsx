import { motion } from 'framer-motion';

/**
 * LoadingSpinner - A reusable animated spinner component
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} className - Additional classes to apply
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    const borderSizes = {
        sm: 'border-2',
        md: 'border-[3px]',
        lg: 'border-4',
        xl: 'border-4'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${sizeClasses[size]} ${className}`}
        >
            <div
                className={`w-full h-full rounded-full ${borderSizes[size]} border-transparent border-t-indigo-500 border-r-purple-500 animate-spin`}
                style={{
                    background: 'transparent',
                    borderTopColor: '#6366f1',
                    borderRightColor: '#a855f7',
                }}
            />
        </motion.div>
    );
};

export default LoadingSpinner;
