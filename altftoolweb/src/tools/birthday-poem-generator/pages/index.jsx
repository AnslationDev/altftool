"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Gift, RotateCcw, Shuffle } from "lucide-react";

import {
  buildBirthdayPoem,
  LENGTHS,
  MAX_AGE,
  MAX_MEMORY_LENGTH,
  MAX_NAME_LENGTH,
  MAX_VARIANTS,
  MIN_AGE,
  RELATIONSHIPS,
  TONES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "Asha",
  age: "",
  relationship: "friend",
  tone: "heartfelt",
  memory: "",
  length: "full",
  count: 3,
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [age, setAge] = useState(DEFAULTS.age);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [memory, setMemory] = useState(DEFAULTS.memory);
  const [length, setLength] = useState(DEFAULTS.length);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(1);
  const [copiedId, setCopiedId] = useState(0);
  const copyTimeoutRef = useRef(null);

  const result = useMemo(
    () => buildBirthdayPoem({ name, age, relationship, tone, memory, length, seed, count }),
    [name, age, relationship, tone, memory, length, seed, count],
  );

  const hasError = Boolean(result.error);
  const variants = hasError ? [] : result.variants;
  const lead = variants[0];

  const copyText = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedId(0), 1500);
    } catch {
      setCopiedId(0);
    }
  };

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    },
    [],
  );

  const reset = () => {
    setName(DEFAULTS.name);
    setAge(DEFAULTS.age);
    setRelationship(DEFAULTS.relationship);
    setTone(DEFAULTS.tone);
    setMemory(DEFAULTS.memory);
    setLength(DEFAULTS.length);
    setCount(DEFAULTS.count);
    setSeed(1);
    setCopiedId(0);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Birthday poem
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Birthday Poem Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add a name, an optional age, relationship, tone, and a shared memory to get a
          personalised birthday poem draft for a card, caption, or speech.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bpg-name">
              Name
            </label>
            <input
              id="bpg-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpg-age">
              Age (optional)
            </label>
            <input
              id="bpg-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={MAX_AGE}
              step="1"
              placeholder="e.g. 30"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bpg-relationship">
              Relationship
            </label>
            <select
              id="bpg-relationship"
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
            <label className={LABEL_CLASS} htmlFor="bpg-count">
              Poems to show
            </label>
            <input
              id="bpg-count"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bpg-memory">
              Shared memory or detail (optional)
            </label>
            <textarea
              id="bpg-memory"
              className={`mt-2 ${AREA_CLASS}`}
              maxLength={MAX_MEMORY_LENGTH}
              placeholder="e.g. our beach trip, your terrible puns, the road trip playlist"
              value={memory}
              onChange={(event) => setMemory(event.target.value)}
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

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Poems generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : NUM.format(variants.length)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted field to see the poems."
                : `${result.relationship} · ${TONES.find((t) => t.id === result.tone)?.label ?? result.tone}`}
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
              aria-label="Copy the first poem"
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
      </section>

      {!hasError && (
        <section aria-live="polite" className="mt-6 space-y-4">
          {variants.map((variant) => (
            <article
              key={variant.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Poem {variant.id}
                </h2>
                <button
                  type="button"
                  onClick={() => copyText(variant.text, 100 + variant.id)}
                  aria-label={`Copy poem ${variant.id}`}
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
        This is a starting draft — personal edits, inside jokes, and specific memories make the
        poem feel more authentic before you share or print it.
      </p>
    </main>
  );
}
