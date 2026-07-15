export default function Panel({ title, icon: Icon, children, compact = false }) {
  return (
    <section
      className={`relative z-10 min-w-0 max-w-full overflow-hidden rounded-xl border border-(--border) bg-(--background) text-(--foreground) ${
        compact ? "p-3" : "p-3 sm:p-4"
      }`}
    >
      <div className={`${compact ? "mb-2 gap-2" : "mb-3 gap-2.5"} flex min-w-0 items-center`}>
        <div className="shrink-0 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-1.5">
          <Icon className="h-4 w-4 text-cyan-500" />
        </div>
        <h2 className={`${compact ? "text-sm" : "text-base"} min-w-0 break-words font-black leading-tight text-(--foreground) [overflow-wrap:anywhere]`}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
