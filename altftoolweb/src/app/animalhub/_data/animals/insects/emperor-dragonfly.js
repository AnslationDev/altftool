// Emperor dragonfly — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const emperorDragonfly = {
  slug: "emperor-dragonfly",
  category: "insects",
  name: "Emperor Dragonfly",
  scientificName: "Anax imperator",
  otherNames: ["Blue emperor", "Emperor hawker"],

  summary:
    "A large hawker that spends one or two years as an aquatic predator with an extendable jaw, then a few weeks in the air catching insects on the wing and rarely settling at all.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Anax_imperator_qtl2.jpg/1920px-Anax_imperator_qtl2.jpg",
    alt: "A male emperor dragonfly with an apple-green thorax and blue abdomen marked by a dark dorsal line",
    credit: "Quartl / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Anax_imperator_%28Blue_emperor%29.jpg/1920px-Anax_imperator_%28Blue_emperor%29.jpg",
      alt: "An emperor dragonfly resting on floating vegetation at the water surface, laying eggs",
      credit: "Broobas Binish Roobas / Wikimedia Commons",
      title: "Laying into floating weed",
      caption:
        "Female emperors oviposit alone, unguarded by the male — unusual among hawkers — cutting slits into floating pondweed and inserting eggs one at a time.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/007c_European_bee-eater_eating_an_Emperor_dragonfly_in_Pfyn-Finges_Photo_by_Giles_Laurent.jpg/1920px-007c_European_bee-eater_eating_an_Emperor_dragonfly_in_Pfyn-Finges_Photo_by_Giles_Laurent.jpg",
      alt: "A European bee-eater holding a male emperor dragonfly crosswise in its bill",
      credit: "Giles Laurent / Wikimedia Commons",
      title: "Near the top, but not at it",
      caption:
        "Adult emperors are among the most effective aerial hunters in fresh water, and are themselves prey for faster, larger aerial hunters — bee-eaters and hobbies take them regularly.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/021a_European_bee-eater_eating_an_Emperor_dragonfly_in_Pfyn-Finges_Photo_by_Giles_Laurent.jpg/1920px-021a_European_bee-eater_eating_an_Emperor_dragonfly_in_Pfyn-Finges_Photo_by_Giles_Laurent.jpg",
      alt: "A European bee-eater tossing a captured emperor dragonfly in the air before swallowing it",
      credit: "Giles Laurent / Wikimedia Commons",
      title: "Wings removed before swallowing",
      caption:
        "Bee-eaters beat and reposition large insects before eating them. The four broad wings that make a dragonfly so manoeuvrable are the part a bird has to deal with first.",
    },
  ],

  headline: "Two years in the water for six weeks in the air",
  intro: [
    "The emperor is one of the largest dragonflies in Europe — around 78 millimetres long with a wingspan a little over ten centimetres — and one of the most conspicuous, because it almost never lands. Males hold a stretch of open water for hours at a time, patrolling at speed, eating their prey in flight, and driving off other dragonflies that enter the airspace.",
    "The flying adult is the short end of the life cycle. Behind it sit one to two years underwater as a larva that hunts tadpoles and small fish with a hinged, extendable jaw, breathes and swims by pumping water through its rectum, and eventually climbs a stem at night to split its skin and emerge as something entirely different.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Odonata",
    family: "Aeshnidae",
    genus: "Anax",
    species: "Anax imperator",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2016,
    populationTrend: "increasing",
    populationEstimate:
      "No global figure; widespread and common across Europe, Africa, the Middle East and western Asia, and expanding northwards",
    note: "A genuine global Red List assessment rather than a European regional one. The species is one of the few insects whose range is demonstrably growing: it reached Denmark in 1994, Sweden in 2002 and Scotland by the mid-2000s, and its British distribution has expanded markedly since the 1990s. Local losses come from the drainage, silting and nutrient enrichment of the well-vegetated still waters it breeds in.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "About 78 mm",
      min: 73,
      max: 82,
      unit: "mm",
      note: "Measured from the head to the tip of the abdomen; among the largest dragonflies in Europe",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "About 10.4 cm",
      min: 10,
      max: 11,
      unit: "cm",
    },
    {
      key: "larval-length",
      label: "Larval length",
      value: "45–56 mm at the final instar",
      min: 45,
      max: 56,
      unit: "mm",
      note: "The largest dragonfly larva found in Britain",
    },
    {
      key: "larval-duration",
      label: "Larval stage",
      value: "1–2 years",
      min: 1,
      max: 2,
      unit: "years",
      note: "In Britain most larvae take two years; a minority complete development in one",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "A few weeks",
      unit: "weeks",
      note: "The flying adult is the shortest phase of the life cycle by a wide margin",
    },
    {
      key: "flight-speed",
      label: "Flight speed",
      value: "Around 36–54 km/h in fast flight",
      min: 36,
      max: 54,
      unit: "km/h",
      note: "Figures of 10–15 m/s are quoted for large hawker dragonflies generally rather than measured for this species alone",
    },
    {
      key: "eye-facets",
      label: "Facets per eye",
      value: "Up to about 30,000",
      unit: "ommatidia",
      note: "A figure for large dragonflies generally; the eyes meet across the top of the head and give near-spherical vision",
    },
  ],

  traits: [
    { key: "diet-type", label: "Adult diet", value: "Flying insects caught and eaten on the wing", icon: "Bug" },
    { key: "diet-larva", label: "Larval diet", value: "Aquatic invertebrates, tadpoles and small fish", icon: "Fish" },
    { key: "activity", label: "Activity", value: "Diurnal; rarely settles while active", icon: "Sun" },
    { key: "flight", label: "Flight", value: "Four independently driven wings; hovers and flies backwards", icon: "Wind" },
    { key: "territory", label: "Territory", value: "Males patrol and defend a stretch of open water", icon: "Flag" },
    { key: "ecological-role", label: "Ecological role", value: "Top invertebrate predator of still fresh water", icon: "Waves" },
  ],

  highlights: ["body-length", "wingspan", "larval-duration", "flight"],

  distribution: {
    continents: ["Europe", "Africa", "Asia"],
    regions: [
      "Most of Europe, north to southern Scandinavia and Scotland",
      "North Africa and much of sub-Saharan Africa",
      "The Middle East and western Asia",
      "The Canary Islands and other Atlantic islands",
    ],
    habitats: [
      "Well-vegetated ponds and lakes",
      "Gravel pits and reservoirs",
      "Canals and slow rivers",
      "Garden ponds",
    ],
    elevation: "Sea level to around 2,000 m",
    note: "Breeding requires still or slow water with submerged and floating plants for the larvae to hunt in and the female to lay into. Adults range far from water and are regularly seen hunting over meadows, gardens and woodland rides.",
  },

  sections: [
    {
      id: "hunting",
      title: "Built around the eyes",
      body: [
        "A dragonfly's head is mostly eye. In the largest hawkers the two compound eyes meet across the top of the head and together carry on the order of tens of thousands of facets, giving a field of view that is close to spherical with a forward zone of high acuity. There is very little a hunting emperor cannot see.",
        "The flight system is unusual too. Each of the four wings is driven by its own muscles and can be moved independently, so a dragonfly can hover, accelerate hard, fly backwards, and change direction without banking. Large hawkers reach roughly 10 to 15 metres per second in fast flight.",
        "Put together, those two systems produce interception rather than pursuit. Rather than chasing a target, a hunting dragonfly steers to where the prey is going to be, adjusting continuously as the target moves — a strategy that requires predicting a flight path, not just tracking it. Prey is taken with the legs, held in a basket formed by the spiny forelegs, and eaten in flight. An emperor patrolling a pond may not land for hours.",
      ],
    },
    {
      id: "larva",
      title: "The years underwater",
      body: [
        "The emperor spends the great majority of its life as a larva, and the larva is a formidable animal in its own right — up to 56 millimetres at the final instar, the largest dragonfly larva in Britain. It hunts among submerged plants, eating anything it can subdue: mayfly nymphs, water beetles, other dragonfly larvae, tadpoles and small fish.",
        "It catches them with a modified lower lip. The labium is hinged, folded back beneath the head at rest, and tipped with a pair of hooks; hydraulic pressure shoots it forward in a fraction of a second to seize prey well outside the reach of the legs. Nothing else in fresh water hunts quite like it.",
        "The same hydraulics power an escape. Dragonfly larvae draw water into a chamber in the rectum lined with gills, which is where they take up oxygen — and by contracting the abdomen sharply, they can expel that water as a jet and shoot backwards away from a threat. When development finishes, usually after a second winter, the larva climbs a stem at night, its skin splits behind the head, and the adult hauls itself out and spends the next several hours pumping up its wings.",
      ],
    },
    {
      id: "territory",
      title: "Patrolling and laying",
      body: [
        "Male emperors are strongly territorial. A male will hold a section of pond margin for hours, flying continuous circuits low over the water with the tip of the abdomen curved slightly downward — a posture distinctive enough to identify the species from a distance — and intercepting any dragonfly that crosses into it.",
        "Females entering that airspace are seized in flight. The pair form the characteristic wheel while the male transfers sperm from the genital opening at the tip of his abdomen to a secondary structure near its base, an arrangement unique to the Odonata.",
        "Afterwards the female usually lays alone, which is not what most hawkers do. She settles on floating pondweed with her abdomen below the surface, cuts a slit in plant tissue and inserts a single egg, moving along and repeating it. Males of many related species guard the female through this; the emperor male generally goes back to patrolling.",
      ],
    },
    {
      id: "spread",
      title: "Moving north",
      body: [
        "The emperor is one of the clearest insect examples of a range shifting with climate. It was a southern species in Britain within living memory; its distribution has expanded substantially since the 1990s, and it is now found across Wales and most of England, with records on the southern and eastern coasts of Scotland since the mid-2000s.",
        "The pattern continues in Scandinavia. The first Danish record came in 1994, Sweden followed in 2002, and the northern limit has kept moving. Warmer water shortens larval development, and warmer summers extend the flight season at both ends.",
        "Dragonflies are useful indicators of freshwater condition because the larvae are long-lived and cannot leave: a population reflects two years of water quality rather than one good afternoon. The emperor's spread is genuinely good news for it, but it sits alongside continued losses of the ponds, ditches and fens that many less mobile Odonata depend on.",
      ],
    },
  ],

  related: ["european-mantis", "housefly", "monarch-butterfly"],
  tags: ["dragonfly", "odonata", "freshwater", "predator", "europe", "pond"],
  searchTerms: [
    "anax imperator",
    "blue emperor dragonfly",
    "biggest dragonfly uk",
    "dragonfly larva",
    "how long do dragonflies live",
  ],

  faqs: [
    {
      q: "How long does an emperor dragonfly live?",
      a: "Most of its life is spent underwater. The larva takes one to two years to develop — in Britain usually two — and the flying adult lives only a few weeks after emerging. The dragonflies people see over a pond in July are the last and briefest stage of an animal that has been hunting in that pond since the summer before last.",
    },
    {
      q: "Do dragonflies bite or sting?",
      a: "They have no sting. A large hawker held in the hand can give a pinch with its mandibles that is startling but rarely breaks the skin, and they make no attempt to bite people otherwise. The habit of flying close to a person standing by water is investigation, not aggression.",
    },
    {
      q: "How fast can an emperor dragonfly fly?",
      a: "Large hawker dragonflies are generally credited with about 10 to 15 metres per second — roughly 36 to 54 km/h — in fast flight. Speed is not really the point, though: four independently controlled wings let a dragonfly hover, reverse and change direction without banking, and that manoeuvrability matters more to its hunting than top speed does.",
    },
    {
      q: "What do dragonfly larvae eat?",
      a: "Whatever they can catch. Emperor larvae take mayfly nymphs, water beetles, other dragonfly larvae, tadpoles and small fish, seizing them with a hinged lower lip that shoots forward hydraulically from beneath the head. At up to 56 millimetres they are the largest dragonfly larvae in Britain and are effectively top predators in a pond without fish.",
    },
    {
      q: "Is the emperor dragonfly endangered?",
      a: "No. It is assessed as Least Concern globally, and unusually for an insect that assessment is a genuine global one rather than a European regional one. Its range is expanding northwards — it reached Denmark in 1994, Sweden in 2002 and Scotland shortly after — although it still depends on well-vegetated still waters that continue to be lost to drainage and nutrient enrichment.",
    },
  ],

  seo: {
    title: "Emperor Dragonfly — Hunting, Larvae & Range Expansion",
    description:
      "A researched profile of the emperor dragonfly (Anax imperator): its interception hunting and near-spherical vision, the extendable jaw of its aquatic larva, territorial patrolling, and its northward spread.",
    keywords: [
      "emperor dragonfly facts",
      "anax imperator",
      "dragonfly larva",
      "largest dragonfly uk",
      "dragonfly flight speed",
    ],
  },

  sources: [
    {
      label: "Anax imperator — Red List assessment (global, 2016)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/59812/72311295",
    },
    {
      label: "Emperor Dragonfly species account",
      publisher: "British Dragonfly Society",
      url: "https://british-dragonflies.org.uk/species/emperor-dragonfly/",
    },
    {
      label: "Dragonflies: the ultimate hunters",
      publisher: "Natural History Museum, London",
      url: "https://www.nhm.ac.uk/discover/dragonflies-the-ultimate-hunters.html",
    },
    {
      label: "May (1991), 'Dragonfly flight: power requirements at high speed and acceleration'",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/158/1/325/6246/Dragonfly-Flight-Power-Requirements-at-High-Speed",
    },
  ],

  updatedAt: "2026-07-29",
};

export default emperorDragonfly;
