"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Star } from "lucide-react";

import {
  MAX_NAME_LENGTH,
  NAKSHATRA_COUNT,
  PADAS_PER_RASHI,
  RASHIS,
  getRashi,
  matchName,
  nakshatraSpan,
  rashiToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { rashiId: "mesha", name: "Rohan" };
const DASH = "—";

export default function ToolHome() {
  const [rashiId, setRashiId] = useState(DEFAULTS.rashiId);
  const [name, setName] = useState(DEFAULTS.name);
  const [copied, setCopied] = useState(false);

  const rashi = useMemo(() => getRashi(rashiId), [rashiId]);
  const span = useMemo(() => nakshatraSpan(rashiId), [rashiId]);
  const match = useMemo(() => matchName(name), [name]);
  const summary = useMemo(() => rashiToText(rashiId), [rashiId]);

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
    setRashiId(DEFAULTS.rashiId);
    setName(DEFAULTS.name);
    setCopied(false);
  };

  const tiers = match.error
    ? []
    : [
        ["Exact syllable match", match.exact],
        ["Close match, glide dropped", match.approximate],
        ["Same consonant, different vowel", match.family],
      ].filter(([, list]) => list.length > 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Star className="h-4 w-4" aria-hidden="true" />
          Culture reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Rashi Name Letter Chart</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          In the traditional naming custom, a child&apos;s first syllable comes from the nakshatra pada
          the Moon occupied at birth. {NAKSHATRA_COUNT} nakshatras of four padas each give 108
          syllables, and every rashi covers exactly {PADAS_PER_RASHI} of them. Pick a sign to see its
          nine syllables and which nakshatra pada each one belongs to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Choose a rashi</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {RASHIS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setRashiId(entry.id)}
                aria-pressed={rashiId === entry.id}
                className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  rashiId === entry.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                }`}
              >
                {entry.sanskrit}
                <span
                  className={`mt-0.5 block text-xs font-normal ${
                    rashiId === entry.id ? "" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {entry.english}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Naming syllables
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {rashi ? rashi.syllables.map((entry) => entry.syllable).join(" ") : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {rashi ? `${rashi.sanskrit} (${rashi.english})` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy this rashi's syllable chart"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy chart"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the chart" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Symbol", rashi ? rashi.symbol : DASH],
            ["Ruling planet", rashi ? rashi.lord : DASH],
            ["Element", rashi ? rashi.element : DASH],
            [
              "Nakshatras spanned",
              span.length
                ? span
                    .map((entry) => `${entry.nakshatra} (${entry.padas} pada${entry.padas === 1 ? "" : "s"})`)
                    .join(", ")
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {rashi ? (
        <div className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[320px] text-left text-sm">
            <caption className="sr-only">
              Naming syllables of {rashi.sanskrit} rashi with their nakshatra padas
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 font-semibold">Syllable</th>
                <th scope="col" className="px-4 py-3 font-semibold">Nakshatra</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Pada</th>
              </tr>
            </thead>
            <tbody>
              {rashi.syllables.map((entry) => (
                <tr key={`${entry.syllable}-${entry.nakshatra}-${entry.pada}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 text-base font-semibold">{entry.syllable}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{entry.nakshatra}</td>
                  <td className="px-4 py-3 text-right">{entry.pada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which rashi does a name belong to?</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="rashi-name">
          Name to look up
        </label>
        <input
          id="rashi-name"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          autoComplete="off"
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        {match.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {match.error}
          </p>
        ) : (
          <div className="mt-4">
            <p className="text-2xl font-semibold text-[var(--primary)]">
              {match.best ? `${match.best.rashi} (${match.best.english})` : "No syllable in the chart"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {match.best
                ? `${match.name} opens on "${match.best.syllable}", from ${match.best.nakshatra} pada ${match.best.pada}.`
                : `No chart syllable opens ${match.name}. Many names of non-Sanskritic origin fall outside the 108.`}
            </p>

            {tiers.map(([label, list]) => (
              <div key={label} className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {label}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {list.map((entry) => (
                    <li key={`${label}-${entry.syllable}-${entry.rashiId}`}>
                      <button
                        type="button"
                        onClick={() => setRashiId(entry.rashiId)}
                        className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        aria-label={`Show the ${entry.rashi} chart, matched on ${entry.syllable}`}
                      >
                        {entry.syllable} · {entry.rashi}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a reference chart for a naming custom, not a prediction about anyone. The rashi used
        for naming is the Moon sign at birth, which needs the exact birth time and place and is not
        the same as a Western sun sign. Families differ on how strictly the syllable is followed, and
        many use a chart syllable for the naamkaran name while using another name day to day.
      </p>
    </main>
  );
}
