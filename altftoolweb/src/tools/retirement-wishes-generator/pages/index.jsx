"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, RotateCcw, Shuffle } from "lucide-react";

import {
  buildRetirementWishes,
  DEFAULT_RETIREMENT_AGE,
  LANGUAGES,
  MAX_VARIANTS,
  RELATIONSHIPS,
  RETIREMENT_AGES,
  superannuationDate,
  TONES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "Mr. R. K. Verma",
  relationship: "boss",
  tone: "heartfelt",
  language: "en",
  dobISO: "1966-07-15",
  age: DEFAULT_RETIREMENT_AGE,
  joiningISO: "1990-08-16",
  retirementISO: "2026-07-31",
  sender: "The Finance Team",
  count: 3,
};

const DASH = "—";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [dobISO, setDobISO] = useState(DEFAULTS.dobISO);
  const [age, setAge] = useState(DEFAULTS.age);
  const [joiningISO, setJoiningISO] = useState(DEFAULTS.joiningISO);
  const [retirementISO, setRetirementISO] = useState(DEFAULTS.retirementISO);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(1);
  const [copiedId, setCopiedId] = useState(0);

  const superannuation = useMemo(() => superannuationDate(dobISO, age), [dobISO, age]);

  const result = useMemo(
    () =>
      buildRetirementWishes({
        name,
        relationship,
        tone,
        language,
        joiningISO,
        retirementISO,
        sender,
        seed,
        count,
      }),
    [name, relationship, tone, language, joiningISO, retirementISO, sender, seed, count],
  );

  const hasError = Boolean(result.error);
  const variants = hasError ? [] : result.variants;
  const lead = variants[0];
  const service = hasError ? null : result.service;

  const copyText = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(0), 1500);
    } catch {
      setCopiedId(0);
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setRelationship(DEFAULTS.relationship);
    setTone(DEFAULTS.tone);
    setLanguage(DEFAULTS.language);
    setDobISO(DEFAULTS.dobISO);
    setAge(DEFAULTS.age);
    setJoiningISO(DEFAULTS.joiningISO);
    setRetirementISO(DEFAULTS.retirementISO);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(1);
    setCopiedId(0);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Farewell wishes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Retirement Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the date of joining and the last working day and the message quotes the exact years
          of service. The superannuation date is derived from the date of birth using the FR 56(a)
          end-of-month rule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-name">
              Who is retiring
            </label>
            <input
              id="rwg-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-sender">
              Sign off as (optional)
            </label>
            <input
              id="rwg-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sender}
              onChange={(event) => setSender(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-relationship">
              They are your
            </label>
            <select
              id="rwg-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-language">
              Language
            </label>
            <select
              id="rwg-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-joining">
              Date of joining
            </label>
            <input
              id="rwg-joining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={joiningISO}
              onChange={(event) => setJoiningISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-retirement">
              Last working day
            </label>
            <input
              id="rwg-retirement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={retirementISO}
              onChange={(event) => setRetirementISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-dob">
              Date of birth (optional)
            </label>
            <input
              id="rwg-dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dobISO}
              onChange={(event) => setDobISO(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-age">
              Superannuation age
            </label>
            <select
              id="rwg-age"
              className={`mt-2 ${INPUT_CLASS}`}
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
            >
              {RETIREMENT_AGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {superannuation.iso ? (
              <button
                type="button"
                onClick={() => setRetirementISO(superannuation.iso)}
                className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Use FR 56(a) date {superannuation.iso}
              </button>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rwg-count">
              Messages to show
            </label>
            <input
              id="rwg-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_VARIANTS}
              step="1"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className={LABEL_CLASS}>Tone</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((item) => {
              const active = item.id === tone;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTone(item.id)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {hasError ? (
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
              Completed years of service
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !service ? DASH : NUM.format(service.years)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted field to see the messages."
                : service
                  ? `${NUM.format(service.years)}y ${NUM.format(service.months)}m ${NUM.format(service.days)}d · ${NUM.format(service.totalDays)} days`
                  : "Add joining and last working dates to show the service length."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeed((value) => value + 1)}
              aria-label="Shuffle to different wording"
              className={GHOST_BTN}
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Shuffle
            </button>
            <button
              type="button"
              onClick={() => copyText(lead?.text, 1)}
              aria-label="Copy the first retirement message"
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {copiedId === 1 ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === 1 ? "Copied!" : "Copy"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Last working day on the card", hasError ? DASH : (result.retirementDateText ?? DASH)],
            ["FR 56(a) superannuation date", superannuation.iso ?? DASH],
            [
              "Attains that age on",
              superannuation.attainsOn
                ? `${superannuation.attainsOn}${superannuation.bornOnFirst ? " (born on the 1st)" : ""}`
                : DASH,
            ],
            ["Service in decimal years", hasError || !service ? DASH : NUM.format(service.decimalYears)],
            ["Characters in message 1", hasError ? DASH : NUM.format(lead.chars)],
            ["Messages generated", hasError ? DASH : NUM.format(variants.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {variants.map((variant) => (
            <article
              key={variant.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Message {variant.id}
                </h2>
                <button
                  type="button"
                  onClick={() => copyText(variant.text, 100 + variant.id)}
                  aria-label={`Copy retirement message ${variant.id}`}
                  className={GHOST_BTN}
                >
                  {copiedId === 100 + variant.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === 100 + variant.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-7">
                {variant.text}
              </p>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                {NUM.format(variant.chars)} characters · {NUM.format(variant.words)} words
              </p>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The superannuation date follows the FR 56(a) pattern used for Central Government posts.
        State cadres, PSUs and private employers set their own rules — check the service record or
        the appointment letter before printing a date on anything official.
      </p>
    </main>
  );
}
