const seo = {
  title: "Laptop Resale Value Estimator: Price a Used",
  metaDescription:
    "Estimate a used laptop's worth from age, condition, battery health, paperwork and warranty. Shows an asking range and the lower trade-in figure.",
  steps: [
    "Enter \"Original purchase price (INR)\" and \"Age (months, 0-240)\", then choose a Condition grade from \"Like new — no marks, all accessories\" down to \"Faulty — sold for spares or repair\".",
    "Add \"Battery health (%)\", \"Transferable warranty left (months)\" and any \"Known repair cost to deduct (INR)\", and tick \"Original charger included\", \"Original invoice and box available\" and \"Still receives operating-system and security updates\" where they apply.",
    "Read \"Estimated private-sale value\" with its ask-between range and the \"Trade-in / buy-back offer to expect\" row, scan the \"What each factor did to the price\" table, then press \"Copy result\" or Reset.",
  ],
  intro:
    "A laptop resale value estimator projects what a used machine is worth today by applying declining-balance depreciation to its original price, then adjusting for condition, battery health, accessories, paperwork and remaining warranty. The model uses the pattern consumer electronics actually follow: a steep first year of roughly 35-40% loss, then about 20-25% a year after that. It reports a private-sale point estimate, a realistic asking range and the lower figure a trade-in programme is likely to offer.",
  useCases: [
    "Setting an asking price before listing a two-year-old laptop on a marketplace",
    "Checking whether an exchange or buy-back quote from a retailer is fair",
    "Deciding whether to replace a swollen or worn battery before selling, or discount for it instead",
  ],
  benefits: [
    ["Two-phase depreciation", "Separates the steep first-year drop from the slower decline afterwards, instead of one flat rate."],
    ["Battery health priced in", "Applies a straight-line discount that starts easing in at 90% battery health and reaches its maximum 18% deduction at 50%, not a single cutoff."],
    ["Private sale vs trade-in", "Shows both numbers, so a low buy-back offer is easy to recognise."],
  ],
  faqs: [
    [
      "How much value does a laptop lose in the first year?",
      "Typically 35-40% of its purchase price. Depreciation is steepest immediately after purchase because the model is still on sale new, and it flattens to roughly 20-25% a year after the first twelve months.",
    ],
    [
      "Does battery health affect a laptop's resale price?",
      // Mirrors lib.js's batteryMultiplier: full value at >=90% health, a straight-line
      // discount down to an 18% deduction at <=50% health, with no special point at 80%.
      // Keep these figures in sync with lib.js if that function changes.
      "Yes, and it eases in gradually rather than at one cutoff. Value stays full down to 90% health, then the discount grows steadily as health falls, reaching its maximum 18% deduction at 50% health and below. (Some makers, Apple included, flag a battery for service around 80% capacity — that is a real service milestone, but it is not where this estimator's pricing curve does anything special; the discount is a smooth line the whole way from 90% to 50%.)",
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
