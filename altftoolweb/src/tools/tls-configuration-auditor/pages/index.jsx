"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Lock, RotateCcw } from "lucide-react";

import { SAMPLE_NGINX, SAMPLE_OPENSSL, auditTls, formatReport } from "../lib";

const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:text-sm";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEVERITY_STYLE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  high: "bg-[var(--danger-soft)] text-[var(--danger)]",
  medium: "bg-[var(--warning-soft)] text-[var(--warning)]",
  low: "bg-[var(--info-soft)] text-[var(--info)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  good: "bg-[var(--success-soft)] text-[var(--success)]",
};

const GRADE_STYLE = {
  insecure: "text-[var(--danger)]",
  weak: "text-[var(--danger)]",
  legacy: "text-[var(--warning)]",
  acceptable: "text-[var(--warning)]",
  strong: "text-[var(--success)]",
  modern: "text-[var(--success)]",
};

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function ToolHome() {
  const [raw, setRaw] = useState(SAMPLE_OPENSSL);
  const [asOf, setAsOf] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAsOf(todayIso());
  }, []);

  const result = useMemo(() => auditTls(raw, { asOf }), [raw, asOf]);
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
    setRaw(SAMPLE_OPENSSL);
    setAsOf(todayIso());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Protocol and certificate audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TLS Configuration Auditor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste an <code className="font-mono">openssl s_client</code> transcript, an{" "}
          <code className="font-mono">openssl x509 -text</code> certificate dump, an nmap
          ssl-enum-ciphers table or an nginx / Apache TLS block. Every protocol version and cipher
          suite in the text is broken down — key exchange, authentication, bulk cipher, mode and MAC
          — and the certificate's dates, key size and signature algorithm are read out and checked.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL} htmlFor="tls-input">
          TLS output or configuration
        </label>
        <textarea
          id="tls-input"
          className={TEXTAREA}
          rows={14}
          spellCheck="false"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder={"    Protocol  : TLSv1.2\n    Cipher    : ECDHE-RSA-AES128-GCM-SHA256\n    Verify return code: 0 (ok)"}
        />
        <div className="mt-4 max-w-xs">
          <label className={LABEL} htmlFor="tls-asof">
            Reference date for certificate expiry
          </label>
          <input
            id="tls-asof"
            className={INPUT}
            type="date"
            value={asOf}
            onChange={(event) => setAsOf(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Days remaining are counted from this date, so an old transcript can be judged against the
            day it was captured.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copyReport} disabled={!report}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Report copied" : "Copy report"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setRaw(SAMPLE_OPENSSL)}>
            openssl example
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setRaw(SAMPLE_NGINX)}>
            nginx example
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Findings</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.counts.critical} critical · {result.counts.high} high · {result.counts.medium} medium ·{" "}
              {result.counts.low} low · {result.counts.good} good
              {result.sources.length ? ` · read as ${result.sources.join(", ")}` : ""}
            </p>
            {result.findings.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing in this text triggered a check. That is not the same as a clean configuration —
                only what you pasted was examined.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {result.findings.map((finding) => (
                  <li key={finding.id} className="rounded-lg border border-[var(--border)] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${SEVERITY_STYLE[finding.severity]}`}>
                        {finding.severity}
                      </span>
                      <span className="font-semibold">{finding.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
                    {finding.evidence && (
                      <p className="mt-2 font-mono text-xs break-all text-[var(--muted-foreground)]">{finding.evidence}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {result.protocols.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-lg font-semibold">Protocol versions in this text</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Version</th>
                      <th className="py-2 pr-3 font-semibold">Seen as</th>
                      <th className="py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.protocols.map((protocol) => (
                      <tr key={protocol.key} className="border-b border-[var(--border)] align-top">
                        <td className="py-2 pr-3 font-semibold">{protocol.label}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{protocol.modes.join(", ")}</td>
                        <td className="py-2 leading-6">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${SEVERITY_STYLE[protocol.severity]}`}>
                            {protocol.severity === "good" ? "current" : protocol.severity}
                          </span>
                          <span className="ml-2 text-[var(--muted-foreground)]">{protocol.note}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {result.ciphers.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-lg font-semibold">Cipher suites broken down</h2>
              {result.negotiatedCipher && (
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Negotiated on this connection: <code className="font-mono">{result.negotiatedCipher}</code>
                </p>
              )}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Suite</th>
                      <th className="py-2 pr-3 font-semibold">Key exchange</th>
                      <th className="py-2 pr-3 font-semibold">Auth</th>
                      <th className="py-2 pr-3 font-semibold">Cipher</th>
                      <th className="py-2 pr-3 font-semibold">MAC</th>
                      <th className="py-2 pr-3 font-semibold">FS</th>
                      <th className="py-2 font-semibold">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ciphers.map((cipher) => (
                      <tr key={cipher.name} className="border-b border-[var(--border)] align-top">
                        <td className="py-2 pr-3 font-mono text-xs break-all">{cipher.name}</td>
                        <td className="py-2 pr-3">{cipher.keyExchange}</td>
                        <td className="py-2 pr-3">{cipher.authentication}</td>
                        <td className="py-2 pr-3">
                          {cipher.cipher}
                          {cipher.keyBits ? `-${cipher.keyBits}` : ""}
                          {cipher.mode ? `/${cipher.mode}` : ""}
                          {cipher.aead ? " (AEAD)" : ""}
                        </td>
                        <td className="py-2 pr-3">{cipher.mac || "—"}</td>
                        <td className={`py-2 pr-3 ${cipher.forwardSecrecy ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                          {cipher.forwardSecrecy ? "yes" : "no"}
                        </td>
                        <td className={`py-2 font-semibold ${GRADE_STYLE[cipher.grade]}`}>{cipher.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.ciphers.flatMap((cipher) =>
                  cipher.issues.map((issue) => (
                    <li key={`${cipher.name}-${issue.text}`}>
                      <span className="font-mono text-xs">{cipher.name}</span> — {issue.text}
                    </li>
                  )),
                )}
              </ul>
            </section>
          )}

          {(result.certificate.notAfterRaw || result.certificate.subject) && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-lg font-semibold">Certificate</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ["Subject", result.certificate.subject],
                  ["Issuer", result.certificate.issuer],
                  ["Signature algorithm", result.certificate.signatureAlgorithm],
                  ["Public key", result.certificate.keyBits ? `${result.certificate.keyAlgorithm || "key"}, ${result.certificate.keyBits} bit` : null],
                  ["Not before", result.certificate.notBeforeRaw],
                  ["Not after", result.certificate.notAfterRaw],
                  ["Nominal lifetime", result.certificate.lifetimeDays === null ? null : `${result.certificate.lifetimeDays} days`],
                  [
                    "Days remaining",
                    result.certificate.daysRemaining === null
                      ? null
                      : result.certificate.daysRemaining < 0
                        ? `expired ${Math.abs(result.certificate.daysRemaining)} days ago`
                        : `${result.certificate.daysRemaining} days`,
                  ],
                ]
                  .filter(([, value]) => value)
                  .map(([term, value]) => (
                    <div key={term}>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{term}</dt>
                      <dd className="mt-1 break-words text-sm">{value}</dd>
                    </div>
                  ))}
              </dl>
              {result.certificate.sans.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Subject alternative names ({result.certificate.sans.length})
                  </p>
                  <p className="mt-1 break-words font-mono text-xs">{result.certificate.sans.join(", ")}</p>
                </div>
              )}
            </section>
          )}

          {result.cipherString && (
            <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-lg font-semibold">OpenSSL cipher string</h2>
              <p className="mt-2 break-all font-mono text-xs">{result.cipherString.raw}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Tokens: {result.cipherString.tokens.join(" · ")}.{" "}
                {result.cipherString.exclusions.length
                  ? `Excluded groups: ${result.cipherString.exclusions.join(", ")}.`
                  : "No ! exclusions are present, so nothing is being removed from the selected groups."}{" "}
                Keyword groups such as HIGH resolve against whatever the local OpenSSL build supports,
                so the same string can offer different suites on different machines.
              </p>
            </section>
          )}

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">What this does not do</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              It never opens a connection. There is no handshake, no probing for downgrade support, no
              revocation lookup and no Certificate Transparency query — all of which need a live socket
              that a browser tab cannot open to an arbitrary host. Anything missing from your paste is
              simply unknown here, so an empty findings list means &ldquo;nothing detected in this
              text&rdquo; rather than &ldquo;server is fine&rdquo;. For an active test run testssl.sh,
              sslyze or nmap against the host and paste the output back in.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
