"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, Plus, RotateCcw, Trash2 } from "lucide-react";

import { CHECK_STYLES, MAX_CONTACTS, buildResultDayPlan, compilePlanText } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  resultDate: "",
  checkStyleId: CHECK_STYLES[0].id,
  contacts: ["", ""],
  better: "",
  expected: "",
  below: "",
};

const DASH = "—";

function isoToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function ToolHome() {
  const [resultDate, setResultDate] = useState(DEFAULTS.resultDate);
  const [checkStyleId, setCheckStyleId] = useState(DEFAULTS.checkStyleId);
  const [contacts, setContacts] = useState(DEFAULTS.contacts);
  const [better, setBetter] = useState(DEFAULTS.better);
  const [expected, setExpected] = useState(DEFAULTS.expected);
  const [below, setBelow] = useState(DEFAULTS.below);
  const [copied, setCopied] = useState(false);

  const todayIso = isoToday();

  const plan = useMemo(
    () =>
      buildResultDayPlan({
        resultDateIso: resultDate,
        todayIso,
        checkStyleId,
        supportContacts: contacts,
        scenarioActions: { better, expected, below },
      }),
    [resultDate, todayIso, checkStyleId, contacts, better, expected, below],
  );

  const hasError = Boolean(plan.error);

  const copyResult = async () => {
    if (hasError) return;
    const compiled = compilePlanText(plan);
    if (compiled.error) return;
    try {
      await navigator.clipboard.writeText(compiled.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setResultDate(DEFAULTS.resultDate);
    setCheckStyleId(DEFAULTS.checkStyleId);
    setContacts(DEFAULTS.contacts);
    setBetter(DEFAULTS.better);
    setExpected(DEFAULTS.expected);
    setBelow(DEFAULTS.below);
    setCopied(false);
  };

  const setContactAt = (index, value) => {
    setContacts((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const scenarioFields = [
    ["rds-better", "Better than expected — my first move", better, setBetter, "e.g. Call grandparents, then note the counselling dates"],
    ["rds-expected", "Roughly as expected — my first move", expected, setExpected, "e.g. Start the admission form I shortlisted"],
    ["rds-below", "Below what I hoped — my first move", below, setBelow, "e.g. List revaluation and second-attempt options with Dad"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Result Day Support Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Decide now — while you are calm — who will be around on result day, how you will check
          the score, and what your first move is for every outcome. Nothing you type leaves this
          page.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rds-date">
              Result date (leave blank if unknown)
            </label>
            <input
              id="rds-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={resultDate}
              onChange={(event) => setResultDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rds-style">
              How will you check it?
            </label>
            <select
              id="rds-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={checkStyleId}
              onChange={(event) => setCheckStyleId(event.target.value)}
            >
              {CHECK_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <p className={LABEL_CLASS}>Support people (first name is your first call)</p>
          <div className="mt-2 space-y-2">
            {contacts.map((name, index) => (
              <div key={index} className="flex gap-2">
                <label className="sr-only" htmlFor={`rds-contact-${index}`}>
                  Support person {index + 1}
                </label>
                <input
                  id={`rds-contact-${index}`}
                  className={INPUT_CLASS}
                  type="text"
                  value={name}
                  placeholder={index === 0 ? "e.g. Amma" : "e.g. Best friend"}
                  onChange={(event) => setContactAt(index, event.target.value)}
                />
                {contacts.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setContacts((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove support person ${index + 1}`}
                    className={`${GHOST_BTN} shrink-0 px-3`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {contacts.length < MAX_CONTACTS ? (
            <button
              type="button"
              onClick={() => setContacts((prev) => [...prev, ""])}
              className={`${GHOST_BTN} mt-2`}
              aria-label="Add another support person"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add person
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4">
          {scenarioFields.map(([id, label, value, setter, placeholder]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      {!hasError && plan.warnings.length > 0 ? (
        <p
          aria-live="polite"
          className="mt-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
        >
          {plan.warnings[0]}
        </p>
      ) : null}

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Result day" : plan.dateKnown ? (plan.isPast ? "Result date" : "Days to result day") : "Result day"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : plan.dateKnown ? (plan.isPast ? "Passed" : plan.daysToGo) : "Ready"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to build your plan."
                : plan.dateKnown && !plan.isPast
                  ? `Plan set: ${plan.checkStyle.label.toLowerCase()}, with ${plan.contacts.length > 0 ? plan.contacts.join(", ") : "no one named yet"}.`
                  : `Your plan is below — checking style: ${plan.checkStyle.label.toLowerCase()}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the result day plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <dl className="mt-5 space-y-4 text-sm">
            {plan.timeline.map((block) => (
              <div key={block.phase}>
                <dt className="font-semibold text-[var(--foreground)]">{block.phase}</dt>
                <dd>
                  <ul className="mt-1 space-y-1">
                    {block.items.map((item) => (
                      <li key={item} className="rounded-md bg-[var(--background)] px-3 py-2 text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Result-day ground rules</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {plan.rules.map((rule) => (
              <li
                key={rule}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--muted-foreground)]"
              >
                {rule}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            If emotions spike: ground yourself with {plan.grounding.join(", ")}.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning aid, not counselling. If a result brings thoughts of self-harm — yours or a
        friend's — treat it as urgent and talk to someone now: in India, Tele-MANAS 14416 and
        KIRAN 1800-599-0019 are free, 24x7 government helplines.
      </p>
    </main>
  );
}
