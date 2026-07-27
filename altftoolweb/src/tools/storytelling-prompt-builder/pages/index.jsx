"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  ARC_OPTIONS,
  ENDING_OPTIONS,
  LENGTH_OPTIONS,
  PACING_OPTIONS,
  POV_OPTIONS,
  TONE_OPTIONS,
  buildStoryPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  premise:
    "A lighthouse keeper discovers that the ships she has been guiding safely to shore for twenty years never existed.",
  protagonist: "Mara, a meticulous, solitary lighthouse keeper nearing retirement",
  setting: "A storm-battered island off a cold northern coast, present day",
  genre: "literary speculative",
  themes: "duty, isolation, what we owe to illusions that keep us going",
  arcId: ARC_OPTIONS[0].id,
  povId: "third-limited",
  toneId: "melancholy",
  pacingId: "slow-burn",
  endingId: "ambiguous",
  lengthId: "short",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildStoryPrompt(form), [form]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
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

  const rows = hasError
    ? [
        ["Narrative arc", DASH],
        ["Story beats", DASH],
        ["Target story length", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Narrative arc", result.arcLabel],
        ["Story beats", NUM.format(result.beatCount)],
        ["Target story length", `${NUM.format(result.targetWords)} words`],
        [
          "Prompt length",
          `${NUM.format(result.promptWords)} words · ${NUM.format(result.promptChars)} characters`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Storytelling Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a premise into a complete fiction-writing prompt with a proper narrative arc —
          three-act, Hero&apos;s Journey, Freytag&apos;s pyramid or kishōtenketsu — plus point of
          view, tone, pacing and ending controls.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="st-premise">
              Story premise (required)
            </label>
            <textarea
              id="st-premise"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.premise}
              onChange={set("premise")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-protagonist">
              Protagonist (optional)
            </label>
            <input
              id="st-protagonist"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.protagonist}
              onChange={set("protagonist")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-setting">
              Setting (optional)
            </label>
            <input
              id="st-setting"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.setting}
              onChange={set("setting")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-genre">
              Genre (optional)
            </label>
            <input
              id="st-genre"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.genre}
              onChange={set("genre")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-themes">
              Themes (optional)
            </label>
            <input
              id="st-themes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.themes}
              onChange={set("themes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-arc">
              Narrative arc
            </label>
            <select
              id="st-arc"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.arcId}
              onChange={set("arcId")}
            >
              {ARC_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-pov">
              Point of view
            </label>
            <select
              id="st-pov"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.povId}
              onChange={set("povId")}
            >
              {POV_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-tone">
              Tone
            </label>
            <select
              id="st-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.toneId}
              onChange={set("toneId")}
            >
              {TONE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-pacing">
              Pacing
            </label>
            <select
              id="st-pacing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.pacingId}
              onChange={set("pacingId")}
            >
              {PACING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-ending">
              Ending
            </label>
            <select
              id="st-ending"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.endingId}
              onChange={set("endingId")}
            >
              {ENDING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-length">
              Story length
            </label>
            <select
              id="st-length"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lengthId}
              onChange={set("lengthId")}
            >
              {LENGTH_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} (~{NUM.format(option.words)} words)
                </option>
              ))}
            </select>
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
              Estimated prompt tokens
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.estTokens)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the prompt."
                : "Rough estimate at ~4 characters per token."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated storytelling prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
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

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt encodes the arc beats and craft constraints; the story itself still depends on
        the AI model you paste it into. Edit any beat in the copied text to steer the draft further.
      </p>
    </main>
  );
}
