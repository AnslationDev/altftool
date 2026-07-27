"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw } from "lucide-react";

import { SYMPTOMS, diagnoseSuspension } from "../lib";

const DEFAULT_SYMPTOMS = ["clunkSpeedBreaker", "bounceTest"];

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const SAFETY_LABEL = {
  critical: "Safety critical",
  high: "Important",
  medium: "Worth fixing",
  low: "Routine",
};

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SYMPTOMS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => diagnoseSuspension(selected), [selected]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Suspension Wear Checklist",
      `Symptoms reported: ${result.selectedCount}`,
      ...result.selectedLabels.map((label) => `- ${label}`),
      "",
      "Most likely causes:",
      ...result.ranked
        .slice(0, 5)
        .map((cause, index) => `${index + 1}. ${cause.label} — confidence ${cause.sharePercent}%`),
      result.driveWithCaution
        ? "One or more findings affect steering or wheel security — have it inspected before driving far."
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [result]);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
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
    setSelected(DEFAULT_SYMPTOMS);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Suspension Wear Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick every noise, handling change and wear pattern you have actually noticed. Each one
          points at several components with different strengths, and the ranking below shows which
          to inspect first — with the check that confirms it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>What is the car doing?</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            The more you tick, the sharper the ranking gets.
          </p>
          <div className="mt-3 grid gap-2">
            {SYMPTOMS.map((symptom) => {
              const active = selected.includes(symptom.id);
              return (
                <label
                  key={symptom.id}
                  htmlFor={`sym-${symptom.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`sym-${symptom.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggle(symptom.id)}
                  />
                  <span>
                    <span className="block font-medium">{symptom.label}</span>
                    {symptom.urgent ? (
                      <span className="block text-xs text-[var(--danger)]">
                        Do not leave this one for later
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelected([]);
              setCopied(false);
            }}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            Clear all
          </button>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Most likely cause
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? result.topCause.label : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Confidence ${result.topCause.sharePercent}% · from ${result.selectedCount} symptom${result.selectedCount === 1 ? "" : "s"}`
                : "Tick a symptom above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy suspension diagnosis"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Symptoms ticked", ok ? String(result.selectedCount) : DASH],
            ["Candidate components", ok ? String(result.ranked.length) : DASH],
            ["Total evidence weight", ok ? String(result.totalScore) : DASH],
            [
              "Safety flag",
              ok ? (result.driveWithCaution ? "Inspect before driving far" : "No urgent finding") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.driveWithCaution ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            At least one of your findings affects steering or wheel security. Have the car looked at
            before a long or fast journey.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Ranked candidates and how to confirm each</h2>
          <ol className="mt-4 space-y-4">
            {result.ranked.map((cause) => (
              <li key={cause.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{cause.label}</h3>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {SAFETY_LABEL[cause.safety]} · {cause.sharePercent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${cause.sharePercent}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">Check: </span>
                  {cause.check}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">Fix: </span>
                  {cause.fix}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guide, not a substitute for inspection on a lift. Never work under a car
        supported only by a jack, and have steering and suspension joints checked by a qualified
        mechanic before deciding they are fine.
      </p>
    </main>
  );
}
