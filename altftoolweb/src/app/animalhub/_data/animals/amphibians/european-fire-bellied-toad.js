// European fire-bellied toad — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const europeanFireBelliedToad = {
  slug: "european-fire-bellied-toad",
  category: "amphibians",
  name: "European Fire-bellied Toad",
  scientificName: "Bombina bombina",
  otherNames: ["Fire-bellied toad", "Rotbauchunke", "Red-bellied toad"],

  summary:
    "A small lowland toad, drab as a wet stone from above and scarlet underneath, which arches its back to flash that warning belly — and which meets its mountain cousin along a hybrid zone only a few kilometres wide that has become a textbook case in evolutionary biology.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/31/Bombina_bombina_1_%28Marek_Szczepanek%29.jpg",
    alt: "A European fire-bellied toad on damp ground, grey-brown and warty above",
    credit: "Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Benny_Trapp_Bombina_bombina_Rotbauchunke.jpg/1920px-Benny_Trapp_Bombina_bombina_Rotbauchunke.jpg",
      alt: "A European fire-bellied toad calling at the surface of a pond in Brandenburg, Germany",
      credit: "Benny Trapp / Wikimedia Commons",
      title: "Calling from the surface film",
      caption:
        "Males call while floating, inflating the body and repeating a soft rising note around eighteen times a minute. A pond full of them produces a low, bell-like chorus that carries much further than the size of the animal suggests.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B1%D1%80%D1%8E%D1%85%D0%B0%D1%8F_%D0%B6%D0%B5%D1%80%D0%BB%D1%8F%D0%BD%D0%BA%D0%B0_-_Bombina_bombina_-_European_fire-bellied_toad_-_Rotbauchunke_-_%D0%A7%D0%B5%D1%80%D0%B2%D0%B5%D0%BD%D0%BE%D0%BA%D0%BE%D1%80%D0%B5%D0%BC%D0%BD%D0%B0_%D0%B1%D1%83%D0%BC%D0%BA%D0%B0_%2824839313862%29.jpg/1920px-thumbnail.jpg",
      alt: "A European fire-bellied toad photographed in the field",
      credit: "Katya from Moscow, Russia / Wikimedia Commons",
      title: "Grey above, for good reason",
      caption:
        "Seen from a bank or from the air the animal is grey-green and warty, which is exactly the point: the warning colour is kept underneath, out of sight, and only produced when camouflage has already failed.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B1%D1%80%D1%8E%D1%85%D0%B0%D1%8F_%D0%B6%D0%B5%D1%80%D0%BB%D1%8F%D0%BD%D0%BA%D0%B0_-_Bombina_bombina_-_European_fire-bellied_toad_-_Rotbauchunke_-_%D0%A7%D0%B5%D1%80%D0%B2%D0%B5%D0%BD%D0%BE%D0%BA%D0%BE%D1%80%D0%B5%D0%BC%D0%BD%D0%B0_%D0%B1%D1%83%D0%BC%D0%BA%D0%B0_%2824957279595%29.jpg/1920px-thumbnail.jpg",
      alt: "A European fire-bellied toad at the edge of shallow water",
      credit: "Katya from Moscow, Russia / Wikimedia Commons",
      title: "Tied to shallow, sunlit water",
      caption:
        "Unlike most European toads this one stays aquatic through the warm months, floating in warm shallows over dense underwater vegetation. Deep, shaded or fish-stocked water will not do.",
    },
  ],

  headline: "The toad that shows you its belly",

  intro: [
    "The European fire-bellied toad is a small, flat-headed amphibian of lowland floodplains from eastern Germany to the Volga. From above it is grey, olive or brown and covered in low warts, and in a weedy pond it is almost impossible to pick out. Turn it over and the underside is a startling map of scarlet or orange on black.",
    "That contrast is the whole strategy. When something threatens it the toad arches its spine, throws its limbs back over its body and holds the pose so the coloured belly and palms face the attacker — a posture herpetologists still call by its German name, the Unkenreflex. Behind the display sits real chemistry: the skin secretes bombinin peptides and Bv8 prokineticins, the second of which was first found in this genus.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Bombinatoridae",
    genus: "Bombina",
    species: "Bombina bombina",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2023,
    populationTrend: "decreasing",
    populationEstimate: "Still fairly abundant over much of its range; no global count",
    note: "Least Concern here describes a very large eastern range, not the state of the species at its edges. The same 2023 assessment records a decreasing trend, and the northern and western populations have been squeezed hard: Denmark held fifteen known breeding populations in 1974 and eight by 1988. Where ponds have been dug back in — most famously on Funen in Denmark — numbers have recovered roughly fivefold in a decade, so the decline is a habitat problem with a habitat solution.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "4–5.6 cm",
      min: 4,
      max: 5.6,
      unit: "cm",
      note: "Snout to vent. It rarely exceeds 6 cm, making it one of Europe's smaller amphibians.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 11 years in the wild",
      min: 11,
      max: 11,
      unit: "years",
      note: "A captive individual reached 20 years, recorded in the AnAge longevity database.",
    },
    {
      key: "clutch-size",
      label: "Eggs per season",
      value: "More than 300 eggs",
      min: 300,
      max: 300,
      unit: "eggs",
      note: "Not laid in one mass. Females attach small row-shaped batches of up to about 30 eggs to underwater plants over several nights.",
    },
    {
      key: "tadpole-stage",
      label: "Tadpole stage",
      value: "About 4 weeks",
      min: 4,
      max: 4,
      unit: "weeks",
      note: "Eggs hatch within a few days of being laid; metamorphosis follows roughly a month later.",
    },
    {
      key: "call-rate",
      label: "Call rate",
      value: "About 18 calls per minute",
      min: 18,
      max: 18,
      unit: "calls/minute",
      note: "Delivered from the water surface with the body inflated, usually as a chorus rather than a solo.",
    },
    {
      key: "hybrid-zone",
      label: "Hybrid zone width",
      value: "2–7 km",
      min: 2,
      max: 7,
      unit: "km",
      note: "The band where this species meets and interbreeds with the yellow-bellied toad, Bombina variegata.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — springtails, beetles, flies, ants and other small invertebrates",
      icon: "Drumstick",
    },
    {
      key: "defence-display",
      label: "Defence",
      value: "Unkenreflex — arches the back and limbs to flash a red-and-black belly",
      icon: "ShieldAlert",
    },
    {
      key: "skin-toxin",
      label: "Skin secretions",
      value: "Bombinin peptides and Bv8 prokineticins, first described from this genus",
      icon: "Biohazard",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — shallow, sunlit, fish-free lowland ponds",
      icon: "Droplet",
    },
    {
      key: "range-size",
      label: "Range",
      value: "Central and Eastern Europe, from Denmark east to the Volga",
      icon: "MapPin",
    },
  ],

  highlights: ["length", "defence-display", "hybrid-zone", "range-size"],

  distribution: {
    continents: ["Europe", "Asia"],
    regions: [
      "Eastern Germany, Denmark and southern Sweden at the north-western edge",
      "Poland, Czechia, Slovakia, Hungary, Romania and the Balkans",
      "European Russia east to the Volga",
      "South to Bulgaria and the Marmara region of Turkey",
    ],
    habitats: [
      "Lowland floodplain ponds and oxbows",
      "Marshes and flooded meadows",
      "Reed-fringed shallows of larger lakes",
    ],
    elevation:
      "A lowland animal. On rising ground it is replaced by the yellow-bellied toad, which takes the puddles and ruts of the hills.",
    note: "An introduced population has been established in Lorraine, France, more than 500 km from the nearest natural range and first noticed in 2009. It has since spread across several nearby sites, and because it can hybridise with the native yellow-bellied toad it is treated as a genuine problem rather than a curiosity.",
  },

  sections: [
    {
      id: "unkenreflex",
      title: "The warning underneath",
      body: [
        "Aposematic animals usually advertise constantly — a fire salamander is yellow and black whether anything is watching or not. The fire-bellied toad splits the job in two. Its back is cryptic, matched to mud and weed, and the advertisement is stored on the surface no predator sees until the animal chooses to show it.",
        "The Unkenreflex is that choice made visible. Touched or cornered, the toad hollows its back, lifts its chin and folds its limbs upward so the scarlet palms, soles and belly all point at whatever is looming over it. Small animals sometimes flip right over. Held for a few seconds, it turns a grey lump into a coloured hazard sign.",
        "The chemistry is not a bluff. Bombina skin secretes bombinins, antimicrobial peptides with measurable antibacterial and antifungal activity, and Bv8 prokineticins, a class of signalling molecules first isolated from this species and its close relative. The secretion is unpleasant enough to make a predator drop the toad and remember the colour.",
      ],
    },
    {
      id: "hybrid-zone",
      title: "Where two toads meet",
      body: [
        "Across Central Europe the fire-bellied toad's range abuts that of the yellow-bellied toad, Bombina variegata. The two are old lineages that diverged millions of years ago, yet where they meet they interbreed — and they do it in a band only two to seven kilometres wide.",
        "That narrowness is the interesting part. Hybrids are produced in quantity but do less well than either parent, so gene flow leaks across the contact and then stalls. The zone therefore sits more or less in place rather than one species swamping the other, and it has become one of the most heavily studied natural experiments in speciation.",
        "The ecological difference behind it is easy to see in the field. Bombina bombina wants permanent, warm, well-vegetated lowland ponds and spends the summer in the water; Bombina variegata wants the ephemeral puddles, ruts and seepages of higher ground and is far more terrestrial, with longer legs to match. The habitats meet where the floodplain meets the hills, and so do the toads.",
      ],
    },
    {
      id: "the-pond",
      title: "A summer spent floating",
      body: [
        "Most European anurans visit water to breed and then leave. This one stays. From spring until late summer adults float in warm shallows over dense submerged plants, dropping to the bottom when disturbed and coming up again a few minutes later.",
        "Breeding starts once the water reaches about 16 °C and runs on through the warm months rather than being crammed into a few nights. Males develop dark nuptial pads on the first two fingers and the inner forearms to grip a female in amplexus, and a female will lay more than three hundred eggs across a season — but in small row-shaped clutches of up to thirty, stuck to stems, instead of the single raft a common frog produces. Spreading the risk suits an animal whose ponds can be shallow, warm and unpredictable.",
        "Tadpoles hatch within days and metamorphose after roughly a month. Adults leave the water in autumn and overwinter on land, under stones, dead wood and root plates, well away from the pond that defined the rest of their year.",
      ],
    },
    {
      id: "decline",
      title: "Ponds, drainage and a slow retreat",
      body: [
        "The fire-bellied toad needs a specific and increasingly rare thing: a permanent, shallow, sunlit, fish-free pond in open lowland with grazed or damp ground around it. Floodplain drainage, river straightening, agricultural intensification and the loss of grazing have removed exactly that combination across much of northern and western Europe.",
        "The decline shows most clearly at the range edge. Denmark's known breeding populations fell from fifteen in 1974 to eight in 1988. In Poland the species is described as uncommon in some protected landscapes, and a Warsaw amphibian survey found it made up less than a tenth of the amphibians recorded. Water pollution, pesticides and the chytrid fungus Batrachochytrium dendrobatidis are all present in the picture as well.",
        "What makes the species unusually hopeful is how directly it responds to construction work. In Funen County, Denmark, dozens of new ponds were dug specifically for it, and the population rose roughly fivefold within a decade. EU LIFE projects — LIFE AMPHICON among them — have since restored and created breeding ponds, built amphibian underpasses and reinforced populations on the same principle. Dig the right pond and the toad comes back.",
      ],
    },
  ],

  related: ["common-toad", "common-frog", "smooth-newt"],
  tags: ["toad", "europe", "aposematism", "hybrid zone", "freshwater", "least concern"],
  searchTerms: [
    "bombina bombina",
    "fire bellied toad",
    "firebelly toad",
    "unkenreflex",
    "rotbauchunke",
    "red bellied toad europe",
  ],

  faqs: [
    {
      q: "Why does a fire-bellied toad show its belly?",
      a: "It is a warning display called the Unkenreflex. The toad arches its back and folds its limbs upward so the scarlet-and-black belly, palms and soles all face the threat. The back is deliberately drab, so the colour stays hidden until camouflage has failed — and the skin behind it really does secrete bombinin peptides that make the animal unpleasant to bite.",
    },
    {
      q: "Is the European fire-bellied toad poisonous to humans?",
      a: "It is not dangerous, but it is not inert either. The skin secretes bombinins and Bv8 prokineticins, which are irritating to mucous membranes. Handling one and then rubbing your eyes is genuinely unpleasant, and as with all amphibians it is better for the animal not to be handled at all.",
    },
    {
      q: "What is the difference between the fire-bellied toad and the yellow-bellied toad?",
      a: "Bombina bombina has a red or orange belly, prefers permanent warm lowland ponds and stays aquatic through the summer. Bombina variegata has a yellow belly, longer legs, and lives in the ephemeral puddles and ruts of higher ground. Where their ranges touch they interbreed in a hybrid zone only two to seven kilometres wide, which has made the pair a standard case study in how species stay separate.",
    },
    {
      q: "Is the European fire-bellied toad endangered?",
      a: "Globally it is listed as Least Concern, on the strength of a very large eastern range. That status hides a decreasing trend and serious losses at the north-western edge — Denmark's known breeding populations halved between 1974 and 1988. Purpose-dug ponds have reversed the decline locally, which is why conservation for this species is mostly a matter of digging.",
    },
    {
      q: "What does a fire-bellied toad sound like?",
      a: "A soft, rising, bell-like note repeated about eighteen times a minute, given from the water surface with the body inflated. Individual calls are quiet, but a whole pond calling together carries a long way on a still evening and is the usual way the species is detected.",
    },
  ],

  seo: {
    title: "European Fire-bellied Toad — Unkenreflex, Hybrid Zone & Range",
    description:
      "A researched profile of the European fire-bellied toad (Bombina bombina): the Unkenreflex warning display, its skin peptides, the famous hybrid zone with the yellow-bellied toad, and why it is disappearing from northern Europe.",
    keywords: [
      "european fire-bellied toad",
      "bombina bombina",
      "unkenreflex",
      "fire bellied toad facts",
      "bombina hybrid zone",
    ],
  },

  sources: [
    {
      label: "Bombina bombina — Red List assessment (2023, e.T2865A89699662)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/2865/89699662",
    },
    {
      label: "Fire-bellied toad — species account, breeding and habitat requirements",
      publisher: "LIFE AMPHICON (EU LIFE programme)",
      url: "https://www.lifeamphicon.eu/fire-bellied-toad-bombina-bombina/",
    },
    {
      label: "Bombina bombina — longevity record",
      publisher: "AnAge, Human Ageing Genomic Resources",
      url: "https://genomics.senescence.info/species/entry.php?species=Bombina_bombina",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default europeanFireBelliedToad;
