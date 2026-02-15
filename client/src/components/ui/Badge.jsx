const Badge = ({
    children,
    variant = 'info',
    size = 'md',
    className = ''
}) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-full whitespace-nowrap";

    const sizeClasses = {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-1.5 text-sm",
        lg: "px-5 py-2 text-base",
    };

    const variantClasses = {
        success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
        error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        primary: "bg-gradient-accent text-white",
        neutral: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600",
    };

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    return (
        <span className={classes}>
            {children}
        </span>
    );
};

export default Badge;
