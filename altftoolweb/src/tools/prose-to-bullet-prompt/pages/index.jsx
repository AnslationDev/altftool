"use client";

import { useMemo, useState } from "react";
import { Check, Copy, List, RotateCcw } from "lucide-react";
import { BULLET_STYLES, ORDERINGS, buildProseToBulletPrompt } from "../lib";

const DEFAULT_PROSE = `The migration moved the billing service onto a managed queue over four weeks. Latency at the ninety-fifth percentile fell from 840 milliseconds to 210 milliseconds, measured across production traffic rather than a synthetic benchmark. Two incidents occurred during the rollout, both traced to stale configuration rather than the queue itself. The runbook was rewritten and handed to the on-call rota before the final cutover.`;

const DEFAULTS = {
  prose: DEFAULT_PROSE,
  style: "claim-number",
  ordering: "importance",
  compressionPct: "40",
  wordsPerBullet: "12",
  audience: "Engineering leadership reading it on a phone",
  mustKeep: "840 ms, 210 ms, on-call rota",
  allowSubBullets: true,
};

const STYLE_LABELS = {
  "noun-phrase": "Noun phrases",
  "verb-first": "Verb first",
  "claim-number": "Claim then number",
  "question-answer": "Question and answer",
};

const ORDER_LABELS = {
  source: "Keep original order",
  importance: "Most important first",
  chronological: "Chronological",
  grouped: "Grouped under headings",
};

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildProseToBulletPrompt({
        prose: form.prose,
        style: form.style,
        ordering: form.ordering,
        compressionPct: form.compressionPct === "" ? 0 : Number(form.compressionPct),
        wordsPerBullet: form.wordsPerBullet === "" ? 0 : Number(form.wordsPerBullet),
        audience: form.audience,
        mustKeep: form.mustKeep,
        allowSubBullets: form.allowSubBullets,
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    ["Source length", failed ? DASH : `${result.wordCount} words · ${result.sentenceCount} sentences`],
    ["Average sentence", failed ? DASH : `${result.wordsPerSentence} words`],
    ["Flesch Reading Ease", failed ? DASH : `${result.ease} (${result.band})`],
    ["Flesch-Kincaid grade", failed ? DASH : String(result.grade)],
    ["Target list length", failed ? DASH : `${result.targetWords} words`],
    ["Words per bullet", failed ? DASH : String(result.actualWordsPerBullet)],
    ["Prompt length", failed ? DASH : `${result.promptWordCount} words · ~${result.tokenEstimate} tokens`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <List className="h-4 w-4" aria-hidden="true" />
          Knowledge prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Prose to Bullet Prompt</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure how dense your paragraphs really are, set how far to compress them, and generate a
          prompt that keeps every fact while cutting the padding.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL} htmlFor="pb-prose">Your prose</label>
          <textarea id="pb-prose" rows={8} className={`mt-2 ${TEXTAREA}`} value={form.prose} onChange={set("prose")} />
          <p className={HINT}>Paste paragraphs. Everything is measured in your browser.</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="pb-style">Bullet style</label>
            <select id="pb-style" className={`mt-2 ${INPUT}`} value={form.style} onChange={set("style")}>
              {Object.keys(BULLET_STYLES).map((key) => (
                <option key={key} value={key}>{STYLE_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="pb-order">Ordering</label>
            <select id="pb-order" className={`mt-2 ${INPUT}`} value={form.ordering} onChange={set("ordering")}>
              {Object.keys(ORDERINGS).map((key) => (
                <option key={key} value={key}>{ORDER_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="pb-compression">Compress to (% of original)</label>
            <input id="pb-compression" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="5" max="90" step="5" value={form.compressionPct} onChange={set("compressionPct")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pb-perbullet">Words per bullet</label>
            <input id="pb-perbullet" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="3" max="40" value={form.wordsPerBullet} onChange={set("wordsPerBullet")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pb-audience">Audience</label>
            <input id="pb-audience" className={`mt-2 ${INPUT}`} value={form.audience} onChange={set("audience")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pb-keep">Must survive verbatim</label>
            <input id="pb-keep" className={`mt-2 ${INPUT}`} value={form.mustKeep} onChange={set("mustKeep")} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            id="pb-sub"
            type="checkbox"
            checked={form.allowSubBullets}
            onChange={(event) => setForm((prev) => ({ ...prev, allowSubBullets: event.target.checked }))}
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
          />
          <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="pb-sub">
            Allow one level of sub-bullets
          </label>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Bullets to aim for
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.bulletCount}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to generate your prompt."
                : result.needsGrouping
                  ? "Past seven items a flat list stops being scannable — the prompt asks for headings."
                  : `Compressing ${result.wordCount} words down to about ${result.targetWords}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={failed} aria-label="Copy the prose to bullet prompt" className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Readability scores use the published Flesch and Flesch-Kincaid formulas, but syllables are
        counted by heuristic rather than dictionary lookup, and abbreviations inflate the sentence
        count — read them as estimates, not measurements.
      </p>
    </main>
  );
}
