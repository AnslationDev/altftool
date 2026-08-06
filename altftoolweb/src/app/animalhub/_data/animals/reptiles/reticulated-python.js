// Reticulated python — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const reticulatedPython = {
  slug: "reticulated-python",
  category: "reptiles",
  name: "Reticulated Python",
  scientificName: "Malayopython reticulatus",
  otherNames: ["Retic", "Sanca kembang", "Sanca batik"],

  summary:
    "The longest snake in the world, a heat-sensing ambush constrictor of Southeast Asian forest and farmland that is also the most heavily traded snake on Earth.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Python_reticulatus_%D1%81%D0%B5%D1%82%D1%87%D0%B0%D1%82%D1%8B%D0%B9_%D0%BF%D0%B8%D1%82%D0%BE%D0%BD-2.jpg/1920px-Python_reticulatus_%D1%81%D0%B5%D1%82%D1%87%D0%B0%D1%82%D1%8B%D0%B9_%D0%BF%D0%B8%D1%82%D0%BE%D0%BD-2.jpg",
    alt: "A reticulated python, showing the net-like pattern that gives the species its name",
    credit: "This photography was created by Mariluna . Other photos see here . / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Reticulated_Python_%28Malayopython_Reticulatus%29_at_Shymkent_Zoo.jpg",
      alt: "A reticulated python, its patterned scales clearly visible",
      credit: "Amangeldy Beksultan 2.0 / Wikimedia Commons",
      title: "The net that names it",
      caption:
        "'Reticulated' refers to the web-like geometry of the markings. Against leaf litter dappled with sunlight the pattern dissolves completely, which is what an ambush predator needs from its skin.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Reticulated_Python_%28Malayopython_Reticulatus%29.jpg",
      alt: "A reticulated python, one of the largest snake species in the world",
      credit: "Amangeldy Beksultan 2.0 / Wikimedia Commons",
      title: "Pits along the lip",
      caption:
        "The row of deep notches on the labial scales are infrared receptors. They give the snake a crude thermal image of a warm-blooded animal in total darkness, accurate enough to aim a strike by.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Malayopython_reticulatus_%28Netzpython%29_im_Exotarium_Oberhof_%283%29.jpg/1920px-Malayopython_reticulatus_%28Netzpython%29_im_Exotarium_Oberhof_%283%29.jpg",
      alt: "A reticulated python at the Exotarium Oberhof, Germany",
      credit: "Stephan van Helden / Wikimedia Commons",
      title: "Iridescence, not colour",
      caption:
        "The rainbow sheen on a fresh-shed python is structural: microscopic ridges on each scale split light rather than reflecting a pigment. It is strongest immediately after a shed and fades as the skin dulls.",
    },
  ],

  headline: "The longest snake in the world",
  intro: [
    "The reticulated python is the longest snake alive. Reliably measured wild individuals reach close to seven metres — the best-documented is a 6.95 m animal from East Kalimantan weighing 59 kg — and a captive female named Medusa was measured at 7.67 m in 2011. No other snake is credibly recorded at those lengths.",
    "It is not the heaviest; a green anaconda of the same length outweighs it substantially. What the python has instead is reach, a set of heat-sensing pits along its lips, and an unusual tolerance for landscapes people have altered. It thrives in oil palm plantations, drainage canals and the edges of towns, which is why one of the world's largest snakes is also one of the more frequently encountered.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Pythonidae",
    genus: "Malayopython",
    species: "Malayopython reticulatus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2018,
    populationTrend: "unknown",
    populationEstimate: "No global estimate; populations withstand very heavy harvest in Southeast Asia",
    note: "Assessed as Least Concern in 2018, under the older name Python reticulatus. The species is the most heavily traded snake in the world — hundreds of thousands of skins leave Indonesia and Malaysia legally each year, and monitoring suggests substantial under-reporting on top of that. It is listed on CITES Appendix II, and the assessment's central concern is whether harvest levels are being measured accurately rather than whether the species is currently declining.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Commonly 3–6 m; up to 6.95 m verified in the wild",
      min: 1.5,
      max: 6.95,
      unit: "m",
      note: "The longest reliably measured wild specimen was 6.95 m and 59 kg, from East Kalimantan. The captive female Medusa was measured at 7.67 m in 2011",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Large wild adults 45–75 kg",
      min: 45,
      max: 160,
      unit: "kg",
      note: "Wild pythons stay relatively lean; the heaviest recorded individuals are captive animals, Medusa among them at 158.8 kg",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "15–80 eggs",
      min: 15,
      max: 80,
      unit: "eggs",
      note: "Clutch size scales with the female's size, so the largest females lay the largest clutches",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 88 days",
      min: 80,
      max: 90,
      unit: "days",
      note: "Fastest at around 31–32 °C, which the brooding female maintains herself",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Over 20 years in captivity",
      min: 20,
      max: 25,
      unit: "years",
      note: "Wild longevity is poorly known — heavy harvest means few animals in hunted populations get the chance to grow old",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — rats and bats when small; civets, monkeys, pigs and deer when large", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal; a strong swimmer and a capable climber when young", icon: "Moon" },
    { key: "heat-sensing", label: "Heat sensing", value: "Deep infrared pits along the labial scales — a thermal image accurate enough to strike by in darkness", icon: "Thermometer" },
    { key: "nest-type", label: "Nest type", value: "None built — the female coils around the clutch and warms it by shivering", icon: "Egg" },
    { key: "shedding-frequency", label: "Shedding", value: "Every few weeks while growing; several times a year as an adult", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Top predator of forest and plantation, and a significant control on rodents", icon: "Globe" },
  ],

  highlights: ["length", "weight", "heat-sensing", "diet-type"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Myanmar, Thailand and Indochina",
      "Peninsular Malaysia and Singapore",
      "Indonesia including Sumatra, Java, Borneo and Sulawesi",
      "The Philippines",
      "Nicobar Islands",
    ],
    habitats: [
      "Tropical rainforest",
      "Riverbank and swamp forest",
      "Oil palm plantation",
      "Agricultural land and drainage canal",
      "Urban fringe",
    ],
    elevation: "Lowlands, mostly below 1,200 m",
    note: "The range spans thousands of islands, and the species has reached most of them by swimming — reticulated pythons have been recorded well out to sea. Several island populations are dwarfs: the pythons of Tanahjampea and southwest Sulawesi mature at a fraction of mainland size and are recognised as separate subspecies.",
  },

  sections: [
    {
      id: "length",
      title: "The longest snake, and how we know",
      body: [
        "Almost every remarkable snake length in circulation comes from a skin, an estimate or a photograph. Skins are the worst offenders: removing and drying a hide stretches it by twenty to forty per cent or more, so a genuine five-metre snake becomes a seven-metre trophy without anyone lying.",
        "The most famous case is 'Colossus', a python kept at Highland Park Zoo in Pittsburgh in the 1950s and widely reported at over ten metres. When the animal died, its fresh hide measured 7.29 m and its mounted skeleton 6.35 m — impressive, and nothing like the claim.",
        "What survives scrutiny is still extraordinary. A 6.95 m wild female from East Kalimantan, weighed at 59 kg, is the best-documented wild individual. The captive Medusa, measured under Guinness supervision in 2011, came in at 7.67 m and 158.8 kg. Both stand comfortably above any verified measurement for any other snake, which is why the reticulated python holds the record on evidence rather than on reputation.",
        "Typical animals are much smaller. Surveys of harvested pythons in southern Sumatra found adults spread across a wide range from about 1.5 m upward, with most well under four metres. Females grow considerably larger than males, and the giants are simply old females that were never caught.",
      ],
    },
    {
      id: "senses",
      title: "Seeing in infrared",
      body: [
        "Run a finger along a reticulated python's upper lip and you find a row of deep notches. These are pit organs, and each contains a membrane packed with heat-sensitive nerve endings — the same molecular machinery, evolved independently, that gives pit vipers their thermal sense.",
        "The pits detect radiated heat rather than reflected light, and the brain merges that input with vision to produce something closer to a combined image than to two separate senses. The practical result is that a python lying in total darkness can locate a rat by body heat alone and strike accurately enough to hit it.",
        "This is a genuine dividing line among snakes and one readers often get wrong. Pythons and many boas have labial pits; pit vipers have a single large pit between eye and nostril on each side. Cobras, mambas and other elapids have nothing of the kind, and neither, despite being a boa, does the green anaconda.",
      ],
    },
    {
      id: "brooding",
      title: "A snake that shivers to keep eggs warm",
      body: [
        "Pythons lay eggs, and unlike most snakes they do not abandon them. The female gathers the clutch into a pile and coils around it completely, forming a chamber that she stays inside for the roughly three months of incubation, barely moving and not feeding at all.",
        "She also heats it. By contracting her muscles in rapid, rhythmic shivers she raises her own temperature several degrees above the surrounding air and holds the eggs near the 31 to 32 °C that suits them best. It is facultative endothermy in an animal with no other means of generating body heat, and it costs her a large fraction of her reserves.",
        "Care ends abruptly at hatching. Young pythons emerge at around 60 cm, disperse immediately, and get nothing further from the female — who has by then lost enough condition that she may not breed again for a year or more.",
      ],
    },
    {
      id: "trade",
      title: "The most traded snake in the world",
      body: [
        "No other snake is harvested on this scale. Hundreds of thousands of reticulated python skins are exported legally from Indonesia and Malaysia each year for the luxury leather trade, alongside meat, gall bladders for traditional medicine, and live animals for the pet market. Independent monitoring in Indonesia has repeatedly found actual harvest well above the reported quota.",
        "The species tolerates it better than most large predators would. It matures quickly, lays very large clutches, and does well in the plantations and canal systems that replace forest, so populations have so far absorbed pressure that would have collapsed a slower-breeding animal. That is the reasoning behind the Least Concern listing.",
        "The uncertainty is in the data rather than the animal. Because harvest is decentralised and much of it undocumented, nobody can say confidently what fraction of the population is being taken, and the largest females — the ones producing most of the eggs — are also the most valuable skins. Better monitoring, rather than a ban, is what the assessments consistently call for.",
      ],
    },
    {
      id: "people",
      title: "Living alongside people",
      body: [
        "Reticulated pythons are found in irrigation ditches, under buildings and on plantation edges throughout their range, drawn by the rats that thrive around human settlement. Most encounters end with the snake being removed or killed, and the species' willingness to live in modified habitat is the main reason it remains common.",
        "It is also one of very few snakes large enough to treat an adult human as prey, and there are a small number of verified cases — two well-documented incidents on Sulawesi in 2017 and 2018 in which adults were killed and swallowed. These are genuinely rare events, confirmed by recovery of the victims, and they are worth stating plainly rather than either sensationalising or denying.",
        "Rarity is the point. Against a background of many thousands of daily encounters across Southeast Asia, fatal incidents number in the single figures over decades. A large python is dangerous to handle, and almost never dangerous to walk past.",
      ],
    },
  ],

  related: ["green-anaconda", "king-cobra"],
  tags: ["snake", "constrictor", "python", "asia", "rainforest", "reptile"],
  searchTerms: ["malayopython reticulatus", "python reticulatus", "longest snake", "retic python"],

  faqs: [
    {
      q: "What is the longest snake in the world?",
      a: "The reticulated python. The longest reliably measured wild specimen was 6.95 m and weighed 59 kg, from East Kalimantan, and a captive female named Medusa was measured at 7.67 m in 2011. Green anacondas are heavier at a given length but do not reach these lengths.",
    },
    {
      q: "Did a reticulated python ever reach ten metres?",
      a: "No verified individual has. The most cited claim, a python called Colossus kept in Pittsburgh in the 1950s, was reported at over ten metres; when the animal died its fresh skin measured 7.29 m and its skeleton 6.35 m. Skins stretch by twenty to forty per cent during removal and drying, which is where most oversized snake records come from.",
    },
    {
      q: "Do reticulated pythons have heat vision?",
      a: "They have infrared pits along the scales of the upper and lower lips, each lined with heat-sensitive nerve endings. The signal is combined with vision in the brain, and it is precise enough for the snake to locate and strike a warm-blooded animal in complete darkness.",
    },
    {
      q: "Do python mothers look after their eggs?",
      a: "Yes. The female coils tightly around the clutch for the whole of the roughly three-month incubation without feeding, and warms the eggs by shivering — rhythmic muscle contractions that raise her body temperature several degrees above the surrounding air. She leaves once the eggs hatch, and the young are independent from that moment.",
    },
    {
      q: "Are reticulated pythons dangerous to people?",
      a: "Rarely, but not never. It is one of the few snakes physically capable of killing and swallowing an adult, and two such cases were confirmed on Sulawesi in 2017 and 2018. Set against the many thousands of encounters that happen across Southeast Asia every day, incidents of that kind number in the single figures over decades.",
    },
  ],

  seo: {
    title: "Reticulated Python — Length Records, Heat Pits & the Skin Trade",
    description:
      "A researched profile of the reticulated python (Malayopython reticulatus): the world's longest snake, what its verified maximum length actually is, infrared pit organs, egg brooding by shivering, and the scale of the skin trade.",
    keywords: [
      "reticulated python facts",
      "malayopython reticulatus",
      "longest snake in the world",
      "python heat pits",
      "reticulated python size",
    ],
  },

  sources: [
    {
      label: "Python reticulatus — Red List assessment (Stuart et al., 2018)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/183151/1730027",
    },
    {
      label: "Malayopython reticulatus entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Malayopython&species=reticulatus",
    },
    {
      label:
        "Phylogeography of the reticulated python: conservation implications for the world's most traded snake species",
      publisher: "PLOS ONE (Auliya et al., 2017)",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5560690/",
    },
    {
      label: "Management and trade of Malayopython reticulatus",
      publisher: "CITES Animals Committee",
      url: "https://cites.org/sites/default/files/eng/com/ac/31/Docs/E-AC31-14-03-A.pdf",
    },
  ],

  updatedAt: "2026-07-29",
};

export default reticulatedPython;
