// Red-bellied piranha — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const redBelliedPiranha = {
  slug: "red-bellied-piranha",
  category: "fish",
  name: "Red-bellied Piranha",
  scientificName: "Pygocentrus nattereri",
  otherNames: ["Red piranha", "Piranha vermelha", "Natterer's piranha"],

  summary:
    "The fish behind the most durable myth in freshwater biology: a shoaling South American omnivore that scavenges far more than it hunts, and that shoals because it is frightened rather than because it is hungry.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Pygocentrus_nattereri_-_Karlsruhe_Zoo_01.jpg/1920px-Pygocentrus_nattereri_-_Karlsruhe_Zoo_01.jpg",
    alt: "A red-bellied piranha in an aquarium at Karlsruhe Zoo, Germany, showing its deep silver flank and orange-red belly",
    credit: "H. Zell / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Pygocentrus_nattereri_-_piranha.jpg/1920px-Pygocentrus_nattereri_-_piranha.jpg",
      alt: "A red-bellied piranha seen side-on, its deep, laterally flattened body and blunt jaw clearly visible",
      credit: "Miroslav.vajdic / Wikimedia Commons",
      title: "A body built for the turn",
      caption:
        "The deep, flattened, disc-like body is not a hunter's shape — it is poor for sustained speed and excellent for pivoting on the spot. That suits a fish that darts in at something already stationary and then gets clear again.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Bassin_de_Pygocentrus_nattereri.jpg",
      alt: "A tank of red-bellied piranhas at the Guadeloupe aquarium, the fish spread out and facing in different directions",
      credit: "Wikimedia Commons",
      title: "A shoal is a defence",
      caption:
        "Piranhas group up for the same reason sardines do: an individual in a shoal is less likely to be the one taken by a caiman, river dolphin or large catfish. Field work has found no evidence that piranha shoals hunt cooperatively.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Pygocentrus_nattereri_%28Piranha_rouge%29_-_434.jpg/1920px-Pygocentrus_nattereri_%28Piranha_rouge%29_-_434.jpg",
      alt: "A red-bellied piranha at the ZooParc de Beauval, its red underside and silver flank lit against dark water",
      credit: "William Crochot / Wikimedia Commons",
      title: "Where the name comes from",
      caption:
        "The red is a breeding and condition signal rather than a warning: it brightens in healthy adults and fades in stressed or poorly fed fish, which is why aquarium animals are often duller than wild ones.",
    },
  ],

  headline: "The most misunderstood fish in fresh water",
  intro: [
    "The red-bellied piranha is a deep-bodied characin of the Amazon, Paraguay-Paraná and Essequibo basins, rarely more than thirty-five centimetres long, with a jaw full of triangular interlocking teeth that it uses mostly on things that are already dead. Stomach-content studies routinely turn up fish scales, fins, insects, worms, seeds, fruit and carrion. In the wet season, when food is everywhere, plants and insects make up much of the diet.",
    "The reputation is younger than the fish. It comes very largely from a spectacle arranged for Theodore Roosevelt in 1913, and from the book he wrote about it. Correcting that is not a matter of making the animal cuddly — a shoal of piranhas will strip a carcass, and a bite from one is a serious wound — but the picture of a coordinated pack hunter dismantling a swimmer is not what the species does or what it is for.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Characiformes",
    family: "Serrasalmidae",
    genus: "Pygocentrus",
    species: "Pygocentrus nattereri",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2020,
    populationTrend: "stable",
    populationEstimate: "No population estimate; the species is abundant and widespread across the major river basins of tropical South America",
    note: "Assessed as Least Concern on 21 December 2020. It is common, tolerates a wide range of conditions, and is fished for food and for the aquarium trade without any sign of population-level effect. The conservation issue attached to this species runs the other way: released aquarium fish have been recorded in warm waters well outside the native range, and several countries restrict or ban keeping them.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Usually up to 35 cm; maximum about 50 cm",
      min: 20,
      max: 50,
      unit: "cm",
      note: "Most adults are well under the maximum; 50 cm is a standard-length record",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to 3.9 kg",
      min: 1,
      max: 3.9,
      unit: "kg",
    },
    {
      key: "pod-size",
      label: "Shoal size",
      value: "Commonly around 20 fish",
      min: 20,
      max: 20,
      unit: "individuals",
      note: "Shoal size shifts with the flood cycle as falling water concentrates fish into shrinking lagoons",
    },
    {
      key: "call-frequency",
      label: "Call frequencies",
      value: "Three distinct sounds, from about 40 Hz to 1,740 Hz",
      min: 40,
      max: 1740,
      unit: "Hz",
      note: "A low harmonic bark in confrontations, a lower drumming during circling and fighting, and a rapid high-frequency pulse during a chase",
    },
    {
      key: "water-temperature",
      label: "Preferred water temperature",
      value: "23–27 °C",
      min: 23,
      max: 27,
      unit: "°C",
      note: "The temperature requirement is the main reason escaped aquarium fish rarely establish in temperate rivers",
    },
    {
      key: "clutch-size",
      label: "Eggs per spawning",
      value: "Several thousand",
      unit: "eggs",
      note: "Laid on submerged vegetation in a cleared patch and guarded by the parents until they hatch",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Commonly cited at around 10 years",
      unit: "years",
      note: "Not well established in the wild; aquarium fish have lived considerably longer",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Omnivore and scavenger — carrion, fish, fins and scales, insects, seeds and fruit", icon: "Fish" },
    { key: "dentition", label: "Teeth", value: "A single row of triangular interlocking teeth, replaced in whole quadrants at a time", icon: "Scissors" },
    { key: "schooling-behaviour", label: "Schooling", value: "Shoals for protection from predators, not to hunt cooperatively", icon: "Users" },
    { key: "vocalisation", label: "Sound", value: "Barks, drums and croaks produced with the swim bladder", icon: "Volume2" },
    { key: "activity", label: "Activity", value: "Diurnal, with feeding peaks at dawn and dusk", icon: "Sun" },
    { key: "reproduction", label: "Reproduction", value: "Egg-laying; both parents defend the nest site", icon: "Egg" },
    { key: "water-type", label: "Water type", value: "Freshwater", icon: "Droplet" },
    { key: "ecological-role", label: "Ecological role", value: "Scavenger and fin-cropper; removes carcasses from floodplain waters", icon: "Leaf" },
  ],

  highlights: ["length", "weight", "pod-size", "lifespan"],

  distribution: {
    continents: ["South America"],
    regions: [
      "The Amazon basin",
      "The Paraguay-Paraná basin and the Pantanal",
      "The Essequibo basin, Guyana",
      "Coastal rivers of northeastern Brazil",
    ],
    habitats: ["Whitewater rivers", "Floodplain lakes and oxbows", "Flooded forest during the wet season", "Shrinking dry-season lagoons"],
    elevation: "Lowland tropical fresh water, 23–27 °C",
    note: "The species follows the flood pulse. In high water it disperses into flooded forest where food is abundant and shoals loosen; as the water falls, fish are concentrated into lagoons and pools where competition is fierce, densities are high, and the aggressive encounters that made the species' reputation actually take place. Almost every dramatic account of piranha behaviour comes from dry-season, low-water, high-density conditions.",
  },

  sections: [
    {
      id: "roosevelt",
      title: "Where the reputation came from",
      body: [
        "In late 1913 Theodore Roosevelt travelled through Brazil, and his hosts laid on a demonstration. A stretch of river had been netted off and stocked with piranhas that were then kept unfed for days. When the party arrived, a cow was driven into the water and the starving, confined fish did what starving, confined fish do. Roosevelt described what he saw in Through the Brazilian Wilderness and called the piranha the most ferocious fish in the world.",
        "The book was enormously popular, and the image it fixed has outlived every correction since — through pulp fiction, a run of horror films and a durable idea that a shoal of piranhas can reduce a large animal to a skeleton in seconds. What Roosevelt actually witnessed was a staged event under conditions that do not occur naturally: an artificially confined, artificially starved, artificially concentrated population presented with a single large food item.",
        "None of that means the fish is harmless. It means the demonstration was designed to produce a particular result, and it did.",
      ],
    },
    {
      id: "diet",
      title: "What they actually eat",
      body: [
        "Stomach-content studies across the range give a consistent and unremarkable answer: red-bellied piranhas are omnivores. They take insects, worms, crustaceans, small fish, fruit and seeds dropped into flooded forest, plant material, and carrion. During the wet season, when the forest floods and food is abundant, plants and insects make up a substantial share of the diet.",
        "Much of the fish they eat is taken without killing anything. Piranhas are among the specialists at lepidophagy and fin-cropping — biting scales and fin tissue off larger fish that then swim away and regrow them. It is a renewable food source and it explains a great many piranha bites in the wild that never involve a death.",
        "The role that fits the animal best is scavenger. In a floodplain system where fish and animals die constantly and water is warm, a shoal that finds and strips a carcass quickly is doing sanitation work, and the speed that impresses observers is a function of numbers rather than of any individual ferocity.",
      ],
    },
    {
      id: "shoaling",
      title: "Shoaling is a defence, not a tactic",
      body: [
        "The intuitive reading of a piranha shoal is a wolf pack. Experimental work says the opposite. Piranhas in larger shoals breathe more calmly and show fewer stress responses than fish held alone or in small groups, and shoals tighten when a predator threat is simulated — the classic signature of a prey animal, not a predator.",
        "There is good reason for the fear. Adult red-bellied piranhas are eaten by caimans, river dolphins, large catfish, herons, otters and other piranhas, and a fish of thirty centimetres in an Amazon floodplain is very much in the middle of the food web. Being one of twenty rather than one of one reduces the odds of being the individual taken.",
        "No study has found evidence that piranha shoals hunt cooperatively — no coordinated herding, no role division, nothing resembling pack behaviour. What looks like coordination at a carcass is simply many fish independently reacting to the same stimulus at once.",
      ],
    },
    {
      id: "teeth-and-sound",
      title: "Teeth, jaws and barking",
      body: [
        "The teeth are the part of the reputation that survives scrutiny. Each jaw carries a single row of flat, triangular, blade-edged teeth that interlock when the mouth closes, so the bite works as a shear rather than a grip — it takes a clean, roughly circular piece out of whatever it closes on. Teeth are replaced in whole quadrants at a time rather than singly, so the cutting edge is never left with gaps.",
        "Bite-force figures quoted for piranhas usually belong to a different species. The measurements that produced the striking numbers were made on the black piranha, Serrasalmus rhombeus, a considerably larger fish; applying them to the red-bellied piranha overstates it substantially.",
        "Piranhas are also noisy. They produce at least three distinct sounds by vibrating muscles against the swim bladder: a low harmonic bark during face-to-face confrontation, a lower drumming while circling and fighting, and a rapid high-frequency snapping during a chase. Anyone who has handled one out of water has heard the first of these.",
      ],
    },
    {
      id: "people",
      title: "People, bites and aquariums",
      body: [
        "Bites on people do happen, concentrated in dry-season conditions where water levels are low, fish are crowded, and someone wades or swims into a shoal defending a nest or a food source. They are almost always a single bite to a foot or a hand — painful, sometimes needing stitches, occasionally taking a piece of a toe. Fatal attacks are vanishingly rare and typically involve someone who had already drowned.",
        "In much of the range piranhas are ordinary food fish, netted, sold in markets and eaten. In the aquarium trade they are popular, which creates the one genuine conservation concern attached to the species: released fish have turned up in warm waters far outside the native range, and while their temperature requirement keeps them from establishing in temperate rivers, several countries restrict or ban keeping them outright.",
        "The species itself is in no trouble. It was assessed as Least Concern in December 2020, is abundant across an enormous range, and tolerates a wide spread of conditions.",
      ],
    },
  ],

  related: ["electric-eel", "atlantic-salmon", "tiger-shark", "great-white-shark"],
  tags: ["piranha", "freshwater", "amazon", "characin", "scavenger", "least concern"],
  searchTerms: ["pygocentrus nattereri", "red piranha", "piranha attack", "piranha teeth", "are piranhas dangerous"],

  faqs: [
    {
      q: "Can piranhas strip a cow to the bone?",
      a: "The famous demonstration of exactly that was staged. In 1913 a stretch of Brazilian river was netted off and stocked with piranhas that were starved for days before a cow was driven in for Theodore Roosevelt to watch. He described it in Through the Brazilian Wilderness and the image stuck. Under natural conditions, with fish that are not confined and not starving, nothing of the kind happens.",
    },
    {
      q: "Do piranhas hunt in packs?",
      a: "No. Piranhas shoal for protection — experiments show they are calmer in larger groups and tighten up when a predator threat is simulated, which is prey behaviour. No study has found coordinated hunting, herding or role division. What looks like teamwork at a carcass is many fish reacting independently to the same food.",
    },
    {
      q: "What do red-bellied piranhas actually eat?",
      a: "Mostly carrion, insects, worms, crustaceans, small fish, fruit and seeds. During the wet season, when the forest floods, plants and insects make up much of the diet. They also crop scales and fins from larger fish that survive and regrow them, which is a renewable food source rather than predation.",
    },
    {
      q: "Are piranhas dangerous to swimmers?",
      a: "Rarely, and not in the way films suggest. Bites are almost always single, to a hand or a foot, and happen in dry-season conditions when fish are crowded into shrinking pools and defending nests or food. They are painful and can need stitches. Fatal attacks are vanishingly rare and usually involve someone who had already drowned.",
    },
    {
      q: "How strong is a piranha's bite?",
      a: "Weaker than the figures usually quoted, because those figures belong to a different fish. The widely cited bite-force measurements were made on the black piranha, Serrasalmus rhombeus, a much larger species. What makes the red-bellied piranha's bite effective is the shape of the teeth — a single row of interlocking triangular blades that shears out a clean piece rather than gripping.",
    },
  ],

  seo: {
    title: "Red-bellied Piranha — Diet, Shoaling, the Roosevelt Myth & Facts",
    description:
      "A researched profile of the red-bellied piranha (Pygocentrus nattereri): what it really eats, why it shoals for protection rather than to hunt, where the 1913 Roosevelt spectacle came from, and its Least Concern status.",
    keywords: [
      "red bellied piranha facts",
      "pygocentrus nattereri",
      "are piranhas dangerous",
      "piranha diet",
      "piranha myth roosevelt",
    ],
  },

  sources: [
    {
      label: "Pygocentrus nattereri — Red List assessment (Least Concern, assessed 2020)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/186604/1815617",
    },
    {
      label: "Pygocentrus nattereri — species summary, Red List date, size and range",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Pygocentrus-nattereri.html",
    },
    {
      label: "Red piranha (Pygocentrus nattereri) — nonindigenous species profile",
      publisher: "US Geological Survey",
      url: "https://nas.er.usgs.gov/queries/factsheet.aspx?SpeciesID=429",
    },
    {
      label: "Pygocentrus nattereri — species account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Pygocentrus_nattereri/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default redBelliedPiranha;
