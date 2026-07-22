# 2FA Authenticator — Security Architecture

This tool is **100% frontend-only**. No secret key, no generated OTP, and no
derived encryption key is ever sent to a server, API, analytics service, or any
third‑party library. Everything runs in the browser via the Web Crypto API.

## Encryption model

Saved-account secrets are stored **encrypted with AES‑256‑GCM** in IndexedDB —
never in plaintext, and never in `localStorage`. There are two unlock modes:

| Mode | Key | Guarantee |
|------|-----|-----------|
| **Device key** (default) | A **non‑extractable** `AES‑GCM` `CryptoKey` generated once and kept inside IndexedDB. `extractable: false` means JavaScript can **never read the raw key bytes** — it cannot be exfiltrated by XSS or copied to another browser profile. | Frictionless. Ciphertext is useless on any other profile/device; the key can't be stolen. |
| **Passphrase** (opt‑in) | A key derived from the user's passphrase with **PBKDF2‑SHA256, 600,000 iterations**, random 16‑byte salt. The key lives **only in memory** after unlock and is never persisted. | Zero‑knowledge. Even with full storage access, the ciphertext can't be decrypted without the passphrase. |

- A fresh random 12‑byte IV is used for every encryption.
- Wrong passphrase is rejected automatically by the GCM authentication tag.
- The active key is held in a **module‑scoped variable**, never in React state.

## How each requirement is met

- **Never transmit secret/OTP** — no `fetch`/`XHR`/`WebSocket` touches secrets or
  codes; TOTP is computed locally with `crypto.subtle`. Dynamic `import("jsqr")`
  loads a same‑origin chunk; QR images are decoded on a local `<canvas>`.
- **No plaintext at rest** — only `{iv, ct}` ciphertext (and, for passphrase mode,
  a salt) is written to IndexedDB.
- **Secrets never in React state / DevTools** — saved‑account secrets live in a
  `useRef(Map)`, not `useState`. React only holds display metadata (name, email,
  settings) and the visible OTP codes.
- **No secrets in logs / URLs / history** — there are zero `console.*` calls that
  touch secrets, and nothing is ever placed in the URL or `history`.
- **Clipboard hygiene** — only the OTP (not the secret) is ever copied, and the
  clipboard is auto‑cleared 30 seconds after a copy.
- **Memory clearing** — removing an account deletes its secret from the `Map`
  immediately; locking, tab‑hide inactivity (5 min), `beforeunload`/`pagehide`,
  and component unmount all clear the in‑memory key and secrets.
- **Input validation & prototype‑pollution safety** — every account is rebuilt
  from an allow‑list of known keys into a fresh object literal (`__proto__`,
  `constructor`, `prototype` in input can't pollute `Object.prototype`); secrets
  are validated against the Base32 alphabet; names/emails are stripped of control
  characters and angle brackets and length‑capped.
- **XSS / DOM injection** — no `dangerouslySetInnerHTML`, no `eval`, no
  `new Function`, no `innerHTML`. React escapes all rendered text.
- **Account isolation** — IndexedDB is per‑origin **and** per‑browser‑profile, and
  the device key is non‑extractable, so one profile's data can't be read by
  another user or profile. Passphrase mode adds zero‑knowledge on top.

The crypto and sanitization layer ships with 23 unit tests (AES‑GCM round‑trip,
wrong‑key rejection, unique IVs, prototype‑pollution safety, allow‑list coercion,
Base32 validation).

## Content Security Policy

The tool itself is CSP‑clean: no inline scripts, no `eval`, no external network
calls. Because CSP is a **site‑wide HTTP header** that affects all ~599 tools,
your ads, and heavy libs (TensorFlow, ffmpeg‑wasm, Monaco), roll it out carefully.

**Recommended: start in report‑only mode**, watch the violation reports, then
switch the header name to `Content-Security-Policy` once clean.

Add to `next.config.mjs`:

```js
const csp = [
  "default-src 'self'",
  // Next.js injects a small inline bootstrap script; use a nonce (via middleware)
  // for a strict policy, or 'unsafe-inline' as a pragmatic start.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",          // Tailwind + React inline styles
  "img-src 'self' data: blob:",                 // QR canvas + data/blob URLs
  "font-src 'self' data:",
  "connect-src 'self'",                         // widen for your ads/analytics
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",                     // clickjacking protection
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// inside your existing config object:
async headers() {
  return [
    {
      source: "/tools/:path*",                  // scope to tool pages first if you like
      headers: [
        // test first, then rename to "Content-Security-Policy"
        { key: "Content-Security-Policy-Report-Only", value: csp },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ];
}
```

For a **strict** `script-src` (no `'unsafe-inline'`), generate a per‑request nonce
in `middleware.js`, add it to the CSP header and pass it to Next's script tags —
Next.js reads the nonce from the CSP header automatically for its own scripts.

## Notes

- Saved accounts start **empty** (the encrypted vault seeds nothing). The demo
  code in the middle panel comes from the example key pre‑filled in the form.
- If IndexedDB or Web Crypto is unavailable, the tool still generates codes; it
  just can't persist saved accounts that session.
- Forgotten passphrase = unrecoverable saved accounts, by design (zero‑knowledge).
