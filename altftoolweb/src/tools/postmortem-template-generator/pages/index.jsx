"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import { OPTIONAL_SECTIONS, SEVERITY_OPTIONS, buildPostmortem } from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  title: "Checkout API outage",
  incidentDate: "2026-07-20",
  severity: "SEV-2",
  durationMinutes: "90",
  commander: "",
  impactSummary: "",
  actionItemCount: "3",
  sections: { fiveWhys: true, lessons: true, supporting: false },
};

const DASH = "—";

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [incidentDate, setIncidentDate] = useState(DEFAULTS.incidentDate);
  const [severity, setSeverity] = useState(DEFAULTS.severity);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULTS.durationMinutes);
  const [commander, setCommander] = useState(DEFAULTS.commander);
  const [impactSummary, setImpactSummary] = useState(DEFAULTS.impactSummary);
  const [actionItemCount, setActionItemCount] = useState(DEFAULTS.actionItemCount);
  const [sections, setSections] = useState(DEFAULTS.sections);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPostmortem({
        title,
        incidentDate,
        severity,
        durationMinutes,
        commander,
        impactSummary,
        actionItemCount: actionItemCount === "" ? Number.NaN : Number(actionItemCount),
        sections,
      }),
    [title, incidentDate, severity, durationMinutes, commander, impactSummary, actionItemCount, sections],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle(DEFAULTS.title);
    setIncidentDate(DEFAULTS.incidentDate);
    setSeverity(DEFAULTS.severity);
    setDurationMinutes(DEFAULTS.durationMinutes);
    setCommander(DEFAULTS.commander);
    setImpactSummary(DEFAULTS.impactSummary);
    setActionItemCount(DEFAULTS.actionItemCount);
    setSections(DEFAULTS.sections);
    setCopied(false);
  };

  const toggleSection = (id) => {
    setSections((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Incident response
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Postmortem Template Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the incident basics and get a blameless postmortem document in Markdown —
          metadata table, timeline, root cause, optional 5 Whys and lessons sections, plus an
          action-item table with owners and due dates.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pm-title">
              Incident title
            </label>
            <input
              id="pm-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-date">
              Date of incident
            </label>
            <input
              id="pm-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={incidentDate}
              onChange={(event) => setIncidentDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-severity">
              Severity
            </label>
            <select
              id="pm-severity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-duration">
              Impact duration (minutes)
            </label>
            <input
              id="pm-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-commander">
              Incident commander (optional)
            </label>
            <input
              id="pm-commander"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Name or handle"
              value={commander}
              onChange={(event) => setCommander(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pm-impact">
              Customer impact summary (optional)
            </label>
            <textarea
              id="pm-impact"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              placeholder="What did customers experience, and how many were affected?"
              value={impactSummary}
              onChange={(event) => setImpactSummary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pm-actions">
              Empty action-item rows (1–10)
            </label>
            <input
              id="pm-actions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={actionItemCount}
              onChange={(event) => setActionItemCount(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Optional sections
          </legend>
          <div className="mt-2 grid gap-2">
            {OPTIONAL_SECTIONS.map((section) => (
              <label
                key={section.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
                htmlFor={`pm-section-${section.id}`}
              >
                <input
                  id={`pm-section-${section.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={Boolean(sections[section.id])}
                  onChange={() => toggleSection(section.id)}
                />
                {section.label}
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
              Generated document
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.wordCount)} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the template."
                : "Copy the Markdown below into your wiki, doc tool or repository and fill in the italic prompts."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the postmortem Markdown template"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy Markdown"}
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

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-full whitespace-pre p-4 text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : result.markdown}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The structure follows the blameless-postmortem practice described in the Google SRE Book:
        focus on systems and processes, give every action item one owner and a due date, and
        review the document with the whole team before closing the incident.
      </p>
    </main>
  );
}
