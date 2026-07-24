"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Binary,
  CheckCircle2,
  Download,
  ExternalLink,
  FileKey2,
  FileSearch,
  FileUp,
  Fingerprint,
  Info,
  ListChecks,
  LockKeyhole,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import {
  PDF_SIGNATURE_LIMITATIONS,
  PDF_SIGNATURE_LIMITS,
  buildSignatureStructureReport,
  inspectPdfSignatureBytes,
  validatePdfSignatureFile,
} from "../lib/pdfSignatureStructure.mjs";

const SOURCES = [
  {
    title:
      "PDF Association — ISO 32000-2 errata, clause 12.8 Digital signatures",
    href: "https://pdf-issues.pdfa.org/32000-2-2020/clause12.html",
  },
  {
    title:
      "Adobe Acrobat SDK — Digital signature plug-in workflow and ByteRange constraints",
    href: "https://opensource.adobe.com/dc-acrobat-sdk-docs/library/plugin/Plugins_ExtendedAPI.html",
  },
  {
    title: "PDF/A Competence Center — Digital Signatures in PDF/A-1",
    href: "https://pdfa.org/wp-content/uploads/2011/08/tn0006_digital_signatures_in_pdfa-1_2008-03-141.pdf",
  },
];

const STATUS_META = {
  consistent: {
    label: "Range structure consistent",
    icon: CheckCircle2,
    className: "border-success bg-success-soft text-success",
  },
  review: {
    label: "Review structure",
    icon: AlertTriangle,
    className: "border-warning bg-warning-soft text-warning",
  },
  invalid: {
    label: "Structural issue found",
    icon: XCircle,
    className: "border-danger bg-danger-soft text-danger",
  },
};

function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pdf-signature-structure-report.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Metric({ detail, icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {detail}
          </p>
        </div>
      </div>
    </article>
  );
}

function Presence({ label, present }) {
  return (
    <span
      className={
        present
          ? "rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-info"
          : "rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {label}: {present ? "present" : "not observed"}
    </span>
  );
}

function SignatureCard({ signature }) {
  const status = STATUS_META[signature.structureStatus] || STATUS_META.review;
  const StatusIcon = status.icon;
  const coverageLabel = signature.byteRange.reachesCurrentFileEnd
    ? "Ranges reach the current file end"
    : Number(signature.byteRange.trailingBytes) > 0
      ? `${formatBytes(signature.byteRange.trailingBytes)} follow the covered revision`
      : "Current-file coverage could not be established";

  return (
    <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Candidate signature {signature.ordinal}
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">
            Dictionary at byte{" "}
            {signature.dictionaryOffset.toLocaleString("en-US")}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
        >
          <StatusIcon className="h-4 w-4" aria-hidden="true" />
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-surface-soft p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Range pairs
          </p>
          <p className="mt-1 font-bold text-foreground">
            {signature.byteRange.pairCount}
          </p>
        </div>
        <div className="rounded-lg bg-surface-soft p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Signed bytes selected
          </p>
          <p className="mt-1 font-bold text-foreground">
            {formatBytes(signature.byteRange.signedBytes)}
          </p>
        </div>
        <div className="rounded-lg bg-surface-soft p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contents size
          </p>
          <p className="mt-1 font-bold text-foreground">
            {formatBytes(signature.contentsBytes)}
          </p>
        </div>
        <div className="rounded-lg bg-surface-soft p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Coverage
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {coverageLabel}
          </p>
        </div>
      </div>

      {signature.byteRange.ranges.length ? (
        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              ByteRange offset and length pairs for candidate signature{" "}
              {signature.ordinal}
            </caption>
            <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Pair
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Offset
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Length
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold">
                  Exclusive end
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {signature.byteRange.ranges.map((range, index) => (
                <tr key={`${range.offset}-${range.length}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">
                    {range.offset.toLocaleString("en-US")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">
                    {range.length.toLocaleString("en-US")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">
                    {range.end.toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-5">
        <h4 className="text-sm font-bold text-foreground">
          Optional metadata fields — presence only
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Values are neither displayed nor exported.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Presence
            label="SubFilter"
            present={signature.metadataPresence.subFilter}
          />
          <Presence label="Name" present={signature.metadataPresence.name} />
          <Presence
            label="Reason"
            present={signature.metadataPresence.reason}
          />
          <Presence
            label="Location"
            present={signature.metadataPresence.location}
          />
          <Presence
            label="Signing date"
            present={signature.metadataPresence.signingDate}
          />
        </div>
      </div>

      {signature.signedRangeSha256 ? (
        <div className="mt-5 rounded-lg border border-border bg-surface-soft p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Fingerprint className="h-4 w-4 text-primary" aria-hidden="true" />
            SHA-256 of concatenated ByteRange bytes
          </p>
          <code className="mt-2 block select-all break-all text-xs leading-5 text-foreground">
            {signature.signedRangeSha256}
          </code>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            This reproducibly identifies the selected local bytes. It is not the
            signed digest inside CMS and does not authenticate the document.
          </p>
        </div>
      ) : null}

      {signature.issues.length ? (
        <div className="mt-5 rounded-lg border border-danger bg-danger-soft p-4 text-danger">
          <p className="flex items-center gap-2 text-sm font-bold">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Structural issues
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {signature.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {signature.warnings.length ? (
        <div className="mt-4 rounded-lg border border-warning bg-warning-soft p-4 text-warning">
          <p className="flex items-center gap-2 text-sm font-bold">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Review notes
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {signature.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 rounded-lg border border-info bg-info-soft p-3 text-xs leading-5 text-info">
        CMS validity, signer identity, certificate trust and revocation,
        timestamp authority, and tamper-free status are all not verified.
      </p>
    </article>
  );
}

export default function PdfDigitalSignatureValidator() {
  const fileInputRef = useRef(null);
  const generationRef = useRef(0);
  const busyRef = useRef(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const report = useMemo(() => buildSignatureStructureReport(result), [result]);

  function clear() {
    generationRef.current += 1;
    busyRef.current = false;
    setFile(null);
    setResult(null);
    setError("");
    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function chooseFile(nextFile) {
    if (!nextFile || busyRef.current) return;
    generationRef.current += 1;
    const validation = validatePdfSignatureFile(nextFile);
    setResult(null);
    setError("");
    if (!validation.ok) {
      setFile(null);
      setError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(nextFile);
  }

  async function inspect() {
    if (!file || busyRef.current) return;
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const next = await inspectPdfSignatureBytes(bytes, {
        fileSize: file.size,
      });
      if (generation !== generationRef.current) return;
      if (!next.ok) {
        setError(next.error);
        return;
      }
      setResult(next);
    } catch {
      if (generation === generationRef.current) {
        setError("The PDF could not be inspected locally in this browser.");
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <FileKey2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">PDF Digital Signature Validator</h1>
          <p className="tool-description">
            Inspect local PDF signature dictionaries, validate ByteRange
            structure, and fingerprint the exact selected bytes without
            overstating cryptographic trust.
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <LockKeyhole
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-foreground">
              Local bytes only — nothing is uploaded or executed
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              The PDF stays in this tab. The bounded scanner reads lexical
              markers and hashes selected bytes; it does not render pages, open
              links, run JavaScript, or store document data.
            </p>
          </div>
        </div>
      </section>

      <section className="tool-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label className="text-sm font-bold text-foreground">
              PDF document
            </label>
            <button
              type="button"
              className="mt-2 flex min-h-28 w-full items-center gap-4 rounded-lg border border-dashed border-border-strong bg-surface-soft p-4 text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="rounded-lg bg-primary-soft p-3 text-primary">
                <FileUp className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold text-foreground">
                  {file ? file.name : "Choose a PDF"}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {file
                    ? `${formatBytes(file.size)} • ready for local inspection`
                    : `Maximum ${PDF_SIGNATURE_LIMITS.fileBytes / (1024 * 1024)} MB`}
                </span>
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              aria-label="Choose PDF for digital signature structure inspection"
              disabled={busy}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={!file || busy}
              onClick={inspect}
            >
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              {busy ? "Inspecting…" : "Inspect structure"}
            </button>
            <button type="button" className="btn-secondary" onClick={clear}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div
          className="rounded-lg border border-danger bg-danger-soft p-4 text-danger"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          <section className="tool-card p-5 sm:p-6" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <FileSearch
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Structural inspection summary
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {formatBytes(result.byteLength)} inspected •{" "}
                  {result.scan.skippedRecognizableStreams} recognizable stream
                  {result.scan.skippedRecognizableStreams === 1 ? "" : "s"}{" "}
                  skipped • scan{" "}
                  {result.scan.complete
                    ? "completed within limits"
                    : "was bounded"}
                </p>
              </div>
              {report ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadReport(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export privacy-safe report
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                icon={FileKey2}
                label="Candidates"
                value={result.summary.signatureDictionaries}
                detail="Bounded signature dictionaries inspected."
              />
              <Metric
                icon={CheckCircle2}
                label="Range-consistent"
                value={result.summary.structurallyConsistent}
                detail="Structural result only; CMS is not verified."
              />
              <Metric
                icon={ShieldAlert}
                label="Issues"
                value={result.summary.structurallyInvalid}
                detail="Candidate dictionaries with structural errors."
              />
              <Metric
                icon={Binary}
                label="Prior revisions"
                value={result.summary.priorRevisionCoverage}
                detail="Covered revisions followed by later bytes."
              />
            </div>

            <div className="mt-5 rounded-lg border border-warning bg-warning-soft p-4 text-warning">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold">
                    Cryptographic validity is not verified
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">
                    A structurally consistent ByteRange can still accompany an
                    invalid, untrusted, expired, revoked, forged, or unrelated
                    CMS value. Confirm signatures in a maintained PDF validator
                    with an appropriate trust policy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {result.warnings.length ? (
            <section className="rounded-lg border border-info bg-info-soft p-4 text-info">
              <h2 className="flex items-center gap-2 font-bold">
                <Info className="h-5 w-5" aria-hidden="true" />
                Scan notes
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.signatures.length ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Candidate signature dictionaries
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Earlier signatures commonly cover an earlier incremental PDF
                  revision; trailing bytes are reported separately.
                </p>
              </div>
              {result.signatures.map((signature) => (
                <SignatureCard
                  key={`${signature.dictionaryOffset}-${signature.ordinal}`}
                  signature={signature}
                />
              ))}
            </section>
          ) : (
            <section className="tool-card p-6 text-center">
              <FileSearch
                className="mx-auto h-10 w-10 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-lg font-bold text-foreground">
                No inspectable signature dictionary observed
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                This does not prove that the PDF has no signature-related data.
                Encrypted, compressed, malformed, or unusual structures may be
                outside this bounded lexical scanner.
              </p>
            </section>
          )}
        </>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="tool-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
            What this check establishes
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              ByteRange values are direct non-negative integers, ordered,
              non-overlapping, in bounds, and leave one exact Contents gap.
            </li>
            <li>
              The covered revision end, later trailing bytes, recognizable %%EOF
              boundary, Contents hex size, and optional metadata-field presence
              are reported.
            </li>
            <li>
              SHA-256 is computed over the exact concatenated ranges when the
              structure and local hashing budget permit it.
            </li>
          </ul>
        </article>

        <article className="tool-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
            What remains unverified
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              CMS/PKCS#7 parsing, signature math, and authenticated digest.
            </li>
            <li>
              Signer identity, certificate chain, intended trust anchors,
              expiry, revocation, and key compromise.
            </li>
            <li>
              Timestamp authority, permitted post-signing changes, visual
              appearance, semantic meaning, and tamper-free status.
            </li>
          </ul>
        </article>
      </section>

      <section className="tool-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          Method limits
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {PDF_SIGNATURE_LIMITATIONS.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </section>

      <section className="tool-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">
          Technical references
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Official and industry sources accessed 24 July 2026.
        </p>
        <ul className="mt-4 space-y-3">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                href={source.href}
                target="_blank"
                rel="noreferrer"
              >
                {source.title}
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
