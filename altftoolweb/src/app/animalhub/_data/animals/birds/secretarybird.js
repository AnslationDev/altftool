// Secretarybird — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const secretarybird = {
  slug: "secretarybird",
  category: "birds",
  name: "Secretarybird",
  scientificName: "Sagittarius serpentarius",
  otherNames: ["Secretary bird", "Sagittarius"],

  summary:
    "An eagle on crane's legs that hunts on foot across African grassland and kills with a kick delivered in fifteen thousandths of a second — and is now Endangered.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Secretary_bird_Mara_for_WC.jpg/1920px-Secretary_bird_Mara_for_WC.jpg",
    alt: "A secretarybird striding across open grassland, grey body, black thighs and long crest quills",
    credit: "Sumeet Moghe / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Day_33_Secretarybird_%28Sagittarius_serpentarius%29_%2853589117196%29.jpg/1920px-Day_33_Secretarybird_%28Sagittarius_serpentarius%29_%2853589117196%29.jpg",
      alt: "A secretarybird standing upright in short grass, bare red-orange face and hooked bill visible",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "A raptor's head on a walker's body",
      caption:
        "Above the neck this is an eagle — hooked bill, forward-facing eyes, bare skin around the face. Below it, the legs are twice the length of any other raptor's, and the family Sagittariidae contains this species alone.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Day_33_Secretarybird_%28Sagittarius_serpentarius%29_chasing_a_locust_..._%2853279225938%29.jpg/1920px-Day_33_Secretarybird_%28Sagittarius_serpentarius%29_chasing_a_locust_..._%2853279225938%29.jpg",
      alt: "A secretarybird lunging forward after a locust with wings partly raised",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Snakes are not the main course",
      caption:
        "The reputation is built on cobras, but insects — grasshoppers, locusts and beetles — make up the bulk of what a secretarybird actually eats, together with rodents, lizards, and the eggs and chicks of ground-nesting birds.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Day_33_Secretarybird_%28Sagittarius_serpentarius%29_foraging_in_tall_grass_..._%2853279401645%29.jpg/1920px-Day_33_Secretarybird_%28Sagittarius_serpentarius%29_foraging_in_tall_grass_..._%2853279401645%29.jpg",
      alt: "A secretarybird walking through tall grass in Kruger National Park, head lowered to the ground",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Twenty kilometres a day",
      caption:
        "Secretarybirds hunt by walking, quartering open ground and flushing prey out of the grass with their feet. A pair may cover 20 to 30 km in a day — which is also why the fragmentation of grassland hits them so hard.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Day_33_Secretarybird_%28Sagittarius_serpentarius%29_foraging_in_tall_grass_..._%2853588210017%29.jpg/1920px-Day_33_Secretarybird_%28Sagittarius_serpentarius%29_foraging_in_tall_grass_..._%2853588210017%29.jpg",
      alt: "A secretarybird part-hidden in long grass, black flight feathers and long tail streamers showing",
      credit: "Bernard DUPONT from FRANCE / Wikimedia Commons",
      title: "Grassland is the whole story",
      caption:
        "The species needs open country it can walk and see across. Conversion of savanna to cropland, overgrazing and the spread of woody scrub have all reduced that, and are the main reason the species was moved to Endangered in 2020.",
    },
  ],

  headline: "The raptor that hunts on foot",
  intro: [
    "The secretarybird looks like a mistake: an eagle's head and hooked bill on a body carried a metre and a third off the ground by grey, scaled legs. It is not a mistake. It is a bird of prey that gave up hunting from the air in favour of walking, and it covers twenty or thirty kilometres of African grassland a day doing it.",
    "The kill is made with the feet, and it has been measured. A trained bird striking a rubber snake hit with a peak force of 195 newtons — about five times its own body weight — with the foot in contact for around fifteen milliseconds. Fast matters as much as hard: a bird that misses a strike at a puff adder does not get many second chances. Despite that formidable arsenal, the species has been assessed as Endangered since 2020, because the grassland it walks across is disappearing.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Accipitriformes",
    family: "Sagittariidae",
    genus: "Sagittarius",
    species: "Sagittarius serpentarius",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2020,
    populationTrend: "decreasing",
    populationEstimate: "Estimated at 6,700–67,000 mature individuals — a wide band reflecting how thinly the species is spread",
    note: "Uplisted to Vulnerable in 2011 and to Endangered in 2020 as survey and citizen-science data across sub-Saharan Africa showed steep and widespread declines. Habitat loss is the dominant driver: conversion of grassland to cropland, overgrazing, and the encroachment of woody scrub into open savanna.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "Up to 1.3 m",
      min: 1.2,
      max: 1.3,
      unit: "m",
    },
    {
      key: "body-length",
      label: "Body length",
      value: "112–150 cm",
      min: 112,
      max: 150,
      unit: "cm",
      note: "Includes the two elongated central tail feathers, which trail well beyond the rest",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "Around 200 cm",
      min: 191,
      max: 220,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "2.3–4.3 kg",
      min: 2.3,
      max: 4.3,
      unit: "kg",
      note: "The sexes are alike in size and plumage, which is unusual for a raptor",
    },
    {
      key: "strike-force",
      label: "Kicking strike force",
      value: "195 N — about five times body weight",
      min: 195,
      max: 195,
      unit: "N",
      note: "Measured by Portugal and colleagues in 2016 using a force plate under a rubber snake struck by a trained bird",
    },
    {
      key: "strike-duration",
      label: "Strike contact time",
      value: "About 15 milliseconds",
      min: 15,
      max: 15,
      unit: "milliseconds",
      note: "Roughly a fiftieth of a human blink; the timing must be judged before the strike, because there is no time to correct it",
    },
    {
      key: "daily-range",
      label: "Distance walked a day",
      value: "20–30 km",
      min: 20,
      max: 30,
      unit: "km",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1–3 eggs",
      min: 1,
      max: 3,
      unit: "eggs",
      note: "All three may fledge in years when food is plentiful",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "42–46 days",
      min: 42,
      max: 46,
      unit: "days",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "Nine to fifteen weeks",
      min: 63,
      max: 105,
      unit: "days",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 19 years recorded in captivity",
      min: 10,
      max: 19,
      unit: "years",
      note: "Wild longevity is poorly known — few populations have been followed long enough",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — insects, rodents, lizards, snakes, birds and their eggs", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "movement", label: "Movement", value: "Hunts entirely on foot; flies mainly to roost and display", icon: "Footprints" },
    { key: "nest-type", label: "Nest type", value: "Broad stick platform on the flat top of a thorn tree", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Monogamous pairs holding very large territories", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Grassland predator of snakes, rodents and locusts", icon: "Crosshair" },
  ],

  highlights: ["height", "strike-force", "strike-duration", "wingspan"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "The Sahel from Senegal to Sudan",
      "The Horn of Africa",
      "East African savanna",
      "Southern Africa to the Cape",
    ],
    habitats: [
      "Open grassland",
      "Savanna with scattered thorn trees",
      "Lightly grazed pasture",
      "Airfields and other open managed ground",
    ],
    elevation: "Sea level to about 3,000 m",
    note: "Endemic to sub-Saharan Africa, from Senegal and Somalia south to the Cape. It avoids dense woodland, mountainous terrain and true desert, and needs open country it can both walk across and see across — so its range contracts as grassland is ploughed or invaded by scrub.",
  },

  sections: [
    {
      id: "kick",
      title: "The kick, measured",
      body: [
        "A secretarybird kills by stamping. It walks up to prey and delivers a rapid downward strike with the foot, usually to the head, then swallows what it has killed whole or tears it apart with the bill.",
        "In 2016 a team led by Steven Portugal put numbers on it. Working with a trained bird at the Hawk Conservancy Trust in Hampshire, they had it strike a rubber snake positioned over a force plate. Peak force reached 195 newtons — roughly five times the bird's own body weight — and, more strikingly, the foot was in contact for only about 15 milliseconds on average.",
        "That combination is the point. Fifteen milliseconds is far too short for the bird to sense the impact and adjust: the whole strike has to be aimed and committed before it lands, using visual information gathered beforehand. The researchers noted that this makes the secretarybird a useful living model for how large, extinct bipedal predators might have used their feet — and it explains why the accuracy is as remarkable as the force. A missed strike at a venomous snake carries a cost the bird cannot afford.",
      ],
    },
    {
      id: "diet",
      title: "What it actually eats",
      body: [
        "The name and the folklore both point at snakes, and the species genuinely does kill and eat them, including venomous ones. But snakes are a minority of the diet. Insects — grasshoppers, locusts, beetles — make up the largest share by number, alongside rodents, lizards, amphibians, and the eggs and chicks of ground-nesting birds. Larger items, including young hares and small tortoises, are taken occasionally.",
        "The hunting method is simple and effective: walk, and disturb. A secretarybird quarters open ground with a deliberate stride, stamping at tussocks to flush whatever is hiding in them, sometimes running after prey with wings half-spread. It will also break apart dung to get at the insects inside, and pairs are frequently seen working the edges of grass fires for animals driven out by the flames.",
        "Where it hunts a snake, the wings come up. The spread wing is generally interpreted as a shield against a strike, and possibly as a distraction, while the bird works around to a position from which it can stamp on the head.",
      ],
    },
    {
      id: "breeding",
      title: "Nesting on a thorn tree",
      body: [
        "Pairs are monogamous and hold very large territories, which they advertise with a rolling, undulating display flight and a deep croaking call — one of the few occasions the species is reliably seen in the air.",
        "The nest is a broad, flat platform of sticks lined with grass, built on top of a thorny acacia and reused and enlarged over years until it may be more than two metres across. One to three eggs are laid, at intervals, and incubated for about six weeks. Both parents feed the chicks by regurgitation, and in good years all three young can fledge — an unusual outcome among raptors, where the youngest chick is often lost.",
        "Young birds stay in the nest for two to three months and are then dependent for some time longer while they learn a hunting technique that requires a great deal of practice to get right.",
      ],
    },
    {
      id: "decline",
      title: "Why it became Endangered",
      body: [
        "The secretarybird's range is enormous, which for a long time masked what was happening inside it. Local surveys and long-running citizen-science schemes in southern and eastern Africa, however, converged on the same picture: steep, sustained declines almost everywhere the species has been counted properly. It was uplisted to Vulnerable in 2011 and to Endangered in 2020.",
        "The cause is chiefly habitat. Grassland and open savanna are being converted to cropland, overgrazed, or lost to bush encroachment as woody plants spread into rangeland. A bird that hunts by walking through open country needs a great deal of it, contiguous — and fences, roads and cultivation break it up.",
        "Secondary pressures add to that: collisions with powerlines and fences, disturbance at nests, capture for the trade in live birds, and secondary poisoning. Its cultural profile is high — the secretarybird appears on the coats of arms of both South Africa and Sudan — which has helped it become a flagship for grassland conservation, though not yet enough to reverse the trend.",
      ],
    },
    {
      id: "name",
      title: "Where the name comes from",
      body: [
        "The popular explanation is that the crest quills at the back of the head resemble the goose-feather pens a nineteenth-century clerk would tuck behind an ear. It is a good story and probably wrong, since the name predates the image.",
        "The Dutch naturalist Arnout Vosmaer, describing a live bird sent from the Cape in the 1760s, recorded that settlers called it 'sagittarius' — archer — for the way it walked, and that farmers who kept it around their homesteads to kill pests called it the 'secretarius'. Vosmaer thought the second word was a corruption of the first. Later scholarship has suggested the reverse, or an origin in an Arabic term for a hunting bird.",
        "The scientific name kept both threads: Sagittarius for the archer, serpentarius for the snakes.",
      ],
    },
  ],

  related: ["common-ostrich", "golden-eagle", "andean-condor"],
  tags: ["raptor", "bird of prey", "africa", "grassland", "endangered"],
  searchTerms: ["sagittarius serpentarius", "secretary bird", "snake killing bird", "kicking bird", "africa raptor"],

  faqs: [
    {
      q: "How hard does a secretarybird kick?",
      a: "A measured study in 2016 recorded a peak strike force of 195 newtons — around five times the bird's own body weight — from a trained bird striking a rubber snake over a force plate. What makes it lethal is the speed as much as the force: the foot was in contact for only about 15 milliseconds, far too short for the bird to correct its aim mid-strike.",
    },
    {
      q: "Do secretarybirds really eat snakes?",
      a: "Yes, including venomous ones, but snakes are a smaller part of the diet than the reputation suggests. Most of what a secretarybird eats is insects — grasshoppers, locusts and beetles — plus rodents, lizards, amphibians and the eggs and chicks of ground-nesting birds.",
    },
    {
      q: "Can secretarybirds fly?",
      a: "Yes, and well — they have a two-metre wingspan and soar readily. They simply choose not to hunt that way. Flight is used mainly to reach the treetop roost and nest each evening and for the undulating territorial display, while all foraging is done on foot, covering 20 to 30 km a day.",
    },
    {
      q: "Why is the secretarybird endangered?",
      a: "Because the open grassland it hunts in is disappearing. Conversion to cropland, overgrazing and the spread of woody scrub into savanna have all reduced the contiguous open country a walking hunter needs. Surveys across sub-Saharan Africa showed steep declines, and the species was moved from Vulnerable to Endangered in 2020.",
    },
    {
      q: "Why is it called a secretarybird?",
      a: "Probably not, despite the popular story, because its crest quills look like pens behind a clerk's ear. Dutch records from the 1760s note that Cape settlers called it 'sagittarius' — archer — for its gait, and that farmers who kept it as a pest-controller called it 'secretarius'. Which name came first, and whether either derives from an Arabic term for a hunting bird, is still argued.",
    },
  ],

  seo: {
    title: "Secretarybird — Kick Force, Diet, Range & Endangered Status",
    description:
      "A researched profile of the secretarybird (Sagittarius serpentarius): the measured 195-newton kicking strike, what it really eats, treetop nesting, and why Africa's walking raptor is now Endangered.",
    keywords: [
      "secretarybird facts",
      "sagittarius serpentarius",
      "secretary bird kick force",
      "snake killing bird",
      "african raptor",
    ],
  },

  sources: [
    {
      label: "Sagittarius serpentarius — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22696221/173647556",
    },
    {
      label: "The fast and forceful kicking strike of the secretary bird",
      publisher: "Portugal et al., Current Biology (2016)",
      url: "https://www.cell.com/current-biology/fulltext/S0960-9822(15)01483-9",
    },
    {
      label: "Secretarybird species account",
      publisher: "The Peregrine Fund",
      url: "https://peregrinefund.org/explore-raptors-species/secretary-bird/secretarybird",
    },
    {
      label: "Secretarybird — regional Red List account",
      publisher: "BirdLife South Africa",
      url: "https://www.birdlife.org.za/red-list/secretarybird/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default secretarybird;
