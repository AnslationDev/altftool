"use client";

import { useMemo, useState } from "react";
import { BookOpen, Calculator, Check, Copy, RotateCcw, Search } from "lucide-react";

import {
  CHARS_PER_TOKEN,
  ENTRIES,
  KINDS,
  checkContextBudget,
  getEntry,
  searchEntries,
  seeAlsoEntries,
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
const FIRST_ID = ENTRIES[0].id;

const DEFAULT_PROMPT =
  "You are a support assistant. Answer only from the knowledge base passages below, and say so plainly if the answer is not in them.";

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [activeId, setActiveId] = useState(FIRST_ID);
  const [copied, setCopied] = useState(false);

  const [promptText, setPromptText] = useState(DEFAULT_PROMPT);
  const [expectedOutputTokens, setExpectedOutputTokens] = useState(500);
  const [contextWindowTokens, setContextWindowTokens] = useState(128000);

  const results = useMemo(() => searchEntries({ query, kind }), [query, kind]);
  const active = useMemo(() => {
    if (results.some((entry) => entry.id === activeId)) return getEntry(activeId);
    return results[0] || null;
  }, [results, activeId]);
  const related = useMemo(() => (active ? seeAlsoEntries(active.id) : []), [active]);
  const noResults = results.length === 0;

  const budget = useMemo(
    () => checkContextBudget({ promptText, expectedOutputTokens, contextWindowTokens }),
    [promptText, expectedOutputTokens, contextWindowTokens],
  );

  const summary = active
    ? [
        `${active.term} (${active.kind})`,
        active.meaning,
        "",
        `Example: ${active.example}`,
        "",
        `Tip: ${active.tip}`,
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
    setKind("All");
    setActiveId(FIRST_ID);
    setCopied(false);
    setPromptText(DEFAULT_PROMPT);
    setExpectedOutputTokens(500);
    setContextWindowTokens(128000);
  };

  const rows = active
    ? [
        ["Kind", active.kind],
        ["Also called", active.aliases.length > 0 ? active.aliases.join(", ") : "No common alias"],
        ["Read next", related.length > 0 ? related.map((entry) => entry.term).join(", ") : DASH],
      ]
    : [
        ["Kind", DASH],
        ["Also called", DASH],
        ["Read next", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          LLM vocabulary
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">LLM Terms Dictionary</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {COUNT.format(ENTRIES.length)} large-language-model terms — search by headword or by the API parameter
          name you actually see in the docs (top_p, BPE, frequency_penalty…). Each entry has a standalone
          definition, a concrete example and a practical tip with a typical value where one exists.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dictionary-search">
              Search terms and definitions
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="dictionary-search"
                type="search"
                className={`${INPUT_CLASS} pl-9`}
                placeholder="top_p, context window, RAG, hallucination"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dictionary-kind">
              Kind
            </label>
            <select
              id="dictionary-kind"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option value="All">All kinds</option>
              {KINDS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {COUNT.format(results.length)} of {COUNT.format(ENTRIES.length)} terms
        </p>

        {noResults ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Nothing matches that search. Try a single word, or set the kind back to all.
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
                      {entry.kind}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Definition
            </p>
            <p className="mt-1 text-3xl leading-tight font-semibold text-[var(--primary)] break-words sm:text-4xl">
              {active ? active.term : DASH}
            </p>
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
            <button type="button" onClick={reset} aria-label="Reset search, filters and calculator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {active && (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{active.meaning}</p>
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
              <span className="font-semibold">Example: </span>
              {active.example}
            </p>
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
              <span className="font-semibold">Tip: </span>
              {active.tip}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Related terms
            </p>
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
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">Context-budget calculator</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your prompt, set aside tokens for the answer, and check both against your model&apos;s context
          window. Estimated at one token per {CHARS_PER_TOKEN} characters of ordinary English prose — a planning
          figure, never an exact billing count.
        </p>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="budget-prompt">
              Prompt text
            </label>
            <textarea
              id="budget-prompt"
              rows={5}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="budget-output">
                Reserved answer tokens
              </label>
              <input
                id="budget-output"
                type="number"
                min={0}
                className={`mt-2 ${INPUT_CLASS}`}
                value={expectedOutputTokens}
                onChange={(event) => setExpectedOutputTokens(Number(event.target.value))}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="budget-window">
                Context window (tokens)
              </label>
              <input
                id="budget-window"
                type="number"
                min={1}
                className={`mt-2 ${INPUT_CLASS}`}
                value={contextWindowTokens}
                onChange={(event) => setContextWindowTokens(Number(event.target.value))}
              />
            </div>
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-md border p-4 text-sm leading-6"
          style={
            budget.error
              ? { borderColor: "var(--danger)", background: "var(--danger-soft)" }
              : {
                  borderColor: budget.fits ? "var(--success)" : "var(--danger)",
                  background: budget.fits ? "var(--muted)" : "var(--danger-soft)",
                }
          }
        >
          {budget.error ? (
            <span className="font-semibold text-[var(--danger)]">{budget.error}</span>
          ) : (
            <>
              <p>
                <span className="font-semibold">{COUNT.format(budget.promptTokens)} prompt tokens</span> (~
                {COUNT.format(budget.characters)} characters, ~{COUNT.format(budget.approxWords)} words) +{" "}
                {COUNT.format(budget.outputTokens)} reserved for the answer = {COUNT.format(budget.total)} of{" "}
                {COUNT.format(budget.windowTokens)} tokens ({budget.percentUsed.toFixed(1)}% of the window).
              </p>
              <p className="mt-2 font-semibold">
                {budget.fits
                  ? `Fits, with ${COUNT.format(budget.remaining)} tokens to spare.`
                  : `Does not fit — ${COUNT.format(Math.abs(budget.remaining))} tokens over the window.`}
              </p>
            </>
          )}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token counts are a planning estimate, not an exact billing figure — each model family tokenizes text
        differently, so counts are only comparable within one model family. Everything on this page runs in your
        browser.
      </p>
    </main>
  );
}
