"use client";

import { Circle, MousePointer2, Square, Type } from "lucide-react";

/**
 * There's no real product-demo video asset to embed for any of these
 * sections, so this is a self-contained CSS-animated mockup instead: a
 * generic "design canvas" building itself up on a loop (cursor moves,
 * elements pop in, toolbar pulses) to convey "this is what using a design
 * tool feels like" without pretending to be footage of any specific
 * product. Themeable (gradient + shape colors) and offered in two shape
 * layouts so it doesn't look identical across every section that uses it.
 */

const LAYOUTS = {
  a: [
    { style: { left: "8%", top: "12%", height: "30%", width: "38%" }, rounded: "rounded-xl", kind: "accent", delay: 0 },
    { style: { left: "52%", top: "10%", height: "16%", width: "36%" }, rounded: "rounded-lg", kind: "neutral", delay: 1.2 },
    { style: { left: "52%", top: "30%", height: "10%", width: "24%" }, rounded: "rounded-lg", kind: "neutral", delay: 1.6 },
    { style: { left: "10%", top: "52%", height: "12%", width: "20%" }, rounded: "rounded-full", kind: "soft", delay: 2.4 },
    { style: { left: "34%", top: "54%", height: "10%", width: "30%" }, rounded: "rounded-full", kind: "accentBar", delay: 3 },
    { style: { left: "10%", top: "74%", height: "8%", width: "55%" }, rounded: "rounded-lg", kind: "neutral", delay: 3.6 },
    { style: { left: "68%", top: "52%", height: "26%", width: "22%" }, rounded: "rounded-xl", kind: "warm", delay: 4.2 },
  ],
  b: [
    { style: { left: "8%", top: "10%", height: "18%", width: "26%" }, rounded: "rounded-xl", kind: "accent", delay: 0 },
    { style: { left: "38%", top: "10%", height: "18%", width: "26%" }, rounded: "rounded-xl", kind: "warm", delay: 0.8 },
    { style: { left: "68%", top: "10%", height: "18%", width: "24%" }, rounded: "rounded-xl", kind: "soft", delay: 1.6 },
    { style: { left: "8%", top: "34%", height: "8%", width: "50%" }, rounded: "rounded-lg", kind: "neutral", delay: 2.4 },
    { style: { left: "8%", top: "46%", height: "8%", width: "36%" }, rounded: "rounded-lg", kind: "neutral", delay: 2.8 },
    { style: { left: "8%", top: "62%", height: "22%", width: "40%" }, rounded: "rounded-xl", kind: "accentBar", delay: 3.4 },
    { style: { left: "54%", top: "62%", height: "22%", width: "38%" }, rounded: "rounded-xl", kind: "warm", delay: 4 },
  ],
};

const DEFAULT_ICONS = [Square, Circle, Type, MousePointer2];

// Shared theme presets so each section that embeds this feels distinct
// without hand-authoring a new animation per section.
export const SHOWCASE_THEMES = {
  violet: {
    bg: "from-violet-700 via-fuchsia-600 to-cyan-500",
    glow1: "bg-white/15",
    glow2: "bg-cyan-300/25",
    accent: "from-violet-400 to-fuchsia-400",
    accentBar: "from-violet-600 to-cyan-500",
    warm: "from-amber-300 to-orange-400",
    soft: "bg-cyan-300",
    toolPulseBg: "rgb(237 233 254)",
    toolPulseFg: "rgb(124 58 237)",
  },
  emerald: {
    bg: "from-emerald-600 via-teal-500 to-cyan-400",
    glow1: "bg-white/15",
    glow2: "bg-emerald-200/30",
    accent: "from-emerald-400 to-teal-400",
    accentBar: "from-teal-500 to-cyan-400",
    warm: "from-lime-300 to-emerald-400",
    soft: "bg-teal-200",
    toolPulseBg: "rgb(209 250 229)",
    toolPulseFg: "rgb(5 150 105)",
  },
  sunset: {
    bg: "from-amber-500 via-orange-500 to-rose-500",
    glow1: "bg-white/15",
    glow2: "bg-amber-200/30",
    accent: "from-orange-400 to-rose-400",
    accentBar: "from-amber-500 to-rose-500",
    warm: "from-rose-400 to-fuchsia-400",
    soft: "bg-amber-200",
    toolPulseBg: "rgb(254 243 199)",
    toolPulseFg: "rgb(217 119 6)",
  },
  indigo: {
    bg: "from-indigo-700 via-blue-600 to-sky-400",
    glow1: "bg-white/15",
    glow2: "bg-sky-200/30",
    accent: "from-indigo-400 to-blue-400",
    accentBar: "from-blue-500 to-sky-400",
    warm: "from-sky-300 to-cyan-400",
    soft: "bg-indigo-200",
    toolPulseBg: "rgb(224 231 255)",
    toolPulseFg: "rgb(67 56 202)",
  },
  rose: {
    bg: "from-rose-600 via-pink-500 to-fuchsia-400",
    glow1: "bg-white/15",
    glow2: "bg-pink-200/30",
    accent: "from-rose-400 to-pink-400",
    accentBar: "from-pink-500 to-fuchsia-400",
    warm: "from-fuchsia-300 to-purple-400",
    soft: "bg-rose-200",
    toolPulseBg: "rgb(255 228 230)",
    toolPulseFg: "rgb(190 24 93)",
  },
};

function shapeClass(theme, kind) {
  switch (kind) {
    case "accent":
      return `bg-gradient-to-br ${theme.accent}`;
    case "accentBar":
      return `bg-gradient-to-r ${theme.accentBar}`;
    case "warm":
      return `bg-gradient-to-br ${theme.warm}`;
    case "soft":
      return theme.soft;
    default:
      return "bg-slate-200";
  }
}

// Distinct animation-name suffix per theme+layout combo — every theme's `bg`
// starts with "from-", so slicing the string itself would collide across
// themes; hashing the full gradient string keeps keyframe names (which
// embed theme-specific colors, e.g. tool-pulse) from overwriting each other
// when two sections share the same layout letter.
function hashKey(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export default function AnimatedShowcase({ theme, label = "untitled-project.design", layout = "a", icons = DEFAULT_ICONS }) {
  const shapes = LAYOUTS[layout] || LAYOUTS.a;
  const uid = `${layout}-${hashKey(theme.bg)}`;

  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-gradient-to-br ${theme.bg} shadow-[0_30px_80px_-30px_rgba(76,29,149,0.4)]`}>
      <div className={`pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-full blur-3xl ${theme.glow1}`} />
      <div className={`pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full blur-3xl ${theme.glow2}`} />

      <div className="absolute inset-4 sm:inset-6 flex flex-col overflow-hidden rounded-2xl bg-white/95 shadow-2xl backdrop-blur-sm">
        <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-100 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-[11px] font-semibold text-slate-400">{label}</span>
        </div>

        <div className="relative flex flex-1">
          <div className="flex w-11 shrink-0 flex-col items-center gap-3 border-r border-slate-100 py-4">
            {icons.map((Icon, i) => (
              <span
                key={i}
                className={`showcase-tool-pulse-${uid} flex h-7 w-7 items-center justify-center rounded-lg text-slate-400`}
                style={{ animationDelay: `${i * 1.5}s` }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            ))}
          </div>

          <div className="relative flex-1 bg-slate-50">
            {shapes.map((shape, i) => (
              <div
                key={i}
                className={`showcase-shape-${uid} absolute ${shape.rounded} ${shapeClass(theme, shape.kind)}`}
                style={{ ...shape.style, animationDelay: `${shape.delay}s` }}
              />
            ))}

            <div className={`showcase-cursor-${uid} pointer-events-none absolute left-0 top-0 flex items-center gap-1 text-[#0A0523]`}>
              <MousePointer2 className="h-4 w-4 fill-[#0A0523]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shape-cycle-${uid} {
          0% { opacity: 0; transform: translateY(14px) scale(0.92); }
          8% { opacity: 1; transform: translateY(0) scale(1); }
          78% { opacity: 1; transform: translateY(0) scale(1); }
          92% { opacity: 0; transform: translateY(-8px) scale(0.96); }
          100% { opacity: 0; transform: translateY(14px) scale(0.92); }
        }
        .showcase-shape-${uid} {
          animation: shape-cycle-${uid} 6s ease-in-out infinite;
        }
        @keyframes tool-pulse-${uid} {
          0%, 100% { background-color: transparent; color: rgb(148 163 184); }
          50% { background-color: ${theme.toolPulseBg}; color: ${theme.toolPulseFg}; }
        }
        .showcase-tool-pulse-${uid} {
          animation: tool-pulse-${uid} 6s ease-in-out infinite;
        }
        @keyframes cursor-loop-${uid} {
          0%   { transform: translate(60px, 40px); opacity: 0; }
          4%   { opacity: 1; }
          22%  { transform: translate(210px, 55px); }
          40%  { transform: translate(240px, 150px); }
          55%  { transform: translate(120px, 190px); }
          70%  { transform: translate(190px, 210px); }
          88%  { transform: translate(300px, 170px); opacity: 1; }
          96%  { opacity: 0; }
          100% { transform: translate(60px, 40px); opacity: 0; }
        }
        .showcase-cursor-${uid} {
          animation: cursor-loop-${uid} 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
