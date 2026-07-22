"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Filter,
  Gauge,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  SIGNAL_CATALOG,
  SIGNAL_CATEGORIES,
  SIGNAL_DATA_AS_OF,
  formatSearchVolume,
} from "@altftool/core/signals";

const MOMENTUM_OPTIONS = ["All momentum", "Surging", "Rising", "Stable demand"];
const SORT_OPTIONS = [
  { value: "opportunity", label: "Highest opportunity" },
  { value: "volume", label: "Highest search demand" },
  { value: "name", label: "Name A-Z" },
];

function sortSignals(items, sort) {
  return [...items].sort((a, b) => {
    if (sort === "volume") return (b.searchVolume || 0) - (a.searchVolume || 0);
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.opportunityScore - a.opportunityScore;
  });
}

function SignalCard({ signal }) {
  return (
    <article className="flex min-h-full flex-col rounded-lg border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
            {signal.category}
          </span>
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            <Link className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href={`/signals/${signal.slug}`}>
              {signal.name}
            </Link>
          </h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface-soft px-2.5 py-1 text-xs font-medium text-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {signal.momentum}
        </span>
      </div>

      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{signal.summary}</p>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-4">
        <div>
          <dt className="text-xs text-muted-foreground">Opportunity</dt>
          <dd className="mt-1 text-base font-semibold tabular-nums text-foreground">{signal.opportunityScore}/100</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Monthly search</dt>
          <dd className="mt-1 text-base font-semibold tabular-nums text-foreground">{formatSearchVolume(signal.searchVolume)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Competition</dt>
          <dd className="mt-1 text-base font-semibold text-foreground">{signal.competition}</dd>
        </div>
      </dl>

      <Link
        href={`/signals/${signal.slug}`}
        className="mt-4 inline-flex items-center justify-between rounded-md text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        View research snapshot
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function SignalsExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [momentum, setMomentum] = useState("All momentum");
  const [sort, setSort] = useState("opportunity");

  const filteredSignals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = SIGNAL_CATALOG.filter((signal) => {
      const matchesQuery =
        !normalizedQuery ||
        [signal.name, signal.query, signal.summary, signal.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory = category === "All" || signal.category === category;
      const matchesMomentum = momentum === "All momentum" || signal.momentum === momentum;
      return matchesQuery && matchesCategory && matchesMomentum;
    });
    return sortSignals(filtered, sort);
  }, [category, momentum, query, sort]);

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AltF Signals
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
              Find useful product opportunities, then act on them
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore demand, momentum, competition, and practical product directions. Every signal connects to research and working AltFTool utilities.
            </p>
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
              <div><dt className="text-xs text-muted-foreground">Signals tracked</dt><dd className="font-semibold tabular-nums">{SIGNAL_CATALOG.length}</dd></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
              <div><dt className="text-xs text-muted-foreground">Coverage</dt><dd className="font-semibold">Worldwide</dd></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              <div><dt className="text-xs text-muted-foreground">Snapshot date</dt><dd className="font-semibold">{SIGNAL_DATA_AS_OF}</dd></div>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="relative block">
              <span className="sr-only">Search signals</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Search topics, problems, or categories"
              />
            </label>
            <label className="relative block">
              <span className="sr-only">Filter by momentum</span>
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <select value={momentum} onChange={(event) => setMomentum(event.target.value)} className="h-11 min-w-48 appearance-none rounded-md border border-border bg-background pl-10 pr-8 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                {MOMENTUM_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Sort signals</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 min-w-52 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Signal categories">
            {SIGNAL_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${category === item ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:text-foreground"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-semibold text-foreground">{filteredSignals.length}</span> signals found
          </p>
          {(query || category !== "All" || momentum !== "All momentum") && (
            <button type="button" onClick={() => { setQuery(""); setCategory("All"); setMomentum("All momentum"); }} className="text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Clear filters
            </button>
          )}
        </div>

        {filteredSignals.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSignals.map((signal) => <SignalCard key={signal.slug} signal={signal} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-soft px-6 py-14 text-center">
            <Search className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">No matching signals</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try a broader search or clear the active filters.</p>
          </div>
        )}
      </section>
    </main>
  );
}
