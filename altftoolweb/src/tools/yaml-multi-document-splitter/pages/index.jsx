"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, Split } from "lucide-react";

import { joinYamlDocuments, splitYamlDocuments, suggestFileNames } from "../lib";

const SAMPLE = `apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: web
          image: ghcr.io/acme/web:1.4.2
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
data:
  motd: |
    Release notes
    ---
    This --- is literal text, not a separator.
`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [source, setSource] = useState(SAMPLE);
  const [prefix, setPrefix] = useState("doc");
  const [extension, setExtension] = useState("yaml");
  const [useLabels, setUseLabels] = useState(true);
  const [leadingSeparator, setLeadingSeparator] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const result = useMemo(() => splitYamlDocuments(source), [source]);

  const names = useMemo(() => {
    if (result.error) return [];
    return suggestFileNames(result.documents, { prefix, extension, useLabels });
  }, [result, prefix, extension, useLabels]);

  const rejoined = useMemo(() => {
    if (result.error) return { error: result.error };
    return joinYamlDocuments(
      result.documents.map((doc) => doc.content),
      { leadingSeparator },
    );
  }, [result, leadingSeparator]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `YAML documents found: ${result.count}`,
      `Valid: ${result.validCount} · Invalid: ${result.invalidCount}`,
      `Total lines scanned: ${result.totalLines}`,
      "",
      ...result.documents.map(
        (doc, i) =>
          `${names[i]} — lines ${doc.startLine}-${doc.endLine}${doc.error ? ` (error: ${doc.error})` : ""}`,
      ),
    ].join("\n");
  }, [result, names]);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  };

  const reset = () => {
    setSource(SAMPLE);
    setPrefix("doc");
    setExtension("yaml");
    setUseLabels(true);
    setLeadingSeparator(false);
    setCopiedKey("");
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Split className="h-4 w-4" aria-hidden="true" />
          YAML streams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          YAML Multi Document Splitter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split a multi-document YAML stream on its <code>---</code> markers, validate each
          document, get a suggested file name per document, and recombine them again. Separators
          inside block scalars are left alone.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="yaml-source">
          Multi-document YAML
        </label>
        <textarea
          id="yaml-source"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={12}
          spellCheck={false}
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="yaml-prefix">
              Fallback file-name prefix
            </label>
            <input
              id="yaml-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="yaml-ext">
              File extension
            </label>
            <input
              id="yaml-ext"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={extension}
              onChange={(event) => setExtension(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label
            className="flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="yaml-labels"
          >
            <input
              id="yaml-labels"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={useLabels}
              onChange={(event) => setUseLabels(event.target.checked)}
            />
            Name files from <code>kind</code> and <code>metadata.name</code> when present
          </label>
          <label
            className="flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="yaml-lead"
          >
            <input
              id="yaml-lead"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={leadingSeparator}
              onChange={(event) => setLeadingSeparator(event.target.checked)}
            />
            Start the recombined stream with an explicit <code>---</code>
          </label>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Documents found
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : result.count}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? dash : `${result.totalLines} lines scanned`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("summary", summary)}
              aria-label="Copy split summary"
              className={GHOST_BTN}
            >
              {copiedKey === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedKey === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the splitter to the sample YAML"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Documents", result.error ? dash : String(result.count)],
            ["Parsed without error", result.error ? dash : String(result.validCount)],
            ["Failed to parse", result.error ? dash : String(result.invalidCount)],
            [
              "Named from kind/metadata",
              result.error
                ? dash
                : String(result.documents.filter((doc) => Boolean(doc.label)).length),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 grid gap-4">
          {result.documents.map((doc, i) => (
            <article
              key={`${doc.startLine}-${doc.index}`}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-mono text-sm font-semibold">{names[i]}</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Document {doc.index + 1} · lines {doc.startLine}–{doc.endLine} ·{" "}
                    {doc.lineCount} line{doc.lineCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(`doc-${doc.index}`, doc.content)}
                  aria-label={`Copy ${names[i]}`}
                  className={GHOST_BTN}
                >
                  {copiedKey === `doc-${doc.index}` ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedKey === `doc-${doc.index}` ? "Copied!" : "Copy"}
                </button>
              </div>

              {doc.error ? (
                <p
                  role="alert"
                  className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  <AlertTriangle className="mr-2 inline h-4 w-4" aria-hidden="true" />
                  {doc.error}
                </p>
              ) : null}

              <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
                <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
                  {doc.content}
                </pre>
              </div>
            </article>
          ))}
        </section>
      )}

      {!result.error && !rejoined.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Recombined stream</h2>
            <button
              type="button"
              onClick={() => copy("joined", rejoined.output)}
              aria-label="Copy the recombined YAML stream"
              className={GHOST_BTN}
            >
              {copiedKey === "joined" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedKey === "joined" ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {rejoined.output}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser — nothing is uploaded. Comments and blank lines are kept
        exactly as written, and anchors defined in one document are not shared with another once
        split, because YAML anchors do not cross document boundaries.
      </p>
    </main>
  );
}
