"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { SAMPLE_HEADERS, SCORE_RUBRIC, analyzeHeaders, formatReport } from "../lib";

const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const TEXTAREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:text-sm";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  pass: "bg-[var(--success-soft)] text-[var(--success)]",
  partial: "bg-[var(--warning-soft)] text-[var(--warning)]",
  warn: "bg-[var(--warning-soft)] text-[var(--warning)]",
  fail: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
};

const STATUS_LABEL = {
  pass: "Pass",
  partial: "Partial",
  warn: "Review",
  fail: "Missing",
  info: "Info",
};

export default function ToolHome() {
  const [raw, setRaw] = useState(SAMPLE_HEADERS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyzeHeaders(raw), [raw]);
  const report = useMemo(() => formatReport(result), [result]);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRaw(SAMPLE_HEADERS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Response header audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Security Headers Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a block of HTTP response headers and this parses every line, reads the values of the
          defensive headers a browser actually acts on, and reports what each one permits and what is
          missing. It runs entirely in this tab — it never connects to your site, so it grades only
          the text you paste.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL} htmlFor="header-block">
          Response headers
        </label>
        <textarea
          id="header-block"
          className={TEXTAREA}
          rows={12}
          spellCheck="false"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder={"HTTP/2 200\nstrict-transport-security: max-age=31536000\ncontent-security-policy: default-src 'self'"}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          From <code className="font-mono">curl -I https://example.com</code> or the Headers panel of
          your browser devtools. Folded continuation lines and the{" "}
          <code className="font-mono">&lt;</code> prefix from <code className="font-mono">curl -v</code>{" "}
          are handled.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copyReport} disabled={!report}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Report copied" : "Copy report"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset to sample
          </button>
        </div>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" role="status">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--muted)]">
                <span className="text-3xl font-bold leading-none text-[var(--primary)]">{result.grade}</span>
                <span className="mt-1 text-xs text-[var(--muted-foreground)]">{result.percent}%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {result.earned} of {result.applicable} rubric points
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.headerCount} header lines parsed
                  {result.statusLine ? ` · ${result.statusLine}` : ""}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.counts.pass} pass · {result.counts.partial} partial · {result.counts.fail} missing ·{" "}
                  {result.counts.warn} to review
                </p>
              </div>
            </div>
            {result.malformed.length > 0 && (
              <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">
                {result.malformed.length} line(s) skipped — not in{" "}
                <code className="font-mono">Name: value</code> form: {result.malformed.slice(0, 3).join(" / ")}
              </p>
            )}
            {result.duplicateHeaders.length > 0 && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Sent more than once:{" "}
                {result.duplicateHeaders.map((item) => `${item.name} (${item.count}x)`).join(", ")}
              </p>
            )}
          </section>

          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold">Checks</h2>
            {result.checks.map((check) => (
              <article key={check.id} className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-sm font-semibold break-all">{check.header}</h3>
                  <div className="flex items-center gap-2">
                    {check.max > 0 && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {check.earned}/{check.max}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[check.status]}`}>
                      {STATUS_LABEL[check.status]}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{check.summary}</p>
                {check.notes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {check.notes.map((note) => (
                      <li key={note} className="break-words">
                        · {note}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>

          {result.cspDirectives.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-lg font-semibold">
                What the CSP permits{result.cspReportOnly ? " (report-only)" : ""}
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Directive</th>
                      <th className="py-2 pr-3 font-semibold">Value</th>
                      <th className="py-2 font-semibold">Effect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cspDirectives.map((directive) => (
                      <tr key={directive.name} className="border-b border-[var(--border)] align-top">
                        <td className="py-2 pr-3 font-mono text-xs font-semibold">
                          {directive.name}
                          {!directive.known && (
                            <span className="ml-1 text-[var(--warning)]" title="Not a directive in the CSP specification">
                              (?)
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs break-all text-[var(--muted-foreground)]">
                          {directive.values.join(" ") || "(empty)"}
                        </td>
                        <td className="py-2 leading-6">{directive.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {result.cookies.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-lg font-semibold">Cookies set by this response</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Cookie</th>
                      <th className="py-2 pr-3 font-semibold">Secure</th>
                      <th className="py-2 pr-3 font-semibold">HttpOnly</th>
                      <th className="py-2 font-semibold">SameSite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cookies.map((cookie) => (
                      <tr key={cookie.name} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3 font-mono text-xs break-all">{cookie.name}</td>
                        <td className={`py-2 pr-3 ${cookie.secure ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                          {cookie.secure ? "yes" : "no"}
                        </td>
                        <td className={`py-2 pr-3 ${cookie.httpOnly ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                          {cookie.httpOnly ? "yes" : "no"}
                        </td>
                        <td className={`py-2 ${cookie.sameSite ? "text-[var(--foreground)]" : "text-[var(--danger)]"}`}>
                          {cookie.sameSite || "not set"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">How the score is worked out</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Fixed weights, no estimation. Checks that do not apply to a response — cookie flags when
              nothing was set — are left out of the total, so the percentage is always earned over
              applicable.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[24rem] border-collapse text-sm">
                <tbody>
                  {SCORE_RUBRIC.map(([name, points]) => (
                    <tr key={name} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3">{name}</td>
                      <td className="py-2 text-right font-mono text-xs">{points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Grades: A+ from 95%, A from 90%, B from 80%, C from 70%, D from 60%, F below that.
              Cross-Origin-Embedder-Policy and CORS are reported but not scored, because the right
              value depends on what the endpoint is for.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
