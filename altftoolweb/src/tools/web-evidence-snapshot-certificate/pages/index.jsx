"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Download,
  FileImage,
  Fingerprint,
  Info,
  Link2,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildSnapshotCertificate,
  detectScreenshotMediaType,
  sha256Bytes,
  snapshotCertificateLimits,
} from "../lib/snapshotCertificate.mjs";

function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_024 ** 2) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_024 ** 2).toFixed(1)} MB`;
}

function currentIsoTime() {
  return new Date().toISOString().replace(/\.\d{3}Z$/u, "Z");
}

function downloadCertificate(content) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "web-snapshot-metadata-certificate.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-black text-foreground">{value}</dd>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{helper}</p>
    </div>
  );
}

export default function WebEvidenceSnapshotCertificate() {
  const fileInputRef = useRef(null);
  const operationGenerationRef = useRef(0);
  const operationBusyRef = useRef(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [observedAt, setObservedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [hashing, setHashing] = useState(false);
  const [building, setBuilding] = useState(false);
  const [copied, setCopied] = useState("");
  const [notice, setNotice] = useState(
    "Choose one local screenshot, then enter the metadata you personally observed.",
  );

  const canBuild = useMemo(
    () =>
      Boolean(
        screenshot &&
          sourceUrl.trim() &&
          title.trim() &&
          observedAt.trim() &&
          !hashing &&
          !building,
      ),
    [building, hashing, observedAt, screenshot, sourceUrl, title],
  );

  const invalidate = () => {
    setResult(null);
    setCopied("");
  };

  const updateField = (setter) => (event) => {
    setter(event.target.value);
    setErrors([]);
    invalidate();
  };

  const chooseScreenshot = async (file) => {
    if (operationBusyRef.current) return;
    setErrors([]);
    setResult(null);
    setCopied("");
    setScreenshot(null);
    if (!file) return;
    if (file.size <= 0 || file.size > snapshotCertificateLimits.maxFileBytes) {
      setErrors(["Choose a screenshot larger than 0 bytes and no more than 25 MB."]);
      return;
    }

    const operation = operationGenerationRef.current + 1;
    operationGenerationRef.current = operation;
    operationBusyRef.current = true;
    setHashing(true);
    setNotice("Reading and hashing the screenshot locally…");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (operationGenerationRef.current !== operation) return;
      const mediaType = detectScreenshotMediaType(bytes);
      if (!mediaType) {
        setErrors(["Choose a valid PNG, JPEG, or WebP screenshot."]);
        setNotice("The selected file signature was not a supported raster image.");
        return;
      }
      const sha256 = await sha256Bytes(bytes);
      if (operationGenerationRef.current !== operation) return;
      setScreenshot({
        filename: file.name,
        mediaType,
        sizeBytes: bytes.byteLength,
        sha256,
      });
      setNotice(
        "Screenshot hashed locally. Its pixels were not analyzed, previewed, or uploaded.",
      );
    } catch {
      if (operationGenerationRef.current !== operation) return;
      setErrors([
        "The browser could not read or hash this screenshot. Try a smaller supported image.",
      ]);
      setNotice("No screenshot record was created.");
    } finally {
      if (operationGenerationRef.current === operation) {
        operationBusyRef.current = false;
        setHashing(false);
      }
    }
  };

  const buildCertificate = async (event) => {
    event.preventDefault();
    if (!canBuild || operationBusyRef.current) return;
    const operation = operationGenerationRef.current + 1;
    operationGenerationRef.current = operation;
    operationBusyRef.current = true;
    setErrors([]);
    setBuilding(true);
    setCopied("");
    try {
      const nextResult = await buildSnapshotCertificate({
        sourceUrl,
        title,
        observedAt,
        notes,
        screenshot,
      });
      if (operationGenerationRef.current !== operation) return;
      if (!nextResult.ok) {
        setErrors(nextResult.errors);
        setResult(null);
        setNotice("Review the metadata fields and try again.");
        return;
      }
      setResult(nextResult);
      setNotice(
        "Deterministic metadata certificate created locally. Review its limits before sharing.",
      );
    } catch {
      if (operationGenerationRef.current !== operation) return;
      setErrors([
        "The browser could not create the certificate digest. Use a current secure browser.",
      ]);
      setResult(null);
      setNotice("No certificate was created.");
    } finally {
      if (operationGenerationRef.current === operation) {
        operationBusyRef.current = false;
        setBuilding(false);
      }
    }
  };

  const copyValue = async (value, key) => {
    const didCopy = await safeCopyText(value);
    setCopied(didCopy ? key : "");
    if (didCopy) {
      window.setTimeout(
        () => setCopied((current) => (current === key ? "" : current)),
        1_600,
      );
    }
  };

  const reset = () => {
    operationGenerationRef.current += 1;
    operationBusyRef.current = false;
    setSourceUrl("");
    setTitle("");
    setObservedAt("");
    setNotes("");
    setScreenshot(null);
    setResult(null);
    setErrors([]);
    setHashing(false);
    setBuilding(false);
    setCopied("");
    setNotice("Local inputs and generated certificate discarded from this page.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Fingerprint className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Local screenshot metadata record
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  Web Evidence Snapshot Certificate
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Create a deterministic JSON manifest that links your entered URL, title,
              observation time, and notes to the SHA-256 digest of one local screenshot.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-success">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              No upload · No URL fetch
            </p>
            <p className="mt-2 leading-relaxed">
              The screenshot is read only for hashing in this tab. The URL is stored as
              text and is never opened, requested, or checked.
            </p>
          </div>
        </div>
      </header>

      <section
        className="rounded-xl border border-warning bg-warning-soft p-4 text-foreground"
        aria-labelledby="certificate-boundary-title"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div>
            <h2 id="certificate-boundary-title" className="font-bold">
              A self-recorded manifest, not independent proof
            </h2>
            <p className="mt-1 text-sm leading-relaxed">
              This tool does not notarize, sign, authenticate, timestamp, or verify the
              screenshot or your metadata. It cannot prove capture time, depicted
              content, authorship, or legal admissibility.
            </p>
          </div>
        </div>
      </section>

      <form className="grid gap-6 lg:grid-cols-2" onSubmit={buildCertificate}>
        <div className="space-y-6">
          <section className="tool-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileImage className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  1. Choose the screenshot
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  PNG, JPEG, or WebP up to 25 MB. The file signature is checked before
                  SHA-256 hashing.
                </p>
              </div>
            </div>

            <label
              htmlFor="snapshot-file"
              className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-soft p-5 text-center transition hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            >
              {hashing ? (
                <LoaderCircle
                  className="h-8 w-8 animate-spin text-primary motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
              )}
              <span className="mt-3 max-w-full break-all font-bold text-foreground">
                {hashing
                  ? "Hashing locally…"
                  : screenshot
                    ? screenshot.filename
                    : "Choose a local screenshot"}
              </span>
              <span id="snapshot-file-help" className="mt-1 text-sm text-muted-foreground">
                {screenshot
                  ? `${formatBytes(screenshot.sizeBytes)} · ${screenshot.mediaType}`
                  : "The image is not previewed or embedded in the certificate."}
              </span>
              <input
                ref={fileInputRef}
                id="snapshot-file"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={hashing || building}
                aria-describedby="snapshot-file-help"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  event.target.value = "";
                  chooseScreenshot(file);
                }}
              />
            </label>

            {screenshot ? (
              <div className="mt-4 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                  <p className="font-bold text-foreground">Screenshot hash ready</p>
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  SHA-256 of exact file bytes
                </p>
                <code className="mt-1 block break-all text-sm text-foreground">
                  {screenshot.sha256}
                </code>
              </div>
            ) : null}
          </section>

          <section className="tool-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Link2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  2. Record what you observed
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  These fields are your statements. ALTFTool does not verify them.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-foreground">Source URL</span>
                <input
                  type="url"
                  inputMode="url"
                  value={sourceUrl}
                  maxLength={snapshotCertificateLimits.maxUrlCharacters}
                  onChange={updateField(setSourceUrl)}
                  placeholder="https://example.com/page"
                  className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={building}
                  required
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  The complete accepted URL is stored in and exported with the
                  manifest. Fragments, credentials, and likely secret query keys are
                  rejected; remove any personal data you do not intend to share.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-foreground">Page title observed</span>
                <input
                  value={title}
                  maxLength={snapshotCertificateLimits.maxTitleCharacters}
                  onChange={updateField(setTitle)}
                  placeholder="Title visible in the tab or page"
                  className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={building}
                  required
                />
              </label>

              <div>
                <label htmlFor="snapshot-observed-at" className="text-sm font-bold text-foreground">
                  Observation time with timezone
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="snapshot-observed-at"
                    value={observedAt}
                    onChange={updateField(setObservedAt)}
                    placeholder="2026-07-24T14:30:00+05:30"
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    aria-describedby="snapshot-observed-at-help"
                    disabled={building}
                    required
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={building}
                    onClick={() => {
                      setObservedAt(currentIsoTime());
                      setErrors([]);
                      invalidate();
                    }}
                  >
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    Use device time
                  </button>
                </div>
                <p
                  id="snapshot-observed-at-help"
                  className="mt-1 text-xs leading-relaxed text-muted-foreground"
                >
                  Use ISO 8601 with seconds and Z or an offset. Device time is still a
                  user-supplied clock reading, not a trusted timestamp.
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-bold text-foreground">Factual notes (optional)</span>
                <textarea
                  value={notes}
                  maxLength={snapshotCertificateLimits.maxNotesCharacters}
                  rows={6}
                  onChange={updateField(setNotes)}
                  placeholder="Describe only what is directly visible. Separate facts from assumptions."
                  className="mt-2 w-full resize-y rounded-lg border border-border bg-surface p-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={building}
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                  {[...notes].length.toLocaleString("en-US")} /{" "}
                  {snapshotCertificateLimits.maxNotesCharacters.toLocaleString("en-US")}
                </span>
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="tool-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  3. Create the metadata certificate
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Identical normalized inputs produce identical JSON and payload digest.
                </p>
              </div>
            </div>

            {errors.length ? (
              <div
                className="mt-5 rounded-xl border border-danger bg-danger-soft p-4"
                role="alert"
              >
                <p className="flex items-center gap-2 font-bold text-danger">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                  Review {errors.length === 1 ? "this issue" : "these issues"}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={!canBuild}>
                {building ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Fingerprint className="h-4 w-4" aria-hidden="true" />
                )}
                {building ? "Creating locally…" : "Create certificate"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={reset}
                disabled={
                  !hashing &&
                  !building &&
                  !sourceUrl &&
                  !title &&
                  !observedAt &&
                  !notes &&
                  !screenshot &&
                  !result
                }
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear local data
              </button>
            </div>

            <div
              className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="leading-relaxed">{notice}</p>
            </div>
          </section>

          {result ? (
            <>
              <section
                className="rounded-xl border border-success bg-success-soft p-5 sm:p-6"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-success">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-success">
                      Local manifest ready
                    </p>
                    <h2 className="mt-1 text-xl font-black text-foreground">
                      Deterministic metadata certificate
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      The payload hash binds these metadata fields together. It is not a
                      signature, notarization, or trusted timestamp.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Certificate payload SHA-256
                  </p>
                  <code className="mt-2 block break-all text-sm text-foreground">
                    {result.certificate.integrity.payloadSha256}
                  </code>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => downloadCertificate(result.serialized)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download JSON
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                      copyValue(
                        result.certificate.integrity.payloadSha256,
                        "digest",
                      )
                    }
                  >
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                    {copied === "digest" ? "Digest copied" : "Copy digest"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => copyValue(result.serialized, "manifest")}
                  >
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                    {copied === "manifest" ? "Manifest copied" : "Copy manifest"}
                  </button>
                </div>
              </section>

              <section className="tool-card p-5 sm:p-6">
                <h2 className="text-xl font-bold text-foreground">Recorded metadata</h2>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Source URL
                    </dt>
                    <dd className="mt-1 break-all text-sm font-semibold text-foreground">
                      {result.certificate.source.url}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Page title
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      {result.certificate.source.pageTitle}
                    </dd>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Declared observation
                      </dt>
                      <dd className="mt-1 break-all font-mono text-sm text-foreground">
                        {result.certificate.source.observedAtDeclared}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Normalized UTC
                      </dt>
                      <dd className="mt-1 break-all font-mono text-sm text-foreground">
                        {result.certificate.source.observedAtUtc}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Screenshot
                    </dt>
                    <dd className="mt-1 break-all text-sm text-foreground">
                      {result.certificate.screenshot.filename} ·{" "}
                      {formatBytes(result.certificate.screenshot.sizeBytes)} ·{" "}
                      {result.certificate.screenshot.mediaTypeLabel}
                    </dd>
                  </div>
                </dl>

                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                  <StatCard
                    label="Screenshots"
                    value={result.certificate.counts.screenshotFiles}
                    helper="Exact local files recorded"
                  />
                  <StatCard
                    label="Metadata fields"
                    value={result.certificate.counts.metadataFieldsPresent}
                    helper="Populated normalized values"
                  />
                  <StatCard
                    label="Note characters"
                    value={result.certificate.counts.noteCharacters}
                    helper="User-entered factual notes"
                  />
                </dl>
              </section>
            </>
          ) : (
            <section className="tool-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="font-bold text-foreground">What the JSON contains</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li>• Normalized URL, title, observation time, and your notes.</li>
                    <li>• Filename, raster media type, byte size, and screenshot SHA-256.</li>
                    <li>• Deterministic counts, processing flags, and fixed limitations.</li>
                    <li>• A SHA-256 digest of the canonical metadata payload.</li>
                    <li>• No screenshot pixels, preview, live-page content, or fetched data.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-surface-soft p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-bold text-foreground">Interpret the hashes correctly</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    • Screenshot SHA-256 changes when the exact file bytes change.
                  </li>
                  <li>
                    • Payload SHA-256 changes when any normalized certificate metadata
                    changes.
                  </li>
                  <li>
                    • Neither hash verifies the truth of the screenshot or metadata.
                  </li>
                  <li>
                    • Preserve the original file and document your handling process
                    separately.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </form>
    </main>
  );
}
