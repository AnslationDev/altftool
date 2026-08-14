// Axolotl — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const axolotl = {
  slug: "axolotl",
  category: "amphibians",
  name: "Axolotl",
  scientificName: "Ambystoma mexicanum",
  otherNames: ["Mexican walking fish", "Mexican salamander"],

  summary:
    "A salamander that never grows up, keeping its larval gills for life and regrowing lost limbs, spinal cord and parts of its brain — while nearly extinct in the single lake system it comes from.",

  heroImage: {
    src: "https://images.unsplash.com/photo-1578999621243-9381851a6a84?auto=format&fit=crop&w=1600&q=80",
    alt: "A pale axolotl on a dark substrate, external gills visible",
    credit: "Chantal Bodmer / Unsplash",
  },
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1763755876890-a3acebd28ed5?auto=format&fit=crop&w=1400&q=80",
      alt: "A golden axolotl showing its feathery external gills in profile",
      credit: "Lutz Stallknecht / Unsplash",
      title: "Gills that were never meant to last",
      caption:
        "Those feathery external gills belong to a larval salamander. In almost every relative they are reabsorbed at metamorphosis; in the axolotl the signal never arrives, and the animal breeds while still wearing them.",
    },
  ],

  headline: "A salamander that never grows up",
  intro: [
    "Many salamanders begin life in water as larvae with feathery external gills, then metamorphose into air-breathing adults that leave it. The axolotl skips the second half. It keeps its gills, its tail fin and its aquatic life permanently, and reaches sexual maturity while still looking like a larva — a condition called neoteny.",
    "It is simultaneously one of the most common amphibians in laboratories and pet tanks worldwide, and one of the rarest in the wild. Its entire natural range is the remains of a lake system beneath Mexico City, where only a few hundred individuals may survive.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Caudata",
    family: "Ambystomatidae",
    genus: "Ambystoma",
    species: "Ambystoma mexicanum",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2019,
    populationTrend: "decreasing",
    populationEstimate: "Estimated at fewer than 1,000 mature individuals in the wild",
    note: "Survey density in Lake Xochimilco fell from around 6,000 individuals per square kilometre in 1998 to roughly 36 per square kilometre by 2014. Hundreds of thousands exist in captivity, but the captive population is descended from a small founder group and cannot substitute for the wild one.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "15–30 cm",
      min: 15,
      max: 30,
      unit: "cm",
      note: "Exceptional individuals reach about 45 cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "60–230 g",
      min: 60,
      max: 230,
      unit: "g",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "10–15 years",
      min: 10,
      max: 15,
      unit: "years",
    },
    {
      key: "genome-size",
      label: "Genome size",
      value: "About 32 billion base pairs",
      min: 32,
      max: 32,
      unit: "Gb",
      note: "Roughly ten times the size of the human genome",
    },
    {
      key: "limb-regeneration",
      label: "Limb regeneration time",
      value: "Several weeks to a few months",
      note: "Varies with age, temperature and the size of the limb",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 1 year",
      min: 1,
      max: 1,
      unit: "years",
      note: "Reached while still in larval form — the defining consequence of neoteny",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "100–1,000 eggs",
      min: 100,
      max: 1000,
      unit: "eggs",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — worms, insect larvae, small fish", icon: "Drumstick" },
    { key: "life-cycle", label: "Life cycle", value: "Neotenic — stays aquatic and larval for life", icon: "Waves" },
    { key: "regeneration", label: "Regeneration", value: "Limbs, spinal cord, heart and brain tissue", icon: "RefreshCw" },
    { key: "range-size", label: "Range", value: "Endemic to one lake system in Mexico City", icon: "MapPin" },
    { key: "water-type", label: "Water type", value: "Freshwater, cool and high-altitude", icon: "Droplet" },
  ],

  highlights: ["length", "regeneration", "genome-size", "range-size"],

  distribution: {
    continents: ["North America"],
    regions: ["Lake Xochimilco, Mexico City, Mexico"],
    habitats: ["Freshwater canals", "High-altitude lake wetlands"],
    elevation: "Around 2,200 m",
    note: "Historically found in Lake Xochimilco and Lake Chalco. Chalco was drained to control flooding, and Xochimilco has been reduced to a network of canals, so the species now occupies a fraction of an already small original range.",
  },

  sections: [
    {
      id: "neoteny",
      title: "Staying a larva",
      body: [
        "Metamorphosis in salamanders is triggered by thyroid hormone. In the axolotl the signalling pathway that should drive that change does not activate under normal conditions, so the animal simply continues growing as a larva — external gills, tail fin, aquatic life — and becomes sexually mature in that form.",
        "It is not incapable of metamorphosis. Injecting thyroid hormone will force the change, producing a terrestrial salamander resembling its close relative the tiger salamander. Induced metamorphosis is generally harmful, shortening lifespan and reducing the animal's regenerative ability, and axolotls are far better suited to the form they naturally keep.",
        "Neoteny makes sense for its habitat. In a permanent, deep, high-altitude lake, there was little advantage in leaving the water — so the lineage stopped doing so.",
      ],
    },
    {
      id: "regeneration",
      title: "Regeneration",
      body: [
        "An axolotl can regrow an amputated limb complete with bone, muscle, nerves and skin, in correct proportion and orientation, and do it repeatedly without scarring. The same capacity extends to the tail, portions of the spinal cord, sections of the heart, and parts of the brain — and axolotls have been shown to accept transplanted tissue, including eyes and brain sections, without rejection.",
        "The mechanism is not the regrowth of a stump but the formation of a blastema: cells near the wound revert to a less specialised state, multiply, and then rebuild the missing structure according to positional information they retain about where they are on the body.",
        "This is why the species has become one of the most important models in regenerative medicine. Mammals, humans included, carry many of the same genes but respond to serious injury with scar tissue instead. The axolotl genome — about ten times the size of the human genome — was fully sequenced and assembled in 2018, which made it possible to study those differences directly.",
      ],
    },
    {
      id: "wild-decline",
      title: "Near-extinction in the wild",
      body: [
        "The axolotl's original habitat was a system of interconnected lakes in the Valley of Mexico. Lake Chalco was deliberately drained to prevent flooding, and Lake Xochimilco has been reduced to canals surrounded by one of the largest cities on Earth.",
        "What remains is polluted by wastewater and agricultural runoff, and stocked with introduced carp and tilapia that eat axolotl eggs and juveniles and compete for food. Surveys tell the story plainly: around 6,000 individuals per square kilometre in 1998, roughly 100 by 2008, and about 36 by 2014.",
        "Conservation work centres on the chinampas, the traditional raised agricultural plots of Xochimilco — artificial islands built up from lakebed mud inside willow-staked frames, rooted to the bottom rather than floating despite the popular name. Restoring them with filtration systems and keeping invasive fish out creates refuges of clean water, and the approach ties the animal's survival to a farming tradition that is itself part of a UNESCO World Heritage site.",
      ],
    },
    {
      id: "captivity",
      title: "In laboratories and homes",
      body: [
        "Axolotls have been studied in laboratories since the nineteenth century, when specimens sent to Paris in 1864 bred readily and were distributed widely. Nearly all laboratory and pet animals today descend from a small founder population, and their limited genetic diversity — along with some historical crossing with tiger salamanders — is why the captive population cannot simply be released to restore the wild one.",
        "As pets they need cool, clean, well-filtered water and no gravel small enough to swallow. The pale pink form most people recognise is a leucistic variety produced in captivity; wild axolotls are dark brown or mottled grey, which is far better camouflage in a canal.",
      ],
    },
  ],

  related: ["great-white-shark"],
  tags: ["salamander", "regeneration", "neoteny", "mexico", "critically endangered", "freshwater"],
  searchTerms: ["ambystoma mexicanum", "mexican walking fish", "axolotle", "ajolote"],

  faqs: [
    {
      q: "Why does an axolotl keep its gills for life?",
      a: "Because the thyroid hormone signal that normally triggers metamorphosis does not activate. The animal keeps its external gills, tail fin and aquatic lifestyle while still becoming sexually mature — a condition called neoteny. In a permanent high-altitude lake there was little advantage in moving onto land, so the lineage stopped doing so.",
    },
    {
      q: "What can an axolotl regenerate?",
      a: "Limbs complete with bone, muscle, nerve and skin, plus the tail, parts of the spinal cord, sections of the heart and portions of the brain — repeatedly, and without scarring. It does this by forming a blastema, a mass of cells that revert to a less specialised state and then rebuild the missing structure.",
    },
    {
      q: "Are axolotls extinct in the wild?",
      a: "Not quite, but very close. They are listed as Critically Endangered, with likely fewer than 1,000 mature individuals in Lake Xochimilco. Survey density collapsed from about 6,000 per square kilometre in 1998 to roughly 36 by 2014, driven by pollution and introduced carp and tilapia.",
    },
    {
      q: "If there are so many axolotls in captivity, why does the wild population matter?",
      a: "Captive animals almost all descend from a small founder group and carry limited genetic diversity, with some history of crossing with tiger salamanders. They are not a genetic substitute for the wild population, and releasing them would not restore what is being lost in Xochimilco.",
    },
    {
      q: "Why are pet axolotls pink when wild ones are dark?",
      a: "The pale pink form is leucistic, a colour variety produced through captive breeding. Wild axolotls are dark brown or mottled grey, which provides far better camouflage in a canal.",
    },
  ],

  seo: {
    title: "Axolotl — Regeneration, Neoteny, Habitat & Conservation",
    description:
      "A researched profile of the axolotl (Ambystoma mexicanum): why it never metamorphoses, how it regrows limbs and brain tissue, and why it is Critically Endangered in Lake Xochimilco.",
    keywords: [
      "axolotl facts",
      "ambystoma mexicanum",
      "axolotl regeneration",
      "neoteny",
      "axolotl endangered",
    ],
  },

  sources: [
    {
      label: "Ambystoma mexicanum — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/1095/53947343",
    },
    {
      label: "Axolotl genome and regeneration research",
      publisher: "Nature",
      url: "https://www.nature.com/articles/nature25458",
    },
    {
      label: "Axolotl conservation in Xochimilco",
      publisher: "Universidad Nacional Autónoma de México",
      url: "https://www.unam.mx",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default axolotl;
