"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartNoAxesCombined, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MS_PER_DAY = 86400000;

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const num = (value, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const labelClass = "text-sm font-medium text-[var(--foreground)]";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ghostButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return stamp;
}

function shiftMonths(date, months) {
  const copy = new Date(date.getTime());
  const targetDay = copy.getDate();
  copy.setDate(1);
  copy.setMonth(copy.getMonth() + months);
  const lastDay = new Date(copy.getFullYear(), copy.getMonth() + 1, 0).getDate();
  copy.setDate(Math.min(targetDay, lastDay));
  return copy;
}

function npv(rate, flows) {
  return flows.reduce(
    (total, flow) => total + flow.amount / Math.pow(1 + rate, flow.years),
    0
  );
}

/** Newton-Raphson with a bisection fallback. Returns the annualised XIRR as a decimal. */
function computeXirr(flows) {
  let rate = 0.1;
  for (let i = 0; i < 80; i += 1) {
    let value = 0;
    let derivative = 0;
    for (const flow of flows) {
      const base = Math.pow(1 + rate, flow.years);
      value += flow.amount / base;
      derivative += (-flow.years * flow.amount) / (base * (1 + rate));
    }
    if (!Number.isFinite(value) || !Number.isFinite(derivative) || derivative === 0) break;
    const next = rate - value / derivative;
    if (!Number.isFinite(next) || next <= -0.9999999) break;
    if (Math.abs(next - rate) < 1e-10) return next;
    rate = next;
    if (Math.abs(value) < 1e-7) return rate;
  }

  // Bisection over a wide bracket.
  let low = -0.999999;
  let high = 100;
  let lowValue = npv(low, flows);
  let highValue = npv(high, flows);
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue)) return null;
  if (lowValue * highValue > 0) return null;

  for (let i = 0; i < 300; i += 1) {
    const mid = (low + high) / 2;
    const midValue = npv(mid, flows);
    if (!Number.isFinite(midValue)) return null;
    if (Math.abs(midValue) < 1e-7 || high - low < 1e-10) return mid;
    if (lowValue * midValue <= 0) {
      high = mid;
      highValue = midValue;
    } else {
      low = mid;
      lowValue = midValue;
    }
  }
  return (low + high) / 2;
}

function buildDefaults() {
  const today = new Date();
  return {
    rows: [
      { id: "r1", date: toIsoDate(shiftMonths(today, -36)), amount: "100000", type: "invest" },
      { id: "r2", date: toIsoDate(shiftMonths(today, -24)), amount: "50000", type: "invest" },
      { id: "r3", date: toIsoDate(shiftMonths(today, -12)), amount: "50000", type: "invest" },
    ],
    valueDate: toIsoDate(today),
    currentValue: "260000",
  };
}

export default function ToolHome() {
  const [rows, setRows] = useState([]);
  const [valueDate, setValueDate] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [nextId, setNextId] = useState(4);

  useEffect(() => {
    const defaults = buildDefaults();
    setRows(defaults.rows);
    setValueDate(defaults.valueDate);
    setCurrentValue(defaults.currentValue);
  }, []);

  const analysis = useMemo(() => {
    if (rows.length === 0) return { error: "", result: null };

    const flows = [];
    let invested = 0;
    let redeemed = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const stamp = parseIsoDate(row.date);
      if (stamp === null) {
        return { error: `Row ${index + 1} needs a valid date.`, result: null };
      }
      const amount = Number(row.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return { error: `Row ${index + 1} needs an amount greater than zero.`, result: null };
      }
      if (row.type === "invest") {
        invested += amount;
        flows.push({ stamp, amount: -amount });
      } else {
        redeemed += amount;
        flows.push({ stamp, amount });
      }
    }

    const valueStamp = parseIsoDate(valueDate);
    if (valueStamp === null) return { error: "Enter a valid valuation date.", result: null };

    const value = Number(currentValue);
    if (!Number.isFinite(value) || value < 0) {
      return { error: "Current value must be zero or more.", result: null };
    }

    if (invested <= 0) {
      return { error: "Add at least one investment entry.", result: null };
    }

    const earliest = Math.min(...flows.map((flow) => flow.stamp));
    if (valueStamp <= earliest) {
      return { error: "The valuation date must be after your first investment.", result: null };
    }
    const lastFlow = Math.max(...flows.map((flow) => flow.stamp));
    if (valueStamp < lastFlow) {
      return { error: "The valuation date cannot be before your last transaction.", result: null };
    }

    flows.push({ stamp: valueStamp, amount: value });

    const normalised = flows.map((flow) => ({
      amount: flow.amount,
      years: (flow.stamp - earliest) / MS_PER_DAY / 365,
    }));

    const rate = computeXirr(normalised);
    if (rate === null || !Number.isFinite(rate)) {
      return {
        error: "XIRR could not converge for these cash flows. Check the dates and amounts.",
        result: null,
      };
    }

    const days = (valueStamp - earliest) / MS_PER_DAY;
    const totalGain = value + redeemed - invested;

    return {
      error: "",
      result: {
        xirr: rate * 100,
        invested,
        redeemed,
        currentValue: value,
        totalGain,
        absoluteReturn: (totalGain / invested) * 100,
        days,
        years: days / 365,
        transactions: rows.length,
      },
    };
  }, [rows, valueDate, currentValue]);

  const { error, result } = analysis;

  const summaryText = useMemo(() => {
    if (!result) return "";
    return [
      "Mutual Fund XIRR Calculator — ALTFTool",
      `Transactions: ${result.transactions}`,
      `Total invested: ${inr(result.invested)}`,
      result.redeemed > 0 ? `Total redeemed: ${inr(result.redeemed)}` : null,
      `Current value on ${valueDate}: ${inr(result.currentValue)}`,
      `Net gain: ${inr(result.totalGain)}`,
      `Absolute return: ${num(result.absoluteReturn)}%`,
      `Holding period: ${num(result.years)} years (${Math.round(result.days)} days)`,
      `XIRR: ${num(result.xirr)}% per year`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [result, valueDate]);

  const handleCopy = async () => {
    if (!summaryText) return;
    const ok = await safeCopyText(summaryText);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    const defaults = buildDefaults();
    setRows(defaults.rows);
    setValueDate(defaults.valueDate);
    setCurrentValue(defaults.currentValue);
    setNextId(4);
    setCopied(false);
  };

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    const last = rows[rows.length - 1];
    const base = last ? parseIsoDate(last.date) : null;
    const nextDate = base ? toIsoDate(shiftMonths(new Date(base), 1)) : valueDate;
    setRows((current) => [
      ...current,
      { id: `r${nextId}`, date: nextDate || "", amount: "10000", type: "invest" },
    ]);
    setNextId((value) => value + 1);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ChartNoAxesCombined className="h-4 w-4" aria-hidden="true" />
          Mutual funds
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
          Mutual Fund XIRR Calculator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          Enter every investment and redemption with its date, add today&apos;s value, and get the
          annualised XIRR — the return measure that handles irregular cash flows correctly.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-label="Cash flow entries"
        >
          <h2 className="text-base font-semibold text-[var(--foreground)]">Transactions</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Add each purchase and withdrawal on the date it happened.
          </p>

          <div className="mt-4 grid gap-4">
            {rows.map((row, index) => (
              <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor={`xirr-date-${row.id}`}>
                      Date {index + 1}
                    </label>
                    <input
                      id={`xirr-date-${row.id}`}
                      type="date"
                      className={`mt-2 ${inputClass}`}
                      value={row.date}
                      onChange={(event) => updateRow(row.id, { date: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`xirr-amount-${row.id}`}>
                      Amount (₹)
                    </label>
                    <input
                      id={`xirr-amount-${row.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1000"
                      className={`mt-2 ${inputClass}`}
                      value={row.amount}
                      onChange={(event) => updateRow(row.id, { amount: event.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <div className="min-w-[160px] flex-1">
                    <label className={labelClass} htmlFor={`xirr-type-${row.id}`}>
                      Transaction type
                    </label>
                    <select
                      id={`xirr-type-${row.id}`}
                      className={`mt-2 ${inputClass}`}
                      value={row.type}
                      onChange={(event) => updateRow(row.id, { type: event.target.value })}
                    >
                      <option value="invest">Investment (money in)</option>
                      <option value="redeem">Redemption (money out)</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    aria-label={`Remove transaction ${index + 1}`}
                    className={`${ghostButton} disabled:opacity-50`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addRow} className={`mt-4 ${ghostButton}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add transaction
          </button>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="xirr-value-date">
                Valuation date
              </label>
              <input
                id="xirr-value-date"
                type="date"
                className={`mt-2 ${inputClass}`}
                value={valueDate}
                onChange={(event) => setValueDate(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="xirr-current-value">
                Current value (₹)
              </label>
              <input
                id="xirr-current-value"
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                className={`mt-2 ${inputClass}`}
                value={currentValue}
                onChange={(event) => setCurrentValue(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className={primaryButton}
              onClick={handleCopy}
              disabled={!result}
              aria-label="Copy the XIRR result summary to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              className={ghostButton}
              onClick={handleReset}
              aria-label="Reset transactions to the sample values"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            XIRR (annualised return)
          </p>
          <p
            className={`mt-1 text-3xl font-semibold sm:text-4xl ${
              result && result.xirr < 0 ? "text-[var(--danger)]" : "text-[var(--primary)]"
            }`}
          >
            {result ? `${num(result.xirr)}%` : "—"}
          </p>
          {result ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Across {result.transactions} transaction{result.transactions === 1 ? "" : "s"} over{" "}
              {num(result.years)} years.
            </p>
          ) : null}

          {result ? (
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Total invested</dt>
                <dd className="font-semibold text-[var(--foreground)]">{inr(result.invested)}</dd>
              </div>
              {result.redeemed > 0 ? (
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Total redeemed</dt>
                  <dd className="font-semibold text-[var(--foreground)]">{inr(result.redeemed)}</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Current value</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {inr(result.currentValue)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Net gain</dt>
                <dd
                  className={`font-semibold ${
                    result.totalGain < 0 ? "text-[var(--danger)]" : "text-[var(--success)]"
                  }`}
                >
                  {inr(result.totalGain)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Absolute return</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {num(result.absoluteReturn)}%
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-[var(--muted-foreground)]">Holding period</dt>
                <dd className="font-semibold text-[var(--foreground)]">
                  {Math.round(result.days)} days
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm text-[var(--muted-foreground)]">
              {rows.length === 0
                ? "Loading your sample transactions…"
                : "Fix the highlighted entry to see your XIRR."}
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            XIRR solves for the annual rate that makes every dated cash flow discount back to zero —
            the same method Excel&apos;s XIRR uses, with a 365-day year. Absolute return ignores
            timing, which is why the two numbers differ.
          </p>
        </section>
      </div>
    </div>
  );
}
