"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, Copy, RotateCcw } from "lucide-react";

import { PAYMENT_MODES, RATE_BASES, REPAYMENT_PLANS, buildIouLetter } from "../lib";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const prettyDate = (value) => {
  if (!value) return DASH;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(parsed) ? DASH : DATE_FMT.format(new Date(parsed));
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  borrowerName: "Arjun Nair",
  borrowerParent: "son of Mr. Ramesh Nair",
  borrowerAddress: "21 MG Road, Kochi 682016",
  lenderName: "Ms. Priya Iyer",
  lenderAddress: "14 Lake View, Kochi 682020",
  principal: "200000",
  rate: "12",
  rateBasis: "perYear",
  loanDate: "2026-01-01",
  dueDate: "2027-01-01",
  paymentMode: "bankTransfer",
  reference: "NEFT UTR 12345678",
  purpose: "working capital for my bakery",
  repaymentPlan: "lumpSum",
  instalments: "12",
  place: "Kochi",
  witnessOne: "",
  witnessTwo: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(() => ({ ...DEFAULTS, acknowledgementDate: todayIso() }));
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildIouLetter({
        ...form,
        principal: Number(form.principal),
        rate: Number(form.rate),
        instalments: Number(form.instalments),
      }),
    [form],
  );

  const ok = !result.error;
  const figures = ok ? result.figures : null;

  const copyDocument = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.document);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm({ ...DEFAULTS, acknowledgementDate: todayIso() });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Banknote className="h-4 w-4" aria-hidden="true" />
          Loan documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">IOU Letter Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An IOU is an acknowledgement of debt under section 18 of the Limitation Act, 1963 — signed
          in time, it restarts the three-year clock. Enter the loan and this writes the document,
          spells the amount out in words and shows the interest and the new limitation date.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The loan</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-principal">
              Amount lent (INR)
            </label>
            <input
              id="iou-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.principal}
              onChange={set("principal")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-mode">
              How the money was paid over
            </label>
            <select
              id="iou-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.paymentMode}
              onChange={set("paymentMode")}
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode.key} value={mode.key}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-rate">
              Interest rate
            </label>
            <input
              id="iou-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.rate}
              onChange={set("rate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-basis">
              Rate is
            </label>
            <select
              id="iou-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.rateBasis}
              onChange={set("rateBasis")}
            >
              {RATE_BASES.map((basis) => (
                <option key={basis.key} value={basis.key}>
                  {basis.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-loandate">
              Date the money was lent
            </label>
            <input
              id="iou-loandate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.loanDate}
              onChange={set("loanDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-duedate">
              Repayment due on
            </label>
            <input
              id="iou-duedate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.dueDate}
              onChange={set("dueDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-plan">
              Repayment plan
            </label>
            <select
              id="iou-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.repaymentPlan}
              onChange={set("repaymentPlan")}
            >
              {REPAYMENT_PLANS.map((plan) => (
                <option key={plan.key} value={plan.key}>
                  {plan.label}
                </option>
              ))}
            </select>
          </div>
          {form.repaymentPlan === "monthly" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="iou-instalments">
                Number of instalments
              </label>
              <input
                id="iou-instalments"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="360"
                step="1"
                value={form.instalments}
                onChange={set("instalments")}
              />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="iou-reference">
              Payment reference (UTR, cheque number)
            </label>
            <input
              id="iou-reference"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.reference}
              onChange={set("reference")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="iou-purpose">
              Purpose of the loan (optional)
            </label>
            <textarea
              id="iou-purpose"
              className={`mt-2 ${AREA_CLASS}`}
              value={form.purpose}
              onChange={set("purpose")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and signing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-borrower">
              Borrower&apos;s full name
            </label>
            <input
              id="iou-borrower"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerName}
              onChange={set("borrowerName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-parent">
              Borrower&apos;s parentage (son / daughter of)
            </label>
            <input
              id="iou-parent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerParent}
              onChange={set("borrowerParent")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="iou-borrower-addr">
              Borrower&apos;s address
            </label>
            <input
              id="iou-borrower-addr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerAddress}
              onChange={set("borrowerAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-lender">
              Lender&apos;s full name
            </label>
            <input
              id="iou-lender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lenderName}
              onChange={set("lenderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-lender-addr">
              Lender&apos;s address
            </label>
            <input
              id="iou-lender-addr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lenderAddress}
              onChange={set("lenderAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-ackdate">
              Date this IOU is signed
            </label>
            <input
              id="iou-ackdate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.acknowledgementDate}
              onChange={set("acknowledgementDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-place">
              Place of signing
            </label>
            <input
              id="iou-place"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.place}
              onChange={set("place")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-w1">
              Witness 1 (optional)
            </label>
            <input
              id="iou-w1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.witnessOne}
              onChange={set("witnessOne")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="iou-w2">
              Witness 2 (optional)
            </label>
            <input
              id="iou-w2"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.witnessTwo}
              onChange={set("witnessTwo")}
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
              Total repayable on the due date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(figures.total) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${figures.totalWords} · ${figures.termDays} days at ${NUM.format(figures.annualRate)}% per year`
                : "Correct the input above to build the document"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDocument}
              aria-label="Copy the acknowledgement of debt"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy document"}
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
            ["Principal", ok ? money(figures.principal) : DASH],
            ["Principal in words", ok ? figures.principalWords : DASH],
            ["Effective annual rate", ok ? `${NUM.format(figures.annualRate)}%` : DASH],
            ["Term to the due date", ok ? `${figures.termDays} days` : DASH],
            ["Simple interest", ok ? money(figures.interest) : DASH],
            ["Total repayable", ok ? money(figures.total) : DASH],
            [
              "Each instalment",
              ok && form.repaymentPlan === "monthly"
                ? `${money(figures.instalmentAmount)} × ${figures.instalments}`
                : DASH,
            ],
            [
              "Original limitation expiry (3 years from the loan)",
              ok ? prettyDate(figures.originalLimitation) : DASH,
            ],
            [
              "Fresh limitation expiry from this acknowledgement",
              ok ? prettyDate(figures.freshLimitation) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && !figures.acknowledgementInTime ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          The original three-year limitation period expired on{" "}
          {prettyDate(figures.originalLimitation)}. Section 18 of the Limitation Act restarts the
          clock only for an acknowledgement signed before that date, so this document may not revive
          the claim. Take legal advice.
        </p>
      ) : null}

      {ok && figures.cashBreach ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          Sections 269SS and 269T of the Income-tax Act, 1961 bar accepting or repaying a loan of{" "}
          {money(figures.cashLimit)} or more in cash, and sections 271D and 271E impose a penalty
          equal to the amount. Route this loan through a bank instead, and speak to a tax
          professional.
        </p>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Your acknowledgement of debt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="w-full font-sans text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {result.document}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not legal or tax advice. An acknowledgement of a debt above twenty
        rupees is chargeable under Article 1 of Schedule I to the Indian Stamp Act, 1899 at the rate
        your state prescribes, and the usual practice is to affix a revenue stamp and sign across it.
        Have a lawyer review the wording, especially for a large loan or where limitation is close.
      </p>
    </main>
  );
}
