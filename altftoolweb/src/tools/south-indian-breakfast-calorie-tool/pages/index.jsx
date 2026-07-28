"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Minus, Plus, RotateCcw, Utensils } from "lucide-react";

import {
  BREAKFAST_SHARE_PERCENT,
  computeMeal,
  itemEnergyKcal,
  itemGroups,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const STEP_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PLATE = { idli: 2, sambar: 1, "coconut-chutney": 1, "filter-coffee-sugar": 1 };

const DEFAULTS = {
  target: "2000",
  share: String(BREAKFAST_SHARE_PERCENT),
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [plate, setPlate] = useState(DEFAULT_PLATE);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [share, setShare] = useState(DEFAULTS.share);
  const [copied, setCopied] = useState(false);

  const groups = itemGroups();

  const result = useMemo(
    () =>
      computeMeal({
        selections: Object.entries(plate).map(([id, qty]) => ({ id, qty })),
        dailyTargetKcal: toNumber(target),
        breakfastSharePercent: toNumber(share),
      }),
    [plate, target, share],
  );

  const hasError = Boolean(result.error);

  const setQty = (id, qty) => {
    setPlate((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "South Indian breakfast",
      ...result.lines.map(
        (line) =>
          `${NUM1.format(line.qty)} × ${line.item.name} (${line.item.portion}) — ${NUM0.format(line.energyKcal)} kcal`,
      ),
      "",
      `Total: ${NUM0.format(result.energyKcal)} kcal`,
      `Protein ${NUM1.format(result.proteinG)} g · Carbs ${NUM1.format(result.carbG)} g · Fat ${NUM1.format(result.fatG)} g · Fibre ${NUM1.format(result.fibreG)} g`,
      `${NUM0.format(result.budgetUsedPercent)}% of a ${NUM0.format(result.breakfastBudgetKcal)} kcal breakfast budget`,
    ].join("\n");
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
    setPlate(DEFAULT_PLATE);
    setTarget(DEFAULTS.target);
    setShare(DEFAULTS.share);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Indian nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          South Indian Breakfast Calorie Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build your plate from idli, dosa, vada, upma, pongal and the chutneys and coffee that go
          with them. Calories come from the macros using the Atwater factors, so the totals and the
          breakdown always agree.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-target">
              Daily calorie target (kcal)
            </label>
            <input
              id="sb-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="800"
              max="5000"
              step="50"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-share">
              Share of the day taken at breakfast (%)
            </label>
            <input
              id="sb-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={share}
              onChange={(event) => setShare(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Breakfast total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.energyKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Add something to your plate below."
                : `${NUM1.format(result.itemCount)} portions · ${NUM0.format(result.dailyPercent)}% of a ${NUM0.format(result.dailyTargetKcal)} kcal day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the breakfast calorie total"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plate"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the plate" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Protein",
              hasError ? DASH : `${NUM1.format(result.proteinG)} g (${NUM0.format(result.proteinPercent)}%)`,
            ],
            [
              "Carbohydrate",
              hasError ? DASH : `${NUM1.format(result.carbG)} g (${NUM0.format(result.carbPercent)}%)`,
            ],
            [
              "Fat",
              hasError ? DASH : `${NUM1.format(result.fatG)} g (${NUM0.format(result.fatPercent)}%)`,
            ],
            ["Fibre", hasError ? DASH : `${NUM1.format(result.fibreG)} g`],
            [
              "From deep-fried items",
              hasError
                ? DASH
                : `${NUM0.format(result.friedKcal)} kcal (${NUM0.format(result.friedPercent)}%)`,
            ],
            [
              "Breakfast budget",
              hasError ? DASH : `${NUM0.format(result.breakfastBudgetKcal)} kcal`,
            ],
            [
              "Budget used",
              hasError ? DASH : `${NUM0.format(result.budgetUsedPercent)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div
              className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Protein ${NUM0.format(result.proteinPercent)} percent, carbohydrate ${NUM0.format(result.carbPercent)} percent, fat ${NUM0.format(result.fatPercent)} percent of calories`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.proteinPercent}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${result.carbPercent}%` }}
              />
              <span
                className="block h-full bg-[var(--warning)]"
                style={{ width: `${result.fatPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Protein {NUM0.format(result.proteinPercent)}% · Carbs{" "}
              {NUM0.format(result.carbPercent)}% · Fat {NUM0.format(result.fatPercent)}% of calories
            </p>
            {result.overBudgetKcal > 0 && (
              <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
                {NUM0.format(result.overBudgetKcal)} kcal over the breakfast budget. Dropping one
                fried item or halving the chutney is usually the quickest fix.
              </p>
            )}
          </>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What is on the plate</h2>
          <table className="mt-3 w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Item
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Qty
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  kcal
                </th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((line) => (
                <tr key={line.item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <span className="font-semibold">{line.item.name}</span>
                    <span className="block text-[var(--muted-foreground)]">{line.item.portion}</span>
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">{NUM1.format(line.qty)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">
                    {NUM0.format(line.energyKcal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Choose your items</h2>
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <div key={group.group}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {group.group}
              </h3>
              <ul className="mt-2 space-y-2">
                {group.items.map((item) => {
                  const qty = plate[item.id] || 0;
                  return (
                    <li
                      key={item.id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-3 ${
                        qty > 0
                          ? "border-[var(--primary)] bg-[var(--muted)]"
                          : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {item.portion} · {NUM0.format(itemEnergyKcal(item))} kcal
                          {item.fried ? " · deep fried" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={STEP_BTN}
                          aria-label={`One less ${item.name}`}
                          onClick={() => setQty(item.id, Math.max(0, qty - 1))}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <label className="sr-only" htmlFor={`sb-qty-${item.id}`}>
                          Portions of {item.name}
                        </label>
                        <input
                          id={`sb-qty-${item.id}`}
                          className="h-11 w-16 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-center text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="20"
                          step="0.5"
                          value={qty}
                          onChange={(event) => setQty(item.id, toNumber(event.target.value) || 0)}
                        />
                        <button
                          type="button"
                          className={STEP_BTN}
                          aria-label={`One more ${item.name}`}
                          onClick={() => setQty(item.id, Math.min(20, qty + 1))}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Portion macros are typical values for home-style cooking. Restaurant and tiffin-centre
        versions often carry far more oil and ghee — a hotel masala dosa can be half as much again.
        Informational only; for diabetes, weight management under supervision or any medical diet,
        follow your dietitian's plan.
      </p>
    </main>
  );
}
