import React from 'react';
import { Activity, Gauge, Orbit, Sigma } from 'lucide-react';
import { estimateLobes, frequencyRatio } from '../utils/lissajous';

export default function StatsPanel({ settings, paused, presetLabel }) {
  const lobes = estimateLobes(settings.freqX, settings.freqY);
  const cards = [
    { icon: <Activity size={16} />, label: 'Status', value: paused ? 'Static' : 'Animating' },
    { icon: <Sigma size={16} />, label: 'Ratio', value: frequencyRatio(settings.freqX, settings.freqY) },
    { icon: <Orbit size={16} />, label: 'Lobes', value: `${lobes.horizontal} x ${lobes.vertical}` },
    { icon: <Gauge size={16} />, label: 'Preset', value: presetLabel },
  ];

  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        Curve Stats
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex min-h-[76px] flex-col items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--muted)]/40 p-3 text-center shadow-sm backdrop-blur-sm"
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
