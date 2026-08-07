"use client";

import { useMemo, useState } from "react";
import { Check, CloudRain, Copy, RotateCcw } from "lucide-react";
import {
  ACTIVITY_LEVELS,
  MAX_HOURLY_INTAKE_ML,
  MAX_SWEAT_L_PER_HOUR,
  SAFE_WATER_L_PER_PERSON_DAY,
  computeMonsoonHydration,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  weight: "70",
  height: "170",
  temp: "30",
  humidity: "90",
  hours: "4",
  activity: "moderate",
  household: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAFE_WATER_TIPS = [
  "Bring water to a rolling boil for one full minute (three minutes above 2,000 m), then cool it covered — WHO guidance for household treatment.",
  "If you cannot boil, use chlorine tablets or drops at the dose on the pack and wait the stated contact time, usually 30 minutes.",
  "Store treated water in a narrow-necked covered container and pour rather than dipping a cup into it.",
  "Street juice, cut fruit and ice are the usual monsoon culprits — ice is rarely made from treated water.",
];

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [humidity, setHumidity] = useState(DEFAULTS.humidity);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [household, setHousehold] = useState(DEFAULTS.household);
  const [copied, setCopied] = useState(false);

  const num = (value) => (value === "" ? NaN : Number(value));

  const result = useMemo(
    () =>
      computeMonsoonHydration({
        weightKg: num(weight),
        heightCm: num(height),
        tempC: num(temp),
        humidityPct: num(humidity),
        hoursExposed: num(hours),
        activityId: activity,
        householdSize: num(household),
      }),
    [weight, height, temp, humidity, hours, activity, household],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Monsoon Hydration Planner (India)",
      `Conditions: ${temp} °C, ${humidity}% RH — heat index ${result.heatIndexC} °C (${result.heatLevel})`,
      `Activity: ${result.activityLabel} for ${hours} h`,
      `Drink today: ${NUM.format(result.drinkMl)} ml`,
      `During exposure: ${NUM.format(result.duringExposureMl)} ml (${NUM.format(result.hourlyDuringMl)} ml/hour)`,
      `Rest of the day: ${NUM.format(result.restOfDayMl)} ml`,
      `Estimated sweat loss: ${NUM.format(result.sweatMl)} ml (${result.sweatLPerHour} L/hour)`,
      `Sodium lost in sweat: ${NUM.format(result.sodiumLossMg)} mg`,
      `Safe water to treat for the household: ${result.householdSafeWaterL} L`,
    ].join("\n");
  }, [hasError, result, temp, humidity, hours]);

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
    setWeight(DEFAULTS.weight);
    setHeight(DEFAULTS.height);
    setTemp(DEFAULTS.temp);
    setHumidity(DEFAULTS.humidity);
    setHours(DEFAULTS.hours);
    setActivity(DEFAULTS.activity);
    setHousehold(DEFAULTS.household);
    setCopied(false);
  };

  const rows = [
    [
      "Heat index (feels like)",
      hasError
        ? DASH
        : `${result.heatIndexC} °C — ${result.heatLevel}${result.heatIndexOutOfRange ? " (beyond the published chart)" : ""}`,
    ],
    ["Estimated sweat rate", hasError ? DASH : `${result.sweatLPerHour} L per hour`],
    ["Sweat lost over the exposure", hasError ? DASH : `${NUM.format(result.sweatMl)} ml`],
    ["Sweating efficiency in this air", hasError ? DASH : `${result.efficiencyPct}%`],
    ["Skin wettedness", hasError ? DASH : `${result.wettednessPct}%`],
    ["Baseline daily need (35 ml/kg)", hasError ? DASH : `${NUM.format(result.baselineMl)} ml`],
    ["Water you get from food", hasError ? DASH : `${NUM.format(result.foodWaterMl)} ml`],
    ["Drink during exposure", hasError ? DASH : `${NUM.format(result.duringExposureMl)} ml`],
    ["Drink across the rest of the day", hasError ? DASH : `${NUM.format(result.restOfDayMl)} ml`],
    ["Sodium lost in sweat", hasError ? DASH : `${NUM.format(result.sodiumLossMg)} mg`],
    [
      "Safe drinking water to treat today",
      hasError ? DASH : `${result.householdSafeWaterL} L for the household`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CloudRain className="h-4 w-4" aria-hidden="true" />
          Monsoon hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Monsoon Hydration Planner India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Monsoon air is cooler than May but far wetter, so sweat drips instead of evaporating and
          your body has to make more of it. This works out the fluid you lose, what to drink hour by
          hour, and how much safe water to treat.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mh-weight">
              Body weight (kg)
            </label>
            <input
              id="mh-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mh-height">
              Height (cm)
            </label>
            <input
              id="mh-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="250"
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mh-temp">
              Air temperature (°C)
            </label>
            <input
              id="mh-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="15"
              max="50"
              step="1"
              value={temp}
              onChange={(event) => setTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mh-humidity">
              Relative humidity (%)
            </label>
            <input
              id="mh-humidity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={humidity}
              onChange={(event) => setHumidity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mh-hours">
              Hours in that environment
            </label>
            <input
              id="mh-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="16"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mh-household">
              People in the household
            </label>
            <input
              id="mh-household"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={household}
              onChange={(event) => setHousehold(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mh-activity">
              Activity level
            </label>
            <select
              id="mh-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError && (
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
              Drink today
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${(result.drinkMl / 1000).toFixed(2)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${NUM.format(result.drinkMl)} ml — about ${result.glasses250} glasses of 250 ml`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy monsoon hydration plan"
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

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            While you are out, sip about{" "}
            <strong>{NUM.format(result.hourlyDuringMl)} ml per hour</strong>.
            {result.intakeCapped
              ? ` Your losses exceed the ${NUM.format(MAX_HOURLY_INTAKE_ML)} ml/hour your stomach can safely absorb — shorten the exposure rather than drinking faster.`
              : ""}
          </p>
        )}

        {!hasError && result.sweatCapped && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            The heat-driven sweat rate this works out to is above the{" "}
            {MAX_SWEAT_L_PER_HOUR.toFixed(1)} L/hour a body can physiologically sweat, so the
            figure shown is capped at that ceiling — your actual fluid needs may be higher than
            this plan states.
          </p>
        )}

        {!hasError && result.uncompensableHeat && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            At this temperature and humidity your skin is fully wet and sweat can no longer shed
            enough heat. Fluid alone will not fix this — cut the exposure, move somewhere with
            moving air, and watch for cramps, nausea or confusion.
          </p>
        )}

        {!hasError && result.exceedsSafeDailyIntake && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            This works out to more than 10 litres a day, which is beyond what kidneys can safely
            clear. Treat it as a signal that the exposure itself is unsafe, not as a drinking target.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.needsElectrolytes && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Sweat loss is above 2 litres, so replace part of it with ORS, buttermilk, lemon-salt
            water or nimbu pani rather than plain water alone.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Safe water during the monsoon</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Baseline planning figure: {SAFE_WATER_L_PER_PERSON_DAY} litres of treated water per person
          per day for drinking and cooking, before sweat losses are added.
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          {SAFE_WATER_TIPS.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span aria-hidden="true" className="text-[var(--primary)]">
                •
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for healthy adults, not medical advice. Sweat rates vary a great deal
        between individuals and with acclimatisation. Anyone with kidney, liver or heart disease, or
        on diuretics, should follow the fluid limits their doctor has set instead.
      </p>
    </main>
  );
}
