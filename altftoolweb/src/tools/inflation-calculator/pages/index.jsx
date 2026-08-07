"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Coffee,
  Copy,
  FileDown,
  Plane,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CURRENT_YEAR = new Date().getFullYear();

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const formatNumber = (value, digits = 1) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const modes = [
  { id: "future", label: "Future cost", hint: "What will it cost later?" },
  { id: "power", label: "Purchasing power", hint: "What is my cash worth later?" },
  { id: "return", label: "Required return", hint: "What must my money earn?" },
];

const ratePresets = [
  { label: "India CPI ~6%", value: 6 },
  { label: "Lifestyle 8%", value: 8 },
  { label: "Education 10%", value: 10 },
  { label: "Healthcare 12%", value: 12 },
];

const taxSlabs = [0, 5, 10, 15, 20, 30];

const everydayItems = [
  { label: "Veg thali", icon: Utensils, amount: 100 },
  { label: "Cutting chai", icon: Coffee, amount: 50 },
  { label: "Family vacation", icon: Plane, amount: 100000 },
];

const clampYears = (value) => Math.min(Math.max(Math.round(Number(value) || 0), 1), 60);

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ToolHome() {
  const [mode, setMode] = useState("future");
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(10);
  const [slab, setSlab] = useState(30);
  const [fdRate, setFdRate] = useState(7);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const r = Math.max(Number(rate) || 0, 0) / 100;
    const n = clampYears(years);
    const amt = Math.max(Number(amount) || 0, 0);
    const factor = Math.pow(1 + r, n);
    const future = amt * factor;
    const deflated = factor > 0 ? amt / factor : amt;
    const lostPct = factor > 0 ? (1 - 1 / factor) * 100 : 0;
    const slabRate = Math.min(Math.max(Number(slab) || 0, 0), 99) / 100;
    const reqSlab = (r * 100) / (1 - slabRate);
    const reqEquity = (r * 100) / (1 - 0.125);
    const fd = Math.max(Number(fdRate) || 0, 0);
    const fdPost = fd * (1 - slabRate);
    const fdReal = ((1 + fdPost / 100) / (1 + r) - 1) * 100;
    const doubleYears = r > 0 ? 72 / (r * 100) : null;
    return { r, n, amt, factor, future, deflated, lostPct, slabRate, reqSlab, reqEquity, fd, fdPost, fdReal, doubleYears };
  }, [amount, rate, years, slab, fdRate]);

  const yearRows = useMemo(() => {
    const rows = [];
    for (let y = 1; y <= calc.n; y += 1) {
      const stepFactor = Math.pow(1 + calc.r, y);
      rows.push({
        y,
        calendarYear: CURRENT_YEAR + y,
        cost: calc.amt * stepFactor,
        rise: (stepFactor - 1) * 100,
      });
    }
    return rows;
  }, [calc.amt, calc.n, calc.r]);

  const everydayRows = useMemo(
    () =>
      everydayItems.map((item) => ({
        ...item,
        in5: item.amount * Math.pow(1 + calc.r, 5),
        in10: item.amount * Math.pow(1 + calc.r, 10),
        in20: item.amount * Math.pow(1 + calc.r, 20),
      })),
    [calc.r]
  );

  const fdBeats = calc.fdReal >= 0;

  const buildSummary = () => {
    const lines = ["Inflation Impact Summary — ALTFTool", ""];
    if (mode === "future") {
      lines.push(
        `Mode: Future cost`,
        `Today's cost: ${formatINR(calc.amt)}`,
        `Inflation: ${formatNumber(Number(rate) || 0)}% p.a. for ${calc.n} years`,
        `Future cost (${CURRENT_YEAR + calc.n}): ${formatINR(calc.future)} (${formatNumber(calc.factor, 2)}x today)`,
        `Formula: future cost = amount x (1 + rate)^years`
      );
    } else if (mode === "power") {
      lines.push(
        `Mode: Purchasing power`,
        `Amount today: ${formatINR(calc.amt)}`,
        `Inflation: ${formatNumber(Number(rate) || 0)}% p.a. for ${calc.n} years`,
        `Buys only: ${formatINR(calc.deflated)} worth of today's goods in ${CURRENT_YEAR + calc.n}`,
        `Purchasing power lost: ${formatNumber(calc.lostPct)}%`,
        `Formula: value = amount / (1 + rate)^years`
      );
    } else {
      lines.push(
        `Mode: Required return (to beat ${formatNumber(Number(rate) || 0)}% inflation after tax)`,
        `Tax slab: ${slab}%`,
        `Interest income (FD/RD) needs: ${formatNumber(calc.reqSlab, 2)}% pre-tax`,
        `Equity (12.5% LTCG) needs: ${formatNumber(calc.reqEquity, 2)}% pre-tax`,
        `Your FD at ${formatNumber(calc.fd, 2)}%: post-tax ${formatNumber(calc.fdPost, 2)}%, real return ${formatNumber(calc.fdReal, 2)}% -> ${fdBeats ? "beats inflation" : "loses to inflation"}`,
        `Formula: required pre-tax = inflation / (1 - tax rate); real return = (1 + post-tax) / (1 + inflation) - 1`
      );
    }
    if (calc.doubleYears) {
      lines.push("", `Rule of 72: at ${formatNumber(Number(rate) || 0)}% inflation, prices double roughly every ${formatNumber(calc.doubleYears)} years.`);
    }
    lines.push(
      "",
      `Everyday impact at ${formatNumber(Number(rate) || 0)}%:`,
      ...everydayRows.map(
        (row) =>
          `  - ${row.label} ${formatINR(row.amount)} -> 5y ${formatINR(row.in5)} | 10y ${formatINR(row.in10)} | 20y ${formatINR(row.in20)}`
      ),
      "",
      `Generated: ${new Date().toLocaleString("en-IN")}`
    );
    return lines.join("\n");
  };

  const copySummary = async () => {
    const success = await safeCopyText(buildSummary());
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const powerPct = calc.amt > 0 ? Math.max((calc.deflated / calc.amt) * 100, 2) : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <TrendingUp className="h-4 w-4" />
            Money reality check
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Inflation Purchasing Power Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            See what rising prices quietly do to your money — project future costs, watch the rupee
            shrink, and find the return your savings must earn after tax just to stand still.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-2">
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={mode === item.id}
                  onClick={() => setMode(item.id)}
                  className={`rounded-md border px-3 py-3 text-left transition ${
                    mode === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={`block text-xs ${mode === item.id ? "opacity-80" : ""}`}>{item.hint}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4">
              {mode !== "return" && (
                <label className="block">
                  <span className="text-sm font-semibold">
                    {mode === "future" ? "Today's cost (₹)" : "Amount you hold today (₹)"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-sm font-semibold">Inflation rate (% per year)</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {ratePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    aria-pressed={Number(rate) === preset.value}
                    onClick={() => setRate(preset.value)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                      Number(rate) === preset.value
                        ? "border-[var(--primary)] text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {mode !== "return" && (
                <label className="block">
                  <span className="text-sm font-semibold">Years ahead</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={years}
                    onChange={(event) => setYears(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  {Number(years) > 60 && (
                    <p className="mt-2 text-xs font-semibold text-[var(--anslation-ds-danger)]" role="status">
                      Capped at 60 years for this calculation.
                    </p>
                  )}
                </label>
              )}

              {mode === "return" && (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold">Your income-tax slab</span>
                    <select
                      value={slab}
                      onChange={(event) => setSlab(Number(event.target.value))}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    >
                      {taxSlabs.map((value) => (
                        <option key={value} value={value}>
                          {value}%{value === 0 ? " (below taxable limit)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Your current FD rate (% per year)</span>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="0.1"
                      value={fdRate}
                      onChange={(event) => setFdRate(Number(event.target.value))}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && !window.confirm("Reset all fields to defaults? Your entered values will be lost.")) {
                    return;
                  }
                  setMode("future");
                  setAmount(100000);
                  setRate(6);
                  setYears(10);
                  setSlab(30);
                  setFdRate(7);
                }}
                className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {mode === "future" && `Future cost in ${CURRENT_YEAR + calc.n}`}
                {mode === "power" && `What your money buys in ${CURRENT_YEAR + calc.n}`}
                {mode === "return" && "Return needed to beat inflation after tax"}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy summary"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile("inflation-impact-summary.txt", buildSummary())}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            {mode === "future" && (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-4xl font-semibold text-[var(--primary)]">{formatINR(calc.future)}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      what {formatINR(calc.amt)} today will cost after {calc.n} years at {formatNumber(Number(rate) || 0)}%
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                    <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                    {formatNumber(calc.factor, 2)}× today&apos;s price
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  Formula: future cost = amount × (1 + rate)<sup>years</sup>
                </p>
                {calc.doubleYears && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                    <Clock className="h-4 w-4 text-[var(--primary)]" />
                    Rule of 72: at {formatNumber(Number(rate) || 0)}%, prices double roughly every {formatNumber(calc.doubleYears)} years.
                  </p>
                )}
                <div className="mt-5 max-h-80 overflow-y-auto overflow-x-auto rounded-md border border-[var(--border)]">
                  <table className="w-full min-w-[480px] border-collapse text-sm">
                    <thead className="sticky top-0 bg-[var(--muted)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Year</th>
                        <th className="px-3 py-2 font-semibold">Projected cost</th>
                        <th className="px-3 py-2 font-semibold">Rise vs today</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearRows.map((row) => (
                        <tr key={row.y} className="border-t border-[var(--border)]">
                          <td className="px-3 py-2 text-[var(--muted-foreground)]">
                            {row.calendarYear} <span className="text-xs">(+{row.y}y)</span>
                          </td>
                          <td className="px-3 py-2 font-semibold">{formatINR(row.cost)}</td>
                          <td className="px-3 py-2 text-[var(--anslation-ds-danger)]">+{formatNumber(row.rise)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {mode === "power" && (
              <>
                <div className="mt-4 rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-4xl font-semibold text-[var(--primary)]">{formatINR(calc.deflated)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    is all that {formatINR(calc.amt)} will buy (in today&apos;s goods) after {calc.n} years at {formatNumber(Number(rate) || 0)}%
                  </p>
                </div>
                <div className="mt-5 grid gap-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                      <span>Today</span>
                      <span>{formatINR(calc.amt)}</span>
                    </div>
                    <div className="h-8 w-full overflow-hidden rounded-md bg-[var(--muted)]">
                      <div className="h-full rounded-md" style={{ width: "100%", background: "var(--primary)" }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                      <span>In {calc.n} years</span>
                      <span>{formatINR(calc.deflated)} worth</span>
                    </div>
                    <div className="h-8 w-full overflow-hidden rounded-md bg-[var(--muted)]">
                      <div
                        className="h-full rounded-md transition-all"
                        style={{ width: `${powerPct}%`, background: "var(--anslation-ds-danger)" }}
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  <TrendingDown className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                  {formatNumber(calc.lostPct)}% of purchasing power silently gone
                </p>
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  Formula: real value = amount ÷ (1 + rate)<sup>years</sup>
                </p>
                {calc.doubleYears && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                    <Clock className="h-4 w-4 text-[var(--primary)]" />
                    Rule of 72: at {formatNumber(Number(rate) || 0)}%, idle cash halves in value roughly every {formatNumber(calc.doubleYears)} years.
                  </p>
                )}
              </>
            )}

            {mode === "return" && (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs text-[var(--muted-foreground)]">FD / interest income (taxed at {slab}%)</p>
                    <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                      {formatNumber(calc.reqSlab, 2)}%
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">minimum pre-tax return needed</p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs text-[var(--muted-foreground)]">Equity (12.5% LTCG on gains)</p>
                    <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                      {formatNumber(calc.reqEquity, 2)}%
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">minimum pre-tax return needed</p>
                  </div>
                </div>

                <div
                  className={`mt-4 rounded-md border p-4 ${
                    fdBeats ? "border-[var(--anslation-ds-success)]" : "border-[var(--anslation-ds-danger)]"
                  }`}
                >
                  <p className="inline-flex items-center gap-2 text-sm font-semibold">
                    {fdBeats ? (
                      <TrendingUp className="h-4 w-4 text-[var(--anslation-ds-success)]" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                    )}
                    Your FD at {formatNumber(calc.fd, 2)}% {fdBeats ? "beats" : "loses to"} {formatNumber(Number(rate) || 0)}% inflation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    After {slab}% tax it earns {formatNumber(calc.fdPost, 2)}% — a real return of{" "}
                    <span className={fdBeats ? "font-semibold text-[var(--anslation-ds-success)]" : "font-semibold text-[var(--anslation-ds-danger)]"}>
                      {calc.fdReal >= 0 ? "+" : ""}
                      {formatNumber(calc.fdReal, 2)}% per year
                    </span>
                    {fdBeats
                      ? ". Your money grows slightly faster than prices."
                      : ". Your money grows slower than prices, so it quietly shrinks."}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1.5">
                    FD interest is added to income and taxed at your slab
                  </span>
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1.5">
                    Equity held &gt;1 year: 12.5% LTCG above ₹1.25L/yr of gains
                  </span>
                </div>
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  Formula: required pre-tax = inflation ÷ (1 − tax rate); real return = (1 + post-tax) ÷ (1 + inflation) − 1
                </p>
              </>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Everyday impact at {formatNumber(Number(rate) || 0)}% inflation
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead className="text-left text-xs uppercase text-[var(--muted-foreground)]">
                <tr>
                  <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Item</th>
                  <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Today</th>
                  <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">In 5 years</th>
                  <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">In 10 years</th>
                  <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">In 20 years</th>
                </tr>
              </thead>
              <tbody>
                {everydayRows.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <row.icon className="h-4 w-4 text-[var(--primary)]" />
                        {row.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--muted-foreground)]">{formatINR(row.amount)}</td>
                    <td className="px-3 py-2.5">{formatINR(row.in5)}</td>
                    <td className="px-3 py-2.5">{formatINR(row.in10)}</td>
                    <td className="px-3 py-2.5 font-semibold text-[var(--anslation-ds-danger)]">{formatINR(row.in20)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            Same thali, same chai, same holiday — only the price tag changes. This is why salaries,
            savings targets and retirement plans must grow faster than inflation, not just grow.
          </p>
        </section>
      </div>
    </main>
  );
}
