"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PhoneCall, RotateCcw, TriangleAlert } from "lucide-react";

import {
  COMPLAINT_TYPES,
  ESCALATION_STAGES,
  HELPLINES,
  RELIEF_OPTIONS,
  buildTelecomComplaint,
} from "../lib";

const todayIso = () => new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  complainantName: "Anita Rao",
  address: "22 Nehru Nagar, Pune 411001",
  mobileNumber: "9876500000",
  accountNumber: "",
  operatorName: "My Telecom Operator",
  planName: "",
  complaintType: "vas",
  billNumber: "",
  billPeriod: "",
  disputedAmount: "1240",
  details:
    "A caller-tune subscription was activated on my number without any confirmation message from me, and it has been billed every month since.",
  docketNumber: "",
  stage: "complaint-centre",
  relief: "refund",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [letterDate, setLetterDate] = useState(() => todayIso());
  const [reportedDate, setReportedDate] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const letter = useMemo(
    () =>
      buildTelecomComplaint({
        complainantName: form.complainantName,
        address: form.address,
        mobileNumber: form.mobileNumber,
        accountNumber: form.accountNumber,
        operatorName: form.operatorName,
        planName: form.planName,
        complaintType: form.complaintType,
        billNumber: form.billNumber,
        billPeriod: form.billPeriod,
        disputedAmount: toNumber(form.disputedAmount),
        details: form.details,
        reportedDate,
        docketNumber: form.docketNumber,
        stage: form.stage,
        relief: form.relief,
        letterDate,
      }),
    [form, reportedDate, letterDate],
  );

  const hasError = Boolean(letter.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(letter.letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setLetterDate(todayIso());
    setReportedDate(todayIso());
    setCopied(false);
  };

  const facts = hasError
    ? [
        ["Stage", DASH],
        ["Addressed to", DASH],
        ["Amount in dispute", DASH],
        ["Days since first complaint", DASH],
        ["Resolution due by", DASH],
        ["Credit or waiver due by", DASH],
        ["Appeal deadline", DASH],
        ["Relief requested", DASH],
      ]
    : letter.keyFacts;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          Complaint letters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Consumer Complaint Letter for Telecom Billing
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a telecom billing or network complaint that cites the right TRAI deadlines, and see
          exactly when you can escalate to the Appellate Authority or a consumer commission.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who you are</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-name">
              Your full name
            </label>
            <input
              id="ctb-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.complainantName}
              onChange={setField("complainantName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-address">
              Your address
            </label>
            <input
              id="ctb-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.address}
              onChange={setField("address")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-number">
              Number or connection in dispute
            </label>
            <input
              id="ctb-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="tel"
              value={form.mobileNumber}
              onChange={setField("mobileNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-account">
              Relationship / account number
            </label>
            <input
              id="ctb-account"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.accountNumber}
              onChange={setField("accountNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-operator">
              Telecom operator
            </label>
            <input
              id="ctb-operator"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.operatorName}
              onChange={setField("operatorName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-plan">
              Tariff plan (optional)
            </label>
            <input
              id="ctb-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.planName}
              onChange={setField("planName")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The complaint</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-type">
              What went wrong
            </label>
            <select
              id="ctb-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.complaintType}
              onChange={setField("complaintType")}
            >
              {COMPLAINT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-amount">
              Amount in dispute (INR)
            </label>
            <input
              id="ctb-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.disputedAmount}
              onChange={setField("disputedAmount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-bill">
              Bill number (optional)
            </label>
            <input
              id="ctb-bill"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.billNumber}
              onChange={setField("billNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-period">
              Billing period (optional)
            </label>
            <input
              id="ctb-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="1-30 June 2026"
              value={form.billPeriod}
              onChange={setField("billPeriod")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-reported">
              Date you first complained
            </label>
            <input
              id="ctb-reported"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={reportedDate}
              onChange={(event) => {
                setReportedDate(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-docket">
              Docket / complaint number
            </label>
            <input
              id="ctb-docket"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.docketNumber}
              onChange={setField("docketNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-stage">
              Escalation stage
            </label>
            <select
              id="ctb-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.stage}
              onChange={setField("stage")}
            >
              {ESCALATION_STAGES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-relief">
              What you want
            </label>
            <select
              id="ctb-relief"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.relief}
              onChange={setField("relief")}
            >
              {RELIEF_OPTIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ctb-letterdate">
              Date of this letter
            </label>
            <input
              id="ctb-letterdate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={letterDate}
              onChange={(event) => {
                setLetterDate(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ctb-details">
              What happened, in your own words
            </label>
            <textarea
              id="ctb-details"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.details}
              onChange={setField("details")}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {letter.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Amount in dispute
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : letter.keyFacts[2][1]}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the letter."
                : `${letter.daysSinceReported} days since you first complained · ${letter.wordCount} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the complaint letter"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Escalation timeline</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Milestone
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {letter.timeline.map((step) => (
                  <tr key={step.id} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-semibold">
                      {step.label}
                    </th>
                    <td className="py-2 pr-3">{step.date}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{step.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Helplines: {HELPLINES.map((line) => `${line.label} — ${line.number}`).join(" · ")}
          </p>
        </section>
      )}

      {!hasError && letter.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Before you send this
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {letter.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]"
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your letter</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-[var(--muted-foreground)]">
              {letter.letterText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and written for the Indian TRAI framework — deadlines and forums differ in
        other countries. This is not legal advice; consult a lawyer or your consumer helpline before
        filing a formal case, and keep every docket number and payment receipt.
      </p>
    </main>
  );
}
