// Leatherback sea turtle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const leatherbackSeaTurtle = {
  slug: "leatherback-sea-turtle",
  category: "reptiles",
  name: "Leatherback Sea Turtle",
  scientificName: "Dermochelys coriacea",
  otherNames: ["Leathery turtle", "Lute turtle", "Tinglar", "Baula"],

  summary:
    "The largest turtle on Earth and the only one without a hard shell, a jellyfish specialist that keeps itself warm in near-freezing water and dives deeper than most whales.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Leatherback_sea_turtle_Tinglar%2C_USVI_%285839996547%29.jpg",
    alt: "A leatherback sea turtle at Sandy Point National Wildlife Refuge, US Virgin Islands",
    credit: "U.S. Fish and Wildlife Service Southeast Region / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Close_up_of_dermochelys_coriacea_leatherback_turtle.jpg/1920px-Close_up_of_dermochelys_coriacea_leatherback_turtle.jpg",
      alt: "A close-up view of a leatherback sea turtle",
      credit: "Rabon David, U.S. Fish and Wildlife Service / Wikimedia Commons",
      title: "Skin where a shell should be",
      caption:
        "There are no horny scutes. The carapace is a layer of tough, oil-saturated skin over a mosaic of thousands of small bones — flexible enough to deform under pressure, which is part of how the species dives past a kilometre.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Dermochelys_coriacea_Leatherback_Turtle_returning_to_the_sea_after_laying_-_panoramio.jpg",
      alt: "A leatherback turtle crawling back down a beach towards the sea after nesting",
      credit: "Marco Farouk Basir / Wikimedia Commons",
      title: "The only time it comes ashore",
      caption:
        "Females nest several times a season, then do not return for two or three years. Males never leave the water at all after the day they hatch, which makes nesting beaches the only place the species can be counted.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Leatherback_Sea_Turtle_%28Dermochelys_coriacea%29_%2810628948135%29.jpg/1920px-Leatherback_Sea_Turtle_%28Dermochelys_coriacea%29_%2810628948135%29.jpg",
      alt: "A leatherback sea turtle at Plage des Hattes, Awala-Yalimapo, French Guiana",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Seven ridges down the back",
      caption:
        "The longitudinal keels running the length of the carapace are unique to this species and are thought to smooth water flow along the body. On a swimming turtle they are the field mark that settles the identification instantly.",
    },
  ],

  headline: "A warm-bodied reptile in cold ocean",
  intro: [
    "The leatherback is the largest turtle alive and the fourth heaviest reptile, with adults commonly 1.3 to 1.8 m along the curve of the carapace and 250 to 700 kg. The record animal, a male washed up at Harlech in Wales in September 1988, measured 2.91 m over the shell and weighed 961 kg.",
    "It is also the strangest. It has no hard shell, no scales as an adult, and a body that holds its core temperature well above the water around it. It dives beyond a kilometre, crosses entire ocean basins, and lives almost entirely on jellyfish — an animal that is mostly water, eaten in quantities that are hard to believe until you see the numbers.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Testudines",
    family: "Dermochelyidae",
    genus: "Dermochelys",
    species: "Dermochelys coriacea",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2013,
    populationTrend: "decreasing",
    populationEstimate: "Roughly 26,000–43,000 nesting females, down from about 115,000 in 1980",
    note: "Vulnerable globally, but the global figure conceals enormous regional differences and the IUCN assesses seven subpopulations separately for that reason. The East Pacific population is Critically Endangered and reduced to somewhere around 2,300 adult females; the West Pacific is also Critically Endangered; the Northwest Atlantic, by contrast, was assessed as recovering. Listed on CITES Appendix I, and protected under the US Endangered Species Act as endangered throughout its range.",
  },

  measurements: [
    {
      key: "length",
      label: "Carapace length",
      value: "1.3–1.8 m (curved)",
      min: 1.3,
      max: 2.56,
      unit: "m",
      note: "The record animal, from Harlech in Wales in 1988, had a curved carapace of 2.56 m and measured 2.91 m in total length",
    },
    {
      key: "weight",
      label: "Weight",
      value: "250–700 kg",
      min: 250,
      max: 961,
      unit: "kg",
      note: "The Harlech turtle weighed 961 kg, the heaviest reliably weighed turtle on record",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "Recorded to 1,280 m",
      min: 1280,
      max: 1280,
      unit: "m",
      note: "Deeper than any other reptile and deeper than most whales; routine foraging dives are far shallower",
    },
    {
      key: "body-temperature",
      label: "Body temperature above the sea",
      value: "Up to 18 °C warmer than the surrounding water",
      min: 0,
      max: 18,
      unit: "°C",
      note: "Maintained by sheer bulk, insulating oily fat, countercurrent heat exchangers in the flippers and constant swimming — not by a mammalian metabolism",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "About 110 eggs, of which around 85 are fertile",
      min: 80,
      max: 120,
      unit: "eggs",
      note: "The rest are small yolkless eggs laid on top, whose function is still debated — most likely they keep the chamber open for gas exchange",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 60–70 days",
      min: 60,
      max: 70,
      unit: "days",
      note: "Sand temperature sets the sex of the hatchlings, with warmer nests producing females",
    },
    {
      key: "migration-distance",
      label: "Migration distance",
      value: "Over 20,000 km recorded",
      min: 20000,
      max: 20000,
      unit: "km",
      note: "One satellite-tracked female crossed the Pacific from Indonesia to the west coast of North America over 647 days",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 50 years, possibly much longer",
      min: 50,
      max: 90,
      unit: "years",
      note: "A 2020 analysis of the leatherback genome put the species' potential lifespan at about 90 years; wild ages are not directly known",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Almost entirely jellyfish and other gelatinous plankton", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Continuously active; dives day and night, following prey towards the surface at dusk", icon: "Moon" },
    { key: "water-type", label: "Water type", value: "Salt water — fully oceanic apart from nesting", icon: "Droplet" },
    { key: "ocean-range", label: "Ocean range", value: "All three ocean basins, from tropical nesting beaches to sub-polar feeding grounds", icon: "Globe" },
    { key: "nest-type", label: "Nest type", value: "A deep flask-shaped chamber dug in open sand above the tide line, then covered and disguised", icon: "Egg" },
    { key: "ecological-role", label: "Ecological role", value: "The principal predator of large jellyfish in the open ocean", icon: "Waves" },
  ],

  highlights: ["weight", "dive-depth", "body-temperature", "diet-type"],

  distribution: {
    continents: ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"],
    regions: [
      "Tropical Atlantic nesting beaches — Trinidad, Gabon, French Guiana, Suriname",
      "Eastern Pacific — Costa Rica and Mexico",
      "Western Pacific — Papua Barat, Solomon Islands",
      "Indian Ocean — Sri Lanka, Andaman and Nicobar Islands",
      "Northern feeding grounds off Canada, Norway and Alaska",
    ],
    habitats: [
      "Open ocean",
      "Continental shelf and slope",
      "Cold temperate and sub-polar feeding grounds",
      "Tropical sandy nesting beach",
    ],
    elevation: "Surface waters to at least 1,280 m depth",
    note: "This is the most widely distributed reptile in the world, and the only one that regularly enters sub-polar seas. Individuals have been recorded above the Arctic Circle off Norway and as far south as the tip of South America — a range no other turtle comes close to, and one that only its heat-retaining physiology makes possible.",
  },

  sections: [
    {
      id: "shell",
      title: "The turtle without a shell",
      body: [
        "Every other living sea turtle has a carapace of bony plates covered in keratin scutes. The leatherback has neither. Its back is a layer of tough, leathery, oil-impregnated skin over a mosaic of several thousand small polygonal bones, with seven pronounced ridges running from front to back.",
        "This is not a degraded version of a normal shell; it is a lineage that went its own way. Dermochelys is the only survivor of the family Dermochelyidae, which separated from the ancestors of all other sea turtles well over a hundred million years ago. Everything about the animal — the shell, the physiology, the diet — is the product of that separate history.",
        "The flexibility earns its keep at depth. A rigid shell resists compression until it fails; the leatherback's deforms, and it has collapsible lungs and a skeleton with unusually high oil content to go with it. That combination is what allows dives past 1,200 m without the barotrauma that would kill a hard-shelled turtle.",
      ],
    },
    {
      id: "warm",
      title: "Staying warm without being warm-blooded",
      body: [
        "Leatherbacks feed in water at 5 °C and colder, off Newfoundland, Norway and Alaska, while nesting on tropical beaches. No other reptile operates across that range, and the reason is that the animal holds its core temperature as much as 18 °C above the sea around it.",
        "The mechanism is not a mammalian metabolism. It is a stack of adaptations: an enormous body with a low surface-to-volume ratio, a thick insulating layer of oily fat, countercurrent heat exchangers at the base of the flippers that trap warmth returning from the extremities, and near-constant swimming that generates heat as a by-product. Physiologists call the strategy gigantothermy.",
        "It also works in reverse. In tropical water a leatherback has to shed heat, and it does so by shunting blood to the flippers and to a network of vessels in the skin — the same plumbing, run the other way. The animal's problem in the tropics is overheating, not cold.",
      ],
    },
    {
      id: "jellyfish",
      title: "A diet of water, and the plastic problem",
      body: [
        "Leatherbacks eat jellyfish and other gelatinous plankton, almost to the exclusion of everything else. A jellyfish is roughly ninety-five per cent water, so the quantities required are extraordinary: tracking studies of foraging leatherbacks in Canadian waters estimated daily intake at close to three-quarters of the turtle's own body mass.",
        "The equipment matches. The jaws are scissor-like and sharp-edged, suited to soft prey and useless for anything hard, and the throat and oesophagus are lined with hundreds of backward-pointing keratin spines. A leatherback takes in a mouthful of jellyfish and seawater, expels the water, and the spines hold the prey in place.",
        "That anatomy is now a liability. A floating plastic bag in open water looks and behaves very like a jellyfish, and once a leatherback has swallowed one the backward-facing spines make it almost impossible to bring back up. Plastic has been found in a substantial fraction of leatherbacks examined post-mortem, and gut blockage from it is a documented cause of death.",
      ],
    },
    {
      id: "nesting",
      title: "Nesting, and the numbers that follow from it",
      body: [
        "Females come ashore at night on open sandy beaches, dig a body pit, then excavate a flask-shaped chamber with the hind flippers and lay around 110 eggs. Only about 85 are fertile; the rest are small and yolkless, laid on top of the clutch, and most likely keep the upper chamber open so the developing eggs can exchange gas.",
        "A female nests several times in a season, up to about ten, then does not return for two or three years — she spends the interval feeding thousands of kilometres away, rebuilding the reserves the effort costs. Incubation takes sixty to seventy days, and sand temperature decides the sex of the hatchlings, warmer nests producing females.",
        "Almost everything about this makes the species hard to protect. Adults are counted only as nesting females on beaches, so population estimates depend on where people happen to be watching; the two- to three-year gap means a bad count year may mean nothing; and hatchlings that survive the crawl to the sea disappear for a decade or more into what researchers call the lost years, with almost no data on where they go.",
      ],
    },
    {
      id: "decline",
      title: "Two very different declines",
      body: [
        "The global picture is bad and the regional pictures are wildly different. Worldwide nesting has fallen from something like 115,000 females in 1980 to roughly 26,000 to 43,000 today, but that average hides a Pacific collapse and an Atlantic that has held up far better.",
        "The East Pacific population is the emergency. Nesting at the great Mexican and Costa Rican beaches has fallen by more than ninety per cent since the 1980s, driven by decades of egg harvest and by mortality in coastal gillnet and longline fisheries, and perhaps 2,300 adult females remain. The West Pacific is in a similar state. Both are assessed as Critically Endangered, and both are considered at real risk of disappearing within decades.",
        "The Atlantic shows what works. Sustained beach protection in Trinidad, French Guiana, Suriname and Gabon, combined with turtle excluder devices and changes to longline gear, produced stable or increasing nesting through the 2000s in the Northwest Atlantic. The measures are not exotic — protect the beaches, keep turtles out of nets, and stop taking the eggs. They simply have to be sustained for the decades a slow-maturing animal needs before the results show up in a count.",
      ],
    },
  ],

  related: ["green-sea-turtle", "galapagos-tortoise"],
  tags: ["turtle", "marine", "ocean", "migratory", "endangered", "reptile"],
  searchTerms: [
    "dermochelys coriacea",
    "leatherback turtle",
    "largest turtle",
    "leatherback dive depth",
    "leathery turtle",
  ],

  faqs: [
    {
      q: "How big is a leatherback sea turtle?",
      a: "Adults are usually 1.3 to 1.8 m along the curve of the carapace and weigh 250 to 700 kg. The largest reliably measured individual, a male washed ashore at Harlech in Wales in September 1988, was 2.91 m in total length and weighed 961 kg — the heaviest turtle ever recorded.",
    },
    {
      q: "Why doesn't the leatherback have a hard shell?",
      a: "Because its lineage split from all other sea turtles more than a hundred million years ago and never had one in the modern sense. Instead of bony plates under keratin scutes, its back is leathery, oil-rich skin over a mosaic of thousands of small bones. The flexibility is an advantage at depth: a rigid shell would fail under the pressure at the 1,280 m the species has been recorded diving to.",
    },
    {
      q: "How can a reptile survive in near-freezing water?",
      a: "By retaining heat rather than generating it in the mammalian sense. A leatherback's bulk, its insulating layer of oily fat, countercurrent heat exchangers at the base of the flippers and continuous swimming together hold its core as much as 18 °C above the surrounding sea. The strategy is called gigantothermy, and it is why this is the only reptile that regularly feeds in sub-polar water.",
    },
    {
      q: "What do leatherbacks eat?",
      a: "Jellyfish, almost exclusively, along with other gelatinous plankton. Because jellyfish are around ninety-five per cent water, the volumes are enormous — foraging turtles have been estimated to eat close to three-quarters of their own body mass in a day. Backward-pointing spines lining the throat hold the soft prey while seawater is expelled.",
    },
    {
      q: "Why are leatherbacks endangered?",
      a: "Chiefly bycatch in longline and gillnet fisheries, harvest of eggs from nesting beaches, and ingestion of plastic bags mistaken for jellyfish. The species is Vulnerable globally, but the East and West Pacific populations are Critically Endangered — Pacific nesting has fallen by more than ninety per cent since the 1980s, leaving perhaps 2,300 adult females in the East Pacific.",
    },
  ],

  seo: {
    title: "Leatherback Sea Turtle — Size, Dives, Diet & Conservation",
    description:
      "A researched profile of the leatherback sea turtle (Dermochelys coriacea): the largest turtle on Earth, its shell-less carapace, 1,280 m dives, warm-bodied gigantothermy, jellyfish diet and plastic risk, and the collapse of its Pacific populations.",
    keywords: [
      "leatherback sea turtle facts",
      "dermochelys coriacea",
      "largest turtle",
      "leatherback turtle dive depth",
      "leatherback conservation",
    ],
  },

  sources: [
    {
      label: "Dermochelys coriacea — Red List assessment (Wallace, Tiwari & Girondot, 2013)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/6494/43526147",
    },
    {
      label: "Leatherback turtle — species directory",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/leatherback-turtle",
    },
    {
      label: "Northwest Atlantic leatherback turtle — Red List assessment",
      publisher: "Northwest Atlantic Leatherback Working Group (2019)",
      url: "https://www.widecast.org/Resources/Docs/Conservation/NWA/NWA%20Leatherback%20Working%20Group%20(2019)%20IUCN%20Red%20List%20Assessment.pdf",
    },
    {
      label: "Largest chelonian — the 1988 Harlech leatherback",
      publisher: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/world-records/largest-chelonian",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default leatherbackSeaTurtle;
