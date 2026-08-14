// Tiger shark — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const tigerShark = {
  slug: "tiger-shark",
  category: "fish",
  name: "Tiger Shark",
  scientificName: "Galeocerdo cuvier",
  otherNames: ["Leopard shark", "Sea tiger", "Man-eater shark", "Niuhi"],

  summary:
    "A five-metre coastal shark with the broadest diet of any shark alive, a tooth shaped to saw through turtle shell, and a bar pattern that fades as it grows.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Tiger_shark.jpg/1920px-Tiger_shark.jpg",
    alt: "A tiger shark swimming in clear shallow water in the Bahamas, its blunt square snout and faint flank bars visible",
    credit: "Albert kok / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Tiger_Shark_Galeocerdo_Cuvier_%28223179837%29.jpeg/1920px-Tiger_Shark_Galeocerdo_Cuvier_%28223179837%29.jpeg",
      alt: "A tiger shark photographed underwater off Cocos Island, Costa Rica, seen from the side in blue water",
      credit: "Kris Mikael Krister / Wikimedia Commons",
      title: "The bars that give it a name",
      caption:
        "Juveniles carry strong dark bars down the flanks, breaking up their outline in the shallow, dappled water where they spend their early years. The pattern fades with age, and a large adult may show almost nothing of it.",
    },
  ],

  headline: "The shark that eats everything",
  intro: [
    "The tiger shark is the second-largest predatory shark after the great white, reaching well over four metres and occasionally beyond five, and it is the least specialised large predator in the ocean. Its recorded diet includes fish, rays, other sharks, turtles, sea snakes, seabirds, dolphins, crustaceans, squid, carrion, and — from stomachs opened in harbours — number plates, tin cans and coal.",
    "That indiscriminate appetite is possible because of one anatomical detail. Where most sharks have teeth for gripping or for slicing flesh, the tiger shark has a deeply notched, heavily serrated tooth in both jaws that works like a can opener, and a head it can shake hard enough to use it. A loggerhead turtle's shell is not an obstacle. The species is assessed as Near Threatened, mainly because of fishing.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Chondrichthyes",
    order: "Carcharhiniformes",
    family: "Galeocerdonidae",
    genus: "Galeocerdo",
    species: "Galeocerdo cuvier",
  },

  conservation: {
    status: "NT",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate: "No global figure; regional trends vary widely, with steep declines recorded in some heavily fished areas and stable or recovering numbers in others",
    note: "Assessed on 10 August 2018 and published in the 2019 Red List. The species is taken in commercial and artisanal fisheries for fins, meat, skin and liver oil, and is deliberately killed in beach-protection programmes in Queensland, KwaZulu-Natal and elsewhere. Its comparatively high fecundity — litters of up to 80 pups — makes it more resilient than most large sharks, which is why it sits at Near Threatened rather than in a threatened category.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "3.25–4.25 m; large females beyond 5 m",
      min: 3.25,
      max: 5.5,
      unit: "m",
      note: "The largest well-supported specimens exceed 5.5 m; FishBase carries a maximum of 7.5 m that is not well substantiated",
    },
    {
      key: "weight",
      label: "Weight",
      value: "385–635 kg; large females over 900 kg",
      min: 385,
      max: 900,
      unit: "kg",
      note: "FishBase gives a maximum published weight of 807.4 kg; heavier estimates for exceptional females circulate but are rarely verified",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "A slow cruise, with short fast bursts",
      unit: "km/h",
      note: "Tiger sharks hunt by patrolling rather than pursuit, and the burst figures quoted for them are poorly documented",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "Usually above 140 m; recorded to about 800 m",
      min: 350,
      max: 800,
      unit: "m",
      note: "Most time is spent in shallow coastal water, but tagged sharks make repeated deep excursions offshore",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "13–16 months",
      min: 13,
      max: 16,
      unit: "months",
      note: "Females breed roughly once every three years",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "10–82 pups",
      min: 10,
      max: 82,
      unit: "pups",
      note: "Far larger litters than most big sharks manage, and the main reason the species can absorb more fishing pressure than a great white",
    },
    {
      key: "birth-size",
      label: "Size at birth",
      value: "51–76 cm",
      min: 51,
      max: 76,
      unit: "cm",
      note: "Independent from birth; no parental care of any kind",
    },
    {
      key: "sexual-maturity",
      label: "Size at sexual maturity",
      value: "Males 2.3–2.9 m; females 2.5–3.3 m",
      min: 2.3,
      max: 3.3,
      unit: "m",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Estimated 27–33 years",
      min: 22,
      max: 33,
      unit: "years",
      note: "Vertebral ageing validated by bomb radiocarbon aged males to 20 and females to 22; the higher figures are modelled longevity, and FishBase's 50 years is unvalidated",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore with the widest recorded diet of any shark — fish, turtles, seabirds, mammals, carrion and debris", icon: "Fish" },
    { key: "dentition", label: "Teeth", value: "Deeply notched and coarsely serrated in both jaws; cuts through turtle shell", icon: "Scissors" },
    { key: "reproduction", label: "Reproduction", value: "Live-bearing without a placenta — the exception among its close relatives", icon: "Egg" },
    { key: "activity", label: "Activity", value: "Moves inshore to hunt at night, offshore by day", icon: "Moon" },
    { key: "movement", label: "Movement", value: "Long seasonal migrations; tagged individuals cross ocean basins", icon: "Navigation" },
    { key: "schooling-behaviour", label: "Schooling", value: "Solitary; gathers loosely where food is concentrated", icon: "Users" },
    { key: "water-type", label: "Water type", value: "Saltwater; enters estuaries, harbours and river mouths", icon: "Droplet" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator whose presence alone changes where grazing animals feed", icon: "Leaf" },
  ],

  highlights: ["length", "weight", "litter-size", "lifespan"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "The Hawaiian Islands",
      "Northeastern and western Australia, including Shark Bay",
      "The Bahamas and the Caribbean",
      "KwaZulu-Natal, South Africa",
      "The Gulf of Mexico and the US southeast",
      "Cocos Island and the eastern tropical Pacific",
    ],
    habitats: ["Coral reefs and lagoons", "Turbid coastal water and estuaries", "Seagrass banks", "Open ocean between islands"],
    elevation: "Surface waters to about 800 m",
    note: "Circumglobal in tropical and warm-temperate seas — the Mediterranean is the notable exception — and unusually tolerant of murky water, harbours and river mouths, which is one reason encounters with people are more common than the species' abundance alone would predict. Individuals move seasonally between tropical and temperate water and can cross large stretches of open ocean between island groups.",
  },

  sections: [
    {
      id: "teeth",
      title: "A tooth that cuts shell",
      body: [
        "Most sharks have teeth built for one job. The great white's are triangular blades for taking clean bites out of soft tissue; a mako's are narrow spikes for holding fish. The tiger shark's are neither. They are broad, curved and deeply notched on the outer edge, with coarse serrations along both edges, and — unusually — identical in the upper and lower jaws.",
        "In combination with a short, powerful head and a violent lateral shaking motion, that tooth works as a saw. It is the reason the tiger shark is the only shark that routinely eats large sea turtles: the shell is not a defence against a serrated blade being sawed through it. The same tooth handles bone, bird, cartilage and shell equally well, which is what makes the diet so broad.",
        "The species also has a nictitating membrane, a tough third eyelid that sweeps across the eye at the moment of contact — a different solution from the great white's, which rolls its eye backwards instead.",
      ],
    },
    {
      id: "diet",
      title: "The widest diet of any shark",
      body: [
        "Stomach-content studies read like inventories. Bony fish, rays, sharks including other tiger sharks, sea turtles, sea snakes, seabirds, dolphins, seals, dugongs, squid, crabs, lobsters, jellyfish, carrion from whales and land mammals washed into the sea. Sharks caught near harbours have yielded number plates, tin cans, coal, and other rubbish, which is where the old nickname wastebasket of the sea comes from.",
        "The diet changes with size. Juveniles take small fish, molluscs and crustaceans. As the jaw and teeth develop, hard-shelled and large-bodied prey come within reach, and adults move on to turtles, rays and marine mammals.",
        "Some feeding is precisely timed. Off French Frigate Shoals in Hawaii, tiger sharks arrive to intercept albatross chicks in the weeks when the young birds are making their first attempts at flight and coming down on the water. This is not opportunism; the sharks return year after year to the same few weeks in the same place.",
      ],
    },
    {
      id: "ecology",
      title: "Fear as an ecological force",
      body: [
        "Long-term work in Shark Bay, Western Australia, has produced one of the clearest demonstrations anywhere of how a predator can shape a habitat without eating very much of anything.",
        "Dugongs and green turtles graze the seagrass meadows. The richest seagrass grows in shallow banks, which are also where tiger sharks hunt most effectively. When tiger sharks are present in numbers over the warm months, the grazers avoid the shallow banks and feed in deeper, poorer, safer water — and eat less, and eat differently.",
        "The seagrass benefits from the sharks' presence rather than from any sharks eating dugongs. Remove the predator and the grazing pressure moves onto the most productive meadows and stays there. It is one of the strongest arguments for protecting large sharks that has nothing to do with how many prey animals they consume.",
      ],
    },
    {
      id: "reproduction",
      title: "The odd one out among its relatives",
      body: [
        "Almost every shark in the family the tiger shark was long placed in nourishes its embryos through a placental connection, in the way a mammal does. The tiger shark does not. Its embryos develop inside the female sustained by yolk and by uterine secretions, with no placenta at all — a difference substantial enough that recent classifications have moved the species into its own family, Galeocerdonidae.",
        "Gestation runs 13 to 16 months and litters are large: 10 to 80 pups, occasionally more, each half a metre or better at birth and entirely independent. Females breed about once every three years.",
        "That reproductive output is why the tiger shark's conservation position differs from the great white's. A species producing dozens of pups per litter can absorb losses that would be catastrophic for one producing two to ten. It cannot absorb them indefinitely, and the assessment reflects a species being fished hard but not yet collapsing.",
      ],
    },
    {
      id: "people",
      title: "People, culls and fisheries",
      body: [
        "Tiger sharks are second only to great whites in recorded unprovoked bites on people. The reason is partly the diet — a shark that investigates everything is more likely to investigate a person — and partly geography, since they favour exactly the warm, turbid, shallow, near-shore water where people swim.",
        "The response to that in Hawaii is worth recording. Between 1959 and 1976 six state control programmes killed around 4,700 sharks, several hundred of them tiger sharks. A later analysis found no statistically significant reduction in the rate of bites. Beach protection programmes in Queensland and KwaZulu-Natal continue to take tiger sharks on drumlines and in nets, with much the same evidence problem.",
        "The larger pressure is ordinary fishing. Tiger sharks are taken for fins, meat, skin and vitamin-rich liver oil, and caught incidentally on tuna and swordfish longlines throughout their range. The 2018 assessment placed the species at Near Threatened, with declines in some heavily fished regions and stable or improving trends in others — an unusually mixed picture that reflects how much the outcome depends on local management.",
      ],
    },
  ],

  related: ["great-white-shark", "whale-shark", "giant-manta-ray", "red-bellied-piranha"],
  tags: ["shark", "apex predator", "marine", "cartilaginous fish", "near threatened"],
  searchTerms: ["galeocerdo cuvier", "tiger shark attack", "sea tiger", "shark teeth turtle", "niuhi"],

  faqs: [
    {
      q: "Why is it called a tiger shark?",
      a: "For the dark vertical bars along its flanks, which are strongest in juveniles and help break up their outline in shallow, dappled water. The pattern fades with age, and a large adult may show almost none of it.",
    },
    {
      q: "What do tiger sharks eat?",
      a: "More or less anything. Recorded prey includes fish, rays, other sharks, sea turtles, sea snakes, seabirds, dolphins, dugongs, squid, crustaceans and carrion, and sharks caught near harbours have had rubbish in their stomachs. The key is the tooth: deeply notched and coarsely serrated in both jaws, it saws through turtle shell that other sharks cannot handle.",
    },
    {
      q: "How big do tiger sharks get?",
      a: "Adults commonly reach 3.25 to 4.25 metres, and large females go beyond five. The best-supported records exceed 5.5 metres and around 900 kilograms; larger figures found in reference works are not well substantiated.",
    },
    {
      q: "Are tiger sharks dangerous to people?",
      a: "They are second only to great whites in recorded unprovoked bites, partly because they investigate almost anything and partly because they favour the warm, murky, shallow water people swim in. Encounters remain rare. Culling programmes have a poor record: around 4,700 sharks were killed in Hawaii between 1959 and 1976 with no statistically significant reduction in bites.",
    },
    {
      q: "Why is the tiger shark only Near Threatened when other big sharks are worse off?",
      a: "Because it breeds far faster than most large sharks. Litters run from 10 to over 80 pups after a 13 to 16 month gestation, where a great white produces two to ten. That lets the population absorb fishing pressure that would collapse a slower-breeding species — though declines have still been recorded in heavily fished regions.",
    },
  ],

  seo: {
    title: "Tiger Shark — Diet, Teeth, Size, Behaviour & Conservation",
    description:
      "A researched profile of the tiger shark (Galeocerdo cuvier): the serrated tooth that cuts turtle shell, the widest diet of any shark, its role in Shark Bay's seagrass, large litters, and Near Threatened status.",
    keywords: [
      "tiger shark facts",
      "galeocerdo cuvier",
      "tiger shark diet",
      "tiger shark size",
      "tiger shark attacks",
    ],
  },

  sources: [
    {
      label: "Galeocerdo cuvier — Red List assessment (Near Threatened, assessed 2018)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/39378/2913541",
    },
    {
      label: "Galeocerdo cuvier — species profile",
      publisher: "Florida Museum of Natural History",
      url: "https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/galeocerdo-cuvier/",
    },
    {
      label: "Galeocerdo cuvier — species summary, Red List date, size and depth range",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Galeocerdo-cuvier.html",
    },
    {
      label: "Using bomb radiocarbon analyses to validate age and growth estimates for the tiger shark (Kneebone et al., 2008)",
      publisher: "Marine Biology",
      url: "https://link.springer.com/article/10.1007/s00227-008-0934-y",
    },
  ],

  updatedAt: "2026-07-29",
};

export default tigerShark;
