// Smooth newt — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const smoothNewt = {
  slug: "smooth-newt",
  category: "amphibians",
  name: "Smooth Newt",
  scientificName: "Lissotriton vulgaris",
  otherNames: ["Common newt", "Northern smooth newt"],

  summary:
    "The newt in the garden pond: an unremarkable brown animal for most of the year that grows a wavy crest each spring, courts by fanning pheromones with its tail without ever touching its mate, and wraps every single egg in its own folded leaf.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Triturus_vulgaris_maennchen_cropped.jpg",
    alt: "A male smooth newt in breeding condition, spotted flanks and a wavy crest along the back and tail",
    credit: "Kristian Peters / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Lissotriton_vulgaris_%28Salamandridae%29_%28Smooth_Newt%29_-_%28adult%29%2C_Arnhem%2C_the_Netherlands_-_2.jpg",
      alt: "An adult smooth newt on damp ground in Arnhem, the Netherlands",
      credit:
        "This image is created by user B. Schoenmakers at Waarneming.nl , a source of nature observations in the Netherlands. / Wikimedia Commons",
      title: "Out of the water, out of costume",
      caption:
        "For most of the year a smooth newt is a drab olive-brown animal with velvety skin, easily mistaken for a lizard until you notice it has no scales and no claws.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/1/11/Lissotriton_vulgaris_%28Salamandridae%29_%28Smooth_Newt%29_-_%28adult%29%2C_Arnhem%2C_the_Netherlands_-_3.jpg",
      alt: "An adult smooth newt showing a pale, spotted throat and belly",
      credit:
        "This image is created by user B. Schoenmakers at Waarneming.nl , a source of nature observations in the Netherlands. / Wikimedia Commons",
      title: "The spotted throat that identifies it",
      caption:
        "A spotted throat separates the smooth newt from the palmate newt, whose throat is unmarked pink. It is the field mark surveyors rely on, because the two species are otherwise very similar out of the breeding season.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/24/Lissotriton_vulgaris_%28Salamandridae%29_%28Smooth_Newt%29_-_%28adult%29%2C_Arnhem%2C_the_Netherlands_-_4.jpg",
      alt: "An adult smooth newt among damp leaf litter",
      credit:
        "This image is created by user B. Schoenmakers at Waarneming.nl , a source of nature observations in the Netherlands. / Wikimedia Commons",
      title: "Eleven months on land",
      caption:
        "Newts are aquatic for a few months of the year at most. The rest is spent hunting invertebrates at night under logs, stones and rough grass, often several hundred metres from any pond.",
    },
  ],

  headline: "A newt that courts without touching",
  intro: [
    "The smooth newt is the amphibian most likely to be found under a flowerpot in a European garden. It is small — seven to eleven centimetres including the tail — olive or grey-brown on land, with a pale orange belly and a throat covered in small dark spots that is the surest way to tell it from the palmate newt.",
    "In spring it changes completely. Males returning to water develop a continuous wavy crest running from the neck to the tip of the tail, a blue-and-orange flash along the tail edge and dark spots that darken to near black, and spend weeks performing to females in a courtship that involves no physical contact at all. Then in summer they climb out, reabsorb the crest, and go back to being a small brown animal under a log.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Caudata",
    family: "Salamandridae",
    genus: "Lissotriton",
    species: "Lissotriton vulgaris",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2023,
    populationTrend: "stable",
    populationEstimate: "Very large; one of the most abundant amphibians in northern and central Europe",
    note: "Assessed in 2023 under a narrowed species concept: what used to be a single wide-ranging Lissotriton vulgaris has been split, with the Greek, Kosswig's and Caucasian smooth newts recognised as separate species. Least Concern with a stable trend, though local populations are lost with ponds. In the United Kingdom it is protected against sale and trade under the Wildlife and Countryside Act 1981. It has been introduced to Australia, where it is treated as a pest risk.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "7–11 cm",
      min: 7,
      max: 11,
      unit: "cm",
      note: "Head, body and tail. Males average slightly longer than females.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "6–14 years in the wild",
      min: 6,
      max: 20,
      unit: "years",
      note: "Captive animals have reached about 20.",
    },
    {
      key: "clutch-size",
      label: "Eggs per female",
      value: "100–500 eggs",
      min: 100,
      max: 500,
      unit: "eggs",
      note: "Laid one at a time over several weeks, never as a mass.",
    },
    {
      key: "incubation",
      label: "Time to hatching",
      value: "10–20 days",
      min: 10,
      max: 20,
      unit: "days",
    },
    {
      key: "larval-period",
      label: "Larval period",
      value: "About 3 months",
      min: 2,
      max: 4,
      unit: "months",
      note: "Larvae leave the water as small terrestrial efts in late summer.",
    },
  ],

  traits: [
    {
      key: "diet-type",
      label: "Diet",
      value: "Carnivore — insects, worms, slugs, water fleas and frog tadpoles",
      icon: "Drumstick",
    },
    { key: "activity", label: "Activity", value: "Nocturnal on land; active by day in the breeding pond", icon: "Moon" },
    {
      key: "breeding-display",
      label: "Courtship",
      value: "Male grows a wavy crest and fans pheromones at the female with his tail — no contact",
      icon: "Waves",
    },
    {
      key: "egg-laying",
      label: "Egg laying",
      value: "Each egg folded individually into the leaf of a water plant",
      icon: "Leaf",
    },
    { key: "water-type", label: "Water type", value: "Freshwater — small, still, fish-free ponds", icon: "Droplet" },
  ],

  highlights: ["length", "clutch-size", "egg-laying", "breeding-display"],

  distribution: {
    continents: ["Europe", "Asia"],
    regions: [
      "Britain and Ireland east through central Europe to western Russia and Siberia",
      "Central Fennoscandia south to central France and the Balkans; northern Kazakhstan",
    ],
    habitats: ["Small ponds, ditches and garden ponds", "Woodland, hedgerow, marsh and tussocky grassland"],
    elevation: "Sea level to about 1,000 m",
    note: "One of the few amphibians native to Ireland, and the most widespread newt in Britain. It tolerates a broader range of pond types than the great crested newt, including small, temporary and slightly brackish water, which is a large part of why it is so common. It has been introduced to Australia.",
  },

  sections: [
    {
      id: "two-lives",
      title: "Two animals in one year",
      body: [
        "A smooth newt spends only a few months a year in water. Adults arrive at ponds from late February onward, depending on latitude, and stay through spring while breeding; by midsummer most have left. The remaining eight or nine months are terrestrial, nocturnal and almost entirely unobserved.",
        "The two phases look different enough to confuse people. In water, the skin is smooth and slippery, the tail is flattened into a swimming blade, and a breeding male carries a crest and bright colours. On land the skin becomes velvety and water-repellent, the tail rounds off, and the crest is reabsorbed. What remains constant is the pale orange belly and the spotted throat.",
        "Terrestrial newts hunt at night for insects, worms and slugs, and shelter by day under logs, stones, compost and rough vegetation — often several hundred metres from the nearest pond. This is the part of the life cycle that garden management usually ignores and that determines whether a population survives.",
      ],
    },
    {
      id: "courtship",
      title: "Courtship at arm's length",
      body: [
        "Newt courtship is unusual among vertebrates in involving no contact and no internal mating in the ordinary sense. A male positions himself in front of a female, blocks her path, and begins a display: he bends his body into a static arc, then whips or vibrates his tail against his flank to drive a current of water — and with it pheromones from his cloacal glands — toward her snout.",
        "If the female responds, the male turns and moves away, and she follows. He deposits a spermatophore, a small package of sperm on a gelatinous base, onto the pond bottom, then manoeuvres so that she walks over it and picks it up with her cloaca. Fertilisation happens internally afterward. The whole sequence can be repeated many times over the breeding season, and females store sperm from more than one male.",
        "Because the display depends on water carrying scent, it works only in still water — one of several reasons newts prefer small, sheltered, weed-rich ponds over open or flowing water.",
      ],
    },
    {
      id: "eggs",
      title: "One egg, one leaf",
      body: [
        "A female smooth newt lays between one and five hundred eggs over the course of the season, and handles each one individually. She grips the leaf of a submerged plant with her hind feet, folds it over, deposits a single egg inside the fold, and presses the leaf closed so that it stays wrapped.",
        "The reason is straightforward: a newt egg laid in the open is eaten. Wrapping conceals it from fish, invertebrates and other newts — including adult newts of its own species, which will eat eggs and larvae readily. It also slows the process to a crawl, which is why the season stretches over weeks rather than the single night a frog needs.",
        "Eggs hatch after ten to twenty days into larvae with feathery external gills. Unlike tadpoles, newt larvae grow their front legs first and are carnivorous from the start, hunting small crustaceans and insect larvae. After about three months they absorb their gills and leave the water as efts, small enough to fit on a fingernail, and will not return to a pond for two or three years.",
      ],
    },
    {
      id: "status",
      title: "Common, and quietly dependent on small ponds",
      body: [
        "Smooth newts remain abundant across most of their range and were reassessed as Least Concern with a stable trend in 2023. That assessment applies to a narrower species than it used to: genetic work has split the old wide-ranging Lissotriton vulgaris, and the Greek, Kosswig's and Caucasian smooth newts are now treated separately.",
        "The species has done comparatively well because it is undemanding. It will breed in a garden pond, a farm ditch, a flooded rut or a temporary pool, and tolerates slightly brackish water. Its one non-negotiable requirement is the absence of fish, which eat larvae and eggs efficiently enough to remove a population from a pond entirely.",
        "In Britain it is protected from sale and trade under the Wildlife and Countryside Act 1981, but not from habitat loss, and the long twentieth-century decline of farm ponds cost it a great deal. Garden ponds have offset some of that; the useful additions are shallow margins, submerged plants to fold eggs into, no fish, and undisturbed cover on land nearby for the rest of the year.",
      ],
    },
  ],

  related: ["common-frog", "fire-salamander", "olm"],
  tags: ["newt", "europe", "garden pond", "least concern", "freshwater", "courtship"],
  searchTerms: [
    "lissotriton vulgaris",
    "triturus vulgaris",
    "common newt",
    "newt in garden pond",
    "teichmolch",
  ],

  faqs: [
    {
      q: "How do you tell a smooth newt from a palmate newt?",
      a: "Look at the throat. A smooth newt's throat is pale with small dark spots; a palmate newt's is unmarked pink or yellowish. In the breeding season the difference is obvious anyway — a male smooth newt grows a continuous wavy crest from neck to tail tip, while a male palmate newt develops black webbed hind feet and a thin filament at the end of the tail.",
    },
    {
      q: "How do newts mate?",
      a: "Without contact. The male displays in front of the female, arching his body and fanning water toward her with his tail to carry pheromones from his glands. If she follows him, he deposits a spermatophore — a packet of sperm — on the pond bottom and positions her to pick it up with her cloaca. Fertilisation is internal but there is no copulation.",
    },
    {
      q: "Why do newts fold their eggs into leaves?",
      a: "To hide them. A single egg is wrapped inside the folded leaf of a water plant, out of sight of fish, invertebrates and other newts, which will readily eat exposed eggs and larvae. Because each egg is handled individually, laying a full clutch of a hundred to five hundred takes weeks rather than a night.",
    },
    {
      q: "Are smooth newts protected?",
      a: "In the United Kingdom they are protected against sale and trade under the Wildlife and Countryside Act 1981, though not to the same degree as the great crested newt. Globally they are listed as Least Concern with a stable population, and remain one of the commonest amphibians in northern and central Europe.",
    },
    {
      q: "How do I get newts into a garden pond?",
      a: "Leave the fish out — this matters more than anything else, because fish eat newt eggs and larvae. Add submerged plants with soft leaves for the females to fold eggs into, keep at least one shallow, gently sloping edge, and leave log piles, long grass or a compost heap nearby, since adults spend most of the year on land.",
    },
  ],

  seo: {
    title: "Smooth Newt — Courtship, Egg Laying, Habitat & Identification",
    description:
      "A researched profile of the smooth newt (Lissotriton vulgaris): the crest and contact-free courtship display, why each egg is folded into its own leaf, and how to tell it from the palmate newt.",
    keywords: [
      "smooth newt",
      "lissotriton vulgaris",
      "common newt",
      "newt courtship",
      "newt eggs leaves",
    ],
  },

  sources: [
    {
      label: "Lissotriton vulgaris — Red List assessment (2023, e.T79078647A229006372)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/79078647/229006372",
    },
    {
      label: "Smooth newt — species account, identification and legal protection",
      publisher: "The Wildlife Trusts",
      url: "https://www.wildlifetrusts.org/wildlife-explorer/amphibians/smooth-newt",
    },
    {
      label: "Lissotriton vulgaris — distribution and habitat in Europe",
      publisher: "EUNIS, European Environment Agency",
      url: "https://eunis.eea.europa.eu/species/316365",
    },
  ],

  updatedAt: "2026-07-29",
};

export default smoothNewt;
