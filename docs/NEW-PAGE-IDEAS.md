# New Page Ideas — traffic research

Generated 2026-07-28 by a 19-agent research workflow (7 ideation lenses, each
adversarially scored by a skeptic defaulting to KILL). 77 ideas, 47 keep, 30 kill.

**77 ideas scored across 7 lenses. 47 KEEP, 30 KILL.**

Ranking rule for the table below: composite = traffic + uniqueness + build. Ties broken by (a) does the hard engineering already exist in the repo, (b) does the page need a recurring data refresh, (c) is the intent commercial. Effort: **S** ≤2 days, **M** ~1 week, **L** 2+ weeks or needs a named maintenance owner.

---

## 1. TOP 12

| # | Idea | What it is | Query it captures | T | U | B | Effort |
|---|---|---|---|---|---|---|---|
| 1 | **/exam-photo/[exam]** | Per-exam photo + signature spec page with a resizer that hits the exact KB range | `ssc cgl photo size 20kb` | 9 | 7 | 9 | M |
| 2 | **Electricity Bill Spike Explainer** | Two months' units in → slab creep vs fixed charges vs real extra usage, in rupees | `why is my electricity bill so high` | 9 | 6 | 10 | S |
| 3 | **EPF Rejection Reason Decoder** | Decodes each EPFO portal rejection string into who has to fix it (you / ex-employer / field office) | `pf claim rejected name not matching`, `form 19 vs 10c` | 9 | 8 | 8 | M |
| 4 | **Is [planet] in retrograde right now** | Computed station dates + pre/post-shadow windows from the ephemeris, correct forever | `is mercury in retrograde right now` | 9 | 8 | 9 | S |
| 5 | **AQI Today (hub + ~25 cities)** | Live CPCB-formula AQI, worst-first national leaderboard | `delhi aqi today`, `worst air quality city india` | 9 | 8 | 7 | M |
| 6 | **India Import Duty engine** ⚑ | Landed cost for personal imports: baggage vs courier, gold sub-mode, + the "buy abroad vs India" gadget framing | `customs duty on iphone from usa to india`, `iphone price in dubai vs india` | 8 | 8 | 8 | M |
| 7 | **Critical Value Tables** | t/z/χ²/F tables with unbounded df, plus statistic→exact-p in one box | `t table`, `chi square table` | 9 | 6 | 9 | S |
| 8 | **Resignation Date Optimizer** | Ranks your three best last-working-days by rupee delta across gratuity, notice, bonus clawback, leave encashment | `gratuity 4 years 240 days` | 8 | 7 | 9 | M |
| 9 | **Super Built-Up Loading Decoder** | Restates two projects on a common carpet-area basis; real per-sqft price | `carpet area vs super built up` | 8 | 7 | 9 | S |
| 10 | **Room-Rent Proportionate Deduction** | What the insurer actually subtracts when you exceed the room cap; reverse mode for required sum insured | `proportionate deduction health insurance` | 6 | 9 | 9 | S |
| 11 | **Section 89(1) / Form 10E Calculator** | Recomputes tax across ~10 past FYs at each year's own slabs; outputs Annexure I fields | `form 10e calculator arrears` | 7 | 9 | 7 | L |
| 12 | **Tracking Link Decoder** | Pastes a URL, names what each parameter reveals, returns the stripped link | `what is gclid`, `remove tracking parameters from url` | 7 | 7 | 9 | S |

⚑ **Row 6 merges two separately-pitched ideas** (`india-customs-duty-calculator` and `abroad-gadget-landed-cost-calculator`). Two lenses independently proposed the same duty engine behind two framings. Build **one** duty/allowance module, ship two landing surfaces off it. Do not let these become two slugs with two copies of the tariff table — that is exactly how the repo got to 44 near-dupe clusters.

**Just below the line** (any of these could displace #12 depending on audience priority): EOL / Software Support Status Index (8/7/7, global, best repeat cadence in the crop), Git Error Message Decoder (8/6/6), MSME 45-Day Rule (6/8/9), MCA/ROC Filing Calendar (6/8/9), Repo-Rate Reset Calculator (6/8/9), India Income Percentile (7/8/8).

---

## 2. The other 35 keepers, by theme

**Indian statutory tools with a deadline or penalty clock** — narrow audiences, high intent, hard seasonal spikes, all cheap and stable.
- **MSME 45-Day / 43B(h) Calculator** (6/8/9) — combined rupee cost of pushing one invoice past 31 March; needs an entity-type selector, not slabs.
- **MCA/ROC Filing Calendar** (6/8/9) — derives first-AGM date from incorporation date; per-form penalty rules, not one Rs 100/day counter.
- **ITR-U Cost Calculator** (6/7/8) — ship it as an eligibility gate first; "you cannot file ITR-U for this" is the honest headline answer.
- **Maternity Benefit Entitlement** (6/7/9) — lead with the negative: the date you *will* meet the 80-day condition.
- **LRS/TCS Remittance Planner** (7/5/8) — education and medical only; cross-link `tcs-tour-package-calculator`, do not restate it.

**Salaried-India decision engines** — the deepest vein, but each one must drop its recommendation and ship as computation.
- **UPS vs NPS** (6/9/7) — drop OPS; output the NPS return required to match UPS, plus bequest value.
- **VPF vs PPF vs NPS post-tax matrix** (7/7/8) — drop the index fund; the 2.5L interest-taxability threshold is the citable output.
- **Repo-Rate Reset Calculator** (6/8/9) — reframed from fixed-vs-floating; spikes six times a year at RBI policy.
- **Effective APR Comparator** (7/6/9) — user pastes quoted terms; the repayment-horizon field produces the foreclosure-penalty inversion.
- **Relocation Salary Equivalence** (7/6/8) — hero fact: Bangalore/Hyderabad/Pune are *not* HRA metros.
- **ESOP/RSU Tax Calculator** (6/8/7) — drop "exercise now vs wait"; output the cash shortfall on exercise day.
- **Top-up vs Super Top-up Deductible Simulator** (4/8/9) — fix the aggregate-vs-per-claim example first; it is backwards as pitched.
- **Personal Inflation Rate** (6/7/8) — sell it as the appraisal answer; never as "CPI is wrong".
- **India Income Percentile** (7/8/8) — one series, one year, named; individual-vs-household toggle is the hero.
- **Where Your Tax Rupee Goes** (5/7/9) — the annual tax summary India never sends; non-hypothecation caveat inline.

**Live indexes (non-India, server-fetched, professional audience)** — best repeat-visit cadence in the whole crop, weakest absolute volume.
- **EOL / Support Status** (8/7/7) — 40-60 products, version-input box as hero, paste-your-package.json mode.
- **CISA KEV / Actively Exploited** (7/7/8) — paste-your-stack intersection; vendors with 10+ entries only.
- **Clock Changes** (6/7/9) — entirely a transform over `moment-timezone` already in node_modules; zero upkeep.
- **Sky Tonight** (7/6/6) — weakest keep; 20-25 cities max, lead with "what is that bright star".
- **Space Weather** (5/6/8) — kept on cost only; reframe to HF radio and GPS error, not aurora.

**Developer reference pages that terminate in a working tool** — all mid-traffic, all fighting incumbents; win the debugging tail, never the tutorial head.
- **/file/[ext]** (7/7/8) — gate generation on `toolMetaMap` having a matching converter; ~200 pages, self-growing.
- **Git Error Decoder** (8/6/6) — 15-20 entries done properly; blast-radius badge is the whole differentiator.
- **SQL JOIN fan-out debugger** (7/6/9) — target "my SUM is too high", not "sql joins explained".
- **ANSI Escape Reference** (7/6/8) — the paste-a-mangled-CI-log decoder is the landing state.
- **String Length / Encoding Inspector** (6/7/9) — never use the word "counter"; it would cannibalize `word-character-counter`.
- **Lighthouse Score Calculator** (6/6/9) — lead with the reverse solver; stamp the Lighthouse major version visibly.
- **CSS Specificity Referee** (6/7/7) — two-selector "which wins and what flips it", plus DevTools paste.
- **CSS linear() / spring generator** (7/5/9) — abandon the bezier editor; cubic-bezier.com has owned that term for a decade.

**Declarative reference tables (GEO / answer-engine plays)** — cheap, but each lives or dies on one differentiating column.
- **Exam Age & Attempt Limits** (9/6/5) — 5 exams, not 25; headline the reference date (UPSC measures age as on 1 August).
- **ICMR Micronutrient RDA** (6/7/6) — thesis is *why* India's iron RDA is 29mg vs the US 18mg; carry a US-DRI column.
- **Password Policy Standards** (6/7/6) — NIST 800-63B vs PCI DSS 4.0 only; drop the policy generator.
- **HbA1c Reference** (7/5/8) — invert it: the interference table (anaemia, HbE/HbD, CKD) is the product.

**Data clusters that must not ship without a named owner**
- **/electricity-tariff/[discom]** (6/8/7) — domestic category, ~25 DISCOMs. This is the cluster that makes 12 shipped tools finally work. Do not start it unless someone owns the April refresh.
- **/hsn/[code]** (9/4/5) — four-digit headings only (~1,340), positioned as an *importer's* tariff page. Highest traffic of any keeper and the weakest moat; treat as a considered gamble, not a safe bet.

---

## 3. The three most defensible ideas

These are the only keepers scoring **9 on uniqueness**. All three are defensible for the same structural reason: *the party best placed to build them has an active incentive not to.*

1. **Room-Rent Proportionate Deduction (6/9/9).** It prices an insurer's worst clause. Insurers and aggregators — who between them own every ranking page on health insurance — will never publish a tool that shows a customer paying Rs 1.4L out of pocket on a Rs 5L cover. There is no conflict-free incumbent. And it is pure arithmetic on user-supplied policy terms, so nothing goes stale. Cheapest moat in the set.

2. **Section 89(1) / Form 10E (7/9/7).** The moat is a real engineering barrier, not a positioning claim: it needs tax recomputed across ~10 past financial years at each year's own slabs, regime forks, 87A thresholds, surcharge bands and cess rates. That is precisely why the entire competitive field ships downloadable Excel files instead of web tools. The audience (government/PSU staff receiving pay-commission and DA arrears) already has a proven cohort on this site via `government-hra-calculator`.

3. **UPS vs NPS (6/9/7).** Verified genuinely empty — five pension tools on site, each computing one scheme in isolation, and zero UPS coverage anywhere. It requires a UPS accrual model and an NPS decumulation model in the same page, which is why nobody has built it. Traffic is decaying from its election-window peak, so this is a moat with a shelf life: worth building, not worth delaying.

---

## 4. Start here — first three, in order

**Build order optimises for fastest evidence of real traffic, not for interest.**

**1. Electricity Bill Spike Explainer (S — one day).**
Traffic 9, build 10, and the state tariff data is *already shipped* in `household-electricity-bill/lib.js` for 10 states. One page, two inputs, import the existing `STATE_TARIFFS` module. Monthly recurrence, mass-market, non-seasonal. This is the single highest ratio of demand to effort in all 77 ideas and it proves the repo's most valuable pattern — reversing a calculator that already exists — before you spend a week on anything.

**2. /exam-photo/[exam], first 12 exams only (M — one week).**
`join-photo-and-signature/components/Main.jsx` already contains the preset map and a working `compressToTargetKB()` binary search. The engineering is done; you are building landing pages and a spec corpus. Intent quality is the best available anywhere on the site — the searcher is standing at an upload gate that just rejected their file, so the query and the conversion are the same action. Generate every page from the same preset table the tool consumes, so spec and tool cannot drift. Ship 12, measure, then extend to 40.

**3. EPF Rejection Reason Decoder (M — one week).**
Traffic 9, zero data dependency, zero maintenance, ~20 deep-linkable long-tail entry points from one page. No API, no annual refresh, no licence question. It is the highest-traffic idea in the set that carries no ongoing liability whatsoever, and it opens the India-compliance vein that six other keepers sit in.

**Then, and this is a scheduling constraint, not a preference:** start **AQI Today in August**. It must be live before October or you lose the entire Oct–Feb season and wait a year. Slot **Retrograde** and **Critical Value Tables** in as filler weeks — both are S-effort, both never go stale, both are pure computation with no maintenance owner required.

**Seasonality to plan against:** AQI Oct–Feb (build Aug). Exam photo + age limits track SSC/IBPS/UPSC notification cycles. Section 89 / ITR-U peak Jun–Jul. Resignation optimizer and the VPF/PPF/NPS matrix peak Jan–Mar. Where-Your-Tax-Rupee is a one-day Feb 1 spike. Import duty spikes each Diwali and after each Budget.

---

## 5. What got killed, and the filter you should internalise

30 kills. Four patterns account for nearly all of them, and the first one should genuinely worry you.

**Pattern 1 — Overlap claims verified by substring-scanning slugs instead of reading code. 12 of 30 kills.**
This is the most expensive error in the process, because each one was a proposal to rebuild something that already ships. `earthquakes` missed `quake-near-me` (273-line lib.js reading the same USGS feeds). `market-open` missed `global-market-session-clock` (473 lines whose own header documents all three claimed differentiators). `bank-open-today` missed `indian-holiday-finder`'s `getSecondAndFourthSaturdays()`. `inr-rate` missed that `currency-converter` already fetches a live rate API. `credit-card-annual-fee-breakeven` missed that `reward-points-value-calculator` already implements every single claimed feature including cap truncation and break-even spend. Also: `byte-unit` vs `byte-converter`, `will-it-show-in-my-ais` vs `cash-deposit-reporting-checker`, `health-metrics-percentile` vs `asian-bmi-cutoff-calculator`, `/food/` vs `recipe-nutrition-estimator/data.js`, `/rto/` vs `vehicle-registration-decoder-india`, `tls-cipher-decoder` vs `tls-configuration-auditor`.
**Rule: grep by capability, then open the lib.js. A clean slug grep proves nothing.**

**Pattern 2 — High traffic does not rescue zero uniqueness.**
`/pincode/` scored 8 on traffic, `/ifsc/` 8, `bank-open-today` 8, `/food/` 8, `paper-size` 9, `earthquakes` 9, `hospital-bill-vs-cghs` 8, `masters-abroad` 8. All killed. **27 of the 30 kills scored ≤5 on uniqueness.** The three exceptions (`hospital-bill-vs-cghs` 8, `india-mobile-band` 8, `aria-role-matrix` 6) died instead on buildability — 2, 2 and 4 respectively. So the filter is almost perfectly clean: **uniqueness ≤5 or build ≤4 kills the idea regardless of traffic.** Traffic never saved anything.

**Pattern 3 — Noun-swap page clusters.**
19,300 PIN codes from one CSV. 22,000 IFSC pages from an MIT-licensed dataset everyone mirrors. 1,140 traffic-fine cells where most would fall back to the same central default. 5,800 airport pages whose differentiator is a runway count. 36 state health pages differing by one prevalence number. 70 pollution city pages with one PM2.5 value changed. Note also that the sitemap infrastructure does not exist for this — `generateSitemaps` returns nothing in `src`, and `src/app/sitemap.js` is already a 966-line monolith.
This pattern also shows up *inside* the survivors: **17 of the 47 keepers were kept only after cutting the cluster** (AQI 50→25, EOL 300→50, KEV 120→25, sky-tonight 141→25, exam-photo 250→40, /file/ 1200→200, HSN 6600→1340, tracking-link 60→12, git-error 60→18, income-percentile 36→1, super-builtup 20→1). **Default rule: build page one, prove it ranks, then multiply. Never multiply first.**

**Pattern 4 — Data you cannot source at the claimed grain, or that expires faster than you will refresh it.**
Minimum wage (state × skill class × zone × scheduled employment, re-notified twice a year). Traffic fines (scattered gazette notifications, many in regional languages). India mobile bands (per-circle deployment is only available by scraping CellMapper; handset bands only by scraping GSMArena). Mutual fund NAVs (stale NAV is worse than no NAV). CGHS rates (revised by office memoranda with no signal). On a site whose entire stated differentiator is dated accuracy, 30 silently stale pages destroy the thing they exist to demonstrate.

**The fifth, smaller pattern worth naming: advice wearing a calculator costume.** `ais-mismatch-reconciler` issuing remedial tax instructions. `business-structure-comparator` outputting "LLP nets you more" to someone who will raise a round. `air-pollution-life-expectancy` converting a population-level association into "you would get 3.1 years back by moving to Bengaluru". `hospital-bill-vs-cghs` telling a family mid-admission they are paying 6x fair rate. This same defect appears as a *correction* in a dozen surviving ideas — the fix is always the same: compute and stop, never recommend.

**Honest lens-level read:** the **programmatic lens is the weakest crop** — 4 keeps from 11, and one of those (`/hsn/`) survives on demand alone with uniqueness 4 and a permanent money-relevant accuracy liability. **geo-answer is half-killed** and its survivors are all small. **dev-reference** produced 7 keeps but nothing above traffic 8, and every one of them fights an entrenched free incumbent — that lens buys you credibility and internal links, not volume. The two lenses that actually paid were **contrarian** (8/12) and **india-compliance** (8/11), and it is not a coincidence: both work by reframing a question the repo can already half-answer, rather than by finding empty space.

---

## 6. Data sources — and whether they are genuinely free

**Genuinely free, keyless, no licence question:**
- **Open-Meteo Air Quality** (AQI Today) — free, keyless, CORS-enabled, returns exactly the six pollutants the CPCB formula consumes. *But:* `geoLocations.js` carries no coordinates (rows are slug/name/containedIn/wikiPath/QID), so 25 lat/lon pairs must be added and verified by hand. Prefer cities with a real CPCB CAAQS station and state provenance per city.
- **CISA KEV JSON + OSV.dev** (Actively Exploited) — free, keyless, US-government public domain. Server-side fetch inside ISR sidesteps CORS.
- **NOAA SWPC** (Space Weather) — free, keyless, public domain.
- **IANA tz database via `moment-timezone` ^0.6.0** (Clock Changes) — already in node_modules; the entire dataset is a transform over `untils`/`offsets`. Self-updates on dependency bump. Best source situation in the crop.
- **`astronomy-engine` ^2.1.19** (Retrograde, Sky Tonight) — MIT, already installed, zero network, statically generatable.
- **Lighthouse weights and log-normal control points** — Apache-2.0 source. Free, but version-stamp them visibly; they have shifted across majors.
- **Critical value tables** — mathematical constants, no source, never stale. Routines already exist in `confidence-interval-calculator/spec.js` and `sample-size-power-calculator/spec.js`.

**Free but with a real caveat:**
- **endoflife.date** (EOL index) — free to query, but **dataset licence terms must be cleared before anything is vendored**. Design for fetch-and-attribute at runtime, treat that as a hard constraint. The forward-projection layer (Node even-majors/30 months, PEP 602, Ubuntu LTS 5yr, PHP 2+1) is yours and is the actual moat.
- **Celestrak TLEs** (Sky Tonight ISS) — free, but rate-limited and terms-bound; needs a refresh path. `iss-pass-finder`'s propagator is reusable.
- **PCI DSS 4.0** (Password Policy) — free to download from PCI SSC, but redistribution of the document is restricted. Cite clauses, do not reproduce tables. NIST 800-63B is US-government public domain and unrestricted.
- **WID.world / PLFS** (India Income Percentile) — both free. **They are not interchangeable:** WID measures pre-tax national income per adult including imputed capital income; PLFS measures earnings of the employed. Interpolating one curve across both produces a confidently wrong number. Pick one, name it on the page, state the year.
- **MoSPI CPI item weights** (Personal Inflation) — free, but quarterly refresh is a standing cost, not a free crawl signal.

**Free data, but the real cost is manual extraction and a recurring refresh — do not start these without a named owner:**
- **State SERC tariff orders** (/electricity-tariff/) — 200-page PDFs nobody parses. ~25 orders refresh each April. Bounded annual work, but unowned it becomes a wrong rupee figure on someone's bill dispute. Render the tariff order number and effective-from date in the page body.
- **CBIC customs tariff + Baggage Rules 2016** (Import Duty) — free and static in a `data.js` the shape of `stamp-duty-estimator/data.js`; updates on the Budget cycle. Item classification, not arithmetic, is the accuracy risk — show the assumed HSN chapter so a wrong answer is traceable.
- **CBIC GST rate notifications** (/hsn/) — free, but the Sept 2025 rationalisation means 1,340 pages of rate data carry a permanent money-relevant liability. Requires a visible "rates as amended to <date>" line.
- **Historical Finance Act slabs, ~10 FYs** (Section 89) — free public data, but this is a per-FY tax engine with regime forks, shifting 87A thresholds and surcharge bands, and it must be properly tested. Show the per-year recomputation as a visible table so a user can sanity-check the year that looks wrong.
- **Exam notification PDFs — SSC, IBPS, UPSC, NTA, RRB** (/exam-photo/, Exam Age Limits) — free, but cycle-bound and manual. Stamp every row with the notification date it was read from, so a stale row degrades to a dated fact rather than a wrong one.
- **ICMR-NIN 2020 RDA** (Micronutrient Reference) — free PDF, exists almost nowhere as queryable HTML, which is the whole opportunity. An 18-nutrient × 15-group transcription with zero errors is the entire cost.
- **Budget at a Glance / Expenditure Budget** (Tax Rupee) — free, annual, ~20 heads. Build it so the annual swap is a one-file edit.

**No external source needed at all** — Room-Rent, Resignation Optimizer, Super Built-Up, EPF Decoder, MSME, MCA/ROC, ITR-U, Maternity, UPS vs NPS, all seven dev-reference keepers, Tracking Link Decoder, Top-up Simulator, Effective APR. All inputs are user-supplied or statutory-stable. **These are where the portfolio's durable margin is** — they cost nothing to keep alive, and 14 of the 47 keepers fall in this bucket. Weight toward them when in doubt.