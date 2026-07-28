"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import { LUTEAL_BANDS, PREGNANCY_TEST_DPO, computeLutealPhase } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const days = (value) =>
  Number.isFinite(value) ? `${NUM0.format(value)} day${value === 1 ? "" : "s"}` : DASH;
const pct = (value) => (Number.isFinite(value) ? `${NUM0.format(value)}%` : DASH);

const DEFAULTS = {
  previousPeriod: "2026-07-01",
  ovulation: "2026-07-14",
  nextPeriod: "2026-07-29",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [previousPeriod, setPreviousPeriod] = useState(DEFAULTS.previousPeriod);
  const [ovulation, setOvulation] = useState(DEFAULTS.ovulation);
  const [nextPeriod, setNextPeriod] = useState(DEFAULTS.nextPeriod);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeLutealPhase({
        previousPeriodDate: previousPeriod,
        ovulationDate: ovulation,
        nextPeriodDate: nextPeriod,
      }),
    [previousPeriod, ovulation, nextPeriod],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Luteal Phase Length Calculator",
      `Ovulation: ${result.ovulationDate}`,
      `Next period started: ${result.nextPeriodDate}`,
      `Luteal phase: ${days(result.lutealDays)} (day after ovulation to the day before the period)`,
      `Counting ovulation day itself: ${days(result.lutealDaysInclusive)}`,
      `Band: ${result.bandLabel}`,
      result.cycleLength === null
        ? "Cycle length: not entered"
        : `Follicular phase: ${days(result.follicularDays)} | Cycle length: ${days(result.cycleLength)}`,
    ].join("\n");
  }, [ok, result]);

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
    setPreviousPeriod(DEFAULTS.previousPeriod);
    setOvulation(DEFAULTS.ovulation);
    setNextPeriod(DEFAULTS.nextPeriod);
    setCopied(false);
  };

  const rows = [
    ["Band", ok ? result.bandLabel : DASH],
    ["Counting ovulation day as luteal day 1", ok ? days(result.lutealDaysInclusive) : DASH],
    [
      "Days between ovulation and the period",
      ok ? days(result.daysBetweenOvulationAndPeriod) : DASH,
    ],
    ["Follicular phase", ok && result.follicularDays !== null ? days(result.follicularDays) : DASH],
    ["Cycle length", ok && result.cycleLength !== null ? days(result.cycleLength) : DASH],
    [
      "Share of the cycle that was luteal",
      ok && result.lutealShare !== null ? pct(result.lutealShare) : DASH,
    ],
    [`Test date if a period is missed (${PREGNANCY_TEST_DPO} DPO)`, ok ? result.testDate : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Cycle tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Luteal Phase Length Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the day you ovulated and the day your next period started. The luteal phase is
          counted from the day after ovulation up to and including the day before the period — the
          convention that makes a classic 28-day cycle come out at 14 days.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="luteal-ovulation">
              Ovulation date
            </label>
            <input
              id="luteal-ovulation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={ovulation}
              onChange={(event) => setOvulation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="luteal-next">
              Day 1 of the period that followed
            </label>
            <input
              id="luteal-next"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={nextPeriod}
              onChange={(event) => setNextPeriod(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="luteal-previous">
              Day 1 of the period before ovulation (optional)
            </label>
            <input
              id="luteal-previous"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={previousPeriod}
              onChange={(event) => setPreviousPeriod(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Add this to also get follicular phase length and total cycle length.
            </p>
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Luteal phase length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? days(result.lutealDays) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.ovulationDate} to ${result.nextPeriodDate}`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy luteal phase result"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.bandNote ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.bandNote}
          </p>
        ) : null}

        {ok && result.cycleLength !== null ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Follicular phase is ${pct(result.follicularShare)} of the cycle and the luteal phase is ${pct(result.lutealShare)}`}
            >
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${result.follicularShare}%` }}
              />
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.lutealShare}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Follicular {pct(result.follicularShare)} · Luteal {pct(result.lutealShare)}
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How luteal phase lengths are described</h2>
        <table className="mt-3 w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Length
              </th>
              <th scope="col" className="py-2 font-semibold">
                Usually described as
              </th>
            </tr>
          </thead>
          <tbody>
            {LUTEAL_BANDS.map((band) => (
              <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3 whitespace-nowrap">
                  {band.max === Infinity
                    ? `${band.min} days or more`
                    : `${band.min}-${band.max} days`}
                </td>
                <td className="py-2 font-semibold">{band.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. A single cycle tells you very little — patterns over
        three or more cycles are what a clinician will want to see. Talk to a doctor or fertility
        specialist about a persistently short luteal phase, cycles that change suddenly, or bleeding
        between periods.
      </p>
    </main>
  );
}
