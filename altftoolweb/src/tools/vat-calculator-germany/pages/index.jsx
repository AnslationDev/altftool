"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  CURRENCY,
  KU_CURRENT_YEAR_LIMIT,
  KU_PREVIOUS_YEAR_LIMIT,
  LOCALE,
  STANDARD_RATE,
  VAT_RATES,
  calculateVat,
  checkKleinunternehmer,
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
  amount: "100",
  band: "standard",
  custom: "19",
  mode: "add",
  previousYear: "22000",
  currentYear: "60000",
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
  const [previousYear, setPreviousYear] = useState(DEFAULTS.previousYear);
  const [currentYear, setCurrentYear] = useState(DEFAULTS.currentYear);
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

  const comparison = useMemo(() => (ok ? compareRates(result.net) : []), [ok, result]);

  const kleinunternehmer = useMemo(() => {
    const prev = toNumber(previousYear);
    const curr = toNumber(currentYear);
    if (Number.isNaN(prev) || Number.isNaN(curr)) {
      return { error: "Enter both turnover figures as numbers." };
    }
    return checkKleinunternehmer({ previousYear: prev, currentYear: curr });
  }, [previousYear, currentYear]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "German VAT (Umsatzsteuer) calculation",
      `Mode: ${mode === "add" ? "netto to brutto" : "brutto to netto"}`,
      `Rate: ${pct(result.ratePercent)}`,
      `Netto (excluding VAT): ${money(result.net)}`,
      `Umsatzsteuer: ${money(result.vat)}`,
      `Brutto (including VAT): ${money(result.gross)}`,
      result.fraction ? `Tax share of the brutto price: ${result.fraction.text}` : null,
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
    setPreviousYear(DEFAULTS.previousYear);
    setCurrentYear(DEFAULTS.currentYear);
    setCopied(false);
  };

  const headlineLabel = mode === "add" ? "Brutto (including VAT)" : "Netto (excluding VAT)";
  const headlineValue = ok ? money(mode === "add" ? result.gross : result.net) : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Deutschland
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">VAT Calculator (Germany)</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Switch between netto and brutto at the 19% Regelsteuersatz or the 7% ermäßigter Satz, see
          the Umsatzsteuer as a fraction of the gross price, and test the Kleinunternehmer limits.
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
            <label className={LABEL_CLASS} htmlFor="de-vat-amount">
              {mode === "add" ? "Netto amount (excluding VAT)" : "Brutto amount (including VAT)"}
            </label>
            <input
              id="de-vat-amount"
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
            <label className={LABEL_CLASS} htmlFor="de-vat-band">
              Steuersatz (VAT rate)
            </label>
            <select
              id="de-vat-band"
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
              <label className={LABEL_CLASS} htmlFor="de-vat-custom">
                Custom rate (%)
              </label>
              <input
                id="de-vat-custom"
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
            "Custom rates are for historic comparisons, such as the 16% / 5% cut from July to December 2020."}
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
                ? `Umsatzsteuer at ${pct(result.ratePercent)} is ${money(result.vat)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy German VAT result"
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
            ["Netto (excluding VAT)", ok ? money(result.net) : DASH],
            [`Umsatzsteuer at ${ok ? pct(result.ratePercent) : DASH}`, ok ? money(result.vat) : DASH],
            ["Brutto (including VAT)", ok ? money(result.gross) : DASH],
            ["Tax fraction of the brutto price", ok && result.fraction ? result.fraction.text : DASH],
            ["Tax as a share of the brutto price", ok ? pct(result.vatShareOfGross) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The same netto price at every German rate</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  USt
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
        <h2 className="text-base font-semibold">Kleinunternehmer check (§ 19 UStG)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="de-vat-prev">
              Turnover last calendar year
            </label>
            <input
              id="de-vat-prev"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={previousYear}
              onChange={(event) => setPreviousYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="de-vat-curr">
              Expected turnover this year
            </label>
            <input
              id="de-vat-curr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={currentYear}
              onChange={(event) => setCurrentYear(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
          <p
            className={`text-2xl font-semibold ${
              kleinunternehmer.error
                ? "text-[var(--muted-foreground)]"
                : kleinunternehmer.eligible
                  ? "text-[var(--success)]"
                  : "text-[var(--danger)]"
            }`}
          >
            {kleinunternehmer.error
              ? DASH
              : kleinunternehmer.eligible
                ? "Kleinunternehmer rules can apply"
                : "Standard VAT rules apply"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {kleinunternehmer.error
              ? kleinunternehmer.error
              : `Limits from 1 January 2025: up to ${money0(KU_PREVIOUS_YEAR_LIMIT)} in the previous year and ${money0(KU_CURRENT_YEAR_LIMIT)} in the current year. Previous year ${kleinunternehmer.previousOk ? "within" : "over"} the limit, current year ${kleinunternehmer.currentOk ? "within" : "over"} the limit.`}
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not Steuerberatung. Which rate applies depends on the supply, the place
        of supply and whether the reverse charge applies. Confirm with a Steuerberater before you
        file a Umsatzsteuer-Voranmeldung.
      </p>
    </main>
  );
}
