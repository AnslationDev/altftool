const seo = {
  title: "Vehicle Downsizing Savings: TCO, Payback and CO2",
  metaDescription:
    "Compare fuel, insurance, servicing, parking and depreciation on today's value, priced against the cabs the lost trips need. Payback and CO2 included.",
  steps: [
    "Pick Fuel type, tick 'The household runs a second vehicle today' if it applies, then fill Distance per year (km), Fuel economy (km per litre or kg), Insurance per year (₹), Service and repairs per year (₹), Parking per year (₹) and Resale value today (₹) under Vehicle you run today, Second vehicle in the household and Vehicle you would keep or buy",
    "Under Shared figures and the switch set Fuel price (₹ per litre or kg), Depreciation (% of value per year), Added cab and transit per year (₹), Price of the replacement (₹) and Cash from selling what you let go (₹)",
    "Saving per year after downsizing heads the panel, with Cost now — total per year, After — total per year, After — added cab and transit, Fuel avoided per year, CO2 avoided per year, One-time cost to switch, Payback period and Cost per km now against Cost per km after listed below; Copy result copies the comparison and Reset restores the defaults",
  ],
  intro:
    "This calculator compares the full annual cost of running your vehicles today against running one smaller vehicle instead, and reports the yearly saving, the fuel and CO2 avoided, and how long the switch takes to pay for itself. Each vehicle is costed the way a total-cost-of-ownership model does it: fuel from distance divided by fuel economy, plus insurance, maintenance, parking and depreciation charged on the vehicle's current market value rather than its original price. The trips that lose a vehicle are priced too, through an added cab or public-transport line, so the saving is not flattered by pretending they disappear.",
  useCases: [
    "Decide whether the second car that mostly sits parked is worth its insurance, servicing and depreciation.",
    "Compare a large SUV against a hatchback for the same annual distance, once depreciation and not just fuel is counted.",
    "Work out how many months of savings it takes to recover the price gap when the replacement costs more than the car you sell.",
  ],
  benefits: [
    ["Depreciation counted properly", "The largest cost of owning a car is charged on today's market value, not ignored."],
    ["Replacement trips priced in", "An added cab and transit line stops the saving from being overstated."],
    ["Payback and CO2 together", "Shows the break-even month alongside litres and kilograms of CO2 avoided."],
  ],
  faqs: [
    [
      "How much does a second car really cost per year?",
      "Even a lightly used second car carries its fixed costs in full: insurance, road-side annual maintenance, parking, and depreciation of roughly 10-15% of its current value each year. A car worth ₹6 lakh losing 12% a year is shedding ₹72,000 in value before a single litre of fuel is burnt, which is usually far more than the fuel it saves.",
    ],
    [
      "Does downsizing to a smaller car always save money?",
      "No. If the smaller car is bought new at a high price, its depreciation can exceed the fuel, insurance and servicing it saves — a newer vehicle loses more rupees per year than an older one even at the same percentage. Downsizing saves most when the replacement is already owned, or is bought used at a price close to what the outgoing car sells for.",
    ],
    [
      "How do I calculate cost per kilometre for my car?",
      "Add fuel, insurance, maintenance, parking and annual depreciation for the year, then divide by the kilometres driven in that year. Low-mileage vehicles look expensive on this measure because the fixed costs spread over few kilometres, which is exactly why a car driven under about 5,000 km a year is often cheaper to replace with cabs.",
    ],
    [
      "How much CO2 does driving one less car save?",
      "Burning a litre of petrol releases about 2.31 kg of CO2 and a litre of diesel about 2.68 kg, so the saving is the litres avoided multiplied by that factor. Cutting 250 litres a year of petrol avoids roughly 578 kg of CO2 — tank-to-wheel only, excluding the emissions from producing and delivering the fuel.",
    ],
  ],
};

export default seo;
