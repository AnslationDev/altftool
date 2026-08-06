// Leafcutter ant — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const leafcutterAnt = {
  slug: "leafcutter-ant",
  category: "insects",
  name: "Leafcutter Ant",
  scientificName: "Atta cephalotes",
  otherNames: ["Bachac", "Hormiga arriera", "Saúva"],

  summary:
    "An ant that does not eat leaves. It farms a single species of fungus on them, underground, in colonies of millions — and keeps antibiotic-producing bacteria on its body to control the mould that attacks the crop.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Atta_cephalotes-pjt.jpg/1920px-Atta_cephalotes-pjt.jpg",
    alt: "Leafcutter ants carrying cut sections of green leaf along a branch",
    credit: "Pjt56 / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Atta_cephalotes_%28Costa_Rica%29_1.jpg/1920px-Atta_cephalotes_%28Costa_Rica%29_1.jpg",
      alt: "A column of leafcutter ants on the forest floor in Costa Rica, each carrying a leaf fragment",
      credit: "Hans Hillewaert / Wikimedia Commons",
      title: "A column on a cleared road",
      caption:
        "Foraging trails are physical infrastructure: the ants clear them of debris and maintain the same routes for months or years, and the longest exceed half a kilometre.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Atta_cephalotes_%28Costa_Rica%29_2.jpg",
      alt: "Close view of leafcutter ants carrying leaf fragments held vertically above their bodies",
      credit: "Hans Hillewaert / Wikimedia Commons",
      title: "Carried like a sail",
      caption:
        "A forager cuts a fragment by pivoting on her hind legs with one mandible anchored, then carries it upright — a load that can exceed her own body mass, at a pace she holds for hundreds of metres.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Atta_cephalotes_%28with_Euphorbia_flowers%29.jpg/1920px-Atta_cephalotes_%28with_Euphorbia_flowers%29.jpg",
      alt: "A leafcutter ant carrying a piece of a Euphorbia flower rather than a leaf",
      credit: "Hans Hillewaert / Wikimedia Commons",
      title: "Not only leaves",
      caption:
        "Flowers, fruit pulp and soft stems are all cut and carried. What matters is not the plant part but whether the fungus in the garden below will grow on it.",
    },
  ],

  headline: "Fifty million years of agriculture",
  intro: [
    "The columns of ants carrying green crescents through the Neotropical forest are not carrying food home. Leafcutters cannot digest leaves. What they do with the cut fragments is chew them into a pulp and feed them to a fungus, grown in chambers underground, which converts plant material the ants cannot use into something they can — and it is the fungus, not the leaf, that the colony eats.",
    "The system is agriculture in a fairly strict sense: a single domesticated crop species propagated clonally, kept in prepared beds, weeded, fertilised, and defended against a specialised pathogen with antibiotics the ants carry on their own bodies. It has been running for something like fifty million years, which makes human farming a very recent development in the history of the practice.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Hymenoptera",
    family: "Formicidae",
    genus: "Atta",
    species: "Atta cephalotes",
  },

  conservation: {
    status: "NE",
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate exists; the species is abundant throughout lowland Central and South America",
    note: "Not evaluated by the IUCN, as is the case for almost all ants. There is no evidence of any conservation concern — the species is common across its range and often becomes more abundant along forest edges and in disturbed habitat than in intact forest. The relationship runs the other way in agriculture, where Atta is treated as one of the most serious pests of Latin American crops and plantations and is controlled with baits and insecticides.",
  },

  measurements: [
    {
      key: "colony-size",
      label: "Colony size",
      value: "Up to about 5 million workers",
      min: 1000000,
      max: 5000000,
      unit: "workers",
      note: "A single queen founds it alone; the colony takes years to reach that size",
    },
    {
      key: "head-width",
      label: "Worker head width",
      value: "0.6–4.5 mm across the castes",
      min: 0.6,
      max: 4.5,
      unit: "mm",
      note: "One of the most extreme size ranges of any ant — the smallest workers are a few millimetres long, the largest soldiers well over a centimetre",
    },
    {
      key: "nest-depth",
      label: "Nest depth",
      value: "Up to about 7–8 m",
      min: 7,
      max: 8,
      unit: "m",
      note: "The central mound of a mature nest can exceed 30 m across, with outlying mounds to a radius of about 80 m",
    },
    {
      key: "trail-length",
      label: "Foraging trail length",
      value: "Can exceed 500 m",
      unit: "m",
      note: "Cleared of debris and maintained for months or years — effectively permanent roads",
    },
    {
      key: "leaf-production-cut",
      label: "Share of forest leaf production cut",
      value: "About 12–17%",
      min: 12,
      max: 17,
      unit: "%",
      note: "Across twelve studies of Atta in tropical forest, summarised by Hölldobler and Wilson",
    },
    {
      key: "vegetation-harvested",
      label: "Vegetation harvested",
      value: "Hundreds of kilograms a year",
      unit: "kg/year",
      note: "Estimates for Atta colonies range from tens of kilograms of dry matter to more than a tonne of fresh plant material annually, depending on species and habitat",
    },
    {
      key: "lifespan-queen",
      label: "Queen lifespan",
      value: "More than 20 years",
      min: 10,
      max: 20,
      unit: "years",
      note: "The colony dies with her; individual workers live weeks to months",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "The cultivated fungus — not the leaves", icon: "Sprout" },
    { key: "agriculture", label: "Crop", value: "One fungus, Leucoagaricus gongylophorus, propagated clonally", icon: "Wheat" },
    { key: "symbiosis", label: "Crop protection", value: "Antibiotic-producing bacteria carried on the cuticle", icon: "Shield" },
    { key: "social-structure", label: "Social structure", value: "Eusocial; one queen, several physically distinct worker castes", icon: "Users" },
    { key: "activity", label: "Activity", value: "Shifts to night foraging in hot, dry weather", icon: "Moon" },
    { key: "ecological-role", label: "Ecological role", value: "The dominant herbivore of the Neotropics", icon: "Leaf" },
  ],

  highlights: ["colony-size", "leaf-production-cut", "agriculture", "symbiosis"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Southern Mexico through Central America",
      "The Amazon basin",
      "Northern South America to Bolivia and southern Brazil",
      "Trinidad and Tobago",
    ],
    habitats: [
      "Lowland tropical rainforest",
      "Secondary forest and forest edge",
      "Plantations and cropland",
      "Roadside and disturbed ground",
    ],
    elevation: "Sea level to around 1,000 m",
    note: "Atta cephalotes is a lowland forest species that thrives on disturbance: nest densities are frequently higher along edges, in secondary growth and in plantations than in continuous primary forest, which is a large part of why it is an agricultural problem.",
  },

  sections: [
    {
      id: "farm",
      title: "The crop, and why the leaves are not food",
      body: [
        "Leafcutters have no way to digest cellulose. A cut fragment arriving at the nest is passed through a sequence of workers who scrape and lick it clean, chew it into a moist pulp, and press it into the surface of a spongy grey mass filling a chamber underground. That mass is the fungus, Leucoagaricus gongylophorus, and it is the colony's entire food supply.",
        "The fungus does the digestion the ants cannot, breaking down plant polymers and, in return, growing swollen nutrient-rich hyphal tips called gongylidia in bundles the workers harvest and feed to the brood and the queen. Gongylidia have no obvious function for the fungus itself; they exist because the ants select for them. The crop has been domesticated in the ordinary sense of the word.",
        "The dependence runs both ways and is total. The fungus is propagated clonally and is not known to survive outside ant nests; the ants starve without it. Colonies weed the garden constantly, remove contaminated material to refuse chambers well away from the crop, and reject plant species whose chemistry the fungus responds badly to — a rejection the foragers learn from the state of the garden rather than from the leaf itself.",
      ],
    },
    {
      id: "castes",
      title: "Four jobs, four body sizes",
      body: [
        "Atta workers vary in head width from about 0.6 to 4.5 millimetres, one of the widest size ranges of any ant, and size maps closely onto task. The smallest — minims — never leave the nest under normal circumstances: they tend the fungus, weed it, and care for the brood in the dark. Medias do the cutting and carrying. Majors, with heads several times wider, act as soldiers on the trails and can cut through material other castes cannot.",
        "A leaf fragment is cut by an ant anchoring one mandible in the leaf edge and pivoting on her hind legs, using her body as a compass arm; the mandible vibrates at high frequency while she cuts. She then carries the fragment vertically above her, often at more than her own body mass, sometimes for several hundred metres.",
        "That upright load creates a specific vulnerability. Phorid flies hover over the columns trying to lay an egg on a forager's exposed neck, and a maggot that hatches there kills the ant from the inside. The answer is one of the more striking behaviours in the colony: minim workers ride on the carried leaf fragments, doing nothing but standing there and driving off flies that approach. The hitchhiker is a bodyguard.",
      ],
    },
    {
      id: "antibiotics",
      title: "The parasite, and the antibiotics",
      body: [
        "Any monoculture attracts a specialist pathogen, and the ants' garden has one: Escovopsis, a parasitic mould found only in attine fungus gardens and capable of destroying a colony's food supply. Its presence builds with colony age — sampling has found it in a small minority of newly founded nests and in the large majority of nests one to two years old.",
        "In 1999 Cameron Currie and colleagues reported in Nature what the ants do about it. Attine ants carry filamentous bacteria — actinomycetes, later identified principally as Pseudonocardia — in specialised cuticular crypts and associated glands, and those bacteria produce compounds that suppress Escovopsis specifically while leaving the cultivated fungus alone. The white bloom visible on a healthy worker's body is a bacterial culture the ant is maintaining.",
        "This makes the system a four-party symbiosis: ant, crop fungus, parasitic mould, and antibiotic-producing bacterium, with the bacteria passed from generation to generation along with the crop. It has held up under continuous pathogen pressure for millions of years, which is a longer run than any human antibiotic has managed, and the reason attine bacteria are now searched systematically for new antifungal compounds.",
      ],
    },
    {
      id: "founding",
      title: "One queen, one pellet of fungus",
      body: [
        "New colonies begin on a single flight. At the start of the rainy season, winged females and males leave established nests, mate in the air — a female mates with several males and stores enough sperm for a life of egg-laying — and the males die shortly afterwards. The female lands, breaks off her wings, and digs.",
        "She does not leave empty-handed. Before the flight she packs a pellet of the colony's fungus into her infrabuccal pocket, a filter chamber below her mouthparts. In the sealed chamber she has just excavated, she spits it out. That pellet is the founding stock of the new farm; she tends it herself, fertilises it with her own droppings, and metabolises her flight muscles to produce the first eggs, feeding some of them to the garden and some to the first larvae.",
        "Most attempts fail — the great majority of founding queens are eaten, dry out, or lose the fungus, and only a small fraction produce a lasting colony. The ones that succeed grow for years into nests of millions, moving tonnes of soil, sustaining trail networks hundreds of metres long, and cutting on the order of an eighth to a sixth of the leaf production around them. On that basis Atta is not a curiosity of the rainforest floor but its dominant herbivore, taking more vegetation than any comparable group of mammals in the same forest.",
      ],
    },
  ],

  related: ["western-honey-bee", "buff-tailed-bumblebee", "monarch-butterfly"],
  tags: ["ant", "hymenoptera", "eusocial", "rainforest", "south america", "symbiosis", "fungus farming"],
  searchTerms: [
    "atta cephalotes",
    "leaf cutter ants",
    "do leafcutter ants eat leaves",
    "ant fungus farming",
    "leafcutter ant colony",
  ],

  faqs: [
    {
      q: "Do leafcutter ants eat the leaves they carry?",
      a: "No — they cannot digest them. The cut fragments are chewed into a pulp and fed to a fungus grown in chambers underground, and the ants eat the fungus. Specifically they harvest gongylidia, swollen nutrient-rich structures the fungus produces in response to being cultivated, and feed them to the larvae and the queen.",
    },
    {
      q: "How old is leafcutter ant agriculture?",
      a: "Fungus farming in the attine ants goes back roughly fifty million years, with the leafcutting lineage a later development within it. The crop species is propagated clonally from nest to nest and is not known to live independently of ants, which is about as clear a definition of a domesticated organism as biology offers.",
    },
    {
      q: "Why do leafcutter ants carry antibiotics?",
      a: "Because their crop has a dedicated parasite. A mould of the genus Escovopsis attacks attine fungus gardens and nothing else, and it accumulates as a colony ages. The ants carry actinomycete bacteria — chiefly Pseudonocardia — in crypts on their cuticle, and these produce compounds that suppress Escovopsis without harming the cultivated fungus. The relationship was described by Currie and colleagues in Nature in 1999.",
    },
    {
      q: "Why do small ants ride on the leaves the bigger ones carry?",
      a: "They are bodyguards. Parasitoid phorid flies hover over foraging columns and try to lay an egg on a carrier ant's neck, which is exposed and unreachable while she is holding a leaf fragment above her. Minim workers ride on the fragment and drive the flies off. They contribute nothing to transporting the load.",
    },
    {
      q: "How big does a leafcutter ant colony get?",
      a: "A mature Atta cephalotes colony can hold several million workers. The nest may run seven or eight metres deep, with a central mound over thirty metres across and outlying mounds extending to a radius of around eighty metres, connected to cleared foraging trails that can exceed five hundred metres. All of it descends from one queen, who may live more than twenty years, and the colony dies when she does.",
    },
  ],

  seo: {
    title: "Leafcutter Ant — Fungus Farming, Castes & Antibiotics",
    description:
      "A researched profile of the leafcutter ant (Atta cephalotes): why it does not eat leaves, the fungus it has farmed for fifty million years, its worker castes, and the antibiotic bacteria that protect the crop.",
    keywords: [
      "leafcutter ant facts",
      "atta cephalotes",
      "ant fungus farming",
      "leafcutter ant colony size",
      "escovopsis pseudonocardia",
    ],
  },

  sources: [
    {
      label: "Currie, Scott, Summerbell & Malloch (1999), 'Fungus-growing ants use antibiotic-producing bacteria to control garden parasites'",
      publisher: "Nature",
      url: "https://www.nature.com/articles/19519",
    },
    {
      label: "The Ants, Chapter 17 — The fungus growers",
      publisher: "Hölldobler & Wilson, via AntWiki",
      url: "https://www.antwiki.org/wiki/The_Ants_Chapter_17",
    },
    {
      label: "The genome sequence of the leaf-cutter ant Atta cephalotes reveals insights into its obligate symbiotic lifestyle",
      publisher: "PLOS Genetics",
      url: "https://journals.plos.org/plosgenetics/article?id=10.1371%2Fjournal.pgen.1002007",
    },
    {
      label: "Leafcutter Ant (Atta cephalotes) Fact Sheet — Behavior & Ecology",
      publisher: "San Diego Zoo Wildlife Alliance Library",
      url: "https://ielc.libguides.com/sdzg/factsheets/leafcutter-ant/behavior",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default leafcutterAnt;
