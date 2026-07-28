"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck, RotateCcw } from "lucide-react";

import {
  ACCOUNT_TYPES,
  DOCUMENT_RELEASE_DAYS,
  DOCUMENT_TYPES,
  RELEASE_ITEMS,
  buildNoDuesDocument,
  computeBureauTimeline,
} from "../lib";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
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
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULT_ITEMS = RELEASE_ITEMS.slice(0, 4);

const DEFAULTS = {
  documentType: "request",
  accountType: "homeLoan",
  lenderName: "State Bank of India",
  branchName: "Andheri East",
  lenderAddress: "Chakala, Andheri East, Mumbai 400099",
  borrowerName: "Sneha Kulkarni",
  borrowerAddress: "B-703, Rose Villa CHS, Andheri East, Mumbai 400069",
  coBorrowerName: "",
  accountNumber: "3456789012",
  sanctionAmount: "INR 45,00,000",
  sanctionDate: "2016-06-15",
  closureAmount: "INR 3,42,118",
  closureMode: "NEFT from HDFC Bank",
  propertyDescription: "Flat B-703, Rose Villa CHS, Andheri East, Mumbai",
  place: "Mumbai",
  signatoryName: "",
  signatoryDesignation: "",
  receivedDate: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(() => ({
    ...DEFAULTS,
    closureDate: todayIso(),
    letterDate: todayIso(),
    complaintDate: todayIso(),
  }));
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [documentsLost, setDocumentsLost] = useState(false);
  const [today] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const toggleItem = (item) => (event) => {
    const checked = event.target.checked;
    setItems((current) =>
      checked
        ? RELEASE_ITEMS.filter((entry) => entry === item || current.includes(entry))
        : current.filter((entry) => entry !== item),
    );
  };

  const result = useMemo(
    () => buildNoDuesDocument({ ...form, items, documentsLost, todayDate: today }),
    [form, items, documentsLost, today],
  );

  const bureau = useMemo(
    () => computeBureauTimeline({ complaintDate: form.complaintDate, todayDate: today }),
    [form.complaintDate, today],
  );

  const ok = !result.error;
  const timeline = ok ? result.timeline : null;

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
    setForm({
      ...DEFAULTS,
      closureDate: todayIso(),
      letterDate: todayIso(),
      complaintDate: todayIso(),
    });
    setItems(DEFAULT_ITEMS);
    setDocumentsLost(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <FileCheck className="h-4 w-4" aria-hidden="true" />
          Loan documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          No Dues Certificate Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          After a loan is closed, the RBI circular of 13 September 2023 gives the lender{" "}
          {DOCUMENT_RELEASE_DAYS} days to return every original property document and clear the
          registered charge. This drafts the certificate or the request, and dates that deadline.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Document and account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ndc-doctype">
              What do you need
            </label>
            <select
              id="ndc-doctype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.documentType}
              onChange={set("documentType")}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-account-type">
              Account type
            </label>
            <select
              id="ndc-account-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.accountType}
              onChange={set("accountType")}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-account-no">
              Account / loan number
            </label>
            <input
              id="ndc-account-no"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.accountNumber}
              onChange={set("accountNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-lender">
              Lender&apos;s name
            </label>
            <input
              id="ndc-lender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lenderName}
              onChange={set("lenderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-branch">
              Branch
            </label>
            <input
              id="ndc-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.branchName}
              onChange={set("branchName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ndc-lender-addr">
              Branch address
            </label>
            <input
              id="ndc-lender-addr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lenderAddress}
              onChange={set("lenderAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-borrower">
              Borrower&apos;s name
            </label>
            <input
              id="ndc-borrower"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerName}
              onChange={set("borrowerName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-coborrower">
              Co-borrower (optional)
            </label>
            <input
              id="ndc-coborrower"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.coBorrowerName}
              onChange={set("coBorrowerName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ndc-borrower-addr">
              Borrower&apos;s address
            </label>
            <input
              id="ndc-borrower-addr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.borrowerAddress}
              onChange={set("borrowerAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-sanction-amt">
              Amount sanctioned
            </label>
            <input
              id="ndc-sanction-amt"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sanctionAmount}
              onChange={set("sanctionAmount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-sanction-date">
              Sanction date
            </label>
            <input
              id="ndc-sanction-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.sanctionDate}
              onChange={set("sanctionDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-closure-date">
              Date of full repayment / closure
            </label>
            <input
              id="ndc-closure-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.closureDate}
              onChange={set("closureDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-closure-amt">
              Final amount paid
            </label>
            <input
              id="ndc-closure-amt"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.closureAmount}
              onChange={set("closureAmount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-closure-mode">
              Paid by
            </label>
            <input
              id="ndc-closure-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.closureMode}
              onChange={set("closureMode")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-received">
              Documents actually received on (blank if not yet)
            </label>
            <input
              id="ndc-received"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.receivedDate}
              onChange={set("receivedDate")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ndc-property">
              Security / property description
            </label>
            <input
              id="ndc-property"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.propertyDescription}
              onChange={set("propertyDescription")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-letterdate">
              Date of the document
            </label>
            <input
              id="ndc-letterdate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={set("letterDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-place">
              Place
            </label>
            <input
              id="ndc-place"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.place}
              onChange={set("place")}
            />
          </div>
          {form.documentType === "certificate" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ndc-signatory">
                  Authorised signatory
                </label>
                <input
                  id="ndc-signatory"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={form.signatoryName}
                  onChange={set("signatoryName")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ndc-designation">
                  Designation
                </label>
                <input
                  id="ndc-designation"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={form.signatoryDesignation}
                  onChange={set("signatoryDesignation")}
                />
              </div>
            </>
          ) : null}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Documents to be released</legend>
          <div className="mt-2 space-y-1">
            {RELEASE_ITEMS.map((item) => (
              <label key={item} className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={items.includes(item)}
                  onChange={toggleItem(item)}
                />
                {item}
              </label>
            ))}
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={documentsLost}
                onChange={(event) => setDocumentsLost(event.target.checked)}
              />
              The lender says the originals are lost or damaged (adds 30 days)
            </label>
          </div>
        </fieldset>
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
              Documents due back by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? prettyDate(timeline.dueDate) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${timeline.allowedDays} days from closure · ${
                    timeline.status === "running"
                      ? `${timeline.daysLeft} days still to run`
                      : timeline.status === "overdue"
                        ? `${timeline.daysDelayed} days overdue`
                        : timeline.status === "receivedLate"
                          ? `received ${timeline.daysDelayed} days late`
                          : "received within time"
                  }`
                : "Correct the input above to see the deadline"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDocument}
              aria-label="Copy the no dues document"
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
            ["Closure date", ok ? prettyDate(timeline.closureDate) : DASH],
            ["Days allowed", ok ? `${timeline.allowedDays} days` : DASH],
            ["Release deadline", ok ? prettyDate(timeline.dueDate) : DASH],
            ["Days of delay so far", ok ? `${timeline.daysDelayed} days` : DASH],
            [
              "Delay compensation at 5,000 per day",
              ok
                ? timeline.securedByDocuments
                  ? money(timeline.compensation)
                  : "Not applicable — no property documents held"
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && timeline.securedByDocuments && timeline.daysDelayed > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            The release is {timeline.daysDelayed} days past the deadline. Where the delay is
            attributable to the lender, the RBI circular fixes compensation at{" "}
            {money(timeline.compensationRate)} for each day, which comes to{" "}
            {money(timeline.compensation)} on these dates.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Credit bureau correction clock</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          If the closed account still shows as live on your credit report, the RBI framework of 26
          October 2023 requires the complaint to be resolved within 30 calendar days, with 100 rupees
          per day of delay payable to you after that.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ndc-complaint">
              Date you raised the credit report complaint
            </label>
            <input
              id="ndc-complaint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.complaintDate}
              onChange={set("complaintDate")}
            />
          </div>
        </div>
        {bureau.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {bureau.error}
          </p>
        ) : null}
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Resolution due by", bureau.error ? DASH : prettyDate(bureau.dueDate)],
            ["Days beyond the deadline", bureau.error ? DASH : `${bureau.daysDelayed} days`],
            ["Compensation at 100 per day", bureau.error ? DASH : money(bureau.compensation)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">{result.heading}</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="w-full font-sans text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {result.document}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or financial advice. The per-day compensation applies where
        original movable or immovable property documents were deposited and the delay is attributable
        to the regulated entity. Raise the matter with the lender&apos;s grievance cell first, then
        the RBI Ombudsman if it is not resolved.
      </p>
    </main>
  );
}
