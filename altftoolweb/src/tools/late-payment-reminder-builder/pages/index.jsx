"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailWarning, RotateCcw } from "lucide-react";

import {
  ESCALATION_LEVELS,
  JURISDICTIONS,
  buildReminder,
  daysBetween,
  formatLongDate,
  overdueInterest,
  suggestLevel,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const CURRENCIES = {
  GBP: "en-GB",
  USD: "en-US",
  EUR: "en-IE",
  INR: "en-IN",
  AED: "en-AE",
  SGD: "en-SG",
  AUD: "en-AU",
  CAD: "en-CA",
};

const todayISO = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const DEFAULTS = {
  invoiceNumber: "INV-2026-0142",
  invoiceDate: "2026-01-10",
  dueDate: "2026-02-09",
  amount: "4800",
  currency: "GBP",
  clientName: "Northwind Traders Ltd",
  contactName: "Priya Menon",
  senderName: "Alex Rowe",
  senderCompany: "Meridian Design Studio",
  jurisdiction: "uk",
  rate: "8",
  showInterest: true,
  paymentLink: "",
  levelId: "auto",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [invoiceNumber, setInvoiceNumber] = useState(DEFAULTS.invoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(DEFAULTS.invoiceDate);
  const [dueDate, setDueDate] = useState(DEFAULTS.dueDate);
  const [sendDate, setSendDate] = useState(todayISO);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [clientName, setClientName] = useState(DEFAULTS.clientName);
  const [contactName, setContactName] = useState(DEFAULTS.contactName);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [senderCompany, setSenderCompany] = useState(DEFAULTS.senderCompany);
  const [jurisdiction, setJurisdiction] = useState(DEFAULTS.jurisdiction);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [showInterest, setShowInterest] = useState(DEFAULTS.showInterest);
  const [paymentLink, setPaymentLink] = useState(DEFAULTS.paymentLink);
  const [levelId, setLevelId] = useState(DEFAULTS.levelId);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const locale = CURRENCIES[currency] ?? "en-US";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const overdue = useMemo(() => daysBetween(dueDate, sendDate), [dueDate, sendDate]);

  const interest = useMemo(() => {
    if (!showInterest) return null;
    if (overdue.error) return null;
    return overdueInterest({
      amount: toNumber(amount),
      annualRatePercent: toNumber(rate),
      days: overdue.days,
    });
  }, [showInterest, overdue, amount, rate]);

  const letter = useMemo(() => {
    const amountValue = toNumber(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return { error: "Enter the outstanding invoice amount as a number greater than zero." };
    }
    if (overdue.error) return { error: overdue.error };

    const chosen = levelId === "auto" ? suggestLevel(overdue.days).id : levelId;
    const interestLabel = interest && !interest.error && interest.interest > 0
      ? money(interest.interest)
      : "";

    return buildReminder({
      levelId: chosen,
      invoiceNumber,
      invoiceDateISO: invoiceDate,
      dueDateISO: dueDate,
      todayISO: sendDate,
      clientName,
      contactName,
      senderName,
      senderCompany,
      amountLabel: money(amountValue),
      interestLabel,
      jurisdictionId: jurisdiction,
      paymentLink,
    });
  }, [amount, overdue, levelId, interest, money, invoiceNumber, invoiceDate, dueDate, sendDate, clientName, contactName, senderName, senderCompany, jurisdiction, paymentLink]);

  const fullText = letter.error ? "" : `Subject: ${letter.subject}\n\n${letter.body}`;

  const copyResult = async () => {
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setInvoiceNumber(DEFAULTS.invoiceNumber);
    setInvoiceDate(DEFAULTS.invoiceDate);
    setDueDate(DEFAULTS.dueDate);
    setSendDate(todayISO());
    setAmount(DEFAULTS.amount);
    setCurrency(DEFAULTS.currency);
    setClientName(DEFAULTS.clientName);
    setContactName(DEFAULTS.contactName);
    setSenderName(DEFAULTS.senderName);
    setSenderCompany(DEFAULTS.senderCompany);
    setJurisdiction(DEFAULTS.jurisdiction);
    setRate(DEFAULTS.rate);
    setShowInterest(DEFAULTS.showInterest);
    setPaymentLink(DEFAULTS.paymentLink);
    setLevelId(DEFAULTS.levelId);
    setCopied(false);
  };

  const daysLabel = overdue.error
    ? DASH
    : overdue.days > 0
      ? `${overdue.days} days overdue`
      : overdue.days === 0
        ? "Due today"
        : `${Math.abs(overdue.days)} days until due`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailWarning className="h-4 w-4" aria-hidden="true" />
          Collections
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Late Payment Reminder Letter Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the rung on the escalation ladder that matches how late the invoice is — courtesy
          reminder, second chase, firm demand or final notice — and get a letter that says the right
          thing at the right temperature.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The invoice</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-invno">Invoice number</label>
            <input id="lp-invno" className={`mt-2 ${INPUT_CLASS}`} type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-amount">Outstanding amount</label>
            <input id="lp-amount" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-currency">Currency</label>
            <select id="lp-currency" className={`mt-2 ${INPUT_CLASS}`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-invdate">Invoice date</label>
            <input id="lp-invdate" className={`mt-2 ${INPUT_CLASS}`} type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-duedate">Due date</label>
            <input id="lp-duedate" className={`mt-2 ${INPUT_CLASS}`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-senddate">Date you are sending this</label>
            <input id="lp-senddate" className={`mt-2 ${INPUT_CLASS}`} type="date" value={sendDate} onChange={(e) => setSendDate(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who it is from and to</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-client">Client company</label>
            <input id="lp-client" className={`mt-2 ${INPUT_CLASS}`} type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-contact">Contact person</label>
            <input id="lp-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-sender">Your name</label>
            <input id="lp-sender" className={`mt-2 ${INPUT_CLASS}`} type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-senderco">Your company</label>
            <input id="lp-senderco" className={`mt-2 ${INPUT_CLASS}`} type="text" value={senderCompany} onChange={(e) => setSenderCompany(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lp-link">Payment link (optional)</label>
            <input id="lp-link" className={`mt-2 ${INPUT_CLASS}`} type="text" value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Tone and legal footing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-level">Escalation level</label>
            <select id="lp-level" className={`mt-2 ${INPUT_CLASS}`} value={levelId} onChange={(e) => setLevelId(e.target.value)}>
              <option value="auto">Auto — match the days overdue</option>
              {ESCALATION_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>{level.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-jur">Statutory reference</label>
            <select id="lp-jur" className={`mt-2 ${INPUT_CLASS}`} value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
              {Object.values(JURISDICTIONS).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-rate">Late payment interest (% a year)</label>
            <input id="lp-rate" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.25" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold" htmlFor="lp-showint">
              <input
                id="lp-showint"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={showInterest}
                onChange={(e) => setShowInterest(e.target.checked)}
              />
              Quote accrued interest in the letter
            </label>
          </div>
        </div>
      </section>

      {letter.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {letter.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Invoice age
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {overdue.error ? DASH : daysLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {letter.error ? DASH : `${letter.level.label} · ${letter.level.tone}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the reminder letter" className={GHOST_BTN} disabled={!fullText}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Due date", overdue.error ? DASH : formatLongDate(dueDate)],
            ["Outstanding", Number.isFinite(toNumber(amount)) ? money(toNumber(amount)) : DASH],
            ["Interest accrued", interest && !interest.error ? money(interest.interest) : DASH],
            ["Amount plus interest", interest && !interest.error ? money(interest.total) : DASH],
            ["Payment deadline set in the letter", letter.error ? DASH : formatLongDate(letter.deadlineISO)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!letter.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Subject line</h2>
          <p className="mt-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-semibold">{letter.subject}</p>
          <h2 className="mt-5 text-base font-semibold">Letter</h2>
          <div className="mt-2 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">{letter.body}</pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational drafting help, not legal advice. Statutory interest rates and recovery costs
        change and vary by country and contract — check your own terms and speak to a solicitor or
        debt recovery professional before sending a formal notice or starting proceedings.
      </p>
    </main>
  );
}
