"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Download,
  EyeOff,
  FileClock,
  FileUp,
  History,
  Link2,
  MessageSquareText,
  PackageSearch,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Tags,
} from "lucide-react";

import {
  MAX_OFFICE_FILE_BYTES,
  buildCountsOnlyRevisionReport,
  inspectOoxmlArchive,
} from "../lib/inspectOoxml.mjs";

const CATEGORY_ICONS = {
  "Revision history": FileClock,
  "Comments and notes": MessageSquareText,
  Metadata: Tags,
  "Hidden structure": EyeOff,
  "Embedded and linked content": Link2,
};

function extensionLabel(file) {
  return (
    String(file?.name || "")
      .split(".")
      .pop()
      ?.toUpperCase() || "OOXML"
  );
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadJson(value) {
  if (!value) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "hidden-revision-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 break-words text-2xl font-black text-foreground">
        {value}
      </p>
    </div>
  );
}

function CategoryPanel({ category, checks }) {
  const Icon = CATEGORY_ICONS[category] || PackageSearch;
  const detected = checks.filter((check) => check.count > 0).length;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-bold text-foreground">{category}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {detected} of {checks.length} checks contain observable markers
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-4 space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`rounded-lg border p-4 ${
              check.count
                ? "border-warning bg-warning-soft"
                : "border-border bg-background"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="font-bold text-foreground">{check.label}</dt>
              <dd
                className={`rounded-full border px-2 py-1 text-xs font-black ${
                  check.count
                    ? "border-warning text-warning"
                    : "border-border-strong text-muted-foreground"
                }`}
              >
                {check.count.toLocaleString("en-US")}
              </dd>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {check.description}
            </p>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function HiddenRevisionInspector() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const groupedChecks = useMemo(() => {
    if (!result?.ok) return [];
    const categories = [];
    result.checks.forEach((check) => {
      let group = categories.find((item) => item.category === check.category);
      if (!group) {
        group = { category: check.category, checks: [] };
        categories.push(group);
      }
      group.checks.push(check);
    });
    return categories;
  }, [result]);

  const report = useMemo(
    () => (result?.ok ? buildCountsOnlyRevisionReport(result) : null),
    [result],
  );

  const selectFile = (nextFile) => {
    setResult(null);
    setError("");
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (nextFile.size > MAX_OFFICE_FILE_BYTES) {
      setFile(null);
      setError("Choose an OOXML file no larger than 20 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(nextFile);
  };

  const inspect = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const inspection = await inspectOoxmlArchive(await file.arrayBuffer(), {
        fileName: file.name,
        fileSize: file.size,
      });
      if (!inspection.ok) {
        setError(inspection.error);
        return;
      }
      setResult(inspection);
    } catch {
      setError("The package could not be inspected locally.");
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setFile(null);
    setResult(null);
    setError("");
    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <History className="h-4 w-4" aria-hidden="true" />
              Static OOXML inspection
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Hidden Revision Inspector
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Check DOCX, XLSX, PPTX, and related OOXML packages for generic
              revision, comment, metadata, hidden-structure, macro, embedding,
              and external-link markers without exposing their private contents.
            </p>
          </div>
          <div className="rounded-lg border border-primary bg-primary-soft p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Local and non-executing
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The package stays in this tab. Macros, scripts, links, ActiveX,
              attachments, and embedded files are never executed, followed, or
              opened.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Archive className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              1. Choose an OOXML package
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Supports standard and macro-enabled Word, Excel, and PowerPoint
              OOXML extensions, plus a ZIP containing a complete OOXML package.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-border-strong bg-background p-6 text-center">
          <FileUp className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <p className="mt-3 font-bold text-foreground">
            {file
              ? "A local package is ready"
              : "Select a local Office package"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {file
              ? `${extensionLabel(file)} · ${formatBytes(file.size)} · filename hidden from results`
              : "DOCX, DOCM, DOTX, XLSX, XLSM, XLTX, PPTX, PPTM, POTX, PPSX, or OOXML ZIP"}
          </p>
          <label className="btn-secondary mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 px-5">
            <FileUp className="h-4 w-4" aria-hidden="true" />
            {file ? "Choose another file" : "Choose file"}
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept=".docx,.docm,.dotx,.dotm,.xlsx,.xlsm,.xltx,.xltm,.xlam,.pptx,.pptm,.potx,.potm,.ppsx,.ppsm,.zip"
              onChange={(event) => selectFile(event.target.files?.[0] || null)}
            />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">
            Maximum compressed file size: 20 MB. Additional entry, XML-part, and
            uncompressed-size limits apply.
          </p>
        </div>
      </section>

      {error ? (
        <p
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm font-medium text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary inline-flex min-h-11 items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void inspect()}
          disabled={!file || busy}
        >
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
          {busy ? "Inspecting package..." : "Inspect package"}
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={clear}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      {result ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard
              icon={Archive}
              label="Package family"
              value={result.familyLabel}
            />
            <SummaryCard
              icon={PackageSearch}
              label="Package entries"
              value={result.summary.packageEntries.toLocaleString("en-US")}
            />
            <SummaryCard
              icon={ScanSearch}
              label="XML parts inspected"
              value={result.summary.inspectedXmlParts.toLocaleString("en-US")}
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Checks with evidence"
              value={result.summary.checksWithEvidence.toLocaleString("en-US")}
            />
            <SummaryCard
              icon={History}
              label="Evidence markers"
              value={result.summary.evidenceMarkers.toLocaleString("en-US")}
            />
          </div>

          <div className="rounded-lg border border-warning bg-warning-soft p-4">
            <p className="flex items-start gap-2 text-sm leading-6 text-foreground">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                aria-hidden="true"
              />
              {result.summary.checksWithEvidence
                ? "The archive contains one or more listed package markers."
                : "No listed marker was observed in the inspected parts."}{" "}
              Neither outcome proves whether the document has a clean, complete,
              or trustworthy history.
            </p>
          </div>

          {result.warnings.length ? (
            <section className="rounded-lg border border-warning bg-warning-soft p-5">
              <h2 className="font-bold text-foreground">Inspection warnings</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  2. Generic package evidence
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Counts can overlap and are not unique-person, unique-edit, or
                  risk scores. Private values and content are not shown.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                onClick={() => downloadJson(report)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download counts-only report
              </button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {groupedChecks.map((group) => (
                <CategoryPanel
                  key={group.category}
                  category={group.category}
                  checks={group.checks}
                />
              ))}
            </div>
          </section>
        </section>
      ) : null}

      <section className="rounded-lg border border-warning bg-warning-soft p-5 sm:p-6">
        <h2 className="font-bold text-foreground">Interpretation boundary</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          <li>
            Presence of a revision, author field, macro part, external
            relationship, or hidden structure does not prove malicious intent or
            inappropriate editing.
          </li>
          <li>
            Absence is not proof of a clean history. Resaving, accepting
            changes, flattening, copying, converting, or exporting can remove
            relevant evidence.
          </li>
          <li>
            The inspector does not render documents, evaluate visible meaning,
            validate signatures, recover deleted data, decrypt files, or inspect
            legacy DOC, XLS, or PPT binaries.
          </li>
          <li>
            High-stakes review should combine this static package evidence with
            a trusted source copy, full rendering, signature validation, and
            specialist forensic tools.
          </li>
        </ul>
      </section>
    </main>
  );
}
