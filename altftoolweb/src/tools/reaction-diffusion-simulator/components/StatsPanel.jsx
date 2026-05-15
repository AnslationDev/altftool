import React from 'react';
import { Activity, Gauge, Layers3, Waves } from 'lucide-react';

export default function StatsPanel({ stats, paused, presetLabel, resolution }) {
  const cards = [
    { icon: <Activity size={16} />, label: 'Status', value: paused ? 'Paused' : 'Running' },
    { icon: <Waves size={16} />, label: 'Preset', value: presetLabel },
    { icon: <Gauge size={16} />, label: 'Coverage', value: `${stats.coverage || 0}%` },
    { icon: <Layers3 size={16} />, label: 'Resolution', value: resolution },
  ];

  return (
    <div className="bg-[var(--card)]/70 backdrop-blur-xl border border-[var(--card-border)] rounded-3xl p-5 shadow-lg">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        Live Pattern Stats
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--muted)]/40 backdrop-blur-sm border border-[var(--card-border)] rounded-xl p-3 min-h-[76px] flex flex-col items-center justify-center text-center shadow-sm"
          >
            <span className="mb-1 text-[var(--primary)]">{card.icon}</span>
            <span className="mb-1 text-[10px] uppercase tracking-wide text-[var(--secondary-foreground)]">{card.label}</span>
            <span className="font-mono text-sm font-bold text-[var(--primary)] tabular-nums">{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
