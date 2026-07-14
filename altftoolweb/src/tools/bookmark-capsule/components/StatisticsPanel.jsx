import React from "react";
import { Bookmark, Star, Archive, Layers } from "lucide-react";

export default function StatisticsPanel({ bookmarks, categories }) {
  const total = bookmarks.length;
  const favorites = bookmarks.filter(b => b.isFavorite).length;
  const archived = bookmarks.filter(b => b.isArchived).length;
  const categoryCount = categories.length;

  const stats = [
    { label: "Total Bookmarks", value: total, icon: <Bookmark size={20} className="text-blue-500" /> },
    { label: "Favorites", value: favorites, icon: <Star size={20} className="text-amber-500" /> },
    { label: "Archived", value: archived, icon: <Archive size={20} className="text-gray-500" /> },
    { label: "Categories", value: categoryCount, icon: <Layers size={20} className="text-emerald-500" /> },
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
