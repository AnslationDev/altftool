"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";
import { FOODS, compareFoods } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const DEFAULTS = {
  leftId: "paneer-full",
  rightId: "tofu-firm",
  grams: "100",
  weightKg: "70",
  ironReference: "female",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [leftId, setLeftId] = useState(DEFAULTS.leftId);
  const [rightId, setRightId] = useState(DEFAULTS.rightId);
  const [grams, setGrams] = useState(DEFAULTS.grams);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [ironReference, setIronReference] = useState(DEFAULTS.ironReference);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => compareFoods({ leftId, rightId, grams, weightKg, ironReference }),
    [leftId, rightId, grams, weightKg, ironReference],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Paneer vs Tofu Comparator",
      `Portion: ${n0(result.portionGrams)} g of each`,
      "",
      `${result.left.name}: ${n0(result.left.kcal)} kcal, ${n1(result.left.protein)} g protein, ${n0(result.left.calcium)} mg calcium`,
      `${result.right.name}: ${n0(result.right.kcal)} kcal, ${n1(result.right.protein)} g protein, ${n0(result.right.calcium)} mg calcium`,
      "",
    ];
    result.rows.forEach((row) => {
      lines.push(`${row.label}: ${n1(row.leftValue)} vs ${n1(row.rightValue)} ${row.unit}`);
    });
    lines.push(
      "",
      `Matching the protein in ${result.left.name} takes ${n0(result.rightGramsMatchingLeftProtein)} g of ${result.right.name}, which is ${n0(result.rightKcalMatchingLeftProtein)} kcal.`,
    );
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
    setLeftId(DEFAULTS.leftId);
    setRightId(DEFAULTS.rightId);
    setGrams(DEFAULTS.grams);
    setWeightKg(DEFAULTS.weightKg);
    setIronReference(DEFAULTS.ironReference);
    setCopied(false);
  };

  const shareRows = [
    [
      "Protein against your daily need",
      ok
        ? `${n0(result.left.proteinPctOfTarget)}% vs ${n0(result.right.proteinPctOfTarget)}% of ${n1(result.proteinTarget)} g`
        : DASH,
    ],
    [
      "Calcium against the 1,000 mg RDA",
      ok ? `${n0(result.left.calciumPctOfRda)}% vs ${n0(result.right.calciumPctOfRda)}%` : DASH,
    ],
    [
      `Iron against the ${ok ? n0(result.ironTarget) : ""} mg RDA`,
      ok ? `${n0(result.left.ironPctOfRda)}% vs ${n0(result.right.ironPctOfRda)}%` : DASH,
    ],
    [
      "Calories per gram of protein",
      ok
        ? `${n1(result.left.kcalPerGramProtein)} vs ${n1(result.right.kcalPerGramProtein)} kcal`
        : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Paneer vs Tofu Comparator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put paneer and tofu side by side for the portion you actually cook, and see the trade-off in
          calories, protein, saturated fat, calcium and iron.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pvt-left">
              First food
            </label>
            <select
              id="pvt-left"
              className={`mt-2 ${INPUT_CLASS}`}
              value={leftId}
              onChange={(event) => setLeftId(event.target.value)}
            >
              {FOODS.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pvt-right">
              Second food
            </label>
            <select
              id="pvt-right"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rightId}
              onChange={(event) => setRightId(event.target.value)}
            >
              {FOODS.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pvt-grams">
              Portion of each (grams)
            </label>
            <input
              id="pvt-grams"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="5"
              value={grams}
              onChange={(event) => setGrams(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pvt-weight">
              Body weight (kg)
            </label>
            <input
              id="pvt-weight"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="pvt-iron">
              Iron reference
            </label>
            <select
              id="pvt-iron"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ironReference}
              onChange={(event) => setIronReference(event.target.value)}
            >
              <option value="female">Adult woman (29 mg/day)</option>
              <option value="male">Adult man (19 mg/day)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["50", "100", "150", "200"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setGrams(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value} g
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
              Calorie gap for the same portion
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n0(Math.abs(result.kcalDifference))} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n0(result.portionGrams)} g of ${result.left.name} is ${n0(result.left.kcal)} kcal against ${n0(result.right.kcal)} kcal for ${result.right.name}.`
                : "Fix the highlighted input to see a comparison."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy paneer and tofu comparison"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy comparison"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            To match the {n1(result.left.protein)} g of protein in this portion of {result.left.name}{" "}
            you would need {n0(result.rightGramsMatchingLeftProtein)} g of {result.right.name}, which
            works out to {n0(result.rightKcalMatchingLeftProtein)} kcal.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {shareRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Nutrient table for {n0(result.portionGrams)} g of each
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Nutrient</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">{result.left.name}</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">{result.right.name}</th>
                  <th scope="col" className="py-2 text-right font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {n1(row.leftValue)} {row.unit}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {n1(row.rightValue)} {row.unit}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.difference > 0 ? "+" : ""}
                      {n1(row.difference)} {row.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Composition varies by brand and by how the paneer or tofu was made — tofu that is not set
        with calcium sulfate carries far less calcium, and homemade paneer changes with the milk
        used. Check the pack where one exists. General nutrition information, not dietary or medical
        advice.
      </p>
    </main>
  );
}
