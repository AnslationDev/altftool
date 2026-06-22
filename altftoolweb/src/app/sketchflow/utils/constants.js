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

