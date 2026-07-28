"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import { MEASUREMENT_STEPS, assessNeckCircumference, inchesToCm } from "../lib";

const DEFAULTS = {
  neck: "38",
  unit: "cm",
  sex: "male",
  heightCm: "170",
  weightKg: "78",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const toNumber = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const neckValue = toNumber(values.neck);
    const neckCm = values.unit === "in" ? inchesToCm(neckValue) : neckValue;
    return assessNeckCircumference({
      neckCm,
      sex: values.sex,
      heightCm: toNumber(values.heightCm),
      weightKg: toNumber(values.weightKg),
    });
  }, [values]);

  const hasError = Boolean(result.error);

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Neck Circumference Risk Checker",
      `Neck: ${NUM1.format(result.neckCm)} cm (${NUM1.format(result.neckInches)} in)`,
      `Screening level: ${result.level}`,
      result.headline,
      result.bmi ? `BMI cross-check: ${NUM1.format(result.bmi)} (${result.bmiCategory})` : "BMI cross-check: skipped",
      result.agreement ? `Agreement: ${result.agreement}` : "",
      "",
      ...result.flags.map((flag) => `${flag.met ? "✓" : "•"} ${flag.label}: ${flag.meaning}`),
    ]
      .filter(Boolean)
      .join("\n");
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

  const rows = hasError
    ? [
        ["Neck in cm", DASH],
        ["Neck in inches", DASH],
        ["Flags met", DASH],
        ["BMI", DASH],
      ]
    : [
        ["Neck in cm", `${NUM1.format(result.neckCm)} cm`],
        ["Neck in inches", `${NUM1.format(result.neckInches)} in`],
        ["Flags met", `${result.metCount} of ${result.flags.length}`],
        ["BMI", result.bmi ? `${NUM1.format(result.bmi)} · ${result.bmiCategory}` : "Skipped"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Screening helper
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Neck Circumference Risk Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare a neck measurement against published adiposity and sleep-apnoea
          screening cut-offs. This is educational, not a diagnosis.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="neck-value">
              Neck measurement
            </label>
            <input id="neck-value" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="0.1" value={values.neck} onChange={(event) => update("neck", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neck-unit">
              Unit
            </label>
            <select id="neck-unit" className={`mt-2 ${INPUT_CLASS}`} value={values.unit} onChange={(event) => update("unit", event.target.value)}>
              <option value="cm">Centimetres (cm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neck-sex">
              Cut-off set
            </label>
            <select id="neck-sex" className={`mt-2 ${INPUT_CLASS}`} value={values.sex} onChange={(event) => update("sex", event.target.value)}>
              <option value="male">Male cut-offs</option>
              <option value="female">Female cut-offs</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neck-height">
              Height for BMI cross-check (cm)
            </label>
            <input id="neck-height" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="1" value={values.heightCm} onChange={(event) => update("heightCm", event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="neck-weight">
              Weight for BMI cross-check (kg)
            </label>
            <input id="neck-weight" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" step="0.5" value={values.weightKg} onChange={(event) => update("weightKg", event.target.value)} />
          </div>
        </div>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Screening level
            </p>
            <p className="mt-1 text-4xl font-semibold capitalize text-[var(--primary)]">
              {hasError ? DASH : result.level}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs above to see the cut-offs." : result.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={hasError} className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <dt className="text-xs font-medium text-[var(--muted-foreground)]">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 space-y-3">
            {result.flags.map((flag) => (
              <div key={flag.key} className="rounded-lg bg-[var(--surface-soft)] p-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {flag.met ? "Met: " : "Not met: "}
                  {flag.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{flag.meaning}</p>
              </div>
            ))}
            {result.agreement && (
              <p className="rounded-lg bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                {result.agreement}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How to measure</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          {MEASUREMENT_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
