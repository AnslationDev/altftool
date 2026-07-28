"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_COST_OF_CAPITAL_PERCENT,
  DEFAULT_SUPPLIER_TYPE,
  DEFAULT_TAX_PERCENT,
  RBI_BANK_RATE_PERCENT,
  RBI_BANK_RATE_READ_ON,
  SUPPLIER_TYPES,
  S15_MAX_AGREED_DAYS,
  S15_NO_AGREEMENT_DAYS,
  S16_BANK_RATE_MULTIPLE,
  TAX_RATE_PRESETS,
  buildRestSchedule,
  computeMsmeDelayCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  supplierType: DEFAULT_SUPPLIER_TYPE,
  invoiceDate: "2026-01-15",
  paymentDate: "2026-07-20",
  amount: "1000000",
  hasWrittenAgreement: "yes",
  agreedCreditDays: "60",
  bankRate: String(RBI_BANK_RATE_PERCENT),
  taxPreset: "slab30",
  customTax: String(DEFAULT_TAX_PERCENT),
  costOfCapital: String(DEFAULT_COST_OF_CAPITAL_PERCENT),
};

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-50";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PANEL_CLASS = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

/** "2026-03-01" -> "1 March 2026", built from the string so no timezone applies. */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const prettyDate = (iso) => {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return DASH;
  const [y, m, d] = iso.split("-");
  const name = MONTHS[Number(m) - 1];
  if (!name) return iso;
  return `${Number(d)} ${name} ${y}`;
};

function Row({ term, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[var(--border)] py-2 first:border-t-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{term}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)] tabular-nums">{children}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const hasAgreement = form.hasWrittenAgreement === "yes";
  const preset = TAX_RATE_PRESETS.find((item) => item.key === form.taxPreset);

  const parsed = useMemo(() => {
    const amount = toNumber(form.amount);
    const agreedCreditDays = toNumber(form.agreedCreditDays);
    const bankRatePercent = toNumber(form.bankRate);
    const costOfCapitalPercent = toNumber(form.costOfCapital);
    const marginalTaxPercent = preset ? preset.percent : toNumber(form.customTax);
    return {
      amount,
      agreedCreditDays,
      bankRatePercent,
      costOfCapitalPercent,
      marginalTaxPercent,
    };
  }, [form, preset]);

  const result = useMemo(() => {
    const numeric = [
      parsed.amount,
      parsed.bankRatePercent,
      parsed.costOfCapitalPercent,
      parsed.marginalTaxPercent,
    ];
    if (hasAgreement) numeric.push(parsed.agreedCreditDays);
    if (numeric.some(Number.isNaN)) {
      return { error: "Fill in the amount, the credit period and every rate as numbers." };
    }
    return computeMsmeDelayCost({
      invoiceDateISO: form.invoiceDate,
      paymentDateISO: form.paymentDate,
      amount: parsed.amount,
      supplierType: form.supplierType,
      hasWrittenAgreement: hasAgreement,
      agreedCreditDays: hasAgreement ? parsed.agreedCreditDays : 0,
      bankRatePercent: parsed.bankRatePercent,
      marginalTaxPercent: parsed.marginalTaxPercent,
      costOfCapitalPercent: parsed.costOfCapitalPercent,
    });
  }, [form.invoiceDate, form.paymentDate, form.supplierType, hasAgreement, parsed]);

  const hasError = Boolean(result.error);

  const schedule = useMemo(() => {
    if (hasError || !result.msmedApplies || result.paidWithinS15) return [];
    return buildRestSchedule({
      amount: result.amount,
      dueDateISO: result.dueDateISO,
      paymentDateISO: result.paymentDateISO,
      bankRatePercent: result.bankRatePercent,
    });
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "MSME 45-day payment and section 43B(h) cost",
      `Supplier: ${result.supplierLabel}`,
      `Invoice ${prettyDate(result.invoiceDateISO)} for ${money(result.amount)}`,
      `MSMED s.15 due date: ${prettyDate(result.dueDateISO)} (${result.statutoryLimitDays} days)`,
      `Basis: ${result.statutoryBasis}`,
      `Payment: ${prettyDate(result.paymentDateISO)} (${result.daysLate} days past the due date)`,
      "",
      `MSMED s.16 interest: ${money(result.section16Interest)}`,
      result.msmedVerdict,
      `Total payable to supplier: ${money(result.totalPayableToSupplier)}`,
      "",
      `Deduction year: ${result.deductionYearLabel}`,
      result.s43bhVerdict,
      `Extra tax carried in the accrual year: ${money(result.extraTaxInAccrualYear)}`,
      `Time value of the deferred deduction: ${money(result.timeValueCost)}`,
      "",
      `Combined cost of delay: ${money(result.totalCostOfDelay)} (${pct(result.costAsPercentOfInvoice)} of the invoice)`,
      `RBI bank rate used: ${result.bankRatePercent}% (read on ${RBI_BANK_RATE_READ_ON}); s.16 rate ${result.interestAnnualPercent}% a year with monthly rests.`,
    ].join("\n");
  }, [hasError, result]);

  const copy = async () => {
    if (hasError || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const gateOpen = !hasError && result.s43bhApplies;
  const gateTone = hasError
    ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
    : gateOpen
      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
      : "bg-[var(--success-soft)] text-[var(--success)]";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <CalendarClock aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          MSME 45-Day Payment &amp; 43B(h) Cost Calculator
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Applies MSMED Act 2006 s.15 (the {S15_MAX_AGREED_DAYS}-day ceiling, {S15_NO_AGREEMENT_DAYS} days
          without a written agreement), s.16 compound interest with monthly rests at{" "}
          {S16_BANK_RATE_MULTIPLE} times the RBI bank rate, and Income-tax Act s.43B(h).
        </p>
      </header>

      {/* Gate: the first thing the page answers. */}
      <section className={`${PANEL_CLASS} mb-6`} aria-labelledby="gate-heading">
        <h2 id="gate-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
          Does section 43B(h) apply to this supplier?
        </h2>
        <p className={`mt-2 inline-block rounded-md px-3 py-2 text-lg font-bold ${gateTone}`}>
          {hasError ? DASH : gateOpen ? "Yes — 43B(h) applies" : "No — 43B(h) does not apply"}
        </p>
        <p className="mt-3 text-sm text-[var(--foreground)]">{hasError ? DASH : result.s43bhVerdict}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : result.msmedVerdict}
        </p>
      </section>

      <form className="mb-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label className={LABEL_CLASS} htmlFor="msme-supplier">
            What is the supplier?
          </label>
          <select
            className={INPUT_CLASS}
            id="msme-supplier"
            onChange={setField("supplierType")}
            value={form.supplierType}
          >
            {Object.values(SUPPLIER_TYPES).map((type) => (
              <option key={type.key} value={type.key}>
                {type.label}
              </option>
            ))}
          </select>
          <p className={HINT_CLASS}>
            MSMED Act s.2(n) defines a &quot;supplier&quot; as a micro or small enterprise only. A medium
            enterprise is outside ss.15, 16 and 43B(h).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-invoice-date">
              Invoice / acceptance date
            </label>
            <input
              className={INPUT_CLASS}
              id="msme-invoice-date"
              onChange={setField("invoiceDate")}
              type="date"
              value={form.invoiceDate}
            />
            <p className={HINT_CLASS}>The day of acceptance or deemed acceptance under s.2(b).</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-amount">
              Invoice amount payable (INR)
            </label>
            <input
              className={INPUT_CLASS}
              id="msme-amount"
              inputMode="decimal"
              onChange={setField("amount")}
              type="text"
              value={form.amount}
            />
            <p className={HINT_CLASS}>The sum owed to the supplier for goods or services.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-agreement">
              Is there a payment term agreed in writing?
            </label>
            <select
              className={INPUT_CLASS}
              id="msme-agreement"
              onChange={setField("hasWrittenAgreement")}
              value={form.hasWrittenAgreement}
            >
              <option value="yes">Yes, agreed in writing</option>
              <option value="no">No written agreement</option>
            </select>
            <p className={HINT_CLASS}>
              Without one, s.2(b) fixes the appointed day at {S15_NO_AGREEMENT_DAYS} days.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-credit-days">
              Agreed credit period (days)
            </label>
            <input
              className={INPUT_CLASS}
              disabled={!hasAgreement}
              id="msme-credit-days"
              inputMode="numeric"
              onChange={setField("agreedCreditDays")}
              type="text"
              value={hasAgreement ? form.agreedCreditDays : ""}
            />
            <p className={HINT_CLASS}>
              The proviso to s.15 caps this at {S15_MAX_AGREED_DAYS} days however long the contract says.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-payment-date">
              Actual or planned payment date
            </label>
            <input
              className={INPUT_CLASS}
              id="msme-payment-date"
              onChange={setField("paymentDate")}
              type="date"
              value={form.paymentDate}
            />
            <p className={HINT_CLASS}>Move this across 31 March to see the 43B(h) effect.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-bank-rate">
              RBI notified bank rate (% a year)
            </label>
            <input
              className={INPUT_CLASS}
              id="msme-bank-rate"
              inputMode="decimal"
              onChange={setField("bankRate")}
              type="text"
              value={form.bankRate}
            />
            <p className={HINT_CLASS}>
              {RBI_BANK_RATE_PERCENT}% on rbi.org.in, read {RBI_BANK_RATE_READ_ON}. Section 16 charges{" "}
              {S16_BANK_RATE_MULTIPLE} times this.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-tax-preset">
              Buyer&apos;s marginal tax rate
            </label>
            <select
              className={INPUT_CLASS}
              id="msme-tax-preset"
              onChange={setField("taxPreset")}
              value={form.taxPreset}
            >
              {TAX_RATE_PRESETS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
              <option value="custom">Enter my own rate</option>
            </select>
            <p className={HINT_CLASS}>Base rate grossed up for surcharge and the 4% cess.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="msme-custom-tax">
              Own marginal tax rate (%)
            </label>
            <input
              className={INPUT_CLASS}
              disabled={Boolean(preset)}
              id="msme-custom-tax"
              inputMode="decimal"
              onChange={setField("customTax")}
              type="text"
              value={preset ? String(preset.percent) : form.customTax}
            />
            <p className={HINT_CLASS}>Used only when &quot;Enter my own rate&quot; is selected.</p>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="msme-cost-of-capital">
            Your cost of funds (% a year)
          </label>
          <input
            className={INPUT_CLASS}
            id="msme-cost-of-capital"
            inputMode="decimal"
            onChange={setField("costOfCapital")}
            type="text"
            value={form.costOfCapital}
          />
          <p className={HINT_CLASS}>
            Your own assumption, not a statutory rate. It prices the year the deduction is delayed.
          </p>
        </div>
      </form>

      {hasError ? (
        <p
          className="mb-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          role="alert"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`${PANEL_CLASS} mb-6`} aria-labelledby="result-heading">
        <h2 id="result-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
          Combined rupee cost of the delay
        </h2>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
          {hasError ? DASH : money(result.totalCostOfDelay)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${pct(result.costAsPercentOfInvoice)} of the ${money(result.amount)} invoice — s.16 interest plus the time value of the deferred deduction.`}
        </p>

        <dl className="mt-4">
          <Row term="MSMED s.16 compound interest">
            {hasError ? DASH : money2(result.section16Interest)}
          </Row>
          <Row term="Time value of the deferred deduction">
            {hasError ? DASH : money2(result.timeValueCost)}
          </Row>
          <Row term="Total payable to the supplier (invoice + interest)">
            {hasError ? DASH : money(result.totalPayableToSupplier)}
          </Row>
          <Row term="Extra tax carried in the accrual year (recovered later)">
            {hasError ? DASH : money(result.extraTaxInAccrualYear)}
          </Row>
          <Row term="Pre-tax earnings needed to fund the interest (s.23 blocks the deduction)">
            {hasError ? DASH : money(result.preTaxCostOfInterest)}
          </Row>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            aria-label="Copy the full calculation to the clipboard"
            className={PRIMARY_BTN}
            disabled={hasError}
            onClick={copy}
            type="button"
          >
            {copied ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Copy aria-hidden="true" className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button aria-label="Reset all inputs" className={GHOST_BTN} onClick={reset} type="button">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <section className={PANEL_CLASS} aria-labelledby="s15-heading">
          <h2 id="s15-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
            MSMED Act s.15 — statutory due date
          </h2>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {hasError ? DASH : prettyDate(result.dueDateISO)}
          </p>
          <dl className="mt-3">
            <Row term="Time limit applied">
              {hasError ? DASH : `${num(result.statutoryLimitDays)} days`}
            </Row>
            <Row term="Agreed period capped at 45 days">
              {hasError ? DASH : result.agreedPeriodCapped ? "Yes" : "No"}
            </Row>
            <Row term="Interest starts (s.16)">
              {hasError ? DASH : prettyDate(result.interestStartISO)}
            </Row>
            <Row term="Days past the due date">{hasError ? DASH : num(result.daysLate)}</Row>
          </dl>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {hasError ? DASH : result.statutoryBasis}
          </p>
        </section>

        <section className={PANEL_CLASS} aria-labelledby="s43-heading">
          <h2 id="s43-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
            Income-tax Act s.43B(h) — deduction year
          </h2>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {hasError ? DASH : result.deductionYearLabel}
          </p>
          <dl className="mt-3">
            <Row term="Year the expense accrued">{hasError ? DASH : result.accrualFYLabel}</Row>
            <Row term="Year of actual payment">{hasError ? DASH : result.paymentFYLabel}</Row>
            <Row term="Amount disallowed in the accrual year">
              {hasError ? DASH : money(result.disallowedAmount)}
            </Row>
            <Row term="Deduction deferred by">
              {hasError ? DASH : `${num(result.deferralDays)} days`}
            </Row>
            <Row term="Marginal tax rate used">{hasError ? DASH : pct(result.marginalTaxPercent)}</Row>
          </dl>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {hasError
              ? DASH
              : `Time value = ${money(result.extraTaxInAccrualYear)} of tax carried for ${num(result.deferralDays)} days at ${pct(result.costOfCapitalPercent)}.`}
          </p>
        </section>
      </div>

      <section className={PANEL_CLASS} aria-labelledby="s16-heading">
        <h2 id="s16-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
          MSMED Act s.16 — compound interest with monthly rests
        </h2>
        <p className="mt-1 text-2xl font-bold text-[var(--foreground)] tabular-nums">
          {hasError ? DASH : pct(result.interestAnnualPercent)}
          <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
            a year ({hasError ? DASH : `${S16_BANK_RATE_MULTIPLE} x ${num(result.bankRatePercent)}%`})
          </span>
        </p>
        {schedule.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th className="py-2 pr-4 font-semibold" scope="col">Rest</th>
                  <th className="py-2 pr-4 font-semibold" scope="col">Date</th>
                  <th className="py-2 pr-4 text-right font-semibold" scope="col">Opening</th>
                  <th className="py-2 pr-4 text-right font-semibold" scope="col">Interest</th>
                  <th className="py-2 text-right font-semibold" scope="col">Closing</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr className="border-b border-[var(--border)]" key={`${row.label}-${row.dateISO}`}>
                    <td className="py-2 pr-4 text-[var(--foreground)]">{row.label}</td>
                    <td className="py-2 pr-4 text-[var(--muted-foreground)]">{prettyDate(row.dateISO)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{money2(row.opening)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{money2(row.interest)}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">{money2(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {hasError ? DASH : "No s.16 interest accrues on these facts, so there is no rest schedule."}
          </p>
        )}
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Balance rested on each monthly anniversary of the due date at one twelfth of{" "}
          {hasError ? DASH : pct(result.interestAnnualPercent)}; the part month to the payment date carries
          simple interest over 365 days. MSMED Act s.23 blocks any income-tax deduction for this interest.
        </p>
      </section>
    </div>
  );
}
