"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dribbble, RotateCcw } from "lucide-react";

import {
  BASKETBALL_MODES,
  FIBA_GAME_MINUTES,
  NBA_GAME_MINUTES,
  compareModes,
  computeBasketballCalories,
  toKilograms,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = { weight: "80", unit: "kg", court: "40", bench: "10", mode: "game" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [court, setCourt] = useState(DEFAULTS.court);
  const [bench, setBench] = useState(DEFAULTS.bench);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBasketballCalories({
        weightKg: toKilograms(weight, unit),
        courtMinutes: Number(String(court).trim()),
        benchMinutes: String(bench).trim() === "" ? 0 : Number(String(bench).trim()),
        modeId: mode,
      }),
    [weight, unit, court, bench, mode],
  );

  const ok = !result.error;

  const comparison = useMemo(
    () => (ok ? compareModes({ weightKg: result.weightKg, courtMinutes: result.courtMinutes }) : []),
    [ok, result],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Basketball Calorie Burn",
      `${result.modeLabel} (${result.met} MET)`,
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Court time: ${NUM0.format(result.courtMinutes)} min · Bench: ${NUM0.format(result.benchMinutes)} min`,
      `Total calories: ${NUM0.format(result.totalKcal)} kcal`,
      `On court: ${NUM0.format(result.courtKcal)} kcal`,
      `Net of resting burn: ${NUM0.format(result.netKcal)} kcal`,
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
    setWeight(DEFAULTS.weight);
    setUnit(DEFAULTS.unit);
    setCourt(DEFAULTS.court);
    setBench(DEFAULTS.bench);
    setMode(DEFAULTS.mode);
    setCopied(false);
  };

  const rows = [
    ["Burned on court", ok ? `${NUM0.format(result.courtKcal)} kcal` : DASH],
    ["Burned on the bench", ok ? `${NUM0.format(result.benchKcal)} kcal` : DASH],
    ["Net of resting metabolism", ok ? `${NUM0.format(result.netKcal)} kcal` : DASH],
    ["Court burn rate", ok ? `${NUM1.format(result.courtRate)} kcal/min` : DASH],
    ["Per hour on court", ok ? `${NUM0.format(result.kcalPerHourOnCourt)} kcal/hour` : DASH],
    ["Per 10-minute quarter", ok ? `${NUM0.format(result.kcalPerQuarter)} kcal` : DASH],
    ["MET value used", ok ? `${result.met} MET` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dribbble className="h-4 w-4" aria-hidden="true" />
          Basketball
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Basketball Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A full-court game, a half-court pick-up run and a shooting session sit at very different
          intensities. Each option here uses its own published MET value, and time on the bench is
          counted separately.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bb-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="bb-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="bb-unit"
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bb-mode">
              What did you play?
            </label>
            <select
              id="bb-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {BASKETBALL_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bb-court">
              Minutes on court
            </label>
            <input
              id="bb-court"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={court}
              onChange={(event) => setCourt(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bb-bench">
              Minutes on the bench
            </label>
            <input
              id="bb-bench"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={bench}
              onChange={(event) => setBench(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCourt(String(FIBA_GAME_MINUTES))} className={CHIP_BTN}>
            FIBA game ({FIBA_GAME_MINUTES} min)
          </button>
          <button type="button" onClick={() => setCourt(String(NBA_GAME_MINUTES))} className={CHIP_BTN}>
            NBA game ({NBA_GAME_MINUTES} min)
          </button>
          {[20, 60, 90].map((preset) => (
            <button key={preset} type="button" onClick={() => setCourt(String(preset))} className={CHIP_BTN}>
              {preset} min
            </button>
          ))}
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
              Total calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM0.format(result.totalKcal)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.modeLabel} · ${NUM0.format(result.courtMinutes)} min on court`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy basketball calorie result"
              className={GHOST_BTN}
              disabled={!ok}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            MET source: Compendium of Physical Activities, {result.code}.
          </p>
        ) : null}
      </section>

      {comparison.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Same court time, every style of play</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Style</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">MET</th>
                  <th scope="col" className="py-2 text-right font-semibold">Calories</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{item.met}</td>
                    <td className="py-2 text-right">{NUM0.format(item.kcal)} kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Enter the minutes you were actually on the floor — a 40-minute
        game clock can stretch to well over an hour of elapsed time. Consult a doctor or sports
        dietitian before using these numbers for weight or fuelling decisions.
      </p>
    </main>
  );
}
