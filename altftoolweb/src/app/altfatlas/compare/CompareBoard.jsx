"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Search, X } from "lucide-react";
import { ACCESS_LEVELS, CATEGORY_BY_SLUG } from "@altftool/core/atlas/taxonomy";
import { SitePlate } from "../_components/SiteCard";
import { AccessPill, RuntimeLine } from "../_components/Pills";

const MAX = 4;

const ACCESS_BY_ID = Object.fromEntries(
  ACCESS_LEVELS.map((level) => [level.id, level]),
);

/*
 * The compare board.
 *
 * Unlike /browse, this DOES sync to the query string: a comparison is a thing
 * you send to someone ("here, these three"), so the URL has to carry it. The
 * page is noindex for the same reason it is shareable — every combination is a
 * valid URL, and letting a crawler enumerate them would mint thousands of
 * near-identical pages competing with the category pages that should rank.
 *
 * History is written with replaceState rather than the router so that picking
 * a fourth tool does not push a back-button entry per click.
 */
export default function CompareBoard({ entries = [], initialSlugs = [] }) {
  const bySlug = useMemo(
    () => Object.fromEntries(entries.map((entry) => [entry.slug, entry])),
    [entries],
  );

  const [selected, setSelected] = useState(() =>
    initialSlugs.filter((slug) => bySlug[slug]).slice(0, MAX),
  );
  const [query, setQuery] = useState("");

  const syncUrl = (slugs) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (slugs.length) url.searchParams.set("sites", slugs.join(","));
    else url.searchParams.delete("sites");
    window.history.replaceState(null, "", url);
  };

  const update = (slugs) => {
    setSelected(slugs);
    syncUrl(slugs);
  };

  const add = (slug) => {
    if (selected.includes(slug) || selected.length >= MAX) return;
    update([...selected, slug]);
    setQuery("");
  };

  const remove = (slug) => update(selected.filter((item) => item !== slug));

  const needle = query.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (needle.length < 2) return [];
    return entries
      .filter((entry) => !selected.includes(entry.slug))
      .filter(
        (entry) =>
          entry.name.toLowerCase().includes(needle) ||
          entry.domain.toLowerCase().includes(needle) ||
          entry.tagline.toLowerCase().includes(needle),
      )
      .slice(0, 8);
  }, [entries, needle, selected]);

  const chosen = selected.map((slug) => bySlug[slug]).filter(Boolean);

  const ROWS = [
    {
      label: "What it does",
      render: (entry) => (
        <span className="text-foreground">{entry.tagline}</span>
      ),
    },
    {
      label: "What it costs you",
      render: (entry) => (
        // justify-items-start, or the grid stretches the pill to the full
        // column width and it stops reading as a pill.
        <span className="grid justify-items-start gap-1.5">
          <AccessPill access={entry.access} />
          <span className="text-xs text-muted-foreground">
            {ACCESS_BY_ID[entry.access]?.blurb}
          </span>
        </span>
      ),
    },
    {
      label: "Your files",
      render: (entry) => <RuntimeLine runtime={entry.runtime} />,
    },
    {
      // The reason this table is worth building. Feature checklists make every
      // tool look equivalent; the limits row is where they actually differ.
      label: "Where it stops",
      render: (entry) => (
        <span className="text-muted-foreground">{entry.limits}</span>
      ),
    },
    {
      label: "Best for",
      render: (entry) => (
        <ul className="grid gap-1">
          {(entry.bestFor || []).map((item) => (
            <li key={item} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Category",
      render: (entry) => {
        const category = CATEGORY_BY_SLUG[entry.category];
        return category ? (
          <Link
            href={`/altfatlas/category/${category.slug}`}
            prefetch={false}
            className="text-primary underline underline-offset-2"
          >
            {category.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      label: "Last checked",
      render: (entry) => <span className="afa-domain">{entry.checked}</span>,
    },
  ];

  return (
    <div className="grid gap-6">
      {/* ---------------------- picker ---------------------- */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {chosen.map((entry) => (
            <span
              key={entry.slug}
              className={`afa-stripe afa-access-${entry.access} inline-flex items-center gap-2 rounded-r-md bg-muted/50 py-1.5 pl-2.5 pr-1.5 text-sm font-semibold text-foreground`}
            >
              {entry.name}
              <button
                type="button"
                onClick={() => remove(entry.slug)}
                aria-label={`Remove ${entry.name} from the comparison`}
                className="grid h-6 w-6 place-items-center rounded text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          {chosen.length < MAX ? (
            <span className="relative min-w-56 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  chosen.length
                    ? "Add another…"
                    : "Search for a site to compare…"
                }
                aria-label="Search for a site to add to the comparison"
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Four is the maximum — remove one to add another.
            </span>
          )}
        </div>

        {suggestions.length ? (
          <ul className="mt-3 grid gap-1 border-t border-border pt-3">
            {suggestions.map((entry) => (
              <li key={entry.slug}>
                <button
                  type="button"
                  onClick={() => add(entry.slug)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <SitePlate name={entry.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {entry.name}
                    </span>
                    <span className="afa-domain block truncate">
                      {entry.tagline}
                    </span>
                  </span>
                  <Plus
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* ---------------------- table ---------------------- */}
      {chosen.length >= 2 ? (
        <div className="afa-scroll-x rounded-lg border border-border">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">
              Side-by-side comparison of {chosen.map((e) => e.name).join(", ")}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-40 border-b border-border p-3" />
                {chosen.map((entry) => (
                  <th
                    key={entry.slug}
                    scope="col"
                    className={`afa-stripe afa-access-${entry.access} border-b border-border p-3 text-left align-top`}
                  >
                    <span className="flex items-start gap-2.5">
                      <SitePlate name={entry.name} size="sm" />
                      <span className="min-w-0">
                        <Link
                          href={`/altfatlas/site/${entry.slug}`}
                          prefetch={false}
                          className="block text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {entry.name}
                        </Link>
                        <span className="afa-domain block">{entry.domain}</span>
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="align-top">
                  <th
                    scope="row"
                    className="afa-eyebrow border-b border-border p-3 text-left"
                  >
                    {row.label}
                  </th>
                  {chosen.map((entry) => (
                    <td
                      key={entry.slug}
                      className="border-b border-border p-3 text-[0.8125rem] leading-relaxed"
                    >
                      {row.render(entry)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="p-3 text-left">
                  <span className="sr-only">Open the site</span>
                </th>
                {chosen.map((entry) => (
                  <td key={entry.slug} className="p-3">
                    {entry.url ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Open
                      </a>
                    ) : null}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            {chosen.length === 1
              ? "Add one more to compare"
              : "Pick two to four sites"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            The comparison shows what each one costs you before it works,
            whether your files are uploaded, and — the part that actually
            differs — where each one stops.
          </p>
        </div>
      )}

      {chosen.length >= 2 ? (
        <p className="text-xs text-muted-foreground">
          This comparison is in the address bar — copy the URL to send it to
          someone.
        </p>
      ) : null}
    </div>
  );
}
