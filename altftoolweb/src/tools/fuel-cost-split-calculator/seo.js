const seo = {
  title: "Fuel Cost Split Calculator by Kilometres Ridden",
  metaDescription:
    "Split fuel, tolls and shared costs by person-kilometres, so someone aboard for half the trip pays half a full share. Rounded amounts match the total.",
  steps: [
    "Enter 'Total distance driven (km)', 'Mileage (km per litre)', 'Fuel price (per litre)', 'Tolls for the whole trip' and 'Other shared costs (parking, ferry, permits)'.",
    "Under 'Who rode how far', give each traveller a Name and their 'Kilometres aboard', using 'Add person' for extra riders — shares update live in proportion to person-kilometres.",
    "Read each person's share, the amount they pay and the 'vs equal' difference in the results table — rounded so amounts add back to the exact total — then press 'Copy result'.",
  ],
  intro:
    "This calculator settles a shared road trip by person-kilometres: each traveller pays total cost × their kilometres ÷ the sum of everyone's kilometres, so someone who joins halfway pays half the share of someone who rode the whole way. Trip cost is built as fuel (distance ÷ km/l × price per litre) plus tolls plus any other shared expense. Shares are rounded to the paisa and the remainder is pushed onto the largest share so the amounts always add back to the exact total.",
  useCases: [
    "Settling a 600 km weekend trip where two people got off at the midway city",
    "Splitting a daily office carpool where riders board at different points on the route",
    "Working out what to charge friends for fuel and tolls without arguing over who owes what",
  ],
  benefits: [
    ["Fair to partial riders", "Someone aboard for 300 km of a 600 km trip pays exactly half a full share."],
    ["Adds back to the total", "Rounding remainder is absorbed, so the collected amounts match the bill to the paisa."],
    ["Shows the equal-split gap", "See how much each person gains or loses against a flat head-count split."],
  ],
  faqs: [
    [
      "How should road trip fuel be split fairly?",
      "Split by the distance each person actually travelled, not by head count. On a ₹5,000 trip covering 600 km, two full-distance riders and one who rode 300 km share 1,500 person-km, so the full riders pay ₹2,000 each and the half rider ₹1,000.",
    ],
    [
      "Should the driver pay a share of the fuel?",
      "Most groups include the driver as a normal rider, since they are also travelling. If the car owner is absorbing wear and tear instead, leave them out of the list, or add a per-km allowance to the other-costs box and keep everyone in.",
    ],
    [
      "How do I work out the fuel cost of a trip?",
      "Divide the distance by the car's mileage in km/l to get litres, then multiply by the pump price. A 600 km trip in a car doing 15 km/l uses 40 litres, which is ₹4,000 at ₹100 a litre before tolls.",
    ],
    [
      "Should tolls be split the same way as fuel?",
      "Tolls are charged for the vehicle, not per head, so the usual approach is to pool them with fuel and split the pooled amount by person-kilometres, which this tool does. If one toll plaza sits on a stretch only some passengers rode, enter it as a separate settlement for that leg.",
    ],
  ],
};

export default seo;
