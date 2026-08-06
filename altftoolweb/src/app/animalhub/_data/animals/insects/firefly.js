// Firefly (Photinus pyralis) — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const firefly = {
  slug: "firefly",
  category: "insects",
  name: "Firefly",
  scientificName: "Photinus pyralis",
  otherNames: ["Common eastern firefly", "Big dipper firefly", "Lightning bug"],

  summary:
    "The beetle behind every North American summer evening: a male flies a J-shaped swoop and flashes on the upstroke, a female answers two seconds later, and sometimes the answer comes from a predator imitating her.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Photinus_pyralis_Firefly_3.jpg",
    alt: "A firefly in flight against a black background, wing cases raised and the pale yellow segments of its lantern visible at the abdomen tip",
    credit: "art farmer from evansville indiana, usa / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Eastern_firefly_%28Photinus_pyralis%29%2C_June_2025%2C_Virginia.jpg/1920px-Eastern_firefly_%28Photinus_pyralis%29%2C_June_2025%2C_Virginia.jpg",
      alt: "A firefly resting on the edge of a green leaf, its cream head shield marked with a rose-pink patch and a black central spot",
      credit: "Celari817 / Wikimedia Commons",
      title: "The shield that identifies it",
      caption:
        "The pale pronotum with a black centre ringed in pink is the field mark for Photinus pyralis. It also covers the head completely — a firefly looks headless from above, which is normal for the family.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Common_Eastern_Firefly_%2827524503504%29.jpg/1920px-Common_Eastern_Firefly_%2827524503504%29.jpg",
      alt: "A firefly on a green grass blade seen from above, dark wing cases edged in pale yellow",
      credit: "Katja Schulz from Washington, D. C., USA / Wikimedia Commons",
      title: "Soft-bodied and slow",
      caption:
        "Fireflies are unhurried, easily caught beetles with soft wing cases — behaviour that only makes sense because they are chemically defended. They carry lucibufagins, steroids that make them unpleasant to birds and spiders.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Common_Eastern_Firefly_%2827858835340%29.jpg/1920px-Common_Eastern_Firefly_%2827858835340%29.jpg",
      alt: "A firefly at rest on a broad green blade of grass in daylight",
      credit: "Katja Schulz from Washington, D. C., USA / Wikimedia Commons",
      title: "Daylight is downtime",
      caption:
        "Adults spend the day low in damp vegetation and start signalling around sunset. The species needs moisture at every life stage, which is why fireflies concentrate along field margins, wet meadows and stream edges.",
    },
  ],

  headline: "A two-second conversation, held in light",
  intro: [
    "Photinus pyralis is the most common firefly in North America and the one nearly every summer memory east of the Rockies belongs to. It is a beetle, not a fly, and the light comes from an organ on the underside of the last abdominal segments — cold light, produced chemically, with almost none of the energy lost as heat.",
    "What the flashing actually is, is a conversation with a strict grammar. The male flies a shallow J, lighting on the upswing for about a third of a second, and repeats it every few seconds. A female sitting in the grass waits roughly two seconds after his flash and answers with one of her own. Get the timing wrong and nothing happens. Get it right deliberately, as the females of another genus do, and you get dinner.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Coleoptera",
    family: "Lampyridae",
    genus: "Photinus",
    species: "Photinus pyralis",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2021,
    populationTrend: "unknown",
    populationEstimate:
      "No population figure; the species is widespread and abundant across the eastern half of North America and tolerates suburban and agricultural landscapes better than most fireflies",
    note: "This is a genuine global assessment, made in 2021 as part of the first systematic IUCN review of North American fireflies, and Least Concern here means what it says: Photinus pyralis is common, adaptable and not currently at risk. That verdict does not extend to fireflies generally. Several North American species assessed in the same round came out threatened, and the pressures behind those listings — light pollution, loss of damp habitat, pesticide use and declining water quality — apply to this species too, just not yet at a level that threatens it.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length",
      value: "About 9–15 mm",
      min: 9,
      max: 15,
      unit: "mm",
      note: "The LSU AgCenter gives 9–15 mm; some accounts extend the upper figure to about 19 mm",
    },
    {
      key: "flash-duration",
      label: "Flash duration (male)",
      value: "About 0.3 seconds",
      unit: "seconds",
      note: "A single long flash given on the upward, forward part of each looping flight — the stroke that draws the J",
    },
    {
      key: "flash-interval",
      label: "Interval between flashes",
      value: "About 5–10 seconds",
      min: 5,
      max: 10,
      unit: "seconds",
      note: "Temperature-dependent; warmer evenings shorten the interval",
    },
    {
      key: "response-delay",
      label: "Female response delay",
      value: "About 2–3 seconds",
      min: 2,
      max: 3,
      unit: "seconds",
      note: "The single most important number in the system — the delay is the species signature, and it is what Photuris females copy",
    },
    {
      key: "incubation",
      label: "Egg stage",
      value: "18–25 days",
      min: 18,
      max: 25,
      unit: "days",
    },
    {
      key: "larval-duration",
      label: "Larval stage",
      value: "One to two years",
      min: 1,
      max: 2,
      unit: "years",
      note: "Spent underground and in leaf litter hunting snails, slugs and worms; this is where nearly the whole life is spent",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "A few weeks",
      unit: "weeks",
      note: "Adults emerge in late spring and early summer and signal for a matter of weeks",
    },
  ],

  traits: [
    { key: "diet-larva", label: "Larval diet", value: "Snails, slugs, worms and other soft-bodied invertebrates", icon: "Bug" },
    { key: "diet-adult", label: "Adult diet", value: "Little or nothing; some nectar and dew", icon: "Droplets" },
    { key: "defence", label: "Defence", value: "Lucibufagins — distasteful steroids carried at every life stage", icon: "ShieldAlert" },
    { key: "activity", label: "Activity", value: "Crepuscular; signalling begins around sunset and lasts about 90 minutes", icon: "Moon" },
    { key: "ecological-role", label: "Ecological role", value: "Larval predator of snails and slugs", icon: "Target" },
  ],

  highlights: ["body-length", "flash-interval", "larval-duration", "defence"],

  distribution: {
    continents: ["North America"],
    regions: [
      "The eastern United States, from Florida and southern Texas north to New York",
      "Westward to the eastern edge of the Rocky Mountains",
      "Southern Ontario and Quebec at the northern limit",
    ],
    habitats: [
      "Wet meadow and field margin",
      "Woodland edge and open deciduous woodland",
      "Lawns, parks and suburban gardens",
      "Stream and lake margins",
    ],
    elevation: "Lowland to mid-elevation; the constraint is moisture rather than altitude",
    note: "Moisture is the requirement at every stage — eggs, larvae, pupae and adults all need damp conditions, and the species concentrates where there is long grass over wet soil. That is also why it does comparatively well in mown-but-watered suburbia while other fireflies do not.",
  },

  sections: [
    {
      id: "flash-code",
      title: "The flash code",
      body: [
        "Every firefly species has its own signal, and the differences are what keep them from wasting time on one another. In Photinus pyralis the male patrols low over grass, dipping and rising in a shallow loop, and emits one flash lasting about a third of a second on the forward-and-upward part of each loop. Because the light is on while the beetle is climbing, the trace it leaves in the air is a hook — hence the name big dipper firefly.",
        "He repeats this every five to ten seconds, faster when the evening is warm. A female is not flying at all: she sits on low vegetation and watches. If a male's flash suits her, she waits about two to three seconds and answers with a single flash of her own, twisting her abdomen towards him as she does it.",
        "That delay is the password. Get it wrong and the male ignores it. The system was mapped out species by species from the 1960s onward, largely by John Lloyd at the University of Florida, who worked out that the American Photinus fireflies could be told apart by flash pattern alone — and, in doing so, made it possible to notice when something was cheating.",
      ],
    },
    {
      id: "chemistry",
      title: "How the light is made",
      body: [
        "The organ is on the underside of the abdomen: in males it occupies the last three segments, in females only the second-to-last. Inside it, the enzyme luciferase acts on a small molecule called luciferin in the presence of oxygen, ATP and magnesium, and the reaction releases a photon. Because the energy comes out as light rather than heat, the lantern of a firefly is barely warm — the standard description is cold light, and it is the reason a beetle can carry a lamp on its abdomen without cooking itself.",
        "Control of the flash was misunderstood for a long time. It was assumed the beetle was simply switching a nerve signal on and off, but the timing is too sharp for that; oxygen delivery into the light organ, gated at the tracheal level, is what produces the crisp on-off character of a flash.",
        "The chemistry turned out to be commercially enormous. The luciferase gene was cloned from Photinus pyralis in the 1980s, and firefly luciferase is now one of the most widely used reporter enzymes in molecular biology, as well as the basis of ATP assays that detect living cells on surgical instruments and in food processing. A great deal of modern laboratory work runs on an enzyme first isolated from this specific beetle.",
      ],
    },
    {
      id: "femmes-fatales",
      title: "The femmes fatales",
      body: [
        "Females of the genus Photuris, a similar-looking firefly found in the same fields, do something remarkable with all this. A Photuris female watches a Photinus male flashing, and answers him — using the delay and duration of a Photinus female rather than her own species' signal. The male flies down to what he takes for a mate and is seized and eaten.",
        "James Lloyd described the behaviour in Science in 1965 and gave them the name that stuck: firefly femmes fatales. Some individuals can imitate the answering signals of several different Photinus species, switching between codes depending on who is flying.",
        "The reason is not only nutritional. Photinus fireflies contain lucibufagins, defensive steroids that make them distasteful to birds and to jumping spiders. Photuris cannot manufacture them. Work published in 1997 showed that Photuris females acquire lucibufagins by eating Photinus males, and that females which have done so are rejected by spiders while those that have not are eaten. The predator is stealing a chemical defence as well as a meal — and the signal it uses to do it is the courtship code of its prey.",
      ],
    },
    {
      id: "larvae-and-light",
      title: "Glowworms, and the problem with porch lights",
      body: [
        "Almost the entire life of this insect happens out of sight. Eggs hatch after about three weeks into predatory larvae that spend one to two years in damp soil and leaf litter hunting snails, slugs and earthworms, which they subdue with digestive enzymes injected through the jaws. The larvae glow too, steadily rather than in flashes, which is where the term glowworm comes from. The light is a warning: lucibufagins are present in every life stage, and the glow advertises them.",
        "The adult is the short, conspicuous end of the process. It lives a few weeks, feeds little or not at all, and exists mostly to complete the flash conversation and lay the next generation.",
        "That makes the species unusually exposed to two ordinary things. The first is tidiness: raked leaf litter, drained damp corners and closely mown lawns remove larval habitat. The second is light. Artificial light at night interferes with both the production and the reception of courtship flashes, and experimental work by Avalon Owens and Sara Lewis found the effect varies sharply by species — mating in some fireflies was prevented outright under direct artificial light, while Photinus pyralis proved comparatively robust. It is one of the more tractable conservation problems in existence: the recommended first action, from the Xerces Society, is to turn the outside lights off.",
      ],
    },
  ],

  related: ["seven-spot-ladybird", "atlas-moth", "monarch-butterfly"],
  tags: ["beetle", "coleoptera", "bioluminescence", "north america", "light pollution", "mimicry"],
  searchTerms: [
    "photinus pyralis",
    "lightning bug",
    "big dipper firefly",
    "how do fireflies glow",
    "firefly flash pattern",
  ],

  faqs: [
    {
      q: "How do fireflies produce light?",
      a: "An organ on the underside of the abdomen contains luciferin and the enzyme luciferase. With oxygen, ATP and magnesium, the reaction releases photons — and almost no heat, which is why it is called cold light. Oxygen delivery into the organ is what switches the flash on and off so sharply.",
    },
    {
      q: "What does the firefly's flashing pattern mean?",
      a: "It is a species-specific courtship code. A male Photinus pyralis flies a shallow J-shaped loop and flashes for about a third of a second on the upswing, repeating every five to ten seconds. A perched female waits two to three seconds and answers with a single flash. The delay is what identifies the species, and getting it wrong means no response.",
    },
    {
      q: "Do fireflies eat other fireflies?",
      a: "Some do. Females of the genus Photuris mimic the answering flash of Photinus females to lure Photinus males close, then catch and eat them. Beyond the meal, they gain lucibufagins — defensive steroids they cannot make themselves — which protect them from spiders. James Lloyd named them firefly femmes fatales in 1965.",
    },
    {
      q: "How long do fireflies live?",
      a: "Far longer than the flashing suggests. Eggs hatch after around three weeks, and the predatory larva then spends one to two years in damp soil and leaf litter eating snails and worms. The adult beetle, which is the part anyone sees, lives only a few weeks and feeds little or not at all.",
    },
    {
      q: "Are fireflies disappearing?",
      a: "Photinus pyralis itself was assessed as Least Concern in 2021 and remains common and adaptable. Other North American fireflies assessed at the same time did not fare as well. The documented threats are habitat loss, pesticide use, poor water quality and light pollution, which interferes with the flash signals fireflies use to find mates — turning off outdoor lights at night is the single most useful thing a household can do.",
    },
  ],

  seo: {
    title: "Firefly — Flash Patterns, Bioluminescence & Femmes Fatales",
    description:
      "A researched profile of the common eastern firefly (Photinus pyralis): how luciferin and luciferase make cold light, the two-second flash conversation, the Photuris females that mimic it to hunt, and light pollution as a threat.",
    keywords: [
      "firefly facts",
      "photinus pyralis",
      "how do fireflies glow",
      "lightning bug",
      "firefly flash pattern",
    ],
  },

  sources: [
    {
      label: "Photinus pyralis — Red List assessment (2021)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/164046430/166771623",
    },
    {
      label: "Photinus pyralis, big dipper firefly — species profile",
      publisher: "LSU AgCenter",
      url: "https://www.lsuagcenter.com/profiles/bneely/articles/page1587050468972",
    },
    {
      label: "Firefly 'femmes fatales' acquire defensive steroids (lucibufagins) from their firefly prey (1997)",
      publisher: "Proceedings of the National Academy of Sciences",
      url: "https://www.pnas.org/doi/10.1073/pnas.94.18.9723",
    },
    {
      label: "Aggressive mimicry in Photuris: firefly femmes fatales (Lloyd, 1965)",
      publisher: "Science",
      url: "https://www.science.org/doi/10.1126/science.149.3684.653",
    },
    {
      label: "Firefly threats and conservation efforts",
      publisher: "Xerces Society for Invertebrate Conservation",
      url: "https://www.xerces.org/endangered-species/fireflies/threats-and-conservation-efforts",
    },
  ],

  updatedAt: "2026-07-29",
};

export default firefly;
