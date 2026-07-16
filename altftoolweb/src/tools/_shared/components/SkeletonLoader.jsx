"use client";

export default function SkeletonLoader({ lines = 4 }) {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 w-2/3 rounded-lg bg-[var(--border)] animate-pulse" />
      <div className="h-4 w-1/3 rounded bg-[var(--border)] animate-pulse" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-[var(--border)] animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] p-6 space-y-4 animate-pulse">
      <div className="h-6 w-1/2 rounded bg-[var(--border)]" />
      <div className="h-32 rounded-lg bg-[var(--border)]" />
      <div className="h-4 w-3/4 rounded bg-[var(--border)]" />
      <div className="h-10 w-full rounded-lg bg-[var(--border)]" />
    </div>
  );
}

export function ToolGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
