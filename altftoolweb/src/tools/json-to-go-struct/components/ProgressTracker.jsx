import { CheckCircle2, Circle, Code2 } from "lucide-react";

export default function ProgressTracker({ readiness }) {
  return (
    <div className="mb-5 min-w-0 rounded-2xl border border-(--border) bg-(--muted)/30 p-4">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-bold">
          <Code2 className="h-4 w-4 shrink-0 text-teal-400" />
          Generator readiness
        </span>
        <span className="shrink-0 text-(--muted-foreground)">{readiness.score}%</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-(--background)">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all" style={{ width: `${readiness.score}%` }} />
      </div>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {readiness.checks.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-2 rounded-xl bg-(--background)/40 px-3 py-2 text-xs">
            {item.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" /> : <Circle className="h-4 w-4 shrink-0 text-(--muted-foreground)" />}
            <span className="min-w-0 break-words">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
