// Great hammerhead — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const hammerheadShark = {
  slug: "hammerhead-shark",
  category: "fish",
  name: "Great Hammerhead",
  scientificName: "Sphyrna mokarran",
  otherNames: ["Great hammerhead shark", "Squat-headed hammerhead"],

  summary:
    "The largest of the hammerheads, carrying its electrical sense spread across a two-metre-wide head, and now one of the most endangered large sharks in the sea.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Great_hammerhead2.jpg",
    alt: "Close view of a great hammerhead's broad, almost straight-fronted hammer-shaped head",
    credit: "Albert kok / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Great_Hammerhead_Feeding%2C_Bimini%2C_Bahamas.jpg/1920px-Great_Hammerhead_Feeding%2C_Bimini%2C_Bahamas.jpg",
      alt: "A great hammerhead taking bait from a diver in shallow water off Bimini, Bahamas",
      credit: "N.E.Youness / Wikimedia Commons",
      title: "Close quarters at Bimini",
      caption:
        "This is a provisioned dive — the shark has been drawn in with bait, which is how almost all close photography of the species happens. Bimini's winter aggregation is where much of what is known about great hammerhead behaviour and site fidelity has been recorded.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Great_hammerhead_feeding%2C_Bimini.jpg/1920px-Great_hammerhead_feeding%2C_Bimini.jpg",
      alt: "A great hammerhead swimming low over a pale sand bottom at Bimini, its tall sickle-shaped dorsal fin raised",
      credit: "Stevelaycock21 / Wikimedia Commons",
      title: "The fin that does double duty",
      caption:
        "That exaggerated first dorsal fin is not just for stability. When the shark swims rolled onto its side — which tagged animals do for most of their time — the dorsal acts as a lifting surface in place of the pectorals, and the whole arrangement cuts drag by around a tenth.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Sphyrna_mokarran_embryos_nefsc.jpg",
      alt: "Great hammerhead embryos from a research collection, each already showing the widened hammer-shaped head",
      credit: "Apex Predators Program, NOAA/NEFSC / Wikimedia Commons",
      title: "Born with the hammer already formed",
      caption:
        "Great hammerheads are placental live-bearers, and pups arrive fully formed at 50 to 70 cm after roughly eleven months. The cephalofoil is folded back against the body at birth and springs into shape afterwards — an adaptation to being born sideways through a birth canal.",
    },
  ],

  headline: "A sense organ shaped like a wing",
  intro: [
    "The great hammerhead is the largest hammerhead species, reaching a little over six metres, and the one with the most extreme head. Its cephalofoil — the flattened blade that gives the family its name — is wide, almost straight along the front edge, and studded across its whole underside with the electroreceptive pores that sharks use to find hidden prey. Where a normal shark sweeps a narrow snout across the seabed, a great hammerhead sweeps a metre-wide detector.",
    "It is also disappearing. Hammerhead fins are among the most valuable in the shark fin trade, the species is caught in coastal fisheries throughout its range, and it dies at very high rates even when released. In 2019 the IUCN moved it from Endangered to Critically Endangered — a category most people associate with rhinos and gorillas rather than with a shark that is still, on paper, found in every warm ocean.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Chondrichthyes",
    order: "Carcharhiniformes",
    family: "Sphyrnidae",
    genus: "Sphyrna",
    species: "Sphyrna mokarran",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate:
      "No global count. Regional declines of more than 80% over three generations underpin the listing, and the species has been effectively lost from parts of its former range in the eastern Atlantic and the Mediterranean",
    note: "Assessed on 9 November 2018 and published in the 2019 Red List, which uplisted the species from Endangered to Critically Endangered. The great hammerhead was added to CITES Appendix II at CoP16 — alongside the scalloped and smooth hammerheads — effective from September 2014, and has been on Appendix II of the Convention on Migratory Species since 2014. The central problem is not just how many are caught but how few survive being let go: at-vessel and post-release mortality in this species is among the highest recorded for any large shark.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Commonly 3.5–4.5 m; up to 6.1 m",
      min: 3.5,
      max: 6.1,
      unit: "m",
      note: "FishBase gives a maximum of 610 cm total length, matching the largest specimen on the Florida Museum's record",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Commonly 200–450 kg; the rod-and-reel record is 580 kg",
      min: 200,
      max: 580,
      unit: "kg",
      note: "FishBase lists a maximum published weight of 449.5 kg. The 580 kg IGFA all-tackle record fish, taken off Boca Grande in Florida in 2006, was only 3.56 m long and heavily pregnant",
    },
    {
      key: "roll-angle",
      label: "Typical swimming roll",
      value: "50–75° onto its side",
      min: 50,
      max: 75,
      unit: "°",
      note: "Accelerometer-tagged sharks held these angles for up to 90% of their time; wind-tunnel modelling of an accurate body cast showed drag is lowest between 50 and 70°",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "Surface to about 300 m",
      min: 300,
      max: 300,
      unit: "m",
      note: "FishBase gives 1–300 m; most time is spent shallower than 100 m over shelves, lagoons and reef edges",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 11 months",
      min: 11,
      max: 11,
      unit: "months",
      note: "Females breed only every second year, which halves the species' already low reproductive output",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "6–42 pups",
      min: 6,
      max: 42,
      unit: "pups",
      note: "Unusually large for a shark of this size, and the reason great hammerheads were once assumed to be more resilient to fishing than they are",
    },
    {
      key: "birth-size",
      label: "Size at birth",
      value: "50–70 cm",
      min: 50,
      max: 70,
      unit: "cm",
      note: "Independent from the moment of birth; there is no parental care of any kind",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 20–30 years",
      min: 20,
      max: 30,
      unit: "years",
      note: "FishBase gives a maximum reported age of 30; vertebral ageing studies in the northwest Atlantic have produced older estimates still",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — stingrays and other batoids, bony fish, smaller sharks, squid and crustaceans", icon: "Fish" },
    { key: "electric-sense", label: "Electroreception", value: "Ampullae of Lorenzini spread across the full width of the cephalofoil", icon: "Zap" },
    { key: "reproduction", label: "Reproduction", value: "Placental live-bearer; one litter every two years", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Highly migratory; tagged individuals cross entire ocean basins", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Solitary — unlike scalloped hammerheads it does not form the famous daytime schools", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "Circumglobal in warm temperate and tropical coastal seas", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator of coastal and shelf waters", icon: "Crosshair" },
  ],

  highlights: ["length", "weight", "roll-angle", "lifespan"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "North America", "South America"],
    regions: [
      "Florida, the Bahamas and Bimini",
      "Gulf of Mexico and the Caribbean",
      "Red Sea and the Arabian Gulf",
      "Northern Australia and the Great Barrier Reef",
      "French Polynesia",
      "South Africa and Mozambique",
      "Gulf of California",
    ],
    habitats: ["Coral reefs", "Continental shelves and lagoons", "Offshore surface waters"],
    elevation: "Surface waters to about 300 m",
    note: "Circumglobal in coastal warm temperate and tropical seas, but nowhere abundant. It is classified as a highly migratory species, and satellite tracking has followed individuals over thousands of kilometres between coastal aggregation sites and open water. Populations in the eastern Atlantic and the Mediterranean have declined so far that the species is now only rarely recorded there.",
  },

  sections: [
    {
      id: "cephalofoil",
      title: "What the hammer is for",
      body: [
        "Hammerhead heads have been explained several ways over the years, and the current answer is that they do more than one job at once. The cephalofoil spreads the ampullae of Lorenzini — the jelly-filled pores that read the faint electrical fields given off by living muscle — across a far wider search area than a conventional snout allows. A shark sweeping its head side to side over sand is running a wide-aperture scan for buried prey.",
        "It widens the sensory base for smell too. The nostrils sit at the outer edges of the blade, metres apart in a large animal, which sharpens the difference in arrival time and concentration between them and makes a scent trail easier to follow to its source.",
        "The eyes sit at the very tips. That placement costs the shark a blind spot directly in front of its snout but buys near-360° vision in the vertical plane, with binocular overlap both ahead and behind. And the whole structure works as a hydrofoil: it generates lift, and it lets the animal pivot far more sharply than a shark of this size otherwise could.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting stingrays",
      body: [
        "Great hammerheads eat a wide range of prey, but stingrays and other batoids are the preferred food where they are available. That is a curious choice for a shark, since a large stingray carries a venomous barb capable of serious injury, and great hammerheads are regularly found with barbs embedded in their jaws, throats and heads without apparent ill effect.",
        "The hunting method has been watched in the wild. The shark uses the cephalofoil as a tool: it pins the ray to the seabed with the flat of its head, pivots, and takes bites from the disc while the ray is held down. The rest of the pursuit is a display of how manoeuvrable the design is — hammerheads track a fleeing ray through tight turns that a heavier-bodied shark could not follow.",
        "Electroreception is what makes buried rays findable at all. A stingray covered in sand is invisible and produces almost no scent, but it cannot stop its heart and gills from generating a weak electrical field, and the hammerhead's head is essentially an antenna tuned to exactly that.",
      ],
    },
    {
      id: "rolled-swimming",
      title: "Swimming on its side",
      body: [
        "In 2016 a study combining accelerometer tags on wild sharks with wind-tunnel tests on a scanned body model reported something that had been dismissed as odd behaviour: great hammerheads spend most of their time swimming rolled 50 to 75 degrees onto one side.",
        "The reason is the fin arrangement. Great hammerheads have an unusually tall first dorsal fin and comparatively short pectorals — the reverse of most large sharks. Rolled over, the dorsal takes over the lift-generating role the pectorals normally play, and the body presents a more efficient profile to the flow. Modelling put the saving at around 10% of the cost of transport, which over a lifetime of continuous swimming is a large amount of energy.",
        "It also reframes the head. If the animal habitually travels on its side, the cephalofoil is oriented vertically rather than horizontally for much of the time, which changes both how it functions hydrodynamically and how the eyes at its tips are pointed.",
      ],
    },
    {
      id: "reproduction",
      title: "Slow arithmetic",
      body: [
        "Great hammerheads are viviparous with a true placental connection — the yolk sac attaches to the uterine wall and takes over nutrition partway through development, the same solution mammals arrived at independently. Gestation runs about eleven months and produces a comparatively generous litter of six to forty-two pups, each 50 to 70 centimetres long and entirely independent from birth.",
        "The pups are born with the cephalofoil folded back along the body, which unfolds afterwards — a straightforward mechanical accommodation to being born through a narrow opening with a head shaped like a crossbar.",
        "The catch is the interval. Females breed only every second year, and they take the better part of a decade to reach maturity in the first place. A litter of forty looks like resilience until it is set against a two-year cycle, a long juvenile stage and a fishery that removes adults faster than they can be replaced.",
      ],
    },
    {
      id: "threats",
      title: "Why it is Critically Endangered",
      body: [
        "The fins are the immediate cause. Hammerhead fins carry high, unbranched fin rays and are among the most valuable in the shark fin trade, which makes the species a target rather than an incidental catch across much of the tropics. Great hammerheads are also taken in gillnets, on longlines and in beach protection programmes.",
        "What pushes the species past most other large sharks is its physiology. Great hammerheads are exceptionally sensitive to capture stress — a large fraction die on the line before they are ever brought aboard, and many that swim away from a release do not survive it. Catch-and-release rules that work for other species do comparatively little here.",
        "Protections exist and are patchy. The species has been on CITES Appendix II since 2014, which requires trade in fins to be certified as legal and sustainable; the United States, Australia and a number of other countries prohibit retention. Enforcement in the fisheries that take the most great hammerheads is the weak link, and coastal nursery grounds — one was identified on the US Atlantic coast only in 2021 — remain largely unmapped.",
      ],
    },
  ],

  related: ["great-white-shark", "tiger-shark", "giant-manta-ray", "sailfish"],
  tags: ["shark", "marine", "cartilaginous fish", "apex predator", "critically endangered", "shark finning"],
  searchTerms: ["sphyrna mokarran", "hammerhead", "great hammerhead shark", "cephalofoil", "hammer head shark"],

  faqs: [
    {
      q: "Why do hammerhead sharks have hammer-shaped heads?",
      a: "The cephalofoil does several things at once. It spreads the shark's electroreceptive pores over a much wider area, so it can scan a broader strip of seabed for buried prey; it separates the nostrils, sharpening its ability to follow a scent to its source; it places the eyes at the tips for near-360° vertical vision; and it works as a hydrofoil that improves lift and lets a large shark turn far more sharply than its body length suggests.",
    },
    {
      q: "How big do great hammerheads get?",
      a: "Adults are commonly 3.5 to 4.5 metres. The largest reliably recorded specimen was 6.1 metres, and the heaviest ever caught on rod and reel weighed 580 kilograms — although that fish was only 3.56 metres long and heavily pregnant, so it was unusually heavy for its length.",
    },
    {
      q: "Do great hammerheads really swim on their sides?",
      a: "Yes. Tagged sharks were found to hold a roll angle of 50 to 75 degrees for up to 90% of their swimming time. Great hammerheads have an unusually tall dorsal fin and short pectorals, so rolling over lets the dorsal generate lift instead. Wind-tunnel work on a body model showed the posture cuts drag by roughly 10%.",
    },
    {
      q: "Are great hammerheads dangerous to humans?",
      a: "Rarely. They are large, powerful and can be inquisitive around divers, but unprovoked attacks attributed to any hammerhead species are few and no fatality has been recorded. The realistic risk runs the other way — the species is Critically Endangered largely because of human fishing.",
    },
    {
      q: "Why is the great hammerhead Critically Endangered?",
      a: "Because it is targeted for its high-value fins, caught throughout its coastal range in gillnets and on longlines, and reproduces slowly — females breed only every second year. It is also unusually fragile: a large proportion of great hammerheads die from the stress of capture even when they are released, so the catch-and-release measures that help other sharks do comparatively little for this one.",
    },
  ],

  seo: {
    title: "Great Hammerhead — Size, Cephalofoil, Hunting & Conservation",
    description:
      "A researched profile of the great hammerhead shark (Sphyrna mokarran): what the cephalofoil is for, electroreception, rolled swimming, stingray hunting, and why the species is now Critically Endangered.",
    keywords: [
      "great hammerhead shark facts",
      "sphyrna mokarran",
      "hammerhead shark head",
      "great hammerhead size",
      "hammerhead shark endangered",
    ],
  },

  sources: [
    {
      label: "Sphyrna mokarran — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/39386/2920499",
    },
    {
      label: "Great hammerhead species profile",
      publisher: "Florida Museum of Natural History",
      url: "https://www.floridamuseum.ufl.edu/discover-fish/species-profiles/sphyrna-mokarran/",
    },
    {
      label: "Sphyrna mokarran — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Sphyrna-mokarran.html",
    },
    {
      label: "Great hammerhead sharks swim on their side to reduce transport costs",
      publisher: "Payne et al., Nature Communications (2016)",
      url: "https://www.nature.com/articles/ncomms12289",
    },
    {
      label: "Status review report: great hammerhead shark",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/resource/document/status-review-report-great-hammerhead-shark-sphyrna-mokarran",
    },
  ],

  updatedAt: "2026-07-29",
};

export default hammerheadShark;
