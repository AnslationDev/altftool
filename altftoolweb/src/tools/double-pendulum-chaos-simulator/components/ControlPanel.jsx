import React from 'react';

export default function ControlPanel({
  params, pendingAngles, onParamChange, onAngleChange,
  onApply, onReset, onRandomize, paused, started,
  onTogglePause, onStart, onResetAll,
  comparisonMode, onToggleComparison,
}) {
  const handleChange = (field) => (e) => onParamChange(field, parseFloat(e.target.value));
  const handleAngleChange = (field) => (e) => onAngleChange(field, parseFloat(e.target.value));

  return (
    <div className="space-y-6">
      {/* Parameters Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 shadow-2xl space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">Parameters</h3>
        <Slider label="Mass 1 (kg)" value={params.m1} min={0.5} max={5} step={0.1} onChange={handleChange('m1')} />
        <Slider label="Mass 2 (kg)" value={params.m2} min={0.5} max={5} step={0.1} onChange={handleChange('m2')} />
        <Slider label="Length 1 (m)" value={params.L1} min={0.5} max={3} step={0.05} onChange={handleChange('L1')} />
        <Slider label="Length 2 (m)" value={params.L2} min={0.5} max={3} step={0.05} onChange={handleChange('L2')} />
        <Slider label="Gravity (m/s²)" value={params.g} min={0.5} max={30} step={0.1} onChange={handleChange('g')} />
        <Slider label="Damping" value={params.damping} min={0} max={0.5} step={0.01} onChange={handleChange('damping')} />
        <Slider label="Speed" value={params.speed} min={0.1} max={3} step={0.1} onChange={handleChange('speed')} />
      </div>

      {/* Initial Angles Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 shadow-2xl space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">Initial Angles</h3>
        <Slider label="θ₁ (rad)" value={pendingAngles.theta1} min={-Math.PI} max={Math.PI} step={0.01} onChange={handleAngleChange('theta1')} />
        <Slider label="θ₂ (rad)" value={pendingAngles.theta2} min={-Math.PI} max={Math.PI} step={0.01} onChange={handleAngleChange('theta2')} />
        <div className="flex gap-2">
          <button onClick={onApply} className="flex-1 py-2 px-4 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-medium shadow-lg hover:bg-[var(--primary-hover)] transition-all">
            Apply & Restart
          </button>
          <button onClick={onRandomize} className="py-2 px-4 rounded-xl bg-[var(--secondary-bg)] border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all">
            🎲
          </button>
        </div>
      </div>

      {/* Start / Pause Controls Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 shadow-2xl space-y-3">
        {!started ? (
          // Show only Start button initially
          <button
            onClick={onStart}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg shadow-lg hover:bg-[var(--primary-hover)] transition-all"
          >
            ▶ Start Simulation
          </button>
        ) : (
          // After started: pause/resume, reset, reset all
          <>
            <div className="flex gap-2">
              <button
                onClick={onTogglePause}
                className="flex-1 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all"
              >
                {paused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button
                onClick={onReset}
                className="flex-1 py-2.5 rounded-xl bg-[var(--secondary-bg)] border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all"
              >
                ↺ Reset
              </button>
            </div>
            <button
              onClick={onResetAll}
              className="w-full py-2.5 rounded-xl bg-red-600/20 border border-red-400/30 text-red-300 hover:bg-red-600/30 transition-all text-sm"
            >
              Reset All to Defaults
            </button>
            <button
              onClick={onToggleComparison}
              className={`w-full py-2.5 rounded-xl font-medium transition-all ${
                comparisonMode
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg'
                  : 'bg-[var(--secondary-bg)] border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
              }`}
            >
              {comparisonMode ? '⚡ Comparison ON' : 'Compare Chaos'}
            </button>
          </>
        )}
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