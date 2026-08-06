// Andean condor — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const andeanCondor = {
  slug: "andean-condor",
  category: "birds",
  name: "Andean Condor",
  scientificName: "Vultur gryphus",
  otherNames: ["Cóndor andino", "South American condor"],

  summary:
    "The heaviest soaring bird alive, with a wingspan reaching 3.3 m, able to cover 172 km in five hours without flapping once — and now Vulnerable, with fewer than 7,000 mature birds left.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/AndeanCondorMale.jpg/1920px-AndeanCondorMale.jpg",
    alt: "An adult male Andean condor showing the fleshy comb on its crown and the white ruff of feathers around its bare neck",
    credit: "Greg Hume / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Andean_Condor_2015-06-03_%282%29_%2826437794078%29.jpg/1920px-Andean_Condor_2015-06-03_%282%29_%2826437794078%29.jpg",
      alt: "An Andean condor photographed in the Antisana Ecological Reserve in Pichincha Province, Ecuador",
      credit: "Don Henise / Wikimedia Commons",
      title: "The northern condors are nearly gone",
      caption:
        "Ecuador sits at the thin end of the range. Across the whole of northern South America — Ecuador, Colombia and Venezuela — as few as 340 condors may remain, and local extinctions there are the sharpest edge of the species' decline.",
    },
  ],

  headline: "Five hours aloft without a single wingbeat",
  intro: [
    "The Andean condor is the largest flying bird in the world by combined weight and wingspan: males average 12.5 kg and the wings reach 3.3 m across. A bird that heavy cannot afford to flap, and it barely does. Tracking work published in 2020 recorded more than 216 hours of condor flight and found that the birds beat their wings for just 1% of the time in the air — and that over three-quarters of even that was spent getting off the ground.",
    "It is also a scavenger with a very slow life. A pair raises a single chick roughly every second year, birds do not breed until five or six, and one captive male lived to 79. That combination — almost no reproductive surplus, very long lives — means the species cannot absorb adult deaths. It was uplisted from Near Threatened to Vulnerable in 2020, and lead poisoning from ammunition in the carcasses it eats is a central reason why.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Cathartiformes",
    family: "Cathartidae",
    genus: "Vultur",
    species: "Vultur gryphus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2020,
    populationTrend: "decreasing",
    populationEstimate:
      "No more than about 6,700 mature individuals; roughly 10,000 birds of all ages",
    note: "Uplisted from Near Threatened to Vulnerable in 2020 as the scale of decline became clear. The northern part of the range is worst affected — as few as 340 birds may survive across Ecuador, Colombia and Venezuela. It is listed on CITES Appendix I and is the national bird of Bolivia, Chile, Colombia and Ecuador.",
  },

  measurements: [
    {
      key: "wingspan",
      label: "Wingspan",
      value: "Up to 330 cm",
      min: 270,
      max: 330,
      unit: "cm",
      note: "Mean wingspan is around 283 cm — the largest of any land bird",
    },
    {
      key: "body-length",
      label: "Body length",
      value: "100–130 cm",
      min: 100,
      max: 130,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males average 12.5 kg, females 10.1 kg",
      min: 10.1,
      max: 12.5,
      unit: "kg",
      note: "Mean weight across both sexes is about 11.3 kg. Unusually for a bird of prey, the male is the larger sex.",
    },
    {
      key: "soaring-endurance",
      label: "Soaring without flapping",
      value: "172 km in five hours with no wingbeats",
      note: "Across 216 hours of recorded flight, condors flapped for only 1% of the time — and more than 75% of that flapping was during take-off",
    },
    {
      key: "daily-range",
      label: "Daily foraging range",
      value: "Often more than 200 km a day",
    },
    {
      key: "nesting-altitude",
      label: "Nesting altitude",
      value: "Up to 5,000 m",
      min: 0,
      max: 5000,
      unit: "m",
      note: "Nest sites run from sea-level coastal cliffs in Peru and Chile to high Andean ledges",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1 egg, occasionally 2",
      min: 1,
      max: 2,
      unit: "eggs",
      note: "A pair usually breeds only every second year",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "54–58 days",
      min: 54,
      max: 58,
      unit: "days",
      note: "Shared by both parents",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "5–6 years",
      min: 5,
      max: 6,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Over 50 years; 79 in captivity",
      min: 50,
      max: 79,
      unit: "years",
      note: "A captive male named Thaao died in 2010 aged 79 — the greatest verified age known for any bird",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Scavenger — almost entirely carrion", icon: "Bone" },
    { key: "activity", label: "Activity", value: "Diurnal, and dependent on daytime thermals", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "None built — an egg laid on a bare cliff ledge or in a cave", icon: "Mountain" },
    { key: "social-structure", label: "Social structure", value: "Long-term pairs; feeds and roosts in dominance-ordered groups", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Obligate scavenger that removes large carcasses", icon: "Recycle" },
  ],

  highlights: ["wingspan", "weight", "soaring-endurance", "lifespan"],

  distribution: {
    continents: ["South America"],
    regions: [
      "Andes from Venezuela to Tierra del Fuego",
      "Argentina and Chile",
      "Peru and Bolivia",
      "Pacific coastal cliffs",
    ],
    habitats: [
      "High mountains",
      "Alpine grassland (páramo and puna)",
      "Coastal cliffs",
      "Open steppe (Patagonia)",
    ],
    elevation: "Sea level on the Pacific coast to above 5,000 m in the Andes",
    note: "The species follows the Andes for the length of the continent, but the population is not evenly spread along it. Argentina and Chile hold the great majority; the northern countries hold a remnant. Condors need reliable updrafts, which is why they concentrate on mountain ridges and windward coastal cliffs and are almost absent from flat interior country.",
  },

  sections: [
    {
      id: "flight",
      title: "Flight without flapping",
      body: [
        "A soaring bird is limited by the cost of taking off and by how efficiently it can convert rising air into distance. At around 11 kg the Andean condor sits at the practical ceiling for both, and its solution is to almost never flap.",
        "A 2020 study in the Proceedings of the National Academy of Sciences fitted condors with recorders that logged every individual wingbeat across more than 216 hours of flight. The birds flapped for 1% of their airborne time. More than 75% of that flapping was associated with take-off, meaning that once up, a condor is essentially a glider. One bird covered around 172 km over five hours without beating its wings once.",
        "This is why the species is tied so closely to terrain. Condors need thermals or the deflected wind coming off a ridge or a sea cliff, and they wait for the day to warm before leaving a roost. Given the right air they will cover more than 200 km in a day looking for carcasses.",
      ],
    },
    {
      id: "appearance",
      title: "Telling males from females",
      body: [
        "The Andean condor is the only bird of prey with strong sexual dimorphism favouring the male, and the sexes are easy to separate in the field. The male is heavier, carries a large fleshy comb on the crown and a wattle at the throat, and has brown eyes. The female has no comb and has red eyes.",
        "Both sexes share a white ruff of soft feathers at the base of an otherwise bare neck and head. Bare skin is standard equipment for a large scavenger — feathers on the head would carry away carrion with them — and the colour of that skin flushes and changes with the bird's state of arousal.",
        "Adults are black with broad white patches on the upper wing, larger in males. Juveniles are a uniform grey-brown and take years to acquire the adult pattern, which is one reason age structure in wild populations is difficult to survey accurately.",
      ],
    },
    {
      id: "feeding",
      title: "What a condor eats, and why that is dangerous",
      body: [
        "Condors are obligate scavengers. Historically they fed on the carcasses of large wild herbivores — guanaco, vicuña, deer — and on marine mammals washed up along the Pacific coast, where beached carrion supports the coastal population to this day. Domestic livestock now supplies much of the inland diet.",
        "That shift is where the danger lies. Carcasses left by hunters carry lead fragments from ammunition, and lead is cumulative and slow: it does not usually kill a condor outright, it degrades it. Carcasses deliberately laced with pesticide to kill pumas or foxes kill condors as collateral, and because condors feed in groups, a single poisoned animal can kill many birds at once.",
        "A persistent misconception makes it worse. Condors are widely believed to kill live lambs and calves, and are shot and poisoned on that basis, but the species is not equipped to kill — its feet are relatively flat and weak, closer to a chicken's than an eagle's, and it has no grasping talons.",
      ],
    },
    {
      id: "conservation",
      title: "Vulnerable since 2020",
      body: [
        "The IUCN moved the Andean condor from Near Threatened to Vulnerable in 2020. The population is put at no more than about 6,700 mature individuals, with something like 10,000 birds of all ages, and it is declining across the range.",
        "The species' biology makes recovery slow in a way that raw numbers understate. A pair raises one chick roughly every two years, birds do not start breeding until five or six, and the chick depends on its parents well beyond fledging. A population built on very low mortality and very low reproduction collapses quietly when adult deaths rise, and cannot rebuild quickly once they stop.",
        "Reintroduction and rehabilitation programmes operate in Colombia, Argentina and Chile, and captive breeding has supplied birds for release. The reintroduction techniques developed for this species were directly useful to the recovery of its far rarer northern relative, the California condor. Reducing lead ammunition and stopping the poisoning of carcasses remain the interventions that would matter most.",
      ],
    },
  ],

  related: ["golden-eagle", "bald-eagle", "peregrine-falcon", "scarlet-macaw"],
  tags: ["vulture", "scavenger", "south america", "andes", "threatened"],
  searchTerms: ["condor", "vultur", "largest flying bird", "biggest wingspan", "new world vulture"],

  faqs: [
    {
      q: "Does the Andean condor have the largest wingspan of any bird?",
      a: "The largest of any land bird — up to 3.3 m, averaging around 2.83 m. Two seabirds beat it: the wandering albatross and the great white pelican both reach a slightly greater span. But the condor is far heavier than either, which makes it the largest flying bird in the world by combined weight and wingspan.",
    },
    {
      q: "Is the Andean condor endangered?",
      a: "It is assessed as Vulnerable, having been uplisted from Near Threatened in 2020. No more than about 6,700 mature individuals are thought to remain and the population is falling. The northern end of the range is in the worst shape: as few as 340 birds may survive across Ecuador, Colombia and Venezuela.",
    },
    {
      q: "How long can an Andean condor fly without flapping?",
      a: "One tracked bird flew for five hours and around 172 km without a single wingbeat. A 2020 study that recorded every wingbeat across more than 216 hours of flight found condors flapping for only 1% of their time in the air, with more than three-quarters of that during take-off.",
    },
    {
      q: "Do Andean condors kill live animals?",
      a: "Essentially no. They are scavengers and eat carrion. Their feet are flat and weak with blunt claws, not the grasping talons of an eagle, so they are not built to seize or kill prey. The widespread belief that they take lambs and calves is a significant driver of the shooting and poisoning that threatens the species.",
    },
    {
      q: "How can you tell a male Andean condor from a female?",
      a: "The male is larger — averaging 12.5 kg against the female's 10.1 kg — and has a big fleshy comb on his head, a throat wattle, and brown eyes. The female has no comb and has red eyes. This is the reverse of the usual pattern in birds of prey, where the female is normally the bigger bird.",
    },
    {
      q: "How long do Andean condors live?",
      a: "Wild estimates run beyond 50 years, though solid data are scarce. A captive male named Thaao died in 2010 at 79 years old, the greatest verified age known for any bird. Long life is exactly what makes the species fragile: it reproduces so slowly that a population depends on adults surviving year after year.",
    },
  ],

  seo: {
    title: "Andean Condor — Wingspan, Soaring Flight & Conservation",
    description:
      "A researched profile of the Andean condor (Vultur gryphus): a 3.3 m wingspan, flight with wingbeats just 1% of the time, and the lead poisoning behind its 2020 uplisting to Vulnerable.",
    keywords: [
      "andean condor facts",
      "vultur gryphus",
      "largest wingspan bird",
      "andean condor endangered",
      "condor soaring flight",
    ],
  },

  sources: [
    {
      label: "Vultur gryphus — Red List assessment (2020)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22697641/181325230",
    },
    {
      label: "Physical limits of flight performance in the heaviest soaring bird",
      publisher: "Williams et al., Proceedings of the National Academy of Sciences (2020)",
      url: "https://www.pnas.org/doi/10.1073/pnas.1907360117",
    },
    {
      label: "Anthropogenic threats to the Vulnerable Andean Condor in northern South America",
      publisher: "PLOS ONE (2022)",
      url: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0278331",
    },
    {
      label: "Andean Condor species account",
      publisher: "The Peregrine Fund",
      url: "https://peregrinefund.org/explore-raptors-species/vultures/andean-condor",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default andeanCondor;
