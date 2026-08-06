// Sailfish — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const sailfish = {
  slug: "sailfish",
  category: "fish",
  name: "Sailfish",
  scientificName: "Istiophorus platypterus",
  otherNames: ["Indo-Pacific sailfish", "Atlantic sailfish", "Bayonetfish"],

  summary:
    "Routinely called the fastest fish in the sea on the strength of a single 1920s measurement — and genuinely remarkable for reasons that have nothing to do with that number.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Istiophorus_platypterus_101956558.jpg",
    alt: "An Indo-Pacific sailfish photographed in the eastern Pacific off Central America",
    credit: "Robert Webster / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/65/Istiophorus_platypterus_313572306.jpg",
      alt: "A sailfish showing the long spear-like upper jaw and the dark line of the folded dorsal fin",
      credit: "Vsevolod / Wikimedia Commons",
      title: "The bill is a tool, not a weapon",
      caption:
        "Sailfish do not spear prey. The bill is swept sideways through a bait ball to tap and slash at individual fish, injuring several at a time. Only about a quarter of attacks actually catch anything — but almost all of them wound, and the wounds accumulate.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Istiophorus_platypterus_in_a_tank.jpg/1920px-Istiophorus_platypterus_in_a_tank.jpg",
      alt: "A live sailfish swimming in a large aquarium tank at Aquamarine Fukushima in Japan",
      credit: "出羽雀台 / Wikimedia Commons",
      title: "Rarely seen alive and still",
      caption:
        "Very few aquariums have ever held a sailfish — the species is fragile, needs enormous volume and does not tolerate walls. Most photographs of sailfish are of dead fish on a dock, which is part of why so much of what people think they know about their speed comes from fishing rather than from biology.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Istiophorus_platypterus_in_an_aquarium.jpg/1920px-Istiophorus_platypterus_in_an_aquarium.jpg",
      alt: "A sailfish in an aquarium tank in Japan, its tall dorsal fin partly raised",
      credit: "出羽雀台 / Wikimedia Commons",
      title: "The sail, up",
      caption:
        "The dorsal fin folds flat into a groove along the back at speed and is raised at low speed — while herding prey, and at the surface after or before a burst. That pattern is the basis for the leading hypothesis that the sail is partly a heat exchanger as well as a hunting aid.",
    },
  ],

  headline: "Not 110 km/h, and better than that anyway",
  intro: [
    "Almost every list of the fastest animals puts the sailfish at the top of the fish, usually at 110 km/h or 68 mph. That figure traces back to a single measurement made at a Florida fishing camp in the 1920s, in which a hooked sailfish was recorded stripping about 90 metres of line from a reel in three seconds. It has been repeated ever since without ever being reproduced.",
    "Modern work does not support it. Measuring the twitch contraction time of the anaerobic swimming muscle — the physical ceiling on how fast a fish can beat its tail — gives sailfish a maximum around 8.3 metres per second, roughly 30 km/h. Above 10 to 15 m/s, cavitation bubbles would form and collapse against the fins and destroy the tissue, which sets a hard upper bound well below the headline number.",
    "None of that makes the animal less interesting. A sailfish carries a heater organ that keeps its brain and eyes warm in cold water, hunts sardines in loose groups that take turns at the bait ball without any coordination, and grows fast enough that a maximum recorded age of thirteen years covers a fish three and a half metres long.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Istiophoriformes",
    family: "Istiophoridae",
    genus: "Istiophorus",
    species: "Istiophorus platypterus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2021,
    populationTrend: "decreasing",
    populationEstimate:
      "No global count; the assessment is based on inferred declines in abundance indices across the Atlantic, Indian and Pacific Oceans over three generations",
    note: "Assessed as Vulnerable under criterion A2bd on 1 May 2021 and published in the 2022 Red List. The IUCN treats sailfish as a single cosmopolitan species, Istiophorus platypterus, while FishBase and some fisheries bodies still separate an Atlantic sailfish, I. albicans; the assessment covers both. Most sailfish are taken as bycatch on tuna longlines rather than targeted, and the recreational fishery is now largely catch-and-release, so the pressure that matters is the industrial one. An older Vulnerable listing from 2006 still circulates on some sites.",
  },

  measurements: [
    {
      key: "swimming-speed",
      label: "Maximum swimming speed",
      value: "Around 30 km/h; a physical ceiling of 36–54 km/h",
      min: 30,
      max: 54,
      unit: "km/h",
      note: "Muscle-contraction measurements give a mean maximum of 8.3 m/s (about 30 km/h), and cavitation damage to the fins sets an absolute limit at 10–15 m/s (36–54 km/h). The familiar 110 km/h figure comes from one 1920s measurement of line stripped from a reel and is not supported",
    },
    {
      key: "length",
      label: "Length",
      value: "Commonly 2–2.5 m; up to about 3.5 m",
      min: 2,
      max: 3.48,
      unit: "m",
      note: "FishBase gives a maximum of 348 cm fork length. A substantial part of that is the bill, which is measured as part of total length in most published records",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Usually 30–60 kg; up to about 100 kg",
      min: 30,
      max: 100,
      unit: "kg",
      note: "FishBase lists a maximum published weight of 100.2 kg. Atlantic fish are generally smaller than Indo-Pacific ones",
    },
    {
      key: "attack-success",
      label: "Attacks that catch a sardine",
      value: "About 24%",
      min: 24,
      max: 24,
      unit: "%",
      note: "From high-speed video of group hunts on sardine schools. Around 95% of attacks injure at least one fish even when none is caught, and those injuries make later attacks by other sailfish more likely to succeed",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "Surface to about 200 m",
      min: 200,
      max: 200,
      unit: "m",
      note: "FishBase gives 0–200 m. Sailfish stay mostly above the thermocline, and where the oxygen minimum layer sits shallow their vertical habitat is compressed into a narrow surface band",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 13 years",
      min: 4,
      max: 13,
      unit: "years",
      note: "FishBase gives a maximum reported age of 13. Sailfish grow extremely fast and die young compared with marlin, which is why the species is more resilient to fishing than its size suggests",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — sardines, anchovies, mackerel and squid, mostly taken from schools", icon: "Fish" },
    { key: "thermoregulation", label: "Thermoregulation", value: "Cranial endothermy — a modified eye muscle warms the brain and eyes", icon: "Thermometer" },
    { key: "schooling-behaviour", label: "Schooling", value: "Hunts in loose groups of up to about 70, taking turns at a bait ball rather than coordinating", icon: "Users" },
    { key: "movement", label: "Movement", value: "Highly migratory, following warm surface water", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "reproduction", label: "Reproduction", value: "Broadcast spawner in warm surface water; no parental care", icon: "Egg" },
    { key: "ocean-range", label: "Ocean range", value: "Tropical and subtropical Atlantic, Indian and Pacific Oceans, plus the Mediterranean", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Fast pelagic predator of schooling baitfish", icon: "Crosshair" },
  ],

  highlights: ["swimming-speed", "length", "weight", "attack-success"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "Eastern Pacific from Baja California to Peru",
      "Western Pacific and the Coral Triangle",
      "Indian Ocean and the Arabian Sea",
      "Gulf of Mexico and the Florida Straits",
      "West African coast",
      "Mediterranean Sea",
    ],
    habitats: ["Open ocean above the thermocline", "Coastal and island waters", "Warm-water frontal zones"],
    elevation: "Surface waters to about 200 m",
    note: "Circumtropical, ranging into temperate water in summer — roughly 45–50°N to 35–40°S in the western Pacific, with narrower limits in the east. It reached the Mediterranean through the Suez Canal as a Lessepsian migrant. Sailfish concentrate where currents and temperature fronts push baitfish into dense schools, which is why the great aggregations off Isla Mujeres in Mexico and Kenya's coast are seasonal and predictable.",
  },

  sections: [
    {
      id: "speed",
      title: "Where the 110 km/h came from, and why it is wrong",
      body: [
        "The number originates at the Long Key Fishing Camp in Florida in the 1920s. A hooked sailfish ran, someone timed how long it took to take about ninety metres of line off a reel, and the arithmetic gave roughly 68 miles per hour. That is the entire evidential basis for the most repeated claim about this animal.",
        "There are obvious problems with it. A fish running against drag is not swimming freely; line stripped from a spool is not the same as distance travelled by the fish; and there is no independent record of the run. But the figure was memorable, it entered reference books, and it has been recycled for a century.",
        "The best modern estimate comes from muscle physiology. The twitch contraction time of anaerobic white muscle sets how fast the tail can beat, and combined with stride length that gives a ceiling on speed. Applied to sailfish, barracuda, little tunny and dorado, the method put sailfish highest of the four at a mean of 8.3 metres per second — about 30 km/h. It also identified a hard limit: above roughly 10 to 15 m/s, water pressure at the fin surfaces drops low enough for cavitation bubbles to form and collapse, and the resulting damage would strip fin tissue. That gives an absolute ceiling of 36 to 54 km/h, and nothing in the animal's anatomy suggests it operates near it.",
        "Separate high-speed video of sailfish actually hunting found them attacking sardines at moderate speeds, using precision with the bill rather than raw velocity. Sailfish are fast. They are not three times faster than a great white shark.",
      ],
    },
    {
      id: "the-sail",
      title: "What the sail is for",
      body: [
        "The first dorsal fin is enormous — taller at its midpoint than the body is deep — and it folds flat into a groove along the back when the fish is moving quickly. That alone tells you it is not a swimming aid: a permanently erect fin of that size would be a serious drag penalty.",
        "The leading hypothesis is thermal. The sail carries a dense network of blood vessels, and sailfish raise it at or near the surface before and after high-speed bursts. Circulating blood through a large, thin, vascularised surface in warm surface water is an efficient way to move heat, and a fish that has just worked its muscle hard has heat to manage.",
        "It is also used in hunting. When sailfish herd a bait ball, they raise the sail, which makes the fish appear far larger and helps compress the school. Colour comes into it too: sailfish flush and fade in bands of iridescent blue during attacks, a change driven by rapid nervous control of pigment cells, and there is evidence it signals to other sailfish in the group and may startle the prey.",
      ],
    },
    {
      id: "group-hunting",
      title: "Taking turns without cooperating",
      body: [
        "Sailfish hunting sardines off the Yucatán have been filmed in detail, and what they do is unusual. Groups of up to about seventy fish work a single bait ball, and they attack one at a time rather than simultaneously — alternating rather than coordinating.",
        "Each attack is a sideways sweep of the bill through the school, tapping and slashing. It catches a fish only about 24% of the time. But roughly 95% of attacks injure sardines without catching them, and those injuries accumulate: the more attacks a school has absorbed, the more damaged fish it contains, and the faster subsequent attacks succeed.",
        "That is the interesting part. Each sailfish benefits from the attacks the others have already made, without any of them doing anything cooperative — no signalling, no division of roles, no coordination in space. Individuals in groups catch prey faster than individuals hunting alone purely as a by-product of everyone else's effort. Researchers have called it proto-cooperation, and it is a plausible route by which genuine group hunting could evolve.",
      ],
    },
    {
      id: "warm-brain",
      title: "A warm brain in cold water",
      body: [
        "Sailfish are billfish, and billfish carry a specialised heat exchanger that mammals would recognise the logic of. One of the eye muscles has been modified into a thermogenic organ, packed with mitochondria, that generates heat and delivers it to the brain and the retina through an insulated blood supply.",
        "The point is not comfort. Nerve conduction and retinal response slow sharply as temperature falls, so a cold-blooded predator dropping through a thermocline loses visual acuity exactly when it is chasing fast prey in dim light. Keeping the eyes and brain warm holds temporal resolution — the ability to resolve rapid movement — where it needs to be.",
        "This is a different system from the whole-body regional endothermy of tuna and lamnid sharks, which warms the swimming muscle. A sailfish's body runs at water temperature. Only the head is heated, and only where the heating buys something.",
      ],
    },
    {
      id: "fisheries",
      title: "Bycatch, sport and status",
      body: [
        "Sailfish are not a major target species. They are less valuable than tuna and less prized than marlin, and the great majority of commercial catch is incidental — taken on tuna longlines set for something else, and often discarded or landed as a secondary product. Artisanal gillnet fisheries in parts of the Indian Ocean and Southeast Asia take substantial numbers.",
        "The recreational fishery is the opposite case. Sailfish are among the most sought-after game fish in the world, and destinations from Guatemala to Kenya to Isla Mujeres are built around them, but the ethic there has moved decisively to catch-and-release, with tagging programmes supplying much of the movement data that exists for the species.",
        "The 2021 assessment moved on inferred declines across all three oceans over three generations. Sailfish have two things going for them: they grow very fast, and they mature early, which makes them more able to absorb fishing pressure than a slow-maturing billfish. What they do not have is a fishery managed for their sake — quotas that constrain longline effort are set for tuna, and sailfish take whatever follows from that.",
      ],
    },
  ],

  related: ["atlantic-bluefin-tuna", "hammerhead-shark", "great-white-shark", "atlantic-cod"],
  tags: ["billfish", "marine", "bony fish", "pelagic", "predator", "vulnerable"],
  searchTerms: ["istiophorus platypterus", "sailfish speed", "fastest fish", "indo-pacific sailfish", "atlantic sailfish"],

  faqs: [
    {
      q: "Is the sailfish really the fastest fish in the ocean?",
      a: "Probably not at the speed usually quoted. The famous 110 km/h figure comes from a single 1920s measurement of line stripped from a fishing reel and has never been reproduced. Estimates from the contraction speed of the swimming muscle put the sailfish's maximum at about 8.3 m/s — roughly 30 km/h — and cavitation damage to the fins sets an absolute ceiling around 36 to 54 km/h. Sailfish are still among the fastest fish measured by that method.",
    },
    {
      q: "What is a sailfish's sail for?",
      a: "Most likely heat management and hunting, not swimming. It folds flat into a groove at speed, so it is not there for propulsion. The fin carries a dense blood-vessel network and is raised at the surface around high-speed bursts, which fits a role in shedding or gaining heat, and sailfish also raise it to look larger while herding bait fish into a tight ball.",
    },
    {
      q: "Do sailfish spear their prey with the bill?",
      a: "No. They sweep the bill sideways through a school, tapping and slashing at individual fish. Only about a quarter of attacks actually catch a sardine, but around 95% injure one or more, and those injuries make the school progressively easier for the next attacker to exploit.",
    },
    {
      q: "Do sailfish hunt cooperatively?",
      a: "Not in the strict sense. Groups of up to about seventy attack a bait ball one at a time rather than together, with no signalling or division of roles. Each fish still benefits, because the injuries left by earlier attacks make later ones more likely to succeed. Researchers describe this as proto-cooperation — a benefit of grouping that emerges without any coordination.",
    },
    {
      q: "Are sailfish endangered?",
      a: "They are listed as Vulnerable, on an assessment made in 2021 and published in 2022, based on inferred declines across the Atlantic, Indian and Pacific Oceans. Most are caught incidentally on tuna longlines rather than targeted; the recreational fishery is largely catch-and-release. Fast growth and early maturity make the species more resilient than most large billfish.",
    },
  ],

  seo: {
    title: "Sailfish — How Fast It Really Swims, the Sail & Hunting",
    description:
      "A researched profile of the sailfish (Istiophorus platypterus): where the 110 km/h claim came from and what modern measurements show, what the sail is for, group hunting on bait balls, cranial endothermy and Vulnerable status.",
    keywords: [
      "sailfish facts",
      "istiophorus platypterus",
      "how fast is a sailfish",
      "fastest fish in the ocean",
      "sailfish sail",
    ],
  },

  sources: [
    {
      label: "Istiophorus platypterus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/170338/46649664",
    },
    {
      label: "Istiophorus platypterus — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/77",
    },
    {
      label: "Maximum swimming speeds of sailfish and three other large marine predatory fish species: a myth revisited",
      publisher: "Svendsen et al., Biology Open (2016)",
      url: "https://journals.biologists.com/bio/article/5/10/1415/1485/Maximum-swimming-speeds-of-sailfish-and-three",
    },
    {
      label: "Proto-cooperation: group hunting sailfish improve hunting success by alternating attacks on grouping prey",
      publisher: "Herbert-Read et al., Proceedings of the Royal Society B (2016)",
      url: "https://royalsocietypublishing.org/doi/full/10.1098/rspb.2016.1671",
    },
  ],

  updatedAt: "2026-07-29",
};

export default sailfish;
