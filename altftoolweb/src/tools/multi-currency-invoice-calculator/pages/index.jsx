"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CURRENCY_CODES,
  CURRENCY_LOCALES,
  QUOTE_DIRECTIONS,
  buildSensitivity,
  computeMultiCurrencyInvoice,
  decimalsFor,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const START_LINES = [
  { id: 1, description: "Design retainer", amount: "1000", currency: "USD", rate: "83.5", direction: "per-unit", taxable: true },
  { id: 2, description: "Build sprint", amount: "500", currency: "EUR", rate: "90.2", direction: "per-unit", taxable: true },
  { id: 3, description: "Support hours", amount: "20000", currency: "INR", rate: "1", direction: "per-unit", taxable: true },
];

const DEFAULTS = {
  settlement: "INR",
  taxPercent: "18",
  bankFeePercent: "2.5",
  fixedFee: "500",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const makeFormatter = (code) =>
  new Intl.NumberFormat(CURRENCY_LOCALES[code] ?? "en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: decimalsFor(code),
    minimumFractionDigits: decimalsFor(code),
  });

export default function ToolHome() {
  const [lines, setLines] = useState(START_LINES);
  const [settlement, setSettlement] = useState(DEFAULTS.settlement);
  const [taxPercent, setTaxPercent] = useState(DEFAULTS.taxPercent);
  const [bankFeePercent, setBankFeePercent] = useState(DEFAULTS.bankFeePercent);
  const [fixedFee, setFixedFee] = useState(DEFAULTS.fixedFee);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const formatter = makeFormatter(settlement);
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [settlement]);

  const num = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }), []);
  const pct = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }), []);

  const input = useMemo(
    () => ({
      lines: lines.map((line) => ({
        description: line.description,
        amount: toNumber(line.amount),
        currency: line.currency,
        rate: toNumber(line.rate),
        direction: line.direction,
        taxable: line.taxable,
      })),
      settlementCurrency: settlement,
      taxPercent: toNumber(taxPercent),
      bankFeePercent: toNumber(bankFeePercent),
      fixedFee: toNumber(fixedFee),
    }),
    [lines, settlement, taxPercent, bankFeePercent, fixedFee],
  );

  const result = useMemo(() => computeMultiCurrencyInvoice(input), [input]);
  const sensitivity = useMemo(() => (result.error ? [] : buildSensitivity(input)), [result, input]);

  const ok = !result.error;

  const updateLine = (id, field, value) => {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  };

  const addLine = () => {
    setLines((prev) => {
      const nextId = prev.reduce((max, line) => Math.max(max, line.id), 0) + 1;
      return [...prev, { id: nextId, description: "", amount: "0", currency: "USD", rate: "1", direction: "per-unit", taxable: true }];
    });
  };

  const removeLine = (id) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Multi-currency invoice (settled in ${settlement})`,
      ...result.lines.map(
        (line) =>
          `${line.description || "Line"}: ${line.amount} ${line.currency} @ ${num.format(line.effectiveRate)} = ${money(line.converted)}`,
      ),
      `Subtotal: ${money(result.subtotal)}`,
      `Tax: ${money(result.tax)}`,
      `Invoice total: ${money(result.invoiceTotal)}`,
      `Bank spread: ${money(result.bankSpread)}`,
      `Fixed fee: ${money(result.fixedFee)}`,
      `Net you receive: ${money(result.netReceived)}`,
    ].join("\n");
  }, [ok, result, money, num, settlement]);

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
    setLines(START_LINES);
    setSettlement(DEFAULTS.settlement);
    setTaxPercent(DEFAULTS.taxPercent);
    setBankFeePercent(DEFAULTS.bankFeePercent);
    setFixedFee(DEFAULTS.fixedFee);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Cross-border billing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Multi Currency Invoice Total Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price lines in whatever currency you agreed, enter the rate you are actually being given,
          and settle the whole invoice in one currency — with the bank spread shown separately.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Settlement</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-settle">Settlement currency</label>
            <select id="mc-settle" className={`mt-2 ${INPUT_CLASS}`} value={settlement} onChange={(e) => setSettlement(e.target.value)}>
              {CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-tax">Tax on taxable lines (%)</label>
            <input id="mc-tax" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.5" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-spread">Bank / gateway spread (%)</label>
            <input id="mc-spread" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.1" value={bankFeePercent} onChange={(e) => setBankFeePercent(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-fixed">Fixed transfer fee</label>
            <input id="mc-fixed" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Invoice lines</h2>
          <button type="button" onClick={addLine} className={GHOST_BTN} aria-label="Add an invoice line">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {lines.map((line, index) => {
            const converted = ok ? result.lines[index] : null;
            const sameCurrency = line.currency === settlement;
            return (
              <div key={line.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS} htmlFor={`mc-desc-${line.id}`}>Description</label>
                    <input id={`mc-desc-${line.id}`} className={`mt-2 ${INPUT_CLASS}`} type="text" value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`mc-amt-${line.id}`}>Amount</label>
                    <input id={`mc-amt-${line.id}`} className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={line.amount} onChange={(e) => updateLine(line.id, "amount", e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`mc-cur-${line.id}`}>Currency</label>
                    <select id={`mc-cur-${line.id}`} className={`mt-2 ${INPUT_CLASS}`} value={line.currency} onChange={(e) => updateLine(line.id, "currency", e.target.value)}>
                      {CURRENCY_CODES.map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  {!sameCurrency && (
                    <>
                      <div>
                        <label className={LABEL_CLASS} htmlFor={`mc-rate-${line.id}`}>
                          Exchange rate ({QUOTE_DIRECTIONS[line.direction].describe(line.currency, settlement)})
                        </label>
                        <input id={`mc-rate-${line.id}`} className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.0001" value={line.rate} onChange={(e) => updateLine(line.id, "rate", e.target.value)} />
                      </div>
                      <div>
                        <label className={LABEL_CLASS} htmlFor={`mc-dir-${line.id}`}>Rate is quoted as</label>
                        <select id={`mc-dir-${line.id}`} className={`mt-2 ${INPUT_CLASS}`} value={line.direction} onChange={(e) => updateLine(line.id, "direction", e.target.value)}>
                          {Object.values(QUOTE_DIRECTIONS).map((item) => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex items-center">
                    <label className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold" htmlFor={`mc-tax-${line.id}`}>
                      <input
                        id={`mc-tax-${line.id}`}
                        type="checkbox"
                        className="h-5 w-5 accent-[var(--primary)]"
                        checked={line.taxable}
                        onChange={(e) => updateLine(line.id, "taxable", e.target.checked)}
                      />
                      Taxable
                    </label>
                  </div>
                  <div className="flex items-center justify-end">
                    <button type="button" onClick={() => removeLine(line.id)} className={GHOST_BTN} aria-label={`Remove line ${index + 1}`} disabled={lines.length === 1}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  {converted ? (
                    <>
                      {line.amount || 0} {line.currency} at {num.format(converted.effectiveRate)} ={" "}
                      <strong className="text-[var(--foreground)]">{money(converted.converted)}</strong>
                    </>
                  ) : (
                    DASH
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Invoice total in {settlement}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.invoiceTotal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.currencyCount} currencies · ${pct.format(result.foreignSharePercent)}% exposed to FX` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the multi-currency invoice total" className={GHOST_BTN} disabled={!summary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy totals"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the invoice" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Converted subtotal", ok ? money(result.subtotal) : DASH],
            ["Taxable value", ok ? money(result.taxableBase) : DASH],
            ["Tax", ok ? money(result.tax) : DASH],
            ["Bank / gateway spread", ok ? `-${money(result.bankSpread)}` : DASH],
            ["Fixed transfer fee", ok ? `-${money(result.fixedFee)}` : DASH],
            ["Net you actually receive", ok ? money(result.netReceived) : DASH],
            ["Value exposed to exchange rates", ok ? money(result.foreignValue) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {sensitivity.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">If rates move before you are paid</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Rate move</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Invoice total</th>
                  <th scope="col" className="py-2 text-right font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((row) => (
                  <tr key={row.shiftPercent} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.shiftPercent > 0 ? "+" : ""}{row.shiftPercent}%</td>
                    <td className="py-2 pr-3 text-right">{money(row.invoiceTotal)}</td>
                    <td className={`py-2 text-right font-semibold ${row.delta < 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                      {row.delta > 0 ? "+" : ""}{money(row.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        No live rates are used — enter the rate you have been quoted and record its date on the
        invoice. Which country's tax applies to a cross-border supply, and whether the reverse charge
        shifts it to your customer, depends on where both parties are established; check with a
        qualified accountant.
      </p>
    </main>
  );
}
