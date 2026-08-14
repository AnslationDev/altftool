// Orca — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const orca = {
  slug: "orca",
  category: "mammals",
  name: "Orca",
  scientificName: "Orcinus orca",
  otherNames: ["Killer whale", "Blackfish", "Grampus"],

  summary:
    "The largest dolphin and the ocean's most widespread predator — a species split into culturally distinct populations that hunt different prey, speak different dialects and do not interbreed.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Killerwhales_jumping.jpg/1920px-Killerwhales_jumping.jpg",
    alt: "Two orcas leaping clear of the sea, black backs and white undersides visible",
    credit: "Robert Pittman / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/01/A_small_pod_of_Killer_Whales_%28Orcinus_orca%29_amongst_the_bergs_E_of_Hope_bay_%26_the_Antarctic_Peninsula._%2825366387074%29.jpg",
      alt: "A small pod of orcas surfacing among icebergs off the Antarctic Peninsula",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "A pod is a family, not a crowd",
      caption:
        "Orcas travel in matrilines — a mother and her descendants — and in some populations offspring of both sexes stay with their mother for life. The pod is the unit that carries hunting technique and dialect between generations.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/A_small_pod_of_Killer_Whales_%28Orcinus_orca%29_amongst_the_bergs_E_of_Hope_bay_%26_the_Antarctic_Peninsula._%2825973169906%29.jpg/1920px-A_small_pod_of_Killer_Whales_%28Orcinus_orca%29_amongst_the_bergs_E_of_Hope_bay_%26_the_Antarctic_Peninsula._%2825973169906%29.jpg",
      alt: "Orcas swimming close to pack ice and icebergs in Antarctic water",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "Antarctic specialists",
      caption:
        "Several distinct Antarctic ecotypes share these waters without mixing. One of them hunts seals resting on ice floes by swimming in formation to generate a wave that washes the seal off — a technique taught, not inherited.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/091201_orca_5407_%284173393532%29.jpg",
      alt: "An orca surfacing, its tall dorsal fin and white eye patch clearly visible",
      credit: "Christopher Michel / Wikimedia Commons",
      title: "The fin tells you the sex",
      caption:
        "An adult male's dorsal fin can stand 1.8 m tall and straight; a female's is around a metre and curved. It is the quickest field distinction between the sexes, and individual fin shapes and saddle patches are how researchers identify particular animals.",
    },
  ],

  headline: "One species, many cultures",
  intro: [
    "The orca is the largest member of the dolphin family and the most widely distributed mammal on Earth after humans, found from the pack ice of both poles to the tropics. A large male reaches nearly ten metres and five tonnes, with a dorsal fin standing 1.8 metres out of the water.",
    "What makes it genuinely unusual is not size but division. Across the world's oceans, orcas sort into populations — ecotypes — that overlap in range yet do not mix, do not interbreed, eat entirely different prey, and use different call dialects. In the northeast Pacific, fish-eating 'residents' and mammal-eating 'transients' share the same water and ignore each other. Those differences are learned and passed down, which is why the IUCN has never been able to assess the orca as a single global species.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Artiodactyla",
    family: "Delphinidae",
    genus: "Orcinus",
    species: "Orcinus orca",
  },

  conservation: {
    status: "DD",
    assessmentYear: 2017,
    populationTrend: "unknown",
    populationEstimate: "At least 50,000 worldwide, with roughly 2,500 in the eastern North Pacific",
    note: "Data Deficient is the correct listing, and it is not a placeholder for 'probably fine'. The 2017 assessment could not assign a category because the orca almost certainly is not one species: multiple ecotypes are reproductively isolated and may warrant species or subspecies status, so a single global figure has no biological meaning. Individual populations tell a very different story. The Southern Resident population of the northeast Pacific stood at 74 animals in the July 2025 census and has been listed as Endangered under the US Endangered Species Act since 2005; the Strait of Gibraltar subpopulation was assessed as Critically Endangered in 2019. Expect the global picture to fragment further as the taxonomy is resolved.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Length",
      value: "4.9–6.7 m",
      min: 4.9,
      max: 6.7,
      unit: "m",
      note: "Average adult range; males 5.8–6.7 m, females 4.9–5.8 m. The largest recorded male was 9.8 m and the largest female 8.5 m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "2,400–5,400 kg",
      min: 2400,
      max: 5400,
      unit: "kg",
      note: "An adult female averages around 2,440 kg; large males exceed 5,000 kg. The sexes differ in size more than in almost any other dolphin",
    },
    {
      key: "dorsal-fin-height",
      label: "Dorsal fin height",
      value: "0.9–1.8 m",
      min: 0.9,
      max: 1.8,
      unit: "m",
      note: "Males up to 1.8 m and near-vertical; females 0.9–1.2 m and curved. The single easiest way to sex an orca at sea",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "Bursts up to about 45 km/h",
      min: 40,
      max: 45,
      unit: "km/h",
      note: "Held for seconds at most. Normal cruising is under 13 km/h. A 1958 record of 55.5 km/h circulates widely but rests on a single old observation",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "1,087 m recorded",
      min: 1087,
      max: 1087,
      unit: "m",
      note: "A tagged adult female off South Georgia in 2015, taking Patagonian toothfish from longlines. The previous record, 767 m, was set in 2013 near the Prince Edward Islands. Ordinary foraging dives are far shallower",
    },
    {
      key: "pod-size",
      label: "Group size",
      value: "2–20 individuals typically",
      min: 2,
      max: 20,
      unit: "individuals",
      note: "Matrilineal pods of closely related animals. Temporary aggregations of a hundred or more form where prey is concentrated",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 15–18 months",
      min: 450,
      max: 540,
      unit: "days",
      note: "Among the longest of any cetacean. Calving intervals run to five years or more",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1 calf",
      min: 1,
      max: 1,
      unit: "calf",
      note: "Born at roughly 2.5 m. First-year mortality is high even in healthy populations",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "10–15 years",
      min: 10,
      max: 15,
      unit: "years",
      note: "Females typically bear their first calf in their mid-teens and stop reproducing around forty, then live for decades afterwards",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "30–50 years on average",
      min: 30,
      max: 50,
      unit: "years",
      note: "Males average around 30 years and can exceed 60; females average around 50 and can approach 90",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — prey depends entirely on the population", icon: "Fish" },
    { key: "social-structure", label: "Social structure", value: "Matrilineal pods; some offspring never leave the mother", icon: "Users" },
    { key: "echolocation", label: "Echolocation", value: "Present — though mammal-hunting populations often hunt in near silence", icon: "Waves" },
    { key: "ocean-range", label: "Ocean range", value: "All oceans, pole to pole", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator with no natural predator of its own", icon: "Network" },
  ],

  highlights: ["body-length", "dorsal-fin-height", "dive-depth", "social-structure"],

  distribution: {
    continents: ["Africa", "Antarctica", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "Northeast Pacific — British Columbia, Washington and Alaska",
      "Norwegian and Icelandic waters",
      "Antarctic pack ice and the Southern Ocean",
      "Patagonia and the Valdés Peninsula",
      "New Zealand coastal waters",
      "Strait of Gibraltar and the Iberian Atlantic",
    ],
    habitats: [
      "Cold temperate coastal waters",
      "Polar pack ice and ice edges",
      "Continental shelf and slope",
      "Open ocean",
      "Estuaries and fjords",
    ],
    elevation: "Surface waters to a recorded 1,087 m",
    note: "Orcas occur in every ocean, but they are not evenly spread. Densities are highest in cold, productive coastal waters — the northeast Pacific, Norway, Iceland, the Antarctic — and lowest in the tropics. Because each ecotype is tied to its own prey, range in practice means the range of a particular population rather than of the species: transient orcas follow seals, Norwegian orcas follow herring, and Antarctic type B orcas follow the ice.",
  },

  sections: [
    {
      id: "ecotypes",
      title: "Ecotypes: not one animal but many",
      body: [
        "In the waters off British Columbia and Washington, three kinds of orca share the same sea. Residents eat fish, and one population eats almost nothing but Chinook salmon. Transients — also called Bigg's killer whales — eat marine mammals: seals, sea lions, porpoises and the calves of large whales. Offshores, a third and less understood group, appear to specialise in sharks, and their teeth are worn flat by shark skin.",
        "They overlap in range and encounter each other regularly. They do not interbreed. They have distinct body shapes, distinct saddle patch markings, distinct acoustic dialects and distinct social structures, and genetic work shows the lineages have been separate for hundreds of thousands of years.",
        "The same pattern repeats worldwide. Antarctic waters hold at least four recognised types, one of which specialises in seals hauled out on ice floes. Norwegian orcas herd herring into tight balls and stun them with tail slaps. A population off Patagonia deliberately strands itself on the beach to take sea lion pups, then works its way back to the water.",
        "None of these behaviours are instinctive. They are taught — practised over years, with adults observed rehearsing beach-stranding with juveniles in safe conditions. This is why the ecotypes are usually described as cultures rather than merely populations, and why the case for splitting Orcinus orca into several species is taken seriously.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting",
      body: [
        "Orcas take a wider range of prey than any other cetacean — fish, squid, sharks, rays, seals, sea lions, seabirds, sea turtles and whales — but any individual orca eats a narrow slice of that list, determined by the population it was born into.",
        "The techniques are cooperative and specific. Wave-washing, in which several animals swim in formation to generate a wave that sweeps a seal off an ice floe, requires precise coordination. Carousel feeding on herring involves driving fish into a ball and striking it with the tail. Orcas hunting grey whale calves work to separate mother and calf and then drown the calf by preventing it surfacing, sometimes over hours.",
        "Great white sharks are taken in at least two regions, off California and off South Africa, with the liver removed and the rest of the carcass often left. Off Cape Town, the arrival of two particular orcas has coincided with white sharks abandoning long-established aggregation sites entirely.",
        "Acoustics are part of the strategy. Fish-eating residents are noisy — fish hear poorly at the relevant frequencies — while mammal-hunting transients travel and hunt in near silence, because seals and porpoises can hear them coming.",
      ],
    },
    {
      id: "society",
      title: "Matrilines, dialects and menopause",
      body: [
        "The basic orca social unit is the matriline: a female, her offspring, and the offspring of her daughters. In resident populations, neither sons nor daughters disperse. An adult male orca in his forties is still travelling with his mother, and the association is lifelong.",
        "Each pod has an acoustic dialect — a repertoire of discrete calls that differs from neighbouring pods and is stable across decades. Related pods share partly overlapping repertoires, so dialects can be arranged into clans that map onto maternal descent. Calves learn the dialect from their mothers.",
        "Orcas are one of only a handful of mammals in which females go through menopause. Females stop reproducing around forty and can live for decades more. The evidence indicates this is not a byproduct of longevity: post-reproductive females lead the pod to salmon in poor years, drawing on decades of accumulated knowledge, and the survival of adult sons drops sharply after their mother dies.",
      ],
    },
    {
      id: "southern-residents",
      title: "The Southern Residents",
      body: [
        "The best-studied orcas in the world are the Southern Resident population of the Salish Sea, off Washington State and British Columbia. Every individual is catalogued, named and numbered, and the population has been followed continuously since the early 1970s.",
        "The July 2025 census counted 74 animals. The population once numbered around 140, and it has not recovered from live captures for marine parks in the 1960s and 1970s, which removed a whole generation of juveniles. It was listed as Endangered under the US Endangered Species Act in 2005.",
        "Three pressures act together. The population eats Chinook salmon almost exclusively, and Chinook runs have collapsed across much of the range. Vessel noise interferes with the echolocation they hunt by, so a noisy day is also a hungry one. And they carry among the highest recorded burdens of PCBs and other persistent pollutants of any marine mammal, which mobilise from fat reserves when an animal goes hungry and pass to calves in milk.",
        "The Strait of Gibraltar subpopulation, assessed as Critically Endangered in 2019 and numbering only a few dozen, faces a comparable squeeze on a different prey species — Atlantic bluefin tuna.",
      ],
    },
    {
      id: "humans",
      title: "Orcas and people",
      body: [
        "There is no record of a wild orca killing a person. Given that this is an animal capable of killing adult whales, and that it encounters swimmers, divers, kayakers and small boats routinely, the absence is striking and is not well explained. Captive orcas, by contrast, have injured and killed handlers on several occasions.",
        "The name 'killer whale' is a partial mistranslation. Spanish whalers called them asesina de ballenas, whale killer, having watched them attack larger whales; the phrase reversed on its way into English. The animal is a dolphin, not a whale in the usual sense, and 'orca' has increasingly displaced the older name.",
        "Live capture for marine parks ended in most jurisdictions decades ago, and public opinion turned sharply against captive display after 2013. The pressures that remain are indirect: depletion of prey stocks, chemical pollution that accumulates in an apex predator's fat, underwater noise, and entanglement in fishing gear. Since 2020, orcas off Iberia have repeatedly interacted with sailing yachts and damaged rudders — behaviour that spread rapidly through the population and, whatever its cause, is another demonstration that orcas transmit novel behaviour socially.",
      ],
    },
  ],

  related: ["bottlenose-dolphin", "blue-whale", "polar-bear"],
  tags: ["marine", "apex predator", "cetacean", "carnivore", "data deficient", "social"],
  searchTerms: [
    "orcinus orca",
    "killer whale",
    "blackfish",
    "orca pod",
    "southern resident killer whales",
  ],

  faqs: [
    {
      q: "Why is the orca listed as Data Deficient rather than endangered?",
      a: "Because the orca is probably not one species. Multiple ecotypes are reproductively isolated from one another, eat different prey and may qualify as separate species or subspecies, so a single global assessment has little biological meaning. Data Deficient reflects that uncertainty, not an absence of risk — the Southern Resident population is listed as Endangered under US law, and the Strait of Gibraltar subpopulation was assessed as Critically Endangered in 2019.",
    },
    {
      q: "Is an orca a whale or a dolphin?",
      a: "A dolphin. The orca is the largest member of the oceanic dolphin family, Delphinidae. The name 'killer whale' comes from Spanish whalers who called them 'whale killer' after watching them attack larger whales; the phrase inverted when it was translated into English.",
    },
    {
      q: "Have orcas ever killed a person in the wild?",
      a: "There is no confirmed record of a wild orca killing a human, despite frequent encounters with swimmers, divers and small boats. Captive orcas have injured and killed handlers on several occasions. Why wild orcas do not treat people as prey is not well understood.",
    },
    {
      q: "How long do orcas live?",
      a: "Males average around 30 years and can exceed 60. Females average around 50 and can approach 90. Females also go through menopause, stopping reproduction around forty and living for decades afterwards — post-reproductive females lead their pods to food in poor years, and their sons' survival drops sharply after they die.",
    },
    {
      q: "Do all orcas eat the same food?",
      a: "No, and this is the central fact about the species. Each population specialises. Resident orcas in the northeast Pacific eat fish, one population almost exclusively Chinook salmon; transients in the same water eat only marine mammals. Antarctic types specialise in seals, minke whales or fish. These preferences are learned and taught, and populations with different diets do not interbreed even where they overlap.",
    },
  ],

  seo: {
    title: "Orca — Size, Ecotypes, Hunting & Conservation Status",
    description:
      "A researched profile of the orca (Orcinus orca): why the world's most widespread predator is listed as Data Deficient, how its ecotypes hunt and speak differently, and the state of the Southern Residents.",
    keywords: [
      "orca facts",
      "orcinus orca",
      "killer whale",
      "orca ecotypes",
      "southern resident killer whales",
    ],
  },

  sources: [
    {
      label: "Orcinus orca — Red List assessment (Reeves, Pitman & Ford, 2017)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/15421/50368125",
    },
    {
      label: "Killer whale species profile and Southern Resident census",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/killer-whale",
    },
    {
      label: "Updated cetacean Red List assessments, December 2019 — Strait of Gibraltar orca subpopulation listed Critically Endangered",
      publisher: "IUCN SSC Cetacean Specialist Group",
      url: "https://iucn-csg.org/6-updated-cetacean-red-list-assessments-published-in-december-2019/",
    },
    {
      label: "Killer whale characteristics",
      publisher: "SeaWorld Animal Guide",
      url: "https://seaworld.org/animals/all-about/killer-whale/characteristics/",
    },
    {
      label: "A record-breaking dive by a hungry killer whale",
      publisher: "Hakai Magazine",
      url: "https://hakaimagazine.com/news/a-record-breaking-dive-by-a-hungry-killer-whale/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default orca;
