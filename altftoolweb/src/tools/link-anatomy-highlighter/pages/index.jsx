"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Link2, RotateCcw } from "lucide-react";
import { analyseUrl, KIND_LABELS } from "../lib";

const DEFAULT_URL =
  "http://secure-login.sbi.verify-account.ru:8080/update?next=https://evil.example&otp=123456";

const SAMPLES = [
  ["Genuine", "https://accounts.google.com/signin?hl=en"],
  ["Userinfo trick", "https://support.paypal.com@198.51.100.7/verify"],
  ["Punycode", "https://xn--pypal-4ve.com/login"],
  ["Shortened", "bit.ly/3xYzQpL"],
];

const KIND_STYLE = {
  scheme: "bg-[var(--primary)]/12 text-[var(--primary)]",
  delim: "text-[var(--muted-foreground)]",
  userinfo: "bg-[var(--danger-soft)] text-[var(--danger)] font-semibold",
  subdomain: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  domain: "bg-[var(--success-soft)] text-[var(--success)] font-semibold underline decoration-2 underline-offset-4",
  port: "bg-[var(--warning-soft)] text-[var(--warning)] font-semibold",
  path: "bg-[var(--muted)] text-[var(--foreground)]",
  query: "bg-[var(--primary)]/12 text-[var(--primary)]",
  fragment: "text-[var(--muted-foreground)] italic",
  opaque: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const LEVEL_STYLE = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const LEVEL_LABEL = { danger: "High", warn: "Check", info: "Note" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseUrl(url), [url]);
  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Link Anatomy Highlighter",
      `Link: ${result.url}`,
      `Scheme: ${result.scheme || "(none given)"}`,
      `Registered domain: ${result.domain || DASH}`,
      `Subdomain: ${result.subdomain || "(none)"}`,
      `Port: ${result.effectivePort === null ? "(none)" : result.effectivePort}`,
      `Path: ${result.path || "/"}`,
      `Attention score: ${result.score} / 100 — ${result.verdict}`,
    ];
    if (result.risks.length > 0) {
      lines.push("Findings:");
      result.risks.forEach((risk) => {
        lines.push(`- [${LEVEL_LABEL[risk.level]}] ${risk.title}: ${risk.detail}`);
      });
    } else {
      lines.push("Findings: none from the structure alone.");
    }
    return lines.join("\n");
  }, [failed, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setUrl(DEFAULT_URL);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Link safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Link Anatomy Highlighter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste any link and see it split into scheme, user info, subdomain, registered domain,
          port, path, query and fragment — with the parts phishing campaigns abuse called out.
          Everything runs in your browser; the link is never sent anywhere.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="link-input">
          Link to inspect
        </label>
        <input
          id="link-input"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Nothing is fetched or opened — the link is only read as text.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SAMPLES.map(([label, sample]) => (
            <button
              key={label}
              type="button"
              onClick={() => setUrl(sample)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Attention score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.score} / 100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the link breakdown and findings"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the link field" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <p className="break-all font-mono text-sm leading-8">
            {failed
              ? DASH
              : result.segments.map((segment, index) => (
                  <span
                    key={`${segment.kind}-${segment.start}-${index}`}
                    className={`rounded px-0.5 py-1 ${KIND_STYLE[segment.kind] || ""}`}
                    title={KIND_LABELS[segment.kind] || segment.kind}
                  >
                    {segment.value}
                  </span>
                ))}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Scheme", failed ? DASH : result.scheme || "none given"],
            ["User info (before @)", failed ? DASH : result.userinfo || "none"],
            ["Subdomain (anyone can create)", failed ? DASH : result.subdomain || "none"],
            ["Registered domain — the part that matters", failed ? DASH : result.domain || DASH],
            ["Host labels", failed ? DASH : String(result.labelCount)],
            [
              "Port",
              failed
                ? DASH
                : result.effectivePort === null
                  ? "none"
                  : `${result.effectivePort}${result.port === "" ? " (scheme default)" : " (explicit)"}`,
            ],
            ["Path", failed ? DASH : result.path || "/"],
            ["Query parameters", failed ? DASH : String(result.queryPairs.length)],
            ["Fragment", failed ? DASH : result.fragment || "none"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] break-all text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          Findings{failed ? "" : ` (${result.risks.length})`}
        </h2>
        {failed ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : result.risks.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Nothing suspicious in the structure. Structure is only half the story — a genuine-looking
            domain can still have been registered yesterday, so check that you expected the message.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {result.risks.map((risk) => (
              <li key={risk.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_STYLE[risk.level]}`}
                  >
                    {LEVEL_LABEL[risk.level]}
                  </span>
                  <span className="text-sm font-semibold">{risk.title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{risk.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!failed && result.queryPairs.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Query parameters</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Key</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Raw value</th>
                  <th scope="col" className="py-2 font-semibold">Decoded</th>
                </tr>
              </thead>
              <tbody>
                {result.queryPairs.map((pair, index) => (
                  <tr key={`${pair.key}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 break-all font-semibold">{pair.key}</td>
                    <td className="py-2 pr-3 break-all text-[var(--muted-foreground)]">{pair.value || "(empty)"}</td>
                    <td className="py-2 break-all">{pair.decoded || "(empty)"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Colour key</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs">
          {["scheme", "userinfo", "subdomain", "domain", "port", "path", "query", "fragment"].map((kind) => (
            <li key={kind} className={`rounded px-2 py-1 font-mono ${KIND_STYLE[kind]}`}>
              {KIND_LABELS[kind]}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Read a link right to left from the first single slash: the two labels just before it are
          the registered domain, and that is the only part nobody else can fake.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational analysis of the link text only. A clean score is not a safety guarantee, and a
        high score is not proof of fraud — when money or an account is involved, reach the service
        by typing its address yourself rather than following any link.
      </p>
    </main>
  );
}
