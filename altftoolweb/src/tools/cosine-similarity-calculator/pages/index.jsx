"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MoveDiagonal, RotateCcw } from "lucide-react";

import { compareVectors, interpretCosine } from "../lib";

const SIM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  vectorA: "0.12, 0.48, -0.33, 0.91, 0.05",
  vectorB: "0.10, 0.52, -0.28, 0.87, 0.11",
};

const DASH = "—";

export default function ToolHome() {
  const [vectorA, setVectorA] = useState(DEFAULTS.vectorA);
  const [vectorB, setVectorB] = useState(DEFAULTS.vectorB);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => compareVectors({ vectorA, vectorB }), [vectorA, vectorB]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Vector comparison",
      `Dimensions: ${result.dimensions}`,
      `Cosine similarity: ${SIM.format(result.cosineSimilarity)}`,
      `Cosine distance: ${SIM.format(result.cosineDistance)}`,
      `Dot product: ${SIM.format(result.dotProduct)}`,
      `Euclidean distance: ${SIM.format(result.euclideanDistance)}`,
      `Manhattan distance: ${SIM.format(result.manhattanDistance)}`,
      `Angle: ${NUM.format(result.angleDegrees)} degrees`,
    ].join("\n");
  }, [hasError, result]);

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
    setVectorA(DEFAULTS.vectorA);
    setVectorB(DEFAULTS.vectorB);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Dimensions", DASH],
        ["Dot product", DASH],
        ["Euclidean distance (L2)", DASH],
        ["Manhattan distance (L1)", DASH],
        ["Angle between vectors", DASH],
      ]
    : [
        ["Dimensions", String(result.dimensions)],
        ["Dot product", SIM.format(result.dotProduct)],
        ["Cosine distance (1 − cos)", SIM.format(result.cosineDistance)],
        ["Euclidean distance (L2)", SIM.format(result.euclideanDistance)],
        ["Manhattan distance (L1)", SIM.format(result.manhattanDistance)],
        ["Vector A norm ‖a‖", NUM.format(result.normA)],
        ["Vector B norm ‖b‖", NUM.format(result.normB)],
        ["Angle between vectors", `${NUM.format(result.angleDegrees)}°`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MoveDiagonal className="h-4 w-4" aria-hidden="true" />
          Embeddings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cosine Similarity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste two vectors of the same length — comma, space or newline separated, JSON arrays
          welcome — and get cosine similarity, dot product, Euclidean and Manhattan distance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cos-vec-a">
              Vector A
            </label>
            <textarea
              id="cos-vec-a"
              className={`mt-2 min-h-32 ${INPUT_CLASS}`}
              spellCheck={false}
              value={vectorA}
              onChange={(event) => setVectorA(event.target.value)}
              placeholder="0.12, 0.48, -0.33, ..."
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cos-vec-b">
              Vector B
            </label>
            <textarea
              id="cos-vec-b"
              className={`mt-2 min-h-32 ${INPUT_CLASS}`}
              spellCheck={false}
              value={vectorB}
              onChange={(event) => setVectorB(event.target.value)}
              placeholder="[0.10, 0.52, -0.28, ...]"
            />
          </div>
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
              Cosine similarity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : SIM.format(result.cosineSimilarity)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : interpretCosine(result.cosineSimilarity)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the vector comparison result"
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
              aria-label="Reset both vectors to the example values"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-mono font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How each metric is defined</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Metric
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Formula
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Range
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Cosine similarity", "a·b / (‖a‖ ‖b‖)", "−1 to 1"],
                ["Cosine distance", "1 − cosine similarity", "0 to 2"],
                ["Dot product", "Σ aᵢ bᵢ", "unbounded"],
                ["Euclidean distance", "√Σ (aᵢ − bᵢ)²", "0 and up"],
                ["Manhattan distance", "Σ |aᵢ − bᵢ|", "0 and up"],
              ].map(([metric, formula, range]) => (
                <tr key={metric} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{metric}</td>
                  <td className="py-2 pr-3 font-mono">{formula}</td>
                  <td className="py-2">{range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        All arithmetic runs in your browser; the vectors never leave this page. For normalised
        embeddings (unit length), cosine similarity equals the dot product exactly.
      </p>
    </main>
  );
}
