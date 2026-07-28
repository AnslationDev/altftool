"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wind } from "lucide-react";
import {
  INTENSITIES,
  SCALES,
  SENSITIVITY_GROUPS,
  assessOutdoorTraining,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  aqi: "165",
  scale: "us",
  intensity: "moderate",
  minutes: "45",
  groups: ["general"],
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const TONE_CLASS = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleGroup = (id) => {
    setForm((prev) => {
      if (id === "general") return { ...prev, groups: ["general"] };
      const without = prev.groups.filter((item) => item !== "general" && item !== id);
      const next = prev.groups.includes(id) ? without : [...without, id];
      return { ...prev, groups: next.length > 0 ? next : ["general"] };
    });
  };

  const result = useMemo(
    () =>
      assessOutdoorTraining({
        aqi: Number(form.aqi),
        scale: form.scale,
        intensity: form.intensity,
        minutes: Number(form.minutes),
        groups: form.groups,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Outdoor training check",
      `${result.scaleLabel}: ${result.aqi} — ${result.bandLabel}`,
      `Estimated PM2.5: ${NUM.format(result.pm25)} µg/m³ (${NUM.format(result.pm25VsWho)}× the WHO 24-hour guideline of ${result.whoGuideline})`,
      `Planned: ${result.minutes} min, ${result.intensityLabel.toLowerCase()}`,
      `Verdict: ${result.verdictLabel}`,
      `PM2.5 inhaled over the session: about ${NUM.format(result.inhaledUg)} µg (${NUM.format(result.doseMultiple)}× a clean-air session)`,
      `Length that matches a clean-air dose: ${result.saferMinutes} min`,
      "",
      ...result.notes.map((note) => `- ${note}`),
    ].join("\n");
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
          <Wind className="h-4 w-4" aria-hidden="true" />
          Air quality
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AQI Exercise Safety Advisor
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type in the AQI your app is showing and this converts it back to a PM2.5 concentration,
          works out how much of it your planned session would draw in, and gives the EPA activity
          guidance for your risk group.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aqi-value">
              AQI reading right now
            </label>
            <input
              id="aqi-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="500"
              step="1"
              value={form.aqi}
              onChange={(event) => update("aqi", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aqi-scale">
              Which AQI scale
            </label>
            <select
              id="aqi-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.scale}
              onChange={(event) => update("scale", event.target.value)}
            >
              {Object.values(SCALES).map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {(SCALES[form.scale] || SCALES.us).note}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aqi-intensity">
              Planned session
            </label>
            <select
              id="aqi-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.intensity}
              onChange={(event) => update("intensity", event.target.value)}
            >
              {INTENSITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aqi-minutes">
              Session length (minutes)
            </label>
            <input
              id="aqi-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              value={form.minutes}
              onChange={(event) => update("minutes", event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Does any of this apply to you?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SENSITIVITY_GROUPS.map((group) => (
              <label
                key={group.id}
                htmlFor={`group-${group.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`group-${group.id}`}
                  type="checkbox"
                  checked={form.groups.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                <span>{group.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
              Estimated PM2.5
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.pm25)} µg/m³`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : TONE_CLASS[result.verdictTone]
              }`}
            >
              {hasError ? "Fix the inputs above to see the verdict." : result.verdictLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy air quality training verdict"
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
            <button type="button" onClick={reset} aria-label="Reset the advisor" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Air quality band", hasError ? DASH : `${result.bandLabel} (${result.scaleLabel})`],
            [
              "Against the WHO 24-hour guideline",
              hasError ? DASH : `${NUM.format(result.pm25VsWho)}× the ${result.whoGuideline} µg/m³ guideline`,
            ],
            [
              "Breathing rate during this session",
              hasError ? DASH : `${NUM.format(result.breathingMultiple)}× resting`,
            ],
            [
              "PM2.5 you would breathe in",
              hasError ? DASH : `about ${NUM.format(result.inhaledUg)} µg over ${result.minutes} min`,
            ],
            [
              "Compared with clean air",
              hasError ? DASH : `${NUM.format(result.doseMultiple)}× the same session at 15 µg/m³`,
            ],
            [
              "Length that matches a clean-air dose",
              hasError ? DASH : `${result.saferMinutes} min`,
            ],
            [
              "Risk group applied",
              hasError
                ? DASH
                : result.isSensitive
                  ? result.sensitiveGroups.join(", ")
                  : "General public",
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
            {result.bandStatement}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What that means in practice</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          {(SCALES[form.scale] || SCALES.us).label} bands
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  AQI
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  PM2.5 (µg/m³)
                </th>
              </tr>
            </thead>
            <tbody>
              {(SCALES[form.scale] || SCALES.us).breakpoints.map((band) => (
                <tr
                  key={band.label}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    !hasError && band.level === result.bandLevel ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3">
                    {band.aqiLow}–{band.aqiHigh}
                  </td>
                  <th scope="row" className="py-2 pr-3 text-left font-semibold">
                    {band.label}
                  </th>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {band.cLow}–{band.cHigh}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. The AQI is usually a 24-hour average, so the air
        at the moment you step out can be better or worse. Anyone with asthma, COPD or heart
        disease should follow their own action plan and their clinician's advice rather than a
        calculated number.
      </p>
    </main>
  );
}
