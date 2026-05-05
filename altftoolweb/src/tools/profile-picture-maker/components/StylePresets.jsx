"use client";

import React from "react";
import {
  Linkedin,
  Gamepad2,
  Instagram,
  BriefcaseBusiness,
  Sparkles,
  Palette,
  Zap,
} from "lucide-react";


// import { Palette } from "lucide-static";

const PRESETS = [
  {
    key: "linkedin",
    label: "LinkedIn ",
    desc: "Clean • White bg",
    Icon: Linkedin,
    iconColor: "#0a66c2",          // LinkedIn blue
    accent: "#0a66c2",
    fn: "applyLinkedIn",
  },
  {
    key: "gamer",
    label: "Gamer DP",
    desc: "Neon • Dark bg",
    Icon: Gamepad2,
    iconColor: "#22c55e",          // neon green
    accent: "#22c55e",
    fn: "applyGamer",
  },
  {
    key: "influencer",
    label: "Influencer",
    desc: "Warm • Blur bg",
    Icon: Instagram,
    iconColor: "#cd1796",          // Instagram pink-red
    accent: "#f43f5e",
    fn: "applyInfluencer",
  },
  {
    key: "corporate",
    label: "Corporate",
    desc: "Neutral • Sharp",
    Icon: BriefcaseBusiness,
    iconColor: "#64748b",          // slate gray
    accent: "#64748b",
    fn: "applyCorporate",
  },
  {
    key: "gradient",
    label: "Gradient Glow",
    desc: "Vivid • Purple",
    Icon: Palette,
    iconColor: "#14888d",          // purple
    accent: "#a855f7",
    fn: "applyGradient",
  },
  {
    key: "glitch",
    label: "Glitch",
    desc: "Pixel • Neon",
    Icon: Zap,
    iconColor: "#facc15",          // yellow
    accent: "#facc15",
    fn: "applyGlitch",
  },
];

export default function StylePresets({
  applyLinkedIn,
  applyGamer,
  applyInfluencer,
  applyCorporate,
  applyGradient,
  applyGlitch,
  activePreset,          // optional: pass current active key to highlight
}) {
  const handlers = {
    applyLinkedIn,
    applyGamer,
    applyInfluencer,
    applyCorporate,
    applyGradient,
    applyGlitch,
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <label className="font-semibold flex items-center gap-2 text-sm">
        <Sparkles size={16} className="text-purple-500" />
        Style Presets
      </label>

      {/* Grid of preset cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
        {PRESETS.map(({ key, label, desc, Icon, iconColor, accent, fn }) => {
          const isActive = activePreset === key;
          return (
            <button
              key={key}
              onClick={() => handlers[fn]?.()}
              style={
                isActive
                  ? {
                      borderColor: accent,
                      background: `${accent}18`, // ~10% opacity tint
                      color: accent,
                    }
                  : {}
              }
              className={[
                "flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl",
                "border border-(--border) text-left transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-md active:scale-95",
                isActive ? "font-semibold" : "hover:bg-(--primary)/10",
              ].join(" ")}
            >
              {/* Icon row */}
              <span className="flex items-center gap-1.5">
                <Icon size={15} style={{ color: iconColor }} strokeWidth={2.2} />
                <span className="text-sm leading-tight">{label}</span>
              </span>
              {/* Subtitle */}
              <span className="text-[11px] opacity-50 leading-none pl-[1px]">
                {desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}