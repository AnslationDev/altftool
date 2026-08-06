// Giant manta ray — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const giantMantaRay = {
  slug: "giant-manta-ray",
  category: "fish",
  name: "Giant Manta Ray",
  scientificName: "Mobula birostris",
  otherNames: ["Oceanic manta ray", "Giant oceanic manta ray", "Devil ray"],

  summary:
    "The largest ray in the ocean, a seven-metre filter feeder that flies on its pectoral fins, carries the biggest brain of any fish and has no sting at all.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/d/df/Manta_birostris-Thailand4.jpg",
    alt: "A manta ray swimming in open blue water at Hin Daeng, Thailand, its broad triangular pectoral fins spread wide",
    credit: "jon hanson from london, UK / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Giant_Manta_%28Manta_birostris%29_%286129781991%29.jpg/1920px-Giant_Manta_%28Manta_birostris%29_%286129781991%29.jpg",
      alt: "A manta ray gliding through open water at South Point, Sipadan, Malaysia",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Flight, not swimming",
      caption:
        "Mantas do not undulate the way other rays do. The pectoral fins beat like wings and generate lift, which is why an animal weighing well over a tonne can hold station in mid-water and turn inside its own body length.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Giant_Manta_%28Manta_birostris%29_%286130333044%29.jpg/1920px-Giant_Manta_%28Manta_birostris%29_%286130333044%29.jpg",
      alt: "A manta ray photographed from below at South Point, Sipadan, Malaysia, with its mouth and paired head fins visible",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "The horns that gave it a name",
      caption:
        "The paired lobes either side of the mouth are cephalic fins, rolled into points when the animal is cruising and unfurled into a funnel when it feeds. Rolled up they look like horns, which is where the old name devil ray comes from.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Giant_Manta_%28Manta_birostris%29_%288503849820%29.jpg/1920px-Giant_Manta_%28Manta_birostris%29_%288503849820%29.jpg",
      alt: "A manta ray passing over the reef drop-off at South Point, Sipadan, Malaysia",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Why the same reefs, every year",
      caption:
        "Mantas return to a small number of reliable places — cleaning stations on reefs and seamounts where wrasse and butterflyfish pick parasites from their skin and gills. That predictability makes them countable, and it makes them easy to fish out.",
    },
  ],

  headline: "The biggest ray in the sea, and the one with no sting",
  intro: [
    "A giant manta measures up to about seven metres across and can weigh two to three tonnes, yet it eats nothing bigger than a shrimp. It filters zooplankton from the water while flying through it on wings that happen to be pectoral fins, and unlike its stingray relatives it carries no barb, no spine and no defence at all beyond size and speed.",
    "It is also the fish with the largest brain, weighed both in absolute terms and against body size. Whether that intelligence extends to self-awareness is disputed, but the behaviour is unmistakably complex: mantas queue at cleaning stations, coordinate feeding chains, and dive past a kilometre into water near freezing. The species was uplisted to Endangered when its 2019 assessment was published, driven almost entirely by demand for its gill plates.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Chondrichthyes",
    order: "Myliobatiformes",
    family: "Mobulidae",
    genus: "Mobula",
    species: "Mobula birostris",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2019,
    populationTrend: "decreasing",
    populationEstimate:
      "No global figure; most regional subpopulations number in the hundreds to low thousands, and the largest known aggregation, off Ecuador, is estimated at more than 22,000 individuals",
    note: "Assessed in November 2019 and published in the 2020 Red List update, which uplisted the species from Vulnerable to Endangered; an amended version was issued in 2022. Local declines of 71–95% have been recorded over periods of 13 to 21 years where the species is fished. Listed on CITES Appendix II and on Appendices I and II of the Convention on Migratory Species, and listed as threatened under the US Endangered Species Act in 2018.",
  },

  measurements: [
    {
      key: "disc-width",
      label: "Disc width",
      value: "Up to about 7 m",
      min: 4,
      max: 7,
      unit: "m",
      note: "Measured across the wingtips. Reference works carry a maximum of 9.1 m, but that figure rests on old unverified reports",
    },
    {
      key: "weight",
      label: "Weight",
      value: "2,000–3,000 kg",
      min: 2000,
      max: 3000,
      unit: "kg",
      note: "Very few mantas have ever been weighed; most figures are estimated from disc width",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "Up to about 24 km/h",
      min: 10,
      max: 24,
      unit: "km/h",
      note: "Cruising is far slower; the higher figure is a short burst",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "1,250 m",
      min: 1250,
      max: 1250,
      unit: "m",
      note: "Recorded by satellite tags in a 2025 study of 24 tagged mantas; most time is spent in the top 200 m",
    },
    {
      key: "brain-mass",
      label: "Brain mass",
      value: "Up to about 200 g",
      min: 200,
      max: 200,
      unit: "g",
      note: "The largest brain of any fish, both absolutely and relative to body size",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 12–13 months",
      min: 12,
      max: 13,
      unit: "months",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "One pup, very occasionally two",
      min: 1,
      max: 2,
      unit: "pups",
      note: "A female produces a pup roughly every two to three years — among the lowest reproductive rates of any fish",
    },
    {
      key: "birth-size",
      label: "Size at birth",
      value: "About 1.4 m across",
      min: 1.4,
      max: 1.4,
      unit: "m",
      note: "Born rolled up like a burrito and unfurling as it leaves the mother; independent immediately",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "At least 45 years",
      min: 40,
      max: 45,
      unit: "years",
      note: "Estimated from resighted individuals; nobody knows the true maximum",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Filter feeder — zooplankton, krill and fish larvae", icon: "Fish" },
    { key: "feeding-method", label: "Feeding method", value: "Ram filtration; cephalic fins funnel water into the mouth", icon: "Filter" },
    { key: "reproduction", label: "Reproduction", value: "Live-bearing without a placenta; usually a single pup", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Flaps its pectoral fins like wings; ranges over thousands of kilometres", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Solitary, but gathers at cleaning stations and feeding hotspots", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "Tropical, subtropical and warm-temperate seas worldwide", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Planktivore; a visible indicator of productive upwelling water", icon: "Leaf" },
  ],

  highlights: ["disc-width", "weight", "dive-depth", "brain-mass"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "Isla de la Plata and the Machalilla coast, Ecuador",
      "Revillagigedo Archipelago, Mexico",
      "Raja Ampat and Komodo, Indonesia",
      "Southern Mozambique",
      "The Azores",
      "Ogasawara Islands, Japan",
      "Laje de Santos, Brazil",
    ],
    habitats: ["Open ocean", "Offshore seamounts and cleaning stations", "Productive coastal upwellings"],
    elevation: "Surface waters to at least 1,250 m",
    note: "Circumglobal in warm water, reaching roughly southern California, Rhode Island, northern Japan and the Azores in the north and Peru, Uruguay, South Africa and New Zealand in the south. Unlike the smaller reef manta, which holds to particular coastlines, the giant manta is genuinely oceanic and crosses open water between aggregation sites — which is why national protection alone has limited effect.",
  },

  sections: [
    {
      id: "not-a-stingray",
      title: "A ray that cannot sting",
      body: [
        "Manta rays sit in the same order as stingrays, but the barb has gone. There is no spine on the tail, no venom gland and no way for the animal to injure anything. Its defences are size, acceleration and open water, and against a large shark or a boat propeller none of those are much use.",
        "The body plan is a flying one. Where a stingray ripples the margins of its disc to creep along the seabed, a manta beats its pectoral fins through a wide arc and generates lift, so it must keep moving to keep from sinking. It also has to keep moving to breathe: mantas are ram ventilators, driving water over the gills by swimming forward, and cannot rest on the bottom the way a nurse shark can.",
        "Until 2017 the two mantas sat in their own genus, Manta. Genetic work folded them back into Mobula alongside the devil rays, so the correct name for this species is now Mobula birostris — while its smaller, more coastal relative, the reef manta, is Mobula alfredi.",
      ],
    },
    {
      id: "feeding",
      title: "Filtering the open ocean",
      body: [
        "A feeding manta unrolls the two lobes on either side of its mouth into a funnel and swims forward with the mouth open, channelling water across filter plates in the gill arches that strain out copepods, krill, fish eggs and larvae. Everything it eats is smaller than a fingernail.",
        "Because plankton is patchy, the behaviour around it is elaborate. Mantas barrel-roll in tight backward somersaults to stay inside a dense patch, form chains nose-to-tail so that each animal feeds in the wake of the one ahead, and mass into slow rotating cyclones dozens strong where the food is thickest. These are among the largest coordinated feeding events involving any fish.",
        "The physics of the filter turned out to be unusual. Rather than sieving particles out, the lobed filter plates use a ricochet effect that bounces plankton away from the pores and back into the mouth, so the mesh does not clog even though the particles are smaller than the gaps they pass.",
      ],
    },
    {
      id: "brain",
      title: "The largest brain of any fish",
      body: [
        "At up to about 200 grams, the giant manta's brain is the biggest known in any fish, and it is large relative to body size as well. Parts of it are warmed by a retial heat exchanger, a network that keeps the brain above ambient temperature during dives into cold water — an arrangement otherwise associated with fast-swimming, warm-bodied fish.",
        "What that buys the animal is harder to state. Mantas learn the locations of cleaning stations and return to them, appear to recognise individual divers over years, and have been reported behaving in front of mirrors in ways that some researchers read as self-recognition. That last claim is contested: the experiment was small, and the behaviour has other explanations. It is fair to call the manta an unusually complex fish, and premature to call it self-aware.",
      ],
    },
    {
      id: "diving",
      title: "What they do in the dark",
      body: [
        "Satellite tags have shown that the surface encounters divers photograph are the visible fraction of a much deeper life. A 2025 study of 24 tagged giant mantas logged nearly 47,000 dives; the deepest reached 1,250 metres, and on 79 separate days animals went below 500 metres.",
        "The descents are made in steps rather than a straight drop, which may let the animal shed heat gradually or recover between efforts. The reasons for going down at all are still argued over: feeding on deep scattering-layer plankton, navigating by sensing the geomagnetic field at depth, and thermoregulation have all been proposed, and they are not mutually exclusive.",
      ],
    },
    {
      id: "threats",
      title: "Gill plates and nets",
      body: [
        "The trade that drove the decline is specific and recent. The gill plates that filter the manta's food are dried and sold as a purported health tonic, a use with no basis in classical Chinese medicine and no clinical support, but with enough value to make targeted fisheries worthwhile. Where those fisheries operate, sightings and landings have fallen by 71 to 95 per cent over one or two decades.",
        "Bycatch does the rest. Mantas are caught in purse seines, gillnets and trawls, and an animal that produces one pup every two or three years cannot replace those losses. Entanglement in fishing line and mooring rope, and vessel strikes at aggregation sites, add to the total.",
        "Protection now exists on paper across much of the range — CITES Appendix II since 2013, both appendices of the Convention on Migratory Species, national bans in Ecuador, Indonesia, Mexico, Peru and elsewhere, and a US Endangered Species Act listing in 2018. Enforcement across international waters is the unsolved part. Manta tourism, worth far more per animal alive than dead, is currently the strongest practical argument for leaving them alone.",
      ],
    },
  ],

  related: ["whale-shark", "great-white-shark", "ocean-sunfish", "tiger-shark"],
  tags: ["ray", "filter feeder", "marine", "cartilaginous fish", "endangered", "megafauna"],
  searchTerms: ["manta birostris", "oceanic manta", "devil ray", "biggest ray", "manta ray facts"],

  faqs: [
    {
      q: "Do giant manta rays sting?",
      a: "No. Manta rays have no venomous barb — the tail spine that stingrays carry has been lost entirely in the genus. A manta cannot injure a person deliberately, and its only defences are its size, its acceleration and open water.",
    },
    {
      q: "How big does a giant manta ray get?",
      a: "Up to about seven metres across the wingtips and two to three tonnes in weight, making it the largest ray in the world. Reference works sometimes quote 9.1 metres, but that comes from old unverified reports; seven metres is the defensible maximum.",
    },
    {
      q: "How deep do giant manta rays dive?",
      a: "Deeper than anyone expected. A 2025 satellite-tagging study of 24 animals recorded a maximum of 1,250 metres and found dives below 500 metres on 79 separate days. The descents are made in steps rather than a single drop, and the reasons — deep feeding, navigation, thermoregulation — are still being worked out.",
    },
    {
      q: "Are manta rays intelligent?",
      a: "They have the largest brain of any fish, absolutely and for their body size, with a heat exchanger that keeps part of it warm on deep dives. They learn cleaning-station locations, appear to recognise individual divers, and feed in coordinated chains and cyclones. Claims that they pass the mirror self-recognition test come from a small study and remain contested.",
    },
    {
      q: "Why are giant manta rays endangered?",
      a: "Mostly because of the gill-plate trade: the plates that filter their food are dried and sold as a health tonic, supporting targeted fisheries that have cut local populations by 71 to 95 per cent in one or two decades. Bycatch adds to it, and a female that produces a single pup every two to three years cannot replace the losses.",
    },
  ],

  seo: {
    title: "Giant Manta Ray — Size, Feeding, Deep Dives & Conservation",
    description:
      "A researched profile of the giant manta ray (Mobula birostris): a 7 m wingspan, ricochet filter feeding, the largest brain of any fish, 1,250 m dives, the gill-plate trade and Endangered status.",
    keywords: [
      "giant manta ray facts",
      "mobula birostris",
      "oceanic manta ray",
      "manta ray size",
      "do manta rays sting",
    ],
  },

  sources: [
    {
      label: "Mobula birostris — Red List assessment (Endangered, assessed 2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/198921/214397182",
    },
    {
      label: "Giant manta ray species profile",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/giant-manta-ray",
    },
    {
      label: "Mobula birostris — species summary and Red List assessment date",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Mobula-birostris.html",
    },
    {
      label: "Deep diving behaviour in oceanic manta rays and its potential function (2025)",
      publisher: "Frontiers in Marine Science",
      url: "https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2025.1630451/full",
    },
    {
      label: "Giant manta becomes the first manta ray listed as endangered",
      publisher: "Marine Megafauna Foundation",
      url: "https://marinemegafauna.org/news/giant-manta-becomes-the-first-manta-ray-to-be-listed-as-an-endangered-species",
    },
  ],

  updatedAt: "2026-07-29",
};

export default giantMantaRay;
