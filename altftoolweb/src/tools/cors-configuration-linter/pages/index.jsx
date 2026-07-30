"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import { formatReport, lintCors, SEVERITY_ORDER } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:text-sm";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5";
const TH_CLASS =
  "border-b border-[var(--border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]";
const TD_CLASS = "border-b border-[var(--border)] px-3 py-2 align-top text-sm text-[var(--foreground)]";

const DEFAULTS = {
  headers: [
    "HTTP/1.1 204 No Content",
    "Access-Control-Allow-Origin: *",
    "Access-Control-Allow-Credentials: true",
    "Access-Control-Allow-Methods: GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers: *",
    "Access-Control-Max-Age: 86400",
  ].join("\n"),
  origin: "https://app.example.com",
  method: "PUT",
  requestHeaders: "authorization, content-type",
  contentType: "application/json",
  credentials: true,
};

const METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

const SEVERITY_STYLES = {
  critical: { chip: "bg-[var(--danger-soft)] text-[var(--danger)]", border: "border-[var(--danger)]/40", label: "Critical" },
  high: { chip: "bg-[var(--danger-soft)] text-[var(--danger)]", border: "border-[var(--danger)]/30", label: "High" },
  medium: { chip: "bg-[var(--warning-soft)] text-[var(--warning)]", border: "border-[var(--warning)]/40", label: "Medium" },
  low: { chip: "bg-[var(--warning-soft)] text-[var(--warning)]", border: "border-[var(--border)]", label: "Low" },
  info: { chip: "bg-[var(--muted)] text-[var(--muted-foreground)]", border: "border-[var(--border)]", label: "Info" },
};

const TONE_STYLES = {
  danger: "border-[var(--danger)]/40 bg-[var(--danger-soft)]",
  warning: "border-[var(--warning)]/40 bg-[var(--warning-soft)]",
  success: "border-[var(--success)]/40 bg-[var(--success-soft)]",
};

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--success)]",
};

export default function ToolHome() {
  const [headers, setHeaders] = useState(DEFAULTS.headers);
  const [origin, setOrigin] = useState(DEFAULTS.origin);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [requestHeaders, setRequestHeaders] = useState(DEFAULTS.requestHeaders);
  const [contentType, setContentType] = useState(DEFAULTS.contentType);
  const [credentials, setCredentials] = useState(DEFAULTS.credentials);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => lintCors({ headers, origin, method, requestHeaders, contentType, credentials }),
    [headers, origin, method, requestHeaders, contentType, credentials],
  );
  const failed = Boolean(result.error);

  const copyReport = async () => {
    const text = formatReport(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setHeaders(DEFAULTS.headers);
    setOrigin(DEFAULTS.origin);
    setMethod(DEFAULTS.method);
    setRequestHeaders(DEFAULTS.requestHeaders);
    setContentType(DEFAULTS.contentType);
    setCredentials(DEFAULTS.credentials);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Fetch CORS protocol
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CORS Configuration Linter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the response headers your server actually returns. This page parses them and runs the
          WHATWG Fetch standard&rsquo;s CORS checks against a request you describe — wildcard and
          credential combinations, malformed origins, a missing <span className="font-mono">Vary</span>,
          and the preflight rules. It reasons about the headers in front of it; it never contacts your
          server.
        </p>
      </header>

      <section className={CARD_CLASS}>
        <label className={LABEL_CLASS} htmlFor="cors-headers">
          Response headers
        </label>
        <textarea
          id="cors-headers"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={8}
          spellCheck={false}
          value={headers}
          onChange={(event) => setHeaders(event.target.value)}
          placeholder={"HTTP/1.1 204 No Content\nAccess-Control-Allow-Origin: https://app.example.com\nVary: Origin"}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Straight from <span className="font-mono">curl -i -X OPTIONS</span> or the Network panel. The
          status line is optional.
        </p>
      </section>

      <section className={`mt-4 ${CARD_CLASS}`}>
        <h2 className="text-lg font-semibold">The request to check</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cors-origin">
              Request Origin
            </label>
            <input
              id="cors-origin"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              spellCheck={false}
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              placeholder="https://app.example.com"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cors-method">
              Method
            </label>
            <select
              id="cors-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cors-request-headers">
              Request headers the script sets
            </label>
            <input
              id="cors-request-headers"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              spellCheck={false}
              value={requestHeaders}
              onChange={(event) => setRequestHeaders(event.target.value)}
              placeholder="authorization, content-type"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cors-content-type">
              Request Content-Type
            </label>
            <input
              id="cors-content-type"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              spellCheck={false}
              value={contentType}
              onChange={(event) => setContentType(event.target.value)}
              placeholder="application/json"
            />
          </div>
        </div>
        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="cors-credentials">
          <input
            id="cors-credentials"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={credentials}
            onChange={(event) => setCredentials(event.target.checked)}
          />
          Request includes credentials (cookies, HTTP auth or a TLS client certificate)
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={PRIMARY_BTN} onClick={copyReport} disabled={failed}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy report"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {failed ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger-soft)] p-4 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : (
        <>
          <section className={`mt-6 rounded-xl border p-4 sm:p-5 ${TONE_STYLES[result.verdict.tone]}`}>
            <h2 className={`text-lg font-semibold ${TONE_TEXT[result.verdict.tone]}`}>{result.verdict.label}</h2>
            <p className="mt-1 text-sm text-[var(--foreground)]">
              {SEVERITY_ORDER.filter((level) => result.counts[level] > 0)
                .map((level) => `${result.counts[level]} ${level}`)
                .join(" · ") || "No findings"}
            </p>
          </section>

          {result.evaluation ? (
            <section className={`mt-6 ${CARD_CLASS}`}>
              <h2 className="text-lg font-semibold">
                What the browser does with {result.method} from {result.origin}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.evaluation.preflight.required
                  ? `A preflight OPTIONS is required: ${result.evaluation.preflight.reasons.join(" ")}`
                  : "This is a simple request — no preflight, so only the origin and credentials headers are consulted."}
              </p>
              <ul className="mt-3 space-y-2">
                {result.evaluation.checks.map((check) => (
                  <li
                    key={check.name}
                    className={`rounded-lg border p-3 text-sm ${
                      check.pass
                        ? "border-[var(--success)]/40 bg-[var(--success-soft)]"
                        : "border-[var(--danger)]/40 bg-[var(--danger-soft)]"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${
                        check.pass ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {check.pass ? "Pass" : "Fail"}
                    </span>
                    <div className="mt-1 font-semibold">{check.name}</div>
                    <p className="mt-1 text-[var(--foreground)]">{check.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className={`mt-6 ${CARD_CLASS}`}>
              <p className="text-sm text-[var(--muted-foreground)]">
                Enter a request Origin to see whether the browser would allow a specific call. Without
                one, only the header-level findings below are produced.
              </p>
            </section>
          )}

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Findings</h2>
            {result.findings.length ? (
              <ul className="mt-3 space-y-3">
                {result.findings.map((finding, index) => {
                  const style = SEVERITY_STYLES[finding.severity];
                  return (
                    <li key={`${finding.title}-${index}`} className={`rounded-lg border p-3 ${style.border}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${style.chip}`}>
                          {style.label}
                        </span>
                        <span className="font-mono text-xs text-[var(--muted-foreground)]">{finding.header}</span>
                      </div>
                      <div className="mt-2 font-semibold">{finding.title}</div>
                      <p className="mt-1 text-sm text-[var(--foreground)]">{finding.detail}</p>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        <span className="font-semibold text-[var(--foreground)]">Fix: </span>
                        {finding.fix}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Nothing to flag. No wildcard/credential conflict, no malformed origin, no missing Vary.
              </p>
            )}
          </section>

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Headers as parsed</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse">
                <thead>
                  <tr>
                    <th scope="col" className={TH_CLASS}>Header</th>
                    <th scope="col" className={TH_CLASS}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.headerRows.map((row, index) => (
                    <tr key={`${row.name}-${index}`}>
                      <td className={`${TD_CLASS} whitespace-nowrap font-mono text-xs`}>
                        <span className={row.cors ? "font-bold text-[var(--primary)]" : ""}>{row.name}</span>
                        {row.repeated ? (
                          <span className="ml-2 text-[10px] font-bold uppercase text-[var(--danger)]">repeated</span>
                        ) : null}
                      </td>
                      <td className={`${TD_CLASS} break-all font-mono text-xs`}>{row.value || "(empty)"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.status ? (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Status line: {result.status.protocol} {result.status.code} {result.status.text}
              </p>
            ) : null}
          </section>
        </>
      )}
    </main>
  );
}
