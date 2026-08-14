// Housefly — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const housefly = {
  slug: "housefly",
  category: "insects",
  name: "Housefly",
  scientificName: "Musca domestica",
  otherNames: ["House fly", "Common housefly"],

  summary:
    "The insect that has followed humans everywhere. It cannot bite or chew, dissolves solid food by vomiting on it, and moves pathogens between waste and food on its feet and in its gut.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Common_house_fly%2C_Musca_domestica.jpg/1920px-Common_house_fly%2C_Musca_domestica.jpg",
    alt: "A housefly seen from the side, showing large red compound eyes and a grey thorax with four dark stripes",
    credit: "USDAgov / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/-2018-10-04_Common_House_Fly_%28Musca_domestica%29%2C_Trimingham_%281%29.JPG/1920px--2018-10-04_Common_House_Fly_%28Musca_domestica%29%2C_Trimingham_%281%29.JPG",
      alt: "A housefly standing on a table indoors, wings held apart over the abdomen",
      credit: "Kolforn / Wikimedia Commons",
      title: "Found on a kitchen table",
      caption:
        "Houseflies are synanthropic: they live where people live, breed in our waste, and feed on our food. Almost nothing about their success is independent of us.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/-2018-10-04_Common_House_Fly_%28Musca_domestica%29%2C_Trimingham_%282%29.JPG/1920px--2018-10-04_Common_House_Fly_%28Musca_domestica%29%2C_Trimingham_%282%29.JPG",
      alt: "A housefly on an indoor surface with its legs spread and proboscis lowered",
      credit: "Kolforn / Wikimedia Commons",
      title: "Tasting with its feet",
      caption:
        "Chemoreceptors on the tarsi mean a fly knows whether a surface is worth eating the moment it lands. Whatever was on the last surface it stood on comes with it.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Detail_of_a_Housefly_%28Musca_domestica%29_at_8%C3%97_Magnification.jpg/1920px-Detail_of_a_Housefly_%28Musca_domestica%29_at_8%C3%97_Magnification.jpg",
      alt: "An 8x magnification detail of a housefly's abdomen with one club-shaped haltere visible behind the wing base",
      credit: "MicrocosmicWorld / Wikimedia Commons",
      title: "The second pair of wings",
      caption:
        "A fly's hindwings are reduced to halteres — small clubs that beat in antiphase with the wings and act as gyroscopes, feeding rotation data to the flight muscles. Remove them and the fly cannot stay airborne.",
    },
  ],

  headline: "The most successful animal we never invited",
  intro: [
    "The housefly is found on every continent except Antarctica, in more or less every human settlement, and it is there because we are. It breeds in manure, refuse, compost and carrion; it feeds on whatever we leave uncovered; and it completes a generation in a week when conditions are warm.",
    "Its reputation as a carrier of disease is deserved, but the usual phrasing — that it 'spreads germs' — obscures a fairly specific mechanism. A housefly has no biting mouthparts. To eat anything solid, it must first put liquid onto it: saliva, and often the partly digested contents of its own crop. Whatever it was standing in beforehand goes onto your food with it.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Diptera",
    family: "Muscidae",
    genus: "Musca",
    species: "Musca domestica",
  },

  conservation: {
    status: "NE",
    populationTrend: "unknown",
    populationEstimate:
      "No estimate exists; among the most abundant and widely distributed insects on Earth, present in almost every human settlement",
    note: "Not evaluated by the IUCN and never likely to be. This is one of the small number of species for which the practical question is control rather than conservation: it is a nuisance pest and a public-health concern in settings with poor sanitation and intensive livestock. The relevant population trend is in insecticide resistance, which is now widespread — resistance to pyrethroids, organophosphates and several newer classes has been documented in house fly populations worldwide, which is why sanitation rather than spraying is the recommended first line of control.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "6–7 mm",
      min: 6,
      max: 7,
      unit: "mm",
      note: "Females are typically slightly larger; in males the compound eyes nearly meet on top of the head",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "13–15 mm",
      min: 13,
      max: 15,
      unit: "mm",
    },
    {
      key: "wingbeat-rate",
      label: "Wingbeat rate",
      value: "Around 200 beats per second",
      min: 190,
      max: 220,
      unit: "Hz",
      note: "The audible buzz is the wingbeat itself; the halteres oscillate at the same frequency",
    },
    {
      key: "eggs-laid",
      label: "Eggs laid",
      value: "75–150 per batch",
      min: 75,
      max: 500,
      unit: "eggs",
      note: "Five or six batches over a lifetime, up to about 500 eggs in total",
    },
    {
      key: "development-time",
      label: "Egg to adult",
      value: "7–10 days in warm conditions",
      min: 7,
      max: 10,
      unit: "days",
      note: "Temperature-dependent: larval development alone can stretch to 30 days when cool",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "2–4 weeks",
      min: 2,
      max: 4,
      unit: "weeks",
      note: "Longer in cool conditions; adults can overwinter in heated buildings",
    },
    {
      key: "pathogens-carried",
      label: "Pathogens recorded",
      value: "More than 100 species",
      unit: "pathogens",
      note: "Bacteria, fungi, viruses and parasites recovered from wild-caught flies; carriage is not by itself proof of an established transmission route for every organism on the list",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Liquids only — solids must be dissolved first", icon: "Droplet" },
    { key: "feeding", label: "Feeding method", value: "Regurgitates saliva and crop contents, then sponges the liquid up", icon: "Utensils" },
    { key: "taste", label: "Taste", value: "Chemoreceptors on the feet — it tastes what it lands on", icon: "Footprints" },
    { key: "vision", label: "Vision", value: "Resolves visual change about seven times faster than a human eye", icon: "Eye" },
    { key: "activity", label: "Activity", value: "Diurnal; rests on ceilings and walls at night", icon: "Sun" },
    { key: "ecological-role", label: "Ecological role", value: "Decomposer of dung and carrion; mechanical disease vector", icon: "Recycle" },
  ],

  highlights: ["body-length", "development-time", "pathogens-carried", "feeding"],

  distribution: {
    continents: ["Europe", "Asia", "Africa", "North America", "South America", "Australia"],
    regions: [
      "Worldwide except Antarctica",
      "Highest densities around livestock housing, markets and waste disposal",
      "Present year-round in the tropics",
      "Overwinters indoors and in heated structures in cold climates",
    ],
    habitats: [
      "Human settlements",
      "Livestock housing and manure heaps",
      "Refuse and composting sites",
      "Food premises and markets",
    ],
    elevation: "Sea level to well above 2,000 m wherever people live",
    note: "The housefly is a commensal of humans and livestock rather than a species of any natural habitat. Its distribution maps onto settlement, waste and animal husbandry, and adults typically stay within a few hundred metres of a breeding site — although marked flies have been recovered many kilometres away.",
  },

  sections: [
    {
      id: "feeding",
      title: "It cannot chew, so it vomits",
      body: [
        "A housefly's mouthparts end in a labellum: a soft, sponge-like pad grooved by a network of fine channels called pseudotracheae. There is nothing to pierce with and nothing to bite with. The fly can only take up liquid, drawing it through those channels by capillary action and suction.",
        "That makes solid food a problem with a single solution. The fly deposits saliva onto it, and frequently regurgitates a droplet of partly digested material from its crop as well, then waits while enzymes dissolve the surface and sponges the resulting liquid back up. The small dark specks left where flies have been resting are the other end of the same process.",
        "Taste happens before any of this. Chemoreceptors on the tarsi mean the fly assesses a surface the instant it lands, extending the proboscis only if the surface reads as food. It is worth pausing on what that implies: a fly walks on everything it evaluates, and it evaluates a great deal in a day.",
      ],
    },
    {
      id: "disease",
      title: "How transmission actually works",
      body: [
        "The housefly is a mechanical vector, not a biological one. Nothing develops or multiplies inside it in the way malaria parasites develop inside a mosquito — the fly simply moves organisms from one place to another without changing them. That distinction matters, because it means the risk is entirely about where the fly has been and how recently.",
        "There are three routes, and they differ in how long they stay dangerous. Pathogens stuck to the tarsi and the fine hairs of the body survive on the outside for a matter of hours. Pathogens swallowed with a meal survive in the crop and gut for days, and are redeposited every time the fly regurgitates onto its next meal. And the fly defecates frequently while feeding, which is a third deposit of gut contents onto the surface.",
        "A 2018 systematic review of the literature recovered a long list of human pathogens from wild-caught houseflies — overwhelmingly bacteria, along with fungi, parasites and viruses — with organisms including Salmonella, Escherichia coli, Shigella and Campylobacter recorded repeatedly. Flies are associated with the mechanical transmission of typhoid, cholera, bacillary dysentery, salmonellosis and trachoma, and their epidemiological importance is greatest exactly where you would expect: where human or animal waste, food preparation and dense fly populations coincide.",
        "Two qualifications keep this proportionate. Isolating an organism from a fly demonstrates carriage, not that flies are a significant route of infection for that disease in a given setting. And in places with sealed sewage, refuse collection and covered food, the housefly's contribution to disease burden is small. The mechanism does not change; the opportunity does.",
      ],
    },
    {
      id: "life-cycle",
      title: "A generation a week",
      body: [
        "A female lays her eggs in batches of 75 to 150 on warm, moist, decaying organic material — manure is the classic substrate, but refuse, compost and spoiled food all serve. She may lay five or six batches, up to around 500 eggs in a life. The eggs hatch within a day.",
        "The larvae are the pale, legless maggots familiar from any neglected bin. They pass through three instars, feeding on the bacterial soup of the decaying material rather than on the material itself, then migrate to a drier spot and pupate inside a hardened larval skin. At 35°C the pupal stage takes as little as two days.",
        "Egg to adult can therefore be complete in seven to ten days, and the adult lives two to four weeks. It is that compressed cycle — not the number of eggs, which is unremarkable for an insect — that lets a fly population go from nothing to a serious problem inside a fortnight of warm weather. It is also why the effective control measure is removing breeding substrate rather than killing adults: by the time the adults are visible, the next generation is already in the heap.",
      ],
    },
    {
      id: "senses",
      title: "Why you cannot swat one",
      body: [
        "A housefly's compound eyes cover most of its head and resolve visual change roughly seven times faster than a human eye does. A hand descending at ordinary speed is, to the fly, a slow and clearly telegraphed event. Work on related flies has shown that they compute the direction of an approaching threat and shift their legs into a pre-flight stance before jumping, so that the escape jump is already aimed away from the hand.",
        "Once airborne, the stabilising system is the halteres — the hindwings, reduced in all true flies to small knobbed stalks that beat in antiphase with the forewings. Because they are oscillating masses, Coriolis forces act on them whenever the body rotates, and mechanoreceptors at their base read those forces and feed corrections to the wing muscles within a single wingbeat. A fly with its halteres removed cannot fly at all.",
        "Behind all of it is the wingbeat itself, around two hundred cycles a second, driven by asynchronous flight muscle that contracts several times per nerve impulse rather than once. It is the reason a fly buzzes at the pitch it does, and the reason it can change direction in a distance shorter than its own body length.",
      ],
    },
  ],

  related: ["emperor-dragonfly", "leafcutter-ant", "seven-spot-ladybird"],
  tags: ["fly", "diptera", "urban", "disease vector", "worldwide", "decomposer"],
  searchTerms: [
    "musca domestica",
    "house fly",
    "do flies vomit on food",
    "how long do flies live",
    "flies disease",
  ],

  faqs: [
    {
      q: "Do houseflies really vomit on your food?",
      a: "Yes, and they have no alternative. A housefly's mouthparts form a sponge-like pad with no piercing or chewing structures, so it can only ingest liquid. To eat anything solid it deposits saliva and often regurgitated crop contents onto the surface, waits for enzymes to dissolve it, and sponges up the result.",
    },
    {
      q: "How do houseflies spread disease?",
      a: "Mechanically — they move pathogens without those pathogens developing inside them. There are three routes: organisms stuck to the feet and body hairs, which survive a few hours; organisms carried in the crop and gut, which survive days and are redeposited whenever the fly regurgitates onto food; and faeces, which flies deposit frequently while feeding. More than a hundred pathogen species have been recovered from wild-caught houseflies.",
    },
    {
      q: "How long does a housefly live?",
      a: "An adult lives two to four weeks, longer in cool conditions. The whole cycle from egg to adult takes only seven to ten days in warm weather, which is why fly numbers can rise so quickly — a single breeding site can produce a new generation every week through summer.",
    },
    {
      q: "Why are houseflies so hard to swat?",
      a: "They see the swat coming much earlier than you would expect. A fly resolves visual change around seven times faster than a human eye, and it uses that time to reposition its legs so the escape jump is already directed away from the threat before it launches. In the air, its halteres — the reduced hindwings — act as gyroscopes and correct its attitude within a single wingbeat.",
    },
    {
      q: "What is the best way to get rid of houseflies?",
      a: "Remove what they breed in. Flies lay in warm, moist decaying organic material, so sealed bins, prompt refuse removal, cleaned-up animal waste and covered food do more than anything aimed at adults. Insecticide resistance is now widespread in house fly populations worldwide, which makes spraying an unreliable strategy on its own; screens and physical exclusion handle the flies that arrive from elsewhere.",
    },
  ],

  seo: {
    title: "Housefly — Feeding, Disease Transmission & Life Cycle",
    description:
      "A researched profile of the housefly (Musca domestica): how it liquefies food by regurgitating, exactly how it transmits pathogens mechanically, its one-week life cycle, and why it is so hard to swat.",
    keywords: [
      "housefly facts",
      "musca domestica",
      "do flies vomit on food",
      "how flies spread disease",
      "housefly life cycle",
    ],
  },

  sources: [
    {
      label: "A systematic review of human pathogens carried by the housefly (Musca domestica L.)",
      publisher: "BMC Public Health",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6104014/",
    },
    {
      label: "House Fly fact sheet",
      publisher: "University of New Hampshire Extension",
      url: "https://extension.unh.edu/resource/house-fly-fact-sheet",
    },
    {
      label: "House flies — biology and management",
      publisher: "Penn State Extension",
      url: "https://extension.psu.edu/house-flies",
    },
  ],

  updatedAt: "2026-07-29",
};

export default housefly;
