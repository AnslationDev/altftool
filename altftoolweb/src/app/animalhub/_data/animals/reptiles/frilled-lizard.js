// Frilled lizard — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const frilledLizard = {
  slug: "frilled-lizard",
  category: "reptiles",
  name: "Frilled Lizard",
  scientificName: "Chlamydosaurus kingii",
  otherNames: ["Frill-necked lizard", "Frilled dragon", "Frilled agama"],

  summary:
    "A tree-dwelling Australian agamid that snaps open a skin frill wider than its own body length, and runs away on two legs when the bluff does not work.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Frill-necked_Lizard_%28Chlamydosaurus_kingii%29_%288692622586%29.jpg/1920px-Frill-necked_Lizard_%28Chlamydosaurus_kingii%29_%288692622586%29.jpg",
    alt: "A frilled lizard photographed in Kakadu, Northern Territory",
    credit: "Matt from Melbourne, Australia / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/A_frilled_lizard_%28Chlamydosaurus_kingii%29.jpg/1920px-A_frilled_lizard_%28Chlamydosaurus_kingii%29.jpg",
      alt: "A frilled lizard with its neck frill folded back against the body",
      credit: "Richard N Horne / Wikimedia Commons",
      title: "The frill at rest",
      caption:
        "Most of the time the frill lies folded like a cape over the shoulders and is barely visible. It is a fold of skin held out by cartilaginous rods that run from the hyoid apparatus in the throat, so opening the mouth wide is what opens the frill.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/94/Chlamydosaurus_kingii%2C_the_Frilled_Lizard_%2813075035234%29.jpg",
      alt: "A frilled lizard gripping a branch, its long tail hanging behind it",
      credit: "Dick Culbert from Gibsons, B.C., Canada / Wikimedia Commons",
      title: "An arboreal lizard, not a ground one",
      caption:
        "Frilled lizards spend roughly nine-tenths of their time in trees, sitting head-up on trunks where their grey-brown flanks read as bark. The tail accounts for around two thirds of total length.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Frilled_Lizard_%28Chlamydosaurus_kingii%29_%288603083074%29.jpg/1920px-Frilled_Lizard_%28Chlamydosaurus_kingii%29_%288603083074%29.jpg",
      alt: "A frilled lizard photographed on the Atherton Tablelands, Queensland",
      credit: "Ron Knight from Seaford, East Sussex, United Kingdom / Wikimedia Commons",
      title: "Red, orange and the size of a rival",
      caption:
        "The frill carries red, orange, yellow or white pigment. In staged contests between size-matched males, how strongly coloured those red-orange patches were predicted who won — while bite force did not.",
    },
  ],

  headline: "A bluff the size of its whole body",
  intro: [
    "The frilled lizard is a large agamid of the savannas of northern Australia and southern New Guinea, and the only species in its genus. It reaches about 90 cm from snout to tail tip, most of that tail, and lives almost entirely in trees — an ambush insect-hunter that sits vertically on a trunk waiting for something to move.",
    "It is famous for one gesture. Cornered, it faces the threat, gapes, and snaps out a circular frill of skin that can be four times the width of its body, hissing and rocking forward. If that does not work it drops to the ground and sprints away on its hind legs. Field observation shows the frill is used at least as often on other frilled lizards as on predators: males hold home ranges and settle them by display.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Agamidae",
    genus: "Chlamydosaurus",
    species: "Chlamydosaurus kingii",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2017,
    populationTrend: "stable",
    populationEstimate: "No global figure; widespread and locally common across northern Australia",
    note: "Assessed Least Concern in 2017 on the strength of a very large range across the northern Australian savannas and southern New Guinea. The main local concerns are changed fire regimes across that savanna, which alter tree cover and invertebrate abundance, and predation by feral cats. Genetic work in 2017 found three distinct lineages separated by the Ord River and the Carpentarian Gap, which would matter if the species were ever split.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "Up to about 90 cm from snout to tail tip",
      min: 60,
      max: 90,
      unit: "cm",
      note: "Roughly two thirds is tail. Snout–vent length averages about 29 cm in males and 23.5 cm in females",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Commonly around 400–600 g; large males heavier",
      min: 400,
      max: 870,
      unit: "g",
      note: "Animal Diversity Web records males averaging at least 870 g against about 400 g for females",
    },
    {
      key: "frill-diameter",
      label: "Frill width when erected",
      value: "Close to 30 cm across",
      min: 25,
      max: 30,
      unit: "cm",
      note: "More than four times the width of the lizard's own body — the single largest display structure of any Australian lizard",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "4–13 eggs, most often about eight",
      min: 4,
      max: 13,
      unit: "eggs",
      note: "Buried in a nest chamber the female digs in sunlit ground; two clutches in a season are possible",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 70 days",
      min: 65,
      max: 75,
      unit: "days",
      note: "Timed so that hatchlings emerge into the wet season, when insects are abundant",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 10 years in captivity",
      min: 6,
      max: 12,
      unit: "years",
      note: "Captive records average close to ten years; wild longevity is poorly documented",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Insectivore — termites, ants, cicadas, beetles and spiders, occasionally small vertebrates", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Diurnal, and far more active in the wet season than the dry", icon: "Sun" },
    { key: "locomotion", label: "Locomotion", value: "Arboreal; runs bipedally across open ground with the tail as a counterweight", icon: "Footprints" },
    { key: "display", label: "Display", value: "The frill is opened by gaping — hyoid cartilage rods hold it out — and used in territorial contests as well as against predators", icon: "Sparkles" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — agamids have no infrared pits; it hunts by sight from a vertical perch", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "In flakes and patches through the year rather than in one whole piece", icon: "RefreshCw" },
  ],

  highlights: ["frill-diameter", "length", "display", "locomotion"],

  distribution: {
    continents: ["Australia", "Oceania"],
    regions: [
      "Kimberley, Western Australia",
      "Top End, Northern Territory",
      "Northern and eastern Queensland",
      "Southern New Guinea",
    ],
    habitats: [
      "Tropical savanna woodland",
      "Dry sclerophyll forest",
      "Open eucalypt forest",
      "Riparian woodland",
    ],
    elevation: "Lowlands, generally below about 500 m",
    note: "Tied to wooded savanna rather than open grassland — it needs trunks to perch on. Genetic sampling across the range in 2017 found three lineages, split at the Ord River and at the Carpentarian Gap in the south-east corner of the Gulf of Carpentaria; the New Guinea population appears to have arrived perhaps 17,000 years ago, when lower sea levels joined the land masses.",
  },

  sections: [
    {
      id: "frill",
      title: "How the frill works",
      body: [
        "The frill is a thin, extensive fold of skin around the throat, held out by cartilaginous rods that run from the hyoid apparatus — the bony scaffold in the floor of the mouth. That connection is the mechanism: the lizard cannot raise the frill independently, it raises it by opening its jaws wide. Gape and frill are one movement, which is why the display always comes with a wide pink or yellow mouth at its centre.",
        "Fully erected it is close to 30 cm across, more than four times the width of the animal's body, and carries red, orange, yellow or white pigment against a grey-brown lizard. The effect is an abrupt, several-fold increase in apparent size, delivered head-on and usually with hissing, forward rocking and tail-lashing.",
        "How it develops was worked out only recently: the folds form through an elastic instability in the branchial ectoderm as the embryo grows, the tissue buckling into pleats in much the way a sheet of material does when it is compressed. The frill is not sculpted fold by fold; it is a physical consequence of one tissue growing faster than its neighbour.",
      ],
    },
    {
      id: "display",
      title: "Bluff, and who it is aimed at",
      body: [
        "The obvious reading is anti-predator, and that is part of it. But more than 300 hours of watching free-ranging lizards showed the frill is used at least as much for communication with other frilled lizards. Males hold home ranges, and in the mating season they display and fight repeatedly, with partial frill erection, head-bobbing, tail-lashing and waving of the forelimbs.",
        "The colour appears to be doing real work in those contests. In trials pairing size-matched males, how strongly the red-orange patches on the frill were pigmented predicted which animal dominated — while bite force and other measures of physical capacity did not. That is the signature of an honest signal: the contest is settled on the badge rather than on a fight.",
        "Against a predator the sequence is a bluff followed by an escape. If gaping, hissing and the frill do not open a gap, the lizard drops to all fours, then rears up and sprints away bipedally, tail out behind as a counterweight, heading for the nearest trunk.",
      ],
    },
    {
      id: "seasons",
      title: "A lizard with two years in one",
      body: [
        "Northern Australia has a wet season and a dry one, and the frilled lizard lives two different lives across them. Through the wet, insects are abundant, the lizard is active, feeds heavily, spends more time near or on the ground, and breeds.",
        "Through the dry it largely disappears. It retreats into shade in the upper canopy, becomes far less active, feeds little and loses condition, waiting the months out on stored reserves. Field workers see many fewer animals in the dry, and the difference is behaviour rather than mortality.",
        "Breeding is timed to that cycle. Mating runs from the late dry into the early wet; the female digs a nest chamber in sunlit ground, lays four to thirteen eggs, and after about 70 days the hatchlings emerge into the insect flush of the wet season, already able to open a miniature frill.",
      ],
    },
    {
      id: "threats",
      title: "Status and pressures",
      body: [
        "The species is assessed Least Concern, and across most of its range that is a fair description: it occupies an enormous belt of savanna woodland from the Kimberley to Queensland, and turns up readily in suitable habitat.",
        "The pressures are the general ones acting on northern Australian wildlife rather than anything specific to the lizard. Fire regimes across the savanna have changed since traditional Aboriginal burning was displaced, producing larger and hotter late-dry-season fires that thin tree cover and reduce the invertebrate prey base. Feral cats take lizards of this size readily.",
        "Cane toads, which have devastated large monitors and elapid snakes across the same landscape, are less of a direct problem here — the frilled lizard eats invertebrates, not vertebrates. It is also caught for the pet trade, though captive breeding supplies most of that demand.",
      ],
    },
  ],

  related: ["thorny-devil", "komodo-dragon", "veiled-chameleon"],
  tags: ["lizard", "agamid", "australia", "savanna", "arboreal", "reptile"],
  searchTerms: ["chlamydosaurus", "frill neck lizard", "frilled dragon", "frillneck", "jesus lizard australia"],

  faqs: [
    {
      q: "How does a frilled lizard open its frill?",
      a: "By opening its mouth. The frill is a fold of skin held out by cartilaginous rods attached to the hyoid apparatus in the floor of the mouth, so gaping and frilling are the same movement. That is why the display always shows a wide open pink or yellow mouth in the middle of the frill.",
    },
    {
      q: "How big is a frilled lizard's frill?",
      a: "Close to 30 cm across when fully erected — more than four times the width of the lizard's own body. It carries red, orange, yellow or white pigment, and the rest of the time it lies folded flat over the shoulders like a cape and is barely noticeable.",
    },
    {
      q: "Why do frilled lizards run on two legs?",
      a: "It is their escape gait across open ground. After the frill display fails, the lizard drops down, rears up and sprints bipedally with the tail held out as a counterweight, heading for the nearest tree. Being arboreal, its objective is always a trunk rather than distance.",
    },
    {
      q: "Is the frill only used to scare predators?",
      a: "No. More than 300 hours of observation of wild lizards found it is used at least as much between frilled lizards. Males hold home ranges and settle disputes with repeated partial frill erection, head-bobbing, tail-lashing and forelimb waving. In staged contests, the colour of the red-orange frill patches predicted which male won — bite force did not.",
    },
    {
      q: "Are frilled lizards endangered?",
      a: "No — they are assessed as Least Concern, with a very large range across northern Australian savanna woodland and southern New Guinea. The concerns are indirect: altered fire regimes that thin tree cover and reduce insect prey, and predation by feral cats. Unlike goannas and elapids, they are not badly affected by cane toads, because they eat invertebrates.",
    },
  ],

  seo: {
    title: "Frilled Lizard — Frill Display, Bipedal Running & Habitat",
    description:
      "A researched profile of the frilled lizard (Chlamydosaurus kingii): how the neck frill works, what field research shows it is really for, bipedal escape running, wet and dry season behaviour, and Least Concern status.",
    keywords: [
      "frilled lizard facts",
      "chlamydosaurus kingii",
      "frill necked lizard",
      "frilled dragon frill",
      "bipedal lizard australia",
    ],
  },

  sources: [
    {
      label: "Chlamydosaurus kingii — Red List assessment (O'Shea et al., 2017)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/170384/21644690",
    },
    {
      label: "Chlamydosaurus kingii — size, reproduction and behaviour",
      publisher: "Animal Diversity Web, University of Michigan Museum of Zoology",
      url: "https://animaldiversity.org/accounts/Chlamydosaurus_kingii/",
    },
    {
      label: "Function and evolution of the frill of the frillneck lizard (Shine, 1990)",
      publisher: "Biological Journal of the Linnean Society",
      url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1095-8312.1990.tb00531.x",
    },
    {
      label: "Elastic instability during branchial ectoderm development causes folding of the Chlamydosaurus erectile frill",
      publisher: "eLife",
      url: "https://elifesciences.org/articles/44455",
    },
    {
      label: "Chlamydosaurus kingii entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Chlamydosaurus&species=kingii",
    },
  ],

  updatedAt: "2026-07-29",
};

export default frilledLizard;
