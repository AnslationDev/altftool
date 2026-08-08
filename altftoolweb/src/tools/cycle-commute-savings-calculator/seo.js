const seo = {
  title: "Cycle to Work Savings Calculator: Payback and CO2",
  metaDescription:
    "Fuel or fare, parking, tolls and per-km maintenance you stop paying, less bicycle running cost — with months to payback and CO2 avoided at 2.31 kg/litre.",
  steps: [
    "Enter One-way distance (km) and Commuting days a month, then set What you are replacing to Petrol motorcycle or scooter, Petrol car, CNG car or Cab or auto-rickshaw.",
    "Edit the fuel or fare price, Parking a day (INR), Tolls or congestion charges a day (INR), Vehicle maintenance per km (INR) and Bicycle purchase cost (INR).",
    "Read Net saving a year, the Bicycle payback in months and the Emissions avoided card in kg of CO2, then press Copy result.",
  ],
  intro:
    "This calculator totals the money you stop spending when you cycle to work — fuel or fare, parking, tolls and per-kilometre vehicle maintenance — nets off what the bicycle costs to run, and reports the payback period on the bike itself. Emissions avoided come from tank-to-wheel combustion factors: 2.31 kg of CO2 per litre of petrol, 2.68 kg per litre of diesel, 2.75 kg per kilogram of CNG, and about 0.71 kg per kWh for grid electricity in India. Every default is editable, so the answer reflects your route, your vehicle and your local prices rather than an average.",
  useCases: [
    "Deciding whether a ₹25,000 hybrid bicycle is worth it for an 8 km each-way commute five days a week",
    "Comparing what a two-wheeler, a petrol car and a daily cab each cost you over the same route",
    "Putting a number on the CO2 avoided for an office sustainability report or a cycle-to-work scheme pitch",
  ],
  benefits: [
    ["Full cost, not just petrol", "Parking, tolls and maintenance often exceed the fuel bill on short trips."],
    ["Payback period", "Shows the month at which the bicycle has paid for itself out of savings."],
    ["Real emission factors", "Uses published combustion and grid factors rather than round numbers."],
  ],
  faqs: [
    [
      "How much money can I save by cycling to work?",
      "For an 8 km each-way commute 22 days a month, replacing a 45 km/l motorcycle with petrol at ₹105 a litre and ₹20 daily parking, the net saving works out to roughly ₹1,300 a month or ₹15,500 a year after bicycle running costs. A car commute over the same distance typically saves three to four times that.",
    ],
    [
      "How much CO2 does cycling instead of driving save?",
      "Burning one litre of petrol releases about 2.31 kg of CO2 and one litre of diesel about 2.68 kg, so a 352 km monthly commute on a 45 km/l motorcycle emits roughly 18 kg a month, or 217 kg a year. A petrol car covering the same distance at 14 km/l emits close to 700 kg a year.",
    ],
    [
      "How long does a commuter bicycle take to pay for itself?",
      "Divide the purchase price by your net monthly saving. A ₹25,000 bicycle against a motorcycle commute saving ₹1,300 a month pays back in about 19 months; against a car or daily cab commute it usually pays back inside six months.",
    ],
    [
      "Does an electric scooter already save enough that cycling adds little?",
      "Electric two-wheelers cut running costs to roughly ₹0.25 a kilometre in energy, so the fuel saving from switching to a bicycle is small. The remaining savings come from parking, tyres, servicing and battery depreciation, and the emissions saving depends on how carbon-intensive your electricity supply is — around 0.71 kg CO2 per kWh on the Indian grid average.",
    ],
  ],
};

export default seo;
