"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  EXAMPLE_LINKS,
  PORTAL_PAGE_TELLS,
  PRETEXT_PHRASES,
  STUDENT_CHECKLIST,
  analysePortalUrl,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
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

const DEFAULT_URL = EXAMPLE_LINKS[0].url;
const DEFAULT_OFFICIAL = EXAMPLE_LINKS[0].official;

export default function ToolHome() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [official, setOfficial] = useState(DEFAULT_OFFICIAL);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analysePortalUrl({ url, officialDomain: official }), [url, official]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Student portal link check",
      `Link: ${url.trim()}`,
      `Host the browser will connect to: ${result.host}`,
      `Registrable domain: ${result.registrableDomain}`,
      `Verdict: ${result.verdictLabel}`,
      "",
      ...result.findings
        .filter((f) => f.weight > 0 || f.severity === "ok" || f.title === "Registrable domain matches")
        .map((f) => `• ${f.title} — ${f.detail}`),
      "",
      "What to do:",
      ...STUDENT_CHECKLIST.map((step, i) => `${i + 1}. ${step}`),
    ].join("\n");
  }, [hasError, result, url]);

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
    setUrl(DEFAULT_URL);
    setOfficial(DEFAULT_OFFICIAL);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">University Portal Phishing Anatomy</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Fake student portals do not need a convincing domain — they need one that looks
            convincing on a phone. Paste the link and the domain you already know, and every part of
            the address is separated out so you can see which one actually decides where you land.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="up-url">Link from the message</label>
            <input
              id="up-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              autoComplete="off"
              spellCheck={false}
              className={`${INPUT_CLASS} mt-1.5 font-mono text-sm`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="up-official">Your institution&apos;s domain</label>
            <input
              id="up-official"
              type="text"
              value={official}
              onChange={(e) => setOfficial(e.target.value)}
              placeholder="ox.ac.uk"
              autoComplete="off"
              spellCheck={false}
              className={`${INPUT_CLASS} mt-1.5 font-mono text-sm`}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Take it from your student card, a printed handbook or the address you normally type —
              not from the message you are checking.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_LINKS.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => { setUrl(example.url); setOfficial(example.official); }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {example.label}
            </button>
          ))}
        </div>
      </section>

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        {hasError && (
          <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.error}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">You would actually be talking to</p>
            <p className={`break-all text-2xl font-extrabold sm:text-3xl ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.tone]}`}>
              {hasError ? "—" : result.registrableDomain}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasError ? "—" : result.verdictLabel}</p>
            {!hasError && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Risk signal score: {result.score}/100 (sum of the weighted red flags found below)
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={hasError}
              aria-label="Copy the breakdown to the clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the link and domain" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <caption className="sr-only">Every part of the link and whether it decides the destination</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Part</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Value</th>
                    <th scope="col" className="py-2 font-semibold">Decides where you go?</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row) => (
                    <tr key={row.part} className="border-b border-[var(--border)] align-top last:border-0">
                      <td className="py-2.5 pr-3 font-semibold">{row.part}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs break-all">{row.value || "—"}</td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            row.decides ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {row.decides ? "Yes — this one" : "No"}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{row.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
        <h2 className="text-base font-semibold">What the fake sign-in page itself gets wrong</h2>
        <ul className="mt-3 grid gap-3">
          {PORTAL_PAGE_TELLS.map((item) => (
            <li key={item.tell} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="text-sm font-semibold">{item.tell}</p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{item.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Excuses used to get you to sign in</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRETEXT_PHRASES.map((phrase) => (
            <span key={phrase} className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
              {phrase}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          All of them share one shape: a deadline plus a link. Your university has no reason to make
          you re-enter a password through an emailed link, so the pretext is the tell regardless of
          how the page looks.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">If you clicked it</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {STUDENT_CHECKLIST.map((step, index) => (
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
        The analysis reads the text of the link only — it never opens it, resolves it or contacts
        any site. A matching domain is not proof that a page is genuine, and this page is
        educational rather than a security product. Report suspected phishing to your institution&apos;s
        IT service desk.
      </p>
    </main>
  );
}
