"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  FileCheck2,
  FileJson2,
  Files,
  Fingerprint,
  FolderOpen,
  HardDrive,
  Info,
  ListChecks,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  Upload,
  XCircle,
} from "lucide-react";

import {
  buildCountsOnlySummary,
  buildManifest,
  compareManifests,
  FILE_LIMITS,
  findDuplicateDigestGroups,
  hashFileSha256,
  LIMITATIONS,
  parseManifestText,
  prepareFileSelection,
} from "../lib/fileManifest.mjs";

const STATUS_META = {
  "digest-match": {
    label: "Digest matches",
    className: "bg-success-soft text-success",
  },
  "digest-different": {
    label: "Digest differs",
    className: "bg-danger-soft text-danger",
  },
  "current-only": {
    label: "Current only",
    className: "bg-info-soft text-info",
  },
  "baseline-only": {
    label: "Baseline only",
    className: "bg-warning-soft text-warning",
  },
};

function formatBytes(bytes) {
  const value = Math.max(0, Number(bytes) || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${(value / 1024 ** 3).toFixed(1)} GB`;
}

function formatModified(value) {
  if (!Number.isSafeInteger(value) || value < 0) return "Unavailable";
  return new Date(value).toLocaleString();
}

function downloadJson(filename, value) {
  const objectUrl = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function MetricCard({ detail, icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function FileRow({ entry }) {
  return (
    <article className="rounded-lg border border-border bg-surface-soft p-4">
      <div className="flex items-start gap-3">
        <FileCheck2
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
        />
        <div className="min-w-0 flex-1">
          <h3 className="break-all font-semibold text-foreground">
            {entry.relativeName}
          </h3>
          <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
            <div>
              <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                Size
              </dt>
              <dd className="mt-1 text-foreground">
                {formatBytes(entry.sizeBytes)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                Media type
              </dt>
              <dd className="mt-1 break-all text-foreground">
                {entry.mediaType}
              </dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-muted-foreground">
                Last modified
              </dt>
              <dd className="mt-1 text-foreground">
                {formatModified(entry.lastModified)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            SHA-256
          </p>
          <code className="mt-1 block select-all break-all text-xs leading-5 text-foreground">
            {entry.sha256}
          </code>
        </div>
      </div>
    </article>
  );
}

export default function FileIntegrityManifestBuilder() {
  const filesInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const baselineInputRef = useRef(null);
  const runTokenRef = useRef(0);
  const [selection, setSelection] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [selectionErrors, setSelectionErrors] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [baselineName, setBaselineName] = useState("");
  const [baselineErrors, setBaselineErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [buildError, setBuildError] = useState("");

  const duplicateGroups = useMemo(
    () => (manifest ? findDuplicateDigestGroups(manifest.files) : []),
    [manifest],
  );
  const comparison = useMemo(
    () => (manifest && baseline ? compareManifests(manifest, baseline) : null),
    [manifest, baseline],
  );
  const countsOnlySummary = useMemo(
    () =>
      manifest
        ? buildCountsOnlySummary(manifest, comparison)
        : null,
    [manifest, comparison],
  );

  function chooseFiles(fileList) {
    runTokenRef.current += 1;
    const prepared = prepareFileSelection(fileList);
    setManifest(null);
    setBuildError("");
    setProgress({ current: 0, total: 0 });
    if (!prepared.ok) {
      setSelection(null);
      setSelectionErrors(prepared.errors);
      return;
    }
    setSelection(prepared);
    setSelectionErrors([]);
  }

  async function hashSelection() {
    if (!selection?.ok || busy) return;
    const runToken = runTokenRef.current + 1;
    runTokenRef.current = runToken;
    setBusy(true);
    setManifest(null);
    setBuildError("");
    setProgress({ current: 0, total: selection.files.length });

    try {
      const hashedEntries = [];
      for (let index = 0; index < selection.files.length; index += 1) {
        const descriptor = selection.files[index];
        const sha256 = await hashFileSha256(descriptor.file);
        if (runTokenRef.current !== runToken) return;
        hashedEntries.push({
          relativeName: descriptor.relativeName,
          sizeBytes: descriptor.sizeBytes,
          mediaType: descriptor.mediaType,
          lastModified: descriptor.lastModified,
          sha256,
        });
        setProgress({ current: index + 1, total: selection.files.length });
      }
      setManifest(buildManifest(hashedEntries));
    } catch {
      setBuildError(
        "The selected set could not be hashed in this browser. Try fewer or smaller files in a current browser.",
      );
    } finally {
      if (runTokenRef.current === runToken) setBusy(false);
    }
  }

  async function importBaseline(file) {
    setBaseline(null);
    setBaselineName("");
    setBaselineErrors([]);
    if (!file) return;
    if (file.size > FILE_LIMITS.maxManifestBytes) {
      setBaselineErrors(["The imported manifest exceeds the size limit."]);
      return;
    }
    try {
      const parsed = parseManifestText(await file.text());
      if (!parsed.ok) {
        setBaselineErrors(parsed.errors);
        return;
      }
      setBaseline(parsed.manifest);
      setBaselineName(file.name);
    } catch {
      setBaselineErrors(["The selected manifest could not be read in this browser."]);
    }
  }

  function clearSession() {
    runTokenRef.current += 1;
    setSelection(null);
    setManifest(null);
    setSelectionErrors([]);
    setBaseline(null);
    setBaselineName("");
    setBaselineErrors([]);
    setBusy(false);
    setProgress({ current: 0, total: 0 });
    setBuildError("");
    if (filesInputRef.current) filesInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
    if (baselineInputRef.current) baselineInputRef.current.value = "";
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Fingerprint aria-hidden="true" className="h-4 w-4" />
              Local SHA-256 manifest
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              File Integrity Manifest Builder
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
              Hash a bounded file set, preserve deterministic relative-name order,
              compare it with an earlier manifest, and reveal repeated digests.
              File bytes stay in this browser tab.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <LockKeyhole aria-hidden="true" className="h-4 w-4 text-primary" />
              No upload · No storage
            </p>
            <p className="mt-1 text-muted-foreground">
              No network requests or file-content export
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 rounded-xl border border-warning bg-warning-soft p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface text-warning">
            <ShieldAlert aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              A hash comparison is not a trust decision
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Matching SHA-256 values indicate that the compared byte sequences
              match under this check. They do not establish who created a file, its
              source, safety, meaning, or trustworthiness. This manifest is not a
              digital signature.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Files aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Choose the current file set
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Folder selection preserves browser-provided relative paths. Individual
                files use their file names as relative names.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <input
              ref={filesInputRef}
              type="file"
              multiple
              className="sr-only"
              aria-label="Choose local files for the integrity manifest"
              onChange={(event) => {
                chooseFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={() => filesInputRef.current?.click()}
              disabled={busy}
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              Choose files
            </button>
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple=""
              className="sr-only"
              aria-label="Choose a local folder for the integrity manifest"
              onChange={(event) => {
                chooseFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={() => folderInputRef.current?.click()}
              disabled={busy}
            >
              <FolderOpen aria-hidden="true" className="h-4 w-4" />
              Choose folder
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Up to {FILE_LIMITS.maxFiles} files, {formatBytes(FILE_LIMITS.maxFileBytes)}{" "}
            per file, and {formatBytes(FILE_LIMITS.maxTotalBytes)} combined. A new
            selection replaces the current one.
          </p>

          {selectionErrors.length ? (
            <div
              className="mt-4 rounded-lg border border-danger bg-danger-soft p-4"
              role="alert"
            >
              <p className="font-semibold text-danger">Selection not accepted</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {selectionErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {selection?.ok ? (
            <div className="mt-5 rounded-lg border border-border bg-surface-soft p-4">
              <p className="font-semibold text-foreground">
                {selection.counts.files} files ready ·{" "}
                {formatBytes(selection.counts.totalBytes)}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Files are already ordered by normalized relative name. Hashing begins
                only when you choose Build manifest.
              </p>
              <div className="mt-3 max-h-48 space-y-1 overflow-y-auto">
                {selection.files.map((item) => (
                  <p
                    key={item.relativeName}
                    className="break-all font-mono text-xs leading-5 text-foreground"
                  >
                    {item.relativeName}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <FileJson2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Optional earlier manifest
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Import a JSON manifest previously created by this tool. Comparison
                uses normalized relative names, then separates digest and metadata
                differences.
              </p>
            </div>
          </div>

          <input
            ref={baselineInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label="Import an earlier integrity manifest JSON file"
            onChange={(event) => {
              void importBaseline(event.target.files?.[0] || null);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn-secondary mt-5 inline-flex min-h-11 items-center justify-center gap-2"
            onClick={() => baselineInputRef.current?.click()}
            disabled={busy}
          >
            <Archive aria-hidden="true" className="h-4 w-4" />
            Import manifest
          </button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            JSON only, up to {formatBytes(FILE_LIMITS.maxManifestBytes)}. The imported
            file stays in this tab.
          </p>

          {baselineErrors.length ? (
            <div
              className="mt-4 rounded-lg border border-danger bg-danger-soft p-4"
              role="alert"
            >
              <p className="font-semibold text-danger">Manifest not accepted</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {baselineErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {baseline ? (
            <div className="mt-5 rounded-lg border border-success bg-success-soft p-4">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <CheckCircle2
                  aria-hidden="true"
                  className="h-5 w-5 text-success"
                />
                Earlier manifest loaded
              </p>
              <p className="mt-2 break-all text-sm text-foreground">
                {baselineName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {baseline.counts.files} entries ·{" "}
                {formatBytes(baseline.counts.totalBytes)}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-border p-5 text-center">
              <Info
                aria-hidden="true"
                className="mx-auto h-6 w-6 text-muted-foreground"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Comparison is optional. You can build and export a current manifest
                without one.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Build locally in deterministic order
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Files are read sequentially to limit memory pressure. Keep this tab open
              while hashing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={() => void hashSelection()}
              disabled={!selection?.ok || busy}
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Fingerprint aria-hidden="true" className="h-4 w-4" />
              )}
              {busy ? "Hashing locally…" : "Build manifest"}
            </button>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={clearSession}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear session
            </button>
          </div>
        </div>

        {busy ? (
          <div className="mt-4" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-foreground">
                File {progress.current} of {progress.total}
              </span>
              <span className="text-muted-foreground">
                {progress.total
                  ? Math.round((progress.current / progress.total) * 100)
                  : 0}
                %
              </span>
            </div>
            <progress
              className="mt-2 h-2 w-full accent-primary"
              max={progress.total || 1}
              value={progress.current}
            />
          </div>
        ) : null}

        {buildError ? (
          <p
            className="mt-4 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
            role="alert"
          >
            {buildError}
          </p>
        ) : null}
      </section>

      {manifest ? (
        <>
          <section className="mt-6" aria-labelledby="manifest-heading">
            <div className="rounded-xl border border-success bg-success-soft p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-6 w-6 shrink-0 text-success"
                />
                <div>
                  <h2 id="manifest-heading" className="text-2xl font-bold text-foreground">
                    Manifest ready in this tab
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    The JSON contains relative names, sizes, media types,
                    last-modified values, and SHA-256 digests. It does not contain
                    file bytes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={Files}
                label="Files"
                value={manifest.counts.files}
                detail="Deterministically ordered entries."
              />
              <MetricCard
                icon={HardDrive}
                label="Total size"
                value={formatBytes(manifest.counts.totalBytes)}
                detail="Sum of browser-reported byte sizes."
              />
              <MetricCard
                icon={Fingerprint}
                label="Repeated digests"
                value={duplicateGroups.length}
                detail="Groups with the same SHA-256 value."
              />
              <MetricCard
                icon={FileJson2}
                label="Comparison"
                value={comparison ? "Ready" : "Not loaded"}
                detail="Requires an earlier compatible manifest."
              />
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <ListChecks aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Ordered file entries
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Metadata may change even when a digest matches.
                  </p>
                </div>
              </div>
              <div className="mt-5 max-h-screen space-y-3 overflow-y-auto">
                {manifest.files.map((entry) => (
                  <FileRow key={entry.relativeName} entry={entry} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Fingerprint aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Duplicate digest visibility
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Same-digest files have matching bytes under this check. That does
                    not prove common origin or make either file safe to delete.
                  </p>
                </div>
              </div>

              {duplicateGroups.length ? (
                <div className="mt-5 space-y-4">
                  {duplicateGroups.map((group) => (
                    <article
                      key={group.sha256}
                      className="rounded-lg border border-border bg-surface-soft p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.files.length} files · SHA-256
                      </p>
                      <code className="mt-2 block select-all break-all text-xs leading-5 text-foreground">
                        {group.sha256}
                      </code>
                      <ul className="mt-3 space-y-2">
                        {group.files.map((file) => (
                          <li
                            key={file.relativeName}
                            className="break-all text-sm text-foreground"
                          >
                            {file.relativeName}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-border p-6 text-center">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mx-auto h-7 w-7 text-muted-foreground"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No SHA-256 value is repeated within this selected set.
                  </p>
                </div>
              )}
            </section>
          </div>

          {comparison ? (
            <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Archive aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Earlier-manifest comparison
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    “Digest matches” means the recorded SHA-256 values match for the
                    same relative name. It is not a safety or trust statement.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  icon={CheckCircle2}
                  label="Digest matches"
                  value={comparison.counts.digestMatches}
                  detail="Same name and same digest."
                />
                <MetricCard
                  icon={XCircle}
                  label="Digest differs"
                  value={comparison.counts.digestDifferences}
                  detail="Same name, different digest."
                />
                <MetricCard
                  icon={Files}
                  label="Current only"
                  value={comparison.counts.currentOnly}
                  detail="Name absent from baseline."
                />
                <MetricCard
                  icon={Archive}
                  label="Baseline only"
                  value={comparison.counts.baselineOnly}
                  detail="Name absent from current set."
                />
                <MetricCard
                  icon={Info}
                  label="Metadata differs"
                  value={comparison.counts.metadataDifferences}
                  detail="Digest status is reported separately."
                />
              </div>

              <div className="mt-5 space-y-3">
                {comparison.rows.map((row) => {
                  const status = STATUS_META[row.status];
                  return (
                    <article
                      key={`${row.relativeName}-${row.status}`}
                      className="rounded-lg border border-border bg-surface-soft p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="break-all font-semibold text-foreground">
                          {row.relativeName}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      {row.metadataDifferences.length ? (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Metadata differs: {row.metadataDifferences.join(", ")}.
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-foreground">
                  Export local results
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The full manifest includes file metadata and digests. The
                  counts-only summary excludes relative names, digests, media-type
                  labels, file timestamps, and file contents.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
                  onClick={() =>
                    downloadJson("file-integrity-manifest.json", manifest)
                  }
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Download manifest
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
                  onClick={() =>
                    downloadJson(
                      "file-integrity-counts-only.json",
                      countsOnlySummary,
                    )
                  }
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Download counts only
                </button>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <section className="mt-6 rounded-xl border border-border bg-surface-soft p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          />
          <div>
            <h2 className="font-semibold text-foreground">Interpretation limits</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              {LIMITATIONS.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
