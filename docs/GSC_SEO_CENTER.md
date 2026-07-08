# SEO Center — Google Search Console (OAuth 2.0) Integration

A secure, modular Search Console integration in the Admin Panel. Administrators
connect a Google account via OAuth 2.0, select a property, and monitor search
performance. Architected to grow into URL Inspection, Index Coverage, Sitemaps,
Core Web Vitals, alerts, exports, etc.

Route: **Admin → SEO → Search Console** (`/altftool/seo/search-console`).

---

## Architecture

```
UI            modules/seo/search-console/page.jsx        (connect, property picker, analytics)
              modules/seo/search-console/services/…      (Bearer-auth client)
Routes        api/seo/gsc/connect    POST  (Super Admin) → returns Google consent URL
              api/seo/gsc/callback   GET   (Google redirect) → exchange + store
              api/seo/gsc/oauth      GET   status/properties · POST select/disconnect (Super Admin)
              api/seo/gsc/report     GET   live Search Analytics (cached)
              api/seo/gsc/sync       POST  background daily-metrics sync (cron/secret)
Lib           lib/gsc/oauthConfig.js   env, scopes, signed CSRF state, auth URL
              lib/gsc/crypto.js        AES-256-GCM token encryption
              lib/gsc/tokenStore.js    encrypted org connection (Firestore, server-only)
              lib/gsc/oauthClient.js   code exchange, refresh, profile, revoke
              lib/gscClient.js         GSC REST calls — prefers OAuth, falls back to service account
Data          integrations/gscConnection   encrypted tokens + active property (rules: deny all clients)
              gscDailyMetrics/{…}           synced history (server-only)
```

**Security**
- Tokens encrypted at rest (AES-256-GCM). Storage **refuses** to persist without `GSC_TOKEN_ENC_KEY`.
- `integrations/**` and `gscDailyMetrics/**` are denied to all Firestore clients; only the Admin SDK (server) can touch them.
- OAuth callback is protected by an HMAC-signed, short-lived `state` (CSRF).
- RBAC via `withAdminApi`: connect / disconnect / select-property require **Super Admin**; reads require an active admin. Every mutation is audit-logged.
- All routes are rate-limited.
- **Backward compatible:** if no OAuth connection exists, the existing service-account path (`GSC_CLIENT_EMAIL`/`GSC_PRIVATE_KEY` + `GSC_SITE_URL`) still works.

---

## One-time setup

### 1. Google Cloud
1. Create/select a project → **APIs & Services → Enable APIs** → enable **Google Search Console API**.
2. **OAuth consent screen**: External (or Internal for Workspace), add scope
   `https://www.googleapis.com/auth/webmasters.readonly` (and `…/webmasters` for write actions like sitemap submit). Add the connecting admin as a test user if the app is unpublished.
3. **Credentials → Create OAuth client ID → Web application.**
   - Authorized redirect URI: `https://<admin-domain>/api/seo/gsc/callback`
   - Copy the **Client ID** and **Client secret**.

### 2. Environment (admin app)
```bash
GSC_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com
GSC_OAUTH_CLIENT_SECRET=xxxx
GSC_OAUTH_REDIRECT_URI=https://<admin-domain>/api/seo/gsc/callback
# 32-byte key, hex64 or base64.  Generate:  openssl rand -hex 32
GSC_TOKEN_ENC_KEY=<64 hex chars>
# Optional: separate CSRF secret (defaults to client secret if unset)
GSC_OAUTH_STATE_SECRET=<random>
# Optional: enable background sync + give the cron a shared secret
ALTFT_GSC_SYNC_SECRET=<random>
```
Deploy `firestore.rules` (adds the `integrations` / `gscDailyMetrics` deny rules).

### 3. Connect
Admin → SEO → Search Console → **Connect Google** → consent → pick a property. Done.

---

## Background sync (optional)
Schedule a daily `POST https://<admin-domain>/api/seo/gsc/sync` with header
`x-sync-secret: $ALTFT_GSC_SYNC_SECRET`. It snapshots the last 28 days of daily
metrics into `gscDailyMetrics` for trends/alerts. Inert until the secret is set.

---

## Roadmap (clean seams already in place)
Search Analytics (shipped) · URL Inspection · Index Coverage · Sitemaps UI ·
Core Web Vitals · Rich Results · Crawl errors · Mobile usability · Alerts ·
Scheduled CSV/XLSX exports · multi-property dashboards. Each becomes a new
`api/seo/gsc/*` action + a panel under `modules/seo/search-console/`.
