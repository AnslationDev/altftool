const seo = {
  title: "EV vs Diesel Running Cost Calculator (India)",
  metaDescription:
    "Per-km cost of an EV against a BS6 diesel, counting AdBlue dosing, each car's service rate and the distance at which the EV's price premium pays back.",
  steps: [
    "Under The electric car, fill in Usable battery (kWh), Real-world range (km), Home tariff (INR per kWh), Public charger tariff, Charging done at home (%) and Charging efficiency (%).",
    "Under The diesel car, set Mileage (km per litre), Diesel price (INR per litre), AdBlue dosing (% of fuel volume) and both maintenance rates, then enter Kilometres per year and How much more the EV costs to buy (INR).",
    "Read the Running cost gap per km, the AdBlue used per year and Total rows for each car, and the Break-even distance, which reads Never on these inputs when the diesel wins.",
  ],
  intro:
    "Diesel is the hardest engine for an electric car to beat on running cost, so a fair comparison has to count everything the diesel actually consumes. This calculator sets the EV's grid energy — battery capacity divided by real range, grossed up by charging efficiency and priced at a blend of home and public tariffs — against diesel at price divided by mileage, plus AdBlue dosed at a few percent of fuel volume on any BS6 car, plus each side's own maintenance rate, then reports the distance at which the EV's higher purchase price is repaid.",
  useCases: [
    "You drive 20,000 km a year in a 20 km/l diesel and want to know whether an EV can beat it, not just beat petrol.",
    "You are budgeting AdBlue for a BS6 diesel and want the litres per year rather than a vague 'top up occasionally'.",
    "You keep cars for four years and want to check whether the EV break-even distance arrives before you sell.",
  ],
  benefits: [
    ["AdBlue is not free", "BS6 diesels dose 2–6% of fuel volume as diesel exhaust fluid, and that line is priced separately instead of being ignored."],
    ["Honest maintenance gap", "Diesel service is genuinely dearer — DPF, injectors, costlier oil — so both cars carry their own rupees-per-km rate."],
    ["Break-even that can say no", "When the diesel wins per kilometre the tool says the premium never pays back, instead of producing a meaningless number."],
  ],
  faqs: [
    [
      "Is an EV cheaper to run than a diesel car in India?",
      "Usually, but by a much thinner margin than against petrol. A 20 km/l diesel at ₹92 a litre costs about ₹4.60 per km on fuel alone, against roughly ₹1.60 for an EV charged mostly at home — but an efficient diesel driven on expensive public charging can flip the result, which is why the tariff blend matters.",
    ],
    [
      "How much AdBlue does a BS6 diesel car use?",
      "Roughly 2–6% of the diesel burnt, so about 1 to 3 litres per 1,000 km for a typical passenger car. At 20 km/l and 4% dosing, 20,000 km a year uses around 40 litres of AdBlue — about ₹0.14 per kilometre at ₹70 a litre.",
    ],
    [
      "Is diesel maintenance more expensive than petrol or electric?",
      "Yes on both counts. A diesel carries a diesel particulate filter, high-pressure injectors, a turbo and costlier engine oil, so per-kilometre service typically runs above a petrol equivalent. An EV has no oil, filters, clutch, exhaust or spark plugs, and its regenerative braking makes pads last far longer.",
    ],
    [
      "At what annual mileage does an EV beat a diesel?",
      "It depends on the price gap divided by the per-km saving. On the tool's defaults — a ₹6 lakh premium and a ₹4.56 per km saving — break-even arrives near 131,000 km, which is about six and a half years at 20,000 km a year. Drive less and the premium may never be recovered from running cost alone.",
    ],
  ],
};

export default seo;
