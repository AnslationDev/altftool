"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { ASSIGNMENT_TYPES, GUARDRAIL_LEVELS, buildGuardrailPrompt } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  subject: "Chemistry",
  assignmentTypeId: "math",
  levelId: "standard",
  gradeLevel: "High school",
  disclosureReminder: true,
};

export default function ToolHome() {
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [assignmentTypeId, setAssignmentTypeId] = useState(DEFAULTS.assignmentTypeId);
  const [levelId, setLevelId] = useState(DEFAULTS.levelId);
  const [gradeLevel, setGradeLevel] = useState(DEFAULTS.gradeLevel);
  const [disclosureReminder, setDisclosureReminder] = useState(DEFAULTS.disclosureReminder);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildGuardrailPrompt({
        subject,
        assignmentTypeId,
        levelId,
        gradeLevel,
        disclosureReminder,
      }),
    [subject, assignmentTypeId, levelId, gradeLevel, disclosureReminder],
  );

  const hasError = Boolean(result.error);
  const selectedType = ASSIGNMENT_TYPES.find((type) => type.id === assignmentTypeId);

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSubject(DEFAULTS.subject);
    setAssignmentTypeId(DEFAULTS.assignmentTypeId);
    setLevelId(DEFAULTS.levelId);
    setGradeLevel(DEFAULTS.gradeLevel);
    setDisclosureReminder(DEFAULTS.disclosureReminder);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Assignment type", DASH],
        ["Scaffolding level", DASH],
        ["Disclosure reminder", DASH],
      ]
    : [
        ["Assignment type", result.assignmentType],
        ["Scaffolding level", result.level],
        ["Disclosure reminder", disclosureReminder ? "Included" : "Not included"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Homework Help Guardrail Prompt
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set up an AI homework coach with hard, assignment-specific bans on producing submittable
          work — plus rules that survive &quot;just give me the answer&quot; pressure — so the
          student does the learning.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gh-subject">
              Subject
            </label>
            <input
              id="gh-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gh-grade">
              Student level (optional)
            </label>
            <input
              id="gh-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={gradeLevel}
              onChange={(event) => setGradeLevel(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gh-type">
              Assignment type
            </label>
            <select
              id="gh-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assignmentTypeId}
              onChange={(event) => setAssignmentTypeId(event.target.value)}
            >
              {ASSIGNMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gh-level">
              Guardrail strictness
            </label>
            <select
              id="gh-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
            >
              {GUARDRAIL_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedType ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Hard ban for this type: {selectedType.ban}.
          </p>
        ) : null}

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="gh-disclosure"
        >
          <input
            id="gh-disclosure"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={disclosureReminder}
            onChange={(event) => setDisclosureReminder(event.target.checked)}
          />
          Remind the student about their school&apos;s AI-disclosure rules at the end of a session
        </label>
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
              Active guardrail rules
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.ruleCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated homework guardrail prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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

        <div className="mt-5">
          <h2 className="text-base font-semibold">Generated prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A prompt reduces, but cannot guarantee, rule-following by an AI assistant — spot-check
        sessions if the stakes are high. What counts as permitted help is ultimately defined by the
        school&apos;s own academic-integrity policy, not by this tool.
      </p>
    </main>
  );
}
