// Bald eagle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const baldEagle = {
  slug: "bald-eagle",
  category: "birds",
  name: "Bald Eagle",
  scientificName: "Haliaeetus leucocephalus",
  otherNames: ["American eagle", "White-headed sea eagle"],

  summary:
    "A large fish-eating sea eagle that fell to a few hundred nesting pairs in the contiguous United States and now numbers over 300,000 birds there — and which only became the official national bird in 2024.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg/1920px-Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg",
    alt: "A bald eagle perched with wings half open, white head and tail against dark brown plumage",
    credit: "Andy Morffew / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828192400922%29.jpg/1920px-At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828192400922%29.jpg",
      alt: "An adult bald eagle at a nest site by Six Mile Lake, white head and yellow bill clearly visible",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "A nest held for a lifetime",
      caption:
        "Pairs return to the same nest year after year, adding sticks each season. A structure worked on for a decade can outgrow the branch holding it and bring the limb down.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828217868971%29.jpg/1920px-At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828217868971%29.jpg",
      alt: "A bald eagle in a lakeside tree at its nesting territory",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "Why the nest is beside water",
      caption:
        "Fish make up more than half the diet, so territories are almost always within sight of a lake, river or coast. Open water that stays unfrozen decides where northern birds can spend the winter.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828262491386%29.jpg/1920px-At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828262491386%29.jpg",
      alt: "An adult bald eagle showing the full white head and tail of a mature bird",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "Five years to a white head",
      caption:
        "Young birds are mottled brown and white and are regularly mistaken for golden eagles. The clean white head and tail only arrive in the fifth year, at about the age the bird first breeds.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828296451105%29.jpg/1920px-At_the_Six_Mile_Lake_Eagles_nest...Bald_Eagle_%28Haliaeetus_leucocephalus%29..._%2828296451105%29.jpg",
      alt: "A bald eagle among branches at the edge of a northern lake",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "The perch-and-wait hunter",
      caption:
        "Much of an eagle's day is spent motionless on a high perch watching the water. Active pursuit is expensive; waiting, then dropping onto a fish near the surface, is not.",
    },
  ],

  headline: "Brought back from a few hundred pairs",
  intro: [
    "The bald eagle is a sea eagle: a heavy, broad-winged fish hunter that lives where there is open water and tall trees to nest in. It takes fish from the surface, robs ospreys of theirs, hunts waterfowl, and scavenges carrion without hesitation — a mix that Benjamin Franklin famously found unbecoming of a national symbol.",
    "By 1963 there were only 417 known nesting pairs left in the lower 48 states, poisoned by DDT and shot for most of the preceding century. Protection, a pesticide ban and decades of reintroduction reversed it completely: a 2021 federal survey put the population at roughly 316,700 birds, and the species had already come off the endangered species list in 2007.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Accipitriformes",
    family: "Accipitridae",
    genus: "Haliaeetus",
    species: "Haliaeetus leucocephalus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2024,
    populationTrend: "increasing",
    populationEstimate:
      "About 316,700 birds in the lower 48 US states, including 71,467 nesting pairs, plus roughly 30,000 in Alaska",
    note: "Least Concern, and one of the most complete recoveries on record. The species was protected by the Bald and Golden Eagle Protection Act from 1940, listed under the US Endangered Species Act in 1978, downlisted to threatened in 1995 and removed from the list in 2007. It remains protected by federal law even though it is no longer listed.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "70–102 cm",
      min: 70,
      max: 102,
      unit: "cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "180–230 cm",
      min: 180,
      max: 230,
      unit: "cm",
      note: "Females are around a quarter larger than males",
    },
    {
      key: "weight",
      label: "Weight",
      value: "3–6.3 kg",
      min: 3,
      max: 6.3,
      unit: "kg",
      note: "Northern birds are heavier than southern ones",
    },
    {
      key: "flight-speed",
      label: "Flight speed",
      value: "56–70 km/h",
      min: 56,
      max: 70,
      unit: "km/h",
      note: "Drops to about 48 km/h when carrying a fish",
    },
    {
      key: "dive-speed",
      label: "Dive speed",
      value: "120–160 km/h",
      min: 120,
      max: 160,
      unit: "km/h",
    },
    {
      key: "nest-size",
      label: "Nest size",
      value: "Largest recorded: 2.9 m wide and 6.1 m deep",
      note: "The biggest tree nest built by any North American bird; long-used nests can weigh a tonne or more",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1–3 eggs, usually 2",
      min: 1,
      max: 3,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 35 days",
      min: 34,
      max: 36,
      unit: "days",
      note: "Shared by both parents",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–5 years",
      min: 4,
      max: 5,
      unit: "years",
      note: "The white head and tail appear at the same age",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Commonly 20–30 years in the wild",
      min: 20,
      max: 30,
      unit: "years",
      note: "The oldest banded wild bird was at least 38; most deaths happen in the first year",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mainly fish, plus birds, mammals and carrion", icon: "Fish" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "Huge stick nest high in a live tree, reused for years", icon: "TreePine" },
    { key: "social-structure", label: "Social structure", value: "Monogamous pairs; large communal roosts in winter", icon: "Users" },
    { key: "migration", label: "Movement", value: "Partly migratory — northern birds move to open water", icon: "Navigation" },
  ],

  highlights: ["wingspan", "weight", "dive-speed", "nest-size"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Alaska",
      "Canada",
      "Contiguous United States",
      "Northern Mexico",
    ],
    habitats: [
      "Coastlines",
      "Large lakes",
      "Rivers",
      "Estuaries",
      "Reservoirs",
    ],
    elevation: "Mostly lowland, wherever there is open water and mature trees",
    note: "Found only in North America. The densest populations are in coastal Alaska and British Columbia, where salmon runs concentrate hundreds of birds at a time; the Florida and Chesapeake Bay populations are the strongest in the east. Winter distribution is set almost entirely by which water stays unfrozen.",
  },

  sections: [
    {
      id: "hunting",
      title: "Fishing, robbing and scavenging",
      body: [
        "Fish dominate the diet. Across twenty food-habit studies spanning the species' range, fish made up 56% of what nesting eagles ate, birds 28%, mammals 14% and everything else 2%. Eagles take fish from at or just below the surface, snatching them in the feet without submerging — the soles of the toes carry rough spicules that grip wet scales.",
        "They are also habitual pirates. An eagle will follow an osprey and harass it until it drops its catch, and will do the same to gulls, otters and other eagles. In winter, when live fish are hard to reach, stolen and scavenged food matters more than hunting.",
        "Carrion is eaten readily — dead fish washed up on a shore, winter-killed deer, road casualties. That willingness is exactly what Benjamin Franklin objected to in a 1784 letter calling the bird one of 'bad moral character', and it is also a large part of why the species survived thin years.",
      ],
    },
    {
      id: "nesting",
      title: "Nests that outgrow their trees",
      body: [
        "Bald eagles build the largest tree nest of any bird in North America. A pair chooses a tall live tree with a clear flight path to water, and returns to it season after season, adding sticks each year until the structure is metres across. The record, found in Florida in 1963, measured 2.9 m wide and 6.1 m deep; a nest that size can weigh a tonne, and old nests sometimes bring the supporting limb down with them.",
        "One to three eggs are laid, usually two, and both parents incubate for around 35 days. Chicks hatch a few days apart, which gives the first-hatched a decisive size advantage — in lean years the younger chick often does not survive.",
        "Young birds fledge at ten to twelve weeks but stay near the nest for a further month or more while they learn to fish. They wander widely for their first few years, and only settle to breed at four or five, by which time the brown-mottled juvenile plumage has been replaced by the white head and tail.",
      ],
    },
    {
      id: "collapse",
      title: "Shooting, DDT and the low point",
      body: [
        "The decline had two phases. Through the nineteenth and early twentieth centuries eagles were shot as vermin, blamed for taking livestock and salmon; Alaska paid a bounty on them until 1953. The Bald and Golden Eagle Protection Act of 1940 stopped the legal killing but not the population slide.",
        "The second phase was chemical. DDT sprayed on farmland washed into waterways, concentrated up the aquatic food chain and reached fish-eating birds at the top in high doses. A breakdown product interfered with calcium deposition, so females laid eggs with shells too thin to survive incubation. Breeding failed across most of the country.",
        "By 1963 the US Fish and Wildlife Service could find just 417 nesting pairs in the lower 48 states. The bird was effectively gone from most of its former range south of Canada.",
      ],
    },
    {
      id: "recovery",
      title: "The recovery, and the national bird",
      body: [
        "DDT was banned in the United States in 1972. The eagle was listed under the Endangered Species Act in 1978 — endangered across most of the lower 48 and threatened in five northern states — and wildlife agencies ran translocation programmes that moved chicks from Alaska and Canada into empty territories, hacking them out from artificial towers until they fledged and imprinted on the release site.",
        "The response was slow at first and then rapid. The species was downlisted to threatened in 1995 and removed from the endangered species list entirely in 2007. A 2021 US Fish and Wildlife Service assessment, which combined aerial survey data with eBird records, estimated 316,700 bald eagles and 71,467 nesting pairs in the lower 48 — roughly four times the 2009 figure.",
        "The remaining threats are different in kind: lead poisoning from ammunition fragments in scavenged carcasses, vehicle and power-line collisions, and outbreaks of highly pathogenic avian influenza, which killed nesting adults in several states from 2022. Neither the species' federal protections nor the recovery are considered reversible by these, but they do cap how fast it grows.",
        "One piece of the story arrived very late. Despite two centuries on the Great Seal, the bald eagle had never been designated the national bird in law. A bill doing exactly that was signed in December 2024.",
      ],
    },
  ],

  related: ["peregrine-falcon", "snowy-owl", "common-ostrich"],
  tags: ["raptor", "bird of prey", "sea eagle", "north america", "conservation success"],
  searchTerms: ["eagle", "american eagle", "haliaeetus", "national bird", "sea eagle"],

  faqs: [
    {
      q: "Are bald eagles still endangered?",
      a: "No. The bald eagle was removed from the US endangered species list in 2007 and is assessed as Least Concern by the IUCN, with an increasing population. It is still protected under the Bald and Golden Eagle Protection Act and the Migratory Bird Treaty Act, so killing, selling or disturbing one — or possessing its feathers without a permit — remains a federal offence.",
    },
    {
      q: "How many bald eagles are there now?",
      a: "A 2021 US Fish and Wildlife Service assessment estimated about 316,700 bald eagles in the lower 48 states, including 71,467 nesting pairs — around four times the 2009 estimate. Alaska holds roughly 30,000 more, and there are substantial populations across Canada.",
    },
    {
      q: "Why aren't young bald eagles bald?",
      a: "The white head and tail take four to five years to develop. Until then the bird is mottled dark brown and white all over, which is why immature bald eagles are so often reported as golden eagles. The plumage change coincides roughly with the age at which they first breed.",
    },
    {
      q: "What do bald eagles eat?",
      a: "Mostly fish — around 56% of the diet of nesting birds in a review of twenty studies, with birds at 28% and mammals at 14%. They take fish from the surface without submerging, steal catches from ospreys and other birds, hunt ducks and gulls, and scavenge carrion freely, especially in winter.",
    },
    {
      q: "How big is a bald eagle's nest?",
      a: "Larger than any other tree nest in North America. Pairs reuse and extend the same nest for years, so it grows steadily; the largest on record, in Florida, was 2.9 m across and 6.1 m deep. A nest of that size can weigh a tonne, and heavy nests sometimes break the branch supporting them.",
    },
    {
      q: "Is the bald eagle the national bird of the United States?",
      a: "Yes, but only officially since December 2024. The eagle had appeared on the Great Seal since 1782 and was universally treated as the national symbol, yet no law had ever named it the national bird until a bill doing so was signed.",
    },
  ],

  seo: {
    title: "Bald Eagle — Size, Diet, Nests & Recovery from DDT",
    description:
      "A researched profile of the bald eagle (Haliaeetus leucocephalus): a 2.3 m wingspan, record-breaking nests, a diet built on fish and piracy, and the recovery from 417 nesting pairs to over 300,000 birds.",
    keywords: [
      "bald eagle facts",
      "haliaeetus leucocephalus",
      "bald eagle wingspan",
      "bald eagle population",
      "national bird of the united states",
    ],
  },

  sources: [
    {
      label: "Haliaeetus leucocephalus — Red List assessment (2024)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22695144/264598530",
    },
    {
      label: "Bald Eagle species account",
      publisher: "Cornell Lab of Ornithology, All About Birds",
      url: "https://www.allaboutbirds.org/guide/Bald_Eagle",
    },
    {
      label: "America's bald eagle population continues to soar (2021 estimate)",
      publisher: "U.S. Fish and Wildlife Service",
      url: "https://www.fws.gov/story/2021-03/americas-bald-eagle-population-continues-soar",
    },
    {
      label: "Bald Eagle species profile",
      publisher: "U.S. Fish and Wildlife Service",
      url: "https://www.fws.gov/species/bald-eagle-haliaeetus-leucocephalus",
    },
    {
      label: "S.4610 — designating the bald eagle as the national bird",
      publisher: "United States Congress",
      url: "https://www.congress.gov/bill/118th-congress/senate-bill/4610/text",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default baldEagle;
