// Desert locust — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const desertLocust = {
  slug: "desert-locust",
  category: "insects",
  name: "Desert Locust",
  scientificName: "Schistocerca gregaria",
  otherNames: ["Desert grasshopper"],

  summary:
    "A shy, solitary grasshopper that, when crowded, changes colour, shape, brain and behaviour within days and becomes the insect responsible for the oldest recorded agricultural disaster.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f2/SGR_laying.jpg",
    alt: "A female desert locust with her abdomen extended into sandy ground, laying eggs",
    credit: "Christiaan Kooyman / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Afrikanische_Wanderheuschrecke_%28Schistocerca_gregaria%29%2C_Costa_Calma%2C_Fuerteventura_%2841464223162%29.jpg/1920px-Afrikanische_Wanderheuschrecke_%28Schistocerca_gregaria%29%2C_Costa_Calma%2C_Fuerteventura_%2841464223162%29.jpg",
      alt: "A single desert locust resting on dry ground, wings folded along the body",
      credit: "Frank Vassen from Brussels, Belgium / Wikimedia Commons",
      title: "One locust, alone",
      caption:
        "For most of the time, in most places, this is what the species looks like: scattered individuals at low density in the desert, avoiding one another and doing no damage at all.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/37/Copulating_desert_locust_pair.jpg",
      alt: "A pair of desert locusts mating, the smaller male riding on the female's back",
      credit: "Christiaan Kooyman / Wikimedia Commons",
      title: "Breeding follows the rain",
      caption:
        "Eggs need moist soil, so reproduction is tied to rainfall. A single well-timed storm across a large area of desert can allow a generation to succeed where the previous ten failed.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Desert_Locust_head_01.jpg",
      alt: "Close view of a desert locust's head showing large compound eyes and chewing mouthparts",
      credit: "Adam Matan / Wikimedia Commons",
      title: "Mandibles, not a proboscis",
      caption:
        "Locusts chew. The mandibles cut through leaf, stem and seed head alike, which is why the damage is total rather than selective — a swarm strips a field rather than sampling it.",
    },
  ],

  headline: "The same insect, twice",
  intro: [
    "For most of history the desert locust was believed to be two species. One was a retiring green or sand-coloured grasshopper found at low density across the deserts of North Africa and south-west Asia, avoiding others of its kind and doing no measurable harm. The other was a pink or bright yellow insect that flew in swarms of tens of millions and destroyed everything it landed on.",
    "They are the same animal. Crowding triggers a transformation — behaviour first, then colour, then body shape and even brain proportions — that turns solitarious locusts into gregarious ones within hours and generations. Nothing else in the insect world changes this much on a cue this simple, and nothing else has caused as much recorded famine.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Orthoptera",
    family: "Acrididae",
    genus: "Schistocerca",
    species: "Schistocerca gregaria",
  },

  conservation: {
    status: "NE",
    populationTrend: "unknown",
    populationEstimate:
      "No conservation estimate exists; during quiet periods the species occupies around 16 million km² of desert across some 30 countries, and during plagues can spread over 29 million km² and 60 countries",
    note: "Not evaluated by the IUCN, and it is one of the few insects where that omission is entirely uncontroversial: the desert locust is a major agricultural pest and the practical question is forecasting and suppression, not protection. It is nonetheless among the most closely monitored insects on Earth. FAO's Desert Locust Information Service has run continuous surveillance since 1978, combining ground survey, satellite rainfall and vegetation data and national reporting, precisely because the species can go from unremarkable to catastrophic in a few months.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "4.5–9 cm",
      min: 4.5,
      max: 9,
      unit: "cm",
      note: "Solitarious females are the largest at 6–9 cm; gregarious adults are smaller and more uniform, at roughly 4.5–6 cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "About 2 g",
      unit: "g",
      note: "An adult eats roughly its own body weight in fresh vegetation every day",
    },
    {
      key: "swarm-density",
      label: "Swarm density",
      value: "40–80 million adults per km²",
      min: 40000000,
      max: 80000000,
      unit: "locusts/km²",
      note: "FAO's working figures; a swarm may cover anything from under one square kilometre to several hundred",
    },
    {
      key: "daily-travel",
      label: "Swarm movement",
      value: "5–130 km in a day, sometimes more",
      min: 5,
      max: 130,
      unit: "km/day",
      note: "Swarms fly with the prevailing wind, which in practice carries them towards the rainfall zones where breeding is possible",
    },
    {
      key: "clutch-size",
      label: "Eggs per pod",
      value: "Up to about 100",
      unit: "eggs",
      note: "Laid in a froth-plugged hole roughly 10 cm below the surface; a female produces several pods in her life",
    },
    {
      key: "nymphal-instars",
      label: "Hopper instars",
      value: "Five when gregarious, six when solitarious",
      min: 5,
      max: 6,
      unit: "instars",
      note: "Gregarious hoppers develop through one fewer stage and march in dense bands before they can fly",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 3–5 months",
      min: 3,
      max: 5,
      unit: "months",
      note: "Extremely variable — egg, hopper and adult stages all stretch or compress with temperature and rainfall",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Green vegetation of almost any kind", icon: "Leaf" },
    { key: "phase", label: "Phases", value: "Solitarious and gregarious — switched by crowding", icon: "Users" },
    { key: "colour", label: "Colour", value: "Green or beige when solitary; pink then bright yellow when gregarious", icon: "Palette" },
    { key: "activity", label: "Activity", value: "Day-flying; swarms settle to feed overnight", icon: "Sun" },
    { key: "migration", label: "Movement", value: "Swarms carried downwind towards rain", icon: "Wind" },
    { key: "ecological-role", label: "Ecological role", value: "Desert herbivore; in plague, a transboundary crop pest", icon: "Sprout" },
  ],

  highlights: ["swarm-density", "daily-travel", "phase", "body-length"],

  distribution: {
    continents: ["Africa", "Asia", "Europe"],
    regions: [
      "The Sahara and Sahel, from Mauritania to Sudan",
      "The Horn of Africa",
      "The Arabian Peninsula",
      "Iran, Pakistan and north-west India",
      "Occasional plague incursions into southern Europe and across the Atlantic",
    ],
    habitats: [
      "Desert and semi-desert",
      "Dry grassland and scrub",
      "Seasonal wadis and floodplains",
      "Cropland during invasions",
    ],
    elevation: "Sea level to around 2,000 m; swarms fly at up to about 2,000 m above the ground",
    note: "The recession area — where the species lives during quiet periods — is around 16 million square kilometres of desert across some 30 countries. During plagues the invasion area extends to roughly 29 million square kilometres and parts of 60 countries, more than a fifth of the world's land surface.",
  },

  sections: [
    {
      id: "phases",
      title: "How crowding rebuilds the animal",
      body: [
        "The trigger is contact. When rainfall concentrates vegetation into patches, solitarious locusts are forced together, and repeated touching of the outer face of the hind femur is the specific stimulus that starts the change. Anstey and colleagues showed in 2009 that this works through serotonin: levels in the thoracic nervous system rise roughly threefold within a couple of hours of crowding, and that rise is both necessary and sufficient to convert behaviour from avoidance to attraction.",
        "Behaviour changes first — within hours, an insect that avoided others begins actively seeking them out. Colour follows over subsequent moults: solitarious green or beige gives way to the black-and-yellow of gregarious hoppers and, in adults, pink while immature and bright yellow at maturity. Then the body itself changes. Gregarious adults have relatively longer wings and shorter hind legs than solitarious ones, develop through five hopper instars instead of six, and differ measurably in the proportions of the brain, with the regions handling learning and multisensory integration enlarged.",
        "The change is partly heritable across generations, through maternal effects on the eggs, so a crowded female produces offspring already biased towards the gregarious form. It also runs in reverse: isolate gregarious locusts and their descendants revert. Neither state is the 'real' one — this is a single genome with two developmental outputs, matched to two entirely different ways of surviving a desert.",
      ],
    },
    {
      id: "swarms",
      title: "The arithmetic of a swarm",
      body: [
        "FAO works with figures that are worth stating plainly. A swarm carries between 40 and 80 million adult locusts per square kilometre and may cover anything from less than one square kilometre to several hundred. Each adult weighs about two grams and eats roughly its own body weight in fresh vegetation each day.",
        "Multiply those and the consequence follows: a swarm of one square kilometre — around 40 million insects, at the low end of the density range — consumes in a day about as much food as 35,000 people. A large swarm can therefore strip the standing crop of a district in a morning.",
        "Swarms move with the wind, travelling anywhere from 5 to 130 kilometres in a day, and because the winds in the region converge on the rainfall zones, drifting downwind reliably delivers the insects to the wet ground they need to breed. It also produces some remarkable journeys: during the 1987–89 plague, locusts were reported to have crossed the Atlantic from West Africa to the Caribbean in about ten days.",
        "Before they can fly, gregarious hoppers form marching bands on the ground — dense, coordinated, and moving in one direction for weeks. Bands are the stage at which control is most effective, because the population is concentrated, flightless and easy to find.",
      ],
    },
    {
      id: "plagues",
      title: "Upsurges and plagues",
      body: [
        "The escalation has a standard shape. An outbreak is a local increase after unusually good rains; several coinciding outbreaks make an upsurge; and an upsurge that spreads across regions and persists for more than a year becomes a plague. Numbers can rise roughly twentyfold with each successful generation, and generations can follow every few months when rain keeps arriving.",
        "The 2019–2021 upsurge is the clearest modern illustration. Two cyclones brought exceptional rain to the empty quarter of the Arabian Peninsula in 2018, allowing three undetected generations to breed in terrain nobody was surveying — an increase estimated at around 8,000-fold. From there swarms moved into the Horn of Africa, and then into Kenya, Iran, Pakistan and India, in the worst infestation those countries had seen in decades. Control operations eventually treated some 2.3 million hectares and were credited with averting several million tonnes of crop losses.",
        "The historical record is much longer than the modern one. Locust plagues appear in Egyptian tomb reliefs, the Book of Exodus, and the Qur'an, and in the twentieth century there were plagues running for a decade or more at a stretch. What has changed is not the biology but the response time.",
      ],
    },
    {
      id: "control",
      title: "Why forecasting is the whole game",
      body: [
        "Once a plague is under way, there is no good option. Spraying swarms in flight is expensive, imprecise and requires access to remote and often insecure terrain, and the pesticides involved carry real costs to other insects, to livestock and to the people applying them. Biopesticides based on the fungus Metarhizium acridum are more selective but act more slowly.",
        "The alternative is to prevent the escalation, which means finding and treating populations while they are still local. FAO's Desert Locust Information Service maintains continuous surveillance across the recession area, combining ground surveys, satellite estimates of rainfall and green vegetation, and reports from national locust control units, and issues monthly bulletins and forecasts.",
        "It works when it is funded and when surveyors can reach the ground. The failures follow a consistent pattern: breeding in territory that is remote, contested or closed to survey teams goes undetected until the swarms arrive somewhere populated. The 2019–2021 upsurge began in exactly that kind of gap, and the countries hit hardest were those where conflict had already made routine monitoring impossible.",
      ],
    },
  ],

  related: ["european-mantis", "monarch-butterfly", "leafcutter-ant"],
  tags: ["locust", "orthoptera", "swarm", "africa", "agriculture", "pest", "migration"],
  searchTerms: [
    "schistocerca gregaria",
    "locust swarm",
    "locust plague",
    "how many locusts in a swarm",
    "solitary gregarious locust",
  ],

  faqs: [
    {
      q: "How many locusts are in a swarm?",
      a: "FAO works with a density of 40 to 80 million adult locusts per square kilometre of swarm, and swarms range from under one square kilometre to several hundred. A one-square-kilometre swarm therefore holds around 40 million insects — which between them eat about as much food in a day as 35,000 people.",
    },
    {
      q: "What makes locusts swarm?",
      a: "Crowding. When rain concentrates vegetation into patches, solitary locusts are pushed together, and repeated touching of the outer surface of the hind leg triggers a roughly threefold rise in serotonin in the nervous system within a couple of hours. That change flips behaviour from avoiding other locusts to seeking them out; colour, body shape and even brain proportions follow over subsequent moults.",
    },
    {
      q: "Are locusts and grasshoppers different animals?",
      a: "Locusts are grasshoppers — specifically, the few grasshopper species capable of the density-driven change from a solitary to a swarming form. A desert locust living at low density in the desert is to all appearances an ordinary shy grasshopper. The distinction is a capability, not a taxonomic rank.",
    },
    {
      q: "How far can a locust swarm travel?",
      a: "Swarms move 5 to 130 kilometres in a day, and sometimes further, flying with the prevailing wind rather than against it. Because regional winds converge on rainfall zones, drifting downwind tends to carry them to the moist ground they need for laying. During the 1987–89 plague, locusts were reported crossing the Atlantic from West Africa to the Caribbean in around ten days.",
    },
    {
      q: "Can locust plagues be stopped?",
      a: "Only early. Spraying full-grown swarms is costly, imprecise and hard to sustain over remote terrain, so control depends on finding and treating populations while they are still local — particularly the flightless marching hopper bands. FAO's Desert Locust Information Service runs continuous surveillance for this reason. It fails mainly where breeding grounds cannot be surveyed, which is why conflict zones are where recent upsurges have started.",
    },
  ],

  seo: {
    title: "Desert Locust — Swarms, Phase Change & Plagues",
    description:
      "A researched profile of the desert locust (Schistocerca gregaria): how crowding transforms a solitary grasshopper into a swarming one, FAO's swarm figures, the 2019–21 upsurge, and why forecasting matters.",
    keywords: [
      "desert locust",
      "schistocerca gregaria",
      "locust swarm size",
      "locust plague",
      "locust phase change",
    ],
  },

  sources: [
    {
      label: "Frequently asked questions about locusts",
      publisher: "FAO Locust Watch",
      url: "https://www.fao.org/locust-watch/resources/frequently-asked-questions-(faqs)-about-locusts/en",
    },
    {
      label: "Desert Locust — Locust Watch and the Desert Locust Information Service",
      publisher: "Food and Agriculture Organization of the United Nations",
      url: "https://www.fao.org/locusts/en/",
    },
    {
      label: "Anstey et al. (2009), 'Serotonin mediates behavioral gregarization underlying swarm formation in desert locusts'",
      publisher: "Science",
      url: "https://www.science.org/doi/10.1126/science.1165939",
    },
  ],

  updatedAt: "2026-07-29",
};

export default desertLocust;
