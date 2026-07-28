"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw, Search } from "lucide-react";

import {
  ERAS,
  eraForYear,
  filterMonuments,
  formatYear,
  listStates,
  listStyles,
  SORTS,
  summarise,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  query: "",
  state: "all",
  era: "all",
  style: "all",
  unescoOnly: false,
  sort: "name",
};

const DASH = "—";

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [state, setState] = useState(DEFAULTS.state);
  const [era, setEra] = useState(DEFAULTS.era);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [unescoOnly, setUnescoOnly] = useState(DEFAULTS.unescoOnly);
  const [sort, setSort] = useState(DEFAULTS.sort);
  const [copied, setCopied] = useState(false);

  const states = useMemo(() => listStates(), []);
  const styles = useMemo(() => listStyles(), []);

  const result = useMemo(
    () => filterMonuments({ query, state, era, style, unescoOnly, sort }),
    [query, state, era, style, unescoOnly, sort],
  );

  const stats = useMemo(() => summarise(result.items), [result.items]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Indian Heritage Monument Explorer",
      `Monuments matched: ${stats.count}`,
      `States covered: ${stats.states}`,
      `UNESCO World Heritage entries: ${stats.unescoCount}`,
      "",
      ...result.items
        .slice(0, 40)
        .map(
          (item) =>
            `${item.name} — ${item.city}, ${item.state} · ${item.builtLabel} · ${item.style}`,
        ),
    ].join("\n");
  }, [result, stats]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setQuery(DEFAULTS.query);
    setState(DEFAULTS.state);
    setEra(DEFAULTS.era);
    setStyle(DEFAULTS.style);
    setUnescoOnly(DEFAULTS.unescoOnly);
    setSort(DEFAULTS.sort);
    setCopied(false);
  };

  const hasError = Boolean(result.error);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Heritage reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian Heritage Monument Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Filter a curated reference set of Indian monuments by state, historical era,
          architectural style and UNESCO World Heritage status — with the patron, build period
          and what makes each site distinctive.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="monument-search">
              Search monument, city, patron or keyword
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="monument-search"
                className={`${INPUT_CLASS} pl-9`}
                type="search"
                placeholder="e.g. Chola, stepwell, Shah Jahan"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="monument-state">
                State or union territory
              </label>
              <select
                id="monument-state"
                className={`mt-2 ${INPUT_CLASS}`}
                value={state}
                onChange={(event) => setState(event.target.value)}
              >
                <option value="all">All states</option>
                {states.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="monument-era">
                Historical era
              </label>
              <select
                id="monument-era"
                className={`mt-2 ${INPUT_CLASS}`}
                value={era}
                onChange={(event) => setEra(event.target.value)}
              >
                <option value="all">All eras</option>
                {ERAS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="monument-style">
                Architectural style
              </label>
              <select
                id="monument-style"
                className={`mt-2 ${INPUT_CLASS}`}
                value={style}
                onChange={(event) => setStyle(event.target.value)}
              >
                <option value="all">All styles</option>
                {styles.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="monument-sort">
                Sort by
              </label>
              <select
                id="monument-sort"
                className={`mt-2 ${INPUT_CLASS}`}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {SORTS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
            htmlFor="monument-unesco"
          >
            <input
              id="monument-unesco"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={unescoOnly}
              onChange={(event) => setUnescoOnly(event.target.checked)}
            />
            Show only UNESCO World Heritage entries
          </label>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monuments matched
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : stats.count}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Adjust the filters to see results."
                : `Across ${stats.states} state${stats.states === 1 ? "" : "s"} and ${stats.styles} architectural style${stats.styles === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the matched monument list"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all filters"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["UNESCO World Heritage entries in view", hasError ? DASH : String(stats.unescoCount)],
            ["States or union territories", hasError ? DASH : String(stats.states)],
            ["Architectural styles", hasError ? DASH : String(stats.styles)],
            [
              "Earliest construction",
              hasError || stats.oldest === null ? DASH : formatYear(stats.oldest),
            ],
            [
              "Most recent construction",
              hasError || stats.newest === null ? DASH : formatYear(stats.newest),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.items.length === 0 ? (
        <p className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
          No monument in the reference set matches those filters. Try clearing the style or era
          filter, or search a broader keyword such as &quot;fort&quot; or &quot;temple&quot;.
        </p>
      ) : null}

      {!hasError && result.items.length > 0 ? (
        <ul className="mt-6 grid gap-4">
          {result.items.map((item) => {
            const bucket = eraForYear(item.yearStart);
            return (
              <li
                key={item.name}
                className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-base font-semibold leading-6">{item.name}</h2>
                  {item.unesco ? (
                    <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
                      UNESCO {item.unesco}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {item.city}, {item.state}
                </p>
                <p className="mt-3 text-sm leading-6">{item.note}</p>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex gap-2">
                    <dt className="text-[var(--muted-foreground)]">Built</dt>
                    <dd className="font-semibold">{item.builtLabel}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--muted-foreground)]">Style</dt>
                    <dd className="font-semibold">{item.style}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--muted-foreground)]">Patron</dt>
                    <dd className="font-semibold">{item.patron}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[var(--muted-foreground)]">Era</dt>
                    <dd className="font-semibold">{bucket ? bucket.label : "Unclassified"}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A curated reference set, not an exhaustive register — the Archaeological Survey of India
        protects over 3,600 Monuments of National Importance, and state departments protect
        thousands more. Construction dates for older sites are the conventional scholarly
        estimates and are still debated for several entries.
      </p>
    </main>
  );
}
