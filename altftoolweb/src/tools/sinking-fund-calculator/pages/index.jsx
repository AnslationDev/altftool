"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PiggyBank, Plus, RotateCcw, Trash2 } from "lucide-react";

import { FREQUENCIES, INCOME_SHARE_WARNING_PCT, computeSinkingFunds } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_ITEMS = [
  { id: 1, name: "Car insurance renewal", amount: "18000", frequency: "annual", monthsUntilDue: "4", alreadySaved: "3000" },
  { id: 2, name: "Term insurance premium", amount: "24000", frequency: "annual", monthsUntilDue: "9", alreadySaved: "0" },
  { id: 3, name: "Family holiday", amount: "120000", frequency: "oneOff", monthsUntilDue: "14", alreadySaved: "20000" },
  { id: 4, name: "Car service", amount: "9000", frequency: "halfYearly", monthsUntilDue: "2", alreadySaved: "9000" },
];

const nextId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

const ITEM_FIELDS = [
  { key: "amount", label: "Amount due (₹)", step: "500" },
  { key: "monthsUntilDue", label: "Months until due", step: "1" },
  { key: "alreadySaved", label: "Already reserved (₹)", step: "500" },
];

export default function ToolHome() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [rate, setRate] = useState("0");
  const [income, setIncome] = useState("80000");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => computeSinkingFunds({ items, annualRate: rate, monthlyIncome: income }),
    [items, rate, income],
  );

  const hasError = Boolean(result.error);

  const updateItem = (id, patch) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sinking Fund Calculator",
      `Set aside each month until the next bills land: ${money2(result.monthlyCatchUp)}`,
      `Steady-state reserve once the cycle resets: ${money2(result.monthlySteady)}`,
      `Recurring expenses cost ${money(result.annualisedRecurring)} a year`,
      `One-off goals: ${money(result.oneOffTotal)}`,
      `Reserved so far: ${money(result.totalReserved)} of ${money(result.totalTarget)} (${pct(result.fundedPct)})`,
      "",
      ...result.items.map(
        (item) =>
          `${item.name}: ${money(item.amount)} in ${item.monthsUntilDue} month(s) — set aside ${money2(item.catchUpMonthly || 0)}/month`,
      ),
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
    setItems(DEFAULT_ITEMS);
    setRate("0");
    setIncome("80000");
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Steady-state monthly reserve", DASH],
        ["Recurring expenses per year", DASH],
        ["One-off goals", DASH],
        ["Total to reserve", DASH],
        ["Reserved so far", DASH],
        ["Still to find", DASH],
        ["Share of monthly income", DASH],
        ["Next bill due", DASH],
      ]
    : [
        ["Steady-state monthly reserve", money2(result.monthlySteady)],
        ["Recurring expenses per year", money(result.annualisedRecurring)],
        ["One-off goals", money(result.oneOffTotal)],
        ["Total to reserve", money(result.totalTarget)],
        ["Reserved so far", `${money(result.totalReserved)} (${pct(result.fundedPct)})`],
        ["Still to find", money(result.totalShortfall)],
        [
          "Share of monthly income",
          result.incomeSharePct === null ? "Add your income" : pct(result.incomeSharePct),
        ],
        [
          "Next bill due",
          `${result.nextDue.name} in ${result.nextDue.monthsUntilDue} month(s)`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Irregular expenses
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sinking Fund Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Insurance renewals, school fees, servicing and travel are not emergencies — they are known
          bills arriving on known dates. This turns them into one monthly reserve, showing both the
          catch-up figure for the bills already approaching and the steady-state cost of each.
        </p>
      </header>

      <section className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-[180px] flex-1">
                <label className={LABEL_CLASS} htmlFor={`sf-name-${item.id}`}>
                  Expense
                </label>
                <input
                  id={`sf-name-${item.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}
                aria-label={`Remove ${item.name || "this expense"}`}
                className={GHOST_BTN}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={SMALL_LABEL} htmlFor={`sf-freq-${item.id}`}>
                  How often it repeats
                </label>
                <select
                  id={`sf-freq-${item.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={item.frequency}
                  onChange={(event) => updateItem(item.id, { frequency: event.target.value })}
                >
                  {FREQUENCIES.map((frequency) => (
                    <option key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </option>
                  ))}
                </select>
              </div>
              {ITEM_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className={SMALL_LABEL} htmlFor={`sf-${field.key}-${item.id}`}>
                    {field.label}
                  </label>
                  <input
                    id={`sf-${field.key}-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={field.step}
                    value={item[field.key]}
                    onChange={(event) => updateItem(item.id, { [field.key]: event.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setItems((current) => [
              ...current,
              {
                id: nextId(current),
                name: "",
                amount: "",
                frequency: "annual",
                monthsUntilDue: "12",
                alreadySaved: "0",
              },
            ])
          }
          className={GHOST_BTN}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add an expense
        </button>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-rate">
              Return on the reserve (% per year)
            </label>
            <input
              id="sf-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sf-income">
              Monthly take-home income (₹)
            </label>
            <input
              id="sf-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Set aside each month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money2(result.monthlyCatchUp)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to size your reserve."
                : `Catch-up rate until the approaching bills are funded; ${money2(result.monthlySteady)} a month once the cycle resets`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy sinking fund plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.incomeStretched && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            These reserves take {pct(result.incomeSharePct)} of your take-home — above the{" "}
            {INCOME_SHARE_WARNING_PCT}% mark where irregular expenses start crowding out everything
            else. Consider stretching a goal or trimming an amount.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Every fund, soonest first</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Expense</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Due in</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Funded</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Catch-up</th>
                  <th scope="col" className="py-2 text-right font-semibold">Steady</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.name}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {item.monthsUntilDue} mo
                    </td>
                    <td className="py-2 pr-3 text-right">{money(item.amount)}</td>
                    <td className="py-2 pr-3 text-right">{pct(item.fundedPct)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {item.catchUpMonthly ? money2(item.catchUpMonthly) : "Funded"}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {item.steadyMonthly ? money2(item.steadyMonthly) : "One-off"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Catch-up is what this bill needs each month between now and its due date. Steady is what
            it costs a month once you have a full cycle to rebuild the fund.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A sinking fund is separate from an emergency fund — it covers bills you already know about,
        so the emergency fund stays untouched for the ones you do not. Keep it somewhere you can
        withdraw on the due date without a penalty. Informational only.
      </p>
    </main>
  );
}
