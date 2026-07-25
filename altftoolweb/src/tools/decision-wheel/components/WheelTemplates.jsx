"use client";

import { motion } from "framer-motion";
import { Film, UtensilsCrossed, Gamepad2, ClipboardList, Dumbbell, Globe, Sparkles } from "lucide-react";

const TEMPLATES_LIST = [
  { key: "movies", label: "Movie Picker", icon: Film, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  { key: "food", label: "Food Picker", icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { key: "games", label: "Game Picker", icon: Gamepad2, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
  { key: "tasks", label: "Task Picker", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { key: "workout", label: "Workout Picker", icon: Dumbbell, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { key: "travel", label: "Travel Picker", icon: Globe, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
];

export default function WheelTemplates({ onSelect }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size="14" className="text-(--muted-foreground)" />
        <span className="text-xs font-semibold text-(--foreground)">Templates</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {TEMPLATES_LIST.map((template, i) => (
          <motion.button
            key={template.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(template.key)}
            className="flex items-center gap-2 p-2 min-h-11 rounded-lg border border-(--border) bg-(--card) hover:bg-(--muted) hover:border-(--border-strong) transition text-left active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            <div className={`w-7 h-7 rounded-lg ${template.bg} flex items-center justify-center`}>
              <template.icon size="14" className={template.color} />
            </div>
            <span className="text-xs font-medium text-(--foreground)">{template.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
