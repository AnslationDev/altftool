// Great horned owl — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const greatHornedOwl = {
  slug: "great-horned-owl",
  category: "birds",
  name: "Great Horned Owl",
  scientificName: "Bubo virginianus",
  otherNames: ["Tiger owl", "Hoot owl", "Winged tiger"],

  summary:
    "The most widely distributed true owl in the Americas, and the continent's most versatile nocturnal predator — one of the very few animals that regularly kills and eats skunks.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Bubo_virginianus_06.jpg/1920px-Bubo_virginianus_06.jpg",
    alt: "A great horned owl perched in the open, ear tufts raised and yellow eyes forward",
    credit: "Greg Hume / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/A_great_horned_owl_sits_in_a_tree_near_mile_3.2_of_the_park_road_on_June_2%2C_2019._%2851463ff3-2221-47d9-9ae8-7f534291843c%29.JPG/1920px-A_great_horned_owl_sits_in_a_tree_near_mile_3.2_of_the_park_road_on_June_2%2C_2019._%2851463ff3-2221-47d9-9ae8-7f534291843c%29.JPG",
      alt: "A large owl perched on a bare tree branch, body upright and mottled brown-grey",
      credit: "NPS Photo / Emily Mesner / Wikimedia Commons",
      title: "A hunter that waits",
      caption:
        "Great horned owls hunt mostly from a perch, watching and listening from a branch and then dropping onto prey. The mottled plumage is camouflage for exactly this — a bird that must go unnoticed while sitting still for long stretches.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/b3/A_great_horned_owl_%28bc376fcf-1dd8-b71c-0707-b87fe0501c31%29.jpg",
      alt: "A great horned owl perched among branches, facial disc and ear tufts clearly visible",
      credit: "NPS Photo / Wikimedia Commons",
      title: "The face is an ear",
      caption:
        "The stiff ring of feathers around each eye forms a facial disc that funnels sound towards the ear openings. The prominent tufts on the head, despite the name, have nothing to do with hearing — they are display and camouflage.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/40/%22Baba%22_--_Great_horned_owlet_%2849945429892%29.jpg",
      alt: "A downy great horned owlet, pale grey and fluffy, with dark eyes and a small bill",
      credit: "Channel City Camera Club from Santa Barbara, US / Wikimedia Commons",
      title: "Hatched in midwinter",
      caption:
        "Great horned owls lay earlier than almost any other North American bird, often in January or February. Owlets like this one leave the nest at about five weeks and spend months more being fed while they learn to hunt.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/004_Great_horned_owl_under_a_Pink_Ip%C3%AA_tree_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg/1920px-004_Great_horned_owl_under_a_Pink_Ip%C3%AA_tree_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg",
      alt: "A great horned owl on the ground beneath a flowering pink tree in Brazilian wetland habitat",
      credit: "Giles Laurent / Wikimedia Commons",
      title: "The same owl, a hemisphere away",
      caption:
        "This bird is in the Brazilian Pantanal. The species runs from the Arctic treeline to southern South America, taking in desert, rainforest edge, wetland and suburb — a range wider than any other true owl in the Americas.",
    },
  ],

  headline: "The most adaptable owl in the Americas",
  intro: [
    "The great horned owl occupies more of the Americas than any other true owl. It nests on Alaskan riverbanks and in Brazilian wetlands, in Arizona saguaros and in city parks, and its diet shifts with each — rabbits and hares in one place, rats and voles in another, ducks, herons, other owls, snakes, frogs and beetles wherever they are common. More than 250 prey species have been recorded.",
    "Early naturalists called it the winged tiger, and the reputation is earned rather than decorative. It routinely takes prey heavier than itself, is one of the very few predators that will kill a skunk, and hunts in near silence: the leading edge of its flight feathers is combed into a fringe that breaks up the rush of air over the wing.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Strigiformes",
    family: "Strigidae",
    genus: "Bubo",
    species: "Bubo virginianus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2018,
    populationTrend: "slow long-term decline across North America; secure overall",
    populationEstimate: "Partners in Flight estimates a global breeding population of about 5.7 million",
    note: "Listed as Least Concern on the strength of an enormous range and a very large population. North American breeding bird surveys nonetheless show a steady decline since the 1960s, and a nocturnal, early-nesting, thinly spread bird is poorly covered by the surveys that produce those numbers.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "46–64 cm",
      min: 46,
      max: 64,
      unit: "cm",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "91–153 cm",
      min: 91,
      max: 153,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "0.9–2.5 kg",
      min: 0.9,
      max: 2.5,
      unit: "kg",
      note: "Females are 10–20% larger than males, as in most birds of prey",
    },
    {
      key: "prey-diversity",
      label: "Recorded prey species",
      value: "Over 250 species",
      min: 250,
      max: 250,
      unit: "species",
      note: "From beetles and scorpions to geese, herons, porcupines and other owls",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1–4 eggs, usually 2",
      min: 1,
      max: 4,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "30–37 days",
      min: 30,
      max: 37,
      unit: "days",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "Flying at about 9–10 weeks",
      min: 63,
      max: 70,
      unit: "days",
      note: "Owlets clamber out onto branches from around five weeks old, well before they can fly",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 13 years in the wild",
      min: 13,
      max: 28,
      unit: "years",
      note: "A wild bird has been recovered at 28 years; captive owls have reached their thirties",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mammals, birds, reptiles, amphibians and insects", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Nocturnal and crepuscular", icon: "Moon" },
    { key: "nest-type", label: "Nest type", value: "None built — takes over an old stick nest, a cliff ledge or a broken snag", icon: "Home" },
    { key: "breeding-season", label: "Breeding season", value: "Lays in midwinter, often January or February", icon: "Snowflake" },
    { key: "social-structure", label: "Social structure", value: "Territorial pairs that stay together year-round", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Dominant nocturnal predator; a regular predator of skunks", icon: "Crosshair" },
  ],

  highlights: ["wingspan", "weight", "prey-diversity", "activity"],

  distribution: {
    continents: ["North America", "South America"],
    regions: [
      "Alaska and northern Canada",
      "The contiguous United States",
      "Mexico and Central America",
      "The Andes and northern South America",
      "The Brazilian Pantanal and Argentine grasslands",
    ],
    habitats: [
      "Deciduous and coniferous forest",
      "Desert and scrub",
      "Grassland and savanna",
      "Wetland margins",
      "Suburbs and city parks",
    ],
    elevation: "Sea level to over 4,000 m in the Andes",
    note: "Found from the Arctic treeline to southern South America, and largely absent only from the deep interior of the Amazon Basin and the highest, coldest ground. Northern birds are pale and heavy, desert birds small and sandy, and tropical birds darker — one of the widest ranges of regional variation in any owl.",
  },

  sections: [
    {
      id: "hunting",
      title: "Silence and sound",
      body: [
        "A great horned owl hunts mainly by waiting. It sits on a perch — a fence post, a branch, a lamp standard — watching and listening, then glides down onto whatever moves below. Prey is usually killed by the feet rather than the bill; the grip is strong enough to hold animals two or three times the owl's own weight.",
        "Two adaptations make that work in the dark. The first is hearing: a stiff disc of feathers around each eye acts as a reflector, funnelling faint sound towards the ear openings, so a rodent moving under snow or leaf litter can be located without being seen. The second is silence. The leading edge of the outer flight feathers is serrated into a comb, and the trailing edge is fringed, which breaks up the turbulence that makes a bird's wingbeat audible. The owl hears its prey; the prey does not hear the owl.",
        "The ear tufts, despite the name, have nothing to do with hearing at all. They are display and camouflage — raised in threat, and useful for breaking the round outline of a head against a tree trunk.",
      ],
    },
    {
      id: "diet",
      title: "An unusually wide menu",
      body: [
        "Rabbits and hares are the preferred prey across most of the range, followed by rats, mice and voles. Beyond that the list becomes remarkable: ducks, geese, herons, grouse, crows, snakes, frogs, fish, scorpions, large beetles, and other birds of prey up to the size of an osprey. Barn owls and smaller owls are taken regularly enough to shape where those species can breed.",
        "The species is also one of the few consistent predators of skunks. Birds have a poor sense of smell relative to mammals, and a great horned owl will take a skunk without apparent difficulty — nests and roosts of birds that have been eating them can reportedly be smelt from a distance.",
        "Because prey is so varied, populations track local abundance closely. In the boreal forest, great horned owl numbers rise and fall behind the snowshoe hare cycle with a lag of a year or two.",
      ],
    },
    {
      id: "breeding",
      title: "Nesting in the cold",
      body: [
        "Great horned owls build nothing. They take over the old stick nest of a red-tailed hawk, crow, heron or eagle, or use a cliff ledge, a cave, a broken-off tree snag or, in deserts, a hole in a large cactus. Where they take a hawk's nest, they are usually finished with it before the hawk needs it back.",
        "Laying is extraordinarily early — often January or February, sometimes with snow on the sitting bird. Two eggs is typical. The female does nearly all the incubation while the male hunts for both, and the timing means the young are independent by late summer, with a full season of good hunting ahead of them before their first winter.",
        "Owlets leave the nest at about five weeks, long before they can fly, and scramble about on nearby branches — the stage sometimes called 'branching'. They fly at nine or ten weeks and are fed by their parents for months afterwards.",
      ],
    },
    {
      id: "eagle-owl",
      title: "The Old World counterpart",
      body: [
        "Ornithologists routinely compare the great horned owl with the Eurasian eagle-owl, Bubo bubo, which fills the same role across Europe and Asia and is a close relative — although the eagle-owl is markedly larger. The genus reached the Americas across the Bering land bridge, and the current view is that the snowy owl and the horned owls separated while still in Eurasia, with the snowy owl later spreading across the Arctic independently.",
        "There is a second, daytime comparison that is just as useful. The red-tailed hawk shares much of the great horned owl's habitat, prey and nest sites, and often literally its nest — one hunting the same ground by day that the other hunts by night.",
      ],
    },
    {
      id: "threats",
      title: "Living alongside people",
      body: [
        "The great horned owl is not a species in trouble, and its adaptability is why. It nests in suburbs and city parks, hunts rats and rabbits along road verges, and tolerates habitat change that displaces more specialised owls.",
        "The pressures it does face are mostly incidental: collisions with vehicles, electrocution on power poles, secondary poisoning from rodenticides eaten by its prey, and shooting. North American survey data show a slow, sustained decline over the past half-century, though a nocturnal bird that nests in midwinter and lives at low density is among the hardest of all species to count reliably.",
      ],
    },
  ],

  related: ["snowy-owl", "barn-owl", "golden-eagle"],
  tags: ["owl", "bird of prey", "nocturnal", "raptor", "urban wildlife"],
  searchTerms: ["bubo virginianus", "tiger owl", "hoot owl", "horned owl", "big owl"],

  faqs: [
    {
      q: "How strong is a great horned owl?",
      a: "Strong enough to kill and carry prey heavier than itself. The kill is made with the feet rather than the bill, and the species regularly takes animals two to three times its own weight — porcupines, skunks, geese and other birds of prey among them. That is unusual even for an owl, and it is the source of the old nickname 'winged tiger'.",
    },
    {
      q: "Why do great horned owls nest in the middle of winter?",
      a: "Laying in January or February means the owlets hatch in late winter and are hunting for themselves by late summer, with a full season of good conditions before their first winter. It also means the pair claims the best nest sites — usually old hawk, crow or heron nests — before the birds that built them need them back.",
    },
    {
      q: "Do great horned owls really eat skunks?",
      a: "Yes, and they are among the very few predators that do so regularly. Birds have a much weaker sense of smell than mammals, so the skunk's main defence has little effect on them. Roosts and nests of owls that have been feeding on skunks are reportedly detectable by scent.",
    },
    {
      q: "What are the 'horns' on a great horned owl?",
      a: "Tufts of feathers, not ears and not horns. They are used in display and in camouflage — raised when the bird is threatening a rival, and useful for breaking up the round silhouette of the head against a tree. The actual ear openings are hidden at the edges of the facial disc, the ring of stiff feathers that funnels sound towards them.",
    },
    {
      q: "Where do great horned owls live?",
      a: "Across almost the whole of the Americas — from the Arctic treeline in Alaska and Canada, through the United States, Mexico and Central America, and down into South America as far as Argentina. They occupy forest, desert, grassland, wetland edge and city parks alike, and are missing only from the deep interior of the Amazon and the coldest high ground.",
    },
  ],

  seo: {
    title: "Great Horned Owl — Size, Hunting, Diet & Nesting",
    description:
      "A researched profile of the great horned owl (Bubo virginianus): silent flight, the facial disc, over 250 recorded prey species, midwinter nesting and the widest range of any true owl in the Americas.",
    keywords: [
      "great horned owl facts",
      "bubo virginianus",
      "great horned owl size",
      "owl silent flight",
      "great horned owl diet",
    ],
  },

  sources: [
    {
      label: "Bubo virginianus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/61752071/132039486",
    },
    {
      label: "Great Horned Owl species account",
      publisher: "The Peregrine Fund",
      url: "https://peregrinefund.org/explore-raptors-species/owls/great-horned-owl",
    },
    {
      label: "Great Horned Owl (Bubo virginianus)",
      publisher: "The Owl Pages",
      url: "https://www.owlpages.com/owls/species.php?s=1220",
    },
    {
      label: "Great Horned Owl field guide entry",
      publisher: "National Audubon Society",
      url: "https://www.audubon.org/field-guide/bird/great-horned-owl",
    },
    {
      label: "Great Horned Owl life history",
      publisher: "Cornell Lab of Ornithology, All About Birds",
      url: "https://www.allaboutbirds.org/guide/Great_Horned_Owl/lifehistory",
    },
  ],

  updatedAt: "2026-07-29",
};

export default greatHornedOwl;
