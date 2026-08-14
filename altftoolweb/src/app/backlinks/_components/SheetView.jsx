import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  COST_LABELS,
  EFFORT_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  impactTier,
} from "@altftool/core/backlinks";
import CopyButton from "./CopyButton";

/*
 * Spreadsheet view of the same rows.
 *
 * The data comes from a Google Sheet and the people maintaining it think in
 * rows and columns, so this is the view for working through the list rather
 * than deciding from it: every field visible at once, frozen header, frozen
 * site column, row numbers, per-column sort.
 *
 * Server-rendered. Only the copy buttons are client components, so the grid
 * costs nothing to hydrate and the whole table is in the HTML for crawlers.
 */

const COST_VAR = {
  free: "--bl-free",
  freemium: "--bl-freemium",
  paid: "--bl-paid",
  unknown: "--bl-unknown",
};
const EFFORT_VAR = {
  low: "--bl-effort-low",
  medium: "--bl-effort-medium",
  high: "--bl-effort-high",
};
const TIER_VAR = { s: "--bl-tier-s", a: "--bl-tier-a", b: "--bl-tier-b", c: "--bl-tier-c" };

/* Only the columns that are genuinely orderable get a sort link. Sorting by
   "rules" or "guidance" would be noise. */
const COLUMNS = [
  { key: "impact", label: "Impact", sort: "impact", align: "right", width: "4.5rem" },
  { key: "website", label: "Site", sticky: true, width: "13rem", sort: "name" },
  { key: "domain", label: "Domain", width: "12rem" },
  { key: "group", label: "Type", width: "11rem" },
  { key: "cost", label: "Cost", width: "8rem" },
  { key: "effort", label: "Effort", sort: "effort", width: "6.5rem" },
  { key: "priority", label: "Priority", width: "6.5rem" },
  { key: "status", label: "Status", width: "9rem" },
  { key: "guidance", label: "What to prepare", width: "26rem" },
  { key: "rules", label: "Rules / caveat", width: "22rem" },
  { key: "checked", label: "Checked", width: "7rem" },
  { key: "actions", label: "", width: "5.5rem" },
];

function sortHref(buildHref, current, sortKey) {
  // Third click on the same column returns to the default ordering.
  const next = current.sort === sortKey ? "" : sortKey;
  return buildHref({ sort: next, page: "" });
}

export default function SheetView({ rows, groupLabels, current, buildHref, startIndex = 0 }) {
  return (
    <div className="bl-sheet-wrap" tabIndex={0} role="region" aria-label="Opportunities, spreadsheet view">
      <table className="bl-sheet">
        <caption className="sr-only">
          Submission opportunities with impact score, cost, effort, priority, status and
          preparation notes. Scroll horizontally for all columns.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="bl-sheet__gutter" title="Row">
              #
            </th>
            {COLUMNS.map((c) => {
              const active = c.sort && (current.sort || "impact") === c.sort;
              return (
                <th
                  key={c.key}
                  scope="col"
                  className={c.sticky ? "bl-sheet__sticky" : undefined}
                  style={{ minWidth: c.width }}
                  aria-sort={active ? "descending" : undefined}
                >
                  {c.sort ? (
                    <Link
                      className="bl-sheet__sort"
                      href={sortHref(buildHref, current, c.sort)}
                      scroll={false}
                      aria-sort={active ? "descending" : undefined}
                    >
                      {c.label}
                      {active ? (
                        <ChevronDown className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ChevronUp className="h-3 w-3 opacity-30" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {active ? " (sorted)" : " — click to sort"}
                      </span>
                    </Link>
                  ) : (
                    c.label || <span className="sr-only">Actions</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((item, i) => {
            const tier = impactTier(item.impact);
            return (
              <tr key={item.slug}>
                <td className="bl-sheet__gutter">{startIndex + i + 1}</td>

                <td className="bl-sheet__num" style={{ color: `var(${TIER_VAR[tier.id]})` }}>
                  {item.impact}
                </td>

                <td className="bl-sheet__sticky font-medium">
                  <Link href={`/backlinks/${item.slug}`} className="hover:text-primary">
                    {item.website}
                  </Link>
                </td>

                <td className="font-mono text-[0.75rem] text-muted-foreground">{item.domain}</td>

                <td className="text-muted-foreground">{groupLabels[item.group] ?? item.group}</td>

                <td>
                  <span className="bl-cell-chip" style={{ "--bl-chip-hue": `var(${COST_VAR[item.cost]})` }}>
                    {COST_LABELS[item.cost]}
                  </span>
                </td>

                <td>
                  <span className="bl-cell-chip" style={{ "--bl-chip-hue": `var(${EFFORT_VAR[item.effort]})` }}>
                    {EFFORT_LABELS[item.effort]}
                  </span>
                </td>

                <td className="font-mono text-[0.75rem] text-muted-foreground">
                  {PRIORITY_LABELS[item.priority]}
                </td>

                <td className="text-muted-foreground">{STATUS_LABELS[item.status]}</td>

                {/* The two long free-text columns are the reason this view exists,
                    but they must not blow the row height, so they clip with a
                    title fallback for the full text. */}
                <td className="max-w-[26rem] truncate text-muted-foreground" title={item.guidance}>
                  {item.guidance || "—"}
                </td>
                <td className="max-w-[22rem] truncate text-muted-foreground" title={item.rules}>
                  {item.rules || "—"}
                </td>

                <td className="font-mono text-[0.6875rem] text-muted-foreground">
                  {item.checked || "—"}
                </td>

                <td>
                  <span className="bl-sheet__actions">
                    <a
                      className="bl-micro"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow ugc"
                      title={`Open ${item.website} submit page`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">
                        Open {item.website} submit page (new tab)
                      </span>
                    </a>
                    <CopyButton value={item.url} label={`${item.website} submit URL`} />
                    <Link className="bl-micro" href={`/backlinks/${item.slug}`} title="Open details">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">{item.website} details</span>
                    </Link>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
