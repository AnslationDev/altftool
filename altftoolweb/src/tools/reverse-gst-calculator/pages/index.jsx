"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, RotateCcw } from "lucide-react";

import { GST_RATE_SLABS, rateReferenceTable, reverseGst } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const RATE_TABLE = rateReferenceTable();

const DEFAULTS = {
  amount: "1180",
  rate: "18",
  cess: "0",
  supplyType: "intra",
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [cess, setCess] = useState(DEFAULTS.cess);
  const [supplyType, setSupplyType] = useState(DEFAULTS.supplyType);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      reverseGst({
        inclusiveAmount: amount.trim() === "" ? Number.NaN : Number(amount),
        gstRate: rate.trim() === "" ? Number.NaN : Number(rate),
        cessRate: cess.trim() === "" ? 0 : Number(cess),
        supplyType,
      }),
    [amount, rate, cess, supplyType],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Reverse GST calculation",
      `Tax-inclusive amount: ${money(result.inclusiveAmount)}`,
      `GST rate: ${NUM.format(result.gstRate)}%${result.cessRate > 0 ? ` + cess ${NUM.format(result.cessRate)}%` : ""}`,
      `Taxable value: ${money(result.taxableValue)}`,
      result.supplyType === "intra"
        ? `CGST: ${money(result.cgst)} | SGST/UTGST: ${money(result.sgst)}`
        : `IGST: ${money(result.igst)}`,
      ...(result.cessRate > 0 ? [`Compensation cess: ${money(result.cessAmount)}`] : []),
      `Total tax: ${money(result.totalTax)}`,
    ].join("\n");
  }, [hasError, result]);

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
    setAmount(DEFAULTS.amount);
    setRate(DEFAULTS.rate);
    setCess(DEFAULTS.cess);
    setSupplyType(DEFAULTS.supplyType);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Taxable value", DASH],
        ["Total tax", DASH],
        ["Tax as a share of the bill", DASH],
      ]
    : [
        ["Taxable value (before tax)", money(result.taxableValue)],
        ...(result.supplyType === "intra"
          ? [
              [`CGST @ ${NUM.format(result.halfRate)}%`, money(result.cgst)],
              [`SGST / UTGST @ ${NUM.format(result.halfRate)}%`, money(result.sgst)],
            ]
          : [[`IGST @ ${NUM.format(result.gstRate)}%`, money(result.igst)]]),
        ...(result.cessRate > 0
          ? [[`Compensation cess @ ${NUM.format(result.cessRate)}%`, money(result.cessAmount)]]
          : []),
        ["Total tax", money(result.totalTax)],
        ["GST rounded to the nearest rupee (s.170)", money(result.gstRoundedToRupee)],
        ["Tax as a share of the bill", `${NUM.format(result.taxSharePercent)}%`],
        ["Amount you started with", money(result.inclusiveAmount)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          Tax-inclusive to base
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Reverse GST Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give it an all-in price and it works backwards to the taxable value and the tax inside it,
          split into CGST and SGST for a local sale or IGST for an inter-state one.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rg-amount">
              Tax-inclusive amount (INR)
            </label>
            <input
              id="rg-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rg-rate">
              GST rate (%)
            </label>
            <input
              id="rg-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.25"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rg-cess">
              Compensation cess (%), if any
            </label>
            <input
              id="rg-cess"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={cess}
              onChange={(event) => setCess(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rg-supply">
              Place of supply
            </label>
            <select
              id="rg-supply"
              className={`mt-2 ${INPUT_CLASS}`}
              value={supplyType}
              onChange={(event) => setSupplyType(event.target.value)}
            >
              <option value="intra">Within the same state — CGST + SGST</option>
              <option value="inter">Across states — IGST</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {GST_RATE_SLABS.map((slab) => (
            <button
              key={slab}
              type="button"
              onClick={() => setRate(String(slab))}
              aria-pressed={Number(rate) === slab}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                Number(rate) === slab
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              {slab}%
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Taxable value inside the bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.taxableValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${money(result.totalTax)} of the bill is tax.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the reverse GST breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Taxable value is ${NUM.format(result.baseSharePercent)} per cent and tax is ${NUM.format(result.taxSharePercent)} per cent of the bill`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.baseSharePercent))}%` }}
              />
              <span
                className="block h-full bg-[var(--danger)]"
                style={{ width: `${Math.max(0, Math.min(100, result.taxSharePercent))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Base {NUM.format(result.baseSharePercent)}% · Tax{" "}
              {NUM.format(result.taxSharePercent)}%
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The formula</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Taxable value = inclusive amount ÷ (1 + rate ÷ 100). At 18% that is a divisor of 1.18, so
          a bill of {money(1180)} hides {money(1000)} of value and {money(180)} of tax. Note that
          the tax is 18% of the base but only 15.25% of the bill — dividing by 1.18 is not the same
          as taking 18% off.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Divide by
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Tax as % of bill
                </th>
              </tr>
            </thead>
            <tbody>
              {RATE_TABLE.map((row) => (
                <tr key={row.rate} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.rate}%</td>
                  <td className="py-2 pr-3 text-right">{NUM4.format(row.divisor)}</td>
                  <td className="py-2 text-right">{NUM.format(row.shareOfGross)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Rates and cess vary by HSN or SAC code and are revised by the GST
        Council from time to time — check the rate notification applicable to your goods or services
        before relying on an invoice figure.
      </p>
    </main>
  );
}
