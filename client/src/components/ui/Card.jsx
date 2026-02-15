const Card = ({
    children,
    variant = 'glass',
    className = '',
    onClick,
    hoverable = true
}) => {
    const baseClasses = "rounded-2xl p-6 transition-all duration-300 relative overflow-hidden";

    const variantClasses = {
        glass: "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md shadow-lg",
        solid: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md",
        gradient: "bg-gradient-accent text-white border-none",
    };

    const hoverClasses = hoverable
        ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        : "";

    // Gradient border effect for glass cards
    const gradientBorder = variant === 'glass' ? (
        <div
            className="absolute inset-0 rounded-2xl p-[1px] -z-10 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-slate-600/50 dark:via-slate-800/30 dark:to-transparent pointer-events-none"
            style={{
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
            }}
        />
    ) : null;

    const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;

    return (
        <div className={classes} onClick={onClick}>
            {gradientBorder}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};

export default Card;
