"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw } from "lucide-react";

import {
  CERTAINTIES,
  DOMAINS,
  LANGUAGES,
  LOANWORDS,
  eraBands,
  eraSpan,
  languageCounts,
  searchLoanwords,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");
const DEFAULT_LOOKUP = "shampoo";

const domainLabel = (id) => DOMAINS.find((d) => d.id === id)?.label ?? id;
const certaintyLabel = (id) => CERTAINTIES.find((c) => c.id === id)?.label ?? id;
const approxYear = (year) => `about ${NUM.format(year)}`;

export default function ToolHome() {
  const [lookup, setLookup] = useState(DEFAULT_LOOKUP);
  const [language, setLanguage] = useState("all");
  const [domain, setDomain] = useState("all");
  const [certainty, setCertainty] = useState("all");
  const [copied, setCopied] = useState(false);

  const langCounts = useMemo(() => languageCounts(), []);

  const featuredSearch = useMemo(() => searchLoanwords({ query: lookup }), [lookup]);
  const featured = featuredSearch.results[0] ?? null;
  const featuredError = featured
    ? ""
    : `No word in this collection matches "${lookup.trim() || "an empty search"}". Try "jungle", "khaki" or a source language such as "Tamil".`;

  const list = useMemo(
    () => searchLoanwords({ language, domain, certainty }),
    [language, domain, certainty]
  );
  const bands = useMemo(() => eraBands(list.results), [list]);
  const span = useMemo(() => eraSpan(list.results), [list]);
  const maxBand = bands.reduce((max, band) => Math.max(max, band.count), 0);

  const summary = useMemo(() => {
    if (!featured) return "";
    return [
      `${featured.word} — from ${featured.sourceLanguage}`,
      `Source word: ${featured.sourceWord} (${featured.sourceMeaning})`,
      `Route: ${featured.route}`,
      `First English use: ${approxYear(featured.firstUse)}`,
      `Certainty: ${certaintyLabel(featured.certainty)}`,
      featured.note,
    ].join("\n");
  }, [featured]);

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
    setLookup(DEFAULT_LOOKUP);
    setLanguage("all");
    setDomain("all");
    setCertainty("all");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          Word origins
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian English Loanword Finder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {LOANWORDS.length} everyday English words traced back to Sanskrit, Hindi, Urdu, Tamil,
          Malayalam, Telugu, Marathi, Bengali and Odia — with the route each one travelled.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="loan-lookup">
          Look up an English word
        </label>
        <input
          id="loan-lookup"
          className={`mt-2 ${INPUT_CLASS}`}
          type="search"
          placeholder="shampoo, jungle, catamaran…"
          value={lookup}
          onChange={(event) => setLookup(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Searching a source language or a meaning works too — try &ldquo;Tamil&rdquo; or
          &ldquo;boat&rdquo;.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Word origin
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy this word origin"
              className={GHOST_BTN}
              disabled={!featured}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy origin"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the lookup and all filters"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {featured ? null : (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {featuredError}
          </p>
        )}

        <div aria-live="polite">
          <p className="mt-3 text-3xl font-semibold leading-snug text-[var(--primary)] sm:text-4xl">
            {featured ? featured.word : DASH}
          </p>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Source language", featured ? featured.sourceLanguage : DASH],
              ["Original word", featured ? featured.sourceWord : DASH],
              ["Literal meaning", featured ? featured.sourceMeaning : DASH],
              ["Route into English", featured ? featured.route : DASH],
              ["First English use", featured ? approxYear(featured.firstUse) : DASH],
              ["Field", featured ? domainLabel(featured.domain) : DASH],
              ["Etymology status", featured ? certaintyLabel(featured.certainty) : DASH],
              ["Note", featured ? featured.note : DASH],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {featuredSearch.matched > 1 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Other matches
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {featuredSearch.results.slice(1, 7).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setLookup(entry.word)}
                  className="min-h-11 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {entry.word}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Browse by source and field</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-language">
              Source language
            </label>
            <select
              id="loan-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="all">All languages ({LOANWORDS.length})</option>
              {LANGUAGES.map((name) => (
                <option key={name} value={name}>
                  {name} ({langCounts[name] ?? 0})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-domain">
              Field
            </label>
            <select
              id="loan-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            >
              <option value="all">All fields</option>
              {DOMAINS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loan-certainty">
              Etymology status
            </label>
            <select
              id="loan-certainty"
              className={`mt-2 ${INPUT_CLASS}`}
              value={certainty}
              onChange={(event) => setCertainty(event.target.value)}
            >
              <option value="all">Any status</option>
              {CERTAINTIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Words shown", `${list.matched} of ${list.total}`],
            [
              "Earliest in English",
              span.earliest === null ? DASH : approxYear(span.earliest),
            ],
            ["Most recent", span.latest === null ? DASH : approxYear(span.latest)],
            ["Span covered", span.earliest === null ? DASH : `${NUM.format(span.years)} years`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 grid gap-2">
          {bands.map((band) => (
            <div key={band.id} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)]">{band.label}</span>
              <span className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: maxBand > 0 ? `${(band.count / maxBand) * 100}%` : "0%" }}
                />
              </span>
              <span className="text-right text-xs font-semibold">{band.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold">
          {list.matched} words, oldest first
        </h2>

        {list.matched === 0 ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted-foreground)]"
          >
            No word matches that combination of filters. Set one of them back to &ldquo;all&rdquo;.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">English word</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">From</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Original</th>
                  <th scope="col" className="py-2 text-right font-semibold">First use</th>
                </tr>
              </thead>
              <tbody>
                {list.results.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => setLookup(entry.word)}
                        className="min-h-11 text-left font-semibold transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        {entry.word}
                      </button>
                      {entry.certainty === "debated" ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase text-[var(--danger)]">
                          disputed
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {entry.sourceLanguage}
                    </td>
                    <td className="py-2 pr-3">{entry.sourceWord}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(entry.firstUse)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        First-use years are approximate and rounded to the decade; they show when a word starts
        appearing in English writing, not when contact began. Entries marked disputed are cases
        where reputable sources disagree.
      </p>
    </main>
  );
}
