"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCompareArrows, RotateCcw } from "lucide-react";

import {
  CRITERIA,
  DEFAULT_WEIGHTS,
  RATING_MAX,
  TOOLS,
  scoreTools,
} from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreTools(weights), [weights]);
  const hasError = Boolean(result.error);
  const winner = hasError ? null : result.ranking[0];

  const setWeight = (id) => (event) =>
    setWeights((prev) => ({ ...prev, [id]: Number(event.target.value) }));

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      "Monorepo tool ranking (weighted)",
      ...result.ranking.map(
        (t, i) => `${i + 1}. ${t.name} — ${PCT.format(t.score)}% (${t.weightedPoints}/${t.maxPoints} pts)`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
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
          Monorepo tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Monorepo Tool Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weight what matters to your team — caching, orchestration, languages,
          setup, publishing — and see Nx, Turborepo, Bazel, Lerna and pnpm
          workspaces ranked for your situation.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold">How much does each criterion matter? (0–5)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {CRITERIA.map((c) => (
            <div key={c.id}>
              <label
                className="flex items-center justify-between text-sm font-semibold"
                htmlFor={`mtc-${c.id}`}
              >
                <span>{c.label}</span>
                <span className="text-[var(--primary)]">{weights[c.id]}</span>
              </label>
              <input
                id={`mtc-${c.id}`}
                type="range"
                min="0"
                max="5"
                step="1"
                value={weights[c.id]}
                onChange={setWeight(c.id)}
                className="mt-2 h-11 w-full accent-[var(--primary)]"
              />
              <p className="text-xs text-[var(--muted-foreground)]">{c.hint}</p>
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
              Best match for your weights
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {winner ? winner.name : DASH}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {winner ? winner.bestFor : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the ranked comparison result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy ranking"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all weights to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 space-y-3">
          {(hasError ? [] : result.ranking).map((tool, index) => (
            <div key={tool.id} className="rounded-md border border-[var(--border)] p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="font-semibold">
                  {index + 1}. {tool.name}
                  <span className="ml-2 font-mono text-xs text-[var(--muted-foreground)]">
                    {tool.config}
                  </span>
                </dt>
                <dd className="font-semibold text-[var(--primary)]">
                  {PCT.format(tool.score)}%
                </dd>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${tool.name} scores ${PCT.format(tool.score)} percent`}
              >
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(2, tool.score)}%` }}
                />
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Feature ratings (0–{RATING_MAX})</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Criterion
                </th>
                {TOOLS.map((tool) => (
                  <th key={tool.id} scope="col" className="px-2 py-2 text-center font-semibold">
                    {tool.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                  <th scope="row" className="py-2 pr-3 font-medium">
                    {c.label}
                  </th>
                  {TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className="px-2 py-2 text-center font-semibold"
                      title={tool.notes[c.id]}
                    >
                      {tool.ratings[c.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Hover a cell for the reasoning behind each rating. pnpm workspaces score
          low on caching because they cache installs, not task outputs — most teams
          layer Nx or Turborepo on top.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Editorial ratings based on each tool's own documentation. Capabilities
        change between releases — verify anything decision-critical against the
        current docs for nx.dev, turbo.build, bazel.build, lerna.js.org and pnpm.io.
      </p>
    </main>
  );
}
