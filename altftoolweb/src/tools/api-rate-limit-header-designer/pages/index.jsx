"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { HEADER_STYLES, PROBLEM_MEDIA_TYPE, buildRateLimitDesign } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

const DEFAULTS = {
  style: "ietf",
  limit: "100",
  windowSeconds: "60",
  remaining: "37",
  resetSeconds: "25",
  policyName: "default",
  docsUrl: "",
};

const headerBlock = (headers) =>
  headers.map(([n, v]) => `${n}: ${v}`).join("\n");

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRateLimitDesign({
        style: form.style,
        limit: form.limit,
        windowSeconds: form.windowSeconds,
        remaining: form.remaining,
        resetSeconds: form.resetSeconds,
        policyName: form.policyName,
        docsUrl: form.docsUrl,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const fullSpec = useMemo(() => {
    if (hasError) return "";
    return [
      "# 200 OK — include on every response",
      headerBlock(result.successHeaders),
      "",
      "# 429 Too Many Requests",
      `Content-Type: ${PROBLEM_MEDIA_TYPE}`,
      headerBlock(result.limitedHeaders),
      "",
      result.problemJson,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(fullSpec);
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          API design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          API Rate Limit Header Designer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Design the rate limit headers your API sends on every response and the
          429 clients see when throttled — IETF draft RateLimit fields, legacy
          X-RateLimit headers, Retry-After and an RFC 9457 problem body.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rl-style">
              Header style
            </label>
            <select
              id="rl-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.style}
              onChange={set("style")}
            >
              {HEADER_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-limit">
              Limit (requests per window)
            </label>
            <input
              id="rl-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={form.limit}
              onChange={set("limit")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-window">
              Window length (seconds)
            </label>
            <input
              id="rl-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              value={form.windowSeconds}
              onChange={set("windowSeconds")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-remaining">
              Remaining (example mid-window)
            </label>
            <input
              id="rl-remaining"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={form.remaining}
              onChange={set("remaining")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-reset">
              Seconds until window resets
            </label>
            <input
              id="rl-reset"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={form.resetSeconds}
              onChange={set("resetSeconds")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-policy">
              Quota policy name (IETF headers)
            </label>
            <input
              id="rl-policy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.policyName}
              onChange={set("policyName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-docs">
              Docs URL for the problem type (optional)
            </label>
            <input
              id="rl-docs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              placeholder="https://api.example.com/docs/errors/rate-limit"
              value={form.docsUrl}
              onChange={set("docsUrl")}
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
              Sustained rate this policy allows
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.requestsPerSecond)} req/s`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the full rate limit header specification"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy spec"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all fields to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <h2 className="mt-5 text-sm font-semibold">200 OK — send on every response</h2>
        <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? DASH : headerBlock(result.successHeaders)}</code>
          </pre>
        </div>

        <h2 className="mt-4 text-sm font-semibold">429 Too Many Requests</h2>
        <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>
              {hasError
                ? DASH
                : `Content-Type: ${PROBLEM_MEDIA_TYPE}\n${headerBlock(result.limitedHeaders)}\n\n${result.problemJson}`}
            </code>
          </pre>
        </div>

        {!hasError && result.notes.length ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        429 is defined by RFC 6585, Retry-After by RFC 9110, the problem body by
        RFC 9457, and the RateLimit fields by the IETF httpapi working group
        draft. Clients should treat Retry-After as authoritative and back off
        with jitter.
      </p>
    </main>
  );
}
