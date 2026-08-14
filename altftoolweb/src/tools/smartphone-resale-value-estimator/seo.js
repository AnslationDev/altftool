const seo = {
  title: "Smartphone Resale Value Estimator by Age & Condition",
  metaDescription:
    "Estimate a used phone's worth from launch price, months of age, grade, storage and demand — with instant trade-in and patient private-sale figures.",
  steps: [
    "Enter 'Launch price of your variant (INR)' and 'Age (months since you bought it)', then choose a Condition from Sealed / unused down to Cracked glass (×0.38).",
    "Pick a Storage variant and 'Resale demand for the brand', and tick what applies under 'What else is true of it', such as 'Manufacturer warranty still valid' at +6% or 'Battery health below 80% / replacement due' at -9%.",
    "Read 'Estimated value today' with the Instant trade-in and 'Patient private sale' figures, plus 'Losing per month' and 'Losing per day', and press Change under 'Depreciation assumptions' to edit the first-year drop.",
  ],
  intro:
    "This estimator works out what a used smartphone is worth by taking its launch price and multiplying it through a declining-balance retention curve for age, a cosmetic grade factor, a storage-variant factor, a brand-demand factor and additive adjustments for the box, bill, warranty, battery health and repair history. The default curve assumes 45% of value goes in the first year and 30% of the remainder each year after, which is roughly how organised buyback grids are shaped. Every factor is shown and can be replaced with numbers from a real quote.",
  useCases: [
    "Deciding whether an exchange bonus during a festival sale is actually better than selling privately.",
    "Checking a buyback site's offer before accepting it, so you know how much of a discount you are taking for convenience.",
    "Working out what your current phone will be worth in six months if you wait for the next launch.",
  ],
  benefits: [
    ["Continuous age curve", "A 15-month-old phone is priced at 15 months, not rounded to a year."],
    ["Separates the two prices", "Shows the instant trade-in figure and the patient private-sale figure side by side."],
    ["Every factor is visible", "No hidden grid — you can see and change the depreciation rates the model uses."],
  ],
  faqs: [
    [
      "How much value does a smartphone lose in the first year?",
      // The age-based retention curve is identical for every demand tier (see
      // DEMAND_TIERS in lib.js) — demand only scales the final value via a
      // separate multiplier, it does not change how fast value falls with age.
      // Default first-year drop is 45%, default later-year drop is 30% —
      // keep these figures in sync with DEFAULT_FIRST_YEAR_DROP / DEFAULT_LATER_YEAR_DROP in lib.js.
      "Roughly 40-50% of its launch price in the first year — the default model here assumes 45%. This age-based curve is the same regardless of brand or resale demand; after the first year the fall flattens to about 30% of what is left per year, which is why a two-year-old phone typically fetches around a third of what it cost new. Resale demand instead moves the estimate through a separate demand factor applied on top of the age curve, not by changing how fast it depreciates.",
    ],
    [
      "Does a cracked screen affect resale value much?",
      "Yes — heavily. Cracked front or back glass on a phone that still works typically halves what a working, scuffed unit fetches, because the buyer prices in a screen replacement plus their risk. A screen already replaced with a non-original part is also marked down, since it affects brightness, touch response and any remaining warranty.",
    ],
    [
      "Should I sell to a buyback site or privately?",
      // The instant-vs-patient spread is fixed by INSTANT_QUOTE_FACTOR (0.85)
      // and PATIENT_SALE_FACTOR (1.12) in lib.js: 1 - 0.85/1.12 ≈ 24%. Keep
      // this figure in sync with those two constants if they ever change.
      "In this calculator's model, a buyback site or exchange offer pays about 24% less than the patient private-sale figure shown alongside it (before the launch-price cap or scrap-value floor kick in), in return for an instant, guaranteed price with no meetings, no haggling and no payment risk. Selling privately is worth the effort mainly on higher-value handsets, where that percentage is real money.",
    ],
    [
      "Does battery health matter when selling a phone?",
      "It does. Once battery health drops below 80%, most manufacturers treat the battery as due for replacement, and buyers price in that cost — expect a deduction of roughly the replacement price plus a margin. Replacing the battery with an official part before selling often recovers more than it costs on phones that still hold value.",
    ],
  ],
};

export default seo;
