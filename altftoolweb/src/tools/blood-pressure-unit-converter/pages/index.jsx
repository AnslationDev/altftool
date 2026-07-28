"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import {
  KPA_PER_MMHG,
  MAP_PERFUSION_FLOOR_MMHG,
  MMHG_PER_KPA,
  REFERENCE_ROWS,
  TYPICAL_PULSE_PRESSURE_MMHG,
  UNITS,
  convertBloodPressure,
  mmHgToKpa,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = { systolic: "128", diastolic: "82", unit: "mmHg" };
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
};

export default function ToolHome() {
  const [systolic, setSystolic] = useState(DEFAULTS.systolic);
  const [diastolic, setDiastolic] = useState(DEFAULTS.diastolic);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertBloodPressure({ systolic, diastolic, unit }),
    [systolic, diastolic, unit],
  );
  const ok = !result.error;

  const headline = ok
    ? unit === "mmHg"
      ? `${NUM2.format(result.systolicKpa)} / ${NUM2.format(result.diastolicKpa)} kPa`
      : `${NUM1.format(result.systolicMmHg)} / ${NUM1.format(result.diastolicMmHg)} mmHg`
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Blood pressure unit conversion",
      `In mmHg: ${NUM1.format(result.systolicMmHg)} / ${NUM1.format(result.diastolicMmHg)}`,
      `In kPa: ${NUM2.format(result.systolicKpa)} / ${NUM2.format(result.diastolicKpa)}`,
      `Mean arterial pressure: ${NUM1.format(result.mapMmHg)} mmHg (${NUM2.format(result.mapKpa)} kPa)`,
      `Pulse pressure: ${NUM1.format(result.pulsePressureMmHg)} mmHg`,
      `ACC/AHA category: ${result.category.label}`,
      "Informational only — a single reading does not diagnose anything.",
    ].join("\n");
  }, [ok, result]);

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
    setSystolic(DEFAULTS.systolic);
    setDiastolic(DEFAULTS.diastolic);
    setUnit(DEFAULTS.unit);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Blood Pressure Unit Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a cuff reading between millimetres of mercury and kilopascals, and see the mean
          arterial pressure, pulse pressure and ACC/AHA category that go with it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-systolic">
              Systolic (top number)
            </label>
            <input
              id="bp-systolic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="any"
              value={systolic}
              onChange={(event) => setSystolic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bp-diastolic">
              Diastolic (bottom number)
            </label>
            <input
              id="bp-diastolic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="any"
              value={diastolic}
              onChange={(event) => setDiastolic(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bp-unit">
              Unit of the reading
            </label>
            <select
              id="bp-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["118 / 78", "118", "78", "mmHg"],
            ["145 / 95", "145", "95", "mmHg"],
            ["16 / 10.5 kPa", "16", "10.5", "kPa"],
          ].map(([label, s, d, u]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setSystolic(s);
                setDiastolic(d);
                setUnit(u);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {result.error && (
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
              {unit === "mmHg" ? "In kilopascals" : "In millimetres of mercury"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            {ok ? (
              <span
                className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                  TONE_CLASS[result.category.tone]
                }`}
              >
                {result.category.label}
              </span>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Fix the inputs above to see a result.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the blood pressure conversion"
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
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Reading in mmHg",
              ok ? `${NUM1.format(result.systolicMmHg)} / ${NUM1.format(result.diastolicMmHg)}` : DASH,
            ],
            [
              "Reading in kPa",
              ok ? `${NUM2.format(result.systolicKpa)} / ${NUM2.format(result.diastolicKpa)}` : DASH,
            ],
            [
              "Mean arterial pressure",
              ok ? `${NUM1.format(result.mapMmHg)} mmHg (${NUM2.format(result.mapKpa)} kPa)` : DASH,
            ],
            [
              "Pulse pressure",
              ok
                ? `${NUM1.format(result.pulsePressureMmHg)} mmHg (${NUM2.format(result.pulsePressureKpa)} kPa)`
                : DASH,
            ],
            [
              `Typical pulse pressure (${TYPICAL_PULSE_PRESSURE_MMHG} mmHg)`,
              ok
                ? result.widePulsePressure
                  ? "Wider than usual"
                  : result.narrowPulsePressure
                    ? "Narrower than usual"
                    : "Within the usual range"
                : DASH,
            ],
            [
              `MAP above ${MAP_PERFUSION_FLOOR_MMHG} mmHg`,
              ok ? (result.lowPerfusionMap ? "No" : "Yes") : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.category.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Conversion reference</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          1 mmHg = {KPA_PER_MMHG.toFixed(6)} kPa and 1 kPa = {NUM2.format(MMHG_PER_KPA)} mmHg. One
          torr is the same size as one mmHg for practical purposes.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  mmHg
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  kPa
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  MAP (mmHg)
                </th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_ROWS.map((row) => {
                const converted = convertBloodPressure({
                  systolic: row.systolic,
                  diastolic: row.diastolic,
                  unit: "mmHg",
                });
                return (
                  <tr
                    key={`${row.systolic}-${row.diastolic}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {row.systolic} / {row.diastolic}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {NUM2.format(mmHgToKpa(row.systolic))} / {NUM2.format(mmHgToKpa(row.diastolic))}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(converted.mapMmHg)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Blood pressure categories assume a properly sized
        cuff, a seated rest of five minutes and an average of repeated readings on separate
        occasions. Discuss any high or low readings with a clinician.
      </p>
    </main>
  );
}
