// Golden poison frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const goldenPoisonFrog = {
  slug: "golden-poison-frog",
  category: "amphibians",
  name: "Golden Poison Frog",
  scientificName: "Phyllobates terribilis",
  otherNames: ["Golden dart frog", "Golden poison arrow frog", "Terrible poison frog"],

  summary:
    "A five-centimetre frog that carries enough batrachotoxin to kill a roomful of people — and loses every trace of it in captivity, because the poison is not made by the frog but taken from what it eats in one small stretch of Colombian rainforest.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Schrecklicherpfeilgiftfrosch-01.jpg",
    alt: "A bright yellow golden poison frog on damp leaf litter",
    credit: "Wilfried Berns / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Golden_Poison_dart_frog_Phyllobates_terribilis.jpg/1920px-Golden_Poison_dart_frog_Phyllobates_terribilis.jpg",
      alt: "A golden poison frog in profile, uniform yellow with dark eyes and no markings",
      credit: "Brian Gratwicke / Wikimedia Commons",
      title: "Colour as a warning, not camouflage",
      caption:
        "Nothing about this frog is hidden. Unbroken, saturated colour with no pattern to break up the outline is aposematism — an advertisement aimed at predators that have learned, or inherited the instinct, to leave it alone.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/GoldenPoisonDartFrog_PhyllobatesTerribilis.jpg/1920px-GoldenPoisonDartFrog_PhyllobatesTerribilis.jpg",
      alt: "A golden poison frog on a mossy branch in a zoo terrarium",
      credit: "Ltshears / Wikimedia Commons",
      title: "Harmless behind glass",
      caption:
        "A captive-bred golden poison frog carries no batrachotoxin at all. The toxin is sequestered from wild arthropod prey, so a frog raised on fruit flies and crickets is chemically ordinary and can be handled safely.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/GoldenPoisonDartFrog_PhyllobatesTerribilis2.jpg/1920px-GoldenPoisonDartFrog_PhyllobatesTerribilis2.jpg",
      alt: "Close view of a golden poison frog showing its smooth skin and expanded toe discs",
      credit: "Ltshears / Wikimedia Commons",
      title: "Built for the forest floor",
      caption:
        "Expanded discs on the fingers and toes give grip on wet leaves and low vegetation. Unlike most poison frogs this one is largely terrestrial, walking rather than leaping through the leaf litter it hunts in.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Gfp-golden-arrow-poison-dart-frog.jpg/1920px-Gfp-golden-arrow-poison-dart-frog.jpg",
      alt: "A golden poison frog standing on a wet leaf, body raised on straightened legs",
      credit: "Yinan Chen / Wikimedia Commons",
      title: "Active in daylight",
      caption:
        "Golden poison frogs forage openly by day, which only makes sense for an animal that has nothing to gain from hiding. Their prey is largely ants and termites — the same small arthropods that supply the alkaloids in their skin.",
    },
  ],

  headline: "The most poisonous animal on Earth — until you feed it differently",
  intro: [
    "An adult golden poison frog is about the length of a paperclip and carries somewhere between 700 and 1,900 micrograms of batrachotoxin in glands just beneath its skin. That is one of the most potent non-protein toxins known, and it is enough that the Emberá people of western Colombia could arm a blowgun dart by wiping it once across the frog's back.",
    "The frog does not manufacture any of it. Batrachotoxin is taken up from small arthropods in its diet and concentrated in the skin, which is why the same species raised on commercially bred insects is completely harmless. It is also why the animal cannot be separated from its habitat: the entire species lives in a strip of lowland rainforest on Colombia's Pacific coast, and the chemistry that makes it famous exists nowhere else.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Dendrobatidae",
    genus: "Phyllobates",
    species: "Phyllobates terribilis",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2017,
    populationTrend: "decreasing",
    populationEstimate: "No published count; locally common but confined to a very small area",
    note: "Listed as Endangered under criterion B1ab(iii) — a range-based listing rather than a headcount. The whole species occupies an extent of occurrence below the 5,000 km² threshold that criterion uses, in the Río Saija drainage of Cauca and roughly 60 km north into Valle del Cauca, and that forest is being cleared for agriculture, logging and mining. Where the frog survives it can be abundant; the risk is that the map is small enough for a single regional change to affect all of it.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "4.7–5.5 cm",
      min: 4.7,
      max: 5.5,
      unit: "cm",
      note: "Snout to vent; females are slightly larger than males. Adults are sometimes quoted at up to 6 cm.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 30 g",
      max: 30,
      unit: "g",
      note: "Published mass figures vary; it is comfortably the largest of the poison dart frogs.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Over 10 years in captivity",
      min: 10,
      max: 20,
      unit: "years",
      note: "Wild lifespan is poorly documented; captive animals of more than 20 years have been reported.",
    },
    {
      key: "toxin-load",
      label: "Batrachotoxin carried",
      value: "About 700–1,900 µg per frog",
      min: 700,
      max: 1900,
      unit: "µg",
      note: "Measured in wild-caught animals. Captive-bred frogs carry none.",
    },
    {
      key: "toxin-potency",
      label: "Toxin potency",
      value: "LD50 around 0.2 µg/kg in mice",
      min: 0.2,
      max: 0.2,
      unit: "µg/kg",
      note: "Subcutaneous. Among the most potent non-protein toxins known from any animal.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "Usually fewer than 20 eggs",
      min: 8,
      max: 20,
      unit: "eggs",
      note: "Laid on land in leaf litter, not in water",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 12–18 months",
      min: 1,
      max: 1.5,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — ants, termites, mites and small beetles", icon: "Drumstick" },
    { key: "venom-type", label: "Skin toxin", value: "Batrachotoxin — a poison, not a venom: no bite, no sting", icon: "Skull" },
    { key: "toxin-source", label: "Source of the toxin", value: "Diet-derived; captive-bred frogs are entirely non-toxic", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Diurnal — forages openly on the forest floor", icon: "Sun" },
    { key: "parental-care", label: "Parental care", value: "The male guards the clutch and carries hatched tadpoles on his back", icon: "Baby" },
    { key: "range-size", label: "Range", value: "A small area of Colombia's Pacific coast — nowhere else", icon: "MapPin" },
  ],

  highlights: ["length", "toxin-load", "venom-type", "range-size"],

  distribution: {
    continents: ["South America"],
    regions: ["Cauca and Valle del Cauca departments, Pacific Colombia"],
    habitats: ["Lowland tropical rainforest", "Chocó forest floor and stream margins"],
    elevation: "About 100–200 m",
    note: "The species was described in 1978 from Quebrada Guanguí in the upper Río Saija drainage of Cauca, and is known from that area and roughly 60 km north into Valle del Cauca. This is part of the Chocó, one of the wettest places on Earth, with five metres of rain a year, temperatures around 26 °C and humidity of 80–90 per cent.",
  },

  sections: [
    {
      id: "toxin",
      title: "What batrachotoxin actually does",
      body: [
        "Batrachotoxin binds to voltage-gated sodium channels in nerve and muscle cells and holds them open. Sodium floods in and cannot be shut off, so the cells stay permanently depolarised and lose the ability to fire in any controlled way. The result is paralysis, cardiac arrhythmia and heart failure. There is no antivenom, because there is nothing to neutralise in the usual sense — the toxin is a small steroidal alkaloid, not a protein the immune system can be trained against.",
        "The frog stores it in granular glands in the skin, from which it seeps out under stress. This is a poison rather than a venom: the animal has no delivery mechanism and no interest in using it offensively. It works only on something that bites, mouths or otherwise absorbs it.",
        "How the frog survives its own chemistry is still unsettled. A sodium-channel mutation was proposed as the answer and shown in 2017 to confer resistance when engineered into a rat channel, but a 2021 study found that the frog's own channels are not in fact batrachotoxin-resistant, and suggested instead that a binding protein — a 'toxin sponge' — mops the compound up before it can reach them.",
      ],
    },
    {
      id: "diet-derived",
      title: "Why captive frogs are harmless",
      body: [
        "Golden poison frogs do not synthesise batrachotoxin. They sequester it, along with a suite of related alkaloids, from the small arthropods they eat, and concentrate it in their skin. Take away that food supply and the chemistry simply does not appear.",
        "This is not a subtle reduction. Frogs bred in captivity on fruit flies and crop-raised crickets are treated as non-toxic, and can be kept and handled in ordinary terrarium conditions. Wild-caught animals brought into captivity gradually lose their potency as the stored supply is not replenished.",
        "The dietary source has never been pinned down for this species. The best available lead came in 2004, when high concentrations of batrachotoxins were found in melyrid beetles of the genus Choresine in New Guinea — the same compounds that make certain New Guinean birds toxic. Melyrid beetles also occur in Colombian rainforest, which makes a related beetle the leading candidate for the frog's source, but the chain has not been closed.",
      ],
    },
    {
      id: "blowgun",
      title: "The frog that named the dart frogs",
      body: [
        "The whole 'poison dart frog' category comes from three species of Phyllobates, and this one is the species that made the practice practical. The Emberá and Wounaan of western Colombia prepared blowgun darts by drawing the tips across the frog's back — for the golden poison frog, without needing to kill or heat the animal, though a related species was held over a fire to make it exude.",
        "Darts treated this way were reported to stay lethal for a year or more. Of the roughly 300 species of poison frog, only these few carry batrachotoxin and only they were ever used this way; the name has since been applied loosely to the entire family.",
        "The species was formally described in 1978 by Charles Myers, John Daly and Borys Malkin, in the paper that documented both the frog and the dart-poisoning technique. The specific name terribilis was not an exaggeration for effect.",
      ],
    },
    {
      id: "conservation",
      title: "A very small map",
      body: [
        "The golden poison frog is not endangered because it is rare where it lives. In good habitat it can be locally common, and unusually for a frog it will tolerate being close to other individuals. It is endangered because the habitat itself is small and shrinking.",
        "Its known range is a fraction of Colombia's Pacific lowlands — the Río Saija drainage and a strip to the north — and that forest is under pressure from logging, conversion to farmland, gold mining and the pollution that comes with it. The 2017 Red List assessment listed the species as Endangered on exactly that basis: a very restricted extent of occurrence combined with a continuing decline in habitat quality.",
        "Captive breeding is well established and the species is listed on CITES Appendix II, so demand from the pet trade is not the main pressure. The awkward part of that success is that captive populations preserve the frog but not the phenomenon: without the wild arthropods, a captive golden poison frog is a yellow frog and nothing more.",
      ],
    },
  ],

  related: ["axolotl", "american-bullfrog", "chinese-giant-salamander"],
  tags: ["poison frog", "dendrobatidae", "batrachotoxin", "colombia", "endangered", "rainforest"],
  searchTerms: [
    "phyllobates terribilis",
    "golden dart frog",
    "poison arrow frog",
    "most poisonous animal",
    "rana venenosa dorada",
  ],

  faqs: [
    {
      q: "How poisonous is a golden poison frog?",
      a: "A wild adult carries roughly 700 to 1,900 micrograms of batrachotoxin in its skin. The toxin has an LD50 of about 0.2 micrograms per kilogram in mice, making it one of the most potent non-protein toxins known from any animal, and a single frog is commonly estimated to hold enough to kill several adult humans.",
    },
    {
      q: "Why are captive golden poison frogs not poisonous?",
      a: "Because the frog does not make batrachotoxin. It sequesters the compound from small arthropods in its wild diet and concentrates it in its skin. Frogs bred in captivity and fed on fruit flies and crickets never acquire it, and are treated as non-toxic.",
    },
    {
      q: "Is the golden poison frog venomous?",
      a: "No. It is poisonous, not venomous. There is no bite, sting or injection mechanism — the toxin sits in glands in the skin and only affects an animal that bites, mouths or otherwise absorbs it. That distinction is why it is a defence rather than a weapon.",
    },
    {
      q: "Where do golden poison frogs live?",
      a: "Only in lowland rainforest on the Pacific coast of Colombia, in the Cauca and Valle del Cauca departments, at about 100 to 200 metres above sea level. The whole species occupies an extent of occurrence of under 5,000 square kilometres, which is why it is listed as Endangered.",
    },
    {
      q: "Were these frogs really used to poison darts?",
      a: "Yes. The Emberá and Wounaan of western Colombia armed blowgun darts by drawing the tips across the frog's back, and treated darts were reported to remain lethal for a year or more. Only three Phyllobates species were ever used this way, although the name 'poison dart frog' is now applied to the whole family.",
    },
  ],

  seo: {
    title: "Golden Poison Frog — Batrachotoxin, Range & Conservation",
    description:
      "A researched profile of the golden poison frog (Phyllobates terribilis): how batrachotoxin works, why captive-bred frogs are harmless, and why an Endangered listing rests on a range of under 5,000 km².",
    keywords: [
      "golden poison frog",
      "phyllobates terribilis",
      "batrachotoxin",
      "most poisonous animal",
      "poison dart frog colombia",
    ],
  },

  sources: [
    {
      label: "Phyllobates terribilis — Red List assessment (2017, e.T55264A85887889)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/55264/85887889",
    },
    {
      label: "Phyllobates terribilis Myers, Daly, and Malkin, 1978 — taxonomy and type locality",
      publisher: "Amphibian Species of the World, American Museum of Natural History",
      url: "https://amphibiansoftheworld.amnh.org/Amphibia/Anura/Dendrobatoidea/Dendrobatidae/Dendrobatinae/Phyllobates/Phyllobates-terribilis",
    },
    {
      label: "Phyllobates terribilis — natural history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Phyllobates_terribilis/",
    },
    {
      label: "Melyrid beetles (Choresine): a putative source for the batrachotoxin alkaloids",
      publisher: "Proceedings of the National Academy of Sciences",
      url: "https://www.pnas.org/doi/10.1073/pnas.0407197101",
    },
    {
      label: "Evidence that toxin resistance in poison birds and frogs may rely on toxin-sponge proteins",
      publisher: "Journal of General Physiology",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8348241/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default goldenPoisonFrog;
