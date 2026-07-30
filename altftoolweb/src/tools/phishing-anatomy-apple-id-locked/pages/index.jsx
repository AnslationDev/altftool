"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LockKeyhole, RotateCcw } from "lucide-react";

import {
  APPLE_LOCKED_ANATOMY,
  APPLE_POLICY_FACTS,
  CHANNELS,
  SAFE_ROUTES,
  analyseAppleIdLure,
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
  fromAddress: "no-reply@apple-id-verify.support",
  linkUrl: "https://appleid.apple.com.verify-secure.co/login",
  body:
    "Dear Customer, unusual sign-in activity was detected on your Apple ID. Confirm your password and billing information within 24 hours or your account will be permanently deleted.",
  channel: "email",
  hasAttachment: false,
};

export default function ToolHome() {
  const [fromAddress, setFromAddress] = useState(DEFAULTS.fromAddress);
  const [linkUrl, setLinkUrl] = useState(DEFAULTS.linkUrl);
  const [body, setBody] = useState(DEFAULTS.body);
  const [channel, setChannel] = useState(DEFAULTS.channel);
  const [hasAttachment, setHasAttachment] = useState(DEFAULTS.hasAttachment);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => analyseAppleIdLure({ fromAddress, linkUrl, body, channel, hasAttachment }),
    [fromAddress, linkUrl, body, channel, hasAttachment],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Apple ID 'account locked' message check",
      `Sender domain: ${result.senderDomain || "not given"}`,
      `Link goes to: ${result.linkDomain || "not given"}`,
      `Score: ${result.score}/100 — ${result.band}`,
      "",
      ...result.findings.map((f) => `• [${SEVERITY_STYLE[f.severity].label}] ${f.title} — ${f.detail}`),
      "",
      "Safe ways to check your account:",
      ...SAFE_ROUTES.map((route, i) => `${i + 1}. ${route}`),
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
    setFromAddress(DEFAULTS.fromAddress);
    setLinkUrl(DEFAULTS.linkUrl);
    setBody(DEFAULTS.body);
    setChannel(DEFAULTS.channel);
    setHasAttachment(DEFAULTS.hasAttachment);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Apple ID Locked Phishing Anatomy</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            &ldquo;Your Apple ID has been locked&rdquo; is one of the most copied messages there is.
            Paste what you received and each part is checked against Apple&rsquo;s published rules —
            which domains its account mail uses, and what Apple never asks for.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The message you received</h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="ap-channel">How did it arrive?</label>
              <select
                id="ap-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className={`${INPUT_CLASS} mt-1.5`}
              >
                {CHANNELS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ap-from">Sender address</label>
              <input
                id="ap-from"
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="no_reply@email.apple.com"
                autoComplete="off"
                spellCheck={false}
                className={`${INPUT_CLASS} mt-1.5`}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ap-link">Where the button or link goes</label>
            <input
              id="ap-link"
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
              autoComplete="off"
              spellCheck={false}
              className={`${INPUT_CLASS} mt-1.5 font-mono text-sm`}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Copy the link target, not the words on the button. Long press on a phone, or right
              click then &ldquo;Copy link address&rdquo; on a computer.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ap-body">Message text</label>
            <textarea
              id="ap-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the visible text"
              className={`${TEXTAREA_CLASS} mt-1.5`}
            />
          </div>

          <label
            htmlFor="ap-attachment"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="ap-attachment"
              type="checkbox"
              checked={hasAttachment}
              onChange={(e) => setHasAttachment(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
            />
            <span>It came with an attachment (receipt, invoice or PDF)</span>
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
        <h2 className="text-base font-semibold">What Apple does not do</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {APPLE_POLICY_FACTS.map((fact) => (
            <li key={fact} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anatomy of the account-locked email</h2>
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
              {APPLE_LOCKED_ANATOMY.map((row) => (
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Safe ways to check your account</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {SAFE_ROUTES.map((route, index) => (
            <li key={route} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--foreground)]">
                {index + 1}
              </span>
              <span>{route}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An independent educational tool, not affiliated with or endorsed by Apple. It analyses the
        text you paste in your own browser and never opens the link or contacts any service, so a
        low score is not confirmation that a message is genuine.
      </p>
    </main>
  );
}
