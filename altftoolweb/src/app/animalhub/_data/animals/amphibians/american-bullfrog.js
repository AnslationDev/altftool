// American bullfrog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const americanBullfrog = {
  slug: "american-bullfrog",
  category: "amphibians",
  name: "American Bullfrog",
  scientificName: "Lithobates catesbeianus",
  otherNames: ["Bullfrog", "North American bullfrog"],

  summary:
    "The largest frog in North America, secure and unremarkable across its native eastern range — and, once shipped abroad for its legs, one of the hundred worst invasive species on Earth and a quiet carrier of the fungus killing amphibians worldwide.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/North-American-bullfrog1.jpg/1920px-North-American-bullfrog1.jpg",
    alt: "An adult American bullfrog sitting among grass and clover, green head and brown mottled body",
    credit: "Carl D. Howe / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/American_Bullfrog_%28Juvenile%29_%28Lithobates_catesbeianus%29_%2815339972466%29.jpg/1920px-American_Bullfrog_%28Juvenile%29_%28Lithobates_catesbeianus%29_%2815339972466%29.jpg",
      alt: "A juvenile American bullfrog at the edge of a wetland in Ohio",
      credit: "Andrew C / Wikimedia Commons",
      title: "Years before it is a bullfrog",
      caption:
        "A young bullfrog has already survived the longest larval stage of any North American frog. In the north the tadpole can spend two or three winters in the pond before metamorphosing, which is why bullfrogs need water that does not dry out.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/American_Bullfrog_%28Lithobates_catesbeianus%29_%2817815275291%29.jpg/1920px-American_Bullfrog_%28Lithobates_catesbeianus%29_%2817815275291%29.jpg",
      alt: "An American bullfrog partly submerged at a marsh edge, eyes and back above the waterline",
      credit: "Andrew C / Wikimedia Commons",
      title: "The ambush position",
      caption:
        "Eyes and nostrils sit high on the head so the frog can float almost entirely submerged and still see and breathe. Almost all of its hunting is done from this posture, waiting at the margin for something to come within reach.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/American_Bullfrog_%28Lithobates_catesbeianus%29_%2832165868655%29.jpg/1920px-American_Bullfrog_%28Lithobates_catesbeianus%29_%2832165868655%29.jpg",
      alt: "A large American bullfrog on a bank, showing the prominent circular eardrum behind the eye",
      credit: "Doug McGrady / Wikimedia Commons",
      title: "Reading the eardrum",
      caption:
        "The tympanum — the flat disc behind the eye — is the quickest way to sex a bullfrog. In males it is noticeably wider than the eye; in females it is about the same size. Males use it to hold territory acoustically through the breeding season.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/9e/American_Bullfrog_%28Lithobates_catesbeianus%29_%288573971487%29.jpg",
      alt: "An American bullfrog photographed at Playa Larga in Matanzas Province, Cuba",
      credit: "Thomas Brown / Wikimedia Commons",
      title: "Four thousand kilometres from home",
      caption:
        "This animal is in Cuba, well outside its native range. Bullfrogs have been introduced to more than forty countries, usually for frog-leg farming, and in most of them they now eat, outcompete and infect the native amphibians they were dropped among.",
    },
  ],

  headline: "Least Concern at home, catastrophe abroad",
  intro: [
    "In the ponds and swamps of eastern North America the American bullfrog is an ordinary, abundant animal: a big ambush predator that eats whatever fits in its mouth, bellows through summer nights, and is assessed by the IUCN as Least Concern with a stable population.",
    "Everywhere else it is a problem. Farmed for its legs and shipped live around the world from the late nineteenth century onward, it escaped, established, and became one of the hundred worst invasive alien species on the IUCN's list — outcompeting and eating native frogs, and carrying the chytrid fungus that has driven amphibian declines on every continent where frogs live without dying of it itself.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Ranidae",
    genus: "Lithobates",
    species: "Lithobates catesbeianus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2022,
    populationTrend: "stable",
    populationEstimate: "Abundant and widespread; no global estimate needed",
    note: "The Least Concern listing describes the native population in eastern North America, where the species is common and faces no significant threat. It says nothing about the introduced populations — the same animal appears on the IUCN Invasive Species Specialist Group's list of 100 of the World's Worst Invasive Alien Species. Note also that the 2022 assessment was published under the name Aquarana catesbeianus; the genus has moved between Rana, Lithobates and Aquarana and authorities still differ.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "9–15 cm",
      min: 9,
      max: 15,
      unit: "cm",
      note: "Snout to vent. The largest recorded individuals reach about 20 cm.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 500 g",
      max: 500,
      unit: "g",
      note: "Exceptional animals have reached 800 g. A young frog grows from roughly 5 g to 175 g in its first eight months.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "7–10 years in the wild",
      min: 7,
      max: 10,
      unit: "years",
      note: "One captive individual lived almost 16 years.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "Up to about 20,000 eggs",
      max: 20000,
      unit: "eggs",
      note: "Laid as a thin floating film rather than a compact clump; larger masses have been reported. Eggs hatch in three to five days.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "1–3 years after metamorphosis",
      min: 1,
      max: 3,
      unit: "years",
      note: "Males mature earlier and at a smaller size than females; counted from the egg it can be three to five years.",
    },
    {
      key: "larval-period",
      label: "Time as a tadpole",
      value: "A few months to 3 years",
      min: 0.25,
      max: 3,
      unit: "years",
      note: "Shortest in the south, longest in northern ponds where tadpoles overwinter — the single reason bullfrogs need permanent water.",
    },
    {
      key: "introduced-range",
      label: "Countries introduced to",
      value: "More than 40",
      min: 40,
      max: 40,
      unit: "countries",
      note: "Across four continents, mostly via frog-leg farming and the aquarium trade.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — insects, crayfish, fish, frogs, snakes, small birds and mammals", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal; males call through warm summer nights", icon: "Moon" },
    { key: "water-type", label: "Water type", value: "Freshwater — permanent ponds, lakes, swamps and slow rivers", icon: "Droplet" },
    { key: "invasive-status", label: "Invasive status", value: "One of the IUCN's 100 of the World's Worst Invasive Alien Species", icon: "AlertTriangle" },
    { key: "disease-role", label: "Disease role", value: "Asymptomatic carrier of the amphibian chytrid fungus", icon: "Biohazard" },
    { key: "ecological-role", label: "Ecological role", value: "Generalist predator at home; a dominant consumer where introduced", icon: "Network" },
  ],

  highlights: ["length", "clutch-size", "invasive-status", "disease-role"],

  distribution: {
    continents: ["North America", "South America", "Europe", "Asia"],
    regions: [
      "Native: eastern North America from the Canadian Maritimes to Texas and the Great Plains",
      "Introduced: western North America, the Caribbean, South America, western Europe and East Asia",
    ],
    habitats: ["Permanent ponds and lakes", "Swamps and marshes", "Slow rivers and irrigation channels"],
    elevation: "Sea level to around 2,000 m in parts of the introduced range",
    note: "The native range covers essentially every US state east of the Mississippi, reaching north into the Canadian Maritimes and west to Idaho, Texas and Montana. Introductions have carried it to more than 40 countries on four continents, and human-modified water — farm ponds, reservoirs, canals — suits it better than most native amphibians it displaces.",
  },

  sections: [
    {
      id: "at-home",
      title: "A generalist in its own pond",
      body: [
        "Bullfrogs hunt by sitting still. A frog floats at the water's edge with only its eyes and nostrils above the surface, or sits on the bank facing the water, and takes whatever passes: beetles, dragonflies, crayfish, fish, other frogs, snakes, and on record small birds, bats and young turtles. The working definition of bullfrog prey is anything it can get into its mouth.",
        "Breeding is a summer performance. Males take up spaced calling stations in shallow water and defend them acoustically and physically, producing the deep two-note bellow — conventionally written 'jug-o-rum' — that gave the species its name. Females deposit their eggs as a floating film that can spread across a wide patch of surface water.",
        "Development is unusually slow for a frog. A tadpole may transform within a few months in the south, but in northern ponds it overwinters once or twice and can take up to three years. That requirement for water that never dries is the main constraint on where bullfrogs can live — and the main reason artificial permanent water suits them so well.",
      ],
    },
    {
      id: "invasion",
      title: "How it got everywhere",
      body: [
        "Bullfrogs were moved deliberately. Frog legs were a commercial product, and from the late nineteenth century the species was stocked in the western United States and then exported for farming to Europe, South America and Asia. Farms leaked, stock was released when businesses failed, and the aquarium and water-garden trade added a second pathway.",
        "The results are consistent wherever it establishes. Adults eat native amphibians, fish and invertebrates directly; tadpoles are unpalatable to many predators and compete hard with native larvae, reducing their size, developmental rate and biomass. In the western United States the bullfrog is implicated in declines of the California red-legged frog and the Oregon spotted frog; in Europe, South America and East Asia the pattern repeats with local species.",
        "Established populations are close to impossible to eradicate. A single female can produce tens of thousands of eggs, juveniles disperse overland between water bodies, and the species tolerates degraded and artificial habitat that native amphibians will not use.",
      ],
    },
    {
      id: "chytrid",
      title: "Carrying the fungus",
      body: [
        "Batrachochytrium dendrobatidis — Bd, the amphibian chytrid fungus — attacks the keratinised skin frogs use for gas and water exchange, and has driven declines and extinctions in hundreds of amphibian species worldwide. It is the most consequential wildlife disease yet recorded.",
        "The American bullfrog is largely resistant to it. Infected bullfrogs often show no symptoms at all, which makes them exactly the wrong species to ship around the world: they survive infection, keep shedding zoospores, and carry the pathogen into naive amphibian communities. The global trade in live bullfrogs for food is one of the recognised routes by which Bd reached new continents.",
        "This is why the bullfrog's Least Concern status and its reputation sit together without contradiction. The species is not threatened; it is a threat. Conservation attention to it is almost entirely about where it has been introduced, not where it belongs.",
      ],
    },
    {
      id: "names",
      title: "Rana, Lithobates or Aquarana",
      body: [
        "The bullfrog has been shuffled between genera more than most animals its size. It was described by George Shaw in 1802 as Rana catesbeiana. A 2006 rearrangement of the New World true frogs moved it to Lithobates, and a later subgeneric scheme elevates Aquarana — the 2022 Red List assessment was published under Aquarana catesbeianus.",
        "None of this is a dispute about the animal. It is a dispute about how finely to split a large, well-studied group of frogs, and different authorities have settled in different places. Lithobates catesbeianus is the form most widely used in North American literature, and the one used here.",
        "The practical consequence is for searching rather than biology: a literature or database query on one name will miss records filed under another.",
      ],
    },
  ],

  related: ["axolotl", "golden-poison-frog", "chinese-giant-salamander"],
  tags: ["frog", "invasive species", "chytrid", "north america", "least concern", "freshwater"],
  searchTerms: [
    "lithobates catesbeianus",
    "rana catesbeiana",
    "aquarana catesbeiana",
    "bull frog",
    "jug o rum frog",
  ],

  faqs: [
    {
      q: "How big does an American bullfrog get?",
      a: "Adults are usually 9 to 15 centimetres from snout to vent, with the largest recorded individuals reaching about 20 centimetres. A big mature bullfrog weighs up to around 500 grams, and exceptional animals have reached 800 grams — making it the largest frog in North America.",
    },
    {
      q: "Why is the American bullfrog invasive if it is Least Concern?",
      a: "The two statements describe different places. Least Concern refers to its native range in eastern North America, where it is common and secure. Outside that range it has been introduced to more than 40 countries, where it eats and outcompetes native amphibians — which is why it appears on the IUCN's list of 100 of the World's Worst Invasive Alien Species.",
    },
    {
      q: "Do bullfrogs spread chytrid fungus?",
      a: "Yes. Bullfrogs are largely resistant to Batrachochytrium dendrobatidis and are often infected without showing symptoms, so they survive, keep shedding spores and introduce the pathogen to amphibians that have no resistance. The international trade in live bullfrogs for food is a recognised route by which the fungus reached new regions.",
    },
    {
      q: "How long does a bullfrog tadpole take to become a frog?",
      a: "Anywhere from a few months to three years. In the southern part of the range tadpoles transform within a single season; in northern ponds they overwinter once or twice first. That long larval period is why bullfrogs need permanent water that does not dry out.",
    },
    {
      q: "Is it Rana catesbeiana or Lithobates catesbeianus?",
      a: "Both names refer to the same frog. It was described as Rana catesbeiana in 1802, moved to Lithobates in a 2006 revision of the New World true frogs, and its 2022 IUCN assessment was published under Aquarana catesbeianus. Authorities still differ; Lithobates catesbeianus is the most widely used form.",
    },
  ],

  seo: {
    title: "American Bullfrog — Size, Range, Invasion & Chytrid",
    description:
      "A researched profile of the American bullfrog (Lithobates catesbeianus): Least Concern in its native eastern North America, one of the world's 100 worst invasive species elsewhere, and a symptomless carrier of chytrid fungus.",
    keywords: [
      "american bullfrog",
      "lithobates catesbeianus",
      "bullfrog invasive species",
      "chytrid fungus carrier",
      "largest frog north america",
    ],
  },

  sources: [
    {
      label: "Aquarana catesbeianus — Red List assessment (2022, e.T58565A193396825)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/58565/193396825",
    },
    {
      label: "Lithobates catesbeianus — Global Invasive Species Database profile",
      publisher: "IUCN SSC Invasive Species Specialist Group",
      url: "https://www.iucngisd.org/gisd/species.php?sc=80",
    },
    {
      label: "American bullfrog — nonindigenous aquatic species fact sheet",
      publisher: "United States Geological Survey",
      url: "https://nas.er.usgs.gov/queries/factsheet.aspx?SpeciesID=71",
    },
    {
      label: "Lithobates catesbeianus — natural history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Lithobates_catesbeianus/",
    },
    {
      label: "Reproductive characteristics of American bullfrogs in their invasive range",
      publisher: "PLOS ONE / PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7529884/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default americanBullfrog;
