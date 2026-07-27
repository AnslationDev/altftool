const seo = {
  intro:
    "This calculator converts a daily office commute into monthly and yearly running cost using the basic fuel identity: litres = distance ÷ mileage in km/l, and fuel cost = litres × pump price. It adds toll and parking paid per commute day, and converts weekly commute days to monthly using the calendar average of 4.33 weeks per month rather than a rounded four. The result is the all-in cost per km, per day, per month and per year for anyone deciding between driving, carpooling, public transport or a change of vehicle.",
  useCases: [
    "Checking whether a job offer 24 km away is worth it after fuel, toll and parking",
    "Costing a five-day office week against a hybrid three-day week before committing",
    "Comparing your current 16 km/l car with a 20 km/l or CNG alternative on the same route",
  ],
  benefits: [
    ["Real mileage, not brochure mileage", "Uses the km/l you actually get, so the monthly figure matches your pump bills."],
    ["Toll and parking included", "Daily gate charges are counted per commute day, not ignored as rounding."],
    ["Annual view", "Shows the yearly number that makes a vehicle or route change easy to justify."],
  ],
  faqs: [
    [
      "How do I calculate my monthly commute fuel cost?",
      "Multiply the daily distance by commute days in the month, divide by your mileage in km/l, then multiply by the fuel price. For a 36 km round trip at 16 km/l on 21.67 days a month with fuel at ₹105/l, that is 780 km ÷ 16 = 48.75 litres, or about ₹5,119 a month.",
    ],
    [
      "How many commute days are there in a month?",
      "A five-day week averages 21.67 commute days a month, because a year has 52 weeks spread over 12 months (52 ÷ 12 = 4.33 weeks). Using 22 days overstates a full year of commuting by roughly 4 days, and using 20 understates it.",
    ],
    [
      "What is a fair fuel cost per kilometre?",
      "Fuel cost per km is simply the pump price divided by your mileage. At ₹105 a litre, a car doing 16 km/l costs ₹6.56 per km in fuel, a 45 km/l motorcycle costs ₹2.33 per km, and toll or parking is added on top per commute day.",
    ],
    [
      "Does this include the full cost of running my car?",
      "No — it covers fuel, toll and parking only. Insurance, periodic service, tyres, and depreciation typically add a similar amount again over a year, so treat this as the variable running cost rather than total cost of ownership.",
    ],
  ],
};

export default seo;
