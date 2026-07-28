"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Copy, RotateCcw, ThermometerSnowflake } from "lucide-react";

import {
  FIELD_STATES,
  HYPOTHERMIA_THRESHOLD_C,
  REWARMING_METHODS,
  REWARMING_TARGET_C,
  SWISS_STAGES,
  assessHypothermia,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM1 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  fieldState: "alert-shivering",
  coreTempC: "33.5",
  rewarmingMethod: "shelter",
  isWet: true,
  airTempC: "-5",
  windKph: "25",
};

const formatHours = (hours) => {
  if (hours === null || !Number.isFinite(hours)) return DASH;
  if (hours === 0) return "already above target";
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (whole === 0) return `${minutes} min`;
  return `${whole} h ${String(minutes).padStart(2, "0")} min`;
};

export default function ToolHome() {
  const [fieldState, setFieldState] = useState(DEFAULTS.fieldState);
  const [coreTempC, setCoreTempC] = useState(DEFAULTS.coreTempC);
  const [rewarmingMethod, setRewarmingMethod] = useState(DEFAULTS.rewarmingMethod);
  const [isWet, setIsWet] = useState(DEFAULTS.isWet);
  const [airTempC, setAirTempC] = useState(DEFAULTS.airTempC);
  const [windKph, setWindKph] = useState(DEFAULTS.windKph);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessHypothermia({ fieldState, coreTempC, rewarmingMethod, isWet, airTempC, windKph }),
    [fieldState, coreTempC, rewarmingMethod, isWet, airTempC, windKph],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Hypothermia response",
      `Stage: ${result.stageLabel} (${result.stageTempText})`,
      `Staged from: ${result.stagedFrom}`,
      result.coreTempC !== null ? `Core temperature: ${result.coreTempC} °C` : "Core temperature: not measured",
      `Rewarming: ${result.method.label} at ${result.effectiveRatePerHourC} °C/h`,
      result.rewarmingHours !== null
        ? `Estimated time to ${REWARMING_TARGET_C} °C: ${formatHours(result.rewarmingHours)}`
        : "Estimated time: unknown without a core temperature",
      result.windChill.applicable
        ? `Wind chill: ${result.windChill.celsius.toFixed(0)} °C — ${result.frostbite.label}`
        : `Wind chill not applicable — ${result.windChill.reason}`,
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
    setFieldState(DEFAULTS.fieldState);
    setCoreTempC(DEFAULTS.coreTempC);
    setRewarmingMethod(DEFAULTS.rewarmingMethod);
    setIsWet(DEFAULTS.isWet);
    setAirTempC(DEFAULTS.airTempC);
    setWindKph(DEFAULTS.windKph);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ThermometerSnowflake className="h-4 w-4" aria-hidden="true" />
          First aid
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hypothermia Response Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stage the casualty on the Swiss HT I–IV scale from what you can actually see, get the
          rewarming steps in order, and see how long each method needs. Hypothermia starts below{" "}
          {HYPOTHERMIA_THRESHOLD_C} °C core.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What you can see</h2>
        <div className="mt-3 grid gap-2">
          {FIELD_STATES.map((state) => (
            <label
              key={state.id}
              htmlFor={`hy-state-${state.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <input
                id={`hy-state-${state.id}`}
                type="radio"
                name="hy-field-state"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={fieldState === state.id}
                onChange={() => setFieldState(state.id)}
              />
              <span>{state.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Measurements and conditions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hy-core">
              Core temperature (°C, if measured)
            </label>
            <input
              id="hy-core"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="13"
              max="37.5"
              placeholder="Leave blank if unknown"
              className={`mt-2 ${INPUT_CLASS}`}
              value={coreTempC}
              onChange={(event) => setCoreTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hy-air">
              Air temperature (°C)
            </label>
            <input
              id="hy-air"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="-80"
              max="50"
              className={`mt-2 ${INPUT_CLASS}`}
              value={airTempC}
              onChange={(event) => setAirTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hy-wind">
              Wind speed (km/h)
            </label>
            <input
              id="hy-wind"
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              max="300"
              className={`mt-2 ${INPUT_CLASS}`}
              value={windKph}
              onChange={(event) => setWindKph(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="hy-wet"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold"
            >
              <input
                id="hy-wet"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={isWet}
                onChange={(event) => setIsWet(event.target.checked)}
              />
              Clothing is still wet
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hy-method">
              Rewarming available right now
            </label>
            <select
              id="hy-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rewarmingMethod}
              onChange={(event) => setRewarmingMethod(event.target.value)}
            >
              {REWARMING_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label} — {method.rateRange}
                </option>
              ))}
            </select>
          </div>
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
              Rewarming time to {REWARMING_TARGET_C} °C
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatHours(result.rewarmingHours) : DASH}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${ok && result.severity >= 2 ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}
            >
              {ok ? result.stageLabel : "Fix the error above to get a staging."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPlan}
              disabled={!ok}
              aria-label="Copy the hypothermia response plan"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Stage signs", ok ? result.stageSigns : DASH],
            ["Stage temperature band", ok ? result.stageTempText : DASH],
            ["Staged from", ok ? result.stagedFrom : DASH],
            ["Core temperature entered", ok && result.coreTempC !== null ? `${NUM1.format(result.coreTempC)} °C` : DASH],
            ["Method rate", ok ? `${result.method.ratePerHourC} °C/h (${result.method.rateRange})` : DASH],
            ["Effective rate used", ok ? `${NUM1.format(result.effectiveRatePerHourC)} °C/h` : DASH],
            ["Wet-clothing penalty applied", ok ? (result.isWet ? "Yes — rate halved" : "No") : DASH],
            ["Same casualty in hospital", ok ? formatHours(result.hospitalHours) : DASH],
            [
              "Wind chill",
              ok ? (result.windChill.applicable ? `${result.windChill.celsius.toFixed(0)} °C` : "Not applicable") : DASH,
            ],
            ["Frostbite risk outdoors", ok ? result.frostbite.label : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {result.windChill.applicable ? result.frostbite.detail : result.windChill.reason}
          </p>
        )}
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
        </section>
      )}

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The Swiss staging system</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Stage</th>
                <th scope="col" className="py-2 pr-3 font-semibold">What you see</th>
                <th scope="col" className="py-2 font-semibold">Core temperature</th>
              </tr>
            </thead>
            <tbody>
              {SWISS_STAGES.map((stage) => (
                <tr
                  key={stage.id}
                  className={`border-b border-[var(--border)] last:border-0 ${ok && result.stageId === stage.id ? "font-semibold text-[var(--primary)]" : ""}`}
                >
                  <td className="py-2 pr-3">{stage.label}</td>
                  <td className="py-2 pr-3">{stage.signs}</td>
                  <td className="py-2">{stage.tempText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
        Informational only and not a diagnosis. Moderate and severe hypothermia are medical
        emergencies — call your local emergency number, handle the casualty gently, and follow the
        instructions of the dispatcher and attending clinicians over anything on this page.
      </p>
    </main>
  );
}
