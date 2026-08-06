// Bullet ant — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const bulletAnt = {
  slug: "bullet-ant",
  category: "insects",
  name: "Bullet Ant",
  scientificName: "Paraponera clavata",
  otherNames: ["Conga ant", "Lesser giant hunting ant", "Hormiga veinticuatro", "Tocandira"],

  summary:
    "The insect at the top of the sting pain index, named for a sensation people compare to being shot — and the subject of an initiation ritual in which the ants are worn deliberately, dozens at a time.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Paraponera_clavata.jpg",
    alt: "A large reddish-black bullet ant photographed on leaf litter in Costa Rican rainforest",
    credit: "Hans Hillewaert / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Bullet_Ant_%28Paraponera_clavata%29_%2824502547659%29.jpg/1920px-Bullet_Ant_%28Paraponera_clavata%29_%2824502547659%29.jpg",
      alt: "A black bullet ant walking along a lichen-covered twig in Costa Rican rainforest",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Costa Rica, where it was measured",
      caption:
        "La Selva in the Caribbean lowlands is where much of what is known about this ant was worked out — colony size, foraging routes into the canopy, and the phorid flies that hunt injured workers.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Bullet_Ant_%28Paraponera_clavata%29_%2839222260024%29.jpg/1920px-Bullet_Ant_%28Paraponera_clavata%29_%2839222260024%29.jpg",
      alt: "A bullet ant walking over wet leaves in lowland rainforest in French Guiana",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Humid lowland forest only",
      caption:
        "The species is confined to wet lowland rainforest below about 750 metres, from Honduras and Nicaragua south through Amazonia. It does not survive in dry or seasonal forest.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paraponera_clavata_%2814336578579%29.jpg/1920px-Paraponera_clavata_%2814336578579%29.jpg",
      alt: "Close view of a reddish-brown bullet ant on a striped leaf, its finely ridged body covered in golden hairs",
      credit: "Graham Wise from Brisbane, Australia / Wikimedia Commons",
      title: "One caste, one size",
      caption:
        "Unlike most large ants, Paraponera has no worker castes — no minors, no majors, no soldiers. Every worker is the same, and even the queen is barely larger than the ants she produces.",
    },
  ],

  headline: "Number one on the pain index",
  intro: [
    "Paraponera clavata is a big, slow, black-red ant of Central and South American lowland rainforest, and it is famous for exactly one thing. Justin Schmidt's sting pain index, which rates hymenopteran stings from 1 to 4, puts the bullet ant alone at the top with a 4.0+ and the description: walking over flaming charcoal with a three-inch nail embedded in your heel.",
    "The Spanish name in Costa Rica is bala — bullet. In Venezuela it is hormiga veinticuatro, the twenty-four-hour ant, for how long the pain lasts. In Tupi–Guarani it is tocandira, which translates as the one wounding deeply. Several unrelated cultures across two continents independently named this ant after the duration or severity of its sting, which is as close to a consensus finding as ethnography gets.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Hymenoptera",
    family: "Formicidae",
    genus: "Paraponera",
    species: "Paraponera clavata",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate exists; colonies are widespread through Neotropical lowland rainforest and locally common, with nests at the base of large trees",
    note: "Never assessed against the Red List criteria, which is the case for almost every ant on Earth. There is no evidence the species is declining and it remains a familiar animal at Neotropical field stations. The pressure that matters is habitat: this ant occupies humid lowland rainforest below about 750 metres and does not persist in cleared, dry or seasonal country, so its fate follows the fate of Amazonian and Central American lowland forest exactly. A secondary and much smaller pressure is collection for the exotic ant-keeping trade, where colonies are sold internationally despite being notoriously difficult to maintain.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Worker length",
      value: "18–30 mm",
      min: 18,
      max: 30,
      unit: "mm",
      note: "Among the largest ants in the world; the queen is only marginally bigger than a worker, which is unusual",
    },
    {
      key: "colony-size",
      label: "Colony size",
      value: "Several hundred to about 1,000 workers",
      min: 300,
      max: 1000,
      unit: "workers",
      note: "Small for an ant of this size — leafcutter colonies run to millions. Exceptional nests of around 3,000 have been reported",
    },
    {
      key: "sting-pain",
      label: "Schmidt sting pain index",
      value: "4.0+ — the highest rating given",
      min: 4,
      max: 4,
      unit: "index",
      note: "Schmidt's scale runs from 1 to 4; the bullet ant and the tarantula hawk wasp share the top band, and the bullet ant is placed above it",
    },
    {
      key: "sting-duration",
      label: "Duration of pain",
      value: "Up to 24 hours, sometimes longer",
      min: 12,
      max: 36,
      unit: "hours",
      note: "Waves of burning, throbbing pain rather than a single peak; lymph node swelling, sweating, tremor and a fast heartbeat are commonly reported",
    },
    {
      key: "elevation-limit",
      label: "Upper elevation",
      value: "Sea level to about 750 m",
      min: 0,
      max: 750,
      unit: "m",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Nectar carried back as droplets, plus small arthropod prey", icon: "Droplets" },
    { key: "venom-type", label: "Venom", value: "Poneratoxin — a neurotoxic peptide", icon: "Syringe" },
    { key: "nest-type", label: "Nest", value: "In soil at the base of a large tree, with foraging trails into the canopy", icon: "TreePine" },
    { key: "social-structure", label: "Social structure", value: "Single monomorphic worker caste; no soldiers", icon: "Users" },
    { key: "activity", label: "Activity", value: "Forages by day and night, mostly in the canopy", icon: "Clock" },
  ],

  highlights: ["body-length", "sting-pain", "sting-duration", "venom-type"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Caribbean lowlands of Honduras, Nicaragua, Costa Rica and Panama",
      "Colombia, Venezuela and the Guianas",
      "Amazonian Ecuador, Peru and Bolivia",
      "Amazonian Brazil",
    ],
    habitats: [
      "Humid lowland tropical rainforest",
      "Forest canopy (foraging)",
      "Buttress roots and tree bases (nesting)",
    ],
    elevation: "Sea level to around 750 m",
    note: "The species is a lowland rainforest specialist. Nests are dug into soil at the base of large trees, and workers commute up the trunk to forage in the canopy rather than across the forest floor — which is why the ant is met more often on a trunk or a liana than underfoot. Occurrence records run from Honduras south to Bolivia and Brazil; reports from further north than Honduras should be treated with caution.",
  },

  sections: [
    {
      id: "the-sting",
      title: "What the sting actually does",
      body: [
        "The active component is poneratoxin, a small neurotoxic peptide. It acts on voltage-gated sodium channels, holding them in a state that disrupts the normal firing and recovery of nerve and muscle cells, and it blocks synaptic transmission in the central nervous system. In insects this causes paralysis, which is the point — the venom is primarily a hunting and defence tool aimed at other arthropods.",
        "In a human it produces something quite unlike a bee or wasp sting. Rather than a sharp peak that fades, the pain arrives in waves and does not subside for many hours: the commonly reported figure is up to 24 hours, with a range of roughly 12 to 36. Swollen lymph nodes, oedema, sweating, trembling and a racing heart are typical. It is not usually dangerous — deaths are not recorded from ordinary stings — but it is genuinely incapacitating.",
        "Poneratoxin has attracted pharmacological interest for exactly the reason it hurts. A molecule that reliably targets insect sodium channels is a candidate template for biological insecticides, and its action on the channel is also of interest to researchers studying pain signalling.",
      ],
    },
    {
      id: "satere-mawe",
      title: "The Sateré-Mawé glove",
      body: [
        "Among the Sateré-Mawé people of the Brazilian Amazon, the bullet ant is central to an initiation into manhood. Ants are gathered from the forest, sedated in a natural sedative, and woven stingers-inward into gloves made of plant fibre — around eighty ants to a pair. The initiate wears the gloves for something in the region of five to ten minutes while dancing, supported by the community.",
        "It is done once, and then done again. Full initiation requires the ordeal to be repeated on the order of twenty times over months or years. The immediate effects — hours of pain, uncontrollable shaking, temporary paralysis of the arms, swelling that can last days — are the point rather than a side effect: the ritual is a demonstration of endurance witnessed by the whole community.",
        "It is worth being clear about what this is and is not. It is a living tradition with meaning inside a specific culture, not a stunt, and it has been repeatedly filmed and packaged as one by outsiders. The ants are collected, used and released; the practice long predates any external interest in it.",
      ],
    },
    {
      id: "colony",
      title: "A small colony with no castes",
      body: [
        "For an ant this size the colonies are surprisingly modest: several hundred to around a thousand workers, with exceptional nests reported near three thousand. A leafcutter nest in the same forest may hold several million. Bullet ants are not built around numbers.",
        "They are also monomorphic. Most large ants split the workforce into size classes — small workers for brood care, large ones for defence — but every Paraponera worker is essentially the same animal, and the queen is only marginally larger than the ants she produces. There are no soldiers because every worker already is one.",
        "The nest is dug into soil at the base of a large tree, often among buttress roots, and the foraging effort goes upward. Workers climb the trunk and work the canopy, returning with small arthropod prey carried in the mandibles and with nectar held as a visible droplet between them. That vertical commuting pattern is why the ant is usually encountered on a trunk or a vine at head height rather than on the ground.",
      ],
    },
    {
      id: "enemies",
      title: "What hunts something that stings like that",
      body: [
        "Very little attacks a healthy bullet ant directly. The threat comes from a much smaller insect: phorid flies, which specialise in parasitising ants. A phorid targets injured or disturbed workers, laying eggs on the ant; a single infested worker can carry up to twenty larvae, which develop inside it.",
        "The presence of phorids changes bullet ant behaviour measurably. Ants that would otherwise defend a resource aggressively become evasive when phorids are around, because raising the head and opening the mandibles is exactly the posture that gives a fly its opening. A defence that works on vertebrates is no use against something that small and that fast.",
        "The ant is also, taxonomically, alone. Paraponera clavata is the only living species in its genus, and that genus is the only one in its subfamily — Carlo Emery set it apart in its own tribe as early as 1901, and molecular work has kept it there. What is being described here is not one ant among many but the sole surviving twig of its own branch.",
      ],
    },
  ],

  related: ["leafcutter-ant", "western-honey-bee", "buff-tailed-bumblebee"],
  tags: ["ant", "hymenoptera", "venomous", "rainforest", "south america", "sting"],
  searchTerms: [
    "paraponera clavata",
    "bullet ant sting",
    "schmidt sting pain index",
    "most painful insect sting",
    "satere mawe ant glove",
  ],

  faqs: [
    {
      q: "How painful is a bullet ant sting?",
      a: "It is the highest rating on the Schmidt sting pain index, at 4.0+, above every other insect assessed. Justin Schmidt described it as like walking over flaming charcoal with a three-inch nail in your heel. The pain arrives in waves rather than peaking and fading, and typically lasts up to 24 hours, accompanied by swelling, sweating, trembling and a fast heartbeat.",
    },
    {
      q: "Is a bullet ant sting dangerous?",
      a: "It is extremely painful but rarely medically serious. No deaths are recorded from ordinary stings, and even initiates in the Sateré-Mawé ritual — who receive dozens at once, repeatedly — recover. The risks are the usual ones: an allergic reaction, or the consequences of being incapacitated somewhere hazardous.",
    },
    {
      q: "What is poneratoxin?",
      a: "The neurotoxic peptide in bullet ant venom. It acts on voltage-gated sodium channels and blocks synaptic transmission in the central nervous system, which paralyses insect prey and produces the prolonged pain in humans. Its specificity for insect sodium channels has made it a template of interest for biological insecticides.",
    },
    {
      q: "What is the bullet ant glove ritual?",
      a: "An initiation into manhood practised by the Sateré-Mawé people of the Brazilian Amazon. Around eighty sedated bullet ants are woven stingers-inward into fibre gloves, which the initiate wears for roughly five to ten minutes while dancing. Full initiation requires repeating the ordeal on the order of twenty times over months or years.",
    },
    {
      q: "Are bullet ants endangered?",
      a: "The species has never been assessed by the IUCN, as is true of nearly all ants, and there is no evidence of decline. It is restricted to humid lowland rainforest below about 750 metres from Honduras to Bolivia and Brazil, so continued clearance of that forest is the pressure that would matter — the ant does not persist in dry, seasonal or cleared country.",
    },
  ],

  seo: {
    title: "Bullet Ant — Sting Pain Index, Poneratoxin & the Glove Ritual",
    description:
      "A researched profile of the bullet ant (Paraponera clavata): why its sting tops the Schmidt index at 4.0+, how poneratoxin works, the Sateré-Mawé initiation gloves, and its small casteless colonies.",
    keywords: [
      "bullet ant facts",
      "paraponera clavata",
      "most painful insect sting",
      "poneratoxin",
      "bullet ant glove ritual",
    ],
  },

  sources: [
    {
      label: "Paraponera clavata (Fabricius, 1775) — taxonomic record and occurrence data",
      publisher: "Global Biodiversity Information Facility (GBIF)",
      url: "https://www.gbif.org/species/1320410",
    },
    {
      label: "Bullet ant — description, sting, natural history and range",
      publisher: "Encyclopaedia Britannica",
      url: "https://www.britannica.com/animal/bullet-insect",
    },
    {
      label: "Poneratoxin — mechanism and pharmacology",
      publisher: "ScienceDirect Topics, Elsevier",
      url: "https://www.sciencedirect.com/topics/pharmacology-toxicology-and-pharmaceutical-science/paraponera-clavata",
    },
    {
      label: "Schmidt sting pain index — ratings and descriptions",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Schmidt_sting_pain_index",
    },
  ],

  updatedAt: "2026-07-29",
};

export default bulletAnt;
