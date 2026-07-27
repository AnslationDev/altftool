"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wand2 } from "lucide-react";

import { REPLACEMENT_MODES, removeEmoji } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-40 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");
const num = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);

const SAMPLE =
  "Big news 🎉🎉 our team 👨‍👩‍👧‍👦 just shipped v2 🚀\nAvailable in 🇮🇳 and 🇺🇸 from today ✅\nRated 5️⃣ stars ⭐ by early users 🙌🏽";

const DEFAULTS = {
  text: SAMPLE,
  mode: "remove",
  stripOtherSymbols: false,
  stripVariationSelectors: true,
  collapseSpaces: true,
  trimLines: true,
  dropEmptyLines: false,
  keepTextualSymbols: true,
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [stripOtherSymbols, setStripOtherSymbols] = useState(DEFAULTS.stripOtherSymbols);
  const [stripVariationSelectors, setStripVariationSelectors] = useState(DEFAULTS.stripVariationSelectors);
  const [collapseSpaces, setCollapseSpaces] = useState(DEFAULTS.collapseSpaces);
  const [trimLines, setTrimLines] = useState(DEFAULTS.trimLines);
  const [dropEmptyLines, setDropEmptyLines] = useState(DEFAULTS.dropEmptyLines);
  const [keepTextualSymbols, setKeepTextualSymbols] = useState(DEFAULTS.keepTextualSymbols);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      removeEmoji(text, {
        mode,
        stripOtherSymbols,
        stripVariationSelectors,
        collapseSpaces,
        trimLines,
        dropEmptyLines,
        keepTextualSymbols,
      }),
    [
      text,
      mode,
      stripOtherSymbols,
      stripVariationSelectors,
      collapseSpaces,
      trimLines,
      dropEmptyLines,
      keepTextualSymbols,
    ],
  );

  const hasError = Boolean(result.error);

  const reset = () => {
    setText(DEFAULTS.text);
    setMode(DEFAULTS.mode);
    setStripOtherSymbols(DEFAULTS.stripOtherSymbols);
    setStripVariationSelectors(DEFAULTS.stripVariationSelectors);
    setCollapseSpaces(DEFAULTS.collapseSpaces);
    setTrimLines(DEFAULTS.trimLines);
    setDropEmptyLines(DEFAULTS.dropEmptyLines);
    setKeepTextualSymbols(DEFAULTS.keepTextualSymbols);
    setCopied(false);
  };

  const copy = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Wand2 className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Emoji Remover
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Strip emoji, flags, skin-tone modifiers and keycaps out of text without leaving broken
          fragments behind. Whole emoji sequences are matched, so a family or a flag goes in one piece.
        </p>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="source-text">
          Paste your text
        </label>
        <textarea
          id="source-text"
          className={`${TEXTAREA_CLASS} mt-1`}
          value={text}
          rows={8}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="mode">
            Replace each emoji with
          </label>
          <select
            id="mode"
            className={`${INPUT_CLASS} mt-1`}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {Object.entries(REPLACEMENT_MODES).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className={LABEL_CLASS}>Also clean up</legend>
        <div className="mt-1 grid gap-1 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="opt-symbols">
            <input
              id="opt-symbols"
              type="checkbox"
              className={CHECKBOX}
              checked={stripOtherSymbols}
              onChange={(e) => setStripOtherSymbols(e.target.checked)}
            />
            Other symbols (★ ▣ ☞)
          </label>
          <label className={CHECK_ROW} htmlFor="opt-vs">
            <input
              id="opt-vs"
              type="checkbox"
              className={CHECKBOX}
              checked={stripVariationSelectors}
              onChange={(e) => setStripVariationSelectors(e.target.checked)}
            />
            Leftover variation selectors
          </label>
          <label className={CHECK_ROW} htmlFor="opt-collapse">
            <input
              id="opt-collapse"
              type="checkbox"
              className={CHECKBOX}
              checked={collapseSpaces}
              onChange={(e) => setCollapseSpaces(e.target.checked)}
            />
            Collapse double spaces
          </label>
          <label className={CHECK_ROW} htmlFor="opt-trim">
            <input
              id="opt-trim"
              type="checkbox"
              className={CHECKBOX}
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
            />
            Trim each line
          </label>
          <label className={CHECK_ROW} htmlFor="opt-blank">
            <input
              id="opt-blank"
              type="checkbox"
              className={CHECKBOX}
              checked={dropEmptyLines}
              onChange={(e) => setDropEmptyLines(e.target.checked)}
            />
            Drop lines left blank
          </label>
          <label className={CHECK_ROW} htmlFor="opt-textual">
            <input
              id="opt-textual"
              type="checkbox"
              className={CHECKBOX}
              checked={keepTextualSymbols}
              onChange={(e) => setKeepTextualSymbols(e.target.checked)}
            />
            Keep ©, ® and ™
          </label>
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the cleaned text to clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section
        aria-labelledby="result-heading"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2 id="result-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
          Emoji removed
        </h2>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {hasError ? DASH : num(result.emojiCount)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : result.clean
              ? "Nothing to strip — the text was already clean."
              : `${num(result.uniqueCount)} distinct emoji found.`}
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters before</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : num(result.charsBefore)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters after</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : num(result.charsAfter)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters removed</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError ? DASH : `${num(result.charsRemoved)} (${hasError ? DASH : result.percentRemoved}%)`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Other symbols removed</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : num(result.symbolsRemoved)}</dd>
          </div>
        </dl>

        {!hasError && result.uniqueEmoji.length > 0 ? (
          <p className="mt-4 break-words text-2xl leading-relaxed" aria-label="Emoji that were found">
            {result.uniqueEmoji.join(" ")}
          </p>
        ) : null}
      </section>

      <div className="mt-6">
        <label className={LABEL_CLASS} htmlFor="output-text">
          Cleaned text
        </label>
        <textarea
          id="output-text"
          className={`${TEXTAREA_CLASS} mt-1`}
          value={hasError ? "" : result.output}
          rows={8}
          readOnly
        />
      </div>

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Matching follows Unicode TR51 emoji sequences, so a flag (two regional indicators), a family
        (pictographs joined by zero width joiners) or a keycap counts as one emoji, not four characters.
        Everything runs in this browser tab.
      </p>
    </div>
  );
}
