# AltFTool production deployment runbook

Last updated: 2026-08-04

This is the release checklist for the current AWS Amplify production setup.
Detailed Amplify build settings, app IDs, and rollback guidance live in
[`AWS_AMPLIFY_RUNBOOK.md`](./AWS_AMPLIFY_RUNBOOK.md).

## Production source map

| Surface | Integration source | Deployment source | Amplify app / branch | Production URL |
| --- | --- | --- | --- | --- |
| Public web | `AnslationDev/altftool` (`altftoolweb/`) | `AltFTool/knaltftoolweb` | `d3o0ra1ab3rxzf` / `main` | `https://www.altftool.com` |
| Admin | `AnslationDev/altftool` (`altftoolwebadmin/`) | `AltFTool/knadmintiertwoanslation` | `d3qv0il8ey2gki` / `main` | `https://www.tier2.anslation.com` |

The monorepo and the two deployment repositories intentionally have different
layouts and Git histories. Never merge one repository's `main` directly into
another. Review branch content against the newest destination tree, port only
the accepted files, and preserve deployment-only pruning/configuration.

The old Vercel workflow remains a manual fallback. It is disabled on normal
monorepo pushes unless the repository variable
`ALTFT_ENABLE_VERCEL_ADMIN_DEPLOY=true` is deliberately configured.

## Pre-release branch audit

1. Fetch every configured remote without deleting any working branch:

   ```bash
   git fetch --all --prune --tags
   ```

2. Confirm the monorepo `main`, canonical web `main`, and canonical admin
   `main` tips. Review every non-ancestor branch with both commit and content
   diffs. A stale branch must not overwrite a newer production implementation.
3. Preserve dirty worktrees. If an uncommitted file is byte-identical to the
   latest `main`, it is already integrated and should not be recommitted.
4. Keep quarantined, incomplete, fabricated, or soft-404 surfaces out of the
   release even if an old branch still contains them.

## Required validation

Both Next.js applications must build with webpack as required by `master.md`:

```bash
npm run design:check
npm run security:secrets
npm run lint:web
npm run routes:check
npm run tools:check
npm run build:web
npm run build:admin
npm run bundle:audit
npm run performance:budget:strict
```

Run focused unit and route checks for the changed area. For a complete release,
use `npm run validate:full`; for a bounded release pass, at minimum run catalog,
route-loading, tool-readiness, SEO URL/sitemap, and production-monitor tests.

## Deploy

Pushing an audited deployment repository's `main` triggers its Amplify build.
If the current canonical commit is already pushed and only a clean rebuild is
needed, start an Amplify `RELEASE` job instead of manufacturing an empty commit.

Public web rebuild:

```bash
aws amplify start-job \
  --app-id d3o0ra1ab3rxzf \
  --branch-name main \
  --job-type RELEASE \
  --region ap-south-1
```

Admin rebuild:

```bash
aws amplify start-job \
  --app-id d3qv0il8ey2gki \
  --branch-name main \
  --job-type RELEASE \
  --region ap-south-1
```

Use an AWS profile that has Amplify job permissions. Never print environment
variables or replace an Amplify app's complete environment map with a partial
map.

## Verify the deployment

Wait for the corresponding job to reach `SUCCEED`:

```bash
aws amplify list-jobs \
  --app-id d3o0ra1ab3rxzf \
  --branch-name main \
  --region ap-south-1 \
  --max-results 5
```

Then run:

```bash
npm run monitor:production
npm run monitor:links:strict -- --limit 24
```

Public checks:

```text
https://www.altftool.com/
https://www.altftool.com/api/health
https://www.altftool.com/tools/all
https://www.altftool.com/sitemap.xml
https://www.altftool.com/robots.txt
https://www.altftool.com/rss.xml
```

Admin checks:

```text
https://www.tier2.anslation.com/login
https://www.tier2.anslation.com/api/tools/slugs  (must reject unauthenticated access)
```

The release is ready only when the Amplify job succeeds, the public health API
is healthy, route/link monitoring passes, and the canonical domains serve the
expected application rather than a cached error page.

## Rollback

Do not force-push a broad or unknown tree. Revert the specific release commit
in the affected deployment repository, push the revert to its `main`, and wait
for the new Amplify job. For build-memory regressions, follow the environment
fallbacks in `AWS_AMPLIFY_RUNBOOK.md`.
