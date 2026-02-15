const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon = null,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses = "font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap";

    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    const variantClasses = {
        primary: "bg-gradient-accent text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5",
        secondary: "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary-500",
        ghost: "bg-transparent text-primary-500 hover:bg-primary-500/10",
        success: "bg-gradient-success text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5",
    };

    const disabledClasses = (disabled || loading) ? "opacity-50 cursor-not-allowed hover:transform-none" : "";

    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`;

    return (
        <button
            className={classes}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="inline-flex items-center">{icon}</span>}
                    <span>{children}</span>
                    {icon && iconPosition === 'right' && <span className="inline-flex items-center">{icon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
