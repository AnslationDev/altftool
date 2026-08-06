// Ocellaris clownfish — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const ocellarisClownfish = {
  slug: "ocellaris-clownfish",
  category: "fish",
  name: "Ocellaris Clownfish",
  scientificName: "Amphiprion ocellaris",
  otherNames: ["Clown anemonefish", "False percula clownfish", "Common clownfish"],

  summary:
    "A reef fish that lives inside a stinging anemone it should not survive, in a strict size-ranked queue where every individual is born male and only the dominant one becomes female.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Clown_fish_in_the_Andaman_Coral_Reef.jpg/1920px-Clown_fish_in_the_Andaman_Coral_Reef.jpg",
    alt: "An ocellaris clownfish among the tentacles of its host anemone on a reef in the Andaman Islands",
    credit: "Ritiks / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/%22%2Barya%2B%22_Amphiprion_ocellaris_and_Stichodactylidae_in_aquarium_2020_00.jpg/1920px-%22%2Barya%2B%22_Amphiprion_ocellaris_and_Stichodactylidae_in_aquarium_2020_00.jpg",
      alt: "An ocellaris clownfish resting among the short tentacles of a carpet anemone",
      credit: "Aris riyanto / Wikimedia Commons",
      title: "Bedded in the stingers",
      caption:
        "A clownfish spends almost its whole adult life within a body length of its anemone. The tentacles are loaded with nematocysts that would fire on any other fish this size, and how the clownfish avoids setting them off is still not fully settled — the leading explanation is that its mucus coat simply lacks the chemical cues that trigger discharge.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/68/%22%2Barya%2B%22_Amphiprion_ocellaris_and_Stichodactylidae_in_aquarium_2020_01.jpg",
      alt: "Close view of an ocellaris clownfish showing three white bars edged in black across an orange body",
      credit: "Aris riyanto / Wikimedia Commons",
      title: "Three bars, thin black edges",
      caption:
        "The three white bars edged in black are how the species is told from the near-identical orange clownfish, which carries much heavier black outlines. The reliable character is duller: ocellaris has eleven dorsal spines to percula's ten.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/%22%2Barya%2B%22_Amphiprion_ocellaris_and_Stichodactylidae_in_aquarium_2020_02.jpg/1920px-%22%2Barya%2B%22_Amphiprion_ocellaris_and_Stichodactylidae_in_aquarium_2020_02.jpg",
      alt: "Two ocellaris clownfish of noticeably different sizes sharing one anemone",
      credit: "Aris riyanto / Wikimedia Commons",
      title: "A queue, not a pair",
      caption:
        "Size difference within a group is not incidental — it is the social structure. The largest fish is the female, the second largest the breeding male, and any others stay deliberately small, because growing to challenge the fish above you is how you get evicted onto a reef with nowhere to hide.",
    },
  ],

  headline: "Every clownfish is born male, and the boss becomes female",
  intro: [
    "The ocellaris clownfish is eleven centimetres of orange and white that almost never leaves the anemone it lives in. That anemone is a predator armed with stinging cells, and the relationship — protection in exchange for defence, cleaning and a supply of nutrients — is one of the most-cited examples of mutualism in the sea.",
    "The stranger fact is the one the films leave out. Anemonefish are protandrous sequential hermaphrodites: every individual develops first as a male, and only the single dominant fish in a group becomes female. When she dies, her mate changes sex and takes her place. It is not a rare event or a curiosity — it is the ordinary reproductive machinery of the species, and it is what makes a group confined to a single anemone able to keep breeding at all.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Blenniiformes",
    family: "Pomacentridae",
    genus: "Amphiprion",
    species: "Amphiprion ocellaris",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2022,
    populationTrend: "unknown",
    populationEstimate: "No global figure; abundance tracks the availability of host anemones rather than reef area",
    note: "Assessed in February 2021 and published in the 2022 Red List update as Least Concern — the species is widespread across the eastern Indian Ocean and western Pacific and no global decline has been demonstrated. The pressures are local rather than global: collection for the aquarium trade, and bleaching events that kill the host anemones the fish cannot live without.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Up to 11 cm; typically about 8 cm",
      min: 8,
      max: 11,
      unit: "cm",
      note: "Females are the largest fish in any group; subordinate males stay well below their potential size",
    },
    {
      key: "depth-range",
      label: "Depth range",
      value: "1–15 m",
      min: 1,
      max: 15,
      unit: "m",
      note: "Set by where the host anemones grow — sheltered lagoons and shallow reef slopes, usually below 3 m",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 6–10 years in the wild",
      min: 6,
      max: 10,
      unit: "years",
      note: "FishBase gives a maximum reported age of 12 from an aquarium fish; a study of the closely related orange clownfish put its potential life span at around 30 years, which would be extraordinary for a fish this size",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "100–1,000 eggs",
      min: 100,
      max: 1000,
      unit: "eggs",
      note: "Laid on rock cleared at the base of the anemone; older, larger females lay far more, and a pair may spawn every two weeks",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "6–8 days",
      min: 6,
      max: 8,
      unit: "days",
      note: "Depends on water temperature. The male fans and mouths the clutch throughout, and hatching happens after dark",
    },
    {
      key: "larval-duration",
      label: "Larval drift",
      value: "About 8–12 days",
      min: 8,
      max: 12,
      unit: "days",
      note: "The only dispersing stage in the whole life cycle — once a juvenile settles into an anemone it may never leave it again",
    },
  ],

  traits: [
    { key: "sex-change", label: "Sex change", value: "Protandrous — born male, the dominant fish becomes female, and the change is irreversible", icon: "Repeat" },
    { key: "social-structure", label: "Social structure", value: "One breeding pair plus non-breeding subordinates, ranked strictly by size", icon: "Users" },
    { key: "symbiosis", label: "Symbiosis", value: "Obligate mutualist with the anemones Heteractis magnifica, Stichodactyla gigantea and S. mertensii", icon: "Handshake" },
    { key: "diet-type", label: "Diet", value: "Omnivore — zooplankton, copepods and algae", icon: "Fish" },
    { key: "reproduction", label: "Reproduction", value: "Egg-laying on a cleared rock surface, guarded and fanned by the male", icon: "Egg" },
    { key: "activity", label: "Activity", value: "Diurnal; shelters deep in the anemone at night", icon: "Sun" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Does not school; lives in a small closed group tied to one anemone", icon: "CircleDot" },
    { key: "ocean-range", label: "Ocean range", value: "Eastern Indian Ocean and western Pacific", icon: "Globe" },
  ],

  highlights: ["length", "lifespan", "sex-change", "social-structure"],

  distribution: {
    continents: ["Asia", "Australia"],
    regions: [
      "Andaman and Nicobar Islands",
      "Andaman Sea coast of Thailand and Myanmar",
      "Malaysia and Indonesia",
      "Philippines",
      "Northwestern Australia",
      "Taiwan and the Ryukyu Islands of Japan",
    ],
    habitats: ["Sheltered coral reef slopes", "Lagoons", "Sea anemones"],
    elevation: "1–15 m depth",
    note: "Restricted to the eastern Indian Ocean and western Pacific — it is not found in Hawaii, the Red Sea, the Caribbean or on the Great Barrier Reef, where its lookalike relatives take its place. Its real distribution is finer-grained than a map suggests: the fish can only live where one of three anemone species occurs, so its range is a scatter of occupied hosts rather than continuous reef.",
  },

  sections: [
    {
      id: "hermaphrodite",
      title: "Born male, promoted to female",
      body: [
        "Every ocellaris clownfish develops first as a male. A group occupying one anemone consists of a single large breeding female, a slightly smaller breeding male, and a handful of smaller non-breeding fish that are all functionally male and reproductively suppressed. There is exactly one female, and there was never more than one.",
        "When she dies or is removed, the breeding male changes sex. Behaviour shifts almost immediately — within hours he begins performing the aggressive displays the female used to — while the gonads take weeks to months to reorganise, testicular tissue regressing as ovarian tissue develops. The largest subordinate then moves up to become the new breeding male. The change is one-way: a female cannot revert.",
        "This is protandry, and for an animal in this situation it is the efficient arrangement. A clownfish cannot safely cross open reef to find a mate, so its partner is whoever else happens to occupy its anemone. A system in which the resident pair can always become a functioning male and female, whatever they started as, means a group is never left unable to breed simply because the wrong individual died.",
      ],
    },
    {
      id: "anemone",
      title: "Living inside a predator",
      body: [
        "Ocellaris clownfish associate with three anemone species: Heteractis magnifica, Stichodactyla gigantea and Stichodactyla mertensii. All three carry tentacles armed with nematocysts — stinging capsules that fire on contact and would kill a fish of this size.",
        "How the clownfish avoids triggering them is still not entirely settled. The best-supported explanation is chemical rather than physical: the fish's mucus coat lacks the compounds that normally set a nematocyst off, so the anemone does not register it as prey. Newly arrived fish go through an acclimation period, touching the tentacles briefly and repeatedly over hours or days before settling in, which suggests some component of the coating is acquired from the anemone itself rather than being innate.",
        "The exchange runs both ways. The anemone supplies a stinging fortress that almost no reef predator will enter. The clownfish drives off butterflyfish and other anemone-eaters, keeps the tentacles clear of debris, and improves water flow through the host by its constant movement — its waste also fertilises the symbiotic algae the anemone depends on. Anemones with resident clownfish grow faster and survive better than those without.",
      ],
    },
    {
      id: "hierarchy",
      title: "The queue",
      body: [
        "A clownfish group is a size hierarchy, and the sizes are not accidental. Work on the closely related orange clownfish showed that each fish in the queue stays at a consistent fraction of the size of the one immediately above it — subordinates actively restrain their own growth rather than simply being outcompeted for food.",
        "The reason is that the alternative is worse. A subordinate that grows large enough to threaten the fish above it is attacked and driven out, and a clownfish evicted from its anemone onto open reef is not likely to survive long or to find another vacancy. Staying small is a strategy for keeping a place in the queue, and a place in the queue is the only route to eventually breeding.",
        "It also means the reproductive prospects of most individuals in the population are zero at any given moment. Only two fish in a group breed. Everyone else waits, sometimes for years, for a death higher up the ladder.",
      ],
    },
    {
      id: "life-cycle",
      title: "Eggs, and twelve days at sea",
      body: [
        "Breeding pairs spawn on a cycle tied to the lunar month, clearing a patch of bare rock at the base of the anemone and laying between a hundred and a thousand adhesive eggs on it. The male does nearly all the tending: fanning the clutch to keep it oxygenated, mouthing the eggs to remove debris and removing any that die. Incubation takes six to eight days depending on temperature, and hatching happens at night.",
        "What follows is the only part of the life the fish spends away from an anemone. Larvae drift as plankton for roughly eight to twelve days, and mortality over that window is severe. Survivors then have to locate a host — using smell, and there is good evidence that they also use reef sound — settle into it, complete acclimation, and join the bottom of a queue.",
        "Because the settled adults essentially never move, that larval window is the species' entire dispersal budget. It is also why the population structure is patchy: recruitment depends on where currents happen to take a fortnight's worth of drifting larvae.",
      ],
    },
    {
      id: "trade",
      title: "Nemo, and the trade",
      body: [
        "Ocellaris clownfish are among the most heavily traded marine aquarium fish in the world, and demand rose sharply after the 2003 film that made the species famous. How much of that translated into additional wild collection has been argued over — the effect was probably smaller and more localised than the headlines suggested — but collection pressure at accessible reefs in the Philippines and Indonesia is real, and cyanide, still used to stun fish for capture in some places, damages far more than the fish it takes.",
        "The genuine good news is that this species breeds readily in captivity. It was among the first marine ornamentals to be raised commercially at scale, and captive-bred ocellaris now supply a large share of the trade — hardier in a tank than wild-caught fish and, unlike them, not taken from a reef.",
        "The larger threat is not collection at all. Clownfish cannot live without host anemones, and anemones bleach in the same way corals do, expelling their symbiotic algae in warm water and often dying. A reef can retain its structure and still lose every anemone on it, and when that happens the clownfish go with them. The Red List keeps the species at Least Concern on the strength of its wide range; the vulnerability is concentrated in the host.",
      ],
    },
  ],

  related: ["great-white-shark", "whale-shark", "atlantic-bluefin-tuna"],
  tags: ["reef fish", "marine", "bony fish", "symbiosis", "coral reef", "least concern"],
  searchTerms: ["amphiprion ocellaris", "clownfish", "anemonefish", "nemo", "false percula", "clown anemonefish"],

  faqs: [
    {
      q: "Do all clownfish start life as males?",
      a: "Yes. Ocellaris clownfish are protandrous sequential hermaphrodites: every individual develops first as a male, and only the single dominant fish in a group becomes female. If she dies, her mate changes sex and replaces her, and the largest subordinate moves up to become the new breeding male. The change is irreversible — a female cannot revert to male.",
    },
    {
      q: "How do clownfish avoid being stung by their anemone?",
      a: "The mechanism is not fully settled, but the best-supported explanation is chemical: the clownfish's mucus coat lacks the compounds that trigger an anemone's stinging cells to fire, so the anemone does not treat it as prey. New arrivals acclimate over hours or days by touching the tentacles repeatedly, which suggests part of the coating is picked up from the host itself.",
    },
    {
      q: "How is an ocellaris clownfish different from a percula clownfish?",
      a: "They look almost identical. Ocellaris has thinner black edging around its three white bars and is usually a lighter orange; percula tends towards heavier black outlines. The reliable difference is the fin count — ocellaris has eleven dorsal spines and percula ten — and the ranges differ, with ocellaris in the eastern Indian Ocean and western Pacific.",
    },
    {
      q: "How long do ocellaris clownfish live?",
      a: "Around six to ten years in the wild. FishBase records a maximum of twelve years for an aquarium fish, and a study of the closely related orange clownfish estimated potential life spans of about thirty years — remarkable for a fish of eleven centimetres, and probably a consequence of living inside a fortress that keeps predators out.",
    },
    {
      q: "Are ocellaris clownfish endangered?",
      a: "No. The IUCN lists the species as Least Concern; it is widespread across the eastern Indian Ocean and western Pacific and no global decline has been shown. The real risks are local: collection for the aquarium trade at accessible reefs, and marine heatwaves that bleach and kill the host anemones the fish cannot survive without.",
    },
  ],

  seo: {
    title: "Ocellaris Clownfish — Sex Change, Anemone Symbiosis & Facts",
    description:
      "A researched profile of the ocellaris clownfish (Amphiprion ocellaris): protandrous sex change, the size-ranked social queue, how it survives inside a stinging anemone, its life cycle and Least Concern status.",
    keywords: [
      "ocellaris clownfish facts",
      "amphiprion ocellaris",
      "clownfish sex change",
      "clownfish anemone symbiosis",
      "false percula clownfish",
    ],
  },

  sources: [
    {
      label: "Amphiprion ocellaris — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/188321/1857718",
    },
    {
      label: "Amphiprion ocellaris — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/6509",
    },
    {
      label: "Amphiprion ocellaris — species account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Amphiprion_ocellaris/",
    },
    {
      label: "Clownfish",
      publisher: "Monterey Bay Aquarium",
      url: "https://www.montereybayaquarium.org/animals/animals-a-to-z/clownfish",
    },
  ],

  updatedAt: "2026-07-29",
};

export default ocellarisClownfish;
