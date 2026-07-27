"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ThermometerSnowflake } from "lucide-react";

import {
  COOLANT_TYPES,
  PRODUCT_FORMS,
  RECOMMENDED_MAX_PERCENT,
  RECOMMENDED_MIN_PERCENT,
  drainAndFillLitres,
  mixCoolant,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const TEMP = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  systemLitres: "6",
  targetPercent: "50",
  coolantType: "eg",
  productForm: "concentrate",
  capPressureBar: "1.1",
  currentPercent: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const PRESETS = [
  { percent: 33, label: "33% · mild, no frost" },
  { percent: 40, label: "40% · cold nights" },
  { percent: 50, label: "50% · standard" },
  { percent: 60, label: "60% · hard winter" },
];

export default function ToolHome() {
  const [systemLitres, setSystemLitres] = useState(DEFAULTS.systemLitres);
  const [targetPercent, setTargetPercent] = useState(DEFAULTS.targetPercent);
  const [coolantType, setCoolantType] = useState(DEFAULTS.coolantType);
  const [productForm, setProductForm] = useState(DEFAULTS.productForm);
  const [capPressureBar, setCapPressureBar] = useState(DEFAULTS.capPressureBar);
  const [currentPercent, setCurrentPercent] = useState(DEFAULTS.currentPercent);
  const [copied, setCopied] = useState(false);

  const mix = useMemo(
    () =>
      mixCoolant({
        systemLitres: toNumber(systemLitres),
        targetPercent: toNumber(targetPercent),
        coolantType,
        productForm,
        capPressureBar: toNumber(capPressureBar),
      }),
    [systemLitres, targetPercent, coolantType, productForm, capPressureBar],
  );

  const topUp = useMemo(
    () =>
      drainAndFillLitres({
        systemLitres: toNumber(systemLitres),
        currentPercent: toNumber(currentPercent),
        targetPercent: toNumber(targetPercent),
        productStrength: PRODUCT_FORMS.find((f) => f.id === productForm)?.strength ?? 100,
      }),
    [systemLitres, currentPercent, targetPercent, productForm],
  );

  const summary = useMemo(() => {
    if (mix.error) return "";
    return [
      "Coolant Mix Ratio Calculator",
      `System capacity: ${NUM.format(mix.systemLitres)} L`,
      `Mix: ${mix.ratioText}`,
      `${mix.productLabel}: ${NUM.format(mix.productLitres)} L`,
      `Distilled water: ${NUM.format(mix.waterLitres)} L`,
      `Freeze point: ${TEMP.format(mix.freezePointC)} °C`,
      `Boil point without cap: ${TEMP.format(mix.boilPointAtmC)} °C`,
      `Boil point with cap: ${TEMP.format(mix.boilPointWithCapC)} °C`,
    ].join("\n");
  }, [mix]);

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
    setSystemLitres(DEFAULTS.systemLitres);
    setTargetPercent(DEFAULTS.targetPercent);
    setCoolantType(DEFAULTS.coolantType);
    setProductForm(DEFAULTS.productForm);
    setCapPressureBar(DEFAULTS.capPressureBar);
    setCurrentPercent(DEFAULTS.currentPercent);
    setCopied(false);
  };

  const ok = !mix.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ThermometerSnowflake className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Coolant Mix Ratio Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your cooling-system capacity into exact litres of coolant and distilled water, and
          see the freeze point and the pressurised boil point the mixture will actually give you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cool-capacity">
              Cooling system capacity (litres)
            </label>
            <input
              id="cool-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="100"
              step="0.1"
              value={systemLitres}
              onChange={(event) => {
                setSystemLitres(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Most hatchbacks hold 4-6 L; check the owner&apos;s manual capacities table.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cool-percent">
              Target glycol concentration (% by volume)
            </label>
            <input
              id="cool-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={targetPercent}
              onChange={(event) => {
                setTargetPercent(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cool-type">
              Coolant chemistry
            </label>
            <select
              id="cool-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={coolantType}
              onChange={(event) => {
                setCoolantType(event.target.value);
                setCopied(false);
              }}
            >
              {COOLANT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cool-form">
              What is in the bottle
            </label>
            <select
              id="cool-form"
              className={`mt-2 ${INPUT_CLASS}`}
              value={productForm}
              onChange={(event) => {
                setProductForm(event.target.value);
                setCopied(false);
              }}
            >
              {PRODUCT_FORMS.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cool-cap">
              Radiator cap rating (bar)
            </label>
            <input
              id="cool-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="3"
              step="0.1"
              value={capPressureBar}
              onChange={(event) => {
                setCapPressureBar(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Stamped on the cap, usually 0.9 to 1.3 bar (13 to 19 psi).
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cool-current">
              Concentration already in the system (%)
            </label>
            <input
              id="cool-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={currentPercent}
              onChange={(event) => {
                setCurrentPercent(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Measure it with a refractometer or coolant hydrometer.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.percent}
              type="button"
              onClick={() => {
                setTargetPercent(String(preset.percent));
                setCopied(false);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {mix.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {mix.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Coolant to pour in
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM.format(mix.productLitres)} L` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `plus ${NUM.format(mix.waterLitres)} L of distilled water — ${mix.ratioText}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy coolant mix result"
              className={GHOST_BTN}
              disabled={!ok}
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
            ["Freeze point of the mix", ok ? `${TEMP.format(mix.freezePointC)} °C` : DASH],
            ["Boil point with no cap pressure", ok ? `${TEMP.format(mix.boilPointAtmC)} °C` : DASH],
            ["Extra headroom from the cap", ok ? `+${TEMP.format(mix.capRiseC)} °C` : DASH],
            [
              "Boil point with the cap on",
              ok ? `${TEMP.format(mix.boilPointWithCapC)} °C` : DASH,
            ],
            ["Product strength used", ok ? `${mix.productStrength}% glycol` : DASH],
            [
              "Inside the recommended band",
              ok
                ? mix.withinRecommended
                  ? `Yes (${RECOMMENDED_MIN_PERCENT}-${RECOMMENDED_MAX_PERCENT}%)`
                  : `No — outside ${RECOMMENDED_MIN_PERCENT}-${RECOMMENDED_MAX_PERCENT}%`
                : DASH,
            ],
            [
              "Single drain-and-fill to reach target",
              ok && !topUp.error ? `${NUM.format(topUp.drainLitres)} L` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && topUp.error ? (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{topUp.error}</p>
        ) : null}
        {ok && !topUp.error && topUp.note ? (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{topUp.note}</p>
        ) : null}
      </section>

      {ok && mix.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Worth knowing about this ratio</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {mix.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Always use the coolant specification the manufacturer lists, mix
        with distilled or deionised water rather than tap water, and never open a hot cooling
        system.
      </p>
    </main>
  );
}
