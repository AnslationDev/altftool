/**
 * English Idiom Explainer — data and pure lookup helpers.
 *
 * An idiom is a fixed expression whose meaning cannot be worked out from the
 * individual words. Each entry records the literal picture, the figurative
 * meaning, a natural example sentence, a register note and what is actually
 * known about the origin. Where an origin is folk etymology rather than
 * documented, the entry says so instead of repeating the story as fact.
 */

export const CATEGORIES = [
  { id: "work", label: "Work & getting things done" },
  { id: "speech", label: "Speaking & meaning" },
  { id: "secrets", label: "Secrets & disclosure" },
  { id: "money", label: "Money & cost" },
  { id: "risk", label: "Risk & caution" },
  { id: "conflict", label: "Conflict & repair" },
  { id: "time", label: "Time & frequency" },
  { id: "judgement", label: "Judgement & mistakes" },
  { id: "everyday", label: "Everyday life" },
];

/** Register guidance: is the idiom safe in a report, or only in conversation? */
export const REGISTERS = [
  { id: "business", label: "Fine in business writing" },
  { id: "neutral", label: "Neutral — speech and most writing" },
  { id: "informal", label: "Informal — conversation only" },
];

export const IDIOMS = [
  {
    id: "break-the-ice",
    idiom: "break the ice",
    aliases: ["ice breaker", "icebreaker"],
    literal: "To crack the frozen surface of water so a ship can pass.",
    meaning:
      "To say or do something that removes the awkwardness at the start of a meeting or a conversation between strangers.",
    example: "She opened with a question about the traffic just to break the ice.",
    origin:
      "Used figuratively in English from the 16th century, from ships breaking through ice to open a trade route.",
    category: "speech",
    register: "business",
  },
  {
    id: "bite-the-bullet",
    idiom: "bite the bullet",
    aliases: [],
    literal: "To clamp a lead bullet between your teeth.",
    meaning:
      "To accept something painful or unpleasant that can no longer be avoided, and get on with it.",
    example: "We bit the bullet and rewrote the whole module from scratch.",
    origin:
      "Recorded from the 19th century. The popular story about battlefield surgery without anaesthetic is anecdotal rather than documented.",
    category: "risk",
    register: "neutral",
  },
  {
    id: "cost-an-arm-and-a-leg",
    idiom: "cost an arm and a leg",
    aliases: ["an arm and a leg"],
    literal: "To be priced at the loss of two of your limbs.",
    meaning: "To be extremely expensive relative to what you expected to pay.",
    example: "Getting the roof replaced cost an arm and a leg.",
    origin:
      "American, mid-20th century, built on the older pattern 'I'd give my right arm for it'.",
    category: "money",
    register: "informal",
  },
  {
    id: "let-the-cat-out-of-the-bag",
    idiom: "let the cat out of the bag",
    aliases: ["cat out of the bag"],
    literal: "To release a cat that was hidden inside a sack.",
    meaning: "To reveal a secret, usually by accident.",
    example: "He let the cat out of the bag about the surprise party.",
    origin:
      "In English from the 18th century. The market-fraud explanation, where a cat was substituted for a piglet, is widely repeated but poorly evidenced.",
    category: "secrets",
    register: "neutral",
  },
  {
    id: "ball-is-in-your-court",
    idiom: "the ball is in your court",
    aliases: ["ball in your court"],
    literal: "In tennis, the ball has landed on the opponent's side.",
    meaning:
      "It is now your turn to act or decide; nothing more can happen until you respond.",
    example: "We have sent the revised quote, so the ball is in their court.",
    origin: "From tennis, in figurative use through the 20th century.",
    category: "work",
    register: "business",
  },
  {
    id: "burn-the-midnight-oil",
    idiom: "burn the midnight oil",
    aliases: ["burning the midnight oil"],
    literal: "To keep an oil lamp burning past midnight.",
    meaning: "To work or study late into the night.",
    example: "She burned the midnight oil for a week before the audit.",
    origin:
      "In English writing from the 17th century, from the era when late work meant literally consuming lamp oil.",
    category: "work",
    register: "business",
  },
  {
    id: "beat-around-the-bush",
    idiom: "beat around the bush",
    aliases: ["beat about the bush"],
    literal: "To strike the bushes around game instead of going for the game itself.",
    meaning: "To avoid saying the thing that actually matters.",
    example: "Stop beating around the bush and tell me the number.",
    origin:
      "From medieval bird hunting, where beaters struck bushes to drive birds out; recorded in English since the 15th century.",
    category: "speech",
    register: "neutral",
  },
  {
    id: "under-the-weather",
    idiom: "under the weather",
    aliases: [],
    literal: "Below the weather deck of a ship.",
    meaning: "Mildly unwell — the polite way to say you are not fit to work today.",
    example: "I'm a bit under the weather, so I'll join the call on audio only.",
    origin:
      "Nautical in flavour: an unwell sailor was sent below, out of the weather. The link is traditional rather than firmly documented.",
    category: "everyday",
    register: "neutral",
  },
  {
    id: "once-in-a-blue-moon",
    idiom: "once in a blue moon",
    aliases: ["blue moon"],
    literal: "As often as the moon appears blue.",
    meaning: "Very rarely, but not never.",
    example: "We meet the whole team in person once in a blue moon.",
    origin:
      "'Blue moon' as a symbol of the near-impossible dates back centuries; the sense of 'rarely' settled in the 19th century.",
    category: "time",
    register: "neutral",
  },
  {
    id: "piece-of-cake",
    idiom: "a piece of cake",
    aliases: ["piece of cake"],
    literal: "A slice of cake.",
    meaning: "Something very easy to do.",
    example: "After the first migration, the second one was a piece of cake.",
    origin:
      "From the 1930s, plausibly connected to cakewalk contests where a cake was the prize for the easiest, showiest walk.",
    category: "work",
    register: "informal",
  },
  {
    id: "spill-the-beans",
    idiom: "spill the beans",
    aliases: [],
    literal: "To knock over a container of beans.",
    meaning: "To disclose information that was supposed to stay private.",
    example: "One junior spilled the beans about the reorg in the lift.",
    origin: "Early 20th-century American slang.",
    category: "secrets",
    register: "informal",
  },
  {
    id: "hit-the-nail-on-the-head",
    idiom: "hit the nail on the head",
    aliases: [],
    literal: "To strike a nail squarely rather than glancing off it.",
    meaning: "To describe a situation or a cause exactly right.",
    example: "You hit the nail on the head — it is a staffing problem, not a tooling one.",
    origin: "In English since the 16th century.",
    category: "speech",
    register: "business",
  },
  {
    id: "the-last-straw",
    idiom: "the last straw",
    aliases: ["final straw", "straw that broke the camel's back"],
    literal: "One more straw added to a load a camel is already carrying.",
    meaning:
      "The small extra problem that finally makes a situation intolerable, after many earlier ones.",
    example: "The third cancelled delivery was the last straw.",
    origin:
      "Shortened from 'the straw that broke the camel's back', current in English from the 19th century.",
    category: "judgement",
    register: "neutral",
  },
  {
    id: "cut-corners",
    idiom: "cut corners",
    aliases: ["cutting corners"],
    literal: "To take the inside line round a corner instead of the full path.",
    meaning:
      "To save time or money by skipping steps, usually at the cost of quality or safety.",
    example: "They cut corners on testing and shipped a broken release.",
    origin: "From the literal image of taking a shortcut around a bend.",
    category: "work",
    register: "business",
  },
  {
    id: "on-thin-ice",
    idiom: "on thin ice",
    aliases: ["skating on thin ice"],
    literal: "Standing on ice too thin to hold your weight.",
    meaning: "In a risky position where one more mistake will have consequences.",
    example: "After missing two deadlines he knows he is on thin ice.",
    origin: "From the plain physical danger of walking on new ice.",
    category: "risk",
    register: "neutral",
  },
  {
    id: "throw-in-the-towel",
    idiom: "throw in the towel",
    aliases: ["throw in the sponge"],
    literal: "To toss a towel into a boxing ring.",
    meaning: "To admit defeat and stop trying.",
    example: "After the third rejection they threw in the towel on that market.",
    origin:
      "From boxing, where a fighter's corner throws in a towel or sponge to concede the bout.",
    category: "conflict",
    register: "neutral",
  },
  {
    id: "blessing-in-disguise",
    idiom: "a blessing in disguise",
    aliases: ["blessing in disguise"],
    literal: "Good fortune wearing a costume that makes it look like bad fortune.",
    meaning:
      "Something that seemed like a setback but turned out to be an advantage.",
    example: "Losing that contract was a blessing in disguise — the client never paid on time.",
    origin: "In English from the 18th century.",
    category: "judgement",
    register: "business",
  },
  {
    id: "back-to-the-drawing-board",
    idiom: "back to the drawing board",
    aliases: [],
    literal: "Returning to the desk where the design was first drawn.",
    meaning: "To scrap the current attempt and start the design again from the beginning.",
    example: "The prototype cracked under load, so it is back to the drawing board.",
    origin:
      "Popularised by a 1941 cartoon caption in The New Yorker showing a designer walking away from a crashed aircraft.",
    category: "work",
    register: "business",
  },
  {
    id: "elephant-in-the-room",
    idiom: "the elephant in the room",
    aliases: ["elephant in the room"],
    literal: "A live elephant standing in a room that everyone ignores.",
    meaning:
      "An obvious, serious problem that everyone present is deliberately not mentioning.",
    example: "Nobody named the elephant in the room: the budget is already spent.",
    origin: "In English from the 20th century, now standard in business usage.",
    category: "speech",
    register: "business",
  },
  {
    id: "barking-up-the-wrong-tree",
    idiom: "barking up the wrong tree",
    aliases: ["bark up the wrong tree"],
    literal: "A hunting dog baying at a tree the quarry has already left.",
    meaning: "Pursuing a mistaken line of inquiry or blaming the wrong person.",
    example: "If you think the outage was a network fault, you are barking up the wrong tree.",
    origin: "American, early 19th century, from raccoon hunting with dogs at night.",
    category: "judgement",
    register: "neutral",
  },
  {
    id: "steal-someones-thunder",
    idiom: "steal someone's thunder",
    aliases: ["stole my thunder", "steal my thunder"],
    literal: "To take away the sound effect someone else invented.",
    meaning:
      "To take the attention or credit that was about to go to someone else.",
    example: "He announced the numbers first and stole her thunder completely.",
    origin:
      "From the playwright John Dennis, who devised a stage thunder effect around 1704 and found a rival company using it in another play.",
    category: "conflict",
    register: "neutral",
  },
  {
    id: "read-between-the-lines",
    idiom: "read between the lines",
    aliases: [],
    literal: "To read the blank space between written lines.",
    meaning: "To work out what is meant but not actually stated.",
    example: "Read between the lines — that email is a refusal.",
    origin:
      "From 19th-century cryptography, where a message could be hidden between the visible lines of an innocent letter.",
    category: "speech",
    register: "business",
  },
  {
    id: "storm-in-a-teacup",
    idiom: "a storm in a teacup",
    aliases: ["storm in a teacup", "tempest in a teapot"],
    literal: "A full storm confined to a teacup.",
    meaning: "A great deal of anger and drama over something trivial.",
    example: "The font change caused a storm in a teacup on the internal forum.",
    origin:
      "British form; the American equivalent is 'a tempest in a teapot'. Both descend from much older Latin phrasings about storms in small vessels.",
    category: "judgement",
    register: "neutral",
  },
  {
    id: "cards-close-to-your-chest",
    idiom: "keep your cards close to your chest",
    aliases: ["play your cards close to your chest", "cards close to the vest"],
    literal: "Holding playing cards against your body so nobody can see them.",
    meaning: "To keep your plans and information to yourself.",
    example: "The buyer kept his cards close to his chest until the final round.",
    origin: "From card play; 'close to the vest' is the American variant.",
    category: "secrets",
    register: "business",
  },
  {
    id: "tip-of-the-iceberg",
    idiom: "the tip of the iceberg",
    aliases: ["tip of the iceberg"],
    literal: "The small part of an iceberg visible above the waterline.",
    meaning:
      "The small visible portion of a much larger hidden problem — roughly nine-tenths of an iceberg sits underwater.",
    example: "Those two complaints are the tip of the iceberg.",
    origin: "From the physics of floating ice, in figurative use from the 20th century.",
    category: "judgement",
    register: "business",
  },
  {
    id: "all-your-eggs-in-one-basket",
    idiom: "put all your eggs in one basket",
    aliases: ["all your eggs in one basket", "all our eggs in one basket"],
    literal: "Carrying every egg you own in a single basket.",
    meaning:
      "To stake everything on a single option, so one failure wipes you out.",
    example: "Relying on one client is putting all your eggs in one basket.",
    origin: "In English from the 17th century, long before it became investment advice.",
    category: "risk",
    register: "business",
  },
  {
    id: "add-fuel-to-the-fire",
    idiom: "add fuel to the fire",
    aliases: ["fuel to the flames", "add fuel to the flames"],
    literal: "To throw more fuel onto a fire already burning.",
    meaning: "To do or say something that makes an angry situation worse.",
    example: "Replying at midnight only added fuel to the fire.",
    origin: "A classical image, in English use for centuries.",
    category: "conflict",
    register: "neutral",
  },
  {
    id: "go-the-extra-mile",
    idiom: "go the extra mile",
    aliases: ["going the extra mile"],
    literal: "To walk one mile further than you were required to.",
    meaning: "To do noticeably more than the minimum expected of you.",
    example: "Support went the extra mile and called the customer back on a Sunday.",
    origin:
      "Usually traced to the Sermon on the Mount, where someone compelled to go one mile is told to go two.",
    category: "work",
    register: "business",
  },
  {
    id: "in-the-same-boat",
    idiom: "in the same boat",
    aliases: [],
    literal: "Sharing one small vessel.",
    meaning: "Facing the same difficulty as someone else, with the same stake in the outcome.",
    example: "Every supplier is in the same boat this quarter.",
    origin: "From the shared fate of everyone aboard a small craft.",
    category: "everyday",
    register: "business",
  },
  {
    id: "jump-on-the-bandwagon",
    idiom: "jump on the bandwagon",
    aliases: ["climb on the bandwagon", "bandwagon effect"],
    literal: "To climb onto the wagon carrying the band in a parade.",
    meaning: "To join something because it has become popular, not because you believe in it.",
    example: "Every brand jumped on the bandwagon within a fortnight.",
    origin:
      "From 19th-century American political parades, where supporters literally climbed aboard the band's wagon.",
    category: "judgement",
    register: "neutral",
  },
  {
    id: "bury-the-hatchet",
    idiom: "bury the hatchet",
    aliases: [],
    literal: "To dig a hole and put a war axe into it.",
    meaning: "To end a quarrel and agree to leave it behind.",
    example: "The two teams buried the hatchet after the joint retro.",
    origin:
      "From a Native American peace custom of burying weapons, described in English colonial sources from the 17th century.",
    category: "conflict",
    register: "neutral",
  },
  {
    id: "wild-goose-chase",
    idiom: "a wild goose chase",
    aliases: ["wild goose chase"],
    literal: "A chase after wild geese, which cannot be caught on foot.",
    meaning: "A pursuit that wastes time because it was never going to succeed.",
    example: "The missing invoice sent accounts on a two-day wild goose chase.",
    origin:
      "Appears in Shakespeare's Romeo and Juliet, where it named a kind of erratic horse race rather than actual geese.",
    category: "judgement",
    register: "neutral",
  },
  {
    id: "at-the-drop-of-a-hat",
    idiom: "at the drop of a hat",
    aliases: [],
    literal: "As soon as a hat hits the ground.",
    meaning: "Immediately, with no preparation or persuasion needed.",
    example: "She will argue about typography at the drop of a hat.",
    origin:
      "American, 19th century, from the practice of dropping or sweeping down a hat to signal the start of a race or a fight.",
    category: "time",
    register: "neutral",
  },
  {
    id: "benefit-of-the-doubt",
    idiom: "give someone the benefit of the doubt",
    aliases: ["benefit of the doubt"],
    literal: "To award the uncertain part of a case to the other person.",
    meaning:
      "To choose to believe someone's account when the evidence is genuinely unclear.",
    example: "The delay was odd, but I gave the courier the benefit of the doubt.",
    origin: "From legal language about doubt being resolved in the accused's favour.",
    category: "judgement",
    register: "business",
  },
  {
    id: "pull-someones-leg",
    idiom: "pull someone's leg",
    aliases: ["pulling my leg"],
    literal: "To tug at another person's leg.",
    meaning: "To tease someone with a story that is not true, meant kindly.",
    example: "Relax — he was pulling your leg about the dress code.",
    origin:
      "British, 19th century. The various stories about thieves and gallows are folk etymology.",
    category: "everyday",
    register: "informal",
  },
  {
    id: "sit-on-the-fence",
    idiom: "sit on the fence",
    aliases: ["fence-sitter", "on the fence"],
    literal: "To perch on the fence between two fields rather than entering either.",
    meaning: "To refuse to commit to either side of a decision or argument.",
    example: "The committee sat on the fence for another month.",
    origin: "American political usage from the 19th century.",
    category: "judgement",
    register: "business",
  },
  {
    id: "writing-on-the-wall",
    idiom: "the writing on the wall",
    aliases: ["writing on the wall"],
    literal: "Words appearing written on a wall.",
    meaning: "A clear sign that something is going to fail or end.",
    example: "When the third designer left, the writing was on the wall.",
    origin:
      "From the Book of Daniel, where a hand writes on the wall at Belshazzar's feast to foretell the fall of his kingdom.",
    category: "judgement",
    register: "business",
  },
  {
    id: "kill-two-birds-with-one-stone",
    idiom: "kill two birds with one stone",
    aliases: ["two birds with one stone"],
    literal: "To bring down two birds with a single thrown stone.",
    meaning: "To achieve two separate aims with one action.",
    example: "Doing the training on site kills two birds with one stone.",
    origin: "In English from the 17th century, with parallels in many other languages.",
    category: "work",
    register: "business",
  },
  {
    id: "cry-over-spilt-milk",
    idiom: "cry over spilt milk",
    aliases: ["crying over spilled milk", "no use crying over spilt milk"],
    literal: "To weep about milk that has already been knocked over.",
    meaning: "To keep lamenting something that cannot now be changed.",
    example: "The data is gone; there is no use crying over spilt milk.",
    origin: "Recorded in English proverb collections from the 17th century.",
    category: "judgement",
    register: "neutral",
  },
  {
    id: "off-the-top-of-my-head",
    idiom: "off the top of my head",
    aliases: ["top of my head"],
    literal: "Taken from the surface of the head.",
    meaning:
      "From memory, without checking — used to flag that a figure is approximate.",
    example: "Off the top of my head, it is about forty licences.",
    origin: "American, mid-20th century.",
    category: "speech",
    register: "neutral",
  },
  {
    id: "burn-bridges",
    idiom: "burn your bridges",
    aliases: ["burn bridges", "burning bridges"],
    literal: "To set fire to the bridge behind you as you cross.",
    meaning:
      "To destroy a relationship or option so badly that you cannot go back to it.",
    example: "Resign politely — there is no need to burn bridges.",
    origin:
      "From the military tactic of destroying a crossing so an army cannot retreat.",
    category: "conflict",
    register: "business",
  },
  {
    id: "raining-cats-and-dogs",
    idiom: "raining cats and dogs",
    aliases: ["rain cats and dogs"],
    literal: "Cats and dogs falling out of the sky.",
    meaning: "Raining very heavily.",
    example: "It was raining cats and dogs, so the site visit was called off.",
    origin:
      "In English from the 17th century. Every popular explanation for it — thatched roofs, drainage, Norse gods — is folk etymology; the real source is unknown.",
    category: "everyday",
    register: "informal",
  },
  {
    id: "hit-the-ground-running",
    idiom: "hit the ground running",
    aliases: [],
    literal: "To land already at a run rather than stopping first.",
    meaning: "To begin a new role or project at full speed, with no settling-in period.",
    example: "She hit the ground running and closed two deals in week one.",
    origin: "20th-century American, with military and railway parallels.",
    category: "work",
    register: "business",
  },
  {
    id: "tighten-your-belt",
    idiom: "tighten your belt",
    aliases: ["tightening our belts"],
    literal: "To pull a belt in a notch because you have lost weight.",
    meaning: "To cut spending because there is less money coming in.",
    example: "After the funding round slipped, everyone had to tighten their belts.",
    origin: "From the physical effect of eating less over a long period.",
    category: "money",
    register: "business",
  },
  {
    id: "make-ends-meet",
    idiom: "make ends meet",
    aliases: ["making ends meet"],
    literal: "To make two ends reach each other.",
    meaning: "To earn just enough to cover essential expenses, with nothing spare.",
    example: "Two part-time jobs were barely enough to make ends meet.",
    origin: "In English from the 17th century, probably from accounting rather than clothing.",
    category: "money",
    register: "neutral",
  },
];

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const REGISTER_IDS = new Set(REGISTERS.map((r) => r.id));

/** Lowercase, strip punctuation, drop leading "to " and possessives. */
export function normaliseIdiom(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^a-z' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^to /, "");
}

function keysFor(entry) {
  return [entry.idiom, ...entry.aliases].map(normaliseIdiom);
}

function haystack(entry) {
  return normaliseIdiom(
    [entry.idiom, entry.aliases.join(" "), entry.meaning, entry.literal, entry.example].join(" ")
  );
}

/**
 * Look up one idiom. Tries an exact key match first, then a containment match
 * in either direction, then a word-overlap match. Returns
 * { match, matchType, alternatives } or { error } — never throws.
 */
export function explainIdiom(query) {
  const q = normaliseIdiom(query);
  if (!q) {
    return { error: "Type an idiom to look up, for example 'break the ice'." };
  }

  const exact = IDIOMS.find((entry) => keysFor(entry).includes(q));
  if (exact) {
    return { match: exact, matchType: "exact", alternatives: [] };
  }

  const contains = IDIOMS.filter((entry) =>
    keysFor(entry).some((key) => key.includes(q) || q.includes(key))
  );
  if (contains.length > 0) {
    return { match: contains[0], matchType: "partial", alternatives: contains.slice(1, 5) };
  }

  const words = q.split(" ").filter((word) => word.length > 2);
  const scored = IDIOMS.map((entry) => {
    const hay = haystack(entry);
    const hits = words.filter((word) => hay.includes(word)).length;
    return { entry, hits };
  })
    .filter((row) => row.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  if (scored.length > 0) {
    return {
      match: scored[0].entry,
      matchType: "related",
      alternatives: scored.slice(1, 5).map((row) => row.entry),
    };
  }

  return {
    error: `No idiom in this collection matches "${String(query).trim()}". Try a shorter phrase such as 'ice' or 'bullet'.`,
  };
}

/** Browse/filter the whole list. Unknown filter values fall back to "all". */
export function searchIdioms({ query = "", category = "all", register = "all" } = {}) {
  const safeCategory =
    category === "all" || CATEGORY_IDS.has(category) ? category : "all";
  const safeRegister =
    register === "all" || REGISTER_IDS.has(register) ? register : "all";
  const tokens = normaliseIdiom(query).split(" ").filter(Boolean);

  const results = IDIOMS.filter((entry) => {
    if (safeCategory !== "all" && entry.category !== safeCategory) return false;
    if (safeRegister !== "all" && entry.register !== safeRegister) return false;
    if (tokens.length === 0) return true;
    const hay = haystack(entry);
    return tokens.every((token) => hay.includes(token));
  });

  return {
    results,
    total: IDIOMS.length,
    matched: results.length,
    category: safeCategory,
    register: safeRegister,
  };
}

export function categoryCounts() {
  const counts = {};
  for (const { id } of CATEGORIES) counts[id] = 0;
  for (const entry of IDIOMS) {
    if (counts[entry.category] === undefined) counts[entry.category] = 0;
    counts[entry.category] += 1;
  }
  return counts;
}
