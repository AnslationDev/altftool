# Security & Audit module

Enterprise security layer for the admin panel: login/device/session/action
tracking, RBAC-gated audit access, device limits, idle timeout, forced logout,
suspicious-login detection, login rate limiting, and Privacy & Security consent.

## Architecture

```
primitives.js   pure utils: IP mask + AES-256-GCM encrypt, UA parse,
                edge geo, device id, risk scoring   (unit-tested)
config.js       collection names, DEFAULT_SECURITY_SETTINGS, POLICY_VERSION
store.js        Firestore layer (Admin SDK): sessions, devices, consent,
                settings, events, login attempts + buildSecurityContext()
withAdminApi.js centralized route wrapper: rateLimit -> auth(RBAC) ->
                security context -> handler -> automatic audit
```

Data (all Admin-SDK only, denied to clients in `firestore.rules`):
`admin_sessions`, `admin_devices`, `admin_consents`, `security_events`,
`security_settings`, `security_login_attempts`, and the enriched
`admin_audit_logs`.

## APIs (`/api/security/*`)

| Route | Access | Purpose |
|---|---|---|
| `POST session/start` | active admin | create session, register device, enforce device limit, risk score |
| `POST session/heartbeat` | active admin | activity heartbeat + idle / forced-logout check |
| `GET/POST consent` | active admin | consent status / accept |
| `GET sessions` | super admin | list sessions + devices |
| `POST sessions/revoke` | super admin | force logout a session |
| `GET/PUT settings` | super admin | configurable security settings |
| `GET events` | super admin | security event feed |
| `GET audit` | super admin | enriched audit logs |
| `POST login-event` | public (IP rate-limited) | record login attempts + rate limit |

## Using the wrapper in any admin route

```js
import { withAdminApi } from "@/lib/security/withAdminApi";
export const POST = withAdminApi(
  async ({ request, principal, ctx, audit }) => { /* ... */ },
  { requireSuperAdmin: true,
    rateLimit: { limit: 20, windowMs: 60_000, scope: "module:action" },
    audit: { action: "module.action", module: "module" } }, // auto-audited
);
```

Every mutation through the wrapper is automatically written to
`admin_audit_logs` with actor + device + masked/encrypted IP + approx location.

## Configuration

- **`SECURITY_IP_ENC_KEY`** (env) — key for AES-256-GCM full-IP encryption.
  64-char hex, 32-byte base64, or any string (hashed to 32 bytes). If unset,
  only the masked IP is stored (full IP is never persisted in plaintext).
- Approximate location uses **edge/CDN geo headers** (`x-vercel-ip-country`,
  `cf-ipcountry`, …) — no external API calls.
- Defaults (editable in the Security → Settings UI): 30-min idle timeout,
  3 devices per admin, 24-h absolute cap, 8 failed logins / 10 min.

## Consent / policy versioning

Bump `PRIVACY_POLICY_VERSION` in `config.js` whenever the policy text changes.
Admins whose stored consent version is lower are re-prompted on next login via
the `SecurityGate` modal (mounted in the root layout).
