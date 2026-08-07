"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Music4, RotateCcw } from "lucide-react";

import { LB_TO_KG, MIN_WEIGHT_KG, ZUMBA_FORMATS, computeZumbaBurn } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULTS = {
  weight: "65",
  weightUnit: "kg",
  minutes: "55",
  formatId: "fitness",
  useHeartRate: false,
  heartRate: "150",
  age: "30",
  sex: "female",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
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
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [useHeartRate, setUseHeartRate] = useState(DEFAULTS.useHeartRate);
  const [heartRate, setHeartRate] = useState(DEFAULTS.heartRate);
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeZumbaBurn({
        weight: toNumber(weight),
        weightUnit,
        minutes: toNumber(minutes),
        formatId,
        useHeartRate,
        heartRate: toNumber(heartRate),
        age: toNumber(age),
        sex,
      }),
    [weight, weightUnit, minutes, formatId, useHeartRate, heartRate, age, sex],
  );

  const hasError = Boolean(result.error);

  const weightMinAttr =
    weightUnit === "lb" ? String(Math.round(MIN_WEIGHT_KG / LB_TO_KG)) : String(MIN_WEIGHT_KG);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Zumba Calorie Burn",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Class: ${result.formatLabel} — ${minutes} min at ${result.met} MET`,
      `Calories burned: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Rate: ${NUM2.format(result.kcalPerMinute)} kcal/min (${NUM0.format(result.kcalPerHour)} kcal/hour)`,
    ];
    if (result.heartRateKcal !== null) {
      lines.push(
        `Heart-rate estimate (Keytel): ${NUM0.format(result.heartRateKcal)} kcal, about ${NUM1.format(result.heartRateMet)} MET`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, minutes]);

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
    setWeightUnit(DEFAULTS.weightUnit);
    setMinutes(DEFAULTS.minutes);
    setFormatId(DEFAULTS.formatId);
    setUseHeartRate(DEFAULTS.useHeartRate);
    setHeartRate(DEFAULTS.heartRate);
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setCopied(false);
  };

  const rows = [
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Burn rate", hasError ? DASH : `${show(result.kcalPerMinute, NUM2)} kcal/min`],
    ["Per full hour of this class", hasError ? DASH : `${show(result.kcalPerHour)} kcal`],
    ["Intensity used", hasError ? DASH : `${show(result.met, NUM1)} MET`],
    ["Resting calories inside the class", hasError ? DASH : `${show(result.restingKcal)} kcal`],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
    [
      "Heart-rate estimate (Keytel 2005)",
      hasError || result.heartRateKcal === null ? DASH : `${show(result.heartRateKcal)} kcal`,
    ],
    [
      "Intensity implied by heart rate",
      hasError || result.heartRateMet === null ? DASH : `${show(result.heartRateMet, NUM1)} MET`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music4 className="h-4 w-4" aria-hidden="true" />
          Dance calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Zumba Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the class format you actually took — Gold, Aqua, Toning, standard Fitness, Step or a
          STRONG-style HIIT class — and get the calorie cost for your weight. Add your average heart
          rate from a watch for a second, independent estimate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="zumba-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="zumba-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min={weightMinAttr}
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
            <label className={LABEL_CLASS} htmlFor="zumba-minutes">
              Class length (minutes)
            </label>
            <input
              id="zumba-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="300"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="zumba-format">
              Class format
            </label>
            <select
              id="zumba-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
            >
              {ZUMBA_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[30, 45, 55, 60].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMinutes(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} min
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-md border border-[var(--border)] p-4">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="zumba-usehr">
            <input
              id="zumba-usehr"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={useHeartRate}
              onChange={(event) => setUseHeartRate(event.target.checked)}
            />
            Also estimate from my average heart rate
          </label>

          {useHeartRate && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="zumba-hr">
                  Average heart rate (bpm)
                </label>
                <input
                  id="zumba-hr"
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
                <label className={LABEL_CLASS} htmlFor="zumba-age">
                  Age (years)
                </label>
                <input
                  id="zumba-age"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="12"
                  max="100"
                  step="1"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="zumba-sex">
                  Equation variant
                </label>
                <select
                  id="zumba-sex"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={sex}
                  onChange={(event) => setSex(event.target.value)}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>
          )}

          {useHeartRate && result.heartRateNote && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{result.heartRateNote}</p>
          )}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories burned in class
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${show(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see an estimate." : result.formatLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Zumba calorie result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.basis}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every format at your weight</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Format
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  MET
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  This class length
                </th>
              </tr>
            </thead>
            <tbody>
              {ZUMBA_FORMATS.map((item) => {
                const row = computeZumbaBurn({
                  weight: toNumber(weight),
                  weightUnit,
                  minutes: toNumber(minutes),
                  formatId: item.id,
                });
                return (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{item.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{item.met}</td>
                    <td className="py-2 text-right">
                      {row.error ? DASH : `${show(row.grossKcal)} kcal`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The two methods rarely agree exactly: MET values describe an average class, while the Keytel
        heart-rate equation is sensitive to fitness, caffeine, heat and medication. Treat both as
        estimates, not measurements. General information only — not medical or dietary advice.
      </p>
    </main>
  );
}
