"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw } from "lucide-react";

import {
  AREA_TYPES,
  TRANSFER_REASONS,
  UTILITIES,
  buildUtilityTransfer,
  requiredDocuments,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULTS = {
  utilityId: "electricity",
  reasonId: "purchase",
  areaTypeId: "metro",
  applicationDate: "2026-01-15",
  requestedDays: 15,
  readyDocIds: ["form", "lastBill", "idProof", "saleDeed"],
  applicantName: "Vikram Desai",
  outgoingName: "Sunil Mehta",
  consumerNumber: "150012345678",
  premises: "Flat 12B, Palm Court, Andheri West, Mumbai 400053",
  providerName: "Adani Electricity Mumbai Limited",
};

export default function ToolHome() {
  const [utilityId, setUtilityId] = useState(DEFAULTS.utilityId);
  const [reasonId, setReasonId] = useState(DEFAULTS.reasonId);
  const [areaTypeId, setAreaTypeId] = useState(DEFAULTS.areaTypeId);
  const [applicationDate, setApplicationDate] = useState(DEFAULTS.applicationDate);
  const [requestedDays, setRequestedDays] = useState(String(DEFAULTS.requestedDays));
  const [readyDocIds, setReadyDocIds] = useState(DEFAULTS.readyDocIds);
  const [applicantName, setApplicantName] = useState(DEFAULTS.applicantName);
  const [outgoingName, setOutgoingName] = useState(DEFAULTS.outgoingName);
  const [consumerNumber, setConsumerNumber] = useState(DEFAULTS.consumerNumber);
  const [premises, setPremises] = useState(DEFAULTS.premises);
  const [providerName, setProviderName] = useState(DEFAULTS.providerName);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildUtilityTransfer({
        utilityId,
        reasonId,
        areaTypeId,
        applicationDate,
        requestedDays: Number(requestedDays),
        readyDocIds,
        applicantName,
        outgoingName,
        consumerNumber,
        premises,
        providerName,
      }),
    [
      utilityId,
      reasonId,
      areaTypeId,
      applicationDate,
      requestedDays,
      readyDocIds,
      applicantName,
      outgoingName,
      consumerNumber,
      premises,
      providerName,
    ],
  );

  const hasError = Boolean(result.error);
  const utility = UTILITIES.find((u) => u.id === utilityId);
  const docs = requiredDocuments(utilityId, reasonId);

  const changeScope = (nextUtilityId, nextReasonId) => {
    const stillNeeded = new Set(requiredDocuments(nextUtilityId, nextReasonId).map((doc) => doc.id));
    setUtilityId(nextUtilityId);
    setReasonId(nextReasonId);
    setReadyDocIds(readyDocIds.filter((id) => stillNeeded.has(id)));
  };

  const toggleDoc = (id) => {
    setReadyDocIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyLetter = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setUtilityId(DEFAULTS.utilityId);
    setReasonId(DEFAULTS.reasonId);
    setAreaTypeId(DEFAULTS.areaTypeId);
    setApplicationDate(DEFAULTS.applicationDate);
    setRequestedDays(String(DEFAULTS.requestedDays));
    setReadyDocIds(DEFAULTS.readyDocIds);
    setApplicantName(DEFAULTS.applicantName);
    setOutgoingName(DEFAULTS.outgoingName);
    setConsumerNumber(DEFAULTS.consumerNumber);
    setPremises(DEFAULTS.premises);
    setProviderName(DEFAULTS.providerName);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Tenancy Notices
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Utility Transfer Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Builds the document checklist for an electricity, gas, water or broadband transfer, applies
          the statutory timeline where one exists, and drafts the application with a date the
          transfer should be completed by.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-utility">
              Utility
            </label>
            <select
              id="ut-utility"
              className={`mt-2 ${INPUT_CLASS}`}
              value={utilityId}
              onChange={(event) => changeScope(event.target.value, reasonId)}
            >
              {UTILITIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-reason">
              Why the connection is changing hands
            </label>
            <select
              id="ut-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reasonId}
              onChange={(event) => changeScope(utilityId, event.target.value)}
            >
              {TRANSFER_REASONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {utility?.statutory ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ut-area">
                Type of area
              </label>
              <select
                id="ut-area"
                className={`mt-2 ${INPUT_CLASS}`}
                value={areaTypeId}
                onChange={(event) => setAreaTypeId(event.target.value)}
              >
                {AREA_TYPES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label} — {option.prescribedDays} days
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="ut-days">
                Completion requested within (days)
              </label>
              <input
                id="ut-days"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                min="3"
                max="90"
                step="1"
                inputMode="numeric"
                value={requestedDays}
                onChange={(event) => setRequestedDays(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-date">
              Date of application
            </label>
            <input
              id="ut-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={applicationDate}
              onChange={(event) => setApplicationDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-consumer">
              Consumer number on the bill
            </label>
            <input
              id="ut-consumer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={consumerNumber}
              onChange={(event) => setConsumerNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-applicant">
              Incoming consumer (your name)
            </label>
            <input
              id="ut-applicant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={applicantName}
              onChange={(event) => setApplicantName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ut-outgoing">
              Name currently on the connection
            </label>
            <input
              id="ut-outgoing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={outgoingName}
              onChange={(event) => setOutgoingName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ut-provider">
              Utility company or office
            </label>
            <input
              id="ut-provider"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={providerName}
              onChange={(event) => setProviderName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ut-premises">
              Address of the premises
            </label>
            <input
              id="ut-premises"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={premises}
              onChange={(event) => setPremises(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Documents already in hand</legend>
          <div className="mt-2 grid gap-1">
            {docs.map((doc) => (
              <label
                key={doc.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`ut-doc-${doc.id}`}
              >
                <input
                  id={`ut-doc-${doc.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={readyDocIds.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                />
                {doc.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Transfer expected by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.expectedByLong}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.statutory
                  ? `${result.days} days — statutory cap for this area`
                  : `${result.days} days — the period requested`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the transfer application"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Documents ready</dt>
            <dd className="mt-1 text-lg font-semibold">
              {hasError
                ? DASH
                : `${result.readyCount} / ${result.documents.length} (${result.readinessPercent}%)`}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Still to collect</dt>
            <dd className="mt-1 leading-6">
              {hasError
                ? DASH
                : result.missing.length === 0
                  ? "Nothing — the file is complete."
                  : result.missing.join("; ")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--muted-foreground)]">Basis for the timeline</dt>
            <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
              {hasError ? DASH : result.basis}
            </dd>
          </div>
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        {utility ? (
          <p className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Tip: {utility.extra}
          </p>
        ) : null}

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">Application</p>
          <p className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.letter}
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Electricity timelines follow Rule 4(3) of the
        Electricity (Rights of Consumers) Rules, 2020 and Section 43 of the Electricity Act 2003;
        state supply codes, municipal bye-laws and each provider&rsquo;s own forms, fees and deposits
        still apply. Confirm the current requirement with the utility before filing.
      </p>
    </main>
  );
}
