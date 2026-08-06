// Great crested newt — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const greatCrestedNewt = {
  slug: "great-crested-newt",
  category: "amphibians",
  name: "Great Crested Newt",
  scientificName: "Triturus cristatus",
  otherNames: ["Northern crested newt", "Warty newt"],

  summary:
    "Europe's largest newt, black above and blazing orange beneath, carrying a genetic fault that kills half of every clutch it lays — and, in Britain, a legal protection strong enough to redesign building sites around a pond.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Kammmolchmaennchen.jpg",
    alt: "A male great crested newt underwater in breeding condition, showing the jagged crest along its back",
    credit: "Rainer Theuer. / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Great_Crested_Newt_%28Triturus_cristatus%29_-_B%C3%A6rum%2C_Norway_2021-09-25_%2801%29.jpg",
      alt: "A great crested newt on wet ground in Bærum, Norway, dark and warty-skinned",
      credit: "Ryan Hodnett / Wikimedia Commons",
      title: "Seven months out of the water",
      caption:
        "Outside the breeding season the crest is gone and the animal is simply a large, dark, rough-skinned newt hunting worms and slugs on land. Adults spend around seven months of the year away from any pond.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Great_Crested_Newt_%28Triturus_cristatus%29_-_B%C3%A6rum%2C_Norway_2021-09-25_%2802%29.jpg",
      alt: "A great crested newt among damp leaf litter and vegetation in Norway",
      credit: "Ryan Hodnett / Wikimedia Commons",
      title: "The land the pond depends on",
      caption:
        "Newts rarely disperse much beyond a kilometre from their breeding pond, but they need the rough grass, scrub and log piles in between. Protecting the water without protecting that ring of land does not work.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Great_crested_newt_%28Triturus_cristatus%29_male_%28right%29_and_female_%28left%29.jpg",
      alt: "A male great crested newt on the right and a female on the left in a photo tank during a survey in Norway",
      credit: "Bouke ten Cate / Wikimedia Commons",
      title: "Male and female side by side",
      caption:
        "The male, right, carries the jagged breeding crest and a white flash along the tail; the female, left, is larger overall and has an orange-tinted tail edge instead. Both wear the same black-blotched orange belly, and that belly pattern is unique to the individual.",
    },
  ],

  headline: "Half the eggs it lays were never going to hatch",

  intro: [
    "The great crested newt is the biggest newt in Europe and looks it: females reach 16 cm and the occasional animal approaches 20. The skin is dark brown to black and coarsely granular, the flanks are peppered with white, and the belly is yellow to deep orange broken by irregular black blotches that are as individual as a fingerprint. In spring the male grows a tall, jagged crest along his back and tail with a silver-white flash down the tail's side.",
    "Two things make it more than a handsome amphibian. The first is genetic: every crested newt carries a balanced lethal system on chromosome 1, which means roughly half of all its embryos are doomed before they start developing. The second is legal. In Britain and across the European Union it is a strictly protected species, and a single pond with newts in it can reshape the design, cost and timetable of a construction project.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Caudata",
    family: "Salamandridae",
    genus: "Triturus",
    species: "Triturus cristatus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2023,
    populationTrend: "decreasing",
    populationEstimate: "No global count; still the most widespread Triturus species",
    note: "The 2023 assessment keeps the species at Least Concern on range alone while recording a decreasing population trend. Pond loss to development and agriculture is the main driver, along with introduced predatory fish. The assessment also flags the salamander-killing fungus Batrachochytrium salamandrivorans as a serious future risk: laboratory exposure produced 100% mortality in tested individuals. Legal protection across the EU and UK is a response to the decline, not evidence of security.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "Up to 16 cm",
      min: 13.5,
      max: 16,
      unit: "cm",
      note: "Head to tail tip. Males reach about 13.5 cm and females 16 cm, with rare individuals near 20 cm.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "7–9 years, up to about 17",
      min: 7,
      max: 17,
      unit: "years",
      note: "Seventeen years has been recorded in the wild, which is exceptional for a newt.",
    },
    {
      key: "clutch-size",
      label: "Eggs per season",
      value: "About 200 eggs",
      min: 200,
      max: 200,
      unit: "eggs",
      note: "Laid one at a time over weeks, each folded individually into the leaf of a water plant with the hind feet.",
    },
    {
      key: "embryo-mortality",
      label: "Embryos that die before hatching",
      value: "About 50%",
      min: 50,
      max: 50,
      unit: "%",
      note: "A fixed consequence of the chromosome 1 balanced lethal system, not of predation or conditions.",
    },
    {
      key: "larval-period",
      label: "Larval period",
      value: "2–4 months",
      min: 2,
      max: 4,
      unit: "months",
      note: "Eggs hatch after two to five weeks depending on temperature; only around 4% of hatchlings reach metamorphosis.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 2–3 years old",
      min: 2,
      max: 3,
      unit: "years",
      note: "One to two years after leaving the water as a juvenile eft.",
    },
    {
      key: "dispersal-distance",
      label: "Distance from the breeding pond",
      value: "Rarely more than 1 km",
      min: 1,
      max: 1,
      unit: "km",
      note: "About 100 m can be covered in a single night, but most animals stay far closer to the water.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — worms, slugs, insects, water fleas, tadpoles and smaller newts",
      icon: "Drumstick",
    },
    {
      key: "activity",
      label: "Activity",
      value: "Nocturnal on land; active day and night once in the breeding pond",
      icon: "Moon",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — larger, deeper, fish-free ponds",
      icon: "Droplet",
    },
    {
      key: "courtship",
      label: "Courtship",
      value: "Male fans pheromones at the female, then leaves a spermatophore on the pond floor for her to collect",
      icon: "Waves",
    },
    {
      key: "legal-protection",
      label: "Legal status",
      value: "European Protected Species — a licence is required to disturb them or their habitat",
      icon: "Gavel",
    },
  ],

  highlights: ["length", "embryo-mortality", "legal-protection", "water-type"],

  distribution: {
    continents: ["Europe", "Asia"],
    regions: [
      "Great Britain, but absent from Ireland",
      "Northern and central continental Europe from France to the Baltic",
      "Scandinavia north to central Sweden and Finland",
      "East across Russia into parts of western Siberia",
    ],
    habitats: [
      "Larger fish-free ponds in lowland farmland",
      "Deciduous and mixed woodland",
      "Rough grassland, scrub and hedgerow within reach of a pond",
    ],
    elevation: "Chiefly a lowland species, thinning out well before the high ground",
    note: "Several populations once treated as subspecies are now recognised as separate species within Triturus — the Danube, Italian, Balkan and southern crested newts among them — so older range maps for 'the crested newt' cover far more ground than Triturus cristatus actually occupies. Where its range overlaps the marbled newt in France it occasionally hybridises with it.",
  },

  sections: [
    {
      id: "crest",
      title: "The crest and the courtship",
      body: [
        "For most of the year a male great crested newt is a plain dark animal. In spring, once he has returned to water, he grows a deeply notched crest along the back that breaks at the base of the tail and continues as a smooth fin, plus a silver-white streak along the side of the tail. It is grown for the season and reabsorbed afterwards.",
        "Courtship is a set piece performed on the pond floor. The male positions himself in front of the female, arches his body and whips his tail forward to drive water — and the pheromones in it — over her head. If she stays and follows, he creeps away, deposits a spermatophore on the bottom, and manoeuvres her over it so she can take it up with her cloaca. There is no amplexus and no contact at the moment of transfer.",
        "The female then spends weeks laying. Each egg is placed singly on a leaf of a water plant and wrapped inside it by her hind feet, which shields it from ultraviolet light and from the predators that would strip an exposed clump. Around two hundred eggs go out this way over a season.",
      ],
    },
    {
      id: "half-the-eggs",
      title: "Why half of them never hatch",
      body: [
        "All that careful wrapping is undermined by the newt's own genome. Every adult crested newt is heterozygous for chromosome 1, carrying one copy of version 1A and one of version 1B. Each version is missing genes that the other one has, so an animal needs one of each to develop.",
        "Mendelian inheritance then does the obvious thing. A quarter of embryos inherit two copies of 1A, a quarter inherit two copies of 1B, and both groups lack genes they cannot do without. They arrest at the tail-bud stage and die. Only the half that inherit one of each survive — the classic 1:1:2 ratio of a balanced lethal system, and the reason the condition is known as chromosome 1 syndrome.",
        "This is not a disease or a local fault; it is fixed across the genus Triturus and has persisted for millions of years despite halving reproductive output at every generation. Evolutionary biologists treat it as a genuine puzzle, since natural selection ought to have purged something this costly. One leading suggestion is that the system is the fossil of an ancient pair of sex chromosomes that got stuck. It also has a practical consequence: a species that throws away half its eggs by design has that much less margin when ponds start disappearing.",
      ],
    },
    {
      id: "on-land",
      title: "The seven months on land",
      body: [
        "The pond is the exception rather than the rule in this animal's year. Adults arrive in spring, breed, and leave by early summer; larvae metamorphose into juveniles called efts and leave the water around August. From then until the following spring the newts are terrestrial, hunting worms, slugs, woodlice and insects at night and sheltering by day under logs, stones, root plates and rough vegetation.",
        "They are not great travellers. A newt can cover around a hundred metres in a night, and few disperse much more than a kilometre from the pond they were born in. That combination — a strong tie to one pond, plus an absolute requirement for damp cover around it — is what makes the species so sensitive to landscape change.",
        "It also explains why the population unit that matters is not a pond but a cluster of ponds. Occasional movement between neighbouring waters is what lets a network survive the loss of any one of them, and it is why isolating a pond behind a road or a housing estate can extinguish a population that still has perfectly good water.",
      ],
    },
    {
      id: "planning",
      title: "The newt in the planning system",
      body: [
        "Triturus cristatus appears on Annexes II and IV of the EU Habitats Directive and Appendix II of the Bern Convention, and in Britain it is a European Protected Species. It is an offence to capture, kill, injure or deliberately disturb the animals, to take their eggs, or to damage or destroy a breeding site or resting place — with penalties in England running to an unlimited fine and up to six months in prison per offence.",
        "For anyone building anything near a pond that is a hard constraint rather than a guideline. Where harm cannot be avoided the developer needs a mitigation licence from Natural England, which in practice means surveys, exclusion fencing, trapping and translocation, and the creation of replacement habitat. The species has become one of the best-known reasons a British construction programme slips.",
        "The survey window is the pinch point. Traditional torch, bottle-trap and egg-search surveys run through spring, and environmental DNA sampling — testing pond water for traces of newt DNA — is only accepted by Natural England when collected between 15 April and 30 June. Miss the season and the work waits a year.",
        "England's response has been district level licensing, where a developer pays into a scheme and the Newt Conservation Partnership creates and maintains compensatory habitat at a landscape scale, taking on the long-term monitoring. It removes the wait for a survey window and, more usefully for the newt, puts the compensation where the ponds are actually worth having rather than in a corner of the site being built on.",
      ],
    },
  ],

  related: ["smooth-newt", "fire-salamander", "common-frog"],
  tags: ["newt", "europe", "protected species", "freshwater", "genetics", "least concern"],
  searchTerms: [
    "triturus cristatus",
    "northern crested newt",
    "warty newt",
    "crested newt licence",
    "great crested newt survey",
    "kammmolch",
  ],

  faqs: [
    {
      q: "Why do half of a great crested newt's eggs fail?",
      a: "Because of a balanced lethal system on chromosome 1. Every adult carries one copy of version 1A and one of version 1B, and each version lacks genes the other has. Embryos that inherit two copies of the same version are missing essential genes and die at the tail-bud stage — a predictable 50% loss at every clutch, shared across the genus Triturus.",
    },
    {
      q: "Are great crested newts protected by law?",
      a: "Yes, strictly. They are a European Protected Species, listed on Annexes II and IV of the EU Habitats Directive and Appendix II of the Bern Convention. In England it is an offence to kill, injure, capture or deliberately disturb them, or to damage a breeding or resting place, and the penalty can reach an unlimited fine and six months in prison per offence.",
    },
    {
      q: "What happens if great crested newts are found on a building site?",
      a: "Work that would harm them needs a mitigation licence from Natural England, which usually means survey, exclusion fencing, trapping and translocation, and the creation of replacement habitat. Alternatively the developer can join a district level licensing scheme and pay into landscape-scale habitat creation run by the Newt Conservation Partnership, which avoids waiting for the spring survey window.",
    },
    {
      q: "How do you tell a great crested newt from a smooth newt?",
      a: "Size and texture first: the great crested newt is much larger, reaching 16 cm, and its skin is rough and granular rather than smooth. It is very dark brown or black above with white speckling on the flanks, and its belly is bright orange with bold irregular black blotches. A breeding male carries a tall jagged crest with a distinct break at the base of the tail and a white flash along the tail's side.",
    },
    {
      q: "When can great crested newt eDNA surveys be done?",
      a: "Natural England only accepts eDNA results from pond water samples collected between 15 April and 30 June. Conventional survey methods — torching, bottle trapping and egg searching — run across a broadly similar spring window, which is why the species so often sets the timetable for development work.",
    },
  ],

  seo: {
    title: "Great Crested Newt — Chromosome 1, Legal Protection & Ecology",
    description:
      "A researched profile of the great crested newt (Triturus cristatus): why half its embryos always die, how courtship and egg-wrapping work, and what its European Protected Species status means for building near a pond.",
    keywords: [
      "great crested newt",
      "triturus cristatus",
      "great crested newt protection",
      "chromosome 1 syndrome",
      "great crested newt survey",
    ],
  },

  sources: [
    {
      label: "Triturus cristatus — Red List assessment (2023, e.T22212A89706893)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22212/89706893",
    },
    {
      label: "Great crested newts: protection, surveys and licences",
      publisher: "Natural England / GOV.UK",
      url: "https://www.gov.uk/guidance/great-crested-newts-protection-surveys-and-licences",
    },
    {
      label: "Great crested newt — species account and identification",
      publisher: "Froglife",
      url: "https://www.froglife.org/info-advice/amphibians-and-reptiles/great-crested-newt/",
    },
    {
      label: "The balanced lethal system of crested newts",
      publisher: "The American Naturalist",
      url: "https://www.journals.uchicago.edu/doi/10.1086/668076",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default greatCrestedNewt;
