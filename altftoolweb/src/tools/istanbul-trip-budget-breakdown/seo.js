const seo = {
  title: "Istanbul Trip Budget: Lira & Rupee Breakdown",
  metaDescription:
    "Price flights, stay, food, Istanbulkart rides and sights in lira and rupees, with a drift factor that nets Turkish inflation against the lira's fall.",
  steps: [
    "Choose Travel style (sets the starting rates) — Backpacker, Comfort or Premium — then Season (moves the room rate), How you pay in Türkiye with its markup percentage, Travellers and Nights in Istanbul",
    "Enter Rupees per 1 lira (today's rate), Months until you travel, Turkish price inflation (% a month) and Lira fall against the rupee (% a month), then adjust the line rates: Room rate per night (₺), Istanbulkart rides per person per day, Fare per Istanbulkart ride (₺) and Contingency buffer (%)",
    "Total trip cost updates above a Line / Lira / Rupees / Share table, with Drift factor to travel date, Cost of that drift, Effective rate after markup and drift and Lira to budget on the ground listed below; Copy result copies the breakdown and Reset restores the defaults",
  ],
  intro:
    "This planner prices an Istanbul trip in lira for everything spent on the ground — room, food, Istanbulkart rides, sights and the bazaars — and in rupees for the flights, e-Visa and insurance, then converts the lira half at the rate you will actually get. It adds a step ordinary trip budgets skip: a drift factor of (1 + monthly inflation)^months ÷ (1 + monthly lira depreciation)^months, which nets Turkish price rises against the lira's fall so that a quote read today still means something on the day you travel. Transport is modelled as rides × fare plus the one-off card price, because that is how Istanbul actually charges.",
  useCases: [
    "Costing a trip booked six months out, when today's lira menu prices will not be the prices you pay.",
    "Deciding whether to pay the hotel now in lira or on arrival, by seeing which way the net drift runs.",
    "Comparing four days on the Istanbulkart against a taxi-heavy itinerary, ride by ride.",
  ],
  benefits: [
    ["Inflation and currency netted", "Turkish price rises and the lira's slide are applied together, so only the real change shows."],
    ["Transport priced per ride", "Rides × fare plus the card purchase, not a vague daily figure."],
    ["Rupee and lira side by side", "Every line shows both, so you know how much lira to actually carry."],
  ],
  faqs: [
    [
      "How much does an Istanbul trip cost from India?",
      "On the comfort defaults here — a 4-star in Sultanahmet or Beyoğlu shared two-up in the busy shoulder season, restaurant meals, four Istanbulkart rides a day and one or two paid sights — four nights and five days works out near ₹1.06 lakh per person including a return economy fare, the e-Visa, a 2% forex markup and a 10% buffer. A hostel-and-lokanta version lands closer to ₹54,000 per person; a Bosphorus 5-star version runs past ₹2.5 lakh.",
    ],
    [
      "Does Turkish inflation make my Istanbul trip more expensive?",
      "Only to the extent that prices rise faster than the lira falls. If Turkish prices climb 2.5% a month while the lira loses 2% a month against the rupee, the same basket costs about 0.5% more each month in rupee terms — roughly 6% over a year, not the headline inflation number. That is why this tool asks for both figures and reports only the net drift; when the two run at the same pace the rupee cost is unchanged.",
    ],
    [
      "Do I need an Istanbulkart, and how does it work?",
      "Yes, for anything beyond a couple of journeys. You buy the card once from a machine at any metro or tram station, load credit onto it, and tap for each metro, tram, bus, funicular, Marmaray or public ferry ride. Transfers made within two hours of the first tap are charged at a reduced rate, and a single card can be tapped several times to pay for a group, so one card between two people works. The public Bosphorus ferry is a normal ride on the same card, at a fraction of the price of a tourist cruise.",
    ],
    [
      "Do Indians need a visa for Türkiye?",
      "Yes. Indian passport holders need either an e-Visa or a sticker visa from a Turkish consulate, and eligibility for the online e-Visa is conditional — it generally requires holding a valid visa or residence permit from a Schengen country, the United States, the United Kingdom or Ireland, along with a confirmed hotel booking and return ticket. Fees and conditions are revised, so check the official e-Visa portal before you book flights, and treat the figures here as informational planning estimates.",
    ],
  ],
};

export default seo;
