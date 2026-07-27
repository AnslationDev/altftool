"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSignature, RotateCcw } from "lucide-react";

import {
  DEPOSIT_CAP_MONTHS,
  TERM_PRESETS,
  buildRenewalNotice,
  computeRenewal,
  formatLongDate,
  formatMoney,
  parseISODate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  currentEndDate: "2026-08-31",
  noticeDate: "2026-06-15",
  termMonths: "11",
  currentRent: "25000",
  escalationPercent: "8",
  currentDeposit: "50000",
  reviseDeposit: true,
  responseDays: "15",
  requiredNoticeDays: "60",
  propertyUse: "residential",
  senderName: "",
  senderRole: "landlord",
  recipientName: "",
  propertyAddress: "",
  agreementDate: "",
  otherChanges: "",
  contact: "",
};

const num = (value) => {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const longDate = (iso) => {
  const parsed = parseISODate(iso);
  return parsed ? formatLongDate(parsed) : "—";
};

export default function ToolHome() {
  const [currentEndDate, setCurrentEndDate] = useState(DEFAULTS.currentEndDate);
  const [noticeDate, setNoticeDate] = useState(DEFAULTS.noticeDate);
  const [termMonths, setTermMonths] = useState(DEFAULTS.termMonths);
  const [currentRent, setCurrentRent] = useState(DEFAULTS.currentRent);
  const [escalationPercent, setEscalationPercent] = useState(DEFAULTS.escalationPercent);
  const [currentDeposit, setCurrentDeposit] = useState(DEFAULTS.currentDeposit);
  const [reviseDeposit, setReviseDeposit] = useState(DEFAULTS.reviseDeposit);
  const [responseDays, setResponseDays] = useState(DEFAULTS.responseDays);
  const [requiredNoticeDays, setRequiredNoticeDays] = useState(DEFAULTS.requiredNoticeDays);
  const [propertyUse, setPropertyUse] = useState(DEFAULTS.propertyUse);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [senderRole, setSenderRole] = useState(DEFAULTS.senderRole);
  const [recipientName, setRecipientName] = useState(DEFAULTS.recipientName);
  const [propertyAddress, setPropertyAddress] = useState(DEFAULTS.propertyAddress);
  const [agreementDate, setAgreementDate] = useState(DEFAULTS.agreementDate);
  const [otherChanges, setOtherChanges] = useState(DEFAULTS.otherChanges);
  const [contact, setContact] = useState(DEFAULTS.contact);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRenewal({
        currentEndDate,
        noticeDate,
        termMonths: num(termMonths),
        currentRent: num(currentRent),
        escalationPercent: num(escalationPercent),
        currentDeposit: num(currentDeposit),
        reviseDeposit,
        responseDays: num(responseDays),
        requiredNoticeDays: num(requiredNoticeDays),
        propertyUse,
      }),
    [
      currentEndDate,
      noticeDate,
      termMonths,
      currentRent,
      escalationPercent,
      currentDeposit,
      reviseDeposit,
      responseDays,
      requiredNoticeDays,
      propertyUse,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const letter = useMemo(() => {
    if (hasError) return "";
    return buildRenewalNotice(result, {
      senderName: senderName.trim() || "[Your name]",
      senderRole,
      recipientName: recipientName.trim() || (senderRole === "landlord" ? "[Tenant]" : "[Landlord]"),
      propertyAddress: propertyAddress.trim() || "[Property address]",
      agreementDate,
      otherChanges,
      contact,
    });
  }, [
    hasError,
    result,
    senderName,
    senderRole,
    recipientName,
    propertyAddress,
    agreementDate,
    otherChanges,
    contact,
  ]);

  const copyResult = async () => {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCurrentEndDate(DEFAULTS.currentEndDate);
    setNoticeDate(DEFAULTS.noticeDate);
    setTermMonths(DEFAULTS.termMonths);
    setCurrentRent(DEFAULTS.currentRent);
    setEscalationPercent(DEFAULTS.escalationPercent);
    setCurrentDeposit(DEFAULTS.currentDeposit);
    setReviseDeposit(DEFAULTS.reviseDeposit);
    setResponseDays(DEFAULTS.responseDays);
    setRequiredNoticeDays(DEFAULTS.requiredNoticeDays);
    setPropertyUse(DEFAULTS.propertyUse);
    setSenderName(DEFAULTS.senderName);
    setSenderRole(DEFAULTS.senderRole);
    setRecipientName(DEFAULTS.recipientName);
    setPropertyAddress(DEFAULTS.propertyAddress);
    setAgreementDate(DEFAULTS.agreementDate);
    setOtherChanges(DEFAULTS.otherChanges);
    setContact(DEFAULTS.contact);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          Tenancy notice
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Rent Agreement Renewal Notice Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the renewed term dates, the revised rent and the deposit differential, then get a
          renewal intimation you can send — with a response deadline that lands before the present
          term runs out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Terms</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-end">
              Current term ends on
            </label>
            <input
              id="rr-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={currentEndDate}
              onChange={(event) => setCurrentEndDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-notice">
              Date of this notice
            </label>
            <input
              id="rr-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={noticeDate}
              onChange={(event) => setNoticeDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-term">
              Renewed term (months)
            </label>
            <input
              id="rr-term"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={termMonths}
              onChange={(event) => setTermMonths(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TERM_PRESETS.map((preset) => (
                <button
                  key={preset.months}
                  type="button"
                  onClick={() => setTermMonths(String(preset.months))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.months} mo
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-use">
              Property use
            </label>
            <select
              id="rr-use"
              className={`mt-2 ${INPUT_CLASS}`}
              value={propertyUse}
              onChange={(event) => setPropertyUse(event.target.value)}
            >
              <option value="residential">
                Residential (deposit cap {DEPOSIT_CAP_MONTHS.residential} months)
              </option>
              <option value="commercial">
                Non-residential (deposit cap {DEPOSIT_CAP_MONTHS.commercial} months)
              </option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-rent">
              Current monthly rent (INR)
            </label>
            <input
              id="rr-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={currentRent}
              onChange={(event) => setCurrentRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-esc">
              Escalation for the new term (%)
            </label>
            <input
              id="rr-esc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={escalationPercent}
              onChange={(event) => setEscalationPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-dep">
              Deposit currently held (INR)
            </label>
            <input
              id="rr-dep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={currentDeposit}
              onChange={(event) => setCurrentDeposit(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="rr-revise"
            >
              <input
                id="rr-revise"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={reviseDeposit}
                onChange={(event) => setReviseDeposit(event.target.checked)}
              />
              Raise the deposit with the rent
            </label>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-resp">
              Days to respond
            </label>
            <input
              id="rr-resp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={responseDays}
              onChange={(event) => setResponseDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-req">
              Notice the agreement requires (days)
            </label>
            <input
              id="rr-req"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              value={requiredNoticeDays}
              onChange={(event) => setRequiredNoticeDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and property</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-role">
              You are the
            </label>
            <select
              id="rr-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={senderRole}
              onChange={(event) => setSenderRole(event.target.value)}
            >
              <option value="landlord">Landlord</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-sender">
              Your name
            </label>
            <input
              id="rr-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-recipient">
              Other party&apos;s name
            </label>
            <input
              id="rr-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-agreement">
              Existing agreement dated (optional)
            </label>
            <input
              id="rr-agreement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={agreementDate}
              onChange={(event) => setAgreementDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-address">
              Property address
            </label>
            <input
              id="rr-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Flat 302, Sunview Residency, Baner, Pune 411045"
              value={propertyAddress}
              onChange={(event) => setPropertyAddress(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-other">
              Other changes proposed (optional)
            </label>
            <textarea
              id="rr-other"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              placeholder="Society maintenance to be borne by the landlord from this term."
              value={otherChanges}
              onChange={(event) => setOtherChanges(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-contact">
              Contact line (optional)
            </label>
            <input
              id="rr-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="+91 98xxxxxx01 · name@example.com"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Revised monthly rent
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : formatMoney(result.newRent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${result.termMonths} months from ${longDate(result.newStartDate)} to ${longDate(result.newEndDate)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the renewal notice"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy notice"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Rent increase",
              hasError
                ? dash
                : `${formatMoney(result.rentIncrease)} (${result.escalationPercent}% on ${formatMoney(result.currentRent)})`,
            ],
            ["Rent over the full term", hasError ? dash : formatMoney(result.totalRentOverTerm)],
            [
              "Revised security deposit",
              hasError
                ? dash
                : `${formatMoney(result.newDeposit)}${result.depositCapped ? " (capped)" : ""}`,
            ],
            ["Deposit differential payable", hasError ? dash : formatMoney(result.depositTopUp)],
            [
              "Statutory deposit ceiling",
              hasError
                ? dash
                : `${formatMoney(result.depositCap)} (${result.depositCapMonths} months' rent)`,
            ],
            ["Notice given before expiry", hasError ? dash : `${result.daysToExpiry} days`],
            ["Written reply due by", hasError ? dash : longDate(result.responseDeadline)],
            [
              "Registration needed",
              hasError ? dash : result.registrationRequired ? "Yes — term is 12 months or more" : "No — term is under 12 months",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.noticeAdequate && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This notice is {result.noticeShortfallDays} day(s) short of the {result.requiredNoticeDays}{" "}
            days your agreement asks for. Send it sooner, or agree the shortfall in writing.
          </p>
        )}
        {!hasError && !result.responseBeforeExpiry && (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            The reply deadline falls after the current term ends. Shorten the response window so the
            fresh agreement can be signed in time.
          </p>
        )}
        {!hasError && result.depositCapped && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            A proportionate rise would have taken the deposit past{" "}
            {result.depositCapMonths} months&apos; rent, so it has been held at the ceiling the Model
            Tenancy Act, 2021 sets for {result.propertyUse === "commercial" ? "non-residential" : "residential"}{" "}
            premises.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Your renewal notice</h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
            {letter}
          </pre>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only. The Model Tenancy Act, 2021 applies only in states that have
        adopted it, and stamp duty, registration fees and rent-control rules are state subjects. Have
        the final agreement checked by a lawyer in your state before signing.
      </p>
    </main>
  );
}
