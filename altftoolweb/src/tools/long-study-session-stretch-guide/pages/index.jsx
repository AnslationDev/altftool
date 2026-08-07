"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, StretchHorizontal } from "lucide-react";

import { STRETCHES_PER_BREAK, buildStretchPlan } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  session: "360",
  interval: "50",
};

const DASH = "—";

function minutesLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins} min`;
  return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`;
}

export default function ToolHome() {
  const [session, setSession] = useState(DEFAULTS.session);
  const [interval, setIntervalMin] = useState(DEFAULTS.interval);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildStretchPlan({
        sessionMinutes: session.trim() === "" ? Number.NaN : Number(session),
        intervalMinutes: interval.trim() === "" ? Number.NaN : Number(interval),
      }),
    [session, interval],
  );

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Stretch plan — ${minutesLabel(Number(session))} study day, break every ${interval} min`,
      `${plan.breakCount} stretch breaks · about ${Math.round(plan.totalStretchSeconds / 60)} min of stretching in total`,
      "",
      ...plan.breaks.map(
        (b) =>
          `At ${minutesLabel(b.minute)}: ${b.stretches.map((s) => s.name).join(", ")} (~${Math.round(b.seconds / 60 * 10) / 10} min)`,
      ),
    ].join("\n");
  }, [hasError, plan, session, interval]);

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
    setSession(DEFAULTS.session);
    setIntervalMin(DEFAULTS.interval);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Stretch breaks", DASH],
        ["Stretches per break", DASH],
        ["Total stretch time", DASH],
        ["Body areas covered", DASH],
      ]
    : [
        ["Stretch breaks", NUM.format(plan.breakCount)],
        ["Stretches per break", NUM.format(STRETCHES_PER_BREAK)],
        ["Total stretch time", `${Math.floor(plan.totalStretchSeconds / 60)} min ${plan.totalStretchSeconds % 60} s`],
        ["Body areas covered", plan.breakCount === 0 ? DASH : plan.areasCovered.join(", ")],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <StretchHorizontal className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Long Study Session Stretch Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your study day length and get rotating three-stretch breaks — neck, shoulders,
          wrists, back and hips — with holds inside the ACSM 10–30 second guideline.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lss-session">
              Study day length (minutes)
            </label>
            <input
              id="lss-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="45"
              max="720"
              step="15"
              value={session}
              onChange={(event) => setSession(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">360 = a six-hour day.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lss-interval">
              Stretch break every (minutes)
            </label>
            <input
              id="lss-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="120"
              step="5"
              value={interval}
              onChange={(event) => setIntervalMin(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Stretch breaks in your day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.breakCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `About ${Math.round(plan.totalStretchSeconds / 60)} minutes of stretching spread across the day — the bank rotates so every break works different areas.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the stretch plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
      </section>

      {!hasError && plan.breakCount === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">
          No breaks fit in this session length — try a shorter break interval.
        </p>
      ) : null}

      {!hasError ? (
        <section className="mt-6 space-y-4" aria-live="polite" aria-atomic="true">
          {plan.breaks.map((b) => (
            <div key={b.index} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">
                Break {b.index} — at {minutesLabel(b.minute)}
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ~{Math.round((b.seconds / 60) * 10) / 10} min
                </span>
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {b.stretches.map((stretch) => (
                  <li
                    key={stretch.id}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <p className="font-semibold">
                      {stretch.name}
                      <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                        {stretch.area} · hold {stretch.holdSeconds} s × {stretch.reps}
                      </span>
                    </p>
                    <p className="mt-1 text-[var(--muted-foreground)]">{stretch.how}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General fitness information, not medical advice. Stretch to gentle tension, never pain, and
        keep breathing through each hold. Skip any stretch that hurts, and see a doctor or
        physiotherapist for existing injuries or persistent pain.
      </p>
    </main>
  );
}
