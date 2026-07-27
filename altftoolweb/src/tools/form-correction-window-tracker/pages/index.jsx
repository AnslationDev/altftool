"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Info, Lock, PencilLine, RotateCcw, TriangleAlert } from "lucide-react";

import { BODIES, FIELDS, addDays, buildCorrectionPlan } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const ANCHOR_TODAY = "2026-07-26";
const DEFAULT_FIELDS = ["name", "photo", "category"];

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const STATUS_TEXT = {
  upcoming: "text-[var(--primary)]",
  open: "text-[var(--success)]",
  urgent: "text-[var(--danger)]",
  closed: "text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [today, setToday] = useState(ANCHOR_TODAY);
  const [windowStart, setWindowStart] = useState(addDays(ANCHOR_TODAY, -1));
  const [windowEnd, setWindowEnd] = useState(addDays(ANCHOR_TODAY, 4));
  const [bodyId, setBodyId] = useState("nta");
  const [fieldIds, setFieldIds] = useState(DEFAULT_FIELDS);
  const [correctionsUsed, setCorrectionsUsed] = useState("0");
  const [movesToHigherFeeBand, setMovesToHigherFeeBand] = useState(false);
  const [copied, setCopied] = useState(false);

  // Move the calendar onto the visitor's clock after hydration, never during render.
  useEffect(() => {
    const now = todayISO();
    setToday(now);
    setWindowStart(addDays(now, -1));
    setWindowEnd(addDays(now, 4));
  }, []);

  const toggleField = (id) =>
    setFieldIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const plan = useMemo(
    () =>
      buildCorrectionPlan({
        bodyId,
        today,
        windowStart,
        windowEnd,
        fieldIds,
        correctionsUsed: correctionsUsed === "" ? 0 : Number(correctionsUsed),
        movesToHigherFeeBand,
      }),
    [bodyId, today, windowStart, windowEnd, fieldIds, correctionsUsed, movesToHigherFeeBand],
  );

  const hasError = Boolean(plan.error);

  const bigNumber = useMemo(() => {
    if (hasError) return DASH;
    if (plan.state.status === "upcoming") return plan.state.daysToOpen;
    if (plan.state.status === "closed") return 0;
    return plan.state.daysToClose;
  }, [hasError, plan]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Form Correction Window — ${plan.body.label}`,
      `Window: ${plan.state.windowStart} to ${plan.state.windowEnd} (${plan.state.lengthDays} days)`,
      `Status: ${plan.state.headline}`,
      `Next correction: ${plan.charge.reason}`,
      "",
      "Changes you want:",
    ];
    plan.verdicts.forEach((entry) =>
      lines.push(`- ${entry.label}: ${entry.locked ? "LOCKED" : "editable"} — ${entry.verdict}`),
    );
    if (plan.warnings.length > 0) {
      lines.push("", "Watch out:");
      plan.warnings.forEach((warning) => lines.push(`• ${warning}`));
    }
    return lines.join("\n");
  }, [hasError, plan]);

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
    const now = todayISO();
    setToday(now);
    setWindowStart(addDays(now, -1));
    setWindowEnd(addDays(now, 4));
    setBodyId("nta");
    setFieldIds(DEFAULT_FIELDS);
    setCorrectionsUsed("0");
    setMovesToHigherFeeBand(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          Correction windows
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Form Correction Window Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Not every field is editable, and not every body opens a window at all. Enter the dates
          from the correction notice and see what you can actually fix, and what it costs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fcw-body">
              Body conducting the exam
            </label>
            <select
              id="fcw-body"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bodyId}
              onChange={(event) => setBodyId(event.target.value)}
            >
              {BODIES.map((body) => (
                <option key={body.id} value={body.id}>
                  {body.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fcw-today">
              Today&apos;s date
            </label>
            <input
              id="fcw-today"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fcw-used">
              Corrections already made
            </label>
            <input
              id="fcw-used"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={correctionsUsed}
              onChange={(event) => setCorrectionsUsed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fcw-start">
              Window opens
            </label>
            <input
              id="fcw-start"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={windowStart}
              onChange={(event) => setWindowStart(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fcw-end">
              Window closes
            </label>
            <input
              id="fcw-end"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={windowEnd}
              onChange={(event) => setWindowEnd(event.target.value)}
            />
          </div>
        </div>

        <label className={`mt-4 ${CHECK_ROW}`} htmlFor="fcw-band">
          <input
            id="fcw-band"
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={movesToHigherFeeBand}
            onChange={(event) => setMovesToHigherFeeBand(event.target.checked)}
          />
          <span>This change moves me into a higher fee band</span>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What do you need to fix?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label key={field.id} className={CHECK_ROW} htmlFor={`fcw-x-${field.id}`}>
                <input
                  id={`fcw-x-${field.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={fieldIds.includes(field.id)}
                  onChange={() => toggleField(field.id)}
                />
                <span>{field.label}</span>
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
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError
                ? "Days"
                : plan.state.status === "upcoming"
                  ? "Days until the window opens"
                  : plan.state.status === "closed"
                    ? "Days left in the window"
                    : "Days left to make the change"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{bigNumber}</p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : STATUS_TEXT[plan.state.status]
              }`}
            >
              {hasError ? "Fix the dates above to see the countdown." : plan.state.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the correction plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Window length", hasError ? DASH : `${plan.state.lengthDays} day(s)`],
            ["Changes requested", hasError ? DASH : String(plan.verdicts.length)],
            ["Of those, not editable here", hasError ? DASH : String(plan.lockedCount)],
            [
              "Charge for the next correction",
              hasError ? DASH : plan.charge.allowed ? money(plan.charge.charge) : "Not available",
            ],
            ["Can you act today", hasError ? DASH : plan.canActNow ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6">
            {plan.charge.reason}
          </p>
        )}
      </section>

      {!hasError && plan.warnings.length > 0 && (
        <section className="mt-6 grid gap-3">
          {plan.warnings.map((warning) => (
            <p
              key={warning}
              role="alert"
              className="flex items-start gap-3 rounded-xl bg-[var(--danger-soft)] p-4 text-sm leading-6 text-[var(--danger)]"
            >
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{warning}</span>
            </p>
          ))}
        </section>
      )}

      {!hasError && plan.verdicts.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What you asked to change</h2>
          <ul className="mt-3 grid gap-3">
            {plan.verdicts.map((entry) => (
              <li
                key={entry.id}
                className={`flex items-start gap-3 rounded-lg p-3 ${
                  entry.locked
                    ? "bg-[var(--danger-soft)]"
                    : "border border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                {entry.locked ? (
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" aria-hidden="true" />
                ) : (
                  <PencilLine
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      entry.locked ? "text-[var(--danger)]" : "text-[var(--foreground)]"
                    }`}
                  >
                    {entry.label}
                  </p>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      entry.locked ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {entry.verdict}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && plan.verdicts.length === 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-[var(--muted-foreground)]">
            Tick the fields you need to fix above and each one will be marked editable or locked for
            this body.
          </p>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">How this body handles corrections</h2>
          <ul className="mt-3 grid gap-3">
            {plan.notes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <p className="min-w-0 text-sm leading-6">{note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Correction windows, charges and the list of editable fields are
        announced afresh for every cycle and sometimes in phases — the correction notice for your
        own exam is the authority.
      </p>
    </main>
  );
}
