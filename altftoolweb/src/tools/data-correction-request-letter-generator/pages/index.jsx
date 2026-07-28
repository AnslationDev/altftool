"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PencilLine, Plus, RotateCcw, Trash2, TriangleAlert } from "lucide-react";

import { DELIVERY_METHODS, REGIMES, buildCorrectionLetter } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm";
const DASH = "—";

const START_ROWS = [
  {
    key: 1,
    field: "Date of birth",
    incorrectValue: "2 April 1990",
    correctValue: "2 April 1991",
    evidence: "Passport copy attached",
  },
  {
    key: 2,
    field: "Registered address",
    incorrectValue: "12 Old Mill Lane",
    correctValue: "12 New Mill Lane",
    evidence: "Utility bill dated last month",
  },
];

const DEFAULTS = {
  fullName: "A. Sharma",
  postalAddress: "12 New Mill Lane, Pune 411001",
  email: "a.sharma@example.com",
  accountRef: "CU-9931",
  organisation: "Northbank Limited",
  regime: "gdpr",
  requestDate: "2026-07-28",
  includeRestriction: true,
  includeDownstream: true,
  deliveryMethod: "recorded",
};

export default function ToolHome() {
  const [fullName, setFullName] = useState(DEFAULTS.fullName);
  const [postalAddress, setPostalAddress] = useState(DEFAULTS.postalAddress);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [accountRef, setAccountRef] = useState(DEFAULTS.accountRef);
  const [organisation, setOrganisation] = useState(DEFAULTS.organisation);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [includeRestriction, setIncludeRestriction] = useState(DEFAULTS.includeRestriction);
  const [includeDownstream, setIncludeDownstream] = useState(DEFAULTS.includeDownstream);
  const [deliveryMethod, setDeliveryMethod] = useState(DEFAULTS.deliveryMethod);
  const [rows, setRows] = useState(START_ROWS);
  const [nextKey, setNextKey] = useState(START_ROWS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildCorrectionLetter({
        fullName,
        postalAddress,
        email,
        accountRef,
        organisation,
        regime,
        fields: rows,
        requestDate,
        includeRestriction,
        includeDownstream,
        deliveryMethod,
      }),
    [
      fullName,
      postalAddress,
      email,
      accountRef,
      organisation,
      regime,
      rows,
      requestDate,
      includeRestriction,
      includeDownstream,
      deliveryMethod,
    ],
  );

  const hasError = Boolean(result.error);

  const updateRow = (key, patch) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      { key: nextKey, field: "", incorrectValue: "", correctValue: "", evidence: "" },
    ]);
    setNextKey((value) => value + 1);
  };

  const removeRow = (key) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.key !== key)));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(`${result.subject}\n\n${result.letter}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFullName(DEFAULTS.fullName);
    setPostalAddress(DEFAULTS.postalAddress);
    setEmail(DEFAULTS.email);
    setAccountRef(DEFAULTS.accountRef);
    setOrganisation(DEFAULTS.organisation);
    setRegime(DEFAULTS.regime);
    setRequestDate(DEFAULTS.requestDate);
    setIncludeRestriction(DEFAULTS.includeRestriction);
    setIncludeDownstream(DEFAULTS.includeDownstream);
    setDeliveryMethod(DEFAULTS.deliveryMethod);
    setRows(START_ROWS);
    setNextKey(START_ROWS.length + 1);
    setCopied(false);
  };

  const textFields = [
    ["corr-name", "Your full name", fullName, setFullName, "text"],
    ["corr-org", "Organisation holding the data", organisation, setOrganisation, "text"],
    ["corr-address", "Your postal address", postalAddress, setPostalAddress, "text"],
    ["corr-email", "Your email address", email, setEmail, "email"],
    ["corr-ref", "Account or customer reference", accountRef, setAccountRef, "text"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          Data rights
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Data Correction Request Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List what is wrong, what it should say and how you can prove it. The letter cites the right
          article and works out the exact date the organisation has to reply by.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {textFields.map(([id, label, value, setter, type]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type={type}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="corr-date">
              Date you send the request
            </label>
            <input
              id="corr-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="corr-regime">
              Applicable law
            </label>
            <select
              id="corr-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              {REGIMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="corr-delivery">
              How you will send it
            </label>
            <select
              id="corr-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deliveryMethod}
              onChange={(event) => setDeliveryMethod(event.target.value)}
            >
              {DELIVERY_METHODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="corr-restriction">
            <input
              id="corr-restriction"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={includeRestriction}
              onChange={(event) => setIncludeRestriction(event.target.checked)}
            />
            <span>Ask for processing to be restricted while accuracy is checked</span>
          </label>
          <label className={CHECK_ROW} htmlFor="corr-downstream">
            <input
              id="corr-downstream"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={includeDownstream}
              onChange={(event) => setIncludeDownstream(event.target.checked)}
            />
            <span>Ask for everyone the data was shared with to be told</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">What is wrong</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN} aria-label="Add another correction">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add correction
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Correction {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  disabled={rows.length <= 1}
                  aria-label={`Remove correction ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`row-field-${row.key}`}>
                    Field
                  </label>
                  <input
                    id={`row-field-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.field}
                    onChange={(event) => updateRow(row.key, { field: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`row-wrong-${row.key}`}>
                    Value currently on file
                  </label>
                  <input
                    id={`row-wrong-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.incorrectValue}
                    onChange={(event) => updateRow(row.key, { incorrectValue: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`row-right-${row.key}`}>
                    Correct value
                  </label>
                  <input
                    id={`row-right-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.correctValue}
                    onChange={(event) => updateRow(row.key, { correctValue: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`row-evidence-${row.key}`}>
                    Evidence you can supply
                  </label>
                  <input
                    id={`row-evidence-${row.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.evidence}
                    onChange={(event) => updateRow(row.key, { evidence: event.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
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
              They must reply by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.deadlineDate}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Complete the form to generate the letter."
                : `${result.deadlineLabel} from the request date`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the correction request letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {[
            ["Right relied on", hasError ? DASH : result.right],
            ["Corrections listed", hasError ? DASH : String(result.stats.corrections)],
            ["Corrections with evidence", hasError ? DASH : String(result.stats.withEvidence)],
            [
              "Deadline if they take the extension",
              hasError ? DASH : result.extensionDate || "No extension available",
            ],
            ["Issues to check", hasError ? DASH : String(result.stats.warningCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Letter</h2>
          <p className="mt-2 text-sm font-medium">Subject: {result.subject}</p>
          <div className="mt-3 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {result.letter}
            </pre>
          </div>
        </section>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Before you send it
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Nothing you enter leaves your browser. If the
        organisation refuses or misses the deadline, you can complain to the relevant supervisory
        authority; consider taking advice before escalating further.
      </p>
    </main>
  );
}
