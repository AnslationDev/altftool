// Red-eyed tree frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const redEyedTreeFrog = {
  slug: "red-eyed-tree-frog",
  category: "amphibians",
  name: "Red-Eyed Tree Frog",
  scientificName: "Agalychnis callidryas",
  otherNames: ["Red-eyed leaf frog", "Gaudy leaf frog"],

  summary:
    "The most photographed frog in the world spends its days folded up and invisible, and its startling red eyes and blue flanks are a defence rather than a display — while its eggs can sense a snake through the leaf they are stuck to and hatch three days early to escape it.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Red-eyed_Tree_Frog_%28Agalychnis_callidryas%29_1.png/1920px-Red-eyed_Tree_Frog_%28Agalychnis_callidryas%29_1.png",
    alt: "A red-eyed tree frog on a green leaf, red eyes wide open and orange feet gripping the surface",
    credit:
      "Red-eyed Tree Frog (Agalychnis callidryas) 3.jpg : Geoff Gallice from Gainesville, FL, USA derivative work: B kimmel / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2011-02-03_Red-eyed_Treefrog_%28Agalychnis_callidryas%29.jpg/1920px-2011-02-03_Red-eyed_Treefrog_%28Agalychnis_callidryas%29.jpg",
      alt: "A red-eyed tree frog showing red eyes, a green back, blue-and-yellow barred flanks and orange toes",
      credit: "Brian Gratwicke / Wikimedia Commons",
      title: "Every colour it owns, at once",
      caption:
        "The blue and yellow bars on the flanks and the orange feet are hidden completely when the frog is folded up asleep. They exist to appear suddenly, not to be seen.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Agalychnis_callidryas_%28Red-eyed_Tree_Frog%29_-_Flickr_-_S._Rae.jpg",
      alt: "A red-eyed tree frog perched on vegetation in lowland rainforest at Tortuguero, Costa Rica",
      credit: "S. Rae from Scotland, UK / Wikimedia Commons",
      title: "A frog of the Caribbean lowlands",
      caption:
        "Tortuguero sits in the wet Caribbean lowlands of Costa Rica, the kind of humid forest with standing water that this species needs — it breeds on leaves suspended over ponds and swamps rather than in them.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Red_Eyed_Treefrog_Agalychnis_callidryas.jpg/1920px-Red_Eyed_Treefrog_Agalychnis_callidryas.jpg",
      alt: "Close view of a red-eyed tree frog with both eyes fully open",
      credit: "Brian Gratwicke / Wikimedia Commons",
      title: "Eyes made for the dark",
      caption:
        "These are nocturnal eyes: large, forward-set and vertically pupilled for depth judgement when jumping between leaves in near-darkness. The red pigment is a by-product of that build, later put to work as a threat.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Red-eyed_Leaf_Frog_%28Agalychnis_callidryas%29_%289359365497%29.jpg/1920px-Red-eyed_Leaf_Frog_%28Agalychnis_callidryas%29_%289359365497%29.jpg",
      alt: "A red-eyed tree frog gripping a leaf, bright green above with a pale underside",
      credit: "Pavel Kirillov from St.Petersburg, Russia / Wikimedia Commons",
      title: "Why it is called a leaf frog",
      caption:
        "Leaf frogs do everything on foliage. They walk hand over hand rather than hop, grip with expanded toe discs, and glue their eggs to the undersides of leaves hanging above water.",
    },
  ],

  headline: "A frog that hides all day and detonates when caught",
  intro: [
    "For an animal so widely reproduced on posters and postage stamps, the red-eyed tree frog is almost impossible to find. It spends daylight hours pressed flat against the underside of a leaf, legs tucked in, eyelids drawn down and every bright surface folded out of sight. What is left is a green shape on a green leaf.",
    "The colours are for a single moment. Disturbed by something that has already spotted it, the frog snaps its eyes open, unfolds its blue-and-yellow flanks and orange feet, and leaps — leaving a predator's attention fixed on an afterimage a body length away from where the frog now is. Its eggs run a version of the same trick: an embryo attacked in the jelly can feel the vibrations of a snake feeding and hatch itself several days ahead of schedule.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Phyllomedusidae",
    genus: "Agalychnis",
    species: "Agalychnis callidryas",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2020,
    populationTrend: "decreasing",
    populationEstimate: "No global count; still common through most of its range",
    note: "Assessed as Least Concern on the strength of a wide range and continued abundance, with a decreasing trend driven by lowland forest clearance. The whole genus Agalychnis was added to CITES Appendix II in 2010, after collection for the international pet trade was judged capable of harming wild populations even where the species itself is not scarce.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "4–7 cm",
      min: 4,
      max: 7,
      unit: "cm",
      note: "Snout to vent. Males average around 5 cm; females reach roughly 7.5 cm and are clearly the larger sex.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 5 years",
      min: 5,
      max: 8,
      unit: "years",
      note: "The usual figure for wild frogs. Captive individuals of more than 8 years have been reported.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "About 40 eggs",
      min: 40,
      max: 40,
      unit: "eggs",
      note: "Glued to the underside of a leaf overhanging water. A female may lay several clutches in one night.",
    },
    {
      key: "hatching-age",
      label: "Hatching age",
      value: "6–7 days, or as little as 4 under attack",
      min: 4,
      max: 7,
      unit: "days",
      note: "Embryos can hatch up to about 30 per cent early when they detect a predator.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — crickets, moths, flies and other small insects", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Nocturnal — motionless and folded flat by day", icon: "Moon" },
    {
      key: "startle-display",
      label: "Defence",
      value: "Deimatic display — flashes red eyes, blue flanks and orange feet, then jumps",
      icon: "Eye",
    },
    {
      key: "egg-site",
      label: "Egg site",
      value: "Leaves above water; hatchlings drop straight into the pond below",
      icon: "Leaf",
    },
    { key: "water-type", label: "Water type", value: "Freshwater — ponds, swamps and slow forest pools", icon: "Droplet" },
  ],

  highlights: ["length", "startle-display", "hatching-age", "activity"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Southern Mexico through Central America to northern Colombia",
      "Belize, Guatemala, Honduras, Nicaragua, Costa Rica, Panama",
    ],
    habitats: ["Lowland tropical rainforest", "Humid forest around ponds and swamps"],
    elevation: "Sea level to about 1,250 m",
    note: "The species needs warm, humid forest with standing water it can lay above, which ties it to the wetter Caribbean and Pacific lowlands rather than to dry or high country. Populations across that range vary strikingly in flank colour, from deep blue in Costa Rica to purple and orange elsewhere.",
  },

  sections: [
    {
      id: "startle",
      title: "What the red eyes are actually for",
      body: [
        "The obvious guess — that bright colours warn of poison — is wrong here. The red-eyed tree frog is not toxic, and it does not advertise. For most of the day it is one of the better-camouflaged animals in the forest: a green frog folded so tightly against a green leaf that the coloured flanks, the orange feet and the eyes themselves are all covered.",
        "The display only happens when concealment has already failed. A frog that is touched or closely approached opens its eyes wide, straightens its legs to expose the barred flanks, and jumps. The working idea is a startle, or deimatic, effect: the sudden appearance of a large pair of red eyes and a burst of colour buys a fraction of a second, and the frog is gone before the predator recovers.",
        "There is a second proposed benefit, sometimes called flash coloration. A predator that tracks the leaping frog by its bright blue side has been given something vivid to search for — and the moment the frog lands and folds up, that thing no longer exists anywhere in view.",
      ],
    },
    {
      id: "hatching",
      title: "Embryos that choose when to hatch",
      body: [
        "Red-eyed tree frog eggs are laid in a jelly mass stuck to a leaf above water, where they are safe from fish and tadpole predators but exposed to cat-eyed snakes and wasps. Left alone they hatch after six or seven days, and the tadpoles wriggle out and fall into the pond below.",
        "Attacked, they do not wait. Work begun by Karen Warkentin in the 1990s showed that embryos as young as four days old will hatch within seconds of a snake starting to eat the clutch — escaping into the water while the snake is still working through the jelly. It is one of the clearest demonstrations of adaptive plasticity in developmental timing known from any vertebrate.",
        "What makes it remarkable is the discrimination involved. The embryos are responding to vibration, and rain and wind shake a leaf constantly. Later experiments established that they read the temporal pattern of the shaking — the length of the pulses and the gaps between them — rather than simply reacting to movement, and that they weigh amplitude as well. Hatching early is not free: a four-day tadpole is smaller and more vulnerable in the water, so the embryo is trading one risk against another and needs good evidence before it commits.",
      ],
    },
    {
      id: "breeding",
      title: "Breeding above the water",
      body: [
        "Breeding follows the rain. Males call from vegetation around ponds with a short chuck, and where several males are packed together they also shake the branches they are sitting on, sending vibrations through the plant as a territorial signal to rivals.",
        "A female carries the male on her back while she chooses a leaf, absorbs water from the pond to make the jelly, and lays a clutch of around forty eggs on the underside. She may repeat this several times in a night. Laying above the water rather than in it removes the eggs from the reach of fish and aquatic insects, at the cost of exposure to snakes, wasps and drying out.",
        "Tadpoles that reach the pond take roughly two to three months to metamorphose, and emerge as small brown-green frogs that only develop the adult red eyes and blue flanks over the following weeks.",
      ],
    },
    {
      id: "status",
      title: "Common, but not untouched",
      body: [
        "The red-eyed tree frog is still widespread and is listed as Least Concern, which sets it apart from a great many Central American amphibians. The chytrid fungus Batrachochytrium dendrobatidis swept the region's highland frogs hard from the 1980s onward; this species lives mostly in warm lowlands, which are less favourable to the fungus, and has come through better than its montane relatives.",
        "That does not make it secure. The Red List records a decreasing trend, and the reason is straightforward: it is a lowland rainforest specialist in a region where lowland rainforest is what gets cleared first. It also needs both the forest and the ponds within it, so drainage matters as much as logging.",
        "Collection is the other pressure. The frog's fame makes it valuable, and in 2010 the whole genus Agalychnis was placed on CITES Appendix II so that international trade would at least be recorded and regulated. Most animals now sold are captive-bred, which is the outcome that listing was meant to encourage.",
      ],
    },
  ],

  related: ["golden-poison-frog", "tomato-frog", "common-frog"],
  tags: ["tree frog", "leaf frog", "costa rica", "rainforest", "least concern", "camouflage"],
  searchTerms: [
    "agalychnis callidryas",
    "red eyed frog",
    "red eye tree frog",
    "gaudy leaf frog",
    "rana de ojos rojos",
  ],

  faqs: [
    {
      q: "Are red-eyed tree frogs poisonous?",
      a: "No. Unlike the poison dart frogs they are often pictured beside, red-eyed tree frogs carry no significant toxin. Their bright colours are not a warning; they are hidden all day and only revealed in a sudden startle display when the frog is already discovered.",
    },
    {
      q: "Why does a red-eyed tree frog have red eyes?",
      a: "The eyes are large, forward-facing and vertically pupilled because the frog is nocturnal and needs depth perception to leap between leaves in the dark. The red pigment turns that equipment into a defence: opening the eyes suddenly in a predator's face is startling enough to buy the frog the moment it needs to jump.",
    },
    {
      q: "Can red-eyed tree frog eggs really hatch early?",
      a: "Yes, and it is one of the best-documented cases of its kind. Clutches normally hatch at six or seven days, but an embryo as young as four days will hatch within seconds if it detects the vibrations of a snake or wasp eating the clutch. The embryos distinguish predator vibrations from rain and wind by reading the rhythm and strength of the shaking.",
    },
    {
      q: "Where do red-eyed tree frogs live?",
      a: "In humid lowland rainforest from southern Mexico through Central America to northern Colombia, from sea level to around 1,250 metres. They need standing water — ponds, swamps or slow pools — because they lay their eggs on leaves suspended directly above it.",
    },
    {
      q: "Is the red-eyed tree frog endangered?",
      a: "It is listed as Least Concern, but with a decreasing population trend. The species depends on lowland rainforest and the ponds inside it, both of which are being lost, and since 2010 the entire genus has been on CITES Appendix II to control collection for the pet trade.",
    },
  ],

  seo: {
    title: "Red-Eyed Tree Frog — Startle Display, Early Hatching & Habitat",
    description:
      "A researched profile of the red-eyed tree frog (Agalychnis callidryas): why its red eyes are a defence and not a warning, how its embryos hatch days early to escape snakes, and where it lives.",
    keywords: [
      "red-eyed tree frog",
      "agalychnis callidryas",
      "red eyed tree frog facts",
      "startle display frog",
      "early hatching embryos",
    ],
  },

  sources: [
    {
      label: "Agalychnis callidryas — Red List assessment (2020, e.T55290A3028059)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/55290/3028059",
    },
    {
      label: "Agalychnis callidryas — natural history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Agalychnis_callidryas/",
    },
    {
      label: "Red-eyed treefrogs — research overview on vibration-cued escape hatching",
      publisher: "Smithsonian Tropical Research Institute",
      url: "https://stri.si.edu/story/red-eyed-treefrogs",
    },
    {
      label: "The role of vibration amplitude in the escape-hatching response of red-eyed treefrog embryos",
      publisher: "Integrative Organismal Biology",
      url: "https://academic.oup.com/iob/article/7/1/obaf012/8104285",
    },
    {
      label: "Frog embryos use multiple levels of temporal pattern in risk assessment for vibration-cued escape hatching",
      publisher: "Animal Cognition",
      url: "https://link.springer.com/article/10.1007/s10071-022-01634-4",
    },
  ],

  updatedAt: "2026-07-29",
};

export default redEyedTreeFrog;
