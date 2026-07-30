"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, Info, Mail, RotateCcw, XCircle } from "lucide-react";

import {
  LEVEL_LABELS,
  SAMPLE_HEADERS,
  analyzeEmailHeaders,
  formatDuration,
  formatReport,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const LEVEL_STYLE = {
  fail: {
    wrap: "border-l-4 border-[var(--danger)] bg-[var(--danger-soft)]",
    text: "text-[var(--danger)]",
    Icon: XCircle,
  },
  warn: {
    wrap: "border-l-4 border-[var(--warning)] bg-[var(--warning-soft)]",
    text: "text-[var(--warning)]",
    Icon: AlertTriangle,
  },
  pass: {
    wrap: "border-l-4 border-[var(--success)] bg-[var(--success-soft)]",
    text: "text-[var(--success)]",
    Icon: CheckCircle2,
  },
  info: {
    wrap: "border-l-4 border-[var(--border)] bg-[var(--muted)]",
    text: "text-[var(--muted-foreground)]",
    Icon: Info,
  },
};

const VERDICT_COPY = {
  fail: "At least one check failed outright",
  warn: "Nothing failed, but something needs a human look",
  pass: "Every check that could run locally passed",
};

const DASH = "—";

function Row({ label, value, mono }) {
  return (
    <div className="grid gap-1 border-b border-[var(--border)] py-2 last:border-0 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd className={`break-words text-sm text-[var(--foreground)] ${mono ? "font-mono text-xs" : ""}`}>
        {value || DASH}
      </dd>
    </div>
  );
}

function AuthCard({ title, result, detail }) {
  const level = result === "pass" ? "pass" : result === "fail" ? "fail" : "warn";
  const style = LEVEL_STYLE[level];
  return (
    <div className={`rounded-lg p-4 ${style.wrap}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {title}
      </p>
      <p className={`mt-1 text-lg font-bold ${style.text}`}>{result || "not recorded"}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--foreground)]">{detail}</p>
    </div>
  );
}

export default function ToolHome() {
  const [raw, setRaw] = useState(SAMPLE_HEADERS);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyzeEmailHeaders(raw), [raw]);
  const report = useMemo(() => formatReport(result), [result]);

  const copyResult = async () => {
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
    setShowAll(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Runs entirely in this tab
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Email Header Analyzer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a full header block. This reads the Received trace chain, the Authentication-Results
          and Received-SPF fields, every DKIM-Signature tag, and recomputes DMARC identifier
          alignment against the From domain — then explains which signals actually mean something.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="header-block">
          Raw headers (Gmail: Show original · Outlook: View message source · Apple Mail: Raw source)
        </label>
        <textarea
          id="header-block"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={12}
          spellCheck={false}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="Received: from ... by ... ; Tue, 14 Jul 2026 03:21:02 -0700"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={PRIMARY_BTN} onClick={copyResult} disabled={!report}>
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy report"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setRaw("")}>
            Clear
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset to sample
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {raw.length} characters. Nothing is uploaded — there is no request for this page to make.
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold">Verdict</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {result.headerCount} fields · {result.hops.length} hop
                {result.hops.length === 1 ? "" : "s"} · {result.transitLabel} in transit
              </p>
            </div>
            <p
              className={`mt-2 text-lg font-bold ${LEVEL_STYLE[result.verdict].text}`}
            >
              {VERDICT_COPY[result.verdict]}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {["fail", "warn", "pass", "info"].map((level) => (
                <span
                  key={level}
                  className={`rounded-md px-2 py-1 ${LEVEL_STYLE[level].wrap} ${LEVEL_STYLE[level].text}`}
                >
                  {result.counts[level] || 0} {LEVEL_LABELS[level]}
                </span>
              ))}
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Sender authentication</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <AuthCard
                title="SPF"
                result={result.auth.spf.result}
                detail={`Envelope domain ${result.auth.spf.domain || DASH}. Alignment with From: ${result.auth.spf.alignment}.`}
              />
              <AuthCard
                title="DKIM"
                result={
                  result.auth.dkim.reported.length ? result.auth.dkim.reported[0].result : ""
                }
                detail={
                  result.auth.dkim.reported.length
                    ? `Signed by ${result.auth.dkim.reported[0].domain || DASH}. Alignment with From: ${result.auth.dkim.reported[0].alignment}.`
                    : "No dkim= clause was recorded by the receiving server."
                }
              />
              <AuthCard
                title="DMARC"
                result={result.auth.dmarc.reported || result.auth.dmarc.computed}
                detail={`Recomputed here from the From domain: ${result.auth.dmarc.computed}. DMARC needs SPF or DKIM to both pass and align.`}
              />
            </div>
            {result.auth.authservIds.length ? (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Authentication-Results written by {result.auth.authservIds.join(", ")}. Only trust a
                line stamped by a host you control or use.
              </p>
            ) : null}
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Findings</h2>
            {result.findings.length ? (
              <ul className="mt-3 space-y-2">
                {result.findings.map((item, index) => {
                  const style = LEVEL_STYLE[item.level];
                  const Icon = style.Icon;
                  return (
                    <li
                      key={`${item.level}-${item.title}-${index}`}
                      className={`rounded-lg p-3 ${style.wrap}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.text}`} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                            {item.detail}
                          </p>
                          {item.evidence ? (
                            <p className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-[var(--muted-foreground)]">
                              {item.evidence}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing to report from these headers.
              </p>
            )}
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Identity fields</h2>
            <dl className="mt-2">
              <Row label="From" value={result.identity.from.address} mono />
              <Row label="Display name" value={result.identity.from.displayDecoded} />
              <Row
                label="Subject"
                value={
                  result.identity.subjectWasEncoded
                    ? `${result.identity.subject}  (decoded from RFC 2047)`
                    : result.identity.subject
                }
              />
              <Row label="Reply-To" value={result.identity.replyTo.address} mono />
              <Row label="Return-Path" value={result.identity.returnPath.address} mono />
              <Row label="Sender" value={result.identity.sender.address} mono />
              <Row label="To" value={result.identity.to.address} mono />
              <Row label="Message-ID" value={result.identity.messageId} mono />
              <Row
                label="Date"
                value={
                  result.identity.dateIso
                    ? `${result.identity.dateText}  (${result.identity.dateIso})`
                    : result.identity.dateText
                }
              />
            </dl>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Route, oldest hop first</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Received fields are prepended by each server, so the last one written is the first hop.
              Delays are the difference between the timestamps in the headers themselves.
            </p>
            {result.hops.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3">Hop</th>
                      <th scope="col" className="py-2 pr-3">From</th>
                      <th scope="col" className="py-2 pr-3">By</th>
                      <th scope="col" className="py-2 pr-3">IP</th>
                      <th scope="col" className="py-2 pr-3">Protocol</th>
                      <th scope="col" className="py-2 pr-3">Timestamp</th>
                      <th scope="col" className="py-2">Delay</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {result.hops.map((hop) => (
                      <tr key={hop.hop} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3">{hop.hop}</td>
                        <td className="py-2 pr-3 break-all">{hop.from || DASH}</td>
                        <td className="py-2 pr-3 break-all">{hop.by || DASH}</td>
                        <td className="py-2 pr-3 break-all">
                          {hop.ip || DASH}
                          {hop.ipScope && hop.ipScope !== "public" ? (
                            <span className="ml-1 text-[var(--warning)]">{hop.ipScope}</span>
                          ) : null}
                        </td>
                        <td className="py-2 pr-3">{hop.with || DASH}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{hop.dateIso || DASH}</td>
                        <td
                          className={`py-2 whitespace-nowrap ${hop.delayMs != null && hop.delayMs < 0 ? "text-[var(--danger)]" : ""}`}
                        >
                          {hop.delayMs == null ? DASH : formatDuration(hop.delayMs)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                No Received fields in this block.
              </p>
            )}
          </section>

          {result.auth.dkim.signatures.length ? (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">DKIM-Signature tags</h2>
              {result.auth.dkim.signatures.map((sig, index) => (
                <dl key={`${sig.domain}-${sig.selector}-${index}`} className="mt-2">
                  <Row label="d= domain" value={sig.domain} mono />
                  <Row label="s= selector" value={sig.selector} mono />
                  <Row label="a= algorithm" value={sig.algorithm} mono />
                  <Row label="c= canonical" value={sig.canonicalization} mono />
                  <Row label="h= signed" value={sig.signedHeaders.join(", ")} mono />
                  <Row
                    label="l= body limit"
                    value={sig.bodyLength == null ? "not set (whole body signed)" : String(sig.bodyLength)}
                  />
                  <Row label="t= signed at" value={sig.signedAtIso} mono />
                  <Row label="x= expires" value={sig.expiresAtIso || "not set"} mono />
                  <Row label="public key record" value={sig.dnsRecordName} mono />
                </dl>
              ))}
            </section>
          ) : null}

          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">All header fields, unfolded</h2>
              <button type="button" className={GHOST_BTN} onClick={() => setShowAll((value) => !value)}>
                {showAll ? "Hide" : `Show ${result.headerCount}`}
              </button>
            </div>
            {showAll ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
                  <tbody className="font-mono">
                    {result.headers.map((header, index) => (
                      <tr
                        key={`${header.key}-${index}`}
                        className="border-b border-[var(--border)] align-top last:border-0"
                      >
                        <th scope="row" className="w-40 py-2 pr-3 font-semibold text-[var(--primary)]">
                          {header.name}
                        </th>
                        <td className="py-2 break-all">{header.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5">
            <h2 className="text-base font-semibold">What this page cannot do</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.limits.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
