"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import {
  CM_PER_INCH,
  REFERENCE_ROWS,
  ROUNDING_PROFILES,
  UNIT_MODES,
  convertClinicalHeight,
  getUnitMode,
  splitFeetInches,
} from "../lib";

const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = { primary: "170", secondary: "0", unitMode: "cm", roundingId: "tenth" };
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const mode = getUnitMode(form.unitMode);
  const result = useMemo(() => convertClinicalHeight(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Clinical height conversion",
      `Recorded precision: ${result.profile.label}`,
      `Centimetres: ${NUM2.format(result.cm)} cm`,
      `Metres: ${NUM4.format(result.metres)} m`,
      `Inches: ${NUM2.format(result.totalInches)} in`,
      `Feet and inches: ${result.feetInches.feet} ft ${NUM1.format(result.feetInches.inches)} in`,
      `Height squared for BMI: ${NUM4.format(result.heightSquaredM2)} m²`,
      "Informational only — use the stadiometer reading recorded in the notes.",
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Clinical Height Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a height between centimetres, metres, total inches and feet-and-inches using the
          exact 2.54 cm inch, with the rounding step your chart or form uses.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ht-mode">
              How the height was recorded
            </label>
            <select
              id="ht-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.unitMode}
              onChange={setField("unitMode")}
            >
              {UNIT_MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ht-primary">
              {mode ? mode.primaryLabel : "Height"}
            </label>
            <input
              id="ht-primary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.primary}
              onChange={setField("primary")}
            />
          </div>
          {mode && mode.secondaryLabel && (
            <div>
              <label className={LABEL_CLASS} htmlFor="ht-secondary">
                {mode.secondaryLabel}
              </label>
              <input
                id="ht-secondary"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="11.9"
                step="any"
                value={form.secondary}
                onChange={setField("secondary")}
              />
            </div>
          )}
          <div className={mode && mode.secondaryLabel ? "sm:col-span-2" : ""}>
            <label className={LABEL_CLASS} htmlFor="ht-rounding">
              Recording precision
            </label>
            <select
              id="ht-rounding"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.roundingId}
              onChange={setField("roundingId")}
            >
              {ROUNDING_PROFILES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
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
              Height in centimetres
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM2.format(result.cm)} cm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.feetInches.feet} ft ${NUM1.format(result.feetInches.inches)} in · ${NUM4.format(result.metres)} m`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the height conversion"
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
            ["Centimetres", ok ? `${NUM2.format(result.cm)} cm` : DASH],
            ["Metres", ok ? `${NUM4.format(result.metres)} m` : DASH],
            ["Millimetres", ok ? `${NUM1.format(result.millimetres)} mm` : DASH],
            ["Total inches", ok ? `${NUM2.format(result.totalInches)} in` : DASH],
            [
              "Feet and inches",
              ok ? `${result.feetInches.feet} ft ${NUM1.format(result.feetInches.inches)} in` : DASH,
            ],
            ["Decimal feet", ok ? `${NUM2.format(result.decimalFeet)} ft` : DASH],
            ["Height squared (BMI denominator)", ok ? `${NUM4.format(result.heightSquaredM2)} m²` : DASH],
            [
              "Shift caused by rounding",
              ok
                ? `${result.roundingShiftCm >= 0 ? "+" : "−"}${NUM2.format(Math.abs(result.roundingShiftCm))} cm`
                : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Quick reference</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          1 inch = {CM_PER_INCH} cm exactly, so 1 foot = 30.48 cm.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  cm
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  inches
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  ft + in
                </th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_ROWS.map((cm) => {
                const inches = cm / CM_PER_INCH;
                const split = splitFeetInches(inches);
                return (
                  <tr key={cm} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{cm}</td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(inches)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {split.feet} ft {NUM1.format(split.inches)} in
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Standing height is measured on a stadiometer with the
        heels together and the head in the Frankfort plane; children under two are measured lying
        down as length, which reads slightly longer than standing height.
      </p>
    </main>
  );
}
