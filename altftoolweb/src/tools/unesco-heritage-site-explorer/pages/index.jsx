"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe2, RotateCcw, Search } from "lucide-react";

import {
  CATEGORIES,
  REGIONS,
  SORTS,
  filterSites,
  listCountries,
  summarise,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("name");
  const [copied, setCopied] = useState(false);

  const countries = useMemo(() => listCountries(), []);
  const result = useMemo(
    () => filterSites({ query, country, region, category, sort }),
    [query, country, region, category, sort],
  );
  const sites = result.items;
  const stats = useMemo(() => summarise(sites), [sites]);

  const summary = useMemo(
    () =>
      [
        "UNESCO Heritage Site Explorer",
        `Matched sites: ${sites.length}`,
        `Countries/areas: ${stats.countries}`,
        stats.earliest ? `Earliest inscription in result: ${stats.earliest}` : "No sites matched",
        "",
        ...sites.map((site) => `- ${site.name} (${site.country}) — ${site.category}, ${site.year}`),
      ].join("\n"),
    [sites, stats],
  );

  const reset = () => {
    setQuery("");
    setCountry("all");
    setRegion("all");
    setCategory("all");
    setSort("name");
    setCopied(false);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          World heritage reference
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          UNESCO Heritage Site Explorer
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Search and filter a curated UNESCO World Heritage reference set by region,
          country, cultural/natural/mixed category and inscription year.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="lg:col-span-2">
            <span className={LABEL_CLASS}>Search site, country or note</span>
            <span className="relative mt-2 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
              <input
                className={`${INPUT_CLASS} pl-9`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. reef, India, Inca"
                type="search"
              />
            </span>
          </label>
          <label>
            <span className={LABEL_CLASS}>Country / area</span>
            <select className={`${INPUT_CLASS} mt-2`} value={country} onChange={(event) => setCountry(event.target.value)}>
              <option value="all">All countries</option>
              {countries.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={LABEL_CLASS}>Region</span>
            <select className={`${INPUT_CLASS} mt-2`} value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="all">All regions</option>
              {REGIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={LABEL_CLASS}>Category</span>
            <select className={`${INPUT_CLASS} mt-2`} value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label>
            <span className={LABEL_CLASS}>Sort</span>
            <select className={`${INPUT_CLASS} mt-2 min-w-56`} value={sort} onChange={(event) => setSort(event.target.value)}>
              {SORTS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <button type="button" className={BUTTON} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button type="button" className={BUTTON} onClick={copySummary}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy list"}
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className={CARD} data-testid="tool-output">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Result summary
          </p>
          <p className="mt-2 text-5xl font-bold text-[var(--primary)]">{sites.length}</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            matched sites across {stats.countries} countries/areas, from {stats.earliest || "—"} to{" "}
            {stats.latest || "—"}.
          </p>
          <div className="mt-5 rounded-lg bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--foreground)]">Category split</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Cultural {stats.byCategory.Cultural} · Natural {stats.byCategory.Natural} · Mixed{" "}
              {stats.byCategory.Mixed}
            </p>
          </div>
          {result.error ? (
            <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {result.error}
            </p>
          ) : null}
        </aside>

        <div className="grid gap-3">
          {sites.length ? (
            sites.map((site) => (
              <article key={`${site.name}-${site.year}`} className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">{site.name}</h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {site.country} · {site.region}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    {site.category} · {site.year}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{site.note}</p>
              </article>
            ))
          ) : (
            <div className="rounded-xl bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
              No UNESCO sites matched. Try a wider region or clear the search.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
