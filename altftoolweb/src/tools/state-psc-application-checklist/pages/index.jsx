"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CATEGORIES,
  COMMISSIONS,
  STAGES,
  addDays,
  buildStatePscChecklist,
  computeChecklistProgress,
} from "../lib";

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

/** Offsets used to seed a plausible cycle around whatever "today" is. */
const SEED_OFFSETS = {
  notification: -25,
  feeLast: 2,
  submitLast: 5,
  correctionStart: 10,
  correctionEnd: 17,
  examDate: 77,
};

const ANCHOR_TODAY = "2026-07-26";

function seedDates(today) {
  const out = {};
  Object.entries(SEED_OFFSETS).forEach(([id, offset]) => {
    out[id] = addDays(today, offset);
  });
  return out;
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const STATUS_STYLE = {
  passed: "text-[var(--muted-foreground)]",
  urgent: "text-[var(--danger)]",
  open: "text-[var(--success)]",
  unset: "text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [today, setToday] = useState(ANCHOR_TODAY);
  const [dates, setDates] = useState(() => seedDates(ANCHOR_TODAY));
  const [commissionId, setCommissionId] = useState("uppsc");
  const [categoryId, setCategoryId] = useState("ur");
  const [homeState, setHomeState] = useState(true);
  const [claimsEws, setClaimsEws] = useState(false);
  const [needsScribe, setNeedsScribe] = useState(false);
  const [doneIds, setDoneIds] = useState([]);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  // Seed the calendar from the visitor's own clock after hydration, never during render.
  useEffect(() => {
    const now = todayISO();
    setToday(now);
    setDates(seedDates(now));
  }, []);

  // Clear the "Copied!" timer on unmount so it never calls setState on a gone component.
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const setStageDate = (id, value) =>
    setDates((current) => ({ ...current, [id]: value }));

  const toggleDone = (id) =>
    setDoneIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildStatePscChecklist({
        commissionId,
        categoryId,
        homeState,
        claimsEws,
        needsScribe,
        today,
        dates,
      }),
    [commissionId, categoryId, homeState, claimsEws, needsScribe, today, dates],
  );

  const hasError = Boolean(result.error);

  const progress = useMemo(
    () => computeChecklistProgress(hasError ? [] : result.items, doneIds),
    [hasError, result, doneIds],
  );

  const groups = useMemo(() => {
    if (hasError) return [];
    const map = new Map();
    result.items.forEach((item) => {
      const key = item.group || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map, ([name, items]) => ({ name, items }));
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `State PSC Application Checklist — ${result.commission.label}`,
      `Category claimed: ${result.category.label} (${homeState ? "home state" : "another state"})`,
      `Today: ${today}`,
      result.timeline.next
        ? `Next deadline: ${result.timeline.next.label} on ${result.timeline.next.date}, ${result.timeline.next.daysLeft} day(s) away`
        : "No dated stage still ahead.",
      "",
      "Timeline:",
    ];
    result.timeline.stages.forEach((stage) => {
      lines.push(
        `${stage.label}: ${stage.date || "not set"}${
          stage.daysLeft === null ? "" : ` (${stage.daysLeft} days)`
        }`,
      );
    });
    lines.push("", "Checklist:");
    groups.forEach((group) => {
      lines.push(`-- ${group.name} --`);
      group.items.forEach((item) =>
        lines.push(`[${doneIds.includes(item.id) ? "x" : " "}] ${item.label}`),
      );
    });
    return lines.join("\n");
  }, [hasError, result, groups, doneIds, homeState, today]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copiedTimeoutRef.current = null;
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    const now = todayISO();
    setToday(now);
    setDates(seedDates(now));
    setCommissionId("uppsc");
    setCategoryId("ur");
    setHomeState(true);
    setClaimsEws(false);
    setNeedsScribe(false);
    setDoneIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          State commissions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          State PSC Application Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two last dates, not one — the fee window shuts before the form window. Enter the dates
          from the advertisement and see which one binds you next, alongside the certificates that
          commission will actually accept.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="psc-commission">
              Commission
            </label>
            <select
              id="psc-commission"
              className={`mt-2 ${INPUT_CLASS}`}
              value={commissionId}
              onChange={(event) => setCommissionId(event.target.value)}
            >
              {COMMISSIONS.map((commission) => (
                <option key={commission.id} value={commission.id}>
                  {commission.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="psc-category">
              Category claimed
            </label>
            <select
              id="psc-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="psc-today">
              Today&apos;s date
            </label>
            <input
              id="psc-today"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="psc-home">
            <input
              id="psc-home"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={homeState}
              onChange={(event) => setHomeState(event.target.checked)}
            />
            <span>My certificate is from this same state</span>
          </label>
          <label className={CHECK_ROW} htmlFor="psc-ews">
            <input
              id="psc-ews"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={claimsEws}
              onChange={(event) => setClaimsEws(event.target.checked)}
            />
            <span>Claiming EWS</span>
          </label>
          <label className={CHECK_ROW} htmlFor="psc-scribe">
            <input
              id="psc-scribe"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={needsScribe}
              onChange={(event) => setNeedsScribe(event.target.checked)}
            />
            <span>A scribe will be requested</span>
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Dates from the advertisement
          </legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {STAGES.map((stage) => (
              <div key={stage.id}>
                <label className="block text-sm font-medium" htmlFor={`psc-d-${stage.id}`}>
                  {stage.label}
                </label>
                <input
                  id={`psc-d-${stage.id}`}
                  type="date"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={dates[stage.id] || ""}
                  onChange={(event) => setStageDate(stage.id, event.target.value)}
                />
              </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days to the next deadline
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !result.timeline.next ? DASH : result.timeline.next.daysLeft}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the dates above to see the countdown."
                : result.timeline.next
                  ? `${result.timeline.next.label} — ${result.timeline.next.date}`
                  : "Every dated stage you entered is in the past."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the state PSC checklist and timeline"
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
            ["Commission", hasError ? DASH : result.commission.label],
            ["Category position", hasError ? DASH : homeState ? result.category.label : `${result.category.label} — treated as unreserved`],
            ["Language requirement", hasError ? DASH : result.commission.language],
            ["Checklist items done", hasError ? DASH : `${progress.done} of ${progress.total}`],
            ["Binding dates already passed", hasError ? DASH : String(result.timeline.missedBinding.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${progress.percent} percent of the checklist is done`}
            >
              <span
                className={`block h-full ${progress.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{progress.percent}% ready</p>
          </div>
        )}
      </section>

      {!hasError && result.alerts.length > 0 && (
        <section className="mt-6 grid gap-3">
          {result.alerts.map((alert) => (
            <p
              key={alert}
              role="alert"
              className="flex items-start gap-3 rounded-xl bg-[var(--danger-soft)] p-4 text-sm leading-6 text-[var(--danger)]"
            >
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{alert}</span>
            </p>
          ))}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Timeline</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3 font-semibold">Stage</th>
                  <th className="py-2 pr-3 font-semibold">Date</th>
                  <th className="py-2 font-semibold">Days</th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.stages.map((stage) => (
                  <tr key={stage.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3">
                      <span className="block font-semibold">{stage.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {stage.detail}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{stage.date || "not set"}</td>
                    <td className={`py-2.5 whitespace-nowrap font-semibold ${STATUS_STYLE[stage.status]}`}>
                      {stage.daysLeft === null
                        ? DASH
                        : stage.daysLeft < 0
                          ? `${Math.abs(stage.daysLeft)} ago`
                          : `${stage.daysLeft} left`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What trips people up at {result.commission.label}</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.notes.map((note) => (
              <li
                key={note}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError &&
        groups.map((group) => (
          <section
            key={group.name}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{group.name}</h2>
            <ul className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <label className={CHECK_ROW} htmlFor={`psc-i-${item.id}`}>
                    <input
                      id={`psc-i-${item.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={doneIds.includes(item.id)}
                      onChange={() => toggleDone(item.id)}
                    />
                    <span className="min-w-0">{item.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Dates, fees, age bands and certificate formats are set by each
        commission afresh in every cycle — the advertisement you are applying under is the
        authority, and a disputed category claim is a matter for a lawyer, not a checklist.
      </p>
    </main>
  );
}
