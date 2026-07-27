"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import {
  MIN_AGE_YEARS,
  SHARED_DECISION_MIN_AGE,
  TWO_DOSE_MAX_START_AGE,
  TWO_DOSE_MIN_MONTHS,
  UPPER_LICENSED_AGE,
  planHpvSchedule,
} from "../lib";

const DASH = "—";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const [year, month, day] = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(Date.UTC(year, month - 1, day)));
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  birth: "2014-05-10",
  first: "2026-07-26",
};

export default function ToolHome() {
  const [birth, setBirth] = useState(DEFAULTS.birth);
  const [first, setFirst] = useState(DEFAULTS.first);
  const [second, setSecond] = useState("");
  const [immunocompromised, setImmunocompromised] = useState(false);
  const [copied, setCopied] = useState(false);
  const [today] = useState(todayISO);

  const result = useMemo(
    () =>
      planHpvSchedule({
        birthDateISO: birth,
        firstDoseISO: first,
        secondDoseISO: second,
        immunocompromised,
        todayISO: today,
      }),
    [birth, first, second, immunocompromised, today],
  );

  const ok = !result.error;

  const summaryText = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "HPV vaccination schedule",
      `Age at dose 1: ${result.ageAtFirstDose} — ${result.scheduleName} (${result.scheduleReason})`,
      ...result.doses.map(
        (dose) =>
          `Dose ${dose.number}: ${prettyDate(dose.recommendedISO)}${dose.given ? " (given)" : ""} — not before ${prettyDate(dose.earliestISO)}`,
      ),
      `Series complete: ${prettyDate(result.completionISO)}`,
    ];
    return lines.join("\n");
  }, [ok, result]);

  const copyResult = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBirth(DEFAULTS.birth);
    setFirst(DEFAULTS.first);
    setSecond("");
    setImmunocompromised(false);
    setCopied(false);
  };

  const rows = ok
    ? [
        ["Age at first dose", `${result.ageAtFirstDose} years`],
        ["Why this schedule", result.scheduleReason],
        ["Doses in the series", String(result.doseCount)],
        ["Series complete on", prettyDate(result.completionISO)],
        ["Total span", `about ${result.totalMonths.toFixed(1)} months`],
      ]
    : [
        ["Age at first dose", DASH],
        ["Why this schedule", DASH],
        ["Doses in the series", DASH],
        ["Series complete on", DASH],
        ["Total span", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          HPV series
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          HPV Vaccine Schedule Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A series started before the {TWO_DOSE_MAX_START_AGE}th birthday takes two doses; started at{" "}
          {TWO_DOSE_MAX_START_AGE} or later, or with an immunocompromising condition, it takes three.
          Enter the date of birth and the first dose to get every appointment date and the earliest
          each one may be given.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hpv-birth">
              Date of birth
            </label>
            <input
              id="hpv-birth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={birth}
              onChange={(event) => setBirth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hpv-first">
              First dose date (planned or given)
            </label>
            <input
              id="hpv-first"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={first}
              onChange={(event) => setFirst(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hpv-second">
              Second dose date, if already given (optional)
            </label>
            <input
              id="hpv-second"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={second}
              onChange={(event) => setSecond(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
          <input
            id="hpv-immuno"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={immunocompromised}
            onChange={(event) => setImmunocompromised(event.target.checked)}
          />
          <label className="text-sm leading-6 text-[var(--foreground)]" htmlFor="hpv-immuno">
            Immunocompromising condition (including HIV infection) — three doses are used at any
            starting age
          </label>
        </div>
      </section>

      {result.error && (
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
              Doses needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.doseCount : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.scheduleName} — series complete ${prettyDate(result.completionISO)}`
                : "Fix the highlighted input to see a schedule."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the HPV vaccination schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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

        {ok && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <caption className="sr-only">HPV dose schedule</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Dose
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Not before
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    After dose 1
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.doses.map((dose) => (
                  <tr key={dose.number} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {dose.number}
                      {dose.given && (
                        <span className="ml-2 text-xs font-medium text-[var(--success)]">given</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">{prettyDate(dose.recommendedISO)}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {prettyDate(dose.earliestISO)}
                    </td>
                    <td className="py-2 text-right">
                      {dose.number === 1 ? DASH : `${dose.daysFromFirst} days`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {ok && (
          <div className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.thirdDoseRequired && (
              <p>
                Dose 2 came less than {TWO_DOSE_MIN_MONTHS} months after dose 1, so a third dose is
                needed to complete the series.
              </p>
            )}
            {result.secondDoseTooEarly && !result.thirdDoseRequired && (
              <p>
                Dose 2 was given before the minimum interval — the clinic will normally repeat it
                after the valid date shown.
              </p>
            )}
            {result.routineAge && (
              <p>
                Ages {11}-12 are the routine recommendation, when the response to the vaccine is
                strongest and only two doses are needed.
              </p>
            )}
            {result.sharedDecision && (
              <p>
                From age {SHARED_DECISION_MIN_AGE} to {UPPER_LICENSED_AGE}, HPV vaccination is a
                shared clinical decision rather than a routine recommendation — the benefit depends
                on previous exposure.
              </p>
            )}
            {result.aboveLicensedAge && (
              <p>
                This starting age is above {UPPER_LICENSED_AGE}, the upper limit of the current
                licence in most countries.
              </p>
            )}
            <p>
              An interrupted series is resumed, not restarted, however long the gap — earlier doses
              still count. Minimum age for dose 1 is {MIN_AGE_YEARS}.
            </p>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational scheduling only. National immunisation programmes vary in funded ages, product
        and interval, and some clinical situations need a different schedule — confirm the plan with
        the doctor, nurse or pharmacist giving the vaccine.
      </p>
    </main>
  );
}
