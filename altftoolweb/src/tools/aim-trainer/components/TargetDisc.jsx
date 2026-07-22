"use client";

// Concentric-ring target disc. The vivid red/white palette is intentional game
// art — the arena supplies its own dark backdrop, so the disc stays legible in
// both light and dark page themes.
const TARGET_FACE =
  "radial-gradient(circle, #ef4444 0 14%, #ffffff 14% 32%, #ef4444 32% 50%, #ffffff 50% 68%, #dc2626 68% 100%)";

export default function TargetDisc({ x, y, size, opacity = 1, onHit }) {
  return (
    <div
      onPointerDown={onHit}
      aria-hidden="true"
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        background: TARGET_FACE,
        border: "2px solid rgba(255, 255, 255, 0.85)",
        boxShadow: "0 0 16px rgba(239, 68, 68, 0.45), 0 2px 8px rgba(2, 6, 23, 0.5)",
        opacity,
        cursor: "crosshair",
        touchAction: "manipulation",
      }}
    />
  );
}
