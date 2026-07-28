"use client";

import { useMemo, useState } from "react";
import { Brush, Check, Copy, RotateCcw } from "lucide-react";

import { SWEEPING_TASKS, computeSweepingCalories, toKilograms } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULT_WEIGHT = "55";
const DEFAULT_UNIT = "kg";
const DEFAULT_MINUTES = { outdoor: "10", indoor: "20", dusting: "15" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSweepingCalories({
        weightKg: toKilograms(weight, unit),
        minutesByTask: minutes,
      }),
    [weight, unit, minutes],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Sweeping & Dusting Calorie Burn",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      ...result.rows
        .filter((row) => row.minutes > 0)
        .map((row) => `${row.label}: ${NUM0.format(row.minutes)} min = ${NUM0.format(row.kcal)} kcal`),
      `Total time: ${NUM0.format(result.totalMinutes)} min`,
      `Total calories: ${NUM0.format(result.totalKcal)} kcal`,
      `Net of resting burn: ${NUM0.format(result.netKcal)} kcal`,
      `Average intensity: ${NUM2.format(result.averageMet)} MET`,
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
    setWeight(DEFAULT_WEIGHT);
    setUnit(DEFAULT_UNIT);
    setMinutes(DEFAULT_MINUTES);
    setCopied(false);
  };

  const setTaskMinutes = (id, value) => {
    setMinutes((current) => ({ ...current, [id]: value }));
  };

  const rows = [
    ["Total time on task", ok ? `${NUM0.format(result.totalMinutes)} min` : DASH],
    ["Net of resting metabolism", ok ? `${NUM0.format(result.netKcal)} kcal` : DASH],
    ["Average burn rate", ok ? `${NUM1.format(result.averageRate)} kcal/min` : DASH],
    ["Equivalent hourly rate", ok ? `${NUM0.format(result.kcalPerHour)} kcal/hour` : DASH],
    ["Average intensity", ok ? `${NUM2.format(result.averageMet)} MET` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Brush className="h-4 w-4" aria-hidden="true" />
          Household activity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sweeping Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sweeping the yard is harder work than sweeping a smooth floor, and dusting is lighter
          still. Split your cleaning session across the three and each block is priced at its own
          published MET value.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sw-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="sw-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="sw-unit"
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

          {SWEEPING_TASKS.map((task) => (
            <div key={task.id}>
              <label className={LABEL_CLASS} htmlFor={`sw-${task.id}`}>
                {task.label} ({task.met} MET)
              </label>
              <input
                id={`sw-${task.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="5"
                value={minutes[task.id] ?? ""}
                onChange={(event) => setTaskMinutes(task.id, event.target.value)}
              />
            </div>
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
                ? `${NUM0.format(result.totalMinutes)} minutes of sweeping and dusting`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sweeping calorie result"
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
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Breakdown by task</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Task</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">MET</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Minutes</th>
                <th scope="col" className="py-2 text-right font-semibold">Calories</th>
              </tr>
            </thead>
            <tbody>
              {SWEEPING_TASKS.map((task) => {
                const row = ok ? result.rows.find((item) => item.id === task.id) : null;
                return (
                  <tr key={task.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{task.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{task.met}</td>
                    <td className="py-2 pr-3 text-right">{row ? NUM0.format(row.minutes) : DASH}</td>
                    <td className="py-2 text-right">{row ? `${NUM0.format(row.kcal)} kcal` : DASH}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          MET values from the Compendium of Physical Activities, Home Activities section.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. MET tables describe an average adult, and a stiff yard broom on
        a rough driveway is harder work than the figure suggests. Speak to a doctor before counting
        housework towards a medically supervised activity target.
      </p>
    </main>
  );
}
