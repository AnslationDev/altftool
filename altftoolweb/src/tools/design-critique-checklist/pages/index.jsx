"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquareText, RotateCcw, TriangleAlert } from "lucide-react";

import { ARTEFACTS, FRAMEWORKS, STAGES, assessFeedback, buildCritiquePlan } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  framework: "objective",
  stage: "midFidelity",
  artefact: "appScreen",
  durationMinutes: "60",
  participants: "4",
};

const SAMPLE_FEEDBACK =
  "The primary button competes with the hero image because both sit at the same visual weight, so a first-time user scanning for the next step may miss it.";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [feedback, setFeedback] = useState(SAMPLE_FEEDBACK);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const plan = useMemo(() => buildCritiquePlan(form), [form]);
  const check = useMemo(() => assessFeedback(feedback), [feedback]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      `Design critique — ${plan.frameworkLabel} (${plan.totalMinutes} min, ${plan.participants} people)`,
      "",
      "## Agenda",
      ...plan.agenda.map((row) => `${row.minutes} min — ${row.title}: ${row.detail}`),
      "",
      "## Ground rules",
      ...plan.groundRules.map((rule) => `- ${rule}`),
      "",
      "## Prompts",
      ...plan.prompts.flatMap((group) => [`### ${group.area}`, ...group.questions.map((q) => `- ${q}`)]),
    ].join("\n");
  }, [plan]);

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
    setForm(DEFAULTS);
    setFeedback(SAMPLE_FEEDBACK);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Client workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Design Critique Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plan a critique with a timed agenda, ground rules and prompts matched to the artefact
          and the stage — then paste a comment into the checker to see whether it is specific
          enough to act on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-framework">
              Framework
            </label>
            <select
              id="dc-framework"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.framework}
              onChange={set("framework")}
            >
              {Object.entries(FRAMEWORKS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-artefact">
              What is being reviewed?
            </label>
            <select id="dc-artefact" className={`mt-2 ${INPUT_CLASS}`} value={form.artefact} onChange={set("artefact")}>
              {Object.entries(ARTEFACTS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-stage">
              Stage of the work
            </label>
            <select id="dc-stage" className={`mt-2 ${INPUT_CLASS}`} value={form.stage} onChange={set("stage")}>
              {Object.entries(STAGES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-duration">
              Session length (minutes)
            </label>
            <input
              id="dc-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="240"
              step="5"
              value={form.durationMinutes}
              onChange={set("durationMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-participants">
              People in the room
            </label>
            <input
              id="dc-participants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="12"
              step="1"
              value={form.participants}
              onChange={set("participants")}
            />
          </div>
        </div>
      </section>

      {plan.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Agenda</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Framework", "Rounds", "Prompts"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
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
                  Session length
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {NUM.format(plan.totalMinutes)}
                  <span className="text-xl text-[var(--muted-foreground)]"> min</span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{plan.frameworkSummary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyResult} aria-label="Copy the critique plan" className={GHOST_BTN}>
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Framework", plan.frameworkLabel],
                ["Rounds", String(plan.agenda.length)],
                ["Prompts", String(plan.promptCount)],
                ["People", String(plan.participants)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Agenda</h2>
            <ol className="mt-3 space-y-2">
              {plan.agenda.map((row) => (
                <li key={row.title} className="rounded-md bg-[var(--muted)] p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold">{row.title}</span>
                    <span className="shrink-0 text-sm font-semibold text-[var(--primary)]">{row.minutes} min</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{row.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Ground rules</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {plan.groundRules.map((rule) => (
                <li key={rule} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Prompts to ask</h2>
            <div className="mt-3 space-y-4">
              {plan.prompts.map((group) => (
                <div key={group.area}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {group.area}
                  </h3>
                  <ul className="mt-2 space-y-2 text-sm leading-6">
                    {group.questions.map((question) => (
                      <li key={question} className="rounded-md bg-[var(--muted)] px-3 py-2">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Is this feedback specific enough?</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="dc-feedback">
          Paste a comment from the session
        </label>
        <textarea
          id="dc-feedback"
          rows={3}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />

        {check.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {check.error}
          </p>
        ) : (
          <>
            <p className={`mt-3 text-3xl font-semibold ${TONE_TEXT[check.band.tone]}`}>
              {NUM.format(check.score)}
              <span className="text-lg text-[var(--muted-foreground)]">/100 · {check.band.label}</span>
            </p>
            {check.vagueFound.length > 0 && (
              <p className="mt-2 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Vague wording found: {check.vagueFound.join(", ")}</span>
              </p>
            )}
            {check.suggestions.length > 0 && (
              <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {check.suggestions.map((suggestion) => (
                  <li key={suggestion} className="rounded-md bg-[var(--muted)] px-3 py-2">
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The feedback score is a heuristic based on wording, not an understanding of your project.
        Use it to catch the obviously unactionable comments, not to grade your colleagues.
      </p>
    </main>
  );
}
