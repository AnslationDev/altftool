// Komodo dragon — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const komodoDragon = {
  slug: "komodo-dragon",
  category: "reptiles",
  name: "Komodo Dragon",
  scientificName: "Varanus komodoensis",
  otherNames: ["Komodo monitor", "Ora"],

  summary:
    "The largest living lizard, confined to a handful of Indonesian islands, with venom glands, serrated teeth and a sense of smell that can locate carrion kilometres away.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1562578057-3ca1f7815237?auto=format&fit=crop&w=1600&q=80",
    alt: "A Komodo dragon resting on a rock with its forked tongue extended",
    credit: "David Clode / Unsplash",
  },
  gallery: [],

  headline: "The largest lizard alive, on five Indonesian islands",
  intro: [
    "Komodo dragons reach three metres and around 70 to 90 kg, making them the largest lizards on Earth. They exist nowhere but a small group of islands in eastern Indonesia — Komodo, Rinca, Nusa Kode, Gili Motang and Flores — a total range smaller than many national parks.",
    "Their size did not come from that isolation, as is often assumed. Fossils assigned to the species in Queensland date to around 3.8 million years ago, so Komodo dragons were already this large on mainland Australia alongside large marsupial carnivores, and later contracted to the islands where they now survive. The islands preserved the animal rather than produced it.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Varanidae",
    genus: "Varanus",
    species: "Varanus komodoensis",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2021,
    populationTrend: "decreasing",
    populationEstimate: "Around 1,400 adults and roughly 2,000 juveniles",
    note: "Uplisted from Vulnerable to Endangered in 2021. The primary long-term concern is sea-level rise, which is projected to reduce the low-lying coastal habitat that much of the population depends on.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Up to 3 m",
      min: 2,
      max: 3,
      unit: "m",
      note: "Including the tail, which is roughly half the total",
    },
    {
      key: "weight",
      label: "Weight",
      value: "70–90 kg",
      min: 70,
      max: 90,
      unit: "kg",
      note: "Exceptional individuals have been recorded far heavier after a large meal",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Around 20 km/h",
      min: 18,
      max: 20,
      unit: "km/h",
      note: "Only in short bursts",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "Around 39 PSI",
      min: 39,
      max: 39,
      unit: "PSI",
      note: "Strikingly weak for its size — roughly a twentieth of a saltwater crocodile's. The kill comes from serrated teeth and venom, not crushing power",
    },
    {
      key: "smell-range",
      label: "Scent detection range",
      value: "Carrion detected up to about 9.5 km away",
      min: 9.5,
      max: 9.5,
      unit: "km",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "About 20 eggs",
      min: 15,
      max: 30,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "7–8 months",
      min: 7,
      max: 8,
      unit: "months",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 30 years",
      min: 25,
      max: 30,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore and scavenger", icon: "Drumstick" },
    { key: "venom-type", label: "Venom", value: "Anticoagulant venom glands in the lower jaw", icon: "Droplet" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — hunts by scent, not infrared", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "In patches through the year, not as one whole skin", icon: "RefreshCw" },
    { key: "range-size", label: "Range", value: "Endemic to five Indonesian islands", icon: "MapPin" },
  ],

  highlights: ["length", "weight", "smell-range", "range-size"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Komodo Island",
      "Rinca",
      "Nusa Kode",
      "Gili Motang",
      "Flores",
    ],
    habitats: ["Tropical savanna", "Dry deciduous forest", "Coastal lowland"],
    elevation: "Sea level to around 800 m",
    note: "Most of the population lives in low-lying coastal areas within Komodo National Park, which is why projected sea-level rise is treated as the central long-term threat. Dragons were lost from Padar in the 1970s after its deer population was poached out, and have not returned.",
  },

  sections: [
    {
      id: "hunting",
      title: "Hunting and venom",
      body: [
        "Komodo dragons ambush prey from cover, attacking deer, wild boar, water buffalo, smaller dragons and carrion. The attack combines force with a bite designed to wound: the teeth are curved, serrated and replaced continually, tearing through flesh rather than crushing bone.",
        "For decades the standard explanation for why bitten prey later died was bacteria — a supposedly septic mouth. That account has been overturned. Work published in 2009 identified venom glands in the lower jaw producing compounds that prevent blood clotting and lower blood pressure, deepening shock and blood loss. The dragon then follows the weakened animal, sometimes for a considerable distance, until it collapses.",
        "Large prey is typically shared. Several dragons will feed on a carcass in a loose dominance order, with the largest individuals eating first.",
      ],
    },
    {
      id: "senses",
      title: "Senses",
      body: [
        "The dragon's primary sense is chemical. It flicks its forked tongue to collect airborne particles and presses them against the Jacobson's organ in the roof of the mouth, reading each fork separately — which gives a directional signal, so the animal can tell which way a scent is coming from.",
        "This system is sensitive enough to detect carrion at distances of several kilometres, and dragons will travel a long way across an island towards a carcass. Vision is reasonable in daylight but of limited use at night, and hearing is comparatively poor, restricted to a narrow band of frequencies.",
      ],
    },
    {
      id: "reproduction",
      title: "Reproduction and young",
      body: [
        "Females lay around twenty eggs in the late dry season, often in the abandoned mounds of megapode birds or in burrows dug into a hillside, and the eggs incubate for seven to eight months before hatching around April, as the wet season ends and insect and small-prey numbers peak.",
        "Komodo dragons are also capable of parthenogenesis — producing viable offspring without a male. This was documented at two European zoos in 2006 when isolated females produced fertile eggs, all of which developed as males. On a chain of small islands, the ability of a lone female to found a population is a considerable advantage.",
        "Hatchlings are vulnerable, not least to adult dragons, and spend their first years living in trees where the adults cannot follow. They descend to the ground as they outgrow both the branches and the risk.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "The range is tiny and cannot expand, which makes every pressure disproportionate. Prey depletion from poaching of deer and boar, habitat loss on Flores, and the effects of tourism and development within the park all bear on a population of roughly 1,400 adults.",
        "The 2021 uplisting to Endangered was driven mainly by climate projections: much of the population occupies low coastal ground, and modelling suggests sea-level rise could remove a substantial share of suitable habitat over the coming decades.",
        "Komodo National Park, established in 1980 and a UNESCO World Heritage Site, protects most of the remaining animals, and monitoring programmes track individuals across the islands. The species is listed on CITES Appendix I, prohibiting commercial international trade.",
      ],
    },
  ],

  related: ["king-cobra"],
  tags: ["lizard", "monitor", "indonesia", "island endemic", "apex predator", "endangered"],
  searchTerms: ["varanus komodoensis", "largest lizard", "ora", "komodo monitor"],

  faqs: [
    {
      q: "Is a Komodo dragon's bite venomous or just full of bacteria?",
      a: "Venomous. The old explanation was that bacteria in the mouth caused prey to die of infection, but research published in 2009 identified venom glands in the lower jaw producing anticoagulant compounds that prevent clotting and lower blood pressure. Prey dies of blood loss and shock rather than septicaemia.",
    },
    {
      q: "Where do Komodo dragons live in the wild?",
      a: "Only on five Indonesian islands — Komodo, Rinca, Nusa Kode, Gili Motang and Flores — most within Komodo National Park. They exist nowhere else on Earth, which is a large part of why the species is so vulnerable. Padar once held them too, but its dragons were lost in the 1970s after the deer they hunted were poached out.",
    },
    {
      q: "Why are Komodo dragons so large?",
      a: "Not because of island gigantism, which is the usual explanation. Fossils of the species found in Queensland date to around 3.8 million years ago, showing Komodo dragons were already this size on mainland Australia alongside large marsupial carnivores. The species later contracted to the Indonesian islands, where its size was preserved rather than produced.",
    },
    {
      q: "Can Komodo dragons reproduce without males?",
      a: "Yes. Parthenogenesis was documented at two European zoos in 2006, when isolated females produced fertile eggs — all of which hatched as males. For an animal living on a scattered island chain, the ability of a single female to establish a population is a real evolutionary advantage.",
    },
    {
      q: "Why do young Komodo dragons live in trees?",
      a: "To avoid being eaten by adults, which are cannibalistic. Hatchlings are small enough to climb and spend their early years in the canopy, coming down to the ground only once they are too large for the branches — and large enough to be safer.",
    },
  ],

  seo: {
    title: "Komodo Dragon — Size, Venom, Habitat & Conservation",
    description:
      "A researched profile of the Komodo dragon (Varanus komodoensis): the world's largest lizard, its venom glands, extraordinary sense of smell, parthenogenesis, and Endangered status in Indonesia.",
    keywords: [
      "komodo dragon facts",
      "varanus komodoensis",
      "largest lizard",
      "komodo dragon venom",
      "komodo national park",
    ],
  },

  sources: [
    {
      label: "Varanus komodoensis — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22884/123633058",
    },
    {
      label: "Komodo dragon species profile",
      publisher: "Smithsonian's National Zoo and Conservation Biology Institute",
      url: "https://nationalzoo.si.edu/animals/komodo-dragon",
    },
    {
      label: "Komodo National Park",
      publisher: "UNESCO World Heritage Centre",
      url: "https://whc.unesco.org/en/list/609/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default komodoDragon;
