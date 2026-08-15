const seo = {
  title: "Cost Inflation Index Calculator FY 2001-02",
  metaDescription:
    "Convert a purchase price to indexed cost with the CBDT's CII (100 to 376), index each improvement from its own year, and see the LTCG before and after.",
  steps: [
    "Pick 'Financial year of purchase' and 'Financial year of transfer' — each dropdown option shows its notified CII — then enter 'Cost of acquisition (INR)' and 'Sale consideration (INR)'.",
    "Press 'Add improvement' for each capital addition and set its 'Year of improvement' and 'Amount spent (INR)'; each row is indexed from its own year.",
    "Read the 'Total indexed cost' with the indexation factor, gain before and after indexation and tax saved at 20%, then press 'Copy result'.",
  ],
  intro:
    "This Cost Inflation Index calculator converts an old purchase price into its indexed cost of acquisition using the CII notified by the CBDT under Section 48, from the base year 2001-02 (index 100) through FY 2025-26 (index 376). It indexes each capital improvement separately from the year it was incurred, then shows the long-term capital gain before and after indexation. It is meant for sellers of property, gold, unlisted shares and other long-term assets who need the indexed figure for their return.",
  useCases: [
    "Working out the indexed cost of a flat bought for ₹10 lakh in FY 2005-06 and sold in FY 2025-26.",
    "Indexing a ₹5 lakh extra floor added in FY 2013-14 separately from the original purchase, as Section 48 requires.",
    "Checking whether a sale actually produces a long-term capital loss once inflation is added back to the cost.",
  ],
  benefits: [
    ["Official index, every year", "Uses the notified CII for FY 2001-02 to FY 2025-26 — no guessing at inflation numbers."],
    ["Improvements indexed separately", "Each capital addition is indexed from its own financial year, not lumped into the purchase price."],
    ["Shows the tax effect", "Displays the gain removed by indexation and the tax that saves at the 20% long-term rate."],
  ],
  faqs: [
    [
      "What is the formula for indexed cost of acquisition?",
      "Indexed cost = cost of acquisition x CII of the year of transfer / CII of the year of acquisition. For an asset bought in FY 2005-06 (CII 117) and sold in FY 2025-26 (CII 376), a ₹10 lakh cost becomes ₹32,13,675.",
    ],
    [
      "What is the Cost Inflation Index for FY 2025-26?",
      "376, on the base year 2001-02 = 100. The previous years are 363 for FY 2024-25, 348 for FY 2023-24 and 331 for FY 2022-23.",
    ],
    [
      "What if the asset was bought before 1 April 2001?",
      "You may substitute its fair market value as on 1 April 2001 for the actual cost, and index that value from FY 2001-02. For land and buildings the substituted value cannot exceed the stamp duty value on that date.",
    ],
    [
      "Is indexation still allowed after Budget 2024?",
      "Not for most assets — long-term gains are generally taxed at 12.5% without indexation from 23 July 2024. Resident individuals and HUFs selling land or buildings acquired before that date may still choose 20% with indexation if it results in less tax.",
    ],
  ],
};

export default seo;
