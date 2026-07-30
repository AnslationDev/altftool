# AltFTool — Backlink Execution Kit

> Researched 2026-07-25 by 8 parallel agents with live web verification, then
> spot-checked by hand. Every URL below was fetched on that date; re-check
> anything before you act on it weeks later.
>
> **What this is:** a do-it-yourself kit. Creating accounts, submitting
> listings, posting to communities and sending outreach are actions only you
> can take — they need your credentials and your judgement. Everything that
> *could* be prepared in advance is prepared here: verified targets, current
> rules, and ready-to-paste copy.

## Ground rules (apply to every channel)

1. **Never buy links, never join link-exchange schemes, never mass-blast.** One
   penalty wipes out a year of this work.
2. **Never ask for upvotes** on Product Hunt / Hacker News / Reddit. Ask people
   to *look* and *comment*. Vote solicitation is detected and penalised.
3. **Personalise every outreach email.** Templated blasts get deleted and can
   get your domain flagged as spam.
4. **Never claim something untrue** about a competitor. Every "this tool went
   paid / has limits" claim must be checkable on their own page today.
5. **Write community posts and GitHub PRs yourself.** Several targets
   (awesome-privacy, free-for-dev, dev.to) explicitly reject AI-written
   submissions or require disclosure — respect that; it is their house rule.

## Verification status (checked by hand, 2026-07-25)

| Claim | Status |
|---|---|
| AlternativeTo rules: 1-week wait for new accounts, ban list includes "collections of online tools", no URLs in descriptions, ownership claim via support@ from your domain | **Verified** — quoted from their FAQ |
| Calculator.net page is the softest target (19 alternatives, 2 likes, rivals at 1 like) | **Verified** |
| SaaSHub submission is free, needs competitors listed, domain-email verification speeds review | **Verified** |
| Uneed accepts submissions with no account to start | **Verified** |
| Peerlist Launchpad | **Could not verify** — returns HTTP 403 to automated fetch; open in a normal browser |
| `altftool.com/embed` is live in production | **Verified live** (251 widgets shown at fetch time). Note: the research agents saw a 404 earlier the same day, so this deployed mid-research. Their "deploy before pitching" warnings are now satisfied — but confirm the deployed build matches your latest code |
| `/patatap` still ships the original project's name | **Verified** — see blocker below |

## Blockers to clear before promoting (ranked)

**1. ~~`/patatap` uses another project's exact name~~ — CLEARED 30 Jul 2026.**
The route published itself as "Patatap - Portable Animation and Sound Kit" and
targeted "Patatap clone" as a keyword, while `experienceCatalog.js` had already
named it **KeyCanvas**. The page now matches the catalog on title, H1,
description and keywords, so it no longer trades on Jono Brandel and
Lullatone's work title. Also removed: "windows minesweeper clone" and
"classic tetris clone" from `/pranx` keyword sets — positioning a page as a
clone of a named product is the least defensible framing available.

The `/patatap` **slug** is unchanged, and so are `/radio-garden` and
`/geektyper`. Changing a live URL needs a redirect plan and costs whatever the
old path ranks for, so that stays your call.

**1b. Still yours to decide: the Tetris naming.** `/pranx` titles a game
"Tetris Blocks — Free Browser Game" and targets "tetris online free" and
"play tetris no download". TETRIS is a registered mark that The Tetris Company
enforces actively against browser implementations — more actively than most
rights holders in this space. Renaming costs those keywords. I removed only the
"clone" phrasing and left the rest for you, because the trade is yours: the
downside is a takedown against a domain you are about to promote.

**2. Confirm the production deploy matches this repo.** Local commits here are
not pushed to any remote in this working tree, yet production serves the embed
system — so prod is being updated by a separate path. Before sending anyone a
link, load it yourself.

## Suggested order

| When | Do this | Why first |
|---|---|---|
| Today | Create the AlternativeTo account (do nothing else with it) | 1-week cooldown starts now |
| Today | SaaSHub + Uneed submissions | Free, no cooldown, fastest live links |
| This week | dev.to `#showdev` article, Indie Hackers product listing | No gatekeepers |
| This week | Sign up for Featured.com / SOS journalist digests | Free, compounding |
| ~Aug 1 | AlternativeTo listing, then suggest it on the incumbent pages | Cooldown expires |
| ~Aug 1+ | Product Hunt launch (platform first, not one tool) | Wants preparation |
| Ongoing | Listicle outreach + calculator-embed outreach, ~10 personalised emails/week | Highest quality links, slowest |
| Later | WordPress plugin, GitHub/npm package | Biggest effort, biggest compounding |

---
## AlternativeTo.net

### Rules, timing and pitfalls

HOW THE CHANNEL WORKS IN 2026 (all verified today, 2026-07-25): account required; brand-new accounts must wait 1 week before submitting an app page; submission via user icon > "Suggest new application" (manage-item is login-gated); moderation takes "a couple of days up to a week"; suggesting an alternative on an existing app page = "Contribute to this page" > "Suggest Alternatives" (instant, then like-votes rank it). Curl is Cloudflare-blocked; the site is otherwise fully live.

THE ONE BIG RISK: the FAQ's verbatim ban list rejects "simple converters, calculators... formatters... online text/photo/video editors... online PDF tools... online background removal tools... collections of online tools". So (a) per-tool submissions for pdf-merger, bg-remover, image-compressor, json-formatter WILL be rejected — never submit them; (b) even the platform listing is at moderator discretion. Counter-evidence that it still works: ToolThump (privacy-first client-side tool collection, AltFTool's exact profile) was added 2025-07-18 and now appears on remove.bg's page alongside Namaste Tools; Omni Tools, SD6Tools, CalcHub, Purple Peak are all recent multi-tool/calculator collections with live listings. Lead the listing with the privacy/client-side architecture — that is what distinguishes accepted collections from rejected ones.

SELF-PROMOTION RULES: adding your own app is explicitly allowed; claim ownership via support@alternativeto.net from the product domain. Never incentivize likes or create accounts to vote — the ranking algorithm demotes detected manipulation. Descriptions cannot contain URLs, emails, or phone numbers. App name / official-website-link changes require admin approval. Games "face higher standards" — do not lead with the 41 casual games.

TIMING: create the account today so the 1-week cooldown runs; realistic go-live of the listing is Aug 3-8, 2026. One suggestion pass across the 7 good-fit incumbent pages takes under 30 minutes once the listing is live.

BACKLINK VALUE: high-DR domain; the listing yields an official-website link plus presence on 7+ high-intent "alternatives to X" pages (Photopea's page alone: 353 likes of traffic-driving popularity; calculator.net's page is winnable to the #1 slot with 2-3 likes). Treat it primarily as referral/brand placement — do not assume dofollow.

DO NOT MENTION /embed IN THE LISTING YET: https://altftool.com/embed returns "Page Not Found" on production today (embed system exists only in the uncommitted dev tree). The long description references embeddable widgets generically — deploy /embed before or shortly after the listing goes live, or delete that sentence. All other AltFTool URLs in this report were title-verified live today (beware: altftool.com soft-404s with HTTP 200 and title "Tool Not Found", so always check titles, not status codes). Skipped as submission material: /apps (Android APK pages carry placeholder screenshots and unverifiable download/review counts — would fail moderation and credibility review).

### Targets

#### ✅ AlternativeTo — Suggest new application (submission entry, login-gated)
- **URL:** https://alternativeto.net/manage-item/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — gateway for everything else on this channel; nothing can be suggested as an alternative until this page exists
- **Requirements:** Free. Account required; NEW ACCOUNTS MUST WAIT 1 WEEK before they can submit an app (create account today, submit ~Aug 1). Approval: 'between a couple of days and up to a week'. Descriptions may NOT contain URLs, emails, phone numbers. Fields: name, short summary (~140 chars), long description, platforms (Online/Web-based), license (Free/Proprietary), tags, icon, screenshots, 'alternative to' apps.
- **Fit:** The only way in. Submit ONE app page: 'AltFTool' as a platform (privacy-first, client-side). Precedent: ToolThump (added Jul 18, 2025), Namaste Tools, SD6Tools, Omni Tools — all multi-tool privacy-first collections that got accepted despite the FAQ ban list, because they are polished and differentiated.

#### ✅ iLovePDF on AlternativeTo (25 likes, 159 alternatives listed)
- **URL:** https://alternativeto.net/software/ilovepdf-com/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — exact-intent audience actively looking to leave iLovePDF; moderate like-counts mean a new entry with a few likes surfaces on page 1
- **Requirements:** Requires the AltFTool app page to be approved first. Suggesting an alternative = logged-in click, instant, then community votes rank it.
- **Fit:** Suggest the approved AltFTool listing as an alternative here (Contribute to this page > Suggest Alternatives). AltFTool asset: https://altftool.com/altflovepdf (verified live: 'Online PDF Converter — Free PDF Tools') + /tools/all/pdf-merger, /tools/all/pdf-split-tool. Angle mirrors accepted BentoPDF: free, browser-based, files never uploaded.

#### ✅ Smallpdf on AlternativeTo (61 likes, 200+ alternatives)
- **URL:** https://alternativeto.net/software/smallpdf/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — Smallpdf's page ranks for high-volume 'Smallpdf alternative' queries; PDF is AltFTool's deepest vertical
- **Requirements:** AltFTool app page approved first; then one-click alternative suggestion.
- **Fit:** Same PDF-suite play: AltFTool (via /altflovepdf) is a free, no-signup, client-side answer to Smallpdf's freemium limits. Top rivals here (PDFgear 66, PDF24 152) are desktop apps — 'no install, browser-only, private' is the open flank.

#### ✅ TinyPNG on AlternativeTo (25 likes)
- **URL:** https://alternativeto.net/software/tinypng/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — low like-counts on this page mean fast visibility; image compression is a top AltFTool traffic tool
- **Requirements:** AltFTool app page approved first.
- **Fit:** AltFTool asset: https://altftool.com/tools/all/image-compressor (verified: 'Image Compressor Tool - Reduce Image Size Online') under the platform listing. Squoosh (37 likes) proves browser-based client-side compressors rank well here; AltFTool adds batch + resizer + cropper in one place.

#### ✅ remove.bg on AlternativeTo (33 likes)
- **URL:** https://alternativeto.net/software/remove-bg/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — proven placement pattern for tool-collection platforms on this very page
- **Requirements:** AltFTool app page approved first; suggest platform as alternative, mention bg-remover in the listing's feature list.
- **Fit:** AltFTool asset: https://altftool.com/tools/all/bg-remover (verified live). Direct precedent on this exact page: Namaste Tools ('free privacy-focused web toolkit') and ToolThump ('open-source collection of utilities') are listed as remove.bg alternatives — platform listings representing their bg-remover tool. NOTE: a standalone 'online background removal tool' submission is explicitly banned; it must ride on the platform listing.

#### ✅ Photopea on AlternativeTo (353 likes, 119 alternatives)
- **URL:** https://alternativeto.net/software/photopea/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — heavyweight competition (GIMP 4,795, Photoshop 2,439 likes) means AltFTool lands deep in the list, but the page traffic is the largest of the eight
- **Requirements:** AltFTool app page approved first.
- **Fit:** AltFTool asset: https://altftool.com/tools/all/image-editor (verified live) via the platform listing. Photopea's own pitch is 'all client-side for privacy' — identical USP language to AltFTool, so the suggestion is credible. High-traffic page.

#### ✅ Canva on AlternativeTo (403 likes, 159 alternatives)
- **URL:** https://alternativeto.net/software/canva/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — do last, or skip until AltFTool ships a real template-based design tool
- **Requirements:** AltFTool app page approved first.
- **Fit:** Weakest pairing: AltFTool's image-editor + collage-maker only partially overlap Canva's template/design use case. Suggest only after the listing is established elsewhere; a poor-fit suggestion can draw downvotes that hurt ranking everywhere.

#### ✅ JSONFormatter.org on AlternativeTo (4 likes, 50+ alternatives)
- **URL:** https://alternativeto.net/software/json-formatter/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — tiny competition, developer audience that converts to repeat users; 'formatters' are banned as standalone submissions so this rides the platform listing
- **Requirements:** AltFTool app page approved first.
- **Fit:** AltFTool asset: https://altftool.com/tools/all/json-formatter (verified: 'JSON Formatting - Free Online Tool') plus json-editor, json-compare, json-to-typescript, csv-to-json — pitch the developer-tools depth. Omni Tools (a tool collection, 3 likes) already sits in this list; DevToys leads with only 28 likes, so a handful of likes puts AltFTool near the top.

#### ✅ Calculator.net on AlternativeTo (2 likes, only 19 alternatives)
- **URL:** https://alternativeto.net/software/calculator-net/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — easiest page to dominate; calculators are also one of AltFTool's 197 embeddable widget categories, compounding the funnel
- **Requirements:** AltFTool app page approved first. Note: standalone 'calculators' are on the ban list, so again: platform listing, calculator suite in features.
- **Fit:** AltFTool asset: https://altftool.com/altfcalculators (verified: 'Free Online Calculators — Finance, Health, Math & More'). Softest target of all eight: 19 alternatives, top entries have single-digit likes, and existing entries (CalcHub, SD6Tools, Purple Peak) are exactly AltFTool-style calculator collections — 2-3 likes makes AltFTool the #1 listed alternative.

#### ✅ AlternativeTo FAQ (rules of record: submissions, bans, self-promotion)
- **URL:** https://alternativeto.net/faq/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — read before submitting; shapes every word of the listing
- **Requirements:** Key rules: new accounts wait 1 week to submit; approval takes days up to a week; no URLs/emails/phones inside descriptions; app-name and official-website changes need admin approval; developers may add their own app; incentivized or fake likes trigger algorithmic rank drops; claim ownership by emailing support@alternativeto.net from an @altftool.com address.
- **Fit:** Source of the constraints below. Verbatim ban list includes: 'simple converters, calculators, resizers, croppers, compressors, generators, downloaders, counters, solvers, formatters... online text/photo/video editors... online PDF tools... online background removal tools... collections of online tools, AI wrappers for LLMs'. This kills per-tool submissions and makes even the platform submission a judgment call by moderators — mitigated by the accepted precedents (ToolThump added 2025-07-18, Namaste Tools, SD6Tools, Omni Tools).

### Ready-to-paste content

```text
=== PLAYBOOK ORDER ===
Day 0 (today): create AlternativeTo account (use admin@altftool.com; social login OK). Do nothing else — new accounts must wait 1 week before submitting an app.
Day 7 (~Aug 1): submit ONE listing, "AltFTool", via user icon > "Suggest new application" (https://alternativeto.net/manage-item/). During submission, mark it as an alternative to: iLovePDF, Smallpdf, TinyPNG, remove.bg, Photopea, JSONFormatter.org, Calculator.net (skip Canva for now). Also add: Squoosh, DevToys, Omni Tools, ToolThump, PDF24 Creator — generous but honest tagging maximizes internal cross-links.
Day 9-14: after approval, email support@alternativeto.net from admin@altftool.com to claim ownership (template below). Then visit each incumbent page > "Contribute to this page" > "Suggest Alternatives" for any pages the submission flow missed.
Later (optional, higher risk): separate listing for the 2FA Authenticator (legit category, not on ban list). Do NOT submit AltFLovePDF/AltFCalculators as separate apps — FAQ rejects "submissions that are basically the same app but bundled in different ways".

=== MAIN LISTING: "AltFTool" (platform) ===
App name: AltFTool
Official website: https://altftool.com
Platforms: Online / Web-based
License: Free, Proprietary
Category: Online Services / Utilities; Tags: online-tools, pdf-tools, image-editing, file-conversion, calculators, developer-tools, privacy, no-registration, client-side, browser-based

SHORT DESCRIPTION (139 chars — fits ~140 limit):
Privacy-first toolbox of 1,100+ free browser tools: PDF, image, converters, calculators, dev utilities. No signup, files stay on your device.

LONG DESCRIPTION (no links/emails — their rule):
AltFTool is a free, privacy-first collection of more than 1,100 tools that run directly in the browser. Files are processed client-side wherever technically possible, so documents and images never leave the device — there are no uploads to a server, no accounts, no signup walls and no artificial daily limits.

The toolbox covers PDF work (merge, split, compress, convert, reorder pages, password protection and removal, digital signature validation), image editing (compressor, resizer, cropper, background remover, collage maker, format converters), a large calculator suite for finance, health and math, developer utilities (JSON formatter, editor and converters, text diff, regex, encoders, code beautifiers) and security tools including a browser-based 2FA authenticator and password tools.

Everything works on desktop and mobile browsers with light and dark themes. Nearly 200 calculators and converters can also be embedded on other websites. The platform is sustained by unobtrusive ads rather than paywalls, so every tool is fully usable for free.

=== OPTIONAL SECOND LISTING: "AltFTool 2FA Authenticator" (only viable per-tool candidate) ===
Alternative to: Authy, Google Authenticator, Ente Auth, 2FAS
SHORT (138 chars):
Free web-based TOTP authenticator generating 2FA codes entirely in your browser. No install, no account — secrets never leave your device.
LONG:
AltFTool 2FA Authenticator is a browser-based TOTP code generator. Add accounts by pasting a secret key or scanning a QR code; time-based one-time passwords are computed locally in the browser, and secrets are stored only on the device. Nothing is transmitted to a server and no account is required. It works on any desktop or mobile browser as an install-free alternative to dedicated authenticator apps, useful on shared or locked-down machines where installing software is not an option.

=== HELD IN RESERVE (use only if moderators ask to split, or policy changes) ===
AltFLovePDF SHORT (134 chars): Free in-browser PDF toolkit: merge, split, compress, convert, protect and sign PDFs locally. No uploads, no signup, no file limits.
AltFCalculators SHORT (129 chars): Free calculators for finance, health, math and daily life with clear explanations of every result. No signup, works on mobile.

=== OWNERSHIP-CLAIM EMAIL (send from admin@altftool.com after approval) ===
To: support@alternativeto.net
Subject: Claiming ownership of the AltFTool listing
Hi, I'm the developer of AltFTool (altftool.com). My AlternativeTo username is <USERNAME>. I'd like to claim ownership of the AltFTool app page so I can keep it updated. This email is sent from the product's own domain as proof of ownership. Happy to provide anything else you need. Thanks!

=== REJECTION APPEAL (if the platform listing is declined as a "collection of online tools") ===
Reply to the rejection: AltFTool is a maintained product, not an auto-generated tool dump: 1,100+ hand-built tools, client-side processing as a core privacy architecture (files never leave the browser), full light/dark accessible UI, and product depth comparable to already-listed apps such as ToolThump, Namaste Tools, Omni Tools and SD6Tools. Ask what would make it acceptable and offer to narrow the listing's scope.
```

---

## Product Hunt

### Rules, timing and pitfalls

VERIFIED 2026 PROCESS: Free. Launch from a PERSONAL maker account (company accounts prohibited). Submit -> New Product -> enter URL; draft mode exists; schedule up to 1 month ahead. Homepage runs on a 24h cycle in PST — schedule for 12:01 AM PST (official recommendation). Tagline hard limit 60 chars. Description: the current launch guide says 500 chars but the help-center form doc says 260 — the copy above is written to 260 so it fits regardless. Thumbnail 240x240 <3MB (GIF ok, no strobing). Gallery min 2 images, 1270x760. Up to 3 launch tags. Video = full YouTube URLs only. Interactive demos (Arcade/Storylane/Supademo/ScreenSpace/Hexus/Layerpath) supported. HARD RULE: never ask anyone directly to upvote (shadow-rank penalty risk) — ask them to visit and comment. Relaunching is explicitly allowed for significant iterations, which is what makes the platform-then-embed two-launch strategy legal.

STRATEGY CALL — launch the PLATFORM first, not a single tool: 2026 benchmarks show privacy-first toolboxes still crack top 5 (TabTasker, 50 tools, 256 votes, #4 on June 1, 2026; 10015 Tools, 315 votes, #4 in 2024), while single utilities get lost, and TinyWow's 5-point page proves catalog size alone does nothing without a maker-led launch. AltFTool's 1,124 tools + client-side privacy is a strictly stronger version of the pitch that just worked. Save /embed for launch #2 — different audience (webmasters/marketers), different topics, and every embed placed is a compounding attribution backlink — but it is BLOCKED today: altftool.com/embed serves a placeholder page on prod (route exists only in the local repo; prod deploys from the AltFTool org Amplify repos). Deploy before scheduling launch #2. Realistic target: 200-350 upvotes = top 5 of the day (June-July 2026 ranges: #1 needs 565-826, #5 needs 185-314). Day choice: Tue-Thu = max traffic but max competition; Sat-Sun = easier top-5 at lower absolute traffic — for a backlink/awareness play, take a weekday. Maker first comment matters: 70% of Product of the Day/Week/Month winners had one. Timing prep: line up 20-30 genuine contacts across time zones to visit-and-comment in the first 4 hours (comments, not upvote asks). SEO note: the PH product page itself becomes a permanent, high-authority profile link for altftool.com plus a stream of scraper/aggregator backlinks (toolradar, alternativeto, eliteai.tools etc. all auto-list PH launchers — observed for the comparables above).

### Targets

#### ✅ Product Hunt — official Launch Guide (process + rules)
- **URL:** https://www.producthunt.com/launch
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — read once before scheduling; contains the binding rules (no direct upvote asks, personal accounts only)
- **Requirements:** Free. Personal maker account required (company accounts prohibited). Submit -> New Product -> enter URL. Day rolls at 12:01 AM PST.
- **Fit:** Governs the AltFTool platform launch (launch #1)

#### ✅ Product Hunt — Preparing for Launch (asset specs, scheduling)
- **URL:** https://www.producthunt.com/launch/preparing-for-launch
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — asset checklist source
- **Requirements:** Tagline max 60 chars; description max 500 chars per this page (help center form docs say 260 — write within 260 to be safe); thumbnail 240x240 <3MB (GIF allowed, no strobing); min 2 gallery images at 1270x760; up to 3 launch tags; schedule up to 1 month in advance; maker first comment strongly correlated with wins (70% of Product of the Day/Week/Month had one).
- **Fit:** Specs for all AltFTool launch assets

#### ✅ Product Hunt Help Center — How to post a product
- **URL:** https://help.producthunt.com/en/articles/479557-how-to-post-a-product
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — form-level details
- **Requirements:** Description 260 chars in the post form; draft mode available; posts go live 12:01 AM PST.
- **Fit:** Video must be full YouTube URL (no shorteners); interactive demos supported via Arcade, Storylane, Supademo, ScreenSpace, Hexus, Layerpath; gallery reorderable by drag-drop

#### ✅ altftool.com (launch #1 asset — the platform)
- **URL:** https://altftool.com
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — this is what to launch first
- **Requirements:** Before launch day: make sure the homepage states the 1,100+ tool count prominently (current copy says '22 tool categories / 13 workspaces / 24 labs' — PH visitors will bounce-check the scale claim).
- **Fit:** Platform homepage loads, shows categories, 'nothing leaves your browser' messaging, no-account positioning — matches the privacy-first angle that performed on PH in 2026 (TabTasker)

#### ❌ altftool.com/embed (launch #2 asset — widget hub)
- **URL:** https://altftool.com/embed
- **Status (2026-07-25):** dead
- **Priority:** P2 — blocked until deployed
- **Requirements:** BLOCKER: production returns an 'AltFTool is preparing this route' placeholder today (2026-07-25). The route exists locally at altftoolweb/src/app/embed but prod deploys from the AltFTool org Amplify repos — deploy first, launch 4-8 weeks after launch #1.
- **Fit:** 197 embeddable calculators/converters is a genuinely distinct second launch ('significant iteration' per PH rules) aimed at webmasters/marketers, and every embed carries an attribution backlink — the compounding-backlink play

#### ✅ 10015 Tools on Product Hunt (comparable: all-in-one free toolbox)
- **URL:** https://www.producthunt.com/products/10015-tools
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — benchmark only
- **Requirements:** n/a — reference data
- **Fit:** Closest positioning comparable: 'all online tools in one box'. Launched Jun 21, 2024: 315 upvotes, #4 Product of the Day, 253 followers; now cites 350k monthly visitors

#### ✅ TabTasker on Product Hunt (comparable: privacy-first local toolbox, June 2026)
- **URL:** https://www.producthunt.com/products/tabtasker
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — benchmark + template
- **Requirements:** n/a — reference data
- **Fit:** Most recent direct comparable (May 31, 2026): 50+ local-processing tools, tagline 'Zero servers. Total privacy. Your new favorite toolbox.', topics Productivity/Privacy/AI — 256 upvotes, #4 of the day. Proves the exact AltFTool angle (client-side, no uploads) still ranks top-5 in 2026 with far fewer tools than AltFTool has

#### ✅ TinyWow on Product Hunt (cautionary comparable)
- **URL:** https://www.producthunt.com/products/tinywow
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — cautionary
- **Requirements:** n/a — reference data
- **Fit:** TinyWow (200+ tools, huge organic traffic) has only 5 points on PH — it was posted without a maker-led launch. Lesson: a big tool catalog does nothing on PH without launch-day orchestration and a maker story

#### ✅ hunted.space — PH daily launch history (upvote benchmarks)
- **URL:** https://hunted.space/history
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — calibration
- **Requirements:** n/a — reference data
- **Fit:** June-July 2026 ranges: daily #1 = 565-826 upvotes; #5 = 185-314; top-10 cutoff roughly 150+. Realistic AltFTool target: 200-350 upvotes = top 5, matching both toolbox comparables

### Ready-to-paste content

```text
=== LAUNCH #1 — THE PLATFORM (privacy-first framing) ===

PRODUCT NAME
AltFTool

TAGLINE (54/60 chars)
1,100+ free tools that run in your browser. No signup.

Alt tagline (58/60 chars):
Every tool you google for, free and private, in one place.

DESCRIPTION (242/260 chars — fits both the 260 form limit and the 500 guide limit)
AltFTool is 1,100+ free browser tools — PDF, image, converters, calculators, dev & security utilities — plus 197 embeddable widgets and 41 games. No accounts, no uploads: files are processed client-side and never leave your device. 100% free.

TOPIC SUGGESTIONS (pick 3 — PH allows up to 3 launch tags)
1. Productivity  (use)
2. Privacy  (use)
3. Developer Tools  (use)
4. Design Tools  (alternate, if Developer Tools feels off for the gallery you build)
5. Web App  (alternate)
(TabTasker, the June 2026 comparable that hit #4, used Productivity + Privacy + Artificial Intelligence.)

FIRST COMMENT (maker story — post it the minute the launch goes live; note PH bans asking for upvotes, so it asks for feedback instead)
---
Hey Product Hunt! Maker of AltFTool here.

Like everyone, I used to google "free pdf merger" or "image compressor" and land on a different ad-stuffed site each time — upload your file, wait, hit a paywall, wonder where your file just went. I started building the tools I needed myself, and kept going.

AltFTool is now 1,100+ tools in one place: PDF and image tools, unit and finance calculators, converters, developer utilities, password and security tools — plus 41 quick games for when your build is compiling.

Three rules I refuse to break:
1. Free means free. No trials, no "3 files per day", no watermarks.
2. No signup. You should not need an account to resize an image.
3. Client-side first. Wherever technically possible, processing happens in YOUR browser — your files never touch our servers. Close the tab and nothing of yours exists anywhere.

There's also an embed program: 197 calculators and converters you can drop into your own site with one iframe snippet, free.

I'd genuinely love feedback: which tool category should we go deeper on next, and did any tool feel slower or clunkier than the site you currently use for it? Brutal honesty welcome. I'll be here all day answering everything.
---

ASSET CHECKLIST (build before scheduling)
- Thumbnail: 240x240, under 3MB. Recommend an animated GIF cycling 3-4 tool icons -> the AltFTool logo (GIF thumbnails allowed; no strobing).
- Gallery: minimum 2, recommend 6 images at 1270x760: (1) hero grid "1,100+ tools, 0 signups", (2) PDF/image tools in action, (3) "Your files never leave your browser" diagram (devtools network tab showing zero upload requests is a killer proof shot), (4) calculators/converters, (5) embed widget snippet on a third-party site, (6) games grid.
- Optional: 30-60s YouTube video (full URL only, not shortened, not private) or an Arcade/Supademo interactive demo (both supported natively).

=== LAUNCH #2 (4-8 weeks later, ONLY after altftool.com/embed is deployed) ===

PRODUCT NAME
AltFTool Embed

TAGLINE (57/60 chars)
197 free calculators & widgets you can embed in one iframe

DESCRIPTION (238/260 chars)
Drop any of 197 calculators and converters into your site with a copy-paste iframe — mortgage, BMI, unit, currency, date and more. Themeable, responsive, loads fast, works everywhere. Free forever, no API keys, no rate limits, no branding fees.

TOPICS: Marketing, Developer Tools, No-Code (alternates: SEO, Web App)

FIRST-COMMENT ANGLE: "We launched AltFTool here [link to launch #1] — the #1 request was 'can I put these calculators on my own site?' So we built it." Then 3 lines on how it works + ask which widget to build next.

=== OUTREACH SNIPPET (launch-day message to friends/users — PH-rule-compliant, no upvote ask) ===
"We're live on Product Hunt today with AltFTool — 1,100+ free, no-signup, browser-private tools. If you've ever used one, would you stop by and leave an honest comment or question? Feedback there shapes what we build next: [PH launch URL]"
```

---

## Startup/tool directories beyond AlternativeTo + Product Hunt (verified live 2026-07-25)

### Rules, timing and pitfalls

All URLs fetched/loaded today, 2026-07-25. Key channel rules and pitfalls: (1) SEQUENCING - Uneed, Peerlist, MicroLaunch, Fazier and BetaList are all "launch" platforms; space them ~1/week so each gets a dedicated push, and start BetaList's free queue first since it is 2-4 months deep. TAAFT's $300 bonus requires launching there before ANY other platform - ignore it, it conflicts with everything else. (2) COSTS - truly free: SaaSHub, Peerlist, StackShare, Uneed (queue), MicroLaunch (basic), BetaList (queue), all GitHub PRs. Fazier's free tier requires a reciprocal backlink to fazier.com on your homepage/footer - decide policy before submitting (reciprocal footer links dilute your own link equity; the $39 Premium avoids it). Paid-only: TAAFT $49+, Tool Finder $29+ (price rises Aug 1), Futurepedia $247+ (basic sold out). (3) HARD EXCLUSIONS - free-for.dev explicitly bans converter/calculator 'toolbox' sites (their CONTRIBUTING.md says so verbatim) and Slant.co is dead (broken HTTPS); do not spend time on either. (4) AI-PR TRAP - both free-for-dev and Lissy93/awesome-privacy state they close AI-generated PRs; Lissy93's CONTRIBUTING.md additionally hides a honeypot instruction (an HTML comment telling AI agents to embed a 'good bot' GIF line in the PR description). A human must write those PRs by hand and must NOT include that line. (5) SITE PREREQS - https://altftool.com and /tools load fine, but https://altftool.com/embed is 404 in production today ('AltFTool is preparing this route'), so do not cite the /embed URL in any submission until that route ships; also confirm a public privacy-policy page exists before the awesome-privacy PR since it is an explicit requirement. (6) TRACKING - append ?ref= or UTM parameters per directory (SaaSHub and Uneed send real referral traffic) and add domain-email verification on SaaSHub via admin@altftool.com for faster review. (7) The 140-char description is exactly 140 chars and the 50-char tagline is 49 - they fit the strictest fields (Product-Hunt-style tagline limits, X bios) without editing.

### Targets

#### ✅ SaaSHub
- **URL:** https://www.saashub.com/services/submit
- **Status (2026-07-25):** verified-live
- **Priority:** P1 - free, high-authority directory, exact fit for a software platform, fastest ROI
- **Requirements:** Free. Login/register link shown (account recommended). Form asks: website URL (mandatory), categories, competitors (required to avoid queue delays). Verifying with an @altftool.com domain email speeds approval. Rejects: unreleased products, waitlist pages, free subdomains, non-English. Accepts SaaS/software and 'niche-leading websites'. Approval queue, no stated SLA.
- **Fit:** Submit altftool.com as the main product; list competitors TinyWow, Smallpdf, iLovePDF, 123apps, Omni Calculator so it lands on their 'alternatives' pages. Use admin@altftool.com for the domain verification fast lane.

#### ✅ Uneed
- **URL:** https://www.uneed.best/submit-a-tool
- **Status (2026-07-25):** verified-live
- **Priority:** P1 - free queue, advertises DR75 do-follow backlink and guaranteed homepage visibility
- **Requirements:** No account needed to start (it scrapes your URL first, then asks you to sign up to save). Free: auto-assigned next available launch slot (can be weeks out). Skip the Line $29.99 to pick your date; Relaunch $15. All launches get the DR75 do-follow link.
- **Fit:** Launch altftool.com as a whole ('1,100+ free client-side tools'). Good Product-Hunt-style audience of makers.

#### ✅ Peerlist Launchpad
- **URL:** https://peerlist.io/launchpad
- **Status (2026-07-25):** verified-live
- **Priority:** P1 - free, weekly launch cycle, developer/designer audience that matches the dev-tools suite
- **Requirements:** Free. Requires a Peerlist profile (Create Profile), then add your project and hit Launch. Launch window opens every Monday 12:00am-11:59pm UTC; community voting runs the week; top 3 get a profile badge + newsletter feature.
- **Fit:** Launch the Developer Hub angle (JSON/regex/encoders/security tools, no signup) - this audience is developers, so lead with the 28+ dev tools and privacy-first client-side processing.

#### ✅ StackShare
- **URL:** https://stackshare.io/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 - free and alive post-FOSSA acquisition (2024), but listing is login-gated and dev-tools-only in spirit
- **Requirements:** Free. 'List a Tool' button on the homepage opens a sign-up modal - GitHub or Google OAuth required, then you can create the tool page. 149K tools listed; site actively maintained.
- **Fit:** List 'AltFTool' under developer tools / utilities; also publish AltFTool's own company stack page (Next.js, AWS Amplify) which links back to altftool.com.

#### ✅ Fazier
- **URL:** https://fazier.com/submit
- **Status (2026-07-25):** verified-live
- **Priority:** P2 - free tier exists but demands a reciprocal backlink to Fazier on your homepage/footer; $19 Lite avoids nothing, $39 Premium gives guaranteed DR82+ link
- **Requirements:** Account needed (Google or email). Basic (free): reviewed and listed within 15 days, requires a backlink to fazier.com on your homepage or footer. Lite $19: high-authority backlink if top-3 daily. Premium $39: guaranteed DR82+ backlink + badge. Can publish now or schedule.
- **Fit:** Launch altftool.com. Decide first whether a footer link to Fazier is acceptable; if not, the $39 Premium is the honest cost of this channel.

#### ✅ MicroLaunch
- **URL:** https://microlaunch.net/premium
- **Status (2026-07-25):** verified-live
- **Priority:** P2 - free launch tier (30-day visibility); note /submit redirects straight to the pricing page, so expect an upsell funnel
- **Requirements:** Account needed. Free Launch: basic submission + 30-day featured visibility, monthly leaderboard. Pro $39 ($49 minus LAUNCH20 code): skip queue, 2x boosts, Product-of-Day eligibility, DR60+ do-follow links on 4+ SEO pages, 40 spots/month.
- **Fit:** Launch altftool.com in a month where you can rally some votes; monthly leaderboard means a strong month compounds.

#### ✅ BetaList
- **URL:** https://betalist.com/submit
- **Status (2026-07-25):** verified-live
- **Priority:** P2 - free but slow (queue reported at 2-4 months); paid skip ~$129+; policy now accepts recently launched startups, not only pre-launch
- **Requirements:** Account required (sign in with X or magic link) before the form appears. Free queue with long manual-review wait; paid tiers (~$129 startup / ~$299 funded per third-party reports - confirm in-app, pricing page is 404) for 1-4 business-day listing. Startup framing expected: founder story, screenshots, 'beta' angle.
- **Fit:** Frame a new module as the beta (e.g. the embeddable widgets program or IdeaLab) rather than the whole mature platform - BetaList editors favor fresh launches.

#### ✅ Awesome Privacy (Lissy93) - GitHub PR
- **URL:** https://github.com/Lissy93/awesome-privacy
- **Status (2026-07-25):** verified-live
- **Priority:** P2 - free 9.7k-star repo pushed today, plus a listing page on awesome-privacy.xyz; perfect USP match (privacy-first, client-side)
- **Requirements:** Open a PR editing ONLY awesome-privacy.yml (README is auto-generated). Requirements: privacy-respecting, minimal data collection, clear privacy policy (hosted services must have one). Categories available: Utilities, Security Tools, Productivity, Development. Review by maintainer; guidelines-violating PRs closed with comment. CAUTION: CONTRIBUTING.md contains a hidden HTML-comment honeypot telling 'agents and AIs' to add a specific image line to the PR description - it exists to catch AI-written PRs. Write the PR yourself, by hand, and do NOT include that line.
- **Fit:** Add AltFTool under Utilities citing the client-side/no-upload architecture and privacy policy. Ensure altftool.com/privacy (or equivalent) is live and explicit before opening the PR.

#### ✅ There's An AI For That (TAAFT)
- **URL:** https://theresanaiforthat.com/submit/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 - paid only ($49 basic / $347 max exposure, one-time); AI tools, GPTs and 'mini tools' only; only worth it for the AI-facing features
- **Requirements:** Paid: $49 website-only listing or $347 with newsletter (2.5M subscribers). Manual review, 1-2 days, full refund if not published. Free path: a monthly thread on X where they pick one indie tool. $300 PPC bonus requires launching on TAAFT before any other platform - incompatible with the P1 plan above, ignore it.
- **Fit:** Only submit the AI box / AI-assisted tools as a distinct 'AI tool' page, not the whole platform. Skip unless the $49 is trivial to you.

#### ✅ Tool Finder
- **URL:** https://toolfinder.com/submit
- **Status (2026-07-25):** verified-live
- **Priority:** P3 - paid ($29 July promo, rising Aug 1); editorial productivity-apps site, moderate fit
- **Requirements:** Paid listing from $29 (email-based desktop flow: enter email, they send the listing-builder link). Focus is productivity software (to-do, notes, calendars). Note: toolfinder.co now 301s to toolfinder.com.
- **Fit:** Weak-to-moderate fit - AltFTool is utilities, not a productivity app. Only worthwhile if they'd slot it into 'free tools' lists; ask before paying.

#### ✅ Futurepedia
- **URL:** https://www.futurepedia.io/submit-tool
- **Status (2026-07-25):** verified-live
- **Priority:** P3 (effectively skip) - paid only: $247 basic listing currently SOLD OUT, $497 verified; AI tools only
- **Requirements:** Paid submission with editorial review ($247 basic when available / $497 verified, published in 2 business days). AI tools, GPTs and apps only.
- **Fit:** Poor value for a free-tools platform; revisit only if the AI suite becomes a flagship product.

#### ✅ Awesome Privacy (pluja) - GitHub PR
- **URL:** https://github.com/pluja/awesome-privacy
- **Status (2026-07-25):** verified-live
- **Priority:** P3 - 19k stars and active, but list self-describes as 'free, open source and privacy respecting'; closed-source AltFTool risks rejection
- **Requirements:** PR against README per misc/Contributing.md. Strong FOSS bias in listed entries.
- **Fit:** Try only after the Lissy93 PR lands, positioning client-side processing as the privacy guarantee; accept that it may be declined for not being open source. Open-sourcing the widget SDK would unlock this and LibHunt.

#### ⚠️ LibHunt
- **URL:** https://www.libhunt.com/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P3 - domain alive but behind an aggressive bot-check wall today; catalog is open-source projects indexed from GitHub, so closed-source AltFTool has no natural entry point
- **Requirements:** No public submission form found; projects come from GitHub repos and 'awesome' lists. Run by the same team as SaaSHub - the SaaSHub submission partially covers this ecosystem.
- **Fit:** Skip unless you open-source a component (e.g. the embed widget SDK); then it can be suggested with its GitHub repo.

#### ✅ free-for.dev (ripienaar/free-for-dev)
- **URL:** https://github.com/ripienaar/free-for-dev
- **Status (2026-07-25):** verified-live
- **Priority:** DO NOT SUBMIT - explicit dead fit despite 130k stars
- **Requirements:** Their CONTRIBUTING.md explicitly rejects: 'Generic developer toolbox sites - format converters, calculators etc, we have too many already and more will not add value.' A PR for AltFTool will be closed without discussion; they also auto-close AI-written PRs.
- **Fit:** None. Listed here so nobody wastes a PR on it.

#### ❌ Slant.co
- **URL:** https://www.slant.co/
- **Status (2026-07-25):** dead
- **Priority:** Skip - effectively abandoned
- **Requirements:** HTTPS is broken today (TLS handshake fails from three independent clients); only plain HTTP serves an empty-titled JS shell with a warning banner. Not a usable submission channel in 2026.
- **Fit:** None.

#### ✅ awesome-online-tools (GenshinProfession) - easy micro-PR
- **URL:** https://github.com/GenshinProfession/awesome-online-tools
- **Status (2026-07-25):** verified-live
- **Priority:** P3 - tiny (1 star) but active 2026 and topically exact ('free online calculators, developer tools, converters'); a 2-minute PR for a cheap indexed backlink. Same idea: sangmin7648/awesome-free-online-debugging-tools (9 stars, no-signup browser dev tools).
- **Requirements:** Standard GitHub PR adding a markdown line. No formal guidelines.
- **Fit:** Add AltFTool's tools hub (https://altftool.com/tools) under converters/calculators/dev sections.

### Ready-to-paste content

```text
=== UNIVERSAL LISTING KIT (paste anywhere) ===

Product name: AltFTool
URL: https://altftool.com
Tools hub URL (for deep links): https://altftool.com/tools
Maker email: admin@altftool.com
Suggested categories/tags: Productivity, Utilities, Developer Tools, File Conversion, PDF, Privacy, No-Signup, Free
Competitors/alternatives (SaaSHub requires these): TinyWow, Smallpdf, iLovePDF, 123apps, Omni Calculator, CyberChef

--- Tagline (50 chars, exactly 49) ---
1,100+ free browser tools. No signup, no uploads.

--- Short description (140 chars, exactly 140) ---
Free browser toolbox: 1,100+ PDF, image, converter, calculator, dev & security tools. Client-side: files never leave your device. No signup.

--- Long description (500 chars, exactly 492) ---
AltFTool is a free everything-toolbox that runs entirely in your browser: 1,100+ tools spanning PDF & documents, image editing, file converters, calculators, developer utilities and security helpers, plus 40+ casual games. Everything is client-side and privacy-first - your files never leave your device, and there is no signup, no watermark and no paywall. Fast, accessible, with light & dark themes. One tab replaces dozens of single-purpose tool sites. Open altftool.com and it just works.

=== MAKER COMMENT (Peerlist / Uneed / MicroLaunch / Fazier first comment) ===
Hey everyone - maker of AltFTool here. I got tired of every "free online tool" uploading my files to someone's server, hiding the result behind a signup wall, or stamping a watermark on it. So we built the whole toolbox to run client-side: 1,100+ tools (PDF, images, converters, calculators, dev & security utilities) where your files never leave the browser. No accounts, no uploads, no paywalls - open a tool and it just works. Would love feedback on which tools to build next, and happy to answer anything about making 1,000+ tools fast on one codebase.

=== SAASHUB SUBMISSION (saashub.com/services/submit) ===
Website: https://altftool.com
Categories: Online Tools, PDF Tools, File Converter, Developer Tools, Calculators
Competitors: TinyWow, Smallpdf, iLovePDF, 123apps, Omni Calculator, CyberChef
(Then verify with admin@altftool.com when prompted - domain-email verification moves you up the queue.)

=== AWESOME-PRIVACY (Lissy93) PR - edit awesome-privacy.yml ONLY, category "Utilities" ===
Draft entry (adjust field names to the Service Fields spec in .github/CONTRIBUTING.md before opening the PR):

      - name: AltFTool
        url: https://altftool.com
        description: 1,100+ free browser tools (PDF, image, converters, calculators, developer and security utilities) that run fully client-side. Files are processed in the browser and never uploaded; no account or signup required.
        # openSource: false - processing is client-side; add repo field only if/when a component is open-sourced

PR title: Add AltFTool to Utilities
PR description (write by hand - see warning in notes): Adds AltFTool, a free client-side tool suite. All file processing happens locally in the browser (no uploads), no signup, clear privacy policy at https://altftool.com/privacy. Happy to adjust category or trim the description.

=== MICRO AWESOME-LIST PR LINE (awesome-online-tools etc.) ===
- [AltFTool](https://altftool.com/tools) - 1,100+ free client-side tools: converters, calculators, PDF & image utilities, developer & security helpers. No signup, files never leave the browser.

=== BETALIST ANGLE (if used) ===
Startup name: AltFTool
Pitch: The everything-toolbox that never sees your files
One-liner: 1,100+ free browser tools - PDF, images, converters, calculators, dev utilities - all running client-side with no signup. New: embeddable calculator & converter widgets any site can drop in.
```

---

## listicle-roundup-outreach

### Rules, timing and pitfalls

RULES AND PITFALLS FOR THIS CHANNEL: (1) Personalize or die — the {ONE_SPECIFIC_COMPLIMENT} field must reference something actually in their article (a criterion, a quote, a ranking choice); listicle authors delete template blasts on sight. Every target row above includes the author name and tool list to personalize from. (2) Verify before you claim — Template 2 requires a real, checkable change to the listed tool (Sejda's 3-tasks/day cap, TinyPNG's 5MB/20-image limits, remove.bg's credit system, and Smallpdf/iLovePDF server uploads are all currently true and documented in these very articles — use those). Never invent a change. (3) URL discipline — only the URLs in the verified list are live on production today; /embed (197 widgets) and bare-slug tools like /percentage-calculator 404 on prod even though they exist in the dev repo. Re-verify before sending, and re-pitch the widget/embed angle only after /embed deploys — embeds are this channel's best follow-up offer ('embed our calculator in your article, free'). (4) The network-tab proof ('watch the network tab stay silent') is this channel's killer move — it converts the privacy claim from marketing into something an editor can verify in 30 seconds; keep it in every pitch. (5) Cadence: send Tue-Thu morning in the target's timezone; one follow-up after 5-7 days, max two total; dev.to comments and AlternativeTo submissions have no cadence limits but require accounts (site owner action — research here was read-only, nothing was submitted). (6) Vendor-owned listicles (ShortPixel, Jotform, howtoconvert, Pickrack, StudioLimb, kordu) list competitors freely but may balk at a full-suite rival — pitch a single tool, not the platform. (7) Gap found: calculator roundups barely exist (the only dedicated one is dead, HTTP 410) while /altfcalculators has 103 live tools — a 'best free online calculators' asset on AltFTool's own blog could rank with little competition and become the thing others cite. (8) TechRadar/MakeUseOf are P3 lottery tickets — send once, don't chase; the P1s (PC Tech Magazine, howtoconvert, Guideflow, dev.to authors, AlternativeTo) are where replies will actually come from. (9) Status caveat: theintelligence.com blocked automated fetch (403) — open manually before emailing; graphcalcx.com is confirmed dead (410) — do not contact.

### Targets

#### ✅ PC Tech Magazine — "10 Best Online File Converters in 2026"
- **URL:** https://pctechmag.com/2026/04/10-best-online-file-converters-in-2026-free-fast-picks/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — fresh 2026 listicle, real editor email published, exact topical match
- **Requirements:** No account. Free pitch via editor@pctechmagazine.com or https://pctechmag.com/contact-pc-tech-magazine/; author page https://pctechmag.com/author/almuc/. African tech mag, responsive to product pitches; may offer paid placement — negotiate.
- **Fit:** Pitch https://altftool.com/altfloveimg (in-browser image conversion: JPG↔PNG↔WEBP) + https://altftool.com/altflovepdf as the privacy-first entry — every tool on their current list uploads files to servers; AltFTool converts client-side.

#### ✅ How to Convert blog — "12 Best Online File Converters"
- **URL:** https://howtoconvert.co/blog/best-online-file-converters
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — named personal email, active 2026 article
- **Requirements:** Direct founder email: jake@howtoconvert.co. Free. Small indie site — expect fast reply or none; runs its own converter so frame as complementary (client-side vs server-side).
- **Fit:** They already list competitors (iLovePDF, Smallpdf, EZGIF). Pitch https://altftool.com/altfloveimg + https://altftool.com/altflovepdf as the no-upload option — a differentiated 13th entry.

#### ✅ DEV Community — "Best Free Remove.bg Alternatives 2026" by @samma1997
- **URL:** https://dev.to/samma1997/best-free-removebg-alternatives-2026-7-background-removers-tested-2if6
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — comments enabled, author demonstrably updates from feedback (vendor CTO already commented)
- **Requirements:** dev.to account needed only to comment; author reachable via dev.to profile @samma1997 (Luca Sammarco) and sammapix.com. Comments are open — a polite, substantive comment suggesting the tool is acceptable outreach here.
- **Fit:** https://altftool.com/altfloveimg/background-remover — AI background removal that runs in-browser (images never leave device), exactly the criterion the author tests for (he praises SammaPix for local WASM processing).

#### ✅ Guideflow Blog — "15 best PDF editors for 2026"
- **URL:** https://www.guideflow.com/blog/pdf-editors
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — self-declared regularly-updated list with published email
- **Requirements:** contact@guideflow.com (in footer). Free. B2B SaaS blog — keep pitch short, lead with what their readers gain.
- **Fit:** https://altftool.com/altflovepdf — free browser PDF suite (merge/split/rotate/organize/convert). Article explicitly says "we update it regularly" — ask for inclusion as the free, no-upload option vs Smallpdf/iLovePDF.

#### ✅ Vefogix — "Best 8 Word Counter Tools in 2026"
- **URL:** https://www.vefogix.com/blogs/best-word-counter-tools/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — easy contact, but confirm the exact live word-counter URL before sending
- **Requirements:** nova@vefogix.com, contact form /contact-us/, even a phone number. Free. July 2026 article — very fresh.
- **Fit:** AltFTool's text tools (word/character counters run privately in-browser — same "privately in your browser" angle they praise). Link the tools hub via https://altftool.com/ until individual slug pages ship on prod.

#### ✅ DEV Community — NoLoginTools monthly roundup series (nologin.tools)
- **URL:** https://dev.to/nologintools/april-2026-roundup-best-new-free-tools-no-signup-required-fk5
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — thesis-level fit with AltFTool's positioning
- **Requirements:** dev.to account to comment; directory at nologin.tools verifies tools before listing. Free. Recurring series = evergreen opportunity — one relationship, many mentions.
- **Fit:** Perfect USP match: their entire editorial thesis is no-signup, privacy-first browser tools. Pitch the whole platform (https://altftool.com/ — 1,100+ client-side tools) for a future monthly roundup + the nologin.tools directory.

#### ✅ AlternativeTo — "Free iLovePDF Alternatives" page
- **URL:** https://alternativeto.net/software/ilovepdf-com/?license=free
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — ranks for multiple 'alternatives' queries; one listing covers many pages
- **Requirements:** Free AlternativeTo account to submit an app; or email hello@alternativeto.net. Crowd-moderated, review takes days-weeks. Likes drive ranking — ask happy users to upvote after listing.
- **Fit:** Get AltFTool (or AltfLovePDF suite, https://altftool.com/altflovepdf) listed as an iLovePDF alternative; page updated Apr 22 2026 and ranks for the money query. Same play for TinyPNG and remove.bg pages.

#### ✅ TechWhack — "The Best Free Browser Games to Play Right Now"
- **URL:** https://techwhack.com/games/best-free-browser-games/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — active list, generic contact form only
- **Requirements:** Contact form at https://techwhack.com/contact/. Free. Updated Jul 6 2026 — actively maintained; author Marcus Vale.
- **Fit:** https://altftool.com/altfgame — 25 free browser games (2048, Chess, Flappy Bird all live); article already lists 2048, Wordle, Connect 4 style games. Pitch /altfgame/2048 and /altfgame/chess as no-ads-wall instant-play versions.

#### ✅ GetJar — "Best Browser Games No Download Needed in 2026"
- **URL:** https://getjar.com/article/best-browser-games-no-download-needed-in-2026
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — high domain authority, impersonal contact path
- **Requirements:** Footer contact at getjar.com/contactus. Free. Large legacy app-store domain — strong link if landed; author Olivia Blake.
- **Fit:** https://altftool.com/altfgame — instant-play, no-signup games; they group picks by 'quick breaks' (Wordle, 2048) which maps to /altfgame/2048, /altfgame/flappy-bird.

#### ✅ TinySEO Blog — "Best TinyPNG alternatives for image optimization"
- **URL:** https://tinyseo.com/blog/tinypng-alternatives/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — ranking page, weaker contact path
- **Requirements:** "Contact us" link on tinyseo.com; no email published. Free. Older article (Oct 2023) but still ranking — pitch a refresh angle.
- **Fit:** https://altftool.com/altfloveimg/compress — JPG/PNG/WEBP compression fully in-browser; their 12-tool list has zero client-side options, a genuine gap. Author: Vita Klimaite.

#### ✅ Pickrack Blog — "Free TinyPNG Alternatives 2026"
- **URL:** https://pickrack.com/blog/free-tinypng-alternatives-2026/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — small site, but ideology-aligned and fresh (May 2026)
- **Requirements:** Contact page pickrack.com/contact/. Free. Founder-written — personalize to David by name.
- **Fit:** https://altftool.com/altfloveimg/compress — they explicitly celebrate local processing (their pick criteria) and list only 5 tools; ask founder David Pham to add a 6th.

#### ✅ ShortPixel Blog — "Best PNG Compressor Alternatives"
- **URL:** https://shortpixel.com/blog/best-png-compressor-alternatives/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — vendor blog, may decline competitors
- **Requirements:** https://shortpixel.com/contact. Free. They're a competitor vendor — lower acceptance odds; pitch the 'free/no-signup tier your readers ask about' angle.
- **Fit:** https://altftool.com/altfloveimg/compress as a free browser-native entry alongside iLoveIMG/Compressor.io. Author Andrei Alba, Jan 30 2026.

#### ✅ AI News Hub — "Top 5 Best Free Online File Converters in 2026"
- **URL:** https://www.ainewshub.org/post/top-5-best-free-online-file-converters-in-2026-ai-powered-and-versatile-options
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — receptive-looking small pub, generic contact
- **Requirements:** https://www.ainewshub.org/contact (nav link). Free. Wix-style small pub (QOREON LABS LTD) — likely open to additions.
- **Fit:** https://altftool.com/altfloveimg + https://altftool.com/altflovepdf — all 5 current picks are server-upload converters; privacy angle is the differentiator.

#### ✅ PDFSnap — "10 Best Free PDF Tools Online in 2026"
- **URL:** https://pdfsnap.github.io/best-free-online-pdf-tools.html
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — easy win, low SEO value
- **Requirements:** pdfsnap.tools@gmail.com + contact.html page. Free. GitHub Pages indie site — low authority but easy yes; runs own PDF tool.
- **Fit:** https://altftool.com/altflovepdf — article's whole angle is honest privacy comparison ('which tools upload your files'); AltfLovePDF is client-side. Author: Mohammad Armaan.

#### ✅ Jotform Blog — "The 6 best free QR code generators in 2026"
- **URL:** https://www.jotform.com/blog/best-free-qr-code-generator/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — high authority, hard to land, tool URL needs prod verification first
- **Requirements:** Author page https://www.jotform.com/blog/author/miguelrebelo/ (Miguel also writes for Zapier — reachable on LinkedIn); footer /contact/. Free but big-brand editorial — low response rate.
- **Fit:** AltFTool QR generator (slug qr-generator; confirm live prod URL before sending — link https://altftool.com/ hub if not). No-signup angle matches their pick criteria. Author: Miguel Rebelo, updated Jun 26 2026.

#### ✅ MakeUseOf — "The 7 Best Free Online File Converters"
- **URL:** https://www.makeuseof.com/tag/free-online-file-converters/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — high DR but stale article and impersonal process
- **Requirements:** Contact Us in footer; MUO takes pitches at valnet contact forms. Free. Big pub, slow.
- **Fit:** https://altftool.com/altfloveimg — image conversion without upload. Article last updated Sep 2021 — pitch MUO editors an update/refresh angle rather than the freelance author.

#### ✅ TechRadar — "Best free PDF editor 2026"
- **URL:** https://www.techradar.com/best/free-pdf-editor
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — highest authority on the list, lowest hit probability
- **Requirements:** No published per-article email; go via techradar.com contact page or the credited author's profile/LinkedIn. Future plc pub — expect PR-grade pitch, weeks of lead time, likely needs a 'tested' hook (privacy: files never uploaded).
- **Fit:** https://altftool.com/altflovepdf as free browser PDF suite. Page loads (content partly behind membership prompts in automated fetch).

#### ✅ kordu.tools blog — "Free Alternatives to remove.bg"
- **URL:** https://kordu.tools/blog/free-alternatives-remove-bg/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — good fit, no reliable contact path
- **Requirements:** No contact form/email visible on page; company is KORDU LTD (London) — try hello@kordu.tools pattern or LinkedIn. Free.
- **Fit:** https://altftool.com/altfloveimg/background-remover — their list (Adobe Express, Canva, GIMP) has no other in-browser no-signup option. Author byline 'Iyda', updated Apr 19 2026.

#### ✅ Mafiakill — "25 Best Free Browser Games to Play in 2026"
- **URL:** https://mafiakill.com/en/blog/mafia-games/25-best-free-browser-games-to-play-in-2026-no-download-required/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — skip unless desperate
- **Requirements:** No contact page/email found. Registration-driven game site.
- **Fit:** Weak: article is self-promotional (mostly plugs Mafiakill itself) with no external contact path. Only pursue if link volume matters.

#### ⚠️ The Intelligence — "The best online file converter"
- **URL:** https://theintelligence.com/39371/best-online-file-converter-free/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P3 — bot-blocked, manual check needed
- **Requirements:** Unknown — verify manually.
- **Fit:** File-converter roundup (would fit /altfloveimg + /altflovepdf) but site returns HTTP 403 to automated fetch — check manually in a browser before outreach.

#### ❌ Graph Calculator — "Best Free Online Calculators"
- **URL:** https://graphcalcx.com/best-free-online-calculators/
- **Status (2026-07-25):** dead
- **Priority:** P3 — dead, do not contact
- **Requirements:** n/a
- **Fit:** Was the only dedicated calculator roundup found; returns HTTP 410 Gone. Calculator listicles are scarce — https://altftool.com/altfcalculators (103 live calculators) is under-served by this channel; consider creating the ranking asset yourself instead.

### Ready-to-paste content

```text
VERIFIED LIVE ALTFTOOL URLS TO USE IN OUTREACH (checked 2026-07-25):
- PDF suite hub: https://altftool.com/altflovepdf  (deep link: https://altftool.com/altflovepdf/merge-pdf)
- Image suite hub: https://altftool.com/altfloveimg  (deep links: /altfloveimg/compress, /altfloveimg/background-remover)
- Calculators hub (103 tools): https://altftool.com/altfcalculators  (deep links: /altfcalculators/loan-emi-calculator, /altfcalculators/bmi-calculator, /altfcalculators/scientific-calculator)
- Games hub (25 games): https://altftool.com/altfgame  (deep links: /altfgame/2048, /altfgame/chess, /altfgame/flappy-bird)
- Platform: https://altftool.com/
DO NOT link /embed or bare-slug tool pages (e.g. /percentage-calculator) — they 404 on production today.

=====================================================================
TEMPLATE 1 — "ADD US TO YOUR LIST"
=====================================================================
Subject options (pick one):
- A privacy-first addition for your {ARTICLE_TOPIC} list
- One tool missing from "{ARTICLE_TITLE}" — files never leave the browser
- Quick suggestion for your {ARTICLE_TITLE} roundup

Body:

Hi {FIRST_NAME},

I was reading "{ARTICLE_TITLE}" ({ARTICLE_URL}) while researching {ARTICLE_TOPIC} — {ONE_SPECIFIC_COMPLIMENT, e.g. "the note about which tools upload files to servers was the most useful part of any roundup I found"}.

One thing I noticed: every tool on the list processes files on a server. If your readers care about privacy (or work with sensitive documents), there's a category your article doesn't cover yet — tools that run entirely in the browser.

That's what we built at AltFTool:

{PICK_ONE_BLOCK}

[PDF articles]
- AltfLovePDF — merge, split, rotate, organize, compress and convert PDFs: https://altftool.com/altflovepdf
[Image compressor / TinyPNG articles]
- Image Compressor — JPG, PNG and WEBP, unlimited, no file-size caps: https://altftool.com/altfloveimg/compress
[remove.bg articles]
- Background Remover — AI cutouts to transparent PNG: https://altftool.com/altfloveimg/background-remover
[Converter articles]
- AltfLoveImg — compress, convert (JPG/PNG/WEBP), resize, crop, watermark: https://altftool.com/altfloveimg
[Calculator articles]
- AltF Calculators — 103 finance, health, math and conversion calculators: https://altftool.com/altfcalculators
[Games articles]
- AltF Games — 25 instant-play browser games incl. 2048, Chess, Flappy Bird: https://altftool.com/altfgame

Why it might earn a spot on the list:
- 100% free — no paid tier gating the core tools
- No signup, no email wall — the tool is usable in one click
- Client-side processing — files never leave the reader's device (works even on locked-down office networks)
- No watermarks, no daily limits

If you think it's a fit for your next update, I'd be glad to send anything that makes your job easier — screenshots, a short blurb in your list's format, or test files. And if it doesn't make the cut, no hard feelings — happy to answer any questions either way.

Thanks for the great resource,
{YOUR_NAME}
AltFTool — https://altftool.com
admin@altftool.com

=====================================================================
TEMPLATE 2 — "YOUR LISTED TOOL WENT PAID / LIMITED — FREE ALTERNATIVE"
=====================================================================
Subject options (pick one):
- {LISTED_TOOL} now limits free users — an update for your article?
- Heads-up: a tool in "{ARTICLE_TITLE}" changed its free tier
- Free replacement for {LISTED_TOOL} in your {ARTICLE_TOPIC} roundup

Body:

Hi {FIRST_NAME},

Quick heads-up about "{ARTICLE_TITLE}" ({ARTICLE_URL}): {LISTED_TOOL}, which you recommend at #{POSITION}, {WHAT_CHANGED — e.g. "now caps free users at 2 tasks/day", "added a watermark to free exports", "requires an account to download results", "raised its file-size limit paywall"}. A few readers landing on that section today will hit a paywall your review didn't mention.

If you update the article, here's a drop-in replacement that can't rug-pull the free tier:

{TOOL_NAME} — {TOOL_URL}   ← use a verified URL from the list at top

- 100% free, no premium tier for core features — so this recommendation can't go stale the same way
- No signup or email required
- Runs entirely in the browser: files are processed on-device and never uploaded, which also makes it faster for large files
- No watermarks, no daily task limits

I work on AltFTool, so obvious bias — but the claims take 30 seconds to verify: open the link, drop in a file, watch the network tab stay silent. If you'd rather point readers to something else, the fix to flag {LISTED_TOOL}'s change is worth making regardless.

Happy to provide a comparison table ({LISTED_TOOL} vs ours, feature by feature) formatted for your article if useful.

Best,
{YOUR_NAME}
AltFTool — https://altftool.com
admin@altftool.com

=====================================================================
READY-TO-USE DEV.TO COMMENT (for @samma1997 remove.bg article and NoLoginTools roundups — post from a personal account, disclose affiliation):
=====================================================================
Great testing methodology — especially checking semi-transparent edges. One more for the "runs locally" column: AltFTool's Background Remover (https://altftool.com/altfloveimg/background-remover) does AI cutouts fully in-browser — no upload, no signup, no watermark, free. (Disclosure: I work on it.) Would love to see how it scores on your product-shot test set.

=====================================================================
ALTERNATIVETO SUBMISSION BLURB (after creating listing via their app-submission flow):
=====================================================================
Name: AltfLovePDF (by AltFTool)
URL: https://altftool.com/altflovepdf
Description: Free browser-based PDF toolkit — merge, split, rotate, organize, crop, compress and convert PDFs. No signup, no watermarks, no daily limits. All processing happens client-side in your browser; files are never uploaded to a server.
Tags: pdf-editor, privacy-focused, no-registration, web-based, free
Suggest as alternative to: iLovePDF, Smallpdf, PDF24, Sejda
(Repeat pattern for AltfLoveImg vs TinyPNG/remove.bg, and AltF Calculators vs Calculator.net.)
```

---

## calculator-embed outreach (AltFTool /embed widgets — free iframe calculators with attribution backlink)

### Rules, timing and pitfalls

BLOCKER (do this first): the embed system is NOT live in production. As of 2026-07-25, https://www.altftool.com/embed, /embed/widget/sip-calculator, and /embed/widget/loan-emi-calculator all return 404, while canonical tool pages (e.g. /tools/all/sip-calculator) load fine. The embed routes exist only in the dev monorepo (altftoolweb/src/app/embed/*). Per project memory, prod deploys from the AltFTool org Amplify repos — push the embed system there and verify /embed/widget/mortgage-calculator loads before sending a single email, or every pitch link 404s and the channel is burned.

REGISTRY GAPS found by running the actual allowlist logic (altftoolweb/src/app/embed/embedRegistry.js: EMBEDDABLE_CATEGORIES = Calculators, Finance Calculators, Health Calculators, Converters; 197 tools match today):
1. loan-emi-calculator — category "Business" only → NOT embeddable, despite being the single most pitchable widget for the India EMI niche. Fix: add "Finance Calculators" to its category array in src/platform/registry/toolMetaMap.js (line ~6914).
2. bmi-calculator (line ~1400), calorie-calculator (~1831), calorie-tdee-calculator (~1851), calorie-deficit-calculator, calorie-burn-calculator — all category "Health & Fitness" → NOT embeddable; the "Health Calculators" allowlist category currently matches ~zero relevant tools. Fix: add "Health Calculators" to those tools' categories. Until then, Template 2 and all 5 health targets are on hold.
Verified-embeddable slugs used in this plan (confirmed against the registry): mortgage-calculator, mortgage-affordability-calculator, loan-prepayment-calculator, loan-prepayment-analyzer, loan-prepayment-savings, loan-comparison-tool, sip-calculator, step-up-sip-calculator, compound-interest-calculator, fd-rd-maturity-calculator, income-tax-calculator, car-loan-calculator, simple-interest-calculator, retirement-corpus-calculator.

CHANNEL RULES & PITFALLS:
- Sequence: fix registry → deploy → self-test 3 embed URLs in an incognito browser → then send P1 emails (stableinvestor bundle first: 3 articles, 1 email).
- One email per site, not per article — bundle all matching articles for a domain (stableinvestor x3, moneyexcel x2).
- Solo Indian PF bloggers reply in 3–14 days; SaaS/company blogs (fitbudd, culinahealth, mortgage lenders) route via content teams, expect 2–4 weeks or silence. Follow up once after 7 days, never twice.
- The privacy line ("inputs never leave the browser") is the strongest differentiator for health targets and technical authors (nickarnosti) — lead with it there.
- Do NOT pitch sites that already run their own calculator suites as replacements (jagoinvestor, DSLD) — pitch "in-article convenience" so readers don't leave the post.
- SEBI-registered advisors (stableinvestor) are compliance-sensitive: stress the widget shows math only, no product recommendations, no data collection.
- Attribution link is dofollow by default in the snippet; if a blogger insists on nofollow/sponsored, accept — embed traffic + brand impressions still pay, and the widget requirement is only that the line stays visible.
- Big banks/brokers/aggregators (BankBazaar, Groww, ClearTax, HDFC etc.) dominate search for these keywords but are dead ends — they build their own calculators; searches were filtered accordingly and none are included.
- reshapeapp.ai/blog/how-to-calculate-tdee-and-set-a-deficit returned HTTP 403 to automated fetch (likely bot-blocking, may load in a real browser) — excluded from targets; recheck manually if hunting for extras.
- All 13 "verified-live" target URLs were individually fetched on 2026-07-25 and confirmed to load AND to lack any interactive in-page calculator (formula/Excel/outbound-link only). Fetch-based detection of JS calculators has a small false-negative risk — glance at each page before hitting send.

### Targets

#### ✅ Stable Investor — Home Loan EMI Calculator (Free Excel sheet)
- **URL:** https://stableinvestor.com/2020/07/home-loan-emi-calculator.html
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — high-authority SEBI-registered advisor blog, exact topical fit, direct author email published
- **Requirements:** Free; email pitch to dev [at] stableinvestor [dot] com (Dev Ashish). No account. Typical solo-blogger reply time 3–14 days. No char limits.
- **Fit:** /embed/widget/mortgage-calculator (embeddable: Finance Calculators). Article's whole value prop is a downloadable Excel EMI/amortization sheet — an in-page interactive EMI + amortization widget is a strict upgrade over 'download this file'. Bonus mention in same pitch: /embed/widget/loan-prepayment-analyzer fits his companion article stableinvestor.com/2021/08/home-loan-emi-vs-sip.html (verified-live, no calculator) — one email, two placements.

#### ✅ MoneyExcel — Home Loan EMI Calculator Prepayment and Closure
- **URL:** https://moneyexcel.com/home-loan-emi-calculator-prepayment-closure/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — long-running Indian PF blog (Shitanshu Kapadia), exact fit, actively maintained
- **Requirements:** Free; no email on page — use moneyexcel.com contact page or LinkedIn/X (@moneyexcel, Shitanshu Kapadia). Same pitch can cover his second verified article below.
- **Fit:** /embed/widget/loan-prepayment-calculator (embeddable: Finance Calculators + Calculators). Article explains amortization + prepayment benefits but only offers an Excel download — the prepayment widget answers the article's exact question interactively. Secondary: /embed/widget/loan-prepayment-savings.

#### ✅ Stable Investor — SIP Investing: Advantages & Facts
- **URL:** https://stableinvestor.com/2021/07/sip-benefits-advantages.html
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — same high-value contact as #1; one email covers 3 stableinvestor placements
- **Requirements:** Free; email dev [at] stableinvestor [dot] com; no account; 3–14 day reply window.
- **Fit:** /embed/widget/step-up-sip-calculator (embeddable: Finance Calculators). Article hand-computes 'Rs 5,000 SIP with 10% annual increase → ~Rs 1 crore' scenarios — the step-up SIP widget reproduces exactly that math live. Also /embed/widget/sip-calculator. Fold into the same email as the EMI article above (same owner).

#### ✅ Jagoinvestor — How EMI's Principal and Interest breakup is done
- **URL:** https://www.jagoinvestor.com/2011/04/loan-amortization-emi.html
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — one of India's oldest PF blogs, high authority, email + WhatsApp published
- **Requirements:** Free; email on page (obfuscated) and WhatsApp +91 99799 22535; jagoinvestor.com/contact also works. Note they run their own /calculators section, so pitch the in-article convenience angle, not replacement of their tools.
- **Fit:** /embed/widget/mortgage-calculator (amortization schedule + principal/interest split is the article's exact subject). Page references an 'embedded' calculator that is actually just an outbound link + Excel downloads — a real in-page widget fixes a 15-year-old broken promise in the copy.

#### ✅ MoneyExcel — Personal Loan Calculator: Calculate EMI Using Excel
- **URL:** https://moneyexcel.com/personal-loan-calculator-calculate-emi-using-excel-download/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — same contact as target #2, bundle into one email
- **Requirements:** Free; contact page / LinkedIn / X.
- **Fit:** Ideal slug /embed/widget/loan-emi-calculator is NOT currently embeddable (tool is categorised 'Business'; embed allowlist is Calculators/Finance Calculators/Health Calculators/Converters — see notes). Until fixed, pitch /embed/widget/mortgage-calculator or /embed/widget/loan-comparison-tool.

#### ✅ Nick Arnosti — A Simple Formula for Mortgage Payments
- **URL:** https://nickarnosti.com/blog/mortgagepayments/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — clean personal-blog backlink; lower traffic but very likely genuine editorial link
- **Requirements:** Free; no email on page — homepage nickarnosti.com lists university affiliation (find faculty email there). Short, non-marketing tone essential.
- **Fit:** /embed/widget/mortgage-calculator. Academic personal blog with formulas and static R plots only; an interactive widget lets readers test his approximation against exact values. Client-side privacy angle resonates with technical authors.

#### ✅ Sistar Mortgage — How to Calculate Mortgage Payment
- **URL:** https://sistarmortgage.com/blog/how-to-calculate-mortgage-payment
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — US mortgage lender blog (NMLS #68434), commercial site but content team likely receptive to free widget
- **Requirements:** Free; email info@sistarmortgage.com or phone +1 (888) 841-4238.
- **Fit:** /embed/widget/mortgage-calculator + /embed/widget/mortgage-affordability-calculator. Article explains M = P[i(1+i)^n]/[(1+i)^n−1] and tells readers to use 'online calculators' without providing one.

#### ✅ Lucas James Personal Training — What Is BMI?
- **URL:** https://lucasjamespersonaltraining.com/what-is-bmi/10902/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — perfect content fit, held only by the registry gap
- **Requirements:** Free; contact via site About page or phone (602) 400-8506; Scottsdale AZ trainer (Lucas James).
- **Fit:** /embed/widget/bmi-calculator — BLOCKED: bmi-calculator is categorised 'Health & Fitness' and is not in the embed allowlist today (see notes; one-line registry fix required). Article literally says 'an online BMI calculator... available to make calculations easier' but embeds none.

#### ✅ Kalo Health Blog — How to Calculate Your TDEE
- **URL:** https://www.getkalohealth.com/blog/how-to-calculate-tdee
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — startup blog, fast decision-maker, exact equation match
- **Requirements:** Free; email support@getkalohealth.com.
- **Fit:** /embed/widget/calorie-tdee-calculator (Mifflin-St Jeor — the exact equation the article walks through) — BLOCKED by same registry gap as BMI (tool categorised 'Health & Fitness').

#### ✅ Culina Health — Use a TDEE Calculator to Optimize Your Nutrition
- **URL:** https://culinahealth.com/blog/tdee-calculator/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — registered-dietitian practice (Hoboken NJ), professional content team
- **Requirements:** Free; culinahealth.com/contact/ form.
- **Fit:** /embed/widget/calorie-tdee-calculator — the article currently sends readers OFF-SITE to Calculator.net and Healthline; an embedded widget keeps their readers on-page (strong self-interest angle). BLOCKED by the same health-category registry gap.

#### ✅ FitBudd — Trainer's Guide on How to Use BMI for Weight Loss
- **URL:** https://www.fitbudd.com/post/trainers-guide-on-how-to-use-bmi-for-weight-loss
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — SaaS content team, embed acceptance less certain than solo bloggers
- **Requirements:** Free; fitbudd.com/contact-us form.
- **Fit:** /embed/widget/bmi-calculator (pending registry fix). Formula-only article on a SaaS-for-trainers blog; they publish guest-friendly content at volume.

#### ✅ Superprof Blog — How to Calculate Your BMI
- **URL:** https://www.superprof.com/blog/body-mass-index-coach/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — big marketplace blog, no direct contact published, low reply odds
- **Requirements:** Free; only generic platform contact/comment section — lowest-effort pitch last.
- **Fit:** /embed/widget/bmi-calculator (pending registry fix). Formula-only, no calculator.

#### ✅ DSLD Mortgage — How to Calculate a Mortgage Payment
- **URL:** https://www.dsldmortgage.com/blog/how-to-calculate-a-mortgage-payment/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — weakest need; keep as backfill
- **Requirements:** Free; dsldmortgage.com/contact/ or 1.844.DSLD.MTG; author Dana Hendrix (SVP Finance).
- **Fit:** /embed/widget/mortgage-calculator — but the article already links DSLD's OWN mortgage calculator on another page, so they may decline; pitch the in-article convenience angle only.

#### ⚠️ Stable Investor — Rs 1 Crore Home Loan EMI
- **URL:** https://stableinvestor.com/2018/06/1-crore-home-loan-emi.html
- **Status (2026-07-25):** could-not-verify
- **Priority:** P3 — bonus placement inside an already-planned email
- **Requirements:** Same contact as target #1.
- **Fit:** /embed/widget/mortgage-calculator — surfaced in search but I did not individually fetch this URL; same owner/contact as targets #1/#3, so include it in that email only if it checks out.

#### ❌ AltFTool embed hub (the asset itself)
- **URL:** https://www.altftool.com/embed
- **Status (2026-07-25):** dead
- **Priority:** P0 — nothing else can ship until this is live
- **Requirements:** Deploy dev monorepo embed routes to production via the AltFTool org Amplify repo.
- **Fit:** BLOCKER, not a target: /embed and /embed/widget/sip-calculator and /embed/widget/loan-emi-calculator all return 404 in production as of 2026-07-25. The embed system exists only in the dev monorepo (altftoolweb/src/app/embed/, commit d86aa0e9 lineage). Canonical tool pages ARE live (verified https://www.altftool.com/tools/all/sip-calculator loads the interactive tool). Deploy to the Amplify org repo BEFORE sending any pitch.

### Ready-to-paste content

```text
=== EMBED-PITCH EMAIL TEMPLATE 1: Finance blogs (EMI / SIP / mortgage) ===

Subject: Free interactive {EMI/SIP/mortgage} calculator for your "{ARTICLE TITLE}" article — one iframe, no signup

Hi {FIRST NAME},

I was reading your article {ARTICLE URL} — the {Excel sheet / worked formula} is genuinely useful, but your readers still have to leave the page (or open a spreadsheet) to run their own numbers.

We built a free embeddable version of exactly this calculator at AltFTool. It runs entirely in the reader's browser (nothing is sent to any server), has no ads inside the widget, no signup, and matches the standard reducing-balance math Indian banks use. You paste one iframe tag and it works:

<iframe src="https://www.altftool.com/embed/widget/mortgage-calculator"
  title="Mortgage Calculator — free AltFTool widget"
  width="100%" height="640" style="border:0;border-radius:12px;overflow:hidden"
  loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
<p style="font-size:12px;margin:4px 0 0">Widget by <a href="https://www.altftool.com/tools/all/mortgage-calculator?utm_source=embed&utm_medium=widget">AltFTool — free online tools</a></p>

Live preview: https://www.altftool.com/embed/widget/mortgage-calculator
Full widget catalog (197 calculators/converters): https://www.altftool.com/embed

The only thing we ask is that the small "Widget by AltFTool" attribution line under the widget stays visible. No cost, no tracking scripts, no branding takeover — the widget inherits a neutral look and supports light and dark themes.

If a different calculator fits better (SIP with annual step-up, loan prepayment vs. investment, FD/RD maturity, income tax), the full list is at https://www.altftool.com/embed — same one-tag embed for each.

Happy to adjust the default currency, height, or theme if you'd like.

Best,
{YOUR NAME}
AltFTool — https://www.altftool.com
admin@altftool.com

---

=== EMBED-PITCH EMAIL TEMPLATE 2: Health/fitness blogs (BMI / TDEE / calorie) ===
[SEND ONLY AFTER the health-widget registry fix ships — see notes]

Subject: Free interactive {BMI/TDEE} calculator for your "{ARTICLE TITLE}" post — one iframe, no signup

Hi {FIRST NAME},

Your post {ARTICLE URL} explains the {BMI formula / Mifflin-St Jeor equation} really clearly — but readers still have to grab a phone calculator (or leave for another site) to get their own number.

We made a free embeddable calculator that does it right on your page. It's one iframe tag: no signup, no ads inside the widget, and it's fully client-side — your readers' height/weight/age never leave their browser, which matters for health data.

<iframe src="https://www.altftool.com/embed/widget/bmi-calculator"
  title="BMI Calculator — free AltFTool widget"
  width="100%" height="640" style="border:0;border-radius:12px;overflow:hidden"
  loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
<p style="font-size:12px;margin:4px 0 0">Widget by <a href="https://www.altftool.com/tools/all/bmi-calculator?utm_source=embed&utm_medium=widget">AltFTool — free online tools</a></p>

Live preview: https://www.altftool.com/embed/widget/bmi-calculator

Only ask: keep the small "Widget by AltFTool" attribution line visible. We also have TDEE/calorie-macro, calorie-deficit, BMR, and ideal-weight widgets if those fit other posts — catalog at https://www.altftool.com/embed.

Best,
{YOUR NAME}
AltFTool — https://www.altftool.com
admin@altftool.com

---

=== PER-TARGET SLUG SWAP TABLE (paste the right slug into both the iframe src and the attribution href) ===
- stableinvestor.com/2020/07/home-loan-emi-calculator.html → mortgage-calculator
- stableinvestor.com/2021/08/home-loan-emi-vs-sip.html → loan-prepayment-analyzer
- stableinvestor.com/2021/07/sip-benefits-advantages.html → step-up-sip-calculator (alt: sip-calculator)
- moneyexcel.com/home-loan-emi-calculator-prepayment-closure/ → loan-prepayment-calculator
- moneyexcel.com/personal-loan-calculator-calculate-emi-using-excel-download/ → mortgage-calculator (until loan-emi-calculator is made embeddable)
- jagoinvestor.com/2011/04/loan-amortization-emi.html → mortgage-calculator
- nickarnosti.com/blog/mortgagepayments/ → mortgage-calculator
- sistarmortgage.com/blog/how-to-calculate-mortgage-payment → mortgage-calculator (+ mortgage-affordability-calculator)
- dsldmortgage.com/blog/how-to-calculate-a-mortgage-payment/ → mortgage-calculator
- lucasjamespersonaltraining.com/what-is-bmi/10902/ → bmi-calculator (after registry fix)
- getkalohealth.com/blog/how-to-calculate-tdee → calorie-tdee-calculator (after registry fix)
- culinahealth.com/blog/tdee-calculator/ → calorie-tdee-calculator (after registry fix)
- fitbudd.com/post/trainers-guide-on-how-to-use-bmi-for-weight-loss → bmi-calculator (after registry fix)
- superprof.com/blog/body-mass-index-coach/ → bmi-calculator (after registry fix)

Snippet format above is the EXACT output of altftoolweb/src/app/embed/embedSnippet.js (buildSnippet), including the attribution line with utm_source=embed&utm_medium=widget — do not hand-edit the structure, just swap slug and title.
```

---

## communities

### Rules, timing and pitfalls

VERIFICATION CAVEATS: reddit.com (www/old/api) is blocked for both WebFetch and the sandboxed browser here, so all four subreddit rule sets were verified today via the live safereddit.com redlib mirror (old-reddit sidebars) plus redditgrowthdb.com (webdev, updated 2026-07-13); old-reddit sidebars can lag the new-reddit rules panel, so have a human re-open each /about/rules page in a normal browser the day of posting. CRITICAL SITE FINDINGS (verified by fetching altftool.com today): (1) https://altftool.com/embed returns 404 ('AltFTool is preparing this route') — the embed widget system exists in the repo (/Users/niki/knworkspace/kn1/altftool) but is not deployed; the Show HN Draft A, Showoff Saturday, and dev.to pieces are blocked until it ships to prod. (2) The Patatap clone is live at https://altftool.com/patatap and titled 'Patatap - Portable Animation and Sound Kit' — it uses the original project's exact name (trademark + guaranteed community call-out); rename to KeyCanvas (route + title + metadata) before ANY community promotion. Similarly /radio-garden and /geektyper carry the originals' names in their slugs even though pages are rebranded (OpenAir Garden, AltF Code Theater). (3) Live site claims '1,300+ trusted tools' (not the 1,124 in the brief) — drafts use the live claim. SAFE TO PROMOTE: original client-side tools (PDF/image/converters/calculators), the /embed system, SketchFlow, IdeaLab/DomainOps suites. MODERATE RISK: Code Theater, Reflex Lab (rebranded tributes; Reflex Lab is additionally rule-banned on IIB as a webgame/quiz). HIGH RISK: /patatap (do not promote until renamed), OpenAir Garden on IIB ('not unique' rule; disclose inspiration if posted). ACCOUNT PREP (applies to every reddit target): IIB enforces an explicit 90/10 self-promo rule and r/webdev cites the 9:1 reddiquette rule — use an aged account (30+ days, few hundred karma) whose history is mostly non-promotional; never cross-post identical text the same day, and never solicit upvotes anywhere (HN detects rings). SEQUENCING SUGGESTION: (1) rename patatap→keycanvas + deploy /embed, (2) dev.to article + IH product listing (no gatekeepers), (3) r/SideProject, (4) Show HN Tue–Thu 8–10am ET, (5) Showoff Saturday, (6) IIB last, highest risk. r/coolgithubprojects stays parked until an MIT-licensed repo (embed SDK or a game) exists on GitHub — remember the project's GPL/AGPL ban when packaging it.

### Targets

#### ✅ Hacker News — Show HN
- **URL:** https://news.ycombinator.com/showhn.html
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — biggest single-day traffic + high-authority backlink upside; rules verified today and AltFTool qualifies (try without signup)
- **Requirements:** Free HN account; no karma minimum to submit. Title MUST start with 'Show HN:'. Must be something people can try immediately without barriers/signup (verified: AltFTool tools need no signup). Submit URL + optional text. No voting rings ('Don't solicit upvotes'), no delete-and-repost. Blog posts/waitlists ineligible. New green accounts draw scrutiny — ideally use an account with some comment history.
- **Fit:** PRIMARY: the /embed widget system (197 client-side calculator/converter widgets, original infrastructure, concrete technical story HN likes). BLOCKER VERIFIED TODAY: https://altftool.com/embed returns 404 ('preparing this route') — the embed system is in the repo but NOT deployed to prod. Deploy first, or use the fallback platform post. FALLBACK: the platform itself with the privacy/client-side angle. Do NOT Show HN the clone experiences (Patatap/Radio Garden clones) — HN reliably calls out tributes, and /patatap literally uses the original's name.

#### ⚠️ r/SideProject
- **URL:** https://www.reddit.com/r/SideProject/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P1 — most lenient major subreddit for self-promo; lowest removal risk, good feedback loop
- **Requirements:** Free reddit account. Sidebar (verified today via safereddit.com mirror; reddit.com blocks automated fetch — re-check rules panel in-browser before posting): submission format '[Project name] - [Short description]'. Explicitly a sub 'for sharing and receiving constructive feedback on side projects'. No published karma/age minimum, but big subs automod-filter brand-new accounts — use an account 30+ days old with some history.
- **Fit:** The whole AltFTool platform (1,300+ tools claim verified on live /tools page) framed as a builder journey + feedback request. Also a good later slot for the /embed widget system once deployed.

#### ✅ dev.to — #showdev tag
- **URL:** https://dev.to/t/showdev
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — zero gatekeeping, tag active with posts dated July 24–25, 2026; article is a durable indexable page linking to AltFTool
- **Requirements:** Free account, publish immediately. #showdev sidebar rules (verified today): 'For showing off projects and launching products… make posts community-driven and not overly corporate or salesy'; actual projects, not tutorials. Code of Conduct requires disclosing AI assistance in content. Links are rel-nofollow (traffic/brand value, weak direct SEO). Markdown editor, no char limit.
- **Fit:** A build-story article about the /embed widget system or the client-side privacy architecture (files never leave the browser) with #showdev #webdev #javascript #opensource tags, linking to https://altftool.com and deep pages.

#### ⚠️ r/webdev — Showoff Saturday
- **URL:** https://www.reddit.com/r/webdev/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P2 — 2.6M devs, but Saturday-only and must be technical-first
- **Requirements:** Rules verified today via safereddit mirror + redditgrowthdb (updated 2026-07-13): sharing your project 'is limited to Showoff Saturday' — any other day it's removed; 'no excessive self-promotion' per reddit 9:1 rule; 'We do not allow any commercial promotion or solicitation — violations can result in a ban'. Post Saturday (US morning), flair 'Showoff Saturday', focus on technical details (stack, client-side processing, perf), not marketing.
- **Fit:** The /embed widget system (after deploy) or the client-side file-processing architecture — genuinely technical angles. Avoid deals/ads/'1,300 tools' marketing framing; that reads commercial and risks a ban.

#### ✅ Indie Hackers
- **URL:** https://www.indiehackers.com/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — active community + Products database listing = durable profile backlink
- **Requirements:** Free account to post (IH+ paywall is for premium stories only). Verified today: community feed, Products database, Build Board all live. Norms: transparent founder-journey posts with real numbers perform; bare link-drops get ignored/removed. Add AltFTool to the Products database (backlink) and write a milestone post. Revenue claims should be honest/verifiable.
- **Fit:** Platform-level story: 'Free-tools directory as a business — 1,300 tools, ad-supported, no signup' with traffic/revenue lessons. IH audience cares about the model, not the tools.

#### ⚠️ r/InternetIsBeautiful
- **URL:** https://www.reddit.com/r/InternetIsBeautiful/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P3 — 16.6M members and huge viral upside, but highest removal/call-out risk of all channels for AltFTool's current assets
- **Requirements:** Full rules verified today via safereddit.com mirror: NO aggregators/collections (the AltFTool directory itself is ineligible — post ONE single-purpose experience); NO webgames incl. quizzes (kills Reflex Lab/human-benchmark); NO sites requiring email/account (AltFTool OK); NO AI-generated content or AI-driven functionality (avoid any AI-box page); NO business tools; 'not unique' rule removes sites 'that do very similar things to previous submissions' (Radio Garden and Patatap were both famous IIB hits — clones are exposed); explicit 90/10 self-promotion rule: 90% of the posting account's reddit activity must be unrelated to your site. Highly curated, mod discretion. Link post + context comment format.
- **Fit:** Least-bad pick of the four candidates: OpenAir Garden (https://altftool.com/radio-garden — verified live today) — most visually striking and not a webgame. ORIGINALITY RISK: HIGH — it is a Radio Garden clone AND the URL slug is literally /radio-garden. KeyCanvas is worse: live page is titled 'Patatap - Portable Animation and Sound Kit' at /patatap — it uses the original's exact name; do NOT promote until renamed. Reflex Lab is rule-banned (webgame/quiz). Code Theater (/geektyper — again original's name in slug) is a known-genre hackertyper clone. RECOMMENDATION: rename routes/titles to owned brands (OpenAir Garden at /openair-garden, KeyCanvas at /keycanvas) BEFORE any community promotion, disclose 'inspired by' in the comment, and treat this sub as a later, high-risk play.

#### ⚠️ r/coolgithubprojects
- **URL:** https://www.reddit.com/r/coolgithubprojects/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P3 — currently BLOCKED: sub accepts GitHub-hosted projects only and AltFTool is closed-source
- **Requirements:** Rules verified today via safereddit mirror: 'GitHub only: the projects you post all have to be hosted on Github'; title format '[Desc] - [Suggested title]'; language flair auto-assigned; reposts allowed only if 6+ months later with new features. Small sub, easygoing feedback.
- **Fit:** Unusable until something is open-sourced. Actionable path: publish the embed-widget loader/SDK (or one original game) as an MIT-licensed GitHub repo whose README links to altftool.com — that unlocks this sub AND strengthens the Show HN widget story. (License policy note: repo must avoid the known GPL/AGPL exposure.)

### Ready-to-paste content

```text
=================================================================
1) SHOW HN — DRAFT A (preferred, POST ONLY AFTER /embed DEPLOYS — it 404s on prod today)
=================================================================
Title:
Show HN: Free embeddable calculator and converter widgets, no tracking or signup

URL: https://altftool.com/embed

Text:
Hi HN. I run AltFTool, a free browser-tools site, and I kept getting emails from bloggers asking to embed our calculators. So I built a widget system: ~200 of our calculators and converters (loan, BMI, unit, currency-style converters, date math, etc.) can now be dropped into any page with a single iframe snippet.

Design decisions I'd love feedback on:
- Everything computes client-side inside the iframe — no data leaves the visitor's browser, no cookies, no tracking.
- Widgets are theme-aware (light/dark via a URL param) so they don't clash with the host page.
- The only "payment" is a small attribution link under the widget.
- No signup, no API key, no rate limits — the snippet is copy-paste.

Things I'm unsure about: whether iframes are still the right isolation boundary vs. web components, and how to keep embed weight small while sharing one design system with the main site.

Try it: pick any widget at https://altftool.com/embed and paste the snippet into a local HTML file.

-----------------------------------------------------------------
SHOW HN — DRAFT B (usable today, platform angle)
-----------------------------------------------------------------
Title:
Show HN: AltFTool – free browser tools that process files client-side, no signup

URL: https://altftool.com

Text:
Hi HN. Over the past couple of years I've been building AltFTool, a collection of free browser tools (PDF, image, converters, calculators, developer and security utilities). The rule I set myself: every tool must work without an account, and file tools must process everything in the browser — your PDFs and images never touch our servers.

Technical bits: Next.js, tools ship as isolated client bundles so one tool's dependencies don't bloat another's, and heavy work (image/PDF transforms) runs in the browser via WASM/web workers. It's ad-supported, which is the honest trade-off for keeping everything free and signup-less.

Happy to answer anything about keeping a large tool catalog fast, or the client-side-only constraint.

Posting notes for both drafts:
- Post Tue–Thu, 8:00–10:00 a.m. ET. One submission only; never delete-and-repost. If it gets no traction, HN tolerates a retry after a week or two (and mods sometimes re-up good Show HNs via the second-chance pool — you can email hn@ycombinator.com once).
- Stay in the thread all day answering comments; Show HN threads live or die on the author's replies.
- Do NOT ask anyone to upvote (rings are detected). Expect and pre-empt the hard questions: ads, closed source, the cloned lab experiences (if asked, answer honestly that the labs section includes tributes and the core tools are original).

=================================================================
2) r/InternetIsBeautiful — LINK POST (HIGH RISK — read fit notes; rename /radio-garden slug first if possible)
=================================================================
Post type: Link post
Link: https://altftool.com/radio-garden
Title:
Spin a globe and tune into live radio stations streaming from cities around the world

First comment (post immediately after submitting — IIB expects author context here):
Creator here. This is OpenAir Garden — a free, browser-only way to wander the world through live radio. Click anywhere on the globe or browse by region, and it tunes into a station actually broadcasting there right now. No account, no app, nothing to install.

Full disclosure: the idea is openly inspired by the classic Radio Garden. I built my own take because I wanted a lighter version with favorites, keyboard navigation, and no signup wall, and I wanted it to stay free. If you love this genre of site, the original deserves credit for inventing it.

Would love to hear which stations people land on.

Posting notes:
- The posting ACCOUNT matters more than the post: IIB enforces a 90/10 rule — 90% of the account's reddit history must be unrelated to AltFTool. Do not post from a fresh or promo-only account.
- Expect possible removal under the "not unique / very similar to previous submissions" rule — Radio Garden was an IIB legend. The disclosure comment is your best defense; hiding the inspiration guarantees a call-out.
- Never post the AltFTool directory itself here (aggregators banned), Reflex Lab (webgames/quizzes banned), or anything AI-driven (AI functionality banned).
- Best window: weekday 9–11 a.m. ET. Check server capacity first — IIB traffic spikes hard and "Hug of Death" posts get pulled.

=================================================================
3) r/SideProject — TEXT POST
=================================================================
Title (sub's required format):
AltFTool - 1,300+ free browser tools that work without signup, files never leave your browser

Body:
Hey r/SideProject!

What started as a handful of PDF utilities has grown into AltFTool (https://altftool.com) — a free platform with 1,300+ browser tools: PDF and image tools, converters, calculators, developer and security utilities, plus some interactive experiments and small games.

Two rules I've never broken while building it:
1. No signup for anything. Ever.
2. File tools run 100% client-side — your PDFs/images are processed in your browser and never uploaded.

Recent addition I'm most excited about: an embed system so bloggers can drop any of our calculators into their own site with one iframe snippet (free, just an attribution link).

It's ad-supported, which keeps it free. Built with Next.js.

Would genuinely love feedback on:
- Discoverability: with 1,300 tools, how would you improve finding the right one fast?
- Which single tool category would you double down on?

Happy to answer anything about the build.

Posting notes: post from an aged account, weekday morning ET (weekends also fine here). Reply to every comment in the first 2 hours. This sub is feedback-friendly — asking real questions outperforms announcing.

=================================================================
4) BONUS: r/webdev "Showoff Saturday" — TEXT POST (Saturday ONLY, flair: Showoff Saturday)
=================================================================
Title:
Showoff Saturday: I built an embeddable widget system — 200 calculators as client-side iframes with theme sync

Body:
Sharing the technical side of something I shipped for my free-tools site: an embed layer that exposes ~200 calculators/converters as iframe widgets anyone can paste into their page.

Interesting problems along the way:
- Keeping each embed lightweight while sharing one design system with the main Next.js app (per-widget entry points, aggressive code-splitting).
- Theme handoff: a URL param sets light/dark so the widget matches the host page without a FOUC.
- Privacy constraint: all computation stays inside the iframe — no cookies, no postMessage data exfiltration, nothing sent to the server.

Demo: https://altftool.com/embed
Would love opinions on iframes vs. web components for this use case.

(Do not post this until /embed is live in prod; keep it technical — this sub bans commercial promotion.)

=================================================================
5) BONUS: dev.to #showdev — ARTICLE (paste into dev.to editor)
=================================================================
---
title: I built 200 embeddable, privacy-first calculator widgets — here's the architecture
tags: showdev, webdev, javascript, privacy
---

[Intro] I run AltFTool (https://altftool.com), a free browser-tools platform. Bloggers kept asking to embed our calculators, so I built a widget system: https://altftool.com/embed

[Section: The constraint that shaped everything] Every tool on the platform runs client-side — files and inputs never leave the browser. The embeds had to inherit that guarantee.

[Section: Why iframes won over web components] isolation, CSP, no style bleed; the trade-offs I accepted.

[Section: Theme sync without flashes] the ?theme= param approach.

[Section: Keeping embeds under X KB] code-splitting a 1,300-tool Next.js monorepo so each widget ships alone.

[Section: The attribution-link model] free forever, one link back — why that beats API keys.

[Closing] Try any widget at https://altftool.com/embed and tell me what breaks. (If AI tools assisted the writing, add dev.to's AI-assistance disclosure line — their CoC requires it.)

=================================================================
6) BONUS: Indie Hackers — PRODUCT + MILESTONE POST
=================================================================
a) Add product at https://www.indiehackers.com/products (name: AltFTool; tagline: "1,300+ free browser tools — no signup, files never leave your browser"; link: https://altftool.com).
b) Feed post title: "1,300 free tools, zero signups: how an ad-supported utility site actually works"
Body outline: the model (free + ads vs freemium), why no-signup is a growth feature, what the embed-widget launch is meant to do for distribution (attribution backlinks), one honest number you're willing to share (traffic or revenue — IH culture expects a real metric; unverifiable revenue claims get called out). End with a question: "Would you have gone freemium instead?"
```

---

## journalist-request-platforms (HARO successors)

### Rules, timing and pitfalls

STATE OF THE CHANNEL (verified 2026-07-25): HARO died as 'Connectively' (Cision, 2024-12-09), was bought and relaunched FREE by Featured.com in April 2025, and is fully operating again at 3 emails/day — this plus SOS (Shankman's free successor) and Qwoted's free tier form the zero-budget core stack. UK services (PressPlugs £29/mo, ResponseSource ~£625/yr/category) are alive but paid — trial-only for now. Help a B2B Writer is now MentionMatch (Superpath) and mid-relaunch — sign up early.

RULES & PITFALLS: (1) Speed wins — HARO/SOS digests are answered by hundreds; reply within 30–60 min of the email landing. Digests arrive ~5:35am/12:35pm/5:35pm ET on HARO. (2) SOS bans permanently for one off-topic pitch — no appeals; only answer exact-match queries. (3) Answer the question in the pitch itself (full usable quote, 40–120 words) — never 'happy to chat'. (4) Featured runs an AI-answer check and reporters run detectors — write the quotes yourself or heavily personalize the templates above; the airplane-mode test line in Template B is the kind of concrete, demonstrable detail that gets picked. (5) Never ask for a link — attribution with URL is standard; asking flags you as an SEO. (6) Qwoted free = 2 pitches/mo with a 2-hour delay — reserve for DR70+ exact-fit queries; the delay means pitch the moment an alert fires. (7) Use one identity everywhere: Nikhil Sahu, Founder, AltFTool + the 2-line bio, from admin@altftool.com. (8) Expected yield at ~5 quality pitches/week across HARO+SOS+Qwoted: roughly 2–5 DR40+ editorial links/month after the first month. (9) Bot-checkpoint caveat: helpareporter.com and featured.com serve a Vercel security page to automated fetchers — they load fine in a normal browser; sourceofsources.com similarly blocks bots (verified via text proxy). Sources: cision.com/connectively-has-been-discontinued/, blog.helpareporter.com/help-a-reporter-out-haro-is-back/, qwoted.com/pricing-2/, sourceofsources.com, superpath.co/blog/superpath-has-acquired-help-a-b2b-writer, pressplugs.co.uk/trial, responsesource.com, sourcebottle.com.

### Targets

#### ✅ HARO — Help a Reporter Out (revived by Featured.com)
- **URL:** https://www.helpareporter.com/sign-up
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — free, highest volume (3 digests/day), the classic backlink channel is back and less crowded than pre-2024
- **Requirements:** Free forever (sponsor-supported). Email-only signup at helpareporter.com/sign-up — no profile build required. 3 emails/day (morning/afternoon/evening ET). Reply directly to the masked reporter email. Owned by Featured.com since Apr 2025; emails resumed 2025-04-22 (confirmed on their live blog: blog.helpareporter.com/help-a-reporter-out-haro-is-back/). Note: apex domain serves a Vercel bot-checkpoint to automated fetchers but loads normally in a browser; their blog and signup page are indexed and current.
- **Fit:** Pitch as founder of a 1,124-tool free platform: productivity, PDF/image workflows, password/security habits, online-privacy queries appear daily. Quote placements typically link to https://altftool.com homepage or a category page.

#### ✅ Source of Sources (SOS) — Peter Shankman
- **URL:** https://www.sourceofsources.com/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — free, run by HARO's original founder, ~20k journalists incl. WSJ/WaPo/Forbes/NPR; high signal, low spam
- **Requirements:** 100% free (they suggest donating to animal charities). Sign up with name + email on the homepage; up to 3 digest emails/day. HARD RULE: off-topic or salesy replies = permanent removal, no appeals — only answer queries you genuinely match. Direct fetch is bot-protected (403) but content verified via text proxy today; site is fully operational.
- **Fit:** Best for privacy/client-side-security expert quotes (files-never-leave-browser angle) and productivity/remote-work roundups. Links usually go to https://altftool.com or a specific tool page a journalist finds useful.

#### ✅ Qwoted
- **URL:** https://app.qwoted.com/users/sign_up
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — captured most high-DR journalist queries after the Connectively shutdown; free tier is small but placements are premium
- **Requirements:** Account + expert profile required. Free Basic plan: 2 pitches/month with a 2-hour response delay, real-time alerts, daily opportunities email, listing in reporter-searchable database. Pro is $149/mo for 35 pitches/mo with no delay (skip initially). Pricing verified at qwoted.com/pricing-2/. Spend the 2 monthly pitches only on DR70+ outlets that match exactly.
- **Fit:** Build the profile around 'founder of AltFTool — free, no-signup, client-side browser tools (privacy-first)'. Tech/cybersecurity/small-business reporters here regularly need tool-recommendation and privacy commentary; profile itself is discoverable by reporters.

#### ⚠️ Featured.com (HARO's parent; curated Q&A placements)
- **URL:** https://featured.com/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P2 — free tier gives 3 answers/mo into its publisher network (readwrite, gohighlevel blogs, many niche pubs); complements HARO volume
- **Requirements:** Site returns HTTP 429/Vercel bot-checkpoint to automated fetchers today, so direct page-load could not be captured — but it is demonstrably operating (it runs the revived HARO, its pricing was updated on its own blog, current G2 listing). Free Starter plan: 3 answer submissions/mo, 3 keyword alerts, AI-answer check, submission tracking; Lite ~10 answers/mo; Pro/Business unlimited answers from $49/mo (annual) or $99/mo. Sign up on featured.com in a normal browser. Note: answers are screened — obviously-AI text gets rejected.
- **Fit:** Set keyword alerts: 'productivity tools', 'online privacy', 'password security'. Answers credit 'Nikhil Sahu, Founder, AltFTool' with a link to https://altftool.com.

#### ✅ MentionMatch (formerly Help a B2B Writer, acquired by Superpath)
- **URL:** https://mentionmatch.com/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — free and the single best category fit (SaaS, AI & Tech, SEO, Analytics, Design & UX, Marketing), but currently mid-relaunch
- **Requirements:** Free for sources. helpab2bwriter.com now 301-redirects here. Landing page verified today but shows a 'launching soon' relaunch banner under new owner Superpath; signup = register + select expertise areas, then matching requests arrive by email (9,000+ sources claimed). Their X account (@HelpaB2BWriter) still posts source requests. Sign up now to be in the pool when relaunch emails flow; expect some transition flakiness.
- **Fit:** B2B/SaaS content writers constantly need quotes on productivity stacks, free-tool alternatives, and browser-based workflows — exactly AltFTool's wheelhouse. Placements land on company blogs that link https://altftool.com or specific tools.

#### ✅ SourceBottle
- **URL:** https://www.sourcebottle.com/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — free but Australia/NZ-centric media; do the free expert profile once, low ongoing effort
- **Requirements:** Free expert profile + free call-out digests (current call-outs dated July 2026 confirmed). Paid upgrades optional, unnecessary. Mostly AU outlets (SMH, ABC AU, Guardian AU).
- **Fit:** Occasional tech/small-business call-outs; AltFTool is location-agnostic (browser tools), so AU links still count. Low priority, near-zero maintenance.

#### ✅ PressPlugs
- **URL:** https://pressplugs.co.uk/trial
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — paid (£29/mo) and UK-only; only worth a 7-day free-trial sprint, then cancel unless it converts
- **Requirements:** 7-day free trial, then £29/user/mo rolling (cancel anytime). UK journalists only (BBC, Daily Mail, Guardian, Telegraph readers' outlets); vetted requests pushed within minutes to dashboard + inbox. Copyright 2026, fully active.
- **Fit:** Use the free week during a news hook (e.g., a data-privacy news cycle) to pitch the client-side privacy angle to UK tech/consumer journalists.

#### ✅ ResponseSource Journalist Enquiry Service (Pulsar Group)
- **URL:** https://www.responsesource.com/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — established UK service but ~£625/year per category; skip until there's UK-focused budget
- **Requirements:** Paid: from roughly £625/yr per category (e.g. Computing & Telecoms); free trial advertised on homepage (verified live today with July 2026 content; pricing page moved — start from homepage 'Pricing' nav, old /pricing/ path 404s). Journalist side is free.
- **Fit:** Only if AltFTool later wants sustained UK trade/consumer-tech coverage; category fit would be Computing & Telecoms + Business & Finance.

#### ❌ Connectively (HARO 2023–2024 rebrand) — DEAD
- **URL:** https://www.cision.com/connectively-has-been-discontinued/
- **Status (2026-07-25):** dead
- **Priority:** P3 — do not sign up anywhere claiming to be Connectively; brand assets went to Featured.com
- **Requirements:** Shut down 2024-12-09 by Cision (confirmation page above). Any 2026 'Connectively' signup offer is stale or a scam.
- **Fit:** N/A — listed to prevent wasted effort.

### Ready-to-paste content

```text
=== FOUNDER BIO (2 lines — paste into every profile/pitch signature) ===
Nikhil Sahu is the founder of AltFTool (https://altftool.com), a free platform of 1,124 browser-based tools — PDF, image, converters, calculators, developer and security utilities — plus 197 embeddable widgets and 41 games. Everything runs client-side with no signup, so files and data never leave the user's browser.

(Contact: admin@altftool.com — use this address for all platform signups so replies stay in one inbox.)

=== PITCH TEMPLATE A — productivity-tools expert quote ===
Subject: [QUERY SUBJECT LINE] — founder of 1,124-tool free platform, quote inside

Hi [First name],

Re your query on [topic]: I run AltFTool, a free platform of 1,124 browser tools used for exactly this kind of workflow, so I see daily which tools people actually reach for.

Quote you're free to use or trim:

"The biggest productivity leak isn't a missing app — it's the signup wall. When someone needs to merge a PDF or convert a file, every account-creation screen costs two to five minutes and usually an email inbox full of marketing later. The fastest teams standardize on browser-based tools that work instantly with no login: open tab, do the task, close tab. If a one-off task takes longer to sign up for than to do, that's the tool telling you to switch."

Happy to add a specific stat, tailor the angle to your draft, or supply extra context on [topic]. Not looking for anything promotional — attribution as below is plenty.

Nikhil Sahu, Founder, AltFTool (https://altftool.com) — 1,124 free, no-signup browser tools; everything runs client-side so files never leave the user's browser.

=== PITCH TEMPLATE B — privacy / client-side security expert quote ===
Subject: [QUERY SUBJECT LINE] — client-side privacy expert, quote inside

Hi [First name],

Re your query on [online privacy / data security topic]: I build client-side security and file tools for a living (AltFTool — 1,124 free browser tools including password, hash, and encryption utilities), so this is my daily territory.

Quote you're free to use or trim:

"Most people think the risk of a free online converter is malware. The real risk is the upload itself: the moment your tax PDF or contract hits someone else's server, you've lost control of it — regardless of what the privacy policy promises. The test I give everyone: switch off your Wi-Fi after the page loads. If the tool still works, it's processing everything locally in your browser and your file never left your machine. If it breaks, your document was being shipped to a server you know nothing about."

Happy to demonstrate the airplane-mode test on any tool you're covering, or expand on browser-sandbox security for your piece.

Nikhil Sahu, Founder, AltFTool (https://altftool.com) — free, privacy-first browser tools; 100% client-side processing, no accounts, files never leave the browser.

=== QWOTED / FEATURED PROFILE BLURB (expertise-areas field) ===
Free software & browser tools; online privacy & client-side data security; productivity workflows; small-business software costs; password hygiene; PDF/file-format workflows; web development tools.

=== KEYWORD ALERTS TO SET (HARO keyword alerts via Featured, Qwoted alerts) ===
productivity tools, free software, online privacy, data security, password, PDF, file sharing, small business software, browser, cybersecurity tips
```

---

## Scaled embed distribution (WordPress plugin, CMS galleries, Chrome Web Store, npm/GitHub package)

### Rules, timing and pitfalls

TIMING: Do nothing until /embed + /embed/widget/[slug] are deployed to prod (both 404 today; tool pages are live). WP reviewers manually test — a dead service URL gets an instant rejection and burns the permanent slug conversation.

WORDPRESS PITFALLS (all verified against current guidelines): (1) Guideline 10 — the front-page credit link MUST be opt-in and default-hidden; shipping it on by default is the #1 rejection risk for this exact plugin type. (2) Guideline 8 — never iframe altftool.com inside wp-admin; build the block picker from a bundled JSON list of the 197 slugs (regenerate from embedRegistry.js at build time), not a remote fetch. (3) Guidelines 6/7 — readme must disclose the external service + privacy policy (draft above includes it). (4) Run the official Plugin Check plugin before submitting; enable 2FA on the wordpress.org account (both required for new submissions). (5) Slug (altftool-widgets) is permanent; name uses your own trademark so no conflict. (6) Official review 1-10 days but the queue is described by recent submitters as a "two-stage game" — expect an email with required fixes; respond fast or the thread goes stale (3-month cap, then auto-reject). (7) Plugin zip <10MB, GPLv2+ only.

LINK-EQUITY REALITY (verified in raw HTML today): wordpress.org plugin-page outbound links = rel="nofollow ugc"; GitHub README/sidebar links = rel="nofollow"; npm homepage links = rel="nofollow" (though npm leaves github.com links followed); Chrome Web Store developer links = rel="ugc nofollow". NONE of these listing pages pass direct equity. The followed backlinks in this channel come from the embed snippet's attribution <p> placed on third-party pages — WP-plugin installs (opt-in), and every manual copy-paste from /embed. Listings are the distribution engine that multiplies those placements, plus high-authority brand mentions and referral traffic.

DEAD ENDS CONFIRMED TODAY: Ghost directory closed to submissions (on-page FAQ + staff forum reply) — forum post is the only path. Notion gallery only accepts OAuth API "connections" — iframe widgets ineligible; target Notion users with a "embed in Notion" tutorial page instead (widgets already work via Notion's native /embed block). Webflow Marketplace needs a full reviewed App — skip; Webflow users paste the iframe natively.

CWS: could not find any live AltFTool extension (searched store + Google site: operator). If they exist under another publisher name, get the URLs from the owner and just fix the website/support fields — expect referral value only, zero equity.

ORDER OF EXECUTION: (P0) deploy /embed → (P1) WP plugin, ~1-2 dev days, submit and babysit review → (P2) @altftool/embed on npm+GitHub same week, ~0.5 day → (P3) Ghost forum post + Notion/Webflow "how to embed" tutorial pages, ~1 hour total.

### Targets

#### ❌ BLOCKER — altftool.com/embed is not live in production
- **URL:** https://altftool.com/embed
- **Status (2026-07-25):** dead
- **Priority:** P0 — prerequisite for every item below; deploy the embed hub before any submission (reviewers will test it)
- **Requirements:** Deploy via the AltFTool org Amplify pipeline. Verify /embed and /embed/widget/bmi-calculator load publicly before submitting anywhere.
- **Fit:** The 197-widget embed hub exists only in the local repo (altftoolweb/src/app/embed/); prod returns the 'AltFTool is preparing this route' 404 today. Tool pages like /tools/all/bmi-calculator (attribution-link target) ARE live, so only the /embed and /embed/widget/[slug] routes are missing.

#### ✅ WordPress.org Plugin Directory — submit 'AltFTool Widgets' plugin
- **URL:** https://wordpress.org/plugins/developers/add/
- **Status (2026-07-25):** verified-live
- **Priority:** P1 — best return in this channel: DA-90+ listing page, WP-admin search distribution across millions of sites, each install can place a followed attribution link
- **Requirements:** Free wordpress.org account with 2FA enabled; complete plugin as zip <10MB; must pass the Plugin Check tool first; readme.txt must disclose the external service (Guideline 6/7: what loads from altftool.com, privacy policy link); GPL-compatible license; slug is permanent once approved; official review 1-10 days (5 business days target, cannot be expedited — plan for weeks in practice). Effort: ~1-2 dev days + review wait.
- **Fit:** A tiny plugin (Gutenberg block + [altftool widget="slug"] shortcode) wrapping the existing iframe snippet from embedSnippet.js. Fits the 197 calculator/converter widgets exactly. Verified against current guidelines: front-end iframes of a SaaS are allowed (Guideline 6 'serviceware'); only admin-page iframes are banned (Guideline 8); pure-iframe embed means no banned external JS. CAVEAT: Guideline 10 requires the 'Widget by AltFTool' credit link to be OPT-IN (default hidden) — so listing-page links are rel='nofollow ugc' (verified in raw HTML of live plugin pages) and only opted-in installs yield followed backlinks. Value is distribution + brand + the share of users who enable credit.

#### ✅ npm package @altftool/embed (+ public GitHub repo)
- **URL:** https://www.npmjs.com/
- **Status (2026-07-25):** verified-live
- **Priority:** P2 — half-day effort; links are nofollow but it creates two permanent high-authority profile pages, dev distribution, and feeds the WP plugin story
- **Requirements:** Free npm + GitHub accounts (already have GitHub). No review process — instant publish. Keep GPL/AGPL deps out per project license policy (trivial: zero-dep). Effort: ~0.5 day.
- **Fit:** Publish the snippet builder (essentially embedSnippet.js: buildSnippet(baseUrl, slug, name)) plus a zero-dependency web-component/auto-height wrapper as MIT-licensed OSS. Verified link handling today: npm package pages mark homepage/README external links rel='nofollow' BUT leave github.com links followed; GitHub marks all README/sidebar external links rel='nofollow'. So no direct equity to altftool.com — value is distribution, brand queries, referral traffic, and 'unlinked mention' authority. Set package.json homepage to https://altftool.com/embed.

#### ✅ Ghost integrations directory
- **URL:** https://ghost.org/integrations/
- **Status (2026-07-25):** verified-live
- **Priority:** P3 — directory is CLOSED to submissions (confirmed in on-page FAQ + staff forum reply); only path is a community forum post
- **Requirements:** Free forum.ghost.org account; post in Integrations & API category showing the HTML-card paste flow.
- **Fit:** Ghost's directory says verbatim it is 'not open to submissions at this time'; staff direct developers to post on forum.ghost.org (thread verified live: https://forum.ghost.org/t/how-to-submit-an-integration/14818). A forum post ('Free embeddable calculators/converters for Ghost via HTML card') gets a forum backlink (likely nofollow) + demand signal that can earn curation later. 10 minutes' effort once /embed is live — worth doing, low expectations.

#### ✅ Notion integration gallery
- **URL:** https://developers.notion.com/docs/publishing-integrations-to-notions-integration-gallery
- **Status (2026-07-25):** verified-live
- **Priority:** SKIP — verified not a fit: gallery only accepts public OAuth API 'connections' with Any-workspace scope + security review; standalone iframe widgets don't qualify
- **Requirements:** n/a (would require building a full OAuth Notion API integration — days of work for a gallery page whose links don't justify it).
- **Fit:** No fit for iframe widgets. Note: AltFTool embeds already work in Notion organically — users paste the /embed/widget/[slug] URL and Notion's /embed block renders it. Action is a blog post/docs page ('How to embed free calculators in Notion') targeting that search intent, not a directory submission.

#### ✅ Webflow App Marketplace
- **URL:** https://developers.webflow.com/submit
- **Status (2026-07-25):** verified-live
- **Priority:** SKIP for now — requires a real reviewed App (2FA, demo access, marketplace review); disproportionate effort for a paste-an-embed use case
- **Requirements:** Webflow developer workspace, one developer account, 2FA, full app review with demo access.
- **Fit:** Webflow users can already paste the iframe via the native Embed element — no app needed. If revisited later, a lightweight Designer Extension that inserts widget embeds could qualify, but it is days of work vs. minutes for the same user outcome. Cheaper Webflow play: a 'Made in Webflow' cloneable page showcasing the widgets.

#### ⚠️ Chrome Web Store listings
- **URL:** https://chromewebstore.google.com/
- **Status (2026-07-25):** could-not-verify
- **Priority:** P3 — informational finding: CWS listing links do NOT pass equity; treat as referral/brand only. Could not find any live AltFTool extension on CWS today (searched 'altftool', site:chromewebstore.google.com) — the 'existing extensions' claim needs the owner to supply listing URLs
- **Requirements:** Google developer account ($5 one-time), listing review typically <1-3 days for simple extensions.
- **Fit:** Verified in raw listing HTML (uBlock Origin page): developer-supplied links on CWS listings carry rel='ugc nofollow', and the Website/homepage buttons are client-rendered with the same treatment — zero link equity. Value of CWS: distribution + branded search + a verified-publisher 'offered by' line. Action if/when extensions exist: verify publisher domain as altftool.com, put https://altftool.com/embed in the listing's website + support fields, and mention the embed hub in the description.

### Ready-to-paste content

```text
=== 1. WordPress plugin readme.txt (submission-ready draft, passes Guidelines 6/7/10 disclosure) ===

=== AltFTool Widgets – Free Calculators & Converters ===
Contributors: altftool
Tags: calculator, converter, widget, embed, bmi calculator
Requires at least: 6.0
Tested up to: 6.9
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed 190+ free calculators and converters (BMI, loan, percentage, unit, currency and more) with one block or shortcode. No API keys, no signup.

== Description ==
AltFTool Widgets lets you drop any of 190+ free, privacy-first calculators and converters into posts and pages.

* Gutenberg block with a searchable widget picker
* Shortcode: [altftool widget="bmi-calculator" height="640"]
* Responsive iframe, lazy-loaded, zero JavaScript added to your site
* No account, no API key, 100% free for personal and commercial sites

= External service disclosure =
This plugin embeds widgets served from AltFTool (https://altftool.com) inside an iframe. The widget iframe is loaded from altftool.com when a visitor views a page containing the block/shortcode. Calculations run client-side in the visitor's browser; no form data is sent to AltFTool servers. Terms: https://altftool.com/terms — Privacy: https://altftool.com/privacy

= Attribution =
A small "Widget by AltFTool" credit link below the widget is OPTIONAL and OFF by default. You can enable it per-widget in the block settings if you'd like to credit the source.

== Frequently Asked Questions ==
= Is it really free? =
Yes. All widgets are free, with no signup and no usage limits.
= Does it slow my site down? =
No. The widget is a single lazy-loaded iframe; nothing else is added to your pages.

== Screenshots ==
1. Widget picker block in the editor
2. BMI calculator embedded in a post

== Changelog ==
= 1.0.0 =
* Initial release: 190+ embeddable calculators and converters.

--- Shortcode render (PHP) must output exactly the snippet from embedSnippet.js, with the credit <p> wrapped in the opt-in check:
<iframe src="https://altftool.com/embed/widget/{slug}" title="{Name} — free AltFTool widget" width="100%" height="640" style="border:0;border-radius:12px;overflow:hidden" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
<?php if ( $show_credit ) : ?><p style="font-size:12px;margin:4px 0 0">Widget by <a href="https://altftool.com/tools/all/{slug}?utm_source=embed&utm_medium=wordpress">AltFTool — free online tools</a></p><?php endif; ?>

Submit at: https://wordpress.org/plugins/developers/add/ (enable 2FA first, run Plugin Check, zip <10MB)

=== 2. npm/GitHub package — package.json fields + README opener ===

package.json:
{
  "name": "@altftool/embed",
  "version": "1.0.0",
  "description": "Zero-dependency embed snippets for 190+ free AltFTool calculators and converters. No API key, no signup.",
  "homepage": "https://altftool.com/embed",
  "repository": { "type": "git", "url": "https://github.com/altftool/embed" },
  "keywords": ["embed", "widget", "calculator", "converter", "iframe", "free"],
  "license": "MIT"
}

README.md opener:
# @altftool/embed
Embed any of [190+ free calculators and converters](https://altftool.com/embed) — BMI, loan, percentage, unit, currency and more — in one line. Privacy-first: everything runs client-side, files and inputs never leave the browser. No API key. No signup.

'''js
import { buildSnippet } from "@altftool/embed";
document.querySelector("#widget").innerHTML =
  buildSnippet("https://altftool.com", "bmi-calculator", "BMI Calculator");
'''

Or plain HTML — no package needed:
'''html
<iframe src="https://altftool.com/embed/widget/bmi-calculator"
  title="BMI Calculator — free AltFTool widget"
  width="100%" height="640" style="border:0;border-radius:12px"
  loading="lazy"></iframe>
'''
Browse all widgets: https://altftool.com/embed · All 1,100+ tools: https://altftool.com/tools

=== 3. Ghost forum post (forum.ghost.org, Integrations & API category) ===

Title: 190+ free embeddable calculators & converters for Ghost (HTML card, no signup)

Body:
Hi all — we made the calculators and converters on AltFTool embeddable, and they work nicely in Ghost via the HTML card. Thought some publishers here might find them useful (finance blogs, health newsletters, etc.).

How it works: open https://altftool.com/embed, pick a widget (BMI, loan, percentage, currency, unit converters…), copy the iframe snippet, and paste it into an HTML card in the Ghost editor. Example:

<iframe src="https://altftool.com/embed/widget/bmi-calculator" title="BMI Calculator" width="100%" height="640" style="border:0;border-radius:12px" loading="lazy"></iframe>

Everything is free, no account or API key, and the widgets run entirely client-side (nothing your readers type is sent to our servers). Feedback very welcome — happy to add widgets people need.

=== 4. Chrome Web Store listing fields (when extensions are published/located) ===
Website field: https://altftool.com/embed
Support URL: https://altftool.com/contact
Description last line: "By AltFTool — 1,100+ free browser tools and 190+ embeddable widgets at altftool.com. No signup, privacy-first."
```

---

## Tracking

- **Google Search Console** → Links report: the ground truth for what actually
  got indexed as a backlink.
- **Ahrefs Webmaster Tools** (free for verified domains): referring domains over
  time, plus competitor gap analysis.
- Append `?ref=<directory>` or UTM parameters to submitted URLs so referral
  traffic is attributable per channel.
- Realistic expectation: 30–50 quality referring domains in the first three
  months from the free channels alone, if the outreach cadence is kept up.
