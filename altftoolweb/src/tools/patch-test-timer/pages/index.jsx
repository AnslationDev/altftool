"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";

import { ICDRG_GRADES, buildPatchTestPlan, formatDateTime } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MODES = [
  { value: "home", label: "Home cosmetic / hair dye allergy alert test" },
  { value: "clinical", label: "Clinical patch testing (ICDRG readings)" },
];

const DEFAULT_APPLIED = "2026-07-28T09:00";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[var(--muted)] text-[var(--success)]",
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [appliedAt, setAppliedAt] = useState(DEFAULT_APPLIED);
  const [mode, setMode] = useState("home");
  const [includeOptional, setIncludeOptional] = useState(true);
  const [readings, setReadings] = useState({});
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => buildPatchTestPlan({ appliedAt, mode, includeOptional, readings }),
    [appliedAt, mode, includeOptional, readings],
  );

  const hasError = Boolean(plan.error);
  const dash = "—";

  const setReading = (key, code) => {
    setReadings((current) => ({ ...current, [key]: code }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      mode === "home" ? "Cosmetic patch test schedule" : "Clinical patch test schedule",
      "",
      ...plan.milestones.map(
        (milestone) =>
          `${formatDateTime(milestone.at)} (${milestone.offsetLabel}) — ${milestone.title}` +
          (milestone.key === "apply" ? "" : ` [${milestone.grade.code}]`),
      ),
      "",
      `${plan.verdict.headline}. ${plan.verdict.detail}`,
    ];
    if (plan.readyAtMs) {
      lines.push("", `Earliest colouring / product use: ${formatDateTime(plan.readyAtMs)}`);
    }
    return lines.join("\n");
  }, [hasError, mode, plan]);

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
    setAppliedAt(DEFAULT_APPLIED);
    setMode("home");
    setIncludeOptional(true);
    setReadings({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Skin &amp; hair
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Patch Test Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter when you applied the patch and get every reading time as a real date — 48 and 96 hours
          for clinical testing, 24 and 48 hours for a hair dye allergy alert test — with a place to
          record each reading on the ICDRG scale.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-applied">
              Date and time applied
            </label>
            <input
              id="pt-applied"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={appliedAt}
              onChange={(event) => setAppliedAt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-mode">
              Type of test
            </label>
            <select
              id="pt-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setReadings({});
              }}
            >
              {MODES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="pt-optional"
            >
              <input
                id="pt-optional"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeOptional}
                onChange={(event) => setIncludeOptional(event.target.checked)}
              />
              {mode === "clinical"
                ? "Include the day 7 late reading (metals, neomycin, corticosteroids)"
                : "Include a 72 hour delayed-reaction check"}
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Decisive reading due
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError
                ? dash
                : formatDateTime(
                    (plan.milestones.find((m) => m.key === "second" || m.key === "day2") || plan.milestones[0]).at,
                  )}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : mode === "clinical"
                  ? "Second ICDRG reading at 96 hours — the reading that decides the result."
                  : "48 hour reading, the point the product instructions are written around."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy patch test schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the patch test timer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Test type", hasError ? dash : mode === "clinical" ? "Clinical (ICDRG)" : "Home cosmetic / hair dye"],
            ["Readings recorded", hasError ? dash : `${plan.readingsRecorded} of ${plan.readingsExpected}`],
            ["Strongest reaction", hasError ? dash : plan.worstGrade ? `${plan.worstGrade.code} — ${plan.worstGrade.label}` : "None recorded"],
            ["Schedule runs for", hasError ? dash : `${plan.totalHours} hours`],
            [
              "Earliest product use",
              hasError ? dash : plan.readyAtMs ? formatDateTime(plan.readyAtMs) : "Decided by your clinician",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className={`mt-4 rounded-md px-3 py-3 text-sm ${TONE_CLASS[plan.verdict.tone]}`}>
            <p className="font-semibold">{plan.verdict.headline}</p>
            <p className="mt-1 leading-6">{plan.verdict.detail}</p>
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Schedule and reading log</h2>
          <ol className="mt-3 space-y-4">
            {plan.milestones.map((milestone) => (
              <li key={milestone.key} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold text-[var(--primary)]">
                    {formatDateTime(milestone.at)}
                  </span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                    {milestone.offsetLabel}
                  </span>
                  <span className="w-full text-sm font-semibold">{milestone.title}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{milestone.detail}</p>
                {milestone.key !== "apply" && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]" htmlFor={`pt-grade-${milestone.key}`}>
                      Reading at this point
                    </label>
                    <select
                      id={`pt-grade-${milestone.key}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={milestone.grade.code}
                      onChange={(event) => setReading(milestone.key, event.target.value)}
                    >
                      {ICDRG_GRADES.map((grade) => (
                        <option key={grade.code} value={grade.code}>
                          {grade.code === "NT" ? grade.label : `${grade.code} — ${grade.label}`}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{milestone.grade.meaning}</p>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">ICDRG grading scale</h2>
        <table className="mt-3 w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">Code</th>
              <th scope="col" className="py-2 font-semibold">What it looks like</th>
            </tr>
          </thead>
          <tbody>
            {ICDRG_GRADES.filter((grade) => grade.code !== "NT").map((grade) => (
              <tr key={grade.code} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3 font-semibold">{grade.code}</td>
                <td className="py-2 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">{grade.label}.</span> {grade.meaning}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a substitute for assessment by a dermatologist. Stop any test and
        seek urgent medical help if you get facial or throat swelling, widespread hives or difficulty
        breathing. A negative home test does not guarantee safety, and hair colourant instructions
        require a fresh test 48 hours before every colouration.
      </p>
    </main>
  );
}
