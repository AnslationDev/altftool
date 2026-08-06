// Olm — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const olm = {
  slug: "olm",
  category: "amphibians",
  name: "Olm",
  scientificName: "Proteus anguinus",
  otherNames: ["Proteus", "Human fish", "Cave salamander", "Čovješka ribica"],

  summary:
    "A blind, colourless salamander that spends a century in the flooded dark of Balkan caves, never grows up, can go a decade without eating, and was described in the seventeenth century as the offspring of a dragon.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Proteus_anguinus_Postojnska_Jama_Slovenija.jpg",
    alt: "Two pale, eel-like olms on the floor of a cave pool in Postojna Cave, Slovenia",
    credit: "Boštjan Burger / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Olm_%28Proteus_anguinus%29_in_Moulis%2C_Ariege_%28Laboratoire_souterraine%2C_CNRS%29_%2833755905584%29.jpg/1920px-Olm_%28Proteus_anguinus%29_in_Moulis%2C_Ariege_%28Laboratoire_souterraine%2C_CNRS%29_%2833755905584%29.jpg",
      alt: "An olm in the CNRS underground laboratory at Moulis, Ariège, pale-bodied with red external gills",
      credit: "Javier Ábalos Alvarez from Madrid, España / Wikimedia Commons",
      title: "The colony that measured a lifetime",
      caption:
        "The CNRS underground laboratory at Moulis has kept olms since the 1950s. More than half a century of births and deaths in that colony is the evidence behind the claim that the species can live past 100.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Prot%C3%A9e_anguillard_%28Proteus_anguinus%29.jpg/1920px-Prot%C3%A9e_anguillard_%28Proteus_anguinus%29.jpg",
      alt: "An olm resting in shallow water, its skin unpigmented and its eyes covered by skin",
      credit: "Gzen92 / Wikimedia Commons",
      title: "Skin where the eyes should be",
      caption:
        "Olm embryos start to build eyes and then stop. Development arrests after about four months and the eyes atrophy, ending up buried beneath a layer of skin — reduction by disuse, and one of Darwin's own examples of it.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Proteusi_amfib_q%C3%AB_jeton_n%C3%AB_shpella.jpg/1920px-Proteusi_amfib_q%C3%AB_jeton_n%C3%AB_shpella.jpg",
      alt: "An olm in dark water, long-bodied with slender limbs and feathery external gills",
      credit: "Arbenllapashtica / Wikimedia Commons",
      title: "Gills it never gives up",
      caption:
        "The red plumes behind the head are larval gills, kept for life. Like the axolotl, the olm is neotenic: it becomes sexually mature without ever metamorphosing into an adult-shaped salamander.",
    },
  ],

  headline: "A hundred years in the dark, and the eyes were never needed",
  intro: [
    "The olm lives in flooded caves in the limestone karst of the western Balkans, in water that sits at eight to eleven degrees and has never seen daylight. It is about twenty-five centimetres of pale, unpigmented, eel-shaped salamander, with three red plumes of external gill behind the head, four small legs it barely uses, and eyes that stopped developing four months into embryonic life and now lie buried under skin.",
    "Almost everything about it is a consequence of that habitat. There is very little food in a cave, so the olm is built to need almost none — its metabolism is exceptionally slow, it can go years without eating at all, and it grows, matures and reproduces on a timescale that makes other amphibians look frantic. The reward for that patience appears to be a lifespan of a century, which would make it the longest-lived amphibian known.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Caudata",
    family: "Proteidae",
    genus: "Proteus",
    species: "Proteus anguinus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2024,
    populationTrend: "decreasing",
    populationEstimate: "Unknown — the animal is almost impossible to census, being underground and rarely surfacing",
    note: "Listed as Vulnerable under criterion B2, on the basis of an area of occupancy below 2,000 km², a severely fragmented distribution and a continuing decline in habitat extent and quality. The threat is almost entirely water quality: karst aquifers drain whatever is applied to the ground above them, so agricultural runoff, sewage and industrial pollution reach the caves directly. Illegal collection for private aquaria adds to it. Environmental DNA sampling of cave water has become the main survey method, because finding the animals themselves is largely a matter of luck.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "20–30 cm",
      min: 20,
      max: 40,
      unit: "cm",
      note: "Averaging around 23–25 cm; exceptional individuals reach about 40 cm.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 68 years on average, predicted maximum over 100",
      min: 68,
      max: 102,
      unit: "years",
      note: "From a demographic model of the CNRS colony at Moulis, France, using more than 50 years of records. The 100-year figure is a prediction from that model, not an individual that has been watched for a century.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 14 years",
      min: 14,
      max: 14,
      unit: "years",
      note: "At a water temperature around 10 °C. Females then breed roughly once every 12 years.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "Up to 70 eggs, averaging about 35",
      min: 35,
      max: 70,
      unit: "eggs",
      note: "Laid under a stone and guarded by the female. Development takes around 140 days.",
    },
    {
      key: "starvation-tolerance",
      label: "Survival without food",
      value: "Up to 10 years",
      min: 10,
      max: 10,
      unit: "years",
      note: "Demonstrated under controlled conditions. The animal metabolises its own tissue reserves and reduces activity to almost nothing.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — cave shrimp, small snails and insects, swallowed whole",
      icon: "Drumstick",
    },
    { key: "eyesight", label: "Eyesight", value: "Blind — eye development arrests in the embryo and the eyes atrophy under skin", icon: "EyeOff" },
    {
      key: "life-cycle",
      label: "Life cycle",
      value: "Neotenic — keeps larval gills and aquatic form for life",
      icon: "Waves",
    },
    {
      key: "senses",
      label: "Senses",
      value: "Smell, taste, a lateral line for water movement, plus sensitivity to electric and magnetic fields",
      icon: "Radio",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — karst groundwater at a constant 8–11 °C",
      icon: "Droplet",
    },
    {
      key: "range-size",
      label: "Range",
      value: "Caves of the Dinaric karst — Slovenia, Croatia, Bosnia and Herzegovina, north-eastern Italy",
      icon: "MapPin",
    },
  ],

  highlights: ["length", "lifespan", "eyesight", "starvation-tolerance"],

  distribution: {
    continents: ["Europe"],
    regions: [
      "Dinaric karst of Slovenia, Croatia, Bosnia and Herzegovina and Montenegro",
      "A small area of north-eastern Italy near Trieste",
    ],
    habitats: ["Flooded cave systems", "Karst groundwater and underground rivers"],
    elevation: "Underground, in aquifers generally 0–500 m above sea level",
    note: "This is the only exclusively cave-dwelling vertebrate in Europe. Introduced populations exist near Vicenza in Italy, at Kranj in Slovenia and in the underground laboratory at Moulis in the French Pyrenees. Because populations are separated by impassable rock, the species is genetically fragmented into lineages that have been isolated for a very long time.",
  },

  sections: [
    {
      id: "dark",
      title: "Built for a place with nothing in it",
      body: [
        "A cave offers no light, no plants, almost no food and an unvarying temperature. The olm has responded by giving up everything it does not need and refining what it does.",
        "The eyes go first. Olm embryos begin to build them normally, then development stops at about four months and the structures regress, ending up small, buried under skin and non-functional — an example of reduction through disuse that Darwin himself cited. The skin is unpigmented, which is where the old name human fish comes from: it is pale pink-white and translucent enough that organs show through. Exposed to light for long enough, an olm will actually darken as pigment cells respond.",
        "What replaced vision is a broader sensory suite than most amphibians carry. The olm has an acute sense of smell and taste for tracing prey and chemical gradients in still water, a lateral line that registers pressure waves, and demonstrated sensitivity to weak electric fields and to the Earth's magnetic field. It also retains light-sensitive tissue in the skin and in the pineal region, so it is not indifferent to light even though it cannot see.",
        "The metabolism is the other half of the adaptation. Olms move very little, have a low resting metabolic rate even for an amphibian, and can shut down further when food is scarce — living off their own tissue reserves for as long as a decade, and reducing activity to almost nothing until conditions improve.",
      ],
    },
    {
      id: "lifespan",
      title: "How we know it lives a century",
      body: [
        "The lifespan claim is unusual in resting on a single, very patient dataset. The CNRS underground laboratory at Moulis in the French Pyrenees has maintained a colony of olms in cave conditions since the 1950s, keeping birth and death records for around four hundred animals across more than fifty years.",
        "In 2011 Yann Voituron and colleagues analysed that record. Adult survival in the colony was so high that the demographic model they fitted produced an average adult lifespan of 68.5 years and a predicted maximum of about 102 — with the oldest animals in the colony still alive and showing no sign of senescence at the time.",
        "The distinction matters. Nobody has yet watched an individual olm live for a hundred years; the figure is an extrapolation from mortality rates observed in a captive population over half a century. What the data do establish directly is that adult olms die at an extraordinarily low rate, and that they do so without the usual physiological markers of ageing — which is the genuinely interesting finding, and the reason the species has become a subject in ageing research rather than merely a curiosity.",
        "The rest of the life cycle is on the same scale. Sexual maturity comes at around fourteen years, a female lays eggs roughly once every twelve years, and development inside the egg takes about 140 days. Almost nothing in a cave happens quickly.",
      ],
    },
    {
      id: "black-olm",
      title: "The black olm",
      body: [
        "In 1986 divers exploring the Bela Krajina region of south-eastern Slovenia, near Črnomelj, found olms that were entirely the wrong colour: dark brown to black, with functional or near-functional eyes, a shorter head and a proportionally longer trunk.",
        "This is Proteus anguinus parkelj, the black olm, the only recognised subspecies. It occupies a very small area — a handful of springs and karst waters around the Dobličica river — and appears to spend more time in shallow groundwater close to the surface, where pigment and eyes are worth having.",
        "Its existence complicates the neat story of loss by disuse. The black olm is not a relic that never entered the caves; genetic work places it firmly inside the Proteus radiation, meaning either that this lineage retained features the others lost, or that it re-acquired something like them. Either way, it is an unusually clean natural experiment in how quickly cave adaptations can be shed or kept, and it is confined to an area small enough that a single pollution event could end it.",
      ],
    },
    {
      id: "dragons",
      title: "Baby dragons, and the first cave animal ever described",
      body: [
        "Heavy rain in karst country flushes water out of the caves, and with it, occasionally, an olm. Locals in Carniola drew the obvious conclusion about pale, limbed creatures washing out of the underworld, and in 1689 Janez Vajkard Valvasor recorded the belief that they were the young of a dragon living beneath the mountains.",
        "Formal science caught up in 1768, when Josephus Nicolaus Laurenti named the animal Proteus anguinus after the shape-shifting sea god of Greek myth. It was the first cave-dwelling animal ever described scientifically, and it has stayed close to the centre of cave biology ever since — Postojna Cave in Slovenia, where the species has been shown to visitors for well over a century, still runs a laboratory around it.",
        "The dragon story has proved durable in a useful way. The olm is a national symbol in Slovenia, has appeared on the country's currency, and drew international attention in 2016 when a female in the Postojna aquarium laid a clutch of eggs that were watched, filmed and reared under public scrutiny — an event that produced better conservation publicity for a cave amphibian than any campaign could have.",
      ],
    },
  ],

  related: ["axolotl", "fire-salamander", "chinese-giant-salamander"],
  tags: ["salamander", "cave", "neoteny", "slovenia", "vulnerable", "longevity", "blind"],
  searchTerms: [
    "proteus anguinus",
    "human fish",
    "cave salamander",
    "blind salamander europe",
    "moceraski proteus",
  ],

  faqs: [
    {
      q: "Is the olm really blind?",
      a: "Yes. Its embryos start to develop eyes and then stop after about four months; the eyes regress and end up small and buried beneath a layer of skin. It still has light-sensitive tissue in the skin and pineal region, so it reacts to light, but it cannot form an image.",
    },
    {
      q: "How long does an olm live?",
      a: "The best estimate is an average adult lifespan of around 68 years and a predicted maximum of just over 100. That comes from a demographic model of the CNRS colony at Moulis in France, using more than 50 years of birth and death records. No single individual has yet been observed for a century — the figure is an extrapolation from an exceptionally low adult mortality rate.",
    },
    {
      q: "Can an olm really survive years without food?",
      a: "Yes. Controlled experiments have shown survival of up to ten years without feeding. The olm has a very low metabolic rate, moves little, and when food runs out it reduces activity further and metabolises its own tissue reserves. In a cave, where food arrives only when floodwater carries it in, that is not an exotic ability but a basic requirement.",
    },
    {
      q: "Where do olms live?",
      a: "Only in the flooded caves and groundwater of the Dinaric karst — Slovenia, Croatia, Bosnia and Herzegovina, Montenegro and a small area of north-eastern Italy near Trieste. It is the only exclusively cave-dwelling vertebrate in Europe. Introduced populations exist near Vicenza, at Kranj, and in a research laboratory in the French Pyrenees.",
    },
    {
      q: "Why is the olm called a baby dragon?",
      a: "Because heavy rain occasionally washes olms out of cave systems, and pale, limbed creatures emerging from underground invited an obvious explanation. Janez Vajkard Valvasor recorded the local belief in 1689 that they were the young of a dragon living beneath the mountains. It was formally described in 1768 as Proteus anguinus, the first cave animal ever named scientifically.",
    },
    {
      q: "Why is the olm Vulnerable?",
      a: "Because its habitat is groundwater, and groundwater takes whatever is put on the land above it. Karst drains fast and filters poorly, so agricultural runoff, sewage and industrial pollution reach the caves directly. Its area of occupancy is under 2,000 square kilometres and severely fragmented, populations cannot recolonise one another through solid rock, and illegal collection for aquaria removes animals that take fourteen years to reach maturity.",
    },
  ],

  seo: {
    title: "Olm — Blind Cave Salamander, 100-Year Lifespan & Neoteny",
    description:
      "A researched profile of the olm (Proteus anguinus): how it lives blind in Balkan cave water, why it can go a decade without food, what the century-long lifespan estimate is actually based on, and why it is Vulnerable.",
    keywords: [
      "olm",
      "proteus anguinus",
      "blind cave salamander",
      "olm lifespan",
      "human fish salamander",
    ],
  },

  sources: [
    {
      label: "Proteus anguinus — Red List assessment (2024, e.T18377A227229041)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/18377/227229041",
    },
    {
      label: "Extreme lifespan of the human fish (Proteus anguinus): a challenge for ageing mechanisms",
      publisher: "Biology Letters",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3030882/",
    },
    {
      label: "Proteus anguinus — species account",
      publisher: "AmphibiaWeb, University of California, Berkeley",
      url: "https://amphibiaweb.org/species/4229",
    },
    {
      label: "Olm — EDGE species profile",
      publisher: "Zoological Society of London",
      url: "https://www.edgeofexistence.org/species/olm/",
    },
    {
      label: "Surveying Europe's only cave-dwelling chordate species using environmental DNA",
      publisher: "PLOS ONE",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5271363/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default olm;
