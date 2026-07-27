"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Hash, RotateCcw } from "lucide-react";

import { base64ToHex, encodingOverhead, hexToBase64 } from "../lib";

const DEFAULTS = {
  direction: "hexToB64",
  hex: "48 65 78 20 74 6f 20 42 61 73 65 36 34",
  base64: "SGV4IHRvIEJhc2U2NA==",
  urlSafe: false,
  pad: true,
  uppercase: false,
  spaced: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 break-all text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-US");
const fmt = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

export default function ToolHome() {
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [hex, setHex] = useState(DEFAULTS.hex);
  const [base64, setBase64] = useState(DEFAULTS.base64);
  const [urlSafe, setUrlSafe] = useState(DEFAULTS.urlSafe);
  const [pad, setPad] = useState(DEFAULTS.pad);
  const [uppercase, setUppercase] = useState(DEFAULTS.uppercase);
  const [spaced, setSpaced] = useState(DEFAULTS.spaced);
  const [copied, setCopied] = useState(false);

  const toBase64 = direction === "hexToB64";

  const result = useMemo(
    () =>
      toBase64
        ? hexToBase64({ input: hex, urlSafe, pad })
        : base64ToHex({ input: base64, uppercase, spaced }),
    [toBase64, hex, base64, urlSafe, pad, uppercase, spaced],
  );

  const hasError = Boolean(result.error);

  const overhead = useMemo(
    () => (hasError ? null : encodingOverhead(result.byteCount)),
    [hasError, result],
  );

  const copyResult = async () => {
    if (hasError || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDirection(DEFAULTS.direction);
    setHex(DEFAULTS.hex);
    setBase64(DEFAULTS.base64);
    setUrlSafe(DEFAULTS.urlSafe);
    setPad(DEFAULTS.pad);
    setUppercase(DEFAULTS.uppercase);
    setSpaced(DEFAULTS.spaced);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Hash className="h-4 w-4" aria-hidden="true" />
          Encoding converter
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Hex to Base64</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert hexadecimal strings into Base64 and back. Both encodings describe the same bytes —
          hex packs 4 bits per character, Base64 packs 6 — so the conversion decodes to raw bytes
          and re-encodes them, entirely in your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Direction</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["hexToB64", "Hex → Base64"],
              ["b64ToHex", "Base64 → Hex"],
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

        <div className="mt-4">
          {toBase64 ? (
            <>
              <label className={LABEL_CLASS} htmlFor="hex-input">
                Hexadecimal (spaces, colons and 0x prefixes are ignored)
              </label>
              <textarea
                id="hex-input"
                rows={4}
                spellCheck={false}
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={hex}
                onChange={(event) => setHex(event.target.value)}
              />
            </>
          ) : (
            <>
              <label className={LABEL_CLASS} htmlFor="b64-input">
                Base64 (standard or URL-safe, padding optional)
              </label>
              <textarea
                id="b64-input"
                rows={4}
                spellCheck={false}
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={base64}
                onChange={(event) => setBase64(event.target.value)}
              />
            </>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {toBase64 ? (
            <>
              <label
                htmlFor="url-safe"
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id="url-safe"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={urlSafe}
                  onChange={(event) => setUrlSafe(event.target.checked)}
                />
                URL-safe alphabet (- and _)
              </label>
              <label
                htmlFor="pad-output"
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id="pad-output"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={pad}
                  onChange={(event) => setPad(event.target.checked)}
                />
                Keep = padding
              </label>
            </>
          ) : (
            <>
              <label
                htmlFor="uppercase-hex"
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id="uppercase-hex"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={uppercase}
                  onChange={(event) => setUppercase(event.target.checked)}
                />
                Uppercase hex
              </label>
              <label
                htmlFor="spaced-hex"
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id="spaced-hex"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={spaced}
                  onChange={(event) => setSpaced(event.target.checked)}
                />
                Space every byte
              </label>
            </>
          )}
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
              {toBase64 ? "Base64 output" : "Hex output"}
            </p>
            <p className="mt-1 font-mono text-2xl leading-8 font-semibold break-all text-[var(--primary)]">
              {hasError ? DASH : result.output}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${fmt(result.byteCount)} bytes · ${fmt(result.outputChars)} characters out`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy converted output to clipboard"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bytes represented", hasError ? DASH : fmt(result.byteCount)],
            ["Input characters (noise removed)", hasError ? DASH : fmt(result.inputChars)],
            ["Output characters", hasError ? DASH : fmt(result.outputChars)],
            [
              "Same data as hex",
              hasError || !overhead || overhead.error ? DASH : `${fmt(overhead.hexChars)} characters`,
            ],
            [
              "Same data as Base64",
              hasError || !overhead || overhead.error
                ? DASH
                : `${fmt(overhead.base64Chars)} characters`,
            ],
            [
              "Base64 saves",
              hasError || !overhead || overhead.error
                ? DASH
                : `${fmt(overhead.savedChars)} characters vs hex`,
            ],
            [
              "Decoded as UTF-8 text",
              hasError ? DASH : result.text === null ? "not valid UTF-8 text" : result.text,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ArrowLeftRight className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          How the two encodings line up
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Encoding
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Bits per character
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Characters per 3 bytes
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">Hexadecimal</td>
                <td className="py-2 pr-3 text-right">4</td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">6</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-semibold">Base64</td>
                <td className="py-2 pr-3 text-right">6</td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Alphabets follow RFC 4648: standard Base64 uses + and /, URL-safe Base64 swaps them for -
        and _. Nothing you paste leaves the browser.
      </p>
    </main>
  );
}
