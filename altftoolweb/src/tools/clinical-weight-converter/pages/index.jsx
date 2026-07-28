"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Weight } from "lucide-react";

import {
  KG_PER_LB,
  REFERENCE_ROWS,
  ROUNDING_PROFILES,
  UNIT_MODES,
  convertClinicalWeight,
  getUnitMode,
  splitPoundsOunces,
  splitStonesPounds,
} from "../lib";

const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = { primary: "70", secondary: "0", unitMode: "kg", roundingId: "standard" };
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
  const result = useMemo(() => convertClinicalWeight(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Clinical weight conversion",
      `Recorded precision: ${result.profile.label}`,
      `Kilograms: ${NUM3.format(result.kg)} kg`,
      `Grams: ${NUM0.format(result.grams)} g`,
      `Pounds: ${NUM3.format(result.pounds)} lb`,
      `Pounds and ounces: ${result.poundsOunces.pounds} lb ${NUM1.format(result.poundsOunces.ounces)} oz`,
      `Stones and pounds: ${result.stonesPounds.stones} st ${NUM1.format(result.stonesPounds.pounds)} lb`,
      "Informational only — use the scale reading recorded in the notes for dosing.",
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
          <Weight className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Clinical Weight Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a body weight between kilograms, grams, pounds, pounds and ounces and stones, using
          the exact 0.45359237 kg pound and the recording step for the right age group.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wt-mode">
              How the weight was recorded
            </label>
            <select
              id="wt-mode"
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
            <label className={LABEL_CLASS} htmlFor="wt-primary">
              {mode ? mode.primaryLabel : "Weight"}
            </label>
            <input
              id="wt-primary"
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
              <label className={LABEL_CLASS} htmlFor="wt-secondary">
                {mode.secondaryLabel}
              </label>
              <input
                id="wt-secondary"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={form.secondary}
                onChange={setField("secondary")}
              />
            </div>
          )}
          <div className={mode && mode.secondaryLabel ? "sm:col-span-2" : ""}>
            <label className={LABEL_CLASS} htmlFor="wt-rounding">
              Recording precision
            </label>
            <select
              id="wt-rounding"
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
              Weight in kilograms
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM3.format(result.kg)} kg` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.poundsOunces.pounds} lb ${NUM1.format(result.poundsOunces.ounces)} oz · ${result.stonesPounds.stones} st ${NUM1.format(result.stonesPounds.pounds)} lb`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the weight conversion"
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
            ["Kilograms", ok ? `${NUM3.format(result.kg)} kg` : DASH],
            ["Grams", ok ? `${NUM0.format(result.grams)} g` : DASH],
            ["Pounds", ok ? `${NUM3.format(result.pounds)} lb` : DASH],
            [
              "Pounds and ounces",
              ok ? `${result.poundsOunces.pounds} lb ${NUM1.format(result.poundsOunces.ounces)} oz` : DASH,
            ],
            [
              "Stones and pounds",
              ok ? `${result.stonesPounds.stones} st ${NUM1.format(result.stonesPounds.pounds)} lb` : DASH,
            ],
            ["Ounces total", ok ? `${NUM1.format(result.ounces)} oz` : DASH],
            ["Exact value before rounding", ok ? `${NUM3.format(result.exactKg)} kg` : DASH],
            [
              "Shift caused by rounding",
              ok
                ? `${result.roundingShiftG >= 0 ? "+" : "−"}${NUM2.format(Math.abs(result.roundingShiftG))} g`
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
          1 lb = {KG_PER_LB} kg exactly, 1 stone = 14 lb, 1 oz = 1/16 lb.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  kg
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  lb
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  lb + oz
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  st + lb
                </th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_ROWS.map((kg) => {
                const pounds = kg / KG_PER_LB;
                const lbOz = splitPoundsOunces(pounds);
                const stLb = splitStonesPounds(pounds);
                return (
                  <tr key={kg} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{NUM1.format(kg)}</td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(pounds)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {lbOz.pounds} lb {NUM1.format(lbOz.ounces)} oz
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {stLb.stones} st {NUM1.format(stLb.pounds)} lb
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. For drug dosing, fluid calculations or growth
        charting, use the weight measured on a calibrated scale and recorded in the notes rather than
        a converted or reported figure.
      </p>
    </main>
  );
}
