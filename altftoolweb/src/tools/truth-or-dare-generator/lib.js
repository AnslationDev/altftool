/**
 * Truth or Dare prompt generation.
 *
 * The generator is fully deterministic: every draw is produced by a seeded
 * pseudo-random number generator (mulberry32), so the same seed always yields
 * the same prompt or the same round list. That keeps the functions pure and
 * lets a host share a "game number" so everyone rebuilds the same game.
 *
 * Prompts are grouped into three levels so a game can be matched to the room:
 *   family  — safe for mixed ages and family gatherings
 *   party   — livelier, still safe for a public room of adults
 *   couples — light-hearted relationship questions, nothing explicit
 */

/** Prompt levels, in order of how bold the prompts get. */
export const LEVELS = {
  family: "Family friendly",
  party: "Party",
  couples: "Couples",
};

/** What a draw can produce. */
export const DRAW_TYPES = {
  random: "Truth or dare (random)",
  truth: "Truth only",
  dare: "Dare only",
};

/** A round list needs at least one player. */
export const MIN_PLAYERS = 1;

/** Practical cap for one printed round list. */
export const MAX_PLAYERS = 20;

/** Practical cap on rounds per player in a single generated list. */
export const MAX_ROUNDS = 10;

export const TRUTHS = {
  family: [
    "What is the most embarrassing thing you have ever worn in public?",
    "What is a talent you wish you had?",
    "Which cartoon character are you most like, and why?",
    "What is the worst meal you have ever cooked?",
    "What is the strangest thing you have ever eaten?",
    "Who in this room would you want with you on a desert island?",
    "What is the last thing you searched for on your phone?",
    "What is a rule at home you secretly break?",
    "What is the silliest thing you have ever been scared of?",
    "What is the best gift you have ever received?",
    "Which subject at school did you pretend to like?",
    "What is a habit of yours that annoys other people?",
  ],
  party: [
    "What is the worst excuse you have used to get out of plans?",
    "What is the most money you have wasted on something useless?",
    "What is the biggest lie you have told to a boss or teacher?",
    "Whose social media do you check the most?",
    "What is the pettiest reason you have unfollowed someone?",
    "What is the most embarrassing thing in your search history?",
    "What is a compliment you gave that you did not mean?",
    "What is the worst haircut you have ever had?",
    "What song do you play when nobody is around?",
    "What is the strangest thing you have done to avoid meeting someone?",
    "What is the worst gift you have given, and did they notice?",
    "What is something everyone here likes that you secretly cannot stand?",
  ],
  couples: [
    "What was your first honest impression of me?",
    "What is a small thing I do that makes your day better?",
    "What is one habit of mine you would quietly change?",
    "What is your favourite memory of us so far?",
    "Where would you take us on a trip if money did not matter?",
    "What is something you were nervous to tell me early on?",
    "Which of my friends do you get along with best, and why?",
    "What is a small thing you would like me to do more often?",
    "What was the moment you knew you liked me?",
    "What is the funniest argument we have ever had?",
    "What do you think I am better at than you?",
    "What is something new you would like us to try together?",
  ],
};

export const DARES = {
  family: [
    "Talk in an accent until your next turn.",
    "Do your best impression of someone else in the room.",
    "Sing the chorus of the last song you listened to.",
    "Balance a book on your head while walking across the room.",
    "Let the person on your left restyle your hair.",
    "Do 15 star jumps without stopping.",
    "Say the alphabet backwards from Z to M.",
    "Draw a portrait of the person opposite you in 30 seconds.",
    "Act out your favourite film scene with no words.",
    "Speak only in questions until your next turn.",
    "Do a 20-second dance with no music.",
    "Tell a joke and keep a straight face while everyone reacts.",
  ],
  party: [
    "Post the tenth photo in your camera roll to your group chat.",
    "Let the group pick your profile picture for the next hour.",
    "Read your last five text messages out loud.",
    "Call a friend and sing happy birthday to them, out of season.",
    "Do your best catwalk from one end of the room and back.",
    "Swap one item of clothing with the person on your right.",
    "Let someone write a word on your forehead with a pen.",
    "Speak in rhyme for the next two rounds.",
    "Do an advert for the nearest random object in the room.",
    "Let the group choose the next song you play out loud.",
    "Do 20 seconds of your worst karaoke.",
    "Send the third emoji in your keyboard's recent list to five people.",
  ],
  couples: [
    "Give your partner a two-minute shoulder massage.",
    "Say three things you appreciate about your partner right now.",
    "Recreate the pose from your favourite photo of the two of you.",
    "Let your partner pick your outfit for tomorrow.",
    "Plan the next date night out loud in 60 seconds.",
    "Write a one-line love note and read it out.",
    "Do your partner's usual morning routine as an impression.",
    "Slow dance to the next song that plays.",
    "Cook or make your partner a snack of their choice.",
    "Let your partner ask one extra truth for free.",
    "Take a silly photo together and set it as your lock screen for a day.",
    "Tell the story of how you met, but from your partner's point of view.",
  ],
};

/**
 * Deterministic PRNG (mulberry32) — same seed, same sequence.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toSeed = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.abs(Math.trunc(n)) : 0;
};

/** How many prompts exist for a level and draw type. */
export function promptPoolSize(level, type = "random") {
  if (!LEVELS[level]) return 0;
  if (type === "truth") return TRUTHS[level].length;
  if (type === "dare") return DARES[level].length;
  return TRUTHS[level].length + DARES[level].length;
}

/**
 * Draw a single prompt.
 *
 * @param {object} input
 * @param {"family"|"party"|"couples"} input.level
 * @param {"random"|"truth"|"dare"} [input.type]
 * @param {number} input.seed        any number; the same seed repeats the draw
 * @param {string[]} [input.usedIds] prompt ids already seen this game
 * @returns {{id:string,type:"truth"|"dare",level:string,text:string,recycled:boolean}|{error:string}}
 */
export function drawPrompt({ level = "family", type = "random", seed = 1, usedIds = [] }) {
  if (!LEVELS[level]) return { error: "Pick one of the family, party or couples levels." };
  if (!DRAW_TYPES[type]) return { error: "Pick truth, dare, or a random mix." };

  const rng = mulberry32(toSeed(seed));
  const drawType = type === "random" ? (rng() < 0.5 ? "truth" : "dare") : type;
  const pool = drawType === "truth" ? TRUTHS[level] : DARES[level];

  const used = new Set(Array.isArray(usedIds) ? usedIds : []);
  const available = pool
    .map((text, index) => ({ id: `${level}-${drawType}-${index}`, text }))
    .filter((item) => !used.has(item.id));

  // When every prompt in the pool has been used the deck is reshuffled rather
  // than returning nothing, so a long game never dead-ends.
  const recycled = available.length === 0;
  const deck = recycled
    ? pool.map((text, index) => ({ id: `${level}-${drawType}-${index}`, text }))
    : available;

  const pick = deck[Math.floor(rng() * deck.length)];
  return { ...pick, type: drawType, level, recycled };
}

/** Split a textarea blob into player names. */
export function parsePlayers(raw) {
  return String(raw ?? "")
    .split(/\r?\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);
}

/**
 * Build a full round list: every player gets one prompt per round, in order,
 * with no repeat until the pool for that type runs out.
 *
 * @returns {{turns:Array, totalTurns:number, ...}|{error:string}}
 */
export function buildRoundList({
  players,
  rounds = 2,
  level = "family",
  type = "random",
  seed = 1,
}) {
  const names = Array.isArray(players)
    ? players.map((n) => String(n).trim()).filter(Boolean)
    : parsePlayers(players);

  if (names.length < MIN_PLAYERS) {
    return { error: `Add at least ${MIN_PLAYERS} player name.` };
  }
  if (names.length > MAX_PLAYERS) {
    return { error: `This generator handles up to ${MAX_PLAYERS} players.` };
  }
  if (!LEVELS[level]) return { error: "Pick one of the family, party or couples levels." };
  if (!DRAW_TYPES[type]) return { error: "Pick truth, dare, or a random mix." };

  const roundCount = Number(rounds);
  if (!Number.isInteger(roundCount) || roundCount < 1) {
    return { error: "Rounds must be a whole number of 1 or more." };
  }
  if (roundCount > MAX_ROUNDS) {
    return { error: `Keep it to ${MAX_ROUNDS} rounds or fewer per player.` };
  }

  const turns = [];
  const used = [];
  let recycles = 0;
  const baseSeed = toSeed(seed);

  for (let round = 1; round <= roundCount; round += 1) {
    for (let p = 0; p < names.length; p += 1) {
      // Each turn gets its own derived seed so the whole list is reproducible.
      const turnSeed = baseSeed + turns.length * 7919; // 7919 is prime, spreading the seeds
      const prompt = drawPrompt({ level, type, seed: turnSeed, usedIds: used });
      if (prompt.error) return prompt;
      if (prompt.recycled) {
        recycles += 1;
        // Only the sub-pool that was actually exhausted (truth or dare) gets forgotten —
        // clearing the whole `used` list would also wipe tracking for the other type,
        // making it repeat prompts long before it has actually been drawn out.
        const prefix = `${level}-${prompt.type}-`;
        for (let i = used.length - 1; i >= 0; i -= 1) {
          if (used[i].startsWith(prefix)) used.splice(i, 1);
        }
      }
      used.push(prompt.id);
      turns.push({
        turn: turns.length + 1,
        round,
        player: names[p],
        type: prompt.type,
        text: prompt.text,
        id: prompt.id,
      });
    }
  }

  return {
    turns,
    totalTurns: turns.length,
    playerCount: names.length,
    rounds: roundCount,
    level,
    type,
    truthCount: turns.filter((t) => t.type === "truth").length,
    dareCount: turns.filter((t) => t.type === "dare").length,
    poolSize: promptPoolSize(level, type),
    recycles,
  };
}
