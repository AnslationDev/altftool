"use client";

import { motion } from "framer-motion";

const categoryColors = {
  "AI": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  "Development": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  "Education": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  "Shopping": { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
  "Social Media": { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300" },
  "Entertainment": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  "Finance": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  "News": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  "Productivity": { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
  "Design": { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  "Gaming": { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
  "Research": { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300" },
  "Travel": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  "Other": { bg: "bg-(--muted)", text: "text-(--muted-foreground)" },
};

export default function CategoryPanel({ categories, active, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onSelect("all")}
        aria-pressed={active === "all"}
        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) active:scale-[0.98] motion-reduce:active:scale-100 ${
          active === "all"
            ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
            : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
        }`}
      >
        All ({categories.reduce((s, c) => s + c.count, 0)})
      </button>
      {categories.map((cat) => {
        const colors = categoryColors[cat.name] || categoryColors.Other;
        return (
          <button
            key={cat.name}
            onClick={() => onSelect(cat.name)}
            aria-pressed={active === cat.name}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) active:scale-[0.98] motion-reduce:active:scale-100 ${
              active === cat.name
                ? `${colors.bg} ${colors.text} border-transparent`
                : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        );
      })}
    </div>
  );
}
