"use client";

import { useMemo, useState } from "react";
import {
  BadgePercent,
  BarChart3,
  Bitcoin,
  Clipboard,
  Download,
  Landmark,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SAMPLE = {
  symbol: "BTC",
  buyPrice: 5200000,
  sellPrice: 6100000,
  quantity: 0.08,
  buyFeePercent: 0.2,
  sellFeePercent: 0.2,
  networkFee: 450,
  slippagePercent: 0.15,
  taxRate: 30,
  extraCharges: 250,
  targetRoi: 20,
};

const SYMBOL_OPTIONS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "MATIC"];
const PIE_COLORS = ["#2563eb", "#059669", "#f59e0b", "#ef4444"];

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value) {
  return `${formatNumber(value, 2)}%`;
}

function clampNumber(value, min = 0, max = 100000000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(min, number), max);
}

function calculatePnl(values) {
  const buyPrice = clampNumber(values.buyPrice);
  const sellPrice = clampNumber(values.sellPrice);
  const quantity = clampNumber(values.quantity, 0, 100000000);
  const buyFeePercent = clampNumber(values.buyFeePercent, 0, 100) / 100;
  const sellFeePercent = clampNumber(values.sellFeePercent, 0, 100) / 100;
  const slippagePercent = clampNumber(values.slippagePercent, 0, 100) / 100;
  const taxRate = clampNumber(values.taxRate, 0, 100) / 100;
  const networkFee = clampNumber(values.networkFee);
  const extraCharges = clampNumber(values.extraCharges);
  const targetRoi = clampNumber(values.targetRoi, 0, 10000) / 100;

  const grossBuy = buyPrice * quantity;
  const buyFee = grossBuy * buyFeePercent;
  const entryCost = grossBuy + buyFee;
  const slippageCost = sellPrice * quantity * slippagePercent;
  const grossSell = sellPrice * quantity;
  const sellFee = grossSell * sellFeePercent;
  const exitValue = grossSell - sellFee - slippageCost;
  const totalFees = buyFee + sellFee + networkFee + extraCharges + slippageCost;
  const grossPnl = grossSell - grossBuy;
  const netPnlBeforeTax = exitValue - entryCost - networkFee - extraCharges;
  const tax = Math.max(0, netPnlBeforeTax * taxRate);
  const netPnl = netPnlBeforeTax - tax;
  const totalCapital = entryCost + networkFee + extraCharges;
  const roi = totalCapital > 0 ? (netPnl / totalCapital) * 100 : 0;
  const priceMove = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;
  const breakevenSellPrice =
    quantity > 0 && (1 - sellFeePercent - slippagePercent) > 0
      ? (entryCost + networkFee + extraCharges) / (quantity * (1 - sellFeePercent - slippagePercent))
      : Infinity;
  const targetSellPrice =
    quantity > 0 && (1 - sellFeePercent - slippagePercent) > 0
      ? ((totalCapital * (1 + targetRoi)) / (1 - taxRate) + entryCost + networkFee + extraCharges - totalCapital) /
        (quantity * (1 - sellFeePercent - slippagePercent))
      : Infinity;
  const riskBuffer = sellPrice - breakevenSellPrice;

  const minScenario = Math.max(0, buyPrice * 0.7);
  const maxScenario = Math.max(buyPrice * 1.4, sellPrice * 1.15, breakevenSellPrice * 1.1 || 0);
  const step = Math.max(1, (maxScenario - minScenario) / 12);
  const scenarios = [];
  for (let price = minScenario; price <= maxScenario + step; price += step) {
    const scenarioGrossSell = price * quantity;
    const scenarioSellFee = scenarioGrossSell * sellFeePercent;
    const scenarioSlippage = scenarioGrossSell * slippagePercent;
    const scenarioBeforeTax = scenarioGrossSell - scenarioSellFee - scenarioSlippage - entryCost - networkFee - extraCharges;
    const scenarioTax = Math.max(0, scenarioBeforeTax * taxRate);
    scenarios.push({
      price,
      label: formatMoney(price, true),
      netPnl: scenarioBeforeTax - scenarioTax,
      beforeTax: scenarioBeforeTax,
    });
  }

  return {
    buyPrice,
    sellPrice,
    quantity,
    grossBuy,
    buyFee,
    entryCost,
    grossSell,
    sellFee,
    slippageCost,
    exitValue,
    totalFees,
    grossPnl,
    netPnlBeforeTax,
    tax,
    netPnl,
    totalCapital,
    roi,
    priceMove,
    breakevenSellPrice,
    targetSellPrice,
    riskBuffer,
    scenarios,
  };
}

function buildSummary(values, metrics) {
  return [
    "Crypto P&L Calculator Summary",
    `Asset: ${values.symbol}`,
    `Buy price: ${formatMoney(values.buyPrice)}`,
    `Sell price: ${formatMoney(values.sellPrice)}`,
    `Quantity: ${formatNumber(values.quantity, 6)}`,
    `Gross buy value: ${formatMoney(metrics.grossBuy)}`,
    `Gross sell value: ${formatMoney(metrics.grossSell)}`,
    `Total fees and slippage: ${formatMoney(metrics.totalFees)}`,
    `Tax estimate: ${formatMoney(metrics.tax)}`,
    `Net P&L: ${formatMoney(metrics.netPnl)}`,
    `ROI: ${formatPercent(metrics.roi)}`,
    `Break-even sell price: ${Number.isFinite(metrics.breakevenSellPrice) ? formatMoney(metrics.breakevenSellPrice) : "N/A"}`,
  ].join("\n");
}

function exportCsv(values, metrics) {
  const rows = [
    ["Scenario Sell Price", "Net P&L Before Tax", "Net P&L After Tax"],
    ...metrics.scenarios.map((row) => [Math.round(row.price), Math.round(row.beforeTax), Math.round(row.netPnl)]),
  ];
  const csv = [
    ["Asset", values.symbol],
    ["Buy Price", values.buyPrice],
    ["Sell Price", values.sellPrice],
    ["Quantity", values.quantity],
    ["Net P&L", Math.round(metrics.netPnl)],
    [],
    ...rows,
  ]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "crypto-pnl-summary.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, onChange, suffix, min = 0, max = 100000000000, step = 1 }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <div className="flex min-w-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] focus-within:border-[var(--primary)] focus-within:shadow-[var(--anslation-ds-focus-ring)]">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
        />
        {suffix ? (
          <span className="flex shrink-0 items-center border-l border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)]">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "amber"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="tool-money-value mt-1 text-[var(--foreground)]">{value}</p>
          <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
      <div className="mb-4 flex min-w-0 items-start gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold text-[var(--foreground)]">{title}</h2>
          {description ? <p className="mt-1 break-words text-sm leading-6 text-[var(--muted-foreground)]">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-[var(--muted-foreground)]">
          {item.name}: {formatMoney(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function CryptoPnlCalculator() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const metrics = useMemo(() => calculatePnl(values), [values]);
  const isProfit = metrics.netPnl >= 0;

  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(values, metrics));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const splitData = [
    { name: "Entry Cost", value: metrics.entryCost },
    { name: "Fees + Slippage", value: metrics.totalFees },
    { name: "Tax", value: metrics.tax },
    { name: isProfit ? "Net Profit" : "Net Loss", value: Math.abs(metrics.netPnl) },
  ].filter((item) => item.value > 0);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
                <Bitcoin className="h-3.5 w-3.5" />
                Crypto trade P&L
              </span>
              <span className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${isProfit ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-rose-500/30 bg-rose-500/10 text-rose-600"}`}>
                {isProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isProfit ? "Profitable trade" : "Loss trade"}
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Crypto P&amp;L Calculator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Calculate net profit or loss from buy price, sell price, quantity,
              exchange fees, slippage, network costs, and tax.
            </p>
          </div>

          <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
            <MetricCard
              icon={isProfit ? TrendingUp : TrendingDown}
              label="Net P&L"
              value={formatMoney(metrics.netPnl)}
              detail={`${formatPercent(metrics.roi)} ROI after fees and tax`}
              tone={isProfit ? "good" : "warn"}
            />
            <MetricCard
              icon={BadgePercent}
              label="Price Move"
              value={formatPercent(metrics.priceMove)}
              detail={`${formatMoney(values.buyPrice)} to ${formatMoney(values.sellPrice)}`}
              tone={metrics.priceMove >= 0 ? "good" : "warn"}
            />
            <MetricCard
              icon={Target}
              label="Break-even Sell"
              value={Number.isFinite(metrics.breakevenSellPrice) ? formatMoney(metrics.breakevenSellPrice) : "N/A"}
              detail={`${formatMoney(metrics.riskBuffer)} buffer at current sell price`}
              tone="amber"
            />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={Wallet}
            label="Entry Cost"
            value={formatMoney(metrics.entryCost)}
            detail={`${formatNumber(values.quantity, 6)} ${values.symbol}`}
          />
          <MetricCard
            icon={Repeat2}
            label="Exit Value"
            value={formatMoney(metrics.exitValue)}
            detail="Sell value after exit fee and slippage"
          />
          <MetricCard
            icon={Landmark}
            label="Fees + Slippage"
            value={formatMoney(metrics.totalFees)}
            detail="Exchange, network, slippage, extra charges"
            tone="amber"
          />
          <MetricCard
            icon={ShieldCheck}
            label="Tax Estimate"
            value={formatMoney(metrics.tax)}
            detail={`${formatPercent(values.taxRate)} tax on positive gains`}
            tone="warn"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,410px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <SectionCard title="Trade Inputs" description="Enter entry, exit, quantity, fees and tax assumptions." icon={Bitcoin}>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Crypto Asset</span>
                <select
                  value={values.symbol}
                  onChange={(event) => updateValue("symbol", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                >
                  {SYMBOL_OPTIONS.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Buy Price" value={values.buyPrice} onChange={(value) => updateValue("buyPrice", value)} suffix="₹" />
                <Field label="Sell Price" value={values.sellPrice} onChange={(value) => updateValue("sellPrice", value)} suffix="₹" />
                <Field label="Quantity" value={values.quantity} onChange={(value) => updateValue("quantity", value)} suffix={values.symbol} step={0.000001} />
                <Field label="Target ROI" value={values.targetRoi} onChange={(value) => updateValue("targetRoi", value)} suffix="%" max={10000} />
              </div>

              <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                <Field label="Buy Fee" value={values.buyFeePercent} onChange={(value) => updateValue("buyFeePercent", value)} suffix="%" max={100} step={0.01} />
                <Field label="Sell Fee" value={values.sellFeePercent} onChange={(value) => updateValue("sellFeePercent", value)} suffix="%" max={100} step={0.01} />
                <Field label="Slippage" value={values.slippagePercent} onChange={(value) => updateValue("slippagePercent", value)} suffix="%" max={100} step={0.01} />
                <Field label="Tax Rate" value={values.taxRate} onChange={(value) => updateValue("taxRate", value)} suffix="%" max={100} />
                <Field label="Network Fee" value={values.networkFee} onChange={(value) => updateValue("networkFee", value)} suffix="₹" />
                <Field label="Extra Charges" value={values.extraCharges} onChange={(value) => updateValue("extraCharges", value)} suffix="₹" />
              </div>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={() => setValues(SAMPLE)} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Load Sample
                </button>
                <button
                  type="button"
                  onClick={() => setValues({ ...SAMPLE, buyPrice: 100, sellPrice: 120, quantity: 1000, networkFee: 0, extraCharges: 0 })}
                  className="btn-secondary"
                >
                  <Repeat2 className="h-4 w-4" />
                  Simple Trade
                </button>
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={() => exportCsv(values, metrics)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Trade Signals" description="Quick read on execution and target price." icon={BarChart3}>
              <div className="tool-card-grid">
                {[
                  ["Gross P&L", metrics.grossPnl, "Before fees and tax"],
                  ["Before Tax P&L", metrics.netPnlBeforeTax, "After execution costs"],
                  ["Target Sell Price", metrics.targetSellPrice, `${formatPercent(values.targetRoi)} ROI target`],
                ].map(([label, value, detail]) => (
                  <article key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">
                      {Number.isFinite(value) ? formatMoney(value) : "N/A"}
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{detail}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="min-w-0 space-y-6">
            <SectionCard title="P&L Scenario Curve" description="Net profit or loss across possible sell prices." icon={TrendingUp}>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.scenarios} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={16} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke="var(--border)" />
                    <Bar dataKey="netPnl" name="Net P&L" radius={[8, 8, 0, 0]}>
                      {metrics.scenarios.map((row) => (
                        <Cell key={row.price} fill={row.netPnl >= 0 ? "#059669" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <SectionCard title="Cost Breakdown" description="Entry cost, fees, tax and P&L composition." icon={Wallet}>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={splitData} innerRadius="55%" outerRadius="82%" paddingAngle={3} dataKey="value" nameKey="name">
                        {splitData.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Execution Summary" description="Trade mechanics at current sell price." icon={BadgePercent}>
                <div className="space-y-3">
                  {[
                    ["Buy Fee", metrics.buyFee],
                    ["Sell Fee", metrics.sellFee],
                    ["Slippage Cost", metrics.slippageCost],
                    ["Network + Extra", values.networkFee + values.extraCharges],
                    ["Tax", metrics.tax],
                  ].map(([label, value], index) => (
                    <div key={label} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                        <span className="min-w-0 break-words">{label}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-[var(--foreground)]">{formatMoney(value)}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard title="Scenario Table" description="Potential outcome at different exit prices." icon={Target}>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {metrics.scenarios.filter((_, index) => index % 2 === 0).slice(0, 9).map((row) => (
                  <article key={row.price} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Sell at {formatMoney(row.price)}</p>
                    <p className={`mt-2 break-words text-lg font-bold ${row.netPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatMoney(row.netPnl)}
                    </p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">After fees and tax</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-700">
          Crypto P&L is an estimate. Real exchange fees, spreads, funding costs, slippage, taxes, and execution price can change final results.
        </div>
      </div>
    </main>
  );
}
