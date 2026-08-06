// North Island brown kiwi — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const kiwi = {
  slug: "kiwi",
  category: "birds",
  name: "North Island Brown Kiwi",
  scientificName: "Apteryx mantelli",
  otherNames: ["Brown kiwi", "North Island kiwi"],

  summary:
    "A flightless, nocturnal New Zealand bird that hunts by smell through nostrils at the tip of its bill, and lays an egg roughly a fifth of the female's own body weight.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/8/82/TeTuatahianui.jpg",
    alt: "A brown kiwi standing among leaf litter at night, long pale bill angled to the ground",
    credit: "Maungatautari Ecological Island Trust / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Apteryx_mantelli_106965242.jpg/1920px-Apteryx_mantelli_106965242.jpg",
      alt: "A North Island brown kiwi on the forest floor, shaggy streaked brown plumage and long bill",
      credit: "Peter de Lange / Wikimedia Commons",
      title: "Feathers that behave like fur",
      caption:
        "Kiwi feathers have no interlocking barbules, so the plumage hangs loose and shaggy rather than forming a smooth surface. With no need to fly, the bird has also lost the keeled breastbone that anchors flight muscles in other birds.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/07/Apteryx_mantelli_103854715.jpg",
      alt: "A North Island brown kiwi probing among ground vegetation with its long bill",
      credit: "Joe Dillon / Wikimedia Commons",
      title: "A bill that smells",
      caption:
        "The kiwi is the only bird whose nostrils open at the tip of the bill rather than at the base. It probes leaf litter and soil and locates earthworms and insect larvae by scent and by touch, using sensory pits packed into the bill tip.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Apteryx_mantelli_-Rotorua%2C_North_Island%2C_New_Zealand-8a.jpg/1920px-Apteryx_mantelli_-Rotorua%2C_North_Island%2C_New_Zealand-8a.jpg",
      alt: "A North Island brown kiwi walking in a darkened enclosure at a wildlife park in Rotorua",
      credit: "The.Rohit / Wikimedia Commons",
      title: "Seen only after dark",
      caption:
        "Kiwi are almost entirely nocturnal, which is why most people meet them in nocturnal houses like this one. Captive-rearing facilities are also central to the species' recovery: eggs taken from the wild are hatched in safety and the young returned once they can fight off a stoat.",
    },
  ],

  headline: "A bird that hunts by nose",
  intro: [
    "The kiwi is a bird that has taken most of its cues from mammals. It is flightless and nocturnal, its feathers hang loose like coarse hair, its bones are filled with marrow rather than hollow, its body temperature runs a couple of degrees below other birds', and it finds food by smell — through nostrils set at the very tip of its long bill, an arrangement found in no other bird.",
    "Its other distinction is reproductive. The female lays an egg that is around a fifth of her own body weight and roughly six times the size expected for a bird of her build. The male then incubates it, alone, for two and a half months. What the species cannot cope with is what arrived with people: stoats, ferrets, cats and dogs, against which a ground-nesting bird that evolved without mammalian predators has almost no answer.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Apterygiformes",
    family: "Apterygidae",
    genus: "Apteryx",
    species: "Apteryx mantelli",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2017,
    populationTrend: "declining where predators are not controlled; stable or increasing inside managed areas",
    populationEstimate: "About 25,000 birds — the most numerous of the five kiwi species",
    note: "Assessed as Vulnerable globally, though New Zealand's own threat classification now rates it Not Threatened on the strength of managed populations — the two systems weigh recent management differently. The five kiwi species are assessed separately and differ sharply in status, so figures quoted for 'the kiwi' rarely apply to this one. New Zealand's Department of Conservation reports roughly 70,000 kiwi of all species remaining and a 2% annual loss from unmanaged populations.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "About 40 cm",
      min: 40,
      max: 40,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males 1.4–3.1 kg, females 2.1–3.9 kg",
      min: 1.4,
      max: 3.9,
      unit: "kg",
      note: "Averages near 2 kg for males and 2.7 kg for females — females are consistently the larger sex",
    },
    {
      key: "bill-length",
      label: "Bill length",
      value: "13–20.5 cm",
      min: 13,
      max: 20.5,
      unit: "cm",
      note: "Females have longer bills than males",
    },
    {
      key: "egg-weight",
      label: "Egg weight",
      value: "About 430 g — roughly 20% of the female's body weight",
      min: 400,
      max: 450,
      unit: "g",
      note: "Around six times the size expected for a bird of this build; a human baby at full term is about 5% of its mother's weight",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1–2 eggs",
      min: 1,
      max: 2,
      unit: "eggs",
      note: "Where two are laid they are usually about three weeks apart",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "75–90 days, by the male alone",
      min: 75,
      max: 90,
      unit: "days",
    },
    {
      key: "chick-survival",
      label: "Chick survival without predator control",
      value: "About 10% reach six months",
      min: 10,
      max: 10,
      unit: "%",
      note: "Stoats take most of the losses; predator control and captive rearing raise this dramatically",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "21 years recorded from banded birds",
      min: 21,
      max: 40,
      unit: "years",
      note: "Wild longevity may reach 40 years, but banding studies have not yet run long enough to confirm it",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore — earthworms, insect larvae, spiders, fallen fruit", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Nocturnal", icon: "Moon" },
    { key: "flight", label: "Flight", value: "Flightless — no keeled breastbone, wings reduced to stubs", icon: "Ban" },
    { key: "sense-of-smell", label: "Senses", value: "Nostrils at the tip of the bill — unique among birds", icon: "Wind" },
    { key: "nest-type", label: "Nest type", value: "Burrow, hollow log or dense vegetation on the ground", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Long-term pairs holding a territory", icon: "Users" },
  ],

  highlights: ["egg-weight", "weight", "incubation", "chick-survival"],

  distribution: {
    continents: ["Oceania"],
    regions: [
      "Northland and its offshore islands",
      "Coromandel Peninsula",
      "Eastern North Island",
      "Western North Island",
    ],
    habitats: [
      "Native podocarp and broadleaf forest",
      "Exotic pine plantation",
      "Scrub and regenerating bush",
      "Rough farmland with cover",
    ],
    elevation: "Sea level to montane forest",
    note: "Confined to the northern two-thirds of New Zealand's North Island, plus offshore islands and fenced sanctuaries. Unlike most threatened New Zealand birds it has not retreated entirely to predator-free islands — it persists in pine plantations and rough farmland, which is part of why it remains the most numerous kiwi.",
  },

  sections: [
    {
      id: "senses",
      title: "Built like a mammal",
      body: [
        "Almost every feature of a kiwi points away from the standard bird design. The feathers lack the interlocking barbules that give other birds a smooth aerodynamic surface, so the plumage hangs loose and shaggy. The wings are vestigial stubs hidden in it. The breastbone has no keel, because there are no flight muscles to anchor. The bones contain marrow rather than the air spaces that lighten a flying bird's skeleton, and body temperature sits around 38 °C — low for a bird, close to a mammal's.",
        "The senses have gone the same way. Kiwi eyes are small and their vision is poor. What they have instead is smell: the nostrils open at the very tip of the bill, an arrangement found in no other bird, and the olfactory bulbs are large relative to the brain. A foraging kiwi walks with its bill tapping the ground, sniffing audibly, and can locate an earthworm several centimetres down.",
        "The bill tip also carries dense clusters of sensory pits that pick up the faint vibrations of prey moving in the soil — the same principle used by probing shorebirds, which are among the kiwi's more distant relatives.",
      ],
    },
    {
      id: "egg",
      title: "The egg",
      body: [
        "A North Island brown kiwi egg weighs around 430 grams and takes up roughly a fifth of the female's body. Relative to the size of the parent it is about six times larger than expected — the largest of any bird — and in the days before laying the female can barely feed, because there is no room left inside her.",
        "The pay-off is a chick that hatches almost fully formed. The egg is unusually rich in yolk, and the hatchling emerges fully feathered, with its eyes open and a yolk sac it lives off for the first week or so. There is no helpless nestling stage: within a fortnight it is out foraging on its own, and it gets no food from its parents at all.",
        "Incubation falls to the male, who sits for 75 to 90 days and loses substantial condition doing it. Two eggs may be laid about three weeks apart, and the whole cycle is slow and expensive — which is why losing chicks to predators is so much harder to absorb here than in a bird that can raise five young a year.",
      ],
    },
    {
      id: "predators",
      title: "Stoats",
      body: [
        "New Zealand had no land mammals other than bats before people arrived, and the kiwi evolved accordingly: it nests on the ground, cannot fly away, and defends itself with a kick that works against very little.",
        "Stoats, introduced in the 1880s to control rabbits, are the main killer of kiwi chicks. Where nothing is done about them, only about one chick in ten survives to six months. A kiwi that reaches roughly a kilogram can usually fight a stoat off, but the months before that are close to lethal. Adults are killed by dogs and ferrets — a single roaming dog has been recorded killing dozens of adult kiwi in a matter of weeks — and cats take chicks.",
        "The result is a species that is not rare, but is quietly bleeding away. New Zealand's Department of Conservation puts the loss from unmanaged populations at about 2% a year: enough to halve a population within a working lifetime.",
      ],
    },
    {
      id: "recovery",
      title: "Trapping, poison and Operation Nest Egg",
      body: [
        "Two approaches have changed the outlook. The first is landscape-scale predator control — sustained trapping networks and periodic aerial application of the poison 1080 — which has slowed or reversed decline across large areas. On the Coromandel Peninsula, sustained control has the kiwi population roughly doubling each decade.",
        "The second is Operation Nest Egg. Eggs are lifted from wild nests, incubated and hatched in captivity, and the chicks reared in safety until they are big enough to see off a stoat, then returned to the wild. It converts a survival rate of around one in ten into something closer to two in three, and it is why several regional populations are now growing rather than shrinking.",
        "Predator-free fenced sanctuaries such as Maungatautari provide a third layer: enclosed mainland habitat with the mammals removed entirely, functioning as secure breeding reservoirs. The combination is one of the more encouraging conservation stories in New Zealand — but it is maintenance, not a cure. The moment the trapping stops, the stoats return.",
      ],
    },
    {
      id: "species",
      title: "Which kiwi is which",
      body: [
        "There are five kiwi species, and they are frequently confused with one another in general writing. The North Island brown kiwi is Apteryx mantelli; the tokoeka of the South Island took over the older name Apteryx australis when genetic work in 1994 showed it to be distinct, and the Ōkarito rowi, Apteryx rowi, was separated in 2003.",
        "The distinctions matter because status varies enormously between them. The North Island brown kiwi is the most numerous, with about 25,000 birds; the rowi numbers in the hundreds. A figure quoted for 'the kiwi' is almost always wrong for at least one of them.",
        "One further oddity: a small number of North Island brown kiwi carry a genetic variation producing white feathering. A partially white bird found injured in 2004 was identified by Massey University and later joined a breeding programme; earlier records amount to an eighteenth-century painting and a museum specimen.",
      ],
    },
  ],

  related: ["common-ostrich", "emperor-penguin", "superb-lyrebird"],
  tags: ["flightless", "nocturnal", "new zealand", "ratite", "endemic"],
  searchTerms: ["apteryx", "brown kiwi", "kiwi bird", "kiwi egg", "flightless bird new zealand"],

  faqs: [
    {
      q: "How big is a kiwi egg compared with the bird?",
      a: "About a fifth of the female's body weight, and roughly six times larger than would be expected for a bird of that size — the largest egg relative to the parent of any living bird. A single egg weighs around 430 grams. For comparison, a human baby at full term is about 5% of its mother's weight.",
    },
    {
      q: "Can kiwi smell?",
      a: "Yes, better than almost any other bird. The nostrils open at the tip of the bill instead of at the base — a feature unique to kiwi — and the olfactory parts of the brain are unusually large. A foraging kiwi taps and sniffs its way across the forest floor and can locate an earthworm several centimetres underground, helped by sensory pits in the bill tip that detect movement in the soil.",
    },
    {
      q: "Why are kiwi endangered?",
      a: "Introduced mammals. New Zealand had no land mammals apart from bats before humans arrived, so a flightless, ground-nesting bird had no defences against them. Stoats kill most kiwi chicks — only around one in ten survives to six months where nothing is done — while dogs and ferrets kill adults. Habitat loss compounds it.",
    },
    {
      q: "Which parent incubates the kiwi egg?",
      a: "In the North Island brown kiwi, the male, alone, for 75 to 90 days. He loses considerable condition in the process. The chick hatches fully feathered with its eyes open, lives off its yolk sac for about a week, and then feeds itself — the parents never bring it food.",
    },
    {
      q: "How many North Island brown kiwi are left?",
      a: "About 25,000, which makes it the most numerous of the five kiwi species. New Zealand's Department of Conservation estimates roughly 70,000 kiwi of all species remaining, and around 2% of unmanaged birds are lost each year — although areas with sustained trapping, poisoning or fenced protection are now stable or increasing.",
    },
  ],

  seo: {
    title: "North Island Brown Kiwi — Egg, Senses, Predators & Recovery",
    description:
      "A researched profile of the North Island brown kiwi (Apteryx mantelli): nostrils at the bill tip, an egg a fifth of the female's weight, male incubation, stoat predation and New Zealand's recovery programmes.",
    keywords: [
      "kiwi bird facts",
      "apteryx mantelli",
      "north island brown kiwi",
      "kiwi egg size",
      "flightless bird new zealand",
    ],
  },

  sources: [
    {
      label: "Apteryx mantelli — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/45353580/119177586",
    },
    {
      label: "North Island brown kiwi species account",
      publisher: "New Zealand Birds Online, Te Papa",
      url: "https://nzbirdsonline.org.nz/species/north-island-brown-kiwi",
    },
    {
      label: "Kiwi facts and characteristics",
      publisher: "New Zealand Department of Conservation",
      url: "https://www.doc.govt.nz/nature/native-animals/birds/birds-a-z/kiwi/facts/",
    },
    {
      label: "Enormous egg",
      publisher: "Save the Kiwi",
      url: "https://savethekiwi.nz/about-kiwi/kiwi-facts/enormous-egg/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default kiwi;
