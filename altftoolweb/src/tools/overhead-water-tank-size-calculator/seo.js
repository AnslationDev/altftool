const seo = {
  title: "Overhead Water Tank Size Calculator (IS 1172 Litres)",
  metaDescription:
    "Turn residents at IS 1172's 135 LPCD plus garden and car-wash use into litres for the roof tank and sump, rounded up to standard tank sizes.",
  steps: [
    "Enter household demand — 'Number of residents', 'Litres per person per day' (default 135), 'Garden / plants per day (L)' and 'Vehicle washing per day (L)'.",
    "Set 'Days of storage to keep' (0.5 to 14) and 'Share held overhead (%)', or tap a 'Per-capita demand presets' button to load a standard LPCD figure.",
    "Read 'Overhead tank to install' with the next standard size to buy, the 'Underground sump required' row and the volume in m³ and cu ft, then use 'Copy result'.",
  ],
  intro:
    "An overhead water tank size calculator converts your household's daily water demand into the number of litres the roof tank and the underground sump each need to hold. It multiplies residents by a litres-per-capita-per-day figure — 135 LPCD is the IS 1172:1993 minimum for a home with a full flushing system — adds garden and vehicle washing, multiplies by the days of storage you want in hand, then splits that total between overhead and sump and rounds up to the nearest tank sold off the shelf.",
  useCases: [
    "Choosing between a 1,000 L and a 1,500 L roof tank for a four-person family before the plumber orders it",
    "Sizing a sump for a house in an area where the municipal supply runs for only an hour every second day",
    "Checking whether an existing tank can cover a two-day supply cut once garden watering and car washing are counted",
  ],
  benefits: [
    ["Standard-backed demand", "Uses the IS 1172 and CPHEEO per-capita figures rather than a guess."],
    ["Overhead and sump split", "Shows both volumes so you can order the pair together."],
    ["Catalogue sizes", "Rounds the requirement up to the nearest tank actually on sale."],
  ],
  faqs: [
    [
      "What size water tank do I need for a family of 4?",
      "At the IS 1172:1993 minimum of 135 litres per person per day, four people use about 540 litres a day, so a 500-750 litre overhead tank covers roughly one day. Most Indian homes fit a 1,000 litre roof tank because garden watering, vehicle washing and guests push real demand past the minimum, and because supply cuts are common.",
    ],
    [
      "How many litres of water does one person use per day in India?",
      "IS 1172:1993 sets a minimum of 135 litres per capita per day for residences with a full flushing system, split roughly as 55 L bathing, 30 L flushing, 20 L washing clothes, 10 L utensils, 10 L cleaning and 10 L drinking and cooking. The CPHEEO manual allows 70 LPCD where there is piped supply but no sewerage, and 150-200 LPCD in metropolitan cities.",
    ],
    [
      "Should the sump be bigger than the overhead tank?",
      "Usually yes. Common practice is to hold about a third to a half of total storage overhead and the rest in the sump, because the sump is cheap to enlarge underground while every extra litre on the roof adds dead load to the slab. A full 1,000 litre tank weighs about a tonne once you include the tank and its stand.",
    ],
    [
      "How do I convert tank litres into feet for a masonry tank?",
      "One cubic foot holds 28.32 litres and one cubic metre holds 1,000 litres, so a 1,000 litre tank is 1 m³ or about 35.3 cubic feet. Add roughly 15 cm of freeboard above the design water level for the inlet, ball valve and air gap when you set the internal height.",
    ],
  ],
};

export default seo;
