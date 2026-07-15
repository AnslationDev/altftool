import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, RotateCcw, Star, Activity } from "lucide-react";

export default function StatisticsCard({ stats, history, entries }) {
  const items = [
    {
      label: "Total Spins",
      value: stats.totalSpins,
      icon: RotateCcw,
      color: "text-(--primary)",
      bg: "bg-(--primary-soft)",
    },
    {
      label: "Most Selected",
      value: stats.mostSelected?.name || "—",
      sub: stats.mostSelected ? `${stats.mostSelected.count}x` : "",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Least Selected",
      value: stats.leastSelected?.name || "—",
      sub: stats.leastSelected ? `${stats.leastSelected.count}x` : "",
      icon: Target,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Entries",
      value: entries.length,
      icon: Activity,
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="p-3 rounded-xl bg-(--muted) border border-(--border)"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
              <item.icon size="14" className={item.color} />
            </div>
          </div>
          <p className="text-lg font-bold text-(--foreground) truncate">{item.value}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-xs text-(--muted-foreground) truncate">{item.label}</p>
            {item.sub && <span className="text-xs font-medium text-(--muted-foreground)">{item.sub}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
