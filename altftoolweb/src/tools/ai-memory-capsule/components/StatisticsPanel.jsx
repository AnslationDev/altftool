import React from "react";
import { Layers, Star, Lock, BookOpen, TrendingUp, Flame } from "lucide-react";

export default function StatisticsPanel({ insights }) {
  const stats = [
    { label: "Total Memories", value: insights.totalCapsules, icon: <BookOpen size={20} className="text-blue-500" /> },
    { label: "Total Words", value: insights.totalWords.toLocaleString(), icon: <Layers size={20} className="text-emerald-500" /> },
    { label: "Avg Words", value: insights.avgWordsPerCapsule, icon: <TrendingUp size={20} className="text-violet-500" /> },
    { label: "Favorites", value: insights.favoriteCount, icon: <Star size={20} className="text-amber-500" /> },
    { label: "Sealed", value: insights.sealedCount, icon: <Lock size={20} className="text-orange-500" /> },
    { label: "Day Streak", value: insights.streak, icon: <Flame size={20} className="text-red-500" /> },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
          <div className="rounded-full bg-[var(--muted)] p-2">{stat.icon}</div>
          <div>
            <div className="text-lg font-bold text-[var(--foreground)]">{stat.value}</div>
            <div className="text-[10px] text-[var(--muted-foreground)]">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
