"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import { REVIEW_CYCLES, RISK_LEVELS, buildSopPrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  title: "Handle a customer refund request",
  scope: "Prepaid orders under INR 25,000 refunded within the 30-day window",
  ownerRole: "Support Manager",
  riskId: "medium",
  cycleId: "annual",
  effectiveDate: "2026-01-01",
  stepsText:
    "Support agent: Verify the order ID and payment method in the admin panel\nSupport agent: Confirm the refund window has not lapsed\nFinance: Approve any refund above INR 10,000\nSupport agent: Trigger the refund from the payments dashboard\nSupport agent: Record the outcome and reason code on the ticket",
  notes: "",
};

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [scope, setScope] = useState(DEFAULTS.scope);
  const [ownerRole, setOwnerRole] = useState(DEFAULTS.ownerRole);
  const [riskId, setRiskId] = useState(DEFAULTS.riskId);
  const [cycleId, setCycleId] = useState(DEFAULTS.cycleId);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [stepsText, setStepsText] = useState(DEFAULTS.stepsText);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSopPrompt({
        title,
        scope,
        ownerRole,
        riskId,
        cycleId,
        effectiveDate,
        stepsText,
        notes,
      }),
    [title, scope, ownerRole, riskId, cycleId, effectiveDate, stepsText, notes],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle(DEFAULTS.title);
    setScope(DEFAULTS.scope);
    setOwnerRole(DEFAULTS.ownerRole);
    setRiskId(DEFAULTS.riskId);
    setCycleId(DEFAULTS.cycleId);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setStepsText(DEFAULTS.stepsText);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Distinct roles found", DASH],
        ["Steps with no role prefix", DASH],
        ["Next review due", DASH],
        ["Verification level", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Distinct roles found",
          result.roleCount === 0 ? "none — add a \"Role: action\" prefix" : result.roles.join(", "),
        ],
        [
          "Steps with no role prefix",
          result.unassigned === 0 ? "0 — every step is owned" : NUM.format(result.unassigned),
        ],
        ["Next review due", `${result.nextReviewDate} (${result.cycle.label.toLowerCase()})`],
        ["Verification level", result.risk.label],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Operations
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SOP Document Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write your steps as &quot;Role: action&quot; and get a prompt for a full standard
          operating procedure — RACI table, control checks, records, escalation
          and the document-control header an audit will ask for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-title">
              Procedure title
            </label>
            <input
              id="sop-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-owner">
              Process owner (accountable role)
            </label>
            <input
              id="sop-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={ownerRole}
              onChange={(event) => setOwnerRole(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-risk">
              Risk level
            </label>
            <select
              id="sop-risk"
              className={`mt-2 ${INPUT_CLASS}`}
              value={riskId}
              onChange={(event) => setRiskId(event.target.value)}
            >
              {RISK_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-date">
              Effective date
            </label>
            <input
              id="sop-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sop-cycle">
              Review cycle
            </label>
            <select
              id="sop-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cycleId}
              onChange={(event) => setCycleId(event.target.value)}
            >
              {REVIEW_CYCLES.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-scope">
              Scope — what this covers and excludes
            </label>
            <input
              id="sop-scope"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-steps">
              Steps — one per line, as &quot;Role: action&quot;
            </label>
            <textarea
              id="sop-steps"
              className={`mt-2 ${AREA_CLASS}`}
              rows={7}
              value={stepsText}
              onChange={(event) => setStepsText(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sop-notes">
              Extra instruction (optional)
            </label>
            <input
              id="sop-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. output as a Markdown table; reference policy FIN-04"
            />
          </div>
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
              Procedure steps
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.stepCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.tooLong
                  ? "Long procedure — the prompt asks for named phases and a split suggestion."
                  : "Each becomes a full instruction with a responsible role and an acceptance check."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated SOP prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The header fields mirror the identification, review and approval
        expectations of ISO 9001:2015 clause 7.5, and the responsibilities table
        follows RACI with one Accountable role per step. This is a drafting aid,
        not a compliance sign-off — have the process owner and your quality or
        legal reviewer approve the finished SOP.
      </p>
    </main>
  );
}
