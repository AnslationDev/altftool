"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Check, Copy, RotateCcw } from "lucide-react";

import {
  LEVELS,
  MAX_SLOT_MINUTES,
  MIN_SLOT_MINUTES,
  ROUNDS,
  buildInterviewPrompt,
  getRound,
} from "../lib";

const INT = new Intl.NumberFormat("en-US");
const DEC1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  roleTitle: "Senior backend engineer",
  company: "a payments startup",
  roundId: "behavioural",
  levelId: "senior",
  slotMinutes: "45",
  focusAreas: "Leading a database migration\nHandling a production incident",
  weakSpots: "Talking about something I got wrong",
  jobDescription: "",
};

export default function ToolHome() {
  const [roleTitle, setRoleTitle] = useState(DEFAULTS.roleTitle);
  const [company, setCompany] = useState(DEFAULTS.company);
  const [roundId, setRoundId] = useState(DEFAULTS.roundId);
  const [levelId, setLevelId] = useState(DEFAULTS.levelId);
  const [slotMinutes, setSlotMinutes] = useState(DEFAULTS.slotMinutes);
  const [focusAreas, setFocusAreas] = useState(DEFAULTS.focusAreas);
  const [weakSpots, setWeakSpots] = useState(DEFAULTS.weakSpots);
  const [jobDescription, setJobDescription] = useState(DEFAULTS.jobDescription);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildInterviewPrompt({
        roleTitle,
        company,
        roundId,
        levelId,
        slotMinutes: slotMinutes.trim() === "" ? Number.NaN : Number(slotMinutes),
        focusAreas,
        weakSpots,
        jobDescription,
      }),
    [roleTitle, company, roundId, levelId, slotMinutes, focusAreas, weakSpots, jobDescription],
  );

  const copyResult = async () => {
    if (result.error || !result.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRoleTitle(DEFAULTS.roleTitle);
    setCompany(DEFAULTS.company);
    setRoundId(DEFAULTS.roundId);
    setLevelId(DEFAULTS.levelId);
    setSlotMinutes(DEFAULTS.slotMinutes);
    setFocusAreas(DEFAULTS.focusAreas);
    setWeakSpots(DEFAULTS.weakSpots);
    setJobDescription(DEFAULTS.jobDescription);
    setCopied(false);
  };

  const stat = (value) => (result.error ? DASH : value);
  const touch = (setter) => (event) => {
    setter(event.target.value);
    setCopied(false);
  };

  const chooseRound = (id) => {
    setRoundId(id);
    const round = getRound(id);
    if (round) setSlotMinutes(String(round.defaultMinutes));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
          Interview practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Interview Prep Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a roleplay prompt that makes an AI run the round properly: one question at a time,
          real follow-ups, and a score against the rubric that round is actually assessed on. The
          question count comes from the minutes left after introductions and your own questions.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Which round?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ROUNDS.map((item) => {
              const active = item.id === roundId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseRound(item.id)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="block font-semibold text-[var(--foreground)]">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-5">
                    Usually {item.defaultMinutes} min · ~{item.minutesPerQuestion} min per question
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="interview-role">
              Role you are interviewing for
            </label>
            <input id="interview-role" className={`mt-2 ${INPUT_CLASS}`} type="text" value={roleTitle} onChange={touch(setRoleTitle)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="interview-company">
              Company or team (optional)
            </label>
            <input id="interview-company" className={`mt-2 ${INPUT_CLASS}`} type="text" value={company} onChange={touch(setCompany)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="interview-level">
              Level
            </label>
            <select id="interview-level" className={`mt-2 ${INPUT_CLASS}`} value={levelId} onChange={touch(setLevelId)}>
              {LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="interview-minutes">
              Slot length (minutes)
            </label>
            <input
              id="interview-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SLOT_MINUTES}
              max={MAX_SLOT_MINUTES}
              step="5"
              value={slotMinutes}
              onChange={touch(setSlotMinutes)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="interview-focus">
              Topics to cover, one per line (optional)
            </label>
            <textarea id="interview-focus" className={`mt-2 ${TEXTAREA_CLASS}`} rows={3} value={focusAreas} onChange={touch(setFocusAreas)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="interview-weak">
              Things you want pushed on (optional)
            </label>
            <textarea id="interview-weak" className={`mt-2 ${TEXTAREA_CLASS}`} rows={3} value={weakSpots} onChange={touch(setWeakSpots)} />
          </div>
        </div>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="interview-jd">
            Paste the job description (optional)
          </label>
          <textarea id="interview-jd" className={`mt-2 ${TEXTAREA_CLASS}`} rows={4} value={jobDescription} onChange={touch(setJobDescription)} />
        </div>
      </section>

      {result.error ? (
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
              Questions that fit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stat(INT.format(result.questionCount || 0))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stat(`${result.roundLabel} · ${result.levelLabel} · ${result.slotMinutes} min slot`)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated mock interview prompt"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Minutes available for questions", stat(`${INT.format(result.availableMinutes || 0)} min`)],
            ["Minutes per question", stat(`${DEC1.format(result.perQuestionMinutes || 0)} min`)],
            ["Your speaking time per question", stat(`${INT.format(result.answerSeconds || 0)} sec`)],
            ["Scored on", stat(result.rubric ? `${result.rubric.length} dimensions` : "")],
            ["Topics you asked to cover", stat(INT.format(result.focusCount || 0))],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {result.error ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your mock interview prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Round lengths and rubrics vary by company. A practice score from a model is feedback on how
        you answered, not a prediction of whether you will pass.
      </p>
    </main>
  );
}
