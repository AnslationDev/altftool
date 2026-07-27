"use client";

import { useMemo, useState } from "react";
import { BellRing, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_LEAD_DAYS,
  EXAM_PRESETS,
  MONTH_NAMES,
  computeAlerts,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_ITEMS = [
  { name: "UPSC Civil Services (prelims notification)", month: 2, leadDays: DEFAULT_LEAD_DAYS },
  { name: "SSC CGL", month: 6, leadDays: DEFAULT_LEAD_DAYS },
  { name: "IBPS PO", month: 8, leadDays: DEFAULT_LEAD_DAYS },
];

export default function ToolHome() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [name, setName] = useState("");
  const [month, setMonth] = useState("1");
  const [leadDays, setLeadDays] = useState(String(DEFAULT_LEAD_DAYS));
  const [presetId, setPresetId] = useState("");
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeAlerts({ items, today }), [items, today]);
  const hasError = Boolean(result.error);

  const applyPreset = (id) => {
    setPresetId(id);
    const preset = EXAM_PRESETS.find((p) => p.id === id);
    if (preset) {
      setName(preset.name);
      setMonth(String(preset.month));
    }
  };

  const addExam = () => {
    const trimmed = name.trim();
    if (trimmed === "") {
      setFormError("Give the exam a name.");
      return;
    }
    const monthNum = Number(month);
    const lead = leadDays.trim() === "" ? DEFAULT_LEAD_DAYS : Number(leadDays);
    const probe = computeAlerts({
      items: [{ name: trimmed, month: monthNum, leadDays: lead }],
      today,
    });
    if (probe.error) {
      setFormError(probe.error);
      return;
    }
    setFormError("");
    setItems((prev) => [...prev, { name: trimmed, month: monthNum, leadDays: lead }]);
    setName("");
    setPresetId("");
  };

  const removeExam = (targetName) => {
    setItems((prev) => prev.filter((item) => item.name !== targetName));
  };

  const summary = useMemo(() => {
    if (hasError || result.alerts.length === 0) return "";
    return [
      "Exam notification alert plan",
      ...result.alerts.map(
        (a) =>
          `${a.name}: expected ${a.monthName} (${a.expectedDate}), set reminder ${a.reminderDate} (${
            a.reminderDue ? "reminder due NOW" : `in ${a.daysToReminder} days`
          })`,
      ),
    ].join("\n");
  }, [hasError, result]);

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
    setItems(DEFAULT_ITEMS);
    setName("");
    setMonth("1");
    setLeadDays(String(DEFAULT_LEAD_DAYS));
    setPresetId("");
    setFormError("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Exam calendars
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Notification Alert Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List the exams you follow and the month each notification usually drops. The planner
          anchors every alert to the 1st of that month and tells you when to set a reminder so the
          application window never catches you without documents.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Follow an exam</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nap-preset">
              Quick add (typical recent-cycle months)
            </label>
            <select
              id="nap-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              <option value="">Pick a preset…</option>
              {EXAM_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} — {MONTH_NAMES[preset.month - 1]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nap-name">
              Exam name
            </label>
            <input
              id="nap-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nap-month">
              Expected notification month
            </label>
            <select
              id="nap-month"
              className={`mt-2 ${INPUT_CLASS}`}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              {MONTH_NAMES.map((m, index) => (
                <option key={m} value={String(index + 1)}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nap-lead">
              Reminder lead (days before the month starts)
            </label>
            <input
              id="nap-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              value={leadDays}
              onChange={(event) => setLeadDays(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={addExam} className={`${PRIMARY_BTN} w-full`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add exam
            </button>
          </div>
        </div>
        {formError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formError}
          </p>
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
              Next expected notification
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !result.nextUp ? DASH : result.nextUp.expectedDate}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError || !result.nextUp
                ? "Add an exam above to see the schedule."
                : `${result.nextUp.name} — anchored to 1 ${result.nextUp.monthName}, ${result.nextUp.daysToNotification} days away.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError || result.alerts.length === 0}
              aria-label="Copy the alert plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the exam list to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Exam
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Expected
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Set reminder on
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Days away
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.alerts.map((alert) => (
                  <tr key={alert.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {alert.name}
                      {alert.reminderDue ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                          Prepare now
                        </span>
                      ) : null}
                      {alert.windowOpen ? (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
                          Month arrived
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3">
                      1 {alert.monthName} ({alert.expectedDate})
                    </td>
                    <td className="py-2 pr-3">{alert.reminderDate}</td>
                    <td className="py-2 pr-3 text-right">{alert.daysToNotification}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeExam(alert.name)}
                        aria-label={`Stop following ${alert.name}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--danger)] transition hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Preset months reflect recent cycles and do shift — always verify against the exam body's
        official calendar. Add the reminder dates above to your phone calendar; this page does not
        send notifications itself.
      </p>
    </main>
  );
}
