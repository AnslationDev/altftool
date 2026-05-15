import React from 'react';
import { Activity, Gauge, Grid3X3, Users } from 'lucide-react';

export default function StatsPanel({ generation, population, gridInfo, speed, paused }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
          Live Stats
        </h3>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
          <span className={`h-2 w-2 rounded-full ${paused ? 'bg-[var(--muted-foreground)]' : 'bg-[var(--primary)]'}`} />
          {paused ? 'Paused' : 'Running'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={<Activity size={16} />} label="Generation" value={generation} />
        <Stat icon={<Users size={16} />} label="Population" value={population} />
        <Stat icon={<Grid3X3 size={16} />} label="Grid" value={gridInfo} />
        <Stat icon={<Gauge size={16} />} label="Speed" value={`${speed}/s`} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex min-h-[76px] flex-col items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center shadow-[var(--anslation-ds-shadow-sm)]">
      <span className="mb-1 text-[var(--primary)]">{icon}</span>
      <span className="mb-1 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">{label}</span>
      <span className="font-mono font-bold text-sm text-[var(--primary)] tabular-nums">{value}</span>
    </div>
  );
}
