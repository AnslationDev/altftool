// Black rhinoceros — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const blackRhinoceros = {
  slug: "black-rhinoceros",
  category: "mammals",
  name: "Black Rhinoceros",
  scientificName: "Diceros bicornis",
  otherNames: ["Black rhino", "Hook-lipped rhinoceros"],

  summary:
    "A browsing rhino with a prehensile upper lip, reduced by poaching to around 2,300 animals in the 1990s — and one of the few Critically Endangered large mammals whose numbers are now going back up.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Black_Rhino_at_Working_with_Wildlife.jpg/1920px-Black_Rhino_at_Working_with_Wildlife.jpg",
    alt: "A black rhinoceros standing in dry bush in South Africa, both horns and the pointed upper lip visible",
    credit: "AfricanConservation / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Black_Rhino_%28Diceros_bicornis%29_in_the_evening_light_..._%2840361019683%29.jpg/1920px-Black_Rhino_%28Diceros_bicornis%29_in_the_evening_light_..._%2840361019683%29.jpg",
      alt: "A black rhinoceros in evening light in iSimangaliso Wetland Park, KwaZulu-Natal, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "A browser, not a grazer",
      caption:
        "The head is carried high because a black rhino feeds on leaves and twigs rather than grass. That single difference in diet is what separates it from the white rhino, and it decides where each species can live.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Black_Rhinoceros_%282875322914%29.jpg/1920px-Black_Rhinoceros_%282875322914%29.jpg",
      alt: "A black rhinoceros standing in scrub, its front horn and heavy build clearly visible",
      credit: "Vince Smith from London, United Kingdom / Wikimedia Commons",
      title: "Horn is hair, not bone",
      caption:
        "Both horns are compacted keratin — the same protein as fingernails — growing from the skin with no bony core. They regrow if broken, and their commercial value is the sole reason the species nearly disappeared.",
    },
  ],

  headline: "Critically endangered, and slowly increasing",
  intro: [
    "The black rhinoceros is the smaller of Africa's two rhinos, weighing 800 to 1,400 kg and standing about 1.5 metres at the shoulder. It is not black; the colour runs from grey to brown, and the name is best understood as the opposite half of a misunderstanding — 'white' rhino probably derives from a description of that species' wide square lip, not its colour.",
    "The lip is the real distinction. A black rhino's upper lip is pointed and prehensile, a grasping tool for pulling twigs and leaves into the mouth, which is why the alternative name hook-lipped rhinoceros is the more useful one. It makes the animal a browser of woody plants rather than a grazer of grass.",
    "Its recent history is a near-extinction. An estimated 65,000 black rhinos survived in 1970; poaching for horn reduced that to roughly 2,300 by the mid-1990s, a collapse of over 96% in a quarter of a century. Numbers have been climbing since, reaching 6,788 at the end of 2024 — but the species remains Critically Endangered, and one bad poaching year still undoes several good ones.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Perissodactyla",
    family: "Rhinocerotidae",
    genus: "Diceros",
    species: "Diceros bicornis",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2020,
    populationTrend: "increasing",
    populationEstimate: "6,788 animals at the end of 2024, up 5.2% on 2023; the 2020 Red List assessment counted 3,142 mature individuals",
    note: "Both halves of this are true and neither should be dropped. The species is Critically Endangered because it fell by more than 96% between 1970 and the mid-1990s, from around 65,000 animals to roughly 2,300, and because the demand for horn that caused that has not gone away. It is also recovering: numbers have roughly tripled from the low point and rose 5.2% in the single year to the end of 2024, at a time when white rhino numbers fell 11.2%. Three of the recognised subspecies are already extinct, the western black rhinoceros (Diceros bicornis longipes) having been formally declared so by the IUCN in 2011 after a final survey in northern Cameroon found none.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "3.0–3.8 m",
      min: 3.0,
      max: 3.8,
      unit: "m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "1.4–1.7 m",
      min: 1.4,
      max: 1.7,
      unit: "m",
      note: "Noticeably smaller than the white rhino, which stands up to 1.8 m and can weigh twice as much",
    },
    {
      key: "weight",
      label: "Weight",
      value: "800–1,400 kg",
      min: 800,
      max: 1400,
      unit: "kg",
      note: "Females are usually slightly heavier than males, unusually for a large mammal",
    },
    {
      key: "horn-length",
      label: "Front horn length",
      value: "50–140 cm",
      min: 50,
      max: 140,
      unit: "cm",
      note: "The rear horn reaches about 55 cm. Both are compacted keratin with no bone inside, and both regrow after breakage",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Up to about 55 km/h",
      min: 45,
      max: 55,
      unit: "km/h",
      note: "Over short distances, and with a turning circle far tighter than the animal's bulk suggests",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 15–16 months",
      min: 450,
      max: 480,
      unit: "days",
      note: "One of the longest pregnancies of any mammal",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1 calf",
      min: 1,
      max: 1,
      unit: "calf",
      note: "Cows calve once every two and a half to three years, and calves stay with the mother for two to four",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–7 years (females), 7–10 years (males)",
      min: 4,
      max: 10,
      unit: "years",
      note: "Slow maturity combined with long gestation caps how fast a population can grow, even under perfect protection",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "35–40 years in the wild",
      min: 35,
      max: 40,
      unit: "years",
      note: "Longer in managed care, where individuals have exceeded 45",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Browser — leaves, twigs and woody shrubs", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Largely solitary; cows accompanied by a calf", icon: "User" },
    { key: "activity", label: "Activity", value: "Feeds at dawn, dusk and through the night; rests in shade by day", icon: "Moon" },
    { key: "senses", label: "Senses", value: "Poor eyesight; acute hearing and an exceptional sense of smell", icon: "Ear" },
    { key: "ecological-role", label: "Ecological role", value: "Shapes bush structure by browsing woody regrowth", icon: "Sprout" },
  ],

  highlights: ["weight", "horn-length", "diet-type", "senses"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "South Africa",
      "Namibia",
      "Kenya",
      "Zimbabwe",
      "Tanzania",
      "Botswana, Zambia, Malawi, Eswatini and Mozambique",
    ],
    habitats: [
      "Semi-desert savanna",
      "Bushveld and thorn scrub",
      "Woodland and forest edge",
      "Wetland margins",
    ],
    elevation: "Sea level to around 2,700 m",
    note: "The historical range covered most of sub-Saharan Africa. What remains is a set of intensively protected populations concentrated in South Africa, Namibia, Kenya and Zimbabwe, many of them fenced and individually monitored. Namibia's Kunene region holds the only substantial free-ranging desert-adapted black rhino population, animals that survive on browse in country receiving barely 100 mm of rain a year.",
  },

  sections: [
    {
      id: "browser",
      title: "The hooked lip",
      body: [
        "The single most useful thing to know about a black rhino is what it eats. Its upper lip comes to a triangular, prehensile point that works like a finger, hooking twigs and branches and drawing them into the mouth. It is a browser: leaves, shoots, woody stems and the bark of shrubs, taken from anything up to about two metres off the ground.",
        "The white rhino, by contrast, has a broad square lip built to crop grass close to the ground, and grazes with its head down. Everything else follows from that — where each species can live, how each moves through the landscape, and why the two do not compete directly even where they overlap.",
        "Black rhinos take a very wide range of plants, several hundred species across the range, including many that are toxic or heavily defended with thorns and latex. They can go several days without drinking where they must, and desert-adapted animals in northwest Namibia manage on browse in country that receives almost no rain.",
        "Their browsing has consequences for the vegetation. By repeatedly cropping woody regrowth, black rhinos help maintain open bush structure — a small demonstration of what the loss of a large herbivore does to a landscape beyond the loss of the animal itself.",
      ],
    },
    {
      id: "senses",
      title: "Senses, temperament and the charge",
      body: [
        "A black rhino sees badly. Its eyesight is poor enough that it can fail to identify a stationary person at thirty metres, and this is the root of most of what is said about the animal's temperament. Hearing is acute — the ears swivel independently — and the sense of smell is exceptional, with the olfactory region of the brain larger than in most mammals.",
        "The species has a reputation as the most aggressive of the rhinos, and it does charge readily. The behaviour makes more sense read as a response to uncertainty: an animal that cannot see what is approaching, in dense bush where escape routes are limited, and with a calf at foot, resolves ambiguity by charging first. Rhinos regularly charge and then swerve away, or stop short.",
        "They are also fast for their size, reaching around 55 km/h in short bursts and turning far more sharply than the bulk suggests.",
        "Communication runs largely through scent. Both sexes use dung middens, which carry information about the identity, sex and condition of every animal that has visited, and males spray urine along territory boundaries. A rhino reads a midden the way another animal might read a noticeboard.",
      ],
    },
    {
      id: "horn",
      title: "Horn, and why it is the whole problem",
      body: [
        "A black rhino carries two horns, the front one typically 50 cm and occasionally over 140 cm, the rear one shorter. They are not bone and not attached to the skull: they are compacted keratin, the same structural protein as hair and fingernails, growing from the skin. They regrow if broken, which is the basis for dehorning as an anti-poaching measure.",
        "Horn has been traded for centuries — as ornamental dagger handles in Yemen, and in traditional Asian medicine. Modern demand, concentrated in Vietnam and China, has driven prices to levels comparable with gold by weight. There is no evidence that powdered rhino horn has any pharmacological effect; keratin is keratin.",
        "That demand is the proximate cause of the species' collapse. Between 1970 and the mid-1990s an estimated 65,000 black rhinos were reduced to roughly 2,300. Three of the recognised subspecies were lost entirely, and in 2011 the IUCN formally declared the western black rhinoceros extinct after surveys in northern Cameroon found no survivors — the last confirmed sighting had been in 2006.",
      ],
    },
    {
      id: "recovery",
      title: "The recovery",
      body: [
        "From the mid-1990s low point, black rhino numbers have roughly tripled. The count at the end of 2024 stood at 6,788, an increase of 5.2% on the previous year — and this in the same period in which white rhino numbers fell by 11.2%, which is a useful reminder that the trend is a result of specific work rather than a general improvement in conditions.",
        "The methods are unglamorous and expensive. Armed anti-poaching patrols and intensive protection zones. Individual identification and monitoring of most of the population. Dehorning, which removes the incentive without harming the animal. Translocation of small groups to found new populations and to relieve pressure where reserves reach carrying capacity — Kenya, Namibia, South Africa, Zimbabwe, Rwanda, Chad, Malawi and Zambia have all received or supplied animals.",
        "Community conservancies, particularly in Kenya and Namibia, have been central. Where local people derive income from live rhinos through tourism and employment, poaching intelligence improves and losses fall.",
        "Progress remains fragile. The population is fragmented across many small, often fenced reserves, which raises the risk of inbreeding and requires active genetic management. Protection costs are high and depend on tourism revenue that can vanish in a crisis. And demand for horn has not been eliminated — only outpaced, so far, by the effort spent stopping it.",
      ],
    },
    {
      id: "life",
      title: "Solitary lives, slow reproduction",
      body: [
        "Black rhinos are largely solitary. Bulls hold home ranges that overlap those of several cows and defend them against other bulls, sometimes fatally; rhino-on-rhino combat is a significant cause of adult mortality in confined reserves. Cows are accompanied by their most recent calf.",
        "Gestation runs 15 to 16 months, among the longest of any mammal, and produces a single calf weighing 35 to 50 kg. It can walk within hours and stays with its mother for two to four years, weaning at around two but remaining alongside her until she calves again. A cow produces a calf every two and a half to three years.",
        "Black rhino calves follow behind their mothers, while white rhino calves run ahead — a small behavioural difference that reflects the habitat each evolved in, dense bush versus open grassland.",
        "That reproductive rate sets the ceiling on recovery. Even under perfect protection a black rhino population can grow only so fast, which is why the species will remain Critically Endangered for a long time after the threat is contained, and why every individual lost to poaching costs years.",
      ],
    },
  ],

  related: ["african-savanna-elephant", "hippopotamus", "giraffe"],
  tags: ["africa", "herbivore", "megafauna", "critically endangered", "savanna", "browser"],
  searchTerms: [
    "diceros bicornis",
    "black rhino",
    "hook lipped rhinoceros",
    "how many black rhinos are left",
    "rhino horn poaching",
  ],

  faqs: [
    {
      q: "How many black rhinos are left?",
      a: "6,788 at the end of 2024, an increase of 5.2% on the previous year. That is roughly three times the mid-1990s low of about 2,300, but still far below the estimated 65,000 that survived in 1970. The 2020 Red List assessment, which uses mature individuals rather than total animals, counted 3,142.",
    },
    {
      q: "Why is the black rhino called black when it isn't?",
      a: "It is not clear, and the name is best understood alongside the white rhino's. 'White' is widely thought to be a corruption of a description of that species' wide, square lip rather than its colour; 'black' then followed as the obvious contrast. Black rhinos are grey to brown, and often take on the colour of the mud they wallow in. The more useful names are hook-lipped and square-lipped.",
    },
    {
      q: "What is the difference between a black and a white rhinoceros?",
      a: "Diet and the mouth that goes with it. The black rhino has a pointed, prehensile upper lip for pulling twigs and leaves into its mouth and browses on woody plants; the white rhino has a broad square lip for cropping grass and grazes head-down. The white rhino is also substantially larger, has a more pronounced neck hump, and is more social.",
    },
    {
      q: "Is rhino horn made of bone?",
      a: "No. It is compacted keratin — the same structural protein as hair and fingernails — growing from the skin with no bony core and no attachment to the skull. It regrows if broken, which is why dehorning can be used as an anti-poaching measure without permanently harming the animal. It has no proven medicinal properties.",
    },
    {
      q: "Are black rhino numbers going up or down?",
      a: "Up, slowly, while the species remains Critically Endangered. Numbers have roughly tripled since the mid-1990s and rose 5.2% in the year to the end of 2024. Recovery is slow because a cow produces one calf every two and a half to three years after a 15-month pregnancy, so even perfectly protected populations grow only gradually — and three subspecies, including the western black rhinoceros declared extinct in 2011, are already gone.",
    },
  ],

  seo: {
    title: "Black Rhinoceros — Population, Horn, Diet & Conservation",
    description:
      "A researched profile of the black rhinoceros (Diceros bicornis): the hooked browsing lip, why horn drove a 96% collapse, and how a Critically Endangered species came to be increasing again.",
    keywords: [
      "black rhino facts",
      "diceros bicornis",
      "how many black rhinos are left",
      "black vs white rhino",
      "rhino horn",
    ],
  },

  sources: [
    {
      label: "Diceros bicornis — Red List assessment (Emslie, 2020)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/6557/152728945",
    },
    {
      label: "Poaching of African rhinos down — but drought and other threats drive losses globally (August 2025)",
      publisher: "IUCN",
      url: "https://iucn.org/press-release/202508/poaching-african-rhinos-down-drought-and-other-threats-drive-losses-globally",
    },
    {
      label: "Black rhino species profile and population figures",
      publisher: "International Rhino Foundation",
      url: "https://rhinos.org/about-rhinos/rhino-species/black-rhino/",
    },
    {
      label: "Western black rhino declared extinct in 2011",
      publisher: "Save the Rhino International",
      url: "https://www.savetherhino.org/rhino-species/black-rhino/western-black-rhino-declared-extinct-in-2011-journalists-reporting-news-two-years-later/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default blackRhinoceros;
