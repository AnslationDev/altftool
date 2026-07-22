"use client";

export default function ProgressBar({ current, total }) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm font-bold">
        <span className="text-[var(--muted-foreground)]">
          Question {current + 1} of {total}
        </span>
        <span className="text-[var(--foreground)]">{Math.round(percent)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
