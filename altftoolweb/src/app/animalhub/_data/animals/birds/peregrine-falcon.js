// Peregrine falcon — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const peregrineFalcon = {
  slug: "peregrine-falcon",
  category: "birds",
  name: "Peregrine Falcon",
  scientificName: "Falco peregrinus",
  otherNames: ["Duck hawk", "Peregrine"],

  summary:
    "The fastest animal on Earth, reaching speeds beyond 320 km/h in a hunting dive, and a species that recovered from near-extinction across two continents.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1775758503410-53fd3630c5c1?auto=format&fit=crop&w=1600&q=80",
    alt: "A peregrine falcon in flight against a clear blue sky, barred underparts visible",
    credit: "Bob Brewer / Unsplash",
  },
  gallery: [],

  headline: "The fastest animal on the planet",
  intro: [
    "In level flight a peregrine falcon is quick but not exceptional. What sets it apart is the stoop: a folded-wing dive from height onto prey below, during which it becomes the fastest animal ever measured. Speeds above 320 km/h are well documented, and a dive tracked with a skydiver-mounted instrument recorded 389 km/h.",
    "The peregrine is also one of conservation's clearest success stories. Pesticide contamination wiped it out across much of North America and Europe by the 1960s. After DDT was banned and captive-bred birds were released, the species recovered so thoroughly that it now nests on skyscrapers in cities that had not seen one for decades.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Falconiformes",
    family: "Falconidae",
    genus: "Falco",
    species: "Falco peregrinus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "increasing",
    populationEstimate: "Global population estimated in the low hundreds of thousands",
    note: "Listed as Least Concern following a substantial recovery. It was removed from the United States endangered species list in 1999 after the ban on DDT and decades of reintroduction work.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "34–58 cm",
      min: 34,
      max: 58,
      unit: "cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "74–120 cm",
      min: 74,
      max: 120,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "330–1,500 g",
      min: 330,
      max: 1500,
      unit: "g",
      note: "Females are roughly 30% larger than males",
    },
    {
      key: "dive-speed",
      label: "Dive (stoop) speed",
      value: "Over 320 km/h",
      min: 320,
      max: 389,
      unit: "km/h",
      note: "A recorded dive reached 389 km/h",
    },
    {
      key: "level-speed",
      label: "Level flight speed",
      value: "40–90 km/h",
      min: 40,
      max: 90,
      unit: "km/h",
    },
    {
      key: "flight-altitude",
      label: "Flight altitude",
      value: "Usually below 1,000 m; recorded above 3,000 m",
      min: 1000,
      max: 3000,
      unit: "m",
      note: "Hunting stoops begin from a few hundred metres; the greater heights come from migration",
    },
    {
      key: "migration-distance",
      label: "Migration distance",
      value: "Up to 25,000 km a year",
      min: 0,
      max: 25000,
      unit: "km",
      note: "Arctic-breeding birds winter in South America; many temperate populations do not migrate at all",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "3–4 eggs",
      min: 3,
      max: 4,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "29–33 days",
      min: 29,
      max: 33,
      unit: "days",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to 15–17 years in the wild",
      min: 15,
      max: 17,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore, mainly other birds", icon: "Bird" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "None — a bare scrape on a ledge", icon: "Building" },
    { key: "migration", label: "Movement", value: "Migratory in northern populations", icon: "Navigation" },
  ],

  highlights: ["dive-speed", "wingspan", "weight", "diet-type"],

  distribution: {
    continents: [
      "Africa",
      "Asia",
      "Australia",
      "Europe",
      "North America",
      "South America",
    ],
    regions: ["Worldwide except Antarctica and the high Arctic interior"],
    habitats: [
      "Coastal cliffs",
      "Mountains",
      "River valleys",
      "Tundra",
      "Cities",
    ],
    elevation: "Sea level to high mountain ranges",
    note: "One of the most widely distributed birds in the world, absent only from Antarctica, the driest deserts and the deep interior of tropical rainforest. The name peregrinus means wanderer — Arctic breeders migrate as far as southern South America.",
  },

  sections: [
    {
      id: "hunting",
      title: "The stoop",
      body: [
        "A peregrine hunts by climbing above its target, then folding its wings and dropping. Prey — usually another bird in flight — is struck with a clenched foot at a closing speed that can kill on impact. The falcon then turns to catch the falling body, or follows it down.",
        "Surviving that dive requires specific anatomy. Bony tubercles in the nostrils are thought to disrupt the incoming airflow so the bird can still breathe at speed. A nictitating membrane sweeps across the eye to clear it and keep it moist without blinking the target out of view. The peregrine's beak carries a tomial tooth, a notch used to sever the spinal cord of prey once caught.",
      ],
    },
    {
      id: "diet",
      title: "Diet",
      body: [
        "Peregrines eat birds almost exclusively — pigeons and doves, waders, waterfowl, starlings and songbirds, with the exact mix depending entirely on what is locally abundant. Estimates of the number of bird species taken worldwide run into the thousands.",
        "Urban populations feed heavily on feral pigeons, which is a large part of why cities suit them so well. Some individuals also hunt at dusk, taking advantage of birds migrating at night.",
      ],
    },
    {
      id: "breeding",
      title: "Breeding and nesting",
      body: [
        "Peregrines do not build a nest. They scrape a shallow depression on a cliff ledge, quarry face, or the gravel of a building roof, and lay three or four eggs directly into it. Incubation takes about a month and is shared, though the female does most of it.",
        "Pairs are typically monogamous and reuse the same nest site across years — some traditional cliff sites in Europe have records of continuous occupation stretching back centuries. Chicks fledge at roughly six weeks and depend on their parents for several weeks more while they learn to hunt.",
        "The move into cities was not planned by anyone. Tall buildings and bridges resemble cliffs, pigeons are plentiful, and there are no ground predators — so reintroduced birds and their descendants adopted them readily, and nest-box cameras on office towers have since made the species one of the most watched birds in the world.",
      ],
    },
    {
      id: "recovery",
      title: "Collapse and recovery",
      body: [
        "From the 1950s peregrine populations crashed across North America and Europe. The cause was DDT: the pesticide accumulated through the food chain into the falcons, where a breakdown product interfered with calcium metabolism and caused females to lay eggs with shells too thin to survive incubation. By the mid-1960s the peregrine had been eliminated as a breeding bird from the entire eastern United States.",
        "DDT was banned in the United States in 1972 and progressively elsewhere. Captive breeding and release programmes — most prominently the work associated with Cornell University — returned thousands of young birds to the wild over the following decades. The peregrine came off the US endangered species list in 1999.",
        "The recovery is frequently cited as evidence that a well-understood cause, removed decisively and followed by sustained reintroduction, can reverse even a continental-scale collapse.",
      ],
    },
  ],

  related: ["emperor-penguin"],
  tags: ["raptor", "bird of prey", "fastest animal", "urban wildlife", "conservation success"],
  searchTerms: ["falcon", "stoop", "duck hawk", "fastest bird", "falco"],

  faqs: [
    {
      q: "How fast can a peregrine falcon actually fly?",
      a: "In level flight, between roughly 40 and 90 km/h — respectable but not remarkable. The record speeds come from the stoop, a folded-wing dive in which peregrines regularly exceed 320 km/h. The fastest measured dive, recorded alongside a skydiver, reached 389 km/h, making it the fastest recorded movement of any animal.",
    },
    {
      q: "Why are female peregrines bigger than males?",
      a: "Reversed size difference is common in birds of prey. The female is around 30% larger, which helps her defend the nest and incubate a full clutch, while the smaller, more agile male is well suited to catching the fast-moving birds that feed the family during breeding. Falconers have separate names for them: the female is the falcon, the male is the tiercel.",
    },
    {
      q: "Why do peregrine falcons nest on skyscrapers?",
      a: "A tall building is functionally a cliff — a high, sheer ledge with a clear view and no access for ground predators. Cities also supply an abundant food source in feral pigeons. Reintroduced birds took to urban sites readily, and many cities now host long-established pairs.",
    },
    {
      q: "How did peregrine falcons nearly go extinct?",
      a: "The pesticide DDT accumulated up the food chain and disrupted calcium metabolism in the falcons, causing them to lay eggs with shells too thin to survive incubation. Populations collapsed across North America and Europe from the 1950s, and the species disappeared entirely from the eastern United States as a breeding bird. Banning DDT and releasing captive-bred birds reversed it.",
    },
    {
      q: "What do peregrine falcons eat?",
      a: "Almost entirely other birds, caught in flight — pigeons, doves, waders, ducks, starlings and songbirds, varying with what is locally common. They occasionally take bats, and urban birds rely heavily on feral pigeons.",
    },
  ],

  seo: {
    title: "Peregrine Falcon — Speed, Hunting, Habitat & Recovery",
    description:
      "A researched profile of the peregrine falcon (Falco peregrinus): the 320+ km/h hunting stoop, worldwide range, cliff and city nesting, and its recovery from the DDT collapse.",
    keywords: [
      "peregrine falcon facts",
      "fastest animal",
      "falco peregrinus",
      "peregrine stoop speed",
      "bird of prey",
    ],
  },

  sources: [
    {
      label: "Falco peregrinus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/45354964/206217909",
    },
    {
      label: "Peregrine Falcon species account",
      publisher: "Cornell Lab of Ornithology, All About Birds",
      url: "https://www.allaboutbirds.org/guide/Peregrine_Falcon",
    },
    {
      label: "Peregrine Falcon recovery",
      publisher: "U.S. Fish and Wildlife Service",
      url: "https://www.fws.gov/species/peregrine-falcon-falco-peregrinus",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default peregrineFalcon;
