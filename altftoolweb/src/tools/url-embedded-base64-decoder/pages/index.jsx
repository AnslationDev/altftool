"use client";

import { useMemo, useState } from "react";
import { Binary, Check, Copy, RotateCcw } from "lucide-react";

import { MIN_TOKEN_LENGTH, decodeBlob, scanUrl } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[6rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:text-sm";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_URL =
  "https://track.example/r?d=aHR0cHM6Ly9zaWduaW4tc2VjdXJlLmV4YW1wbGUvdmVyaWZ5&e=dmljdGltQGJhbmsuY29t";
const DEFAULT_BLOB = "aHR0cHM6Ly9zaWduaW4tc2VjdXJlLmV4YW1wbGUvdmVyaWZ5";

export default function ToolHome() {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState(DEFAULT_URL);
  const [blob, setBlob] = useState(DEFAULT_BLOB);
  const [copied, setCopied] = useState(false);

  const scan = useMemo(() => (mode === "url" ? scanUrl(url) : null), [mode, url]);
  const single = useMemo(() => (mode === "blob" ? decodeBlob(blob) : null), [mode, blob]);

  const active = mode === "url" ? scan : single;
  const hasError = Boolean(active?.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    if (mode === "blob") {
      return [
        "Decoded blob",
        `Encoding: ${single.encoding}${single.rounds > 1 ? ` (${single.rounds} layers)` : ""}`,
        `Result: ${single.decoded}`,
        single.embeddedUrl ? `Embedded link: ${single.embeddedUrl}` : "",
        single.embeddedEmail ? `Embedded address: ${single.embeddedEmail}` : "",
      ].filter(Boolean).join("\n");
    }
    return [
      "Encoded content found in the link",
      `Link: ${scan.input}`,
      `Candidates examined: ${scan.scanned}`,
      "",
      ...scan.findings.map(
        (f) => `• [${f.encoding}${f.rounds > 1 ? ` ×${f.rounds}` : ""}] ${f.token.slice(0, 40)}${f.token.length > 40 ? "…" : ""} → ${f.decoded}`,
      ),
    ].join("\n");
  }, [hasError, mode, scan, single]);

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
    setMode("url");
    setUrl(DEFAULT_URL);
    setBlob(DEFAULT_BLOB);
    setCopied(false);
  };

  const headlineValue = () => {
    if (hasError) return "—";
    if (mode === "blob") return single.decoded;
    if (!scan.findings.length) return "Nothing decodable found";
    return scan.findings[0].embeddedUrl || scan.findings[0].decoded;
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <Binary className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Base64 in URL Decoder</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Redirect links hide their real destination — and often your email address — in a base64
            or hex blob. This scans every part of a link, percent-decoded as well as raw, decodes
            what turns out to be readable text, and follows further layers when a result is itself
            encoded. Nothing is fetched; the link is never opened.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="b64-mode">What are you pasting?</label>
          <select
            id="b64-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className={`${INPUT_CLASS} mt-1.5`}
          >
            <option value="url">A whole link to scan</option>
            <option value="blob">A single base64 or hex string</option>
          </select>
        </div>

        <div className="mt-4">
          {mode === "url" ? (
            <>
              <label className={LABEL_CLASS} htmlFor="b64-url">Link</label>
              <textarea
                id="b64-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://track.example/r?d=aHR0cHM6…"
                spellCheck={false}
                className={`${TEXTAREA_CLASS} mt-1.5`}
              />
            </>
          ) : (
            <>
              <label className={LABEL_CLASS} htmlFor="b64-blob">Encoded string</label>
              <textarea
                id="b64-blob"
                value={blob}
                onChange={(e) => setBlob(e.target.value)}
                placeholder="aHR0cHM6Ly9leGFtcGxlLmNvbQ=="
                spellCheck={false}
                className={`${TEXTAREA_CLASS} mt-1.5`}
              />
            </>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        {hasError && (
          <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {active.error}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              {mode === "blob" ? "Decoded" : "What the link really points at"}
            </p>
            <p className={`break-all text-lg font-bold sm:text-xl ${hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}>
              {headlineValue()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={hasError || !summary}
              aria-label="Copy the decoded result to the clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample link" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && mode === "blob" && (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Encoding</dt>
              <dd className="text-right font-semibold">{single.encoding}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Layers of encoding</dt>
              <dd className="text-right font-semibold">{single.rounds}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Link inside</dt>
              <dd className="break-all text-right font-mono text-xs font-semibold">{single.embeddedUrl || "—"}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Email address inside</dt>
              <dd className="break-all text-right font-mono text-xs font-semibold">{single.embeddedEmail || "—"}</dd>
            </div>
          </dl>
        )}

        {!hasError && mode === "url" && (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Candidates examined</dt>
                <dd className="text-right font-semibold">{scan.scanned}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Blobs that decoded to text</dt>
                <dd className="text-right font-semibold">{scan.findings.length}</dd>
              </div>
            </dl>

            <ul className="mt-5 grid gap-3">
              {scan.findings.map((finding) => (
                <li key={finding.token} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                      {finding.encoding}
                    </span>
                    {finding.rounds > 1 && (
                      <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--warning)]">
                        {finding.rounds} layers deep
                      </span>
                    )}
                    {finding.embeddedUrl && (
                      <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        contains a link
                      </span>
                    )}
                    {finding.embeddedEmail && (
                      <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        contains an address
                      </span>
                    )}
                    <span className="text-xs text-[var(--muted-foreground)]">{finding.where}</span>
                  </div>
                  <p className="mt-2 font-mono text-xs break-all text-[var(--muted-foreground)]">{finding.token}</p>
                  <p className="mt-2 font-mono text-xs break-all font-semibold sm:text-sm">{finding.decoded}</p>
                </li>
              ))}
              {!scan.findings.length && (
                <li className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)]">
                  No part of this link decoded to readable text. Identifiers of {MIN_TOKEN_LENGTH} characters
                  or more that are random, encrypted or compressed will look exactly like this — the
                  absence of a decode is not a verdict on the link.
                </li>
              )}
            </ul>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Why links carry encoded blobs</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Redirect targets", "A tracking or shortening service stores the real destination inside the link so it can log the click and then forward you. Decoding it shows where you would end up without visiting."],
            ["Your identity", "Email marketing and phishing kits alike embed the recipient's address, so opening the link tells the sender exactly who you are — and pre-fills the address on a fake sign-in page."],
            ["Filter evasion", "Encoding hides a blocked domain from a scanner that only reads plain text, which is why a harmless-looking host can still lead somewhere blocked."],
            ["Ordinary state", "Plenty of legitimate applications encode a session, a filter or a return path. Finding base64 in a link is normal; what matters is what it decodes to."],
          ].map(([term, detail]) => (
            <div key={term} className="py-3">
              <dt className="font-semibold">{term}</dt>
              <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Decoding happens in your browser with a base64 and UTF-8 implementation written for this
        page — the link is never requested, so a live phishing URL can be inspected safely. A blob
        that does not decode may simply be encrypted, compressed or random, and a decoded
        destination is still an untrusted address: read the host before you consider visiting it.
      </p>
    </main>
  );
}
