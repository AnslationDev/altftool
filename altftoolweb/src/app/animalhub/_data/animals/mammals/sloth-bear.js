// Sloth bear — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const slothBear = {
  slug: "sloth-bear",
  category: "mammals",
  name: "Sloth Bear",
  scientificName: "Melursus ursinus",
  otherNames: ["Indian bear", "Labiated bear", "Honey bear"],

  summary:
    "A shaggy Indian bear that has rebuilt its mouth into a vacuum cleaner — missing its front teeth, able to seal its nostrils, and audible from a hundred metres away as it sucks termites out of a broken mound.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/46/Sloth_bear_stand.jpg",
    alt: "A sloth bear standing upright on its hind legs, showing its long shaggy black coat and pale chest marking",
    credit: "https://www.flickr.com/photos/mape_s/ mape_s / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Sloth_bear_%28Melursus_ursinus%29_is_a_terrestrial_mammal_in_Pilibhit_tiger_reserve.jpg/1920px-Sloth_bear_%28Melursus_ursinus%29_is_a_terrestrial_mammal_in_Pilibhit_tiger_reserve.jpg",
      alt: "A sloth bear walking through dry grass and scrub in Pilibhit Tiger Reserve, India",
      credit: "Mike Prince / Wikimedia Commons",
      title: "An insectivore in a bear's body",
      caption:
        "Outside the fruiting season, insects can make up around 95% of a sloth bear's diet. Almost everything distinctive about the skull — the gap in the front teeth, the arched palate, the mobile lips — exists to serve that.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Sloth_bear_%28Melursus_ursinus%29.jpg/1920px-Sloth_bear_%28Melursus_ursinus%29.jpg",
      alt: "A sloth bear foraging on the forest floor among leaf litter and undergrowth",
      credit: "Murugavel.T / Wikimedia Commons",
      title: "Long claws for hard ground",
      caption:
        "The ivory-coloured front claws reach 6 to 8 cm and are used to break open termite mounds baked as hard as brick. They are too long and too curved for running, which is part of why a cornered sloth bear stands and fights.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/077_Sloth_bear_in_Ranthambore_National_Park_Photo_by_Giles_Laurent.jpg/1920px-077_Sloth_bear_in_Ranthambore_National_Park_Photo_by_Giles_Laurent.jpg",
      alt: "A sloth bear in dry deciduous forest in Ranthambore National Park, India",
      credit: "Giles Laurent / Wikimedia Commons",
      title: "Sharing ground with tigers",
      caption:
        "Sloth bears live alongside tigers and leopards across much of their range. Cubs are the vulnerable ones, which is why they ride on their mother's back for the first six to nine months rather than following at heel.",
    },
  ],

  headline: "The bear that eats termites",
  intro: [
    "The sloth bear is the odd one out among the eight bears. It is lanky rather than heavy, covered in a long shaggy black coat with a pale V or Y on the chest, and it has a face like nothing else in the family — a long mobile snout, a permanently protruding lower lip, and a gap in the front of the upper jaw where the incisors should be.",
    "That gap is not damage. It is a channel. A sloth bear breaks into a termite mound with claws up to 8 cm long, blows the loose earth away, seals its nostrils, and then sucks the insects up through the missing teeth in a rush of air loud enough to hear from a hundred metres. It is the only bear built specifically around eating insects, and outside the fruiting season insects can make up 95% of what it eats.",
    "The name is a mistake that stuck. George Shaw described the animal in 1791 from a specimen with long claws and shaggy fur and placed it in the sloth genus Bradypus, believing it was a relative of the tree sloths. It is not — it is a true bear, and one that evolved in the Indian subcontinent and lives nowhere else.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Ursidae",
    genus: "Melursus",
    species: "Melursus ursinus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2020,
    populationTrend: "decreasing",
    populationEstimate: "Fewer than 20,000 in the wild, the great majority in India",
    note: "Vulnerable, on a Red List record published in 2020 that amends the 2016 assessment. The estimated decline is 30–49% over three decades, driven overwhelmingly by habitat loss and fragmentation as dry forest is converted to farmland and settlement. The species is listed on CITES Appendix I. Estimates vary by source — some field assessments put the total nearer 10,000 — because sloth bears are hard to survey in the dense scrub they favour. The dancing-bear trade, which took roughly a hundred cubs a year from the wild, was ended in India in the 2000s, but poaching for gall bladders and body parts continues at a lower level, and the country's most persistent conflict between people and a large carnivore now involves this animal rather than the tiger.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.4–1.9 m",
      min: 1.4,
      max: 1.9,
      unit: "m",
      note: "Males run to the upper end of the range; females are consistently smaller",
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
      value: "55–140 kg",
      min: 55,
      max: 140,
      unit: "kg",
      note: "Males 80–140 kg, females 55–95 kg. Lanky rather than bulky — a sloth bear is lighter than a brown or Asian black bear of similar length",
    },
    {
      key: "claw-length",
      label: "Front claw length",
      value: "6–8 cm",
      min: 6,
      max: 8,
      unit: "cm",
      note: "Ivory-coloured, curved and non-retractile, for excavating termite mounds and climbing. The hind claws are much shorter",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "4–7 months including delayed implantation",
      min: 120,
      max: 210,
      unit: "days",
      note: "Actual foetal development takes only about two months; the rest is delayed implantation, which lets birth be timed to the season rather than to mating",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1–2 cubs, rarely 3",
      min: 1,
      max: 3,
      unit: "cubs",
      note: "Two is typical and three rare. Cubs are born in a ground den and stay in it for around nine to twelve weeks",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 3 years",
      min: 3,
      max: 3,
      unit: "years",
      note: "Females then breed roughly once every three years, and cubs stay with the mother for two to three",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "20–25 years in the wild",
      min: 20,
      max: 25,
      unit: "years",
      note: "Individuals in captivity have exceeded 40",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Myrmecophagous omnivore — termites, ants, fruit and honey", icon: "Bug" },
    { key: "social-structure", label: "Social structure", value: "Solitary, except females with cubs", icon: "User" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal; females with cubs shift towards daytime", icon: "Moon" },
    { key: "feeding-method", label: "Feeding method", value: "Suction — sucks insects through a gap in the front teeth", icon: "Wind" },
    { key: "hibernation", label: "Hibernation", value: "None — food is available year-round in the tropics", icon: "Sun" },
  ],

  highlights: ["weight", "claw-length", "feeding-method", "diet-type"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "India — the great majority of the world population",
      "Sri Lanka",
      "Nepal",
      "Bhutan, in small numbers",
      "The Terai grasslands",
      "The Western and Eastern Ghats",
    ],
    habitats: [
      "Dry and moist deciduous forest",
      "Thorn scrub and dry scrubland",
      "Grassland with rocky outcrops",
      "Rocky hills and cave country",
    ],
    elevation: "Lowlands to around 2,000 m",
    note: "The sloth bear is endemic to the Indian subcontinent and has always been. Its stronghold is the dry deciduous forest and thorn scrub of central and southern India, particularly Madhya Pradesh, Chhattisgarh, Maharashtra, Karnataka and Rajasthan. It is now extinct in Bangladesh and has been reduced to fragments in Nepal and Bhutan. Because the animal favours the same low-lying dry forest that converts most easily to farmland, its range has been broken into patches that are increasingly hard for individuals to move between.",
  },

  sections: [
    {
      id: "termite-feeding",
      title: "The mouth as a vacuum",
      body: [
        "A sloth bear locates a termite mound by smell — its sense of smell is exceptional and its eyesight and hearing are only moderate — and opens it with the front claws, which reach 6 to 8 cm and are strong enough to break earth baked to the hardness of brick. Then the specialised anatomy takes over.",
        "It blows out the loose soil and debris with a hard exhalation. It closes its nostrils, which are muscular and can be sealed voluntarily against dust. It purses its long, mobile lips into a tube. And it inhales, drawing termites up through the gap left by its missing upper incisors and along an arched, hollowed palate into the throat.",
        "The result is remarkably loud. The sound of a sloth bear feeding carries a hundred metres or more through forest, which is one of the few reliable ways of locating an animal that is otherwise nocturnal and inconspicuous. It can keep this up for a long time; a bear will work a single large mound for hours.",
        "The rest of the diet is seasonal. When fruit is available — mahua flowers, ber, figs, jackfruit — sloth bears eat it heavily and become important seed dispersers. They also raid honeycombs, climbing to reach them and tolerating stings the shaggy coat largely deflects, which is where the alternative name honey bear comes from. Outside the fruiting season, insects can account for around 95% of intake.",
      ],
    },
    {
      id: "cubs",
      title: "Cubs that ride",
      body: [
        "Sloth bears mate in the hot season and, thanks to delayed implantation, give birth around the beginning of winter — the embryo pauses after fertilisation and only implants when the timing suits, so the total elapsed period runs four to seven months while actual development takes about two.",
        "One or two cubs are born in a ground den, usually a cave or a hollow beneath rocks, and stay inside for nine to twelve weeks. What happens when they emerge is unique among bears: they climb onto their mother's back and ride there.",
        "The cubs arrange themselves in a specific order along her spine and hold on with their claws, and she carries them everywhere — foraging, climbing, and if necessary fighting — until they are six to nine months old. No other bear does this.",
        "The reason is almost certainly predation. Sloth bears share their forests with tigers and leopards, both of which will take a bear cub, and unlike other bears they cannot send cubs up a tree for safety while they feed, because sloth bears feed on the ground and cannot leave them. Carrying them is the alternative. Cubs stay with the mother for two to three years, and roughly half do not survive to independence.",
      ],
    },
    {
      id: "conflict",
      title: "Why sloth bears are dangerous",
      body: [
        "The sloth bear injures and kills more people in India than the tiger does, and understanding why requires setting aside the idea that it is aggressive by nature. It is not a predator of humans; there is essentially no record of a sloth bear eating a person.",
        "The problem is a combination of poor senses and a poor escape option. A foraging sloth bear has its head in a termite mound, makes a great deal of noise doing it, and sees and hears indifferently. A person walking a forest path can be almost on top of one before either knows. Startled at close range, the bear has to choose between running and fighting — and with 8 cm non-retractile claws on short legs, it is not built to outrun a threat.",
        "So it rears up and strikes, aiming high, which is why sloth bear injuries are so often to the face and head. The encounters happen where people collect firewood, mahua flowers and other forest produce in the same dry scrub the bears forage in, and they cluster at dawn and dusk.",
        "Mitigation is behavioural rather than technical: making noise on forest paths, avoiding dense scrub at dawn and dusk, and moving in groups. The conflict is a habitat problem in disguise — as forest fragments shrink and are ringed by settlement, the overlap between bear and human activity is forced upward.",
      ],
    },
    {
      id: "dancing-bears",
      title: "The dancing bears",
      body: [
        "For centuries, sloth bears were the dancing bears of India. Cubs were taken from the wild — around a hundred a year at the practice's height — their muzzles pierced with a hot iron, a rope threaded through, their teeth and claws removed, and they were trained to move on command by pulling on the rope.",
        "The trade was concentrated among the Kalandar community, for whom it was a hereditary livelihood. Making it illegal was straightforward; ending it was not, because the alternative for the families involved was destitution.",
        "The programme that worked, run from the late 1990s by Wildlife SOS with the Indian government and international partners, bought the bears out and simultaneously funded alternative livelihoods and children's education for the Kalandar families who surrendered them. The last dancing bear in India was surrendered in 2009.",
        "Confiscated bears could not be released — they had no teeth, no claws and no experience of the wild — so several hundred were placed in large sanctuaries, notably at Agra and Bannerghatta, where many are still alive. The episode is one of the clearer demonstrations that ending a wildlife trade requires dealing with the economics of the people conducting it.",
      ],
    },
    {
      id: "threats",
      title: "Status and threats",
      body: [
        "Fewer than 20,000 sloth bears are thought to survive, though estimates vary widely and some field assessments run considerably lower; the animal is nocturnal, solitary and lives in dense scrub, which makes it genuinely hard to count. The overwhelming majority are in India, with smaller populations in Sri Lanka and Nepal, remnants in Bhutan, and none left in Bangladesh.",
        "Habitat loss is the primary driver of an estimated 30–49% decline over three decades. Dry deciduous forest and thorn scrub are the easiest habitats to convert to agriculture and settlement, and what remains is fragmented into patches separated by farmland and roads. Fragmentation matters twice over: it isolates populations genetically, and it puts more bears in daily contact with people.",
        "Poaching continues at a lower level than in the past, for gall bladders traded into the traditional medicine market and for other body parts. The species is listed on CITES Appendix I, which prohibits commercial international trade.",
        "The most consequential conservation work is unglamorous: maintaining corridors between forest patches, reducing the human-bear encounters that generate retaliatory killing, and compensating losses quickly enough that communities have a reason to tolerate an animal that is, from close range, genuinely dangerous.",
      ],
    },
  ],

  related: ["brown-bear", "polar-bear", "tiger"],
  tags: ["asia", "bear", "insectivore", "india", "vulnerable", "nocturnal"],
  searchTerms: [
    "melursus ursinus",
    "indian bear",
    "labiated bear",
    "sloth bear termites",
    "dancing bears india",
  ],

  faqs: [
    {
      q: "Is a sloth bear related to sloths?",
      a: "No. It is a true bear, one of the eight living species. The name comes from a mistake: George Shaw described the animal in 1791 from a specimen with long curved claws and shaggy fur, and placed it in the sloth genus Bradypus. The error was corrected but the common name stuck.",
    },
    {
      q: "How does a sloth bear eat termites?",
      a: "By suction. It breaks open the mound with claws 6 to 8 cm long, blows away the loose earth, closes its nostrils voluntarily, purses its long lips into a tube, and sucks the insects up through the gap where its upper front incisors are missing and along a hollowed palate. The noise carries a hundred metres or more through forest.",
    },
    {
      q: "Why do sloth bear cubs ride on their mother's back?",
      a: "Almost certainly for protection. Sloth bears share their range with tigers and leopards, and unlike other bears they cannot leave cubs up a tree while feeding, because they forage on the ground. So cubs climb onto the mother's back and hold on with their claws, riding there from the time they leave the den until they are six to nine months old. No other bear species does this.",
    },
    {
      q: "Are sloth bears dangerous to humans?",
      a: "Yes, though not as predators. Sloth bears injure and kill more people in India than tigers do, but there is essentially no record of one eating a person. The cause is surprise at close range: a bear with its head in a termite mound, making a lot of noise and with only moderate eyesight and hearing, cannot easily outrun a threat on short legs with 8 cm non-retractile claws, so it rears and strikes instead — which is why injuries are so often to the head and face.",
    },
    {
      q: "What happened to India's dancing bears?",
      a: "The practice ended in 2009, when the last dancing bear in India was surrendered. It was stopped by a programme that bought the bears out while funding alternative livelihoods and education for the Kalandar families whose hereditary trade it was. The rescued bears could not be released, having had their teeth and claws removed, so several hundred were placed in sanctuaries such as those at Agra and Bannerghatta.",
    },
  ],

  seo: {
    title: "Sloth Bear — Termite Feeding, Cubs, Danger & Conservation",
    description:
      "A researched profile of the sloth bear (Melursus ursinus): the missing incisors and suction feeding, cubs that ride on their mother's back, human conflict in India, and Vulnerable status.",
    keywords: [
      "sloth bear facts",
      "melursus ursinus",
      "sloth bear termites",
      "are sloth bears dangerous",
      "dancing bears india",
    ],
  },

  sources: [
    {
      label: "Melursus ursinus — Red List assessment (Dharaiya, Bargali & Sharp, 2020 amendment of the 2016 assessment)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/13143/166519315",
    },
    {
      label: "Melursus ursinus — sloth bear species account",
      publisher: "International Association for Bear Research and Management",
      url: "https://www.bearbiology.org/the-eight-bear-species/melursus-ursinus-sloth-bear/",
    },
    {
      label: "Sloth bear species profile",
      publisher: "Smithsonian's National Zoo and Conservation Biology Institute",
      url: "https://nationalzoo.si.edu/animals/sloth-bear",
    },
  ],

  updatedAt: "2026-07-29",
};

export default slothBear;
