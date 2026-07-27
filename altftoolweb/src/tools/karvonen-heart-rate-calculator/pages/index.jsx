"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import { computeKarvonenZones, MAX_HR_FORMULAS } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = {
  age: "30",
  restingHr: "60",
  maxHr: "",
  formula: "tanaka",
  intensity: "70",
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

const DASH = "—";

const ZONE_PLACEHOLDERS = [
  { key: "z1", name: "Zone 1 - Recovery" },
  { key: "z2", name: "Zone 2 - Aerobic base" },
  { key: "z3", name: "Zone 3 - Tempo" },
  { key: "z4", name: "Zone 4 - Threshold" },
  { key: "z5", name: "Zone 5 - VO2 max" },
];

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [restingHr, setRestingHr] = useState(DEFAULTS.restingHr);
  const [maxHr, setMaxHr] = useState(DEFAULTS.maxHr);
  const [formula, setFormula] = useState(DEFAULTS.formula);
  const [intensity, setIntensity] = useState(DEFAULTS.intensity);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const ageValue = toNumber(age);
    const restingValue = toNumber(restingHr);
    const maxValue = toNumber(maxHr);
    const intensityValue = toNumber(intensity);

    if ([ageValue, restingValue, maxValue, intensityValue].some((v) => Number.isNaN(v))) {
      return { error: "Enter numbers only — check each field." };
    }

    return computeKarvonenZones({
      age: ageValue === null ? undefined : ageValue,
      restingHr: restingValue === null ? undefined : restingValue,
      formula,
      maxHr: maxValue,
      customIntensity: intensityValue === null ? 70 : intensityValue,
    });
  }, [age, restingHr, maxHr, formula, intensity]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Karvonen Heart Rate Zones",
      `Resting heart rate: ${NUM.format(result.restingHr)} bpm`,
      `Maximum heart rate: ${NUM.format(result.maxHr)} bpm (${
        result.usedMeasuredMax ? "measured" : result.formulaLabel
      })`,
      `Heart rate reserve: ${NUM.format(result.reserve)} bpm`,
      "",
      ...result.zones.map(
        (zone) =>
          `${zone.name} (${zone.lowPercent}-${zone.highPercent}% HRR): ${zone.lowBpm}-${zone.highBpm} bpm`,
      ),
    ];
    if (result.custom) {
      lines.push("", `${result.custom.percent}% HRR target: ${result.custom.bpm} bpm`);
    }
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
    setAge(DEFAULTS.age);
    setRestingHr(DEFAULTS.restingHr);
    setMaxHr(DEFAULTS.maxHr);
    setFormula(DEFAULTS.formula);
    setIntensity(DEFAULTS.intensity);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Heart rate reserve
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Karvonen Heart Rate Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Karvonen sets each training zone from your heart rate reserve — the gap between resting
          and maximum pulse — so your zones reflect your own fitness, not just your age.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="karvonen-resting">
              Resting heart rate (bpm)
            </label>
            <input
              id="karvonen-resting"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="130"
              step="1"
              value={restingHr}
              onChange={(event) => setRestingHr(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Measure it lying still, first thing in the morning.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="karvonen-age">
              Age (years)
            </label>
            <input
              id="karvonen-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Ignored if you enter a measured max below.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="karvonen-formula">
              Max HR formula
            </label>
            <select
              id="karvonen-formula"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
            >
              {MAX_HR_FORMULAS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="karvonen-max">
              Measured max heart rate (optional)
            </label>
            <input
              id="karvonen-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="80"
              max="230"
              step="1"
              placeholder="e.g. 191"
              value={maxHr}
              onChange={(event) => setMaxHr(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              From a lab test or hard field test — overrides the formula.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="karvonen-intensity">
              Custom intensity (% of heart rate reserve)
            </label>
            <input
              id="karvonen-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="1"
              value={intensity}
              onChange={(event) => setIntensity(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Aerobic base target (60-70% HRR)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : `${NUM.format(result.easyRange.lowBpm)}–${NUM.format(result.easyRange.highBpm)} bpm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your zones."
                : `Heart rate reserve ${NUM.format(result.reserve)} bpm · max ${NUM.format(result.maxHr)} bpm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy Karvonen heart rate zones"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Resting heart rate", hasError ? DASH : `${NUM.format(result.restingHr)} bpm`],
            ["Maximum heart rate", hasError ? DASH : `${NUM.format(result.maxHr)} bpm`],
            [
              "Heart rate reserve (max − rest)",
              hasError ? DASH : `${NUM.format(result.reserve)} bpm`,
            ],
            [
              "Custom intensity target",
              hasError || !result.custom
                ? DASH
                : `${NUM.format(result.custom.bpm)} bpm at ${result.custom.percent}% HRR`,
            ],
            ["Max HR source", hasError ? DASH : result.maxHrSource],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your five training zones</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Zone
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  % HRR
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Heart rate
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? ZONE_PLACEHOLDERS : result.zones).map((zone) => (
                <tr key={zone.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3">
                    <span className="font-semibold">{zone.name}</span>
                    {zone.focus ? (
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {zone.focus}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                    {hasError ? DASH : `${zone.lowPercent}–${zone.highPercent}%`}
                  </td>
                  <td className="py-2.5 text-right font-semibold whitespace-nowrap">
                    {hasError ? DASH : `${zone.lowBpm}–${zone.highBpm}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Age-predicted maximum heart rate carries a standard deviation of roughly
        10 bpm, so an individual&apos;s true zones can sit well above or below these numbers. If you
        take beta-blockers or other heart-rate-lowering medication, or have a cardiac condition, ask
        your doctor before training to these targets.
      </p>
    </main>
  );
}
