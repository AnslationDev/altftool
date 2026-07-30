# Branch integration audit — 2026-07-30

This release inspected every fetched local and remote ref before updating the
public and monorepo `main` branches: 155 refs resolving to 126 distinct heads.
Branch age or a newer commit date was not treated as proof that a branch was
safe to merge.

## Integrated

- The complete current `canonical-web/main` history, after reviewing new
  commits that arrived during the release.
- Reviewed SEO, canonical-host, blog metadata, CI, Firebase Admin, and mobile
  hardening changes.
- Three deterministic, browser-local tools that had regressed to a generic
  shell: `bionic-reading-converter`, `audio-video-sync-meter`, and
  `audio-pitch-tempo-shifter`.
- The current canonical public source back into the monorepo web application.
- The current canonical admin source already represented in the monorepo.

## Reviewed but not blindly merged

- `feature/top10`: large unreachable feature surface with mock content, no
  finished `/top10` entry page, and no matching test coverage.
- Lookouts, AnimalHub, games, Pinterest, support, Saurabh refactors, BOPS, Top9,
  backlink/discovery, and aggregate release refs: each either trails `main`,
  carries unresolved or incomplete product work, duplicates code already
  integrated, or mixes useful changes with regressions. Their commits remain
  available for a focused feature release; none was deleted.
- `seo/geo-current` (`c56e44fb7`): contains a real integrity-cleanup intent but
  also removes an icon import that is still rendered and leaves contradictory
  proof claims elsewhere. The raw commit would introduce a runtime regression,
  so it was not cherry-picked.
- Calculator UI merge `732c8b066`: reverted because it introduced global CSS
  collisions, hard-coded design values, an incomplete modal focus trap, and no
  regression tests.

## Tool rescue queue and deployment ceiling

The branch audit found 14 route implementations absent from the current
catalogue and 80 catalogue routes whose full implementation exists in old
history but had been replaced by a shared shell. The functional source is
recoverable from `9d6161977`, `e6ef3f40b`, and `aa8d2ace6`; it is not lost.

Three small local-only tools were restored in this release. The remaining full
rescue does not fit the empirically measured AWS Amplify artifact ceiling:
current accepted builds are approximately 180.5 MiB against a conservative
181 MiB gate, while the remaining implementations are expected to add several
MiB. They must ship in bounded, tested waves or after the tool catalogue is
split into a separate deployment.

The 14 absent implementations are:

- `attempts-and-age-ledger`
- `death-account-freeze-sequencer`
- `deceased-itr-two-period-split`
- `excel-pivot-cache-leak-finder`
- `export-of-services-gst-checker`
- `failed-transaction-compensation`
- `flight-cancellation-refund-auditor`
- `form-10iea-regime-lock`
- `haemoglobin-anaemia-cutoff`
- `life-policy-surrender-value-auditor`
- `lmp-vs-scan-due-date`
- `nta-response-sheet-diff`
- `shift-normalisation-back-solver`
- `tds-refund-lag-calculator`

Medical, tax, insurance, and legal implementations additionally require a
focused factual review before they are exposed as finished tools.
