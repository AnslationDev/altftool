# AltFTool Production Deployment Runbook

Last updated: 2026-05-15

This runbook is the release checklist for the monorepo. Use it when CI is green but production is stale, when Vercel deploy jobs are blocked, or before shipping a public web/admin release.

## Source Of Truth

- Monorepo: `AnslationDev/altftool`
- Public web app root: `altftoolweb`
- Admin app root: `altftoolwebadmin`
- Public production health endpoint: `https://altftool.com/api/health`
- Admin health dashboard: `/health` inside `altftoolwebadmin`

## Required GitHub Actions Secrets

Vercel deploy jobs must be able to read these repository secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_WEB_PROJECT_ID
VERCEL_ADMIN_PROJECT_ID
```

`VERCEL_PROJECT_ID` can be used as the public web fallback when `VERCEL_WEB_PROJECT_ID` is not set.

Keep the public and admin projects separated in Vercel:

```text
Public web root: altftoolweb
Admin web root: altftoolwebadmin
```

## Optional Monitoring Inputs

Use these repository variables/secrets when the monitor needs a non-default URL or admin health check:

```text
ALTFT_MONITOR_WEB_URL
ALTFT_MONITOR_WEB_URLS
ALTFT_MONITOR_ADMIN_URL
ALTFT_MONITOR_ADMIN_TOKEN
```

The public monitor defaults to `https://altftool.com`.

## Local Readiness Checks

Run these before a release-style push:

```bash
npm run env:readiness
npm run deploy:readiness -- --target=all
npm run monitor:production
```

Use the strict environment check when validating production secrets through GitHub Actions:

```bash
npm run env:readiness:strict
```

## CI Release Flow

1. Push to `main`.
2. The CI workflow runs lint, route checks, Firebase checks, builds, and emulator/visual coverage.
3. After CI succeeds, the Vercel deploy workflow deploys public web and admin.
4. The deploy workflow runs production monitoring against the deployed URLs.
5. The monitoring workflow can be run manually later to confirm production has not drifted.

Manual deploy fallback:

```text
GitHub Actions -> Vercel Deploy -> Run workflow -> target: all
```

## Debugging A Blocked Deploy

If deploy jobs fail before Vercel runs:

1. Open the admin health dashboard and check `Vercel Deploy Readiness`.
2. Confirm all required secrets exist in GitHub repository settings.
3. Run `npm run deploy:readiness -- --target=all` locally with equivalent environment values.
4. Re-run the failed deploy jobs or manually run the `Vercel Deploy` workflow with target `all`.

If only one target is blocked, validate the matching project id:

```text
Public web: VERCEL_WEB_PROJECT_ID or VERCEL_PROJECT_ID
Admin web: VERCEL_ADMIN_PROJECT_ID
```

## Debugging Stale Production

If CI is green but `https://altftool.com` does not show the latest routes or `/api/health` returns `404`:

1. Confirm DNS points to the intended Vercel project.
2. Confirm the Vercel project root directory is `altftoolweb`.
3. Confirm the latest deploy used the current `main` commit.
4. Open `https://altftool.com/api/health` and compare `release.commitSha` with the current Git commit.
5. Run `npm run monitor:production` and inspect the failed route/API line.
6. Re-run `Vercel Deploy` after fixing project mapping or secrets.

The admin health dashboard also compares the expected commit with the public health endpoint when the deployed app exposes a release commit.

## Post-Deploy Verification

Check these public surfaces after deploy:

```text
https://altftool.com/api/health
https://altftool.com/tools
https://altftool.com/tools/all
https://altftool.com/tools/all/api-stress-estimator
https://altftool.com/api/blogs
https://altftool.com/sitemap.xml
https://altftool.com/robots.txt
https://altftool.com/rss.xml
```

For admin:

```text
/health
/api/health
```

The release is ready only when CI, deploy readiness, production monitoring, Firebase public reads, and the admin health dashboard are all green.
