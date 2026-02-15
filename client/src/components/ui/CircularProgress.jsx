const CircularProgress = ({
    progress = 0,
    size = 64,
    strokeWidth = 6,
    showLabel = true,
    variant = 'gradient',
    className = ''
}) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        {variant === 'success' && (
                            <>
                                <stop offset="0%" stopColor="#22c55e" /> {/* green-500 */}
                                <stop offset="100%" stopColor="#10b981" /> {/* emerald-500 */}
                            </>
                        )}
                        {variant === 'danger' && (
                            <>
                                <stop offset="0%" stopColor="#ef4444" /> {/* red-500 */}
                                <stop offset="100%" stopColor="#f43f5e" /> {/* rose-500 */}
                            </>
                        )}
                        {variant === 'warning' && (
                            <>
                                <stop offset="0%" stopColor="#f59e0b" /> {/* amber-500 */}
                                <stop offset="100%" stopColor="#fbbf24" /> {/* amber-400 */}
                            </>
                        )}
                        {(variant === 'gradient' || !['success', 'danger', 'warning'].includes(variant)) && (
                            <>
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {Math.round(clampedProgress)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default CircularProgress;
