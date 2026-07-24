"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Braces,
  CheckCircle2,
  CircleHelp,
  Download,
  ExternalLink,
  FileJson2,
  Info,
  ListChecks,
  LockKeyhole,
  RefreshCw,
  ScanText,
  ShieldCheck,
} from "lucide-react";

import {
  buildCountsOnlyScopeReport,
  translateConsentScope,
} from "../lib/translateConsent.mjs";

const SAMPLE_REQUEST = JSON.stringify(
  {
    requesterName: "Example Education Service",
    requestedDocuments: ["Degree Certificate", "Marksheet"],
    requestedFields: ["name", "registration number", "award year"],
    purposeOfAccess: "Admission verification",
    accessDuration: "As needed",
    accessFrequency: "One time",
    retentionPeriod: "30 days",
    consent: true,
  },
  null,
  2,
);

const STATUS_STYLE = {
  ambiguous: "border-warning bg-warning-soft text-warning",
  explicit: "border-success bg-success-soft text-success",
  missing: "border-border bg-surface-soft text-muted-foreground",
};

const STATUS_LABEL = {
  ambiguous: "Needs clarification",
  explicit: "Explicitly stated",
  missing: "Not stated",
};

const OFFICIAL_SOURCES = [
  {
    title: "DigiLocker Requester Integration",
    href: "https://www.digilocker.gov.in/web/partners/requesters",
    note: "Describes requester integration, document/scope-level consent and the user option to revoke access.",
  },
  {
    title: "DigiLocker Requester Terms of Use — June 2025",
    href: "https://img1.digitallocker.gov.in/circulars/termsofuse/DigiLocker-Terms-of-Use-Requester-june-2025.pdf",
    note: "Requires explicit informed consent, a clear access purpose and storage no longer than the permitted duration.",
  },
  {
    title: "DigiLocker User Terms of Use",
    href: "https://www.digilocker.gov.in/web/about/tos",
    note: "States that users must explicitly consent before documents are fetched or shared and that consent details are logged.",
  },
  {
    title: "Authorized Partner API Specification v1.10",
    href: "https://img1.digitallocker.gov.in/assets/img/Digital%20Locker%20Authorized%20Partner%20API%20Specification%20v1.10.pdf",
    note: "Older technical reference illustrating a consent indicator and consent text naming shared fields, issuer, purpose and certificate.",
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

function ScopeCard({ item }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-foreground">{item.label}</h3>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[item.status]}`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {item.explanation}
      </p>
      {item.values.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Supplied wording
          </p>
          <ul className="mt-2 space-y-2">
            {item.values.map((value, index) => (
              <li
                key={`${value}-${index}`}
                className="break-words rounded-lg border border-border bg-surface-soft px-3 py-2 text-sm text-foreground"
              >
                {value}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export default function DigiLockerConsentScopeTranslator() {
  const [source, setSource] = useState(SAMPLE_REQUEST);
  const [result, setResult] = useState(null);

  function translate() {
    setResult(translateConsentScope(source));
  }

  function loadSample() {
    setSource(SAMPLE_REQUEST);
    setResult(null);
  }

  function clear() {
    setSource("");
    setResult(null);
  }

  function downloadReport() {
    if (!result) return;
    const report = buildCountsOnlyScopeReport(result);
    const url = URL.createObjectURL(
      new Blob([report], { type: "application/json;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "altftool-consent-scope-coverage-counts.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const clarificationItems =
    result?.items.filter((item) => item.status !== "explicit") ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <ScanText aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          DigiLocker Consent Scope Translator
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Turn explicitly labeled consent or request JSON/text into a plain-language
          checklist for requester, documents, fields, purpose, duration, frequency,
          retention and revocation.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-left">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
          />
          <div>
            <p className="font-semibold text-foreground">
              Local explainer—not a DigiLocker connection
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              This tool only reads text in your browser tab. It does not log in,
              access an account, fetch a document, call an API, approve a request,
              validate consent, upload input or store it. Official links open only
              when you choose them.
            </p>
          </div>
        </div>
      </header>

      <section className="tool-card mt-6" aria-labelledby="consent-input-title">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <FileJson2 aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="consent-input-title" className="text-2xl font-bold text-foreground">
              Paste consent or request JSON/text
            </h2>
            <p id="consent-input-help" className="mt-1 text-sm leading-6 text-muted-foreground">
              Remove tokens, secrets, Aadhaar numbers and other unnecessary
              identifiers first. Only explicit labels are translated.
            </p>
          </div>
        </div>

        <label htmlFor="consent-source" className="sr-only">
          Consent or request JSON or labeled text
        </label>
        <textarea
          id="consent-source"
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            setResult(null);
          }}
          aria-describedby="consent-input-help"
          spellCheck="false"
          className="mt-5 min-h-80 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
          placeholder="Requester: Example organization&#10;Documents requested: Driving Licence&#10;Purpose: Identity verification"
        />

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Generic scope tokens and consent booleans are noted but never interpreted
            as document permission, approval, authenticity or legal validity.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={translate}>
              <ListChecks aria-hidden="true" className="h-4 w-4" />
              Explain stated scope
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

      {result ? (
        <div aria-live="polite">
          {result.notices.length ? (
            <section className="mt-6 space-y-3" aria-label="Interpretation notices">
              {result.notices.map((notice) => (
                <div
                  key={notice}
                  className="flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4"
                >
                  <AlertTriangle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                  />
                  <p className="text-sm leading-6 text-foreground">{notice}</p>
                </div>
              ))}
            </section>
          ) : null}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={ListChecks}
              label="Scope areas"
              value={result.summary.total}
              detail={`Input recognized as ${result.format}`}
            />
            <MetricCard
              icon={CheckCircle2}
              label="Explicit"
              value={result.summary.explicit}
              detail="Concrete labeled wording found"
              tone="success"
            />
            <MetricCard
              icon={CircleHelp}
              label="Needs clarification"
              value={result.summary.ambiguous}
              detail="Broad, conditional or conflicting"
              tone="warning"
            />
            <MetricCard
              icon={Info}
              label="Not stated"
              value={result.summary.missing}
              detail="No explicit labeled value found"
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <section
              className="space-y-4 xl:col-span-2"
              aria-labelledby="scope-results-title"
            >
              <div className="tool-card">
                <h2 id="scope-results-title" className="text-2xl font-bold text-foreground">
                  Plain-language scope checklist
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  “Explicitly stated” means only that a supported label and value
                  appeared in the pasted input. It is not a recommendation to approve.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {result.items.map((item) => (
                  <ScopeCard key={item.key} item={item} />
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="tool-card" aria-labelledby="questions-title">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
                    <CircleHelp aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id="questions-title" className="text-xl font-bold text-foreground">
                      Ask before deciding
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Clarify every missing or broad scope area with the requester.
                    </p>
                  </div>
                </div>

                {clarificationItems.length ? (
                  <ul className="mt-5 space-y-3">
                    {clarificationItems.map((item) => (
                      <li
                        key={item.key}
                        className="flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm leading-6 text-foreground"
                      >
                        <AlertTriangle
                          aria-hidden="true"
                          className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                        />
                        <span>
                          Ask for a specific, explicit statement of{" "}
                          <strong>{item.label.toLowerCase()}</strong>.
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-lg border border-success bg-success-soft p-4">
                    <p className="text-sm leading-6 text-foreground">
                      Every supported area has concrete labeled wording. Still verify
                      the requester and read the actual consent screen before deciding.
                    </p>
                  </div>
                )}
              </section>

              <section className="tool-card" aria-labelledby="safe-report-title">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Download aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id="safe-report-title" className="text-xl font-bold text-foreground">
                      Counts-only report
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Excludes requester names, document and field values, purpose,
                      dates, URLs, credentials and source text.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary mt-5 w-full"
                  onClick={downloadReport}
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Download coverage counts
                </button>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <ListChecks aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            The scope checklist will appear here
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Use the synthetic sample or paste a request, then explain only the scope
            details it explicitly states.
          </p>
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
              <Info aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Interpretation limits
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                This checklist is informational and is not legal advice or an
                official DigiLocker consent interface.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {[
              "The tool cannot verify a requester, request signature, app, domain, document, consent record or DigiLocker affiliation.",
              "It never treats a consent flag, OAuth scope, button label or pasted statement as proof that consent was freely given or valid.",
              "Missing details might appear in another screen, linked privacy notice, contract or later step that was not pasted.",
              "Retention and revocation wording can describe a policy without proving that storage limits or withdrawal actually work.",
              "Official interfaces and documentation can change; review the live consent screen and current official material.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm leading-6 text-foreground"
              >
                <AlertTriangle
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
                Official DigiLocker references
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Primary public sources reviewed 24 July 2026. Check them again for
                updates before relying on this explanation.
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
    </main>
  );
}
