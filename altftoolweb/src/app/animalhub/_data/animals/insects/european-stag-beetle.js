// European stag beetle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const europeanStagBeetle = {
  slug: "european-stag-beetle",
  category: "insects",
  name: "European Stag Beetle",
  scientificName: "Lucanus cervus",
  otherNames: ["Stag beetle", "Greater stag beetle"],

  summary:
    "Britain's largest land beetle spends up to seven years as a grub eating dead wood, then a few weeks as an adult with antler-like jaws too weak to do much except wrestle other males.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/09/Lucanus_cervus.jpg",
    alt: "A male European stag beetle on the ground, chestnut wing cases and large reddish antler-like mandibles",
    credit: "J.F. Gaffard / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Lucanus_cervus_female_Stag_Beetle_%283%29_%2848322328002%29.jpg/1920px-Lucanus_cervus_female_Stag_Beetle_%283%29_%2848322328002%29.jpg",
      alt: "A female European stag beetle on the ground, with small mandibles and no antlers",
      credit: "gailhampshire from Cradley, Malvern, U.K / Wikimedia Commons",
      title: "The female, and the stronger bite",
      caption:
        "Females are smaller and carry ordinary short mandibles — which, unlike the male's antlers, close with real force. She is the one who can draw blood.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Hirschk%C3%A4fer_%28Lucanus_cervus%29_on_an_oak.jpg/1920px-Hirschk%C3%A4fer_%28Lucanus_cervus%29_on_an_oak.jpg",
      alt: "A pair of stag beetles mating on the bark of an oak tree",
      credit: "Daniela A. Antoni / Wikimedia Commons",
      title: "Oak, at dusk, in June",
      caption:
        "Adults congregate on sap runs and around suitable dead wood. Males fly on warm evenings to find females, who mostly stay near the site they emerged from.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/GT_Stag_Beetle_alive%2C_abdomen_eaten_by_magpie.jpg/1920px-GT_Stag_Beetle_alive%2C_abdomen_eaten_by_magpie.jpg",
      alt: "A living stag beetle with its head and thorax intact and its abdomen eaten away by a bird",
      credit: "Ian Alexander / Wikimedia Commons",
      title: "What corvids leave behind",
      caption:
        "Magpies and crows take the soft abdomen and discard the armoured front half. The severed head-and-thorax found on paths in June is the commonest sign that stag beetles are around.",
    },
  ],

  headline: "Seven years in a log for one summer in the air",
  intro: [
    "A male stag beetle in flight at dusk on a warm June evening is one of the more improbable sights in a European garden: 70 millimetres of insect, flying almost vertically with its antlers held up, making a noise like a small machine. It is Britain's largest terrestrial beetle and among the largest in Europe.",
    "Nearly all of its life has already happened by then, underground, in the dark. The larva spends at least three or four years — and sometimes seven — inside decaying wood below the soil, and the adult that finally emerges has weeks to find a mate before it dies. Everything about the species' decline follows from that arithmetic: it needs dead wood left where it fell, for years at a time.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Coleoptera",
    family: "Lucanidae",
    genus: "Lucanus",
    species: "Lucanus cervus",
  },

  conservation: {
    status: "NT",
    assessmentYear: 2010,
    populationTrend: "decreasing",
    populationEstimate:
      "No population figures; strongholds in southern England, France, Germany and central Europe, with losses across much of the northern range",
    note: "This is a European regional assessment, not a global one — the species has never been evaluated at world scale, and the Red List entry covers Europe and the EU only. It was assessed Near Threatened in 2010 because it is declining across the north and centre of its range and is close to qualifying as Vulnerable. It is listed on Annex II of the EU Habitats Directive and Appendix III of the Bern Convention, and in the United Kingdom it is on Schedule 5 of the Wildlife and Countryside Act, which protects it from sale rather than from disturbance.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length (male, with mandibles)",
      value: "3.5–7.5 cm",
      min: 3.5,
      max: 7.5,
      unit: "cm",
      note: "Britain's largest terrestrial beetle; in the biggest males the mandibles account for around a third of total length",
    },
    {
      key: "body-length",
      label: "Body length (female)",
      value: "3–5 cm",
      min: 3,
      max: 5,
      unit: "cm",
      note: "Females have short, ordinary mandibles and are frequently mistaken for lesser stag beetles",
    },
    {
      key: "larval-length",
      label: "Larval length",
      value: "Up to about 11 cm when fully grown",
      unit: "cm",
      note: "A C-shaped white grub with an orange head and legs, far larger than the adult it becomes",
    },
    {
      key: "larval-duration",
      label: "Larval stage",
      value: "At least 3–4 years, sometimes 7",
      min: 3,
      max: 7,
      unit: "years",
      note: "Duration depends on temperature and on how well-rotted the wood is",
    },
    {
      key: "larval-depth",
      label: "Larval depth",
      value: "Down to about 0.5 m",
      unit: "m",
      note: "Larvae feed on buried decaying wood — stumps, roots and rotting timber below the soil surface",
    },
    {
      key: "pupal-duration",
      label: "Pupal stage",
      value: "About 3 months",
      unit: "months",
      note: "In a chamber of compacted soil; the adult forms in autumn but stays underground until the following summer",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "A few weeks",
      unit: "weeks",
      note: "Adults emerge from mid-May and most have died by the end of August; none survive the winter",
    },
  ],

  traits: [
    { key: "diet-larva", label: "Larval diet", value: "Decaying broadleaf wood, mostly underground", icon: "Leaf" },
    { key: "diet-adult", label: "Adult diet", value: "Tree sap and fallen fruit — mostly, it does not feed", icon: "Apple" },
    { key: "weapon", label: "Mandibles", value: "Antler-like, used to wrestle rival males", icon: "Swords" },
    { key: "activity", label: "Activity", value: "Males fly at dusk on warm, still evenings", icon: "Moon" },
    { key: "ecological-role", label: "Ecological role", value: "Saproxylic — recycles dead wood", icon: "Recycle" },
    { key: "legal-protection", label: "Legal protection", value: "Habitats Directive Annex II; protected from sale in the UK", icon: "Scale" },
  ],

  highlights: ["length", "larval-duration", "weapon", "lifespan-adult"],

  distribution: {
    continents: ["Europe", "Asia"],
    regions: [
      "Southern and eastern England, absent from Ireland",
      "France, Germany, the Low Countries and central Europe",
      "The Balkans and southern Europe",
      "East to the Caucasus and Asia Minor",
    ],
    habitats: [
      "Broadleaf woodland and wood pasture",
      "Parkland with veteran trees",
      "Hedgerows and orchards",
      "Suburban gardens with old stumps and log piles",
    ],
    elevation: "Mostly lowland, to around 1,000 m in the south of the range",
    note: "In Britain the species is concentrated in the south-east — London, the Thames Valley, the Severn Valley and parts of the south coast — where warm soils and a legacy of old timber suit it. Suburban gardens are genuinely important habitat, often better than modern managed woodland, because they retain stumps, fence posts and log piles.",
  },

  sections: [
    {
      id: "antlers",
      title: "The antlers, and what they cannot do",
      body: [
        "The male's mandibles are the reason for the name and the reason for most of the misunderstanding. They are enormously enlarged, reddish-brown, branched like a red deer's antlers, and in the largest specimens they make up around a third of the beetle's total length. They are also, as weapons against anything other than another stag beetle, close to useless.",
        "The leverage is wrong: the jaws are long, which makes them good for reaching and gripping and bad for generating force. A male can grip a finger and will do so, but the pinch is mild. The female, with short, ordinary mandibles and much better mechanical advantage, is the one that can break skin.",
        "What the antlers are for is wrestling. Males meet on tree trunks and sap runs, rear up, lock jaws, and try to lift and throw one another off the branch. The loser is dropped rather than injured. Mandible size scales disproportionately with body size — a slightly larger beetle has much larger antlers — which is why males vary so much more than females do, and why a small male's best strategy is to avoid the contest altogether.",
      ],
    },
    {
      id: "deadwood",
      title: "The years in the wood",
      body: [
        "A female lays her eggs in soil beside decaying wood, usually the buried roots or stump of a broadleaf tree. The larvae hatch and tunnel into it, and there they stay: fat, C-shaped, white grubs with orange heads, growing to as much as 110 millimetres — considerably longer than the adult beetle — and found as deep as half a metre down.",
        "They cannot digest wood on their own. Like many saproxylic insects they rely on gut microbes and on the fungi that have already begun breaking the timber down, which is why the wood has to be genuinely rotten rather than freshly cut, and why a stump takes years to become useful and then stays useful for years more.",
        "Development takes at least three to four years and can run to seven, depending on temperature and how far decay has progressed. The larva finally builds a chamber of compacted soil the size of an orange, pupates over about three months, and the adult beetle forms in autumn — then stays underground through the winter and digs out the following May or June. By the time you see it, it is essentially finished: adults feed little if at all, living on fat laid down as a grub, and are dead within weeks.",
      ],
    },
    {
      id: "decline",
      title: "Declining, and only regionally assessed",
      body: [
        "The stag beetle is one of the very few insects with any formal Red List standing at all, and it is worth being precise about what that standing is. The 2010 assessment covers Europe and the EU, not the world; there is no global assessment. Within Europe the species is listed as Near Threatened, on the grounds that it is in significant decline through the north and centre of its range and close to qualifying as Vulnerable.",
        "The cause is straightforward: the removal of dead wood. Stumps are ground out, fallen timber is cleared, veteran trees are felled as safety risks, and tidy management strips exactly the material a species with a four-to-seven-year underground larval stage cannot do without. Fragmentation compounds it, because females disperse poorly and a population that loses its wood has no easy route to the next patch.",
        "Adults face their own attrition in the few weeks they have. Magpies, crows and foxes take them — the severed head-and-thorax on a path, abdomen eaten, is the classic field sign — and roads and cats account for many more. That mortality is normal and the species has always sustained it; what it cannot sustain is losing the larval habitat that replaces the losses.",
      ],
    },
    {
      id: "gardens",
      title: "What actually helps",
      body: [
        "Because so much of the British population lives in suburbia, this is one of the rare conservation problems where a garden decision matters. Leaving a stump in the ground rather than grinding it out is the single most useful thing available. Partly buried log piles of broadleaf wood — oak, beech, apple, ash — work too, provided the wood is in contact with soil and left undisturbed for years rather than tidied each spring.",
        "Conifer wood and treated timber are of little use. Neither is a log pile stacked on a patio: the larvae need the damp, fungal interface between rotting wood and earth.",
        "A grounded beetle on a path is usually fine and does not need rescuing, though moving one off a road is reasonable. Records matter as much as habitat here — the national picture for this species rests almost entirely on public sightings submitted to monitoring schemes, and a species that only flies for six weeks a year is very easy to miss.",
      ],
    },
  ],

  related: ["hercules-beetle", "seven-spot-ladybird", "european-mantis"],
  tags: ["beetle", "coleoptera", "deadwood", "europe", "saproxylic", "near threatened"],
  searchTerms: [
    "lucanus cervus",
    "stag beetle uk",
    "biggest beetle in britain",
    "stag beetle larvae",
    "do stag beetles bite",
  ],

  faqs: [
    {
      q: "Do stag beetles bite?",
      a: "The male's antler-like mandibles look alarming but are too long and poorly levered to generate much force — a grip rather than a bite. The female, with short conventional mandibles, has far better mechanical advantage and can give a genuinely painful nip. Neither is dangerous, and neither beetle will approach a person.",
    },
    {
      q: "How long do stag beetles live?",
      a: "Most of the life is the larval stage: at least three to four years underground inside decaying wood, and sometimes as long as seven. The adult emerges from mid-May, lives a few weeks, and is dead by the end of summer. None survive the winter.",
    },
    {
      q: "Are stag beetles endangered?",
      a: "They are assessed as Near Threatened, but only regionally — the 2010 Red List assessment covers Europe and the EU, and the species has never been assessed globally. It is declining across the north and centre of its European range. It is listed on Annex II of the EU Habitats Directive and Appendix III of the Bern Convention, and in the UK it is protected from sale under Schedule 5 of the Wildlife and Countryside Act.",
    },
    {
      q: "What do stag beetle larvae eat?",
      a: "Decaying broadleaf wood, almost always below ground — stumps, buried roots, rotting posts and old timber in contact with soil. They depend on wood that fungi have already started to break down, which is why the timber has to be genuinely rotten and has to be left in place for years.",
    },
    {
      q: "How can I help stag beetles in my garden?",
      a: "Leave dead wood alone. Keeping a tree stump in the ground instead of grinding it out is the most valuable single action; a partly buried pile of broadleaf logs in contact with the soil, left undisturbed, is the next best. Avoid conifer and treated timber, and record any beetles you see — national monitoring for this species depends almost entirely on public sightings.",
    },
  ],

  seo: {
    title: "European Stag Beetle — Antlers, Deadwood & Decline",
    description:
      "A researched profile of the European stag beetle (Lucanus cervus): why the male's antlers cannot bite hard, the years its larvae spend in buried dead wood, and what its Near Threatened European listing does and does not mean.",
    keywords: [
      "stag beetle facts",
      "lucanus cervus",
      "stag beetle larvae",
      "do stag beetles bite",
      "stag beetle conservation",
    ],
  },

  sources: [
    {
      label: "Lucanus cervus — Red List assessment (Europe, 2010)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/157554/44186100",
    },
    {
      label: "Stag beetle facts",
      publisher: "People's Trust for Endangered Species",
      url: "https://ptes.org/campaigns/stag-beetles-2/stag-beetle-facts/",
    },
    {
      label: "European stag beetle — bug directory",
      publisher: "Buglife",
      url: "https://www.buglife.org.uk/bugs/bug-directory/european-stag-beetle/",
    },
    {
      label: "Lucanus cervus — species record, conservation status and legal listings",
      publisher: "EUNIS, European Environment Agency",
      url: "https://eunis.eea.europa.eu/species/221",
    },
  ],

  updatedAt: "2026-07-29",
};

export default europeanStagBeetle;
