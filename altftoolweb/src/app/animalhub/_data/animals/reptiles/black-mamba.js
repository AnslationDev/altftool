// Black mamba — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const blackMamba = {
  slug: "black-mamba",
  category: "reptiles",
  name: "Black Mamba",
  scientificName: "Dendroaspis polylepis",
  otherNames: ["Common black mamba", "Black-mouthed mamba"],

  summary:
    "Africa's longest venomous snake and the fastest snake ever measured, named for the ink-black lining of its mouth rather than for the colour of its body.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Dendroaspis_polylepis_%2814%29.jpg/1920px-Dendroaspis_polylepis_%2814%29.jpg",
    alt: "A black mamba, whose body colour is grey to olive rather than black",
    credit: "TimVickers / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Black_Mamba_%28Dendroaspis_polylepis%29_%286002021427%29.jpg/1920px-Black_Mamba_%28Dendroaspis_polylepis%29_%286002021427%29.jpg",
      alt: "A black mamba photographed near Skukuza, Kruger National Park, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Grey, not black",
      caption:
        "The body is olive, gunmetal or brownish grey — never black. The name comes from the inside of the mouth, which is inky and only shown when the snake gapes in a threat display.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Black_Mamba_%28Dendroaspis_polylepis%29_%286002481884%29.jpg/1920px-Black_Mamba_%28Dendroaspis_polylepis%29_%286002481884%29.jpg",
      alt: "A black mamba photographed in Kruger National Park, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Built long and light",
      caption:
        "A three-metre mamba weighs barely more than a kilogram. That extreme ratio of length to mass is what makes the species quick over open ground — there is very little body for the muscles to move.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Black_Mamba_%28Dendroaspis_polylepis%29_%286002570110%29.jpg/1920px-Black_Mamba_%28Dendroaspis_polylepis%29_%286002570110%29.jpg",
      alt: "A black mamba in Kruger National Park, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "A hunter that uses its eyes",
      caption:
        "Mambas are diurnal and hunt visually, holding the head and forebody well off the ground to scan. They have no heat-sensing pits at all — the infrared organs readers assume all snakes possess belong to vipers, pythons and some boas.",
    },
  ],

  headline: "The fastest snake measured, and the most misdescribed",
  intro: [
    "The black mamba is the longest venomous snake in Africa and the second longest in the world, reaching 4.3 to 4.5 m at the extreme, though most adults are two to three metres. It is also the fastest snake ever measured, capable of about 16 km/h in short bursts across open ground.",
    "Almost everything else commonly said about it is inflated. It is not black; the body is grey or olive, and the name comes from the lining of the mouth. It does not travel at 20 km/h, cannot outrun a person, and does not chase people. Its venom is not the most potent of any snake — several Australian elapids are far more toxic drop for drop. What makes a bite serious is the combination of a large dose, a fast-acting neurotoxin and, historically, distance from a hospital.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Elapidae",
    genus: "Dendroaspis",
    species: "Dendroaspis polylepis",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "stable",
    populationEstimate: "No global estimate; widespread and locally common",
    note: "Assessed as Least Concern in 2021 on the basis of a very large sub-Saharan range with no documented decline. The species tolerates degraded and farmed landscapes reasonably well. Local pressure comes almost entirely from being killed on sight, which is heavy near settlements but has not produced a measurable population effect at the scale of the range.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "2–3 m typically; up to 4.3–4.5 m",
      min: 2,
      max: 4.5,
      unit: "m",
      note: "The longest venomous snake in Africa, and the second longest anywhere after the king cobra",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Around 1 kg; range 0.5–2.4 kg",
      min: 0.5,
      max: 2.4,
      unit: "kg",
      note: "A sample of seven wild individuals averaged 1.03 kg — remarkably light for a snake of this length",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Up to about 16 km/h in short bursts",
      min: 11,
      max: 16,
      unit: "km/h",
      note: "The fastest speed measured in any snake, held only over short distances on flat, open ground. The frequently quoted 20 km/h is not supported by any measurement",
    },
    {
      key: "venom-yield",
      label: "Venom yield per bite",
      value: "100–120 mg typically; up to 400 mg",
      min: 100,
      max: 400,
      unit: "mg",
      note: "A large dose relative to the amount needed to be dangerous, which is a bigger factor in outcomes than raw potency",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "6–17 eggs",
      min: 6,
      max: 17,
      unit: "eggs",
      note: "Hatchlings emerge at 40–60 cm, fully venomous and entirely independent",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "At least 11 years",
      min: 11,
      max: 11,
      unit: "years",
      note: "Eleven years is the longest documented; wild longevity is otherwise poorly known",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — birds, rodents, hyraxes and bushbabies", icon: "Drumstick" },
    { key: "venom-type", label: "Venom", value: "Neurotoxic — dendrotoxins and three-finger toxins, with little tissue damage", icon: "Droplet" },
    { key: "activity", label: "Activity", value: "Diurnal, hunting by sight and returning to a fixed lair", icon: "Sun" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — elapids have no pit organs of any kind", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Several times a year as an adult; more often while growing", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Mid-level predator, and a significant check on rodents around farmland", icon: "Globe" },
  ],

  highlights: ["length", "top-speed", "venom-yield", "venom-type"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "East Africa from Ethiopia and Somalia southwards",
      "Kenya, Tanzania, Uganda",
      "Zambia, Zimbabwe, Mozambique and Malawi",
      "Botswana, Namibia and northern South Africa",
      "Isolated populations in West Africa",
    ],
    habitats: [
      "Savanna woodland",
      "Rocky outcrop and kopje",
      "Scrub and thornveld",
      "Riverine forest edge",
      "Farmland near cover",
    ],
    elevation: "Mostly below 1,000 m, occasionally to about 1,800 m",
    note: "Distribution is patchier than range maps suggest. The species needs a permanent refuge — a termite mound, a rock crevice, a hollow tree — and individuals use the same lair for years, so mambas are found where suitable holes are rather than evenly across suitable vegetation.",
  },

  sections: [
    {
      id: "speed",
      title: "How fast a black mamba actually moves",
      body: [
        "The black mamba is the fastest snake for which speeds have been measured, reaching roughly 16 km/h over short distances on flat, open ground. That is genuinely exceptional among snakes and unremarkable among animals — a fit adult runs faster, and almost any mammal a mamba might meet is quicker over distance.",
        "The 20 km/h figure that circulates widely has no measurement behind it. Nor does the image of a snake pursuing a person: mambas move at speed to reach cover, not to close on a target, and the direction of travel is towards the lair.",
        "The physical explanation is body plan rather than muscle. A three-metre mamba weighs about a kilogram, which is astonishingly little for that length, and the low mass gives it acceleration a heavier snake could not manage. Speed also depends on the surface — it needs open, firm ground and drops sharply in thick vegetation.",
      ],
    },
    {
      id: "venom",
      title: "Potency, dose and what a bite does",
      body: [
        "Black mamba venom is predominantly neurotoxic. Dendrotoxins block potassium channels at the nerve terminal, causing excessive release of the transmitter that drives muscle contraction, while three-finger toxins block the receptor on the muscle side. The combination produces early twitching and sweating followed by progressive paralysis, and death, when it comes, is from respiratory failure — typically within seven to fifteen hours without treatment.",
        "It is not the most potent snake venom. Its murine intravenous LD50 sits around 0.32 to 0.33 mg per kilogram, which places it well behind several Australian elapids and behind some sea snakes. The description 'the world's most venomous snake' has been applied to it repeatedly, and it is wrong on the toxicology.",
        "What makes a bite dangerous is everything around the potency: a snake big enough to deliver 100 to 120 mg routinely and up to 400 mg, a venom that acts quickly, and a range that includes many places hours from a hospital with mechanical ventilation. Antivenom exists and works — the South African polyvalent product covers the species — but it must be given in quantity and early, and access rather than pharmacology is what decides most outcomes.",
      ],
    },
    {
      id: "behaviour",
      title: "Reputation and behaviour",
      body: [
        "The black mamba's defensive display is what most people describe when they describe an attack: the front third of the body raised, the narrow neck slightly flattened, and the mouth held open to show a lining so dark it looks like a hole. It is a warning, and it is usually the last stage before the snake leaves.",
        "Most bites happen when the animal cannot leave. Mambas are strongly attached to a home refuge and a person standing between a mamba and its lair is, from the snake's side, an obstacle rather than a threat to be avoided. Handling, farm work in dense cover and stepping on an unseen snake account for most of the rest.",
        "In the field the species is shy and quick to disappear, and observers who work with it consistently describe a nervous animal rather than an aggressive one. Being reliably able to reach cover is exactly what allows a snake to be shy.",
      ],
    },
    {
      id: "hunting",
      title: "A diurnal, visual hunter",
      body: [
        "Mambas hunt in daylight, which sets them apart from most large snakes. They move with the head and forebody raised, scanning, and take birds, rodents, hyraxes, bats and bushbabies — warm-blooded prey almost exclusively.",
        "The strike is a single quick bite followed by release. The venom works fast enough that the snake does not need to hold on, and it then follows the scent trail of the dying animal, reading it with the tongue and the vomeronasal organ. Prey is swallowed whole, head first.",
        "They have no heat-sensing pits, which is worth stating because readers routinely assume all snakes do. Infrared organs belong to pit vipers, to pythons and to some boas; the elapids — mambas, cobras, kraits, taipans — hunt without them, using vision and scent.",
      ],
    },
    {
      id: "people",
      title: "Snakebite as a public health problem",
      body: [
        "Snakebite kills tens of thousands of people a year in sub-Saharan Africa and disables many more, and the World Health Organization classifies it as a neglected tropical disease. The black mamba contributes a small share of that total — most African bites come from puff adders and from carpet vipers — but a high share of the fear.",
        "The practical picture is unglamorous: agricultural workers and children, bites to the lower leg or hand, hours of travel to a facility that may not stock antivenom, and a product that is expensive and often in short supply. Improving outcomes is a question of antivenom supply chains and rural health infrastructure, not of the snakes.",
        "For the species itself, the main direct pressure is being killed on sight near settlements. It remains widespread and is assessed as Least Concern, and it does real work where it is left alone — a mamba territory is a standing rodent-control operation on the edge of farmland.",
      ],
    },
  ],

  related: ["king-cobra", "gila-monster"],
  tags: ["snake", "venomous", "elapid", "africa", "savanna", "reptile"],
  searchTerms: ["dendroaspis polylepis", "mamba", "fastest snake", "black mamba venom", "black mamba speed"],

  faqs: [
    {
      q: "How fast is a black mamba?",
      a: "About 16 km/h in short bursts over flat, open ground — the fastest speed measured in any snake. The commonly repeated 20 km/h has no measurement behind it, and a fit person on foot is faster. Mambas move at speed to reach a refuge, not to pursue anything.",
    },
    {
      q: "Why is it called a black mamba if it isn't black?",
      a: "The body is grey, olive or brownish. The name refers to the inside of the mouth, which is inky black and is displayed when the snake gapes as a warning. That gape is the origin of both the name and most descriptions of a black mamba 'attacking'.",
    },
    {
      q: "Is the black mamba the most venomous snake in the world?",
      a: "No. Its murine LD50 of roughly 0.32 to 0.33 mg per kilogram places it well behind several Australian elapids, including the inland taipan. What makes a bite dangerous is the delivered dose — 100 to 120 mg is routine and 400 mg has been recorded — combined with fast-acting neurotoxins and, across much of its range, long distances to a hospital.",
    },
    {
      q: "What happens if a black mamba bites you?",
      a: "The venom is neurotoxic. Early signs include a metallic taste, sweating and muscle twitching, followed by drooping eyelids, difficulty swallowing and progressive paralysis; untreated, death follows from respiratory failure, typically in seven to fifteen hours. Antivenom is effective but must be given early and in quantity, alongside airway support.",
    },
    {
      q: "Do black mambas chase people?",
      a: "No. The behaviour that produces that story is a snake moving fast towards its own refuge, which may be past or through where a person is standing. Mambas keep a fixed lair and are strongly attached to it, and most bites occur when the animal is cornered, stepped on or handled.",
    },
  ],

  seo: {
    title: "Black Mamba — Speed, Venom, Size & Behaviour",
    description:
      "A researched profile of the black mamba (Dendroaspis polylepis): its measured top speed, why it is not the world's most venomous snake, what its venom actually does, its behaviour and lair use, and its Least Concern status.",
    keywords: [
      "black mamba facts",
      "dendroaspis polylepis",
      "black mamba speed",
      "black mamba venom",
      "fastest snake",
    ],
  },

  sources: [
    {
      label: "Dendroaspis polylepis — Red List assessment (Branch et al., 2021)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/177584/15627370",
    },
    {
      label: "Dendroaspis polylepis entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Dendroaspis&species=polylepis",
    },
    {
      label: "Snakebite envenoming — fact sheet",
      publisher: "World Health Organization",
      url: "https://www.who.int/news-room/fact-sheets/detail/snakebite-envenoming",
    },
    {
      label: "Black mamba species profile",
      publisher: "National Geographic",
      url: "https://www.nationalgeographic.com/animals/reptiles/facts/black-mamba",
    },
  ],

  updatedAt: "2026-07-29",
};

export default blackMamba;
