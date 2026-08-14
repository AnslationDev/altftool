// Japanese rhinoceros beetle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const japaneseRhinocerosBeetle = {
  slug: "japanese-rhinoceros-beetle",
  category: "insects",
  name: "Japanese Rhinoceros Beetle",
  scientificName: "Trypoxylus dichotomus",
  otherNames: [
    "Kabutomushi",
    "Japanese horned beetle",
    "Allomyrina dichotoma",
  ],

  summary:
    "Japan's summer beetle: a palm-sized male whose forked head horn works as a pitchfork for levering rivals off a sap-soaked branch, and which is sold live in department stores by the thousand.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Japanese_rhinoceros_beetle_%28Trypoxylus_dichotomus%29_%2820492490700%29.jpg/1920px-Japanese_rhinoceros_beetle_%28Trypoxylus_dichotomus%29_%2820492490700%29.jpg",
    alt: "A male Japanese rhinoceros beetle clinging to the underside of a branch, its long forked head horn projecting forward",
    credit: "harum.koh from Kobe city, Japan / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Japanese_rhinoceros_beetle_at_Gunma_Insect_World.jpg/1920px-Japanese_rhinoceros_beetle_at_Gunma_Insect_World.jpg",
      alt: "A male Japanese rhinoceros beetle on rough tree bark, head horn forked at the tip and a shorter horn on the thorax behind it",
      credit: "岡部碩道 / Wikimedia Commons",
      title: "Two horns, not one",
      caption:
        "The long head horn gets the attention, but males carry a second, shorter horn on the thorax behind it. Together they form the fork that closes around a rival's body during a fight.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Allomyrina_dichotoma_female.JPG/1920px-Allomyrina_dichotoma_female.JPG",
      alt: "A hornless female Japanese rhinoceros beetle on tree bark, wing cases finely haired",
      credit: "Alpsdake / Wikimedia Commons",
      title: "The female has no horn at all",
      caption:
        "Females are smaller, hornless and finely furred on the wing cases. They use the head as a wedge for digging into leaf litter to lay, which is work a pitchfork would only get in the way of.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Allomyrina_dichotoma_and_Rhomborrhina_japonica.JPG/1920px-Allomyrina_dichotoma_and_Rhomborrhina_japonica.JPG",
      alt: "A large female Japanese rhinoceros beetle on wet bark alongside three smaller metallic flower chafers",
      credit: "Alpsdake / Wikimedia Commons",
      title: "Everyone wants the same tree",
      caption:
        "A sap run on an oak draws flower chafers, hornets, butterflies and beetles to the same few centimetres of bark. Contests between male rhinoceros beetles are about holding that spot, because the females come to it too.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/66/Kabutomushi-JapaneseBeetle-July2004.jpg",
      alt: "Two male Japanese rhinoceros beetles in a clear plastic keeping tub with a jelly feeding dish",
      credit: "Gombe at Japanese Wikipedia / Wikimedia Commons",
      title: "Sold by the department store",
      caption:
        "Kabutomushi are a summer fixture of Japanese childhood, sold live alongside tubs, substrate and jelly feed. The scale of that market is now a genetics problem as well as a commercial one.",
    },
  ],

  headline: "A pitchfork, and a summer that lasts two months",
  intro: [
    "The kabutomushi is the beetle a Japanese child is most likely to have owned. Males are four to eight centimetres long, glossy chestnut-black, and carry a head horn forked twice at the tip that is used to lever rival males off tree branches. They appear in early summer, gather at sap runs on oaks after dark, and are dead by early autumn.",
    "The name is worth clearing up first, because two versions are in circulation. The species has long been called Allomyrina dichotoma, and that name is still widely used, particularly in Japanese and Korean literature and on much of the imagery of the beetle. The currently accepted binomial in the international taxonomic backbones is Trypoxylus dichotomus (Linnaeus, 1771). They are the same animal.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Coleoptera",
    family: "Scarabaeidae",
    genus: "Trypoxylus",
    species: "Trypoxylus dichotomus",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate exists; the species is common across Japan, Korea, eastern China, Taiwan and parts of Southeast Asia",
    note: "Never assessed against the Red List criteria, and there is no evidence the species is in trouble — it remains abundant in broadleaf woodland throughout its range and is reared commercially in enormous numbers. The documented concern runs the other way, through the pet trade. A 2025 study in NeoBiota compared genome-wide markers from wild and commercially marketed kabutomushi and found the marketed stock has a different spatial genetic structure from wild populations, with none of the isolation-by-distance pattern wild beetles show. Because bought beetles are routinely released at the end of summer, that trade is a live route for genetic disturbance of local populations.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length (male, with horn)",
      value: "4–8 cm",
      min: 4,
      max: 8,
      unit: "cm",
      note: "Body size is strongly condition-dependent: a larva that fed well becomes a much larger adult with a disproportionately larger horn",
    },
    {
      key: "body-length",
      label: "Body length (female)",
      value: "3.5–6 cm",
      min: 3.5,
      max: 6,
      unit: "cm",
      note: "Females carry no horn, so their body length is their total length",
    },
    {
      key: "horn-length",
      label: "Head horn (male)",
      value: "7–32 mm",
      min: 7,
      max: 32,
      unit: "mm",
      note: "In the largest males the horn reaches about a third of total body length; small males may have barely a stub",
    },
    {
      key: "larval-duration",
      label: "Larval stage",
      value: "About 8 months",
      min: 8,
      max: 8,
      unit: "months",
      note: "Three instars, spent underground in humus and decaying leaf litter; the larva overwinters and does all the growing",
    },
    {
      key: "pupal-duration",
      label: "Pupal stage",
      value: "About 2 weeks",
      min: 2,
      max: 2,
      unit: "weeks",
      note: "The horns are laid down before this, during the prepupal stage — which is why the species is used as a laboratory model for how exaggerated structures develop",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "About 2–4 months",
      min: 2,
      max: 4,
      unit: "months",
      note: "The whole life cycle runs to roughly twelve months; adults emerge in early summer and none survive the winter",
    },
  ],

  traits: [
    { key: "diet-adult", label: "Adult diet", value: "Tree sap, especially from oaks; ripe fruit", icon: "Droplets" },
    { key: "diet-larva", label: "Larval diet", value: "Humus and decaying leaf litter", icon: "Leaf" },
    { key: "weapon", label: "Weapon", value: "Forked head horn used as a pry bar", icon: "Swords" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal; gathers at sap runs after dark", icon: "Moon" },
    { key: "ecological-role", label: "Ecological role", value: "Sap feeder; larvae break down leaf litter", icon: "Recycle" },
  ],

  highlights: ["length", "horn-length", "weapon", "lifespan-adult"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Honshu, Shikoku, Kyushu and outlying Japanese islands",
      "The Korean Peninsula",
      "Eastern and central mainland China",
      "Taiwan",
      "Northern Vietnam, Myanmar and Thailand",
    ],
    habitats: [
      "Broadleaf deciduous woodland",
      "Sawtooth oak and konara oak stands",
      "Secondary woodland and satoyama edge habitat",
      "Suburban parks with mature trees",
    ],
    elevation: "Lowland to hill forest; the species is a creature of warm-temperate and subtropical broadleaf woodland",
    note: "Several subspecies are recognised across the range, separated largely by island and mainland populations — Honshu and the western Japanese islands, Okinawa, Taiwan, mainland China and the Korean Peninsula each have their own. In Japan the beetle is closely tied to satoyama, the managed woodland-and-farmland mosaic around villages, where coppiced oaks produce exactly the sap runs it feeds at.",
  },

  sections: [
    {
      id: "horn",
      title: "The pitchfork",
      body: [
        "A male kabutomushi has two horns, not one. The long one projects from the head and forks twice near the tip; a shorter one sits on the thorax behind it and forks once. In a fight the male slides the head horn underneath his opponent, closes the gap against the thoracic horn, and pries — the classic description is that he pitchforks the rival up and flips him off the branch or the tree altogether.",
        "Erin McCullough and colleagues built three-dimensional biomechanical models from micro-CT scans of rhinoceros beetle horns and found that horn cross-section tracks fighting style across species. Trypoxylus has a triangular cross-section, which is what a horn subjected to prying and twisting loads needs; species that fight by squeezing or stabbing have different geometry. The horn is not a generic ornament. It is shaped for one specific mechanical job.",
        "Horn length scales disproportionately with body size, so a well-fed larva produces an adult with an enormously larger weapon while a poorly fed one produces a near-hornless male. Those small males do not simply lose contests — they avoid them, sneaking onto occupied sap sites to mate while the large males are busy fighting one another. Both strategies persist because both work.",
      ],
    },
    {
      id: "sap-runs",
      title: "Life at a sap run",
      body: [
        "Adults do not chew wood or leaves. They feed on sap oozing from wounds on broadleaf trees, particularly sawtooth oak and konara oak, and on fallen ripe fruit. A good sap run is a fixed point in the landscape that ferments, smells strongly and attracts everything: flower chafers, hornets, butterflies, moths and beetles all crowding the same few centimetres of wet bark.",
        "Most of this happens at night. Beetles fly in after dusk, and the contests that follow are about occupancy — a male that holds the sap site is where the females will arrive to feed. That is the whole logic of the horn: it is a tool for keeping a patch of bark.",
        "Sap runs are also why the species is so tied to satoyama, the coppiced woodland around Japanese villages. Regular cutting produces the wounded, regrowing oaks that leak sap, and the leaf litter under them is where the larvae live. Where that management has been abandoned, the habitat quietly changes character.",
      ],
    },
    {
      id: "life-cycle",
      title: "Twelve months, eight of them underground",
      body: [
        "Eggs are laid in late summer in humus and decaying leaf litter and hatch in about two weeks. The larva feeds through three instars over roughly eight months, overwintering underground as a fat white grub — this is the entire growth phase, and how much it eats determines everything about the adult it becomes.",
        "In spring the larva enters a prepupal stage, and this is where the horns are actually built: the tissue that becomes the head and thoracic horns is laid down before pupation, folded, and unfurled at the moult. Pupation itself takes only about two weeks. The species has become a standard laboratory model for how exaggerated structures develop, precisely because the horn appears so abruptly and so variably.",
        "The adult emerges in early summer, lives two to four months, and dies. The whole cycle runs to roughly a year, which is short for a large scarab — the hercules and stag beetles that people compare it to spend several years as larvae.",
      ],
    },
    {
      id: "kabutomushi",
      title: "Kabutomushi: the beetle as a commodity",
      body: [
        "In Japan the kabutomushi occupies a place with no real Western equivalent. Live beetles and larvae are sold in department stores, hardware shops and pet shops through the summer, alongside plastic tubs, fermented sawdust substrate and jelly feed. Beetle sumo — two males placed on a log, the winner being the one that flips or dislodges the other — is a genuine summer fixture, with organised tournaments drawing hundreds of children.",
        "The market is large enough to have consequences. Japan liberalised the import of foreign stag and rhinoceros beetles from 1999, and the wider trade in exotic beetles has been a conservation concern in Southeast Asia ever since. For the native kabutomushi, the issue is more specific. A 2025 study in NeoBiota compared mitochondrial DNA and genome-wide SNP markers between wild Japanese beetles and commercially sold ones, and found that wild populations show a clear isolation-by-distance pattern while marketed stock does not — the commercial supply is genetically mixed relative to the wild landscape it is sold into.",
        "Since a bought beetle is very often released into the nearest woodland when the summer ends, that mismatch matters. The species is not endangered and there is no sign it is heading that way. But the thing most likely to change its populations is not habitat loss or collection — it is a few million tubs being emptied out at the end of August.",
      ],
    },
  ],

  related: ["hercules-beetle", "goliath-beetle", "european-stag-beetle"],
  tags: ["beetle", "coleoptera", "japan", "scarab", "horns", "pet trade"],
  searchTerms: [
    "trypoxylus dichotomus",
    "allomyrina dichotoma",
    "kabutomushi",
    "japanese horned beetle",
    "beetle sumo",
  ],

  faqs: [
    {
      q: "Is it Trypoxylus dichotomus or Allomyrina dichotoma?",
      a: "Both names refer to the same beetle. Allomyrina dichotoma is long-established and still widely used, especially in Japanese and Korean sources, but the currently accepted binomial in the international taxonomic backbones is Trypoxylus dichotomus (Linnaeus, 1771). Expect to see either name on photographs, papers and product labels.",
    },
    {
      q: "What does a Japanese rhinoceros beetle use its horn for?",
      a: "Fighting other males over sap sites. The male slides his long forked head horn under a rival, closes it against the shorter horn on his thorax, and pries the opponent up and off the branch. Biomechanical modelling shows the horn's triangular cross-section is specifically suited to that prying load, rather than to the stabbing or squeezing styles other rhinoceros beetles use.",
    },
    {
      q: "How long does a kabutomushi live?",
      a: "About a year in total, but only two to four months of that is as a beetle. Eggs hatch in roughly two weeks, the larva feeds and overwinters underground for around eight months, pupation takes about two weeks, and the adult emerges in early summer and dies before winter.",
    },
    {
      q: "Why are some male rhinoceros beetles almost hornless?",
      a: "Because horn size depends on how well the larva fed. Horn length scales disproportionately with body size, so a small male ends up with far less than a proportionally reduced horn. Those males adopt a different tactic — avoiding fights and sneaking onto occupied sap sites to mate — and it works well enough that both strategies persist.",
    },
    {
      q: "Are Japanese rhinoceros beetles endangered?",
      a: "No, and they have never been formally assessed. The species is common across Japan, Korea, eastern China and Taiwan. The documented risk is unusual: a 2025 genetic study found that commercially sold beetles differ in population structure from wild ones, so the widespread habit of releasing bought beetles at the end of summer is a route for genetic disturbance of local populations.",
    },
  ],

  seo: {
    title: "Japanese Rhinoceros Beetle — Kabutomushi Horns & Life Cycle",
    description:
      "A researched profile of the Japanese rhinoceros beetle (Trypoxylus dichotomus, formerly Allomyrina dichotoma): how the forked horn pries rivals off a branch, the twelve-month life cycle, and what the kabutomushi pet trade is doing to wild genetics.",
    keywords: [
      "japanese rhinoceros beetle",
      "kabutomushi",
      "trypoxylus dichotomus",
      "allomyrina dichotoma",
      "beetle horn fighting",
    ],
  },

  sources: [
    {
      label: "Trypoxylus dichotomus (Linnaeus, 1771) — accepted name and taxonomic record",
      publisher: "Global Biodiversity Information Facility (GBIF)",
      url: "https://www.gbif.org/species/1076217",
    },
    {
      label: "Release of marketed individuals increases the risk of genetic disturbance in the pet insect Trypoxylus dichotomus (2025)",
      publisher: "NeoBiota 101: 303–320, Pensoft",
      url: "https://neobiota.pensoft.net/article/159665/",
    },
    {
      label: "Variation in an extreme weapon: horn performance differences across Trypoxylus dichotomus populations",
      publisher: "Insects (MDPI)",
      url: "https://doi.org/10.3390/insects10100346",
    },
    {
      label: "A survey of the rhinoceros beetle and stag beetle market in Japan",
      publisher: "TRAFFIC",
      url: "https://www.traffic.org/site/assets/files/5635/a_survey_of_the_rhinoceros_beetle_and_stag_beetle_market_in_japan.pdf",
    },
  ],

  updatedAt: "2026-07-29",
};

export default japaneseRhinocerosBeetle;
