import React from 'react';
import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import { PRESETS } from '../utils/lissajous';

export default function ControlPanel({
  paused,
  settings,
  preset,
  onTogglePause,
  onReset,
  onRandomize,
  onPresetChange,
  onSettingsChange,
}) {
  return (
    <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/70 p-4 shadow-lg backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTogglePause}
            className="flex min-w-[112px] items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 font-bold text-[var(--primary-foreground)] shadow-md hover:bg-[var(--primary-hover)]"
          >
            {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            {paused ? 'Animate' : 'Pause'}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl border border-[var(--secondary-border)] bg-[var(--secondary-bg)]/80 px-4 py-2.5 text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={onRandomize}
            className="flex items-center gap-2 rounded-xl border border-[var(--secondary-border)] bg-[var(--secondary-bg)]/80 px-4 py-2.5 text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]"
          >
            <Shuffle size={18} />
            Random
          </button>
        </div>

        <label className="flex min-w-[220px] flex-col gap-1 text-xs text-[var(--secondary-foreground)]">
          Pattern preset
          <select
            value={preset}
            onChange={(event) => onPresetChange(event.target.value)}
            className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          >
            {!PRESETS[preset] && (
              <option value={preset}>
                Custom
              </option>
            )}
            {Object.entries(PRESETS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 xl:grid-cols-4">
        <Slider label="X frequency" value={settings.freqX} min={1} max={12} step={1} onChange={(value) => onSettingsChange('freqX', value)} />
        <Slider label="Y frequency" value={settings.freqY} min={1} max={12} step={1} onChange={(value) => onSettingsChange('freqY', value)} />
        <Slider label="Phase" value={settings.phase} min={0} max={360} step={1} suffix="deg" onChange={(value) => onSettingsChange('phase', value)} />
        <Slider label="Rotation" value={settings.rotation} min={-90} max={90} step={1} suffix="deg" onChange={(value) => onSettingsChange('rotation', value)} />
        <Slider label="X amplitude" value={settings.amplitudeX} min={20} max={100} step={1} suffix="%" onChange={(value) => onSettingsChange('amplitudeX', value)} />
        <Slider label="Y amplitude" value={settings.amplitudeY} min={20} max={100} step={1} suffix="%" onChange={(value) => onSettingsChange('amplitudeY', value)} />
        <Slider label="Trace samples" value={settings.samples} min={300} max={3000} step={100} onChange={(value) => onSettingsChange('samples', value)} />
        <Slider label="Animation speed" value={settings.animationSpeed} min={0.1} max={3} step={0.1} onChange={(value) => onSettingsChange('animationSpeed', value)} />
        <Slider label="Phase drift" value={settings.phaseSpeed} min={0} max={120} step={1} suffix="deg/s" onChange={(value) => onSettingsChange('phaseSpeed', value)} />
        <Slider label="Signal decay" value={settings.decay} min={0} max={0.45} step={0.01} onChange={(value) => onSettingsChange('decay', value)} />
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix = '', onChange }) {
  const display = Number.isInteger(value) ? value : value.toFixed(2);

  return (
    <label className="flex flex-col gap-2 text-xs text-[var(--secondary-foreground)]">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="font-mono text-[var(--primary)] tabular-nums">
          {display}{suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full border border-[var(--input-border)] bg-[var(--input-bg)] accent-[var(--primary)]"
      />
    </label>
  );
}
