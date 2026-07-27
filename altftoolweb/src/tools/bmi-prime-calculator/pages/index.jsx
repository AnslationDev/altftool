"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Divide, RotateCcw } from "lucide-react";

import { SCHEMES, bmiPrime, feetInchesToCm, poundsToKg } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DEFAULTS = {
  unit: "metric",
  heightCm: "175",
  feet: "5",
  inches: "9",
  weightKg: "82",
  weightLb: "180",
  scheme: "who",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const DASH = "—";

/** The gauge shows BMI Prime from 0.5 to 1.8; anything outside is pinned to the ends. */
const GAUGE_MIN = 0.5;
const GAUGE_MAX = 1.8;

const toNum = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return NaN;
  const value = Number(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const toneClass = (tone) => {
  if (tone === "good") return "text-[var(--success)]";
  if (tone === "bad") return "text-[var(--danger)]";
  return "text-[var(--foreground)]";
};

const fmtPrime = (value) => (value === Infinity ? "and above" : NUM2.format(value));

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [feet, setFeet] = useState(DEFAULTS.feet);
  const [inches, setInches] = useState(DEFAULTS.inches);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [weightLb, setWeightLb] = useState(DEFAULTS.weightLb);
  const [scheme, setScheme] = useState(DEFAULTS.scheme);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const metric = unit === "metric";
    const h = metric ? toNum(heightCm) : feetInchesToCm(toNum(feet) || 0, toNum(inches) || 0);
    const w = metric ? toNum(weightKg) : poundsToKg(toNum(weightLb));
    return bmiPrime({ heightCm: h, weightKg: w, scheme });
  }, [unit, heightCm, feet, inches, weightKg, weightLb, scheme]);

  const ok = !result.error;

  const gaugePercent = ok
    ? Math.max(0, Math.min(100, ((result.primeExact - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100))
    : 0;
  const ceilingPercent = ((1 - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "BMI Prime Calculator",
      `BMI: ${NUM1.format(result.bmi)} kg/m2`,
      `BMI Prime: ${NUM2.format(result.prime)} (reference BMI ${result.reference})`,
      `Category: ${result.band.label}`,
      result.percentOver >= 0
        ? `${NUM1.format(result.percentOver)}% above the healthy ceiling`
        : `${NUM1.format(Math.abs(result.percentOver))}% below the healthy ceiling`,
      `Weight at BMI Prime 1.00: ${NUM1.format(result.ceilingKg)} kg`,
    ];
    if (result.excessKg > 0) lines.push(`Excess over that ceiling: ${NUM1.format(result.excessKg)} kg`);
    if (result.deficitKg > 0) lines.push(`Below the healthy floor by: ${NUM1.format(result.deficitKg)} kg`);
    lines.push(`Prime against 25: ${NUM2.format(result.primeWho)} · against 23: ${NUM2.format(result.primeAsia)}`);
    return lines.join("\n");
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
    setUnit(DEFAULTS.unit);
    setHeightCm(DEFAULTS.heightCm);
    setFeet(DEFAULTS.feet);
    setInches(DEFAULTS.inches);
    setWeightKg(DEFAULTS.weightKg);
    setWeightLb(DEFAULTS.weightLb);
    setScheme(DEFAULTS.scheme);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Divide className="h-4 w-4" aria-hidden="true" />
          BMI ÷ healthy ceiling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">BMI Prime Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          BMI Prime turns BMI into a ratio against the top of the healthy range. 1.00 is exactly on
          the line, 1.15 means fifteen percent over it, 0.90 means ten percent under — no bands to
          memorise.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className="text-sm font-semibold">Units</legend>
          <div className="mt-2 flex gap-2">
            {[
              ["metric", "cm / kg"],
              ["imperial", "ft-in / lb"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={unit === value}
                onClick={() => setUnit(value)}
                className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  unit === value
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {unit === "metric" ? (
            <div>
              <label className={LABEL} htmlFor="prime-height">
                Height (cm)
              </label>
              <input
                id="prime-height"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="100"
                max="250"
                step="0.5"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL} htmlFor="prime-feet">
                  Height (ft)
                </label>
                <input
                  id="prime-feet"
                  className={INPUT}
                  type="number"
                  inputMode="numeric"
                  min="3"
                  max="8"
                  step="1"
                  value={feet}
                  onChange={(event) => setFeet(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="prime-inches">
                  and (in)
                </label>
                <input
                  id="prime-inches"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="11.9"
                  step="0.5"
                  value={inches}
                  onChange={(event) => setInches(event.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="prime-weight">
              Weight ({unit === "metric" ? "kg" : "lb"})
            </label>
            <input
              id="prime-weight"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={unit === "metric" ? weightKg : weightLb}
              onChange={(event) =>
                unit === "metric" ? setWeightKg(event.target.value) : setWeightLb(event.target.value)
              }
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="prime-scheme">
              Reference range
            </label>
            <select
              id="prime-scheme"
              className={INPUT}
              value={scheme}
              onChange={(event) => setScheme(event.target.value)}
              aria-describedby="prime-scheme-help"
            >
              {Object.values(SCHEMES).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label} — divide by {item.reference}
                </option>
              ))}
            </select>
            <p id="prime-scheme-help" className="mt-1 text-xs text-[var(--muted-foreground)]">
              {(SCHEMES[scheme] ?? SCHEMES.who).note}
            </p>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              BMI Prime
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM2.format(result.prime) : DASH}
            </p>
            <p className={`mt-1 text-sm font-semibold ${ok ? toneClass(result.band.tone) : "text-[var(--muted-foreground)]"}`}>
              {ok
                ? `${result.band.label} · ${result.percentOver >= 0 ? "+" : ""}${NUM1.format(result.percentOver)}% vs the ceiling`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the BMI Prime result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              ok
                ? `BMI Prime ${NUM2.format(result.prime)} on a scale from ${GAUGE_MIN} to ${GAUGE_MAX}, where 1.00 is the healthy ceiling`
                : "BMI Prime gauge with no valid result"
            }
          >
            {ok && (
              <span
                className="block h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${gaugePercent}%` }}
              />
            )}
            <span
              className="absolute top-0 h-full w-0.5 bg-[var(--foreground)]"
              style={{ left: `${ceilingPercent}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>{NUM2.format(GAUGE_MIN)}</span>
            <span>1.00 ceiling</span>
            <span>{NUM2.format(GAUGE_MAX)}</span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["BMI", ok ? `${NUM1.format(result.bmi)} kg/m²` : DASH],
            ["Reference (healthy ceiling)", ok ? `BMI ${result.reference} — ${result.scheme.label}` : DASH],
            ["Percent of the ceiling", ok ? `${NUM1.format(result.percentOfCeiling)}%` : DASH],
            ["Weight at BMI Prime 1.00", ok ? `${NUM1.format(result.ceilingKg)} kg` : DASH],
            ["Weight at the healthy floor (BMI 18.5)", ok ? `${NUM1.format(result.floorKg)} kg` : DASH],
            [
              "Distance from the healthy range",
              !ok
                ? DASH
                : result.excessKg > 0
                  ? `${NUM1.format(result.excessKg)} kg above`
                  : result.deficitKg > 0
                    ? `${NUM1.format(result.deficitKg)} kg below`
                    : "Inside the range",
            ],
            [
              "Prime against 25 / against 23",
              ok ? `${NUM2.format(result.primeWho)} / ${NUM2.format(result.primeAsia)}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">
          BMI Prime bands — {(SCHEMES[scheme] ?? SCHEMES.who).label}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 font-semibold">BMI Prime</th>
                <th scope="col" className="py-2 font-semibold">BMI</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.bands : []).map((band) => {
                const active = ok && result.band.label === band.label;
                return (
                  <tr
                    key={band.label}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "bg-[var(--muted)]" : ""}`}
                  >
                    <td className={`py-2 pr-3 font-semibold ${active ? toneClass(band.tone) : ""}`}>
                      {band.label}
                    </td>
                    <td className="py-2 pr-3">
                      {band.primeMax === Infinity
                        ? `${fmtPrime(band.primeMin)} and above`
                        : `${fmtPrime(band.primeMin)} – ${fmtPrime(band.primeMax)}`}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {band.bmiMax === Infinity ? `${band.bmiMin}+` : `${band.bmiMin} – ${band.bmiMax}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Every boundary is the matching BMI cutoff divided by the reference, which is why 18.5, 30,
          35 and 40 become 0.74, 1.20, 1.40 and 1.60 on the WHO scale.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. BMI Prime inherits every limitation of BMI: it cannot tell muscle from
        fat, and it is not a diagnosis. Talk to a clinician before acting on a number.
      </p>
    </main>
  );
}
