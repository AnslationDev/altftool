import React from 'react';
import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import { PRESETS } from '../utils/reactionDiffusion';

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
    <div className="bg-[var(--card)]/70 backdrop-blur-xl border border-[var(--card-border)] rounded-3xl p-4 shadow-lg">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTogglePause}
            className="flex min-w-[112px] items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-md hover:bg-[var(--primary-hover)]"
          >
            {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            {paused ? 'Start' : 'Pause'}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--secondary-bg)]/80 backdrop-blur-sm border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={onRandomize}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--secondary-bg)]/80 backdrop-blur-sm border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]"
          >
            <Shuffle size={18} />
            Random Seed
          </button>
        </div>

        <label className="flex min-w-[220px] flex-col gap-1 text-xs text-[var(--secondary-foreground)]">
          Pattern preset
          <select
            value={preset}
            onChange={(event) => onPresetChange(event.target.value)}
            className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          >
            {Object.entries(PRESETS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 xl:grid-cols-5">
        <Slider label="Feed" value={settings.feed} min={0.01} max={0.08} step={0.0005} onChange={(value) => onSettingsChange('feed', value)} />
        <Slider label="Kill" value={settings.kill} min={0.03} max={0.075} step={0.0005} onChange={(value) => onSettingsChange('kill', value)} />
        <Slider label="Diffusion A" value={settings.diffA} min={0.6} max={1.4} step={0.02} onChange={(value) => onSettingsChange('diffA', value)} />
        <Slider label="Diffusion B" value={settings.diffB} min={0.2} max={0.8} step={0.02} onChange={(value) => onSettingsChange('diffB', value)} />
        <Slider label="Speed" value={settings.stepsPerFrame} min={1} max={12} step={1} onChange={(value) => onSettingsChange('stepsPerFrame', value)} />
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-xs text-[var(--secondary-foreground)]">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="font-mono text-[var(--primary)] tabular-nums">
          {Number.isInteger(value) ? value : value.toFixed(4)}
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
