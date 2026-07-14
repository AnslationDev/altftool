export default function Panel({ title, icon: Icon, children, compact = false, className = "" }) {
  return (
    <section
      className={`animate-fade-up min-w-0 max-w-full overflow-visible rounded-xl border border-[var(--border)] bg-[var(--card)]/90 shadow-md backdrop-blur-xl transition hover:shadow-cyan-500/10 ${compact ? "p-2.5" : "p-3"} ${className}`}
    >
      <div className={`${compact ? "mb-2 gap-2" : "mb-3 gap-2.5"} flex min-w-0 items-center`}>
        <div className="shrink-0 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-1.5">
          <Icon className="h-3.5 w-3.5 text-cyan-500" />
        </div>
        <h2 className={`${compact ? "text-sm" : "text-base"} min-w-0 break-words font-black leading-tight text-[var(--foreground)]`}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
