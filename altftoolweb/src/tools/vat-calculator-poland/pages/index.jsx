"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  CURRENCY,
  EXEMPTION_LIMIT,
  LOCALE,
  SPLIT_PAYMENT_THRESHOLD,
  STANDARD_RATE,
  VAT_RATES,
  calculateVat,
  checkExemption,
  compareRates,
} from "../lib";

const MONEY = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const MONEY0 = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? MONEY.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? MONEY0.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${PCT.format(value)}%` : DASH);

const DEFAULTS = {
  amount: "1000",
  band: "podstawowa",
  custom: "23",
  mode: "add",
  sales: "150000",
  months: "12",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [band, setBand] = useState(DEFAULTS.band);
  const [custom, setCustom] = useState(DEFAULTS.custom);
  const [sales, setSales] = useState(DEFAULTS.sales);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [copied, setCopied] = useState(false);

  const selectedBand = useMemo(() => VAT_RATES.find((item) => item.id === band) ?? null, [band]);

  const activeRate = useMemo(() => {
    if (band === "custom") return toNumber(custom);
    return selectedBand ? selectedBand.rate : STANDARD_RATE;
  }, [band, custom, selectedBand]);

  const result = useMemo(() => {
    const value = toNumber(amount);
    if (Number.isNaN(value)) return { error: "Enter an amount as a number." };
    if (Number.isNaN(activeRate)) return { error: "Enter a VAT rate as a number." };
    return calculateVat({ amount: value, ratePercent: activeRate, mode });
  }, [amount, activeRate, mode]);

  const ok = !result.error;

  const comparison = useMemo(() => (ok ? compareRates(result.net) : []), [ok, result]);

  const exemption = useMemo(() => {
    const value = toNumber(sales);
    const m = toNumber(months);
    if (Number.isNaN(value) || Number.isNaN(m)) {
      return { error: "Enter sales and months as numbers." };
    }
    return checkExemption(value, m);
  }, [sales, months]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Polish VAT calculation",
      `Mode: ${mode === "add" ? "netto to brutto" : "brutto to netto"}`,
      `Stawka VAT: ${pct(result.ratePercent)}`,
      `Kwota netto: ${money(result.net)}`,
      `VAT: ${money(result.vat)}`,
      `Kwota brutto: ${money(result.gross)}`,
      result.fraction ? `VAT share of the gross price: ${result.fraction.text}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, mode]);

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
    setMode(DEFAULTS.mode);
    setAmount(DEFAULTS.amount);
    setBand(DEFAULTS.band);
    setCustom(DEFAULTS.custom);
    setSales(DEFAULTS.sales);
    setMonths(DEFAULTS.months);
    setCopied(false);
  };

  const headlineLabel = mode === "add" ? "Kwota brutto (z VAT)" : "Kwota netto (bez VAT)";
  const headlineValue = ok ? money(mode === "add" ? result.gross : result.net) : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Polska
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">VAT Calculator (Poland)</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Switch between netto and brutto at the 23% stawka podstawowa or the 8% and 5% reduced
          rates, check the PLN 200,000 exemption limit and flag invoices that need split payment.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="grid grid-cols-2 gap-2 rounded-md bg-[var(--muted)] p-1"
          role="group"
          aria-label="Calculation direction"
        >
          {[
            ["add", "Netto → Brutto"],
            ["remove", "Brutto → Netto"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === value
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-vat-amount">
              {mode === "add" ? "Kwota netto (bez VAT)" : "Kwota brutto (z VAT)"}
            </label>
            <input
              id="pl-vat-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-vat-band">
              Stawka VAT
            </label>
            <select
              id="pl-vat-band"
              className={`mt-2 ${INPUT_CLASS}`}
              value={band}
              onChange={(event) => setBand(event.target.value)}
            >
              {VAT_RATES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.rate}%
                </option>
              ))}
              <option value="custom">Custom rate</option>
            </select>
          </div>
          {band === "custom" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="pl-vat-custom">
                Custom rate (%)
              </label>
              <input
                id="pl-vat-custom"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.5"
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
              />
            </div>
          )}
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {selectedBand?.note ??
            "Custom rates help with historic comparisons, such as the 22% standard rate in force until the end of 2010."}
        </p>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {headlineLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headlineValue}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `VAT at ${pct(result.ratePercent)} is ${money(result.vat)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Polish VAT result"
              className={GHOST_BTN}
              disabled={!ok}
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
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Kwota netto", ok ? money(result.net) : DASH],
            [`VAT (${ok ? pct(result.ratePercent) : DASH})`, ok ? money(result.vat) : DASH],
            ["Kwota brutto", ok ? money(result.gross) : DASH],
            ["VAT fraction of the gross price", ok && result.fraction ? result.fraction.text : DASH],
            ["VAT as a share of the gross price", ok ? pct(result.vatShareOfGross) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.splitPaymentValueTest
              ? `This invoice is over ${money0(SPLIT_PAYMENT_THRESHOLD)} gross, so mechanizm podzielonej płatności is mandatory if it covers goods or services from załącznik nr 15.`
              : `Below the ${money0(SPLIT_PAYMENT_THRESHOLD)} gross threshold, so split payment is voluntary.`}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The same netto price at every Polish rate</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Stawka
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  VAT
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Brutto
                </th>
              </tr>
            </thead>
            <tbody>
              {(comparison.length ? comparison : VAT_RATES).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.rate}%</td>
                  <td className="py-2 pr-3 text-right">{money(row.vat)}</td>
                  <td className="py-2 text-right">{money(row.gross)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Zwolnienie podmiotowe (art. 113)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-vat-sales">
              Annual sales, excluding tax
            </label>
            <input
              id="pl-vat-sales"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={sales}
              onChange={(event) => setSales(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pl-vat-months">
              Months trading this year
            </label>
            <input
              id="pl-vat-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
          <p
            className={`text-2xl font-semibold ${
              exemption.error
                ? "text-[var(--muted-foreground)]"
                : exemption.eligible
                  ? "text-[var(--success)]"
                  : "text-[var(--danger)]"
            }`}
          >
            {exemption.error
              ? DASH
              : exemption.eligible
                ? "Exemption still available"
                : "VAT registration required"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {exemption.error
              ? exemption.error
              : `Limit for this period: ${money0(exemption.limit)} (full-year limit ${money0(EXEMPTION_LIMIT)}). ${
                  exemption.eligible
                    ? `${money0(exemption.headroom)} of headroom left.`
                    : "Sales exceed the limit, so VAT is due from the transaction that crossed it."
                }`}
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not doradztwo podatkowe. Some activities, such as legal and jewellery
        services, cannot use the art. 113 exemption at all. Check the ustawa o VAT or ask a księgowy
        before filing JPK_V7.
      </p>
    </main>
  );
}
