// Snowy owl — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const snowyOwl = {
  slug: "snowy-owl",
  category: "birds",
  name: "Snowy Owl",
  scientificName: "Bubo scandiacus",
  otherNames: ["Arctic owl", "Great white owl", "Polar owl"],

  summary:
    "A heavy white owl of the Arctic tundra that hunts in daylight, breeds only where lemmings are abundant, and was reassessed as Vulnerable after its global population turned out to be a fraction of the old estimate.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/SnowyOwlAmericanBlackDuck.jpg/1920px-SnowyOwlAmericanBlackDuck.jpg",
    alt: "A snowy owl on the ground with an American black duck it has caught, white plumage flecked with dark barring",
    credit: "Chuck Homler d/b/a Focus On Wildlife / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bubo_scandiacus_346790220.jpg/1920px-Bubo_scandiacus_346790220.jpg",
      alt: "A snowy owl with yellow eyes and white plumage marked with dark bars",
      credit: "Luke / Wikimedia Commons",
      title: "Reading the barring",
      caption:
        "The amount of dark flecking is a rough guide to age and sex. Older males can be almost pure white; females and young birds keep heavy barring for life, which is why the two are so often mistaken for different species.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Bubo_scandiacus_Boundary_Bay_1.jpg",
      alt: "A snowy owl in open marshland at Boundary Bay, British Columbia, one of a group wintering there",
      credit: "Bill Anderson from Surrey, Canada / Wikimedia Commons",
      title: "Fifteen owls in one marsh",
      caption:
        "Wintering birds concentrate on flat, treeless ground that resembles tundra — coastal marsh, farmland, airfields. A good site can hold a dozen or more owls in an irruption year and none at all in the next.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Bubo_scandiacus_Boundary_Bay_2.jpg/1920px-Bubo_scandiacus_Boundary_Bay_2.jpg",
      alt: "Snowy owls perched in a cluster of driftwood at Boundary Bay, Canada, preening at sunset",
      credit: "Ingrid Taylar from Seattle, WA, USA / Wikimedia Commons",
      title: "Ground perches, not branches",
      caption:
        "A snowy owl hunts by watching from a low vantage point and dropping onto prey. On treeless ground that means driftwood, fence posts, hummocks — anything a metre or two above the surrounding view.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Bubo_scandiacus_Canoga.jpg/1920px-Bubo_scandiacus_Canoga.jpg",
      alt: "A snowy owl on open ground in Canoga, New York, far south of its Arctic breeding range",
      credit: "Tim from Ithaca / Wikimedia Commons",
      title: "How far south they reach",
      caption:
        "In irruption winters snowy owls appear well into the northern United States and occasionally far beyond. These are not starving stragglers by default — many are young birds from a productive lemming summer.",
    },
  ],

  headline: "An Arctic owl that hunts in daylight",
  intro: [
    "The snowy owl breaks most of the rules people expect owls to follow. It hunts by day as readily as by night, because on its Arctic breeding grounds the sun does not set for months. It nests on bare ground rather than in a tree cavity. It is largely silent outside the breeding season. And it is heavier than any other owl in North America.",
    "It also breaks the rules of a normal bird territory. Snowy owls are nomadic rather than migratory: a bird may nest in Arctic Canada one summer and in Siberia the next, going wherever lemmings are abundant that year. That behaviour hid the species' decline for a long time — a bird missing from one place had simply moved, until it turned out that the global total was far smaller than anyone had assumed.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Strigiformes",
    family: "Strigidae",
    genus: "Bubo",
    species: "Bubo scandiacus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2021,
    populationTrend: "decreasing",
    populationEstimate: "Roughly 14,000–28,000 breeding adults worldwide",
    note: "Uplisted from Least Concern to Vulnerable in 2017, after improved survey and tracking work showed the global population was around a tenth of the figure previously assumed, and confirmed as Vulnerable in the 2021 reassessment. Long-term monitoring at Arctic breeding sites indicates a decline of more than 30% over three generations. In Canada, which holds most of the North American breeding population, COSEWIC assessed the species as Threatened in 2025.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "52–71 cm",
      min: 52,
      max: 71,
      unit: "cm",
      note: "Females average noticeably larger than males",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "116–183 cm",
      min: 116,
      max: 183,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "1.3–3 kg",
      min: 1.3,
      max: 3,
      unit: "kg",
      note: "The heaviest owl in North America by average weight",
    },
    {
      key: "prey-consumption",
      label: "Prey taken",
      value: "Up to about 1,600 rodents a year",
      min: 1600,
      max: 1600,
      unit: "rodents",
      note: "Three to five lemmings a day when hunting is good; more in extreme cold",
    },
    {
      key: "migration-distance",
      label: "Movement between years",
      value: "Often thousands of km between one breeding season and the next",
      min: 0,
      max: 4600,
      unit: "km",
      note: "One satellite-tagged bird moved 4,600 km to spend the summer on Baffin Island",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "3–11 eggs",
      min: 3,
      max: 11,
      unit: "eggs",
      note: "Tracks lemming abundance directly; in poor years pairs may not breed at all",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "31–33 days",
      min: 31,
      max: 33,
      unit: "days",
      note: "By the female alone, while the male brings food",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 10 years in the wild",
      min: 9,
      max: 10,
      unit: "years",
      note: "The oldest known wild bird was at least 23 years and 10 months",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mainly lemmings and voles, plus waterfowl and seabirds", icon: "Mouse" },
    { key: "activity", label: "Activity", value: "Active by day as well as at night", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "A bare scrape on a raised patch of tundra", icon: "Mountain" },
    { key: "social-structure", label: "Social structure", value: "Solitary and territorial; loose concentrations on good wintering ground", icon: "User" },
    { key: "breeding-season", label: "Breeding season", value: "Arctic summer, and only where lemmings are abundant", icon: "Snowflake" },
    { key: "migration", label: "Movement", value: "Nomadic; irrupts far south in some winters", icon: "Navigation" },
  ],

  highlights: ["wingspan", "weight", "clutch-size", "prey-consumption"],

  distribution: {
    continents: ["North America", "Europe", "Asia"],
    regions: [
      "Circumpolar Arctic tundra",
      "Winter movements into southern Canada, the northern United States and northern Eurasia",
    ],
    habitats: [
      "Arctic tundra",
      "Coastal marsh",
      "Open farmland",
      "Airfields",
      "Sea ice",
    ],
    elevation: "Sea level to low Arctic uplands",
    note: "Breeds right around the Arctic, from Alaska and northern Canada across Greenland, Fennoscandia and Siberia; an estimated 90–95% of the North American breeding population nests in Canada. Wintering birds pick out flat, open, treeless ground that resembles tundra, which is why they turn up so reliably on coastal marshes, prairie farmland and airport perimeters. Some birds also winter on the sea ice itself, hunting seabirds at open leads.",
  },

  sections: [
    {
      id: "hunting",
      title: "Hunting in the open",
      body: [
        "Snowy owls hunt from a low perch — a hummock, a rock, a fence post — watching the ground and dropping onto whatever moves, or by quartering slowly across open country. Lemmings and voles are the staple, and a single owl may take three to five a day, up to around 1,600 rodents in a year.",
        "Unlike most owls it is not built exclusively for silence and darkness. It has the soft-edged flight feathers that mute an owl's wingbeat, but it hunts freely in full daylight, which it has to: for much of the Arctic breeding season there is no night to hunt in.",
        "The diet broadens considerably when lemmings are scarce and in winter. Ducks, geese, gulls, ptarmigan, hares and even other raptors are all recorded, and coastal birds take seabirds at openings in the sea ice. That flexibility is one reason the species survives at all in a food supply that collapses every few years.",
        "Heavy feathering runs all the way down the legs to the toes, leaving only the claws and the bill exposed. The plumage is dense enough that a snowy owl weighs distinctly more than its dimensions suggest.",
      ],
    },
    {
      id: "breeding",
      title: "Breeding on the lemming cycle",
      body: [
        "Lemming populations in the Arctic rise and crash on a rough three-to-five-year cycle, and snowy owl breeding follows them exactly. In a peak year a female may lay eleven eggs; in a poor year the pair will not breed at all. There is no attempt to hold a territory through the lean years — the owls simply leave.",
        "The nest is a scrape on a low rise on the tundra, chosen for a clear view in all directions and for being the first ground to clear of snow. The female incubates alone for 31 to 33 days while the male hunts for both of them. Because eggs are laid days apart and incubation starts immediately, the chicks hatch staggered, and a brood can contain birds of visibly different sizes.",
        "Young leave the nest at around three weeks, long before they can fly, and scatter into the surrounding vegetation while both parents continue to feed them. Both adults defend the site aggressively, striking at Arctic foxes, jaegers and any human who comes close.",
      ],
    },
    {
      id: "irruptions",
      title: "Irruptions and nomadic movement",
      body: [
        "Some winters snowy owls appear far south of the Arctic in numbers — across southern Canada, the northern United States, and occasionally much further. These irruptions are not, as was long assumed, mass starvation events. The large ones follow a productive lemming summer, and most of the birds involved are that year's young, which are simply too numerous to be accommodated on the breeding grounds.",
        "Satellite tracking has rewritten the rest of the picture. Individual owls turn out to move enormous distances between breeding attempts rather than returning to a home range: one tagged bird travelled 4,600 km to summer on Baffin Island. Others cross between the North American and Eurasian Arctic. Snowy owls behave, in effect, as one circumpolar population rather than a set of regional ones.",
        "That nomadism is exactly why the species was so badly counted. Absence from a survey area meant nothing, because the birds had always been expected to move — and the old global figure of over 200,000 individuals turned out to be an artefact of counting the same wandering birds in several places.",
      ],
    },
    {
      id: "status",
      title: "Why a familiar owl is now Vulnerable",
      body: [
        "In 2017 the IUCN uplisted the snowy owl from Least Concern straight to Vulnerable — the global population was revised down to fewer than 100,000 individuals, with breeding adults now estimated at roughly 14,000 to 28,000. The 2021 reassessment kept the Vulnerable listing, and a 2024 circumpolar status assessment found that breeding numbers at long-term Arctic monitoring sites have fallen by more than 30% over three generations.",
        "The threats are a mix. Warming is destabilising the lemming cycles the owls depend on: milder, wetter Arctic winters produce ice layers in the snowpack that collapse the subnivean space lemmings live and breed in, and the sharp population peaks that trigger good owl years have become less reliable in parts of Fennoscandia and Greenland.",
        "Away from the breeding grounds the causes are more mundane and more direct: collisions with vehicles, aircraft and power lines on the flat open ground wintering owls prefer, and secondary poisoning from rodenticides in farmland. Canada's COSEWIC assessed the species as Threatened in 2025, noting a 42.6% decline in Christmas Bird Count records over roughly 24 years.",
        "The practical difficulty is that a nomadic circumpolar bird cannot be conserved site by site. Most current work is monitoring — coordinated tracking, banding and standardised breeding surveys across the Arctic — on the grounds that the species' real problem so far has been that nobody knew how many there were.",
      ],
    },
  ],

  related: ["bald-eagle", "peregrine-falcon", "emperor-penguin"],
  tags: ["owl", "arctic", "bird of prey", "nomadic", "climate change"],
  searchTerms: ["snowy owl", "bubo scandiacus", "arctic owl", "white owl", "hedwig"],

  faqs: [
    {
      q: "Are snowy owls endangered?",
      a: "They are listed as Vulnerable, not Endangered. The IUCN uplisted the species from Least Concern to Vulnerable in 2017 after the global population estimate was revised sharply downwards, and kept that listing in the 2021 reassessment. There are thought to be around 14,000 to 28,000 breeding adults worldwide, and monitored Arctic breeding sites have declined by more than 30% over three generations. Canada assessed the species as Threatened in 2025.",
    },
    {
      q: "Do snowy owls hunt during the day?",
      a: "Yes, routinely — which sets them apart from most owls. On the Arctic breeding grounds the sun does not set for weeks, so a nocturnal owl would simply not eat. They retain the soft-fringed flight feathers that make owl flight near-silent, but they use them in full daylight as often as at night.",
    },
    {
      q: "Why do snowy owls appear so far south some winters?",
      a: "These irruptions follow good breeding years, not bad ones. When lemmings peak, pairs raise large broods, and the resulting surplus of young birds disperses far beyond the Arctic. The old assumption that southbound owls were starving refugees turned out to be backwards for the large irruptions, though individual birds that reach the far south are often in poor condition by the time they arrive.",
    },
    {
      q: "What do snowy owls eat?",
      a: "Mainly lemmings and voles — three to five a day when hunting is good, and up to about 1,600 rodents a year. When rodents are scarce, and generally in winter, the diet broadens to ducks, geese, gulls, ptarmigan, hares and other birds, including seabirds taken at openings in the sea ice.",
    },
    {
      q: "How many eggs do snowy owls lay?",
      a: "Between three and eleven, and the number tracks the lemming supply almost exactly. In a peak lemming year a female may lay a full clutch of eleven; in a crash year the pair may skip breeding altogether and move somewhere else. Because the eggs are laid days apart and incubated from the first, the chicks hatch at different times and differ visibly in size.",
    },
    {
      q: "Do snowy owls migrate?",
      a: "Not in the usual sense. They are nomadic rather than migratory — instead of returning to a fixed breeding territory each year, they go wherever prey is abundant, and satellite tracking has recorded individuals moving thousands of kilometres between successive summers, including one bird that travelled 4,600 km to Baffin Island. Some birds cross between the North American and Eurasian Arctic.",
    },
  ],

  seo: {
    title: "Snowy Owl — Habitat, Hunting, Irruptions & Vulnerable Status",
    description:
      "A researched profile of the snowy owl (Bubo scandiacus): daylight hunting on the Arctic tundra, breeding tied to the lemming cycle, winter irruptions south, and its 2017 uplisting to Vulnerable.",
    keywords: [
      "snowy owl facts",
      "bubo scandiacus",
      "snowy owl endangered",
      "arctic owl",
      "snowy owl irruption",
    ],
  },

  sources: [
    {
      label: "Bubo scandiacus — Red List assessment (2021)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22689055/205475036",
    },
    {
      label: "Snowy Owl species account",
      publisher: "Cornell Lab of Ornithology, All About Birds",
      url: "https://www.allaboutbirds.org/guide/Snowy_Owl",
    },
    {
      label: "Snowy Owl field guide entry",
      publisher: "National Audubon Society",
      url: "https://www.audubon.org/field-guide/bird/snowy-owl",
    },
    {
      label: "First-ever global status assessment for snowy owls",
      publisher: "Project SNOWstorm",
      url: "https://www.projectsnowstorm.org/posts/first-ever-global-status-assessment-for-snowy-owls-raises-red-flags/",
    },
    {
      label: "Snowy Owl — COSEWIC assessment and status report 2025",
      publisher: "Government of Canada, Species at Risk Public Registry",
      url: "https://www.canada.ca/en/environment-climate-change/services/species-risk-public-registry/cosewic-assessments-status-reports/snowy-owl-2025.html",
    },
  ],

  updatedAt: "2026-07-29",
};

export default snowyOwl;
