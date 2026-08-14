// Thorny devil — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const thornyDevil = {
  slug: "thorny-devil",
  category: "reptiles",
  name: "Thorny Devil",
  scientificName: "Moloch horridus",
  otherNames: ["Thorny dragon", "Mountain devil", "Moloch", "Thorny lizard"],

  summary:
    "A small Australian desert lizard that eats nothing but ants and moves water to its mouth along capillary channels between its scales — from anywhere on its body, including damp sand.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/72/Thornydevil.jpg",
    alt: "A thorny devil on red desert ground beside the Great Central Road, Western Australia",
    credit: "Bäras (talk · contribs) / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Moloch_horridus%2C_Thorny_Devil%2C_Alice_Springs_2.jpg/1920px-Moloch_horridus%2C_Thorny_Devil%2C_Alice_Springs_2.jpg",
      alt: "A thorny devil seen from above, its whole upper surface covered in conical spines",
      credit: "Stu's Images / Wikimedia Commons",
      title: "Spines that are mostly bluff",
      caption:
        "The conical spines covering the upper body are largely uncalcified — soft-cored rather than bone. They deter predators by making the lizard awkward to swallow, and the ridged scales between them carry the channels that move water.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c0/A232%2C_Alice_Springs_Desert_Park%2C_Alice_Springs%2C_Australia%2C_thorny_devil%2C_2007.JPG",
      alt: "A thorny devil in profile, showing the two large horns on its head",
      credit: "Brian W. Schaller / Wikimedia Commons",
      title: "Two heads, one of them fake",
      caption:
        "Behind the horned real head sits a spiny knob of soft tissue on the neck. Threatened, the lizard tucks its true head down between its forelegs and presents this false head instead — the part a predator is most likely to bite.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Cd_thorny_devil.jpg",
      alt: "A thorny devil standing on sandy ground, patterned in desert browns and tans",
      credit: "ChatDaniels / Wikimedia Commons",
      title: "Colour that tracks the temperature",
      caption:
        "The camouflage pattern is not fixed. Thorny devils go pale in warm conditions and darken in cold, which is thermoregulation as much as concealment — a dark lizard absorbs more of the morning sun.",
    },
  ],

  headline: "Plumbing, not absorption",
  intro: [
    "The thorny devil is a slow, spiny agamid of the Australian arid zone, at most 21 cm long including the tail, and it does two things very well. It eats ants — only ants, one at a time, in the thousands. And it collects water without drinking in any ordinary sense.",
    "The mechanism is routinely described as drinking through the skin. It is not. The skin is not permeable; it is plumbed. Between the lizard's overlapping scales runs a network of semi-tubular capillary channels covering the entire body surface, and water touching any part of that surface is drawn along it by capillary action until it reaches the corner of the mouth, where jaw movements pump it in. The lizard can start the process with a foot in a puddle, with dew on its back, or by shovelling damp sand over itself.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Agamidae",
    genus: "Moloch",
    species: "Moloch horridus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2017,
    populationTrend: "stable",
    populationEstimate: "No global figure; widespread across the Australian arid zone",
    note: "Assessed Least Concern in 2017, with a very large range covering most of arid and semi-arid Australia and no evidence of broad decline. Because the species depends entirely on a few genera of small ants, local losses follow anything that removes those ants — intensive grazing, altered fire regimes and the spread of invasive ants are the concerns most often raised. Road mortality is significant where the lizards bask on warm bitumen.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "Up to about 21 cm including the tail",
      min: 15,
      max: 21,
      unit: "cm",
      note: "Females are consistently larger than males",
    },
    {
      key: "meal-size",
      label: "Ants per meal",
      value: "Roughly 1,000–5,000, taken one at a time",
      min: 1000,
      max: 5000,
      unit: "ants",
      note: "The lizard positions itself on an ant trail and works through it with the tongue; a single feeding session can run for well over an hour",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "3–10 eggs",
      min: 3,
      max: 10,
      unit: "eggs",
      note: "Laid in a nest chamber the female digs as much as 30 cm below the surface",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About three to four months",
      min: 91,
      max: 126,
      unit: "days",
      note: "Warmer ground shortens it; hatchlings begin eating ants almost immediately",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 3 years",
      min: 3,
      max: 3,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "15–20 years",
      min: 15,
      max: 20,
      unit: "years",
      note: "Long for a lizard of this size, and consistent with an unhurried, low-energy way of life",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Myrmecophage — small black ants almost exclusively, chiefly Ochetellus and Iridomyrmex", icon: "Bug" },
    { key: "water-collection", label: "Water collection", value: "Capillary channels between the scales carry water from any body surface to the mouth; the skin itself absorbs nothing", icon: "Droplet" },
    { key: "defence", label: "Defence", value: "Spines, a false head of soft tissue on the neck, and a rocking, freezing gait that reads as wind-blown debris", icon: "Shield" },
    { key: "activity", label: "Activity", value: "Diurnal; inactive through the hottest and coldest months", icon: "Sun" },
    { key: "camouflage", label: "Colour change", value: "Pale in warm weather, darker in cold — thermoregulation as much as concealment", icon: "Palette" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — agamids have no infrared pits; it locates ants visually, one at a time", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "In patches through the year, more often while growing", icon: "RefreshCw" },
  ],

  highlights: ["water-collection", "meal-size", "length", "defence"],

  distribution: {
    continents: ["Australia"],
    regions: [
      "Western Australian deserts",
      "Central Australia and the Northern Territory",
      "Western South Australia",
      "Western Queensland and New South Wales",
    ],
    habitats: [
      "Sandplain and sand dune desert",
      "Spinifex grassland",
      "Mallee and arid shrubland",
    ],
    elevation: "Lowland arid interior",
    note: "Distributed across most of the Australian arid and semi-arid zone, but locally patchy: the species needs the particular small black ants it eats, and it is absent from otherwise suitable country where those ants are scarce. It resembles the North American horned lizards of the genus Phrynosoma closely and is only distantly related to them — a textbook case of convergent evolution in desert ant specialists.",
  },

  sections: [
    {
      id: "water",
      title: "How the water system actually works",
      body: [
        "The thorny devil's scales overlap like roof shingles, and the gaps between them are not gaps. Each is a semi-tubular channel, open by a narrow slit on the outer surface, and the channels join into a single network that runs over the entire body — legs, flanks, back, head. Micro-CT and electron microscopy show the network is hierarchical: a large channel between the scales, subdivided by small protrusions into finer sub-capillaries. The large channel fills fast; the fine structure extends how far the water can travel, by about 39 per cent.",
        "Water entering the network anywhere is pulled along it by capillary action towards the corners of the mouth. Capillarity alone cannot get it in, so the last step is muscular: the lizard makes rhythmic jaw movements, each one drawing in roughly 0.7 microlitres. A drinking bout is hundreds of these.",
        "Nothing here involves absorption. The skin of a thorny devil is no more permeable than any other lizard's. Calling it a lizard that drinks through its skin gets the physiology backwards — it is a lizard with external plumbing.",
      ],
    },
    {
      id: "sources",
      title: "Where the water comes from",
      body: [
        "Researchers tested the plausible desert water sources against the capillary system directly, and the results separate the useful ones from the merely picturesque.",
        "Standing in a puddle works completely: the network fills, and the lizard drinks. Dew and condensation do not — thermal differences overnight yielded only around 0.22 per cent of body weight, nowhere near enough to trigger drinking, which quietly kills a popular claim about the species.",
        "Moist sand is the interesting case. A thorny devil simply standing on damp sand filled its channels to only 59 per cent of capacity and did not drink. But when sand was placed on top of the skin, the channels filled completely — which explains a behaviour that had looked eccentric. Thorny devils shovel damp sand onto their own backs with their forelegs. They are not bathing; they are priming the system from above, where gravity helps.",
        "The conclusion of that work was that rain and moist sand are the sources the animal can rely on regularly. Both are rare in the Australian interior, which is the point: this is a mechanism for extracting a usable drink from conditions that offer no obvious water at all.",
      ],
    },
    {
      id: "ants",
      title: "An ant specialist",
      body: [
        "The thorny devil eats small black ants and very little else, chiefly species of Ochetellus and Iridomyrmex. It finds an ant trail or a nest entrance, settles beside it, and takes the ants individually with a sticky tongue, at a steady rate for an hour or more. A single feeding session accounts for something in the range of a thousand to five thousand ants.",
        "Ants are a poor food — small, chitinous, defended by formic acid — and eating only ants shapes everything about the animal. The thorny devil is slow because it does not need to chase anything. Its metabolic rate is low. It has an enlarged colon to handle the indigestible bulk it processes.",
        "It is also why the species turns up in some patches of apparently identical desert and not others. The distribution is really the distribution of a few ant genera, mapped one lizard at a time.",
      ],
    },
    {
      id: "defence",
      title: "Spines, a false head and a strange walk",
      body: [
        "Every upper surface of the thorny devil is covered in conical spines, and the two largest sit above the eyes like horns. Most of the spines are uncalcified — soft-cored rather than bone — which suggests their job is to make the lizard difficult to swallow rather than to injure anything.",
        "Behind the head, on the neck, sits a knob of spiny soft tissue that looks like a second, smaller head. Threatened, the lizard tucks its real head down between its forelegs and presents this decoy, so a strike aimed at the head hits tissue the animal can afford to lose.",
        "Then there is the gait. A moving thorny devil freezes, rocks back and forth, moves a short distance, and freezes again. Against a background of spinifex and wind-moved litter, an animal that jerks and stops does not read as prey. Combined with camouflage colouring that shifts from pale in the heat to dark in the cold, it is a defence built almost entirely on not being identified.",
      ],
    },
  ],

  related: ["frilled-lizard", "gila-monster", "veiled-chameleon"],
  tags: ["lizard", "agamid", "australia", "desert", "reptile", "ant specialist"],
  searchTerms: ["moloch horridus", "thorny dragon", "mountain devil", "thorny lizard", "water through skin lizard"],

  faqs: [
    {
      q: "Does the thorny devil drink water through its skin?",
      a: "No, and this is the most common misstatement about the species. The skin absorbs nothing. Between the overlapping scales runs a network of semi-tubular capillary channels covering the whole body; water touching any part of that surface is drawn along the channels to the corner of the mouth by capillary action, and the lizard then swallows it with rhythmic jaw movements of about 0.7 microlitres each.",
    },
    {
      q: "Can a thorny devil get water from damp sand?",
      a: "Yes, but not simply by standing on it. Experiments found that a lizard resting on moist sand filled its channels to only 59 per cent of capacity and did not drink. When sand was placed on top of the skin the channels filled completely — which explains why thorny devils shovel damp sand onto their own backs with their forelegs. Rain and moist sand are the two sources the researchers judged ecologically reliable; dew and condensation yielded far too little.",
    },
    {
      q: "What do thorny devils eat?",
      a: "Small black ants, almost exclusively — mainly species of Ochetellus and Iridomyrmex. The lizard positions itself on an ant trail and takes them one at a time with its tongue, working through somewhere between about 1,000 and 5,000 ants in a single feeding session.",
    },
    {
      q: "Why does a thorny devil have two heads?",
      a: "It has one real head and one decoy. A spiny knob of soft tissue sits on the back of the neck, and when threatened the lizard dips its real head down between its forelegs and presents the false one instead. A predator striking at what looks like the head hits tissue rather than the skull.",
    },
    {
      q: "Is the thorny devil related to American horned lizards?",
      a: "Only distantly. The thorny devil is an Australian agamid; the horned lizards of the genus Phrynosoma are North American and belong to a different family. Both are flattened, spiny, slow-moving desert ant specialists because that combination works, not because they share a recent ancestor — a standard example of convergent evolution.",
    },
  ],

  seo: {
    title: "Thorny Devil — Water Channels, Ant Diet & Desert Defences",
    description:
      "A researched profile of the thorny devil (Moloch horridus): how capillary channels between its scales carry water to its mouth, why it does not absorb water through the skin, its ant-only diet and its false head.",
    keywords: [
      "thorny devil facts",
      "moloch horridus",
      "thorny devil water skin",
      "thorny dragon",
      "australian desert lizard",
    ],
  },

  sources: [
    {
      label: "Moloch horridus — Red List assessment (Doughty et al., 2017)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/83492011/83492039",
    },
    {
      label: "Cutaneous water collection by a moisture-harvesting lizard (Comanns et al., 2016)",
      publisher: "Journal of Experimental Biology",
      url: "https://pubmed.ncbi.nlm.nih.gov/27807218/",
    },
    {
      label: "Adsorption and movement of water by skin of the Australian thorny devil (Comanns et al., 2017)",
      publisher: "Royal Society Open Science",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5627102/",
    },
    {
      label: "Thorny devils — diet, breeding and habitat",
      publisher: "Bush Heritage Australia",
      url: "https://www.bushheritage.org.au/species/thorny-devils",
    },
    {
      label: "Moloch horridus entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Moloch&species=horridus",
    },
  ],

  updatedAt: "2026-07-29",
};

export default thornyDevil;
