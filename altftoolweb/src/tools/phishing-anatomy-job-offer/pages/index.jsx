"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Link2,
  MessageSquareWarning,
  Phone,
  RotateCcw,
  Briefcase,
  TriangleAlert,
} from "lucide-react";

import {
  MAX_MARKER_SCORE,
  REAL_BEHAVIOUR,
  REPORTING,
  SIGNALS,
  SPECIMEN,
  SPECIMEN_TEXT,
  analyzeMessage,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const TEXTAREA_CLASS =
  "min-h-[9rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_BOX =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const SEVERITY_CLASS = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  high: "bg-[var(--warning-soft)] text-[var(--warning)]",
  medium: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function bandTone(band) {
  if (band === "critical" || band === "high") return "bg-[var(--danger)]";
  if (band === "medium") return "bg-[var(--warning)]";
  if (band === "low") return "bg-[var(--warning)]";
  return "bg-[var(--success)]";
}

export default function ToolHome() {
  const [message, setMessage] = useState(SPECIMEN_TEXT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyzeMessage(message), [message]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Job offer scam check",
      `Risk score: ${result.score} of ${MAX_MARKER_SCORE} marker points — ${result.bandLabel}`,
      `Message markers: ${result.matched.length} of ${result.matched.length + result.missed.length}`,
      `Link findings: ${result.links.reduce((sum, link) => sum + link.findings.length, 0)}`,
      "",
    ];
    if (result.matched.length > 0) {
      lines.push("Markers found:");
      for (const marker of result.matched) lines.push(`- ${marker.label} (+${marker.weight})`);
    } else {
      lines.push("No known scam markers matched. That is not proof the message is genuine.");
    }
    if (result.links.length > 0) {
      lines.push("", "Links:");
      for (const link of result.links) {
        lines.push(`- ${link.host} (real domain: ${link.registrable})`);
        for (const finding of link.findings) lines.push(`    · ${finding.label}`);
      }
    }
    lines.push("", "No employer charges a candidate to hire them. If money was already sent, call 1930 and file at cybercrime.gov.in.");
    return lines.join("\n");
  }, [ok, result]);

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
    setMessage(SPECIMEN_TEXT);
    setCopied(false);
  };

  const linkFindingCount = ok
    ? result.links.reduce((sum, link) => sum + link.findings.length, 0)
    : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Phishing anatomy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Job Offer Phishing Anatomy
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A fraudulent offer letter taken apart line by line &mdash; the fee dressed up as
          refundable, the lookalike HR domain, the seats closing at 5pm &mdash; with a scanner that
          weighs the same tells against any recruiter message you paste. Everything runs in this
          tab; nothing you paste is uploaded.
        </p>
      </header>

      <section className={CARD} aria-labelledby="pa-scan">
        <h2 id="pa-scan" className="text-base font-semibold">
          Scan a message
        </h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="pa-message">
            Paste the SMS, email or WhatsApp message
          </label>
          <textarea
            id="pa-message"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={message}
            spellCheck={false}
            onChange={(event) => {
              setMessage(event.target.value);
              setCopied(false);
            }}
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Defanged addresses work too &mdash; bad[.]online and hxxp:// are read as written.
            Never paste your own Aadhaar, PAN, bank details or OTP anywhere, including here.
          </p>
        </div>

        {result.error ? (
          <p role="alert" className={`mt-4 ${ERROR_BOX}`}>
            {result.error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Risk score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM.format(result.score) : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{ok ? result.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {ok ? result.bandHint : "Paste a message to score it."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the phishing scan result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the scanner to the specimen message"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={ok ? `Risk ${result.percent} out of 100` : "No score available"}
        >
          <span
            className={`block h-full ${ok ? bandTone(result.band) : "bg-[var(--muted)]"}`}
            style={{ width: `${ok ? Math.max(2, result.percent) : 0}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Markers matched",
              ok ? `${result.matched.length} of ${result.matched.length + result.missed.length}` : DASH,
            ],
            ["Points from the wording", ok ? NUM.format(result.markerScore) : DASH],
            ["Points from the links", ok ? NUM.format(result.linkScore) : DASH],
            [
              "Links found",
              ok ? `${result.links.length} (${linkFindingCount} findings)` : DASH,
            ],
            [
              "Strongest link problem",
              ok && result.worstLink && result.worstLink.findings.length > 0
                ? result.worstLink.findings[0].label
                : ok
                  ? "None"
                  : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.matched.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">What matched, and why it matters</h2>
          <ul className="mt-3 space-y-3">
            {result.matched.map((marker) => (
              <li
                key={marker.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{marker.label}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {marker.category} &middot; +{marker.weight}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{marker.why}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ok && result.links.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Link2 className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            The links in that message
          </h2>
          <div className="mt-3 space-y-3">
            {result.links.map((link) => (
              <div
                key={link.url}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="break-all text-sm font-semibold">{link.host}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Real domain:{" "}
                  <span className="font-semibold text-[var(--foreground)]">{link.registrable}</span>
                  {link.official ? " — on the official list" : " — not a known bank domain"}
                </p>
                {link.findings.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {link.findings.map((finding) => (
                      <li key={finding.id} className="flex gap-2">
                        <TriangleAlert
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--danger)]"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="font-medium">{finding.label}.</span>{" "}
                          <span className="text-[var(--muted-foreground)]">{finding.why}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Nothing structurally wrong with this address.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <MessageSquareWarning className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          The specimen, line by line
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {SPECIMEN.channel} from <span className="font-semibold">{SPECIMEN.senderLabel}</span>.{" "}
          {SPECIMEN.context}
        </p>
        <ol className="mt-4 space-y-3">
          {SPECIMEN.lines.map((line, index) => {
            const signal = SIGNALS.find((entry) => entry.id === line.signal);
            return (
              <li
                key={`${line.signal}-${index}`}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="break-words font-mono text-[13px] leading-6">{line.text}</p>
                {signal ? (
                  <div className="mt-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        SEVERITY_CLASS[signal.severity] || SEVERITY_CLASS.medium
                      }`}
                    >
                      {signal.severity} &middot; {signal.label}
                    </span>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                      {signal.why}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The company in the specimen is fictional, the address is written with [.] so nothing is
          clickable, and the phone number is redacted. This is a composite of reported messages,
          not a copy of one real employer's correspondence.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">How genuine recruitment actually works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          {REAL_BEHAVIOUR.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Phone className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          If you already paid or sent documents
        </h2>
        <dl className="mt-3 space-y-3 text-sm">
          {REPORTING.map((item) => (
            <div key={item.label}>
              <dt className="font-semibold">{item.label}</dt>
              <dd className="text-[var(--muted-foreground)]">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The scanner looks for documented markers of the fake-offer family and weighs them. A high
        score means the message is built the way these scams are built; a zero is not a certificate
        that an offer is genuine, because a careful forgery can avoid every marker. Verify any
        offer through the company's own careers page and a recruiter you can find independently.
        This page is general security education, not legal or employment advice.
      </p>
    </main>
  );
}
