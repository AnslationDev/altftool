// European eel — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const europeanEel = {
  slug: "european-eel",
  category: "fish",
  name: "European Eel",
  scientificName: "Anguilla anguilla",
  otherNames: ["Common eel", "Yellow eel", "Silver eel", "Glass eel"],

  summary:
    "A fish that grows up in European rivers, crosses the Atlantic to breed in the Sargasso Sea and dies there — a life cycle no one has ever seen completed, in a species that is now Critically Endangered.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/58/Anguilla_anguilla.jpg",
    alt: "A European eel, long and snake-like with a continuous fin running along the back and tail",
    credit: "GerardM / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Anguilla_anguilla_01_by-dpc.jpg/1920px-Anguilla_anguilla_01_by-dpc.jpg",
      alt: "A European eel in the Porma river in León, Spain, its body pressed close to the riverbed",
      credit: "David Perez / Wikimedia Commons",
      title: "A yellow eel, far inland",
      caption:
        "This is the yellow-eel stage, the long feeding phase that occupies most of an eel's life. Eels reach rivers like the Porma hundreds of kilometres from the sea, climbing weirs and moving overland across wet ground, and may stay in fresh water for fifteen or twenty years before turning towards the Atlantic.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/71/Anguilla_anguilla_Belgium_1.jpg",
      alt: "A 90 cm European eel photographed at Esneux in Belgium",
      credit: "vranken martin / Wikimedia Commons",
      title: "Ninety centimetres of one life stage",
      caption:
        "A fish this size is almost certainly a female — males stay much smaller and leave fresh water sooner. When she turns silver, her eyes will roughly double in area for deep-ocean light, her gut will shut down, and she will never feed again.",
    },
  ],

  headline: "Everyone knows where they go; nobody has seen them get there",
  intro: [
    "The European eel spends most of its life as a familiar animal — a long, muscular, nocturnal predator in rivers, lakes, ditches and estuaries from Scandinavia to Morocco, hunting by scent and hiding under stones by day. Then, somewhere between its tenth and twentieth year, it transforms. Its eyes enlarge, its gut degenerates, its skin turns silver, and it leaves fresh water for the open Atlantic and does not eat again.",
    "Where it goes was one of the longest-running unsolved questions in biology. Aristotle concluded eels arose from mud. Freud spent months in Trieste dissecting them in a fruitless search for testes. The Sargasso Sea was identified as the spawning ground a century ago by inference alone, and only in 2022 were adult eels finally tracked there. Nobody has yet observed a European eel spawn, or found one of its eggs in the wild.",
    "Meanwhile the species has collapsed. The number of young eels arriving on European coasts is a small fraction of what it was in the 1970s, and has been for decades. It is Critically Endangered, and scientific advice has been that the catch should be zero — in every habitat, for every life stage — since 2021.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Anguilliformes",
    family: "Anguillidae",
    genus: "Anguilla",
    species: "Anguilla anguilla",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate:
      "No absolute count. ICES measures recruitment against the 1960–1979 average: in 2024 the North Sea glass eel index stood at 0.7% of that baseline and the wider 'elsewhere Europe' index at 12.1%",
    note: "Assessed on 7 November 2018 by the IUCN SSC Anguillid Eel Specialist Group and published in the August 2020 Red List update, which confirmed the Critically Endangered listing the species has carried since the late 2000s. Listed on CITES Appendix II — agreed in 2007 and in force since 2009 — and the EU has banned all import and export of the species since 2010 — which is why the illegal glass eel trade out of Europe to Asian farms became one of the largest wildlife trafficking operations in the world by value. ICES has advised zero catch of all life stages, in all habitats and for all uses, every year since 2021.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Usually 0.45–0.65 m; up to 1.33 m",
      min: 0.45,
      max: 1.33,
      unit: "m",
      note: "FishBase gives a maximum of 133 cm for females and 122 cm for males. Females grow substantially larger and stay in fresh water longer before migrating",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 6.6 kg",
      min: 0.5,
      max: 6.6,
      unit: "kg",
      note: "FishBase maximum published weight; most silver eels leaving European rivers are far lighter",
    },
    {
      key: "migration-distance",
      label: "Migration to the spawning grounds",
      value: "Roughly 5,000–6,000 km each way",
      min: 5000,
      max: 6000,
      unit: "km",
      note: "Satellite-tagged eels leaving the Azores travelled at 3 to 12 km a day; eels from northern European rivers face a considerably longer journey and are thought to take more than a year over it",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "Surface to about 700 m",
      min: 700,
      max: 700,
      unit: "m",
      note: "FishBase gives 0–700 m. Migrating adults make daily vertical movements in the open ocean, running deeper by day and shallower by night",
    },
    {
      key: "recruitment-decline",
      label: "Glass eel recruitment, 2024",
      value: "0.7% of the 1960–1979 average in the North Sea index area",
      min: 0.7,
      max: 12.1,
      unit: "%",
      note: "ICES gives 0.7% for the North Sea index series and 12.1% for the wider 'elsewhere Europe' series. Both have been at a fraction of the baseline since the 1980s with no sustained recovery",
    },
    {
      key: "life-stages",
      label: "Distinct life stages",
      value: "Five",
      min: 5,
      max: 5,
      unit: "stages",
      note: "Leptocephalus, glass eel, elver, yellow eel and silver eel. They look so unlike one another that they were originally described as separate species",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Typically 15–20 years in fresh water",
      min: 15,
      max: 23,
      unit: "years",
      note: "FishBase gives a maximum reported age of 23 in the wild. Eels kept in captivity live far longer — an eel said to have been dropped into a well at Brantevik in southern Sweden in 1859 was reported to have survived there until 2014",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — worms, crustaceans, molluscs, insects and fish; feeding stops entirely before the spawning migration", icon: "Fish" },
    { key: "water-type", label: "Water type", value: "Catadromous — fresh, brackish and salt water at different stages of one life", icon: "Droplet" },
    { key: "life-cycle", label: "Life cycle", value: "Semelparous — spawns once at the end of life and dies", icon: "RefreshCw" },
    { key: "reproduction", label: "Reproduction", value: "Spawns in the Sargasso Sea; spawning has never been observed in the wild", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Transatlantic migration; will also cross wet ground overland between water bodies", icon: "Navigation" },
    { key: "activity", label: "Activity", value: "Nocturnal; hunts largely by scent", icon: "Moon" },
    { key: "ocean-range", label: "Ocean range", value: "North Atlantic, with spawning grounds in the Sargasso Sea", icon: "Globe" },
  ],

  highlights: ["length", "migration-distance", "recruitment-decline", "life-stages"],

  distribution: {
    continents: ["Africa", "Asia", "Europe"],
    regions: [
      "Rivers and coasts from Scandinavia to Morocco",
      "Baltic Sea and its catchments",
      "British and Irish river systems",
      "Mediterranean basin",
      "Black Sea catchments",
      "Sargasso Sea (spawning grounds)",
    ],
    habitats: ["Rivers and streams", "Lakes and lagoons", "Estuaries and coastal waters", "Open ocean"],
    elevation: "From inland headwaters down to about 700 m in the open Atlantic",
    note: "The freshwater range is essentially the whole Atlantic drainage of Europe and North Africa, plus the Mediterranean and Black Sea basins — historically as far inland as eels could climb, which was a very long way. The marine part of the range is the North Atlantic, and the spawning ground is a region of the western Atlantic between roughly 31°N 50°W and 24°N 70°W. The species is treated as one panmictic population: an eel from a Norwegian river and an eel from a Moroccan one breed in the same place, so there are no separate stocks to manage.",
  },

  sections: [
    {
      id: "the-mystery",
      title: "Two thousand years of not knowing",
      body: [
        "Eels presented ancient naturalists with a genuine puzzle. Cut one open at any point in its freshwater life and you find no eggs, no milt and no recognisable gonads — because eels do not develop them until they leave. Aristotle, having looked, concluded that eels were generated spontaneously from mud. Pliny suggested they scraped themselves against rocks and the fragments came alive.",
        "The puzzle survived into the modern era. In 1876 a nineteen-year-old Sigmund Freud was sent to Trieste to settle the question by finding an eel's testes, dissected some four hundred specimens, and found nothing conclusive; he left the field shortly afterwards.",
        "The species' own life history is what made the question so hard. Every eel in a European river is immature. The animals that are ready to breed are already in the middle of the Atlantic, and the ones that have bred are dead.",
      ],
    },
    {
      id: "sargasso",
      title: "The Sargasso Sea, inferred and then confirmed",
      body: [
        "The answer came from working backwards. Between 1904 and 1922 the Danish biologist Johannes Schmidt ran a two-decade survey of the Atlantic, netting the transparent leaf-shaped larvae called leptocephali and recording where the smallest ones were. The size gradient pointed to a single region: the Sargasso Sea, a windless gyre of warm water in the western Atlantic bounded by currents rather than coasts. Nobody had seen an eel there. The inference was that the larvae had to have come from somewhere, and the smallest ones were closest to it.",
        "It took a hundred years to test directly. In 2022 a satellite-tagging study followed 26 adult eels released from rivers in the Azores; twenty-three tags returned data, six of the eels reached the Sargasso Sea and one entered the area thought to be the breeding ground itself. That was the first direct evidence that adult European eels actually make the journey Schmidt's larvae implied.",
        "It is still not the whole answer. No European eel egg has ever been found in the wild, no spawning adult has ever been sampled there, and nobody has watched a European eel breed. A species whose fishery has been regulated for decades, and which is farmed at large scale, has a reproductive act that has never been witnessed.",
      ],
    },
    {
      id: "five-lives",
      title: "Five bodies in one life",
      body: [
        "An eel passes through five forms so different that early naturalists described them as separate species. It hatches in the Sargasso as a leptocephalus — a flat, transparent, leaf-shaped larva that drifts on the Gulf Stream for a year or more. Approaching Europe it condenses into a glass eel: eel-shaped now, but still see-through, and this is the stage that arrives at river mouths in vast numbers, or used to.",
        "Pigmenting up, it becomes an elver and pushes upstream, climbing weirs and wet walls and crossing damp ground overland where it has to. Then comes the yellow eel, the long feeding stage that occupies most of the animal's life — ten, fifteen, twenty years of eating worms, crustaceans, molluscs and fish in a river, lake or ditch.",
        "The last transformation is the strangest. The yellow eel turns silver, its flanks going bright and its back dark. Its eyes roughly double in area and shift in pigment towards blue sensitivity, ready for deep ocean light. Its digestive tract degenerates and it stops feeding permanently. What leaves the river is essentially a swimming fuel tank with gonads that have not yet developed, and it will use the whole crossing to build them.",
      ],
    },
    {
      id: "collapse",
      title: "The collapse",
      body: [
        "Recruitment — the number of glass eels arriving on European coasts each spring — is the measure that matters, because it counts the next generation before anything else has happened to it. Against the 1960–1979 average, ICES put the 2024 North Sea index at 0.7% and the wider European index at 12.1%. The decline is usually summarised as 90 to 98% since the 1970s, and it has now persisted for four decades.",
        "There is no single cause, which is part of why it has been so hard to reverse. Fishing takes eels at every stage, glass eels most valuably. Hydroelectric dams and weirs block upstream migration and kill descending silver eels in turbines. The parasitic nematode Anguillicola crassus, introduced from Asia in the 1980s, damages the swim bladder — the organ a migrating eel needs to control buoyancy across an ocean. Persistent pollutants including PCBs accumulate in the fat that is supposed to fuel the crossing. And shifts in the North Atlantic current system may be changing how many larvae survive the drift.",
        "Because the species is a single interbreeding population, none of this can be managed stock by stock. An eel spawning in the Sargasso may have grown up in Ireland, Italy or Morocco, and a measure that works in one country is diluted by inaction in another.",
      ],
    },
    {
      id: "trade",
      title: "Glass eels and the trafficking problem",
      body: [
        "Eels cannot be bred in captivity at commercial scale. Every farmed eel in the world starts as a wild-caught glass eel, which means eel aquaculture is not an alternative to fishing the species but a form of it.",
        "That fact created one of the largest wildlife trafficking flows on earth. Demand from East Asian farms, where the local species are also depleted, made European glass eels extremely valuable — prices have run into hundreds of euros per kilogram — and the EU responded by banning all import and export of Anguilla anguilla from 2010. What followed was systematic smuggling: glass eels bought in Europe, packed into water-filled bags in suitcases, and flown to Asia to be grown out and sold, sometimes back into European markets as a different species.",
        "Enforcement operations have seized many tonnes over the past decade, and the trade continues. ICES has advised zero catch for all life stages, in all habitats and for all uses, in every year since 2021; catches across Europe have continued at levels well above that advice.",
      ],
    },
  ],

  related: ["electric-eel", "atlantic-salmon", "atlantic-cod", "arapaima"],
  tags: ["eel", "freshwater", "catadromous", "bony fish", "critically endangered", "migration"],
  searchTerms: ["anguilla anguilla", "common eel", "glass eel", "elver", "sargasso sea", "silver eel"],

  faqs: [
    {
      q: "Where do European eels breed?",
      a: "In the Sargasso Sea, a warm gyre in the western Atlantic. Johannes Schmidt inferred it between 1904 and 1922 by mapping where the smallest larvae were found, and a 2022 satellite-tagging study finally followed adult eels there from the Azores. No eel egg has ever been found in the wild, no spawning adult has ever been sampled in the Sargasso, and nobody has observed a European eel spawn.",
    },
    {
      q: "Why are European eels Critically Endangered?",
      a: "The number of young eels reaching Europe has fallen by roughly 90 to 98% since the 1970s and has stayed there. The causes act together: fishing at every life stage, dams and weirs that block migration and kill descending adults in turbines, the introduced swim-bladder parasite Anguillicola crassus, pollutants such as PCBs that accumulate in the fat reserves needed for the ocean crossing, and changes in Atlantic currents.",
    },
    {
      q: "How long do European eels live?",
      a: "Typically 15 to 20 years in fresh water, with a maximum reported wild age of 23. Because an eel only migrates and breeds when it is ready, an individual that never gets the trigger can live far longer in captivity — an eel reportedly put into a well at Brantevik in Sweden in 1859 was said to have lived there until 2014.",
    },
    {
      q: "Why are eels farmed but never bred?",
      a: "Because closing the life cycle in captivity has not been achieved commercially. Every farmed eel begins as a wild glass eel caught at a river mouth and grown on, so eel aquaculture depends on the wild population rather than relieving pressure on it. That is also what makes glass eels so valuable, and why their illegal export from Europe became a major trafficking problem after the EU banned trade in 2010.",
    },
    {
      q: "What are the five stages of a European eel's life?",
      a: "Leptocephalus, a transparent leaf-shaped ocean larva; glass eel, transparent but eel-shaped, arriving at coasts; elver, the pigmented young eel that pushes upstream; yellow eel, the long feeding stage that lasts most of the animal's life; and silver eel, the migrating adult with enlarged eyes, a shut-down gut and no further need to feed. The stages look so different that they were once described as separate species.",
    },
  ],

  seo: {
    title: "European Eel — Life Cycle, Sargasso Sea Migration & Decline",
    description:
      "A researched profile of the European eel (Anguilla anguilla): the five life stages, the Sargasso Sea spawning grounds inferred by Schmidt and confirmed by tagging in 2022, the 90%-plus recruitment collapse, and why it is Critically Endangered.",
    keywords: [
      "european eel facts",
      "anguilla anguilla",
      "where do eels breed",
      "sargasso sea eels",
      "european eel endangered",
    ],
  },

  sources: [
    {
      label: "Anguilla anguilla — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/60344/152845178",
    },
    {
      label: "European eel remains Critically Endangered in latest IUCN Red List assessment",
      publisher: "Fisheries Secretariat (August 2020)",
      url: "https://www.fishsec.org/2020/08/26/european-eel-remains-critically-endangered-in-latest-iucn-red-list-assessment/",
    },
    {
      label: "First direct evidence of adult European eels migrating to their breeding place in the Sargasso Sea",
      publisher: "Wright et al., Scientific Reports (2022)",
      url: "https://www.nature.com/articles/s41598-022-19248-8",
    },
    {
      label: "Anguilla anguilla — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Anguilla-anguilla.html",
    },
    {
      label: "No catches of European eel in 2026 can be in line with scientific advice (ICES advice summary)",
      publisher: "Fisheries Secretariat (November 2025)",
      url: "https://www.fishsec.org/2025/11/04/press-release-no-catches-of-european-eel-in-2026-can-be-in-line-with-scientific-advice/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default europeanEel;
