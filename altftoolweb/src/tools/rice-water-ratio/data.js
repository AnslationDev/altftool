export const CUP_ML = 240;

export const GRAINS = [
  {
    id: "basmati",
    name: "Basmati rice",
    tag: "long grain",
    gramsPerCup: 190,
    perPersonG: 75,
    cookedMultiplier: 2.9,
    rinse: "Rinse 3–4 times until the water runs nearly clear — removes surface starch so grains stay separate.",
    soak: "Soak 20–30 min for the longest grains, then drain. If soaked, cut the water by about 10% (1 : 1.35).",
    methods: {
      pot: {
        ratio: 1.5,
        time: "Boil, then cover and simmer on the lowest flame 12–14 min; rest 10 min",
        note: "1 : 1.5 unsoaked. Do not stir while it simmers or the grains break.",
      },
      pressure: {
        ratio: 1.5,
        whistles: "2 whistles on medium, then natural release",
        note: "Add a teaspoon of ghee to keep grains separate.",
      },
      cooker: {
        ratio: 1.5,
        note: "White-rice program. Rinse first or the cooker cake sticks.",
      },
    },
  },
  {
    id: "jasmine",
    name: "Jasmine rice",
    tag: "fragrant",
    gramsPerCup: 185,
    perPersonG: 75,
    cookedMultiplier: 2.8,
    rinse: "Rinse 2–3 times gently — jasmine is softer than basmati and over-rinsing dulls the aroma.",
    soak: "No soak needed. Jasmine cooks with noticeably less water than most rice.",
    methods: {
      pot: {
        ratio: 1.25,
        time: "Boil, cover, simmer lowest flame 10–12 min; rest 10 min",
        note: "1 : 1.25 only — the classic mistake is drowning jasmine at 1 : 2.",
      },
      pressure: {
        ratio: 1.25,
        whistles: "1–2 whistles on low, natural release",
        note: "Goes mushy fast; low flame matters more than whistle count.",
      },
      cooker: {
        ratio: 1.25,
        note: "White-rice program; the finger-knuckle trick over-waters jasmine.",
      },
    },
  },
  {
    id: "sona-masoori",
    name: "Sona Masoori",
    tag: "medium grain",
    gramsPerCup: 200,
    perPersonG: 75,
    cookedMultiplier: 3,
    rinse: "Rinse 2–3 times until the water is mostly clear.",
    soak: "Optional 15–20 min soak gives softer rice and slightly faster cooking.",
    methods: {
      pot: {
        ratio: 2,
        time: "Boil, cover, simmer 15–18 min; rest 5–10 min",
        note: "1 : 2 for soft, everyday rice; use 1 : 1.75 if you like it firmer.",
      },
      pressure: {
        ratio: 2,
        whistles: "2–3 whistles on medium, natural release",
        note: "The everyday South Indian default — 3 whistles for softer rice with dal.",
      },
      cooker: {
        ratio: 2,
        note: "White-rice program handles it perfectly.",
      },
    },
  },
  {
    id: "brown",
    name: "Brown rice",
    tag: "wholegrain",
    gramsPerCup: 190,
    perPersonG: 70,
    cookedMultiplier: 2.6,
    rinse: "Rinse 2–3 times.",
    soak: "Soak 30 min–8 h. The bran layer resists water; soaking shortens cooking and softens the chew.",
    methods: {
      pot: {
        ratio: 2.25,
        time: "Boil, cover, simmer 35–40 min; rest 10 min",
        note: "1 : 2.25 unsoaked. Takes 3× longer than white rice — plan for it.",
      },
      pressure: {
        ratio: 2,
        whistles: "3–4 whistles on medium, 10 min natural release",
        note: "The pressure cooker is the easiest way to get tender brown rice.",
      },
      cooker: {
        ratio: 2.25,
        note: "Use the brown-rice program if your cooker has one; otherwise run the normal cycle and let it rest 15 min.",
      },
    },
  },
  {
    id: "parboiled",
    name: "Parboiled (sella) rice",
    tag: "converted",
    gramsPerCup: 200,
    perPersonG: 75,
    cookedMultiplier: 2.8,
    rinse: "A quick rinse is enough — parboiling already sets the starch.",
    soak: "Optional 15 min soak. Grains stay firm and separate almost no matter what you do.",
    methods: {
      pot: {
        ratio: 2.25,
        time: "Boil, cover, simmer 20–25 min; rest 10 min",
        note: "Needs more water and time than raw white rice, but never turns sticky.",
      },
      pressure: {
        ratio: 2,
        whistles: "3 whistles on medium, natural release",
        note: "Idli-batter sella and biryani sella behave the same here.",
      },
      cooker: {
        ratio: 2.25,
        note: "Normal program plus 10 min keep-warm rest.",
      },
    },
  },
  {
    id: "sticky",
    name: "Sticky (glutinous) rice",
    tag: "steam it",
    gramsPerCup: 200,
    perPersonG: 70,
    cookedMultiplier: 2.1,
    rinse: "Rinse until the water runs clear — 4–5 changes.",
    soak: "Essential: soak 4–8 h (or overnight). Unsoaked sticky rice cooks unevenly.",
    methods: {
      pot: {
        ratio: 1,
        time: "Best steamed 25 min over a cloth-lined steamer after soaking",
        note: "If you must boil: 1 : 1 water, lowest flame 15 min — steaming is the traditional and better method.",
      },
      pressure: {
        ratio: 1,
        whistles: "1 whistle on low (place bowl-in-cooker, pot-in-pot)",
        note: "Direct pressure cooking turns it to paste; pot-in-pot is safer.",
      },
      cooker: {
        ratio: 1,
        note: "Use the sweet/glutinous program if available; add water level just to cover.",
      },
    },
  },
  {
    id: "quinoa",
    name: "Quinoa",
    tag: "pseudo-grain",
    gramsPerCup: 170,
    perPersonG: 70,
    cookedMultiplier: 2.9,
    rinse: "Rinse well in a fine sieve 30–60 s — washes off bitter saponin coating.",
    soak: "No soak needed once rinsed.",
    methods: {
      pot: {
        ratio: 1.75,
        time: "Boil, cover, simmer 15 min; rest 5 min until the germ ring shows",
        note: "1 : 1.75 gives fluffy quinoa; 1 : 2 tips it toward porridge.",
      },
      pressure: {
        ratio: 1.5,
        whistles: "1 whistle on medium, natural release",
        note: "Quinoa overcooks fast under pressure — one whistle is plenty.",
      },
      cooker: {
        ratio: 1.75,
        note: "White-rice program works; fluff as soon as it switches to keep-warm.",
      },
    },
  },
  {
    id: "dalia",
    name: "Dalia / bulgur (broken wheat)",
    tag: "cracked wheat",
    gramsPerCup: 160,
    perPersonG: 60,
    cookedMultiplier: 2.6,
    rinse: "No rinse needed. Dry-roast 2–3 min in the pan first for a nutty flavour.",
    soak: "No soak for regular dalia. Fine bulgur only needs a 15-min steep in 1 : 1.5 hot water — no cooking.",
    methods: {
      pot: {
        ratio: 2.5,
        time: "Boil, cover, simmer 15–20 min, stirring once or twice",
        note: "1 : 2.5 for soft khichdi-style; 1 : 2 for a fluffier upma texture.",
      },
      pressure: {
        ratio: 2.5,
        whistles: "2–3 whistles on medium, natural release",
        note: "The fastest route to breakfast dalia; add milk after, not before.",
      },
      cooker: {
        ratio: 2.5,
        note: "Porridge program if available, else the normal cycle.",
      },
    },
  },
  {
    id: "couscous",
    name: "Couscous (instant)",
    tag: "no simmering",
    gramsPerCup: 175,
    perPersonG: 70,
    cookedMultiplier: 2.3,
    rinse: "No rinsing — it is pre-steamed pasta, not a raw grain.",
    soak: "None. It only needs a hot steep.",
    methods: {
      pot: {
        ratio: 1.2,
        time: "Pour boiling water over, cover 5 min off the heat, fluff with a fork",
        note: "1 : 1.2 boiling water (add a pinch of salt and a little oil first).",
      },
      pressure: {
        unsuitable:
          "Never pressure-cook couscous — it is pre-cooked and just needs a 5-minute steep in boiling water.",
      },
      cooker: {
        unsuitable:
          "A rice cooker cycle overcooks couscous into paste. Boil water separately, pour over, cover 5 min.",
      },
    },
  },
  {
    id: "millets-whole",
    name: "Whole millets (jowar / bajra / ragi)",
    tag: "soak overnight",
    gramsPerCup: 200,
    perPersonG: 70,
    cookedMultiplier: 2.5,
    rinse: "Rinse 2–3 times, rubbing gently to shed field dust.",
    soak: "Essential: soak 8 h or overnight. These are hard grains — unsoaked they stay pellet-like even after long cooking.",
    methods: {
      pot: {
        ratio: 3,
        time: "Boil, cover, simmer 30–40 min after soaking; rest 10 min",
        note: "1 : 3 after an overnight soak; whole ragi is usually sprouted or milled instead.",
      },
      pressure: {
        ratio: 2.5,
        whistles: "3–4 whistles on medium, natural release",
        note: "Soak first, always — the cooker cannot substitute for soaking.",
      },
      cooker: {
        ratio: 3,
        note: "Brown-rice cycle after an overnight soak; expect a chewy bite.",
      },
    },
  },
  {
    id: "millets-small",
    name: "Small millets (foxtail / little / kodo)",
    tag: "rice substitute",
    gramsPerCup: 190,
    perPersonG: 70,
    cookedMultiplier: 2.7,
    rinse: "Rinse 2–3 times in a fine sieve — the grains are tiny and float away easily.",
    soak: "Soak 15–30 min for even cooking; drain well.",
    methods: {
      pot: {
        ratio: 2,
        time: "Boil, cover, simmer 12–15 min; rest 10 min untouched",
        note: "1 : 2 cooks them like rice; 1 : 2.5 leans toward soft khichdi.",
      },
      pressure: {
        ratio: 2,
        whistles: "2 whistles on medium, natural release",
        note: "Behaves like sona masoori in the cooker — an easy rice swap.",
      },
      cooker: {
        ratio: 2,
        note: "White-rice program, then 10 min keep-warm rest before fluffing.",
      },
    },
  },
  {
    id: "oats",
    name: "Oats (rolled)",
    tag: "porridge",
    gramsPerCup: 90,
    perPersonG: 45,
    cookedMultiplier: 2.6,
    rinse: "No rinsing.",
    soak: "No soak for rolled oats. Steel-cut oats: soak overnight or use 1 : 3 water and 20–25 min.",
    methods: {
      pot: {
        ratio: 2,
        time: "Simmer 4–5 min, stirring — rolled oats are quick",
        note: "1 : 2 water (or half milk). Steel-cut need 1 : 3 and 20–25 min.",
      },
      pressure: {
        ratio: 2,
        whistles: "1 whistle on low — mainly worth it for steel-cut (1 : 3)",
        note: "Rolled oats barely need pressure; they froth, so never fill past half.",
      },
      cooker: {
        ratio: 2,
        note: "Porridge program only — the normal cycle boils over.",
      },
    },
  },
  {
    id: "poha",
    name: "Poha (flattened rice)",
    tag: "no cooking",
    gramsPerCup: 85,
    perPersonG: 60,
    cookedMultiplier: 1.9,
    rinse: "Thick poha: rinse 30–60 s in a colander under running water, then rest 5 min — it softens on its own.",
    soak: "Never soak in standing water — it collapses to mush. Thin poha only needs a light sprinkle.",
    noCook: {
      note: "Poha is pre-cooked and flattened — it needs moisture, not measured water or heat.",
      steps: [
        "Put poha in a colander and rinse under running water 30–60 s (thin poha: just sprinkle water).",
        "Let it rest 5 min — grains turn soft and separate. Press one: it should mash cleanly.",
        "Season the tempering (mustard seeds, curry leaves, onion, haldi), then fold poha in on low heat 2 min.",
        "Cover 2 min off the heat, fluff, and finish with lemon and sev.",
      ],
    },
    methods: {
      pot: {
        ratio: 0,
        time: "No cooking in water — rinse and drain only",
        note: "Rinse-and-rest is the whole method; boiling destroys it.",
      },
      pressure: { unsuitable: "Never — poha is already cooked. Pressure turns it to paste instantly." },
      cooker: { unsuitable: "Not needed — a rinse and 5-minute rest fully softens poha." },
    },
  },
];

export const METHOD_TABS = [
  { id: "pot", label: "Open pot" },
  { id: "pressure", label: "Pressure cooker" },
  { id: "cooker", label: "Rice cooker" },
];
