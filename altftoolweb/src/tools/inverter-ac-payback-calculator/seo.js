const seo = {
  intro:
    "This calculator finds how many years an inverter air conditioner needs to repay its higher purchase price through lower electricity bills. It models annual consumption as rated capacity in watts × equivalent full-load hours ÷ (ISEER × 1000), where ISEER is the BEE star-label seasonal efficiency ratio, then escalates the yearly saving by your tariff growth rate and interpolates the year the cumulative saving crosses the price premium. It is aimed at buyers deciding whether the extra money for a 5-star inverter unit is worth it for their own usage and tariff.",
  useCases: [
    "Deciding whether a ₹10,000 premium for a 5-star 1.5 ton inverter split is justified at a ₹8 per unit tariff",
    "Comparing two shortlisted models by their label ISEER instead of by star count alone",
    "Showing a landlord or office manager the year-by-year cash flow before approving the more expensive unit",
  ],
  benefits: [
    [
      "Uses the label number",
      "Works directly from ISEER on the BEE label, the same seasonal metric that determines the star rating.",
    ],
    [
      "Usage-aware",
      "A unit run 2,000 equivalent full-load hours pays back roughly four times faster than one run 500, so usage is an input rather than an assumption.",
    ],
    [
      "Escalating tariffs",
      "Applies annual tariff growth to each year's saving, which shortens payback compared with a flat-rate estimate.",
    ],
  ],
  faqs: [
    [
      "How many years does an inverter AC take to pay for itself?",
      "Typically three to five years for a 1.5 ton unit in normal Indian residential use. A ₹10,000 premium between an ISEER 3.65 fixed-speed and an ISEER 5.2 inverter unit at 800 equivalent full-load hours and ₹8 per kWh saves about ₹2,760 in the first year, repaying the premium in roughly 3.4 years once a 5% annual tariff rise is included.",
    ],
    [
      "How do I calculate an air conditioner's annual electricity use from ISEER?",
      "Divide capacity in watts by ISEER to get average input power at full load, then multiply by equivalent full-load hours. A 1.5 ton unit is about 5,275 W, so at ISEER 5.2 and 800 hours it uses roughly 810 kWh a year, against about 1,156 kWh for the same capacity at ISEER 3.65.",
    ],
    [
      "What is ISEER and how is it different from EER?",
      "ISEER is the Indian Seasonal Energy Efficiency Ratio: the total seasonal cooling load in watt-hours divided by the total seasonal energy consumed, measured across a range of outdoor temperature bins. EER is a single-point ratio at one fixed test condition, which flatters fixed-speed units because it never captures the part-load running where inverters gain most.",
    ],
    [
      "Is an inverter AC worth it if I only use it a few weeks a year?",
      "Often not on running cost alone. At around 500 equivalent full-load hours the annual saving falls to roughly ₹1,700 on the same comparison, stretching payback past five years — close to the point where compressor warranty and resale matter more than electricity. Inverters still run quieter and hold temperature more steadily, which may justify the premium on comfort grounds.",
    ],
  ],
};

export default seo;
