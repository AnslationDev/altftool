/**
 * Story prompt generator.
 *
 * Every prompt is assembled from the four parts of a standard logline as it is
 * taught in screenwriting and short-fiction craft: PROTAGONIST + WANT +
 * OBSTACLE + STAKES, with an optional reversal ("twist") supplying the turn.
 * Nothing here is random at call time — the caller supplies the seed, so the
 * same seed always rebuilds the same batch of prompts.
 */

/** Smallest batch a caller may ask for. */
export const MIN_COUNT = 1;
/** Largest batch. Beyond this the list stops being a shortlist and becomes noise. */
export const MAX_COUNT = 12;

/**
 * Word targets, in words, matching the lengths competitions actually use:
 * 100 = drabble, 1000 = flash fiction ceiling used by most journals,
 * 7500 = the upper bound of the Nebula/SFWA short-story category.
 */
export const LENGTH_TARGETS = [
  { id: "drabble", label: "Drabble", words: 100, note: "Exactly 100 words — one image, one turn." },
  { id: "flash", label: "Flash fiction", words: 750, note: "One scene, one decision, no subplot." },
  { id: "short", label: "Short story", words: 3500, note: "Two or three scenes with a real reversal." },
  { id: "long", label: "Long short story", words: 7500, note: "Room for a subplot and a second viewpoint." },
];

export const TONES = [
  { id: "any", label: "Any tone", clause: "" },
  { id: "hopeful", label: "Hopeful", clause: "and the ending should leave one door open" },
  { id: "bleak", label: "Bleak", clause: "and nobody gets what they came for" },
  { id: "comic", label: "Comic", clause: "and the disaster should be funny before it is sad" },
  { id: "tender", label: "Tender", clause: "and the loudest moment should be a quiet one" },
  { id: "tense", label: "Tense", clause: "and the clock should be visible on every page" },
  { id: "eerie", label: "Eerie", clause: "and the wrongness should be noticed late" },
  { id: "wry", label: "Wry", clause: "and the narrator should be a little too calm about it" },
];

export const CHARACTER_TYPES = [
  { id: "any", label: "Any character", who: "someone", want: "wants one honest answer" },
  { id: "reluctant", label: "Reluctant hero", who: "a person who has spent years avoiding responsibility", want: "wants to be left alone" },
  { id: "outsider", label: "Outsider", who: "a newcomer nobody has decided about yet", want: "wants to be believed" },
  { id: "expert", label: "Expert past their prime", who: "a specialist whose field has moved on without them", want: "wants one last proof of competence" },
  { id: "child", label: "Child narrator", who: "a child who understands more than the adults think", want: "wants the adults to stop lying" },
  { id: "caretaker", label: "Caretaker", who: "someone responsible for a person who cannot manage alone", want: "wants a single unclaimed hour" },
  { id: "liar", label: "Convincing liar", who: "a person whose best skill is being believed", want: "wants to be trusted for something true" },
  { id: "returner", label: "Someone come home", who: "a person returning after years away", want: "wants the place to have missed them" },
  { id: "rival", label: "The rival", who: "the second-best person in the room", want: "wants the room to notice the gap closing" },
  { id: "insider", label: "Insider losing faith", who: "a loyal member of an institution starting to doubt it", want: "wants the rules to still mean something" },
  { id: "duo", label: "Mismatched pair", who: "two people who would never choose each other", want: "want the other one to go first" },
  { id: "ghost", label: "The one left behind", who: "the person who stayed when everyone else left", want: "wants an explanation nobody owes them" },
];

/**
 * Genre packs. Each pack carries its own obstacles, settings, stakes and
 * reversals so a fantasy prompt never borrows a courtroom from the thriller
 * pack. Openings are first lines, deliberately concrete.
 */
export const GENRES = [
  {
    id: "fantasy",
    label: "Fantasy",
    obstacles: [
      "must repay a debt to something that does not measure time the way people do",
      "must carry a message through a country where their language is evidence of a crime",
      "must break a promise that was sworn on someone else's name",
      "must guide a pilgrimage they privately believe is pointless",
      "must serve as translator between two powers who both expect to be flattered",
      "must return an object that has started refusing to be put down",
    ],
    settings: [
      "a river town where the bridge tolls are paid in memories",
      "a monastery library that has outlived the religion that built it",
      "a border market held on the one day a year the two armies agree to trade",
      "a flooded capital where the nobility have moved to the upper floors",
      "a mountain pass kept open by a family paid to keep it open",
      "an orchard whose fruit only ripens for people who are lying",
    ],
    stakes: [
      "before the last person who remembers the old agreement dies",
      "before the harvest is counted and the shortfall becomes someone's fault",
      "or the debt transfers to a child who did not agree to it",
      "or the road closes for the winter with the wrong people on each side",
      "before the name they have been using stops working",
    ],
    twists: [
      "the thing they are protecting has been asking to be destroyed",
      "the prophecy is accurate but was written about someone else",
      "the magic works, and the cost is being charged to a stranger",
      "the enemy's terms were reasonable and were never passed on",
      "the guide has been leading them in a slow circle on purpose",
    ],
    openings: [
      "The toll collector counted her memories the way a butcher counts change.",
      "By the third day the book had stopped pretending to be a book.",
      "Everyone at the border spoke my language, and every one of them was lying about it.",
      "The saint's finger bone was missing again, and this time it had left a note.",
    ],
  },
  {
    id: "science-fiction",
    label: "Science fiction",
    obstacles: [
      "must certify a system they no longer understand well enough to certify",
      "must explain a fatal decision to the family of the person the system chose",
      "must keep a habitat running one week past the date it was rated for",
      "must decide which half of an archive survives the transfer",
      "must negotiate with a copy of themselves that has diverged for six years",
      "must prove a machine's confession was not simply the answer it was trained to give",
    ],
    settings: [
      "an orbital fuel depot three shifts into a strike",
      "a coastal city that has been managed by prediction software for a decade",
      "a research station where the only working comms channel is public",
      "a generation ship two hundred years into an eight-hundred-year crossing",
      "a decommissioned server hall that is still, for some reason, warm",
      "a rented body on a planet where nobody rents bodies to strangers",
    ],
    stakes: [
      "before the audit lands and the logs are frozen",
      "before the next resupply window closes for eleven months",
      "or three thousand people learn what the model actually optimises for",
      "or the backup overwrites the version that remembers why any of it started",
      "before the atmosphere processors finish their slow, legal failure",
    ],
    twists: [
      "the system was right, and being right is the worst available outcome",
      "the anomaly is a maintenance routine nobody documented",
      "the message was sent by the crew, decades ago, and forgotten",
      "the copy has been the original since the second transfer",
      "the failure was designed in, and the designer is still on the payroll",
    ],
    openings: [
      "The station had been dying politely for eleven days.",
      "My other self had cut her hair, which felt like an argument.",
      "The model gave the same answer forty times, and the forty-first time it apologised.",
      "Nobody tells you that a generation ship smells mostly of laundry.",
    ],
  },
  {
    id: "mystery",
    label: "Mystery",
    obstacles: [
      "must reopen a case that was closed by someone they respect",
      "must find out who paid for a funeral nobody attended",
      "must account for four minutes missing from an otherwise complete record",
      "must interview the only witness, who is also the only suspect",
      "must work out why a theft was reported a full day late",
      "must explain a confession that gets one detail impossibly wrong",
    ],
    settings: [
      "a coastal hotel out of season, staffed by four people",
      "a housing society where the security register is the only reliable clock",
      "a school reunion held in the building that is being demolished on Monday",
      "a small newspaper office with forty years of unfiled photographs",
      "a night train where the compartment doors were locked from inside",
      "a village clinic that keeps its records on paper, on purpose",
    ],
    stakes: [
      "before the building comes down with the evidence inside it",
      "before the inquest returns a verdict that ends the questions",
      "or the wrong person signs a statement that cannot be withdrawn",
      "or the file is transferred to a department that will lose it",
      "before the only other person who noticed decides to stop noticing",
    ],
    twists: [
      "the crime was reported by the person who committed it, correctly",
      "the alibi is genuine and was manufactured anyway",
      "the missing item was never missing, only reclassified",
      "the witness has been protecting someone who did not need protecting",
      "the investigator's own earlier report is the reason it went unsolved",
    ],
    openings: [
      "The register said nobody entered after ten, and the register had never lied before.",
      "There were forty-one photographs of the wedding and not one of the bride.",
      "He confessed in the first minute, which is how I knew we would be here all night.",
      "The hotel had four staff, six guests, and one door that should not have been open.",
    ],
  },
  {
    id: "horror",
    label: "Horror",
    obstacles: [
      "must finish a job in a building everyone else has quietly stopped entering",
      "must keep a nightly routine that is the only thing holding something in place",
      "must catalogue a collection that appears to be cataloguing them back",
      "must persuade a relative to leave a house that will not let the subject come up",
      "must relieve the previous keeper, who has left no handover notes",
      "must explain the rule they broke to people who never wrote the rules down",
    ],
    settings: [
      "a rural water treatment plant staffed by one person per shift",
      "a family house where every renovation has been abandoned halfway",
      "a hill station hotel in the fortnight before the season opens",
      "a lighthouse converted into a museum nobody visits",
      "a hospital wing kept heated but not used",
      "a mill town where the mill closed and the siren still sounds at six",
    ],
    stakes: [
      "before sunrise, when the handover becomes permanent",
      "before the rest of the family arrives for the weekend",
      "or the routine breaks and nobody living knows how to restart it",
      "or the next person hired inherits it without a warning",
      "before the water reaches the town",
    ],
    twists: [
      "the rules are real and were written to protect the thing, not the people",
      "the previous keeper is still on site and still, technically, working",
      "the house is not haunted; it is being maintained",
      "the protagonist is the reason the routine exists",
      "the thing has been keeping something worse out",
    ],
    openings: [
      "The handover notes were three words long: keep the light.",
      "The siren still sounded at six, and the mill had been shut for twenty years.",
      "My aunt's house had four half-finished bathrooms and no explanation for any of them.",
      "There is a correct order for turning off the lights, and I had it written on my wrist.",
    ],
  },
  {
    id: "romance",
    label: "Romance",
    obstacles: [
      "must share a deadline with the person they have been avoiding for a year",
      "must plan someone else's wedding with someone else's ex",
      "must keep a professional distance while living in the same borrowed flat",
      "must return a box of things and find an excuse not to leave",
      "must translate for the person they cannot say it to directly",
      "must choose between the job they moved for and the person they met after",
    ],
    settings: [
      "a wedding shoot running four hours behind in monsoon rain",
      "a family bakery two weeks before it is sold",
      "a hostel in a hill town where the power cuts out at nine",
      "a hospital waiting room where they keep meeting on alternate nights",
      "a language class where both of them are the worst student",
      "a train delayed long enough for the whole platform to become friends",
    ],
    stakes: [
      "before one of them takes the posting in another city",
      "before the shop changes hands and the excuse to visit disappears",
      "or the misunderstanding hardens into the version everyone repeats",
      "or the other person's kindness gets mistaken for an answer",
      "before the wedding, after which neither has a reason to call",
    ],
    twists: [
      "the grand gesture lands, and the timing makes it a burden",
      "the rival is genuinely good for them and knows it",
      "the letter arrived, was read, and was answered — to the wrong address",
      "one of them has already made the decision and is waiting to be asked",
      "the obstacle was never the other person; it was the promise made to a third",
    ],
    openings: [
      "We had four hours of monsoon left and one umbrella between the bride and the caterer.",
      "He returned my books in alphabetical order, which is its own kind of message.",
      "The power went at nine, as promised, and neither of us moved.",
      "I was translating a marriage proposal, badly, to the person I wanted to say it to.",
    ],
  },
  {
    id: "thriller",
    label: "Thriller",
    obstacles: [
      "must move a person across a city without using anything that can be logged",
      "must deliver testimony they can no longer fully vouch for",
      "must stall an inspection for six hours without appearing to stall it",
      "must find the leak inside a team of four, one of whom is family",
      "must return money that cannot be returned without confessing how it was taken",
      "must keep working normally while being followed competently",
    ],
    settings: [
      "an airport during a national holiday shutdown",
      "a regional bank branch on the day the core system migrates",
      "a container port where every camera is real and none of them are watched live",
      "a hospital where the protagonist is the only person with an unrestricted badge",
      "a political rally, from the volunteer tent",
      "a highway toll plaza where every plate is photographed",
    ],
    stakes: [
      "before the transfer window closes at midnight",
      "before the new system reconciles the old one's mistakes",
      "or the family member is arrested for the part they did not do",
      "or the exposure takes down forty people who only followed instructions",
      "before the flight boards and the choice is made for them",
    ],
    twists: [
      "the pursuer is trying to warn them and has no safe way to do it",
      "the evidence is real and was planted anyway",
      "the deadline is artificial and both sides know it",
      "the leak is procedural, not personal — nobody betrayed anybody",
      "the protagonist is the asset, and has been since the interview",
    ],
    openings: [
      "The migration started at midnight, which gave me until eleven fifty-nine to be honest.",
      "There is no clean way to move a person across this city, so we used the funeral traffic.",
      "The man following me was excellent at it, which is why I knew he wanted to be seen.",
      "Four people on the team, and one of them was my brother.",
    ],
  },
  {
    id: "literary",
    label: "Literary",
    obstacles: [
      "must divide a parent's belongings with a sibling who remembers a different childhood",
      "must keep a small dishonesty going because the truth would now be crueller",
      "must attend a ceremony honouring work they no longer believe in",
      "must tell a story at a funeral where three people know it is not true",
      "must give up the small daily thing that has been holding the week together",
      "must ask for help from the one person they promised never to ask again",
    ],
    settings: [
      "a flat being emptied over one long weekend",
      "a company town on the last week of the plant's operation",
      "a hospital canteen at four in the morning",
      "a village during a wedding that half the family is boycotting",
      "an office where a whole department is being retired with dignity",
      "a rented room above a shop that closes at eight",
    ],
    stakes: [
      "before the flat is handed back on Monday",
      "before the speech, after which the version becomes official",
      "or the sibling leaves with the only photograph of their mother laughing",
      "or the small kindness curdles into a debt",
      "before the last shift ends and everyone becomes former colleagues",
    ],
    twists: [
      "the confession changes nothing, and that is the discovery",
      "the other person knew all along and let it stand as a gift",
      "the object they fought over turns out to belong to neither of them",
      "the grief arrives four months late, in a supermarket",
      "the version everyone repeats is better than what happened, and truer",
    ],
    openings: [
      "We had until Monday to decide who my mother had been.",
      "My brother remembers a house with a garden. There was no garden.",
      "The canteen at four in the morning serves exactly two things, and I have opinions about both.",
      "They gave the department a cake, which was the part nobody could forgive.",
    ],
  },
  {
    id: "historical",
    label: "Historical",
    obstacles: [
      "must record testimony in a language the court refuses to accept",
      "must keep a printing press running while the licence is being reviewed",
      "must decide which family papers are burned before the search",
      "must serve two households whose interests have just diverged",
      "must carry a debt across a border that has moved since it was signed",
      "must certify a census entry they know to be a convenient fiction",
    ],
    settings: [
      "a port city in the last year before a trade route changes",
      "a mission school where the pupils outrank the teachers socially",
      "a garrison town during a long, boring occupation",
      "a canal-building camp during the fever season",
      "a princely court negotiating its own quiet obsolescence",
      "a mill district in the first month of a strike",
    ],
    stakes: [
      "before the commission's report is printed and becomes history",
      "before the survey party arrives to fix the boundary on paper",
      "or the family loses the standing that took three generations to buy",
      "or the record is destroyed and the claim dies with it",
      "before the ship sails and takes the only witness with it",
    ],
    twists: [
      "the official record is wrong in a way that saves someone",
      "the translator has been softening every sentence for years",
      "the reform arrives and lands on the people it was meant to protect",
      "the document everyone is hunting was never signed",
      "the compromise holds, and costs exactly one person everything",
    ],
    openings: [
      "The clerk wrote down what I said, in the language the court preferred, and it was not what I said.",
      "We burned the papers in the order my grandmother had numbered them, years in advance.",
      "The survey party was due on Thursday, and the river had already moved.",
      "In the third year of a very boring occupation, someone finally did something interesting.",
    ],
  },
  {
    id: "adventure",
    label: "Adventure",
    obstacles: [
      "must lead a group that has stopped believing in the route",
      "must retrieve something from a place they were formally banned from",
      "must get a stranger to a hospital across terrain they only half know",
      "must finish a crossing with equipment rated for a shorter one",
      "must decide whether to turn back one day short of the objective",
      "must keep a rescue quiet because publicity would end the season",
    ],
    settings: [
      "a high pass closing three weeks earlier than the almanac promised",
      "a river in flood with one working boat and a broken radio",
      "an island field station between supply runs",
      "a cave system after an unexpected rain",
      "a desert crossing where every landmark has been renamed twice",
      "a shipping lane during a strike, on a boat too small for it",
    ],
    stakes: [
      "before the weather window shuts for the season",
      "before the water rises past the last high ground",
      "or the sponsor pulls out and the expedition never runs again",
      "or the injured member's chance drops below even",
      "before the fuel runs out at the halfway point",
    ],
    twists: [
      "the map is accurate and the terrain has changed",
      "the person slowing them down is the only one who knows the way out",
      "the objective was reached years ago and quietly not reported",
      "turning back is the harder, braver, less forgivable decision",
      "the rescue succeeds, and the story that gets told is somebody else's",
    ],
    openings: [
      "The pass closed three weeks early, which the almanac had no opinion about.",
      "We had one boat, no radio, and a river that had stopped taking suggestions.",
      "The cave took the rain better than we did.",
      "Everyone agreed we should turn back, and everyone kept walking.",
    ],
  },
  {
    id: "comedy",
    label: "Comedy",
    obstacles: [
      "must host an event they have already been publicly uninvited from",
      "must maintain a lie that has acquired a spreadsheet",
      "must impersonate a colleague for one meeting that becomes four",
      "must return a rented item that has been improved beyond recognition",
      "must referee a family feud about seating for a lunch that is now cancelled",
      "must deliver a eulogy for someone they met once, at length",
    ],
    settings: [
      "a housing society annual general meeting with a working microphone",
      "a wedding where both caterers turned up",
      "an office retreat with a mandatory trust exercise and a real emergency",
      "a small-town radio station with one sponsor and strong opinions",
      "a flat-warming where the flat is not, strictly, theirs yet",
      "a school sports day being livestreamed by an over-equipped parent",
    ],
    stakes: [
      "before the committee votes and the minutes become permanent",
      "before the relatives arrive and the seating chart becomes law",
      "or the sponsor withdraws and the station plays only one advertisement",
      "or the spreadsheet is discovered and every cell has to be explained",
      "before the livestream reaches the part they cannot edit out",
    ],
    twists: [
      "the lie is exposed and everyone is politely, devastatingly relieved",
      "the impersonation goes well enough to get a promotion",
      "the feud resolves over something completely unrelated",
      "the disaster is genuinely someone else's fault and nobody believes it",
      "the eulogy is a triumph and now they are the family's official speaker",
    ],
    openings: [
      "The microphone worked, which was the committee's first mistake.",
      "By week three the lie had a spreadsheet, and the spreadsheet had a colour key.",
      "Both caterers arrived at eleven, and both had the same signed contract.",
      "I met the deceased once, for four minutes, and I was speaking for twenty.",
    ],
  },
];

const MULBERRY_INCREMENT = 0x6d2b79f5; // constant from the mulberry32 PRNG
const UINT32 = 4294967296; // 2^32, used to map the 32-bit state onto [0, 1)

/** mulberry32 — a tiny, well-known, fully deterministic 32-bit PRNG. */
function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32;
  };
}

function pick(list, random) {
  return list[Math.floor(random() * list.length) % list.length];
}

/**
 * Distinct 32-bit salts for each independently-seeded PRNG channel below.
 * Every field that can draw a random value (obstacles, settings, twists,
 * openings, stakes, and the "any" fallback for character/tone) gets its own
 * stream, seeded from the same base seed mixed with a channel-specific salt.
 * That keeps the channels independent: how many times one channel's stream
 * is consumed (e.g. character is only drawn when characterId is "any") can
 * never shift what any other channel draws.
 */
const CHANNEL_SALT = {
  obstacles: 0x9e3779b1,
  settings: 0x85ebca77,
  twists: 0xc2b2ae3d,
  openings: 0x27d4eb2f,
  stakes: 0x165667b1,
  character: 0x2545f491,
  tone: 0x9e3779b9,
};

function channelRandom(baseSeed, channel) {
  return makeRandom((baseSeed + CHANNEL_SALT[channel]) >>> 0);
}

/** Picks `count` items without repeating until the pool is exhausted. */
function pickRotating(list, count, random) {
  const pool = list.slice();
  const out = [];
  for (let i = 0; i < count; i += 1) {
    if (pool.length === 0) pool.push(...list);
    const index = Math.floor(random() * pool.length) % pool.length;
    out.push(pool[index]);
    pool.splice(index, 1);
  }
  return out;
}

function findGenre(id) {
  return GENRES.find((genre) => genre.id === id) || null;
}

function findTone(id) {
  return TONES.find((tone) => tone.id === id) || TONES[0];
}

function findCharacter(id) {
  return CHARACTER_TYPES.find((entry) => entry.id === id) || CHARACTER_TYPES[0];
}

function findLength(id) {
  return LENGTH_TARGETS.find((entry) => entry.id === id) || LENGTH_TARGETS[1];
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Builds a batch of story prompts.
 *
 * @param {object} options
 * @param {string} options.genre        genre id from GENRES
 * @param {string} [options.tone]       tone id from TONES
 * @param {string} [options.character]  character id from CHARACTER_TYPES
 * @param {string} [options.length]     length id from LENGTH_TARGETS
 * @param {number} [options.count]      how many prompts, MIN_COUNT..MAX_COUNT
 * @param {number} [options.seed]       integer seed; same seed => same batch
 * @returns {{prompts: Array}|{error: string}}
 */
export function generateStoryPrompts(options = {}) {
  const {
    genre: genreId,
    tone: toneId = "any",
    character: characterId = "any",
    length: lengthId = "flash",
    count = 3,
    seed = 1,
  } = options;

  const genre = findGenre(genreId);
  if (!genre) return { error: "Pick a genre from the list before generating prompts." };

  const requested = Number(count);
  if (!Number.isFinite(requested)) return { error: "Number of prompts must be a number." };
  if (!Number.isInteger(requested)) return { error: "Number of prompts must be a whole number." };
  const wanted = requested;
  if (wanted < MIN_COUNT || wanted > MAX_COUNT) {
    return { error: `Ask for between ${MIN_COUNT} and ${MAX_COUNT} prompts at a time.` };
  }

  const seedValue = Number(seed);
  if (!Number.isFinite(seedValue)) return { error: "Seed must be a number." };

  const tone = findTone(toneId);
  const character = findCharacter(characterId);
  const target = findLength(lengthId);

  // Not folded with `wanted`: raising the requested count re-uses the same
  // stream from the start, so a larger batch extends the existing one
  // instead of reshuffling every field across the whole batch.
  const baseSeed = Math.abs(Math.floor(seedValue)) + genre.id.length * 97;

  const obstacles = pickRotating(genre.obstacles, wanted, channelRandom(baseSeed, "obstacles"));
  const settings = pickRotating(genre.settings, wanted, channelRandom(baseSeed, "settings"));
  const twists = pickRotating(genre.twists, wanted, channelRandom(baseSeed, "twists"));
  const openings = pickRotating(genre.openings, wanted, channelRandom(baseSeed, "openings"));

  const stakeRandom = channelRandom(baseSeed, "stakes");
  const characterRandom = channelRandom(baseSeed, "character");
  const toneRandom = channelRandom(baseSeed, "tone");

  const prompts = [];
  for (let i = 0; i < wanted; i += 1) {
    const stake = pick(genre.stakes, stakeRandom);
    const person =
      characterId === "any" ? pick(CHARACTER_TYPES.slice(1), characterRandom) : character;
    const toneChoice = toneId === "any" ? pick(TONES.slice(1), toneRandom) : tone;

    const core = `${capitalise(person.who)}, who ${person.want}, ${obstacles[i]} in ${settings[i]} ${stake}`;
    const logline = toneChoice.clause ? `${core}, ${toneChoice.clause}.` : `${core}.`;

    prompts.push({
      id: `${genre.id}-${i + 1}`,
      genre: genre.label,
      tone: toneChoice.label,
      characterLabel: person.label,
      want: capitalise(person.want),
      obstacle: capitalise(obstacles[i]),
      setting: capitalise(settings[i]),
      stakes: capitalise(stake.replace(/^(before|or)\s/, "$1 ")),
      twist: capitalise(twists[i]),
      opening: openings[i],
      wordTarget: target.words,
      lengthLabel: target.label,
      lengthNote: target.note,
      logline,
    });
  }

  return { prompts, genre: genre.label, lengthLabel: target.label, wordTarget: target.words };
}

/** Flattens one prompt into plain text for the clipboard. */
export function promptToText(prompt) {
  if (!prompt) return "";
  return [
    `${prompt.genre} · ${prompt.tone} · ${prompt.lengthLabel} (~${prompt.wordTarget} words)`,
    "",
    prompt.logline,
    "",
    `Character: ${prompt.characterLabel}`,
    `Want: ${prompt.want}`,
    `Obstacle: ${prompt.obstacle}`,
    `Setting: ${prompt.setting}`,
    `Stakes: ${prompt.stakes}`,
    `Twist: ${prompt.twist}`,
    `Try opening with: ${prompt.opening}`,
  ].join("\n");
}
