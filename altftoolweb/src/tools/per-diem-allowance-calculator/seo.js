const seo = {
  title: "Per Diem Calculator: Part Days, Nights, Meals Off",
  metaDescription:
    "Totals a trip the way a travel policy reads it: full days at the city rate, first and last at 75%, lodging per night, provided meals deducted.",
  steps: [
    "Enter the 'Departure date' and 'Return date', then pick a 'City tier' — Metro, Tier 1, Tier 2, Tier 3 or Custom rates — which fills 'Meals & incidentals per day (₹)' and 'Lodging per night (₹)'.",
    "Adjust 'First and last day rate (%)' from its 75 default, count the 'Breakfasts provided', 'Lunches provided' and 'Dinners provided' at their 20/30/50 percent shares, and enter any 'Advance already paid (₹)'.",
    "Read the 'Total allowance' with days and nights split apart, the Full days, Part days, Lodging and 'Provided meals deducted' tiles, and the line stating what is payable to or recoverable from the traveller; 'Copy result' saves the claim.",
  ],
  intro:
    "A per diem is the flat daily amount an employer pays to cover meals, incidentals and lodging while an employee is away on work, and this calculator totals a trip the way a travel policy actually reads it: full days at the city-tier rate, the departure and return days at a reduced rate (75% is the US GSA convention and the most common corporate default), lodging counted per night rather than per day, and any meal already provided deducted at its share of the daily rate. It then settles the total against any advance already paid.",
  useCases: [
    "Totalling a five-day metro trip where the first and last day are part days and four nights of hotel are payable.",
    "Reducing the allowance for a conference that already includes three breakfasts and two lunches.",
    "Working out how much of a ₹35,000 travel advance has to be returned once the actual trip is totalled.",
  ],
  benefits: [
    [
      "Nights and days kept apart",
      "A five-day trip is five days of meals but only four nights of lodging — the single most common manual error.",
    ],
    [
      "Part-day rule built in",
      "The departure and return days are paid at your policy percentage, and a one-day trip counts as a single part day.",
    ],
    [
      "Provided meals netted off",
      "Breakfast, lunch and dinner shares default to 20/30/50 percent of the daily rate and can be set to match your policy.",
    ],
  ],
  faqs: [
    [
      "How is per diem calculated for the first and last day of travel?",
      "At a reduced rate, because neither is a full day away. US federal travel pays 75% of the meals and incidentals rate on the first and last day, and most corporate policies use the same 75% figure. A single-day trip is treated as one part day, not a full day.",
    ],
    [
      "Is per diem taxable in India?",
      "A daily allowance paid to meet the ordinary daily charges of being away from the normal place of duty is exempt under Section 10(14)(i) of the Income-tax Act, 1961 read with Rule 2BB(1)(b), but only to the extent it is actually spent for that purpose. An unspent surplus is taxable as salary. There is no prescribed rate, so employers set their own bands — check the treatment with your payroll team or a chartered accountant.",
    ],
    [
      "How many nights of lodging does a trip cover?",
      "One fewer than the number of calendar days. A trip from the 10th to the 14th is five days but four nights, so meals are paid for five days and hotel for four nights.",
    ],
    [
      "Should per diem be reduced when meals are provided?",
      "Yes, that is standard practice: if a conference fee or hotel rate includes a meal, the corresponding share of the daily rate is deducted so the allowance is not paid twice. A common split is 20% for breakfast, 30% for lunch and 50% for dinner, though the exact percentages come from your own policy.",
    ],
  ],
};

export default seo;
