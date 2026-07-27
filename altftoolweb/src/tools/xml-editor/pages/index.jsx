"use client";

import { useMemo, useState } from "react";
import { Check, Code, Copy, RotateCcw } from "lucide-react";

import { INDENT_OPTIONS, formatXml, minifyXml, parseXml } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="urn:example:catalog"><book id="1" lang="en"><title>Dune</title><price currency="INR">499</price><tags><tag>scifi</tag><tag>classic</tag></tags></book><!-- awaiting stock --><book id="2"><title>Neuromancer</title><cover/></book></catalog>`;

const numberFmt = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [xml, setXml] = useState(DEFAULT_XML);
  const [mode, setMode] = useState("format");
  const [indentId, setIndentId] = useState("2");
  const [keepComments, setKeepComments] = useState(false);
  const [copied, setCopied] = useState(false);

  const indent = (INDENT_OPTIONS.find((option) => option.id === indentId) ?? INDENT_OPTIONS[0]).value;

  const result = useMemo(() => {
    if (mode === "format") return formatXml({ xml, indent });
    return minifyXml({ xml, keepComments });
  }, [xml, mode, indent, keepComments]);

  const parsed = useMemo(() => parseXml(xml), [xml]);

  const error = result.error ?? null;
  const output = error ? "" : result.output;

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const applyToEditor = () => {
    if (!error) setXml(output);
    setCopied(false);
  };

  const handleReset = () => {
    setXml(DEFAULT_XML);
    setMode("format");
    setIndentId("2");
    setKeepComments(false);
    setCopied(false);
  };

  const dash = "—";
  const stats = error ? null : result.stats;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Code className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">XML Editor</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Format, minify and validate XML in your browser. Mismatched tags are reported with
            a line number; CDATA, comments, DOCTYPE and processing instructions are preserved.
          </p>
        </div>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="xml-input">
          XML source
        </label>
        <textarea
          id="xml-input"
          rows={10}
          spellCheck={false}
          className={`${TEXTAREA_CLASS} mt-1.5`}
          value={xml}
          onChange={(event) => setXml(event.target.value)}
          placeholder="Paste XML…"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="mode-select">
            Action
          </label>
          <select
            id="mode-select"
            className={`${INPUT_CLASS} mt-1.5`}
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            <option value="format">Format (pretty print)</option>
            <option value="minify">Minify</option>
          </select>
        </div>
        {mode === "format" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="indent-select">
              Indent
            </label>
            <select
              id="indent-select"
              className={`${INPUT_CLASS} mt-1.5`}
              value={indentId}
              onChange={(event) => setIndentId(event.target.value)}
            >
              {INDENT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-end">
            <label
              className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]"
              htmlFor="keep-comments"
            >
              <input
                id="keep-comments"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={keepComments}
                onChange={(event) => setKeepComments(event.target.checked)}
              />
              Keep comments
            </label>
          </div>
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
          {result.line ? ` (line ${result.line})` : ""}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {error ? "Not well-formed" : mode === "format" ? "Formatted XML" : "Minified XML"}
        </p>
        <p className="mt-1 text-4xl font-bold text-[var(--foreground)]">
          {error ? dash : `${numberFmt.format(stats.elementCount)} elements`}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--success)]">
          {error ? dash : "Well-formed XML"}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Unique tags</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.uniqueTags) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Attributes</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.attributeCount) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Max nesting depth</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.maxDepth) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Comments / CDATA</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? `${stats.commentCount} / ${stats.cdataCount}` : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Input characters</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.characters) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              {mode === "minify" ? "Saved" : "Output characters"}
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : mode === "minify"
                  ? `${numberFmt.format(result.savedCharacters)} (${result.savedPercent}%)`
                  : numberFmt.format(stats.outputCharacters)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <label className={LABEL_CLASS} htmlFor="xml-output">
            Result
          </label>
          <textarea
            id="xml-output"
            readOnly
            rows={10}
            spellCheck={false}
            className={`${TEXTAREA_CLASS} mt-1.5`}
            value={error ? "—" : output}
          />
        </div>
      </section>

      {!parsed.error && parsed.stats.tagCounts.length > 0 ? (
        <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Element counts
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Element</th>
                  <th scope="col" className="py-2 font-semibold">Occurrences</th>
                </tr>
              </thead>
              <tbody>
                {parsed.stats.tagCounts.map((tag) => (
                  <tr key={tag.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono text-[var(--foreground)]">{tag.name}</td>
                    <td className="py-2 text-[var(--foreground)]">{numberFmt.format(tag.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy the result to clipboard"
          disabled={!output}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button
          type="button"
          className={GHOST_BTN}
          onClick={applyToEditor}
          aria-label="Replace the source with the result"
          disabled={!output}
        >
          Apply to source
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset to the sample document">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        This checks well-formedness (matching tags, one root, valid constructs). It does not
        validate against a DTD or XSD. Nothing you paste leaves this page.
      </p>
    </div>
  );
}
