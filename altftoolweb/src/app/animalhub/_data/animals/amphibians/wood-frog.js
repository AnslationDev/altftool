// Wood frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const woodFrog = {
  slug: "wood-frog",
  category: "amphibians",
  name: "Wood Frog",
  scientificName: "Lithobates sylvaticus",
  otherNames: ["Rana sylvatica"],

  summary:
    "A small brown frog of North American woodland that spends each winter frozen solid in the leaf litter — ice through its body cavity, no heartbeat, no breathing — and thaws out intact in spring, which is how it became the only frog on the continent living north of the Arctic Circle.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Lithobates_sylvaticus_%28Woodfrog%29.jpg/1920px-Lithobates_sylvaticus_%28Woodfrog%29.jpg",
    alt: "A wood frog on leaf litter, tan-brown with a dark mask running back from the eye",
    credit: "Brian Gratwicke / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/063_366_-_Wood_Frog_-_Lithobates_sylvaticus_with_Northern_Frog-biting_Mosquito_-_Culex_territans%2C_Lake_Accotink_Park%2C_Springfield%2C_Virginia%2C_March_3%2C_2024_%2853565225117%29.jpg/1920px-thumbnail.jpg",
      alt: "A wood frog in Virginia with a northern frog-biting mosquito on its skin",
      credit: "Judy Gallagher / Wikimedia Commons",
      title: "Found by ear, and by mosquito",
      caption:
        "The mosquito on this frog is Culex territans, a species that feeds on amphibians and locates them by homing in on their calls. Chorusing in early spring is how wood frogs find each other — and how some things find wood frogs.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Lithobates_sylvaticus_%28wood_frog%29.jpg/1920px-Lithobates_sylvaticus_%28wood_frog%29.jpg",
      alt: "A young wood frog on damp ground",
      credit: "MichaelZahniser / Wikimedia Commons",
      title: "Out of the pool by midsummer",
      caption:
        "Wood frogs breed in woodland pools that dry up later in the year, so tadpoles have to metamorphose fast. Young frogs like this one leave the water within about two months of hatching and spend the rest of their lives on the forest floor.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lithobates_sylvaticus_-_Wood_Frog_01.jpg/1920px-Lithobates_sylvaticus_-_Wood_Frog_01.jpg",
      alt: "A wood frog photographed in Polk County, Minnesota, showing the dark eye mask",
      credit: "Jasper Shide / Wikimedia Commons",
      title: "The mask is the field mark",
      caption:
        "Body colour shifts with light and season, running from pale tan through rust to near black, but the dark patch behind the eye is constant. It is the quickest way to name a small brown frog in North American woodland.",
    },
  ],

  headline: "It freezes solid every winter, and that is the plan",

  intro: [
    "The wood frog is an unremarkable-looking animal — 5 to 7 cm long, tan or rust-brown, with a dark robber's mask running back from each eye — with a genuinely remarkable physiology. Each autumn it settles into the leaf litter of the forest floor, and when the ground freezes, so does it. Ice forms in the body cavity and between the cells, the heart stops, breathing stops, and measurable brain activity ceases. In this state the animal is, by any ordinary clinical definition, dead.",
    "Weeks or months later it thaws from the inside out, the heart restarts, and the frog hops off to breed. This one trick is what has taken it further north than any other North American frog: it is the only one found above the Arctic Circle, and Alaskan populations have been recorded frozen for well over six months at a stretch with every animal surviving.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Ranidae",
    genus: "Lithobates",
    species: "Lithobates sylvaticus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2022,
    populationTrend: "stable",
    populationEstimate: "Abundant and widespread across northern North America; no global count",
    note: "The species itself is secure — the 2022 assessment cites a wide distribution, many subpopulations and a presumed large population. The habitat is not. Wood frogs are effectively obligate breeders in ephemeral woodland pools, and those pools are often too small and too temporary to register in wetland legislation, so they are drained, filled and forested over far more readily than permanent ponds. Conserving an abundant frog here means conserving puddles that legally barely exist.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "3.5–7.6 cm",
      min: 3.5,
      max: 7.6,
      unit: "cm",
      note: "Snout to vent. Most adults fall between 5 and 7 cm, and females are larger than males.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "About 8 g",
      min: 8,
      max: 8,
      unit: "g",
      note: "An average figure; a gravid female weighs appreciably more.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "3–5 years in the wild",
      min: 3,
      max: 5,
      unit: "years",
      note: "Females consistently outlive males, for reasons that are not understood.",
    },
    {
      key: "freeze-tolerance",
      label: "Lowest survivable body temperature",
      value: "About −16 °C experimentally; −18 °C in the wild",
      min: -18,
      max: -16,
      unit: "°C",
      note: "Frogs from temperate populations tolerate only about −3 to −6 °C. Interior Alaskan hibernacula fall to between −9 and −18 °C.",
    },
    {
      key: "frozen-duration",
      label: "Time spent frozen",
      value: "Up to 218 days",
      min: 193,
      max: 218,
      unit: "days",
      note: "Alaskan frogs in natural hibernacula stayed frozen for 193 ± 11 consecutive days with 100% survival.",
    },
    {
      key: "ice-fraction",
      label: "Body water turned to ice",
      value: "65–70%",
      min: 65,
      max: 70,
      unit: "%",
      note: "Individual organs shed even more: the liver loses up to two-thirds of its water and skeletal muscle up to half.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1,000–3,000 eggs",
      min: 1000,
      max: 3000,
      unit: "eggs",
      note: "Laid as one globular mass. A whole population spawns in the same corner of a pool within a few days.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "1–3 years",
      min: 1,
      max: 3,
      unit: "years",
      note: "Males mature one to two years after metamorphosis, females two to three.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — insects, spiders, slugs, snails and worms taken on the forest floor",
      icon: "Drumstick",
    },
    {
      key: "overwintering",
      label: "Overwintering",
      value: "Frozen in leaf litter, with no heartbeat, no breathing and no brain activity",
      icon: "Snowflake",
    },
    {
      key: "cryoprotectant",
      label: "Cryoprotectants",
      value: "Glucose dumped from liver glycogen, plus urea accumulated through autumn",
      icon: "FlaskConical",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — ephemeral woodland vernal pools, fish-free by definition",
      icon: "Droplet",
    },
    {
      key: "range-size",
      label: "Range",
      value: "The only North American frog found north of the Arctic Circle",
      icon: "MapPin",
    },
  ],

  highlights: ["freeze-tolerance", "frozen-duration", "overwintering", "range-size"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Alaska and across the Canadian boreal forest to Labrador",
      "The northern and eastern United States",
      "South along the Appalachians to northern Georgia",
      "Disjunct lowland populations including eastern North Carolina",
    ],
    habitats: [
      "Deciduous and coniferous forest floor",
      "Woodland vernal pools",
      "Peat bogs, wet meadows and tundra thickets",
    ],
    elevation: "Sea level to montane Appalachian forest",
    note: "This is the most widely distributed frog in Alaska and the most northerly amphibian in North America. Individual frogs move hundreds of metres between breeding pools and the swamps, ravines and uplands they spend the rest of the year in, and the genetic neighbourhood of a single pool extends more than a kilometre — so the animal's real habitat is a landscape, not a pond.",
  },

  sections: [
    {
      id: "freezing",
      title: "How a frog survives freezing",
      body: [
        "Freezing kills most animals for two reasons: ice crystals tear cells apart, and water drawn out into growing ice leaves what remains lethally concentrated. The wood frog does not prevent ice. It controls where the ice forms and protects everything the ice is not allowed to reach.",
        "The trigger is contact. When ice touches the frog's damp skin it nucleates immediately, and freezing spreads inward far faster than it would if the animal supercooled first. Within minutes of that first nucleation the liver begins breaking down its stored glycogen and floods the bloodstream with glucose, reaching concentrations of a few hundred millimolar — levels that would be catastrophic in a mammal. The glucose is pumped into cells, where it holds water in place and stops them collapsing as extracellular ice grows around them.",
        "Northern populations add a second cryoprotectant well in advance. Alaskan wood frogs accumulate urea through late summer and autumn, before any freezing occurs, reaching plasma levels around 85 µmol per ml in well-hydrated animals and more than double that in frogs kept dry. Combining an anticipatory cryoprotectant with a reactive one is what separates the extreme northern populations from the merely freeze-tolerant southern ones.",
        "By the time freezing is complete, roughly 65 to 70 percent of the frog's total body water has turned to ice, concentrated in the body cavity and under the skin. The liver has shed up to two-thirds of its water and skeletal muscle up to half. Blood has stopped circulating, the heart is still, and there is no breathing and no detectable brain activity.",
      ],
    },
    {
      id: "the-limits",
      title: "How cold, and for how long",
      body: [
        "Freeze tolerance in this species is not one fixed capability — it scales with where the frog lives. Wood frogs from Ohio and other temperate populations survive freezing to about −3 to −6 °C. Frogs from interior Alaska readily survive experimental freezing to −16 °C.",
        "The field data are more striking than the laboratory data. Alaskan frogs tracked in their natural hibernacula — shallow scrapes under leaf litter, with no burrow and no insulation beyond what the forest floor provides — stayed frozen for 193 ± 11 consecutive days, with individuals reaching 218 days. Hibernaculum temperatures fell to between −8.9 and −18.1 °C. Survival was 100 percent.",
        "Naturally frozen frogs also proved better protected than laboratory-frozen ones, carrying roughly thirteen times the glucose in muscle, ten times in heart and three times in liver. Repeated shallow freeze–thaw cycles through autumn appear to prime the system, so the animal that meets deep winter is already loaded.",
      ],
    },
    {
      id: "thawing",
      title: "Coming back",
      body: [
        "Thawing is not simply freezing in reverse. The frog warms from the inside outward: the core, the heart and the liver recover before the extremities, which means circulation is restored before the limbs are asked to work. The heart restarts on its own, breathing resumes, and within hours a frog that had no pulse is moving normally.",
        "Timing is the payoff. Because the wood frog overwinters on land, it is already in place when the snow goes and does not have to migrate from a deep pond. It is often the first frog calling in a North American spring, sometimes with ice still on the pool, and its clucking, duck-like chorus is a standard first sign of the season across the boreal forest.",
        "The cost is that the animal is spending down reserves. Repeated freezing draws on liver glycogen, and a frog that survives an unusually long or unusually mild, freeze–thaw-cycling winter arrives at the breeding pool in worse condition. Warmer, less reliably snow-covered winters are not obviously good news for a species whose insulation is the snowpack.",
      ],
    },
    {
      id: "vernal-pools",
      title: "Explosive breeding in a puddle",
      body: [
        "Wood frogs are effectively obligate breeders in vernal pools: woodland depressions that fill with snowmelt and rain and dry out by late summer. The drying is the point. A pool that dries cannot hold fish, and fish are the main predators of frog eggs and tadpoles.",
        "Breeding is explosive. A whole population converges on the same pool over a few nights in early spring, males calling, and females each lay a single globular mass of one to three thousand eggs. The masses are typically laid together in the same shallow corner, where the clustered jelly holds warmth and shelters the inner eggs.",
        "Everything then runs against a clock. Tadpoles have roughly two months to hatch, grow and metamorphose before the pool disappears, and in a dry year it disappears first. Young frogs leave the water in early summer and disperse into the forest, sometimes hundreds of metres, with the genetic neighbourhood around one pool extending more than a kilometre.",
        "That combination — total dependence on small, temporary, legally invisible water bodies, plus long-distance movement through the forest between them — is why an abundant frog is still a conservation subject. Protecting wood frogs means protecting puddles, and the woodland connecting them.",
      ],
    },
    {
      id: "research",
      title: "Why cryobiologists care",
      body: [
        "Organ transplantation runs on a clock measured in hours, because cooling a human organ far enough to store it for long causes exactly the damage the wood frog avoids: ice crystal injury, cell dehydration, and the ischaemia–reperfusion damage that follows restarting the blood supply.",
        "The wood frog solves all three problems at once, in a whole animal, repeatedly, without medical intervention. That has made it a standard model in cryobiology and organ preservation research — not because anyone expects to freeze a human, but because the frog demonstrates which biochemical problems are actually solvable and how a body can be brought back from complete circulatory arrest without injury.",
        "The specific mechanisms under study include the speed of the glucose surge, antifreeze glycolipids found in naturally frozen tissues, the tolerance of the heart to being restarted after months of arrest, and the antioxidant and protein-chaperone responses that handle the reperfusion damage on thawing.",
      ],
    },
  ],

  related: ["common-frog", "american-bullfrog", "axolotl"],
  tags: ["frog", "north america", "freeze tolerance", "vernal pool", "arctic", "least concern"],
  searchTerms: [
    "lithobates sylvaticus",
    "rana sylvatica",
    "frozen frog",
    "frogsicle",
    "frog that freezes solid",
    "wood frog arctic",
  ],

  faqs: [
    {
      q: "Does the wood frog really freeze solid?",
      a: "Between 65 and 70 percent of its total body water turns to ice, concentrated in the body cavity and under the skin. Circulation stops, the heart stops, breathing stops and brain activity ceases. The cells themselves do not freeze internally — that is what the cryoprotectants prevent — but the animal as a whole is frozen and rigid.",
    },
    {
      q: "How cold can a wood frog survive?",
      a: "It depends on where it comes from. Temperate populations tolerate about −3 to −6 °C. Frogs from interior Alaska survive experimental freezing to −16 °C, and in natural hibernacula have been recorded at temperatures down to −18 °C with 100 percent survival.",
    },
    {
      q: "How long can a wood frog stay frozen?",
      a: "Alaskan wood frogs tracked in the wild remained frozen for 193 ± 11 consecutive days on average, with individuals reaching 218 days — more than seven months — and all of them survived.",
    },
    {
      q: "What stops the wood frog's cells from being destroyed by ice?",
      a: "Two cryoprotectants. Within minutes of ice first forming, the liver breaks down its glycogen and floods the body with glucose, which is taken into the cells and holds water there. Northern populations also build up urea through late summer and autumn, before any freezing starts, so they enter winter already partly protected.",
    },
    {
      q: "Why do wood frogs breed in puddles that dry up?",
      a: "Because a pool that dries out cannot hold fish, and fish eat frog eggs and tadpoles. The trade-off is time: tadpoles have roughly two months to hatch, grow and metamorphose before the water is gone, and in a dry spring the pool wins.",
    },
  ],

  seo: {
    title: "Wood Frog — Freezing Solid, Vernal Pools & Arctic Range",
    description:
      "A researched profile of the wood frog (Lithobates sylvaticus): how it survives freezing with 65–70% of its body water as ice, the glucose and urea that protect it, and why it breeds only in vanishing woodland pools.",
    keywords: [
      "wood frog",
      "lithobates sylvaticus",
      "frog that freezes",
      "wood frog freeze tolerance",
      "rana sylvatica",
    ],
  },

  sources: [
    {
      label: "Lithobates sylvaticus — Red List assessment (2022, e.T58728A193382501)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/58728/193382501",
    },
    {
      label: "Wood frog adaptations to overwintering in Alaska: new limits to freezing tolerance",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/217/12/2193/12112/Wood-frog-adaptations-to-overwintering-in-Alaska",
    },
    {
      label: "Cryoprotectants and extreme freeze tolerance in a subarctic population of the wood frog",
      publisher: "PLOS ONE",
      url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0117234",
    },
    {
      label: "Lithobates sylvaticus — natural history account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Lithobates_sylvaticus/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default woodFrog;
