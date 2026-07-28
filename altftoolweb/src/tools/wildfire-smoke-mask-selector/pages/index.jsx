"use client";

import { useMemo, useState } from "react";
import { Check, CloudFog, Copy, RotateCcw, TriangleAlert } from "lucide-react";
import {
  EXERTION_LEVELS,
  EXPOSURE_TARGETS,
  INDOOR_SETTINGS,
  MASKS,
  aqiToPm25,
  assessSmokeExposure,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  inputMode: "pm25",
  pm25: "180",
  aqi: "180",
  maskId: "n95",
  minutes: "45",
  exertion: "light",
  targetId: "us-naaqs",
  indoorId: "closed",
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const formatMinutes = (mins) => {
  if (!Number.isFinite(mins)) return DASH;
  if (mins >= 1440) return "All day";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const ambientPm25 = useMemo(() => {
    if (form.inputMode === "aqi") {
      const converted = aqiToPm25(Number(form.aqi));
      return converted === null ? Number.NaN : converted;
    }
    return Number(form.pm25);
  }, [form.inputMode, form.aqi, form.pm25]);

  const result = useMemo(
    () =>
      assessSmokeExposure({
        pm25: ambientPm25,
        maskId: form.maskId,
        minutes: Number(form.minutes),
        exertion: form.exertion,
        targetId: form.targetId,
        indoorId: form.indoorId,
      }),
    [ambientPm25, form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Wildfire smoke mask check",
      `Ambient PM2.5: ${NUM.format(result.ambient)} µg/m³`,
      `Mask: ${result.maskLabel} (assigned protection factor ${result.maskApf})`,
      `Effective exposure while wearing it: ${NUM.format(result.effective)} µg/m³ (${NUM.format(result.reductionPct)}% lower)`,
      `Over ${result.minutes} min of ${result.exertionLabel.toLowerCase()} you would inhale about ${NUM.format(result.inhaledUgMasked)} µg instead of ${NUM.format(result.inhaledUgUnmasked)} µg`,
      `24-hour average with ${result.indoorLabel.toLowerCase()}: ${NUM.format(result.dayAverage)} µg/m³ against a ${result.targetValue} µg/m³ target`,
      `Outdoor time before the target is passed: ${formatMinutes(result.maxMinutes)}`,
    ];
    if (result.recommendedMaskLabel) {
      lines.push(`Lightest mask that meets the target: ${result.recommendedMaskLabel}`);
    }
    if (result.warnings.length > 0) {
      lines.push("", "Warnings:");
      for (const warning of result.warnings) lines.push(`- ${warning}`);
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CloudFog className="h-4 w-4" aria-hidden="true" />
          Smoke protection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Wildfire Smoke Mask Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the smoke level and this applies the OSHA assigned protection factor for each mask
          class, shows the fine particulate you would still breathe in, and names the lightest
          mask that keeps your day under a chosen exposure target.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          {[
            ["pm25", "I have a PM2.5 reading"],
            ["aqi", "I only have the AQI"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={form.inputMode === mode}
              onClick={() => update("inputMode", mode)}
              className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                form.inputMode === mode
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {form.inputMode === "pm25" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="smoke-pm25">
                Outdoor PM2.5 (µg/m³)
              </label>
              <input
                id="smoke-pm25"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="2000"
                step="5"
                value={form.pm25}
                onChange={(event) => update("pm25", event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="smoke-aqi">
                US EPA AQI
              </label>
              <input
                id="smoke-aqi"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="500"
                step="1"
                value={form.aqi}
                onChange={(event) => update("aqi", event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Converted to{" "}
                {Number.isFinite(ambientPm25) ? `${NUM.format(ambientPm25)} µg/m³` : "an invalid value"}{" "}
                using the 2024 EPA breakpoints.
              </p>
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="smoke-mask">
              Mask you plan to wear
            </label>
            <select
              id="smoke-mask"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.maskId}
              onChange={(event) => update("maskId", event.target.value)}
            >
              {MASKS.map((mask) => (
                <option key={mask.id} value={mask.id}>
                  {mask.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="smoke-minutes">
              Minutes outdoors
            </label>
            <input
              id="smoke-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="15"
              value={form.minutes}
              onChange={(event) => update("minutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="smoke-exertion">
              How hard you will be working
            </label>
            <select
              id="smoke-exertion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.exertion}
              onChange={(event) => update("exertion", event.target.value)}
            >
              {EXERTION_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="smoke-indoor">
              Indoor air for the rest of the day
            </label>
            <select
              id="smoke-indoor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.indoorId}
              onChange={(event) => update("indoorId", event.target.value)}
            >
              {INDOOR_SETTINGS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="smoke-target">
              Exposure target to stay under
            </label>
            <select
              id="smoke-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.targetId}
              onChange={(event) => update("targetId", event.target.value)}
            >
              {EXPOSURE_TARGETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.value} µg/m³)
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Exposure behind the mask
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.effective)} µg/m³`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the result."
                : `${result.maskLabel} — assigned protection factor ${result.maskApf}, a ${NUM.format(result.reductionPct)}% reduction`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy smoke mask assessment"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the selector" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Outdoor PM2.5", hasError ? DASH : `${NUM.format(result.ambient)} µg/m³`],
            [
              "PM2.5 inhaled this trip",
              hasError
                ? DASH
                : `${NUM.format(result.inhaledUgMasked)} µg instead of ${NUM.format(result.inhaledUgUnmasked)} µg`,
            ],
            ["Particulate avoided", hasError ? DASH : `${NUM.format(result.savedPct)}%`],
            ["Indoor concentration assumed", hasError ? DASH : `${NUM.format(result.indoorConcentration)} µg/m³`],
            [
              "Your 24-hour average",
              hasError ? DASH : `${NUM.format(result.dayAverage)} µg/m³ (target ${result.targetValue})`,
            ],
            ["Outdoor time before the target is passed", hasError ? DASH : formatMinutes(result.maxMinutes)],
            [
              "Lightest mask that meets the target",
              hasError ? DASH : result.recommendedMaskLabel || "None on this list — stay indoors",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.maskNote} {result.maxMinutesNote}
          </p>
        )}

        {!hasError && result.warnings.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          >
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Before you go out
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Mask classes and what they are worth</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Mask
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  APF
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Exposure at {hasError ? DASH : NUM.format(result.ambient)} µg/m³
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? MASKS : result.maskTable).map((mask) => (
                <tr
                  key={mask.id}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    mask.id === form.maskId ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  <th scope="row" className="py-2 pr-3 text-left font-semibold">
                    {mask.label}
                  </th>
                  <td className="py-2 pr-3 text-right">
                    {mask.respirator ? mask.apf : "None"}
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {hasError ? DASH : `${NUM.format(mask.effective)} µg/m³`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Assigned protection factors come from OSHA 29 CFR 1910.134 and assume a correctly sized,
          fit-tested respirator worn with a seal check. Facial hair along the sealing surface
          breaks that assumption entirely.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not occupational safety advice or medical advice. A mask is the last
        line of defence — cleaner indoor air and less time outside do more. People with asthma,
        COPD or heart disease should follow their own action plan and ask a clinician before
        relying on a respirator, which increases the effort of breathing.
      </p>
    </main>
  );
}
