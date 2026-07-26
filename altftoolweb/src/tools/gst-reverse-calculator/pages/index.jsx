"use client";

import { useMemo, useState } from "react";
import { Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

const SLABS = [0, 0.25, 3, 5, 12, 18, 28];

const DEFAULTS = {
  amount: "1180",
  rate: "18",
  customRate: "",
  supply: "intra",
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inr2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (value) => inr2.format(Number.isFinite(value) ? value : 0);
const roundMoney = (value) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function splitInclusive(total, rate) {
  const base = total / (1 + rate / 100);
  const tax = total - base;
  return { base: roundMoney(base), tax: roundMoney(tax) };
}

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [customRate, setCustomRate] = useState(DEFAULTS.customRate);
  const [supply, setSupply] = useState(DEFAULTS.supply);
  const [copied, setCopied] = useState(false);

  const usingCustom = rate === "custom";
  const rawRate = usingCustom ? customRate : rate;

  const validation = useMemo(() => {
    const total = Number(amount);
    const pct = Number(rawRate);
    if (amount.trim() === "") return "Enter the GST-inclusive amount to split.";
    if (!Number.isFinite(total)) return "The inclusive amount must be a valid number.";
    if (total <= 0) return "The inclusive amount must be greater than zero.";
    if (total > 1e12) return "Enter an amount below 1,00,00,00,00,000.";
    if (String(rawRate).trim() === "") return "Enter a GST rate percentage.";
    if (!Number.isFinite(pct)) return "The GST rate must be a valid number.";
    if (pct < 0) return "The GST rate cannot be negative.";
    if (pct > 100) return "The GST rate cannot be more than 100%.";
    return "";
  }, [amount, rawRate]);

  const result = useMemo(() => {
    if (validation) return null;
    const total = Number(amount);
    const pct = Number(rawRate);
    const { base, tax } = splitInclusive(total, pct);
    const half = roundMoney(tax / 2);
    return {
      total: roundMoney(total),
      pct,
      base,
      tax,
      cgst: half,
      sgst: roundMoney(tax - half),
      igst: tax,
      effective: total > 0 ? (tax / total) * 100 : 0,
    };
  }, [amount, rawRate, validation]);

  const slabTable = useMemo(() => {
    const total = Number(amount);
    if (!Number.isFinite(total) || total <= 0) return [];
    return SLABS.map((slab) => {
      const { base, tax } = splitInclusive(total, slab);
      return { slab, base, tax };
    });
  }, [amount]);

  const report = useMemo(() => {
    if (!result) return "";
    const lines = [
      "GST Reverse Calculation",
      `Inclusive amount: ${money(result.total)}`,
      `GST rate: ${result.pct}%`,
      `Taxable (base) value: ${money(result.base)}`,
      `Total GST: ${money(result.tax)}`,
    ];
    if (supply === "intra") {
      lines.push(`CGST (${result.pct / 2}%): ${money(result.cgst)}`);
      lines.push(`SGST/UTGST (${result.pct / 2}%): ${money(result.sgst)}`);
    } else {
      lines.push(`IGST (${result.pct}%): ${money(result.igst)}`);
    }
    lines.push(`Supply type: ${supply === "intra" ? "Intra-state" : "Inter-state"}`);
    return lines.join("\n");
  }, [result, supply]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAmount(DEFAULTS.amount);
    setRate(DEFAULTS.rate);
    setCustomRate(DEFAULTS.customRate);
    setSupply(DEFAULTS.supply);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
            GST
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">GST Reverse Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Enter a GST-inclusive amount and get the taxable value, the GST portion, and the
            CGST/SGST or IGST split for any slab.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div>
                <label htmlFor="gst-amount" className="block text-sm font-semibold">
                  GST-inclusive amount (₹)
                </label>
                <input
                  id="gst-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                />
              </div>

              <div>
                <label htmlFor="gst-rate" className="block text-sm font-semibold">
                  GST rate
                </label>
                <select
                  id="gst-rate"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {SLABS.map((slab) => (
                    <option key={slab} value={String(slab)}>
                      {slab}%
                    </option>
                  ))}
                  <option value="custom">Custom rate</option>
                </select>
              </div>

              {usingCustom && (
                <div>
                  <label htmlFor="gst-custom-rate" className="block text-sm font-semibold">
                    Custom rate (%)
                  </label>
                  <input
                    id="gst-custom-rate"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.01"
                    value={customRate}
                    onChange={(event) => setCustomRate(event.target.value)}
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
              )}

              <div>
                <span className="block text-sm font-semibold" id="gst-supply-label">
                  Supply type
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-labelledby="gst-supply-label">
                  {[
                    { id: "intra", label: "Intra-state (CGST + SGST)" },
                    { id: "inter", label: "Inter-state (IGST)" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={supply === option.id}
                      onClick={() => setSupply(option.id)}
                      className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        supply === option.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  disabled={!result}
                  aria-label="Copy GST breakdown to clipboard"
                  className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              {validation ? (
                <p
                  role="alert"
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {validation}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Taxable value (before GST)
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                    {money(result.base)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {money(result.total)} inclusive at {result.pct}% GST
                  </p>

                  <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Total GST</dt>
                      <dd className="text-sm font-semibold">{money(result.tax)}</dd>
                    </div>
                    {supply === "intra" ? (
                      <>
                        <div className="flex items-center justify-between gap-4 py-2.5">
                          <dt className="text-sm text-[var(--muted-foreground)]">
                            CGST ({result.pct / 2}%)
                          </dt>
                          <dd className="text-sm font-semibold">{money(result.cgst)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2.5">
                          <dt className="text-sm text-[var(--muted-foreground)]">
                            SGST / UTGST ({result.pct / 2}%)
                          </dt>
                          <dd className="text-sm font-semibold">{money(result.sgst)}</dd>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between gap-4 py-2.5">
                        <dt className="text-sm text-[var(--muted-foreground)]">IGST ({result.pct}%)</dt>
                        <dd className="text-sm font-semibold">{money(result.igst)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Invoice total</dt>
                      <dd className="text-sm font-semibold">{money(result.total)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">GST as % of invoice</dt>
                      <dd className="text-sm font-semibold">{result.effective.toFixed(2)}%</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                    Formula: taxable value = inclusive amount ÷ (1 + rate ÷ 100). Informational only —
                    confirm the correct HSN/SAC rate before filing.
                  </p>
                </>
              )}
            </div>

            {slabTable.length > 0 && (
              <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-sm font-semibold">
                  Same {inr.format(Number(amount))} across every slab
                </h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 pr-3 font-semibold">Slab</th>
                        <th scope="col" className="py-2 pr-3 font-semibold">Base value</th>
                        <th scope="col" className="py-2 font-semibold">GST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slabTable.map((row) => (
                        <tr
                          key={row.slab}
                          className={`border-b border-[var(--border)] last:border-0 ${
                            String(row.slab) === String(rawRate) ? "text-[var(--primary)] font-semibold" : ""
                          }`}
                        >
                          <td className="py-2 pr-3">{row.slab}%</td>
                          <td className="py-2 pr-3">{money(row.base)}</td>
                          <td className="py-2">{money(row.tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
