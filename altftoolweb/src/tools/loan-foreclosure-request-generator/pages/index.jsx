"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  BORROWER_TYPES,
  GST_RATE_PCT,
  LOAN_TYPES,
  RATE_TYPES,
  TYPICAL_CHARGE_RANGE_PCT,
  buildForeclosureRequest,
} from "../lib";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const todayIso = () => new Date().toISOString().slice(0, 10);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  outstanding: "2000000",
  annualRate: "8.5",
  remainingMonths: "120",
  emi: "",
  rateType: "floating",
  borrowerType: "individualNonBusiness",
  chargePct: "2",
  gstPct: String(GST_RATE_PCT),
  daysSinceLastEmi: "12",
  otherCharges: "0",
  loanType: "Home loan",
  accountNumber: "3456789012",
  lenderName: "State Bank of India",
  branchName: "Andheri East",
  lenderAddress: "Chakala, Andheri East, Mumbai 400099",
  borrowerName: "Sneha Kulkarni",
  borrowerAddress: "B-703, Rose Villa CHS, Mumbai 400069",
  borrowerPhone: "+91 98200 22222",
  borrowerEmail: "sneha@example.com",
  sanctionDate: "2016-06-15",
  paymentMode: "NEFT / RTGS from my salary account",
  fundSource: "own savings and the maturity of a fixed deposit",
  place: "Mumbai",
};

export default function ToolHome() {
  const [form, setForm] = useState(() => ({
    ...DEFAULTS,
    letterDate: todayIso(),
    proposedClosureDate: todayIso(),
  }));
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildForeclosureRequest({
        ...form,
        outstanding: Number(form.outstanding),
        annualRate: Number(form.annualRate),
        remainingMonths: Number(form.remainingMonths),
        emi: Number(form.emi),
        chargePct: Number(form.chargePct),
        gstPct: Number(form.gstPct),
        daysSinceLastEmi: Number(form.daysSinceLastEmi),
        otherCharges: Number(form.otherCharges),
      }),
    [form],
  );

  const ok = !result.error;
  const figures = ok ? result.figures : null;

  const copyLetter = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm({ ...DEFAULTS, letterDate: todayIso(), proposedClosureDate: todayIso() });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Loan documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Loan Foreclosure Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what closing the loan early actually costs — principal, interest since the last
          instalment, the fee and GST on it — check whether the RBI floating-rate exemption applies,
          and print the request for a foreclosure statement.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The loan today</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-outstanding">
              Principal outstanding (INR)
            </label>
            <input
              id="lfr-outstanding"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={form.outstanding}
              onChange={set("outstanding")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-rate">
              Interest rate (% per year)
            </label>
            <input
              id="lfr-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={form.annualRate}
              onChange={set("annualRate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-months">
              Instalments still to run
            </label>
            <input
              id="lfr-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="480"
              step="1"
              value={form.remainingMonths}
              onChange={set("remainingMonths")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-emi">
              Your EMI (leave blank to compute it)
            </label>
            <input
              id="lfr-emi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.emi}
              onChange={set("emi")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-ratetype">
              Rate type
            </label>
            <select
              id="lfr-ratetype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.rateType}
              onChange={set("rateType")}
            >
              {RATE_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-borrowertype">
              Borrower
            </label>
            <select
              id="lfr-borrowertype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerType}
              onChange={set("borrowerType")}
            >
              {BORROWER_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-chargepct">
              Foreclosure charge (% of principal)
            </label>
            <input
              id="lfr-chargepct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={form.chargePct}
              onChange={set("chargePct")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Fixed-rate loans are typically charged {TYPICAL_CHARGE_RANGE_PCT[0]}% to{" "}
              {TYPICAL_CHARGE_RANGE_PCT[1]}%.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-gst">
              GST on the fee (%)
            </label>
            <input
              id="lfr-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={form.gstPct}
              onChange={set("gstPct")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-days">
              Days since the last instalment
            </label>
            <input
              id="lfr-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="366"
              step="1"
              value={form.daysSinceLastEmi}
              onChange={set("daysSinceLastEmi")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-other">
              Other charges (INR)
            </label>
            <input
              id="lfr-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.otherCharges}
              onChange={set("otherCharges")}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Total to pay on foreclosure
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(figures.totalPayable) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Net interest saved ${money(figures.netSaving)} against running the loan to term`
                : "Correct the input above to see the estimate"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              aria-label="Copy the foreclosure request letter"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Principal outstanding", ok ? money(figures.principal) : DASH],
            [
              "Interest accrued since the last EMI",
              ok ? `${money(figures.accruedInterest)} (${figures.accrualDays} days)` : DASH,
            ],
            [
              "Foreclosure charge",
              ok ? `${money(figures.foreclosureCharge)} (${NUM.format(figures.effectiveChargePct)}%)` : DASH,
            ],
            ["GST on the charge", ok ? money(figures.gstOnCharge) : DASH],
            ["Other charges", ok ? money(figures.otherCharges) : DASH],
            ["Total payable", ok ? money(figures.totalPayable) : DASH],
            ["Your EMI", ok ? money(figures.emi) : DASH],
            [
              "If you keep paying to term",
              ok ? `${money(figures.remainingPayments)} over ${figures.remainingMonths} months` : DASH,
            ],
            ["Interest you would still pay", ok ? money(figures.remainingInterest) : DASH],
            ["Cost of closing early", ok ? money(figures.costOfClosing) : DASH],
            ["Net saving by foreclosing now", ok ? money(figures.netSaving) : DASH],
            [
              "Closing cost equals this many EMIs",
              ok ? `${figures.breakEvenMonths} instalment(s)` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section
          className={`mt-6 rounded-xl p-5 ring-1 ${
            figures.chargeExempt
              ? "bg-[var(--card)] ring-[var(--border)]"
              : "bg-[var(--danger-soft)] ring-[var(--danger)]"
          }`}
        >
          <h2 className="text-base font-semibold">Foreclosure charge check</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {figures.exemptReason}
          </p>
          {figures.chargeExempt ? (
            <p className="mt-2 text-sm font-semibold text-[var(--success)]">
              No foreclosure charge should be levied on this loan.
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-[var(--danger)]">
              A charge of {money(figures.foreclosureCharge)} plus{" "}
              {money(figures.gstOnCharge)} GST is likely — ask for the clause in the sanction letter
              that authorises it.
            </p>
          )}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Letter details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-loantype">
              Loan type
            </label>
            <select
              id="lfr-loantype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.loanType}
              onChange={set("loanType")}
            >
              {LOAN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-account">
              Loan account number
            </label>
            <input
              id="lfr-account"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.accountNumber}
              onChange={set("accountNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-lender">
              Lender
            </label>
            <input
              id="lfr-lender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lenderName}
              onChange={set("lenderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-branch">
              Branch
            </label>
            <input
              id="lfr-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.branchName}
              onChange={set("branchName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lfr-lender-addr">
              Branch address
            </label>
            <input
              id="lfr-lender-addr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lenderAddress}
              onChange={set("lenderAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-borrower">
              Your name
            </label>
            <input
              id="lfr-borrower"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerName}
              onChange={set("borrowerName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-borrower-addr">
              Your address
            </label>
            <input
              id="lfr-borrower-addr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerAddress}
              onChange={set("borrowerAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-phone">
              Phone
            </label>
            <input
              id="lfr-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerPhone}
              onChange={set("borrowerPhone")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-email">
              Email
            </label>
            <input
              id="lfr-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.borrowerEmail}
              onChange={set("borrowerEmail")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-sanction">
              Sanction date
            </label>
            <input
              id="lfr-sanction"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.sanctionDate}
              onChange={set("sanctionDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-closuredate">
              Proposed closure date
            </label>
            <input
              id="lfr-closuredate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.proposedClosureDate}
              onChange={set("proposedClosureDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-letterdate">
              Date of the letter
            </label>
            <input
              id="lfr-letterdate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={set("letterDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-place">
              Place
            </label>
            <input
              id="lfr-place"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.place}
              onChange={set("place")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-mode">
              How you will pay
            </label>
            <input
              id="lfr-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.paymentMode}
              onChange={set("paymentMode")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lfr-source">
              Source of funds
            </label>
            <input
              id="lfr-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.fundSource}
              onChange={set("fundSource")}
            />
          </div>
        </div>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Your foreclosure request</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="w-full font-sans text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {result.letter}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not financial or legal advice. The lender&apos;s own foreclosure
        statement is the binding figure — this estimate assumes simple daily interest on the
        principal outstanding and ignores unpaid overdue instalments, penal interest and any
        insurance premium refund. Ask for the statement in writing before you transfer money.
      </p>
    </main>
  );
}
