"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Thermometer } from "lucide-react";

import {
  ANTIVIRAL_WINDOW_HOURS,
  ONSET_OPTIONS,
  RED_FLAGS,
  SYMPTOMS,
  celsiusToFahrenheit,
  comparePattern,
  fahrenheitToCelsius,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium";

const DEFAULTS = {
  symptoms: ["aches", "chills", "fatigue", "headache", "cough"],
  onsetKey: "abrupt",
  tempUnit: "c",
  temperature: "39.2",
  hours: "20",
  ageGroup: "adult",
  redFlagIds: [],
};

export default function ToolHome() {
  const [symptoms, setSymptoms] = useState(DEFAULTS.symptoms);
  const [onsetKey, setOnsetKey] = useState(DEFAULTS.onsetKey);
  const [tempUnit, setTempUnit] = useState(DEFAULTS.tempUnit);
  const [temperature, setTemperature] = useState(DEFAULTS.temperature);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [ageGroup, setAgeGroup] = useState(DEFAULTS.ageGroup);
  const [redFlagIds, setRedFlagIds] = useState(DEFAULTS.redFlagIds);
  const [copied, setCopied] = useState(false);

  const temperatureC = useMemo(() => {
    if (temperature === "") return null;
    return tempUnit === "f" ? fahrenheitToCelsius(temperature) : Number(temperature);
  }, [temperature, tempUnit]);

  const result = useMemo(
    () =>
      comparePattern({
        symptoms,
        onsetKey,
        temperatureC,
        hoursSinceOnset: Number(hours),
        ageGroup,
        redFlagIds,
      }),
    [symptoms, onsetKey, temperatureC, hours, ageGroup, redFlagIds],
  );

  const failed = Boolean(result.error);
  const flagList = RED_FLAGS[ageGroup === "child" ? "child" : "adult"];

  const toggleSymptom = (id) => {
    setSymptoms((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    setCopied(false);
  };

  const toggleFlag = (id) => {
    setRedFlagIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    setCopied(false);
  };

  const switchUnit = (unit) => {
    if (unit === tempUnit) return;
    if (temperature !== "") {
      const value = unit === "f" ? celsiusToFahrenheit(temperature) : fahrenheitToCelsius(temperature);
      if (Number.isFinite(value)) setTemperature(String(Math.round(value * 10) / 10));
    }
    setTempUnit(unit);
    setCopied(false);
  };

  const reset = () => {
    setSymptoms(DEFAULTS.symptoms);
    setOnsetKey(DEFAULTS.onsetKey);
    setTempUnit(DEFAULTS.tempUnit);
    setTemperature(DEFAULTS.temperature);
    setHours(DEFAULTS.hours);
    setAgeGroup(DEFAULTS.ageGroup);
    setRedFlagIds(DEFAULTS.redFlagIds);
    setCopied(false);
  };

  const clipboardText = useMemo(() => {
    if (failed) return "";
    return [
      "Cold vs Flu Symptom Comparator (informational, not a diagnosis)",
      `Pattern match: ${result.coldPercent}% common cold / ${result.fluPercent}% influenza`,
      `Verdict: ${result.lean.label}`,
      `Hours since onset: ${num(result.antiviral.hoursSinceOnset)} — antiviral window ${result.antiviral.withinWindow ? `open, about ${num(result.antiviral.hoursRemaining)} h left` : "closed"}`,
      result.redFlagsTriggered.length > 0
        ? `EMERGENCY SIGNS TICKED: ${result.redFlagsTriggered.map((f) => f.label).join("; ")}`
        : "No emergency warning signs ticked.",
      "",
      "Guidance:",
      ...result.guidance.map((g) => `- ${g}`),
    ].join("\n");
  }, [failed, result]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const emergency = !failed && result.redFlagsTriggered.length > 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          Symptom patterns
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Cold vs Flu Symptom Comparator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Colds and influenza share symptoms, but they differ in how fast they start and how much of
          the body they involve. Tick what you have and this compares the pattern against the
          published profiles for each — a comparison, never a diagnosis.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Which symptoms do you have?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SYMPTOMS.map((symptom) => (
              <label key={symptom.id} className={CHECK_ROW} htmlFor={`cf-${symptom.id}`}>
                <input
                  id={`cf-${symptom.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={symptoms.includes(symptom.id)}
                  onChange={() => toggleSymptom(symptom.id)}
                />
                {symptom.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-onset">
              How did it start?
            </label>
            <select
              id="cf-onset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={onsetKey}
              onChange={(event) => {
                setOnsetKey(event.target.value);
                setCopied(false);
              }}
            >
              {ONSET_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-hours">
              Hours since symptoms started
            </label>
            <input
              id="cf-hours"
              type="number"
              inputMode="numeric"
              min="0"
              max="720"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hours}
              onChange={(event) => {
                setHours(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-temp">
              Highest temperature measured ({tempUnit === "f" ? "°F" : "°C"})
            </label>
            <input
              id="cf-temp"
              type="number"
              inputMode="decimal"
              step="0.1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={temperature}
              onChange={(event) => {
                setTemperature(event.target.value);
                setCopied(false);
              }}
            />
            <div className="mt-2 flex gap-2">
              {[
                ["c", "°C"],
                ["f", "°F"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={tempUnit === key}
                  onClick={() => switchUnit(key)}
                  className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    tempUnit === key
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cf-age">
              Who is unwell?
            </label>
            <select
              id="cf-age"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ageGroup}
              onChange={(event) => {
                setAgeGroup(event.target.value);
                setRedFlagIds([]);
                setCopied(false);
              }}
            >
              <option value="adult">An adult</option>
              <option value="child">A child</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--danger)]">
            Emergency warning signs — tick any that apply
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {flagList.map((flag) => (
              <label key={flag.id} className={CHECK_ROW} htmlFor={`cf-flag-${flag.id}`}>
                <input
                  id={`cf-flag-${flag.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--danger)]"
                  checked={redFlagIds.includes(flag.id)}
                  onChange={() => toggleFlag(flag.id)}
                />
                {flag.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      {emergency && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]">
          You have ticked an emergency warning sign. Seek urgent medical care now — do not use this
          comparison to decide whether to wait.
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pattern match
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.fluPercent}% flu-like`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Add symptoms above to compare." : `${result.coldPercent}% cold-like — ${result.lean.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the symptom pattern comparison" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <div
            className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${result.coldPercent} percent cold-like and ${result.fluPercent} percent flu-like`}
          >
            <span className="block h-full bg-[var(--success)]" style={{ width: `${result.coldPercent}%` }} />
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${result.fluPercent}%` }} />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cold-pattern points", failed ? DASH : String(result.coldScore)],
            ["Flu-pattern points", failed ? DASH : String(result.fluScore)],
            ["Separation between the two", failed ? DASH : `${result.gap} percentage points`],
            ["Hours since onset", failed ? DASH : num(result.antiviral.hoursSinceOnset)],
            [
              `Antiviral window (${ANTIVIRAL_WINDOW_HOURS} h)`,
              failed
                ? DASH
                : result.antiviral.withinWindow
                  ? `Open — about ${num(result.antiviral.hoursRemaining)} h left`
                  : "Closed",
            ],
            [
              "Emergency warning signs ticked",
              failed ? DASH : String(result.redFlagsTriggered.length),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && result.contributions.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">How each answer scored</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Feature</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">In a cold</th>
                  <th scope="col" className="py-2 text-right font-semibold">In flu</th>
                </tr>
              </thead>
              <tbody>
                {result.contributions.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.coldLabel}</td>
                    <td className="py-2 text-right font-semibold">{row.fluLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What this means</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.guidance.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not a diagnosis. Cold, influenza, COVID-19 and other respiratory
        infections overlap and cannot be separated by symptoms alone — only testing can. Contact a
        doctor if you are pregnant, over 65, immunosuppressed, have a chronic heart or lung
        condition, are caring for a baby under three months, or if symptoms worsen.
      </p>
    </main>
  );
}
