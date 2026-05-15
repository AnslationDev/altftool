import React from 'react';

export default function AnglesCard({ pendingAngles, onAngleChange, onApply, onRandomize }) {
  const handleAngleChange = (field) => (e) => onAngleChange(field, parseFloat(e.target.value));

  return (
    <div className="bg-[var(--card)]/70 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-6 shadow-2xl h-full">
      <div className="flex items-center gap-3 mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 7 17" />
          <path d="M12 2v7" />
          <path d="M12 9l-4 4" />
        </svg>
        <h3 className="text-lg font-semibold uppercase tracking-widest text-[var(--primary)]">
          Initial Angles
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <Slider label="θ₁ (rad)" value={pendingAngles.theta1} min={-Math.PI} max={Math.PI} step={0.01} onChange={handleAngleChange('theta1')} />
        <Slider label="θ₂ (rad)" value={pendingAngles.theta2} min={-Math.PI} max={Math.PI} step={0.01} onChange={handleAngleChange('theta2')} />
      </div>
      <div className="flex gap-3 mt-5 justify-center">
        <button
          onClick={onApply}
          className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-medium shadow-lg hover:bg-[var(--primary-hover)] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Apply & Restart
        </button>
        <button
          onClick={onRandomize}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--secondary-bg)]/80 backdrop-blur-sm border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Randomize
        </button>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[var(--secondary-foreground)]">
        <span>{label}</span>
        <span className="tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-[var(--background)] border border-[var(--border)] rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
      />
    </div>
  );
}