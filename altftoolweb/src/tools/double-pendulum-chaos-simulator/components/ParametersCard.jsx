import React from 'react';

export default function ParametersCard({ params, onParamChange }) {
  const handleChange = (field) => (e) => onParamChange(field, parseFloat(e.target.value));

  return (
    <div className="bg-[var(--card)]/70 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-6 shadow-2xl h-full">
      <div className="flex items-center gap-3 mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        <h3 className="text-lg font-semibold uppercase tracking-widest text-[var(--primary)]">
          Parameters
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Slider label="Mass 1 (kg)" value={params.m1} min={0.5} max={5} step={0.1} onChange={handleChange('m1')} />
        <Slider label="Mass 2 (kg)" value={params.m2} min={0.5} max={5} step={0.1} onChange={handleChange('m2')} />
        <Slider label="Length 1 (m)" value={params.L1} min={0.5} max={3} step={0.05} onChange={handleChange('L1')} />
        <Slider label="Length 2 (m)" value={params.L2} min={0.5} max={3} step={0.05} onChange={handleChange('L2')} />
        <Slider label="Gravity (m/s²)" value={params.g} min={0.5} max={30} step={0.1} onChange={handleChange('g')} />
        <Slider label="Damping" value={params.damping} min={0} max={0.5} step={0.01} onChange={handleChange('damping')} />
        <Slider label="Speed" value={params.speed} min={0.1} max={3} step={0.1} onChange={handleChange('speed')} />
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