"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IdCard, RotateCcw } from "lucide-react";

import {
  ABOUT_MAX_CHARS,
  DEFAULT_PREVIEW_CHARS,
  GOALS,
  HEADLINE_MAX_CHARS,
  PREVIEW_CHARS_MAX,
  PREVIEW_CHARS_MIN,
  SEGMENT_MAX,
  SEGMENT_MIN,
  SEPARATORS,
  TONES,
  buildHeadlinePrompt,
  parseKeywords,
  planHeadline,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  currentRole: "Senior product manager at a payments startup",
  targetRole: "Director of Product, Payments",
  audience: "fintech hiring managers and recruiters in India",
  proof: "raised UPI payment success rate from 88% to 96% across 12M monthly users",
  differentiator: "an ex-engineer who still reads the SQL before a launch review",
  keywords: "Product Manager, Fintech, Payments, UPI",
  goalId: "job-search",
  toneId: "plain",
  separatorId: "pipe",
  segmentCount: "3",
  previewChars: String(DEFAULT_PREVIEW_CHARS),
  variantCount: "5",
  draft: "Product Manager | Fintech payments | Took UPI success from 88% to 96%",
};

const DASH = "—";

export default function ToolHome() {
  const [currentRole, setCurrentRole] = useState(DEFAULTS.currentRole);
  const [targetRole, setTargetRole] = useState(DEFAULTS.targetRole);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [proof, setProof] = useState(DEFAULTS.proof);
  const [differentiator, setDifferentiator] = useState(DEFAULTS.differentiator);
  const [keywords, setKeywords] = useState(DEFAULTS.keywords);
  const [goalId, setGoalId] = useState(DEFAULTS.goalId);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [separatorId, setSeparatorId] = useState(DEFAULTS.separatorId);
  const [segmentCount, setSegmentCount] = useState(DEFAULTS.segmentCount);
  const [previewChars, setPreviewChars] = useState(DEFAULTS.previewChars);
  const [variantCount, setVariantCount] = useState(DEFAULTS.variantCount);
  const [draft, setDraft] = useState(DEFAULTS.draft);
  const [copied, setCopied] = useState(false);

  const separator =
    SEPARATORS.find((option) => option.id === separatorId) ?? SEPARATORS[0];

  const budget = useMemo(
    () =>
      planHeadline({
        segmentCount: segmentCount.trim() === "" ? Number.NaN : Number(segmentCount),
        separatorValue: separator.value,
        previewChars: previewChars.trim() === "" ? Number.NaN : Number(previewChars),
        draft,
        keywords: parseKeywords(keywords),
      }),
    [segmentCount, separator.value, previewChars, draft, keywords],
  );

  const result = useMemo(
    () =>
      buildHeadlinePrompt({
        currentRole,
        targetRole,
        audience,
        proof,
        differentiator,
        goalId,
        toneId,
        budget,
        variantCount:
          variantCount.trim() === "" ? Number.NaN : Number(variantCount),
      }),
    [
      currentRole,
      targetRole,
      audience,
      proof,
      differentiator,
      goalId,
      toneId,
      budget,
      variantCount,
    ],
  );

  const errorMessage = budget.error || result.error || "";
  const hasError = Boolean(errorMessage);

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
    setCurrentRole(DEFAULTS.currentRole);
    setTargetRole(DEFAULTS.targetRole);
    setAudience(DEFAULTS.audience);
    setProof(DEFAULTS.proof);
    setDifferentiator(DEFAULTS.differentiator);
    setKeywords(DEFAULTS.keywords);
    setGoalId(DEFAULTS.goalId);
    setToneId(DEFAULTS.toneId);
    setSeparatorId(DEFAULTS.separatorId);
    setSegmentCount(DEFAULTS.segmentCount);
    setPreviewChars(DEFAULTS.previewChars);
    setVariantCount(DEFAULTS.variantCount);
    setDraft(DEFAULTS.draft);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Characters per segment", DASH],
        ["Separators use", DASH],
        ["Your draft headline", DASH],
        ["Characters left", DASH],
        ["Keywords present", DASH],
        ["About section limit", DASH],
      ]
    : [
        [
          "Characters per segment",
          `${NUM.format(budget.perSegmentChars)} × ${budget.segments}`,
        ],
        ["Separators use", `${NUM.format(budget.separatorTotal)} characters`],
        ["Your draft headline", `${NUM.format(budget.draftChars)} characters`],
        [
          "Characters left",
          budget.overBy > 0
            ? `${NUM.format(budget.overBy)} over the limit`
            : NUM.format(budget.remainingChars),
        ],
        [
          "Keywords present",
          budget.keywords.length === 0
            ? "None entered"
            : `${NUM.format(budget.keywordsFound.length)} of ${NUM.format(budget.keywords.length)} (${NUM.format(budget.keywordsInPreview.length)} in the visible opening)`,
        ],
        ["About section limit", `${NUM.format(budget.aboutMaxChars)} characters`],
        ["Prompt length", `${NUM.format(result.words)} words`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          LinkedIn positioning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          LinkedIn Headline Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits LinkedIn&rsquo;s {NUM.format(HEADLINE_MAX_CHARS)}-character headline
          field across the positioning segments you want, checks your draft against
          it, and writes a headline plus About-section prompt carrying that budget.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lh-current">
              What you do today
            </label>
            <input
              id="lh-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={currentRole}
              onChange={(event) => setCurrentRole(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-target">
              What you want to be found for
            </label>
            <input
              id="lh-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-audience">
              Who you want to reach
            </label>
            <input
              id="lh-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lh-proof">
              One proof point with a number
            </label>
            <input
              id="lh-proof"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={proof}
              onChange={(event) => setProof(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lh-diff">
              What makes you different (optional)
            </label>
            <input
              id="lh-diff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={differentiator}
              onChange={(event) => setDifferentiator(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lh-keywords">
              Search terms to include, comma separated
            </label>
            <input
              id="lh-keywords"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-goal">
              Goal of the profile
            </label>
            <select
              id="lh-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goalId}
              onChange={(event) => setGoalId(event.target.value)}
            >
              {GOALS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-tone">
              Tone
            </label>
            <select
              id="lh-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-segments">
              Headline segments
            </label>
            <input
              id="lh-segments"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={SEGMENT_MIN}
              max={SEGMENT_MAX}
              value={segmentCount}
              onChange={(event) => setSegmentCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-separator">
              Separator between segments
            </label>
            <select
              id="lh-separator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separatorId}
              onChange={(event) => setSeparatorId(event.target.value)}
            >
              {SEPARATORS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-preview">
              Front-load length (characters)
            </label>
            <input
              id="lh-preview"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={PREVIEW_CHARS_MIN}
              max={PREVIEW_CHARS_MAX}
              value={previewChars}
              onChange={(event) => setPreviewChars(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-variants">
              Headline options to request
            </label>
            <input
              id="lh-variants"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              value={variantCount}
              onChange={(event) => setVariantCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lh-draft">
              Draft headline to measure (optional)
            </label>
            <textarea
              id="lh-draft"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      {!hasError && budget.warnings.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {budget.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Headline characters left
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(budget.remainingChars)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Out of ${NUM.format(budget.maxChars)} characters, with ${NUM.format(budget.perSegmentChars)} per segment once the separators are paid for.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated LinkedIn headline prompt"
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
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && budget.draftChars > 0 ? (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              What readers see before truncation
            </h2>
            <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm break-words">
              {budget.previewText}
              {budget.draftChars > budget.previewChars ? "…" : ""}
            </p>
          </div>
        ) : null}

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
        The {NUM.format(HEADLINE_MAX_CHARS)}-character headline and{" "}
        {NUM.format(ABOUT_MAX_CHARS)}-character About limits are LinkedIn&rsquo;s own
        field maximums. The front-load length is a writing heuristic — where the
        headline actually truncates depends on the surface and screen width.
      </p>
    </main>
  );
}
