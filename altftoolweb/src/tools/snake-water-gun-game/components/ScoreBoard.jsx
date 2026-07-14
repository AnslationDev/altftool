export default function ScoreBoard({ wins, losses, draws, totalMatches }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Scoreboard</p>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2.5">
          <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Wins</span>
          <span className="mt-0.5 block text-xl font-bold text-[var(--anslation-ds-success)]">{wins}</span>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2.5">
          <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Losses</span>
          <span className="mt-0.5 block text-xl font-bold text-[var(--anslation-ds-danger)]">{losses}</span>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2.5">
          <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Draws</span>
          <span className="mt-0.5 block text-xl font-bold text-[var(--muted-foreground)]">{draws}</span>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2.5">
          <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Total</span>
          <span className="mt-0.5 block text-xl font-bold text-[var(--foreground)]">{totalMatches}</span>
        </div>
      </div>
    </div>
  );
}
