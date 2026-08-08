const seo = {
  title: "Society Maintenance Splitter: Equal vs Per Sq Ft",
  metaDescription:
    "Set each expense head to equal, per sq ft, per parking slot or custom %, and get whole-rupee flat bills that reconcile exactly to the total.",
  steps: [
    "Under Flats, set each Flat no., Carpet area (sq ft) and Parking slots, and toggle any row between Occupied and Vacant; Add flat appends another row.",
    "In Expense heads, give each head its monthly amount and pick Equal, Per sq ft, Per slot or Custom %, then switch \"Vacant flats charged\" to \"Vacant flats skipped\" on usage-driven heads such as the water tanker.",
    "The Full split table allocates whole rupees by the largest-remainder method and reconciles to the expense total; use Copy table or Download CSV, or choose a flat and press Print bill for its head-wise bill.",
  ],
  intro:
    "The Society Maintenance Charge Splitter divides a housing society's monthly expenses across its flats, letting you set the basis separately for every expense head — equal per flat, per sq ft of carpet area, per parking slot, or a hand-entered custom percentage — and produces a per-flat total plus a printable bill. It is built for committee members and treasurers who have to defend a maintenance figure at a general body meeting, because it shows the same total split both ways so you can see exactly which flats gain or lose under each method. Shares are allocated in whole rupees using largest-remainder rounding, so every head's shares add back to the amount you entered with no rounding drift.",
  useCases: [
    "Your society bills everything per sq ft and the owners of the smaller flats are objecting, so you need the equal-versus-area comparison to show the rupee difference per flat before the AGM votes on it.",
    "You are drafting this month's bills and want lift AMC and security split equally but common electricity and water split by area, with vacant flats left out of the water tanker head.",
    "You are setting the sinking fund contribution and want a monthly figure derived from the society's total carpet area and construction cost rather than a number picked in a meeting.",
  ],
  benefits: [
    ["Per-head basis, not one rule for everything", "Each expense head carries its own basis and its own vacant-flat rule, which is how real society accounts actually work."],
    ["Rupee-exact allocation", "Largest-remainder rounding distributes the leftover rupees one at a time, so the flat totals sum to the expense total instead of being a rupee or two off."],
    ["The argument settled on screen", "A built-in comparison shows the same expense split equally and by area side by side, and names the flat that gains most and the one that loses most."],
  ],
  faqs: [
    [
      "Should maintenance be charged equally or per square foot?",
      "It depends on the head. Builders and most societies bill everything per sq ft, but the model co-operative housing society bye-laws allocate several service charge heads equally per flat, which is exactly the mismatch that causes disputes between large and small flat owners. Set each head separately here, then confirm the basis against your society's own registered bye-laws before you issue bills.",
    ],
    [
      "How is the sinking fund figure calculated?",
      "Total carpet area multiplied by the construction cost per sq ft you enter, multiplied by 0.25% for the year, then divided by 12 for a monthly figure. That 0.25% per annum of construction cost is the minimum set out in model bye-law 13(c); your society can and often does resolve to collect more.",
    ],
    [
      "Can vacant flats be excluded from a charge?",
      "Yes, per head. Each expense head has its own charge-vacant toggle, so you can bill security and lift AMC to every flat while leaving vacant flats out of usage-driven heads such as the water tanker. If a head would end up with no payers at all, it falls back to charging every flat rather than producing a zero split.",
    ],
    [
      "Is the split legally binding?",
      "No. This is a calculation aid, not legal or accounting advice — the basis your society may lawfully use comes from your registered bye-laws, your state's co-operative societies act and any general body resolution. Check the output with your society's auditor or managing committee before it becomes a bill.",
    ],
  ],
};

export default seo;
