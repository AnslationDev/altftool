"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, RotateCw } from "lucide-react";

import {
  DRIVE_TYPES,
  MAX_ROTATIONS,
  ROTATION_INTERVAL_KM_DEFAULT,
  ROTATION_INTERVAL_MONTHS_MAX,
  TYRE_TYPES,
  WHEEL_POSITIONS,
  planRotationSchedule,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";

const km = (value) => (Number.isFinite(value) ? `${NUM.format(value)} km` : DASH);
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const showDate = (iso) => {
  if (!iso) return DASH;
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(parsed) ? DATE.format(parsed) : DASH;
};

const DEFAULTS = {
  odometer: "22000",
  interval: String(ROTATION_INTERVAL_KM_DEFAULT),
  monthlyKm: "1200",
  startDate: "2026-01-01",
  rotations: "4",
  cost: "400",
  driveType: "fwd",
  tyreType: "standard",
  staggered: false,
  includeSpare: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [odometer, setOdometer] = useState(DEFAULTS.odometer);
  const [interval, setIntervalKm] = useState(DEFAULTS.interval);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [rotations, setRotations] = useState(DEFAULTS.rotations);
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [driveType, setDriveType] = useState(DEFAULTS.driveType);
  const [tyreType, setTyreType] = useState(DEFAULTS.tyreType);
  const [staggered, setStaggered] = useState(DEFAULTS.staggered);
  const [includeSpare, setIncludeSpare] = useState(DEFAULTS.includeSpare);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planRotationSchedule({
        currentOdometerKm: toNumber(odometer),
        intervalKm: toNumber(interval),
        monthlyKm: toNumber(monthlyKm),
        startDate,
        rotations: toNumber(rotations),
        costPerRotation: toNumber(cost),
        driveType,
        tyreType,
        staggered,
        includeSpare,
      }),
    [odometer, interval, monthlyKm, startDate, rotations, cost, driveType, tyreType, staggered, includeSpare],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Tyre Rotation Schedule",
      `Pattern: ${result.pattern.name}`,
      `Interval: ${km(result.effectiveIntervalKm)} or about ${result.intervalMonths} months (${result.limitedBy}-limited)`,
      `Next rotation: ${km(result.next.odometerKm)} on ${showDate(result.next.date)}`,
      "",
      ...result.events.map(
        (event) => `#${event.index}  ${km(event.odometerKm)}  ${showDate(event.date)}`,
      ),
      "",
      `Planned rotations: ${result.rotationsPlanned}`,
      `Estimated labour cost: ${money(result.totalCost)}`,
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
    setOdometer(DEFAULTS.odometer);
    setIntervalKm(DEFAULTS.interval);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setStartDate(DEFAULTS.startDate);
    setRotations(DEFAULTS.rotations);
    setCost(DEFAULTS.cost);
    setDriveType(DEFAULTS.driveType);
    setTyreType(DEFAULTS.tyreType);
    setStaggered(DEFAULTS.staggered);
    setIncludeSpare(DEFAULTS.includeSpare);
    setCopied(false);
  };

  const pattern = hasError ? null : result.pattern;
  const spareDisabled = tyreType === "directional" || staggered;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Tyre care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tyre Rotation Schedule Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Get the correct crossing pattern for your drivetrain and a dated rotation schedule that
          respects both the distance interval and the {ROTATION_INTERVAL_MONTHS_MAX}-month time cap.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-odo">
              Current odometer (km)
            </label>
            <input
              id="tyre-odo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={odometer}
              onChange={(event) => setOdometer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-interval">
              Rotation interval (km)
            </label>
            <input
              id="tyre-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1000"
              max="20000"
              step="500"
              value={interval}
              onChange={(event) => setIntervalKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-monthly">
              Average running (km per month)
            </label>
            <input
              id="tyre-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={monthlyKm}
              onChange={(event) => setMonthlyKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-start">
              Last rotation / start date
            </label>
            <input
              id="tyre-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-count">
              Rotations to plan (1-{MAX_ROTATIONS})
            </label>
            <input
              id="tyre-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ROTATIONS}
              step="1"
              value={rotations}
              onChange={(event) => setRotations(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-cost">
              Labour cost per rotation (INR)
            </label>
            <input
              id="tyre-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-drive">
              Drivetrain
            </label>
            <select
              id="tyre-drive"
              className={`mt-2 ${INPUT_CLASS}`}
              value={driveType}
              onChange={(event) => setDriveType(event.target.value)}
            >
              {DRIVE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tyre-type">
              Tyre tread
            </label>
            <select
              id="tyre-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tyreType}
              onChange={(event) => setTyreType(event.target.value)}
            >
              {TYRE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            htmlFor="tyre-staggered"
          >
            <input
              id="tyre-staggered"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={staggered}
              onChange={(event) => setStaggered(event.target.checked)}
            />
            Staggered fitment (different front/rear size)
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            htmlFor="tyre-spare"
          >
            <input
              id="tyre-spare"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeSpare && !spareDisabled}
              disabled={spareDisabled}
              onChange={(event) => setIncludeSpare(event.target.checked)}
            />
            Include a full-size matching spare
          </label>
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
              Next rotation due at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : km(result.next.odometerKm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `around ${showDate(result.next.date)} · ${result.limitedBy === "time" ? "time-limited" : "distance-limited"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy tyre rotation schedule"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rotation pattern", hasError ? DASH : pattern.name],
            ["Effective interval", hasError ? DASH : km(result.effectiveIntervalKm)],
            ["Interval in time", hasError ? DASH : `${result.intervalMonths} months (${result.intervalDays} days)`],
            ["Rotations planned", hasError ? DASH : String(result.rotationsPlanned)],
            ["Distance covered by plan", hasError ? DASH : km(result.horizonKm)],
            ["Plan spans", hasError ? DASH : `${result.horizonMonths} months`],
            ["Estimated labour cost", hasError ? DASH : money(result.totalCost)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{pattern.name}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{pattern.summary}</p>
          {pattern.moves.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {pattern.moves.map(([from, to]) => (
                <li
                  key={`${from}-${to}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{WHEEL_POSITIONS[from]}</span>
                  <span aria-hidden="true" className="text-[var(--muted-foreground)]">
                    &rarr;
                  </span>
                  <span className="text-[var(--muted-foreground)]">{WHEEL_POSITIONS[to]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              No safe rotation exists for this combination. Replace tyres in axle pairs instead.
            </p>
          )}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Odometer
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Approx. date
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Months in
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.events.map((event) => (
                  <tr key={event.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{event.index}</td>
                    <td className="py-2 pr-3 text-right">{km(event.odometerKm)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {showDate(event.date)}
                    </td>
                    <td className="py-2 text-right">{event.monthsFromStart}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dates are projections from your average monthly running. Always follow the interval and
        pattern printed in your owner&apos;s handbook, and have the wheels re-torqued and balanced
        after every rotation.
      </p>
    </main>
  );
}
