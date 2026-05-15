import React from 'react';
import { Pause, Play, Shuffle, StepForward, Trash2 } from 'lucide-react';

export default function ControlPanel({
  paused,
  generation,
  speed,
  onStartPause,
  onStep,
  onClear,
  onRandomize,
  onSpeedChange,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onStartPause}
          className="btn-primary min-w-[112px]"
        >
          {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          {paused ? 'Start' : 'Pause'}
        </button>
        <button
          onClick={onStep}
          className="btn-secondary"
          title="Step one generation"
        >
          <StepForward size={18} />
          Step
        </button>
        <button
          onClick={onClear}
          className="btn-secondary"
          title="Clear grid"
        >
          <Trash2 size={18} />
          Clear
        </button>
        <button
          onClick={onRandomize}
          className="btn-secondary"
          title="Random fill"
        >
          <Shuffle size={18} />
          Random
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span className="font-mono font-bold">{generation}</span>
          <span>gen</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)]">Speed</span>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="h-2 w-20 cursor-pointer appearance-none rounded-full border border-[var(--border)] bg-[var(--background)] accent-[var(--primary)]"
          />
          <span className="text-xs font-mono w-6 tabular-nums">{speed}</span>
        </div>
      </div>
    </div>
  );
}
