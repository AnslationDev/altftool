// Leopard — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const leopard = {
  slug: "leopard",
  category: "mammals",
  name: "Leopard",
  scientificName: "Panthera pardus",
  otherNames: ["African leopard", "Indian leopard", "Amur leopard", "Panther"],

  summary:
    "The most widely distributed wild cat on earth, and the one that survives closest to people — a solitary generalist that hauls its kills into trees to keep them from lions and hyenas.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/African_leopard_male_%28cropped%29.jpg/1920px-African_leopard_male_%28cropped%29.jpg",
    alt: "A male African leopard in the Maasai Mara, its rosette-patterned coat clearly visible",
    credit: "Sumeet Moghe / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Day_11_Leopard_%28Panthera_pardus%29_eating_an_impala_in_a_tree_..._%2853226590140%29.jpg/1920px-Day_11_Leopard_%28Panthera_pardus%29_eating_an_impala_in_a_tree_..._%2853226590140%29.jpg",
      alt: "A leopard feeding on an impala carcass wedged in the fork of a tree, Kruger National Park",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "The larder above the ground",
      caption:
        "Hoisting a carcass into a tree is the leopard's answer to living alongside lions and hyenas. A kill left on the ground is usually lost; the same kill in a fork five metres up can feed the cat for days.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/9a/African_Leopard_%28Panthera_pardus_pardus%29_160809135.jpg",
      alt: "An African leopard feeding on a carcass on the ground in South Africa",
      credit: "Johan Beets / Wikimedia Commons",
      title: "A generalist's menu",
      caption:
        "Leopards take a wider range of prey than any other big cat — well over ninety species have been recorded — but they concentrate on animals in the 10 to 40 kg band that one cat can kill and move alone.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Day_1_Leopard_%28Panthera_pardus%29_female_crossing_the_road_just_before_exit_..._%2853202660752%29.jpg/1920px-Day_1_Leopard_%28Panthera_pardus%29_female_crossing_the_road_just_before_exit_..._%2853202660752%29.jpg",
      alt: "A female leopard walking across a road in Kruger National Park",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Comfortable near people",
      caption:
        "More than any other big cat, the leopard persists in landscapes humans use. That tolerance is why the species still spans two continents — and why most conflict with people involves leopards rather than lions or tigers.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Day_12_Leopard_%28Panthera_pardus%29_male_with_porcupine_quills_embed_in_its_face_..._%2853228638978%29.jpg/1920px-Day_12_Leopard_%28Panthera_pardus%29_male_with_porcupine_quills_embed_in_its_face_..._%2853228638978%29.jpg",
      alt: "A male leopard with porcupine quills embedded in its face, Kruger National Park",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "The cost of a difficult meal",
      caption:
        "Porcupines are worth attacking and dangerous to attack. Embedded quills work inward over weeks and can abscess badly enough to stop a leopard hunting, which is a common route to starvation in older cats.",
    },
  ],

  headline: "The widest range of any wild cat",
  intro: [
    "The leopard occupies more of the world than any other cat, across Africa and Asia, from rainforest to desert margin to the snow of the Russian Far East, and from sea level to high mountain. It manages this by being unfussy: it will eat almost anything it can catch, and it will live remarkably close to people.",
    "That breadth conceals real trouble. Modern range is roughly a quarter of the historical extent, and several regional subspecies have been reduced to a few dozen or a few hundred animals and are separately assessed as Endangered or Critically Endangered. The global figures and the subspecies figures tell two very different stories.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Felidae",
    genus: "Panthera",
    species: "Panthera pardus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2025,
    populationTrend: "decreasing",
    populationEstimate: "No reliable global total; confirmed extant range is about 7.6 million km², roughly a quarter of the historical range",
    note: "The Vulnerable code cited here is the 2025 species-level assessment of Panthera pardus (Stein et al.). Several subspecies carry their own, far worse assessments: the Amur leopard of Russia and China and the Arabian leopard are both Critically Endangered, the Javan and Persian leopards Endangered, the Sri Lankan leopard Vulnerable and the Indian leopard Near Threatened. Quoting the species code alone systematically understates the risk to any particular population.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "0.92–1.83 m",
      min: 0.92,
      max: 1.83,
      unit: "m",
      note: "Size varies more across the range than in any other big cat; desert and island populations are markedly smaller",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.66–1.02 m",
      min: 0.66,
      max: 1.02,
      unit: "m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "0.6–0.7 m",
      min: 0.6,
      max: 0.7,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "20.5–72 kg",
      min: 20.5,
      max: 72,
      unit: "kg",
      note: "Males 30.9–72 kg, females 20.5–43 kg — one of the largest sex differences among the big cats",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Over 58 km/h",
      min: 58,
      max: 58,
      unit: "km/h",
      note: "Held only over short distances; the leopard hunts by stalking to close range rather than by pursuit",
    },
    {
      key: "territory-size",
      label: "Home range",
      value: "14–450 km²",
      min: 14,
      max: 451,
      unit: "km²",
      note: "Tracks prey density closely. Serengeti females hold 14–16 km²; in the arid northeast of Namibia males range over 450 km²",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "90–105 days",
      min: 90,
      max: 105,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "2–4 cubs",
      min: 2,
      max: 4,
      unit: "cubs",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 2–2.5 years",
      min: 2,
      max: 2.5,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "12–17 years in the wild",
      min: 12,
      max: 17,
      unit: "years",
      note: "The oldest recorded captive leopard passed 24 years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — favours prey of 10–40 kg", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Solitary and territorial", icon: "User" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal and crepuscular", icon: "Moon" },
    { key: "climbing", label: "Climbing", value: "Exceptional — hauls carcasses heavier than itself into trees", icon: "TreePine" },
    { key: "adaptability", label: "Habitat tolerance", value: "The broadest of any wild cat, from rainforest to desert edge", icon: "Globe" },
  ],

  highlights: ["weight", "climbing", "adaptability", "social-structure"],

  distribution: {
    continents: ["Africa", "Asia"],
    regions: [
      "Sub-Saharan Africa",
      "North Africa and the Arabian Peninsula",
      "India, Nepal and Sri Lanka",
      "Iran, the Caucasus and Central Asia",
      "Southeast Asia and southern China",
      "Java, Indonesia",
      "Russian Far East and northeast China",
    ],
    habitats: [
      "Savanna and open woodland",
      "Tropical and montane forest",
      "Arid scrub and semi-desert",
      "Rocky hills and mountain slopes",
      "Agricultural land and urban fringe",
    ],
    elevation: "Sea level to over 5,000 m in the Himalaya",
    note: "The range is by far the largest of any wild cat but is now a patchwork rather than a continuum. Losses across sub-Saharan Africa, the Middle East, Southeast Asia and China have been partly offset by gains in India and southwest Asia, but the overall confirmed range has still contracted by around 11% since the previous assessment.",
  },

  sections: [
    {
      id: "adaptability",
      title: "Why the range is so large",
      body: [
        "The leopard's advantage is that it has almost no requirements. It does not need large prey, a particular habitat type, or an absence of people. Studies across its range have recorded prey from dung beetles and fish up to young giraffe, with more than ninety species documented, and it will scavenge readily.",
        "That flexibility lets it occupy ground no other big cat can hold. Leopards live in Sahelian scrub, in Javan rainforest, on the snow-covered ridges of Primorye, on the rocky escarpments of Oman, and in the outskirts of Mumbai, where a population inside and around Sanjay Gandhi National Park lives at a density that would be impossible for lions or tigers.",
        "The proximity to people cuts both ways. It is the main reason the species has survived where larger cats have been eliminated, and it is also why leopards account for most large-cat conflict incidents in Africa and Asia — a leopard that takes goats and dogs is far more likely to be trapped or poisoned than one that stays in a reserve.",
      ],
    },
    {
      id: "trees",
      title: "Hoisting and caching prey",
      body: [
        "A leopard's kill on open ground is provisional. Lions, spotted hyenas and packs of wild dogs will all take a carcass from a leopard, and the leopard, at a third to a half their mass, cannot defend it. The response is to move the food upward.",
        "Leopards drag carcasses hundreds of metres and then climb with them, using shoulder and neck musculature disproportionate to their size. The most-cited example is a young giraffe of nearly 125 kg lifted more than five and a half metres into a tree — well over the leopard's own body weight, carried vertically.",
        "Cached this way, a kill lasts. The leopard feeds over several days, returning between rests, which changes the economics of hunting entirely: fewer kills are needed, and the risk of losing each one falls sharply. Where competitors are absent — parts of Sri Lanka, for instance — leopards cache far less, which is good evidence the behaviour is about competition rather than habit.",
      ],
    },
    {
      id: "subspecies",
      title: "One species, very different fates",
      body: [
        "Taxonomists currently recognise eight subspecies, and the Red List assesses several of them separately. Doing so matters, because the species-level Vulnerable listing averages together populations in wholly different conditions.",
        "The Amur leopard of the Russian Far East and northeast China is Critically Endangered; it fell to fewer than thirty animals and has since recovered to around 128 to 130 sub-adults and adults, one of the more encouraging recent trends for any big cat. The Arabian leopard, also Critically Endangered, is estimated at 100 to 120 individuals split between Oman and Yemen with perhaps a handful in Saudi Arabia.",
        "The Javan leopard is Endangered, at an estimated 188 to 571 mature individuals across 22 fragments. The Persian leopard of Iran, the Caucasus and Central Asia is Endangered. The Sri Lankan leopard is Vulnerable and the Indian leopard Near Threatened. In 2024 the West African population of the African subspecies was assessed as Endangered on an estimate of about 354 mature animals.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting and behaviour",
      body: [
        "Leopards hunt mostly at night, by stalking. The approach is slow and low, using cover and often taking many minutes, and the strike comes from within a few metres — usually a bite to the throat or the back of the skull. Prey in the 10 to 40 kg band is preferred: impala, bushbuck, chital, small antelope, monkeys, hares and birds.",
        "They are solitary and territorial, with males holding ranges that overlap several females. Boundaries are advertised with scrape marks, scent and a rasping, repeated call often described as sounding like a saw cutting wood.",
        "Melanistic leopards — black panthers — occur throughout the range and are commonest in dense, wet forest in Southeast Asia. The coat is not plain black: the rosettes remain visible in raking light, and the same pattern is there under the darker pigment.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "Habitat conversion and fragmentation are the base pressure, compounded by the loss of wild prey to bushmeat hunting, which pushes leopards toward livestock and therefore toward retaliation. Poaching for skins and for body parts used in traditional medicine and ceremonial dress continues at scale in parts of Africa and Asia.",
        "Trophy hunting is legal in several African countries and is contentious; quota-setting has been tightened in some, and South Africa has suspended and reinstated leopard hunting quotas repeatedly in response to population data.",
        "Where measures have been targeted at specific subspecies, results have followed. Land Of The Leopard National Park in Russia, established in 2012, covers most of the Amur leopard's remaining range and is credited with much of that population's recovery. Programmes supplying synthetic furs to replace leopard skins in religious dress in southern Africa have measurably reduced demand for real ones.",
      ],
    },
  ],

  related: ["jaguar", "cheetah", "snow-leopard", "tiger"],
  tags: ["big cat", "apex predator", "africa", "asia", "carnivore", "vulnerable", "solitary"],
  searchTerms: ["panthera pardus", "black panther", "amur leopard", "leopard vs jaguar", "african leopard"],

  faqs: [
    {
      q: "What is the difference between a leopard and a jaguar?",
      a: "Size and pattern, mostly. Jaguars are stockier and heavier, with a broader head, and their rosettes have small spots inside them; a leopard's rosettes are empty. They also do not overlap geographically — jaguars live in the Americas, leopards in Africa and Asia. Behaviourally, jaguars kill by biting through the skull while leopards take the throat, and leopards cache kills in trees far more.",
    },
    {
      q: "Why do leopards drag their kills up trees?",
      a: "To keep them. Lions, hyenas and wild dogs all steal from leopards, and a leopard is too light to fight any of them for a carcass. Hauling the kill into a fork several metres up puts it out of reach, and lets the leopard feed on it over several days. One recorded case involved a young giraffe of almost 125 kg lifted more than five metres into a tree.",
    },
    {
      q: "Is a black panther a separate species?",
      a: "No. A black panther is a melanistic leopard in Africa and Asia, or a melanistic jaguar in the Americas. In both cases the rosette pattern is still present and is visible in the right light — the coat is dark, not patternless. Melanism is commonest in dense humid forest, where the darker coat appears to help in low light.",
    },
    {
      q: "Are leopards endangered?",
      a: "The species as a whole is listed as Vulnerable in the 2025 Red List assessment, having lost roughly three quarters of its historical range. Individual subspecies are in far worse condition and are assessed separately: the Amur and Arabian leopards are Critically Endangered, the Javan and Persian leopards Endangered.",
    },
    {
      q: "Where do leopards live?",
      a: "Across sub-Saharan Africa, parts of North Africa and Arabia, and through South, Central and Southeast Asia to the Russian Far East and Java. It is the widest distribution of any wild cat, spanning rainforest, savanna, desert margin, mountains above 5,000 m and the edges of major cities.",
    },
  ],

  seo: {
    title: "Leopard — Size, Tree-Caching, Subspecies & Conservation Status",
    description:
      "A researched profile of the leopard (Panthera pardus): the widest range of any wild cat, why it hauls kills into trees, how the separately assessed subspecies differ, and its Vulnerable status.",
    keywords: [
      "leopard facts",
      "panthera pardus",
      "leopard vs jaguar",
      "black panther",
      "amur leopard",
    ],
  },

  sources: [
    {
      label: "Panthera pardus — Red List assessment (2025)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/15954/286153337",
    },
    {
      label: "Leopard species account",
      publisher: "IUCN SSC Cat Specialist Group",
      url: "https://www.catsg.org/living-species-leopard",
    },
    {
      label: "Arabian leopard species account",
      publisher: "IUCN SSC Cat Specialist Group",
      url: "https://www.catsg.org/arabianleopard",
    },
    {
      label: "West African leopards assessed as Endangered",
      publisher: "Panthera",
      url: "https://panthera.org/blog-post/west-african-leopards-are-now-endangered-theres-still-chance-change-course",
    },
  ],

  updatedAt: "2026-07-29",
};

export default leopard;
