// Option lists and default configuration for the Avatar Generator.
// Keeping these here keeps the SVG builder and components in sync.

export const STYLES = [
  { id: "flat", name: "Flat", description: "Clean, modern flat illustration" },
  { id: "geometric", name: "Geometric", description: "Angular facets & shapes" },
  { id: "pixel", name: "Pixel", description: "Retro 8-bit blocky style" },
  { id: "friendly", name: "Friendly", description: "Soft, rounded & cute" },
];

export const FACE_SHAPES = ["round", "oval", "square"];
export const EYES = ["round", "happy", "wink", "closed"];
export const EYEBROWS = ["straight", "curved", "raised"];
export const MOUTHS = ["smile", "neutral", "open", "smirk"];
export const HAIR_STYLES = ["short", "long", "bun", "mohawk", "bald"];
export const FACIAL_HAIR = ["none", "stubble", "beard"];
export const ACCESSORIES = ["none", "glasses", "sunglasses", "hat"];

export const BACKGROUNDS = [
  { id: "solid", name: "Solid" },
  { id: "gradient-sunset", name: "Sunset" },
  { id: "gradient-ocean", name: "Ocean" },
  { id: "gradient-aurora", name: "Aurora" },
  { id: "dots", name: "Dots" },
  { id: "grid", name: "Grid" },
];

export const SKIN_TONES = [
  "#f8d9c0",
  "#f1c27d",
  "#e0ac69",
  "#c68642",
  "#8d5524",
  "#ffdbb4",
];

export const HAIR_COLORS = [
  "#1b1b1b",
  "#3b2f2f",
  "#6b4423",
  "#a55728",
  "#d6b370",
  "#e8e8e8",
  "#b03060",
  "#3a5fcd",
];

export const ACCENT_COLORS = [
  "#14b8a6",
  "#22d3ee",
  "#f472b6",
  "#a78bfa",
  "#f59e0b",
  "#34d399",
  "#ef4444",
];

export const BG_COLORS = [
  "#eef2ff",
  "#fef3c7",
  "#dcfce7",
  "#fae8ff",
  "#e0f2fe",
  "#f1f5f9",
  "#0f172a",
  "#1e293b",
];

export const DEFAULT_CONFIG = {
  seed: "altf-avatar",
  style: "flat",
  background: "gradient-sunset",
  colors: {
    skin: "#f1c27d",
    hair: "#3b2f2f",
    background: "#eef2ff",
    accent: "#14b8a6",
  },
  features: {
    faceShape: "oval",
    eyes: "round",
    eyebrows: "curved",
    mouth: "smile",
    hair: "short",
    facialHair: "none",
    accessory: "none",
  },
};

export function cloneDefaultConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}
