"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitBranch, RotateCcw } from "lucide-react";

import {
  DIVERGENCE_OPTIONS,
  ISOLATION_OPTIONS,
  TEAM_OPTIONS,
  scoreStrategies,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  envCount: "3",
  divergence: "minor",
  isolation: "medium",
  team: "small",
  separateAccounts: false,
  promoteViaCi: true,
};

const DASH = "—";

export default function ToolHome() {
  const [envCount, setEnvCount] = useState(DEFAULTS.envCount);
  const [divergence, setDivergence] = useState(DEFAULTS.divergence);
  const [isolation, setIsolation] = useState(DEFAULTS.isolation);
  const [team, setTeam] = useState(DEFAULTS.team);
  const [separateAccounts, setSeparateAccounts] = useState(DEFAULTS.separateAccounts);
  const [promoteViaCi, setPromoteViaCi] = useState(DEFAULTS.promoteViaCi);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      scoreStrategies({
        envCount: envCount.trim() === "" ? Number.NaN : Number(envCount),
        divergence,
        isolation,
        team,
        separateAccounts,
        promoteViaCi,
      }),
    [envCount, divergence, isolation, team, separateAccounts, promoteViaCi],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      `Recommended: ${result.recommended.label} (score ${result.recommended.score}/10)`,
      "",
      ...result.ranked.map(
        (strategy) => `${strategy.label}: ${strategy.score}/10\n  ${strategy.reasons.join("\n  ")}`,
      ),
      "",
      "Suggested layout:",
      result.recommended.layout,
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
    setEnvCount(DEFAULTS.envCount);
    setDivergence(DEFAULTS.divergence);
    setIsolation(DEFAULTS.isolation);
    setTeam(DEFAULTS.team);
    setSeparateAccounts(DEFAULTS.separateAccounts);
    setPromoteViaCi(DEFAULTS.promoteViaCi);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          Infrastructure as Code
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Terraform Workspace Strategy Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer six questions about your environments and get a scored recommendation: CLI
          workspaces, a directory per environment, or fully separate state and backends.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-envs">
              Number of environments
            </label>
            <input
              id="ws-envs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={envCount}
              onChange={(event) => setEnvCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-divergence">
              How much do environments differ?
            </label>
            <select
              id="ws-divergence"
              className={`mt-2 ${INPUT_CLASS}`}
              value={divergence}
              onChange={(event) => setDivergence(event.target.value)}
            >
              {DIVERGENCE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-isolation">
              Isolation requirement
            </label>
            <select
              id="ws-isolation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={isolation}
              onChange={(event) => setIsolation(event.target.value)}
            >
              {ISOLATION_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-team">
              Team shape
            </label>
            <select
              id="ws-team"
              className={`mt-2 ${INPUT_CLASS}`}
              value={team}
              onChange={(event) => setTeam(event.target.value)}
            >
              {TEAM_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="ws-accounts"
          >
            <input
              id="ws-accounts"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={separateAccounts}
              onChange={(event) => setSeparateAccounts(event.target.checked)}
            />
            Each environment lives in its own cloud account / subscription
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="ws-ci"
          >
            <input
              id="ws-ci"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={promoteViaCi}
              onChange={(event) => setPromoteViaCi(event.target.checked)}
            />
            Changes are promoted through a CI pipeline
          </label>
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
              Recommended strategy
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.recommended.label}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.recommended.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the strategy comparison"
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
          {(hasError
            ? [
                ["CLI workspaces", DASH],
                ["Directory per environment", DASH],
                ["Separate backend / account", DASH],
              ]
            : result.ranked.map((strategy) => [strategy.label, `${strategy.score}/10`])
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasError
        ? null
        : result.ranked.map((strategy, index) => (
            <section
              key={strategy.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">
                  {index + 1}. {strategy.label}
                </h2>
                <span
                  className={`text-sm font-bold ${index === 0 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                >
                  {strategy.score}/10
                </span>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">
                    Pros
                  </h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                    {strategy.pros.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">
                    Cons
                  </h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                    {strategy.cons.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold text-[var(--primary)]">
                  Why this score, and a layout sketch
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted-foreground)]">
                  {strategy.reasons.length > 0 ? (
                    strategy.reasons.map((reason) => <li key={reason}>{reason}</li>)
                  ) : (
                    <li>No adjustments — base score only.</li>
                  )}
                </ul>
                <div className="mt-3 overflow-x-auto">
                  <pre className="min-w-[320px] rounded-md bg-[var(--muted)] p-4 font-mono text-xs leading-5 text-[var(--foreground)]">
                    {strategy.layout}
                  </pre>
                </div>
              </details>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Heuristics follow HashiCorp&apos;s workspace guidance: CLI workspaces suit multiple states of
        the same configuration behind one backend, while divergent or compliance-separated
        environments call for separate root modules or backends.
      </p>
    </main>
  );
}
