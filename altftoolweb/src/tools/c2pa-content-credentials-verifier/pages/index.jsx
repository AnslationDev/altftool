"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Binary,
  Box,
  CheckCircle2,
  Download,
  ExternalLink,
  FileSearch,
  FileUp,
  Fingerprint,
  Info,
  Layers3,
  ListChecks,
  LockKeyhole,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  Signature,
} from "lucide-react";

import {
  C2PA_STRUCTURE_LIMITATIONS,
  C2PA_STRUCTURE_LIMITS,
  buildC2paStructureReport,
  inspectC2paStructureBytes,
  validateC2paStructureFile,
} from "../lib/c2paStructure.mjs";

const SOURCES = [
  {
    title:
      "C2PA Technical Specification 2.4 — manifests, validation, trust, and format embedding",
    href: "https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html",
  },
  {
    title:
      "Content Authenticity Initiative — official c2pa-web browser SDK documentation",
    href: "https://opensource.contentauthenticity.org/docs/c2pa-js/packages/c2pa-web/",
  },
  {
    title:
      "Content Authenticity Initiative — maintained c2pa-js SDK repository",
    href: "https://github.com/contentauth/c2pa-js",
  },
];

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
  anchor.download = "c2pa-structure-counts.json";
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

function Presence({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold text-foreground">{value}</dd>
    </div>
  );
}

function StoreCard({ index, store }) {
  const readable = store.structurallyReadable;
  return (
    <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Candidate store {index + 1}
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">
            {store.source}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatBytes(store.byteLength)} declared JUMBF store ·{" "}
            {store.boxesInspected} bounded boxes inspected
          </p>
        </div>
        <span
          className={
            readable
              ? "inline-flex items-center gap-2 rounded-full border border-info bg-info-soft px-3 py-1 text-xs font-bold text-info"
              : "inline-flex items-center gap-2 rounded-full border border-warning bg-warning-soft px-3 py-1 text-xs font-bold text-warning"
          }
        >
          {readable ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          )}
          {readable ? "Structure readable" : "Review structure"}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Presence
          label="Manifest boxes"
          value={
            store.standardManifests +
            store.legacyStandardManifests +
            store.updateManifests
          }
        />
        <Presence label="Assertion stores" value={store.assertionStores} />
        <Presence label="Claim boxes" value={store.claimBoxes} />
        <Presence label="Claim-signature boxes" value={store.signatureBoxes} />
      </dl>

      <div className="mt-4 rounded-lg border border-warning bg-warning-soft p-3 text-sm leading-relaxed text-warning">
        <strong>Cryptographic verification not performed.</strong> These counts
        only describe observable box types and bounds. They do not authenticate
        any claim, assertion, signature, signer, or media bytes.
      </div>

      {store.issues.length ? (
        <div className="mt-4 rounded-lg border border-border bg-surface-soft p-4">
          <h4 className="font-bold text-foreground">
            Structural notes ({store.issueCount})
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
            {store.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function ContainerCounts({ result }) {
  if (result.format === "JPEG") {
    return (
      <>
        <Presence
          label="JPEG marker segments"
          value={result.container.markerSegments}
        />
        <Presence
          label="APP11 JUMBF fragments"
          value={result.container.app11JumbfSegments}
        />
        <Presence
          label="Image-data boundary reached"
          value={result.container.scanReachedImageData ? "Yes" : "No"}
        />
      </>
    );
  }
  if (result.format === "PNG") {
    return (
      <>
        <Presence label="PNG chunks" value={result.container.chunks} />
        <Presence label="caBX chunks" value={result.container.caBxChunks} />
        <Presence
          label="Chunk CRC verified"
          value={result.container.crcValidated ? "Yes" : "No"}
        />
      </>
    );
  }
  if (result.format === "BMFF") {
    return (
      <>
        <Presence label="Top-level boxes" value={result.container.boxes} />
        <Presence
          label="C2PA uuid boxes"
          value={result.container.c2paUuidBoxes}
        />
        <Presence
          label="Manifest/original/update"
          value={
            result.container.manifestPurposeBoxes +
            result.container.originalPurposeBoxes +
            result.container.updatePurposeBoxes
          }
        />
      </>
    );
  }
  return (
    <>
      <Presence
        label="Standalone candidates"
        value={result.container.candidateFiles}
      />
      <Presence
        label="Oversized candidates"
        value={result.container.oversizedCandidates}
      />
      <Presence label="Container issues" value={result.container.issueCount} />
    </>
  );
}

export default function C2paContentCredentialsStructureInspector() {
  const fileInputRef = useRef(null);
  const runTokenRef = useRef(0);
  const busyRef = useRef(false);
  const [selection, setSelection] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const report = useMemo(() => buildC2paStructureReport(result), [result]);

  function clear() {
    runTokenRef.current += 1;
    busyRef.current = false;
    setSelection(null);
    setResult(null);
    setError("");
    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function chooseFile(file) {
    if (!file || busyRef.current) return;
    runTokenRef.current += 1;
    const validation = validateC2paStructureFile(file);
    setResult(null);
    setError("");
    if (!validation.ok) {
      setSelection(null);
      setError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelection({ file, validation });
  }

  async function inspect() {
    if (!selection || busyRef.current) return;
    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    busyRef.current = true;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const bytes = new Uint8Array(await selection.file.arrayBuffer());
      if (runTokenRef.current !== token) return;
      const next = inspectC2paStructureBytes(bytes, {
        fileSize: selection.file.size,
        expectedGroup: selection.validation.expectedGroup,
      });
      if (runTokenRef.current !== token) return;
      if (!next.ok) {
        setError(next.error);
        return;
      }
      setResult(next);
    } catch {
      if (runTokenRef.current === token) {
        setError(
          "The selected file could not be inspected locally in this browser.",
        );
      }
    } finally {
      if (runTokenRef.current === token) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <FileSearch className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">
            C2PA Content Credentials Structure Inspector
          </h1>
          <p className="tool-description">
            Inspect bounded local JPEG, PNG, BMFF, and standalone JUMBF
            containers for observable C2PA box structure. This tool deliberately
            does not call a structural result “verified.”
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-warning bg-warning-soft p-4 text-warning">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-bold">
              Cryptographic verification is not performed
            </h2>
            <p className="mt-1 text-sm leading-relaxed">
              This inspector does not verify COSE signatures, asset-binding
              hashes, certificates, revocation, time stamps, signer identity, or
              any trust list. It cannot label a file authentic, tampered,
              trustworthy, fake, or AI-made.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <LockKeyhole
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-foreground">
              Local bytes only — no upload, network lookup, or storage
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              The file stays in this browser tab. The scanner does not render
              media, execute embedded content, retrieve external manifests, or
              include filenames and raw metadata in its counts-only export.
            </p>
          </div>
        </div>
      </section>

      <section className="tool-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label className="text-sm font-bold text-foreground">
              Local media or manifest
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
                  {selection
                    ? selection.file.name
                    : "Choose a supported local file"}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {selection
                    ? `${formatBytes(selection.file.size)} · ready for bounded inspection`
                    : `JPEG, PNG, MP4, M4A, MOV, AVIF, HEIC, HEIF, or C2PA · maximum ${C2PA_STRUCTURE_LIMITS.fileBytes / (1024 * 1024)} MB`}
                </span>
              </span>
            </button>
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept=".jpg,.jpeg,.png,.mp4,.m4a,.mov,.avif,.heic,.heif,.c2pa,image/jpeg,image/png,video/mp4,audio/mp4,video/quicktime,image/avif,image/heic,image/heif,application/c2pa"
              aria-label="Choose a local file for C2PA container structure inspection"
              disabled={busy}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={!selection || busy}
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
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          <section className="tool-card p-5 sm:p-6" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <Binary className="h-5 w-5 text-primary" aria-hidden="true" />
                  Observable structure summary
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.format} signature · {formatBytes(result.byteLength)}{" "}
                  inspected locally · raw manifest and assertion values not
                  displayed
                </p>
              </div>
              {report ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadReport(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export counts only
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                icon={Box}
                label="Store candidates"
                value={result.summary.manifestStoreCandidates}
                detail="Recognizable C2PA Manifest Store root boxes."
              />
              <Metric
                icon={Layers3}
                label="Manifest boxes"
                value={result.summary.manifestBoxes}
                detail="Standard, legacy-standard, or update UUID shapes."
              />
              <Metric
                icon={Signature}
                label="Signature boxes"
                value={result.summary.signatureBoxes}
                detail="Claim-signature containers observed; signature math not checked."
              />
              <Metric
                icon={AlertTriangle}
                label="Structure notes"
                value={result.summary.structuralIssues}
                detail="Bound, order, label-shape, or completeness notes."
              />
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ContainerCounts result={result} />
            </dl>

            <div className="mt-5 rounded-lg border border-warning bg-warning-soft p-4 text-warning">
              <p className="font-bold">
                Result scope: container structure only — not verification
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                Cryptographic signature: not verified · asset binding: not
                verified · trust list: not evaluated · signer and history: not
                authenticated.
              </p>
            </div>
          </section>

          {result.containerIssues.length ? (
            <section className="rounded-lg border border-info bg-info-soft p-4 text-info">
              <h2 className="flex items-center gap-2 font-bold">
                <Info className="h-5 w-5" aria-hidden="true" />
                Container notes ({result.container.issueCount})
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {result.containerIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.stores.length ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Candidate Manifest Store structures
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Known UUID and label shapes are counted only inside a
                  recognizable C2PA Manifest Store root. Unknown JUMBF types are
                  skipped.
                </p>
              </div>
              {result.stores.map((store, index) => (
                <StoreCard
                  key={`${store.source}-${index}`}
                  index={index}
                  store={store}
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
                No readable embedded C2PA Manifest Store observed
              </h2>
              <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                This does not mean the file is fake, suspicious, or altered.
                Credentials may never have been added, may have been removed by
                normal processing, may live in a sidecar or remote location, or
                may use an unsupported or malformed embedding.
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-sm font-semibold text-warning">
                Cryptographic verification was not performed.
              </p>
            </section>
          )}
        </>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="tool-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
            What this inspector observes
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>JPEG APP11 JUMBF fragment sequence and declared box bounds.</li>
            <li>
              PNG caBX chunks and top-level BMFF C2PA uuid purpose/order shapes.
            </li>
            <li>
              A C2PA Manifest Store root plus observable manifest, assertion
              store, claim, claim-signature, CBOR, and compressed-content box
              counts.
            </li>
          </ul>
        </article>

        <article className="tool-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Fingerprint className="h-5 w-5 text-primary" aria-hidden="true" />
            What remains unverified
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>COSE signature math and authenticated claim payload.</li>
            <li>
              Media hard binding, assertion hashes, ingredient lineage, and
              timestamps.
            </li>
            <li>
              Certificate chain, revocation, trust-list status, signer identity,
              authorship, edit history, truthfulness, and AI use.
            </li>
          </ul>
        </article>
      </section>

      <section className="tool-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
          Method limits
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {C2PA_STRUCTURE_LIMITATIONS.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </section>

      <section className="tool-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">
          Official technical references
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Official C2PA and Content Authenticity Initiative sources accessed 24
          July 2026. The maintained official browser SDK is documented here but
          is not bundled or invoked by this structure-only tool.
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
