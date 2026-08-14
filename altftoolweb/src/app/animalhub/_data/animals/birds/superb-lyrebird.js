// Superb lyrebird — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const superbLyrebird = {
  slug: "superb-lyrebird",
  category: "birds",
  name: "Superb Lyrebird",
  scientificName: "Menura novaehollandiae",
  otherNames: ["Lyrebird", "Superb lyre-bird"],

  summary:
    "One of the world's largest songbirds, whose males spend four fifths of their song imitating other birds — and which shifts more soil than any other digging animal in Australian forest.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Superb_lyrbird_in_scrub.jpg",
    alt: "A superb lyrebird standing in forest undergrowth, long filamentary tail trailing behind",
    credit: "Fir0002 / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/CSIRO_ScienceImage_10356_Superb_Lyrebird.jpg/1920px-CSIRO_ScienceImage_10356_Superb_Lyrebird.jpg",
      alt: "A superb lyrebird on the forest floor at Mt Buffalo, Victoria, brown plumage and long tail visible",
      credit: "John Manger, CSIRO / Wikimedia Commons",
      title: "A songbird the size of a chicken",
      caption:
        "At around a kilogram, the superb lyrebird is among the largest passerines alive. Despite the size it is a true songbird, with the same complex vocal organ — the syrinx — that a wren or a thrush uses, and unusually flexible muscular control over it.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/CSIRO_ScienceImage_10357_Superb_Lyrebird_Mt_Buffalo_Victoria.jpg/1920px-CSIRO_ScienceImage_10357_Superb_Lyrebird_Mt_Buffalo_Victoria.jpg",
      alt: "A superb lyrebird foraging among leaf litter in Victorian forest",
      credit: "John Manger, CSIRO / Wikimedia Commons",
      title: "Raking the forest floor",
      caption:
        "Lyrebirds feed by scratching through litter and soil with heavy clawed feet, taking worms, beetles, spiders and centipedes. Doing so, they move around 156 tonnes of litter and soil per hectare each year — more than any other digging animal studied in these forests.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Superb_Lyrebird_%28Menura_novaehollandiae%29_%2830571971863%29.jpg/1920px-Superb_Lyrebird_%28Menura_novaehollandiae%29_%2830571971863%29.jpg",
      alt: "A superb lyrebird in the open with its long tail feathers held low behind it",
      credit: "Dominic Sherony / Wikimedia Commons",
      title: "The tail, most of the time",
      caption:
        "For all but a few seconds of display, the male's sixteen tail feathers trail behind him as an inconvenience. Only in the courtship display are they thrown forward over the head, where the filamentaries form a shimmering silvery canopy.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Superb_Lyrebird_%28Menura_novaehollandiae%29_%288079617147%29.jpg",
      alt: "A superb lyrebird standing among ferns and forest litter",
      credit: "Ron Knight from Seaford, East Sussex, United Kingdom / Wikimedia Commons",
      title: "Wet forest specialist",
      caption:
        "The species needs deep, damp leaf litter to feed in, which ties it to the wet eucalypt forests and rainforest gullies of south-eastern Australia. Over 40% of that habitat burned in the 2019–20 fires.",
    },
  ],

  headline: "The forest's best impersonator",
  intro: [
    "A male superb lyrebird singing in winter is producing, for the most part, other birds. Around 80% of his song is mimicry, and an individual will have mastered the calls of twenty to twenty-five species — whipbirds, kookaburras, currawongs, shrike-thrushes, cockatoos — accurately enough that the birds being copied cannot always tell.",
    "The famous chainsaws and camera shutters need a caveat. Those recordings come overwhelmingly from captive birds, including a much-filmed male at Adelaide Zoo who learned building-site noise during construction work, and there is no known recording of a wild lyrebird imitating machinery. What wild birds copy is the forest around them. Away from the singing, the species turns out to be one of the most consequential animals in that forest: raking for food, a lyrebird moves more soil and litter per hectare than any other digging animal recorded there.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Passeriformes",
    family: "Menuridae",
    genus: "Menura",
    species: "Menura novaehollandiae",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2018,
    populationTrend: "stable, but reassessment is warranted after the 2019–20 fires",
    populationEstimate: "No global figure; common across a large range in south-eastern Australia",
    note: "Listed as Least Concern, and common across a wide range that includes a thriving introduced population in Tasmania. That assessment predates the 2019–20 Australian bushfires, in which about 41.5% of the species' habitat — some 2.1 million hectares — burned at varying severity. Foraging was found to be almost entirely absent from high-severity burn sites afterwards, except in rainforest.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "Males 80–100 cm including the tail; females 74–84 cm",
      min: 74,
      max: 100,
      unit: "cm",
    },
    {
      key: "tail-length",
      label: "Tail length",
      value: "Male's tail 50–60 cm",
      min: 0.5,
      max: 0.6,
      unit: "m",
      note: "Sixteen feathers: two broad lyrates, twelve fine filamentaries and two narrow medians",
    },
    {
      key: "weight",
      label: "Weight",
      value: "About 0.9–1.1 kg",
      min: 0.9,
      max: 1.1,
      unit: "kg",
      note: "Males average around 975 g; among the heaviest of all songbirds",
    },
    {
      key: "song-mimicry",
      label: "Share of song that is mimicry",
      value: "About 80%",
      min: 80,
      max: 80,
      unit: "%",
    },
    {
      key: "mimicry-repertoire",
      label: "Species imitated by one male",
      value: "20–25 bird species",
      min: 20,
      max: 25,
      unit: "species",
    },
    {
      key: "soil-turnover",
      label: "Litter and soil moved",
      value: "About 156 tonnes per hectare a year",
      min: 155.7,
      max: 155.7,
      unit: "t/ha/year",
      note: "Measured over twelve months in Victorian forest; more than any other digging animal recorded there",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1 egg",
      min: 1,
      max: 1,
      unit: "eggs",
      note: "Mean fresh weight about 62 g — nearly twice what a passerine of this size would be expected to lay",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 50 days",
      min: 43,
      max: 53,
      unit: "days",
      note: "Roughly three times as long as expected for a passerine of this size, and done by the female alone",
    },
    {
      key: "fledging",
      label: "Fledging",
      value: "Six to ten weeks in the nest",
      min: 42,
      max: 70,
      unit: "days",
      note: "The young bird then depends on its mother for months afterwards",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 20 years",
      min: 15,
      max: 20,
      unit: "years",
      note: "Males do not acquire a full display tail until around six or seven years old",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Insectivore — worms, beetles, spiders, centipedes and other soil invertebrates", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Diurnal; roosts high in trees at night", icon: "Sun" },
    { key: "nest-type", label: "Nest type", value: "Large domed nest of sticks and moss with a side entrance", icon: "Home" },
    { key: "breeding-season", label: "Breeding season", value: "Displays and lays in the southern winter, June to October", icon: "Snowflake" },
    { key: "social-structure", label: "Social structure", value: "Males display alone on earth mounds; females raise the chick unaided", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Ecosystem engineer — the dominant soil-turning animal of its forests", icon: "Recycle" },
  ],

  highlights: ["song-mimicry", "mimicry-repertoire", "incubation", "soil-turnover"],

  distribution: {
    continents: ["Australia"],
    regions: [
      "Southern Victoria",
      "New South Wales",
      "South-eastern Queensland",
      "Southern Tasmania (introduced)",
    ],
    habitats: [
      "Wet eucalypt forest",
      "Temperate and subtropical rainforest",
      "Fern gullies",
      "Damp sclerophyll woodland",
    ],
    elevation: "Sea level to montane forest",
    note: "Endemic to the forests of south-eastern Australia, from southern Victoria to south-eastern Queensland. A population introduced to southern Tasmania between 1934 and 1954 — on ill-founded fears that the mainland birds were about to disappear — is now thriving and expanding. Lyrebirds are sedentary, with home ranges of a few kilometres.",
  },

  sections: [
    {
      id: "mimicry",
      title: "What lyrebirds actually copy",
      body: [
        "The mimicry is real and it is extraordinary. Around 80% of a male's song during the winter display season consists of imitations of other species, and one bird typically commands the calls of twenty to twenty-five. The copies are close enough that in playback tests the model species has not reliably distinguished a lyrebird's rendition of a grey shrike-thrush from the real thing. Males also reproduce non-vocal sounds made by other birds — wingbeats, bill-clapping — and string the whole repertoire together in fast sequences.",
        "The chainsaw is the part that needs care. There is no known recording of a wild lyrebird mimicking a chainsaw, camera shutter, car alarm or human speech. The celebrated examples are captive birds: two of the three lyrebirds in the best-known television sequence were captives, one from Healesville Sanctuary and one — a male called Chook, who died in 2011 — from Adelaide Zoo, where he had picked up hammers, drills and saws during construction work.",
        "Part of the confusion is that lyrebirds sound mechanical anyway. A large share of their own species-specific vocabulary consists of twanging, clicking, thudding and whirring noises that are not imitations of anything, and a listener who assumes every strange sound is mimicry will hear machinery that was never there.",
      ],
    },
    {
      id: "display",
      title: "The display",
      body: [
        "In early winter a male clears and builds a set of earth mounds within his territory and sings from them, sometimes for hours. When a female approaches, he throws his tail forward over his head: the two broad lyrate feathers frame the display and the twelve fine filamentaries fall over his back and head as a shimmering silver canopy, through which he continues to sing while shuffling and stamping in place.",
        "Research on wild birds has shown that the mimicry is not deployed at random. During perched 'recital' singing, males mimic the songs and ordinary calls of other species. During the visually conspicuous mound dance, they switch to mimicking alarm calls — and at the moment of copulation a male produces a dense imitation of an entire mobbing flock, several species at once, an acoustic illusion of danger that appears to keep the female in place.",
        "Learning it takes years. A young male's mimicry is rough, improves with practice, and he does not grow a full adult display tail until around six or seven — so the song is a fairly honest signal of how long its owner has managed to stay alive.",
      ],
    },
    {
      id: "breeding",
      title: "One egg, fifty days",
      body: [
        "Lyrebird reproduction is slow even by the standards of large birds. The female builds a large domed nest of sticks, bark, moss and fern fronds, with a side entrance, anywhere from ground level to high in a tree, and lays a single egg — mean fresh weight about 62 grams, close to twice what a passerine of her size would be expected to produce.",
        "She then incubates it alone for roughly fifty days, one of the longest incubation periods of any songbird and about three times what a passerine of this size would normally take. The male contributes nothing beyond his display. The chick stays in the nest for six to ten weeks and depends on its mother for months after that.",
        "One egg a year, raised by one parent, over a season lasting most of the year — this is a slow-life-history bird, and it recovers from losses correspondingly slowly.",
      ],
    },
    {
      id: "engineer",
      title: "The most productive digger in the forest",
      body: [
        "Lyrebirds feed by raking. Heavy clawed feet scratch through leaf litter and into the soil beneath, turning over the surface layer for worms, beetle larvae, spiders, centipedes and millipedes. A foraging bird can take up to eighteen prey items a minute.",
        "A study published in 2021 measured what that adds up to. Across twelve months in Victorian forest, lyrebirds displaced an average of about 156 tonnes of litter and soil per hectare — a greater rate than any other digging animal recorded in these ecosystems. The effect is not trivial: it reduces soil compaction, increases aeration and water infiltration, redistributes litter and nutrients, and alters where seedlings establish and how fuel accumulates on the forest floor. Later work found the disturbance also increases the invertebrate populations the birds themselves depend on, effectively farming their own prey.",
        "Because the species occupies more than 17 million hectares of eastern Australian forest, that engineering operates at a landscape scale, and the loss of lyrebirds from an area changes the forest floor measurably.",
      ],
    },
    {
      id: "fire",
      title: "After the fires",
      body: [
        "The superb lyrebird was not a species anyone worried about before the summer of 2019–20. It then lost a great deal of ground very quickly: about 41.5% of its habitat, some 2.1 million hectares, burned at varying severity in the Black Summer fires.",
        "It is poorly equipped for fire. Lyrebirds fly badly, run rather than flee, and depend on deep, damp leaf litter that a hot fire removes entirely. Post-fire surveys found foraging almost absent from high-severity burn sites, with the exception of rainforest — which makes up under 1% of the species' distribution but appears to serve as a refuge from which birds recolonise, and is now a restoration priority.",
        "The species' Least Concern listing predates all of this, and the more serious longer-term question is not the single fire event but the trend behind it: fire regimes intensifying across exactly the wet forests this bird cannot do without. Introduced foxes and cats, feral deer damaging the understorey, and logging of old wet forest add to the pressure.",
      ],
    },
  ],

  related: ["common-raven", "scarlet-macaw", "kiwi"],
  tags: ["songbird", "mimicry", "australia", "ecosystem engineer", "passerine"],
  searchTerms: ["menura novaehollandiae", "lyrebird", "bird that mimics chainsaw", "mimic bird", "australian songbird"],

  faqs: [
    {
      q: "Do lyrebirds really mimic chainsaws?",
      a: "Captive ones have. There is no known recording of a wild superb lyrebird imitating a chainsaw, camera shutter or car alarm. The famous examples come from captive birds — including a male named Chook at Adelaide Zoo who picked up construction noise — and two of the three lyrebirds in the best-known television sequence were captives. Wild birds mimic the forest around them, chiefly other birds.",
    },
    {
      q: "How much of a lyrebird's song is copied from other birds?",
      a: "About 80% during the winter display season. An individual male typically has the calls of twenty to twenty-five species, including whipbirds, kookaburras, currawongs, shrike-thrushes and cockatoos, and reproduces them accurately enough that the copied species cannot always tell the difference. Confusingly, much of the lyrebird's own vocabulary sounds mechanical too — clicks, twangs and whirrs that are not imitations of anything.",
    },
    {
      q: "How big is a superb lyrebird?",
      a: "Males reach 80 to 100 cm including the tail and weigh around a kilogram, which makes the species one of the largest songbirds in the world. Females are smaller at 74 to 84 cm and lack the ornate tail feathers. The male's tail alone is 50 to 60 cm and is made up of sixteen feathers of three different kinds.",
    },
    {
      q: "Why are lyrebirds important to Australian forests?",
      a: "Because of how much earth they move. Feeding by raking through litter and soil, lyrebirds displace roughly 156 tonnes of material per hectare each year — more than any other digging animal measured in these forests. That reduces soil compaction, improves water infiltration, redistributes nutrients and changes how fuel builds up on the forest floor, across more than 17 million hectares of eastern Australia.",
    },
    {
      q: "How long does a lyrebird take to raise a chick?",
      a: "Most of a year. The female builds a domed nest and lays a single egg, which she incubates alone for about fifty days — roughly three times as long as a songbird of that size would normally need, and among the longest incubations of any passerine. The chick then stays in the nest for six to ten weeks and remains dependent on her for months after leaving it.",
    },
  ],

  seo: {
    title: "Superb Lyrebird — Mimicry, Display, Soil Turnover & Fire",
    description:
      "A researched profile of the superb lyrebird (Menura novaehollandiae): what its mimicry really includes, the chainsaw myth, the courtship display, 156 tonnes of soil moved per hectare, and the 2019–20 fires.",
    keywords: [
      "superb lyrebird facts",
      "menura novaehollandiae",
      "lyrebird mimicry",
      "lyrebird chainsaw",
      "australian songbird",
    ],
  },

  sources: [
    {
      label: "Menura novaehollandiae — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22703605/132071218",
    },
    {
      label: "Lyrebirds mimicking chainsaws: fact or lie?",
      publisher: "The Conversation",
      url: "https://theconversation.com/lyrebirds-mimicking-chainsaws-fact-or-lie-22529",
    },
    {
      label: "Foraging by an avian ecosystem engineer extensively modifies the litter and soil layer",
      publisher: "Maisey et al., Ecological Applications (2021)",
      url: "https://esajournals.onlinelibrary.wiley.com/doi/abs/10.1002/eap.2219",
    },
    {
      label: "Male lyrebirds create a complex acoustic illusion of a mobbing flock during courtship and copulation",
      publisher: "Dalziell et al., Current Biology (2021)",
      url: "https://www.sciencedirect.com/science/article/pii/S0960982221002104",
    },
    {
      label: "The impact of Australia's Black Summer fires on the superb lyrebird",
      publisher: "Biological Conservation (2024)",
      url: "https://www.sciencedirect.com/science/article/pii/S0006320723004573",
    },
    {
      label: "Superb lyrebird species page",
      publisher: "The Australian Museum",
      url: "https://australian.museum/learn/animals/birds/superb-lyrebird/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default superbLyrebird;
