// European robin — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const europeanRobin = {
  slug: "european-robin",
  category: "birds",
  name: "European Robin",
  scientificName: "Erithacus rubecula",
  otherNames: ["Robin redbreast", "Robin", "Ruddock"],

  summary:
    "A small, relentlessly territorial songbird that sings all year, follows gardeners for turned earth, and navigates using a light-dependent magnetic compass located in its eye.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Erithacus_rubecula_with_cocked_head.jpg/1920px-Erithacus_rubecula_with_cocked_head.jpg",
    alt: "A European robin perched with its head cocked, orange-red breast and face against grey and brown plumage",
    credit: "Francis C. Franklin / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Crvenda%C4%87%2C_mu%C5%BEjak_%28Erithacus_rubecula%29%3B_European_Robin_male.jpg/1920px-Crvenda%C4%87%2C_mu%C5%BEjak_%28Erithacus_rubecula%29%3B_European_Robin_male.jpg",
      alt: "A European robin photographed in Serbia, perched on a branch with the orange breast facing forward",
      credit: "Nikola Veljković / Wikimedia Commons",
      title: "The breast is a weapon",
      caption:
        "The orange-red front is not courtship plumage — both sexes have it, and it functions as a territorial signal. Robins will attack a bundle of red feathers on a stick, and fights between rivals are occasionally fatal.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2d/20180627Erithacus_rubecula.jpg",
      alt: "A European robin standing on the ground near water in Germany, body upright and eye large and dark",
      credit: "AnRo0002 / Wikimedia Commons",
      title: "Built for low light",
      caption:
        "Robins have unusually large eyes for their size and are among the first birds to sing at dawn and the last at dusk. In lit towns many now sing through the night, which is thought to be a response to daytime noise as much as to the light itself.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/030_European_robin_in_the_Camargue_Photo_by_Giles_Laurent.jpg/1920px-030_European_robin_in_the_Camargue_Photo_by_Giles_Laurent.jpg",
      alt: "A European robin among bare twigs in the Camargue, southern France",
      credit: "Giles Laurent / Wikimedia Commons",
      title: "Winter in the south",
      caption:
        "Robins from Scandinavia and eastern Europe move south and west each autumn, wintering around the Mediterranean and in North Africa. Birds in Britain, France and Iberia are largely resident.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Crvenda%C4%87_%28Erithacus_rubecula%29%3B_European_Robin.jpg/1920px-Crvenda%C4%87_%28Erithacus_rubecula%29%3B_European_Robin.jpg",
      alt: "A European robin perched in woodland vegetation in Serbia",
      credit: "Nikola Veljković / Wikimedia Commons",
      title: "A woodland bird, really",
      caption:
        "The garden robin is a British peculiarity. Across most of continental Europe the same species is a shy, skulking bird of thick woodland cover that rarely comes near people.",
    },
  ],

  headline: "A garden bird with a compass in its eye",
  intro: [
    "The robin is one of the most familiar birds in Europe and one of the least sentimental. Both sexes hold territories, they hold them all year rather than just in the breeding season, they sing to defend them through the winter, and they fight over them hard enough that a meaningful share of adult deaths are caused by other robins. The red breast is the badge that starts the argument.",
    "It is also the single most important experimental animal in the study of animal magnetic navigation. Work on migratory robins established that birds have a magnetic compass, that it reads the inclination of the field rather than its polarity, and that it needs light to function. The current explanation places the sensor in a protein called cryptochrome in the retina — meaning the robin does not so much feel the Earth's field as see it.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Passeriformes",
    family: "Muscicapidae",
    genus: "Erithacus",
    species: "Erithacus rubecula",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2018,
    populationTrend: "stable to increasing",
    populationEstimate: "Tens of millions of pairs across Europe, with close to seven million breeding pairs in the UK alone",
    note: "One of the more secure common birds in Europe, with a large and broadly stable or rising population, and separately assessed as Least Concern in the European Red List of Birds in 2021. Songbird trapping and shooting in parts of southern Europe still kills robins in quantity, and severe winters cause sharp short-term losses.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "12.5–14 cm",
      min: 12.5,
      max: 14,
      unit: "cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "20–22 cm",
      min: 20,
      max: 22,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "16–22 g",
      min: 16,
      max: 22,
      unit: "g",
      note: "A robin can lose up to 10% of its body weight over a single freezing winter night",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "4–6 eggs",
      min: 4,
      max: 6,
      unit: "eggs",
    },
    {
      key: "broods-per-year",
      label: "Broods a year",
      value: "Two or three",
      min: 2,
      max: 3,
      unit: "broods",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 13 days",
      min: 12,
      max: 15,
      unit: "days",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "About 14 days",
      min: 13,
      max: 15,
      unit: "days",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 2 years on average",
      min: 1,
      max: 2,
      unit: "years",
      note: "First-year mortality is very high; a bird that survives its first year does far better. The European ringing record is a Czech robin of over 19 years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore — insects, worms and spiders, with seeds and fruit in winter", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Diurnal, but often sings after dark where there is artificial light", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "Cup of moss, leaves and hair, hidden low down in a bank, hedge or crevice", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Solitary and strongly territorial; both sexes hold winter territories", icon: "User" },
    { key: "migration", label: "Movement", value: "Resident in the west and south; northern and eastern birds migrate", icon: "Navigation" },
    { key: "navigation", label: "Navigation", value: "Light-dependent magnetic compass located in the eye", icon: "Compass" },
  ],

  highlights: ["weight", "body-length", "navigation", "lifespan"],

  distribution: {
    continents: ["Europe", "Asia", "Africa"],
    regions: [
      "Britain and Ireland",
      "Continental Europe to western Siberia",
      "Scandinavia",
      "Turkey and the Caucasus",
      "North Africa and the Canary Islands",
    ],
    habitats: [
      "Deciduous and mixed woodland",
      "Hedgerows and scrub",
      "Gardens and parks",
      "Forest edge and clearings",
    ],
    elevation: "Sea level to the upper tree line",
    note: "Found across Europe, east to western Siberia and south to North Africa. Populations in the west and south are sedentary; those in the north and east migrate, wintering around the Mediterranean and in North Africa. It is fundamentally a woodland bird — gardens are a substitute for clearings and forest edge.",
  },

  sections: [
    {
      id: "magnetoreception",
      title: "Seeing the magnetic field",
      body: [
        "Robins have been at the centre of magnetic-navigation research since 1972, when Wolfgang and Roswitha Wiltschko showed that a caged migratory robin orients not to the polarity of the Earth's magnetic field but to its inclination — the angle at which the field lines meet the ground. That gives the bird an unambiguous sense of 'poleward' and 'equatorward', though not of north and south as a hand compass reads them.",
        "The second finding was stranger: the compass needs light, and only certain wavelengths of it. Robins orient correctly under blue and green light and become disoriented under red. That points away from a magnetic mineral in the beak and towards a chemical mechanism in the eye.",
        "The leading explanation is the radical-pair mechanism operating in cryptochrome, a light-sensitive protein. When a photon strikes cryptochrome 4a in a photoreceptor cell, an electron is transferred along a chain of tryptophan residues, creating a pair of radicals whose quantum spin states — and therefore the reaction's outcome — are sensitive to the surrounding magnetic field. In 2021 researchers purified cryptochrome 4a from the European robin and showed it is magnetically sensitive in vitro, and more so than the equivalent protein from non-migratory chickens and pigeons. The protein is concentrated in cone photoreceptors in the robin's retina and becomes more abundant during the migration season.",
        "A practical consequence is that the compass is disrupted by weak radiofrequency electromagnetic fields — a robin in a shielded hut orients normally and, with the shielding removed and urban radio noise present, does not. This remains an active field, and the full path from protein to perceived direction is not yet closed.",
      ],
    },
    {
      id: "territory",
      title: "Territory and the red breast",
      body: [
        "A robin's red front is not a male ornament — females have it too — and it is not primarily for courtship. It is a territorial signal, and it works so directly that a robin will attack a bunch of red feathers mounted on a stick, and largely ignore a stuffed robin with the red removed. David Lack's classic 1940s studies established this and much of what is known about the species' social life.",
        "Fighting is genuinely dangerous. Disputes escalate from song to posturing to physical attack, and a meaningful proportion of adult robin deaths are inflicted by other robins. Territories are held year-round, and outside the breeding season males and females hold separate ones, which is why both sexes sing through the autumn and winter.",
        "That winter song is the reason the robin is so bound up with Christmas in Britain — it is one of very few birds in full voice in December. The Victorian postmen who delivered the cards wore red tunics and were nicknamed 'robins', which is how the bird ended up on the cards themselves.",
      ],
    },
    {
      id: "tameness",
      title: "Tame in Britain, shy everywhere else",
      body: [
        "The robin that lands on a spade handle is a British and Irish phenomenon. Across most of continental Europe the same species is a retiring bird of dense woodland that keeps well away from people, and visitors from the continent are often startled by how close British robins come.",
        "The usual explanation is history rather than biology. Small songbirds have long been trapped and shot in parts of southern Europe, where migrating northern robins spend the winter, so continental populations have good reason to avoid people. Britain has no comparable tradition, and its robins have had centuries in which approaching a human carried no cost.",
        "There is a second thread. Robins follow large animals that disturb the ground, taking the invertebrates turned up — a habit developed with wild boar rooting through woodland soil. Boar were hunted out of Britain centuries ago, and the behaviour transferred neatly to the nearest available substitute: a person with a fork.",
      ],
    },
    {
      id: "breeding",
      title: "Nesting",
      body: [
        "Robins nest low and hidden — a cup of moss, dead leaves and hair tucked into a bank, an ivy-covered wall, a hedge bottom or a crevice, and famously into whatever else is available at the right height, from kettles to coat pockets in a shed. The female builds it alone.",
        "Four to six eggs are usual, incubated for about thirteen days, with the young fledging around a fortnight later. Two or three broods a season are typical, and the male often continues feeding the fledged young from one brood while the female begins the next.",
        "Survival is the hard part. First-year mortality is very high, and average life expectancy is about two years — although a robin that gets through its first year has a much better outlook, and European ringing records include a Czech bird recovered at over nineteen years old.",
      ],
    },
    {
      id: "naming",
      title: "Robins that are not robins",
      body: [
        "The bird was originally the 'redbreast' — the word orange did not exist as a colour name in English until the fruit arrived in the sixteenth century. In the fifteenth century, when it became fashionable to give familiar animals human names, it became 'robin redbreast', and eventually just robin. Older English names include ruddock and robinet.",
        "The name then travelled with English speakers and was applied to unrelated birds with a similar look. The American robin is a large thrush; the Australasian robins belong to a different family again. None of them are close relatives of Erithacus rubecula, which sits with the Old World flycatchers.",
        "The confusion runs the other way too: nineteenth-century American writing sometimes calls this species the 'English robin' to distinguish it from the one on the lawn outside.",
      ],
    },
  ],

  related: ["common-raven", "ruby-throated-hummingbird", "barn-owl"],
  tags: ["songbird", "garden bird", "europe", "magnetoreception", "territorial"],
  searchTerms: ["erithacus rubecula", "robin redbreast", "robin bird", "uk garden bird", "bird magnetic compass"],

  faqs: [
    {
      q: "How do robins navigate using magnetism?",
      a: "With a light-dependent compass in the eye. Experiments beginning in 1972 showed that robins read the inclination of the Earth's magnetic field rather than its polarity, and that the compass only works under blue and green light. The mechanism is thought to involve cryptochrome 4a, a protein in the retina: light triggers an electron transfer that creates a pair of radicals whose quantum spin states are affected by the magnetic field. Robin cryptochrome 4a has been shown to be magnetically sensitive in the laboratory.",
    },
    {
      q: "Why are robins so tame in Britain but not elsewhere in Europe?",
      a: "History rather than biology. Continental robins have long been trapped and shot in parts of southern Europe, where northern populations spend the winter, so they have learnt to avoid people and remain shy woodland birds. Britain has no such tradition. Robins also follow large animals that turn over soil — originally wild boar — and with boar gone from Britain, they transferred the habit to gardeners.",
    },
    {
      q: "Why do robins have a red breast?",
      a: "As a territorial signal, not a courtship one — both sexes have it. Classic experiments showed that a robin will attack a bundle of red feathers on a stick while largely ignoring a stuffed robin with the red removed. Robins hold territories all year, and disputes over them are aggressive enough that other robins are a significant cause of adult deaths.",
    },
    {
      q: "How long do European robins live?",
      a: "About two years on average, dragged down by very high mortality in the first year. A bird that survives that first year has a considerably better outlook, and the European ringing record is a robin from the Czech Republic recovered at over nineteen years and four months old.",
    },
    {
      q: "Is the European robin related to the American robin?",
      a: "No. The European robin is a small Old World flycatcher; the American robin is a large thrush, and the Australasian robins belong to yet another family. They share a name only because English speakers applied the familiar 'robin' to any bird abroad with a reddish front.",
    },
  ],

  seo: {
    title: "European Robin — Magnetic Compass, Territory & Breeding",
    description:
      "A researched profile of the European robin (Erithacus rubecula): the cryptochrome magnetic compass in its eye, why the red breast starts fights, and why British robins are tame when continental ones are not.",
    keywords: [
      "european robin facts",
      "erithacus rubecula",
      "robin redbreast",
      "bird magnetic compass",
      "robin territory",
    ],
  },

  sources: [
    {
      label: "Erithacus rubecula — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22709675/131953953",
    },
    {
      label: "Magnetic compass of European robins",
      publisher: "Wiltschko & Wiltschko, Science (1972)",
      url: "https://www.science.org/doi/10.1126/science.176.4030.62",
    },
    {
      label: "Cryptochrome magnetoreception: four tryptophans could be better than three",
      publisher: "Journal of the Royal Society Interface (2021)",
      url: "https://royalsocietypublishing.org/doi/10.1098/rsif.2021.0601",
    },
    {
      label: "Robin — BirdFacts",
      publisher: "British Trust for Ornithology",
      url: "https://www.bto.org/understanding-birds/birdfacts/robin",
    },
    {
      label: "Robin species page",
      publisher: "Woodland Trust",
      url: "https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/animals/birds/robin/",
    },
    {
      label: "Longevity records — Robin",
      publisher: "EURING, the European Union for Bird Ringing",
      url: "https://euring.org/data-and-codes/longevity-list/robin",
    },
  ],

  updatedAt: "2026-07-29",
};

export default europeanRobin;
