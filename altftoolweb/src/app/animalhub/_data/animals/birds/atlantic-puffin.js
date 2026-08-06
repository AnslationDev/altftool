// Atlantic puffin — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const atlanticPuffin = {
  slug: "atlantic-puffin",
  category: "birds",
  name: "Atlantic Puffin",
  scientificName: "Fratercula arctica",
  otherNames: ["Common puffin", "Sea parrot", "Clown of the sea"],

  summary:
    "A small North Atlantic seabird that swims with its wings, nests down a burrow, carries a dozen fish crosswise in its bill, and sheds the famous coloured beak plates every winter.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Puffin_%28Fratercula_arctica%29.jpg/1920px-Puffin_%28Fratercula_arctica%29.jpg",
    alt: "An Atlantic puffin standing on a clifftop, red-and-black breeding bill and orange feet visible",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Atlantic_puffin_%28Fratercula_arctica%29_-_Flickr_-_Gregory_%22Slobirdr%22_Smith.jpg/1920px-Atlantic_puffin_%28Fratercula_arctica%29_-_Flickr_-_Gregory_%22Slobirdr%22_Smith.jpg",
      alt: "A puffin holding a row of small silvery fish crosswise in its bill",
      credit: "Gregory \"Slobirdr\" Smith / Wikimedia Commons",
      title: "How the bill holds a dozen fish",
      caption:
        "Backward-pointing spines on the roof of the mouth and a muscular, hinged tongue pin each caught fish against the upper mandible, so the puffin can keep hunting with a full load. Around ten fish is typical; the British record is 62.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Atlantic_puffin_%28Fratercula_arctica%29_at_Fowlsheugh_nature_reserve_01.jpg/1920px-Atlantic_puffin_%28Fratercula_arctica%29_at_Fowlsheugh_nature_reserve_01.jpg",
      alt: "An Atlantic puffin standing upright on a grassy sea cliff in Scotland",
      credit: "Thomas Fuhrmann / Wikimedia Commons",
      title: "Colonies on the cliff edge",
      caption:
        "Puffins nest in dense colonies on islands and clifftops with soft turf they can dig, and almost always where there are no ground predators. The upright stance is typical of the auks, the family that also includes guillemots and razorbills.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Atlantic_Puffin_%28Lunde%29_%28Fratercula_arctica%29_-_%C3%98ksnes%2C_Norway_2023-07-14.jpg",
      alt: "A puffin photographed in Norway, showing its black back, white underparts and grey cheek patches",
      credit: "Ryan Hodnett / Wikimedia Commons",
      title: "Countershaded for the water",
      caption:
        "Dark above and white below, the puffin is hard to see from the air against dark water and hard to see from below against the bright surface. It spends most of the year at sea, coming to land only to breed.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Atlantic_puffin_%28Fratercula_arctica%29_at_Fowlsheugh_nature_reserve_02.jpg/1920px-Atlantic_puffin_%28Fratercula_arctica%29_at_Fowlsheugh_nature_reserve_02.jpg",
      alt: "Close view of a puffin's head showing the deep triangular bill with red, yellow and blue-grey bands",
      credit: "Thomas Fuhrmann / Wikimedia Commons",
      title: "A beak that is taken off each winter",
      caption:
        "The bright plates and the orange rosette at the gape are breeding ornaments. They are shed after the season, leaving a narrower, duller bill, and are regrown the following spring — a bird seen in February looks like a different species.",
    },
  ],

  headline: "A seabird that flies underwater",
  intro: [
    "The Atlantic puffin spends most of its life far out at sea, out of sight of land, and comes ashore only to breed. Underwater it does not paddle: it flies, beating its short wings and steering with its feet, hunting sandeels, herring and capelin within the top few tens of metres of the water column.",
    "It is also a bird that changes appearance twice a year. The red, yellow and blue-grey plates that make the breeding bill so recognisable are shed each autumn, along with the orange rosettes at the corners of the mouth, leaving a smaller and far duller beak until spring. Despite a huge range and a population in the millions, the species is assessed as Vulnerable — colonies across large parts of its range have fallen sharply.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Charadriiformes",
    family: "Alcidae",
    genus: "Fratercula",
    species: "Fratercula arctica",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2018,
    populationTrend: "decreasing",
    populationEstimate: "Roughly 12–14 million mature individuals, the great majority of them in Iceland and Norway",
    note: "Listed as Vulnerable because of rapid declines in the European core of its range, which holds most of the world population. Europe was assessed separately under the European Red List of Birds in 2021. The UK has lost close to a quarter of its puffins in twenty years, driven largely by shortages of the small fish the chicks depend on.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "26–33 cm",
      min: 26,
      max: 33,
      unit: "cm",
      note: "About the size of a crow, and much smaller than most people expect",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "47–63 cm",
      min: 47,
      max: 63,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "320–540 g",
      min: 320,
      max: 540,
      unit: "g",
      note: "Northern birds are distinctly larger than those breeding further south",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "Usually within 15 m of the surface; recorded to about 60 m",
      min: 15,
      max: 60,
      unit: "m",
    },
    {
      key: "dive-duration",
      label: "Maximum dive time",
      value: "Typically 20–30 seconds, occasionally about a minute",
      min: 0.5,
      max: 1,
      unit: "minutes",
    },
    {
      key: "wingbeat-rate",
      label: "Wingbeat rate",
      value: "About 400 beats a minute in flight",
      min: 6.7,
      max: 6.7,
      unit: "beats/second",
      note: "Short, stiff wings that work underwater are inefficient in air, so level flight demands a very rapid beat",
    },
    {
      key: "fish-per-load",
      label: "Fish carried per trip",
      value: "Around 10 at a time; a British record of 62",
      min: 10,
      max: 62,
      unit: "fish",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1 egg",
      min: 1,
      max: 1,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "36–45 days",
      min: 36,
      max: 45,
      unit: "days",
      note: "Shared by both parents",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "38–44 days",
      min: 38,
      max: 44,
      unit: "days",
      note: "The chick leaves at night, alone, and walks or flutters to the sea",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 5 years",
      min: 3,
      max: 6,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Commonly over 20 years",
      min: 20,
      max: 30,
      unit: "years",
      note: "Ringed wild birds of more than 30 years have been recovered",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — small shoaling fish, especially sandeels, herring and capelin", icon: "Fish" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "Burrow dug in clifftop turf, or a crevice among boulders", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Dense breeding colonies; solitary and dispersed at sea", icon: "Users" },
    { key: "migration", label: "Movement", value: "Winters far offshore, out of sight of land", icon: "Waves" },
    { key: "ocean-range", label: "Ocean range", value: "North Atlantic and adjoining Arctic waters", icon: "Globe" },
  ],

  highlights: ["dive-depth", "fish-per-load", "weight", "wingspan"],

  distribution: {
    continents: ["Europe", "North America"],
    regions: [
      "Iceland",
      "Norway and the Barents Sea",
      "Faroe Islands",
      "Britain and Ireland",
      "Greenland",
      "Newfoundland and Labrador",
      "Maine and the Gulf of Maine",
    ],
    habitats: [
      "Offshore islands",
      "Grassy sea cliffs",
      "Boulder scree",
      "Open ocean",
    ],
    elevation: "Sea level; forages in the upper water column",
    note: "The only puffin in the Atlantic — the tufted and horned puffins are Pacific birds. Breeding runs from Arctic Russia and Svalbard south to Brittany in the east and Maine in the west, with Iceland alone holding a large share of the world total. Outside the breeding season the birds scatter across the open North Atlantic.",
  },

  sections: [
    {
      id: "swimming",
      title: "Flying underwater",
      body: [
        "Auks solve a problem that most seabirds avoid: they use the same wings for air and for water. A puffin dives by beating its wings, using the feet as rudders, and can work the top few tens of metres of the water column for shoaling fish. Most dives are brief — twenty or thirty seconds — and shallow, though the species has been recorded to around 60 m.",
        "The compromise shows in the air. Short, stiff, high-loading wings are excellent underwater and poor at generating lift, so a puffin in level flight must beat them roughly 400 times a minute and lands with the ungainly skid that gives it half its nicknames. Taking off from flat water usually requires a running start across the surface.",
      ],
    },
    {
      id: "bill",
      title: "The bill, and what it is for",
      body: [
        "A puffin can hold a row of fish crosswise in its bill and keep fishing. Backward-pointing spines on the palate and a muscular tongue hold each catch against the upper mandible, so the load builds up without the earlier fish being dropped. A typical bill-load is around ten small fish; the British record, from a bird carrying sandeels, is 62.",
        "The colour is seasonal. The deep, triangular breeding bill is built from bright horny plates that are shed after the season along with the orange rosettes at the gape and the ornamental eye scales, leaving a narrower, duller beak through the winter. Grey winter cheeks complete the change: the bird photographed on a clifftop in June and the bird at sea in January look barely related.",
        "The plates also record age. Grooves accumulate on the bill as a puffin matures, which lets researchers separate young breeders from old ones in the hand.",
      ],
    },
    {
      id: "breeding",
      title: "A burrow, one egg, and a night departure",
      body: [
        "Puffins breed in colonies on islands and clifftops, almost always where there are no ground predators. A pair digs a burrow a metre or more into soft turf, using the bill to cut and the feet to shovel, or takes over a rabbit hole or a crevice among boulders. Pairs are long-lasting and return to the same burrow year after year.",
        "One egg is laid, and both parents incubate it for around six weeks. The chick — the puffling — is fed whole fish in the burrow for about six more, and then something unusual happens: the parents stop coming. The chick waits, loses weight, and eventually leaves the burrow alone at night, walking and fluttering down to the sea. It will not return to land for several years.",
        "That night departure is why light pollution matters on puffin islands. Fledglings orient towards the brightest horizon, and in places such as the Westman Islands in Iceland town lights draw them inland, where local children collect them and release them at the shore.",
      ],
    },
    {
      id: "food",
      title: "Chicks, sandeels and warming seas",
      body: [
        "Puffin chicks need small, oily, energy-dense fish — sandeels above all, with herring, capelin and sprat depending on the region. Adults can switch to less nourishing prey when they must; chicks cannot easily be raised on it.",
        "This is the mechanism behind most of the recent declines. Warming water has shifted the distribution and timing of sandeels and capelin in parts of the North Atlantic, and industrial fishing has taken them directly. Where the fish fail, adults return with loads that are too small or of the wrong species, chicks fledge underweight or not at all, and a colony's output collapses long before its adult numbers visibly fall.",
        "Because puffins are long-lived and breed slowly — one egg a year, first breeding at around five — a run of failed seasons can hollow out a colony's future while it still looks busy.",
      ],
    },
    {
      id: "conservation",
      title: "Losses and restorations",
      body: [
        "Puffins were harvested heavily for food and feathers into the nineteenth century, and introduced rats and cats wiped out colonies on islands that had never had ground predators. Both pressures have eased in most of the range, and predator eradication on seabird islands is now a well-established conservation tool.",
        "The best-known restoration is Project Puffin in Maine, begun in the 1970s, which moved chicks from Newfoundland to islands where the species had been shot out and used decoys and recorded calls to persuade returning birds to settle. It worked, and the same social-attraction technique has since been used for seabirds worldwide.",
        "The current threats are harder to fix by fencing an island. Food shortage driven by warming seas and fishery competition, oil pollution, gill-net entanglement and plastic ingestion all act at sea, across international waters, which is why the species is listed as Vulnerable despite a population still counted in the millions.",
      ],
    },
  ],

  related: ["emperor-penguin", "wandering-albatross", "snowy-owl"],
  tags: ["seabird", "auk", "marine", "colonial nester", "vulnerable"],
  searchTerms: ["fratercula", "sea parrot", "puffling", "clown of the sea", "puffin beak"],

  faqs: [
    {
      q: "How many fish can a puffin hold in its beak?",
      a: "Around ten small fish is typical, and the British record is 62 sandeels in a single bill-load. Backward-pointing spines on the roof of the mouth and a muscular tongue hold each fish against the upper mandible, so the bird can keep catching more without dropping what it already has.",
    },
    {
      q: "Do puffins lose their colourful beaks?",
      a: "Yes. The bright red, yellow and blue-grey plates, along with the orange rosettes at the corners of the mouth and the ornamental scales around the eye, are breeding ornaments. They are shed after the season, leaving a narrower and much duller bill, and are regrown the following spring. Winter birds also have grey rather than white cheeks.",
    },
    {
      q: "How deep can an Atlantic puffin dive?",
      a: "Most feeding dives are shallow — within about 15 m of the surface and lasting twenty to thirty seconds — but the species has been recorded down to roughly 60 m. Puffins swim by beating their wings underwater and steering with their feet, which is also why their flight in air is so laboured.",
    },
    {
      q: "Why are Atlantic puffins Vulnerable if there are millions of them?",
      a: "Because the trend matters more than the total. Most of the world's puffins breed in Europe, and colonies across large parts of that core have declined rapidly, largely through shortages of the small oily fish chicks need. A species that lays one egg a year and does not breed until about five years old cannot absorb repeated failed seasons quickly.",
    },
    {
      q: "Where do puffins go in winter?",
      a: "Out to sea. Once the breeding season ends they disperse across the open North Atlantic, often hundreds of kilometres from land, and do not come ashore at all until the following spring. Young birds that fledge in summer stay at sea for several years before returning to a colony to breed.",
    },
  ],

  seo: {
    title: "Atlantic Puffin — Bill, Diving, Burrows & Conservation",
    description:
      "A researched profile of the Atlantic puffin (Fratercula arctica): how it flies underwater, why it can carry a dozen fish at once, the seasonal beak, burrow nesting and why it is listed as Vulnerable.",
    keywords: [
      "atlantic puffin facts",
      "fratercula arctica",
      "puffin beak",
      "puffin diving depth",
      "puffling",
    ],
  },

  sources: [
    {
      label: "Fratercula arctica — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22694927/132581443",
    },
    {
      label: "Atlantic Puffin — conservation and management",
      publisher: "Cornell Lab of Ornithology, Birds of the World",
      url: "https://birdsoftheworld.org/bow/species/atlpuf/cur/conservation",
    },
    {
      label: "Atlantic Puffin field guide entry",
      publisher: "National Audubon Society",
      url: "https://www.audubon.org/field-guide/bird/atlantic-puffin",
    },
    {
      label: "Fratercula arctica species account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Fratercula_arctica/",
    },
    {
      label: "Puffin — species guide and UK population",
      publisher: "Royal Society for the Protection of Birds",
      url: "https://www.rspb.org.uk/birds-and-wildlife/puffin",
    },
  ],

  updatedAt: "2026-07-29",
};

export default atlanticPuffin;
