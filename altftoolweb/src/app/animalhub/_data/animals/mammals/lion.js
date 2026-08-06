// Lion — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const lion = {
  slug: "lion",
  category: "mammals",
  name: "Lion",
  scientificName: "Panthera leo",
  otherNames: ["African lion", "Asiatic lion"],

  summary:
    "The only cat that lives in permanent social groups, hunting cooperatively across African savannas and, in one Indian forest, as the last wild population outside Africa.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=80",
    alt: "A male lion with a full mane walking through open grass",
    credit: "Francesco / Unsplash",
  },
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1400&q=80",
      alt: "An adult male lion resting on grass beside a cub",
      credit: "Zdeněk Macháček / Unsplash",
    },
  ],

  headline: "The only big cat that lives in a pride",
  intro: [
    "Lions are unusual among cats in almost every way that matters. Nearly all of the world's roughly forty cat species are solitary; the lion lives in a pride, defends a shared territory, and hunts in coordinated groups. It is also the only cat with obvious visual differences between the sexes — the male's mane has no equivalent anywhere else in the family.",
    "Once found across Africa, southern Europe and southwest Asia into India, wild lions now occupy a small fraction of that range. Sub-Saharan Africa holds almost all of them. A single separate population survives in and around Gir Forest in Gujarat, India — the last of the Asiatic lions.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Felidae",
    genus: "Panthera",
    species: "Panthera leo",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2023,
    populationTrend: "decreasing",
    populationEstimate: "Roughly 20,000–25,000 individuals remain in the wild",
    note: "Numbers have fallen sharply across most of Africa, though some fenced and well-funded reserves in southern Africa hold stable or growing populations. The Asiatic population in Gir is small but has been increasing under intensive protection.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.7–2.5 m",
      min: 1.7,
      max: 2.5,
      unit: "m",
      note: "Males sit at the upper end of the range",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.9–1.05 m",
      min: 0.9,
      max: 1.05,
      unit: "m",
      note: "Tipped with a dark tuft",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "1.0–1.2 m",
      min: 1.0,
      max: 1.2,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "110–225 kg",
      min: 110,
      max: 225,
      unit: "kg",
      note: "Females 110–150 kg, males 150–225 kg",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "About 80 km/h",
      min: 80,
      max: 80,
      unit: "km/h",
      note: "Sustained only in short bursts of a few hundred metres",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "10–14 years in the wild",
      min: 10,
      max: 14,
      unit: "years",
      note: "Over 20 years in captivity; wild males rarely reach the upper end",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "Around 650 PSI",
      min: 650,
      max: 650,
      unit: "PSI",
      note: "Lower than a tiger's, but applied through a throat grip held until the prey suffocates",
    },
    {
      key: "jump-height",
      label: "Jump height",
      value: "Up to about 3.6 m",
      min: 3.6,
      max: 3.6,
      unit: "m",
      note: "Vertical leap; horizontal bounds are longer still",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "3–4 years (females), 4–5 years (males)",
      min: 3,
      max: 5,
      unit: "years",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 110 days",
      min: 100,
      max: 120,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1–4 cubs",
      min: 1,
      max: 4,
      unit: "cubs",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Prides of related females", icon: "Users" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal and crepuscular", icon: "Moon" },
    { key: "conservation-role", label: "Ecological role", value: "Apex predator", icon: "Crown" },
  ],

  highlights: ["weight", "top-speed", "lifespan", "social-structure"],

  distribution: {
    continents: ["Africa", "Asia"],
    regions: [
      "Eastern Africa",
      "Southern Africa",
      "Western Africa",
      "Gir Forest, Gujarat, India",
    ],
    habitats: ["Savanna", "Grassland", "Open woodland", "Scrub", "Dry forest"],
    elevation: "Sea level to around 4,000 m on East African mountains",
    note: "Lions avoid dense rainforest and true desert interiors. The Asiatic population is confined to a single landscape, which makes it vulnerable to a single catastrophic event such as disease or fire.",
  },

  sections: [
    {
      id: "habitat",
      title: "Habitat and range",
      body: [
        "Lions occupy open and lightly wooded country where large grazing animals are common — savanna, grassland, scrub and dry forest. They need cover for stalking and access to water, but not the closed canopy that leopards and tigers prefer.",
        "The historical range once stretched from Greece through the Middle East to India, and across nearly all of Africa. Today lions are gone from more than nine-tenths of that area. What remains is fragmented into separate populations, many of them dependent on protected reserves and unable to exchange individuals with neighbouring groups.",
      ],
    },
    {
      id: "diet",
      title: "Diet and hunting",
      body: [
        "Lions take medium to large hoofed animals — wildebeest, zebra, buffalo, warthog, gemsbok and impala among them — with the preferred prey weight sitting somewhere between roughly 190 and 550 kg. They also scavenge readily, and will drive other predators such as hyenas and cheetahs off a fresh kill.",
        "Lionesses do most of the hunting and often work as a group, spreading out to cut off escape routes rather than relying on a single chase. It is a short-range strategy: lions are powerful but not built for distance, so a stalk that fails to get close usually ends the attempt. Males contribute more often than their reputation suggests, particularly on large or dangerous prey such as buffalo.",
      ],
    },
    {
      id: "behavior",
      title: "Behaviour and social life",
      body: [
        "A pride is built around related females — sisters, mothers, daughters and cousins — who stay in their natal group for life. Attached to them is a coalition of one to four adult males, usually brothers or unrelated allies, who hold tenure for a few years before being displaced by a stronger coalition.",
        "Roaring is territorial advertisement and can carry as far as eight kilometres on still air, telling neighbours where a pride is and how many adults it holds. Between hunts, lions are strikingly inactive, resting for the greater part of a day.",
        "When a new coalition takes over a pride, incoming males commonly kill young cubs. It is brutal but not arbitrary: females return to breeding condition sooner without dependent cubs, and the new males have only a short tenure in which to father their own.",
      ],
    },
    {
      id: "reproduction",
      title: "Reproduction and cubs",
      body: [
        "There is no fixed breeding season. After a gestation of roughly 110 days a lioness gives birth away from the pride to a litter of one to four cubs, born blind and helpless, and keeps them hidden for several weeks before introducing them to the group.",
        "Females in a pride often give birth around the same time and will nurse each other's cubs, a form of communal care that is rare among cats. Cubs are weaned at six to seven months. Young females usually stay; young males are pushed out at around two to three years and spend a nomadic period before attempting to take over a pride of their own.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "The main pressures are habitat loss, the collapse of wild prey populations, and conflict with people — lions that kill livestock are frequently killed in return, often by poisoning. Trade in lion bones and body parts, and poorly regulated trophy hunting in some countries, add further pressure.",
        "Conservation results are uneven. Several fenced reserves in southern Africa hold healthy, growing populations that need active management to avoid overcrowding, while lions in parts of West and Central Africa have declined to a few hundred animals in scattered fragments. Programmes that compensate herders for livestock losses, or that fund predator-proof enclosures, have measurably reduced retaliatory killing where they operate.",
      ],
    },
  ],

  related: ["tiger", "african-savanna-elephant"],
  tags: ["big cat", "apex predator", "africa", "carnivore", "savanna", "social"],
  searchTerms: ["king of the jungle", "panthera", "lioness", "pride", "mane"],

  faqs: [
    {
      q: "Why do male lions have a mane?",
      a: "The mane signals a male's condition to rivals and to females — darker, fuller manes are associated with better-fed, higher-testosterone males, and studies in the Serengeti found that females preferred them and rival males were more hesitant to approach them. It also offers some protection to the neck during fights, though this is likely a secondary benefit rather than the main reason it evolved.",
    },
    {
      q: "Do lions actually live in jungles?",
      a: "No. Despite the nickname, lions avoid dense forest. They live in savanna, grassland, open woodland and scrub, where there is enough cover to stalk but enough open ground to spot and pursue large grazing animals.",
    },
    {
      q: "How fast can a lion run?",
      a: "A lion can reach roughly 80 km/h, but only over a very short distance. Its hunting strategy depends on getting close before the sprint begins, because prey such as wildebeest can maintain speed far longer than a lion can.",
    },
    {
      q: "Are there still wild lions in Asia?",
      a: "Yes. A single population of Asiatic lions survives in and around Gir Forest in Gujarat, India. It is the only wild lion population outside Africa. Intensive protection has allowed it to grow, but because it is concentrated in one landscape it remains vulnerable to disease outbreaks or other localised catastrophes.",
    },
    {
      q: "Do female lions do all the hunting?",
      a: "Lionesses do the majority of it, and are usually the ones coordinating group hunts. Males hunt more often than the stereotype allows, especially where prey is large and dangerous — a buffalo is a far more manageable target with a male's weight behind the attack.",
    },
  ],

  seo: {
    title: "Lion — Facts, Habitat, Diet, Behaviour & Conservation",
    description:
      "A researched profile of the lion (Panthera leo): pride structure, hunting behaviour, size and speed, range across Africa and Gir Forest in India, and its Vulnerable conservation status.",
    keywords: ["lion facts", "panthera leo", "lion habitat", "lion pride", "asiatic lion"],
  },

  sources: [
    {
      label: "Panthera leo — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/15951/115130419",
    },
    {
      label: "Lion species profile",
      publisher: "Panthera",
      url: "https://panthera.org/cat/lion",
    },
    {
      label: "African lion overview",
      publisher: "African Wildlife Foundation",
      url: "https://www.awf.org/wildlife-conservation/lion",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default lion;
