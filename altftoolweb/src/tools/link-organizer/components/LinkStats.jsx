import React from "react";
import { Link, Star, Folder } from "lucide-react";

export default function LinkStats({ links, groups }) {
  const total = links.length;
  const favorites = links.filter(l => l.isFavorite).length;
  const groupCount = groups.length;

  const stats = [
    { label: "Total Links", value: total, icon: <Link size={20} className="text-blue-500" /> },
    { label: "Favorites", value: favorites, icon: <Star size={20} className="text-amber-500" /> },
    { label: "Link Groups", value: groupCount, icon: <Folder size={20} className="text-emerald-500" /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
