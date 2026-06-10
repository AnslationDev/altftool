# AltFTool Production Deployment Runbook

Last updated: 2026-05-20

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

Expected Git source for both Vercel projects is `AnslationDev/altftool`. Configure the public web project with root directory `altftoolweb`, and configure the admin project with root directory `altftoolwebadmin`. If the Vercel dashboard shows `AnslationDev/altftools_admin` or `AnslationDev/altftool.com`, reconnect that project to `AnslationDev/altftool` before relying on automatic Git deployments.

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
npm run monitor:links
npm run monitor:links:report
npm run performance:budget:strict
npm run firebase:integrity:strict
npm run deploy:source-check -- --target=all
npm run release:doctor
npm run release:doctor:report
npm run release:history:report
npm run deploy:parity:strict
npm run validate:runtime-quality
```

Use the strict doctor as the final local release gate:

```bash
npm run release:doctor:strict
```

The doctor checks saved admin health manifests, route QA, blog content health, Firebase Admin reads, Firebase public live data, Firebase data integrity, the saved performance budget, Vercel project readiness, production links/images, and production `/api/health` freshness. Use `--offline` when you only want saved local reports and configuration checks. Use `--output-md release-doctor-report.md` to write the same rich Markdown table that GitHub Actions adds to the job summary. Use `--require-vercel-token` in deploy/readiness CI so linked projects without `VERCEL_TOKEN` or `VERCEL_TOKEN_FILE` block the release.

The `Deployment Readiness` GitHub Actions workflow runs the strict doctor and uploads release doctor, Vercel readiness, performance budget, Firebase integrity, and production link/image reports.

After production deploy, run `npm run deploy:parity:strict -- --output production-parity.json --output-md production-parity.md` to compare the live site against local health manifests, route QA, blog content health, sitemap/RSS, Firebase public reads, and the expected commit.

The Vercel web deploy job runs the same strict parity check after production monitoring and uploads `web-production-parity-report.json` plus `web-production-parity-report.md`.

When local web/admin servers are running, `npm run validate:runtime-quality` combines strict route QA, strict Firebase live-data checks, strict Firebase data-integrity checks, and the saved performance budget report. Use `npm run qa:routes:strict -- --output-md route-qa-report.md`, `npm run firebase:live-check:strict -- --output-md firebase-live-report.md`, and `npm run firebase:integrity:strict -- --output-md firebase-integrity-report.md` when you want separate artifacts for debugging.

After `npm run build`, use `npm run performance:budget:strict -- --output performance-budget.json --output-md performance-budget.md` to enforce web/admin JS/CSS chunk budgets, public media budgets, stale asset references, and tool lazy-load boundaries before deployment. Use `npm run performance:budget:report` to refresh the admin health-dashboard snapshot.

Use `npm run monitor:links -- --output production-links.json --output-md production-links.md` to sample production `sitemap.xml`, check same-origin anchors/images, and flag missing canonical/Open Graph tags. Use `npm run monitor:links:strict -- --limit 12` when you want warnings to block a release, or `npm run monitor:links:report -- --limit 12` to refresh the admin dashboard artifact. Use `npm run release:doctor:report` after the checks are clean so the admin health page shows the latest release doctor artifact, then `npm run release:history:report` to append that state to the release history trend panel.

The admin health dashboard opens with a fast `/api/health?lite=1` snapshot that uses saved release-doctor Firebase and production checks. Click `Refresh live` before final release approval to run live Firestore and production `/api/health` probes. When Fix Center shows an action, use its panel link to jump to the exact failing health section; blog content actions also open the blog quality module.

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
4. Run `npm run release:doctor` and confirm there are no blockers.
5. Re-run the failed deploy jobs or manually run the `Vercel Deploy` workflow with target `all`.

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

For sampled crawl health:

```bash
npm run monitor:links -- --url https://altftool.com --limit 24
```

For admin:

```text
/health
/api/health
```

The release is ready only when CI, deploy readiness, production monitoring, Firebase public reads, the admin health dashboard, and `npm run release:doctor:strict` are all green.
