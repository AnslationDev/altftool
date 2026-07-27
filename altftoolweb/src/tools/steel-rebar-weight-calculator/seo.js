const seo = {
  intro:
    "A steel rebar weight calculator converts a bar bending schedule — diameter, length per bar and number of bars — into kilograms and tonnes of reinforcement. It uses the standard unit weight of a round bar, w = (π/4) × (d/1000)² × 7850, which reduces to the site shorthand d²/162 kg per metre and matches the IS 1786 unit-weight table exactly. Site engineers, bar benders and estimators use it to order steel, count full-length bars and price a slab or footing.",
  useCases: [
    "Converting a slab bar bending schedule of 12 mm main bars and 8 mm distribution bars into a single tonnage figure for the purchase order",
    "Working out how many 12 m stock bars to buy so the yard cuts with the least offcut",
    "Cross-checking a supplier's invoice weight against the nominal weight of the bars actually delivered",
  ],
  benefits: [
    ["Matches the standard table", "Unit weights are computed from 7850 kg/m³, so 8 mm gives 0.395 kg/m and 25 mm gives 3.85 kg/m."],
    ["Whole schedules, not one bar", "Add a row per bar mark and get per-row and total weight, length and stock-bar counts together."],
    ["Lap and offcut allowance", "A single percentage covers laps, bends, hooks and cutting waste, applied to length before weight."],
  ],
  faqs: [
    [
      "What is the formula for rebar weight per metre?",
      "Weight per metre = d² / 162.2 kilograms, where d is the nominal bar diameter in millimetres. It comes from multiplying the cross-sectional area πd²/4 by the density of steel, 7850 kg/m³; site practice usually rounds the divisor to 162.",
    ],
    [
      "How much does a 12 mm rebar weigh per metre?",
      "0.888 kg per metre, so a standard 12 m bar weighs about 10.66 kg. For the other common sizes: 8 mm is 0.395 kg/m, 10 mm is 0.617 kg/m, 16 mm is 1.58 kg/m, 20 mm is 2.47 kg/m and 25 mm is 3.85 kg/m.",
    ],
    [
      "How many 12 mm bars are there in one tonne of steel?",
      "About 94 bars of 12 m length, because each weighs 10.66 kg and 1000 / 10.66 = 93.8. For 8 mm the same tonne gives roughly 211 bars, and for 16 mm about 53.",
    ],
    [
      "What lap and wastage allowance should I add to a bar schedule?",
      "Typically 3 to 5% on top of the scheduled cut lengths for offcuts and bending waste, provided laps are already drawn into the schedule. If laps are not scheduled, add them explicitly — a tension lap is commonly specified at around 50 times the bar diameter, but the exact figure must come from the structural drawing.",
    ],
  ],
};

export default seo;
