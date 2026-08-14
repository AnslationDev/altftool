// Giraffe — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const giraffe = {
  slug: "giraffe",
  category: "mammals",
  name: "Giraffe",
  scientificName: "Giraffa camelopardalis",
  otherNames: ["Northern giraffe", "Nubian giraffe", "Kordofan giraffe", "Rothschild's giraffe"],

  summary:
    "The tallest animal alive, built around a two-metre neck of just seven bones and a circulatory system that has to push blood five metres uphill without bursting anything on the way down.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Rothschild%27s_giraffe_%28Giraffa_camelopardalis_rothschildi%29_-_Murchison_Falls_National_Park.jpg/1920px-Rothschild%27s_giraffe_%28Giraffa_camelopardalis_rothschildi%29_-_Murchison_Falls_National_Park.jpg",
    alt: "A giraffe standing among low trees in open savanna, its full neck and patterned coat visible",
    credit: "Thomas Fuhrmann / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Giraffa_camelopardalis_-_13.jpg/1920px-Giraffa_camelopardalis_-_13.jpg",
      alt: "A giraffe photographed against open sky, head and upper neck filling the frame",
      credit: "lwolfartist / Wikimedia Commons",
      title: "Seven bones, two metres",
      caption:
        "A giraffe has exactly the same number of neck vertebrae as a human — seven — but each one can be around 25 cm long. The neck is not a different design, only a stretched one.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Giraffe_%2815045461618%29.jpg/1920px-Giraffe_%2815045461618%29.jpg",
      alt: "A giraffe standing in the open, showing the irregular patch pattern across its body and legs",
      credit: "Karol Domian / Wikimedia Commons",
      title: "Patches that cool as well as hide",
      caption:
        "Each patch sits over a dense network of blood vessels. Beyond camouflage in broken shade, the pattern is thought to work as a set of thermal windows the animal can flush with blood to shed heat.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Giraffe_%288072227390%29.jpg/1920px-Giraffe_%288072227390%29.jpg",
      alt: "A giraffe seen in profile with its long legs and sloping back clearly visible",
      credit: "Rachel Hobday from England / Wikimedia Commons",
      title: "The tallest browser on the plain",
      caption:
        "Standing over five metres, a bull giraffe feeds at a height nothing else on the savanna can reach — which is why giraffe browsing lines are visible on acacia canopies from a long way off.",
    },
  ],

  headline: "Five metres tall, on seven neck bones",
  intro: [
    "A bull giraffe stands up to 5.5 metres and weighs around 1,200 kg, which makes it the tallest land animal by a wide margin. Almost all the reach is in the neck, and the neck contains seven cervical vertebrae — exactly as many as a mouse or a human has. Each one is simply enormous, up to about 25 cm long.",
    "Everything downstream of that follows from the height. The heart weighs around 11 kg and generates a blood pressure roughly twice a human's to reach the brain; valves in the jugular veins and a dense capillary net at the base of the skull stop the pressure surge when the animal lowers its head to drink. A newborn falls nearly two metres to the ground at birth and is standing within the hour.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Artiodactyla",
    family: "Giraffidae",
    genus: "Giraffa",
    species: "Giraffa camelopardalis",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2016,
    populationTrend: "decreasing",
    populationEstimate: "About 97,500 giraffe of all ages at the 2016 assessment; the Giraffe Conservation Foundation now counts roughly 140,000 across all four recognised species",
    note: "The code shown here is the species-level assessment of Giraffa camelopardalis published in 2016 (assessed 2016, published 2018), which uplisted giraffe from Least Concern to Vulnerable after an estimated 36–40% decline over three generations. It treats giraffe as a single species. That is no longer the accepted taxonomy: in August 2025 the IUCN SSC Giraffe and Okapi Specialist Group formally recognised four species — northern, reticulated, Masai and southern giraffe — and Red List assessments under the new arrangement are still to follow. Several giraffe populations already carry separate, and far worse, assessments of their own: the Kordofan and Nubian giraffe were both listed as Critically Endangered in 2018, and the reticulated giraffe as Endangered. Read the Vulnerable code as an average across populations whose fortunes differ enormously.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "4.5–5.5 m",
      min: 4.4,
      max: 5.5,
      unit: "m",
      note: "Bulls reach about 5.5 m to the top of the ossicones; cows about 4.5 m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "2.8–3.3 m",
      min: 2.8,
      max: 3.31,
      unit: "m",
      note: "Even measured at the shoulder — before the neck begins — a giraffe stands taller than a large horse",
    },
    {
      key: "weight",
      label: "Weight",
      value: "830–1,190 kg",
      min: 828,
      max: 1192,
      unit: "kg",
      note: "Averages: bulls about 1,192 kg, cows about 828 kg",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Up to about 60 km/h",
      min: 50,
      max: 60,
      unit: "km/h",
      note: "In a gallop over short distances. At walking pace giraffe pace — moving both legs on one side together — which very few large mammals do",
    },
    {
      key: "tongue-length",
      label: "Tongue length",
      value: "Up to 50 cm",
      min: 45,
      max: 50,
      unit: "cm",
      note: "Prehensile and darkly pigmented, which is thought to protect it from sunburn during long hours of browsing",
    },
    {
      key: "blood-pressure",
      label: "Blood pressure",
      value: "About 203 mmHg",
      min: 203,
      max: 203,
      unit: "mmHg",
      note: "Systemic pressure, roughly twice a human's. By the time blood reaches the head it has dropped to about 100 mmHg — the difference is the cost of the neck",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 450 days",
      min: 446,
      max: 457,
      unit: "days",
      note: "Around fifteen months. The cow gives birth standing",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1 calf",
      min: 1,
      max: 1,
      unit: "calf",
      note: "Born at about 100 kg and 1.5–1.8 m tall, after a fall of roughly two metres. Standing within 5–20 minutes",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–5 years (females), 9–10 years (males)",
      min: 4,
      max: 10,
      unit: "years",
      note: "Cows generally give birth for the first time at six or seven; bulls are physically mature long before they can win access to cows",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 14–16 years in the wild",
      min: 14,
      max: 16,
      unit: "years",
      note: "Often quoted much higher. Field data give an average in the mid-teens for bulls, with cows similar or a little longer; median survival in zoos is about 15 years for males and 20 for females",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Browser — leaves and shoots, largely acacia", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Fluid herds of 3–10; no territories", icon: "Users" },
    { key: "activity", label: "Activity", value: "Active day and night; deep sleep in bursts of 5–10 minutes", icon: "Sun" },
    { key: "ecological-role", label: "Ecological role", value: "Canopy browser and seed disperser above the reach of other herbivores", icon: "Sprout" },
  ],

  highlights: ["height", "weight", "tongue-length", "top-speed"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Kenya, Uganda and Tanzania",
      "South Sudan and Ethiopia",
      "Chad, Cameroon and the Central African Republic",
      "Niger — the last West African giraffe",
      "Namibia and Botswana",
      "South Africa, Zimbabwe and Zambia",
    ],
    habitats: [
      "Savanna and open woodland",
      "Acacia scrub and shrubland",
      "Dry riverbeds and desert margins",
      "Floodplain grassland with scattered trees",
    ],
    elevation: "Sea level to around 2,000 m",
    note: "Giraffe range is now a patchwork rather than a belt. The species has been lost from at least seven countries in which it once occurred, while conservation translocations have re-established or reinforced populations in others — Uganda in particular has moved Nubian giraffe into Kidepo Valley, Pian Upe, Lake Mburo and the south bank of the Nile in Murchison Falls. The desert-dwelling giraffe of northwest Namibia occupy some of the driest country any large browser lives in.",
  },

  sections: [
    {
      id: "neck",
      title: "The neck and the plumbing it needs",
      body: [
        "A giraffe's neck is not a new anatomical design; it is an ordinary mammal neck with the parts made very large. Seven cervical vertebrae, the mammalian standard, each elongated to as much as 25 cm, supported by heavily reinforced ligaments running from the shoulders.",
        "The circulatory consequences are severe. Getting blood up to a brain five metres above the ground requires a systemic pressure of about 203 mmHg — roughly double a human's — produced by a heart weighing around 11 kg with an exceptionally thick left ventricle. Giraffe arteries are correspondingly thickened, and the legs are wrapped in tight fascia that works like a compression stocking, preventing blood pooling in the feet.",
        "Lowering the head to drink reverses the problem in a second. Valves in the jugular veins prevent backflow, and a network of fine vessels at the base of the skull — a rete mirabile — buffers the pressure surge before it reaches the brain. Raising the head again would drop cerebral pressure to nothing without those same mechanisms holding blood in reserve.",
        "Why the neck evolved at all is still argued. The obvious answer is feeding height, and giraffe do exploit a browse layer nothing else reaches. But bulls also use the neck as a weapon, swinging the head like a club in contests called necking, and neck length in males is strongly linked to breeding success — so sexual selection is a serious competing explanation.",
      ],
    },
    {
      id: "feeding",
      title: "Feeding at the top of the tree",
      body: [
        "Giraffe are browsers, taking leaves, shoots, flowers and pods, with acacia forming the bulk of the diet across most of the range. The tongue is up to 50 cm long, prehensile and dark — probably pigmented against sunburn, since it is out in the sun for hours a day — and it strips leaves from between thorns that would stop most animals.",
        "The lips and palate are toughened accordingly, and thick saliva coats any thorns that are swallowed. Acacias fight back chemically: browsing triggers a rise in tannins in the leaves, and there is good evidence giraffe respond by feeding briefly on each tree and moving on, often working upwind of trees that have already been alerted.",
        "Water is largely optional. Giraffe obtain most of their moisture from leaves and can go long periods without drinking, which suits them to arid country — and is fortunate, because drinking is the most awkward and most dangerous thing a giraffe does, requiring it to splay its forelegs and lower its head to the ground.",
      ],
    },
    {
      id: "society",
      title: "Herds, calves and predation",
      body: [
        "Giraffe are social but not territorial. Herds typically number three to ten and can exceed a hundred where food is abundant, but membership changes constantly through the day — a fission–fusion pattern in which individuals join and leave freely. Underneath that fluidity, long-term work has found stable female associations that persist for years.",
        "Calving is unusual and brutal. The cow gives birth standing, so the calf falls close to two metres, which appears to help start it breathing. It weighs about 100 kg, stands within five to twenty minutes and can run within a day. Calves are then left in loose crèches while mothers feed.",
        "Even so, first-year mortality is severe — lion predation can take 45 to 50% of calves or more — and drops sharply after that. An adult giraffe is a difficult target: it can see a long way, kick with enough force to kill a lion, and outrun one over open ground at up to 60 km/h.",
        "Sleep is minimal. Giraffe take short bouts day and night, with genuinely deep sleep amounting to only five or ten minutes at a time, usually lying down with the head resting back on the flank.",
      ],
    },
    {
      id: "taxonomy-split",
      title: "One species or four",
      body: [
        "For most of the twentieth century, giraffe were treated as a single species, Giraffa camelopardalis, divided into nine subspecies. Genetic work over the past decade has steadily undermined that. Whole-genome studies published from 2016 onward found deep divergences between groups, with little or no gene flow between them despite no obvious physical barrier.",
        "In August 2025 the IUCN SSC Giraffe and Okapi Specialist Group formally recognised four species: the northern giraffe (Giraffa camelopardalis), the reticulated giraffe (G. reticulata), the Masai giraffe (G. tippelskirchi) and the southern giraffe (G. giraffa). Under that arrangement the name Giraffa camelopardalis no longer covers all giraffe — it covers the northern group alone, comprising the Kordofan, Nubian and West African giraffe.",
        "This matters for conservation rather than filing. The single-species figure of roughly 97,500 animals reads as a large population under pressure. Broken into four, the picture changes: the Giraffe Conservation Foundation's current counts put the southern giraffe near 69,000 and the Masai near 44,000, while the entire northern giraffe group numbers around 7,000 — of which the West African giraffe, confined to Niger, accounts for fewer than 700.",
        "The Red List has not yet caught up. Assessments under the four-species taxonomy are pending, so the code carried on this page remains the 2016 species-level Vulnerable listing, alongside the 2018 subspecies assessments that already put Kordofan and Nubian giraffe in the Critically Endangered category.",
      ],
    },
    {
      id: "threats",
      title: "Decline and recovery",
      body: [
        "Giraffe numbers fell by an estimated 36 to 40% in the three decades to 2016, a decline severe enough to move the species from Least Concern to Vulnerable in a single step. The causes are habitat loss and fragmentation as land is converted to agriculture, illegal killing for meat and hides, and civil unrest across much of the northern range, where the worst-affected populations sit.",
        "The response has been quieter than the campaigns for elephant and rhino — the phrase 'silent extinction' was coined for exactly this — but it is producing results. Giraffe were listed on CITES Appendix II in 2019, regulating international trade in giraffe parts for the first time. Translocations have re-established populations in Uganda, Niger, Chad and Rwanda, and community conservancy models in Kenya and Namibia have stabilised others.",
        "Counted totals have risen since 2015, though the increase reflects better survey coverage as much as real growth. The honest summary is that giraffe are now being properly counted for the first time, that some populations are recovering strongly, and that a few — Kordofan and Nubian giraffe above all — remain in serious trouble.",
      ],
    },
  ],

  related: ["african-savanna-elephant", "black-rhinoceros", "lion"],
  tags: ["africa", "herbivore", "savanna", "megafauna", "vulnerable", "browser"],
  searchTerms: [
    "giraffa camelopardalis",
    "tallest animal",
    "giraffe neck vertebrae",
    "how many giraffe species",
    "giraffe height",
  ],

  faqs: [
    {
      q: "How many neck bones does a giraffe have?",
      a: "Seven — the same number as a human, a mouse and almost every other mammal. The difference is size: each cervical vertebra can be around 25 cm long. The giraffe neck is a standard mammalian neck scaled up, not a structure with extra parts.",
    },
    {
      q: "How tall is a giraffe?",
      a: "Bulls reach about 5.5 metres to the tips of the ossicones and cows about 4.5 metres, making the giraffe the tallest land animal alive. Even measured at the shoulder, before the neck begins, a bull stands around 3.3 metres — taller than a large horse. Newborn calves are already 1.5 to 1.8 metres tall.",
    },
    {
      q: "Is there one species of giraffe or four?",
      a: "Four, as of August 2025, when the IUCN SSC Giraffe and Okapi Specialist Group formally recognised the northern, reticulated, Masai and southern giraffe as separate species on genomic evidence. The IUCN Red List has not yet published assessments under that arrangement, so the current species-level code still refers to the older single-species listing of Giraffa camelopardalis as Vulnerable.",
    },
    {
      q: "Are giraffes endangered?",
      a: "It depends which giraffe. The 2016 species-level assessment lists giraffe as Vulnerable after a 36–40% decline over three generations. Individual populations differ enormously: the Kordofan and Nubian giraffe were assessed as Critically Endangered in 2018 and the reticulated giraffe as Endangered, while southern giraffe number around 69,000 and are increasing.",
    },
    {
      q: "How does a giraffe drink without passing out?",
      a: "Through a set of pressure-control adaptations. Valves in the jugular veins prevent blood flowing back to the head when it is lowered, and a fine network of vessels at the base of the skull, a rete mirabile, buffers the surge before it reaches the brain. The same system holds blood in reserve so cerebral pressure does not collapse when the head comes back up five metres.",
    },
  ],

  seo: {
    title: "Giraffe — Height, Neck Anatomy, Species Split & Conservation",
    description:
      "A researched profile of the giraffe (Giraffa camelopardalis): seven neck vertebrae, the blood-pressure system that makes five metres possible, the 2025 split into four species, and Red List status.",
    keywords: [
      "giraffe facts",
      "giraffa camelopardalis",
      "how tall is a giraffe",
      "giraffe neck vertebrae",
      "how many giraffe species",
    ],
  },

  sources: [
    {
      label: "Giraffa camelopardalis — Red List assessment (assessed 2016, published 2018)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/9194/136266699",
    },
    {
      label: "Four giraffe species officially recognised in major conservation reclassification (August 2025)",
      publisher: "IUCN",
      url: "https://iucn.org/press-release/202508/four-giraffe-species-officially-recognised-major-conservation-reclassification",
    },
    {
      label: "Giraffe species, subspecies and current population estimates",
      publisher: "Giraffe Conservation Foundation",
      url: "https://giraffeconservation.org/giraffe-species/",
    },
    {
      label: "Giraffes (Giraffa spp.) fact sheet — characteristics, behaviour and reproduction",
      publisher: "San Diego Zoo Wildlife Alliance Library",
      url: "https://ielc.libguides.com/sdzg/factsheets/giraffes",
    },
  ],

  updatedAt: "2026-07-29",
};

export default giraffe;
