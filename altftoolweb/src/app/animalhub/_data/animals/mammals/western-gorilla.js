// Western gorilla — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const westernGorilla = {
  slug: "western-gorilla",
  category: "mammals",
  name: "Western Gorilla",
  scientificName: "Gorilla gorilla",
  otherNames: ["Western lowland gorilla", "Cross River gorilla", "Silverback"],

  summary:
    "The largest living primate, a gentle leaf-eater in troops led by a single silverback — and, despite numbering in the hundreds of thousands, one of the most endangered great apes on earth.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Male_gorilla_in_SF_zoo.jpg/1920px-Male_gorilla_in_SF_zoo.jpg",
    alt: "An adult male silverback gorilla seated, showing the grey saddle across his back and the sagittal crest on his skull",
    credit: "Brocken Inaglory / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/54/Silverback_Western_lowland_gorilla_in_forest_-_DPLA_-_be25be22ec7b3f6f17fc2c3c4571dfc1.jpg",
      alt: "A silverback western lowland gorilla among forest vegetation",
      credit: "Garst, Warren, 1922-2016, photographer / Wikimedia Commons",
      title: "Why he is called a silverback",
      caption:
        "Males develop the grey saddle across the back at around twelve, along with a bony crest on the skull that anchors the jaw muscles needed to chew several dozen kilograms of vegetation a day.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/98/Group_of_Western_lowland_gorillas_in_forest_nest_-_DPLA_-_b3d4bec8de844fadb217a4a0b990a305.jpg",
      alt: "A group of western lowland gorillas resting together in dense forest vegetation",
      credit: "Garst, Warren, 1922-2016, photographer / Wikimedia Commons",
      title: "One male, several females, their young",
      caption:
        "A troop is usually two to twenty animals built around a single silverback. He decides where the group feeds and when it moves, and if he dies the group dissolves rather than passing to a successor.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Male_Western_lowland_gorilla_close_up_-_DPLA_-_2f2f1a01e73914b905a4d2f431a6ffee.jpg",
      alt: "Close view of the face of an adult male western lowland gorilla",
      credit: "Garst, Warren, 1922-2016, photographer / Wikimedia Commons",
      title: "A face as individual as a fingerprint",
      caption:
        "The pattern of wrinkles on a gorilla's nose and brow — the nose print — is unique to each animal and is how researchers identify individuals in long-term studies.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/19/Male_Western_lowland_gorilla_sitting_in_brush_-_DPLA_-_cb63daad9e527430d0fbefc716c8af32.jpg",
      alt: "A male western lowland gorilla sitting in low brush",
      credit: "Garst, Warren, 1922-2016, photographer / Wikimedia Commons",
      title: "Mostly on the ground",
      caption:
        "Western lowland gorillas are heavy enough that adults spend most of the day on the forest floor, knuckle-walking between feeding sites and building their sleeping nests on the ground rather than in trees.",
    },
  ],

  headline: "Hundreds of thousands, and Critically Endangered",
  intro: [
    "The western gorilla is the largest primate alive — a silverback male can pass 190 kg — and it lives almost entirely on plants, working through tens of kilograms of leaves, stems, pith and fruit a day. Troops are small, stable and led by one adult male whose decisions the rest follow.",
    "Its conservation status looks like a contradiction. A range-wide survey published in 2018 estimated around 360,000 western lowland gorillas, yet the species is Critically Endangered. The listing is not about how many there are now but about how fast the number is falling: poaching, Ebola and habitat loss together project a decline of more than 80% across three generations, and a gorilla generation is about twenty-two years.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Primates",
    family: "Hominidae",
    genus: "Gorilla",
    species: "Gorilla gorilla",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate: "Around 360,000 western lowland gorillas, plus 250–300 Cross River gorillas",
    note: "Critically Endangered under criterion A4bcde in the 2018 assessment (an amended version of the 2016 assessment). The category reflects rate of loss rather than scarcity: the projected reduction exceeds 80% over three generations — 66 years, taken as 2005 to 2071. Ebola alone cut populations in some protected areas by about a third between 1992 and 2007. The Cross River gorilla subspecies, confined to the Nigeria–Cameroon border highlands, is down to 250–300 individuals and is the rarest great ape in the world.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "1.4–1.8 m",
      min: 1.4,
      max: 1.8,
      unit: "m",
      note: "Adult males typically 1.67–1.76 m; females noticeably shorter",
    },
    {
      key: "weight",
      label: "Weight",
      value: "58–191 kg",
      min: 58,
      max: 191,
      unit: "kg",
      note: "Wild males 145–191 kg, females 58–72 kg — one of the largest sex differences of any mammal. Captive gorillas run considerably heavier, which is where inflated figures usually originate",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 8.5 months",
      min: 250,
      max: 270,
      unit: "days",
      note: "Close to the human figure, and producing a newborn of roughly 2 kg — smaller than a human infant despite the mother being far larger",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "One infant",
      min: 1,
      max: 1,
      unit: "young",
      note: "Twins are very rare",
    },
    {
      key: "birth-interval",
      label: "Interval between births",
      value: "4–6 years",
      min: 4,
      max: 6,
      unit: "years",
      note: "A female may raise only three or four surviving offspring in a lifetime",
    },
    {
      key: "sexual-maturity",
      label: "Age at first birth",
      value: "8–10 years (females)",
      min: 8,
      max: 10,
      unit: "years",
      note: "Males mature later and rarely hold a troop before about fifteen",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "35–40 years in the wild",
      min: 35,
      max: 40,
      unit: "years",
      note: "Captive gorillas regularly pass 50; the oldest documented is over 69",
    },
    {
      key: "group-size",
      label: "Troop size",
      value: "2–20 individuals",
      min: 2,
      max: 20,
      unit: "individuals",
      note: "One silverback, several adult females and their offspring; around ten is typical",
    },
    {
      key: "territory-size",
      label: "Home range",
      value: "About 10–25 km²",
      min: 10,
      max: 25,
      unit: "km²",
      note: "Ranges overlap heavily and are not defended as territories — gorillas avoid other troops rather than exclude them",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Herbivore — leaves, stems, pith and fruit, plus termites and ants", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Stable troops led by one silverback male", icon: "Users" },
    { key: "activity", label: "Activity", value: "Diurnal; feeds through the morning, rests at midday", icon: "Sun" },
    { key: "nest-building", label: "Nest building", value: "Builds a fresh nest daily, usually on the ground", icon: "Home" },
    { key: "locomotion", label: "Locomotion", value: "Knuckle-walking; adults climb only lightly", icon: "Footprints" },
    { key: "ecological-role", label: "Ecological role", value: "Major seed disperser in Congo Basin forest", icon: "Network" },
  ],

  highlights: ["weight", "height", "social-structure", "diet-type"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Gabon",
      "Republic of the Congo",
      "Cameroon",
      "Equatorial Guinea",
      "Central African Republic",
      "Cabinda, Angola",
      "Nigeria–Cameroon border highlands (Cross River)",
    ],
    habitats: [
      "Lowland tropical rainforest",
      "Swamp forest",
      "Secondary and regenerating forest",
      "Montane forest (Cross River)",
    ],
    elevation: "Sea level to around 1,600 m, and to about 2,000 m in the Cross River highlands",
    note: "Western gorillas occupy the forests of west-central Africa, with Gabon and the Republic of the Congo holding the great majority. Densities are highest in swampy and regenerating forest where herbaceous ground vegetation is thick. The Cross River subspecies is entirely separate, confined to a scatter of forested highlands on the Nigeria–Cameroon border about 300 km north of the nearest lowland gorillas.",
  },

  sections: [
    {
      id: "silverback",
      title: "The silverback and the troop",
      body: [
        "A gorilla troop is organised around one adult male. He is called a silverback for the saddle of grey hair that develops across his back at around twelve years old, alongside a pronounced bony crest on the skull that anchors the enormous jaw muscles the diet requires.",
        "He decides everything of consequence — where the group feeds, when it moves, where it nests — and he is the group's defence. Confrontations with rival males or predators are handled first by display: a ritualised sequence that builds from hooting through the well-known chest-beating with cupped hands to a sideways charge, and which usually ends without contact.",
        "The bond is between each female and the silverback rather than between the females, and this has a stark consequence. If the silverback dies, the troop does not pass to a successor; it dissolves. Females and their offspring must join other groups, and infants are at high risk of infanticide when they do, because a new male has no reason to invest in another male's young.",
      ],
    },
    {
      id: "diet",
      title: "Living on leaves",
      body: [
        "Western lowland gorillas eat leaves, stems, pith, bark, flowers and a great deal of fruit — considerably more fruit than mountain gorillas, whose higher-altitude habitat offers less of it. Termites and ants are taken regularly and account for the small animal component of the diet.",
        "Processing that volume of low-quality plant matter requires the equipment: a very large gut, powerful jaws, high-crowned molars and the skull crest to anchor the muscles. An adult male works through tens of kilograms of vegetation a day, and troops move steadily through the forest rather than defending a fixed patch.",
        "Because gorillas swallow fruit seeds whole and travel considerable distances, they are among the most important seed dispersers in Central African forest. Some tree species germinate substantially better after passing through a gorilla, which makes the animal's decline a forest-structure problem as much as a wildlife one.",
      ],
    },
    {
      id: "nests",
      title: "A fresh bed every night",
      body: [
        "Every gorilla over about three years old builds a new nest to sleep in each night, bending and interweaving vegetation into a bowl. Unlike chimpanzees and orangutans, western gorillas usually build on the ground — adults are heavy enough that tree nesting is impractical, though lighter animals do sometimes nest above ground.",
        "This habit is one of the field's most useful tools. Nest counts along transects are the standard method for estimating gorilla numbers across areas where the animals themselves are almost never seen, and the 2018 range-wide survey that produced the figure of roughly 360,000 western lowland gorillas was built on exactly this.",
        "Nests also record behaviour. Their number gives group size, their construction gives age composition, and dung left in them supplies diet and genetic data — which is how a great deal is known about populations that have never been habituated to human presence.",
      ],
    },
    {
      id: "ebola",
      title: "Why so many, and still Critically Endangered",
      body: [
        "The apparent paradox resolves once the criterion is understood. The Red List category is set by rate of change as well as absolute numbers, and the western gorilla is projected to decline by more than 80% over three generations. A gorilla generation is taken as about twenty-two years, so the window the assessors used runs 66 years, from 2005 to 2071.",
        "Ebola has been the most dramatic driver. Outbreaks in the Congo Basin killed gorillas in enormous numbers — one estimate puts the reduction in protected-area populations at about a third between 1992 and 2007, and some individual sites lost the overwhelming majority of their animals within months. Gorillas are highly susceptible, and the disease spreads through the population as well as from other reservoirs.",
        "Poaching for bushmeat is the steadier pressure, made worse by logging roads that open previously inaccessible forest to hunters. Commercial logging, mining and agricultural conversion fragment what remains. Because a female produces one infant every four to six years and may raise only three or four in her life, none of this is quickly undone.",
      ],
    },
    {
      id: "conservation",
      title: "Conservation",
      body: [
        "Protected areas across Gabon, the Republic of the Congo and Cameroon cover a meaningful share of the range, and where they are actively patrolled they work. Gabon in particular has committed a large fraction of its territory to national parks, and its forests hold one of the largest remaining gorilla populations.",
        "Vaccination against Ebola has moved from speculation to field trials, with an oral vaccine tested in captive and wild gorillas — potentially the first real defence against the single most destructive threat the species faces.",
        "Gorilla tourism generates revenue and creates a local economic interest in live animals, but it carries a genuine risk in return: habituated gorillas are exposed to human respiratory pathogens, and strict distance rules, mask requirements and health screening are not formalities. The Cross River subspecies, at 250 to 300 animals across a fragmented highland range, needs something different again — corridor protection to reconnect subpopulations that are currently too small to survive alone.",
      ],
    },
  ],

  related: ["chimpanzee", "bornean-orangutan"],
  tags: ["great ape", "primate", "africa", "critically endangered", "herbivore", "rainforest"],
  searchTerms: ["gorilla gorilla", "silverback", "western lowland gorilla", "cross river gorilla", "largest primate"],

  faqs: [
    {
      q: "How can there be 360,000 gorillas and the species still be Critically Endangered?",
      a: "Because the Red List measures rate of decline as well as absolute numbers. The western gorilla is projected to fall by more than 80% across three generations — a 66-year window the assessors take as 2005 to 2071 — driven by poaching, Ebola and habitat loss. A species can be numerous and still be on a trajectory that qualifies as Critically Endangered.",
    },
    {
      q: "What is a silverback?",
      a: "An adult male gorilla, named for the saddle of grey hair that develops across his back at around twelve years old. Each troop has one, and he decides where the group feeds and moves and defends it from rivals and predators. If he dies, the troop dissolves rather than passing to a successor.",
    },
    {
      q: "What do gorillas eat?",
      a: "Almost entirely plants — leaves, stems, pith, bark, flowers and a large amount of fruit, with termites and ants making up a small animal component. An adult male gets through tens of kilograms of vegetation a day, which is why the skull carries a bony crest to anchor the jaw muscles.",
    },
    {
      q: "How is a western gorilla different from a mountain gorilla?",
      a: "They are different species. Western gorillas (Gorilla gorilla) live in the lowland forests of west-central Africa and eat more fruit; mountain gorillas are a subspecies of the eastern gorilla (Gorilla beringei) living at high altitude in the Virungas and Bwindi, with longer, thicker fur and a more leaf-based diet. Mountain gorillas are Endangered; western gorillas are Critically Endangered.",
    },
    {
      q: "Do gorillas build nests?",
      a: "Yes — every gorilla over about three years old builds a fresh one each night from bent and woven vegetation, usually on the ground rather than in trees. Counting nests along forest transects is the standard way researchers estimate gorilla numbers in areas where the animals themselves are almost never seen.",
    },
  ],

  seo: {
    title: "Western Gorilla — Size, Silverbacks, Diet & Conservation Status",
    description:
      "A researched profile of the western gorilla (Gorilla gorilla): the largest living primate, silverback-led troops, a diet of leaves and fruit, and why a species numbering 360,000 is Critically Endangered.",
    keywords: [
      "western gorilla facts",
      "gorilla gorilla",
      "silverback gorilla",
      "western lowland gorilla",
      "why are gorillas endangered",
    ],
  },

  sources: [
    {
      label: "Gorilla gorilla — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/9404/136250858",
    },
    {
      label: "Guns, germs and trees determine density and distribution of gorillas and chimpanzees in Western Equatorial Africa (Strindberg et al., 2018)",
      publisher: "Science Advances",
      url: "https://www.science.org/doi/10.1126/sciadv.aar2964",
    },
    {
      label: "Gorillas on the IUCN Red List of Threatened Species",
      publisher: "Berggorilla & Regenwald Direkthilfe",
      url: "https://www.berggorilla.org/en/gorillas/gorilla-numbers/gorilla-numbers/gorillas-on-the-iucn-red-list-of-threatened-species/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default westernGorilla;
