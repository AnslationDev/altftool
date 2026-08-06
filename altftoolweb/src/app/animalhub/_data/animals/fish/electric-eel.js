// Electric eel — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const electricEel = {
  slug: "electric-eel",
  category: "fish",
  name: "Electric Eel",
  scientificName: "Electrophorus electricus",
  otherNames: ["Poraquê", "Anguila eléctrica", "Guiana Shield electric eel"],

  summary:
    "A South American knifefish — not an eel at all — that turns four-fifths of its body into a living battery, breathes air, and stuns prey by hijacking their nervous systems from a distance.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Electric-eel.jpg/1920px-Electric-eel.jpg",
    alt: "An electric eel in an aquarium tank, its long cylindrical body and flattened head resting near the bottom",
    credit: "Steven G. Johnson / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Electric_eel_Electrophorus_electricus.jpg",
      alt: "An electric eel seen from the side, showing the long undulating fin that runs the length of its underside",
      credit: "opencage / Wikimedia Commons",
      title: "One fin does all the work",
      caption:
        "There is no dorsal fin and effectively no tail. Propulsion comes from the single long anal fin rippling along the underside, which lets the animal swim forward or backward with equal ease and keeps the rest of the body rigid — useful when most of that body is a battery.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Electrophoridae_Electrophorus_electricus_%285806481021%29.jpg",
      alt: "An electric eel in murky water, its small eyes and blunt head visible above a pale underside",
      credit: "Clinton Charles Robertson from RAF Lakenheath, UK San Marcos, TX, USA UK / Wikimedia Commons",
      title: "Eyes it barely uses",
      caption:
        "Adults see poorly and the water they live in is often opaque. Navigation and prey detection run instead on a continuous low-voltage field the animal generates and reads, a sense that works in total darkness and through mud.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Electrophorus_electricus_01_by_Line1.jpg/1920px-Electrophorus_electricus_01_by_Line1.jpg",
      alt: "An electric eel in a display tank at the Muséum-aquarium de Nancy, France",
      credit: "Liné1 / Wikimedia Commons",
      title: "Which species is in the tank?",
      caption:
        "Every captive electric eel in the world was labelled Electrophorus electricus until 2019, when genetic and morphological work split the genus into three species. Many aquarium animals have never been re-identified, so a tank labelled E. electricus may hold E. varii or E. voltai.",
    },
  ],

  headline: "Not an eel, and no longer one species",
  intro: [
    "The electric eel is a knifefish, a member of the order Gymnotiformes whose closest relatives are catfish, and it is not related to true eels at all. Roughly four-fifths of its two-metre body is given over to three electric organs built from stacked cells that work like batteries wired in series, and it uses them for two entirely different jobs: a faint continuous field for sensing the world, and violent high-voltage pulses for hunting and defence.",
    "In 2019 a survey of 107 specimens from across Greater Amazonia split what had been treated as a single widespread species into three. Electrophorus electricus, the original, turns out to be restricted to the Guiana Shield. The record-breaking 860-volt discharge that gets attributed to it in headlines was measured from a different animal — Electrophorus voltai, one of the two species described in that paper.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Gymnotiformes",
    family: "Gymnotidae",
    genus: "Electrophorus",
    species: "Electrophorus electricus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2020,
    populationTrend: "unknown",
    populationEstimate: "No population estimate; the species is widespread within the Guiana Shield and not known to be declining",
    note: "Assessed as Least Concern on 12 August 2020. The 2019 three-way split matters here: much of what older literature recorded as Electrophorus electricus across the Amazon lowlands and the Brazilian Shield is now referred to E. varii and E. voltai, so historical range and abundance records for this species must be read with care.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Up to about 2.5 m",
      min: 1,
      max: 2.5,
      unit: "m",
      note: "FishBase gives a maximum of 250 cm; two metres is already a very large adult",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 20 kg",
      min: 10,
      max: 20,
      unit: "kg",
    },
    {
      key: "electric-discharge",
      label: "Peak electric discharge",
      value: "480 V measured in Electrophorus electricus",
      min: 480,
      max: 480,
      unit: "V",
      note: "From a 76 cm specimen in the 2019 study that split the genus. The famous 860 V record belongs to E. voltai; E. varii has been measured at 572 V",
    },
    {
      key: "electric-organ-share",
      label: "Body given over to electric organs",
      value: "About four-fifths",
      min: 80,
      max: 80,
      unit: "%",
      note: "The main organ, Hunter's organ and Sachs' organ, all paired and running most of the body length",
    },
    {
      key: "electrocytes",
      label: "Electrocytes",
      value: "Several thousand stacked cells",
      min: 5000,
      max: 6000,
      unit: "cells",
      note: "Each contributes only a fraction of a volt; the total comes from wiring them in series, exactly as in a battery stack",
    },
    {
      key: "surfacing-interval",
      label: "Surfacing interval",
      value: "Roughly every 1–10 minutes",
      min: 1,
      max: 10,
      unit: "minutes",
      note: "An obligate air breather — most of its oxygen is taken from air gulped at the surface and absorbed through the mouth lining",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Over 20 years in captivity",
      min: 15,
      max: 22,
      unit: "years",
      note: "Wild lifespan is not well established",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — fish, crustaceans and small vertebrates", icon: "Fish" },
    { key: "water-type", label: "Water type", value: "Freshwater", icon: "Droplet" },
    { key: "electric-sense", label: "Electric sense", value: "Continuous low-voltage pulses used to navigate and locate prey", icon: "Zap" },
    { key: "respiration", label: "Respiration", value: "Obligate air breather; drowns if kept from the surface", icon: "Wind" },
    { key: "reproduction", label: "Reproduction", value: "The male builds a nest of saliva foam and guards the young", icon: "Egg" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal", icon: "Moon" },
    { key: "schooling-behaviour", label: "Schooling", value: "Largely solitary; coordinated group hunting has been recorded in E. voltai", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Top predator of shallow, oxygen-poor blackwater and swamp habitats", icon: "Leaf" },
  ],

  highlights: ["electric-discharge", "length", "electric-organ-share", "lifespan"],

  distribution: {
    continents: ["South America"],
    regions: [
      "Suriname",
      "Guyana and the Essequibo basin",
      "French Guiana",
      "Coastal rivers of the Guiana Shield",
    ],
    habitats: ["Blackwater creeks", "Floodplain swamps", "Slow, muddy coastal-plain rivers"],
    elevation: "Lowland fresh water; shallow enough that the fish can reach the surface to breathe",
    note: "Since the 2019 revision, Electrophorus electricus is understood to be confined to the Guiana Shield. E. varii occupies the murky, mineral-rich lowland floodplains of the central Amazon, and E. voltai the clearer, less conductive highland rivers draining the Brazilian Shield. The lower conductivity of highland water is one proposed reason why E. voltai evolved a higher voltage: it takes more push to drive the same current.",
  },

  sections: [
    {
      id: "not-an-eel",
      title: "Not an eel",
      body: [
        "True eels belong to the order Anguilliformes. The electric eel belongs to Gymnotiformes, the South American knifefishes, and its nearest relatives outside that group are the catfishes. The resemblance is convergence: a long body with a single undulating fin is simply a good design for reversing through submerged roots and vegetation, and several unrelated lineages have arrived at it.",
        "Look at the body and the differences show. There is no dorsal fin and no proper tail fin. The anal fin runs almost the entire underside and does all the swimming. The vital organs are crammed into the front fifth of the animal, behind a head that is mostly mouth, because everything behind that is electrical machinery.",
      ],
    },
    {
      id: "three-species",
      title: "One species became three",
      body: [
        "For two and a half centuries Electrophorus electricus was assumed to be a single species ranging across the whole of Greater Amazonia. In 2019 a team led by C. David de Santana examined 107 specimens using genetics, morphology and habitat data and concluded that there are three, which diverged long before humans existed: E. varii split from the others around 7.1 million years ago in the late Miocene, and E. electricus and E. voltai from each other around 3.6 million years ago, about the time the Amazon reversed its course across the continent.",
        "This matters for the numbers everyone quotes. The team recorded a discharge of 860 volts from an E. voltai — the highest voltage ever measured from a living animal, and the reason the species is named after Volta. From a confirmed E. electricus they measured 480 volts, and from E. varii up to 572. The older textbook figure of around 600 volts for 'the electric eel' was measured before anyone knew which animal was being tested.",
        "The practical consequence is that a great deal of published electric eel research cannot now be assigned confidently to a species, including many of the classic physiology experiments and most captive animals in aquariums.",
      ],
    },
    {
      id: "how-the-shock-works",
      title: "How a fish makes 500 volts",
      body: [
        "The electric organs are built from flattened, disc-shaped cells called electrocytes, stacked face to face in long columns. Each one is a modified muscle cell that has given up contracting: on command it pumps ions across its membrane and produces about a tenth of a volt. Alone that is nothing. Wired in series by the thousand, along a column running most of a two-metre body, it becomes hundreds of volts.",
        "There are three paired organs doing two jobs. The main organ and the front part of Hunter's organ fire the high-voltage pulses used to hunt and to defend. Sachs' organ and the rear of Hunter's organ produce a weak, continuous, ten-volt signal instead — a field the animal projects around itself and monitors for distortions, the way a bat reads returning echoes. That is how a nearly blind fish navigates opaque water and finds a motionless fish buried in leaf litter.",
        "How the eel avoids electrocuting itself is not fully answered. Insulating fatty tissue, the fact that the vital organs sit at the head end away from the strongest part of the field, and the small voltage drop across any one part of a long conductive body all contribute. Eels do stun themselves occasionally, and are visibly affected when they do.",
      ],
    },
    {
      id: "hunting",
      title: "Remote control",
      body: [
        "Work by the neurobiologist Kenneth Catania showed that the high-voltage discharge is not simply a shock. Fired as a rapid pair of pulses, it activates the motor neurons of a hidden fish directly, forcing an involuntary muscle twitch that gives the prey's position away. The eel then fires a full volley that causes complete tetanus — every muscle contracting at once — and takes the paralysed fish whole.",
        "For large prey the eel curls its body so that head and tail meet around the animal, bringing the two poles of its battery together and more than doubling the field strength across whatever is caught between them.",
        "The defensive behaviour is stranger still. Alexander von Humboldt reported in 1800 that Amazonian fishermen drove horses into a pool to exhaust the eels before collecting them, and that the eels attacked the horses directly; the story was dismissed for two centuries as exaggeration. Catania showed it was accurate. A cornered eel will leave the water and press its chin against a large partly submerged object, discharging directly into it — an arrangement that routes far more current through the target than a shock spread through open water would.",
      ],
    },
    {
      id: "breathing-and-life",
      title: "Breathing air, guarding foam",
      body: [
        "The waters the electric eel lives in hold very little oxygen, and it has stopped trying to extract oxygen from them. Its gills are reduced, and the roof of its mouth is a folded, richly blood-supplied pad that works as a lung. It surfaces every few minutes to gulp air and takes most of its oxygen that way. Held under water, an electric eel drowns.",
        "Breeding follows the dry season. The male whips up a nest of saliva foam among vegetation, the female lays into it, and the male guards the eggs and then the young — which begin producing their own weak electric fields within weeks of hatching.",
        "The species is assessed as Least Concern, and there is no large fishery for it. The realistic risks are habitat change and the general degradation of Amazonian and Guianan wetlands, plus collection for the aquarium trade. Shocks to people are painful and can incapacitate a swimmer, but well-documented deaths from a discharge alone are extremely rare; the danger is drowning after being stunned rather than the current itself.",
      ],
    },
  ],

  related: ["red-bellied-piranha", "coelacanth", "lined-seahorse", "atlantic-salmon"],
  tags: ["knifefish", "freshwater", "amazon", "bioelectricity", "electroreception", "least concern"],
  searchTerms: ["electrophorus", "poraque", "electric fish", "eel volts", "electrophorus voltai"],

  faqs: [
    {
      q: "Is an electric eel really an eel?",
      a: "No. It is a knifefish, in the order Gymnotiformes, whose closest relatives are catfish. True eels are Anguilliformes and are not closely related at all. The long body and single undulating fin are convergent design, not shared ancestry.",
    },
    {
      q: "How many volts can an electric eel produce?",
      a: "It depends which species you mean. The 2019 study that split the genus measured 480 volts from a confirmed Electrophorus electricus and up to 572 from E. varii. The record of 860 volts — the highest ever recorded from a living animal — came from E. voltai, one of the two species described in that paper.",
    },
    {
      q: "Why are there three species of electric eel now?",
      a: "Because a 2019 survey of 107 specimens across Greater Amazonia found consistent genetic, anatomical and ecological differences within what had been treated as one widespread species. E. varii diverged around 7.1 million years ago and E. electricus and E. voltai from each other around 3.6 million years ago. E. electricus is now understood to be restricted to the Guiana Shield.",
    },
    {
      q: "Can an electric eel kill a person?",
      a: "A discharge is severely painful and can incapacitate a swimmer, but deaths attributable to the shock alone are extremely rare and poorly documented. The realistic danger is drowning after being stunned, or a heart problem in someone already vulnerable, rather than electrocution as such.",
    },
    {
      q: "Why does an electric eel have to breathe air?",
      a: "It lives in warm, stagnant, oxygen-poor water where gills are of little use. Its gills are reduced and the roof of its mouth works as a lung, so it surfaces every few minutes to gulp air and takes most of its oxygen that way. Prevented from reaching the surface, it drowns.",
    },
  ],

  seo: {
    title: "Electric Eel — Voltage, Three Species, Hunting & Biology",
    description:
      "A researched profile of the electric eel (Electrophorus electricus): why it is a knifefish and not an eel, the 2019 split into three species, 480 V versus the 860 V record of E. voltai, electrocytes, and air breathing.",
    keywords: [
      "electric eel facts",
      "electrophorus electricus",
      "how many volts electric eel",
      "electrophorus voltai",
      "electric eel not an eel",
    ],
  },

  sources: [
    {
      label: "Electrophorus electricus — Red List assessment (Least Concern)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/167700/6369863",
    },
    {
      label: "Unexpected species diversity in electric eels with a description of the strongest living bioelectricity generator (de Santana et al., 2019)",
      publisher: "Nature Communications",
      url: "https://www.nature.com/articles/s41467-019-11690-z",
    },
    {
      label: "Electrophorus electricus — species summary and Red List assessment date",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Electrophorus-electricus.html",
    },
    {
      label: "Smithsonian scientists triple the number of known electric eel species",
      publisher: "Smithsonian Institution",
      url: "https://www.si.edu/newsdesk/releases/smithsonian-scientists-triple-number-known-electric-eel-species",
    },
    {
      label: "Scientists shocked to discover two new species of electric eel",
      publisher: "Cornell Chronicle",
      url: "https://news.cornell.edu/stories/2019/09/scientists-shocked-discover-two-new-species-electric-eel",
    },
  ],

  updatedAt: "2026-07-29",
};

export default electricEel;
