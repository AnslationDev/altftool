"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEGREE_PRESETS,
  ECTS_PER_SEMESTER,
  HOURS_PER_ECTS_MAX,
  HOURS_PER_ECTS_MIN,
  computeEctsLoad,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  totalRequired: "180",
  earned: "90",
  semestersRemaining: "3",
  hoursPerCredit: "27",
  weeksPerSemester: "20",
};

const DASH = "—";

export default function ToolHome() {
  const [totalRequired, setTotalRequired] = useState(DEFAULTS.totalRequired);
  const [earned, setEarned] = useState(DEFAULTS.earned);
  const [semestersRemaining, setSemestersRemaining] = useState(DEFAULTS.semestersRemaining);
  const [hoursPerCredit, setHoursPerCredit] = useState(DEFAULTS.hoursPerCredit);
  const [weeksPerSemester, setWeeksPerSemester] = useState(DEFAULTS.weeksPerSemester);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeEctsLoad({
        totalRequired: totalRequired.trim() === "" ? Number.NaN : Number(totalRequired),
        earned: earned.trim() === "" ? Number.NaN : Number(earned),
        semestersRemaining:
          semestersRemaining.trim() === "" ? Number.NaN : Number(semestersRemaining),
        hoursPerCredit: hoursPerCredit.trim() === "" ? Number.NaN : Number(hoursPerCredit),
        weeksPerSemester: weeksPerSemester.trim() === "" ? Number.NaN : Number(weeksPerSemester),
      }),
    [totalRequired, earned, semestersRemaining, hoursPerCredit, weeksPerSemester],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "ECTS credit load plan",
      `Remaining credits: ${NUM.format(result.remaining)} ECTS`,
      `Needed per semester: ${NUM.format(result.perSemester)} ECTS (standard full time is ${ECTS_PER_SEMESTER})`,
      `Estimated workload: ${NUM.format(result.workloadHoursPerSemester)} h per semester ≈ ${NUM.format(result.hoursPerWeek)} h per week`,
      result.status,
    ].join("\n");
  }, [hasError, result]);

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
    setTotalRequired(DEFAULTS.totalRequired);
    setEarned(DEFAULTS.earned);
    setSemestersRemaining(DEFAULTS.semestersRemaining);
    setHoursPerCredit(DEFAULTS.hoursPerCredit);
    setWeeksPerSemester(DEFAULTS.weeksPerSemester);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Credits remaining", DASH],
        ["Credits needed per semester", DASH],
        ["Workload per semester", DASH],
        ["Workload per week", DASH],
        ["Load vs standard full time", DASH],
      ]
    : [
        ["Credits remaining", `${NUM.format(result.remaining)} ECTS`],
        ["Credits needed per semester", `${NUM.format(result.perSemester)} ECTS`],
        ["Workload per semester", `${NUM.format(result.workloadHoursPerSemester)} hours`],
        ["Workload per week", `${NUM.format(result.hoursPerWeek)} hours`],
        [
          "Load vs standard full time",
          `${NUM.format(result.loadRatio * 100)}% of ${ECTS_PER_SEMESTER} ECTS`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Study Planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ECTS Credit Load Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plans how many ECTS credits you must earn each remaining semester, using the ECTS
          Users&apos; Guide standards: 60 credits per year, 30 per full-time semester, and{" "}
          {HOURS_PER_ECTS_MIN}–{HOURS_PER_ECTS_MAX} workload hours per credit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ects-total">
              Total ECTS your degree requires
            </label>
            <input
              id="ects-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="30"
              value={totalRequired}
              onChange={(event) => setTotalRequired(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ects-earned">
              ECTS already earned
            </label>
            <input
              id="ects-earned"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={earned}
              onChange={(event) => setEarned(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ects-sems">
              Semesters remaining
            </label>
            <input
              id="ects-sems"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={semestersRemaining}
              onChange={(event) => setSemestersRemaining(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ects-hpc">
              Workload hours per ECTS ({HOURS_PER_ECTS_MIN}–{HOURS_PER_ECTS_MAX})
            </label>
            <input
              id="ects-hpc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={HOURS_PER_ECTS_MIN}
              max={HOURS_PER_ECTS_MAX}
              step="1"
              value={hoursPerCredit}
              onChange={(event) => setHoursPerCredit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ects-weeks">
              Weeks of study per semester
            </label>
            <input
              id="ects-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="30"
              step="1"
              value={weeksPerSemester}
              onChange={(event) => setWeeksPerSemester(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DEGREE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTotalRequired(String(preset.total))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
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
              ECTS needed per semester
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && result.overload ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : NUM.format(result.perSemester)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the ECTS load plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Based on the ECTS Users&apos; Guide (60 credits per academic year, {HOURS_PER_ECTS_MIN}–
        {HOURS_PER_ECTS_MAX} hours per credit). Universities may cap per-semester registration or
        require approval above 30 ECTS — confirm limits with your programme office.
      </p>
    </main>
  );
}
