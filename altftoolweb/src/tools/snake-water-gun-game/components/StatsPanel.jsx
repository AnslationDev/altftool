export default function StatsPanel({ wins, losses, draws, totalMatches, winRate, currentStreak, bestStreak }) {
  const statItems = [
    { label: "Win Rate", value: winRate },
    { label: "Current Streak", value: currentStreak },
    { label: "Best Streak", value: bestStreak },
    { label: "Matches Played", value: totalMatches },
  ];

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Statistics</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-2.5 text-center">
            <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">{item.label}</span>
            <span className="mt-0.5 block text-lg font-bold text-[var(--foreground)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
