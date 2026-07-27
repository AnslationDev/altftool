"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck, Syringe } from "lucide-react";

import {
  DIRTY_WOUND_INTERVAL_YEARS,
  DOSE_HISTORY,
  DOSE_HISTORY_LABELS,
  PRIMARY_SERIES_DOSES,
  ROUTINE_BOOSTER_INTERVAL_YEARS,
  TDAP_PREGNANCY_MAX_WEEK,
  TDAP_PREGNANCY_MIN_WEEK,
  WOUND_LABELS,
  WOUND_TYPES,
  addYears,
  assessTetanusBooster,
  parseISODate,
  toISODate,
} from "../lib";

const DASH = "—";

const YEARS_FMT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const DAYS_FMT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Fixed date used for the server render so markup matches before hydration. */
const REFERENCE_TODAY = "2026-01-01";
/** Default example history: a dose given this many years before the reference date. */
const DEFAULT_YEARS_SINCE_DOSE = 8;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Default last-dose date, expressed relative to whichever "today" is in play. */
function defaultLastDose(todayISO) {
  const ms = parseISODate(todayISO);
  if (ms === null) return "";
  return toISODate(addYears(ms, -DEFAULT_YEARS_SINCE_DOSE));
}

export default function ToolHome() {
  const [todayISO, setTodayISO] = useState(REFERENCE_TODAY);
  const [lastDoseISO, setLastDoseISO] = useState(() => defaultLastDose(REFERENCE_TODAY));
  const [doseHistory, setDoseHistory] = useState(DOSE_HISTORY[0]);
  const [wound, setWound] = useState(WOUND_TYPES[0]);
  const [pregnant, setPregnant] = useState(false);
  const [weeksPregnant, setWeeksPregnant] = useState("30");
  const [seeded, setSeeded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Move to the real current date once, on the client only, and slide the example
  // last-dose date along with it so the first result on screen still reads sensibly.
  useEffect(() => {
    if (seeded) return;
    const now = new Date();
    const realToday = toISODate(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
    setTodayISO(realToday);
    setLastDoseISO((current) =>
      current === defaultLastDose(REFERENCE_TODAY) ? defaultLastDose(realToday) : current,
    );
    setSeeded(true);
  }, [seeded]);

  const result = useMemo(
    () =>
      assessTetanusBooster({
        todayISO,
        lastDoseISO,
        doseHistory,
        wound,
        pregnant,
        weeksPregnant: pregnant ? weeksPregnant : null,
      }),
    [todayISO, lastDoseISO, doseHistory, wound, pregnant, weeksPregnant],
  );

  const hasError = Boolean(result.error);
  const isDue = !hasError && result.boosterIndicated;

  const elapsedLabel =
    hasError || result.yearsSinceLastDose === null
      ? DASH
      : `${YEARS_FMT.format(result.yearsSinceLastDose)} years (${DAYS_FMT.format(result.daysSinceLastDose)} days)`;

  const nextRoutineLabel = hasError
    ? DASH
    : result.routineDueISO === null
      ? "Set by the date of the final course dose"
      : result.routineOverdue
        ? `${result.routineDueISO} — passed`
        : `${result.routineDueISO} (in ${DAYS_FMT.format(result.daysUntilRoutineDue)} days)`;

  const woundCutoffLabel = hasError
    ? DASH
    : result.woundDueISO === null
      ? "Not applicable without a dose date"
      : `${result.woundDueISO} — ${result.pastFiveYears ? "passed" : "not yet reached"}`;

  const pregnancyLabel = hasError
    ? DASH
    : !result.pregnancyTdapDue
      ? "Not applicable"
      : result.pregnancyInWindow === null
        ? `Tdap due this pregnancy (weeks ${TDAP_PREGNANCY_MIN_WEEK}–${TDAP_PREGNANCY_MAX_WEEK} preferred)`
        : result.pregnancyInWindow
          ? `Due now — inside the weeks ${TDAP_PREGNANCY_MIN_WEEK}–${TDAP_PREGNANCY_MAX_WEEK} window`
          : `Due this pregnancy — ideally wait for weeks ${TDAP_PREGNANCY_MIN_WEEK}–${TDAP_PREGNANCY_MAX_WEEK}`;

  const rows = [
    ["Time since last dose", elapsedLabel],
    [
      "Interval that applies",
      hasError ? DASH : `${result.thresholdYears} years (${result.woundLabel})`,
    ],
    ["Vaccination history", hasError ? DASH : result.doseHistoryLabel],
    [`Next routine ${ROUTINE_BOOSTER_INTERVAL_YEARS}-year booster`, nextRoutineLabel],
    [`${DIRTY_WOUND_INTERVAL_YEARS}-year wound cut-off`, woundCutoffLabel],
    [
      "Tetanus immune globulin (TIG)",
      hasError ? DASH : result.tigIndicated ? "Indicated as well as the vaccine" : "Not indicated",
    ],
    ["Tdap in pregnancy", pregnancyLabel],
  ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Tetanus booster check — ${result.headline}`,
      `Assessment date: ${result.todayISO}`,
      `Last dose: ${result.lastDoseISO ?? "not recorded"}`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      "",
      ...result.reasons.map((reason) => `- ${reason}`),
    ].join("\n");
  }, [hasError, result, rows]);

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
    setLastDoseISO(defaultLastDose(todayISO));
    setDoseHistory(DOSE_HISTORY[0]);
    setWound(WOUND_TYPES[0]);
    setPregnant(false);
    setWeeksPregnant("30");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Syringe className="h-4 w-4" aria-hidden="true" />
          Vaccine timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tetanus Booster Due Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the date of your last tetanus-containing dose to see whether a booster is due, using
          the routine {ROUTINE_BOOSTER_INTERVAL_YEARS}-year interval and the shorter{" "}
          {DIRTY_WOUND_INTERVAL_YEARS}-year interval that applies to dirty, deep or contaminated
          wounds.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tetanus-last-dose">
              Date of last tetanus dose
            </label>
            <input
              id="tetanus-last-dose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastDoseISO}
              max={todayISO}
              onChange={(event) => setLastDoseISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tetanus-today">
              Assessment date
            </label>
            <input
              id="tetanus-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={todayISO}
              onChange={(event) => setTodayISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tetanus-history">
              Previous doses
            </label>
            <select
              id="tetanus-history"
              className={`mt-2 ${INPUT_CLASS}`}
              value={doseHistory}
              onChange={(event) => setDoseHistory(event.target.value)}
            >
              {DOSE_HISTORY.map((key) => (
                <option key={key} value={key}>
                  {DOSE_HISTORY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tetanus-wound">
              Wound type
            </label>
            <select
              id="tetanus-wound"
              className={`mt-2 ${INPUT_CLASS}`}
              value={wound}
              onChange={(event) => setWound(event.target.value)}
            >
              {WOUND_TYPES.map((key) => (
                <option key={key} value={key}>
                  {WOUND_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--foreground)]"
              htmlFor="tetanus-pregnant"
            >
              <input
                id="tetanus-pregnant"
                type="checkbox"
                className="h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                checked={pregnant}
                onChange={(event) => setPregnant(event.target.checked)}
              />
              Currently pregnant
            </label>
          </div>
          {pregnant ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="tetanus-weeks">
                Weeks of pregnancy
              </label>
              <input
                id="tetanus-weeks"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="45"
                step="1"
                value={weeksPregnant}
                onChange={(event) => setWeeksPregnant(event.target.value)}
              />
            </div>
          ) : null}
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
              Booster status
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : isDue
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? DASH : result.headline}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Assessed on ${result.todayISO} against a ${result.thresholdYears}-year interval.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the tetanus booster result"
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

        <div className="mt-5 overflow-x-auto">
          <dl className="min-w-[18rem] divide-y divide-[var(--border)] text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {!hasError && result.reasons.length > 0 ? (
          <ul className="mt-5 space-y-2 rounded-md bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.reasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <ShieldCheck
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, based on the published tetanus wound-management schedule ({" "}
        {PRIMARY_SERIES_DOSES}-dose primary course, {ROUTINE_BOOSTER_INTERVAL_YEARS}-year routine
        booster, {DIRTY_WOUND_INTERVAL_YEARS}-year interval for contaminated wounds). Any wound that
        may need tetanus cover should be seen by a clinician, who will also assess cleaning, closure
        and antibiotics.
      </p>
    </main>
  );
}
