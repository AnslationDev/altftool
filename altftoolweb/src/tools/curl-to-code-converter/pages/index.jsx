"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Terminal } from "lucide-react";

import { TARGETS, convertCurl } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/orders \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{"sku":"AB-12","quantity":3,"express":true}'`;

const EXAMPLES = [
  ["Simple GET", "curl https://api.example.com/v1/status"],
  [
    "POST JSON",
    SAMPLE_CURL,
  ],
  [
    "Basic auth + form body",
    "curl -sSL -u api_user:api_key https://api.example.com/v1/login -d 'grant_type=client_credentials'",
  ],
];

export default function ToolHome() {
  const [command, setCommand] = useState(SAMPLE_CURL);
  const [target, setTarget] = useState("fetch");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertCurl(command, target), [command, target]);

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCommand(SAMPLE_CURL);
    setTarget("fetch");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Terminal className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          cURL to Code Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a curl command from an API doc or your browser&apos;s network tab and get working
          fetch, Axios or Python requests code.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="curl-command">
            curl command
          </label>
          <textarea
            id="curl-command"
            rows={7}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            className={`${TEXTAREA_CLASS} mt-1.5`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="curl-target">
              Generate
            </label>
            <select
              id="curl-target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            >
              {TARGETS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className={LABEL_CLASS}>Try an example</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {EXAMPLES.map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCommand(value)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-[var(--muted-foreground)]">Request detected</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {result.error ? DASH : result.method}
            </p>
            <p className="mt-1 max-w-full truncate text-sm text-[var(--muted-foreground)]">
              {result.error ? DASH : result.url}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated code"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy code"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample curl command" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Headers", result.error ? DASH : String(result.headerCount)],
            ["Body", result.error ? DASH : result.bodyKind],
            ["Content-Type", result.error ? DASH : result.contentType],
            ["Basic auth", result.error ? DASH : result.usesAuth ? "Yes" : "No"],
            ["Generated lines", result.error ? DASH : String(result.lineCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] truncate text-right font-semibold text-[var(--foreground)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {!result.error && result.ignored.length > 0 && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Flags with no code equivalent were skipped: {result.ignored.join(", ")}.
          </p>
        )}
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Generated code</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.code}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Redirect behaviour matches curl: it does not follow them unless the command has -L, so the
        generated code sets that explicitly. Replace any API key you pasted with an environment
        variable before committing the result.
      </p>
    </main>
  );
}
