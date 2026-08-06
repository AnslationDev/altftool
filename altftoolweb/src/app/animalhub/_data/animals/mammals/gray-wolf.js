// Gray wolf — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const grayWolf = {
  slug: "gray-wolf",
  category: "mammals",
  name: "Gray Wolf",
  scientificName: "Canis lupus",
  otherNames: ["Grey wolf", "Timber wolf", "Common wolf"],

  summary:
    "A coursing predator that once ranged across more of the northern hemisphere than any land mammal except humans, living in family packs that decades of popular writing mistook for dominance hierarchies.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Eurasian_wolf_2.jpg/1920px-Eurasian_wolf_2.jpg",
    alt: "A gray wolf in profile, its dense coat and long legs visible",
    credit: "Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Eurasischer_Wolf_%28Canis_lupus%29.jpg/1920px-Eurasischer_Wolf_%28Canis_lupus%29.jpg",
      alt: "A Eurasian wolf (Canis lupus), the form of the species found across Europe and northern Asia",
      credit: "C. Brück / Wikimedia Commons",
      title: "One species, many forms",
      caption:
        "Wolves vary enormously across their range. European animals average about 38.5 kg and North American ones about 36 kg, while Indian and Arabian wolves average nearer 25 kg — a size gradient that tracks the size of the prey available and the severity of the winter.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Canis_lupus_%28cropped%29.jpg",
      alt: "A gray wolf photographed at close range, head and shoulders filling the frame",
      credit: "Bernard Landgraf / Wikimedia Commons",
      title: "The head of a pursuit hunter",
      caption:
        "The long muzzle carries a scent apparatus far larger than a human's, and the deep jaw is built to hold a struggling ungulate rather than deliver a single killing bite. Wolves run their prey down and take it in stages, which is why endurance rather than ambush shapes the whole animal.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Canis_lupus._2021._El_Paso%2C_CO%2C_US._Robert_McCabe_%281%29_%2852582886470%29.jpg/1920px-Canis_lupus._2021._El_Paso%2C_CO%2C_US._Robert_McCabe_%281%29_%2852582886470%29.jpg",
      alt: "A gray wolf photographed in Colorado, United States",
      credit: "Bobby McCabe / Wikimedia Commons",
      title: "Back in the American West",
      caption:
        "Wolves were deliberately eradicated from almost all of the contiguous United States by the middle of the twentieth century. Reintroduction to Yellowstone in 1995 and 1996, followed by natural recolonisation southward, has put them back into states that had none for seventy years.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Canis_lupus._2021._El_Paso%2C_CO%2C_US._Robert_McCabe_%284%29_%2852582885855%29.jpg/1920px-Canis_lupus._2021._El_Paso%2C_CO%2C_US._Robert_McCabe_%284%29_%2852582885855%29.jpg",
      alt: "A gray wolf standing in the open in Colorado, United States",
      credit: "Bobby McCabe / Wikimedia Commons",
      title: "Built for distance, not speed",
      caption:
        "A wolf's narrow chest, long legs and slightly inward-turning feet are travel adaptations. Packs cover roughly 25 km on an average day, and dispersing young animals looking for a territory of their own have been tracked across hundreds of kilometres of unfamiliar country.",
    },
  ],

  headline: "The most widely distributed land predator there has ever been",
  intro: [
    "Before people set out to destroy it, the gray wolf occupied more of the planet's land surface than any mammal except humans — from the high Arctic south to about 12°N in India, across North America, Europe and Asia. Roughly a third of that range has since been lost, and almost none of it to habitat becoming unsuitable. It was lost to bounties, poison and traps.",
    "The wolf is also the animal most burdened by bad science. The idea of the dominant \"alpha\" fighting its way to the top of a pack came from watching unrelated captive animals thrown together in a zoo enclosure. Wild packs are families: a breeding pair and their own offspring, with the parents leading because they are the parents.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Canidae",
    genus: "Canis",
    species: "Canis lupus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2023,
    populationTrend: "stable",
    populationEstimate: "Roughly 200,000–250,000 worldwide",
    note: "Least Concern is a statement about the global total, not about any particular population. The species is stable and widespread across Canada, Alaska, Russia and much of Asia, and has been expanding in Europe, but it remains absent or precarious across large parts of its former range. The Mexican wolf survives as only a few hundred animals in the American Southwest and Mexico, and several European and Asian populations are small, isolated and legally contested. The current listing is the 2023 amended version of the 2018 assessment.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.05–1.6 m",
      min: 1.05,
      max: 1.6,
      unit: "m",
      note: "Nose to base of tail; northern populations are the largest",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.29–0.5 m",
      min: 0.29,
      max: 0.5,
      unit: "m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "0.8–0.85 m",
      min: 0.8,
      max: 0.85,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "25–50 kg",
      min: 25,
      max: 50,
      unit: "kg",
      note: "Mean body mass around 40 kg. The heaviest reliably recorded wild wolf weighed 79 kg; the lightest recorded adults were about 12 kg",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Around 60 km/h",
      min: 55,
      max: 61,
      unit: "km/h",
      note: "36–38 mph in short bursts while closing on prey; travelling pace is a fraction of that",
    },
    {
      key: "territory-size",
      label: "Territory size",
      value: "260–2,600 km²",
      min: 260,
      max: 2600,
      unit: "km²",
      note: "Often under 260 km² in the contiguous United States and 800–2,600 km² in Alaska and Canada; the largest territory ever recorded covered 6,272 km²",
    },
    {
      key: "pod-size",
      label: "Pack size",
      value: "5–9 wolves",
      min: 5,
      max: 9,
      unit: "wolves",
      note: "Averages about eight in North America and 5.5 in Europe. The largest pack on record held 42 animals",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "2–3 years",
      min: 2,
      max: 3,
      unit: "years",
      note: "Physically capable at around two, but most wolves do not breed until they leave the natal pack and pair up",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 63 days",
      min: 62,
      max: 75,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "4–6 pups",
      min: 4,
      max: 6,
      unit: "pups",
      note: "Young females typically produce four or five; experienced females six to eight, and litters of up to fourteen are recorded",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "6–8 years in the wild",
      min: 6,
      max: 8,
      unit: "years",
      note: "Some wild wolves reach nine or ten and a few live into their early teens; captive animals commonly reach 15 or 16",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Family packs led by the breeding pair", icon: "Users" },
    { key: "activity", label: "Activity", value: "Mainly crepuscular and nocturnal", icon: "Moon" },
    { key: "ecological-role", label: "Ecological role", value: "Keystone predator of large ungulates", icon: "Sprout" },
  ],

  highlights: ["weight", "top-speed", "social-structure", "territory-size"],

  distribution: {
    continents: ["North America", "Europe", "Asia"],
    regions: [
      "Canada and Alaska",
      "Northern Rocky Mountains and Great Lakes, United States",
      "Scandinavia and the Baltic states",
      "Central and Eastern Europe",
      "Russia and Central Asia",
      "Himalaya and Tibetan Plateau",
      "Arabian Peninsula and the Indian subcontinent",
    ],
    habitats: [
      "Temperate and boreal forest",
      "Arctic tundra",
      "Grassland and steppe",
      "Mountain",
      "Desert and semi-desert",
    ],
    elevation: "Sea level to above 4,000 m on the Tibetan Plateau",
    note: "The wolf is a habitat generalist. What it requires is not a particular vegetation type but large hoofed prey and tolerance from people, which is why its modern distribution maps onto human land use far more closely than onto climate. Densities run from roughly one wolf per 12 km² in the richest habitat down to one per 120 km² in the poorest.",
  },

  sections: [
    {
      id: "habitat",
      title: "Range and habitat",
      body: [
        "Historically the gray wolf lived throughout the northern hemisphere above about 15°N in North America and 12°N in India — tundra, boreal and temperate forest, mountain, steppe, and true desert. No other land mammal but ourselves has occupied so much ground. Around a third of that range has been lost, and the loss is concentrated exactly where human settlement is densest: Western Europe, Mexico, Japan, and all but a fragment of the contiguous United States.",
        "Territory size follows prey density and pack size rather than habitat type. In the lower forty-eight states a pack territory is often under 260 km²; in Alaska and Canada, where prey is sparser and more mobile, 800 to 2,600 km² is ordinary and the largest ever recorded covered 6,272 km². Packs patrol and scent-mark their boundaries constantly, and trespass by a neighbouring pack is one of the commonest causes of death for an adult wolf.",
      ],
    },
    {
      id: "pack",
      title: "The pack is a family",
      body: [
        "The most persistent misconception about wolves is the alpha. It comes from a 1947 study of unrelated captive wolves crowded into a zoo enclosure, where the animals did indeed fight for rank, and it was popularised in a 1970 book by the biologist L. David Mech. Mech then spent the rest of his career trying to withdraw it, having watched wild wolves on Ellesmere Island and elsewhere and found nothing of the kind.",
        "A wild pack is a family. It is a breeding pair and their offspring of the previous one to three years, and the pair leads for the same reason parents lead in any family group — not because they won a contest. Packs average about eight animals in North America and 5.5 in Europe, though the largest ever recorded held 42.",
        "Young wolves leave between one and three years old, and dispersal is the dangerous part of a wolf's life. Dispersers cross unfamiliar country, often hundreds of kilometres of it, without a pack to hunt with or a territory to fall back on. Most wolves that die violently die during this period.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting and diet",
      body: [
        "Wolves are coursing predators rather than ambushers. They locate a herd, approach, and force it to run, using the pursuit itself to identify an animal that is old, sick, young or simply slower than the rest. Most attempts fail — hunting large ungulates on the open ground is dangerous work, and a moose or bison can kill a wolf outright.",
        "The core diet is large hoofed prey: moose, elk, caribou, red deer, roe deer, wild boar and bison, supplemented by beaver, hares, rodents and carrion. Where wild prey has been depleted, wolves take livestock, and that fact rather than any danger to people is what drives most conflict with humans.",
        "Movement is the other half of the strategy. A pack covers about 25 km on an average day and can travel far more, sprinting at 55 to 60 km/h only in the final closing seconds of a chase. After a large kill a wolf gorges and may then go days without eating — a feast-and-famine metabolism suited to prey that is hard to catch and enormous when caught.",
      ],
    },
    {
      id: "reproduction",
      title: "Breeding and pups",
      body: [
        "In most packs only the breeding pair reproduces. Mating happens in late winter and, after a gestation of about 63 days, four to six pups are born in a den — usually an excavated burrow, sometimes a rock cavity or a hollow under roots. They are born blind and deaf and weigh a few hundred grams.",
        "Pups emerge from the den at around three weeks, are weaned by about eight, and are then moved to a series of open \"rendezvous sites\" where they stay while the adults hunt. Every member of the pack provisions them, returning with meat carried in the stomach and regurgitated on demand — which is what the pups are asking for when they lick and nip at an adult's muzzle.",
        "First-year mortality is high, and it is the single biggest brake on wolf numbers in most populations. A pack that loses its breeding female usually fails to raise a litter that year at all.",
      ],
    },
    {
      id: "recovery",
      title: "Persecution and return",
      body: [
        "The wolf was not driven back by habitat loss so much as hunted out on purpose. Government bounty systems, strychnine campaigns and trapping removed it from Britain, most of Western Europe, Japan, Mexico and virtually all of the contiguous United States. By the middle of the twentieth century the American population outside Alaska was down to a remnant in northern Minnesota.",
        "Reintroduction reversed that in one place very publicly. Forty-one wolves were released into Yellowstone National Park and central Idaho in 1995 and 1996, and the descendants of those animals, together with natural recolonisation from Canada, have re-established wolves across the northern Rockies and the Great Lakes states.",
        "Europe's recovery happened with far less fanfare and on a larger scale. Wolves returned on their own to countries that had been without them for a century, and the Large Carnivore Initiative for Europe's 2022 survey put the continental population at about 21,500 animals — a rise of roughly 58% in a decade, with range expanding by about a quarter.",
        "Yellowstone is also where the wolf's ecological reputation has to be handled carefully. Elk numbers fell after the reintroduction and willow and aspen have recovered in parts of the northern range, with the first new generation of overstory aspen in eighty years documented three decades on. But grizzly bears, cougars, human hunting, drought and a changing climate all moved in the same period, and researchers continue to argue about how much of the change belongs to the wolves. The popular version of the story is much tidier than the evidence.",
      ],
    },
  ],

  related: ["tiger", "snow-leopard", "lion"],
  tags: ["canid", "apex predator", "pack hunter", "north america", "europe", "asia", "carnivore"],
  searchTerms: ["canis lupus", "grey wolf", "timber wolf", "wolf pack", "alpha wolf", "yellowstone wolves"],

  faqs: [
    {
      q: "Is there really an alpha wolf?",
      a: "Not in the wild. The idea came from a 1947 study of unrelated captive wolves forced together in a zoo enclosure, where the animals genuinely did fight over rank. Wild packs are families — a breeding pair and their own offspring — and the pair leads because they are the parents, not because they defeated rivals. The biologist who popularised the term, L. David Mech, spent decades afterwards trying to retract it.",
    },
    {
      q: "How fast can a wolf run?",
      a: "About 55 to 60 km/h, or 36 to 38 mph, and only in short bursts during the final stage of a chase. Wolves are endurance animals rather than sprinters: their real advantage is the ability to travel roughly 25 km in a day and keep pressure on a herd until a vulnerable animal reveals itself.",
    },
    {
      q: "How many wolves are left in the world?",
      a: "Roughly 200,000 to 250,000, and the global trend is stable, which is why the IUCN lists the species as Least Concern. That figure hides very uneven fortunes: Canada, Alaska and Russia hold large secure populations, Europe has grown to about 21,500 animals, while the Mexican wolf survives as only a few hundred individuals.",
    },
    {
      q: "Are wolves dangerous to people?",
      a: "Very rarely. Attacks on humans are exceptional and are usually associated with rabies or with animals that have been habituated to human food. The real friction between wolves and people is livestock predation, which is why compensation schemes, guardian dogs and electric fencing do more for coexistence than any change in the law.",
    },
    {
      q: "Did wolves really change the rivers in Yellowstone?",
      a: "Partly, and less cleanly than the popular version suggests. Elk numbers did fall after the 1995–96 reintroduction, and willow and aspen have recovered in parts of the northern range — a 2025 study documented the first new generation of overstory aspen in eighty years. But grizzly bears, cougars, human hunting and drought changed over the same period, and researchers still disagree about how much credit the wolves deserve.",
    },
  ],

  seo: {
    title: "Gray Wolf — Pack Structure, Hunting, Range & Conservation Status",
    description:
      "A researched profile of the gray wolf (Canis lupus): why the alpha wolf is a myth, how packs hunt large prey, the species' worldwide range, and its recovery in Europe and North America.",
    keywords: [
      "gray wolf facts",
      "canis lupus",
      "alpha wolf myth",
      "how many wolves are left",
      "yellowstone wolf reintroduction",
    ],
  },

  sources: [
    {
      label: "Canis lupus — Red List assessment (2023 amended version of 2018 assessment)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/3746/247624660",
    },
    {
      label: "Grey wolf species account",
      publisher: "IUCN SSC Canid Specialist Group",
      url: "https://www.canids.org/species/view/PREKLD895731",
    },
    {
      label: "Wolf FAQs — biology, packs and behaviour",
      publisher: "International Wolf Center",
      url: "https://wolf.org/wolf-info/basic-wolf-info/wolves-and-humans/wolf-faqs/",
    },
    {
      label: "Large carnivore populations across Europe",
      publisher: "European Commission, Directorate-General for Environment",
      url: "https://environment.ec.europa.eu/topics/nature-and-biodiversity/habitats-directive/large-carnivores/large-carnivore-populations-across-europe_en",
    },
  ],

  updatedAt: "2026-07-29",
};

export default grayWolf;
