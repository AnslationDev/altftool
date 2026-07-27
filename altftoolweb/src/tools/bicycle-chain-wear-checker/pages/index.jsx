"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import {
  CASSETTE_RISK_PCT,
  CHAINRING_RISK_PCT,
  DEFAULT_PITCHES,
  DRIVETRAINS,
  checkChainWear,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM3 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const KM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
const num3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : DASH);
const km = (v) => (Number.isFinite(v) ? `${KM.format(v)} km` : DASH);

const DEFAULTS = {
  measured: "12.06",
  unit: "in",
  pitches: String(DEFAULT_PITCHES),
  drivetrain: "11-speed",
  kmRidden: "3000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
  "replace-chain": "bg-[var(--warning-soft)] text-[var(--warning)]",
  "replace-chain-cassette": "bg-[var(--danger-soft)] text-[var(--danger)]",
  "replace-drivetrain": "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const STATUS_LABEL = {
  ok: "Within spec",
  "replace-chain": "Replace the chain",
  "replace-chain-cassette": "Chain + cassette",
  "replace-drivetrain": "Full drivetrain check",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [measured, setMeasured] = useState(DEFAULTS.measured);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [pitches, setPitches] = useState(DEFAULTS.pitches);
  const [drivetrain, setDrivetrain] = useState(DEFAULTS.drivetrain);
  const [kmRidden, setKmRidden] = useState(DEFAULTS.kmRidden);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkChainWear({
        measured: toNumber(measured),
        unit,
        pitches: toNumber(pitches),
        drivetrain,
        kmRidden: toNumber(kmRidden),
      }),
    [measured, unit, pitches, drivetrain, kmRidden],
  );

  const failed = Boolean(result.error);
  const drivetrainLabel =
    DRIVETRAINS.find((item) => item.id === drivetrain)?.label ?? drivetrain;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Bicycle Chain Wear Checker",
      `Drivetrain: ${drivetrainLabel}`,
      `Measured: ${num3(result.measuredIn)} in over ${result.pitches} rivet pitches (new = ${num3(result.nominalIn)} in)`,
      `Chain elongation: ${num2(result.wearPct)}%`,
      `Replacement threshold: ${num2(result.threshold)}%`,
      `Wear budget left: ${num2(result.budgetLeftPct)} percentage points`,
      result.remainingKm === null
        ? "Estimated life left: not enough data"
        : `Estimated life left: ${km(result.remainingKm)}`,
      `Verdict: ${result.verdict}`,
    ].join("\n");
  }, [failed, drivetrainLabel, result]);

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
    setMeasured(DEFAULTS.measured);
    setUnit(DEFAULTS.unit);
    setPitches(DEFAULTS.pitches);
    setDrivetrain(DEFAULTS.drivetrain);
    setKmRidden(DEFAULTS.kmRidden);
    setCopied(false);
  };

  const gaugeWidth = failed
    ? 0
    : Math.max(0, Math.min(100, result.percentOfThreshold));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Drivetrain
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bicycle Chain Wear Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay a steel ruler along the chain, line the zero mark up with the centre of one rivet and
          read the distance to the rivet 24 pitches away. A new chain measures exactly 12 inches;
          anything extra is wear.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-measured">
              Measured length
            </label>
            <input
              id="chain-measured"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={measured}
              onChange={(event) => setMeasured(event.target.value)}
            />
            <p className={HINT_CLASS}>Rivet centre to rivet centre, chain under light tension.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-unit">
              Measurement unit
            </label>
            <select
              id="chain-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="in">Inches</option>
              <option value="mm">Millimetres</option>
            </select>
            <p className={HINT_CLASS}>24 pitches = 12.000 in = 304.80 mm when new.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-pitches">
              Rivet pitches spanned
            </label>
            <input
              id="chain-pitches"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="12"
              max="48"
              step="1"
              value={pitches}
              onChange={(event) => setPitches(event.target.value)}
            />
            <p className={HINT_CLASS}>24 is the standard 12-inch check. Longer spans read finer.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-drivetrain">
              Drivetrain
            </label>
            <select
              id="chain-drivetrain"
              className={`mt-2 ${INPUT_CLASS}`}
              value={drivetrain}
              onChange={(event) => setDrivetrain(event.target.value)}
            >
              {DRIVETRAINS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — replace at {item.threshold}%
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="chain-km">
              Distance ridden on this chain (km, optional)
            </label>
            <input
              id="chain-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={kmRidden}
              onChange={(event) => setKmRidden(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Leave at 0 if you do not track it — the wear reading still works.
            </p>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Chain elongation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num2(result.wearPct)}%`}
            </p>
            <p className="mt-2">
              {failed ? (
                <span className="text-sm text-[var(--muted-foreground)]">
                  Fix the measurement above to see a verdict.
                </span>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[result.status]}`}
                >
                  {STATUS_LABEL[result.status]}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy chain wear result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{result.verdict}</p>
        )}

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              failed
                ? "No wear reading available"
                : `Chain has used ${num2(result.percentOfThreshold)} percent of its wear allowance`
            }
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${gaugeWidth}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {failed
              ? DASH
              : `${num2(result.percentOfThreshold)}% of the ${num2(result.threshold)}% allowance for a ${drivetrainLabel} chain has been used.`}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Measured span", failed ? DASH : `${num3(result.measuredIn)} in / ${num2(result.measuredMm)} mm`],
            ["Same span on a new chain", failed ? DASH : `${num3(result.nominalIn)} in / ${num2(result.nominalMm)} mm`],
            ["Extra length (stretch)", failed ? DASH : `${num3(result.elongationIn)} in / ${num2(result.elongationMm)} mm`],
            ["Replacement threshold", failed ? DASH : `${num2(result.threshold)}%`],
            ["Wear allowance left", failed ? DASH : `${num2(result.budgetLeftPct)} percentage points`],
            [
              "Wear rate",
              failed || result.wearPer1000Km === null
                ? DASH
                : `${num3(result.wearPer1000Km)}% per 1,000 km`,
            ],
            [
              "Projected chain life",
              failed || result.chainLifeKm === null ? DASH : km(result.chainLifeKm),
            ],
            [
              "Distance left before replacement",
              failed || result.remainingKm === null ? DASH : km(result.remainingKm),
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
        <h2 className="text-base font-semibold">What each reading means</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Elongation
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What to do
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Under 0.50%", "Nothing. Clean and lubricate as usual."],
                ["0.50%", "Replace an 11- or 12-speed chain now."],
                [`${CASSETTE_RISK_PCT.toFixed(2)}%`, "Replace any chain. Cassette is usually worn to match."],
                [`${CHAINRING_RISK_PCT.toFixed(2)}% and over`, "Chain and cassette together; inspect chainrings for hooked teeth."],
              ].map(([band, action]) => (
                <tr key={band} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{band}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A ruler reading is only as good as the ruler. Cheap plastic rules and worn tape measures
        drift by more than the 0.06 in that separates a healthy chain from a worn one — use a steel
        rule, or confirm with a go/no-go chain gauge before spending money on parts.
      </p>
    </main>
  );
}
