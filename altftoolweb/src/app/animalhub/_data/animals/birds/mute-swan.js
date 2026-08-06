// Mute swan — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const muteSwan = {
  slug: "mute-swan",
  category: "birds",
  name: "Mute Swan",
  scientificName: "Cygnus olor",
  otherNames: ["Cob (male)", "Pen (female)"],

  summary:
    "Among the heaviest flying birds in the world, a native Eurasian waterbird protected by the English Crown for eight centuries — and an invasive species under active control in North America.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/CygneVaires.jpg/1920px-CygneVaires.jpg",
    alt: "A mute swan on water with its neck held in an S-curve, showing the orange bill with a black basal knob",
    credit: "Sanchezn / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/2017-03-31_AT_Wien_02_Leopoldstadt%2C_Donau_%40_Brigittenauer_Br%C3%BCcke%2C_Cygnus_olor_%2851628642079%29.jpg/1920px-2017-03-31_AT_Wien_02_Leopoldstadt%2C_Donau_%40_Brigittenauer_Br%C3%BCcke%2C_Cygnus_olor_%2851628642079%29.jpg",
      alt: "A mute swan on the Danube in Vienna, white plumage and orange bill clearly visible against dark water",
      credit: "Paul Korecky / Wikimedia Commons",
      title: "Native water, native bird",
      caption:
        "The Danube runs through the centre of the mute swan's natural range. Across Europe and western Asia this is an indigenous species with a long history of semi-domestication, which is exactly why its status elsewhere is so contested.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/2017-03-31_AT_Wien_02_Leopoldstadt%2C_Donau_%40_Brigittenauer_Br%C3%BCcke%2C_Cygnus_olor_%2851631825820%29.jpg/1920px-2017-03-31_AT_Wien_02_Leopoldstadt%2C_Donau_%40_Brigittenauer_Br%C3%BCcke%2C_Cygnus_olor_%2851631825820%29.jpg",
      alt: "A mute swan swimming with its wings slightly raised over its back",
      credit: "Paul Korecky / Wikimedia Commons",
      title: "The busking display",
      caption:
        "Wings arched over the back and neck drawn in is a threat posture, not a decorative one. A breeding cob will hold it while advancing on an intruder, and mute swans are aggressive enough to drive other waterbirds off a whole stretch of water.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/2017-03-31_AT_Wien_20_Brigittenau%2C_Donau_%40_Brigittenauer_Br%C3%BCcke%2C_Cygnus_olor_%2851625771403%29.jpg/1920px-2017-03-31_AT_Wien_20_Brigittenau%2C_Donau_%40_Brigittenauer_Br%C3%BCcke%2C_Cygnus_olor_%2851625771403%29.jpg",
      alt: "A mute swan feeding at the water's surface on the Danube in Vienna",
      credit: "Paul Korecky / Wikimedia Commons",
      title: "A long neck instead of a dive",
      caption:
        "Mute swans feed by upending and reaching down with that very long neck, taking submerged plants from depths shallower divers cannot reach. Where they are introduced, that grazing reach is precisely what makes them ecologically damaging.",
    },
  ],

  headline: "Native icon in Europe, invasive problem in America",
  intro: [
    "The mute swan is one of the heaviest birds capable of flight. Males average around 11 kg and reach 14 kg or more, and one exceptional Polish cob weighed almost 23 kg — the heaviest flying bird ever documented. The wingspan runs to 2.4 m, and getting a body that size airborne takes a long running take-off across open water.",
    "Its identity depends entirely on where you are standing. Across Europe and western Asia it is a native species with centuries of legal protection behind it; in England the Crown has claimed ownership of unmarked mute swans on open water since the twelfth century. In North America it is an introduced bird, descended from ornamental stock released or escaped from estates, and it is managed as invasive.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Anseriformes",
    family: "Anatidae",
    genus: "Cygnus",
    species: "Cygnus olor",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2025,
    populationTrend: "increasing",
    populationEstimate:
      "About 500,000 birds in the native range at the end of the breeding season, up to 350,000 of them in Russia",
    note: "Least Concern and increasing. The conservation picture is unusual because the species is simultaneously protected and controlled: native and legally safeguarded across Europe, and treated as an invasive species in North America, where the US Fish and Wildlife Service proposed in 2003 to cut Atlantic Flyway numbers to pre-1986 levels — a 67% reduction. Smaller introduced populations exist in Japan, New Zealand, Australia and South Africa.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "140–160 cm",
      min: 125,
      max: 170,
      unit: "cm",
      note: "Extremes run from about 125 to 170 cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "200–240 cm",
      min: 200,
      max: 240,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males 9.2–14.3 kg, females 7.6–10.6 kg",
      min: 7.6,
      max: 14.3,
      unit: "kg",
      note: "Males average 10.6–11.9 kg and females 8.5–9.7 kg. One unusually large Polish cob weighed almost 23 kg, the heaviest flying bird ever documented.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "5–8 eggs",
      min: 5,
      max: 8,
      unit: "eggs",
      note: "Eggs are 9–12.2 cm long — among the largest laid by any flying bird",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 36 days",
      min: 34,
      max: 38,
      unit: "days",
      note: "Hatching is normally between May and July",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "120–150 days",
      min: 120,
      max: 150,
      unit: "days",
      note: "Cygnets stay with their parents through their first autumn",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "26–40 years recorded",
      min: 26,
      max: 40,
      unit: "years",
      note: "A swan ringed in northern Germany in 1970 was found dead in Denmark in 2009, slightly over 40 years old. The North American banding record is 26 years and 9 months.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Mostly herbivorous — submerged aquatic plants, plus some grain and small invertebrates", icon: "Leaf" },
    { key: "activity", label: "Activity", value: "Diurnal, with some feeding at night", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "A large mound of reeds and vegetation at the water's edge", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Strongly territorial pairs in the breeding season; flocks outside it", icon: "Users" },
    { key: "water-type", label: "Water type", value: "Fresh and brackish shallows; coastal bays in winter", icon: "Droplets" },
  ],

  highlights: ["wingspan", "weight", "clutch-size", "diet-type"],

  distribution: {
    continents: ["Asia", "Europe", "North America", "Australia", "Africa"],
    regions: [
      "Western and central Europe",
      "Russia and Central Asia east to Primorsky Krai",
      "Introduced: eastern North America and the Great Lakes",
      "Introduced: Japan, New Zealand, Australia and South Africa",
    ],
    habitats: [
      "Lowland lakes and ponds",
      "Slow rivers",
      "Reedbeds and marshes",
      "Sheltered coastal bays and estuaries",
      "Urban parks and canals",
    ],
    elevation: "Lowland — shallow standing and slow-moving water",
    note: "Naturally distributed from western Europe across to Primorsky Krai in the Russian Far East, and a rare winter visitor to the far north of Africa. Everything outside that is introduced: eastern North America and the Great Lakes hold the largest such population, with smaller ones of roughly 200 birds in Japan, under 200 across New Zealand and Australia, and about 120 in South Africa.",
  },

  sections: [
    {
      id: "not-mute",
      title: "It is not actually mute",
      body: [
        "The name is a comparison, not a description. Mute swans are quieter than whooper and Bewick's swans, whose bugling calls carry for kilometres, but they are far from silent. They hiss explosively when threatened, snort, grunt, and give a muffled trumpeting note in territorial disputes. Mates greet each other with a short snoring sound.",
        "The sound most associated with the bird is not vocal at all. A flying mute swan produces a rhythmic low thrumming from the wingbeats themselves, audible more than 200 m away — a sound the other European swans do not make, and one of the easiest ways to identify the species without seeing it.",
      ],
    },
    {
      id: "size",
      title: "Near the limit of powered flight",
      body: [
        "At an average of 10 to 12 kg for males, the mute swan sits close to the practical ceiling for a flying bird. It cannot spring into the air: take-off needs a long run across open water, feet slapping the surface, which is why the species needs sizeable stretches of water and why frozen or narrow habitat traps it.",
        "The record is remarkable. An exceptionally large Polish cob weighed almost 23 kg, the heaviest flying bird ever documented — heavier than the great bustards and kori bustards usually cited for that title, though those species have far higher typical weights.",
        "The eggs match the bird. At 9 to 12.2 cm long they are among the largest laid by any flying bird, and a clutch of five to eight of them represents an enormous investment for one season.",
      ],
    },
    {
      id: "swan-upping",
      title: "Swans and the Crown",
      body: [
        "In England the Crown has claimed the right to own all unmarked mute swans on open water since at least the twelfth century, when swans were valuable as food for feasts and ownership was worth asserting. Rights to marked birds were granted to a limited number of institutions.",
        "That claim survives as Swan Upping, an annual ceremony on the River Thames in which mute swans and their cygnets are rounded up, weighed, checked for injuries, ringed and released. Ownership follows parentage: cygnets of birds belonging to the Vintners' and Dyers' livery companies are ringed accordingly, while Crown birds are left unmarked.",
        "What began as a property census now functions as a health and population survey, and it is one of the longest-running wildlife monitoring exercises anywhere. The British population is substantial — around 22,000 birds were counted in the winter of 2006–07.",
      ],
    },
    {
      id: "invasive",
      title: "The North American problem",
      body: [
        "Mute swans were brought to North America in the nineteenth century as ornamental birds for estates and parks, and they got out. The Chesapeake Bay breeding population is traced to five birds that escaped from estates on the Miles River in Maryland during a storm in 1962. Their descendants numbered around 400 by the 1980s and were in the thousands by the late 1990s. Across the Atlantic Flyway as a whole the population grew at an average of at least 10% a year between 1971 and 2000.",
        "Two things make them damaging. The first is grazing. A mute swan eats several kilograms of submerged aquatic vegetation a day and uproots more than it swallows, paddling and raking the bottom; an estimate for the Chesapeake put 4,000 swans as capable of consuming 12% of the bay's aquatic vegetation annually. That vegetation is nursery habitat for fish and food for native waterfowl.",
        "The second is aggression. Breeding pairs drive native waterbirds off nesting and feeding areas and sometimes kill them, and large flocks have displaced state-threatened terns and skimmers from island nest sites.",
        "Control is contentious. The US Fish and Wildlife Service proposed in 2003 to reduce Atlantic Flyway numbers to pre-1986 levels, a 67% cut, and state programmes have used egg addling and culling since. The birds are conspicuous, beautiful and widely loved by the public, which makes lethal control politically difficult in a way that few other invasive species management programmes face.",
      ],
    },
  ],

  related: ["greater-flamingo", "emperor-penguin", "common-raven", "bald-eagle"],
  tags: ["waterfowl", "invasive species", "europe", "wetlands", "heaviest flying bird"],
  searchTerms: ["swan", "cygnus", "cob", "pen", "cygnet", "swan upping"],

  faqs: [
    {
      q: "Are mute swans really mute?",
      a: "No. They are quieter than whooper or Bewick's swans, which is where the name comes from, but they hiss loudly, snort, grunt and give a muffled trumpeting call. They also produce a distinctive rhythmic thrumming with their wings in flight, audible from more than 200 m — a sound no other European swan makes.",
    },
    {
      q: "Are mute swans native to North America?",
      a: "No. They are native to Europe and western Asia, as far east as the Russian Far East. North American birds descend from ornamental swans imported in the nineteenth century that escaped or were released — the Chesapeake Bay population traces to five birds that got loose from Maryland estates during a storm in 1962. They are managed as an invasive species.",
    },
    {
      q: "Why are mute swans considered invasive?",
      a: "Because of grazing pressure and aggression. They eat and uproot large volumes of submerged aquatic vegetation — an estimate for the Chesapeake Bay put 4,000 swans as capable of taking 12% of the bay's aquatic plants a year — which removes fish nursery habitat and food for native waterfowl. Breeding pairs also drive native waterbirds off nesting sites and sometimes kill them, and have displaced threatened terns and skimmers from island colonies.",
    },
    {
      q: "Is the mute swan the heaviest flying bird?",
      a: "It holds the individual record. An exceptionally large Polish male weighed almost 23 kg, the heaviest flying bird ever documented. Typical mute swan males are lighter, at 9 to 14 kg, so on average weights the great bustard and kori bustard are comparable contenders for heaviest flying bird.",
    },
    {
      q: "Does the King own all the swans in England?",
      a: "The Crown has claimed ownership of unmarked mute swans on open water since at least the twelfth century, and that claim is still exercised on the River Thames through the annual Swan Upping ceremony. In practice it now functions as a population and health survey: birds are caught, weighed, checked and released, with cygnets of Vintners' and Dyers' swans ringed and Crown birds left unmarked.",
    },
    {
      q: "How long do mute swans live?",
      a: "Documented longevity records run from about 27 to just over 40 years. A swan ringed in northern Germany in 1970 was found dead in Denmark in 2009 at slightly over 40, and the North American banding record is 26 years and 9 months. Most wild birds die well before that, largely from collisions with power lines and from lead poisoning.",
    },
  ],

  seo: {
    title: "Mute Swan — Size, Native Range & Invasive Status",
    description:
      "A researched profile of the mute swan (Cygnus olor): a 2.4 m wingspan and near-23 kg record weight, the Swan Upping tradition, and why a native European bird is controlled as invasive in North America.",
    keywords: [
      "mute swan facts",
      "cygnus olor",
      "mute swan invasive",
      "heaviest flying bird",
      "swan upping",
    ],
  },

  sources: [
    {
      label: "Cygnus olor — Red List assessment (2025)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22679839/281844289",
    },
    {
      label: "Mute Swan species factsheet",
      publisher: "BirdLife International DataZone",
      url: "https://datazone.birdlife.org/species/factsheet/mute-swan-cygnus-olor",
    },
    {
      label: "Mute Swan Management Plan for Maryland",
      publisher: "Maryland Department of Natural Resources",
      url: "https://dnr.maryland.gov/wildlife/documents/2011_musw_mdmgtplan.pdf",
    },
    {
      label: "Swan Upping",
      publisher: "The Royal Family",
      url: "https://www.royal.uk/swans",
    },
  ],

  updatedAt: "2026-07-29",
};

export default muteSwan;
