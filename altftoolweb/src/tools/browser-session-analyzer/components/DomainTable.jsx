import { Globe, ExternalLink, AlertTriangle } from "lucide-react";

export default function DomainTable({ tabs, filteredTabs, stats }) {
  if (tabs.length === 0) return null;

  return (
    <div className="rounded-xl border border-(--border) overflow-hidden">
      <div className="px-3 py-2 bg-(--muted) border-b border-(--border) flex items-center gap-1.5">
        <Globe size="14" className="text-(--muted-foreground)" />
        <span className="text-xs font-semibold text-(--foreground)">Top Domains</span>
      </div>
      <div className="p-3">
        <div className="space-y-1">
          {stats.topDomains.map((d, i) => {
            const maxCount = stats.topDomains[0]?.count || 1;
            const pct = (d.count / maxCount) * 100;
            return (
              <div key={d.domain} className="flex items-center gap-2 text-sm">
                <span className="w-5 text-xs text-(--muted-foreground) font-mono">{i + 1}</span>
                <span className="w-3 h-3 rounded-sm flex items-center justify-center text-[8px] font-bold"
                  style={{ background: `hsl(${i * 35}, 70%, 50%)` }}
                />
                <span className="flex-1 text-(--foreground) truncate">{d.domain}</span>
                <span className="text-xs text-(--muted-foreground) font-mono">{d.count}</span>
                <div className="w-16 h-1.5 rounded-full bg-(--border) overflow-hidden">
                  <div className="h-full rounded-full bg-(--primary)" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
