const seo = {
  title: "UPS vs NPS: Break-Even Return and Lump Sum",
  metaDescription:
    "Solve for the annual NPS return at which the annuity equals the UPS assured payout of 50% of last-12-month average basic pay, plus Dearness Relief.",
  steps: [
    "Under \"Your pay and service\", enter your current monthly basic pay, the Dearness Allowance now as a % of basic, years left to superannuation and total qualifying service.",
    "Set the \"NPS assumptions\": corpus already accumulated, the 10% employee and 14% government contribution rates, the share of corpus annuitised (40% PFRDA floor) and the annuity rate.",
    "Read \"NPS return needed to match the UPS payout\", compare the UPS and NPS monthly figures side by side, then press \"Copy result\".",
  ],
  intro:
    "UPS vs NPS Comparator computes the annual NPS return at which a National Pension System annuity would pay exactly as much per month as the Unified Pension Scheme assured payout, on the same basic pay, service length and DA assumptions. It applies the UPS rules notified by the Department of Financial Services in F. No. FX-1/3/2024-PR dated 24 January 2025 and operative from 1 April 2025 — 50% of the average basic pay of the last twelve months at 25 years of qualifying service, proportionate below that, an assured minimum of Rs 10,000 a month at 10 years, Dearness Relief on top, a family payout of 60%, and a lump sum of one-tenth of monthly emoluments per completed six months — and sets them against an NPS corpus annuitised under the PFRDA (Exits and Withdrawals) Regulations, 2015, where at least 40% must buy an annuity and up to 60% may be commuted. It is built for Central Government employees who hold the one-time election between the two schemes and want the break-even return and the bequest difference stated in rupees rather than described in adjectives.",
  useCases: [
    "Find the annual NPS return your corpus would have to earn for the annuity to match a UPS payout of 50% of your last twelve months' average basic pay plus Dearness Relief.",
    "See what 33 years of qualifying service produces under the UPS proportionate rule versus 24 years, where the payout drops to 24/25ths of the full 50% rate.",
    "Price the estate difference: the 60% commuted NPS lump sum plus any returned annuity purchase price, against the UPS lump sum of one-tenth of emoluments per completed six-month block.",
    "Test how a lower annuity rate — 5.7% instead of 6.4% for a return-of-purchase-price annuity — moves the break-even return you would need from NPS.",
  ],
  benefits: [
    [
      "Both schemes on one pay history",
      "The same basic pay, increment rate, DA level and DA growth drive the UPS payout and the NPS contributions, so nothing is compared across mismatched assumptions.",
    ],
    [
      "One break-even number",
      "Instead of two projections to eyeball, it solves for the annual NPS return that makes the annuity equal the UPS payout, and reports it both with and without Dearness Relief.",
    ],
    [
      "Every assumption is visible and editable",
      "Return, annuity rate, annuity share, basic pay growth, DA level, DA growth, contribution rates and the retirement horizon are all inputs on the page — none of them are baked in.",
    ],
    [
      "The bequest side is priced too",
      "It shows the NPS estate at superannuation next to the UPS lump sum and the 60% family payout, so the inheritance the assured payout replaces is stated in rupees.",
    ],
  ],
  faqs: [
    [
      "How much pension does UPS actually assure?",
      "50% of the average basic pay drawn over the last twelve months before superannuation, payable after 25 years of qualifying service. Below 25 years the payout is proportionate — 20 years of service gives 20/25ths, or 40% of average basic pay — and below 10 years no assured payout is admissible. Where service is 10 years or more, an assured minimum of Rs 10,000 a month applies, and Dearness Relief is added on top on the same basis as DA for serving employees. Source: DFS notification F. No. FX-1/3/2024-PR dated 24 January 2025.",
    ],
    [
      "What return would NPS have to earn to beat UPS?",
      "There is no single figure — it depends on your corpus, your remaining service and the annuity rate — which is exactly what this page solves for. On the page's default case (basic pay Rs 56,100, 25 years still to serve, 33 years total service, Rs 15 lakh already in NPS, 10% + 14% of basic plus DA contributed monthly, 3% annual increment, DA at 60% rising 4 points a year, 40% annuitised at 6%), NPS needs 10.92% a year to match the UPS payout of Rs 1,45,971 a month including Dearness Relief, and only 5.29% a year to match the bare 50% assured payout of Rs 57,020. The page reports both figures because the gap between them is entirely Dearness Relief.",
    ],
    [
      "What lump sum does UPS pay, and how does it compare with the NPS 60%?",
      "The UPS lump sum is one-tenth of monthly emoluments — basic pay plus DA — for every completed six months of qualifying service, and it does not reduce the assured payout. Thirty years of service is 60 completed six-month blocks, so the lump sum is six times monthly emoluments. Under NPS, up to 60% of the corpus can be commuted and is exempt under Section 10(12A), and if the annuity carries return of purchase price the annuitised 40% comes back to the nominee. That commuted balance is usually much larger than the UPS lump sum, which is the estate the assured payout is traded against.",
    ],
    [
      "Is any of my NPS corpus locked up, and can I change my mind later?",
      "At superannuation the PFRDA (Exits and Withdrawals) Regulations, 2015 require at least 40% of the accumulated pension wealth to buy an annuity from an IRDAI-registered provider, with up to 60% withdrawable; if the total corpus is Rs 5 lakh or less the whole amount may be withdrawn. On the scheme election itself, the UPS notification treats the choice between UPS and NPS as a one-time option that is final once exercised, so this page computes and stops rather than recommending. Confirm the option window and your qualifying service with your Head of Office.",
    ],
  ],
};

export default seo;
