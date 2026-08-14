// Bornean orangutan — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const borneanOrangutan = {
  slug: "bornean-orangutan",
  category: "mammals",
  name: "Bornean Orangutan",
  scientificName: "Pongo pygmaeus",
  otherNames: ["Orang utan", "Maias", "Mawas", "Red ape"],

  summary:
    "The largest animal that lives in trees, a solitary great ape confined to one island, reproducing more slowly than any other mammal on earth — and down to roughly a seventh of its former numbers.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Tanjung_Puting30477.jpg",
    alt: "A male Bornean orangutan in Tanjung Puting National Park, Central Kalimantan, Borneo",
    credit: "Nanosanchez / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Bornean_orangutan_%28Pongo_pygmaeus%29%2C_Tanjung_Putting_National_Park_01.jpg/1920px-Bornean_orangutan_%28Pongo_pygmaeus%29%2C_Tanjung_Putting_National_Park_01.jpg",
      alt: "A Bornean orangutan in forest at Tanjung Putting National Park, Indonesia",
      credit: "Thomas Fuhrmann / Wikimedia Commons",
      title: "Alone by design",
      caption:
        "Bornean orangutans are the least sociable of the great apes. Fruiting trees in Borneo are scattered and unpredictable, and a large ape travelling alone can exploit them without competing with its own kind.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Bornean_orangutan_%28Pongo_pygmaeus%29%2C_Tanjung_Putting_National_Park_02.jpg/1920px-Bornean_orangutan_%28Pongo_pygmaeus%29%2C_Tanjung_Putting_National_Park_02.jpg",
      alt: "A Bornean orangutan moving through the forest canopy at Tanjung Putting National Park",
      credit: "Thomas Fuhrmann / Wikimedia Commons",
      title: "Four hands in the canopy",
      caption:
        "Orangutans do not swing so much as climb. Hip joints with near-shoulder-like mobility and grasping feet let them distribute weight across several thin branches at once — the only way an animal this heavy stays in the canopy.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Bornean_orangutan_%28Pongo_pygmaeus%29%2C_Tanjung_Putting_National_Park_03.jpg/1920px-Bornean_orangutan_%28Pongo_pygmaeus%29%2C_Tanjung_Putting_National_Park_03.jpg",
      alt: "A Bornean orangutan among branches and foliage in Tanjung Putting National Park",
      credit: "Thomas Fuhrmann / Wikimedia Commons",
      title: "A mother's decade of teaching",
      caption:
        "A young orangutan stays with its mother for six to eight years, longer than any other non-human mammal, learning which of several hundred forest foods are edible and how each is opened.",
    },
  ],

  headline: "The largest animal that lives in trees",
  intro: [
    "The Bornean orangutan is the heaviest habitually arboreal animal in the world. A flanged male can reach 100 kg and still spend most of his life above the ground, moving through the canopy by distributing his weight across several branches at once rather than swinging between them.",
    "It is also the slowest-breeding mammal known. Females give birth for the first time at fourteen or fifteen and then produce one infant every six to eight years — the longest interval of any land mammal. That single fact governs everything about the species' conservation: a population that is reduced cannot rebuild on any human timescale.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Primates",
    family: "Hominidae",
    genus: "Pongo",
    species: "Pongo pygmaeus",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2024,
    populationTrend: "decreasing",
    populationEstimate: "Around 104,700 individuals remaining on Borneo",
    note: "Critically Endangered under the assessment published in 2024, amending the 2023 assessment; the species was first uplisted from Endangered to Critically Endangered in 2016. The surviving population is estimated at roughly 14% of the number thought to have existed before the mid-twentieth century, a decline of more than 80% across three generations. Three subspecies are recognised, of which P. p. pygmaeus in Sarawak and northern West Kalimantan is by far the smallest.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "1.0–1.7 m",
      min: 1.0,
      max: 1.7,
      unit: "m",
      note: "Males 1.2–1.7 m, females 1.0–1.2 m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "30–100 kg",
      min: 30,
      max: 100,
      unit: "kg",
      note: "Males average about 75 kg and range 50–100 kg; females average 38.5 kg. Bornean orangutans are heavier and stockier than their Sumatran relatives",
    },
    {
      key: "arm-span",
      label: "Arm span",
      value: "About 2.2–2.4 m in adult males",
      min: 2.2,
      max: 2.4,
      unit: "m",
      note: "Roughly one and a half times standing height. Each arm alone can reach 1.5 m",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 8.5 months",
      min: 245,
      max: 270,
      unit: "days",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "One infant",
      min: 1,
      max: 1,
      unit: "young",
    },
    {
      key: "birth-interval",
      label: "Interval between births",
      value: "6–8 years",
      min: 6,
      max: 8,
      unit: "years",
      note: "The longest of any land mammal. A female may produce only four or five offspring in her entire life",
    },
    {
      key: "sexual-maturity",
      label: "Age at first birth",
      value: "14–15 years",
      min: 14,
      max: 15,
      unit: "years",
      note: "Physical sexual maturity comes between about six and eleven, well before females actually begin to breed",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "35–45 years in the wild",
      min: 35,
      max: 45,
      unit: "years",
      note: "Captive orangutans regularly reach around 60",
    },
    {
      key: "weaning-age",
      label: "Weaning age",
      value: "About 4 years",
      min: 4,
      max: 4,
      unit: "years",
      note: "The young stay with the mother until around seven, longer than any other non-human mammal",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Frugivore — over 400 recorded foods, dominated by fruit and figs", icon: "Apple" },
    { key: "social-structure", label: "Social structure", value: "Largely solitary, with loosely overlapping ranges", icon: "User" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "locomotion", label: "Locomotion", value: "The largest habitually arboreal animal; climbs rather than swings", icon: "TreePine" },
    { key: "male-dimorphism", label: "Male forms", value: "Two adult types — flanged and unflanged", icon: "Users" },
    { key: "nest-building", label: "Nest building", value: "Builds a fresh tree nest most nights, sometimes with a roof", icon: "Home" },
  ],

  highlights: ["weight", "birth-interval", "locomotion", "male-dimorphism"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Central Kalimantan, Indonesia",
      "West Kalimantan, Indonesia",
      "East Kalimantan, Indonesia",
      "Sabah, Malaysia",
      "Sarawak, Malaysia",
    ],
    habitats: [
      "Lowland dipterocarp rainforest",
      "Peat swamp forest",
      "Riverine and freshwater swamp forest",
      "Montane forest to around 1,500 m",
    ],
    elevation: "Sea level to about 1,500 m; densities are highest in lowland and peat swamp forest",
    note: "The species is confined to Borneo and its distribution across the island is patchy, following the lowland forest that has also been the primary target of logging and plantation development. Peat swamp forest holds some of the densest remaining populations, and it is also the habitat most vulnerable to drainage and to the fires that follow.",
  },

  sections: [
    {
      id: "arboreal",
      title: "How a 90 kg animal lives in trees",
      body: [
        "Orangutans are the largest animals that live habitually in the canopy, and the engineering problem that presents is real: branches thin enough to reach the fruit at the ends are far too thin to carry the weight.",
        "The solution is to spread the load. Orangutan hip joints have nearly the mobility of shoulders, the feet grasp as effectively as the hands, and the animal moves by holding several separate supports at once, distributing its mass across a network of branches rather than concentrating it on one. Rather than swinging, an orangutan will often set a tall sapling swaying until it can reach across to the next tree — a technique that costs far less energy than climbing down and back up.",
        "Bornean orangutans nevertheless come to the ground more than Sumatran ones do, a difference usually attributed to the absence of tigers on Borneo. Large flanged males in particular travel considerable distances on foot.",
      ],
    },
    {
      id: "males",
      title: "Two kinds of adult male",
      body: [
        "Male orangutans develop along one of two paths, and the split is one of the more striking pieces of biology in the great apes. Flanged males grow the wide fleshy cheek pads, a throat sac, a long coat and roughly twice the body mass of a female. Unflanged males are sexually mature but stay small and look much like large females.",
        "This is not simply a matter of age. An unflanged male can remain in that state for years or even decades, and appears to develop flanges when the local dominant male dies or weakens — the arrested development is socially triggered rather than purely developmental.",
        "The two forms breed differently. Flanged males advertise with a long call that carries over a kilometre through the forest, and females seek them out. Unflanged males roam more widely and pursue females that are not receptive, frequently by force. Genetic paternity studies show both strategies produce offspring, which is why both persist.",
      ],
    },
    {
      id: "reproduction",
      title: "The slowest reproduction of any mammal",
      body: [
        "Female orangutans give birth for the first time at around fourteen or fifteen, and then roughly once every six to eight years — the longest interbirth interval of any land mammal, longer than elephants or whales. Over a full life a female may raise four or five offspring.",
        "The reason is the length of dependence. An infant is carried constantly for its first year, nurses until about four, and stays with its mother until it is six or seven. Everything it will need to know it learns in that time: which of several hundred forest foods are edible in which season, how to open the ones that are defended, where the fruiting trees are across a range of many square kilometres, and how to build a nest.",
        "The consequence for conservation is severe and purely arithmetic. Because the replacement rate is so low, removing even a small fraction of the adult females each year is enough to send a population into terminal decline — which is why hunting pressure that would be trivial for a fast-breeding species is lethal for this one, and why a reduced orangutan population cannot rebuild on any human timescale.",
      ],
    },
    {
      id: "intelligence",
      title: "Tools, nests and culture",
      body: [
        "Orangutans build a fresh nest almost every night, bending branches into a bowl and adding a mattress of interwoven leaves. The construction is not casual: nests may include a pillow, a blanket of leafy branches, and a roof against rain. Young orangutans practise nest-building for years before they get it right.",
        "Tool use in the wild is well documented, though less elaborate on Borneo than in some Sumatran populations. Recorded behaviours include using a leafy branch as a rain umbrella while travelling, a pad of leaves to grip spiny durian fruit, leaves as a bee-swatter or a backscratcher, and branches thrown as missiles at intruders.",
        "In captivity the picture is different again: orangutans are notorious among zookeepers for methodical escape attempts, tool improvisation and an ability to work out mechanisms that other apes attack by force. The contrast with their sparse wild tool use is usually explained by their solitary lives — with fewer models to learn from, less gets transmitted.",
      ],
    },
    {
      id: "threats",
      title: "Forest loss, fire and killing",
      body: [
        "The Bornean orangutan's decline is overwhelmingly a story about lowland forest. Industrial logging, conversion to oil palm and pulpwood plantations, mining and smallholder agriculture have removed the habitat, and the roads that come with them open the remainder to hunting.",
        "Fire compounds it. Draining peat swamp forest for plantations turns metres-deep carbon into fuel, and the fires that follow — worst in El Niño years — burn areas the size of small countries. Orangutans are killed directly in them and survivors are displaced into fragments that cannot support them.",
        "Killing is more significant than is often assumed. Interview-based surveys across Kalimantan have estimated that thousands of orangutans are killed each year, some in conflict when animals raid crops in fragmented landscapes, some for meat, and some when infants are taken for the pet trade — which requires killing the mother.",
        "Rehabilitation and release centres have returned substantial numbers of confiscated orangutans to protected forest, and Indonesian and Malaysian law protects the species outright. But with a female producing one infant every six to eight years, the arithmetic will not permit recovery unless the forest itself stops shrinking.",
      ],
    },
  ],

  related: ["chimpanzee", "western-gorilla"],
  tags: ["great ape", "primate", "asia", "critically endangered", "frugivore", "rainforest", "arboreal"],
  searchTerms: ["pongo pygmaeus", "orang utan", "borneo orangutan", "red ape", "orangutan palm oil"],

  faqs: [
    {
      q: "How many Bornean orangutans are left?",
      a: "Around 104,700, which is roughly 14% of the number thought to have existed before the mid-twentieth century. The species is Critically Endangered, having declined by more than 80% across three generations, and the decline is continuing.",
    },
    {
      q: "Why do orangutans reproduce so slowly?",
      a: "Because the young take so long to become independent. A female gives birth for the first time at fourteen or fifteen and then only once every six to eight years — the longest interval of any land mammal. Each infant nurses until about four and stays with its mother until six or seven, learning which of hundreds of forest foods are edible and how to reach them.",
    },
    {
      q: "What is the difference between flanged and unflanged male orangutans?",
      a: "Flanged males have wide fleshy cheek pads, a throat sac for their long call, and roughly twice a female's body mass. Unflanged males are sexually mature but stay small and female-like, sometimes for decades. The switch appears to be triggered socially, when the local dominant male dies or weakens, and genetic studies show both forms father offspring.",
    },
    {
      q: "Are Bornean and Sumatran orangutans the same species?",
      a: "No. There are three orangutan species — Bornean (Pongo pygmaeus), Sumatran (Pongo abelii) and Tapanuli (Pongo tapanuliensis), the last described only in 2017. Bornean orangutans are stockier and more solitary, and come to the ground more often, which is generally attributed to the absence of tigers on Borneo.",
    },
    {
      q: "How does palm oil affect orangutans?",
      a: "Directly and severely. Lowland and peat swamp forest — the orangutan's best habitat — is also the land most suited to oil palm, so conversion removes the animals' food and shelter outright. Draining peat for plantations also creates the conditions for the enormous fires that burn Kalimantan in dry years, killing orangutans and displacing survivors into fragments too small to sustain them.",
    },
  ],

  seo: {
    title: "Bornean Orangutan — Size, Behaviour, Palm Oil & Conservation Status",
    description:
      "A researched profile of the Bornean orangutan (Pongo pygmaeus): the largest tree-dwelling animal, flanged and unflanged males, the slowest reproduction of any land mammal, and why it is Critically Endangered.",
    keywords: [
      "bornean orangutan facts",
      "pongo pygmaeus",
      "orangutan palm oil",
      "how many orangutans are left",
      "flanged male orangutan",
    ],
  },

  sources: [
    {
      label: "Pongo pygmaeus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/17975/259043172",
    },
    {
      label: "Orangutan biology",
      publisher: "Orangutan Foundation International",
      url: "https://orangutan.org/orangutan-facts/orangutan-biology/",
    },
    {
      label: "Pongo pygmaeus species account",
      publisher: "Animal Diversity Web, University of Michigan Museum of Zoology",
      url: "https://animaldiversity.org/accounts/Pongo_pygmaeus/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default borneanOrangutan;
