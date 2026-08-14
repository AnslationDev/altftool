// Giant panda — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const giantPanda = {
  slug: "giant-panda",
  category: "mammals",
  name: "Giant Panda",
  scientificName: "Ailuropoda melanoleuca",
  otherNames: ["Panda bear", "Panda"],

  summary:
    "A bear with the digestive system of a carnivore that has committed almost entirely to bamboo, and the only species whose conservation success is famous enough to have changed its own Red List category.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/1920px-Grosser_Panda.JPG",
    alt: "A giant panda, its black ears, eye patches and limbs contrasting with white fur",
    credit: "Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/75/Acrobatics_giant_Panda.jpg",
      alt: "A giant panda balanced in an acrobatic pose, gripping with its forepaws",
      credit: "Marian78ro / Wikimedia Commons",
      title: "A bear that still climbs",
      caption:
        "Pandas are competent climbers from cubhood and retain the ability as adults, which is unusual for a bear of this weight. Cubs in the wild spend much of their first year in trees, where they are out of reach of the leopards and dholes that take young pandas.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Giant_panda_enrichment_at_Chimelong_Safari_Park%2C_Guangzhou.jpg/1920px-Giant_panda_enrichment_at_Chimelong_Safari_Park%2C_Guangzhou.jpg",
      alt: "A giant panda lying on an enrichment structure at Chimelong Safari Park in Guangzhou, China",
      credit: "Coconutchickenyy / Wikimedia Commons",
      title: "The economics of a low-value diet",
      caption:
        "A panda digests only about 17% of what it swallows, so it compensates with volume and by doing as little as possible between meals. Feeding occupies much of the day and night in long bouts, and almost every other behaviour is arranged around conserving energy.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Qinling_Giant_Panda%2C_Shaanxi%2C_China.jpg/1920px-Qinling_Giant_Panda%2C_Shaanxi%2C_China.jpg",
      alt: "A Qinling giant panda in Shaanxi Province, China",
      credit: "no rights reserved / Wikimedia Commons",
      title: "Six mountains, six populations",
      caption:
        "Wild pandas survive in six separate mountain ranges in Sichuan, Shaanxi and Gansu. The Qinling animals of Shaanxi are genetically and cranially distinct from the rest and are treated as a separate subspecies — a consequence of populations that have been cut off from one another for a long time.",
    },
  ],

  headline: "A carnivore that gave up meat",
  intro: [
    "The giant panda is a bear. Its gut is short and simple like a carnivore's, it lacks the multi-chambered stomach and the long fermentation time of a true herbivore, and it still carries the genes for a meat-eating digestive tract. It nonetheless eats bamboo for roughly 99% of its diet, and it does so by brute force — up to 38 kg of it in a day, of which it can digest about a sixth.",
    "It is also the animal that conservation chose as its emblem, and that has produced an unusual amount of hard data. China has run four national panda surveys, and the fourth, published in 2015, was the evidence that persuaded the IUCN to move the species from Endangered to Vulnerable.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Ursidae",
    genus: "Ailuropoda",
    species: "Ailuropoda melanoleuca",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2016,
    populationTrend: "increasing",
    populationEstimate: "1,864 wild pandas aged 1.5 years and older (2015 national survey), of which roughly 1,000 are mature adults",
    note: "Downlisted from Endangered to Vulnerable in September 2016 — the current listing is the 2017 errata version of that assessment. The trigger was China's Fourth National Survey, which found 1,864 wild pandas aged 1.5 years and over, a rise of about 17% in a decade. Roughly 1,000 of those are breeding adults, which is why the species is Vulnerable rather than something safer. China disputed the downlisting at the time, arguing it would encourage complacency, and did not change its own national listing from endangered to vulnerable until July 2021. Chinese authorities reported the wild population approaching 1,900 in 2024.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.2–1.9 m",
      min: 1.2,
      max: 1.9,
      unit: "m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "0.6–0.9 m",
      min: 0.6,
      max: 0.9,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "70–160 kg",
      min: 70,
      max: 160,
      unit: "kg",
      note: "Most adults weigh 100–115 kg. Females run 10–20% smaller than males, at roughly 70–125 kg",
    },
    {
      key: "daily-food-intake",
      label: "Daily food intake",
      value: "12–38 kg of bamboo",
      min: 12,
      max: 38,
      unit: "kg/day",
      note: "Ten to eighteen kilograms when eating leaves and stems, and up to 38 kg of fresh shoots, which are mostly water. About 17% of it is actually digested",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "About 1,300 N at the canines",
      min: 1300,
      max: 1300,
      unit: "N",
      note: "Measured at 1,299 newtons at the canines and 1,816 newtons at the carnassials in a 117.5 kg animal — among the strongest bites of any carnivoran, and the reason a bear that eats grass still has a predator's skull",
    },
    {
      key: "territory-size",
      label: "Home range",
      value: "3–10 km²",
      min: 3,
      max: 10,
      unit: "km²",
      note: "Averaging about 5 km². Males hold larger ranges that overlap those of several females; a female concentrates almost all her activity in a small core",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–8 years",
      min: 4,
      max: 8,
      unit: "years",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "95–160 days",
      min: 95,
      max: 160,
      unit: "days",
      note: "The wide spread is caused by delayed implantation — actual foetal development takes only about six to eight weeks",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1–2 cubs",
      min: 1,
      max: 2,
      unit: "cubs",
      note: "Twins are born in roughly half of pregnancies, but a wild mother almost always raises only one",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 20 years in the wild",
      min: 15,
      max: 20,
      unit: "years",
      note: "Thirty or more is common in captivity; the oldest recorded giant panda reached 38",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Bamboo specialist — about 99% of the diet", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Solitary outside the breeding season", icon: "User" },
    { key: "activity", label: "Activity", value: "Feeds in long bouts through day and night", icon: "Sun" },
    { key: "climbing", label: "Climbing", value: "Climbs readily; cubs shelter in trees", icon: "Sprout" },
  ],

  highlights: ["weight", "daily-food-intake", "bite-force", "diet-type"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Sichuan, China",
      "Shaanxi, China",
      "Gansu, China",
    ],
    habitats: [
      "Temperate montane forest",
      "Bamboo understorey",
      "Coniferous and mixed broadleaf forest",
    ],
    elevation: "Roughly 1,200–3,400 m",
    note: "Wild pandas survive in six mountain ranges on the eastern edge of the Tibetan Plateau — the Minshan, Qinling, Qionglai, Liangshan, Daxiangling and Xiaoxiangling. Roads, farmland and settlement have broken these into more than thirty subpopulations, many of them too small to be secure on their own, which is why habitat connectivity matters more to the species' future than total numbers do.",
  },

  sections: [
    {
      id: "bamboo",
      title: "A carnivore that eats bamboo",
      body: [
        "Everything about the panda's digestive system says meat-eater. The gut is short and unchambered, it has none of the microbial fermentation architecture that lets a cow or a deer extract energy from cellulose, and it retains the genetic machinery of a carnivore. What it lost, several million years ago, was the gene for the umami taste receptor — the one that makes meat taste like food.",
        "The result is an animal running a herbivore's diet on a carnivore's plumbing, and it works only through volume and inactivity. A panda eats between 12 and 38 kg of bamboo a day depending on which part is in season, spends much of the day and night feeding in long bouts, and digests about 17% of what it swallows. Everything else about its behaviour — the low-energy movement, the small home range, the reluctance to travel — follows from that arithmetic.",
        "Bamboo also flowers and dies synchronously across whole stands, at intervals that can run to decades. A panda population confined to a single bamboo species in a single valley can therefore face total food failure, and historically pandas simply walked to the next range. Fragmented habitat has taken that option away, which is the strongest argument for the wildlife corridors now being built between reserves.",
      ],
    },
    {
      id: "thumb",
      title: "The false thumb",
      body: [
        "A panda appears to grip bamboo stems between a thumb and its fingers, but bears have no opposable thumb. What it is using is an enlarged wrist bone — the radial sesamoid — that has grown into a padded projection alongside the true digits and works as a crude opposing surface.",
        "It is one of the most cited examples in evolutionary biology of a structure improvised from whatever was available rather than designed, and it is good enough for the job it does: holding a stem steady while the animal strips it. The skull carries the other half of the adaptation, with enormous jaw muscles and broad flattened molars that crush rather than shear.",
      ],
    },
    {
      id: "reproduction",
      title: "Breeding and cubs",
      body: [
        "Females are receptive for only two or three days a year, which is the root of the species' reputation for reproductive difficulty. Gestation is nominally 95 to 160 days, but the spread is an artefact of delayed implantation: the embryo floats free before attaching, and real development takes only six to eight weeks.",
        "A newborn panda weighs 90 to 130 g — around a nine-hundredth of its mother's weight, one of the most extreme size disparities of any mammal. It is pink, blind and effectively embryonic, and the mother holds it almost continuously for the first weeks.",
        "Twins are born in about half of pregnancies, and in the wild the mother selects one and the other dies. This is not cruelty but energy budgeting: a diet that yields as little as bamboo does cannot support two dependent cubs. Captive breeding programmes exploit exactly this, swapping twins between the mother and an incubator so that both are reared — a technique that has substantially raised captive survival rates.",
      ],
    },
    {
      id: "habitat",
      title: "Where pandas live",
      body: [
        "The entire wild population lives in six mountain ranges in Sichuan, Shaanxi and Gansu, on the wet eastern edge of the Tibetan Plateau, mostly between 1,200 and 3,400 m. The habitat that matters is not the forest canopy but the bamboo understorey beneath it, which needs the shade and moisture that mature forest provides.",
        "Those six ranges are not six populations. Roads, farmland, hydropower and settlement have cut them into more than thirty subpopulations, and a good number of these hold too few animals to be genetically viable on their own. This is why the survey headline figure can rise while conservationists remain uneasy: a total of nearly 1,900 animals distributed as thirty small isolated groups is a different proposition from 1,900 animals that can interbreed.",
      ],
    },
    {
      id: "recovery",
      title: "From Endangered to Vulnerable",
      body: [
        "China's first national panda survey in the late 1970s found roughly 2,400 animals. By the 1980s the wild population was thought to be near 1,100. The recovery since then is the product of a logging ban across the upper Yangtze after the 1998 floods, a large and expanding reserve network, and sustained anti-poaching enforcement.",
        "The Fourth National Survey, published in 2015, counted 1,864 wild pandas aged 1.5 years and older — about 17% more than a decade before. On that basis the IUCN moved the species from Endangered to Vulnerable in September 2016. China objected, arguing that the change would be read as a declaration of victory, and kept its own national listing at endangered until July 2021.",
        "In October 2021 China consolidated dozens of separate reserves into the Giant Panda National Park, covering over 22,000 km² and containing the large majority of the wild population. Authorities reported wild numbers approaching 1,900 in 2024. The remaining threats are not hunting but habitat fragmentation and climate change, which is projected to push suitable bamboo zones upslope faster than the forest itself can follow.",
      ],
    },
  ],

  related: ["tiger", "snow-leopard", "african-savanna-elephant"],
  tags: ["bear", "herbivore", "asia", "china", "bamboo", "vulnerable", "conservation icon"],
  searchTerms: ["ailuropoda melanoleuca", "panda bear", "are pandas still endangered", "panda thumb", "bamboo bear"],

  faqs: [
    {
      q: "Are giant pandas still endangered?",
      a: "No — the IUCN moved the giant panda from Endangered to Vulnerable in September 2016, after China's Fourth National Survey found 1,864 wild pandas aged 1.5 years and older. China kept its own national listing at endangered until July 2021. Vulnerable still means a high risk of extinction in the wild, and the roughly 1,000 breeding adults are split across more than thirty fragmented subpopulations.",
    },
    {
      q: "Why does a panda eat bamboo if it is a carnivore?",
      a: "It is a carnivore by ancestry and anatomy rather than by behaviour. Pandas have the short, simple gut of a meat-eater and none of the fermentation chambers a true herbivore uses, and several million years ago they lost the working gene for the umami taste receptor that makes meat taste appealing. The switch to bamboo works only because they eat enormous quantities of it and move as little as possible.",
    },
    {
      q: "Do pandas really have a sixth finger?",
      a: "Not a finger. The panda grips bamboo using an enlarged wrist bone — the radial sesamoid — that projects alongside the true digits and works as a crude opposable pad. It is one of the standard textbook examples of evolution improvising a structure out of material that was already there rather than building a new one.",
    },
    {
      q: "Why do pandas abandon one of their twins?",
      a: "Because bamboo cannot pay for two. Twins occur in roughly half of pregnancies, but a wild mother chooses the stronger cub and the other does not survive. Captive breeding programmes work around it by rotating the twins between the mother and an incubator so each gets maternal care in turn, which is a large part of why captive survival rates have improved so sharply.",
    },
    {
      q: "How many giant pandas are left in the wild?",
      a: "China's 2015 national survey counted 1,864 wild pandas aged 1.5 years and older, and Chinese authorities reported the figure approaching 1,900 in 2024. Around 1,000 of those are mature breeding adults. The population is increasing, but it is divided among more than thirty subpopulations, several of which are too small to be genetically secure on their own.",
    },
  ],

  seo: {
    title: "Giant Panda — Diet, Bamboo, Breeding & Conservation Status",
    description:
      "A researched profile of the giant panda (Ailuropoda melanoleuca): why a carnivore eats bamboo, how the false thumb works, and why it was downlisted from Endangered to Vulnerable in 2016.",
    keywords: [
      "giant panda facts",
      "ailuropoda melanoleuca",
      "are pandas still endangered",
      "panda bamboo diet",
      "panda thumb",
    ],
  },

  sources: [
    {
      label: "Ailuropoda melanoleuca — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/712/121745669",
    },
    {
      label: "Giant panda species profile",
      publisher: "WWF",
      url: "https://www.worldwildlife.org/species/giant-panda",
    },
    {
      label: "Giant panda fact sheet — population and conservation",
      publisher: "San Diego Zoo Wildlife Alliance Library",
      url: "https://ielc.libguides.com/sdzg/factsheets/giantpanda/population",
    },
    {
      label: "China's wild panda population nears 1,900",
      publisher: "The State Council of the People's Republic of China",
      url: "https://english.www.gov.cn/archive/statistics/202401/25/content_WS65b20287c6d0868f4e8e37be.html",
    },
  ],

  updatedAt: "2026-07-29",
};

export default giantPanda;
