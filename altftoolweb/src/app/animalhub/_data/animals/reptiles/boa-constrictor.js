// Boa constrictor — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const boaConstrictor = {
  slug: "boa-constrictor",
  category: "reptiles",
  name: "Boa Constrictor",
  scientificName: "Boa constrictor",
  otherNames: ["Common boa", "Red-tailed boa", "Jiboia", "Macajuel"],

  summary:
    "A heavy-bodied South American snake that kills by stopping its prey's circulation rather than its breathing, and — unusually for a boa — has no heat-sensing pits at all.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Red-tailed_boa_%28Boa_constrictor_constrictor%29_Rio_Napo.jpg/1920px-Red-tailed_boa_%28Boa_constrictor_constrictor%29_Rio_Napo.jpg",
    alt: "A red-tailed boa photographed beside the Rio Napo in Sucumbíos, Ecuador",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/2015-09-04._%D0%A1%D0%B0%D1%84%D0%B0%D1%80%D0%B8-%D0%BF%D0%B0%D1%80%D0%BA_%D0%B2_%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B4%D0%B0%D1%80%D0%B5_145.jpg/1920px-2015-09-04._%D0%A1%D0%B0%D1%84%D0%B0%D1%80%D0%B8-%D0%BF%D0%B0%D1%80%D0%BA_%D0%B2_%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B4%D0%B0%D1%80%D0%B5_145.jpg",
      alt: "A boa constrictor stretched over a rock in a zoo enclosure, its saddle markings and pale head stripe visible",
      credit: "Andrey Butko / Wikimedia Commons",
      title: "Saddles, and a stripe through the eye",
      caption:
        "The dark dorsal saddles and the pale stripe running from snout to neck through the eye are the field marks that separate a boa from the pythons it is often confused with. Note also the smooth lip scales: there are no pits along them.",
    },
  ],

  headline: "It does not suffocate anything",
  intro: [
    "The boa constrictor is one of the few animals ordinarily called by its scientific name. It is a large, thick-bodied, non-venomous snake of tropical South America, most adults between about 1.8 and 3.0 m, and the pattern of dark saddles down a tan or grey back — often deepening to brick red on the tail — is distinctive enough that the species is recognised on sight almost everywhere it lives.",
    "Two things about it are usually got wrong. It does not kill by suffocation: measurements taken from prey during constriction show the coils collapse the circulation within seconds, long before oxygen would run out. And although labial heat-sensing pits are the classic boid feature, this species does not have them — it is one of the boas that lost them.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Boidae",
    genus: "Boa",
    species: "Boa constrictor",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "stable",
    populationEstimate: "No global figure; presumed large across a very wide range",
    note: "Assessed Least Concern in 2021 on the basis of a very wide distribution and a presumed large population that is not thought to be declining fast enough to qualify for a threatened category. Listed on CITES Appendix II; the Argentine boa, Boa constrictor occidentalis, is on Appendix I. Several forms once treated as subspecies — Boa imperator, B. nebulosa, B. orophias and B. sigma — have since been raised to full species, which narrows what this assessment actually covers.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Females 2.1–3.0 m, males 1.8–2.4 m",
      min: 1.8,
      max: 4,
      unit: "m",
      note: "Reported extremes run from about 0.9 m in some island populations to just under 4 m. Females routinely exceed 3 m and are heavier-bodied than males at the same length",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Commonly 10–15 kg; the heaviest verified reached 27 kg",
      min: 10,
      max: 27,
      unit: "kg",
      note: "Wild animals rarely approach the top of that range; the heaviest snakes are overfed captives",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "About 24 young on average, from 10 to over 60",
      min: 10,
      max: 64,
      unit: "young",
      note: "Born live rather than hatched, each already 40–50 cm long and independent immediately",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "Five to eight months",
      min: 150,
      max: 240,
      unit: "days",
      note: "The length depends on local temperature; the female basks to raise her own body temperature and speed development",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 2–3 years",
      min: 2,
      max: 4,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 20 years in the wild; 25–35 in captivity",
      min: 20,
      max: 40,
      unit: "years",
      note: "Captive records reach about 40 years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — small and medium mammals and birds; bats taken at cave mouths", icon: "Drumstick" },
    { key: "venom-type", label: "Venom", value: "None — it is a constrictor, with recurved teeth for gripping rather than injecting", icon: "Droplet" },
    { key: "heat-sensing", label: "Heat sensing", value: "No labial pits, unlike most boas and pythons. Heat-sensitive cells in the lips remain, but the external pit organs are absent", icon: "Thermometer" },
    { key: "hunting-method", label: "Hunting method", value: "Ambush strike followed by constriction, which arrests the prey's circulation within seconds", icon: "Zap" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal and crepuscular; young are more arboreal than adults", icon: "Moon" },
    { key: "reproduction", label: "Reproduction", value: "Live-bearing — embryos develop inside the female rather than in laid eggs", icon: "Egg" },
    { key: "shedding-frequency", label: "Shedding", value: "Every few weeks while growing fast; a handful of times a year as an adult, in one whole piece", icon: "RefreshCw" },
  ],

  highlights: ["length", "weight", "hunting-method", "heat-sensing"],

  distribution: {
    continents: ["South America"],
    regions: [
      "Amazon basin",
      "Guianas",
      "Northern and eastern Brazil",
      "Bolivia, Paraguay and northern Argentina",
      "Trinidad and Tobago",
    ],
    habitats: [
      "Tropical rainforest and clearings",
      "Dry tropical forest",
      "Savanna and scrub",
      "Agricultural land and plantation edge",
    ],
    elevation: "Lowlands up to around 1,000 m",
    note: "The snakes long called boa constrictors in Mexico and Central America are now recognised as separate species — chiefly Boa imperator and Boa sigma — so Boa constrictor proper is a South American animal. It is unusually tolerant of disturbed and agricultural land, and populations released or escaped from the pet trade have established in southern Florida and on several Caribbean and Pacific islands.",
  },

  sections: [
    {
      id: "constriction",
      title: "What constriction actually does",
      body: [
        "For most of the twentieth century constriction was described as suffocation: coils tighten around the chest, the prey cannot expand its ribs, and it asphyxiates. That story survived because nobody had measured what was happening inside the animal being squeezed.",
        "When it was measured — using anaesthetised rats fitted with pressure catheters and offered to boa constrictors — the picture turned out to be circulatory rather than respiratory. Within six seconds of the coils closing, arterial blood pressure at the femoral artery fell to half its baseline while central venous pressure rose sixfold. The heart is being pressed on directly and cannot fill; blood stops moving. Death comes from circulatory arrest, and it comes far faster than suffocation could.",
        "That explains a detail that had never quite fitted: constricting snakes take prey much larger than themselves and let go after only a few minutes. If they were waiting for oxygen to run out they would have to hold on far longer, and would be much more exposed while doing it.",
      ],
    },
    {
      id: "pits",
      title: "The boa without pits",
      body: [
        "Pythons and many boas have labial pits — a row of shallow depressions along the lip scales, each holding a membrane crowded with infrared-sensitive nerve endings, which together build a crude thermal image of a warm-blooded animal in complete darkness. It is one of the defining features of the group in popular accounts.",
        "Boa constrictor does not have them. Comparative work on the evolutionary distribution of labial pits across boas and pythons places this species, along with the green anaconda, among the booids that lack the pit structures altogether, while infrared-sensitive receptors remain present in the lip tissue. The pits have been gained and lost repeatedly across the group rather than inherited once.",
        "In practice the snake hunts by a combination of scent, read with the tongue and the vomeronasal organ, vibration, and vision — plus whatever residual thermal sensitivity those receptors provide. It is a reminder that the family-level generalisation does not survive contact with the individual species.",
      ],
    },
    {
      id: "hunting",
      title: "Diet and hunting",
      body: [
        "Boa constrictors are generalists. The bulk of the diet is small and medium-sized mammals — rodents, opossums, agoutis, occasionally something as large as an ocelot in exceptional cases — along with birds and lizards. Juveniles take smaller prey and spend more time in trees; adults are largely terrestrial and heavier for it.",
        "The hunting method is ambush. The snake positions itself along a mammal trail or at the mouth of a bat cave and waits, sometimes for days, striking at movement within reach. Boas hanging from cave entrances and taking bats out of the air is a well-documented behaviour and one of the few situations where the species hunts something in flight.",
        "The strike grips with backward-curving teeth, and the coils follow immediately. After feeding, a large meal can keep an adult inactive for weeks.",
      ],
    },
    {
      id: "trade",
      title: "The pet trade and taxonomy",
      body: [
        "This is one of the most heavily kept snakes in the world, and the trade has left marks on the record. Within it the species is called 'BCC' after its binomial, to distinguish it from 'BCI', the Central American animal — which is no longer a subspecies at all but a separate species, Boa imperator. Boa nebulosa, B. orophias and B. sigma have likewise been raised to full species.",
        "That matters for anything read about the animal: older accounts describing 'boa constrictors' from Mexico, Costa Rica or Colombia are frequently describing a different species. Captive breeding has also produced an extensive range of colour and pattern morphs that have no counterpart in wild populations.",
        "Trade is regulated under CITES Appendix II, with the Argentine boa Boa constrictor occidentalis on Appendix I. Escaped and released animals have established breeding populations in southern Florida and on several islands, where a large generalist predator with no local equivalent is a genuine problem.",
      ],
    },
  ],

  related: ["green-anaconda", "reticulated-python", "eastern-diamondback-rattlesnake"],
  tags: ["snake", "constrictor", "south america", "boa", "rainforest", "reptile"],
  searchTerms: ["boa constrictor imperator", "red tailed boa", "bcc snake", "jiboia", "common boa"],

  faqs: [
    {
      q: "Do boa constrictors suffocate their prey?",
      a: "No. Measurements taken from prey during constriction show that within about six seconds the arterial blood pressure halves and central venous pressure rises sixfold — the coils press directly on the circulation, the heart cannot fill, and blood stops moving. Death is from circulatory arrest, and it happens far faster than suffocation would.",
    },
    {
      q: "Do boa constrictors have heat-sensing pits?",
      a: "No, and this is a common misconception. Labial heat pits are typical of pythons and many boas, but Boa constrictor lacks them entirely. Heat-sensitive receptors remain in the lip tissue, but there are no external pit organs. Comparative work shows labial pits have been gained and lost repeatedly across boas and pythons rather than being a single inherited trait.",
    },
    {
      q: "How big do boa constrictors get?",
      a: "Mature females are typically 2.1 to 3.0 m and males 1.8 to 2.4 m, with the largest reported animals approaching 4 m. The heaviest verified individual weighed 27 kg, though wild snakes are usually far lighter — 10 to 15 kg is more typical, and the very heavy specimens tend to be overfed captives.",
    },
    {
      q: "Do boa constrictors lay eggs?",
      a: "No. They are live-bearing: the embryos develop inside the female for five to eight months and she gives birth to an average of about 24 young, sometimes more than sixty. Each newborn is already 40 to 50 cm long and completely independent.",
    },
    {
      q: "Is a 'red-tailed boa' the same thing?",
      a: "Roughly. 'Red-tailed boa' refers to the South American Boa constrictor, whose tail markings often deepen to brick red — the species this profile covers. The Central American animals sold under similar names are now recognised as separate species, chiefly Boa imperator, so older accounts covering Mexico to Colombia are often describing a different snake.",
    },
  ],

  seo: {
    title: "Boa Constrictor — Size, Constriction, Diet & Range",
    description:
      "A researched profile of the boa constrictor (Boa constrictor): how constriction actually kills, why this boa has no heat-sensing pits, live birth, size and weight, South American range and Least Concern status.",
    keywords: [
      "boa constrictor facts",
      "how boa constrictors kill",
      "boa constrictor size",
      "red tailed boa",
      "boa heat pits",
    ],
  },

  sources: [
    {
      label: "Boa constrictor — Red List assessment (Arzamendia et al., 2021)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/197462/2486405",
    },
    {
      label: "Snake constriction rapidly induces circulatory arrest in rats (Boback et al., 2015)",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/218/14/2279/14389/Snake-constriction-rapidly-induces-circulatory",
    },
    {
      label: "In 'hot' pursuit: the evolutionary ecology of labial pits in boas and pythons",
      publisher: "Proceedings of the Royal Society B",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12015575/",
    },
    {
      label: "Boa constrictor — size, reproduction and heat-sensing pits",
      publisher: "Animal Diversity Web, University of Michigan Museum of Zoology",
      url: "https://animaldiversity.org/accounts/Boa_constrictor/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default boaConstrictor;
