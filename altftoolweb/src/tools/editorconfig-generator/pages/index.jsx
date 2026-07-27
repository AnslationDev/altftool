"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Settings2 } from "lucide-react";

import {
  CHARSETS,
  END_OF_LINE_VALUES,
  INDENT_STYLES,
  MAX_INDENT_SIZE,
  SECTION_PRESETS,
  buildEditorConfig,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULT_GLOBAL = {
  indentStyle: "space",
  indentSize: "2",
  endOfLine: "lf",
  charset: "utf-8",
  trimTrailing: true,
  finalNewline: true,
  maxLineLength: "",
};

const DEFAULT_PRESETS = ["makefile", "markdown"];

export default function ToolHome() {
  const [global, setGlobal] = useState(DEFAULT_GLOBAL);
  const [root, setRoot] = useState(true);
  const [presetIds, setPresetIds] = useState(DEFAULT_PRESETS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setGlobal((current) => ({ ...current, [key]: value }));

  const togglePreset = (id) =>
    setPresetIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(() => {
    const globalProps = {
      indent_style: global.indentStyle,
      end_of_line: global.endOfLine,
      charset: global.charset,
      trim_trailing_whitespace: global.trimTrailing,
      insert_final_newline: global.finalNewline,
    };
    if (global.indentStyle === "space") {
      globalProps.indent_size = global.indentSize === "" ? "" : Number(global.indentSize);
    }
    if (global.maxLineLength !== "") {
      globalProps.max_line_length =
        global.maxLineLength === "off" ? "off" : Number(global.maxLineLength);
    }
    const sections = SECTION_PRESETS.filter((preset) => presetIds.includes(preset.id)).map(
      (preset) => ({ glob: preset.glob, props: preset.props }),
    );
    return buildEditorConfig({ root, global: globalProps, sections });
  }, [global, root, presetIds]);

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGlobal(DEFAULT_GLOBAL);
    setRoot(true);
    setPresetIds(DEFAULT_PRESETS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          Editor settings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">EditorConfig Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a <code>.editorconfig</code> that keeps indentation, charset, line endings and
          whitespace consistent across every editor and IDE on the team — with sensible per-file-type
          sections for Makefiles, Markdown, YAML, Python, Go and more.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Global rules — the [*] section</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-style">
              Indent style
            </label>
            <select
              id="ec-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={global.indentStyle}
              onChange={(event) => set("indentStyle", event.target.value)}
            >
              {INDENT_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
          {global.indentStyle === "space" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="ec-size">
                Indent size (spaces)
              </label>
              <input
                id="ec-size"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max={MAX_INDENT_SIZE}
                step="1"
                value={global.indentSize}
                onChange={(event) => set("indentSize", event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-eol">
              Line endings
            </label>
            <select
              id="ec-eol"
              className={`mt-2 ${INPUT_CLASS}`}
              value={global.endOfLine}
              onChange={(event) => set("endOfLine", event.target.value)}
            >
              {END_OF_LINE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-charset">
              Charset
            </label>
            <select
              id="ec-charset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={global.charset}
              onChange={(event) => set("charset", event.target.value)}
            >
              {CHARSETS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-maxlen">
              Max line length (blank = unset, or &quot;off&quot;)
            </label>
            <input
              id="ec-maxlen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              placeholder="e.g. 120"
              value={global.maxLineLength}
              onChange={(event) => set("maxLineLength", event.target.value.trim())}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ec-trim">
            <input
              id="ec-trim"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={global.trimTrailing}
              onChange={(event) => set("trimTrailing", event.target.checked)}
            />
            Trim trailing whitespace
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ec-final">
            <input
              id="ec-final"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={global.finalNewline}
              onChange={(event) => set("finalNewline", event.target.checked)}
            />
            Insert final newline
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="ec-root">
            <input
              id="ec-root"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={root}
              onChange={(event) => setRoot(event.target.checked)}
            />
            Top-most file (<code>root = true</code>)
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Per-file-type sections</h2>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          {SECTION_PRESETS.map((preset) => (
            <label
              key={preset.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`ec-sec-${preset.id}`}
            >
              <input
                id={`ec-sec-${preset.id}`}
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={presetIds.includes(preset.id)}
                onChange={() => togglePreset(preset.id)}
              />
              <span>
                {preset.label}{" "}
                <code className="text-xs text-[var(--muted-foreground)]">{preset.glob}</code>
              </span>
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated file
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">.editorconfig</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.sectionCount} section${result.sectionCount === 1 ? "" : "s"} including [*]`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated .editorconfig"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy file"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to defaults" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
          <pre className="p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.text}</code>
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Save as <code>.editorconfig</code> in your repository root. Editors read every
        .editorconfig from the file&apos;s directory upward until one says <code>root = true</code>,
        with closer files winning — VS Code needs the EditorConfig extension; most JetBrains IDEs,
        Vim and Neovim support it natively.
      </p>
    </main>
  );
}
