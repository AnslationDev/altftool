// Chimpanzee — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const chimpanzee = {
  slug: "chimpanzee",
  category: "mammals",
  name: "Chimpanzee",
  scientificName: "Pan troglodytes",
  otherNames: ["Common chimpanzee", "Robust chimpanzee"],

  summary:
    "Humanity's closest living relative alongside the bonobo, and the animal in which tool use, culture, politics and lethal intergroup warfare were all first documented in the wild.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/015_Chimpanzee_at_Kibale_forest_National_Park_Photo_by_Giles_Laurent.jpg/1920px-015_Chimpanzee_at_Kibale_forest_National_Park_Photo_by_Giles_Laurent.jpg",
    alt: "A chimpanzee in the forest at Kibale National Park, Uganda",
    credit: "Giles Laurent / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Chimpanzee_%2837161613913%29.jpg/1920px-Chimpanzee_%2837161613913%29.jpg",
      alt: "A chimpanzee seated, with its face and hands clearly visible",
      credit: "Derek Keats from Johannesburg, South Africa / Wikimedia Commons",
      title: "Hands that do fine work",
      caption:
        "Chimpanzee hands have a true opposable thumb, though a short one. It is precise enough to strip a twig into a termite probe and strong enough to swing the animal's full weight from a branch.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Chimpanzee_%2813945590012%29.jpg",
      alt: "A chimpanzee photographed at close range, head and upper body in frame",
      credit: "Chi King / Wikimedia Commons",
      title: "A face made for signalling",
      caption:
        "Chimpanzees have the facial musculature for a large repertoire of expressions, and researchers have catalogued dozens of distinct gestures with consistent meanings across communities.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Chimpanzee_%2813968481823%29.jpg/1920px-Chimpanzee_%2813968481823%29.jpg",
      alt: "A chimpanzee resting, its dark coat and pale face visible",
      credit: "Chi King / Wikimedia Commons",
      title: "Faces lighten and darken with age",
      caption:
        "Infants are born with pale faces and a white tail tuft, both of which darken as they mature. Adults are individually recognisable by face, and long-term field studies track named individuals across decades.",
    },
  ],

  headline: "The closest thing to a mirror in the animal world",
  intro: [
    "Chimpanzees share close to 99% of their DNA sequence with humans. What makes them genuinely revealing is not the percentage but the behaviour: they make and use tools, they teach those techniques to their young, they form political coalitions, they wage territorial war on neighbouring communities, and they show something that looks a great deal like grief.",
    "Almost all of that was unknown before the 1960s. Jane Goodall's observation of a chimpanzee stripping a twig to fish for termites at Gombe forced a redefinition of what tool use meant, and sixty years of continuous field study since have shown that different communities do things differently — that chimpanzees have culture.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Primates",
    family: "Hominidae",
    genus: "Pan",
    species: "Pan troglodytes",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2016,
    populationTrend: "decreasing",
    populationEstimate: "Roughly 170,000–300,000 across equatorial Africa",
    note: "Endangered under the 2016 assessment (errata version 2018). The overall figure hides very different subspecies fortunes: the central chimpanzee holds around 140,000 animals and the eastern chimpanzee 180,000–256,000, while the Nigeria–Cameroon chimpanzee is down to 6,000–9,000 and the western chimpanzee was uplisted to Critically Endangered in 2016 after a decline of around 80% in twenty-five years.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "1.0–1.7 m",
      min: 1.0,
      max: 1.7,
      unit: "m",
      note: "Around 1.5 m is typical for an adult; chimpanzees stand and walk bipedally only for short distances",
    },
    {
      key: "body-length",
      label: "Head–body length",
      value: "0.64–0.94 m",
      min: 0.64,
      max: 0.94,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "26–70 kg",
      min: 26,
      max: 70,
      unit: "kg",
      note: "Wild males 34–70 kg, females 26–50 kg. Captive animals are frequently much heavier, which is where inflated size claims come from",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 230 days",
      min: 202,
      max: 260,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "One infant",
      min: 1,
      max: 1,
      unit: "young",
      note: "Twins occur but are rare and rarely both survive",
    },
    {
      key: "birth-interval",
      label: "Interval between births",
      value: "3–6 years",
      min: 3,
      max: 6,
      unit: "years",
      note: "Around five years is typical where the previous infant survives — one of the slowest reproductive rates of any mammal",
    },
    {
      key: "sexual-maturity",
      label: "Age at first birth",
      value: "13–14 years",
      min: 13,
      max: 14,
      unit: "years",
      note: "Puberty comes at around seven, followed by several years of adolescent sterility",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 40 years in the wild",
      min: 30,
      max: 50,
      unit: "years",
      note: "Life expectancy at birth is far lower — from about 13 to 33 years depending on the community — because infant mortality is high. Captive chimpanzees have lived well past 60",
    },
    {
      key: "territory-size",
      label: "Community range",
      value: "5–560 km²",
      min: 5,
      max: 560,
      unit: "km²",
      note: "Around 12 km² is typical in closed forest; savanna-dwelling communities, where food is widely scattered, range over hundreds of square kilometres",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore — mostly ripe fruit, plus leaves, insects and meat", icon: "Apple" },
    { key: "social-structure", label: "Social structure", value: "Fission–fusion communities of roughly 15–150", icon: "Users" },
    { key: "activity", label: "Activity", value: "Diurnal; nests in trees each night", icon: "Sun" },
    { key: "tool-use", label: "Tool use", value: "Habitual and cultural — probes, hammers, sponges, spears", icon: "Wrench" },
    { key: "locomotion", label: "Locomotion", value: "Knuckle-walks on the ground; climbs and brachiates in trees", icon: "Footprints" },
    { key: "genetics", label: "Genetic similarity to humans", value: "Close to 99% of DNA sequence shared", icon: "Dna" },
  ],

  highlights: ["weight", "tool-use", "social-structure", "genetics"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Democratic Republic of the Congo",
      "Gabon, Cameroon and the Republic of the Congo",
      "Uganda and Tanzania",
      "Guinea, Liberia and Sierra Leone",
      "Côte d'Ivoire and Ghana",
      "Nigeria",
      "Central African Republic and South Sudan",
    ],
    habitats: [
      "Tropical moist forest",
      "Montane forest",
      "Forest–savanna mosaic",
      "Dry woodland and savanna",
    ],
    elevation: "Sea level to around 2,800 m",
    note: "Chimpanzees occur in a broad equatorial band from Senegal to Tanzania, but the distribution is fragmented and the density varies by two orders of magnitude across it. The western populations in Upper Guinea are the most isolated and the most reduced; the largest continuous populations are in the Congo Basin.",
  },

  sections: [
    {
      id: "tools",
      title: "Tools and culture",
      body: [
        "In 1960 Jane Goodall watched a chimpanzee at Gombe strip the leaves from a twig and push it into a termite mound. The observation is famous because tool manufacture had been treated as the defining line between humans and everything else, and it moved.",
        "The catalogue has grown enormously since. Chimpanzees crack hard nuts with stone or wooden hammers on stone anvils, a technique that takes years to learn properly. They fold leaves into sponges to draw water from tree hollows. They use long sticks to raid dangerous bee nests and short ones for accessible honey. In Senegal, chimpanzees have been recorded sharpening sticks with their teeth and jabbing them into hollows to hunt bushbabies.",
        "What matters most is that these behaviours are local. Nut-cracking is widespread in West Africa and absent in East Africa despite identical nuts and stones being available. Termite-fishing techniques differ between neighbouring communities. Young chimpanzees learn by watching their mothers for years. This is culture by any reasonable definition, and it means a community that is lost takes its particular repertoire with it.",
      ],
    },
    {
      id: "society",
      title: "Fission–fusion society",
      body: [
        "A chimpanzee community numbers roughly fifteen to more than a hundred and fifty individuals, but they are almost never all together. The community splits and re-forms constantly into small parties whose membership changes over hours — the arrangement primatologists call fission–fusion — with party size tracking how much fruit is available.",
        "Males stay in the community they were born into for life and form the stable core; females typically transfer to a neighbouring community at adolescence. That is the reverse of most mammal societies and it has a large consequence: the males of a community are relatives who have known each other since infancy, which is the foundation of their cooperation.",
        "Male hierarchy is linear but not simply a matter of size. Alpha status is won and held through coalitions, and a smaller male with two reliable allies routinely outranks a larger one without. Alliances are maintained with grooming, meat-sharing and support in fights, and they shift — the political manoeuvring documented at Gombe and Mahale is detailed enough to have generated its own literature.",
      ],
    },
    {
      id: "aggression",
      title: "Hunting and intergroup violence",
      body: [
        "Chimpanzees hunt. Groups of males cooperate to catch red colobus monkeys, bush pigs and small antelope, with individuals appearing to take distinct roles — drivers, blockers, ambushers. Meat is a small fraction of the diet by weight but is shared strategically, and access to it is closely tied to social standing.",
        "They also kill each other. Parties of males patrol their territorial boundaries in silence, and an isolated individual from a neighbouring community found on the wrong side of the line is likely to be attacked and killed. Over four years in the mid-1970s the Kasekela community at Gombe systematically destroyed the smaller Kahama community that had split away from it — the sequence usually called the Gombe chimpanzee war.",
        "Decades of subsequent data across many sites have established that this is a normal, if intermittent, feature of chimpanzee life rather than an artefact of provisioning or human disturbance. It is one of the reasons the species figures so heavily in arguments about the evolutionary origins of human violence.",
      ],
    },
    {
      id: "reproduction",
      title: "Slow lives",
      body: [
        "Chimpanzees reproduce very slowly. A female gives birth for the first time at around thirteen or fourteen, after several years of adolescent sterility, and then produces a single infant roughly every five years. Weaning takes about three years and the young stay close to their mother well beyond that.",
        "The infant is carried constantly for the first months, clinging to the mother's belly and later riding her back. It sleeps in her nest until it is four or five — chimpanzees build a fresh nest in a tree almost every night — and learns foraging, tool use and social navigation entirely by watching her.",
        "That schedule sets the limit on recovery. Even with total protection, a community that loses adults replaces them over decades, which is why the western chimpanzee's roughly 80% decline over twenty-five years cannot be reversed on any comparable timescale.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "Three pressures dominate. Habitat loss to logging, mining and agriculture — oil palm in particular — is fragmenting the range. Commercial bushmeat hunting kills adults directly and is the most immediately lethal of the three. And infectious disease, including Ebola and human respiratory viruses transmitted by researchers and tourists, has caused severe local die-offs.",
        "The live trade continues alongside these: infants are taken for the pet trade, which typically means killing the mother and often other adults defending her, and the mortality among trafficked infants is very high.",
        "Conservation work now centres on protecting large blocks of habitat with functioning law enforcement, on strict health protocols at habituated sites, and on sanctuaries for confiscated animals. The long-running field sites — Gombe, Mahale, Taï, Budongo, Ngogo — matter for more than research: continuous human presence is itself a substantial deterrent to poaching.",
      ],
    },
  ],

  related: ["western-gorilla", "bornean-orangutan"],
  tags: ["great ape", "primate", "africa", "endangered", "omnivore", "tool use", "rainforest"],
  searchTerms: ["pan troglodytes", "chimp", "great ape", "jane goodall", "chimpanzee dna"],

  faqs: [
    {
      q: "How much DNA do chimpanzees share with humans?",
      a: "Close to 99% at the level of directly comparable DNA sequence. Counting insertions and deletions across whole genomes gives a larger difference, in the region of 12 to 13% of the total sequence. Chimpanzees and bonobos are together our closest living relatives.",
    },
    {
      q: "Do chimpanzees really use tools?",
      a: "Extensively. They make termite-fishing probes from twigs, crack nuts with stone hammers and anvils, fold leaves into sponges for drinking, use sticks to raid bee nests, and in Senegal have been recorded sharpening sticks to hunt bushbabies. The techniques differ between communities and are learned from adults, which makes them cultural rather than instinctive.",
    },
    {
      q: "Are chimpanzees stronger than humans?",
      a: "Yes, but by less than folklore suggests. Measurements indicate chimpanzee muscle produces roughly 1.5 times the force of human muscle of the same mass, mainly because of a higher proportion of fast-twitch fibres. That is a substantial advantage, not the five- or ten-fold difference often claimed.",
    },
    {
      q: "Why are chimpanzees endangered?",
      a: "Habitat loss to logging, mining and agriculture, commercial bushmeat hunting, and disease — Ebola and human respiratory infections have caused severe local die-offs. The species reproduces very slowly, with one infant roughly every five years, so losses are not made up quickly. The western chimpanzee subspecies is Critically Endangered after a decline of about 80% in twenty-five years.",
    },
    {
      q: "How do chimpanzees live socially?",
      a: "In communities of roughly fifteen to over a hundred and fifty that constantly split into smaller parties and re-form, an arrangement called fission–fusion. Males stay in their birth community for life and form its stable core through coalitions; females usually move to a neighbouring community at adolescence.",
    },
  ],

  seo: {
    title: "Chimpanzee — Tool Use, Society, Intelligence & Conservation Status",
    description:
      "A researched profile of the chimpanzee (Pan troglodytes): DNA shared with humans, cultural tool use, fission–fusion society, territorial warfare, and why the species is Endangered.",
    keywords: [
      "chimpanzee facts",
      "pan troglodytes",
      "chimpanzee tool use",
      "chimpanzee dna humans",
      "are chimpanzees endangered",
    ],
  },

  sources: [
    {
      label: "Pan troglodytes — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/15933/129038584",
    },
    {
      label: "Pan troglodytes species account",
      publisher: "Animal Diversity Web, University of Michigan Museum of Zoology",
      url: "https://animaldiversity.org/accounts/Pan_troglodytes/",
    },
    {
      label: "Chimpanzee species profile",
      publisher: "African Wildlife Foundation",
      url: "https://www.awf.org/wildlife-conservation/chimpanzee",
    },
  ],

  updatedAt: "2026-07-29",
};

export default chimpanzee;
