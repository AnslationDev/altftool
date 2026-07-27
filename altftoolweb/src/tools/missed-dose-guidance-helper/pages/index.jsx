"use client";

import { useEffect, useMemo, useState } from "react";
import { AlarmClockOff, Check, Copy, RotateCcw } from "lucide-react";

import {
  FREQUENCY_PRESETS,
  MEDICINE_CLASSES,
  assessMissedDose,
  formatHours,
} from "../lib";

const DASH = "—";
const TIME = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  scheduledAt: "2026-07-20T08:00",
  now: "2026-07-20T11:00",
  preset: "bd",
  customHours: "12",
  medicineClass: "general",
};

const pad = (value) => String(value).padStart(2, "0");
const localInput = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

const OUTCOME_TONE = {
  "take-now": "text-[var(--success)]",
  skip: "text-[var(--primary)]",
  check: "text-[var(--warning)]",
  "not-due": "text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [scheduledAt, setScheduledAt] = useState(DEFAULTS.scheduledAt);
  const [now, setNow] = useState(DEFAULTS.now);
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [customHours, setCustomHours] = useState(DEFAULTS.customHours);
  const [medicineClass, setMedicineClass] = useState(DEFAULTS.medicineClass);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const current = new Date();
    const earlier = new Date(current.getTime() - 3 * 3600000);
    setNow(localInput(current));
    setScheduledAt(localInput(earlier));
  }, []);

  const presetDef = FREQUENCY_PRESETS.find((item) => item.id === preset) ?? FREQUENCY_PRESETS[1];
  const intervalHours = presetDef.hours === null ? toNumber(customHours) : presetDef.hours;

  const result = useMemo(
    () => assessMissedDose({ scheduledAt, now, intervalHours, medicineClass }),
    [scheduledAt, now, intervalHours, medicineClass],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Missed dose check",
      `Dose due: ${TIME.format(new Date(`${scheduledAt}:00`))}`,
      `Noticed: ${TIME.format(new Date(`${now}:00`))}`,
      `How late: ${formatHours(Math.max(0, result.hoursLate))}`,
      `Dosing interval: every ${result.intervalHours} hours (halfway point ${formatHours(result.thresholdHours)})`,
      `Outcome: ${result.headline}`,
      result.detail,
      `Next dose on the normal schedule: ${TIME.format(new Date(result.nextDoseIso))}`,
      "Never take two doses together to make up for a missed one.",
    ].join("\n");
  }, [ok, result, scheduledAt, now]);

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
    const current = new Date();
    setNow(localInput(current));
    setScheduledAt(localInput(new Date(current.getTime() - 3 * 3600000)));
    setPreset(DEFAULTS.preset);
    setCustomHours(DEFAULTS.customHours);
    setMedicineClass(DEFAULTS.medicineClass);
    setCopied(false);
  };

  const tone = ok ? (OUTCOME_TONE[result.outcome] ?? "text-[var(--primary)]") : "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlarmClockOff className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Missed Dose Guidance Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter when the dose was due and how often you take it. This shows how late you are, which
          side of the halfway point that falls on, and when the next dose is due — the same rule
          most patient leaflets print.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="md-scheduled">
              When the dose was due
            </label>
            <input
              id="md-scheduled"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="md-now">
              Time right now
            </label>
            <input
              id="md-now"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={now}
              onChange={(event) => setNow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="md-preset">
              How often you take it
            </label>
            <select
              id="md-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preset}
              onChange={(event) => setPreset(event.target.value)}
            >
              {FREQUENCY_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {presetDef.hours === null ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="md-hours">
                Hours between doses
              </label>
              <input
                id="md-hours"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.5"
                step="0.5"
                value={customHours}
                onChange={(event) => setCustomHours(event.target.value)}
              />
            </div>
          ) : null}
          <div className={presetDef.hours === null ? "" : "sm:col-span-2"}>
            <label className={LABEL_CLASS} htmlFor="md-class">
              Type of medicine
            </label>
            <select
              id="md-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={medicineClass}
              onChange={(event) => setMedicineClass(event.target.value)}
            >
              {MEDICINE_CLASSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              What the leaflet rule points to
            </p>
            <p className={`mt-1 text-2xl font-semibold sm:text-3xl ${tone}`}>
              {ok ? result.headline : DASH}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {ok ? result.detail : "Fix the inputs above to see the timing."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the missed dose summary"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
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

        {ok && result.classNote ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.outcome === "check"
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.classNote}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["How late the dose is", ok ? formatHours(Math.max(0, result.hoursLate)) : DASH],
            ["Halfway point to the next dose", ok ? formatHours(result.thresholdHours) : DASH],
            ["Dosing interval", ok ? `Every ${result.intervalHours} hours` : DASH],
            [
              "Scheduled doses gone by",
              ok ? `${result.dosesMissed}` : DASH,
            ],
            [
              "Next dose on the normal schedule",
              ok ? TIME.format(new Date(result.nextDoseIso)) : DASH,
            ],
            ["Time until that dose", ok ? formatHours(result.hoursToNext) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          Never take two doses together to make up for a missed one.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice and not a substitute for the leaflet that came with
        your medicine. The halfway-point rule is a general convention; individual products, and
        anyone who has missed several doses in a row, need advice from a pharmacist or the
        prescriber. If you feel unwell after a missed or extra dose, seek medical help straight away.
      </p>
    </main>
  );
}
