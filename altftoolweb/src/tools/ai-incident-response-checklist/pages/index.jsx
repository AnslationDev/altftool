"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  INCIDENT_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
  buildIncidentChecklist,
  checklistToMarkdown,
  computeProgress,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  incidentTypeId: INCIDENT_TYPE_OPTIONS[0].id,
  severityId: SEVERITY_OPTIONS[1].id,
  userFacing: true,
  piiInvolved: false,
  thirdPartyModel: true,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [doneIds, setDoneIds] = useState([]);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };
  const setBool = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.checked }));
  };

  const result = useMemo(() => buildIncidentChecklist(form), [form]);
  const hasError = Boolean(result.error);

  // Item ids are stable across unrelated form changes (see lib.js). Rather
  // than wiping every checked box whenever the form changes, only stop
  // counting the ids that no longer correspond to an item in the *current*
  // checklist (e.g. the incident type changed and those analysis/containment
  // items no longer exist) — derived here so a stale id left in `doneIds`
  // never inflates the progress percentage, without needing an effect to
  // prune the array in place.
  const validItemIds = useMemo(() => {
    if (hasError) return new Set();
    return new Set(result.phases.flatMap((phase) => phase.items.map((item) => item.id)));
  }, [result, hasError]);

  const doneCount = useMemo(
    () => doneIds.filter((id) => validItemIds.has(id)).length,
    [doneIds, validItemIds],
  );

  const progress = hasError
    ? 0
    : computeProgress({ total: result.totalItems, done: doneCount });

  const toggleItem = (itemId) => {
    setDoneIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const copyResult = () => {
    if (hasError) return;
    copyToClipboard("checklist", checklistToMarkdown(result, doneIds), {
      label: "checklist",
    });
  };

  const reset = () => {
    setForm(DEFAULTS);
    setDoneIds([]);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          AI Governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Incident Response Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A tailored checklist for harmful, leaked or manipulated AI output, structured on the
          NIST SP 800-61 incident lifecycle — preparation, detection &amp; analysis, containment
          and post-incident review.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ir-type">
              Incident type
            </label>
            <select
              id="ir-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.incidentTypeId}
              onChange={set("incidentTypeId")}
            >
              {INCIDENT_TYPE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ir-severity">
              Severity
            </label>
            <select
              id="ir-severity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.severityId}
              onChange={set("severityId")}
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ir-user">
            <input
              id="ir-user"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.userFacing}
              onChange={setBool("userFacing")}
            />
            Users saw the output
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ir-pii">
            <input
              id="ir-pii"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.piiInvolved}
              onChange={setBool("piiInvolved")}
            />
            Personal data involved
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ir-vendor">
            <input
              id="ir-vendor"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.thirdPartyModel}
              onChange={setBool("thirdPartyModel")}
            />
            Third-party model / API
          </label>
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
              Checklist progress
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
            >
              {hasError ? DASH : `${NUM.format(progress)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the checklist."
                : `${NUM.format(doneCount)} of ${NUM.format(result.totalItems)} steps done · ${result.severityLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={
                isCopied("checklist")
                  ? "Copied the checklist as Markdown"
                  : "Copy the checklist as Markdown"
              }
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("checklist") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("checklist") ? "Copied!" : "Copy as Markdown"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist and inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>

        {hasError ? (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <div className="mt-5 space-y-6">
            {result.phases.map((phase) => (
              <div key={phase.id}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {phase.label}
                </h2>
                <ul className="mt-2 space-y-1">
                  {phase.items.map((item) => (
                    <li key={item.id}>
                      <label
                        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm leading-6 hover:bg-[var(--muted)]"
                        htmlFor={`ir-${item.id}`}
                      >
                        <input
                          id={`ir-${item.id}`}
                          type="checkbox"
                          className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                          checked={doneIds.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                        <span
                          className={
                            doneIds.includes(item.id)
                              ? "text-[var(--muted-foreground)] line-through"
                              : ""
                          }
                        >
                          {item.text}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Breach-notification duties (such as the 72-hour
        clock under GDPR Article 33) depend on jurisdiction and facts — involve your legal and
        privacy teams for any incident touching personal data.
      </p>
    </main>
  );
}
