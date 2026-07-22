export default function StatsStrip({ stats }) {
  const items = [
    { label: "Total Workflows", value: stats.total },
    { label: "Avg. Nodes / Workflow", value: stats.avgComplexity },
    {
      label: "Top Category",
      value: stats.topCategory,
      sub: `${stats.topCategoryShare}%`,
    },
  ];
  return (
    <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-(--color-border) bg-(--color-card) p-6 text-center"
        >
          <div className="text-2xl font-extrabold text-(--color-primary)">
            {it.value}
            {it.sub && (
              <span className="ml-1 text-base text-(--color-muted-foreground)">
                ({it.sub})
              </span>
            )}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wide text-(--color-muted-foreground)">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
