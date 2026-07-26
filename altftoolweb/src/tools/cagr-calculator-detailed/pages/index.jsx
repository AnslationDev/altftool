"use client";

import { useMemo, useState } from "react";
import { ChartLine, Copy, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => inr.format(Number.isFinite(v) ? v : 0);
const rate = (v) => `${pct.format(Number.isFinite(v) ? v : 0)}%`;

const DEFAULTS = { start: "100000", end: "250000", years: "5", months: "0" };

const PRESETS = [
  { label: "Doubled in 6 years", start: "100000", end: "200000", years: "6", months: "0" },
  { label: "10L to 25L in 7y 6m", start: "1000000", end: "2500000", years: "7", months: "6" },
  { label: "A losing bet", start: "500000", end: "350000", years: "4", months: "0" },
];

const num = (v) => {
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : NaN;
};

export default function ToolHome() {
  const [start, setStart] = useState(DEFAULTS.start);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [years, setYears] = useState(DEFAULTS.years);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [copied, setCopied] = useState(false);

  const state = useMemo(() => {
    const s = num(start);
    const e = num(end);
    const y = num(years);
    const m = num(months);

    if ([s, e, y, m].some((v) => Number.isNaN(v))) {
      return { error: "Enter a number in every field." };
    }
    if (s <= 0) return { error: "Start value must be greater than 0." };
    if (e < 0) return { error: "End value cannot be negative." };
    if (y < 0 || m < 0) return { error: "Duration cannot be negative." };
    if (m >= 12) return { error: "Months must be between 0 and 11 — add whole years to the years field." };
    const duration = y + m / 12;
    if (duration <= 0) return { error: "Duration must be greater than 0." };
    if (duration > 100) return { error: "Keep the duration at 100 years or less." };

    const totalGain = e - s;
    const absoluteReturn = (totalGain / s) * 100;
    const multiple = e / s;

    // CAGR = (end / start)^(1/years) - 1 ; end = 0 means a total wipeout
    const cagr = e === 0 ? -100 : (Math.pow(multiple, 1 / duration) - 1) * 100;
    const simpleAnnual = absoluteReturn / duration;

    const doubles = cagr > 0 ? Math.log(2) / Math.log(1 + cagr / 100) : null;
    const rule72 = cagr > 0 ? 72 / cagr : null;

    // Year-wise path at the constant CAGR
    const rows = [];
    const wholeYears = Math.min(Math.floor(duration), 40);
    for (let i = 1; i <= wholeYears; i += 1) {
      const value = s * Math.pow(1 + cagr / 100, i);
      const prev = s * Math.pow(1 + cagr / 100, i - 1);
      rows.push({ year: i, value, gain: value - prev });
    }
    if (duration > wholeYears) {
      rows.push({ year: plain.format(duration), value: e, gain: e - s * Math.pow(1 + cagr / 100, wholeYears), partial: true });
    }

    const projections = [3, 5, 10].map((extra) => ({
      extra,
      value: e * Math.pow(1 + cagr / 100, extra),
    }));

    return {
      duration,
      totalGain,
      absoluteReturn,
      multiple,
      cagr,
      simpleAnnual,
      doubles,
      rule72,
      rows,
      projections,
      profit: totalGain >= 0,
      wipeout: e === 0,
      inputs: { s, e, y, m },
    };
  }, [start, end, years, months]);

  const report = useMemo(() => {
    if (state.error) return "";
    return [
      "CAGR Calculator",
      `Start value: ${money(state.inputs.s)}`,
      `End value: ${money(state.inputs.e)}`,
      `Duration: ${plain.format(state.duration)} years`,
      `CAGR: ${rate(state.cagr)} per year`,
      `Absolute return: ${rate(state.absoluteReturn)}`,
      `Simple annual average: ${rate(state.simpleAnnual)}`,
      `Total gain: ${money(state.totalGain)}`,
      `Growth multiple: ${plain.format(state.multiple)}x`,
      state.doubles ? `Money doubles every ${plain.format(state.doubles)} years at this CAGR` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [state]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setStart(DEFAULTS.start);
    setEnd(DEFAULTS.end);
    setYears(DEFAULTS.years);
    setMonths(DEFAULTS.months);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <ChartLine className="h-4 w-4" />
            Returns
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CAGR Calculator</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Compound annual growth rate from a start value, end value and duration — with absolute
            return, the growth multiple and a year-wise path at that steady rate.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div>
                <label className={labelClass} htmlFor="cagr-start">
                  Start value (₹)
                </label>
                <input
                  id="cagr-start"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1000"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="cagr-end">
                  End value (₹)
                </label>
                <input
                  id="cagr-end"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cagr-years">
                    Duration — years
                  </label>
                  <input
                    id="cagr-years"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cagr-months">
                    Duration — months
                  </label>
                  <input
                    id="cagr-months"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="11"
                    step="1"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Examples</p>
                <div className="grid gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setStart(preset.start);
                        setEnd(preset.end);
                        setYears(preset.years);
                        setMonths(preset.months);
                      }}
                      className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs to defaults"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {state.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {state.error}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Compound annual growth rate
                    </p>
                    <p
                      className={`mt-1 text-4xl font-semibold sm:text-5xl ${
                        state.profit ? "text-[var(--primary)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {rate(state.cagr)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      per year over {plain.format(state.duration)} years
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyResult}
                    aria-label="Copy the CAGR result"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                {state.wipeout ? (
                  <p
                    role="status"
                    className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                  >
                    An end value of zero is a total loss, so the growth rate is −100%.
                  </p>
                ) : null}

                <dl className="mt-5 grid gap-3">
                  {[
                    ["Absolute (total) return", rate(state.absoluteReturn)],
                    ["Total gain", money(state.totalGain)],
                    ["Growth multiple", `${plain.format(state.multiple)}x`],
                    ["Simple annual average (non-compounded)", rate(state.simpleAnnual)],
                    state.doubles
                      ? ["Money doubles every", `${plain.format(state.doubles)} years`]
                      : null,
                    state.rule72 ? ["Rule of 72 estimate", `${plain.format(state.rule72)} years`] : null,
                  ]
                    .filter(Boolean)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                      >
                        <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                        <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
                      </div>
                    ))}
                </dl>

                {state.rows.length > 0 ? (
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold">Year-wise path at this CAGR</p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[280px] text-left text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                            <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                            <th scope="col" className="py-2 pr-3 font-semibold">Value</th>
                            <th scope="col" className="py-2 font-semibold">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {state.rows.map((row) => (
                            <tr key={String(row.year)} className="border-t border-[var(--border)]">
                              <td className="py-2 pr-3">{row.partial ? `${row.year} (end)` : row.year}</td>
                              <td className="py-2 pr-3 font-semibold">{money(row.value)}</td>
                              <td
                                className={`py-2 ${
                                  row.gain >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
                                }`}
                              >
                                {row.gain >= 0 ? "+" : "−"}
                                {money(Math.abs(row.gain))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {state.projections.map((p) => (
                    <div
                      key={p.extra}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-xs text-[var(--muted-foreground)]">
                        If this rate held {p.extra} more years
                      </p>
                      <p className="mt-1 font-semibold">{money(p.value)}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                  Formula: CAGR = (end ÷ start)<sup>1/years</sup> − 1. CAGR smooths the journey into a
                  single steady rate — it says nothing about the volatility along the way, and it does
                  not handle money added or withdrawn mid-period (use XIRR for that).
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
