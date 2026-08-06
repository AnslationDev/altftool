// Seven-spot ladybird — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const sevenSpotLadybird = {
  slug: "seven-spot-ladybird",
  category: "insects",
  name: "Seven-Spot Ladybird",
  scientificName: "Coccinella septempunctata",
  otherNames: ["Seven-spotted lady beetle", "Sevenspotted ladybug", "C-7"],

  summary:
    "Europe's most familiar beetle: a specialist aphid predator that advertises its toxicity in red and black and bleeds bitter alkaloids from its knees when handled.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/08/7-Spotted-Ladybug-Coccinella-septempunctata-sq1.jpg",
    alt: "A seven-spot ladybird on a leaf, red elytra marked with seven black spots",
    credit: "Photographer: Dominik Stodulski Graphic Processing: User:MathKnight / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coccinella_septempunctata_-_Biedronka_siedmiokropka_-_Seven-spot_ladybird_%2835986543765%29.jpg/1920px-Coccinella_septempunctata_-_Biedronka_siedmiokropka_-_Seven-spot_ladybird_%2835986543765%29.jpg",
      alt: "A seven-spot ladybird on a plant stem with the black-and-white pronotum markings visible",
      credit: "Marta Boroń / Wikimedia Commons",
      title: "Seven spots and two white cheeks",
      caption:
        "The count is diagnostic: one spot straddles the join of the wing cases, with three on each side. The two white patches on the pronotum separate this species from the several other red ladybirds it is confused with.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/7-spot_ladybird_%28Coccinella_septempunctata%29_-_geograph.org.uk_-_6122887.jpg",
      alt: "A seven-spot ladybird walking over vegetation",
      credit: "Evelyn Simak / Wikimedia Commons",
      title: "Hunting on foot",
      caption:
        "Adults find prey by walking plants systematically rather than by flying between them, following the stem-and-leaf routes where aphid colonies build up.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/5b/7-spot_ladybird_%28Coccinella_septempunctata%29_-_geograph.org.uk_-_6122888.jpg",
      alt: "A seven-spot ladybird photographed close up on a leaf, wing cases glossy red",
      credit: "Evelyn Simak / Wikimedia Commons",
      title: "Colour that is a warning",
      caption:
        "The red is aposematic, not decorative. It is backed by real chemistry — coccinelline and precoccinelline, alkaloids released in the ladybird's own blood when it is attacked.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/08/7-spot_ladybird_%28Coccinella_septempunctata%29_-_geograph.org.uk_-_6122889.jpg",
      alt: "A seven-spot ladybird on foliage seen from above",
      credit: "Evelyn Simak / Wikimedia Commons",
      title: "One beetle, a season of aphids",
      caption:
        "Across a full life a seven-spot may eat in the region of five thousand aphids — the reason it has been shipped around the world as a biological control agent.",
    },
  ],

  headline: "The beetle that bleeds to defend itself",
  intro: [
    "The seven-spot is the ladybird most Europeans mean when they say ladybird: 6 to 8 millimetres, glossy red, one spot on the seam and three on each wing case, with a pair of white patches on the shoulders. It is abundant in gardens, field margins, hedgerows and crops right across Europe, North Africa and much of Asia.",
    "Both adults and larvae are aphid specialists, which has made the species a fixture of biological pest control and the reason it was shipped to North America repeatedly through the twentieth century. That story has a complicated ending — but the species most responsible for the collapse of native North American ladybirds is a different introduction entirely.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Coleoptera",
    family: "Coccinellidae",
    genus: "Coccinella",
    species: "Coccinella septempunctata",
  },

  conservation: {
    status: "NE",
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate exists; the species is abundant and among the most frequently recorded beetles in Europe",
    note: "Not evaluated by the IUCN — like the overwhelming majority of insects, this species has never been assessed against the Red List criteria, which is not the same as being confirmed safe. What is known from long-term recording schemes is that it remains one of the commonest ladybirds in Britain and continental Europe. Several native European ladybirds have declined since the harlequin ladybird arrived; the seven-spot has held up better than the two-spot, but it is not immune, and it competes with the harlequin for the same aphid prey.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "6–8 mm",
      min: 6,
      max: 8,
      unit: "mm",
      note: "One of the larger ladybirds within its native European range",
    },
    {
      key: "clutch-size",
      label: "Eggs per batch",
      value: "10–50",
      min: 10,
      max: 50,
      unit: "eggs",
      note: "Laid upright on the underside of a leaf, inside or beside an aphid colony",
    },
    {
      key: "larval-duration",
      label: "Larval stage",
      value: "About 3–4 weeks",
      min: 3,
      max: 4,
      unit: "weeks",
      note: "Four instars, each eating more than the last",
    },
    {
      key: "pupal-duration",
      label: "Pupal stage",
      value: "About 8 days",
      min: 7,
      max: 9,
      unit: "days",
      note: "Pupates attached to a leaf or stem by the tip of the abdomen",
    },
    {
      key: "development-time",
      label: "Egg to adult",
      value: "About 6 weeks",
      min: 5,
      max: 7,
      unit: "weeks",
      note: "Faster in warm weather with abundant aphids; slower when prey runs short",
    },
    {
      key: "aphids-eaten",
      label: "Aphids eaten in a lifetime",
      value: "About 5,500",
      unit: "aphids",
      note: "Roughly 500 during larval development and around 5,000 as an adult, on the Royal Entomological Society's figures",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about a year",
      min: 0.5,
      max: 1,
      unit: "years",
      note: "Adults emerging in late summer overwinter and breed the following spring",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Aphids, at every life stage", icon: "Bug" },
    { key: "defence", label: "Defence", value: "Reflex bleeding of alkaloid haemolymph from the leg joints", icon: "ShieldAlert" },
    { key: "warning-colour", label: "Warning colour", value: "Aposematic red with seven black spots", icon: "Palette" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "overwintering", label: "Overwintering", value: "Adults cluster in sheltered sites through winter", icon: "Snowflake" },
    { key: "ecological-role", label: "Ecological role", value: "Aphid predator; used in biological control", icon: "Sprout" },
  ],

  highlights: ["body-length", "aphids-eaten", "defence", "overwintering"],

  distribution: {
    continents: ["Europe", "Asia", "Africa", "North America"],
    regions: [
      "All of Europe including Britain and Ireland",
      "North Africa",
      "Temperate and central Asia",
      "Introduced and widely established across the United States and Canada",
    ],
    habitats: [
      "Gardens and allotments",
      "Arable field margins",
      "Hedgerow and scrub",
      "Meadow and rough grassland",
    ],
    elevation: "Sea level to around 3,000 m",
    note: "Distribution follows aphids rather than any particular plant community, which is why the species turns up in almost any vegetated habitat and can appear in enormous numbers in a good aphid year.",
  },

  sections: [
    {
      id: "aphids",
      title: "An aphid specialist, larva and adult",
      body: [
        "Unlike most predatory insects, a ladybird eats the same thing throughout its life. The female lays her eggs in small upright batches directly against an aphid colony, and the larvae — dark, alligator-shaped and nothing like the adult — begin feeding as soon as they hatch. Across four instars in three or four weeks, a larva gets through roughly five hundred aphids, and an adult perhaps ten times that over the rest of its life.",
        "Prey is found by walking rather than by flying: adults search plants stem by stem, and their movement pattern changes the moment they encounter an aphid, tightening into a local search that keeps them inside the colony. Aphid honeydew on a leaf is itself a cue that prey is nearby.",
        "That appetite is the reason the species has been moved around the world deliberately. It is also a constraint. Seven-spots need aphids to breed, so their numbers track the aphid year: a poor spring for aphids produces a poor summer for ladybirds, and in bad years adults disperse in large numbers looking for prey, which is what produces the occasional coastal 'ladybird swarm' that makes the news.",
      ],
    },
    {
      id: "defence",
      title: "Reflex bleeding",
      body: [
        "Pick up a seven-spot and it will usually leave a drop of pungent yellow fluid on your finger. This is reflex bleeding: the beetle deliberately ruptures small vessels at the leg joints and exudes its own haemolymph, which carries the alkaloids coccinelline and its free base precoccinelline. The taste is foul and, in quantity, toxic to small predators.",
        "The red and black is the advertisement for that chemistry. A bird that samples one ladybird learns the pattern, and every ladybird thereafter benefits — which is why so many unrelated ladybird species converge on similar red-and-black or yellow-and-black schemes.",
        "The larvae and pupae carry the same defence, and the pupa adds a mechanical one: it is anchored to the leaf by the tip of the abdomen and will flick upright when touched. Even the eggs are chemically protected, which matters because the commonest predator of ladybird eggs is other ladybirds.",
      ],
    },
    {
      id: "north-america",
      title: "North America, and who actually displaced the natives",
      body: [
        "The seven-spot was released repeatedly in the United States as a biological control agent from the 1950s onwards, and finally established permanently in New Jersey in 1973. It spread quickly and is now common across most of the continent.",
        "It has since been implicated in the decline of native Coccinella species, including the nine-spotted ladybird Coccinella novemnotata — once the commonest ladybird in the northeastern United States, and effectively undetected there between the early 1990s and 2006. The mechanisms are competition for aphids and intraguild predation: when prey runs short, introduced ladybirds eat native ladybird eggs and larvae.",
        "But the causal story is genuinely contested, and it is worth not overstating it. The sharpest declines in some native species began in the 1960s, before the seven-spot was established and decades before the harlequin ladybird Harmonia axyridis established in 1988. The harlequin is the more aggressive intraguild predator, the broader generalist, and the one most closely associated with subsequent native declines on both sides of the Atlantic — a Swiss long-term dataset, for instance, ties the collapse of the two-spot ladybird specifically to the harlequin's arrival. Conflating the two introductions gets the history wrong: the seven-spot is a naturalised competitor, the harlequin is the invasion.",
      ],
    },
    {
      id: "winter",
      title: "Winter, and the clusters in the window frame",
      body: [
        "Seven-spots pass the winter as adults in diapause. From September onwards, the beetles that emerged that summer seek out sheltered, dry sites — hollow stems, leaf litter, bark crevices, and very often the corners of window frames and porches — and settle in groups.",
        "They find each other chemically. Overwintering aggregations are marked by pheromones that draw more beetles to a site that has worked before, which is why the same window frame collects ladybirds year after year. Groups of the seven-spot tend to be modest, up to a dozen or so; the larger and more conspicuous indoor clusters people find in autumn are usually harlequins.",
        "Nothing needs doing about them. The beetles are not feeding, not breeding and not damaging anything; a heated room is worse for them than an unheated porch, because it burns the fat reserves they need to reach spring. Moving a cluster gently to a cool, sheltered outbuilding is the most useful intervention available.",
      ],
    },
  ],

  related: ["buff-tailed-bumblebee", "european-stag-beetle", "monarch-butterfly"],
  tags: ["ladybird", "ladybug", "beetle", "coleoptera", "europe", "biological control", "aphid predator"],
  searchTerms: [
    "coccinella septempunctata",
    "seven spotted ladybug",
    "ladybird spots",
    "ladybird bites",
    "ladybirds in my window",
  ],

  faqs: [
    {
      q: "Do a ladybird's spots tell you how old it is?",
      a: "No. The number of spots is a species character, fixed when the adult emerges from the pupa. A seven-spot ladybird has seven spots on its first day as an adult and seven on its last. What does change is the colour: a newly emerged adult is pale orange and soft, and darkens to full red over a day or two.",
    },
    {
      q: "What is the yellow fluid a ladybird leaves on your hand?",
      a: "It is the ladybird's own blood, released deliberately from the leg joints — a defence called reflex bleeding. It contains the alkaloids coccinelline and precoccinelline, which taste extremely bitter and deter birds and other small predators. It is harmless to people beyond a strong smell and a temporary stain.",
    },
    {
      q: "How many aphids does a seven-spot ladybird eat?",
      a: "On the Royal Entomological Society's figures, roughly 5,500 across its whole life: about 500 during the three or four weeks of larval development, and around 5,000 as an adult. Both the larva and the adult are aphid specialists, which is unusual — most predatory insects change diet between stages.",
    },
    {
      q: "Is the seven-spot ladybird invasive in North America?",
      a: "It is introduced and naturalised, having been released for pest control and established permanently in New Jersey in 1973, and it has been implicated in the decline of native Coccinella species through competition and predation on their eggs and larvae. But the more damaging invader is the harlequin ladybird, Harmonia axyridis, which established in 1988 and is a far more aggressive predator of other ladybirds. The two are often confused in popular accounts.",
    },
    {
      q: "Why do ladybirds cluster in my window frame every autumn?",
      a: "They are overwintering. Adults stop feeding in autumn and look for a dry, sheltered, unheated place to sit out the cold, and they find one another using aggregation pheromones — which is why the same frame or porch corner is used year after year. They are not feeding or breeding and cause no damage. If you want to move them, put them somewhere cool and sheltered rather than warm indoors.",
    },
  ],

  seo: {
    title: "Seven-Spot Ladybird — Aphids, Reflex Bleeding & Spread",
    description:
      "A researched profile of the seven-spot ladybird (Coccinella septempunctata): its aphid diet, alkaloid reflex bleeding, overwintering clusters, and its role in North America alongside the harlequin ladybird.",
    keywords: [
      "seven spot ladybird",
      "coccinella septempunctata",
      "ladybird spots age",
      "ladybird aphids",
      "harlequin ladybird difference",
    ],
  },

  sources: [
    {
      label: "Seven-spot ladybird species profile",
      publisher: "Royal Entomological Society (Insect Week)",
      url: "https://www.insectweek.org/discover-insects/beetles/seven-spot-ladybird/",
    },
    {
      label: "7-spot ladybird",
      publisher: "Woodland Trust",
      url: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/beetles/7-spot-ladybird/",
    },
    {
      label: "Intraguild predation and native lady beetle decline",
      publisher: "PLOS ONE",
      url: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0023576",
    },
    {
      label: "Long-term monitoring in Switzerland reveals that Adalia bipunctata strongly declines in response to Harmonia axyridis invasion",
      publisher: "Insects (PMC)",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7764166/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default sevenSpotLadybird;
