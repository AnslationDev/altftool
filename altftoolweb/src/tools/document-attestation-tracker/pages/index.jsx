"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Stamp, Trash2 } from "lucide-react";

import {
  DEFAULT_VALIDITY_MONTHS,
  EXPIRING_SOON_DAYS,
  MAX_DOCUMENTS,
  STATUS,
  evaluateAttestations,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_DOCS = [
  { name: "Class 10 marksheet", attestedOn: "", attestedBy: "", validityMonths: String(DEFAULT_VALIDITY_MONTHS) },
  { name: "Class 12 marksheet", attestedOn: "", attestedBy: "", validityMonths: String(DEFAULT_VALIDITY_MONTHS) },
  { name: "Transfer certificate", attestedOn: "", attestedBy: "", validityMonths: String(DEFAULT_VALIDITY_MONTHS) },
];

const DASH = "—";

const STATUS_STYLES = {
  [STATUS.VALID]: "text-[var(--success)]",
  [STATUS.EXPIRING]: "text-[var(--primary)]",
  [STATUS.EXPIRED]: "text-[var(--danger)]",
  [STATUS.PENDING]: "text-[var(--muted-foreground)]",
};

const STATUS_LABELS = {
  [STATUS.VALID]: "Valid",
  [STATUS.EXPIRING]: "Expiring soon",
  [STATUS.EXPIRED]: "Expired",
  [STATUS.PENDING]: "Pending",
};

function isoToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function ToolHome() {
  const [docs, setDocs] = useState(DEFAULT_DOCS);
  const [copied, setCopied] = useState(false);

  const todayIso = isoToday();

  const result = useMemo(
    () => evaluateAttestations({ documents: docs, todayIso }),
    [docs, todayIso],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Document attestation status — ${todayIso}`,
      `Ready: ${result.counts.valid} · Expiring soon: ${result.counts.expiring} · Expired: ${result.counts.expired} · Pending: ${result.counts.pending}`,
      "",
      ...result.rows.map(
        (row) =>
          `${row.name} — ${STATUS_LABELS[row.status]}${row.attestedBy ? ` (by ${row.attestedBy})` : ""}${row.expiresOn ? `, expires ${row.expiresOn}` : ""}. ${row.note}`,
      ),
    ].join("\n");
  }, [hasError, result, todayIso]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDocs(DEFAULT_DOCS);
    setCopied(false);
  };

  const updateDoc = (index, patch) => {
    setDocs((prev) => prev.map((doc, i) => (i === index ? { ...doc, ...patch } : doc)));
  };

  const readyCount = hasError ? null : result.counts.valid;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Stamp className="h-4 w-4" aria-hidden="true" />
          Document vault
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Document Attestation Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List each document, who attested it and when. The tracker computes every expiry date and
          flags anything expired or within {EXPIRING_SOON_DAYS} days of going stale. Data stays on
          this page.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-4">
          {docs.map((doc, index) => (
            <div
              key={index}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`dat-name-${index}`}>
                  Document {index + 1} name
                </label>
                <input
                  id={`dat-name-${index}`}
                  className={INPUT_CLASS}
                  type="text"
                  value={doc.name}
                  placeholder="Document name"
                  onChange={(event) => updateDoc(index, { name: event.target.value })}
                />
                {docs.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setDocs((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove document ${index + 1}`}
                    className={`${GHOST_BTN} shrink-0 px-3`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dat-date-${index}`}>
                    Attested on (blank = not yet)
                  </label>
                  <input
                    id={`dat-date-${index}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="date"
                    value={doc.attestedOn}
                    onChange={(event) => updateDoc(index, { attestedOn: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dat-by-${index}`}>
                    Attested by
                  </label>
                  <input
                    id={`dat-by-${index}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={doc.attestedBy}
                    placeholder="Self / notary / gazetted officer"
                    onChange={(event) => updateDoc(index, { attestedBy: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dat-validity-${index}`}>
                    Validity months (blank = none)
                  </label>
                  <input
                    id={`dat-validity-${index}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="120"
                    step="1"
                    value={doc.validityMonths}
                    onChange={(event) => updateDoc(index, { validityMonths: event.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {docs.length < MAX_DOCUMENTS ? (
          <button
            type="button"
            onClick={() =>
              setDocs((prev) => [
                ...prev,
                { name: "", attestedOn: "", attestedBy: "", validityMonths: String(DEFAULT_VALIDITY_MONTHS) },
              ])
            }
            className={`${GHOST_BTN} mt-3`}
            aria-label="Add another document"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add document
          </button>
        ) : null}
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
              Documents ready to submit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(readyCount)} / ${NUM.format(result.counts.total)}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see statuses."
                : result.allClear
                  ? "All documents attested and in validity — nothing needs action."
                  : result.nextAction
                    ? `Most urgent: ${result.nextAction.name} — ${result.nextAction.note}`
                    : "Review the list below."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the attestation status report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Valid", DASH],
                ["Expiring soon", DASH],
                ["Expired", DASH],
                ["Pending attestation", DASH],
              ]
            : [
                ["Valid", NUM.format(result.counts.valid)],
                [`Expiring within ${EXPIRING_SOON_DAYS} days`, NUM.format(result.counts.expiring)],
                ["Expired", NUM.format(result.counts.expired)],
                ["Pending attestation", NUM.format(result.counts.pending)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Status by document</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Document</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Expires</th>
                  <th scope="col" className="py-2 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3 font-semibold">
                      {row.name}
                      {row.attestedBy ? (
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          by {row.attestedBy}
                        </span>
                      ) : null}
                    </td>
                    <td className={`py-2 pr-3 font-semibold ${STATUS_STYLES[row.status]}`}>
                      {STATUS_LABELS[row.status]}
                    </td>
                    <td className="py-2 pr-3">{row.expiresOn ?? DASH}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Attestation validity is set by the receiving institution, not by law — 6 months is the
        common convention this tracker defaults to, but always use the window stated in your own
        notification. Nothing entered here leaves your browser.
      </p>
    </main>
  );
}
