"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hand, RotateCcw } from "lucide-react";

import { AGE_REFERENCE, SEXES, benchmarkGrip } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);
const two = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);

const DEFAULTS = {
  sex: "male",
  age: "45",
  dominant: "44",
  nonDominant: "40",
  bmi: "26",
};

const AGE_BAND_LABELS = ["18–29", "30–39", "40–49", "50–59", "60–69", "70–79", "80+"];

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
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [dominant, setDominant] = useState(DEFAULTS.dominant);
  const [nonDominant, setNonDominant] = useState(DEFAULTS.nonDominant);
  const [bmi, setBmi] = useState(DEFAULTS.bmi);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      benchmarkGrip({
        sex,
        age: toNumber(age),
        dominantKg: toNumber(dominant),
        nonDominantKg: toNumber(nonDominant),
        bmi: toNumber(bmi),
      }),
    [sex, age, dominant, nonDominant, bmi],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Grip Strength Benchmark",
      `Best reading: ${one(result.best)} kg (${one(result.bestPounds)} lb)`,
      `Verdict: ${result.verdict}`,
      `Typical range for this age and sex: ${zero(result.rangeLow)}–${zero(result.rangeHigh)} kg`,
      `Percent of the range midpoint: ${zero(result.percentOfTypical)}%`,
      ...result.cutoffs.map(
        (entry) => `${entry.name}: cut-off ${zero(entry.threshold)} kg — ${entry.passes ? "met" : "not met"}`,
      ),
      result.hasBothHands ? `Left/right difference: ${one(result.asymmetryPercent)}%` : "",
      result.hasBmi ? `Grip divided by BMI: ${two(result.relativeGrip)}` : "",
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
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setDominant(DEFAULTS.dominant);
    setNonDominant(DEFAULTS.nonDominant);
    setBmi(DEFAULTS.bmi);
    setCopied(false);
  };

  const rows = [
    ["Best reading", ok ? `${one(result.best)} kg` : DASH],
    ["Same reading in pounds", ok ? `${one(result.bestPounds)} lb` : DASH],
    ["Same reading in newtons", ok ? `${zero(result.bestNewtons)} N` : DASH],
    [
      "Typical range for your age and sex",
      ok ? `${zero(result.rangeLow)}–${zero(result.rangeHigh)} kg` : DASH,
    ],
    ["Percent of that range midpoint", ok ? `${zero(result.percentOfTypical)}%` : DASH],
    [
      "Left/right difference",
      ok && result.hasBothHands
        ? `${one(result.asymmetryPercent)}%${result.asymmetryFlag ? ` — over the ${zero(result.asymmetryThreshold)}% mark` : ""}`
        : DASH,
    ],
    ["Grip ÷ BMI", ok && result.hasBmi ? two(result.relativeGrip) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hand className="h-4 w-4" aria-hidden="true" />
          Men&apos;s health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Grip Strength Benchmark Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your best hand dynamometer readings to see how they sit against the EWGSOP2, AWGS and
          FNIH low-strength cut-offs and the usual range for your age and sex.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-sex">
              Sex (reference values differ)
            </label>
            <select
              id="gs-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              {SEXES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-age">
              Age (years)
            </label>
            <input
              id="gs-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="110"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-dominant">
              Dominant hand, best of 3 (kg)
            </label>
            <input
              id="gs-dominant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="150"
              step="0.5"
              value={dominant}
              onChange={(event) => setDominant(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-nondominant">
              Other hand, best of 3 (kg, 0 to skip)
            </label>
            <input
              id="gs-nondominant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="150"
              step="0.5"
              value={nonDominant}
              onChange={(event) => setNonDominant(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gs-bmi">
              BMI (optional, for relative grip)
            </label>
            <input
              id="gs-bmi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={bmi}
              onChange={(event) => setBmi(event.target.value)}
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
              Best grip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${one(result.best)} kg` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.verdict} — ${result.verdictNote}` : "Fix the inputs above to see a benchmark."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy grip strength benchmark"
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
        <h2 className="text-base font-semibold">Published low-strength cut-offs</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Criterion
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Cut-off
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Your margin
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.cutoffs : []).map((entry) => (
                <tr key={entry.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{entry.name}</td>
                  <td className="py-2 pr-3 text-right">{zero(entry.threshold)} kg</td>
                  <td
                    className={`py-2 text-right font-semibold ${entry.passes ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                  >
                    {entry.margin >= 0 ? "+" : ""}
                    {one(entry.margin)} kg
                  </td>
                </tr>
              ))}
              {ok ? null : (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Typical range by age band</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          Ranges of mean maximum grip, in kilograms. Published norms vary between cohorts and
          instruments, so these are an orientation rather than a boundary.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Age
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Men
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Women
                </th>
              </tr>
            </thead>
            <tbody>
              {AGE_BAND_LABELS.map((label, index) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{label}</td>
                  <td className="py-2 pr-3 text-right">
                    {AGE_REFERENCE.male[index].low}–{AGE_REFERENCE.male[index].high} kg
                  </td>
                  <td className="py-2 text-right">
                    {AGE_REFERENCE.female[index].low}–{AGE_REFERENCE.female[index].high} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a diagnosis. Grip strength is one of three components of a sarcopenia
        assessment, alongside muscle mass and physical performance; a low reading needs a clinician,
        not a web page. Measure seated with the elbow at 90 degrees, take the best of three squeezes
        per hand, and use the same dynamometer each time.
      </p>
    </main>
  );
}
