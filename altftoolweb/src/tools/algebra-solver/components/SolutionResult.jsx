import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function SolutionResult({ result }) {
  if (!result) return null;

  const config = {
    unique: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Solution Found" },
    repeated: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Repeated Root" },
    two: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Two Solutions" },
    none: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-500/10", label: "No Solution" },
    infinite: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10", label: "Infinite Solutions" },
    complex: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10", label: "Complex Roots" },
    error: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-500/10", label: "Error" },
  };

  const c = config[result.type] || config.error;
  const Icon = c.icon;

  return (
    <div className={`rounded-2xl border ${c.bg} p-6`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.color}`} />
        </div>
        <div>
          <p className={`text-sm font-bold ${c.color}`}>{c.label}</p>
        </div>
      </div>

      {result.solutions && result.solutions.length > 0 && (
        <div className="space-y-2">
          {result.solutions.map((s, i) => (
            <div key={i} className="flex items-baseline gap-3 rounded-xl bg-[var(--background)] p-4">
              <span className="font-mono text-sm font-bold text-[var(--muted-foreground)]">{s.var} =</span>
              <span className="text-2xl font-extrabold text-[var(--foreground)]">{s.value}</span>
              {s.exact && s.exact !== String(s.value) && (
                <span className="font-mono text-sm text-[var(--muted-foreground)]">(exact: {s.exact})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
