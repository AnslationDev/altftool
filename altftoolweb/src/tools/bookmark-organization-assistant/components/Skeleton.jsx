"use client";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-(--border) bg-(--card) ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-40" />
      ))}
    </div>
  );
}
