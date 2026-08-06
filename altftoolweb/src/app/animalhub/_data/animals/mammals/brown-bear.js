// Brown bear — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const brownBear = {
  slug: "brown-bear",
  category: "mammals",
  name: "Brown Bear",
  scientificName: "Ursus arctos",
  otherNames: ["Grizzly bear", "Kodiak bear", "Eurasian brown bear"],

  summary:
    "A giant omnivore that gets most of its calories from plants, ranges across three continents, and — unusually for a large carnivore — is in no immediate danger of extinction.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/2010-kodiak-bear-1.jpg/1920px-2010-kodiak-bear-1.jpg",
    alt: "A Kodiak brown bear standing in vegetation in Kodiak National Wildlife Refuge, Alaska",
    credit: "Yathin S Krishnappa / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Peninsular_Grizzly_Bear_%28Ursus_arctos_gyas%29_-_Flickr_-_Gregory_%22Slobirdr%22_Smith.jpg/1920px-Peninsular_Grizzly_Bear_%28Ursus_arctos_gyas%29_-_Flickr_-_Gregory_%22Slobirdr%22_Smith.jpg",
      alt: "A female brown bear standing in a river with a partly eaten salmon, Lake Clark National Park, Alaska",
      credit: "Gregory \"Slobirdr\" Smith / Wikimedia Commons",
      title: "Six weeks that set the year",
      caption:
        "Coastal bears build most of their winter fat during the salmon run. A late or failed run does not just mean a thin autumn — it can determine whether a female produces cubs at all.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/7f/A_brown_bear_catches_salmon_%28d6f628b5-1dd8-b71b-0b91-9a729f3f2f63%29.jpg",
      alt: "A brown bear catching a salmon in shallow water",
      credit: "NPS photo / Wikimedia Commons",
      title: "Learned, not instinctive",
      caption:
        "Fishing technique varies from river to river and is passed from mother to cub — some bears snorkel, some pin fish against the bed, some wait below a falls. Cubs that never learn a local method feed poorly for years.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/12/A_brown_bear_cub_stands_up_to_take_a_better_look_%28d5564422-1dd8-b71b-0b46-d12c40f61c0e%29.jpg",
      alt: "A brown bear cub standing on its hind legs, looking toward the camera",
      credit: "NPS photo / Wikimedia Commons",
      title: "Standing to see, not to threaten",
      caption:
        "Bears rear up to widen their field of view and catch scent on the wind. It reads as aggression to people, but a standing bear is gathering information, not preparing to charge.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a0/A_brown_bear_looks_up_toward_the_camera._%2865d20bf2-1dd8-b71b-0b47-53b443eaa69d%29.jpg",
      alt: "A brown bear looking upward toward the camera, showing its dished facial profile and shoulder hump",
      credit: "NPS photo / Wikimedia Commons",
      title: "The digging shoulder",
      caption:
        "The muscular hump above the shoulders drives the forelimbs, and with claws up to ten centimetres along the curve it turns the bear into an excavator — for roots, ground squirrels and its own winter den.",
    },
  ],

  headline: "A carnivore that lives mostly on plants",
  intro: [
    "The brown bear is one of the largest land carnivores alive, and it spends most of its life eating vegetation. Up to 90% of the diet, by energy, can be plant matter — grasses, sedges, roots, berries, pine nuts. The famous salmon-catching of coastal Alaska is a seasonal windfall, not the norm across the species.",
    "It is also the widest-ranging bear, found from Spain to Kamchatka and across western North America, in perhaps 200,000 individuals. That abundance is why a two-metre predator with a ten-centimetre claw is listed as Least Concern — a status that says nothing about the isolated European and Asian populations, some of which number in the dozens.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Ursidae",
    genus: "Ursus",
    species: "Ursus arctos",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2017,
    populationTrend: "stable",
    populationEstimate: "Approximately 200,000 worldwide",
    note: "Least Concern is a genuine assessment, not an oversight: the global population is large and the overall trend stable, with roughly 130,000 in Russia, around 33,000 in the United States and 25,000 in Canada. The qualifier is fragmentation. Europe's 14,000-odd bears are split across about ten separate populations, several of which are small enough to be at real risk, and southern Asian populations — the Himalayan, Gobi and Syrian brown bears — are in poor shape. The Atlas bear of North Africa is extinct.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.0–2.8 m",
      min: 1.0,
      max: 2.8,
      unit: "m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "Around 1.0–1.5 m",
      min: 1.0,
      max: 1.5,
      unit: "m",
      note: "Measured on all fours; a large Kodiak reared on its hind legs stands roughly three metres",
    },
    {
      key: "weight",
      label: "Weight",
      value: "80–600 kg",
      min: 80,
      max: 600,
      unit: "kg",
      note: "Males average around 217 kg and females 152 kg across the species, but coastal populations weigh about twice as much as interior ones, and the largest Kodiak and peninsular bears have exceeded 680 kg in autumn",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "48–64 km/h in short bursts",
      min: 48,
      max: 64,
      unit: "km/h",
      note: "Fast enough to outrun a horse over a short distance, uphill or down — which is why running from a bear is universally advised against",
    },
    {
      key: "claw-length",
      label: "Front claw length",
      value: "5–10 cm",
      min: 5,
      max: 10,
      unit: "cm",
      note: "5–6 cm measured straight, up to 10 cm along the curve. Blunt and non-retractile — digging tools rather than weapons",
    },
    {
      key: "denning-duration",
      label: "Winter denning",
      value: "5–8 months",
      min: 5,
      max: 8,
      unit: "months",
      note: "Longest in the far north; bears in southern Europe may barely den at all in a mild year",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 180–270 days including delayed implantation",
      min: 180,
      max: 270,
      unit: "days",
      note: "The fertilised egg does not implant until the female enters her winter den, and only then if she has built enough fat. Actual foetal development takes about eight weeks",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1–3 cubs",
      min: 1,
      max: 4,
      unit: "cubs",
      note: "Twins are the commonest outcome; litters of four occur and six has been recorded. Cubs are born in the den weighing only 350–510 g",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–8 years (females); about a year later in males",
      min: 4,
      max: 9,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "20–25 years in the wild",
      min: 15,
      max: 25,
      unit: "years",
      note: "The oldest wild bears documented in Alaska were a 39-year-old female and a 38-year-old male",
    },
    {
      key: "territory-size",
      label: "Home range",
      value: "24–8,000 km²",
      min: 24,
      max: 8171,
      unit: "km²",
      note: "Follows food density. Coastal Alaskan females may need only 24 km²; males in the central Canadian Arctic have ranged over 8,000",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore — up to 90% of dietary energy from plants", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Solitary, except females with cubs and salmon-run gatherings", icon: "User" },
    { key: "activity", label: "Activity", value: "Mainly crepuscular; more nocturnal where people are present", icon: "Sunrise" },
    { key: "hibernation", label: "Winter dormancy", value: "Not a deep hibernator — bears rouse easily from the den", icon: "Snowflake" },
    { key: "ecological-role", label: "Ecological role", value: "Carries marine nutrients inland; disperses seeds and turns soil", icon: "Network" },
  ],

  highlights: ["weight", "top-speed", "diet-type", "denning-duration"],

  distribution: {
    continents: ["Asia", "Europe", "North America"],
    regions: [
      "Russia, from the Urals to Kamchatka",
      "Alaska and western Canada",
      "Rocky Mountains, United States",
      "Scandinavia and Finland",
      "Carpathians and the Balkans",
      "Cantabrian Mountains and Pyrenees",
      "Turkey, the Caucasus and Central Asia",
      "Hokkaido, Japan",
    ],
    habitats: [
      "Boreal and temperate forest",
      "Alpine meadow and tundra",
      "Coastal river valleys",
      "Dry steppe and semi-desert",
    ],
    elevation: "Sea level to above 5,000 m in the Himalaya and Tibetan Plateau",
    note: "The most widely distributed bear on earth, but the distribution is now two very different things: a near-continuous belt across Russia, Alaska and western Canada, and a scatter of small, isolated remnants in Europe and southern Asia. Romania holds Europe's largest population outside Russia; Spain's Cantabrian bears, once down to fewer than a hundred animals, have grown back to over 300.",
  },

  sections: [
    {
      id: "diet",
      title: "What a brown bear actually eats",
      body: [
        "The brown bear is classified as a carnivore on anatomy and ancestry, but the diet is dominated by plants. Across most of the range, grasses and sedges in spring, forbs and roots in summer, and berries and nuts in autumn supply the bulk of the calories — up to 90% of dietary energy in many populations.",
        "Animal food is taken where it is abundant and cheap to get: insects, ground squirrels, carrion, and the calves of ungulates in the few weeks after they are born. Predation on adult deer, elk or moose happens but is not the norm.",
        "The exception that shapes public perception is the salmon coast. On Alaskan and Kamchatkan rivers, spawning runs deliver an enormous, brief pulse of fat and protein, and the bears that exploit it grow to roughly twice the mass of interior bears eating the same species' plant diet. Coastal Alaskan bears are the largest brown bears in the world for that reason alone.",
      ],
    },
    {
      id: "denning",
      title: "The winter den",
      body: [
        "Brown bears spend five to eight months of the year in a den, depending on latitude — longest in the Arctic, sometimes barely at all in southern Europe. They dig it themselves, usually on a slope where snow will accumulate and insulate, and they do not eat, drink, urinate or defecate for the whole period.",
        "This is not the deep hibernation of a ground squirrel. Body temperature falls only a few degrees rather than to near-freezing, and a denning bear can be roused and will defend itself. The trade-off is efficiency: the bear keeps enough physiological function to give birth and nurse in mid-winter, which a true hibernator could not.",
        "Bears also recycle their own waste products through the winter and emerge with muscle and bone mass largely intact, despite months of complete inactivity — a piece of physiology that has attracted sustained interest from researchers working on osteoporosis and kidney failure.",
      ],
    },
    {
      id: "cubs",
      title: "Delayed implantation and cubs",
      body: [
        "Brown bears mate in late spring, but the fertilised egg then stops developing. It floats free in the uterus until autumn, and implants only when the female enters her den — and only if she has laid down enough fat. A poor berry or salmon year ends the pregnancy before it properly starts.",
        "If implantation happens, the cubs develop in about eight weeks and are born in the den in January or February, blind, nearly hairless, and weighing 350 to 510 grams — smaller relative to their mother than the newborn of almost any other placental mammal. She nurses them while still fasting herself.",
        "Cubs stay with the mother for two to three years, learning what is edible, where and when. Fishing technique in particular is local and learned rather than instinctive. During that period the female does not breed, which sets the species' reproductive rate: a female may raise only four or five litters in her life.",
      ],
    },
    {
      id: "people",
      title: "Bears and people",
      body: [
        "Brown bears have been eliminated from most of western and central Europe, from Mexico, and from the great majority of the contiguous United States, where a population once estimated at 50,000 grizzlies fell to a few hundred by the 1970s. Persecution, not habitat loss, did most of that.",
        "Attacks on people are rare, and the pattern is well documented: most serious incidents involve a surprised female with cubs, or a bear defending a carcass. Predatory attacks are very unusual. Carrying bear spray, travelling in groups and making noise in dense cover reduce the risk substantially, and running is the one response that reliably makes things worse.",
        "The recurring management problem is food. A bear that learns to associate people with rubbish, livestock feed or unsecured camp supplies becomes progressively bolder and is eventually killed. The phrase used across North American park services — a fed bear is a dead bear — is a compressed statement of the entire conflict-management problem.",
      ],
    },
    {
      id: "recovery",
      title: "Recovery and fragmentation",
      body: [
        "Several populations have recovered strongly. Grizzlies in the Greater Yellowstone Ecosystem grew from roughly 136 animals in 1975 to over 700, and Scandinavia, Slovenia, Romania and Spain's Cantabrian range have all seen sustained increases. Legal protection and the end of bounty systems account for most of it.",
        "The pressure that remains is connectivity. Isolated populations of a few dozen bears — in the Pyrenees, the Italian Apennines, the Gobi — carry very little genetic diversity and cannot absorb losses. Roads and settlement between blocks of habitat prevent the exchange that would fix that, which is why corridor work matters more for this species than absolute numbers do.",
        "Where bears return to landscapes that lost them generations ago, the social problem arrives with them. Livestock compensation, electric fencing and bear-proof waste infrastructure are the practical currency of coexistence, and their absence is what turns recovery into backlash.",
      ],
    },
  ],

  related: ["polar-bear", "giant-panda", "gray-wolf"],
  tags: ["bear", "omnivore", "north america", "europe", "asia", "least concern", "forest"],
  searchTerms: ["ursus arctos", "grizzly bear", "kodiak bear", "grizzly vs polar bear", "bear hibernation"],

  faqs: [
    {
      q: "What is the difference between a brown bear and a grizzly bear?",
      a: "There is none at species level — a grizzly is a brown bear. In North American usage, 'grizzly' generally means an inland brown bear and 'brown bear' a coastal one, and the distinction is real in practice because coastal bears with access to salmon grow to roughly twice the weight of inland animals eating the same species' plant diet.",
    },
    {
      q: "Do brown bears really hibernate?",
      a: "They den for five to eight months without eating or drinking, but it is not deep hibernation. Body temperature falls only a few degrees rather than close to freezing, and a denning bear can wake and defend itself. That shallower state is what allows a female to give birth and nurse cubs in mid-winter.",
    },
    {
      q: "How fast can a brown bear run?",
      a: "Up to about 64 km/h in short bursts, according to the Alaska Department of Fish and Game — faster than a horse over a short distance, and just as fast downhill as up. This is the reason every bear-safety guideline says not to run.",
    },
    {
      q: "Why is the brown bear listed as Least Concern?",
      a: "Because there are roughly 200,000 of them and the global trend is stable, with large secure populations in Russia, Alaska and Canada. The listing is about global extinction risk, not local security — Europe's bears are split across around ten fragmented populations, several small enough to be genuinely threatened, and the North African subspecies is extinct.",
    },
    {
      q: "What do brown bears eat?",
      a: "Mostly plants. Up to 90% of their dietary energy can come from grasses, sedges, roots, berries and nuts, supplemented with insects, ground squirrels, carrion and newborn ungulates. Salmon matters enormously but only on particular coastal rivers, for a few weeks a year.",
    },
  ],

  seo: {
    title: "Brown Bear — Size, Diet, Hibernation & Conservation Status",
    description:
      "A researched profile of the brown bear (Ursus arctos): why a giant carnivore lives mostly on plants, how winter denning and delayed implantation work, grizzly versus coastal size, and its Least Concern listing.",
    keywords: [
      "brown bear facts",
      "ursus arctos",
      "grizzly bear",
      "do bears hibernate",
      "kodiak bear size",
    ],
  },

  sources: [
    {
      label: "Ursus arctos — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/41688/121229971",
    },
    {
      label: "Brown bear species profile",
      publisher: "US National Park Service",
      url: "https://www.nps.gov/subjects/bears/brown-bears.htm",
    },
    {
      label: "Brown bear species profile",
      publisher: "Alaska Department of Fish and Game",
      url: "https://www.adfg.alaska.gov/index.cfm?adfg=brownbear.main",
    },
    {
      label: "Bear research and conservation",
      publisher: "International Association for Bear Research and Management",
      url: "https://bearbiology.org/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default brownBear;
