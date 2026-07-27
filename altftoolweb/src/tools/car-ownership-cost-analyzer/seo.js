const seo = {
  intro:
    "Car Ownership Cost Analyzer works out what a car costs you per month, per kilometre and across 1, 3, 5 and 10 years by adding four blocks together: the loan EMI, running costs (fuel, insurance, maintenance, parking, tolls), one-off charges like registration and accessories, and depreciation — the purchase price minus what the car is worth when you sell it. It is built for Indian buyers deciding between a purchase and staying with cabs. The EMI uses the standard reducing-balance formula, EMI = P × r × (1+r)^n / ((1+r)^n − 1), and fuel is compounded forward each year at the inflation rate you enter.",
  useCases: [
    "Compare a ₹10 lakh car on a 5-year, 9% loan against Ola and Uber at ₹18/km for the same 1,200 km a month",
    "Check what happens to the monthly figure if petrol rises 10%, you double your driving, or the loan rate goes up two points — the scenario buttons apply each change directly",
    "See what share of your take-home pay the car eats before you sign the loan, using the 15% comfortable / 25% manageable bands",
  ],
  benefits: [
    ["Depreciation is counted", "Most calculators stop at EMI plus fuel; this one charges the price-minus-resale gap over your ownership period, which is usually the single largest cost."],
    ["Fuel inflation compounds", "Year 2's fuel bill is year 1's grown by your inflation rate, so a 10-year projection does not quietly assume today's pump price forever."],
    ["Owning versus cabs, with a break-even year", "Cab cost is projected over the same 1, 3, 5 and 10-year horizons and the tool names the first year at which owning wins, or says it never does."],
  ],
  faqs: [
    [
      "How is the car loan EMI calculated?",
      "With the standard reducing-balance formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the annual rate divided by 12 and by 100, and n is the tenure in months. On ₹8,00,000 at 9% for 5 years that is ₹16,607 a month, and ₹1,96,401 of interest across the 60 instalments.",
    ],
    [
      "What monthly car cost is affordable?",
      "This tool flags under 15% of monthly take-home pay as comfortable and 15-25% as manageable; above 25% it warns. Those bands are a little wider than the well-known 20/4/10 rule (20% down, 4-year loan, all car costs under 10% of gross income) because the figure here already includes fuel, tolls and parking, which the 10% rule usually leaves out.",
    ],
    [
      "Does the calculator include depreciation?",
      "Yes. Enter the resale value as a percentage of the purchase price and the ownership period, and the tool charges the difference across those years. A ₹10,00,000 car worth 40% after 5 years depreciates ₹6,00,000 — about ₹10,000 a month, which is often more than the fuel bill.",
    ],
    [
      "Is it cheaper to own a car or take Ola and Uber?",
      "It depends almost entirely on distance. Below roughly 500 km a month cabs nearly always win, because EMI, insurance and depreciation run whether you drive or not. The tool projects both sides over 1, 3, 5 and 10 years and reports the first horizon at which total ownership cost, depreciation included, falls below the cab bill.",
    ],
  ],
};

export default seo;
