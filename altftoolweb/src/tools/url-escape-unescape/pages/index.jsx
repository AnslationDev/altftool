"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, Link, RotateCcw } from "lucide-react";

import { ENCODE_MODES, decodeUrl, encodeUrl, inspectUrl } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PLAIN = "search term with spaces & symbols=yes";
const DEFAULT_ENCODED = "https://example.com/search?q=caf%C3%A9%20bar&page=2#top";

const numberFmt = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [direction, setDirection] = useState("encode");
  const [plain, setPlain] = useState(DEFAULT_PLAIN);
  const [encoded, setEncoded] = useState(DEFAULT_ENCODED);
  const [mode, setMode] = useState("component");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (direction === "encode") return encodeUrl({ text: plain, mode });
    return decodeUrl({ value: encoded, mode });
  }, [direction, plain, encoded, mode]);

  const error = result.error ?? null;
  const output = error ? "" : result.output;

  const inspection = useMemo(
    () => inspectUrl(direction === "encode" ? plain : encoded),
    [direction, plain, encoded]
  );

  const activeMode = ENCODE_MODES.find((entry) => entry.id === mode) ?? ENCODE_MODES[0];

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleSwap = () => {
    if (direction === "encode") {
      if (!error) setEncoded(result.output);
      setDirection("decode");
    } else {
      if (!error) setPlain(result.output);
      setDirection("encode");
    }
    setCopied(false);
  };

  const handleReset = () => {
    setDirection("encode");
    setPlain(DEFAULT_PLAIN);
    setEncoded(DEFAULT_ENCODED);
    setMode("component");
    setCopied(false);
  };

  const dash = "—";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Link className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            URL Escape / Unescape
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Percent-encode and decode text for query strings, redirects and form bodies,
            following RFC 3986. Runs entirely in your browser.
          </p>
        </div>
      </header>

      <div
        className="mb-4 inline-flex rounded-md border border-[var(--border)] p-1"
        role="group"
        aria-label="Direction"
      >
        {[
          ["encode", "Escape"],
          ["decode", "Unescape"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setDirection(value);
              setCopied(false);
            }}
            aria-pressed={direction === value}
            className={`min-h-11 rounded px-5 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
              direction === value
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="source-input">
            {direction === "encode" ? "Plain text" : "Encoded text"}
          </label>
          <textarea
            id="source-input"
            rows={4}
            className={`${TEXTAREA_CLASS} mt-1.5`}
            value={direction === "encode" ? plain : encoded}
            onChange={(event) =>
              direction === "encode" ? setPlain(event.target.value) : setEncoded(event.target.value)
            }
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="mode-select">
            Encoding rules
          </label>
          <select
            id="mode-select"
            className={`${INPUT_CLASS} mt-1.5`}
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            {ENCODE_MODES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{activeMode.hint}</p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {direction === "encode" ? "Escaped output" : "Decoded output"}
        </p>
        <p className="mt-2 break-all font-mono text-lg font-bold leading-7 text-[var(--foreground)]">
          {error ? dash : output || dash}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Input length</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(result.inputLength)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Output length</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(result.outputLength)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              {direction === "encode" ? "Escape sequences added" : "Escape sequences decoded"}
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : numberFmt.format(
                    direction === "encode" ? result.escapedCount : result.decodedCount
                  )}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              {direction === "encode" ? "Size growth" : "Double-encoded?"}
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : direction === "encode"
                  ? `${result.growthPercent}%`
                  : result.looksDoubleEncoded
                    ? "Yes — decode again"
                    : "No"}
            </dd>
          </div>
        </dl>
      </section>

      {!inspection.error && inspection.params.length > 0 ? (
        <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Query parameters found in the input
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Key</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Decoded value</th>
                  <th scope="col" className="py-2 font-semibold">Raw</th>
                </tr>
              </thead>
              <tbody>
                {inspection.params.map((param) => (
                  <tr key={param.raw} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono text-[var(--foreground)]">{param.key}</td>
                    <td className="py-2 pr-3 text-[var(--foreground)]">{param.value || dash}</td>
                    <td className="py-2 break-all font-mono text-xs text-[var(--muted-foreground)]">
                      {param.raw}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Scheme {inspection.scheme || dash} · host {inspection.authority || dash} · path{" "}
            {inspection.path || dash}
          </p>
        </section>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy result to clipboard"
          disabled={!output}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleSwap} aria-label="Send result to the other direction">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Swap
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset to defaults">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Unreserved characters (A–Z a–z 0–9 - . _ ~) are never escaped. Nothing you paste
        leaves this page.
      </p>
    </div>
  );
}
