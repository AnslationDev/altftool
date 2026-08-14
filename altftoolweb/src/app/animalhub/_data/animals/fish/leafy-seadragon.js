// Leafy seadragon — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const leafySeadragon = {
  slug: "leafy-seadragon",
  category: "fish",
  name: "Leafy Seadragon",
  scientificName: "Phycodurus eques",
  otherNames: ["Leafy sea dragon", "Glauert's seadragon", "Leafy"],

  summary:
    "A relative of the seahorse that has grown a full set of leaf-shaped skin lobes, drifts through southern Australian kelp beds as convincing seaweed, and leaves the male to carry the eggs on his tail.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Leafy_Seadragon_on_Kangaroo_Island.jpg/1920px-Leafy_Seadragon_on_Kangaroo_Island.jpg",
    alt: "A leafy seadragon photographed in the wild off Kangaroo Island, its leaf-shaped skin lobes spread along the body",
    credit: "James Rosindell / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Leafy_Seadragon_Phycodurus_eques_2500px_PLW_edit.jpg/1920px-Leafy_Seadragon_Phycodurus_eques_2500px_PLW_edit.jpg",
      alt: "A leafy seadragon in an aquarium tank, seen side-on with its tubular snout and rows of leaf-like appendages",
      credit: "Photo by and (C)2007 Derek Ramsey (Ram-Man); derivative edit by Papa Lima Whiskey / Wikimedia Commons",
      title: "Every lobe is decoration",
      caption:
        "None of the leafy appendages does any work in swimming. They are outgrowths of skin over bony plates, and their only function is to break up the animal's outline against drifting kelp — which is why a seadragon can afford to be shaped like this and a fast fish cannot.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Leafy_Sea_Dragon-Phycodurus_eques_%2823694746864%29.jpg/1920px-Leafy_Sea_Dragon-Phycodurus_eques_%2823694746864%29.jpg",
      alt: "A leafy seadragon hanging almost vertically in the water, its long snout angled downward",
      credit: "Sylke Rohrlach from Sydney / Wikimedia Commons",
      title: "A pipette with a fish attached",
      caption:
        "The long tubular snout has no teeth and opens into a mouth that cannot chew. Feeding is pure suction: the seadragon drifts within a centimetre or two of a mysid shrimp and draws it in whole, and it has to do that thousands of times a day.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Leafy_Seadragon_%2827823397061%29.jpg/1920px-Leafy_Seadragon_%2827823397061%29.jpg",
      alt: "A leafy seadragon in mid-water with its almost transparent pectoral and dorsal fins visible",
      credit: "shankar s. from Dubai, united arab emirates / Wikimedia Commons",
      title: "The fins you cannot see",
      caption:
        "Propulsion comes from two nearly transparent fins — one on each side of the neck and one along the back near the tail — beating fast enough to blur. Because the body itself never flexes, the animal appears to float rather than swim, which is exactly the point.",
    },
  ],

  headline: "Camouflage taken as far as a vertebrate can take it",
  intro: [
    "The leafy seadragon is a syngnathid — the family that contains seahorses and pipefish — that has committed entirely to looking like something else. Its body carries long, flattened lobes of skin at every joint, tinted yellow, olive and brown, and it moves through kelp beds at a speed that reads as drift rather than swimming. Divers who know a site well still lose track of individuals a metre away.",
    "It is found nowhere but the southern coast of Australia, in a band of cool temperate water running from South Australia into Western Australia and east into Victoria. It grows to about 35 centimetres, feeds by sucking mysid shrimp through a snout like a pipette, and — as in seahorses — the male carries the eggs, in this case glued to the underside of his tail rather than sealed in a pouch.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Syngnathiformes",
    family: "Syngnathidae",
    genus: "Phycodurus",
    species: "Phycodurus eques",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2016,
    populationTrend: "unknown",
    populationEstimate:
      "No global count; local surveys around Kangaroo Island and the South Australian gulfs record small, resident populations with strong site fidelity",
    note: "Assessed as Least Concern on 12 May 2016 and published in the 2017 Red List, replacing an earlier Near Threatened listing that some references still carry. Least Concern here means no demonstrated decline rather than abundance: this is a habitat specialist confined to one stretch of one country's coast. It is fully protected under South Australian, Western Australian and Victorian law and is a listed marine species under the Commonwealth EPBC Act, so taking one from the wild without a permit is an offence. Every leafy seadragon in a public aquarium is either captive-bred or held under permit.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Up to about 35 cm",
      min: 20,
      max: 35,
      unit: "cm",
      note: "FishBase and Fishes of Australia both give a maximum of 35 cm total length; most adults seen by divers are 20 to 30 cm",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "About 4–50 m",
      min: 4,
      max: 50,
      unit: "m",
      note: "FishBase gives 4–30 m and Fishes of Australia 4–50 m; most sightings are on shallow kelp reef and seagrass in sheltered bays",
    },
    {
      key: "clutch-size",
      label: "Eggs carried per brood",
      value: "About 100–300",
      min: 100,
      max: 300,
      unit: "eggs",
      note: "Fishes of Australia gives 250–300 pear-shaped eggs of about 4 × 7 mm; other sources report 100–250. The number rises with the size and age of the female",
    },
    {
      key: "incubation",
      label: "Brooding period",
      value: "Roughly 4–8 weeks",
      min: 28,
      max: 56,
      unit: "days",
      note: "Sources differ, partly because temperature changes the rate. Hatching is staggered over six or seven days rather than happening all at once",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mysid shrimp and other small crustaceans, drawn in whole through the snout", icon: "Fish" },
    { key: "camouflage", label: "Camouflage", value: "Leaf-shaped skin lobes that mimic drifting kelp; colour shifts with diet, age, location and stress", icon: "Leaf" },
    { key: "reproduction", label: "Reproduction", value: "Male brooding — eggs carried on a spongy patch under the tail, not in a sealed pouch", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Almost stationary; driven by two nearly transparent fins while the body stays rigid", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Solitary; pairs form only around breeding", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "Cool temperate waters of southern Australia only", icon: "Globe" },
    { key: "legal-protection", label: "Legal protection", value: "Protected under state law and listed as a marine species under the Commonwealth EPBC Act", icon: "Shield" },
  ],

  highlights: ["length", "camouflage", "clutch-size", "dive-depth"],

  distribution: {
    continents: ["Australia"],
    regions: [
      "Kangaroo Island, South Australia",
      "Spencer Gulf and Gulf St Vincent",
      "Fleurieu Peninsula and Victor Harbor",
      "The Great Australian Bight",
      "South-western Western Australia to Yanchep",
      "Western Victoria",
    ],
    habitats: ["Kelp-covered rocky reefs", "Seagrass meadows", "Sheltered bays and sand patches beside reef"],
    elevation: "About 4 to 50 m depth",
    note: "Endemic to southern Australia and found nowhere else on earth. Fishes of Australia gives the range as Victor Harbor in South Australia west to Yanchep in Western Australia; records also extend east into Victoria, and the species is often described as reaching Wilsons Promontory. Individuals are highly site-attached, which makes local populations vulnerable to anything that damages a particular reef and slow to recolonise afterwards.",
  },

  sections: [
    {
      id: "camouflage",
      title: "Why the leaves work",
      body: [
        "Every one of the leafy appendages is an outgrowth of skin over the bony plates that armour a syngnathid's body. None of them contributes to propulsion. Their entire function is to destroy the outline of a fish — the shape a predator's visual system is looking for — and replace it with the visual noise of loose seaweed.",
        "Colour does the rest. Leafy seadragons range from yellow-green through olive to reddish brown, and an individual can shift its tone to match its surroundings, though the extent depends on diet, age, location and how stressed the animal is. The result works in motion as well as at rest, which is unusual: most camouflage fails the moment the animal moves, and this one does not, because the movement itself looks like drift.",
        "The trade-off is total. A fish shaped like this cannot accelerate, cannot turn quickly and cannot escape anything that has actually noticed it. Leafy seadragons have no other defence — no venom, no spines to speak of, no burrow. Concealment is the whole strategy, and everything else about the body has been sacrificed to it.",
      ],
    },
    {
      id: "movement",
      title: "Moving without appearing to",
      body: [
        "Propulsion comes from two small fins: a pectoral fin on each side of the neck and a dorsal fin along the back towards the tail. Both are nearly transparent and beat fast enough to blur, so a seadragon under way looks like a piece of kelp being carried by a current rather than an animal going somewhere.",
        "The trunk is rigid. Syngnathids are encased in interlocking bony rings, which is why a seahorse's body is stiff and why a leafy seadragon cannot flex to swim. Unlike a seahorse, it also cannot curl its tail to grip — leafies have no prehensile tail, so they cannot anchor themselves to holdfasts and simply drift with whatever the water is doing.",
        "That inability to hold on is a real hazard. Storms wash seadragons out of their reefs and strand them, and individuals have been recorded turning up well away from where they live after heavy weather.",
      ],
    },
    {
      id: "feeding",
      title: "Feeding through a pipette",
      body: [
        "The snout is a long bony tube with a tiny mouth at the end and no teeth behind it. A seadragon feeds by approaching to within a centimetre or two of a mysid shrimp, then snapping its head forward and expanding the mouth cavity so fast that the prey is drawn in with the water — a suction strike measured in milliseconds.",
        "There is no chewing and no stomach. Food passes almost straight through a short gut, which means a seadragon has to eat more or less continuously through the day to stay in energy balance, picking off small crustaceans one at a time.",
        "Feeding is also what keeps the animal in one place. Mysid swarms concentrate around kelp and seagrass, and a seadragon that finds a good patch stays with it — one reason individuals are so strongly site-attached, and one reason a damaged reef is not simply swapped for another.",
      ],
    },
    {
      id: "breeding",
      title: "The male carries them",
      body: [
        "As in seahorses and pipefish, the male takes the eggs. Where a seahorse has a sealed pouch, though, a leafy seadragon has a brood patch: an area of spongy tissue on the underside of the tail that softens and develops cups before breeding. The female deposits her eggs directly onto it, and they are fertilised as they are transferred.",
        "He then carries them in the open for something between four and eight weeks, depending on temperature, supplying oxygen and shifting his tail to keep water moving over the clutch. Reported brood sizes range from about 100 to 300 pear-shaped eggs, and the larger the female, the more she lays.",
        "Hatching is spread over six or seven days rather than happening at once — a hedge against losing an entire brood to a single event. The young emerge as miniature seadragons, already leafy, and are independent immediately. Very few survive their first weeks.",
      ],
    },
    {
      id: "status",
      title: "Protected, and narrowly distributed",
      body: [
        "Leafy seadragons were assessed as Least Concern in 2016, replacing an earlier Near Threatened listing that some references still repeat. The downgrade reflects an absence of evidence of decline rather than any finding of abundance, and the species has the profile that usually makes conservationists nervous: a specialist confined to one temperate habitat, along one country's coast, with populations that barely move.",
        "Legal protection is strong. The leafy seadragon is protected under South Australian, Western Australian and Victorian legislation and is a listed marine species under the Commonwealth Environment Protection and Biodiversity Conservation Act, so collecting one from the wild without a permit is an offence. Aquarium specimens are captive-bred or permitted.",
        "The pressures that remain are indirect: loss and degradation of seagrass and kelp, coastal development and runoff in the gulfs, storm mortality, and the longer-term warming of the temperate reefs the species depends on. It is the marine emblem of South Australia, which has made it an unusually effective flagship for temperate reef conservation — a habitat that otherwise attracts a fraction of the attention coral reefs get.",
      ],
    },
  ],

  related: ["lined-seahorse", "mandarinfish", "ocellaris-clownfish", "coelacanth"],
  tags: ["seadragon", "marine", "bony fish", "camouflage", "australia", "least concern"],
  searchTerms: ["phycodurus eques", "leafy sea dragon", "leafy", "glauert's seadragon", "sea dragon"],

  faqs: [
    {
      q: "What are the leafy bits on a leafy seadragon for?",
      a: "Camouflage, and nothing else. They are outgrowths of skin over the bony plates of the body and play no part in swimming. Their job is to break up the fish-shaped outline a predator is looking for and replace it with something that reads as drifting seaweed — an illusion the animal maintains while moving, because it moves slowly enough to look like drift.",
    },
    {
      q: "How is a leafy seadragon different from a seahorse?",
      a: "Both are syngnathids, but a seadragon cannot curl or grip with its tail, so it cannot anchor itself the way a seahorse does. It is larger, at up to 35 centimetres, and it carries its eggs differently: a male seahorse seals them inside a pouch, while a male seadragon glues them to a spongy brood patch on the open underside of his tail.",
    },
    {
      q: "Where do leafy seadragons live?",
      a: "Only along the southern coast of Australia, on kelp-covered rocky reef and seagrass in sheltered bays at roughly 4 to 50 metres. The range runs from South Australia — including Kangaroo Island and the two gulfs — west into Western Australia and east into Victoria. They are found nowhere else in the world.",
    },
    {
      q: "Do male leafy seadragons give birth?",
      a: "The male carries the eggs, which is not quite the same thing. The female deposits 100 to 300 eggs onto a patch of spongy tissue under his tail, where they are fertilised and held in the open for four to eight weeks while he supplies oxygen and keeps water moving over them. The young hatch over six or seven days and are independent immediately.",
    },
    {
      q: "Are leafy seadragons endangered?",
      a: "They are listed as Least Concern, moved down from Near Threatened by a 2016 assessment, which reflects a lack of evidence of decline rather than large numbers. They are fully protected under Australian state law and listed under the Commonwealth EPBC Act, and the real risks are indirect — loss of seagrass and kelp, coastal runoff, storms and warming temperate seas.",
    },
  ],

  seo: {
    title: "Leafy Seadragon — Camouflage, Range, Breeding & Status",
    description:
      "A researched profile of the leafy seadragon (Phycodurus eques): what the leaf-shaped lobes actually do, how it moves and feeds, male brooding on the tail, its southern Australian range and its protected status.",
    keywords: [
      "leafy seadragon facts",
      "phycodurus eques",
      "leafy sea dragon",
      "seadragon vs seahorse",
      "leafy seadragon habitat",
    ],
  },

  sources: [
    {
      label: "Phycodurus eques — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/17096/67622420",
    },
    {
      label: "Leafy seadragon, Phycodurus eques",
      publisher: "Fishes of Australia",
      url: "https://fishesofaustralia.net.au/home/species/3126",
    },
    {
      label: "Leafy Seadragon, Phycodurus eques (Günther, 1865)",
      publisher: "Australian Museum",
      url: "https://australian.museum/learn/animals/fishes/leafy-seadragon-phycodurus-eques/",
    },
    {
      label: "Phycodurus eques — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Phycodurus-eques.html",
    },
    {
      label: "Leafy sea dragon",
      publisher: "Department of Biodiversity, Conservation and Attractions, Western Australia",
      url: "https://www.dbca.wa.gov.au/wildlife-and-ecosystems/marine/marine-parks/fun-facts/leafy-sea-dragon",
    },
  ],

  updatedAt: "2026-07-29",
};

export default leafySeadragon;
