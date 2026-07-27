"use client";

import { useMemo, useState } from "react";
import { Check, Copy, DropletOff, RotateCcw } from "lucide-react";

import { BUCKET_LITRES, DRIP_PRESETS, computeTapLoss } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DASH = "—";

const DEFAULTS = {
  mode: "drips",
  drips: "30",
  seconds: "60",
  taps: "1",
  waterRate: "25",
  hot: false,
  deltaT: "20",
  efficiency: "90",
  tariff: "8",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [drips, setDrips] = useState(DEFAULTS.drips);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [taps, setTaps] = useState(DEFAULTS.taps);
  const [waterRate, setWaterRate] = useState(DEFAULTS.waterRate);
  const [hot, setHot] = useState(DEFAULTS.hot);
  const [deltaT, setDeltaT] = useState(DEFAULTS.deltaT);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTapLoss({
        mode,
        dripsPerMinute: toNumber(drips),
        secondsPerLitre: toNumber(seconds),
        tapCount: toNumber(taps),
        waterRatePerKl: toNumber(waterRate),
        isHotWater: hot,
        deltaT: toNumber(deltaT),
        heaterEfficiency: toNumber(efficiency),
        tariffPerKwh: toNumber(tariff),
      }),
    [mode, drips, seconds, taps, waterRate, hot, deltaT, efficiency, tariff],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Dripping Tap Water Loss",
      mode === "drips" ? `${drips} drips per minute` : `1 litre every ${seconds} seconds`,
      `Leaking taps: ${taps}`,
      `Water lost: ${NUM1.format(result.litresPerDay)} L/day, ${NUM.format(result.litresPerMonth)} L/month, ${NUM.format(result.litresPerYear)} L/year`,
      `That is ${NUM.format(result.bucketsPerYear)} buckets of ${BUCKET_LITRES} L a year`,
      `Water cost: ${INR.format(result.waterCostPerYear)} a year`,
    ];
    if (hot) {
      lines.push(
        `Geyser energy wasted: ${NUM1.format(result.energyKwhPerYear)} kWh a year (${INR.format(result.energyCostPerYear)})`,
      );
    }
    lines.push(`Total: ${INR.format(result.totalCostPerYear)} a year`);
    return lines.join("\n");
  }, [hasError, result, mode, drips, seconds, taps, hot]);

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
    setDrips(DEFAULTS.drips);
    setSeconds(DEFAULTS.seconds);
    setTaps(DEFAULTS.taps);
    setWaterRate(DEFAULTS.waterRate);
    setHot(DEFAULTS.hot);
    setDeltaT(DEFAULTS.deltaT);
    setEfficiency(DEFAULTS.efficiency);
    setTariff(DEFAULTS.tariff);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Leak rate per tap", DASH],
        ["Water lost per day", DASH],
        ["Water lost per month", DASH],
        ["Water lost per year", DASH],
        [`Buckets of ${BUCKET_LITRES} L per year`, DASH],
        ["Water cost per month", DASH],
        ["Water cost per year", DASH],
        ["Geyser units wasted per year", DASH],
        ["Total cost per year", DASH],
      ]
    : [
        ["Leak rate per tap", `${NUM3.format(result.flowLpm)} L/min`],
        ["Water lost per day", `${NUM1.format(result.litresPerDay)} L`],
        ["Water lost per month", `${NUM.format(result.litresPerMonth)} L`],
        ["Water lost per year", `${NUM.format(result.litresPerYear)} L`],
        [`Buckets of ${BUCKET_LITRES} L per year`, NUM.format(result.bucketsPerYear)],
        ["Water cost per month", INR2.format(result.waterCostPerMonth)],
        ["Water cost per year", INR.format(result.waterCostPerYear)],
        [
          "Geyser units wasted per year",
          hot ? `${NUM1.format(result.energyKwhPerYear)} kWh · ${INR.format(result.energyCostPerYear)}` : "Cold tap — none",
        ],
        ["Total cost per year", INR.format(result.totalCostPerYear)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <DropletOff className="h-4 w-4" aria-hidden="true" />
          Leak audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dripping Tap Water Loss Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count the drips for one minute, or time how long the leak takes to fill a litre, and see
          exactly how much water and money the tap loses every day, month and year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            How did you measure the leak?
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["drips", "Counted drips per minute"],
              ["timed", "Timed a 1 litre fill"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "drips" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="drip-count">
                Drips per minute
              </label>
              <input
                id="drip-count"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={drips}
                onChange={(event) => setDrips(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="drip-seconds">
                Seconds to fill 1 litre
              </label>
              <input
                id="drip-seconds"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="drip-taps">
              Number of leaking taps
            </label>
            <input
              id="drip-taps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={taps}
              onChange={(event) => setTaps(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="drip-water-rate">
              Water cost (₹ per kilolitre)
            </label>
            <input
              id="drip-water-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={waterRate}
              onChange={(event) => setWaterRate(event.target.value)}
            />
          </div>
        </div>

        {mode === "drips" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {DRIP_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDrips(String(preset.dpm))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset.label} ({preset.dpm}/min)
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-md border border-[var(--border)] p-4">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="drip-hot">
            <input
              id="drip-hot"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25"
              checked={hot}
              onChange={(event) => setHot(event.target.checked)}
            />
            This is a hot water tap
          </label>

          {hot && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="drip-delta">
                  Temperature rise from the geyser (°C)
                </label>
                <input
                  id="drip-delta"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="80"
                  step="1"
                  value={deltaT}
                  onChange={(event) => setDeltaT(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="drip-efficiency">
                  Heater efficiency (%)
                </label>
                <input
                  id="drip-efficiency"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="100"
                  step="1"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="drip-tariff">
                  Electricity tariff (₹ per unit)
                </label>
                <input
                  id="drip-tariff"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={tariff}
                  onChange={(event) => setTariff(event.target.value)}
                />
              </div>
            </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Water lost per year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.litresPerYear)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the loss."
                : `Costing ${INR.format(result.totalCostPerYear)} a year at your rates`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy dripping tap loss result"
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

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on the USGS figure of 0.25 mL per drip. Drop size varies with
        pressure and spout shape, so the timed one-litre measurement is the more accurate of the two
        methods when the leak is fast enough to use it.
      </p>
    </main>
  );
}
