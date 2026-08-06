// Goliath frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const goliathFrog = {
  slug: "goliath-frog",
  category: "amphibians",
  name: "Goliath Frog",
  scientificName: "Conraua goliath",
  otherNames: ["Giant slippery frog", "Goliath bullfrog"],

  summary:
    "The largest frog on Earth, up to 32 centimetres from snout to vent and three and a quarter kilograms — and, as fieldwork in Cameroon showed in 2019, an animal that builds its own nursery ponds by shifting rocks half its own weight.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Conraua_goliath_photo_from_iNaturalist_539752953.jpg/1920px-Conraua_goliath_photo_from_iNaturalist_539752953.jpg",
    alt: "A goliath frog, olive-brown above with a pale underside and heavy hind legs",
    credit: "jeanlouisamiet / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Conraua_goliath_360001369.jpg/1920px-Conraua_goliath_360001369.jpg",
      alt: "A goliath frog photographed in Cameroon, within its natural range",
      credit: "Ryan van Huyssteen / Wikimedia Commons",
      title: "Cameroon and nowhere much else",
      caption:
        "The entire world range of the largest frog alive is a strip of rainforest in south-western Cameroon and northern Equatorial Guinea, roughly 200 kilometres across. It has never been found outside it.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/47/Conraua_goliath_photo_from_iNaturalist_92002.jpg",
      alt: "A goliath frog at rest with its powerful hind legs folded beneath it",
      credit: "116916927065934112165 (muir) / Wikimedia Commons",
      title: "Legs that carry three kilograms",
      caption:
        "Goliath frogs can jump around three metres from a standing start. The hind limbs that make that possible are also the limbs used to shovel gravel and lever stones when a male builds a nest.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Conraua_goliath_photo_from_iNaturalist_92003.jpg",
      alt: "A goliath frog showing its granular olive-brown skin and pale throat",
      credit: "116916927065934112165 (muir) / Wikimedia Commons",
      title: "A frog with no voice sac",
      caption:
        "Unlike almost every large frog, this one has no vocal sac. Males whistle with the mouth open rather than croaking, and much of their communication near noisy rapids appears to be visual and physical instead.",
    },
  ],

  headline: "The world's biggest frog builds its own pond",
  intro: [
    "A full-grown goliath frog measures up to 32 centimetres from snout to vent — with the hind legs extended, well over 80 — and weighs as much as 3.25 kilograms. That is a frog the size of a domestic cat, and it has held the record for the largest living anuran for as long as anyone has been measuring.",
    "It lives in one place: fast, clear, oxygen-rich rivers running through rainforest in south-western Cameroon and northern Equatorial Guinea. For a long time the size itself was the whole story. Then in 2019 a team working on the Mpoula River documented something nobody had recorded: goliath frogs clear, dig and dam pools at the river's edge to spawn in, moving stones of up to two kilograms to build the rim — and stay to guard them. It is the best explanation yet offered for why this frog is so large.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Conrauidae",
    genus: "Conraua",
    species: "Conraua goliath",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2019,
    populationTrend: "decreasing",
    populationEstimate: "No reliable count; declines of more than 50 per cent inferred over three generations",
    note: "Endangered on the basis of a very small range combined with a steep inferred decline. Hunting for food is the dominant pressure — goliath frogs are a valued bushmeat and are taken with snares, spears and guns — compounded by logging, farming and sedimentation of the clear, fast streams the tadpoles need. Collection for the international pet trade and for frog-jumping competitions has added to it, though the species breeds very poorly in captivity.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "17–32 cm",
      min: 17,
      max: 32,
      unit: "cm",
      note: "Snout to vent — the largest of any living frog. With the hind legs stretched out, total length can exceed 80 cm.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "600 g–3.25 kg",
      min: 0.6,
      max: 3.25,
      unit: "kg",
      note: "A specimen collected at Nkombia in 1960 weighed 3.3 kg, the heaviest on record.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to 15 years in the wild",
      min: 15,
      max: 21,
      unit: "years",
      note: "Captive animals have reached 21.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "Several hundred to a few thousand eggs",
      min: 500,
      max: 3000,
      unit: "eggs",
      note: "Each egg about 3.5 mm across, laid in a nest pool at the river's edge and attached to vegetation.",
    },
    {
      key: "jump-height",
      label: "Jump distance",
      value: "About 3 m from a standing start",
      min: 3,
      max: 3,
      unit: "m",
    },
    {
      key: "nest-size",
      label: "Nest pool",
      value: "About 1 m across and 10 cm deep",
      min: 1,
      max: 1,
      unit: "m",
      note: "Cleared, dammed or dug by the frogs themselves, with stones of up to 2 kg moved to form the rim.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — crabs, insects, worms, smaller frogs, fish and the occasional small vertebrate",
      icon: "Drumstick",
    },
    { key: "activity", label: "Activity", value: "Nocturnal; extremely wary and hard to approach by day", icon: "Moon" },
    {
      key: "nest-building",
      label: "Nest building",
      value: "Clears, dams or digs its own breeding pools and guards them",
      icon: "Hammer",
    },
    {
      key: "voice",
      label: "Voice",
      value: "No vocal sac — whistles with the mouth open instead of croaking",
      icon: "Music",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — fast, clear, oxygen-rich rainforest rivers and rapids",
      icon: "Droplet",
    },
    {
      key: "range-size",
      label: "Range",
      value: "A strip of Cameroon and Equatorial Guinea roughly 200 km across",
      icon: "MapPin",
    },
  ],

  highlights: ["length", "weight", "nest-building", "range-size"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "South-western Cameroon, from the Sanaga River south to the border",
      "Northern Equatorial Guinea (Río Muni)",
    ],
    habitats: ["Fast-flowing rainforest rivers and rapids", "Rocky river margins under closed canopy"],
    elevation: "Sea level to about 1,000 m",
    note: "The species is confined to a narrow band of coastal rainforest and requires clean, fast, well-oxygenated water — the tadpoles graze a single plant, Dicraeia warmingii, that grows only on rocks in the spray of rapids. That dependency ties the frog to undisturbed rivers and explains why sedimentation from logging and farming is as damaging as hunting.",
  },

  sections: [
    {
      id: "size",
      title: "How big is it, really",
      body: [
        "A sample of fifteen wild goliath frogs measured between 17 and 32 centimetres snout to vent and weighed between 600 grams and 3.25 kilograms. The record is a 3.3-kilogram animal collected at Nkombia in August 1960. Laid out with the hind legs extended — the way the frog is usually photographed for scale — a large individual exceeds 80 centimetres end to end.",
        "Nothing else among the roughly 7,000 living frog species comes close. What makes the size stranger is that the goliath frog is not built like a giant: it is proportioned like an ordinary river frog, with a smooth, granular olive-brown back, a pale yellow-white belly and enormously muscular legs, simply scaled up.",
        "Tadpoles, by contrast, are unexceptional. A goliath tadpole is roughly the size of any other river frog's, which means almost all the growth happens after metamorphosis. Adults have small eyes relative to head size, no vocal sac and, for a frog of that bulk, a startling capacity for standing jumps of around three metres.",
      ],
    },
    {
      id: "nests",
      title: "The nests, and what they might explain",
      body: [
        "In 2019 Marvin Schäfer, Mark-Oliver Rödel and colleagues published a survey of a 400-metre stretch of the Mpoula River in Cameroon's Littoral District. They found nineteen goliath frog nests, and sorted them into three kinds: existing rock pools cleared of leaf litter and detritus; washouts at the riverbank cleared and enlarged, sometimes with a dam of gravel and stones; and depressions dug from scratch into gravel banks, about a metre across and ten centimetres deep.",
        "Building one means moving material. The frogs shifted sand and leaves, and at several nests had pushed stones weighing up to two kilograms — roughly half the mass of a large adult — into a rim around the edge. Camera traps and night observation showed adults remaining at the nests through the night, apparently guarding the eggs and tadpoles against predators.",
        "The authors' proposal is that this is why the species is so large. Almost no other frog does this kind of construction work, and doing it requires strength that scales with body mass. If nest-building improves offspring survival enough, selection for the size needed to build a better nest could have driven the whole lineage upward — gigantism as a consequence of parental care rather than an accident of biogeography.",
        "The nests also solve an obvious problem. Goliath frogs live on fast rivers where eggs laid in the current would simply be swept away, and where fish would eat anything that stayed. A walled pool at the margin, cleared of silt and defended by a three-kilogram parent, is a considerably better place to be an egg.",
      ],
    },
    {
      id: "river",
      title: "Tied to clean, fast water",
      body: [
        "Goliath frogs are found only along rivers with rapids and waterfalls under closed rainforest canopy. Adults sit on wet rocks near the water, day and night, and dive at the slightest disturbance — they are famously difficult to approach, and much of what is known about them comes from hunters rather than researchers.",
        "The constraint is the tadpole. Goliath tadpoles feed almost exclusively on a single riverweed, Dicraeia warmingii, which grows only on rocks in the spray zone of rapids and waterfalls. No riverweed, no tadpoles. That makes the species vulnerable to anything that clouds the water or slows the current: silt from logging roads and farm clearance settles on the rocks and kills the plant, and small dams remove the rapids altogether.",
        "Adults are generalist predators — crabs, large insects, worms, smaller frogs, fish, occasionally a young snake or bat — and they hunt by sitting still near the water and lunging. Since they cannot call across the noise of rapids in the usual way, having no vocal sac, males use an open-mouthed whistle and a good deal of physical display instead.",
      ],
    },
    {
      id: "threats",
      title: "Hunted for food, and slow to replace",
      body: [
        "The goliath frog is eaten. It is a substantial, meaty animal in a region where protein is expensive, and it is taken with snares set on the riverbank, with spears and with guns; a single large frog is worth a meaningful amount of money in local markets and in the restaurant trade in Douala and Yaoundé. Surveys around the Douala-Edéa area have found the species to be commercially hunted well beyond subsistence levels.",
        "A second, smaller demand came from abroad. Goliath frogs were exported for the pet trade and, for a period, for frog-jumping competitions in the United States. They breed very poorly in captivity and most exported animals died, so essentially every traded frog was one taken from a wild population that could not spare it.",
        "Habitat loss finishes the picture. Logging, cocoa and oil palm expansion and small-scale farming all deliver silt into the rivers, and the loss of forest canopy warms water that the species needs cold. The 2019 assessment concluded that the population has fallen by more than half over three generations and listed the species as Endangered. It is legally protected in Cameroon, though enforcement along remote rivers is limited, and community-based schemes that give local hunters a stake in living frogs are among the more promising responses.",
      ],
    },
  ],

  related: ["american-bullfrog", "chinese-giant-salamander", "common-frog"],
  tags: ["frog", "cameroon", "largest frog", "endangered", "rainforest", "nest building"],
  searchTerms: [
    "conraua goliath",
    "biggest frog in the world",
    "giant slippery frog",
    "goliath bullfrog",
    "grenouille goliath",
  ],

  faqs: [
    {
      q: "How big is a goliath frog?",
      a: "Up to about 32 centimetres from snout to vent and 3.25 kilograms in weight, with a record specimen of 3.3 kg collected in 1960. With the hind legs stretched out a large individual exceeds 80 centimetres in total length. It is the largest living frog by a wide margin.",
    },
    {
      q: "Do goliath frogs really build nests?",
      a: "Yes. A 2019 study on the Mpoula River in Cameroon documented nineteen nests of three kinds: existing rock pools cleared of debris, riverbank washouts enlarged and dammed, and depressions dug into gravel banks about a metre across. The frogs moved stones of up to two kilograms to form the rims, and stayed to guard the eggs and tadpoles.",
    },
    {
      q: "Why is the goliath frog so large?",
      a: "The leading explanation, proposed by the team that documented its nest-building, is that the construction work itself drove the size. Clearing pools, damming banks and shifting heavy stones requires strength that scales with body mass, so if better nests mean more surviving offspring, selection would push the whole lineage larger over time.",
    },
    {
      q: "Where do goliath frogs live?",
      a: "Only in fast, clear rainforest rivers in south-western Cameroon and northern Equatorial Guinea — a range roughly 200 kilometres across. The tadpoles graze a single riverweed that grows only on rocks in the spray of rapids, which ties the species tightly to undisturbed, fast-flowing water.",
    },
    {
      q: "Why is the goliath frog endangered?",
      a: "Mainly hunting. It is a large, valuable bushmeat animal taken with snares, spears and guns, and demand extends to city markets. Logging and farming silt up the rapids its tadpoles depend on, and export for the pet trade and frog-jumping competitions removed further animals. The 2019 Red List assessment found a decline of more than 50 per cent over three generations.",
    },
  ],

  seo: {
    title: "Goliath Frog — Size, Nest Building & Why It Is Endangered",
    description:
      "A researched profile of the goliath frog (Conraua goliath): the world's largest frog at up to 3.25 kg, the nest pools it builds by moving two-kilogram stones, and the hunting pressure behind its Endangered listing.",
    keywords: [
      "goliath frog",
      "conraua goliath",
      "largest frog in the world",
      "goliath frog nest",
      "goliath frog endangered",
    ],
  },

  sources: [
    {
      label: "Conraua goliath — Red List assessment (2019, e.T5263A96062132)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/5263/96062132",
    },
    {
      label: "Goliath frogs build nests for spawning — the reason for their gigantism?",
      publisher: "Journal of Natural History",
      url: "https://www.tandfonline.com/doi/full/10.1080/00222933.2019.1642528",
    },
    {
      label: "Local perceptions, hunting and export of the Endangered goliath frog in Cameroon",
      publisher: "Oryx, Cambridge University Press",
      url: "https://www.cambridge.org/core/journals/oryx/article/local-perceptions-hunting-and-export-of-the-endangered-goliath-frog-conraua-goliath-in-cameroon/ECA1DE116F93B20F0DEC5E96BC7CC65F",
    },
    {
      label: "Conraua goliath — natural history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Conraua_goliath/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default goliathFrog;
