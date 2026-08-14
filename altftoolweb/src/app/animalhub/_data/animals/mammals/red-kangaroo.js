// Red kangaroo — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const redKangaroo = {
  slug: "red-kangaroo",
  category: "mammals",
  name: "Red Kangaroo",
  scientificName: "Osphranter rufus",
  otherNames: ["Big red", "Plains kangaroo", "Macropus rufus"],

  summary:
    "The largest marsupial alive and the largest land mammal native to Australia — an animal whose hopping gait gets cheaper the faster it goes, and which can hold a pregnancy in suspension until conditions improve.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Red_kangaroo_-_melbourne_zoo.jpg",
    alt: "A red kangaroo standing upright, showing its reddish-brown coat, long ears and heavy tail",
    credit: "fir0002 flagstaffotos [at] gmail.com Canon 20D + Canon 70-200mm f/2.8 L / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Red_Kangaroos_at_Sturt_National_Park_NSW.jpg/1920px-Red_Kangaroos_at_Sturt_National_Park_NSW.jpg",
      alt: "An adult and a young red kangaroo on open arid grassland in Sturt National Park, New South Wales",
      credit: "PotMart186 / Wikimedia Commons",
      title: "Home ground: the arid interior",
      caption:
        "Red kangaroos occupy the dry heart of Australia and avoid the fertile coastal margins. A joey stays close to its mother long after leaving the pouch, still suckling until around twelve months old.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Roosevelt_Park_Zoo_17.jpg/1920px-Roosevelt_Park_Zoo_17.jpg",
      alt: "A red kangaroo resting on its side, photographed in a zoo enclosure",
      credit: "Farragutful / Wikimedia Commons",
      title: "Built to sit as well as hop",
      caption:
        "The heavy tail is a fifth limb. Standing, a kangaroo braces on it to form a tripod; moving slowly, it takes the animal's whole weight while both hind feet swing forward together.",
    },
  ],

  headline: "The largest marsupial on Earth",
  intro: [
    "A big male red kangaroo — Australians call them Big Reds — stands over 1.8 metres upright and weighs up to about 90 kg, with a head-and-body length of 1.4 metres and a tail adding a metre more. Females are roughly half the mass and, across most of the range, a different colour: blue-grey rather than red-brown.",
    "Two things make the species genuinely remarkable. The first is its locomotion: above about 18 km/h, hopping costs a kangaroo less energy than running costs a four-legged animal of the same size, because the Achilles tendon stores and returns energy like a spring. The second is its reproduction. A female can carry a joey in the pouch, suckle an older one at heel, and hold a third embryo in suspended development, releasing it only when the pouch is free.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Diprotodontia",
    family: "Macropodidae",
    genus: "Osphranter",
    species: "Osphranter rufus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2016,
    populationTrend: "stable",
    populationEstimate: "Millions across the arid interior; government aerial surveys of the harvest zones alone run into the low millions and swing sharply with rainfall",
    note: "Least Concern, and genuinely so — the red kangaroo is abundant, widespread and has probably benefited from the water points established for livestock across inland Australia. Numbers are volatile rather than declining: populations crash during severe drought and rebuild quickly when the rains return, which is what the species' reproductive machinery is built for. It is commercially harvested under state quotas set from annual aerial surveys, and the debate over that harvest is about animal welfare and quota science rather than about extinction risk.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "0.75–1.4 m",
      min: 0.745,
      max: 1.4,
      unit: "m",
      note: "Males 0.94–1.4 m; females 0.75–1.1 m",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "0.65–1.0 m",
      min: 0.645,
      max: 1.0,
      unit: "m",
      note: "Muscular and used as a counterweight when hopping, a prop when standing and a load-bearing fifth limb when walking slowly",
    },
    {
      key: "height",
      label: "Standing height",
      value: "About 1.5 m",
      min: 1.5,
      max: 1.8,
      unit: "m",
      note: "Average adults stand around 1.5 m; large males exceed 1.8 m, and the tallest confirmed was about 2.1 m at 91 kg",
    },
    {
      key: "weight",
      label: "Weight",
      value: "17–90 kg",
      min: 17,
      max: 92,
      unit: "kg",
      note: "Males 22–92 kg, females 17–39 kg. Males are roughly twice the mass of females — the most extreme size difference of any kangaroo",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "50–65 km/h in bursts",
      min: 50,
      max: 65,
      unit: "km/h",
      note: "Comfortable travelling speed is around 40 km/h. The higher figures circulating online for sustained speed are not supported",
    },
    {
      key: "jump-height",
      label: "Jump height",
      value: "Around 1.8 m",
      min: 1.8,
      max: 1.8,
      unit: "m",
      note: "Vertical clearance; a kangaroo covers far more ground horizontally, with stride length thought to reach about 6 m",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 33 days",
      min: 30,
      max: 36,
      unit: "days",
      note: "Followed by roughly 235 days in the pouch — the pouch does the work a placenta would",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1 joey",
      min: 1,
      max: 1,
      unit: "joey",
      note: "Born at about 2 cm and under a gram, blind and hairless, and climbs unaided to the pouch",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "15–24 months",
      min: 1.25,
      max: 2,
      unit: "years",
      note: "Females can breed from around 15–20 months but delay in drought; males rarely win access to females until much older and larger",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 8–10 years in the wild",
      min: 8,
      max: 10,
      unit: "years",
      note: "Median life expectancy is about 8 years for males and 10 for females; individuals have exceeded 20. Most joeys do not survive their first year",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Herbivore — grasses and forbs", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Small mobs of 2–10; larger aggregations at water and good feed", icon: "Users" },
    { key: "activity", label: "Activity", value: "Crepuscular and nocturnal; rests in shade through the heat", icon: "Moon" },
    { key: "locomotion", label: "Locomotion", value: "Hops — the only large mammal that does so as its main gait", icon: "Zap" },
    { key: "reproduction", label: "Reproduction", value: "Marsupial; can hold an embryo in suspended development", icon: "Egg" },
  ],

  highlights: ["weight", "top-speed", "locomotion", "reproduction"],

  distribution: {
    continents: ["Australia"],
    regions: [
      "Central Australia",
      "Western New South Wales",
      "Western Queensland",
      "Northern South Australia",
      "Inland Western Australia",
      "Southern Northern Territory",
    ],
    habitats: [
      "Arid and semi-arid shrubland",
      "Open grassland and plains",
      "Sparse woodland",
      "Desert margins",
    ],
    elevation: "Sea level to around 1,000 m",
    note: "The red kangaroo occupies almost the whole arid and semi-arid interior of mainland Australia and is absent from precisely the productive edges — the fertile southwest, the eastern and southeastern coasts, and the northern rainforests. It prefers open country with scattered trees for shade. Artificial water points dug for sheep and cattle have let the species spread into ground that was previously too dry to hold it year-round.",
  },

  sections: [
    {
      id: "hopping",
      title: "Why hopping works",
      body: [
        "The red kangaroo is the only large mammal whose principal gait is a hop, and the reason is efficiency. As the animal lands, the Achilles tendon and the ligaments of the hind leg stretch and store elastic energy, then release it into the next hop. Above roughly 18 km/h, this makes hopping cheaper per kilometre than a quadruped's run — and unusually, the energy cost barely rises as the kangaroo goes faster within its normal range.",
        "There is a second saving. The hopping stride is mechanically coupled to breathing: the gut and viscera swing against the diaphragm with each bound, moving air in and out at close to no muscular cost. A kangaroo travelling at speed is being ventilated by its own gait.",
        "Comfortable travelling speed is about 40 km/h, with bursts of 50 to 65 km/h over short distances. The trade-off is at the slow end. Kangaroos cannot walk by moving their hind legs alternately — the legs swing together — so at low speed they use a five-limbed crawl, taking their weight on the forelimbs and tail while both feet come forward. This is slow and, unlike hopping, expensive.",
        "The tail is not a passive appendage. It acts as a counterweight during the hop, a prop for the tripod stance when the animal rears up, and in the slow crawl it generates as much propulsive force as a leg.",
      ],
    },
    {
      id: "reproduction",
      title: "Embryonic diapause",
      body: [
        "Gestation lasts about 33 days and produces a joey the size of a jellybean — around 2 cm, under a gram, blind, hairless and with hind limbs barely formed. It crawls unaided from the birth canal up through the mother's fur to the pouch, attaches to a teat, and completes its development there over roughly eight months.",
        "The mother can then be supporting three offspring at different stages simultaneously: a joey at heel still suckling, a small joey in the pouch, and a dormant embryo. That third one is embryonic diapause. A female mates again soon after giving birth, but the new embryo stops developing at a ball of about a hundred cells and waits, sometimes for months, until the pouch is vacated.",
        "The teats adapt in step. A female nursing two young of different ages produces two different milks from adjacent teats — one for the newborn and one for the older joey — simultaneously.",
        "In an environment where rain is unpredictable, this is the whole point. A drought suppresses breeding; the return of good feed releases the waiting embryos, and a population can rebuild far faster than gestation length alone would suggest. Red kangaroos are built to ride out bad years rather than to breed steadily through them.",
      ],
    },
    {
      id: "heat",
      title: "Surviving the interior",
      body: [
        "Red kangaroos hold a body temperature near 36 °C in country that regularly exceeds 40 °C, and they do it mostly by not fighting the heat. They are inactive through the day, resting in whatever shade exists, and feed at dusk, through the night and around dawn — roughly 43% of a red kangaroo's day goes on searching for, cropping and chewing grass.",
        "Physically, the pale fur of the underside reflects radiation from the ground, and the animals scrape shallow hollows in the earth to reach cooler soil. When they do need to shed heat actively, they lick their forearms: the skin there is thin, richly supplied with superficial blood vessels, and evaporation from the wetted fur cools blood returning to the core. Panting is a secondary measure.",
        "Water is largely obtained from the plants they eat, and red kangaroos can go long periods without drinking, which is why they occupy country most large grazers cannot. Their diet is dominated by green grass and forbs; they select high-quality green pick where it exists and shift to shrubs and drier material when it does not.",
      ],
    },
    {
      id: "society",
      title: "Mobs, boxing and dominance",
      body: [
        "Red kangaroos live in small groups — mobs of two to ten, most often just two or three — which combine into large temporary aggregations wherever feed or water is good. Membership is fluid, and the species is not territorial.",
        "Males compete for access to females, and the contest is physical. Two males will stand up on their tails, grapple with the forelimbs, and deliver a kick with both hind feet — the move that gives 'boxing kangaroo' its name, and the one that does the damage, since the hind claws are long and the leg muscles are the animal's largest. Serious injuries occur. Dominance tracks size closely, and because males keep growing throughout life, the biggest and oldest males do most of the breeding.",
        "Males also display: standing at full height, tensing the chest and forearms, and in some cases rubbing chest secretions on vegetation. The extreme size difference between the sexes is a direct consequence of this competition.",
      ],
    },
    {
      id: "people",
      title: "Kangaroos and people",
      body: [
        "The red kangaroo is a conservation success story of an unusual kind: European settlement made inland Australia better for it. Bores and dams sunk for sheep and cattle created permanent water where there had been none, pasture improvement provided feed, and dingo control removed the main predator across much of the sheep country. Numbers are almost certainly higher now than before 1788.",
        "That has made it a managed species rather than a protected one. Commercial harvesting operates under state quotas set from annual aerial surveys, with a national quota in the millions of which only a fraction is typically taken, and landholders can also cull under permit. The arguments are about the welfare standards of the harvest and the reliability of the survey models, not about the species' survival.",
        "The other everyday conflict is on the road. Kangaroos are crepuscular, which is exactly when traffic peaks, and they are heavy enough to write off a vehicle — kangaroo strikes account for a large share of Australian animal-related insurance claims. The main predators that remain are dingoes, wedge-tailed eagles taking joeys, and, for the young, introduced foxes and cats.",
      ],
    },
  ],

  related: ["platypus", "cheetah"],
  tags: ["australia", "marsupial", "herbivore", "arid", "least concern", "desert"],
  searchTerms: [
    "osphranter rufus",
    "macropus rufus",
    "big red kangaroo",
    "largest marsupial",
    "how fast can a kangaroo hop",
  ],

  faqs: [
    {
      q: "How fast can a red kangaroo hop?",
      a: "Bursts of 50 to 65 km/h over short distances, with a comfortable travelling speed of around 40 km/h. Above roughly 18 km/h hopping is more energy-efficient than a four-legged animal's run, because the Achilles tendon stores and returns energy with each bound — so going faster costs a kangaroo surprisingly little extra.",
    },
    {
      q: "How big is a red kangaroo?",
      a: "Large males stand over 1.8 metres upright and weigh up to about 90 kg, with a head-and-body length of 1.4 metres plus a metre of tail; the largest confirmed individual was around 2.1 metres tall at 91 kg. Females are roughly half the weight at 17 to 39 kg. It is the largest marsupial alive and the largest land mammal native to Australia.",
    },
    {
      q: "What is embryonic diapause?",
      a: "The ability to pause a pregnancy. A red kangaroo female mates again shortly after giving birth, but the new embryo halts at about a hundred cells and waits — sometimes for months — until the pouch is free. It means a female can support a joey at heel, a joey in the pouch and a dormant embryo at once, and lets populations rebuild quickly after drought.",
    },
    {
      q: "Are red kangaroos endangered?",
      a: "No. The red kangaroo is assessed as Least Concern and is abundant across inland Australia. Numbers fluctuate sharply with rainfall rather than trending down, and the species has probably benefited from the artificial water points and dingo control that came with pastoral farming. It is commercially harvested under state quotas set from annual aerial surveys.",
    },
    {
      q: "Why can't kangaroos walk?",
      a: "Because their hind legs cannot move independently — they swing together. At low speed a kangaroo uses a five-limbed crawl instead, taking its weight on the forelimbs and tail while both feet come forward. The tail contributes as much propulsive force as a leg. This gait is slow and energetically expensive, which is one reason kangaroos prefer to hop.",
    },
  ],

  seo: {
    title: "Red Kangaroo — Size, Hopping, Reproduction & Habitat",
    description:
      "A researched profile of the red kangaroo (Osphranter rufus): the largest marsupial alive, why hopping gets cheaper with speed, embryonic diapause, and life in the Australian arid zone.",
    keywords: [
      "red kangaroo facts",
      "osphranter rufus",
      "largest marsupial",
      "how fast can a kangaroo hop",
      "kangaroo embryonic diapause",
    ],
  },

  sources: [
    {
      label: "Macropus rufus — Red List assessment (Ellis et al., 2016)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/40567/21953534",
    },
    {
      label: "Red kangaroo species profile",
      publisher: "Australian Museum",
      url: "https://australian.museum/learn/animals/mammals/red-kangaroo/",
    },
    {
      label: "Red kangaroo (Osphranter rufus) fact sheet — characteristics, behaviour and population",
      publisher: "San Diego Zoo Wildlife Alliance Library",
      url: "https://ielc.libguides.com/sdzg/factsheets/redkangaroo",
    },
  ],

  updatedAt: "2026-07-29",
};

export default redKangaroo;
