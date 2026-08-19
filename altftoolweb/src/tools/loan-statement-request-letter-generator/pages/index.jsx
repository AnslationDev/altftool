"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  DELIVERY_MODES,
  LOAN_TYPES,
  REQUEST_TYPES,
  buildLoanStatementLetter,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  senderName: "Anita Rao",
  senderAddress: "12 MG Road\nBengaluru 560001",
  senderPhone: "98XXXXXX10",
  senderEmail: "anita.rao@example.com",
  bankName: "State Bank of India",
  branchName: "Indiranagar Branch",
  loanAccountNumber: "32154789632",
  loanType: "home",
  requestType: "all",
  periodFrom: "2025-04-01",
  periodTo: "2026-03-31",
  letterDate: "2026-04-12",
  purpose: "filing my income tax return",
  deliveryMode: "both",
  replyDays: "7",
  maskAccountNumber: false,
};

const EM_DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildLoanStatementLetter(form), [form]);
  const failed = Boolean(result.error);

  const copyLetter = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Banking letters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Loan Statement Request Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in your loan details and get a ready-to-send letter asking your bank or NBFC for the
          account statement, interest certificate, amortisation schedule, foreclosure figure or
          closure documents.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-name">
              Borrower name
            </label>
            <input
              id="lsr-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.senderName}
              onChange={setField("senderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-phone">
              Registered mobile (optional)
            </label>
            <input
              id="lsr-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.senderPhone}
              onChange={setField("senderPhone")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lsr-address">
              Address (optional)
            </label>
            <textarea
              id="lsr-address"
              rows={2}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.senderAddress}
              onChange={setField("senderAddress")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lsr-email">
              Registered email (optional)
            </label>
            <input
              id="lsr-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.senderEmail}
              onChange={setField("senderEmail")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Loan and request</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-bank">
              Bank / NBFC name
            </label>
            <input
              id="lsr-bank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.bankName}
              onChange={setField("bankName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-branch">
              Branch (optional)
            </label>
            <input
              id="lsr-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.branchName}
              onChange={setField("branchName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-account">
              Loan account number (LAN)
            </label>
            <input
              id="lsr-account"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.loanAccountNumber}
              onChange={setField("loanAccountNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-loan-type">
              Loan type
            </label>
            <select
              id="lsr-loan-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.loanType}
              onChange={setField("loanType")}
            >
              {LOAN_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lsr-request-type">
              What are you asking for?
            </label>
            <select
              id="lsr-request-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.requestType}
              onChange={setField("requestType")}
            >
              {REQUEST_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-from">
              Period from
            </label>
            <input
              id="lsr-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.periodFrom}
              onChange={setField("periodFrom")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-to">
              Period to
            </label>
            <input
              id="lsr-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.periodTo}
              onChange={setField("periodTo")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-letter-date">
              Date on the letter
            </label>
            <input
              id="lsr-letter-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={setField("letterDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lsr-reply-days">
              Acknowledge within (days)
            </label>
            <input
              id="lsr-reply-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="45"
              step="1"
              value={form.replyDays}
              onChange={setField("replyDays")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lsr-purpose">
              Reason for the request (optional)
            </label>
            <input
              id="lsr-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="filing my income tax return"
              value={form.purpose}
              onChange={setField("purpose")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lsr-delivery">
              How should they send it?
            </label>
            <select
              id="lsr-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.deliveryMode}
              onChange={setField("deliveryMode")}
            >
              {DELIVERY_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            id="lsr-mask"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.maskAccountNumber}
            onChange={setField("maskAccountNumber")}
          />
          <label className="text-sm text-[var(--muted-foreground)]" htmlFor="lsr-mask">
            Print only the last 4 digits of the account number
          </label>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Subject line
            </p>
            <p className="mt-1 text-lg font-semibold leading-snug text-[var(--primary)]">
              {failed ? EM_DASH : result.subject}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the generated request letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Statement period", failed ? EM_DASH : `${result.periodFromLong} to ${result.periodToLong}`],
            ["Financial year covered", failed ? EM_DASH : result.financialYear],
            ["Account printed as", failed ? EM_DASH : result.printedAccount],
            ["Letter length", failed ? EM_DASH : `${result.wordCount} words`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 font-sans text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? EM_DASH : result.letter}
          </pre>
        </div>
      </section>

      {!failed && result.notes.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Before you send it</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  &bull;
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal or tax advice. Banks may require the request on their
        own form or through net banking; check the deduction limits that apply to your case with a
        qualified tax professional.
      </p>
    </main>
  );
}
