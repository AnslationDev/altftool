const seo = {
  title: "Water Tanker Cost Calculator: Monthly Tankers",
  metaDescription:
    "Enter daily demand, piped supply and tanker size to get tankers needed per month, the monthly bill, cost per kilolitre and the blended water cost.",
  steps: [
    "Enter 'Household demand per day (L)' and 'Piped / borewell supply per day (L)' — the IS 1172 minimum of 135 L per person per day is noted under the field.",
    "Set 'Litres per tanker' and 'Price per tanker (₹)', or tap a Tanker sizes preset from the 2,000 L Mini tanker to the 12,000 L Bulk tanker.",
    "Read tankers needed per month (rounded up to whole tankers), the monthly spend, cost per litre and per kilolitre, and the blended cost of all water; 'Copy result' exports it.",
  ],
  intro:
    "A water tanker cost calculator turns the gap between what your household uses and what the piped supply delivers into a number of tankers per month and a monthly bill. It works out the daily shortfall, multiplies it by the days in the month, divides by the litres per tanker and rounds up — because tankers are sold whole, never by the litre — then quotes the result per litre and per kilolitre so you can compare it directly with the municipal tariff, which is always published per kilolitre.",
  useCases: [
    "Budgeting the summer months in a Bengaluru or Chennai apartment where the borewell yield drops and tankers take over",
    "Checking whether a supplier's quote per tanker is fair once the delivery charge is spread across the litres",
    "Showing an RWA committee what tanker dependency costs a year, to justify a rainwater harvesting or recycling spend",
  ],
  benefits: [
    ["Whole tankers, not fractions", "Rounds up the way the supplier actually bills you, and shows the litres you overpay for."],
    ["Comparable units", "Prices tanker water per kilolitre so it sits beside your municipal rate."],
    ["Blended water cost", "Combines tanker and piped spend into one cost per kilolitre for the whole home."],
  ],
  faqs: [
    [
      "How much does a water tanker cost in India?",
      "Prices are set by private suppliers, not a tariff, and typically run from a few hundred rupees for a 2,000 litre mini tanker to a few thousand for a 10,000 litre trailer, rising sharply in the pre-monsoon months. Convert any quote to rupees per kilolitre before comparing suppliers, since tanker sizes are not standardised.",
    ],
    [
      "How many litres is one water tanker?",
      "The common sizes offered to households are 2,000, 3,000, 5,000, 6,000, 10,000 and 12,000 litres, with 5,000 litres the usual 'standard' tanker in most cities. Delivered volume can fall short of the quoted size, so it is worth checking the rise in your sump level against the figure you are billed for.",
    ],
    [
      "How much water does a family of four need per day?",
      "IS 1172:1993 sets a minimum of 135 litres per person per day for a home with a full flushing system, so about 540 litres a day for four people, before garden watering and vehicle washing. A 5,000 litre tanker covers roughly nine days of that demand if the piped supply gives nothing at all.",
    ],
    [
      "Is tanker water more expensive than municipal water?",
      "Almost always, and usually by an order of magnitude. Municipal domestic slabs in Indian cities are commonly single-digit to low-tens of rupees per kilolitre, while tanker water at ₹1,200 for 5,000 litres works out to ₹240 per kilolitre — roughly ten to thirty times the piped rate depending on your city's slab.",
    ],
  ],
};

export default seo;
