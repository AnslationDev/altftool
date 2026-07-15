import { motion } from "framer-motion";
import {
  Plus, Minus, Type, FileText, BookOpen, BarChart3,
  Hash, Target, Percent, Activity,
} from "lucide-react";

export default function AnalyticsPanel({ stats, open }) {
  if (!open) return null;

  const items = [
    { label: "Lines Added", value: stats.linesAdded, icon: Plus, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Lines Removed", value: stats.linesRemoved, icon: Minus, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
    { label: "Chars Added", value: stats.charsAdded, icon: Plus, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Chars Removed", value: stats.charsRemoved, icon: Minus, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Word Count A", value: stats.wordsA, icon: Hash, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Word Count B", value: stats.wordsB, icon: Hash, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "Reading Time A", value: `${stats.readingTimeA} min`, icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
    { label: "Reading Time B", value: `${stats.readingTimeB} min`, icon: BookOpen, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20" },
    { label: "Similarity", value: `${stats.similarity}%`, icon: Target, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Change", value: `${stats.changePercent}%`, icon: Percent, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Complexity", value: stats.complexity, icon: Activity, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-4 bg-(--card) border border-(--border) rounded-xl">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-2.5 rounded-lg bg-(--muted)"
          >
            <div className={`w-6 h-6 rounded-lg ${item.bg} flex items-center justify-center mb-1.5`}>
              <item.icon size="12" className={item.color} />
            </div>
            <p className="text-base font-bold text-(--foreground)">{item.value}</p>
            <p className="text-[10px] text-(--muted-foreground) truncate">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
