"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";

import {
  EXCHANGE_TXN_PERCENT,
  GST_PERCENT,
  STAMP_DUTY_BUY_PERCENT,
  STT_DELIVERY_PERCENT,
  compareDematPlans,
} from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PLANS = [
  {
    id: 1,
    name: "Discount broker",
    amcPerYear: "0",
    dpPerSell: "20",
    brokerageModel: "zero",
    flatPerOrder: "0",
    percentRate: "0",
    capPerOrder: "0",
  },
  {
    id: 2,
    name: "Flat ₹20 plan",
    amcPerYear: "300",
    dpPerSell: "13.5",
    brokerageModel: "flat",
    flatPerOrder: "20",
    percentRate: "0",
    capPerOrder: "0",
  },
  {
    id: 3,
    name: "Full-service 0.30%",
    amcPerYear: "750",
    dpPerSell: "16",
    brokerageModel: "percent",
    flatPerOrder: "0",
    percentRate: "0.3",
    capPerOrder: "0",
  },
];

const DEFAULT_USAGE = {
  buyOrdersPerMonth: "4",
  avgBuyValue: "25000",
  sellOrdersPerMonth: "2",
  avgSellValue: "30000",
  scripsPerSell: "1",
  holdingValue: "350000",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [nextId, setNextId] = useState(4);
  const [usage, setUsage] = useState(DEFAULT_USAGE);
  const [exchange, setExchange] = useState("NSE");
  const [bsda, setBsda] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareDematPlans({
        plans: plans.map((plan) => ({
          name: plan.name,
          amcPerYear: toNumber(plan.amcPerYear),
          dpPerSell: toNumber(plan.dpPerSell),
          brokerageModel: plan.brokerageModel,
          flatPerOrder: toNumber(plan.flatPerOrder),
          percentRate: toNumber(plan.percentRate),
          capPerOrder: toNumber(plan.capPerOrder),
        })),
        buyOrdersPerMonth: toNumber(usage.buyOrdersPerMonth),
        avgBuyValue: toNumber(usage.avgBuyValue),
        sellOrdersPerMonth: toNumber(usage.sellOrdersPerMonth),
        avgSellValue: toNumber(usage.avgSellValue),
        scripsPerSell: toNumber(usage.scripsPerSell),
        exchange,
        bsda,
        holdingValue: toNumber(usage.holdingValue),
      }),
    [plans, usage, exchange, bsda],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Demat Account Cost Comparator",
      `Yearly turnover: ${money(result.turnover)} on ${result.buyOrders} buys and ${result.sellOrders} sells`,
      "",
    ];
    result.ranked.forEach((row, index) => {
      lines.push(`${index + 1}. ${row.name}: ${money2(row.total)} a year (${pct(row.costPercentOfTurnover)} of turnover)`);
    });
    lines.push("", `Cheapest: ${result.cheapest.name}`);
    lines.push(`Most you can save by switching: ${money2(result.maxSaving)} a year`);
    return lines.join("\n");
  }, [hasError, result]);

  const updatePlan = (id, key, value) => {
    setPlans((current) =>
      current.map((plan) => (plan.id === id ? { ...plan, [key]: value } : plan)),
    );
  };

  const addPlan = () => {
    setPlans((current) => [
      ...current,
      {
        id: nextId,
        name: `Plan ${current.length + 1}`,
        amcPerYear: "0",
        dpPerSell: "15",
        brokerageModel: "flat",
        flatPerOrder: "20",
        percentRate: "0",
        capPerOrder: "0",
      },
    ]);
    setNextId((value) => value + 1);
  };

  const removePlan = (id) => {
    setPlans((current) => (current.length > 2 ? current.filter((plan) => plan.id !== id) : current));
  };

  const setUsageField = (key, value) => setUsage((current) => ({ ...current, [key]: value }));

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
    setPlans(DEFAULT_PLANS);
    setNextId(4);
    setUsage(DEFAULT_USAGE);
    setExchange("NSE");
    setBsda(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Broking costs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Demat Account Cost Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put your real trading pattern against several plan structures and see the full yearly bill
          — AMC, DP debit charges, brokerage, {GST_PERCENT}% GST, STT, stamp duty and exchange
          levies — rather than the headline brokerage alone.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How you trade (equity delivery)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dm-buy-orders">
              Buy orders per month
            </label>
            <input
              id="dm-buy-orders"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={usage.buyOrdersPerMonth}
              onChange={(event) => setUsageField("buyOrdersPerMonth", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dm-buy-value">
              Average buy order value (INR)
            </label>
            <input
              id="dm-buy-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={usage.avgBuyValue}
              onChange={(event) => setUsageField("avgBuyValue", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dm-sell-orders">
              Sell orders per month
            </label>
            <input
              id="dm-sell-orders"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={usage.sellOrdersPerMonth}
              onChange={(event) => setUsageField("sellOrdersPerMonth", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dm-sell-value">
              Average sell order value (INR)
            </label>
            <input
              id="dm-sell-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={usage.avgSellValue}
              onChange={(event) => setUsageField("avgSellValue", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dm-scrips">
              Scrips debited per selling day
            </label>
            <input
              id="dm-scrips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={usage.scripsPerSell}
              onChange={(event) => setUsageField("scripsPerSell", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              DP charges are per scrip debited, not per rupee sold.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dm-exchange">
              Exchange
            </label>
            <select
              id="dm-exchange"
              className={`mt-2 ${INPUT_CLASS}`}
              value={exchange}
              onChange={(event) => setExchange(event.target.value)}
            >
              {Object.keys(EXCHANGE_TXN_PERCENT).map((code) => (
                <option key={code} value={code}>
                  {code} — {EXCHANGE_TXN_PERCENT[code]}% transaction charge
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dm-holding">
              Average holding value (INR)
            </label>
            <input
              id="dm-holding"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={usage.holdingValue}
              onChange={(event) => setUsageField("holdingValue", event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm"
              htmlFor="dm-bsda"
            >
              <input
                id="dm-bsda"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={bsda}
                onChange={(event) => setBsda(event.target.checked)}
              />
              Treat as a BSDA account
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Plans to compare</h2>
        <div className="mt-4 space-y-5">
          {plans.map((plan, index) => (
            <div key={plan.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <label className={LABEL_CLASS} htmlFor={`dm-name-${plan.id}`}>
                    Plan {index + 1} name
                  </label>
                  <input
                    id={`dm-name-${plan.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={plan.name}
                    onChange={(event) => updatePlan(plan.id, "name", event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePlan(plan.id)}
                  disabled={plans.length <= 2}
                  aria-label={`Remove plan ${index + 1}`}
                  className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-40 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dm-amc-${plan.id}`}>
                    AMC per year (INR)
                  </label>
                  <input
                    id={`dm-amc-${plan.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="50"
                    value={plan.amcPerYear}
                    onChange={(event) => updatePlan(plan.id, "amcPerYear", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dm-dp-${plan.id}`}>
                    DP charge per scrip sold (INR)
                  </label>
                  <input
                    id={`dm-dp-${plan.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={plan.dpPerSell}
                    onChange={(event) => updatePlan(plan.id, "dpPerSell", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dm-model-${plan.id}`}>
                    Delivery brokerage model
                  </label>
                  <select
                    id={`dm-model-${plan.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={plan.brokerageModel}
                    onChange={(event) => updatePlan(plan.id, "brokerageModel", event.target.value)}
                  >
                    <option value="zero">Zero brokerage on delivery</option>
                    <option value="flat">Flat per executed order</option>
                    <option value="percent">Percentage of turnover</option>
                  </select>
                </div>
                {plan.brokerageModel === "flat" && (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`dm-flat-${plan.id}`}>
                      Flat brokerage per order (INR)
                    </label>
                    <input
                      id={`dm-flat-${plan.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      value={plan.flatPerOrder}
                      onChange={(event) => updatePlan(plan.id, "flatPerOrder", event.target.value)}
                    />
                  </div>
                )}
                {plan.brokerageModel === "percent" && (
                  <>
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`dm-pct-${plan.id}`}>
                        Brokerage rate (% of turnover)
                      </label>
                      <input
                        id={`dm-pct-${plan.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={plan.percentRate}
                        onChange={(event) => updatePlan(plan.id, "percentRate", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`dm-cap-${plan.id}`}>
                        Cap per order (INR, 0 = none)
                      </label>
                      <input
                        id={`dm-cap-${plan.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="5"
                        value={plan.capPerOrder}
                        onChange={(event) => updatePlan(plan.id, "capPerOrder", event.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addPlan} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a plan
        </button>
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
              Cheapest plan for this pattern
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money2(result.cheapest.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : `${result.cheapest.name} — ${money2(result.maxSaving)} a year less than the dearest plan here`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy demat cost comparison"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Yearly turnover", hasError ? DASH : money(result.turnover)],
            [
              "Orders a year",
              hasError ? DASH : `${result.buyOrders} buys, ${result.sellOrders} sells`,
            ],
            ["Scrip debits attracting DP charges", hasError ? DASH : String(result.dpDebits)],
            [
              "Statutory and exchange floor (same for every broker)",
              hasError ? DASH : money2(result.statutoryFloor),
            ],
            [
              "Cheapest plan as a share of turnover",
              hasError ? DASH : pct(result.cheapest.costPercentOfTurnover),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Full cost breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Plan
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Brokerage
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    DP
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    AMC
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    GST
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Statutory
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Total / year
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.name}
                      {row.rank === 1 && (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
                          cheapest
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{money2(row.brokerage)}</td>
                    <td className="py-2 pr-3 text-right">{money2(row.dpCharge)}</td>
                    <td className="py-2 pr-3 text-right">{money2(row.amc)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money2(row.gst)}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money2(row.statutory)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money2(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Statutory column is STT at {STT_DELIVERY_PERCENT}% on each leg, stamp duty at{" "}
            {STAMP_DUTY_BUY_PERCENT}% on buys, the SEBI turnover fee and the exchange transaction
            charge. Those never change with your broker — only brokerage, DP charges and AMC do.
          </p>
          {result.rows.some((row) => row.bsdaApplied) && (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.rows.find((row) => row.bsdaApplied)?.bsdaNote}
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for equity delivery only. Intraday, futures and options carry different STT rates
        and no DP debit charge, and brokers add call-and-trade, auto-square-off, pledge and payment
        gateway fees. Check the current tariff sheet before switching.
      </p>
    </main>
  );
}
