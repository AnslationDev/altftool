"use client";

export default function ProgressBar({ value, colorClass = "bg-primary", height = "h-2", className = "" }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div
      className={`w-full ${height} rounded-full bg-(--muted) overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`${height} rounded-full transition-[width] duration-700 ease-out ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
