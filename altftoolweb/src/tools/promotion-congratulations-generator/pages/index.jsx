"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, TrendingUp } from "lucide-react";

import {
  buildCongratulations,
  EVENTS,
  LANGUAGES,
  MAX_VARIANTS,
  RELATIONSHIPS,
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
  name: "Ananya",
  role: "Senior Product Manager",
  company: "Zeta Labs",
  event: "promotion",
  relationship: "teammate",
  tone: "warm",
  language: "en",
  roleStartISO: "2022-04-01",
  promotionISO: "2026-07-28",
  sender: "Nikhil",
  count: 3,
};

const DASH = "—";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [role, setRole] = useState(DEFAULTS.role);
  const [company, setCompany] = useState(DEFAULTS.company);
  const [occasion, setOccasion] = useState(DEFAULTS.event);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [roleStartISO, setRoleStartISO] = useState(DEFAULTS.roleStartISO);
  const [promotionISO, setPromotionISO] = useState(DEFAULTS.promotionISO);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(1);
  const [copiedId, setCopiedId] = useState(0);

  const result = useMemo(
    () =>
      buildCongratulations({
        name,
        role,
        company,
        event: occasion,
        relationship,
        tone,
        language,
        roleStartISO,
        promotionISO,
        sender,
        seed,
        count,
      }),
    [
      name,
      role,
      company,
      occasion,
      relationship,
      tone,
      language,
      roleStartISO,
      promotionISO,
      sender,
      seed,
      count,
    ],
  );

  const hasError = Boolean(result.error);
  const variants = hasError ? [] : result.variants;
  const lead = variants[0];
  const tenure = hasError ? null : result.tenure;

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
    setRole(DEFAULTS.role);
    setCompany(DEFAULTS.company);
    setOccasion(DEFAULTS.event);
    setRelationship(DEFAULTS.relationship);
    setTone(DEFAULTS.tone);
    setLanguage(DEFAULTS.language);
    setRoleStartISO(DEFAULTS.roleStartISO);
    setPromotionISO(DEFAULTS.promotionISO);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(1);
    setCopiedId(0);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Congratulations
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Promotion Congratulations Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Congratulate someone on a promotion, a new job or an award — and see instantly whether the
          message fits an SMS, an X post, a LinkedIn comment or a full LinkedIn post.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-name">
              Who you are congratulating
            </label>
            <input
              id="pcg-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-role">
              New role or title
            </label>
            <input
              id="pcg-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-company">
              Company (optional)
            </label>
            <input
              id="pcg-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-sender">
              Sign off as (optional)
            </label>
            <input
              id="pcg-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-event">
              Occasion
            </label>
            <select
              id="pcg-event"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            >
              {EVENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-relationship">
              They are your
            </label>
            <select
              id="pcg-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-start">
              Previous role started (optional)
            </label>
            <input
              id="pcg-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={roleStartISO}
              onChange={(e) => setRoleStartISO(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-date">
              Date of the news (optional)
            </label>
            <input
              id="pcg-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={promotionISO}
              onChange={(e) => setPromotionISO(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-language">
              Language
            </label>
            <select
              id="pcg-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcg-count">
              Messages to show
            </label>
            <input
              id="pcg-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_VARIANTS}
              step="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
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
              Characters in message 1
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(lead.chars)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted field to see the messages."
                : `${result.event} · ${result.relationship}`}
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
              aria-label="Copy the first congratulations message"
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
            ["Words in message 1", hasError ? DASH : NUM.format(lead.words)],
            [
              "Time in the previous role",
              hasError || !tenure
                ? DASH
                : `${NUM.format(tenure.years)}y ${NUM.format(tenure.months)}m ${NUM.format(tenure.days)}d`,
            ],
            ["Total months in that role", hasError || !tenure ? DASH : NUM.format(tenure.totalMonths)],
            ["Messages generated", hasError ? DASH : NUM.format(variants.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">
                Whether message 1 fits each platform character limit
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Channel
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Limit
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Fits?
                  </th>
                </tr>
              </thead>
              <tbody>
                {lead.channels.map((channel) => (
                  <tr key={channel.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{channel.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(channel.limit)}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        channel.fits ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {channel.fits ? "Fits" : `${NUM.format(channel.over)} over`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  aria-label={`Copy congratulations message ${variant.id}`}
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
        Platform limits change from time to time. The figures used here are the published limits for
        SMS, X, LinkedIn comments, LinkedIn posts and WhatsApp at the time of writing.
      </p>
    </main>
  );
}
