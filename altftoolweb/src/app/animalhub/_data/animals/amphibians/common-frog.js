// Common frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const commonFrog = {
  slug: "common-frog",
  category: "amphibians",
  name: "Common Frog",
  scientificName: "Rana temporaria",
  otherNames: ["European common frog", "European common brown frog", "Grass frog"],

  summary:
    "Europe's default frog, found from Spain to the Arctic Circle and in more garden ponds than any other amphibian — an animal so ordinary that its slow, quiet decline in farmland and its vulnerability to a lethal virus went unnoticed for years.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/39/European_Common_Frog_Rana_temporaria.jpg",
    alt: "A common frog sitting in vegetation, olive-brown with a dark patch behind the eye",
    credit: "Richard Bartz , Munich aka Makro Freak Image:MFB.jpg / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/38/Common_frog_%28Rana_temporaria%29_-_geograph.org.uk_-_668632.jpg",
      alt: "A common frog sitting on a paved city street",
      credit: "James Yardley / Wikimedia Commons",
      title: "A frog a long way from a pond",
      caption:
        "Adult common frogs spend most of the year out of water and travel considerable distances overland, which is why they turn up on pavements, in cellars and under compost heaps far from any pond.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/37/Common_Frog_%28Rana_temporaria%29_-_geograph.org.uk_-_823493.jpg",
      alt: "A large common frog among heather on open moorland",
      credit: "Anne Burgess / Wikimedia Commons",
      title: "Damp ground is enough",
      caption:
        "Outside the breeding season the species needs only cover and moisture, so it occupies moorland, hedgerow, woodland and rough grass. Frogs breathe partly through their skin and cannot let it dry out.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bieltal-Frog-Frosch_%28Rana_temporaria%29.jpg/1920px-Bieltal-Frog-Frosch_%28Rana_temporaria%29.jpg",
      alt: "A common frog in damp vegetation showing the dark mask running back from the eye",
      credit: "Asurnipal / Wikimedia Commons",
      title: "The mask behind the eye",
      caption:
        "The dark patch enclosing the eardrum is the reliable field mark. Body colour varies enormously — olive, brown, grey, yellow, even brick red — but the mask is always there, and toads do not have it.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/AD2009Sep13_Rana_temporaria_01.jpg/1920px-AD2009Sep13_Rana_temporaria_01.jpg",
      alt: "A fully grown female common frog about 9 cm from snout to vent",
      credit: "Ernie / Wikimedia Commons",
      title: "Females outgrow males",
      caption:
        "This animal measures roughly 90 mm snout to vent, at the top of the normal range. Females are consistently larger than males, and size decides how much spawn a female can produce in a season.",
    },
  ],

  headline: "The frog most of Europe grew up with",
  intro: [
    "The common frog is the amphibian that appears in a garden pond in March, lays a raft of spawn overnight and is gone by April. It is the most widely distributed frog in Europe, reaching from northern Spain to well inside the Arctic Circle in Scandinavia and eastward to the Urals, and it survives at altitudes and latitudes where almost no other frog can breed.",
    "Its life is spent mostly on land. Adults are aquatic for a few weeks a year and terrestrial for the rest, hunting slugs, worms and insects in damp grass and woodland, and the pond matters only for spawning and for the four months a tadpole spends in it. That split is exactly why the species is harder to conserve than it looks: protecting the pond is not enough if the fields and hedges around it are gone.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Ranidae",
    genus: "Rana",
    species: "Rana temporaria",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2022,
    populationTrend: "decreasing",
    populationEstimate: "Abundant across a very large range; no global count",
    note: "Least Concern is a statement about range and total numbers, not about health. The same assessment records a decreasing trend, and the species has been lost from stretches of intensive farmland through pond drainage and agrochemicals. Ranavirus, which arrived in British populations in the late 1980s, can kill most of the adult frogs at a site in a single summer, and chytrid fungus is present across Europe.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "6–9 cm",
      min: 6,
      max: 9,
      unit: "cm",
      note: "Snout to vent. Females are larger than males, and exceptional animals approach 10 cm.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "About 23 g",
      min: 23,
      max: 23,
      unit: "g",
      note: "An average figure; a heavy gravid female weighs considerably more.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "6–8 years, up to about 14",
      min: 6,
      max: 14,
      unit: "years",
      note: "Most frogs never reach it — mortality in the first year, as egg and tadpole, is close to total.",
    },
    {
      key: "clutch-size",
      label: "Spawn per female",
      value: "Up to about 2,000 eggs",
      min: 1000,
      max: 2000,
      unit: "eggs",
      note: "Laid as one gelatinous clump. Published figures vary widely with the size of the female.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 3 years",
      min: 2,
      max: 3,
      unit: "years",
      note: "Later in cold northern and montane populations, where growth is slower.",
    },
    {
      key: "tadpole-stage",
      label: "Tadpole stage",
      value: "About 16 weeks",
      min: 12,
      max: 20,
      unit: "weeks",
      note: "Eggs hatch after two to four weeks; froglets usually leave the water in early summer.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — slugs, snails, worms, insects and spiders", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal on land; active by day in the breeding season", icon: "Moon" },
    { key: "water-type", label: "Water type", value: "Freshwater — shallow, still ponds for spawning", icon: "Droplet" },
    {
      key: "overwintering",
      label: "Overwintering",
      value: "Under logs and compost, or on the bottom of a pond breathing through the skin",
      icon: "Snowflake",
    },
    {
      key: "range-size",
      label: "Range",
      value: "Almost all of Europe, north beyond the Arctic Circle",
      icon: "MapPin",
    },
  ],

  highlights: ["length", "clutch-size", "overwintering", "range-size"],

  distribution: {
    continents: ["Europe", "Asia"],
    regions: [
      "Europe from northern Spain to the Urals",
      "Scandinavia north of the Arctic Circle",
      "Britain and Ireland",
    ],
    habitats: ["Garden and farmland ponds", "Damp grassland and woodland", "Moorland and upland bog"],
    elevation: "Sea level to about 2,500 m in the Alps and Pyrenees",
    note: "Largely absent from most of Iberia, southern Italy and the southern Balkans, where the climate is too dry — the species is a cool-and-damp specialist, which is why its range runs north rather than south. It was introduced to Ireland and is now widespread there.",
  },

  sections: [
    {
      id: "spawning",
      title: "The night the pond fills up",
      body: [
        "Common frogs are explosive breeders. Rather than spreading the season out, a whole population arrives at the same pond within a few nights, triggered by the first mild, wet weather after winter — January in south-west England, March or April across most of the range, June at Arctic latitudes and high altitude.",
        "Males arrive first and call with a low purring croak, quieter than most people expect. A male grips a female behind the front legs in amplexus and stays there, sometimes for days, fertilising the eggs as she releases them. Each female lays a single clump of up to around two thousand eggs, and because the whole population spawns in the same few square metres of shallow water, the clumps merge into the familiar raft.",
        "Clumping is not accidental. A mass of spawn holds warmth better than a scattered one and the outer layer shields the centre from ultraviolet light, so eggs in the middle of a large raft develop faster and survive better. The trade-off is that a single frost, a drying pond or one hungry newt population can take out a whole year's production at once.",
      ],
    },
    {
      id: "on-land",
      title: "The other eleven months",
      body: [
        "Once spawning is done the adults leave, and the pond becomes irrelevant to them until the following spring. They disperse into damp grassland, hedgerows, woodland and gardens, sometimes travelling well over a kilometre, and hunt at night for slugs, worms, snails and insects taken with a flick of the sticky tongue.",
        "Skin is the constraint on all of it. A frog takes in a large share of its oxygen through the skin, which only works while that skin stays moist, so an animal caught in the open on a dry day is in real trouble. This is why common frogs shelter under logs, stones and vegetation by day and move at night, and why long dry summers hurt them.",
        "Colour varies more than in almost any other European amphibian — olive, grey, yellow-brown, orange or nearly red, sometimes heavily blotched — and individuals can lighten or darken over hours. What does not vary is the dark mask behind the eye, the mark that separates a frog from a toad at a glance.",
      ],
    },
    {
      id: "winter",
      title: "Winter under the ice",
      body: [
        "Common frogs do not truly hibernate. They become torpid in cold weather and will emerge to forage during mild spells, which is why a frog can appear in a garden in December.",
        "Some spend the winter on land, under log piles, stone, leaf litter or compost. Others settle on the bottom of a pond and stay there, taking in enough oxygen through the skin from the cold water to meet the very low demand of a torpid animal. Males in particular tend to overwinter in or near the pond, which puts them first in the queue when spawning starts.",
        "The strategy has a specific failure mode. If a pond freezes over for a long spell, decaying vegetation strips the oxygen from the water underneath and the frogs suffocate — the winterkill that leaves dead frogs on the bottom of garden ponds after a hard freeze. Unlike the North American wood frog, the common frog cannot flood its tissues with glucose and survive being frozen; it simply has to find somewhere that does not freeze.",
      ],
    },
    {
      id: "threats",
      title: "Why an abundant frog still needs watching",
      body: [
        "Nothing about the common frog's Red List status suggests a problem, and across its range as a whole there is not yet a serious one. Locally the picture is different. Farm ponds have been drained on a large scale across Europe, and where the ponds remain the surrounding land is often too intensively worked to support the adults for the other eleven months of the year.",
        "Disease is the sharper threat. Ranavirus turned up in southern England in the late 1980s and produces sudden mass mortality: adults are found dead or dying at the pond edge, often with skin ulcers or bleeding, and an affected population can lose the great majority of its adults over one or two summers. It spreads readily between ponds on boots, nets and moved spawn.",
        "The chytrid fungus Batrachochytrium dendrobatidis is present in European populations too, though the common frog tolerates it better than many species. Practical conservation is unglamorous and effective: keep ponds, keep them fish-free, keep rough vegetation and log piles around them, and never move spawn between sites.",
      ],
    },
  ],

  related: ["smooth-newt", "fire-salamander", "american-bullfrog"],
  tags: ["frog", "europe", "garden pond", "least concern", "freshwater", "spawn"],
  searchTerms: [
    "rana temporaria",
    "european common frog",
    "grass frog",
    "frogspawn",
    "grasfrosch",
  ],

  faqs: [
    {
      q: "How can you tell a common frog from a common toad?",
      a: "A frog has smooth, moist skin, a dark mask running back from the eye over the eardrum, and long hind legs it uses to leap. A toad has dry, warty skin, no mask, prominent parotoid glands behind the eyes, and shorter legs — it walks or makes short hops rather than leaping. Frog spawn also comes in clumps, toad spawn in strings.",
    },
    {
      q: "How many eggs does a common frog lay?",
      a: "A single female lays one gelatinous clump containing up to about 2,000 eggs. Because a whole population spawns in the same shallow corner of a pond within a few nights, those clumps merge into one large raft, which retains heat and shields the inner eggs from ultraviolet light.",
    },
    {
      q: "Do common frogs hibernate underwater?",
      a: "Some do. They become torpid rather than truly hibernating, and while many shelter on land under logs or compost, others settle on the bottom of a pond and take in enough oxygen through their skin to survive. The risk is a long freeze: oxygen in the water can fall low enough to kill them.",
    },
    {
      q: "Why are frogs dying in my pond in summer?",
      a: "The usual cause is ranavirus, which arrived in British frog populations in the late 1980s. It causes sudden mass mortality in adults, often with skin ulcers, bleeding or lethargy, and can wipe out most of a pond's adults in a season. It travels between ponds on equipment and in moved spawn, so spawn should never be transferred between sites.",
    },
    {
      q: "Is the common frog endangered?",
      a: "No. It is listed as Least Concern, on the basis of an enormous range from Spain to the Arctic Circle and a very large total population. The assessment does record a decreasing trend, driven by pond loss, agricultural intensification and disease, so the species is declining locally while remaining secure overall.",
    },
  ],

  seo: {
    title: "Common Frog — Spawn, Winter Behaviour, Range & Threats",
    description:
      "A researched profile of the common frog (Rana temporaria): how and when it spawns, how it survives winter under pond ice, its range from Spain to the Arctic Circle, and why ranavirus matters.",
    keywords: [
      "common frog",
      "rana temporaria",
      "frogspawn",
      "common frog vs toad",
      "ranavirus frogs",
    ],
  },

  sources: [
    {
      label: "Rana temporaria — Red List assessment (2022, e.T173101508A89705642)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/173101508/89705642",
    },
    {
      label: "Common frog — species account, spawn and life cycle",
      publisher: "Froglife",
      url: "https://www.froglife.org/info-advice/amphibians-and-reptiles/common-frog/",
    },
    {
      label: "Rana temporaria — natural history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Rana_temporaria/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default commonFrog;
