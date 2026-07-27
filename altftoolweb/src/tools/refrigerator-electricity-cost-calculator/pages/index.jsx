"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Refrigerator, RotateCcw } from "lucide-react";

import {
  DEFAULT_AMBIENT_SENSITIVITY_PERCENT_PER_C,
  FRIDGE_TYPES,
  TEST_AMBIENT_C,
  USAGE_PATTERNS,
  computeFridgeCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const kwh = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} kWh` : DASH);

const DEFAULTS = {
  mode: "estimate",
  label: "250",
  type: "frost-free",
  litres: "250",
  stars: "3",
  ambient: String(TEST_AMBIENT_C),
  sensitivity: String(DEFAULT_AMBIENT_SENSITIVITY_PERCENT_PER_C),
  usage: "normal",
  tariff: "8",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [label, setLabel] = useState(DEFAULTS.label);
  const [type, setType] = useState(DEFAULTS.type);
  const [litres, setLitres] = useState(DEFAULTS.litres);
  const [stars, setStars] = useState(DEFAULTS.stars);
  const [ambient, setAmbient] = useState(DEFAULTS.ambient);
  const [sensitivity, setSensitivity] = useState(DEFAULTS.sensitivity);
  const [usage, setUsage] = useState(DEFAULTS.usage);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFridgeCost({
        mode,
        labelKwhPerYear: toNum(label),
        fridgeType: type,
        litres: toNum(litres),
        stars: toNum(stars),
        averageAmbientC: toNum(ambient),
        ambientSensitivityPercentPerC: toNum(sensitivity),
        usagePattern: usage,
        tariffPerKwh: toNum(tariff),
      }),
    [mode, label, type, litres, stars, ambient, sensitivity, usage, tariff],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Refrigerator Electricity Cost Calculator",
      `Rated annual consumption: ${kwh(result.ratedKwhPerYear)}${result.isEstimate ? " (estimated from litres and stars)" : " (from the BEE label)"}`,
      `Kitchen adjustment: ×${NUM2.format(result.ambientFactor)} for ${NUM0.format(toNum(ambient))} °C average`,
      `Usage adjustment: ×${NUM2.format(result.usageFactor)}`,
      `Working consumption: ${kwh(result.actualKwhPerYear)} a year`,
      `Average draw: ${NUM0.format(result.averageWatts)} W`,
      `Cost: ${money2(result.costPerDay)} a day, ${money(result.costPerMonth)} a month, ${money(result.costPerYear)} a year`,
      `A 5-star equivalent would cost ${money(result.fiveStarCostPerYear)} a year, saving ${money(result.upgradeSavingPerYear)}`,
      `CO2: ${NUM0.format(result.co2KgPerYear)} kg a year`,
    ].join("\n");
  }, [hasError, result, ambient]);

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
    setLabel(DEFAULTS.label);
    setType(DEFAULTS.type);
    setLitres(DEFAULTS.litres);
    setStars(DEFAULTS.stars);
    setAmbient(DEFAULTS.ambient);
    setSensitivity(DEFAULTS.sensitivity);
    setUsage(DEFAULTS.usage);
    setTariff(DEFAULTS.tariff);
    setCopied(false);
  };

  const labels = [
    "Rated annual consumption",
    "Kitchen temperature adjustment",
    "Usage adjustment",
    "Working consumption per year",
    "Units per month",
    "Units per day",
    "Average power draw",
    "Cost per day",
    "Cost per month",
    "A 5-star equivalent would cost",
    "Saving from upgrading",
    "CO2 per year",
  ];

  const values = hasError
    ? labels.map(() => DASH)
    : [
        kwh(result.ratedKwhPerYear),
        `×${NUM2.format(result.ambientFactor)}`,
        `×${NUM2.format(result.usageFactor)}`,
        kwh(result.actualKwhPerYear),
        kwh(result.kwhPerMonth),
        kwh(result.kwhPerDay),
        `${NUM0.format(result.averageWatts)} W`,
        money2(result.costPerDay),
        money(result.costPerMonth),
        `${money(result.fiveStarCostPerYear)} a year`,
        `${money(result.upgradeSavingPerYear)} a year`,
        `${NUM0.format(result.co2KgPerYear)} kg`,
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Refrigerator className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Refrigerator Electricity Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The fridge is the one appliance that never switches off. Use the annual units printed on
          the BEE label — or estimate them from litres and stars — and see what that costs a day, a
          month and a year in your kitchen.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Where does the consumption figure come from?
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["label", "I have the BEE label"],
              ["estimate", "Estimate from litres and stars"],
            ].map(([value, text]) => (
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
                {text}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "label" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="fr-label">
                Annual energy consumption on the label (kWh/year)
              </label>
              <input
                id="fr-label"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                step="5"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="fr-type">
                  Refrigerator type
                </label>
                <select
                  id="fr-type"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {FRIDGE_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="fr-litres">
                  Gross capacity (litres)
                </label>
                <input
                  id="fr-litres"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="1000"
                  step="5"
                  value={litres}
                  onChange={(e) => setLitres(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="fr-stars">
                  BEE star rating
                </label>
                <select
                  id="fr-stars"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={stars}
                  onChange={(e) => setStars(e.target.value)}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={String(value)}>
                      {value} star
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="fr-ambient">
              Average kitchen temperature (°C)
            </label>
            <input
              id="fr-ambient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="15"
              max="50"
              step="1"
              value={ambient}
              onChange={(e) => setAmbient(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-sensitivity">
              Extra consumption per °C above {TEST_AMBIENT_C} °C (%)
            </label>
            <input
              id="fr-sensitivity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.5"
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-usage">
              How the fridge is used
            </label>
            <select
              id="fr-usage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
            >
              {USAGE_PATTERNS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="fr-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Running cost per year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.costPerYear)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the running cost."
                : `${kwh(result.actualKwhPerYear)} a year, about ${NUM0.format(result.averageWatts)} W running continuously`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy refrigerator running cost result"
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

        {!hasError && result.isEstimate && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            The rated figure here is reconstructed from capacity and star rating. The kWh/year
            printed on your fridge's BEE label is the accurate number — switch to the label method
            once you have it.
          </p>
        )}

        {!hasError && result.ambientFactorClamped && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            The kitchen-temperature correction was capped so the estimate stays inside a sensible
            range.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {labels.map((text, index) => (
            <div key={text} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{text}</dt>
              <dd className="text-right font-semibold">{values[index]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Label figures come from a controlled laboratory test, so treat this as an estimate of real
        use. An ageing door gasket, a fridge pushed tight against a hot wall, or a defrost heater
        cycling often will all push consumption above the label. Slab tariffs, fixed charges and
        duty are billed separately.
      </p>
    </main>
  );
}
