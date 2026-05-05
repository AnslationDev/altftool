"use client";

import React from "react";
import {
  Sparkles,
  PenLine,
  Layers,
  WandSparkles ,
Aperture ,
  
} from "lucide-react";

// Each mode maps exactly to what the CSS filter in drawToCanvas produces
const MODES = [
  {
    id: "cartoon",
    label: "Saturation boost",
    sub: "Bold + vivid",
    Icon: Aperture ,
    color: "#a855f7", // purple
  },
  {
    id: "sketch",
    label: "Sketch",
    sub: "Grayscale lines",
    Icon: PenLine,
    color: "#94a3b8", // slate
  },
  {
    id: "anime",
    label: "Glow FX",
    sub: "Soft + glowing",
    Icon: Sparkles,
    color: "#f472b6", // pink
  },
  {
    id: "3d",
    label: "3D Render",
    sub: "Depth + pop",
    Icon: Layers,
    color: "#38bdf8", // sky blue
  },
  // {
  //   id: "cyberpunk",
  //   label: "Cyberpunk",
  //   sub: "Neon + dark",
  //   Icon: Cpu,
  //   color: "#22c55e", // neon green
  // },
  // {
  //   id: "vintage",
  //   label: "Vintage",
  //   sub: "Warm + faded",
  //   Icon: Drama,
  //   color: "#f59e0b", // amber
  // },
];

export default function Modes({ onSelectMode, activeMode }) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <label className="font-medium flex items-center gap-2">
        < WandSparkles className="text-pink-500" size={18} />
        Visual Filters 
      </label>

      {/* Mode grid */}
      <div className="grid grid-cols-2 gap-2">
        {MODES.map(({ id, label, sub, Icon, color }) => {
          const isActive = activeMode === id;
          return (
            <button
              key={id}
              onClick={() => onSelectMode(isActive ? "none" : id)} // click again to deactivate
              style={
                isActive
                  ? { borderColor: color, background: `${color}18`, color }
                  : {}
              }
              className={[
                "flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl text-left",
                "border border-(--border) transition-all duration-200 text-sm",
                "hover:scale-[1.02] hover:shadow-sm active:scale-95",
                isActive ? "font-semibold" : "",
              ].join(" ")}
            >
              <span className="flex items-center gap-1.5">
                <Icon size={14} style={{ color }} strokeWidth={2.2} />
                <span>{label}</span>
              </span>
              <span className="text-[10px] opacity-50 pl-[1px]">{sub}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-(--muted-foreground)">
        Instant preview. Click again to deactivate.
      </p>
    </div>
  );
}