"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";

import {
  APPLICATION_FEE_INR,
  OPTIONAL_QUERIES,
  PENALTY_CAP_INR,
  PENALTY_PER_DAY_INR,
  STUCK_STAGES,
  buildPassportRti,
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
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DASH = "—";

const DEFAULTS = {
  applicantName: "Anita Verma",
  address: "12 Nehru Road, Hazratganj, Lucknow 226001",
  phone: "+91 90000 11111",
  email: "anita.verma@example.com",
  passportOffice: "Regional Passport Office, Lucknow",
  fileNumber: "LK1234567890126",
  applicationType: "fresh passport",
  applicationDate: "2026-05-14",
  stageId: "police-verification",
  queryIds: ["file-movement", "pv-dispatch", "pending-reason", "officer-details", "expected-date"],
  filedDate: "2026-08-03",
  isBpl: false,
  lifeLiberty: false,
  lifeLibertyReason: "",
  wantsCertified: true,
};

export default function ToolHome() {
  const [applicantName, setApplicantName] = useState(DEFAULTS.applicantName);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [passportOffice, setPassportOffice] = useState(DEFAULTS.passportOffice);
  const [fileNumber, setFileNumber] = useState(DEFAULTS.fileNumber);
  const [applicationType, setApplicationType] = useState(DEFAULTS.applicationType);
  const [applicationDate, setApplicationDate] = useState(DEFAULTS.applicationDate);
  const [stageId, setStageId] = useState(DEFAULTS.stageId);
  const [queryIds, setQueryIds] = useState(DEFAULTS.queryIds);
  const [filedDate, setFiledDate] = useState(DEFAULTS.filedDate);
  const [isBpl, setIsBpl] = useState(DEFAULTS.isBpl);
  const [lifeLiberty, setLifeLiberty] = useState(DEFAULTS.lifeLiberty);
  const [lifeLibertyReason, setLifeLibertyReason] = useState(DEFAULTS.lifeLibertyReason);
  const [wantsCertified, setWantsCertified] = useState(DEFAULTS.wantsCertified);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPassportRti({
        applicantName,
        address,
        phone,
        email,
        passportOffice,
        fileNumber,
        applicationDate,
        applicationType,
        stageId,
        queryIds,
        filedDate,
        isBpl,
        lifeLiberty,
        lifeLibertyReason,
        wantsCertified,
      }),
    [
      applicantName,
      address,
      phone,
      email,
      passportOffice,
      fileNumber,
      applicationDate,
      applicationType,
      stageId,
      queryIds,
      filedDate,
      isBpl,
      lifeLiberty,
      lifeLibertyReason,
      wantsCertified,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleQuery = (id) => {
    setQueryIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyApplication = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.application);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setApplicantName(DEFAULTS.applicantName);
    setAddress(DEFAULTS.address);
    setPhone(DEFAULTS.phone);
    setEmail(DEFAULTS.email);
    setPassportOffice(DEFAULTS.passportOffice);
    setFileNumber(DEFAULTS.fileNumber);
    setApplicationType(DEFAULTS.applicationType);
    setApplicationDate(DEFAULTS.applicationDate);
    setStageId(DEFAULTS.stageId);
    setQueryIds(DEFAULTS.queryIds);
    setFiledDate(DEFAULTS.filedDate);
    setIsBpl(DEFAULTS.isBpl);
    setLifeLiberty(DEFAULTS.lifeLiberty);
    setLifeLibertyReason(DEFAULTS.lifeLibertyReason);
    setWantsCertified(DEFAULTS.wantsCertified);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          RTI drafting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          RTI Application Draft for Passport Status
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Ask the Regional Passport Office where your file actually is — which desk holds it, when
          the police verification went out and came back, and what reason is recorded for the delay.
          The draft carries the Section 7(1) reply date and every appeal deadline that follows.
        </p>
      </header>

      <section className={CARD} aria-labelledby="applicant-heading">
        <h2 id="applicant-heading" className="text-base font-semibold">
          Your details and the file
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-name">
              Your full name
            </label>
            <input
              id="rti-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={applicantName}
              onChange={(event) => setApplicantName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-office">
              Regional Passport Office
            </label>
            <input
              id="rti-office"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={passportOffice}
              onChange={(event) => setPassportOffice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-file">
              File or ARN number
            </label>
            <input
              id="rti-file"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fileNumber}
              onChange={(event) => setFileNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-type">
              Application type
            </label>
            <input
              id="rti-type"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={applicationType}
              onChange={(event) => setApplicationType(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-app-date">
              Passport application submitted on
            </label>
            <input
              id="rti-app-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={applicationDate}
              onChange={(event) => setApplicationDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-filed">
              RTI filed on
            </label>
            <input
              id="rti-filed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filedDate}
              onChange={(event) => setFiledDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-phone">
              Phone
            </label>
            <input
              id="rti-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rti-email">
              Email
            </label>
            <input
              id="rti-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rti-address">
              Postal address for the reply
            </label>
            <textarea
              id="rti-address"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rti-stage">
              Where the application appears to be stuck
            </label>
            <select
              id="rti-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stageId}
              onChange={(event) => setStageId(event.target.value)}
            >
              {STUCK_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Questions to include</legend>
          <div className="mt-2 grid gap-1">
            {OPTIONAL_QUERIES.map((query) => (
              <label
                key={query.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`rti-q-${query.id}`}
              >
                <input
                  id={`rti-q-${query.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={queryIds.includes(query.id)}
                  onChange={() => toggleQuery(query.id)}
                />
                {query.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rti-bpl">
            <input
              id="rti-bpl"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={isBpl}
              onChange={(event) => setIsBpl(event.target.checked)}
            />
            I hold a BPL card (fee exempt)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rti-certified">
            <input
              id="rti-certified"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={wantsCertified}
              onChange={(event) => setWantsCertified(event.target.checked)}
            />
            Ask for certified copies
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="rti-life">
            <input
              id="rti-life"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={lifeLiberty}
              onChange={(event) => setLifeLiberty(event.target.checked)}
            />
            This concerns life or liberty (48-hour reply)
          </label>
        </div>

        {lifeLiberty ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="rti-life-reason">
              State the life or liberty ground in one or two sentences
            </label>
            <textarea
              id="rti-life-reason"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={lifeLibertyReason}
              onChange={(event) => setLifeLibertyReason(event.target.value)}
            />
          </div>
        ) : null}
      </section>

      {hasError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Reply is due by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.timeline.replyDue.long}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.queryCount} questions · ${result.timeline.replyWindowText}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyApplication}
              disabled={hasError}
              aria-label="Copy the RTI application"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy application"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Transfer to the right authority by (Section 6(3))", hasError ? DASH : result.timeline.transferBy.long],
            ["Reply due (Section 7(1))", hasError ? DASH : result.timeline.replyDue.long],
            ["First appeal by (Section 19(1))", hasError ? DASH : result.timeline.firstAppealBy.long],
            ["Appellate authority must decide by", hasError ? DASH : result.timeline.faaDecisionDue.long],
            ["Outer limit with recorded reasons", hasError ? DASH : result.timeline.faaExtendedDue.long],
            ["Second appeal by (Section 19(3))", hasError ? DASH : result.timeline.secondAppealBy.long],
            ["Application fee", hasError ? DASH : isBpl ? "Nil (Section 7(5))" : `Rs ${APPLICATION_FEE_INR}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.timeline.appealAssumed ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Appeal dates assume you file the first appeal on the last permitted day. File earlier
            and every date after it moves earlier too.
          </p>
        ) : null}

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
          {hasError ? DASH : result.application}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. The fee is Rs {APPLICATION_FEE_INR} under Rule 3
        of the RTI Rules 2012 and nil for a BPL cardholder under Section 7(5). If the CPIO misses
        the deadline the information must be given free under Section 7(6), and Section 20(1)
        provides for a penalty of Rs {PENALTY_PER_DAY_INR} per day up to Rs {PENALTY_CAP_INR}.
        Police verification is done by the state police, so part of your request may have to be
        transferred under Section 6(3).
      </p>
    </main>
  );
}
