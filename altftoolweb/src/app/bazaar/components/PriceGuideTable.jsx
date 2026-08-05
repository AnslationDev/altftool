import Link from "next/link";

import { formatPrice } from "../data/listings";

/**
 * Price table for the guide pages — server-safe on purpose.
 *
 * Every number here is derived from `getPriceStats()`, which reads the
 * *asking* price of live ads. That is not the same thing as a transaction
 * price, and a table that quietly implies otherwise would be the single most
 * misleading thing on the vertical. So the component does three things:
 *
 *  1. always shows the sample size the row was computed from;
 *  2. flags any row built from fewer than `THIN_SAMPLE` ads instead of
 *     presenting a one-ad "median" with the same confidence as a fifty-ad one;
 *  3. leaves the wording of the caveat to the page, which knows the context.
 *
 * Layout: the table scrolls inside its own container rather than forcing the
 * page body to scroll sideways at 360px.
 *
 * @param {{
 *   caption: string,
 *   columnLabel?: string,
 *   rows: Array<{ key: string, label: string, href?: string, stats: object|null }>,
 *   emptyMessage?: string,
 * }} props
 */

/** Below this many ads a median is indicative at best. */
const THIN_SAMPLE = 5;

export default function PriceGuideTable({
  caption,
  columnLabel = "Place",
  rows = [],
  emptyMessage = "No priced ads yet, so there is nothing honest to average.",
}) {
  const usable = rows.filter((row) => row.stats && row.stats.count > 0);

  if (usable.length === 0) {
    return <p className="bzr-note">{emptyMessage}</p>;
  }

  const hasThinRow = usable.some((row) => row.stats.count < THIN_SAMPLE);

  return (
    <div>
      <div className="overflow-x-auto rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border)">
        <table className="w-full min-w-[36rem] border-collapse text-start text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-(--card) text-xs uppercase tracking-wide text-(--muted-foreground)">
              <th scope="col" className="px-3 py-2.5 font-semibold">
                {columnLabel}
              </th>
              <th scope="col" className="px-3 py-2.5 text-end font-semibold">
                Ads
              </th>
              <th scope="col" className="px-3 py-2.5 text-end font-semibold">
                Median ask
              </th>
              <th scope="col" className="px-3 py-2.5 text-end font-semibold">
                Typical range
              </th>
              <th scope="col" className="px-3 py-2.5 text-end font-semibold">
                Lowest
              </th>
              <th scope="col" className="px-3 py-2.5 text-end font-semibold">
                Highest
              </th>
            </tr>
          </thead>
          <tbody>
            {usable.map((row) => {
              const { stats } = row;
              const thin = stats.count < THIN_SAMPLE;
              return (
                <tr key={row.key} className="border-t border-(--border)">
                  <th scope="row" className="px-3 py-2.5 font-medium text-(--foreground)">
                    {row.href ? (
                      <Link href={row.href} className="hover:underline">
                        {row.label}
                      </Link>
                    ) : (
                      row.label
                    )}
                  </th>
                  <td className="whitespace-nowrap px-3 py-2.5 text-end text-(--muted-foreground)">
                    {stats.count.toLocaleString("en-IN")}
                    {thin ? (
                      <span className="ms-1 text-xs font-semibold text-(--muted-foreground)">
                        <abbr title="Fewer than 5 ads — indicative only">*</abbr>
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-end font-semibold text-(--foreground)">
                    {formatPrice(stats.median)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-end text-(--muted-foreground)">
                    {formatPrice(stats.p25)} &ndash; {formatPrice(stats.p75)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-end text-(--muted-foreground)">
                    {formatPrice(stats.min)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-end text-(--muted-foreground)">
                    {formatPrice(stats.max)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">
        &ldquo;Typical range&rdquo; is the 25th to 75th percentile: half of the ads sit inside it.
        {hasThinRow
          ? " Rows marked * come from fewer than five ads, so read them as a single data point rather than a market rate."
          : ""}
      </p>
    </div>
  );
}
