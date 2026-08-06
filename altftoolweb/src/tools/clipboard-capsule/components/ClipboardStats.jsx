import React from "react";
import { ClipboardList, Star, Type, Layers } from "lucide-react";

export default function ClipboardStats({ snippets, categories }) {
  const total = snippets.length;
  const favorites = snippets.filter(s => s.isFavorite).length;
  const totalCharacters = snippets.reduce((acc, s) => acc + (s.content ? s.content.length : 0), 0);
  const categoryCount = categories.length;

  const stats = [
    { label: "Total Snippets", value: total, icon: <ClipboardList size={20} className="text-info-text" /> },
    { label: "Favorites", value: favorites, icon: <Star size={20} className="text-warning-text" /> },
    { label: "Total Characters", value: totalCharacters.toLocaleString(), icon: <Type size={20} className="text-muted-foreground" /> },
    { label: "Categories", value: categoryCount, icon: <Layers size={20} className="text-success-text" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="rounded-full bg-[var(--muted)] p-2">
            {stat.icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
