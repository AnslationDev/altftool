"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  CURRENCIES,
  DEFAULT_RECEIPT_PATTERN,
  MAX_PADDING,
  MIN_PADDING,
  PAYMENT_MODES,
  amountInWords,
  buildReceiptNumber,
  buildReceiptText,
  computeReceipt,
  formatLongDate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const todayISO = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const DEFAULTS = {
  currency: "INR",
  prefix: "RCPT",
  pattern: DEFAULT_RECEIPT_PATTERN,
  sequence: "1",
  padding: "4",
  issuedBy: "Meridian Design Studio",
  receivedFrom: "Northwind Traders Pvt Ltd",
  invoiceRef: "INV-2026-0142",
  invoiceTotal: "50000",
  previouslyPaid: "15000",
  amountPaid: "20000",
  mode: "bank-transfer",
  reference: "NEFT/882140",
  note: "",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [dateISO, setDateISO] = useState(todayISO);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [sequence, setSequence] = useState(DEFAULTS.sequence);
  const [padding, setPadding] = useState(DEFAULTS.padding);
  const [issuedBy, setIssuedBy] = useState(DEFAULTS.issuedBy);
  const [receivedFrom, setReceivedFrom] = useState(DEFAULTS.receivedFrom);
  const [invoiceRef, setInvoiceRef] = useState(DEFAULTS.invoiceRef);
  const [invoiceTotal, setInvoiceTotal] = useState(DEFAULTS.invoiceTotal);
  const [previouslyPaid, setPreviouslyPaid] = useState(DEFAULTS.previouslyPaid);
  const [amountPaid, setAmountPaid] = useState(DEFAULTS.amountPaid);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [reference, setReference] = useState(DEFAULTS.reference);
  const [note, setNote] = useState(DEFAULTS.note);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const meta = CURRENCIES[currency] ?? CURRENCIES.INR;
    const formatter = new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: meta.code,
      maximumFractionDigits: meta.decimals,
      minimumFractionDigits: meta.decimals,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const result = useMemo(() => {
    const totals = computeReceipt({
      invoiceTotal: toNumber(invoiceTotal),
      previouslyPaid: toNumber(previouslyPaid),
      amountPaid: toNumber(amountPaid),
      currency,
    });
    if (totals.error) return { error: totals.error };

    const numbered = buildReceiptNumber({
      pattern,
      prefix,
      sequence: Math.round(toNumber(sequence)),
      padding: Math.round(toNumber(padding)),
      dateISO,
    });
    if (numbered.error) return { error: numbered.error };

    const spelled = amountInWords(totals.amountPaid, currency);
    if (spelled.error) return { error: spelled.error };

    return { totals, receiptNumber: numbered.number, words: spelled.words };
  }, [invoiceTotal, previouslyPaid, amountPaid, currency, pattern, prefix, sequence, padding, dateISO]);

  const modeLabel = PAYMENT_MODES.find((item) => item.id === mode)?.label ?? "Other";
  const modeNeedsReference = PAYMENT_MODES.find((item) => item.id === mode)?.needsReference ?? false;

  const receiptText = useMemo(() => {
    if (result.error) return "";
    return buildReceiptText({
      receiptNumber: result.receiptNumber,
      dateISO,
      receivedFrom,
      issuedBy,
      invoiceRef,
      modeLabel,
      reference: modeNeedsReference ? reference : "",
      note,
      totals: result.totals,
      words: result.words,
      formatMoney: money,
    });
  }, [result, dateISO, receivedFrom, issuedBy, invoiceRef, modeLabel, modeNeedsReference, reference, note, money]);

  const copyResult = async () => {
    if (!receiptText) return;
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCurrency(DEFAULTS.currency);
    setDateISO(todayISO());
    setPrefix(DEFAULTS.prefix);
    setPattern(DEFAULTS.pattern);
    setSequence(DEFAULTS.sequence);
    setPadding(DEFAULTS.padding);
    setIssuedBy(DEFAULTS.issuedBy);
    setReceivedFrom(DEFAULTS.receivedFrom);
    setInvoiceRef(DEFAULTS.invoiceRef);
    setInvoiceTotal(DEFAULTS.invoiceTotal);
    setPreviouslyPaid(DEFAULTS.previouslyPaid);
    setAmountPaid(DEFAULTS.amountPaid);
    setMode(DEFAULTS.mode);
    setReference(DEFAULTS.reference);
    setNote(DEFAULTS.note);
    setCopied(false);
  };

  const totals = result.error ? null : result.totals;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Receipts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Payment Receipt Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a serially numbered receipt for money you have actually received — with the payment
          mode, the amount in words and the balance still outstanding on the invoice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Receipt details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-date">Receipt date</label>
            <input
              id="rcpt-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateISO}
              onChange={(event) => setDateISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-currency">Currency</label>
            <select
              id="rcpt-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-prefix">Series prefix</label>
            <input
              id="rcpt-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-pattern">Number pattern</label>
            <input
              id="rcpt-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Tokens: {"{PREFIX} {YYYY} {YY} {MM} {DD} {SEQ}"}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-seq">Serial number</label>
            <input
              id="rcpt-seq"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={sequence}
              onChange={(event) => setSequence(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-pad">Zero padding (digits)</label>
            <input
              id="rcpt-pad"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_PADDING}
              max={MAX_PADDING}
              step="1"
              value={padding}
              onChange={(event) => setPadding(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-issuer">Issued by</label>
            <input
              id="rcpt-issuer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={issuedBy}
              onChange={(event) => setIssuedBy(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-payer">Received from</label>
            <input
              id="rcpt-payer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={receivedFrom}
              onChange={(event) => setReceivedFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-invref">Against invoice</label>
            <input
              id="rcpt-invref"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={invoiceRef}
              onChange={(event) => setInvoiceRef(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-mode">Payment mode</label>
            <select
              id="rcpt-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {PAYMENT_MODES.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          {modeNeedsReference && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="rcpt-ref">Transaction / cheque reference</label>
              <input
                id="rcpt-ref"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Amounts</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-total">Invoice total</label>
            <input
              id="rcpt-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={invoiceTotal}
              onChange={(event) => setInvoiceTotal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcpt-prev">Already paid before this receipt</label>
            <input
              id="rcpt-prev"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={previouslyPaid}
              onChange={(event) => setPreviouslyPaid(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rcpt-paid">Amount received now</label>
            <input
              id="rcpt-paid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rcpt-note">Note on the receipt (optional)</label>
            <input
              id="rcpt-note"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Amount received
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {totals ? money(totals.amountPaid) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : `Receipt ${result.receiptNumber} · ${formatLongDate(dateISO) || dateISO}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the payment receipt text"
              className={GHOST_BTN}
              disabled={!receiptText}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy receipt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all receipt fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm italic text-[var(--foreground)]">
          {result.error ? DASH : result.words}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Received from", result.error ? DASH : receivedFrom || DASH],
            ["Payment mode", result.error ? DASH : `${modeLabel}${modeNeedsReference && reference ? ` · ${reference}` : ""}`],
            ["Invoice total", totals ? money(totals.invoiceTotal) : DASH],
            ["Paid earlier", totals ? money(totals.previouslyPaid) : DASH],
            ["Paid to date", totals ? money(totals.totalPaid) : DASH],
            [
              totals && totals.overpayment > 0 ? "Overpayment / credit" : "Balance due",
              totals ? money(totals.overpayment > 0 ? totals.overpayment : totals.balanceDue) : DASH,
            ],
            ["Status", totals ? totals.status : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {totals && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${Math.round(totals.settledPercent)} percent of the invoice is settled`}
            >
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, totals.settledPercent))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {Math.round(totals.settledPercent)}% of this invoice is now settled
            </p>
          </div>
        )}
      </section>

      {receiptText && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Receipt text</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre text-xs leading-6 text-[var(--foreground)]">{receiptText}</pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only. Tax rules on receipts differ by country — if your receipt has to
        carry a tax registration number, stamp duty or a revenue stamp, confirm the requirement with a
        qualified accountant before issuing it.
      </p>
    </main>
  );
}
