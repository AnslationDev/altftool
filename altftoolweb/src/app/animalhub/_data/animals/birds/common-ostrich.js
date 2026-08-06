// Common ostrich — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const commonOstrich = {
  slug: "common-ostrich",
  category: "birds",
  name: "Common Ostrich",
  scientificName: "Struthio camelus",
  otherNames: ["Ostrich", "African ostrich"],

  summary:
    "The tallest and heaviest bird alive, flightless but fast enough to outrun a horse, and the only bird in the world with two toes on each foot.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Struthio_camelus_-_Etosha_2014_%283%29.jpg",
    alt: "A common ostrich standing on open ground, long bare neck and legs with a bulky feathered body",
    credit: "Yathin S Krishnappa / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Common_Ostrich_%28Struthio_camelus%29_female_..._%2851584626132%29.jpg/1920px-Common_Ostrich_%28Struthio_camelus%29_female_..._%2851584626132%29.jpg",
      alt: "A female common ostrich in grey-brown plumage in Addo Elephant National Park, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "The sex that sits by day",
      caption:
        "Females are dull grey-brown, males black and white. That difference is a division of labour: the drab female incubates through daylight, the male takes the night shift, and each is hardest to see when it is on the nest.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Common_Ostrich_%28Struthio_camelus%29_female_..._%2851586365740%29.jpg/1920px-Common_Ostrich_%28Struthio_camelus%29_female_..._%2851586365740%29.jpg",
      alt: "A female ostrich walking across open grassland with its long neck raised",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Eyes above the grass",
      caption:
        "A two-metre bird carrying 50 mm eyes — the largest of any land vertebrate — is essentially a mobile watchtower. Zebra and antelope routinely graze near ostriches and react to their alarm.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Common_Ostrich_%28Struthio_camelus%29_male_changing_part_of_its_juvenile_feathers_for_an_adult_%22costume%22_..._%2831445587547%29.jpg/1920px-Common_Ostrich_%28Struthio_camelus%29_male_changing_part_of_its_juvenile_feathers_for_an_adult_%22costume%22_..._%2831445587547%29.jpg",
      alt: "A young male ostrich part way through moulting into adult black-and-white plumage, De Hoop Reserve, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Growing into the black",
      caption:
        "Males take three to four years to acquire full adult plumage, and the transition is patchy. The loose, unzipped feather structure that makes ostrich plumes so soft also means they give no lift at all.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Common_Ostrich_Struthio_camelus_at_tourist_farm%2C_Curacao_0162.jpg/1920px-Common_Ostrich_Struthio_camelus_at_tourist_farm%2C_Curacao_0162.jpg",
      alt: "A common ostrich photographed close up at a farm on Curaçao, showing the head, bill and eye",
      credit: "ImagePerson / Wikimedia Commons",
      title: "Farmed on every continent",
      caption:
        "The Victorian feather trade turned the ostrich into a livestock animal, and farms now exist far outside Africa. Escaped and released farm birds are the source of most free-living ostriches outside their native range.",
    },
  ],

  headline: "The bird that gave up flying to run",
  intro: [
    "An adult male ostrich stands up to 2.75 m tall and weighs as much as an adult human and a half. It cannot fly, and no amount of wing area would help — but it can sprint at over 70 km/h on two toes, covering up to five metres in a single stride, and hold around 50 km/h long after a horse would have stopped.",
    "Almost everything about the bird is a consequence of that trade. The wings became rudders, sunshades and courtship banners; the legs became the most powerful in the bird world; and the eyes grew to 50 mm across, larger than those of any other land animal, because seeing a predator early is what makes running useful.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Struthioniformes",
    family: "Struthionidae",
    genus: "Struthio",
    species: "Struthio camelus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate:
      "No reliable global figure; still widespread in eastern and southern Africa, while the North African population is down to the low thousands",
    note: "Least Concern because of an enormous range rather than because the species is secure everywhere. The picture varies sharply by subspecies: the North African or red-necked ostrich has been reduced to scattered remnants across the Sahel and is the subject of reintroduction programmes, and the Arabian ostrich was hunted to extinction by the middle of the twentieth century. The Somali ostrich was recognised as a separate species in 2014 and is assessed as Vulnerable in its own right.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "1.75–2.75 m",
      min: 1.75,
      max: 2.75,
      unit: "m",
      note: "Males 2.1–2.75 m, females 1.75–1.9 m — the tallest living bird",
    },
    {
      key: "weight",
      label: "Weight",
      value: "90–130 kg",
      min: 90,
      max: 130,
      unit: "kg",
      note: "Exceptional males have been recorded above 150 kg",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "About 2 m",
      note: "Nowhere near enough to lift the bird; the wings work as rudders in a turn, as sunshades over chicks, and as display flags",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Over 70 km/h",
      min: 50,
      max: 70,
      unit: "km/h",
      note: "Cruises at around 50 km/h and can sustain it for long distances",
    },
    {
      key: "stride-length",
      label: "Stride length",
      value: "3–5 m",
      min: 3,
      max: 5,
      unit: "m",
    },
    {
      key: "egg-weight",
      label: "Egg weight",
      value: "About 1.4 kg",
      note: "Roughly 15 cm long and 13 cm wide — the largest egg of any living bird, and the smallest relative to the size of the parent",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "Around 20 eggs in a shared nest",
      min: 20,
      max: 50,
      unit: "eggs",
      note: "Several hens lay into one scrape; nests of 50 or more have been recorded",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "42–46 days",
      min: 42,
      max: 46,
      unit: "days",
      note: "The female sits by day, the male at night",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "30–40 years in the wild",
      min: 30,
      max: 40,
      unit: "years",
      note: "A captive bird reached 62 years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore — mostly seeds, shoots and leaves, with insects and small lizards", icon: "Leaf" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "flight", label: "Flight", value: "Flightless — wings used for balance, shade and display", icon: "Feather" },
    { key: "nest-type", label: "Nest type", value: "A communal scrape in bare ground", icon: "Egg" },
    { key: "social-structure", label: "Social structure", value: "Small flocks; larger aggregations at water and on good grazing", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Grazer and seed disperser; a sentinel species for other grazers", icon: "Sprout" },
  ],

  highlights: ["height", "top-speed", "weight", "egg-weight"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Sahel",
      "East Africa",
      "Southern Africa",
    ],
    habitats: [
      "Savanna",
      "Open woodland",
      "Semi-desert",
      "Short grassland",
    ],
    elevation: "Lowland plains up to high plateau grassland",
    note: "Native to open country north and south of the equatorial forest belt. The northern populations have contracted severely — the species is gone from most of its Saharan and Sahelian range — while it remains common in eastern and southern African savanna, including inside large protected areas. Free-living birds also exist outside Africa, almost all descended from escaped farm stock.",
  },

  sections: [
    {
      id: "running",
      title: "Built to run",
      body: [
        "The ostrich foot has two toes, which no other bird has. The inner toe is large and carries a heavy nail; the outer is smaller and does little of the work. Reducing the contact area lowers the mass that has to be swung at the end of each stride, and the leg above it has been simplified in the same direction — the muscle is concentrated at the hip, the lower limb is tendon and bone.",
        "The result is efficiency rather than raw power. The long Achilles-like tendons store and return elastic energy each step, so an ostrich uses substantially less energy per kilometre than a running animal of similar size. That is why the interesting number is not the 70 km/h sprint but the 50 km/h it can hold for many minutes.",
        "The wings are still doing work. Held out in a sprint they act as air brakes and rudders, letting a bird change direction without losing footing — a manoeuvre that decides most chases against big cats.",
        "A cornered ostrich does not run. It kicks forward, and with a claw on a leg that heavy it can seriously injure a lion, or a person. Fatal kicks are rare but documented.",
      ],
    },
    {
      id: "feeding",
      title: "Feeding without teeth or much water",
      body: [
        "Ostriches eat mainly plants — seeds, shoots, succulent leaves, flowers and fruit — with insects and the occasional small lizard taken opportunistically. Having no teeth, they swallow pebbles and grit that grind the food in the gizzard, and an adult may carry a kilogram of stones in there at any time.",
        "They can go for long periods without drinking, taking most of their water from the plants they eat, and they tolerate a body temperature that swings by several degrees across a desert day rather than spending water on cooling. When water is available they drink heavily and will bathe.",
        "The long neck and huge eyes make an ostrich an unusually good early-warning system, and other grazers exploit it. Zebra, wildebeest and antelope regularly feed alongside ostriches, and the mixed group detects predators earlier than any of the species would alone.",
      ],
    },
    {
      id: "breeding",
      title: "The shared nest",
      body: [
        "A territorial male scrapes a shallow hollow in bare ground and displays to attract a dominant, or 'major', hen. She lays into the scrape — and so do several minor hens, who then leave. The result is a communal clutch of around twenty eggs, sometimes more than fifty.",
        "Only the major hen and the male incubate. She can recognise her own eggs among the others and rolls them into the centre of the nest, where survival is best, pushing surplus eggs to the rim where they may be lost. Incubation takes 42 to 46 days and is split by daylight: the grey-brown female sits by day, the black male by night, each colour matched to the light it sits in.",
        "Chicks are precocial and can walk within a day. Broods frequently merge, and a single pair may end up escorting fifty or more youngsters of mixed parentage, defending them from jackals and raptors with wings spread. Mortality is nonetheless heavy — most chicks do not reach their first year.",
      ],
    },
    {
      id: "people",
      title: "Feathers, farms and one persistent myth",
      body: [
        "Ostriches were domesticated for their plumes rather than their meat. The Victorian feather boom made ostrich farming a major industry in South Africa's Little Karoo, collapsed abruptly around 1914 when fashion changed, and left behind a farmed population that has since spread worldwide for leather, meat and eggs.",
        "Wild numbers went the other way. Hunting for feathers and skins, egg collection and the loss of open grazing land emptied the Sahara and most of the Sahel. The Arabian subspecies was gone by around 1966, and the North African red-necked ostrich now survives in fragments, with reintroductions from captive stock under way in several countries.",
        "The bird does not bury its head in the sand. What it does is lower its head and neck flat to the ground when it senses danger at a distance — from far off, against dusty terrain, the body reads as a bush and the neck disappears. The behaviour is real; the interpretation is two thousand years old and wrong.",
      ],
    },
  ],

  related: ["bald-eagle", "snowy-owl", "emperor-penguin"],
  tags: ["flightless", "africa", "savanna", "largest bird", "ratite"],
  searchTerms: ["ostrich", "struthio", "biggest bird", "fastest bird on land", "two toes"],

  faqs: [
    {
      q: "How fast can an ostrich run?",
      a: "Sprints of over 70 km/h have been recorded, making it the fastest bird on land and faster than any other two-legged animal. More telling is the cruising pace: an ostrich can hold around 50 km/h for long distances, covering three to five metres per stride, which is why a horse cannot run one down.",
    },
    {
      q: "Why can't ostriches fly?",
      a: "They are far too heavy, and their feathers are the wrong shape. Ostrich plumes lack the interlocking barbules that make a flight feather into an airtight surface, so they are soft rather than stiff and generate no lift. The wings have been repurposed: they steer the bird in a fast turn, shade chicks, and are spread in display.",
    },
    {
      q: "Do ostriches bury their heads in the sand?",
      a: "No. The myth probably comes from a real behaviour — a threatened ostrich, particularly one sitting on a nest, presses its head and neck flat against the ground, and at a distance the neck becomes almost invisible against the soil. They also turn eggs with their beaks in the nest scrape, which from far away looks like burying the head.",
    },
    {
      q: "How big is an ostrich egg?",
      a: "About 15 cm long, 13 cm wide and 1.4 kg — the largest egg laid by any living bird, equivalent to roughly two dozen chicken eggs. Relative to the size of the parent, though, it is the smallest egg of any bird.",
    },
    {
      q: "Are ostriches endangered?",
      a: "The common ostrich as a whole is listed as Least Concern, though the population is decreasing. That headline hides a split picture: the species is still common in eastern and southern Africa but has been all but eliminated from North Africa and the Sahel, where the red-necked subspecies survives only in fragments. The closely related Somali ostrich, treated as a separate species since 2014, is assessed as Vulnerable.",
    },
  ],

  seo: {
    title: "Common Ostrich — Size, Speed, Eggs & Conservation",
    description:
      "A researched profile of the common ostrich (Struthio camelus): the tallest and heaviest living bird, 70 km/h sprints on two toes, communal nests, 1.4 kg eggs, and the collapse of its North African populations.",
    keywords: [
      "ostrich facts",
      "struthio camelus",
      "largest bird in the world",
      "how fast can an ostrich run",
      "ostrich egg size",
    ],
  },

  sources: [
    {
      label: "Struthio camelus — Red List assessment (2018)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/45020636/132189458",
    },
    {
      label: "Common Ostrich species factsheet",
      publisher: "BirdLife International, DataZone",
      url: "https://datazone.birdlife.org/species/factsheet/common-ostrich-struthio-camelus",
    },
    {
      label: "North African ostrich — status and reintroduction",
      publisher: "Sahara Conservation",
      url: "https://saharaconservation.org/sahel-and-sahara-fauna/north-african-ostrich/",
    },
    {
      label: "Struthio camelus account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Struthio_camelus/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default commonOstrich;
