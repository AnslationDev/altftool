"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale, Search } from "lucide-react";

import { countByArea, searchMaxims } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const AREA_COUNTS = countByArea();

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [limit, setLimit] = useState("20");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => searchMaxims({ query, area, limit: Number(limit) }),
    [query, area, limit],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Latin legal maxims${result.query ? ` — "${result.query}"` : ""}${result.areaFilter ? ` in ${result.areaFilter}` : ""}`,
      `${result.matchCount} of ${result.totalInReference} entries matched`,
      "",
      ...result.results.flatMap((item) => [
        `${item.latin} (${item.area})`,
        `  Literally: ${item.literal}`,
        `  Means: ${item.meaning}`,
        `  Example: ${item.example}`,
        "",
      ]),
    ].join("\n");
  }, [result]);

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
    setQuery("");
    setArea("");
    setLimit("20");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Legal Latin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Latin Legal Maxims Reference
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search by the Latin phrase or by what you half-remember it means. Every entry gives the
          literal translation, what it actually does in practice, and an example.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="max-query">
              Search
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="max-query"
                className={`${INPUT_CLASS} pl-9`}
                type="search"
                placeholder="res judicata, burden of proof, hear the other side…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="max-area">
              Area of law
            </label>
            <select
              id="max-area"
              className={`mt-2 ${INPUT_CLASS}`}
              value={area}
              onChange={(event) => setArea(event.target.value)}
            >
              <option value="">All areas</option>
              {AREA_COUNTS.map((item) => (
                <option key={item.area} value={item.area}>
                  {item.area} ({item.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="max-limit">
              Results to show
            </label>
            <input
              id="max-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["res judicata", "natural justice", "burden of proof", "ultra vires", "good faith"].map(
            (suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {suggestion}
              </button>
            ),
          )}
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Maxims matched
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Showing", "In the reference", "Area filter"].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{item}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Maxims matched
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.matchCount}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.query ? `for "${result.query}"` : "no search term — showing everything"}
                  {result.areaFilter ? ` in ${result.areaFilter}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the matching maxims"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Clear the search"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Showing", `${result.shown} of ${result.matchCount} matches`],
                ["In the reference", `${result.totalInReference} maxims`],
                ["Area filter", result.areaFilter || "All areas"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {result.results.length === 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-sm text-[var(--muted-foreground)]">
                Nothing matched. Try a single distinctive word — searching{" "}
                <span className="font-semibold text-[var(--foreground)]">consent</span> or{" "}
                <span className="font-semibold text-[var(--foreground)]">precedent</span> finds more
                than a whole remembered phrase does.
              </p>
            </section>
          ) : (
            <section className="mt-6 space-y-4">
              {result.results.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold italic">{item.latin}</h2>
                    <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                      {item.area}
                    </span>
                  </div>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Literally
                      </dt>
                      <dd className="mt-0.5">{item.literal}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        What it means
                      </dt>
                      <dd className="mt-0.5">{item.meaning}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Example
                      </dt>
                      <dd className="mt-0.5 text-[var(--muted-foreground)]">{item.example}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A study and drafting reference, not legal advice. A maxim is shorthand for a principle, and
        the principle nearly always has statutory exceptions and case-law qualifications the Latin
        does not mention — check the position in your own jurisdiction before relying on one.
      </p>
    </main>
  );
}
