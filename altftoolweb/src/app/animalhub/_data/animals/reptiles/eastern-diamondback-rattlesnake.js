// Eastern diamondback rattlesnake — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const easternDiamondbackRattlesnake = {
  slug: "eastern-diamondback-rattlesnake",
  category: "reptiles",
  name: "Eastern Diamondback Rattlesnake",
  scientificName: "Crotalus adamanteus",
  otherNames: ["Eastern diamond-backed rattlesnake", "Diamondback"],

  summary:
    "The largest rattlesnake in the world and the heaviest venomous snake in the Americas, tied to a longleaf pine savanna that has largely been cut down around it.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Adult_Crotalus_adamanteus.jpg/1920px-Adult_Crotalus_adamanteus.jpg",
    alt: "An adult eastern diamondback rattlesnake coiled, its diamond dorsal pattern visible",
    credit: "Caudatejake / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Eastern_Diamond-backed_Rattlesnake._Crotalus_adamenteus_-_Flickr_-_gailhampshire.jpg/1920px-Eastern_Diamond-backed_Rattlesnake._Crotalus_adamenteus_-_Flickr_-_gailhampshire.jpg",
      alt: "An eastern diamondback rattlesnake with head raised, showing the diamond-shaped dorsal blotches",
      credit: "gailhampshire from Cradley, Malvern, U.K / Wikimedia Commons",
      title: "The pattern that names it",
      caption:
        "Each dark diamond is outlined in cream and set against brown or olive. Against pine litter and wiregrass it works as disruptive camouflage, which is why the species relies on staying still and is usually stepped over rather than seen.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/50/Eastern_Diamondback_Rattlesnake_%286155290317%29.jpg",
      alt: "An eastern diamondback rattlesnake swimming at the surface of a lake in the Everglades",
      credit: "Everglades NPS from Homestead, Florida, United States / Wikimedia Commons",
      title: "A strong swimmer",
      caption:
        "Diamondbacks swim readily and have been recorded crossing open water to barrier islands and keys. Coastal populations move between islands this way, which is part of why the species occupies dune and hammock habitat as well as pine flatwoods.",
    },
  ],

  headline: "The largest rattlesnake, and a longleaf pine specialist",
  intro: [
    "Crotalus adamanteus is the largest rattlesnake species and the heaviest venomous snake in the Americas. Typical adults run between about 0.9 and 1.8 m; animals over 2.1 m are rare but well documented, and the heaviest on record — a snake shot in 1946 measuring 2.4 m — weighed 15.4 kg. Lengths above that circulate widely and are not backed by voucher specimens.",
    "It is a pit viper, an ambush hunter that lies motionless along a mammal runway and waits. What makes it a conservation problem is not the venom but the habitat: it is a specialist of the longleaf pine savanna of the south-eastern United States, an ecosystem now reduced to a small fraction of what it was. Its Red List assessment dates from 2007 and is badly overdue for revision.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Viperidae",
    genus: "Crotalus",
    species: "Crotalus adamanteus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2007,
    populationTrend: "decreasing",
    populationEstimate: "No global estimate; severe declines documented across most of the range",
    note: "The Least Concern listing dates from 2007 and is long overdue for reassessment — it predates most of the work documenting the species' contraction. The Florida Museum of Natural History and the Savannah River Ecology Laboratory both describe severe declines, and the snake is now rare or absent across much of its former range. It was petitioned for listing under the US Endangered Species Act in 2011; the Fish and Wildlife Service found in 2012 that listing may be warranted and a Species Status Assessment has been under way since, with no final decision. North Carolina lists it as endangered at state level.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "0.9–1.8 m typically; over 2.1 m is rare",
      min: 0.9,
      max: 2.4,
      unit: "m",
      note: "The largest reliably documented animal measured 2.4 m. Reported maxima of 2.5 m and above lack voucher specimens — a standing cash reward for an eight-foot snake, raised to $200 in the 1950s, was never claimed",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Around 2.3 kg on average",
      min: 0.8,
      max: 6.7,
      unit: "kg",
      note: "Nine laboratory-held snakes averaged 2.55 kg across a range of 0.8–4.9 kg. Few exceed about 5.1 kg; the 2.4 m specimen shot in 1946 weighed 15.4 kg and is the outlier that defines the record",
    },
    {
      key: "venom-yield",
      label: "Venom yield per bite",
      value: "Several hundred mg dry weight; reported maxima approach 1,000 mg",
      min: 400,
      max: 1000,
      unit: "mg",
      note: "Among the highest yields of any rattlesnake. Yield scales strongly with body size, and a defensive bite typically delivers far less than the glands hold — some deliver almost nothing at all",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "7–25 live young",
      min: 7,
      max: 29,
      unit: "young",
      note: "Born rather than hatched, from late July to early October. Neonates are already 30–36 cm long and fully venomous",
    },
    {
      key: "breeding-interval",
      label: "Breeding interval",
      value: "Once every two to four years",
      min: 2,
      max: 4,
      unit: "years",
      note: "A low reproductive rate for a snake, and the reason local populations recover so slowly once they are knocked down",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "20 years or more",
      min: 15,
      max: 22,
      unit: "years",
      note: "Wild longevity is hard to establish; the figure comes largely from captive animals",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — rabbits, cotton rats, mice, squirrels and birds", icon: "Drumstick" },
    { key: "venom-type", label: "Venom", value: "Primarily haemotoxic, with a myotoxin; destroys tissue and disrupts clotting", icon: "Droplet" },
    { key: "heat-sensing", label: "Heat sensing", value: "Loreal pits between eye and nostril — a genuine infrared sense that lets it strike accurately in the dark", icon: "Thermometer" },
    { key: "rattle", label: "Rattle", value: "Interlocking keratin segments; one new segment is added at each skin shed, so the count is not an age", icon: "Bell" },
    { key: "activity", label: "Activity", value: "Diurnal in cool weather, nocturnal in summer heat", icon: "Sun" },
    { key: "shedding-frequency", label: "Shedding", value: "Several times a year, more often in fast-growing young; each shed adds a rattle segment", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Principal predator of small mammals in longleaf pine savanna; a shelter commensal of gopher tortoise burrows", icon: "Globe" },
  ],

  highlights: ["length", "weight", "venom-yield", "heat-sensing"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Florida",
      "Southern Georgia",
      "Coastal Alabama and Mississippi",
      "Coastal South Carolina",
      "South-eastern North Carolina",
      "Eastern Louisiana",
    ],
    habitats: [
      "Longleaf pine flatwoods",
      "Sandhills and turkey oak",
      "Sand pine scrub",
      "Coastal dunes and barrier islands",
      "Palmetto and wiregrass communities",
    ],
    elevation: "Coastal plain — sea level to a few hundred metres",
    note: "Effectively confined to the south-eastern coastal plain, with Florida holding around half the species' current range. It is closely associated with gopher tortoise burrows, which it uses for shelter and overwintering — an association that makes it vulnerable to anything done to the tortoise. It has contracted sharply at the northern and western edges of its range.",
  },

  sections: [
    {
      id: "size",
      title: "How big it actually gets",
      body: [
        "This is the largest rattlesnake in the world and the heaviest venomous snake in the Americas, and it does not need exaggerating. Typical adults are 0.9 to 1.8 m long; one study of 31 males and 43 females found an average of about 1.7 m. Snakes over 2.1 m are genuinely rare, though well documented.",
        "Above that the record becomes unreliable. Maximum lengths of 2.4 m and 2.5 m are widely quoted, but the larger figures have been questioned for lack of voucher specimens — skins stretch, and an eight-foot skin can be taken from a six-foot snake. The naturalist E. Ross Allen offered a standing reward, eventually $200, for a genuine eight-foot animal dead or alive. Nobody ever collected it.",
        "The one figure that does hold up is mass. A snake shot in 1946 measured 2.4 m and weighed 15.4 kg, which is why the species outranks the longer, more slender king cobra by weight. Ordinary adults are far lighter — around 2.3 kg is typical. Unusually among snakes, males grow larger than females.",
      ],
    },
    {
      id: "hunting",
      title: "Pits, fangs and the ambush",
      body: [
        "As a pit viper, the eastern diamondback has a loreal pit on each side of its head, between the nostril and the eye. These are infrared receptors sensitive enough to build a crude thermal image of a warm-blooded animal, which is what lets the snake strike accurately at a rat in complete darkness. Cobras and mambas have nothing equivalent.",
        "The hunting method is patience. The snake finds a mammal runway by scent, coils beside it and stays there, sometimes for days. The strike is a fraction of a second: hinged fangs swing forward, inject venom, and the snake releases immediately rather than holding on. It then waits, follows the scent trail of the dying animal, and swallows it head-first.",
        "The fangs are large in proportion — around 17 mm in a 1.5 m snake — and the venom is primarily haemotoxic, breaking down tissue and disrupting the blood's ability to clot, with a myotoxin that damages muscle. Venom yield is among the highest of any rattlesnake, though what is actually delivered in any one bite varies enormously.",
      ],
    },
    {
      id: "danger",
      title: "The real risk to people",
      body: [
        "The eastern diamondback is the most dangerous snake in North America, and that statement needs the numbers around it to mean anything. The United States records roughly 7,000 to 8,000 venomous snakebites a year from all species combined, and about five to ten deaths. Rattlesnakes account for the great majority of both.",
        "An untreated bite from this species is serious — figures in the range of ten to twenty per cent mortality are commonly cited for untreated cases. With prompt hospital care and antivenom, death is rare; poison-centre data across two and a half decades put the case fatality rate for rattlesnake bites at roughly one in seven hundred patients. Serious tissue damage and long recoveries are much more common outcomes than death.",
        "Most bites happen when a snake is deliberately handled or accidentally trodden on. The animal's first strategy is not to be found: it relies on camouflage and stillness, and often does not rattle at all. Where it does rattle, the sound is a warning being given rather than an attack being launched.",
      ],
    },
    {
      id: "longleaf",
      title: "A snake and its ecosystem",
      body: [
        "The eastern diamondback is a longleaf pine specialist. That savanna — open pine canopy over wiregrass, maintained by frequent low-intensity fire — once covered much of the south-eastern coastal plain and has been reduced to a small fraction of its former extent by logging, conversion to plantation and agriculture, and the suppression of fire.",
        "Within it, the snake depends heavily on gopher tortoise burrows for shelter and for overwintering, alongside dozens of other species that use the same refuges. That dependence turned into a specific threat: the practice of pumping gasoline into burrows to drive snakes out for rattlesnake roundups poisons the burrow and everything in it, and has been banned in several states as a result.",
        "Direct killing remains significant. Snakes are shot on sight, taken for roundups, and collected for the skin trade, where estimates of the annual toll run into the tens of thousands.",
      ],
    },
    {
      id: "status",
      title: "An assessment that has not kept up",
      body: [
        "The species' Red List category is Least Concern, assessed in 2007. Almost two decades of subsequent work — state surveys, the Florida Museum of Natural History's account, the Savannah River Ecology Laboratory's account — describes severe declines and a contracting range, with the snake now rare or absent across large parts of the south-east.",
        "The regulatory picture is different from the Red List one. A petition to list the species as Threatened under the US Endangered Species Act was filed in 2011; the Fish and Wildlife Service found in 2012 that listing may be warranted, and a Species Status Assessment has been in progress since, with no final determination. North Carolina already lists it as endangered under state law.",
        "The obstacles to recovery are structural rather than legal. The snake needs a fire-maintained pine savanna that mostly no longer exists, breeds only once every two to four years, and is killed on sight by a large share of the people who encounter it.",
      ],
    },
  ],

  related: ["gila-monster", "boa-constrictor", "king-cobra"],
  tags: ["snake", "venomous", "pit viper", "north america", "reptile", "declining"],
  searchTerms: ["crotalus adamanteus", "diamondback rattler", "largest rattlesnake", "florida rattlesnake"],

  faqs: [
    {
      q: "How big does an eastern diamondback rattlesnake get?",
      a: "Most adults are 0.9 to 1.8 m long, with an average of about 1.7 m in one sample of 74 snakes. Animals over 2.1 m are rare but well documented, and the largest reliable record is 2.4 m. Longer figures circulate but lack voucher specimens. The heaviest known individual, a 2.4 m snake shot in 1946, weighed 15.4 kg — which makes this the heaviest venomous snake in the Americas.",
    },
    {
      q: "How dangerous is an eastern diamondback bite?",
      a: "It is the most dangerous snakebite in North America, but the risk in absolute terms is small. The United States sees roughly 7,000 to 8,000 venomous bites a year from all species and about five to ten deaths. Untreated, this species' bite is often cited at ten to twenty per cent mortality; with prompt antivenom and hospital care, death is rare, though severe tissue damage and long recoveries are common.",
    },
    {
      q: "Can you tell a rattlesnake's age from its rattle?",
      a: "No. A new segment is added each time the snake sheds its skin, and a snake sheds several times a year — more often when young and growing fast. Segments also break off. The rattle records sheds, not years.",
    },
    {
      q: "Do eastern diamondbacks have heat-sensing pits?",
      a: "Yes. As a pit viper it has a loreal pit on each side of the head, between the nostril and the eye. These infrared receptors are sensitive enough to locate a warm-blooded animal in complete darkness, which is how the snake strikes accurately at night.",
    },
    {
      q: "Why is a Least Concern snake considered threatened?",
      a: "Because the assessment is from 2007 and has not kept pace. Since then, state agencies and research institutions have documented severe declines and a contracting range, driven by the loss of longleaf pine savanna, road mortality, deliberate killing, roundups and the skin trade. It has been under review for US Endangered Species Act listing since a 2012 finding that listing may be warranted, and North Carolina already lists it as endangered.",
    },
  ],

  seo: {
    title: "Eastern Diamondback Rattlesnake — Size, Venom & Decline",
    description:
      "A researched profile of the eastern diamondback rattlesnake (Crotalus adamanteus): the world's largest rattlesnake, its infrared pits, venom and the real risk to people, and the loss of the longleaf pine savanna it depends on.",
    keywords: [
      "eastern diamondback rattlesnake facts",
      "crotalus adamanteus",
      "largest rattlesnake",
      "rattlesnake venom",
      "longleaf pine snake",
    ],
  },

  sources: [
    {
      label: "Crotalus adamanteus — Red List assessment (Hammerson, 2007)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/64308/12762249",
    },
    {
      label: "Eastern diamondback rattlesnake species account",
      publisher: "Savannah River Ecology Laboratory, University of Georgia",
      url: "https://srelherp.uga.edu/snakes/eastern-diamondback-rattlesnake/",
    },
    {
      label: "Eastern diamond-backed rattlesnake — Florida Snake ID Guide",
      publisher: "Florida Museum of Natural History",
      url: "https://www.floridamuseum.ufl.edu/florida-snake-id/snake/eastern-diamond-backed-rattlesnake/",
    },
    {
      label: "Eastern diamondback rattlesnake species profile",
      publisher: "Smithsonian's National Zoo and Conservation Biology Institute",
      url: "https://nationalzoo.si.edu/animals/eastern-diamondback-rattlesnake",
    },
  ],

  updatedAt: "2026-07-29",
};

export default easternDiamondbackRattlesnake;
