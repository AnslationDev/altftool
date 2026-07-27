// Side-by-side comparison grid for /alternatives/[incumbent].
//
// A real <table> with a real <caption> and scope="col"/scope="row" headers, so
// a screen reader announces "Row header, AltFTool column, value" instead of a
// wall of unlabelled cells. Tokens only (master.md): no hex, no hardcoded
// radius or shadow, and every colour resolves in both themes.
//
// Server component — no interactivity, so nothing here needs to reach the
// client bundle.

const ROWS = [
  { key: "processing", label: "Where the work happens" },
  { key: "account", label: "Account required" },
  { key: "freeCeiling", label: "Free tier ceiling" },
  { key: "paid", label: "Paid plans" },
  { key: "ads", label: "Ads" },
  { key: "apps", label: "Desktop / mobile apps" },
  { key: "api", label: "API & automation" },
];

const cellClass =
  "border-t border-(--border) px-4 py-3 align-top text-sm leading-6 text-(--foreground)";

export default function ComparisonTable({
  incumbentName,
  incumbent = {},
  altftool = {},
  caption,
}) {
  const rows = ROWS.filter((row) => incumbent[row.key] || altftool[row.key]);
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-[12px] border border-(--border) bg-(--surface)">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="px-4 pt-4 text-left text-sm leading-6 text-(--muted-foreground)">
          {caption ||
            `AltFTool compared with ${incumbentName}. Figures in the ${incumbentName} column are transcribed from their own pricing, help and privacy pages.`}
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-[24%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)"
            >
              <span className="sr-only">Comparison point</span>
              <span aria-hidden="true">Feature</span>
            </th>
            <th
              scope="col"
              className="w-[38%] px-4 py-3 text-sm font-semibold text-(--primary-text)"
            >
              AltFTool
            </th>
            <th
              scope="col"
              className="w-[38%] px-4 py-3 text-sm font-semibold text-(--foreground)"
            >
              {incumbentName}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th
                scope="row"
                className={`${cellClass} bg-(--muted) text-sm font-semibold`}
              >
                {row.label}
              </th>
              <td className={cellClass}>{altftool[row.key] || "—"}</td>
              <td className={cellClass}>{incumbent[row.key] || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
