"use client";

export default function StatsHistory({ stats, history, onApplyHistory }) {
  return (
    <section className="font-css-card p-4 sm:p-5 space-y-5">
      <div>
        <h2 className="text-lg font-black text-[var(--foreground)]">Stats</h2>
        <div className="font-css-stats-grid gap-3 mt-3" aria-live="polite" aria-atomic="true">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-3 min-w-0 overflow-hidden">
              <p className="text-[10px] uppercase tracking-normal text-[var(--muted-foreground)] font-black leading-snug whitespace-nowrap">
                {stat.label}
              </p>
              <p className="text-base sm:text-lg font-black text-[var(--foreground)] leading-tight whitespace-nowrap mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-black text-[var(--foreground)]">History</h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {history.length === 0 ? (
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)] max-w-sm">
              Copied or downloaded styles will appear here.
            </p>
          ) : (
            history.map((item) => (
              <button key={item.id} type="button" onClick={() => onApplyHistory(item.settings)} className="text-left rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 hover:border-cyan-400/70 transition min-w-0">
                <span className="block text-xs font-black text-[var(--foreground)] truncate">{item.settings.fontFamily} / {item.settings.fontWeight}</span>
                <span className="block text-[11px] text-[var(--muted-foreground)] truncate">{item.settings.text}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
