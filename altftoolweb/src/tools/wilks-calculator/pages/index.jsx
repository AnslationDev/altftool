"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  calculateScores,
  coefficientTable,
  equivalentTotal,
  IPF_EVENTS,
  IPF_GL_REFERENCE,
  kgToLb,
  lbToKg,
} from "../lib";

const DEFAULTS = {
  unit: "kg",
  sex: "male",
  event: "raw-total",
  bodyweight: "83",
  mode: "lifts",
  squat: "220",
  bench: "140",
  deadlift: "250",
  total: "610",
  targetBodyweight: "93",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM4 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const one = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const two = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
const four = (v) => (Number.isFinite(v) ? NUM4.format(v) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [event, setEvent] = useState(DEFAULTS.event);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [bodyweight, setBodyweight] = useState(DEFAULTS.bodyweight);
  const [squat, setSquat] = useState(DEFAULTS.squat);
  const [bench, setBench] = useState(DEFAULTS.bench);
  const [deadlift, setDeadlift] = useState(DEFAULTS.deadlift);
  const [total, setTotal] = useState(DEFAULTS.total);
  const [targetBodyweight, setTargetBodyweight] = useState(DEFAULTS.targetBodyweight);
  const [copied, setCopied] = useState(false);

  const inKg = (value) => (unit === "lb" ? lbToKg(toNumber(value)) : toNumber(value));
  const showWeight = (kg) => (unit === "lb" ? `${one(kgToLb(kg))} lb` : `${one(kg)} kg`);

  const result = useMemo(() => {
    const benchOnly = event.endsWith("bench");
    if (benchOnly) {
      return calculateScores({
        bodyweightKg: inKg(bodyweight),
        totalKg: inKg(mode === "lifts" ? bench : total),
        sex,
        event,
      });
    }
    if (mode === "lifts") {
      return calculateScores({
        bodyweightKg: inKg(bodyweight),
        squatKg: inKg(squat),
        benchKg: inKg(bench),
        deadliftKg: inKg(deadlift),
        sex,
        event,
      });
    }
    return calculateScores({ bodyweightKg: inKg(bodyweight), totalKg: inKg(total), sex, event });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, sex, event, mode, bodyweight, squat, bench, deadlift, total]);

  const equivalent = useMemo(() => {
    if (result.error) return { error: result.error };
    return equivalentTotal({ wilksScore: result.wilksScore, targetBodyweightKg: inKg(targetBodyweight), sex });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, targetBodyweight, sex, unit]);

  const table = useMemo(() => coefficientTable(sex, sex === "female" ? 45 : 55, sex === "female" ? 115 : 145, 10), [sex]);

  const error = result.error || null;

  function reset() {
    setUnit(DEFAULTS.unit);
    setSex(DEFAULTS.sex);
    setEvent(DEFAULTS.event);
    setMode(DEFAULTS.mode);
    setBodyweight(DEFAULTS.bodyweight);
    setSquat(DEFAULTS.squat);
    setBench(DEFAULTS.bench);
    setDeadlift(DEFAULTS.deadlift);
    setTotal(DEFAULTS.total);
    setTargetBodyweight(DEFAULTS.targetBodyweight);
    setCopied(false);
  }

  async function copyResult() {
    if (error) return;
    const lines = [
      `Wilks score: ${two(result.wilksScore)} (coefficient ${four(result.wilksCoefficient)})`,
      `DOTS: ${two(result.dotsScore)}`,
      `IPF GL points: ${two(result.ipfGlPoints)}`,
      `Total ${showWeight(result.totalKg)} at ${showWeight(result.bodyweightKg)} bodyweight`,
      `Strength to weight: ${two(result.strengthToWeight)}x bodyweight`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const benchOnly = event.endsWith("bench");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Dumbbell className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Wilks Calculator
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Bodyweight-adjusted powerlifting scores: Wilks (1994), DOTS (2019) and IPF GL Points (2020).
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wk-unit">
                Units
              </label>
              <select id="wk-unit" className={`mt-1 ${INPUT_CLASS}`} value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="kg">Kilograms</option>
                <option value="lb">Pounds</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wk-sex">
                Coefficient set
              </label>
              <select id="wk-sex" className={`mt-1 ${INPUT_CLASS}`} value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Men</option>
                <option value="female">Women</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wk-event">
                IPF event (for GL points)
              </label>
              <select id="wk-event" className={`mt-1 ${INPUT_CLASS}`} value={event} onChange={(e) => setEvent(e.target.value)}>
                {IPF_EVENTS.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wk-bodyweight">
                Bodyweight ({unit})
              </label>
              <input id="wk-bodyweight" className={`mt-1 ${INPUT_CLASS}`} value={bodyweight} onChange={(e) => setBodyweight(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wk-mode">
                Enter lifts as
              </label>
              <select id="wk-mode" className={`mt-1 ${INPUT_CLASS}`} value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="lifts">Individual lifts</option>
                <option value="total">One total</option>
              </select>
            </div>

            {mode === "lifts" && !benchOnly ? (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor="wk-squat">
                    Squat ({unit})
                  </label>
                  <input id="wk-squat" className={`mt-1 ${INPUT_CLASS}`} value={squat} onChange={(e) => setSquat(e.target.value)} inputMode="decimal" />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="wk-bench">
                    Bench press ({unit})
                  </label>
                  <input id="wk-bench" className={`mt-1 ${INPUT_CLASS}`} value={bench} onChange={(e) => setBench(e.target.value)} inputMode="decimal" />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="wk-deadlift">
                    Deadlift ({unit})
                  </label>
                  <input id="wk-deadlift" className={`mt-1 ${INPUT_CLASS}`} value={deadlift} onChange={(e) => setDeadlift(e.target.value)} inputMode="decimal" />
                </div>
              </>
            ) : null}

            {mode === "lifts" && benchOnly ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="wk-bench-only">
                  Bench press ({unit})
                </label>
                <input id="wk-bench-only" className={`mt-1 ${INPUT_CLASS}`} value={bench} onChange={(e) => setBench(e.target.value)} inputMode="decimal" />
              </div>
            ) : null}

            {mode === "total" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="wk-total">
                  {benchOnly ? `Bench (${unit})` : `Total (${unit})`}
                </label>
                <input id="wk-total" className={`mt-1 ${INPUT_CLASS}`} value={total} onChange={(e) => setTotal(e.target.value)} inputMode="decimal" />
              </div>
            ) : null}

            <div>
              <label className={LABEL_CLASS} htmlFor="wk-target-bw">
                Compare at bodyweight ({unit})
              </label>
              <input id="wk-target-bw" className={`mt-1 ${INPUT_CLASS}`} value={targetBodyweight} onChange={(e) => setTargetBodyweight(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={PRIMARY_BTN} onClick={copyResult} aria-label="Copy the Wilks, DOTS and IPF GL scores to the clipboard">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all fields to their defaults">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            {error ? (
              <p className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {error}
              </p>
            ) : null}
            <p className="text-sm text-[var(--muted-foreground)]">Wilks score</p>
            <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {error ? DASH : two(result.wilksScore)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `${showWeight(result.totalKg)} total × coefficient ${four(result.wilksCoefficient)}`}
            </p>

            <dl className="mt-4">
              <Row label="DOTS score" value={error ? DASH : two(result.dotsScore)} />
              <Row label="DOTS coefficient" value={error ? DASH : four(result.dotsCoefficient)} />
              <Row label="IPF GL points" value={error ? DASH : two(result.ipfGlPoints)} />
              <Row label="Total" value={error ? DASH : showWeight(result.totalKg)} />
              <Row label="Strength to weight" value={error ? DASH : `${two(result.strengthToWeight)}× bodyweight`} />
              <Row label="Squat share of total" value={error || result.squatShare === null ? DASH : `${one(result.squatShare)}%`} />
              <Row label="Bench share of total" value={error || result.benchShare === null ? DASH : `${one(result.benchShare)}%`} />
              <Row label="Deadlift share of total" value={error || result.deadliftShare === null ? DASH : `${one(result.deadliftShare)}%`} />
            </dl>

            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              IPF GL points are scaled so a world-class performance sits near {IPF_GL_REFERENCE}.
            </p>

            {!error && result.extrapolated ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {result.bodyweightKg} kg is outside the {result.fittedRange.min}–{result.fittedRange.max} kg range these curves were fitted on, so the score is an
                extrapolation.
              </p>
            ) : null}
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Same Wilks at a different bodyweight</h2>
            {equivalent.error ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {equivalent.error}
              </p>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">{showWeight(equivalent.totalKg)}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  the total you would need at {targetBodyweight} {unit} to hold a Wilks of {two(result.wilksScore)}
                </p>
              </>
            )}
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Coefficients by bodyweight ({sex === "male" ? "men" : "women"})</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[300px] text-sm">
                <thead className="text-left text-[var(--muted-foreground)]">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-medium">Bodyweight</th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">Wilks</th>
                    <th scope="col" className="py-2 text-right font-medium">DOTS</th>
                  </tr>
                </thead>
                <tbody>
                  {(table.rows ?? []).map((row) => (
                    <tr key={row.bodyweightKg} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-3 text-[var(--foreground)]">{row.bodyweightKg} kg</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-[var(--foreground)]">{four(row.wilks)}</td>
                      <td className="py-2 text-right tabular-nums text-[var(--foreground)]">{four(row.dots)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
