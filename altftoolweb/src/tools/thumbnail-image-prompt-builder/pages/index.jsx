"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ImagePlay, RotateCcw } from "lucide-react";

import {
  BACKGROUNDS,
  EMOTIONS,
  PLATFORMS,
  SUBJECT_TREATMENTS,
  TEXT_POSITIONS,
  buildThumbnailPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  subject: "testing 5 budget microphones",
  headline: "CHEAP MIC KING",
  platformId: "youtube",
  treatmentId: "face",
  emotionId: "curiosity",
  backgroundId: "radial",
  textPositionId: "left",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const result = useMemo(
    () =>
      buildThumbnailPrompt({
        subject: form.subject,
        headline: form.headline,
        platformId: form.platformId,
        treatmentId: form.treatmentId,
        emotionId: form.emotionId,
        backgroundId: form.backgroundId,
        textPositionId: form.textPositionId,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyText = hasError
    ? ""
    : `${result.prompt}\n\nNegative prompt: ${result.negativePrompt}\n\nTypography:\n${result.warnings.map((line) => `- ${line}`).join("\n")}`;

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
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

  const specRows = hasError
    ? [
        ["Canvas size", DASH],
        ["Smallest render width", DASH],
        ["Minimum text cap height", DASH],
        ["Headline budget", DASH],
        ["Your headline", DASH],
      ]
    : [
        [
          "Canvas size",
          `${NUM.format(result.specs.width)} x ${NUM.format(result.specs.height)} px (${result.specs.aspect})`,
        ],
        ["Smallest render width", `${NUM.format(result.specs.smallestRenderWidthPx)} px`],
        [
          "Minimum text cap height",
          `${NUM.format(result.specs.minCapHeightPx)} px (${NUM.format(result.specs.minCapHeightPctOfHeight)}% of height)`,
        ],
        [
          "Headline budget",
          `${result.specs.charsPerLine} chars/line x 2 lines = ${result.specs.maxHeadlineChars} chars`,
        ],
        [
          "Your headline",
          result.headline
            ? `${result.headlineChars} chars, ${result.headlineWords} words — ${result.headlineFits ? "fits" : "too long"}`
            : "none",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ImagePlay className="h-4 w-4" aria-hidden="true" />
          Image prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Thumbnail Image Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate a high-contrast thumbnail prompt that reserves clean space for your headline —
          and check the headline against the character budget computed from the smallest size the
          platform actually renders your thumbnail at.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tb-subject">
              What is the video / post about?
            </label>
            <input
              id="tb-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={220}
              value={form.subject}
              onChange={set("subject")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-headline">
              Planned headline text (optional)
            </label>
            <input
              id="tb-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={120}
              placeholder="Typeset later in an editor"
              value={form.headline}
              onChange={set("headline")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-platform">
              Platform
            </label>
            <select
              id="tb-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.platformId}
              onChange={set("platformId")}
            >
              {PLATFORMS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-treatment">
              Subject treatment
            </label>
            <select
              id="tb-treatment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.treatmentId}
              onChange={set("treatmentId")}
            >
              {SUBJECT_TREATMENTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-emotion">
              Emotion
            </label>
            <select
              id="tb-emotion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.emotionId}
              onChange={set("emotionId")}
            >
              {EMOTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-background">
              Background
            </label>
            <select
              id="tb-background"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.backgroundId}
              onChange={set("backgroundId")}
            >
              {BACKGROUNDS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tb-textpos">
              Text zone position
            </label>
            <select
              id="tb-textpos"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.textPositionId}
              onChange={set("textPositionId")}
            >
              {TEXT_POSITIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
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
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated prompt
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 text-sm leading-6">
              {hasError ? DASH : result.prompt}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Negative prompt
            </p>
            <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : result.negativePrompt}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the thumbnail prompt, negative prompt and typography notes"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {specRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.platform.label}: {result.platform.overlayNote}
          </p>
        ) : null}
      </section>

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Typography and layout notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Canvas sizes follow published platform specs (YouTube 1280 x 720 with a 2 MB upload cap,
        Open Graph 1200 x 630, Apple&apos;s 3000 x 3000 podcast art). The text-size maths assumes
        a bold display face and a 12 px legibility floor at the platform&apos;s smallest render —
        always eyeball the final thumbnail at real size before publishing.
      </p>
    </main>
  );
}
