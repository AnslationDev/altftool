// Whale shark — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const whaleShark = {
  slug: "whale-shark",
  category: "fish",
  name: "Whale Shark",
  scientificName: "Rhincodon typus",
  otherNames: ["Butanding", "Papa shillingi", "Whaleshark"],

  summary:
    "The largest fish alive, a filter-feeder the length of a bus that strains plankton from the water and carries a spot pattern as individual as a fingerprint.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Similan_Dive_Center_-_great_whale_shark.jpg",
    alt: "A whale shark in the Andaman Sea off the Similan Islands, its checkerboard of pale spots and bars visible along the dark back",
    credit: "Abe Khao Lak / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Dharavandhoo_Thila_-_Whale_Shark.jpg",
      alt: "A whale shark cruising over a reef thila in the Maldives, seen from the side",
      credit: "Shiyam ElkCloner / Wikimedia Commons",
      title: "A fingerprint in spots",
      caption:
        "No two whale sharks carry the same arrangement of spots and bars behind the gills, and the pattern holds for life. Researchers match photographs of it using an algorithm written to recognise star fields in Hubble images.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Rhincodon_typus_fgbnms_%28cropped%29.jpg",
      alt: "A whale shark photographed head-on at the Flower Garden Banks in the Gulf of Mexico, mouth held wide",
      credit: "FGBNMS/Eckert / Wikimedia Commons",
      title: "A mouth without a bite",
      caption:
        "The mouth is roughly a metre and a half across and sits at the very front of the head rather than underneath it, as in most sharks. Behind it the throat narrows to a few centimetres, which is why nothing larger than a small fish can be swallowed.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/7f/The_Whaleshark_Collection_at_Daedalus_Reef%2C_Red_Sea%2C_Egypt_passing_by_again_%286147234339%29.jpg",
      alt: "A whale shark passing a diver in open blue water at Daedalus Reef in the Red Sea",
      credit: "Derek Keats from Johannesburg, South Africa / Wikimedia Commons",
      title: "Slow by design",
      caption:
        "A whale shark cruises at roughly five kilometres an hour — walking pace. Filter-feeding pays for itself only if swimming is cheap, and almost everything about the body is built around moving a great deal of water for very little effort.",
    },
  ],

  headline: "The biggest fish in the sea eats the smallest food in it",
  intro: [
    "The whale shark is the largest fish that has ever been reliably measured: 18.8 metres for the biggest confirmed individual, and something close to twenty tonnes for a full-grown adult. It is a shark, not a whale — it has gills, not lungs, and never comes up for air — but it feeds the way the great whales do, straining plankton from the water rather than hunting anything it could bite.",
    "For an animal this conspicuous it is remarkably poorly known. Nobody has watched whale sharks mate. Newborns are almost never seen. The aggregations that draw tourists to Ningaloo, Holbox and Donsol are overwhelmingly juvenile males, which means most of the species spends most of its life somewhere researchers cannot follow it. What is clear is the direction of travel: the Indo-Pacific population has fallen by more than sixty per cent over three generations, and the species is assessed as Endangered.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Chondrichthyes",
    order: "Orectolobiformes",
    family: "Rhincodontidae",
    genus: "Rhincodon",
    species: "Rhincodon typus",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2025,
    populationTrend: "decreasing",
    populationEstimate: "No reliable global count; the Indo-Pacific holds roughly three-quarters of the world total and is estimated to have declined by more than 60% over three generations",
    note: "Uplisted from Vulnerable to Endangered in 2016 and reassessed as Endangered in March 2025. Listed on CITES Appendix II and, since 2017, on Appendix I of the Convention on Migratory Species. Directed fishing is banned in the Philippines (1998), India (2001) and Taiwan (2007) among others, but vessel strikes and bycatch are not addressed by any of those bans.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "8–18.8 m",
      min: 8,
      max: 18.8,
      unit: "m",
      note: "Adult males average 8–9 m and females 12–14.5 m; 18.8 m is the largest reliably measured individual",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Around 15,000–20,000 kg",
      min: 15000,
      max: 20000,
      unit: "kg",
      note: "FishBase carries a maximum published weight of 34 tonnes, but that figure has never been independently verified",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "Around 5 km/h",
      min: 3,
      max: 5,
      unit: "km/h",
      note: "Cruising pace; short bursts reach roughly twice that, and the shark tires quickly",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "1,928 m",
      min: 1928,
      max: 1928,
      unit: "m",
      note: "Recorded by a satellite tag; most time is spent in the top 100 m",
    },
    {
      key: "mouth-width",
      label: "Mouth width",
      value: "Up to about 1.5 m",
      min: 1,
      max: 1.5,
      unit: "m",
      note: "Terminal rather than underslung — it opens at the front of the head, unlike almost every other shark",
    },
    {
      key: "filtration-rate",
      label: "Water filtered",
      value: "Over 6,000 litres an hour",
      min: 6000,
      max: 6000,
      unit: "litres/hour",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 25–30 years",
      min: 25,
      max: 30,
      unit: "years",
      note: "Males mature at roughly 8–9 m; females later and larger, which is part of why so few have ever been examined",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "Up to around 300 pups",
      min: 300,
      max: 300,
      unit: "pups",
      note: "A single female landed in Taiwan in 1995 carried more than 300 embryos at staggered stages of development",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Estimated 80–130 years",
      min: 80,
      max: 130,
      unit: "years",
      note: "A 2020 bomb-radiocarbon study validated one growth band per year and confirmed a shark of 50; growth models push the ceiling far higher",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Filter feeder — plankton, krill, fish eggs and small schooling fish", icon: "Fish" },
    { key: "feeding-method", label: "Feeding method", value: "Ram and suction filtration through 20 pharyngeal filter pads", icon: "Filter" },
    { key: "reproduction", label: "Reproduction", value: "Live-bearing; eggs hatch inside the female and pups are born free-swimming", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Ocean-basin migrations, tracked over thousands of kilometres", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Usually solitary; gathers by the hundred at seasonal plankton blooms", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "Tropical and warm-temperate seas worldwide, roughly 30°N to 35°S", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Planktivore; a reliable indicator of productive open-ocean water", icon: "Leaf" },
  ],

  highlights: ["length", "weight", "lifespan", "dive-depth"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "North America", "South America"],
    regions: [
      "Ningaloo Reef, Western Australia",
      "Isla Holbox and the Yucatán, Mexico",
      "Gulf of Tadjoura, Djibouti",
      "South Ari Atoll, Maldives",
      "Mafia Island, Tanzania",
      "Donsol and Oslob, Philippines",
      "Gulf of Mexico and the Flower Garden Banks",
      "Al Shaheen oil field, Qatar",
    ],
    habitats: ["Tropical open ocean", "Coastal shelf waters", "Reef fronts and seasonal upwellings"],
    elevation: "Surface waters to nearly 2,000 m",
    note: "Found in all warm oceans between roughly 30°N and 35°S, generally where surface water is above 21 °C. The famous aggregations are short-lived and food-driven — coral spawning at Ningaloo, tuna spawn off the Yucatán, krill swarms off Djibouti — and are dominated by juvenile males. Where the adult females go for most of the year is one of the larger open questions in shark biology.",
  },

  sections: [
    {
      id: "scale",
      title: "How big is the biggest fish",
      body: [
        "The largest whale shark ever reliably measured was 18.8 metres long. Larger figures circulate — twenty metres and more — but they trace back to eye estimates made from boats, and a floating animal of this shape is very easy to over-read. Weight is worse: whale sharks are almost never weighed, so the tonnages quoted are calculated from length, and the maximum of 34 tonnes carried in the reference literature has never been independently confirmed. Around twenty tonnes is the defensible figure for a very large adult.",
        "Size is also strongly split by sex. Males level off at eight or nine metres; females go on to twelve or fourteen and a half. Since the aggregations that everyone photographs are made up almost entirely of juvenile males, the animals most people have seen are among the smaller ones the species produces.",
      ],
    },
    {
      id: "filter-feeding",
      title: "Living on plankton",
      body: [
        "Whale sharks feed in two ways. Swimming forward with the mouth open — ram filtration — works when prey is thinly spread over a long distance. When food is dense the shark stops, hangs vertically or near-vertically in the water, and pumps: it gulps, closes the mouth, and forces water out through the gills, drawing prey in by suction. That second mode is what makes the crowded feeding scenes at Oslob and Holbox possible.",
        "The filter itself is unusual. Twenty pads of cartilage-reinforced mesh block the entrance to the throat, with openings averaging little over a millimetre. Water crosses the mesh sideways rather than being pushed through it, so particles are swept along the surface and concentrated instead of clogging it — cross-flow filtration, the same principle used industrially. More than six thousand litres an hour passes through.",
        "The mouth is a metre and a half wide and sits at the front of the head rather than beneath it, and it is lined with several thousand teeth a few millimetres long that do nothing at all. Behind that opening the throat narrows to a few centimetres. A whale shark could not swallow anything substantial even if it tried.",
      ],
    },
    {
      id: "spots",
      title: "Identified by starlight",
      body: [
        "Every whale shark carries a pattern of pale spots and bars over a dark back, and the arrangement behind the gill slits is unique to the individual and stable across its life. That makes photographs a census tool, but only if the patterns can be compared at scale, and by eye they cannot.",
        "The solution came from astronomy. In 2005 a team including the programmer Jason Holmberg, the astrophysicist Zaven Arzoumanian and the biologist Brad Norman adapted the Groth algorithm — written to match star fields in Hubble Space Telescope images — to match spot fields on sharks. Both problems are the same problem: find the same scattered points in two pictures taken from different angles.",
        "The result is Wildbook for Whale Sharks, a public library into which divers and tourists upload their own photographs. It has turned a research bottleneck into a global monitoring programme staffed largely by people on holiday, and it underpins much of what is now known about how long individual sharks live and how far they travel.",
      ],
    },
    {
      id: "life-cycle",
      title: "The parts nobody has seen",
      body: [
        "Almost everything known about whale shark reproduction comes from a single animal: a female landed in Taiwan in 1995 carrying more than three hundred embryos. They were at different stages of development, which showed that a female stores sperm and fertilises eggs in batches rather than all at once. Eggs hatch inside her and the pups are born free-swimming, around 40 to 60 centimetres long.",
        "Nobody has recorded whale sharks mating. Newborns are almost never encountered. Where pregnant females spend their time is unknown, and the working assumption is that they are somewhere in the open ocean, deep and away from coasts, which is exactly where nobody is looking.",
        "Growth is slow and maturity late — roughly 25 to 30 years — and radiocarbon dating of vertebral growth bands in 2020 confirmed one shark at 50 years with no sign that band formation was tapering off. Estimates of the maximum lifespan run from 80 to 130 years. A species that takes three decades to breed cannot absorb sustained adult losses, and that is the whole conservation problem in a sentence.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "Directed fisheries did most of the historical damage, particularly in Taiwan, the Philippines, India and southern China, where the meat, fins and liver oil were all marketable. Most of those fisheries are now closed: the Philippines banned catch and trade in 1998, India in 2001, Taiwan in 2007. The species is listed on CITES Appendix II and, since 2017, on Appendix I of the Convention on Migratory Species.",
        "What the bans do not touch is the two threats that have grown since. Whale sharks feed at the surface in exactly the water shipping lanes run through, and they are struck often enough that vessel collisions are now considered a leading cause of death — a 2022 global analysis of satellite tag records found that a substantial share of tags stop reporting inside busy shipping lanes. Bycatch in tuna purse seines is the other: whale sharks associate with tuna schools and are set on along with them.",
        "Tourism cuts both ways. Well-run operations fund protection and supply the photographs that make photo-identification work. Provisioned sites, where sharks are fed to hold them in place for boats, change behaviour, concentrate animals near propellers and are increasingly hard to defend. The 2025 reassessment kept the species Endangered, with declines of more than 60% across the Indo-Pacific over three generations.",
      ],
    },
  ],

  related: ["great-white-shark", "atlantic-bluefin-tuna", "ocellaris-clownfish"],
  tags: ["shark", "filter feeder", "marine", "cartilaginous fish", "endangered", "megafauna"],
  searchTerms: ["rhincodon", "biggest fish", "largest fish in the world", "butanding", "gentle giant"],

  faqs: [
    {
      q: "Is a whale shark a whale or a shark?",
      a: "A shark. It breathes through gills, has a cartilaginous skeleton and never surfaces for air. The name refers to its size and to the way it feeds, straining plankton from the water like a baleen whale, but it is not related to whales — its closest relatives are carpet sharks such as wobbegongs.",
    },
    {
      q: "How big do whale sharks get?",
      a: "The largest reliably measured individual was 18.8 metres long. Adult males typically reach 8 to 9 metres and females 12 to 14.5 metres. Weights of around 20 tonnes are usual for a very large adult; higher figures found in reference works are calculated from length rather than measured.",
    },
    {
      q: "Are whale sharks dangerous to humans?",
      a: "No. A whale shark's throat is only a few centimetres wide and its several thousand teeth are vestigial, so it cannot bite or swallow anything larger than a small fish. The realistic risk in the water is accidental contact with an animal that weighs twenty tonnes and does not manoeuvre quickly.",
    },
    {
      q: "How do scientists tell individual whale sharks apart?",
      a: "By the spot pattern behind the gill slits, which is unique to each shark and does not change over its life. Photographs are matched using software adapted from the Groth algorithm, originally written to compare star fields in Hubble Space Telescope images. The resulting public database, Wildbook for Whale Sharks, is largely filled by divers and tourists.",
    },
    {
      q: "Why are whale sharks endangered?",
      a: "They mature at around 25 to 30 years, so populations replace losses very slowly. Directed fishing caused the historical decline and is now banned across much of the range, but bycatch in tuna fisheries and collisions with ships continue — and whale sharks feed at the surface, in the same water shipping uses. The Indo-Pacific population has fallen by more than 60% over three generations.",
    },
  ],

  seo: {
    title: "Whale Shark — Size, Filter Feeding, Lifespan & Conservation",
    description:
      "A researched profile of the whale shark (Rhincodon typus): the 18.8 m size record, cross-flow filter feeding, spot-pattern photo identification, a lifespan measured in decades, and Endangered status.",
    keywords: [
      "whale shark facts",
      "rhincodon typus",
      "biggest fish in the world",
      "whale shark size",
      "whale shark filter feeding",
    ],
  },

  sources: [
    {
      label: "Rhincodon typus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/19488/126673248",
    },
    {
      label: "Rhincodon typus — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/2081",
    },
    {
      label: "Whale shark size and growth",
      publisher: "Marine Megafauna Foundation",
      url: "https://marinemegafauna.org/guide-to-whale-sharks/size",
    },
    {
      label: "Annual bands in vertebrae validated by bomb radiocarbon assays (Ong et al., 2020)",
      publisher: "Frontiers in Marine Science",
      url: "https://www.frontiersin.org/articles/10.3389/fmars.2020.00188/full",
    },
    {
      label: "An astronomical pattern-matching algorithm for identification of whale sharks",
      publisher: "Journal of Applied Ecology",
      url: "https://besjournals.onlinelibrary.wiley.com/doi/10.1111/j.1365-2664.2005.01117.x",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default whaleShark;
