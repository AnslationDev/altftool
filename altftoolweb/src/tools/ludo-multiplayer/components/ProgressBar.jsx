export default function ProgressBar({ value, max = 4, color = "var(--primary)", height = 6 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="w-full rounded-full bg-(--muted) overflow-hidden"
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
