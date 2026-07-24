"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  Download,
  FileJson2,
  FileUp,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

import {
  buildMemoryAuditReport,
  inspectMemoryChanges,
} from "../lib/inspectMemory.mjs";

const MAX_FILE_SIZE = 1024 * 1024;

const SEVERITY_STYLES = {
  high: "border-[var(--danger)] bg-[var(--danger-soft)]",
  medium: "border-[var(--warning)] bg-[var(--warning-soft)]",
  low: "border-[var(--primary)] bg-[var(--primary-soft)]",
  none: "border-[var(--border)] bg-[var(--background)]",
};

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

function SnapshotInput({ label, value, onChange, inputRef, onFile }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">{label}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            JSON export or one memory entry per line
          </p>
        </div>
        <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
          <FileUp className="h-4 w-4" aria-hidden="true" />
          Open file
          <input
            ref={inputRef}
            type="file"
            accept=".json,.txt,application/json,text/plain"
            className="sr-only"
            onChange={(event) => void onFile(event.target.files?.[0] || null)}
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-bold text-[var(--foreground)]">
        <span className="sr-only">{label} contents</span>
        <textarea
          className="input-field min-h-64 w-full resize-y font-mono text-sm"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder='{"memories":[{"text":"Prefers concise answers"}]}'
          spellCheck="false"
        />
      </label>
    </section>
  );
}

export default function AgentMemoryPoisoningInspector() {
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const [beforeSource, setBeforeSource] = useState("");
  const [afterSource, setAfterSource] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showAllChanges, setShowAllChanges] = useState(false);

  const report = useMemo(
    () => (result?.ok ? buildMemoryAuditReport(result) : null),
    [result],
  );

  const updateSource = (setter) => (value) => {
    setter(value);
    setResult(null);
    setError("");
  };

  const readFile = async (file, setter) => {
    setResult(null);
    setError("");
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose a JSON or text snapshot up to 1 MB.");
      return;
    }
    try {
      setter(await file.text());
    } catch {
      setError("The selected file could not be read as text.");
    }
  };

  const inspect = () => {
    if (!afterSource.trim()) {
      setError("Add the newer memory snapshot before inspecting changes.");
      setResult(null);
      return;
    }
    const next = inspectMemoryChanges(beforeSource, afterSource);
    if (!next.ok) {
      setError(next.error);
      setResult(null);
      return;
    }
    setError("");
    setResult(next);
  };

  const reset = () => {
    setBeforeSource("");
    setAfterSource("");
    setResult(null);
    setError("");
    setShowAllChanges(false);
    if (beforeInputRef.current) beforeInputRef.current.value = "";
    if (afterInputRef.current) afterInputRef.current.value = "";
  };

  const visibleChanges = result
    ? showAllChanges
      ? result.changes
      : result.flagged
    : [];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <BrainCircuit className="h-4 w-4" aria-hidden="true" />
              Local memory diff
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Agent Memory Poisoning Inspector
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Compare an earlier and newer AI-memory export. Review newly introduced instruction
              overrides, hidden Unicode, identity edits, permission expansion, and persistence
              language without uploading either snapshot.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Values stay in this tab</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              The downloadable audit contains categories and counts only—not memory values or
              paths.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <SnapshotInput
          label="Earlier snapshot"
          value={beforeSource}
          onChange={updateSource(setBeforeSource)}
          inputRef={beforeInputRef}
          onFile={(file) => readFile(file, setBeforeSource)}
        />
        <SnapshotInput
          label="Newer snapshot"
          value={afterSource}
          onChange={updateSource(setAfterSource)}
          inputRef={afterInputRef}
          onFile={(file) => readFile(file, setAfterSource)}
        />
      </div>

      {error ? (
        <p
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={inspect}
          disabled={!afterSource.trim()}
        >
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
          Inspect changes
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear both
        </button>
      </div>

      {result ? (
        <section className="space-y-5" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Added", result.summary.added],
              ["Modified", result.summary.modified],
              ["Removed", result.summary.removed],
              ["High cues", result.summary.high],
              ["Medium cues", result.summary.medium],
              ["Low cues", result.summary.low],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-black text-[var(--foreground)]">{value}</p>
              </div>
            ))}
          </div>

          {result.truncated ? (
            <p className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
              One snapshot exceeded the local safety limit, so this comparison is incomplete.
            </p>
          ) : null}

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {showAllChanges ? "All changed entries" : "Flagged review cues"}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.flagged.length} of {result.changes.length} changed paths matched a review
                  pattern.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary min-h-10 px-4"
                  onClick={() => setShowAllChanges((current) => !current)}
                >
                  {showAllChanges ? "Show flagged only" : "Show all changes"}
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                  onClick={() =>
                    downloadJson("agent-memory-audit.json", report)
                  }
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Counts-only report
                </button>
              </div>
            </div>

            {visibleChanges.length ? (
              <ol className="mt-5 space-y-3">
                {visibleChanges.map((change) => (
                  <li
                    key={`${change.changeType}:${change.path}`}
                    className={`rounded-lg border p-4 ${SEVERITY_STYLES[change.severity]}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="break-all text-sm font-bold text-[var(--foreground)]">
                        {change.path}
                      </code>
                      <span className="rounded-full border border-[var(--border-strong)] px-2 py-1 text-xs font-bold uppercase text-[var(--foreground)]">
                        {change.changeType}
                        {change.severity !== "none" ? ` · ${change.severity}` : ""}
                      </span>
                    </div>
                    {change.signals.length ? (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {change.signals.map((signal) => (
                          <li
                            key={signal.id}
                            className="rounded-full bg-[var(--card)] px-2 py-1 text-xs font-bold text-[var(--foreground)]"
                          >
                            {signal.label}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      {change.changeType !== "added" ? (
                        <div>
                          <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                            Before
                          </p>
                          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs text-[var(--foreground)]">
                            {change.beforeValue}
                          </pre>
                        </div>
                      ) : null}
                      {change.changeType !== "removed" ? (
                        <div>
                          <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                            After
                          </p>
                          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs text-[var(--foreground)]">
                            {change.afterValue}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-5 rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-5">
                <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                  <ShieldCheck className="h-5 w-5 text-[var(--success)]" aria-hidden="true" />
                  No configured review cue matched
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  This does not prove the memory is trustworthy. Review source, authorization, and
                  every meaningful change before importing it.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="grid min-h-44 place-items-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--card)] p-6 text-center">
          <div>
            <FileJson2 className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" aria-hidden="true" />
            <p className="mt-3 font-bold text-[var(--foreground)]">No comparison yet</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Add a newer snapshot; the earlier snapshot may be blank for a first-import review.
            </p>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
        <p className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          Pattern matching cannot determine intent or provenance and can miss subtle poisoning.
          Treat every match as a cue for human review, not as a malware verdict. Import memory only
          from a source and change process you trust.
        </p>
      </section>
    </main>
  );
}
