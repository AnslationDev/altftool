"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Feather, RotateCcw, Shuffle } from "lucide-react";
import {
  CHARACTER_TYPES,
  GENRES,
  LENGTH_TARGETS,
  MAX_COUNT,
  MIN_COUNT,
  TONES,
  generateStoryPrompts,
  promptToText,
} from "../lib";

const DEFAULTS = {
  genre: "mystery",
  tone: "any",
  character: "any",
  length: "flash",
  count: 3,
  seed: 1,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [genre, setGenre] = useState(DEFAULTS.genre);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [character, setCharacter] = useState(DEFAULTS.character);
  const [length, setLength] = useState(DEFAULTS.length);
  const [count, setCount] = useState(String(DEFAULTS.count));
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateStoryPrompts({
        genre,
        tone,
        character,
        length,
        count: Number(count),
        seed,
      }),
    [genre, tone, character, length, count, seed],
  );

  const allText = useMemo(() => {
    if (result.error || !result.prompts) return "";
    return result.prompts.map((prompt) => promptToText(prompt)).join("\n\n———\n\n");
  }, [result]);

  const copy = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setGenre(DEFAULTS.genre);
    setTone(DEFAULTS.tone);
    setCharacter(DEFAULTS.character);
    setLength(DEFAULTS.length);
    setCount(String(DEFAULTS.count));
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const shuffle = () => {
    setSeed(Math.floor(Math.random() * 100000) + 1);
    setCopiedId("");
  };

  const prompts = result.error ? [] : result.prompts;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Feather className="h-4 w-4" aria-hidden="true" />
          Creative writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Story Prompt Generator by Genre
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every prompt is built as a full logline — protagonist, want, obstacle, setting and
          stakes — plus a reversal to aim at and a first line you can steal. Pick a genre, set the
          tone, and shuffle until one of them itches.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-genre">
              Genre
            </label>
            <select
              id="sp-genre"
              className={`mt-2 ${INPUT_CLASS}`}
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
            >
              {GENRES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-tone">
              Tone
            </label>
            <select
              id="sp-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-character">
              Character type
            </label>
            <select
              id="sp-character"
              className={`mt-2 ${INPUT_CLASS}`}
              value={character}
              onChange={(event) => setCharacter(event.target.value)}
            >
              {CHARACTER_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-length">
              Target length
            </label>
            <select
              id="sp-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={length}
              onChange={(event) => setLength(event.target.value)}
            >
              {LENGTH_TARGETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (~{NUM.format(item.words)} words)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-count">
              How many prompts
            </label>
            <input
              id="sp-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_COUNT}
              max={MAX_COUNT}
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-seed">
              Seed (same seed, same prompts)
            </label>
            <input
              id="sp-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              step="1"
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={shuffle} aria-label="Shuffle to a new set of prompts" className={PRIMARY_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle
          </button>
          <button
            type="button"
            onClick={() => copy("all", allText)}
            aria-label="Copy every generated prompt"
            className={GHOST_BTN}
            disabled={!allText}
          >
            {copiedId === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copiedId === "all" ? "Copied!" : "Copy all"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset all options" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Prompts generated
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {result.error ? "—" : NUM.format(prompts.length)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {result.error
            ? "Fix the options above to see prompts."
            : `${result.genre} · target ${NUM.format(result.wordTarget)} words (${result.lengthLabel})`}
        </p>
      </section>

      {prompts.map((prompt, index) => (
        <article
          key={prompt.id}
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Prompt {index + 1} · {prompt.genre} · {prompt.tone}
              </p>
              <p className="mt-2 text-lg font-semibold leading-7">{prompt.logline}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(prompt.id, promptToText(prompt))}
              aria-label={`Copy prompt ${index + 1}`}
              className={GHOST_BTN}
            >
              {copiedId === prompt.id ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedId === prompt.id ? "Copied!" : "Copy"}
            </button>
          </div>

          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Character", prompt.characterLabel],
              ["Want", prompt.want],
              ["Obstacle", prompt.obstacle],
              ["Setting", prompt.setting],
              ["Stakes", prompt.stakes],
              ["Twist to aim at", prompt.twist],
              ["Length target", `${NUM.format(prompt.wordTarget)} words — ${prompt.lengthNote}`],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm italic leading-6">
            Try opening with: “{prompt.opening}”
          </p>
        </article>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Prompts are combinatorial, not authored one by one — treat the logline as a starting shape
        and change anything that fights the story you actually want to write.
      </p>
    </main>
  );
}
