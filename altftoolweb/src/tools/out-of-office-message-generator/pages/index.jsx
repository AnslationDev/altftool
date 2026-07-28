"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlaneTakeoff, RotateCcw } from "lucide-react";

import {
  ACCESS_LEVELS,
  MAX_RECOMMENDED_CHARS,
  REASONS,
  TONES,
  buildOutOfOffice,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  name: "Priya Nair",
  startDate: "2026-08-10",
  endDate: "2026-08-21",
  tone: "standard",
  access: "none",
  reason: "annual",
  backupName: "Daniel Roy",
  backupEmail: "daniel.roy@example.com",
  escalation: "For billing questions, write to accounts@example.com.",
  holidays: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildOutOfOffice(form), [form]);
  const failed = Boolean(result.error);

  const copy = async (what, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
          Auto-reply
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Out of Office Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your dates and a backup contact. You get the auto-reply text, the number of working
          days you are away and the first working day you are actually back.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ooo-start">
              First day away
            </label>
            <input id="ooo-start" type="date" className={`mt-2 ${INPUT}`} value={form.startDate} onChange={setField("startDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ooo-end">
              Last day away
            </label>
            <input id="ooo-end" type="date" className={`mt-2 ${INPUT}`} value={form.endDate} onChange={setField("endDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ooo-name">
              Your name
            </label>
            <input id="ooo-name" className={`mt-2 ${INPUT}`} value={form.name} onChange={setField("name")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ooo-tone">
              Tone
            </label>
            <select id="ooo-tone" className={`mt-2 ${INPUT}`} value={form.tone} onChange={setField("tone")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ooo-access">
              Email access while away
            </label>
            <select id="ooo-access" className={`mt-2 ${INPUT}`} value={form.access} onChange={setField("access")}>
              {ACCESS_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ooo-reason">
              Reason shown in the reply
            </label>
            <select id="ooo-reason" className={`mt-2 ${INPUT}`} value={form.reason} onChange={setField("reason")}>
              {REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ooo-backup">
              Backup contact name
            </label>
            <input id="ooo-backup" className={`mt-2 ${INPUT}`} value={form.backupName} onChange={setField("backupName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ooo-backup-email">
              Backup contact email
            </label>
            <input id="ooo-backup-email" type="email" className={`mt-2 ${INPUT}`} value={form.backupEmail} onChange={setField("backupEmail")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ooo-escalation">
              Extra escalation line (optional)
            </label>
            <input id="ooo-escalation" className={`mt-2 ${INPUT}`} value={form.escalation} onChange={setField("escalation")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ooo-holidays">
              Public holidays inside the range (YYYY-MM-DD, space separated)
            </label>
            <textarea id="ooo-holidays" rows={2} className={`mt-2 ${AREA}`} value={form.holidays} onChange={setField("holidays")} />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Holidays are removed from the working-day count and pushed past your return date.
            </p>
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Working days away
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.workingDays}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the dates above." : `Back on ${result.returnLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("msg", result.message)}
              aria-label="Copy the out of office message"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "msg" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "msg" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Subject line", failed ? DASH : result.subject],
            ["Away", failed ? DASH : `${result.startLabel} to ${result.endLabel}`],
            ["Calendar days", failed ? DASH : String(result.calendarDays)],
            ["Weekend days inside the range", failed ? DASH : String(result.weekendDays)],
            ["Public holidays entered", failed ? DASH : String(result.holidayCount)],
            ["Message length", failed ? DASH : `${result.charCount} / ${MAX_RECOMMENDED_CHARS} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Auto-reply text</h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.message}
            </pre>
            {result.tooLong && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Over {MAX_RECOMMENDED_CHARS} characters — drop the escalation line or switch to the
                minimal tone.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Checks</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      item.ok
                        ? "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full bg-[var(--success)]"
                        : "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--border)] bg-[var(--muted)]"
                    }
                  />
                  <span className={item.ok ? "" : "text-[var(--muted-foreground)]"}>
                    {item.label}
                    <span className="sr-only">{item.ok ? " — passed" : " — not met"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ask your backup contact before naming them, and set the auto-reply to external senders only
        if your inbox holds client information. Working days here exclude Saturday and Sunday plus
        any holidays you list.
      </p>
    </main>
  );
}
