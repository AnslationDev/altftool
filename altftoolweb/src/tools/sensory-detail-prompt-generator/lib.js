/**
 * Sensory Detail Prompt Generator — pure logic.
 *
 * Two jobs:
 *  1. Generate one craft prompt per sense for a chosen setting, using a seeded
 *     pseudo-random pick so the same seed always gives the same prompts (no
 *     Math.random, no clock).
 *  2. Scan a draft against a sense lexicon and report which senses are absent
 *     and whether sight is crowding out everything else.
 *
 * No React, no DOM.
 */

/* -------------------------------- senses --------------------------------- */

/**
 * Five classical senses plus proprioception and interoception, grouped here as
 * "body" — the felt sense of balance, effort, breath, temperature regulation
 * and pain. Craft guidance consistently treats smell and body as the two most
 * neglected channels in draft prose, which is why they are surfaced separately
 * rather than folded into "touch".
 */
export const SENSES = [
  { id: "sight", label: "Sight", hint: "What is visible, and from whose exact position." },
  { id: "sound", label: "Sound", hint: "Including the sounds that stop." },
  { id: "smell", label: "Smell", hint: "The most memory-linked sense and the least written." },
  { id: "taste", label: "Taste", hint: "Not only food — air, blood, dust, medicine." },
  { id: "touch", label: "Touch", hint: "Texture, temperature, pressure, weight." },
  { id: "body", label: "Body", hint: "Balance, breath, effort, hunger, pain." },
];

/**
 * Editorial threshold used by this tool, not a published standard: when more
 * than 60% of the sensory words in a passage are visual, the scene is running
 * on sight alone.
 */
export const SIGHT_DOMINANCE_SHARE = 0.6;

/** Craft guidance commonly given to drafters: work at least three senses into any scene. */
export const MIN_SENSES_PER_SCENE = 3;

/* ------------------------------- settings -------------------------------- */

/**
 * Each setting supplies concrete anchors — the objects a prompt can point at.
 * Prompts are built by combining a sense template with one of these anchors,
 * so the questions stay specific to the scene rather than generic.
 */
export const SETTINGS = [
  {
    id: "market",
    label: "Street market at midday",
    anchors: ["the fish stall", "a stack of crates", "the tarpaulin overhead", "the weighing scale", "the gutter"],
  },
  {
    id: "monsoon-street",
    label: "City street in heavy rain",
    anchors: ["the blocked drain", "a scooter left standing", "the awning", "the kerb", "a shop's lit doorway"],
  },
  {
    id: "hospital",
    label: "Hospital ward at night",
    anchors: ["the drip stand", "the corridor door", "the chart at the bed end", "the plastic chair", "the window blind"],
  },
  {
    id: "night-train",
    label: "Overnight train",
    anchors: ["the upper berth", "the window latch", "a stranger's luggage", "the vestibule", "the tea vendor's flask"],
  },
  {
    id: "classroom",
    label: "Classroom in exam season",
    anchors: ["the ceiling fan", "the blackboard", "a scratched desk", "the clock", "the door left ajar"],
  },
  {
    id: "kitchen",
    label: "Family kitchen before a meal",
    anchors: ["the gas ring", "the spice tin", "the sink", "a scorched pan", "the doorway"],
  },
  {
    id: "forest",
    label: "Forest trail at dawn",
    anchors: ["the leaf litter", "a fallen trunk", "the canopy gap", "a stream crossing", "the path's edge"],
  },
  {
    id: "wedding",
    label: "Wedding hall mid-ceremony",
    anchors: ["the stage", "the buffet queue", "a stack of chairs", "the entrance arch", "the sound desk"],
  },
  {
    id: "office-night",
    label: "Office floor after hours",
    anchors: ["a monitor left on", "the pantry", "the lift lobby", "an empty desk", "the fire exit"],
  },
  {
    id: "riverbank",
    label: "Riverbank in the dry season",
    anchors: ["the cracked mud", "a moored boat", "the water's edge", "a heap of nets", "the far bank"],
  },
];

/* ------------------------------- templates ------------------------------- */

/** {a} is replaced with an anchor from the chosen setting. */
export const PROMPT_TEMPLATES = {
  sight: [
    "Describe {a} from your character's actual eye level — not from above, and not from a camera.",
    "What is the one thing near {a} that is the wrong colour for this moment?",
    "What does your character see at {a} that a stranger would walk straight past?",
    "Name the light source. What does it fail to reach around {a}?",
    "What has moved near {a} since your character last looked?",
    "Describe {a} using no adjective of size and no adjective of beauty.",
  ],
  sound: [
    "What sound is {a} making that nobody in the scene has mentioned?",
    "What noise stops when your character arrives at {a}?",
    "Write the sound of {a} without the words loud, quiet or noise.",
    "What can be heard from beyond {a} that belongs to a different world?",
    "Which sound here would your character recognise with their eyes shut?",
    "What is the quietest thing your character can hear at {a}?",
  ],
  smell: [
    "What does {a} smell of after an hour, that it did not smell of at first?",
    "Which smell here would your character still recognise twenty years from now?",
    "Name the smell your character is trying not to breathe in near {a}.",
    "What smell does your character carry into this scene that does not belong to {a}?",
    "Describe the smell at {a} without naming the thing that produces it.",
    "What has someone here done to cover a smell, and how well did it work?",
  ],
  taste: [
    "What is already in your character's mouth before they reach {a}?",
    "What does the air taste of near {a} — dust, salt, metal, smoke?",
    "What would your character refuse to eat or drink in this scene, and why?",
    "Describe a taste at {a} that arrives as a memory before it arrives as a flavour.",
    "What aftertaste is left from something that happened before this scene began?",
    "What does your character swallow rather than say near {a}?",
  ],
  touch: [
    "What is the temperature of {a}, and how does your character learn it?",
    "Describe what {a} does to the skin of someone who leans on it without thinking.",
    "What is your character holding, and how has their grip changed since the scene began?",
    "What surface here is a different texture from how it looks at {a}?",
    "What does your character avoid touching at {a}, and does anyone notice?",
    "Describe the weight of the thing your character is carrying past {a}.",
  ],
  body: [
    "Where is your character's weight — which foot, which hand, leaning on what near {a}?",
    "What has your character's body been doing for too long by the time they reach {a}?",
    "Describe their breathing at {a} without the words nervous, calm or anxious.",
    "What small ache is competing for their attention right now?",
    "How hungry, thirsty or tired are they, and what does that make them do at {a}?",
    "What does their body want to do at {a} that they will not let it do?",
  ],
};

/* ------------------------------- lexicon --------------------------------- */

/**
 * Sense lexicon for scanning a draft. A word is assigned to exactly one sense
 * (first sense in this list wins) so a passage cannot score twice for the same
 * word — "damp" is filed under touch, "sour" under taste, "sharp" under touch.
 */
const RAW_LEXICON = {
  sight: [
    "saw", "see", "seen", "look", "looked", "looking", "watch", "watched", "stared", "glance", "glanced",
    "light", "lit", "dark", "darkness", "bright", "dim", "shadow", "shadows", "glare", "gleam", "glint",
    "glow", "glowed", "flicker", "flickered", "colour", "color", "pale", "vivid", "blurred", "shone",
  ],
  sound: [
    "heard", "hear", "hearing", "sound", "sounds", "noise", "loud", "quiet", "silence", "silent",
    "hum", "hummed", "buzz", "clatter", "rattle", "rattled", "creak", "creaked", "thud", "whisper",
    "whispered", "shout", "shouted", "echo", "echoed", "hiss", "murmur", "roar", "drone", "click", "clicked",
  ],
  smell: [
    "smell", "smells", "smelled", "smelt", "scent", "scented", "odour", "odor", "fragrance", "stink",
    "stank", "reek", "reeked", "aroma", "musty", "smoke", "smoky", "perfume", "whiff", "rancid", "stale",
  ],
  taste: [
    "taste", "tasted", "tastes", "sweet", "bitter", "salty", "sour", "tangy", "metallic", "bland",
    "flavour", "flavor", "spice", "spiced", "spicy", "chewed", "swallowed", "sip", "sipped", "mouthful",
  ],
  touch: [
    "touch", "touched", "cold", "cool", "warm", "hot", "rough", "smooth", "sticky", "damp", "wet", "dry",
    "sharp", "soft", "hard", "grip", "gripped", "brushed", "prickle", "prickled", "itch", "numb",
    "coarse", "slick", "clammy", "gritty",
  ],
  body: [
    "ache", "ached", "aching", "dizzy", "breath", "breathing", "breathed", "pulse", "heartbeat",
    "trembled", "shivered", "stiff", "tense", "balance", "staggered", "leaned", "exhausted", "nausea",
    "hunger", "hungry", "thirst", "thirsty", "cramp", "shaking",
  ],
};

/** Deduplicated lexicon: each word belongs to exactly one sense. */
export const SENSE_LEXICON = (() => {
  const seen = new Set();
  const out = {};
  SENSES.forEach((sense) => {
    out[sense.id] = (RAW_LEXICON[sense.id] || []).filter((word) => {
      if (seen.has(word)) return false;
      seen.add(word);
      return true;
    });
  });
  return out;
})();

/* -------------------------------- helpers -------------------------------- */

/** mulberry32 — small, fast, fully deterministic PRNG. Same seed, same stream. */
export function makeRandom(seed) {
  let state = (Math.trunc(Number(seed)) || 0) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (list, random) => list[Math.floor(random() * list.length) % list.length];

/** Words separated by whitespace. */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/* ------------------------------- generator ------------------------------- */

/**
 * Generate one prompt per requested sense.
 *
 * @param {object} input
 * @param {string} input.setting  Key of SETTINGS.
 * @param {number} input.seed     Any integer. The same seed always gives the same prompts.
 * @param {string[]} input.senses Sense ids to include. Defaults to all six.
 * @returns {object} { prompts, ... } or { error }.
 */
export function generatePrompts(input = {}) {
  const { setting = "market", seed = 1, senses } = input;

  const spec = SETTINGS.find((item) => item.id === setting);
  if (!spec) return { error: "Choose a setting from the list." };

  const requested = Array.isArray(senses) && senses.length > 0
    ? SENSES.filter((sense) => senses.includes(sense.id))
    : SENSES;

  if (requested.length === 0) {
    return { error: "Select at least one sense to generate a prompt for." };
  }

  if (!Number.isFinite(Number(seed))) {
    return { error: "The seed must be a number." };
  }

  const random = makeRandom(Math.trunc(Number(seed)));

  const prompts = requested.map((sense) => {
    const template = pick(PROMPT_TEMPLATES[sense.id], random);
    const anchor = pick(spec.anchors, random);
    return {
      sense: sense.id,
      label: sense.label,
      hint: sense.hint,
      anchor,
      prompt: template.replace(/\{a\}/g, anchor),
    };
  });

  return {
    prompts,
    setting: spec.id,
    settingLabel: spec.label,
    seed: Math.trunc(Number(seed)),
    count: prompts.length,
  };
}

/* -------------------------------- analyser -------------------------------- */

/**
 * Count sense words in a draft and report coverage.
 * @param {string} text
 * @returns {object} analysis, or { error }.
 */
export function analyseSenses(text) {
  const source = String(text ?? "");
  const words = countWords(source);
  if (words === 0) {
    return { error: "Paste a paragraph of your draft to scan it." };
  }

  const tokens = source
    .toLowerCase()
    .split(/[^\p{L}'-]+/u)
    .filter(Boolean);

  const byId = {};
  let total = 0;

  SENSES.forEach((sense) => {
    const list = SENSE_LEXICON[sense.id];
    const hits = [];
    let count = 0;
    list.forEach((word) => {
      const occurrences = tokens.filter((token) => token === word).length;
      if (occurrences > 0) {
        hits.push({ word, count: occurrences });
        count += occurrences;
      }
    });
    total += count;
    byId[sense.id] = {
      id: sense.id,
      label: sense.label,
      hint: sense.hint,
      count,
      hits: hits.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word)),
    };
  });

  const results = SENSES.map((sense) => ({
    ...byId[sense.id],
    share: total > 0 ? Math.round((byId[sense.id].count / total) * 1000) / 10 : 0,
  }));

  const present = results.filter((sense) => sense.count > 0);
  const missing = results.filter((sense) => sense.count === 0);
  const sightCount = byId.sight.count;

  return {
    words,
    total,
    results,
    present: present.map((sense) => sense.label),
    missing: missing.map((sense) => sense.label),
    missingIds: missing.map((sense) => sense.id),
    sensesCovered: present.length,
    sightDominant: total > 0 && sightCount / total > SIGHT_DOMINANCE_SHARE,
    sightShare: total > 0 ? Math.round((sightCount / total) * 1000) / 10 : 0,
    thin: present.length < MIN_SENSES_PER_SCENE,
    densityPer100: Math.round(((total / words) * 100) * 10) / 10,
  };
}

/** Render generated prompts as plain text. */
export function promptsToText(result) {
  if (!result || result.error || !Array.isArray(result.prompts)) return "";
  const lines = [`Sensory prompts — ${result.settingLabel} (seed ${result.seed})`, ""];
  result.prompts.forEach((item) => {
    lines.push(`${item.label}: ${item.prompt}`);
  });
  return lines.join("\n").trim();
}
