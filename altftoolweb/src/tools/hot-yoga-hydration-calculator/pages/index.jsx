"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  CLASS_STYLES,
  DEHYDRATION_THRESHOLD_PCT,
  SIP_INTERVAL_MIN,
  computeHotYogaPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const ml = (value) => (Number.isFinite(value) ? `${NUM.format(value)} ml` : DASH);
const litres = (value) => (Number.isFinite(value) ? `${NUM2.format(value)} L` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);

const DEFAULTS = {
  mode: "estimate",
  bodyMassKg: "70",
  durationMin: "90",
  roomTempC: "35",
  humidityPct: "50",
  style: "standard",
  preMassKg: "70",
  postMassKg: "68.5",
  drankMl: "500",
  darkUrine: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [bodyMassKg, setBodyMassKg] = useState(DEFAULTS.bodyMassKg);
  const [durationMin, setDurationMin] = useState(DEFAULTS.durationMin);
  const [roomTempC, setRoomTempC] = useState(DEFAULTS.roomTempC);
  const [humidityPct, setHumidityPct] = useState(DEFAULTS.humidityPct);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [preMassKg, setPreMassKg] = useState(DEFAULTS.preMassKg);
  const [postMassKg, setPostMassKg] = useState(DEFAULTS.postMassKg);
  const [drankMl, setDrankMl] = useState(DEFAULTS.drankMl);
  const [darkUrine, setDarkUrine] = useState(DEFAULTS.darkUrine);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeHotYogaPlan({
        mode,
        bodyMassKg: toNumber(bodyMassKg),
        durationMin: toNumber(durationMin),
        roomTempC: toNumber(roomTempC),
        humidityPct: toNumber(humidityPct),
        style,
        preMassKg: toNumber(preMassKg),
        postMassKg: toNumber(postMassKg),
        drankMl: toNumber(drankMl),
        darkUrine,
      }),
    [
      mode,
      bodyMassKg,
      durationMin,
      roomTempC,
      humidityPct,
      style,
      preMassKg,
      postMassKg,
      drankMl,
      darkUrine,
    ],
  );

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result;

  const summary = useMemo(() => {
    if (!plan) return "";
    return [
      "Hot Yoga Hydration Plan",
      `Sweat rate (${plan.sweatSource}): ${NUM2.format(plan.sweatRateLPerH)} L/h`,
      `Sweat loss this class: ${ml(plan.sweatLossMl)}`,
      `Before class: ${ml(plan.totalBeforeMl)}`,
      `During class: ${ml(plan.duringMl)} (${plan.sipCount} sips of about ${ml(plan.sipMl)})`,
      `After class: ${ml(plan.afterMl)}`,
      `Deficit at end of class (before after-drink): ${pct(plan.deficitPct)} of body mass`,
      `Sodium lost in sweat: ${NUM.format(plan.sodiumMg)} mg`,
    ].join("\n");
  }, [plan]);

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
    setMode(DEFAULTS.mode);
    setBodyMassKg(DEFAULTS.bodyMassKg);
    setDurationMin(DEFAULTS.durationMin);
    setRoomTempC(DEFAULTS.roomTempC);
    setHumidityPct(DEFAULTS.humidityPct);
    setStyle(DEFAULTS.style);
    setPreMassKg(DEFAULTS.preMassKg);
    setPostMassKg(DEFAULTS.postMassKg);
    setDrankMl(DEFAULTS.drankMl);
    setDarkUrine(DEFAULTS.darkUrine);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hot Yoga Hydration Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A before, during and after fluid plan for a heated class — built from a measured weigh-in
          sweat rate, or modelled from your room, class style and body size.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">How should we get your sweat rate?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["estimate", "Estimate it from the room"],
              ["weighin", "I weighed before and after"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`mode-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`mode-${value}`}
                  type="radio"
                  name="sweat-mode"
                  className="accent-[var(--primary)]"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hy-duration">
              Class length (minutes)
            </label>
            <input
              id="hy-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="180"
              step="5"
              value={durationMin}
              onChange={(event) => setDurationMin(event.target.value)}
            />
          </div>

          {mode === "estimate" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="hy-mass">
                  Body weight (kg)
                </label>
                <input
                  id="hy-mass"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="25"
                  max="300"
                  step="0.5"
                  value={bodyMassKg}
                  onChange={(event) => setBodyMassKg(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="hy-room">
                  Room temperature (C)
                </label>
                <input
                  id="hy-room"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="20"
                  max="50"
                  step="0.5"
                  value={roomTempC}
                  onChange={(event) => setRoomTempC(event.target.value)}
                />
                <p className={HINT_CLASS}>Bikram rooms run at 40.6 C; most hot flow studios 32-38 C.</p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="hy-humidity">
                  Relative humidity (%)
                </label>
                <input
                  id="hy-humidity"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="1"
                  value={humidityPct}
                  onChange={(event) => setHumidityPct(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="hy-style">
                  Class style
                </label>
                <select
                  id="hy-style"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                >
                  {Object.entries(CLASS_STYLES).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="hy-pre">
                  Weight before class (kg)
                </label>
                <input
                  id="hy-pre"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="25"
                  max="300"
                  step="0.1"
                  value={preMassKg}
                  onChange={(event) => setPreMassKg(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="hy-post">
                  Weight after class (kg)
                </label>
                <input
                  id="hy-post"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="25"
                  max="300"
                  step="0.1"
                  value={postMassKg}
                  onChange={(event) => setPostMassKg(event.target.value)}
                />
                <p className={HINT_CLASS}>Towelled dry, same clothing (or none) as the first weigh-in.</p>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="hy-drank">
                  Fluid drunk during class (ml)
                </label>
                <input
                  id="hy-drank"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="50"
                  value={drankMl}
                  onChange={(event) => setDrankMl(event.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <label
          htmlFor="hy-dark"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-[var(--foreground)]"
        >
          <input
            id="hy-dark"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={darkUrine}
            onChange={(event) => setDarkUrine(event.target.checked)}
          />
          Add the 2-hour top-up (urine dark or none passed since waking)
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Carry into class
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan ? ml(plan.duringMl) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan
                ? `About ${ml(plan.sipMl)} every ${SIP_INTERVAL_MIN} minutes (${plan.sipCount} sips)`
                : "Fix the input above to see your plan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!plan}
              aria-label="Copy hot yoga hydration plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Before class (about 4 hours out)", plan ? ml(plan.preMl) : DASH],
            ["Extra top-up 2 hours out", plan ? ml(plan.topUpMl) : DASH],
            ["During class", plan ? ml(plan.duringMl) : DASH],
            ["After class (replacement drink)", plan ? ml(plan.afterMl) : DASH],
            ["Total for the class window", plan ? ml(plan.totalDayMl) : DASH],
            ["Sweat rate used", plan ? `${NUM2.format(plan.sweatRateLPerH)} L/h` : DASH],
            ["Sweat lost this class", plan ? litres(plan.sweatLossL) : DASH],
            ["Body-mass loss if you drink nothing", plan ? pct(plan.unreplacedLossPct) : DASH],
            ["Deficit at end of class (before after-drink)", plan ? pct(plan.deficitPct) : DASH],
            ["Sodium lost in sweat", plan ? `${NUM.format(plan.sodiumMg)} mg` : DASH],
            ["Same as table salt", plan ? `${NUM2.format(plan.saltEquivalentG)} g` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {plan ? (
          <div className="mt-5 space-y-2 text-sm">
            {plan.exceedsThreshold ? (
              <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 font-medium text-[var(--danger)]">
                Even drinking as much as is comfortable mid-class, you would finish more than{" "}
                {DEHYDRATION_THRESHOLD_PCT}% down on body mass. Start better hydrated, take a cooler
                spot in the room, or shorten the class.
              </p>
            ) : (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]">
                This plan keeps you inside the {DEHYDRATION_THRESHOLD_PCT}% body-mass loss threshold
                where thermoregulation and performance start to suffer.
              </p>
            )}
            {plan.needsElectrolytes ? (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]">
                You lose over a litre of sweat here, so replace sodium as well as water — through a
                salted meal or an electrolyte drink rather than plain water alone.
              </p>
            ) : null}
            {plan.clamped ? (
              <p className="rounded-md bg-[var(--warning-soft)] px-3 py-2 font-medium text-[var(--warning-text)]">
                Your inputs imply a sweat rate outside what is physiologically plausible for a single
                class, so it was capped to a realistic range before building this plan. Double-check
                your{" "}
                {plan.sweatSource === "measured"
                  ? "before/after weights, fluid drunk and class length"
                  : "room temperature, humidity, body weight and class style"}{" "}
                entries.
              </p>
            ) : null}
            {plan.sweatSource === "estimated" ? (
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                Sweat rate is modelled, not measured. Weigh yourself before and after one class and
                switch to weigh-in mode for a figure that is actually yours.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General wellbeing information, not medical advice. Drinking far more than you sweat can
        dilute blood sodium, which is dangerous. If you are pregnant, take diuretics, or have kidney,
        heart or blood-pressure conditions, agree a fluid plan with your doctor first.
      </p>
    </main>
  );
}
