"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import {
  FREQUENCIES,
  RDA_IU_ADULT,
  UL_IU_ADULT,
  buildVitaminDSchedule,
} from "../lib";

const IU = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";
const iu = (value) => `${IU.format(Number.isFinite(value) ? value : 0)} IU`;
const mcg = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} mcg`;
const showDate = (isoDate) => (isoDate ? DATE.format(new Date(`${isoDate}T00:00:00Z`)) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  doseAmount: "60000",
  unit: "iu",
  frequency: "weekly",
  startDate: "2026-01-05",
  doseCount: "8",
  ageYears: "35",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [doseAmount, setDoseAmount] = useState(DEFAULTS.doseAmount);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [doseCount, setDoseCount] = useState(DEFAULTS.doseCount);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildVitaminDSchedule({
        doseAmount: toNumber(doseAmount),
        unit,
        frequency,
        startDate,
        doseCount: toNumber(doseCount),
        ageYears: toNumber(ageYears),
      }),
    [doseAmount, unit, frequency, startDate, doseCount, ageYears],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Vitamin D schedule",
      `Dose: ${iu(result.perDoseIu)} (${mcg(result.perDoseMcg)}) — ${result.intervalLabel.toLowerCase()}`,
      `Course: ${result.totalDoses} doses, ${showDate(result.firstDoseIso)} to ${showDate(result.lastDoseIso)}`,
      `Total across the course: ${iu(result.totalIu)}`,
      `Average daily equivalent: ${iu(result.averageDailyIu)} (${NUM.format(result.rdaMultiple)}x the ${result.rdaIu} IU RDA)`,
      "",
      ...result.doses.map((dose) => `${dose.number}. ${showDate(dose.iso)}`),
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
    setDoseAmount(DEFAULTS.doseAmount);
    setUnit(DEFAULTS.unit);
    setFrequency(DEFAULTS.frequency);
    setStartDate(DEFAULTS.startDate);
    setDoseCount(DEFAULTS.doseCount);
    setAgeYears(DEFAULTS.ageYears);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vitamin D Supplement Schedule
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the dose your prescription or label states and how often it is taken. You get the
          exact dates, the total across the course, and the average daily intake those intermittent
          doses work out to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-dose">
              Dose taken each time
            </label>
            <input
              id="vd-dose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={doseAmount}
              onChange={(event) => setDoseAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-unit">
              Unit on the label
            </label>
            <select
              id="vd-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="iu">IU (International Units)</option>
              <option value="mcg">mcg / µg (micrograms)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-freq">
              How often it is taken
            </label>
            <select
              id="vd-freq"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {FREQUENCIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-count">
              Number of doses in the course
            </label>
            <input
              id="vd-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={doseCount}
              onChange={(event) => setDoseCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-start">
              First dose date
            </label>
            <input
              id="vd-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vd-age">
              Age in years (picks the RDA to compare with)
            </label>
            <input
              id="vd-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
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
              Average daily equivalent
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? iu(result.averageDailyIu) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${mcg(result.averageDailyMcg)} a day — ${NUM.format(result.rdaMultiple)}x the ${result.rdaIu} IU RDA, spread over ${result.coveredDays} days`
                : "Fix the inputs above to build the schedule."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the dosing schedule"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
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

        {ok && result.aboveUpperLimit ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            This averages more than the {IU.format(UL_IU_ADULT)} IU per day tolerable upper intake
            level for adults. High-dose loading courses are prescribed deliberately and are usually
            short — check the intended duration with the prescriber before repeating the course.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Dose each time", ok ? `${iu(result.perDoseIu)} (${mcg(result.perDoseMcg)})` : DASH],
            ["Frequency", ok ? result.intervalLabel : DASH],
            ["Doses in the course", ok ? String(result.totalDoses) : DASH],
            ["First dose", ok ? showDate(result.firstDoseIso) : DASH],
            ["Last dose", ok ? showDate(result.lastDoseIso) : DASH],
            ["Days the course covers", ok ? String(result.coveredDays) : DASH],
            ["Total across the course", ok ? iu(result.totalIu) : DASH],
            ["RDA used for comparison", ok ? iu(result.rdaIu) : DASH],
            ["Upper intake level (adults)", iu(UL_IU_ADULT)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Dose dates</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Running total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.doses.map((dose) => (
                  <tr key={dose.number}>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{dose.number}</td>
                    <td className="py-2 pr-3 font-medium whitespace-nowrap">{showDate(dose.iso)}</td>
                    <td className="py-2 text-right whitespace-nowrap">{iu(dose.cumulativeIu)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. The RDA of {IU.format(RDA_IU_ADULT)} IU a day and the
        upper limit of {IU.format(UL_IU_ADULT)} IU a day are population reference values from the US
        Institute of Medicine; a clinician treating a documented deficiency may prescribe far more
        for a defined period. Never change a prescribed dose or repeat a loading course on your own —
        confirm the plan and any follow-up blood test with the prescriber.
      </p>
    </main>
  );
}
