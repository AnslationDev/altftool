// Platypus — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const platypus = {
  slug: "platypus",
  category: "mammals",
  name: "Platypus",
  scientificName: "Ornithorhynchus anatinus",
  otherNames: ["Duck-billed platypus"],

  summary:
    "An egg-laying, venomous, electrically sensing mammal that hunts with its eyes and ears shut — an animal so improbable that the first specimen sent to Europe was assumed to be a hoax.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale.jpg/1920px-Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale.jpg",
    alt: "A platypus at the surface of a river in Tasmania, showing its broad bill, dense brown fur and flat tail",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_diving_Scottsdale.jpg/1920px-Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_diving_Scottsdale.jpg",
      alt: "A platypus diving, its body angled downward beneath the water surface",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "Hunting blind, on purpose",
      caption:
        "The moment a platypus submerges, it shuts its eyes, ears and nostrils. Everything that follows underwater is done on electrical and touch information from the bill alone.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale_2.jpg/1920px-Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale_2.jpg",
      alt: "A platypus swimming at the surface with its bill and back showing above the waterline",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "Not a beak but skin",
      caption:
        "The bill is soft, flexible and pliable — nothing like a duck's. Its surface carries around 40,000 electroreceptors and roughly 60,000 mechanoreceptors, making it one of the most densely innervated sensory organs in any mammal.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale_3.jpg/1920px-Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale_3.jpg",
      alt: "A platypus on the water surface, dense waterproof fur visibly shedding droplets",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "Fur that keeps the water out",
      caption:
        "The coat is double-layered and dense enough to trap an insulating film of air against the skin, so a platypus foraging for hours in near-freezing snowmelt streams stays dry underneath.",
    },
  ],

  headline: "The mammal that broke the rules",
  intro: [
    "When the first platypus specimen reached London in 1799, the naturalists who examined it looked for the stitches. A furred, warm-blooded animal with the bill of a duck, the feet of an otter and the tail of a beaver was assumed to be a taxidermist's joke — and it took years of argument before the species was accepted as real, and decades more before anyone would believe that a mammal could lay eggs.",
    "It does, and that is only the beginning. The platypus locates prey by detecting the faint electrical fields of muscle contraction, with its eyes, ears and nostrils sealed shut. Males carry a venomous spur on each ankle. Females have no nipples and sweat milk through the skin. The genome carries ten sex chromosomes rather than two. Almost every mammalian generalisation has an exception, and the exception is usually this animal."
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Monotremata",
    family: "Ornithorhynchidae",
    genus: "Ornithorhynchus",
    species: "Ornithorhynchus anatinus",
  },

  conservation: {
    status: "NT",
    assessmentYear: 2016,
    populationTrend: "decreasing",
    populationEstimate: "No reliable total; the species is difficult to survey and estimates are derived from river-by-river work",
    note: "Assessed as Near Threatened in 2016 on the grounds that decline may approach 30% over three generations — about 21 years — if current pressures continue. Australian jurisdictions do not agree with each other: the platypus is listed as Endangered in South Australia and Vulnerable in Victoria, while Queensland, New South Wales, Tasmania and the ACT still treat it as common. A November 2020 report recommended listing it as a threatened species nationally under the EPBC Act. The animal has been legally protected from hunting in every state where it occurs since 1912, so the modern threats are habitat rather than harvest: river regulation, dam construction, drought, land clearing, entanglement in illegal yabby traps and litter, and predation by foxes and dogs.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Total length",
      value: "37–63 cm",
      min: 0.37,
      max: 0.63,
      unit: "m",
      note: "Measured bill tip to tail tip: males 40–63 cm, females 37–55 cm. Tasmanian platypuses are larger than mainland ones",
    },
    {
      key: "weight",
      label: "Weight",
      value: "0.6–3.0 kg",
      min: 0.6,
      max: 3.0,
      unit: "kg",
      note: "Males 0.8–3.0 kg, females 0.6–1.7 kg",
    },
    {
      key: "spur-length",
      label: "Venom spur length",
      value: "About 12 mm",
      min: 12,
      max: 15,
      unit: "mm",
      note: "On each hind ankle, males only. Connected to a crural gland in the thigh whose venom output peaks during the breeding season",
    },
    {
      key: "electroreceptor-count",
      label: "Electroreceptors in the bill",
      value: "About 40,000",
      min: 40000,
      max: 40000,
      unit: "receptors",
      note: "Arranged in stripes running front to back along the bill, alongside roughly 60,000 push-rod mechanoreceptors",
    },
    {
      key: "dive-duration",
      label: "Typical dive time",
      value: "30–140 seconds",
      min: 0.5,
      max: 2.3,
      unit: "minutes",
      note: "Each dive is a foraging run along the bottom; the animal surfaces to chew what it has stored in its cheek pouches",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 10 days",
      min: 10,
      max: 10,
      unit: "days",
      note: "After a gestation of roughly 21 days. The female curls around the eggs in a burrow chamber",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1–3 eggs",
      min: 1,
      max: 3,
      unit: "eggs",
      note: "Usually two, each about 11 mm across and leathery-shelled rather than brittle like a bird's",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 2 years",
      min: 2,
      max: 2,
      unit: "years",
      note: "Females may not breed until later; not every female breeds every year",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 20 years",
      min: 12,
      max: 21,
      unit: "years",
      note: "Long-lived for an animal of this size, both in the wild and in captivity",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — aquatic insect larvae, worms, shrimp and yabbies", icon: "Bug" },
    { key: "electroreception", label: "Electroreception", value: "Present — locates prey by the electrical fields of muscle contraction", icon: "Zap" },
    { key: "venom-type", label: "Venom", value: "Peptide venom delivered by the male ankle spur; excruciating but not lethal to humans", icon: "Syringe" },
    { key: "reproduction", label: "Reproduction", value: "Lays eggs; the young lap milk from the mother's skin", icon: "Egg" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal and crepuscular", icon: "Moon" },
    { key: "social-structure", label: "Social structure", value: "Solitary outside breeding", icon: "User" },
  ],

  highlights: ["weight", "electroreception", "venom-type", "reproduction"],

  distribution: {
    continents: ["Australia"],
    regions: [
      "Tasmania",
      "Victoria",
      "New South Wales",
      "Eastern Queensland",
      "Australian Capital Territory",
      "Kangaroo Island, South Australia — introduced",
    ],
    habitats: [
      "Permanent freshwater rivers and creeks",
      "Farm dams and reservoirs",
      "Lakes and lagoons",
      "Alpine streams",
    ],
    elevation: "Sea level to around 1,600 m in the Australian Alps",
    note: "The platypus is endemic to eastern Australia, from tropical north Queensland down through New South Wales and Victoria to Tasmania, wherever there is permanent fresh water with earthen banks it can burrow into. It has disappeared from most of its former South Australian range on the mainland; the population on Kangaroo Island descends from animals introduced in the 1920s. The species tolerates a startling temperature range, from tropical creeks to snowmelt streams close to freezing.",
  },

  sections: [
    {
      id: "electroreception",
      title: "Hunting with electricity",
      body: [
        "A platypus dives with its eyes, ears and nostrils clamped shut by folds of skin. For the thirty to a hundred and forty seconds it spends underwater, it is blind, deaf and unable to smell. What it uses instead is the bill.",
        "The bill is not a beak. It is soft, pliable skin over cartilage, and its surface holds around 40,000 electroreceptors — modified mucous glands wired to sensory nerve endings — arranged in stripes running front to back, alongside roughly 60,000 push-rod mechanoreceptors that respond to touch and pressure. Only two other groups of mammals are known to be electroreceptive at all, and none to this degree.",
        "The muscle contractions of a shrimp or an insect larva generate tiny electrical fields. The platypus detects them, and by comparing the timing of the electrical signal with the slower pressure wave from the same movement, it appears to work out how far away the prey is — the delay between the two is a distance measurement.",
        "The animal sweeps its bill side to side across the bottom as it swims, and stores what it catches in cheek pouches. It has no teeth as an adult; it grinds food between horny plates while floating at the surface between dives.",
      ],
    },
    {
      id: "venom",
      title: "A venomous mammal",
      body: [
        "Adult male platypuses carry a sharp, hollow, keratinous spur about 12 mm long on each hind ankle, connected by a duct to a crural gland in the thigh. Females develop spur buds as juveniles and lose them. The gland enlarges and venom production surges during the breeding season, which points strongly at male-male competition rather than defence as the primary function.",
        "The venom is a mixture of peptides, several of them related to antimicrobial and immune proteins. It is not lethal to humans, but the pain is exceptional: victims describe an agony that does not respond to morphine and that can persist as heightened pain sensitivity for weeks or months. Envenomation causes immediate and severe swelling that spreads through the affected limb.",
        "It is lethal to smaller animals — dogs have been killed. Anyone handling a platypus must control both hind legs, which is why the animal is difficult to work with and why researchers restrain it in particular ways.",
        "Venom is rare in mammals generally, and among placental mammals essentially absent. That it appears here, in a lineage that split from the rest of the mammals over 160 million years ago, is one more piece of evidence that the platypus retains traits the rest of the class lost.",
      ],
    },
    {
      id: "eggs-and-milk",
      title: "Eggs, milk and a strange genome",
      body: [
        "The platypus is a monotreme — one of only five surviving egg-laying mammal species, the other four being echidnas. After a gestation of about 21 days, the female lays one to three leathery eggs, usually two, roughly 11 mm across, in a chamber at the end of a nesting burrow she has plugged with earth behind her. She curls around them for about ten days until they hatch.",
        "What emerges is tiny, blind and helpless, and it is fed milk — but not through nipples, which the platypus does not have. Milk is secreted through pores in the skin of the abdomen, pooling in grooves in the fur, and the young lap it up. Lactation continues for three to four months.",
        "The genome, sequenced in 2008, is as mixed as the anatomy. It contains genes associated with reptiles and birds alongside unmistakably mammalian ones, and the sex-determination system uses ten sex chromosomes rather than the usual two — a chain of X and Y chromosomes that segregate together, and which resemble the bird ZW system more than the mammalian XY.",
        "The animal also fluoresces. Under ultraviolet light the fur glows blue-green, a property noted in 2020 and shared with a handful of other nocturnal mammals; what if anything it is for remains unknown.",
      ],
    },
    {
      id: "living",
      title: "Life in the river",
      body: [
        "Platypuses live in permanent fresh water with banks they can dig into, and they dig a lot: a resting burrow above the waterline for daily use, and for breeding females a longer, more elaborate nesting burrow that can run many metres back from the bank.",
        "They are excellent swimmers, propelled by alternating strokes of the webbed forefeet while the hind feet and tail steer. On land the webbing folds back to expose claws for digging, and the animal walks on its knuckles to keep the webbing clear of the ground — an awkward gait that betrays how thoroughly the limbs are committed to swimming.",
        "The coat is the other essential piece of equipment. It is dense, double-layered and traps a film of insulating air against the skin, which is what allows a two-kilogram animal to forage for ten or twelve hours in water near freezing. Body temperature runs around 32 °C, several degrees lower than most mammals, and metabolic rate is low to match.",
        "Foraging occupies most of the night, and a platypus may need to eat around 20% of its body weight daily — more for a lactating female. Outside the breeding season the animals are solitary and largely tolerant of one another, sharing stretches of river without obvious territories.",
      ],
    },
    {
      id: "threats",
      title: "A quiet decline",
      body: [
        "Hunting for fur, which continued into the early twentieth century, has been illegal in every state where the platypus occurs since 1912, and the species is no longer at risk from harvest. What it faces instead is the steady degradation of the rivers it depends on.",
        "River regulation and dam construction fragment populations and alter flow; drought and water extraction can dry sections of stream entirely; land clearing removes the bank vegetation that stabilises the earth platypuses burrow into. Illegal enclosed yabby traps drown platypuses, which cannot surface to breathe once inside, and discarded litter — plastic rings, hair ties, fishing line — snags around the body and cuts in as the animal grows. Foxes, dogs and cats take animals moving overland.",
        "The species is hard to survey and easy to overlook, which is part of the problem: local disappearances go unnoticed. The 2016 Red List assessment set the status at Near Threatened, projecting a decline potentially approaching 30% over three generations, and Australian assessments diverge sharply — Endangered in South Australia, Vulnerable in Victoria, unlisted elsewhere. A 2020 report recommended national listing as threatened under the EPBC Act.",
        "Captive breeding has succeeded only occasionally and is not a realistic safety net. Effective conservation means keeping rivers flowing, keeping banks vegetated and keeping enclosed traps out of the water.",
      ],
    },
  ],

  related: ["red-kangaroo", "great-white-shark", "bottlenose-dolphin"],
  tags: ["australia", "monotreme", "venomous", "semi-aquatic", "near threatened", "egg-laying"],
  searchTerms: [
    "ornithorhynchus anatinus",
    "duck billed platypus",
    "egg laying mammal",
    "platypus venom",
    "platypus electroreception",
  ],

  faqs: [
    {
      q: "Is the platypus really venomous?",
      a: "Yes. Adult males carry a hollow keratinous spur about 12 mm long on each hind ankle, fed by a venom gland in the thigh that becomes far more active in the breeding season. The venom is not lethal to humans but causes extreme pain that does not respond to morphine and can leave heightened pain sensitivity for weeks. It can kill smaller animals, including dogs. Females lose their spur buds as juveniles.",
    },
    {
      q: "How does a platypus find food underwater?",
      a: "By electroreception. It closes its eyes, ears and nostrils when it dives, and hunts entirely with its bill, which carries around 40,000 electroreceptors and 60,000 touch receptors. Prey muscle contractions generate faint electrical fields; by comparing the electrical signal with the slower pressure wave from the same movement, the platypus appears to judge distance from the delay between them.",
    },
    {
      q: "Do platypuses lay eggs?",
      a: "They do — the platypus and the four echidna species are the only egg-laying mammals alive. The female lays one to three leathery eggs, usually two and about 11 mm across, in a burrow chamber and curls around them for roughly ten days. The hatchlings are fed milk secreted through pores in her skin, since the platypus has no nipples.",
    },
    {
      q: "Are platypuses endangered?",
      a: "Near Threatened on the IUCN Red List as of 2016, with the assessment projecting a decline potentially approaching 30% over three generations. Australian jurisdictions differ: South Australia lists the platypus as Endangered and Victoria as Vulnerable, while other states still treat it as common. A 2020 report recommended national listing as threatened under the EPBC Act.",
    },
    {
      q: "Why did scientists think the platypus was a fake?",
      a: "Because nothing in European zoology accommodated it. The first preserved specimen reached London in 1799 with a duck-like bill on a furred, otter-footed, beaver-tailed body, and taxidermists of the period were known for stitching together composite animals as hoaxes. Naturalists examined it for stitch marks. Acceptance of the animal as real took years, and acceptance that a mammal could lay eggs took considerably longer.",
    },
  ],

  seo: {
    title: "Platypus — Venom, Electroreception, Eggs & Conservation",
    description:
      "A researched profile of the platypus (Ornithorhynchus anatinus): the venomous ankle spur, hunting by electroreception with eyes shut, egg-laying and skin-secreted milk, and its Near Threatened status.",
    keywords: [
      "platypus facts",
      "ornithorhynchus anatinus",
      "is the platypus venomous",
      "egg laying mammal",
      "platypus electroreception",
    ],
  },

  sources: [
    {
      label: "Ornithorhynchus anatinus — Red List assessment (Woinarski & Burbidge, 2016)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/40488/21964009",
    },
    {
      label: "Platypus species profile",
      publisher: "Australian Museum",
      url: "https://australian.museum/learn/animals/mammals/platypus/",
    },
    {
      label: "Platypus conservation status — international and Australian state listings",
      publisher: "Australian Platypus Conservancy",
      url: "https://platypus.asn.au/conservation-status/",
    },
    {
      label: "The platypus bill, push rods and electroreception",
      publisher: "Australian Platypus Conservancy",
      url: "https://platypus.asn.au/the-platypus-bill-push-rods-and-electroreception/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default platypus;
