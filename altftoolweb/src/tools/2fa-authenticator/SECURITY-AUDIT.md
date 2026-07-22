# Security Audit — 2FA Authentication (2fa-auth.com + AltFTool 2FA Authenticator)

**Scope:** (A) black-box review of the external site `https://2fa-auth.com/`, and (B) source-level security audit of your own client-side authenticator (`src/tools/2fa-authenticator/`).
**Standard:** OWASP ASVS v4.0 (L1/L2), OWASP Top 10, TOTP RFC 6238.
**Verdict:** The external site is **unsafe by design — do not enter real secrets.** Your own tool is **architecturally sound** (real encryption, no plaintext storage, no network exfiltration) with **one requirement-level violation to fix** (an on-load OTP from a hardcoded demo secret) plus a few hardening items.

---

## Part A — `https://2fa-auth.com/` (external, black-box)

**What it is:** A **centralized, server-side** "live 2FA code" service. Users paste a 2FA secret (and, per the on-page example `abcd|12345|Z665ORJWBCNHL6L3LIFU7XAESEOVLDZK|c_user=61577280120115…`, Facebook **session cookies**) and the server returns rotating codes, with a login and a server-side "code history".

**Why that is dangerous (this is the headline finding):**

| # | Issue | Severity | Why |
|---|-------|----------|-----|
| A-1 | **TOTP secrets are uploaded to a third-party server** | **Critical** | A TOTP secret is a *permanent* shared key. Whoever holds it can mint valid 2FA codes for that account **forever**. Handing it to a website hands them your second factor. |
| A-2 | **Example input bundles session cookies (`c_user=…`)** | **Critical** | Combining `secret + cookies` is the exact recipe for full account takeover / session hijacking. This is the signature of bulk social-account automation, not a personal authenticator. |
| A-3 | **Ecosystem of clone domains** (`2facter.com`, `2fa.red`, `fbclid-igsh.com/2fa`, `2fa.zone`, `2-fa.com`, `2fa.co.com` …) | **High** | Disposable, near-identical "live code" sites are a known pattern for credential-harvesting tooling. No accountable operator, no audited privacy guarantee. |
| A-4 | **No verifiable client-side processing** | **High** | Unlike a real authenticator, codes are computed server-side, so the secret *must* leave your device. "Trust us" is the only guarantee. |

**Recommendation:** Treat `2fa-auth.com` (and its clones) as **untrusted**. Never paste a real TOTP secret or cookies into it. If any real secret was ever entered there, **rotate/disable 2FA on that account and re-enrol**, and invalidate active sessions/passwords. A legitimate authenticator never needs your secret to leave your device — which is exactly what your own tool does.

> I can only observe this site as a black box (no server source), so A-1…A-4 are behavioral/architectural findings, not line-level ones.

---

## Part B — AltFTool 2FA Authenticator (source audit)

Files in scope: `src/tools/2fa-authenticator/pages/index.jsx`, `lib/vault.js`, `lib/totp.js`.

### B.1 Findings summary

| ID | Severity (policy / real-impact) | Requirement violated | File · line |
|----|------|----------------------|-------------|
| **F-01** | **High** / Low | "NEVER generate/reveal OTPs without user-provided secret"; "no hardcoded secrets" | `pages/index.jsx` · 48, 353 (→ 521-552) |
| **F-02** | Low | "no cached OTPs" | `pages/index.jsx` · 374, 554-561, 1376-1392 |
| **F-03** | Info | "prevent unauthorized access" | `pages/index.jsx` · 565-596 + `lib/vault.js` (device mode) |
| **F-04** | Medium | "strict CSP", defense-in-depth (ASVS V14.4) | app-level (`next.config.mjs`) — not tool-local |
| **F-05** | Info | clipboard hygiene edge case | `pages/index.jsx` · `scheduleClipboardClear` |

No **Critical** issues. No hardcoded *user* secrets, no demo accounts, no plaintext storage, no network calls, no key leakage, no predictable security values (see B.3).

---

### F-01 — OTP generated & displayed on page load from a hardcoded demo secret · **High**

**What happens:** The secret input is initialised to a hardcoded value, so on first paint — with **zero user input** — the "Your Authentication Code" panel computes and shows a live TOTP, and that code is also pushed into "Recent Codes".

```js
// pages/index.jsx:48
const DEMO_SECRET = "JBSWY3DPEHPK3PXP";
// pages/index.jsx:353
const [secret, setSecret] = useState(DEMO_SECRET);
// pages/index.jsx:521-552  — runs on mount because `secret` is already a valid Base32 value
useEffect(() => {
  if (!now) return;
  const trimmed = secret.trim();
  if (!trimmed) { setCode(""); return; }
  if (!isValidSecret(trimmed)) { setCode(""); return; }
  generateTOTP({ secret: trimmed, ... }).then((value) => setCode(value)); // ← OTP shown, no user action
}, [secret, digits, period, algorithm, activeCounter]);
```

**Root cause:** The form state is seeded with a hardcoded Base32 secret for demo/visual purposes, and the generation effect is gated only on *validity*, not on *user provenance*. So a valid-looking default trips the exact behaviour your requirements forbid.

**Real-world impact (honest):** **Low.** `JBSWY3DPEHPK3PXP` is a well-known public test vector — computing its code discloses nothing sensitive and it is not any user's secret. **But** it is a direct violation of your stated #1 rule ("never generate/reveal OTPs unless the user explicitly provided a secret/QR") and of "no hardcoded secrets," and it means the crypto path executes with no authorization/input — the precise class you asked to eliminate. Hence **High priority to fix**, low data-exposure.

**Exact fix** (applied in the delivered file):

```js
// remove line 48 entirely (delete DEMO_SECRET)
// pages/index.jsx:353
const [secret, setSecret] = useState("");            // start empty — no OTP until the user provides input
```

The generation effect already no-ops on an empty secret (`if (!trimmed) { setCode(""); … }`), so with an empty initial value **no OTP is produced, displayed, or recorded until the user types a Base32 key or scans a QR.** I also changed the decorative phone mock-up's placeholder from a numeric `483 921` to non-numeric dots so nothing on the page can be mistaken for a live code before input.

**ASVS:** V1.9 (trusted enforcement), V5.1 (input-driven execution), V6.4 (secret management).

---

### F-02 — "Recent Codes" retains generated OTPs in memory · **Low**

Every generated code is pushed to a `recent` array and rendered ("View Full History"):

```js
// pages/index.jsx:374, 554-561
const [recent, setRecent] = useState([]);
useEffect(() => {
  if (!code) return;
  setRecent((prev) => [{ code, time: stamp }, ...prev].slice(0, 12));
}, [code]);
```

**Root cause:** Product feature (matches the reference design) that keeps a visible log of past OTPs.

**Impact:** Low. It is **in-memory only** (React state — cleared on reload, never persisted to storage or network), and TOTPs expire in ≤ your chosen period. Still, retaining/displaying used OTPs is discouraged (an over-the-shoulder / screen-capture window). Note: once F-01 is fixed, this list no longer auto-fills with a demo code.

**Recommended fix (choose one):**
- Keep, but make it explicit it is session-only and cap at a small N (already sliced to 12). *(lowest effort)*
- Or drop the raw code and only show a masked marker + timestamp (e.g. `••• ••• · 10:24:30`).
- Or remove "Recent Codes / View Full History" for a security-max build.

**ASVS:** V8.1 (sensitive data in memory), V8.3 (minimise retention).

---

### F-03 — Device-key mode auto-generates saved-account codes without re-authentication · **Informational**

```js
// pages/index.jsx:565-596 — regenerates codes for every saved account each second
// lib/vault.js — "device" mode auto-decrypts with a non-extractable key on load
```

In the default **device-key** mode the vault auto-unlocks on the same browser profile, so anyone with access to that unlocked profile sees live codes without any prompt. This is a deliberate, documented trade-off (frictionless UX) and is **mitigated** by: the key being **non-extractable** (can't be exfiltrated), per-origin/per-profile isolation, and the optional **passphrase (zero-knowledge) mode** with inactivity auto-lock.

**Recommended hardening (optional):** offer a "require passphrase" setting or make passphrase mandatory for a security-max deployment; consider a short idle lock even in device mode. All secrets already stay out of React state and DevTools (`secretsRef` is a `useRef` Map).

**ASVS:** V3.3 (session/idle timeout), V2.2 (auth strength options).

---

### F-04 — No enforced Content-Security-Policy · **Medium (defense-in-depth)**

The tool's code is CSP-clean (no inline scripts, no `eval`, no `innerHTML`), but the app does not ship a CSP header, so the browser has no backstop if an XSS sink is introduced elsewhere. A ready-to-enable policy was provided in `SECURITY.md`; enable it (start in `Content-Security-Policy-Report-Only`, then enforce). Key directive: `script-src 'self'` (no `unsafe-inline` for scripts).

**ASVS:** V14.4.3 (CSP), V14.4.1 (security headers).

---

### F-05 — Clipboard auto-clear can overwrite unrelated clipboard content · **Informational**

`scheduleClipboardClear()` writes `""` to the clipboard 30s after a copy. If the user copied something else in the interim, that is clobbered. Acceptable trade-off for a password-manager-style hygiene feature; document it, or gate it behind a setting.

---

### B.3 Positive controls (verified present) — what's done right

| Control | Evidence | ASVS |
|--------|----------|------|
| Secrets **encrypted at rest** (AES-256-GCM in IndexedDB), never plaintext | `lib/vault.js` `encryptJSON`/`decryptJSON`; **0** `localStorage`/`sessionStorage` uses | V6.2.1, V8.1 |
| **Non-extractable** device key — cannot be exported/leaked | `extractable:false` (×4) on `generateKey`/`deriveKey` | V6.2.1 |
| Passphrase mode: **PBKDF2-SHA256, 600,000 iters**, random 16-byte salt, key in memory only | `deriveKeyFromPassphrase` | V2.4.1, V6.2.2 |
| **CSPRNG** for salt/IV/IDs; **0** `Math.random` in security paths | `crypto.getRandomValues` | V6.3.1 |
| Fresh **12-byte IV per encryption** | `encryptJSON` | V6.2.5 |
| Secrets **never in React state / DevTools** (held in `useRef` Map) | `secretsRef` | V8.1 |
| **0** `console.*` calls touching secrets/keys | grep across all 3 files | V7.1.1 |
| **No XSS sinks** — no `dangerouslySetInnerHTML`, `eval`, `new Function`, `innerHTML` | grep | V5.3.3 |
| **Input validation & prototype-pollution safety** — allow-list account rebuild, Base32 validation | `sanitizeAccount`, `isValidSecret` | V5.1.3, V5.1.4 |
| **No network exfiltration** — all OTP/secret work is local Web Crypto | no `fetch`/XHR on secrets | V9.1, V1.9 |
| **Memory clearing** on lock / `pagehide` / inactivity | `lock()`, effects | V8.1 |
| TOTP correctness | RFC 6238 test vectors pass (SHA1/256/512) | — |

### B.4 Requirement-by-requirement compliance

| Your requirement | Status |
|------------------|--------|
| Never generate/reveal OTP without user-provided secret/QR | ❌ → ✅ after **F-01** fix |
| No hardcoded secrets | ❌ → ✅ after **F-01** fix |
| No default/demo accounts | ✅ (Saved Accounts starts empty; encrypted vault seeds nothing) |
| No exposed APIs (OTP) | ✅ (all client-side; no OTP endpoint) |
| No cached OTPs | ⚠️ in-memory "Recent Codes" only — **F-02** |
| No insecure localStorage/sessionStorage | ✅ (encrypted IndexedDB; 0 plaintext storage) |
| No predictable values | ✅ (CSPRNG; no `Math.random`) |
| No bypassable validation | ✅ after **F-01** (validity **and** provenance gate) |
| No client-side-only *false* security | ✅ real AES-GCM at rest; non-extractable key |
| No leaked encryption keys | ✅ non-extractable device key; passphrase key memory-only |
| Every OTP from the user's own encrypted secret | ✅ after **F-01** (saved codes read from `secretsRef`) |
| Require validation before execution | ✅ after **F-01** |
| Prevent unauthorized access | ✅ / ⚠️ device-mode auto-unlock is a documented trade-off — **F-03** |

---

## Remediation priority

1. **Now (High):** F-01 — remove `DEMO_SECRET`, start `secret` empty. *(applied in delivered file)*
2. **Soon (Medium):** F-04 — enable the CSP header (report-only → enforce).
3. **Optional (Low/Info):** F-02 mask/trim Recent Codes; F-03 offer/enforce passphrase + idle lock; F-05 gate clipboard-clear.

*Prepared for AltFTool. External-site findings are behavioral (no source access); tool findings are line-referenced against the audited source.*
