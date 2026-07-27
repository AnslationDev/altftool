"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw, Search } from "lucide-react";

import {
  CATEGORIES,
  LEVELS,
  TERMS,
  backlinks,
  buildQuizQuestion,
  glossaryStats,
  relatedTerms,
  searchTerms,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const STATS = glossaryStats();
const FIRST_ID = TERMS[0].id;

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [activeId, setActiveId] = useState(FIRST_ID);
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(7);
  const [picked, setPicked] = useState(null);

  const results = useMemo(() => searchTerms({ query, category, level }), [query, category, level]);
  const active = useMemo(
    () => results.find((entry) => entry.id === activeId) || results[0] || null,
    [results, activeId],
  );
  const related = useMemo(() => (active ? relatedTerms(active.id) : []), [active]);
  const linkedFrom = useMemo(() => (active ? backlinks(active.id) : []), [active]);
  const question = useMemo(() => buildQuizQuestion({ seed }), [seed]);

  const quizFailed = Boolean(question.error);
  const noResults = results.length === 0;

  const summary = active
    ? [
        `${active.term} (${active.category}, ${active.level})`,
        active.short,
        "",
        active.long,
        "",
        `Example: ${active.example}`,
      ].join("\n")
    : "";

  const copyDefinition = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const selectTerm = (id) => {
    setActiveId(id);
    setCopied(false);
  };

  const reset = () => {
    setQuery("");
    setCategory("All");
    setLevel("All");
    setActiveId(FIRST_ID);
    setSeed(7);
    setPicked(null);
    setCopied(false);
  };

  const nextQuestion = () => {
    setSeed((previous) => previous + 1);
    setPicked(null);
  };

  const rows = active
    ? [
        ["Category", active.category],
        ["Level", active.level],
        ["Also called", active.aliases.length > 0 ? active.aliases.join(", ") : "No common alternative name"],
        ["Read next", related.length > 0 ? related.map((entry) => entry.term).join(", ") : DASH],
      ]
    : [
        ["Category", DASH],
        ["Level", DASH],
        ["Also called", DASH],
        ["Read next", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          AI glossary
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">AI Glossary Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {COUNT.format(STATS.total)} artificial intelligence and machine learning terms across{" "}
          {COUNT.format(STATS.categories)} areas, each with a one-line definition, a longer explanation, a concrete
          example and the terms worth reading next. Search, filter by difficulty, then test yourself.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="glossary-search">
              Search terms and definitions
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="glossary-search"
                type="search"
                className={`${INPUT_CLASS} pl-9`}
                placeholder="overfitting, embedding, attention, bias"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="glossary-category">
              Area
            </label>
            <select
              id="glossary-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All areas</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name} ({COUNT.format(STATS.byCategory[name] || 0)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="glossary-level">
              Level
            </label>
            <select
              id="glossary-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="All">All levels</option>
              {LEVELS.map((name) => (
                <option key={name} value={name}>
                  {name} ({COUNT.format(STATS.byLevel[name] || 0)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {COUNT.format(results.length)} of {COUNT.format(STATS.total)} terms
        </p>

        {noResults ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Nothing matches that search. Try a single word, or set the area and level back to all.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {results.map((entry) => {
              const isActive = active && entry.id === active.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => selectTerm(entry.id)}
                    aria-pressed={Boolean(isActive)}
                    className={`flex min-h-11 w-full flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-sm font-semibold">{entry.term}</span>
                    <span className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                      {entry.category} · {entry.level}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Definition</p>
            <p className="mt-1 text-3xl leading-tight font-semibold text-[var(--primary)] break-words sm:text-4xl">
              {active ? active.term : DASH}
            </p>
            <p className="mt-2 text-sm leading-6">{active ? active.short : DASH}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDefinition}
              aria-label="Copy this definition to the clipboard"
              className={GHOST_BTN}
              disabled={!active}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy entry"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset filters and quiz" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {active && (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{active.long}</p>
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
              <span className="font-semibold">Example: </span>
              {active.example}
            </p>
          </>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {related.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Related terms</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {related.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectTerm(entry.id)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {entry.term}
                </button>
              ))}
            </div>
          </div>
        )}

        {linkedFrom.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Mentioned by</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {linkedFrom.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectTerm(entry.id)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {entry.term}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Test yourself</h2>
          <button type="button" onClick={nextQuestion} className={GHOST_BTN} aria-label="Show another question">
            Next question
          </button>
        </div>

        {quizFailed ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {question.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6">
              Which term does this describe? <span className="font-semibold">{question.prompt}</span>
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, index) => {
                const isPicked = picked === index;
                const isCorrect = index === question.answerIndex;
                const revealed = picked !== null;
                let tone = "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]";
                if (revealed && isCorrect) tone = "border-[var(--success)] bg-[var(--muted)] text-[var(--success)]";
                else if (revealed && isPicked) tone = "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]";
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => setPicked(index)}
                      aria-pressed={isPicked}
                      className={`min-h-11 w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${tone}`}
                    >
                      {option.term}
                    </button>
                  </li>
                );
              })}
            </ul>
            {picked !== null && (
              <p role="status" className="mt-3 text-sm font-semibold">
                {picked === question.answerIndex ? "Correct." : "Not quite — the highlighted option is the one."}{" "}
                <button
                  type="button"
                  onClick={() => selectTerm(question.termId)}
                  className="font-semibold text-[var(--primary)] underline underline-offset-2"
                >
                  Read the full entry
                </button>
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Definitions are written for people learning the field, so they simplify. Where a term is contested — alignment,
        artificial general intelligence, bias — the entry says so rather than picking a side. Everything runs in your
        browser.
      </p>
    </main>
  );
}
