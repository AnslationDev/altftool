"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode, RotateCcw } from "lucide-react";

import {
  AUDIENCE_OPTIONS,
  DOC_TYPE_OPTIONS,
  buildDocPrompt,
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
  subject:
    "Setting up webhook subscriptions: registering an endpoint, verifying the HMAC signature and handling retries",
  product: "Acme Payments API v2",
  docTypeId: "how-to",
  audienceId: "experienced",
  language: "Node.js 20 (JavaScript)",
  inScope: "Creating a subscription via the REST API, signature verification, retry/backoff behaviour",
  outOfScope: "Dashboard-based setup, legacy v1 webhooks",
  prerequisites: "An API key with webhook scope; a publicly reachable HTTPS endpoint",
  includeCode: true,
  includeDiagramHints: false,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setBool = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const result = useMemo(() => buildDocPrompt(form), [form]);
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
        ["Document type", DASH],
        ["Sections", DASH],
        ["Audience", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Document type", result.docTypeLabel],
        ["Sections", NUM.format(result.sectionCount)],
        ["Audience", result.audienceLabel],
        [
          "Prompt length",
          `${NUM.format(result.promptWords)} words · ${NUM.format(result.promptChars)} characters`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Technical Doc Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate a documentation prompt built on the Diátaxis framework — tutorial, how-to,
          reference or explanation — with audience, scope and runnable-code-example rules the AI
          must follow.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="td-subject">
              What is being documented? (required)
            </label>
            <textarea
              id="td-subject"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.subject}
              onChange={set("subject")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-product">
              Product / project (optional)
            </label>
            <input
              id="td-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.product}
              onChange={set("product")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-language">
              Code example language (optional)
            </label>
            <input
              id="td-language"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.language}
              onChange={set("language")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-doctype">
              Document type (Diátaxis)
            </label>
            <select
              id="td-doctype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.docTypeId}
              onChange={set("docTypeId")}
            >
              {DOC_TYPE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-audience">
              Audience
            </label>
            <select
              id="td-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.audienceId}
              onChange={set("audienceId")}
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="td-prereq">
              Assumed prerequisites (optional)
            </label>
            <input
              id="td-prereq"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.prerequisites}
              onChange={set("prerequisites")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-inscope">
              In scope (optional)
            </label>
            <input
              id="td-inscope"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.inScope}
              onChange={set("inScope")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-outscope">
              Out of scope (optional)
            </label>
            <input
              id="td-outscope"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.outOfScope}
              onChange={set("outOfScope")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="td-code"
          >
            <input
              id="td-code"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.includeCode}
              onChange={setBool("includeCode")}
            />
            Include runnable code examples
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="td-diagram"
          >
            <input
              id="td-diagram"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={form.includeDiagramHints}
              onChange={setBool("includeDiagramHints")}
            />
            Insert [DIAGRAM] placeholders
          </label>
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

      <section aria-live="polite" aria-atomic="true" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
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
              aria-label="Copy the generated documentation prompt"
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
        The prompt instructs the AI to write TODO(author) instead of inventing versions, defaults or
        URLs it was not given — search the draft for TODO before publishing.
      </p>
    </main>
  );
}
