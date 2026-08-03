"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CURRENCY,
  KOR_LIMIT,
  LOCALE,
  STANDARD_RATE,
  VAT_RATES,
  calculateVat,
  checkKor,
  compareRates,
  netBtwPosition,
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
  band: "hoog",
  custom: "21",
  mode: "add",
  turnover: "18000",
  outputVat: "2100",
  inputVat: "800",
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
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [outputVat, setOutputVat] = useState(DEFAULTS.outputVat);
  const [inputVat, setInputVat] = useState(DEFAULTS.inputVat);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const selectedBand = useMemo(() => VAT_RATES.find((item) => item.id === band) ?? null, [band]);

  const activeRate = useMemo(() => {
    if (band === "custom") return toNumber(custom);
    return selectedBand ? selectedBand.rate : STANDARD_RATE;
  }, [band, custom, selectedBand]);

  const result = useMemo(() => {
    const value = toNumber(amount);
    if (Number.isNaN(value)) return { error: "Enter an amount as a number." };
    if (Number.isNaN(activeRate)) return { error: "Enter a BTW rate as a number." };
    return calculateVat({ amount: value, ratePercent: activeRate, mode });
  }, [amount, activeRate, mode]);

  const ok = !result.error;

  const comparison = useMemo(() => (ok ? compareRates(result.net) : []), [ok, result]);

  const kor = useMemo(() => {
    const value = toNumber(turnover);
    if (Number.isNaN(value)) return { error: "Enter your annual turnover as a number." };
    return checkKor(value);
  }, [turnover]);

  const position = useMemo(() => {
    const out = toNumber(outputVat);
    const inp = toNumber(inputVat);
    if (Number.isNaN(out) || Number.isNaN(inp)) {
      return { error: "Enter both BTW figures as numbers." };
    }
    return netBtwPosition({ outputVat: out, inputVat: inp });
  }, [outputVat, inputVat]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Dutch BTW calculation",
      `Mode: ${mode === "add" ? "netto to bruto" : "bruto to netto"}`,
      `Tarief: ${pct(result.ratePercent)}`,
      `Bedrag exclusief BTW: ${money(result.net)}`,
      `BTW: ${money(result.vat)}`,
      `Bedrag inclusief BTW: ${money(result.gross)}`,
      result.fraction ? `BTW share of the gross price: ${result.fraction.text}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, mode]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "Dutch BTW result" });
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setAmount(DEFAULTS.amount);
    setBand(DEFAULTS.band);
    setCustom(DEFAULTS.custom);
    setTurnover(DEFAULTS.turnover);
    setOutputVat(DEFAULTS.outputVat);
    setInputVat(DEFAULTS.inputVat);
    resetCopyState();
  };

  const headlineLabel = mode === "add" ? "Bedrag inclusief BTW" : "Bedrag exclusief BTW";
  const headlineValue = ok ? money(mode === "add" ? result.gross : result.net) : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Nederland
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          VAT Calculator (Netherlands)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add or reverse Dutch BTW at the 21% hoog tarief, the 9% laag tarief or the nultarief, check
          the KOR limit, and net your output BTW against voorbelasting.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="grid grid-cols-2 gap-2 rounded-md bg-[var(--muted)] p-1"
          role="group"
          aria-label="Calculation direction"
        >
          {[
            ["add", "Add BTW"],
            ["remove", "Reverse BTW"],
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
            <label className={LABEL_CLASS} htmlFor="nl-vat-amount">
              {mode === "add" ? "Bedrag exclusief BTW" : "Bedrag inclusief BTW"}
            </label>
            <input
              id="nl-vat-amount"
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
            <label className={LABEL_CLASS} htmlFor="nl-vat-band">
              BTW-tarief
            </label>
            <select
              id="nl-vat-band"
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
              <label className={LABEL_CLASS} htmlFor="nl-vat-custom">
                Custom rate (%)
              </label>
              <input
                id="nl-vat-custom"
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
            "Custom rates are useful for historic comparisons, such as the 19% standard rate in force until 1 October 2012."}
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
                ? `BTW at ${pct(result.ratePercent)} is ${money(result.vat)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("result") ? "Copied the Dutch BTW result to clipboard" : "Copy Dutch BTW result"}
              className={GHOST_BTN}
              disabled={!ok}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
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
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bedrag exclusief BTW", ok ? money(result.net) : DASH],
            [`BTW (${ok ? pct(result.ratePercent) : DASH})`, ok ? money(result.vat) : DASH],
            ["Bedrag inclusief BTW", ok ? money(result.gross) : DASH],
            ["BTW fraction of the gross price", ok && result.fraction ? result.fraction.text : DASH],
            ["BTW as a share of the gross price", ok ? pct(result.vatShareOfGross) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The same net price at every Dutch rate</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tarief
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  BTW
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Inclusief
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
        <h2 className="text-base font-semibold">BTW-aangifte: what do I pay?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-vat-output">
              BTW charged on sales
            </label>
            <input
              id="nl-vat-output"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={outputVat}
              onChange={(event) => setOutputVat(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-vat-input">
              Voorbelasting (BTW on purchases)
            </label>
            <input
              id="nl-vat-input"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={inputVat}
              onChange={(event) => setInputVat(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {position.error ? "Net position" : position.payable ? "Te betalen" : "Terug te vragen"}
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              position.error
                ? "text-[var(--muted-foreground)]"
                : position.payable
                  ? "text-[var(--foreground)]"
                  : "text-[var(--success)]"
            }`}
          >
            {position.error
              ? DASH
              : money(position.payable ? position.balance : position.refund)}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            {position.error
              ? position.error
              : "BTW charged on sales minus voorbelasting on purchases for the period."}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Kleineondernemersregeling (KOR)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-vat-turnover">
              Annual Dutch turnover
            </label>
            <input
              id="nl-vat-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={turnover}
              onChange={(event) => setTurnover(event.target.value)}
            />
          </div>
          <div className="rounded-md bg-[var(--muted)] p-4">
            <p
              className={`text-2xl font-semibold ${
                kor.error
                  ? "text-[var(--muted-foreground)]"
                  : kor.eligible
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {kor.error ? DASH : kor.eligible ? "KOR is available" : "Above the KOR limit"}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {kor.error
                ? kor.error
                : kor.eligible
                  ? `${money0(kor.headroom)} below the ${money0(KOR_LIMIT)} limit. Opting in means charging no BTW — and reclaiming no voorbelasting.`
                  : `Turnover is over ${money0(KOR_LIMIT)}, so normal BTW returns apply.`}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not belastingadvies. Which tarief applies depends on the supply, and
        verlegde BTW (reverse charge) moves the obligation to your customer. Check the
        Belastingdienst guidance or ask a boekhouder before filing.
      </p>
    </main>
  );
}
