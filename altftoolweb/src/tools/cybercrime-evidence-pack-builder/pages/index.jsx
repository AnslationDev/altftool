"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  FileCheck2,
  Fingerprint,
  ListOrdered,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  MAX_EVIDENCE_ITEMS,
  MAX_TEXT_LENGTH,
  buildCountsOnlySummary,
  buildEvidencePack,
} from "../lib/buildEvidencePack.mjs";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024;
const MAX_FILES = MAX_EVIDENCE_ITEMS;

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function hashFile(file) {
  const contents = await file.arrayBuffer();
  return toHex(await crypto.subtle.digest("SHA-256", contents));
}

function downloadJson(filename, value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  const value = Math.max(0, Number(bytes) || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}

export default function CybercrimeEvidencePackBuilder() {
  const fileRef = useRef(null);
  // Bumped on every reset() so an in-flight addFiles() batch can tell it was
  // reset out from under it and discard its results instead of merging stale
  // hashes back into the just-cleared state.
  const resetTokenRef = useRef(0);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentReference, setIncidentReference] = useState("");
  const [narrative, setNarrative] = useState("");
  const [timelineSource, setTimelineSource] = useState("");
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [result, setResult] = useState(null);
  const [fileError, setFileError] = useState("");
  const [hashing, setHashing] = useState(false);
  const summary = useMemo(
    () => (result?.ok ? buildCountsOnlySummary(result) : null),
    [result],
  );

  const invalidate = () => setResult(null);

  const addFiles = async (files) => {
    const incoming = [...(files || [])];
    if (!incoming.length) return;
    const token = resetTokenRef.current;
    setFileError("");
    setResult(null);

    // "Choose copies" adds to what is already hashed rather than replacing it, so
    // re-opening the picker for one more file does not discard earlier work.
    const availableSlots = MAX_FILES - evidenceItems.length;
    if (availableSlots <= 0) {
      setFileError(
        `You already have ${MAX_FILES} evidence files, the most this tool holds. Remove one before adding another.`,
      );
      return;
    }
    const overflow = incoming.length - availableSlots;
    const selected = overflow > 0 ? incoming.slice(0, availableSlots) : incoming;

    if (selected.some((file) => file.size > MAX_FILE_SIZE)) {
      setFileError("Each evidence copy must be 25 MB or smaller.");
      return;
    }
    const existingTotalSize = evidenceItems.reduce((sum, item) => sum + item.size, 0);
    const incomingTotalSize = selected.reduce((sum, file) => sum + file.size, 0);
    if (existingTotalSize + incomingTotalSize > MAX_TOTAL_SIZE) {
      setFileError("Choose no more than 100 MB of evidence copies in total.");
      return;
    }

    setHashing(true);
    try {
      const hashed = [];
      const failed = [];
      // Hash each file independently so one unreadable file (e.g. removed
      // from a mounted/removable drive mid-read) doesn't discard every file
      // in the batch that already hashed successfully earlier in the loop.
      for (const file of selected) {
        try {
          hashed.push({
            filename: file.name,
            mediaType: file.type || "application/octet-stream",
            size: file.size,
            lastModified: file.lastModified,
            sha256: await hashFile(file),
            note: "",
          });
        } catch {
          failed.push(file.name);
        }
      }

      // Reset() ran while this batch was still hashing — its results are
      // stale, discard them rather than repopulating the list the user just
      // cleared.
      if (resetTokenRef.current !== token) return;

      if (hashed.length) {
        setEvidenceItems((current) => [...current, ...hashed]);
      }

      const messages = [];
      if (overflow > 0) {
        messages.push(
          `Only ${selected.length} of ${incoming.length} newly selected files were added — the ${MAX_FILES}-file limit was reached. ${overflow} file${overflow === 1 ? " was" : "s were"} not added.`,
        );
      }
      if (failed.length) {
        messages.push(
          `${failed.length} file${failed.length === 1 ? "" : "s"} could not be hashed in this browser and ${failed.length === 1 ? "was" : "were"} skipped: ${failed.join(", ")}.${hashed.length ? " The rest were added." : ""}`,
        );
      }
      if (messages.length) setFileError(messages.join(" "));
    } finally {
      if (resetTokenRef.current === token) setHashing(false);
    }
  };

  const updateNote = (index, note) => {
    setEvidenceItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, note } : item,
      ),
    );
    invalidate();
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the evidence pack? This clears the incident title, narrative, timeline and every hashed file, and cannot be undone.",
      )
    ) {
      return;
    }
    resetTokenRef.current += 1;
    setIncidentTitle("");
    setIncidentReference("");
    setNarrative("");
    setTimelineSource("");
    setEvidenceItems([]);
    setResult(null);
    setFileError("");
    setHashing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <Archive className="h-4 w-4" aria-hidden="true" />
              Local evidence organizer
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Cybercrime Evidence Pack Builder
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Organize a timeline and create SHA-256 fingerprints for evidence copies. Files and
              incident details stay in this tab and are never submitted automatically.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Preserve the originals</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Work from copies. A matching hash can reveal later file changes, but cannot prove
              authorship, capture time, truth, or legal admissibility.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <ListOrdered className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Incident notes and timeline
            </h2>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Short incident title
            </span>
            <input
              className="input-field min-h-11 w-full"
              value={incidentTitle}
              maxLength={500}
              onChange={(event) => {
                setIncidentTitle(event.target.value);
                invalidate();
              }}
              placeholder="Example: Marketplace payment incident"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Your reference number (optional)
            </span>
            <input
              className="input-field min-h-11 w-full"
              value={incidentReference}
              maxLength={500}
              onChange={(event) => {
                setIncidentReference(event.target.value);
                invalidate();
              }}
              placeholder="Use your own non-secret reference"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Factual narrative (optional)
            </span>
            <textarea
              className="input-field min-h-32 w-full resize-y"
              value={narrative}
              maxLength={MAX_TEXT_LENGTH}
              onChange={(event) => {
                setNarrative(event.target.value);
                invalidate();
              }}
              placeholder="Record what you directly observed. Separate assumptions from facts."
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Timeline — one event per line
            </span>
            <textarea
              className="input-field min-h-52 w-full resize-y font-mono text-sm"
              value={timelineSource}
              maxLength={MAX_TEXT_LENGTH}
              onChange={(event) => {
                setTimelineSource(event.target.value);
                invalidate();
              }}
              placeholder={"2026-07-20 10:00 | Message received | screenshot-01.png\n2026-07-20 10:05 | Payment requested | chat-export.txt"}
              spellCheck="false"
            />
            <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">
              Format: date/time | observed event | optional evidence reference. Dates are preserved
              as entered; the tool does not infer a timezone.
            </span>
          </label>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Evidence-copy fingerprints
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Up to 100 files, 25 MB each and 100 MB total. File content is not embedded.
              </p>
            </div>
            <label
              className={`btn-secondary inline-flex min-h-10 items-center gap-2 px-4 ${hashing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose copies
              <input
                ref={fileRef}
                type="file"
                multiple
                disabled={hashing}
                className="sr-only"
                onChange={(event) => void addFiles(event.target.files)}
              />
            </label>
          </div>

          {hashing ? (
            <div
              className="mt-5 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle className="h-5 w-5 animate-spin text-[var(--primary)]" aria-hidden="true" />
              <p className="text-sm text-[var(--muted-foreground)]">
                Hashing locally. Keep this tab open.
              </p>
            </div>
          ) : null}
          {fileError ? (
            <p
              className="mt-5 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--foreground)]"
              role="alert"
            >
              {fileError}
            </p>
          ) : null}

          <div className="mt-5 max-h-screen space-y-3 overflow-y-auto">
            {evidenceItems.length ? (
              evidenceItems.map((item, index) => (
                <article
                  key={`${item.sha256}-${index}`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4"
                >
                  <div className="flex items-start gap-3">
                    <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--foreground)]">
                        {item.filename}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {formatBytes(item.size)} · SHA-256{" "}
                        <span className="font-mono">{item.sha256.slice(0, 12)}…</span>
                      </p>
                      <label className="mt-3 block">
                        <span className="sr-only">Evidence note for {item.filename}</span>
                        <input
                          className="input-field min-h-10 w-full text-sm"
                          value={item.note}
                          maxLength={1000}
                          onChange={(event) => updateNote(index, event.target.value)}
                          placeholder="Optional: where this copy came from"
                        />
                      </label>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
                <ShieldCheck className="mx-auto h-7 w-7 text-[var(--muted-foreground)]" aria-hidden="true" />
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  No files selected. You can still build a timeline-only pack.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary min-h-11 px-5"
          disabled={hashing}
          onClick={() =>
            setResult(
              buildEvidencePack({
                incidentTitle,
                incidentReference,
                narrative,
                timelineSource,
                evidenceItems,
              }),
            )
          }
        >
          <Archive className="h-4 w-4" aria-hidden="true" />
          Build evidence manifest
        </button>
        <button
          type="button"
          className="btn-secondary min-h-11 px-5"
          disabled={hashing}
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {result && !result.ok ? (
        <section
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-[var(--foreground)]">Fix these items</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {result?.ok ? (
        <section
          className="rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-5 sm:p-6"
          aria-live="polite"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Manifest ready in this tab
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.counts.timelineEvents} timeline events and{" "}
                {result.counts.evidenceFiles} hashed files are organized. Review the downloaded
                JSON before sharing it.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary min-h-11 px-5"
                onClick={() =>
                  downloadJson("cybercrime-evidence-manifest.json", result.pack)
                }
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download private manifest
              </button>
              <button
                type="button"
                className="btn-secondary min-h-11 px-5"
                onClick={() =>
                  downloadJson("cybercrime-evidence-summary.json", summary)
                }
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download counts-only summary
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
