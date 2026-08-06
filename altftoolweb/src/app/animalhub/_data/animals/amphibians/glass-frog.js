// Fleischmann's glass frog — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const glassFrog = {
  slug: "glass-frog",
  category: "amphibians",
  name: "Fleischmann's Glass Frog",
  scientificName: "Hyalinobatrachium fleischmanni",
  otherNames: ["Northern glass frog", "Glass frog"],

  summary:
    "A thumbnail-sized Central American frog with a belly so translucent you can watch its heart beat — and which, when it sleeps, packs roughly 89% of its red blood cells into its liver so that even its blood stops giving it away.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/62/Hyalinobatrachium_fleischmanni01a.jpg",
    alt: "A Fleischmann's glass frog on a leaf, pale green with yellow spotting and large golden forward-facing eyes",
    credit: "Mauricio Rivera Correa / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Hyalinobatrachium_fleischmanni_246060816.jpg",
      alt: "A Fleischmann's glass frog resting on a green leaf",
      credit: "Carlos Funes / Wikimedia Commons",
      title: "Green on green, deliberately",
      caption:
        "The back is not transparent — it is pigmented green and finely spotted, matching the leaf underneath. Transparency is a property of the underside, which is the surface a predator looking up from below would see.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Hyalinobatrachium_fleischmanni_418870647.jpg",
      alt: "A Fleischmann's glass frog photographed in Nicaragua on foliage at night",
      credit: "Borja Fierro / Wikimedia Commons",
      title: "A frog you hear before you see",
      caption:
        "Males call from the undersides of leaves over running water, a short high peep repeated a few times a minute. A male may hold the same leaf for ten nights or more, which is how a female knows where to find him.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/81/Hyalinobatrachium_fleischmanni_455215263.jpg",
      alt: "A Fleischmann's glass frog on vegetation in Costa Rica",
      credit: "Tom and T Herman / Wikimedia Commons",
      title: "Small enough to sit on a fingernail",
      caption:
        "Adults are 19 to 32 mm from snout to vent. At that size the whole animal is only a few cell layers thick in places, which is part of why light passes through it so readily.",
    },
  ],

  headline: "It hides its own blood to disappear",

  intro: [
    "Glass frogs are a whole family, the Centrolenidae, and around 160 species carry the name. Hyalinobatrachium fleischmanni is the one most people have actually seen a photograph of: a 2 to 3 cm frog of Central American stream forests, pale green above with fine yellow spotting, golden forward-facing eyes, and a ventral surface transparent enough that the heart, gut and bones show through it.",
    "The transparency has been known since the nineteenth century. What was not known until 2022 is that the frog is far better at it than a fixed anatomical description suggests. Sleeping glass frogs remove close to 90 percent of their red blood cells from circulation and pack them into the liver, which is lined with reflective guanine crystals. Blood is the most light-absorbing thing in a small animal's body; take it out of the tissues and the frog becomes two to three times more transparent than it is when awake.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Anura",
    family: "Centrolenidae",
    genus: "Hyalinobatrachium",
    species: "Hyalinobatrachium fleischmanni",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2020,
    populationTrend: "stable",
    populationEstimate: "Widely distributed and locally common; no global count",
    note: "Least Concern with a stable population, on the strength of a wide range from southern Mexico to Ecuador and a reasonable tolerance of modified habitat. The threats listed are deforestation for agriculture and illegal crops, logging, settlement, agricultural spray drift and chytridiomycosis in montane areas. The species is tied absolutely to running water — the tadpoles live in the stream bed — so its tolerance of disturbance ends where the stream is silted or diverted.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length",
      value: "Males 1.9–2.8 cm, females 2.3–3.2 cm",
      min: 1.9,
      max: 3.2,
      unit: "cm",
      note: "Snout to vent. Females are slightly larger and lack the male's humeral spine.",
    },
    {
      key: "blood-concealment",
      label: "Red blood cells hidden in the liver while asleep",
      value: "About 89%",
      min: 89,
      max: 89,
      unit: "%",
      note: "Measured by photoacoustic imaging in unrestrained sleeping frogs, since anaesthesia, stress and death all destroy the effect.",
    },
    {
      key: "transparency-gain",
      label: "Transparency gain while resting",
      value: "Two- to threefold",
      min: 2,
      max: 3,
      unit: "×",
      note: "Relative to the same frog when active, with its blood back in circulation.",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "18–30 eggs",
      min: 18,
      max: 30,
      unit: "eggs",
      note: "Laid in a single gelatinous sheet on the underside of a leaf overhanging running water.",
    },
    {
      key: "hatching-age",
      label: "Time to hatching",
      value: "10–15 days",
      min: 10,
      max: 15,
      unit: "days",
      note: "Hatchlings drop straight from the leaf into the stream below.",
    },
    {
      key: "larval-period",
      label: "Larval period",
      value: "1–2 years",
      min: 1,
      max: 2,
      unit: "years",
      note: "Tadpoles live buried in stream-bed debris, and are red and eel-like rather than the usual pond shape.",
    },
    {
      key: "call-frequency",
      label: "Call frequency",
      value: "4,300–5,300 Hz",
      min: 4300,
      max: 5300,
      unit: "Hz",
      note: "Short peeps about a tenth of a second long, given four to ten times a minute.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — crickets, moths, flies, spiders and occasionally smaller frogs",
      icon: "Drumstick",
    },
    {
      key: "activity",
      label: "Activity",
      value: "Nocturnal; sleeps on the underside of a leaf through the day",
      icon: "Moon",
    },
    {
      key: "camouflage",
      label: "Concealment",
      value: "Transparency rather than toxins — it vanishes against a backlit leaf",
      icon: "EyeOff",
    },
    {
      key: "parental-care",
      label: "Parental care",
      value: "Males guard the clutch for weeks and urinate on it to keep it from drying out",
      icon: "Baby",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — fast, clear forest streams, required for the tadpoles",
      icon: "Droplet",
    },
  ],

  highlights: ["blood-concealment", "transparency-gain", "parental-care", "length"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Southern Mexico — Veracruz, Oaxaca, Chiapas, Guerrero, Puebla and Tabasco",
      "Belize, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica and Panama",
      "Colombia and Ecuador",
    ],
    habitats: [
      "Lowland and mid-elevation wet forest",
      "Riparian vegetation overhanging fast streams",
      "Secondary growth and forest edge along watercourses",
    ],
    elevation: "Sea level to above 1,600 m",
    note: "The species has long been confused with close relatives, so its published range varies between sources and some older records probably belong to other members of the genus. What is consistent is the requirement for permanent running water with leaves hanging over it: no stream, no breeding.",
  },

  sections: [
    {
      id: "transparent",
      title: "What is actually see-through",
      body: [
        "Glass frogs are not transparent all over. Seen from above, Hyalinobatrachium fleischmanni is opaque green with fine yellow spotting — ordinary leaf camouflage. It is the ventral surface that is clear, and that is the surface that matters, because the predators that hunt these frogs are mostly looking up from beneath a leaf.",
        "Underneath, the skin lacks pigment and much of the light-scattering structure other frogs have, so the heart, the digestive tract and the bones are visible from outside. A sheet of guanine — a reflective crystalline material also used in fish scales — is drawn over some of the internal organs and hides them, but it covers only part of the underside, which is why the liver in particular is left on show.",
        "The point is not invisibility in the abstract. A small frog asleep on a green leaf, seen from below against bright forest light, produces a soft edge instead of a hard silhouette. Experimental work with glass frogs has shown that the effect is a form of edge diffusion: the frog does not disappear, but its outline stops looking like an animal.",
      ],
    },
    {
      id: "hidden-blood",
      title: "The blood in the liver",
      body: [
        "The obstacle to real transparency in a vertebrate is haemoglobin. Red blood cells absorb light strongly, and a body full of circulating blood cannot be seen through however clear the skin is. This is why so few transparent animals have blood worth mentioning.",
        "Work published in Science in December 2022 by Carlos Taboada, Jesse Delia and colleagues showed how Hyalinobatrachium fleischmanni gets around it. As the frog settles to sleep, roughly 89 percent of its red blood cells leave circulation and are packed into the liver, which is enclosed by a layer of reflective guanine crystals. The rest of the animal is left running on plasma. Measured against the same frog when active, sleeping transparency increased two- to threefold.",
        "Getting the measurement was itself a problem, because glass frog transparency collapses under exactly the conditions a laboratory usually imposes: activity, stress, anaesthesia and death all break it. The team used photoacoustic imaging, which pulses light into the tissue and listens for the sound red blood cells emit as they absorb it, so a sleeping frog could be mapped without restraint, contrast agents, surgery or being killed.",
        "The physiology is as interesting as the optics. Concentrating that much blood in one organ ought to cause clotting or tissue damage, and the frog does it twice a day for its whole life without apparent harm. What stops the packed cells clotting is not yet understood, and it is precisely the question that makes this relevant to human medicine.",
      ],
    },
    {
      id: "leaf-nursery",
      title: "Fathers on leaves",
      body: [
        "Males call at night from the undersides of leaves hanging over running water, a short peep between 4,300 and 5,300 Hz repeated four to ten times a minute. A male holds a calling site for around ten nights, sometimes fifteen or twenty, and defends it. He carries a hooked spine on the humerus that the female lacks, and males will wrestle with intruders — grappling, sometimes hanging from a leaf by one foot.",
        "A female that accepts a male lays a clutch of eighteen to thirty eggs as a gelatinous sheet on the leaf underside, and then leaves. The male stays. He guards the clutch against predatory wasps and other egg thieves, and he keeps it hydrated by urinating on it, which is the whole reason an exposed clutch on the underside of a leaf in a warm forest does not simply desiccate.",
        "Eggs hatch after ten to fifteen days and the tadpoles fall into the stream below. They do not behave like pond tadpoles at all: they burrow into the leaf litter and sediment of the stream bed, where they are elongated, muscular and bright red — a colour that makes sense in gill-rich, low-oxygen sediment rather than in open water. Metamorphosis takes one to two years, an extraordinarily long larval period for a frog this small.",
      ],
    },
    {
      id: "which-glass-frog",
      title: "Which glass frog is this?",
      body: [
        "'Glass frog' is a family name, not a species name. The Centrolenidae contain around 160 species across the American tropics, and they vary considerably: some have transparent bellies with visible hearts, some have the heart covered by white pericardium, and some are barely translucent at all. Thirteen species alone occur in Costa Rica.",
        "Hyalinobatrachium fleischmanni is the reference species for most of what the public knows about the group, and it was the species used in the 2022 blood-concealment study. It is also the one most often confused with its relatives in the field, which is why its published distribution shifts between sources. The specific name honours Carl Fleischmann, who collected in Costa Rica in the 1890s.",
        "The genus name is worth reading literally: Hyalinobatrachium means 'glass frog', from the Greek for transparent. Within it, the fleischmanni group is distinguished by the absence of a pigmented pericardium — which is precisely why you can watch this animal's heart beat through its skin.",
      ],
    },
  ],

  related: ["red-eyed-tree-frog", "golden-poison-frog", "tomato-frog"],
  tags: ["frog", "central america", "transparency", "parental care", "rainforest", "least concern"],
  searchTerms: [
    "hyalinobatrachium fleischmanni",
    "glass frog",
    "see through frog",
    "transparent frog",
    "fleischmann's glass frog",
    "frog you can see the heart",
  ],

  faqs: [
    {
      q: "How does a glass frog become transparent?",
      a: "Partly by anatomy and partly by physiology. The skin of the underside lacks pigment and much of the light-scattering structure other frogs have, so organs show through. On top of that, a sleeping frog moves about 89 percent of its red blood cells out of circulation and into its liver, which is lined with reflective guanine crystals. Because blood is the strongest light absorber in the body, that alone makes the frog two to three times more transparent.",
    },
    {
      q: "Is the whole glass frog transparent?",
      a: "No. The back is opaque green with fine yellow spots, which camouflages the frog against the leaf it is sitting on. Only the ventral surface is translucent, and that is the side facing any predator hunting from below.",
    },
    {
      q: "Why does hiding blood in the liver not kill the frog?",
      a: "Nobody knows yet, and that is why the finding matters beyond frogs. Packing that proportion of red blood cells into a single organ twice a day would be expected to cause clotting or tissue damage in most vertebrates. Whatever prevents it is an open question with obvious relevance to human clotting disorders.",
    },
    {
      q: "Do male glass frogs look after the eggs?",
      a: "Yes. The female lays eighteen to thirty eggs on the underside of a leaf above a stream and leaves; the male stays with the clutch, defends it against predatory wasps, and urinates on it to stop it drying out. Tadpoles drop into the stream when they hatch after ten to fifteen days.",
    },
    {
      q: "Is 'glass frog' one species?",
      a: "No — it is a whole family, the Centrolenidae, with about 160 species. Hyalinobatrachium fleischmanni is the species most photographs and most popular accounts are actually about, and the one used in the 2022 study of blood concealment. Others in the family are far less transparent.",
    },
  ],

  seo: {
    title: "Glass Frog — Transparency, Hidden Blood & Male Egg Care",
    description:
      "A researched profile of Fleischmann's glass frog (Hyalinobatrachium fleischmanni): how it hides 89% of its red blood cells in its liver to become transparent, and how males guard clutches on leaves above streams.",
    keywords: [
      "glass frog",
      "hyalinobatrachium fleischmanni",
      "transparent frog",
      "glass frog blood liver",
      "see through frog",
    ],
  },

  sources: [
    {
      label: "Hyalinobatrachium fleischmanni — Red List assessment (2020, e.T55014A3021859)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/55014/3021859",
    },
    {
      label: "Glassfrogs conceal blood in their liver to maintain transparency (Taboada, Delia et al., 2022)",
      publisher: "Science",
      url: "https://www.science.org/doi/10.1126/science.abl6620",
    },
    {
      label: "Glassfrogs hide red blood cells in their liver to become transparent",
      publisher: "Duke University, Pratt School of Engineering",
      url: "https://pratt.duke.edu/news/glassfrogs-hide-red-blood-cells-their-liver-become-transparent/",
    },
  ],

  updatedAt: "2026-07-29",
  featured: false,
};

export default glassFrog;
