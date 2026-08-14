// Green sea turtle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const greenSeaTurtle = {
  slug: "green-sea-turtle",
  category: "reptiles",
  name: "Green Sea Turtle",
  scientificName: "Chelonia mydas",
  otherNames: ["Green turtle", "Black sea turtle", "Pacific green turtle"],

  summary:
    "The only sea turtle that grazes rather than hunts as an adult, and the subject of one of conservation's largest recoveries — moved from Endangered to Least Concern in 2025.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg/1920px-Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg",
    alt: "A green sea turtle photographed underwater off Moorea, French Polynesia",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Green_Turtle_Chelonia_Mydas_%28223128015%29.jpeg/1920px-Green_Turtle_Chelonia_Mydas_%28223128015%29.jpeg",
      alt: "A green sea turtle swimming in clear water, its front flippers extended",
      credit: "Kris Mikael Krister / Wikimedia Commons",
      title: "Twenty years to adulthood",
      caption:
        "Green turtles take somewhere between 20 and 50 years to mature, and only a tiny fraction of hatchlings ever get there. That arithmetic is why the species took half a century of protection to recover, and why any renewed pressure would take just as long to undo.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Green_Turtle_Chelonia_mydas.JPG/1920px-Green_Turtle_Chelonia_mydas.JPG",
      alt: "A green sea turtle in shallow water over reef in Baa Atoll, Maldives",
      credit: "Ahmed Abdul Rahman for MDC Seamarc Maldives / Wikimedia Commons",
      title: "Flippers built for distance",
      caption:
        "The front limbs are paddles that beat like wings rather than rowing, which is efficient enough to carry an adult thousands of kilometres between feeding grounds and its nesting beach. The rear flippers steer, and on land they dig the nest chamber.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/0934-Green_Sea_Turtle%2C_Chelonia_mydas.jpg/1920px-0934-Green_Sea_Turtle%2C_Chelonia_mydas.jpg",
      alt: "A green sea turtle underwater, its patterned carapace and beaked head visible",
      credit: "Ben Shoshana / Wikimedia Commons",
      title: "A beak made for cropping",
      caption:
        "The finely serrated jaw is the adult's grazing tool. Green turtles crop seagrass repeatedly from the same patches, which keeps the blades short and productive — the same effect grazing mammals have on grassland.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Green_sea_turtles_are_listed_as_threatened_along_California%27s_coast_%2830608718471%29.jpg/1920px-Green_sea_turtles_are_listed_as_threatened_along_California%27s_coast_%2830608718471%29.jpg",
      alt: "Comber, a green sea turtle rescued after a cold-shock stranding in Canada and rehabilitated for release",
      credit: "Pacific Southwest Region USFWS from Sacramento, US / Wikimedia Commons",
      title: "Cold-stunned at the range edge",
      caption:
        "Sea turtles are ectotherms, so water below roughly 10 °C leaves them floating and unable to swim — a condition called cold-stunning. This animal stranded further north than any green turtle previously recorded, and survived rehabilitation to be returned to the sea.",
    },
  ],

  headline: "The sea turtle that grazes, and the one that came back",
  intro: [
    "Adult green turtles are the only herbivorous sea turtles. They spend their lives cropping seagrass meadows and algae in shallow tropical water, and the name comes not from the shell but from the greenish fat beneath it, coloured by that diet. Juveniles are meat-eaters; the switch to plants happens as they leave the open ocean for coastal feeding grounds.",
    "In October 2025 the species was moved on the IUCN Red List from Endangered straight to Least Concern, skipping both intermediate categories, after a global increase of roughly 28% since the 1970s. It is one of the largest recoveries the Red List has recorded — and one that says more about what fifty years of nest protection and trade bans can do than about the animal being out of danger, since several of its regional subpopulations are still assessed as threatened.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Testudines",
    family: "Cheloniidae",
    genus: "Chelonia",
    species: "Chelonia mydas",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2025,
    populationTrend: "increasing",
    populationEstimate:
      "No single global total; the 2025 assessment reports a rise of roughly 28% since the 1970s",
    note: "This record cites the GLOBAL assessment, published in the Red List update of October 2025, which downlisted the species from Endangered — a status it had held since the 2004 assessment. The eleven regional subpopulations are assessed separately and do not all share the global figure: the Central South Pacific is Endangered, the East Pacific and North Indian Ocean are Vulnerable, and the Mediterranean and Central West Pacific are Near Threatened. Separately, under the United States Endangered Species Act several distinct population segments remain listed as endangered, which is a different legal instrument from the Red List and has not changed.",
  },

  measurements: [
    {
      key: "length",
      label: "Carapace length",
      value: "0.8–1.2 m",
      min: 0.8,
      max: 1.2,
      unit: "m",
      note: "The largest recorded carapace measured 1.53 m; this is the largest of the hard-shelled sea turtles",
    },
    {
      key: "weight",
      label: "Weight",
      value: "68–190 kg",
      min: 68,
      max: 190,
      unit: "kg",
      note: "The heaviest reliably recorded green turtle weighed 395 kg",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "About 110 eggs per nest",
      min: 85,
      max: 200,
      unit: "eggs",
      note: "A female lays three to five clutches in a season, roughly a fortnight apart, then usually skips two to four years before nesting again",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 50–70 days",
      min: 50,
      max: 70,
      unit: "days",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 25–35 years",
      min: 20,
      max: 50,
      unit: "years",
      note: "Estimates across populations span 20 to 50 years — among the slowest of any reptile, and the central fact in the species' conservation",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "70 years or more",
      min: 70,
      max: 70,
      unit: "years",
      note: "Not precisely known; there is no reliable way to age a wild adult",
    },
    {
      key: "dive-duration",
      label: "Dive time",
      value: "Typically 5–30 minutes; hours when resting",
      min: 5,
      max: 30,
      unit: "minutes",
      note: "Travelling dives are short and shallow. A resting turtle slows its heart rate and can stay down far longer",
    },
    {
      key: "migration-distance",
      label: "Migration distance",
      value: "Over 2,600 km between feeding grounds and nesting beaches",
      min: 2600,
      max: 2600,
      unit: "km",
      note: "Journeys on this scale are routine — turtles feeding off the Brazilian coast cross roughly 2,300 km of the South Atlantic to nest on Ascension Island, a target about 10 km across",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Herbivore as an adult — seagrass and algae; carnivorous as a juvenile", icon: "Leaf" },
    { key: "activity", label: "Activity", value: "Grazes by day, rests at night; females come ashore to nest after dark", icon: "Sun" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "ocean-range", label: "Ocean range", value: "Tropical and subtropical seas worldwide, plus the Mediterranean", icon: "Globe" },
    { key: "nest-type", label: "Nest type", value: "A flask-shaped chamber dug in beach sand above the high-tide line", icon: "Egg" },
    { key: "breeding-season", label: "Breeding", value: "Nests in bouts every two to four years, several clutches per season", icon: "Calendar" },
    { key: "ecological-role", label: "Ecological role", value: "Grazer that keeps seagrass meadows cropped and productive", icon: "Sprout" },
  ],

  highlights: ["length", "weight", "migration-distance", "diet-type"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "Great Barrier Reef and the Coral Sea",
      "Hawaii and the Central Pacific",
      "Caribbean and Gulf of Mexico",
      "Ascension Island and the South Atlantic",
      "Eastern Mediterranean",
      "Western Indian Ocean and the Red Sea",
      "Pacific coast of Mexico and Central America",
    ],
    habitats: [
      "Seagrass meadow",
      "Coral reef",
      "Coastal lagoon and bay",
      "Open ocean (juveniles)",
      "Sandy nesting beach",
    ],
    elevation: "Surface waters down to around 20 m on routine dives",
    note: "The species is managed as eleven regional management units, each a largely self-contained breeding population. Adults are strongly site-faithful — the same individuals return to the same feeding pastures and the same nesting beaches for decades — which is why regional trends can diverge so sharply from the global one.",
  },

  sections: [
    {
      id: "grazing",
      title: "The sea turtle that eats plants",
      body: [
        "No other sea turtle makes this switch. Hatchlings and small juveniles drift in open water and feed on jellyfish, small invertebrates and whatever floats within reach. Somewhere around the point they recruit to coastal habitat, the gut flora and the diet change together, and the adult becomes an almost exclusive grazer of seagrass and algae.",
        "The jaw shows it. The beak is finely serrated, well suited to cropping blades but useless for the shearing a carnivorous turtle needs. Green turtles graze the same seagrass patches repeatedly rather than moving on, which keeps the blades short, young and higher in nutrients — the same maintenance effect grazing mammals have on grassland.",
        "That makes them one of the few large animals still performing a role that was once far more common. Historical green turtle numbers in the Caribbean alone have been estimated in the tens of millions, and the seagrass meadows of the tropics evolved under a grazing pressure that mostly vanished. Recovering turtle populations are, slowly, restoring it.",
      ],
    },
    {
      id: "navigation",
      title: "Finding a beach across an ocean",
      body: [
        "Green turtles feeding off Brazil nest on Ascension Island, a volcanic speck in the middle of the South Atlantic, roughly 2,300 km away. They do it repeatedly, over decades, and they return to the beach where they themselves hatched — natal homing, which has been confirmed genetically by the distinct genetic signatures different rookeries carry.",
        "The working explanation is magnetic. Hatchlings appear to imprint on the geomagnetic signature of their natal beach, and adults use the Earth's field as both a compass and a coarse map, reading field intensity and inclination to work out roughly where they are. Close in, other cues — smell, wave direction, coastal features — refine the approach.",
        "The consequence for conservation is severe. A turtle will not simply nest somewhere else if its beach is built on, lit up or eroded away. Losing a rookery means losing the breeding line that used it, which is why beach protection has mattered more than almost any other intervention.",
      ],
    },
    {
      id: "nesting",
      title: "Nesting, and sand that decides sex",
      body: [
        "A nesting female hauls out after dark, digs a body pit, then excavates a flask-shaped chamber with her rear flippers, lays around 110 eggs, covers and camouflages the site and returns to the sea. She will do this three to five times in a season, then not nest again for two to four years.",
        "Sex is set by the temperature of the sand. The pivotal temperature for green turtles is close to 29.3 °C: cooler nests produce males, warmer nests females. That has made the species an unusually direct barometer of warming, and the readings are not good — work published in 2018 on turtles from the northern Great Barrier Reef found that over 99% of the juveniles originating from those rookeries were female, with nest temperatures at Raine Island having sat above the pivotal point since the early 1990s.",
        "Hatchlings emerge together, usually at night, and orient towards the brightest, lowest horizon — historically the sea. Artificial lighting inverts that cue and draws them inland, which is why beachfront lighting ordinances are a standard part of sea turtle protection.",
      ],
    },
    {
      id: "recovery",
      title: "How the status changed",
      body: [
        "The green turtle was assessed as Endangered in 2004 and stayed there for two decades. In the Red List update published in October 2025 it was moved directly to Least Concern, skipping Vulnerable and Near Threatened, on the strength of a global population increase of roughly 28% since the 1970s.",
        "Nothing exotic caused the recovery. International trade in turtle shell and meat was closed off under CITES; nesting beaches were protected and, in many countries, patrolled by the communities that had previously harvested them; and turtle excluder devices were made mandatory in shrimp trawls in a number of major fisheries. All of it is slow-acting — a turtle protected as an egg in 1980 was not going to nest until well into this century — which is precisely why the results are only now visible.",
        "The global category is a summary, not a description of every population. The eleven subpopulations are assessed individually, and several are not doing well: the Central South Pacific is Endangered with fewer than 6,000 mature turtles, the East Pacific and North Indian Ocean are Vulnerable, and the Mediterranean and Central West Pacific are Near Threatened. Declining hatchling production in the Southwest Pacific was flagged as a specific concern in the same update.",
      ],
    },
    {
      id: "threats",
      title: "What still threatens them",
      body: [
        "Fisheries bycatch remains the largest single source of adult mortality — trawls, gillnets and longlines drown turtles that cannot reach the surface. Direct take of eggs and adults continues in parts of the range, legally in some places and not in others.",
        "Coastal development erodes and lights the beaches the species cannot replace, and rising sea levels threaten low-lying rookeries outright. Warming sand skews sex ratios further female, and while a population can tolerate a strong female bias for a while — one male fertilises many clutches — the trend has no obvious ceiling.",
        "Fibropapillomatosis, a tumour disease associated with a herpesvirus, causes growths on the eyes, flippers and internal organs and is most prevalent in green turtles feeding in degraded, nutrient-loaded coastal water. Plastic ingestion and entanglement in discarded fishing gear round out a list that is, notably, almost entirely made by people — and therefore almost entirely fixable.",
      ],
    },
  ],

  related: ["saltwater-crocodile", "komodo-dragon"],
  tags: ["turtle", "marine", "herbivore", "migration", "conservation success", "reptile"],
  searchTerms: ["chelonia mydas", "green turtle", "sea turtle", "seagrass grazer", "black sea turtle"],

  faqs: [
    {
      q: "Are green sea turtles still endangered?",
      a: "Not globally. In the IUCN Red List update published in October 2025 the species was moved from Endangered, a status it had held since 2004, directly to Least Concern, following a global population increase of roughly 28% since the 1970s. Several of its eleven regional subpopulations are still threatened, however — the Central South Pacific is Endangered, and the East Pacific and North Indian Ocean are Vulnerable — and under United States law several distinct population segments remain listed as endangered.",
    },
    {
      q: "Why are they called green sea turtles?",
      a: "Because of the colour of their fat, not their shell. The layer of fat between the internal organs and the carapace has a greenish tint, which comes from their diet of seagrass and algae. The shell itself is usually brown, olive or black, often with a radiating pattern.",
    },
    {
      q: "What do green sea turtles eat?",
      a: "Adults are almost entirely herbivorous, cropping seagrass and algae — they are the only sea turtle with that diet. Juveniles are carnivorous, feeding on jellyfish and small invertebrates in open water, and switch to plants when they move into shallow coastal feeding grounds.",
    },
    {
      q: "How do green sea turtles find the beach where they were born?",
      a: "Mainly by magnetism. Hatchlings appear to imprint on the geomagnetic signature of their natal beach, and adults use field intensity and inclination as a coarse map to navigate back across open ocean, with smell and local cues guiding the final approach. Turtles feeding off Brazil use this to reach Ascension Island, about 2,300 km away.",
    },
    {
      q: "Does sand temperature really determine a turtle's sex?",
      a: "Yes. The pivotal temperature for green turtles is around 29.3 °C — cooler nests produce males, warmer nests females. It is already having an effect: research published in 2018 found that over 99% of juvenile green turtles originating from the northern Great Barrier Reef rookeries were female, because nest temperatures at Raine Island have exceeded the pivotal point since the early 1990s.",
    },
  ],

  seo: {
    title: "Green Sea Turtle — Diet, Migration, Nesting & 2025 Red List Status",
    description:
      "A researched profile of the green sea turtle (Chelonia mydas): the only herbivorous sea turtle, its ocean-crossing navigation, temperature-set sex ratios, and its 2025 downlisting from Endangered to Least Concern.",
    keywords: [
      "green sea turtle facts",
      "chelonia mydas",
      "green turtle conservation status",
      "sea turtle migration",
      "green turtle diet",
    ],
  },

  sources: [
    {
      label: "Chelonia mydas — Red List assessment (global, 2025)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/4615/285108125",
    },
    {
      label: "Green sea turtle improves in status from Endangered to Least Concern — Red List update",
      publisher: "IUCN (press release, 10 October 2025)",
      url: "https://iucn.org/press-release/202510/arctic-seals-threatened-climate-change-birds-decline-globally-iucn-red-list",
    },
    {
      label: "Red List assessments for marine turtles and their subpopulations",
      publisher: "IUCN SSC Marine Turtle Specialist Group",
      url: "https://www.iucn-mtsg.org/statuses",
    },
    {
      label: "Green turtle species profile",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/green-turtle",
    },
  ],

  updatedAt: "2026-07-29",
};

export default greenSeaTurtle;
