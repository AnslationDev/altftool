// Giant water bug — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const giantWaterBug = {
  slug: "giant-water-bug",
  category: "insects",
  name: "Giant Water Bug",
  scientificName: "Lethocerus americanus",
  otherNames: ["Toe-biter", "Electric light bug", "Fish killer"],

  summary:
    "A palm-sized ambush predator of North American ponds that stabs frogs and small fish, liquefies them from the inside, and gives one of the most painful bites any insect can deliver to a person.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Lethocerus_americanus.jpg/1920px-Lethocerus_americanus.jpg",
    alt: "A giant water bug out of water in grass, its flat brown body angled forward and hooked front legs gripping a pale plant stem",
    credit: "The High Fin Sperm Whale / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Giantwaterbug.jpg",
      alt: "A giant water bug standing in short green grass, its heavy hooked front legs held forward",
      credit: "Ken Aycock Billings, Montana / Wikimedia Commons",
      title: "Oars at the back, hooks at the front",
      caption:
        "The rear legs are flattened and fringed for swimming; the front pair are raptorial, folding like a mantis's to hold prey while the beak goes in. Almost nothing about the body is arranged for pursuit.",
    },
  ],

  headline: "Toe-biter is not a nickname anyone invented for fun",
  intro: [
    "Lethocerus americanus is the largest true bug in most of North America, five to six centimetres of flat brown ambush predator that hangs motionless in weedy pond margins with the tip of its abdomen at the surface. It takes insects, tadpoles, snails, small fish, and frogs considerably larger than itself, and it does not chew any of them.",
    "One thing widely repeated about giant water bugs needs correcting where this species is concerned. In many belostomatids the female glues her eggs onto the male's back and he carries them until they hatch — a genuinely famous piece of insect behaviour. Lethocerus does not do that. Its eggs go on a plant stem above the waterline, and the male's job is to climb out of the pond and keep them wet, which turns out to matter more than it sounds.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Hemiptera",
    family: "Belostomatidae",
    genus: "Lethocerus",
    species: "Lethocerus americanus",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate exists; the species is widely distributed across southern Canada and the northern United States and is a familiar animal to pond-dippers, though never abundant in any one place",
    note: "Never assessed against the Red List criteria, which is the case for nearly all aquatic true bugs. There is no evidence of decline in this species, but the pressures on it are not hypothetical: it is a large predator of small, still, weedy fresh water, and the loss and drainage of wetlands, agricultural run-off and declining water quality all remove that habitat. Because adults disperse by flying at night, artificial light draws them off course and away from water — dead specimens under streetlamps are a common enough sight to have been remarked on in the medical literature. Congeners elsewhere have fared worse: some Asian Lethocerus are formally protected, and several giant water bugs are harvested for food in Southeast Asia.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "About 5–6 cm",
      min: 5,
      max: 6,
      unit: "cm",
      note: "The largest true bug across most of its range; other Lethocerus species in the tropics reach 9 cm and above",
    },
    {
      key: "clutch-size",
      label: "Eggs per mass",
      value: "About 70–100, sometimes more",
      min: 70,
      max: 100,
      unit: "eggs",
      note: "Glued in contiguous rows on an emergent stem above the waterline; a female may lay 150 or more across her life",
    },
    {
      key: "egg-duration",
      label: "Egg stage",
      value: "About 2 weeks",
      min: 2,
      max: 2,
      unit: "weeks",
    },
    {
      key: "digestion-time",
      label: "External digestion before feeding",
      value: "About 10–15 minutes",
      min: 10,
      max: 15,
      unit: "minutes",
      note: "The bug holds the prey and waits while injected enzymes break down the tissue, then drinks the result",
    },
    {
      key: "saliva-components",
      label: "Components identified in Lethocerus saliva",
      value: "Up to 132",
      max: 132,
      unit: "compounds",
      note: "A complex cocktail dominated by proteases; it is a digestive fluid rather than a venom in the medical sense",
    },
    {
      key: "bite-pain-duration",
      label: "Duration of bite pain",
      value: "Usually resolves within about 5 hours",
      max: 5,
      unit: "hours",
      note: "Intense throbbing and swelling, but no lasting damage in an otherwise healthy person",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Insects, tadpoles, frogs, snails, crayfish and small fish", icon: "Fish" },
    { key: "hunting-strategy", label: "Hunting", value: "Ambush — hangs motionless and seizes prey with raptorial forelegs", icon: "Target" },
    { key: "defence", label: "Defence", value: "Camouflage, then playing dead, then a serious bite", icon: "ShieldAlert" },
    { key: "respiration", label: "Breathing", value: "Air stored under the wings, drawn in through retractable straps at the abdomen tip", icon: "Wind" },
    { key: "parental-care", label: "Parental care", value: "The male guards the egg mass and climbs out of the water to wet it", icon: "Droplets" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal; disperses by flying at night", icon: "Moon" },
  ],

  highlights: ["body-length", "parental-care", "digestion-time", "defence"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Southern Canada from British Columbia to the Maritimes",
      "The northern and central United States, generally north of about 35°N",
      "Replaced further south by other Lethocerus species",
    ],
    habitats: [
      "Ponds and marshes",
      "Lake margins with emergent vegetation",
      "Slow streams and creeks",
      "Weedy ditches and backwaters",
    ],
    elevation: "Lowland to montane; the requirement is still, weedy fresh water rather than a particular altitude",
    note: "The species needs still or slow water with emergent plants — stems to ambush from, and stems above the surface to lay eggs on. Adults fly between water bodies at night, which is why they turn up in swimming pools, on wet roads and under lights well away from any pond. Winter is spent buried in mud and leaf litter at the bottom.",
  },

  sections: [
    {
      id: "toe-biter",
      title: "The bite, and what it actually is",
      body: [
        "The common name is descriptive. A giant water bug trodden on in shallow water, or picked up carelessly, will drive its rostrum — a stout, hinged beak — into the skin, and the result is one of the most painful bites available from any insect. The pain is immediate, throbbing and out of all proportion to the size of the wound.",
        "It is important to be precise about the mechanism, because it is often described as venomous and that is not quite right. What goes into the wound is saliva: a digestive fluid built around proteolytic enzymes and, in Lethocerus, containing well over a hundred identified components. It is designed to dissolve a tadpole, not to defend against a mammal. On human tissue it produces intense local pain and swelling that usually subsides within about five hours, with no lasting damage in a healthy person.",
        "The bug is not aggressive about it. Disturbed in water it swims off, relying on speed and camouflage. On land it will first try to escape, then play dead, then raise its forelegs and abdomen in something that looks a great deal like a fighting stance. Only if all of that is ignored does it bite. Very nearly every recorded bite involves someone picking one up.",
      ],
    },
    {
      id: "feeding",
      title: "Eating without a mouth",
      body: [
        "The giant water bug hangs in weed near the surface, front legs folded, waiting. When something swims within range those forelegs snap shut — they are raptorial, hinged and hooked, working on the same principle as a mantis's — and the rostrum goes in. From that point the bug does not need to do anything else fast.",
        "What follows is extra-oral digestion. Saliva loaded with protein-splitting enzymes is pumped into the prey, and the animal is liquefied where it is held. The bug waits roughly ten to fifteen minutes for this to work and then drinks the contents out through the same beak. There is no chewing, no swallowing of solids, and nothing left but a shell.",
        "That method removes the usual limit on prey size. A five-centimetre insect that had to bite pieces off could not eat a frog; one that dissolves its food can take frogs, salamanders, snails, crayfish and small fish well beyond its own mass. Individuals have been seen sharing a single large prey animal. It is the most consequential thing about the species ecologically: it puts an insect near the top of a small pond's food web.",
      ],
    },
    {
      id: "male-brooding",
      title: "The eggs go on a stick, not on his back",
      body: [
        "Belostomatid parental care is one of the standard examples in behavioural ecology, and it comes in two forms that are routinely conflated. In the subfamily Belostomatinae — Belostoma, Abedus and relatives — the female cements her eggs directly onto the male's back and he carries them everywhere until they hatch. That is the version in the photographs everybody has seen.",
        "Lethocerus is in the other subfamily, Lethocerinae, and does it differently. After mating, the female glues her eggs in tight contiguous rows onto an emergent plant stem, or occasionally a post, high enough above the water that they will not be submerged. The male stays at the base of that stem underwater during the day and climbs the stem at night, laying his wet body across the egg mass to soak it, over and over, for the fortnight it takes them to develop. He also drives off predators.",
        "The wetting is not incidental — it is the whole job. Field and laboratory work on the Japanese congener Lethocerus deyrollei quantified it: egg masses tended by a male hatched at around 94%, masses left unattended dried out and hatched at zero, and masses that were artificially watered but had no male present hatched at about 93%. Male care in this genus is, functionally, a plumbing arrangement. Eggs out of the water are safe from aquatic predators and from fish, and the cost of that safety is that somebody has to carry the water up.",
      ],
    },
    {
      id: "electric-light-bug",
      title: "Why one turns up on your driveway",
      body: [
        "Giant water bugs are strong fliers and disperse between ponds at night, which is when they meet the modern landscape. They are drawn powerfully to artificial light — hence the second name, electric light bug — and end up circling streetlamps, service-station forecourts and lit swimming pools.",
        "The consequences are not trivial for the individual. A 1998 note in the Dermatology Online Journal, written up after the usual crop of summer bites, suggested that the dead specimens found under streetlights are bugs that had been disoriented into spiralling flight paths and flown themselves to exhaustion. Any large aquatic insect that navigates by the sky is exposed to the same problem.",
        "Underwater, the species solves a different logistical problem elegantly. It carries an air store under its wings and replenishes it through a pair of short retractable straps at the tip of the abdomen, pushed through the surface film like a snorkel while the rest of the animal stays hidden below. That is why a giant water bug in ambush hangs head-down with only a few millimetres of its rear end showing — it is breathing, and staying invisible while it does.",
      ],
    },
  ],

  related: ["emperor-dragonfly", "european-mantis", "bullet-ant"],
  tags: ["true bug", "hemiptera", "freshwater", "north america", "ambush predator", "parental care"],
  searchTerms: [
    "lethocerus americanus",
    "toe biter",
    "electric light bug",
    "giant water bug bite",
    "do giant water bugs carry eggs on their back",
  ],

  faqs: [
    {
      q: "Do male giant water bugs carry eggs on their backs?",
      a: "Not this one. Back-brooding is the habit of the subfamily Belostomatinae — Belostoma and Abedus — where the female glues her eggs onto the male. Lethocerus americanus belongs to the Lethocerinae: the female lays on a plant stem above the waterline, and the male guards the mass and climbs out of the water repeatedly to wet it.",
    },
    {
      q: "How painful is a giant water bug bite?",
      a: "It is among the most painful bites any insect can inflict, with immediate throbbing pain and swelling. It is not truly venomous — what is injected is digestive saliva loaded with protein-splitting enzymes, intended for tadpoles rather than people. The pain normally settles within about five hours and leaves no lasting damage.",
    },
    {
      q: "What do giant water bugs eat?",
      a: "Aquatic insects, tadpoles, frogs, salamanders, snails, crayfish and small fish, including prey much larger than themselves. They ambush with raptorial front legs, inject digestive enzymes through a beak, wait ten to fifteen minutes while the prey is liquefied, and then drink it — a method called extra-oral digestion.",
    },
    {
      q: "Why is it called the electric light bug?",
      a: "Because adults fly between water bodies at night and are strongly attracted to artificial light, gathering at streetlamps, forecourts and lit pools. Dead specimens found under streetlights are thought to be bugs disoriented into spiralling flight until they exhaust themselves.",
    },
    {
      q: "How does a giant water bug breathe underwater?",
      a: "It carries an air supply beneath its wings and refreshes it through a pair of short retractable straps at the tip of the abdomen, pushed up through the surface film like a snorkel. This lets the bug hang almost entirely submerged and motionless while it waits for prey.",
    },
  ],

  seo: {
    title: "Giant Water Bug — Toe-Biter Bite, Diet & Male Egg Brooding",
    description:
      "A researched profile of the giant water bug (Lethocerus americanus): why its bite hurts so much, how extra-oral digestion lets it eat frogs and fish, and why its males water eggs on a stem rather than carrying them on their backs.",
    keywords: [
      "giant water bug",
      "lethocerus americanus",
      "toe biter",
      "giant water bug bite",
      "electric light bug",
    ],
  },

  sources: [
    {
      label: "Lethocerus americanus, the 'toe biter' (Huntley, 1998)",
      publisher: "Dermatology Online Journal, via PubMed",
      url: "https://pubmed.ncbi.nlm.nih.gov/10328676/",
    },
    {
      label: "Male brooding behaviour of the giant water bug Lethocerus deyrollei",
      publisher: "Journal of Ethology, Springer",
      url: "https://link.springer.com/content/pdf/10.1007/BF02350877.pdf",
    },
    {
      label: "Egg attendance and brooding by males of the giant water bug Lethocerus medius in the field",
      publisher: "Journal of Insect Behavior, Springer",
      url: "https://link.springer.com/article/10.1007/BF01049150",
    },
    {
      label: "Giant water bugs revisited — bug of the week",
      publisher: "UWM Field Station, University of Wisconsin–Milwaukee",
      url: "https://uwm.edu/field-station/bug-of-the-week/giant-water-bugs-revisited/",
    },
    {
      label: "Lethocerus americanus (Leidy, 1847) — taxonomic record",
      publisher: "Global Biodiversity Information Facility (GBIF)",
      url: "https://www.gbif.org/species/2007585",
    },
  ],

  updatedAt: "2026-07-29",
};

export default giantWaterBug;
