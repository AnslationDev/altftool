"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { buildHydrationPlan, formatVolume, WEATHER_BANDS } from "../lib";

const DEFAULTS = {
  ageYears: "10",
  sex: "female",
  weather: "warm",
  activityMinutes: "60",
  bottleMl: "500",
  wakeTime: "07:00",
  schoolStart: "08:30",
  schoolEnd: "15:00",
  bedTime: "21:00",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const plan = useMemo(
    () =>
      buildHydrationPlan({
        ageYears: toNumber(form.ageYears),
        sex: form.sex,
        weather: form.weather,
        activityMinutes: toNumber(form.activityMinutes),
        bottleMl: toNumber(form.bottleMl),
        wakeTime: form.wakeTime,
        schoolStart: form.schoolStart,
        schoolEnd: form.schoolEnd,
        bedTime: form.bedTime,
      }),
    [form],
  );

  const hasError = Boolean(plan.error);

  const rows = hasError
    ? [
        ["Total water for this age (EFSA AI)", DASH],
        ["Usually supplied by food", DASH],
        ["Baseline from drinks", DASH],
        ["Extra for activity", DASH],
        ["Needed during school hours", DASH],
        ["Bottle refills at school", DASH],
        ["Roughly, in 200 ml glasses", DASH],
      ]
    : [
        [`Total water for this age (EFSA AI, ${plan.ageBandLabel})`, formatVolume(plan.totalWaterMl)],
        ["Usually supplied by food", formatVolume(plan.fromFoodMl)],
        ["Baseline from drinks", formatVolume(plan.drinksBaselineMl)],
        [
          "Extra for activity",
          plan.activityMl > 0
            ? `${formatVolume(plan.activityMl)} (${plan.activityBlocks} × ${plan.perBlockMl} ml)`
            : "None",
        ],
        ["Needed during school hours", formatVolume(plan.schoolHoursMl)],
        ["Bottle refills at school", `${plan.bottleRefills} × ${formatVolume(plan.bottleMl)}`],
        ["Roughly, in 200 ml glasses", `${plan.glassesOf200Ml} glasses`],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Kids Hydration Reminder",
      `Age ${plan.age} · ${plan.weather.label}`,
      `Drinks target: ${formatVolume(plan.drinksTargetMl)} (baseline ${formatVolume(plan.drinksBaselineMl)} + activity ${formatVolume(plan.activityMl)})`,
      `Bottle: ${plan.bottleRefills} × ${formatVolume(plan.bottleMl)} during school hours`,
      "",
      ...plan.schedule.map((slot) => `${slot.time}  ${slot.label} — ${formatVolume(slot.ml)}`),
    ].join("\n");
  }, [hasError, plan]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kids Hydration Reminder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your child&apos;s age, the weather and their sport into a timed school-day drinking
          schedule, with the number of bottle refills to pack.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About your child</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-age">
              Age (years)
            </label>
            <input
              id="khr-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="17"
              step="1"
              value={form.ageYears}
              onChange={setField("ageYears")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-sex">
              Reference values (EFSA differs from age 9)
            </label>
            <select
              id="khr-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={setField("sex")}
            >
              <option value="female">Girl</option>
              <option value="male">Boy</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-weather">
              Weather today
            </label>
            <select
              id="khr-weather"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.weather}
              onChange={setField("weather")}
            >
              {WEATHER_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-activity">
              Active play or sport (minutes)
            </label>
            <input
              id="khr-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="480"
              step="5"
              value={form.activityMinutes}
              onChange={setField("activityMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-bottle">
              Water bottle size (ml)
            </label>
            <input
              id="khr-bottle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="2000"
              step="50"
              value={form.bottleMl}
              onChange={setField("bottleMl")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The school day</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-wake">
              Wake time
            </label>
            <input
              id="khr-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.wakeTime}
              onChange={setField("wakeTime")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-start">
              School starts
            </label>
            <input
              id="khr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.schoolStart}
              onChange={setField("schoolStart")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-end">
              School ends
            </label>
            <input
              id="khr-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.schoolEnd}
              onChange={setField("schoolEnd")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="khr-bed">
              Bedtime
            </label>
            <input
              id="khr-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.bedTime}
              onChange={setField("bedTime")}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Drinks target for the day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatVolume(plan.drinksTargetMl)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the schedule."
                : `${formatVolume(plan.drinksBaselineMl)} baseline plus ${formatVolume(plan.activityMl)} for activity`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the hydration schedule"
              className={GHOST_BTN}
              disabled={hasError}
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
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Reminder schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Reminder
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Drink
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((slot) => (
                  <tr key={slot.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{slot.time}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{slot.label}</td>
                    <td
                      className={`py-2 text-right font-semibold ${slot.isActivity ? "text-[var(--primary)]" : ""}`}
                    >
                      {formatVolume(slot.ml)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3 font-semibold" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2 text-right font-semibold">{formatVolume(plan.scheduledMl)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. These are population reference values, not a prescription — a child who is
        unwell, vomiting, feverish, or who has a kidney, heart or metabolic condition may need a very
        different amount. Ask your doctor, and never force large volumes in a short time.
      </p>
    </main>
  );
}
