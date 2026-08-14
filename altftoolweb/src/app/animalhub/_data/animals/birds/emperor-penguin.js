// Emperor penguin — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const emperorPenguin = {
  slug: "emperor-penguin",
  category: "birds",
  name: "Emperor Penguin",
  scientificName: "Aptenodytes forsteri",
  otherNames: [],

  summary:
    "The largest penguin and the only bird that breeds through the Antarctic winter, with males incubating a single egg on their feet for two months without eating.",

  heroImage: null,
  gallery: [],

  headline: "The bird that breeds in the Antarctic winter",
  intro: [
    "Every other animal leaves. As the Antarctic autumn closes in and the sea ice spreads, emperor penguins walk inland to their colonies and begin breeding — into the coldest, darkest conditions any bird faces anywhere on Earth.",
    "The reason is timing. A chick needs to be independent when the summer sea ice breaks up and food is easiest to reach. For a bird this large, working backwards from that date puts laying in the depths of winter, and it is the male who bears the cost: he holds the egg on his feet through the polar night, fasting for around four months in temperatures reaching -40°C.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Sphenisciformes",
    family: "Spheniscidae",
    genus: "Aptenodytes",
    species: "Aptenodytes forsteri",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2026,
    populationTrend: "decreasing",
    populationEstimate: "Roughly 250,000 breeding pairs across about 60 colonies",
    note: "Uplisted from Near Threatened to Endangered in April 2026. The species depends on stable fast ice for breeding, and projections of sea-ice loss indicate the population will halve by the 2080s; several colonies have already suffered complete breeding failure when the ice broke up early. It was listed as threatened under the US Endangered Species Act in 2022.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "1.1–1.3 m",
      min: 1.1,
      max: 1.3,
      unit: "m",
      note: "The tallest and heaviest living penguin",
    },
    {
      key: "weight",
      label: "Weight",
      value: "22–45 kg",
      min: 22,
      max: 45,
      unit: "kg",
      note: "Males can lose close to half their body mass while incubating",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "Over 500 m",
      min: 500,
      max: 564,
      unit: "m",
      note: "A recorded dive reached 564 m",
    },
    {
      key: "dive-duration",
      label: "Maximum dive duration",
      value: "Over 20 minutes",
      min: 20,
      max: 32,
      unit: "minutes",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "64–75 days",
      min: 64,
      max: 75,
      unit: "days",
      note: "Carried out entirely by the male",
    },
    {
      key: "male-fast",
      label: "Male breeding fast",
      value: "Around 110–120 days",
      min: 110,
      max: 120,
      unit: "days",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1 egg",
      min: 1,
      max: 1,
      unit: "eggs",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–6 years",
      min: 4,
      max: 6,
      unit: "years",
    },
    {
      key: "pod-size",
      label: "Colony size",
      value: "Several hundred to over 20,000 birds",
      min: 300,
      max: 25000,
      unit: "individuals",
      note: "Incubating males huddle at roughly ten birds per square metre",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 20 years",
      min: 15,
      max: 20,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — fish, krill and squid", icon: "Fish" },
    { key: "social-structure", label: "Social structure", value: "Dense breeding colonies", icon: "Users" },
    { key: "flight", label: "Flight", value: "Flightless; wings are flippers", icon: "Waves" },
    { key: "nest-type", label: "Nest type", value: "None — the egg rests on the feet under a fold of skin", icon: "Egg" },
    { key: "ocean-range", label: "Ocean range", value: "Southern Ocean, around the Antarctic coast", icon: "Waves" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "breeding-season", label: "Breeding season", value: "Antarctic winter", icon: "Snowflake" },
  ],

  highlights: ["height", "dive-depth", "male-fast", "breeding-season"],

  distribution: {
    continents: ["Antarctica"],
    regions: ["Coastal Antarctica and surrounding sea ice"],
    habitats: ["Fast ice", "Pack ice", "Southern Ocean"],
    elevation: "Sea level",
    note: "Colonies form on stable fast ice attached to the continent or to grounded icebergs. A small number of colonies have been recorded breeding on ice shelves, which may offer some resilience as sea ice becomes less reliable.",
  },

  sections: [
    {
      id: "breeding",
      title: "Breeding through the winter",
      body: [
        "Adults arrive at the colony in March and April, walking or tobogganing as much as 50 to 100 km inland across the sea ice. After courtship, the female lays a single egg in May or June and transfers it to the male's feet — a delicate handover, because an egg left on the ice for more than a minute or two will freeze.",
        "The female then returns to the sea to feed, leaving the male to incubate for around two months in complete darkness. He does not eat for the entire period, having already fasted through courtship, and may lose close to half his body weight before she returns with food for the newly hatched chick.",
        "The chick is brooded on the parents' feet under a fold of skin until it can regulate its own temperature. Both parents then alternate foraging trips, and the chick joins a crèche with others while they are away.",
      ],
    },
    {
      id: "huddle",
      title: "The huddle",
      body: [
        "Incubating males survive the winter by huddling. Several thousand birds pack together at densities of roughly ten per square metre, and the huddle moves constantly: birds on the exposed windward edge shuffle along the flanks and into the warm interior, so that over time nearly every individual spends time inside.",
        "Temperatures at the centre can rise above 20°C while it is -40°C outside. Studies of huddle movement have found it travels in slow waves, individual small steps propagating through the group, which redistributes position without breaking the structure.",
        "The cooperation is not deliberate altruism — each bird is moving to get warm — but the effect is a shared thermal system that no individual could produce alone, and without it winter incubation would be impossible.",
      ],
    },
    {
      id: "diving",
      title: "Diving and feeding",
      body: [
        "Emperors are the deepest-diving of all birds, regularly working below 100 m and recorded beyond 500 m, with dives lasting over twenty minutes. They hunt fish, krill and squid, often against the underside of the ice.",
        "The physiology is extreme. They carry high concentrations of oxygen-binding proteins in their blood and muscle, slow the heart dramatically during a dive, and shut down circulation to non-essential tissue. Solid bones — unusual for a bird — reduce buoyancy, and dense, tightly overlapping feathers over a thick fat layer provide insulation in water near freezing point.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "The emperor penguin's problem is that its entire breeding cycle is built on sea ice that stays fast for eight to nine months of the year. If the ice breaks up before chicks have grown waterproof adult feathers, they drown or freeze.",
        "This has already happened. Several colonies in the Bellingshausen Sea region experienced total breeding failure after early sea-ice loss in 2022, and the Halley Bay colony — once among the largest — largely collapsed after repeated ice failures from 2016.",
        "Because the threat is climate-driven rather than local, protection of individual sites cannot address it directly. Conservation attention has focused on monitoring colonies by satellite and restricting fisheries in the Southern Ocean. The species was listed as threatened under the US Endangered Species Act in 2022, and in April 2026 the IUCN uplisted it from Near Threatened to Endangered, citing projections that the population will halve by the 2080s.",
      ],
    },
  ],

  related: ["peregrine-falcon"],
  tags: ["antarctica", "flightless", "seabird", "cold adaptation", "climate change"],
  searchTerms: ["penguin", "aptenodytes", "antarctic penguin", "largest penguin"],

  faqs: [
    {
      q: "Why do emperor penguins breed in winter?",
      a: "So that the chick reaches independence in summer, when the sea ice breaks up and food is closest and most abundant. Emperor chicks take a long time to raise because the birds are so large, and working backwards from that summer deadline places egg-laying in the middle of the Antarctic winter.",
    },
    {
      q: "Do male emperor penguins really not eat for months?",
      a: "Yes. The male fasts through courtship and the roughly two-month incubation, a total of around four months, while balancing the egg on his feet. He can lose close to half his body mass before the female returns from the sea to take over feeding the chick.",
    },
    {
      q: "How deep can an emperor penguin dive?",
      a: "Deeper than any other bird. Dives beyond 500 m have been recorded, with a maximum of 564 m, and they can stay submerged for over twenty minutes. They manage it with high oxygen storage in blood and muscle, a sharply slowed heart rate, and solid bones that reduce buoyancy.",
    },
    {
      q: "How do emperor penguins survive -40°C?",
      a: "By huddling. Thousands of birds pack together and rotate slowly through the group, so no individual stays on the cold windward edge for long. Inside the huddle it can be over 20°C. That is combined with dense overlapping feathers, a thick fat layer, and circulation that limits heat loss through the feet and flippers.",
    },
    {
      q: "Why are emperor penguins endangered?",
      a: "Their whole breeding cycle depends on sea ice remaining stable for eight to nine months. When it breaks up early, chicks that have not yet grown waterproof adult feathers do not survive — this caused complete breeding failure at several colonies in 2022 and the near-collapse of the Halley Bay colony after 2016. In April 2026 the IUCN uplisted the species from Near Threatened to Endangered, citing projections that the population will halve by the 2080s.",
    },
  ],

  seo: {
    title: "Emperor Penguin — Winter Breeding, Diving & Antarctic Survival",
    description:
      "A researched profile of the emperor penguin (Aptenodytes forsteri): winter breeding on Antarctic sea ice, the male's four-month fast, record dives beyond 500 m, and the threat of sea-ice loss.",
    keywords: [
      "emperor penguin facts",
      "aptenodytes forsteri",
      "antarctic penguin",
      "penguin huddle",
      "largest penguin",
    ],
  },

  sources: [
    {
      label: "Emperor penguin uplisted to Endangered (April 2026)",
      publisher: "IUCN",
      url: "https://iucn.org/press-release/202604/emperor-penguin-and-antarctic-fur-seal-now-endangered-due-climate-change-iucn",
    },
    {
      label: "Emperor Penguin now Endangered due to climate change",
      publisher: "BirdLife International",
      url: "https://www.birdlife.org/news/2026/04/09/emperor-penguin-now-endangered-due-to-climate-change/",
    },
    {
      label: "Emperor penguin research and colony monitoring",
      publisher: "British Antarctic Survey",
      url: "https://www.bas.ac.uk/about/antarctica/wildlife/penguins/emperor-penguin/",
    },
    {
      label: "Emperor penguin listing under the Endangered Species Act",
      publisher: "U.S. Fish and Wildlife Service",
      url: "https://www.fws.gov/species/emperor-penguin-aptenodytes-forsteri",
    },
  ],

  updatedAt: "2026-07-29",
};

export default emperorPenguin;
