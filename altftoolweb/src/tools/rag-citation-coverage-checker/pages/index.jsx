"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  Download,
  FileUp,
  RotateCcw,
  ScanSearch,
} from "lucide-react";

import {
  buildCoverageReport,
  checkCitationCoverage,
} from "../lib/checkCoverage.mjs";

const MAX_FILE_SIZE = 1024 * 1024;

const STATUS_STYLES = {
  linked: "border-[var(--success)] bg-[var(--success-soft)]",
  mixed: "border-[var(--warning)] bg-[var(--warning-soft)]",
  unknown: "border-[var(--danger)] bg-[var(--danger-soft)]",
  missing: "border-[var(--border)] bg-[var(--background)]",
};

const STATUS_LABELS = {
  linked: "Linked",
  mixed: "Mixed references",
  unknown: "Unknown references",
  missing: "No citation",
};

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rag-citation-coverage-report.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function InputPanel({
  title,
  help,
  value,
  onChange,
  inputRef,
  onFile,
  placeholder,
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{help}</p>
        </div>
        <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
          <FileUp className="h-4 w-4" aria-hidden="true" />
          Open text
          <input
            ref={inputRef}
            type="file"
            accept=".json,.txt,text/plain,application/json"
            className="sr-only"
            onChange={(event) => void onFile(event.target.files?.[0] || null)}
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="sr-only">{title} contents</span>
        <textarea
          className="input-field min-h-64 w-full resize-y font-mono text-sm"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          spellCheck="false"
        />
      </label>
    </section>
  );
}

export default function RagCitationCoverageChecker() {
  const answerInputRef = useRef(null);
  const sourcesInputRef = useRef(null);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const report = useMemo(
    () => (result?.ok ? buildCoverageReport(result) : null),
    [result],
  );

  const update = (setter) => (value) => {
    setter(value);
    setResult(null);
    setError("");
  };

  const readFile = async (file, setter) => {
    setResult(null);
    setError("");
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose a text or JSON file up to 1 MB.");
      return;
    }
    try {
      setter(await file.text());
    } catch {
      setError("The selected file could not be read as text.");
    }
  };

  const check = () => {
    const next = checkCitationCoverage(answer, sources);
    if (!next.ok) {
      setError(next.error);
      setResult(null);
      return;
    }
    setError("");
    setResult(next);
  };

  const reset = () => {
    setAnswer("");
    setSources("");
    setResult(null);
    setError("");
    if (answerInputRef.current) answerInputRef.current.value = "";
    if (sourcesInputRef.current) sourcesInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Structural citation audit
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              RAG Citation Coverage Checker
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Map claim-like answer sentences to recognizable source IDs from a retrieval set.
              Find missing or unknown citation markers locally before a human evaluates whether
              each source actually supports the claim.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">No model or source upload</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              The downloadable report contains structural counts only, without answer or source
              text.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <InputPanel
          title="Generated answer"
          help="Use citations such as [1], [doc-a], or (Sources: 1, 2)."
          value={answer}
          onChange={update(setAnswer)}
          inputRef={answerInputRef}
          onFile={(file) => readFile(file, setAnswer)}
          placeholder="The policy changed in May [1]. A second claim has no citation."
        />
        <InputPanel
          title="Retrieved sources"
          help="Use JSON, or one line per source as ID | passage."
          value={sources}
          onChange={update(setSources)}
          inputRef={sourcesInputRef}
          onFile={(file) => readFile(file, setSources)}
          placeholder={"1 | First retrieved passage\n2 | Second retrieved passage"}
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
          onClick={check}
          disabled={!answer.trim()}
        >
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
          Check coverage
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

      {result ? (
        <section className="space-y-5" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Coverage", `${result.coveragePercent}%`],
              ["Claims", result.claimCount],
              ["Linked", result.linkedClaims],
              ["No citation", result.missingClaims],
              ["Unknown only", result.unknownOnlyClaims],
              ["Sources", result.sourceCount],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-1 break-words text-2xl font-black text-[var(--foreground)]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {result.truncated ? (
            <p className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
              An input exceeded the local safety limit, so this coverage result is incomplete.
            </p>
          ) : null}

          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Claim map</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Sentence splitting and citation recognition are deterministic heuristics.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                onClick={() => downloadJson(report)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Counts-only report
              </button>
            </div>

            {result.claims.length ? (
              <ol className="mt-5 space-y-3">
                {result.claims.map((claim) => (
                  <li
                    key={claim.index}
                    className={`rounded-lg border p-4 ${STATUS_STYLES[claim.status]}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                        Claim {claim.index}
                      </span>
                      <span className="rounded-full border border-[var(--border-strong)] px-2 py-1 text-xs font-bold text-[var(--foreground)]">
                        {STATUS_LABELS[claim.status]}
                      </span>
                    </div>
                    <p className="mt-3 break-words text-sm leading-6 text-[var(--foreground)]">
                      {claim.text}
                    </p>
                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-[var(--muted-foreground)]">Recognized</dt>
                        <dd className="mt-1 break-words text-[var(--foreground)]">
                          {claim.recognizedIds.join(", ") || "None"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-[var(--muted-foreground)]">Unknown</dt>
                        <dd className="mt-1 break-words text-[var(--foreground)]">
                          {claim.unknownIds.join(", ") || "None"}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted-foreground)]">
                No claim-like sentence was found. Short labels and questions are excluded.
              </p>
            )}
          </section>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
        <p className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          A linked citation is not evidence that the source supports the sentence, and a high
          percentage is not an accuracy score. Always inspect the cited passage, source quality,
          claim boundaries, and missing context.
        </p>
      </section>
    </main>
  );
}
