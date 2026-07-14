// utils/constants.js
// Shared constants for the Chess Multiplayer tool.

export const TIME_CONTROLS = [
  { id: "bullet", label: "Bullet", minutes: 1, increment: 0, description: "1 min, no increment" },
  { id: "blitz3", label: "Blitz", minutes: 3, increment: 0, description: "3 min, no increment" },
  { id: "blitz5", label: "Blitz", minutes: 5, increment: 0, description: "5 min, no increment" },
  { id: "rapid10", label: "Rapid", minutes: 10, increment: 0, description: "10 min, no increment" },
  { id: "rapid15", label: "Rapid", minutes: 15, increment: 10, description: "15 min + 10s" },
  { id: "classical", label: "Classical", minutes: 30, increment: 0, description: "30 min, no increment" },
];

export const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export const COLORS = { w: "White", b: "Black" };

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
