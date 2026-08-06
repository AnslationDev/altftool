// Wandering albatross — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const wanderingAlbatross = {
  slug: "wandering-albatross",
  category: "birds",
  name: "Wandering Albatross",
  scientificName: "Diomedea exulans",
  otherNames: ["Snowy albatross", "White-winged albatross", "Goonie"],

  summary:
    "The bird with the greatest wingspan alive — up to 3.6 metres verified — able to cross the Southern Ocean for hours without a wingbeat, and now dying in numbers on longline hooks.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Diomedea_exulans_-_SE_Tasmania.jpg/1920px-Diomedea_exulans_-_SE_Tasmania.jpg",
    alt: "A wandering albatross gliding low over the sea on long, narrow, black-tipped white wings",
    credit: "JJ Harrison ( https://www.jjharrison.com.au/ ) / Wikimedia Commons",
  },
  gallery: [],

  headline: "The longest wings on Earth",
  intro: [
    "No living bird has wings as long as a wandering albatross. They average around three metres from tip to tip, and the largest reliably measured bird — a male taken aboard a research ship in the Tasman Sea in 1965 — reached 3.63 metres. Nothing else that flies today comes close.",
    "Those wings exist for one purpose: to cover the Southern Ocean without paying for it. Using the wind gradient above the waves, an albatross can travel for hours with almost no flapping, and some individuals circle Antarctica three times in a single year, well over 120,000 kilometres. The same habit of following ships that made the bird a fixture of sailors' folklore now kills it, on the baited hooks of longline fisheries.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Procellariiformes",
    family: "Diomedeidae",
    genus: "Diomedea",
    species: "Diomedea exulans",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate: "Around 20,000 mature individuals, concentrated on a handful of subantarctic islands",
    note: "Listed as Vulnerable, with incidental capture in longline fisheries the dominant cause of decline. The South Georgia population is one of a small number identified as a global priority under the Agreement on the Conservation of Albatrosses and Petrels. Several forms once grouped under this name — the Tristan, Antipodean and Amsterdam albatrosses — are now treated as separate species and assessed separately.",
  },

  measurements: [
    {
      key: "wingspan",
      label: "Wingspan",
      value: "251–350 cm; largest verified 363 cm",
      min: 251,
      max: 363,
      unit: "cm",
      note: "The 3.63 m record is a male measured aboard the USNS Eltanin in the Tasman Sea in 1965; larger claims exist but are unverified",
    },
    {
      key: "body-length",
      label: "Body length",
      value: "107–135 cm",
      min: 107,
      max: 135,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "6–12 kg",
      min: 6,
      max: 12,
      unit: "kg",
      note: "Averages around 8 kg; males are heavier than females",
    },
    {
      key: "migration-distance",
      label: "Distance covered a year",
      value: "Over 120,000 km",
      min: 0,
      max: 120000,
      unit: "km",
      note: "Some tracked birds circumnavigate the Southern Ocean three times in a year",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "About 1 m",
      min: 0,
      max: 1,
      unit: "m",
      note: "Almost everything is seized at the surface, which is exactly why baited longline hooks are so lethal",
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
      key: "incubation",
      label: "Incubation",
      value: "About 78 days",
      min: 74,
      max: 85,
      unit: "days",
      note: "Shared by both parents in long shifts",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "Seven to ten months in the nest",
      min: 240,
      max: 300,
      unit: "days",
    },
    {
      key: "sexual-maturity",
      label: "Age at first breeding",
      value: "About 10 years",
      min: 9,
      max: 11,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Over 50 years",
      min: 50,
      max: 60,
      unit: "years",
      note: "Individuals of more than 60 have been recorded from long-running banding studies",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — squid, fish and carrion taken at the surface", icon: "Fish" },
    { key: "activity", label: "Activity", value: "Feeds largely at night, when squid rise towards the surface", icon: "Moon" },
    { key: "nest-type", label: "Nest type", value: "Raised mound of mud and vegetation on an exposed island slope", icon: "Home" },
    { key: "breeding-season", label: "Breeding season", value: "Every second year — a single cycle takes over a year", icon: "Calendar" },
    { key: "social-structure", label: "Social structure", value: "Lifelong pair bond; loose colonies on island slopes", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "Circumpolar in the Southern Ocean", icon: "Globe" },
  ],

  highlights: ["wingspan", "weight", "migration-distance", "lifespan"],

  distribution: {
    continents: ["Antarctica", "Africa", "South America", "Australia"],
    regions: [
      "South Georgia",
      "Prince Edward and Marion Islands",
      "Crozet Islands",
      "Kerguelen",
      "Macquarie Island",
    ],
    habitats: ["Open ocean", "Subantarctic island tussock slopes"],
    elevation: "Sea level; forages within a metre of the surface",
    note: "Breeds on a small number of subantarctic islands and forages across the whole Southern Ocean, ranging north into subtropical waters outside the breeding season. Birds from a single colony have been tracked from the South Atlantic to Australian waters and back within one foraging season.",
  },

  sections: [
    {
      id: "flight",
      title: "Dynamic soaring",
      body: [
        "Wind over the Southern Ocean does not blow evenly. Friction slows it near the water, so there is a gradient between the surface and a few tens of metres up. An albatross exploits that gradient: it climbs into the faster air, turns downwind, gains speed, then drops back into the slower air near the surface and turns again, harvesting a little energy on each cycle. The result is a repeating arc across the swell that costs almost nothing.",
        "The wings are built for it — extremely long, extremely narrow, and locked out straight by a sheet of tendon that holds them extended without muscular effort, so a soaring albatross uses barely more energy than one sitting on its nest. What the design cannot do is flap efficiently or take off from flat calm, which is why an albatross on a windless day may simply sit on the water and wait.",
        "The reach that buys is extraordinary. Tracking has shown single foraging trips of thousands of kilometres, birds crossing entire ocean basins between meals, and individuals circling Antarctica three times in one year.",
      ],
    },
    {
      id: "feeding",
      title: "Feeding at the surface",
      body: [
        "The wandering albatross feeds mainly on squid, with fish and carrion making up the rest. It takes almost all of it from the surface or from within about a metre of it — this is not a diving bird — and it feeds heavily at night, when squid move upwards through the water column.",
        "A salt gland above the nasal passage lets it drink seawater: the concentrated brine is excreted through the nostrils, which is why the neck feathers of some birds are stained. That single adaptation is what makes a life entirely out of sight of fresh water possible.",
        "Albatrosses have long followed ships for galley waste and fisheries discards, a habit that shaped their reputation among sailors and their place in Coleridge's poem. It is also the behaviour that has proved most dangerous to them.",
      ],
    },
    {
      id: "breeding",
      title: "One chick every two years",
      body: [
        "Pairs form after years of courtship — an elaborate, noisy display of spread wings, bill-clapping and sky-pointing — and then stay together for life. Divorce is rare enough to be notable when it happens.",
        "The cycle is slow beyond almost any other bird's. A single egg is laid on a raised mound of mud and vegetation and incubated for about 78 days, the parents alternating in long shifts. The chick then sits on that mound through a subantarctic winter, fed at long intervals on regurgitated squid oil, and does not fledge for seven to ten months. Because the whole cycle takes more than a year, successful pairs breed only every second year.",
        "Young birds then spend years at sea before coming back to land, and do not breed until around ten. A pair that raises a chick every other year from age ten needs a very long life to replace itself — which is the arithmetic that makes adult mortality so damaging.",
      ],
    },
    {
      id: "threats",
      title: "Longlines",
      body: [
        "A pelagic longline can run for tens of kilometres and carry thousands of baited hooks. As the line is set, the baits sit within reach of the surface for long enough for a following seabird to seize one, and an albatross that swallows a hook is dragged under and drowned.",
        "This is the central threat to the species, and it acts on exactly the wrong part of the population: adult breeders, the individuals a slow-breeding bird can least afford to lose. Wandering albatrosses at South Georgia have declined severely, and the population there is one of a small group flagged as a global priority by the Agreement on the Conservation of Albatrosses and Petrels.",
        "Mitigation is well understood and demonstrably works — weighted lines that sink baits quickly, bird-scaring streamer lines, and setting at night when fewer birds are foraging. Fleets that adopt them cut seabird bycatch dramatically. The difficulty is coverage: the birds range across the jurisdictions of many fisheries, and uptake outside well-regulated ones remains patchy.",
        "On land the pressures are smaller but real. Introduced rats, cats, mice and pigs on some breeding islands take eggs and chicks, and eradication programmes on subantarctic islands are a major part of the recovery effort.",
      ],
    },
    {
      id: "names",
      title: "One name, several species",
      body: [
        "'Wandering albatross' has long been used loosely. What was once treated as a single wide-ranging species is now generally split: the Tristan albatross of Gough Island, the Antipodean albatross of the New Zealand subantarctic and the Amsterdam albatross of the southern Indian Ocean are recognised as distinct, leaving Diomedea exulans — increasingly called the snowy albatross — as one member of a complex.",
        "The split matters for conservation rather than for pedantry. Each of those populations is small, breeds on a different island group, faces a different set of fisheries, and is assessed separately, so lumping them would hide the ones in the steepest trouble.",
        "It also means older records need care. Historical photographs and specimens labelled 'wandering albatross' from places such as the Antipodes Islands refer to birds that are now assigned to a different species.",
      ],
    },
  ],

  related: ["atlantic-puffin", "andean-condor", "emperor-penguin"],
  tags: ["seabird", "albatross", "marine", "southern ocean", "largest wingspan"],
  searchTerms: ["diomedea exulans", "snowy albatross", "biggest wingspan", "goonie", "albatross"],

  faqs: [
    {
      q: "How big is a wandering albatross's wingspan?",
      a: "Usually between about 2.5 and 3.5 metres, which is the largest of any living bird. The biggest reliably measured individual — a male caught aboard the research ship USNS Eltanin in the Tasman Sea in 1965 — spanned 3.63 metres. Larger figures are sometimes quoted, but they are not verified.",
    },
    {
      q: "How far can a wandering albatross fly?",
      a: "Some tracked birds cover more than 120,000 kilometres in a year, circling the Southern Ocean up to three times. Single foraging trips run to thousands of kilometres. It is possible because the bird uses dynamic soaring — repeatedly climbing into faster wind above the waves and diving back down — so it can travel for hours with almost no flapping.",
    },
    {
      q: "How long do wandering albatrosses live?",
      a: "More than 50 years, and long-running banding studies have recorded individuals past 60. They pair for life, do not breed until about ten years old, and then raise a single chick only every second year — which is why losing adult birds to fishing gear does so much damage.",
    },
    {
      q: "Why are wandering albatrosses endangered by fishing?",
      a: "They feed at the surface and follow boats, so when a longline is set they take the baited hooks, are dragged under and drown. Because the birds killed are mostly breeding adults and the species replaces itself very slowly, the losses compound. Weighted lines, bird-scaring streamers and setting hooks at night reduce the toll sharply where they are used.",
    },
    {
      q: "Is the snowy albatross the same as the wandering albatross?",
      a: "Yes — snowy albatross is the name increasingly used for Diomedea exulans specifically. It was once treated as one wide-ranging species, but the Tristan, Antipodean and Amsterdam albatrosses are now recognised as separate, so 'wandering albatross' is sometimes used for the whole complex and sometimes for this species alone.",
    },
  ],

  seo: {
    title: "Wandering Albatross — Wingspan, Flight, Breeding & Threats",
    description:
      "A researched profile of the wandering albatross (Diomedea exulans): the largest wingspan of any living bird at 3.63 m verified, dynamic soaring, biennial breeding and the longline bycatch driving its decline.",
    keywords: [
      "wandering albatross facts",
      "diomedea exulans",
      "largest wingspan bird",
      "snowy albatross",
      "albatross longline bycatch",
    ],
  },

  sources: [
    {
      label: "Diomedea exulans — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22698305/132640680",
    },
    {
      label: "Largest wingspan for a living bird species",
      publisher: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/world-records/69469-largest-wingspan-of-any-living-species-of-bird",
    },
    {
      label: "Wandering albatross species page",
      publisher: "The Australian Museum",
      url: "https://australian.museum/learn/animals/birds/wandering-albatross/",
    },
    {
      label: "Diomedea exulans species account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Diomedea_exulans/",
    },
    {
      label: "Wandering albatross species assessment",
      publisher: "Agreement on the Conservation of Albatrosses and Petrels",
      url: "https://www.acap.aq/acap-species/304-wandering-albatross/file",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default wanderingAlbatross;
