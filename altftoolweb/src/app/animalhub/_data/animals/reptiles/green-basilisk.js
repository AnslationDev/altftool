// Green basilisk — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const greenBasilisk = {
  slug: "green-basilisk",
  category: "reptiles",
  name: "Green Basilisk",
  scientificName: "Basiliscus plumifrons",
  otherNames: ["Plumed basilisk", "Double-crested basilisk", "Jesus Christ lizard"],

  summary:
    "A Central American rainforest lizard that escapes across the surface of water at about 1.5 metres a second — and is close to the physical limit of the trick by the time it is fully grown.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Green_Basilisk%2C_Alajuela%2C_Costa_Rica.jpg/1920px-Green_Basilisk%2C_Alajuela%2C_Costa_Rica.jpg",
    alt: "A bright green basilisk lizard on a branch in Alajuela Province, Costa Rica",
    credit: "Connor Long / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/48/Basiliscus_plumifrons_%28Corytophanidae%29_%28Green_Basilisk%29%2C_Los_Chiles%2C_Costa_Rica.jpg",
      alt: "A green basilisk photographed at Los Chiles, Costa Rica",
      credit: "Frank van de Putte at Observation.org / Wikimedia Commons",
      title: "Green against green",
      caption:
        "The body colour is a match for wet rainforest foliage, broken by rows of small white and black flecks along the neck and back. A motionless basilisk on a streamside branch is genuinely hard to pick out.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Basilic_vert_%28Basiliscus_plumifrons%29.jpg/1920px-Basilic_vert_%28Basiliscus_plumifrons%29.jpg",
      alt: "A green basilisk at Selva Verde, Costa Rica, showing the crest on its head",
      credit: "Lucas Vogel / Wikimedia Commons",
      title: "Why it is called plumed",
      caption:
        "Adult males carry a pair of plume-like crests on the head plus crests along the back and tail; females have only a single, much smaller head crest. The sexes are separable at a glance, which is unusual among lizards this size.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Basiliscus_plumifrons_%28Ca%C3%B1o_Negro%29_mirror.jpg/1920px-Basiliscus_plumifrons_%28Ca%C3%B1o_Negro%29_mirror.jpg",
      alt: "A green basilisk at the water's edge at Caño Negro, Costa Rica, reflected in the surface",
      credit: "Hans Hillewaert / Wikimedia Commons",
      title: "Always within reach of water",
      caption:
        "Green basilisks live along rainforest streams and rivers and rarely move far from them. Water is both the escape route and the fallback — if the surface run fails, the lizard simply swims, and can stay submerged.",
    },
  ],

  headline: "Running on water, measured",
  intro: [
    "The green basilisk is a slender, vivid green lizard of the Caribbean-slope rainforests of Central America, reaching about 90 cm from snout to tail tip, three quarters of which is tail. Males carry plume-like crests on the head, back and tail; females have only a small head crest.",
    "Its reputation rests on one behaviour. Startled, a basilisk drops from its perch and sprints across the surface of a stream on its hind legs — the reason for the nickname Jesus Christ lizard. This has been measured properly rather than just filmed: the run goes at roughly 1.5 metres a second and covers around 4.5 metres before the animal sinks in and swims. It is not surface tension holding it up, and adults are close to the physical limit of being able to do it at all.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Corytophanidae",
    genus: "Basiliscus",
    species: "Basiliscus plumifrons",
  },

  conservation: {
    status: "LC",
    assessmentYear: null,
    populationTrend: "stable",
    populationEstimate: "No global figure; common within suitable streamside rainforest",
    note: "Listed Least Concern on the Red List under taxon ID 203046, but the publication year of that assessment could not be confirmed from a citable source — the entry has been carried in Red List releases at least since version 2022.2, and the assessment page itself is not retrievable without a browser session. The pressures on the species are habitat-driven: clearance of lowland rainforest for agriculture and logging, pollution of the streams it depends on, and collection for the international pet trade.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "Up to about 90 cm from snout to tail tip",
      min: 60,
      max: 90,
      unit: "cm",
      note: "Roughly three quarters of that is tail, which acts as a counterweight during bipedal running",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Adults up to about 200 g; hatchlings under 2 g",
      min: 2,
      max: 200,
      unit: "g",
      note: "That hundredfold spread is the whole story of water running — the physics change completely across it",
    },
    {
      key: "water-running-speed",
      label: "Water-running speed",
      value: "About 1.5 m/s — roughly 5.4 km/h",
      min: 5.4,
      max: 5.8,
      unit: "km/h",
      note: "Force-plate work on Basiliscus plumifrons recorded speeds up to about 1.6 m/s. Recorded in km/h so the figure sits alongside other speed facts, though it is not comparable to a land sprint",
    },
    {
      key: "water-running-distance",
      label: "Distance across water",
      value: "About 4.5 m before dropping in",
      min: 4.5,
      max: 4.5,
      unit: "m",
      note: "Light juveniles manage considerably further; heavy adults often only a few metres",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "15–17 eggs, with four or five clutches a season",
      min: 15,
      max: 17,
      unit: "eggs",
      note: "Buried in a shallow scrape in damp soil and abandoned",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "Eight to ten weeks",
      min: 56,
      max: 70,
      unit: "days",
      note: "A clutch hatches over one or two days; the young can run on water immediately, and do it better than their parents",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore — insects, spiders, small lizards and small mammals, plus fruit and flowers", icon: "Bug" },
    { key: "locomotion", label: "Locomotion", value: "Arboreal, semi-aquatic and bipedal — runs across water on the hind legs and swims well beneath it", icon: "Footprints" },
    { key: "activity", label: "Activity", value: "Diurnal, usually perched on streamside branches", icon: "Sun" },
    { key: "sexual-dimorphism", label: "Crests", value: "Males have head, dorsal and tail crests; females only a small head crest", icon: "Sparkles" },
    { key: "social-structure", label: "Social structure", value: "Strongly territorial — males will not tolerate one another at close quarters", icon: "Users" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — no infrared pits. It hunts entirely by sight from a perch", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "In flakes and patches through the year, more often while growing", icon: "RefreshCw" },
  ],

  highlights: ["water-running-speed", "water-running-distance", "weight", "locomotion"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Eastern Honduras",
      "Nicaragua",
      "Costa Rica",
      "Western Panama",
    ],
    habitats: [
      "Lowland tropical rainforest",
      "Streams, rivers and riverbank vegetation",
      "Forest edge and agroforestry plots",
    ],
    elevation: "Sea level to around 775 m",
    note: "A Caribbean-slope animal for the most part, running from eastern Honduras through Nicaragua and Costa Rica into western Panama, with populations also recorded on the Pacific side in south-western Costa Rica. The binding requirement is running water: the species is found in hot, humid forest with streams and rivers, and is essentially absent from otherwise suitable forest without them.",
  },

  sections: [
    {
      id: "water-running",
      title: "The stride, in three parts",
      body: [
        "A basilisk's water stride divides into three phases. In the slap, the foot comes down almost vertically and hits the surface — a flat, hard impact that pushes water down and away. In the stroke, the foot sweeps backward and inward through the water while an air cavity opens around it, so the foot is pushing against water rather than against a collapsing bubble. In the recovery, the foot is pulled up and out before that cavity closes over it, and returns to the start of the next step.",
        "Surface tension has almost nothing to do with it, despite how often that is claimed. The support comes from momentum: the animal accelerates a mass of water downwards on every step, and the reaction pushes it up. The critical part is the timing of the recovery — if the foot is still in the water when the cavity collapses, the closing water grabs it and the stride is lost.",
        "Because the foot enters at an angle, the slap generates nearly as much forward thrust as the backward stroke does, so the same movement is doing propulsion and support at once. The lizard also has to manage sideways forces: with only two feet and a high centre of mass, it is constantly pushing laterally to avoid tipping.",
        "Fringes of scale along the hind toes spread on the downstroke to increase the surface pushing against the water and fold back on recovery, which reduces the drag of pulling the foot out again.",
      ],
    },
    {
      id: "size-limit",
      title: "Why the young are better at it",
      body: [
        "Water running is an ability that scales badly, and it has been quantified. Combining hydrodynamic tests on model basilisk feet with kinematic measurement of live lizards, researchers built an allometric model of the maximum upward impulse a basilisk of a given size can produce.",
        "A 2 g lizard can generate more than twice the impulse it needs to hold its own weight up — 225 per cent, an enormous margin. A 200 g adult, under optimal conditions, manages 111 per cent. It can support itself and essentially nothing more.",
        "The reason is geometry. Body mass rises with the cube of length, while foot area rises with the square, so the force available per gram falls steadily as the animal grows. A hatchling has capacity to spare; an adult is running at the edge of what its legs can do, with no allowance for a bad step, a rough surface or fatigue.",
        "In the field this shows up as distance. Juveniles can cross ten to twenty metres of open water. Heavy adults manage a few metres and then drop in — which is not really a failure, since a basilisk that hits the water simply swims, and can stay submerged out of sight.",
      ],
    },
    {
      id: "escape",
      title: "What the run is for",
      body: [
        "Water running is an escape response, not a way of getting about. Basilisks spend the day perched on branches over streams, watching for insects and for danger, and the surface sprint is what happens when something comes at them.",
        "That perch position is chosen with the escape in mind. Dropping from a branch straight onto water puts the lizard on the one surface no arboreal snake, no cat and few birds will follow it across, and it does so with the momentum of the fall already converted into forward speed.",
        "The fallback is just as important as the run. Basilisks are strong swimmers and readily dive, staying under and out of sight rather than surfacing at a predictable spot. The full escape sequence is drop, sprint, sink, swim — and any stage of it may be where the pursuit ends.",
      ],
    },
    {
      id: "life",
      title: "Territory, breeding and diet",
      body: [
        "Green basilisks are omnivores with a broad appetite: insects and spiders make up the bulk of it, along with small lizards and occasional small mammals, and they take fruit and flowers as well. They hunt visually from a stationary perch, which is why streamside branches with a clear view are worth defending.",
        "They defend them vigorously. Males are territorial to the point that two adult males cannot be housed together in captivity, and displays involve head-bobbing and crest presentation before anything physical happens. In the wild, where a male's territory overlaps several females' ranges, larger aggregations do occur along productive stretches of river.",
        "Breeding is prolific by lizard standards: a female lays 15 to 17 eggs in a shallow scrape in damp soil, up to four or five times in a season, and covers them over. Nothing is guarded. After eight to ten weeks the clutch hatches over a day or two, and the hatchlings are independent immediately — and, weighing under 2 g, already better at running on water than any adult.",
      ],
    },
  ],

  related: ["frilled-lizard", "veiled-chameleon", "thorny-devil"],
  tags: ["lizard", "central america", "rainforest", "arboreal", "reptile", "semi-aquatic"],
  searchTerms: ["basiliscus plumifrons", "plumed basilisk", "jesus christ lizard", "jesus lizard", "water running lizard"],

  faqs: [
    {
      q: "How fast can a basilisk run on water?",
      a: "About 1.5 metres a second — roughly 5.4 km/h — covering around 4.5 metres before it drops in and swims. Force measurements on plumed basilisks have recorded speeds up to about 1.6 m/s. Light juveniles cover considerably more ground than heavy adults.",
    },
    {
      q: "How does a basilisk run on water without sinking?",
      a: "Momentum, not surface tension. Each stride has three phases: a slap in which the foot drives down through the surface, a stroke in which it sweeps backward while an air cavity opens around it, and a recovery in which the foot is pulled clear before that cavity closes. The lizard is accelerating a mass of water downwards on every step and being pushed up by the reaction.",
    },
    {
      q: "Why can't adult basilisks run on water as well as juveniles?",
      a: "Because the ability scales badly with size. Mass rises with the cube of body length while foot area rises with the square, so force available per gram falls as the animal grows. Modelling from hydrodynamic and kinematic measurements found a 2 g lizard can generate 225 per cent of the impulse needed to hold up its own weight, while a 200 g adult manages just 111 per cent — enough to support itself and nothing to spare.",
    },
    {
      q: "Why is it called the Jesus Christ lizard?",
      a: "For the water-running, which looks from a distance like walking on the surface. The formal common names — plumed basilisk, double-crested basilisk — refer instead to the pair of plume-like crests adult males carry on the head, alongside crests down the back and tail.",
    },
    {
      q: "What happens if a basilisk cannot make it across?",
      a: "Nothing much. It sinks in and swims, and it swims well — basilisks readily dive and stay submerged out of sight rather than surfacing where a predator is waiting. The surface sprint is the first stage of an escape, not the whole of it.",
    },
  ],

  seo: {
    title: "Green Basilisk — Water Running Speed, Crests & Rainforest Life",
    description:
      "A researched profile of the green or plumed basilisk (Basiliscus plumifrons): the measured mechanics of running on water, the slap-stroke-recovery stride, why adults are at the physical limit, and its Central American rainforest range.",
    keywords: [
      "green basilisk facts",
      "basiliscus plumifrons",
      "jesus christ lizard",
      "basilisk running on water",
      "plumed basilisk",
    ],
  },

  sources: [
    {
      label: "Basiliscus plumifrons — Red List entry (Least Concern, taxon ID 203046)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/search?query=Basiliscus%20plumifrons&searchType=species",
    },
    {
      label: "Size-dependence of water-running ability in basilisk lizards (Glasheen & McMahon, 1996)",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/199/12/2611/7144/Size-Dependence-of-Water-Running-Ability-in",
    },
    {
      label: "Three-dimensional hindlimb kinematics of water running in the plumed basilisk (Hsieh, 2003)",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/206/23/4363/13957/Three-dimensional-hindlimb-kinematics-of-water",
    },
    {
      label: "How 'Jesus lizards' walk on water",
      publisher: "National Geographic",
      url: "https://www.nationalgeographic.com/animals/article/news-jesus-lizards-basilisks-walk-water",
    },
    {
      label: "Green crested basilisk species profile",
      publisher: "Smithsonian's National Zoo and Conservation Biology Institute",
      url: "https://nationalzoo.si.edu/animals/green-crested-basilisk",
    },
  ],

  updatedAt: "2026-07-29",
};

export default greenBasilisk;
