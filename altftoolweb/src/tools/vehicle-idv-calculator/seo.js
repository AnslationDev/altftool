const seo = {
  title: "IDV Calculator for Car and Bike: GR.8 Tariff Slabs",
  metaDescription:
    "IDV from ex-showroom price on India Motor Tariff GR.8 slabs: 5% depreciation under six months rising to 50% in year five, plus accessories and OD premium.",
  steps: [
    "Enter \"Ex-showroom price (INR)\", any \"Extra fitted accessories (INR)\", the \"First registration date\" and the \"Policy start date\".",
    "Add the \"Own-damage rate from your quote (%)\"; for a vehicle past five years, set \"Agreed depreciation (%, over 5 years)\" yourself.",
    "Read \"Insured Declared Value\" with the depreciation slab applied, the accessories IDV line and the own-damage premium, then press Copy result.",
  ],
  intro:
    "The Insured Declared Value (IDV) of a vehicle is its manufacturer-listed ex-showroom price less depreciation, and it is the maximum your motor insurer pays if the vehicle is stolen or written off. This calculator applies the depreciation schedule in GR.8 of the India Motor Tariff — 5% under six months, 15% up to a year, then 20%, 30%, 40% and 50% through year five — and values separately-fitted accessories on the same scale. Registration charges, road tax and the premium itself are excluded from IDV by the tariff.",
  useCases: [
    "Checking whether the IDV printed on a renewal quote matches the tariff depreciation for your car's age",
    "Comparing two insurers whose premiums differ mainly because they have quoted different IDVs",
    "Estimating the payout you would receive if a three-year-old bike were stolen",
  ],
  benefits: [
    ["Tariff slabs, not guesswork", "Uses the GR.8 percentages exactly, including the inclusive month boundaries."],
    ["Accessories handled separately", "Aftermarket fitments are depreciated on the same scale and listed as their own line."],
    ["Premium impact shown", "Applies your own quoted own-damage rate to the IDV so you can see what changing it costs."],
  ],
  faqs: [
    [
      "How is IDV calculated in India?",
      "IDV = manufacturer's listed ex-showroom price × (1 − depreciation), using the GR.8 slabs: 5% up to six months, 15% up to one year, 20% in year two, 30% in year three, 40% in year four and 50% in year five. Registration charges, road tax and the insurance premium are not part of the calculation.",
    ],
    [
      "What is the IDV of a 3-year-old car?",
      "30% depreciation applies once the vehicle has exceeded two years but not three, and 40% once it has exceeded three. A car with a ₹10 lakh ex-showroom price is therefore valued at ₹7 lakh at the end of year three and ₹6 lakh once it passes that mark.",
    ],
    [
      "How is IDV decided for a car older than 5 years?",
      "The tariff stops fixing a percentage past five years — IDV is mutually agreed between you and the insurer based on the vehicle's condition and whether the model is obsolete. In practice insurers continue stepping depreciation down, so expect quotes in the 55–80% depreciation range, and ask for the figure in writing.",
    ],
    [
      "Should I choose a lower IDV to reduce my premium?",
      "A lower IDV does reduce the own-damage premium, since that premium is charged as a percentage of IDV, but it also reduces the maximum payout on theft or total loss by exactly the same amount. Declaring an IDV well below market value only saves a small premium while transferring a large risk to you.",
    ],
  ],
};

export default seo;
