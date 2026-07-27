"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Link2, RotateCcw } from "lucide-react";

import {
  encodeToBase64Url,
  SOURCE_TYPES,
  SAFE_URL_LENGTH,
  SERVER_URL_LIMIT,
  COOKIE_MAX_BYTES,
  MAX_INPUT_CHARS,
} from "../lib";

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
  input: '{"uid":"a7f3","scope":"read:orders","exp":1893456000}',
  sourceType: "text",
  keepPadding: false,
  wrap: false,
};

const DASH = "—";
const integer = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULTS.input);
  const [sourceType, setSourceType] = useState(DEFAULTS.sourceType);
  const [keepPadding, setKeepPadding] = useState(DEFAULTS.keepPadding);
  const [wrap, setWrap] = useState(DEFAULTS.wrap);
  const [copied, setCopied] = useState("");
  const copyTimer = useRef(null);

  const result = useMemo(
    () => encodeToBase64Url({ input, sourceType, keepPadding, wrap }),
    [input, sourceType, keepPadding, wrap],
  );
  const failed = Boolean(result.error);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setInput(DEFAULTS.input);
    setSourceType(DEFAULTS.sourceType);
    setKeepPadding(DEFAULTS.keepPadding);
    setWrap(DEFAULTS.wrap);
    setCopied("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Link2 aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Base64 URL Encoder
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Encode text, standard Base64 or raw hex bytes into base64url — the URL and filename safe alphabet of RFC 4648
          §5, where <code>+</code> becomes <code>-</code>, <code>/</code> becomes <code>_</code> and the{" "}
          <code>=</code> padding is dropped. The result is checked against real URL and cookie size limits.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="enc-input">
            Input
          </label>
          <textarea
            id="enc-input"
            className={`${TEXTAREA_CLASS} mt-1.5 min-h-32`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder='{"uid":"a7f3"} or 48 65 6c 6c 6f'
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            Limit {integer.format(MAX_INPUT_CHARS)} characters.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="enc-source">
              Interpret input as
            </label>
            <select
              id="enc-source"
              className={`${CONTROL_CLASS} mt-1.5`}
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value)}
            >
              {SOURCE_TYPES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="grid content-end gap-2">
            <legend className={`${LABEL_CLASS} mb-1`}>Output options</legend>
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="enc-padding">
              <input
                id="enc-padding"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={keepPadding}
                onChange={(event) => setKeepPadding(event.target.checked)}
              />
              Keep <code>=</code> padding
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="enc-wrap">
              <input
                id="enc-wrap"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={wrap}
                onChange={(event) => setWrap(event.target.checked)}
              />
              Wrap at 76 characters
            </label>
          </fieldset>
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
            URL-safe characters
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            {failed ? DASH : integer.format(result.urlSafeLength)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {failed
              ? DASH
              : `from ${integer.format(result.bytes)} bytes · ${integer.format(result.urlCharactersSaved)} characters shorter than percent-encoding`}
          </p>

          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="enc-output">
              base64url output
            </label>
            <textarea
              id="enc-output"
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
              <dt className="text-[var(--muted-foreground)]">Standard Base64 length</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.standardLength)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Percent-encoded length</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.percentEncodedLength)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Encoding overhead</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `+${result.overheadPercent}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">
                Characters swapped (<code>+</code>/<code>/</code>)
              </dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.substitutions)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Padding characters</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed
                  ? DASH
                  : `${integer.format(result.paddingChars)} (${result.paddingKept ? "kept" : "dropped"})`}
              </dd>
            </div>
          </dl>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
              <caption className="sr-only">Size checks against common limits</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Limit
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Threshold
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--foreground)]">
                    Interoperable URL length
                  </th>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {integer.format(SAFE_URL_LENGTH)} chars
                  </td>
                  <td
                    className={`py-2 font-semibold ${
                      !failed && result.exceedsSafeUrl ? "text-[var(--danger)]" : "text-[var(--success)]"
                    }`}
                  >
                    {failed ? DASH : result.exceedsSafeUrl ? "Over" : "Fits"}
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--foreground)]">
                    Apache LimitRequestLine
                  </th>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {integer.format(SERVER_URL_LIMIT)} chars
                  </td>
                  <td
                    className={`py-2 font-semibold ${
                      !failed && result.exceedsServerLimit ? "text-[var(--danger)]" : "text-[var(--success)]"
                    }`}
                  >
                    {failed ? DASH : result.exceedsServerLimit ? "Over" : "Fits"}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 pr-3 font-medium text-[var(--foreground)]">
                    Cookie size (RFC 6265)
                  </th>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {integer.format(COOKIE_MAX_BYTES)} bytes
                  </td>
                  <td
                    className={`py-2 font-semibold ${
                      !failed && result.exceedsCookieLimit ? "text-[var(--danger)]" : "text-[var(--success)]"
                    }`}
                  >
                    {failed ? DASH : result.exceedsCookieLimit ? "Over" : "Fits"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {!failed && result.exceedsSafeUrl ? (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
              This value is longer than the {integer.format(SAFE_URL_LENGTH)}-character URL length that every proxy and
              browser handles reliably. Send it in a request body or a header instead of a query string.
            </p>
          ) : null}
          {!failed && !result.exceedsSafeUrl ? (
            <p className="mt-3 text-xs text-[var(--success)]">
              Safe in a query string, a path segment and a filename — the output uses only A–Z, a–z, 0–9,{" "}
              <code>-</code> and <code>_</code>.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={() => copy("output", failed ? "" : result.output)}
              disabled={failed}
              aria-label="Copy the URL-safe Base64 output to the clipboard"
            >
              {copied === "output" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "output" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => copy("standard", failed ? "" : result.standard)}
              disabled={failed}
              aria-label="Copy the standard Base64 value to the clipboard"
            >
              {copied === "standard" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "standard" ? "Copied!" : "Copy standard Base64"}
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
