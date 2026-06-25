import {
  ArrowUpRight,
  Circle,
  Diamond,
  Eraser,
  Frame,
  Image as ImageIcon,
  MousePointer2,
  PenLine,
  Square,
  Slash,
  TextCursorInput,
  Zap
} from "lucide-react";

export const STORAGE_KEY = "altftool-sketchflow-scene-v1";
export const HISTORY_LIMIT = 200;
export const ACCENT = "#6965db";
export const DEFAULT_STYLE = {
  strokeColor: "#1f2937",
  backgroundColor: "transparent",
  fillStyle: "hachure",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  fontSize: 28,
  fontFamily: '"Architects Daughter", Excalifont, Virgil, system-ui, sans-serif',
  textAlign: "left",
  arrowType: "straight",
  startArrowhead: "none",
  endArrowhead: "triangle",
};
export const TOOL_KEYS = {
  v: "select",
  r: "rectangle",
  d: "diamond",
  e: "ellipse",
  a: "arrow",
  l: "line",
  p: "freedraw",
  t: "text",
  x: "eraser",
  i: "image",
};
export const TOOLBAR = [
  ["select", "Selection", "V", MousePointer2],
  ["rectangle", "Rectangle", "R", Square],
  ["diamond", "Diamond", "D", Diamond],
  ["ellipse", "Ellipse", "E", Circle],
  ["arrow", "Arrow", "A", ArrowUpRight],
  ["line", "Line", "L", Slash],
  ["freedraw", "Freedraw", "P", PenLine],
  ["text", "Text", "T", TextCursorInput],
  ["eraser", "Eraser", "X", Eraser],
  ["image", "Image", "I", ImageIcon],
  ["frame", "Frame", "F", Frame],
  ["laser", "Laser Pointer", "K", Zap],
];

export const TOOL_ICONS = {
  select: MousePointer2,
  rectangle: Square,
  diamond: Diamond,
  ellipse: Circle,
  arrow: ArrowUpRight,
  line: Slash,
  freedraw: PenLine,
  text: TextCursorInput,
  eraser: Eraser,
  image: ImageIcon,
  frame: Frame,
  laser: Zap,
};

export function buildToolbarFromConfig(toolItems) {
  if (!toolItems?.length) return TOOLBAR;
  return toolItems
    .filter((tool) => tool.enabled !== false)
    .map((tool) => [tool.id, tool.label, tool.shortcut, TOOL_ICONS[tool.id] || MousePointer2]);
}

export function buildToolKeysFromConfig(toolItems) {
  // Only fall back to the static TOOL_KEYS when no admin config exists at all.
  // When toolItems IS provided (even if every shortcut was cleared), we respect
  // the admin's intent and return whatever keys they configured.
  if (!toolItems?.length) return TOOL_KEYS;
  const keys = {};
  toolItems.forEach((tool) => {
    if (tool.enabled === false || !tool.shortcut) return;
    keys[tool.shortcut.toLowerCase()] = tool.id;
  });
  return keys;
}

