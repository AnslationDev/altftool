// Tiger — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const tiger = {
  slug: "tiger",
  category: "mammals",
  name: "Tiger",
  scientificName: "Panthera tigris",
  otherNames: ["Bengal tiger", "Siberian tiger", "Amur tiger"],

  summary:
    "The largest cat in the world, a solitary ambush hunter whose stripe pattern is unique to each individual, and the subject of the most concerted big-cat recovery effort ever attempted.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=1600&q=80",
    alt: "A tiger yawning, showing its canines and striped face",
    credit: "Kartik Iyer / Unsplash",
  },
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1400&q=80",
      alt: "A tiger walking directly towards the camera",
      credit: "Mike Marrah / Unsplash",
    },
  ],

  headline: "The largest cat in the world",
  intro: [
    "A large male tiger can weigh more than 250 kg — heavier than all but the largest lions, and heavy enough to bring down prey several times its own mass. Unlike lions, tigers live alone, hunting by stalking to within a few metres and ending the attack in a single explosive rush.",
    "Tigers once ranged from eastern Turkey to the Russian Far East and south through Indonesia. They have lost more than 90% of that range, and three subspecies are extinct. What makes the species unusual in conservation terms is that the decline has, for the first time in a century, begun to reverse.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Felidae",
    genus: "Panthera",
    species: "Panthera tigris",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2022,
    populationTrend: "increasing",
    populationEstimate: "Roughly 3,700–5,600 mature individuals in the wild",
    note: "Still Endangered, but the global wild population has risen from an estimated low of around 3,200 in 2010 — the first sustained increase in a century. India holds well over half the total. The Caspian, Javan and Bali tigers are extinct, and the South China tiger has not been recorded in the wild for decades.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.4–2.3 m",
      min: 1.4,
      max: 2.3,
      unit: "m",
      note: "Females and Sumatran tigers sit at the lower end; large Amur and Bengal males at the upper",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.6–1.1 m",
      min: 0.6,
      max: 1.1,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "100–260 kg",
      min: 100,
      max: 260,
      unit: "kg",
      note: "Females 100–160 kg; large males exceed 250 kg",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Around 60 km/h",
      min: 50,
      max: 65,
      unit: "km/h",
      note: "Over very short distances only",
    },
    {
      key: "territory-size",
      label: "Territory size",
      value: "20–1,000 km²",
      min: 20,
      max: 1000,
      unit: "km²",
      note: "Varies enormously with prey density; Amur tiger ranges are the largest, with males holding many hundreds of square kilometres",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "Around 1,050 PSI",
      min: 1050,
      max: 1050,
      unit: "PSI",
      note: "The strongest bite of any big cat — roughly 1.5 times a lion's",
    },
    {
      key: "jump-height",
      label: "Jump height",
      value: "Up to about 4 m",
      min: 4,
      max: 4,
      unit: "m",
      note: "Vertical leap; tigers clear considerably more ground horizontally",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "3–4 years (females), 4–5 years (males)",
      min: 3,
      max: 5,
      unit: "years",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 105 days",
      min: 93,
      max: 112,
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
      key: "lifespan",
      label: "Lifespan",
      value: "8–10 years in the wild",
      min: 8,
      max: 10,
      unit: "years",
      note: "Up to 20 years in captivity",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Solitary and territorial", icon: "User" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal and crepuscular", icon: "Moon" },
    { key: "swimming", label: "Swimming", value: "Strong swimmer; enters water readily", icon: "Waves" },
  ],

  highlights: ["weight", "top-speed", "social-structure", "swimming"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "India",
      "Nepal and Bhutan",
      "Russian Far East",
      "Thailand and Malaysia",
      "Sumatra, Indonesia",
      "Bangladesh",
    ],
    habitats: [
      "Tropical and subtropical forest",
      "Mangrove swamp",
      "Grassland",
      "Temperate and boreal forest",
    ],
    elevation: "Sea level to around 4,000 m in the Himalayan foothills",
    note: "The range is now a set of disconnected fragments rather than a continuous belt. The Sundarbans mangrove forest of India and Bangladesh holds the only tiger population living in a mangrove habitat, and the Amur tiger occupies snow-covered forest at the opposite climatic extreme.",
  },

  sections: [
    {
      id: "habitat",
      title: "Habitat and range",
      body: [
        "Tigers are adaptable in habitat but strict in requirements: dense cover for stalking, reliable water, and enough large prey to sustain a territory. Within those constraints they occupy tropical rainforest, mangrove swamp, dry deciduous forest, tall grassland and the snowbound conifer forest of the Russian Far East.",
        "Territory size follows prey density directly. In the prey-rich grasslands of India's terai a female may hold twenty square kilometres; an Amur tiger in the sparse forests of Primorye may need several hundred. Males hold larger territories overlapping those of several females, and mark boundaries with scent, scratch marks and vocalisation.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting and diet",
      body: [
        "Tigers take large ungulates — sambar, chital, wild boar, gaur, and in the Russian Far East red deer and wild boar. A tiger can kill prey substantially heavier than itself, and gaur weighing close to a tonne have been taken.",
        "The method is stalk and ambush, almost always at night. The tiger approaches under cover to within ten or twenty metres, then attacks in a short rush, seizing the throat or nape. Most hunts fail — success rates are commonly cited around one in ten to one in twenty — so a tiger will feed on a large kill over several days, dragging it into cover and returning to it.",
        "Unlike most cats, tigers are strong swimmers and comfortable in water. In the Sundarbans they swim between islands routinely, and in hot weather they will rest submerged.",
      ],
    },
    {
      id: "stripes",
      title: "Stripes and identification",
      body: [
        "Every tiger's stripe pattern is unique, and the flank patterns are asymmetrical between left and right. Researchers use this the way fingerprints are used, identifying individuals from camera-trap photographs — which is how most modern tiger population estimates are produced.",
        "The stripes are in the skin as well as the fur; a shaved tiger still shows the pattern. In broken forest light, vertical striping breaks up the body outline extremely effectively, and because the ungulates tigers hunt have limited colour vision, orange reads to them as a muted, greenish tone rather than a conspicuous one.",
      ],
    },
    {
      id: "reproduction",
      title: "Reproduction and cubs",
      body: [
        "After a gestation of about 105 days, a female gives birth to two to four cubs in a sheltered den. They are born blind and entirely dependent, and she raises them alone — males play no part in rearing and may kill unrelated cubs.",
        "Cubs begin taking meat at around two months and start accompanying their mother on hunts at about six. They stay with her for roughly two years, learning to hunt, before dispersing to establish territories of their own. Dispersal is the most dangerous period of a tiger's life: young animals crossing unfamiliar and often human-dominated ground are the most likely to be killed.",
      ],
    },
    {
      id: "recovery",
      title: "Decline and recovery",
      body: [
        "An estimated 100,000 tigers lived across Asia at the beginning of the twentieth century. By 2010 the wild population had fallen to roughly 3,200. Hunting, habitat destruction, the collapse of prey populations and poaching for skins and for use in traditional medicine drove the decline, and three subspecies were lost entirely.",
        "In 2010 the thirteen tiger range countries agreed at a summit in St Petersburg to attempt to double wild numbers. The target was not met globally, but the trend reversed — the current estimate of roughly 3,700 to 5,600 mature individuals represents the first sustained increase in a century. India, Nepal and Bhutan account for most of the gain, with Nepal nearly tripling its population — from 121 tigers in 2009 to 355 in 2022, comfortably past the doubling target it had set.",
        "Progress is uneven. Southeast Asian populations continue to decline, tigers are considered functionally extinct in Cambodia, Vietnam and Laos, and the Sumatran tiger remains Critically Endangered. Poaching for the illegal trade continues, and the long-term challenge is connecting protected reserves so isolated populations do not lose genetic diversity.",
      ],
    },
  ],

  related: ["lion", "african-savanna-elephant"],
  tags: ["big cat", "apex predator", "asia", "carnivore", "endangered", "solitary"],
  searchTerms: ["panthera tigris", "bengal tiger", "siberian tiger", "amur tiger", "stripes"],

  faqs: [
    {
      q: "How big is a tiger compared with a lion?",
      a: "Tigers are the larger of the two. A big male tiger can exceed 250 kg against roughly 225 kg for a large male lion, and tigers are generally longer in the body. The bigger difference is behavioural: lions live in prides while tigers are solitary and territorial.",
    },
    {
      q: "Are tiger stripes unique to each animal?",
      a: "Yes, and the pattern differs between an individual's left and right flanks. Researchers identify tigers from camera-trap photographs using stripe patterns much as fingerprints are used, and this is how most modern population surveys are conducted. The stripes are in the skin as well as the fur.",
    },
    {
      q: "How many tigers are left in the wild?",
      a: "Roughly 3,700 to 5,600 mature individuals. That is up from an estimated low of around 3,200 in 2010 — the first sustained increase in a century — though the species remains Endangered. India holds well over half the world total.",
    },
    {
      q: "Do tigers like water?",
      a: "Unusually for cats, yes. Tigers are strong swimmers and enter water readily, both to cool down in hot weather and to travel. In the Sundarbans mangrove forest they swim between islands as a matter of routine.",
    },
    {
      q: "Which tiger subspecies have gone extinct?",
      a: "The Caspian, Javan and Bali tigers are extinct, all within the twentieth century. The South China tiger has not been recorded in the wild for decades and is considered functionally extinct there, surviving only in captivity.",
    },
  ],

  seo: {
    title: "Tiger — Size, Hunting, Habitat & Conservation Status",
    description:
      "A researched profile of the tiger (Panthera tigris): the world's largest cat, its solitary hunting, unique stripe patterns, range across Asia, and the recovery from a century of decline.",
    keywords: [
      "tiger facts",
      "panthera tigris",
      "bengal tiger",
      "how many tigers are left",
      "tiger conservation",
    ],
  },

  sources: [
    {
      label: "Panthera tigris — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/15955/214862019",
    },
    {
      label: "Tiger species profile",
      publisher: "WWF",
      url: "https://www.worldwildlife.org/species/tiger",
    },
    {
      label: "Status of tigers in India",
      publisher: "National Tiger Conservation Authority, Government of India",
      url: "https://ntca.gov.in",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default tiger;
