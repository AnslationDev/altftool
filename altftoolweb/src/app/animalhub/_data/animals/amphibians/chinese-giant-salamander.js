// Chinese giant salamander — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const chineseGiantSalamander = {
  slug: "chinese-giant-salamander",
  category: "amphibians",
  name: "Chinese Giant Salamander",
  scientificName: "Andrias davidianus",
  otherNames: ["Wa wa yu", "Infant fish"],

  summary:
    "A metre-and-a-half amphibian from the mountain streams of central China, farmed in its millions and almost gone from the wild — and, since genetic work split it into several distinct species, no longer even certain which animal a conservation programme is saving.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Velemlok_%C4%8D%C3%ADnsk%C3%BD_zoo_praha_1.jpg/1920px-Velemlok_%C4%8D%C3%ADnsk%C3%BD_zoo_praha_1.jpg",
    alt: "A Chinese giant salamander resting on the bottom of a tank, broad flat head and loose skin folds along its flanks",
    credit: "Petr Hamerník / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/2009_Andrias_davidianus.JPG/1920px-2009_Andrias_davidianus.JPG",
      alt: "A Chinese giant salamander in an aquarium, seen from above with its broad head and short limbs",
      credit: "J. Patrick Fischer / Wikimedia Commons",
      title: "A body built for the streambed",
      caption:
        "Everything about the shape is flattened: the head, the body, the limbs held out sideways. A salamander this size lives wedged under rocks and into bank cavities in fast water, where height would be a liability and grip is everything.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/73/Andrias_davidianus_china.JPG",
      alt: "A Chinese giant salamander in shallow water, its wrinkled lateral skin folds clearly visible",
      credit: "Namiac / Wikimedia Commons",
      title: "Breathing through the wrinkles",
      caption:
        "Those loose folds running along each flank are not slack skin but respiratory surface. Adults take up most of their oxygen cutaneously, which ties them to cold, fast, well-oxygenated water and makes warming or polluted streams lethal.",
    },
  ],

  headline: "The largest amphibian on Earth, and nobody is sure how many species that is",
  intro: [
    "Chinese giant salamanders reach 1.8 metres and 50 kilograms, belong to a family that separated from all other amphibians more than 170 million years ago, and spend their entire lives in cold mountain streams breathing through their skin. They are the largest living amphibians by a wide margin.",
    "They are also very close to gone. A survey of 97 sites across 16 provinces between 2013 and 2016 found salamanders at four of them, and even those animals may have escaped from farms. Meanwhile Chinese farms hold millions. And since 2018 the genetics have made the problem harder rather than easier: what was treated as one widespread species is a complex of several, which means decades of moving and releasing animals may have been mixing species that separated millions of years ago.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Caudata",
    family: "Cryptobranchidae",
    genus: "Andrias",
    species: "Andrias davidianus",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2023,
    populationTrend: "decreasing",
    populationEstimate:
      "Unknown but extremely low; a 2013–2016 survey of 97 sites across 16 provinces detected salamanders at only four",
    note: "Critically Endangered, with the wild population estimated to have fallen by more than 80 per cent since the 1950s and around 90 per cent of the habitat degraded or destroyed by 2000. The species is on CITES Appendix I. The 2023 assessment was issued under a new Red List identifier because the taxon itself was redefined — the earlier listing covered what is now recognised as several species, one of which, Andrias sligoi, is assessed separately and may be nearly extinct in the wild.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "1.1–1.8 m",
      min: 1.1,
      max: 1.8,
      unit: "m",
      note: "Adults are typically 1.15–1.3 m. The 1.8 m record specimen, from near Guiyang, is now referred to the South China giant salamander, Andrias sligoi.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "25–50 kg",
      min: 25,
      max: 50,
      unit: "kg",
      note: "Average adults are 25–30 kg. Individuals of 52 kg and 59 kg have been reported.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "At least 60 years",
      min: 60,
      max: 60,
      unit: "years",
      note: "Documented from captive animals; the true maximum is unknown. Claims of 200 years are not supported.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "400–500 eggs",
      min: 400,
      max: 500,
      unit: "eggs",
      note: "Laid in an underwater den and guarded by the male; they hatch after roughly 50–60 days.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 5–6 years",
      min: 5,
      max: 6,
      unit: "years",
      note: "Reached at roughly 40–50 cm in length",
    },
    {
      key: "lineage-age",
      label: "Age of the lineage",
      value: "More than 170 million years",
      min: 170,
      max: 170,
      unit: "million years",
      note: "The cryptobranchid giant salamanders separated from all other amphibians in the Jurassic.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — crabs, fish, insects, amphibians and smaller giant salamanders", icon: "Drumstick" },
    { key: "water-type", label: "Water type", value: "Freshwater — cold, fast, rocky mountain streams", icon: "Droplet" },
    { key: "activity", label: "Activity", value: "Nocturnal; spends the day wedged into bank cavities and under rocks", icon: "Moon" },
    { key: "respiration", label: "Breathing", value: "Mostly through the skin, via the folds along each flank", icon: "Wind" },
    { key: "taxonomic-status", label: "Taxonomy", value: "One of at least four named species in a cryptic complex", icon: "GitBranch" },
    { key: "ecological-role", label: "Ecological role", value: "Top aquatic predator of its stream systems", icon: "Network" },
  ],

  highlights: ["length", "weight", "lifespan", "taxonomic-status"],

  distribution: {
    continents: ["Asia"],
    regions: ["Central, south-western and southern China — Yangtze, Yellow and Pearl river basins"],
    habitats: ["Cold rocky mountain streams", "Forested hill catchments", "Stream-bank cavities and caves"],
    elevation: "About 100–1,500 m, most records between 300 and 800 m",
    note: "Historically recorded from Qinghai east to Jiangsu and south to Sichuan, Guangxi and Guangdong. That map is now largely historical: the range is severely fragmented, and much of the recent distribution data reflects farm escapees and deliberate releases rather than surviving native populations.",
  },

  sections: [
    {
      id: "biology",
      title: "Living in cold water",
      body: [
        "An adult Chinese giant salamander has small eyes with no eyelids, poor vision, and a lateral line system of sensory nodes along its head and body that detects the water movement of anything passing nearby. It hunts by ambush and by suction, opening its mouth fast enough to pull in crabs, fish, frogs and insect larvae with the inrushing water.",
        "It has lungs but relies mainly on its skin for gas exchange, which is what the deep wrinkled folds along each flank are for — they add surface area. This ties it to cold, fast, well-oxygenated water in a way that admits very little flexibility. Feeding is reported to stop above about 20 °C, and temperatures near 35 °C are lethal. Warming, silted or slow-flowing water is not merely suboptimal for this animal; it is uninhabitable.",
        "Cannibalism is routine rather than exceptional. In one dietary study the remains of other giant salamanders made up 28 per cent of the combined weight of all food items recovered — a useful correction to any picture of a placid bottom-dweller.",
        "Breeding happens between July and September. The male occupies and defends a den under the bank, the female lays a string of 400 to 500 eggs inside it, and the male guards them until they hatch some fifty to sixty days later.",
      ],
    },
    {
      id: "species-complex",
      title: "Not one species",
      body: [
        "Until recently every Chinese giant salamander was Andrias davidianus, described by Émile Blanchard in 1871 and treated as a single species spread across a very large area of China. In 2018 a genetic study of wild and farmed animals found at least five deeply divergent lineages that had separated from one another roughly 5 to 10 million years ago — far too long to be one species.",
        "Formal names followed. In 2019 work on historical museum specimens revived Andrias sligoi, described by Edward Boulenger in 1924 and later sunk into A. davidianus, for the southern lineage; that paper also identified the largest known Andrias specimen as belonging to it, making A. sligoi rather than A. davidianus the largest amphibian species. Andrias jiangxiensis was described from Jiangxi in 2022, and Andrias cheni from the Huangshan mountains of Anhui in 2023.",
        "A 2024 species-delimitation analysis of thirty mitogenomes concluded that most models support nine Chinese species-level lineages, and essentially all support at least seven. Five of them still have no name, which matters practically as well as academically: an unnamed species cannot be listed, protected or funded.",
        "So Andrias davidianus as it is used today is a narrower animal than the one most older sources describe. Figures quoted for 'the Chinese giant salamander' before about 2019 — including much of the size and distribution data — belong to the complex as a whole.",
      ],
    },
    {
      id: "farms",
      title: "Millions in farms, four sites in the wild",
      body: [
        "Chinese giant salamanders are a luxury food and a traditional medicine ingredient, and a commercial farming industry grew rapidly around them. A 2011 census of licensed farms in Shaanxi province alone counted 2.6 million animals, and the Qinling region of Shaanxi supplied roughly 70 per cent of national output in 2012.",
        "That industry has not relieved pressure on wild animals; it has replaced them. Farm stock is repeatedly topped up with wild-caught breeders, so demand from the farms drives poaching directly. Animals from different river systems are mixed in tanks, disease spreads in crowded conditions, and untreated farm wastewater goes back into the rivers.",
        "The release programmes were meant to help. Since 2008 at least 72,000 farmed salamanders have been released into the wild, generally without regard to which lineage they came from. Read against the genetics, that is a mechanism for hybridising species that have been separate for millions of years and for replacing surviving local populations with farm stock — one of the clearest cases on record of well-intentioned conservation doing harm.",
        "The wild picture is stark. A field survey between 2013 and 2016 covered 97 sites with suitable habitat or historical records across 16 provinces and detected salamanders at four of them, in numbers that could be counted on two hands, and even those animals may have originated from nearby farms.",
      ],
    },
    {
      id: "outlook",
      title: "What a recovery would need",
      body: [
        "The conservation problem now has two halves that have to be solved together. The first is the familiar one: stop the poaching, clean and reconnect the streams, and protect the fragments of habitat that still have cold fast water in forested catchments.",
        "The second is newer and specific to this animal. Before a release programme can help, it has to know which species it is releasing and where that species belongs, which means genotyping farm stock and the surviving wild populations and matching them to river systems. Naming the remaining lineages is part of that work rather than a separate academic exercise, because conservation frameworks cannot act on an animal that has no name.",
        "There are grounds for cautious hope. Genetically pure wild populations of Andrias jiangxiensis were found in Jiangxi when the species was described in 2022, which shows that intact native stock can still exist and can be identified. Whether the same is true across the rest of the historical range is the question the next decade of survey work has to answer.",
      ],
    },
  ],

  related: ["axolotl", "golden-poison-frog", "american-bullfrog"],
  tags: ["salamander", "china", "critically endangered", "species complex", "freshwater", "largest amphibian"],
  searchTerms: [
    "andrias davidianus",
    "giant salamander china",
    "wa wa yu",
    "andrias sligoi",
    "cryptobranchidae",
  ],

  faqs: [
    {
      q: "How big does a Chinese giant salamander get?",
      a: "Adults are typically 1.15 to 1.3 metres long and weigh 25 to 30 kilograms, with a maximum of about 1.8 metres and 50 kilograms; individuals of 52 and 59 kilograms have been reported. That makes giant salamanders the largest living amphibians by a wide margin.",
    },
    {
      q: "Is the Chinese giant salamander really several species?",
      a: "Yes. Genetic work published in 2018 identified at least five deeply divergent lineages that separated 5 to 10 million years ago. Andrias sligoi was revived as a distinct species in 2019, Andrias jiangxiensis was described in 2022 and Andrias cheni in 2023, and a 2024 analysis supports seven to nine species-level lineages in total. Several still have no formal name.",
    },
    {
      q: "Why is the Chinese giant salamander Critically Endangered when millions are farmed?",
      a: "Farmed animals are not a wild population. Farms are stocked with wild-caught breeders, which drives poaching; crowded conditions spread disease; and farm wastewater enters the rivers. A survey of 97 sites across 16 provinces in 2013–2016 found salamanders at only four, and even those may have escaped from farms.",
    },
    {
      q: "Why is releasing farmed salamanders a problem?",
      a: "Because farms mix animals from different river systems, and at least 72,000 have been released since 2008 without regard to lineage. Now that the salamanders are known to be several distinct species, those releases risk hybridising species separated by millions of years, spreading farm pathogens, and displacing the last local populations.",
    },
    {
      q: "How does a Chinese giant salamander breathe?",
      a: "Mainly through its skin. It has lungs, but adults take up most of their oxygen across the body surface, which is what the deep folds running along each flank are for — they add surface area. This confines the species to cold, fast, well-oxygenated water; it stops feeding above about 20 °C.",
    },
  ],

  seo: {
    title: "Chinese Giant Salamander — Size, Species Complex & Conservation",
    description:
      "A researched profile of the Chinese giant salamander (Andrias davidianus): the world's largest amphibian, Critically Endangered in the wild, farmed in millions, and now known to be a complex of several distinct species.",
    keywords: [
      "chinese giant salamander",
      "andrias davidianus",
      "largest amphibian",
      "andrias sligoi",
      "giant salamander conservation",
    ],
  },

  sources: [
    {
      label: "Andrias davidianus — Red List assessment (2023, e.T179010104A48438418)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/179010104/48438418",
    },
    {
      label: "Historical museum collections clarify the evolutionary history of cryptic species radiation in the world's largest amphibians",
      publisher: "Ecology and Evolution (Turvey et al., 2019)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6787787/",
    },
    {
      label: "What's in a name? Using species delimitation to inform conservation practice for Chinese giant salamanders",
      publisher: "Evolutionary Journal of the Linnean Society",
      url: "https://academic.oup.com/evolinnean/article/3/1/kzae007/7690816",
    },
    {
      label: "Range-wide decline of Chinese giant salamanders Andrias spp. from suitable habitat",
      publisher: "Oryx, Cambridge University Press",
      url: "https://www.cambridge.org/core/journals/oryx/article/rangewide-decline-of-chinese-giant-salamanders-andrias-spp-from-suitable-habitat/6E2C54AD4305207EA823D577686C6D98",
    },
    {
      label: "A conservation action plan for Chinese giant salamanders",
      publisher: "Zoological Society of London",
      url: "https://cms.zsl.org/sites/default/files/2024-09/A%20conservation%20action%20plan%20for%20Chinese%20giant%20salamanders.pdf",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default chineseGiantSalamander;
