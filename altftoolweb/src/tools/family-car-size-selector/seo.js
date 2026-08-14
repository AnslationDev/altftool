const seo = {
  title: "Family Car Size Selector: Seats, Boot and Length",
  metaDescription:
    "Enter people, child seats and a luggage list to get the smallest body type that fits - boot needed is your luggage volume divided by 0.8 efficiency.",
  steps: [
    "Under 'Who travels', enter Adults, Children, 'Child seats side by side in one row' and 'Longest car your parking takes (m)' - or press the 4.0 m tax bracket, 4.8 m standard bay or 5.5 m open drive chip.",
    "Under 'What goes in the boot', set counts for items such as Medium check-in suitcase (70 L), Compact folding pushchair (60 L) or Golf bag (90 L), and adjust 'Packing efficiency (0.2 to 1)'.",
    "The 'Smallest body type that works' panel names the pick with its seats, usable boot and length, and the 'Every body type against your needs' table marks each option Works or prints the reason it fails; Copy result copies the recommendation.",
  ],
  intro:
    "This selector matches a car body type to the people and luggage you actually carry, then recommends the smallest one that clears every requirement. Boot volumes are published to the VDA method, which counts how many 200 × 100 × 50 mm blocks fit the space, so real suitcases never fill a boot to its rated figure — the tool divides your luggage volume by a packing efficiency of about 0.8 to get the boot you truly need. It also handles the trap most seven-seater buyers miss: with the third row upright, the boot behind it typically collapses to 150-300 litres.",
  useCases: [
    "Deciding whether a second child means moving from a hatchback to an SUV, or whether the hatchback still works.",
    "Checking whether a seven-seater can carry seven people and a week's luggage at the same time.",
    "Filtering out cars that will not fit a 4.8 m parking bay or that break India's four-metre tax threshold.",
  ],
  benefits: [
    ["Smallest adequate, not biggest", "Ranks the body types that fit by size, because surplus car costs money every year."],
    ["Third row priced honestly", "Uses the boot behind the third row whenever more than five people are travelling."],
    ["Flags the child-seat limit", "Three seats across rules out most cars — a typical bench has three belts but two ISOFIX points."],
  ],
  faqs: [
    [
      "How much boot space does a family of four need?",
      "For a week away, plan on roughly 250-350 litres of usable space: two medium suitcases and a pushchair pack to about 200 litres, and at 80% packing efficiency that needs around 250 litres of rated boot. A supermini's 300 litre boot manages it; a city car's 200 litres does not.",
    ],
    [
      "Can you fit three child seats across the back of a car?",
      "Rarely. Almost every car has three rear belts but only two ISOFIX positions, and two bulky seats leave nothing usable in the middle. Three-across works in some MPVs, van-based people carriers and a handful of wide saloons, and it depends as much on the seats as on the car — try your actual seats in the actual car before committing.",
    ],
    [
      "Is a seven-seater big enough for seven people and luggage?",
      "Usually not. With the third row upright, boot space in a seven-seat MPV or SUV typically drops to 150-300 litres, about a supermini's. Carrying seven people and a full set of cases normally means a van-based people carrier, a roof box, or a trailer.",
    ],
    [
      "Why do so many Indian cars stop just under four metres?",
      "Because passenger cars up to 4.0 metres long, with a petrol engine up to 1,200 cc or a diesel up to 1,500 cc, fall into a lower GST bracket than larger cars. That single threshold shapes the design of most mass-market Indian hatchbacks and compact SUVs. Rates change with GST notifications, so confirm the current slab before you buy.",
    ],
  ],
};

export default seo;
