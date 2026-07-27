"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smile } from "lucide-react";

import { stripPromptEmoji } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULT_TEXT = `🚀 You are a senior product marketer.
✅ Write three headline options for the new pricing page.
✅ Each headline must be under 60 characters.
❌ Do not use the words "revolutionary" or "seamless".
👉 Return them as a numbered list.`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [removeEmoji, setRemoveEmoji] = useState(true);
  const [removeInvisible, setRemoveInvisible] = useState(true);
  const [removeDecorative, setRemoveDecorative] = useState(true);
  const [removeVariationSelectors, setRemoveVariationSelectors] = useState(true);
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);
  const [replacement, setReplacement] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      stripPromptEmoji({
        text,
        removeEmoji,
        removeInvisible,
        removeDecorative,
        removeVariationSelectors,
        collapseWhitespace,
        replacement,
      }),
    [
      text,
      removeEmoji,
      removeInvisible,
      removeDecorative,
      removeVariationSelectors,
      collapseWhitespace,
      replacement,
    ],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULT_TEXT);
    setRemoveEmoji(true);
    setRemoveInvisible(true);
    setRemoveDecorative(true);
    setRemoveVariationSelectors(true);
    setCollapseWhitespace(true);
    setReplacement("");
    setCopied(false);
  };

  const rows = [
    ["Emoji removed", hasError ? DASH : NUM.format(result.emojiRemoved)],
    ["Decorative symbols removed", hasError ? DASH : NUM.format(result.decorativeRemoved)],
    ["Invisible characters removed", hasError ? DASH : NUM.format(result.invisibleRemoved)],
    ["Variation selectors stripped", hasError ? DASH : NUM.format(result.variationStripped)],
    [
      "Characters",
      hasError ? DASH : `${NUM.format(result.charsBefore)} → ${NUM.format(result.charsAfter)}`,
    ],
    [
      "UTF-8 bytes",
      hasError
        ? DASH
        : `${NUM.format(result.bytesBefore)} → ${NUM.format(result.bytesAfter)} (−${NUM.format(result.bytesSaved)})`,
    ],
    [
      "Estimated tokens saved",
      hasError
        ? DASH
        : result.tokensSavedLow === result.tokensSavedHigh
          ? NUM.format(result.tokensSavedLow)
          : `${NUM.format(result.tokensSavedLow)} to ${NUM.format(result.tokensSavedHigh)}`,
    ],
  ];

  const toggles = [
    ["strip-emoji", "Remove emoji and pictographs", removeEmoji, setRemoveEmoji],
    ["strip-invisible", "Remove invisible characters", removeInvisible, setRemoveInvisible],
    ["strip-decorative", "Remove decorative symbols", removeDecorative, setRemoveDecorative],
    [
      "strip-variation",
      "Strip variation selectors",
      removeVariationSelectors,
      setRemoveVariationSelectors,
    ],
    ["strip-space", "Tidy leftover spacing", collapseWhitespace, setCollapseWhitespace],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smile className="h-4 w-4" aria-hidden="true" />
          Prompt utilities
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Prompt Emoji Stripper</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Removes emoji, ornament and the invisible zero-width characters that text pasted from a
          web page drags along. Emoji are matched by the Unicode Extended_Pictographic property and
          counted as whole grapheme clusters, so a flag or a skin-tone sequence counts once.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="emoji-text">
          Your prompt
        </label>
        <textarea
          id="emoji-text"
          className={`mt-2 ${AREA_CLASS}`}
          rows={7}
          spellCheck={false}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setCopied(false);
          }}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {toggles.map(([id, label, value, setter]) => (
            <label key={id} className="flex min-h-11 items-center gap-2 text-sm" htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                className={CHECK_CLASS}
                checked={value}
                onChange={(event) => {
                  setter(event.target.checked);
                  setCopied(false);
                }}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="emoji-replacement">
            Replace each removed symbol with (optional)
          </label>
          <input
            id="emoji-replacement"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            type="text"
            maxLength={16}
            placeholder="leave blank to delete"
            value={replacement}
            onChange={(event) => {
              setReplacement(event.target.value);
              setCopied(false);
            }}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Useful when an emoji was carrying meaning — a status marker or a list bullet.
          </p>
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
              Symbols removed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.symbolsRemoved)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Paste a prompt to strip."
                : `${NUM.format(result.bytesSaved)} UTF-8 bytes lighter`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the stripped prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the prompt and all options"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="whitespace-pre-wrap break-words p-3 text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.output || DASH}
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
            >
              {warning}
            </p>
          ))}
      </section>

      {!hasError && result.removedSamples.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What was taken out</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.removedSamples.map((item) => (
              <span
                key={item.symbol}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--muted)] px-3 text-sm"
              >
                <span aria-hidden="true">{item.symbol}</span>
                <span className="font-semibold text-[var(--muted-foreground)]">
                  ×{NUM.format(item.count)}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Byte counts are exact. The token figure is a range because tokenisation is model-specific: a
        single emoji costs roughly one to four tokens in common byte-pair vocabularies, so check the
        saving against your own model&apos;s counter before relying on it.
      </p>
    </main>
  );
}
