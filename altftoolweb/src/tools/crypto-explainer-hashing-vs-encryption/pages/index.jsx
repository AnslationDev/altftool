"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hash, RotateCcw } from "lucide-react";

import {
  MISCONCEPTIONS,
  OPERATIONS,
  SHA256_DIGEST_BITS,
  avalancheTest,
  base64Decode,
  base64Encode,
  demoDecrypt,
  demoEncrypt,
  saltDemo,
  sha256Hex,
  utf8Bytes,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  text: "correct horse battery staple",
  key: "s3cret-key",
};

const DEMO_SALTS = ["", "9f2a7c", "b41d0e"];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CODE_BOX =
  "mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3";

function CopyButton({ id, value, label, copiedId, onCopy }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(id, value)}
      aria-label={label}
      className={`mt-3 ${GHOST_BTN}`}
      disabled={!value}
    >
      {copiedId === id ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copiedId === id ? "Copied!" : "Copy"}
    </button>
  );
}

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [key, setKey] = useState(DEFAULTS.key);
  const [copiedId, setCopiedId] = useState("");

  const avalanche = useMemo(() => avalancheTest(text), [text]);
  const hasError = Boolean(avalanche.error);

  const outputs = useMemo(() => {
    const digest = sha256Hex(text);
    const cipher = demoEncrypt(text, key);
    const encoded = base64Encode(text);
    return {
      inputBytes: utf8Bytes(text).length,
      digest,
      cipher,
      recovered: cipher ? demoDecrypt(cipher, key) : null,
      encoded,
      decoded: base64Decode(encoded),
    };
  }, [text, key]);

  const salts = useMemo(() => saltDemo(text || " ", DEMO_SALTS), [text]);

  const reset = () => {
    setText(DEFAULTS.text);
    setKey(DEFAULTS.key);
    setCopiedId("");
  };

  const copy = async (id, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hash className="h-4 w-4" aria-hidden="true" />
          Cryptography learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hashing vs Encryption Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type once and watch the same text go through a real SHA-256 hash, a reversible cipher and
          a Base64 encoder side by side. The hash never comes back; the other two always do. All
          three run in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hve-text">
              Text to transform
            </label>
            <input
              id="hve-text"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hve-key">
              Key for the demonstration cipher
            </label>
            <input
              id="hve-key"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(event) => setKey(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Nothing you type is sent anywhere. Do not paste a password you actually use.
        </p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {avalanche.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Digest bits changed by editing one character
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${PCT.format(avalanche.percentChanged)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Type something to see the avalanche effect."
                : `${NUM.format(avalanche.bitsChanged)} of ${NUM.format(avalanche.totalBits)} bits flipped — a good hash lands near 50%`}
            </p>
          </div>
          <button type="button" onClick={reset} aria-label="Reset the explainer" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Input size", `${NUM.format(outputs.inputBytes)} bytes`],
            ["Hash size", hasError ? "—" : `${NUM.format(SHA256_DIGEST_BITS)} bits, always`],
            ["Ciphertext size", outputs.cipher ? `${NUM.format(outputs.cipher.length / 2)} bytes` : "—"],
            ["Base64 size", `${NUM.format(outputs.encoded.length)} characters`],
            ["Hex digits that differ after the edit", hasError ? "—" : `${NUM.format(avalanche.hexDigitsChanged)} of 64`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${PCT.format(avalanche.percentChanged)} percent of digest bits changed`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.min(100, avalanche.percentChanged)}%` }}
              />
            </div>
            <div className={CODE_BOX}>
              <code className="block whitespace-pre text-xs leading-6">
                {`"${avalanche.original}"\n  ${avalanche.hashA}\n"${avalanche.changed}"\n  ${avalanche.hashB}`}
              </code>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-4">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Hashing — SHA-256</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            One direction only. There is no key and no inverse: the 256-bit digest is far smaller
            than most inputs, so the information simply is not there any more.
          </p>
          <div className={CODE_BOX}>
            <code className="block whitespace-pre-wrap break-all text-sm">{outputs.digest}</code>
          </div>
          <CopyButton id="digest" value={outputs.digest} label="Copy the SHA-256 digest" copiedId={copiedId} onCopy={copy} />
        </div>

        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Encryption — reversible with the key</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            Same text, same key, ciphertext out; feed the key back in and the original returns. Try
            changing one character of the key and watch the recovered text break.
          </p>
          {outputs.cipher ? (
            <>
              <div className={CODE_BOX}>
                <code className="block whitespace-pre-wrap break-all text-sm">{outputs.cipher}</code>
              </div>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Decrypted with this key:{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {outputs.recovered || "(nothing)"}
                </span>
              </p>
              <CopyButton id="cipher" value={outputs.cipher} label="Copy the ciphertext" copiedId={copiedId} onCopy={copy} />
            </>
          ) : (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              Enter a key — encryption without a key is not encryption.
            </p>
          )}
          <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This is a repeating-key XOR, used here only because it is short enough to read. It is
            broken by frequency analysis in seconds and offers no authentication. Real systems use
            AES-GCM or ChaCha20-Poly1305 with a fresh nonce for every message.
          </p>
        </div>

        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Encoding — Base64</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            No key, no secret, published alphabet. It changes how bytes are written so they survive
            a text-only channel; it hides nothing from anybody.
          </p>
          <div className={CODE_BOX}>
            <code className="block whitespace-pre-wrap break-all text-sm">{outputs.encoded}</code>
          </div>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Decoded by anyone:{" "}
            <span className="font-semibold text-[var(--foreground)]">{outputs.decoded || "(nothing)"}</span>
          </p>
          <CopyButton id="encoded" value={outputs.encoded} label="Copy the Base64 output" copiedId={copiedId} onCopy={copy} />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Side by side</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Operation</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Reversible</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Key</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Output size</th>
                <th scope="col" className="py-2 font-semibold">Use it for</th>
              </tr>
            </thead>
            <tbody>
              {OPERATIONS.map((op) => (
                <tr key={op.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{op.label}</td>
                  <td className="py-2 pr-3">{op.reversible}</td>
                  <td className="py-2 pr-3">{op.needsKey}</td>
                  <td className="py-2 pr-3">{op.outputSize}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{op.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {OPERATIONS.map((op) => (
            <li key={`${op.id}-wrong`}>
              <span className="font-semibold text-[var(--foreground)]">{op.label} is wrong for: </span>
              {op.wrongUse}
            </li>
          ))}
        </ul>
      </section>

      {!salts.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Why salt changes everything except speed</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            The same input with different salts produces completely unrelated digests, so one
            precomputed table cannot serve two users. Salt does not make the hash slower, which is
            the separate job of bcrypt, scrypt or Argon2.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Salt</th>
                  <th scope="col" className="py-2 font-semibold">SHA-256 of salt + input</th>
                </tr>
              </thead>
              <tbody>
                {salts.rows.map((row) => (
                  <tr key={row.salt || "none"} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.salt || "(no salt)"}</td>
                    <td className="py-2">
                      <code className="text-xs break-all">{row.digest}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Five things people get wrong</h2>
        <ul className="mt-4 space-y-4">
          {MISCONCEPTIONS.map(([claim, correction]) => (
            <li key={claim} className="text-sm leading-6">
              <span className="font-semibold">&ldquo;{claim}&rdquo;</span>
              <span className="mt-1 block text-[var(--muted-foreground)]">{correction}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A teaching aid, not a security product. The SHA-256 here is a correct implementation of
        FIPS 180-4, but plain SHA-256 is the wrong choice for storing passwords — use bcrypt, scrypt
        or Argon2 with a per-user salt and a tuned work factor.
      </p>
    </main>
  );
}
