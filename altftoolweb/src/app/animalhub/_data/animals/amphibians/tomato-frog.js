// Tomato frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.
//
// Note: this record covers Dyscophus antongilii specifically, not the
// commonly confused D. guineti. Imagery has been restricted to photographs
// whose identification as D. antongilii is well supported.

const tomatoFrog = {
  slug: "tomato-frog",
  category: "amphibians",
  name: "Tomato Frog",
  scientificName: "Dyscophus antongilii",
  otherNames: ["Madagascar tomato frog", "Crapaud rouge de Madagascar"],

  summary:
    "A round, brilliantly red-orange frog from a small stretch of north-eastern Madagascar that defends itself by inflating and oozing a white glue thick enough to gum a snake's jaws shut — and which is routinely confused, in shops and photographs alike, with a commoner relative.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/51/Dyscophus_antongilii02.jpg",
    alt: "A tomato frog, round-bodied and deep red-orange, sitting on damp ground",
    credit:
      "Franco Andreone - [:it:Wikipedia:Autorizzazioni_ottenute/Franco_Andreone see authorization] / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/The_Madagascar_tomato_frog_or_crapaud_rouge_de_Madagascar_%28Dyscophus_antongilii%29_%2815284643444%29.jpg/1920px-The_Madagascar_tomato_frog_or_crapaud_rouge_de_Madagascar_%28Dyscophus_antongilii%29_%2815284643444%29.jpg",
      alt: "A tomato frog with a broad, rounded body and smooth orange-red skin",
      credit: "Brian Gratwicke from DC, USA / Wikimedia Commons",
      title: "Built like a burrower",
      caption:
        "The squat shape is functional. Tomato frogs dig backwards into soft ground with their hind feet and sit half-buried for long periods, waiting for prey to pass rather than hunting it down.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/The_Madagascar_tomato_frog_or_crapaud_rouge_de_Madagascar_%28Dyscophus_antongilii%29_%2815720844319%29.jpg/1920px-The_Madagascar_tomato_frog_or_crapaud_rouge_de_Madagascar_%28Dyscophus_antongilii%29_%2815720844319%29.jpg",
      alt: "A tomato frog seen from above, showing the deep red-orange back and pale flanks",
      credit: "Brian Gratwicke from DC, USA / Wikimedia Commons",
      title: "Colour as a warning",
      caption:
        "Red this saturated is aposematic — an advertisement. The frog has no venom and no potent toxin, but the sticky secretion it releases when grabbed is unpleasant enough that predators learn to leave it alone.",
    },
  ],

  headline: "The frog that glues its predators shut",
  intro: [
    "A female tomato frog is about the size and roughly the colour of the fruit she is named after: a rounded, smooth-skinned animal up to ten and a half centimetres long and 230 grams, coloured deep red to orange, sitting half-buried in damp soil in a swamp near Antongil Bay in north-eastern Madagascar. Males are smaller and duller, closer to yellow-orange, and it is the females that produce the colour the species is known for.",
    "The colour is a warning, and it is backed up. Grabbed by a snake or a dog, a tomato frog inflates itself into a ball too wide to swallow and secretes a thick white fluid from its skin. The secretion is a gum: it sticks to a predator's mouth and eyes, sets, and is difficult to get rid of. It is not lethal, but it is enough to make an animal drop the frog and remember doing so — and in some people it produces an allergic reaction.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Microhylidae",
    genus: "Dyscophus",
    species: "Dyscophus antongilii",
  },

  conservation: {
    status: "NT",
    assessmentYear: 2017,
    populationTrend: "decreasing",
    populationEstimate: "No published count; locally abundant in remaining breeding swamps",
    note: "Near Threatened, not Least Concern — the distinction matters because the closely similar Dyscophus guineti is Least Concern and the two are constantly conflated. The listing reflects a small range around Antongil Bay, dependence on lowland swamps that are being drained and built on, and a history of collection for the pet trade. The species was on CITES Appendix I from 1987 until 2016, when it was transferred to Appendix II alongside its two congeners so that all three lookalikes would be regulated consistently.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "Females to 10.5 cm, males to 6.5 cm",
      min: 6.5,
      max: 10.5,
      unit: "cm",
      note: "Snout to vent. One of the more strongly size-dimorphic frogs in Madagascar.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Females up to 230 g, males about 41 g",
      min: 41,
      max: 230,
      unit: "g",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "6–10 years in captivity",
      min: 6,
      max: 12,
      unit: "years",
      note: "Wild lifespan is undocumented; captive animals of more than 12 years have been reported.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1,000–1,500 eggs",
      min: 1000,
      max: 1500,
      unit: "eggs",
      note: "Laid as a floating film on the surface of shallow, still water after heavy rain.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — insects, worms and other small invertebrates taken by ambush",
      icon: "Drumstick",
    },
    { key: "activity", label: "Activity", value: "Nocturnal; buried in soft ground by day", icon: "Moon" },
    {
      key: "defence-secretion",
      label: "Defence",
      value: "Inflates, then secretes a white gum that sticks a predator's mouth and eyes shut",
      icon: "ShieldAlert",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — shallow, still swamps, ditches and pools",
      icon: "Droplet",
    },
    {
      key: "range-size",
      label: "Range",
      value: "Lowland north-eastern Madagascar around Antongil Bay",
      icon: "MapPin",
    },
  ],

  highlights: ["length", "defence-secretion", "range-size", "clutch-size"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "North-eastern Madagascar around Antongil Bay, centred on Maroantsetra",
      "Reported south along the coast toward Andevoranto",
    ],
    habitats: ["Lowland swamps and marshes", "Ditches, rice paddies and slow pools in and near settlements"],
    elevation: "Sea level to about 200 m",
    note: "The southern limit of the range is genuinely uncertain, because records from further south may refer to Dyscophus guineti. The species tolerates disturbed and even urban habitat — it breeds in roadside ditches and drainage channels in Maroantsetra itself — which is unusual for a Malagasy amphibian and is part of why it has held on.",
  },

  sections: [
    {
      id: "defence",
      title: "Inflate, then glue",
      body: [
        "A tomato frog has no fangs, no speed and no serious toxin. What it has is a two-stage deterrent. Threatened, it draws in air and swells into a taut ball, which raises the problem of swallowing it beyond what many snakes can manage and makes the frog difficult to grip.",
        "If that is not enough, the skin releases a thick white secretion. This is not a poison in the way that a dart frog's alkaloids are; it is a glue. It adheres to a predator's mouth and eyes and hardens there, gumming the jaws and forcing the animal to spend time working it off — time during which the frog walks away. The compound is a proteinaceous mucus, and the same broad family of frog skin glues has attracted medical interest as a possible tissue adhesive.",
        "On humans it is mostly harmless but not always. Contact can produce an allergic reaction — irritation, swelling, occasionally something more uncomfortable — which is why keepers handle the species as little as possible.",
      ],
    },
    {
      id: "identity",
      title: "Which tomato frog is this?",
      body: [
        "Three species share the genus Dyscophus, and two of them look alike enough that a great deal of published photography, and a great deal of the pet trade, has the identification wrong. Dyscophus antongilii, the species described here, is the larger and more intensely red-orange animal, restricted to a small area of lowland north-eastern Madagascar. Dyscophus guineti, the false tomato frog, is somewhat smaller, more orange-brown, often marked with fine reticulations, and occupies a broader band of eastern Madagascar at middle elevations. The third, Dyscophus insularis, is smaller again and duller.",
        "The confusion has real consequences. Nearly every tomato frog offered for sale is D. guineti, which breeds readily in captivity, but the trade name is the same for both, and the two carry different conservation statuses: D. antongilii is Near Threatened and D. guineti is Least Concern. A photograph labelled antongilii taken well outside Antongil Bay is more likely to be guineti than a range extension.",
        "The relationship has been questioned at a deeper level too. Some workers have argued that the two are colour forms of one species rather than distinct species; the current consensus keeps them separate, but the range boundary between them is not well defined, and any figure for the extent of D. antongilii's distribution carries that uncertainty.",
      ],
    },
    {
      id: "breeding",
      title: "Swamps, rain and a thousand eggs",
      body: [
        "Breeding follows heavy rain, usually between January and March. Males gather at shallow, still, often temporary water — swamps, ditches, flooded ground, drainage channels in town — and call at night. A female lays a clutch of a thousand to fifteen hundred small black-and-white eggs that float as a film on the surface.",
        "Development is fast, as it has to be for animals breeding in water that may not last. Eggs hatch within a couple of days, and the tadpoles, which are filter feeders rather than grazers, metamorphose in roughly six weeks to two months. The frogs that emerge are small and dull, and only develop the adult colour over a year or more.",
        "Outside the breeding season adults are almost entirely hidden. They burrow backwards into soft, damp soil and leaf litter using their hind feet and sit there, emerging at night to ambush passing invertebrates. This is why a locally abundant species can be very hard to find, and why population estimates are thin.",
      ],
    },
    {
      id: "status",
      title: "A small range in a shrinking swamp",
      body: [
        "The tomato frog's problem is not that it is fragile. It tolerates disturbed habitat well, breeds in ditches, and lives comfortably in and around the town of Maroantsetra. Its problem is that it lives in a small area of low-lying, flat, wet land — the kind of land that gets drained, filled and built on first.",
        "Collection was once the sharper threat. Demand from the international pet trade in the 1980s was sufficient for the species to be placed on CITES Appendix I in 1987, banning commercial international trade outright. That protection worked well enough that in 2016 the species was moved down to Appendix II, and its two lookalike congeners were added at the same time — the reasoning being that if the species cannot be told apart in a shipment, they need to be regulated together.",
        "The 2017 assessment settled on Near Threatened: not currently facing a high risk of extinction, but close enough to the thresholds that continued habitat loss around Antongil Bay would push it over. Genetic work has also found signs of low diversity within populations, which is the sort of finding that matters more for a species confined to one small region than for a widespread one.",
      ],
    },
  ],

  related: ["golden-poison-frog", "red-eyed-tree-frog", "cane-toad"],
  tags: ["frog", "madagascar", "near threatened", "aposematism", "microhylidae", "cites"],
  searchTerms: [
    "dyscophus antongilii",
    "madagascar tomato frog",
    "red frog madagascar",
    "dyscophus guineti difference",
    "false tomato frog",
  ],

  faqs: [
    {
      q: "Are tomato frogs poisonous?",
      a: "Not in the sense that a dart frog is. When grabbed, a tomato frog inflates and secretes a thick white gum from its skin that sticks to a predator's mouth and eyes and hardens there, forcing it to let go. It is an adhesive rather than a lethal toxin, though it can cause an allergic reaction in some people.",
    },
    {
      q: "What is the difference between Dyscophus antongilii and Dyscophus guineti?",
      a: "Dyscophus antongilii is larger and a more intense red-orange, and is restricted to lowland north-eastern Madagascar around Antongil Bay. Dyscophus guineti, the false tomato frog, is smaller, more orange-brown and often finely reticulated, and occupies a wider band of eastern Madagascar at middle elevations. Their conservation statuses differ too: antongilii is Near Threatened, guineti is Least Concern.",
    },
    {
      q: "Which tomato frog is sold as a pet?",
      a: "Almost always Dyscophus guineti, the false tomato frog, which breeds readily in captivity. Both are sold under the same common name, which is a large part of why the two species are so persistently confused. Since 2016 all three Dyscophus species have been listed on CITES Appendix II so that trade in them is regulated consistently.",
    },
    {
      q: "How big do tomato frogs get?",
      a: "Females reach about 10.5 centimetres snout to vent and around 230 grams; males are much smaller, at roughly 6.5 centimetres and 41 grams. The strong size difference between the sexes is characteristic, and the vivid red-orange colour is developed most fully by females.",
    },
    {
      q: "Why is the tomato frog Near Threatened?",
      a: "Because its whole range is a small area of low-lying swamp and marsh in north-eastern Madagascar, and that habitat is being drained, filled and built on. Historic collection for the pet trade added to the pressure and led to a CITES Appendix I listing in 1987. The species itself is adaptable and tolerates disturbed ground, but there is not much ground for it to occupy.",
    },
  ],

  seo: {
    title: "Tomato Frog — Dyscophus antongilii, Its Glue Defence & Status",
    description:
      "A researched profile of the Madagascar tomato frog (Dyscophus antongilii): the sticky white secretion that gums a predator's jaws, its small range around Antongil Bay, and how it differs from the false tomato frog.",
    keywords: [
      "tomato frog",
      "dyscophus antongilii",
      "madagascar tomato frog",
      "false tomato frog",
      "dyscophus guineti",
    ],
  },

  sources: [
    {
      label: "Dyscophus antongilii — Red List assessment (2017, e.T6937A84159360)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/6937/84159360",
    },
    {
      label: "Dyscophus guineti — Red List assessment (2016, e.T57805A84178457), for comparison",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/57805/84178457",
    },
    {
      label: "Dyscophus antongilii — natural history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Dyscophus_antongilii/",
    },
    {
      label: "Dyscophus antongilii Grandidier, 1877 — taxonomy and distribution",
      publisher: "Amphibian Species of the World, American Museum of Natural History",
      url: "https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Microhylidae/Dyscophinae/Dyscophus/Dyscophus-antongilii",
    },
  ],

  updatedAt: "2026-07-29",
};

export default tomatoFrog;
