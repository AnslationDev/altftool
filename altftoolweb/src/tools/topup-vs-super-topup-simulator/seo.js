const seo = {
  title: "Top-up vs Super Top-up: Per-Claim vs Aggregate",
  metaDescription:
    "Run one policy year of claims through the same deductible measured per claim and on the year's aggregate, and see claim by claim who pays what.",
  steps: [
    "Enter the base sum insured, the top-up / super top-up sum insured and the single deductible on the upper layer, all in rupees.",
    "List the year's hospitalisations as admissible amounts in Claim 1, Claim 2 and so on — Add claim goes up to 24, the bin button removes one — and the comparison recalculates as you type.",
    "Read the difference in what the upper layer pays, the two structure cards for a per-claim and a policy-year-aggregate deductible, and the claim-by-claim table with Base pays, Top-up pays, Super top-up pays and both You pay columns; Copy result takes the whole waterfall.",
  ],
  intro:
    "A top-up vs super top-up deductible simulator runs one policy year of hospital claims through the same rupee deductible measured two different ways, and shows claim by claim who pays what. The only structural difference between the products is the basis of measurement: a top-up applies the deductible to EACH claim separately, so a claim smaller than the deductible pays nothing no matter how many such claims occur, while a super top-up applies it to the AGGREGATE of all admissible claims in the policy year, so everything above the deductible line is payable once cumulative claims cross it. Both readings come from the same standard clause — IRDAI's standard definition of Deductible (Guidelines on Standardisation in Health Insurance, Ref. IRDA/HLT/REG/CIR/146/07/2016, 29 July 2016) says the insurer is not liable for a specified rupee amount before benefits are payable, and that the deductible does not reduce the sum insured; whether that amount is per claim or per year is stated on your policy schedule. It is for anyone holding a base policy plus an upper layer who wants to see, in rupees, what a year of mid-sized hospitalisations does under each basis.",
  useCases: [
    "Read the deductible line on an upper-layer schedule and see what 'Rs 5,00,000 per claim' does to a year of Rs 3,00,000 hospitalisations versus 'Rs 5,00,000 aggregate'",
    "Model a chronic year — four or five mid-sized admissions rather than one large one — which is exactly the pattern the two bases treat differently",
    "Check which claim in the year the running total first crosses an aggregate deductible on, and how much of that claim becomes payable",
    "See what happens when the upper layer's own sum insured runs out mid-year, and how much of the bill that leaves unpaid",
  ],
  benefits: [
    [
      "The distinction stated the right way round",
      "Per claim for a top-up, policy-year aggregate for a super top-up — the same deductible, two bases of measurement, shown as two columns on the same claims.",
    ],
    [
      "A claim-by-claim waterfall, not a total",
      "Every claim shows what the base policy paid, what fell below the deductible line, what the upper layer paid on each basis, and what was left out of pocket.",
    ],
    [
      "The case where a top-up pays nothing",
      "When no single claim clears the deductible, the per-claim column is zero for the whole year while the aggregate column pays from the crossing claim onward — the page flags it explicitly.",
    ],
    [
      "Sums insured deplete like real annual cover",
      "The base policy and the upper layer both run down across the year, and the deductible never eats the upper layer's sum insured, matching the standard definition.",
    ],
  ],
  faqs: [
    [
      "What is the actual difference between a top-up and a super top-up?",
      "The deductible basis, nothing else. A top-up applies the deductible to each claim on its own, so with a Rs 5,00,000 deductible four claims of Rs 3,00,000 each pay zero — every claim is below the line. A super top-up applies the same Rs 5,00,000 to the year's running total, so those same four claims (Rs 12,00,000 in total) trigger payment of Rs 7,00,000 once cumulative claims pass Rs 5,00,000.",
    ],
    [
      "Does the deductible come out of the top-up sum insured?",
      "No. IRDAI's standard definition of Deductible states that a deductible does not reduce the sum insured, so a Rs 20,00,000 layer with a Rs 5,00,000 deductible can still pay up to Rs 20,00,000 — it just pays only above the Rs 5,00,000 line. That is why the layer's sum insured and its deductible are two separate figures on the schedule.",
    ],
    [
      "Do claims paid by my base policy count toward the aggregate deductible?",
      "On the standard aggregate wording, yes — admissible claims in the policy year count toward the deductible whether the base policy met them or the insured did. That is the reason the commonest retail pairing sets the deductible equal to the base sum insured: a Rs 5,00,000 base policy is expected to absorb a Rs 5,00,000 aggregate deductible. This page models it that way, and lets the base sum insured be set to zero if there is no base policy.",
    ],
    [
      "What is not included in these figures?",
      "Copays, room rent caps and proportionate deductions, disease sub-limits, waiting periods, non-payable consumables and any restore or refill benefit are all outside this calculation. Enter each claim as the admissible amount left after those, because the deductible is applied to the admissible claim, not to the printed hospital bill.",
    ],
  ],
};

export default seo;
