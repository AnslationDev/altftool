"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Radio, RotateCcw } from "lucide-react";

import {
  formatSeconds,
  MAX_WPM,
  MIN_WPM,
  MORSE_DIGITS,
  MORSE_LETTERS,
  MORSE_PUNCTUATION,
  morseTiming,
  morseToText,
  PARIS_UNITS_PER_WORD,
  PROSIGNS,
  textToMorse,
} from "../lib";

const DEFAULTS = {
  direction: "encode",
  text: "SOS HELLO WORLD",
  morse: "... --- ... / .... . .-.. .-.. ---",
  wpm: "20",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[7rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

const REFERENCE_GROUPS = [
  ["Letters", MORSE_LETTERS],
  ["Figures", MORSE_DIGITS],
  ["Punctuation", MORSE_PUNCTUATION],
];

export default function ToolHome() {
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [text, setText] = useState(DEFAULTS.text);
  const [morse, setMorse] = useState(DEFAULTS.morse);
  const [wpm, setWpm] = useState(DEFAULTS.wpm);
  const [copied, setCopied] = useState(false);

  const encoding = direction === "encode";

  const result = useMemo(
    () => (encoding ? textToMorse(text) : morseToText(morse)),
    [encoding, text, morse],
  );

  const hasError = Boolean(result.error);
  const output = hasError ? "" : encoding ? result.morse : result.text;

  const timing = useMemo(() => {
    const source = encoding ? result.morse : morse;
    if (hasError || !source) return { error: "No signal to time." };
    return morseTiming(source, toNumber(wpm));
  }, [encoding, hasError, result, morse, wpm]);

  const timingError = Boolean(timing.error);

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDirection(DEFAULTS.direction);
    setText(DEFAULTS.text);
    setMorse(DEFAULTS.morse);
    setWpm(DEFAULTS.wpm);
    setCopied(false);
  };

  const swap = () => {
    if (encoding && !hasError) setMorse(result.morse);
    if (!encoding && !hasError) setText(result.text);
    setDirection(encoding ? "decode" : "encode");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Radio className="h-4 w-4" aria-hidden="true" />
          ITU-R M.1677-1
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Morse Code Translator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Translate plain text into International Morse code and decode Morse back into text, with
          the exact transmission time at any sending speed.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Direction</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["encode", "Text → Morse"],
              ["decode", "Morse → Text"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`dir-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  direction === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`dir-${value}`}
                  type="radio"
                  name="direction"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={direction === value}
                  onChange={(event) => setDirection(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4">
          {encoding ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="plain-text">
                Text to encode
              </label>
              <textarea
                id="plain-text"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="morse-input">
                Morse to decode (space between letters, / between words)
              </label>
              <textarea
                id="morse-input"
                className={`mt-2 font-mono ${TEXTAREA_CLASS}`}
                value={morse}
                onChange={(event) => setMorse(event.target.value)}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wpm">
                Sending speed (words per minute)
              </label>
              <input
                id="wpm"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={MIN_WPM}
                max={MAX_WPM}
                step="1"
                value={wpm}
                onChange={(event) => setWpm(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={swap} className={GHOST_BTN} aria-label="Swap direction and carry the result across">
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                Swap sides
              </button>
            </div>
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {encoding ? "Morse code" : "Decoded text"}
            </p>
            <p className="mt-1 font-mono text-2xl leading-relaxed font-semibold break-all text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : output}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the translated result to the clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the translator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Dot units in the signal",
              hasError || timingError ? DASH : `${NUM.format(timing.units)} units`,
            ],
            [
              "Length of one dot at this speed",
              hasError || timingError ? DASH : `${(timing.dotSeconds * 1000).toFixed(0)} ms`,
            ],
            [
              "Time to send the whole message",
              hasError || timingError ? DASH : formatSeconds(timing.seconds),
            ],
            [
              encoding ? "Words encoded" : "Unrecognised sequences",
              hasError
                ? DASH
                : encoding
                  ? NUM.format(result.words)
                  : result.unknown.length === 0
                    ? "None"
                    : result.unknown.join(", "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && encoding && result.unsupported.length > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Skipped, because International Morse has no signal for them:{" "}
            <span className="font-semibold">{result.unsupported.join(" ")}</span>
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Procedure signals</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Prosign</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Code</th>
                <th scope="col" className="py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {PROSIGNS.map((sign) => (
                <tr key={sign.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{sign.name}</td>
                  <td className="py-2 pr-3 font-mono">{sign.code}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{sign.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Full character reference</h2>
        {REFERENCE_GROUPS.map(([groupLabel, group]) => (
          <div key={groupLabel} className="mt-4">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {groupLabel}
            </h3>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(group).map(([char, code]) => (
                <li
                  key={char}
                  className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  <span className="font-semibold">{char}</span>
                  <span className="font-mono text-sm text-[var(--muted-foreground)]">{code}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timing follows the ITU rule that a dash is three dots long, gaps inside a character are one
        dot, between characters three and between words seven. Speed is measured against the
        standard word PARIS, which is exactly {PARIS_UNITS_PER_WORD} dot units long.
      </p>
    </main>
  );
}
