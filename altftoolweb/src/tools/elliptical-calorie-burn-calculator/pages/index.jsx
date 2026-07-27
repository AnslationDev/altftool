"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import { computeEllipticalCalories } from "../lib";

const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DASH = "—";

const DEFAULTS = {
  mode: "heartRate",
  weight: "72",
  weightUnit: "kg",
  minutes: "35",
  heartRate: "138",
  age: "34",
  sex: "female",
  watts: "120",
  resistance: "8",
  ramp: "10",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [heartRate, setHeartRate] = useState(DEFAULTS.heartRate);
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [watts, setWatts] = useState(DEFAULTS.watts);
  const [resistance, setResistance] = useState(DEFAULTS.resistance);
  const [ramp, setRamp] = useState(DEFAULTS.ramp);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = [weight, minutes, heartRate, age, watts, resistance, ramp].map(toNumber);
    if (values.some((v) => Number.isNaN(v))) {
      return { error: "Enter numbers only — check every field." };
    }
    const [w, min, hr, a, watt, res, rmp] = values;
    return computeEllipticalCalories({
      mode,
      weight: w === null ? undefined : w,
      weightUnit,
      minutes: min === null ? undefined : min,
      heartRate: hr,
      age: a,
      sex,
      watts: watt,
      resistanceLevel: res,
      rampDegrees: rmp,
    });
  }, [mode, weight, weightUnit, minutes, heartRate, age, sex, watts, resistance, ramp]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Elliptical Calorie Burn",
      `Method: ${result.method}`,
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Duration: ${NUM0.format(result.minutes)} minutes`,
    ];
    if (result.heartRate !== null) lines.push(`Average heart rate: ${NUM0.format(result.heartRate)} bpm`);
    if (result.powerW !== null) lines.push(`Average power: ${NUM0.format(result.powerW)} W`);
    if (result.resistanceLevel !== null) lines.push(`Resistance level: ${NUM0.format(result.resistanceLevel)}`);
    if (result.rampDegrees !== null) lines.push(`Ramp: ${NUM0.format(result.rampDegrees)}°`);
    lines.push(
      `Gross calories: ${NUM0.format(result.grossKcal)} kcal`,
      `Net calories (above rest): ${NUM0.format(result.netKcal)} kcal`,
      `Average intensity: ${NUM1.format(result.mets)} METs`,
    );
    return lines.join("\n");
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
    setMode(DEFAULTS.mode);
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setMinutes(DEFAULTS.minutes);
    setHeartRate(DEFAULTS.heartRate);
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setWatts(DEFAULTS.watts);
    setResistance(DEFAULTS.resistance);
    setRamp(DEFAULTS.ramp);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Cross-trainer
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Elliptical Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cross-trainers have no standard work-rate scale, so this calculator uses average heart
          rate with the Keytel equation — which already reflects your resistance, ramp and arm use —
          or console watts if your machine reports them.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>Which measurement do you have?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["heartRate", "Average heart rate", "Recommended — captures resistance and ramp automatically."],
              ["watts", "Console watts", "Only if your machine reports average power."],
            ].map(([key, title, hint]) => (
              <label
                key={key}
                htmlFor={`el-mode-${key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)] has-checked:border-[var(--primary)]"
              >
                <input
                  id={`el-mode-${key}`}
                  type="radio"
                  name="el-mode"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  value={key}
                  checked={mode === key}
                  onChange={(event) => setMode(event.target.value)}
                />
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="el-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="el-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={weightUnit}
                onChange={(event) => setWeightUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-minutes">
              Duration (minutes)
            </label>
            <input
              id="el-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="600"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>

          {mode === "heartRate" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="el-hr">
                  Average heart rate (bpm)
                </label>
                <input
                  id="el-hr"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="60"
                  max="220"
                  step="1"
                  value={heartRate}
                  onChange={(event) => setHeartRate(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="el-age">
                  Age (years)
                </label>
                <input
                  id="el-age"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="15"
                  max="90"
                  step="1"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="el-sex">
                  Sex (the equation has separate coefficients)
                </label>
                <select
                  id="el-sex"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={sex}
                  onChange={(event) => setSex(event.target.value)}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="el-watts">
                Average power (watts)
              </label>
              <input
                id="el-watts"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="800"
                step="1"
                value={watts}
                onChange={(event) => setWatts(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="el-resistance">
              Resistance level (logged only)
            </label>
            <input
              id="el-resistance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={resistance}
              onChange={(event) => setResistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-ramp">
              Ramp angle in degrees (logged only)
            </label>
            <input
              id="el-ramp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={ramp}
              onChange={(event) => setRamp(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Resistance and ramp are recorded with the session but are deliberately not used as
          multipliers — no manufacturer calibrates those dials to a shared scale, and their real
          effect already appears in your heart rate or wattage.
        </p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Calories burned (gross)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `${NUM1.format(result.kcalPerMin)} kcal per minute · ${result.method}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy elliptical calorie result"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.warnings.length > 0
          ? result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                {warning}
              </p>
            ))
          : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Net calories (above resting)", hasError ? DASH : `${NUM0.format(result.netKcal)} kcal`],
            [
              "Resting calories over the same time",
              hasError ? DASH : `${NUM0.format(result.restingKcal)} kcal`,
            ],
            ["Average intensity", hasError ? DASH : `${NUM1.format(result.mets)} METs`],
            [
              "Oxygen uptake",
              hasError || result.vo2 === null ? DASH : `${NUM1.format(result.vo2)} mL/kg/min`,
            ],
            [
              "Average heart rate",
              hasError || result.heartRate === null ? DASH : `${NUM0.format(result.heartRate)} bpm`,
            ],
            [
              "Console power",
              hasError || result.powerW === null ? DASH : `${NUM0.format(result.powerW)} W`,
            ],
            [
              "Session settings logged",
              hasError
                ? DASH
                : [
                    result.resistanceLevel === null
                      ? null
                      : `resistance ${NUM0.format(result.resistanceLevel)}`,
                    result.rampDegrees === null ? null : `ramp ${NUM0.format(result.rampDegrees)}°`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Heart-rate-based prediction assumes a normal cardiac response, so it
        is unreliable if you take beta-blockers, are dehydrated, are exercising in heat, or are doing
        short intervals rather than steady work. Grip sensors are also far less accurate than a chest
        strap. Speak to a doctor before building a strict energy deficit around any of these numbers.
      </p>
    </main>
  );
}
