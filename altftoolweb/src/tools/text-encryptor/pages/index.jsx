"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Lock, RotateCcw, Unlock } from "lucide-react";

import {
  HASH_ALGORITHMS,
  IV_BYTES,
  PBKDF2_ITERATIONS,
  SALT_BYTES,
  decryptText,
  encryptText,
  entropyBand,
  hashText,
  passwordEntropyBits,
  randomBytes,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";

const DEFAULT_TEXT = "Meeting moved to 4pm. Bring the signed copy.";
const DEFAULT_PASSWORD = "harbour-lamp-42-quiet";
const DEFAULT_HASH_INPUT = "abc";

const DASH = "—";
const num = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [mode, setMode] = useState("encrypt");
  const [plaintext, setPlaintext] = useState(DEFAULT_TEXT);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [payload, setPayload] = useState("");
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const [hashInput, setHashInput] = useState(DEFAULT_HASH_INPUT);
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [hashResult, setHashResult] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const runEncrypt = useCallback(async (text, secret) => {
    setBusy(true);
    const salt = randomBytes(SALT_BYTES);
    const iv = randomBytes(IV_BYTES);
    if (salt.error || iv.error) {
      setEncrypted({ error: "Could not gather random bytes from the browser." });
      setBusy(false);
      return;
    }
    const output = await encryptText({
      plaintext: text,
      password: secret,
      salt: salt.bytes,
      iv: iv.bytes,
      iterations: PBKDF2_ITERATIONS,
    });
    setEncrypted(output);
    if (!output.error) setPayload(output.payload);
    setBusy(false);
  }, []);

  const runDecrypt = useCallback(async (text, secret) => {
    setBusy(true);
    const output = await decryptText({ payload: text, password: secret });
    setDecrypted(output);
    setBusy(false);
  }, []);

  useEffect(() => {
    runEncrypt(DEFAULT_TEXT, DEFAULT_PASSWORD);
  }, [runEncrypt]);

  useEffect(() => {
    let cancelled = false;
    hashText(hashInput, algorithm).then((output) => {
      if (!cancelled) setHashResult(output);
    });
    return () => {
      cancelled = true;
    };
  }, [hashInput, algorithm]);

  const entropy = passwordEntropyBits(password);
  const activeResult = mode === "encrypt" ? encrypted : decrypted;
  const resultError = activeResult && activeResult.error ? activeResult.error : "";
  const encryptOk = Boolean(encrypted && !encrypted.error);

  const copyValue = async (value, setter) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setter(true);
      setTimeout(() => setter(false), 1500);
    } catch {
      setter(false);
    }
  };

  const reset = () => {
    setMode("encrypt");
    setPlaintext(DEFAULT_TEXT);
    setPassword(DEFAULT_PASSWORD);
    setDecrypted(null);
    setCopied(false);
    runEncrypt(DEFAULT_TEXT, DEFAULT_PASSWORD);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Local crypto
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Text Encryptor</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Encrypt text with AES-256-GCM and a password stretched through 600,000 rounds of
          PBKDF2-HMAC-SHA256, or take a SHA digest. Everything runs in your browser via the Web
          Crypto API — no key, password or message is transmitted.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("encrypt")}
            aria-pressed={mode === "encrypt"}
            className={mode === "encrypt" ? PRIMARY_BTN : GHOST_BTN}
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            Encrypt
          </button>
          <button
            type="button"
            onClick={() => setMode("decrypt")}
            aria-pressed={mode === "decrypt"}
            className={mode === "decrypt" ? PRIMARY_BTN : GHOST_BTN}
          >
            <Unlock className="h-4 w-4" aria-hidden="true" />
            Decrypt
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {mode === "encrypt" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="te-plaintext">
                Text to encrypt
              </label>
              <textarea
                id="te-plaintext"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                rows={5}
                spellCheck={false}
                value={plaintext}
                onChange={(event) => setPlaintext(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="te-payload">
                Encrypted payload
              </label>
              <textarea
                id="te-payload"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                rows={5}
                spellCheck={false}
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="te-password">
              Password
            </label>
            <input
              id="te-password"
              className={`mt-2 ${INPUT_CLASS}`}
              type="password"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Estimated entropy {num.format(entropy)} bits — {entropyBand(entropy)}. There is no
              recovery: lose the password and the text is gone.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() =>
                mode === "encrypt"
                  ? runEncrypt(plaintext, password)
                  : runDecrypt(payload, password)
              }
              disabled={busy}
              aria-label={mode === "encrypt" ? "Encrypt the text" : "Decrypt the payload"}
              className={PRIMARY_BTN}
            >
              {mode === "encrypt" ? (
                <Lock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Unlock className="h-4 w-4" aria-hidden="true" />
              )}
              {busy ? "Working…" : mode === "encrypt" ? "Encrypt" : "Decrypt"}
            </button>
          </div>
        </div>
      </section>

      {resultError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {resultError}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "encrypt" ? "Payload length" : "Recovered characters"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {mode === "encrypt"
                ? encryptOk
                  ? num.format(encrypted.payload.length)
                  : DASH
                : decrypted && !decrypted.error
                  ? num.format(decrypted.plaintext.length)
                  : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {mode === "encrypt" ? "characters of ALTFT1 payload" : "characters recovered"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                copyValue(
                  mode === "encrypt"
                    ? encryptOk
                      ? encrypted.payload
                      : ""
                    : decrypted && !decrypted.error
                      ? decrypted.plaintext
                      : "",
                  setCopied,
                )
              }
              aria-label={mode === "encrypt" ? "Copy the encrypted payload" : "Copy the decrypted text"}
              className={GHOST_BTN}
              disabled={Boolean(resultError) || !activeResult}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cipher", encryptOk || (decrypted && !decrypted.error) ? "AES-256-GCM" : DASH],
            [
              "Key derivation",
              encryptOk ? encrypted.kdf : decrypted && !decrypted.error ? `PBKDF2-HMAC-SHA256 x ${num.format(decrypted.iterations)}` : DASH,
            ],
            ["Salt", encryptOk ? `${SALT_BYTES} bytes (random per message)` : DASH],
            ["IV", encryptOk ? `${IV_BYTES} bytes (random per message)` : DASH],
            [
              "Plaintext size",
              encryptOk ? `${num.format(encrypted.plaintextBytes)} bytes` : DASH,
            ],
            [
              "Ciphertext size",
              encryptOk
                ? `${num.format(encrypted.ciphertextBytes)} bytes (includes the 16-byte tag)`
                : DASH,
            ],
            ["Password entropy", `${num.format(entropy)} bits — ${entropyBand(entropy)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {mode === "encrypt" && encryptOk && (
          <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 whitespace-pre-wrap break-all font-mono text-xs leading-5 text-[var(--foreground)]">
              {encrypted.payload}
            </pre>
          </div>
        )}

        {mode === "decrypt" && decrypted && !decrypted.error && (
          <div className="mt-4 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 whitespace-pre-wrap break-words font-mono text-xs leading-5 text-[var(--foreground)]">
              {decrypted.plaintext}
            </pre>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Hash</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="te-hash-input">
              Text to hash
            </label>
            <textarea
              id="te-hash-input"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              spellCheck={false}
              value={hashInput}
              onChange={(event) => setHashInput(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="te-algorithm">
              Algorithm
            </label>
            <select
              id="te-algorithm"
              className={`mt-2 ${INPUT_CLASS}`}
              value={algorithm}
              onChange={(event) => setAlgorithm(event.target.value)}
            >
              {HASH_ALGORITHMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => copyValue(hashResult && hashResult.hex, setCopiedHash)}
              aria-label="Copy the hex digest"
              className={GHOST_BTN}
              disabled={!hashResult || Boolean(hashResult.error)}
            >
              {copiedHash ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedHash ? "Copied!" : "Copy digest"}
            </button>
          </div>
        </div>

        {hashResult && hashResult.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {hashResult.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Digest size", hashResult && !hashResult.error ? `${hashResult.bits} bits` : DASH],
            [
              "Base64",
              hashResult && !hashResult.error ? hashResult.base64 : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-mono text-xs font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
          <pre className="min-w-0 whitespace-pre-wrap break-all font-mono text-xs leading-5 text-[var(--foreground)]">
            {hashResult && !hashResult.error ? hashResult.hex : DASH}
          </pre>
        </div>

        {hashResult && hashResult.deprecated ? (
          <p className="mt-3 text-xs leading-5 text-[var(--danger)]">
            SHA-1 has a practical collision attack published in 2017. Use it only to match a legacy
            checksum, never for signatures or integrity guarantees.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A fresh random salt and IV are generated for every encryption, so encrypting the same text
        twice produces different payloads — that is correct behaviour, not a bug. Hashing is one-way
        and cannot be reversed.
      </p>
    </main>
  );
}
