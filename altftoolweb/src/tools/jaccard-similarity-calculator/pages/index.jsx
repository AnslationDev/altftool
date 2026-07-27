"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw } from "lucide-react";

import { MAX_NGRAM, TOKEN_MODES, jaccardSimilarity } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  textA: "The quick brown fox jumps over the lazy dog",
  textB: "A quick brown dog jumps over the lazy fox",
  mode: "word",
  ngramSize: "3",
  caseSensitive: false,
  stripPunctuation: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_CLASS =
  "inline-block rounded-md bg-[var(--muted)] px-2 py-1 font-mono text-xs text-[var(--foreground)]";

/** Presentation only — every coefficient is computed in ../lib. */
const dec = (value) => (value === null || value === undefined ? "undefined" : value.toFixed(4));
const pct = (value) =>
  value === null || value === undefined ? "undefined" : `${(value * 100).toFixed(2)}%`;

export default function ToolHome() {
  const [textA, setTextA] = useState(DEFAULTS.textA);
  const [textB, setTextB] = useState(DEFAULTS.textB);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [ngramSize, setNgramSize] = useState(DEFAULTS.ngramSize);
  const [caseSensitive, setCaseSensitive] = useState(DEFAULTS.caseSensitive);
  const [stripPunctuation, setStripPunctuation] = useState(DEFAULTS.stripPunctuation);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      jaccardSimilarity({
        textA,
        textB,
        mode,
        ngramSize: Number(ngramSize),
        caseSensitive,
        stripPunctuation,
      }),
    [textA, textB, mode, ngramSize, caseSensitive, stripPunctuation],
  );

  const hasError = Boolean(result.error);
  const activeMode = TOKEN_MODES.find((item) => item.id === mode);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Jaccard similarity",
      `Tokenisation: ${activeMode.label}${mode === "ngram" ? ` (n = ${ngramSize})` : ""}`,
      `Unique tokens: A ${result.uniqueA}, B ${result.uniqueB}`,
      `Intersection: ${result.intersectionSize}, union: ${result.unionSize}`,
      `Jaccard index: ${dec(result.jaccard)} (${pct(result.jaccard)})`,
      `Jaccard distance: ${dec(result.distance)}`,
      `Dice-Sorensen: ${dec(result.dice)}`,
      `Overlap coefficient: ${dec(result.overlap)}`,
      `Cosine (Otsuka-Ochiai): ${dec(result.cosine)}`,
    ].join("\n");
  }, [hasError, result, activeMode, mode, ngramSize]);

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
    setTextA(DEFAULTS.textA);
    setTextB(DEFAULTS.textB);
    setMode(DEFAULTS.mode);
    setNgramSize(DEFAULTS.ngramSize);
    setCaseSensitive(DEFAULTS.caseSensitive);
    setStripPunctuation(DEFAULTS.stripPunctuation);
    setCopied(false);
  };

  const rows = [
    ["Jaccard distance (1 − J)", hasError ? DASH : dec(result.distance)],
    ["Dice–Sørensen coefficient", hasError ? DASH : dec(result.dice)],
    ["Overlap coefficient", hasError ? DASH : dec(result.overlap)],
    ["Cosine (Otsuka–Ochiai)", hasError ? DASH : dec(result.cosine)],
    ["Shared tokens (intersection)", hasError ? DASH : NUM.format(result.intersectionSize)],
    ["Combined tokens (union)", hasError ? DASH : NUM.format(result.unionSize)],
    [
      "Unique tokens in A",
      hasError ? DASH : `${NUM.format(result.uniqueA)} of ${NUM.format(result.totalA)}`,
    ],
    [
      "Unique tokens in B",
      hasError ? DASH : `${NUM.format(result.uniqueB)} of ${NUM.format(result.totalB)}`,
    ],
  ];

  const lists = hasError
    ? []
    : [
        ["In both texts", result.shared],
        ["Only in text A", result.onlyA],
        ["Only in text B", result.onlyB],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Set similarity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Jaccard Similarity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tokenise two texts into sets and compare them: the Jaccard index is the shared tokens
          divided by the combined tokens. Dice, overlap and cosine coefficients are shown alongside,
          because they answer subtly different questions about the same two sets.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jac-a">
              Text A
            </label>
            <textarea
              id="jac-a"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              spellCheck={false}
              value={textA}
              onChange={(event) => {
                setTextA(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jac-b">
              Text B
            </label>
            <textarea
              id="jac-b"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              spellCheck={false}
              value={textB}
              onChange={(event) => {
                setTextB(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jac-mode">
              Tokenise by
            </label>
            <select
              id="jac-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setCopied(false);
              }}
            >
              {TOKEN_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jac-ngram">
              n-gram window (1 to {MAX_NGRAM})
            </label>
            <input
              id="jac-ngram"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_NGRAM}
              step="1"
              disabled={mode !== "ngram"}
              value={ngramSize}
              onChange={(event) => {
                setNgramSize(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--muted-foreground)]">{activeMode?.hint}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="jac-case">
            <input
              id="jac-case"
              type="checkbox"
              className={CHECK_CLASS}
              checked={caseSensitive}
              onChange={(event) => {
                setCaseSensitive(event.target.checked);
                setCopied(false);
              }}
            />
            Case sensitive
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="jac-punct">
            <input
              id="jac-punct"
              type="checkbox"
              className={CHECK_CLASS}
              checked={stripPunctuation}
              onChange={(event) => {
                setStripPunctuation(event.target.checked);
                setCopied(false);
              }}
            />
            Strip punctuation
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Jaccard index
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : dec(result.jaccard)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to compare the texts."
                : `${pct(result.jaccard)} — ${NUM.format(result.intersectionSize)} shared of ${NUM.format(result.unionSize)} combined tokens`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy all similarity coefficients"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset both texts and all options"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div
            className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`The two texts share ${pct(result.jaccard)} of their combined tokens`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.jaccard * 100))}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]"
            >
              {warning}
            </p>
          ))}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Token breakdown</h2>
          <div className="mt-4 grid gap-5">
            {lists.map(([label, tokens]) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {label} ({NUM.format(tokens.length)})
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tokens.length === 0 ? (
                    <span className="text-sm text-[var(--muted-foreground)]">None</span>
                  ) : (
                    tokens.map((token) => (
                      <span key={token} className={CHIP_CLASS}>
                        {token}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
          {result.truncated && (
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Token lists are trimmed for display. The coefficients above use every token.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are set measures, so a word repeated ten times counts once. For frequency-sensitive
        comparison you want cosine similarity over term-frequency vectors instead, which is a
        different calculation from the set cosine shown here.
      </p>
    </main>
  );
}
