"use client";

export default function StatCard({ label, value, accent }) {
  const accentClass = accent ? "text-(--primary)" : "text-(--foreground)";
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-(--border) bg-(--card) px-4 py-3 shadow-sm">
      <span className={`text-2xl font-bold tabular-nums ${accentClass}`}>{value}</span>
      <span className="mt-0.5 text-xs font-medium text-(--muted-foreground)">{label}</span>
    </div>
  );
}
