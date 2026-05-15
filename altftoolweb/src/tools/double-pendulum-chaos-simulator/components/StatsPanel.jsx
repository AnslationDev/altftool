import React from 'react';

export default function StatsPanel({ stats, label }) {
  const { fps = 0, theta1 = 0, theta2 = 0, omega1 = 0, omega2 = 0, paused = false } = stats || {};

  return (
    <div className="bg-[var(--card)]/70 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-6 shadow-2xl">
      {label ? (
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)] mb-4">
          {label} – Live Stats
        </h3>
      ) : (
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)] mb-4">
          Live Stats
        </h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat label="FPS" value={fps} color="text-emerald-400" />
        <Stat label="State" value={paused ? 'Paused' : 'Running'} color={paused ? 'text-amber-400' : 'text-emerald-400'} />
        <Stat label="θ₁" value={`${(theta1 * 57.3).toFixed(1)}°`} color="text-[var(--foreground)]" />
        <Stat label="θ₂" value={`${(theta2 * 57.3).toFixed(1)}°`} color="text-[var(--foreground)]" />
        <Stat label="ω₁" value={omega1.toFixed(3)} color="text-[var(--secondary-foreground)]" />
        <Stat label="ω₂" value={omega2.toFixed(3)} color="text-[var(--secondary-foreground)]" />
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'text-[var(--foreground)]' }) {
  return (
    <div className="bg-[var(--muted)]/40 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-lg shadow-black/5">
      <span className="text-[10px] text-[var(--secondary-foreground)] uppercase tracking-wide mb-1">
        {label}
      </span>
      <span className={`font-mono font-bold text-sm ${color}`}>{value}</span>
    </div>
  );
}