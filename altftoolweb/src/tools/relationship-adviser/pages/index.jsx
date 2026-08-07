"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw, TriangleAlert } from "lucide-react";

import {
  buildStatement,
  defaultMinutes,
  FLOODING_BREAK_MINUTES,
  FOUR_HORSEMEN,
  getSituation,
  MAGIC_RATIO,
  ratioCheck,
  RITUALS,
  SAFETY_NOTE,
  SITUATIONS,
  weeklyConnection,
  WEEKLY_TARGET_MINUTES,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ALERT_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  situation: "same-argument",
  days: "5",
  positive: "18",
  negative: "4",
  observation: "the plan for Saturday changed without us discussing it",
  feeling: "unsettled",
  need: "some say in how our weekends go",
  request: "check with me before we commit to anything on a weekend",
};

const hoursLabel = (minutes) =>
  Number.isFinite(minutes) ? `${NUM.format(minutes / 60)} h` : DASH;

export default function ToolHome() {
  const [situationId, setSituationId] = useState(DEFAULTS.situation);
  const [days, setDays] = useState(DEFAULTS.days);
  const [minutes, setMinutes] = useState(() => {
    const base = defaultMinutes();
    return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, String(value)]));
  });
  const [positive, setPositive] = useState(DEFAULTS.positive);
  const [negative, setNegative] = useState(DEFAULTS.negative);
  const [observation, setObservation] = useState(DEFAULTS.observation);
  const [feeling, setFeeling] = useState(DEFAULTS.feeling);
  const [need, setNeed] = useState(DEFAULTS.need);
  const [request, setRequest] = useState(DEFAULTS.request);
  const [copied, setCopied] = useState(false);

  const situation = useMemo(() => getSituation(situationId), [situationId]);

  const budget = useMemo(() => {
    const parsed = Object.fromEntries(
      Object.entries(minutes).map(([key, value]) => [key, value === "" ? NaN : Number(value)]),
    );
    return weeklyConnection({ daysTogether: days === "" ? NaN : Number(days), minutes: parsed });
  }, [days, minutes]);

  const ratio = useMemo(
    () => ratioCheck(positive === "" ? NaN : Number(positive), negative === "" ? NaN : Number(negative)),
    [positive, negative],
  );

  const statement = useMemo(
    () => buildStatement({ observation, feeling, need, request }),
    [observation, feeling, need, request],
  );

  const budgetFailed = Boolean(budget.error);

  const reset = () => {
    setSituationId(DEFAULTS.situation);
    setDays(DEFAULTS.days);
    setMinutes(
      Object.fromEntries(Object.entries(defaultMinutes()).map(([k, v]) => [k, String(v)])),
    );
    setPositive(DEFAULTS.positive);
    setNegative(DEFAULTS.negative);
    setObservation(DEFAULTS.observation);
    setFeeling(DEFAULTS.feeling);
    setNeed(DEFAULTS.need);
    setRequest(DEFAULTS.request);
    setCopied(false);
  };

  const copy = async () => {
    if (statement.error) return;
    try {
      await navigator.clipboard.writeText(statement.statement);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Heart className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Relationship Adviser
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Conversation prompts built on Nonviolent Communication and the Gottman Institute&apos;s
          published frameworks, plus a weekly connection budget you can actually check.
        </p>
      </header>

      <p className="flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{SAFETY_NOTE}</span>
      </p>

      <section className="mt-5">
        <label className={LABEL_CLASS} htmlFor="ra-situation">
          What is going on right now?
        </label>
        <select
          id="ra-situation"
          className={`${INPUT_CLASS} mt-1.5`}
          value={situationId}
          onChange={(event) => setSituationId(event.target.value)}
        >
          {SITUATIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </section>

      {situation.error ? (
        <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
          {situation.error}
        </p>
      ) : (
        <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--foreground)]">{situation.label}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {situation.summary}
          </p>

          <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">Try saying</h3>
          <ul className="mt-2 space-y-2 text-sm text-[var(--muted-foreground)]">
            {situation.prompts.map((prompt) => (
              <li key={prompt} className="rounded-md border border-[var(--border)] px-3 py-2">
                {prompt}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">Skip</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {situation.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {situation.horsemanDetail ? (
            <dl className="mt-4 border-t border-[var(--border)] pt-4 text-sm">
              <dt className="text-[var(--muted-foreground)]">
                Pattern most likely at play — {situation.horsemanDetail.label}
              </dt>
              <dd className="mt-1 font-semibold text-[var(--foreground)]">
                {situation.horsemanDetail.antidote}
              </dd>
            </dl>
          ) : null}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Weekly connection budget</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Gottman&apos;s Magic Six Hours a Week is {WEEKLY_TARGET_MINUTES} minutes of ritual time.
          Enter what your week really looks like.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-days">
              Days a week you are together
            </label>
            <input
              id="ra-days"
              type="number"
              min="0"
              max="7"
              className={`${INPUT_CLASS} mt-1.5`}
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          {RITUALS.map((ritual) => (
            <div key={ritual.id}>
              <label className={LABEL_CLASS} htmlFor={`ra-${ritual.id}`}>
                {ritual.label} ({ritual.perDay ? "min per day" : "min per week"})
              </label>
              <input
                id={`ra-${ritual.id}`}
                type="number"
                min="0"
                className={`${INPUT_CLASS} mt-1.5`}
                value={minutes[ritual.id]}
                onChange={(event) =>
                  setMinutes((prev) => ({ ...prev, [ritual.id]: event.target.value }))
                }
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{ritual.detail}</p>
            </div>
          ))}
        </div>

        {budgetFailed ? (
          <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
            {budget.error}
          </p>
        ) : null}

        <div
          className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          aria-live="polite"
          role="status"
        >
          <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
            Ritual time this week
          </p>
          <p className="mt-2 text-4xl font-bold text-[var(--primary)]">
            {budgetFailed ? DASH : hoursLabel(budget.totalMinutes)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {budgetFailed
              ? DASH
              : budget.gapMinutes <= 0
                ? `That is ${NUM.format(Math.abs(budget.gapMinutes))} minutes above the 6-hour budget.`
                : `That is ${NUM.format(budget.gapMinutes)} minutes short of the 6-hour budget.`}
          </p>

          <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted-foreground)]">Target</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {hoursLabel(WEEKLY_TARGET_MINUTES)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--muted-foreground)]">Share of target</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {budgetFailed ? DASH : `${NUM.format(budget.percentOfTarget)}%`}
              </dd>
            </div>
          </dl>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-left text-sm">
              <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
                Where the time goes
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="py-2 pr-4 font-semibold text-[var(--foreground)]">
                    Ritual
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold text-[var(--foreground)]">
                    Minutes a week
                  </th>
                </tr>
              </thead>
              <tbody>
                {RITUALS.map((ritual) => {
                  const row = budgetFailed
                    ? null
                    : budget.breakdown.find((item) => item.id === ritual.id);
                  return (
                    <tr key={ritual.id} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-4 text-[var(--muted-foreground)]">{ritual.label}</td>
                      <td className="py-2 text-right font-semibold text-[var(--foreground)]">
                        {row ? NUM.format(row.weeklyMinutes) : DASH}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Positive-to-negative ratio this week
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Stable couples average about {MAGIC_RATIO} positive interactions for every negative one
          during conflict.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-positive">
              Positive moments
            </label>
            <input
              id="ra-positive"
              type="number"
              min="0"
              className={`${INPUT_CLASS} mt-1.5`}
              value={positive}
              onChange={(event) => setPositive(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-negative">
              Negative moments
            </label>
            <input
              id="ra-negative"
              type="number"
              min="0"
              className={`${INPUT_CLASS} mt-1.5`}
              value={negative}
              onChange={(event) => setNegative(event.target.value)}
            />
          </div>
        </div>

        {ratio.error ? (
          <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
            {ratio.error}
          </p>
        ) : (
          <div
            className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            aria-live="polite"
            role="status"
          >
            <p className="text-3xl font-bold text-[var(--primary)]">
              {ratio.ratio === null ? DASH : `${NUM.format(ratio.ratio)}:1`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{ratio.message}</p>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Say it without a fight</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The four-part Nonviolent Communication frame: observation, feeling, need, request.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ra-observation">
              When… (what happened, no verdict)
            </label>
            <input
              id="ra-observation"
              type="text"
              className={`${INPUT_CLASS} mt-1.5`}
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-feeling">
              I feel…
            </label>
            <input
              id="ra-feeling"
              type="text"
              className={`${INPUT_CLASS} mt-1.5`}
              value={feeling}
              onChange={(event) => setFeeling(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-need">
              Because I need…
            </label>
            <input
              id="ra-need"
              type="text"
              className={`${INPUT_CLASS} mt-1.5`}
              value={need}
              onChange={(event) => setNeed(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ra-request">
              Would you be willing to…
            </label>
            <input
              id="ra-request"
              type="text"
              className={`${INPUT_CLASS} mt-1.5`}
              value={request}
              onChange={(event) => setRequest(event.target.value)}
            />
          </div>
        </div>

        {statement.error ? (
          <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
            {statement.error}
          </p>
        ) : null}

        <div
          className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          aria-live="polite"
          role="status"
        >
          <p className="text-base leading-relaxed font-semibold text-[var(--foreground)]">
            {statement.error ? DASH : statement.statement}
          </p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {statement.error ? DASH : `${statement.words} words`}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copy}
            disabled={Boolean(statement.error)}
            aria-label="Copy the statement to the clipboard"
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy statement"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset every field">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
            The Four Horsemen and their antidotes. Take a {FLOODING_BREAK_MINUTES}-minute break
            when either of you is flooded.
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th scope="col" className="py-2 pr-4 font-semibold text-[var(--foreground)]">
                Pattern
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold text-[var(--foreground)]">
                Looks like
              </th>
              <th scope="col" className="py-2 font-semibold text-[var(--foreground)]">
                Antidote
              </th>
            </tr>
          </thead>
          <tbody>
            {FOUR_HORSEMEN.map((row) => (
              <tr key={row.id} className="border-b border-[var(--border)] align-top">
                <td className="py-2 pr-4 font-semibold text-[var(--foreground)]">{row.label}</td>
                <td className="py-2 pr-4 text-[var(--muted-foreground)]">{row.looksLike}</td>
                <td className="py-2 text-[var(--muted-foreground)]">{row.antidote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
