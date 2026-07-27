"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Quote, RotateCcw } from "lucide-react";

import { STYLE_OPTIONS, buildAttribution } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  styleId: "apa",
  toolName: "ChatGPT",
  provider: "OpenAI",
  versionLabel: "GPT-4o",
  dateUsed: "2026-07-01",
  url: "https://chatgpt.com",
  promptSummary: "",
  usageDescription: "",
};

const DASH = "—";

export default function ToolHome() {
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [toolName, setToolName] = useState(DEFAULTS.toolName);
  const [provider, setProvider] = useState(DEFAULTS.provider);
  const [versionLabel, setVersionLabel] = useState(DEFAULTS.versionLabel);
  const [dateUsed, setDateUsed] = useState(DEFAULTS.dateUsed);
  const [url, setUrl] = useState(DEFAULTS.url);
  const [promptSummary, setPromptSummary] = useState(DEFAULTS.promptSummary);
  const [usageDescription, setUsageDescription] = useState(DEFAULTS.usageDescription);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildAttribution({
        styleId,
        toolName,
        provider,
        versionLabel,
        dateUsed,
        url,
        promptSummary,
        usageDescription,
      }),
    [styleId, toolName, provider, versionLabel, dateUsed, url, promptSummary, usageDescription],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(
        `${result.reference}\n\nIn-text: ${result.inText}\n\nAcknowledgement: ${result.acknowledgement}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStyleId(DEFAULTS.styleId);
    setToolName(DEFAULTS.toolName);
    setProvider(DEFAULTS.provider);
    setVersionLabel(DEFAULTS.versionLabel);
    setDateUsed(DEFAULTS.dateUsed);
    setUrl(DEFAULTS.url);
    setPromptSummary(DEFAULTS.promptSummary);
    setUsageDescription(DEFAULTS.usageDescription);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Quote className="h-4 w-4" aria-hidden="true" />
          AI Governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Attribution Statement Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a citation-style attribution for AI assistance in APA 7, MLA 9 or Chicago format,
          plus a journal-style acknowledgement statement you can paste into your paper.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="att-style">
              Citation style
            </label>
            <select
              id="att-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {STYLE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-tool">
              AI tool name
            </label>
            <input
              id="att-tool"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={toolName}
              onChange={(event) => setToolName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-provider">
              Provider
            </label>
            <input
              id="att-provider"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              placeholder="e.g. OpenAI, Anthropic, Google"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-version">
              Model or version (optional)
            </label>
            <input
              id="att-version"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={versionLabel}
              onChange={(event) => setVersionLabel(event.target.value)}
              placeholder="e.g. GPT-4o or Mar 14 version"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-date">
              Date the output was generated
            </label>
            <input
              id="att-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dateUsed}
              onChange={(event) => setDateUsed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-url">
              Tool URL (optional)
            </label>
            <input
              id="att-url"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-prompt">
              Prompt summary (used by MLA)
            </label>
            <input
              id="att-prompt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={promptSummary}
              onChange={(event) => setPromptSummary(event.target.value)}
              placeholder='e.g. Explain the causes of the 1997 Asian financial crisis'
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-usage">
              What the AI helped with (for the acknowledgement)
            </label>
            <input
              id="att-usage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={usageDescription}
              onChange={(event) => setUsageDescription(event.target.value)}
              placeholder="e.g. improving readability of the methods section"
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
              Style
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.styleLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the attribution and acknowledgement"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy all"}
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
            <dt className="font-semibold text-[var(--muted-foreground)]">
              Reference entry
            </dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6">
              {hasError ? DASH : result.reference}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">In-text / note usage</dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6">
              {hasError ? DASH : result.inText}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">
              Acknowledgement statement
            </dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6">
              {hasError ? DASH : result.acknowledgement}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Style note</dt>
            <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
              {hasError ? DASH : result.note}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Formats follow the published guidance of the APA Style blog, the MLA Style Center and the
        Chicago Manual of Style Q&amp;A on citing generative AI. Style guidance evolves — check your
        institution's or journal's current requirements before submitting.
      </p>
    </main>
  );
}
