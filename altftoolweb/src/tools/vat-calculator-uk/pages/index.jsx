"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  CURRENCY,
  DEREGISTRATION_THRESHOLD,
  LOCALE,
  REGISTRATION_THRESHOLD,
  STANDARD_RATE,
  VAT_RATES,
  calculateVat,
  checkRegistration,
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
const PCT = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? MONEY.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? MONEY0.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${PCT.format(value)}%` : DASH);

const DEFAULTS = { amount: "100", band: "standard", custom: "20", mode: "add", turnover: "75000" };

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
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [copied, setCopied] = useState(false);

  const activeRate = useMemo(() => {
    if (band === "custom") return toNumber(custom);
    const found = VAT_RATES.find((item) => item.id === band);
    return found ? found.rate : STANDARD_RATE;
  }, [band, custom]);

  const result = useMemo(() => {
    const value = toNumber(amount);
    if (Number.isNaN(value)) return { error: "Enter an amount as a number." };
    if (Number.isNaN(activeRate)) return { error: "Enter a VAT rate as a number." };
    return calculateVat({ amount: value, ratePercent: activeRate, mode });
  }, [amount, activeRate, mode]);

  const ok = !result.error;

  const comparison = useMemo(() => {
    if (!ok) return [];
    return compareRates(result.net);
  }, [ok, result]);

  const registration = useMemo(() => {
    const value = toNumber(turnover);
    if (Number.isNaN(value)) return { error: "Enter your 12-month taxable turnover." };
    return checkRegistration(value);
  }, [turnover]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "UK VAT calculation",
      `Mode: ${mode === "add" ? "add VAT to a net price" : "remove VAT from a gross price"}`,
      `VAT rate: ${pct(result.ratePercent)}`,
      `Net (excluding VAT): ${money(result.net)}`,
      `VAT: ${money(result.vat)}`,
      `Gross (including VAT): ${money(result.gross)}`,
      result.fraction ? `VAT fraction of the gross price: ${result.fraction.text}` : null,
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
    setTurnover(DEFAULTS.turnover);
    setCopied(false);
  };

  const headlineLabel = mode === "add" ? "Total including VAT" : "Price excluding VAT";
  const headlineValue = ok ? money(mode === "add" ? result.gross : result.net) : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          United Kingdom
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">VAT Calculator (UK)</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add VAT to a net price or strip it out of a VAT-inclusive one at the 20% standard, 5%
          reduced or 0% zero rate — with the HMRC VAT fraction and a registration threshold check.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="grid grid-cols-2 gap-2 rounded-md bg-[var(--muted)] p-1"
          role="group"
          aria-label="Calculation direction"
        >
          {[
            ["add", "Add VAT"],
            ["remove", "Remove VAT"],
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
            <label className={LABEL_CLASS} htmlFor="uk-vat-amount">
              {mode === "add" ? "Net amount (excluding VAT)" : "Gross amount (including VAT)"}
            </label>
            <input
              id="uk-vat-amount"
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
            <label className={LABEL_CLASS} htmlFor="uk-vat-band">
              VAT rate
            </label>
            <select
              id="uk-vat-band"
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
              <label className={LABEL_CLASS} htmlFor="uk-vat-custom">
                Custom VAT rate (%)
              </label>
              <input
                id="uk-vat-custom"
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
          {VAT_RATES.find((item) => item.id === band)?.note ??
            "Custom rates are for historic or non-UK comparisons."}
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
              aria-label="Copy UK VAT result"
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
            ["Net price (excluding VAT)", ok ? money(result.net) : DASH],
            [`VAT at ${ok ? pct(result.ratePercent) : DASH}`, ok ? money(result.vat) : DASH],
            ["Gross price (including VAT)", ok ? money(result.gross) : DASH],
            ["VAT fraction of the gross price", ok && result.fraction ? result.fraction.text : DASH],
            ["VAT as a share of the gross price", ok ? pct(result.vatShareOfGross) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The same net price at every UK rate</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  VAT
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Gross
                </th>
              </tr>
            </thead>
            <tbody>
              {(comparison.length ? comparison : VAT_RATES).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {row.label} · {row.rate}%
                  </td>
                  <td className="py-2 pr-3 text-right">{money(row.vat)}</td>
                  <td className="py-2 text-right">{money(row.gross)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Do I have to register for VAT?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="uk-vat-turnover">
              Taxable turnover, last 12 months
            </label>
            <input
              id="uk-vat-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={turnover}
              onChange={(event) => setTurnover(event.target.value)}
            />
          </div>
          <div className="rounded-md bg-[var(--muted)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Threshold {money0(REGISTRATION_THRESHOLD)}
            </p>
            <p
              className={`mt-1 text-2xl font-semibold ${
                registration.error
                  ? "text-[var(--muted-foreground)]"
                  : registration.mustRegister
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
              }`}
            >
              {registration.error
                ? DASH
                : registration.mustRegister
                  ? "Registration required"
                  : "Below the threshold"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {registration.error
                ? registration.error
                : registration.mustRegister
                  ? `Over by ${money0(-registration.headroom)}. Register within 30 days of the end of the month you crossed it.`
                  : `${money0(registration.headroom)} of headroom left before you must register.`}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          You can apply to deregister once turnover falls below{" "}
          {money0(DEREGISTRATION_THRESHOLD)}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Liability depends on what you supply, where your
        customer is and which schemes you use (flat rate, margin, reverse charge). Check HMRC
        guidance or speak to an accountant before filing a return.
      </p>
    </main>
  );
}
