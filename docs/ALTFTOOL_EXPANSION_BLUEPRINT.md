# ALTFTool Expansion Blueprint — "Everything Platform"

Last updated: 2026-07-22
Status: Approved direction — Phase 0 in progress
Source: 15-agent research pass (8 codebase mappers + 6 web researchers + completeness critic)

## Vision

ALTFTool becomes the place where a user finds **everything browser-based**: tools, games,
calculators, converters, AI utilities, and delightful experiences — filled largely by
porting **license-vetted open-source projects** into the existing registry architecture,
plus original builds where open source is legally unusable.

Three pillars (this is what every winning competitor converges on):

1. **TOOLS** — utilities organized task-first (~600 today → 1000+). SEO engine.
2. **GAMES** — first-class games hub (`/games`), each game an indexable landing page.
3. **EXPERIENCES** — neal.fun-style interactives under `/labs`. Not an SEO play —
   the linkbait/brand engine that earns backlinks which lift tool pages' authority.

## What we verified about the current platform

- **The registry pipeline already scales.** A tool = `src/tools/<slug>/{tool.config.js, entry.jsx}`
  → generators emit `toolMetaMap.js` + `toolRuntimeMap.js` → routes, SEO, sitemap, redirects,
  related-tools, search all derive automatically. Adding tool #600 touches 2 new files. This is
  the chassis for ALL expansion — games included. Do NOT invent parallel systems.
- **597 tools live**, each its own webpack chunk (code-split, on-demand rendered).
- **Experiences pattern proven**: 13 standalone apps (patatap, radio-garden, sketchflow…)
  as isolated folders under `src/app/<slug>/` with `createPageMetadata` + chrome opt-out.
- **Admin/Firebase**: blogs, landers, buysmart, deals, extensions, ads publish without deploy.
  Tool/game *code* always needs a deploy; tool *metadata/curation* can become Firestore-driven
  later (extensions module is the template).

## The rules (non-negotiable)

### License policy (verified against real repos — many "obvious" picks are traps)

- **GREEN (pull freely)**: MIT, Apache-2.0, BSD-2/3, ISC, CC0, Unlicense. MPL-2.0 only as
  unmodified npm dep. CC-BY for assets with credit.
- **RED (never ship to browser)**: GPL, AGPL, CC-BY-NC, no-license repos.
  Serving JS to a browser IS distribution — GPL in the client bundle would force
  open-sourcing the site.
- **Verified traps**: it-tools (GPL-3), Hextris (GPL-3), clumsy-bird (GPL-3), monkeytype (GPL-3),
  keybr (AGPL), VERT (AGPL), @imgly/background-removal (AGPL), RegExr (GPL-3),
  tldraw (no longer open source — paid license), react-tetris 8.7k★ (NO license),
  **ffmpeg.wasm default core is effectively GPL** (libx264) — wrapper MIT hai par binary nahi.
- **Assets ≠ code**: audit sounds/sprites/fonts/model-weights separately
  (Patatap audio = Lullatone, not licensed; BRIA RMBG model = non-commercial; winXP icons = Microsoft).
- **Trademarks**: rename + reskin anything cloning a branded game — Tetris, Wordle
  (NYT DMCA'd ~1900 forks), Pac-Man, Flappy Bird, Connect 4 (→ "Four in a Row"), Duck Hunt (skip),
  Crossy Road. Generic-safe names: 2048, sudoku, minesweeper, snake, solitaire, chess, crossword,
  nonogram, memory.
- **Process**: `/licenses` credits page linked from footer (satisfies MIT/Apache/BSD notice
  requirements); `THIRD_PARTY.md` provenance log (repo URL, commit, license, date) per port;
  CI license-allowlist gate (`license-checker`) so GPL/AGPL/unknown deps can't silently enter
  the bundle.

### Engineering rules per port (from master.md + existing patterns)

- Tools/games → registry folders (`src/tools/<slug>/`), NOT new top-level routes.
- Experiences → `src/app/<slug>/` colocated folder + labs registry + chrome gate + sitemap.
- Semantic tokens only, light+dark, WCAG AA, loading.jsx per route segment, `next build --webpack`.
- **Self-host all assets** (`public/<slug>-assets/`) — no raw.githubusercontent / unpkg /
  Google-Fonts / pravatar hotlinks (existing violations listed in Phase 0).
- Heavy WASM (ffmpeg-alternatives, OCR, models) lazy-loads on interaction, never in shared chunks.

## Target category taxonomy (consolidate 92 free-text values → ~20 canonical)

Current taxonomy is fragmented (Utility 43 vs Utilities 12, Game 14 vs Games 11,
Developer 111 vs Developers 9, Education×4 variants…) — each stray value mints a separate
thin category route + sitemap entry.

Canonical set (enforced by generator validation):
`PDF & Documents · Image & Photo · Video & Audio · Text & Writing · AI Tools ·
Finance Calculators · Health Calculators · Math & Everyday Calculators · Converters ·
Generators · Developer · Design & Color · SEO & Social · Security & Privacy ·
Education & Exams · Lifestyle · Fun · Games · Business · Other`

Generator gets an alias map (Games→Game etc.) + fails loudly on unknown categories.

## Vetted open-source catalog (license-verified July 2026)

### Games — Wave 1 (low effort, high SEO, clean license)

| Port | Repo | License | Note |
|---|---|---|---|
| 2048 | gabrielecirulli/2048 | MIT | name safe, 13k★ |
| Word Guess (wordle-like) | lynn/hello or octokatherine/word-master | MIT | NEVER use "Wordle" name |
| Sudoku | TN1ck/super-sudoku (+robatron/sudoku.js) | MIT | generic name |
| Minesweeper | muan/emoji-minesweeper | MIT | generic |
| Snake | patorjk/JavaScript-Snake | MIT | generic, huge volume |
| Solitaire | rjanjic/js-solitaire | MIT | verify quality |
| Dino Runner | wayou/t-rex-runner | BSD-3 | reskin sprite |
| Floppy Bird | nebez/floppybird | Apache-2.0 | keep renamed |
| Block Stacker | dionyziz/canvas-tetris | MIT | rename+reskin (Tetris ™) |
| Maze Muncher | mumuy/pacman (MIT) or platzhersh/pacman-canvas (CC0) | | rename+reskin |
| Memory Match | taniarascia/memory | MIT | generic |
| Space Rocks | chriz001/Reacteroids | CC0 | already React |
| Four in a Row | kenrick95/c4 | MIT | not "Connect 4" ™ |
| Chess (pass-and-play) | chess.js (BSD-2) + react-chessboard (MIT) | | NO Stockfish (GPL), no Lichess UI |
| Crossword | JaredReisinger/react-crossword | MIT | need puzzle data |
| Nonogram | HandsomeOne/Nonogram | MIT | not "Picross" ™ |
| Typing Test | ORIGINAL BUILD (kbsim MIT as base) | | all big typing projects are GPL/AGPL |
| Racer | jakesgordon/javascript-racer | MIT | check sprites |
| HexGL racing | BKcore/HexGL | MIT | heavy assets, iframe-style embed |

Deferred: multiplayer .io games (need WebSocket servers).

### Tool libraries — powers 60–100 new tool pages, zero server cost

| Category | Stack (all green-list) |
|---|---|
| PDF suite | pdf-lib (MIT) + jsPDF (MIT) + PDF.js (Apache-2.0) — merge/split/rotate/watermark/create/to-image |
| Image compress/convert | jSquash (Apache-2.0, Squoosh codecs as npm) + browser-image-compression (MIT) — incl. compress-to-KB pages |
| OCR | tesseract.js (Apache-2.0) |
| Spreadsheets | SheetJS CE (Apache-2.0 — pull from cdn.sheetjs.com, npm 'xlsx' is stale/CVE) + ExcelJS (MIT) |
| Data converters | PapaParse + js-yaml + fast-xml-parser (MIT) — full JSON↔YAML↔CSV↔XML matrix |
| JSON tools | vanilla-jsoneditor + jsonrepair (ISC) |
| QR | node-qrcode + qr-code-styling (MIT) — incl. UPI QR variant |
| Diff | jsdiff (BSD-3) + diff2html (MIT) |
| Cron | cron-parser + cRonstrue (MIT) — crontab.guru-clone |
| Whiteboard | @excalidraw/excalidraw (MIT) — NOT tldraw |
| Diagrams | Mermaid (MIT) live editor |
| Audio | wavesurfer.js (BSD-3) + wasm-media-encoders (MIT) — NOT lamejs (LGPL), NOT default ffmpeg.wasm |
| Video | MP4Box.js (BSD-3) + WebCodecs — the GPL-free video path |
| In-browser AI | Transformers.js (Apache-2.0) + permissive models only (check EVERY model license) |
| Encoding/crypto ops | CyberChef modules via npm (Apache-2.0, Crown Copyright notices) |
| Dev converters | ritz078/transform (MIT, already Next.js) |
| Whole-suite seed | iib0011/omni-tools (MIT, client-side React) — the legal it-tools alternative |

### Experiences — Wave 1

| Port | Repo | License | Note |
|---|---|---|---|
| Fluid simulation | PavelDoGreat/WebGL-Fluid-Simulation | MIT | 16.5k★, archetypal viral toy |
| Ambient mixer | remvze/moodist | MIT | AUDIT each sound file's license |
| Falling sand | MaxBittker/sandspiel | MIT | Rust→WASM build |
| Aquarium sim | MaxBittker/orb.farm | MIT | shares sandspiel toolchain |
| Star map | ofrohn/d3-celestial | BSD-3 | pairs with locations/[geo] → "night sky above [city]" programmatic SEO |
| Game theory explainer | ncase/trust | CC0 | whole ncase catalog is CC0/MIT — a content vertical |
| Chiptune sequencer | johnnesky/beepbox | MIT | state-in-URL = viral shares |
| Drum machine | vincentriemer/io-808 | MIT | synthesized sounds (no clearance needed) |
| Retro desktop | ShizukuIchi/winXP / DustinBrett/daedalOS | MIT | MS assets risk — generic-ize; daedalOS is Next.js |
| Retro CSS kits | 98.css / XP.css / 7.css | MIT | instant retro skins |
| Vector field art | anvaka/fieldplay (+ city-roads, peak-map) | MIT | anvaka catalog is MIT gold |
| MIDI editor | ryohey/signal | MIT | "online MIDI editor" niche |

NOT usable: harmony (GPL), Life Engine (GPL), boids/beneater (no license), VirtualSky (no license),
BrowserQuest (MPL+CC-BY-SA), Chrome Music Lab (Apache but archived — cherry-pick only).

### SEO opportunity clusters (India-weighted, from trends research)

1. **Exam-photo cluster**: resize image to 20KB/50KB + per-exam pages (SSC/UPSC/IBPS/RRB) +
   signature resizer — huge Indian demand, weak competition, pure client-side.
2. **India finance**: SIP/step-up-SIP/SWP, EMI+amortization, income tax FY old-vs-new (annual
   refresh), GST, HRA, PPF/FD/RD, rent receipt generator. Highest CPC.
3. **Student**: CGPA→percentage (per-university variants ×50 pages), attendance/75% calculator,
   marks percentage, exam countdowns.
4. **AI writing loop**: AI detector ↔ humanizer (note: humanizer is policy-gray — decide stance),
   paraphraser, summarizer, AI image detector (rising, low competition).
5. **Evergreen heads**: QR (+UPI QR), password gen, word counter (+per-platform limits),
   age/percentage/date-diff calculators, unit+currency converter pair-pages (USD-INR…),
   typing test (+SSC practice mode), invoice (+GST format), resume+ATS checker.
6. **Games SEO**: each game = `/games/<slug>` landing "[name] online free"; one flagship
   daily puzzle for retention + daily hints/answers companion pages.
7. **AVOID (legal/ad-policy)**: video downloaders (DMCA ruling 2026, AdSense ban),
   watermark removers for third-party content.

## Phased roadmap

### Phase 0 — Foundation & remediation (BEFORE mass import)

Structure hardening (started 2026-07-22):
- [x] Wire registry generators into `predev`/`prebuild` (was: manual — silent-drift foot-gun).
- [x] `/games/[slug]` → redirect to real tool page when slug exists (was: search page).
- [x] Fix games search: `games`→`game` alias in ToolsClient.
- [x] Real `/games` hub page (indexable, filtered registry view, JSON-LD CollectionPage/ItemList,
      in header nav + footer + sitemap + QA route inventory) — 2026-07-22.
- [x] GameShell shared component + useBestScore hook at `src/tools/_shared/game/` — 2026-07-22.
      (`type: "game"` config field deferred — hub filters on Game category for now.)
- [x] Category taxonomy consolidation (94 → 21 canonical) — 2026-07-22.
      `src/platform/registry/categoryTaxonomy.js` is the single source of truth (canonical set,
      alias map, calculator refinement, slug overrides); generator fails loudly on unknown values;
      original free-text values preserved per-tool as `topics` (search + related-tools + chips);
      legacy category slugs 301 via proxy.js (85 redirects) + page-level backstop; sitemap and
      ToolsClient slugs unified on slugifyCategory ("&"-safe).
- [ ] Single route-manifest module feeding sitemap.js + GlobalChromeGate + labs registry + nav
      (today: 4 hand-edited lists that already disagree; ~16 shipped routes missing from sitemap).
      Partial 2026-07-22: /licenses, /account/* added to sitemap + QA inventory.
- [ ] Fix dead code: Footer non-landing branch (POPULAR_TOOL_LINKS/legal links never render),
      Header dead second implementation, extensionResolver (broken import), api-stress-estimator
      legacy hardcoded routes, dead Vite main.jsx files.
- [x] `test:route-loading` green (68 loading.jsx generated) — 2026-07-22.
- [x] `/licenses` credits page (footer-linked, sitemap) + THIRD_PARTY.md — 2026-07-22.
      License-checker CI gate still pending.
- [x] Web lint errors 0 (42 fixed: react-hooks/refs, no-html-link-for-pages) — 2026-07-22.
- [x] UX chrome shipped — 2026-07-22: CookieBanner re-wired in layout (was removed with no
      replacement), NewsletterSubscribeDialog persists to new `newsletter_subscribers`
      collection (create-only rules; NOT under world-readable projects/altftool/**),
      ScrollToTopButton, full Firebase auth (/account login/signup/forgot-password/profile,
      AccountMenu in both header variants, lazy firebase/auth loading).
- [x] Home "Ask AltF AI" assistant box — 2026-07-22: client-side engine
      (src/platform/assistant/) — FAQ intents + registry search + suite shortcuts
      (AltFLovePDF/IMG), lazy-loaded on interaction, zero network.
- [x] Games hub genre taxonomy (puzzle/arcade/word/board/card/casual) + trademark fix:
      candy-crush → candy-match-3 (name, slug, strings, 301s) — 2026-07-22.
      NOTE: "Simon Says Game" and "Whack-a-Mole" names are borderline (Hasbro/Mattel
      electronic-game marks) — review if scaling ads.
- [ ] Asset self-hosting sweep: soft-murmur GitHub-raw mp3s (unverified licenses!), Google Fonts
      @imports, unpkg icons, pravatar, Esri tiles attribution (flightradar disables it — ToS violation).

Legal/ad-policy kill-list (decide per surface: rename / fix / remove):
- [ ] Trademark-named routes: /patatap, /radio-garden (UI already "OpenAir Garden" — rename route),
      /soft-murmur, /windowswap, playbuzz, kym ("Know Your Meme" clone), wattpad. The OpenAir
      rename is the model. Remove "Patatap clone" keywords.
- [ ] flightradar: markets SIMULATED data as "real-time flight tracking" — relabel honestly
      ("flight radar simulator") — AdSense deceptive-content risk.
- [ ] siding: fictional contractor business with fake testimonials + lead form on altftool.com —
      remove or clearly fictionalize; also double-chrome bug.
- [ ] playbuzz/ads.js fake "Sponsored" placements — remove (AdSense policy).
- [ ] Cookie consent: CookieBanner currently removed from layout with no replacement —
      EEA/UK ads need a certified CMP (Google Privacy & messaging or restore banner) BEFORE
      AdSense scale-up.
- [ ] ancestory behindthename scraping (CORS-dead + ToS risk) — remove that code path.
- [ ] **ALREADY-SHIPPED license exposure (verified 2026-07-22)**: `@imgly/background-removal`
      (AGPL-3.0) is used by 5 live surfaces (src/tools/bg-remover, profile-pic-bg-changer,
      altflovepdf/tools/remove-background, altfloveimg/lib/aiEngines) and `@ffmpeg/ffmpeg`
      (default core binary is GPL via libx264) by 4 tools (video-compressor, video-trimmer,
      mp3-cutter-audio-trimmer, frame-rate-converter). Migration path: Transformers.js
      (Apache-2.0) + permissive model for bg removal; MP4Box.js + WebCodecs (or custom
      LGPL-only ffmpeg core) for video/audio. Highest-priority legal remediation.

### Phase 1 — Games vertical (2–3 weeks equivalent)

Wave-1 games (table above) through the registry as `type: "game"` + GameShell; real /games hub
with genre taxonomy (puzzle/arcade/word/board/card); per-game SEO content (original write-ups,
how-to-play, NOT template boilerplate — differentiation vs the 100 other sites embedding the
same MIT 2048); VideoGame JSON-LD; games in nav + sitemap.

### Phase 2 — Tool-library expansion (rolling)

Seed from the library table: PDF suite → image compress-to-KB cluster → India finance/student
calculators → data converters → dev tools → AI (Transformers.js). Every tool: client-side badge
("your file never leaves your browser"), FAQ schema, hand-written or admin-engine SEO copy for
top-traffic pages (NOT the 7 shared templates — thin-content risk is real; site already has
"Discovered – currently not indexed" history).

### Phase 3 — Experiences wave (1/quarter cadence)

Port Wave-1 experiences via the formalized experience manifest. Each gets credits drawer
(upstream attribution), self-hosted assets, labs card, sitemap entry — all generated from
one manifest object.

### Phase 4 — Scale infrastructure (when catalog passes ~800)

Registry split (directory index vs full meta — 597-entry map currently ships in every /tools
RSC payload); generateStaticParams for top-traffic tool pages; precomputed related-tools;
sitemap segmentation (generateSitemaps) before 50k URLs; QA sharding (546 tools currently have
no blocking runtime check); Firestore-driven tool curation layer (hide/feature/reorder without
deploy — extensions module pattern); replace 597 per-slug next.config redirects with one
middleware rule.

## Risk register (from adversarial critique)

1. **One AdSense account + one domain = shared blast radius.** Deceptive surfaces (fake flight
   data, fictional siding business, fake sponsored units, prank pages) can demonetize everything.
   Phase 0 kill-list is therefore FIRST, not optional.
2. **Scaled-content-abuse risk**: 1000+ pages on 7 templates + commodity ported games. Mitigation:
   original per-page content for anything we want indexed; noindex the long tail until it has
   unique copy.
3. **Copyleft/asset contamination** without a CI license gate — gate is Phase 0.
4. **Silent drift under mass import** (manual generators, 4 disagreeing route lists) — automation
   is Phase 0, before volume.
5. **Cost**: wasm/model weights (10–100MB) need lazy-load + caching strategy; Amplify SSR
   invocations for 600+ on-demand pages; watch bundle total-gzip budget (6000 KiB pot).
6. **Fork maintenance**: THIRD_PARTY.md provenance + pinned versions + ownership per port.

## Success metrics (define baseline before Phase 1)

- Search Console: indexed pages, impressions per surface (tools/games/blogs/experiences).
- Revenue per surface (AdSense page-level).
- CWV budgets per surface class; bundle budgets green.
- QA: route-loading green, priority-tool suite green, zero sitemap/nav drift (manifest-derived).
