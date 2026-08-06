// Saltwater crocodile — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const saltwaterCrocodile = {
  slug: "saltwater-crocodile",
  category: "reptiles",
  name: "Saltwater Crocodile",
  scientificName: "Crocodylus porosus",
  otherNames: ["Estuarine crocodile", "Indo-Pacific crocodile", "Saltie"],

  summary:
    "The largest living reptile and the owner of the strongest bite ever measured in any animal, at home in tidal rivers, mangrove swamps and the open sea between India and Fiji.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/SaltwaterCrocodile%28%27Maximo%27%29.jpg/1920px-SaltwaterCrocodile%28%27Maximo%27%29.jpg",
    alt: "Maximo, a saltwater crocodile over four and a half metres long, at the St. Augustine Alligator Farm",
    credit: "Molly Ebersold / St. Augustine Alligator Farm / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/de/A_Saltwater_crocodile_in_Sundarban_%28cropped%29.jpg",
      alt: "A saltwater crocodile on a mudbank in the Sundarbans mangrove forest, Bangladesh",
      credit: "Chhabbir / Wikimedia Commons",
      title: "The mangrove specialist",
      caption:
        "The Sundarbans, where the Ganges and Brahmaputra meet the Bay of Bengal, is the western end of the species' range. Tidal mangrove is its core habitat: brackish, sheltered, and rich in the fish and crustaceans that make up most of a crocodile's diet.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/09/A_Saltwater_crocodile_in_Sundarban.jpg",
      alt: "A saltwater crocodile resting among mangrove roots and mud in the Sundarbans",
      credit: "Chhabbir / Wikimedia Commons",
      title: "Armour you can see",
      caption:
        "The raised scutes along the back are bone-cored plates called osteoderms. They act as armour, but they also work as solar panels — a basking crocodile warms its blood through them, which is why so much of the day is spent motionless on a bank.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Australian_Saltwater_Crocodile.jpg/1920px-Australian_Saltwater_Crocodile.jpg",
      alt: "A saltwater crocodile in the Daintree River, Queensland, Australia",
      credit: "Ffyfejam / Wikimedia Commons",
      title: "Everything above the waterline",
      caption:
        "Eyes, ears and nostrils sit on the same raised plane along the top of the skull, so a crocodile can watch, hear and breathe with the rest of its body submerged and invisible. It is the whole basis of the ambush.",
    },
  ],

  headline: "The largest living reptile, and the strongest bite ever measured",
  intro: [
    "Male saltwater crocodiles commonly reach four to five metres and several hundred kilograms, and the largest verified individuals approach 6.3 m. No other living reptile comes close. Females are far smaller, rarely passing three metres, and the difference in size between the sexes is among the most extreme of any large vertebrate.",
    "The name is only half right. Salties tolerate the sea rather than requiring it: they hold territory in tidal rivers and mangrove estuaries, move into fresh water upstream, and cross open ocean between islands. Salt glands on the tongue let them shed excess sodium and chloride, which is what makes those crossings survivable — and which is why one species occupies a range stretching from eastern India to Fiji.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Crocodylia",
    family: "Crocodylidae",
    genus: "Crocodylus",
    species: "Crocodylus porosus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "stable",
    populationEstimate: "Roughly 500,000 mature individuals",
    note: "The assessment was carried out in 2019 and published in 2021. It treats the global population as secure because of large numbers, extensive habitat and effective management in Australia, Papua New Guinea and, to a lesser extent, Indonesia, with recovering populations in the Solomon Islands, Sarawak and Sabah. Least Concern globally hides real regional trouble: the species is depleted or effectively gone across much of mainland Southeast Asia. CITES lists it on Appendix I except for the Australian, Indonesian and Papua New Guinean populations, which are on Appendix II.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Males 4–5 m; females 2.7–3.1 m",
      min: 2.7,
      max: 6.3,
      unit: "m",
      note: "The largest verified individual measured about 6.3 m. Lolong, caught in Mindanao in 2011 at 6.17 m and 1,075 kg, is the largest crocodile ever held in captivity",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males 400–1,000 kg; females 76–103 kg",
      min: 76,
      max: 1000,
      unit: "kg",
      note: "The sexes differ more in mass than in length, because a large male is not just longer but far heavier-built",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "16,414 N (3,689 lbf) — the highest ever measured in a living animal",
      min: 16414,
      max: 16414,
      unit: "N",
      note: "Recorded by Erickson and colleagues in 2012 from a 4.59 m, 531 kg individual biting a force transducer directly. Widely misquoted as '3,700 PSI' — the measurement is a force, not a pressure",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "40–60 eggs",
      min: 40,
      max: 60,
      unit: "eggs",
      note: "Clutches of up to 90 have been recorded",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 80–98 days",
      min: 80,
      max: 98,
      unit: "days",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Females 12–14 years; males around 16",
      min: 12,
      max: 16,
      unit: "years",
      note: "Size matters more than age — females mature at roughly 2.1 m and males at about 3.3 m",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "70 years or more",
      min: 70,
      max: 70,
      unit: "years",
      note: "Cassius, a 5.48 m male kept on Green Island, Queensland, died in November 2024 and was thought to be over 110",
    },
    {
      key: "migration-distance",
      label: "Long-distance travel",
      value: "Up to 590 km recorded at sea",
      min: 590,
      max: 590,
      unit: "km",
      note: "A satellite-tagged 3.84 m male covered 590 km in 25 days along Cape York, timing the journey to a seasonal current",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — fish, crustaceans, birds, reptiles and mammals", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Hunts mainly at night; basks by day", icon: "Moon" },
    { key: "water-type", label: "Water type", value: "Brackish estuaries above all, but also fresh water and open sea", icon: "Droplet" },
    { key: "nest-type", label: "Nest type", value: "A mound of vegetation and mud the female builds and guards", icon: "Egg" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — instead, thousands of dome pressure receptors on the jaws read ripples in the water", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Continuous — individual scales are replaced piecemeal, never as one whole skin", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator of tropical estuaries", icon: "Globe" },
  ],

  highlights: ["length", "weight", "bite-force", "ecological-role"],

  distribution: {
    continents: ["Asia", "Australia"],
    regions: [
      "Eastern India and Bangladesh",
      "Sri Lanka and Myanmar",
      "Mainland Southeast Asia",
      "Indonesia and Malaysia",
      "Papua New Guinea and the Solomon Islands",
      "Northern Australia",
      "Palau and Vanuatu",
    ],
    habitats: [
      "Mangrove swamp",
      "Tidal river and estuary",
      "Coastal lagoon",
      "Freshwater swamp and billabong",
      "Open sea between islands",
    ],
    elevation: "Sea level, though individuals move well upriver into fresh water",
    note: "The range is the widest of any crocodilian, and ocean travel is why: rather than swimming continuously, individuals wait for a favourable tidal or seasonal current and ride it, which keeps island populations genetically connected and has prevented the species splitting into regional forms.",
  },

  sections: [
    {
      id: "size",
      title: "How big they actually get",
      body: [
        "Reported sizes for this species are unusually unreliable, because a crocodile in water is hard to measure and a dead one shrinks. The largest length accepted on solid evidence is around 6.3 m, reconstructed from a 6.2 m dried skin and skull taken in Papua New Guinea in 1979 and corrected for shrinkage.",
        "The best-documented giant was alive within living memory. Lolong, captured in Bunawan in the southern Philippines in September 2011, measured 6.17 m and weighed 1,075 kg on a truck weighbridge — the largest crocodile ever held in captivity, and the only animal of that size to be formally measured rather than estimated. He died in February 2013.",
        "Typical animals are much smaller. A mature male is usually four to five metres and somewhere between 400 and 1,000 kg; a mature female is 2.7 to 3.1 m and often under 100 kg. Growth never quite stops, so the very large individuals are simply the very old ones that survived every territorial fight along the way.",
      ],
    },
    {
      id: "bite",
      title: "The strongest bite ever measured",
      body: [
        "Most bite-force figures quoted for animals are modelled rather than measured — estimates derived from jaw geometry and muscle volume. The saltwater crocodile's is not. In work published in 2012, Gregory Erickson and colleagues persuaded mature adults of all 23 living crocodilian species to bite a padded force transducer, and one Crocodylus porosus, 4.59 m long and 531 kg, produced 16,414 newtons — 3,689 pounds of force. It remains the highest bite force ever recorded in a living animal.",
        "That number is routinely mangled into '3,700 PSI'. Pounds per square inch is a pressure, not a force, and the two are not interchangeable; the crocodile's remarkable figure is a force, and quoting it as a pressure makes the animal sound weaker than it is while also being simply wrong.",
        "The jaw is built asymmetrically. Closing muscles are enormous, but the muscles that open the jaw are feeble — which is why a crocodile's mouth can be held shut by hand, and why handlers tape it. Once closed, nothing about the bite is designed to chew. The teeth grip and puncture, and the animal detaches a mouthful by spinning its whole body on its long axis: the death roll.",
      ],
    },
    {
      id: "saltwater",
      title: "Salt glands and ocean crossings",
      body: [
        "Alligators and caimans cannot handle sea water for long. Crocodylus porosus can, because of 28 to 40 small glands sitting under the surface of the tongue, each opening through its own pore. They actively excrete sodium and chloride, and they are plastic: animals acclimated to salt water secrete at nearly three times the rate of animals kept in fresh, and the blood supply to the glands thickens to match.",
        "This is what turns a river predator into an ocean traveller. Satellite and acoustic tracking in North Queensland showed that crocodiles do not swim across open water so much as commute on it — one 3.84 m male left the Kennedy River and covered 590 km in 25 days down the west coast of Cape York, departing in step with a seasonal current in the Gulf of Carpentaria and stopping when the current turned against him.",
        "The behaviour explains a puzzle. A species spread from India to Fiji ought to have fragmented into local forms long ago; current-assisted dispersal keeps the populations mixing, and that is why, across that enormous range, there is still only one saltwater crocodile.",
      ],
    },
    {
      id: "nesting",
      title: "Nests, and sand temperature deciding sex",
      body: [
        "Females build a mound rather than a hole — a heap of vegetation and mud raised above the wet-season flood line, into which 40 to 60 eggs are laid. The rotting plant matter generates heat, and the mother stays close, defending the nest for the roughly three months of incubation and later carrying hatchlings to the water in her mouth.",
        "Sex is not written in the eggs. Like all crocodilians, this species has temperature-dependent sex determination, and it follows a female–male–female pattern: males are produced in a narrow band around 31.6 °C, while both cooler and warmer nests yield females. A shift of a degree or two changes the whole clutch.",
        "Even with maternal defence, mortality is severe. Nests flood, monitor lizards and pigs dig them out, and hatchlings that reach the water are eaten by fish, birds and larger crocodiles. Very few of a clutch reach the size at which nothing hunts them any more.",
      ],
    },
    {
      id: "people",
      title: "Recovery, and living alongside a predator",
      body: [
        "Commercial hide hunting through the middle of the twentieth century emptied much of the range. In Australia's Northern Territory the population fell to a few thousand animals before unrestricted hunting was stopped in 1971. It has since climbed past 100,000 and is now thought to be at or near what the habitat can hold — one of the most complete recoveries of a large predator anywhere.",
        "Recovery brought back the conflict. Northern Australian rivers that were effectively safe for a generation are not any more. Attacks remain uncommon in absolute terms — the Nile crocodile kills far more people each year, simply because far more people live and work in its water — but a saltwater crocodile attack is unusually likely to be fatal, given the size of the animal and the way it takes prey. Management has leaned on public warning, removal of problem animals near towns, and ranching schemes that give landholders and communities a financial reason to tolerate crocodiles on their land.",
        "Elsewhere the picture is much worse. Across mainland Southeast Asia the species is depleted or functionally gone, lost to hunting, mangrove clearance and conversion of estuaries to aquaculture. The global Least Concern listing is a statement about Australia, Papua New Guinea and Indonesia far more than about the species everywhere it once lived.",
      ],
    },
  ],

  related: ["komodo-dragon", "green-sea-turtle"],
  tags: ["crocodilian", "apex predator", "estuarine", "australia", "asia", "reptile"],
  searchTerms: ["crocodylus porosus", "saltie", "estuarine crocodile", "largest reptile", "strongest bite"],

  faqs: [
    {
      q: "How strong is a saltwater crocodile's bite?",
      a: "16,414 newtons — 3,689 pounds of force — measured directly from a 4.59 m, 531 kg animal biting a force transducer in a 2012 study by Gregory Erickson and colleagues. It is the highest bite force ever recorded in a living animal. The figure is often repeated as '3,700 PSI', which is wrong: PSI is a pressure, and the measurement is a force.",
    },
    {
      q: "How big do saltwater crocodiles get?",
      a: "Mature males usually reach four to five metres and 400 to 1,000 kg, and females 2.7 to 3.1 m. The largest verified individual was about 6.3 m. The best-documented giant was Lolong, caught in the Philippines in 2011, who measured 6.17 m and weighed 1,075 kg — the largest crocodile ever kept in captivity.",
    },
    {
      q: "Can saltwater crocodiles really live in the sea?",
      a: "Yes. They have 28 to 40 salt glands beneath the surface of the tongue that excrete excess sodium and chloride, and the glands become more active and better supplied with blood in animals living in salt water. That lets them cross open ocean between islands, which is why the species is found from eastern India to Fiji.",
    },
    {
      q: "Why are saltwater crocodiles listed as Least Concern if they were nearly wiped out?",
      a: "Because the recovery in some countries has been enormous. Australia's Northern Territory went from a few thousand animals before hunting stopped in 1971 to more than 100,000 today, and Papua New Guinea and Indonesia hold large populations under management. The global listing masks the fact that across much of mainland Southeast Asia the species is depleted or effectively gone.",
    },
    {
      q: "What decides whether a crocodile hatchling is male or female?",
      a: "Nest temperature, not chromosomes. Saltwater crocodiles follow a female–male–female pattern: males hatch from eggs held in a narrow band around 31.6 °C, while both cooler and warmer nests produce females. A change of a degree or two in the mound can shift the entire clutch.",
    },
  ],

  seo: {
    title: "Saltwater Crocodile — Size, Bite Force, Range & Conservation",
    description:
      "A researched profile of the saltwater crocodile (Crocodylus porosus): the largest living reptile, its record 16,414 N measured bite force, salt glands and ocean crossings, nesting, and Least Concern status.",
    keywords: [
      "saltwater crocodile facts",
      "crocodylus porosus",
      "saltwater crocodile bite force",
      "largest reptile",
      "estuarine crocodile",
    ],
  },

  sources: [
    {
      label: "Crocodylus porosus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/5668/3047556",
    },
    {
      label:
        "Insights into the ecology and evolutionary success of crocodilians revealed through bite-force and tooth-pressure experimentation",
      publisher: "PLOS ONE (Erickson et al., 2012)",
      url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0031781",
    },
    {
      label: "Estuarine crocodiles ride surface currents to facilitate long-distance travel",
      publisher: "Journal of Animal Ecology (Campbell et al., 2010)",
      url: "https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/j.1365-2656.2010.01709.x",
    },
    {
      label: "Crocodylus porosus entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Crocodylus&species=porosus",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default saltwaterCrocodile;
