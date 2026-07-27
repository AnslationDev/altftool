"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Hourglass, RotateCcw } from "lucide-react";

import {
  TIER_PRESETS,
  computeCountdown,
  computeMockBudget,
  computeRevisionPlan,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function pretty(iso) {
  if (!iso) return DASH;
  const [y, m, d] = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(y, m - 1, d)));
}

const DEFAULTS = {
  tierId: "tier1",
  examDate: TIER_PRESETS[0].defaultDate,
  mocksPerWeek: "3",
};

export default function ToolHome() {
  const [tierId, setTierId] = useState(DEFAULTS.tierId);
  const [examDate, setExamDate] = useState(DEFAULTS.examDate);
  const [mocksPerWeek, setMocksPerWeek] = useState(DEFAULTS.mocksPerWeek);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tier = TIER_PRESETS.find((item) => item.id === tierId) ?? TIER_PRESETS[0];

  const countdown = useMemo(() => computeCountdown({ nowMs, examDate }), [nowMs, examDate]);
  const plan = useMemo(() => computeRevisionPlan({ nowMs, examDate }), [nowMs, examDate]);
  const mocks = useMemo(
    () =>
      computeMockBudget({
        nowMs,
        examDate,
        mocksPerWeek: mocksPerWeek.trim() === "" ? NaN : Number(mocksPerWeek),
      }),
    [nowMs, examDate, mocksPerWeek],
  );

  const hasError = Boolean(countdown.error);
  const isPast = !hasError && countdown.past;

  const summary = useMemo(() => {
    if (hasError || isPast) return "";
    const lines = [
      `SSC ${tier.label} — ${pretty(examDate)}`,
      `${countdown.days} days ${countdown.hours} h ${countdown.minutes} m to go (${countdown.weeks} weeks ${countdown.weekRemainderDays} days)`,
    ];
    if (!mocks.error) {
      lines.push(`${mocks.totalMocks} full mocks fit at ${mocks.mocksPerWeek}/week`);
    }
    if (plan.phases?.length) {
      lines.push("", "Revision milestones:");
      for (const phase of plan.phases) {
        lines.push(`- ${phase.label}: ${phase.startDate} to ${phase.endDate} (${phase.days} days)`);
      }
    }
    return lines.join("\n");
  }, [hasError, isPast, tier, examDate, countdown, mocks, plan]);

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
    setTierId(DEFAULTS.tierId);
    setExamDate(DEFAULTS.examDate);
    setMocksPerWeek(DEFAULTS.mocksPerWeek);
    setCopied(false);
  };

  const selectTier = (id) => {
    setTierId(id);
    const next = TIER_PRESETS.find((item) => item.id === id);
    if (next) setExamDate(next.defaultDate);
  };

  const units = hasError
    ? []
    : [
        ["Days", countdown.days],
        ["Hours", countdown.hours],
        ["Minutes", countdown.minutes],
        ["Seconds", countdown.seconds],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Hourglass className="h-4 w-4" aria-hidden="true" />
          Combined Graduate Level
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">SSC CGL Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A live clock to Tier-I or Tier-II, a mock-test budget for your weekly cadence, and the
          standard revision taper — syllabus, mocks, revision, exam-week — mapped onto the exact
          dates of your remaining time.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cgl-tier">
              Tier
            </label>
            <select
              id="cgl-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tierId}
              onChange={(event) => selectTier(event.target.value)}
            >
              {TIER_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cgl-date">
              Exam date
            </label>
            <input
              id="cgl-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cgl-mocks">
              Full mocks per week
            </label>
            <input
              id="cgl-mocks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="14"
              step="1"
              value={mocksPerWeek}
              onChange={(event) => setMocksPerWeek(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{tier.note}</p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {countdown.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {tier.label} · {hasError ? DASH : pretty(examDate)}
            </p>
            {isPast ? (
              <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                That date has passed — set the next exam date.
              </p>
            ) : (
              <div
                className="mt-2 grid grid-cols-4 gap-2 text-center"
                role="timer"
                aria-live="off"
                aria-label="Time remaining to the exam"
              >
                {units.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-[var(--muted)] px-2 py-3">
                    <div className="text-2xl font-semibold tabular-nums text-[var(--primary)] sm:text-4xl">
                      {hasError ? DASH : String(value).padStart(2, "0")}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the countdown summary"
              className={GHOST_BTN}
              disabled={hasError || isPast}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError || isPast
            ? [
                ["Weeks remaining", DASH],
                ["Days for planning (incl. today)", DASH],
                ["Full mocks that fit", DASH],
              ]
            : [
                [
                  "Weeks remaining",
                  `${NUM.format(countdown.weeks)} weeks ${countdown.weekRemainderDays} days`,
                ],
                ["Days for planning (incl. today)", NUM.format(countdown.totalDays)],
                [
                  "Full mocks that fit",
                  mocks.error ? DASH : `${NUM.format(mocks.totalMocks)} at ${mocks.mocksPerWeek}/week`,
                ],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && !isPast && mocks.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {mocks.error}
          </p>
        ) : null}
      </section>

      {!hasError && !isPast && plan.phases?.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Revision milestones</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The standard taper — stop new material at 50% of the remaining time, drill mocks to
            80%, revise to 95%, then go light — placed on your calendar.
          </p>
          <ol className="mt-3 grid gap-2">
            {plan.phases.map((phase) => (
              <li
                key={phase.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--primary)]">
                    {phase.label}
                  </span>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {phase.startPercent}%–{phase.endPercent}% · {NUM.format(phase.days)} days
                  </span>
                </div>
                <div className="mt-1 font-semibold">
                  {pretty(phase.startDate)} → {pretty(phase.endDate)}
                </div>
                <p className="mt-1 text-[var(--muted-foreground)]">{phase.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Default dates sit in SSC&apos;s customary exam windows (Tier-I in September, Tier-II in
        December-January) and are not notified dates — confirm the schedule and your own shift on
        ssc.gov.in, then edit the date above to match.
      </p>
    </main>
  );
}
