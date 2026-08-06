// Surinam toad — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const surinamToad = {
  slug: "surinam-toad",
  category: "amphibians",
  name: "Surinam Toad",
  scientificName: "Pipa pipa",
  otherNames: ["Common Surinam toad", "Suriname toad", "Star-fingered toad"],

  summary:
    "A flat, tongueless, leaf-shaped frog of Amazonian backwaters whose eggs are pressed into the skin of the female's back, sealed under a layer of her own tissue, and released months later as fully formed toadlets — skipping the free-swimming tadpole entirely.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Pipa_pipa01.jpg",
    alt: "A Surinam toad seen from above, its body almost completely flat and mottled brown",
    credit: "Hugo Claessen / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2_pipa_pipa_-_juin_2007.jpg/1920px-2_pipa_pipa_-_juin_2007.jpg",
      alt: "A Surinam toad resting on the bottom, showing its flattened body and splayed limbs",
      credit: "Christophe cagé 6 july 2007 / Wikimedia Commons",
      title: "Built to be mistaken for litter",
      caption:
        "The body is almost two-dimensional and the limbs sprawl sideways in the same plane, so the outline reads as a waterlogged leaf. The animal ambushes prey by simply not being noticed.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/2_pipa_pipa_2_-_juin_2007.jpg/1920px-2_pipa_pipa_2_-_juin_2007.jpg",
      alt: "A Surinam toad in water with its broadly webbed hind feet and slender front fingers visible",
      credit: "Christophe cagé 6 july 2007 / Wikimedia Commons",
      title: "Star fingers and paddle feet",
      caption:
        "The hind feet are huge and fully webbed for propulsion; the front fingers end in tiny four-lobed tips that give the species its other name. Those tips are sensory, sweeping the murk for prey the eyes are far too small to find.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Discus_%26_Pipa_pipa.jpg/1920px-Discus_%26_Pipa_pipa.jpg",
      alt: "A Surinam toad on the floor of an aquarium with a discus fish swimming above it",
      credit: "Christophe cagé 14:50, 23 June 2007 (UTC) / Wikimedia Commons",
      title: "An ambush predator among fish",
      caption:
        "Surinam toads take fish as well as invertebrates, and they do it without a tongue: the mouth and throat expand in a few thousandths of a second, and the prey is pulled in on the rush of water.",
    },
  ],

  headline: "The frog that raises its young inside its own skin",

  intro: [
    "The Surinam toad is not really a toad, and it is barely frog-shaped. It is a fully aquatic member of the family Pipidae with a body flattened almost to a plate, a broad triangular head, no tongue, no teeth, no eardrum and eyes reduced to two black pinpricks. The limbs sprawl outward in the same plane as the body, and the whole animal is the colour of rotting leaf litter, which is exactly the point.",
    "It is famous for one thing, and that thing is routinely exaggerated. The female does carry her eggs embedded in the skin of her back, and young do emerge from the resulting pockets. What actually happens is stranger and more orderly than the internet version: eggs are placed there during an acrobatic mating sequence, her skin grows over them, the embryos complete their entire development inside those chambers, and what climbs out months later is a two-centimetre toadlet — never a tadpole.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Pipidae",
    genus: "Pipa",
    species: "Pipa pipa",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2023,
    populationTrend: "stable",
    populationEstimate: "Widely distributed across the Amazon basin; no population count",
    note: "The 2023 assessment records a stable population across a very large range, with habitat loss from logging, agricultural expansion and settlement as the main pressures. One physiological detail is worth flagging: the species lacks the dermal antimicrobial peptides that give many frogs some defence against chytridiomycosis and ranavirus, which may leave it more exposed to those diseases than its status suggests.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "10.5–17 cm",
      min: 10.5,
      max: 17.1,
      unit: "cm",
      note: "Snout to vent. Females reach about 171 mm and males about 154 mm, making this the largest species in its genus.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 7 years recorded in captivity",
      min: 7,
      max: 7,
      unit: "years",
      note: "An average of 6.8 years is recorded for captive animals; wild longevity has not been measured.",
    },
    {
      key: "clutch-size",
      label: "Eggs carried",
      value: "About 100 eggs",
      min: 100,
      max: 100,
      unit: "eggs",
      note: "Released three to ten at a time across fifteen to eighteen separate turnovers, each egg about 6.5 mm across.",
    },
    {
      key: "brood-development",
      label: "Time embedded in the mother's back",
      value: "12–20 weeks",
      min: 12,
      max: 20,
      unit: "weeks",
      note: "The entire egg-to-toadlet development happens inside the skin pockets.",
    },
    {
      key: "toadlet-size",
      label: "Size at emergence",
      value: "About 2 cm",
      min: 2,
      max: 2,
      unit: "cm",
      note: "A miniature of the adult — flat, tailless and already able to swim and feed.",
    },
    {
      key: "strike-speed",
      label: "Suction strike",
      value: "12–24 milliseconds",
      min: 12,
      max: 24,
      unit: "ms",
      note: "The time taken to expand the mouth and throat cavity, which is what generates the suction.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — worms, insects, crustaceans and small fish, taken by suction",
      icon: "Drumstick",
    },
    {
      key: "life-cycle",
      label: "Life cycle",
      value: "Direct development — toadlets emerge from the mother's back with no free-swimming tadpole stage",
      icon: "Baby",
    },
    {
      key: "senses",
      label: "Senses",
      value: "No tongue, no eardrum and minute eyes; hunts by touch and a lateral line",
      icon: "EyeOff",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — warm, acidic, murky, slow-moving or still water",
      icon: "Droplet",
    },
    {
      key: "camouflage",
      label: "Camouflage",
      value: "Flattened, mottled brown body that reads as a dead leaf on the bottom",
      icon: "Leaf",
    },
  ],

  highlights: ["length", "brood-development", "life-cycle", "camouflage"],

  distribution: {
    continents: ["South America"],
    regions: [
      "Amazon and Orinoco basins",
      "Brazil, Bolivia, Peru, Ecuador, Colombia and Venezuela",
      "Guyana, Suriname and French Guiana",
      "Trinidad",
    ],
    habitats: [
      "Slow-moving blackwater streams and backwaters",
      "Forest ponds and swamps",
      "Seasonal pools left after flooding",
    ],
    elevation: "Lowland tropical basins",
    note: "The name is a historical accident of collection rather than a description of the range: the species occurs across most of tropical South America and has the largest distribution of any Pipa. It is fully aquatic and does not leave the water except when forced to.",
  },

  sections: [
    {
      id: "flat",
      title: "A frog shaped like a dead leaf",
      body: [
        "Almost every feature of Pipa pipa follows from being a sit-and-wait predator in water you cannot see through. The body is extremely depressed, the head is a broad flat triangle, and the limbs are held out sideways in the plane of the body rather than tucked underneath. The skull is hyperossified and the rest of the skeleton is heavily modified compared with other frogs. Lying still on a leaf-strewn bottom, the animal is effectively invisible.",
        "Because visibility is poor, the eyes are almost vestigial and the sensing is done elsewhere. The species retains a lateral line system with neuromast organs along the body — the same current-detecting apparatus fish use — and the tips of the front fingers are divided into four small lobes that sweep the water and the silt. Those star-shaped fingertips are what gave the species its alternative name.",
        "Catching prey without a tongue requires a different solution again. The frog lunges and expands its mouth and throat cavity in twelve to twenty-four thousandths of a second, dropping the pressure inside so sharply that water and whatever is in it are pulled straight down the throat. The splayed front fingers help by blocking a fish's escape route. Diet studies from Trinidad found copepods dominating the stomach contents, with fly larvae and true bugs behind them, and occasional evidence of cannibalism.",
      ],
    },
    {
      id: "the-back",
      title: "What actually happens on her back",
      body: [
        "Breeding begins with sound, but not a croak. The male has no vocal sac and instead snaps a bone in his throat, producing a sharp click at roughly four clicks a second in bursts of ten to twenty seconds. A responding female is seized around the waist in inguinal amplexus, and her cloaca and the skin of her back begin to swell in preparation.",
        "The pair then performs a sequence of turnovers. Together they rise from the bottom, arc through the water and flip upside down near the surface. At the top of each arc, floating on their backs, the female releases three to ten eggs, which fall onto the male's belly; as the pair rights itself he presses them onto the skin of her back and fertilises them. The pair sinks, rests, and repeats the manoeuvre — fifteen to eighteen times in a full spawning, ending with roughly a hundred eggs distributed across her dorsal surface.",
        "The eggs, each about 6.5 mm across, begin sinking into her skin the same evening. Within about two days most are below the surface, and her epidermis grows over and around each one so that it sits in an individual chamber closed by a horny lid. The honeycomb of hexagonal pockets that results is the image everyone has seen; it is a temporary tissue structure, and the female sheds the modified skin once the brood has gone.",
      ],
    },
    {
      id: "emergence",
      title: "Toadlets, not tadpoles",
      body: [
        "Inside the chambers the embryos develop for twelve to twenty weeks. They do pass through the tadpole stage anatomically, but they never live as tadpoles: there is no hatching into open water, no filter feeding, no swimming shoal. Each embryo stays sealed in its own pocket until development is complete.",
        "What eventually pushes the lid open is a fully formed toadlet about two centimetres long — flat, tailless and shaped like a miniature version of its mother, immediately able to swim and to feed. Emergence is staggered over hours or days rather than happening all at once.",
        "It is worth being clear about what this achieves, because the process is usually presented purely as body horror. Amphibian eggs left in Amazonian backwaters are eaten by almost everything, and tadpoles fare little better. By carrying the entire developmental period on her back, in water she chooses, the female converts a hundred vulnerable eggs into a hundred competent juveniles. It is one of the most complete forms of parental investment in any amphibian.",
      ],
    },
    {
      id: "range",
      title: "Where it lives and how it is doing",
      body: [
        "Pipa pipa occupies warm, acidic, murky and slow-moving water across most of tropical South America — the Amazon and Orinoco basins, the Guianas, and Trinidad — including streams, backwaters, forest ponds and the seasonal pools left behind by flooding. It has the widest distribution of any species in its genus, and it is entirely aquatic.",
        "The 2023 Red List assessment lists it as Least Concern with a stable population, noting that a great deal of suitable habitat remains. The pressures on it are the familiar ones for the basin: logging, agricultural expansion and human settlement clearing and altering the forest that shades and feeds these waters.",
        "One physiological quirk deserves a mention alongside that reassuring status. Unlike most frogs, Pipa pipa lacks dermal antimicrobial peptides, the skin compounds that give many amphibians partial defence against chytrid fungus and ranavirus. Should either pathogen reach its populations in force, the species may have less to fall back on than a stable assessment implies.",
      ],
    },
  ],

  related: ["african-clawed-frog", "goliath-frog", "red-eyed-tree-frog"],
  tags: ["frog", "south america", "amazon", "parental care", "freshwater", "least concern"],
  searchTerms: [
    "pipa pipa",
    "suriname toad",
    "star fingered toad",
    "frog eggs in back",
    "surinam toad babies",
  ],

  faqs: [
    {
      q: "Do baby Surinam toads really burst out of their mother's back?",
      a: "They emerge from it, but nothing bursts. Each egg sits in an individual pocket in her skin, closed by a small horny lid, and a fully formed toadlet about 2 cm long pushes that lid open when it is ready — usually over a period of hours or days rather than all at once. The female then sheds the modified layer of skin.",
    },
    {
      q: "Does the Surinam toad have a tadpole stage?",
      a: "Not as a free-living animal. The embryos pass through tadpole anatomy inside their skin chambers but never swim, feed or exist independently as tadpoles. Development from egg to toadlet takes twelve to twenty weeks and happens entirely on the mother's back.",
    },
    {
      q: "How do the eggs get into the female's skin?",
      a: "During mating the pair repeatedly somersaults up through the water. Floating upside down near the surface, the female releases three to ten eggs onto the male's belly; as they right themselves he presses those eggs onto her back and fertilises them. After fifteen to eighteen such turnovers roughly a hundred eggs are spread over her. They sink into the swollen skin within a day or two, and her tissue grows over each one.",
    },
    {
      q: "How does a Surinam toad eat without a tongue?",
      a: "By suction. It lunges and expands its mouth and throat cavity in twelve to twenty-four milliseconds, which drops the internal pressure sharply enough to pull water — and any worm, insect or small fish in it — straight down the throat. The splayed front fingers help pen a fish in while the strike happens.",
    },
    {
      q: "Is the Surinam toad endangered?",
      a: "No. It was assessed as Least Concern in 2023 with a stable population across an enormous range in tropical South America. Logging, agriculture and settlement are eroding its habitat, and the species is unusual in lacking the skin peptides that give many frogs some resistance to chytrid fungus, so its position is more exposed than the status alone suggests.",
    },
  ],

  seo: {
    title: "Surinam Toad — Eggs in the Back, Suction Feeding & Range",
    description:
      "A researched profile of the Surinam toad (Pipa pipa): exactly how eggs become embedded in the female's back, why toadlets emerge instead of tadpoles, and how a tongueless frog catches fish by suction.",
    keywords: [
      "surinam toad",
      "pipa pipa",
      "surinam toad eggs back",
      "star fingered toad",
      "frog with holes in back",
    ],
  },

  sources: [
    {
      label: "Pipa pipa — Red List assessment (2023, e.T58163A85900348)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/58163/85900348",
    },
    {
      label: "Pipa pipa — natural history, reproduction and longevity account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Pipa_pipa/",
    },
    {
      label: "Surinam toad — species account",
      publisher: "Encyclopaedia Britannica",
      url: "https://www.britannica.com/animal/Surinam-toad",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default surinamToad;
