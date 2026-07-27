"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MemoryStick, RotateCcw } from "lucide-react";

import {
  MODEL_PRESETS,
  PRECISIONS,
  computeEmbeddingMemory,
  formatBytes,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  dimensions: "1536",
  precisionId: "float32",
  metadataBytes: "0",
};

const DASH = "—";

export default function ToolHome() {
  const [dimensions, setDimensions] = useState(DEFAULTS.dimensions);
  const [precisionId, setPrecisionId] = useState(DEFAULTS.precisionId);
  const [metadataBytes, setMetadataBytes] = useState(DEFAULTS.metadataBytes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeEmbeddingMemory({
        dimensions: dimensions.trim() === "" ? Number.NaN : Number(dimensions),
        precisionId,
        metadataBytes: metadataBytes.trim() === "" ? 0 : Number(metadataBytes),
      }),
    [dimensions, precisionId, metadataBytes],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Embedding memory",
      `Dimensions: ${NUM.format(result.dimensions)}`,
      `Precision: ${result.precision.label}`,
      `Per vector: ${formatBytes(result.totalPerVector)} (${NUM.format(result.totalPerVector)} bytes)`,
      `Per 1,000 vectors: ${formatBytes(result.per1K)}`,
      `Per 1,000,000 vectors: ${formatBytes(result.per1M)}`,
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
    setDimensions(DEFAULTS.dimensions);
    setPrecisionId(DEFAULTS.precisionId);
    setMetadataBytes(DEFAULTS.metadataBytes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Vector data", DASH],
        ["Metadata per vector", DASH],
        ["Per 1,000 vectors", DASH],
        ["Per 1,000,000 vectors", DASH],
        ["Per 10,000,000 vectors", DASH],
      ]
    : [
        ["Vector data", `${formatBytes(result.dataBytes)} (${NUM.format(result.dataBytes)} bytes)`],
        ["Metadata per vector", `${NUM.format(result.metadataBytes)} bytes`],
        ["Per 1,000 vectors", formatBytes(result.per1K)],
        ["Per 1,000,000 vectors", formatBytes(result.per1M)],
        ["Per 10,000,000 vectors", formatBytes(result.per10M)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MemoryStick className="h-4 w-4" aria-hidden="true" />
          Embeddings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Embedding Dimension Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One dense vector needs dimensions × bytes-per-dimension of memory. Pick your model&apos;s
          dimension count and storage precision to see the exact size per vector and at fleet scale.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="emb-dims">
              Embedding dimensions
            </label>
            <input
              id="emb-dims"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={dimensions}
              onChange={(event) => setDimensions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emb-precision">
              Storage precision
            </label>
            <select
              id="emb-precision"
              className={`mt-2 ${INPUT_CLASS}`}
              value={precisionId}
              onChange={(event) => setPrecisionId(event.target.value)}
            >
              {PRECISIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="emb-metadata">
              Metadata per vector (bytes, optional)
            </label>
            <input
              id="emb-metadata"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="16"
              value={metadataBytes}
              onChange={(event) => setMetadataBytes(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Ids, source text or JSON payload stored next to each vector. Leave 0 for the raw
              embedding alone.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {MODEL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setDimensions(String(preset.dimensions))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label} · {NUM.format(preset.dimensions)}
            </button>
          ))}
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
              Memory per vector
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatBytes(result.totalPerVector)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.savingsVsFloat32Percent > 0
                  ? `${PCT.format(result.savingsVsFloat32Percent)}% smaller than the same vector in float32.`
                  : result.precision.note}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the embedding memory result"
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
              aria-label="Reset all inputs to defaults"
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
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Same vector at every precision ({NUM.format(result.dimensions)} dims)
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Precision
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Per vector
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Per 1M vectors
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.comparison.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-0 ${row.id === precisionId ? "font-semibold text-[var(--primary)]" : ""}`}
                  >
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{formatBytes(row.bytes)}</td>
                    <td className="py-2 text-right">{formatBytes(row.per1M)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are for the raw vector data using IEC binary units (1 KiB = 1,024 bytes). A vector
        database adds index structures on top — use the Vector Storage Size Calculator for a full
        index estimate.
      </p>
    </main>
  );
}
