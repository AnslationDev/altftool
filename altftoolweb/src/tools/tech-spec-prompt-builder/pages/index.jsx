"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, RotateCcw } from "lucide-react";

import {
  AUDIENCES,
  DEPTHS,
  REQUIRED_SECTION_IDS,
  SPEC_SECTIONS,
  buildSpecPrompt,
} from "../lib";

const INT = new Intl.NumberFormat("en-US");
const DEC1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SECTIONS = [
  "context",
  "goals",
  "nongoals",
  "proposal",
  "alternatives",
  "risks",
  "rollout",
  "testing",
];

const DEFAULTS = {
  title: "Move session storage from Redis to Postgres",
  problem:
    "Redis evicts sessions under memory pressure, so users are logged out mid-checkout roughly once a week.",
  goals:
    "No user is logged out because of an eviction\nSession read latency stays at or under the current p99\nMigration runs with no downtime",
  nonGoals: "Not changing the session token format\nNot touching the SSO login path",
  alternatives: "Increase the Redis instance size\nAdd a replicated second Redis",
  constraints: "Postgres 15 primary with one read replica; sessions peak at about 200k concurrent",
  depthId: "standard",
  audienceId: "crossteam",
};

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [problem, setProblem] = useState(DEFAULTS.problem);
  const [goals, setGoals] = useState(DEFAULTS.goals);
  const [nonGoals, setNonGoals] = useState(DEFAULTS.nonGoals);
  const [alternatives, setAlternatives] = useState(DEFAULTS.alternatives);
  const [constraints, setConstraints] = useState(DEFAULTS.constraints);
  const [depthId, setDepthId] = useState(DEFAULTS.depthId);
  const [audienceId, setAudienceId] = useState(DEFAULTS.audienceId);
  const [selectedSections, setSelectedSections] = useState(DEFAULT_SECTIONS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSpecPrompt({
        title,
        problem,
        goals,
        nonGoals,
        alternatives,
        constraints,
        selectedSections,
        depthId,
        audienceId,
      }),
    [title, problem, goals, nonGoals, alternatives, constraints, selectedSections, depthId, audienceId],
  );

  const toggleSection = (id) => {
    setSelectedSections((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const copyResult = async () => {
    if (result.error || !result.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle(DEFAULTS.title);
    setProblem(DEFAULTS.problem);
    setGoals(DEFAULTS.goals);
    setNonGoals(DEFAULTS.nonGoals);
    setAlternatives(DEFAULTS.alternatives);
    setConstraints(DEFAULTS.constraints);
    setDepthId(DEFAULTS.depthId);
    setAudienceId(DEFAULTS.audienceId);
    setSelectedSections(DEFAULT_SECTIONS);
    setCopied(false);
  };

  const stat = (value) => (result.error ? DASH : value);
  const touch = (setter) => (event) => {
    setter(event.target.value);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode2 className="h-4 w-4" aria-hidden="true" />
          Design docs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tech Spec Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your sections, paste your goals and non-goals, and get a design-doc prompt with a word
          target per section, an estimated reading time and a completeness score against the thirteen
          sections reviewers expect.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="spec-title">
              Document title
            </label>
            <input id="spec-title" className={`mt-2 ${INPUT_CLASS}`} type="text" value={title} onChange={touch(setTitle)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spec-problem">
              Problem this design solves
            </label>
            <textarea id="spec-problem" className={`mt-2 ${TEXTAREA_CLASS}`} rows={2} value={problem} onChange={touch(setProblem)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="spec-goals">
                Goals, one per line
              </label>
              <textarea id="spec-goals" className={`mt-2 ${TEXTAREA_CLASS}`} rows={4} value={goals} onChange={touch(setGoals)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="spec-nongoals">
                Non-goals, one per line
              </label>
              <textarea id="spec-nongoals" className={`mt-2 ${TEXTAREA_CLASS}`} rows={4} value={nonGoals} onChange={touch(setNonGoals)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="spec-alternatives">
                Alternatives already considered (optional)
              </label>
              <textarea
                id="spec-alternatives"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                rows={3}
                value={alternatives}
                onChange={touch(setAlternatives)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="spec-constraints">
                Existing systems and constraints (optional)
              </label>
              <textarea
                id="spec-constraints"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                rows={3}
                value={constraints}
                onChange={touch(setConstraints)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="spec-depth">
                Depth
              </label>
              <select id="spec-depth" className={`mt-2 ${INPUT_CLASS}`} value={depthId} onChange={touch(setDepthId)}>
                {DEPTHS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="spec-audience">
                Reviewer
              </label>
              <select id="spec-audience" className={`mt-2 ${INPUT_CLASS}`} value={audienceId} onChange={touch(setAudienceId)}>
                {AUDIENCES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Sections to include</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SPEC_SECTIONS.map((section) => {
              const checked = selectedSections.includes(section.id);
              return (
                <label
                  key={section.id}
                  htmlFor={`spec-section-${section.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm hover:border-[var(--primary)]"
                >
                  <input
                    id={`spec-section-${section.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleSection(section.id)}
                  />
                  <span>
                    <span className="block font-semibold text-[var(--foreground)]">{section.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {REQUIRED_SECTION_IDS.includes(section.id) ? "Required · " : ""}
                      weight {section.weight}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {result.error ? (
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
              Outline completeness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stat(`${DEC1.format(result.completeness || 0)}%`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stat(`${INT.format(result.sectionCount || 0)} of ${SPEC_SECTIONS.length} sections · ${result.depthLabel}`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated design document prompt"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Target length", stat(`${INT.format(result.totalWords || 0)} words`)],
            ["Reading time at 238 wpm", stat(`${DEC1.format(result.readMinutes || 0)} min`)],
            ["Estimated review time", stat(`${DEC1.format(result.reviewMinutes || 0)} min`)],
            ["Goals listed", stat(INT.format(result.goalCount || 0))],
            [
              "Non-goals listed",
              stat(result.nonGoalCount ? INT.format(result.nonGoalCount) : "None — the prompt will propose three"),
            ],
            ["Alternatives listed", stat(INT.format(result.alternativeCount || 0))],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {result.error ? null : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Section
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Words
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.outline.map((section) => (
                  <tr key={section.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{section.label}</td>
                    <td className="py-2 text-right font-semibold">{INT.format(section.words)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {result.error ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Completeness measures which sections exist, not whether they are any good. A generated draft
        is a starting point — every number, latency figure and cost in the final document still has
        to be measured and owned by a person.
      </p>
    </main>
  );
}
