"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  CURRENCY,
  FORFETTARIO_HARD_EXIT,
  FORFETTARIO_LIMIT,
  LOCALE,
  STANDARD_RATE,
  VAT_RATES,
  calculateVat,
  checkForfettario,
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
  band: "ordinaria",
  custom: "22",
  mode: "add",
  revenue: "60000",
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
  const [revenue, setRevenue] = useState(DEFAULTS.revenue);
  const [copied, setCopied] = useState(false);

  const selectedBand = useMemo(() => VAT_RATES.find((item) => item.id === band) ?? null, [band]);

  const activeRate = useMemo(() => {
    if (band === "custom") return toNumber(custom);
    return selectedBand ? selectedBand.rate : STANDARD_RATE;
  }, [band, custom, selectedBand]);

  const result = useMemo(() => {
    const value = toNumber(amount);
    if (Number.isNaN(value)) return { error: "Enter an amount as a number." };
    if (Number.isNaN(activeRate)) return { error: "Enter an IVA rate as a number." };
    return calculateVat({ amount: value, ratePercent: activeRate, mode });
  }, [amount, activeRate, mode]);

  const ok = !result.error;

  const comparison = useMemo(() => (ok ? compareRates(result.net) : []), [ok, result]);

  const forfettario = useMemo(() => {
    const value = toNumber(revenue);
    if (Number.isNaN(value)) return { error: "Enter your annual revenue as a number." };
    return checkForfettario(value);
  }, [revenue]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Italian IVA calculation",
      `Mode: ${mode === "add" ? "imponibile to totale" : "scorporo, totale to imponibile"}`,
      `Aliquota: ${pct(result.ratePercent)}`,
      `Imponibile: ${money(result.net)}`,
      `IVA: ${money(result.vat)}`,
      `Totale documento: ${money(result.gross)}`,
      result.fraction ? `IVA share of the total: ${result.fraction.text}` : null,
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
    setRevenue(DEFAULTS.revenue);
    setCopied(false);
  };

  const headlineLabel = mode === "add" ? "Totale (IVA inclusa)" : "Imponibile (IVA esclusa)";
  const headlineValue = ok ? money(mode === "add" ? result.gross : result.net) : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Italia
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">VAT Calculator (Italy)</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add IVA to an imponibile or scorporate it out of a gross total at the 22% ordinaria, 10%,
          5% and 4% minima rates, with a regime forfettario threshold check.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="grid grid-cols-2 gap-2 rounded-md bg-[var(--muted)] p-1"
          role="group"
          aria-label="Calculation direction"
        >
          {[
            ["add", "Add IVA"],
            ["remove", "Scorporo"],
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
            <label className={LABEL_CLASS} htmlFor="it-vat-amount">
              {mode === "add" ? "Imponibile (IVA esclusa)" : "Totale (IVA inclusa)"}
            </label>
            <input
              id="it-vat-amount"
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
            <label className={LABEL_CLASS} htmlFor="it-vat-band">
              Aliquota IVA
            </label>
            <select
              id="it-vat-band"
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
              <label className={LABEL_CLASS} htmlFor="it-vat-custom">
                Custom rate (%)
              </label>
              <input
                id="it-vat-custom"
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
            "Custom rates are useful for historic comparisons, such as the 21% standard rate in force from September 2011 to September 2013."}
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {headlineLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headlineValue}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `IVA at ${pct(result.ratePercent)} is ${money(result.vat)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Italian IVA result"
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
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? "Copied Italian IVA result to clipboard" : ""}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Imponibile", ok ? money(result.net) : DASH],
            [`IVA (${ok ? pct(result.ratePercent) : DASH})`, ok ? money(result.vat) : DASH],
            ["Totale documento", ok ? money(result.gross) : DASH],
            ["IVA fraction of the total", ok && result.fraction ? result.fraction.text : DASH],
            ["IVA as a share of the total", ok ? pct(result.vatShareOfGross) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The same imponibile at every Italian rate</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Aliquota
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  IVA
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Totale
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
        <h2 className="text-base font-semibold">Regime forfettario check</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="it-vat-revenue">
              Annual revenue (ricavi o compensi)
            </label>
            <input
              id="it-vat-revenue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={revenue}
              onChange={(event) => setRevenue(event.target.value)}
            />
          </div>
          <div className="rounded-md bg-[var(--muted)] p-4" aria-live="polite" role="status">
            <p
              className={`text-2xl font-semibold ${
                forfettario.error
                  ? "text-[var(--muted-foreground)]"
                  : forfettario.withinLimit
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {forfettario.error
                ? DASH
                : forfettario.withinLimit
                  ? "Within the forfettario limit"
                  : forfettario.hardExit
                    ? "Regime ends immediately"
                    : "Regime ends next year"}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {forfettario.error
                ? forfettario.error
                : forfettario.withinLimit
                  ? `${money0(forfettario.headroom)} of headroom below the ${money0(FORFETTARIO_LIMIT)} limit.`
                  : forfettario.hardExit
                    ? `Above ${money0(FORFETTARIO_HARD_EXIT)}, so IVA is due from the operation that crossed it.`
                    : `Between ${money0(FORFETTARIO_LIMIT)} and ${money0(FORFETTARIO_HARD_EXIT)}, so ordinary IVA rules start next calendar year.`}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not consulenza fiscale. Reverse charge, split payment and the special
        margin schemes change who accounts for the tax. Check with a commercialista before filing
        your liquidazione IVA.
      </p>
    </main>
  );
}
