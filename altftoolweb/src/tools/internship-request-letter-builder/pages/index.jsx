"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  MAX_RECOMMENDED_WORDS,
  MIN_RECOMMENDED_WORDS,
  MODES,
  TONES,
  buildInternshipLetter,
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

const DEFAULTS = {
  fullName: "Aarav Sharma",
  course: "B.Tech Computer Science",
  yearOfStudy: "third year",
  institution: "VIT Vellore",
  company: "Zerodha",
  recipient: "Ms. Kavya Rao",
  role: "Backend Engineering Intern",
  team: "Payments",
  skills: "Python, PostgreSQL, Django",
  reason:
    "I have read your Kite Connect docs closely and built a paper-trading bot on top of them.",
  portfolio: "github.com/aaravs",
  contact: "+91 98765 43210",
  mode: "hybrid",
  tone: "professional",
  startDate: "2026-06-01",
  durationWeeks: "8",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildInternshipLetter(form), [form]);
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

  const fullText = failed ? "" : `Subject: ${result.subject}\n\n${result.body}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Internship outreach
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Internship Request Letter Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your course, skills and free dates into a subject line and a short application
          email that follows the standard business-letter order: purpose, evidence, availability,
          ask.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="irl-name">
              Your full name
            </label>
            <input id="irl-name" className={`mt-2 ${INPUT}`} value={form.fullName} onChange={setField("fullName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-company">
              Company / organisation
            </label>
            <input id="irl-company" className={`mt-2 ${INPUT}`} value={form.company} onChange={setField("company")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-course">
              Course or degree
            </label>
            <input id="irl-course" className={`mt-2 ${INPUT}`} value={form.course} onChange={setField("course")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-year">
              Year of study
            </label>
            <input id="irl-year" className={`mt-2 ${INPUT}`} value={form.yearOfStudy} onChange={setField("yearOfStudy")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-institution">
              College / university
            </label>
            <input id="irl-institution" className={`mt-2 ${INPUT}`} value={form.institution} onChange={setField("institution")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-recipient">
              Recipient name (optional)
            </label>
            <input id="irl-recipient" className={`mt-2 ${INPUT}`} value={form.recipient} onChange={setField("recipient")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-role">
              Role you want
            </label>
            <input id="irl-role" className={`mt-2 ${INPUT}`} value={form.role} onChange={setField("role")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-team">
              Team or department (optional)
            </label>
            <input id="irl-team" className={`mt-2 ${INPUT}`} value={form.team} onChange={setField("team")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="irl-skills">
              Skills and tools (comma separated, up to 6)
            </label>
            <input id="irl-skills" className={`mt-2 ${INPUT}`} value={form.skills} onChange={setField("skills")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="irl-reason">
              Why this employer — one concrete line
            </label>
            <textarea id="irl-reason" rows={3} className={`mt-2 ${AREA}`} value={form.reason} onChange={setField("reason")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-start">
              Available from
            </label>
            <input id="irl-start" type="date" className={`mt-2 ${INPUT}`} value={form.startDate} onChange={setField("startDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-weeks">
              Duration (weeks)
            </label>
            <input
              id="irl-weeks"
              type="number"
              inputMode="numeric"
              min="1"
              max="52"
              className={`mt-2 ${INPUT}`}
              value={form.durationWeeks}
              onChange={setField("durationWeeks")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-mode">
              Work mode
            </label>
            <select id="irl-mode" className={`mt-2 ${INPUT}`} value={form.mode} onChange={setField("mode")}>
              {MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-tone">
              Tone
            </label>
            <select id="irl-tone" className={`mt-2 ${INPUT}`} value={form.tone} onChange={setField("tone")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-portfolio">
              Portfolio link (optional)
            </label>
            <input id="irl-portfolio" className={`mt-2 ${INPUT}`} value={form.portfolio} onChange={setField("portfolio")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="irl-contact">
              Phone or email (optional)
            </label>
            <input id="irl-contact" className={`mt-2 ${INPUT}`} value={form.contact} onChange={setField("contact")} />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {TONES.find((tone) => tone.id === form.tone)?.hint}
        </p>
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
              Letter strength
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.score}/${result.scoreMax}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to generate the letter."
                : `${result.wordCount} words · target ${MIN_RECOMMENDED_WORDS}-${MAX_RECOMMENDED_WORDS}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("all", fullText)}
              aria-label="Copy the subject line and letter"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "all" ? "Copied!" : "Copy result"}
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
            ["Availability", failed ? DASH : `${result.startLabel} to ${result.endLabel}`],
            ["Work mode", failed ? DASH : result.modeLabel],
            ["Tone", failed ? DASH : result.toneLabel],
            ["Body length", failed ? DASH : `${result.wordCount} words · ${result.charCount} characters`],
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Your letter</h2>
              <button
                type="button"
                onClick={() => copy("body", result.body)}
                aria-label="Copy only the letter body"
                className={GHOST_BTN}
              >
                {copied === "body" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "body" ? "Copied!" : "Copy body"}
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.body}
            </pre>
            {result.tooLong && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Over {MAX_RECOMMENDED_WORDS} words — trim the &quot;why this employer&quot; line.
              </p>
            )}
            {result.tooShort && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Under {MIN_RECOMMENDED_WORDS} words — add a specific reason or one more skill.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Checklist</h2>
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
                    <span className="sr-only">{item.ok ? " — done" : " — missing"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Read the draft aloud before sending and replace anything that is not literally true about
        you. A specific, checkable line about the employer&apos;s product beats any amount of
        polish.
      </p>
    </main>
  );
}
