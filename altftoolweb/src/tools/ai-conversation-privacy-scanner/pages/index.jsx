"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  Clipboard,
  Download,
  FileJson2,
  MessagesSquare,
  RotateCcw,
  ScanSearch,
  ShieldAlert,
  Upload,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  DEFAULT_ENABLED_TYPES,
  PII_TYPES,
  buildConversationPrivacyReport,
  scanConversation,
} from "../lib/scanConversation.mjs";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function downloadText(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AiConversationPrivacyScanner() {
  const fileInputRef = useRef(null);
  const [source, setSource] = useState("");
  const [enabledTypes, setEnabledTypes] = useState(DEFAULT_ENABLED_TYPES);
  const [mode, setMode] = useState("label");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => (result?.ok ? buildConversationPrivacyReport(result) : null),
    [result],
  );

  const analyse = () => {
    const next = scanConversation(source, { enabledTypes, mode });
    if (!next.ok) {
      setResult(null);
      setError(next.error);
      return;
    }
    setResult(next);
    setError("");
    setCopied(false);
  };

  const readFile = async (file) => {
    setResult(null);
    setError("");
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose a JSON or text export up to 2 MB.");
      return;
    }
    try {
      setSource(await file.text());
    } catch {
      setError("The selected file could not be read as text.");
    }
  };

  const reset = () => {
    setSource("");
    setEnabledTypes(DEFAULT_ENABLED_TYPES);
    setMode("label");
    setResult(null);
    setError("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleType = (type) => {
    setEnabledTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
    setResult(null);
  };

  const copyTranscript = async () => {
    if (!result?.transcript) return;
    const didCopy = await safeCopyText(result.transcript);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <MessagesSquare className="h-4 w-4" aria-hidden="true" />
              Local conversation scan
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              AI Conversation Privacy Scanner
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Review an AI conversation export for personal data and credentials before storing,
              sharing, or reusing it. Processing stays in this tab.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">No chat upload or account access</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Paste text or select a local JSON/TXT file. The counts-only report never includes
              conversation content.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Conversation input</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Supports role-labelled text and common JSON message arrays.
              </p>
            </div>
            <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Open file
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.txt,application/json,text/plain"
                className="sr-only"
                onChange={(event) => void readFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm font-bold text-[var(--foreground)]">
            Chat text or export JSON
            <textarea
              className="input-field min-h-72 w-full resize-y font-mono text-sm"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setResult(null);
                setError("");
              }}
              placeholder={"User: My email is person@example.com\nAssistant: I can help."}
              spellCheck="false"
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-bold text-[var(--foreground)]">
              Redaction style
              <select
                className="input-field min-h-11 w-full"
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value);
                  setResult(null);
                }}
              >
                <option value="label">Stable labels</option>
                <option value="partial">Partial masking</option>
                <option value="remove">Remove values</option>
              </select>
            </label>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
              <span className="font-bold text-[var(--foreground)]">{enabledTypes.length}</span>{" "}
              <span className="text-[var(--muted-foreground)]">detector categories enabled</span>
            </div>
          </div>

          <details className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <summary className="cursor-pointer font-bold text-[var(--foreground)]">
              Choose detector categories
            </summary>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {PII_TYPES.map((type) => (
                <label
                  key={type.id}
                  className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <input
                    type="checkbox"
                    checked={enabledTypes.includes(type.id)}
                    onChange={() => toggleType(type.id)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </details>

          {error ? (
            <p
              className="mt-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary inline-flex min-h-11 items-center gap-2 px-5"
              onClick={analyse}
              disabled={!source.trim()}
            >
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Scan locally
            </button>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Redacted transcript</h2>
          {result ? (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Messages", result.messageCount],
                  ["Flagged", result.flaggedMessageCount],
                  ["Signals", result.totalDetections],
                  ["Format", result.format.toUpperCase()],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <dt className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-lg font-black text-[var(--foreground)]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {result.truncated ? (
                <p className="mt-4 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--foreground)]">
                  The export exceeded the local safety limit; only the first supported portion was
                  scanned.
                </p>
              ) : null}

              <pre className="mt-4 max-h-[32rem] min-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
                {result.transcript}
              </pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary inline-flex min-h-11 items-center gap-2 px-4"
                  onClick={copyTranscript}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy transcript"}
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 items-center gap-2 px-4"
                  onClick={() =>
                    downloadText(
                      "redacted-ai-conversation.txt",
                      result.transcript,
                      "text/plain;charset=utf-8",
                    )
                  }
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download TXT
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 items-center gap-2 px-4"
                  onClick={() =>
                    downloadText(
                      "ai-conversation-privacy-report.json",
                      JSON.stringify(report, null, 2),
                      "application/json;charset=utf-8",
                    )
                  }
                >
                  <FileJson2 className="h-4 w-4" aria-hidden="true" />
                  Counts-only report
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4 grid min-h-72 place-items-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--background)] p-6 text-center">
              <div>
                <MessagesSquare className="mx-auto h-10 w-10 text-[var(--muted-foreground)]" aria-hidden="true" />
                <p className="mt-3 font-bold text-[var(--foreground)]">No scan yet</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Results and the redacted transcript will appear here.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
        <p className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <ShieldAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          Pattern detection can miss unusual identifiers, indirect personal details, files,
          images, and context. Review the entire redacted transcript before sharing it, and avoid
          putting live secrets into any website when a safer local system is available.
        </p>
      </section>
    </main>
  );
}
