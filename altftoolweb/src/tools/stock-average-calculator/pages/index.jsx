"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CandlestickChart,
  Copy,
  Plus,
  RotateCcw,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STORAGE_KEY = "altf:stock-average-calculator:v1";

const defaultLots = [
  { id: 1, qty: "50", price: "220" },
  { id: 2, qty: "30", price: "180" },
];

const toNum = (value) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0
  );

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

const formatQty = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);

const formatPct = (value) => `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;

const inputClass =
  "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

export default function ToolHome() {
  const [lots, setLots] = useState(defaultLots);
  const [cmp, setCmp] = useState("195");
  const [brokerage, setBrokerage] = useState("0.3");
  const [plannerMode, setPlannerMode] = useState("target");
  const [targetAvg, setTargetAvg] = useState("200");
  const [budget, setBudget] = useState("20000");
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const nextIdRef = useRef(3);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved?.lots) && saved.lots.length) {
          const cleaned = saved.lots
            .filter((lot) => lot && typeof lot === "object")
            .map((lot, index) => ({
              id: index + 1,
              qty: String(lot.qty ?? ""),
              price: String(lot.price ?? ""),
            }));
          if (cleaned.length) {
            setLots(cleaned);
            nextIdRef.current = cleaned.length + 1;
          }
        }
        if (saved?.cmp !== undefined) setCmp(String(saved.cmp));
        if (saved?.brokerage !== undefined) setBrokerage(String(saved.brokerage));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lots, cmp, brokerage }));
    } catch {}
  }, [lots, cmp, brokerage, hydrated]);

  const position = useMemo(() => {
    const valid = lots
      .map((lot) => ({ id: lot.id, qtyNum: toNum(lot.qty), priceNum: toNum(lot.price) }))
      .filter((lot) => lot.qtyNum > 0 && lot.priceNum > 0);
    const totalQty = valid.reduce((sum, lot) => sum + lot.qtyNum, 0);
    const totalInvested = valid.reduce((sum, lot) => sum + lot.qtyNum * lot.priceNum, 0);
    const average = totalQty > 0 ? totalInvested / totalQty : 0;
    const price = toNum(cmp);
    const value = price > 0 ? totalQty * price : 0;
    const pnl = price > 0 ? value - totalInvested : 0;
    const pnlPct = price > 0 && totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
    const fee = Math.min(Math.max(toNum(brokerage), 0), 25);
    const breakEven = average > 0 ? (average * (1 + fee / 100)) / (1 - fee / 100) : 0;
    return { valid, totalQty, totalInvested, average, price, value, pnl, pnlPct, fee, breakEven };
  }, [lots, cmp, brokerage]);

  const planner = useMemo(() => {
    const { totalQty: Q, average: A, price: P } = position;
    if (Q <= 0) return { error: "Add at least one buy lot with a quantity and price to plan your next purchase." };
    if (P <= 0) return { error: "Enter the current market price to plan your next purchase." };

    if (plannerMode === "target") {
      const T = toNum(targetAvg);
      if (T <= 0) return { error: "Enter a target average price above zero." };
      if (Math.abs(P - A) < 0.005)
        return { error: "The market price equals your average, so buying now keeps the average unchanged." };
      if (P < A) {
        if (T >= A)
          return {
            error: `Your average ${formatPrice(A)} is already at or below ${formatPrice(T)} — no purchase needed.`,
          };
        if (T <= P)
          return {
            error: `Impossible target: buying at ${formatPrice(P)} can never pull the average down to ${formatPrice(
              T
            )}. Pick a target between ${formatPrice(P)} and ${formatPrice(A)}.`,
          };
      } else {
        if (T <= A)
          return {
            error: `Your average ${formatPrice(A)} is already at or below ${formatPrice(T)} — no purchase needed.`,
          };
        if (T >= P)
          return {
            error: `Impossible target: buying at ${formatPrice(P)} can never push the average up to ${formatPrice(
              T
            )}. Pick a target between ${formatPrice(A)} and ${formatPrice(P)}.`,
          };
      }
      const exact = (Q * (A - T)) / (T - P);
      const shares = Math.max(1, Math.ceil(exact - 1e-9));
      const cost = shares * P;
      const newQty = Q + shares;
      const achieved = (Q * A + shares * P) / newQty;
      return { mode: "target", exact, shares, cost, newQty, achieved, target: T };
    }

    const X = toNum(budget);
    if (X <= 0) return { error: "Enter the amount you plan to invest." };
    const shares = Math.floor(X / P + 1e-9);
    if (shares < 1)
      return { error: `A budget of ${formatINR(X)} does not cover even one share at ${formatPrice(P)}.` };
    const cost = shares * P;
    const newQty = Q + shares;
    const newAvg = (Q * A + cost) / newQty;
    return { mode: "budget", shares, cost, leftover: X - cost, newQty, newAvg, oldAvg: A };
  }, [position, plannerMode, targetAvg, budget]);

  const summary = useMemo(() => {
    const lines = [
      "Stock Position Summary",
      ...position.valid.map(
        (lot, index) =>
          `Lot ${index + 1}: ${formatQty(lot.qtyNum)} shares @ ${formatPrice(lot.priceNum)} = ${formatINR(
            lot.qtyNum * lot.priceNum
          )}`
      ),
      `Total quantity: ${formatQty(position.totalQty)}`,
      `Total invested: ${formatINR(position.totalInvested)}`,
      `Weighted average price: ${formatPrice(position.average)}`,
    ];
    if (position.price > 0 && position.totalQty > 0) {
      lines.push(
        `Current market price: ${formatPrice(position.price)}`,
        `Portfolio value: ${formatINR(position.value)}`,
        `Unrealized P&L: ${formatINR(position.pnl)} (${formatPct(position.pnlPct)})`
      );
    }
    if (position.average > 0) {
      lines.push(`Break-even after ${position.fee}% round-trip charges: ${formatPrice(position.breakEven)}`);
    }
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [position]);

  const updateLot = (id, field, value) => {
    setLots((prev) => prev.map((lot) => (lot.id === id ? { ...lot, [field]: value } : lot)));
  };

  const addLot = () => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setLots((prev) => [...prev, { id, qty: "", price: "" }]);
  };

  const removeLot = (id) => {
    setLots((prev) => (prev.length > 1 ? prev.filter((lot) => lot.id !== id) : prev));
  };

  const resetAll = () => {
    setLots(defaultLots.map((lot) => ({ ...lot })));
    nextIdRef.current = 3;
    setCmp("195");
    setBrokerage("0.3");
    setPlannerMode("target");
    setTargetAvg("200");
    setBudget("20000");
  };

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const gain = position.pnl >= 0;
  const pnlColor = gain ? "text-[var(--anslation-ds-success)]" : "text-[var(--anslation-ds-danger)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CandlestickChart className="h-4 w-4" />
            Equity toolkit
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Stock Average & Break-Even Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Add every buy lot to see your true weighted average, live unrealized P&amp;L, and break-even after
            charges — then plan the next purchase with the averaging-down planner.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">Your buy lots</h2>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid gap-3">
              {lots.map((lot, index) => (
                <div
                  key={lot.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">Lot {index + 1} quantity</span>
                    <input
                      type="number"
                      min="0"
                      value={lot.qty}
                      onChange={(event) => updateLot(lot.id, "qty", event.target.value)}
                      className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">Buy price (₹)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.05"
                      value={lot.price}
                      onChange={(event) => updateLot(lot.id, "price", event.target.value)}
                      className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLot(lot.id)}
                    disabled={lots.length <= 1}
                    aria-label={`Remove lot ${index + 1}`}
                    className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLot}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <Plus className="h-4 w-4" />
              Add another lot
            </button>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Current market price (₹)</span>
                <input type="number" min="0" step="0.05" value={cmp} onChange={(event) => setCmp(event.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Round-trip charges (%)</span>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.05"
                  value={brokerage}
                  onChange={(event) => setBrokerage(event.target.value)}
                  className={inputClass}
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Brokerage + STT + other charges across buy and sell, as a percent of trade value.
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Position summary</p>
              <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy summary"}
              </button>
            </div>

            <div aria-live="polite" className="mt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Weighted average price</p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{formatPrice(position.average)}</p>
                </div>
                {position.price > 0 && position.totalQty > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold">
                    {gain ? (
                      <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-success)]" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                    )}
                    <span className={pnlColor}>
                      {formatINR(position.pnl)} ({formatPct(position.pnlPct)})
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Total quantity", formatQty(position.totalQty)],
                  ["Total invested", formatINR(position.totalInvested)],
                  ["Portfolio value", position.price > 0 ? formatINR(position.value) : "—"],
                  ["Break-even price", position.average > 0 ? formatPrice(position.breakEven) : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
              Formula: average = Σ(quantity × price) ÷ total quantity. Break-even = average × (1 + charges%) ÷ (1 −
              charges%), so selling at {formatPrice(position.breakEven)} recovers your capital including{" "}
              {position.fee}% round-trip charges.
            </p>

            {position.valid.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Lot</th>
                      <th className="py-2 pr-3 font-semibold">Qty</th>
                      <th className="py-2 pr-3 font-semibold">Buy price</th>
                      <th className="py-2 pr-3 font-semibold">Invested</th>
                      <th className="py-2 pr-3 font-semibold">Value @ CMP</th>
                      <th className="py-2 font-semibold">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {position.valid.map((lot, index) => {
                      const invested = lot.qtyNum * lot.priceNum;
                      const lotValue = position.price > 0 ? lot.qtyNum * position.price : 0;
                      const lotPnl = lotValue - invested;
                      const lotPct = invested > 0 ? (lotPnl / invested) * 100 : 0;
                      return (
                        <tr key={lot.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 pr-3 text-[var(--muted-foreground)]">{index + 1}</td>
                          <td className="py-2 pr-3">{formatQty(lot.qtyNum)}</td>
                          <td className="py-2 pr-3">{formatPrice(lot.priceNum)}</td>
                          <td className="py-2 pr-3">{formatINR(invested)}</td>
                          <td className="py-2 pr-3">{position.price > 0 ? formatINR(lotValue) : "—"}</td>
                          <td
                            className={`py-2 font-semibold ${
                              position.price > 0
                                ? lotPnl >= 0
                                  ? "text-[var(--anslation-ds-success)]"
                                  : "text-[var(--anslation-ds-danger)]"
                                : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {position.price > 0 ? `${formatINR(lotPnl)} (${formatPct(lotPct)})` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold">Averaging planner</h2>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:max-w-xl">
            {[
              { id: "target", label: "Reach a target average" },
              { id: "budget", label: "I have a budget of ₹X" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlannerMode(item.id)}
                className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                  plannerMode === item.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div>
              {plannerMode === "target" ? (
                <label className="block">
                  <span className="text-sm font-semibold">Target average price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.05"
                    value={targetAvg}
                    onChange={(event) => setTargetAvg(event.target.value)}
                    className={inputClass}
                  />
                  <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">
                    Shares needed = quantity × (average − target) ÷ (target − CMP)
                  </span>
                </label>
              ) : (
                <label className="block">
                  <span className="text-sm font-semibold">Budget for this buy (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className={inputClass}
                  />
                  <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">
                    New average = (old cost + shares × CMP) ÷ new total quantity
                  </span>
                </label>
              )}
            </div>

            <div aria-live="polite" className="rounded-md bg-[var(--muted)] p-5">
              {planner.error ? (
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">{planner.error}</p>
              ) : planner.mode === "target" ? (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    To bring your average from {formatPrice(position.average)} to {formatPrice(planner.target)} at CMP{" "}
                    {formatPrice(position.price)}:
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">
                    Buy {formatQty(planner.shares)} shares
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Cost required", formatINR(planner.cost)],
                      ["New total quantity", formatQty(planner.newQty)],
                      ["Achieved average", formatPrice(planner.achieved)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                    Exact requirement is {formatQty(planner.exact)} shares; rounded up to whole shares.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    With {formatINR(toNum(budget))} at CMP {formatPrice(position.price)} you can buy:
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">
                    {formatQty(planner.shares)} shares
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ["Cost used", formatINR(planner.cost)],
                      ["Cash left over", formatINR(planner.leftover)],
                      ["New average", `${formatPrice(planner.oldAvg)} → ${formatPrice(planner.newAvg)}`],
                      ["New total quantity", formatQty(planner.newQty)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-warning)]" />
            <div>
              <h2 className="text-base font-semibold">Before you average down</h2>
              <ul className="mt-2 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <li className="flex items-start gap-2">
                  <Wallet className="mt-1 h-4 w-4 shrink-0" />
                  Averaging down concentrates more money in a falling stock. A lower average does not fix a broken
                  business — confirm the original reason you bought still holds.
                </li>
                <li className="flex items-start gap-2">
                  <TrendingDown className="mt-1 h-4 w-4 shrink-0" />A stock down 50% must rise 100% just to break even.
                  Catching a falling knife feels cheap at every step down.
                </li>
                <li className="flex items-start gap-2">
                  <Target className="mt-1 h-4 w-4 shrink-0" />
                  Cap single-stock exposure (many investors keep it under 5–10% of the portfolio) and average down in
                  planned steps, not on every dip.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
