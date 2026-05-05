import React from "react";

export default function PerformanceIndicator({ controls, transform, animation }) {

  let score = 100;
  let warnings = [];

  /* CONTROLS BASED */

  if (controls?.iterations === "infinite") {
    score -= 20;
    warnings.push("Infinite animations can affect performance");
  }

  if (Number(controls?.duration) < 0.5) {
    score -= 10;
    warnings.push("Very fast animations can be janky");
  }

  /* TRANSFORM BASED */

  if (transform?.scale > 2) {
    score -= 10;
    warnings.push("Large scaling can cause repaint issues");
  }

  if (transform?.rotate > 180) {
    score -= 5;
  }

  if (Math.abs(transform?.x) > 200 || Math.abs(transform?.y) > 200) {
    score -= 10;
    warnings.push("Large movement may affect smoothness");
  }

  /* ANIMATION BASED */

  if (animation === "bounce") {
    score -= 10;
    warnings.push("Bounce animation can be heavy");
  }

  if (animation === "slideRight") {
    score -= 5;
  }

  if (animation === "fadeIn") {
    score += 5;
  }

  // clamp score
  score = Math.max(0, Math.min(100, score));

  // UI colors
  let scoreColor = "text-green-500";
  if (score < 80) scoreColor = "text-yellow-500";
  if (score < 60) scoreColor = "text-red-500";

  const recommendation =
    score > 80 ? "Mobile & Desktop"
    : score > 60 ? "Desktop Preferred"
    : "Avoid heavy usage";

  return (
    <div className="p-4 bg-[var(--card)] rounded-lg border border-[var(--border)] space-y-3">

      <p className="font-semibold text-[var(--foreground)]">
        Performance Indicator
      </p>

      <p className="text-sm">
        Performance Score:{" "}
        <span className={`font-bold ${scoreColor}`}>
          {score}%
        </span>
      </p>

      <p className="text-sm">
        GPU Accelerated:{" "}
        <span className="font-bold">
          {(transform?.x !== 0 || transform?.y !== 0 || transform?.scale !== 1 || transform?.rotate !== 0)
            ? "Yes ✅"
            : "No ❌"}
        </span>
      </p>

      <p className="text-sm">
        Recommended for:{" "}
        <span className="font-bold">
          {recommendation}
        </span>
      </p>

      {warnings.length > 0 && (
        <div className="text-xs text-red-500 space-y-1">
          {warnings.map((w, i) => (
            <p key={i}>⚠️ {w}</p>
          ))}
        </div>
      )}

    </div>
  );
}