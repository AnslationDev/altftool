"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import { ACE_MALE_BANDS, METHODS, estimateMaleBodyFat } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const DASH = "—";
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);
const two = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);
const four = (value) => (Number.isFinite(value) ? NUM4.format(value) : DASH);

const DEFAULTS = {
  method: "navy",
  age: "30",
  height: "175",
  weight: "80",
  neck: "38",
  waist: "90",
  chest: "10",
  abdomen: "20",
  thigh: "15",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  return Number(trimmed.replace(/,/g, ""));
};

export default function ToolHome() {
  const [method, setMethod] = useState(DEFAULTS.method);
  const [age, setAge] = useState(DEFAULTS.age);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [chest, setChest] = useState(DEFAULTS.chest);
  const [abdomen, setAbdomen] = useState(DEFAULTS.abdomen);
  const [thigh, setThigh] = useState(DEFAULTS.thigh);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateMaleBodyFat({
        method,
        age: toNumber(age),
        heightCm: toNumber(height),
        weightKg: toNumber(weight),
        neckCm: toNumber(neck),
        waistCm: toNumber(waist),
        chestMm: toNumber(chest),
        abdomenMm: toNumber(abdomen),
        thighMm: toNumber(thigh),
      }),
    [method, age, height, weight, neck, waist, chest, abdomen, thigh],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Male Body Fat Estimator",
      `Body fat: ${one(result.percent)}% — ${result.bandLabel}`,
      `Fat mass: ${two(result.fatMassKg)} kg`,
      `Lean mass: ${two(result.leanMassKg)} kg`,
      `BMI: ${two(result.bmi)}`,
      ...result.alternates
        .filter((entry) => entry.available)
        .map((entry) => `${entry.label}: ${one(entry.percent)}%`),
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
    setMethod(DEFAULTS.method);
    setAge(DEFAULTS.age);
    setHeight(DEFAULTS.height);
    setWeight(DEFAULTS.weight);
    setNeck(DEFAULTS.neck);
    setWaist(DEFAULTS.waist);
    setChest(DEFAULTS.chest);
    setAbdomen(DEFAULTS.abdomen);
    setThigh(DEFAULTS.thigh);
    setCopied(false);
  };

  const rows = [
    ["Category", ok ? result.bandLabel : DASH],
    ["Fat mass", ok ? `${two(result.fatMassKg)} kg` : DASH],
    ["Lean mass", ok ? `${two(result.leanMassKg)} kg` : DASH],
    ["BMI", ok ? two(result.bmi) : DASH],
    [
      "Body density (skinfold method)",
      ok && Number.isFinite(result.bodyDensity) ? `${four(result.bodyDensity)} g/cm³` : DASH,
    ],
    ["Skinfold sum", ok && result.skinfoldSum > 0 ? `${one(result.skinfoldSum)} mm` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Men&apos;s health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Male Body Fat Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate body fat from a tape measure or a skinfold caliper. All three published equations
          are calculated side by side so you can see how far apart they land.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bf-method">
              Method to headline
            </label>
            <select
              id="bf-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {METHODS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-age">
              Age (years)
            </label>
            <input
              id="bf-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-height">
              Height (cm)
            </label>
            <input
              id="bf-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              step="0.5"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-weight">
              Weight (kg)
            </label>
            <input
              id="bf-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="300"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-neck">
              Neck circumference (cm)
            </label>
            <input
              id="bf-neck"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={neck}
              onChange={(event) => setNeck(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-waist">
              Waist at the navel (cm)
            </label>
            <input
              id="bf-waist"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={waist}
              onChange={(event) => setWaist(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-chest">
              Chest skinfold (mm)
            </label>
            <input
              id="bf-chest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={chest}
              onChange={(event) => setChest(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-abdomen">
              Abdominal skinfold (mm)
            </label>
            <input
              id="bf-abdomen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={abdomen}
              onChange={(event) => setAbdomen(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-thigh">
              Thigh skinfold (mm)
            </label>
            <input
              id="bf-thigh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={thigh}
              onChange={(event) => setThigh(event.target.value)}
            />
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated body fat
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${one(result.percent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.bandNote : "Fix the inputs above to see an estimate."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy body fat estimate"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">All three equations</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Method
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Body fat
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.alternates : []).map((entry) => (
                <tr key={entry.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    {entry.label}
                    {entry.selected ? (
                      <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                        shown above
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {entry.available ? `${one(entry.percent)}%` : DASH}
                  </td>
                </tr>
              ))}
              {ok ? null : (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={2}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">ACE categories for men</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {ACE_MALE_BANDS.map((band) => (
            <div key={band.label} className="py-2.5">
              <dt className="font-semibold">{band.label}</dt>
              <dd className="mt-0.5 text-[var(--muted-foreground)]">{band.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not a clinical measurement. Circumference and skinfold equations
        typically differ from a DXA scan by three to four percentage points, and more in very lean or
        very heavy people. Measure at the same time of day, on the right side of the body, and track
        the trend rather than a single number.
      </p>
    </main>
  );
}
