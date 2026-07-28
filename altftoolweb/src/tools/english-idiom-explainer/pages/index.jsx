"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Languages, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  IDIOMS,
  REGISTERS,
  categoryCounts,
  explainIdiom,
  searchIdioms,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULT_LOOKUP = "break the ice";

const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
const registerLabel = (id) => REGISTERS.find((r) => r.id === id)?.label ?? id;

const MATCH_NOTE = {
  exact: "Exact match",
  partial: "Closest phrase match",
  related: "Nearest idiom by meaning",
};

export default function ToolHome() {
  const [lookup, setLookup] = useState(DEFAULT_LOOKUP);
  const [browse, setBrowse] = useState("");
  const [category, setCategory] = useState("all");
  const [register, setRegister] = useState("all");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => explainIdiom(lookup), [lookup]);
  const list = useMemo(
    () => searchIdioms({ query: browse, category, register }),
    [browse, category, register]
  );
  const counts = useMemo(() => categoryCounts(), []);

  const summary = useMemo(() => {
    if (result.error) return "";
    const entry = result.match;
    return [
      entry.idiom,
      `Meaning: ${entry.meaning}`,
      `Literal: ${entry.literal}`,
      `Example: ${entry.example}`,
      `Origin: ${entry.origin}`,
      `Register: ${registerLabel(entry.register)}`,
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
    setLookup(DEFAULT_LOOKUP);
    setBrowse("");
    setCategory("all");
    setRegister("all");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          Idiom reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          English Idiom Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {IDIOMS.length} idioms with the literal image, the real meaning, an example sentence and
          a note on where each one can safely be used.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="idiom-lookup">
          Look up an idiom
        </label>
        <input
          id="idiom-lookup"
          className={`mt-2 ${INPUT_CLASS}`}
          type="search"
          placeholder="break the ice, spill the beans, give up…"
          value={lookup}
          onChange={(event) => setLookup(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Partial phrases work. So does describing the idea, such as &ldquo;start over&rdquo;.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {result.error ? "No result" : MATCH_NOTE[result.matchType]}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the idiom explanation"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy explanation"}
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

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <p className="mt-3 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
          {result.error ? DASH : result.match.idiom}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Meaning", result.error ? DASH : result.match.meaning],
            ["Literal image", result.error ? DASH : result.match.literal],
            ["Example sentence", result.error ? DASH : result.match.example],
            ["Origin", result.error ? DASH : result.match.origin],
            ["Register", result.error ? DASH : registerLabel(result.match.register)],
            ["Category", result.error ? DASH : categoryLabel(result.match.category)],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && result.alternatives.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Other close matches
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.alternatives.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setLookup(entry.idiom)}
                  className="min-h-11 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {entry.idiom}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Browse the collection</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="idiom-browse">
              Filter by word or idea
            </label>
            <input
              id="idiom-browse"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              placeholder="money, fire, secret…"
              value={browse}
              onChange={(event) => setBrowse(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idiom-category">
              Category
            </label>
            <select
              id="idiom-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All categories ({IDIOMS.length})</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({counts[item.id] ?? 0})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idiom-register">
              Register
            </label>
            <select
              id="idiom-register"
              className={`mt-2 ${INPUT_CLASS}`}
              value={register}
              onChange={(event) => setRegister(event.target.value)}
            >
              <option value="all">Any register</option>
              {REGISTERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold">
          {list.matched} of {list.total} idioms
        </h2>

        {list.matched === 0 ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted-foreground)]"
          >
            Nothing matched those filters. Clear the search box or set the category back to all.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {list.results.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
              >
                <button
                  type="button"
                  onClick={() => setLookup(entry.idiom)}
                  className="min-h-11 text-left text-lg font-semibold text-[var(--foreground)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {entry.idiom}
                </button>
                <p className="mt-1 text-sm">{entry.meaning}</p>
                <p className="mt-1 text-sm italic text-[var(--muted-foreground)]">
                  {entry.example}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 font-semibold text-[var(--primary)]">
                    {categoryLabel(entry.category)}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {registerLabel(entry.register)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Meanings follow current British and American usage. Where an origin is genuinely unknown
        the entry says so rather than repeating a popular but unsupported story.
      </p>
    </main>
  );
}
