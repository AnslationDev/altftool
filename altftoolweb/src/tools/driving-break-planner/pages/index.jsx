"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw } from "lucide-react";
import {
  COMMERCIAL_BREAK_INTERVAL_HOURS,
  COMMERCIAL_BREAK_MINUTES,
  DEFAULT_MAX_DAILY_HOURS,
  PRIVATE_BREAK_INTERVAL_HOURS,
  PRIVATE_BREAK_MINUTES,
  commercialDefaults,
  formatDuration,
  planDrive,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEED_DATE = "2026-01-01";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  distance: "900",
  speed: "60",
  startTime: "06:00",
  buffer: "0",
  interval: String(PRIVATE_BREAK_INTERVAL_HOURS),
  breakMinutes: String(PRIVATE_BREAK_MINUTES),
  meals: "2",
  mealMinutes: "30",
  fuelRange: "500",
  fuelMinutes: "10",
  maxDaily: String(DEFAULT_MAX_DAILY_HOURS),
  overnight: "10",
  combine: false,
};

function localIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const prettyDate = (iso) => {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
};

const toNumber = (raw) => {
  if (String(raw).trim() === "") return NaN;
  return Number(String(raw).replace(/,/g, "").trim());
};

const KIND_STYLE = {
  start: "bg-[var(--muted)] text-[var(--primary)]",
  break: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  overnight: "bg-[var(--danger-soft)] text-[var(--danger)]",
  arrive: "bg-[var(--muted)] text-[var(--primary)]",
};

export default function ToolHome() {
  const [startDate, setStartDate] = useState(SEED_DATE);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [buffer, setBuffer] = useState(DEFAULTS.buffer);
  const [interval_, setInterval_] = useState(DEFAULTS.interval);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULTS.breakMinutes);
  const [meals, setMeals] = useState(DEFAULTS.meals);
  const [mealMinutes, setMealMinutes] = useState(DEFAULTS.mealMinutes);
  const [fuelRange, setFuelRange] = useState(DEFAULTS.fuelRange);
  const [fuelMinutes, setFuelMinutes] = useState(DEFAULTS.fuelMinutes);
  const [maxDaily, setMaxDaily] = useState(DEFAULTS.maxDaily);
  const [overnight, setOvernight] = useState(DEFAULTS.overnight);
  const [combine, setCombine] = useState(DEFAULTS.combine);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStartDate(localIsoDate());
  }, []);

  const result = useMemo(
    () =>
      planDrive({
        distanceKm: toNumber(distance),
        averageSpeedKmh: toNumber(speed),
        startDate,
        startTime,
        trafficBufferPct: toNumber(buffer),
        breakIntervalHours: toNumber(interval_),
        breakMinutes: toNumber(breakMinutes),
        mealStops: toNumber(meals),
        mealMinutes: toNumber(mealMinutes),
        fuelRangeKm: toNumber(fuelRange),
        fuelMinutes: toNumber(fuelMinutes),
        combineStops: combine,
        maxDailyDrivingHours: toNumber(maxDaily),
        overnightHours: toNumber(overnight),
      }),
    [
      distance,
      speed,
      startDate,
      startTime,
      buffer,
      interval_,
      breakMinutes,
      meals,
      mealMinutes,
      fuelRange,
      fuelMinutes,
      combine,
      maxDaily,
      overnight,
    ],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Driving Break Planner",
      `Distance ${result.distanceKm} km · driving time ${formatDuration(result.drivingMinutes)}`,
      `Stops: ${result.restBreaks} rest, ${result.fuelStops} fuel, ${result.mealStops} meal — ${formatDuration(result.stopMinutes)} off the road`,
      result.days > 1 ? `${result.days} days with ${formatDuration(result.overnightMinutes)} of overnight halt` : "Single day",
      `Total elapsed ${formatDuration(result.totalMinutes)} — arrive ${prettyDate(result.arrival.date)} at ${result.arrival.time}`,
      `Effective door-to-door speed ${NUM.format(result.averageOverallSpeed)} km/h`,
    ].join("\n");
  }, [failed, result]);

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

  const applyCommercial = () => {
    const preset = commercialDefaults();
    setInterval_(String(preset.breakIntervalHours));
    setBreakMinutes(String(preset.breakMinutes));
    setMaxDaily(String(preset.maxDailyDrivingHours));
  };

  const reset = () => {
    setDistance(DEFAULTS.distance);
    setSpeed(DEFAULTS.speed);
    setStartTime(DEFAULTS.startTime);
    setBuffer(DEFAULTS.buffer);
    setInterval_(DEFAULTS.interval);
    setBreakMinutes(DEFAULTS.breakMinutes);
    setMeals(DEFAULTS.meals);
    setMealMinutes(DEFAULTS.mealMinutes);
    setFuelRange(DEFAULTS.fuelRange);
    setFuelMinutes(DEFAULTS.fuelMinutes);
    setMaxDaily(DEFAULTS.maxDaily);
    setOvernight(DEFAULTS.overnight);
    setCombine(DEFAULTS.combine);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Road trips
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Driving Break Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out when to stop and when you will actually arrive. The default follows the standard
          fatigue advice of a {PRIVATE_BREAK_MINUTES}-minute break after every{" "}
          {PRIVATE_BREAK_INTERVAL_HOURS} hours at the wheel, and there is a preset for the commercial
          rule of {COMMERCIAL_BREAK_MINUTES} minutes after {COMMERCIAL_BREAK_INTERVAL_HOURS} hours.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The drive</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="distance">
              Distance (km)
            </label>
            <input
              id="distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="speed">
              Realistic average speed (km/h)
            </label>
            <input
              id="speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="150"
              step="5"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Moving average including towns, not the speed limit.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="start-date">
              Start date
            </label>
            <input
              id="start-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="start-time">
              Start time
            </label>
            <input
              id="start-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="buffer">
              Traffic and detour buffer (% added to driving time)
            </label>
            <input
              id="buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="5"
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Stops</h2>
          <button type="button" onClick={applyCommercial} className={GHOST_BTN}>
            Use the commercial driver rule
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="interval">
              Break after this many hours of driving
            </label>
            <input
              id="interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="12"
              step="0.5"
              value={interval_}
              onChange={(event) => setInterval_(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="break-minutes">
              Length of each break (minutes)
            </label>
            <input
              id="break-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={breakMinutes}
              onChange={(event) => setBreakMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meals">
              Meal stops
            </label>
            <input
              id="meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={meals}
              onChange={(event) => setMeals(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="meal-minutes">
              Length of a meal stop (minutes)
            </label>
            <input
              id="meal-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={mealMinutes}
              onChange={(event) => setMealMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-range">
              Range on a full tank (km, 0 to skip)
            </label>
            <input
              id="fuel-range"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={fuelRange}
              onChange={(event) => setFuelRange(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-minutes">
              Time to refuel (minutes)
            </label>
            <input
              id="fuel-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="5"
              value={fuelMinutes}
              onChange={(event) => setFuelMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="max-daily">
              Maximum driving hours in a day
            </label>
            <input
              id="max-daily"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="24"
              step="1"
              value={maxDaily}
              onChange={(event) => setMaxDaily(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="overnight">
              Overnight halt (hours)
            </label>
            <input
              id="overnight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="1"
              value={overnight}
              onChange={(event) => setOvernight(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="combine"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={combine}
            onChange={(event) => setCombine(event.target.checked)}
          />
          <label className="text-sm font-semibold" htmlFor="combine">
            Count meal and fuel halts as rest breaks
          </label>
        </div>
      </section>

      {failed && (
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
              You arrive
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : result.arrival.time}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see the plan."
                : `${prettyDate(result.arrival.date)}${result.arrival.dayOffset > 0 ? ` · ${result.arrival.dayOffset} day${result.arrival.dayOffset === 1 ? "" : "s"} after you set off` : " · same day"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the drive plan"
              className={GHOST_BTN}
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
            ["Time actually driving", failed ? "—" : formatDuration(result.drivingMinutes)],
            [
              "Rest breaks",
              failed ? "—" : `${result.restBreaks} × ${breakMinutes} min = ${formatDuration(result.restMinutesTotal)}`,
            ],
            [
              "Fuel stops",
              failed
                ? "—"
                : result.fuelStops > 0
                  ? `${result.fuelStops} = ${formatDuration(result.fuelMinutesTotal)}`
                  : "None needed",
            ],
            [
              "Meal stops",
              failed
                ? "—"
                : result.mealStops > 0
                  ? `${result.mealStops} = ${formatDuration(result.mealMinutesTotal)}`
                  : "None",
            ],
            ["Total time off the road", failed ? "—" : formatDuration(result.stopMinutes)],
            [
              "Days on the road",
              failed
                ? "—"
                : result.days > 1
                  ? `${result.days} days · ${formatDuration(result.overnightMinutes)} halted overnight`
                  : "One day",
            ],
            ["Total elapsed", failed ? "—" : formatDuration(result.totalMinutes)],
            [
              "Arrival if you never stopped",
              failed
                ? "—"
                : `${result.arrivalNoStops.time} on ${prettyDate(result.arrivalNoStops.date)}`,
            ],
            [
              "Effective door-to-door speed",
              failed ? "—" : `${NUM.format(result.averageOverallSpeed)} km/h`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.overDailyLimit && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            This route needs more than {maxDaily} hours at the wheel, so the plan splits it across{" "}
            {result.days} days. Driving through the night after a full day is the single biggest
            fatigue risk on a long trip.
          </p>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Running order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Clock</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Distance</th>
                  <th scope="col" className="py-2 font-semibold">What happens</th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((row, index) => (
                  <tr
                    key={`${row.kind}-${index}-${row.atKm}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2.5 pr-3 font-mono font-semibold">
                      {row.time}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        {prettyDate(row.date)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">{row.atKm} km</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${KIND_STYLE[row.kind]}`}
                      >
                        {row.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning aid, not a safety guarantee. Stop sooner if you feel drowsy — microsleeps give
        almost no warning, and no schedule is worth driving tired. Commercial drivers are bound by the
        Motor Transport Workers Act, 1961 limits of eight hours a day and forty-eight a week, with a
        rest interval after five hours of continuous work.
      </p>
    </main>
  );
}
