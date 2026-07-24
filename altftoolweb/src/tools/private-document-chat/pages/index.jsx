"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpenText,
  BotOff,
  Copy,
  Download,
  FileSearch,
  Files,
  Info,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import { extractPrivateDocument } from "../lib/extractPrivateDocuments.js";
import {
  PRIVATE_CHAT_LIMITS,
  buildPrivateChatCountsReport,
  buildPrivateDocumentIndex,
  retrievePrivateExcerpts,
  validatePrivateDocumentSelection,
} from "../lib/privateRetrieval.mjs";

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "private-document-chat-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function PrivateDocumentChat() {
  const inputRef = useRef(null);
  const busyRef = useRef(false);
  const generationRef = useRef(0);
  const [files, setFiles] = useState([]);
  const [index, setIndex] = useState(null);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const report = useMemo(
    () => buildPrivateChatCountsReport({ index, history }),
    [history, index],
  );

  const clear = () => {
    generationRef.current += 1;
    busyRef.current = false;
    setFiles([]);
    setIndex(null);
    setQuestion("");
    setHistory([]);
    setBusy(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const chooseFiles = (selected) => {
    if (busyRef.current) return;
    const validation = validatePrivateDocumentSelection(selected);
    setIndex(null);
    setHistory([]);
    setError("");
    if (!validation.ok) {
      setFiles([]);
      setError(validation.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFiles(validation.files);
  };

  const buildIndex = async () => {
    if (!files.length || busyRef.current) return;
    const validation = validatePrivateDocumentSelection(files);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setIndex(null);
    setHistory([]);

    try {
      const documents = [];
      let remainingCharacters = PRIVATE_CHAT_LIMITS.totalCharacters;
      for (const file of files) {
        const extracted = await extractPrivateDocument(file, {
          remainingCharacters,
          shouldContinue: () => generation === generationRef.current,
        });
        if (generation !== generationRef.current) return;
        const characters = extracted.sections.reduce(
          (total, section) => total + section.text.length,
          0,
        );
        remainingCharacters -= characters;
        documents.push({
          label: file.name,
          format: extracted.format,
          sections: extracted.sections,
          warnings: extracted.warnings,
        });
      }
      const nextIndex = buildPrivateDocumentIndex(documents);
      if (generation !== generationRef.current) return;
      setIndex(nextIndex);
    } catch (cause) {
      if (generation === generationRef.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "The documents could not be indexed locally.",
        );
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const ask = (event) => {
    event.preventDefault();
    if (!index) return;
    const response = retrievePrivateExcerpts(index, question, 5);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setError("");
    setHistory((current) =>
      [...current, { question: question.trim(), response }].slice(
        -PRIVATE_CHAT_LIMITS.history,
      ),
    );
    setQuestion("");
  };

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <MessageSquareText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">Private Document Chat</h1>
          <p className="tool-description">
            Build a temporary browser-memory index from local documents, ask a
            question, and inspect exact matching excerpts with page or section
            citations.
          </p>
        </div>
      </header>

      <div className="rounded-lg border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold text-foreground">
              No upload, cloud model, or invented answer
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Files, questions, and excerpts remain in this tab and disappear on
              reset or refresh. Results are deterministic retrieval matches, not
              generated summaries or verified facts.
            </p>
          </div>
        </div>
      </div>

      {!index ? (
        <section className="tool-card p-5 sm:p-6">
          <button
            type="button"
            className="flex min-h-56 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-soft p-6 text-center transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <span className="rounded-lg bg-primary-soft p-3 text-primary">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-4 font-bold text-foreground">
              {files.length
                ? `${files.length} document${files.length === 1 ? "" : "s"} selected`
                : "Choose up to 8 local documents"}
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              TXT, Markdown, CSV, JSON, text-based PDF, or DOCX • 20 MB total
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".txt,.md,.markdown,.csv,.json,.pdf,.docx,text/plain,text/csv,application/json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            aria-label="Choose local documents for private retrieval"
            disabled={busy}
            onChange={(event) => chooseFiles(event.target.files)}
          />

          {files.length ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
                >
                  <Files
                    className="h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={!files.length || busy}
              onClick={buildIndex}
            >
              <FileSearch className="h-4 w-4" aria-hidden="true" />
              {busy ? "Indexing locally…" : "Build private index"}
            </button>
            <button type="button" className="btn-secondary" onClick={clear}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="tool-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-foreground">
                  <BookOpenText
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Temporary local index ready
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {index.documents.length} document(s) • {index.chunks.length}{" "}
                  excerpt chunks • {index.totalCharacters.toLocaleString()}{" "}
                  characters
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={!report}
                  onClick={() => downloadJson(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export counts only
                </button>
                <button type="button" className="btn-secondary" onClick={clear}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Reset index
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {index.documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-lg border border-border bg-surface-soft p-4"
                >
                  <h3 className="truncate text-sm font-bold text-foreground">
                    {document.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {document.format} • {document.sections} section(s) •{" "}
                    {document.chunks} chunks
                  </p>
                  {document.warnings.length ? (
                    <p className="mt-2 text-xs text-warning">
                      {document.warnings.length} extraction notice(s)
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="tool-card p-4 sm:p-5">
            <form onSubmit={ask}>
              <label className="text-sm font-bold text-foreground">
                Ask with document-specific words
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  className="input-field min-w-0 flex-1"
                  value={question}
                  maxLength={PRIVATE_CHAT_LIMITS.queryCharacters}
                  placeholder="Example: When must a security incident be reported?"
                  onChange={(event) => setQuestion(event.target.value)}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!question.trim()}
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Find grounded excerpts
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-5" aria-live="polite">
            {history.map((entry, historyIndex) => (
              <article
                key={`${historyIndex}-${entry.question}`}
                className="tool-card overflow-hidden"
              >
                <div className="border-b border-border bg-surface-soft p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-primary">
                    Your question
                  </p>
                  <p className="mt-1 break-words font-bold text-foreground">
                    {entry.question}
                  </p>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <BotOff
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-bold text-foreground">
                        {entry.response.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        No answer was generated. Relevance scores rank lexical
                        matches and are not confidence or truth scores.
                      </p>
                    </div>
                  </div>

                  {entry.response.results.map((result) => (
                    <blockquote
                      key={result.chunkId}
                      className="rounded-lg border border-border bg-surface p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <cite className="not-italic text-xs font-bold text-primary">
                          {result.documentLabel} • {result.sectionLabel}
                        </cite>
                        <button
                          type="button"
                          className="btn-ghost min-h-10"
                          onClick={() =>
                            navigator.clipboard
                              ?.writeText(result.excerpt)
                              .catch(() => {})
                          }
                        >
                          <Copy className="h-4 w-4" aria-hidden="true" />
                          Copy excerpt
                        </button>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                        {result.excerpt}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Matched {result.matchedTerms} of {result.queryTermCount}{" "}
                        indexed query terms
                      </p>
                    </blockquote>
                  ))}
                </div>
              </article>
            ))}

            {!history.length ? (
              <div className="tool-card p-6 text-center">
                <Sparkles
                  className="mx-auto h-6 w-6 text-primary"
                  aria-hidden="true"
                />
                <p className="mt-3 font-bold text-foreground">
                  Ask your first question
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Specific names, terms, dates, and phrases produce better
                  grounded retrieval.
                </p>
              </div>
            ) : null}
          </section>
        </>
      )}

      {error ? (
        <div
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            {error}
          </div>
        </div>
      ) : null}

      <section className="tool-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          Method, privacy, and limitations
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            • Ranking uses bounded Unicode token matching, BM25-style term
            weighting, query-term coverage, and exact-phrase bonuses.
          </li>
          <li>
            • PDF extraction reads text layers only; scanned pages need reviewed
            OCR first. DOCX extraction reads text, not visual layout.
          </li>
          <li>
            • Results can omit synonyms, context, tables, images, or relevant
            passages. A retrieved passage can still be outdated or wrong.
          </li>
          <li>
            • Counts-only export excludes names, questions, text, excerpts, and
            index terms. Reset or refresh clears the in-memory index.
          </li>
        </ul>
      </section>
    </div>
  );
}
