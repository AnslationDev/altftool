"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare, RotateCcw } from "lucide-react";

import {
  CANDOUR_LEVELS,
  DRIVERS,
  MAX_RATING,
  QUESTIONS,
  buildAnswers,
  computeExitProfile,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_RATINGS = { compensation: 3, growth: 4, manager: 2, workload: 3 };
const DEFAULT_QUESTIONS = QUESTIONS.map((entry) => entry.id);

const DEFAULTS = {
  companyName: "Northbridge Services",
  roleName: "Senior Analyst",
  candourId: "balanced",
  positiveNote: "the people I worked with day to day",
  namesIndividuals: false,
  wouldReturn: true,
};

const BAND_COPY = {
  low: "Low risk — nothing here should follow you.",
  moderate: "Moderate risk — rehearse the sharper answers before you walk in.",
  high: "High risk — reconsider what you gain from saying this out loud.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [ratings, setRatings] = useState(DEFAULT_RATINGS);
  const [questionIds, setQuestionIds] = useState(DEFAULT_QUESTIONS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const setRating = (id, value) =>
    setRatings((prev) => ({ ...prev, [id]: Number(value) }));

  const toggleQuestion = (id) =>
    setQuestionIds((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));

  const profile = useMemo(
    () =>
      computeExitProfile({
        ratings,
        candourId: form.candourId,
        namesIndividuals: Boolean(form.namesIndividuals),
        wouldReturn: Boolean(form.wouldReturn),
      }),
    [ratings, form.candourId, form.namesIndividuals, form.wouldReturn],
  );

  const plan = useMemo(
    () =>
      buildAnswers({
        profile,
        questionIds,
        positiveNote: form.positiveNote,
        companyName: form.companyName,
        roleName: form.roleName,
      }),
    [profile, questionIds, form.positiveNote, form.companyName, form.roleName],
  );

  const error = profile.error || plan.error || "";

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setRatings(DEFAULT_RATINGS);
    setQuestionIds(DEFAULT_QUESTIONS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Exit documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Exit Interview Response Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rate why you are actually leaving, choose how candid you want to be, and get an answer for
          each standard question that says something useful without leaving anything quotable behind.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Why you are leaving</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Rate each from 0 (not a factor) to {MAX_RATING} (decisive). Ranking also weights how far the
          employer could realistically change it.
        </p>
        <div className="mt-4 grid gap-4">
          {DRIVERS.map((driver) => (
            <div key={driver.id}>
              <div className="flex items-center justify-between gap-3">
                <label className={LABEL} htmlFor={`rating-${driver.id}`}>{driver.label}</label>
                <span className="text-sm font-semibold text-[var(--primary)]">{ratings[driver.id] ?? 0}</span>
              </div>
              <input id={`rating-${driver.id}`} type="range" min="0" max={MAX_RATING} step="1"
                className="mt-2 h-11 w-full accent-[var(--primary)]"
                value={ratings[driver.id] ?? 0}
                onChange={(event) => setRating(driver.id, event.target.value)} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How you want to play it</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="candour">Candour level</label>
            <select id="candour" className={INPUT} value={form.candourId} onChange={set("candourId")}>
              {CANDOUR_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>{level.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="company-name">Company name</label>
            <input id="company-name" className={INPUT} value={form.companyName} onChange={set("companyName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="role-name">Your role</label>
            <input id="role-name" className={INPUT} value={form.roleName} onChange={set("roleName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="positive-note">The genuinely good part</label>
            <input id="positive-note" className={INPUT} value={form.positiveNote} onChange={set("positiveNote")} />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {(CANDOUR_LEVELS.find((level) => level.id === form.candourId) || CANDOUR_LEVELS[1]).note}
        </p>
        <div className="mt-4 grid gap-3">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="names-individuals">
            <input id="names-individuals" type="checkbox" className="h-5 w-5 accent-[var(--primary)]"
              checked={Boolean(form.namesIndividuals)}
              onChange={(event) => setForm((prev) => ({ ...prev, namesIndividuals: event.target.checked }))} />
            I intend to name specific people
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="would-return">
            <input id="would-return" type="checkbox" className="h-5 w-5 accent-[var(--primary)]"
              checked={Boolean(form.wouldReturn)}
              onChange={(event) => setForm((prev) => ({ ...prev, wouldReturn: event.target.checked }))} />
            I would consider working here again
          </label>
        </div>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Your leading reason
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? "—" : profile.primary.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Rate at least one reason above zero."
                : `${profile.primary.sharePct}% of the weighted total · disclosure risk ${profile.risk}/100 · ${BAND_COPY[profile.band]}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the ranked reasons"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : ["Reasons for leaving, ranked", ...profile.ranked.map((entry) => `${entry.label}: ${entry.sharePct}% (rated ${entry.rating}/${MAX_RATING})`)].join("\n"),
                  "ranked",
                )
              }
            >
              {copied === "ranked" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "ranked" ? "Copied!" : "Copy ranking"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!error && (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {profile.ranked.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">
                    {entry.label}
                    <span className="block text-xs">rated {entry.rating}/{MAX_RATING}, actionability weight {entry.weight}</span>
                  </dt>
                  <dd className="text-right font-semibold">{entry.sharePct}%</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 rounded-md border border-[var(--border)] p-4">
              <p className="text-sm font-semibold">Before you go in</p>
              <ul className="mt-2 space-y-2 text-sm text-[var(--muted-foreground)]">
                {profile.cautions.map((caution) => (
                  <li key={caution} className="flex gap-2">
                    <span aria-hidden="true">·</span>
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Questions to prepare</h2>
        <div className="mt-4 grid gap-2">
          {QUESTIONS.map((entry) => (
            <label key={entry.id} htmlFor={`q-${entry.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
              <input id={`q-${entry.id}`} type="checkbox" className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={questionIds.includes(entry.id)} onChange={() => toggleQuestion(entry.id)} />
              {entry.question}
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your answers</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the full exit interview script"
            onClick={() => copy(plan.error ? "" : plan.script, "script")}>
            {copied === "script" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "script" ? "Copied!" : "Copy script"}
          </button>
        </div>
        {plan.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {plan.error}
          </p>
        ) : (
          <div aria-live="polite" aria-atomic="true" className="mt-4 grid gap-4">
            {plan.answers.map((entry) => (
              <div key={entry.id} className="rounded-md border border-[var(--border)] p-4">
                <p className="text-sm font-semibold">{entry.question}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{entry.answer}</p>
              </div>
            ))}
            {plan.answers.length === 0 && (
              <p className="text-sm text-[var(--muted-foreground)]">Tick at least one question above.</p>
            )}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A preparation aid, not legal advice, and nothing you enter leaves your browser. An exit
        interview is not confidential unless your employer says so in writing. Harassment,
        discrimination or unlawful conduct should go into a formal written complaint through the
        proper channel — and to a lawyer — not into an exit interview.
      </p>
    </main>
  );
}
