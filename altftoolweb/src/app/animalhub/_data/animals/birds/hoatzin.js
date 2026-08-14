// Hoatzin — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const hoatzin = {
  slug: "hoatzin",
  category: "birds",
  name: "Hoatzin",
  scientificName: "Opisthocomus hoazin",
  otherNames: ["Stinkbird", "Canje pheasant", "Hoactzin"],

  summary:
    "The only bird that ferments leaves in an enlarged crop, the way a cow does in its rumen — and whose chicks climb back to the nest using claws on their wings.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Hoatzin_%28Opisthocomus_hoazin%29_Rio_Napo.jpg/1920px-Hoatzin_%28Opisthocomus_hoazin%29_Rio_Napo.jpg",
    alt: "A hoatzin perched in riverside vegetation, spiky rufous crest raised and blue bare face visible",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/4_day_trip_to_La_Selva_Lodge_on_the_Napo_River_in_the_Amazon_jungle_of_E._Ecuador_-_Hoatzin_%28Opisthocomus_hoazin%29_-_%2826592958760%29.jpg/1920px-4_day_trip_to_La_Selva_Lodge_on_the_Napo_River_in_the_Amazon_jungle_of_E._Ecuador_-_Hoatzin_%28Opisthocomus_hoazin%29_-_%2826592958760%29.jpg",
      alt: "A hoatzin clinging to thin branches beside water, its heavy body balanced on the foliage",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "Front-heavy by design",
      caption:
        "The crop that ferments the hoatzin's food takes up so much of its chest that the keel of the breastbone is reduced and the flight muscles are displaced. The bird clambers rather than flies, and often rests its weight on a leathery pad at the base of the crop.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/4_day_trip_to_La_Selva_Lodge_on_the_Napo_River_in_the_Amazon_jungle_of_E._Ecuador_-_Hoatzin_%28Opisthocomus_hoazin%29_-_%2826261390363%29.jpg/1920px-4_day_trip_to_La_Selva_Lodge_on_the_Napo_River_in_the_Amazon_jungle_of_E._Ecuador_-_Hoatzin_%28Opisthocomus_hoazin%29_-_%2826261390363%29.jpg",
      alt: "A hoatzin among leaves showing streaked buff upperparts and long broad tail with a pale band",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "A diet almost no bird can use",
      caption:
        "Around four fifths of what a hoatzin eats is leaves, and it takes them from a short list of riverside plants. Leaves are so poor in energy and so hard to break down that scarcely any flying bird attempts to live on them.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/4_day_trip_to_La_Selva_Lodge_on_the_Napo_River_in_the_Amazon_jungle_of_E._Ecuador_-_Hoatzin_%28Opisthocomus_hoazin%29_-_%2826798137561%29.jpg/1920px-4_day_trip_to_La_Selva_Lodge_on_the_Napo_River_in_the_Amazon_jungle_of_E._Ecuador_-_Hoatzin_%28Opisthocomus_hoazin%29_-_%2826798137561%29.jpg",
      alt: "A hoatzin with wings partly opened in dense green riverside growth",
      credit: "Murray Foubister / Wikimedia Commons",
      title: "Noisy neighbours",
      caption:
        "Hoatzins live in groups and are far from quiet, producing groans, croaks, hisses and grunts, usually paired with a movement such as spreading the wings. Territories are small and always next to water.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Hoatzin_%28Opisthocomus_hoazin%29_%289563143133%29.jpg/1920px-Hoatzin_%28Opisthocomus_hoazin%29_%289563143133%29.jpg",
      alt: "A hoatzin perched in the open, maroon eye and bare blue facial skin clearly visible",
      credit: "Dominic Sherony / Wikimedia Commons",
      title: "Alone on its own branch",
      caption:
        "The hoatzin is the only surviving member of its family and of its entire order. Where that order belongs in the bird family tree is one of the longest-running unsolved problems in avian classification.",
    },
  ],

  headline: "The bird that digests like a cow",
  intro: [
    "Almost no flying bird lives on leaves. Leaves are low in energy and locked up in cellulose that no vertebrate can break down unaided, and the fermentation chamber and gut bacteria needed to extract anything from them are heavy. The hoatzin does it anyway. It ferments its food in a hugely enlarged crop at the front of the gut — foregut fermentation, the same principle as a cow's rumen — and it is the only bird known to do so.",
    "The cost is written into its skeleton. The crop and lower oesophagus can account for more than a sixth of the bird's total mass, and they take up so much of the chest that the keel of the breastbone is reduced and the flight muscles are pushed aside. A hoatzin is a poor flier that clambers through riverside vegetation instead. Its chicks, meanwhile, are born with functional claws on their wings, drop into the water when a hawk appears, swim, and then climb back up.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Opisthocomiformes",
    family: "Opisthocomidae",
    genus: "Opisthocomus",
    species: "Opisthocomus hoazin",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2024,
    populationTrend: "decreasing",
    populationEstimate: "No global figure; locally common across a breeding range of roughly 8.6 million km²",
    note: "Assessed as Least Concern on the strength of an enormous range across the Amazon and Orinoco basins, within which the species remains locally common. The trend is nonetheless downward, driven by clearance of riverside forest. It is unpalatable and rarely hunted for food, which has spared it a pressure many large Amazonian birds face.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "61–66 cm",
      min: 61,
      max: 66,
      unit: "cm",
      note: "Pheasant-sized, but with a small head on a long neck",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 900 g",
      min: 700,
      max: 900,
      unit: "g",
    },
    {
      key: "crop-mass",
      label: "Crop as a share of body mass",
      value: "Up to 17.7%",
      min: 17.7,
      max: 17.7,
      unit: "%",
      note: "The crop and lower oesophagus together make up around 70% of the digestive tract",
    },
    {
      key: "leaf-diet",
      label: "Leaves in the diet",
      value: "Around 80%",
      min: 80,
      max: 82,
      unit: "%",
      note: "The remainder is flowers and fruit; fewer than a dozen plant species are eaten regularly",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "2–3 eggs",
      min: 2,
      max: 3,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "28–32 days",
      min: 28,
      max: 32,
      unit: "days",
      note: "Shared by the pair and sometimes by helpers",
    },
    {
      key: "breeding-helpers",
      label: "Helpers at the nest",
      value: "Up to six assist one breeding pair",
      min: 0,
      max: 6,
      unit: "birds",
      note: "Usually males from the pair's earlier broods",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Folivore — the only bird known to ferment leaves in its foregut", icon: "Leaf" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "flight", label: "Flight", value: "Weak and laboured — the crop displaces the flight muscles", icon: "Feather" },
    { key: "nest-type", label: "Nest type", value: "Loose stick platform on a branch overhanging water", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Cooperative breeder — a pair plus helpers from earlier broods", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Riverside folivore; the national bird of Guyana", icon: "Flag" },
  ],

  highlights: ["crop-mass", "leaf-diet", "body-length", "flight"],

  distribution: {
    continents: ["South America"],
    regions: [
      "The Amazon Basin",
      "The Orinoco Basin",
      "The Guianas",
      "Eastern Ecuador, Peru and Bolivia",
      "Northern and central Brazil",
    ],
    habitats: [
      "Riparian forest",
      "Seasonally flooded swamp forest",
      "Oxbow lakes and slow river margins",
      "Mangrove",
    ],
    elevation: "Lowlands, generally below 500 m",
    note: "Never far from water. Hoatzins occupy the narrow band of vegetation along rivers, oxbow lakes, swamps and mangroves through the Amazon and Orinoco basins — a very large total range made up of a very thin ribbon of habitat, which is why riverside clearance matters more to them than deforestation figures alone suggest.",
  },

  sections: [
    {
      id: "fermentation",
      title: "Fermentation in a bird",
      body: [
        "The hoatzin's crop — the pouch at the base of the throat that most birds use for short-term food storage — is enormously enlarged, thickly muscled and ridged inside, and it works as a fermentation vat. Bacteria and archaea living there break down cellulose from the leaves the bird swallows, releasing fatty acids the hoatzin can absorb and neutralising plant toxins in the process. Analyses of the crop community have found methane-producing microbes of the kind normally associated with a cow's rumen.",
        "A study published in Science in 1989 established the scale of it: the crop and lower oesophagus account for around 70% of the digestive tract and can weigh up to 17.7% of the bird's total mass. Fermentation is slow, so a hoatzin spends long periods sitting still while its meal is processed.",
        "This is the only known case of foregut fermentation in a bird, and the hoatzin is among the smallest warm-blooded animals to use the strategy at all. It also produces the smell that gives the species its other name — the fermenting crop makes a hoatzin smell like manure, which has largely kept it off the menu for local hunters.",
      ],
    },
    {
      id: "flight",
      title: "What the crop cost",
      body: [
        "The chest of a flying bird is mostly flight muscle, anchored to a deep keel on the breastbone. In the hoatzin, the crop has taken that space. The keel is reduced and the muscles displaced, and the result is a bird that flies badly — short, heavy, crashing flights between branches rather than sustained travel.",
        "It compensates by climbing. Hoatzins clamber through riverside tangles using feet, bill and wings, and a thickened, leathery pad at the base of the crop lets a perching bird rest its weight forward against a branch, taking the load off its legs.",
        "This is a genuine evolutionary trade: the species bought access to a food supply almost no other bird can use, and paid for it in flight. That trade only works where the food is dense and reliably close by, which is why hoatzins are tied so tightly to riverside vegetation.",
      ],
    },
    {
      id: "chicks",
      title: "Wing claws",
      body: [
        "Hoatzin chicks hatch with two functional claws on each wing, on the first and second digits. Nests are built on branches overhanging water, and if a predator such as a great black hawk arrives, the adults make a noisy diversion while the chicks scatter into the vegetation. If cornered, a chick drops straight into the water below, swims — underwater, if it must — and then hauls itself back up the trunk and branches using those claws and its oversized feet. The claws are lost as the bird matures.",
        "This is routinely reported as a resemblance to Archaeopteryx, and it is worth being clear about what the resemblance is and is not. Wing claws are not a retained feature passed down from early birds through the hoatzin alone; several unrelated modern birds have claws or spurs on the wing to some degree. The hoatzin's are best understood as a specialisation of its own — plausibly a reversion to an ancestral developmental pattern, but one that arose in this lineage rather than surviving in it.",
        "The habit itself is the interesting part. A chick that can swim and climb out of danger is a workable answer to nesting over water in a forest full of hawks and snakes.",
      ],
    },
    {
      id: "society",
      title: "Groups, helpers and territories",
      body: [
        "Hoatzins live in small groups on tiny territories at the water's edge. A breeding pair is typically assisted by up to six helpers — usually young males from their own earlier broods — who defend the territory, help incubate and feed the chicks. Cooperative breeding of this kind raises the number of young that survive, and is common in birds whose habitat is patchy and hard to disperse into.",
        "They are conspicuously noisy. The vocal repertoire is a set of hoarse groans, croaks, hisses and grunts, usually delivered with an accompanying movement such as spreading the wings, and a disturbed group is audible well before it is visible.",
        "Two to three eggs are laid on a loose stick platform above the water and incubated for about a month. Chicks are fed on regurgitated, already-fermented plant material — effectively inoculating them with the microbial culture they will need for the rest of their lives.",
      ],
    },
    {
      id: "taxonomy",
      title: "A bird with no relatives",
      body: [
        "The hoatzin is the only living species in its family and the only family in its order, Opisthocomiformes. Where that order sits in the bird family tree has been argued over for more than a century, and it remains genuinely unresolved.",
        "It has at various times been placed with the gamebirds, the cranes and rails, the turacos, the cuckoos and the waders, and support for each has been weak. Modern genome-scale studies have narrowed the options without settling them: different datasets and different analytical methods keep recovering different positions for the hoatzin within Neoaves, a group whose major lineages diverged so rapidly that the order of branching is intrinsically hard to recover.",
        "The honest summary is that the hoatzin sits on a very long branch of its own, that its closest living relatives are not currently identifiable with confidence, and that this is a problem about the resolution of a rapid radiation rather than a mystery about the bird. Fossil relatives are known from Africa and South America, which suggests the lineage was once more widespread than the single riverside species left today.",
      ],
    },
  ],

  related: ["scarlet-macaw", "kiwi", "greater-flamingo"],
  tags: ["amazon", "folivore", "unique digestion", "wing claws", "south america"],
  searchTerms: ["opisthocomus hoazin", "stinkbird", "canje pheasant", "wing claws bird", "leaf eating bird"],

  faqs: [
    {
      q: "Why does the hoatzin smell bad?",
      a: "Because of what is happening inside it. The hoatzin ferments leaves in a greatly enlarged crop, using bacteria to break down cellulose, and the by-products of that fermentation give the bird a manure-like odour — hence the nickname 'stinkbird'. It has an incidental benefit: the smell has largely kept the species off the menu for local hunters.",
    },
    {
      q: "Do hoatzin chicks really have claws on their wings?",
      a: "Yes — two functional claws on each wing, on the first and second digits, which are lost as the bird matures. Nests overhang water, and a threatened chick drops in, swims away, and then climbs back up the trunk using the claws and its large feet. It is often compared to Archaeopteryx, but the claws are best understood as a specialisation that arose in the hoatzin's own lineage rather than a feature inherited directly from early birds.",
    },
    {
      q: "Why can't hoatzins fly well?",
      a: "The fermentation crop takes up the space flight muscles would occupy. It can weigh up to about 17.7% of the bird's total mass, and it has reduced the keel of the breastbone and displaced the muscles that attach to it. The hoatzin manages short, heavy flights between branches and otherwise clambers through riverside vegetation using feet, bill and wings.",
    },
    {
      q: "What is the hoatzin related to?",
      a: "Nothing living, as far as anyone can currently establish. It is the only species in its family and the only family in its order. It has been placed with gamebirds, cranes, turacos, cuckoos and waders at various times, and modern genome-scale studies keep recovering different positions for it. The uncertainty comes from how rapidly the major groups of modern birds diverged, which makes the branching order genuinely hard to resolve.",
    },
    {
      q: "Where do hoatzins live?",
      a: "Along the water's edge in the Amazon and Orinoco basins of South America — riparian forest, seasonally flooded swamp, oxbow lakes and mangrove — from the Guianas and Venezuela through Brazil, Ecuador, Peru and Bolivia. They are never far from water, since the riverside plants they eat and the overhanging branches they nest on are both tied to it.",
    },
  ],

  seo: {
    title: "Hoatzin — Foregut Fermentation, Wing Claws & Classification",
    description:
      "A researched profile of the hoatzin (Opisthocomus hoazin): the only bird that ferments leaves in its crop, why that ruins its flight, the wing-clawed chicks, and its unresolved place in the bird family tree.",
    keywords: [
      "hoatzin facts",
      "opisthocomus hoazin",
      "stinkbird",
      "hoatzin wing claws",
      "bird that ferments leaves",
    ],
  },

  sources: [
    {
      label: "Opisthocomus hoazin — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22684428/264086808",
    },
    {
      label: "Foregut fermentation in the hoatzin, a neotropical leaf-eating bird",
      publisher: "Grajal et al., Science (1989)",
      url: "https://www.science.org/doi/10.1126/science.245.4923.1236",
    },
    {
      label: "Rumen-like methanogens identified from the crop of the hoatzin",
      publisher: "The ISME Journal (2009)",
      url: "https://www.nature.com/articles/ismej200941",
    },
    {
      label: "Hoatzin — conservation and management",
      publisher: "Cornell Lab of Ornithology, Birds of the World",
      url: "https://birdsoftheworld.org/bow/species/hoatzi1/cur/conservation",
    },
    {
      label: "Opisthocomus hoazin species account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Opisthocomus_hoazin/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default hoatzin;
