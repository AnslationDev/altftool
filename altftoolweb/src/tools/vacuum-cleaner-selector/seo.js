const seo = {
  title: "Vacuum Suction Calculator: Air Watts, Pa and HEPA",
  metaDescription:
    "Enter floor area, carpet pile, pets and allergies to get a machine type, minimum air watts and pascals, filtration grade, bin size and battery runtime.",
  steps: [
    "Enter Floor area to clean with Area unit set to Square metres (m²) or Square feet (ft²), then choose Dominant flooring from hard floors to high-pile, shag or deep wool carpet.",
    "Set Pets in the home, Levels to clean and Machine preference, and tick 'Someone in the home has allergies or asthma'; the recommendation updates with no calculate button.",
    "Read the Recommended machine plus Minimum suction in AW and Pa, Filtration, Bin or bag capacity and Battery runtime needed in 40-minute packs, then press Copy result or Reset.",
  ],
  intro:
    "This selector converts your floor area, pile depth, pet load and allergy status into a concrete vacuum specification: machine type, minimum suction in both air watts and pascals, filtration grade, bin capacity and the battery runtime the home actually needs. Air watts follow the ASTM F558 definition — 0.117254 × airflow in CFM × sealed suction in inches of water — while pascals describe sealed suction alone, which is why cordless and corded machines are given separate targets. It is written for anyone comparing spec sheets who wants to know which numbers matter for their floors rather than which brand markets hardest.",
  useCases: [
    "Deciding between a cordless stick and a corded upright before buying, for a two-storey home with wall-to-wall carpet",
    "Working out how many spare batteries a cordless vacuum needs to finish a whole floor in one charge",
    "Setting a minimum suction and HEPA filtration figure to filter product listings when someone in the house has asthma",
  ],
  benefits: [
    [
      "Both suction scales",
      "Gives an air-watt target for corded machines and a pascal target for stick vacuums, instead of pretending one converts into the other.",
    ],
    [
      "Runtime you can trust",
      "Sizes batteries from real standard-power minutes with a motorised head, not the eco-mode headline figure on the box.",
    ],
    [
      "Pile depth drives the answer",
      "Deep carpet needs roughly three times the suction of a tiled floor, so flooring — not home size — sets the power target.",
    ],
  ],
  faqs: [
    [
      "How much suction do I need for carpet?",
      "Plan on about 170 air watts for medium-pile wall-to-wall carpet and around 220 air watts for high-pile or shag, against roughly 80 air watts for hard floors. Add about 15% for one shedding pet and 30% for several, because hair has to be lifted out of the pile rather than swept off the surface.",
    ],
    [
      "Is a higher Pa rating better than a higher air watt rating?",
      "They measure different things, so neither replaces the other. Pascals measure sealed suction with the hose blocked, while air watts combine suction with airflow at the head — a vacuum can post a big pascal number and still clean poorly if airflow is low. Compare Pa against Pa on cordless sticks and AW against AW on corded machines.",
    ],
    [
      "Do I really need a HEPA vacuum for allergies?",
      "A true H13 HEPA filter captures 99.95% of particles at 0.3 µm under EN 1822, which is the size range dust-mite allergen and pet dander fall into. The filter only helps if the whole machine is a sealed system, otherwise air bypasses it through body gaps; bagged models also empty far more cleanly. Discuss persistent symptoms with a doctor rather than relying on an appliance alone.",
    ],
    [
      "How long does a cordless vacuum battery actually last?",
      "Roughly 40 minutes on the standard setting with a motorised head fitted, even when the box advertises 60. Boost mode typically cuts that to 8-12 minutes, so a home needing more than about 40 minutes of cleaning per session realistically needs a second battery or a corded machine.",
    ],
  ],
};

export default seo;
