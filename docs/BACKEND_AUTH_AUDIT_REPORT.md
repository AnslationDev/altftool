# Backend & Authentication Audit Report

**Repo:** `altftool` (monorepo) · **Date:** 2026-06-17
**Focus:** why backend services and login/signup were failing; root causes; fixes applied; recommendations.
**Companion:** see `ARCHITECTURE_CODE_MAP.md` for the visual architecture map.

---

## Executive summary

Login was failing for a single, decisive reason: **`altftoolwebadmin/.env.local` shadowed the valid Firebase Admin credentials in `.env` with empty/placeholder values and a service-account file path belonging to another developer's machine.** Because Next.js loads `.env.local` at *higher precedence* than `.env`, the Firebase **Admin SDK could not initialize**, so every admin API route — including `/api/admin/me`, the gate the whole login flow depends on — returned HTTP 500. The client `AuthContext` treated that 500 as a fatal auth error and **signed the user straight back out**, so login appeared to "fail" or loop.

This is now fixed and verified. Along the way I also fixed two real security defects (a fail-open cron endpoint and a host-header-spoofable superadmin bypass), hardened the Admin SDK config loader against this class of failure, and made the client auth flow resilient to transient backend errors.

| # | Problem | Severity | Status |
|---|---------|----------|--------|
| 1 | `.env.local` shadows valid Admin SDK credentials → login fails | 🔴 Critical | ✅ Fixed |
| 1b | `.env` `FIREBASE_PRIVATE_KEY` itself was corrupted (a base64 line missing its leading char) → key is cryptographically invalid | 🔴 Critical | ✅ Fixed (correct key re-supplied & verified) |
| 2 | Stray `FIREBASE_SERVICE_ACCOUNT_FILE` made Admin SDK fail even with valid split creds | 🔴 Critical | ✅ Fixed (hardened) |
| 3 | `/api/notifications/scheduler` fail-open when `CRON_SECRET` unset | 🟠 High | ✅ Fixed |
| 4 | `adminAccess.js` superadmin bypass via spoofed `Host` header | 🔴 Critical | ✅ Fixed |
| 5 | `AuthContext` force-logout on transient 5xx (logout loop) | 🟠 High | ✅ Fixed |
| 6 | No server-side guard on `(protected)` route group | 🟠 High | 📋 Recommended |
| 7 | In-memory rate limiting won't hold across serverless instances | 🟠 High | 📋 Recommended |
| 8 | Hardcoded Firebase web-config fallbacks in source | 🟡 Medium | 📋 Recommended |
| 9 | Weak admin password policy (6 chars, no complexity) | 🟡 Medium | 📋 Recommended |
| 10 | SSRF surface in `link-preview` / `pagespeed` proxies | 🟡 Medium | 📋 Recommended |
| 11 | Duplicated inline auth checks + missing rate limits on some routes | 🟡 Medium | 📋 Recommended |
| 12 | Dead code (root scripts, disabled endpoint) | 🟢 Low | 📋 Recommended |

---

## Part 1 — Root cause analysis

### 1.1 The login failure (critical)

**Symptom:** users could not sign in to the admin console; login appeared to hang or bounce back.

**Trace (UI → DB):**

1. `login/page.jsx` calls Firebase client `signInWithEmailAndPassword` / `signInWithPopup` — *this part worked* (the public web config is valid).
2. `AuthContext.jsx` → `onAuthStateChanged` → `getIdToken(true)` → `GET /api/admin/me` with the Bearer token.
3. `/api/admin/me` calls `adminAuth.verifyIdToken(token)`, which triggers lazy Admin SDK init in `firebaseAdmin.js`.
4. **Admin SDK init threw** `Firebase Admin credentials are not ready (...)` → route returned **500**.
5. `AuthContext.syncUser` hit its `if (!res.ok)` branch and called `signOut(auth)` → user nulled → back to login.

**Why the SDK couldn't initialize — the env precedence trap:**

Next.js merges env files with `.env.local` overriding `.env` *per key*. `.env` contained correct credentials, but `.env.local` re-declared them with broken values:

```
# altftoolwebadmin/.env.local  (BEFORE — broken)
FIREBASE_CLIENT_EMAIL=                                   # empty → shadows the real value in .env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPASTE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"   # placeholder
FIREBASE_SERVICE_ACCOUNT_FILE=/Users/niki/Downloads/altftool-bca36-firebase-adminsdk-...json   # another machine's path; does not exist here
NEXT_PUBLIC_FIREBASE_VAPID_KEY=                          # empty → broke push registration
YOUTUBE_API_KEY=                                         # empty → broke YouTube route
```

`validateFirebaseAdminConfig()` correctly rejected this (empty client email + placeholder key), **and** the unreadable `FIREBASE_SERVICE_ACCOUNT_FILE` pushed an additional fatal "file could not be read" error — so even if the split creds had been valid, the stray file path alone would have failed initialization. Net effect: `status.ok === false` → thrown error → 500 on every admin route.

**Second credential fault (found later, finding 1b):** the `FIREBASE_PRIVATE_KEY` stored in `.env` was itself **corrupted** — one 64-char base64 line had lost its leading character (`...Ozmsg\nA4V/Ys7...` on disk vs the correct `...Ozmsg\nWA4V/Ys7...`). The app's `privateKeyLooksUsable()` heuristic only checks for the PEM markers and a body length ≥ 64, so it passed the check, but Node's crypto decoder **rejects** the key (`error:1E08010C:DECODER routines::unsupported`), which means `admin.credential.cert()` / `verifyIdToken` would have failed even after the `.env.local` shadowing was fixed. The correct key was re-supplied and written to `.env`; it now parses as a valid RSA-2048 key and passes a sign/verify round-trip. This is a good argument for replacing the length heuristic with a real `crypto.createPrivateKey()` parse at startup (see recommendations).

**Confirmed by replicating Next's env precedence** against the real files: before the fix the resolved `FIREBASE_CLIENT_EMAIL` was empty and `FIREBASE_PRIVATE_KEY` was the 82-char placeholder; after the fix the resolved values are the real service-account email and a 1735-char usable PEM key.

### 1.2 Why "signup" looked broken

There is **no public signup** in this product. New Google users (on `@anslation.com`) are recorded as a *pending* `accessRequest` via `/api/admin/google-login`, then a superadmin approves them. Because that endpoint **also** depends on the Admin SDK (`verifyIdToken`), the same credential failure made the request-access ("signup") path 500 as well. Fixing the Admin SDK restores both.

### 1.3 Other defects found during the trace

- **`/api/notifications/scheduler` was fail-open:** `if (secret && authHeader !== ...)` skipped auth entirely when `CRON_SECRET` was unset — anyone could trigger mass-notification delivery.
- **Host-header superadmin bypass:** `isLocalDevAdminRequest()` granted the well-known `local-dev-admin-token` superadmin access when `NODE_ENV==='development'` **or** the `Host` header was `localhost`. The `Host` header is client-controlled, so a production deployment could be tricked into full superadmin access by spoofing `Host: localhost`.
- **Logout loop on 5xx:** `AuthContext` signed the user out of Firebase on *any* non-OK `/api/admin/me` response, turning a recoverable backend hiccup into a hard logout.

---

## Part 2 — Fixes implemented

All changes are in `altftoolwebadmin/`.

### Fix 1 — Restore Admin SDK credentials (`.env.local`)
Rewrote `.env.local` to contain **only** genuine local overrides (dev switches + `CRON_SECRET`) and removed every empty/placeholder key that was shadowing `.env`. Added an explicit warning header documenting the precedence trap so it can't silently recur. The valid credentials in `.env` now take effect.

### Fix 2 — Harden the Admin SDK config loader (`src/lib/firebaseAdmin.js`)
`validateFirebaseAdminConfig()` now computes `credentialsResolvable` (complete split/inline creds + valid PEM + valid email) and treats a missing/unreadable `FIREBASE_SERVICE_ACCOUNT_FILE` (or malformed optional source) as **non-fatal when working credentials already exist**. A leftover service-account path can no longer take down the whole SDK.

### Fix 3 — Fail-closed cron endpoint (`src/app/api/notifications/scheduler/route.js`)
If `CRON_SECRET` is unset/empty the endpoint now returns **503 and refuses to run** (logged), instead of executing unauthenticated. A present-but-mismatched token still returns 401.

### Fix 4 — Remove host-spoofable admin bypass (`src/lib/adminAccess.js`)
`isLocalDevAdminRequest()` now gates **exclusively** on `process.env.NODE_ENV === 'development'` (server-controlled, un-spoofable) and no longer trusts the client `Host` header. The unused `isLocalHostRequest` helper was removed; no other references exist.

### Fix 5 — Resilient client auth (`src/context/AuthContext.jsx`)
`syncUser` now distinguishes **5xx (transient/backend/config)** from auth decisions: on 5xx it stops loading and surfaces no admin data **without** calling `signOut`, eliminating the logout loop. Genuine 401/403/404 behavior is unchanged.

### Verification performed
- Replicated Next.js env precedence against the actual `.env` + fixed `.env.local`: **Admin SDK config resolves valid** (real client email, 1735-char usable PEM, no stray file, VAPID + YouTube keys restored). Result: `ADMIN SDK CONFIG OK: true`.
- `node --check` passes on all edited `.js` files; no remaining references to the removed helper; `deliverBroadcast` import surface for the scheduler intact.

---

## Part 3 — Recommended improvements (not yet applied)

These are higher-effort or higher-risk and are listed in priority order. They were intentionally left as recommendations rather than applied blind to a large unfamiliar codebase without a runnable integration test suite.

**Security**
1. **Server-side guard for `(protected)`** — today the layout is client-only; pages are shells and data is protected at the API layer, but add a server check (cookie-based session or a server component guard) for defense-in-depth. Note: tokens currently live in client storage, not cookies, so a true edge middleware needs a session-cookie strategy (`signInWithCustomToken` / session cookies via Admin SDK).
2. **Distributed rate limiting** — `@altftool/core/http` uses an in-memory `Map`; on Vercel/serverless each instance has its own bucket, so effective limits multiply by instance count. Back it with Redis/Upstash or Vercel KV.
3. **Stronger admin password policy** — raise the 6-char minimum to ≥12 with complexity, or prefer Google SSO exclusively (`/api/admin/create`).
4. **SSRF allowlist** — `link-preview` and `pagespeed` accept arbitrary URLs; block private/loopback IP ranges and non-public hosts before proxying.
5. **Move hardcoded fallbacks out of source** — Firebase *web* config keys are public by design, but the hardcoded fallbacks in `firebase.js` / `health` should come from env to avoid drift; ensure the real `.env`/`.env.local` are never committed (currently correctly git-ignored).
6. **Validate `scheduledAt`/`actionUrl`** on broadcasts (reject past timestamps; sanitize/allowlist URLs).

**Consistency & scalability**
7. **Consolidate auth checks** — several admin routes re-implement `verifySuperAdmin` inline; route them all through `adminAccess.verifySuperAdminRequest` and add `isActive` checks where missing (e.g. some `support` routes).
8. **Add missing rate limits** — `/api/admin/list`, `/api/admin/superadmins`, `/api/audit/log`.
9. **Structured logging** — replace scattered `console.error` with a logger/Sentry so 500s are diagnosable in production (this audit would have been a one-line log).
10. **Use transactions** for access-request approval to avoid the check-then-write race in `approve/route.js`.
11. **Bound caches** — blog `memoryCache` in the web app is an unbounded `Map`; add LRU/max-size; consider raising `adminAccessCache` TTL (5s) for read efficiency.

**Cleanup**
12. **Remove dead code** — empty root scripts (`cache.js`, `dedupe.js`, `fetchFeeds.js`, `normalize.js`, `rank.js`, `sources.js`) and the disabled `skill-demand-analyzer/analyze` route.

---

## Part 4 — Files changed

| File | Change |
|------|--------|
| `altftoolwebadmin/.env` | Replaced the corrupted `FIREBASE_PRIVATE_KEY` with the correct key; reorganized + documented (Admin SDK now initializes; verified RSA-2048 sign/verify) |
| `altftoolwebadmin/.env.local` | Removed credential-shadowing placeholders; kept only valid local overrides + documented the precedence trap |
| `altftoolwebadmin/src/lib/firebaseAdmin.js` | Stray/unreadable service-account file no longer fatal when valid creds exist |
| `altftoolwebadmin/src/app/api/notifications/scheduler/route.js` | Fail-closed when `CRON_SECRET` is unset |
| `altftoolwebadmin/src/lib/adminAccess.js` | Removed host-header-spoofable bypass; gate on `NODE_ENV` only |
| `altftoolwebadmin/src/context/AuthContext.jsx` | No force-logout on transient 5xx |

---

## Part 5 — How to confirm locally

```bash
# from repo root
npm run dev:admin            # starts admin on :3001

# In another shell, sanity-check Admin SDK env resolution / health:
npm run firebase:check       # firebase contracts
npm run env:readiness        # required env vars present
```

Then open `http://localhost:3001/login` and sign in with an `@anslation.com` Google account or a seeded admin. `/api/admin/me` should now return 200 and route you to your first allowed module instead of bouncing back to login.

> Note: I could verify the credential resolution and code correctness statically, but I could not exercise a live Firebase login from this environment. The decisive root cause (env shadowing) and its fix are confirmed by replicating Next.js's exact env precedence against your real files.
