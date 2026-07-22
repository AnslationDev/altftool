import { KOOTA_INFO } from "../constants";

export default function KootaDetail({ koota }) {
  const info = KOOTA_INFO[koota.name];
  const pct = koota.max > 0 ? Math.round((koota.score / koota.max) * 100) : 0;
  const isFull = koota.score >= koota.max;
  const isEmpty = koota.score === 0;

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${
      isFull ? "border-emerald-500/30 bg-emerald-500/5"
        : isEmpty ? "border-rose-500/30 bg-rose-500/5"
        : "border-[var(--border)] bg-[var(--card)]"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-extrabold ${
              isFull ? "text-emerald-600" : isEmpty ? "text-rose-600" : "text-[var(--foreground)]"
            }`}>
              {koota.name}
            </span>
            <span className="shrink-0 text-sm font-bold text-[var(--muted-foreground)]">
              {koota.score}/{koota.max}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{info?.desc || ""}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--section-highlight)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFull ? "bg-emerald-500" : isEmpty ? "bg-rose-500" : "bg-[var(--primary)]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
