/**
 * Haiku prompt generator.
 *
 * The prompts follow the two structural conventions of classical haiku:
 *   1. KIGO (季語) — a season word. Every kigo listed here is a standard entry
 *      in the Japanese saijiki (seasonal almanac), which classifies words into
 *      five seasons: New Year, spring, summer, autumn and winter.
 *   2. TORIAWASE (取り合わせ) — juxtaposition. Two images are placed side by
 *      side and separated by a KIREJI (切れ字, "cutting word": や ya, かな kana,
 *      けり keri). English-language haiku normally renders the cut as a dash,
 *      colon or full stop at the end of line 1 or line 2.
 *
 * Nothing is random at call time — the caller passes the seed.
 */

/** Target syllable pattern of the classical form, line by line. */
export const CLASSIC_PATTERN = [5, 7, 5];

/**
 * 17 on (音, sound units) is the Japanese count. A Japanese "on" is shorter
 * than an English syllable, so English-language haiku journals commonly accept
 * anything from about 10 to 17 syllables. That range is used for the advisory.
 */
export const ENGLISH_SYLLABLE_FLOOR = 10;
export const ENGLISH_SYLLABLE_CEILING = 17;

export const MIN_COUNT = 1;
export const MAX_COUNT = 8;

export const SEASONS = [
  {
    id: "spring",
    label: "Spring (春 haru)",
    span: "Early February to early May in the traditional almanac.",
    kigo: [
      { jp: "桜", romaji: "sakura", meaning: "cherry blossom" },
      { jp: "梅", romaji: "ume", meaning: "plum blossom, the first flower of the year" },
      { jp: "蛙", romaji: "kawazu", meaning: "frog" },
      { jp: "霞", romaji: "kasumi", meaning: "spring haze" },
      { jp: "雪解", romaji: "yukidoke", meaning: "snowmelt" },
      { jp: "春風", romaji: "harukaze", meaning: "spring breeze" },
      { jp: "蝶", romaji: "chō", meaning: "butterfly" },
      { jp: "燕", romaji: "tsubame", meaning: "swallow, returning to nest" },
      { jp: "若草", romaji: "wakakusa", meaning: "young grass" },
      { jp: "花冷え", romaji: "hanabie", meaning: "the cold snap that returns during blossom season" },
      { jp: "菜の花", romaji: "nanohana", meaning: "rape blossoms, a field of yellow" },
      { jp: "木の芽", romaji: "konome", meaning: "tree buds breaking" },
    ],
    images: [
      "a puddle holding the whole sky",
      "a gate left open all afternoon",
      "the first insect on the window screen",
      "a coat carried instead of worn",
      "school shoes drying on a step",
      "a river running louder than last week",
    ],
    contrasts: [
      "an old woman counting change",
      "a train that does not stop here",
      "a phone ringing in an empty room",
      "the smell of wet cement",
      "a letter still unopened",
      "someone sweeping the same square of ground",
    ],
  },
  {
    id: "summer",
    label: "Summer (夏 natsu)",
    span: "Early May to early August in the traditional almanac.",
    kigo: [
      { jp: "蛍", romaji: "hotaru", meaning: "firefly" },
      { jp: "五月雨", romaji: "samidare", meaning: "the long early-summer rains" },
      { jp: "夕立", romaji: "yūdachi", meaning: "sudden evening downpour" },
      { jp: "蝉", romaji: "semi", meaning: "cicada" },
      { jp: "涼し", romaji: "suzushi", meaning: "coolness — the relief of shade or a breeze" },
      { jp: "昼寝", romaji: "hirune", meaning: "afternoon nap" },
      { jp: "金魚", romaji: "kingyo", meaning: "goldfish" },
      { jp: "風鈴", romaji: "fūrin", meaning: "wind chime" },
      { jp: "打ち水", romaji: "uchimizu", meaning: "water sprinkled on the street to cool it" },
      { jp: "雷", romaji: "kaminari", meaning: "thunder" },
      { jp: "青葉", romaji: "aoba", meaning: "fresh green leaves" },
      { jp: "汗", romaji: "ase", meaning: "sweat" },
    ],
    images: [
      "a ceiling fan on its lowest setting",
      "ice melting in an untouched glass",
      "a shirt drying on the back of a chair",
      "the shadow side of a wall at noon",
      "a bucket left out to catch the rain",
      "a child asleep across two chairs",
    ],
    contrasts: [
      "a hospital corridor",
      "the sound of a scooter starting",
      "a wedding invitation on the fridge",
      "an unanswered doorbell",
      "the last day of an old job",
      "a neighbour's television through the wall",
    ],
  },
  {
    id: "autumn",
    label: "Autumn (秋 aki)",
    span: "Early August to early November in the traditional almanac.",
    kigo: [
      { jp: "月", romaji: "tsuki", meaning: "the moon — on its own, always autumn" },
      { jp: "天の川", romaji: "amanogawa", meaning: "the Milky Way" },
      { jp: "紅葉", romaji: "momiji", meaning: "autumn leaves turning" },
      { jp: "鰯雲", romaji: "iwashigumo", meaning: "'sardine clouds', a mackerel sky" },
      { jp: "虫", romaji: "mushi", meaning: "singing insects" },
      { jp: "秋風", romaji: "akikaze", meaning: "autumn wind" },
      { jp: "稲刈", romaji: "inekari", meaning: "the rice harvest" },
      { jp: "案山子", romaji: "kakashi", meaning: "scarecrow" },
      { jp: "露", romaji: "tsuyu", meaning: "dew" },
      { jp: "渡り鳥", romaji: "wataridori", meaning: "migrating birds" },
      { jp: "柿", romaji: "kaki", meaning: "persimmon" },
      { jp: "夜長", romaji: "yonaga", meaning: "the long nights" },
    ],
    images: [
      "a chair moved to follow the sun",
      "a bicycle chained to a fence all week",
      "one window lit in a row of dark ones",
      "a pen that has started to skip",
      "a plate left out for someone late",
      "washing brought in before dark",
    ],
    contrasts: [
      "an exam hall being swept",
      "a name called twice at a counter",
      "the shutters coming down on a shop",
      "an old address written in a new book",
      "a bus with its lights already on",
      "someone practising the same scale",
    ],
  },
  {
    id: "winter",
    label: "Winter (冬 fuyu)",
    span: "Early November to early February in the traditional almanac.",
    kigo: [
      { jp: "雪", romaji: "yuki", meaning: "snow" },
      { jp: "時雨", romaji: "shigure", meaning: "a passing winter shower" },
      { jp: "木枯し", romaji: "kogarashi", meaning: "the first cold wind that strips the leaves" },
      { jp: "炬燵", romaji: "kotatsu", meaning: "the heated low table" },
      { jp: "枯野", romaji: "kareno", meaning: "withered field" },
      { jp: "冬籠", romaji: "fuyugomori", meaning: "winter seclusion, staying indoors" },
      { jp: "寒月", romaji: "kangetsu", meaning: "the cold moon" },
      { jp: "息白し", romaji: "ikishiroshi", meaning: "breath visible in the cold" },
      { jp: "霜", romaji: "shimo", meaning: "frost" },
      { jp: "落葉", romaji: "ochiba", meaning: "fallen leaves" },
      { jp: "冬至", romaji: "tōji", meaning: "the winter solstice" },
      { jp: "白鳥", romaji: "hakuchō", meaning: "swan" },
    ],
    images: [
      "a kettle reboiled three times",
      "a queue where nobody speaks",
      "gloves left on a radiator",
      "the same two blankets, folded",
      "a window fogged from the inside",
      "a street light coming on at four",
    ],
    contrasts: [
      "a photograph face down",
      "a doctor's waiting room",
      "the smell of someone else's cooking",
      "a bus timetable nobody reads",
      "a dog waiting outside a shop",
      "a radio left on for company",
    ],
  },
  {
    id: "new-year",
    label: "New Year (新年 shinnen)",
    span: "Its own season in the saijiki, covering the opening days of the year.",
    kigo: [
      { jp: "初日", romaji: "hatsuhi", meaning: "the first sunrise of the year" },
      { jp: "門松", romaji: "kadomatsu", meaning: "the pine-and-bamboo gate decoration" },
      { jp: "初夢", romaji: "hatsuyume", meaning: "the first dream of the year" },
      { jp: "年玉", romaji: "toshidama", meaning: "new-year gift money for children" },
      { jp: "若水", romaji: "wakamizu", meaning: "the first water drawn in the new year" },
      { jp: "書初", romaji: "kakizome", meaning: "the first calligraphy of the year" },
      { jp: "雑煮", romaji: "zōni", meaning: "the new-year soup" },
      { jp: "七草", romaji: "nanakusa", meaning: "the seven herbs eaten on the seventh day" },
      { jp: "初雀", romaji: "hatsu-suzume", meaning: "the first sparrow of the year" },
      { jp: "淑気", romaji: "shukki", meaning: "the auspicious stillness of new-year air" },
    ],
    images: [
      "a calendar still in its wrapper",
      "shoes lined up by a door",
      "a house too quiet by afternoon",
      "one glass washed and put away",
      "a list begun and abandoned",
      "the last of something finished without ceremony",
    ],
    contrasts: [
      "a relative on a bad line",
      "a shop opening late",
      "a resolution said out loud",
      "an empty office car park",
      "a train timetable in holiday mode",
      "a message read but not answered",
    ],
  },
];

/** Where the cut (kireji) falls, and what that does to the poem. */
export const CUT_POSITIONS = [
  {
    id: "after-1",
    label: "Cut after line 1",
    guidance: "One short image, then a two-line phrase. Mark the cut with a dash or full stop.",
  },
  {
    id: "after-2",
    label: "Cut after line 2",
    guidance: "A two-line phrase, then a single-line image that reframes it. The commonest shape.",
  },
];

export const SENSES = [
  { id: "sight", label: "Sight", nudge: "Name one thing you could point at." },
  { id: "sound", label: "Sound", nudge: "Let the sound arrive before you say what makes it." },
  { id: "touch", label: "Touch", nudge: "Temperature and texture, not emotion." },
  { id: "smell", label: "Smell", nudge: "Smell dates a scene faster than any adjective." },
  { id: "taste", label: "Taste", nudge: "Taste works best when it is unexpected in the setting." },
];

const MULBERRY_INCREMENT = 0x6d2b79f5; // constant from the mulberry32 PRNG
const UINT32 = 4294967296; // 2^32

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

function pick(list, random) {
  return list[Math.floor(random() * list.length) % list.length];
}

export function findSeason(id) {
  return SEASONS.find((season) => season.id === id) || null;
}

/**
 * @param {object} options
 * @param {string} options.season  season id from SEASONS
 * @param {number} [options.count] how many prompts, MIN_COUNT..MAX_COUNT
 * @param {number} [options.seed]  integer seed; same seed => same prompts
 * @returns {{prompts: Array, season: string}|{error: string}}
 */
export function generateHaikuPrompts(options = {}) {
  const { season: seasonId, count = 3, seed = 1 } = options;

  const season = findSeason(seasonId);
  if (!season) return { error: "Choose one of the five saijiki seasons first." };

  const requested = Number(count);
  if (!Number.isFinite(requested)) return { error: "Number of prompts must be a whole number." };
  const wanted = Math.floor(requested);
  if (wanted < MIN_COUNT || wanted > MAX_COUNT) {
    return { error: `Ask for between ${MIN_COUNT} and ${MAX_COUNT} prompts at a time.` };
  }

  const seedValue = Number(seed);
  if (!Number.isFinite(seedValue)) return { error: "Seed must be a number." };

  const random = makeRandom(Math.abs(Math.floor(seedValue)) + season.id.length * 131 + wanted);

  const kigoList = pickRotating(season.kigo, wanted, random);
  const images = pickRotating(season.images, wanted, random);
  const contrasts = pickRotating(season.contrasts, wanted, random);

  const prompts = kigoList.map((kigo, index) => {
    const cut = pick(CUT_POSITIONS, random);
    const sense = pick(SENSES, random);
    return {
      id: `${season.id}-${index + 1}`,
      season: season.label,
      kigoJp: kigo.jp,
      kigoRomaji: kigo.romaji,
      kigoMeaning: kigo.meaning,
      image: images[index],
      contrast: contrasts[index],
      cutLabel: cut.label,
      cutGuidance: cut.guidance,
      senseLabel: sense.label,
      senseNudge: sense.nudge,
      brief: `Put ${kigo.romaji} (${kigo.jp} — ${kigo.meaning}) beside ${contrasts[index]}. Ground it in ${images[index]}. ${cut.label}.`,
    };
  });

  return { prompts, season: season.label, span: season.span };
}

const VOWEL_GROUPS = /[aeiouy]+/g;

/**
 * English syllable estimate. Heuristic, not a dictionary:
 *   1. count runs of vowel letters ("beautiful" -> beau-ti-fu -> 3),
 *   2. drop a silent trailing "e" ("make" -> 1, "whale" -> 1), but keep it when
 *      the word ends consonant + "le", where the "le" is its own syllable
 *      ("candle" -> 2, "table" -> 2),
 *   3. drop the "e" in a plural/third-person "-es" that is not pronounced
 *      ("makes" -> 1) while keeping it after a sibilant ("watches" -> 2),
 *   4. drop the "e" in a past-tense "-ed" that is not pronounced ("boiled" ->
 *      1, "walked" -> 1) while keeping it after t or d ("wanted" -> 2).
 * Always returns at least 1 for a word that contains letters.
 */
export function estimateSyllables(word) {
  const clean = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  const groups = clean.match(VOWEL_GROUPS);
  let count = groups ? groups.length : 0;
  // silent final "e", except the syllabic consonant + "le" ending
  if (/[^aeiouy]e$/.test(clean) && !/[^aeiouy]le$/.test(clean)) count -= 1;
  // silent "e" inside "-es", except after a sibilant where it is pronounced
  if (/[^aeiouy]es$/.test(clean) && !/(s|z|x|ch|sh)es$/.test(clean)) count -= 1;
  // silent "e" inside "-ed", except after t or d where "-ed" is its own syllable
  if (/[^aeiouytd]ed$/.test(clean)) count -= 1;
  return Math.max(1, count);
}

/** Syllable estimate for a whole line. */
export function countLineSyllables(line) {
  const words = String(line || "").match(/[A-Za-z'’-]+/g) || [];
  return words.reduce((sum, word) => sum + estimateSyllables(word), 0);
}

/**
 * Checks a three-line English draft against the 5-7-5 pattern.
 * Returns per-line counts, deltas, the total, and an advisory that reflects the
 * fact that English-language haiku is usually shorter than 17 syllables.
 */
export function checkDraft(draft) {
  if (typeof draft !== "string") return { error: "Draft must be plain text." };
  const rawLines = draft.split(/\r?\n/).map((line) => line.trim());
  const lines = rawLines.filter((line) => line !== "");

  if (lines.length === 0) {
    return {
      lines: [],
      total: 0,
      lineCount: 0,
      matchesPattern: false,
      note: "Type three lines to see the syllable count.",
    };
  }

  const detail = lines.map((line, index) => {
    const syllables = countLineSyllables(line);
    const target = CLASSIC_PATTERN[index];
    return {
      line,
      syllables,
      target: typeof target === "number" ? target : null,
      delta: typeof target === "number" ? syllables - target : null,
    };
  });

  const total = detail.reduce((sum, item) => sum + item.syllables, 0);
  const matchesPattern =
    lines.length === CLASSIC_PATTERN.length &&
    detail.every((item) => item.delta === 0);

  let note;
  if (lines.length !== CLASSIC_PATTERN.length) {
    note = `A haiku is three lines — this draft has ${lines.length}.`;
  } else if (matchesPattern) {
    note = "Exactly 5-7-5. Classical form.";
  } else if (total >= ENGLISH_SYLLABLE_FLOOR && total <= ENGLISH_SYLLABLE_CEILING) {
    note = `${total} syllables — not 5-7-5, but well inside the ${ENGLISH_SYLLABLE_FLOOR}–${ENGLISH_SYLLABLE_CEILING} range most English-language haiku journals publish.`;
  } else if (total < ENGLISH_SYLLABLE_FLOOR) {
    note = `${total} syllables is very compressed. Check that each line still carries an image.`;
  } else {
    note = `${total} syllables is over the ${ENGLISH_SYLLABLE_CEILING} of the classical count — look for an adjective to drop.`;
  }

  return { lines: detail, total, lineCount: lines.length, matchesPattern, note };
}

/** Flattens one prompt into plain text for the clipboard. */
export function promptToText(prompt) {
  if (!prompt) return "";
  return [
    `Haiku prompt — ${prompt.season}`,
    "",
    `Kigo: ${prompt.kigoJp} (${prompt.kigoRomaji}) — ${prompt.kigoMeaning}`,
    `Grounding image: ${prompt.image}`,
    `Juxtapose with: ${prompt.contrast}`,
    `Cut: ${prompt.cutLabel} — ${prompt.cutGuidance}`,
    `Lead sense: ${prompt.senseLabel} — ${prompt.senseNudge}`,
    "",
    `Brief: ${prompt.brief}`,
  ].join("\n");
}
