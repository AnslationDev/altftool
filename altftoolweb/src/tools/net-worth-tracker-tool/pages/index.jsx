"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";

import { ASSET_CATEGORIES, LIABILITY_CATEGORIES, computeNetWorth } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${num(value)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_ASSETS = [
  { id: 1, label: "Savings and sweep balance", category: "cash", amount: "300000" },
  { id: 2, label: "Mutual funds and stocks", category: "equity", amount: "1200000" },
  { id: 3, label: "EPF and PPF", category: "retirement", amount: "800000" },
  { id: 4, label: "Flat", category: "realEstate", amount: "6000000" },
  { id: 5, label: "Jewellery", category: "gold", amount: "500000" },
  { id: 6, label: "Car", category: "vehicle", amount: "600000" },
];

const DEFAULT_LIABILITIES = [
  { id: 1, label: "Home loan outstanding", category: "homeLoan", amount: "4200000" },
  { id: 2, label: "Car loan outstanding", category: "vehicleLoan", amount: "350000" },
  { id: 3, label: "Credit card bill", category: "creditCard", amount: "60000" },
];

const nextId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

function RowEditor({ rows, setRows, categories, idPrefix, addLabel, emptyCategory }) {
  const update = (id, patch) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="sr-only" htmlFor={`${idPrefix}-label-${row.id}`}>
              Name of this entry
            </label>
            <input
              id={`${idPrefix}-label-${row.id}`}
              className={INPUT_CLASS}
              type="text"
              placeholder="Name"
              value={row.label}
              onChange={(event) => update(row.id, { label: event.target.value })}
            />
            <label className="sr-only" htmlFor={`${idPrefix}-cat-${row.id}`}>
              Category
            </label>
            <select
              id={`${idPrefix}-cat-${row.id}`}
              className={`mt-2 ${INPUT_CLASS}`}
              value={row.category}
              onChange={(event) => update(row.id, { category: event.target.value })}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor={`${idPrefix}-amt-${row.id}`}>
              Amount in rupees
            </label>
            <input
              id={`${idPrefix}-amt-${row.id}`}
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              placeholder="Amount"
              value={row.amount}
              onChange={(event) => update(row.id, { amount: event.target.value })}
            />
          </div>
          <button
            type="button"
            onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
            aria-label={`Remove ${row.label || "this row"}`}
            className={`${GHOST_BTN} sm:w-auto`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sm:sr-only">Remove</span>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setRows((current) => [
            ...current,
            { id: nextId(current), label: "", category: emptyCategory, amount: "" },
          ])
        }
        className={GHOST_BTN}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  );
}

export default function ToolHome() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState(DEFAULT_LIABILITIES);
  const [expenses, setExpenses] = useState("60000");
  const [age, setAge] = useState("40");
  const [income, setIncome] = useState("2400000");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeNetWorth({
        assets,
        liabilities,
        monthlyExpenses: expenses,
        age,
        annualIncome: income,
      }),
    [assets, liabilities, expenses, age, income],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Net Worth Statement",
      `Total assets: ${money(result.totalAssets)}`,
      `Total liabilities: ${money(result.totalLiabilities)}`,
      `Net worth: ${money(result.netWorth)}`,
      `Liquid assets: ${money(result.liquidAssets)} (${pct(result.liquidSharePct)})`,
      `Financial vs physical: ${pct(result.financialSharePct)} / ${pct(result.physicalSharePct)}`,
      result.debtToAssetPct === null
        ? "Debt-to-asset ratio: n/a"
        : `Debt-to-asset ratio: ${pct(result.debtToAssetPct)}`,
      result.liquidityMonths === null
        ? null
        : `Liquidity: ${num(result.liquidityMonths)} months of expenses`,
      result.benchmark
        ? `Wealth benchmark: expected ${money(result.benchmark.expected)}, you are at ${num(result.benchmark.ratio)}x — ${result.benchmark.band}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
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
    setAssets(DEFAULT_ASSETS);
    setLiabilities(DEFAULT_LIABILITIES);
    setExpenses("60000");
    setAge("40");
    setIncome("2400000");
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Total assets", DASH],
        ["Total liabilities", DASH],
        ["Liquid assets", DASH],
        ["Financial assets", DASH],
        ["Property, gold and vehicles", DASH],
        ["Depreciating assets", DASH],
        ["Unsecured debt", DASH],
        ["Debt-to-asset ratio", DASH],
        ["Liquidity in months of expenses", DASH],
      ]
    : [
        ["Total assets", money(result.totalAssets)],
        ["Total liabilities", money(result.totalLiabilities)],
        ["Liquid assets", `${money(result.liquidAssets)} (${pct(result.liquidSharePct)})`],
        ["Financial assets", `${money(result.financialAssets)} (${pct(result.financialSharePct)})`],
        [
          "Property, gold and vehicles",
          `${money(result.physicalAssets)} (${pct(result.physicalSharePct)})`,
        ],
        [
          "Depreciating assets",
          `${money(result.depreciatingAssets)} (${pct(result.depreciatingSharePct)})`,
        ],
        [
          "Unsecured debt",
          `${money(result.unsecuredDebt)} (${pct(result.unsecuredSharePct)} of debt)`,
        ],
        [
          "Debt-to-asset ratio",
          result.debtToAssetPct === null ? DASH : pct(result.debtToAssetPct),
        ],
        [
          "Liquidity in months of expenses",
          result.liquidityMonths === null
            ? "Add monthly expenses"
            : `${num(result.liquidityMonths)} months`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Personal balance sheet
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Net Worth Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List what you own at today&rsquo;s realisable value and what you owe at outstanding principal.
          The statement shows net worth plus the ratios it exists to expose — how liquid you are, how
          much sits in property and gold, and how much of the balance sheet is borrowed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="mb-3 text-base font-semibold">Assets</h2>
        <RowEditor
          rows={assets}
          setRows={setAssets}
          categories={ASSET_CATEGORIES}
          idPrefix="asset"
          addLabel="Add an asset"
          emptyCategory="cash"
        />
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="mb-3 text-base font-semibold">Liabilities</h2>
        <RowEditor
          rows={liabilities}
          setRows={setLiabilities}
          categories={LIABILITY_CATEGORIES}
          idPrefix="liability"
          addLabel="Add a liability"
          emptyCategory="personalLoan"
        />
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="mb-3 text-base font-semibold">Context (optional)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nw-expenses">
              Monthly household expenses (₹)
            </label>
            <input
              id="nw-expenses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={expenses}
              onChange={(event) => setExpenses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nw-age">
              Your age
            </label>
            <input
              id="nw-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nw-income">
              Annual pre-tax income (₹)
            </label>
            <input
              id="nw-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
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
              Net worth
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.netWorth)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see your statement." : result.debtVerdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy net worth statement"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!hasError && (
          <div
            className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Liquid assets are ${pct(result.liquidSharePct)} of total assets`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.liquidSharePct))}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.benchmark && (
          <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            <p className="font-semibold">
              Wealth benchmark: {money(result.benchmark.expected)} expected, you are at{" "}
              {num(result.benchmark.ratio)}x
            </p>
            <p className="mt-1 text-[var(--muted-foreground)]">
              The Stanley and Danko rule (age × annual income ÷ 10) puts you in the {result.benchmark.band}{" "}
              band. It is a rough yardstick — it is harsh on the young and on anyone who has just
              cleared a large debt.
            </p>
          </div>
        )}
      </section>

      {!hasError && result.composition.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where your assets sit</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Asset</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Value</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.composition.map((row, index) => (
                  <tr key={`${row.label}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {row.categoryLabel}
                      {row.liquid ? " · liquid" : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2 text-right font-semibold">{pct(row.sharePct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && result.debts.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What you owe</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Liability</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Outstanding</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.debts.map((row, index) => (
                  <tr key={`${row.label}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {row.categoryLabel}
                      {row.unsecured ? " · unsecured" : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2 text-right font-semibold">{pct(row.sharePct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing you type is sent anywhere — the statement is worked out in your browser. Value
        property and jewellery at what you would realistically receive, not at purchase price.
        Informational only, not financial advice.
      </p>
    </main>
  );
}
