/*
 * AltF Persona — voice
 *
 * Hooks, captions, bios and name candidates, all derived from the spec and all
 * deterministic. Same persona, same suggestions, every time — which is what
 * makes a suggestion something you can cite in a brief rather than something
 * you had to screenshot before it vanished.
 *
 * The templates are shapes, not sentences. Every one has a slot the writer has
 * to fill, because a caption generator that produces finished copy produces
 * finished copy that sounds like a caption generator.
 */

import { fnv1a, identitySeed, normaliseSpec } from "./compose.js";
import {
  ARCHETYPE_BY_ID,
  LANGUAGE_BY_ID,
  NICHE_BY_SLUG,
  PILLAR_BY_ID,
  PLATFORM_BY_ID,
} from "./taxonomy.js";
import { traitLabel } from "./traits.js";

/* Deterministic pick — the index comes from the spec, never from a clock. */
function pick(list, key) {
  if (!list.length) return null;
  return list[fnv1a(key) % list.length];
}

function pickMany(list, key, count) {
  const out = [];
  const pool = [...list];
  for (let index = 0; index < count && pool.length; index += 1) {
    const at = fnv1a(`${key}:${index}`) % pool.length;
    out.push(pool[at]);
    pool.splice(at, 1);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Hooks — the first line, which is the only line most people read.
 * Grouped by pillar because a teaching hook and a myth-busting hook are
 * different rhetorical objects, not the same object with a different noun.
 * ------------------------------------------------------------------ */

const HOOKS = {
  teach: [
    "The part nobody explains about {topic}:",
    "{topic}, in the order it actually happens:",
    "If {topic} keeps not working, it is almost always this one step.",
    "You do not need to understand all of {topic}. You need this bit.",
    "Ninety seconds on {topic}, then you can stop reading about it.",
  ],
  prove: [
    "I said {topic} would do this. Here is what it did.",
    "{topic}, measured rather than described:",
    "This is what {topic} looks like when it works. And when it does not.",
    "Same setup, one variable changed. {topic}:",
  ],
  review: [
    "{topic}: one thing it does better than anything else, one reason to skip it.",
    "Three weeks with {topic}. The honest version.",
    "I would buy {topic} again — but not for the reason it is advertised.",
    "{topic} is fine. Here is who it is actually for.",
  ],
  compare: [
    "{topic} versus the obvious alternative, on the axis that matters.",
    "Everyone compares these on the wrong thing. {topic}:",
    "One of these is worth twice the price. It is not the one you think.",
    "{topic}: where the cheaper one wins, and where it stops winning.",
  ],
  "myth-bust": [
    "Everyone repeats this about {topic} and it has never been true.",
    "{topic} does not work the way you were told. Here is the actual mechanism.",
    "This advice about {topic} was right in 2015 and is wrong now.",
    "If someone tells you {topic}, they have not checked in a while.",
  ],
  list: [
    "Five things about {topic}. The fifth is the one nobody says.",
    "I went through forty of these. {topic}: four are worth it.",
    "{topic}, ranked, including the one I was wrong about.",
    "Everything I would tell a beginner about {topic}, in one list.",
  ],
  story: [
    "This took me two years to learn about {topic} and about four minutes to explain.",
    "The first time I got {topic} wrong, it cost me a month.",
    "Someone asked me about {topic} last week and I gave them the wrong answer.",
  ],
  react: [
    "This post about {topic} is going around. It is half right.",
    "Everyone is reacting to {topic}. Here is the part being missed.",
    "{topic}: the thing everyone noticed, and the thing nobody did.",
  ],
  "behind-the-scenes": [
    "What {topic} actually looks like before it is finished:",
    "The unglamorous middle of {topic}, which nobody films:",
    "Day fourteen of {topic}. It is going worse than planned.",
  ],
  "day-in-life": [
    "A normal day of {topic}. Not a good one, a normal one.",
    "{topic}, from the boring end.",
    "Nothing happens in this video. That is the point.",
  ],
  routine: [
    "The {topic} sequence, same every time, in order.",
    "{topic} in the time it takes the kettle to boil.",
    "If you only keep one habit from {topic}, keep this one.",
  ],
  "q-and-a": [
    "Someone asked: {topic}. Properly, then:",
    "The most common question I get about {topic}, answered once so I can link it.",
    "{topic}? Short answer no. Long answer, also no, but interesting.",
  ],
  trend: [
    "Doing {topic} the way everyone is doing it, except with the actual numbers.",
    "{topic}, but for people who have to do this for real.",
  ],
  haul: [
    "{topic}: what I kept, what went back, and why.",
    "Six of these arrived. Two are staying.",
  ],
};

export function buildHooks(spec, options = {}) {
  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const pillar = options.pillar || safe.pillars[0] || "teach";
  const topic = options.topic || NICHE_BY_SLUG[safe.niche].label.toLowerCase();
  const archetype = ARCHETYPE_BY_ID[safe.archetype];
  const templates = HOOKS[pillar] || HOOKS.teach;

  const count = Math.min(options.count || 4, templates.length + 1);
  const chosen = pickMany(templates, `${seed.token}:${pillar}:${topic}`, count - 1);

  /* The archetype's own opener always leads, so a persona's hooks sound like
     that persona rather than like the pillar. */
  const lines = archetype.opener ? [archetype.opener] : [];

  return [...lines, ...chosen.map((template) => template.replace(/\{topic\}/g, topic))]
    .slice(0, count)
    .map((text, index) => ({ id: `${pillar}-${index}`, text }));
}

/* ------------------------------------------------------------------ *
 * Captions — assembled in the order the platform reads them.
 * ------------------------------------------------------------------ */

const CTAS = [
  "Save this for the next time it comes up.",
  "Tell me where this breaks for you and I will do a follow-up.",
  "Full working in the comments.",
  "If this was useful, the previous one goes deeper.",
  "Ask me the version of this that applies to you.",
];

const BODY_SHAPES = {
  teach: [
    "State the mechanism in one sentence.",
    "Give the one worked example that makes it obvious.",
    "Name the case where it does not apply.",
  ],
  prove: [
    "Show the result before the method.",
    "State exactly what was held constant.",
    "Name the limit of what this proves.",
  ],
  review: [
    "One sentence on what it is for.",
    "The single best thing about it.",
    "The named reason not to buy it.",
  ],
  compare: [
    "State the axis you are comparing on, first.",
    "Give both numbers.",
    "Name the case where the answer flips.",
  ],
  "myth-bust": [
    "Quote the claim exactly as people say it.",
    "Give the actual mechanism.",
    "Say where the myth came from — that is the shareable part.",
  ],
  list: [
    "Number them. No preamble.",
    "One line each, no more.",
    "Put the surprising one last.",
  ],
  default: [
    "Open on the concrete thing, not the context.",
    "One idea per paragraph.",
    "End on the specific, not the summary.",
  ],
};

export function buildCaption(spec, options = {}) {
  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const pillar = options.pillar || safe.pillars[0] || "teach";
  const topic = options.topic || NICHE_BY_SLUG[safe.niche].label.toLowerCase();
  const platform = PLATFORM_BY_ID[safe.platform];
  const language = LANGUAGE_BY_ID[safe.language] || LANGUAGE_BY_ID.en;

  const hook = buildHooks(safe, { pillar, topic, count: 1 })[0];
  const shape = BODY_SHAPES[pillar] || BODY_SHAPES.default;
  const cta = pick(CTAS, `${seed.token}:cta:${pillar}`);

  const disclosure = options.paid
    ? `#ad · ${language.disclosure}`
    : language.disclosure;

  const parts = [
    { role: "hook", label: "Hook", text: hook.text },
    {
      role: "body",
      label: "Body",
      text: shape.map((line, index) => `${index + 1}. ${line}`).join("\n"),
      note: "These are the beats, not the words. Write them yourself.",
    },
    { role: "cta", label: "Close", text: cta },
    {
      role: "disclosure",
      label: "Disclosure",
      text: disclosure,
      note: `Goes in the first ${platform.captionChars > 500 ? "two lines" : "line"}, before the fold, in ${language.label}.`,
    },
  ];

  /*
   * The counter measures REAL COPY ONLY — the hook, the close and the
   * disclosure. The body part is a list of beats for a writer to fill in, not
   * text that will ever be published, so counting it would report a caption as
   * over budget on the strength of instructions nobody is going to post. That
   * would be a made-up number, which is exactly the kind of thing this product
   * exists to stop doing.
   */
  const counted = parts
    .filter((part) => part.role !== "body")
    .map((part) => part.text)
    .join("\n\n");

  const budget = platform.captionChars;

  return {
    pillar: PILLAR_BY_ID[pillar],
    platform,
    language,
    parts,
    disclosure,
    budget,
    used: counted.length,
    overBudget: counted.length > budget,
    /* What the writer still has to spend, once the fixed parts are in. */
    remaining: Math.max(0, budget - counted.length),
  };
}

/* ------------------------------------------------------------------ *
 * Bio
 * ------------------------------------------------------------------ */

export function buildBio(spec) {
  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const niche = NICHE_BY_SLUG[safe.niche];
  const archetype = ARCHETYPE_BY_ID[safe.archetype];
  const language = LANGUAGE_BY_ID[safe.language] || LANGUAGE_BY_ID.en;
  const value = traitLabel("value", safe.value).toLowerCase();
  const subject = niche.label.toLowerCase();

  const shapes = [
    `${subject} · ${archetype.blurb.replace(/\.$/, "")} · ${language.disclosure} persona`,
    `${archetype.label.replace("The ", "")} on ${subject}. ${value}. ${language.disclosure}, and says so.`,
    `I make ${subject} make sense. ${language.disclosure} character — the method is real, the face is not.`,
    `${subject}, ${value}. An ${language.disclosure} persona operated by a human who answers the comments.`,
  ];

  return pickMany(shapes, `${seed.token}:bio`, 3).map((text, index) => ({
    id: `bio-${index}`,
    text,
    length: text.length,
    /* Instagram's bio field is the tightest of the surfaces we target, so it
       is the one worth measuring against. */
    fitsInstagram: text.length <= 150,
  }));
}

/* ------------------------------------------------------------------ *
 * Names and handles
 *
 * A persona needs a name before it needs anything else, and "think of a name"
 * is where most people stall for a week. These are candidates, deliberately
 * plain — a persona called something clever ages badly.
 * ------------------------------------------------------------------ */

const GIVEN_NAMES = {
  "east-asian": ["Mei", "Hana", "Yuki", "Jun", "Rina", "Kenji", "Sora", "Lian"],
  "south-asian": ["Maya", "Arjun", "Priya", "Rohan", "Isha", "Kabir", "Nila", "Devan"],
  "southeast-asian": ["Mei-Lin", "Anh", "Rizal", "Sari", "Bayu", "Nadia", "Tam", "Ravi"],
  "central-asian": ["Aigul", "Timur", "Dilnoza", "Ruslan", "Zarina", "Sanjar"],
  "west-asian": ["Noor", "Karim", "Layla", "Omar", "Rana", "Sami", "Dina", "Yousef"],
  "north-african": ["Amina", "Tarek", "Salma", "Idris", "Nadia", "Hicham"],
  "west-african": ["Amara", "Kofi", "Ngozi", "Kwame", "Adaeze", "Femi", "June", "Grace"],
  "east-african": ["Sam", "Hanna", "Yonas", "Aziza", "Dawit", "Zahra", "Andre"],
  "southern-african": ["Thabo", "Naledi", "Sipho", "Lerato", "Kagiso", "Zanele"],
  "northern-european": ["Liv", "Dan", "Freya", "Erik", "Ingrid", "Marcus", "Wren", "Soren"],
  "southern-european": ["Sofia", "Tomás", "Inês", "Luca", "Elena", "Mateo", "Chiara"],
  "eastern-european": ["Leo", "Katya", "Milan", "Zofia", "Ivan", "Dara", "Nina"],
  "latin-american": ["Bruno", "Camila", "Diego", "Valentina", "Mateo", "Lucía"],
  "indigenous-american": ["Aiyana", "Kai", "Nizhoni", "Tala", "Yuma", "Sani"],
  "pacific-islander": ["Moana", "Tane", "Leilani", "Ari", "Malia", "Keanu"],
  mixed: ["Wren", "Ash", "Remy", "Nova", "Kai", "Sage", "River", "Indi"],
};

const FAMILY_NAMES = [
  "Rao", "Okafor", "Hartmann", "Belmonte", "Menon", "Cole", "Haddad",
  "Iyer", "Vogt", "Mensah", "Marchetti", "Whitlock", "Sugimoto", "Alves",
  "Adeyemi", "Oduya", "Tanabe", "Varga", "Nwosu", "Desai", "Chow", "Hale",
  "Ferreira", "Oyelaran", "Lindqvist", "Basu", "Moreau", "Kaur",
];

const HANDLE_SHAPES = [
  ({ first, verb }) => `${first}${verb}`.toLowerCase(),
  ({ first, noun }) => `${first}.${noun}`.toLowerCase(),
  ({ first, last }) => `${first}${last}`.toLowerCase(),
  ({ first, noun }) => `${first}_${noun}`.toLowerCase(),
  ({ verb, noun }) => `the${verb}${noun}`.toLowerCase(),
];

const NICHE_VERBS = {
  beauty: ["reads", "tests", "swatches"],
  fitness: ["lifts", "programs", "coaches"],
  fashion: ["styles", "fits", "wears"],
  food: ["cooks", "preps", "feeds"],
  travel: ["routes", "prices", "plans"],
  tech: ["specs", "benchmarks", "explains"],
  gaming: ["reads", "climbs", "theorises"],
  money: ["counts", "budgets", "calculates"],
  home: ["fixes", "measures", "sorts"],
  wellness: ["rests", "resets", "practises"],
  parenting: ["packs", "plans", "survives"],
  auto: ["costs", "services", "drives"],
  pets: ["walks", "trains", "feeds"],
  study: ["revises", "drills", "recalls"],
  craft: ["mends", "makes", "stitches"],
  sustainability: ["repairs", "checks", "audits"],
};

const NICHE_NOUNS = {
  beauty: ["labels", "routine", "skin"],
  fitness: ["reps", "program", "strength"],
  fashion: ["fits", "wardrobe", "seams"],
  food: ["onepan", "kitchen", "prep"],
  travel: ["routes", "budget", "rails"],
  tech: ["specs", "setup", "bench"],
  gaming: ["patch", "meta", "ranked"],
  money: ["numbers", "budget", "maths"],
  home: ["rentals", "smallspace", "fixes"],
  wellness: ["evenings", "habits", "sleep"],
  parenting: ["schoolrun", "gear", "routines"],
  auto: ["ownership", "service", "miles"],
  pets: ["leads", "walks", "training"],
  study: ["recall", "revision", "notes"],
  craft: ["mending", "stitches", "bench"],
  sustainability: ["claims", "repair", "numbers"],
};

export function nameCandidates(spec, count = 5) {
  const safe = normaliseSpec(spec);
  const seed = identitySeed(safe);
  const givens = GIVEN_NAMES[safe.heritage] || GIVEN_NAMES.mixed;
  const verbs = NICHE_VERBS[safe.niche] || ["makes"];
  const nouns = NICHE_NOUNS[safe.niche] || ["things"];

  const out = [];
  for (let index = 0; index < count; index += 1) {
    const key = `${seed.token}:name:${index}`;
    const first = givens[fnv1a(key) % givens.length];
    const last = FAMILY_NAMES[fnv1a(`${key}:last`) % FAMILY_NAMES.length];
    const verb = verbs[fnv1a(`${key}:verb`) % verbs.length];
    const noun = nouns[fnv1a(`${key}:noun`) % nouns.length];
    const shape = HANDLE_SHAPES[index % HANDLE_SHAPES.length];

    out.push({
      name: `${first} ${last}`,
      handle: shape({ first, last, verb, noun }).replace(/[^a-z0-9._]/g, ""),
    });
  }

  /* Two personas in one session should not be offered the same name. */
  const seen = new Set();
  return out.filter((candidate) => {
    if (seen.has(candidate.name)) return false;
    seen.add(candidate.name);
    return true;
  });
}
