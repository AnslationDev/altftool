"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Repeat, RotateCcw, Trash2 } from "lucide-react";

import { BILLING_CYCLES, STATUSES, auditSubscriptions } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const STARTER_ITEMS = [
  { id: 1, name: "Video streaming", amount: "649", cycle: "monthly", seats: "1", status: "keep" },
  { id: 2, name: "Music streaming", amount: "1499", cycle: "yearly", seats: "1", status: "keep" },
  { id: 3, name: "Gym membership", amount: "1200", cycle: "monthly", seats: "1", status: "cancel" },
  { id: 4, name: "Cloud storage", amount: "2999", cycle: "quarterly", seats: "1", status: "review" },
];

const DEFAULTS = { income: "100000", growth: "8", horizon: "5" };

const blankItem = (id) => ({ id, name: "", amount: "", cycle: "monthly", seats: "1", status: "keep" });

export default function ToolHome() {
  const [items, setItems] = useState(STARTER_ITEMS);
  const [nextId, setNextId] = useState(STARTER_ITEMS.length + 1);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [growth, setGrowth] = useState(DEFAULTS.growth);
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      auditSubscriptions({
        items,
        monthlyIncome: income,
        annualPriceIncrease: growth,
        horizonYears: horizon,
      }),
    [items, income, growth, horizon],
  );

  const hasError = Boolean(result.error);

  const updateItem = (id, key, value) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const addItem = () => {
    setItems((current) => [...current, blankItem(nextId)]);
    setNextId((current) => current + 1);
  };

  const removeItem = (id) => {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  };

  const reset = () => {
    setItems(STARTER_ITEMS);
    setNextId(STARTER_ITEMS.length + 1);
    setIncome(DEFAULTS.income);
    setGrowth(DEFAULTS.growth);
    setHorizon(DEFAULTS.horizon);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Subscription Spend Audit",
      `${result.count} subscriptions costing ${money(result.totalAnnual)} a year (${money(result.totalMonthly)} a month)`,
      result.incomeSharePct === null
        ? "Share of income: not calculated"
        : `Share of take-home pay: ${num(result.incomeSharePct)}%`,
      `Marked to cancel: ${money(result.cancelAnnual)} a year saved`,
      `Marked to review: ${money(result.reviewAnnual)} a year`,
      `Kept spend over ${result.horizonYears} years at ${num(Number(growth) || 0)}% price rises: ${money(result.horizonCost)}`,
      result.biggestName ? `Biggest line: ${result.biggestName} at ${money(result.biggestAnnual)} a year` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [growth, hasError, result]);

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

  const rows = hasError
    ? [
        ["Cost every month", DASH],
        ["Share of take-home pay", DASH],
        ["Saved by cancelling", DASH],
        ["Under review", DASH],
        ["Kept spend over the horizon", DASH],
        ["Biggest single line", DASH],
      ]
    : [
        ["Cost every month", money(result.totalMonthly)],
        [
          "Share of take-home pay",
          result.incomeSharePct === null ? "Enter income to see this" : `${num(result.incomeSharePct)}%`,
        ],
        ["Saved by cancelling", `${money(result.cancelAnnual)} a year`],
        ["Under review", `${money(result.reviewAnnual)} a year`],
        [`Kept spend over ${result.horizonYears} years`, money(result.horizonCost)],
        [
          "Biggest single line",
          result.biggestName ? `${result.biggestName} · ${money(result.biggestAnnual)}` : DASH,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Repeat className="h-4 w-4" aria-hidden="true" />
          Recurring spend
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Subscription Spend Audit Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weekly, monthly, quarterly and yearly charges cannot be added up until they sit on the
          same basis. List every recurring payment and see the real annual number, what each line
          costs as a share of the total, and what cancelling the dead ones gives back.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your subscriptions</h2>
        <ul className="mt-4 space-y-4">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`sub-name-${item.id}`}>
                    Name
                  </label>
                  <input
                    id={`sub-name-${item.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="text"
                    placeholder={`Subscription ${index + 1}`}
                    value={item.name}
                    onChange={(event) => updateItem(item.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`sub-amount-${item.id}`}>
                    Price charged (₹)
                  </label>
                  <input
                    id={`sub-amount-${item.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={item.amount}
                    onChange={(event) => updateItem(item.id, "amount", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`sub-cycle-${item.id}`}>
                    Billed
                  </label>
                  <select
                    id={`sub-cycle-${item.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    value={item.cycle}
                    onChange={(event) => updateItem(item.id, "cycle", event.target.value)}
                  >
                    {BILLING_CYCLES.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`sub-seats-${item.id}`}>
                    Seats / licences
                  </label>
                  <input
                    id={`sub-seats-${item.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={item.seats}
                    onChange={(event) => updateItem(item.id, "seats", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`sub-status-${item.id}`}>
                    Decision
                  </label>
                  <select
                    id={`sub-status-${item.id}`}
                    className={`mt-1.5 ${INPUT_CLASS}`}
                    value={item.status}
                    onChange={(event) => updateItem(item.id, "status", event.target.value)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                  aria-label={`Remove ${item.name || `subscription ${index + 1}`}`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addItem} className={`mt-4 ${GHOST_BTN}`} aria-label="Add another subscription">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subscription
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sub-income">
              Monthly take-home pay (₹)
            </label>
            <input
              id="sub-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sub-growth">
              Expected price rise (% per year)
            </label>
            <input
              id="sub-growth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={growth}
              onChange={(event) => setGrowth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sub-horizon">
              Projection horizon (years)
            </label>
            <input
              id="sub-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
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
              True annual drain
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalAnnual)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the audit."
                : `${result.count} recurring payments normalised to a year`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy subscription audit summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the audit" className={PRIMARY_BTN}>
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

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ranked by yearly cost</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Subscription</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Billed</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per month</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per year</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.name}</span>
                      {row.status === "cancel" && (
                        <span className="ml-2 rounded px-1.5 py-0.5 text-xs font-semibold text-[var(--danger)]">
                          cancel
                        </span>
                      )}
                      {row.status === "review" && (
                        <span className="ml-2 rounded px-1.5 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                          review
                        </span>
                      )}
                      {row.seats > 1 && (
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">×{row.seats}</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.cycleLabel}</td>
                    <td className="py-2 pr-3 text-right">{money(row.monthly)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(row.annual)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{num(row.sharePct)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Weekly plans bill every seven days, so they charge about 52.18 times a year rather than
            52 — that is why the annual figure is a little above 52 × the sticker price.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing is stored or sent anywhere; the audit runs entirely in your browser. Figures are
        informational and exclude taxes or promotional pricing that ends mid-term.
      </p>
    </main>
  );
}
