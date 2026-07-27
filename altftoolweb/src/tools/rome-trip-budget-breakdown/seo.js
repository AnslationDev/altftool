const seo = {
  intro:
    "This planner prices a Rome holiday in the three buckets it is actually paid from: rupees for the return airfare, insurance and visa service charge, a euro-denominated Schengen consular fee, and euro spent on the ground for the room, food, metro, sights and shopping. Rooms are charged for nights while daily spends are charged for nights + 1 days, rooms are counted as ceil(travellers ÷ people per room), and a forex markup is applied only to the money actually spent in Italy. It separates out the two lines that surprise first-time visitors — Rome's contributo di soggiorno, charged per person per night at the property and capped at 10 consecutive nights, and the coperto that a trattoria adds per person per sitting.",
  useCases: [
    "Comparing four nights in a 4-star near Termini against a 3-star apartment in Trastevere once the per-night tourist tax and the cover charges are included.",
    "Working out how much euro cash to carry versus how much to put on a forex card before a Schengen trip.",
    "Building the funds evidence for a Schengen visa file, where the consulate wants a day-by-day cost that matches the itinerary.",
  ],
  benefits: [
    ["Tourist tax modelled properly", "Per person, per night, by hotel category, stopped at the 10-night cap and with child exemptions."],
    ["Coperto counted", "Cover charges scale with sit-down meals, not with the size of the bill, so they are computed separately."],
    ["Visa fee kept out of the markup", "The consular fee is paid in rupees at the official rate, so no card markup is applied to it."],
  ],
  faqs: [
    [
      "How much is the tourist tax in Rome?",
      "Rome charges a contributo di soggiorno per person per night, set by accommodation category and typically running from about €4 at a hostel or 1-star up to around €10 at a 5-star. It is capped at 10 consecutive nights at one property, children below 10 are exempt, and it is almost always collected in cash or card at the property rather than by the booking site — so it does not appear in the price you saw online. Rome revises the rates by council resolution, so confirm the figure on your booking confirmation.",
    ],
    [
      "What is the coperto in an Italian restaurant?",
      "It is a fixed per-person cover charge for the table setting and bread, commonly €2 to €3 a head in central Rome, and Italian law requires it to be printed on the menu. It is charged per person per sitting rather than as a percentage, so it hits a cheap lunch harder than an expensive dinner. Drinking a coffee standing at the bar or buying pizza al taglio by weight avoids it entirely, which is why the same coffee costs less al banco than at a table.",
    ],
    [
      "How much does a Rome trip cost from India for a week?",
      "On the comfort defaults here — a 3-star or central apartment shared two-up in high season, trattoria meals, metro travel and one or two paid sights a day — four nights and five days works out near ₹2.2 lakh per person, including a return economy fare, the Schengen visa fee, insurance, a 2% forex markup and a 10% buffer. A hostel-and-walking version lands closer to ₹1.2 lakh per person; a 5-star version runs past ₹4.5 lakh.",
    ],
    [
      "Is a Roma Pass or a transport pass worth buying?",
      "It depends on how many paid sights you visit. A single Rome metro or bus ticket costs €1.50 and stays valid for 100 minutes, a 24-hour pass is €7 and a 72-hour pass €18, so transport alone rarely justifies a combined pass unless you ride four or more times a day. A sightseeing pass usually pays off only if you would otherwise buy two or more full-price major-site tickets within its validity; put your real ticket plan into the daily sights field and compare. This is an informational planning estimate, not a price quote.",
    ],
  ],
};

export default seo;
