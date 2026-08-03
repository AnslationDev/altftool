"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCommitHorizontal, RotateCcw } from "lucide-react";

import {
  COMMIT_TYPES,
  SUBJECT_SOFT_LIMIT,
  buildCommitPrompt,
  buildHeaderPreview,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  typeId: "feat",
  scope: "auth",
  breaking: false,
  diffSummary:
    "Added a password-reset flow: new POST /auth/reset-request endpoint that emails a signed one-time token, new reset form page, and rate limiting of 3 requests per hour per account. Extracted the email templating into templates/email/. No changes to the login endpoint.",
  breakingDetail: "",
  issueRef: "",
};

const DASH = "—";

export default function ToolHome() {
  const [typeId, setTypeId] = useState(DEFAULTS.typeId);
  const [scope, setScope] = useState(DEFAULTS.scope);
  const [breaking, setBreaking] = useState(DEFAULTS.breaking);
  const [diffSummary, setDiffSummary] = useState(DEFAULTS.diffSummary);
  const [breakingDetail, setBreakingDetail] = useState(DEFAULTS.breakingDetail);
  const [issueRef, setIssueRef] = useState(DEFAULTS.issueRef);
  const [copied, setCopied] = useState(false);

  // The header preview depends only on type/scope/breaking, and stays valid
  // independent of whether the diff summary (below) currently passes
  // validation — so it's computed and rendered separately from the prompt.
  const preview = useMemo(
    () => buildHeaderPreview({ typeId, scope, breaking, description: "" }),
    [typeId, scope, breaking],
  );
  const previewHasError = Boolean(preview.error);

  const promptResult = useMemo(() => {
    if (previewHasError) return null;
    return buildCommitPrompt({ diffSummary, breakingDetail, issueRef, preview });
  }, [previewHasError, preview, diffSummary, breakingDetail, issueRef]);

  const promptHasError = Boolean(promptResult?.error);
  const errorMessage = previewHasError ? preview.error : promptHasError ? promptResult.error : null;

  const copyResult = async () => {
    if (previewHasError || promptHasError || !promptResult) return;
    try {
      await navigator.clipboard.writeText(promptResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your diff summary and breaking-change detail with the demo example values and cannot be undone.",
      )
    ) {
      return;
    }
    setTypeId(DEFAULTS.typeId);
    setScope(DEFAULTS.scope);
    setBreaking(DEFAULTS.breaking);
    setDiffSummary(DEFAULTS.diffSummary);
    setBreakingDetail(DEFAULTS.breakingDetail);
    setIssueRef(DEFAULTS.issueRef);
    setCopied(false);
  };

  const rows = [
    ["Prefix length", previewHasError ? DASH : `${preview.fixedLength} characters`],
    [
      "Room left for the description",
      previewHasError ? DASH : `${preview.room} of ${SUBJECT_SOFT_LIMIT} subject characters`,
    ],
    ["Breaking change", previewHasError ? DASH : preview.breaking ? "Yes — footer required" : "No"],
    [
      "Prompt length",
      previewHasError || promptHasError
        ? DASH
        : `${NUM.format(promptResult.words)} words · ~${NUM.format(promptResult.approxTokens)} tokens`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCommitHorizontal className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Commit Message Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Locks the Conventional Commits type, scope and breaking-change
          marker, computes how much of the 50-character subject your prefix
          leaves, and writes a prompt that turns your diff summary into a
          clean commit message.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cmp-type">
              Commit type
            </label>
            <select
              id="cmp-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={typeId}
              onChange={(event) => setTypeId(event.target.value)}
            >
              {COMMIT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmp-scope">
              Scope (optional)
            </label>
            <input
              id="cmp-scope"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              placeholder="e.g. auth, parser, api"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cmp-summary">
              What changed (summary or trimmed diff)
            </label>
            <textarea
              id="cmp-summary"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              spellCheck={false}
              value={diffSummary}
              onChange={(event) => setDiffSummary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmp-issue">
              Issue / ticket reference (optional)
            </label>
            <input
              id="cmp-issue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={issueRef}
              onChange={(event) => setIssueRef(event.target.value)}
              placeholder="e.g. #482 or JIRA-1201"
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="cmp-breaking"
            >
              <input
                id="cmp-breaking"
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={breaking}
                onChange={(event) => setBreaking(event.target.checked)}
              />
              Breaking change (adds "!" and a BREAKING CHANGE footer)
            </label>
          </div>
          {breaking ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="cmp-breaking-detail">
                What breaks, and how do users migrate?
              </label>
              <textarea
                id="cmp-breaking-detail"
                className={`mt-2 ${AREA_CLASS}`}
                rows={2}
                value={breakingDetail}
                onChange={(event) => setBreakingDetail(event.target.value)}
                placeholder="e.g. /auth/reset now requires a JSON body; form posts stop working"
              />
            </div>
          ) : null}
        </div>
      </section>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      {!previewHasError && preview.warnings.length > 0 ? (
        <ul aria-live="polite" role="status" className="mt-6 space-y-2">
          {preview.warnings.map((warning) => (
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Header the prompt enforces
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {previewHasError ? DASH : preview.header}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {previewHasError
                ? "Fix the input above to see a result."
                : "The model fills <description> in imperative mood within the length budget."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={previewHasError || promptHasError}
              aria-label="Copy the generated commit message prompt"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
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
              className={GHOST_BTN}
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
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {previewHasError || promptHasError ? DASH : promptResult.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Types follow the Conventional Commits v1.0.0 specification (feat and
        fix from the spec, the rest from the Angular convention it
        references); the 50/72 length rules are the long-standing git
        convention used by git log and GitHub's UI.
      </p>
    </main>
  );
}
