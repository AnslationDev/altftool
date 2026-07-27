"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  CURRENCY,
  GST_RATE,
  GST_TREATMENTS,
  LOCALE,
  NON_PROFIT_THRESHOLD,
  REGISTRATION_THRESHOLD,
  calculateGst,
  checkRegistration,
  computeBas,
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

const DEFAULTS = {
  amount: "100",
  treatment: "taxable",
  mode: "add",
  sales: "55000",
  purchases: "22000",
  turnover: "60000",
  nonProfit: false,
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
  const [treatment, setTreatment] = useState(DEFAULTS.treatment);
  const [sales, setSales] = useState(DEFAULTS.sales);
  const [purchases, setPurchases] = useState(DEFAULTS.purchases);
  const [turnover, setTurnover] = useState(DEFAULTS.turnover);
  const [nonProfit, setNonProfit] = useState(DEFAULTS.nonProfit);
  const [copied, setCopied] = useState(false);

  const selectedTreatment = useMemo(
    () => GST_TREATMENTS.find((item) => item.id === treatment) ?? GST_TREATMENTS[0],
    [treatment],
  );

  const result = useMemo(() => {
    const value = toNumber(amount);
    if (Number.isNaN(value)) return { error: "Enter an amount as a number." };
    return calculateGst({ amount: value, mode, ratePercent: selectedTreatment.rate });
  }, [amount, mode, selectedTreatment]);

  const ok = !result.error;

  const bas = useMemo(() => {
    const s = toNumber(sales);
    const p = toNumber(purchases);
    if (Number.isNaN(s) || Number.isNaN(p)) {
      return { error: "Enter sales and purchases as numbers." };
    }
    return computeBas({ salesInclGst: s, purchasesInclGst: p });
  }, [sales, purchases]);

  const registration = useMemo(() => {
    const value = toNumber(turnover);
    if (Number.isNaN(value)) return { error: "Enter your GST turnover as a number." };
    return checkRegistration(value, nonProfit);
  }, [turnover, nonProfit]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Australian GST calculation",
      `Mode: ${mode === "add" ? "add GST to a GST-exclusive price" : "remove GST from an inclusive price"}`,
      `Treatment: ${selectedTreatment.label}`,
      `Price excluding GST: ${money(result.net)}`,
      `GST: ${money(result.gst)}`,
      `Price including GST: ${money(result.gross)}`,
      result.ratePercent === GST_RATE
        ? `Check: one eleventh of the inclusive price is ${money(result.elevenths)}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, mode, selectedTreatment]);

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
    setTreatment(DEFAULTS.treatment);
    setSales(DEFAULTS.sales);
    setPurchases(DEFAULTS.purchases);
    setTurnover(DEFAULTS.turnover);
    setNonProfit(DEFAULTS.nonProfit);
    setCopied(false);
  };

  const headlineLabel = mode === "add" ? "Price including GST" : "Price excluding GST";
  const headlineValue = ok ? money(mode === "add" ? result.gross : result.net) : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Australia
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Calculator (Australia)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add 10% GST to a price or pull it back out by dividing by 11, then check the BAS labels
          1A and 1B and the $75,000 registration threshold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="grid grid-cols-2 gap-2 rounded-md bg-[var(--muted)] p-1"
          role="group"
          aria-label="Calculation direction"
        >
          {[
            ["add", "Add GST"],
            ["remove", "Remove GST"],
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
            <label className={LABEL_CLASS} htmlFor="au-gst-amount">
              {mode === "add" ? "Price excluding GST" : "Price including GST"}
            </label>
            <input
              id="au-gst-amount"
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
            <label className={LABEL_CLASS} htmlFor="au-gst-treatment">
              GST treatment
            </label>
            <select
              id="au-gst-treatment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={treatment}
              onChange={(event) => setTreatment(event.target.value)}
            >
              {GST_TREATMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {selectedTreatment.note}
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
                ? `GST at ${pct(result.ratePercent)} is ${money(result.gst)}`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Australian GST result"
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
            ["Price excluding GST", ok ? money(result.net) : DASH],
            [`GST (${ok ? pct(result.ratePercent) : DASH})`, ok ? money(result.gst) : DASH],
            ["Price including GST", ok ? money(result.gross) : DASH],
            [
              "One eleventh of the inclusive price",
              ok && result.elevenths !== null ? money(result.elevenths) : DASH,
            ],
            ["GST as a share of the inclusive price", ok ? pct(result.gstShareOfGross) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">BAS summary for the period</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="au-gst-sales">
              Total sales including GST (G1)
            </label>
            <input
              id="au-gst-sales"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={sales}
              onChange={(event) => setSales(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="au-gst-purchases">
              Total purchases including GST (G11)
            </label>
            <input
              id="au-gst-purchases"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={purchases}
              onChange={(event) => setPurchases(event.target.value)}
            />
          </div>
        </div>

        {bas.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {bas.error}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Label
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Meaning
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["G1", "Total sales (including GST)", bas.g1],
                  ["1A", "GST on sales (G1 ÷ 11)", bas.oneA],
                  ["1B", "GST on purchases (G11 ÷ 11)", bas.oneB],
                ].map(([label, meaning, value]) => (
                  <tr key={label} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3 font-semibold">{label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{meaning}</td>
                    <td className="py-2 text-right font-semibold">{money(value)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">
                    {bas.payable ? "7A" : "7B"}
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {bas.payable ? "Net GST payable to the ATO" : "Net GST refund from the ATO"}
                  </td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      bas.payable ? "text-[var(--foreground)]" : "text-[var(--success)]"
                    }`}
                  >
                    {money(bas.payable ? bas.netAmount : bas.refund)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Do I need to register for GST?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="au-gst-turnover">
              Annual GST turnover
            </label>
            <input
              id="au-gst-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={turnover}
              onChange={(event) => setTurnover(event.target.value)}
            />
            <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
              <input
                id="au-gst-nonprofit"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={nonProfit}
                onChange={(event) => setNonProfit(event.target.checked)}
              />
              Not-for-profit organisation
            </label>
          </div>
          <div className="rounded-md bg-[var(--muted)] p-4">
            <p
              className={`text-2xl font-semibold ${
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
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {registration.error
                ? registration.error
                : registration.mustRegister
                  ? `GST turnover has reached the ${money0(registration.threshold)} threshold — register within 21 days.`
                  : `${money0(registration.headroom)} below the ${money0(registration.threshold)} threshold.`}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Thresholds are {money0(REGISTRATION_THRESHOLD)} for businesses and{" "}
          {money0(NON_PROFIT_THRESHOLD)} for not-for-profits. Taxi, ride-sourcing and limousine
          drivers must register regardless of turnover.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Whether a supply is taxable, GST-free or input taxed
        changes the answer, and the margin scheme applies to some property sales. Check ATO guidance
        or a registered tax agent before lodging a BAS.
      </p>
    </main>
  );
}
