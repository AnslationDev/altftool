"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Copy, RotateCcw, ThermometerSun } from "lucide-react";

import {
  CNS_SIGNS,
  COOLING_METHODS,
  COOLING_TARGET_C,
  GOLDEN_WINDOW_MINUTES,
  HEAT_SIGNS,
  HEAT_STROKE_CORE_C,
  RISK_FACTORS,
  assessHeatIllness,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm";

const NUM1 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  signs: ["confusion", "hot-skin", "nausea"],
  riskFactors: ["exertion", "no-acclimatisation"],
  coreTempC: "41.5",
  coolingMethod: "immersion",
  airTempC: "38",
  humidityPct: "60",
  minutesSinceOnset: "5",
};

export default function ToolHome() {
  const [signs, setSigns] = useState(DEFAULTS.signs);
  const [riskFactors, setRiskFactors] = useState(DEFAULTS.riskFactors);
  const [coreTempC, setCoreTempC] = useState(DEFAULTS.coreTempC);
  const [coolingMethod, setCoolingMethod] = useState(DEFAULTS.coolingMethod);
  const [airTempC, setAirTempC] = useState(DEFAULTS.airTempC);
  const [humidityPct, setHumidityPct] = useState(DEFAULTS.humidityPct);
  const [minutesSinceOnset, setMinutesSinceOnset] = useState(DEFAULTS.minutesSinceOnset);
  const [copied, setCopied] = useState(false);

  const toggle = (setter) => (id) => {
    setter((previous) => (previous.includes(id) ? previous.filter((v) => v !== id) : [...previous, id]));
  };
  const toggleSign = toggle(setSigns);
  const toggleRisk = toggle(setRiskFactors);

  const result = useMemo(
    () =>
      assessHeatIllness({
        signs,
        riskFactors,
        coreTempC,
        coolingMethod,
        airTempC,
        humidityPct,
        minutesSinceOnset,
      }),
    [signs, riskFactors, coreTempC, coolingMethod, airTempC, humidityPct, minutesSinceOnset],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Heat illness response",
      `Assessment: ${result.levelLabel}`,
      result.coreTempC !== null ? `Core temperature: ${result.coreTempC} °C` : "Core temperature: not measured",
      `Cooling method: ${result.method.label}`,
      result.estimatedCoolingMinutes !== null
        ? `Estimated cooling time to ${COOLING_TARGET_C} °C: ${Math.round(result.estimatedCoolingMinutes)} min`
        : "Estimated cooling time: unknown without a core temperature",
      `Heat index: ${result.conditions.fahrenheit.toFixed(0)} °F / ${result.conditions.celsius.toFixed(0)} °C (${result.conditions.band})`,
      "",
      ...result.steps.map((step) => `${step.order}. ${step.title} — ${step.detail}`),
    ].join("\n");
  }, [ok, result]);

  const copyPlan = async () => {
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
    setSigns(DEFAULTS.signs);
    setRiskFactors(DEFAULTS.riskFactors);
    setCoreTempC(DEFAULTS.coreTempC);
    setCoolingMethod(DEFAULTS.coolingMethod);
    setAirTempC(DEFAULTS.airTempC);
    setHumidityPct(DEFAULTS.humidityPct);
    setMinutesSinceOnset(DEFAULTS.minutesSinceOnset);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ThermometerSun className="h-4 w-4" aria-hidden="true" />
          First aid
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Heat Stroke Response Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what you can see, add a core temperature if you have one, and get the cooling steps in
          order with an estimate of how long cooling will take. If anyone is confused or collapsed in
          the heat, call emergency services before you read any further.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Nervous-system signs (any one is an emergency)</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CNS_SIGNS.map((sign) => (
            <label key={sign.id} className={CHECK_CLASS} htmlFor={`hs-${sign.id}`}>
              <input
                id={`hs-${sign.id}`}
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={signs.includes(sign.id)}
                onChange={() => toggleSign(sign.id)}
              />
              <span>{sign.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Other signs</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {HEAT_SIGNS.map((sign) => (
            <label key={sign.id} className={CHECK_CLASS} htmlFor={`hs-${sign.id}`}>
              <input
                id={`hs-${sign.id}`}
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={signs.includes(sign.id)}
                onChange={() => toggleSign(sign.id)}
              />
              <span>{sign.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Measurements and conditions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hs-core">
              Core temperature (°C, rectal probe only)
            </label>
            <input
              id="hs-core"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="30"
              max="46"
              placeholder="Leave blank if not measured"
              className={`mt-2 ${INPUT_CLASS}`}
              value={coreTempC}
              onChange={(event) => setCoreTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hs-elapsed">
              Minutes since collapse or first sign
            </label>
            <input
              id="hs-elapsed"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              max="1440"
              className={`mt-2 ${INPUT_CLASS}`}
              value={minutesSinceOnset}
              onChange={(event) => setMinutesSinceOnset(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hs-air">
              Air temperature (°C)
            </label>
            <input
              id="hs-air"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="-50"
              max="60"
              className={`mt-2 ${INPUT_CLASS}`}
              value={airTempC}
              onChange={(event) => setAirTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hs-humidity">
              Relative humidity (%)
            </label>
            <input
              id="hs-humidity"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              max="100"
              className={`mt-2 ${INPUT_CLASS}`}
              value={humidityPct}
              onChange={(event) => setHumidityPct(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hs-method">
              Cooling method available right now
            </label>
            <select
              id="hs-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={coolingMethod}
              onChange={(event) => setCoolingMethod(event.target.value)}
            >
              {COOLING_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label} — {method.rateRange}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Risk factors</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {RISK_FACTORS.map((factor) => (
            <label key={factor.id} className={CHECK_CLASS} htmlFor={`hs-risk-${factor.id}`}>
              <input
                id={`hs-risk-${factor.id}`}
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={riskFactors.includes(factor.id)}
                onChange={() => toggleRisk(factor.id)}
              />
              <span>{factor.label}</span>
            </label>
          ))}
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cooling time needed to reach {COOLING_TARGET_C} °C
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok && result.estimatedCoolingMinutes !== null
                ? `${NUM0.format(Math.round(result.estimatedCoolingMinutes))} min`
                : DASH}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${ok && result.emergency ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}
            >
              {ok ? result.levelLabel : "Fix the error above to get an assessment."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPlan}
              disabled={!ok}
              aria-label="Copy the heat illness response plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && <p className="mt-3 text-sm text-[var(--muted-foreground)]">{result.levelReason}</p>}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Core temperature", ok && result.coreTempC !== null ? `${NUM1.format(result.coreTempC)} °C / ${NUM1.format(result.coreTempF)} °F` : DASH],
            ["Heat-stroke threshold", `${HEAT_STROKE_CORE_C} °C core plus altered mental state`],
            ["Nervous-system signs ticked", ok ? result.cnsSignCount : DASH],
            ["Other signs ticked", ok ? result.supportingSignCount : DASH],
            ["Risk factors present", ok ? result.riskFactorCount : DASH],
            ["Cooling rate used", ok ? `${result.method.ratePerMinuteC} °C/min (${result.method.rateRange})` : DASH],
            [
              "Same casualty by cold-water immersion",
              ok && result.immersionMinutes !== null ? `${NUM0.format(Math.round(result.immersionMinutes))} min` : DASH,
            ],
            [
              `Finishes inside the ${GOLDEN_WINDOW_MINUTES}-minute window`,
              ok && result.withinGoldenWindow !== null ? (result.withinGoldenWindow ? "Yes" : "No") : DASH,
            ],
            [
              "Heat index for these conditions",
              ok ? `${NUM0.format(result.conditions.fahrenheit)} °F / ${NUM0.format(result.conditions.celsius)} °C` : DASH,
            ],
            ["Heat index band", ok ? result.conditions.band : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && <p className="mt-3 text-xs text-[var(--muted-foreground)]">{result.conditions.bandNote}</p>}
      </section>

      {ok && result.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.warnings.map((warning) => (
            <li
              key={warning}
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {ok && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Do this, in this order</h2>
          <ol className="mt-3 space-y-3">
            {result.steps.map((step) => (
              <li key={step.order} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)]">
                  {step.order}
                </span>
                <span className="text-sm">
                  <span className="block font-semibold">{step.title}</span>
                  <span className="block text-[var(--muted-foreground)]">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{result.method.note}</p>
        </section>
      )}

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Ban className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
          Never do these
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          {(ok ? result.neverDo : []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not a diagnosis. Heat stroke is a medical emergency — call your local
        emergency number, start cooling immediately, and follow the instructions of the dispatcher
        and attending clinicians over anything on this page.
      </p>
    </main>
  );
}
