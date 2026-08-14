# Merge Log — consolidating branches into `beta`

Starting HEAD: 4b7c50007 (fix(tools): wave-69 audit fixes across 25 tools)
Base: codex/main-reconcile-20260805

Order: broad-consolidation branches first (reconcile/final/release/merge-all/finalize/preserve-all-work/integrate/canonical),
then remaining candidates. Ancestor status re-checked immediately before each merge attempt.

## IMPORTANT STRUCTURAL FINDING (discovered while processing `merge-one`)

`git merge merge-one` failed immediately with `fatal: refusing to merge unrelated histories`.
Investigation (`git rev-list --max-parents=0 <ref>` on every one of the 91 candidate branches) shows the
91 candidates actually span **three unrelated git root commits**, not one:

- **Family A** — root `c143ffd404...` — this is `beta`'s own history (same root as `origin/main` and
  `codex/main-reconcile-20260805`). **22 branches.** These are genuine same-history candidates and were
  processed normally per the workflow below.
- **Family B** — root `00f88004c0...` ("Publish ALTFTool web app") — confirmed via
  `git rev-list --max-parents=0 canonical-web/main` to be **exactly `canonical-web`'s root commit**, and
  confirmed NOT an ancestor of `origin/main`. **62 branches.**
- **Family C** — root `7ec6266b8d...` — confirmed via `git rev-list --max-parents=0 canonical-admin/main`
  to be **exactly `canonical-admin`'s root commit**. **7 branches.**

In other words, ~69 of the 91 "candidate" branches are not late-breaking unmerged work on top of the
combined-repo history — they are entire parallel histories of the **out-of-scope legacy split repos**
(`canonical-web` / `canonical-admin`), just parked as local/origin refs inside this repo's object database
(their names — `codex/canonical-web-release-*`, `codex/canonical-admin-*`, `merge-one`, `merge-all`, etc. —
match this). They have a completely different top-level layout (flat `src/` app, no `altftoolweb/` +
`altftoolwebadmin/` npm-workspace split) and no common ancestor with `beta`. `git merge` refuses them
outright; the only way to combine them at all would be `--allow-unrelated-histories`, which for 69 branches
each importing an entire foreign repo tree is not a "conflict to resolve" — it is a full repo-architecture
decision that must be made by a human, and it falls squarely under the explicit instruction to treat
`canonical-web`/`canonical-admin` as out of scope.

**Decision:** Family A (22 branches) processed normally below. Family B + Family C (69 branches total)
are logged as `SKIPPED — needs human review` as a batch, not attempted with `--allow-unrelated-histories`.
Full membership lists are at the bottom of this file.

## Family A merges (same history as beta)

- codex/reconcile-all-branches-20260806: merged, resolved 29 conflicts (files: altftoolweb/src/app/tools/generated/toolSeoMap.br [regenerated], altftoolweb/src/platform/registry/toolMetaMap.js [regenerated], altftoolweb/src/tools/ai-object-counter/tool.config.js, altftoolweb/src/tools/azerbaijan-entry-requirement-checklist/lib.js, altftoolweb/src/tools/base64-to-hex/seo.js, altftoolweb/src/tools/bio-link-page-builder/seo.js, altftoolweb/src/tools/birthday-wishes-tamil/lib.js, altftoolweb/src/tools/budget-planner/pages/index.jsx, altftoolweb/src/tools/cardiac-output-calculator/pages/index.jsx, altftoolweb/src/tools/chess-multiplayer/seo.js, altftoolweb/src/tools/codex-chat-transfer/components/Main.jsx, altftoolweb/src/tools/cpr-compression-rate-metronome/lib.js, altftoolweb/src/tools/cpr-compression-rate-metronome/pages/index.jsx, altftoolweb/src/tools/css-filter-effects/pages/index.jsx, altftoolweb/src/tools/diabetes-dashboard/components/{Dashboard,LogEntryForm,UserProfile}.jsx, altftoolweb/src/tools/diabetes-dashboard/pages/index.jsx, altftoolweb/src/tools/domain-expiry-renewal-planner/lib.js, altftoolweb/src/tools/emoji-hub/seo.js, altftoolweb/src/tools/lateral-entry-merit-calculator/lib.js, altftoolweb/src/tools/meeting-agenda-builder/tool.config.js, altftoolweb/src/tools/multi-country-clock/seo.js, altftoolweb/src/tools/pdf-preview-tool/pages/index.jsx [hand-merged both sides' unique logic: kept beta's pdfInstance-cleanup/race-guard refs + reconcile's dragActive handler refactor], altftoolweb/src/tools/personal-data-flow-mapper/spec.js, altftoolweb/src/tools/south-korea-visa-cover-letter-builder/{lib.js,pages/index.jsx}, altftoolweb/src/tools/speed-date-rotation-planner/spec.js, altftoolweb/src/tools/test-pyramid-ratio-planner/lib.js). Each conflict resolved by verifying against the surrounding non-conflicting (already auto-merged) code which side's variables/helpers/behavior the rest of the file actually depends on, not by arbitrary pick. Ran `npm --prefix altftoolweb run generate:registry` + `node altftoolwebadmin/scripts/generate-tool-slugs.mjs` to regenerate toolMetaMap.js/toolSeoMap.br/toolNetworkMap.js/toolCatalog.generated.js/toolSlugs.generated.js after resolving hand-written conflicts. Net diff: 3402 added, 586 modified, 26 deleted files (deletions are legacy route cleanup: bops/insurance, brandrating, buzzfeed, desktop, constellation-finder — all pre-existing on the reconcile branch's side, not something this merge introduced by mistake).
- codex/final-reconcile-20260806: skipped, already ancestor
- codex/main-reconcile-20260806-final: skipped, already ancestor
- origin/codex/main-reconcile-20260805: skipped, already ancestor
