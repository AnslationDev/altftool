"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  Info,
  ReceiptIndianRupee,
  RotateCcw,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const GST_RATE = 0.18;
const SEBI_RATE = 0.000001;
const DP_BASE = 13.5;

const segments = [
  {
    id: "delivery",
    label: "Equity Delivery",
    short: "CNC",
    unit: "shares",
    lots: false,
    hint: "Shares bought today and held overnight in your demat account.",
  },
  {
    id: "intraday",
    label: "Equity Intraday",
    short: "MIS",
    unit: "shares",
    lots: false,
    hint: "Bought and squared off the same session, so no delivery and no DP charge.",
  },
  {
    id: "futures",
    label: "F&O Futures",
    short: "FUT",
    unit: "units",
    lots: true,
    hint: "Turnover is the full contract value — price multiplied by lot size.",
  },
  {
    id: "options",
    label: "F&O Options",
    short: "OPT",
    unit: "units",
    lots: true,
    hint: "Every charge except stamp duty is levied on premium turnover, not strike value.",
  },
];

const rates = {
  delivery: {
    sttBuy: 0.001,
    sttSell: 0.001,
    sttFormula: "0.1% x buy turnover + 0.1% x sell turnover",
    txn: 0.0000297,
    txnFormula: "0.00297% x total turnover (NSE)",
    stampBuy: 0.00015,
    stampFormula: "0.015% x buy turnover",
    dp: true,
  },
  intraday: {
    sttBuy: 0,
    sttSell: 0.00025,
    sttFormula: "0.025% x sell turnover (sell side only)",
    txn: 0.0000297,
    txnFormula: "0.00297% x total turnover (NSE)",
    stampBuy: 0.00003,
    stampFormula: "0.003% x buy turnover",
    dp: false,
  },
  futures: {
    sttBuy: 0,
    sttSell: 0.0002,
    sttFormula: "0.02% x sell turnover (sell side only)",
    txn: 0.0000173,
    txnFormula: "0.00173% x total turnover (NSE futures)",
    stampBuy: 0.00002,
    stampFormula: "0.002% x buy turnover",
    dp: false,
  },
  options: {
    sttBuy: 0,
    sttSell: 0.001,
    sttFormula: "0.1% x sell premium turnover (sell side only)",
    txn: 0.0003503,
    txnFormula: "0.03503% x total premium turnover (NSE options)",
    stampBuy: 0.00003,
    stampFormula: "0.003% x buy premium turnover",
    dp: false,
  },
};

const brokerageFormula = {
  delivery: "Zero brokerage on delivery",
  intraday: "Lower of Rs 20 or 0.03% per executed order, both sides",
  futures: "Lower of Rs 20 or 0.03% per executed order, both sides",
  options: "Flat Rs 20 per executed order, both sides",
};

const presets = [
  {
    label: "Delivery: 100 shares 1,450 to 1,520",
    segment: "delivery",
    buyPrice: 1450,
    sellPrice: 1520,
    quantity: 100,
  },
  {
    label: "Intraday scalp: 500 shares 320 to 322",
    segment: "intraday",
    buyPrice: 320,
    sellPrice: 322,
    quantity: 500,
  },
  {
    label: "Futures: 2 lots 24,100 to 24,180",
    segment: "futures",
    buyPrice: 24100,
    sellPrice: 24180,
    lots: 2,
    lotSize: 75,
  },
  {
    label: "Options: 4 lots premium 120 to 148",
    segment: "options",
    buyPrice: 120,
    sellPrice: 148,
    lots: 4,
    lotSize: 75,
  },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (value) => inr.format(Number.isFinite(value) ? value : 0);
const formatExact = (value) => inrPaise.format(Number.isFinite(value) ? value : 0);
const formatSigned = (value) => `${value < 0 ? "-" : "+"}${inr.format(Math.abs(value || 0))}`;
const formatPoints = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

function computeCharges(input) {
  const { segment, buyPrice, sellPrice, quantity, model, customPct, customCap } = input;
  const table = rates[segment];
  const buyTurnover = Math.max(0, buyPrice) * Math.max(0, quantity);
  const sellTurnover = Math.max(0, sellPrice) * Math.max(0, quantity);
  const turnover = buyTurnover + sellTurnover;

  const brokerageForSide = (sideTurnover) => {
    if (sideTurnover <= 0) return 0;
    if (model === "custom") {
      const percentFee = (Math.max(0, customPct) / 100) * sideTurnover;
      return customCap > 0 ? Math.min(percentFee, customCap) : percentFee;
    }
    if (segment === "delivery") return 0;
    if (segment === "options") return 20;
    return Math.min(20, 0.0003 * sideTurnover);
  };

  const brokerage = brokerageForSide(buyTurnover) + brokerageForSide(sellTurnover);
  const stt = table.sttBuy * buyTurnover + table.sttSell * sellTurnover;
  const txn = table.txn * turnover;
  const sebi = SEBI_RATE * turnover;
  const stamp = table.stampBuy * buyTurnover;
  const gst = GST_RATE * (brokerage + txn + sebi);
  const dp = table.dp && sellTurnover > 0 ? DP_BASE * (1 + GST_RATE) : 0;
  const total = brokerage + stt + txn + sebi + stamp + gst + dp;

  return { buyTurnover, sellTurnover, turnover, brokerage, stt, txn, sebi, stamp, gst, dp, total };
}

function solveBreakevenPrice(input) {
  if (input.quantity <= 0 || input.buyPrice <= 0) return input.buyPrice;
  let sell = input.buyPrice;
  for (let i = 0; i < 40; i += 1) {
    const charges = computeCharges({ ...input, sellPrice: sell });
    const next = input.buyPrice + charges.total / input.quantity;
    if (Math.abs(next - sell) < 0.0000001) return next;
    sell = next;
  }
  return sell;
}

export default function ToolHome() {
  const [segment, setSegment] = useState("delivery");
  const [buyPrice, setBuyPrice] = useState(1450);
  const [sellPrice, setSellPrice] = useState(1520);
  const [quantity, setQuantity] = useState(100);
  const [lots, setLots] = useState(2);
  const [lotSize, setLotSize] = useState(75);
  const [model, setModel] = useState("zerodha");
  const [customPct, setCustomPct] = useState(0.25);
  const [customCap, setCustomCap] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSegment = segments.find((item) => item.id === segment) || segments[0];
  const effectiveQty = activeSegment.lots
    ? Math.max(0, Number(lots) || 0) * Math.max(0, Number(lotSize) || 0)
    : Math.max(0, Number(quantity) || 0);

  const params = useMemo(
    () => ({
      segment,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice) || 0,
      quantity: effectiveQty,
      model,
      customPct: Number(customPct) || 0,
      customCap: Number(customCap) || 0,
    }),
    [segment, buyPrice, sellPrice, effectiveQty, model, customPct, customCap]
  );

  const charges = useMemo(() => computeCharges(params), [params]);

  const grossPnl = (params.sellPrice - params.buyPrice) * params.quantity;
  const netPnl = grossPnl - charges.total;
  const breakevenPrice = useMemo(() => solveBreakevenPrice(params), [params]);
  const breakevenMove = breakevenPrice - params.buyPrice;
  const breakevenPct = params.buyPrice > 0 ? (breakevenMove / params.buyPrice) * 100 : 0;
  const chargesPctOfTurnover = charges.turnover > 0 ? (charges.total / charges.turnover) * 100 : 0;

  const rows = useMemo(() => {
    const table = rates[segment];
    const list = [
      {
        key: "brokerage",
        label: "Brokerage",
        formula:
          model === "custom"
            ? `${params.customPct}% per order${params.customCap > 0 ? ` capped at ${formatExact(params.customCap)}` : " (no cap)"}`
            : brokerageFormula[segment],
        amount: charges.brokerage,
      },
      {
        key: "stt",
        label: "STT / CTT",
        formula: table.sttFormula,
        amount: charges.stt,
      },
      {
        key: "txn",
        label: "Exchange transaction charges",
        formula: table.txnFormula,
        amount: charges.txn,
      },
      {
        key: "sebi",
        label: "SEBI turnover fees",
        formula: "Rs 10 per crore (0.0001%) x total turnover",
        amount: charges.sebi,
      },
      {
        key: "stamp",
        label: "Stamp duty",
        formula: table.stampFormula,
        amount: charges.stamp,
      },
      {
        key: "gst",
        label: "GST",
        formula: "18% x (brokerage + transaction charges + SEBI fees)",
        amount: charges.gst,
      },
    ];
    if (table.dp) {
      list.push({
        key: "dp",
        label: "DP charges",
        formula: "Rs 13.50 + 18% GST per scrip on the delivery sell",
        amount: charges.dp,
      });
    }
    return list;
  }, [segment, model, params.customPct, params.customCap, charges]);

  const insight = useMemo(() => {
    if (params.quantity <= 0 || charges.turnover <= 0) {
      return { tone: "muted", text: "Enter a quantity to see how charges land on this trade." };
    }
    if (grossPnl > 0 && netPnl < 0) {
      return {
        tone: "danger",
        text: `Charges of ${formatExact(charges.total)} have wiped out your entire gross profit of ${formatExact(grossPnl)}. A winning trade on the screen is a losing trade in your ledger.`,
      };
    }
    if (grossPnl > 0) {
      const bite = (charges.total / grossPnl) * 100;
      if (bite >= 25) {
        return {
          tone: "warning",
          text: `Charges eat ${formatPoints(bite)}% of your gross profit. On trades this size the cost stack is doing more work than your edge — size up or trade less often.`,
        };
      }
      return {
        tone: "success",
        text: `Charges take ${formatPoints(bite)}% of your gross profit, leaving ${formatExact(netPnl)} in hand. The trade is comfortably clearing its cost base.`,
      };
    }
    if (grossPnl < 0) {
      return {
        tone: "danger",
        text: `The trade is already down ${formatExact(Math.abs(grossPnl))} before costs, and charges add another ${formatExact(charges.total)} to the loss.`,
      };
    }
    return {
      tone: "warning",
      text: `Flat on price, but charges still cost you ${formatExact(charges.total)}. You need ${formatPoints(breakevenMove)} points just to stand still.`,
    };
  }, [params.quantity, charges, grossPnl, netPnl, breakevenMove]);

  const report = useMemo(() => {
    const lines = [
      "Brokerage & Trading Charges Breakdown",
      `Segment: ${activeSegment.label}`,
      `Broker model: ${model === "custom" ? `Custom (${params.customPct}%${params.customCap > 0 ? `, cap ${formatExact(params.customCap)}` : ", no cap"})` : "Zerodha-style discount broker"}`,
      "",
      `Buy price: ${formatExact(params.buyPrice)}`,
      `Sell price: ${formatExact(params.sellPrice)}`,
      `Quantity: ${params.quantity} ${activeSegment.unit}${activeSegment.lots ? ` (${lots} lots x ${lotSize})` : ""}`,
      `Buy turnover: ${formatExact(charges.buyTurnover)}`,
      `Sell turnover: ${formatExact(charges.sellTurnover)}`,
      `Total turnover: ${formatExact(charges.turnover)}`,
      "",
      "Charge breakdown",
      ...rows.map((row) => `  ${row.label}: ${formatExact(row.amount)}  [${row.formula}]`),
      `  Total charges: ${formatExact(charges.total)}`,
      "",
      `Gross P&L: ${formatExact(grossPnl)}`,
      `Net P&L after charges: ${formatExact(netPnl)}`,
      `Breakeven sell price: ${formatExact(breakevenPrice)}`,
      `Breakeven move required: ${formatPoints(breakevenMove)} points (${formatPoints(breakevenPct)}%)`,
      `Charges as % of turnover: ${formatPoints(chargesPctOfTurnover)}%`,
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ];
    return lines.join("\n");
  }, [
    activeSegment,
    model,
    params,
    lots,
    lotSize,
    charges,
    rows,
    grossPnl,
    netPnl,
    breakevenPrice,
    breakevenMove,
    breakevenPct,
    chargesPctOfTurnover,
  ]);

  const applyPreset = (preset) => {
    setSegment(preset.segment);
    setBuyPrice(preset.buyPrice);
    setSellPrice(preset.sellPrice);
    if (preset.quantity) setQuantity(preset.quantity);
    if (preset.lots) setLots(preset.lots);
    if (preset.lotSize) setLotSize(preset.lotSize);
  };

  const resetAll = () => {
    setSegment("delivery");
    setBuyPrice(1450);
    setSellPrice(1520);
    setQuantity(100);
    setLots(2);
    setLotSize(75);
    setModel("zerodha");
    setCustomPct(0.25);
    setCustomCap(0);
  };

  const copyBreakdown = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const toneColor = {
    success: "var(--anslation-ds-success)",
    warning: "var(--anslation-ds-warning)",
    danger: "var(--anslation-ds-danger)",
    muted: "var(--muted-foreground)",
  }[insight.tone];

  const toneBg = {
    success: "var(--anslation-ds-success-soft)",
    warning: "var(--anslation-ds-warning-soft)",
    danger: "var(--anslation-ds-danger-soft)",
    muted: "var(--muted)",
  }[insight.tone];

  const inputClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  const maxRow = Math.max(...rows.map((row) => row.amount), 0.0001);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ReceiptIndianRupee className="h-4 w-4" />
            India trading costs
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Brokerage &amp; Trading Charges Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Your contract note has seven different line items, and most of them are not brokerage. Price a full
            round trip across delivery, intraday, futures and options — with STT, exchange fees, SEBI turnover
            fees, stamp duty, GST and DP charges worked out line by line — and see the profit you actually keep.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <span className="text-sm font-semibold">Segment</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {segments.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSegment(item.id)}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                    segment === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeSegment.hint}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">
                  Buy price {segment === "options" ? "(premium)" : ""}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={buyPrice}
                  onChange={(event) => setBuyPrice(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">
                  Sell price {segment === "options" ? "(premium)" : ""}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={sellPrice}
                  onChange={(event) => setSellPrice(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
            </div>

            {activeSegment.lots ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Lots</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={lots}
                    onChange={(event) => setLots(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Lot size</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={lotSize}
                    onChange={(event) => setLotSize(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : (
              <label className="mt-4 block">
                <span className="text-sm font-semibold">Quantity (shares)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className={inputClass}
                />
              </label>
            )}

            {activeSegment.lots && (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {lots} lots x {lotSize} = {effectiveQty} units. Exchanges revise lot sizes periodically — confirm
                the current size on the contract note.
              </p>
            )}

            <div className="mt-5">
              <span className="text-sm font-semibold">Brokerage model</span>
              <div className="mt-2 grid gap-2">
                <button
                  type="button"
                  onClick={() => setModel("zerodha")}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                    model === "zerodha"
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  Discount broker (Zerodha-style)
                </button>
                <button
                  type="button"
                  onClick={() => setModel("custom")}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                    model === "custom"
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  Custom broker
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {model === "zerodha"
                  ? brokerageFormula[segment]
                  : "Enter your broker's slab. Leave the cap at 0 for a pure percentage plan with no upper limit."}
              </p>
            </div>

            {model === "custom" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Brokerage %</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customPct}
                    onChange={(event) => setCustomPct(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Max per order (cap)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={customCap}
                    onChange={(event) => setCustomCap(Number(event.target.value))}
                    className={inputClass}
                  />
                </label>
              </div>
            )}

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Net P&amp;L after every charge
                </p>
                <button
                  type="button"
                  onClick={copyBreakdown}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy breakdown"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p
                    className="text-4xl font-semibold"
                    style={{
                      color:
                        netPnl >= 0 ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
                    }}
                  >
                    {formatSigned(netPnl)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Gross {formatSigned(grossPnl)} minus charges {formatExact(charges.total)}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  {netPnl >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-success)]" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                  )}
                  {netPnl >= 0 ? "Profitable after costs" : "Loss after costs"}
                </div>
              </div>

              <div className="tool-compact-grid mt-6">
                {[
                  ["Total charges", formatExact(charges.total), "All seven line items combined"],
                  [
                    "Breakeven move",
                    `${formatPoints(breakevenMove)} pts`,
                    `Sell at ${formatExact(breakevenPrice)} to break even (${formatPoints(breakevenPct)}%)`,
                  ],
                  [
                    "Charges / turnover",
                    `${formatPoints(chargesPctOfTurnover)}%`,
                    `On ${formatMoney(charges.turnover)} of total turnover`,
                  ],
                  [
                    "Gross P&L",
                    formatSigned(grossPnl),
                    `(${formatExact(params.sellPrice)} - ${formatExact(params.buyPrice)}) x ${params.quantity}`,
                  ],
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 flex gap-3 rounded-md p-4"
                style={{ background: toneBg }}
                aria-live="polite"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: toneColor }} />
                <p className="text-sm leading-6" style={{ color: "var(--foreground)" }}>
                  {insight.text}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Charge-by-charge breakdown</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Turnover {formatMoney(charges.turnover)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Every rate below is the statutory or exchange-published rate applied to this exact trade.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="py-2 pr-3 font-semibold">Charge</th>
                      <th className="py-2 pr-3 font-semibold">Formula</th>
                      <th className="py-2 pr-3 text-right font-semibold">Amount</th>
                      <th className="py-2 font-semibold">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key} className="border-b border-[var(--border)]">
                        <td className="py-2.5 pr-3 font-semibold">{row.label}</td>
                        <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{row.formula}</td>
                        <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">
                          {formatExact(row.amount)}
                        </td>
                        <td className="py-2.5">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--muted)]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (row.amount / maxRow) * 100)}%`,
                                background: "var(--primary)",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-3 pr-3 font-semibold">Total charges</td>
                      <td className="py-3 pr-3 text-[var(--muted-foreground)]">
                        Sum of every line above
                      </td>
                      <td className="py-3 pr-3 text-right text-base font-semibold tabular-nums text-[var(--primary)]">
                        {formatExact(charges.total)}
                      </td>
                      <td className="py-3" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">How the stack is built</h2>
                </div>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>
                    <strong className="text-[var(--foreground)]">STT is the big one.</strong> Delivery pays it on
                    both legs; intraday, futures and options pay only on the sell.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Options run on premium.</strong> A 4-lot Nifty
                    trade is priced on the premium paid, never on the strike or contract value.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">GST rides on fees, not taxes.</strong> It is 18%
                    of brokerage plus transaction plus SEBI fees — never on STT or stamp duty.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Stamp duty is buy-side only.</strong> Uniform
                    across states since the July 2020 amendment.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">DP charges are flat.</strong> A fixed rupee hit
                    per scrip on every delivery sell, which is why small delivery exits hurt most.
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Good to know</h2>
                </div>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>
                    Rates follow NSE and current statutory levels. BSE and MCX transaction charges differ, and
                    exchanges revise slabs from time to time.
                  </li>
                  <li>
                    Options that are exercised or assigned attract STT of 0.125% on intrinsic value — far costlier
                    than squaring off, so close ITM positions before expiry.
                  </li>
                  <li>
                    This models one buy and one sell. Each extra executed order adds its own brokerage, and a
                    partially filled order can be charged as several executions.
                  </li>
                  <li>
                    Call and auto square-off fees, physical delivery margins, pledge charges and payment-gateway
                    fees are outside this stack.
                  </li>
                  <li>
                    Charges are a cost of doing business, not tax advice — your realised gains are taxed
                    separately under STCG or LTCG.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
