"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCompareArrows, RotateCcw } from "lucide-react";

import { CRITERIA, WEIGHT_LEVELS, chooseFormat } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

/** Sensible default: a typical service API with evolving payloads. */
const DEFAULT_WEIGHTS = {
  humanReadable: 1,
  compactSize: 1,
  schemaEvolution: 2,
  noSchema: 0,
  browserFriendly: 1,
  bigDataStreaming: 0,
  binaryData: 0,
  rpc: 2,
  constrainedDevices: 0,
};

export default function ToolHome() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => chooseFormat(weights), [weights]);
  const hasError = Boolean(result.error);

  const setWeight = (id, value) => {
    setWeights((prev) => ({ ...prev, [id]: Number(value) }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = result.ranked.map(
      (format, index) =>
        `${index + 1}. ${format.name} — ${format.score}/${result.maxScore} (${format.percent}%)`,
    );
    return [`Serialization format ranking`, ...lines].join("\n");
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
    setWeights(DEFAULT_WEIGHTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
          Serialization
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Serialization Format Chooser
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weight each requirement and get a ranked comparison of JSON, Protocol Buffers, Apache
          Avro, MessagePack and CBOR, with every score tied to a documented property of the format.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your requirements</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CRITERIA.map((criterion) => (
            <div key={criterion.id}>
              <label className={LABEL_CLASS} htmlFor={`sfc-${criterion.id}`}>
                {criterion.label}
              </label>
              <select
                id={`sfc-${criterion.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={String(weights[criterion.id] ?? 0)}
                onChange={(event) => setWeight(criterion.id, event.target.value)}
              >
                {WEIGHT_LEVELS.map((level) => (
                  <option key={level.value} value={String(level.value)}>
                    {level.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{criterion.hint}</p>
            </div>
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
              Best fit for your requirements
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.winner.name}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Adjust the requirements above to see a ranking."
                : `${result.winner.score} of ${result.maxScore} weighted points (${result.winner.percent}%). ${result.winner.strengths}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the serialization format ranking"
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
              aria-label="Reset all requirements to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 space-y-4">
          {(hasError ? [] : result.ranked).map((format, index) => (
            <div key={format.id}>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-semibold">
                  {index + 1}. {format.name}
                  <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                    {format.spec}
                  </span>
                </dt>
                <dd className="text-sm font-semibold">
                  {format.score}/{result.maxScore}
                </dd>
              </div>
              <div
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${format.name} scores ${format.percent} percent`}
              >
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${format.percent}%` }}
                />
              </div>
              {format.wins.length > 0 ? (
                <p className="mt-1 text-xs text-[var(--success)]">
                  Strong on: {format.wins.join(", ")}
                </p>
              ) : null}
              {format.losses.length > 0 ? (
                <p className="mt-0.5 text-xs text-[var(--danger)]">
                  Weak on: {format.losses.join(", ")}
                </p>
              ) : null}
            </div>
          ))}
          {hasError ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-[var(--muted-foreground)]">Ranking</dt>
              <dd className="text-sm font-semibold">{DASH}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Format trade-offs at a glance</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Format
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Strengths
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Weaknesses
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.ranked).map((format) => (
                <tr key={format.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{format.name}</td>
                  <td className="py-2 pr-3">{format.strengths}</td>
                  <td className="py-2">{format.weaknesses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The ranking is a weighted decision matrix, not a benchmark. Fitness scores come from each
        format&apos;s specification and mainstream tooling; run your own payload benchmarks before
        committing a hot path to any format.
      </p>
    </main>
  );
}
