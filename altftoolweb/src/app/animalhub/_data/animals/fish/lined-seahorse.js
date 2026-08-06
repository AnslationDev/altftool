// Lined seahorse — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const linedSeahorse = {
  slug: "lined-seahorse",
  category: "fish",
  name: "Lined Seahorse",
  scientificName: "Hippocampus erectus",
  otherNames: ["Northern seahorse", "Spotted seahorse", "Horsefish"],

  summary:
    "A western Atlantic seahorse that swims upright, anchors itself to seagrass by its tail, hunts with the fastest strike of any fish its size, and leaves the pregnancy to the male.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Lined_Seahorse-_Hippocampus_erectus_%286042886100%29.jpg",
    alt: "A lined seahorse photographed at Blue Heron Bridge, Florida, upright in the water with its tail curled and snout angled forward",
    credit: "MattSullivan from Boston, MA, USA / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Gfp-lined-seahorse.jpg",
      alt: "A small lined seahorse upright in the water, showing the ringed bony plates of its body and its curled prehensile tail",
      credit: "Yinan Chen / Wikimedia Commons",
      title: "Armour instead of scales",
      caption:
        "A seahorse has no scales. The body is encased in interlocking bony plates arranged in rings, which makes it hard to bite and nearly impossible to swallow — one reason so few predators bother with them.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Hal_-_Hippocampus_erectus_-_1.jpg/1920px-Hal_-_Hippocampus_erectus_-_1.jpg",
      alt: "Two lined seahorses in an aquarium tank at Southend-on-Sea, England, holding on with their tails",
      credit: "Emőke Dénes / Wikimedia Commons",
      title: "Built to hold on, not to swim",
      caption:
        "The only real propulsion is a small dorsal fin beating up to fifty times a second, which makes seahorses among the slowest fish alive. The strategy is to grip a seagrass blade with the prehensile tail and let prey come to them.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Hal_-_Hippocampus_erectus_-_10.jpg/1920px-Hal_-_Hippocampus_erectus_-_10.jpg",
      alt: "A lined seahorse in an aquarium at the Scarborough SEA LIFE Sanctuary, England, with fleshy skin filaments along its back",
      credit: "Emőke Dénes / Wikimedia Commons",
      title: "Colour is not fixed",
      caption:
        "Lined seahorses range from pale yellow to almost black and can change over hours to match their holdfast. Animals living in floating sargassum grow extra skin filaments and bony bumps until they read as a piece of weed rather than an animal.",
    },
  ],

  headline: "The fish where the male gets pregnant",
  intro: [
    "A lined seahorse is a fish that has abandoned nearly everything fish-shaped. It swims upright, has no scales, no pelvic fins, no tail fin and no stomach, and it steers with a dorsal fin the size of a fingernail. It spends most of its life gripping a single blade of seagrass with a tail that works like a monkey's.",
    "Its best-known feature is real and rarer than it sounds: the female deposits her eggs into a sealed pouch on the male's belly, where he fertilises them, supplies them with oxygen and nutrients, regulates the salinity around them, and eventually gives birth. Male pregnancy of this kind exists only in seahorses, pipefish and seadragons — and this species carries it out on the Atlantic coast of the Americas, from Nova Scotia to Brazil.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Syngnathiformes",
    family: "Syngnathidae",
    genus: "Hippocampus",
    species: "Hippocampus erectus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2016,
    populationTrend: "decreasing",
    populationEstimate: "No global count; regional surveys point to declines across much of the range, driven by habitat loss and by trade",
    note: "Assessed on 3 October 2016 and published in the 2017 Red List. Every seahorse species has been listed on CITES Appendix II since 2004, which regulates rather than bans international trade. The species is also caught incidentally in shrimp trawls, a source of mortality that CITES controls do not reach.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "12–19 cm",
      min: 12,
      max: 19,
      unit: "cm",
      note: "Measured from the top of the head down the curve of the body; FishBase gives a maximum standard length of 17.8 cm",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "Surface to about 70 m",
      min: 70,
      max: 100,
      unit: "m",
      note: "Usually in shallow inshore water; moves deeper in winter, with records to about 100 m",
    },
    {
      key: "gestation",
      label: "Male pregnancy",
      value: "20–21 days",
      min: 20,
      max: 21,
      unit: "days",
      note: "Carried in the male's sealed brood pouch; shorter in warmer water",
    },
    {
      key: "clutch-size",
      label: "Brood size",
      value: "Typically a few hundred; recorded from 97 to 1,552",
      min: 97,
      max: 1552,
      unit: "eggs",
    },
    {
      key: "birth-size",
      label: "Size at birth",
      value: "About 11 mm",
      min: 11,
      max: 11,
      unit: "mm",
      note: "Released as miniature adults, fully formed and entirely independent",
    },
    {
      key: "feeding-rate",
      label: "Daily food intake",
      value: "Up to about 3,600 small crustaceans a day",
      min: 3000,
      max: 3600,
      unit: "prey items",
      note: "Recorded in a feeding juvenile. Seahorses have no stomach, so food passes through quickly and they must eat almost continuously",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "1–4 years",
      min: 1,
      max: 4,
      unit: "years",
      note: "Around four years is typical in aquaria; wild lifespans are usually shorter",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — copepods, amphipods, mysid shrimp and other small crustaceans", icon: "Fish" },
    { key: "feeding-method", label: "Feeding method", value: "Pivot feeding — the head snaps up and the snout sucks prey in whole", icon: "Filter" },
    { key: "reproduction", label: "Reproduction", value: "Male pregnancy; the female transfers eggs into his brood pouch", icon: "Egg" },
    { key: "social-structure", label: "Social structure", value: "Pair-bonded, with a daily greeting display", icon: "Users" },
    { key: "movement", label: "Movement", value: "Very slow; anchors itself with a prehensile tail", icon: "Navigation" },
    { key: "camouflage", label: "Camouflage", value: "Changes colour and grows skin filaments to match its holdfast", icon: "Eye" },
    { key: "water-type", label: "Water type", value: "Saltwater; tolerates brackish estuaries", icon: "Droplet" },
    { key: "ocean-range", label: "Ocean range", value: "Western Atlantic, from Nova Scotia to Brazil", icon: "Globe" },
  ],

  highlights: ["length", "gestation", "clutch-size", "lifespan"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Nova Scotia and the Scotian Shelf",
      "The US Atlantic seaboard",
      "Chesapeake Bay",
      "Gulf of Mexico",
      "The Caribbean and West Indies",
      "Venezuela and Brazil",
    ],
    habitats: ["Seagrass beds", "Gorgonian and sponge gardens", "Floating sargassum", "Harbour pilings, crab pots and mooring lines"],
    elevation: "Shallow inshore water down to about 100 m",
    note: "The species is strongly associated with structure it can hold on to, natural or not — a seahorse census in a harbour finds them on crab pots and ropes as readily as on seagrass. It moves into deeper water over winter and back inshore to breed. Populations south of Rio de Janeiro may represent a separate species, and the taxonomy of the southern form is not settled.",
  },

  sections: [
    {
      id: "male-pregnancy",
      title: "How male pregnancy works",
      body: [
        "Courtship runs for days. A pair greets each other every morning, changing colour and circling in a slow display that keeps the bond and synchronises their reproductive cycles. When the female is ready she inserts an ovipositor into the opening of the male's pouch and transfers her eggs; he releases sperm into the pouch and it seals.",
        "What follows is a genuine pregnancy rather than a container. The pouch lining becomes richly supplied with blood vessels, delivering oxygen and taking away waste. The male controls the salinity inside, shifting it gradually from something close to body fluid towards full seawater so the young are acclimatised before they leave. He supplies nutrients and immune proteins, and the pouch tissue suppresses rejection of the embryos in a way that has drawn direct comparisons with the mammalian placenta.",
        "After about three weeks he goes into muscular contractions and expels the brood — anywhere from under a hundred to over fifteen hundred young, each around eleven millimetres long and fully formed. There is no parental care afterwards, and the survival rate is very low, which is why the broods are large. A male is often pregnant again within days.",
      ],
    },
    {
      id: "feeding",
      title: "The fastest strike, and no stomach",
      body: [
        "A seahorse cannot chase anything. Instead it hangs motionless and lets prey drift within a couple of centimetres, then rotates its head upward and expands the mouth cavity so fast that water and prey are drawn in before the copepod's escape reflex can fire. The whole strike takes a few thousandths of a second, and the shape of the snout is thought to create a zone of unusually still water ahead of the head so the approach itself does not trigger an alarm.",
        "Behind that snout there is no stomach and there are no teeth. Food passes through a short, simple gut and out again quickly, so almost nothing is stored. The consequence is that a seahorse has to feed for most of the daylight hours — thousands of individual prey items a day — and an animal that stops finding food starves within a very short time.",
      ],
    },
    {
      id: "holding-on",
      title: "Holding on",
      body: [
        "The tail is the seahorse's most useful organ. It has no fin and is square in cross-section rather than round — an arrangement that, when it curls, grips more securely and resists crushing better than a cylinder of the same size would, and which has been studied by engineers designing flexible robotic arms.",
        "Swimming is left to a dorsal fin fluttering up to fifty times a second and two small pectoral fins for steering. It is enough to move slowly and hold position and no more, which makes the lined seahorse one of the slowest fish in the sea. The trade-off is that a stationary animal that matches its background is very hard to see, and camouflage rather than speed is what keeps it alive.",
      ],
    },
    {
      id: "trade",
      title: "Dried, curio and aquarium",
      body: [
        "Seahorses are taken from the sea in three distinct trades. The largest by volume is the dried trade, chiefly for traditional Chinese medicine, where the most commonly cited estimates run to tens of millions of animals a year across all species. A second, smaller trade dries and varnishes them as souvenirs. A third supplies the live aquarium market.",
        "The dried trade is fed less by targeted fishing than by bycatch: seahorses come up in shrimp trawls in enormous numbers, and once landed they are worth keeping. That makes the problem hard to regulate, because reducing demand for seahorses does not reduce trawling for shrimp.",
        "All seahorse species were listed on CITES Appendix II in 2004, the first marine fish given that protection, which means international trade must be shown to be sustainable rather than being banned outright. Captive breeding now supplies much of the aquarium market and takes some pressure off wild stock, but it does not touch the dried trade, where wild-caught animals remain cheaper.",
      ],
    },
    {
      id: "threats",
      title: "Threats and conservation",
      body: [
        "Habitat is the underlying problem. Lined seahorses depend on seagrass, sponge and gorgonian habitat in shallow coastal water — precisely the zone lost to dredging, coastal development, nutrient runoff and trawl damage. An animal that cannot swim far cannot simply relocate when its patch is destroyed.",
        "Pair bonding compounds it. A seahorse whose partner is removed does not immediately re-pair, so a fishery or a habitat loss that removes half the animals from an area cuts reproduction by more than half.",
        "The species was assessed as Vulnerable in October 2016. The measures that work are unglamorous: protecting and restoring seagrass, restricting trawling in nursery habitat, and enforcing the CITES minimum size limits so that animals get at least one breeding season before they are taken.",
      ],
    },
  ],

  related: ["ocellaris-clownfish", "ocean-sunfish", "coelacanth", "giant-manta-ray"],
  tags: ["seahorse", "marine", "seagrass", "male pregnancy", "vulnerable", "cites"],
  searchTerms: ["hippocampus erectus", "northern seahorse", "seahorse pregnancy", "male seahorse birth", "sea horse"],

  faqs: [
    {
      q: "Do male seahorses really get pregnant?",
      a: "Yes, in a real physiological sense. The female transfers her eggs into a sealed pouch on the male's belly, where he fertilises them and then supplies oxygen and nutrients through a blood-rich pouch lining, controls the salinity inside, and gives birth through muscular contractions after about three weeks. It is a true pregnancy, not just egg-carrying.",
    },
    {
      q: "How big does a lined seahorse get?",
      a: "Around 12 to 19 centimetres measured along the curve of the body, which makes it one of the larger seahorses. FishBase gives a maximum standard length of 17.8 centimetres.",
    },
    {
      q: "Why do seahorses eat constantly?",
      a: "Because they have no stomach. Food passes through a short, simple gut very quickly and almost nothing is stored, so a seahorse must feed through most of the day — a juvenile has been recorded taking around 3,600 small crustaceans in a single day.",
    },
    {
      q: "Are seahorses good swimmers?",
      a: "No — they are among the slowest fish in the sea. Propulsion comes from one small dorsal fin beating up to fifty times a second, with two pectoral fins for steering. Their survival strategy is to grip a holdfast with the prehensile tail and stay invisible rather than to outrun anything.",
    },
    {
      q: "Why is the lined seahorse Vulnerable?",
      a: "Two pressures at once. Its shallow-water seagrass and sponge habitat is being lost to development, dredging, runoff and trawling, and it cannot move far to escape. At the same time it is caught in huge numbers as shrimp-trawl bycatch and sold into the dried and aquarium trades. All seahorses have been on CITES Appendix II since 2004.",
    },
  ],

  seo: {
    title: "Lined Seahorse — Male Pregnancy, Feeding, Habitat & Status",
    description:
      "A researched profile of the lined seahorse (Hippocampus erectus): how male pregnancy actually works, pivot feeding without a stomach, the prehensile square-sectioned tail, the dried seahorse trade and Vulnerable status.",
    keywords: [
      "lined seahorse facts",
      "hippocampus erectus",
      "male seahorse pregnancy",
      "seahorse brood pouch",
      "northern seahorse",
    ],
  },

  sources: [
    {
      label: "Hippocampus erectus — Red List assessment (Vulnerable, assessed 2016)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/10066/20191442",
    },
    {
      label: "Hippocampus erectus — species summary, Red List date and CITES listing",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Hippocampus-erectus.html",
    },
    {
      label: "Lined seahorse — field guide entry",
      publisher: "Chesapeake Bay Program",
      url: "https://www.chesapeakebay.net/discover/field-guide/entry/lined-seahorse",
    },
    {
      label: "Seahorse conservation and the global trade",
      publisher: "Project Seahorse",
      url: "https://projectseahorse.org/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default linedSeahorse;
