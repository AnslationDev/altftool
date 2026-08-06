// Cheetah — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const cheetah = {
  slug: "cheetah",
  category: "mammals",
  name: "Cheetah",
  scientificName: "Acinonyx jubatus",
  otherNames: ["Hunting leopard", "Asiatic cheetah", "Southeast African cheetah"],

  summary:
    "The fastest land animal, built so completely around the sprint that it gave up the strength, the climbing ability and even the roar that every other big cat kept.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Male_cheetah_facing_left_in_South_Africa.jpg/1920px-Male_cheetah_facing_left_in_South_Africa.jpg",
    alt: "A male cheetah standing in profile, facing left, with the black tear marks running from eye to mouth",
    credit: "AfricanConservation / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cheetah_%28Acinonyx_jubatus%29_male_..._%2849037621467%29.jpg/1920px-Cheetah_%28Acinonyx_jubatus%29_male_..._%2849037621467%29.jpg",
      alt: "A male cheetah in open grassland in the Masai Mara, Kenya",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "A hunter of open ground",
      caption:
        "Cheetahs need room to accelerate, which ties them to grassland and open savanna. The same openness that makes the sprint possible also exposes every kill to lions and hyenas.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/003_Cheetah_hissing_after_a_meal_in_Kalahari_Desert_Photo_by_Giles_Laurent.jpg/1920px-003_Cheetah_hissing_after_a_meal_in_Kalahari_Desert_Photo_by_Giles_Laurent.jpg",
      alt: "A cheetah with its mouth open, hissing, in the Kalahari Desert",
      credit: "Giles Laurent / Wikimedia Commons",
      title: "A threat display, not a roar",
      caption:
        "The cheetah's voice box is built like a small cat's. It hisses, chirps and purrs continuously, but it physically cannot roar — the one big-cat trait it never evolved.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/67/Cheetah_sitting_close_up_-_DPLA_-_75c296ad0b7726835e93a5d964f7c8e3.jpg",
      alt: "Close view of a cheetah sitting upright, head and shoulders filling the frame",
      credit: "Garst, Warren, 1922-2016, photographer / Wikimedia Commons",
      title: "The tear marks and the small head",
      caption:
        "The black malar stripes are thought to cut glare from the sun during daylight hunts. The skull is unusually small and light for a cat this size — another weight saving in the service of speed.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Cheetahs_Lounging_on_a_Rock%2C_Tanzania.jpg",
      alt: "Several cheetahs resting together on a rock in Tanzania",
      credit: "no rights reserved / Wikimedia Commons",
      title: "Brothers hold the ground together",
      caption:
        "Females live alone, but males frequently form permanent coalitions with their littermates. A coalition holds a territory that a single male could not, and its members live measurably longer.",
    },
  ],

  headline: "The fastest land animal, and the most fragile",
  intro: [
    "Nothing on land moves faster. A cheetah reaches around 93 km/h in a real hunt and has been clocked near 100 km/h in controlled runs, and it gets there from a standing start in about three seconds — an acceleration figure that is arguably more remarkable than the top speed itself.",
    "Everything else about the animal was traded away to make that possible. The cheetah is light-boned and thin-skulled, its claws no longer retract properly, it cannot climb well, and it loses kills routinely to lions and hyenas that it has no means of fighting. Fewer than seven thousand mature animals remain across a range that has shrunk to under a tenth of its historical extent.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Felidae",
    genus: "Acinonyx",
    species: "Acinonyx jubatus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2024,
    populationTrend: "decreasing",
    populationEstimate: "Around 6,500 mature individuals across Africa and Iran",
    note: "Assessed Vulnerable at species level, but the picture underneath the code is worse than that suggests: the animals are split across roughly 33 subpopulations, only two of which hold more than 1,000 mature individuals, and two thirds hold fewer than 100. Two subspecies are separately assessed as Critically Endangered — the Asiatic cheetah (A. j. venaticus), down to an estimated 12 individuals in Iran as of 2022, and the Northwest African cheetah (A. j. hecki).",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.1–1.5 m",
      min: 1.1,
      max: 1.5,
      unit: "m",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.6–0.8 m",
      min: 0.6,
      max: 0.8,
      unit: "m",
      note: "Thick fur increases the tail's effective area by around 40%, so it works as a rudder during high-speed turns",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "0.67–0.94 m",
      min: 0.67,
      max: 0.94,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "21–65 kg",
      min: 21,
      max: 65,
      unit: "kg",
      note: "Roughly a third of a lion's mass; females average slightly smaller than males",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "93–104 km/h",
      min: 93,
      max: 104,
      unit: "km/h",
      note: "93 km/h is the fastest speed recorded from GPS collars on wild hunting cheetahs; 98 km/h was measured over 100 m by a captive female, Sarah, at Cincinnati Zoo in 2012, and 104 km/h is the highest reliably reported figure. The often-repeated 114 km/h comes from a measurement method later discredited",
    },
    {
      key: "acceleration",
      label: "Acceleration",
      value: "0–97 km/h in under 3 seconds",
      min: 0,
      max: 97,
      unit: "km/h",
      note: "The more remarkable number. Wild cheetahs average only 54 km/h across a hunt — what wins the chase is acceleration and the ability to decelerate and turn, not raw top speed",
    },
    {
      key: "stride-length",
      label: "Stride length",
      value: "4–7 m",
      min: 4,
      max: 7,
      unit: "m",
      note: "At full gallop a cheetah takes roughly four strides a second, and is airborne for much of each one",
    },
    {
      key: "territory-size",
      label: "Home range",
      value: "34–7,000 km²",
      min: 34,
      max: 7063,
      unit: "km²",
      note: "Enormously variable. Males in coalitions defend compact territories of a few hundred square kilometres; females range far more widely and are not territorial",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 93 days",
      min: 90,
      max: 95,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1–6 cubs",
      min: 1,
      max: 6,
      unit: "cubs",
      note: "Three to five is typical; litters of eight have been recorded",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "2–3 years",
      min: 2,
      max: 3,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "10–12 years in the wild",
      min: 10,
      max: 12,
      unit: "years",
      note: "Males average closer to eight, largely through fighting over territory. Captive animals reach 17–20 years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — small and medium antelope", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Females solitary; males form lifelong coalitions", icon: "Users" },
    { key: "activity", label: "Activity", value: "Diurnal — hunts by day, unusually for a large cat", icon: "Sun" },
    { key: "claws", label: "Claws", value: "Only semi-retractile, with no protective sheath", icon: "Footprints" },
    { key: "vocalisation", label: "Voice", value: "Chirps, hisses and purrs; cannot roar", icon: "Volume2" },
  ],

  highlights: ["top-speed", "acceleration", "weight", "activity"],

  distribution: {
    continents: ["Africa", "Asia"],
    regions: [
      "Namibia and Botswana",
      "South Africa",
      "Angola, Zambia and Mozambique",
      "Kenya and Tanzania",
      "Ethiopia and South Sudan",
      "Algeria and the Sahel",
      "Central Iran",
    ],
    habitats: [
      "Savanna and open grassland",
      "Arid scrub and semi-desert",
      "Dry woodland",
      "Mountain steppe",
    ],
    elevation: "Sea level to around 2,000 m, and higher in the Iranian and Saharan populations",
    note: "The species holds about 9% of its historical range. The southern African population spanning Namibia, Botswana, South Africa, Angola, Zambia and Mozambique is by far the largest, and most of those animals live outside protected areas on farmland and communal rangeland — which is why coexistence with livestock farmers, rather than reserve management, is the central conservation problem.",
  },

  sections: [
    {
      id: "speed",
      title: "How the sprint actually works",
      body: [
        "The headline number is unhelpful on its own. GPS collars fitted to wild cheetahs in Botswana recorded a maximum of 93 km/h, but the average speed across a successful hunt was only 54 km/h — barely faster than the prey. What separated the cheetah from its quarry was not velocity but the ability to change it: the collars recorded acceleration and braking forces far beyond anything measured in other land predators, with the animal shedding and regaining large amounts of speed within a single stride.",
        "The anatomy is organised around that. The spine flexes so far that the hind feet swing past the front ones, giving a stride of four to seven metres at roughly four a second. Claws stay permanently part-extended, without the protective sheaths other cats have, and act as sprint spikes. Enlarged nasal passages, lungs, heart and adrenal glands feed the effort. The tail, thickened by fur into a wide flat surface, works as a counterweight and rudder through turns.",
        "The cost is that none of it lasts. A chase averages under forty seconds and the cheetah is close to exhausted at the end of it, needing a long recovery before it can even begin to eat. That pause is when lions and spotted hyenas arrive, and it is why cheetahs lose a substantial share of their kills without contesting them.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting and prey",
      body: [
        "Cheetahs hunt in daylight, mostly early morning and late afternoon, which is unusual among large cats and is best read as avoidance rather than preference — lions and hyenas are least active then. Prey is medium-sized antelope in the 20 to 60 kg range: Thomson's gazelle, springbok, impala, and the young of larger species.",
        "The approach is a stalk to within a few tens of metres, followed by the sprint and a trip rather than a leap. The cheetah knocks the animal off balance with a paw to the hindquarters and then takes a suffocating throat hold, which it can maintain because the prey is light. Against anything heavier the strategy fails outright; the cheetah's jaw and skull are too lightly built to kill by force.",
        "Coalition males, hunting together, can take larger prey than a lone animal — wildebeest and young zebra are within reach for a group of three — which is one of several measurable advantages of the coalition arrangement.",
      ],
    },
    {
      id: "society",
      title: "Coalitions and solitary females",
      body: [
        "Cheetah society splits along sex lines more sharply than in most cats. Females live alone across large, undefended, overlapping home ranges, meeting males only to mate and raising cubs without any help.",
        "Males, by contrast, frequently stay with their littermates for life, forming coalitions of two or three — occasionally with unrelated males joining. A coalition can hold a compact, high-quality territory in a place where females concentrate, which a single male could not defend. Coalition members are heavier, hold territory longer and live longer than singleton males.",
        "Cubs are born in dense cover and moved between dens every few days. They carry a long silver-grey mantle of hair down the back and shoulders for their first months, which may make them resemble the aggressive honey badger and is thought to deter some predators. Even so, cub mortality is severe — in areas with high lion density, as many as nine in ten cubs fail to reach independence.",
      ],
    },
    {
      id: "genetics",
      title: "A species with almost no genetic variation",
      body: [
        "Cheetahs are unusually similar to one another at the genetic level, the legacy of a population crash and bottleneck around the end of the last ice age. Skin grafts exchanged between unrelated cheetahs are accepted rather than rejected — the immune systems cannot tell the individuals apart, which is the closest thing to direct proof of near-uniformity.",
        "The practical consequences show up in poor sperm quality, low fertility and unusual vulnerability to disease outbreaks in captive populations. It has also made captive breeding harder than for any other big cat, and it means that surviving fragments of the wild population carry very little of the raw material selection would need to adapt.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "Most surviving cheetahs live outside protected areas, which inverts the usual conservation model. Reserves that are good for lions are frequently bad for cheetahs, because lions kill cubs and steal kills; cheetahs often do better on ranchland, where their prey overlaps with livestock and they are shot as a result.",
        "The other pressures are habitat conversion, loss of prey, and the illegal trade in live cubs, which draws heavily on the Horn of Africa population and has extremely high mortality in transit. Trophy and problem-animal killing continues where the species is not protected.",
        "Work with farmers has produced some of the clearest results in large-carnivore conservation — livestock guarding dogs, in particular, have cut losses enough to reduce retaliatory killing substantially in Namibia. The Asiatic subspecies in Iran is a different order of problem: with an estimated twelve individuals remaining in 2022, it is among the most endangered cats in the world, and road collisions on highways crossing its range are a leading cause of death.",
      ],
    },
  ],

  related: ["leopard", "lion", "snow-leopard", "jaguar"],
  tags: ["big cat", "africa", "carnivore", "vulnerable", "grassland", "fastest"],
  searchTerms: ["acinonyx", "fastest land animal", "cheetah speed", "asiatic cheetah", "hunting leopard"],

  faqs: [
    {
      q: "How fast can a cheetah actually run?",
      a: "The fastest speed recorded from GPS collars on wild hunting cheetahs is 93 km/h, and the highest reliably reported figure of any kind is 104 km/h. A captive cheetah at Cincinnati Zoo was measured at 98 km/h over 100 m in 2012. The commonly quoted 114 km/h comes from an early measurement whose method has since been discredited, so it is best avoided.",
    },
    {
      q: "Is the cheetah's acceleration more impressive than its top speed?",
      a: "Arguably yes. GPS-collar work on wild cheetahs found that average hunting speed was only 54 km/h — little faster than the prey — and that what decided the chase was acceleration, braking and turning. A cheetah goes from standing to 97 km/h in under three seconds and can gain or lose large amounts of speed within a single stride.",
    },
    {
      q: "Why do cheetahs lose their kills so often?",
      a: "Because the sprint leaves them exhausted and they are too lightly built to fight. After a chase a cheetah needs a long recovery before it can feed, and in that window lions and spotted hyenas frequently arrive and take the carcass. The cheetah almost always gives it up rather than contest it — an injury would be fatal to an animal that has to sprint to eat.",
    },
    {
      q: "Can cheetahs roar?",
      a: "No. The cheetah's voice box is structured like a small cat's rather than a big cat's, so it purrs continuously and produces chirps, hisses and a bird-like call, but it has no roar. This is one of several traits that set it apart from the Panthera cats.",
    },
    {
      q: "How many cheetahs are left?",
      a: "Around 6,500 mature individuals, spread across roughly 33 subpopulations. Only two of those hold more than 1,000 animals and two thirds hold fewer than 100. The species is listed as Vulnerable, while the Asiatic cheetah in Iran — down to about 12 individuals in 2022 — and the Northwest African cheetah are both Critically Endangered.",
    },
  ],

  seo: {
    title: "Cheetah — Top Speed, Hunting, Coalitions & Conservation Status",
    description:
      "A researched profile of the cheetah (Acinonyx jubatus): what the speed records actually measured, the anatomy of the sprint, male coalitions, the genetic bottleneck, and why fewer than 7,000 remain.",
    keywords: [
      "cheetah facts",
      "acinonyx jubatus",
      "how fast is a cheetah",
      "fastest land animal",
      "cheetah conservation",
    ],
  },

  sources: [
    {
      label: "Acinonyx jubatus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/219/259025524",
    },
    {
      label: "Locomotion dynamics of hunting in wild cheetahs (Wilson et al., 2013)",
      publisher: "Nature",
      url: "https://www.nature.com/articles/nature12295",
    },
    {
      label: "About cheetahs",
      publisher: "Cheetah Conservation Fund",
      url: "https://cheetah.org/learn/about-cheetahs/",
    },
    {
      label: "Cheetah species account",
      publisher: "IUCN SSC Cat Specialist Group",
      url: "https://www.catsg.org/living-species-cheetah",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default cheetah;
