import { Clock, Sun } from "lucide-react";

export default function MuhurtaCard({ muhurtas }) {
  if (!muhurtas || muhurtas.length === 0) return null;

  const getBadge = (name) => {
    if (name.includes("Rahu") || name.includes("Yamaganda") || name.includes("Gulik"))
      return { class: "bg-rose-500/10 text-rose-600", dot: "bg-rose-500" };
    return { class: "bg-emerald-500/10 text-emerald-600", dot: "bg-emerald-500" };
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
        <Clock className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Daily Timings</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {muhurtas.map((m, i) => {
          const badge = getBadge(m.name);
          return (
            <div key={i} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{m.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{m.description}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.class}`}>
                  {m.start} – {m.end}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
