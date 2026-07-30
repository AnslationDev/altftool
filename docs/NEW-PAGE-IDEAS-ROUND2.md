# New Page Ideas — round 2 (expansion)

Generated 2026-07-29 by a 25-agent workflow: 6 fresh lenses (life-event,
am-i-being-cheated, exam-ecosystem, freelancer-ops, health-numeracy,
file-forensics), each adversarially scored. 61 ideas, 38 keep, 23 kill.

Round 1 lives in NEW-PAGE-IDEAS.md.

**Portfolio:** 61 ideas across 6 new lenses → **38 KEEP / 23 KILL** (62% survival, vs. round 1's much harsher rate). Round 1 keepers still in flight: 47 total, 23 built.

---

## 1. Ranked TOP 15

Ranked by traffic × uniqueness (demand × defensibility); build score used as tiebreak, not as a ranking input. Effort: **S** ≈ ≤1 day, **M** ≈ 2–4 days, **L** ≈ a week+.

| # | Title | What it does | Query it captures | T | U | B | Effort |
|---|---|---|---|---|---|---|---|
| 1 | **What Freezes When Someone Dies** (`death-account-freeze-sequencer`) | Classifies the deceased's accounts/mandates into FREEZES / STILL DEBITING / DO NOT CANCEL, keyed on holding type | "joint account after death of husband", "how to stop SIP after death" | 9 | 9 | 9 | S |
| 2 | **Failed Transaction Compensation Calculator** | RBI TAT table → rupee auto-compensation owed + escalation dates | "UPI failed money deducted", "ATM se paise nahi nikle" | 9 | 9 | 9 | S |
| 3 | **LMP Due Date vs Scan Due Date** (ACOG redating) | Applies CO-700 GA-band thresholds to decide which EDD governs | "scan due date different from LMP", "which due date is correct" | 9 | 9 | 9 | S |
| 4 | **Export of Services GST Checker** | Names which of the five s.2(6) conditions fails; LUT vs pay-and-refund; s.22 crossing month | "do I need GST as a freelancer with foreign clients" | 9 | 8 | 8 | M |
| 5 | **NTA Response Sheet vs Answer Key Diff** | Joins Chosen Option ID to Correct Option ID client-side; scores in seconds | "response sheet answer key match", "JEE score calculate" | 9 | 8 | 7 | M |
| 6 | **Form 10-IEA Regime Lock Planner** | Per-AY legality grid for the one-way door on business income + belated-filing trap | "can I switch back to old regime", "Form 10-IEA deadline" | 8 | 8 | 9 | S |
| 7 | **Haemoglobin Anaemia Cutoff Checker** | WHO thresholds by pregnancy/trimester, altitude & smoking adjustment, capillary-vs-venous offset | "hb 10.2 in pregnancy is it low", "normal hemoglobin for pregnant women" | 9 | 7 | 9 | S |
| 8 | **Excel Pivot Cache Leak Finder** | Recovers deleted source rows from pivotCache + surfaces connection strings and Power Query paths | "pivot table showing deleted data", workbook-leak incident response | 7 | 9 | 9 | S |
| 9 | **Life Policy Surrender Value Auditor** | Computes the GSV regulatory floor + paid-up sum assured; flags a quote sitting exactly on the floor | "LIC surrender value calculator", "surrender value kitna milega" | 9 | 7 | 7 | M |
| 10 | **Attempts-and-Age Ledger** | Projects forward to find which cap — age or attempts — actually ends the run, and in which year | "how many UPSC attempts left", "last attempt year" | 8 | 7 | 9 | S |
| 11 | **Shift Normalisation Back-Solver** | Inverts the SSC affine map from two same-shift (raw, normalised) pairs; break-even raw mark | "SSC normalisation my raw is higher but normalised lower" | 7 | 8 | 9 | S |
| 12 | **TDS Refund Lag Calculator** | Excess withheld under 44ADA vs 194J, per quarter + s.244A interest with the 10% gate | "when will I get my TDS refund", "194J vs 44ADA excess TDS" | 7 | 8 | 9 | S |
| 13 | **Flight Cancellation Refund Auditor** | Two-column reconciliation: what you paid by fare head vs what DGCA CAR lets them keep | "no show refund airline", "cancellation charges more than ticket" | 8 | 7 | 8 | M |
| 14 | **Child Growth Percentile: WHO vs IAP 2015** | Real LMS z-scoring, replacing a currently-shipped tool with fabricated coefficients | "baby weight percentile", "height for age chart India" | 8 | 7 | 7 | L |
| 15 | **Deceased ITR Two-Period Split** | Routes each income head by its own rule across date of death; two PANs, two due dates | "how to file ITR for a deceased person" | 7 | 8 | 7 | M |

**Near-misses, honestly:** `merit-migration-seat-allotment-simulator` (6/9/6), `pdf-made-with-decoder` (7/7/8), `semen-analysis-who-2021-centile` (7/7/9), `home-loan-rate-reset-auditor` (7/7/8) and `whatsapp-forwarded-photo-checker` (7/7/7) all landed within one point of the cut. The 15/16 boundary is not meaningful.

---

## 2. Remaining keepers by theme

**Death & family admin (3)**
- `death-certificate-delay-and-copies` (6/7/9) — which delay rung under the 2023 Amendment Act, what extra document it demands, how many copies to order. Gate page for the whole death cluster.
- `maintenance-arrears-limitation-tracker` (5/9/9) — month-by-month arrears ledger with each month's one-year warrant window; refuses to compute quantum.
- `epfo-death-claim-benefit-estimator` (6/6/8) — **rescope to `edli-death-benefit-calculator`**; EDLI only, hand off pension to the shipped `eps-pension-calculator`.

**Am I being cheated (4)**
- `home-loan-rate-reset-auditor` (7/7/8) — solves for implied remaining tenure from EMI + rate; catches silent elongation and negative amortisation.
- `rera-possession-delay-interest-calculator` (6/8/8) — per-instalment accrual under s.18(1), auditable line by line for a RERA filing.
- `lpg-cylinder-weight-shortfall-checker` (7/6/9) — neck-ring code decoder first, weight/tolerance check second; phone-first.
- `income-tax-refund-interest-244a-checker` (5/8/9) — the 10% gate as the headline; the received-interest-is-taxable trap as a first-class output.

**Exam ecosystem (2)**
- `reservation-roster-calculator` (5/8/8) — published 13-point/200-point tables, not a derived loop. Zero refresh liability forever.
- `merit-migration-seat-allotment-simulator` (6/9/6) — runs the actual allocation; needs the relaxation-availed flag or the headline result inverts.

**Freelancer ops (2)**
- `section-44ad-lock-in-planner` (6/8/9) — names the AYs lost under s.44AD(4); no rupee-pricing of the exit.
- `foreign-invoice-exchange-rate-router` (5/8/8) — reframe to "why does my GSTR-1 turnover not match my ITR turnover"; user-entered rates only.

**Health numeracy (5)**
- `lab-panel-false-flag-calculator` (4/9/10) — a property of the panel, never of the user; must never accept an analyte value.
- `semen-analysis-who-2021-centile` (7/7/9) — centile placement against fertile-men distribution; 2021 and 2010 limits side by side.
- `dexa-t-score-vs-z-score` (6/8/8) — **reduced form only**: applicability + cross-manufacturer comparability, no BMD→T computation.
- `egfr-equation-reconciler` (8/6/9) — sell as a discrepancy resolver (indexed vs absolute, unit mismatch), not a calculator; it loses to NKF as a calculator.
- `muac-z-score-calculator` (4/8/8) — free once the WHO LMS engine exists; strictly sequenced after it.

**File forensics (7)**
- `whatsapp-forwarded-photo-checker` (7/7/7) — collapse to one binary: not-a-camera-original vs intact camera signature.
- `exif-hidden-thumbnail-recovery` (5/9/9) — lead on "was this photo cropped?" (dimension mismatch fires on every file); thumbnail is the jackpot.
- `pdf-made-with-decoder` (7/7/8) — four-timestamp divergence grid + scan/OCR/born-digital; drop the fraud framing entirely.
- `pdf-revision-history-extractor` (4/8/7) — headline is the revision count so the single-revision majority still gets an answer.
- `xmp-edit-history-reader` (6/8/8) — DocumentID/OriginalDocumentID linkage is the hook, not photoshop detection.
- `office-cropped-image-recovery` (6/7/8) — srcRect crop-difference render + chart source workbook; refuse the generic-extractor framing.
- `video-file-origin-inspector` (6/7/8) — udta GPS + moov-before-mdat re-mux tell; never name a device from ftyp brand.

---

## 3. The three most defensible

**1. Failed Transaction Compensation Calculator — adversarial counterparty.**
The only entity with the facts and the authority to compute this is the bank that owes the money, and it has a direct financial interest in never building the page. The rule is a fixed, dated public circular (DPSS.CO.PD 629/02.01.014/2019-20) with no moving parts, so the page cannot decay. Output is a rupee entitlement plus a due date — the class of answer nobody will publish on your behalf.

**2. LMP vs Scan Redating — architectural exclusion in every incumbent.**
Every due-date calculator in the market, including this repo's own, takes LMP and stops; `pregnancy-due-date/pages/index.jsx` literally punts the question at line 529. Answering it requires accepting a second input (scan GA + scan date) that the entire category's data model has never had. A competitor cannot bolt this on without rebuilding their tool's premise. The ACOG CO-700 threshold table is static, and the answer is a named-rule application rather than a judgement.

**3. Excel Pivot Cache Leak Finder — the fact is invisible in the source application.**
The data is inside the file and Excel's own UI will never show it, so no content site can even demonstrate the problem, let alone answer it. The moat is working code (OOXML zip walk + pivotCache/connections parsing, on top of guards already proven in `hidden-revision-inspector`), not a curated list, so there is nothing to refresh and nothing a blog post can substitute for. Two distinct audiences arrive at it — confused pivot users and workbook-leak incident response.

*Runner-up with a different mechanism:* `death-account-freeze-sequencer` is defensible by **cluster position** — it is the hub every other death page links into, so its defensibility compounds with the rest of the cluster rather than standing alone.

---

## 4. Build next — 5, in order

Ordering is by traffic-per-build-day, adjusted for **seasonality**, which matters more here than raw score.

**1. `failed-transaction-compensation-calculator` (S)** — Best ratio in the entire portfolio: 9/9/9, one day, no dataset, no seasonality. The query runs at volume every day of the year and every current SERP result is a helpline number or an RBI PDF. Nothing about waiting improves it.

**2. `edd-lmp-vs-scan-redating` (S)** — Second-best ratio, also aseasonal, and it closes a gap the shipped `pregnancy-due-date` tool explicitly declines to answer, so the internal link is already earned. Pure date arithmetic plus a five-row table.

**3. `death-account-freeze-sequencer` (S)** — Build third not because it's weaker but because it is the cluster hub: shipping it first means `death-certificate-delay-and-copies` and the EDLI page have somewhere to point on day one. Panic-query intent, high share rate, zero refresh liability.

**4. `haemoglobin-anaemia-cutoff-checker` (S)** — Highest-volume health query in India, one-day build, and the repo already ships the classification posture (`asian-bmi-cutoff-calculator`, `blood-pressure-classification`). Ship with the 2011/2024 WHO vintage toggle from the start — retrofitting it later means being caught printing one vintage as "the" answer.

**5. `tds-refund-lag-calculator` + `income-tax-refund-interest-244a-checker` (S + S, built as a pair)** — Counted as one slot because they share the `roundDown100` and part-month helpers already written for `advance-tax-interest-234b-234c-calculator`, and both hinge on the same s.244A 10% gate. **They are in season right now**: refunds for AY 2026-27 land August–November, which is exactly when "why is my refund less/late" traffic peaks. Cross-link them as "interest you owe" / "interest owed to you".

**Explicitly do not build now:** `response-sheet-answer-key-diff`, despite ranking #5. Its entire traffic is a 3–5 day window after an NTA key release, and the next one is roughly January 2027. Queue it for a **November–December 2026 build** so the parser has time to be tested against last cycle's real sheets before the window opens. Building it in August wastes six months of decay on the most format-fragile item in the list.

Similarly, `export-of-services-gst-checker` and `form-10iea-regime-lock-planner` (both top-6) should follow immediately after slot 5 — they are filing-adjacent and want to be live and indexed well before the June–July 2027 peak.

---

## 5. What was killed, and the pattern

23 kills. They sort into six failure modes, in rough order of frequency:

**A. Empty arithmetic — the user supplies the rule (6).** `group-health-cover-gap-clock`, `newborn-cover-eligibility-date-checker`, `answer-key-challenge-breakeven`, `loan-penal-charge-auditor`, `final-dues-late-payment-clock` (partly), `pwbd-compensatory-time-planner`. The tool asks for the waiting period, the permitted charge, or the "rupee value per mark" and then adds or multiplies. A searcher who can type the rule has already answered their own question. `p* = fee / (marks swing × your rupee-value-per-mark)` is the purest specimen: it divides by a mood.

**B. Already shipped, discoverable only by reading code (6).** `epf-after-last-contribution-clock` (the s.192A continuous-service insight is live in `epf-rejection-reason-decoder`), `motor-claim-deduction-decoder` (`motor-insurance-idv-calculator/lib.js` already exports the full depreciation tables), `day-rate-vs-salary-india` (`freelance-rate-converter` ships the whole capacity model), `invoice-grossup-to-target-net` (`payment-gateway-fee-calculator` already exports `grossUpForNet`), `cuet-best-combination-optimiser` (`cbse-best-of-five-calculator` documents the exact mechanic in its header), `freelancer-benefits-replacement-calculator` (ten shipped calculators behind one form). Every one of these was proposed by someone who grepped slugs instead of opening files. **This is the single most repeated error in the round.**

**C. Un-refreshable dataset as the actual product (4).** `iim-composite-score-calculator` (20 IIMs × annual re-issue), `gate-score-marks-backsolver` (30 papers × 2 statistics × annual), `cuet-best-combination-optimiser` (hundreds of DU CSAS programme lists), `metadata-survival-by-platform` (9 platforms that change stripping behaviour silently, with no observable signal when they do). Failure mode is not "goes stale" but "is confidently wrong at exactly the moment accuracy matters".

**D. Model divergence read by the user as counterparty fraud (2).** `credit-card-finance-charge-auditor` and `upi-payment-screenshot-checker`. Both recompute something the issuer/platform does differently for benign reasons, then print the residual as an accusation. The UPI one is worse: WhatsApp re-encodes screenshots to JPEG on every honest forward, so its headline signal fires on most legitimate payments. A credibility bomb attached to the highest-traffic page in its set.

**E. Cannibalisation of a sibling keeper or a shipped page (3).** `gst-threshold-crossing-impact-calculator` (same s.22 test as the export checker — two pages splitting one query set on one site), plus B-overlaps above.

**F. Factually inverted (1) — the dangerous one.** `under-construction-flat-gst-auditor` claimed builders skip the one-third land deduction. The 1%/5% rates already have the abatement baked in (7.5% of two-thirds = 5% of full value). Shipped as specified, it would have manufactured a fake ~₹1 lakh grievance for every under-construction buyer in India and destroyed the site's credibility on the audit framing that seven other keepers depend on. This is the strongest argument for keeping the skeptic pass.

**The unifying predictor: who supplies the constant.** Every keeper takes its rule from a fixed, citable, public source and takes only facts from the user. Every kill in category A inverts that — the user supplies the rule and the tool supplies arithmetic. That test alone would have caught 6 of 23 kills before writing a line.

**Salvage worth scheduling:** ~15 of the 23 kills came back with a concrete "relocate this into an existing tool" instruction. That is a cheap enhancement backlog, not waste — notably the s.192A continuity reconstructor into `epf-rejection-reason-decoder`, an invoice-line mode on `motor-insurance-idv-calculator`, an India mode on `freelance-rate-converter`, and gratuity delay interest appended to `full-and-final-settlement-calculator`.

**Two live correctness bugs surfaced in passing, worth fixing regardless of what ships:**
- `ai-medical-report-analyzer` hardcodes `bun: {min: 7, max: 20}` and will band an Indian report's *Blood Urea* value (different analyte, ×2.14) against a *BUN* range.
- `baby-growth-percentile-calculator/spec.js` fabricates growth medians (`median = base + a*(a<6?0.7:0.35)`). The WHO/IAP keeper should **replace it in place**, not ship at a new slug beside it.

---

## 6. Ideas needing a data source

Most keepers need none — they take facts from the user and rules from a dated constant. The exceptions:

| Idea | Source | Free? | Refreshable? |
|---|---|---|---|
| `child-growth-percentile-who-vs-iap` | WHO 2006/2007 LMS tables | **Yes** — published free by WHO, several thousand static rows | **Not needed** — unchanged since 2006. Lazy-load per indicator. |
| same | IAP 2015 charts (Indian Pediatrics) | **Yes** to read | **No automated path** — must be hand-transcribed. Also static for a decade. This is the error-prone half; ship WHO first, IAP in pass two. |
| `muac-z-score-calculator` | WHO MUAC-for-age LMS | **Yes**, small | Static. Reuses the growth engine — do not reimplement. |
| `semen-analysis-who-2021-centile` | WHO 6th ed. reference limits | **Yes** — ~15 published numbers | Static. Ship 5th ed. alongside, since Indian labs still print it. |
| `haemoglobin-anaemia-cutoff-checker` | WHO 2011 + 2024 thresholds | **Yes** | **This is the one live refresh event in the set.** The 2024 revision moved pregnancy cutoffs. Ship both as a user-visible toggle — that converts the liability into a feature. |
| `life-policy-surrender-value-auditor` | IRDAI GSV percentage table | **Yes**, static per regime | The **SSV basis is insurer-specific and not obtainable** — which is precisely why it must stay a qualitative flag, never a computed entitlement. |
| `edli-death-benefit-calculator` | EPFO statutory floor/ceiling | **Yes** (gazette) | Moves by notification, roughly annual. Print constants on screen with a `RULES_READ_ON` date, as `epf-rejection-reason-decoder` already does. |
| `exam-attempts-age-ledger` | Per-exam caps (UPSC/SSC/state notifications) | **Yes** | ~6 editable constants, one edit a year. Acceptable. |
| `reservation-roster-calculator` | DoPT 13-point / 200-point tables | **Yes** | **Zero refresh liability** — unchanged since EWS in 2019. Best data profile in the portfolio. |
| `failed-transaction-compensation` | RBI DPSS TAT circular | **Yes** | Fixed since 2019. |
| `rera-possession-delay-interest` | SBI MCLR + 2% (state-prescribed) | Published free | **Deliberately not ingested** — take as a labelled user input with an as-of date. A hardcoded MCLR is a rotting dependency and state formulas differ. |
| `death-certificate-delay-and-copies` | State late-fee schedules | Varies | **Deliberately not ingested** — user input with defaults. Fee is state rule, not central Act. |

**Two hidden datasets inside keepers, both non-refreshable and both correctly demoted:** the DQT quantisation-table fingerprints in `whatsapp-forwarded-photo-checker` and the ftyp brand→device map in `video-file-origin-inspector`. Neither has an authoritative source and both drift silently as apps update. They must ship as collapsed supporting evidence with a reviewed-on date, never as the headline verdict. If either ever becomes the page's main claim, it turns into `metadata-survival-by-platform`, which was killed for exactly this.

---

## 7. Per-lens verdict

| Lens | Ideas | Keep | Top-15 | Median traffic (keepers) | Verdict |
|---|---|---|---|---|---|
| **health-numeracy** | 10 | 8 (80%) | 3 | 7 | **Best new lens** |
| **am-i-being-cheated** | 12 | 7 (58%) | 3 | 7 | **Highest-value lens** |
| **file-forensics** | 10 | 8 (80%) | 1 | 6.5 | Paid in moat, not in volume |
| **life-event** | 9 | 5 (56%) | 2 | 6 | Paid narrowly |
| **exam-ecosystem** | 11 | 5 (45%) | 3 | 7 | Mixed — one great idea, long dataset trap |
| **freelancer-ops** | 10 | 5 (50%) | 2 | 7 | **The dud** |

**health-numeracy — paid, and it is the lens to run again.** Highest keep rate, three top-15 entries including the #3 idea overall, and the cheapest builds in the portfolio (five keepers at build 8+). Its structural advantage is that guideline thresholds are fixed, published, and free, while the incumbent consumer pages give advice instead of classification. Honest deduction: two keepers (`lab-panel-false-flag` T4, `muac` T4) are charity keeps carried on uniqueness and near-zero marginal build cost, so the effective yield is 6 real ideas, not 8.

**am-i-being-cheated — paid, and it produced the strongest single idea.** Highest average traffic of any lens (four keepers at T8+). The lens works because it systematically points at rules where the counterparty owes money and therefore will never publish the calculator. It also produced the most dangerous kill in the round — the inverted GST claim — which is a feature of the lens, not a bug: an audit framing that gets a rate backwards is worse than no page, and only a verification pass catches it.

**file-forensics — paid in defensibility, underpaid in traffic.** 80% keep rate and the highest uniqueness scores anywhere (three 9s, four 8s), but the traffic ceiling is 7 and the median is 6. Only `excel-pivot-cache-leak-finder` reached the top 15. Treat this as a **moat lens, not a traffic lens**: build its keepers when there's slack, for links and credibility, not when chasing volume. Its one genuinely high-traffic idea (`upi-payment-screenshot-checker`, T8) was also its most broken.

**life-event — paid, but the lens is really "death admin".** All five keepers plus the 9/9/9 hub come from the death sub-cluster, which is coherent, mutually-linking and genuinely unserved. The other sub-clusters went 0-for-4: birth/newborn, group-health exit, final dues and PF-after-exit all died, three of them to empty arithmetic. Rename the lens to what actually worked and mine it again there; do not re-run the general "life event" frame.

**exam-ecosystem — mixed, and the weakest keep rate at 45%.** It produced `response-sheet-answer-key-diff`, a genuine top-5 idea, plus two solid S-effort keepers. But six kills, four of them to the same cause: in this domain, everything with real traffic (IIM calls, CUET combinations, GATE marks) is a per-institution dataset re-issued annually, and everything without a dataset is a commodity. The keeper tail is thin — `reservation-roster` at T5 and `merit-migration` at T6 are permanence and novelty plays, not traffic. Worth one more pass, but only aimed at *inversions of published formulas* (the shift back-solver shape), which is the pattern that actually worked.

**freelancer-ops — the dud, and for a structural reason.** Not because the ideas were bad but because **the lens was pointed at ground the site already occupies**. Of five kills, three were near-duplicates of already-shipped tools (`freelance-rate-converter`, `payment-gateway-fee-calculator`'s `grossUpForNet`, ten assembled benefit calculators) and one cannibalised a sibling keeper in the same batch. That is not bad luck — it means round 1 and the existing 2,827-tool inventory have already harvested this audience, and further passes will keep colliding with it. The two genuinely strong survivors (`export-of-services-gst-checker`, `form-10iea-regime-lock-planner`) both work for the same reason: they encode a *statutory eligibility test* nobody has, rather than a calculation the site already ships. Retire the lens; keep the pattern.