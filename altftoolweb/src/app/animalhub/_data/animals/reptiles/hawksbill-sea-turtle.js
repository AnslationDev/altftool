// Hawksbill sea turtle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const hawksbillSeaTurtle = {
  slug: "hawksbill-sea-turtle",
  category: "reptiles",
  name: "Hawksbill Sea Turtle",
  scientificName: "Eretmochelys imbricata",
  otherNames: ["Hawksbill turtle", "Tortoiseshell turtle"],

  summary:
    "A reef turtle that lives almost entirely on sponges — a food made largely of glass spicules and chemical defences — and was hunted to the edge for the shell that made tortoiseshell.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Eretmochelys-imbricata-K%C3%A9lonia-2.JPG/1920px-Eretmochelys-imbricata-K%C3%A9lonia-2.JPG",
    alt: "A hawksbill sea turtle swimming, its overlapping amber and brown carapace scutes visible",
    credit: "Thierry Caro / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/ad/A_male_Hawksbill_turtle%2C_Eretmochelys_imbricata.jpg",
      alt: "A male hawksbill turtle swimming over a reef",
      credit: "Vardhan Patankar / Wikimedia Commons",
      title: "How to tell a male",
      caption:
        "Male hawksbills have a much longer, thicker tail than females, plus a slightly concave plastron and stronger claws on the fore-flippers — the grip needed for mating at sea. Males never come ashore at all.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Beak_of_Hawksbill_turtle_%28Eretmochelys_imbricata%29.jpg/1920px-Beak_of_Hawksbill_turtle_%28Eretmochelys_imbricata%29.jpg",
      alt: "Close view of the narrow hooked beak of a hawksbill turtle",
      credit: "Gerwin Sturm / Wikimedia Commons",
      title: "The beak the name comes from",
      caption:
        "The narrow, sharply hooked beak is a reef tool. It reaches into crevices and holes in coral that a blunt-jawed green turtle cannot, which is how the hawksbill gets at sponges growing where nothing else grazes.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/2017%2C_cuba%2C_jardines_aggressor%2C_pipin%2C_hawksbill_turtle_%2837294334580%29.jpg/1920px-2017%2C_cuba%2C_jardines_aggressor%2C_pipin%2C_hawksbill_turtle_%2837294334580%29.jpg",
      alt: "A hawksbill turtle on a Caribbean reef at Jardines de la Reina, Cuba",
      credit: "q phia / Wikimedia Commons",
      title: "Reef resident, not open-ocean wanderer",
      caption:
        "After a drifting juvenile stage in the open sea, hawksbills settle onto shallow reefs and lagoons and stay. Individuals often hold small home ranges on the same reef for years, which is exactly what made them easy to fish out.",
    },
  ],

  headline: "A diet of glass, and a shell worth more than the animal",
  intro: [
    "The hawksbill is a mid-sized sea turtle of tropical reefs, distinguished by a narrow hooked beak, a serrated rear shell margin and carapace scutes that overlap like roof tiles instead of butting edge to edge. Adults are usually 60 to 90 cm along the shell and 45 to 70 kg, though the heaviest on record reached 127 kg.",
    "It is one of very few animals in the world that lives principally on sponges — a food defended by silica spicules and by chemistry potent enough to deter almost everything else. A Caribbean adult gets through something like 544 kg of sponge in a year. That role on the reef is why the species matters ecologically, and it is a role now performed by a fraction of the turtles that once did it: the hawksbill has been Critically Endangered since long before the current assessment, which itself dates from 2008.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Testudines",
    family: "Cheloniidae",
    genus: "Eretmochelys",
    species: "Eretmochelys imbricata",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2008,
    populationTrend: "decreasing",
    populationEstimate: "No global total; regional nesting populations range from a few hundred to several thousand females a year",
    note: "The global assessment is from 2008, by Mortimer and Donnelly for the IUCN SSC Marine Turtle Specialist Group, and is badly overdue for revision — the specialist group reassessed the green turtle in 2025 but the hawksbill's listing still rests on the earlier work. It qualified as Critically Endangered on an estimated population reduction of more than 80 per cent over three generations. Listed as Endangered under the US Endangered Species Act, and on CITES Appendix I, which closed the legal tortoiseshell trade.",
  },

  measurements: [
    {
      key: "length",
      label: "Carapace length",
      value: "Usually 60–90 cm; around 1 m in the largest animals",
      min: 0.6,
      max: 1,
      unit: "m",
      note: "Measured along the shell. Hawksbills are among the smaller sea turtles — a leatherback is roughly twice this",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Typically 45–70 kg",
      min: 45,
      max: 127,
      unit: "kg",
      note: "The heaviest hawksbill ever captured weighed 127 kg, far above the normal range",
    },
    {
      key: "sponge-intake",
      label: "Sponge eaten per year",
      value: "Around 544 kg for a Caribbean adult",
      min: 544,
      max: 544,
      unit: "kg",
      note: "About 1,200 pounds. Sponges make up roughly 70 to 95 per cent of the Caribbean diet; Indo-Pacific populations take more algae, seagrass and mangrove fruit",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "Around 130–160 eggs per nest",
      min: 130,
      max: 160,
      unit: "eggs",
      note: "Three to five nests in a season — one of the largest clutches of any sea turtle",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About two months in warm sand",
      min: 55,
      max: 75,
      unit: "days",
      note: "Sand temperature sets the sex of the hatchlings, so warming beaches skew clutches female",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Estimated 50 years or more",
      min: 50,
      max: 50,
      unit: "years",
      note: "Not directly established — sea turtle longevity is inferred from growth rates rather than observed",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Spongivore — sponges above all, plus algae, corals, molluscs, crustaceans and jellyfish", icon: "Fish" },
    { key: "beak", label: "Beak", value: "Narrow and sharply hooked, with a prominent cutting edge for reaching into reef crevices", icon: "Scissors" },
    { key: "water-type", label: "Water type", value: "Saltwater — tropical and subtropical reefs, lagoons and estuaries", icon: "Droplet" },
    { key: "breeding-season", label: "Breeding", value: "Females nest every two to three years, returning to the region where they hatched", icon: "Calendar" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — no infrared organs. Nest temperature nonetheless decides the sex of every hatchling", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Skin and carapace scutes are shed gradually and piecemeal, never in one piece", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Reef sponge grazer — keeps fast-growing sponges from crowding out slower corals", icon: "Globe" },
  ],

  highlights: ["sponge-intake", "length", "beak", "ecological-role"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "North America", "Oceania", "South America"],
    regions: [
      "Caribbean Sea and Gulf of Mexico",
      "Great Barrier Reef and northern Australia",
      "Indian Ocean and Red Sea",
      "Indo-Pacific coral triangle",
      "Eastern Pacific mangrove estuaries",
    ],
    habitats: [
      "Coral reef",
      "Shallow lagoon",
      "Rocky reef and hard bottom",
      "Mangrove estuary",
      "Open ocean, as drifting juveniles",
    ],
    elevation: "Surface waters to reef depths of a few tens of metres",
    note: "Circumtropical, but with a life history that has two very different halves. Hatchlings drift for years in open-ocean currents among floating weed, then recruit onto shallow reefs and become resident, often holding a home range on one reef for years at a time. Nesting is dispersed across many small beaches rather than concentrated at a few mass sites, which makes the species hard to count and easy to lose one rookery at a time.",
  },

  sections: [
    {
      id: "sponges",
      title: "Eating something almost nothing else can",
      body: [
        "Sponges are not a soft option. Their tissue is stiffened with spicules of silica — literally glass — and many reef species are loaded with chemical defences that make them toxic or unpalatable to almost every other animal on the reef. Anne Meylan's work on the subject was titled 'a diet of glass', and electron micrographs of hawksbill intestines show the spicules embedded in the gut wall.",
        "The hawksbill eats them anyway, and mostly nothing else: sponges account for something like 70 to 95 per cent of the diet across the Caribbean. It is selective within that, taking only a handful of the more than 300 sponge species available, but the ones it favours include species other animals cannot touch. A Caribbean adult works through roughly 544 kg of sponge in a year.",
        "The narrow, hooked beak is the tool that makes this possible. It reaches into holes and undercuts in the reef that a broad-jawed grazer cannot get into, which is where much of that sponge grows.",
        "Not every population eats this way. Australian hawksbills take substantial amounts of marine algae, seagrass and mangrove fruit, and the eastern Pacific animals live largely in mangrove estuaries rather than on coral. The species is a sponge specialist in the Caribbean more absolutely than it is everywhere.",
      ],
    },
    {
      id: "reef-role",
      title: "What the grazing does to a reef",
      body: [
        "Sponges and corals compete for the same hard surface, and sponges grow faster. A reef with sponge grazers on it is a reef where corals keep more of the space; a reef without them tilts towards sponge.",
        "The scale at which this once operated is easy to underestimate. Reconstructions of pre-exploitation Caribbean populations put the number of adult hawksbills in the hundreds of thousands, collectively removing hundreds of millions of kilograms of sponge each year. Whatever the modern reef looks like, it is not the baseline.",
        "This is the strongest argument for hawksbill recovery that does not depend on the turtle itself: the species is a functional component of coral reef ecology, and its near-removal was a change to how reefs work, not just a loss of an animal from them.",
      ],
    },
    {
      id: "tortoiseshell",
      title: "The shell that caused the problem",
      body: [
        "Hawksbill scutes are thick, translucent, and streaked amber, brown, red and black. Heated, they can be moulded and welded. They are the source of true tortoiseshell — used for combs, spectacle frames, boxes and inlay for centuries, and known in Japan as bekko, where the craft became a highly developed industry.",
        "No other turtle produces the material, so the trade fell on one species. Hundreds of thousands of hawksbills were taken across the twentieth century, and the shell was worth enough that the animal was killed for it alone. CITES listed the species on Appendix I, and Japan closed its legal bekko imports in 1993, which removed the largest single market.",
        "Illegal trade did not stop. Worked shell still turns up in tourist markets across the tropics, and demand persists in several countries. The species also continues to be taken for meat and for eggs in many parts of its range.",
      ],
    },
    {
      id: "threats",
      title: "Threats beyond the shell trade",
      body: [
        "Bycatch is the largest ongoing source of mortality: hawksbills drown in gill nets, are hooked on longlines and are caught in trawls. Because they live on reefs where small-scale fisheries operate, much of this happens in gear that is not monitored.",
        "Their habitat is disappearing separately from the fishing. Coral reefs worldwide are being degraded by bleaching, disease, pollution and physical damage, and a sponge-eating reef resident cannot follow a reef that stops functioning. Nesting beaches are lost to coastal development, lighting and erosion.",
        "Nest temperature adds a slower problem. Like all sea turtles, hawksbills have temperature-dependent sex determination, and warmer sand makes more females. Some rookeries already produce heavily female-biased hatchling cohorts, with consequences that will not be visible for decades.",
        "Against that, the species reproduces prolifically when it can — three to five nests a season, 130 to 160 eggs each — and protected rookeries have shown recovery. The limiting factor is not fecundity; it is whether adults survive long enough to use it.",
      ],
    },
  ],

  related: ["green-sea-turtle", "leatherback-sea-turtle", "galapagos-tortoise"],
  tags: ["turtle", "marine", "coral reef", "critically endangered", "reptile", "tortoiseshell"],
  searchTerms: ["eretmochelys imbricata", "hawksbill turtle", "tortoiseshell turtle", "bekko", "sponge eating turtle"],

  faqs: [
    {
      q: "What do hawksbill turtles eat?",
      a: "Sponges, mostly. They are one of very few animals that live principally on them, and sponges make up roughly 70 to 95 per cent of the diet in the Caribbean — around 544 kg a year for an adult. They also take algae, corals, molluscs, crustaceans and jellyfish. Australian and eastern Pacific populations eat considerably more algae, seagrass and mangrove fruit.",
    },
    {
      q: "How do hawksbills eat sponges when nothing else can?",
      a: "Sponge tissue is stiffened with silica spicules — effectively glass — and many reef sponges carry chemical defences that deter other animals entirely. Hawksbills eat them regardless, selecting a small number of species from the hundreds available, and the spicules can be seen embedded in their gut tissue. Their narrow hooked beak also reaches into reef crevices where much of that sponge grows.",
    },
    {
      q: "Why are hawksbill turtles critically endangered?",
      a: "Primarily because of the tortoiseshell trade. Their shell is the only source of true tortoiseshell, and hundreds of thousands were killed for it during the twentieth century. The assessment estimated a population reduction of more than 80 per cent over three generations. Bycatch, egg and meat harvest, coral reef degradation and the loss of nesting beaches continue the pressure.",
    },
    {
      q: "How can you tell a hawksbill from a green turtle?",
      a: "Three features. The beak is narrow and sharply hooked rather than blunt. The carapace scutes overlap like roof tiles instead of meeting edge to edge. And the rear margin of the shell is serrated, giving a saw-toothed outline. Hawksbills are also smaller — usually 60 to 90 cm of shell against well over a metre for a large green turtle.",
    },
    {
      q: "Is the 2008 assessment still current?",
      a: "It is the assessment the listing rests on, and it is overdue. The IUCN SSC Marine Turtle Specialist Group reassessed the green turtle in 2025 but the hawksbill's global status still traces to Mortimer and Donnelly's 2008 work. The species remains listed as Critically Endangered globally and as Endangered under the US Endangered Species Act.",
    },
  ],

  seo: {
    title: "Hawksbill Sea Turtle — Sponge Diet, Reef Role & Endangerment",
    description:
      "A researched profile of the hawksbill sea turtle (Eretmochelys imbricata): a spongivore eating 544 kg of glass-laced sponge a year, its role on coral reefs, the tortoiseshell trade, and Critically Endangered status.",
    keywords: [
      "hawksbill sea turtle facts",
      "eretmochelys imbricata",
      "hawksbill turtle diet",
      "tortoiseshell turtle",
      "critically endangered sea turtle",
    ],
  },

  sources: [
    {
      label: "Eretmochelys imbricata — Red List assessment (Mortimer & Donnelly, 2008)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/8005/12881238",
    },
    {
      label: "Hawksbill turtle species profile",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/hawksbill-turtle",
    },
    {
      label: "Red List assessments for the world's sea turtles",
      publisher: "IUCN SSC Marine Turtle Specialist Group",
      url: "https://www.iucn-mtsg.org/statuses",
    },
    {
      label: "Hawksbill sea turtle — sponge consumption",
      publisher: "Ocean Conservancy",
      url: "https://oceanconservancy.org/wildlife-library/hawksbill-sea-turtle/",
    },
    {
      label: "The hawksbill's distinctive diet",
      publisher: "SWOT: The State of the World's Sea Turtles",
      url: "https://www.seaturtlestatus.org/articles/2008/1/29/the-hawksbills-distinctive-diet",
    },
  ],

  updatedAt: "2026-07-29",
};

export default hawksbillSeaTurtle;
