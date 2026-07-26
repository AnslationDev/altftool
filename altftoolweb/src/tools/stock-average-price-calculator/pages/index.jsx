"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, Plus, RotateCcw, Trash2 } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULT_LOTS = [
  { id: 1, qty: "50", price: "250" },
  { id: 2, qty: "30", price: "210" },
  { id: 3, qty: "20", price: "180" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

/** Weighted average buy price = total money spent / total shares held. */
export function averageBuyPrice(lots, chargesPerLot = 0) {
  let qty = 0;
  let cost = 0;
  for (const lot of lots) {
    qty += lot.qty;
    cost += lot.qty * lot.price + chargesPerLot;
  }
  if (!(qty > 0)) return { qty: 0, cost: 0, average: 0 };
  return { qty, cost, average: cost / qty };
}

/**
 * Extra shares to buy at `price` so the blended average becomes `target`.
 * (cost + x*price) / (qty + x) = target  =>  x = (target*qty - cost) / (price - target)
 */
export function sharesToReachAverage(qty, cost, price, target) {
  const denominator = price - target;
  if (Math.abs(denominator) < 1e-9) return null;
  const x = (target * qty - cost) / denominator;
  return x > 0 && Number.isFinite(x) ? x : null;
}

export default function ToolHome() {
  const [lots, setLots] = useState(DEFAULT_LOTS);
  const [charges, setCharges] = useState("0");
  const [currentPrice, setCurrentPrice] = useState("200");
  const [targetAverage, setTargetAverage] = useState("210");
  const [copied, setCopied] = useState(false);

  const addLot = () => {
    setLots((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, qty: "", price: "" }];
    });
  };

  const removeLot = (id) => {
    setLots((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  const updateLot = (id, field, value) => {
    setLots((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const reset = () => {
    setLots(DEFAULT_LOTS);
    setCharges("0");
    setCurrentPrice("200");
    setTargetAverage("210");
    setCopied(false);
  };

  const calc = useMemo(() => {
    const fee = toNumber(charges);
    if (Number.isNaN(fee) || fee < 0) {
      return { error: "Charges per transaction must be zero or a positive number." };
    }

    const parsed = [];
    for (const row of lots) {
      const qty = toNumber(row.qty);
      const price = toNumber(row.price);
      const blank = String(row.qty).trim() === "" && String(row.price).trim() === "";
      if (blank) continue;
      if (Number.isNaN(qty) || Number.isNaN(price)) {
        return { error: "Every filled purchase needs a valid quantity and price." };
      }
      if (qty <= 0) return { error: "Quantity must be greater than zero in every purchase." };
      if (price <= 0) return { error: "Buy price must be greater than zero in every purchase." };
      parsed.push({ qty, price });
    }

    if (parsed.length === 0) {
      return { error: "Add at least one purchase with a quantity and a buy price." };
    }

    const { qty, cost, average } = averageBuyPrice(parsed, fee);
    const grossCost = parsed.reduce((sum, lot) => sum + lot.qty * lot.price, 0);
    const totalCharges = fee * parsed.length;

    const highest = Math.max(...parsed.map((lot) => lot.price));
    const lowest = Math.min(...parsed.map((lot) => lot.price));

    const market = toNumber(currentPrice);
    const hasMarket = !Number.isNaN(market) && market > 0;
    const marketValue = hasMarket ? market * qty : 0;
    const pnl = hasMarket ? marketValue - cost : 0;
    const pnlPct = hasMarket && cost > 0 ? (pnl / cost) * 100 : 0;

    const target = toNumber(targetAverage);
    let plan = null;
    if (hasMarket && !Number.isNaN(target) && target > 0) {
      const extra = sharesToReachAverage(qty, cost, market, target);
      if (extra !== null) {
        plan = {
          target,
          shares: Math.ceil(extra),
          outlay: Math.ceil(extra) * market,
          direction: market < average ? "down" : "up",
        };
      }
    }

    return {
      lots: parsed,
      qty,
      cost,
      grossCost,
      totalCharges,
      average,
      highest,
      lowest,
      hasMarket,
      market,
      marketValue,
      pnl,
      pnlPct,
      plan,
    };
  }, [lots, charges, currentPrice, targetAverage]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const lines = [
      "Stock Average Price Calculator",
      `Purchases: ${calc.lots.length}`,
      ...calc.lots.map((lot, index) => `  ${index + 1}. ${num(lot.qty)} shares @ ${money2(lot.price)}`),
      `Total shares: ${num(calc.qty)}`,
      `Total invested (incl. charges): ${money(calc.cost)}`,
      `Average buy price: ${money2(calc.average)}`,
    ];
    if (calc.hasMarket) {
      lines.push(`Current price: ${money2(calc.market)}`);
      lines.push(`Current value: ${money(calc.marketValue)}`);
      lines.push(`Unrealised P&L: ${money(calc.pnl)} (${pct(calc.pnlPct)})`);
    }
    if (calc.plan) {
      lines.push(
        `To reach an average of ${money2(calc.plan.target)}: buy ${num(calc.plan.shares)} more shares at ${money2(calc.market)} (${money(calc.plan.outlay)})`,
      );
    }
    return lines.join("\n");
  }, [calc]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Investing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stock Average Price Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add every purchase of the same stock to get the weighted average buy price, total
          quantity and invested amount — plus how many extra shares it takes to hit a target
          average.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your purchases</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          One row per buy order. Leave a row blank to ignore it.
        </p>

        <div className="mt-4 space-y-3">
          {lots.map((lot, index) => (
            <div key={lot.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className={LABEL_CLASS} htmlFor={`lot-qty-${lot.id}`}>
                  Buy {index + 1} — quantity
                </label>
                <input
                  id={`lot-qty-${lot.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={lot.qty}
                  onChange={(event) => updateLot(lot.id, "qty", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`lot-price-${lot.id}`}>
                  Buy {index + 1} — price per share (INR)
                </label>
                <input
                  id={`lot-price-${lot.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={lot.price}
                  onChange={(event) => updateLot(lot.id, "price", event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeLot(lot.id)}
                disabled={lots.length <= 1}
                aria-label={`Remove purchase ${index + 1}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove</span>
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addLot} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another purchase
        </button>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="avg-charges">
              Charges per order (INR, optional)
            </label>
            <input
              id="avg-charges"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={charges}
              onChange={(event) => setCharges(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="avg-current">
              Current market price (INR, optional)
            </label>
            <input
              id="avg-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={currentPrice}
              onChange={(event) => setCurrentPrice(event.target.value)}
            />
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Average buy price
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money2(calc.average)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {num(calc.qty)} shares · {money(calc.cost)} invested
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy average buy price result"
                  className={GHOST_BTN}
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
              {[
                ["Total shares held", num(calc.qty)],
                ["Cost of shares", money(calc.grossCost)],
                ["Brokerage / charges added", money(calc.totalCharges)],
                ["Total invested", money(calc.cost)],
                ["Highest price paid", money2(calc.highest)],
                ["Lowest price paid", money2(calc.lowest)],
                ...(calc.hasMarket
                  ? [
                      ["Current market value", money(calc.marketValue)],
                      [
                        "Unrealised profit / loss",
                        `${money(calc.pnl)} (${pct(calc.pnlPct)})`,
                      ],
                    ]
                  : []),
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.hasMarket && (
              <p
                className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                  calc.pnl >= 0
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                {calc.pnl >= 0
                  ? `Trading ${pct(Math.abs(calc.pnlPct))} above your average of ${money2(calc.average)}.`
                  : `Trading ${pct(Math.abs(calc.pnlPct))} below your average of ${money2(calc.average)}.`}
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Averaging planner</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              How many more shares at the current market price would move your average to a chosen
              level?
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="avg-target">
                  Target average price (INR)
                </label>
                <input
                  id="avg-target"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={targetAverage}
                  onChange={(event) => setTargetAverage(event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Buying at {calc.hasMarket ? money2(calc.market) : "the market price"} — set a
                  target below your average to average down, above it to average up.
                </p>
              </div>
            </div>

            {calc.plan ? (
              <div className="mt-4 rounded-md bg-[var(--muted)] px-4 py-3">
                <p className="text-2xl font-semibold text-[var(--primary)]">
                  {num(calc.plan.shares)} more shares
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Costing about {money(calc.plan.outlay)} at {money2(calc.market)} — this pulls your
                  average {calc.plan.direction === "down" ? "down" : "up"} to roughly{" "}
                  {money2(calc.plan.target)} across {num(calc.qty + calc.plan.shares)} shares.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                That target average is not reachable by buying at the current market price — the
                target has to sit between the market price and your existing average.
              </p>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not investment advice. Your broker&apos;s contract note is the final
        word on quantities, prices and charges — and averaging down increases the money at risk in
        a single stock.
      </p>
    </main>
  );
}
