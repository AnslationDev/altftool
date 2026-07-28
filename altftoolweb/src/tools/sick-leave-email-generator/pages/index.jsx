"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, RotateCcw } from "lucide-react";

import {
  AVAILABILITY,
  IDEAL_WORD_MAX,
  IDEAL_WORD_MIN,
  SUBJECT_STYLES,
  TONES,
  buildSickEmail,
} from "../lib";

const DEFAULTS = {
  senderName: "R Menon",
  managerName: "Priya",
  toneId: "plain",
  availabilityId: "urgent",
  subjectStyleId: "standard",
  from: "2026-08-06",
  to: "2026-08-07",
  returnDate: "",
  handover: "Kabir Shah",
  urgentItems: "",
  contactNumber: "",
  attachCertificate: false,
  mentionDoctor: false,
};

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_LABEL =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedField, setCopiedField] = useState("");

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => buildSickEmail(form), [form]);

  const copy = async (field, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 1500);
    } catch {
      setCopiedField("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopiedField("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Sick note
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sick Leave Email Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three facts make a good sick note: the dates, the day you expect to be back, and who is
          covering. This writes those into a short email, works out the return date from the next
          working day, and warns you when the note starts over-explaining.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="se-name">
              Your name
            </label>
            <input
              id="se-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.senderName}
              onChange={(event) => setField("senderName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-manager">
              Manager&apos;s first name (optional)
            </label>
            <input
              id="se-manager"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.managerName}
              onChange={(event) => setField("managerName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-from">
              First day off
            </label>
            <input
              id="se-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.from}
              onChange={(event) => setField("from", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-to">
              Last day off
            </label>
            <input
              id="se-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.to}
              onChange={(event) => setField("to", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-return">
              Expected return (blank = next working day)
            </label>
            <input
              id="se-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.returnDate}
              onChange={(event) => setField("returnDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-tone">
              Tone
            </label>
            <select
              id="se-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.toneId}
              onChange={(event) => setField("toneId", event.target.value)}
            >
              {TONES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-availability">
              How reachable will you be
            </label>
            <select
              id="se-availability"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.availabilityId}
              onChange={(event) => setField("availabilityId", event.target.value)}
            >
              {AVAILABILITY.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-subject">
              Subject line style
            </label>
            <select
              id="se-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subjectStyleId}
              onChange={(event) => setField("subjectStyleId", event.target.value)}
            >
              {SUBJECT_STYLES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-handover">
              Who is covering (optional)
            </label>
            <input
              id="se-handover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.handover}
              onChange={(event) => setField("handover", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="se-contact">
              Contact number (optional)
            </label>
            <input
              id="se-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contactNumber}
              onChange={(event) => setField("contactNumber", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="se-urgent">
              Anything that genuinely cannot wait (optional)
            </label>
            <input
              id="se-urgent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="the Thursday client report"
              value={form.urgentItems}
              onChange={(event) => setField("urgentItems", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="se-cert" className={CHECK_LABEL}>
            <input
              id="se-cert"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.attachCertificate}
              onChange={(event) => setField("attachCertificate", event.target.checked)}
            />
            Certificate attached
          </label>
          <label htmlFor="se-doctor" className={CHECK_LABEL}>
            <input
              id="se-doctor"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.mentionDoctor}
              onChange={(event) => setField("mentionDoctor", event.target.checked)}
            />
            Mention doctor advised rest
          </label>
          <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Words in the email
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Length verdict", "Days off", "Expected return", "Subject line"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Words in the email
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{result.wordCount}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Target {IDEAL_WORD_MIN}-{IDEAL_WORD_MAX} words · {result.brevity.band}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy("subject", result.subject)}
                  aria-label="Copy the subject line"
                  className={GHOST_BTN}
                >
                  {copiedField === "subject" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copiedField === "subject" ? "Copied!" : "Copy subject"}
                </button>
                <button
                  type="button"
                  onClick={() => copy("email", result.email)}
                  aria-label="Copy the full sick leave email"
                  className={GHOST_BTN}
                >
                  {copiedField === "email" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copiedField === "email" ? "Copied!" : "Copy email"}
                </button>
              </div>
            </div>

            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm" role="status">
              {result.brevity.message}
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Days off (calendar)", String(result.period.calendarDays)],
                ["Working days missed", String(result.period.workingDays)],
                [
                  "Expected return",
                  `${result.returnDate.long}${result.autoReturn ? " (next working day)" : ""}`,
                ],
                ["Subject line", result.subject],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Your email</h2>
              <button type="button" onClick={() => copy("email", result.email)} className={PRIMARY_BTN}>
                {copiedField === "email" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copiedField === "email" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.email}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              Checklist ({result.completedItems} of {result.totalItems})
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.checklist.map((entry) => (
                <li key={entry.item} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      entry.done
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-[var(--border)] text-[var(--muted-foreground)]"
                    }`}
                    aria-hidden="true"
                  >
                    {entry.done ? "✓" : ""}
                  </span>
                  <span className={entry.done ? "" : "text-[var(--muted-foreground)]"}>{entry.item}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The email never describes symptoms, because in most workplaces you are not required to give
        your line manager medical detail — a certificate goes to HR if one is asked for. Sick leave
        entitlement and certificate rules come from your employer&apos;s policy and the local Shops
        and Establishments Act, so check your handbook. This is informational, not medical or legal
        advice.
      </p>
    </main>
  );
}
