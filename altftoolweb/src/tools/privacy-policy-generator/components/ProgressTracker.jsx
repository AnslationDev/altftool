import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";

export default function ProgressTracker({ readiness }) {
  return (
    <div className="mb-5 min-w-0 rounded-2xl border border-(--border) bg-(--background)/55 p-4">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-black">
          <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
          Policy readiness
        </span>
        <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-black text-blue-600">{readiness.score}%</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-(--muted)">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all" style={{ width: `${readiness.score}%` }} />
      </div>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {readiness.checks.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-xs">
            {item.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-(--muted-foreground)" />}
            <span className="min-w-0 break-words font-semibold">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
