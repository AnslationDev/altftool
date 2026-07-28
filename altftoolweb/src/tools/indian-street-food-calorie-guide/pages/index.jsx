"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";
import { STREET_FOODS, foodGroups, summarisePlate } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const DEFAULT_PLATE = { "vada-pav": 1, "masala-chai": 2 };
const DEFAULT_DAILY = "2000";
const DEFAULT_WEIGHT = "70";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const STEP_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GROUPS = foodGroups();

export default function ToolHome() {
  const [plate, setPlate] = useState(DEFAULT_PLATE);
  const [dailyKcal, setDailyKcal] = useState(DEFAULT_DAILY);
  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT);
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]);
  const [copied, setCopied] = useState(false);

  const selections = useMemo(
    () => Object.entries(plate).map(([id, servings]) => ({ id, servings })),
    [plate],
  );

  const result = useMemo(
    () => summarisePlate({ selections, dailyKcal, weightKg }),
    [selections, dailyKcal, weightKg],
  );

  const ok = !result.error;
  const hasItems = ok && !result.empty;

  const changeServings = (id, delta) => {
    setPlate((current) => {
      const next = { ...current };
      const value = (next[id] ?? 0) + delta;
      if (value <= 0) delete next[id];
      else next[id] = Math.min(20, value);
      return next;
    });
  };

  const summary = useMemo(() => {
    if (!hasItems) return "";
    const lines = ["Indian Street Food Calorie Guide", ""];
    result.lines.forEach((line) => {
      lines.push(`${line.name} x${line.servings} (${line.serving}) — ${n0(line.kcal)} kcal`);
    });
    lines.push(
      "",
      `Total: ${n0(result.kcal)} kcal (range ${n0(result.kcalLow)}-${n0(result.kcalHigh)})`,
      `Protein ${n1(result.protein)} g · Carbs ${n1(result.carbs)} g · Fat ${n1(result.fat)} g`,
      `${n1(result.shareOfDayPct)}% of a ${n0(result.dailyKcal)} kcal day`,
      `About ${n0(result.briskWalkMinutes)} minutes of brisk walking at ${n0(result.weightKg)} kg`,
    );
    return lines.join("\n");
  }, [hasItems, result]);

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
    setPlate(DEFAULT_PLATE);
    setDailyKcal(DEFAULT_DAILY);
    setWeightKg(DEFAULT_WEIGHT);
    setActiveGroup(GROUPS[0]);
    setCopied(false);
  };

  const rows = [
    ["Estimate range", hasItems ? `${n0(result.kcalLow)} – ${n0(result.kcalHigh)} kcal` : DASH],
    ["Protein", hasItems ? `${n1(result.protein)} g (${n0(result.proteinPct)}% of energy)` : DASH],
    ["Carbohydrate", hasItems ? `${n1(result.carbs)} g (${n0(result.carbPct)}% of energy)` : DASH],
    ["Fat", hasItems ? `${n1(result.fat)} g (${n0(result.fatPct)}% of energy)` : DASH],
    ["Approximate food weight", hasItems ? `${n0(result.grams)} g` : DASH],
    ["Share of your daily target", hasItems ? `${n1(result.shareOfDayPct)}%` : DASH],
    ["Left for the rest of the day", hasItems ? `${n0(result.remainingKcal)} kcal` : DASH],
    ["Brisk walking to match", hasItems ? `${n0(result.briskWalkMinutes)} minutes` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Indian Street Food Calorie Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the plate you actually ordered — pani puri, vada pav, chaat, rolls, momos — and see
          calories, protein, carbs and fat for a typical vendor portion.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="isf-daily">
              Daily calorie target (kcal)
            </label>
            <input
              id="isf-daily"
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
            <label className={LABEL_CLASS} htmlFor="isf-weight">
              Body weight (kg)
            </label>
            <input
              id="isf-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="1"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--foreground)]">Pick a section</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                aria-pressed={activeGroup === group}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  activeGroup === group
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-4 divide-y divide-[var(--border)]">
          {STREET_FOODS.filter((food) => food.group === activeGroup).map((food) => (
            <li key={food.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{food.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {food.serving} · about {n0(food.kcal)} kcal · {n1(food.protein)} g protein
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={STEP_BTN}
                  onClick={() => changeServings(food.id, -1)}
                  aria-label={`Remove one serving of ${food.name}`}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                  {plate[food.id] ?? 0}
                </span>
                <button
                  type="button"
                  className={STEP_BTN}
                  onClick={() => changeServings(food.id, 1)}
                  aria-label={`Add one serving of ${food.name}`}
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
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
              Plate total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasItems ? `${n0(result.kcal)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasItems
                ? `${n1(result.shareOfDayPct)}% of your ${n0(result.dailyKcal)} kcal day`
                : "Add an item above to see the totals."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy plate calorie summary"
              className={GHOST_BTN}
              disabled={!hasItems}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the plate" className={PRIMARY_BTN}>
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

      {hasItems ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What is on the plate</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kcal</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Protein</th>
                  <th scope="col" className="py-2 text-right font-semibold">Fat</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{line.name}</td>
                    <td className="py-2 pr-3 text-right">{n0(line.servings)}</td>
                    <td className="py-2 pr-3 text-right">{n0(line.kcal)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {n1(line.protein)} g
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{n1(line.fat)} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Street food has no fixed recipe, so these are typical-portion estimates with roughly a 20%
        band either side; extra butter, a deeper fry or a bigger plate all push the number up. This
        is general nutrition information, not dietary or medical advice — talk to a registered
        dietitian for a plan that fits your health conditions.
      </p>
    </main>
  );
}
