"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  DIRECTIONS,
  categoryCounts,
  convertText,
  pairStats,
  searchPairs,
} from "../lib";

const FIELD_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

const SAMPLE =
  "Hi Ravi, thanks a lot for the update. We can't put off the review, so please find out what went wrong ASAP and get in touch with the vendor. I'll wrap up my part soon.";

const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
const directionLabel = (id) => DIRECTIONS.find((d) => d.id === id)?.label ?? id;

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [direction, setDirection] = useState("toFormal");
  const [category, setCategory] = useState("all");
  const [includeContextual, setIncludeContextual] = useState(false);
  const [browse, setBrowse] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => pairStats(), []);
  const counts = useMemo(() => categoryCounts(), []);
  const result = useMemo(
    () => convertText(text, { direction, includeContextual, category }),
    [text, direction, includeContextual, category]
  );
  const pairs = useMemo(
    () => searchPairs({ query: browse, category }),
    [browse, category]
  );

  const failed = Boolean(result.error);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(SAMPLE);
    setDirection("toFormal");
    setCategory("all");
    setIncludeContextual(false);
    setBrowse("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Register
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Formal Informal Word Swapper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {stats.total} register pairs — {stats.safe} that work in any sentence and{" "}
          {stats.contextual} that depend on context and stay switched off until you want them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="swap-text">
          Your text
        </label>
        <textarea
          id="swap-text"
          className={`mt-2 min-h-[9rem] ${FIELD_CLASS}`}
          rows={7}
          value={text}
          placeholder="Paste an email, a paragraph or a whole draft…"
          onChange={(event) => setText(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swap-direction">
              Direction
            </label>
            <select
              id="swap-direction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            >
              {DIRECTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swap-category">
              Limit to a category
            </label>
            <select
              id="swap-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All categories ({stats.total})</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({counts[item.id] ?? 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold"
          htmlFor="swap-contextual"
        >
          <input
            id="swap-contextual"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            checked={includeContextual}
            onChange={(event) => setIncludeContextual(event.target.checked)}
          />
          Also apply the {stats.contextual} context-dependent swaps
        </label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          These are right more often than not, but each one has a case where it is wrong. Read the
          change list before you use the output.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Swaps applied
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : NUM.format(result.changeCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted text"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the text and all options"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <div className="mt-4">
          <p className="text-sm font-semibold">Converted text</p>
          <p className="mt-2 min-h-[6rem] whitespace-pre-wrap rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6">
            {failed ? DASH : result.output}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Direction", failed ? DASH : directionLabel(result.direction)],
            ["Words in source", failed ? DASH : NUM.format(result.wordCount)],
            ["Swaps applied", failed ? DASH : NUM.format(result.changeCount)],
            [
              "Pairs in play",
              failed ? DASH : `${NUM.format(result.swapsAvailable)} of ${stats.total}`,
            ],
            [
              "Context-dependent swaps",
              failed ? DASH : result.includeContextual ? "Included" : "Excluded",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {failed ? null : (
        <section className="mt-6">
          <h2 className="text-base font-semibold">What changed</h2>
          {result.changeCount === 0 ? (
            <p
              role="status"
              className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--muted-foreground)]"
            >
              Nothing in this text matched a pair. Try switching on the context-dependent swaps, or
              set the category back to all.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {result.changes.map((change) => (
                <li
                  key={change.id}
                  className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-3 text-sm"
                >
                  <p className="font-semibold">
                    <span className="text-[var(--muted-foreground)]">{change.from}</span>
                    <span className="px-2">→</span>
                    <span className="text-[var(--primary)]">{change.to}</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {categoryLabel(change.category)}
                    {change.strength === "context" ? " · context-dependent" : ""}
                    {change.note ? ` · ${change.note}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Browse the pairs</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="swap-browse">
          Search a word
        </label>
        <input
          id="swap-browse"
          className={`mt-2 ${INPUT_CLASS}`}
          type="search"
          placeholder="postpone, thanks, utilise…"
          value={browse}
          onChange={(event) => setBrowse(event.target.value)}
        />

        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          {pairs.matched} of {pairs.total} pairs
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Informal</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Formal</th>
                <th scope="col" className="py-2 font-semibold">Safe?</th>
              </tr>
            </thead>
            <tbody>
              {pairs.results.map((pair) => (
                <tr key={pair.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{pair.informal}</td>
                  <td className="py-2 pr-3 font-semibold">{pair.formal}</td>
                  <td className="py-2 text-xs">
                    {pair.strength === "safe" ? (
                      <span className="text-[var(--success)]">any sentence</span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">
                        context{pair.note ? ` — ${pair.note}` : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Word-level swaps change register, not meaning or structure. Read the output before sending
        it — no substitution list can fix a sentence that is unclear to begin with.
      </p>
    </main>
  );
}
