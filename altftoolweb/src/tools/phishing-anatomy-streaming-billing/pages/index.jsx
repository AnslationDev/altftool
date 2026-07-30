"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tv } from "lucide-react";

import {
  BILLING_LURE_ANATOMY,
  SERVICES,
  analyseBillingLure,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[7rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEVERITY_STYLE = {
  critical: { label: "Red flag", chip: "bg-[var(--danger-soft)] text-[var(--danger)]" },
  warn: { label: "Caution", chip: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  info: { label: "Note", chip: "bg-[var(--muted)] text-[var(--muted-foreground)]" },
  ok: { label: "Reassuring", chip: "bg-[var(--success-soft)] text-[var(--success)]" },
};

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warn: "text-[var(--warning)]",
  ok: "text-[var(--success)]",
};

const DEFAULTS = {
  serviceId: "netflix",
  fromAddress: "info@netflix-billing-update.com",
  linkUrl: "https://netflix.com.billing-update.io/pay",
  body:
    "Dear Valued Customer, we couldn't authorise your last payment and your membership is on hold. Update your billing details within 24 hours to avoid interruption.",
  hasAttachment: false,
};

export default function ToolHome() {
  const [serviceId, setServiceId] = useState(DEFAULTS.serviceId);
  const [fromAddress, setFromAddress] = useState(DEFAULTS.fromAddress);
  const [linkUrl, setLinkUrl] = useState(DEFAULTS.linkUrl);
  const [body, setBody] = useState(DEFAULTS.body);
  const [hasAttachment, setHasAttachment] = useState(DEFAULTS.hasAttachment);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => analyseBillingLure({ serviceId, fromAddress, linkUrl, body, hasAttachment }),
    [serviceId, fromAddress, linkUrl, body, hasAttachment],
  );
  const hasError = Boolean(result.error);
  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${result.service.name} "payment failed" message check`,
      `Sender domain: ${result.senderDomain || "not given"}`,
      `Link goes to: ${result.linkDomain || "not given"}`,
      `Score: ${result.score}/100 — ${result.band}`,
      "",
      ...result.findings.map((f) => `• [${SEVERITY_STYLE[f.severity].label}] ${f.title} — ${f.detail}`),
      "",
      `Safe route: ${result.service.route}`,
    ].join("\n");
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
    setServiceId(DEFAULTS.serviceId);
    setFromAddress(DEFAULTS.fromAddress);
    setLinkUrl(DEFAULTS.linkUrl);
    setBody(DEFAULTS.body);
    setHasAttachment(DEFAULTS.hasAttachment);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <Tv className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Streaming Billing Phishing Anatomy</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            &ldquo;Your payment failed — update your card to keep watching.&rdquo; Pick the service
            the message claims to be from and the sender, link and wording are checked against the
            domains that service actually uses, all inside your browser.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The message you received</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="sb-service">Service it claims to be from</label>
            <select
              id="sb-service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            >
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Domains checked: {service.domains.join(", ")}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sb-from">Sender address</label>
            <input
              id="sb-from"
              type="text"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="info@example.com"
              autoComplete="off"
              spellCheck={false}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sb-link">Where the &ldquo;update payment&rdquo; button goes</label>
            <input
              id="sb-link"
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
              autoComplete="off"
              spellCheck={false}
              className={`${INPUT_CLASS} mt-1.5 font-mono text-sm`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sb-body">Message text</label>
            <textarea
              id="sb-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the visible text"
              className={`${TEXTAREA_CLASS} mt-1.5`}
            />
          </div>

          <label
            htmlFor="sb-attachment"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="sb-attachment"
              type="checkbox"
              checked={hasAttachment}
              onChange={(e) => setHasAttachment(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
            />
            <span>It came with an attached invoice or receipt</span>
          </label>
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
            <button type="button" onClick={reset} aria-label="Reset to the worked example" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Sender&rsquo;s registrable domain</dt>
                <dd className="break-all text-right font-mono text-xs font-semibold sm:text-sm">{result.senderDomain || "—"}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Link&rsquo;s registrable domain</dt>
                <dd className="break-all text-right font-mono text-xs font-semibold sm:text-sm">{result.linkDomain || "—"}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Brands named in the text</dt>
                <dd className="text-right font-semibold">{result.brandsMentioned.length ? result.brandsMentioned.join(", ") : "—"}</dd>
              </div>
            </dl>

            <ul className="mt-5 grid gap-3">
              {result.findings.map((finding) => (
                <li key={finding.title} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[finding.severity].chip}`}>
                      {SEVERITY_STYLE[finding.severity].label}
                    </span>
                    <span className="text-sm font-semibold">{finding.title}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check it the safe way instead</h2>
        <p className="mt-2 text-sm font-semibold">{service.name}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{service.route}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{service.note}</p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          If the payment really did fail, the app will say so the moment you open it — and you can
          fix it there without ever using the link you were sent.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anatomy of the payment-failed email</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Part</th>
                <th scope="col" className="py-2 pr-3 font-semibold">What it says</th>
                <th scope="col" className="py-2 font-semibold">Why it works</th>
              </tr>
            </thead>
            <tbody>
              {BILLING_LURE_ANATOMY.map((row) => (
                <tr key={row.part} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{row.part}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs break-all text-[var(--muted-foreground)]">{row.lure}</td>
                  <td className="py-2.5 leading-6 text-[var(--muted-foreground)]">{row.tell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Independent educational tool, not affiliated with any streaming service. Analysis happens in
        your browser on text you paste; the link is never opened. Brand and domain lists change over
        time, so treat a low score as one input and confirm in the app. If you have already entered
        card details, contact your bank straight away.
      </p>
    </main>
  );
}
