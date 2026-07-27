"use client";

import { useMemo, useState } from "react";
import { BadgeInfo, Check, Copy, RotateCcw } from "lucide-react";

import {
  ASSISTANCE_LEVELS,
  CONTENT_TYPES,
  MEDIA_OPTIONS,
  buildDisclosure,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  contentTypeId: "article",
  assistanceId: "editing",
  mediaId: "none",
  toolNames: "",
  humanReviewed: true,
  reviewerRole: "",
  orgName: "",
};

const DASH = "—";

export default function ToolHome() {
  const [contentTypeId, setContentTypeId] = useState(DEFAULTS.contentTypeId);
  const [assistanceId, setAssistanceId] = useState(DEFAULTS.assistanceId);
  const [mediaId, setMediaId] = useState(DEFAULTS.mediaId);
  const [toolNames, setToolNames] = useState(DEFAULTS.toolNames);
  const [humanReviewed, setHumanReviewed] = useState(DEFAULTS.humanReviewed);
  const [reviewerRole, setReviewerRole] = useState(DEFAULTS.reviewerRole);
  const [orgName, setOrgName] = useState(DEFAULTS.orgName);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildDisclosure({
        contentTypeId,
        assistanceId,
        mediaId,
        toolNames,
        humanReviewed,
        reviewerRole,
        orgName,
      }),
    [contentTypeId, assistanceId, mediaId, toolNames, humanReviewed, reviewerRole, orgName],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.statement);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setContentTypeId(DEFAULTS.contentTypeId);
    setAssistanceId(DEFAULTS.assistanceId);
    setMediaId(DEFAULTS.mediaId);
    setToolNames(DEFAULTS.toolNames);
    setHumanReviewed(DEFAULTS.humanReviewed);
    setReviewerRole(DEFAULTS.reviewerRole);
    setOrgName(DEFAULTS.orgName);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeInfo className="h-4 w-4" aria-hidden="true" />
          AI Governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Content Disclosure Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a clear, honest disclosure statement for AI-assisted articles, reports and
          marketing content — stating what the AI did, who reviewed it and who is accountable.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-type">
              Content type
            </label>
            <select
              id="dis-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contentTypeId}
              onChange={(event) => setContentTypeId(event.target.value)}
            >
              {CONTENT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-level">
              How AI was used
            </label>
            <select
              id="dis-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assistanceId}
              onChange={(event) => setAssistanceId(event.target.value)}
            >
              {ASSISTANCE_LEVELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-media">
              Images and media
            </label>
            <select
              id="dis-media"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mediaId}
              onChange={(event) => setMediaId(event.target.value)}
            >
              {MEDIA_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-tools">
              AI tools named (optional, comma-separated)
            </label>
            <input
              id="dis-tools"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={toolNames}
              onChange={(event) => setToolNames(event.target.value)}
              placeholder="e.g. ChatGPT, Claude"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-reviewer">
              Who reviewed it (optional)
            </label>
            <input
              id="dis-reviewer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={reviewerRole}
              onChange={(event) => setReviewerRole(event.target.value)}
              placeholder="e.g. the author and a senior editor"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-org">
              Organisation name (optional)
            </label>
            <input
              id="dis-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              placeholder="e.g. Acme Media"
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="dis-reviewed"
        >
          <input
            id="dis-reviewed"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={humanReviewed}
            onChange={(event) => setHumanReviewed(event.target.checked)}
          />
          A human reviewed, fact-checked and approved the final content
        </label>
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
              Suggested label
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.shortLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the disclosure statement"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy statement"}
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

        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Disclosure statement</dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6">
              {hasError ? DASH : result.statement}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Where to place it</dt>
            <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
              {hasError ? DASH : result.placementTip}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Disclosure duties vary by jurisdiction,
        platform and industry — for example Article 50 of the EU AI Act and FTC guidance on clear
        and conspicuous disclosures. Have your policy reviewed by counsel where compliance matters.
      </p>
    </main>
  );
}
