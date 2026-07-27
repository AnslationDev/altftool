"use client";

import { useMemo, useState } from "react";
import { AirVent, Check, Copy, RotateCcw } from "lucide-react";
import {
  CAFFEINE_DAILY_SAFE_MG,
  CONTAINER_SIZES,
  DRINK_CAFFEINE_MG,
  computeOfficeHydration,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DRINK_FIELDS = [
  { key: "coffee", label: "Filter coffee (240 ml)" },
  { key: "espresso", label: "Espresso shots" },
  { key: "tea", label: "Tea (240 ml)" },
  { key: "cola", label: "Cola (330 ml)" },
  { key: "energy", label: "Energy drink (250 ml)" },
];

const DEFAULTS = {
  weight: "70",
  temp: "22",
  rh: "25",
  start: "09:00",
  end: "18:00",
  interval: "60",
  container: "bottle500",
  drinks: { coffee: "2", espresso: "0", tea: "1", cola: "0", energy: "0" },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [rh, setRh] = useState(DEFAULTS.rh);
  const [start, setStart] = useState(DEFAULTS.start);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [reminderGap, setReminderGap] = useState(DEFAULTS.interval);
  const [container, setContainer] = useState(DEFAULTS.container);
  const [drinks, setDrinks] = useState(DEFAULTS.drinks);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsedDrinks = {};
    for (const key of Object.keys(DRINK_CAFFEINE_MG)) {
      parsedDrinks[key] = drinks[key] === "" ? NaN : Number(drinks[key]);
    }
    return computeOfficeHydration({
      weightKg: weight === "" ? NaN : Number(weight),
      roomTempC: temp === "" ? NaN : Number(temp),
      roomRh: rh === "" ? NaN : Number(rh),
      startTime: start,
      endTime: end,
      reminderMins: reminderGap === "" ? NaN : Number(reminderGap),
      drinks: parsedDrinks,
      containerId: container,
    });
  }, [weight, temp, rh, start, end, reminderGap, container, drinks]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Air-Conditioned Office Hydration Planner",
      `Working day: ${start}-${end} (${result.workHours} h) at ${temp} °C / ${rh}% RH`,
      `Drink at the desk: ${NUM.format(result.officeShareMl)} ml`,
      `Drink outside office hours: ${NUM.format(result.outsideOfficeMl)} ml`,
      `Whole-day total: ${NUM.format(result.dailyDrinkMl)} ml`,
      `Reminder: ${NUM.format(result.perReminderMl)} ml every ${reminderGap} minutes`,
      `Refills of ${result.containerLabel}: ${result.refills}`,
      `Caffeine: ${NUM.format(result.caffeineMg)} mg (extra urine ${NUM.format(result.caffeineDiuresisMl)} ml)`,
      "",
      ...result.schedule.map((slot) => `${slot.time} — ${NUM.format(slot.amountMl)} ml`),
    ].join("\n");
  }, [hasError, result, start, end, temp, rh, reminderGap]);

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
    setRh(DEFAULTS.rh);
    setStart(DEFAULTS.start);
    setEnd(DEFAULTS.end);
    setReminderGap(DEFAULTS.interval);
    setContainer(DEFAULTS.container);
    setDrinks(DEFAULTS.drinks);
    setCopied(false);
  };

  const rows = [
    ["Whole-day drinking target", hasError ? DASH : `${NUM.format(result.dailyDrinkMl)} ml`],
    ["Of that, outside office hours", hasError ? DASH : `${NUM.format(result.outsideOfficeMl)} ml`],
    ["Baseline need (35 ml/kg)", hasError ? DASH : `${NUM.format(result.baselineMl)} ml`],
    ["Water you get from food", hasError ? DASH : `${NUM.format(result.foodWaterMl)} ml`],
    [
      "Extra loss from breathing dry air",
      hasError ? DASH : `${NUM.format(result.respiratoryExtraMl)} ml`,
    ],
    ["Extra loss through the skin", hasError ? DASH : `${NUM.format(result.tewlExtraMl)} ml`],
    ["Caffeine today", hasError ? DASH : `${NUM.format(result.caffeineMg)} mg`],
    ["Extra urine from caffeine", hasError ? DASH : `${NUM.format(result.caffeineDiuresisMl)} ml`],
    ["Office air water content", hasError ? DASH : `${result.officeAbsoluteHumidity} g/m³`],
    ["Refills needed", hasError ? DASH : `${result.refills} × ${result.containerLabel}`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AirVent className="h-4 w-4" aria-hidden="true" />
          Office hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Air-Conditioned Office Hydration Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Air conditioning strips moisture out of the room, and a desk job strips away the cues that
          normally make you drink. This turns your hours, room conditions and caffeine into a timed
          schedule you can actually follow.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aco-weight">
              Body weight (kg)
            </label>
            <input
              id="aco-weight"
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
            <label className={LABEL_CLASS} htmlFor="aco-container">
              Your usual container
            </label>
            <select
              id="aco-container"
              className={`mt-2 ${INPUT_CLASS}`}
              value={container}
              onChange={(event) => setContainer(event.target.value)}
            >
              {CONTAINER_SIZES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aco-start">
              Start of working day
            </label>
            <input
              id="aco-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aco-end">
              End of working day
            </label>
            <input
              id="aco-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aco-temp">
              Office temperature (°C)
            </label>
            <input
              id="aco-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="40"
              step="0.5"
              value={temp}
              onChange={(event) => setTemp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aco-rh">
              Office relative humidity (%)
            </label>
            <input
              id="aco-rh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={rh}
              onChange={(event) => setRh(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="aco-interval">
              Reminder every (minutes)
            </label>
            <input
              id="aco-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="240"
              step="15"
              value={reminderGap}
              onChange={(event) => setReminderGap(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Caffeinated drinks during the day
          </legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {DRINK_FIELDS.map((field) => (
              <div key={field.key}>
                <label className={LABEL_CLASS} htmlFor={`aco-drink-${field.key}`}>
                  {field.label}
                </label>
                <input
                  id={`aco-drink-${field.key}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="30"
                  step="1"
                  value={drinks[field.key]}
                  onChange={(event) =>
                    setDrinks((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </fieldset>
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
              Drink at your desk
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.officeShareMl)} ml`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : `${NUM.format(result.perReminderMl)} ml every ${reminderGap} minutes across ${result.workHours} hours`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy office hydration schedule"
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
            {result.humidityNote}
          </p>
        )}

        {!hasError && result.caffeineOverSafeLimit && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            That is above {CAFFEINE_DAILY_SAFE_MG} mg of caffeine, the daily amount EFSA considers
            safe for healthy non-pregnant adults. Consider swapping a serving for water.
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
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your reminder schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Drink
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Running total
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((slot, index) => (
                  <tr key={slot.time} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{slot.time}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(slot.amountMl)} ml</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(slot.amountMl * (index + 1))} ml
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {result.reminderCount} reminders totalling {NUM.format(result.scheduledTotalMl)} ml,
            rounded to 25 ml sips.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for healthy adults, not medical advice. Dry air adds far less fluid
        loss than most people assume — the real risk in an office is simply not drinking. If you are
        pregnant, take diuretics, or have a kidney, heart or bladder condition, follow the fluid
        targets your clinician has given you.
      </p>
    </main>
  );
}
