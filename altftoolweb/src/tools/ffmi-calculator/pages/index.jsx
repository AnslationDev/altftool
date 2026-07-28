"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";
import {
  FFMI_BANDS_FEMALE,
  FFMI_BANDS_MALE,
  computeFfmi,
  feetInchesToCm,
  poundsToKg,
} from "../lib";

const N1 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const idx = (value) => (Number.isFinite(value) ? N2.format(value) : "—");
const kg = (value) => (Number.isFinite(value) ? `${N1.format(value)} kg` : "—");

const DEFAULTS = {
  units: "metric",
  sex: "male",
  weightKg: "80",
  heightCm: "180",
  weightLb: "176",
  heightFt: "5",
  heightIn: "11",
  bodyFatPct: "15",
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
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [units, setUnits] = useState(DEFAULTS.units);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [bodyFatPct, setBodyFatPct] = useState(DEFAULTS.bodyFatPct);
  const [copied, setCopied] = useState(false);

  const metric = units === "metric";

  const result = useMemo(() => {
    const w = metric ? toNumber(weightKg) : poundsToKg(toNumber(weightLb));
    const h = metric ? toNumber(heightCm) : feetInchesToCm(toNumber(heightFt), toNumber(heightIn));
    return computeFfmi({ weightKg: w, heightCm: h, bodyFatPct: toNumber(bodyFatPct), sex });
  }, [metric, weightKg, heightCm, weightLb, heightFt, heightIn, bodyFatPct, sex]);

  const bands = sex === "female" ? FFMI_BANDS_FEMALE : FFMI_BANDS_MALE;
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "FFMI Calculator",
      `Lean (fat-free) mass: ${kg(result.leanMassKg)}`,
      `Fat mass: ${kg(result.fatMassKg)}`,
      `FFMI: ${idx(result.ffmi)}`,
      `Height-normalised FFMI: ${idx(result.normalisedFfmi)}`,
      `Interpretation: ${result.band}`,
      `Drug-free ceiling used: ${result.ceiling}`,
      `Lean mass at that ceiling: ${kg(result.ceilingLeanMassKg)}`,
      `BMI for comparison: ${idx(result.bmi)}`,
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
    setUnits(DEFAULTS.units);
    setSex(DEFAULTS.sex);
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setWeightLb(DEFAULTS.weightLb);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setBodyFatPct(DEFAULTS.bodyFatPct);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Body composition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">FFMI Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          FFMI measures how much lean mass you carry for your height — the number BMI cannot give a
          lifter. The normalised version adjusts every result to a 1.8 m reference height so tall and
          short lifters can be compared on the same scale.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["metric", "Metric (kg / cm)"],
            ["imperial", "Imperial (lb / ft)"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setUnits(value)}
              aria-pressed={units === value}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                units === value
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {metric ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ffmi-weight-kg">
                  Weight (kg)
                </label>
                <input
                  id="ffmi-weight-kg"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="20"
                  max="300"
                  step="0.5"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ffmi-height-cm">
                  Height (cm)
                </label>
                <input
                  id="ffmi-height-cm"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="100"
                  max="250"
                  step="0.5"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ffmi-weight-lb">
                  Weight (lb)
                </label>
                <input
                  id="ffmi-weight-lb"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="44"
                  max="660"
                  step="1"
                  value={weightLb}
                  onChange={(event) => setWeightLb(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor="ffmi-height-ft">
                    Height (ft)
                  </label>
                  <input
                    id="ffmi-height-ft"
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="3"
                    max="8"
                    step="1"
                    value={heightFt}
                    onChange={(event) => setHeightFt(event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="ffmi-height-in">
                    Height (in)
                  </label>
                  <input
                    id="ffmi-height-in"
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="11"
                    step="1"
                    value={heightIn}
                    onChange={(event) => setHeightIn(event.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="ffmi-bodyfat">
              Body fat (%)
            </label>
            <input
              id="ffmi-bodyfat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="70"
              step="0.5"
              value={bodyFatPct}
              onChange={(event) => setBodyFatPct(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ffmi-sex">
              Reference scale
            </label>
            <select
              id="ffmi-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Male bands (ceiling 25)</option>
              <option value="female">Female bands (ceiling 22)</option>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Height-normalised FFMI
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? idx(result.normalisedFfmi) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.band} — ${result.bandNote}` : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy FFMI result"
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
            ["Raw FFMI (lean mass / height squared)", ok ? idx(result.ffmi) : "—"],
            ["Fat-free (lean) mass", ok ? kg(result.leanMassKg) : "—"],
            ["Fat mass", ok ? kg(result.fatMassKg) : "—"],
            ["BMI for comparison", ok ? idx(result.bmi) : "—"],
            ["Drug-free ceiling used", ok ? idx(result.ceiling) : "—"],
            ["Lean mass at that ceiling", ok ? kg(result.ceilingLeanMassKg) : "—"],
            [
              "Lean mass headroom",
              ok
                ? result.leanMassHeadroomKg >= 0
                  ? `${kg(result.leanMassHeadroomKg)} to go`
                  : `${kg(Math.abs(result.leanMassHeadroomKg))} above it`
                : "—",
            ],
            [
              "Scale weight at the ceiling (same body fat)",
              ok ? kg(result.ceilingScaleWeightKg) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          {sex === "female" ? "Female" : "Male"} interpretation bands
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Normalised FFMI
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What it means
                </th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band, i) => {
                const next = bands[i + 1];
                const range = Number.isFinite(band.min)
                  ? `${band.min}${next ? ` – ${next.min}` : "+"}`
                  : `under ${bands[1].min}`;
                const active = ok && result.band === band.label;
                return (
                  <tr
                    key={band.label}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      active ? "bg-[var(--muted)] font-semibold" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 whitespace-nowrap">{range}</td>
                    <td className="py-2 pr-3">{band.label}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        FFMI is only as accurate as the body fat figure you feed it — a caliper or scale reading can
        be several percentage points out, which moves FFMI by more than a full point. Informational
        only; it is not a test for anabolic steroid use and not a substitute for medical assessment.
      </p>
    </main>
  );
}
