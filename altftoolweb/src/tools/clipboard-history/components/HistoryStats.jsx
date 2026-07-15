import React from "react";
import { ClipboardList, Star, Type, Link, Code } from "lucide-react";

export default function HistoryStats({ entries }) {
  const total = entries.length;
  const favorites = entries.filter((e) => e.isFavorite).length;
  const urls = entries.filter((e) => e.type === "url").length;
  const codeSnippets = entries.filter((e) => e.type === "code" || e.type === "json").length;

  const stats = [
    { label: "Total Entries", value: total, icon: <ClipboardList size={20} className="text-violet-500" /> },
    { label: "Favorites", value: favorites, icon: <Star size={20} className="text-amber-500" /> },
    { label: "URLs", value: urls, icon: <Link size={20} className="text-blue-500" /> },
    { label: "Code / JSON", value: codeSnippets, icon: <Code size={20} className="text-orange-500" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="rounded-full bg-[var(--muted)] p-2">{stat.icon}</div>
          <div>
            <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
