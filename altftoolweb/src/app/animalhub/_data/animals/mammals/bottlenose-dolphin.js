// Common bottlenose dolphin — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const bottlenoseDolphin = {
  slug: "bottlenose-dolphin",
  category: "mammals",
  name: "Bottlenose Dolphin",
  scientificName: "Tursiops truncatus",
  otherNames: ["Common bottlenose dolphin", "Atlantic bottlenose dolphin"],

  summary:
    "The dolphin everyone pictures — a sonar-guided hunter that names itself with a signature whistle, sleeps with half its brain at a time, and in one Brazilian town has fished cooperatively with people for over a century.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Tursiops_truncatus_01-cropped.jpg",
    alt: "A bottlenose dolphin breaking the surface in the wake of a boat, head and beak clear of the water",
    credit: "NASA / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Atlantic_bottlenose_dolphin_%28Tursiops_truncatus%29.jpg/1920px-Atlantic_bottlenose_dolphin_%28Tursiops_truncatus%29.jpg",
      alt: "A bottlenose dolphin surfacing in coastal water off the west coast of Florida",
      credit: "Bramans / Wikimedia Commons",
      title: "A coastal resident",
      caption:
        "Many bottlenose dolphins belong to small inshore communities that stay in one bay or estuary for life. These resident groups are genetically distinct from the offshore animals a few kilometres further out, which are larger, dive deeper and range far wider.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Bottlenose_Dolphin_%28Tursiops_truncatus%29_%2816365830393%29.jpg/1920px-Bottlenose_Dolphin_%28Tursiops_truncatus%29_%2816365830393%29.jpg",
      alt: "Bottlenose dolphins leaping alongside a boat in Galapagos waters",
      credit: "Gregory \"Slobirdr\" Smith / Wikimedia Commons",
      title: "Riding the pressure wave",
      caption:
        "Bow-riding is not play alone — a dolphin in the pressure wave ahead of a moving hull is carried along for almost no muscular cost, and the behaviour predates boats, having evolved around the wake of large whales.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bottlenose_dolphin_%28Tursiops_truncatus%29_swimming_alongside_the_ferry_from_Pico_to_Faial%2C_Azores%2C_Portugal_%28PPL1-Corrected%29_julesvernex2.jpg/1920px-Bottlenose_dolphin_%28Tursiops_truncatus%29_swimming_alongside_the_ferry_from_Pico_to_Faial%2C_Azores%2C_Portugal_%28PPL1-Corrected%29_julesvernex2.jpg",
      alt: "A bottlenose dolphin swimming just below the surface beside a ferry in the Azores",
      credit: "Jules Verne Times Two / Wikimedia Commons",
      title: "Sound, not sight, does the work",
      caption:
        "The bulge on the forehead is the melon, a fatty lens that focuses echolocation clicks into a forward beam. Returning echoes are received through fat-filled channels in the lower jaw, not the ears.",
    },
  ],

  headline: "The animal that hunts with sound",
  intro: [
    "The common bottlenose dolphin is the most familiar cetacean on Earth, found in temperate and tropical seas everywhere except the polar oceans. It is a robust, medium-sized dolphin — typically 2.5 to 3.5 metres and 200 to 500 kg — with a short defined beak and a permanently upturned mouth line that reads to people as a smile and means nothing at all.",
    "Its real distinction is sensory. A bottlenose dolphin builds a picture of its surroundings from sound, emitting clicks up to 150 kHz through a fatty lens in its forehead and reading the returning echoes through channels in its lower jaw. That system resolves objects the size of a golf ball at over a hundred metres, works in zero visibility, and can tell a metal target from a plastic one.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Artiodactyla",
    family: "Delphinidae",
    genus: "Tursiops",
    species: "Tursiops truncatus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2019,
    populationTrend: "unknown",
    populationEstimate: "Global total unknown; around 81 separate stocks are recognised in United States waters alone",
    note: "Least Concern globally — the species is abundant, widespread and adaptable. That masks real trouble at the local level, because bottlenose dolphins form small, resident, genetically distinct inshore communities that can be lost individually without the global figure moving. In United States waters, five Atlantic coastal stocks are formally designated as depleted under the Marine Mammal Protection Act. Coastal populations are the most exposed to fisheries bycatch, pollution, boat strikes and habitat loss, and the Black Sea subspecies has its own separate and less comfortable assessment.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Length",
      value: "2.0–3.9 m",
      min: 2.0,
      max: 3.9,
      unit: "m",
      note: "Adults are usually 2.5–3.5 m. The largest recorded, from the eastern North Atlantic, was 4.1 m. Offshore animals run larger than inshore ones",
    },
    {
      key: "weight",
      label: "Weight",
      value: "150–650 kg",
      min: 150,
      max: 650,
      unit: "kg",
      note: "Most adults are 200–500 kg; males are larger than females",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "Bursts around 29 km/h",
      min: 20,
      max: 29,
      unit: "km/h",
      note: "Measured in trained animals; the fastest recorded in the wild is about 20 km/h. Ordinary cruising is a small fraction of that",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "Over 490 m recorded",
      min: 300,
      max: 492,
      unit: "m",
      note: "Recorded in a free-ranging offshore dolphin. A trained animal reached 390 m. Everyday foraging dives are only 3–46 m and last 20–40 seconds",
    },
    {
      key: "dive-duration",
      label: "Maximum dive time",
      value: "Up to about 12 minutes",
      min: 7,
      max: 14,
      unit: "minutes",
      note: "Coastal dolphins have been recorded at 7 minutes 15 seconds and offshore animals at 14 minutes, but typical dives are under a minute",
    },
    {
      key: "echolocation-frequency",
      label: "Sound frequency range",
      value: "0.2–150 kHz",
      min: 0.2,
      max: 150,
      unit: "kHz",
      note: "Roughly 0.2–50 kHz for social communication and 40–150 kHz for echolocation. Human hearing tops out near 20 kHz",
    },
    {
      key: "pod-size",
      label: "Group size",
      value: "2–15 individuals typically",
      min: 2,
      max: 15,
      unit: "individuals",
      note: "Groups form and dissolve constantly. Offshore herds of several hundred are recorded where prey is concentrated",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 12 months",
      min: 360,
      max: 375,
      unit: "days",
      note: "Calving intervals are typically three to six years",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1 calf",
      min: 1,
      max: 1,
      unit: "calf",
      note: "Nursing continues for 18 months to two years, and calves often stay with the mother for three to six",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "5–13 years",
      min: 5,
      max: 13,
      unit: "years",
      note: "Females mature earlier than males, who may not breed successfully for years after becoming capable of it",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "40–60 years",
      min: 40,
      max: 60,
      unit: "years",
      note: "Females typically outlive males. Individuals in long-running photo-identification studies have been followed for over fifty years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — fish, squid, crabs and shrimp", icon: "Fish" },
    { key: "social-structure", label: "Social structure", value: "Fission–fusion society; groups form and break up constantly", icon: "Users" },
    { key: "echolocation", label: "Echolocation", value: "Primary sense — clicks focused by the melon, echoes received through the jaw", icon: "Waves" },
    { key: "sleep", label: "Sleep", value: "Unihemispheric — one brain hemisphere at a time", icon: "Moon" },
    { key: "ocean-range", label: "Ocean range", value: "Temperate and tropical seas worldwide; absent from polar waters", icon: "Globe" },
  ],

  highlights: ["body-length", "echolocation-frequency", "echolocation", "sleep"],

  distribution: {
    continents: ["Africa", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "Gulf of Mexico and the US Atlantic seaboard",
      "Mediterranean and Black Sea",
      "Azores, Canaries and the eastern Atlantic",
      "Southern Brazil and Argentina",
      "Southern Africa",
      "Eastern tropical Pacific and the Galápagos",
    ],
    habitats: [
      "Coastal bays, lagoons and estuaries",
      "Continental shelf waters",
      "Offshore open ocean",
      "Harbours and river mouths",
    ],
    elevation: "Surface waters to a recorded 492 m",
    note: "The species divides almost everywhere into inshore and offshore forms. Inshore animals are smaller, live in small resident communities that may occupy a single bay for generations, and take bottom-dwelling fish and invertebrates. Offshore animals are larger, dive deeper, range across ocean basins and eat squid and open-water fish. The two forms are genetically distinct where they have been compared, and several regional populations have been described as separate subspecies — the Black Sea, Lahille's and eastern tropical Pacific dolphins among them.",
  },

  sections: [
    {
      id: "echolocation",
      title: "Seeing with sound",
      body: [
        "A bottlenose dolphin generates sound not with vocal cords but with phonic lips in the nasal passages below the blowhole — two independent sets, which is why a dolphin can whistle and click simultaneously. The clicks pass forward through the melon, a lens of specialised fat in the forehead that focuses them into a narrow beam.",
        "Echoes return through the lower jaw. The mandible contains fat-filled channels that conduct sound to the middle ear, bypassing the external ear entirely — an adaptation to a medium in which sound travels about four and a half times faster than in air.",
        "The resolution is remarkable. A dolphin can detect a target 5 to 15 cm across from as far as 200 metres away, and can distinguish materials, internal structure and shape. Trained dolphins can tell a water-filled sphere from an oil-filled one, and can identify an object by echo alone that they have previously only touched.",
        "Clicks run from roughly 40 to 150 kHz. Lower frequencies, from 0.2 to about 50 kHz, are used for social communication, including whistles and burst-pulse sounds. The upper limit of human hearing is around 20 kHz, so most of what a dolphin says is inaudible to us.",
      ],
    },
    {
      id: "signature-whistles",
      title: "Signature whistles",
      body: [
        "Within its first few months, every bottlenose dolphin develops a unique whistle — a frequency-modulated contour lasting under a second, in the 7 to 15 kHz range — that it keeps for the rest of its life. Researchers can identify individuals from the shape alone on a spectrogram.",
        "The whistle functions as a name. Dolphins broadcast their own when separated from the group, and playback experiments show they respond to hearing their own signature by whistling back. More striking, they copy the signatures of close associates, apparently to address them specifically — one of very few documented cases of an animal using a learned, arbitrary label for another individual.",
        "The whistles are learned rather than inherited. Calves develop a signature influenced by the sounds around them, and captive dolphins have been shown to imitate novel computer-generated whistles and use them consistently afterwards.",
      ],
    },
    {
      id: "hunting",
      title: "Hunting techniques",
      body: [
        "Bottlenose dolphins eat fish, squid, shrimp and crabs, and their hunting methods vary by region in ways that look a great deal like local tradition. Groups herd schooling fish cooperatively, or drive them against sandbars, seawalls and beaches where they cannot escape.",
        "In Florida Bay, dolphins perform mud-ring feeding: one animal circles a school on a shallow flat, beating its tail to raise a ring of sediment. The fish will not swim through the murk, and panic upward out of it — straight into the mouths of the dolphins waiting at the surface, which position themselves outside the ring facing inward.",
        "In Laguna, southern Brazil, Lahille's bottlenose dolphins — a subspecies of this species — have herded mullet towards net-casting fishermen for well over a century. The dolphins give a cue, usually an abrupt deep dive, and the fishermen cast on it. Research published in the Proceedings of the National Academy of Sciences in 2023 tracked nearly 5,000 casts and found that most of the fishermen's catch came from these synchronised interactions, and that the dolphins caught more when the timing worked. Both sides benefit, and both sides have to learn it.",
        "Tool use with sponges — a dolphin carrying a marine sponge on its beak to probe the seabed — is often attributed to this species, but the Shark Bay dolphins that do it are Indo-Pacific bottlenose dolphins, Tursiops aduncus, which was recognised as a separate species in 1998.",
      ],
    },
    {
      id: "society-sleep",
      title: "Society, sleep and cognition",
      body: [
        "Bottlenose dolphin society is fission–fusion: groups of a few to a few dozen form, mix and dissolve over hours, set within a wider community of animals that know each other. Males in some populations form long-term alliances of two or three that can last for decades, and in Shark Bay these alliances themselves cooperate in larger coalitions.",
        "They cannot sleep in the way land mammals do, because breathing is voluntary. Instead they use unihemispheric slow-wave sleep — one cerebral hemisphere sleeps while the other stays awake, with the corresponding eye open, maintaining awareness and surfacing to breathe. The hemispheres alternate.",
        "Cognitively the species is among the most studied of any non-primate. Bottlenose dolphins pass the mirror self-recognition test, understand pointing and gaze-following without training, can be instructed to invent novel behaviour on command, and grasp simple artificial grammars in which word order changes meaning. They also comprehend television images, which many animals do not.",
      ],
    },
    {
      id: "threats",
      title: "Threats and status",
      body: [
        "Globally the species is assessed as Least Concern, and it deserves the code: it is abundant, distributed across most of the world's warm and temperate seas, and tolerant of disturbance. The problems are local rather than global, and the structure of the species is what makes them serious — inshore communities are small, resident and genetically isolated, so one can be extirpated without registering in any global count.",
        "Bycatch in gillnets, trawls and purse seines is the largest direct cause of death. Coastal populations also accumulate persistent organic pollutants and heavy metals, carry heavy parasite and disease burdens, and suffer boat strikes and chronic noise. Mass mortality events driven by cetacean morbillivirus have killed hundreds of animals along the US Atlantic coast.",
        "Five Atlantic coastal stocks in United States waters are formally designated as depleted under the Marine Mammal Protection Act, and dozens more are classed as strategic. Because the animals are individually identifiable from dorsal fin markings, some of the longest-running mammal studies in the world follow bottlenose communities — several have now tracked known individuals for more than fifty years, which is why population-level change is detectable here at all.",
      ],
    },
  ],

  related: ["orca", "blue-whale", "great-white-shark"],
  tags: ["marine", "cetacean", "carnivore", "social", "least concern", "echolocation"],
  searchTerms: [
    "tursiops truncatus",
    "common bottlenose dolphin",
    "dolphin echolocation",
    "dolphin signature whistle",
    "how smart are dolphins",
  ],

  faqs: [
    {
      q: "How does dolphin echolocation work?",
      a: "The dolphin produces clicks with phonic lips in its nasal passages and focuses them forward through the melon, a fatty lens in the forehead. Returning echoes are picked up by fat-filled channels in the lower jaw and conducted to the middle ear. The system resolves objects 5 to 15 cm across at ranges up to 200 metres, works in complete darkness, and can distinguish what an object is made of.",
    },
    {
      q: "Do dolphins have names?",
      a: "Something very close to it. Each bottlenose dolphin develops a unique signature whistle within its first few months and uses it for life. Dolphins broadcast their own when separated from their group, respond when they hear it played back, and copy the signatures of close associates — apparently to address them individually. It is one of the few documented cases of an animal using a learned label for another individual.",
    },
    {
      q: "How do dolphins sleep if they have to breathe consciously?",
      a: "They shut down one half of the brain at a time. In unihemispheric slow-wave sleep, one hemisphere sleeps while the other stays alert and keeps the animal surfacing to breathe, with the eye on the opposite side open. The hemispheres take turns, so the dolphin is never entirely unconscious.",
    },
    {
      q: "Are bottlenose dolphins endangered?",
      a: "Not as a species — the global assessment is Least Concern, and the animal is abundant across the world's warm and temperate seas. Particular populations are another matter. Bottlenose dolphins form small resident inshore communities that can be lost individually, and five Atlantic coastal stocks in US waters are formally designated as depleted.",
    },
    {
      q: "Do dolphins really help fishermen catch fish?",
      a: "In at least one place, verifiably. In Laguna, southern Brazil, wild bottlenose dolphins have herded mullet towards net-casting fishermen for more than a century, signalling the moment to cast with a distinctive deep dive. A study published in PNAS in 2023 recorded nearly 5,000 casts and found most of the catch came from these synchronised interactions, with the dolphins also catching more when the timing matched.",
    },
  ],

  seo: {
    title: "Bottlenose Dolphin — Echolocation, Intelligence & Behaviour",
    description:
      "A researched profile of the common bottlenose dolphin (Tursiops truncatus): how echolocation works, signature whistles, unihemispheric sleep, cooperative hunting with fishermen, and conservation status.",
    keywords: [
      "bottlenose dolphin facts",
      "tursiops truncatus",
      "dolphin echolocation",
      "dolphin signature whistle",
      "how smart are dolphins",
    ],
  },

  sources: [
    {
      label: "Tursiops truncatus — Red List assessment (Wells, Natoli & Braulik, 2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22563/156932432",
    },
    {
      label: "Common bottlenose dolphin species profile and stock assessments",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/common-bottlenose-dolphin",
    },
    {
      label: "Bottlenose dolphin — adaptations, communication and echolocation",
      publisher: "SeaWorld Animal Guide",
      url: "https://seaworld.org/animals/all-about/bottlenose-dolphin/adaptations/",
    },
    {
      label: "Foraging synchrony drives resilience in human–dolphin mutualism (Cantor et al., PNAS, 2023)",
      publisher: "Proceedings of the National Academy of Sciences",
      url: "https://www.pnas.org/doi/10.1073/pnas.2207739120",
    },
  ],

  updatedAt: "2026-07-29",
};

export default bottlenoseDolphin;
