// African clawed frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const africanClawedFrog = {
  slug: "african-clawed-frog",
  category: "amphibians",
  name: "African Clawed Frog",
  scientificName: "Xenopus laevis",
  otherNames: ["Platanna", "African clawed toad", "Xenopus"],

  summary:
    "For thirty years this southern African frog was the world's pregnancy test, shipped by the crate to hospitals on every continent. It became biology's favourite laboratory animal, an invasive species on four continents, and one of the strongest suspects in the global spread of the fungus that has devastated amphibians everywhere else.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Xenopus_laevis_02.jpg/1920px-Xenopus_laevis_02.jpg",
    alt: "An African clawed frog from Chimanimani, Zimbabwe, mottled olive-grey with a flattened body and small upward-facing eyes",
    credit: "Brian Gratwicke / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/1c/African_Clawed_Frog_%28Xenopus_laevis%29_%282864603798%29.jpg",
      alt: "An African clawed frog underwater with its forelimbs held out in front of it",
      credit: "Cliff from Arlington, Virginia, USA / Wikimedia Commons",
      title: "Waiting with its hands out",
      caption:
        "Clawed frogs hang almost upright in the water with the forelimbs spread, feeling for movement. There is no tongue: when something comes close the mouth opens, water rushes in, and the hands shove the prey down the throat.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/AfricanClawedFrog_XenopusLaevis.jpg/1920px-AfricanClawedFrog_XenopusLaevis.jpg",
      alt: "An African clawed frog at Nashville Zoo, showing its smooth flattened body and large webbed hind feet",
      credit: "Ltshears / Wikimedia Commons",
      title: "Entirely a water animal",
      caption:
        "The hind feet are huge and fully webbed, the body is smooth and flattened, and there is no external eardrum — just a cartilage disc under the skin. The three black claws on each hind foot, used to tear at food, give the species its name.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Karyotype_of_African_clawed_frog_%28Xenopus_laevis%29.png",
      alt: "A karyotype image showing the 36 chromosomes of Xenopus laevis arranged in pairs, with a 10 micrometre scale bar",
      credit: "Session AM, Uno Y, Kwon T, et al. / Wikimedia Commons",
      title: "Two genomes in one frog",
      caption:
        "Xenopus laevis is allotetraploid: 36 chromosomes descended from two different ancestral frogs that hybridised. Sequencing published in 2016 separated the two ancestral sets, which is why the species is now a model for how duplicated genomes evolve.",
    },
  ],

  headline: "The frog that told women they were pregnant",

  intro: [
    "Xenopus laevis is a smooth, flattened, entirely aquatic frog from the ponds and slow rivers of sub-Saharan Africa. It has no tongue, no teeth and no external eardrum, small upward-facing eyes, three black claws on each hind foot, and a lateral line running down its flanks like a fish's. It is a scavenger of unusual enthusiasm, eating anything living, dying or dead that it can push into its mouth, and it will burrow into mud and wait out a drought for up to a year.",
    "None of that explains why it is one of the most consequential amphibians on Earth. That comes from a discovery made in Cape Town in the 1930s: inject a female with the urine of a pregnant woman and she lays eggs within half a day. For three decades the Hogben test made this frog a piece of medical equipment, and it was shipped worldwide in enormous numbers. The animals that were released or escaped when the test became obsolete are still there — and so, on four continents, is the fungal disease that has since driven amphibian declines across the world.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Pipidae",
    genus: "Xenopus",
    species: "Xenopus laevis",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2009,
    populationTrend: "increasing",
    populationEstimate: "Extremely abundant across sub-Saharan Africa and often increasing",
    note: "One of the few amphibians whose Red List assessment records an increasing population. The 2009 assessment describes the species as extremely abundant in its native range and functioning as an invasive species in many others, and notes that chytridiomycosis has been detected in museum specimens of this frog dating back to 1938 — with the concern that international trade in the species may have contributed to spreading the disease globally, even though the disease does not appear to harm Xenopus itself. The assessment is old and flagged as needing updating.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "Males 5–6 cm, females 10–12 cm",
      min: 5,
      max: 12,
      unit: "cm",
      note: "Snout to vent. The sexes differ sharply: males are small and slim, females large and rotund.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males about 60 g, females about 200 g",
      min: 60,
      max: 200,
      unit: "g",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "15 years or more in the wild",
      min: 15,
      max: 20,
      unit: "years",
      note: "Captive animals routinely reach 20 years and have been reported to 30 — extraordinary longevity for a frog.",
    },
    {
      key: "clutch-size",
      label: "Eggs per spawning",
      value: "500–2,000 eggs",
      min: 500,
      max: 2000,
      unit: "eggs",
      note: "Released a few at a time over three or four hours and stuck to plants. Females can spawn up to four times a year.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 10–12 months",
      min: 1,
      max: 1,
      unit: "years",
    },
    {
      key: "chromosome-count",
      label: "Chromosomes",
      value: "36, in an allotetraploid genome",
      min: 36,
      max: 36,
      unit: "chromosomes",
      note: "Two ancestral frog genomes, conventionally called the long and short subgenomes, carried in one animal. Sequenced and published in 2016.",
    },
    {
      key: "dormancy",
      label: "Drought dormancy",
      value: "Up to a year buried in mud",
      min: 1,
      max: 1,
      unit: "years",
      note: "When a pond dries the frog digs in and waits, which is a large part of why it establishes so easily where it is introduced.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore and scavenger — anything living, dying or dead it can push into its mouth",
      icon: "Drumstick",
    },
    {
      key: "senses",
      label: "Senses",
      value: "No tongue and no external eardrum; finds food by smell, touch and a fish-like lateral line",
      icon: "EyeOff",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — warm, still, often turbid ponds and slow rivers",
      icon: "Droplet",
    },
    {
      key: "research-use",
      label: "Research use",
      value: "A core model organism in developmental and cell biology since the 1930s",
      icon: "Microscope",
    },
    {
      key: "ecological-role",
      label: "Outside its range",
      value: "Invasive on four continents and a probable carrier of chytrid fungus",
      icon: "AlertTriangle",
    },
  ],

  highlights: ["length", "research-use", "ecological-role", "lifespan"],

  distribution: {
    continents: ["Africa", "North America", "South America", "Europe", "Asia"],
    regions: [
      "Native across sub-Saharan Africa, from Nigeria and Sudan south to South Africa",
      "Introduced and established in California and Arizona",
      "Introduced in Chile",
      "Introduced in South Wales, France, Portugal and Sicily",
      "Introduced in Yunnan, China, and elsewhere in Asia",
    ],
    habitats: [
      "Warm, stagnant grassland ponds",
      "Slow rivers and irrigation channels",
      "Reservoirs, ditches and drainage canals in introduced ranges",
    ],
    elevation: "Lowland to mid-altitude ponds and rivers",
    note: "The introduced range is a direct legacy of the pregnancy-test trade and, later, the laboratory and pet trades. Feral populations were established in the United States in the 1930s and 1940s, and the frog is now restricted or banned in many US states. Because it eats almost anything, breeds prolifically and can sit out a drought underground, it establishes readily once released.",
  },

  sections: [
    {
      id: "pregnancy-test",
      title: "The Hogben test",
      body: [
        "In the early 1930s Lancelot Hogben was working at the University of Cape Town on how Xenopus controls its skin colour, which meant injecting frogs with pituitary extracts. He and his students noticed that the injections made female frogs ovulate. The connection to human pregnancy followed: a pregnant woman's urine contains human chorionic gonadotropin, a hormone close enough to the frog's own signal to work.",
        "Hillel Shapiro and Harry Zwarenstein turned it into a clinical test. A few millilitres of urine were injected into the dorsal lymph sac of a female Xenopus, and within eight to twelve hours she either laid eggs or she did not. The answer took less than a day, it was reliable, and — unlike the mouse and rabbit assays it replaced — it did not require killing the animal, so the same frog could be used again after a rest.",
        "That combination made it the standard for thirty years. Hospitals across Britain, Europe, North America and beyond kept tanks of African clawed frogs in the basement, and the animals were exported from South Africa by the crate to supply them. Carlos Galli Mainini later showed that male frogs could be used too, producing sperm in response, which widened the supply further.",
        "Immunological pregnancy tests arrived in the 1960s and made the whole apparatus obsolete almost overnight. The frogs did not evaporate with the technique. Some laboratories kept them for research; others simply released their stock into the nearest water.",
      ],
    },
    {
      id: "laboratory",
      title: "Biology's workhorse",
      body: [
        "The features that made Xenopus a good pregnancy test made it an outstanding laboratory animal. It can be induced to lay on demand with an injection of hormone, at any time of year. Its eggs are large, robust, externally fertilised and transparent enough to watch an embryo assemble itself. It is hardy, long-lived and easy to keep. Everything that is awkward about studying development in a mammal is straightforward in this frog.",
        "The best-known result came in 1962, when John Gurdon transplanted the nucleus of a differentiated intestinal cell from a Xenopus tadpole into an enucleated egg and produced a normal, swimming tadpole. Until then it was widely assumed that specialisation was a one-way street. Gurdon's frogs proved that a mature cell's nucleus still contains everything needed to build a whole animal, which is the intellectual foundation of cloning and of induced pluripotent stem cells. He shared the Nobel Prize in Physiology or Medicine in 2012 for it.",
        "The species has stayed central since. Xenopus egg extracts are a standard system for studying cell division and DNA replication in a test tube. Four female clawed frogs and a supply of stored sperm flew on Space Shuttle Endeavour in September 1992 to test whether fertilisation and development work in weightlessness.",
        "Its genome is itself a research subject. Xenopus laevis is allotetraploid, carrying 36 chromosomes derived from two different ancestral frog species that hybridised long ago. The 2016 sequencing effort separated those two ancestral subgenomes, turning the frog into a model for what happens to genes after a genome is duplicated — one of the recurring events in vertebrate evolution.",
      ],
    },
    {
      id: "chytrid",
      title: "The frog and the fungus",
      body: [
        "Batrachochytrium dendrobatidis, usually shortened to Bd, is a chytrid fungus that infects amphibian skin and disrupts the animal's ability to regulate water and salts across it. Since it was described in 1998 it has been implicated in declines and extinctions across the world, and it is the most destructive wildlife pathogen ever documented.",
        "Xenopus laevis is at the centre of the argument about how it spread. The fungus has been found in museum specimens of this species collected in South Africa as far back as 1938, and the frog carries the infection without apparently suffering from it, which makes it an efficient and silent host. The IUCN assessment states plainly that international trade in the species raised concern that it helped spread the disease worldwide, while noting the disease does not appear to harm the frog itself.",
        "The 'out of Africa' version — that Bd originated in southern Africa and rode the pregnancy-test trade outward — is the part that needs correcting. Whole-genome work published in Science in 2018 sampled more than two hundred isolates and traced the ancestral diversity of the pathogen to the Korean peninsula, dating the emergence of the panzootic lineage to the early twentieth century and tying it to the expansion of commercial trade in amphibians generally.",
        "That refines the charge without dismissing it. The origin of Bd appears to be Asian; the global movement of amphibians in the twentieth century is what distributed it, and the trade in African clawed frogs — hundreds of thousands of animals, moved between continents, carrying the fungus asymptomatically, and released at the end of their usefulness — was a substantial part of that movement.",
      ],
    },
    {
      id: "invasive",
      title: "What happens when they get out",
      body: [
        "Xenopus is close to an ideal invader. It eats almost anything organic, including its own larvae. It tolerates poor water quality, high salinity and a wide temperature range. Females can produce several thousand eggs a year. And when the water disappears the frog burrows into the mud and waits, for up to a year if necessary.",
        "Feral populations are established in California — including a well-known colony in San Francisco's Golden Gate Park found in 2003 — and in Arizona, Chile, South Wales, France, Portugal, Sicily and Yunnan in China. Some of these trace to hospitals and laboratories, others to the aquarium trade, where albino clawed frogs are widely sold and are frequently confused with the much smaller African dwarf frog.",
        "The ecological damage is a compound of predation, competition and disease. Stomach contents of feral Californian frogs have been found stuffed with their own larvae as well as native fauna, and the animals can carry Bd into water bodies where native amphibians have no resistance to it. A dozen US states now prohibit keeping the species without a permit.",
        "There is an irony in the conservation arithmetic. In its own range the African clawed frog is one of very few amphibians whose Red List assessment records a population that is increasing, and it thrives in exactly the degraded, nutrient-rich water that most frogs cannot use. The species that carried the disease is the species least troubled by it.",
      ],
    },
  ],

  related: ["surinam-toad", "cane-toad", "american-bullfrog"],
  tags: ["frog", "africa", "invasive species", "laboratory animal", "chytrid", "freshwater"],
  searchTerms: [
    "xenopus laevis",
    "platanna",
    "frog pregnancy test",
    "hogben test",
    "african clawed frog invasive",
    "clawed frog chytrid",
  ],

  faqs: [
    {
      q: "How was the African clawed frog used as a pregnancy test?",
      a: "A few millilitres of a woman's urine were injected into the dorsal lymph sac of a female Xenopus laevis. If she was pregnant, human chorionic gonadotropin in the urine caused the frog to lay eggs within eight to twelve hours. Developed in Cape Town in the 1930s by Lancelot Hogben's group, it was fast, reliable and did not kill the animal, so it became the standard clinical test until immunological kits replaced it in the 1960s.",
    },
    {
      q: "Did African clawed frogs spread the chytrid fungus?",
      a: "They are strongly implicated in spreading it, though not in originating it. The fungus has been found in museum Xenopus specimens from 1938, and the frog carries it without becoming ill, making it a silent host. Genomic work published in 2018 traced the pathogen's ancestral diversity to the Korean peninsula, so the origin appears to be Asian — but the twentieth-century global trade in amphibians, including the vast pregnancy-test trade in this species, is what moved it around the world.",
    },
    {
      q: "Why is Xenopus laevis used in laboratories?",
      a: "It can be induced to lay eggs on demand at any time of year with a hormone injection, and those eggs are large, tough, externally fertilised and easy to watch develop. The frogs are hardy and long-lived. John Gurdon used the species for the 1962 nuclear transfer experiments that showed a mature cell's nucleus can build a whole animal, work that won a share of the 2012 Nobel Prize.",
    },
    {
      q: "Why is the African clawed frog invasive?",
      a: "It eats almost anything, tolerates poor water and wide temperature and salinity ranges, lays thousands of eggs a year, and can burrow into mud and survive a year of drought. Populations released from hospitals, laboratories and the pet trade are established in California, Arizona, Chile, Wales, France, Portugal, Sicily and China, and many US states now restrict keeping it.",
    },
    {
      q: "How long do African clawed frogs live?",
      a: "Fifteen years or more in the wild, and commonly twenty in captivity, with reports up to thirty. That is exceptional for a frog and is part of why they suited laboratory use so well.",
    },
  ],

  seo: {
    title: "African Clawed Frog — Pregnancy Test, Lab Model & Chytrid",
    description:
      "A researched profile of the African clawed frog (Xenopus laevis): the Hogben pregnancy test, its role in Gurdon's cloning experiments, and how its global trade is implicated in spreading the chytrid fungus.",
    keywords: [
      "african clawed frog",
      "xenopus laevis",
      "frog pregnancy test",
      "hogben test",
      "xenopus chytrid fungus",
    ],
  },

  sources: [
    {
      label: "Xenopus laevis — Red List assessment (2009, e.T58174A11730010)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/58174/11730010",
    },
    {
      label: "Recent Asian origin of chytrid fungi causing global amphibian declines",
      publisher: "Science",
      url: "https://www.science.org/doi/10.1126/science.aar1965",
    },
    {
      label: "Xenopus laevis — natural history, size and longevity account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Xenopus_laevis/",
    },
    {
      label: "African clawed frog as a research organism",
      publisher: "Marine Biological Laboratory",
      url: "https://www.mbl.edu/research/research-organisms/african-clawed-frog",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default africanClawedFrog;
