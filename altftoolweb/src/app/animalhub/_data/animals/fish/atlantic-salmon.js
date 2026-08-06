// Atlantic salmon — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const atlanticSalmon = {
  slug: "atlantic-salmon",
  category: "fish",
  name: "Atlantic Salmon",
  scientificName: "Salmo salar",
  otherNames: ["Salmon", "Grilse", "Kelt", "Bay salmon"],

  summary:
    "A fish that is born in a river, grows up in the North Atlantic and finds its way back to the same stretch of gravel to spawn — and whose wild population has fallen far enough to be listed as Near Threatened.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/8/82/Wst_atlantischer_lachs_stoer_001.jpg",
    alt: "A male Atlantic salmon in dark spawning colours with a hooked lower jaw, caught by rod on the River Stör in Schleswig-Holstein, Germany",
    credit: "User:Wolfgang Striewski / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Atlantic_Salmon_-_geograph.org.uk_-_202879.jpg",
      alt: "An angler holding an Atlantic salmon in the shallows of the River Lyn, about to release it back into the water",
      credit: "Rupert Fleetingly / Wikimedia Commons",
      title: "Caught, measured, returned",
      caption:
        "Rod fisheries across the species' range have moved almost entirely to catch-and-release, and in many rivers it is now compulsory. Rod catch records are also the longest continuous dataset on salmon abundance anywhere, which is how the scale of the decline became visible.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Atlantic_Salmon_Adults_%285198590842%29.jpg",
      alt: "Adult Atlantic salmon swimming in a holding pool at a hatchery on the Penobscot River, Maine, before artificial spawning",
      credit: "U.S. Fish and Wildlife Service Northeast Region / Wikimedia Commons",
      title: "Broodstock on the Penobscot",
      caption:
        "The Gulf of Maine population is propped up by hatcheries: adults are held and stripped, and the young are stocked into rivers that no longer produce enough wild fish. Unlike Pacific salmon these adults need not die after spawning, so they are returned to the river to go back to sea.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Atlantic_salmon_at_the_Craig_Brook_National_Fish_Hatchery_%2823133898042%29.jpg/1920px-Atlantic_salmon_at_the_Craig_Brook_National_Fish_Hatchery_%2823133898042%29.jpg",
      alt: "Adult Atlantic salmon in a holding tank at the Craig Brook National Fish Hatchery in Maine",
      credit: "U. S. Fish and Wildlife Service - Northeast Region / Wikimedia Commons",
      title: "Silver at sea, coloured in the river",
      caption:
        "At sea a salmon is plain silver with a few dark spots — countershading for open water. Returning fish darken, bronze and, in males, grow the hooked lower jaw called a kype, all of it driven by the hormonal shift that shuts down feeding and starts the run upriver.",
    },
  ],

  headline: "The leaper, and what is left of it",
  intro: [
    "Salmo salar means salmon the leaper, and the leap is the part everyone knows: a fish throwing itself up a waterfall against the current, using the standing wave at the foot of the fall for lift. What that leap is in aid of is a life split between two incompatible worlds — two or three years in a cold river, one to three years in the North Atlantic, and a return to the exact tributary it hatched in.",
    "The wild fish and the farmed fish are not the same story and should never be told as one. Farmed Atlantic salmon is one of the most abundant food animals in the northern hemisphere. Wild Atlantic salmon has been moved from Least Concern to Near Threatened on the IUCN Red List after a 23 per cent fall in the global population between 2006 and 2020, and the farms are among the reasons.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Salmoniformes",
    family: "Salmonidae",
    genus: "Salmo",
    species: "Salmo salar",
  },

  conservation: {
    status: "NT",
    assessmentYear: 2022,
    populationTrend: "decreasing",
    populationEstimate:
      "No single global count; the global population is estimated to have fallen by 23% between 2006 and 2020, and the species now occupies a fraction of the rivers it held a century ago",
    note: "Assessed in 2022 and published in the December 2023 Red List update, which moved the species from Least Concern to Near Threatened. The listing refers to wild populations only and says nothing about farmed stock, which is abundant. The Gulf of Maine distinct population segment has been listed as Endangered under the US Endangered Species Act since 2000, with its range extended in 2009; returns to Maine rivers have averaged under 1,200 fish a year since 2015.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "0.7–1.5 m",
      min: 0.7,
      max: 1.5,
      unit: "m",
      note: "Sea-run adults returning to rivers are usually 70–90 cm; the largest on record was 160.65 cm, netted in Norway in 1925",
    },
    {
      key: "weight",
      label: "Weight",
      value: "3.5–15 kg",
      min: 3.5,
      max: 46.8,
      unit: "kg",
      note: "FishBase carries a maximum published weight of 46.8 kg; a 49.44 kg fish netted off Scotland in 1960 is the heaviest ever reported",
    },
    {
      key: "migration-distance",
      label: "Migration distance",
      value: "Up to around 4,000 km each way",
      min: 2000,
      max: 4000,
      unit: "km",
      note: "European and North American fish share feeding grounds off West Greenland and in the Norwegian Sea",
    },
    {
      key: "leap-height",
      label: "Leap height",
      value: "More than 3 m",
      min: 3,
      max: 3,
      unit: "m",
      note: "Much of the lift comes from the standing wave at the foot of a fall rather than from the fish alone; larger figures circulate but are hard to verify",
    },
    {
      key: "dive-depth",
      label: "Maximum depth at sea",
      value: "To about 210 m",
      min: 210,
      max: 210,
      unit: "m",
      note: "Most time at sea is spent in the top 10–25 m",
    },
    {
      key: "sexual-maturity",
      label: "Age at first spawning",
      value: "Usually 3–6 years",
      min: 3,
      max: 6,
      unit: "years",
      note: "Two to three years in fresh water, then one to three winters at sea; fish returning after a single sea winter are called grilse",
    },
    {
      key: "clutch-size",
      label: "Eggs per female",
      value: "Several thousand, in proportion to the size of the female",
      unit: "eggs",
      note: "Buried in a gravel nest, the redd, which the female cuts with her tail",
    },
    {
      key: "repeat-spawning",
      label: "Adults that survive to spawn again",
      value: "About 5–10%",
      min: 5,
      max: 10,
      unit: "%",
      note: "Unlike Pacific salmon, Atlantic salmon are not programmed to die after spawning; the survivors, called kelts, drop back to sea",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Usually 4–6 years; up to 13",
      min: 4,
      max: 13,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — insects and invertebrates as a parr, fish and crustaceans at sea; stops feeding on the spawning run", icon: "Fish" },
    { key: "water-type", label: "Water type", value: "Anadromous — fresh water to spawn, salt water to grow", icon: "Droplet" },
    { key: "movement", label: "Movement", value: "Two long migrations in a lifetime, one out and one back", icon: "Navigation" },
    { key: "homing", label: "Homing", value: "Returns to its natal river; roughly 5% of fish stray to another", icon: "Compass" },
    { key: "schooling-behaviour", label: "Schooling", value: "Territorial as a river parr; shoals at sea and in estuaries", icon: "Users" },
    { key: "breeding-season", label: "Spawning season", value: "Late autumn and early winter, in clean river gravel", icon: "Calendar" },
    { key: "ocean-range", label: "Ocean range", value: "North Atlantic, chiefly the Norwegian Sea and the waters off West Greenland", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Carries marine nutrients far inland; prey for seals, otters and eagles", icon: "Leaf" },
  ],

  highlights: ["length", "weight", "migration-distance", "repeat-spawning"],

  distribution: {
    continents: ["Europe", "North America"],
    regions: [
      "Norway and the Norwegian Sea",
      "Scotland, Ireland and Iceland",
      "White and Barents Sea rivers, Russia",
      "The Baltic basin",
      "Eastern Canada, from Quebec to the Bay of Fundy",
      "Central and eastern Maine, United States",
      "West Greenland feeding grounds",
    ],
    habitats: ["Cold, clean, gravel-bedded rivers", "Estuaries", "Open North Atlantic"],
    elevation: "Sea level to upland river headwaters, and to about 210 m below the ocean surface",
    note: "Historically the species ran up nearly every suitable river on both sides of the North Atlantic, as far south as Portugal in Europe and the Hudson in North America. It is now absent or nearly so from most of the southern range. Land-locked populations, such as those of Lake Ontario and several Scandinavian lakes, complete the whole cycle in fresh water. The species has also been introduced far outside its range, notably to Chile, where it is farmed.",
  },

  sections: [
    {
      id: "life-cycle",
      title: "Six names for one fish",
      body: [
        "No other North Atlantic fish changes so much that each stage needed its own word. Eggs laid in autumn gravel hatch into alevins that stay buried, living off a yolk sac. Emerging as fry, they become parr — small, territorial, marked with dark vertical bars that break up their outline in dappled river light — and hold a patch of streambed for two or three years.",
        "Then comes smoltification, the most demanding transformation of the lot. Over a few weeks in spring the parr turns silver, the bars fade, the body slims, and the gills, kidneys and gut rebuild themselves to pump salt out rather than hold it in. A fish adapted to fresh water becomes one adapted to the sea, and then rides the current down to it.",
        "After one to three winters feeding in the North Atlantic the adult returns. A fish coming back after a single sea winter is a grilse, smaller and more numerous; multi-sea-winter fish are the large ones. Once spawning is over, a survivor becomes a kelt, thin and battered, and drops back downstream to feed and possibly do it all again.",
      ],
    },
    {
      id: "homing",
      title: "Finding one river out of thousands",
      body: [
        "The navigation happens in two stages using two different senses. Out in the open ocean, where there is nothing to smell, the fish appears to use the Earth's magnetic field, holding a course by inclination and intensity in the way a migrating bird does.",
        "Close to the coast, smell takes over. As a parr and again as a smolt the fish imprints on the chemical signature of its home water — a specific mixture of dissolved organic compounds, minerals and plant matter that differs between one tributary and the next — and then follows that scent trail upstream against the flow. It works well enough that only around five per cent of returning fish end up in the wrong river.",
        "That small stray rate is not a failure. It is how salmon colonise new rivers after glaciers retreat or dams come down, and it is the reason a river can be recolonised at all once it is made passable again.",
      ],
    },
    {
      id: "the-leap",
      title: "The leap",
      body: [
        "A returning salmon stops feeding. Everything it does upstream is paid for out of fat laid down at sea, which is why the run is a race against its own reserves and why obstacles matter so much.",
        "The famous leap clears more than three metres in the best conditions, but the fish is not doing it alone. At the foot of a fall, water plunging into the pool creates a standing wave, and the salmon launches out of the upward-moving part of it — using the river's energy rather than only its own. Where a weir or dam produces a flat, fast sheet of water with no such wave, a fish that could clear a natural fall of the same height is stopped dead, which is the whole rationale behind fish passes and dam removal.",
      ],
    },
    {
      id: "farmed-and-wild",
      title: "The farmed fish is not the wild fish",
      body: [
        "Farmed Atlantic salmon is one of the most produced food animals in the northern hemisphere, and the two things share a species name and very little else. Conflating them makes the wild population look healthy when it is not.",
        "Sea cages sited on migration routes concentrate sea lice, a naturally occurring parasite, at densities wild fish never evolved with. Smolts leaving a river must swim past the cages on their way out, and a heavy louse load on a fish weighing a few dozen grams is often fatal.",
        "Escapes are the second problem. Farmed fish are selectively bred for growth in captivity, and when large numbers escape and spawn with wild fish the offspring are less well suited to river life. Genetic surveys in Norway have found farmed ancestry in wild populations across most rivers examined. A single Washington State net-pen failure in 2017 released up to 300,000 fish at once.",
        "None of this makes farming avoidable or wholly negative — it takes pressure off wild capture fisheries — but a farmed salmon in a supermarket is not evidence about the state of the wild species, and the Red List assessment covers only the latter.",
      ],
    },
    {
      id: "threats",
      title: "Why the wild fish is Near Threatened",
      body: [
        "The largest single historical cause was physical: dams and weirs cut fish off from spawning gravel. Over 90 per cent of the historical habitat in Maine sits above a barrier of some kind, and the pattern repeats across Europe. Removing barriers works — the Penobscot restoration and Europe's growing tally of demolished weirs both produced measurable returns — but it is slow and expensive.",
        "The newer problem is at sea. Marine survival has fallen sharply since the 1990s for reasons that are not fully understood but clearly involve a warming, shifting North Atlantic: prey species moving north, plankton communities changing, and salmon arriving on feeding grounds that no longer hold what they used to. Commercial catches fell from about four million fish a year to 700,000 between 1979 and 1990, and the decline in abundance has continued since.",
        "Add sea lice and genetic introgression from farms, pollution and siltation of spawning gravel, and mixed-stock netting off West Greenland and the Faroes, and the 23 per cent global decline between 2006 and 2020 that prompted the reassessment stops looking like a mystery.",
      ],
    },
  ],

  related: ["atlantic-bluefin-tuna", "great-white-shark", "ocean-sunfish", "coelacanth"],
  tags: ["salmon", "anadromous", "migration", "freshwater", "marine", "near threatened"],
  searchTerms: ["salmo salar", "wild salmon", "grilse", "smolt", "salmon migration", "salmon leaping"],

  faqs: [
    {
      q: "Is farmed Atlantic salmon the same as wild Atlantic salmon?",
      a: "The same species, but not the same story. Farmed salmon is abundant and is one of the most produced food animals in the northern hemisphere. The wild population is what the IUCN assesses, and it was moved to Near Threatened in 2023 after a 23 per cent decline between 2006 and 2020 — with sea lice from farms and interbreeding with escaped farmed fish among the causes.",
    },
    {
      q: "Do Atlantic salmon die after spawning?",
      a: "Not necessarily, and this is the main difference from Pacific salmon. Around 5 to 10 per cent of Atlantic salmon survive spawning, drop back to sea as kelts, feed up and return to spawn again. The rest die, exhausted, because they stop feeding entirely once they enter fresh water.",
    },
    {
      q: "How do salmon find their way back to the river they were born in?",
      a: "With two senses in sequence. In the open ocean they appear to navigate by the Earth's magnetic field. Nearer the coast they switch to smell, following the specific chemical signature of their home water that they imprinted on as juveniles. Only about five per cent end up in the wrong river.",
    },
    {
      q: "How high can a salmon jump?",
      a: "More than three metres in good conditions. Much of the lift comes from the standing wave at the foot of a waterfall rather than from the fish itself, which is why an artificial weir producing a flat sheet of fast water can stop a fish that would clear a natural fall of the same height.",
    },
    {
      q: "Why is the Atlantic salmon population declining?",
      a: "Dams and weirs cut off spawning habitat — over 90 per cent of the historical habitat in Maine sits above a barrier. Survival at sea has dropped sharply since the 1990s as the North Atlantic warms and prey shifts north. Sea lice and genetic mixing from salmon farms, pollution, and netting on shared feeding grounds add to it.",
    },
  ],

  seo: {
    title: "Atlantic Salmon — Migration, Homing, Farming & Conservation",
    description:
      "A researched profile of the Atlantic salmon (Salmo salar): the parr-to-smolt transformation, magnetic and olfactory homing, the leap, why farmed and wild salmon are different stories, and Near Threatened status.",
    keywords: [
      "atlantic salmon facts",
      "salmo salar",
      "salmon migration",
      "wild vs farmed salmon",
      "salmon life cycle",
    ],
  },

  sources: [
    {
      label: "Salmo salar — Red List assessment (Near Threatened, assessed 2022)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/19855/67373433",
    },
    {
      label: "Freshwater fish highlight escalating climate impacts on species — Red List update, December 2023",
      publisher: "IUCN",
      url: "https://iucn.org/press-release/202312/freshwater-fish-highlight-escalating-climate-impacts-species-iucn-red-list",
    },
    {
      label: "Atlantic salmon (protected) — species profile",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/atlantic-salmon-protected",
    },
    {
      label: "Salmo salar — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Salmo-salar.html",
    },
    {
      label: "Atlantic salmon: a remarkable life cycle",
      publisher: "Fisheries and Oceans Canada",
      url: "https://www.dfo-mpo.gc.ca/species-especes/publications/salmon-saumon/lifecycle-cyclevital/index-eng.html",
    },
  ],

  updatedAt: "2026-07-29",
};

export default atlanticSalmon;
