// Atlantic bluefin tuna — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const atlanticBluefinTuna = {
  slug: "atlantic-bluefin-tuna",
  category: "fish",
  name: "Atlantic Bluefin Tuna",
  scientificName: "Thunnus thynnus",
  otherNames: ["Northern bluefin tuna", "Giant bluefin", "Tunny"],

  summary:
    "A warm-blooded, ocean-crossing predator built like an engine, and the subject of the most closely managed — and most argued-over — fishery in the Atlantic.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/18/Bluefin-big.jpg",
    alt: "An Atlantic bluefin tuna showing the deep torpedo-shaped body, metallic blue back and stiff crescent tail",
    credit: "NOAA Photo Library / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/At%C3%BAn_rojo%2C_thunnus_thynnus%2C_pescado_a_jigging_en_Cabo_de_Palos%2C_Murcia..JPG/1920px-At%C3%BAn_rojo%2C_thunnus_thynnus%2C_pescado_a_jigging_en_Cabo_de_Palos%2C_Murcia..JPG",
      alt: "A landed Atlantic bluefin tuna of over 100 kg, caught by rod and line off Cabo de Palos in Murcia, Spain",
      credit: "Rafa Gallut / Wikimedia Commons",
      title: "A hundred kilos on the scale",
      caption:
        "This is a landed fish, and deliberately so: bluefin biology is inseparable from the fishery that has shaped it. A rod-and-line capture of this size — over 100 kg, and it took more than an hour to bring in — is a mid-sized adult, well short of the 680 kg the species can reach.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Thunnus_thynnus_Croatia.jpg",
      alt: "An Atlantic bluefin tuna swimming in the Adriatic Sea off Croatia",
      credit: "picturavis / Wikimedia Commons",
      title: "The shape the speed requires",
      caption:
        "Live bluefin are hard to photograph, which is why most images of the species show it dead on a dock. The body is a stiff, near-perfect spindle: fins fold into grooves, the eyes sit flush with the head, and only the tail moves — drag reduced to almost nothing so the muscle can drive rather than fight the water.",
    },
  ],

  headline: "A fish that runs warm, and the fishery that nearly ended it",
  intro: [
    "Atlantic bluefin are among the largest and fastest bony fish in the sea: two and a half metres and a quarter of a tonne for a typical adult, four and a half metres and close to seven hundred kilograms at the extreme. They hold their swimming muscle far warmer than the water around them, which is why a fish that spawns in the Mediterranean in June can be feeding off Norway later in the year.",
    "For most of the last forty years the species has been shorthand for overfishing. Stocks fell by roughly 70% in the east and 80% in the west between the 1970s and the 2000s, quotas were repeatedly set above scientific advice, and the fish was assessed as Endangered. Then, in 2021, it was moved to Least Concern. That is a real recovery, built on quota cuts and on shutting down large-scale illegal fishing — but it is a recovery held in place by management, not one the species has grown out of.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Scombriformes",
    family: "Scombridae",
    genus: "Thunnus",
    species: "Thunnus thynnus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "increasing",
    populationEstimate: "The eastern Atlantic and Mediterranean stock has risen by at least 22% over four decades; the smaller western stock has fallen by more than half over the same period",
    note: "Downlisted from Endangered to Least Concern in September 2021 after quota cuts and enforcement against illegal fishing reversed decades of decline. The code describes global extinction risk and not the health of the fishery: catch remains capped by ICCAT quota, the western Gulf of Mexico spawning stock is still depleted, and the assessment would not survive a return to 2000s catch levels.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "2–2.5 m typical; up to 4.6 m",
      min: 2,
      max: 4.6,
      unit: "m",
      note: "FishBase gives a maximum of 458 cm total length; a common commercial size is around 200 cm fork length",
    },
    {
      key: "weight",
      label: "Weight",
      value: "225–250 kg typical; up to about 680 kg",
      min: 225,
      max: 684,
      unit: "kg",
      note: "The IGFA all-tackle record is a 679 kg fish taken off eastern Canada in 1979; FishBase lists a maximum published weight of 684 kg",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "Around 70 km/h in short bursts",
      min: 64,
      max: 70,
      unit: "km/h",
      note: "A widely quoted burst figure. Sustained cruising measured by archival tags is a small fraction of it — the point of the design is efficiency over ocean distances, not the sprint",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "About 1,000 m",
      min: 985,
      max: 1006,
      unit: "m",
      note: "FishBase gives a depth range of 0–985 m and archival tags have logged dives past 1,000 m; most time is spent in the upper 100 m",
    },
    {
      key: "body-temperature",
      label: "Body temperature above water",
      value: "Up to about 20 °C warmer than the sea",
      min: 10,
      max: 20,
      unit: "°C",
      note: "Muscle is held around 25–33 °C even in water close to 3 °C — the most developed thermoregulation known in any fish",
    },
    {
      key: "migration-distance",
      label: "Migration distance",
      value: "Over 10,000 km",
      min: 10000,
      max: 10000,
      unit: "km",
      note: "Electronic tags have followed individuals across the Atlantic and back within a single year",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 4 years in the east, 8 in the west",
      min: 4,
      max: 8,
      unit: "years",
      note: "The two stocks mature several years apart, which is a large part of why they respond so differently to the same fishing pressure",
    },
    {
      key: "clutch-size",
      label: "Eggs per season",
      value: "Up to about 10 million",
      min: 10000000,
      max: 10000000,
      unit: "eggs",
      note: "Released into open water in batches over a spawning season of weeks; fertilisation is external and there is no parental care",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "20–40 years",
      min: 20,
      max: 40,
      unit: "years",
      note: "NOAA gives 20 years or more and FishBase a maximum reported age of 32; the very largest fish are generally assumed to be older still",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — herring, mackerel, sand lance, squid and crustaceans", icon: "Fish" },
    { key: "thermoregulation", label: "Thermoregulation", value: "Regional endothermy, the most developed of any fish", icon: "Thermometer" },
    { key: "reproduction", label: "Reproduction", value: "Broadcast spawner; eggs and sperm released into open water", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Trans-Atlantic migration between feeding and spawning grounds", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Schools by size class; juveniles shoal densely, giants travel in small groups", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "North Atlantic, Mediterranean and the southern Black Sea", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Apex pelagic predator", icon: "Crosshair" },
  ],

  highlights: ["weight", "length", "swimming-speed", "body-temperature"],

  distribution: {
    continents: ["Africa", "Asia", "Europe", "North America", "South America"],
    regions: [
      "Gulf of Mexico",
      "Gulf of Maine and the Scotian Shelf",
      "Slope Sea off the northeastern United States",
      "Bay of Biscay",
      "Strait of Gibraltar",
      "Balearic Sea and the western Mediterranean",
      "Norwegian Sea",
      "Southern Black Sea",
    ],
    habitats: ["Open ocean", "Continental shelf edges", "Warm-water spawning grounds"],
    elevation: "Surface waters to about 1,000 m",
    note: "Confined to the Atlantic and its adjoining seas — western Atlantic from Labrador to Brazil, eastern Atlantic from Norway to the Canaries, plus the Mediterranean and the southern Black Sea. It is not the bluefin of the Pacific or of Australian waters; those are separate species. Tolerance runs from about 3 °C to 30 °C, which is unusually wide for a fish and is a direct consequence of the endothermy.",
  },

  sections: [
    {
      id: "engine",
      title: "Built like an engine",
      body: [
        "A bluefin's body is a solution to one problem: moving a large mass through water continuously for decades. The cross-section is close to a perfect fusiform. The first dorsal fin folds into a groove, the pectorals lie flat into recesses, and the eyes sit flush with the head, so almost nothing projects into the flow. Thrust comes from a stiff crescent tail on a narrow, keeled peduncle, with the swimming muscle set well forward — the tail is swung rather than undulated, which is what makes the stroke efficient at speed.",
        "Behind that sits a rete mirabile, a countercurrent heat exchanger in which warm venous blood returning from the swimming muscle runs alongside cold arterial blood arriving from the gills and hands its heat over rather than losing it at the gill surface. Bluefin do this better than any other fish: muscle temperature stays somewhere around 25 to 33 °C in water that may be close to 3 °C.",
        "Warm muscle contracts faster and recovers faster, and the practical effect is range. A cold-blooded predator of this size is confined to a temperature band; a bluefin is not. It can spawn in a warm Mediterranean summer and feed through a northern winter, which is why the species occupies an ocean rather than a region of one.",
      ],
    },
    {
      id: "two-stocks",
      title: "Two stocks, one ocean",
      body: [
        "Management treats Atlantic bluefin as two populations divided at 45°W: an eastern stock that spawns in the Mediterranean and a western stock that spawns in the Gulf of Mexico. The division is real — chemical signatures laid down in the otoliths during a fish's first year identify which nursery it came from, and fish return to spawn where they were born.",
        "The two differ in more than geography. Eastern fish mature at around four years, western fish at about eight. The eastern stock is far larger. And the boundary is a management convention, not a wall: tagging shows extensive mixing on the feeding grounds, so a fishery operating in the west can be catching eastern fish and vice versa. Getting that mixing rate wrong has historically been one of the biggest sources of error in the stock assessments.",
        "A third spawning area, the Slope Sea off the northeastern United States, was identified in 2016 and complicated the picture further, since it sits outside both recognised spawning grounds and implies that some fish mature earlier in the west than the assessments assumed.",
      ],
    },
    {
      id: "fishery",
      title: "The most valuable fish in the sea",
      body: [
        "Bluefin has been fished in the Mediterranean since antiquity — the almadraba trap fisheries of southern Spain run in an unbroken line back to Phoenician and Roman operations. What changed in the 1970s was the market. Fatty bluefin belly became the premium cut of the Japanese sashimi trade, air freight made it possible to sell an Atlantic fish in Tokyo, and a fish worth pennies as cat food became worth tens of thousands of dollars.",
        "One persistent confusion is worth clearing up: the headline auction prices reported from Tokyo each New Year are paid for Pacific bluefin caught off northern Japan, a different species. Atlantic bluefin nonetheless commands very high prices through the same market.",
        "Much of the Mediterranean catch never lands as a wild fish. Purse seiners take bluefin alive, tow them slowly in cages to farms off Malta, Spain, Croatia and Turkey, and fatten them for months before harvest. Ranching raises the value of a given quota, but it also made catches genuinely hard to count, since fish are transferred at sea rather than weighed at a dock — which is precisely how the illegal fishing of the 2000s went unrecorded for so long.",
      ],
    },
    {
      id: "recovery",
      title: "Collapse, and a recovery that has to be held",
      body: [
        "By the mid-2000s the position was dire. Eastern stock biomass had fallen by roughly 70% and western by around 80% from 1970s levels. ICCAT was repeatedly setting quotas above its own scientific committee's advice — 36,000 tonnes at one point against advice of 15,000 — and actual catches ran far above even that, at perhaps 60,000 tonnes a year once unreported fishing was counted. A proposal to ban international trade under CITES was tabled in 2010 and defeated.",
        "What followed is the part that is usually left out. Quotas were cut hard, to around 13,500 tonnes for the eastern stock by 2010. Catch documentation, vessel monitoring and observer coverage were tightened until the illegal fishery became genuinely difficult to operate. And the stock responded faster than anyone predicted: by 2021 the eastern population was at least 22% above its 1970s level, and the IUCN moved the species from Endangered to Least Concern.",
        "The nuance matters. The eastern stock drove that reassessment; the western stock, spawning in the Gulf of Mexico, has declined by more than half over the same four decades and is not recovered. And quotas have been rising again as the stock has: the eastern Atlantic and Mediterranean total allowable catch was set at 40,570 tonnes a year for 2023–2025 and raised to just over 48,000 tonnes for 2026–2028. Least Concern describes a species that is no longer sliding towards extinction. It does not describe a fishery that can be left alone.",
      ],
    },
    {
      id: "outlook",
      title: "What still has to hold",
      body: [
        "Since 2022 ICCAT has managed bluefin under a management procedure: a pre-agreed harvest control rule that converts survey data into a quota automatically, tested in advance against a wide range of possible stock conditions. It is a deliberate attempt to remove the annual political negotiation that produced the quotas of the 2000s, and it is the single most important reason to expect the recovery to hold.",
        "The open risks are the ones the rule cannot see. Warming is shifting where bluefin feed and spawn, and the Mediterranean is warming faster than the ocean average, which puts pressure on the eastern stock's spawning grounds. Mixing between stocks is still imperfectly estimated, so western fishing may be drawing on eastern fish or the reverse. And the western stock has not turned the corner the eastern one has.",
        "The species is also a useful test case. It is the clearest evidence available that a large, slow-maturing, extremely valuable fish can be brought back — and the clearest evidence that doing so requires binding quotas, real enforcement and a decade of patience, none of which are guaranteed to survive the next round of negotiations.",
      ],
    },
  ],

  related: ["great-white-shark", "whale-shark", "ocellaris-clownfish"],
  tags: ["tuna", "marine", "bony fish", "apex predator", "fishery", "least concern"],
  searchTerms: ["thunnus thynnus", "bluefin", "tuna", "sashimi tuna", "giant tunny", "iccat"],

  faqs: [
    {
      q: "Is Atlantic bluefin tuna still endangered?",
      a: "No. The IUCN moved Atlantic bluefin tuna from Endangered to Least Concern in September 2021, after quota cuts and enforcement against illegal fishing reversed decades of decline. That status describes global extinction risk, not the state of the fishery: catch is still capped by ICCAT quota, and the western Atlantic stock that spawns in the Gulf of Mexico remains depleted.",
    },
    {
      q: "How big do Atlantic bluefin tuna get?",
      a: "A typical mature adult is 2 to 2.5 metres long and weighs 225 to 250 kilograms. The maximum recorded length is about 4.6 metres, and the IGFA all-tackle world record is a 679 kilogram fish caught off eastern Canada in 1979.",
    },
    {
      q: "Are bluefin tuna warm-blooded?",
      a: "Partly, and more so than any other fish. A countercurrent heat exchanger called the rete mirabile keeps heat generated by the swimming muscle inside the body instead of losing it at the gills, holding muscle temperature around 25 to 33 °C even in water near 3 °C. This is what lets a single species spawn in the Mediterranean and feed off Norway.",
    },
    {
      q: "How fast can an Atlantic bluefin tuna swim?",
      a: "Burst speeds of roughly 70 km/h are widely cited, which puts it among the fastest fish in the ocean. Sustained cruising speeds recorded by archival tags are far lower — the body is designed for efficiency over transatlantic distances rather than for sprinting.",
    },
    {
      q: "Why did the Atlantic bluefin population recover?",
      a: "Three things at once: total allowable catches were cut sharply from the mid-2000s, catch documentation and vessel monitoring made the large illegal fishery hard to operate, and the stock proved more productive than the assessments expected. Since 2022 quotas have been set by an agreed harvest control rule rather than negotiated each year, which is the main reason to expect the gains to hold.",
    },
  ],

  seo: {
    title: "Atlantic Bluefin Tuna — Size, Speed, Endothermy & Recovery",
    description:
      "A researched profile of the Atlantic bluefin tuna (Thunnus thynnus): regional endothermy, transatlantic migration, the eastern and western stocks, the collapse of the 2000s and the 2021 downlisting to Least Concern.",
    keywords: [
      "atlantic bluefin tuna facts",
      "thunnus thynnus",
      "bluefin tuna size",
      "is bluefin tuna endangered",
      "bluefin tuna recovery",
    ],
  },

  sources: [
    {
      label: "Thunnus thynnus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/21860/46913402",
    },
    {
      label: "Tuna species recovering despite growing pressures on marine life",
      publisher: "IUCN (September 2021 Red List update)",
      url: "https://iucn.org/news/species/202109/tuna-species-recovering-despite-growing-pressures-marine-life-iucn-red-list",
    },
    {
      label: "Western Atlantic bluefin tuna species profile",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/western-atlantic-bluefin-tuna",
    },
    {
      label: "Thunnus thynnus — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/thunnus-thynnus.html",
    },
    {
      label: "Bluefin tuna stock assessment executive summary",
      publisher: "ICCAT Standing Committee on Research and Statistics",
      url: "https://www.iccat.int/Documents/SCRS/ExecSum/BFT_E_ENG.pdf",
    },
  ],

  updatedAt: "2026-07-29",
};

export default atlanticBluefinTuna;
