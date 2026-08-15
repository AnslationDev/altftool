const seo = {
  title: "Motor Insurance IDV Calculator with Tariff",
  metaDescription:
    "Applies the motor tariff slabs — 5%, 15%, 20%, 30%, 40%, 50% to five years — to your car and accessories, and prices the cut from a lower IDV.",
  steps: [
    "Enter 'Ex-showroom listed price (INR)' and 'Age of the vehicle (completed months)', or tap a preset such as '30 months'.",
    "Add anything fitted afterwards under 'Accessories not in the listed price (INR)' — a CNG kit, music system or alloy wheels.",
    "Read the Insured Declared Value and its depreciation band, then enter an 'IDV you plan to declare (INR)' to see the 'Claim shortfall you would bear'.",
  ],
  intro:
    "Insured Declared Value is the manufacturer's listed selling price of your vehicle less depreciation for its age, and it is the amount a total loss or theft claim pays. This calculator applies the India Motor Tariff depreciation slabs — 5% up to six months, 15% to one year, 20%, 30%, 40% and 50% through year five, and mutual agreement beyond that — to the vehicle and separately to accessories not included in the listed price. It also shows what happens to a partial-loss claim when the IDV declared is lower than the correct figure.",
  useCases: [
    "Check the IDV your insurer has proposed at renewal against the tariff depreciation for your car's age.",
    "See what a fitted CNG kit or music system adds to the sum insured once depreciation is applied.",
    "Quantify the claim shortfall before accepting a lower IDV to cut the own-damage premium.",
  ],
  benefits: [
    ["Tariff slabs, not guesses", "Uses the depreciation table insurers apply, including the exact month boundaries between bands."],
    ["Accessories valued separately", "Applies the same depreciation to add-ons not covered by the vehicle's listed price."],
    ["Under-insurance made concrete", "Applies the condition of average so you see the rupee cost of declaring a lower IDV."],
  ],
  faqs: [
    [
      "How is IDV calculated for a car?",
      "Take the manufacturer's listed ex-showroom price for that make and model, exclude registration charges, road tax and insurance, then deduct depreciation for age — 5% up to six months, 15% up to one year, 20% up to two years, 30% up to three, 40% up to four and 50% up to five years. A ₹8,00,000 car aged 30 months has an IDV of ₹5,60,000.",
    ],
    [
      "What is the IDV of a car more than 5 years old?",
      "The tariff does not fix a rate beyond five years — IDV is mutually agreed between the insurer and the owner based on the vehicle's condition, usually after a survey. Insurers commonly continue to reduce it year on year, but there is no prescribed percentage.",
    ],
    [
      "Should I choose a lower IDV to reduce my premium?",
      "Lowering the IDV reduces the own-damage premium in proportion, but it also caps the total loss and theft payout at that lower figure, and a partial-loss claim is settled proportionately under the condition of average. Declaring ₹4,00,000 against a correct ₹5,74,000 pays only about 70% of any partial claim.",
    ],
    [
      "Does IDV include the CNG kit and accessories?",
      "Only if they were part of the manufacturer's listed price. Anything fitted afterwards — a CNG or LPG kit, music system, alloy wheels — must be declared separately and is insured at its own listed price less the same age-based depreciation.",
    ],
  ],
};

export default seo;
