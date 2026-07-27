"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shirt } from "lucide-react";

import { GEAR_ITEMS, TIERS, computeGearBudget } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULTS = {
  budget: "25000",
  monthly: "3000",
  touring: false,
};

const buildDefaultSelections = () =>
  Object.fromEntries(
    GEAR_ITEMS.map((item) => [item.id, { include: true, tier: "mid", owned: false, price: "" }]),
  );

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_LABEL = {
  funded: "In this budget",
  deferred: "Save for later",
  owned: "Already own",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [budget, setBudget] = useState(DEFAULTS.budget);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [touring, setTouring] = useState(DEFAULTS.touring);
  const [selections, setSelections] = useState(buildDefaultSelections);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const mapped = {};
    for (const [id, selection] of Object.entries(selections)) {
      const price = toNumber(selection.price);
      mapped[id] = {
        include: selection.include,
        tier: selection.tier,
        owned: selection.owned,
        ...(Number.isFinite(price) ? { price } : {}),
      };
    }
    return computeGearBudget({
      budget: toNumber(budget),
      monthlySaving: toNumber(monthly) || 0,
      touring,
      selections: mapped,
    });
  }, [budget, monthly, touring, selections]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Riding Gear Budget",
      `Budget ${INR.format(result.budget)} — allocated ${INR.format(result.spend)}, unallocated ${INR.format(result.unspent)}`,
      `Protection coverage: ${NUM.format(result.coveragePct)}%`,
      `Still to buy: ${INR.format(result.outstanding)}`,
      result.monthsToComplete === null
        ? "Add a monthly saving to see a completion timeline"
        : `Full kit in ${result.monthsToComplete} month(s) at ${INR.format(result.monthlySaving)} a month`,
      "",
    ];
    for (const line of result.lines) {
      lines.push(`${STATUS_LABEL[line.status]}: ${line.name} — ${INR.format(line.price)}`);
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
    setBudget(DEFAULTS.budget);
    setMonthly(DEFAULTS.monthly);
    setTouring(DEFAULTS.touring);
    setSelections(buildDefaultSelections());
    setCopied(false);
  };

  const setSelection = (id, field, value) =>
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const visibleItems = GEAR_ITEMS.filter((item) => touring || !item.touring);

  const rows = hasError
    ? [
        ["Allocated now", DASH],
        ["Left unallocated", DASH],
        ["Value of gear you already own", DASH],
        ["Still to buy", DASH],
        ["Whole kit at these prices", DASH],
        ["Cheapest complete core kit", DASH],
        ["Months to finish the kit", DASH],
        ["Highest-priority gap", DASH],
      ]
    : [
        ["Allocated now", INR.format(result.spend)],
        ["Left unallocated", INR.format(result.unspent)],
        ["Value of gear you already own", INR.format(result.ownedValue)],
        ["Still to buy", INR.format(result.outstanding)],
        ["Whole kit at these prices", INR.format(result.totalKitCost)],
        ["Cheapest complete core kit", INR.format(result.minimumCoreCost)],
        [
          "Months to finish the kit",
          result.monthsToComplete === null
            ? "add a monthly saving"
            : result.monthsToComplete === 0
              ? "already complete"
              : `${result.monthsToComplete} month${result.monthsToComplete === 1 ? "" : "s"}`,
        ],
        ["Highest-priority gap", result.topMissing ? result.topMissing.name : "none — core kit covered"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Shirt className="h-4 w-4" aria-hidden="true" />
          Riding gear
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Riding Gear Budget Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Spend the money you have in protection order — head, hands, torso, legs, feet — and see
          exactly how much of your body the kit actually covers before you add the nice-to-haves.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gear-budget">
              Budget available now (₹)
            </label>
            <input
              id="gear-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gear-monthly">
              Saving each month (₹)
            </label>
            <input
              id="gear-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthly}
              onChange={(event) => setMonthly(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3">
              <input
                id="gear-touring"
                type="checkbox"
                checked={touring}
                onChange={(event) => setTouring(event.target.checked)}
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <label htmlFor="gear-touring" className="min-h-11 flex-1 py-3 text-sm font-semibold">
                I tour — include rain gear, liners, luggage and an intercom
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The kit, in priority order
        </h2>
        <div className="mt-3 space-y-3">
          {visibleItems.map((item) => {
            const selection = selections[item.id] ?? {};
            return (
              <div
                key={item.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {item.priority}. {item.name}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {item.protectionWeight > 0
                      ? `${item.protectionWeight}% of protection weight`
                      : "comfort item"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{item.standard}</p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`gear-tier-${item.id}`}>
                      Tier
                    </label>
                    <select
                      id={`gear-tier-${item.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={selection.tier ?? "mid"}
                      onChange={(event) => setSelection(item.id, "tier", event.target.value)}
                    >
                      {TIERS.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.label} · {INR.format(item.tiers[tier.id])}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`gear-price-${item.id}`}>
                      Your own price (₹, optional)
                    </label>
                    <input
                      id={`gear-price-${item.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="100"
                      placeholder="Use the tier price"
                      value={selection.price ?? ""}
                      onChange={(event) => setSelection(item.id, "price", event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3">
                    <input
                      id={`gear-owned-${item.id}`}
                      type="checkbox"
                      checked={Boolean(selection.owned)}
                      onChange={(event) => setSelection(item.id, "owned", event.target.checked)}
                      className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <label htmlFor={`gear-owned-${item.id}`} className="min-h-11 py-3 text-sm font-semibold">
                      Already own
                    </label>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3">
                    <input
                      id={`gear-include-${item.id}`}
                      type="checkbox"
                      checked={selection.include !== false}
                      onChange={(event) => setSelection(item.id, "include", event.target.checked)}
                      className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <label htmlFor={`gear-include-${item.id}`} className="min-h-11 py-3 text-sm font-semibold">
                      In the plan
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Protection coverage
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--danger)]"
                  : result.coveragePct >= 100
                    ? "text-[var(--success)]"
                    : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : `${NUM.format(result.coveragePct)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : result.topMissing
                  ? `Biggest gap: ${result.topMissing.name}`
                  : "Every core item is covered"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy riding gear budget plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
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

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-sm">
              <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
                Where the budget goes
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Price
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Weight
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">{line.name}</td>
                    <td className="py-2 pr-3 text-right">{INR.format(line.price)}</td>
                    <td className="py-2 pr-3 text-right">
                      {line.protectionWeight > 0 ? `${line.protectionWeight}%` : DASH}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        line.status === "deferred" ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {STATUS_LABEL[line.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid. The tier prices are indicative Indian retail bands to start from,
        not quotes — enter what your shortlist actually costs. Protection weights are an explicit
        priority ordering used to rank spending, not a measure of injury risk, and no combination of
        gear makes a crash safe.
      </p>
    </main>
  );
}
