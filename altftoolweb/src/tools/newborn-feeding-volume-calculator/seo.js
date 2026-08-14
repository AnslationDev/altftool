const seo = {
  title: "Newborn Feeding Volume Calculator: mL Per Feed",
  metaDescription:
    "Weight, day of life and feeds per day give mL per feed and per 24 hours on the standard mL/kg/day ramp, checked against newborn stomach capacity.",
  steps: [
    "Enter the baby's current weight in kg, the day of life (1 = day of birth) and the feeds in 24 hours — the 6, 7, 8, 10 and 12 feeds buttons set the count in one tap.",
    "Leave \"Prescribed intake (mL/kg/day, optional)\" blank to use the standard first-week ramp, or type the mL/kg/day figure your paediatrician gave you.",
    "Read the estimated volume per feed in mL and fl oz, the total in 24 hours, the typical daily and per-feed ranges, the feed interval, and the stomach-capacity check for that day of life.",
  ],
  intro:
    "This calculator estimates how much milk a term newborn takes in 24 hours and at each feed, using the standard paediatric rule of weight in kilograms multiplied by a daily intake in mL/kg/day, then divided by the number of feeds. It follows the usual first-week ramp — about 60 mL/kg on day 1 rising to 150 mL/kg by day 7 — and settles at roughly 150 mL/kg/day (working range 120-180) for a term infant under six months. It is a planning and sanity-check figure for bottle or expressed feeds, not a prescription.",
  useCases: [
    "Working out roughly how many millilitres to put in each bottle for a 3.5 kg two-week-old fed eight times a day",
    "Checking whether a night-shift plan of six larger feeds is still within the same daily total as eight smaller ones",
    "Converting a paediatrician's prescribed mL/kg/day into a per-bottle figure you can measure",
  ],
  benefits: [
    ["Day-of-life aware", "Uses the first-week ramp instead of one flat number for every newborn."],
    ["Per feed and per day", "Shows the bottle size and the 24-hour total side by side, in mL and fl oz."],
    ["Sanity checks built in", "Flags feeds above newborn stomach capacity and the 960 mL daily ceiling."],
  ],
  faqs: [
    [
      "How much milk should a newborn drink per feed?",
      "Divide the daily requirement by the number of feeds: a 3.5 kg baby past the first week needs about 150 mL/kg/day, so 525 mL in 24 hours, or roughly 65 mL per feed across eight feeds. In the first week the daily figure is lower, starting near 60 mL/kg on day 1.",
    ],
    [
      "What is the 150 mL per kg per day rule?",
      "It is the standard maintenance intake for a healthy term infant under six months: multiply the baby's weight in kilograms by 150 to get the millilitres needed in 24 hours. The accepted working range is about 120-180 mL/kg/day, and preterm or unwell babies are fed to a plan set by their medical team instead.",
    ],
    [
      "How big is a newborn's stomach?",
      "About 5-7 mL on day 1 — roughly a cherry — rising to 22-27 mL by day 3, 45-60 mL by day 7 and 80-150 mL by one month. That is why very early feeds are small and frequent, and why a large calculated per-feed volume in the first days usually means the feeds should be split up.",
    ],
    [
      "Does this apply to breastfed babies?",
      "No. Breastfed babies feed to appetite and intake is not measured in millilitres — feeding is judged by wet nappies, stool pattern and weight gain. The calculator is useful for bottle or expressed feeds, and for understanding the scale of a prescribed volume. Any concern about intake or weight gain should go to a paediatrician, midwife or lactation consultant.",
    ],
  ],
};

export default seo;
