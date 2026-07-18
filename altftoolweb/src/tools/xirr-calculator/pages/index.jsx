"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ClipboardPaste,
  Copy,
  Info,
  Percent,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DAY_MS = 86400000;

const toNum = (value) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const pad2 = (n) => String(n).padStart(2, "0");

const toDateInput = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const monthsAgo = (months, day) => {
  const now = new Date();
  return toDateInput(new Date(now.getFullYear(), now.getMonth() - months, day));
};

function buildDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function parseLocalDate(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return buildDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

function parseFlexibleDate(value) {
  const trimmed = value.trim();
  let match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return buildDate(Number(match[1]), Number(match[2]), Number(match[3]));
  match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) return buildDate(Number(match[3]), Number(match[2]), Number(match[1]));
  return null;
}

function solveXirr(flows) {
  const sorted = [...flows].sort((a, b) => a.date - b.date);
  const t0 = sorted[0].date.getTime();
  const times = sorted.map((flow) => (flow.date.getTime() - t0) / DAY_MS / 365);
  const amounts = sorted.map((flow) => flow.amount);

  const npv = (rate) => amounts.reduce((sum, amount, index) => sum + amount / Math.pow(1 + rate, times[index]), 0);
  const npvSlope = (rate) =>
    amounts.reduce((sum, amount, index) => sum - (times[index] * amount) / Math.pow(1 + rate, times[index] + 1), 0);

  let rate = 0.1;
  for (let i = 0; i < 100; i += 1) {
    const value = npv(rate);
    if (Math.abs(value) < 1e-7) return { rate };
    const slope = npvSlope(rate);
    if (!Number.isFinite(slope) || Math.abs(slope) < 1e-12) break;
    const next = rate - value / slope;
    if (!Number.isFinite(next) || next <= -0.999999 || next > 1e6) break;
    if (Math.abs(next - rate) < 1e-9) {
      rate = next;
      break;
    }
    rate = next;
  }
  if (Number.isFinite(rate) && rate > -0.999999 && Math.abs(npv(rate)) < 1e-6) return { rate };

  let previousRate = -0.99;
  let previousValue = npv(previousRate);
  let bracket = null;
  for (let step = 1; step <= 1099; step += 1) {
    const currentRate = -0.99 + step * 0.01;
    const currentValue = npv(currentRate);
    if (Number.isFinite(previousValue) && Math.abs(previousValue) < 1e-7) return { rate: previousRate };
    if (Number.isFinite(previousValue) && Number.isFinite(currentValue) && previousValue * currentValue < 0) {
      bracket = [previousRate, currentRate, previousValue];
      break;
    }
    previousRate = currentRate;
    previousValue = currentValue;
  }
  if (!bracket) {
    return {
      error:
        "Cannot converge: no rate between -99% and +1000% zeroes these flows. Re-check the dates and amounts — the flows may be contradictory.",
    };
  }
  let [low, high, lowValue] = bracket;
  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    const midValue = npv(mid);
    if (Math.abs(midValue) < 1e-7 || (high - low) / 2 < 1e-7) return { rate: mid };
    if (lowValue < 0 === midValue < 0) {
      low = mid;
      lowValue = midValue;
    } else {
      high = mid;
    }
  }
  return { rate: (low + high) / 2 };
}

function parseImportText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return { error: "Paste at least one line in date,amount format." };
  const rows = [];
  const problems = [];
  lines.forEach((line, index) => {
    const splitAt = line.search(/[,;\t]/);
    if (splitAt === -1) {
      problems.push(`Line ${index + 1}: missing comma between date and amount`);
      return;
    }
    const datePart = line.slice(0, splitAt).trim();
    const amountPart = line
      .slice(splitAt + 1)
      .replace(/[₹\s,]/g, "");
    const date = parseFlexibleDate(datePart);
    const amount = Number(amountPart);
    if (!date) {
      problems.push(`Line ${index + 1}: unreadable date "${datePart}" (use YYYY-MM-DD or DD/MM/YYYY)`);
      return;
    }
    if (!Number.isFinite(amount) || amount === 0) {
      problems.push(`Line ${index + 1}: amount must be a non-zero number`);
      return;
    }
    rows.push({ date: toDateInput(date), amount: String(amount) });
  });
  if (problems.length) return { error: problems.slice(0, 3).join(" · ") };
  return { rows };
}

function buildSipPreset() {
  const transactions = [];
  for (let i = 12; i >= 1; i -= 1) {
    transactions.push({ id: `sip-${i}`, date: monthsAgo(i, 5), amount: "-10000" });
  }
  transactions.push({ id: "sip-lump", date: monthsAgo(6, 20), amount: "-50000" });
  return { transactions, valuationDate: toDateInput(new Date()), currentValue: "186500" };
}

function buildIrregularPreset() {
  return {
    transactions: [
      { id: "irr-1", date: monthsAgo(14, 10), amount: "-25000" },
      { id: "irr-2", date: monthsAgo(9, 2), amount: "-40000" },
      { id: "irr-3", date: monthsAgo(5, 18), amount: "10000" },
      { id: "irr-4", date: monthsAgo(2, 7), amount: "-15000" },
    ],
    valuationDate: toDateInput(new Date()),
    currentValue: "78000",
  };
}

const benchmarks = [
  { label: "Bank FD", rate: 7 },
  { label: "Inflation", rate: 6 },
  { label: "Index avg", rate: 12 },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0
  );

const formatDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inputClass =
  "mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

export default function ToolHome() {
  const [transactions, setTransactions] = useState([]);
  const [valuationDate, setValuationDate] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const nextIdRef = useRef(1000);
  const importBatchRef = useRef(1);

  useEffect(() => {
    const preset = buildSipPreset();
    setTransactions(preset.transactions);
    setValuationDate(preset.valuationDate);
    setCurrentValue(preset.currentValue);
  }, []);

  const analysis = useMemo(() => {
    const flows = [];
    let skipped = 0;
    transactions.forEach((row) => {
      const date = parseLocalDate(row.date);
      const amount = toNum(row.amount);
      if (!date || !amount) {
        if ((row.date && row.date.trim()) || (row.amount && String(row.amount).trim())) skipped += 1;
        return;
      }
      flows.push({ date, amount, type: amount < 0 ? "Investment" : "Redemption" });
    });
    const valuation = parseLocalDate(valuationDate);
    const value = toNum(currentValue);
    if (valuation && value > 0) flows.push({ date: valuation, amount: value, type: "Current value" });

    flows.sort((a, b) => a.date - b.date);
    let running = 0;
    const tableRows = flows.map((flow, index) => {
      if (flow.amount < 0) running += -flow.amount;
      return { ...flow, key: index, runningInvested: running };
    });

    const invested = flows.reduce((sum, flow) => sum + (flow.amount < 0 ? -flow.amount : 0), 0);
    const redeemed = flows.reduce(
      (sum, flow) => sum + (flow.type === "Redemption" && flow.amount > 0 ? flow.amount : 0),
      0
    );
    const finalValue = valuation && value > 0 ? value : 0;
    const base = { skipped, tableRows, invested, redeemed, finalValue };

    if (flows.length < 2)
      return { ...base, error: "Add at least two dated cash flows — for example one investment plus the current value." };
    if (!flows.some((flow) => flow.amount < 0) || !flows.some((flow) => flow.amount > 0))
      return {
        ...base,
        error:
          "XIRR needs at least one investment (negative amount) and one redemption or current value (positive amount).",
      };
    const first = flows[0].date;
    const last = flows[flows.length - 1].date;
    const years = (last.getTime() - first.getTime()) / DAY_MS / 365;
    if (years <= 0) return { ...base, error: "Cash flows need at least two different dates." };

    const solved = solveXirr(flows);
    if (solved.error) return { ...base, error: solved.error };

    const totalReturned = redeemed + finalValue;
    const cagr =
      invested > 0 && totalReturned > 0 ? (Math.pow(totalReturned / invested, 1 / years) - 1) * 100 : null;
    return { ...base, rate: solved.rate * 100, years, first, last, cagr, totalReturned };
  }, [transactions, valuationDate, currentValue]);

  const report = useMemo(() => {
    if (analysis.rate === undefined) return "";
    return [
      "XIRR Report",
      `XIRR: ${analysis.rate.toFixed(2)}% per annum`,
      `Total invested: ${formatINR(analysis.invested)}`,
      `Total redeemed: ${formatINR(analysis.redeemed)}`,
      `Current value: ${formatINR(analysis.finalValue)}`,
      `Period: ${formatDate(analysis.first)} to ${formatDate(analysis.last)} (${analysis.years.toFixed(2)} years)`,
      analysis.cagr === null
        ? "Point-to-point CAGR: not applicable"
        : `Point-to-point CAGR: ${analysis.cagr.toFixed(2)}% (ignores cash-flow timing; XIRR is the correct SIP metric)`,
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
  }, [analysis]);

  const updateTransaction = (id, field, value) => {
    setTransactions((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addTransaction = () => {
    const id = `row-${nextIdRef.current}`;
    nextIdRef.current += 1;
    setTransactions((prev) => [...prev, { id, date: "", amount: "" }]);
  };

  const removeTransaction = (id) => {
    setTransactions((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const applyPreset = (builder) => {
    const preset = builder();
    setTransactions(preset.transactions);
    setValuationDate(preset.valuationDate);
    setCurrentValue(preset.currentValue);
    setImportStatus(null);
  };

  const handleImport = () => {
    const parsed = parseImportText(importText);
    if (parsed.error) {
      setImportStatus({ error: parsed.error });
      return;
    }
    const batch = importBatchRef.current;
    importBatchRef.current += 1;
    setTransactions(parsed.rows.map((row, index) => ({ id: `import-${batch}-${index}`, ...row })));
    setImportText("");
    setImportStatus({
      ok: `Imported ${parsed.rows.length} transaction${parsed.rows.length === 1 ? "" : "s"} (negative = investment).`,
    });
  };

  const copyReport = async () => {
    if (!report) return;
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Percent className="h-4 w-4" />
            Returns toolkit
          </div>
          <h1 className="text-4xl font-semibold leading-tight">XIRR Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            SIPs, top-ups, and partial withdrawals all happen on different dates — XIRR weighs every rupee by its
            exact time in the market and gives you the one true annualized return.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[440px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">Cash flows</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(buildSipPreset)}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  SIP + lump top-up
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(buildIrregularPreset)}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Irregular investing
                </button>
              </div>
            </div>

            <p className="mb-3 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Sign convention: money you put in is negative (−10000), money you take out is positive (+10000). The
              current value row below counts as the final positive flow.
            </p>

            <div className="grid max-h-[380px] gap-2 overflow-y-auto pr-1">
              {transactions.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">Date {index + 1}</span>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(event) => updateTransaction(row.id, "date", event.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">Amount (₹)</span>
                    <input
                      type="number"
                      step="100"
                      value={row.amount}
                      onChange={(event) => updateTransaction(row.id, "amount", event.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeTransaction(row.id)}
                    disabled={transactions.length <= 1}
                    aria-label={`Remove transaction ${index + 1}`}
                    className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTransaction}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <Plus className="h-4 w-4" />
              Add transaction
            </button>

            <div className="mt-4 rounded-md border border-[var(--primary)] bg-[var(--muted)] p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--primary)]">
                <CalendarDays className="h-4 w-4" />
                Current value today
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Valuation date</span>
                  <input
                    type="date"
                    value={valuationDate}
                    onChange={(event) => setValuationDate(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Current value (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={currentValue}
                    onChange={(event) => setCurrentValue(event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="text-sm font-semibold">Paste transactions (one per line: date,amount)</span>
                <textarea
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  rows={3}
                  placeholder={"2025-01-05,-10000\n05/02/2025,-10000\n2025-06-20,15000"}
                  className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <div className="mt-2 flex items-center justify-between gap-3">
                <button type="button" onClick={handleImport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <ClipboardPaste className="h-4 w-4" />
                  Import (replaces rows)
                </button>
                {importStatus?.ok && (
                  <span className="text-xs font-semibold text-[var(--anslation-ds-success)]">{importStatus.ok}</span>
                )}
              </div>
              {importStatus?.error && (
                <p className="mt-2 text-xs leading-5 text-[var(--anslation-ds-danger)]">{importStatus.error}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your true annualized return</p>
              <button
                type="button"
                onClick={copyReport}
                disabled={analysis.rate === undefined}
                className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy result"}
              </button>
            </div>

            <div aria-live="polite" className="mt-4">
              {analysis.error ? (
                <div className="rounded-md border border-[var(--anslation-ds-danger)] bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  {analysis.error}
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-[var(--muted)] p-5">
                      <p className="text-4xl font-semibold text-[var(--primary)]">
                        {analysis.rate.toFixed(2)}%
                        <span className="ml-2 text-base font-semibold text-[var(--muted-foreground)]">p.a.</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {benchmarks.map((bench) => {
                        const beats = analysis.rate >= bench.rate;
                        return (
                          <span
                            key={bench.label}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              beats
                                ? "border-[var(--anslation-ds-success)] text-[var(--anslation-ds-success)]"
                                : "border-[var(--anslation-ds-danger)] text-[var(--anslation-ds-danger)]"
                            }`}
                          >
                            {beats ? "Beats" : "Trails"} {bench.label} ({bench.rate}%)
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ["Total invested", formatINR(analysis.invested)],
                      ["Total redeemed", formatINR(analysis.redeemed)],
                      ["Current value", formatINR(analysis.finalValue)],
                      ["Period", `${analysis.years.toFixed(2)} years`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  {analysis.cagr !== null && (
                    <div className="mt-5 rounded-md bg-[var(--muted)] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Info className="h-4 w-4 text-[var(--primary)]" />
                        Why XIRR ≠ CAGR here: point-to-point CAGR would say {analysis.cagr.toFixed(2)}%
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        CAGR pretends the whole {formatINR(analysis.invested)} was invested on day one and grew for{" "}
                        {analysis.years.toFixed(2)} years. In reality your instalments entered on different dates, so
                        later ones had less time to grow. XIRR discounts every cash flow by its own holding period,
                        which makes it the honest annualized figure for SIPs and irregular investing.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {analysis.skipped > 0 && (
                <p className="mt-3 text-xs font-semibold text-[var(--anslation-ds-warning)]">
                  {analysis.skipped} incomplete row{analysis.skipped === 1 ? "" : "s"} ignored — each row needs a valid
                  date and a non-zero amount.
                </p>
              )}
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
              Formula: XIRR is the rate r where Σ cashflow ÷ (1 + r)^(days ÷ 365) = 0, solved with Newton-Raphson and
              a bisection fallback to a 0.0000001 tolerance.
            </p>

            {analysis.tableRows.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Date</th>
                      <th className="py-2 pr-3 font-semibold">Type</th>
                      <th className="py-2 pr-3 font-semibold">Amount</th>
                      <th className="py-2 font-semibold">Invested so far</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.tableRows.map((flow) => (
                      <tr key={flow.key} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3">{formatDate(flow.date)}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{flow.type}</td>
                        <td
                          className={`py-2 pr-3 font-semibold ${
                            flow.amount > 0 ? "text-[var(--anslation-ds-success)]" : ""
                          }`}
                        >
                          {formatINR(flow.amount)}
                        </td>
                        <td className="py-2 text-[var(--muted-foreground)]">{formatINR(flow.runningInvested)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
