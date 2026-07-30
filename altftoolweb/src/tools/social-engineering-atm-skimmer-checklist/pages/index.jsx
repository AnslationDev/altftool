"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, RotateCcw } from "lucide-react";
import {
  ALL_STEPS,
  CHECK_GROUPS,
  SEVERITY_LABEL,
  STATUS,
  TOTAL_SECONDS,
  evaluateInspection,
  formatInspection,
} from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--success)]",
};
const TONE_BAR = {
  danger: "bg-[var(--danger)]",
  warning: "bg-[var(--warning)]",
  success: "bg-[var(--success)]",
};

const CHOICES = [
  { value: STATUS.OK, label: "Fine" },
  { value: STATUS.PROBLEM, label: "Problem" },
  { value: STATUS.UNCHECKED, label: "Skip" },
];

const DASH = "—";

const buildDefaults = () =>
  Object.fromEntries(
    ALL_STEPS.map((step) => {
      if (step.id === "leaflet") return [step.id, STATUS.PROBLEM];
      if (step.id === "alerts") return [step.id, STATUS.UNCHECKED];
      return [step.id, STATUS.OK];
    }),
  );

const allTo = (value) => Object.fromEntries(ALL_STEPS.map((step) => [step.id, value]));

export default function ToolHome() {
  const [statuses, setStatuses] = useState(buildDefaults);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => evaluateInspection({ statuses }), [statuses]);
  const summary = useMemo(() => formatInspection(result), [result]);
  const failed = Boolean(result.error);

  const setStatus = (id, value) => {
    setStatuses((current) => ({ ...current, [id]: value }));
    setCopied(false);
  };

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
    setStatuses(buildDefaults());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Card safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ATM Skimmer Inspection Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Walk the {ALL_STEPS.length} physical checks before you insert a card at an unfamiliar
          machine — roughly {TOTAL_SECONDS} seconds in total. Three of them are stop findings: any one
          of those means the machine has been tampered with.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setStatuses(allTo(STATUS.OK));
            setCopied(false);
          }}
          className={GHOST_BTN}
        >
          Mark all fine
        </button>
        <button
          type="button"
          onClick={() => {
            setStatuses(allTo(STATUS.UNCHECKED));
            setCopied(false);
          }}
          className={GHOST_BTN}
        >
          Start a fresh inspection
        </button>
      </div>

      {CHECK_GROUPS.map((group) => (
        <section
          key={group.id}
          className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <h2 className="text-base font-semibold">{group.title}</h2>
          <ul className="mt-3 grid gap-4">
            {group.steps.map((step) => (
              <li key={step.id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                <fieldset>
                  <legend className="text-sm font-semibold leading-6">
                    {step.label}
                    {step.severity === "stop" && (
                      <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        stop finding
                      </span>
                    )}
                  </legend>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step.how}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CHOICES.map((choice) => {
                      const inputId = `${step.id}-${choice.value}`;
                      const active = (statuses[step.id] || STATUS.UNCHECKED) === choice.value;
                      return (
                        <span key={choice.value} className="contents">
                          <input
                            id={inputId}
                            type="radio"
                            name={`atm-${step.id}`}
                            className="sr-only"
                            value={choice.value}
                            checked={active}
                            onChange={() => setStatus(step.id, choice.value)}
                          />
                          <label
                            htmlFor={inputId}
                            className={`inline-flex min-h-11 cursor-pointer items-center rounded-md border px-4 text-sm font-semibold transition ${
                              active
                                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                            }`}
                          >
                            {choice.label}
                          </label>
                        </span>
                      );
                    })}
                  </div>
                </fieldset>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${
                failed ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.verdict.tone]
              }`}
            >
              {failed ? DASH : result.verdict.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the ATM inspection result"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={failed ? "Coverage unavailable" : `${result.coverage}% of the checks completed`}
        >
          {!failed && (
            <span
              className={`block h-full ${TONE_BAR[result.verdict.tone]}`}
              style={{ width: `${Math.max(2, result.coverage)}%` }}
            />
          )}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Checks completed", failed ? DASH : `${result.checkedCount} of ${result.totalSteps} (${result.coverage}%)`],
            ["Problems found", failed ? DASH : String(result.problems.length)],
            ["Stop findings", failed ? DASH : String(result.stopFindings.length)],
            ["Risk score from problems", failed ? DASH : String(result.riskScore)],
            [
              "Time left to finish",
              failed ? DASH : result.secondsRemaining > 0 ? `about ${result.secondsRemaining} seconds` : "Inspection complete",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {result.verdict.advice}
          </p>
        )}
      </section>

      {!failed && result.problems.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Problems, most serious first</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Finding</th>
                  <th scope="col" className="py-2 text-right font-semibold">Severity</th>
                </tr>
              </thead>
              <tbody>
                {result.problems.map((step) => (
                  <tr key={step.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 leading-6">{step.label}</td>
                    <td className="py-2 text-right font-semibold">{SEVERITY_LABEL[step.severity]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!failed && result.pending.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Still to check</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.pending.map((step) => (
              <li key={step.id} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                <span>{step.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Passing every check does not guarantee a machine is clean — deep-insert
        skimmers sit inside the card reader and are invisible from outside, which is why covering the
        keypad and keeping transaction alerts on matter more than any visual inspection.
      </p>
    </main>
  );
}
