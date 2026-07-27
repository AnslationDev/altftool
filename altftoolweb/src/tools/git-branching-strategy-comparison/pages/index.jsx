"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitFork, RotateCcw } from "lucide-react";

import {
  CI_LEVELS,
  RELEASE_CADENCES,
  TEAM_SIZES,
  compareStrategies,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  teamSize: "small",
  releaseCadence: "continuous",
  ciLevel: "strong",
  multiVersion: false,
  regulated: false,
};

export default function ToolHome() {
  const [teamSize, setTeamSize] = useState(DEFAULTS.teamSize);
  const [releaseCadence, setReleaseCadence] = useState(DEFAULTS.releaseCadence);
  const [ciLevel, setCiLevel] = useState(DEFAULTS.ciLevel);
  const [multiVersion, setMultiVersion] = useState(DEFAULTS.multiVersion);
  const [regulated, setRegulated] = useState(DEFAULTS.regulated);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => compareStrategies({ teamSize, releaseCadence, ciLevel, multiVersion, regulated }),
    [teamSize, releaseCadence, ciLevel, multiVersion, regulated],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Branching strategy fit for this team",
      ...result.ranking.map(
        (s, i) => `${i + 1}. ${s.name} — ${s.score}/${result.maxScore}\n   ${s.summary}`,
      ),
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
    setTeamSize(DEFAULTS.teamSize);
    setReleaseCadence(DEFAULTS.releaseCadence);
    setCiLevel(DEFAULTS.ciLevel);
    setMultiVersion(DEFAULTS.multiVersion);
    setRegulated(DEFAULTS.regulated);
    setCopied(false);
  };

  const selects = [
    { id: "bs-team", label: "Team size", value: teamSize, set: setTeamSize, options: TEAM_SIZES },
    {
      id: "bs-cadence",
      label: "How often do you release?",
      value: releaseCadence,
      set: setReleaseCadence,
      options: RELEASE_CADENCES,
    },
    {
      id: "bs-ci",
      label: "CI / automation maturity",
      value: ciLevel,
      set: setCiLevel,
      options: CI_LEVELS,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitFork className="h-4 w-4" aria-hidden="true" />
          Git workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Git Branching Strategy Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer five questions about your team and see git flow, GitHub flow, trunk-based
          development and release branching scored against your situation — with the reasoning
          shown for every point.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {selects.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <select
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              >
                {field.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-1">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="bs-multi"
          >
            <input
              id="bs-multi"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={multiVersion}
              onChange={(event) => setMultiVersion(event.target.checked)}
            />
            We maintain several released versions in parallel (e.g. v1.x and v2.x)
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="bs-regulated"
          >
            <input
              id="bs-regulated"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={regulated}
              onChange={(event) => setRegulated(event.target.checked)}
            />
            Releases need a formal QA or compliance sign-off before shipping
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
              Best fit for your answers
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.best.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the strategy comparison result"
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

        {!hasError ? (
          <ol className="mt-5 space-y-4">
            {result.ranking.map((s, index) => (
              <li
                key={s.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">
                    {index + 1}. {s.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                    {s.score} / {result.maxScore}
                  </span>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${s.name} scores ${s.score} of ${result.maxScore}`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{
                      width: `${result.maxScore > 0 ? Math.round((s.score / result.maxScore) * 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{s.summary}</p>
                {s.reasons.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                    {s.reasons.map((r) => (
                      <li key={r} className="text-[var(--success)]">
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {s.cautions.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                    {s.cautions.map((c) => (
                      <li key={c} className="text-[var(--danger)]">
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}

        <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
          Scores are a transparent heuristic based on each strategy's own documentation (nvie.com,
          GitHub docs, trunkbaseddevelopment.com, GitLab docs) — a starting point for a team
          discussion, not a verdict.
        </p>
      </section>
    </main>
  );
}
