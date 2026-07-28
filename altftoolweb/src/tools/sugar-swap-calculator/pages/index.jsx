"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CandyOff, RotateCcw, TriangleAlert } from "lucide-react";
import {
  SWEETENERS,
  compareAllSweeteners,
  computeSwap,
  freeSugarAllowance,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sourceId: "sucrose",
  targetId: "stevia",
  sourceGrams: "100",
  bodyWeightKg: "70",
  dailyKcal: "2000",
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const GROUPS = ["Sugars", "Syrups", "High-intensity", "Sugar alcohols", "Rare sugars"];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const args = useMemo(
    () => ({
      sourceId: form.sourceId,
      targetId: form.targetId,
      sourceGrams: Number(form.sourceGrams),
      bodyWeightKg: Number(form.bodyWeightKg),
    }),
    [form],
  );

  const result = useMemo(() => computeSwap(args), [args]);
  const table = useMemo(
    () => compareAllSweeteners({ ...args, targetId: undefined }),
    [args],
  );
  const allowance = useMemo(() => freeSugarAllowance(Number(form.dailyKcal)), [form.dailyKcal]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Sugar swap",
      `${NUM.format(result.sourceGrams)} g ${result.source.name} = ${NUM.format(result.targetGrams)} g ${result.target.name}`,
      `Calories: ${INT.format(result.sourceKcal)} kcal becomes ${INT.format(result.targetKcal)} kcal`,
      `Change: ${result.kcalSaved >= 0 ? "saves" : "adds"} ${INT.format(Math.abs(result.kcalSaved))} kcal (${NUM.format(Math.abs(result.kcalSavedPct))}%)`,
      `Glycaemic index: ${result.source.gi ?? "not published"} to ${result.target.gi ?? "not published"}`,
    ];
    if (result.adi) {
      lines.push(
        `Acceptable Daily Intake: ${result.adi.mgPerKg} mg/kg body weight — this amount uses ${NUM.format(result.adi.usedPct)}% of it`,
      );
    }
    if (result.warnings.length > 0) {
      lines.push("", "Watch out for:");
      for (const warning of result.warnings) lines.push(`- ${warning}`);
    }
    return lines.join("\n");
  }, [hasError, result]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const yesNo = (value) => (value ? "Yes" : "No");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CandyOff className="h-4 w-4" aria-hidden="true" />
          Sweeteners
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sugar Swap Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what a recipe calls for and get the equally sweet amount of any other sweetener,
          the calories you gain or lose, the glycaemic index, how much of the Acceptable Daily
          Intake it uses, and whether it will actually bake.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swap-source">
              Sweetener in the recipe
            </label>
            <select
              id="swap-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sourceId}
              onChange={(event) => update("sourceId", event.target.value)}
            >
              {GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {SWEETENERS.filter((item) => item.group === group).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swap-target">
              Swap it for
            </label>
            <select
              id="swap-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.targetId}
              onChange={(event) => update("targetId", event.target.value)}
            >
              {GROUPS.map((group) => (
                <optgroup key={group} label={group}>
                  {SWEETENERS.filter((item) => item.group === group).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swap-grams">
              Amount in the recipe (g)
            </label>
            <input
              id="swap-grams"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.sourceGrams}
              onChange={(event) => update("sourceGrams", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swap-weight">
              Your body weight (kg)
            </label>
            <input
              id="swap-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="400"
              step="1"
              value={form.bodyWeightKg}
              onChange={(event) => update("bodyWeightKg", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Used only for the Acceptable Daily Intake check.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="swap-kcal">
              Your daily calorie intake (kcal, optional context)
            </label>
            <input
              id="swap-kcal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={form.dailyKcal}
              onChange={(event) => update("dailyKcal", event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Use instead
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.targetGrams)} g`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the swap."
                : `of ${result.target.name.toLowerCase()} in place of ${NUM.format(result.sourceGrams)} g of ${result.source.name.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy sweetener swap result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the calculator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Calories before",
              hasError ? DASH : `${INT.format(result.sourceKcal)} kcal`,
            ],
            ["Calories after", hasError ? DASH : `${INT.format(result.targetKcal)} kcal`],
            [
              result.kcalSaved >= 0 ? "Calories saved" : "Calories added",
              hasError
                ? DASH
                : `${INT.format(Math.abs(result.kcalSaved))} kcal (${NUM.format(Math.abs(result.kcalSavedPct))}%)`,
            ],
            [
              "Glycaemic index",
              hasError
                ? DASH
                : `${result.source.gi ?? "not published"} → ${result.target.gi ?? "not published"}`,
            ],
            [
              "Acceptable Daily Intake",
              hasError
                ? DASH
                : result.adi
                  ? `${result.adi.mgPerKg} mg/kg — this uses ${NUM.format(result.adi.usedPct)}%`
                  : "None specified",
            ],
            ["Survives baking", hasError ? DASH : yesNo(result.target.heatStable)],
            ["Browns and caramelises", hasError ? DASH : yesNo(result.target.browns)],
            ["Provides bulk and structure", hasError ? DASH : yesNo(result.target.bulk)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.target.note}
          </p>
        )}

        {!hasError && result.warnings.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          >
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Before you swap
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {!table.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Every sweetener at the same sweetness
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The amount of each that matches {NUM.format(Number(form.sourceGrams))} g of{" "}
            {(SWEETENERS.find((item) => item.id === form.sourceId) || SWEETENERS[0]).name.toLowerCase()},
            sorted from fewest calories.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Sweetener
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Amount
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    kcal
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    GI
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Bakes
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Browns
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.id === form.targetId ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <th scope="row" className="py-2 pr-3 text-left font-semibold">
                      {row.name}
                    </th>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.grams)} g</td>
                    <td className="py-2 pr-3 text-right">{INT.format(row.kcal)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.gi === null ? "n/a" : row.gi}
                    </td>
                    <td className="py-2 pr-3 text-right">{yesNo(row.bakes)}</td>
                    <td className="py-2 text-right">{yesNo(row.browns)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {allowance && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where this sits in your day</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">
                WHO strong recommendation (under 10% of energy)
              </dt>
              <dd className="text-right font-semibold">
                {INT.format(allowance.strongGrams)} g free sugars a day
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">
                WHO conditional target (under 5% of energy)
              </dt>
              <dd className="text-right font-semibold">
                {INT.format(allowance.conditionalGrams)} g free sugars a day
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Free sugars are those added to food plus the sugars in honey, syrups and fruit juice.
            Sugars naturally present in whole fruit, vegetables and milk are not counted.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Sweetness ratios and calorie figures are typical published values and
        vary by brand and batch, particularly for syrups and unrefined sugars. If you are managing
        diabetes, pregnancy or a condition such as phenylketonuria, discuss sweetener choices with
        a clinician or dietitian.
      </p>
    </main>
  );
}
