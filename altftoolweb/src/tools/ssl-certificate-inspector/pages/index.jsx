"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import {
  DEFAULT_WARN_DAYS,
  MAX_TLS_LIFETIME_DAYS,
  MIN_RSA_BITS,
  checkCertificate,
  inspectChain,
} from "../lib";
import { SAMPLE_CHAIN_PEM } from "../sample";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-40 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const STATUS_TEXT = {
  valid: "Valid",
  expiring: "Expiring soon",
  expired: "Expired",
  "not-yet-valid": "Not yet valid",
};

const STATUS_CLASS = {
  valid: "text-[var(--success)]",
  expiring: "text-[var(--warning)]",
  expired: "text-[var(--danger)]",
  "not-yet-valid": "text-[var(--warning)]",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDate = (iso) => (iso ? iso.replace("T", " ").replace("Z", " UTC") : DASH);

export default function ToolHome() {
  const [pem, setPem] = useState(SAMPLE_CHAIN_PEM);
  const [hostname, setHostname] = useState("demo.altftool.com");
  const [checkDate, setCheckDate] = useState(todayIso);
  const [warnDays, setWarnDays] = useState(String(DEFAULT_WARN_DAYS));
  const [copied, setCopied] = useState(false);

  const chain = useMemo(() => inspectChain(pem), [pem]);
  const chainError = Boolean(chain.error);

  const leaf = chainError ? null : chain.certificates[0];

  const check = useMemo(() => {
    if (!leaf) return { error: chain.error ?? "Paste a certificate." };
    return checkCertificate(leaf, {
      hostname,
      today: checkDate,
      warnDays: Number(warnDays),
    });
  }, [leaf, chain.error, hostname, checkDate, warnDays]);

  const hasError = chainError || Boolean(check.error);
  const errorMessage = chain.error || check.error || "";

  const rows = hasError
    ? [
        ["Common name", DASH],
        ["Issued by", DASH],
        ["Valid from", DASH],
        ["Valid until", DASH],
        ["Certificate lifetime", DASH],
        ["Public key", DASH],
        ["Signature algorithm", DASH],
        ["Serial number", DASH],
        ["Subject alternative names", DASH],
        ["Hostname match", DASH],
      ]
    : [
        ["Common name", leaf.subject.commonName || leaf.subject.text],
        ["Issued by", leaf.issuer.text],
        ["Valid from", formatDate(leaf.notBefore)],
        ["Valid until", formatDate(leaf.notAfter)],
        ["Certificate lifetime", `${NUM.format(leaf.lifetimeDays)} days`],
        [
          "Public key",
          `${leaf.publicKey.algorithm}${leaf.publicKey.bits ? ` ${NUM.format(leaf.publicKey.bits)}-bit` : ""}${leaf.publicKey.curve ? ` · ${leaf.publicKey.curve}` : ""}`,
        ],
        ["Signature algorithm", leaf.signatureAlgorithm],
        ["Serial number", leaf.serialNumber],
        [
          "Subject alternative names",
          leaf.subjectAltNames.length > 0 ? leaf.subjectAltNames.join(", ") : "None",
        ],
        [
          "Hostname match",
          check.hostnameChecked
            ? check.hostnameMatches
              ? `Matches ${check.matchedName}`
              : "No matching name"
            : "Enter a hostname to check",
        ],
      ];

  const report = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `SSL certificate report — ${leaf.subject.commonName || leaf.subject.text}`,
      `Checked against ${checkDate}`,
      `Status: ${STATUS_TEXT[check.status]} (${check.daysToExpiry} days to expiry)`,
      `Issuer: ${leaf.issuer.text}`,
      `Valid: ${leaf.notBefore} to ${leaf.notAfter} (${leaf.lifetimeDays} days)`,
      `Key: ${leaf.publicKey.algorithm} ${leaf.publicKey.bits ?? "?"} bits`,
      `Signature: ${leaf.signatureAlgorithm}`,
      `SANs: ${leaf.subjectAltNames.join(", ") || "none"}`,
      "",
      `Chain of ${chain.certificates.length} certificate(s), order ${chain.orderOk ? "OK" : "broken"}`,
    ];
    chain.certificates.forEach((cert, index) => {
      lines.push(
        `  ${index + 1}. ${cert.subject.commonName || cert.subject.text}${cert.isCa ? " [CA]" : ""}`,
      );
    });
    if (check.warnings.length > 0) {
      lines.push("", "Warnings:");
      check.warnings.forEach((warning) => lines.push(`  - ${warning}`));
    }
    return lines.join("\n");
  }, [hasError, leaf, check, chain, checkDate]);

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
    setPem(SAMPLE_CHAIN_PEM);
    setHostname("demo.altftool.com");
    setCheckDate(todayIso());
    setWarnDays(String(DEFAULT_WARN_DAYS));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          TLS &amp; certificates
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SSL Certificate Inspector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a PEM certificate or a full chain and this decodes the X.509 structure in your
          browser — subject, issuer, validity, SANs, key size and signature algorithm — then checks
          expiry, hostname matching under RFC 6125, and whether the chain is in the right order.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ssl-pem">
              Certificate or chain (PEM)
            </label>
            <textarea
              id="ssl-pem"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={pem}
              onChange={(event) => {
                setPem(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Get one with <code>openssl s_client -connect example.com:443 -showcerts</code>, or
              export it from your browser&apos;s certificate viewer.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssl-host">
              Hostname to check
            </label>
            <input
              id="ssl-host"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hostname}
              onChange={(event) => setHostname(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssl-date">
              Check against date
            </label>
            <input
              id="ssl-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={checkDate}
              onChange={(event) => setCheckDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssl-warn">
              Renewal warning (days before expiry)
            </label>
            <input
              id="ssl-warn"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={warnDays}
              onChange={(event) => setWarnDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days until expiry
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--primary)]" : STATUS_CLASS[check.status]}`}
            >
              {hasError ? DASH : NUM.format(check.daysToExpiry)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${STATUS_TEXT[check.status]} — expires ${formatDate(check.expiresOn)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the certificate report"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the inspector to the sample certificate"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && check.warnings.length > 0 ? (
          <div
            role="alert"
            className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]"
          >
            <p className="font-semibold">
              {check.warnings.length} issue{check.warnings.length === 1 ? "" : "s"} found
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {check.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {!chainError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">
            Chain ({chain.certificates.length} certificate
            {chain.certificates.length === 1 ? "" : "s"})
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            TLS requires the leaf first, then each issuer in turn. A missing intermediate is the
            most common cause of &quot;works in my browser, fails on mobile&quot;.
          </p>
          {chain.issues.length > 0 ? (
            <ul
              role="alert"
              className="mt-3 list-disc space-y-1 rounded-md bg-[var(--danger-soft)] px-3 py-3 pl-8 text-sm text-[var(--danger)]"
            >
              {chain.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
          <ol className="mt-4 space-y-3">
            {chain.certificates.map((cert, index) => (
              <li
                key={cert.serialNumber}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {index + 1}. {cert.subject.commonName || cert.subject.text}
                  </p>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                    {cert.isCa ? (cert.selfSigned ? "Root CA" : "Intermediate CA") : "Leaf"}
                  </span>
                </div>
                <p className="mt-1 break-all text-xs text-[var(--muted-foreground)]">
                  Issued by {cert.issuer.text}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {formatDate(cert.notBefore)} → {formatDate(cert.notAfter)} ·{" "}
                  {cert.publicKey.algorithm}
                  {cert.publicKey.bits ? ` ${NUM.format(cert.publicKey.bits)}-bit` : ""} ·{" "}
                  {cert.signatureAlgorithm}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Parsing happens entirely in your browser — nothing is uploaded. A browser cannot read the
        certificate a remote server presents, so live domain lookup needs a server-side checker;
        paste the PEM instead. Thresholds applied: {MAX_TLS_LIFETIME_DAYS}-day maximum TLS lifetime
        and a {NUM.format(MIN_RSA_BITS)}-bit minimum RSA key, both from the CA/Browser Forum
        Baseline Requirements. This tool reports what a certificate says; it does not verify
        signatures or check revocation.
      </p>
    </main>
  );
}
