"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Volume2 } from "lucide-react";

import {
  MAX_NAME_LENGTH,
  MAX_RESPELLING_LENGTH,
  buildPronunciationCard,
  cardToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { name: "Priya", stress: 0, custom: "", rhymes: "" };
const DASH = "—";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [stress, setStress] = useState(DEFAULTS.stress);
  const [custom, setCustom] = useState(DEFAULTS.custom);
  const [rhymes, setRhymes] = useState(DEFAULTS.rhymes);
  const [copied, setCopied] = useState(false);

  // Probe with syllable 0, which is always valid, so the stress buttons can be
  // rendered even when the current stress choice is out of range for a new name.
  const probe = useMemo(() => buildPronunciationCard({ name, stressIndex: 0 }), [name]);

  const card = useMemo(
    () =>
      buildPronunciationCard({
        name,
        stressIndex: stress,
        customRespelling: custom,
        rhymesWith: rhymes,
      }),
    [name, stress, custom, rhymes],
  );

  const summary = useMemo(() => cardToText(card), [card]);

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
    setName(DEFAULTS.name);
    setStress(DEFAULTS.stress);
    setCustom(DEFAULTS.custom);
    setRhymes(DEFAULTS.rhymes);
    setCopied(false);
  };

  const syllables = probe.error ? [] : probe.syllables;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Pronunciation card
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Name Pronunciation Guide Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Break your name into syllables, mark the stressed one, get a plain-English respelling and the
          NATO letter spelling for phone calls — then copy the whole card into an email signature,
          a profile bio or a first-day introduction.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pron-name">
              Your name
            </label>
            <input
              id="pron-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setStress(0);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pron-custom">
              Your own respelling (optional)
            </label>
            <input
              id="pron-custom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_RESPELLING_LENGTH}
              placeholder="PREE-yuh"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pron-rhymes">
              Rhymes with (optional)
            </label>
            <input
              id="pron-rhymes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
              placeholder="free-uh"
              value={rhymes}
              onChange={(event) => setRhymes(event.target.value)}
            />
          </div>
        </div>

        {syllables.length > 0 ? (
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-[var(--foreground)]">
              Which syllable is stressed?
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {syllables.map((syllable, index) => (
                <button
                  key={`${syllable}-${index}`}
                  type="button"
                  onClick={() => setStress(index)}
                  aria-pressed={stress === index}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    stress === index
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {syllable}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}
      </section>

      {card.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {card.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Say it
            </p>
            <p className="mt-1 break-words text-4xl font-semibold text-[var(--primary)]">
              {card.error ? DASH : card.respelling}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {card.error
                ? DASH
                : `${card.syllableCount} syllable${card.syllableCount === 1 ? "" : "s"}, stress on "${
                    card.stressedSyllable
                  }"`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pronunciation card"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy card"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the card" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Syllable breaks",
              card.error ? DASH : card.wordSyllables.map((word) => word.join(" · ")).join("   /   "),
            ],
            ["Automatic respelling", card.error ? DASH : card.autoRespelling],
            ["Rhymes with", card.error || !card.rhymesWith ? DASH : card.rhymesWith],
            ["Initials", card.error ? DASH : card.initials],
            ["Letters", card.error ? DASH : String(card.letters)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!card.error && card.usingCustom ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Using your own respelling. The automatic one is still shown above for comparison.
          </p>
        ) : null}
      </section>

      {!card.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Spelling it out on a call</h2>
          <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">{card.nato}</p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            This is the ICAO/NATO spelling alphabet, the international standard used by aviation,
            emergency services and call centres.
          </p>
        </section>
      ) : null}

      {!card.error && card.pitfalls.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What people usually get wrong</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {card.pitfalls.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The automatic respelling is an approximation built from spelling rules, not a phonetic
        transcription — you know your own name best, so override it whenever it is off.
      </p>
    </main>
  );
}
