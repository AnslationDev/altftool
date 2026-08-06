// Golden eagle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const goldenEagle = {
  slug: "golden-eagle",
  category: "birds",
  name: "Golden Eagle",
  scientificName: "Aquila chrysaetos",
  otherNames: ["Berkut", "Royal eagle"],

  summary:
    "One of the most widely distributed raptors on Earth, a mountain eagle that stoops at up to 320 km/h and has been flown at foxes and hares by Central Asian hunters for centuries.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/015_Wild_Golden_Eagle_in_flight_at_Pfyn-Finges_%28Switzerland%29_Photo_by_Giles_Laurent.jpg/1920px-015_Wild_Golden_Eagle_in_flight_at_Pfyn-Finges_%28Switzerland%29_Photo_by_Giles_Laurent.jpg",
    alt: "A wild golden eagle in flight with wings spread and tail fanned, photographed over the Swiss Alps",
    credit: "Giles Laurent / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Golden_Eagle_%28Aquila_chrysaetos%29_%2813667892725%29.jpg/1920px-Golden_Eagle_%28Aquila_chrysaetos%29_%2813667892725%29.jpg",
      alt: "A golden eagle photographed in Scandinavia, dark brown plumage with the paler golden nape visible",
      credit: "Ron Knight from Seaford, East Sussex, United Kingdom / Wikimedia Commons",
      title: "Where the name comes from",
      caption:
        "Adults are dark brown almost everywhere except the crown and nape, where the feathers are a pale tawny gold. That patch is the single most reliable field mark separating the species from an immature bald eagle.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Golden_Eagle_%28Aquila_chrysaetos%29_%2813667913383%29.jpg/1920px-Golden_Eagle_%28Aquila_chrysaetos%29_%2813667913383%29.jpg",
      alt: "A golden eagle in Scandinavia showing its heavy hooked bill and feathered legs",
      credit: "Ron Knight from Seaford, East Sussex, United Kingdom / Wikimedia Commons",
      title: "A booted eagle",
      caption:
        "Feathers run all the way down the leg to the toes. That trait defines the booted eagles as a group and separates them from sea eagles such as the bald eagle, whose lower legs are bare yellow skin.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Golden_Eagle_%28Aquila_chrysaetos%29_%2813667935303%29.jpg/1920px-Golden_Eagle_%28Aquila_chrysaetos%29_%2813667935303%29.jpg",
      alt: "A golden eagle perched, seen in profile against a Scandinavian background",
      credit: "Ron Knight from Seaford, East Sussex, United Kingdom / Wikimedia Commons",
      title: "Built to carry, not to chase",
      caption:
        "The hind talon is the killing tool: it drives through into the vitals while the front toes hold. A bird this size needs only about 230–250 g of food a day, so a single hare can cover several days.",
    },
  ],

  headline: "The eagle that hunts the open country",
  intro: [
    "The golden eagle is the default large eagle across most of the Northern Hemisphere — Eurasia, North America and parts of North Africa — and one of the most widely distributed birds of prey in the world. It is a bird of open ground: moorland, tundra, steppe, semi-desert and above all mountains, hunting by quartering low along a slope and taking mammals off the ground.",
    "Its reputation rests on two things. The first is the dive: a stoop from height at 240 to 320 km/h, second only to the peregrine among measured birds. The second is a thousand-year relationship with people. Kazakh hunters in western Mongolia still train golden eagles to take foxes and hares in winter, and the bird has been a state emblem from ancient Rome to modern Mexico.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Accipitriformes",
    family: "Accipitridae",
    genus: "Aquila",
    species: "Aquila chrysaetos",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "stable",
    populationEstimate:
      "Published estimates range from roughly 100,000 to 200,000 mature individuals worldwide",
    note: "Least Concern because of an enormous range and a broadly stable global trend, with increases recorded in Europe. The global figure conceals sharp regional problems: populations at the southern edge of the range, in the Sahara, the Sahel, Arabia and the Ethiopian highlands, are small and fragmented. It is listed on CITES Appendix II and protected by federal law in the United States.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "66–102 cm",
      min: 66,
      max: 102,
      unit: "cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "180–234 cm",
      min: 180,
      max: 234,
      unit: "cm",
      note: "Himalayan females have wings nearly 9% longer than the males of the same population",
    },
    {
      key: "weight",
      label: "Weight",
      value: "2.5–6.4 kg",
      min: 2.5,
      max: 6.4,
      unit: "kg",
      note: "Subspecies averages run from about 2.5 kg for small Japanese males to 6.35 kg for large Himalayan females; females are heavier throughout",
    },
    {
      key: "dive-speed",
      label: "Dive (stoop) speed",
      value: "240–320 km/h",
      min: 240,
      max: 320,
      unit: "km/h",
      note: "A shallower gliding attack is put at up to about 190 km/h",
    },
    {
      key: "flight-speed",
      label: "Soaring speed",
      value: "45–52 km/h",
      min: 45,
      max: 52,
      unit: "km/h",
    },
    {
      key: "territory-size",
      label: "Territory size",
      value: "Roughly 20–200 km² per pair",
      note: "Set mainly by prey density and how open the terrain is; a pair maintains several alternate nests inside it",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1–4 eggs, usually 2",
      min: 1,
      max: 4,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "41–45 days",
      min: 41,
      max: 45,
      unit: "days",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–5 years",
      min: 4,
      max: 5,
      unit: "years",
      note: "Juveniles wander widely before settling on a territory",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Longest wild record 32 years",
      note: "A Swedish bird ringed as a nestling was recovered 32 years later; the North American longevity record is 31 years and 8 months. A captive bird in Europe reached 46.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — rabbits, hares, marmots and ground squirrels", icon: "Rabbit" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "Stick eyrie on a cliff ledge or in a tall tree, reused for years", icon: "Mountain" },
    { key: "social-structure", label: "Social structure", value: "Territorial monogamous pairs", icon: "Users" },
    { key: "migration", label: "Movement", value: "Resident in the south, migratory in the far north", icon: "Navigation" },
  ],

  highlights: ["dive-speed", "wingspan", "weight", "territory-size"],

  distribution: {
    continents: ["Africa", "Asia", "Europe", "North America"],
    regions: [
      "Western North America",
      "Scotland and the Alps",
      "Scandinavia",
      "Central Asia and the Himalaya",
      "North Africa",
    ],
    habitats: [
      "Mountains",
      "Moorland",
      "Tundra",
      "Steppe grassland",
      "Semi-desert",
    ],
    elevation: "Sea level to high mountain plateaus",
    note: "Holarctic. In North America it is overwhelmingly a bird of the west, where immature bald eagles are the species most often mistaken for it. In Europe it survives mainly where people are thin on the ground — the Highlands, the Alps, the Carpathians, Iberia and Scandinavia — having been driven out of most lowland country centuries ago.",
  },

  sections: [
    {
      id: "hunting",
      title: "How a golden eagle hunts",
      body: [
        "Most hunting is done low and fast rather than from a great height. The eagle contours a hillside, using the ground and the wind to stay hidden until the last moment, then takes prey off the surface. The classic vertical stoop, at 240 to 320 km/h, is used when a bird has height to spend and something worth spending it on.",
        "The diet is dominated by medium-sized mammals: rabbits, hares, marmots, ground squirrels and prairie dogs, with gamebirds and other medium-sized birds next. Reptiles and fish appear in small numbers. A fully grown golden eagle needs roughly 230 to 250 g of food a day, so a single hare covers several days and a large carcass can be worked for longer still.",
        "The upper end of what golden eagles take is genuinely wide — young ungulates, seals, coyotes, badgers, cranes, geese and even other raptors have all been recorded — but these are exceptional events rather than routine, and much of the species' fearsome reputation with livestock owners rests on them.",
      ],
    },
    {
      id: "territory",
      title: "Territory and the eyrie",
      body: [
        "A pair holds a large territory, commonly somewhere between 20 and 200 km² depending on how much prey the ground supports and how open it is. Both birds defend it, and the pair typically maintains several alternate nests within it, switching between them across seasons.",
        "The nest, or eyrie, is a stick platform on a cliff ledge or in a tall tree, added to year after year until it becomes a substantial structure. One to four eggs are laid, most often two, and incubation runs 41 to 45 days.",
        "Young birds do not breed for four or five years. They spend that time wandering — sometimes across hundreds of kilometres — before finding and holding ground of their own, which is why floating immatures turn up well outside the settled breeding range.",
      ],
    },
    {
      id: "falconry",
      title: "A thousand years of eagle hunting",
      body: [
        "In Bayan-Ölgii, the far western province of Mongolia, Kazakh berkutchi still hunt with golden eagles. A bird is taken young, flown at foxes and hares across the winter steppe, and in the traditional practice released back to the wild after some years of service so that it can breed.",
        "The eagle is by a wide margin the heaviest bird flown in any falconry tradition, and the relationship is correspondingly asymmetric: the hunter works around the bird's condition, weight and mood rather than the reverse. The tradition is old — comparable practices are recorded across Central Asia for around a thousand years — and it survives today as much through annual festivals and tourism as through subsistence hunting.",
        "Elsewhere the golden eagle has been a symbol rather than a working bird. It carried Roman legions as the aquila, and it appears on the coat of arms of Mexico and on the flags and emblems of several other states.",
      ],
    },
    {
      id: "threats",
      title: "Why a Least Concern bird still needs protecting",
      body: [
        "Assessed globally, the golden eagle is secure: the range is vast, the total population runs into six figures, and European numbers have been rising. That is why the IUCN listed it as Least Concern in its 2021 assessment.",
        "The pressures are local rather than global. Lead fragments in shot carcasses poison scavenging eagles, collisions with power lines and wind turbines kill birds in open landscapes that are also good for generation, illegal poisoning and shooting persist where raptors are blamed for livestock losses, and habitat conversion removes the open ground the species hunts over.",
        "At the southern margins of the range — the Sahara, the Sahel, the Arabian Peninsula and the Afro-alpine systems of Ethiopia — populations are small, isolated and living in hyper-arid conditions. A global Least Concern listing says nothing useful about those birds, which is a general limitation of range-wide assessments for very widespread species.",
      ],
    },
  ],

  related: ["bald-eagle", "peregrine-falcon", "andean-condor", "barn-owl"],
  tags: ["raptor", "bird of prey", "mountains", "falconry", "holarctic"],
  searchTerms: ["eagle", "aquila", "berkut", "eagle hunter", "booted eagle"],

  faqs: [
    {
      q: "How fast can a golden eagle dive?",
      a: "Between about 240 and 320 km/h in a full stoop, which makes it one of the fastest birds in the world after the peregrine falcon. A shallower gliding attack is put at up to roughly 190 km/h, and ordinary soaring flight is far slower, around 45 to 52 km/h.",
    },
    {
      q: "What is the difference between a golden eagle and a bald eagle?",
      a: "An adult bald eagle has a white head and tail and bare yellow legs; a golden eagle is dark brown all over with a tawny-gold crown and nape, and its legs are feathered right down to the toes. The confusion is with young bald eagles, which are mottled brown and white and lack the white head for four or five years. Golden eagles also hunt mammals over open country, while bald eagles stay near water and eat mostly fish.",
    },
    {
      q: "Are golden eagles endangered?",
      a: "No. The IUCN assessed the species as Least Concern in 2021, with a stable global trend and estimates ranging from roughly 100,000 to 200,000 mature individuals. That global picture hides real regional trouble — the populations of the Sahara, the Sahel, Arabia and the Ethiopian highlands are small and fragmented — and lead poisoning, collisions and illegal killing remain significant local threats.",
    },
    {
      q: "What do golden eagles eat?",
      a: "Mainly medium-sized mammals: rabbits, hares, marmots, ground squirrels and prairie dogs, plus gamebirds and other medium-sized birds, with reptiles and fish in small numbers. An adult needs about 230 to 250 g of food a day. Larger prey such as young ungulates, seals and coyotes has been recorded, but it is exceptional rather than typical.",
    },
    {
      q: "Can a golden eagle carry off a person or a large animal?",
      a: "No. An adult weighs at most around 6.4 kg and cannot lift anything close to its own weight in flight, so carrying off a child or a lamb-sized animal is not physically possible. Large prey is killed and eaten where it falls, or carried away in pieces.",
    },
    {
      q: "How long do golden eagles live?",
      a: "The longest verified wild record is a Swedish bird ringed as a nestling and recovered 32 years later, with a North American record of 31 years and 8 months. A captive European bird reached 46. As with most large raptors, mortality is concentrated in the first year of life.",
    },
  ],

  seo: {
    title: "Golden Eagle — Size, Speed, Hunting & Range",
    description:
      "A researched profile of the golden eagle (Aquila chrysaetos): a 2.3 m wingspan, a 320 km/h stoop, huge mountain territories, and the Kazakh eagle-hunting tradition.",
    keywords: [
      "golden eagle facts",
      "aquila chrysaetos",
      "golden eagle wingspan",
      "golden eagle vs bald eagle",
      "eagle hunting mongolia",
    ],
  },

  sources: [
    {
      label: "Aquila chrysaetos — Red List assessment (2021)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22696060/202078899",
    },
    {
      label: "Golden Eagle species factsheet",
      publisher: "BirdLife International DataZone",
      url: "https://datazone.birdlife.org/species/factsheet/golden-eagle-aquila-chrysaetos",
    },
    {
      label: "Golden Eagle — Conservation and Management",
      publisher: "Cornell Lab of Ornithology, Birds of the World",
      url: "https://birdsoftheworld.org/bow/species/goleag/cur/conservation",
    },
    {
      label: "Status and conservation of the golden eagle",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Status_and_conservation_of_the_golden_eagle",
    },
  ],

  updatedAt: "2026-07-29",
};

export default goldenEagle;
