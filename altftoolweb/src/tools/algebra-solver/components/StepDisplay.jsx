import { Info } from "lucide-react";

export default function StepDisplay({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Step-by-Step Solution</h3>
      </div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
              {i + 1}
            </span>
            <span className="pt-0.5 font-mono text-sm text-[var(--foreground)]">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
