"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, RotateCcw } from "lucide-react";

import {
  DATA_TYPES,
  HNSW_M_DEFAULT,
  HNSW_M_MAX,
  HNSW_M_MIN,
  INDEX_TYPES,
  computeIndexSize,
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
  vectorCount: "1000000",
  dimensions: "1536",
  dataTypeId: "float32",
  indexTypeId: "hnsw",
  hnswM: String(HNSW_M_DEFAULT),
  metadataBytes: "256",
  replicas: "1",
};

const COUNT_PRESETS = [
  { label: "100K", value: "100000" },
  { label: "1M", value: "1000000" },
  { label: "10M", value: "10000000" },
  { label: "100M", value: "100000000" },
];

const DASH = "—";

export default function ToolHome() {
  const [vectorCount, setVectorCount] = useState(DEFAULTS.vectorCount);
  const [dimensions, setDimensions] = useState(DEFAULTS.dimensions);
  const [dataTypeId, setDataTypeId] = useState(DEFAULTS.dataTypeId);
  const [indexTypeId, setIndexTypeId] = useState(DEFAULTS.indexTypeId);
  const [hnswM, setHnswM] = useState(DEFAULTS.hnswM);
  const [metadataBytes, setMetadataBytes] = useState(DEFAULTS.metadataBytes);
  const [replicas, setReplicas] = useState(DEFAULTS.replicas);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeIndexSize({
        vectorCount: vectorCount.trim() === "" ? Number.NaN : Number(vectorCount),
        dimensions: dimensions.trim() === "" ? Number.NaN : Number(dimensions),
        dataTypeId,
        indexTypeId,
        hnswM: hnswM.trim() === "" ? Number.NaN : Number(hnswM),
        metadataBytes: metadataBytes.trim() === "" ? 0 : Number(metadataBytes),
        replicas: replicas.trim() === "" ? 1 : Number(replicas),
      }),
    [vectorCount, dimensions, dataTypeId, indexTypeId, hnswM, metadataBytes, replicas],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Vector index size estimate",
      `Vectors: ${NUM.format(result.vectorCount)} × ${NUM.format(result.dimensions)} dims (${result.dataType.label})`,
      `Index: ${result.indexType.label}`,
      `Raw vector data: ${formatBytes(result.rawDataBytes)}`,
      `Index overhead: ${formatBytes(result.indexOverheadBytes)}`,
      `Metadata: ${formatBytes(result.metadataTotal)}`,
      `Per replica: ${formatBytes(result.perReplicaBytes)}`,
      `Total (${result.replicas} replica${result.replicas === 1 ? "" : "s"}): ${formatBytes(result.totalBytes)}`,
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
    setVectorCount(DEFAULTS.vectorCount);
    setDimensions(DEFAULTS.dimensions);
    setDataTypeId(DEFAULTS.dataTypeId);
    setIndexTypeId(DEFAULTS.indexTypeId);
    setHnswM(DEFAULTS.hnswM);
    setMetadataBytes(DEFAULTS.metadataBytes);
    setReplicas(DEFAULTS.replicas);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Raw vector data", DASH],
        ["Index overhead", DASH],
        ["Metadata total", DASH],
        ["Per replica", DASH],
      ]
    : [
        [
          `Raw vector data (${formatBytes(result.bytesPerVectorData)}/vector)`,
          formatBytes(result.rawDataBytes),
        ],
        [
          `Index overhead (${PCT.format(result.overheadPercent)}% of data)`,
          formatBytes(result.indexOverheadBytes),
        ],
        ["Metadata total", formatBytes(result.metadataTotal)],
        ["Per replica", formatBytes(result.perReplicaBytes)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          Embeddings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vector Storage Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate the memory a vector index needs: raw vector data plus HNSW graph or IVF list
          overhead, per-vector metadata, and replication.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vs-count">
              Number of vectors
            </label>
            <input
              id="vs-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1000"
              value={vectorCount}
              onChange={(event) => setVectorCount(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {COUNT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setVectorCount(preset.value)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vs-dims">
              Dimensions per vector
            </label>
            <input
              id="vs-dims"
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
            <label className={LABEL_CLASS} htmlFor="vs-dtype">
              Data type
            </label>
            <select
              id="vs-dtype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dataTypeId}
              onChange={(event) => setDataTypeId(event.target.value)}
            >
              {DATA_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vs-index">
              Index type
            </label>
            <select
              id="vs-index"
              className={`mt-2 ${INPUT_CLASS}`}
              value={indexTypeId}
              onChange={(event) => setIndexTypeId(event.target.value)}
            >
              {INDEX_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {indexTypeId === "hnsw" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="vs-m">
                HNSW M (links per node)
              </label>
              <input
                id="vs-m"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={HNSW_M_MIN}
                max={HNSW_M_MAX}
                step="1"
                value={hnswM}
                onChange={(event) => setHnswM(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="vs-meta">
              Metadata per vector (bytes)
            </label>
            <input
              id="vs-meta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="16"
              value={metadataBytes}
              onChange={(event) => setMetadataBytes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vs-replicas">
              Replicas (total copies)
            </label>
            <input
              id="vs-replicas"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={replicas}
              onChange={(event) => setReplicas(event.target.value)}
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
              Estimated total index size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatBytes(result.totalBytes)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.overheadNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the vector index size estimate"
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates use the Faiss sizing rules of thumb (HNSW: M × 2 × 4 bytes per vector; IVF: 8-byte
        ids plus √N float32 centroids) and IEC binary units. Real deployments add engine-specific
        headroom — most vendors recommend keeping usage under about 80% of available RAM.
      </p>
    </main>
  );
}
