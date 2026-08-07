"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Check, Copy, Plus, RotateCcw, X } from "lucide-react";
import {
  AGENT_EXPOSURE_TIPS,
  DOC_TYPES,
  MAX_ITEMS,
  OUTCOMES,
  PMLA_RETENTION_YEARS,
  buildRegister,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: "r1", docType: "pan", collectedOn: "2019-04-10", outcome: "closed" },
  { id: "r2", docType: "aadhaar-full", collectedOn: "2026-06-15", outcome: "in-progress" },
  { id: "r3", docType: "salary-slip", collectedOn: "2026-03-02", outcome: "not-proceeded" },
];

const STATUS_LABEL = {
  prohibited: "Should not hold",
  overdue: "Delete now",
  retain: "Keep",
  active: "In use",
};

function statusClass(status) {
  if (status === "prohibited" || status === "overdue") {
    return "bg-[var(--danger-soft)] text-[var(--danger)]";
  }
  if (status === "active") return "bg-[var(--muted)] text-[var(--muted-foreground)]";
  return "bg-[var(--muted)] text-[var(--foreground)]";
}

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [today, setToday] = useState("");
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    setToday(local.toISOString().slice(0, 10));
  }, []);

  // Before the browser reports the date, assess against the newest collection date so the
  // register still renders a real result instead of blanks.
  const effectiveToday = useMemo(() => {
    if (today) return today;
    return rows.reduce((latest, row) => (row.collectedOn > latest ? row.collectedOn : latest), "1970-01-01");
  }, [today, rows]);

  const result = useMemo(
    () => buildRegister({ items: rows, today: effectiveToday }),
    [rows, effectiveToday],
  );
  const ok = !result.error;

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setCopied(false);
  };

  const addRow = () => {
    if (rows.length >= MAX_ITEMS) return;
    setRows((current) => [
      ...current,
      { id: `r${nextId}`, docType: "pan", collectedOn: effectiveToday, outcome: "in-progress" },
    ]);
    setNextId((value) => value + 1);
    setCopied(false);
  };

  const removeRow = (id) => {
    setRows((current) => current.filter((row) => row.id !== id));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Real Estate Agent Privacy Kit — document retention register",
      `Assessed on ${effectiveToday}`,
      `Documents held: ${result.total}`,
      `Action now: ${result.actionList.length} (${result.prohibited} should not be held, ${result.overdue} past retention)`,
      `Coming due within 90 days: ${result.dueSoon}`,
      `Exposure: ${Math.round(result.exposurePercent)}% (${result.band.label})`,
      "",
      "To action:",
      ...result.actionList.map(
        (row) => `- ${row.label} (collected ${row.collectedOn}): ${row.reason} ${row.guidance}`,
      ),
    ].join("\n");
  }, [ok, result, effectiveToday]);

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
    setRows(DEFAULT_ROWS);
    setNextId(4);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Property practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Real Estate Agent Privacy Kit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List the client documents sitting in your files and this works out which ones you are
          required to keep, which are past their purpose, and which should never have been collected
          in that form.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-full sm:w-56">
            <label className={LABEL_CLASS} htmlFor="reg-today">
              Assessment date
            </label>
            <input
              id="reg-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => {
                setToday(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <button type="button" onClick={addRow} className={PRIMARY_BTN} aria-label="Add a document row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add document
          </button>
        </div>

        <ul className="mt-5 space-y-4">
          {rows.map((row, index) => (
            <li key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`doc-${row.id}`}>
                    Document {index + 1}
                  </label>
                  <select
                    id={`doc-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.docType}
                    onChange={(event) => updateRow(row.id, { docType: event.target.value })}
                  >
                    {DOC_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`date-${row.id}`}>
                    Collected on
                  </label>
                  <input
                    id={`date-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.collectedOn}
                    onChange={(event) => updateRow(row.id, { collectedOn: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`out-${row.id}`}>
                    Outcome
                  </label>
                  <select
                    id={`out-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.outcome}
                    onChange={(event) => updateRow(row.id, { outcome: event.target.value })}
                  >
                    {OUTCOMES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className={GHOST_BTN}
                  aria-label={`Remove document ${index + 1}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {!ok && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Documents to action now
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.actionList.length : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${Math.round(result.exposurePercent)}% exposure — ${result.band.note}`
                : "Fix the register above to see the assessment."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the retention register summary"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy register"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the register" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Documents in the register", ok ? result.total : DASH],
            ["Should not be held in this form", ok ? result.prohibited : DASH],
            ["Past their retention period", ok ? result.overdue : DASH],
            ["Coming due within 90 days", ok ? result.dueSoon : DASH],
            ["Still in use on a live deal", ok ? result.active : DASH],
            [
              "Sensitivity exposed",
              ok ? `${result.exposurePoints} of ${result.maxExposure} points` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Register</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Document</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Collected</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Keep until</th>
                  <th scope="col" className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.outcomeLabel} · sensitivity {row.sensitivity}/5
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{row.collectedOn}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {row.keepUntil ?? DASH}
                      {row.daysLeft !== null && row.daysLeft >= 0 && (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.daysLeft} day{row.daysLeft === 1 ? "" : "s"} left
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.actionList.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.actionList.map((row) => (
                <li key={`act-${row.id}`} className="rounded-md border border-[var(--border)] p-3 text-sm">
                  <span className="font-semibold">{row.label}: </span>
                  {row.reason} {row.guidance}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your own exposure</h2>
        <dl className="mt-3 space-y-3 text-sm">
          {AGENT_EXPOSURE_TIPS.map(([title, detail]) => (
            <div key={title}>
              <dt className="font-semibold">{title}</dt>
              <dd className="text-[var(--muted-foreground)]">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Retention periods here follow the{" "}
        {PMLA_RETENTION_YEARS}-year record-keeping duty that applies to notified reporting entities
        under India's anti-money-laundering rules; other retention duties may apply to you under tax,
        stamp duty or state tenancy law. Confirm your own obligations with a qualified professional.
      </p>
    </main>
  );
}
