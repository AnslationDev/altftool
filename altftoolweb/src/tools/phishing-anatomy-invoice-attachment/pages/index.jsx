"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileWarning, RotateCcw } from "lucide-react";

import {
  INVOICE_LURE_ANATOMY,
  VERIFICATION_STEPS,
  analyseInvoiceLure,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[6.5rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  filename: "Invoice_4417.pdf.lnk",
  fromAddress: "billing@acme-invoices-secure.com",
  replyTo: "acme.accounts01@gmail.com",
  supplierDomain: "acme.com",
  subject: "INVOICE 4417 — OVERDUE — action required today",
  body:
    "Dear customer, please find the attached statement in Invoice_4417.zip. The password is 2024. Enable content to view the invoice. Our bank details have changed — remit to the account below.",
};

const SEVERITY_STYLE = {
  critical: {
    label: "Red flag",
    chip: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  warn: {
    label: "Caution",
    chip: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  info: {
    label: "Note",
    chip: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  },
  ok: {
    label: "Reassuring",
    chip: "bg-[var(--success-soft)] text-[var(--success)]",
  },
};

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warn: "text-[var(--warning)]",
  ok: "text-[var(--success)]",
};

export default function ToolHome() {
  const [filename, setFilename] = useState(DEFAULTS.filename);
  const [fromAddress, setFromAddress] = useState(DEFAULTS.fromAddress);
  const [replyTo, setReplyTo] = useState(DEFAULTS.replyTo);
  const [supplierDomain, setSupplierDomain] = useState(DEFAULTS.supplierDomain);
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [body, setBody] = useState(DEFAULTS.body);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => analyseInvoiceLure({ filename, fromAddress, replyTo, supplierDomain, subject, body }),
    [filename, fromAddress, replyTo, supplierDomain, subject, body],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Invoice attachment phishing check",
      `Attachment: ${result.realName || "(none given)"}`,
      `Risk score: ${result.score}/100 — ${result.band}`,
      "",
      ...result.findings.map((f) => `• [${SEVERITY_STYLE[f.severity].label}] ${f.title} — ${f.detail}`),
      "",
      "Verify before paying:",
      ...VERIFICATION_STEPS.map((step, i) => `${i + 1}. ${step}`),
    ];
    return lines.join("\n");
  }, [hasError, result]);

  const copy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFilename(DEFAULTS.filename);
    setFromAddress(DEFAULTS.fromAddress);
    setReplyTo(DEFAULTS.replyTo);
    setSupplierDomain(DEFAULTS.supplierDomain);
    setSubject(DEFAULTS.subject);
    setBody(DEFAULTS.body);
    setCopied(false);
  };

  const clear = () => {
    setFilename("");
    setFromAddress("");
    setReplyTo("");
    setSupplierDomain("");
    setSubject("");
    setBody("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <FileWarning className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Invoice Attachment Phishing Anatomy</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Paste the parts of a suspicious invoice email. Nothing leaves your browser — the file
            name, addresses and wording are checked against the patterns used by invoice-fraud and
            malware-attachment campaigns.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The email you received</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-filename">Attachment file name</label>
            <input
              id="inv-filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Invoice_4417.pdf.lnk"
              autoComplete="off"
              spellCheck={false}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="inv-from">From address</label>
              <input
                id="inv-from"
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="billing@example.com"
                autoComplete="off"
                spellCheck={false}
                className={`${INPUT_CLASS} mt-1.5`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="inv-replyto">Reply-To address</label>
              <input
                id="inv-replyto"
                type="text"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="optional"
                autoComplete="off"
                spellCheck={false}
                className={`${INPUT_CLASS} mt-1.5`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="inv-supplier">Supplier domain you expect</label>
              <input
                id="inv-supplier"
                type="text"
                value={supplierDomain}
                onChange={(e) => setSupplierDomain(e.target.value)}
                placeholder="acme.com"
                autoComplete="off"
                spellCheck={false}
                className={`${INPUT_CLASS} mt-1.5`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="inv-subject">Subject line</label>
              <input
                id="inv-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Invoice 4417"
                autoComplete="off"
                className={`${INPUT_CLASS} mt-1.5`}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="inv-body">Message body</label>
            <textarea
              id="inv-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the visible text of the email"
              className={`${TEXTAREA_CLASS} mt-1.5`}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {hasError && (
          <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.error}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">Red-flag score</p>
            <p className={`text-4xl font-extrabold tabular-nums ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.tone]}`}>
              {hasError ? "—" : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasError ? "—" : result.band}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={hasError}
              aria-label="Copy the analysis to the clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={clear} aria-label="Clear every field" className={GHOST_BTN}>
              Clear
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the worked example" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <>
            {result.realName && (
              <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">File name with formatting tricks removed</dt>
                  <dd className="break-all text-right font-mono text-xs font-semibold sm:text-sm">{result.realName}</dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">Attachment type</dt>
                  <dd className="text-right font-semibold">{result.extensionClass ? result.extensionClass.label : "Unclassified"}</dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">Signals found</dt>
                  <dd className="text-right font-semibold">{result.findings.length}</dd>
                </div>
              </dl>
            )}

            <ul className="mt-5 grid gap-3">
              {result.findings.map((finding) => (
                <li
                  key={finding.title}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[finding.severity].chip}`}>
                      {SEVERITY_STYLE[finding.severity].label}
                    </span>
                    <span className="text-sm font-semibold">{finding.title}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
                </li>
              ))}
              {!result.findings.length && (
                <li className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)]">
                  Nothing in what you pasted matched a known pattern. That is not a clean bill of
                  health — still match the invoice to a purchase order before paying.
                </li>
              )}
            </ul>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anatomy of the standard fake invoice</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Part</th>
                <th scope="col" className="py-2 pr-3 font-semibold">What it looks like</th>
                <th scope="col" className="py-2 font-semibold">Why it works</th>
              </tr>
            </thead>
            <tbody>
              {INVOICE_LURE_ANATOMY.map((row) => (
                <tr key={row.part} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{row.part}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-[var(--muted-foreground)]">{row.lure}</td>
                  <td className="py-2.5 leading-6 text-[var(--muted-foreground)]">{row.tell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Verify before you pay or open</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {VERIFICATION_STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--foreground)]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational analysis of text you paste in, run entirely in your browser. It cannot open the
        attachment, check mail authentication records or scan for malware, so a low score is not
        proof a message is safe. Report anything doubtful to your IT or security team.
      </p>
    </main>
  );
}
