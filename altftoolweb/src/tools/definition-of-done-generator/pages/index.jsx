"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import {
  CADENCES,
  COMPLIANCE_REGIMES,
  DEFAULT_COVERAGE_TARGET,
  MAX_COVERAGE_TARGET,
  MAX_TEAM_SIZE,
  MIN_COVERAGE_TARGET,
  PROJECT_TYPES,
  generateDefinitionOfDone,
  toMarkdown,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]";

const DASH = "—";

const DEFAULTS = {
  title: "Definition of Done — Checkout squad",
  projectType: "web-app",
  teamSize: "5",
  cadence: "weekly",
  compliance: ["wcag"],
  hasQa: false,
  coverage: String(DEFAULT_COVERAGE_TARGET),
};

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [projectType, setProjectType] = useState(DEFAULTS.projectType);
  const [teamSize, setTeamSize] = useState(DEFAULTS.teamSize);
  const [cadence, setCadence] = useState(DEFAULTS.cadence);
  const [compliance, setCompliance] = useState(DEFAULTS.compliance);
  const [hasQa, setHasQa] = useState(DEFAULTS.hasQa);
  const [coverage, setCoverage] = useState(DEFAULTS.coverage);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateDefinitionOfDone({
        projectTypeKey: projectType,
        teamSize: Number(teamSize),
        cadenceKey: cadence,
        complianceKeys: compliance,
        hasDedicatedQa: hasQa,
        coverageTarget: Number(coverage),
      }),
    [projectType, teamSize, cadence, compliance, hasQa, coverage],
  );

  const toggleRegime = (key, checked) => {
    setCompliance((current) =>
      checked ? [...new Set([...current, key])] : current.filter((entry) => entry !== key),
    );
  };

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(result, title || "Definition of Done"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle(DEFAULTS.title);
    setProjectType(DEFAULTS.projectType);
    setTeamSize(DEFAULTS.teamSize);
    setCadence(DEFAULTS.cadence);
    setCompliance(DEFAULTS.compliance);
    setHasQa(DEFAULTS.hasQa);
    setCoverage(DEFAULTS.coverage);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <ListChecks className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Definition of Done Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer four questions and get a Definition of Done sized for your team, with the reason
          behind every check and the clause behind every compliance item.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="dod-title">
            Title
          </label>
          <input
            id="dod-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={`${INPUT_CLASS} mt-1.5`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dod-type">
              What are you building?
            </label>
            <select
              id="dod-type"
              value={projectType}
              onChange={(event) => setProjectType(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            >
              {PROJECT_TYPES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dod-cadence">
              How often do you release?
            </label>
            <select
              id="dod-cadence"
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            >
              {CADENCES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dod-team">
              Engineers on the team
            </label>
            <input
              id="dod-team"
              type="number"
              min={1}
              max={MAX_TEAM_SIZE}
              step={1}
              value={teamSize}
              onChange={(event) => setTeamSize(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dod-coverage">
              Coverage target for changed files (%)
            </label>
            <input
              id="dod-coverage"
              type="number"
              min={MIN_COVERAGE_TARGET}
              max={MAX_COVERAGE_TARGET}
              step={5}
              value={coverage}
              onChange={(event) => setCoverage(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Set 0 to leave coverage out of the checklist entirely.
            </p>
          </div>
        </div>

        <div>
          <p className={LABEL_CLASS}>Compliance and standards</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {COMPLIANCE_REGIMES.map((regime) => (
              <label key={regime.key} className={CHECK_ROW} htmlFor={`dod-${regime.key}`}>
                <input
                  id={`dod-${regime.key}`}
                  type="checkbox"
                  checked={compliance.includes(regime.key)}
                  onChange={(event) => toggleRegime(regime.key, event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                {regime.label}
              </label>
            ))}
          </div>
        </div>

        <label className={CHECK_ROW} htmlFor="dod-qa">
          <input
            id="dod-qa"
            type="checkbox"
            checked={hasQa}
            onChange={(event) => setHasQa(event.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          The team has a dedicated QA function
        </label>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Checks in your Definition of Done</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {result.error ? DASH : String(result.totalItems)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `${result.mandatoryItems} required · ${result.optionalItems} recommended`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Definition of Done as markdown"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy markdown"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Project type", result.error ? DASH : result.projectType],
            ["Team", result.error ? DASH : `${result.teamSize} engineers (${result.teamBand})`],
            ["Release cadence", result.error ? DASH : result.cadence],
            [
              "Standards applied",
              result.error ? DASH : result.regimes.length ? result.regimes.join(", ") : "None",
            ],
            ["Sections", result.error ? DASH : String(result.sectionCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && result.cadenceNote && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.cadenceNote}</p>
        )}
      </section>

      {!result.error && (
        <section className="mt-6 grid gap-4">
          {result.sections.map((section) => (
            <div key={section.title} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">{section.title}</h2>
              <ul className="mt-3 grid gap-3">
                {section.items.map((item) => (
                  <li key={item.text} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {item.text}
                      {!item.mandatory && (
                        <span className="ml-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                          recommended
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A Definition of Done only works if the team wrote it and can say no to a story that fails
        it. Compliance items cite the clause they come from so you can check them against the
        source; they are a starting point for a conversation with your compliance owner, not legal
        advice.
      </p>
    </main>
  );
}
