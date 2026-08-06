// Ruby-throated hummingbird — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const rubyThroatedHummingbird = {
  slug: "ruby-throated-hummingbird",
  category: "birds",
  name: "Ruby-throated Hummingbird",
  scientificName: "Archilochus colubris",
  otherNames: ["Ruby-throat", "Colibrí garganta rubí"],

  summary:
    "A three-gram bird with a heart that beats over 1,200 times a minute, the only hummingbird that breeds across the whole of eastern North America — and a migrant that can cross the Gulf of Mexico without stopping.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Archilochus_colubris_-flying_-male-8.jpg",
    alt: "A male ruby-throated hummingbird hovering in flight, wings blurred and iridescent red throat catching the light",
    credit: "jeffreyw / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Archilochus_colubris_Illinois_%284578736017%29.jpg",
      alt: "A ruby-throated hummingbird photographed in Illinois, showing metallic green upperparts and a long slender bill",
      credit: "jeffreyw / Wikimedia Commons",
      title: "Colour without pigment",
      caption:
        "The green back and the red throat are structural, not pigmented — microscopic layers in the feathers interfere with light. That is why a male's gorget blazes at one angle and looks black at another.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Archilochus_colubris_LongPoint_OldCut_1.jpg/1920px-Archilochus_colubris_LongPoint_OldCut_1.jpg",
      alt: "A male ruby-throated hummingbird perched at Long Point Provincial Park in Ontario",
      credit: "ZankaM / Wikimedia Commons",
      title: "The northern edge of the range",
      caption:
        "Ontario is near the top of the breeding range, and birds nesting this far north face the longest journey south. Long Point is a well-known migration monitoring site on the north shore of Lake Erie.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Archilochus_colubris_DSC_2571.jpg/1920px-Archilochus_colubris_DSC_2571.jpg",
      alt: "A ruby-throated hummingbird in flight with its wings held out and tail fanned",
      credit: "lwolfartist / Wikimedia Commons",
      title: "Wings that rotate, not flap",
      caption:
        "Hummingbirds generate lift on the upstroke as well as the downstroke by inverting the wing at the shoulder — a figure-eight motion no other bird uses. It is what makes true sustained hovering possible.",
    },
  ],

  headline: "Three grams, and a 1,200-beat heart",
  intro: [
    "The ruby-throated hummingbird weighs between two and six grams — roughly the weight of a small coin — and pays for hovering flight with a metabolism that has almost no margin in it. Its heart can reach 1,260 beats a minute, it takes about 250 breaths a minute even at rest, and in flight it consumes oxygen at something like ten times the rate of an elite human athlete.",
    "It is the only hummingbird that breeds across the whole of eastern North America, and it migrates to Mexico and Central America each autumn. Part of that journey is famous: a non-stop crossing of the Gulf of Mexico, roughly 800 km of open water. It is also more complicated than the story suggests — radio-tracking on the Gulf coast shows that many birds, particularly young ones, go around the coastline instead.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Apodiformes",
    family: "Trochilidae",
    genus: "Archilochus",
    species: "Archilochus colubris",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "long-term increase, but declining since about 2004",
    populationEstimate:
      "Around 34–36 million birds across the eastern North American breeding range",
    note: "Least Concern and the most numerous hummingbird in North America. The trend needs both halves stated: Breeding Bird Survey data show increases of more than 25% per decade over four decades, a total rise of over 150%, but a 2021 analysis of contrasting North American hummingbird trends found ruby-throats declining across most of their breeding range since roughly 2004. Like all hummingbirds, the species is listed on CITES Appendix II.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "7–9 cm",
      min: 7,
      max: 9,
      unit: "cm",
      note: "The bill alone reaches 2 cm of that",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "8–11 cm",
      min: 8,
      max: 11,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "2–6 g",
      min: 2,
      max: 6,
      unit: "g",
      note: "Males average about 3.4 g and females about 3.8 g; birds preparing to migrate can nearly double their fat mass",
    },
    {
      key: "wingbeat-rate",
      label: "Wingbeat rate",
      value: "About 53 beats per second when hovering",
      min: 53,
      max: 80,
      unit: "beats/second",
      note: "Rises during manoeuvring and courtship display flights, with figures up to 80 per second reported",
    },
    {
      key: "heart-rate",
      label: "Heart rate",
      value: "Up to 1,260 beats per minute",
      min: 0,
      max: 1260,
      unit: "bpm",
      note: "Breathing runs at about 250 breaths per minute even at rest",
    },
    {
      key: "migration-distance",
      label: "Gulf of Mexico crossing",
      value: "About 800 km non-stop, in roughly 20 hours",
      min: 800,
      max: 800,
      unit: "km",
      note: "Made by some birds; many others follow the coastline around the Gulf instead",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "2 eggs, occasionally 1 or 3",
      min: 1,
      max: 3,
      unit: "eggs",
      note: "Each egg is about 12.9 mm by 8.5 mm — around the size of a small pea",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "12–14 days",
      min: 12,
      max: 14,
      unit: "days",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "18–22 days",
      min: 18,
      max: 22,
      unit: "days",
      note: "One or two broods a summer",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Oldest banded bird 9 years 1 month",
      note: "Most birds live far less. Individuals older than seven are predominantly female; males rarely survive past five.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Nectar, plus small insects and spiders for protein", icon: "Flower" },
    { key: "activity", label: "Activity", value: "Diurnal, entering torpor on cold nights", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "A walnut-sized cup of plant down and bud scales, bound with spider silk and camouflaged with lichen", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Solitary and territorial; no pair bond beyond mating", icon: "User" },
    { key: "migration", label: "Movement", value: "Long-distance migrant to Mexico and Central America", icon: "Navigation" },
  ],

  highlights: ["weight", "wingbeat-rate", "heart-rate", "migration-distance"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Eastern United States and southern Canada (breeding)",
      "The Gulf coast (migration staging)",
      "Mexico and Central America (wintering)",
      "As far south as Costa Rica and Panama",
    ],
    habitats: [
      "Deciduous and mixed woodland edge",
      "Gardens and parks",
      "Meadows and old fields",
      "Orchards",
      "Tropical dry forest in winter",
    ],
    elevation: "Lowland to moderate elevations",
    note: "The only hummingbird that breeds across the whole of eastern North America, from the Gulf states north into central Canada, and the only one most people east of the Mississippi will ever see. Wintering birds spread through Mexico and Central America, with some reaching Costa Rica and Panama. A small number now winter along the Gulf coast of the United States rather than leaving at all.",
  },

  sections: [
    {
      id: "metabolism",
      title: "Living at the edge of what a body can do",
      body: [
        "Hovering is the most expensive form of flight there is, and a hummingbird does it continuously while feeding. The ruby-throat's wings beat about 53 times a second in a hover, rising higher during manoeuvring and courtship display, and the wing rotates at the shoulder through a figure-eight so that lift is generated on the upstroke as well as the downstroke — a motion no other bird uses.",
        "The physiology that supports it is extreme. The heart reaches 1,260 beats a minute. Breathing runs at around 250 breaths a minute at rest. Oxygen consumption sits near 4 ml per gram per hour when the bird is doing nothing at all, and in flight the mass-specific rate is roughly ten times what an elite human athlete sustains.",
        "A metabolism that fast cannot be run through a cold night without food. The bird's answer is torpor: it drops its body temperature and metabolic rate dramatically, effectively shutting down until morning. A torpid hummingbird can appear dead and takes time to rouse. Without that mechanism a small hummingbird would burn through its reserves before dawn.",
      ],
    },
    {
      id: "migration",
      title: "The Gulf crossing, and what is actually known about it",
      body: [
        "The best-known claim about this species is that it flies non-stop across the Gulf of Mexico — roughly 800 km of open water, around twenty hours in the air, with nowhere to land, feed or drink. Birds do this. They prepare by feeding heavily beforehand and can nearly double their fat mass, which is what makes a crossing of that length physiologically possible for a three-gram animal.",
        "The complication is that this is not what all of them do. Radio-telemetry work by Theodore Zenzal and Frank Moore at a coastal Alabama stopover site tracked departing hummingbirds and found that 77% of departure orientations paralleled the coastline rather than heading out over the water — that is, most of the birds they tracked were taking an overland route around the Gulf. The individuals concerned were overwhelmingly juveniles.",
        "Adults were rarely caught at that coastal site at all, which led the researchers to suggest experienced migrants may depart over the Gulf from points further inland rather than staging on the coast. One radio-tagged bird from the Alabama site turned up at a feeder in Corpus Christi, Texas two weeks later — consistent with a coastal route rather than a crossing.",
        "So the accurate version is this: the Gulf crossing is real and well attested, it is not the only route, and route choice appears to vary with age and experience. The frequently repeated statement that ruby-throated hummingbirds cross the Gulf non-stop is true of some birds and not others, and the population-level split between the two strategies is still not well quantified.",
      ],
    },
    {
      id: "feeding",
      title: "Nectar, insects and a tongue that pumps",
      body: [
        "Nectar supplies the energy, and the birds show a marked preference for red, orange and bright pink tubular flowers — the shape that fits the bill and excludes most competing pollinators. The relationship is mutual: the flowers concerned are adapted for hummingbird pollination and often have no scent, since hummingbirds hunt by sight.",
        "Nectar contains almost no protein, so the bird cannot live on it. Small insects and spiders make up the rest of the diet, caught in the air or picked off vegetation and webs, and they are essential for growing nestlings.",
        "Feeding is relentless. A bird's energy reserves cover only a matter of hours, which is why hummingbirds defend feeding territories so aggressively against each other and why they will chase birds many times their size away from a good flower patch.",
      ],
    },
    {
      id: "breeding",
      title: "A nest the size of a walnut",
      body: [
        "Ruby-throats form no pair bond. Males display, mate, and take no part in what follows; the female builds, incubates and raises the brood alone.",
        "The nest is a small cup, around the size of a walnut, built on a downward-sloping branch from plant down and bud scales, bound together with spider silk and shingled on the outside with lichen. The silk matters twice: it holds the structure together and it lets the nest stretch as the nestlings grow.",
        "Two eggs are usual, each about 12.9 by 8.5 mm. Incubation runs 12 to 14 days and the young fledge at 18 to 22 days, with one or two broods a summer.",
        "Longevity is modest but not as short as the metabolism suggests: the oldest banded ruby-throat on record was nine years and one month old. Survival is skewed by sex — birds older than seven are predominantly female, and males rarely make it past five.",
      ],
    },
  ],

  related: ["scarlet-macaw", "peregrine-falcon", "common-raven", "greater-flamingo"],
  tags: ["hummingbird", "migration", "pollinator", "north america", "torpor"],
  searchTerms: ["hummingbird", "archilochus", "ruby throat", "hummingbird migration", "smallest bird"],

  faqs: [
    {
      q: "Do ruby-throated hummingbirds really fly non-stop across the Gulf of Mexico?",
      a: "Some do. The crossing is about 800 km of open water and takes roughly twenty hours, and birds prepare by nearly doubling their fat mass. But it is not universal: radio-tracking of departing hummingbirds on the Alabama coast found that 77% of departure orientations followed the coastline rather than heading out to sea, with juveniles in particular taking the overland route around the Gulf. Both strategies exist, and how the population divides between them is still not well quantified.",
    },
    {
      q: "How fast does a hummingbird's heart beat?",
      a: "Up to 1,260 beats a minute in a ruby-throated hummingbird. It also breathes about 250 times a minute at rest, and in flight its oxygen consumption per gram of body weight is roughly ten times that of an elite human athlete. That metabolic rate is why the bird must feed almost constantly and why it enters torpor at night.",
    },
    {
      q: "How many times a second do hummingbird wings beat?",
      a: "Around 53 beats per second when a ruby-throated hummingbird hovers, with higher rates during manoeuvring and courtship display — figures up to 80 per second have been reported. The wing rotates at the shoulder in a figure-eight, generating lift on the upstroke as well as the downstroke, which is what makes true sustained hovering possible.",
    },
    {
      q: "What is torpor and why do hummingbirds use it?",
      a: "Torpor is a controlled drop in body temperature and metabolic rate, close to a nightly hibernation. A hummingbird's energy reserves would not last through a cold night at normal metabolic rates, so it powers down instead. A torpid bird is unresponsive and can appear dead, and needs time to warm back up before it can fly.",
    },
    {
      q: "How long do ruby-throated hummingbirds live?",
      a: "The oldest banded individual on record was nine years and one month old, though most live considerably less. Survival differs sharply by sex: birds older than seven are predominantly female, and males rarely survive past five.",
    },
    {
      q: "Are ruby-throated hummingbirds declining?",
      a: "The answer depends on the window. Breeding Bird Survey data show a long-term increase of more than 25% per decade over four decades — a total rise of over 150%. But a 2021 analysis of North American hummingbird trends found ruby-throats declining across most of their breeding range since about 2004. The species remains Least Concern and numbers around 34 to 36 million birds.",
    },
  ],

  seo: {
    title: "Ruby-throated Hummingbird — Metabolism, Migration & Nesting",
    description:
      "A researched profile of the ruby-throated hummingbird (Archilochus colubris): a 1,260 bpm heart, 53 wingbeats a second, nightly torpor, and what tracking studies really show about the Gulf of Mexico crossing.",
    keywords: [
      "ruby-throated hummingbird facts",
      "archilochus colubris",
      "hummingbird migration gulf of mexico",
      "hummingbird heart rate",
      "hummingbird torpor",
    ],
  },

  sources: [
    {
      label: "Archilochus colubris — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22688193/186910664",
    },
    {
      label: "Stopover biology of Ruby-throated Hummingbirds (Archilochus colubris) during autumn migration",
      publisher: "Zenzal & Moore, The Auk (2016)",
      url: "https://bioone.org/journals/the-auk/volume-133/issue-2/AUK-15-160.1/Stopover-biology-of-Ruby-throated-Hummingbirds-Archilochus-colubris-during-autumn/10.1642/AUK-15-160.1.full",
    },
    {
      label: "Current contrasting population trends among North American hummingbirds",
      publisher: "Scientific Reports (2021)",
      url: "https://www.nature.com/articles/s41598-021-97889-x",
    },
    {
      label: "Ruby-throated Hummingbird — Demography and Populations",
      publisher: "Cornell Lab of Ornithology, Birds of the World",
      url: "https://birdsoftheworld.org/bow/species/rthhum/cur/demography",
    },
  ],

  updatedAt: "2026-07-29",
};

export default rubyThroatedHummingbird;
