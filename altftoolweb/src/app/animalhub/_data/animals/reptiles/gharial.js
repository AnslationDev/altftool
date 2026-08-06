// Gharial — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const gharial = {
  slug: "gharial",
  category: "reptiles",
  name: "Gharial",
  scientificName: "Gavialis gangeticus",
  otherNames: ["Gavial", "Fish-eating crocodile", "Mecho kumhir"],

  summary:
    "A river crocodilian with a snout too narrow for anything but fish, reduced to a few hundred breeding adults in fragments of the northern Indian subcontinent.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Gharial_%28Gavialis_gangeticus%29_male.jpg/1920px-Gharial_%28Gavialis_gangeticus%29_male.jpg",
    alt: "A male gharial on a sandbank of the Chambal River, the bulbous ghara visible at the tip of its snout",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/A_Gharial_%28Gavialis_gangeticus%29_at_Assam_State_Zoo.jpg/1920px-A_Gharial_%28Gavialis_gangeticus%29_at_Assam_State_Zoo.jpg",
      alt: "A gharial at Assam State Zoo, its long narrow snout held above the water",
      credit: "অজয় দাস / Wikimedia Commons",
      title: "A snout built for one job",
      caption:
        "The jaws are long, thin and light, which is what makes the sideways sweep through water fast enough to catch fish. The trade-off is a bite that cannot handle large struggling prey — this animal cannot do what a saltwater crocodile does.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Gharial_%28Gavialis_gangeticus%29_enclosure_ar_Rasikbeel_Mini_Zoo%2C_Tufanganj%2C_Cooch_Behar%2C_West_Bengal_01.jpg/1920px-Gharial_%28Gavialis_gangeticus%29_enclosure_ar_Rasikbeel_Mini_Zoo%2C_Tufanganj%2C_Cooch_Behar%2C_West_Bengal_01.jpg",
      alt: "A gharial resting in shallow water in an enclosure at Rasikbeel, West Bengal",
      credit: "Kingshuk Mondal / Wikimedia Commons",
      title: "The most aquatic crocodilian",
      caption:
        "Gharials leave the water only to bask and to nest. Their limbs cannot lift the body into the high walk that other crocodilians use on land, so out of water they push themselves along on their bellies.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Gharial_%28Gavialis_gangeticus%29_enclosure_ar_Rasikbeel_Mini_Zoo%2C_Tufanganj%2C_Cooch_Behar%2C_West_Bengal_02.jpg/1920px-Gharial_%28Gavialis_gangeticus%29_enclosure_ar_Rasikbeel_Mini_Zoo%2C_Tufanganj%2C_Cooch_Behar%2C_West_Bengal_02.jpg",
      alt: "A gharial in an enclosure pool at Rasikbeel Mini Zoo, seen from the side",
      credit: "Kingshuk Mondal / Wikimedia Commons",
      title: "Bred in captivity, released to rivers",
      caption:
        "Almost every gharial alive in India and Nepal today descends in part from the captive-rearing programmes begun in the early 1980s, which collect eggs, raise the young past their most vulnerable years and release them into protected river stretches.",
    },
  ],

  headline: "A pot on the nose, and a fish-only jaw",
  intro: [
    "The gharial is among the longest of all living crocodilians — males reach 3 to 6 m, females 2.6 to 4.5 — and the least like the popular idea of one. Its snout is a long, narrow tube carrying around 110 interlocking teeth, an arrangement that sweeps sideways through water fast enough to catch fish and is useless for anything bigger. It is the most thoroughly aquatic crocodilian alive, leaving the river only to bask and to nest.",
    "Adult males carry a bulbous growth at the tip of the snout called a ghara, after the earthenware pot it resembles; the animal's name comes from it. The ghara partly covers the nostrils and works as a resonator, giving the male's calls a buzzing quality no other crocodilian produces. The species is Critically Endangered: the most recent Red List assessment put the global adult population at a median of about 650 animals.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Crocodilia",
    family: "Gavialidae",
    genus: "Gavialis",
    species: "Gavialis gangeticus",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2019,
    populationTrend: "increasing",
    populationEstimate: "About 650 adults (median), within a range of 300–900",
    note: "Critically Endangered since 2007, reaffirmed in the 2019 assessment by Lang, Chowfin and Ross, which put the adult metapopulation at a conservative median of 650 from surveys conducted between 2010 and 2017. The species survives in around 14 disjunct locations in India and Nepal, roughly two per cent of its historical range. Counts have since risen sharply where protection is real: the National Chambal Sanctuary, which holds the large majority of the world's gharials, recorded 2,456 animals of all sizes in 2024, and the Uttar Pradesh stretch counted 2,026 in 2025 — its highest since surveys began in 1975.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Males 3–6 m; females 2.6–4.5 m",
      min: 2.6,
      max: 6,
      unit: "m",
      note: "Among the longest of all crocodilians. Body mass is poorly documented for a species this rare, so length is the reliable size figure",
    },
    {
      key: "tooth-count",
      label: "Teeth",
      value: "Around 110, all similar in size and interlocking",
      min: 106,
      max: 110,
      unit: "teeth",
      note: "More than any other crocodilian, and needle-sharp rather than crushing — a trap for fish rather than a tool for holding large prey",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "20–95 eggs, averaging around 40",
      min: 20,
      max: 95,
      unit: "eggs",
      note: "Among the largest eggs of any crocodilian, buried in nest holes dug in moist sandbanks",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 60–80 days",
      min: 60,
      max: 80,
      unit: "days",
      note: "Timed so that hatching precedes the monsoon; a late flood over a nesting bank can destroy a whole season's output",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Piscivore — adults eat almost nothing but fish; juveniles also take insects, crustaceans and frogs", icon: "Fish" },
    { key: "ghara", label: "Ghara", value: "A cartilaginous boss on the snout tip of adult males; partly covers the nostrils and acts as an acoustic resonator as well as a visual signal", icon: "Volume2" },
    { key: "activity", label: "Activity", value: "Basks on sandbanks by day, forages in the water; almost never travels overland", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "A hole dug in a moist sandbank; females nest communally and guard the site, and males help escort the creche", icon: "Egg" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — no infrared pits. Crocodilians instead carry pressure-sensitive dome receptors, which in gharials are confined to the jaws", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Continuous and piecemeal — crocodilians replace individual scutes rather than shedding a whole skin", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Top freshwater fish predator and an indicator of river health; its decline tracks the decline of the rivers themselves", icon: "Globe" },
  ],

  highlights: ["length", "tooth-count", "ghara", "diet-type"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Chambal River, India",
      "Girwa and Ghaghara rivers, India",
      "Son River, India",
      "Gandak River, India and Nepal",
      "Rapti–Narayani, Chitwan, Nepal",
    ],
    habitats: [
      "Deep, fast-flowing river channels",
      "Sandbanks and mid-river islands",
      "River confluences and deep pools",
    ],
    elevation: "River plains of the northern Indian subcontinent, generally below 300 m",
    note: "Once found from the Indus to the Irrawaddy, the gharial is now confined to around 14 disjunct river stretches in India and Nepal — roughly two per cent of its historic range. It needs a specific combination of deep water for foraging, steep sandbanks for nesting and adjacent shallows for hatchlings, which is exactly the combination that dams, barrages and sand mining remove.",
  },

  sections: [
    {
      id: "snout",
      title: "The specialist's jaw",
      body: [
        "A gharial's snout is three to five times longer than the base of its skull is wide, and that geometry is the whole animal in miniature. A narrow, light jaw meets very little water resistance, so it can be swung sideways through the water fast — fast enough to intercept a fish that has already started to turn.",
        "The teeth match. There are around 110 of them, more than in any other crocodilian, all roughly the same size, needle-sharp and interlocking when the jaws close. They hold a slippery fish rather than crushing it; the gharial then manoeuvres the catch and swallows it head-first.",
        "The cost is that the gharial cannot do what other large crocodilians do. It cannot take a mammal at a drinking bank and hold it against its struggles; a slender snout would break. Attacks on people are essentially absent, and where human remains have been found in gharial stomachs the usual explanation is scavenging or the swallowing of jewellery from cremation grounds along the Ganges.",
      ],
    },
    {
      id: "ghara",
      title: "The pot that makes the sound",
      body: [
        "Adult male gharials grow a hollow, cartilaginous boss on the tip of the snout, over the nostrils. Local people named it after the ghara, an earthenware water pot; the animal is named after that in turn. It appears only in males, only at maturity, and is the most conspicuous sexual dimorphism of any crocodilian.",
        "It is not just ornament. Because it sits over the nasal openings, air driven out through the nose passes through it, and the structure works as a resonator — turning what would be a hiss into a buzz. It also functions as a visual badge of maturity, visible above the waterline from a distance.",
        "Recording work on the Chambal added a second signal. Over 2017 to 2019, hydrophones and aerial microphones along a 115 km stretch captured 130 percussive underwater 'pops' from seven wild adult males. Only ghara-bearing adult males produced them, they were made underwater, and their timing was individually distinctive — a male-specific advertisement that had gone unrecorded until someone put a microphone in the river.",
      ],
    },
    {
      id: "breeding",
      title: "Sandbanks, nests and creches",
      body: [
        "Gharials mate at the end of the cold season. In spring, females gather at traditional nesting banks and dig holes in moist sand above the waterline, laying between 20 and 95 eggs — around 40 is typical, and they are among the largest eggs any crocodilian produces. Females nest close together and guard the area.",
        "The eggs incubate for about 60 to 80 days, timed so that hatching comes before the monsoon arrives and the river rises. The margin is thin: a nesting bank that floods early, or one that has been dug away for construction sand, loses everything on it.",
        "Hatchlings stay in shallow water through their first year, foraging on insects and small fish, and are attended by adults — including males, which is unusual. As they grow they move out into deeper water. The bottleneck for the population is not egg production but survival through those first years, which is precisely why the recovery programmes work by rearing young in captivity and releasing them at a size that survives.",
      ],
    },
    {
      id: "collapse",
      title: "How the population collapsed",
      body: [
        "The wild population has fallen drastically since the 1930s and now occupies about two per cent of its historical range. The first phase was hunting — for skins, for trophies, and for body parts used in indigenous medicine — compounded by egg collection.",
        "The pressures that keep it down are different and harder. Dams and barrages fragment the rivers and change their flow. Irrigation withdrawal lowers water levels in the dry season. Sand mining removes the banks the animals nest on. Fishing depletes the fish they eat, and gill nets drown gharials directly: a long, tooth-studded snout is close to impossible to free from monofilament netting.",
        "A further decline of 58 per cent was recorded between 1997 and 2006, and it was that collapse that led to the Critically Endangered listing in 2007.",
      ],
    },
    {
      id: "recovery",
      title: "What is working",
      body: [
        "Captive rearing and release began in India and Nepal in the early 1980s: eggs are collected from wild nests, hatched and raised in protected conditions, and the young released once past the size at which almost everything eats them. Tens of thousands of animals have been released this way.",
        "The results are uneven but real. The National Chambal Sanctuary now holds the large majority of the world's gharials; its 2024 survey counted 2,456 animals across all size classes, and the Uttar Pradesh section counted 2,026 in 2025, the highest number since counts began in 1975. On the Gandak, a recovery project assisted the hatching of more than 640 gharials between 2020 and 2024, re-establishing a population that had all but vanished.",
        "Those counts include juveniles, which is why the Red List figure — a median of 650 breeding adults — is so much smaller. Recovery of numbers is not the same as recovery of a breeding population, and the underlying threats to the rivers have not gone away.",
      ],
    },
  ],

  related: ["saltwater-crocodile", "nile-crocodile", "american-alligator"],
  tags: ["crocodilian", "river", "asia", "critically endangered", "reptile", "fish eater"],
  searchTerms: ["gavialis gangeticus", "gavial", "indian gharial", "ghara", "chambal crocodile"],

  faqs: [
    {
      q: "What is the bump on a male gharial's nose?",
      a: "It is called a ghara, after the earthenware pot it resembles — the animal's name comes from it. Adult males grow this hollow cartilaginous boss over the nostrils at maturity. It works as an acoustic resonator, giving the male's calls a buzzing quality, and as a visible badge of maturity above the waterline. Females do not have one.",
    },
    {
      q: "Are gharials dangerous to humans?",
      a: "Essentially not. The snout is long, thin and light — built to sweep through water after fish — and could not hold a struggling mammal. Adults eat almost nothing but fish. Where human remains have turned up in gharials, the usual explanations are scavenging or the swallowing of jewellery from cremation grounds along the rivers.",
    },
    {
      q: "How many gharials are left?",
      a: "The 2019 Red List assessment put the global adult population at a median of about 650, within a range of 300 to 900, based on surveys from 2010 to 2017. Total counts including juveniles are much higher and rising — the National Chambal Sanctuary alone recorded 2,456 animals in 2024 — but breeding adults remain the limiting number.",
    },
    {
      q: "Why can't gharials walk properly on land?",
      a: "Their limbs cannot lift the body clear of the ground into the high walk other crocodilians use. On land a gharial pushes itself along on its belly, which is one reason it is the most thoroughly aquatic crocodilian and leaves the water only to bask and to nest.",
    },
    {
      q: "What is driving the gharial's decline?",
      a: "River modification more than hunting. Dams and barrages fragment the rivers, irrigation lowers dry-season water levels, and sand mining removes the banks the females nest on. Overfishing depletes their food, and gill nets drown them outright — a long, tooth-studded snout cannot be pulled free of monofilament netting.",
    },
  ],

  seo: {
    title: "Gharial — Ghara, Fish-Eating Jaws & Critically Endangered Status",
    description:
      "A researched profile of the gharial (Gavialis gangeticus): the narrow fish-catching snout and its 110 teeth, the male's ghara acoustic resonator, sandbank nesting, and a Critically Endangered population of roughly 650 adults.",
    keywords: [
      "gharial facts",
      "gavialis gangeticus",
      "gharial ghara",
      "fish eating crocodile",
      "gharial population",
    ],
  },

  sources: [
    {
      label: "Gavialis gangeticus — Red List assessment (Lang, Chowfin & Ross, 2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/8966/149227430",
    },
    {
      label: "Gharial species profile",
      publisher: "Smithsonian's National Zoo and Conservation Biology Institute",
      url: "https://nationalzoo.si.edu/animals/gharial",
    },
    {
      label: "Gavial — description, snout and dentition",
      publisher: "Encyclopaedia Britannica",
      url: "https://www.britannica.com/animal/gavial",
    },
    {
      label: "Gavialis gangeticus entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Gavialis&species=gangeticus",
    },
  ],

  updatedAt: "2026-07-29",
};

export default gharial;
