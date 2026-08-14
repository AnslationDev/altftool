// Common raven — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const commonRaven = {
  slug: "common-raven",
  category: "birds",
  name: "Common Raven",
  scientificName: "Corvus corax",
  otherNames: ["Northern raven", "Korp"],

  summary:
    "The largest songbird in the world, spread across the whole Northern Hemisphere, and the subject of a body of cognition research that is genuinely remarkable and routinely overstated.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Corvus_corax_clarionensis%2C_Point_Reyes_National_Seashore.jpg/1920px-Corvus_corax_clarionensis%2C_Point_Reyes_National_Seashore.jpg",
    alt: "A common raven calling with its bill open, showing shaggy throat feathers, at Point Reyes National Seashore in California",
    credit: "Frank Schulenburg / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Common_raven_%28Corvus_corax%29_in_flight_Uckermark.jpg/1920px-Common_raven_%28Corvus_corax%29_in_flight_Uckermark.jpg",
      alt: "A common raven in flight over the Uckermark region of Germany, wings spread and wedge-shaped tail visible",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "The wedge tail tells it apart",
      caption:
        "In flight the raven shows a distinctly wedge-shaped tail, where a carrion crow's is squared off. Ravens also soar and tumble in a way crows rarely bother with, and roll upside down in flight apparently for no reason at all.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Raven_%28Corvus_corax%29_atop_a_Joshua_tree_%2850731219031%29.jpg/1920px-Raven_%28Corvus_corax%29_atop_a_Joshua_tree_%2850731219031%29.jpg",
      alt: "A raven perched alertly on top of a Joshua tree branch in Joshua Tree National Park",
      credit: "Joshua Tree National Park / Wikimedia Commons",
      title: "At home in the desert too",
      caption:
        "The raven's range runs from Arctic tundra to the deserts of North Africa and the American southwest, and it has been recorded at 6,350 m on Mount Everest. Few birds tolerate that breadth of conditions.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Raven_%28Corvus_corax%29_atop_a_Joshua_tree_%2850731219176%29.jpg/1920px-Raven_%28Corvus_corax%29_atop_a_Joshua_tree_%2850731219176%29.jpg",
      alt: "A raven grooming itself while perched on a Joshua tree branch",
      credit: "Joshua Tree National Park / Wikimedia Commons",
      title: "Bigger than it looks",
      caption:
        "A common raven weighs up to 2.25 kg with a wingspan reaching 1.53 m. It is the largest passerine — the largest songbird — in the world, roughly buzzard-sized rather than crow-sized.",
    },
  ],

  headline: "The largest songbird, and one of the smartest",
  intro: [
    "The common raven is a passerine: taxonomically a songbird, sitting in the same order as sparrows and thrushes. It is also the size of a buzzard, weighing up to 2.25 kg with a wingspan reaching 1.53 m, which makes it the largest songbird alive. It holds one of the biggest ranges of any bird, spanning the Holarctic from Arctic tundra to North African desert.",
    "It is best known for its cognition, and this is where care is needed. The experimental record on ravens is substantial and specific — cache protection that tracks whether a competitor could have seen them, planning for tool use hours ahead, spatial memory used to anticipate where wolves will make a kill. It is also frequently flattened in popular writing into claims like 'as smart as a seven-year-old child', which no study supports and which the researchers themselves do not make.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Passeriformes",
    family: "Corvidae",
    genus: "Corvus",
    species: "Corvus corax",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2017,
    populationTrend: "increasing",
    populationEstimate:
      "Roughly 16 million globally, including 611,000–1,160,000 pairs in Europe",
    note: "Least Concern with an increasing population and an extremely large range. Ravens were persecuted heavily across much of Europe and North America as vermin, and disappeared from many lowland regions; they have recolonised widely since that persecution eased. In parts of the American southwest, raven numbers subsidised by human waste and water have become a management concern for desert tortoise populations they prey on.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "54–71 cm",
      min: 54,
      max: 71,
      unit: "cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "116–153 cm",
      min: 116,
      max: 153,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "0.69–2.25 kg",
      min: 0.69,
      max: 2.25,
      unit: "kg",
      note: "Varies strongly by region — Californian birds average around 0.78 kg, Nova Scotian birds around 1.23 kg",
    },
    {
      key: "vocal-repertoire",
      label: "Vocal repertoire",
      value: "15–30 distinct categories of call recorded",
      note: "Includes the deep prruk-prruk-prruk, a knocking toc-toc-toc, a dry kraa and a guttural rattle. Ravens also mimic environmental sounds and, in captivity, human speech.",
    },
    {
      key: "flight-altitude",
      label: "Highest recorded",
      value: "6,350 m on Mount Everest",
      min: 0,
      max: 6350,
      unit: "m",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "4–6 eggs, rarely 2–7",
      min: 2,
      max: 7,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "18–21 days",
      min: 18,
      max: 21,
      unit: "days",
      note: "By the female alone, while the male brings food",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "35–49 days",
      min: 35,
      max: 49,
      unit: "days",
      note: "Young stay with their parents for around six months after leaving the nest",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "10–15 years in the wild",
      min: 10,
      max: 15,
      unit: "years",
      note: "The longest banded wild record is 23 years and 3 months; captive ravens at the Tower of London have passed 40",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore and opportunist — carrion, small animals, eggs, insects, grain, refuse", icon: "Utensils" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "Bulky stick nest on a cliff ledge, tall tree or structure", icon: "TreePine" },
    { key: "social-structure", label: "Social structure", value: "Territorial adult pairs; unpaired juveniles roam and roost in flocks", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Generalist scavenger and nest predator", icon: "Recycle" },
  ],

  highlights: ["wingspan", "weight", "vocal-repertoire", "lifespan"],

  distribution: {
    continents: ["Africa", "Asia", "Europe", "North America"],
    regions: [
      "Arctic North America and Eurasia",
      "Western North America and Mexico",
      "Europe, especially uplands and coasts",
      "North Africa and the Middle East",
      "The Himalaya and Central Asia",
    ],
    habitats: [
      "Tundra",
      "Mountains and sea cliffs",
      "Boreal and temperate forest",
      "Desert",
      "Farmland and towns",
    ],
    elevation: "Sea level to 6,350 m, the highest recorded on Everest",
    note: "One of the widest ranges of any bird and the largest of any Corvus. Ravens occupy Arctic tundra, mountain ranges, coastlines, boreal forest, deserts and increasingly towns. In much of Europe they were pushed out of the lowlands by centuries of persecution and have been steadily moving back in as that pressure eased.",
  },

  sections: [
    {
      id: "cognition",
      title: "What the cognition research actually shows",
      body: [
        "The strongest result concerns caching. Ravens hide food and steal each other's caches, so hiding it unobserved matters. In a 2016 experiment published in Nature Communications, Thomas Bugnyar, Stephan Reber and Cameron Buckner tested ravens in a room with a peephole into an adjacent room. When the peephole was open and the birds heard the sounds of a conspecific next door, they guarded their caches; when the peephole was closed, the same sounds produced no such response. The birds had previously experienced looking through that peephole themselves. The finding is that ravens can generalise from their own perceptual experience to infer that they might be seen — without needing to see the competitor at all.",
        "A 2017 paper in Science by Can Kabadayi and Mathias Osvath reported ravens selecting a tool, or a token for bartering, and holding on to it for a reward available up to 17 hours later, choosing correctly over immediate but lesser alternatives. Their performance on these tasks matched what apes do. This result is genuinely contested: a commentary in the same journal argued the data are also consistent with domain-general associative learning rather than mental time travel, and that dispute has not been resolved.",
        "A 2020 study in Scientific Reports by Simone Pika and colleagues tested eight hand-raised ravens at four, eight, twelve and sixteen months across spatial memory, object permanence, quantity, causality, social learning, communication and theory-of-mind tasks. Performance was already comparable to adult great apes at four months, and barely changed afterwards — raven cognitive development is fast and largely complete very early.",
        "None of this supports the popular framing of ravens as equivalent to a young human child. What the literature shows is a bird performing at ape level on a specific battery of comparative tasks, which is a precise and much more interesting claim.",
      ],
    },
    {
      id: "wolves",
      title: "Ravens and wolves",
      body: [
        "Ravens are strongly associated with wolves. They arrive at kills, feed alongside the pack, and can strip a substantial share of a carcass. The long-standing explanation, from work in the early 2000s, was that ravens follow wolves in order to find kills.",
        "A study published in Science in March 2026 tested this directly. Matthias-Claudio Loretto and colleagues GPS-tagged 69 ravens and tracked 20 collared wolves in Yellowstone over two and a half years. The birds were not shadowing the packs. Instead they returned repeatedly to specific parts of the landscape where wolf kills cluster — flat valley bottoms where hunting succeeds — flying directly towards those areas, sometimes covering up to 155 km in a day.",
        "The mechanism is spatial memory rather than pursuit: ravens have learned where carcasses tend to appear and go there. It is a good example of a well-established behavioural story being overturned once the tracking technology became good enough to test it.",
      ],
    },
    {
      id: "diet",
      title: "Diet and opportunism",
      body: [
        "Ravens eat almost anything. Carrion is the core of it — the species is a specialist at finding dead animals and is often the first scavenger at a carcass — supplemented by small mammals, amphibians, insects, the eggs and nestlings of other birds, grain, fruit and human refuse.",
        "Because they cannot open a large carcass themselves, ravens depend on something else breaking the hide: a wolf, a bear, a vehicle, or simply decay. That dependence is why the association with large predators developed, and why ravens do so well along roads.",
        "Caching is central to their food economy. Surplus food is hidden and retrieved later, ravens watch each other cache, and they pilfer. That competitive pressure over stored food is the ecological context in which their most striking cognitive abilities have been demonstrated.",
      ],
    },
    {
      id: "breeding",
      title: "Pairs, flocks and voice",
      body: [
        "Adult ravens hold territories in long-term pairs and defend them year-round. Non-breeding juveniles live differently: they range widely, gather at food sources in groups and roost communally, which gives them safety in numbers against the territorial adults whose ground they are feeding on.",
        "The nest is a large stick platform on a cliff ledge, in a tall tree, or on a building or pylon. Four to six eggs are usual, incubated for 18 to 21 days by the female alone while the male provisions her. Young fledge at five to seven weeks and stay with their parents for around another six months.",
        "The voice is exceptionally varied — between 15 and 30 categories of call have been recorded, from the deep carrying prruk-prruk-prruk to knocking and rattling notes. Ravens mimic sounds from their surroundings, and captive birds learn to reproduce human speech convincingly, which is a large part of how the species acquired its place in mythology.",
      ],
    },
  ],

  related: ["common-ostrich", "peregrine-falcon", "barn-owl", "scarlet-macaw"],
  tags: ["corvid", "songbird", "intelligence", "scavenger", "holarctic"],
  searchTerms: ["raven", "corvus", "crow vs raven", "smartest bird", "corvid intelligence"],

  faqs: [
    {
      q: "What is the difference between a raven and a crow?",
      a: "Size and shape, mainly. A common raven is far bigger — up to 2.25 kg with a wingspan to 1.53 m, against roughly 0.5 kg for a carrion crow. In flight the raven's tail is clearly wedge-shaped where a crow's is squared off, and the raven has a heavier bill and shaggy throat feathers. The calls differ too: a deep resonant croak rather than a crow's flatter caw.",
    },
    {
      q: "Are ravens really as intelligent as a seven-year-old child?",
      a: "No study supports that comparison and researchers in the field do not make it. What the evidence does show is that ravens perform at the level of adult great apes on a standard battery of comparative cognition tasks — a 2020 study found this was already true at four months old — and that they protect food caches based on inferences about whether a competitor could have seen them. Those are precise findings about specific abilities, not a general IQ equivalence with a human child.",
    },
    {
      q: "Can ravens plan for the future?",
      a: "This is the most contested claim in the field. A 2017 Science paper reported ravens selecting a tool or a bartering token for a reward available up to 17 hours later, performing comparably to apes. A commentary in the same journal argued the results are also consistent with associative learning rather than genuine mental time travel. The dispute is unresolved, so the honest answer is that ravens pass the tasks but the interpretation is still argued over.",
    },
    {
      q: "Do ravens follow wolves to find food?",
      a: "Not according to the best current evidence. A 2026 study in Science tracked 69 GPS-tagged ravens and 20 collared wolves in Yellowstone for two and a half years and found that ravens do not shadow packs. They use spatial memory instead, returning to the parts of the landscape where wolf kills reliably occur and flying directly there — up to 155 km in a single day. This overturned the earlier following hypothesis.",
    },
    {
      q: "Can ravens talk?",
      a: "They can mimic, and captive ravens reproduce human speech clearly — often more clearly than a parrot. Wild ravens mimic sounds from their environment instead. Between 15 and 30 distinct categories of natural call have been catalogued for the species.",
    },
    {
      q: "How long do ravens live?",
      a: "Typically 10 to 15 years in the wild, with a longest banded record of 23 years and 3 months. Captive birds do far better — ravens kept at the Tower of London have lived more than 40 years.",
    },
  ],

  seo: {
    title: "Common Raven — Intelligence, Size, Calls & Range",
    description:
      "A researched profile of the common raven (Corvus corax): the largest songbird in the world, what the cognition studies actually demonstrate, the wolf-kill tracking result, and how to tell a raven from a crow.",
    keywords: [
      "common raven facts",
      "corvus corax",
      "raven vs crow",
      "raven intelligence research",
      "largest songbird",
    ],
  },

  sources: [
    {
      label: "Corvus corax — Red List assessment (2017)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22706068/113271893",
    },
    {
      label: "Ravens attribute visual access to unseen competitors",
      publisher: "Bugnyar, Reber & Buckner, Nature Communications (2016)",
      url: "https://www.nature.com/articles/ncomms10506",
    },
    {
      label: "Ravens parallel great apes in flexible planning for tool-use and bartering",
      publisher: "Kabadayi & Osvath, Science (2017)",
      url: "https://www.science.org/doi/10.1126/science.aam8138",
    },
    {
      label: "Ravens parallel great apes in physical and social cognitive skills",
      publisher: "Pika et al., Scientific Reports (2020)",
      url: "https://www.nature.com/articles/s41598-020-77060-8",
    },
    {
      label: "Ravens anticipate wolf kill sites across broad scales",
      publisher: "Loretto et al., Science (2026)",
      url: "https://www.science.org/doi/10.1126/science.adz9467",
    },
  ],

  updatedAt: "2026-07-29",
};

export default commonRaven;
