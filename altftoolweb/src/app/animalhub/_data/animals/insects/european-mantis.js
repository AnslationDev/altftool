// European mantis — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const europeanMantis = {
  slug: "european-mantis",
  category: "insects",
  name: "European Mantis",
  scientificName: "Mantis religiosa",
  otherNames: ["Praying mantis", "European praying mantis"],

  summary:
    "An ambush predator with folding, spined forelegs, binocular depth perception, and a single ear on the midline of its chest that exists to hear hunting bats.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/European_praying_mantis_%28Mantis_religiosa%29_green_female_Dobruja.jpg/1920px-European_praying_mantis_%28Mantis_religiosa%29_green_female_Dobruja.jpg",
    alt: "A green female European mantis on vegetation, forelegs folded beneath the head",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Alien_-_mantis_religiosa_en_su_mirador_01_-_European_Praying_mantis_%28260010283%29.jpg",
      alt: "A European mantis perched on a plant, triangular head turned towards the camera",
      credit: "Ferran Pestaña from Barcelona, España / Wikimedia Commons",
      title: "The head that turns",
      caption:
        "A mantis can rotate its head through roughly 180 degrees on a flexible neck — unusual among insects, and what lets it track prey without moving its body and giving itself away.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/68/Alien_-_mantis_religiosa_en_su_mirador_02_-_European_Praying_mantis_%28260010893%29.jpg",
      alt: "Side view of a European mantis on a stem with the raptorial forelegs held folded",
      credit: "Ferran Pestaña from Barcelona, España / Wikimedia Commons",
      title: "Forelegs held in the strike position",
      caption:
        "The folded posture that gives the insect its common name is a loaded spring. Each foreleg carries two rows of spines that close on prey like a jackknife.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/6/66/Alien_-_mantis_religiosa_en_su_mirador_03_-_European_Praying_mantis_%28260011403%29.jpg",
      alt: "A European mantis among green foliage, its body colour matching the surrounding leaves",
      credit: "Ferran Pestaña from Barcelona, España / Wikimedia Commons",
      title: "Green and brown from the same eggs",
      caption:
        "Individuals are green or straw-brown, and the colour is not fixed by parentage — it is set at a moult in response to humidity and the background the nymph grew up against.",
    },
  ],

  headline: "One ear, two eyes, and a reputation it half deserves",
  intro: [
    "The European mantis is the insect everyone pictures when they hear the word mantis: a slender, upright ambush predator that sits motionless with its spined forelegs folded, then takes a fly out of the air faster than a person can follow. It is native to southern and central Europe, North Africa and much of temperate Asia, and has been established in North America since 1899.",
    "Two things about it are genuinely unusual and often go unmentioned. It has a single ear, on the midline of its underside between the hind legs, tuned almost entirely to the ultrasonic calls of hunting bats. And it appears to be the only insect known to judge distance using stereoscopic vision, the same trick our own two forward-facing eyes perform.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Mantodea",
    family: "Mantidae",
    genus: "Mantis",
    species: "Mantis religiosa",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2016,
    populationTrend: "unknown",
    populationEstimate:
      "No global figure; the species is widespread across Europe, Africa and temperate Asia and locally common in warm grassland",
    note: "This is a genuine global Red List assessment, not a regional one — unusual for an insect. The species is widespread and faces no threat at the global scale, but individual populations are small and localised, and it is listed as threatened on some national red lists, including Germany's. Loss of unmown, sunlit rough grassland is the main pressure where it does decline.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "6–8 cm (female)",
      min: 6,
      max: 8,
      unit: "cm",
      note: "Males are smaller at roughly 5–7 cm and noticeably more slender, with longer antennae",
    },
    {
      key: "eggs-laid",
      label: "Eggs per ootheca",
      value: "About 100–200",
      min: 100,
      max: 200,
      unit: "eggs",
      note: "Laid in a frothed protein case that hardens on a stem or wall; a well-fed female produces several in a season",
    },
    {
      key: "nymphal-moults",
      label: "Nymphal moults",
      value: "Up to eight",
      min: 6,
      max: 8,
      unit: "moults",
      note: "Females usually need one moult more than males; more than eight has never been recorded",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 7–12 months",
      min: 7,
      max: 12,
      unit: "months",
      note: "Males live around 7–8 months and females 11–12 from hatching; adults do not survive the first hard frosts",
    },
    {
      key: "hearing-range",
      label: "Hearing range",
      value: "Peak sensitivity 25–45 kHz",
      min: 25,
      max: 45,
      unit: "kHz",
      note: "Thresholds of 55–60 dB — the band and volume of a bat closing on a target",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Live insects seized with the forelegs", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Diurnal ambush hunter; males fly at night", icon: "Sun" },
    { key: "vision", label: "Vision", value: "Stereoscopic — true binocular depth perception", icon: "Eye" },
    { key: "hearing", label: "Ear", value: "A single ear on the midline of the thorax", icon: "Ear" },
    { key: "defence", label: "Defence", value: "Deimatic display with black eyespots on the fore coxae", icon: "ShieldAlert" },
    { key: "social-structure", label: "Social structure", value: "Solitary outside mating", icon: "User" },
  ],

  highlights: ["body-length", "hearing-range", "vision", "eggs-laid"],

  distribution: {
    continents: ["Europe", "Asia", "Africa", "North America"],
    regions: [
      "Southern and central Europe, spreading north",
      "North Africa",
      "Temperate Asia east to China",
      "Introduced and established across the northeastern and midwestern United States and southern Canada",
    ],
    habitats: [
      "Dry unmown grassland",
      "Scrub and hedgerow",
      "Field margins and roadside verges",
      "Gardens and allotments",
    ],
    elevation: "Sea level to around 2,000 m in southern Europe",
    note: "The northern edge of the European range has been moving steadily further north over recent decades, with the species now breeding well beyond its historical limits in Germany, Poland and the Baltic states.",
  },

  sections: [
    {
      id: "strike",
      title: "The strike",
      body: [
        "A mantis hunts by not moving. It waits on a stem with its raptorial forelegs folded, tracks an approaching insect by turning only its head, and lets the prey come inside range. The strike itself takes a few hundredths of a second — far too fast to correct mid-flight, which means everything depends on the aim being right before the legs move.",
        "That is where the eyes matter. Each foreleg closes like a jackknife, the spined tibia folding back against a spined femur, and the two rows of spines interlock around the prey. Grasshoppers, flies, moths, crickets and other mantises are all normal food; large females occasionally take small lizards and, very rarely, hummingbirds, though those cases are widely over-reported relative to how often they happen.",
        "Mantises are the only insects yet shown to use stereopsis — comparing the two slightly different images from their forward-facing compound eyes to compute distance. The demonstration involved fitting mantises with miniature 3D glasses and showing them offset images of prey; they struck at empty air exactly where the illusion placed a target. Their version works differently from ours: it responds to motion mismatch between the two eyes rather than to matching static detail, which makes it robust in a way human depth perception is not.",
      ],
    },
    {
      id: "ear",
      title: "One ear, listening for bats",
      body: [
        "In 1986 David Yager and Ronald Hoy described something no one had expected: mantises have an ear, and they have exactly one. It sits in a deep groove on the ventral midline of the metathorax, between the third pair of legs, formed by two tympana facing each other across a gap of well under a millimetre. Because both membranes sit at the same point on the body, the animal gets no directional information at all — it is a cyclopean ear, and it hears only whether, not where.",
        "What it is tuned to answers the question of what it is for. Sensitivity peaks between about 25 and 45 kHz, which is the band most insectivorous bats echolocate in, at thresholds around 55–60 dB. Below 10 kHz the ear is nearly deaf. It is a bat detector and effectively nothing else.",
        "The response is equally specific. A mantis in level flight that hears ultrasound flexes its abdomen, stalls, and rolls into a steep power dive. In laboratory work with real bats, mantises that could hear escaped attacks reliably, while deafened controls were almost always caught; free-flying mantises performing the dive got away roughly four times in five. Females of many mantis species, this one included, fly little or not at all — and the ear matters correspondingly less to them.",
      ],
    },
    {
      id: "cannibalism",
      title: "Sexual cannibalism, in proportion",
      body: [
        "Female mantises do sometimes eat their mates, and the European mantis is one of the species where it has been properly measured in the wild rather than assumed. Lawrence's 1992 field study in Portugal recorded cannibalism in around 31% of matings observed in natural conditions — real, common, but a long way from the universal decapitation of popular retelling.",
        "The gap between reputation and reality comes mostly from where the early observations were made. Laboratory rates run higher — one comparison found cannibalism in about 45% of staged encounters — and the classic footage of a female consuming a male's head mid-mating came from confined, often underfed animals being watched under bright lights. Liske and Davis showed in 1987 that well-fed mantises filmed in an empty room, with no observer present, performed an elaborate courtship and were rarely cannibalistic at all. Mantises are intensely visual animals; being watched is not a neutral condition for them.",
        "Where it does happen, hunger is the strongest predictor: a female short of protein is more likely to treat an approaching male as food, and males approach hungry females more cautiously and from behind. The male's contribution is not trivial — a consumed male measurably increases the number of eggs a female produces — but this is best read as a female foraging decision, not a mating ritual.",
      ],
    },
    {
      id: "spread",
      title: "An accidental American",
      body: [
        "In 1899 a resident of a town north of Rochester, New York wrote to an entomologist at Cornell about large unfamiliar insects appearing in his garden. Egg cases and adults were sent in, reared, and identified as Mantis religiosa. The species had arrived on nursery stock shipped from Europe.",
        "It spread slowly for half a century, then established across much of the northeastern and midwestern United States and southern Canada. It is often confused there with the Chinese mantis, Tenodera sinensis, which was introduced separately and grows considerably larger. The European mantis is Connecticut's state insect, a distinction awarded to a species that is not native to the state.",
        "Both introduced mantises are generalist predators that eat beneficial insects as readily as pests, which is why the egg cases sold in garden centres for 'natural pest control' are a poor investment: a mantis has no interest in eating only the insects you dislike. In Europe, meanwhile, the species has been extending its own northern range on its own — a warming-climate expansion rather than a human one.",
      ],
    },
  ],

  related: ["emperor-dragonfly", "desert-locust", "monarch-butterfly"],
  tags: ["mantis", "mantodea", "predator", "europe", "ambush predator", "camouflage"],
  searchTerms: ["mantis religiosa", "praying mantis", "european praying mantis", "praying mantis eats male"],

  faqs: [
    {
      q: "Do female praying mantises always eat the male after mating?",
      a: "No. It happens, but not always and not even usually. A field study of Mantis religiosa in Portugal recorded sexual cannibalism in about 31% of matings observed in natural conditions. Laboratory rates are higher — around 45% in one comparison — and the familiar footage of a female eating the male's head came largely from confined, underfed animals under observation. When mantises are well fed and filmed undisturbed, courtship is elaborate and cannibalism is uncommon.",
    },
    {
      q: "Why does a praying mantis have only one ear?",
      a: "Because the ear is not for locating anything. It sits on the midline of the underside of the thorax, formed by two membranes facing each other across a gap under a millimetre wide, so it gives no directional information whatsoever. Its sensitivity peaks between 25 and 45 kHz — bat echolocation frequencies — and its only job is to tell a flying mantis that a bat is closing in. The insect responds by stalling and dropping into a steep dive.",
    },
    {
      q: "Are praying mantises dangerous to people?",
      a: "No. They have no venom and no sting. A large female can deliver a pinch with her spined forelegs that is startling and may draw a bead of blood, but it is not medically significant. They are handled routinely without incident.",
    },
    {
      q: "Is the European mantis native to North America?",
      a: "No. It arrived around 1899 on nursery stock shipped from Europe and was first identified from specimens collected near Rochester, New York. It has since established across much of the northeastern and midwestern United States and southern Canada, and is Connecticut's state insect despite not being native there.",
    },
    {
      q: "Do praying mantis egg cases work as garden pest control?",
      a: "Not usefully. Mantises are indiscriminate ambush predators: they eat pollinators, other predatory insects and each other as readily as they eat pests, and a hatching ootheca releases a few hundred nymphs that mostly disperse or cannibalise one another. Releasing them does not target the insects you want removed, and introducing non-native mantis species has its own costs.",
    },
  ],

  seo: {
    title: "European Mantis — Hunting, Hearing & Sexual Cannibalism",
    description:
      "A researched profile of the European mantis (Mantis religiosa): its stereoscopic vision and raptorial strike, the single bat-detecting ear on its thorax, and what field data actually show about sexual cannibalism.",
    keywords: [
      "european mantis facts",
      "mantis religiosa",
      "praying mantis cannibalism",
      "praying mantis ear",
      "praying mantis vision",
    ],
  },

  sources: [
    {
      label: "Mantis religiosa — Red List assessment (global, 2016)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/44793247/44798476",
    },
    {
      label: "Yager & Hoy (1986), 'The Cyclopean Ear: A New Sense for the Praying Mantis'",
      publisher: "Science",
      url: "https://www.science.org/doi/10.1126/science.3945806",
    },
    {
      label: "Lawrence (1992), 'Sexual cannibalism in the praying mantid, Mantis religiosa: a field study'",
      publisher: "Animal Behaviour",
      url: "https://doi.org/10.1016/S0003-3472(05)81017-6",
    },
    {
      label: "Timing of praying mantis evasive responses during simulated bat attack sequences",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/208/10/1867/15319/Timing-of-praying-mantis-evasive-responses-during",
    },
  ],

  updatedAt: "2026-07-29",
};

export default europeanMantis;
