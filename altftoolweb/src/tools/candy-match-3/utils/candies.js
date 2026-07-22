import { Circle, Square, Star, Leaf, Droplet, Hexagon } from "lucide-react";

// Six candy types. Each has a distinct COLOR *and* a distinct SHAPE (lucide icon)
// so the game is playable for color-blind users (accessibility requirement).
export const CANDY_TYPES = [
  { id: 0, name: "Cherry", color: "#ef4444", Icon: Circle },
  { id: 1, name: "Orange", color: "#f97316", Icon: Square },
  { id: 2, name: "Lemon", color: "#eab308", Icon: Star },
  { id: 3, name: "Apple", color: "#22c55e", Icon: Leaf },
  { id: 4, name: "Berry", color: "#3b82f6", Icon: Droplet },
  { id: 5, name: "Grape", color: "#a855f7", Icon: Hexagon },
];

export const CANDY_COUNT = CANDY_TYPES.length;

export function getCandy(type) {
  return CANDY_TYPES[type];
}

// Lighten (positive percent) or darken (negative percent) a hex color.
// Used for the candy tile gradient so pieces look glossy/premium.
export function shade(hex, percent) {
  const f = percent / 100;
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  r = Math.min(255, Math.round(r * (1 + f)));
  g = Math.min(255, Math.round(g * (1 + f)));
  b = Math.min(255, Math.round(b * (1 + f)));
  return `rgb(${r}, ${g}, ${b})`;
}
