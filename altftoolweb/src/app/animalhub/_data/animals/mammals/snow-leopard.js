// Snow leopard — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const snowLeopard = {
  slug: "snow-leopard",
  category: "mammals",
  name: "Snow Leopard",
  scientificName: "Panthera uncia",
  otherNames: ["Ounce", "Irbis"],

  summary:
    "A big cat of the high mountains of Central Asia, so hard to find that under 2% of its range had been surveyed with reliable methods when it was last assessed — and whose downlisting to Vulnerable was publicly contested by the people who study it.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Irbis4.JPG",
    alt: "A snow leopard, its pale rosetted coat and thick tail visible",
    credit: "Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Snow_leopard%28Panthera_uncia%29.jpg/1920px-Snow_leopard%28Panthera_uncia%29.jpg",
      alt: "A snow leopard (Panthera uncia) photographed at close range",
      credit: "PeCeT_full / Wikimedia Commons",
      title: "A coat built for altitude",
      caption:
        "The fur runs from 5 to 12 cm long, thickest on the belly, over a dense woolly underlayer. Behind the face, the nasal cavity is unusually large relative to the skull, warming and humidifying thin, freezing air before it reaches the lungs.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Snow_Leopard_Backlit_%2849092985883%29.jpg/1920px-Snow_Leopard_Backlit_%2849092985883%29.jpg",
      alt: "A snow leopard backlit, its fur rimmed with light",
      credit: "Eric Kilby from Somerville, MA, USA / Wikimedia Commons",
      title: "Smoke-grey against rock",
      caption:
        "The pale ground colour and open, soft-edged rosettes are matched to broken rock and old snow rather than to vegetation. Against a scree slope the pattern erases the outline of the body, which is why field researchers rely almost entirely on camera traps and scat rather than direct observation.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Snow_leopard_in_fully_covered_snow.jpg/1920px-Snow_leopard_in_fully_covered_snow.jpg",
      alt: "A snow leopard moving through deep snow",
      credit: "In india travel / Wikimedia Commons",
      title: "Paws that work as snowshoes",
      caption:
        "The feet are broad and thickly furred on the soles, spreading the cat's weight across soft snow and gripping bare rock. Combined with short forelimbs and long, powerful hind legs, they make the snow leopard a specialist in the kind of terrain where its prey has the advantage.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Snow_leopard_in_rock_cavity.jpg/1920px-Snow_leopard_in_rock_cavity.jpg",
      alt: "A snow leopard resting in a rock cavity",
      credit: "In india travel / Wikimedia Commons",
      title: "Living among the cliffs",
      caption:
        "Snow leopards keep to steep, broken ground — cliff bases, ridgelines and ravines — because it gives them cover to approach ibex and blue sheep from above. The same terrain provides den sites: rock cavities and crevices, lined with the mother's own fur, where cubs spend their first weeks.",
    },
  ],

  headline: "The big cat nobody can count",
  intro: [
    "The snow leopard lives at altitude across twelve countries in Central and South Asia, in terrain steep enough and empty enough that most of its range has never been surveyed with reliable methods. Its coat makes it close to invisible against rock, it moves largely at dawn and dusk, and it is not aggressive towards people. For most of the twentieth century, estimates of how many there were came down to asking herders how many they thought there were.",
    "That uncertainty is the reason its 2017 move from Endangered to Vulnerable became an argument. The reassessment reflected better information suggesting there were more snow leopards than previously assumed — not a recovery — and several of the organisations that work on the species publicly objected that the evidence base was too thin to support the change.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Felidae",
    genus: "Panthera",
    species: "Panthera uncia",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2017,
    populationTrend: "decreasing",
    populationEstimate: "About 2,710–3,386 mature individuals; total estimates range from roughly 4,000 to 8,000 animals",
    note: "Downlisted from Endangered to Vulnerable on 14 September 2017. The change was a reassessment rather than a recovery — the population is still classed as declining, with a fall of about 10% projected by 2040. It was contested at the time: the Snow Leopard Trust and others pointed out that under 2% of the range had been sampled with reliable techniques, and that in one Pakistani study a proper survey found perhaps 40 cats where an earlier estimate had assumed 200 to 420. The Population Assessment of the World's Snow Leopards (PAWS) exists to close that gap.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "0.75–1.5 m",
      min: 0.75,
      max: 1.5,
      unit: "m",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.8–1.05 m",
      min: 0.8,
      max: 1.05,
      unit: "m",
      note: "Close to the length of the body — a counterweight on steep ground, and wrapped over the face when the cat rests in the cold",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "About 0.56 m",
      min: 0.56,
      max: 0.56,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "35–55 kg",
      min: 35,
      max: 55,
      unit: "kg",
      note: "Males average 45–55 kg and females 35–40 kg; smaller animals of 25–30 kg are recorded",
    },
    {
      key: "leap-distance",
      label: "Leap",
      value: "Up to about 9 m",
      min: 9,
      max: 9,
      unit: "m",
      note: "A horizontal leap of roughly six times its own body length, per WWF. Figures of 15 m circulate widely but are not documented",
    },
    {
      key: "territory-size",
      label: "Home range",
      value: "12–1,000 km²",
      min: 12,
      max: 1000,
      unit: "km²",
      note: "Twelve to 39 km² where prey is dense, as in parts of Nepal. In the Mongolian Gobi males hold 144–270 km² and females 83–165 km², and individual ranges of up to 1,000 km² are recorded",
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
      key: "gestation",
      label: "Gestation",
      value: "90–100 days",
      min: 90,
      max: 100,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "2–3 cubs",
      min: 2,
      max: 3,
      unit: "cubs",
      note: "Up to seven has been recorded exceptionally",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "15–18 years in the wild",
      min: 15,
      max: 18,
      unit: "years",
      note: "Up to about 25 in captivity",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mainly wild sheep and goats", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Solitary and territorial", icon: "User" },
    { key: "activity", label: "Activity", value: "Crepuscular — most active at dawn and dusk", icon: "Sun" },
    { key: "vocalisation", label: "Vocalisation", value: "Cannot roar; chuffs, mews and yowls instead", icon: "Waves" },
  ],

  highlights: ["weight", "leap-distance", "territory-size", "activity"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Afghanistan",
      "Bhutan, India and Nepal",
      "China",
      "Kazakhstan, Kyrgyzstan, Tajikistan and Uzbekistan",
      "Mongolia",
      "Pakistan",
      "Russia",
    ],
    habitats: [
      "Alpine and subalpine mountain",
      "Rocky cliff, ridge and scree",
      "Alpine meadow and montane steppe",
      "Cold high-altitude desert",
    ],
    elevation: "Mostly 3,000–4,500 m; up to about 6,000 m in summer in the Himalaya and down to 1,200–2,000 m in winter in the northern range",
    note: "The range covers roughly two million square kilometres across twelve countries, from the Hindu Kush and Himalaya through the Karakoram, Pamir, Tian Shan and Altai to the mountains of southern Siberia. China holds something in the order of half of it. What defines suitable habitat is not altitude in itself but steep, broken terrain holding wild sheep and goats.",
  },

  sections: [
    {
      id: "adaptations",
      title: "Built for altitude and cold",
      body: [
        "Almost every feature of the snow leopard is an answer to thin air, cold and steep rock. The coat runs from 5 to 12 cm long over a dense woolly underlayer, thickest on the belly where the cat lies on snow. The nasal cavity is large relative to the skull, so each breath of freezing, dry air is warmed and moistened before it reaches the lungs.",
        "The tail is nearly as long as the body — extraordinary among cats — and does two jobs. On broken ground it acts as a counterweight during turns and leaps, and at rest it is wrapped across the face as insulation. The feet are broad and furred underneath, spreading weight on soft snow and gripping bare rock, and the hind legs are long and heavily muscled against short forelimbs, which is the proportion of an animal built to launch itself rather than to run.",
        "One thing the snow leopard cannot do is roar. Like the other big cats it has an incompletely ossified hyoid, but its vocal folds are only about 9 mm long and offer too little resistance to airflow to produce a roar. Instead it chuffs, mews, growls and yowls — the last audible across a valley during the breeding season.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting and diet",
      body: [
        "The core prey is wild sheep and goats: blue sheep in the Himalaya and Tibet, ibex and markhor further west, argali in Mongolia and Central Asia. Marmots, pikas, hares and game birds fill the gaps, and marmots matter more than their size suggests during the months when they are active.",
        "The method is a stalk from above, exploiting the terrain. A snow leopard closes the distance under cover of rock and then charges downhill, and its build gives it an advantage on ground where a heavier cat would be clumsy. It can kill animals several times its own weight, and a large ungulate feeds it for a week or more.",
        "Where wild prey has been depleted by hunting or displaced by livestock grazing, snow leopards take domestic sheep, goats and yaks. Losing an animal to a snow leopard is a serious financial blow to a herding household, and retaliatory killing that follows is one of the two largest threats to the species — which is why livestock insurance schemes and predator-proof corrals do more for snow leopards than protected-area designation alone.",
      ],
    },
    {
      id: "habitat",
      title: "The mountains of Central Asia",
      body: [
        "Snow leopards occupy roughly two million square kilometres across Afghanistan, Bhutan, China, India, Kazakhstan, Kyrgyzstan, Mongolia, Nepal, Pakistan, Russia, Tajikistan and Uzbekistan — the Hindu Kush and Himalaya, the Karakoram, Pamir and Tian Shan, the Altai and the mountains of southern Siberia. China alone contains something like half of the total range.",
        "They live mostly between 3,000 and 4,500 m, ranging up to around 6,000 m in the Himalaya in summer and dropping to 1,200 to 2,000 m in winter in the colder northern parts of the range, where the treeline is much lower. Altitude itself is not the requirement; steep, broken ground holding wild ungulates is.",
        "Home range size tracks prey density in the usual way, but across an unusually wide span. In prey-rich parts of Nepal a range may be 12 to 39 km²; in the Mongolian Gobi males hold 144 to 270 km² and females 83 to 165 km², and individual animals have been tracked over ranges approaching 1,000 km².",
      ],
    },
    {
      id: "reproduction",
      title: "Breeding and cubs",
      body: [
        "Mating takes place in late winter, and after 90 to 100 days the female gives birth in a rock cavity or crevice lined with her own shed fur. Litters are usually two or three cubs, born blind and helpless.",
        "Cubs open their eyes at about a week, take solid food from around two months, and begin following their mother on hunts a few months later. They stay with her for roughly eighteen months before dispersing, and siblings sometimes remain together for a period after leaving. Males play no part in rearing.",
        "Females first breed at two to three years old and produce a litter roughly every other year. That reproductive rate, combined with low population densities and enormous individual ranges, is why losses to poaching and retaliatory killing take so long to make up.",
      ],
    },
    {
      id: "conservation",
      title: "Counting a cat nobody sees",
      body: [
        "For most of the twentieth century, snow leopard population figures came from expert opinion and interviews with herders rather than from surveys. Camera trapping, genetic analysis of scat and spatial capture–recapture methods have changed what is possible, but they are expensive and slow across terrain like this, and by 2017 under 2% of the range had been sampled with them.",
        "That is the background to the downlisting. In September 2017 the IUCN moved the species from Endangered to Vulnerable, on the basis of a global estimate of roughly 2,710 to 3,386 mature individuals — above the threshold of 2,500 that the Endangered listing had depended on. The Snow Leopard Trust and others objected publicly, arguing that the new number rested on the same weak foundation as the old one, and noting a Pakistani study in which a rigorous survey found perhaps 40 cats in an area previously credited with 200 to 420.",
        "The response has been to try to answer the question properly. The Population Assessment of the World's Snow Leopards (PAWS) is a coordinated effort to survey the range with consistent, defensible methods, and it is running alongside the Global Snow Leopard and Ecosystem Protection Program, which the twelve range states signed in Bishkek in 2013.",
        "The threats themselves are not in dispute: retaliatory killing after livestock losses, poaching for pelts and bones, depletion of wild prey by hunting and competition with domestic herds, mining and infrastructure fragmenting the range, and a warming climate pushing the treeline upward into the alpine zone the species depends on.",
      ],
    },
  ],

  related: ["tiger", "gray-wolf", "giant-panda"],
  tags: ["big cat", "mountain", "asia", "carnivore", "vulnerable", "solitary"],
  searchTerms: ["panthera uncia", "irbis", "ounce", "ghost of the mountains", "uncia uncia", "snow leopard population"],

  faqs: [
    {
      q: "Are snow leopards still endangered?",
      a: "Not in the IUCN's terms. The species was moved from Endangered to Vulnerable in September 2017, after a global estimate of about 2,710 to 3,386 mature individuals put it above the threshold the Endangered listing rested on. That was a change in assessment rather than a recovery — the population is still classed as declining — and several conservation organisations objected that too little of the range had been properly surveyed to justify it.",
    },
    {
      q: "Can a snow leopard roar?",
      a: "No. Its vocal folds are only about 9 mm long and offer too little resistance to airflow to produce a roar, despite the snow leopard having the same incompletely ossified hyoid as the roaring big cats. It chuffs, mews, growls and yowls instead, and the yowl carries a long way across a valley in the breeding season.",
    },
    {
      q: "How far can a snow leopard jump?",
      a: "WWF gives up to about 9 m, roughly six times its own body length. Figures of 15 m or 50 feet appear very widely in popular sources but are not documented. The build behind the leap is real enough: long, heavily muscled hind legs against short forelimbs, and a tail nearly as long as the body acting as a counterweight.",
    },
    {
      q: "How many snow leopards are left?",
      a: "The 2017 assessment used a figure of about 2,710 to 3,386 mature individuals, with total estimates ranging from roughly 4,000 to 8,000 animals. All of these carry large error bars, because under 2% of the range had been surveyed with reliable techniques when the assessment was made. The PAWS programme exists specifically to replace estimates of this kind with measurements.",
    },
    {
      q: "Do snow leopards attack people?",
      a: "There are no confirmed records of a snow leopard killing a person. The species is shy and avoids humans, and the conflict runs in the other direction: snow leopards take livestock where wild prey has been depleted, and the retaliatory killing that follows is one of the biggest causes of death for the cats.",
    },
  ],

  seo: {
    title: "Snow Leopard — Habitat, Hunting, Population & Conservation Status",
    description:
      "A researched profile of the snow leopard (Panthera uncia): its high-altitude adaptations, why it cannot roar, how far it really leaps, and the contested 2017 downlisting to Vulnerable.",
    keywords: [
      "snow leopard facts",
      "panthera uncia",
      "are snow leopards endangered",
      "how many snow leopards are left",
      "snow leopard habitat",
    ],
  },

  sources: [
    {
      label: "Panthera uncia — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22732/50664030",
    },
    {
      label: "Statement on IUCN Red List status change of the snow leopard",
      publisher: "Snow Leopard Trust",
      url: "https://snowleopard.org/statement-iucn-red-list-status-change-snow-leopard/",
    },
    {
      label: "Snow leopard species account",
      publisher: "IUCN SSC Cat Specialist Group",
      url: "https://www.catsg.org/living-species-snowleopard",
    },
    {
      label: "Top 10 facts about snow leopards",
      publisher: "WWF-UK",
      url: "https://www.wwf.org.uk/learn/fascinating-facts/snow-leopards",
    },
  ],

  updatedAt: "2026-07-29",
};

export default snowLeopard;
