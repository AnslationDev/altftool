"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import { BADMINTON_FORMATS, computeBadmintonCalories, toKilograms } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  weight: "68",
  unit: "kg",
  play: "45",
  rest: "10",
  format: "competitive-singles",
};

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
  const [play, setPlay] = useState(DEFAULTS.play);
  const [rest, setRest] = useState(DEFAULTS.rest);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBadmintonCalories({
        weightKg: toKilograms(weight, unit),
        playMinutes: Number(String(play).trim()),
        restMinutes: String(rest).trim() === "" ? 0 : Number(String(rest).trim()),
        formatId: format,
      }),
    [weight, unit, play, rest, format],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Badminton Calorie Burn",
      `Format: ${result.formatLabel} (${result.met} MET)`,
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Rally time: ${NUM0.format(result.playMinutes)} min · Breaks: ${NUM0.format(result.restMinutes)} min`,
      `Total calories: ${NUM0.format(result.totalKcal)} kcal`,
      `On-court burn: ${NUM0.format(result.playKcal)} kcal`,
      `Break burn: ${NUM0.format(result.restKcal)} kcal`,
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
    setPlay(DEFAULTS.play);
    setRest(DEFAULTS.rest);
    setFormat(DEFAULTS.format);
    setCopied(false);
  };

  const rows = [
    ["Burned while rallying", ok ? `${NUM0.format(result.playKcal)} kcal` : DASH],
    ["Burned during breaks", ok ? `${NUM0.format(result.restKcal)} kcal` : DASH],
    ["Net of resting metabolism", ok ? `${NUM0.format(result.netKcal)} kcal` : DASH],
    ["On-court burn rate", ok ? `${NUM1.format(result.playRate)} kcal/min` : DASH],
    ["Per hour of continuous play", ok ? `${NUM0.format(result.kcalPerHourOfPlay)} kcal/hour` : DASH],
    ["Average over the whole session", ok ? `${NUM1.format(result.averageRate)} kcal/min` : DASH],
    ["MET value used", ok ? `${result.met} MET` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Badminton
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Badminton Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Singles asks one player to cover the whole court, doubles splits it between two — this
          calculator prices that difference using MET values from the Compendium of Physical
          Activities and counts your between-game breaks separately.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bd-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="bd-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="bd-unit"
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
            <label className={LABEL_CLASS} htmlFor="bd-format">
              Match format
            </label>
            <select
              id="bd-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {BADMINTON_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bd-play">
              Time actually playing (minutes)
            </label>
            <input
              id="bd-play"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={play}
              onChange={(event) => setPlay(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bd-rest">
              Breaks between games (minutes)
            </label>
            <input
              id="bd-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={rest}
              onChange={(event) => setRest(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[30, 45, 60, 90].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPlay(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} min play
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
                ? `${result.formatLabel} · ${NUM0.format(result.totalMinutes)} minutes on court`
                : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy badminton calorie result"
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
            Source of the MET value: {result.source}.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">MET values behind each format</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">MET</th>
                <th scope="col" className="py-2 text-right font-semibold">Basis</th>
              </tr>
            </thead>
            <tbody>
              {BADMINTON_FORMATS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3 text-right">{item.met}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {item.sourced ? "Compendium value" : "Interpolated"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. MET tables describe an average adult and cannot capture your
        rally length, shuttle speed or fitness. Speak to a doctor or sports dietitian before using
        these figures to plan weight change.
      </p>
    </main>
  );
}
