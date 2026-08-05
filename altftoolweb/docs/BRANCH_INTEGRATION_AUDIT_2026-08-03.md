# Branch integration audit — 2026-08-03

This release fetched every configured remote before comparing branch heads with
the production `main` branches. A branch was not allowed to replace newer
production code merely because Git still reported unique ancestry.

## Canonical admin

Every fetched `canonical-admin/*` branch is already an ancestor of
`canonical-admin/main`. No admin feature branch was left unmerged.

## Canonical web

The following refs were reviewed against the newer production tree:

- `Saurabh-ANS`, `Saurabh-Tool-Refactor`, `akku-top9`, `bops/nayan`
- `supportSettings/Shivani`, `samraat/lookouts`, `shalini-games`
- `feature/animalHub`, `feature/top1`, `feature/top6`, `feature/top10`
- `top11/nilesh`, `claude/work`, `claude/altftoolweb-2026-07-29`
- `feat/tools-batch-01`, `feat/tools-batch-02`, `feat/tools-batch-03`
- `altf-backlinks`, `altf-discovery-suite`, `altf-ideas`
- `release/all-branches-merged`, `release/four-branches-merged`
- `release/gsc-wave-with-lookouts`, `release/lookouts-ready`

The production `main` tip is newer than every listed branch. Its audited
release commits already contain the accepted tool waves, Top1, Top6, Top10,
Top11, Lookouts, games, Pinterest, support, Tradeon, prompt-generator, SEO,
mobile, and route-integrity work. Incomplete or unverifiable surfaces such as
the old Top8 rollout remain deliberately quarantined instead of being restored
by an outdated branch tree.

The refs are recorded as reviewed/absorbed with an `ours` merge so future
audits start from a closed branch graph without changing the verified
production tree. No branch was deleted.

## Additional fixes in this release

- Corrected single-voter unanimous totals in the baby-name voting board.
- Standardised copy feedback and destructive reset confirmation for two tools.
- Corrected IVF vector index sizing to the documented conservative nlist rule.
- Rejected fractional vector and HNSW values.
- Fixed video upload validation so an unknown extension is not accepted through
  the output filename fallback.
- Added focused unit regression coverage for the tally and storage calculations.

Both web and admin must pass unit tests, lint checks, and `next build --webpack`
before their production `main` refs are updated.
