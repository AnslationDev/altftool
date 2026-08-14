// Hippopotamus — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const hippopotamus = {
  slug: "hippopotamus",
  category: "mammals",
  name: "Hippopotamus",
  scientificName: "Hippopotamus amphibius",
  otherNames: ["Common hippopotamus", "Nile hippopotamus", "River hippo", "Hippo"],

  summary:
    "A one-and-a-half-tonne semi-aquatic grazer that spends its days submerged in African rivers, walks along the bottom rather than swimming, and secretes its own red sunscreen.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Portrait_Hippopotamus_in_the_water.jpg/1920px-Portrait_Hippopotamus_in_the_water.jpg",
    alt: "A hippopotamus at the surface of a river, eyes, ears and nostrils above the waterline",
    credit: "Muhammad Mahdi Karim / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Hippopotamus_at_sunset%2C_Maasai_Mara%2C_Kenya.jpg/1920px-Hippopotamus_at_sunset%2C_Maasai_Mara%2C_Kenya.jpg",
      alt: "A hippopotamus in water at sunset in the Maasai Mara, Kenya",
      credit: "Daniel Case / Wikimedia Commons",
      title: "Why the day is spent in water",
      caption:
        "Hippo skin has almost no sweat glands and dries out fast, so daylight hours are spent submerged. The animal is not swimming — it is dense enough to walk along the riverbed, pushing off in slow bounds rather than paddling.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Wild_Life_at_the_banks_of_Kazinga_channel%2C_Queen_Elizabeth_National_Park_02.jpg/1920px-Wild_Life_at_the_banks_of_Kazinga_channel%2C_Queen_Elizabeth_National_Park_02.jpg",
      alt: "Hippopotamuses on the banks of the Kazinga Channel in Queen Elizabeth National Park, Uganda",
      credit: "Alvinategyeka / Wikimedia Commons",
      title: "Pods hold the daylight hours",
      caption:
        "Groups of ten to thirty rest together through the day, and the Kazinga Channel carries one of the densest concentrations anywhere. The grouping is about water, not sociability — a dominant bull holds a stretch of river, and the females in it are not his herd so much as his neighbours.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Gambian_wild_hippo.jpg/1920px-Gambian_wild_hippo.jpg",
      alt: "A wild hippopotamus in the Gambia River near Georgetown",
      credit: "Ikiwaner / Wikimedia Commons",
      title: "The western edge of the range",
      caption:
        "West African populations like this one on the Gambia River are small, scattered remnants of what was once a continuous distribution across the continent. The species has been lost from Algeria, Egypt and much of its northern range entirely.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/A_large_hippopotamus_stands_calmly_in_the_middle_of_a_street_in_St._Lucia.jpg/1920px-A_large_hippopotamus_stands_calmly_in_the_middle_of_a_street_in_St._Lucia.jpg",
      alt: "A hippopotamus standing in a street in St Lucia, South Africa, watched by a ranger vehicle and onlookers",
      credit: "Stanislav Stelmakhovich / Wikimedia Commons",
      title: "Grazing brings them into town",
      caption:
        "Hippos leave the water after dark to graze, walking several kilometres and returning before dawn. Where a town sits on that route, as St Lucia does in KwaZulu-Natal, the animals simply walk through it — which is where most serious encounters with people happen.",
    },
  ],

  headline: "A land mammal that lives in the river",
  intro: [
    "After the elephants and the rhinos, the hippopotamus is the heaviest land mammal on Earth — and the largest even-toed ungulate alive. An adult bull averages around 1,550 kg, carried on short legs beneath a barrel of a body that is almost hairless and, above the waterline, almost featureless.",
    "It is also a genuine oddity. Hippos look like enormous pigs but their closest living relatives are whales and dolphins, from which they diverged around 55 million years ago. They cannot swim in any ordinary sense; their bones are dense enough that they simply walk and push off along the riverbed. And the reddish fluid that seeps from their skin — the source of the persistent claim that hippos sweat blood — is neither sweat nor blood, but a chemical sunscreen the animal makes for itself.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Artiodactyla",
    family: "Hippopotamidae",
    genus: "Hippopotamus",
    species: "Hippopotamus amphibius",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2017,
    populationTrend: "decreasing",
    populationEstimate: "Roughly 115,000–130,000 across sub-Saharan Africa",
    note: "Assessed as Vulnerable in 2017 on the basis of a decline of at least 30% over three generations. The two pressures are unrelated to each other: unregulated hunting for meat and for the ivory in the canine tusks, which intensified after the 1989 elephant ivory ban pushed the trade towards substitutes, and the loss of permanent water as rivers are dammed, diverted for irrigation and dried by drought. Numbers are healthiest in eastern and southern Africa and worst in central and west Africa.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "2.9–5.0 m",
      min: 2.9,
      max: 5.05,
      unit: "m",
      note: "Bulls 3.0–5.05 m; cows 2.9–4.3 m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "1.5–1.65 m",
      min: 1.5,
      max: 1.65,
      unit: "m",
      note: "Low relative to bulk — the legs are short and the body is deep",
    },
    {
      key: "weight",
      label: "Weight",
      value: "1,300–1,600 kg",
      min: 1300,
      max: 1600,
      unit: "kg",
      note: "Cows average about 1,385 kg and bulls about 1,546 kg. Large bulls exceed 2,000 kg, and exceptional individuals have been reported far heavier",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Over 30 km/h",
      min: 30,
      max: 35,
      unit: "km/h",
      note: "A charging hippo covers ground far faster than its build suggests, though only over a short distance",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "Commonly cited around 1,800 PSI",
      min: 1800,
      max: 1800,
      unit: "PSI",
      note: "The strongest bite of any land mammal, but treat the number as an order-of-magnitude estimate: it derives from a handful of measurements on captive animals rather than a controlled study, because a wild bull is not an animal anyone instruments willingly. Recorded in PSI to match the tiger and great white entries",
    },
    {
      key: "dive-duration",
      label: "Maximum dive time",
      value: "About 5 minutes",
      min: 5,
      max: 5,
      unit: "minutes",
      note: "An average submersion is closer to 100 seconds. Hippos surface and breathe while asleep without waking",
    },
    {
      key: "canine-length",
      label: "Canine tusk length",
      value: "Up to 50 cm",
      min: 30,
      max: 50,
      unit: "cm",
      note: "A bull's lower canines are usually about twice the length of a cow's, and are self-sharpening against the upper teeth. They are weapons, not feeding tools — hippos crop grass with their lips",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 227–240 days",
      min: 227,
      max: 240,
      unit: "days",
      note: "Births are concentrated in the rains",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1 calf",
      min: 1,
      max: 1,
      unit: "calf",
      note: "Born at 25–55 kg, on land or in shallow water; in good conditions a cow can calve every year",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "6–13 years (males), 7–15 years (females)",
      min: 6,
      max: 15,
      unit: "years",
      note: "Much earlier in zoos, at three to four years, where food is not limiting",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 40 years in the wild",
      min: 30,
      max: 40,
      unit: "years",
      note: "Median survival in accredited zoos is around 37 years, and animals in captivity have passed 50",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Herbivore — almost entirely short grass", icon: "Leaf" },
    { key: "social-structure", label: "Social structure", value: "Pods of 2–50 in water; grazes alone on land", icon: "Users" },
    { key: "activity", label: "Activity", value: "Nocturnal grazer; days spent submerged", icon: "Moon" },
    { key: "swimming", label: "Swimming", value: "Does not swim — punts along the bottom on dense bones", icon: "Waves" },
    { key: "ecological-role", label: "Ecological role", value: "Nutrient pump, moving grassland carbon into rivers", icon: "Sprout" },
  ],

  highlights: ["weight", "bite-force", "dive-duration", "swimming"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "East Africa — Tanzania, Kenya, Uganda",
      "Zambia and the Luangwa valley",
      "Zimbabwe and Mozambique",
      "South Africa and Botswana",
      "The Nile basin and Ethiopia",
      "West and central Africa, in scattered remnants",
    ],
    habitats: [
      "Rivers and river channels",
      "Lakes and floodplains",
      "Swamps and wetlands",
      "Grassland adjacent to permanent water",
    ],
    elevation: "Lowlands to around 2,000 m where permanent water persists",
    note: "The hippo's requirement is absolute and simple: water deep enough to submerge in, within a few kilometres of grass. That pins the species to permanent rivers, lakes and swamps across sub-Saharan Africa, and it is why abstraction and drought are as serious a threat as hunting. The range was once continuous from the Nile to the Cape; it is now a chain of populations along surviving waterways, with the largest numbers in Zambia and Tanzania.",
  },

  sections: [
    {
      id: "amphibious-life",
      title: "Neither swimmer nor land animal",
      body: [
        "A hippo's day is spent in the water and its night is spent out of it. Through daylight hours the animal lies submerged with only eyes, ears and nostrils breaking the surface — all three set high on the skull in one line, so a hippo can see, hear and breathe while the rest of it is hidden. It can hold its breath for around five minutes, though a typical submersion lasts under two, and it surfaces to breathe while asleep without waking.",
        "It does not swim. Hippo bones are unusually dense and the body is negatively buoyant, so the animal moves through deep water by pushing off the bottom in long, slow, almost weightless bounds — a gait sometimes described as punting. In shallows it simply walks. This is why hippos are found in rivers and lakes rather than open water, and why a hippo crossing a deep channel is genuinely walking underwater.",
        "After dusk it leaves the water on well-worn paths and travels three to five kilometres inland to graze, spending around five hours cropping short grass with its wide lips. It eats far less for its size than a comparable ruminant would, and it can afford to: floating through the day costs almost nothing.",
      ],
    },
    {
      id: "red-sweat",
      title: "The red secretion is not blood",
      body: [
        "Hippos have no sweat glands and almost no hair, and they spend their nights out of the water in a hot climate. Their solution is a thick, oily fluid produced by mucous glands in the skin. It emerges colourless, turns red within minutes and browns as it polymerises — which is where the old claim that hippos sweat blood comes from.",
        "It is not blood, and it is not sweat. Analysis published in Nature in 2004 identified two novel pigments in the secretion, named hipposudoric acid and norhipposudoric acid. They are unusually acidic non-benzenoid aromatic compounds, and they do two useful things at once: they absorb ultraviolet light, and they inhibit the growth of bacteria.",
        "That combination fits the animal exactly. A hippo is a bare-skinned mammal exposed to strong sun, and one that acquires deep wounds from fighting and then lies in water full of its own dung. It makes its own sunscreen and its own topical antibiotic, from the same glands, at the same time.",
      ],
    },
    {
      id: "danger",
      title: "Why hippos are dangerous",
      body: [
        "The hippopotamus has a reputation as one of the most dangerous large animals in Africa, and the reasons are structural rather than mysterious. Bulls hold aquatic territories — a 50 to 100 metre stretch of river or 250 to 500 metres of lakeshore — and defend them against other bulls with jaw-to-jaw sparring, rearing, pushing and slashing with the lower canines. Those canines can exceed 50 cm.",
        "Cows with calves are defensive to the same degree. Hippos are also fast on land, capable of over 30 km/h in a charge, and their grazing paths often run across ground people use. Most serious incidents come from a person being between a hippo and the water, or a boat drifting over a submerged animal.",
        "Precise annual death tolls circulate widely and are not well founded; there is no reliable continent-wide count. What is well established is the mechanism, and it is enough — a territorial 1,500 kg animal with 50 cm teeth, in water where it cannot be seen.",
      ],
    },
    {
      id: "society",
      title: "Pods, calves and the whale connection",
      body: [
        "Hippos rest in groups of two to fifty in the water, occasionally many more where water is scarce, but the grouping is loose and the core unit is a cow with her offspring. Territoriality applies only in the water; on land, grazing hippos ignore each other. Bulls begin sparring and 'yawning' contests — an open-mouth threat display that shows the canines — from about seven years old.",
        "Mating and birth both happen in water. A single calf is born after roughly eight months, weighing 25 to 55 kg, and can suckle underwater. Lactation runs about a year, with weaning between six and eight months, and under good conditions a cow can produce a calf annually.",
        "The family tree is the surprising part. Despite the pig-like body plan, hippos are not close to pigs at all. Molecular and fossil evidence places the Hippopotamidae as the closest living relatives of the cetaceans, the two lineages having split roughly 55 million years ago — one going entirely to sea, the other stopping at the riverbank.",
      ],
    },
    {
      id: "ecology-threats",
      title: "Ecological role and pressure",
      body: [
        "A hippo grazes on land and defecates in water, and it does so in enormous quantity. That single habit moves grassland nutrients into rivers and lakes on a scale that measurably changes them — driving invertebrate and fish productivity downstream, and in dry seasons, when flow drops and the loading concentrates, sometimes driving oxygen crashes instead. Hippo paths also cut and maintain channels through swamp vegetation that other animals use.",
        "The two main threats are hunting and water. Hippo meat is taken across much of the range, and hippo canine ivory is a legal and illegal commodity that grew in importance after the 1989 ban on elephant ivory. Meanwhile rivers are dammed, abstracted for irrigation and lost to drought, and a hippo without deep water in daylight cannot persist.",
        "The species has been on CITES Appendix II since 1995, which regulates rather than prohibits international trade in hippo ivory. Conservation, in practice, means anti-poaching enforcement and protecting permanent water — the second being harder, slower and less visible than the first.",
      ],
    },
  ],

  related: ["african-savanna-elephant", "black-rhinoceros", "blue-whale"],
  tags: ["africa", "herbivore", "semi-aquatic", "megafauna", "vulnerable", "river"],
  searchTerms: [
    "hippopotamus amphibius",
    "hippo",
    "river horse",
    "do hippos sweat blood",
    "hippo bite force",
  ],

  faqs: [
    {
      q: "Do hippos really sweat blood?",
      a: "No. Hippos have no sweat glands. What they produce is a thick, oily secretion from mucous glands in the skin, which starts colourless and turns red within minutes as its pigments develop. Research published in Nature in 2004 identified those pigments as hipposudoric acid and norhipposudoric acid, and showed they both absorb ultraviolet light and inhibit bacterial growth — the hippo is making its own sunscreen and antiseptic.",
    },
    {
      q: "Can hippos swim?",
      a: "Not in the usual sense. Their bones are dense and their bodies negatively buoyant, so rather than floating and paddling they walk along the bottom, and in deeper water push off it in long slow bounds. This is why hippos live in rivers, lakes and swamps rather than open water, and why a hippo crossing a deep channel is effectively walking underwater.",
    },
    {
      q: "What are hippos most closely related to?",
      a: "Whales and dolphins. Despite looking like a giant pig, the hippopotamus family is the closest living relative of the cetaceans, the two lineages having diverged around 55 million years ago. Pigs and other terrestrial even-toed ungulates are more distant relatives.",
    },
    {
      q: "How dangerous is a hippopotamus?",
      a: "Genuinely dangerous, though the widely quoted annual death tolls have no reliable source behind them. Bulls hold and defend aquatic territories, cows defend calves, the lower canines can exceed 50 cm, and a charging hippo can exceed 30 km/h on land. Most serious incidents involve a person coming between a hippo and the water, or a boat passing over a submerged animal.",
    },
    {
      q: "How long can a hippo stay underwater?",
      a: "Around five minutes at most, though a typical submersion is closer to 100 seconds. Their eyes, ears and nostrils are set in a line high on the skull so they can breathe and stay alert with the body hidden, and they surface to breathe while asleep without waking.",
    },
  ],

  seo: {
    title: "Hippopotamus — Size, Red Sweat, Behaviour & Conservation",
    description:
      "A researched profile of the hippopotamus (Hippopotamus amphibius): why it walks rather than swims, what its red secretion really is, its bite and territorial behaviour, and its Vulnerable status.",
    keywords: [
      "hippopotamus facts",
      "hippopotamus amphibius",
      "do hippos sweat blood",
      "hippo bite force",
      "are hippos related to whales",
    ],
  },

  sources: [
    {
      label: "Hippopotamus amphibius — Red List assessment (Lewison & Pluháček, 2017)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/10103/18567364",
    },
    {
      label: "Hippopotamus fact sheet — physical characteristics, behaviour and reproduction",
      publisher: "San Diego Zoo Wildlife Alliance Library",
      url: "https://ielc.libguides.com/sdzg/factsheets/hippopotamus",
    },
    {
      label: "Pigment chemistry: the red sweat of the hippopotamus (Saikawa et al., Nature, 2004)",
      publisher: "PubMed, US National Library of Medicine",
      url: "https://pubmed.ncbi.nlm.nih.gov/15164051/",
    },
    {
      label: "Hippopotamus species profile",
      publisher: "National Geographic",
      url: "https://www.nationalgeographic.com/animals/mammals/facts/hippopotamus",
    },
  ],

  updatedAt: "2026-07-29",
};

export default hippopotamus;
