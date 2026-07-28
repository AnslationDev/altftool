"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Dumbbell, RotateCcw } from "lucide-react";
import {
  BARS,
  DUMBBELL_STEPS_KG,
  EXERCISES,
  barbellToDumbbell,
  dumbbellToBarbell,
  kgToLb,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  barbell: "80",
  dumbbell: "30",
  exercise: "bench",
  bar: "olympic",
  step: "2.5",
  plateStep: "1.25",
};

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [mode, setMode] = useState("barbell-to-dumbbell");
  const [barbell, setBarbell] = useState(DEFAULTS.barbell);
  const [dumbbell, setDumbbell] = useState(DEFAULTS.dumbbell);
  const [exerciseId, setExerciseId] = useState(DEFAULTS.exercise);
  const [barId, setBarId] = useState(DEFAULTS.bar);
  const [step, setStep] = useState(DEFAULTS.step);
  const [plateStep, setPlateStep] = useState(DEFAULTS.plateStep);
  const [showLb, setShowLb] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "barbell-to-dumbbell") {
      return barbellToDumbbell({
        barbellTotalKg: toNumber(barbell),
        exerciseId,
        stepKg: toNumber(step),
      });
    }
    return dumbbellToBarbell({
      dumbbellEachKg: toNumber(dumbbell),
      exerciseId,
      barId,
      plateStepKg: toNumber(plateStep),
    });
  }, [mode, barbell, dumbbell, exerciseId, barId, step, plateStep]);

  const failed = Boolean(result.error);

  const weight = (kg) => {
    if (!Number.isFinite(kg)) return DASH;
    return showLb ? `${NUM.format(kgToLb(kg))} lb` : `${NUM.format(kg)} kg`;
  };

  const headline = failed
    ? DASH
    : mode === "barbell-to-dumbbell"
      ? weight(result.eachRoundedKg)
      : weight(result.barbellTotalKg);

  const summary = useMemo(() => {
    if (failed) return "";
    if (mode === "barbell-to-dumbbell") {
      return [
        "Dumbbell to Barbell Load Converter",
        `Exercise: ${result.exercise.label}`,
        `Barbell total (bar included): ${weight(result.barbellTotalKg)}`,
        `Equivalent dumbbells: ${weight(result.eachRoundedKg)} each (${weight(result.pairTotalKg)} for the pair)`,
        `Working range: ${weight(result.eachLowKg)} to ${weight(result.eachHighKg)} per hand`,
        `Conversion factor used: ${Math.round(result.factor * 100)}% of the barbell load`,
      ].join("\n");
    }
    return [
      "Dumbbell to Barbell Load Converter",
      `Exercise: ${result.exercise.label}`,
      `Dumbbells: ${weight(result.dumbbellEachKg)} each (${weight(result.pairTotalKg)} pair)`,
      `Equivalent barbell total: ${weight(result.barbellTotalKg)} on a ${result.bar.label}`,
      result.barTooHeavy
        ? "The bar alone already exceeds this load."
        : `Plates per side: ${weight(result.perSideRoundedKg)}`,
      `Working range: ${weight(result.barbellLowKg)} to ${weight(result.barbellHighKg)} total`,
    ].join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed, mode, result, showLb]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode("barbell-to-dumbbell");
    setBarbell(DEFAULTS.barbell);
    setDumbbell(DEFAULTS.dumbbell);
    setExerciseId(DEFAULTS.exercise);
    setBarId(DEFAULTS.bar);
    setStep(DEFAULTS.step);
    setPlateStep(DEFAULTS.plateStep);
    setShowLb(false);
    setCopied(false);
  };

  const rows = failed
    ? []
    : mode === "barbell-to-dumbbell"
      ? [
          ["Exact figure per hand", weight(result.eachKg)],
          ["Pair total", weight(result.pairTotalKg)],
          ["Conservative end of the range", weight(result.eachLowKg)],
          ["Optimistic end of the range", weight(result.eachHighKg)],
          ["Factor used", `${Math.round(result.factor * 100)}% of barbell load`],
          ["Rounded to your dumbbells", weight(result.eachRoundedKg)],
        ]
      : [
          ["Dumbbell pair total", weight(result.pairTotalKg)],
          ["Bar weight", weight(result.bar.weightKg)],
          [
            "Plate load on the bar",
            result.barTooHeavy ? "Bar alone is heavier" : weight(result.plateLoadKg),
          ],
          [
            "Plates per side",
            result.barTooHeavy ? DASH : `${weight(result.perSideRoundedKg)} (exact ${weight(result.perSideKg)})`,
          ],
          ["Conservative end of the range", weight(result.barbellLowKg)],
          ["Optimistic end of the range", weight(result.barbellHighKg)],
        ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Gym programming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dumbbell to Barbell Load Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A pair of dumbbells never matches a barbell kilo for kilo. Pick the lift and this converts
          between the two using an exercise-specific factor, with a realistic range and rounding to
          the equipment you actually have.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("barbell-to-dumbbell")}
            aria-pressed={mode === "barbell-to-dumbbell"}
            className={mode === "barbell-to-dumbbell" ? PRIMARY_BTN : GHOST_BTN}
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Barbell to dumbbells
          </button>
          <button
            type="button"
            onClick={() => setMode("dumbbell-to-barbell")}
            aria-pressed={mode === "dumbbell-to-barbell"}
            className={mode === "dumbbell-to-barbell" ? PRIMARY_BTN : GHOST_BTN}
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Dumbbells to barbell
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="load-exercise">
              Exercise
            </label>
            <select
              id="load-exercise"
              className={`mt-2 ${INPUT_CLASS}`}
              value={exerciseId}
              onChange={(event) => setExerciseId(event.target.value)}
            >
              {EXERCISES.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "barbell-to-dumbbell" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="load-barbell">
                  Barbell total including the bar (kg)
                </label>
                <input
                  id="load-barbell"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="2.5"
                  value={barbell}
                  onChange={(event) => setBarbell(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="load-step">
                  Dumbbell increment available (kg)
                </label>
                <select
                  id="load-step"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={step}
                  onChange={(event) => setStep(event.target.value)}
                >
                  {DUMBBELL_STEPS_KG.map((value) => (
                    <option key={value} value={String(value)}>
                      {value} kg steps
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="load-dumbbell">
                  Weight of one dumbbell (kg)
                </label>
                <input
                  id="load-dumbbell"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={dumbbell}
                  onChange={(event) => setDumbbell(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="load-bar">
                  Bar you will use
                </label>
                <select
                  id="load-bar"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={barId}
                  onChange={(event) => setBarId(event.target.value)}
                >
                  {BARS.map((bar) => (
                    <option key={bar.id} value={bar.id}>
                      {bar.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="load-plate-step">
                  Smallest plate pair you own (kg)
                </label>
                <input
                  id="load-plate-step"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0.25"
                  step="0.25"
                  value={plateStep}
                  onChange={(event) => setPlateStep(event.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowLb((value) => !value)}
            aria-pressed={showLb}
            className={GHOST_BTN}
          >
            Show in {showLb ? "kilograms" : "pounds"}
          </button>
        </div>
      </section>

      {failed ? (
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
              {mode === "barbell-to-dumbbell" ? "Dumbbell weight per hand" : "Equivalent barbell total"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Enter a valid load above."
                : mode === "barbell-to-dumbbell"
                  ? `Two dumbbells of this size, ${weight(result.pairTotalKg)} in total`
                  : result.barTooHeavy
                    ? "The bar alone already weighs more than this — use a lighter bar."
                    : `${result.bar.label} plus ${weight(result.perSideRoundedKg)} per side`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted load" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [
                ["Exact figure", DASH],
                ["Working range", DASH],
                ["Factor used", DASH],
              ]
            : rows
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.exercise.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Conversion factors by exercise</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Factor = weight of the dumbbell pair divided by the total barbell load.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Exercise</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Typical</th>
                <th scope="col" className="py-2 text-right font-semibold">Range</th>
              </tr>
            </thead>
            <tbody>
              {EXERCISES.map((exercise) => (
                <tr
                  key={exercise.id}
                  className={`border-b border-[var(--border)] last:border-0 ${exercise.id === exerciseId ? "text-[var(--primary)]" : ""}`}
                >
                  <td className="py-2 pr-3 font-semibold">{exercise.label}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{Math.round(exercise.mid * 100)}%</td>
                  <td className="py-2 text-right tabular-nums text-[var(--muted-foreground)]">
                    {Math.round(exercise.low * 100)}–{Math.round(exercise.high * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These factors are practical starting points, not measured equivalences — stabiliser
        strength, grip and range of motion all shift the true number. Always test a new implement
        with a light set first. General fitness information only.
      </p>
    </main>
  );
}
