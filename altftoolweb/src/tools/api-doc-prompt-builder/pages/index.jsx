"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Check, Copy, RotateCcw } from "lucide-react";

import {
  AUTH_SCHEMES,
  DOC_STYLES,
  buildApiDocPrompt,
  parseEndpoints,
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
  apiName: "Bookstore API",
  baseUrl: "https://api.example.com/v1",
  authId: "bearer",
  styleId: "markdown",
  endpointText:
    "GET /books\nGET /books/{bookId}\nPOST /books\nPATCH /books/{bookId}\nDELETE /books/{bookId}\nGET /books/{bookId}/reviews",
  notes: "",
};

const DASH = "—";

export default function ToolHome() {
  const [apiName, setApiName] = useState(DEFAULTS.apiName);
  const [baseUrl, setBaseUrl] = useState(DEFAULTS.baseUrl);
  const [authId, setAuthId] = useState(DEFAULTS.authId);
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [endpointText, setEndpointText] = useState(DEFAULTS.endpointText);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsed = parseEndpoints(endpointText);
    if (parsed.error) return parsed;
    return buildApiDocPrompt({ apiName, baseUrl, authId, styleId, notes, parsed });
  }, [apiName, baseUrl, authId, styleId, endpointText, notes]);

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
    setApiName(DEFAULTS.apiName);
    setBaseUrl(DEFAULTS.baseUrl);
    setAuthId(DEFAULTS.authId);
    setStyleId(DEFAULTS.styleId);
    setEndpointText(DEFAULTS.endpointText);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Path parameters found", DASH],
        ["Auth scheme", DASH],
        ["Output format", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Path parameters found", NUM.format(result.totalPathParams)],
        ["Auth scheme", result.auth.label],
        ["Output format", result.style.label],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenText className="h-4 w-4" aria-hidden="true" />
          AI Coding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          API Doc Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your endpoint list and get a documentation prompt that demands
          every parameter, realistic examples, RFC-correct error cases and
          TODO(verify) markers instead of invented details.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="adp-name">
              API name
            </label>
            <input
              id="adp-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={apiName}
              onChange={(event) => setApiName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adp-base">
              Base URL (optional)
            </label>
            <input
              id="adp-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="adp-endpoints">
              Endpoints — one per line, METHOD /path with {"{param}"} or :param
            </label>
            <textarea
              id="adp-endpoints"
              className={`mt-2 ${AREA_CLASS}`}
              rows={6}
              spellCheck={false}
              value={endpointText}
              onChange={(event) => setEndpointText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adp-auth">
              Authentication
            </label>
            <select
              id="adp-auth"
              className={`mt-2 ${INPUT_CLASS}`}
              value={authId}
              onChange={(event) => setAuthId(event.target.value)}
            >
              {AUTH_SCHEMES.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adp-style">
              Output format
            </label>
            <select
              id="adp-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {DOC_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="adp-notes">
              Extra instruction (optional)
            </label>
            <input
              id="adp-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. responses use snake_case; cursor pagination via ?after="
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
              Endpoints to document
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.parsed.endpoints.length)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Each gets purpose, parameters, examples and error cases."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated API documentation prompt"
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
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        HTTP methods are validated against RFC 9110 (plus PATCH from RFC
        5789), and the error-case list uses RFC 9110 reason phrases. Details
        the model cannot know are marked TODO(verify) in the output — fill
        them from your actual implementation before publishing.
      </p>
    </main>
  );
}
