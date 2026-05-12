export default function Badge({ children, variant = 'neutral', className = '' }) {
    const variants = {
        neutral: "bg-(--muted) text-(--muted-foreground)",
        primary: "bg-(--primary)/10 text-(--primary)",
        success: "bg-(--primary)/10 text-(--primary)",
        warning: "bg-(--primary)/10 text-(--primary)",
        danger: "bg-(--primary)/10 text-(--primary)",
        info: "bg-(--primary)/10 text-(--primary)"
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
