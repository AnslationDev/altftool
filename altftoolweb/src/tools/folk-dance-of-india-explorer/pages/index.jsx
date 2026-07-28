"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Drum, RotateCcw, Search, Shuffle } from "lucide-react";

import {
  DANCES,
  FORMS,
  PERFORMER_GROUPS,
  REGIONS,
  danceOfTheDay,
  filterDances,
  groupByState,
  statesIn,
  statsFor,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ALL_STATES = statesIn();

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All");
  const [region, setRegion] = useState("All");
  const [form, setForm] = useState("All");
  const [performers, setPerformers] = useState("All");
  const [seed, setSeed] = useState(3);
  const [copied, setCopied] = useState(false);

  const results = useMemo(
    () => filterDances({ query, state, region, form, performers }),
    [query, state, region, form, performers],
  );
  const stats = useMemo(() => statsFor(results), [results]);
  const grouped = useMemo(() => groupByState(results), [results]);
  const featured = useMemo(() => danceOfTheDay(seed), [seed]);

  const empty = results.length === 0;

  const copyResult = async () => {
    if (empty) return;
    const text = results
      .map(
        (dance) =>
          `${dance.name} — ${dance.state}\n  Occasion: ${dance.occasion}\n  Performers: ${dance.performers}\n  Instruments: ${dance.instruments.join(", ")}\n  Costume: ${dance.costume}\n  ${dance.note}`,
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`Indian folk dances (${results.length})\n\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setQuery("");
    setState("All");
    setRegion("All");
    setForm("All");
    setPerformers("All");
    setSeed(3);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Drum className="h-4 w-4" aria-hidden="true" />
          Culture reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Folk Dance of India Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {NUM.format(DANCES.length)} folk, ritual, martial and folk-theatre dances from across
          India, each with the festival it belongs to, who performs it, the instruments that drive it
          and what the dancers wear. Filter by state, region, form or performers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dance-search">
              Search names, festivals, instruments and costumes
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="dance-search"
                className={`${INPUT_CLASS} pl-9`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="harvest, dhol, mask, Navratri"
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dance-state">
              State
            </label>
            <select
              id="dance-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              <option value="All">All states</option>
              {ALL_STATES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dance-region">
              Region
            </label>
            <select
              id="dance-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="All">All regions</option>
              {REGIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dance-form">
              Form
            </label>
            <select
              id="dance-form"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form}
              onChange={(event) => setForm(event.target.value)}
            >
              <option value="All">All forms</option>
              {FORMS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dance-performers">
              Performed by
            </label>
            <select
              id="dance-performers"
              className={`mt-2 ${INPUT_CLASS}`}
              value={performers}
              onChange={(event) => setPerformers(event.target.value)}
            >
              <option value="All">Anyone</option>
              {PERFORMER_GROUPS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {empty && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          No dance in the list matches those filters. Clear the search box or widen the region.
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Dances matching
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {empty ? DASH : NUM.format(stats.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {empty ? DASH : `across ${NUM.format(stats.states)} states and state groups`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the matching dances" className={GHOST_BTN} disabled={empty}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Most common form", empty ? DASH : `${stats.byForm[0].label} (${stats.byForm[0].count})`],
            [
              "Performed by",
              empty ? DASH : stats.byPerformers.map((row) => `${row.label} ${row.count}`).join(" · "),
            ],
            ["Distinct instruments named", empty ? DASH : NUM.format(stats.instruments)],
            ["On the UNESCO heritage list", empty ? DASH : NUM.format(stats.unesco)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Featured dance</h2>
          <button type="button" onClick={() => setSeed((value) => value + 1)} className={GHOST_BTN} aria-label="Show another dance">
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Another one
          </button>
        </div>
        <p className="mt-3 text-lg font-semibold">
          {featured.name} <span className="text-sm font-normal text-[var(--muted-foreground)]">· {featured.state}</span>
        </p>
        <p className="mt-1 text-sm">{featured.note}</p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {featured.occasion} · {featured.performers} · {featured.instruments.join(", ")}
        </p>
      </section>

      {!empty && (
        <section className="mt-6 grid gap-6">
          {grouped.map((group) => (
            <div key={group.state} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">{group.state}</h2>
              <ul className="mt-3 grid gap-3">
                {group.dances.map((dance) => (
                  <li key={dance.id} className="rounded-md border border-[var(--border)] p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold">{dance.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {dance.form} · {dance.performers}
                        {dance.unesco ? ` · UNESCO ${dance.unesco}` : ""}
                      </p>
                    </div>
                    <p className="mt-2 text-sm">{dance.note}</p>
                    <dl className="mt-2 grid gap-1 text-xs text-[var(--muted-foreground)]">
                      <div>
                        <dt className="inline font-semibold">Occasion: </dt>
                        <dd className="inline">{dance.occasion}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Instruments: </dt>
                        <dd className="inline">{dance.instruments.join(", ")}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Costume: </dt>
                        <dd className="inline">{dance.costume}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Names, spellings and practices vary between districts and communities, and several forms are
        shared across state borders, so the state column shows where a dance is most closely
        associated rather than a boundary. Ritual forms such as Theyyam and Padayani are acts of
        worship first and performance second.
      </p>
    </main>
  );
}
