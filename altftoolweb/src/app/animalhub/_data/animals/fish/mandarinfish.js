// Mandarinfish — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const mandarinfish = {
  slug: "mandarinfish",
  category: "fish",
  name: "Mandarinfish",
  scientificName: "Synchiropus splendidus",
  otherNames: ["Mandarin dragonet", "Green mandarin", "Psychedelic mandarinfish"],

  summary:
    "A seven-centimetre reef fish with no scales, a bitter mucus coat instead of them, and one of only two known vertebrate blues made from a real pigment rather than a trick of the light.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Synchiropus_splendidus_2_Luc_Viatour.jpg/1920px-Synchiropus_splendidus_2_Luc_Viatour.jpg",
    alt: "A mandarinfish in close view, its blue body marked with swirling orange bands and its large pelvic fins spread beneath it",
    credit: "Luc Viatour / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Mandarinfish_%28Synchiropus_splendidus%29_%2816057996190%29.jpg/1920px-Mandarinfish_%28Synchiropus_splendidus%29_%2816057996190%29.jpg",
      alt: "A mandarinfish photographed on the reef in the Lembeh Strait, Indonesia",
      credit: "Rickard Zerpe / Wikimedia Commons",
      title: "Where they actually live",
      caption:
        "The habitat is not the postcard reef. Mandarinfish want sheltered lagoons and inshore reef with silty bottoms and broken coral rubble — messy, low-visibility ground that provides the crevices they hide in and the copepods they eat.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Mandarinfish_%28Synchiropus_splendidus%29_%286076584093%29.jpg/1920px-Mandarinfish_%28Synchiropus_splendidus%29_%286076584093%29.jpg",
      alt: "A mandarinfish resting on coral rubble at Lembeh Strait, Sulawesi, with its pelvic fins folded under the body",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Walking, not swimming",
      caption:
        "Those large fins under the front of the body are the pelvics, and the fish uses them to walk over the substrate rather than swim above it. The actual pectoral fins sit further back and are nearly transparent, which is why they are so often missed.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Mandarinfishes_%28Synchiropus_splendidus%29_%286076583055%29.jpg/1920px-Mandarinfishes_%28Synchiropus_splendidus%29_%286076583055%29.jpg",
      alt: "Two mandarinfish close together on the reef at Lembeh Strait, Sulawesi",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "The half-hour after sunset",
      caption:
        "Mandarinfish gather at fixed spots on the reef in the twenty to thirty minutes after sunset. A pair presses its pelvic fins together, rises about a metre off the bottom for a few seconds, releases eggs and sperm at the top of the ascent, and drops straight back into cover.",
    },
  ],

  headline: "One of two vertebrates with a true blue",
  intro: [
    "Almost every blue in the animal kingdom is a lie of sorts. Blue feathers, blue butterfly wings, blue skin and blue eyes are nearly all structural: microscopic layers scatter and interfere with light so that blue is what comes back, and grind the structure up and the colour disappears. Actual blue pigment in an animal is extraordinarily rare.",
    "The mandarinfish has it. Its blue comes from cyanophores — pigment cells containing a genuinely blue compound — and it shares that distinction with exactly one other known vertebrate, its close relative the psychedelic mandarin. Everything else about the fish is unusual too: it has no scales at all, wearing a thick and reportedly foul-tasting mucus coat in their place, and it walks over the reef on its pelvic fins rather than swimming above it.",
    "It is also one of the most heavily collected fish in the marine aquarium trade, and one of the least suited to it. A mandarinfish eats tiny live crustaceans picked one at a time, all day, and most refuse prepared food entirely.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Syngnathiformes",
    family: "Callionymidae",
    genus: "Synchiropus",
    species: "Synchiropus splendidus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2018,
    populationTrend: "unknown",
    populationEstimate:
      "No global figure; the species is widespread across the western Pacific and abundance tracks the availability of silty inshore reef rather than reef area as a whole",
    note: "Assessed as Least Concern on 12 October 2018 and carried in the 2022 Red List. The listing reflects a wide range and no demonstrated global decline, and it does not capture what happens at collection sites: the species is taken in very large numbers for the aquarium trade, mostly from the Philippines and Indonesia, and local depletion has been reported. Mortality after collection is high because most individuals will not take prepared food. Captive breeding has been achieved but supplies only a small fraction of the trade.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "About 6–7 cm",
      min: 6,
      max: 7,
      unit: "cm",
      note: "FishBase gives a maximum of 7 cm total length. Males are larger and carry a much longer first dorsal spine, which they display during the dusk courtship",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "1–18 m",
      min: 1,
      max: 18,
      unit: "m",
      note: "Sheltered lagoons and inshore reefs, usually over silty bottoms with coral and rubble rather than on exposed reef fronts",
    },
    {
      key: "clutch-size",
      label: "Eggs per spawning",
      value: "Roughly 12–205",
      min: 12,
      max: 205,
      unit: "eggs",
      note: "Each egg is 0.7 to 0.8 mm across, buoyant and colourless. They are released into open water at the top of the spawning ascent and drift away from the reef with no parental care",
    },
    {
      key: "spawning-ascent",
      label: "Spawning ascent",
      value: "About 1 m off the bottom, lasting 7–12 seconds",
      min: 7,
      max: 12,
      unit: "seconds",
      note: "The whole spawning window falls in the twenty to thirty minutes after sunset. A female spawns at most once a night; a male may spawn several times",
    },
  ],

  traits: [
    { key: "colour", label: "Colouration", value: "True blue from cellular pigment (cyanophores) — one of only two vertebrates known to have it", icon: "Palette" },
    { key: "defence", label: "Skin", value: "No scales; a thick, bitter mucus coat instead, produced by specialised skin cells", icon: "Shield" },
    { key: "diet-type", label: "Diet", value: "Carnivore — harpacticoid copepods, amphipods, polychaete worms, small snails, ostracods and fish eggs", icon: "Fish" },
    { key: "locomotion", label: "Locomotion", value: "Walks over the substrate on enlarged pelvic fins rather than swimming above it", icon: "Footprints" },
    { key: "activity", label: "Activity", value: "Feeds through the day; spawns in the half-hour after sunset", icon: "Sun" },
    { key: "reproduction", label: "Reproduction", value: "Pelagic pair-spawner; polygynous males, females spawning once a night at most", icon: "Egg" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "ocean-range", label: "Ocean range", value: "Western Pacific, from the Ryukyu Islands south to Australia", icon: "Globe" },
  ],

  highlights: ["length", "colour", "clutch-size", "defence"],

  distribution: {
    continents: ["Asia", "Australia", "Oceania"],
    regions: [
      "Ryukyu Islands, Japan",
      "The Philippines",
      "Lembeh Strait and Sulawesi, Indonesia",
      "Palau and Micronesia",
      "Great Barrier Reef, Australia",
      "New Caledonia",
    ],
    habitats: ["Sheltered lagoons", "Inshore coral reefs", "Silty rubble bottoms"],
    elevation: "1 to about 18 m depth",
    note: "Found across the western Pacific from the Ryukyu Islands of southern Japan south to northern Australia, with the Philippines and Indonesia at the centre of both the range and the aquarium trade. Individuals hold small home ranges of a few square metres over rubble and silt and rarely move far, which is why collection can strip a specific site without registering anywhere in a national figure.",
  },

  sections: [
    {
      id: "blue",
      title: "Why this blue is different",
      body: [
        "Blue is a problem for animals. Pigments that absorb everything except blue wavelengths are chemically awkward and rare, so almost every blue animal cheats: stacks of thin, flat, reflective purine crystals or ordered nanostructures in feather barbs scatter light so that blue is what reaches the eye. Crush the structure and the colour goes with it, because there was never any blue substance there.",
        "Work on callionymid dragonets in 1995 found something else. The blue areas of a mandarinfish contain chromatophores holding a genuinely blue pigment, and the authors proposed the name cyanophore for the cell type. As far as is known, only two vertebrates have them: Synchiropus splendidus and its close relative the psychedelic mandarin, S. picturatus.",
        "The pattern the pigment produces — a blue ground with swirling orange, and a face striped in blue and green — is almost certainly a warning rather than camouflage. A seven-centimetre fish this conspicuous on an open rubble bottom is advertising something, and what it is advertising is in its skin.",
      ],
    },
    {
      id: "skin",
      title: "No scales, and a coating instead",
      body: [
        "Mandarinfish have no scales anywhere on the body. In their place is a thick layer of mucus produced by specialised cells in the epidermis, and it is not ordinary slime: the fish carries a second cell type producing compounds that make it bitter and unpleasant, and the coating is reported to smell as bad as it apparently tastes.",
        "The arrangement does two jobs. Scales are a barrier against pathogens as well as physical damage, and the mucus takes over that role — mandarinfish are noted for being unusually resistant to the skin parasites that plague other reef fish in captivity. It also makes a small, slow, brightly coloured fish that cannot outswim anything a genuinely poor meal.",
        "Male mandarinfish also carry a much longer first dorsal spine than females and display it during courtship, raising and lowering it in front of a female in the minutes before the light goes.",
      ],
    },
    {
      id: "spawning",
      title: "The half-hour after sunset",
      body: [
        "Mandarinfish spawn in a narrow window, roughly twenty to thirty minutes after sunset, at fixed sites on the reef that are used night after night. Females arrive, males display, and pairs form for a few seconds at a time.",
        "The act itself is brief and specific. A pair comes together with their pelvic fins pressed side by side — the posture divers describe as holding hands — and rises about a metre off the bottom over seven to twelve seconds. At the top of the ascent both release gametes into the water, and both drop immediately back into cover, which is the dangerous part: a small fish suspended in open water at dusk is exposed to everything hunting the reef at that hour.",
        "The mating system is lopsided. A male may spawn several times in a night with different females; a female spawns at most once. Recorded clutches run from about a dozen eggs to a little over two hundred, each less than a millimetre across, buoyant and left to drift. There is no nest and no care of any kind.",
      ],
    },
    {
      id: "feeding",
      title: "Eating one copepod at a time",
      body: [
        "A mandarinfish feeds by picking. It moves slowly over rubble and silt on its pelvic fins, examining the substrate and taking individual prey items — harpacticoid copepods above all, plus amphipods, small polychaete worms, tiny snails, ostracods and fish eggs. It does this continuously through the daylight hours within a home range of a few square metres.",
        "That is a lot of individual decisions for a very small return per item, and it is the single fact that makes the species so difficult to keep. An aquarium has to hold a live, self-sustaining population of copepods large enough to feed a fish that hunts them all day, which means a mature system with substantial live rock and refugium capacity. Most tanks do not, and most collected mandarinfish starve slowly.",
        "Individuals can be weaned onto frozen and prepared food, and captive-bred fish raised on it from the start do much better — but captive breeding supplies only a small share of the trade, and the majority of mandarinfish sold are still wild-caught from the Philippines and Indonesia.",
      ],
    },
    {
      id: "status",
      title: "Least Concern, with a footnote",
      body: [
        "The species is listed as Least Concern, and on the criteria that is defensible: it is spread across the western Pacific from Japan to Australia and no global decline has been demonstrated.",
        "The footnote is that the pressure on this fish is intensely local. Mandarinfish hold home ranges of a few square metres and gather to spawn at specific, predictable sites at a predictable time — which makes a known aggregation trivially easy to fish out. Collectors return to the same spots, and local depletion has been reported. None of that shows up in a range-wide assessment.",
        "There is also a naming confusion worth clearing up. The 'mandarin fish' of Chinese aquaculture and cuisine is Siniperca chuatsi, the Chinese perch — a freshwater predator of an entirely different order, related to this species only in the loosest sense. They share a common name and nothing else.",
      ],
    },
  ],

  related: ["ocellaris-clownfish", "leafy-seadragon", "lined-seahorse", "archerfish"],
  tags: ["mandarinfish", "marine", "bony fish", "coral reef", "aquarium trade", "least concern"],
  searchTerms: ["synchiropus splendidus", "mandarin dragonet", "mandarin goby", "green mandarin", "psychedelic fish"],

  faqs: [
    {
      q: "Why is the mandarinfish's blue unusual?",
      a: "Because it is real pigment. Nearly every blue in the animal kingdom is structural — layers of crystals or ordered nanostructures that scatter light so blue is what comes back — and disappears if the structure is destroyed. The mandarinfish has cells called cyanophores containing an actual blue pigment, and only one other vertebrate is known to share them: its close relative the psychedelic mandarin, Synchiropus picturatus.",
    },
    {
      q: "Do mandarinfish have scales?",
      a: "No. They have none at all. In place of scales they carry a thick coat of mucus produced by specialised skin cells, plus a second cell type that makes the coating bitter and foul-smelling. It works as both a disease barrier and a deterrent, and it is why mandarinfish are unusually resistant to the skin parasites that affect other reef fish.",
    },
    {
      q: "How do mandarinfish mate?",
      a: "In the twenty to thirty minutes after sunset, at fixed sites on the reef. A pair presses their pelvic fins together, rises about a metre off the bottom over seven to twelve seconds, releases eggs and sperm at the top of the ascent and drops straight back into cover. Clutches run from about 12 to 205 buoyant eggs, which drift away with no parental care.",
    },
    {
      q: "Why are mandarinfish hard to keep in an aquarium?",
      a: "Because of how they eat. A mandarinfish picks tiny live crustaceans — mostly harpacticoid copepods — off the substrate one at a time, all day, and most individuals refuse prepared food. Keeping one alive requires a mature tank with a self-sustaining copepod population large enough to feed it indefinitely. Most collected fish starve.",
    },
    {
      q: "Is the mandarinfish the same as the mandarin fish served in Chinese cooking?",
      a: "No. That is Siniperca chuatsi, the Chinese perch — a freshwater predatory fish of a completely different group. It shares the common name and nothing else with Synchiropus splendidus, which is a small marine dragonet from western Pacific reefs.",
    },
  ],

  seo: {
    title: "Mandarinfish — True Blue Pigment, Skin, Spawning & Care",
    description:
      "A researched profile of the mandarinfish (Synchiropus splendidus): the cyanophores behind one of only two true vertebrate blues, its scaleless mucus-coated skin, the dusk spawning ascent and why it is so hard to keep.",
    keywords: [
      "mandarinfish facts",
      "synchiropus splendidus",
      "mandarin dragonet",
      "mandarinfish blue pigment",
      "mandarinfish mating",
    ],
  },

  sources: [
    {
      label: "Synchiropus splendidus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/141481104/141781313",
    },
    {
      label: "Synchiropus splendidus — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Synchiropus-splendidus.html",
    },
    {
      label: "Blue chromatophores in two species of callionymid fish",
      publisher: "Goda & Fujii, Zoological Science (1995)",
      url: "https://bioone.org/journals/zoological-science/volume-12/issue-6/zsj.12.811/Blue-Chromatophores-in-Two-Species-of-Callionymid-Fish/10.2108/zsj.12.811.full",
    },
    {
      label: "A highly contiguous nuclear genome assembly of the mandarinfish Synchiropus splendidus",
      publisher: "G3: Genes, Genomes, Genetics (2021)",
      url: "https://academic.oup.com/g3journal/article/11/12/jkab306/6400253",
    },
  ],

  updatedAt: "2026-07-29",
};

export default mandarinfish;
