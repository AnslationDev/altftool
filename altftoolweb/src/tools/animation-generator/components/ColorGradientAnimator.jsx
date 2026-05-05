import React from "react";

export default function ColorGradientAnimator({
  color1,
  color2,
  setColor1,
  setColor2,
  useGradient,
  setUseGradient
}) {
  return (
    <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg space-y-3">

      <p className="font-semibold text-[var(--foreground)]">
        Color & Gradient Animation
      </p>

      <div className="flex gap-3 items-center">
        <label className="text-sm">Color 1</label>
        <input
          type="color"
          value={color1}
          onChange={(e) => setColor1(e.target.value)}
        />
      </div>

      <div className="flex gap-3 items-center">
        <label className="text-sm">Color 2</label>
        <input
          type="color"
          value={color2}
          onChange={(e) => setColor2(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={useGradient}
          onChange={() => setUseGradient(!useGradient)}
        />
        <label className="text-sm">Use Gradient</label>
      </div>

      {/* Preview */}
      <div
        className="h-16 rounded"
        style={{
          background: useGradient
            ? `linear-gradient(45deg, ${color1}, ${color2})`
            : color1
        }}
      />

    </div>
  );
}