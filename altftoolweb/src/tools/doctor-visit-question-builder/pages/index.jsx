"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Stethoscope, Trash2 } from "lucide-react";

import {
  PRIORITIES,
  RED_FLAGS,
  SOCRATES_FIELDS,
  SUGGESTED_QUESTIONS,
  buildVisitBrief,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[72px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SOCRATES = {
  site: "Just below the breastbone",
  onset: "Came on gradually over a few days",
  onsetDate: "",
  character: "Burning",
  radiation: "Sometimes up into the throat",
  associations: "Belching, worse after coffee",
  timeCourse: "Worse at night, most days",
  exacerbating: "Coffee and spicy food make it worse; antacids help for about an hour",
  severity: "6",
};

const DEFAULT_QUESTIONS = [
  { id: "q1", text: "What is the most likely cause, and what else could it be?", priority: "must" },
  { id: "q2", text: "What test are you ordering, and what would change if it is positive?", priority: "must" },
  { id: "q3", text: "What side effects should make me stop this and call you?", priority: "must" },
  { id: "q4", text: "Do I need a follow-up, and who books it?", priority: "should" },
  { id: "q5", text: "Is there a cheaper or generic version?", priority: "nice" },
];

const DEFAULTS = {
  reason: "Burning pain in the upper abdomen for about three weeks",
  appointmentMinutes: "10",
  medicines: "Metformin 500 mg twice daily; antacid as needed",
  allergies: "None known",
  desiredOutcome: "Understand whether I need a test, and what to change in the meantime",
};

const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export default function ToolHome() {
  const [reason, setReason] = useState(DEFAULTS.reason);
  const [appointmentMinutes, setAppointmentMinutes] = useState(DEFAULTS.appointmentMinutes);
  const [appointmentDate, setAppointmentDate] = useState(todayIso);
  const [socrates, setSocrates] = useState(DEFAULT_SOCRATES);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [redFlags, setRedFlags] = useState([]);
  const [medicines, setMedicines] = useState(DEFAULTS.medicines);
  const [allergies, setAllergies] = useState(DEFAULTS.allergies);
  const [desiredOutcome, setDesiredOutcome] = useState(DEFAULTS.desiredOutcome);
  const [copied, setCopied] = useState(false);

  const setSocratesField = (key) => (event) => {
    const { value } = event.target;
    setSocrates((previous) => ({ ...previous, [key]: value }));
  };

  const updateQuestion = (id, key) => (event) => {
    const { value } = event.target;
    setQuestions((previous) => previous.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
  };

  const addQuestion = (text = "", priority = "should") => {
    setQuestions((previous) => {
      if (previous.length >= 15) return previous;
      const nextIndex =
        previous.reduce((max, q) => Math.max(max, Number(String(q.id).slice(1)) || 0), 0) + 1;
      return [...previous, { id: `q${nextIndex}`, text, priority }];
    });
  };

  const removeQuestion = (id) => {
    setQuestions((previous) => previous.filter((q) => q.id !== id));
  };

  const toggleFlag = (id) => {
    setRedFlags((previous) => (previous.includes(id) ? previous.filter((v) => v !== id) : [...previous, id]));
  };

  const brief = useMemo(
    () =>
      buildVisitBrief({
        reason,
        appointmentMinutes: Number(appointmentMinutes),
        appointmentDate,
        socrates,
        questions,
        redFlags,
        medicines,
        allergies,
        desiredOutcome,
      }),
    [reason, appointmentMinutes, appointmentDate, socrates, questions, redFlags, medicines, allergies, desiredOutcome],
  );

  const ok = !brief.error;

  const copyBrief = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(brief.briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setReason(DEFAULTS.reason);
    setAppointmentMinutes(DEFAULTS.appointmentMinutes);
    setAppointmentDate(todayIso());
    setSocrates(DEFAULT_SOCRATES);
    setQuestions(DEFAULT_QUESTIONS);
    setRedFlags([]);
    setMedicines(DEFAULTS.medicines);
    setAllergies(DEFAULTS.allergies);
    setDesiredOutcome(DEFAULTS.desiredOutcome);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          Health admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Doctor Visit Question Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer the SOCRATES symptom questions your clinician will ask anyway, rank what you need
          to know, and see how many questions realistically fit the slot you have been given.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The appointment</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="dv-reason">
              Reason for the visit, in one line
            </label>
            <input id="dv-reason" className={`mt-2 ${INPUT_CLASS}`} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="dv-minutes">
                Slot length (minutes)
              </label>
              <input
                id="dv-minutes"
                type="number"
                inputMode="numeric"
                min="1"
                max="120"
                step="1"
                className={`mt-2 ${INPUT_CLASS}`}
                value={appointmentMinutes}
                onChange={(e) => setAppointmentMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="dv-date">
                Appointment date
              </label>
              <input
                id="dv-date"
                type="date"
                className={`mt-2 ${INPUT_CLASS}`}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Symptom summary (SOCRATES)</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          The standard clinical history mnemonic. Filling this in ahead of time buys back minutes.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dv-onsetDate">
              Date the symptom started
            </label>
            <input
              id="dv-onsetDate"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={socrates.onsetDate}
              onChange={setSocratesField("onsetDate")}
            />
          </div>
          {SOCRATES_FIELDS.map((field) =>
            field.key === "severity" ? (
              <div key={field.key}>
                <label className={LABEL_CLASS} htmlFor={`dv-${field.key}`}>
                  {field.letter} — {field.label} (0–10)
                </label>
                <input
                  id={`dv-${field.key}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="10"
                  step="1"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={socrates.severity}
                  onChange={setSocratesField("severity")}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{field.prompt}</p>
              </div>
            ) : (
              <div key={field.key}>
                <label className={LABEL_CLASS} htmlFor={`dv-${field.key}`}>
                  {field.letter} — {field.label}
                </label>
                <textarea
                  id={`dv-${field.key}`}
                  className={`mt-2 ${TEXTAREA_CLASS}`}
                  value={socrates[field.key] || ""}
                  onChange={setSocratesField(field.key)}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{field.prompt}</p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your questions</h2>
          <button type="button" onClick={() => addQuestion()} className={GHOST_BTN} aria-label="Add a blank question">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add question
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {questions.map((question, index) => (
            <div key={question.id} className="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className={LABEL_CLASS} htmlFor={`dv-q-${question.id}`}>
                  Question {index + 1}
                </label>
                <input
                  id={`dv-q-${question.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={question.text}
                  onChange={updateQuestion(question.id, "text")}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className={LABEL_CLASS} htmlFor={`dv-p-${question.id}`}>
                    Priority
                  </label>
                  <select
                    id={`dv-p-${question.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={question.priority}
                    onChange={updateQuestion(question.id, "priority")}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  aria-label={`Remove question ${index + 1}`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Commonly forgotten — tap to add
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <button
              key={suggestion.text}
              type="button"
              onClick={() => addQuestion(suggestion.text, suggestion.priority)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anything from this list?</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          These are the symptoms public health services say should be assessed sooner rather than at
          a routine appointment.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {RED_FLAGS.map((flag) => (
            <label
              key={flag.id}
              htmlFor={`dv-flag-${flag.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <input
                id={`dv-flag-${flag.id}`}
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={redFlags.includes(flag.id)}
                onChange={() => toggleFlag(flag.id)}
              />
              <span>{flag.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Bring these too</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="dv-medicines">
              Current medicines and doses (including over the counter)
            </label>
            <textarea id="dv-medicines" className={`mt-2 ${TEXTAREA_CLASS}`} value={medicines} onChange={(e) => setMedicines(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dv-allergies">
              Allergies
            </label>
            <textarea id="dv-allergies" className={`mt-2 ${TEXTAREA_CLASS}`} value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dv-outcome">
              What you want out of today
            </label>
            <textarea id="dv-outcome" className={`mt-2 ${TEXTAREA_CLASS}`} value={desiredOutcome} onChange={(e) => setDesiredOutcome(e.target.value)} />
          </div>
        </div>
      </section>

      {brief.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {brief.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Questions that fit this slot
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{ok ? brief.capacity : DASH}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `About ${brief.questionMinutes.toFixed(0)} of your ${brief.appointmentMinutes} minutes are realistically yours`
                : "Fix the error above to see the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBrief}
              disabled={!ok}
              aria-label="Copy the appointment brief"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy brief"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the builder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Questions written", ok ? brief.totalQuestions : DASH],
            ["Must-ask questions", ok ? brief.mustCount : DASH],
            ["Asked today", ok ? brief.askToday.length : DASH],
            ["Held for next time", ok ? brief.deferred.length : DASH],
            ["Symptom summary filled in", ok ? `${brief.socratesAnswered} of 8 (${brief.socratesCompleteness}%)` : DASH],
            ["Severity", ok && brief.severity !== null ? `${brief.severity}/10` : DASH],
            ["How long it has been going on", ok && brief.durationText ? brief.durationText : DASH],
            ["Symptoms flagged for urgency", ok ? brief.flags.length : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && brief.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {brief.warnings.map((warning) => (
            <li
              key={warning}
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {ok && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ask these, in this order</h2>
          {brief.askToday.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              No questions written yet. Add one above or tap a suggestion.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {brief.askToday.map((question, index) => (
                <li key={question.id} className="flex gap-3 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)]">
                    {index + 1}
                  </span>
                  <span>{question.text}</span>
                </li>
              ))}
            </ol>
          )}

          {brief.deferred.length > 0 && (
            <>
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                If there is time, or next visit
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                {brief.deferred.map((question) => (
                  <li key={question.id}>{question.text}</li>
                ))}
              </ul>
            </>
          )}

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Before you leave, you should be able to answer
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {brief.askMe3.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </section>
      )}

      {ok && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Printable brief</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-[280px] whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-xs leading-5">
              {brief.briefText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This organises what you already know; it does not assess symptoms or
        suggest a diagnosis. If any symptom is severe, sudden or getting rapidly worse, seek urgent
        medical care rather than waiting for a booked appointment.
      </p>
    </main>
  );
}
