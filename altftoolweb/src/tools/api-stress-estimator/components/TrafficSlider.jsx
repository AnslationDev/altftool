"use client";

import { Zap, GitCompareArrows, Flame } from "lucide-react";

const presets = [
  { label: "Light Load", value: 200 },
  { label: "Medium", value: 1500 },
  { label: "Heavy", value: 4500 },
  { label: "Viral Spike", value: 7500 },
  { label: "Attack Surge", value: 10000 },
];

const modes = [
  "Constant Traffic",
  "Sudden Spike",
  "Gradual Growth",
  "Random Burst",
];

export default function TrafficSlider({
  traffic,
  onTrafficChange,
  mode,
  onModeChange,
  blackFridayMode,
  onBlackFridayMode,
  compareEnabled,
  onToggleCompare,
}) {
  const min = 100;
  const max = 10000;
  const pct = ((traffic - min) / (max - min)) * 100;

  return (
    <div className="soft-card p-5">
      {/* Decorative gradient line */}
      <div className="card-glow-line" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-badge">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Traffic Simulator
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust load and pattern to see live predictions
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onBlackFridayMode(!blackFridayMode)}
            className={`preset-btn ${blackFridayMode ? "active" : ""}`}
          >
            <Flame className="mr-1 inline h-3.5 w-3.5" />
            Black Friday
          </button>
          <button
            onClick={onToggleCompare}
            className={`preset-btn ${compareEnabled ? "active" : ""}`}
          >
            <GitCompareArrows className="mr-1 inline h-3.5 w-3.5" />
            Compare Configs
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            Requests / second
          </span>
          <span className="font-mono-display text-2xl font-extrabold text-primary">
            {traffic.toLocaleString()}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">
              req/s
            </span>
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={traffic}
          onChange={(e) => onTrafficChange(Number(e.target.value))}
          className="blue-slider mt-3"
          style={{ "--val": `${pct}%` }}
          suppressHydrationWarning
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>100</span>
          <span>2.5k</span>
          <span>5k</span>
          <span>7.5k</span>
          <span>10k</span>
        </div>
      </div>

      <div className="mt-5">
        <p className="field-label">Presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onTrafficChange(p.value)}
              className={`preset-btn ${
                traffic === p.value ? "active" : ""
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="field-label">Traffic Pattern</p>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`preset-btn ${mode === m ? "active" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
