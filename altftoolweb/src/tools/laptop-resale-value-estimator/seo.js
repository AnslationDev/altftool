const seo = {
  intro:
    "A laptop resale value estimator projects what a used machine is worth today by applying declining-balance depreciation to its original price, then adjusting for condition, battery health, accessories, paperwork and remaining warranty. The model uses the pattern consumer electronics actually follow: a steep first year of roughly 35-40% loss, then about 20-25% a year after that. It reports a private-sale point estimate, a realistic asking range and the lower figure a trade-in programme is likely to offer.",
  useCases: [
    "Setting an asking price before listing a two-year-old laptop on a marketplace",
    "Checking whether an exchange or buy-back quote from a retailer is fair",
    "Deciding whether to replace a swollen or worn battery before selling, or discount for it instead",
  ],
  benefits: [
    ["Two-phase depreciation", "Separates the steep first-year drop from the slower decline afterwards, instead of one flat rate."],
    ["Battery health priced in", "Uses the 80% service threshold that makers themselves flag as the point a battery needs replacing."],
    ["Private sale vs trade-in", "Shows both numbers, so a low buy-back offer is easy to recognise."],
  ],
  faqs: [
    [
      "How much value does a laptop lose in the first year?",
      "Typically 35-40% of its purchase price. Depreciation is steepest immediately after purchase because the model is still on sale new, and it flattens to roughly 20-25% a year after the first twelve months.",
    ],
    [
      "Does battery health affect a laptop's resale price?",
      "Yes, and the cliff is around 80%. Most makers, Apple included, flag a battery for service once its maximum capacity falls below 80% of design capacity, and buyers price in a replacement from that point, which is usually a few thousand rupees plus labour.",
    ],
    [
      "Should I keep the original box and invoice?",
      "Keep them if you can. The invoice is what lets a buyer transfer remaining warranty and prove the machine is not stolen, and listings with full paperwork consistently close faster and a few percent higher than identical ones without.",
    ],
    [
      "Why is a trade-in offer lower than the private sale price?",
      "Because the buy-back company has to test, refurbish, warranty and resell the machine, so it works on a margin. Expect a trade-in or exchange offer around 70-75% of what a patient private sale would fetch. Treat both figures here as informational estimates, not quotes.",
    ],
  ],
};

export default seo;
