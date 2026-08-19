"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardHat, RotateCcw } from "lucide-react";
import {
  ANNUAL_AGGREGATE_LIMIT,
  NO_PAN_RATE,
  PAYEE_TYPES,
  SINGLE_PAYMENT_LIMIT,
  SMALL_TRANSPORTER_CARRIAGE_LIMIT,
  computeTds194C,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : DASH);

const DEFAULTS = {
  invoice: "60000",
  material: "0",
  prior: "0",
  alreadyDeducted: "0",
  payeeType: "individual-huf",
  panFurnished: true,
  transporterExempt: false,
  payerCovered: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [invoice, setInvoice] = useState(DEFAULTS.invoice);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [prior, setPrior] = useState(DEFAULTS.prior);
  const [alreadyDeducted, setAlreadyDeducted] = useState(DEFAULTS.alreadyDeducted);
  const [payeeType, setPayeeType] = useState(DEFAULTS.payeeType);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [transporterExempt, setTransporterExempt] = useState(DEFAULTS.transporterExempt);
  const [payerCovered, setPayerCovered] = useState(DEFAULTS.payerCovered);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTds194C({
        invoiceAmount: toNumber(invoice),
        materialValue: toNumber(material),
        priorPaymentsThisFy: toNumber(prior),
        tdsAlreadyDeducted: toNumber(alreadyDeducted),
        payeeType,
        panFurnished,
        transporterExempt,
        payerCovered,
      }),
    [invoice, material, prior, alreadyDeducted, payeeType, panFurnished, transporterExempt, payerCovered],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Section 194C TDS on contractor payment",
      `Payee: ${result.payeeLabel}`,
      `Bill amount: ${money(result.invoiceAmount)}`,
      `Material excluded: ${money(result.materialValue)}`,
      `Amount liable to TDS: ${money(result.base)}`,
      `Year's aggregate: ${money(result.aggregateBase)}`,
      `Rate applied: ${result.appliedRate}%`,
      `TDS on this bill: ${money(result.tdsOnThisPayment)}`,
      `Net payable: ${money(result.netPayable)}`,
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
    setInvoice(DEFAULTS.invoice);
    setMaterial(DEFAULTS.material);
    setPrior(DEFAULTS.prior);
    setAlreadyDeducted(DEFAULTS.alreadyDeducted);
    setPayeeType(DEFAULTS.payeeType);
    setPanFurnished(DEFAULTS.panFurnished);
    setTransporterExempt(DEFAULTS.transporterExempt);
    setPayerCovered(DEFAULTS.payerCovered);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HardHat className="h-4 w-4" aria-hidden="true" />
          Section 194C
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TDS on Contractor Payments (Section 194C)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Deduct 1% or 2% on contractor and sub-contractor bills, with the Rs 30,000 single-payment
          test, the Rs 1,00,000 yearly aggregate test, separately billed material and the small
          goods-carriage exemption all applied for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="c-payee">
              Status of the contractor
            </label>
            <select
              id="c-payee"
              className={`mt-2 ${INPUT_CLASS}`}
              value={payeeType}
              onChange={(event) => setPayeeType(event.target.value)}
            >
              {PAYEE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} &mdash; {type.rate}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="c-invoice">
              Bill amount, excluding GST (INR)
            </label>
            <input
              id="c-invoice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={invoice}
              onChange={(event) => setInvoice(event.target.value)}
            />
            <p className={HINT_CLASS}>GST shown separately is left out (Circular 23/2017).</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="c-material">
              Material value shown separately (INR)
            </label>
            <input
              id="c-material"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Only for goods made to your specification from material bought from you.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="c-prior">
              Earlier 194C payments to this payee this year (INR)
            </label>
            <input
              id="c-prior"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={prior}
              onChange={(event) => setPrior(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="c-already">
              TDS already deducted this year (INR)
            </label>
            <input
              id="c-already"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={alreadyDeducted}
              onChange={(event) => setAlreadyDeducted(event.target.value)}
            />
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="c-pan">
              <input
                id="c-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              Contractor has furnished a valid PAN
            </label>
            <p className={HINT_CLASS}>Without PAN, section 206AA forces {NO_PAN_RATE}%.</p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="c-transport">
              <input
                id="c-transport"
                type="checkbox"
                className={CHECKBOX}
                checked={transporterExempt}
                onChange={(event) => setTransporterExempt(event.target.checked)}
              />
              Small transporter declaration on file
            </label>
            <p className={HINT_CLASS}>
              Section 194C(6): {SMALL_TRANSPORTER_CARRIAGE_LIMIT} or fewer goods carriages owned.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={CHECK_ROW} htmlFor="c-covered">
              <input
                id="c-covered"
                type="checkbox"
                className={CHECKBOX}
                checked={payerCovered}
                onChange={(event) => setPayerCovered(event.target.checked)}
              />
              Payer is a specified person bound to deduct under 194C
            </label>
            <p className={HINT_CLASS}>
              Untick for an individual or HUF not audited under section 44AB, or for purely personal work.
            </p>
          </div>
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

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              TDS to deduct on this bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.tdsOnThisPayment)}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the deduction." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy section 194C TDS result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rate applied", hasError ? DASH : `${result.appliedRate}%`],
            ["Statutory rate for this payee", hasError ? DASH : `${result.statutoryRate}%`],
            ["Bill amount", hasError ? DASH : money(result.invoiceAmount)],
            ["Less: material shown separately", hasError ? DASH : money(result.materialValue)],
            ["Amount liable to deduction", hasError ? DASH : money(result.base)],
            ["Single-payment limit", money0(SINGLE_PAYMENT_LIMIT)],
            ["Yearly aggregate liable", hasError ? DASH : money(result.aggregateBase)],
            ["Yearly aggregate limit", money0(ANNUAL_AGGREGATE_LIMIT)],
            ["TDS already deducted this year", hasError ? DASH : money(result.tdsAlreadyDeducted)],
            ["Total TDS for the year", hasError ? DASH : money(result.totalTdsForYear)],
            ["Net amount payable to contractor", hasError ? DASH : money(result.netPayable)],
            !hasError && result.shortfallCarriedForward > 0
              ? ["Shortfall still to recover", money(result.shortfallCarriedForward)]
              : null,
          ]
            .filter(Boolean)
            .map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.deductionRequired && result.annualHeadroom > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            Headroom left this year: {money(result.annualHeadroom)} before the aggregate limit bites,
            and {money(result.singleHeadroom)} on a single bill.
          </p>
        ) : null}

        {!hasError && result.shortfallCarriedForward > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
            This bill is smaller than the catch-up tax now due, so {money(result.shortfallCarriedForward)}{" "}
            could not be withheld from it. Recover that shortfall from the payee directly or from the
            next payment.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What counts as &ldquo;work&rdquo; under 194C</h2>
        <ul className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
          {[
            "Advertising contracts",
            "Broadcasting and telecasting, including production of programmes",
            "Carriage of goods or passengers other than by railways",
            "Catering",
            "Manufacturing a product to customer specification from material bought from that customer",
            "Labour, civil works, repairs, annual maintenance and job work",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. TDS on payments to residents carries no surcharge or
        cess; deposit it by the 7th of the following month (30 April for a March deduction). Whether
        a contract is &ldquo;work&rdquo; under 194C or a professional or technical service under 194J
        is fact-specific — confirm with your tax adviser.
      </p>
    </main>
  );
}
