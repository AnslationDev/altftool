"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  auditWeddingSite,
  EXPOSURE_GROUPS,
  EXPOSURE_ITEMS,
  RECOMMENDED_RETENTION_DAYS,
  STAGE_LABELS,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const DEFAULT_EXPOSED = [
  "home-address",
  "venue-plus-time",
  "no-password",
  "search-indexed",
  "security-trivia",
];
const DEFAULT_RECORDS = "90";
const DEFAULT_DAYS = "180";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [exposed, setExposed] = useState(DEFAULT_EXPOSED);
  const [records, setRecords] = useState(DEFAULT_RECORDS);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(
    () =>
      auditWeddingSite({
        exposedIds: exposed,
        guestRecords: records.trim() === "" ? Number.NaN : Number(records),
        daysPublicAfter: days.trim() === "" ? Number.NaN : Number(days),
      }),
    [exposed, records, days],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setExposed((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    resetCopyState();
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Wedding website privacy audit",
      `Exposure score: ${result.score}/${result.maxScore} (${result.riskPercent}%)`,
      `Rating: ${result.bandLabel} — ${result.bandAdvice}`,
      `Details public: ${result.exposedCount} of ${result.totalItems} (${result.criticalCount} critical)`,
      `Guest records at risk: ${NUM.format(result.recordsAtRisk)}`,
      result.retentionAdvice,
      "",
      "Cleanup plan:",
    ];
    result.actions.forEach((item, index) => {
      lines.push(`${index + 1}. [${STAGE_LABELS[item.when]}] ${item.label}`);
      lines.push(`   ${item.fix}`);
    });
    if (result.actions.length === 0) lines.push("Nothing flagged.");
    return lines.join("\n");
  }, [hasError, result]);

  const copyResult = () => copyToClipboard("plan", summary, { label: "Privacy audit and cleanup plan" });

  const reset = () => {
    if (
      !window.confirm(
        "Reset the audit? This clears every ticked exposure item and puts the guest-record and days-online fields back to their defaults.",
      )
    ) {
      return;
    }
    setExposed(DEFAULT_EXPOSED);
    setRecords(DEFAULT_RECORDS);
    setDays(DEFAULT_DAYS);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Event privacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Wedding Website Privacy Cleanup
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick everything currently visible on your public wedding or event page. You get an
          exposure score, the items that matter most, and a ranked cleanup plan. Nothing you enter
          leaves this browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What is on the page right now?</h2>
        <div className="mt-4 space-y-6">
          {EXPOSURE_GROUPS.map((group) => (
            <fieldset key={group.id} className="border-0 p-0">
              <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {group.label}
              </legend>
              <div className="mt-2 space-y-2">
                {EXPOSURE_ITEMS.filter((item) => item.group === group.id).map((item) => {
                  const checked = exposed.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      htmlFor={`ww-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`ww-${item.id}`}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(item.id)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.why}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-records">
              Guest records stored in the RSVP form
            </label>
            <input
              id="ww-records"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={records}
              onChange={(event) => {
                setRecords(event.target.value);
                resetCopyState();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ww-days">
              Days the page stays online after the event
            </label>
            <input
              id="ww-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={days}
              onChange={(event) => {
                setDays(event.target.value);
                resetCopyState();
              }}
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
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Exposure score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.riskPercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.bandLabel} — ${result.bandAdvice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Copy is the safe, non-destructive action, so it gets the
                visually prominent primary style; Reset is destructive and is
                de-emphasized as a ghost button (see finding 2). */}
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("plan") ? "Copied the privacy audit and cleanup plan" : "Copy the privacy audit and cleanup plan"}
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {isCopied("plan") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("plan") ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the audit to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Severity points", hasError ? DASH : `${result.score} of ${result.maxScore}`],
            [
              "Details currently public",
              hasError ? DASH : `${result.exposedCount} of ${result.totalItems}`,
            ],
            ["Critical items to fix first", hasError ? DASH : String(result.criticalCount)],
            ["Guest records at risk", hasError ? DASH : NUM.format(result.recordsAtRisk)],
            [
              "Data retention",
              hasError
                ? DASH
                : result.retentionFlagged
                  ? `${result.retentionOverBy} days past the ${RECOMMENDED_RETENTION_DAYS}-day mark`
                  : `Within the ${RECOMMENDED_RETENTION_DAYS}-day guideline`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.retentionAdvice}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where the exposure sits</h2>
          <ul className="mt-3 space-y-3">
            {result.byGroup.map((group) => (
              <li key={group.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{group.label}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {group.exposed}/{group.total} public
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${group.label}: ${group.percent}% of the possible exposure in this group`}
                >
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${Math.max(0, Math.min(100, group.percent))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Your cleanup plan</h2>
          {result.actions.length === 0 ? (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              Nothing flagged. Re-run this after a vendor, planner or family member edits the page.
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {result.actions.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                      {STAGE_LABELS[item.when]}
                    </span>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      Severity {item.severity}/5
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.fix}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Severity ranks are a prioritisation aid. If you are
        collecting guest data in the EU or UK and are unsure of your obligations, speak to a data
        protection professional.
      </p>
    </main>
  );
}
