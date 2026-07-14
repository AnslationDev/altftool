"use client";

import StatCard from "./StatCard";

export default function StatsPanel({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} label={s.label} value={s.value} accent={s.accent} />
      ))}
    </div>
  );
}
