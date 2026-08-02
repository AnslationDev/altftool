"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Syringe } from "lucide-react";

import {
  BASES,
  CONCENTRATION_PRESETS,
  STRENGTH_UNITS,
  WEIGHT_UNITS,
  calculateWeightBasedDose,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  weight: "20",
  weightUnit: "kg",
  dosePerKg: "15",
  strengthUnit: "mg",
  basis: "per-day",
  dosesPerDay: "3",
  concentrationMg: "250",
  concentrationMl: "5",
  maxSingleDoseMg: "",
  maxDailyDoseMg: "",
};
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => calculateWeightBasedDose(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Weight-based dose",
      `Body weight: ${NUM2.format(result.weightKg)} kg (${NUM2.format(result.weightLb)} lb)`,
      `Prescribed: ${NUM3.format(result.doseMgPerKg)} mg/kg ${
        result.basis === "per-day" ? "per day" : "per dose"
      }`,
      `Doses per day: ${result.dosesPerDay} (about every ${NUM1.format(result.intervalHours)} hours)`,
      `Each dose: ${NUM2.format(result.singleDoseMg)} mg`,
      `Daily total: ${NUM2.format(result.dailyDoseMg)} mg`,
      result.singleDoseMl !== null
        ? `Volume per dose: ${NUM2.format(result.singleDoseMl)} mL (${NUM1.format(result.singleDoseMlRounded)} mL on a 0.1 mL syringe)`
        : result.concentrationError
          ? `Volume per dose: ${result.concentrationError}`
          : "No liquid strength entered.",
      "Informational only — confirm every dose against the prescription and the label.",
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
          <Syringe className="h-4 w-4" aria-hidden="true" />
          Medical units
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Weight-Based Dose Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a per-kilogram instruction into the actual milligrams for one body weight, split it
          across the day, and convert it to a syrup volume.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-weight">
              Body weight
            </label>
            <input
              id="dose-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.weight}
              onChange={setField("weight")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-weight-unit">
              Weight unit
            </label>
            <select
              id="dose-weight-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.weightUnit}
              onChange={setField("weightUnit")}
            >
              {WEIGHT_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-per-kg">
              Prescribed amount per kilogram
            </label>
            <input
              id="dose-per-kg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={form.dosePerKg}
              onChange={setField("dosePerKg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-strength-unit">
              Strength unit
            </label>
            <select
              id="dose-strength-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.strengthUnit}
              onChange={setField("strengthUnit")}
            >
              {STRENGTH_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-basis">
              That figure is
            </label>
            <select
              id="dose-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.basis}
              onChange={setField("basis")}
            >
              {BASES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-frequency">
              Doses per day
            </label>
            <input
              id="dose-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              value={form.dosesPerDay}
              onChange={setField("dosesPerDay")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-conc-mg">
              Liquid strength (mg)
            </label>
            <input
              id="dose-conc-mg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="Leave blank for tablets"
              value={form.concentrationMg}
              onChange={setField("concentrationMg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-conc-ml">
              dissolved in (mL)
            </label>
            <input
              id="dose-conc-ml"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="Leave blank for tablets"
              value={form.concentrationMl}
              onChange={setField("concentrationMl")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-max-single">
              Maximum single dose (mg, optional)
            </label>
            <input
              id="dose-max-single"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="Optional"
              value={form.maxSingleDoseMg}
              onChange={setField("maxSingleDoseMg")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dose-max-daily">
              Maximum daily dose (mg, optional)
            </label>
            <input
              id="dose-max-daily"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="Optional"
              value={form.maxDailyDoseMg}
              onChange={setField("maxDailyDoseMg")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CONCENTRATION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  concentrationMg: String(preset.mg),
                  concentrationMl: String(preset.ml),
                }))
              }
            >
              {preset.label}
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
              Each dose
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM2.format(result.singleDoseMg)} mg` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.dosesPerDay} times a day, about every ${NUM1.format(result.intervalHours)} hours`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the calculated dose"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Body weight used",
              ok ? `${NUM2.format(result.weightKg)} kg (${NUM2.format(result.weightLb)} lb)` : DASH,
            ],
            ["Dose per kilogram", ok ? `${NUM3.format(result.doseMgPerKg)} mg/kg` : DASH],
            ["Amount per dose", ok ? `${NUM2.format(result.singleDoseMg)} mg` : DASH],
            ["Total per day", ok ? `${NUM2.format(result.dailyDoseMg)} mg` : DASH],
            [
              "Volume per dose",
              ok && result.singleDoseMl !== null
                ? `${NUM2.format(result.singleDoseMl)} mL (round to ${NUM1.format(result.singleDoseMlRounded)} mL)`
                : ok && result.concentrationError
                  ? result.concentrationError
                  : ok
                    ? "No liquid strength entered"
                    : DASH,
            ],
            [
              "Volume per day",
              ok && result.dailyDoseMl !== null
                ? `${NUM2.format(result.dailyDoseMl)} mL`
                : ok && result.concentrationError
                  ? result.concentrationError
                  : ok
                    ? "No liquid strength entered"
                    : DASH,
            ],
            [
              "Share of the single-dose maximum",
              ok
                ? result.percentOfSingleCap !== null
                  ? `${NUM1.format(result.percentOfSingleCap)}%`
                  : "No cap entered"
                : DASH,
            ],
            [
              "Share of the daily maximum",
              ok
                ? result.percentOfDailyCap !== null
                  ? `${NUM1.format(result.percentOfDailyCap)}%`
                  : "No cap entered"
                : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok && (result.exceedsSingleCap || result.exceedsDailyCap) && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.exceedsSingleCap && result.exceedsDailyCap
              ? "This exceeds both the single-dose and the daily maximum you entered."
              : result.exceedsSingleCap
                ? "This exceeds the single-dose maximum you entered."
                : "This exceeds the daily maximum you entered."}{" "}
            Recheck the prescription before giving it.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational arithmetic only, not medical advice and not a drug reference. It holds no dose
        limits of its own — any maximum shown is the one you typed in. Always confirm the dose,
        strength and frequency against the prescription, the product label and a pharmacist or
        prescriber before giving any medicine, especially to a child.
      </p>
    </main>
  );
}
