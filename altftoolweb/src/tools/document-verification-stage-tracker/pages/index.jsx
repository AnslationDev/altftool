"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck, RotateCcw } from "lucide-react";

import { STANDARD_DOCUMENTS, STATUS_OPTIONS, summarizeDV } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const buildDefaultItems = () =>
  STANDARD_DOCUMENTS.map((doc) => ({
    ...doc,
    applicable: !doc.conditional,
    status: "pending",
  }));

export default function ToolHome() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState(buildDefaultItems);
  const [dvDate, setDvDate] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => summarizeDV({ items, dvDate, today }),
    [items, dvDate, today],
  );
  const hasError = Boolean(result.error);

  const setStatus = (id, status) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const toggleApplicable = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, applicable: !item.applicable } : item,
      ),
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Document verification readiness",
      `Ready: ${result.ready} of ${result.applicable} applicable documents (${result.readinessPercent}%)`,
      result.dvDateSet ? `DV date: ${dvDate} (${result.daysLeft} days away)` : "DV date: not set",
      result.pendingCritical.length > 0
        ? `Critical gaps: ${result.pendingCritical.map((i) => i.label).join("; ")}`
        : "No critical gaps.",
      `Verdict: ${result.verdict}`,
    ].join("\n");
  }, [hasError, result, dvDate]);

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
    setItems(buildDefaultItems());
    setDvDate("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCheck className="h-4 w-4" aria-hidden="true" />
          Exam calendars
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Document Verification Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The standard DV document list used across Indian government recruitment, with status
          tracking and days-to-DV. Critical documents — the ones whose absence stops verification —
          are flagged first.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dvt-date">
              DV appointment date (optional)
            </label>
            <input
              id="dvt-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dvDate}
              onChange={(event) => setDvDate(event.target.value)}
            />
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 ${
                item.applicable ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {item.label}
                    {item.critical ? (
                      <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        Critical
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{item.note}</p>
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  htmlFor={`dvt-app-${item.id}`}
                >
                  <input
                    id={`dvt-app-${item.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={item.applicable}
                    onChange={() => toggleApplicable(item.id)}
                  />
                  Applies to me
                </label>
                {item.applicable ? (
                  <div>
                    <label className="sr-only" htmlFor={`dvt-status-${item.id}`}>
                      Status for {item.label}
                    </label>
                    <select
                      id={`dvt-status-${item.id}`}
                      className={INPUT_CLASS}
                      value={item.status}
                      onChange={(event) => setStatus(item.id, event.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
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
              Readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.readinessPercent}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the checklist above to see readiness." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the DV readiness summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Documents ready</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.ready} of ${result.applicable}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Not yet arranged</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.pending}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Needing correction / reissue</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.reissue}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Days to DV</dt>
            <dd className="text-right font-semibold">
              {hasError || !result.dvDateSet
                ? DASH
                : result.dvPassed
                  ? "Date has passed"
                  : `${result.daysLeft} days`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Photocopy sets to carry</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.photocopySets} self-attested sets + originals`}
            </dd>
          </div>
        </dl>

        {!hasError && result.pendingCritical.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.pendingCritical.map((item) => (
              <li
                key={item.id}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                Critical and not ready: {item.label}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The list mirrors common DV notices but your board's own call letter overrides it — always
        reconcile against the annexures named there. Certificate formats and validity windows
        (EWS, OBC-NCL) are set by the recruiting body's notice.
      </p>
    </main>
  );
}
