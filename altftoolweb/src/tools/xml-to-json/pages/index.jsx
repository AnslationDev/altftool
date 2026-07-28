"use client";

import { useEffect, useMemo, useState } from "react";
import { Braces, Check, Copy, Download, RotateCcw, Upload } from "lucide-react";

import {
  DEFAULT_ATTRIBUTE_PREFIX,
  DEFAULT_TEXT_KEY,
  INDENT_OPTIONS,
  MAX_INPUT_BYTES,
  SAMPLE_XML,
  xmlToJson,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full min-h-56 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

const INDENT_LABEL = { 0: "Minified (no indent)", 2: "2 spaces", 4: "4 spaces" };

export default function ToolHome() {
  const [xml, setXml] = useState(SAMPLE_XML);
  const [indent, setIndent] = useState(2);
  const [attributePrefix, setAttributePrefix] = useState(DEFAULT_ATTRIBUTE_PREFIX);
  const [textKey, setTextKey] = useState(DEFAULT_TEXT_KEY);
  const [keepAttributes, setKeepAttributes] = useState(true);
  const [parseNumbers, setParseNumbers] = useState(true);
  const [wrapRoot, setWrapRoot] = useState(true);
  const [fileName, setFileName] = useState("");
  const [readError, setReadError] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      xmlToJson(xml, {
        indent,
        attributePrefix,
        textKey: textKey || DEFAULT_TEXT_KEY,
        keepAttributes,
        parseNumbers,
        parseBooleans: parseNumbers,
        wrapRoot,
      }),
    [xml, indent, attributePrefix, textKey, keepAttributes, parseNumbers, wrapRoot],
  );

  const error = readError || result.error || null;

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_INPUT_BYTES) {
      setReadError(`"${file.name}" is larger than the ${Math.round(MAX_INPUT_BYTES / 1024 / 1024)} MB limit.`);
      return;
    }
    try {
      const text = await file.text();
      setXml(text);
      setFileName(file.name);
      setReadError("");
    } catch {
      setReadError("That file could not be read in this browser.");
    }
  };

  const download = () => {
    if (result.error) return;
    const base = fileName.replace(/\.xml$/i, "") || result.rootName || "data";
    const blob = new Blob([result.json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${base}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.json);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setXml(SAMPLE_XML);
    setIndent(2);
    setAttributePrefix(DEFAULT_ATTRIBUTE_PREFIX);
    setTextKey(DEFAULT_TEXT_KEY);
    setKeepAttributes(true);
    setParseNumbers(true);
    setWrapRoot(true);
    setFileName("");
    setReadError("");
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Braces className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          XML to JSON
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Convert an XML document into clean JSON in your browser — repeated tags become arrays,
          attributes get a prefix, and nothing is uploaded.
        </p>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="x2j-xml">
          XML input
        </label>
        <textarea
          id="x2j-xml"
          className={`${TEXTAREA_CLASS} mt-1`}
          value={xml}
          onChange={(event) => {
            setXml(event.target.value);
            setReadError("");
          }}
          spellCheck={false}
          placeholder="<library><book isbn='1'><title>…</title></book></library>"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="x2j-indent">
            Indentation
          </label>
          <select
            id="x2j-indent"
            className={`${INPUT_CLASS} mt-1`}
            value={String(indent)}
            onChange={(event) => setIndent(Number(event.target.value))}
          >
            {INDENT_OPTIONS.map((option) => (
              <option key={option} value={String(option)}>
                {INDENT_LABEL[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="x2j-prefix">
            Attribute prefix
          </label>
          <input
            id="x2j-prefix"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={attributePrefix}
            onChange={(event) => setAttributePrefix(event.target.value)}
            maxLength={4}
            placeholder="@_"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="x2j-textkey">
            Text key for mixed content
          </label>
          <input
            id="x2j-textkey"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={textKey}
            onChange={(event) => setTextKey(event.target.value)}
            maxLength={16}
            placeholder="#text"
          />
        </div>

        <div>
          <span className={LABEL_CLASS}>Options</span>
          <div className="mt-1 flex flex-col gap-1">
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2j-attrs">
              <input
                id="x2j-attrs"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={keepAttributes}
                onChange={(event) => setKeepAttributes(event.target.checked)}
              />
              Keep attributes
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2j-numbers">
              <input
                id="x2j-numbers"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={parseNumbers}
                onChange={(event) => setParseNumbers(event.target.checked)}
              />
              Parse numbers and true/false
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2j-wrap">
              <input
                id="x2j-wrap"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={wrapRoot}
                onChange={(event) => setWrapRoot(event.target.checked)}
              />
              Keep the root element as a key
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className={GHOST_BTN} htmlFor="x2j-file">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload .xml
          <input id="x2j-file" type="file" accept=".xml,text/xml,application/xml" className="sr-only" onChange={onFile} />
        </label>
        <button type="button" className={PRIMARY_BTN} onClick={copy} disabled={Boolean(error)} aria-label="Copy the JSON output to the clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={download} disabled={Boolean(error)} aria-label="Download the JSON file">
          <Download className="h-4 w-4" aria-hidden="true" />
          Download .json
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset to the sample XML document">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {fileName ? <span className="text-xs text-[var(--muted-foreground)]">{fileName}</span> : null}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Elements converted</p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--foreground)]">
          {error ? DASH : NUM.format(result.elements)}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Root element</dt>
            <dd className="font-mono text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `<${result.rootName}>`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Attributes</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : NUM.format(result.attributes)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Deepest nesting</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${NUM.format(result.depth)} levels`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">JSON size</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${NUM.format(result.bytes)} characters`}
            </dd>
          </div>
        </dl>
      </section>

      {!error ? (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">JSON output</h2>
          <pre className="max-h-[32rem] overflow-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs leading-relaxed text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {result.json}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
