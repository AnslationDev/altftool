const seo = {
  title: "Deep Freezer Size Selector: Litres and Holdover Hours",
  metaDescription:
    "Converts household size or kg of food into gross litres at 0.56 kg/L, allows 80% chest or 70% upright packing, and gives holdover hours in a power cut.",
  steps: [
    "Set Size it by to Household size or Weight of food to store, then give People in the household with a Buying habit, or the kilograms.",
    "Pick Freezer style — Chest freezer (lid on top) or Upright freezer (front door, baskets) — and set Power backup wanted (hours).",
    "Read the litres to buy with Packed food it holds, Safe holdover in a power cut and the battery bank in Ah, then press Copy result.",
  ],
  intro:
    "This selector converts either household head-count or a weight of food into the deep freezer capacity you should buy, using the standard storage density of 35 lb of packed food per cubic foot — 0.56 kg per litre — and an allowance of 1.5 cubic feet per person. It then divides by packing efficiency (about 80% in a chest freezer, 70% in an upright) to get gross litres, and reports how long the load stays frozen in a power cut under USDA guidance of 48 hours full and 24 hours half-full. Written for households comparing 200 L against 300 L cabinets and for small shops sizing frozen stock.",
  useCases: [
    "Choosing between a 200 L and a 300 L chest freezer for a family of four that bulk-buys meat monthly",
    "Sizing a freezer for a small shop that must hold a known weight of frozen stock",
    "Working out the battery bank and inverter VA needed to keep the freezer cold through a four-hour outage",
  ],
  benefits: [
    [
      "Gross versus usable",
      "Advertised litres are not storage litres — baskets, walls and air gaps take 20-30%, and the answer accounts for that.",
    ],
    [
      "Outage holdover",
      "Reports the safe hours without power at your actual fill level, since a half-empty freezer thaws twice as fast.",
    ],
    [
      "Backup sizing included",
      "Gives the battery amp-hours and the inverter VA needed for the compressor's start-up surge, not just its running watts.",
    ],
  ],
  faqs: [
    [
      "What size deep freezer do I need for a family of 4?",
      "About 250 litres gross for moderate bulk buying. The standard allowance is 1.5 cubic feet (42.5 L) of storage per person, so four people need about 170 usable litres, which becomes roughly 212 gross litres once chest-freezer packing efficiency of 80% is applied — putting a 250 L cabinet in the right place.",
    ],
    [
      "How much food fits in a 200 litre freezer?",
      "Roughly 90 kg of packed food. Usable volume in a chest freezer is about 80% of the advertised litres, so 200 L gives 160 usable litres, and packed food stores at about 0.56 kg per litre — the standard 35 lb per cubic foot figure.",
    ],
    [
      "How long will a deep freezer stay frozen without power?",
      "About 48 hours if it is full and the lid stays closed, and about 24 hours if it is half full, per USDA Food Safety and Inspection Service guidance. Every opening resets the clock, which is why keeping the freezer at least two-thirds full is both cheaper to run and safer in an outage.",
    ],
    [
      "Is a chest freezer better than an upright?",
      "For running cost and outage resilience, yes. Cold air falls out of an upright every time the door opens, and its baskets and shelves cut usable volume to about 70% against 80% in a chest. Uprights win on floor space and on reaching items without unpacking the whole cabinet.",
    ],
  ],
};

export default seo;
