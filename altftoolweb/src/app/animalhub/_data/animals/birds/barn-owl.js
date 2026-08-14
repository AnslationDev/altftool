// Barn owl — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const barnOwl = {
  slug: "barn-owl",
  category: "birds",
  name: "Barn Owl",
  scientificName: "Tyto alba",
  otherNames: ["Western barn owl", "Screech owl", "Ghost owl"],

  summary:
    "The owl that hunts by sound alone, locating prey in total darkness to within one degree, and flies silently enough that its target never hears it coming.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/17/Barn_Owl%2C_Lancashire.jpg",
    alt: "A barn owl in flight low over rough grassland in Lancashire, pale underparts and heart-shaped face lit from the side",
    credit: "Steven Ward / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Barn_Owl_-_Tyto_alba_%2850306204682%29.jpg/1920px-Barn_Owl_-_Tyto_alba_%2850306204682%29.jpg",
      alt: "A barn owl photographed in Scotland, showing the pale heart-shaped facial disc and dark eyes",
      credit: "caroline legg / Wikimedia Commons",
      title: "The face is an ear",
      caption:
        "That heart-shaped disc is not decoration — it is a sound collector. The stiff ruff feathers around its edge funnel sound towards the ear openings. Remove them and the owl can still tell left from right, but loses the ability to judge height.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Barn_Owl_%28Tyto_alba%29_%2830769094630%29.jpg/1920px-Barn_Owl_%28Tyto_alba%29_%2830769094630%29.jpg",
      alt: "A barn owl perched at Lower Sabie in Kruger National Park, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "African as much as European",
      caption:
        "Tyto alba as currently defined spans Europe, southwest Asia and the whole of Africa. Barn owls in the broad sense reach nearly every continent, which makes them among the most widely distributed land birds in the world.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Barn_Owl_%28Tyto_alba%29_%286564259641%29.jpg/1920px-Barn_Owl_%28Tyto_alba%29_%286564259641%29.jpg",
      alt: "A barn owl in the Auob riverbed, Kgalagadi Transfrontier Park, South Africa",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Hunting the open ground",
      caption:
        "Barn owls need open country with a good rodent population — grassland, marsh edges, riverbeds, rough field margins. Intensive farming that removes those margins removes the voles, and the owls go with them.",
    },
  ],

  headline: "Hunting in total darkness, by ear",
  intro: [
    "The barn owl is the most rigorously studied hearing system in the animal kingdom, and for good reason. In experiments published by Roger Payne in 1971, barn owls in a completely dark room struck live mice using nothing but sound, with an angular error of less than one degree in both the horizontal and vertical planes. Drag a wad of paper through dry leaves and the owl hits that too — ruling out smell and heat as the cue.",
    "Two adaptations make it work. The ear openings are placed asymmetrically on the head, so a sound arrives at each at a slightly different time and intensity depending on its height as well as its direction. And the pale heart-shaped face is a parabolic collector, its stiff ruff of feathers funnelling sound towards those openings. Take the ruff away and the owl can still find the direction — but not the elevation.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Strigiformes",
    family: "Tytonidae",
    genus: "Tyto",
    species: "Tyto alba",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2019,
    populationTrend: "decreasing in intensively farmed regions; global trend poorly known",
    populationEstimate:
      "Not precisely quantified; a pre-split estimate put barn owls in the broad sense at around 3.6 million breeding birds worldwide",
    note: "Least Concern thanks to an enormous range, though numbers are falling in intensively farmed regions. Reliable density and trend data are missing across most of the range — standard breeding bird surveys do not work well for a nocturnal, cavity-nesting species — so the global picture is genuinely uncertain rather than merely unstated. Taxonomy complicates the figures: genetic work in the late 2010s showed the cosmopolitan barn owl to be several species, and most authorities now restrict Tyto alba to Europe, southwest Asia and Africa, splitting off the American barn owl (T. furcata), the eastern barn owl (T. javanica) and the Andaman masked owl (T. deroepstorffi). Population estimates predating that change cover all of them together.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "33–35 cm",
      min: 33,
      max: 35,
      unit: "cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "80–95 cm",
      min: 80,
      max: 95,
      unit: "cm",
      note: "Large wings on a very light body — the low wing loading is what allows slow, quiet hunting flight",
    },
    {
      key: "weight",
      label: "Weight",
      value: "240–480 g",
      min: 240,
      max: 480,
      unit: "g",
      note: "Varies by subspecies and region: Italian birds 240–310 g, German birds 290–480 g, South African birds 295–380 g",
    },
    {
      key: "hearing-accuracy",
      label: "Sound localisation accuracy",
      value: "Under 1° error, in complete darkness",
      note: "Measured in both the horizontal and vertical planes. The owl depends on frequencies above 5 kHz, and its ears are highly directional above 8.5 kHz.",
    },
    {
      key: "daily-food",
      label: "Daily food intake",
      value: "Around 23% of body weight per night",
      note: "Roughly one or more voles, or their equivalent, each night",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "About 5 eggs, ranging 2–9",
      min: 2,
      max: 9,
      unit: "eggs",
      note: "Clutch size tracks the local rodent population — big clutches in vole peak years",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 30 days",
      min: 29,
      max: 34,
      unit: "days",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "About 9 weeks",
      min: 55,
      max: 65,
      unit: "days",
      note: "Young begin leaving the nest briefly around the ninth week",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 4 years on average in the wild",
      min: 4,
      max: 25,
      unit: "years",
      note: "Wild barn owls are decidedly short-lived; captive birds may reach twenty years or more, with one recorded at over twenty-five",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — almost entirely small mammals, especially voles, mice and shrews", icon: "Utensils" },
    { key: "activity", label: "Activity", value: "Nocturnal, sometimes hunting at dusk", icon: "Moon" },
    { key: "nest-type", label: "Nest type", value: "None built — a cavity in a tree, cliff, barn or nest box", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Monogamous pairs, often for life", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Major rodent predator on farmland", icon: "Leaf" },
  ],

  highlights: ["hearing-accuracy", "wingspan", "weight", "clutch-size"],

  distribution: {
    continents: ["Africa", "Asia", "Europe"],
    regions: [
      "Britain, Ireland and western Europe",
      "The Mediterranean and North Africa",
      "Sub-Saharan Africa",
      "Southwest Asia",
    ],
    habitats: [
      "Rough grassland",
      "Farmland margins and hedgerows",
      "Marsh edges",
      "Open woodland and savanna",
      "Barns, ruins and other buildings",
    ],
    elevation: "Mainly lowland open country",
    note: "Under the current taxonomy Tyto alba covers Europe, southwest Asia and Africa. Barn owls in the broader traditional sense — including the American and eastern species — occupy nearly every continent and are among the most widely distributed of all land birds, absent mainly from polar regions, true desert, Asia north of the Himalaya and much of Indonesia. Everywhere they occur they want the same thing: open ground with a lot of rodents in it.",
  },

  sections: [
    {
      id: "hearing",
      title: "The experiments that made it famous",
      body: [
        "Roger Payne's work at Cornell, published in the Journal of Experimental Biology in 1971 as 'Acoustic Location of Prey by Barn Owls', is the foundation. Owls in a light-sealed room caught live mice moving through leaf litter, in darkness total enough to rule out vision entirely. The strike accuracy was better than one degree in both azimuth and elevation.",
        "The controls are what made the result stick. Replacing the mouse with a mouse-sized wad of paper dragged through the leaves produced the same successful strike, eliminating scent and body heat as cues. Plugging one ear with cotton left the owl flying at the sound but missing to one side by roughly 45 cm — the classic demonstration that the two ears are being compared against each other.",
        "The anatomy behind it has two parts. The ear openings sit asymmetrically on the head — one higher than the other — so a sound source above or below the owl reaches them differently, giving the bird elevation information that a symmetrical head cannot provide. And the facial disc collects: with the ruff feathers removed, an owl can still work out the horizontal direction of a sound but fails on elevation. Measurements at the eardrum show the ear is strongly directional above 8.5 kHz, and the owls depend on frequencies above 5 kHz.",
      ],
    },
    {
      id: "silent-flight",
      title: "Why the flight is silent",
      body: [
        "Hearing prey is only half of it. An owl hunting by ear must also not drown out the sounds it is listening for, and it must not warn the animal it is approaching. Barn owls are among the quietest fliers in the world.",
        "Three feather modifications do it. The leading edge of the outer flight feathers carries a comb of fine serrations that breaks the incoming airflow into smaller, less noisy eddies. The trailing edge has a soft hair-like fringe that lets the air rejoin smoothly rather than shedding turbulence. And the surface of the feathers is velvety, damping the rustle of feathers moving over each other.",
        "The cost is aerodynamic efficiency, which the barn owl can afford because it flies slowly on very large wings for its weight. That low wing loading is also what lets it quarter a field at walking pace, hovering into the wind while it listens.",
      ],
    },
    {
      id: "diet",
      title: "A specialist rodent predator",
      body: [
        "Nearly all of a barn owl's diet is small mammals: voles above all, plus mice, rats and shrews, with the exact mix depending on what is abundant locally. An individual takes roughly its own body weight in prey every four or five nights — about 23% of body weight each night, or one or more voles' worth.",
        "Because barn owls swallow prey whole and regurgitate the indigestible remains as pellets, their diet is unusually easy to reconstruct. Pellet analysis is a standard field method, and barn owl pellets have been used to survey small mammal populations across whole landscapes.",
        "This diet is why the species tracks farming practice so tightly. Rough grass margins, hedgerows and set-aside hold voles; intensively cropped fields do not. Second-generation anticoagulant rodenticides add another problem, accumulating in owls that eat poisoned rodents.",
      ],
    },
    {
      id: "breeding",
      title: "Breeding to the rodent cycle",
      body: [
        "Barn owls build nothing. A pair uses a cavity — a hollow tree, a cliff crevice, a barn loft, a church tower or a purpose-built nest box — and lays directly onto the accumulated debris. Clutches average about five eggs but range from two to nine, and that variation is not random: in years when voles are abundant, barn owls lay more eggs and may raise two broods.",
        "Incubation takes around thirty days and the eggs hatch several days apart, so a brood contains chicks of visibly different sizes. In a good year all survive; in a poor one the youngest do not, which is the mechanism that matches brood size to available food.",
        "Young start leaving the nest around the ninth week. Mortality afterwards is high — the average wild barn owl lives only about four years, with most deaths in the first — even though captive birds regularly pass twenty and one reached over twenty-five. Nest box schemes are widespread and effective because cavity sites, not food alone, often limit where pairs can breed.",
      ],
    },
  ],

  related: ["snowy-owl", "peregrine-falcon", "golden-eagle", "common-raven"],
  tags: ["owl", "nocturnal", "farmland", "hearing", "silent flight"],
  searchTerms: ["barn owl", "tyto alba", "white owl", "owl hearing", "silent flight"],

  faqs: [
    {
      q: "How well can a barn owl hear?",
      a: "Well enough to catch a mouse in total darkness using sound alone, with an aiming error of less than one degree in both the horizontal and vertical planes. This was demonstrated by Roger Payne in experiments published in 1971, including a control in which the owl successfully struck a mouse-sized paper wad dragged through leaves — ruling out smell and body heat.",
    },
    {
      q: "Why is a barn owl's face heart-shaped?",
      a: "Because it functions as a sound collector. The stiff ruff of feathers around the edge of the disc funnels sound towards the ear openings, much like a parabolic dish. Experiments show that an owl with the ruff feathers removed can still work out the horizontal direction of a sound but can no longer judge its height.",
    },
    {
      q: "Why do owls fly silently?",
      a: "Three feather features. A comb of fine serrations on the leading edge of the outer flight feathers breaks up incoming airflow, a hair-like fringe on the trailing edge lets air rejoin smoothly instead of shedding turbulent noise, and a velvety feather surface damps the rustle of feathers rubbing together. Silence matters twice over: prey does not hear the approach, and the owl does not mask the faint sounds it is hunting by.",
    },
    {
      q: "What do barn owls eat?",
      a: "Almost entirely small mammals — voles above all, plus mice, rats and shrews. A barn owl eats around 23% of its body weight each night, roughly a vole or more. Prey is swallowed whole and the bones and fur regurgitated as pellets, which makes barn owl diets unusually easy for researchers to reconstruct.",
    },
    {
      q: "How long do barn owls live?",
      a: "Not long in the wild — about four years on average, with mortality concentrated in the first year. Captive birds do far better, commonly reaching twenty years or more, and one lived past twenty-five. High turnover is offset by large and flexible clutches: in years when voles are abundant, pairs lay more eggs and may raise two broods.",
    },
    {
      q: "Is the barn owl one species or several?",
      a: "Several, on current evidence. Genetic work in the late 2010s showed the traditional cosmopolitan barn owl to be paraphyletic, and most authorities now recognise Tyto alba for Europe, southwest Asia and Africa, with the American barn owl (T. furcata), eastern barn owl (T. javanica) and Andaman masked owl (T. deroepstorffi) treated separately. Population figures published before that change cover all of them together.",
    },
  ],

  seo: {
    title: "Barn Owl — Hearing, Silent Flight, Diet & Range",
    description:
      "A researched profile of the barn owl (Tyto alba): sound localisation to within one degree in total darkness, the heart-shaped facial disc, silent-flight feathers, and its dependence on farmland voles.",
    keywords: [
      "barn owl facts",
      "tyto alba",
      "barn owl hearing",
      "why owls fly silently",
      "barn owl diet pellets",
    ],
  },

  sources: [
    {
      label: "Tyto alba — Red List assessment (2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22688504/155542941",
    },
    {
      label: "Acoustic Location of Prey by Barn Owls (Tyto alba)",
      publisher: "Roger S. Payne, Journal of Experimental Biology (1971)",
      url: "https://journals.biologists.com/jeb/article-abstract/54/3/535/21635/Acoustic-Location-of-Prey-by-Barn-Owls-Tyto-Alba",
    },
    {
      label: "Why are barn owls a model system for sound localization?",
      publisher: "Journal of Experimental Biology",
      url: "https://doi.org/10.1242/jeb.034231",
    },
    {
      label: "Western Barn Owl species account",
      publisher: "Cornell Lab of Ornithology, Birds of the World",
      url: "https://birdsoftheworld.org/bow/species/webowl1/cur/introduction",
    },
  ],

  updatedAt: "2026-07-29",
};

export default barnOwl;
