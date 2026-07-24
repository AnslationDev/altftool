"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Binary,
  BookOpenCheck,
  Boxes,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSearch,
  Info,
  ListChecks,
  LockKeyhole,
  Network,
  RefreshCw,
  ScanSearch,
  ShieldQuestion,
} from "lucide-react";

import {
  PQ_INVENTORY_LIMITATIONS,
  PQ_INVENTORY_LIMITS,
  buildPostQuantumInventoryReport,
  inventoryPostQuantumReferences,
} from "../lib/postQuantumInventory.mjs";

const SAMPLE_INPUT = `# Application gateway configuration
tls.protocols = TLSv1.2,TLSv1.3
tls.cipher = TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
certificate.public_key_algorithm = rsaEncryption
certificate.signature_algorithm = sha256WithRSAEncryption
legacy_signing = ECDSA

# Lab interoperability flags; text presence is not deployment proof
experimental.key_establishment = ML-KEM-768
experimental.signature = ML-DSA-65`;

const SOURCES = [
  {
    title: "NIST Post-Quantum Cryptography project",
    href: "https://csrc.nist.gov/projects/post-quantum-cryptography",
  },
  {
    title: "NIST NCCoE — Migration to Post-Quantum Cryptography",
    href: "https://www.nccoe.nist.gov/projects/migration-post-quantum-cryptography",
  },
  {
    title: "NIST FIPS 203 — ML-KEM",
    href: "https://csrc.nist.gov/pubs/fips/203/final",
  },
  {
    title: "NIST FIPS 204 — ML-DSA",
    href: "https://csrc.nist.gov/pubs/fips/204/final",
  },
  {
    title: "NIST FIPS 205 — SLH-DSA",
    href: "https://csrc.nist.gov/pubs/fips/205/final",
  },
  {
    title: "CISA, NSA & NIST — Quantum-Readiness factsheet",
    href: "https://www.cisa.gov/sites/default/files/2023-08/Quantum-Readiness%20-%20Migration%20to%20Post-Quantum%20Cryptography_508c.pdf",
  },
];

const ASSESSMENT_STYLE = {
  review: {
    icon: AlertTriangle,
    box: "border-warning bg-warning-soft",
    iconBox: "bg-warning-soft text-foreground",
  },
  context: {
    icon: BookOpenCheck,
    box: "border-info bg-info-soft",
    iconBox: "bg-info-soft text-foreground",
  },
  empty: {
    icon: ShieldQuestion,
    box: "border-border bg-surface-soft",
    iconBox: "bg-surface text-muted-foreground",
  },
};

const KIND_META = {
  "classical-public-key": {
    label: "Classical public-key",
    className: "border-warning bg-warning-soft text-foreground",
  },
  "protocol-context": {
    label: "Protocol context",
    className: "border-info bg-info-soft text-foreground",
  },
  "post-quantum-reference": {
    label: "Post-quantum name",
    className: "border-success bg-success-soft text-foreground",
  },
};

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "post-quantum-migration-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function Summary({ result }) {
  const style =
    ASSESSMENT_STYLE[result.assessment.level] || ASSESSMENT_STYLE.empty;
  const Icon = style.icon;
  return (
    <section
      className={`rounded-lg border p-5 shadow-sm sm:p-6 ${style.box}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.iconBox}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Text-reference inventory
          </p>
          <h2 className="mt-1 text-xl font-black text-foreground">
            {result.assessment.label}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {result.assessment.description}
          </p>
          {result.truncated ? (
            <p className="mt-3 rounded-lg border border-warning bg-surface p-3 text-sm font-semibold text-foreground">
              Display truncated: totals include all{" "}
              {result.stats.observations.toLocaleString("en-US")} observed
              references, while only{" "}
              {result.stats.displayedObservations.toLocaleString("en-US")} are
              retained as location records.
            </p>
          ) : null}
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Classical public-key", result.counts["classical-public-key"]],
          ["Protocol context", result.counts["protocol-context"]],
          ["Post-quantum names", result.counts["post-quantum-reference"]],
          ["Unique families", result.stats.uniqueFamilies],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-surface p-3 sm:p-4"
          >
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 text-2xl font-black text-foreground">
              {value.toLocaleString("en-US")}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FamilyInventory({ result }) {
  const families = Object.entries(result.familyCounts).map(
    ([family, count]) => {
      const metadata = result.familyMetadata?.[family];
      return {
        family,
        count,
        label: metadata?.label || family,
        kind: metadata?.kind || "protocol-context",
      };
    },
  );
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Boxes className="h-5 w-5 text-primary-active" aria-hidden="true" />
            Observed families
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Counts are line-level name matches; matched source text is hidden.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            downloadReport(buildPostQuantumInventoryReport(result))
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary-hover px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-active focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Counts-only JSON
        </button>
      </div>
      {families.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {families.map((family) => {
            const kind = KIND_META[family.kind];
            return (
              <article
                key={family.family}
                className="rounded-lg border border-border bg-surface-soft p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-foreground">
                      {family.label}
                    </h3>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-bold ${kind.className}`}
                    >
                      {kind.label}
                    </span>
                  </div>
                  <span className="rounded-lg bg-surface px-3 py-2 text-xl font-black text-foreground">
                    {family.count}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 flex gap-3 rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
          <ShieldQuestion
            className="h-5 w-5 shrink-0 text-primary-active"
            aria-hidden="true"
          />
          <p>
            No configured name was observed. Binary dependencies, runtime
            negotiation, generated configuration, and aliases remain outside
            this text pass.
          </p>
        </div>
      )}
    </section>
  );
}

export default function PostQuantumMigrationInventory() {
  const [input, setInput] = useState("");
  const computed = useMemo(() => {
    if (!input.trim()) return { result: null, error: "" };
    try {
      return { result: inventoryPostQuantumReferences(input), error: "" };
    } catch (error) {
      return {
        result: null,
        error:
          error instanceof Error
            ? error.message
            : "The pasted text could not be inventoried.",
      };
    }
  }, [input]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary-active">
                <Binary className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-active">
                Discovery aid · no crypto verification
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Post-Quantum Migration Inventory
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
              Scan pasted code, configuration, logs, or certificate metadata for
              observable RSA, elliptic-curve, DSA, Diffie-Hellman, TLS, and
              post-quantum names—then turn those references into migration
              discovery questions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-80">
            <div className="rounded-lg bg-surface-soft p-4">
              <FileSearch
                className="h-5 w-5 text-primary-active"
                aria-hidden="true"
              />
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Character cap
              </p>
              <p className="mt-1 text-lg font-black text-foreground">
                {PQ_INVENTORY_LIMITS.maxCharacters.toLocaleString("en-US")}
              </p>
            </div>
            <div className="rounded-lg bg-surface-soft p-4">
              <Network
                className="h-5 w-5 text-primary-active"
                aria-hidden="true"
              />
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Display cap
              </p>
              <p className="mt-1 text-lg font-black text-foreground">
                {PQ_INVENTORY_LIMITS.maxObservations.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileSearch
                  className="h-5 w-5 text-primary-active"
                  aria-hidden="true"
                />
                Code, config, or metadata
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Matching runs locally. Lines and source snippets are omitted
                from the counts-only export.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInput(SAMPLE_INPUT)}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-surface-soft focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                <Binary className="h-4 w-4" aria-hidden="true" />
                Load sample
              </button>
              <button
                type="button"
                disabled={!input}
                onClick={() => setInput("")}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-surface-soft focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>
          <label
            htmlFor="pq-inventory-input"
            className="mt-5 block text-sm font-bold text-foreground"
          >
            Paste text to inventory
          </label>
          <textarea
            id="pq-inventory-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={PQ_INVENTORY_LIMITS.maxCharacters}
            spellCheck={false}
            placeholder="Public Key Algorithm: rsaEncryption…"
            className="mt-2 h-96 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground shadow-inner outline-none transition focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>No system, certificate, or network access</span>
            <span>
              {input.length.toLocaleString("en-US")} /{" "}
              {PQ_INVENTORY_LIMITS.maxCharacters.toLocaleString("en-US")}
            </span>
          </div>
          {computed.error ? (
            <div
              className="mt-4 rounded-lg border border-danger bg-danger-soft p-4 text-sm font-semibold text-foreground"
              role="alert"
            >
              {computed.error}
            </div>
          ) : null}
        </section>

        <div className="space-y-6">
          {computed.result ? (
            <>
              <Summary result={computed.result} />
              <FamilyInventory result={computed.result} />
              <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <ListChecks
                    className="h-5 w-5 text-primary-active"
                    aria-hidden="true"
                  />
                  Migration discovery questions
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Answer with system owners and protocol specialists; the
                  scanner cannot infer these from names.
                </p>
                <ol className="mt-5 space-y-3">
                  {computed.result.questions.map((question, index) => (
                    <li
                      key={question.id}
                      className="flex gap-3 rounded-lg border border-border bg-surface-soft p-4"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-hover text-xs font-black text-primary-foreground">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground">
                        {question.question}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          ) : (
            <section className="rounded-lg border border-dashed border-border bg-surface p-8 text-center shadow-sm">
              <ScanSearch
                className="mx-auto h-10 w-10 text-primary-active"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-bold text-foreground">
                Start a cryptographic reference inventory
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Paste text or load the sample. Presence does not establish use,
                absence does not establish readiness, and the tool sets no
                migration deadline.
              </p>
            </section>
          )}

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <LockKeyhole
                className="h-5 w-5 text-primary-active"
                aria-hidden="true"
              />
              Scope and authoritative context
            </h2>
            <ul className="mt-4 space-y-3">
              {PQ_INVENTORY_LIMITATIONS.map((limitation) => (
                <li
                  key={limitation}
                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <Info
                    className="mt-1 h-4 w-4 shrink-0 text-primary-active"
                    aria-hidden="true"
                  />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="text-sm font-bold text-foreground">
                NIST and CISA primary references
              </h3>
              <div className="mt-3 grid gap-2">
                {SOURCES.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-surface-soft px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    <span>{source.title}</span>
                    <ExternalLink
                      className="h-4 w-4 shrink-0 text-primary-active"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
