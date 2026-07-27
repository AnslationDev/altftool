"use client";

import { useMemo, useState } from "react";
import { Check, Copy, EyeOff, RotateCcw } from "lucide-react";

import { MASK_CHARACTERS, MASK_PRESETS, maskNumber, redactText } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

// A standard Luhn-valid test number, not an issued card.
const DEFAULT_NUMBER = "4539 1488 0343 6467";
const DEFAULT_TEXT =
  "Please credit A/c 123456789012, IFSC HDFC0000123.\nCard used for the refund: 4539 1488 0343 6467.";

export default function ToolHome() {
  const [rawValue, setRawValue] = useState(DEFAULT_NUMBER);
  const [preset, setPreset] = useState("card");
  const [keepFirst, setKeepFirst] = useState("6");
  const [keepLast, setKeepLast] = useState("4");
  const [maskChar, setMaskChar] = useState("X");
  const [preserveSeparators, setPreserveSeparators] = useState(true);
  const [batchText, setBatchText] = useState(DEFAULT_TEXT);
  const [showBatch, setShowBatch] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const applyPreset = (value) => {
    setPreset(value);
    const found = MASK_PRESETS.find((item) => item.value === value);
    if (found && value !== "custom") {
      setKeepFirst(String(found.keepFirst));
      setKeepLast(String(found.keepLast));
    }
  };

  const parsedKeepFirst = Number.parseInt(keepFirst, 10);
  const parsedKeepLast = Number.parseInt(keepLast, 10);

  const result = useMemo(() => {
    if (!Number.isInteger(parsedKeepFirst) || !Number.isInteger(parsedKeepLast)) {
      return { error: "Enter how many digits to keep as whole numbers." };
    }
    return maskNumber({
      value: rawValue,
      keepFirst: parsedKeepFirst,
      keepLast: parsedKeepLast,
      maskChar,
      preserveSeparators,
      groupSize: preserveSeparators ? 0 : 4,
    });
  }, [rawValue, parsedKeepFirst, parsedKeepLast, maskChar, preserveSeparators]);

  const batch = useMemo(() => {
    if (!showBatch) return null;
    if (!Number.isInteger(parsedKeepFirst) || !Number.isInteger(parsedKeepLast)) return null;
    return redactText({
      text: batchText,
      keepFirst: parsedKeepFirst,
      keepLast: parsedKeepLast,
      maskChar,
    });
  }, [showBatch, batchText, parsedKeepFirst, parsedKeepLast, maskChar]);

  const ok = !result.error;

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
    setRawValue(DEFAULT_NUMBER);
    applyPreset("card");
    setMaskChar("X");
    setPreserveSeparators(true);
    setBatchText(DEFAULT_TEXT);
    setShowBatch(false);
    setCopiedKey("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          Runs in your browser
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bank Account Number Masking Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Hide the middle of an account, card or Aadhaar number before you paste it into a ticket,
          a screenshot or a shared sheet. Presets follow the PCI DSS six-and-four display rule and
          the UIDAI masked-Aadhaar convention.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="mask-value">
          Number to mask
        </label>
        <input
          id="mask-value"
          className={`mt-2 ${INPUT_CLASS} font-mono text-lg tracking-wider`}
          type="text"
          autoComplete="off"
          spellCheck="false"
          value={rawValue}
          onChange={(event) => setRawValue(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mask-preset">
              Masking rule
            </label>
            <select
              id="mask-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preset}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {MASK_PRESETS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mask-first">
              Digits visible at the start
            </label>
            <input
              id="mask-first"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="19"
              step="1"
              value={keepFirst}
              onChange={(event) => {
                setKeepFirst(event.target.value);
                setPreset("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mask-last">
              Digits visible at the end
            </label>
            <input
              id="mask-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="19"
              step="1"
              value={keepLast}
              onChange={(event) => {
                setKeepLast(event.target.value);
                setPreset("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mask-char">
              Mask character
            </label>
            <select
              id="mask-char"
              className={`mt-2 ${INPUT_CLASS}`}
              value={maskChar}
              onChange={(event) => setMaskChar(event.target.value)}
            >
              {MASK_CHARACTERS.map((character) => (
                <option key={character} value={character}>
                  {character}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className={TOGGLE_CLASS} htmlFor="mask-sep">
              <input
                id="mask-sep"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={preserveSeparators}
                onChange={(event) => setPreserveSeparators(event.target.checked)}
              />
              Keep spacing as typed
            </label>
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Masked value
            </p>
            <p className="mt-1 break-all font-mono text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? result.masked : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.hiddenCount} of ${result.digitCount} digits hidden · ${result.detectedLabel}`
                : "Fix the settings above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("main", result.masked)}
              disabled={!ok}
              aria-label="Copy the masked number"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copiedKey === "main" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedKey === "main" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Digits in the number", ok ? String(result.digitCount) : "—"],
            ["Digits hidden", ok ? String(result.hiddenCount) : "—"],
            ["Digits still visible", ok ? String(result.visibleCount) : "—"],
            ["Detected as", ok ? result.detectedLabel : "—"],
            ["Luhn checksum (cards)", ok ? (result.luhnValid ? "Passes" : "Does not pass") : "—"],
            ["Verhoeff checksum (Aadhaar)", ok ? (result.verhoeffValid ? "Passes" : "Does not pass") : "—"],
            ["Without separators", ok ? result.maskedCompact : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm leading-6">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Redact a block of text</h2>
          <button
            type="button"
            onClick={() => setShowBatch((value) => !value)}
            aria-expanded={showBatch}
            className={GHOST_BTN}
          >
            {showBatch ? "Hide" : "Show"}
          </button>
        </div>
        {showBatch && (
          <>
            <label className="sr-only" htmlFor="mask-batch">
              Text to redact
            </label>
            <textarea
              id="mask-batch"
              rows={5}
              className="mt-3 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={batchText}
              onChange={(event) => setBatchText(event.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-[var(--muted-foreground)]">
                {batch && !batch.error
                  ? `${batch.count} number${batch.count === 1 ? "" : "s"} of 9 digits or more masked`
                  : "—"}
              </p>
              <button
                type="button"
                onClick={() => copy("batch", batch && !batch.error ? batch.redacted : "")}
                disabled={!batch || Boolean(batch.error)}
                aria-label="Copy the redacted text"
                className={`${GHOST_BTN} disabled:opacity-40`}
              >
                {copiedKey === "batch" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copiedKey === "batch" ? "Copied!" : "Copy redacted text"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-3 font-mono text-sm">
              {batch && !batch.error ? batch.redacted : "—"}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Masking hides digits in text; it does not remove them from an image, a PDF layer or a
        document's revision history. Redact screenshots by cropping or painting over the area, not by
        drawing a highlight on top of it, and never share a full card number, CVV or Aadhaar over
        chat or email.
      </p>
    </main>
  );
}
