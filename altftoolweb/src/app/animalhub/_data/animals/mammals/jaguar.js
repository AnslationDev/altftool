// Jaguar — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const jaguar = {
  slug: "jaguar",
  category: "mammals",
  name: "Jaguar",
  scientificName: "Panthera onca",
  otherNames: ["Yaguareté", "El tigre", "American jaguar"],

  summary:
    "The only big cat in the Americas, and the one that kills by biting straight through the skull — a heavily built, water-loving predator whose stronghold is the Amazon basin.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg",
    alt: "A jaguar standing in profile, showing its heavy build and rosette-marked coat",
    credit: "USFWS / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Panthera_onca_111593872.jpg/1920px-Panthera_onca_111593872.jpg",
      alt: "A jaguar at close range, its broad head and heavy jaw clearly visible",
      credit: "Mark Bolnik / Wikimedia Commons",
      title: "A head built around the bite",
      caption:
        "The jaguar's skull is short, deep and broad, giving the jaw muscles a mechanical advantage no other big cat matches for its size. Relative to body mass its bite is the most powerful of any Panthera.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Kubai_Jaguar_%28Panthera_onca%29.jpg/1920px-Kubai_Jaguar_%28Panthera_onca%29.jpg",
      alt: "Portrait of a jaguar showing rosettes with small dark spots inside them",
      credit: "MauMirror / Wikimedia Commons",
      title: "Rosettes with spots inside",
      caption:
        "This is the reliable way to tell a jaguar from a leopard: jaguar rosettes enclose one or more small dark spots, while a leopard's are hollow. The pattern is unique to each animal and is used to identify individuals from camera traps.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Jaguar_%28Pathera_onca%29.jpg/1920px-Jaguar_%28Pathera_onca%29.jpg",
      alt: "A jaguar rescued from the illegal wildlife trade, at a wildlife sanctuary in Bolivia",
      credit: "MauMirror / Wikimedia Commons",
      title: "Taken for the trade",
      caption:
        "Demand for jaguar teeth, skins and paste has grown over the past decade, much of it feeding export routes to Asia. Cubs seized from traffickers can rarely be returned to the wild.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/95/Panthera_onca_%2CYaguaret%C3%A9_macho_%2C_27.09.2023_%2C_Bioparque_de_Fundacion_Temaiken_%2C_Escobar_%2C_Buenos_aires_%2C_Argentina.jpg",
      alt: "A male jaguar at a conservation park in Buenos Aires Province, Argentina",
      credit: "Naturaleza en.foco / Wikimedia Commons",
      title: "At the southern edge",
      caption:
        "Argentina sits at the far southern limit of the range, where jaguars have lost more than ninety per cent of their historical ground. Captive-bred animals have since been released into the Iberá wetlands, where the species had been absent for seventy years.",
    },
  ],

  headline: "The only big cat in the Americas",
  intro: [
    "The jaguar is the third-largest cat in the world and the only member of Panthera in the New World. It is built differently from its Old World relatives: shorter in the leg, deeper in the chest, with a broad heavy head and a bite that, weight for weight, is the most powerful of any big cat.",
    "It uses that bite in a way no other cat does. Rather than suffocating prey at the throat, a jaguar frequently bites directly through the skull, between the ears, into the brain. It is also thoroughly at home in water — swimming between islands, hunting caiman and turtles — which sets it apart from most of the cat family.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Felidae",
    genus: "Panthera",
    species: "Panthera onca",
  },

  conservation: {
    status: "NT",
    assessmentYear: 2017,
    populationTrend: "decreasing",
    populationEstimate: "Around 173,000 individuals, of which roughly 89% are in Amazonia",
    note: "Near Threatened in the 2017 assessment (errata version 2018), with the assessors noting that updated information could push the species into Vulnerable. The global number is misleading on its own: the Amazon basin holds the overwhelming majority, and populations outside it are small, fragmented and in many places already gone. The jaguar occupies roughly half its historical range and is extinct in El Salvador and Uruguay.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.12–1.85 m",
      min: 1.12,
      max: 1.85,
      unit: "m",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.45–0.75 m",
      min: 0.45,
      max: 0.75,
      unit: "m",
      note: "Short for a big cat — a jaguar is not built for the high-speed turns a long tail helps balance",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "0.57–0.81 m",
      min: 0.57,
      max: 0.81,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "56–96 kg",
      min: 56,
      max: 96,
      unit: "kg",
      note: "Regional variation is extreme. Females in central Mexico can be as light as 36 kg; Pantanal and Venezuelan llanos males average around 95 kg, and the heaviest recorded reached 158 kg",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "About 890 N at the canine tip",
      min: 887,
      max: 887,
      unit: "N",
      note: "In absolute terms this is third among the cats, behind tiger and lion — but the jaguar's bite force quotient of 118.6, which corrects for body size, is the highest of any big cat. Modelling puts a 100 kg jaguar at roughly 4.9 kN through the canines and 6.9 kN at the carnassial notch",
    },
    {
      key: "territory-size",
      label: "Home range",
      value: "15–800 km²",
      min: 15,
      max: 807,
      unit: "km²",
      note: "Smallest in the prey-rich Pantanal, where females hold about 15 km²; largest in the Cerrado and Atlantic Forest, where males range over several hundred",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "91–111 days",
      min: 91,
      max: 111,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1–2 cubs",
      min: 1,
      max: 2,
      unit: "cubs",
      note: "Litters of up to four are recorded but rare; the low reproductive rate is a real constraint on recovery",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "2.5 years (females), 3–4 years (males)",
      min: 2.5,
      max: 4,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Rarely beyond 11 years in the wild",
      min: 10,
      max: 11,
      unit: "years",
      note: "Captive jaguars have reached 22 years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — capybara, peccary, caiman, turtles and deer", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Solitary and territorial", icon: "User" },
    { key: "activity", label: "Activity", value: "Crepuscular and nocturnal; melanistic animals more often by day", icon: "Moon" },
    { key: "killing-method", label: "Killing method", value: "Bites through the skull between the ears", icon: "Target" },
    { key: "swimming", label: "Swimming", value: "Strong swimmer; hunts in water and crosses open channels", icon: "Waves" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator of Neotropical forest and wetland", icon: "Network" },
  ],

  highlights: ["weight", "bite-force", "killing-method", "swimming"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Amazon basin (Brazil, Peru, Colombia, Ecuador, Bolivia)",
      "The Pantanal, Brazil and Bolivia",
      "The Guianas and Venezuela",
      "Central America from Panama to Belize",
      "Mexico",
      "Northern Argentina and Paraguay",
      "Extreme southern Arizona and New Mexico, United States",
    ],
    habitats: [
      "Tropical and subtropical rainforest",
      "Seasonally flooded wetland",
      "Dry forest and scrub",
      "Riverine and gallery forest",
      "Mangrove",
    ],
    elevation: "Sea level to around 2,700 m, though jaguars are overwhelmingly lowland animals",
    note: "The species once ranged from the southwestern United States to central Argentina. It now holds roughly half that, and the surviving distribution is heavily weighted toward the Amazon. Jaguars were considered extirpated from the United States by the late 1960s; individual males have since been documented crossing back into Arizona from Mexico.",
  },

  sections: [
    {
      id: "bite",
      title: "The skull bite",
      body: [
        "Most big cats kill by asphyxiation, clamping the throat or muzzle until the animal suffocates. The jaguar often does something else entirely: it bites through the temporal bones of the skull, between the ears, driving its canines into the brain. Death is immediate.",
        "This works because of how the jaguar is put together. The skull is short and deep, shortening the lever arm the jaw muscles have to work against, and the canines are relatively thick and blunt. The result is a bite force quotient — a measure that corrects raw force for body size — of 118.6, the highest of any big cat, even though in absolute terms the tiger and lion bite harder.",
        "It also explains the diet. Jaguars take armoured and armour-plated prey that other cats leave alone: caiman, and freshwater turtles whose shells they crack outright. Against capybara, a favoured prey in the Pantanal, the bite goes through the temporal bone and zygomatic arch in a single action.",
      ],
    },
    {
      id: "water",
      title: "A cat that lives with water",
      body: [
        "Jaguars are strong swimmers and appear to be more comfortable in water than tigers, which is saying a good deal. They have been recorded crossing at least 1.3 km of open water between islands and the shore, and they hunt in rivers and flooded forest as a matter of routine.",
        "Much of their core range is seasonally inundated — the Pantanal, the Amazon várzea, the llanos — and the annual flood reshapes where prey concentrates. Jaguars follow it. In the Pantanal they take caiman on riverbanks in the dry season, when the animals are packed into shrinking pools.",
        "The link to water runs through the range countries' cultures too. The Spanish name yaguareté comes by way of Guaraní; across Amazonia the jaguar appears in mythology as a being that moves between the river and the forest, and it was central to Olmec, Maya and Aztec iconography long before European contact.",
      ],
    },
    {
      id: "melanism",
      title: "Black jaguars",
      body: [
        "Melanistic jaguars — the black panthers of the Americas — occur throughout the range. The trait is caused by deletions in the melanocortin 1 receptor gene and is inherited through a dominant allele, unlike melanism in the leopard, which is recessive.",
        "The coat is not truly black. In raking light the rosettes are clearly visible against the darker background, and in camera-trap infrared the pattern is often distinct enough to identify individuals.",
        "Black jaguars occur at higher density in tropical rainforest and are more active during the day than spotted animals, which has been read as evidence that the darker coat provides camouflage in the deep, high-contrast shade of closed-canopy forest.",
      ],
    },
    {
      id: "prey",
      title: "Prey and hunting",
      body: [
        "The recorded prey list runs to dozens of species and reflects opportunity more than preference. Capybara and peccary dominate in much of South America; in Central America the diet leans toward armadillo, coati, agouti and deer. Caiman, anaconda, turtles and fish all feature.",
        "Hunting is a stalk-and-ambush affair conducted mainly at dusk and through the night. Jaguars use riverbanks and game trails, approach under cover and attack at close range, usually from behind or the side. Kills are dragged into thick cover, though jaguars do not habitually cache in trees the way leopards do — they face less kleptoparasitism, having no lion or hyena equivalent to contend with.",
        "Where cattle ranching overlaps the range, jaguars take livestock, and retaliatory killing by ranchers is among the most persistent threats to the species. Compensation schemes and predator-proof enclosures have reduced this in places, but it remains widespread.",
      ],
    },
    {
      id: "conservation",
      title: "Range collapse and recovery efforts",
      body: [
        "The jaguar's range shrank by around 20% between 2008 and 2015 alone, and by more than half over the past century. Deforestation for cattle and soy, road building, mining and the fragmentation these produce are the main drivers. Poaching for teeth, skins and body paste has grown markedly over the past decade, with trafficking routes running to Asian markets.",
        "The counterweight is the Jaguar Corridor Initiative, an attempt to keep the genetic connection intact from Mexico to Argentina by protecting linkages between core populations rather than only the populations themselves — a strategy the species' large home ranges and long dispersal distances make necessary.",
        "There has been at least one clear reversal. In Argentina's Iberá wetlands, where jaguars had been absent for around seventy years, captive-bred animals were released from 2021 onwards and are now breeding in the wild. It is the first reintroduction of the species into ground from which it had been entirely eliminated.",
      ],
    },
  ],

  related: ["leopard", "cheetah", "tiger", "lion"],
  tags: ["big cat", "apex predator", "south america", "carnivore", "rainforest", "near threatened"],
  searchTerms: ["panthera onca", "yaguarete", "jaguar vs leopard", "black jaguar", "jaguar bite force"],

  faqs: [
    {
      q: "How is a jaguar different from a leopard?",
      a: "Jaguars are stockier, with shorter legs, a broader head and a shorter tail, and their rosettes contain small dark spots where a leopard's are hollow. They also occupy different continents — jaguars in the Americas, leopards in Africa and Asia. The clearest behavioural difference is the kill: a jaguar bites through the skull, while a leopard takes the throat.",
    },
    {
      q: "Do jaguars have the strongest bite of any big cat?",
      a: "Relative to body size, yes. The jaguar's bite force quotient of 118.6 is the highest among the big cats. In absolute terms it comes third, behind the tiger and the lion, simply because those animals are much larger — a jaguar bites at roughly 890 N at the canine tip.",
    },
    {
      q: "Do jaguars swim?",
      a: "Readily, and better than most cats. They hunt in rivers and flooded forest, take caiman and turtles from the water, and have been recorded swimming at least 1.3 km between islands and the mainland. Much of their core range floods seasonally, so being at ease in water is not optional.",
    },
    {
      q: "How many jaguars are left in the wild?",
      a: "Roughly 173,000, according to a 2018 range-wide modelling study. About 89% of them are in the Amazon basin; outside it, populations are small and highly fragmented. The species is listed as Near Threatened and occupies about half its historical range.",
    },
    {
      q: "Are there jaguars in the United States?",
      a: "Only as occasional visitors. Jaguars were considered extirpated from the US by the late 1960s, but individual males have been photographed in southern Arizona and New Mexico since the 1990s, dispersing north from breeding populations in Mexico. There is no established breeding population north of the border.",
    },
  ],

  seo: {
    title: "Jaguar — Bite Force, Skull Bite, Range & Conservation Status",
    description:
      "A researched profile of the jaguar (Panthera onca): the only big cat in the Americas, its skull-crushing bite, life in flooded forest, black jaguars, and why Near Threatened understates the risk.",
    keywords: [
      "jaguar facts",
      "panthera onca",
      "jaguar bite force",
      "jaguar vs leopard",
      "black jaguar",
    ],
  },

  sources: [
    {
      label: "Panthera onca — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/15953/123791436",
    },
    {
      label: "Jaguar species account",
      publisher: "IUCN SSC Cat Specialist Group",
      url: "https://www.catsg.org/living-species-jaguar",
    },
    {
      label: "Estimating large carnivore populations at global scale — jaguar (Jędrzejewski et al., 2018)",
      publisher: "PLOS ONE",
      url: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0194719",
    },
  ],

  updatedAt: "2026-07-29",
};

export default jaguar;
