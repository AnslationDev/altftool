export default function ScoreCard({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-center">
      <p className="text-xs font-semibold uppercase leading-4 text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
