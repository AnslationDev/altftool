// Nile crocodile — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const nileCrocodile = {
  slug: "nile-crocodile",
  category: "reptiles",
  name: "Nile Crocodile",
  scientificName: "Crocodylus niloticus",
  otherNames: ["African crocodile", "Common crocodile"],

  summary:
    "Africa's largest crocodilian and the continent's most dangerous large predator to people, a river ambush hunter that guards its nest for three months and carries its hatchlings to the water in its jaws.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/8/81/NileCrocodile.jpg",
    alt: "Nile crocodiles resting on sand at a crocodile farm near Stellenbosch, South Africa",
    credit: "Dewet / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Crocodile_crocodylus_niloticus.jpg/1920px-Crocodile_crocodylus_niloticus.jpg",
      alt: "A Nile crocodile in the Okavango Delta, Botswana",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "A body built for the waterline",
      caption:
        "The eyes, ears and nostrils sit along the top of the skull on one plane, so the animal can watch a riverbank and breathe with everything else submerged. Nearly all of a Nile crocodile's hunting depends on that single arrangement.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/94/A_Nile_Crocodile.jpg",
      alt: "A Nile crocodile near a river bank",
      credit: "safaritravelplus / Wikimedia Commons",
      title: "Basking is not idleness",
      caption:
        "A crocodile has no internal thermostat, so hours on a bank are metabolic work: warming the blood enough to digest a meal. Gaping the jaws while basking sheds heat from the mouth lining once the body is up to temperature.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Cocodrilo_del_Nilo_%28Crocodylus_niloticus%29%2C_parque_nacional_de_Chobe%2C_Botsuana%2C_2018-07-28%2C_DD_52.jpg/1920px-Cocodrilo_del_Nilo_%28Crocodylus_niloticus%29%2C_parque_nacional_de_Chobe%2C_Botsuana%2C_2018-07-28%2C_DD_52.jpg",
      alt: "A Nile crocodile in Chobe National Park, Botswana",
      credit: "Diego Delso / Wikimedia Commons",
      title: "Armour with a second job",
      caption:
        "The ridged plates along the back are osteoderms — bone cores set into the skin. They armour the animal, and they also carry blood close to the surface, so a basking crocodile heats and cools through its own back.",
    },
  ],

  headline: "Africa's largest crocodilian, and its most dangerous",
  intro: [
    "The Nile crocodile is the largest reptile in Africa and the second largest in the world, behind only the saltwater crocodile. Males commonly reach 3.5 to 5 m and 225 to 750 kg; the largest verified individual, shot near Mwanza in Tanzania, measured 6.45 m. Females are roughly a third smaller.",
    "It is also the crocodilian that kills the most people, not because it is unusually aggressive but because it shares rivers and lakes with hundreds of millions of people who have to enter the water to fish, wash and collect it. The same species is a careful parent that guards a nest for three months and carries newly hatched young to the water in its mouth.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Crocodylia",
    family: "Crocodylidae",
    genus: "Crocodylus",
    species: "Crocodylus niloticus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2019,
    populationTrend: "unknown",
    populationEstimate: "No reliable continent-wide figure",
    note: "Assessed as Least Concern in 2019. The species was heavily hunted for hides through the middle of the twentieth century and is now recovering across much of eastern and southern Africa, helped by protected areas, ranching and managed harvest. It remains depleted or gone in parts of West and Central Africa, and the global listing hides that. CITES places it on Appendix I except for a list of countries whose populations are on Appendix II under quota.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Males 3.5–5 m; females 2.2–3.8 m",
      min: 2.2,
      max: 6.45,
      unit: "m",
      note: "The largest verified individual, taken near Mwanza in Tanzania, measured 6.45 m and was estimated at over a tonne",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males 225–750 kg; females 40–250 kg",
      min: 40,
      max: 750,
      unit: "kg",
      note: "Mass climbs far faster than length — a 5 m male is not twice a 2.5 m one but roughly eight times heavier",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "2,914–3,172 N measured, but only from two small individuals",
      min: 2914,
      max: 3172,
      unit: "N",
      note: "Erickson and colleagues (2012) tested every living crocodilian on a force transducer. Their two Nile crocodiles weighed about 86 kg — a fraction of adult size — so the figure is a floor, not a ceiling. No fully grown Nile crocodile has been measured directly",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "25–80 eggs",
      min: 25,
      max: 80,
      unit: "eggs",
      note: "Larger, older females lay bigger clutches; the extremes recorded run from about 15 to 95",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 90 days",
      min: 80,
      max: 90,
      unit: "days",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "12–16 years",
      min: 12,
      max: 16,
      unit: "years",
      note: "Reached at roughly 2.6 m in males and 2.2 m in females; size matters more than age",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "45–70 years",
      min: 45,
      max: 70,
      unit: "years",
      note: "Individuals held in captivity have passed 100, but wild ages that high are inferred rather than documented",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — fish above all, then anything that comes to drink", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Hunts mostly at night and at dawn; basks by day", icon: "Moon" },
    { key: "water-type", label: "Water type", value: "Fresh water — rivers, lakes and swamps, occasionally brackish estuaries", icon: "Droplet" },
    { key: "nest-type", label: "Nest type", value: "A hole dug in a sandbank, not a mound — unusual among large crocodilians", icon: "Egg" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — instead, thousands of dome pressure receptors on the jaws detect movement in the water", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Continuous — scales are replaced piecemeal, never as a single skin", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator of African rivers and lakes", icon: "Globe" },
  ],

  highlights: ["length", "weight", "nest-type", "ecological-role"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Nile basin from Lake Nasser southwards",
      "East Africa and the Rift Valley lakes",
      "Central Africa",
      "Southern Africa",
      "Madagascar",
    ],
    habitats: [
      "Large river",
      "Freshwater lake",
      "Marsh and swamp",
      "Seasonal floodplain",
      "Estuary and mangrove",
    ],
    elevation: "Sea level to around 1,800 m",
    note: "Despite the name, the species has been gone from the lower Nile in Egypt for over a century; the Egyptian population now sits above the Aswan High Dam in Lake Nasser. Madagascar holds an isolated population that includes crocodiles living in limestone caves.",
  },

  sections: [
    {
      id: "bite",
      title: "What is actually known about the bite",
      body: [
        "Nile crocodiles are routinely credited with a bite of '5,000 PSI'. That figure fails twice over. Pounds per square inch is a pressure, not a force, and the two are not interchangeable — and no measurement of that magnitude exists for the species.",
        "The only study to measure crocodilian bite force directly is Gregory Erickson's, published in 2012, which put mature animals of all 23 living species onto a padded force transducer. The highest reading from any crocodilian was 16,414 newtons, from a 4.59 m saltwater crocodile. The two Nile crocodiles in that dataset weighed about 86 kg each and bit at 2,914 to 3,172 N.",
        "That is not the species' ceiling; it is a measurement of two young animals. Bite force in crocodilians tracks body mass closely, and an 86 kg crocodile is perhaps a tenth the mass of a large male. What can honestly be said is that a full-grown Nile crocodile bites in the same league as a saltwater crocodile of the same size, and that nobody has yet put one on a transducer to find out exactly where.",
        "The asymmetry of the jaw matters more than the number anyway. The closing muscles are enormous; the opening muscles are so weak that a handler can hold the mouth shut with a strip of tape. Nothing about the jaw chews. Prey is gripped and then dismembered by the animal spinning on its own long axis — the death roll.",
      ],
    },
    {
      id: "hunting",
      title: "Ambush, and hunting together",
      body: [
        "Most of the diet is fish. Nile crocodiles patrol shallows and channels, and in places such as the Okavango they will herd fish into the shallows with their bodies and take them with sideways sweeps of the head. Larger individuals add whatever comes to the water's edge: antelope, warthog, zebra, young hippo, birds, and other crocodiles.",
        "The set-piece hunt is the ambush at a drinking spot or a river crossing. A crocodile holds station with only eyes and nostrils above water, closes the last few metres in a single lunge, and drags the animal under. Because they can hold their breath for well over an hour and their prey cannot, drowning does most of the work.",
        "They also feed socially in a way few reptiles do. Several crocodiles will hold a carcass steady while one rolls a mouthful free, and large kills draw an orderly queue rather than a scrum, with the biggest animals feeding first. A meal that size can last months: a large crocodile can survive a year on one substantial carcass.",
      ],
    },
    {
      id: "nesting",
      title: "Hole nests and temperature-set sex",
      body: [
        "Unlike the saltwater crocodile and the alligator, which pile up mounds of vegetation, the Nile crocodile digs. The female excavates a chamber in a sandbank a few metres from the water, lays 25 to 80 eggs, covers them, and stays with the nest for roughly three months, rarely leaving even to feed.",
        "Sex is decided by nest temperature rather than chromosomes. Eggs held between about 31 and 33 °C produce males; cooler and hotter nests both produce females. A nest just a degree or two out of that band can be entirely one sex, which is why climate shifts are a real concern for a species with no genetic sex determination at all.",
        "Hatchlings call from inside the eggs, and the mother digs them out in response. She then carries them to the water in a pouch in the floor of her mouth, sometimes several at a time, and guards the crèche for weeks. Even so, most of a clutch is lost — monitor lizards, mongooses, hyenas and birds take eggs and hatchlings, and the survivors are then eaten by fish, storks and larger crocodiles.",
      ],
    },
    {
      id: "suchus",
      title: "The crocodile that was split off",
      body: [
        "For most of the twentieth century all of Africa's large crocodiles were treated as one species. Genetic work published in 2011 confirmed something French naturalists had suspected in the 1800s: the crocodiles of West and Central Africa are a separate lineage, now recognised as the West African crocodile, Crocodylus suchus.",
        "The split is deep — the two are not sister species, and Crocodylus niloticus is more closely related to the crocodiles of the Americas than to its West African neighbour. Suchus is smaller and more tractable, which explains a long-standing puzzle: the crocodiles the ancient Egyptians kept in temples and mummified in their tens of thousands are mostly suchus, not niloticus.",
        "Practically, it means older figures for range, population and attack rates that say 'Nile crocodile' are describing two different animals. Every assessment made before the split needs reading with that in mind.",
      ],
    },
    {
      id: "people",
      title: "Attacks, hides and recovery",
      body: [
        "Nile crocodiles injure and kill more people than any other African animal apart from the hippopotamus, with hundreds of attacks reported each year and many more that never reach a record. The reason is exposure rather than temperament: the species occupies the rivers and lakes that rural communities depend on for water, fish and washing, and almost every attack happens at the water's edge.",
        "Reducing it is mostly a matter of infrastructure. Fenced washing enclosures, boreholes and piped water take people out of crocodile habitat and cut attacks sharply where they are installed, far more effectively than removing individual animals.",
        "The conservation story runs the other way. Commercial hide hunting between the 1940s and 1960s emptied much of the range. Protection, then ranching and quota-based harvest, brought numbers back across eastern and southern Africa, and the species was assessed as Least Concern in 2019. West and Central African populations — where the animal is often the newly recognised C. suchus — have not recovered in the same way, and remain thinly spread and poorly counted.",
      ],
    },
  ],

  related: ["saltwater-crocodile", "american-alligator"],
  tags: ["crocodilian", "apex predator", "africa", "freshwater", "reptile"],
  searchTerms: ["crocodylus niloticus", "african crocodile", "nile croc", "crocodile attacks africa"],

  faqs: [
    {
      q: "How big do Nile crocodiles get?",
      a: "Males usually reach 3.5 to 5 m and 225 to 750 kg, and females 2.2 to 3.8 m. The largest verified individual, killed near Mwanza in Tanzania, measured 6.45 m and was estimated at over a tonne. Only the saltwater crocodile grows larger.",
    },
    {
      q: "How strong is a Nile crocodile's bite?",
      a: "Nobody knows precisely, and the widely repeated '5,000 PSI' is wrong twice: PSI is a pressure rather than a force, and no such measurement exists. The only direct study, by Gregory Erickson and colleagues in 2012, tested two Nile crocodiles of about 86 kg and recorded 2,914 to 3,172 newtons. Those were young animals, so the true adult figure is much higher — probably comparable to a saltwater crocodile of the same size, whose record measurement is 16,414 N.",
    },
    {
      q: "Are Nile crocodiles the same as West African crocodiles?",
      a: "No. Genetic work confirmed in 2011 that the crocodiles of West and Central Africa are a separate species, Crocodylus suchus. They are smaller and less aggressive, and they are the crocodiles the ancient Egyptians kept in temples and mummified. Records published before the split lump the two together.",
    },
    {
      q: "Why are Nile crocodiles so dangerous to people?",
      a: "Because of where they live rather than how they behave. They occupy the rivers and lakes that rural communities rely on for water, fishing and washing, so people and crocodiles meet at the water's edge daily. Hundreds of attacks are reported each year. Fenced washing points and piped water reduce them far more reliably than removing individual crocodiles.",
    },
    {
      q: "Do Nile crocodiles look after their young?",
      a: "Yes, and unusually well for a reptile. The female digs a nest chamber in a sandbank and guards it for about three months, barely feeding. When the hatchlings call from inside the eggs she digs them out, carries them to the water in a pouch in the floor of her mouth, and stays with the group for weeks afterwards.",
    },
  ],

  seo: {
    title: "Nile Crocodile — Size, Bite Force, Nesting & Conservation",
    description:
      "A researched profile of the Nile crocodile (Crocodylus niloticus): how big it really gets, what its bite force has actually been measured at, hole nesting and maternal care, the West African crocodile split, and its Least Concern status.",
    keywords: [
      "nile crocodile facts",
      "crocodylus niloticus",
      "nile crocodile bite force",
      "nile crocodile size",
      "crocodylus suchus",
    ],
  },

  sources: [
    {
      label: "Crocodylus niloticus — Red List assessment (Isberg et al., 2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/45433088/3010181",
    },
    {
      label: "Nile Crocodile Crocodylus niloticus — species account",
      publisher: "IUCN SSC Crocodile Specialist Group",
      url: "https://www.iucncsg.org/365_docs/attachments/protarea/15_C-cf25967f.pdf",
    },
    {
      label:
        "Insights into the ecology and evolutionary success of crocodilians revealed through bite-force and tooth-pressure experimentation",
      publisher: "PLOS ONE (Erickson et al., 2012)",
      url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0031781",
    },
    {
      label: "Crocodylus niloticus entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Crocodylus&species=niloticus",
    },
  ],

  updatedAt: "2026-07-29",
};

export default nileCrocodile;
