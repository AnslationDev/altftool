"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import {
  COMPARISON_ROWS,
  KITCHEN_TEASPOON_RANGE_ML,
  SPOONS,
  convertSpoonVolume,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  amount: "2",
  direction: "spoons-to-ml",
  spoonId: "tsp-5",
  concentrationMgPer5Ml: "250",
};
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

  const result = useMemo(() => convertSpoonVolume(form), [form]);
  const ok = !result.error;

  const headline = ok
    ? form.direction === "spoons-to-ml"
      ? `${NUM2.format(result.millilitres)} mL`
      : `${NUM3.format(result.spoonCount)} × ${result.spoon.label.split(" (")[0]}`
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Medicine spoon conversion",
      `Spoon used: ${result.spoon.label}`,
      `Volume: ${NUM2.format(result.millilitres)} mL (measure ${NUM1.format(result.millilitresRounded)} mL on a syringe)`,
      `In 5 mL medicine teaspoons: ${NUM3.format(result.medicineTeaspoons)}`,
      `In 15 mL tablespoons: ${NUM3.format(result.medicineTablespoons)}`,
      result.doseMg !== null
        ? `Dose delivered at ${NUM2.format(result.mgPer5Ml)} mg per 5 mL: ${NUM2.format(result.doseMg)} mg`
        : "",
      "Informational only — use the syringe or cup supplied with the medicine.",
    ]
      .filter(Boolean)
      .join("\n");
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
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Medicine Spoon to Millilitre Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A teaspoon on a medicine label means 5 mL, but a recipe teaspoon is 4.93 mL and a real
          kitchen spoon can hold anything from {KITCHEN_TEASPOON_RANGE_ML.min} to{" "}
          {KITCHEN_TEASPOON_RANGE_ML.max} mL. Convert to the exact volume instead.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="spoon-direction">
              Convert
            </label>
            <select
              id="spoon-direction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.direction}
              onChange={setField("direction")}
            >
              <option value="spoons-to-ml">Spoons into millilitres</option>
              <option value="ml-to-spoons">Millilitres into spoons</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spoon-amount">
              {form.direction === "spoons-to-ml" ? "Number of spoons" : "Volume in millilitres"}
            </label>
            <input
              id="spoon-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.amount}
              onChange={setField("amount")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spoon-type">
              Which spoon
            </label>
            <select
              id="spoon-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.spoonId}
              onChange={setField("spoonId")}
            >
              {SPOONS.map((spoon) => (
                <option key={spoon.id} value={spoon.id}>
                  {spoon.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spoon-strength">
              Label strength per 5 mL, in mg (optional)
            </label>
            <input
              id="spoon-strength"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="Optional, e.g. 250"
              value={form.concentrationMgPer5Ml}
              onChange={setField("concentrationMgPer5Ml")}
            />
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
              {form.direction === "spoons-to-ml" ? "Measured volume" : "Spoons needed"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite" aria-atomic="true">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Set an oral syringe to ${NUM1.format(result.millilitresRounded)} mL`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the spoon conversion"
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

        <div aria-live="polite" aria-atomic="true">
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Exact volume", ok ? `${NUM3.format(result.millilitres)} mL` : DASH],
              ["Rounded to a syringe mark", ok ? `${NUM1.format(result.millilitresRounded)} mL` : DASH],
              ["In 5 mL medicine teaspoons", ok ? NUM3.format(result.medicineTeaspoons) : DASH],
              ["In 15 mL tablespoons", ok ? NUM3.format(result.medicineTablespoons) : DASH],
              ["In US fluid ounces", ok ? NUM3.format(result.usFluidOunces) : DASH],
              [
                "Dose delivered",
                ok
                  ? result.doseMg !== null
                    ? `${NUM2.format(result.doseMg)} mg`
                    : "Add a label strength"
                  : DASH,
              ],
              [
                "This spoon versus a 5 mL teaspoon",
                ok
                  ? `${result.differenceFromMedicineTeaspoonPct >= 0 ? "+" : "−"}${NUM1.format(
                      Math.abs(result.differenceFromMedicineTeaspoonPct),
                    )}%`
                  : DASH,
              ],
            ].map(([label, figure]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{figure}</dd>
              </div>
            ))}
          </dl>
        </div>

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.spoon.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Spoon capacities compared</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Spoon
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  mL
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  5 mL teaspoons
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.label}</td>
                  <td className="py-2 pr-3 text-right">{NUM3.format(row.ml)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {NUM2.format(row.teaspoons)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Always dose liquid medicine with the syringe, cup or
        spoon supplied with the product, never with cutlery. If the instruction and the device
        disagree, ask a pharmacist before giving the dose.
      </p>
    </main>
  );
}
