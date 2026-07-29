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
import { COVERAGE_STATES, getSignalCoverage } from "./signalCoverage";

// Derived at render time from the coverage map, so the headline claim on this
// page cannot survive a tool being shipped or a verdict being corrected.
const COVERED_COUNT = SIGNAL_CATALOG.filter(
  (signal) => getSignalCoverage(signal.slug)?.state === "shipped",
).length;

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
  const coverage = getSignalCoverage(signal.slug);
  return (
    <article className="flex min-h-full flex-col rounded-lg border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
            {signal.category}
          </span>
          {coverage ? (
            <span className="ml-2 inline-flex rounded-full border border-border bg-surface-soft px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {COVERAGE_STATES[coverage.state]}
            </span>
          ) : null}
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

export default function SignalsExplorer({ answer, faqs = [] }) {
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
              AltF Signals: product demand research, and what AltFTool has actually built
            </h1>
            {/* Answer-first: a self-contained sentence with counts derived from
                the catalogue and the coverage map. */}
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground sm:text-lg">{answer}</p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Explore demand, momentum, competition, and practical product directions. Every signal states whether a working AltFTool utility exists for it.
            </p>
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
              <div><dt className="text-xs text-muted-foreground">Signals tracked</dt><dd className="font-semibold tabular-nums">{SIGNAL_CATALOG.length}</dd></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
              <div><dt className="text-xs text-muted-foreground">AltFTool ships a tool</dt><dd className="font-semibold tabular-nums">{COVERED_COUNT} of {SIGNAL_CATALOG.length}</dd></div>
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

      {/* The whole catalogue as a real table, including the coverage verdict.
          This is the one thing on /signals worth citing: an unfiltered list of
          what AltFTool has and has not built for each researched category. */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" aria-labelledby="signal-table-heading">
        <h2 id="signal-table-heading" className="text-2xl font-bold sm:text-3xl">
          Which researched categories does AltFTool actually have a tool for?
        </h2>
        <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Every tracked signal with its opportunity score, demand estimate and AltFTool coverage</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 font-semibold">Signal</th>
                <th scope="col" className="px-4 py-3 font-semibold">Score</th>
                <th scope="col" className="px-4 py-3 font-semibold">Monthly search</th>
                <th scope="col" className="px-4 py-3 font-semibold">Does AltFTool have it?</th>
              </tr>
            </thead>
            <tbody>
              {sortSignals(SIGNAL_CATALOG, "opportunity").map((signal) => {
                const coverage = getSignalCoverage(signal.slug);
                return (
                  <tr key={signal.slug} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 align-top font-semibold">
                      <Link
                        href={`/signals/${signal.slug}`}
                        className="rounded-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {signal.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3 align-top tabular-nums text-muted-foreground">{signal.opportunityScore}/100</td>
                    <td className="px-4 py-3 align-top tabular-nums text-muted-foreground">{formatSearchVolume(signal.searchVolume)}</td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {coverage ? COVERAGE_STATES[coverage.state] : "Not assessed"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {faqs.length ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold sm:text-3xl">Questions about AltF Signals</h2>
            <dl className="mt-5 divide-y divide-border rounded-lg border border-border bg-card px-5">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-4">
                  <dt className="text-base font-semibold text-foreground">{faq.question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>
    </main>
  );
}
