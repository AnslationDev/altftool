"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lock, RotateCcw, ShieldAlert } from "lucide-react";

import {
  AES_IV_BYTES,
  AES_SALT_BYTES,
  ALGORITHMS,
  PBKDF2_ITERATIONS,
  analyseText,
  decryptAesGcm,
  encryptAesGcm,
  transform,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-32 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  message: "Meet me at the old bridge at nine.",
  algorithm: "caesar",
  mode: "encode",
  shift: "3",
  key: "LEMON",
  passphrase: "",
};

const randomBytes = (length) => {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
};

export default function ToolHome() {
  const [message, setMessage] = useState(DEFAULTS.message);
  const [algorithm, setAlgorithm] = useState(DEFAULTS.algorithm);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [shift, setShift] = useState(DEFAULTS.shift);
  const [key, setKey] = useState(DEFAULTS.key);
  const [passphrase, setPassphrase] = useState(DEFAULTS.passphrase);
  const [aesOutput, setAesOutput] = useState("");
  const [aesError, setAesError] = useState("");
  const [aesBusy, setAesBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const spec = ALGORITHMS.find((entry) => entry.id === algorithm) ?? ALGORITHMS[0];

  const result = useMemo(
    () => transform({ text: message, algorithm, mode, shift: Number(shift), key }),
    [message, algorithm, mode, shift, key],
  );

  const hasError = Boolean(result.error);
  const output = hasError ? "" : result.output;

  const inputStats = useMemo(() => analyseText(message), [message]);
  const outputStats = useMemo(() => analyseText(output), [output]);

  const copyResult = async () => {
    const text = aesOutput || output;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const runAes = async () => {
    setAesBusy(true);
    setAesError("");
    setAesOutput("");
    try {
      if (mode === "encode") {
        const response = await encryptAesGcm({
          text: message,
          password: passphrase,
          saltBytes: randomBytes(AES_SALT_BYTES),
          ivBytes: randomBytes(AES_IV_BYTES),
        });
        if (response.error) setAesError(response.error);
        else setAesOutput(response.payload);
      } else {
        const response = await decryptAesGcm({ payload: message, password: passphrase });
        if (response.error) setAesError(response.error);
        else setAesOutput(response.text);
      }
    } catch (error) {
      setAesError(error?.message || "AES-GCM failed in this browser.");
    } finally {
      setAesBusy(false);
    }
  };

  const reset = () => {
    setMessage(DEFAULTS.message);
    setAlgorithm(DEFAULTS.algorithm);
    setMode(DEFAULTS.mode);
    setShift(DEFAULTS.shift);
    setKey(DEFAULTS.key);
    setPassphrase(DEFAULTS.passphrase);
    setAesOutput("");
    setAesError("");
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Algorithm", DASH],
        ["Input characters / bytes", DASH],
        ["Output characters / bytes", DASH],
        ["Input fingerprint (FNV-1a)", DASH],
        ["Output fingerprint (FNV-1a)", DASH],
      ]
    : [
        ["Algorithm", `${spec.label} · ${mode === "encode" ? "encode" : "decode"}`],
        [
          "Input characters / bytes",
          `${NUM.format(inputStats.characters)} / ${NUM.format(inputStats.bytes)}`,
        ],
        [
          "Output characters / bytes",
          `${NUM.format(outputStats.characters)} / ${NUM.format(outputStats.bytes)}`,
        ],
        ["Input fingerprint (FNV-1a)", inputStats.checksum],
        ["Output fingerprint (FNV-1a)", outputStats.checksum],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Ciphers &amp; encodings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Secret Message Encoder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Encode or decode a message with Caesar, ROT13, Atbash or Vigenere, or convert it to
          Base64 (RFC 4648), percent-encoding (RFC 3986), Morse (ITU-R M.1677-1) or binary. For
          something that actually has to stay private, use the AES-256-GCM panel below.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sme-algorithm">
              Algorithm
            </label>
            <select
              id="sme-algorithm"
              className={`mt-2 ${INPUT_CLASS}`}
              value={algorithm}
              onChange={(event) => {
                setAlgorithm(event.target.value);
                setCopied(false);
              }}
            >
              {ALGORITHMS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sme-mode">
              Direction
            </label>
            <select
              id="sme-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setAesOutput("");
                setAesError("");
                setCopied(false);
              }}
            >
              <option value="encode">Encode</option>
              <option value="decode">Decode</option>
            </select>
          </div>
          {spec.needsShift ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="sme-shift">
                Shift (k)
              </label>
              <input
                id="sme-shift"
                type="number"
                inputMode="numeric"
                step="1"
                className={`mt-2 ${INPUT_CLASS}`}
                value={shift}
                onChange={(event) => setShift(event.target.value)}
              />
            </div>
          ) : null}
          {spec.needsKey ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="sme-key">
                Keyword (letters only)
              </label>
              <input
                id="sme-key"
                type="text"
                className={`mt-2 ${INPUT_CLASS}`}
                value={key}
                onChange={(event) => setKey(event.target.value)}
              />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sme-message">
              Message
            </label>
            <textarea
              id="sme-message"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Output characters
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(outputStats.characters)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${spec.label} produced ${NUM.format(outputStats.bytes)} bytes of UTF-8.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError && !aesOutput}
              aria-label="Copy the encoded output"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy output"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the encoder to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold" htmlFor="sme-output">
          Result
        </label>
        <textarea
          id="sme-output"
          readOnly
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={hasError ? "" : output}
        />

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all font-semibold sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
          AES-256-GCM (real encryption)
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The key is derived from your passphrase with PBKDF2-HMAC-SHA256 at{" "}
          {NUM.format(PBKDF2_ITERATIONS)} iterations, the OWASP figure, with a fresh{" "}
          {AES_SALT_BYTES}-byte salt and {AES_IV_BYTES}-byte IV per message. Everything runs in your
          browser; nothing is uploaded.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sme-pass">
              Passphrase (8 characters or more)
            </label>
            <input
              id="sme-pass"
              type="password"
              autoComplete="off"
              className={`mt-2 ${INPUT_CLASS}`}
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={runAes}
          disabled={aesBusy}
          aria-label={mode === "encode" ? "Encrypt the message with AES-GCM" : "Decrypt the payload with AES-GCM"}
          className={`mt-4 ${PRIMARY_BTN}`}
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          {aesBusy
            ? "Working…"
            : mode === "encode"
              ? "Encrypt the message above"
              : "Decrypt the payload above"}
        </button>

        {aesError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {aesError}
          </p>
        ) : null}

        {aesOutput ? (
          <>
            <label className="mt-4 block text-sm font-semibold" htmlFor="sme-aes-output">
              AES payload
            </label>
            <textarea
              id="sme-aes-output"
              readOnly
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={aesOutput}
            />
          </>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Caesar, ROT13, Atbash and Vigenere are puzzles, and Base64, URL-encoding, Morse and binary
        are transport formats — none of them hides anything from someone who wants to read it. Only
        the AES-256-GCM panel provides confidentiality, and it is only as strong as the passphrase
        you choose.
      </p>
    </main>
  );
}
