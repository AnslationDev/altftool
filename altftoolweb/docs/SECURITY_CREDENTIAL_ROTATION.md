# Credential Rotation Runbook

This runbook is for credentials that may have been pasted into chat, copied into
local files, exposed in logs, or shared outside the deployment secret store.
Never paste replacement values into source code, pull requests, tickets, or
documentation.

## Immediate rule

Treat an exposed credential as compromised even when the repository secret scan
is clean. A clean scan proves only that the current tracked and unignored files
do not contain a recognized credential value.

Rotate in this order so public traffic and admin access keep working:

1. Create a replacement credential with the minimum required permissions.
2. Add it to the production secret store for web, admin, CI, and monitoring.
3. deploy a controlled release and verify the new credential is active.
4. Revoke the old credential.
5. Run the validation commands below and record only the credential ID suffix,
   rotation date, owner, and verification result.

## Provider checklist

### Vercel

- Rotate `VERCEL_TOKEN`.
- Confirm `VERCEL_ORG_ID`, `VERCEL_WEB_PROJECT_ID`, and
  `VERCEL_ADMIN_PROJECT_ID` remain identifiers, not secrets.
- Update the GitHub Actions repository secret.
- Run `npm run deploy:readiness -- --target=all`.
- Revoke the previous token only after a dry-run readiness check passes.

### Firebase Admin

- Create a new service-account key with only the roles required by the admin
  application.
- Prefer `FIREBASE_SERVICE_ACCOUNT` in the deployment secret store, or provide
  the split `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
  `FIREBASE_PRIVATE_KEY` values.
- Do not deploy a filesystem path to a downloaded JSON key.
- Update admin hosting and CI secrets, verify Firestore reads/writes, then delete
  the previous key in Google Cloud IAM.
- Run `npm run env:readiness:strict` and
  `npm run firebase:admin-write-check:dry-run`.

### Google API keys

- Rotate private server-side Google, Gemini, YouTube, Maps, and monitoring keys
  that were exposed.
- Restrict browser keys by exact production origin and API allowlist.
- Restrict server keys by API allowlist and the hosting platform controls
  available for that runtime.
- Firebase browser configuration is public by design, but it still requires
  Firebase Security Rules, authorized domains, quota controls, and App Check
  where supported.

### Monitoring and admin login

- Rotate `ALTFT_MONITOR_ADMIN_TOKEN` or the monitoring login password.
- Keep monitoring credentials separate from a human super-admin account.
- Verify the authenticated admin health endpoint, then revoke the old session
  or password.

### Other providers

- Rotate any OpenAI, RapidAPI, Adzuna, Alpha Vantage, Giphy, Remove.bg, or other
  private keys that were shared outside the secret store.
- Leave an optional integration disabled when no replacement key is configured;
  public pages must keep a clear fallback state.

## Repository verification

Run from the monorepo root:

```bash
npm run security:secrets
npm run env:readiness:strict
npm run tools:readiness:strict
npm run test:security
```

The repository ignores environment files, service-account exports, PEM files,
and private-key files. The secret scanner also rejects tracked credential-like
filenames and high-confidence provider token patterns without printing values.

## Rotation record

Store the audit record in the organization password manager or security system,
not in Git:

- provider
- credential identifier suffix
- environment
- owner
- created at
- old credential revoked at
- verification command/result
- next rotation due date

Never store the credential value in the record.
