"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Type } from "lucide-react";

import {
  GLYPH_HEIGHT,
  GLYPH_WIDTH,
  INK_STYLES,
  MAX_INPUT_CHARS,
  RENDER_STYLES,
  supportedCharacters,
  textToAsciiArt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  text: "HELLO",
  ink: "hash",
  customInk: "#",
  style: "solid",
  letterSpacing: "1",
  lineSpacing: "1",
  wrapAt: "12",
  useDots: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)]";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [ink, setInk] = useState(DEFAULTS.ink);
  const [customInk, setCustomInk] = useState(DEFAULTS.customInk);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [letterSpacing, setLetterSpacing] = useState(DEFAULTS.letterSpacing);
  const [lineSpacing, setLineSpacing] = useState(DEFAULTS.lineSpacing);
  const [wrapAt, setWrapAt] = useState(DEFAULTS.wrapAt);
  const [useDots, setUseDots] = useState(DEFAULTS.useDots);
  const [copied, setCopied] = useState(false);

  const inkChar =
    ink === "custom"
      ? (customInk || "#").slice(0, 1)
      : (INK_STYLES.find((s) => s.value === ink)?.char ?? "#");

  const result = useMemo(
    () =>
      textToAsciiArt({
        text,
        inkChar,
        blankChar: useDots ? "." : " ",
        shadowChar: ":",
        letterSpacing: Number(letterSpacing),
        lineSpacing: Number(lineSpacing),
        maxCharsPerLine: wrapAt.trim() === "" ? undefined : Number(wrapAt),
        style,
        trimRight: !useDots,
      }),
    [text, inkChar, useDots, letterSpacing, lineSpacing, wrapAt, style],
  );

  const error = result.error ? result.error : null;
  const ok = !error;

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the text, ink and style back to defaults? This clears what you typed.")
    ) {
      return;
    }
    setText(DEFAULTS.text);
    setInk(DEFAULTS.ink);
    setCustomInk(DEFAULTS.customInk);
    setStyle(DEFAULTS.style);
    setLetterSpacing(DEFAULTS.letterSpacing);
    setLineSpacing(DEFAULTS.lineSpacing);
    setWrapAt(DEFAULTS.wrapAt);
    setUseDots(DEFAULTS.useDots);
    setCopied(false);
  };

  const copy = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.art);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <Type className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Text to ASCII Art</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Turn a word into big banner letters built from a {GLYPH_WIDTH} × {GLYPH_HEIGHT}
            {" "}bitmap font. Pick the ink character, spacing and outline or shadow styling.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="taa-text">
            Text
          </label>
          <input
            id="taa-text"
            className={`${INPUT_CLASS} mt-1`}
            value={text}
            maxLength={MAX_INPUT_CHARS}
            onChange={(e) => setText(e.target.value)}
          />
          <p className={HINT_CLASS}>
            Letters, digits and common punctuation. Up to {MAX_INPUT_CHARS} characters.
          </p>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="taa-ink">
            Ink character
          </label>
          <select
            id="taa-ink"
            className={`${INPUT_CLASS} mt-1`}
            value={ink}
            onChange={(e) => setInk(e.target.value)}
          >
            {INK_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {ink === "custom" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="taa-custom">
              Your character
            </label>
            <input
              id="taa-custom"
              className={`${INPUT_CLASS} mt-1`}
              value={customInk}
              maxLength={1}
              onChange={(e) => setCustomInk(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="taa-style">
              Style
            </label>
            <select
              id="taa-style"
              className={`${INPUT_CLASS} mt-1`}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {RENDER_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={LABEL_CLASS} htmlFor="taa-letter">
            Space between letters
          </label>
          <select
            id="taa-letter"
            className={`${INPUT_CLASS} mt-1`}
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(e.target.value)}
          >
            {["0", "1", "2", "3", "4"].map((n) => (
              <option key={n} value={n}>
                {n} column{n === "1" ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="taa-line">
            Space between lines
          </label>
          <select
            id="taa-line"
            className={`${INPUT_CLASS} mt-1`}
            value={lineSpacing}
            onChange={(e) => setLineSpacing(e.target.value)}
          >
            {["0", "1", "2", "3"].map((n) => (
              <option key={n} value={n}>
                {n} row{n === "1" ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="taa-wrap">
            Wrap after
          </label>
          <input
            id="taa-wrap"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="numeric"
            value={wrapAt}
            onChange={(e) => setWrapAt(e.target.value)}
          />
          <p className={HINT_CLASS}>Characters per banner line, 1 to 60.</p>
        </div>

        {ink === "custom" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="taa-style2">
              Style
            </label>
            <select
              id="taa-style2"
              className={`${INPUT_CLASS} mt-1`}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {RENDER_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <label className={`${CHECK_ROW} sm:col-span-2`} htmlFor="taa-dots">
          <input
            id="taa-dots"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={useDots}
            onChange={(e) => setUseDots(e.target.checked)}
          />
          Fill the background with dots instead of spaces
        </label>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">ASCII art</p>
        <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <pre className="w-max font-mono text-[10px] leading-[1.15] text-[var(--foreground)] sm:text-xs">
            {ok ? result.art : DASH}
          </pre>
        </div>

        {ok && result.unsupported.length > 0 ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            This font has no glyph for {result.unsupported.join(" ")} — a question mark was drawn instead.
          </p>
        ) : null}

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Output size</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${NUM.format(result.width)} × ${NUM.format(result.height)} characters` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Banner lines</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? NUM.format(result.textLines.length) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Glyph cell</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? result.glyphSize : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Characters in</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? NUM.format(result.characters) : DASH}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={GHOST_BTN} onClick={copy} aria-label="Copy the ASCII art to the clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={PRIMARY_BTN} onClick={reset} aria-label="Reset all inputs to their defaults">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--foreground)]">Characters this font covers</h2>
        <p className="mt-2 break-words font-mono text-sm text-[var(--muted-foreground)]">
          {supportedCharacters().join(" ")}
        </p>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Lower-case input is drawn with the upper-case glyph. Paste the result into a code
          comment, a README, a terminal banner or a chat message that uses a monospaced font —
          proportional fonts will distort the alignment.
        </p>
      </section>
    </div>
  );
}
