// Western honey bee — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const westernHoneyBee = {
  slug: "western-honey-bee",
  category: "insects",
  name: "Western Honey Bee",
  scientificName: "Apis mellifera",
  otherNames: ["European honey bee", "Common honey bee"],

  summary:
    "A farmed insect that most people mistake for threatened wildlife: there are more honey bee hives on Earth than at any point in history, while the wild bees they are often kept to 'save' are the ones actually disappearing.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Apis_mellifera_Western_honey_bee.jpg/1920px-Apis_mellifera_Western_honey_bee.jpg",
    alt: "A western honey bee foraging on a yellow flower with pollen packed onto its hind leg",
    credit: "Andreas Trepte / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/20-20-044-honey-bee.jpg/1920px-20-20-044-honey-bee.jpg",
      alt: "A western honey bee worker seen close up, its amber and black abdomen covered in fine hairs",
      credit: "Dsdugan / Wikimedia Commons",
      title: "An animal shaped like a brush",
      caption:
        "Almost every surface of a honey bee is covered in branched hairs, and a foraging bee builds up a positive electrostatic charge in flight, so pollen jumps onto her before she has touched anything. She then combs it into the flattened baskets on her hind legs — which is why a bee that set out to drink nectar ends up moving pollen for a living.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/2011-06-28-apis.jpg/1920px-2011-06-28-apis.jpg",
      alt: "A honey bee drinking at the wet edge of a river",
      credit: "Thomas Bresson / Wikimedia Commons",
      title: "Water is a colony resource",
      caption:
        "Foragers collect water as deliberately as they collect nectar. It is spread in thin films inside the nest and fanned to cool the brood on hot days, and used to thin crystallised honey so it can be fed to larvae. A colony that loses access to water in a heatwave overheats long before it goes hungry.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/2014-12-26_11_17_25_European_Honey_Bee_on_a_security_camera_in_Ewing%2C_New_Jersey.JPG/1920px-2014-12-26_11_17_25_European_Honey_Bee_on_a_security_camera_in_Ewing%2C_New_Jersey.JPG",
      alt: "A honey bee resting on the casing of an outdoor security camera in New Jersey",
      credit: "Famartin / Wikimedia Commons",
      title: "A species carried everywhere",
      caption:
        "Apis mellifera is native to Europe, Africa and western Asia and nowhere else. Every honey bee in the Americas, Australia and East Asia descends from colonies people shipped there, which is why finding one on a suburban wall in New Jersey is a fact about human history rather than about North American ecology.",
    },
  ],

  headline: "Livestock the world mistook for wildlife",
  intro: [
    "The western honey bee is the most intensively managed insect on the planet. Roughly 102 million hives were kept worldwide in 2024 — about half as many again as in 1990 — and the species has been carried to every continent except Antarctica by people who wanted honey, wax and crop pollination.",
    "That is why the familiar slogan does not survive contact with the numbers. Honey bees are not in decline as a species; individual colonies die at painful rates and beekeepers replace them, which is a livestock problem rather than an extinction problem. The pollinators genuinely in trouble are the roughly 20,000 species of wild bee that nobody farms, and honey bees can make their situation worse by competing with them for flowers.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Hymenoptera",
    family: "Apidae",
    genus: "Apis",
    species: "Apis mellifera",
  },

  conservation: {
    status: "DD",
    assessmentYear: 2025,
    populationTrend: "increasing where managed, declining where free-living",
    populationEstimate:
      "About 102 million managed hives worldwide in 2024, roughly 47% more than in 1990; the number of genuinely wild, self-sustaining colonies is unknown",
    note: "The Red List entry is a European regional assessment rather than a global one, and it is about wild, free-living colonies — not hives. The 2025 reassessment listed the wild population of the EU-27 as Endangered, because free-living colonies there have declined enough to meet the criteria, while the wider European region stayed Data Deficient: too little is known about which colonies survive unaided rather than being escaped swarms from apiaries. Nothing in the assessment suggests the managed population is at risk.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length (worker)",
      value: "10–15 mm",
      min: 10,
      max: 15,
      unit: "mm",
      note: "Queens reach 18–20 mm and drones 15–17 mm",
    },
    {
      key: "weight",
      label: "Weight (worker)",
      value: "About 90–120 mg",
      min: 90,
      max: 120,
      unit: "mg",
      note: "A returning forager may carry 20–50 mg of nectar in her crop",
    },
    {
      key: "flight-speed",
      label: "Flight speed",
      value: "About 23–27 km/h",
      min: 23,
      max: 27,
      unit: "km/h",
      note: "Measured ground speeds of 7.5 m/s unloaded and 6.5 m/s carrying a load",
    },
    {
      key: "wingbeat-rate",
      label: "Wingbeat rate",
      value: "Around 230 beats per second",
      min: 208,
      max: 277,
      unit: "Hz",
      note: "Achieved with an unusually small stroke amplitude of about 90 degrees",
    },
    {
      key: "foraging-range",
      label: "Foraging range",
      value: "Usually within 3 km of the hive",
      min: 3,
      max: 13,
      unit: "km",
      note: "Foragers will travel 8–13 km when nearby forage fails",
    },
    {
      key: "colony-size",
      label: "Colony size",
      value: "20,000–60,000 workers in summer",
      min: 20000,
      max: 60000,
      unit: "bees",
    },
    {
      key: "eggs-laid",
      label: "Eggs laid per day (queen)",
      value: "Up to about 1,500",
      min: 1000,
      max: 1500,
      unit: "eggs",
      note: "Around 250,000 in a year, and potentially more than a million over a long life",
    },
    {
      key: "lifespan-worker",
      label: "Lifespan (worker)",
      value: "About 6 weeks in summer",
      min: 4,
      max: 6,
      unit: "weeks",
      note: "Autumn-reared workers live through the winter, up to about six months; a queen lives two to five years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Nectar and pollen", icon: "Flower" },
    { key: "social-structure", label: "Social structure", value: "Eusocial colony with a single queen", icon: "Users" },
    { key: "activity", label: "Activity", value: "Diurnal foragers; colony never dormant", icon: "Sun" },
    { key: "communication", label: "Communication", value: "Waggle dance encoding direction and distance", icon: "Compass" },
    { key: "defence", label: "Defence", value: "Barbed sting that kills the worker who uses it", icon: "ShieldAlert" },
    { key: "ecological-role", label: "Ecological role", value: "Managed crop pollinator", icon: "Sprout" },
  ],

  highlights: ["colony-size", "foraging-range", "wingbeat-rate", "communication"],

  distribution: {
    continents: ["Europe", "Africa", "Asia", "North America", "South America", "Australia"],
    regions: [
      "Native range across Europe, Africa and western Asia",
      "Introduced throughout the Americas from the early 1600s",
      "Introduced to Australia, New Zealand and East Asia",
      "Africanised populations across Central and southern North America",
    ],
    habitats: [
      "Meadow and grassland",
      "Woodland edge",
      "Farmland and orchards",
      "Gardens and urban green space",
      "Managed apiaries",
    ],
    elevation:
      "Sea level to high mountain valleys — the limit is forage and winter severity rather than altitude itself",
    note: "Thirty-one subspecies are recognised across the native range, adapted to conditions from Scandinavian winters to the Sahel. Commercial beekeeping has moved a handful of those lineages worldwide and hybridised many of the rest, so locally adapted wild stock is now one of the harder things to find.",
  },

  sections: [
    {
      id: "colony",
      title: "One animal made of sixty thousand bodies",
      body: [
        "A honey bee colony behaves less like a group of insects than like a single organism. The queen is not a ruler but an ovary: at peak she lays up to about 1,500 eggs a day, more than her own body weight, and does almost nothing else. Drones exist only to mate and are thrown out of the hive when the nectar flow ends. Everything that looks like decision-making is done by the workers.",
        "A worker's job is set mainly by her age. She spends her first days cleaning cells, then feeds larvae, then handles incoming nectar, builds comb, guards the entrance and fans to ventilate — and only in the last stretch of her life does she leave the hive to forage. That progression means the most dangerous work is done by the bees with the least life left to lose.",
        "Collectively the colony holds its brood nest near 34–35 °C all year, warming it by shivering flight muscles and cooling it by fanning over films of water. Temperature regulation this precise is otherwise a vertebrate trait, and it is the reason a colony can survive a northern winter as a cluster of insects that individually cannot.",
      ],
    },
    {
      id: "dance",
      title: "The waggle dance",
      body: [
        "A forager that finds a worthwhile flower patch returns to the dark interior of the nest and walks a figure of eight across the vertical comb, waggling her abdomen through the straight run. Karl von Frisch worked out what the movement means and was awarded a share of the 1973 Nobel Prize in Physiology or Medicine for it.",
        "The angle of the straight run relative to vertical gives the direction of the food relative to the sun. The duration of the run gives the distance — roughly 75 milliseconds of waggling per 100 metres of flight. Bees crowding around the dancer read it by touch and vibration rather than sight, then fly out and find the patch.",
        "The system is not perfect and it is not meant to be. The encoding flattens out beyond a kilometre or so, and recruits scatter around the advertised point, which spreads the colony's search rather than funnelling every bee onto one patch. It remains the only known case of an invertebrate communicating an abstract location symbolically.",
      ],
    },
    {
      id: "livestock",
      title: "Why 'save the bees' points at the wrong bee",
      body: [
        "Honey bees are domesticated animals kept in boxes, moved by truck between crops, fed sugar syrup, medicated against parasites and requeened when they underperform. Globally their numbers have risen for decades. The Xerces Society, which has spent half a century on invertebrate conservation, puts it plainly: keeping honey bees to save the bees is like keeping chickens to save the birds.",
        "The pollinators that need help are the wild ones. IPBES counts around 20,000 wild bee species alongside pollinating butterflies, moths, beetles, flies, birds and bats, and it is among these — solitary ground-nesters, bumblebees, specialists tied to a single plant family — that regional declines and extinctions are documented. Around 75% of the world's leading food crops depend at least partly on animal pollination, and the crops rising fastest in area are the pollinator-dependent ones.",
        "Dense apiaries can actively harm those species by stripping nectar and pollen from a shared landscape and by spreading pathogens into wild populations. This does not make beekeeping wrong; it makes it agriculture. Habitat — flowering margins, undisturbed nesting ground, fewer pesticides — is what helps wild pollinators, and a new hive is not a substitute for it.",
      ],
    },
    {
      id: "losses",
      title: "What is actually going wrong in the hives",
      body: [
        "The real crisis in beekeeping is colony mortality. Managed colonies in Europe and North America die over winter at rates beekeepers consider unsustainable, and the losses are made good by splitting surviving colonies — so the hive count holds up while the underlying animal keeps failing.",
        "The dominant cause is the parasitic mite Varroa destructor, which jumped from the Asian honey bee and feeds on developing bees while transmitting deformed wing virus and other pathogens. An untreated colony in most of the world dies within a few years. Layered on top of that are pesticide exposure, poor and monotonous forage across intensively farmed land, long-distance transport for pollination contracts, and a narrow commercial gene pool.",
        "The wild side of the species faces the same pressures without any of the management. That is what the 2025 European assessment recognised when it listed the EU's free-living population as Endangered while leaving the wider region Data Deficient — an admission that nobody yet knows how many colonies out there are surviving on their own.",
      ],
    },
  ],

  related: ["monarch-butterfly", "atlas-moth", "hercules-beetle"],
  tags: ["bee", "pollinator", "eusocial", "hymenoptera", "agriculture", "domesticated"],
  searchTerms: ["apis mellifera", "european honey bee", "honeybee", "save the bees", "waggle dance", "colony collapse disorder"],

  faqs: [
    {
      q: "Are honey bees endangered?",
      a: "Not as a species. There are roughly 102 million managed hives worldwide, about 47% more than in 1990, and honey bees are farmed and replaced like other livestock. The IUCN listing that people usually mean is a European regional assessment of wild, free-living colonies: those were classed as Endangered in the EU-27 in 2025, while the wider European region remains Data Deficient. Managed colonies are not the population at risk.",
    },
    {
      q: "If honey bees are fine, which bees are actually in trouble?",
      a: "The wild ones. IPBES counts around 20,000 species of wild bee, along with pollinating butterflies, moths, beetles, flies, birds and bats, and it is among these that documented declines and extinctions sit — bumblebees, solitary ground-nesting species and specialists tied to particular plants. They are not farmed, so nobody replaces them when they disappear.",
    },
    {
      q: "Does keeping a beehive help pollinators?",
      a: "Usually not, and it can hurt. A hive adds tens of thousands of foragers to a landscape with a fixed amount of nectar and pollen, competing with wild bees and potentially spreading pathogens into them. Planting varied flowering habitat that blooms across the whole season, leaving undisturbed bare ground and dead stems for nesting, and cutting pesticide use all help wild pollinators in a way that another hive does not.",
    },
    {
      q: "What is the waggle dance and how does it work?",
      a: "It is how a returning forager tells the colony where food is. She walks a figure of eight on the vertical comb, and the straight waggling run carries the message: its angle from vertical gives the direction of the food relative to the sun, and its duration gives the distance, at roughly 75 milliseconds per 100 metres. Bees around her read it by touch and vibration in complete darkness. Karl von Frisch decoded it and shared the 1973 Nobel Prize in Physiology or Medicine for the work.",
    },
    {
      q: "Why does a honey bee die after it stings you?",
      a: "A worker's sting is barbed, so in mammal skin it lodges and tears free along with the venom sac and part of her abdomen when she pulls away. She dies within minutes. The barbs are not a design flaw — against other insects, which is what most colony defence is really about, the sting withdraws cleanly and the bee survives. Queens have smooth stings and can use them repeatedly.",
    },
  ],

  seo: {
    title: "Western Honey Bee — Colony Life, Waggle Dance & the 'Save the Bees' Myth",
    description:
      "A researched profile of the western honey bee (Apis mellifera): how a colony of 60,000 works as one animal, how the waggle dance encodes direction and distance, and why farmed honey bees are not the pollinators in decline.",
    keywords: [
      "western honey bee facts",
      "apis mellifera",
      "waggle dance",
      "are honey bees endangered",
      "honey bee colony",
    ],
  },

  sources: [
    {
      label: "Apis mellifera — Red List assessment (European regional)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/42463639/277757621",
    },
    {
      label: "New IUCN Red List status of wild honey bees",
      publisher: "COLOSS / Honey Bee Watch",
      url: "https://coloss.org/articles/8629/",
    },
    {
      label: "Assessment report on pollinators, pollination and food production",
      publisher: "IPBES",
      url: "https://www.ipbes.net/assessment-reports/pollinators",
    },
    {
      label: "Want to save the bees? Focus on habitat, not honey bees",
      publisher: "Xerces Society for Invertebrate Conservation",
      url: "https://xerces.org/blog/want-to-save-bees-focus-on-habitat-not-honey-bees",
    },
    {
      label: "The colony and its organization",
      publisher: "Mid-Atlantic Apiculture Research and Extension Consortium",
      url: "https://canr.udel.edu/maarec/honey-bee-biology/the-colony-and-its-organization/",
    },
    {
      label: "Bee colonies: worldwide population on the rise (FAO data)",
      publisher: "German Federal Statistical Office (Destatis)",
      url: "https://www.destatis.de/EN/Themes/Countries-Regions/International-Statistics/Data-Topic/AgricultureForestryFisheries/Bees.html",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default westernHoneyBee;
