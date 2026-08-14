// Scarlet macaw — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const scarletMacaw = {
  slug: "scarlet-macaw",
  category: "birds",
  name: "Scarlet Macaw",
  scientificName: "Ara macao",
  otherNames: ["Guacamaya roja", "Red-and-yellow macaw"],

  summary:
    "A metre-long Neotropical parrot that can outlive a person, listed as Least Concern globally while its northern subspecies is down to a few thousand birds.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Scarlet_macaw_%28Ara_macao_cyanopterus%29_Copan.jpg/1920px-Scarlet_macaw_%28Ara_macao_cyanopterus%29_Copan.jpg",
    alt: "A scarlet macaw perched at Copán in Honduras, showing scarlet body plumage with yellow and blue wing feathers",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Scarlet_macaw_%28Ara_macao_cyanopterus%29_Copan_2.jpg/1920px-Scarlet_macaw_%28Ara_macao_cyanopterus%29_Copan_2.jpg",
      alt: "A scarlet macaw of the northern subspecies at Copán, Honduras, with a broad yellow band across the wing",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "The northern bird",
      caption:
        "This is Ara macao cyanopterus, the Central American subspecies: larger than its South American counterpart and with blue rather than green feathers at the wing tips. Only an estimated 2,000 to 3,000 of these birds remain.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Scarlet_macaw_%28Ara_macao_macao%29_Yasuni.jpg/1920px-Scarlet_macaw_%28Ara_macao_macao%29_Yasuni.jpg",
      alt: "A scarlet macaw of the South American subspecies at a clay lick in Yasuní National Park, Ecuador",
      credit: "Charles J. Sharp / Wikimedia Commons",
      title: "Why macaws eat dirt",
      caption:
        "Amazonian macaws gather at exposed riverbank clay in numbers. The clay supplies sodium, which is scarce far inland, and calcium — minerals that a diet of fruit, nuts and seeds does not provide in sufficient quantity.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Scarlet_Macaw_%28Ara_macao%29_-Panama-8a.jpg",
      alt: "A scarlet macaw at a wildlife rescue centre in Panama, its heavy hooked bill in profile",
      credit: "Bill and Mavis (out until 2009!) T from Houston, USA / Wikimedia Commons",
      title: "The bill does the work",
      caption:
        "That deep hooked bill can crack nuts and hard seeds that almost nothing else in the forest can open, which is why macaws exploit food sources unavailable to other frugivores. Rescue centres like this one exist largely because of the pet trade.",
    },
  ],

  headline: "A parrot that can outlive the person who buys it",
  intro: [
    "The scarlet macaw is one of the largest parrots in the Americas: around 84 cm long, of which between a third and a half is tail, and weighing roughly a kilogram. It ranges from southeastern Mexico through Central America and across Amazonia, in pairs and small flocks that call loudly enough to be heard well before they are seen.",
    "Its conservation status is a lesson in why a single global code can mislead. Assessed across its whole range the species is Least Concern, because the Amazonian population is still large. The Central American subspecies is down to an estimated 2,000 to 3,000 birds and its northern population is listed as endangered under United States law. Deforestation and capture for the pet trade drive both trends.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Psittaciformes",
    family: "Psittacidae",
    genus: "Ara",
    species: "Ara macao",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2022,
    populationTrend: "decreasing",
    populationEstimate: "Between 50,000 and 499,999 mature individuals, and falling",
    note: "Least Concern globally because the Amazonian population remains large, but the trend is downward and the picture is very uneven. The Central American subspecies Ara macao cyanopterus numbers only around 2,000–3,000 birds, and its northern distinct population segment is listed as endangered by the US Fish and Wildlife Service. The species is on CITES Appendix I, so commercial international trade is prohibited.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "81–96 cm",
      min: 81,
      max: 96,
      unit: "cm",
      note: "Averages about 84 cm, or 89 cm in the larger Central American subspecies. Between a third and a half of that length is tail.",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "Around 100–120 cm",
      min: 100,
      max: 120,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "About 1 kg",
      min: 0.9,
      max: 1.5,
      unit: "kg",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "2–3 white eggs",
      min: 2,
      max: 3,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About five weeks",
      note: "Published figures vary between roughly four and five weeks",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "About 90 days after hatching",
      min: 90,
      max: 90,
      unit: "days",
      note: "Young stay with the parents well beyond fledging",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 5 years",
      min: 5,
      max: 5,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "40–50 years typical in captivity",
      min: 40,
      max: 50,
      unit: "years",
      note: "Exceptional captive birds have been reported at 75 or even 90 years. Wild lifespans are poorly documented and are expected to be shorter.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Frugivore and granivore — fruits, nuts, seeds, flowers and nectar", icon: "Apple" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "A cavity high in a large dead or living tree", icon: "TreePine" },
    { key: "social-structure", label: "Social structure", value: "Long-term pairs, travelling in pairs and small flocks", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Seed predator and disperser in Neotropical forest", icon: "Leaf" },
  ],

  highlights: ["body-length", "wingspan", "weight", "lifespan"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Southeastern Mexico",
      "Central America (Honduras, Nicaragua, Costa Rica, Panama)",
      "The western Amazon (Peru, Ecuador, Colombia, Bolivia)",
      "Venezuela and Brazil",
    ],
    habitats: [
      "Humid lowland rainforest",
      "Forest edge and river margins",
      "Gallery forest",
      "Deciduous tropical forest",
      "Savanna woodland",
    ],
    elevation: "Mostly humid lowlands below about 1,000 m",
    note: "Two subspecies split the range: Ara macao macao across South America, with green tips to the wing feathers, and the larger Ara macao cyanopterus from Nicaragua northwards, with blue there instead. The Amazonian population is still substantial and continuous. The Central American one has been reduced to fragmented remnants, most of them tiny.",
  },

  sections: [
    {
      id: "diet",
      title: "Diet, and why macaws eat clay",
      body: [
        "Scarlet macaws live on fruits, nuts, seeds, flowers and nectar. The bill is the enabling tool: deep, hooked and powerfully muscled, it opens hard nuts and unripe seeds that most other forest frugivores cannot get into, which gives macaws access to food when softer fruit is scarce.",
        "Nestlings need protein, and in Peru the seeds of Cnidoscolus and Schizolobium have been identified as the primary protein source that parents deliver to them. That level of dietary specificity matters for conservation: losing particular tree species removes the food that makes chick-rearing possible, not just food in general.",
        "Macaws also visit exposed clay banks along rivers, sometimes in large mixed-species congregations. The accepted explanation is mineral: clay licks supply sodium, which is scarce in continental interiors far from the sea, and calcium — nutrients that a fruit-and-seed diet does not deliver in adequate quantity.",
      ],
    },
    {
      id: "breeding",
      title: "Nesting in holes that take centuries to make",
      body: [
        "Scarlet macaws nest in cavities high in large trees, usually dead or partly dead ones. They cannot excavate a hole themselves, so they depend on cavities formed by decay or by other animals, in trees big enough to hold them. A tree of that size takes many decades to grow and the cavity longer still to form.",
        "Two or three white eggs are laid and incubated for around five weeks. Chicks fledge at about 90 days but remain dependent on their parents for a considerable time afterwards, and birds do not breed until around five years old.",
        "The combination is unforgiving. Selective logging removes exactly the big old trees the birds need, and the deficit cannot be made up quickly; artificial nest boxes are used in several recovery programmes precisely because natural cavities have become the limiting resource.",
      ],
    },
    {
      id: "threats",
      title: "Deforestation and the pet trade",
      body: [
        "Two pressures dominate. The first is habitat loss: clearance and fragmentation of lowland tropical forest across Central America and parts of Amazonia, which removes both food trees and nest cavities.",
        "The second is capture for the pet trade. Scarlet macaws are large, spectacular and long-lived, which makes them valuable, and chicks are taken directly from nests — often by cutting the nest tree down, which destroys the cavity permanently along with the brood. The species is on CITES Appendix I, prohibiting commercial international trade, but domestic and illegal trade continue.",
        "The result is a species that is globally Least Concern and locally close to gone. Ara macao cyanopterus, from Nicaragua north, is estimated at 2,000 to 3,000 birds, and the northern part of that population is listed as endangered under the US Endangered Species Act. Reintroduction and nest-protection projects run in Costa Rica, Guatemala, Honduras and elsewhere.",
      ],
    },
    {
      id: "longevity",
      title: "Long lives and what they cost",
      body: [
        "Captive scarlet macaws commonly live 40 to 50 years, and individuals reported at 75 or even 90 years exist. Wild lifespans are much less well documented and are expected to be shorter, but the species is unquestionably long-lived by bird standards.",
        "That longevity is the root of a specific welfare problem. A macaw bought as a pet will very often outlive the household that acquired it, and it is a loud, powerful, socially demanding animal that pair-bonds strongly and does badly alone. Rescue centres across the Americas exist in large part to absorb the consequences.",
        "It also shapes the conservation arithmetic. Like the Andean condor, the scarlet macaw is a slow-reproducing, late-maturing, long-lived animal. Populations built that way tolerate the loss of adults badly and rebuild slowly, so removing breeding birds from a forest has effects that persist for decades.",
      ],
    },
  ],

  related: ["andean-condor", "ruby-throated-hummingbird", "common-raven", "greater-flamingo"],
  tags: ["parrot", "rainforest", "neotropical", "pet trade", "cites"],
  searchTerms: ["macaw", "ara macao", "red macaw", "guacamaya", "parrot"],

  faqs: [
    {
      q: "Are scarlet macaws endangered?",
      a: "Globally no — the IUCN assessed the species as Least Concern in 2022 because the Amazonian population is still large, though the overall trend is decreasing. Regionally the picture is much worse: the Central American subspecies Ara macao cyanopterus is down to an estimated 2,000 to 3,000 birds, and its northern population is listed as endangered under United States law.",
    },
    {
      q: "How long do scarlet macaws live?",
      a: "Captive birds commonly reach 40 to 50 years, with exceptional individuals reported at 75 or even 90. Wild lifespans are poorly documented and are expected to be shorter. Either way this is a bird that can outlive the person who buys it, which is a recurring problem for the pet trade.",
    },
    {
      q: "Why do macaws eat clay?",
      a: "For minerals. Macaws gather at exposed riverbank clay licks in Amazonia, sometimes in large mixed flocks, and the accepted explanation is that the clay supplies sodium — scarce far from the coast — and calcium, neither of which a diet of fruit, nuts and seeds provides in sufficient quantity.",
    },
    {
      q: "What do scarlet macaws eat?",
      a: "Fruits, nuts, seeds, flowers and nectar. Their heavy hooked bill opens hard nuts and unripe seeds that most other forest frugivores cannot, which gives them food when soft fruit is scarce. In Peru, seeds of Cnidoscolus and Schizolobium have been identified as the main protein source parents feed to nestlings.",
    },
    {
      q: "What is the difference between the two scarlet macaw subspecies?",
      a: "Ara macao macao is the South American form and has green tips to the wing feathers. Ara macao cyanopterus, found from Nicaragua northwards, is larger and has blue there instead. The northern subspecies is by far the more threatened of the two.",
    },
    {
      q: "Can you legally keep a scarlet macaw?",
      a: "The species is on CITES Appendix I, which prohibits commercial international trade in wild-caught birds. Rules on captive-bred birds vary by country and are strict. Wild chicks are still taken from nests illegally, frequently by felling the nest tree, which destroys a cavity that took decades to form.",
    },
  ],

  seo: {
    title: "Scarlet Macaw — Size, Lifespan, Clay Licks & Status",
    description:
      "A researched profile of the scarlet macaw (Ara macao): a 90 cm parrot that lives for decades, why macaws eat clay, cavity nesting, and why a Least Concern species is nearly gone from Central America.",
    keywords: [
      "scarlet macaw facts",
      "ara macao",
      "scarlet macaw lifespan",
      "macaw clay lick",
      "scarlet macaw endangered",
    ],
  },

  sources: [
    {
      label: "Ara macao — Red List assessment (2022)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22685563/163778999",
    },
    {
      label: "Scarlet Macaw species factsheet",
      publisher: "BirdLife International DataZone",
      url: "https://datazone.birdlife.org/species/factsheet/scarlet-macaw-ara-macao",
    },
    {
      label: "Scarlet macaw (Ara macao ssp. cyanopterus) species profile",
      publisher: "U.S. Fish and Wildlife Service",
      url: "https://ecos.fws.gov/ecp/species/9023",
    },
    {
      label: "Endangered and Threatened Wildlife and Plants; Listing the Scarlet Macaw",
      publisher: "U.S. Federal Register (2019)",
      url: "https://www.federalregister.gov/documents/2019/02/26/2019-03165/endangered-and-threatened-wildlife-and-plants-listing-the-scarlet-macaw",
    },
  ],

  updatedAt: "2026-07-29",
};

export default scarletMacaw;
