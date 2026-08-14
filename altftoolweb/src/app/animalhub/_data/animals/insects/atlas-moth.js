// Atlas moth — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const atlasMoth = {
  slug: "atlas-moth",
  category: "insects",
  name: "Atlas Moth",
  scientificName: "Attacus atlas",
  otherNames: ["Snake's head moth", "Fagara silkmoth"],

  summary:
    "One of the largest moths in the world, and an animal with no working mouth: the adult cannot eat at all, and spends its entire week or two of life on fat the caterpillar put away.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Attacus_atlas_qtl3.jpg/1920px-Attacus_atlas_qtl3.jpg",
    alt: "A male atlas moth beside its cocoon, wings spread to show the rust-brown pattern and triangular clear windows",
    credit: "Quartl / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Atlas_Moth_%28Attacus_atlas%29_%281%29.jpg/1920px-Atlas_Moth_%28Attacus_atlas%29_%281%29.jpg",
      alt: "An atlas moth at rest with its wings fully spread, showing the triangular translucent windows in each wing",
      credit: "Vauxford / Wikimedia Commons",
      title: "Wings wider than a hand span",
      caption:
        "The four triangular clear patches are scale-free windows in the wing membrane. What makes the atlas moth remarkable is not its span — the white witch of the Neotropics is wider — but the sheer area of wing, which is among the greatest of any insect and makes it a slow, laboured flier.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Atlas_Moth_%28Attacus_atlas%29.jpg",
      alt: "An atlas moth photographed at London Zoo, its rust-brown wings banded with black, cream and pink",
      credit: "Dr. Raju Kasambe / Wikimedia Commons",
      title: "Why most people meet one indoors",
      caption:
        "An adult atlas moth exists for a week or two and never feeds, so the odds of finding one in the wild are poor even inside its range. Butterfly houses rear them from imported cocoons, which is where nearly every photograph of a living one is taken.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Atlas_Moth_-_Attacus_atlas%2C_Brookside_Gardens.jpg/1920px-Atlas_Moth_-_Attacus_atlas%2C_Brookside_Gardens.jpg",
      alt: "An atlas moth with wings open, the hooked tips of the forewings clearly visible",
      credit: "Judy Gallagher / Wikimedia Commons",
      title: "The hooked forewing tips",
      caption:
        "Each forewing ends in a curved, dark-marked point that has been read for more than a century as a mimic of a snake's head, complete with an eye and a mouth line. It is a plausible reading — the moth's predators hunt by sight and the region has plenty of snakes — but it has never been tested experimentally.",
    },
  ],

  headline: "The largest wings in the insect world, and a week to use them",
  intro: [
    "An atlas moth's wings can span the width of a dinner plate, and their total surface area is among the largest of any flying insect. The body underneath is almost an afterthought: small, furred, and carrying no useful mouth at all.",
    "That is the animal's central fact. Everything the adult will ever spend was earned by the caterpillar, which eats continuously for weeks and can reach the size of a cigar. The moth that emerges from the cocoon has one job, no way to refuel, and roughly ten days to get it done.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Lepidoptera",
    family: "Saturniidae",
    genus: "Attacus",
    species: "Attacus atlas",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "unknown; local declines reported",
    populationEstimate: "No population estimate exists for any part of the range",
    note: "The atlas moth has never been assessed against the Red List criteria, which is the norm for insects rather than a verdict of safety — it means nobody has done the work. What is known is that the species is still widespread across South and Southeast Asia and is reared commercially in several countries, while its lowland forest habitat continues to be cleared and fragmented. Giant saturniids are also unusually exposed to light pollution, which draws them off course and away from mates, and to collection for the mounted-specimen trade.",
  },

  measurements: [
    {
      key: "wingspan",
      label: "Wingspan",
      value: "About 21–30 cm",
      min: 21,
      max: 30,
      unit: "cm",
      note: "Published ranges differ; females are markedly larger than males",
    },
    {
      key: "caterpillar-length",
      label: "Caterpillar length",
      value: "Up to about 11.5 cm",
      min: 9,
      max: 11.5,
      unit: "cm",
      note: "And up to about 2.5 cm thick at the final instar",
    },
    {
      key: "cocoon-length",
      label: "Cocoon length",
      value: "7–8 cm",
      min: 7,
      max: 8,
      unit: "cm",
      note: "Spun from fagara silk and slung in a curtain of dried leaves",
    },
    {
      key: "larval-duration",
      label: "Caterpillar stage",
      value: "About 4–14 weeks",
      min: 4,
      max: 14,
      unit: "weeks",
      note: "Five or six instars; the pace depends heavily on host plant and temperature",
    },
    {
      key: "pupal-duration",
      label: "Pupal stage",
      value: "About 4–6 weeks",
      min: 4,
      max: 6,
      unit: "weeks",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "About 1–2 weeks",
      min: 1,
      max: 2,
      unit: "weeks",
      note: "The adult cannot feed and runs entirely on larval fat reserves",
    },
    {
      key: "eggs-laid",
      label: "Eggs laid per female",
      value: "About 130–290",
      min: 130,
      max: 290,
      unit: "eggs",
      note: "Laid singly or in small groups on the undersides of host-plant leaves",
    },
  ],

  traits: [
    { key: "diet-larva", label: "Larval diet", value: "Leaves of more than 80 tree species", icon: "Leaf" },
    { key: "diet-adult", label: "Adult diet", value: "None — the mouthparts do not work", icon: "Ban" },
    { key: "activity", label: "Activity", value: "Nocturnal; flies mostly in the first hours of night", icon: "Moon" },
    { key: "defence", label: "Defence", value: "Forewing tips patterned like a snake's head", icon: "ShieldAlert" },
    { key: "pheromone-tracking", label: "Mate finding", value: "Males track female pheromone with feathered antennae", icon: "Radar" },
    { key: "silk", label: "Silk", value: "Fagara silk — coarse, brown and woolly", icon: "Spool" },
  ],

  highlights: ["wingspan", "lifespan-adult", "diet-adult", "defence"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Indian subcontinent, including Nepal and Sri Lanka",
      "Southern China and Taiwan",
      "Mainland Southeast Asia",
      "Malay Peninsula, Borneo, Java and the Indonesian archipelago",
      "The Philippines",
    ],
    habitats: [
      "Tropical and subtropical rainforest",
      "Dry tropical forest",
      "Secondary forest",
      "Shrubland and plantation edge",
    ],
    elevation: "Sea level to around 2,000 m",
    note: "The species is a lowland and mid-elevation forest animal across monsoon Asia, and follows its host plants into cultivated land — cardamom, mango, tea, guava and citrus are all recorded hosts, which is why caterpillars turn up in plantations and gardens well outside intact forest.",
  },

  sections: [
    {
      id: "size",
      title: "How big it really is, and how the record is usually misstated",
      body: [
        "The atlas moth is routinely called the world's largest moth, and the claim needs unpicking. By wingspan it is not the widest: the white witch of Central and South America stretches further, and Attacus caesar of the Philippines is comparable. What sets the atlas moth apart is total wing area, where it is either the leader or a close rival to the Australian Hercules moth, Coscinocera hercules.",
        "Published span figures scatter between roughly 21 and 30 cm, partly because females are considerably larger than males and partly because captive-reared moths and wild ones differ. A figure at the top of that range belongs to an exceptional female, not to a typical animal.",
        "All that wing has a cost. The moth is a weak, fluttering flier that tires quickly and often rests through the day flattened against bark or foliage. Its size is a mating strategy and a defensive bluff rather than an aeronautical advantage.",
      ],
    },
    {
      id: "no-mouth",
      title: "An adult that cannot eat",
      body: [
        "Adult atlas moths have only a vestigial proboscis. It is too reduced to draw nectar, so the moth takes in nothing after leaving the cocoon and burns through fat that the caterpillar accumulated. That budget lasts roughly one to two weeks.",
        "The caterpillar side of the ledger is correspondingly extreme. It eats through five or six instars over anything from about a month to more than three, depending on the host plant and the temperature, growing from a few millimetres to eleven centimetres long and about two and a half thick — a pale green, waxy-bloomed animal studded with fleshy spines.",
        "This split life is common across the giant silkmoths and it explains their behaviour completely. Because the adult has no reason to visit a flower and no way to replace what it spends, everything it does is mating: males fly at night hunting pheromone, females often barely move from where they emerged, and both are dead within days of the eggs being laid.",
      ],
    },
    {
      id: "snake",
      title: "The snake-head hypothesis",
      body: [
        "Each forewing ends in a hooked, tapering tip marked with a dark curve and a pale patch. Seen from the side, with the wings held partly open, the shape reads convincingly as a snake's head with an eye and a mouth line — and the moth is known to move its wings slowly when disturbed, which is often described as the pose completing the illusion.",
        "The supporting circumstantial case is decent. The moth's main predators, birds and lizards, hunt by sight; snakes that would deter them are abundant across the range; and related Attacus species carry weaker versions of the same marking, which is the pattern natural selection tends to leave behind.",
        "It has still never been demonstrated experimentally. No study has shown that predators actually treat the wingtip as a snake, which is true of a great many eyespot and mimicry claims in the silkmoths. It is a strong hypothesis presented in most popular accounts as settled fact, and the honest position is that the resemblance is real and the function is untested.",
      ],
    },
    {
      id: "silk",
      title: "Fagara silk, cocoons and the specimen trade",
      body: [
        "The cocoon is a papery brown case seven or eight centimetres long, wrapped in dried leaves and hung from a twig by a silk stalk. Its fibre is called fagara silk in India and is one of the wild, non-mulberry silks: coarser, browner and woollier than the silk of Bombyx mori, and produced in small quantities rather than industrially. Empty cocoons are tough enough that in Taiwan they have been used as small purses.",
        "The moth is also worth more dead than most insects, and mounted atlas moths are sold worldwide as ornaments. That trade, together with wild collection of cocoons for silk, adds pressure that nobody has quantified.",
        "None of this has been assessed. Attacus atlas has no IUCN listing, no population estimate and no monitoring across most of its range, so the standard reassurance that a widespread species must be secure is an assumption rather than a finding. Forest clearance across lowland monsoon Asia and the well-documented effect of artificial light on night-flying moths are both acting on it in the meantime.",
      ],
    },
  ],

  related: ["monarch-butterfly", "western-honey-bee", "hercules-beetle"],
  tags: ["moth", "silkmoth", "lepidoptera", "southeast asia", "mimicry", "largest insect"],
  searchTerms: ["attacus atlas", "atlas moth wingspan", "biggest moth in the world", "snake head moth", "fagara silk"],

  faqs: [
    {
      q: "Is the atlas moth the biggest moth in the world?",
      a: "By total wing surface area it is either the largest or very close to it, rivalled by the Australian Hercules moth. By wingspan it is not the widest — the white witch of Central and South America stretches further. Atlas moth spans are usually quoted between about 21 and 30 cm, with females considerably larger than males.",
    },
    {
      q: "Why can't adult atlas moths eat?",
      a: "Their proboscis is vestigial — present but too reduced to feed with. The adult stage runs entirely on fat reserves built up by the caterpillar, which is why it lasts only about one to two weeks. This is normal for giant silkmoths in the family Saturniidae, and it means the adult's whole existence is devoted to mating.",
    },
    {
      q: "How long does an atlas moth live?",
      a: "The adult lives roughly one to two weeks. The full life cycle is much longer: about ten days as an egg, then five or six caterpillar instars over anything from a month to three months depending on host plant and temperature, then four to six weeks as a pupa inside the cocoon.",
    },
    {
      q: "Do atlas moths really mimic snakes?",
      a: "The tips of the forewings are marked in a way that closely resembles a snake's head, and the circumstantial case is good: the moth's predators hunt by sight, snakes are common across its range, and related species carry fainter versions of the same pattern. But no experiment has shown that predators actually react to it as a snake, so it remains a strong hypothesis rather than a demonstrated fact.",
    },
    {
      q: "Are atlas moths endangered?",
      a: "Nobody knows, and that is the accurate answer. The species has never been assessed by the IUCN, so it carries no Red List status and there is no population estimate for any part of its range. It is still widespread across South and Southeast Asia and is reared commercially, but lowland forest loss, light pollution and collection for the mounted-specimen trade all act on it without being measured.",
    },
    {
      q: "Can you keep or rear an atlas moth?",
      a: "They are reared routinely in butterfly houses and by hobbyists from imported cocoons, on host plants such as privet, citrus and guava. Live cocoons and eggs are regulated as agricultural imports in most countries because the caterpillars are broad feeders that could establish on local trees, so moving them across borders without a permit is generally illegal.",
    },
  ],

  seo: {
    title: "Atlas Moth — Wingspan, the Snake-Head Wingtips & Why Adults Cannot Eat",
    description:
      "A researched profile of the atlas moth (Attacus atlas): one of the largest moths on Earth by wing area, an adult with no working mouthparts and about two weeks to live, and the untested snake-mimicry hypothesis.",
    keywords: [
      "atlas moth facts",
      "attacus atlas",
      "atlas moth wingspan",
      "biggest moth in the world",
      "atlas moth lifespan",
    ],
  },

  sources: [
    {
      label: "Spotlight: the atlas moth",
      publisher: "Natural History Museum, London",
      url: "https://www.nhm.ac.uk/discover/spotlight-the-atlas-moth.html",
    },
    {
      label: "Atlas moth — specimens in focus",
      publisher: "California Academy of Sciences",
      url: "https://www.calacademy.org/learn-explore/specimens-in-focus/atlas-moth",
    },
    {
      label: "Attacus atlas — species account",
      publisher: "Animal Diversity Web, University of Michigan Museum of Zoology",
      url: "https://animaldiversity.org/accounts/Attacus_atlas/",
    },
    {
      label: "Butterfly moment: atlas moth",
      publisher: "Florida Museum of Natural History",
      url: "https://www.floridamuseum.ufl.edu/exhibits/blog/butterfly-moment-atlas-moth/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default atlasMoth;
