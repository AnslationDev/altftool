"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import { calculateTds, getSection, SECTIONS } from "../lib";

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
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM2.format(v)}%` : DASH);

const DEFAULTS = {
  sectionCode: "194J",
  variantId: "professional",
  amount: "200000",
  prior: "0",
  hasPan: "yes",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/[,₹\s]/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sectionCode, setSectionCode] = useState(DEFAULTS.sectionCode);
  const [variantId, setVariantId] = useState(DEFAULTS.variantId);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [prior, setPrior] = useState(DEFAULTS.prior);
  const [hasPan, setHasPan] = useState(DEFAULTS.hasPan);
  const [copied, setCopied] = useState(false);

  const section = getSection(sectionCode) ?? SECTIONS[0];
  const variants = section.variants;

  const result = useMemo(
    () =>
      calculateTds({
        sectionCode,
        variantId,
        amount: toNum(amount),
        priorAmount: toNum(prior) || 0,
        hasPan: hasPan === "yes",
      }),
    [sectionCode, variantId, amount, prior, hasPan],
  );

  const error = result.error ? result.error : null;
  const ok = !error;

  const onSectionChange = (code) => {
    setSectionCode(code);
    const next = getSection(code);
    setVariantId(next ? next.variants[0].id : "default");
  };

  const reset = () => {
    setSectionCode(DEFAULTS.sectionCode);
    setVariantId(DEFAULTS.variantId);
    setAmount(DEFAULTS.amount);
    setPrior(DEFAULTS.prior);
    setHasPan(DEFAULTS.hasPan);
    setCopied(false);
  };

  const copy = async () => {
    if (!ok) return;
    const lines = [
      `TDS working — FY 2025-26`,
      `Section: ${result.sectionLabel}`,
      `Payee type: ${result.variantLabel}`,
      `Payment: ${money2(result.amount)}`,
      `Already paid this year: ${money2(result.priorAmount)}`,
      `Threshold: ${money(result.threshold)} on ${result.thresholdBasis}`,
      result.triggered
        ? `TDS applies — rate ${pct(result.rateApplied)}${result.noPanApplied ? " (206AA, no PAN)" : ""}`
        : "Below the threshold — no TDS",
      `Amount taxed: ${money2(result.taxableBase)}`,
      `TDS to deduct: ${money2(result.tds)}`,
      `Net payable to the deductee: ${money2(result.netPayable)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <ReceiptIndianRupee className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">TDS Calculator</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Pick the section, enter the payment, and see the rate, the threshold test and the
            exact amount to deduct. FY 2025-26 rates for resident payees.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="tds-section">
            TDS section
          </label>
          <select
            id="tds-section"
            className={`${INPUT_CLASS} mt-1`}
            value={sectionCode}
            onChange={(e) => onSectionChange(e.target.value)}
          >
            {SECTIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className={variants.length > 1 ? "" : "sm:col-span-2"}>
          <label className={LABEL_CLASS} htmlFor="tds-amount">
            Payment amount
          </label>
          <input
            id="tds-amount"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className={HINT_CLASS}>Gross amount of this bill or payment, before TDS.</p>
        </div>

        {variants.length > 1 ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-variant">
              Payee or payment type
            </label>
            <select
              id="tds-variant"
              className={`${INPUT_CLASS} mt-1`}
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — {v.rate}%
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className={LABEL_CLASS} htmlFor="tds-prior">
            Already paid to this payee this year
          </label>
          <input
            id="tds-prior"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="decimal"
            value={prior}
            onChange={(e) => setPrior(e.target.value)}
          />
          <p className={HINT_CLASS}>Earlier payments in the same financial year, for the threshold test.</p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tds-pan">
            PAN furnished by the deductee
          </label>
          <select
            id="tds-pan"
            className={`${INPUT_CLASS} mt-1`}
            value={hasPan}
            onChange={(e) => setHasPan(e.target.value)}
          >
            <option value="yes">Yes — valid PAN on record</option>
            <option value="no">No PAN or invalid PAN</option>
          </select>
          <p className={HINT_CLASS}>No PAN triggers section 206AA: the higher of the section rate or 20%.</p>
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">TDS to deduct</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--primary)]">
          {ok ? money2(result.tds) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok
            ? result.triggered
              ? `Section ${result.sectionCode} at ${pct(result.rateApplied)} on ${money2(result.taxableBase)}`
              : `Below the ${money(result.threshold)} threshold — deduct nothing yet`
            : "Fix the input above to see a result."}
        </p>

        {ok && result.noPanApplied ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            No PAN: section 206AA raises the rate from {pct(result.baseRate)} to {pct(result.rateApplied)}.
          </p>
        ) : null}

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">This payment</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? money2(result.amount) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Year-to-date to this payee</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? money2(result.yearToDate) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Threshold</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? money(result.threshold) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Section rate</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? pct(result.baseRate) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Amount tax is deducted on</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? money2(result.taxableBase) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Net payable to the deductee</dt>
            <dd className="text-sm font-semibold text-[var(--success)]">
              {ok ? money2(result.netPayable) : DASH}
            </dd>
          </div>
          {ok && !result.triggered ? (
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 sm:col-span-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Headroom before TDS starts</dt>
              <dd className="text-sm font-semibold text-[var(--foreground)]">
                {money2(result.headroom)}
              </dd>
            </div>
          ) : null}
        </dl>

        {ok && result.tiers ? (
          <div className="mt-5 overflow-x-auto rounded-md ring-1 ring-[var(--border)]">
            <table className="w-full min-w-[22rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th scope="col" className="px-3 py-2 font-semibold">Slab rate</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">TDS</th>
                </tr>
              </thead>
              <tbody>
                {result.tiers.map((t) => (
                  <tr key={t.rate} className="border-t border-[var(--border)] text-[var(--foreground)]">
                    <td className="px-3 py-2">{pct(t.rate)}</td>
                    <td className="px-3 py-2 text-right">{money2(t.base)}</td>
                    <td className="px-3 py-2 text-right">{money2(t.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the TDS working to the clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all inputs to their defaults">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          How section {section.code} works
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          The limit of {money(section.threshold)} is tested against {section.thresholdBasis}.
          {section.singleThreshold
            ? ` A single bill above ${money(section.singleThreshold)} also triggers deduction on its own.`
            : ""}{" "}
          {section.thresholdMode === "excess"
            ? "Tax is deducted only on the amount above the limit."
            : "Once the limit is crossed, tax is deducted on the whole payment, not just the excess."}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{section.note}</p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          TDS on payments to residents carries no surcharge and no health and education cess.
          This is a working aid, not tax advice — check the section text before filing.
        </p>
      </section>
    </div>
  );
}
