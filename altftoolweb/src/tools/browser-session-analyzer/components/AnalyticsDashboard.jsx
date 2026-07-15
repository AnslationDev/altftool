import { motion } from "framer-motion";
import {
  Globe, AlertTriangle, ShieldCheck, Brain, Target, Layers,
} from "lucide-react";

export default function AnalyticsDashboard({ stats }) {
  if (!stats) return null;

  const healthColor = stats.healthScore >= 70 ? "text-green-500" : stats.healthScore >= 40 ? "text-amber-500" : "text-red-500";
  const focusColor = stats.focusScore >= 70 ? "text-green-500" : stats.focusScore >= 40 ? "text-amber-500" : "text-red-500";

  const items = [
    { label: "Total Tabs", value: stats.totalTabs, icon: Layers, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Unique Domains", value: stats.uniqueDomains, icon: Globe, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
    { label: "Duplicates", value: stats.duplicateUrls, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Broken URLs", value: stats.brokenUrls, icon: AlertTriangle, color: stats.brokenUrls > 0 ? "text-red-500" : "text-green-500", bg: stats.brokenUrls > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20" },
    { label: "HTTP (not HTTPS)", value: stats.httpUrls, icon: ShieldCheck, color: stats.httpUrls > 0 ? "text-amber-500" : "text-green-500", bg: stats.httpUrls > 0 ? "bg-amber-50" : "bg-green-50 dark:bg-green-900/20" },
    { label: "Est. Memory", value: formatMemory(stats.estimatedMemory), icon: Brain, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-3 rounded-xl bg-(--muted) border border-(--border)"
          >
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-1.5`}>
              <item.icon size="16" className={item.color} />
            </div>
            <p className="text-lg font-bold text-(--foreground)">{item.value}</p>
            <p className="text-[10px] text-(--muted-foreground)">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-(--muted) border border-(--border) text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ShieldCheck size="14" className={healthColor} />
            <span className="text-xs font-semibold text-(--foreground)">Health</span>
          </div>
          <div className="w-full h-2 rounded-full bg-(--border) overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stats.healthScore}%`,
                background: stats.healthScore >= 70 ? "var(--anslation-ds-success)" : stats.healthScore >= 40 ? "var(--anslation-ds-warning)" : "var(--anslation-ds-danger)",
              }}
            />
          </div>
          <p className={`text-lg font-bold mt-1 ${healthColor}`}>{stats.healthScore}%</p>
        </div>
        <div className="p-3 rounded-xl bg-(--muted) border border-(--border) text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Target size="14" className={focusColor} />
            <span className="text-xs font-semibold text-(--foreground)">Focus</span>
          </div>
          <div className="w-full h-2 rounded-full bg-(--border) overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stats.focusScore}%`,
                background: stats.focusScore >= 70 ? "var(--anslation-ds-success)" : stats.focusScore >= 40 ? "var(--anslation-ds-warning)" : "var(--anslation-ds-danger)",
              }}
            />
          </div>
          <p className={`text-lg font-bold mt-1 ${focusColor}`}>{stats.focusScore}%</p>
        </div>
        <div className="p-3 rounded-xl bg-(--muted) border border-(--border) text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <AlertTriangle size="14" className="text-amber-500" />
            <span className="text-xs font-semibold text-(--foreground)">Clutter</span>
          </div>
          <div className="w-full h-2 rounded-full bg-(--border) overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stats.clutterScore}%`,
                background: stats.clutterScore <= 30 ? "var(--anslation-ds-success)" : stats.clutterScore <= 60 ? "var(--anslation-ds-warning)" : "var(--anslation-ds-danger)",
              }}
            />
          </div>
          <p className="text-lg font-bold mt-1 text-amber-500">{stats.clutterScore}%</p>
        </div>
      </div>
    </div>
  );
}

function formatMemory(mb) {
  if (mb < 1024) return `${mb} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}
