"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Download,
  FileAudio,
  FileImage,
  FileVideo,
  Info,
  Link2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";

import {
  buildTimelineCountsReport,
  correlateTimeline,
  extractMediaTimestamps,
  mediaTimelineInputLimits,
  selectMediaInputBatch,
} from "../lib/mediaTimeline.mjs";

const MAX_FILES = mediaTimelineInputLimits.maxFiles;

function formatBytes(bytesInput) {
  const bytes = Math.max(0, Number(bytesInput) || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatDelta(milliseconds) {
  const seconds = Math.round(Math.abs(milliseconds) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function fileIcon(format) {
  if (["jpeg", "png", "webp"].includes(format)) return FileImage;
  if (format === "wav") return FileAudio;
  if (format === "mp4-family") return FileVideo;
  return Info;
}

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "media-metadata-timeline-counts.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, detail }) {
  return (
    <div className="tool-card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

export default function MediaMetadataTimelineCorrelator() {
  const fileInputRef = useRef(null);
  const recordsRef = useRef([]);
  const addGenerationRef = useRef(0);
  const addBusyRef = useRef(false);
  const [records, setRecords] = useState([]);
  const [fallbackOffset, setFallbackOffset] = useState("");
  const [clusterMinutes, setClusterMinutes] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const result = useMemo(
    () => correlateTimeline(records, { fallbackOffset, clusterMinutes }),
    [clusterMinutes, fallbackOffset, records],
  );
  const report = useMemo(() => buildTimelineCountsReport(result), [result]);

  const addFiles = async (fileList) => {
    if (addBusyRef.current) {
      setError("Wait for the current local media batch to finish reading.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const selection = selectMediaInputBatch(recordsRef.current, fileList);
    if (!selection.ok) {
      setError(selection.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const operation = addGenerationRef.current + 1;
    addGenerationRef.current = operation;
    addBusyRef.current = true;

    setBusy(true);
    setError("");
    try {
      const next = [];
      for (let index = 0; index < selection.candidates.length; index += 1) {
        const file = selection.candidates[index];
        const buffer = await file.arrayBuffer();
        if (addGenerationRef.current !== operation) return;
        const extracted = extractMediaTimestamps(buffer);
        next.push({
          id: `media-${operation}-${index}`,
          fileName: file.name,
          size: file.size,
          browserType: file.type || "unknown",
          lastModified: file.lastModified || 0,
          format: extracted.format,
          embeddedEvents: extracted.events,
          warning: extracted.warning,
        });
      }
      if (addGenerationRef.current !== operation) return;
      const latestReservation = selectMediaInputBatch(
        recordsRef.current,
        selection.candidates,
      );
      if (
        !latestReservation.ok ||
        latestReservation.candidates.length !== selection.candidates.length
      ) {
        setError(
          latestReservation.ok
            ? "The latest media set no longer has room for this full batch."
            : latestReservation.error,
        );
        return;
      }
      const combined = [...recordsRef.current, ...next];
      recordsRef.current = combined;
      setRecords(combined);
      if (selection.ignoredFileCount) {
        setError(
          `${selection.ignoredFileCount} file${selection.ignoredFileCount === 1 ? " was" : "s were"} not added because the ${MAX_FILES}-file limit was reached.`,
        );
      }
    } catch {
      if (addGenerationRef.current !== operation) return;
      setError(
        "One of the files could not be read as a bounded local media buffer.",
      );
    } finally {
      if (addGenerationRef.current === operation) {
        addBusyRef.current = false;
        setBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const removeRecord = (id) => {
    const next = recordsRef.current.filter((record) => record.id !== id);
    recordsRef.current = next;
    setRecords(next);
  };

  const clearAll = () => {
    addGenerationRef.current += 1;
    addBusyRef.current = false;
    recordsRef.current = [];
    setRecords([]);
    setFallbackOffset("");
    setClusterMinutes(5);
    setBusy(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="tool-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Local timestamp correlation
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Media Metadata Timeline Correlator
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Inspect supported embedded date fields, preserve timezone
              uncertainty, and compare their temporal proximity with
              browser-provided file timestamps.
            </p>
          </div>
          <div className="rounded-lg border border-warning bg-warning-soft p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <AlertTriangle
                className="h-5 w-5 text-warning"
                aria-hidden="true"
              />
              Metadata is not ground truth
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Fields can be absent, copied, rewritten, rounded, timezone-free,
              wrong, or intentionally changed. Correlation does not prove
              capture order or authenticity.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="tool-card p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
                Local media set
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Up to {MAX_FILES} files and 128 MB combined. Files are read
                sequentially in this tab and are never uploaded.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || records.length >= MAX_FILES}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {busy ? "Reading locally…" : "Add media"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.m4v,.wav,image/jpeg,image/png,image/webp,video/mp4,video/quicktime,audio/wav"
              className="sr-only"
              disabled={busy || records.length >= MAX_FILES}
              aria-label="Choose local media files for timestamp correlation"
              onChange={(event) => void addFiles(event.target.files)}
            />
          </div>

          {records.length ? (
            <ul className="mt-5 space-y-3">
              {records.map((record) => {
                const Icon = fileIcon(record.format);
                return (
                  <li
                    key={record.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-surface-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">
                          {record.fileName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {record.format} · {formatBytes(record.size)} ·{" "}
                          {record.embeddedEvents.length} embedded date field
                          {record.embeddedEvents.length === 1 ? "" : "s"}
                        </p>
                        {record.warning ? (
                          <p className="mt-1 text-xs text-warning">
                            {record.warning}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost min-h-10 self-end px-3 sm:self-auto"
                      onClick={() => removeRecord(record.id)}
                      aria-label={`Remove ${record.fileName}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <button
              type="button"
              className="mt-5 flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-soft p-6 text-center hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              <FileVideo
                className="h-10 w-10 text-primary"
                aria-hidden="true"
              />
              <span className="font-bold text-foreground">
                Choose a bounded local batch
              </span>
              <span className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                JPEG/PNG/WebP EXIF or tIME, MP4-family movie/media headers, and
                WAV INFO ICRD are the configured embedded fields.
              </span>
            </button>
          )}
        </section>

        <aside className="space-y-6">
          <section className="tool-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              Correlation settings
            </h2>
            <label className="mt-5 block">
              <span className="text-sm font-bold text-foreground">
                Optional offset for timezone-free fields
              </span>
              <input
                type="text"
                value={fallbackOffset}
                onChange={(event) =>
                  setFallbackOffset(event.target.value.slice(0, 6))
                }
                placeholder="+05:30"
                inputMode="text"
                className="input-field mt-2 w-full font-mono"
              />
              <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                Leave blank to keep wall clocks unresolved. Use Z or ±HH:MM only
                when you have external evidence for that assumption.
              </span>
            </label>
            <label className="mt-5 block">
              <span className="flex justify-between gap-3 text-sm font-bold text-foreground">
                Proximity window <span>{clusterMinutes} minutes</span>
              </span>
              <input
                type="range"
                min="1"
                max="120"
                step="1"
                value={clusterMinutes}
                onChange={(event) =>
                  setClusterMinutes(Number(event.target.value))
                }
                className="mt-2 w-full accent-primary"
              />
            </label>
          </section>

          <section className="rounded-lg border border-border bg-surface-soft p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Export boundary
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The downloadable report contains counts, format totals, and
              comparison settings only. It includes a browser-clock report
              generation time, but excludes filenames, source/media timestamps,
              raw metadata, and media bytes.
            </p>
          </section>
        </aside>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-secondary min-h-11"
          onClick={clearAll}
          disabled={!busy && !records.length && !fallbackOffset}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {records.length ? (
          <button
            type="button"
            className="btn-secondary min-h-11"
            onClick={() => downloadJson(report)}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download counts-only report
          </button>
        ) : null}
      </div>

      {records.length ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Timestamp fields"
              value={result.counts.events}
              detail="Embedded plus browser file properties"
            />
            <StatCard
              label="Zoned"
              value={result.counts.zonedEvents}
              detail="Sortable on an absolute UTC timeline"
            />
            <StatCard
              label="Unresolved"
              value={result.counts.unresolvedEvents}
              detail="Missing zone or invalid/unsupported value"
            />
            <StatCard
              label="Near clusters"
              value={result.counts.proximityClusters}
              detail={`Adjacent events within ${clusterMinutes} minutes`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="tool-card p-5 sm:p-6 xl:col-span-2">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Link2 className="h-5 w-5 text-primary" aria-hidden="true" />
                Zoned timeline
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Chronological order after applying only embedded or explicitly
                entered offsets.
              </p>
              {result.known.length ? (
                <ol className="mt-5 space-y-3">
                  {result.known.map((event, index) => {
                    const previous = result.known[index - 1];
                    return (
                      <li
                        key={event.eventId}
                        className="rounded-lg border border-border bg-surface-soft p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words font-bold text-foreground">
                              {event.fileName}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {event.label}
                            </p>
                          </div>
                          {previous ? (
                            <span className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                              +
                              {formatDelta(
                                event.normalized.epochMs -
                                  previous.normalized.epochMs,
                              )}
                            </span>
                          ) : null}
                        </div>
                        <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                          <div>
                            <dt className="font-bold text-muted-foreground">
                              Normalized UTC
                            </dt>
                            <dd className="mt-1 break-words font-mono text-foreground">
                              {event.normalized.iso}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-bold text-muted-foreground">
                              Stored value
                            </dt>
                            <dd className="mt-1 break-words font-mono text-foreground">
                              {event.timestamp}
                            </dd>
                          </div>
                        </dl>
                        {event.normalized.usedFallbackOffset ? (
                          <p className="mt-3 rounded-lg border border-warning bg-warning-soft p-3 text-xs text-foreground">
                            Uses the user-entered {event.normalized.offset}{" "}
                            fallback; this is an assumption, not embedded
                            evidence.
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="mt-5 rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
                  No timestamp currently has a usable timezone basis.
                </p>
              )}
            </section>

            <aside className="space-y-6">
              <section className="tool-card p-5">
                <h2 className="font-bold text-foreground">Review cues</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    [
                      "Fallback-offset events",
                      result.counts.fallbackOffsetEvents,
                    ],
                    [
                      "Exact cross-file groups",
                      result.counts.exactCrossFileGroups,
                    ],
                    [
                      "Embedded later than file property",
                      result.counts.embeddedAfterFilesystem,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-lg bg-surface-soft p-3"
                    >
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-black text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  These are relationships to review, not contradiction or tamper
                  verdicts.
                </p>
              </section>

              <section className="rounded-lg border border-warning bg-warning-soft p-5">
                <h2 className="font-bold text-foreground">Coverage limits</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-relaxed text-muted-foreground">
                  <li>Only configured container fields are parsed.</li>
                  <li>
                    Maker notes, sidecars, XMP history, GPS time, and
                    proprietary fields are excluded.
                  </li>
                  <li>
                    File lastModified can change during copy, download, or
                    export.
                  </li>
                  <li>Zero findings never establish clean provenance.</li>
                </ul>
              </section>
            </aside>
          </div>

          {result.unresolved.length ? (
            <section className="tool-card p-5 sm:p-6">
              <h2 className="text-xl font-bold text-foreground">
                Unresolved or invalid timestamp fields
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These remain outside the absolute timeline until their timezone
                or format is supported with evidence.
              </p>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-full text-left text-sm">
                  <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="p-3">File</th>
                      <th className="p-3">Field</th>
                      <th className="p-3">Stored value</th>
                      <th className="p-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.unresolved.map((event) => (
                      <tr
                        key={event.eventId}
                        className="border-t border-border"
                      >
                        <td className="break-words p-3 font-bold text-foreground">
                          {event.fileName}
                        </td>
                        <td className="break-words p-3 text-muted-foreground">
                          {event.label}
                        </td>
                        <td className="break-words p-3 font-mono text-foreground">
                          {event.timestamp || "Empty"}
                        </td>
                        <td className="break-words p-3 text-muted-foreground">
                          {event.normalized.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
