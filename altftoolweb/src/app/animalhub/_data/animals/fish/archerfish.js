// Banded archerfish — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const archerfish = {
  slug: "archerfish",
  category: "fish",
  name: "Archerfish",
  scientificName: "Toxotes jaculatrix",
  otherNames: ["Banded archerfish", "Spinner fish"],

  summary:
    "A mangrove fish that shoots insects out of the air with a jet of water, correcting for the bend of light at the surface and setting off towards the landing point before the prey has fallen.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Toxotes_jaculatrix.jpg/1920px-Toxotes_jaculatrix.jpg",
    alt: "A banded archerfish in side view, silver-white with dark wedge-shaped bars down its flank",
    credit: "Chrumps / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Toxotes_jaculatrix_%28banded_archerfish%29_1_%2815534079567%29.jpg/1920px-Toxotes_jaculatrix_%28banded_archerfish%29_1_%2815534079567%29.jpg",
      alt: "A banded archerfish photographed in an aquarium tank, showing the flat-topped back and upward-facing mouth",
      credit: "James St. John / Wikimedia Commons",
      title: "Built to look upward",
      caption:
        "The back is almost straight and the mouth points up. That profile lets the fish sit right beneath the surface with its eyes just under the water and its jaw already aimed at the world above — the posture the whole hunting technique depends on.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Toxotes_jaculatrix_%28banded_archerfish%29_2_%2815534430240%29.jpg/1920px-Toxotes_jaculatrix_%28banded_archerfish%29_2_%2815534430240%29.jpg",
      alt: "A banded archerfish in an aquarium, its four to six dark bars visible against a silver flank",
      credit: "James St. John / Wikimedia Commons",
      title: "Bars that break up a silhouette",
      caption:
        "The wedge-shaped bars are the species' field mark and the reason for the name 'banded'. Against the dappled light and root shadow of a mangrove channel they break up the outline of a fish that has to hold still, near the surface, in full view of anything looking down.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Toxotes_jaculatrix_%28banded_archerfish%29_4_%2815533393159%29.jpg/1920px-Toxotes_jaculatrix_%28banded_archerfish%29_4_%2815533393159%29.jpg",
      alt: "Several banded archerfish together in an aquarium tank",
      credit: "James St. John / Wikimedia Commons",
      title: "Why speed matters more than aim",
      caption:
        "Archerfish hunt in company, and a knocked-down insect belongs to whoever reaches it first. That competition — not the shot itself — is what selected for the predictive start, in which a fish that did not fire can still arrive at the landing point ahead of the one that did.",
    },
  ],

  headline: "The fish that shoots, and the fish that predicts",
  intro: [
    "Archerfish hunt by spitting. A fish hangs just under the surface of a mangrove creek, lines up an insect sitting on a leaf overhead, presses its tongue against a groove in the roof of its mouth to form a barrel, and fires a jet of water accurately enough to knock the prey into the water from up to two metres away.",
    "That much has been known for centuries. What laboratory work over the past few decades has added is that almost none of it is as simple as it looks. The fish has to correct for the way light bends at the water surface, which displaces the apparent position of anything it aims at. It shapes the jet in flight so that the water arrives as a single slug rather than a spray. And within a few hundredths of a second of the insect starting to fall, it has worked out where the prey will land and is already moving there.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Perciformes",
    family: "Toxotidae",
    genus: "Toxotes",
    species: "Toxotes jaculatrix",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2011,
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate; the species is widespread through Indo-Pacific estuaries and no decline has been demonstrated",
    note: "Assessed as Least Concern on 16 September 2011 and published in the 2012 Red List. The species is collected for the aquarium trade, but the pressure that would matter most is habitat: archerfish are mangrove and estuary specialists, and mangrove forest has been cleared extensively across Southeast Asia for aquaculture and development. No global assessment of what that has cost the species exists.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Commonly about 20 cm; up to 30 cm",
      min: 20,
      max: 30,
      unit: "cm",
      note: "FishBase gives a maximum of 30 cm total length. Shooting range and jet power both scale with body size, so a large fish is a substantially better shot than a small one",
    },
    {
      key: "shooting-range",
      label: "Shooting range",
      value: "Up to about 2 m",
      min: 1,
      max: 2,
      unit: "m",
      note: "Two metres is the range reported in the wild; most shots in the field are taken from far closer, because accuracy falls off sharply with distance",
    },
    {
      key: "accuracy",
      label: "Hit rate",
      value: "Up to 100% at a range of 65 cm",
      min: 100,
      max: 100,
      unit: "%",
      note: "Achieved by trained, motivated fish in the laboratory. Hit rates in the wild are much lower, and young fish are visibly poor shots that improve with practice and by watching adults",
    },
    {
      key: "jet-force",
      label: "Force delivered by the jet",
      value: "40–500 mN, scaled to the size of the prey",
      min: 40,
      max: 500,
      unit: "mN",
      note: "To hit harder the fish fires more water rather than faster water — roughly doubling the energy invested, where increasing speed instead would have cost about four times as much",
    },
    {
      key: "water-temperature",
      label: "Preferred water temperature",
      value: "25–30 °C",
      min: 25,
      max: 30,
      unit: "°C",
      note: "A tropical estuarine species; the shooting technique has been shown to work with the same precision across the range of temperatures the fish encounters",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — insects and spiders shot from overhanging vegetation, plus aquatic invertebrates and small fish", icon: "Fish" },
    { key: "vision", label: "Vision", value: "Aims through the air–water interface and compensates for refraction", icon: "Eye" },
    { key: "water-type", label: "Water type", value: "Brackish mainly; also fresh and full seawater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Small groups; competition for knocked-down prey shapes the whole hunt", icon: "Users" },
    { key: "movement", label: "Movement", value: "Amphidromous — moves between fresh, brackish and salt water through life, but not to breed", icon: "Navigation" },
    { key: "reproduction", label: "Reproduction", value: "Poorly known; spawning has rarely been observed and there is no parental care", icon: "Egg" },
    { key: "ecological-role", label: "Ecological role", value: "Surface predator linking the mangrove canopy to the water below", icon: "Crosshair" },
  ],

  highlights: ["shooting-range", "jet-force", "accuracy", "length"],

  distribution: {
    continents: ["Asia", "Australia", "Oceania"],
    regions: [
      "India and the Bay of Bengal",
      "Thailand, Malaysia and Indonesia",
      "The Philippines",
      "Papua New Guinea and the Solomon Islands",
      "Vanuatu",
      "Northern Australia",
    ],
    habitats: ["Mangrove estuaries", "River mouths", "Brackish coastal creeks"],
    elevation: "Surface waters of estuaries and tidal creeks",
    note: "Found from India eastward to the Philippines and south to Indonesia, Papua New Guinea, the Solomon Islands, Vanuatu and northern Australia. The species moves between fresh, brackish and marine water over the course of its life without doing so in order to breed, and it is most abundant in mangrove systems, where overhanging vegetation supplies both cover and targets.",
  },

  sections: [
    {
      id: "the-shot",
      title: "How the shot is made",
      body: [
        "The mechanism is a temporary barrel. The archerfish has a groove running along the roof of its mouth; pressing the tongue up against it forms a narrow channel, and a rapid closing of the gill covers drives water through it. The tip of the tongue acts as a valve, and the fish adjusts the mouth opening continuously through the shot rather than simply squirting.",
        "That continuous adjustment turns out to be the clever part. High-speed filming published in 2014 showed that the jet is not uniform: the fish opens its mouth slowly, then begins to close it while water is still leaving, so the later part of the jet travels faster than the earlier part and catches up with it. The result is that the water gathers into a single blob at a chosen point along its flight — and the fish tunes the timing to target distance so that the blob forms just before impact.",
        "The consequence is a much heavier punch than a steady stream would deliver. Force at the target ranges from about 40 to 500 millinewtons depending on prey size, and archerfish increase it by firing more water rather than faster water, which is the cheaper of the two options in energy terms.",
      ],
    },
    {
      id: "refraction",
      title: "Aiming through a bent world",
      body: [
        "Light entering water from air bends at the surface. For a fish looking up, that means an insect on a leaf does not appear where it actually is, and the size of the displacement depends on the angle the fish is looking at. A shot fired at the apparent position would miss, and the error grows as the fish moves away from directly underneath.",
        "Archerfish get this right. They compensate for the refractive shift, and they do it across a wide range of viewing angles — which is why a fish that has manoeuvred into position off to one side can still hit a target it is looking at obliquely.",
        "Precisely how much of that is built in and how much is learned has been the subject of a long line of experiments. What is clear from the laboratory work is that the compensation is not a fixed rule of thumb: fish adjust it, they get better with practice, and young archerfish are conspicuously bad shots before they have had any.",
      ],
    },
    {
      id: "predictive-start",
      title: "Moving before the prey lands",
      body: [
        "A knocked-down insect belongs to whichever fish reaches it first, and in a group that includes fish which did not take the shot, plus surface feeders of other species. Speed to the landing point is worth more than accuracy of the shot, and archerfish have an answer to it that is arguably more remarkable than the spitting.",
        "From a brief glimpse of the prey's initial motion — the first fraction of its fall — the fish extracts enough information to predict where it will hit the water. It then launches a C-start, the same explosive body-bend fish normally use to escape predators, but aimed at the future landing point rather than away from a threat, and with the take-off speed matched to the distance so that it arrives just as the prey does.",
        "That is a genuine computation, not a chase: the turn is committed before the prey has travelled far, and it is directed at a point where nothing yet exists. Everything the fish needs — direction of fall, speed, height — has to be pulled out of a very short observation, and the decision has to be made in a few hundredths of a second.",
      ],
    },
    {
      id: "life",
      title: "Life in the mangroves",
      body: [
        "Banded archerfish live in estuaries, river mouths and mangrove creeks across the Indo-Pacific, moving between fresh, brackish and full seawater over the course of a life without doing so to spawn. The mangrove habitat is not incidental: the overhanging canopy is what supplies the targets, and the roots supply cover.",
        "Shooting is not the only way they feed. Archerfish take insects that have already fallen, snap at prey within jumping range — a fish will leave the water entirely to grab an insect up to about a body length above the surface — and eat aquatic invertebrates and small fish. Spitting is a supplement to a diet, not the whole of it.",
        "Little is known about their reproduction. Spawning has seldom been observed, there is no parental care, and the eggs are buoyant and left to drift. This is a fish whose behaviour has been studied in extraordinary detail in tanks and whose basic natural history remains patchy.",
      ],
    },
    {
      id: "confusions",
      title: "Two things worth getting right",
      body: [
        "There are several archerfish, not one. The genus Toxotes contains around ten species, and the banded archerfish, Toxotes jaculatrix, is the one usually meant by 'the' archerfish. Much of the best-known research has used other members of the genus, and results do not automatically transfer between them.",
        "The widely reported 2016 study showing that archerfish can be trained to discriminate between human faces used Toxotes chatareus, the largescale archerfish — not this species. It is a real and striking result about a fish brain with no neocortex managing a task once thought to need one, but it belongs to a relative.",
        "Archerfish are frequently sold for home aquaria on the strength of the spitting, and are a poor choice for most. They need brackish water, a tank with an open surface and space above it, live prey to shoot at, and company of their own kind. They are hardy in the right setup and disappointing in the wrong one.",
      ],
    },
  ],

  related: ["ocellaris-clownfish", "mandarinfish", "red-bellied-piranha", "lined-seahorse"],
  tags: ["archerfish", "brackish", "bony fish", "mangrove", "behaviour", "least concern"],
  searchTerms: ["toxotes jaculatrix", "banded archerfish", "spitting fish", "archer fish", "fish that shoots water"],

  faqs: [
    {
      q: "How does an archerfish shoot water?",
      a: "It presses its tongue against a groove in the roof of its mouth to form a temporary barrel, then snaps its gill covers shut to force water through it. The tip of the tongue works as a valve, and the fish changes the size of the mouth opening continuously during the shot so that the later part of the jet travels faster and catches up with the front — delivering the water as a single blob rather than a spray.",
    },
    {
      q: "How far can an archerfish shoot?",
      a: "Up to about two metres in the wild, though most shots are taken from far closer because accuracy falls away with distance. Range and power both scale with the size of the fish, so a full-grown 30-centimetre archerfish is a considerably better shot than a young one.",
    },
    {
      q: "How does an archerfish deal with light bending at the water surface?",
      a: "It compensates for it. Refraction displaces the apparent position of anything an underwater fish looks at in air, and by an amount that changes with viewing angle, so a shot aimed where the insect appears to be would miss. Archerfish correct for this across a wide range of angles, and the correction improves with experience — young fish are noticeably poor shots.",
    },
    {
      q: "Can archerfish predict where their prey will fall?",
      a: "Yes, and this may be the more impressive skill. From a brief view of the prey's first movement as it falls, the fish works out where it will hit the water and launches a fast C-start turn aimed at that point, matching its take-off speed to the distance so it arrives at the right moment. The decision is made within a few hundredths of a second, and it is aimed at a place where nothing is yet.",
    },
    {
      q: "Can archerfish recognise human faces?",
      a: "A 2016 study showed that archerfish could be trained to pick out a familiar human face from dozens of unfamiliar ones by spitting at it — but the fish used were Toxotes chatareus, the largescale archerfish, not the banded archerfish. The finding is notable because fish lack the neocortex that face recognition was assumed to require.",
    },
  ],

  seo: {
    title: "Archerfish — How It Shoots, Refraction, Range & Habitat",
    description:
      "A researched profile of the banded archerfish (Toxotes jaculatrix): how the water jet is formed and focused, how the fish corrects for refraction, the predictive C-start that gets it to the landing point first, and where it lives.",
    keywords: [
      "archerfish facts",
      "toxotes jaculatrix",
      "how archerfish shoot water",
      "banded archerfish",
      "archerfish range",
    ],
  },

  sources: [
    {
      label: "Toxotes jaculatrix — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/196451/2458352",
    },
    {
      label: "Toxotes jaculatrix — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Toxotes-jaculatrix.html",
    },
    {
      label: "Archerfish actively control the hydrodynamics of their jets",
      publisher: "Gerullis & Schuster, Current Biology (2014)",
      url: "https://pubmed.ncbi.nlm.nih.gov/25201684/",
    },
    {
      label: "Hunting in archerfish — an ecological perspective on a remarkable combination of skills",
      publisher: "Schuster, Journal of Experimental Biology (2018)",
      url: "https://journals.biologists.com/jeb/article/221/24/jeb159723/20546/Hunting-in-archerfish-an-ecological-perspective-on",
    },
    {
      label: "Discrimination of human faces by archerfish (Toxotes chatareus)",
      publisher: "Newport et al., Scientific Reports (2016)",
      url: "https://www.nature.com/articles/srep27523",
    },
  ],

  updatedAt: "2026-07-29",
};

export default archerfish;
