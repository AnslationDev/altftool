// Hercules beetle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const herculesBeetle = {
  slug: "hercules-beetle",
  category: "insects",
  name: "Hercules Beetle",
  scientificName: "Dynastes hercules",
  otherNames: ["Rhinoceros beetle", "Hercules rhinoceros beetle"],

  summary:
    "The longest beetle on Earth once its horns are counted, built over two years of eating rotting wood — and how long those horns end up being depends almost entirely on how well the grub was fed.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/09/Hercules_beetle_%28Dynastes_hercules%29%2C_Entomica.jpg",
    alt: "A live male Hercules beetle with its long upper and lower horns and olive-toned wing cases",
    credit: "Fungus Guy / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Hercules_beetle_%28Dynastes_hercules%29_-_%281%29.jpg/1920px-Hercules_beetle_%28Dynastes_hercules%29_-_%281%29.jpg",
      alt: "A live male Hercules beetle photographed on the day it completed its development into an adult, its head and thoracic horns fully formed",
      credit: "Novita Estiti / Wikimedia Commons",
      title: "Two years for one summer",
      caption:
        "The photographer's note reads: after two years of waiting, he finally turned into a beetle. That is the actual timescale — a Hercules beetle spends twelve to twenty-four months as a grub chewing rotten wood, then two or three more as a pupa, to produce an adult that will live a matter of months.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Hercules_beetle_%28Dynastes_hercules%29_-_%282%29.jpg/1920px-Hercules_beetle_%28Dynastes_hercules%29_-_%282%29.jpg",
      alt: "A captive-reared Hercules beetle newly emerged as an adult, seen from above",
      credit: "Novita Estiti / Wikimedia Commons",
      title: "The horns are fixed at emergence",
      caption:
        "A beetle does not grow after it becomes an adult. Whatever horn length it leaves the pupa with is the horn length it dies with, so the whole contest between males is decided months earlier by how much rotting wood the larva managed to eat.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Hercules_beetle_%28Dynastes_hercules%29_-_30_May_2011.jpg/1920px-Hercules_beetle_%28Dynastes_hercules%29_-_30_May_2011.jpg",
      alt: "A Hercules beetle photographed at close range shortly after reaching adulthood, showing its wing cases and legs",
      credit: "Novita Estiti / Wikimedia Commons",
      title: "Wing cases that read the weather",
      caption:
        "The olive-khaki elytra are not pigmented that colour. A porous layer three micrometres below the surface scatters light while it is full of air, and when humidity climbs past about 80% water floods the pores and the beetle turns black — a passive colour change with no nerve or muscle involved.",
    },
  ],

  headline: "Two years underground to build a weapon",
  intro: [
    "Measured from the tip of the thoracic horn to the end of the abdomen, a male Hercules beetle is the longest beetle in the world — Guinness recognises a specimen of 172 mm, and breeders have since reared larger ones. More than half of that is horn.",
    "The body underneath is not exceptional; the titan beetle of South America has a far bigger one. What the Hercules has is a pair of opposed pincer-like horns, one from the head and one from the thorax, which a male uses to grip a rival, lift him off the branch and throw him down. And the size of that weapon is not really genetic. It is a receipt for how well the larva ate.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Coleoptera",
    family: "Scarabaeidae",
    genus: "Dynastes",
    species: "Dynastes hercules",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "unknown",
    populationEstimate: "No population estimate exists; larvae live inside rotting wood and are effectively uncountable in the field",
    note: "Dynastes hercules has never been assessed against the Red List criteria, so it holds no status — which reflects the near-total absence of insect assessments rather than a judgement that the species is secure. Claims that it is 'endangered' or 'Near Threatened' circulate widely online and trace to no actual assessment. What is documented is that it depends on large volumes of decaying hardwood in humid Neotropical forest, that this habitat is being cleared and fragmented across the range, and that adults are collected for the live pet and specimen trade, particularly for export to East Asia.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length (male, with horns)",
      value: "4.4–17.2 cm",
      min: 4.4,
      max: 17.2,
      unit: "cm",
      note: "Guinness World Records recognises a 172 mm specimen; captive-bred individuals above 180 mm have been reported by breeders",
    },
    {
      key: "body-length",
      label: "Body length (horns excluded)",
      value: "5–8.5 cm",
      min: 5,
      max: 8.5,
      unit: "cm",
      note: "Females carry no horns at all, so their body length is their total length",
    },
    {
      key: "weight",
      label: "Weight",
      value: "11.5–37.5 g",
      min: 11.5,
      max: 37.5,
      unit: "g",
      note: "Males average about 34 g and females about 16 g; final-instar larvae can exceed 100 g",
    },
    {
      key: "larval-duration",
      label: "Larval stage",
      value: "About 12–24 months",
      min: 12,
      max: 24,
      unit: "months",
      note: "Spent boring through decaying hardwood; the longest and most consequential phase of the life cycle",
    },
    {
      key: "pupal-duration",
      label: "Pupal stage",
      value: "About 2–3 months",
      min: 2,
      max: 3,
      unit: "months",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "About 3–12 months",
      min: 3,
      max: 12,
      unit: "months",
      note: "Sources differ; captive adults are commonly reported to live three to six months",
    },
    {
      key: "load-carried",
      label: "Load carried",
      value: "More than 30× its own body mass",
      min: 30,
      max: 100,
      unit: "× body mass",
      note: "Measured on a treadmill in a related rhinoceros beetle, not in Dynastes itself; the widely repeated '850 times its own weight' figure has never been demonstrated in any beetle",
    },
  ],

  traits: [
    { key: "diet-larva", label: "Larval diet", value: "Decaying hardwood", icon: "Leaf" },
    { key: "diet-adult", label: "Adult diet", value: "Fallen fruit and tree sap", icon: "Apple" },
    { key: "activity", label: "Activity", value: "Nocturnal; hides in leaf litter by day", icon: "Moon" },
    { key: "colour-change", label: "Colour change", value: "Khaki-green when dry, black in humid air", icon: "Palette" },
    { key: "social-structure", label: "Social structure", value: "Solitary; males fight over females", icon: "Swords" },
    { key: "ecological-role", label: "Ecological role", value: "Deadwood recycler", icon: "Recycle" },
  ],

  highlights: ["length", "weight", "larval-duration", "colour-change"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Southern Mexico and the whole of Central America",
      "Pacific coast and Amazonian Colombia, western Venezuela",
      "Eastern Ecuador, central Peru, western Brazil and west-central Bolivia",
      "The Lesser Antilles, including Guadeloupe and Dominica",
    ],
    habitats: [
      "Tropical rainforest",
      "Montane cloud forest",
      "Forest floor and leaf litter",
      "Rotting logs and standing deadwood",
    ],
    elevation: "Lowland to montane rainforest; the recognised subspecies replace one another across the elevation and geography of the range",
    note: "Around a dozen subspecies are described, differing in horn shape and elytra colour and largely separated by mountains and island isolation. The Guadeloupe and Dominica populations are the only ones on islands, and the nominate D. h. hercules is confined to them — the subspecies behind most of the record-length individuals.",
  },

  sections: [
    {
      id: "horn",
      title: "A weapon paid for in the larval stage",
      body: [
        "Male horn length in this species is one of biology's clearest examples of a condition-dependent trait. The horns grow during the final larval and pupal stages from tissue that is unusually sensitive to nutritional state, so a grub that found a large, well-rotted, fungus-worked log emerges with a weapon that dwarfs the horns of a beetle from a poorer log — even where the two are otherwise near-identical animals.",
        "That is why a Hercules beetle can be anything from about 44 mm to over 170 mm long. The body varies by a factor of under two; the horns vary by far more, and the largest males are simply the ones that ate best. Females, which invest their larval reserves in eggs rather than ornament, carry no horns and vary much less.",
        "The horns work as a pincer rather than a lance. The thoracic horn is fixed and the head horn closes up against it, so a male grips a rival across the body, prises him off the branch and drops or slams him. Fights are over access to a female or to a good sap flow, and because the loser is rarely injured the display value of a long horn does most of the work.",
      ],
    },
    {
      id: "strength",
      title: "How strong it actually is",
      body: [
        "The claim that a Hercules beetle can lift 850 times its own body weight is repeated almost everywhere and has never been demonstrated. It appears to have entered circulation through record books rather than through any experiment.",
        "It was actually tested, though on a smaller relative rather than on Dynastes itself. Rodger Kram put rhinoceros beetles on a motorised treadmill inside a respirometer and measured both what they could carry and what it cost them. They sustained walking with loads of more than thirty times their body mass — an extraordinary figure by vertebrate standards, and far short of 850. Pushed further, a beetle can shift about a hundred times its mass but can barely move under it.",
        "The genuinely surprising result was metabolic. Carrying a gram of extra load cost these beetles more than five times less energy than carrying a gram of their own body, which no standard model of the energetics of locomotion predicts. Whatever a rhinoceros beetle is doing when it walks under a load, it is not simply doing what a running mammal does more slowly.",
      ],
    },
    {
      id: "colour",
      title: "A beetle that changes colour with the weather",
      body: [
        "The elytra of a dry Hercules beetle are a pale olive-khaki flecked with black. Raise the humidity past roughly 80% and within minutes they go black. Lower it again and the colour returns. The beetle does nothing; the change is entirely passive.",
        "The mechanism was worked out in 2008. Three micrometres beneath the transparent surface of the cuticle sits an open porous layer — a lattice of filament sheets held apart by vertical pillars — and the sharp difference in refractive index between those structures and the air in the gaps scatters light back out, producing the khaki. When water vapour infiltrates the layer it replaces the air, the refractive-index contrast collapses, the scattering stops, and the underlying dark cuticle shows through.",
        "It is a structural colour with a humidity switch, and the effect has since been copied deliberately in the design of colorimetric humidity sensors. What it does for the living beetle is less certain, though nights in a cloud forest are humid and days are not, which lines the colour up neatly with when the animal is active and when it is hiding.",
      ],
    },
    {
      id: "status",
      title: "Uncounted, unassessed, and traded",
      body: [
        "No conservation assessment of Dynastes hercules exists. Statements that it is endangered, or Near Threatened, appear in enough places to look authoritative but do not trace back to any IUCN evaluation — the species has simply never been through the process, along with the overwhelming majority of the world's insects.",
        "What can be said is what the animal needs. A larva requires a substantial volume of decaying hardwood, worked on by fungi, sitting undisturbed for a year or two in humid forest. Selective logging removes exactly the large old trees that eventually supply it, and clearance and fragmentation remove the forest microclimate that keeps deadwood rotting rather than drying out.",
        "There is also a trade. Hercules beetles are among the most sought-after insects in the live pet market, particularly in Japan and elsewhere in East Asia, and mounted specimens sell worldwide. Much of the demand is now met by captive breeding — which is why record-size individuals tend to be reared rather than wild — but wild collection continues and is not monitored anywhere in the range.",
      ],
    },
  ],

  related: ["monarch-butterfly", "atlas-moth", "western-honey-bee"],
  tags: ["beetle", "coleoptera", "rainforest", "south america", "central america", "largest insect"],
  searchTerms: ["dynastes hercules", "hercules beetle size", "rhinoceros beetle", "longest beetle", "strongest insect"],

  faqs: [
    {
      q: "How big does a Hercules beetle get?",
      a: "Males range from about 44 mm to over 170 mm from horn tip to abdomen, and Guinness World Records recognises a specimen of 172 mm; breeders have reared individuals above 180 mm. More than half of that length is horn — the body itself is 5 to 8.5 cm. Females have no horns and are much shorter overall.",
    },
    {
      q: "Is the Hercules beetle the largest beetle in the world?",
      a: "It is the longest, provided you count the horns. By body alone the titan beetle, Titanus giganteus, is considerably bigger at around 15 cm, and the goliath beetles of Africa are heavier as adults. The Hercules beetle's record rests on a pair of horns that can be longer than the rest of the animal.",
    },
    {
      q: "Can a Hercules beetle really lift 850 times its own weight?",
      a: "No. That figure circulates widely and has never been shown experimentally. When rhinoceros beetles were actually tested on a treadmill they sustained loads of more than thirty times their body mass, and could shift roughly a hundred times their mass while barely able to move. Still remarkable, but an order of magnitude below the popular claim.",
    },
    {
      q: "Why do some Hercules beetles have much longer horns than others?",
      a: "Because horn growth depends on how well the larva ate. The horns develop in the final larval and pupal stages from tissue that is highly sensitive to nutritional state, so a grub that spent two years in a large, well-rotted, fungus-worked log emerges with a far bigger weapon than one from a poor log. A beetle does not grow after emerging, so the horn it has on day one is the horn it dies with.",
    },
    {
      q: "Why does a Hercules beetle change colour?",
      a: "Its wing cases are structurally coloured, not pigmented khaki. A porous layer just under the cuticle surface scatters light while the pores hold air; when humidity rises above about 80% water fills them, the refractive-index contrast that caused the scattering disappears, and the dark cuticle beneath shows through. The beetle turns black passively and reverts when it dries.",
    },
    {
      q: "How long does a Hercules beetle live?",
      a: "Most of its life is spent out of sight. The larva feeds inside rotting wood for roughly 12 to 24 months, the pupal stage takes another 2 to 3, and the adult then lives somewhere between three and twelve months depending on the source and the conditions — commonly three to six in captivity.",
    },
  ],

  seo: {
    title: "Hercules Beetle — Size, Horns, Real Strength & Colour-Changing Wing Cases",
    description:
      "A researched profile of the Hercules beetle (Dynastes hercules): the longest beetle in the world including its horns, why horn length depends on larval feeding, what its strength actually measures, and the humidity-driven colour change of its elytra.",
    keywords: [
      "hercules beetle facts",
      "dynastes hercules",
      "hercules beetle size",
      "largest beetle in the world",
      "strongest insect",
    ],
  },

  sources: [
    {
      label: "Dynastes hercules — species account",
      publisher: "Animal Diversity Web, University of Michigan Museum of Zoology",
      url: "https://animaldiversity.org/accounts/Dynastes_hercules/",
    },
    {
      label: "Dynastes hercules — Online Guide to the Animals of Trinidad and Tobago",
      publisher: "University of the West Indies, St Augustine",
      url: "https://sta.uwi.edu/fst/lifesciences/sites/default/files/lifesciences/documents/ogatt/Dynastes_hercules%20-%20Hercules%20Beetle.pdf",
    },
    {
      label: "Longest beetle (species)",
      publisher: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/world-records/445498-longest-beetle-species",
    },
    {
      label: "Inexpensive load carrying by rhinoceros beetles (Kram, 1996)",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/199/3/609/7375/Inexpensive-Load-Carrying-by-Rhinoceros-Beetles",
    },
    {
      label: "Diffractive hygrochromic effect in the cuticle of the hercules beetle (Rassart et al., 2008)",
      publisher: "New Journal of Physics",
      url: "https://iopscience.iop.org/article/10.1088/1367-2630/10/3/033014",
    },
  ],

  updatedAt: "2026-07-29",
};

export default herculesBeetle;
