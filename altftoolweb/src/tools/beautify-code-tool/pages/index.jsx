"use client";

import { useMemo, useRef, useState } from "react";
import { Braces, Check, Copy, Download, RotateCcw, Wand2 } from "lucide-react";

import { processCode, detectLanguage, LANGUAGES, MODES, INDENT_SIZES, MAX_INPUT_CHARS } from "../lib";

const CONTROL_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  code: 'function greet(name){const parts=[name,"from AltFTool"];if(!name){return "hello"}\nreturn parts.join(" ")}',
  language: "javascript",
  mode: "beautify",
  indentSize: 2,
  uppercaseKeywords: true,
};

const DASH = "—";
const integer = new Intl.NumberFormat("en-US");
const oneDecimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [code, setCode] = useState(DEFAULTS.code);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [indentSize, setIndentSize] = useState(DEFAULTS.indentSize);
  const [uppercaseKeywords, setUppercaseKeywords] = useState(DEFAULTS.uppercaseKeywords);
  const [copied, setCopied] = useState("");
  const copyTimer = useRef(null);

  const result = useMemo(
    () => processCode({ code, language, mode, indentSize, uppercaseKeywords }),
    [code, language, mode, indentSize, uppercaseKeywords],
  );
  const failed = Boolean(result.error);

  const copy = async () => {
    if (failed || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied("output");
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const download = () => {
    if (failed) return;
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setCode(DEFAULTS.code);
    setLanguage(DEFAULTS.language);
    setMode(DEFAULTS.mode);
    setIndentSize(DEFAULTS.indentSize);
    setUppercaseKeywords(DEFAULTS.uppercaseKeywords);
    setCopied("");
  };

  const sizeChange = failed
    ? DASH
    : result.bytesSaved >= 0
      ? `${integer.format(result.bytesSaved)} bytes smaller`
      : `${integer.format(-result.bytesSaved)} bytes larger`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Braces aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Code Beautifier
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Re-indent or compact JavaScript, JSON, CSS, HTML, XML and SQL. JSON is validated and the exact line and
          column of any syntax error is reported; SQL is re-laid-out one clause per line. Everything runs in your
          browser, so nothing is uploaded.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className={LABEL_CLASS} htmlFor="code-in">
              Your code
            </label>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              onClick={() => setLanguage(detectLanguage(code))}
              aria-label="Detect the language of the pasted code"
            >
              <Wand2 aria-hidden="true" className="h-4 w-4" />
              Detect language
            </button>
          </div>
          <textarea
            id="code-in"
            className={`${TEXTAREA_CLASS} mt-1.5 min-h-44`}
            value={code}
            spellCheck={false}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste a snippet here"
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            Limit {integer.format(MAX_INPUT_CHARS)} characters.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="code-lang">
              Language
            </label>
            <select
              id="code-lang"
              className={`${CONTROL_CLASS} mt-1.5`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="code-mode">
              Action
            </label>
            <select
              id="code-mode"
              className={`${CONTROL_CLASS} mt-1.5`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {MODES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="code-indent">
              Indent width
            </label>
            <select
              id="code-indent"
              className={`${CONTROL_CLASS} mt-1.5`}
              value={indentSize}
              onChange={(event) => setIndentSize(Number(event.target.value))}
              disabled={mode === "minify"}
            >
              {INDENT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} spaces
                </option>
              ))}
            </select>
          </div>
          <div className="grid content-end">
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="code-upper">
              <input
                id="code-upper"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={uppercaseKeywords}
                onChange={(event) => setUppercaseKeywords(event.target.checked)}
                disabled={language !== "sql"}
              />
              Uppercase SQL keywords
            </label>
          </div>
        </div>

        {failed ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Output lines
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            {failed ? DASH : integer.format(result.outputLines)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{sizeChange}</p>

          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="code-out">
              Formatted code
            </label>
            <textarea
              id="code-out"
              readOnly
              className={`${TEXTAREA_CLASS} mt-1.5 min-h-44`}
              value={failed ? "" : result.output}
              placeholder={DASH}
            />
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Input size</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `${integer.format(result.inputBytes)} bytes`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Output size</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `${integer.format(result.outputBytes)} bytes`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Input lines</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.inputLines)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Size change</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `${oneDecimal.format(result.percentChange)}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Language used</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : (LANGUAGES.find((entry) => entry.key === result.language) || {}).label}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Download name</dt>
              <dd className="font-mono text-xs font-semibold text-[var(--foreground)]">
                {failed ? DASH : result.fileName}
              </dd>
            </div>
          </dl>

          {!failed && result.mode === "minify" && result.language === "javascript" ? (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              JavaScript is compacted safely: comments and indentation go, but line breaks stay, so automatic semicolon
              insertion behaves exactly as before. For maximum compression run a real minifier in your build.
            </p>
          ) : null}
          {!failed && result.language === "json" ? (
            <p className="mt-3 text-xs text-[var(--success)]">Valid JSON — it parsed without errors.</p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={copy}
              disabled={failed}
              aria-label="Copy the formatted code to the clipboard"
            >
              {copied === "output" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "output" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={download}
              disabled={failed}
              aria-label="Download the formatted code as a file"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Download
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset to the default example">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
