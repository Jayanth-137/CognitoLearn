const ProgressBar = ({
    progress = 0,
    showLabel = true,
    variant = 'gradient',
    height = 'md',
    className = ''
}) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    const heightClasses = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
    };

    const variantClasses = {
        gradient: "bg-gradient-accent",
        success: "bg-gradient-success",
        warning: "bg-gradient-warning",
    };

    return (
        <div className={`w-full ${className}`}>
            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative ${heightClasses[height]}`}>
                <div
                    className={`${heightClasses[height]} ${variantClasses[variant]} rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2 relative`}
                    style={{ width: `${clampedProgress}%` }}
                >
                    {showLabel && height !== 'sm' && (
                        <span className="text-xs font-semibold text-white absolute right-2">
                            {Math.round(clampedProgress)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
