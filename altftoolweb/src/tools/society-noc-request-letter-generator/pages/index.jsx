"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw } from "lucide-react";

import {
  NOC_PURPOSES,
  NON_OCCUPANCY_CAP_PERCENT,
  SOCIETY_DECISION_DAYS,
  TRANSFER_PREMIUM_CAP,
  buildNocRequestLetter,
  formatLongDate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  purpose: "sale",
  societyName: "Shanti Nivas Co-operative Housing Society Ltd.",
  societyAddress: "Plot 14, Sector 8, Vashi, Navi Mumbai 400703",
  memberName: "Anita R. Deshmukh",
  flatNumber: "B-704",
  wing: "B Wing",
  shareCertificateNumber: "SC/214",
  membershipNumber: "M-118",
  letterDate: "2026-08-03",
  effectiveDate: "2026-09-01",
  counterpartyName: "Rahul S. Menon",
  counterpartyDetail: "Proposed transferee, PAN ABCDE1234F",
  outstandingDues: "0",
  contactPhone: "98200 11223",
  contactEmail: "anita@example.com",
  extraNote: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const result = useMemo(
    () =>
      buildNocRequestLetter({
        ...form,
        outstandingDues: form.outstandingDues === "" ? 0 : Number(form.outstandingDues),
      }),
    [form],
  );

  const failed = Boolean(result.error);
  const purpose = NOC_PURPOSES.find((item) => item.value === form.purpose) || NOC_PURPOSES[0];

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
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Property notices
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Society NOC Request Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Drafts the letter a flat owner sends to the managing committee asking for a No Objection
          Certificate, with the enclosure list, the notice period and the {SOCIETY_DECISION_DAYS}-day
          decision window that co-operative housing society rules expect.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the NOC is for</h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="noc-purpose">
            Purpose
          </label>
          <select
            id="noc-purpose"
            className={`mt-2 ${INPUT_CLASS}`}
            value={form.purpose}
            onChange={set("purpose")}
          >
            {NOC_PURPOSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {purpose.noticeDays > 0
              ? `${purpose.noticeDays} days' advance notice is expected for this request.`
              : "No fixed notice period applies to this request."}
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="noc-society">
              Society name
            </label>
            <input
              id="noc-society"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.societyName}
              onChange={set("societyName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="noc-address">
              Society address
            </label>
            <input
              id="noc-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.societyAddress}
              onChange={set("societyAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-member">
              Member name
            </label>
            <input
              id="noc-member"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.memberName}
              onChange={set("memberName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-flat">
              Flat number
            </label>
            <input
              id="noc-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.flatNumber}
              onChange={set("flatNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-wing">
              Wing / building
            </label>
            <input
              id="noc-wing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.wing}
              onChange={set("wing")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-share">
              Share certificate number
            </label>
            <input
              id="noc-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.shareCertificateNumber}
              onChange={set("shareCertificateNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-member-no">
              Membership number
            </label>
            <input
              id="noc-member-no"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.membershipNumber}
              onChange={set("membershipNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-dues">
              Outstanding society dues (INR)
            </label>
            <input
              id="noc-dues"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.outstandingDues}
              onChange={set("outstandingDues")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-date">
              Date of the letter
            </label>
            <input
              id="noc-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={set("letterDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-effective">
              Proposed effective date
            </label>
            <input
              id="noc-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.effectiveDate}
              onChange={set("effectiveDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-party">
              Transferee / licensee / lender name
            </label>
            <input
              id="noc-party"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.counterpartyName}
              onChange={set("counterpartyName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-party-detail">
              Their particulars
            </label>
            <input
              id="noc-party-detail"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.counterpartyDetail}
              onChange={set("counterpartyDetail")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-phone">
              Your phone
            </label>
            <input
              id="noc-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contactPhone}
              onChange={set("contactPhone")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noc-email">
              Your email
            </label>
            <input
              id="noc-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.contactEmail}
              onChange={set("contactEmail")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="noc-note">
              Anything else the committee should know
            </label>
            <textarea
              id="noc-note"
              className={`mt-2 ${AREA_CLASS}`}
              value={form.extraNote}
              onChange={set("extraNote")}
              placeholder="Optional: a payment plan for dues, an earlier reminder, a reference number"
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Letter readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : `${result.readiness}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fill the required fields to build the letter."
                : `${result.wordCount} words · ${result.enclosures.length} enclosures listed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the NOC request letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the form" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Purpose", purpose.label],
            [
              "Earliest date this notice supports",
              failed ? "—" : formatLongDate(result.effectiveFrom) || "—",
            ],
            [
              "Decision expected by",
              failed ? "—" : formatLongDate(result.decisionDueDate) || "—",
            ],
            [
              "Outstanding dues declared",
              failed ? "—" : INR.format(Number(form.outstandingDues) || 0),
            ],
            ["Transfer premium ceiling", INR.format(TRANSFER_PREMIUM_CAP)],
            ["Non-occupancy charge ceiling", `${NON_OCCUPANCY_CAP_PERCENT}% of service charges`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.warnings.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        {!failed && result.missing.length > 0 ? (
          <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
            <p className="font-semibold">Still to fill in</p>
            <ul className="mt-1 list-disc pl-5 text-[var(--muted-foreground)]">
              {result.missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {!failed ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your letter</h2>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.letter}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Worth knowing before you send it</h2>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--success)]">
                    •
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Bye-law numbers, fee ceilings and notice
        periods differ between states and between registered societies and apartment owners'
        associations — read your own registered bye-laws, or ask a lawyer, before you rely on this.
      </p>
    </main>
  );
}
