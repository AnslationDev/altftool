"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Leaf, RotateCcw, Shuffle } from "lucide-react";
import {
  CLASSIC_PATTERN,
  MAX_COUNT,
  MIN_COUNT,
  SEASONS,
  checkDraft,
  generateHaikuPrompts,
  promptToText,
} from "../lib";

const DEFAULTS = {
  season: "autumn",
  count: 3,
  seed: 1,
  draft: "an old silent pond\na frog jumps into the pond\nsplash silence again",
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
  const [season, setSeason] = useState(DEFAULTS.season);
  const [count, setCount] = useState(String(DEFAULTS.count));
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [draft, setDraft] = useState(DEFAULTS.draft);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () => generateHaikuPrompts({ season, count: Number(count), seed }),
    [season, count, seed],
  );

  const draftCheck = useMemo(() => checkDraft(draft), [draft]);

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
    setSeason(DEFAULTS.season);
    setCount(String(DEFAULTS.count));
    setSeed(DEFAULTS.seed);
    setDraft(DEFAULTS.draft);
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
          <Leaf className="h-4 w-4" aria-hidden="true" />
          Haiku
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Haiku Prompt Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Each prompt gives you a real kigo from the Japanese saijiki, a grounding image, a second
          image to set against it, and where to put the cut. Draft underneath and the syllables are
          counted line by line against {CLASSIC_PATTERN.join("-")}.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hk-season">
              Season
            </label>
            <select
              id="hk-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {SEASONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hk-count">
              How many prompts
            </label>
            <input
              id="hk-count"
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
            <label className={LABEL_CLASS} htmlFor="hk-seed">
              Seed (same seed, same prompts)
            </label>
            <input
              id="hk-seed"
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
          <button type="button" onClick={shuffle} aria-label="Shuffle to new haiku prompts" className={PRIMARY_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle
          </button>
          <button
            type="button"
            onClick={() => copy("all", allText)}
            aria-label="Copy every generated haiku prompt"
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
          {result.error ? "Fix the options above to see prompts." : `${result.season} · ${result.span}`}
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
                Prompt {index + 1}
              </p>
              <p className="mt-2 text-2xl font-semibold" lang="ja">
                {prompt.kigoJp}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {prompt.kigoRomaji} — {prompt.kigoMeaning}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(prompt.id, promptToText(prompt))}
              aria-label={`Copy haiku prompt ${index + 1}`}
              className={GHOST_BTN}
            >
              {copiedId === prompt.id ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedId === prompt.id ? "Copied!" : "Copy"}
            </button>
          </div>

          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Grounding image", prompt.image],
              ["Juxtapose with", prompt.contrast],
              ["Where to cut", `${prompt.cutLabel} — ${prompt.cutGuidance}`],
              ["Lead sense", `${prompt.senseLabel} — ${prompt.senseNudge}`],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{prompt.brief}</p>
        </article>
      ))}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Draft pad</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="hk-draft">
          Three lines
        </label>
        <textarea
          id="hk-draft"
          className="mt-2 min-h-32 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-medium leading-7 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={"line one\nline two\nline three"}
        />

        {draftCheck.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {draftCheck.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated syllables
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${draftCheck.matchesPattern ? "text-[var(--success)]" : "text-[var(--primary)]"}`}
            >
              {draftCheck.lineCount === 0 ? "—" : NUM.format(draftCheck.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">
              {draftCheck.note}
            </p>

            {draftCheck.lines.length > 0 && (
              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {draftCheck.lines.map((item, index) => (
                  <div key={`${index}-${item.line}`} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="min-w-0 flex-1 truncate text-[var(--muted-foreground)]">
                      Line {index + 1}: {item.line}
                    </dt>
                    <dd className="shrink-0 text-right font-semibold">
                      {NUM.format(item.syllables)}
                      {item.target === null ? "" : ` / ${item.target}`}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Syllable counts are estimated from spelling, not from a pronunciation dictionary, so words
        like “fire” and “evening” can be read either way. Many English-language haiku journals do
        not require 5-7-5 at all — the season word and the cut matter more.
      </p>
    </main>
  );
}
