"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Braces,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  Info,
  ListChecks,
  LockKeyhole,
  MapPin,
  MessageSquareText,
  Phone,
  RefreshCw,
  ShieldCheck,
  Tag,
} from "lucide-react";

import {
  buildCountsOnlyHeaderReport,
  CATEGORY_SUFFIXES,
  explainSenderHeaders,
} from "../lib/explainHeader.mjs";

const SAMPLE_HEADERS = `VD-KOTAKB-S
JD-LOGIN1-T
AD-OFFERS-P
BD-PUBLIC-G
JD-IPAYTM
127123
9876543210
UNKNOWN-SENDER`;

const STATUS_STYLE = {
  explained: "border-success bg-success-soft text-success",
  partial: "border-warning bg-warning-soft text-warning",
  unknown: "border-border bg-surface-soft text-muted-foreground",
};

const STATUS_LABEL = {
  explained: "Structure explained",
  partial: "Partial or ambiguous",
  unknown: "Unknown format",
};

const FORMAT_LABEL = {
  "consent-short-code": "127xxx consent-seeking short-code shape",
  "header-only": "Six-character header only",
  "header-with-category-no-prefix": "Header and category suffix; no origin prefix",
  "prefixed-unknown-category": "Prefixed header with unknown suffix",
  "prefixed-with-category": "Provider/service-area prefix, header and category suffix",
  "prefixed-without-category": "Provider/service-area prefix and header; no category suffix",
  "ten-digit-number": "Regular ten-digit phone-number shape",
  unrecognized: "Unrecognized",
};

const OFFICIAL_SOURCES = [
  {
    title: "TCCCPR Second Amendment Regulations, 2025",
    href: "https://cms.trai.gov.in/sites/default/files/2025-02/Regulation_12022025_0.pdf",
    note: "Official amendment documenting -P, -S, -T and -G cues and the 127xxx consent-seeking short-code family.",
  },
  {
    title: "TRAI — What is Spam or UCC",
    href: "https://trai.gov.in/what-spam-or-ucc",
    note: "Current consumer explanation of headers and the typical XY-ABCDEF structure.",
  },
  {
    title: "TRAI Header and Prefix Explanation",
    href: "https://trai.gov.in/sites/default/files/2024-09/Detail_Header_Prefixes_16062020_0.pdf",
    note: "Official 2020 provider and service-area prefix tables used for the historical code explanations.",
  },
  {
    title: "TRAI Portals and Apps",
    href: "https://trai.gov.in/portal-and-apps",
    note: "Describes the official Header Information Portal; this tool deliberately performs no portal lookup.",
  },
  {
    title: "DoT/PIB UCC and DLT update — February 2026",
    href: "https://www.dot.gov.in/static/uploads/2026/02/2f35b2d58f60cbbeb8fe3447f609445c.pdf",
    note: "Current official summary stating that registered headers are prescribed for commercial SMS and noting regular ten-digit-number misuse.",
  },
];

function MetricCard({ detail, icon: Icon, label, tone = "primary", value }) {
  const toneClass =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : "text-primary";
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${toneClass}`}>
            {value.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function PrefixComponent({ icon: Icon, title, component }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft p-4">
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title} · code {component.code}
          </p>
          <p className="mt-1 font-semibold text-foreground">{component.label}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {component.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeaderResult({ index, result }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Entry {index + 1}
          </p>
          <h3 className="mt-1 break-all font-mono text-lg font-bold text-foreground">
            {result.input}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {FORMAT_LABEL[result.format] ?? result.format}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[result.status]}`}
        >
          {STATUS_LABEL[result.status]}
        </span>
      </div>

      {result.headerCode ? (
        <div className="mt-4 rounded-lg border border-border bg-surface-soft p-4">
          <div className="flex items-start gap-3">
            <Tag aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Principal Entity header-shaped segment
              </p>
              <p className="mt-1 font-mono font-bold text-foreground">
                {result.headerCode}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                A matching shape does not prove that this code is currently
                registered, active, assigned to the displayed brand, or used by the
                genuine entity.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {result.originPrefix ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <PrefixComponent
            icon={Building2}
            title="Provider reference"
            component={result.originPrefix.provider}
          />
          <PrefixComponent
            icon={MapPin}
            title="Service-area reference"
            component={result.originPrefix.serviceArea}
          />
        </div>
      ) : null}

      {result.category.status === "known" ? (
        <div className="mt-4 rounded-lg border border-primary bg-primary-soft p-4">
          <div className="flex items-start gap-3">
            <MessageSquareText
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            />
            <div>
              <p className="font-bold text-foreground">
                -{result.category.code}: {result.category.label} category cue
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                {result.category.explanation}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                The suffix does not verify that the message content was correctly
                categorized or that the sender complied with consent, preference or
                template rules.
              </p>
            </div>
          </div>
        </div>
      ) : result.category.code ? (
        <div className="mt-4 rounded-lg border border-warning bg-warning-soft p-4">
          <p className="font-semibold text-foreground">
            Unknown category suffix -{result.category.code}
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">
            {result.category.explanation}
          </p>
        </div>
      ) : null}

      {result.notices.length ? (
        <ul className="mt-4 space-y-2">
          {result.notices.map((notice) => (
            <li
              key={notice}
              className="flex items-start gap-2 rounded-lg bg-surface-soft p-3 text-sm leading-6 text-foreground"
            >
              <Info
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              />
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function DltSmsSenderIdExplainer() {
  const [source, setSource] = useState(SAMPLE_HEADERS);
  const [analysis, setAnalysis] = useState(null);

  function explain() {
    setAnalysis(explainSenderHeaders(source));
  }

  function loadSample() {
    setSource(SAMPLE_HEADERS);
    setAnalysis(null);
  }

  function clear() {
    setSource("");
    setAnalysis(null);
  }

  function downloadReport() {
    if (!analysis) return;
    const report = buildCountsOnlyHeaderReport(analysis);
    const url = URL.createObjectURL(
      new Blob([report], { type: "application/json;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "altftool-sms-header-format-counts.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <MessageSquareText aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          DLT SMS Sender ID Explainer
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Explain documented Indian commercial SMS header components and current
          category suffix cues without treating a familiar-looking sender ID as proof
          of identity, registration or message safety.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-left">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
          />
          <div>
            <p className="font-semibold text-foreground">
              Local format explanation only
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              No live DLT or Header Information Portal lookup occurs. The tool never
              opens message links, calls numbers, contacts a network, uploads text or
              stores entries. Official source links open only when you choose them.
            </p>
          </div>
        </div>
      </header>

      <section className="tool-card mt-6" aria-labelledby="header-input-title">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <ListChecks aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="header-input-title" className="text-2xl font-bold text-foreground">
              Enter sender IDs or headers
            </h2>
            <p id="header-input-help" className="mt-1 text-sm leading-6 text-muted-foreground">
              Use one entry per line, up to 100 entries. Do not paste message bodies,
              OTPs, account details or personal phone numbers unless needed to
              understand the displayed sender shape.
            </p>
          </div>
        </div>

        <label htmlFor="sender-headers" className="sr-only">
          SMS sender IDs or headers, one per line
        </label>
        <textarea
          id="sender-headers"
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            setAnalysis(null);
          }}
          aria-describedby="header-input-help"
          spellCheck="false"
          className="mt-5 min-h-64 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
          placeholder="VD-KOTAKB-S&#10;JD-LOGIN1-T"
        />

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Parsing is structural. The tool does not compare message content with a
            registered template or decide whether a communication is wanted,
            compliant, genuine, suspicious or fraudulent.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={explain}>
              <MessageSquareText aria-hidden="true" className="h-4 w-4" />
              Explain formats
            </button>
            <button type="button" className="btn-secondary" onClick={loadSample}>
              <Braces aria-hidden="true" className="h-4 w-4" />
              Load sample
            </button>
            <button type="button" className="btn-secondary" onClick={clear}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </section>

      {analysis ? (
        <div aria-live="polite">
          {analysis.warnings.length ? (
            <section className="mt-6 space-y-3" aria-label="Input warnings">
              {analysis.warnings.map((warning) => (
                <div
                  key={warning}
                  className="flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4"
                >
                  <AlertTriangle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                  />
                  <p className="text-sm leading-6 text-foreground">{warning}</p>
                </div>
              ))}
            </section>
          ) : null}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={ListChecks}
              label="Entries"
              value={analysis.summary.total}
              detail="Non-empty lines parsed"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Explained"
              value={analysis.summary.explained}
              detail="Known structure and reference codes"
              tone="success"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Partial"
              value={analysis.summary.partial}
              detail="Missing or unknown components"
              tone="warning"
            />
            <MetricCard
              icon={Tag}
              label="Category cues"
              value={analysis.summary.categoryCues}
              detail="Recognized P, S, T or G suffix"
            />
            <MetricCard
              icon={Info}
              label="Unknown"
              value={analysis.summary.unknown}
              detail="No supported structure found"
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <section
              className="space-y-4 xl:col-span-2"
              aria-labelledby="header-results-title"
            >
              <div className="tool-card">
                <h2 id="header-results-title" className="text-2xl font-bold text-foreground">
                  Structural explanations
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Provider/service-area labels come from TRAI’s official 2020 prefix
                  table and are historical references—not live routing facts.
                </p>
              </div>
              {analysis.results.length ? (
                analysis.results.map((result, index) => (
                  <HeaderResult
                    key={`${result.input}-${index}`}
                    index={index}
                    result={result}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                  <Info aria-hidden="true" className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No non-empty entries were supplied.
                  </p>
                </div>
              )}
            </section>

            <div className="space-y-6">
              <section className="tool-card" aria-labelledby="category-guide-title">
                <h2 id="category-guide-title" className="text-xl font-bold text-foreground">
                  Current suffix guide
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  TRAI’s 2025 amendment documents these category identifiers.
                </p>
                <div className="mt-5 space-y-3">
                  {Object.entries(CATEGORY_SUFFIXES).map(([code, category]) => (
                    <article
                      key={code}
                      className="rounded-lg border border-border bg-surface p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="rounded-full bg-primary-soft px-3 py-1 font-mono text-sm font-bold text-primary">
                          -{code}
                        </span>
                        <div>
                          <h3 className="font-bold text-foreground">{category.label}</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {category.explanation}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="tool-card" aria-labelledby="report-title">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Download aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id="report-title" className="text-xl font-bold text-foreground">
                      Counts-only report
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Excludes sender IDs, header codes, phone numbers and prefix
                      values.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary mt-5 w-full"
                  onClick={downloadReport}
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Download format counts
                </button>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <MessageSquareText aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Header explanations will appear here
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Load the synthetic examples or enter the exact sender labels shown by
            your messaging app, one per line.
          </p>
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
              <AlertTriangle aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Safety and interpretation limits
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                A recognized format is not a trust badge.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {[
              "The tool cannot verify live DLT registration, current assignment, sender identity, network origin, template matching or consent.",
              "Provider and service-area mappings are from TRAI’s official 2020 reference and can become outdated or incomplete.",
              "A category suffix describes the displayed category cue; it does not prove the message body fits that category.",
              "A regular ten-digit number or unknown format is not automatically spam, and a registered-looking header can still be misused or imitated.",
              "Links, callback numbers, attachments and message content are not opened, contacted, scanned or classified.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm leading-6 text-foreground"
              >
                <Info
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Official TRAI and DoT references
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Primary public sources reviewed 24 July 2026. Recheck current official
                material because code assignments and implementation guidance can
                change.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {OFFICIAL_SOURCES.map((sourceItem) => (
              <article
                key={sourceItem.href}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <a
                  href={sourceItem.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {sourceItem.title}
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {sourceItem.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Phone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            If you need to verify or report a communication, use facilities provided
            by TRAI or your telecom service provider. This educational tool does not
            submit complaints or contact any service.
          </p>
        </div>
      </section>
    </main>
  );
}
