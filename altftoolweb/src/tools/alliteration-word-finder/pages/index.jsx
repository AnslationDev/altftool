"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Type } from "lucide-react";

import { PART_OF_SPEECH_LABELS, buildPhrases, findAlliterativeWords } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const ALL_POS = ["adj", "noun", "verb", "adv"];
const DEFAULT_SEED = "silver";
const DASH = "—";

const EXAMPLES = ["silver", "phone", "knight", "city", "gem", "whale", "quiet", "apple"];

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [strict, setStrict] = useState(false);
  const [selected, setSelected] = useState(ALL_POS);
  const [variant, setVariant] = useState(0);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => findAlliterativeWords({ seed, strict, partsOfSpeech: selected }),
    [seed, strict, selected],
  );

  const hasError = Boolean(result.error);
  const phrases = useMemo(
    () => (hasError ? [] : buildPhrases(result, variant)),
    [result, hasError, variant],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Alliteration for "${result.seed}" — sound ${result.soundLabel}`,
      strict ? `Strict onset cluster: ${result.clusterLabel}` : "Loose match on the first sound",
      "",
    ];
    for (const group of result.groups) {
      if (group.words.length === 0) continue;
      lines.push(`${group.label}: ${group.words.join(", ")}`);
    }
    if (phrases.length > 0) {
      lines.push("", "Sample lines:");
      for (const phrase of phrases) lines.push(`- ${phrase}`);
    }
    return lines.join("\n");
  }, [result, hasError, strict, phrases]);

  const togglePos = (pos) =>
    setSelected((previous) =>
      previous.includes(pos) ? previous.filter((item) => item !== pos) : [...previous, pos],
    );

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
    setSeed(DEFAULT_SEED);
    setStrict(false);
    setSelected(ALL_POS);
    setVariant(0);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Type className="h-4 w-4" aria-hidden="true" />
          Sound devices
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Alliteration Word Finder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Alliteration repeats the starting <em>sound</em>, not the starting letter. Type a word and
          this finder works out its onset — so <strong>phone</strong> pairs with{" "}
          <strong>fire</strong>, <strong>knight</strong> with <strong>night</strong>, and{" "}
          <strong>city</strong> never with <strong>cold</strong> — then lists matching adjectives,
          nouns, verbs and adverbs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="alliteration-seed">
              Word to match
            </label>
            <input
              id="alliteration-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setSeed(example)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {example}
              </button>
            ))}
          </div>

          <fieldset>
            <legend className={LABEL_CLASS}>Word types to search</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ALL_POS.map((pos) => (
                <label
                  key={pos}
                  htmlFor={`alliteration-pos-${pos}`}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id={`alliteration-pos-${pos}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                    checked={selected.includes(pos)}
                    onChange={() => togglePos(pos)}
                  />
                  {PART_OF_SPEECH_LABELS[pos]}
                </label>
              ))}
            </div>
          </fieldset>

          <label
            htmlFor="alliteration-strict"
            className="inline-flex min-h-11 cursor-pointer items-start gap-3 text-sm"
          >
            <input
              id="alliteration-strict"
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
              checked={strict}
              onChange={(event) => setStrict(event.target.checked)}
            />
            <span>
              Strict cluster match — only words with the identical onset cluster (street with
              stream, not with sea)
            </span>
          </label>
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
              Matching words found
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above." : `Starting sound ${result.soundLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the alliteration word list"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the finder"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Word analysed", hasError ? DASH : result.seed],
            ["Onset sound", hasError ? DASH : result.soundLabel],
            ["Onset cluster", hasError ? DASH : result.clusterLabel],
            ["Match mode", hasError ? DASH : strict ? "Strict cluster" : "First sound only"],
            [
              "Word types searched",
              hasError ? DASH : result.groups.map((group) => group.label).join(", "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          {result.groups.map((group) => (
            <section
              key={group.pos}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <h2 className="text-base font-semibold">
                {group.label}{" "}
                <span className="font-normal text-[var(--muted-foreground)]">
                  ({group.words.length})
                </span>
              </h2>
              {group.words.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  No words of this type in the bank start with that sound. Turn off strict cluster
                  matching to widen the search.
                </p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.words.map((word) => (
                    <li key={word}>
                      <button
                        type="button"
                        onClick={() => setSeed(word)}
                        aria-label={`Search again from the word ${word}`}
                        className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        {word}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {phrases.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Sample lines</h2>
                <button
                  type="button"
                  onClick={() => setVariant((value) => value + 1)}
                  aria-label="Show different sample lines"
                  className={GHOST_BTN}
                >
                  <Shuffle className="h-4 w-4" aria-hidden="true" />
                  New lines
                </button>
              </div>
              <ul className="mt-3 grid gap-2 text-sm">
                {phrases.map((phrase) => (
                  <li
                    key={phrase}
                    className="rounded-md border border-[var(--border)] px-3 py-2 leading-6"
                  >
                    {phrase}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                These are raw material, not finished lines — reorder them, cut a word, and keep the
                stressed syllables where you want the beat.
              </p>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sounds are worked out from English spelling conventions, which cover the vast majority of
        words but not every loan word or regional pronunciation. If your accent differs — for
        example a pronounced <em>wh</em> in whale — trust your ear over the label.
      </p>
    </main>
  );
}
