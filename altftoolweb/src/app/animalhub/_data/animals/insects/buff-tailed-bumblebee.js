// Buff-tailed bumblebee — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const buffTailedBumblebee = {
  slug: "buff-tailed-bumblebee",
  category: "insects",
  name: "Buff-Tailed Bumblebee",
  scientificName: "Bombus terrestris",
  otherNames: ["Large earth bumblebee", "Buff-tailed humble-bee"],

  summary:
    "Europe's commonest bumblebee: a cold-weather forager that warms its own flight muscles, shakes pollen out of flowers with a burst of vibration, and is bred by the million for greenhouse tomatoes.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Bombus_terrestris.jpg/1920px-Bombus_terrestris.jpg",
    alt: "A buff-tailed bumblebee on a flower, black body with two yellow bands and a pale tail",
    credit: "Marco Almbauer / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Buff-tailed_bumblebee_%28Bombus_terrestris%29_2.jpg/1920px-Buff-tailed_bumblebee_%28Bombus_terrestris%29_2.jpg",
      alt: "A buff-tailed bumblebee feeding at a flower, dense hair covering the thorax and abdomen",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "Insulated for cold work",
      caption:
        "The coat is not decoration. Dense hair holds the heat a bumblebee generates by shivering its flight muscles, which is what lets it forage on mornings too cold for honeybees to leave the hive.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Buff-tailed_bumblebee_%28Bombus_terrestris%29%2C_Sandy%2C_Bedfordshire_%2816719418776%29.jpg/1920px-Buff-tailed_bumblebee_%28Bombus_terrestris%29%2C_Sandy%2C_Bedfordshire_%2816719418776%29.jpg",
      alt: "A large buff-tailed bumblebee queen foraging on an early spring flower",
      credit: "Orangeaurochs from Sandy, Bedfordshire, United Kingdom / Wikimedia Commons",
      title: "The first bee of spring",
      caption:
        "The big bumblebees blundering low over gardens in February are queens: mated the previous autumn, they have overwintered underground and are searching for a nest site, usually an abandoned rodent burrow.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Buff-tailed_bumblebee_%28Bombus_terrestris%29_mating_pair_%2850093276238%29.jpg/1920px-Buff-tailed_bumblebee_%28Bombus_terrestris%29_mating_pair_%2850093276238%29.jpg",
      alt: "A mating pair of buff-tailed bumblebees, the male attached to the larger female",
      credit: "Lukas Large from Stourbridge, United Kingdom / Wikimedia Commons",
      title: "The end of the colony's year",
      caption:
        "New queens and males are produced only at the end of the nesting cycle. The males die, the old colony collapses, and everything that survives the winter is a mated queen sitting alone in the soil.",
    },
  ],

  headline: "An annual colony, and a global export",
  intro: [
    "The buff-tailed bumblebee is the bee most people in northern Europe see first each year — a large queen flying heavily and low over gardens in late winter, looking for a hole in the ground. It is the commonest and most adaptable bumblebee across most of its range, short-tongued, catholic in its tastes, and able to work in weather that grounds most other pollinators.",
    "It is also the most commercially significant wild bee in the world. Since 1987 it has been reared in factories for greenhouse pollination, and something over a million colonies are now traded annually. That trade has moved the species onto continents it never reached on its own, with consequences for the bees already living there.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Hymenoptera",
    family: "Apidae",
    genus: "Bombus",
    species: "Bombus terrestris",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2025,
    populationTrend: "stable",
    populationEstimate:
      "No population figure; among the most abundant bumblebees in Europe and one of the few whose range and numbers are not contracting",
    note: "This is a European regional assessment, published in the 2025 European Red List of Bees, and not a global one — there is no worldwide assessment of this species. The distinction matters twice over. Within Europe the species is genuinely doing well while more than a fifth of European bumblebees are now assessed as threatened, so its status is not representative of its relatives. And outside Europe it is an introduced invasive: in southern South America its spread has coincided with the collapse of the native giant bumblebee Bombus dahlbomii, which the IUCN assessed as Endangered in 2016.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length (queen)",
      value: "20–22 mm",
      min: 20,
      max: 22,
      unit: "mm",
      note: "Workers are 11–17 mm and males 14–16 mm; the size gap between queen and worker is unusually wide",
    },
    {
      key: "colony-size",
      label: "Colony size",
      value: "About 300–400 workers",
      min: 300,
      max: 400,
      unit: "workers",
      note: "Variable; the Bumblebee Conservation Trust gives around 350 for a typical nest",
    },
    {
      key: "colony-duration",
      label: "Nesting period",
      value: "3–4 months",
      min: 3,
      max: 4,
      unit: "months",
      note: "Workers appear about six weeks after the nest is founded; new queens and males come at the very end",
    },
    {
      key: "foraging-range",
      label: "Foraging range",
      value: "Mostly within 5 km of the nest",
      min: 0.5,
      max: 13,
      unit: "km",
      note: "Measured mean foraging distances are often only a few hundred metres, but displaced bees have navigated home from as far as 13 km",
    },
    {
      key: "foraging-temperature",
      label: "Minimum foraging temperature",
      value: "Around 8°C",
      unit: "°C",
      note: "Honeybees generally will not forage below about 16°C; bumblebees pre-warm their flight muscles by shivering",
    },
    {
      key: "lifespan-queen",
      label: "Queen lifespan",
      value: "About a year",
      min: 1,
      max: 1,
      unit: "years",
      note: "Workers live a few weeks; males die shortly after mating, and only mated new queens survive the winter",
    },
    {
      key: "colonies-traded",
      label: "Colonies traded commercially",
      value: "Probably more than 1 million a year",
      unit: "nests/year",
      note: "Reared for greenhouse pollination since 1987, principally for tomatoes",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Nectar and pollen", icon: "Flower" },
    { key: "social-structure", label: "Social structure", value: "Annual colony founded each spring by one queen", icon: "Users" },
    { key: "tongue", label: "Tongue", value: "Short — favours open flowers, and robs deep ones", icon: "Ruler" },
    { key: "buzz-pollination", label: "Buzz pollination", value: "Vibrates flowers to shake pollen from sealed anthers", icon: "Zap" },
    { key: "thermoregulation", label: "Thermoregulation", value: "Shivers its flight muscles to warm up before flying", icon: "Thermometer" },
    { key: "nest-type", label: "Nest", value: "Underground, usually an abandoned rodent burrow", icon: "Home" },
  ],

  highlights: ["colony-size", "foraging-temperature", "buzz-pollination", "body-length"],

  distribution: {
    continents: ["Europe", "Asia", "Africa", "South America", "Oceania"],
    regions: [
      "Almost all of Europe, north to central Scandinavia",
      "North Africa and the Middle East",
      "Temperate and central Asia",
      "Introduced and established in Japan, Chile, Argentina, Tasmania and New Zealand",
    ],
    habitats: [
      "Gardens and parks",
      "Farmland and field margins",
      "Grassland and heath",
      "Woodland edge and hedgerow",
    ],
    elevation: "Sea level to around 2,000 m",
    note: "In Britain the species is found in almost every habitat except high uplands, and in southern England and some northern cities colonies now remain active through the winter, foraging on Mahonia and other winter-flowering garden shrubs rather than hibernating.",
  },

  sections: [
    {
      id: "colony",
      title: "A colony that lasts one summer",
      body: [
        "Unlike a honeybee hive, a bumblebee colony is annual and starts from nothing. A mated queen emerges from underground hibernation in late winter — February in southern Britain — feeds up, and searches at low level for a cavity, most often an abandoned mouse or vole burrow. She builds a small wax pot, provisions it with pollen, lays her first eggs and incubates them with her own body heat.",
        "The first workers appear about six weeks later and take over foraging while the queen switches to laying full time. The colony builds through spring and summer to a few hundred workers — around 350 in a typical nest — and then, at the very end of the three-to-four-month cycle, produces the reproductives: new queens and males.",
        "Then it collapses. The males leave and die after mating, the workers and the old queen die, and the entire year's work reduces to a scatter of mated young queens who dig into the soil and wait out the winter alone. Everything visible in a bumblebee's year descends from those few survivors.",
      ],
    },
    {
      id: "pollination",
      title: "Buzzing, robbing, and a short tongue",
      body: [
        "The buff-tailed bumblebee is short-tongued, which shapes almost all of its foraging. It works open and shallow flowers efficiently and struggles with long tubular ones — and where it cannot reach the nectar legitimately, it bites a hole through the base of the corolla and drinks through that instead. Nectar robbing takes the reward without transferring pollen, and other bees, including honeybees, learn to use the holes once they exist.",
        "Where it excels is buzz pollination. Some plants — tomatoes, potatoes, blueberries and the rest of the nightshade family among them — keep their pollen inside anthers that open only through tiny terminal pores, and shaking it out requires vibration. A bumblebee grips the anther, disconnects its wings from the flight muscles and contracts them rapidly, producing a burst of vibration that fires the pollen out onto her body. Honeybees cannot do this at all.",
        "The other advantage is temperature. A bumblebee can warm its thorax by shivering before take-off and stay warm in flight, insulated by its coat, and will work at air temperatures around 8°C — roughly half what a honeybee generally requires. In a northern spring that is the difference between a crop being pollinated and not.",
      ],
    },
    {
      id: "commerce",
      title: "The tomato trade, and where it went",
      body: [
        "Before 1987, greenhouse tomatoes were pollinated by hand — an electric vibrating wand applied to each truss of flowers, at real labour cost. The discovery that captive-reared Bombus terrestris colonies would do the job better and cheaper created an industry effectively overnight. Colonies are now produced in factories, shipped in boxes, used for a few weeks and discarded, at a scale probably exceeding a million nests a year.",
        "Escapes were inevitable, and where the species has got out it has generally thrived. It is established in Japan, where it is formally designated an invasive alien species and competes with the native Bombus hypocrita. It reached Tasmania from mainland glasshouses and spread across the island. And it was introduced to Chile in 1998, from where it has moved south and east through Patagonia at a rate of hundreds of kilometres a year.",
        "The South American case is the serious one. The native giant bumblebee Bombus dahlbomii — the largest bumblebee in the world — has retreated sharply from areas the invader has reached, with pathogen spillover from imported colonies implicated alongside direct competition. The IUCN assessed B. dahlbomii as Endangered in 2016. This is not an incidental side effect of the trade; it is the clearest documented cost of it.",
      ],
    },
    {
      id: "status",
      title: "Common, and not representative",
      body: [
        "In the 2025 European Red List of Bees the buff-tailed bumblebee was assessed as Least Concern. Two things are worth holding on to about that. First, it is a regional assessment covering Europe and the EU; the species has no global Red List status, and its European standing says nothing about the populations now living in Chile or Japan.",
        "Second, it is an outlier among its own relatives. The same 2025 reassessment found that more than a fifth of European bumblebee species now face a risk of extinction, with agricultural intensification, habitat loss, pesticides, pathogens and climate change acting together. A garden full of buff-tailed bumblebees is not evidence that bumblebees in general are doing well — it is evidence that this particular generalist copes with modern landscapes better than the specialists do.",
        "What helps the specialists helps this species too: continuous forage from February to October rather than a single midsummer flush, undisturbed rough ground and tussocky grass for nesting and hibernation, and fewer insecticides. Winter-flowering shrubs matter more than they used to, now that colonies in southern England increasingly stay active through the winter instead of shutting down.",
      ],
    },
  ],

  related: ["western-honey-bee", "seven-spot-ladybird", "monarch-butterfly"],
  tags: ["bumblebee", "bee", "pollinator", "hymenoptera", "europe", "invasive species", "buzz pollination"],
  searchTerms: [
    "bombus terrestris",
    "buff tailed bumblebee",
    "bumblebee nest",
    "buzz pollination",
    "bumblebee vs honeybee",
  ],

  faqs: [
    {
      q: "How big is a buff-tailed bumblebee colony?",
      a: "Around 300 to 400 workers at its peak, and it lasts a single season. A queen founds the nest alone in late winter, the first workers appear about six weeks later, and after three or four months the colony produces new queens and males and then dies out entirely. Only mated young queens survive the winter.",
    },
    {
      q: "What is buzz pollination?",
      a: "Some plants — tomatoes, potatoes, blueberries and their relatives — hold their pollen inside anthers that open only through tiny pores, so it has to be shaken out. A bumblebee grips the anther, decouples her wings from the flight muscles and contracts them rapidly, and the resulting vibration fires the pollen onto her body. Honeybees cannot do it, which is why greenhouse tomato growers use bumblebees.",
    },
    {
      q: "Why do bumblebees fly in cold weather when honeybees do not?",
      a: "They generate their own heat. A bumblebee can shiver its flight muscles without moving its wings to raise thoracic temperature before take-off, and its dense coat holds that heat in. It will forage at around 8°C, whereas honeybees generally stay in the hive below about 16°C. In a northern spring that difference decides which crops get pollinated.",
    },
    {
      q: "Is the buff-tailed bumblebee endangered?",
      a: "No — it was assessed as Least Concern in the 2025 European Red List of Bees. That assessment is regional, covering Europe and the EU rather than the world, and this species is an outlier among its relatives: the same reassessment found more than a fifth of European bumblebee species now at risk of extinction.",
    },
    {
      q: "Why is a European bumblebee a problem in South America?",
      a: "Because it was taken there. Bombus terrestris has been bred commercially for greenhouse pollination since 1987, and colonies introduced to Chile in 1998 escaped and spread through Patagonia. Its arrival has coincided with a sharp retreat of the native giant bumblebee, Bombus dahlbomii, through a combination of competition and pathogens carried by imported colonies; the IUCN assessed that species as Endangered in 2016.",
    },
  ],

  seo: {
    title: "Buff-Tailed Bumblebee — Colonies, Buzz Pollination & Trade",
    description:
      "A researched profile of the buff-tailed bumblebee (Bombus terrestris): its annual colony cycle, buzz pollination and cold-weather foraging, the million-colony greenhouse trade, and its invasive spread abroad.",
    keywords: [
      "buff tailed bumblebee",
      "bombus terrestris",
      "bumblebee colony size",
      "buzz pollination",
      "bumblebee invasive chile",
    ],
  },

  sources: [
    {
      label: "Bombus terrestris — Red List assessment (Europe, 2025)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/221880141/221880274",
    },
    {
      label: "Buff-tailed bumblebee species account",
      publisher: "Bumblebee Conservation Trust",
      url: "https://www.bumblebeeconservation.org/bee-faqs/buff-tailed-bumblebee/",
    },
    {
      label: "Mounting risks threaten survival of wild European pollinators — European Red List of Bees, 2025",
      publisher: "IUCN",
      url: "https://iucn.org/press-release/202510/mounting-risks-threaten-survival-wild-european-pollinators-iucn-red-list",
    },
    {
      label: "Bombus dahlbomii — Red List assessment (Endangered, 2016)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/21215142/100240441",
    },
  ],

  updatedAt: "2026-07-29",
};

export default buffTailedBumblebee;
