// Common toad — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const commonToad = {
  slug: "common-toad",
  category: "amphibians",
  name: "Common Toad",
  scientificName: "Bufo bufo",
  otherNames: ["European toad", "European common toad"],

  summary:
    "Europe's default toad: dry-skinned, slow-walking, poisonous to swallow, and each spring compelled to march back to the pond it was born in — a journey that now runs across roads and kills an estimated twenty tonnes of them a year in Britain alone.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Common_Toad_Cornwall.jpeg/1920px-Common_Toad_Cornwall.jpeg",
    alt: "A common toad in Saltash, Cornwall, olive-brown with warty skin and a golden iris",
    credit: "Tythatguy1312 / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Bufo_bufo_toad.jpg/1920px-Bufo_bufo_toad.jpg",
      alt: "A common toad in a garden in the evening",
      credit: "Rosalie de Kuijer / Wikimedia Commons",
      title: "The gardener's ally",
      caption:
        "A single toad works through a great many slugs, snails and beetles in a summer, hunting after dark and sheltering by day in a shallow scrape or under cover. Gardens with log piles and rough corners keep them; tidy ones do not.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Amphibien_Erdkr%C3%B6te_bufo_bufo_02_%C2%A9_Aquazoo_L%C3%B6bbecke_Museum.jpg/1920px-Amphibien_Erdkr%C3%B6te_bufo_bufo_02_%C2%A9_Aquazoo_L%C3%B6bbecke_Museum.jpg",
      alt: "A common toad photographed during the spring migration in Düsseldorf, Germany",
      credit: "Aquazoo Löbbecke Museum / Wikimedia Commons",
      title: "On the move in spring",
      caption:
        "Toads migrate to their ancestral breeding pond on mild damp nights in early spring, following the same route year after year. Where that route crosses a road, the whole population crosses it too.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Au1200kroetebufobufo2018c85.jpg/1920px-Au1200kroetebufobufo2018c85.jpg",
      alt: "A common toad photographed in Austria at about 1,200 metres altitude",
      credit: "Fentriss / Wikimedia Commons",
      title: "Not only a lowland animal",
      caption:
        "This toad was photographed at around 1,200 m in the Austrian mountains. The species tolerates a far wider range of conditions than the common frog, which is a large part of why it occupies almost the whole of Europe.",
    },
  ],

  headline: "Twenty tonnes a year, crossing the road",

  intro: [
    "The common toad is the amphibian most Europeans could describe without ever having looked closely at one: squat, warty, greyish-brown, with a horizontal pupil in a coppery iris and a pair of large parotoid glands sitting behind the eyes like swollen shoulders. It walks rather than leaps, it is out only after dark, and it spends the daylight hours lying up in a shallow scrape under cover.",
    "It is also one of the most reliably migratory animals in Europe. On the first mild, damp nights of spring, whole populations set off for the pond they were born in, following the same routes they used the year before and the year before that, sometimes over more than a kilometre. That fidelity is the species' defining behaviour and its central problem: the routes were established long before the roads were, and the toads have not revised them.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Bufonidae",
    genus: "Bufo",
    species: "Bufo bufo",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2009,
    populationTrend: "stable",
    populationEstimate: "Abundant across almost all of Europe; no global count",
    note: "The global assessment dates from 2008 and records a stable population across a very large range — but the regional data collected since tell a different story. A 2016 analysis of volunteer toad-patrol counts found British populations declining in every decade from the 1980s onward, at an annual rate implying more than a 30% fall in under ten years, which is the threshold for Vulnerable; the authors concluded the species came close to qualifying for red-listing despite the volunteer effort. Swiss populations declined in three of four decades measured. Italy's national red list assesses the species as Vulnerable. The global status is old, and it is doing a lot of work.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "Males to about 8 cm, females to 13 cm",
      min: 8,
      max: 13,
      unit: "cm",
      note: "Snout to vent. Females are much the larger sex, and continental animals can approach 15 cm.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 80 g",
      min: 80,
      max: 80,
      unit: "g",
      note: "Females are far heavier than males, and a gravid female heavier again.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 10–12 years in the wild",
      min: 10,
      max: 12,
      unit: "years",
      note: "A captive toad is recorded at 40 years in the AnAge longevity database.",
    },
    {
      key: "clutch-size",
      label: "Spawn per female",
      value: "About 1,500 eggs, up to 5,000",
      min: 1500,
      max: 5000,
      unit: "eggs",
      note: "Laid as a double row inside a gelatinous string three to four and a half metres long, wound around submerged plants.",
    },
    {
      key: "tadpole-stage",
      label: "Tadpole stage",
      value: "About 16 weeks",
      min: 12,
      max: 16,
      unit: "weeks",
      note: "Eggs hatch after two to four weeks; toadlets leave the water in early summer, usually after rain.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "3–7 years",
      min: 3,
      max: 7,
      unit: "years",
      note: "AnAge gives about four years for both sexes; males generally mature earlier than females.",
    },
    {
      key: "road-mortality",
      label: "Killed on UK roads each year",
      value: "About 20 tonnes",
      min: 20,
      max: 20,
      unit: "tonnes",
      note: "An estimate quoted by The Wildlife Trusts. In weight rather than in numbers, because nobody can count them.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — slugs, snails, worms, beetles, ants and spiders; large females take small vertebrates",
      icon: "Drumstick",
    },
    {
      key: "activity",
      label: "Activity",
      value: "Nocturnal; lies up by day in a shallow scrape or under cover",
      icon: "Moon",
    },
    {
      key: "skin-toxin",
      label: "Defence",
      value: "Bufotoxins from the parotoid glands, plus an inflated, hindquarters-raised stance",
      icon: "Biohazard",
    },
    {
      key: "breeding-migration",
      label: "Breeding migration",
      value: "Returns to the same ancestral pond each spring, by the same route",
      icon: "MapPin",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — deeper, more permanent ponds than the common frog will use",
      icon: "Droplet",
    },
  ],

  highlights: ["length", "road-mortality", "skin-toxin", "breeding-migration"],

  distribution: {
    continents: ["Europe", "Asia", "Africa"],
    regions: [
      "Almost all of mainland Europe, and mainland Britain",
      "Absent from Ireland, Iceland, parts of Scandinavia and several Mediterranean islands",
      "Western North Asia",
      "A small part of north-west Africa",
    ],
    habitats: [
      "Woodland, scrub and coarse grassland",
      "Gardens, hedgerows and farmland",
      "Deeper permanent ponds, reservoirs and village ponds for breeding",
    ],
    elevation: "Sea level to well over 1,000 m in the Alps",
    note: "Several forms once treated as subspecies are now recognised as separate species — the spiny toad of France and Iberia and the Caucasian toad among them — so older range maps for Bufo bufo are wider than the current species. It is absent from Ireland, where the natterjack is the only native toad.",
  },

  sections: [
    {
      id: "not-a-frog",
      title: "Toad, not frog",
      body: [
        "The differences are easy once you know them. A toad's skin is dry, thick and covered in warty lumps rather than smooth and moist. Its hind legs are short, so it walks or makes brief hops instead of leaping. The pupil is horizontal, set in a coppery or golden iris. And behind each eye sits a large kidney-shaped parotoid gland, which the common frog does not have.",
        "That thicker, drier skin buys the toad freedom. Frogs lose water through the skin quickly and have to stay near damp cover; toads can range across dry ground, occupy drier habitats and stay out longer. It is a large part of why Bufo bufo occupies almost all of Europe and turns up in gardens, quarries, dunes and mountain pasture alike.",
        "It also breeds differently. Toads use deeper, more permanent water than frogs — village ponds, reservoirs, farm ponds — and lay strings rather than clumps. Common frog spawn is a floating raft of jelly; common toad spawn is a double row of black eggs inside a gelatinous rope up to four and a half metres long, wound around submerged stems. Finding one or the other in a pond identifies the animal without seeing it.",
      ],
    },
    {
      id: "poison",
      title: "What the glands are for",
      body: [
        "The parotoid glands behind a toad's eyes, and the warts across its back, secrete a mixture of bufotoxins — a foul-tasting, irritant cocktail that includes bufagin. It is a deterrent rather than a weapon: a toad does not spray or inject anything, and it is entirely safe to have in a garden or to pick up carefully. The chemistry only matters if something bites it.",
        "It matters a great deal to dogs, which do bite. A dog that mouths a toad typically foams, drools heavily and paws at its face; in most European cases this passes, though it warrants a vet. The tadpoles carry the defence too, which is why toad tadpoles can shoal in open water in daylight where frog tadpoles would be picked off.",
        "The behaviour that goes with the chemistry is worth watching for. A threatened toad inflates its body with air, straightens its legs and raises its hindquarters so that it looks larger and presents the glandular back to whatever is above it. Some predators have worked around all of this: grass snakes eat toads regularly, and hooded crows and some other birds have learned to open a toad and eat it from the underside, avoiding the skin entirely.",
      ],
    },
    {
      id: "migration",
      title: "The spring migration",
      body: [
        "Common toads spend most of the year dispersed across woodland and rough ground, often more than a kilometre from any water. In late winter and early spring, on the first mild damp nights, they all set off at once for the pond where they bred before — and in most cases where they were spawned.",
        "The fidelity is remarkable and inconvenient. Toads return to the same water body year after year and use the same overland routes to get there, even when the pond has been filled in or the route now crosses a carriageway. Males arrive first and wait; a male that finds a female clasps her behind the front legs in amplexus and is carried the rest of the way, sometimes contested by several rivals at once in a wrestling knot.",
        "Where a road cuts a migration route the result is predictable. The Wildlife Trusts put the annual toll on British roads at around twenty tonnes of toads — expressed by weight because the numbers are beyond counting. The response has been one of the largest volunteer wildlife efforts in Europe: registered toad patrols work known crossings with buckets and torches on migration nights, carrying animals across and recording what they find. In the UK more than 90,000 adult toads are moved each year across roughly 160 registered sites; in Switzerland some 700,000 amphibians of all species are moved at more than 440 sites.",
      ],
    },
    {
      id: "decline",
      title: "Least Concern, and falling",
      body: [
        "The global Red List assessment for Bufo bufo dates from 2008, lists the species as Least Concern with a stable population, and is flagged on the basis of range, habitat tolerance and presumed abundance. Nothing about it is wrong; it is simply operating at a scale that cannot see what is happening.",
        "Those toad-patrol counts turned out to be a data set. A 2016 analysis of 153 British and 141 Swiss sites with at least five years of records each found British populations declining in every decade from the 1980s onward, at an annual rate of change implying a fall of more than 30 percent in under ten years — the quantitative threshold for Vulnerable. Swiss populations declined in three of the four decades measured. The authors' conclusion was blunt: this common species came close to qualifying for red-listing over the period, despite all the volunteer work.",
        "Road mortality is one driver and not the only one. Breeding ponds have been drained and filled across Europe, migration routes have been cut by roads and development, and the terrestrial habitat that adults need for eleven months of the year has been steadily tidied away. Italy's national red list already assesses the species as Vulnerable, on the grounds of a decline exceeding 30 percent in a decade driven by traffic and breeding-site loss.",
        "What makes the toad a useful case is that the fixes are known and cheap. Keep the pond, keep the rough ground and log piles around it, put an underpass where the migration route meets the road, and turn out on the right nights with a bucket. None of it is difficult. It just has to happen at every crossing, every spring.",
      ],
    },
  ],

  related: ["common-frog", "european-fire-bellied-toad", "cane-toad"],
  tags: ["toad", "europe", "migration", "road mortality", "freshwater", "least concern"],
  searchTerms: [
    "bufo bufo",
    "european toad",
    "toad patrol",
    "toads on roads",
    "common toad vs frog",
    "erdkröte",
  ],

  faqs: [
    {
      q: "How do you tell a common toad from a common frog?",
      a: "A toad has dry, thick, warty skin, short legs it walks on rather than leaps with, a horizontal pupil in a coppery iris, and large parotoid glands behind the eyes. A frog has smooth moist skin, long leaping legs and a dark mask behind the eye. Their spawn is the giveaway too: frogs lay floating clumps, toads lay long gelatinous strings with a double row of eggs.",
    },
    {
      q: "Are common toads poisonous?",
      a: "They are poisonous to eat, not dangerous to handle. The parotoid glands behind the eyes and the warts on the back secrete bufotoxins, an irritant and foul-tasting deterrent. Toads are perfectly safe to have in a garden, but a dog that mouths one will usually foam and drool heavily and should be seen by a vet. Toad tadpoles are toxic too, which is why they can shoal in the open by day.",
    },
    {
      q: "Why do toads cross roads in spring?",
      a: "Because they are migrating to the pond they bred in before, and usually the one they were spawned in. Common toads are strongly faithful to a single breeding site and to the overland route they take to reach it, so they will keep using a route that now crosses a carriageway. The Wildlife Trusts estimate around twenty tonnes of toads are killed on British roads each year.",
    },
    {
      q: "What is a toad patrol?",
      a: "A registered group of volunteers who work a known toad crossing on migration nights, carrying animals across the road in buckets and counting what they find. More than 90,000 adult toads are moved each year across about 160 registered sites in the UK, and around 700,000 amphibians at more than 440 sites in Switzerland. The counts have since become one of the best long-term data sets on amphibian decline in Europe.",
    },
    {
      q: "Is the common toad declining?",
      a: "Yes, even though it is globally listed as Least Concern on a 2009 assessment. Analysis of toad-patrol counts found British populations falling in every decade since the 1980s, at a rate implying more than a 30 percent decline in under ten years, and Swiss populations falling in three of four decades. Italy already assesses the species as Vulnerable nationally. Pond loss, severed migration routes and road mortality are the main causes.",
    },
  ],

  seo: {
    title: "Common Toad — Migration, Toad Patrols, Toxins & Decline",
    description:
      "A researched profile of the common toad (Bufo bufo): why it walks back to the same pond every spring, what its parotoid glands secrete, and why an animal listed as Least Concern is declining across Britain and Switzerland.",
    keywords: [
      "common toad",
      "bufo bufo",
      "toads on roads",
      "toad patrol",
      "common toad vs common frog",
    ],
  },

  sources: [
    {
      label: "Bufo bufo — Red List assessment (2009, e.T54596A11159939)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/54596/11159939",
    },
    {
      label:
        "Volunteer conservation action data reveals large-scale and long-term negative population trends of a widespread amphibian, the common toad",
      publisher: "PLOS ONE",
      url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0161943",
    },
    {
      label: "Common toad — size, weight and road mortality",
      publisher: "The Wildlife Trusts",
      url: "https://www.wildlifetrusts.org/wildlife-explorer/amphibians/common-toad",
    },
    {
      label: "Common toad — species account, spawn and breeding",
      publisher: "Froglife",
      url: "https://www.froglife.org/info-advice/amphibians-and-reptiles/common-toad/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default commonToad;
