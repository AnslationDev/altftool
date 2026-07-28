"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Router } from "lucide-react";
import {
  ADMIN_URL,
  HARDENING_STEPS,
  ROUTER_MODEL_NOTE,
  formatHardeningSummary,
  scoreHardening,
} from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TOOL_TITLE = "Airtel Xstream Router Hardening";
const DASH = "—";

const BAND_STYLE = {
  hardened: { text: "text-[var(--success)]", bar: "bg-[var(--success)]" },
  good: { text: "text-[var(--success)]", bar: "bg-[var(--success)]" },
  weak: { text: "text-[var(--warning-text)]", bar: "bg-[var(--warning)]" },
  exposed: { text: "text-[var(--danger)]", bar: "bg-[var(--danger)]" },
};

const SEVERITY_STYLE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  high: "bg-[var(--warning-soft)] text-[var(--warning-text)]",
  medium: "bg-[var(--info-soft)] text-[var(--info)]",
};

const GROUPS = HARDENING_STEPS.reduce((acc, step) => {
  if (!acc.includes(step.group)) acc.push(step.group);
  return acc;
}, []);

export default function ToolHome() {
  const [completed, setCompleted] = useState([]);
  const [notApplicable, setNotApplicable] = useState([]);
  const [openStep, setOpenStep] = useState(HARDENING_STEPS[0].id);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreHardening({ completed, notApplicable }),
    [completed, notApplicable],
  );
  const summary = useMemo(() => formatHardeningSummary(result), [result]);
  const hasError = Boolean(result.error);
  const bandStyle = BAND_STYLE[result.band] || BAND_STYLE.exposed;

  const toggleDone = (id) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setNotApplicable((current) => current.filter((item) => item !== id));
    setCopied(false);
  };

  const toggleSkip = (id) => {
    setNotApplicable((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCompleted((current) => current.filter((item) => item !== id));
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
    setCompleted([]);
    setNotApplicable([]);
    setOpenStep(HARDENING_STEPS[0].id);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Router className="h-4 w-4" aria-hidden="true" />
          Router hardening
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{TOOL_TITLE}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work through the list on your Airtel Xstream Fibre ONT and tick each item off. Critical
          steps are weighted heaviest, and the score refuses to read well while any of them is still
          open. Nothing you tick leaves this page.
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {ROUTER_MODEL_NOTE} Admin page: <span className="font-mono">{ADMIN_URL}</span>
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hardening score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : bandStyle.text}`}
            >
              {hasError ? DASH : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Un-skip a step to get a score." : result.bandLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the remaining hardening steps"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <span className={`block h-full ${bandStyle.bar}`} style={{ width: `${result.score}%` }} />
          </div>
        )}

        {!hasError && result.openCritical > 0 && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.openCritical} critical step{result.openCritical === 1 ? " is" : "s are"} still
            open. The score is capped until they are done.
          </p>
        )}

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps done", hasError ? DASH : `${result.doneCount} of ${result.stepCount}`],
            ["Steps still open", hasError ? DASH : String(result.openCount)],
            ["Marked not applicable", hasError ? DASH : String(result.skippedCount)],
            ["Critical steps open", hasError ? DASH : String(result.openCritical)],
            ["Time left to finish", hasError ? DASH : `about ${result.openMinutes} min`],
            ["Points", hasError ? DASH : `${result.earned} of ${result.applicablePoints}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {GROUPS.map((group) => (
        <section key={group} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{group}</h2>
          <ul className="mt-3 space-y-3">
            {HARDENING_STEPS.filter((step) => step.group === group).map((step) => {
              const isDone = completed.includes(step.id);
              const isSkipped = notApplicable.includes(step.id);
              const isOpen = openStep === step.id;
              return (
                <li
                  key={step.id}
                  className="rounded-lg border border-[var(--border)] p-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={`step-${step.id}`}
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleDone(step.id)}
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    />
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`step-${step.id}`}
                        className={`block cursor-pointer text-sm font-semibold ${isSkipped ? "text-[var(--muted-foreground)] line-through" : ""}`}
                      >
                        {step.title}
                      </label>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${SEVERITY_STYLE[step.severity]}`}
                        >
                          {step.severity}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          about {step.minutes} min
                        </span>
                        <button
                          type="button"
                          onClick={() => setOpenStep(isOpen ? "" : step.id)}
                          aria-expanded={isOpen}
                          className="min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          {isOpen ? "Hide details" : "Why and how"}
                        </button>
                        <label
                          htmlFor={`skip-${step.id}`}
                          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-xs font-semibold text-[var(--muted-foreground)]"
                        >
                          <input
                            id={`skip-${step.id}`}
                            type="checkbox"
                            checked={isSkipped}
                            onChange={() => toggleSkip(step.id)}
                            className="h-5 w-5 accent-[var(--primary)]"
                          />
                          Not applicable
                        </label>
                      </div>
                      {isOpen && (
                        <div className="mt-3 space-y-2 text-sm leading-6">
                          <p className="text-[var(--muted-foreground)]">{step.why}</p>
                          <p>
                            <span className="font-semibold">Where: </span>
                            <span className="text-[var(--muted-foreground)]">{step.how}</span>
                          </p>
                          <p>
                            <span className="font-semibold">Check it worked: </span>
                            <span className="text-[var(--muted-foreground)]">{step.verify}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Menu labels vary by ONT vendor and firmware build, and an Airtel-managed
        unit may re-apply some settings from the provisioning server. If a change drops your
        connection, power-cycle the ONT and contact Airtel support rather than factory-resetting it.
      </p>
    </main>
  );
}
