// Cane toad — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const caneToad = {
  slug: "cane-toad",
  category: "amphibians",
  name: "Cane Toad",
  scientificName: "Rhinella marina",
  otherNames: ["Giant toad", "Marine toad", "Bufo marinus"],

  summary:
    "Introduced to Queensland in 1935 to eat a beetle it could not reach, the cane toad has since crossed a continent, poisoned the predators that tried to eat it, and evolved measurably longer legs at the front of its own invasion.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/99/Canetoadmale.jpg",
    alt: "A male cane toad on dry ground in the Northern Territory, warty brown skin and a heavy body",
    credit: "Benjamint444 / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Baby_Cane_Toad._Rhinella_marina_%2829004393628%29.jpg/1920px-Baby_Cane_Toad._Rhinella_marina_%2829004393628%29.jpg",
      alt: "A juvenile cane toad on wet ground in Darién Province, Panama",
      credit: "gailhampshire from Cradley, Malvern, U.K / Wikimedia Commons",
      title: "At home, and unremarkable",
      caption:
        "In its native Central and South America the cane toad is an ordinary member of the community — held in check by predators, parasites and competitors that grew up alongside it. Nothing about it there predicts what it does elsewhere.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Adult_Cane_toad.jpg/1920px-Adult_Cane_toad.jpg",
      alt: "An adult cane toad with heavily warted skin and a broad, squat body",
      credit: "brian.gratwicke / Wikimedia Commons",
      title: "The glands behind the eyes",
      caption:
        "The swollen parotoid glands on the shoulders are the toad's whole defence. Squeezed by a predator's jaws, they release bufotoxin — which is why a mouthful of cane toad kills animals that have never met one.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Bufo_marinus_%28Cane_toad%29_%283996247153%29.jpg/1920px-Bufo_marinus_%28Cane_toad%29_%283996247153%29.jpg",
      alt: "A cane toad sitting on a road surface",
      credit: "Maximilian Paradiz from Amsterdam, Netherlands / Wikimedia Commons",
      title: "Roads are the fast lane",
      caption:
        "Cleared corridors and roads suit cane toads better than intact bush: the going is easy, the insects gather under lights, and the invasion front advances fastest along exactly this kind of open ground.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Bufo_marinus_%28Linnaeus%2C_1758%29_-_cane_toad%2C_giant_toad%2C_marine_toad_%283795685459%29.jpg",
      alt: "A large cane toad photographed in Bermuda, its skin covered in dry warts",
      credit: "Sam Fraser-Smith from Brisbane, Australia / Wikimedia Commons",
      title: "Not only Australia",
      caption:
        "Australia is the famous case, but cane toads were shipped to sugar-growing regions worldwide. Bermuda, Fiji, the Philippines, Papua New Guinea and much of the Caribbean all hold introduced populations.",
    },
  ],

  headline: "A biological control that controlled nothing",
  intro: [
    "In June 1935 an entomologist from the Bureau of Sugar Experiment Stations collected 102 cane toads in Hawaii and brought them to Gordonvale, near Cairns in north Queensland. They bred readily, and by the following year tens of thousands of young toads had been released into the cane fields. The intention was to control the grey-backed cane beetle, which was destroying the sugar crop.",
    "It failed completely, and for a reason nobody had checked in advance: the adult beetles live high on the cane stalks, and cane toads cannot climb. The toads stayed on the ground, ate whatever else was available, and began to spread. Ninety years later they occupy well over a million square kilometres of northern Australia, are estimated in the hundreds of millions, and have become the standard textbook illustration of what happens when a species is released into a place with no evolutionary history of it.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Bufonidae",
    genus: "Rhinella",
    species: "Rhinella marina",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2009,
    populationTrend: "increasing",
    populationEstimate: "Abundant in its native range; more than 200 million estimated in Australia alone",
    note: "The Least Concern listing is easy to misread. It refers to the species' own risk of extinction, which is nil — it is abundant at home and expanding almost everywhere it has been introduced. The conservation problem attached to the cane toad is not its survival but its effect on native predators in Australia and other introduced ranges, where it is one of the most damaging invasive vertebrates on record.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "10–15 cm",
      min: 10,
      max: 24,
      unit: "cm",
      note: "Snout to vent. Exceptional animals reach about 24 cm, which makes this one of the largest toads in the world.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Usually 400 g–1.3 kg",
      min: 0.4,
      max: 1.3,
      unit: "kg",
      note: "A female found in Conway National Park, Queensland, in January 2023 and nicknamed Toadzilla weighed 2.7 kg — the heaviest ever recorded.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "10–15 years in the wild",
      min: 10,
      max: 15,
      unit: "years",
      note: "One captive animal reached 35.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "8,000–25,000 eggs",
      min: 8000,
      max: 25000,
      unit: "eggs",
      note: "Laid in long paired strings in almost any fresh water, twice a year. Toad eggs and tadpoles are toxic too.",
    },
    {
      key: "invasion-speed",
      label: "Invasion front speed",
      value: "Up to about 60 km per year",
      min: 10,
      max: 60,
      unit: "km/year",
      note: "The front has accelerated roughly fivefold since the 1940s — from around 10–15 km a year to 50–60.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Opportunistic carnivore — insects, small vertebrates, carrion, pet food",
      icon: "Drumstick",
    },
    {
      key: "venom-type",
      label: "Skin toxin",
      value: "Bufotoxin from parotoid glands — a poison, not a venom; present at every life stage",
      icon: "Skull",
    },
    { key: "activity", label: "Activity", value: "Nocturnal — gathers under outdoor lights", icon: "Moon" },
    {
      key: "ecological-role",
      label: "Ecological role",
      value: "Major invasive species outside its native range; harmless component of it at home",
      icon: "AlertTriangle",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater, but tolerates brackish water better than most amphibians",
      icon: "Droplet",
    },
  ],

  highlights: ["length", "venom-type", "invasion-speed", "clutch-size"],

  distribution: {
    continents: ["North America", "South America", "Oceania", "Asia"],
    regions: [
      "Native: southern Texas through Central America to the Amazon basin and south-eastern Peru",
      "Introduced: northern Australia, Papua New Guinea, the Philippines, Fiji, the Caribbean, Bermuda and Florida",
    ],
    habitats: ["Open woodland and grassland", "Farmland and cane fields", "Suburban gardens and roadsides"],
    elevation: "Sea level to about 2,000 m",
    note: "In Australia the toad arrived at Gordonvale in north Queensland in 1935, spread west across the Northern Territory, entered Western Australia in 2009 and continues to advance through the Kimberley. It has also moved south along the Queensland and New South Wales coast. Disturbed and cleared ground suits it far better than intact forest.",
  },

  sections: [
    {
      id: "introduction",
      title: "The beetle it never caught",
      body: [
        "The grey-backed cane beetle, Dermolepida albohirtum, was ruining sugar crops in north Queensland in the 1930s. Cane toads had been moved between sugar-growing regions before — Puerto Rico, Hawaii, the Philippines — with claims of success that were never really tested, and Australia followed the fashion. No study of the toad's likely effect on native wildlife was carried out, and nobody appears to have established whether it would eat the target beetle at all.",
        "It would not, in any practical sense. Adult cane beetles spend their time high on the cane stalks, out of reach of a heavy ground-dwelling toad that cannot climb, and the cane fields themselves offered the toads little of the shelter and moisture they wanted. The toads dispersed into the surrounding country instead.",
        "Objections were raised almost immediately — releases were briefly suspended in late 1935 after protests from naturalists — but were overridden, and by 1937 tens of thousands of young toads had been let go. The beetle problem was eventually solved by insecticides. The toads stayed.",
      ],
    },
    {
      id: "bufotoxin",
      title: "What happens to a predator that eats one",
      body: [
        "The cane toad's defence sits in the parotoid glands, the two prominent swellings on its shoulders, and in glands scattered over the skin. Pressed — by a jaw, typically — they release a creamy secretion containing bufotoxins: cardiac glycosides that interfere with the sodium-potassium pump in heart muscle. A predator that gets a mouthful suffers rapid cardiac arrhythmia, and often dies within minutes.",
        "Australian predators had no history with any of this. The continent has no native bufonid toads, so nothing here had evolved either the physiological resistance or the behavioural caution that South American predators have. Northern quolls, goannas, freshwater crocodiles, blue-tongue skinks and several snakes all suffered severe local declines as the toad front passed through, with losses of more than 90 per cent recorded in some populations. The northern quoll, a cat-sized marsupial predator, was pushed to local extinction in parts of Kakadu.",
        "The toxin is present at every stage. Eggs and tadpoles are toxic, which is why native tadpoles and fish that eat them die, and why a dog that mouths an adult toad is a routine veterinary emergency across northern Australia. Predation by cane toads is a much smaller part of the story than poisoning by them.",
      ],
    },
    {
      id: "evolution",
      title: "Longer legs at the front",
      body: [
        "The most interesting thing about the invasion is that the invader changed as it went. When Rick Shine's group compared toads at the advancing front with toads from long-settled populations, the front-runners had proportionally longer hind legs, moved further per night and travelled in straighter lines.",
        "The mechanism is a form of spatial sorting rather than ordinary natural selection for fitness. Whichever individuals move fastest end up at the leading edge, where they can only breed with other fast movers. Their offspring inherit the tendency, arrive even further ahead, and the process repeats — a ratchet that concentrates dispersal ability at the front generation after generation.",
        "The result is measurable in the invasion history itself. The front advanced at roughly 10 to 15 kilometres a year in the mid-twentieth century; it now moves at 50 to 60, a roughly fivefold acceleration. Evolution is not usually something one can watch happening across a continent within a human lifetime, and the cane toad is the clearest case there is.",
        "There is a cost. Toads at the front develop spinal arthritis at high rates, apparently from the sheer mechanical load of moving that far that fast — the ratchet selects for speed, not for a comfortable old age.",
      ],
    },
    {
      id: "control",
      title: "Living with a toad that cannot be removed",
      body: [
        "There is no realistic prospect of eradicating cane toads from Australia. Hand-collecting works at the scale of a pond or a suburb and not at the scale of a continent, and a species that lays up to 25,000 eggs at a time refills any gap that is left.",
        "The most promising work has therefore shifted from removing toads to changing predators. Conditioned taste aversion training — offering quolls and goannas a small, non-lethal dose of toad, often as a sausage laced with a nausea-inducing chemical — teaches individuals to reject toads before the invasion front reaches them. Trained northern quolls survive at far higher rates, and there is evidence the aversion is passed on socially and genetically to their offspring.",
        "Other efforts target the toad's own biology: traps baited with the male's call, pheromone-based suppression of tadpoles, and exclusion fencing around the desert waterholes the toads need to cross arid country in Western Australia. Some native predators, meanwhile, have adapted on their own — several snake species have evolved smaller heads where toads are present, and some birds have learned to flip a toad over and eat it from the underside, avoiding the glands entirely.",
      ],
    },
  ],

  related: ["american-bullfrog", "common-frog", "golden-poison-frog"],
  tags: ["toad", "invasive species", "australia", "bufotoxin", "least concern", "biological control"],
  searchTerms: [
    "rhinella marina",
    "bufo marinus",
    "giant toad",
    "marine toad",
    "cane toads australia",
  ],

  faqs: [
    {
      q: "Why were cane toads introduced to Australia?",
      a: "To control the grey-backed cane beetle, which was damaging sugar cane in north Queensland. In 1935, 102 toads were brought from Hawaii to Gordonvale near Cairns, bred, and released in their tens of thousands. No assessment of their environmental impact was made beforehand, and nobody had established that they would eat the beetle.",
    },
    {
      q: "Why did cane toads fail to control cane beetles?",
      a: "Adult cane beetles live high on the cane stalks, and cane toads are heavy ground-dwellers that cannot climb. The toads simply could not reach the target. The cane fields also gave them little shelter, so they dispersed into the surrounding countryside and ate whatever else they found.",
    },
    {
      q: "Are cane toads poisonous?",
      a: "Yes. Bufotoxins in the parotoid glands behind the eyes and in the skin disrupt heart function, and can kill a predator within minutes of it taking a mouthful. Eggs and tadpoles are toxic too. They are poisonous, not venomous — there is no bite or sting, and the toxin only matters if it is eaten or absorbed.",
    },
    {
      q: "Which Australian animals have cane toads harmed most?",
      a: "Predators that try to eat them. Northern quolls, goannas, freshwater crocodiles, blue-tongue skinks and several snakes have suffered severe declines as the toad front passed, with losses of more than 90 per cent in some populations. Australia has no native toads, so nothing here had evolved resistance or caution.",
    },
    {
      q: "Have cane toads really evolved longer legs?",
      a: "Yes, and it is well documented. Toads at the advancing invasion front have proportionally longer hind legs, move further each night and travel in straighter lines than toads from long-established populations. The fastest movers end up at the front and breed only with each other, concentrating dispersal ability generation after generation. The front's speed has risen roughly fivefold since the 1940s.",
    },
    {
      q: "If cane toads are so damaging, why are they Least Concern?",
      a: "Because IUCN categories measure a species' own risk of extinction, not the harm it causes. The cane toad is abundant in its native South and Central America and expanding almost everywhere it has been introduced, so it is in no danger at all. The damage it does in Australia is a separate matter that the Red List category is not designed to express.",
    },
  ],

  seo: {
    title: "Cane Toad — Australia's Invasion, Bufotoxin & Evolving Legs",
    description:
      "A researched profile of the cane toad (Rhinella marina): why the 1935 Queensland introduction failed, how bufotoxin kills native predators, and the measured evolution of longer legs at the invasion front.",
    keywords: [
      "cane toad",
      "rhinella marina",
      "cane toads australia",
      "bufotoxin",
      "invasive species australia",
    ],
  },

  sources: [
    {
      label: "Rhinella marina — Red List assessment (2009, e.T41065A10382424)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/41065/10382424",
    },
    {
      label: "Cane toad — species account and Australian distribution",
      publisher: "Australian Museum",
      url: "https://australian.museum/learn/animals/frogs/cane-toad/",
    },
    {
      label: "Invasion and the evolution of speed in toads",
      publisher: "Nature",
      url: "https://www.nature.com/articles/439803a",
    },
    {
      label: "The biological effects, including lethal toxic ingestion, caused by cane toads — key threatening process listing",
      publisher: "Australian Department of Climate Change, Energy, the Environment and Water",
      url: "https://www.dcceew.gov.au/environment/biodiversity/threatened/key-threatening-processes/biological-effects-cane-toads",
    },
    {
      label: "Introduction of cane toads — historical record of the 1935 release",
      publisher: "National Museum of Australia",
      url: "https://www.nma.gov.au/defining-moments/resources/introduction-of-cane-toads",
    },
  ],

  updatedAt: "2026-07-29",
};

export default caneToad;
