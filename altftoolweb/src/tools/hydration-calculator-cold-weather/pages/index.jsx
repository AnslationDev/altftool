"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Snowflake } from "lucide-react";
import {
  ACTIVITY_LEVELS,
  MAX_HOURLY_INTAKE_ML,
  computeColdWeatherHydration,
} from "../lib";

const ML = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  weight: "70",
  temp: "-5",
  humidity: "60",
  hours: "3",
  activity: "moderate",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ml = (value) => (Number.isFinite(value) ? `${ML.format(value)} ml` : DASH);
const litres = (value) =>
  Number.isFinite(value) ? `${(value / 1000).toFixed(2)} L` : DASH;

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [humidity, setHumidity] = useState(DEFAULTS.humidity);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeColdWeatherHydration({
        weightKg: weight === "" ? NaN : Number(weight),
        tempC: temp === "" ? NaN : Number(temp),
        humidityPct: humidity === "" ? NaN : Number(humidity),
        hoursOutdoors: hours === "" ? NaN : Number(hours),
        activityId: activity,
      }),
    [weight, temp, humidity, hours, activity],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cold Weather Hydration Calculator",
      `Body weight: ${weight} kg`,
      `Conditions: ${temp} °C, ${humidity}% RH, ${hours} h outdoors`,
      `Activity: ${result.activityLabel}`,
      `Drink today: ${ML.format(result.drinkMl)} ml (${(result.drinkMl / 1000).toFixed(2)} L)`,
      `During the session: ${ML.format(result.duringSessionMl)} ml (${ML.format(result.hourlyDuringMl)} ml/hour)`,
      `Rest of the day: ${ML.format(result.restOfDayMl)} ml`,
      `Baseline need: ${ML.format(result.baselineMl)} ml`,
      `Extra breathing loss: ${ML.format(result.respiratoryExtraMl)} ml`,
      `Sweat under layers: ${ML.format(result.sweatMl)} ml`,
      `Cold-induced diuresis: ${ML.format(result.coldDiuresisMl)} ml`,
      `Sodium lost in sweat: ${ML.format(result.sodiumLossMg)} mg`,
    ].join("\n");
  }, [hasError, result, weight, temp, humidity, hours]);

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
    setTemp(DEFAULTS.temp);
    setHumidity(DEFAULTS.humidity);
    setHours(DEFAULTS.hours);
    setActivity(DEFAULTS.activity);
    setCopied(false);
  };

  const rows = [
    ["Baseline daily need (35 ml/kg)", hasError ? DASH : ml(result.baselineMl)],
    ["Extra water lost breathing cold air", hasError ? DASH : ml(result.respiratoryExtraMl)],
    ["Sweat produced under layers", hasError ? DASH : ml(result.sweatMl)],
    ["Cold-induced diuresis (extra urine)", hasError ? DASH : ml(result.coldDiuresisMl)],
    ["Total water needed (drink + food)", hasError ? DASH : ml(result.totalWaterMl)],
    ["Water you get from food", hasError ? DASH : ml(result.foodWaterMl)],
    ["Drink during the outdoor session", hasError ? DASH : ml(result.duringSessionMl)],
    ["Drink across the rest of the day", hasError ? DASH : ml(result.restOfDayMl)],
    ["Sodium lost in sweat", hasError ? DASH : `${ML.format(result.sodiumLossMg)} mg`],
    [
      "Outdoor air water content",
      hasError ? DASH : `${result.outdoorAbsoluteHumidity} g/m³`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Cold weather hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cold Weather Hydration Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cold air holds almost no water, so every breath you exhale carries moisture away and
          thirst signals fade. This estimates the fluid you actually lose to breathing, sweat under
          your layers and cold-induced diuresis.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cwh-weight">
              Body weight (kg)
            </label>
            <input
              id="cwh-weight"
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
            <label className={LABEL_CLASS} htmlFor="cwh-temp">
              Outdoor temperature (°C)
            </label>
            <input
              id="cwh-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-60"
              max="25"
              step="1"
              value={temp}
              onChange={(event) => setTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwh-humidity">
              Relative humidity (%)
            </label>
            <input
              id="cwh-humidity"
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
            <label className={LABEL_CLASS} htmlFor="cwh-hours">
              Hours outdoors today
            </label>
            <input
              id="cwh-hours"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cwh-activity">
              Activity level outdoors
            </label>
            <select
              id="cwh-activity"
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
              {hasError ? DASH : litres(result.drinkMl)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${ML.format(result.drinkMl)} ml of fluid — about ${result.glasses250} glasses of 250 ml`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cold weather hydration result"
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
            While you are outside, sip about{" "}
            <strong>{ML.format(result.hourlyDuringMl)} ml per hour</strong>.
            {result.hourlyCapReached
              ? ` That is the practical ceiling of ${ML.format(MAX_HOURLY_INTAKE_ML)} ml/hour — your losses are higher, so make up the rest before and after the session.`
              : ""}
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
            You are losing more than 1.5 L of sweat. Replace some of it with an electrolyte drink or
            eat salty food rather than drinking plain water only.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for healthy adults, not medical advice. Individual sweat rates vary
        widely, and altitude, illness, diuretic medication, kidney or heart conditions and pregnancy
        all change fluid needs — talk to a clinician if any of those apply to you.
      </p>
    </main>
  );
}
