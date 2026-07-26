"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// Classic clinical formulas. base = kg at 5 ft (60 in), perInch = kg added per inch above 5 ft.
const FORMULAS = [
  { id: "devine", label: "Devine (1974)", male: { base: 50.0, perInch: 2.3 }, female: { base: 45.5, perInch: 2.3 } },
  { id: "robinson", label: "Robinson (1983)", male: { base: 52.0, perInch: 1.9 }, female: { base: 49.0, perInch: 1.7 } },
  { id: "miller", label: "Miller (1983)", male: { base: 56.2, perInch: 1.41 }, female: { base: 53.1, perInch: 1.36 } },
  { id: "hamwi", label: "Hamwi (1964)", male: { base: 48.0, perInch: 2.7 }, female: { base: 45.5, perInch: 2.2 } },
];

const FRAMES = [
  { id: "small", label: "Small frame", factor: 0.9 },
  { id: "medium", label: "Medium frame", factor: 1 },
  { id: "large", label: "Large frame", factor: 1.1 },
];

const DEFAULTS = {
  unit: "metric",
  sex: "male",
  heightCm: "175",
  heightFt: "5",
  heightIn: "9",
  frame: "medium",
  currentKg: "",
  currentLb: "",
};

const oneDecimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [frame, setFrame] = useState(DEFAULTS.frame);
  const [currentKg, setCurrentKg] = useState(DEFAULTS.currentKg);
  const [currentLb, setCurrentLb] = useState(DEFAULTS.currentLb);
  const [copied, setCopied] = useState(false);

  const isMetric = unit === "metric";

  const calc = useMemo(() => {
    const cm = isMetric
      ? toNumber(heightCm)
      : (toNumber(heightFt) * 12 + (String(heightIn).trim() === "" ? 0 : toNumber(heightIn))) * 2.54;

    if (!Number.isFinite(cm) || cm < 120 || cm > 250) {
      return { error: "Enter a height between 120 cm and 250 cm (about 3 ft 11 in to 8 ft 2 in)." };
    }

    const metres = cm / 100;
    const totalInches = cm / 2.54;
    const inchesOver60 = totalInches - 60;
    const frameOption = FRAMES.find((item) => item.id === frame) || FRAMES[1];

    const rows = FORMULAS.map((item) => {
      const coeffs = item[sex];
      const raw = coeffs.base + coeffs.perInch * inchesOver60;
      const adjusted = Math.max(raw * frameOption.factor, 25);
      return { id: item.id, label: item.label, kg: adjusted };
    });

    const bmiLow = 18.5 * metres * metres;
    const bmiHigh = 24.9 * metres * metres;

    const formulaValues = rows.map((row) => row.kg);
    const average = formulaValues.reduce((sum, value) => sum + value, 0) / formulaValues.length;
    const rangeLow = Math.min(...formulaValues, bmiLow);
    const rangeHigh = Math.max(...formulaValues, bmiHigh);

    const currentRaw = isMetric ? currentKg : currentLb;
    let current = null;
    let currentError = null;
    if (String(currentRaw).trim() !== "") {
      const parsed = toNumber(currentRaw);
      const kg = isMetric ? parsed : parsed * 0.45359237;
      if (!Number.isFinite(kg) || kg < 20 || kg > 400) {
        currentError = "Current weight should be between 20 kg and 400 kg (44 lb to 880 lb).";
      } else {
        current = kg;
      }
    }

    let comparison = null;
    if (current !== null) {
      const bmi = current / (metres * metres);
      let position = "inside";
      let diff = 0;
      if (current < bmiLow) {
        position = "below";
        diff = bmiLow - current;
      } else if (current > bmiHigh) {
        position = "above";
        diff = current - bmiHigh;
      }
      comparison = { current, bmi, position, diff };
    }

    return {
      cm,
      metres,
      rows,
      bmiLow,
      bmiHigh,
      average,
      rangeLow,
      rangeHigh,
      frameLabel: frameOption.label,
      frameFactor: frameOption.factor,
      shortHeight: cm < 152.4,
      comparison,
      currentError,
    };
  }, [currentKg, currentLb, frame, heightCm, heightFt, heightIn, isMetric, sex]);

  const reset = () => {
    setUnit(DEFAULTS.unit);
    setSex(DEFAULTS.sex);
    setHeightCm(DEFAULTS.heightCm);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setFrame(DEFAULTS.frame);
    setCurrentKg(DEFAULTS.currentKg);
    setCurrentLb(DEFAULTS.currentLb);
    setCopied(false);
  };

  const showKg = (kg) => (isMetric ? `${oneDecimal.format(kg)} kg` : `${oneDecimal.format(kg / 0.45359237)} lb`);

  const copySummary = async () => {
    if (calc.error) return;
    const text = [
      "Ideal Body Weight Calculator",
      `Height: ${oneDecimal.format(calc.cm)} cm`,
      `Frame: ${calc.frameLabel}`,
      ...calc.rows.map((row) => `${row.label}: ${showKg(row.kg)}`),
      `Healthy BMI range (18.5-24.9): ${showKg(calc.bmiLow)} - ${showKg(calc.bmiHigh)}`,
      `Combined ideal range: ${showKg(calc.rangeLow)} - ${showKg(calc.rangeHigh)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Scale className="h-4 w-4" aria-hidden="true" />
            Body composition
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Ideal Body Weight Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Compare the four classic clinical formulas — Devine, Robinson, Miller and Hamwi — against the healthy
            BMI range for your height, and see a single sensible weight band instead of one arbitrary number.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your details
            </h2>

            <div className="mt-4 grid gap-4">
              <div>
                <span className="text-sm font-semibold" id="ibw-unit-label">
                  Units
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby="ibw-unit-label">
                  {[
                    { id: "metric", label: "Metric (cm / kg)" },
                    { id: "imperial", label: "Imperial (ft / lb)" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={unit === option.id}
                      onClick={() => setUnit(option.id)}
                      className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        unit === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ibw-sex" className="text-sm font-semibold">
                    Sex at birth
                  </label>
                  <select
                    id="ibw-sex"
                    value={sex}
                    onChange={(event) => setSex(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ibw-frame" className="text-sm font-semibold">
                    Body frame
                  </label>
                  <select
                    id="ibw-frame"
                    value={frame}
                    onChange={(event) => setFrame(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  >
                    {FRAMES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isMetric ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ibw-height-cm" className="text-sm font-semibold">
                      Height (cm)
                    </label>
                    <input
                      id="ibw-height-cm"
                      type="number"
                      inputMode="decimal"
                      value={heightCm}
                      onChange={(event) => setHeightCm(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ibw-current-kg" className="text-sm font-semibold">
                      Current weight (kg, optional)
                    </label>
                    <input
                      id="ibw-current-kg"
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g. 78"
                      value={currentKg}
                      onChange={(event) => setCurrentKg(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-sm font-semibold">Height</span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="ibw-height-ft" className="sr-only">
                          Height feet
                        </label>
                        <input
                          id="ibw-height-ft"
                          type="number"
                          inputMode="numeric"
                          placeholder="ft"
                          value={heightFt}
                          onChange={(event) => setHeightFt(event.target.value)}
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label htmlFor="ibw-height-in" className="sr-only">
                          Height inches
                        </label>
                        <input
                          id="ibw-height-in"
                          type="number"
                          inputMode="numeric"
                          placeholder="in"
                          value={heightIn}
                          onChange={(event) => setHeightIn(event.target.value)}
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ibw-current-lb" className="text-sm font-semibold">
                      Current weight (lb, optional)
                    </label>
                    <input
                      id="ibw-current-lb"
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g. 172"
                      value={currentLb}
                      onChange={(event) => setCurrentLb(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                </div>
              )}

              <button type="button" onClick={reset} className={GHOST_BTN_CLASS} aria-label="Reset all inputs">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {calc.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {calc.error}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Ideal weight range
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                      {showKg(calc.rangeLow)} <span className="text-[var(--muted-foreground)]">to</span>{" "}
                      {showKg(calc.rangeHigh)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Formula average {showKg(calc.average)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copySummary}
                    aria-label="Copy ideal body weight result to clipboard"
                    className={PRIMARY_BTN_CLASS}
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                <dl className="mt-5 divide-y divide-[var(--border)] rounded-md ring-1 ring-[var(--border)]">
                  {calc.rows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
                      <dt className="text-[var(--muted-foreground)]">{row.label}</dt>
                      <dd className="text-right font-semibold">{showKg(row.kg)}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
                    <dt className="text-[var(--muted-foreground)]">Healthy BMI 18.5 - 24.9</dt>
                    <dd className="text-right font-semibold">
                      {showKg(calc.bmiLow)} - {showKg(calc.bmiHigh)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
                    <dt className="text-[var(--muted-foreground)]">Frame adjustment</dt>
                    <dd className="text-right font-semibold">
                      {calc.frameLabel} ({calc.frameFactor === 1 ? "no change" : `x ${calc.frameFactor}`})
                    </dd>
                  </div>
                </dl>

                {calc.currentError && (
                  <p
                    role="alert"
                    className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                  >
                    {calc.currentError}
                  </p>
                )}

                {calc.comparison && (
                  <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Against your current weight
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      At {showKg(calc.comparison.current)} your BMI is{" "}
                      <span className="font-semibold">{oneDecimal.format(calc.comparison.bmi)}</span>.{" "}
                      {calc.comparison.position === "inside" ? (
                        <span className="font-semibold text-[var(--success)]">
                          You are already inside the healthy BMI range for your height.
                        </span>
                      ) : calc.comparison.position === "above" ? (
                        <span>
                          That is {showKg(calc.comparison.diff)} above the top of the healthy BMI range.
                        </span>
                      ) : (
                        <span>
                          That is {showKg(calc.comparison.diff)} below the bottom of the healthy BMI range.
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {calc.shortHeight && (
                  <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                    Devine, Robinson, Miller and Hamwi were built around heights of 5 ft and above. Below that they
                    are extrapolations — lean on the BMI range instead.
                  </p>
                )}

                <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  These formulas were designed for clinical drug dosing and population screening, not as a personal
                  goal weight. They ignore muscle mass, bone density and body composition, so a muscular athlete can
                  sit well above the range and still be healthy. This is general information, not medical advice.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
