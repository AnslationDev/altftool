import { CheckCircle2, XCircle } from "lucide-react";
import { getScoreColor, getScoreTone, getSignalTone } from "./healthFormatters";

export function StatusBadge({ ok, label }) {
  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${getSignalTone(ok)}`}>
      {label}
    </span>
  );
}

export function ScoreRing({ score }) {
  const color = getScoreColor(score);

  return (
    <div
      className="relative grid h-28 w-28 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${score * 3.6}deg, var(--border) 0deg)`,
      }}
      aria-label={`Score ${score}`}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--surface)]">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">{score}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Score</p>
        </div>
      </div>
    </div>
  );
}

export function ScoreBar({ score }) {
  return (
    <div className="mt-4 h-2 w-full overflow-hidden rounded bg-[var(--surface-soft)]">
      <div
        className="h-full rounded transition-[width] duration-300"
        style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
      />
    </div>
  );
}

export function MetricCard({ title, value, helper, score, icon: Icon }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{value}</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--surface-soft)] text-[var(--foreground)]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 min-h-10 text-sm leading-5 text-[var(--muted)]">{helper}</p>
      <div className={`mt-3 inline-flex rounded border px-2 py-1 text-xs font-semibold ${getScoreTone(score)}`}>
        {score}/100
      </div>
      <ScoreBar score={score} />
    </div>
  );
}

export function CheckList({ title, icon: Icon, items }) {
  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--surface-soft)] text-[var(--foreground)]">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-[var(--foreground)]">{title}</h2>
      </div>

      <div className="mt-4 divide-y divide-[var(--border)]">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
              {item.detail && <p className="mt-1 break-words text-xs text-[var(--muted)]">{item.detail}</p>}
            </div>
            {item.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-[var(--danger)]" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DetailTile({ label, value, tone = "gray", mono = false }) {
  const tones = {
    gray: "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]",
    emerald: "border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success)]",
    amber: "border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--warning)]",
    rose: "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--danger)]",
  };

  return (
    <div className={`min-w-0 rounded-md border p-3 ${tones[tone] || tones.gray}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className={`mt-2 break-words text-sm font-bold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export function SparkBars({ points = [] }) {
  const safePoints = points.slice(-8);

  return (
    <div className="mt-3 flex h-10 items-end gap-1" aria-hidden="true">
      {safePoints.length ? (
        safePoints.map((point, index) => (
          <div
            key={`${point.generatedAt || index}-${point.score}`}
            className={`w-full rounded-sm ${
              point.score >= 90 ? "bg-[var(--success)]" : point.score >= 75 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"
            }`}
            style={{ height: `${Math.max(8, Math.min(40, Number(point.score || 0) * 0.4))}px` }}
          />
        ))
      ) : (
        <div className="h-2 w-full rounded bg-[var(--surface-soft)]" />
      )}
    </div>
  );
}
