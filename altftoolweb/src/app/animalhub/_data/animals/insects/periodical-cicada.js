// Periodical cicada (Magicicada septendecim) — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const periodicalCicada = {
  slug: "periodical-cicada",
  category: "insects",
  name: "Periodical Cicada",
  scientificName: "Magicicada septendecim",
  otherNames: ["Pharaoh cicada", "17-year locust", "Linnaeus's 17-year cicada"],

  summary:
    "Spends seventeen years underground drinking sap from tree roots, then emerges in millions at once — a strategy that works precisely because no predator can afford to wait that long.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Magicicada_septendecim-female_ventral.jpg",
    alt: "A periodical cicada hanging beneath a twig, red eyes and orange wing veins visible with broad orange bands along the underside of its abdomen",
    credit: "peterwchen / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/28/17-year_periodical_cicada_%28Magicicada_septendecim%29_2013.jpg",
      alt: "A pale, freshly moulted cicada with soft white wings hanging beside the empty brown nymphal shell it has just climbed out of, on a tree trunk",
      credit: "Futureman1199 / Wikimedia Commons",
      title: "The last five minutes of seventeen years",
      caption:
        "A cicada leaves the ground as a brown nymph, climbs the nearest trunk, splits along the back and pulls itself out cream-white with crumpled wings. It hardens and darkens over the next several hours, and is then as vulnerable as it will ever be again — which is why the whole brood does it in the same few nights.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/69/17-year_periodical_cicada_%28Magicicada_septendecim%29.jpg",
      alt: "A pale teneral cicada on tree bark with its wings now expanded and still creamy-yellow, beside its discarded brown nymphal skin",
      credit: "Futureman1199 / Wikimedia Commons",
      title: "Wings inflate, colour comes last",
      caption:
        "Within an hour the wings are pumped full of haemolymph and unfolded, but the body is still soft and pale. The black-and-orange adult colouring takes several more hours to develop, and until it does the cicada cannot fly.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Magicicada_septendecim_%26_Magicicada_cassini_%2817-year_periodical_cicadas%29_%28Flint_Ridge%2C_Ohio%2C_USA%29_1_%2827871819506%29.jpg/1920px-Magicicada_septendecim_%26_Magicicada_cassini_%2817-year_periodical_cicadas%29_%28Flint_Ridge%2C_Ohio%2C_USA%29_1_%2827871819506%29.jpg",
      alt: "Ground carpeted with hundreds of empty brown cicada shells, with a few dark adult cicadas among them",
      credit: "James St. John / Wikimedia Commons",
      title: "What satiation looks like",
      caption:
        "Brood V in Ohio in 2016, and every shell is one cicada that got out. The emergence contains both Magicicada septendecim and the smaller M. cassini — broods are year-classes, not species, and several share the same calendar.",
    },
  ],

  headline: "Seventeen years of nothing, then everything at once",
  intro: [
    "Magicicada septendecim is the largest and most northern of the seven periodical cicadas, and the one whose call — a rising, falling whine that people have long transcribed as Pharaoh — carries furthest. It spends seventeen years as a nymph beneath the soil, feeding on fluid drawn from tree roots, and then, in a single synchronised week, an entire generation climbs out.",
    "Two things about it are unusual enough to have generated a small scientific literature of their own. The first is the number seventeen, which is prime, as is thirteen, the other cycle length in the genus — and there is a reasonable argument that this is not a coincidence. The second is that no individual cicada gains anything from emerging in a crowd. The crowd is the defence, and it works only because it is enormous.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Hemiptera",
    family: "Cicadidae",
    genus: "Magicicada",
    species: "Magicicada septendecim",
  },

  conservation: {
    status: "NT",
    assessmentYear: 1996,
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate; densities at emergence have been censused as high as 1.5 million individuals per acre, but no range-wide figure exists",
    note: "Assessed as Near Threatened in 1996 and never reassessed — three decades old, and the age matters. The species is not scarce during an emergence; the concern is structural. Periodical cicadas exist as geographically fixed broods that cannot recolonise: a population wiped out by land clearance has no route back, because there are no dispersing adults in the intervening sixteen years and neighbouring broods are on a different calendar. Of the thirty broods catalogued in 1907, only fifteen survive; Brood XI was last seen in 1954 and Brood XXI is also gone. Urban expansion, forest clearance and the felling of the mature deciduous trees the nymphs feed on are what removes a brood, and each loss is permanent.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Adult body length",
      value: "About 2.4–3.3 cm",
      min: 2.4,
      max: 3.3,
      unit: "cm",
      note: "Magicicada septendecim is the largest of the seven periodical cicadas; periodical cicadas overall run to roughly three-quarters the size of the annual cicadas in the same region",
    },
    {
      key: "development-period",
      label: "Years underground",
      value: "17 years",
      min: 17,
      max: 17,
      unit: "years",
      note: "The median is seventeen; individual life cycles have been recorded between about thirteen and twenty-one years, and four-year-early emergences ('stragglers') are well documented",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "About 4–6 weeks",
      min: 4,
      max: 6,
      unit: "weeks",
      note: "The whole above-ground phase of a brood is over inside two months",
    },
    {
      key: "emergence-density",
      label: "Emergence density",
      value: "Up to about 1.5 million per acre",
      max: 1500000,
      unit: "cicadas/acre",
      note: "The most-cited figure comes from a census of Brood XIII at Raccoon Grove, Illinois in 1956",
    },
    {
      key: "emergence-temperature",
      label: "Emergence trigger",
      value: "About 18°C soil temperature at 20 cm depth",
      unit: "°C",
      note: "Roughly 64°F measured seven to eight inches down; emergence runs from late April in the south to early June further north",
    },
    {
      key: "clutch-size",
      label: "Eggs per female",
      value: "Up to about 500",
      max: 500,
      unit: "eggs",
      note: "Cut into slits in the twigs of young trees with a blade-like ovipositor",
    },
    {
      key: "extant-broods",
      label: "Surviving broods",
      value: "15, from 30 originally catalogued",
      min: 15,
      max: 15,
      unit: "broods",
      note: "Twelve 17-year broods and three 13-year broods; Brood XI and Brood XXI are extinct",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Xylem fluid — root sap as a nymph, tree fluids as an adult", icon: "Droplets" },
    { key: "defence", label: "Defence", value: "Predator satiation — safety in overwhelming numbers", icon: "ShieldAlert" },
    { key: "activity", label: "Activity", value: "Diurnal; males sing through the warm part of the day", icon: "Sun" },
    { key: "breeding-season", label: "Breeding", value: "Once every 17 years, late April to early June", icon: "CalendarClock" },
    { key: "ecological-role", label: "Ecological role", value: "A pulse of prey and nutrients; prunes young trees by egg-laying", icon: "Recycle" },
  ],

  highlights: ["development-period", "emergence-density", "lifespan-adult", "defence"],

  distribution: {
    continents: ["North America"],
    regions: [
      "The eastern and midwestern United States, east of the Great Plains",
      "The mid-Atlantic and Ohio Valley strongholds",
      "North to the Great Lakes and southern New England",
      "Marginal records in southeastern Canada",
    ],
    habitats: [
      "Mature deciduous woodland",
      "Woodland edge and old field margins",
      "Suburban neighbourhoods with mature trees",
      "River valley forest",
    ],
    elevation: "Lowland to mid-elevation deciduous forest",
    note: "The three 17-year Magicicada species, including this one, are the northern group; the four 13-year species are generally southern and midwestern. Distribution is not continuous — it is a mosaic of brood territories, each emerging in its own year, and adjacent counties can be on entirely different schedules.",
  },

  sections: [
    {
      id: "prime-numbers",
      title: "Why seventeen, and why prime",
      body: [
        "Magicicada life cycles come in exactly two lengths: thirteen years and seventeen years. Both are prime numbers, and the coincidence is hard to ignore. The standard explanation is about avoiding synchrony with anything else. A predator or parasite with a two-, three-, four- or six-year population cycle will only coincide with a prime-numbered emergence at intervals equal to the product of the two cycles — a three-year predator meets a seventeen-year cicada once every fifty-one years, which is far too rarely to build a specialist population around.",
        "The same logic applies to hybridisation between broods. Two broods on non-prime cycles would overlap comparatively often and could interbreed into intermediate, unsynchronised cycles; prime intervals minimise those meetings.",
        "It should be said that this remains a hypothesis rather than a demonstrated fact — it is difficult to test something with a seventeen-year period. What is not in doubt is the second half of the strategy, which does not depend on the arithmetic at all.",
      ],
    },
    {
      id: "satiation",
      title: "Predator satiation",
      body: [
        "An emerging periodical cicada is defenceless. It cannot bite, sting, kick or hide; it is large, slow, loud and highly nutritious, and every bird, squirrel, raccoon, snake, fish and domestic cat in the district eats as many as it can hold. This is not a failure of the strategy. It is the strategy.",
        "Densities during an emergence have been censused as high as 1.5 million individuals per acre. At that concentration local predators reach the point of physical satiation within days and simply stop eating; the great majority of cicadas are never touched, and enough survive to mate and lay that the brood is replaced. The technical term is predator satiation, and the periodical cicadas are its cleanest example anywhere in nature.",
        "The reason it cannot be exploited is the interval. A predator that specialised in cicadas would face sixteen years with nothing to eat, so no such specialist exists. Bird populations do rise in the year after a big emergence, on the surplus of food — and then fall back long before the next one.",
      ],
    },
    {
      id: "broods",
      title: "Broods are year-classes, not species",
      body: [
        "This is the point most often garbled. A brood is a population that emerges in a particular year across a particular region, and broods are numbered in Roman numerals — Brood X, Brood XIII, Brood XIX. There are fifteen extant broods: twelve on the 17-year cycle and three on the 13-year cycle, out of thirty catalogued in 1907. The rest have been lost.",
        "Crucially, a brood normally contains several species emerging together. Brood X, the largest 17-year brood, is made up of Magicicada septendecim alongside M. cassini and M. septendecula — three distinct species, on the same calendar, in the same woods, singing three different songs and mating within their own kind.",
        "There are seven Magicicada species arranged in three groups. The decim group holds this species and its 13-year counterparts M. tredecim and M. neotredecim; the cassini and decula groups each contain a 17-year and a 13-year species. So M. septendecim is not 'the periodical cicada' — it is one member of a genus that has repeatedly split along the seam between the two cycle lengths.",
      ],
    },
    {
      id: "the-emergence",
      title: "Seventeen years down, six weeks up",
      body: [
        "Nymphs live in the soil at the roots of broadleaf trees, feeding on xylem fluid — the dilute, mineral-carrying sap moving up from the roots, which is so nutrient-poor that seventeen years is a plausible amount of time to grow on it. They pass through five instars, tunnelling slowly, and are otherwise entirely out of sight.",
        "Emergence is triggered by soil temperature: around 18°C at a depth of about twenty centimetres, which arrives in late April in the south and early June towards the northern edge. The nymphs dig upward in the same days across a whole district, climb the nearest vertical surface, split along the back and moult into pale, soft adults that darken over several hours. The discarded shells left on tree trunks and fence posts are the most visible trace an emergence leaves.",
        "Males then sing — M. septendecim produces a rising and falling whine often written as weeeee-whoa, and it is loud enough at brood density to interfere with conversation. Females answer with a wing flick, mate, and cut slits into the twigs of young trees with a blade-like ovipositor, laying up to about 500 eggs. The slit twigs often die back at the tips, a symptom called flagging, which is ugly on a young tree and harmless on a mature one. The adults die within four to six weeks; the eggs hatch, the new nymphs drop to the ground and dig in, and nothing further is seen for seventeen years.",
      ],
    },
  ],

  related: ["desert-locust", "emperor-dragonfly", "monarch-butterfly"],
  tags: ["cicada", "hemiptera", "north america", "mass emergence", "predator satiation", "near threatened"],
  searchTerms: [
    "magicicada septendecim",
    "17 year cicada",
    "periodical cicada brood",
    "pharaoh cicada",
    "why do cicadas come out every 17 years",
  ],

  faqs: [
    {
      q: "Why do periodical cicadas emerge every 17 years?",
      a: "The leading explanation is that thirteen and seventeen are prime numbers, so an emergence rarely coincides with the population cycle of any predator or parasite — a three-year predator would meet a seventeen-year brood only once every fifty-one years. That is a hypothesis rather than a proven fact, but the second half of the strategy, emerging in overwhelming numbers, is well demonstrated.",
    },
    {
      q: "What is predator satiation?",
      a: "Emerging in numbers so large that predators physically cannot eat them all. Periodical cicadas have been censused at up to 1.5 million per acre; local birds and mammals fill up within days and stop, so most cicadas are never eaten. No predator can specialise in them, because it would then have to survive sixteen years with nothing to eat.",
    },
    {
      q: "Is a cicada brood a single species?",
      a: "No — a brood is a year-class, not a species. Brood X, for example, contains Magicicada septendecim, M. cassini and M. septendecula emerging together in the same woods, each with its own song and mating within its own kind. There are seven Magicicada species and fifteen surviving broods.",
    },
    {
      q: "Do periodical cicadas damage trees?",
      a: "Only slightly, and mostly to young ones. Females cut slits into thin twigs to lay their eggs, and the tips beyond the slits often wither and die — a symptom called flagging. Mature trees shrug this off; newly planted saplings and young orchard stock can be set back, which is why netting is sometimes recommended in an emergence year.",
    },
    {
      q: "Are periodical cicadas endangered?",
      a: "Magicicada septendecim was assessed as Near Threatened in 1996 and has not been reassessed since. It is not scarce during an emergence, but broods are geographically fixed and cannot recolonise — of the thirty broods catalogued in 1907, only fifteen survive, and Brood XI was last recorded in 1954. Losing the mature deciduous woodland a brood depends on removes it permanently.",
    },
  ],

  seo: {
    title: "Periodical Cicada — 17-Year Cycles, Broods & Predator Satiation",
    description:
      "A researched profile of the periodical cicada (Magicicada septendecim): why the 13- and 17-year cycles are prime, how predator satiation works, what a brood actually is, and why lost broods never come back.",
    keywords: [
      "periodical cicada",
      "magicicada septendecim",
      "17 year cicada",
      "cicada broods",
      "predator satiation",
    ],
  },

  sources: [
    {
      label: "Magicicada septendecim — Red List assessment (1996)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/12691/3373584",
    },
    {
      label: "Periodical Cicada Information Pages — species, broods and emergence biology",
      publisher: "Biodiversity Research Collections, University of Connecticut",
      url: "https://cicadas.uconn.edu/",
    },
    {
      label: "Magicicada septendecim — species account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Magicicada_septendecim/",
    },
    {
      label: "Magicicada septendecim (Linnaeus, 1758) — taxonomic record",
      publisher: "Global Biodiversity Information Facility (GBIF)",
      url: "https://www.gbif.org/species/5792026",
    },
  ],

  updatedAt: "2026-07-29",
};

export default periodicalCicada;
