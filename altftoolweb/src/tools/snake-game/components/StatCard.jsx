export default function StatCard({ label, value, live = false }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p
        className="mt-2 text-2xl font-semibold text-[var(--primary)]"
        {...(live ? { "aria-live": "polite", "aria-atomic": "true" } : {})}
      >
        {value}
      </p>
    </div>
  );
}
