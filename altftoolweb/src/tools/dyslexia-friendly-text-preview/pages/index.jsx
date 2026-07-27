"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Check, Copy, RotateCcw } from "lucide-react";

import {
  ALIGNMENTS,
  BDA_GUIDE,
  evaluateSettings,
  readability,
  RECOMMENDED_FACES,
  toCssBlock,
  WCAG_TEXT_SPACING,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const SAMPLE =
  "Reading is easier when a line is short enough to scan in one go. Generous spacing between letters, words and lines gives the eye a clear path back to the start of the next line. Bold carries emphasis better than italics, and a left-aligned column avoids the uneven gaps that justified text creates.\n\nChange any control above and this paragraph updates immediately.";

const DEFAULTS = {
  text: SAMPLE,
  faceId: "verdana",
  fontSizePx: "19",
  lineHeight: "1.5",
  letterSpacingEm: "0.12",
  wordSpacingEm: "0.16",
  paragraphSpacingEm: "2",
  columnWidthPx: "700",
  align: "left",
  allCaps: false,
  italic: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[7rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [faceId, setFaceId] = useState(DEFAULTS.faceId);
  const [fontSizePx, setFontSizePx] = useState(DEFAULTS.fontSizePx);
  const [lineHeight, setLineHeight] = useState(DEFAULTS.lineHeight);
  const [letterSpacingEm, setLetterSpacingEm] = useState(DEFAULTS.letterSpacingEm);
  const [wordSpacingEm, setWordSpacingEm] = useState(DEFAULTS.wordSpacingEm);
  const [paragraphSpacingEm, setParagraphSpacingEm] = useState(DEFAULTS.paragraphSpacingEm);
  const [columnWidthPx, setColumnWidthPx] = useState(DEFAULTS.columnWidthPx);
  const [align, setAlign] = useState(DEFAULTS.align);
  const [allCaps, setAllCaps] = useState(DEFAULTS.allCaps);
  const [italic, setItalic] = useState(DEFAULTS.italic);
  const [copied, setCopied] = useState(false);

  const face = RECOMMENDED_FACES.find((item) => item.id === faceId) || RECOMMENDED_FACES[0];

  const evaluation = useMemo(
    () =>
      evaluateSettings({
        fontSizePx,
        lineHeight,
        letterSpacingEm,
        wordSpacingEm,
        paragraphSpacingEm,
        columnWidthPx,
        align,
        allCaps,
        italic,
      }),
    [fontSizePx, lineHeight, letterSpacingEm, wordSpacingEm, paragraphSpacingEm, columnWidthPx, align, allCaps, italic],
  );

  const reading = useMemo(() => readability(text), [text]);

  const error = evaluation.error || null;
  const cssBlock = error ? "" : toCssBlock(evaluation, face.stack);

  const copyCss = async () => {
    if (!cssBlock) return;
    try {
      await navigator.clipboard.writeText(cssBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const applyRecommended = () => {
    setFontSizePx("19");
    setLineHeight(String(WCAG_TEXT_SPACING.lineHeight));
    setLetterSpacingEm(String(WCAG_TEXT_SPACING.letterSpacing));
    setWordSpacingEm(String(WCAG_TEXT_SPACING.wordSpacing));
    setParagraphSpacingEm(String(WCAG_TEXT_SPACING.paragraphSpacing));
    setColumnWidthPx("700");
    setAlign("left");
    setAllCaps(false);
    setItalic(false);
    setCopied(false);
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setFaceId(DEFAULTS.faceId);
    applyRecommended();
  };

  const paragraphs = text.split(/\n{2,}/).filter((part) => part.trim().length > 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpenText className="h-4 w-4" aria-hidden="true" />
          Reading comfort
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Dyslexia Friendly Text Preview</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Adjust type size, spacing, measure and alignment, see the effect immediately, and check
          the result against WCAG 1.4.12 Text Spacing and the British Dyslexia Association style
          guide.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dftp-face">
              Typeface
            </label>
            <select
              id="dftp-face"
              className={`mt-2 ${INPUT_CLASS}`}
              value={faceId}
              onChange={(event) => setFaceId(event.target.value)}
            >
              {RECOMMENDED_FACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dftp-size">
              Font size (px)
            </label>
            <input
              id="dftp-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="48"
              step="1"
              value={fontSizePx}
              onChange={(event) => setFontSizePx(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dftp-line">
              Line height (× font size)
            </label>
            <input
              id="dftp-line"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="3"
              step="0.05"
              value={lineHeight}
              onChange={(event) => setLineHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dftp-letter">
              Letter spacing (em)
            </label>
            <input
              id="dftp-letter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-0.1"
              max="0.5"
              step="0.01"
              value={letterSpacingEm}
              onChange={(event) => setLetterSpacingEm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dftp-word">
              Word spacing (em)
            </label>
            <input
              id="dftp-word"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-0.1"
              max="1"
              step="0.01"
              value={wordSpacingEm}
              onChange={(event) => setWordSpacingEm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dftp-para">
              Paragraph spacing (× font size)
            </label>
            <input
              id="dftp-para"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="5"
              step="0.25"
              value={paragraphSpacingEm}
              onChange={(event) => setParagraphSpacingEm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dftp-column">
              Column width (px)
            </label>
            <input
              id="dftp-column"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="120"
              max="1400"
              step="10"
              value={columnWidthPx}
              onChange={(event) => setColumnWidthPx(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dftp-align">
              Alignment
            </label>
            <select
              id="dftp-align"
              className={`mt-2 ${INPUT_CLASS}`}
              value={align}
              onChange={(event) => setAlign(event.target.value)}
            >
              {ALIGNMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
            {[
              ["dftp-caps", "All capitals", allCaps, setAllCaps],
              ["dftp-italic", "Italic", italic, setItalic],
            ].map(([id, label, value, setter]) => (
              <label
                key={id}
                htmlFor={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id={id}
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dftp-text">
              Sample text
            </label>
            <textarea
              id="dftp-text"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={applyRecommended} className={GHOST_BTN}>
            Apply recommended values
          </button>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Guidelines met
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${NUM.format(evaluation.passed)} / ${NUM.format(evaluation.total)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the values above to score these settings."
                : `WCAG 1.4.12 spacing: ${evaluation.wcagPassed} of ${evaluation.wcagTotal} met`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCss}
              aria-label="Copy these settings as CSS"
              className={GHOST_BTN}
              disabled={!cssBlock}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy CSS"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Characters per line",
              error || evaluation.measure === null
                ? "—"
                : `about ${NUM.format(evaluation.measure)} (target ${BDA_GUIDE.minMeasureChars}–${BDA_GUIDE.maxMeasureChars})`,
            ],
            ["Font size in points", error || evaluation.fontPt === null ? "—" : `${NUM1.format(evaluation.fontPt)} pt`],
            ["Flesch Reading Ease", reading.error ? "—" : `${NUM1.format(reading.fleschReadingEase)} (${reading.band})`],
            ["Flesch-Kincaid grade", reading.error ? "—" : NUM1.format(reading.fleschKincaidGrade)],
            ["Average sentence length", reading.error ? "—" : `${NUM1.format(reading.wordsPerSentence)} words`],
            [
              "Words of three or more syllables",
              reading.error ? "—" : `${NUM.format(reading.longWords)} (${NUM1.format(reading.longWordPct)}%)`,
            ],
            ["Words · sentences", reading.error ? "—" : `${NUM.format(reading.words)} · ${NUM.format(reading.sentences)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error ? (
          <ul className="mt-5 space-y-2 text-sm">
            {evaluation.rules.map((rule) => (
              <li
                key={rule.id}
                className={`flex items-start justify-between gap-3 rounded-md px-3 py-2 ${
                  rule.pass ? "bg-[var(--muted)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                <span>
                  <span className="font-semibold">{rule.label}</span>
                  <span className="block text-xs opacity-80">{rule.source}</span>
                </span>
                <span className="shrink-0 text-right text-xs font-semibold">{rule.actual}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? null : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Live preview</h2>
          <div className="mt-3 overflow-x-auto">
            <div
              style={{
                fontFamily: face.stack,
                fontSize: evaluation.css.fontSize,
                lineHeight: evaluation.css.lineHeight,
                letterSpacing: evaluation.css.letterSpacing,
                wordSpacing: evaluation.css.wordSpacing,
                maxWidth: evaluation.css.maxWidth,
                textAlign: evaluation.css.textAlign,
                textTransform: evaluation.css.textTransform,
                fontStyle: evaluation.css.fontStyle,
              }}
              className="text-[var(--foreground)]"
            >
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`para-${index}`}
                  style={{
                    marginBlockEnd: index === paragraphs.length - 1 ? 0 : evaluation.css.paragraphSpacing,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <pre className="mt-5 overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--foreground)]">
            {cssBlock}
          </pre>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        WCAG 1.4.12 asks that content stay readable when a reader applies these spacing values —
        authoring them as defaults is one way to satisfy it, not the only one. Reading preferences
        differ between individuals, so treat this as a starting point and let people override it.
      </p>
    </main>
  );
}
