const seo = {
  title: "IDV Calculator — IRDAI Depreciation Grid for Car & Bike",
  metaDescription:
    "Compute Insured Declared Value from ex-showroom price and IRDAI's 5%–50% age-band depreciation, plus the ±15% range and an indicative own-damage premium.",
  steps: [
    "Enter the \"Ex-showroom price (INR)\" and \"Accessories not factory fitted (INR)\", then choose the \"Vehicle age\" band — each option shows its IRDAI rate, like \"2 years to 3 years — 30%\".",
    "Adjust \"IDV adjustment (% — insurers allow ±15)\" and the \"Own-damage rate (% of IDV)\" to mirror your renewal quote.",
    "Read the Insured Declared Value, the depreciation deducted, the \"Negotiable IDV range (±15%)\" and the indicative own-damage premium, then click \"Copy result\".",
  ],
  intro:
    "The Vehicle Insurance IDV Calculator works out the Insured Declared Value of a car or two-wheeler by applying the IRDAI depreciation grid to the ex-showroom price and any accessories fitted after purchase. IDV is the ceiling on what a total-loss or theft claim can pay, so setting it correctly matters more than shaving a few hundred rupees off the premium. It also shows the ±15% range insurers normally allow and an indicative own-damage premium at the rate you enter.",
  useCases: [
    "Checking, before renewing a 3-year-old hatchback, whether the insurer's proposed IDV matches the 40% depreciation the IRDAI grid prescribes for that age band.",
    "Deciding whether to declare a higher IDV on a car with an expensive aftermarket infotainment and alloy setup so a theft claim covers those accessories too.",
    "Comparing two renewal quotes where one looks cheaper only because it quietly reduces the IDV by 15%.",
  ],
  benefits: [
    [
      "Uses the official grid",
      "Applies the IRDAI depreciation percentages — 5%, 15%, 20%, 30%, 40% and 50% by age band — instead of a made-up curve.",
    ],
    [
      "Accessories handled separately",
      "Non-factory-fitted accessories are depreciated at the same rate and shown as their own line, the way insurers endorse them.",
    ],
    [
      "Shows your negotiating range",
      "Displays the ±15% band insurers commonly permit, so you can see how far the declared value can legitimately move.",
    ],
  ],
  faqs: [
    [
      "What is IDV in motor insurance?",
      "Insured Declared Value is the current market value of your vehicle as agreed with the insurer, calculated as the manufacturer's listed selling price less depreciation. It is the maximum sum payable if the vehicle is stolen or written off as a total loss.",
    ],
    [
      "What depreciation rates does IRDAI prescribe?",
      "5% up to 6 months, 15% from 6 months to 1 year, 20% from 1 to 2 years, 30% from 2 to 3 years, 40% from 3 to 4 years and 50% from 4 to 5 years. Beyond 5 years the IDV is mutually agreed between you and the insurer based on the vehicle's condition.",
    ],
    [
      "Should I choose a lower IDV to reduce my premium?",
      "The own-damage premium is a percentage of IDV, so a lower IDV does cut the premium — but it also cuts your total-loss payout by the same proportion. Under-declaring can leave a large shortfall if the vehicle is stolen.",
    ],
    [
      "Is registration cost or road tax included in IDV?",
      "No. IDV is based on the ex-showroom price of the vehicle plus any accessories fitted later. Registration charges, road tax and the insurance premium itself are excluded.",
    ],
  ],
};

export default seo;
