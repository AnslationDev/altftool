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
        background: `conic-gradient(${color} ${score * 3.6}deg, #e5e7eb 0deg)`,
      }}
      aria-label={`Score ${score}`}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-950">{score}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Score</p>
        </div>
      </div>
    </div>
  );
}

export function ScoreBar({ score }) {
  return (
    <div className="mt-4 h-2 w-full overflow-hidden rounded bg-gray-100">
      <div
        className="h-full rounded transition-[width] duration-300"
        style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
      />
    </div>
  );
}

export function MetricCard({ title, value, helper, score, icon: Icon }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 min-h-10 text-sm leading-5 text-gray-500">{helper}</p>
      <div className={`mt-3 inline-flex rounded border px-2 py-1 text-xs font-semibold ${getScoreTone(score)}`}>
        {score}/100
      </div>
      <ScoreBar score={score} />
    </div>
  );
}

export function CheckList({ title, icon: Icon, items }) {
  return (
    <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-gray-950">{title}</h2>
      </div>

      <div className="mt-4 divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              {item.detail && <p className="mt-1 break-words text-xs text-gray-500">{item.detail}</p>}
            </div>
            {item.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DetailTile({ label, value, tone = "gray", mono = false }) {
  const tones = {
    gray: "border-gray-100 bg-gray-50 text-gray-950",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-950",
    amber: "border-amber-100 bg-amber-50 text-amber-950",
    rose: "border-rose-100 bg-rose-50 text-rose-950",
  };

  return (
    <div className={`min-w-0 rounded-md border p-3 ${tones[tone] || tones.gray}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
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
              point.score >= 90 ? "bg-emerald-500" : point.score >= 75 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ height: `${Math.max(8, Math.min(40, Number(point.score || 0) * 0.4))}px` }}
          />
        ))
      ) : (
        <div className="h-2 w-full rounded bg-gray-200" />
      )}
    </div>
  );
}
