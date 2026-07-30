"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { auditCsp, formatReport, SEVERITY_ORDER } from "../lib";

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

const DEFAULT_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'";

const SEVERITY_STYLES = {
  critical: { chip: "bg-[var(--danger-soft)] text-[var(--danger)]", border: "border-[var(--danger)]/40", label: "Critical" },
  high: { chip: "bg-[var(--danger-soft)] text-[var(--danger)]", border: "border-[var(--danger)]/30", label: "High" },
  medium: { chip: "bg-[var(--warning-soft)] text-[var(--warning)]", border: "border-[var(--warning)]/40", label: "Medium" },
  low: { chip: "bg-[var(--warning-soft)] text-[var(--warning)]", border: "border-[var(--border)]", label: "Low" },
  info: { chip: "bg-[var(--muted)] text-[var(--muted-foreground)]", border: "border-[var(--border)]", label: "Info" },
};

const TONE_BG = {
  danger: "border-[var(--danger)]/40 bg-[var(--danger-soft)]",
  warning: "border-[var(--warning)]/40 bg-[var(--warning-soft)]",
  success: "border-[var(--success)]/40 bg-[var(--success-soft)]",
};

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--success)]",
};

const ORIGIN_LABEL = {
  explicit: "Set explicitly",
  fallback: "Inherited",
  absent: "Absent",
};

export default function ToolHome() {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [delivery, setDelivery] = useState("header");
  const [reportOnly, setReportOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => auditCsp({ policy, delivery, reportOnly }), [policy, delivery, reportOnly]);
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
    setPolicy(DEFAULT_POLICY);
    setDelivery("header");
    setReportOnly(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          CSP Level 3
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CSP Auditor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Parses a Content-Security-Policy value into its directives, resolves the fallback chain that
          decides which source list actually governs each resource type, spells out what every
          directive permits, and reports the weaknesses that stop a policy from stopping XSS. Runs
          entirely in this page.
        </p>
      </header>

      <section className={CARD_CLASS}>
        <label className={LABEL_CLASS} htmlFor="csp-policy">
          Content-Security-Policy value
        </label>
        <textarea
          id="csp-policy"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={6}
          spellCheck={false}
          value={policy}
          onChange={(event) => setPolicy(event.target.value)}
          placeholder="default-src 'self'; script-src 'nonce-abc123' 'strict-dynamic'; object-src 'none'; base-uri 'none'"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Paste the header value. A leading <span className="font-mono">Content-Security-Policy:</span>{" "}
          is stripped automatically.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-delivery">
              Delivered as
            </label>
            <select
              id="csp-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
            >
              <option value="header">HTTP response header</option>
              <option value="meta">&lt;meta http-equiv&gt; tag</option>
            </select>
          </div>
          <label className="flex min-h-11 items-end gap-3 pb-1 text-sm font-medium" htmlFor="csp-report-only">
            <input
              id="csp-report-only"
              type="checkbox"
              className="mb-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={reportOnly}
              onChange={(event) => setReportOnly(event.target.checked)}
            />
            Report-only mode
          </label>
        </div>

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
          <section className={`mt-6 rounded-xl border p-4 sm:p-5 ${TONE_BG[result.verdict.tone]}`}>
            <h2 className={`text-lg font-semibold ${TONE_TEXT[result.verdict.tone]}`}>{result.verdict.label}</h2>
            <p className="mt-1 text-sm text-[var(--foreground)]">
              <span className="font-semibold">Script protection: {result.strength.label}.</span>{" "}
              {result.strength.detail}
            </p>
            <p className="mt-2 text-sm text-[var(--foreground)]">
              {SEVERITY_ORDER.filter((level) => result.counts[level] > 0)
                .map((level) => `${result.counts[level]} ${level}`)
                .join(" · ") || "No findings"}
            </p>
          </section>

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
                        <span className="font-mono text-xs text-[var(--muted-foreground)]">{finding.directive}</span>
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
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">No weaknesses found in this policy.</p>
            )}
          </section>

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">What each directive permits</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              A directive you did not write is governed by its fallback —{" "}
              <span className="font-mono">frame-src</span> falls back to{" "}
              <span className="font-mono">child-src</span> and only then to{" "}
              <span className="font-mono">default-src</span>, while{" "}
              <span className="font-mono">base-uri</span>, <span className="font-mono">form-action</span>{" "}
              and <span className="font-mono">frame-ancestors</span> have no fallback at all.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[38rem] border-collapse">
                <thead>
                  <tr>
                    <th scope="col" className={TH_CLASS}>Directive</th>
                    <th scope="col" className={TH_CLASS}>Source</th>
                    <th scope="col" className={TH_CLASS}>Permits</th>
                  </tr>
                </thead>
                <tbody>
                  {result.effective.map((entry) => (
                    <tr key={entry.name}>
                      <td className={`${TD_CLASS} whitespace-nowrap font-mono text-xs font-semibold`}>{entry.name}</td>
                      <td className={`${TD_CLASS} whitespace-nowrap text-xs`}>
                        <span
                          className={
                            entry.origin === "absent"
                              ? "font-semibold text-[var(--danger)]"
                              : entry.origin === "fallback"
                                ? "text-[var(--muted-foreground)]"
                                : "font-semibold text-[var(--primary)]"
                          }
                        >
                          {ORIGIN_LABEL[entry.origin]}
                        </span>
                        {entry.origin === "fallback" ? (
                          <div className="font-mono text-[var(--muted-foreground)]">via {entry.from}</div>
                        ) : null}
                      </td>
                      <td className={TD_CLASS}>
                        <ul className="space-y-1 text-xs">
                          {entry.permits.map((line, index) => (
                            <li key={index}>{line}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Directives as written</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse">
                <thead>
                  <tr>
                    <th scope="col" className={TH_CLASS}>Name</th>
                    <th scope="col" className={TH_CLASS}>Value</th>
                    <th scope="col" className={TH_CLASS}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.directives.map((directive, index) => (
                    <tr key={`${directive.lower}-${index}`}>
                      <td className={`${TD_CLASS} whitespace-nowrap font-mono text-xs`}>{directive.name}</td>
                      <td className={`${TD_CLASS} break-all font-mono text-xs`}>
                        {directive.values.join(" ") || "(no value)"}
                      </td>
                      <td className={`${TD_CLASS} whitespace-nowrap text-xs`}>
                        {!directive.known ? (
                          <span className="font-semibold text-[var(--danger)]">Ignored — unknown</span>
                        ) : directive.duplicate ? (
                          <span className="font-semibold text-[var(--warning)]">Ignored — duplicate</span>
                        ) : (
                          <span className="text-[var(--success)]">Applied</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
