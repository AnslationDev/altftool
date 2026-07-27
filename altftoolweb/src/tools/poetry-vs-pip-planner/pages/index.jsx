"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PackageSearch, RotateCcw, Trophy } from "lucide-react";

import {
  COMPARISON_ROWS,
  MANAGERS,
  PROJECT_TYPES,
  QUESTIONS,
  STARTER_COMMANDS,
  scoreManagers,
  summarizeResult,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  projectType: "app",
  nativeDeps: false,
  lockfile: true,
  publishPyPI: false,
  speedPriority: true,
  monorepo: false,
  minimalTooling: false,
  managePython: false,
};

const DASH = "—";
const PERCENT_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreManagers(form), [form]);
  const hasError = Boolean(result.error);

  const toggle = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(summarizeResult(result, form));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PackageSearch className="h-4 w-4" aria-hidden="true" />
          Package Management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Poetry vs Pip Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe your Python project and get a ranked, reasoned recommendation across uv, Poetry,
          pip + pip-tools and conda — every point in the score maps to a stated reason.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>What are you building?</legend>
          <div className="mt-2 grid gap-2">
            {PROJECT_TYPES.map((type) => (
              <label
                key={type.id}
                htmlFor={`ptype-${type.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm has-[:checked]:border-[var(--primary)]"
              >
                <input
                  id={`ptype-${type.id}`}
                  type="radio"
                  name="projectType"
                  className={CHECK_CLASS}
                  checked={form.projectType === type.id}
                  onChange={() => setForm((prev) => ({ ...prev, projectType: type.id }))}
                />
                {type.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What matters for this project?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {QUESTIONS.map((question) => (
              <label
                key={question.key}
                htmlFor={`q-${question.key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm has-[:checked]:border-[var(--primary)]"
              >
                <input
                  id={`q-${question.key}`}
                  type="checkbox"
                  className={`${CHECK_CLASS} mt-0.5 shrink-0`}
                  checked={form[question.key]}
                  onChange={toggle(question.key)}
                />
                <span>
                  {question.label}
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{question.help}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
              Recommended manager
            </p>
            <p className="mt-1 flex items-center gap-2 text-3xl font-semibold text-[var(--primary)]">
              {!hasError ? <Trophy className="h-7 w-7" aria-hidden="true" /> : null}
              {hasError ? DASH : result.winner.name}
            </p>
            {!hasError ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {MANAGERS[result.winner.id].tagline}
                {result.tie ? ` — tied with ${result.ranking[1].name}; either is a sound choice.` : ""}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the recommendation summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 space-y-4">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-[var(--muted-foreground)]">Ranking</dt>
              <dd className="font-semibold">{DASH}</dd>
            </div>
          ) : (
            result.ranking.map((entry) => (
              <div key={entry.id}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <dt className="font-semibold">{entry.name}</dt>
                  <dd className="font-mono text-[var(--muted-foreground)]">
                    {entry.score} pts · {PERCENT_FORMAT.format(entry.share)}%
                  </dd>
                </div>
                <div
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${entry.name}: ${entry.score} points`}
                >
                  <div
                    className={entry.id === result.winner.id ? "h-full rounded-full bg-[var(--primary)]" : "h-full rounded-full bg-[var(--border)]"}
                    style={{ width: `${Math.max(4, Math.round((entry.score / result.maxScore) * 100))}%` }}
                  />
                </div>
                {entry.reasons.length > 0 ? (
                  <ul className="mt-1.5 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {entry.reasons.map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <span aria-hidden="true" className="text-[var(--primary)]">
                          •
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </dl>

        {!hasError ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Get started with {result.winner.name}
            </p>
            <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
              <pre className="min-w-[320px] p-4 text-xs leading-6">
                <code>{(STARTER_COMMANDS[result.winner.id] ?? []).join("\n")}</code>
              </pre>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Side-by-side comparison</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Feature
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  uv
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Poetry
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  pip + pip-tools
                </th>
                <th scope="col" className="py-2 font-semibold">
                  conda / mamba
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {COMPARISON_ROWS.map(([feature, uv, poetry, piptools, conda]) => (
                <tr key={feature}>
                  <th scope="row" className="py-2.5 pr-3 font-semibold text-[var(--foreground)]">
                    {feature}
                  </th>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{uv}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{poetry}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{piptools}</td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{conda}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The scoring weights reflect each tool's documented capabilities (lockfiles, publishing,
        binary packages, interpreter management). All four are actively maintained — the ranking is
        about fit, not quality.
      </p>
    </main>
  );
}
