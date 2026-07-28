"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplet, RotateCcw } from "lucide-react";
import {
  SATURATED_OPTIONS,
  TOTAL_FAT_OPTIONS,
  calculateGheeAllowance,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const DEFAULTS = {
  dailyKcal: "2000",
  totalFatPct: "30",
  saturatedPct: "10",
  otherFatG: "40",
  otherSaturatedG: "10",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [dailyKcal, setDailyKcal] = useState(DEFAULTS.dailyKcal);
  const [totalFatPct, setTotalFatPct] = useState(DEFAULTS.totalFatPct);
  const [saturatedPct, setSaturatedPct] = useState(DEFAULTS.saturatedPct);
  const [otherFatG, setOtherFatG] = useState(DEFAULTS.otherFatG);
  const [otherSaturatedG, setOtherSaturatedG] = useState(DEFAULTS.otherSaturatedG);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateGheeAllowance({
        dailyKcal,
        totalFatPct,
        saturatedPct,
        otherFatG,
        otherSaturatedG,
      }),
    [dailyKcal, totalFatPct, saturatedPct, otherFatG, otherSaturatedG],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Ghee Intake Calculator",
      `Daily target: ${n0(result.dailyKcal)} kcal, fat at ${n0(result.totalFatPct)}% and saturated fat under ${n0(result.saturatedPct)}%`,
      `Total fat budget: ${n1(result.totalFatBudget)} g · saturated fat budget: ${n1(result.saturatedBudget)} g`,
      `Already eaten: ${n1(result.otherFat)} g fat of which ${n1(result.otherSaturated)} g saturated`,
      "",
      `Ghee allowance: ${n1(result.allowanceGrams)} g — about ${n1(result.allowanceTeaspoons)} teaspoons or ${n1(result.allowanceTablespoons)} tablespoons`,
      `That adds ${n0(result.allowanceKcal)} kcal, ${n1(result.allowanceShareOfDayPct)}% of the day`,
      `Binding limit: ${result.binding === "saturated" ? "saturated fat" : "total fat"}`,
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
    setDailyKcal(DEFAULTS.dailyKcal);
    setTotalFatPct(DEFAULTS.totalFatPct);
    setSaturatedPct(DEFAULTS.saturatedPct);
    setOtherFatG(DEFAULTS.otherFatG);
    setOtherSaturatedG(DEFAULTS.otherSaturatedG);
    setCopied(false);
  };

  const rows = [
    ["Allowance in grams", ok ? `${n1(result.allowanceGrams)} g` : DASH],
    ["Allowance in tablespoons", ok ? `${n1(result.allowanceTablespoons)} tbsp` : DASH],
    ["Calories that ghee adds", ok ? `${n0(result.allowanceKcal)} kcal (${n1(result.allowanceShareOfDayPct)}% of the day)` : DASH],
    ["Saturated fat that ghee adds", ok ? `${n1(result.allowanceSaturated)} g` : DASH],
    ["Total fat budget", ok ? `${n1(result.totalFatBudget)} g` : DASH],
    ["Total fat left before ghee", ok ? `${n1(result.fatRemaining)} g` : DASH],
    ["Saturated fat budget", ok ? `${n1(result.saturatedBudget)} g` : DASH],
    ["Saturated fat left before ghee", ok ? `${n1(result.saturatedRemaining)} g` : DASH],
    ["Ghee the total fat budget allows", ok ? `${n1(result.gheeByFatAllowed)} g` : DASH],
    ["Ghee the saturated budget allows", ok ? `${n1(result.gheeBySaturatedAllowed)} g` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplet className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Ghee Intake Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Ghee is about 62% saturated fat, so the saturated ceiling usually runs out before the total
          fat budget does. Enter your calorie target and what you have already eaten to see how many
          spoons are left.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ghee-kcal">
              Daily calorie target (kcal)
            </label>
            <input
              id="ghee-kcal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="800"
              max="6000"
              step="50"
              value={dailyKcal}
              onChange={(event) => setDailyKcal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ghee-fat-pct">
              Total fat share of energy
            </label>
            <select
              id="ghee-fat-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              value={totalFatPct}
              onChange={(event) => setTotalFatPct(event.target.value)}
            >
              {TOTAL_FAT_OPTIONS.map((option) => (
                <option key={option.id} value={String(option.pct)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ghee-sat-pct">
              Saturated fat ceiling
            </label>
            <select
              id="ghee-sat-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              value={saturatedPct}
              onChange={(event) => setSaturatedPct(event.target.value)}
            >
              {SATURATED_OPTIONS.map((option) => (
                <option key={option.id} value={String(option.pct)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ghee-other-fat">
              Fat already eaten today (g)
            </label>
            <input
              id="ghee-other-fat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="300"
              step="1"
              value={otherFatG}
              onChange={(event) => setOtherFatG(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ghee-other-sat">
              Of which saturated (g)
            </label>
            <input
              id="ghee-other-sat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="300"
              step="1"
              value={otherSaturatedG}
              onChange={(event) => setOtherSaturatedG(event.target.value)}
            />
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
              Ghee left for today
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n1(result.allowanceTeaspoons)} tsp` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `About ${n1(result.allowanceGrams)} g, adding ${n0(result.allowanceKcal)} kcal`
                : "Fix the highlighted input to see an allowance."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy ghee allowance result"
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

      {ok && result.notes.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {result.notes.map((note) => (
            <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General nutrition information based on population guidance, not personal dietary or medical
        advice. If you have raised cholesterol, heart disease, diabetes or are pregnant, set your fat
        targets with your doctor or a registered dietitian rather than a calculator.
      </p>
    </main>
  );
}
