"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, RotateCcw, Shuffle } from "lucide-react";

import {
  buildCondolences,
  KINSHIPS,
  LANGUAGES,
  LENGTHS,
  MAX_VARIANTS,
  RELATIONSHIPS,
  TRADITIONS,
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
  recipient: "Rahul",
  deceased: "Shri Mohan Lal",
  kinship: "father",
  relationship: "colleague",
  tradition: "secular",
  language: "en",
  length: "medium",
  sender: "Nikhil",
  count: 3,
};

const DASH = "—";

export default function ToolHome() {
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [deceased, setDeceased] = useState(DEFAULTS.deceased);
  const [kinship, setKinship] = useState(DEFAULTS.kinship);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [tradition, setTradition] = useState(DEFAULTS.tradition);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [length, setLength] = useState(DEFAULTS.length);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(1);
  const [copiedId, setCopiedId] = useState(0);

  const result = useMemo(
    () =>
      buildCondolences({
        recipient,
        deceased,
        kinship,
        relationship,
        tradition,
        language,
        length,
        sender,
        seed,
        count,
      }),
    [recipient, deceased, kinship, relationship, tradition, language, length, sender, seed, count],
  );

  const hasError = Boolean(result.error);
  const variants = hasError ? [] : result.variants;
  const lead = variants[0];

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
    setRecipient(DEFAULTS.recipient);
    setDeceased(DEFAULTS.deceased);
    setKinship(DEFAULTS.kinship);
    setRelationship(DEFAULTS.relationship);
    setTradition(DEFAULTS.tradition);
    setLanguage(DEFAULTS.language);
    setLength(DEFAULTS.length);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(1);
    setCopiedId(0);
  };

  const traditionNote = TRADITIONS.find((item) => item.id === tradition)?.note ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Condolence wording
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Condolence Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose who you are writing to, how close you are, and which closing the family would find
          familiar. You get several respectful drafts you can shorten, edit and send.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cmg-recipient">
              Writing to (name)
            </label>
            <input
              id="cmg-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmg-deceased">
              Name of the departed (optional)
            </label>
            <input
              id="cmg-deceased"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={deceased}
              onChange={(event) => setDeceased(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmg-kinship">
              They lost their
            </label>
            <select
              id="cmg-kinship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kinship}
              onChange={(event) => setKinship(event.target.value)}
            >
              {KINSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmg-relationship">
              You are their
            </label>
            <select
              id="cmg-relationship"
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
            <label className={LABEL_CLASS} htmlFor="cmg-tradition">
              Closing / faith tradition
            </label>
            <select
              id="cmg-tradition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tradition}
              onChange={(event) => setTradition(event.target.value)}
            >
              {TRADITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {traditionNote ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{traditionNote}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmg-language">
              Language
            </label>
            <select
              id="cmg-language"
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
            <label className={LABEL_CLASS} htmlFor="cmg-sender">
              Sign off as (optional)
            </label>
            <input
              id="cmg-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sender}
              onChange={(event) => setSender(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmg-count">
              Drafts to show
            </label>
            <input
              id="cmg-count"
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
          <p className={LABEL_CLASS}>Length</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LENGTHS.map((item) => {
              const active = item.id === length;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLength(item.id)}
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
              Characters in draft 1
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(lead.stats.chars)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Add a recipient name to see the drafts." : `About ${result.subject}`}
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
              aria-label="Copy the first condolence draft"
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
            ["Words in draft 1", hasError ? DASH : NUM.format(lead.stats.words)],
            ["SMS encoding", hasError ? DASH : lead.stats.encoding],
            ["SMS parts if sent as a text", hasError ? DASH : NUM.format(lead.stats.smsParts)],
            ["Drafts generated", hasError ? DASH : NUM.format(variants.length)],
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
                  Draft {variant.id}
                </h2>
                <button
                  type="button"
                  onClick={() => copyText(variant.text, 100 + variant.id)}
                  aria-label={`Copy condolence draft ${variant.id}`}
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
                {NUM.format(variant.stats.chars)} characters · {NUM.format(variant.stats.words)} words
              </p>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Mourning customs differ between families and communities. If you are unsure which closing is
        appropriate, choose &ldquo;No faith reference&rdquo; — a plain, sincere sentence is never wrong.
      </p>
    </main>
  );
}
