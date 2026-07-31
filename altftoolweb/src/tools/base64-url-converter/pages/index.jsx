"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, Link2, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { convertBase64, FORMATS, MAX_INPUT_CHARS } from "../lib";

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
  input: "Hello, AltFTool! ~ subs?/+",
  from: "text",
  to: "base64url",
  keepPadding: false,
};

const DETECTED_LABEL = {
  text: "plain text",
  base64: "standard Base64",
  base64url: "URL-safe Base64",
  ambiguous: "Base64 (both alphabets identical here)",
  mixed: "mixed alphabets",
  empty: "empty",
};

const DASH = "—";
const integer = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULTS.input);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [to, setTo] = useState(DEFAULTS.to);
  const [keepPadding, setKeepPadding] = useState(DEFAULTS.keepPadding);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () => convertBase64({ input, from, to, keepPadding }),
    [input, from, to, keepPadding],
  );
  const failed = Boolean(result.error);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (!failed) setInput(result.output);
  };

  const reset = () => {
    const isDefault =
      input === DEFAULTS.input && from === DEFAULTS.from && to === DEFAULTS.to && keepPadding === DEFAULTS.keepPadding;
    if (!isDefault && !window.confirm("Reset to the default example? This will replace your current input and cannot be undone.")) {
      return;
    }
    setInput(DEFAULTS.input);
    setFrom(DEFAULTS.from);
    setTo(DEFAULTS.to);
    setKeepPadding(DEFAULTS.keepPadding);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Link2 aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Base64 URL Converter
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Move a payload between plain UTF-8 text, standard Base64 (RFC 4648 §4) and URL-safe base64url (RFC 4648 §5).
          The two alphabets differ only at positions 62 and 63 — <code>+/</code> versus <code>-_</code> — and base64url
          normally drops the <code>=</code> padding, which is why JWT segments fail in ordinary decoders.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="conv-input">
            Input
          </label>
          <textarea
            id="conv-input"
            className={`${TEXTAREA_CLASS} mt-1.5 min-h-32`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste text, standard Base64 or base64url"
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]" role="status" aria-live="polite">
            Detected as {failed ? DASH : DETECTED_LABEL[result.detected] || result.detected}. Limit{" "}
            {integer.format(MAX_INPUT_CHARS)} characters.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="conv-from">
              Treat input as
            </label>
            <select
              id="conv-from"
              className={`${CONTROL_CLASS} mt-1.5`}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            >
              {FORMATS.map((format) => (
                <option key={format.key} value={format.key}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="conv-to">
              Convert to
            </label>
            <select
              id="conv-to"
              className={`${CONTROL_CLASS} mt-1.5`}
              value={to}
              onChange={(event) => setTo(event.target.value)}
            >
              {FORMATS.map((format) => (
                <option key={format.key} value={format.key}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="keep-padding">
            <input
              id="keep-padding"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25"
              checked={keepPadding}
              onChange={(event) => setKeepPadding(event.target.checked)}
            />
            Keep <code>=</code> padding on URL-safe output
          </label>
          <button type="button" className={GHOST_BTN} onClick={swap} aria-label="Swap the input and output formats">
            <ArrowRightLeft aria-hidden="true" className="h-4 w-4" />
            Swap
          </button>
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
            Output characters
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            {failed ? DASH : integer.format(result.outputLength)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {failed ? DASH : `${integer.format(result.bytes)} bytes of payload`}
          </p>

          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="conv-output">
              Result
            </label>
            <textarea
              id="conv-output"
              readOnly
              className={`${TEXTAREA_CLASS} mt-1.5 min-h-28`}
              value={failed ? "" : result.output}
              placeholder={DASH}
            />
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Payload bytes</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.bytes)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Encoding overhead</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `+${result.overheadPercent}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Padding added on read</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.addedPadding)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">URL characters saved</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.urlCharactersSaved)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <caption className="sr-only">The same payload in each encoding</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Encoding
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Value
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--foreground)]">
                    Standard Base64
                  </th>
                  <td className="py-2 pr-3 font-mono text-xs break-all text-[var(--foreground)]">
                    {failed ? DASH : result.standard}
                  </td>
                  <td className="py-2 font-mono text-xs text-[var(--foreground)]">
                    {failed ? DASH : integer.format(result.standard.length)}
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--foreground)]">
                    URL-safe Base64
                  </th>
                  <td className="py-2 pr-3 font-mono text-xs break-all text-[var(--foreground)]">
                    {failed ? DASH : result.urlSafe}
                  </td>
                  <td className="py-2 font-mono text-xs text-[var(--foreground)]">
                    {failed ? DASH : integer.format(result.urlSafe.length)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--foreground)]">
                    Percent-encoded standard
                  </th>
                  <td className="py-2 pr-3 font-mono text-xs break-all text-[var(--foreground)]">
                    {failed ? DASH : result.percentEncoded}
                  </td>
                  <td className="py-2 font-mono text-xs text-[var(--foreground)]">
                    {failed ? DASH : integer.format(result.percentEncoded.length)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {!failed && result.to === "text" && !result.validUtf8 ? (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
              Those bytes are not valid UTF-8. Invalid sequences were replaced with U+FFFD, so the text above is not a
              faithful decode — the payload is probably a binary file.
            </p>
          ) : null}
          {!failed && (result.to !== "text" || result.validUtf8) ? (
            <p className="mt-3 text-xs text-[var(--success)]" role="status" aria-live="polite">
              Round-trips exactly: converting the result back returns the same {integer.format(result.bytes)} bytes.
            </p>
          ) : null}

          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={() => copy("output", failed ? "" : result.output, { label: "Converted result" })}
              disabled={failed}
              aria-label="Copy the converted result to the clipboard"
            >
              {isCopied("output") ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {isCopied("output") ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => copy("urlsafe", failed ? "" : result.urlSafe, { label: "URL-safe Base64 value" })}
              disabled={failed}
              aria-label="Copy the URL-safe Base64 value to the clipboard"
            >
              {isCopied("urlsafe") ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {isCopied("urlsafe") ? "Copied!" : "Copy URL-safe"}
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
