// Ocean sunfish — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.
//
// Note on media: every gallery candidate returned for this species was shot at
// Crystal Bay, Nusa Penida, Bali — where the sunfish divers encounter have been
// identified by DNA as Mola alexandrini, not Mola mola. They are omitted rather
// than filed under the wrong species.

const oceanSunfish = {
  slug: "ocean-sunfish",
  category: "fish",
  name: "Ocean Sunfish",
  scientificName: "Mola mola",
  otherNames: ["Common mola", "Moonfish", "Peixe-lua", "Schwimmender Kopf"],

  summary:
    "A fish shaped like a head with fins, weighing up to a tonne, that dives past 800 metres to feed and comes back to the surface to lie on its side and warm up.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/98/Mola_mola.jpg",
    alt: "An ocean sunfish in open water, its tall dorsal and anal fins set far back on a flattened, abruptly truncated body",
    credit: "U.S. National Oceanic and Atmospheric Administration / Wikimedia Commons",
  },
  gallery: [],

  headline: "A fish that appears to have been cut in half",
  intro: [
    "The ocean sunfish looks unfinished. There is a head, a pair of tall fins above and below, and then the body simply stops, ending in a rounded frill that is not a tail at all. It has no swim bladder, no ribs, no pelvic fins and very few bones for its size, and it swims by sculling the dorsal and anal fins from side to side like a pair of oars.",
    "It is also frequently misdescribed. It is not the heaviest bony fish — the record specimens belong to its relative Mola alexandrini, with which it was confused for two centuries. It does not live on jellyfish alone; stomach studies show a generalist diet in which gelatinous prey is a minority. And it is not doing nothing when it lies on its side at the surface. Its Red List status is Vulnerable, not Least Concern, and the reason is bycatch.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Tetraodontiformes",
    family: "Molidae",
    genus: "Mola",
    species: "Mola mola",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2011,
    populationTrend: "decreasing",
    populationEstimate: "No global figure; the species is widespread but is taken in very large numbers as bycatch in surface driftnet and longline fisheries",
    note: "Assessed on 7 June 2011 and published in the 2015 Red List, with an errata version in 2016. Much older literature about Mola mola actually concerns Mola alexandrini or Mola tecta, the hoodwinker sunfish described in 2017, and an IUCN review panel has since worked through what can safely be attributed to which species. There is little targeted fishing; the pressure is almost entirely incidental catch.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Up to about 3.3 m",
      min: 1.8,
      max: 3.3,
      unit: "m",
      note: "FishBase gives a maximum of 333 cm total length",
    },
    {
      key: "height",
      label: "Height, fin tip to fin tip",
      value: "Roughly as tall as it is long",
      unit: "m",
      note: "The dorsal and anal fins are enormous and set far back, which is why a sunfish at the surface looks like a fin with a fish attached",
    },
    {
      key: "weight",
      label: "Weight",
      value: "250–1,000 kg; up to about 1,300 kg",
      min: 250,
      max: 1300,
      unit: "kg",
      note: "The frequently quoted 2,300 kg record is now referred to Mola alexandrini, as is the 2,744 kg animal found off the Azores in 2021",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "About 3 km/h",
      min: 3,
      max: 3.2,
      unit: "km/h",
      note: "Sculling with the dorsal and anal fins; despite the appearance, sunfish are active swimmers rather than drifters",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "To at least 800 m",
      min: 800,
      max: 1515,
      unit: "m",
      note: "FishBase gives a maximum of 1,515 m; tagged fish spend much of their time working below 200 m and returning to the surface between dives",
    },
    {
      key: "clutch-size",
      label: "Eggs per female",
      value: "Estimated at up to 300 million",
      min: 300000000,
      max: 300000000,
      unit: "eggs",
      note: "The largest egg count reported for any vertebrate, but it rests on a single early-twentieth-century count of ovary tissue and has never been repeated",
    },
    {
      key: "growth-factor",
      label: "Growth from hatching",
      value: "About 60 million times its hatching weight",
      min: 60000000,
      max: 60000000,
      unit: "×",
      note: "Equivalent to a one-gram tadpole becoming a sixty-tonne frog",
    },
    {
      key: "parasite-species",
      label: "Recorded parasites",
      value: "Nearly 40 kinds",
      min: 40,
      max: 40,
      unit: "species",
      note: "Some of them carry parasites of their own",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Poorly known; estimates run to about 20 years",
      min: 10,
      max: 23,
      unit: "years",
      note: "No validated ageing method exists for the species; captive fish have reached about ten years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Generalist carnivore — small fish, squid, crustaceans and salps; jellyfish are a minority of the diet", icon: "Fish" },
    { key: "movement", label: "Movement", value: "Sculls with the dorsal and anal fins; steers with the clavus", icon: "Navigation" },
    { key: "thermoregulation", label: "Thermoregulation", value: "Basks flat at the surface to rewarm after deep, cold dives", icon: "Thermometer" },
    { key: "activity", label: "Activity", value: "Repeated day-long cycles of deep foraging dives and surface recovery", icon: "Sun" },
    { key: "schooling-behaviour", label: "Schooling", value: "Adults usually alone; larvae and juveniles shoal", icon: "Users" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "ocean-range", label: "Ocean range", value: "Tropical and temperate seas worldwide, roughly 75°N to 65°S", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Predator of the deep scattering layer; host to a very large parasite community", icon: "Leaf" },
  ],

  highlights: ["weight", "length", "clutch-size", "dive-depth"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "The California Current",
      "The northeast Atlantic and the Celtic Sea",
      "The Mediterranean",
      "Southern Japan and the Kuroshio",
      "South Africa's Agulhas coast",
      "Southeast Australia and New Zealand",
    ],
    habitats: ["Open ocean", "Continental shelf edges", "Surface waters above deep-water fronts"],
    elevation: "Surface to at least 800 m, with records far deeper",
    note: "Found in all tropical and temperate oceans and recorded from roughly 75°N to 65°S, preferring water between about 12 and 25 °C. Sunfish follow productive fronts and eddies rather than fixed coastlines, and satellite tracking has shown long seasonal movements. Note that the sunfish encountered by divers at Crystal Bay in Bali — often described as Mola mola — have been identified by DNA as Mola alexandrini.",
  },

  sections: [
    {
      id: "shape",
      title: "A fish that stops halfway",
      body: [
        "A sunfish larva is a spiky, unremarkable pufferfish relative a few millimetres across. What happens next is that the back of the fish stops growing. The tail fin never develops; in its place a stiff rounded frill called the clavus forms from the rear rays of the dorsal and anal fins, acting as a rudder. Everything behind the fins is, in effect, absent.",
        "The rest is equally pared back. There is no swim bladder — buoyancy comes from a thick layer of low-density gelatinous tissue under the skin. There are no ribs and no pelvic fins, and the skeleton is largely cartilage, which is how an animal three metres tall stays manageable. The skin itself is several centimetres thick, tough enough to blunt tools, and covered in a heavy mucus layer.",
        "Propulsion comes from the two vertical fins sculling side to side in unison, an unusual arrangement that works better than it looks: tagged sunfish cover long distances, swim actively through the water column, and are not the helpless drifters they were long assumed to be.",
      ],
    },
    {
      id: "two-molas",
      title: "Two sunfish, confused for two centuries",
      body: [
        "The genus Mola has been a taxonomic mess for most of its history, with a long list of names applied inconsistently to what turned out to be a small number of species. The practical consequence is that a great deal of what is written about Mola mola is not about Mola mola.",
        "Most notably, the record-weight animals belong elsewhere. The 2,300 kg specimen from Kamogawa in Japan, quoted for decades as the heaviest bony fish, is now referred to Mola alexandrini, the bump-head sunfish — as is the 2,744 kg animal found off Faial in the Azores in 2021 that holds the current record. Mola mola reaches perhaps 1,300 kg.",
        "A third species, Mola tecta, the hoodwinker sunfish, was described in 2017 from animals that had been hiding in plain sight in the southern hemisphere. And the sunfish that divers travel to Bali to see at Crystal Bay, universally billed as mola mola, have been shown by fin-clip DNA to be M. alexandrini. Sorting out which records belong to which species is ongoing work, and it directly affects what can be said about population trends.",
      ],
    },
    {
      id: "feeding-and-basking",
      title: "Deep dives and surface recovery",
      body: [
        "The picture of a sunfish as a jellyfish specialist is out of date. Stomach analyses show a generalist predator taking small fish, squid, crustaceans, molluscs and salps, with jellyfish making up only a modest share. Smaller animals feed near the seabed and on reef invertebrates; larger ones shift to soft-bodied open-ocean prey.",
        "The feeding happens deep. Tagged sunfish make repeated dives well below 200 metres — into the deep scattering layer, where gelatinous and crustacean prey concentrate — and FishBase records a maximum of 1,515 metres. That water is cold, and a fish with no way of generating heat cannot stay in it.",
        "This is what the famous surface basking is for. A sunfish lying flat on its side at the surface, apparently derelict, is warming back up: presenting the maximum area to the sun and to warm surface water before descending again. The cycle repeats through the day, and the behaviour that made the animal look lazy is the recovery phase of an actively working diving predator.",
      ],
    },
    {
      id: "parasites",
      title: "A moving reef of parasites",
      body: [
        "Nearly forty kinds of parasite have been recorded on and in ocean sunfish, from flukes and tapeworms to copepods and gooseneck barnacles found growing inside the throat. Some of those parasites host parasites themselves. A large mola is less an individual than a small ecosystem.",
        "It has, in response, more parasite-removal strategies than almost any other fish. At the surface it lies flat and lets seabirds — gulls and albatrosses — pick at its skin. On reefs it queues at cleaning stations where wrasse and other cleaner fish work it over, and sunfish have been observed positioning themselves and holding still to invite this.",
        "The breaching is probably part of the same problem. Sunfish clear the water and land flat with considerable force, and while the reason is not settled, dislodging parasites is the leading explanation.",
      ],
    },
    {
      id: "threats",
      title: "Caught by accident, in enormous numbers",
      body: [
        "Nobody sets out to catch ocean sunfish. They are caught anyway, in surface driftnets and longlines aimed at swordfish and tuna, and the incidental catch rates are extraordinary. In the Spanish Mediterranean drift gillnet fishery surveyed between 1992 and 1994, sunfish made up between 71 and 93 per cent of the total catch by number. In the Californian drift gillnet fishery targeting swordfish the figure is closer to 29 per cent.",
        "The nets injure as well as kill. Sunfish rubbing against mesh lose the heavy mucus layer that protects their skin, which leaves them open to infection even when released.",
        "Plastic is the second pressure and follows directly from the diet. A floating plastic bag in blue water resembles a salp or a jellyfish closely enough to be eaten, and an animal that cannot pass it starves with a full stomach.",
        "The species was assessed as Vulnerable in 2011 and remains so. There is a widespread assumption that something this abundant and this fecund cannot be at risk, but 300 million eggs are worth very little if the adults that would lay them are being removed from the sea as an unwanted by-product of catching something else.",
      ],
    },
  ],

  related: ["giant-manta-ray", "atlantic-bluefin-tuna", "whale-shark", "coelacanth"],
  tags: ["sunfish", "marine", "open ocean", "bycatch", "vulnerable", "megafauna"],
  searchTerms: ["mola mola", "sunfish", "moonfish", "heaviest bony fish", "mola alexandrini"],

  faqs: [
    {
      q: "Is the ocean sunfish the heaviest bony fish in the world?",
      a: "Not quite. That title belongs to its relative Mola alexandrini, the bump-head sunfish, which the record specimens are now assigned to — including a 2,744 kg animal found off the Azores in 2021. Mola mola itself reaches around 1,300 kg, which is still enormous for a bony fish.",
    },
    {
      q: "Why does an ocean sunfish lie on its side at the surface?",
      a: "To warm up. Sunfish feed on repeated dives below 200 metres into cold water, and having no way to generate body heat they return to the surface and present the largest possible area to the sun and to warm surface water before going down again. It also lets seabirds pick parasites off their skin.",
    },
    {
      q: "Do ocean sunfish only eat jellyfish?",
      a: "No, that is an outdated idea. Stomach studies show a generalist predator taking small fish, squid, crustaceans, molluscs and salps, with jellyfish making up only a modest share of the diet. Smaller sunfish feed near the seabed; larger ones move on to soft-bodied open-ocean prey.",
    },
    {
      q: "Why doesn't a sunfish have a tail?",
      a: "It never grows one. The tail fin fails to develop, and in its place a stiff rounded frill called the clavus forms from the rear rays of the dorsal and anal fins and acts as a rudder. The fish swims by sculling those two tall fins side to side instead.",
    },
    {
      q: "Why is the ocean sunfish vulnerable?",
      a: "Bycatch. Sunfish are not targeted, but they are caught in vast numbers in surface driftnets and longlines set for swordfish and tuna — 71 to 93 per cent of the total catch in one surveyed Mediterranean driftnet fishery. Contact with nets also strips the protective mucus from their skin, and floating plastic bags are eaten as jellyfish.",
    },
  ],

  seo: {
    title: "Ocean Sunfish (Mola mola) — Size, Diving, Basking & Status",
    description:
      "A researched profile of the ocean sunfish (Mola mola): why it has no tail, deep foraging dives and surface basking, the confusion with Mola alexandrini over the heaviest-bony-fish record, driftnet bycatch and Vulnerable status.",
    keywords: [
      "ocean sunfish facts",
      "mola mola",
      "heaviest bony fish",
      "why do sunfish bask",
      "mola alexandrini",
    ],
  },

  sources: [
    {
      label: "Mola mola — Red List assessment (Vulnerable, assessed 2011)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/190422/97667070",
    },
    {
      label: "Mola mola — species summary, Red List date, size and depth range",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Mola-mola.html",
    },
    {
      label: "Ocean sunfish — species profile",
      publisher: "Monterey Bay Aquarium",
      url: "https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/ocean-sunfish",
    },
    {
      label: "The ocean sunfishes (family Molidae): recommendations from the IUCN Molidae review panel",
      publisher: "Marine Policy",
      url: "https://www.sciencedirect.com/science/article/abs/pii/S0308597X23002932",
    },
    {
      label: "Heaviest bony fish — record held by Mola alexandrini",
      publisher: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/world-records/heaviest-bony-fish",
    },
  ],

  updatedAt: "2026-07-29",
};

export default oceanSunfish;
