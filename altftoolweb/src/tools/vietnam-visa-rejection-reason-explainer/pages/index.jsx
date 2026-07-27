"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, PlaneTakeoff } from "lucide-react";

import {
  APPEAL_RULE,
  COUNTRY_LABEL,
  DEFAULT_GROUND_ID,
  REFUSAL_GROUNDS,
  SEVERITY_LABELS,
  buildActionPlan,
  matchRefusalText,
} from "../lib";

const DASH = "\u2014";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PERCENT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const LIST = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

export default function ToolHome() {
  const [selected, setSelected] = useState([DEFAULT_GROUND_ID]);
  const [completed, setCompleted] = useState([]);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => buildActionPlan({ groundIds: selected, completedSteps: completed }),
    [selected, completed],
  );

  const suggestions = useMemo(() => matchRefusalText(letter), [letter]);

  const toggleGround = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const toggleStep = (key) => {
    setCompleted((current) =>
      current.includes(key) ? current.filter((value) => value !== key) : [...current, key],
    );
    setCopied(false);
  };

  const reset = () => {
    setSelected([DEFAULT_GROUND_ID]);
    setCompleted([]);
    setLetter("");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      `${COUNTRY_LABEL} visa refusal - what it means and what to fix`,
      `Refusal grounds: ${LIST.format(plan.grounds.map((ground) => ground.title))}`,
      `Severity: ${SEVERITY_LABELS[plan.severity]}`,
      `Review or appeal route: ${plan.appealSummary}`,
      `Suggested wait before reapplying: ${plan.reapplyAdvice}`,
      `Fix checklist: ${plan.doneSteps} of ${plan.totalSteps} done (${plan.readiness}% ready)`,
      "",
      ...plan.steps.map((step) => `[${completed.includes(step.key) ? "x" : " "}] ${step.text}`),
    ].join("\n");
  }, [plan, completed]);

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

  const readinessText = plan.error ? DASH : `${PERCENT.format(plan.readiness)}%`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
          Vietnam refusal
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Vietnam Visa Rejection Reason Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Vietnamese e-Visas are decided on the uploaded file alone. Pick what applies to see the requirement behind the rejection and exactly what to correct before you pay again.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="refusal-letter">
          Paste the wording from your refusal notice (optional)
        </label>
        <textarea
          id="refusal-letter"
          rows={4}
          className={`mt-2 ${INPUT_CLASS}`}
          placeholder="Copy the reason lines from the letter or email here and we will point at the matching grounds."
          value={letter}
          onChange={(event) => setLetter(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Nothing leaves your browser {DASH} the matching runs on this page.
        </p>

        {suggestions.matches && suggestions.matches.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Closest matching grounds
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.matches.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => {
                    if (!selected.includes(match.id)) toggleGround(match.id);
                  }}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {match.title}
                  <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                    {match.confidence}% match
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which reason was ticked on your notice?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Select every ground that applies. More than one is common.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {REFUSAL_GROUNDS.map((ground) => {
            const isOn = selected.includes(ground.id);
            return (
              <label
                key={ground.id}
                htmlFor={`ground-${ground.id}`}
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                  isOn
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <input
                  id={`ground-${ground.id}`}
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={isOn}
                  onChange={() => toggleGround(ground.id)}
                />
                <span>
                  <span className="block font-semibold">{ground.title}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{ground.code}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {plan.error && (
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
              Reapplication readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{readinessText}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error ? DASH : `${plan.band} ${DASH} ${plan.doneSteps} of ${plan.totalSteps} fixes ticked off`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the refusal explanation and fix checklist"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the explainer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={plan.error ? "No readiness score yet" : `${plan.readiness}% of the fixes are done`}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${plan.error ? 0 : plan.readiness}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Grounds selected", plan.error ? DASH : LIST.format(plan.grounds.map((g) => g.title))],
            ["How serious", plan.error ? DASH : SEVERITY_LABELS[plan.severity]],
            ["Review or appeal route", plan.error ? DASH : plan.appealSummary],
            ["Before you reapply", plan.error ? DASH : plan.reapplyAdvice],
            ["Fixes outstanding", plan.error ? DASH : `${plan.openSteps} of ${plan.totalSteps}`],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="min-w-0 flex-1 text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error &&
        plan.grounds.map((ground) => (
          <section
            key={ground.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{ground.title}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ground.code} {DASH} {ground.legalBasis}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{ground.meaning}</p>

            <h3 className="mt-4 text-sm font-semibold">What usually triggers it</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {ground.triggers.map((trigger) => (
                <li key={trigger}>{trigger}</li>
              ))}
            </ul>

            <h3 className="mt-4 text-sm font-semibold">Fix this before you reapply</h3>
            <div className="mt-2 space-y-2">
              {plan.steps
                .filter((step) => step.groundId === ground.id)
                .map((step) => {
                  const done = completed.includes(step.key);
                  return (
                    <label
                      key={step.key}
                      htmlFor={`step-${step.key}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${step.key}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                        checked={done}
                        onChange={() => toggleStep(step.key)}
                      />
                      <span className={done ? "text-[var(--muted-foreground)] line-through" : ""}>
                        {step.text}
                      </span>
                    </label>
                  );
                })}
            </div>
          </section>
        ))}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">{APPEAL_RULE.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{APPEAL_RULE.detail}</p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or immigration advice. Rules and fees change; read the exact
        wording on your own refusal notice and check the official Vietnam Immigration Department pages, or speak to a
        licensed immigration adviser, before you reapply.
      </p>
    </main>
  );
}
