export default function Badge({ children, variant = 'neutral', className = '' }) {
    const variants = {
        neutral: "bg-(--muted) text-(--muted-foreground)",
        primary: "bg-(--primary)/10 text-(--primary)",
        success: "bg-(--success-soft) text-(--success-text)",
        warning: "bg-(--warning-soft) text-(--warning-text)",
        danger: "bg-(--danger-soft) text-(--danger-text)",
        info: "bg-(--info-soft) text-(--info)"
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
