export default function KootaCard({ koota }) {
  const fillPercent = koota.max > 0 ? Math.round((koota.score / koota.max) * 100) : 0;
  const isFull = koota.score >= koota.max && koota.max > 0;
  const isEmpty = koota.score === 0 && koota.max > 0;

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-all ${
      isFull
        ? "border-emerald-500/30 bg-emerald-500/5"
        : isEmpty
        ? "border-rose-500/30 bg-rose-500/5"
        : "border-[var(--border)] bg-[var(--card)]"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{koota.name}</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{koota.desc}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className={`text-2xl font-extrabold ${
            isFull ? "text-emerald-600" : isEmpty ? "text-rose-600" : "text-[var(--foreground)]"
          }`}>
            {koota.score}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">/{koota.max}</span>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--section-highlight)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFull ? "bg-emerald-500" : isEmpty ? "bg-rose-500" : "bg-[var(--primary)]"
          }`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}
