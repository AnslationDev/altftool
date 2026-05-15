"use client";

import React from "react";
import { 
  Eye, 
  CircleSlash, 
  Monitor, 
  Sun, 
  Contrast, 
  Droplets,
  Info,
  CheckCircle2
} from "lucide-react";

const MODES = [
  { id: "normal", name: "Normal Vision", icon: Eye, desc: "Standard human color perception" },
  { id: "protanopia", name: "Protanopia", icon: CircleSlash, desc: "Red-blind (Missing L-cones)" },
  { id: "protanomaly", name: "Protanomaly", icon: CircleSlash, desc: "Red-weak (Malfunctioning L-cones)" },
  { id: "deuteranopia", name: "Deuteranopia", icon: Monitor, desc: "Green-blind (Missing M-cones)" },
  { id: "deuteranomaly", name: "Deuteranomaly", icon: Monitor, desc: "Green-weak (Malfunctioning M-cones)" },
  { id: "tritanopia", name: "Tritanopia", icon: Droplets, desc: "Blue-blind (Missing S-cones)" },
  { id: "tritanomaly", name: "Tritanomaly", icon: Droplets, desc: "Blue-weak (Malfunctioning S-cones)" },
  { id: "achromatopsia", name: "Achromatopsia", icon: Sun, desc: "Total color blindness (Grayscale)" },
];

export const FilterModes = ({ activeMode, onSelect }) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className={`relative group flex items-center gap-2 p-2 rounded-xl border transition-all duration-300 text-left ${
            activeMode === mode.id
              ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              : "bg-(--background) border-(--border) hover:border-blue-500/30"
          }`}
        >
          <div className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            activeMode === mode.id ? "bg-blue-500 text-white" : "bg-(--card) text-(--muted-foreground) group-hover:text-blue-500"
          }`}>
            <mode.icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold leading-tight ${activeMode === mode.id ? "text-blue-500" : "text-(--foreground)"}`}>
              {mode.name}
            </h4>
            <p className="text-[10px] text-(--muted-foreground) leading-tight mt-0.5">
              {mode.desc}
            </p>
          </div>
          {activeMode === mode.id && (
            <div className="absolute top-2 right-2 text-blue-500">
              <CheckCircle2 size={14} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export const AdjustmentControls = ({ settings, updateSetting }) => {
  const controls = [
    { id: "severity", name: "Simulation Intensity", icon: Sun, min: 0, max: 1, step: 0.1, suffix: "%", multiplier: 100 },
    { id: "brightness", name: "Brightness", icon: Sun, min: 0.5, max: 1.5, step: 0.01, suffix: "%", multiplier: 100 },
    { id: "contrast", name: "Contrast", icon: Contrast, min: -0.5, max: 0.5, step: 0.01, suffix: "%", multiplier: 100, offset: 100 },
    { id: "saturation", name: "Saturation", icon: Droplets, min: 0, max: 2, step: 0.1, suffix: "%", multiplier: 100 },
  ];

  return (
    <div className="space-y-3">
      {controls.map((control) => (
        <div key={control.id} className="space-y-1.5">
          <div className="flex justify-between items-center px-1 gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <control.icon size={14} className="text-blue-500 shrink-0" />
              <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider truncate">
                {control.name}
              </label>
            </div>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 shrink-0">
              {Math.round((control.offset || 0) + settings[control.id] * control.multiplier)}{control.suffix}
            </span>
          </div>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={settings[control.id]}
            onChange={(e) => updateSetting(control.id, parseFloat(e.target.value))}
            className="w-full h-1.5 bg-(--border) rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      ))}
      
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
        <div className="text-blue-500 shrink-0">
          <Info size={16} />
        </div>
        <p className="text-[10px] text-(--muted-foreground) leading-relaxed">
          <strong>Intensity</strong> controls the severity of the deficiency. 1.0 represents full dichromacy, while lower values simulate anomalous trichromacy.
        </p>
      </div>
    </div>
  );
};
