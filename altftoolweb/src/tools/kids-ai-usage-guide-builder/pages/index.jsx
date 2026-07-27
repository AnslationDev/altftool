"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";
import {
  AI_USES,
  MAX_AGE,
  MIN_AGE,
  SAFEGUARDS,
  SUPERVISION_LEVELS,
  buildAiFamilyAgreement,
  defaultSelectionForAge,
} from "../lib";

const DEFAULT_AGE = 11;
const DEFAULTS = {
  childName: "Riya",
  age: String(DEFAULT_AGE),
  daysPerWeek: "5",
  reviewWeeks: "8",
  ...(() => {
    const seed = defaultSelectionForAge(DEFAULT_AGE);
    return {
      dailyMinutes: String(seed.dailyMinutes),
      supervision: seed.supervision,
      uses: seed.uses,
      safeguards: seed.safeguards,
    };
  })(),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)]";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

const toggle = (list, id) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

export default function ToolHome() {
  const [childName, setChildName] = useState(DEFAULTS.childName);
  const [age, setAge] = useState(DEFAULTS.age);
  const [dailyMinutes, setDailyMinutes] = useState(DEFAULTS.dailyMinutes);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [supervision, setSupervision] = useState(DEFAULTS.supervision);
  const [uses, setUses] = useState(DEFAULTS.uses);
  const [safeguards, setSafeguards] = useState(DEFAULTS.safeguards);
  const [reviewWeeks, setReviewWeeks] = useState(DEFAULTS.reviewWeeks);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildAiFamilyAgreement({
        childName,
        age: toNumber(age),
        dailyMinutes: toNumber(dailyMinutes),
        daysPerWeek: toNumber(daysPerWeek),
        supervision,
        uses,
        safeguards,
        reviewWeeks: toNumber(reviewWeeks),
      }),
    [childName, age, dailyMinutes, daysPerWeek, supervision, uses, safeguards, reviewWeeks],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.agreementText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const applyAgeDefaults = () => {
    const seed = defaultSelectionForAge(toNumber(age));
    setDailyMinutes(String(seed.dailyMinutes));
    setSupervision(seed.supervision);
    setUses(seed.uses);
    setSafeguards(seed.safeguards);
  };

  const reset = () => {
    setChildName(DEFAULTS.childName);
    setAge(DEFAULTS.age);
    setDailyMinutes(DEFAULTS.dailyMinutes);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setSupervision(DEFAULTS.supervision);
    setUses(DEFAULTS.uses);
    setSafeguards(DEFAULTS.safeguards);
    setReviewWeeks(DEFAULTS.reviewWeeks);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Family AI agreement
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kids AI Usage Guide Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick an age, a time allowance and the house rules you want, and get a signed-and-stuck-on-
          the-fridge agreement covering which AI activities are fine now, which need an adult, and
          which wait a few years.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-name">
              Child&apos;s first name
            </label>
            <input
              id="kid-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={childName}
              onChange={(event) => setChildName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-age">
              Age (years)
            </label>
            <input
              id="kid-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={MAX_AGE}
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-minutes">
              Minutes of AI use per active day
            </label>
            <input
              id="kid-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="480"
              step="5"
              value={dailyMinutes}
              onChange={(event) => setDailyMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-days">
              Active days per week
            </label>
            <input
              id="kid-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-supervision">
              Supervision level
            </label>
            <select
              id="kid-supervision"
              className={`mt-2 ${INPUT_CLASS}`}
              value={supervision}
              onChange={(event) => setSupervision(event.target.value)}
            >
              {SUPERVISION_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-review">
              Review the agreement every (weeks)
            </label>
            <input
              id="kid-review"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="52"
              step="1"
              value={reviewWeeks}
              onChange={(event) => setReviewWeeks(event.target.value)}
            />
          </div>
        </div>

        <button type="button" onClick={applyAgeDefaults} className={`mt-4 ${GHOST_BTN}`}>
          Use the suggested set-up for this age
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What they may use AI for</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {AI_USES.map((use) => (
            <label key={use.id} className={CHECK_ROW} htmlFor={`use-${use.id}`}>
              <input
                id={`use-${use.id}`}
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={uses.includes(use.id)}
                onChange={() => setUses((list) => toggle(list, use.id))}
              />
              <span>
                <span className="block font-medium">{use.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  Usually fine from age {use.minAge}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">House rules</h2>
        <div className="mt-3 grid gap-2">
          {SAFEGUARDS.map((rule) => (
            <label key={rule.id} className={CHECK_ROW} htmlFor={`rule-${rule.id}`}>
              <input
                id={`rule-${rule.id}`}
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={safeguards.includes(rule.id)}
                onChange={() => setSafeguards((list) => toggle(list, rule.id))}
              />
              <span className="font-medium">{rule.label}</span>
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Guardrail score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${result.safeguardScore}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${result.scoreLabel} — ${result.supervision.label.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the family AI agreement"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy agreement"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Age band", hasError ? dash : result.band.label],
            [
              "Weekly AI time",
              hasError ? dash : `${result.weeklyMinutes} minutes (about ${result.weeklyHours} hours)`,
            ],
            [
              "Suggested daily time for this band",
              hasError ? dash : `${result.suggestedDailyMinutes} minutes`,
            ],
            ["House rules switched on", hasError ? dash : `${result.chosenSafeguards.length} of ${SAFEGUARDS.length}`],
            ["Activities agreed now", hasError ? dash : String(result.agreedUses.length)],
            ["Activities needing an adult", hasError ? dash : String(result.supervisedUses.length)],
            ["Activities deferred", hasError ? dash : String(result.notYetUses.length)],
            ["Next review", hasError ? dash : `every ${result.reviewWeeks} weeks`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.overAllowance && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.dailyMinutes} minutes a day is well above the {result.suggestedDailyMinutes}
            -minute starting point for the {result.band.label} band. Consider trimming it or splitting
            it between homework help and creative use.
          </p>
        )}

        {!hasError && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold">The agreement</h3>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 text-[var(--foreground)]">
              {result.agreementText}
            </pre>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid, not legal advice. Age thresholds reflect COPPA (under 13 in the
        US), the GDPR default digital-consent age of 16, and the 13+ minimum in most consumer AI
        terms of service — check the terms of the specific product and your school&apos;s policy.
      </p>
    </main>
  );
}
