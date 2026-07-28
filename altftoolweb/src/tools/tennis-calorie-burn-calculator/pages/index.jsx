"use client";

import { useMemo, useState } from "react";
import { Check, CircleDot, Copy, RotateCcw } from "lucide-react";

import { TENNIS_FORMATS, compareFormats, computeTennisCalories, toKilograms } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = { weight: "75", unit: "kg", sets: "3", perSet: "40", format: "singles" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [sets, setSets] = useState(DEFAULTS.sets);
  const [perSet, setPerSet] = useState(DEFAULTS.perSet);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTennisCalories({
        weightKg: toKilograms(weight, unit),
        sets: Number(String(sets).trim()),
        minutesPerSet: Number(String(perSet).trim()),
        formatId: format,
      }),
    [weight, unit, sets, perSet, format],
  );

  const ok = !result.error;

  const comparison = useMemo(
    () => (ok ? compareFormats({ weightKg: result.weightKg, totalMinutes: result.totalMinutes }) : []),
    [ok, result],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Tennis Calorie Burn",
      `${result.formatLabel} (${result.met} MET)`,
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `${NUM0.format(result.sets)} sets x ${NUM0.format(result.minutesPerSet)} min = ${NUM0.format(result.totalMinutes)} min on court`,
      `Total calories: ${NUM0.format(result.totalKcal)} kcal`,
      `Per set: ${NUM0.format(result.kcalPerSet)} kcal`,
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
    setSets(DEFAULTS.sets);
    setPerSet(DEFAULTS.perSet);
    setFormat(DEFAULTS.format);
    setCopied(false);
  };

  const rows = [
    ["Calories per set", ok ? `${NUM0.format(result.kcalPerSet)} kcal` : DASH],
    ["Net of resting metabolism", ok ? `${NUM0.format(result.netKcal)} kcal` : DASH],
    ["Burn rate", ok ? `${NUM1.format(result.rate)} kcal/min` : DASH],
    ["Per hour on court", ok ? `${NUM0.format(result.kcalPerHour)} kcal/hour` : DASH],
    ["Total court time", ok ? `${NUM0.format(result.totalMinutes)} min` : DASH],
    ["MET value used", ok ? `${result.met} MET` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CircleDot className="h-4 w-4" aria-hidden="true" />
          Tennis
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tennis Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter how long your sets ran and get the calorie cost per set and per match, using the
          published MET values for singles, doubles, general play and drills.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tn-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="tn-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="tn-unit"
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
            <label className={LABEL_CLASS} htmlFor="tn-format">
              Format played
            </label>
            <select
              id="tn-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {TENNIS_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tn-sets">
              Sets played
            </label>
            <input
              id="tn-sets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tn-per-set">
              Average minutes per set
            </label>
            <input
              id="tn-per-set"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={perSet}
              onChange={(event) => setPerSet(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3, 5].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSets(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} {preset === 1 ? "set" : "sets"}
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
              Calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM0.format(result.totalKcal)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.formatLabel} · ${NUM0.format(result.sets)} sets`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy tennis calorie result"
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
          <h2 className="text-base font-semibold">
            Same court time, every format
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
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
        Informational estimate only. MET values describe an average adult and cannot account for
        surface, heat, rally length or your own efficiency. Consult a doctor or sports dietitian
        before using these numbers to plan weight change or fuelling.
      </p>
    </main>
  );
}
