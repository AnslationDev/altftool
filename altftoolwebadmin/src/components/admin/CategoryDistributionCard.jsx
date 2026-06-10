"use client";

// Token-driven palette built from the design system primary + status hues.
// Picks color-mix tints so it stays harmonious in both light and dark themes.
const COLORS = [
  "var(--primary)",
  "var(--anslation-ds-warning)",
  "var(--anslation-ds-danger)",
  "var(--anslation-ds-success)",
  "color-mix(in srgb, var(--primary) 60%, var(--anslation-ds-success))",
  "color-mix(in srgb, var(--primary) 60%, var(--anslation-ds-warning))",
];

export default function CategoryDistributionCard({ title, items = [], total = 0, totalLabel = "Total" }) {
  const sortedItems = [...items].sort((a, b) => Number(b.value || 0) - Number(a.value || 0)).slice(0, 6);
  const maxValue = Math.max(...sortedItems.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="bg-(--surface) border border-(--border) rounded-2xl shadow-sm p-5">
      <h3 className="mb-4 text-sm font-semibold text-(--foreground)">{title}</h3>

      <div className="flex min-h-64 flex-col justify-center gap-4">
        <div
          className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-(--surface) text-center shadow-inner"
          style={{ border: "14px solid var(--anslation-ds-primary-soft)" }}
        >
          <div>
            <p className="text-2xl font-bold tabular-nums text-(--foreground)">{total}</p>
            <p className="text-xs font-medium text-(--muted)">{totalLabel}</p>
          </div>
        </div>

        <div className="space-y-3">
          {sortedItems.length > 0 ? (
            sortedItems.map((item, index) => {
              const value = Number(item.value || 0);
              const width = `${Math.max(8, Math.round((value / maxValue) * 100))}%`;
              return (
                <div key={item.name || index} className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-semibold text-(--foreground)">{item.name || "Uncategorized"}</span>
                    <span className="font-bold tabular-nums text-(--foreground)">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--surface-soft)">
                    <div
                      className="h-full rounded-full"
                      style={{ width, backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-(--border) py-8 text-center text-sm font-medium text-(--muted)">
              No categories yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
