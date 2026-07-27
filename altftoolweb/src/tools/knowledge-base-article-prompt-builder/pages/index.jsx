"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LifeBuoy, RotateCcw } from "lucide-react";

import {
  ARTICLE_TYPES,
  AUDIENCE_LEVELS,
  SCREENSHOT_MODES,
  buildKbPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  title: "Reset your Acme Cloud password",
  product: "Acme Cloud",
  typeId: "task",
  audienceId: "new",
  screenshotId: "key",
  prerequisitesText: "A verified email address on the account\nAccess to that inbox",
  stepsText:
    "Open the sign-in page\nSelect Forgot password\nEnter the email address on the account\nOpen the reset link sent to that inbox\nSet a new password and sign in",
  notes: "",
};

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [product, setProduct] = useState(DEFAULTS.product);
  const [typeId, setTypeId] = useState(DEFAULTS.typeId);
  const [audienceId, setAudienceId] = useState(DEFAULTS.audienceId);
  const [screenshotId, setScreenshotId] = useState(DEFAULTS.screenshotId);
  const [prerequisitesText, setPrerequisitesText] = useState(DEFAULTS.prerequisitesText);
  const [stepsText, setStepsText] = useState(DEFAULTS.stepsText);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildKbPrompt({
        title,
        product,
        typeId,
        audienceId,
        screenshotId,
        prerequisitesText,
        stepsText,
        notes,
      }),
    [title, product, typeId, audienceId, screenshotId, prerequisitesText, stepsText, notes],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle(DEFAULTS.title);
    setProduct(DEFAULTS.product);
    setTypeId(DEFAULTS.typeId);
    setAudienceId(DEFAULTS.audienceId);
    setScreenshotId(DEFAULTS.screenshotId);
    setPrerequisitesText(DEFAULTS.prerequisitesText);
    setStepsText(DEFAULTS.stepsText);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Prerequisites listed", DASH],
        ["Steps not in imperative mood", DASH],
        ["Title length", DASH],
        ["Sections requested", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Prerequisites listed", NUM.format(result.prerequisiteCount)],
        [
          "Steps not in imperative mood",
          result.nonImperative === 0 ? "0 — all good" : NUM.format(result.nonImperative),
        ],
        [
          "Title length",
          `${NUM.format(result.titleLength)} characters${result.titleTooLong ? " — likely truncated in search" : ""}`,
        ],
        ["Sections requested", result.type.sections.join(", ")],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LifeBuoy className="h-4 w-4" aria-hidden="true" />
          Help centre
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Knowledge Base Article Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Drop in your steps, prerequisites and screenshot policy. You get a prompt
          structured by DITA topic type, with imperative-mood steps and accessible
          screenshot captions demanded up front.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kb-title">
              Article title — write it the way a user would search
            </label>
            <input
              id="kb-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-product">
              Product or service name
            </label>
            <input
              id="kb-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={product}
              onChange={(event) => setProduct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-type">
              Article type
            </label>
            <select
              id="kb-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={typeId}
              onChange={(event) => setTypeId(event.target.value)}
            >
              {ARTICLE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-audience">
              Reader
            </label>
            <select
              id="kb-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audienceId}
              onChange={(event) => setAudienceId(event.target.value)}
            >
              {AUDIENCE_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-shots">
              Screenshots
            </label>
            <select
              id="kb-shots"
              className={`mt-2 ${INPUT_CLASS}`}
              value={screenshotId}
              onChange={(event) => setScreenshotId(event.target.value)}
            >
              {SCREENSHOT_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kb-prereq">
              Prerequisites — one per line (optional)
            </label>
            <textarea
              id="kb-prereq"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={prerequisitesText}
              onChange={(event) => setPrerequisitesText(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kb-steps">
              Steps — one action per line
            </label>
            <textarea
              id="kb-steps"
              className={`mt-2 ${AREA_CLASS}`}
              rows={6}
              value={stepsText}
              onChange={(event) => setStepsText(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kb-notes">
              Extra instruction (optional)
            </label>
            <input
              id="kb-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. British spelling; link to the billing article at the end"
            />
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
              Steps to expand
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.stepCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.needsStages
                  ? "Long procedure — the prompt asks for named stage headings."
                  : "Each step becomes one imperative instruction with a failure note."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated knowledge base article prompt"
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Section lists follow the OASIS DITA 1.3 information types, and every
        screenshot instruction asks for alt text so the article meets WCAG 2.2
        SC 1.1.1. Anything the model cannot know is marked TODO(verify) — check
        those against the live product before publishing.
      </p>
    </main>
  );
}
