/**
 * Japanese New Year (nengajo) greeting composer.
 *
 * Pure data + pure functions. The rules encoded here are real Japanese usage rules:
 *
 * 1. Timing. Until 31 December you say 良いお年を (yoi otoshi o) — "have a good year
 *    ahead". From 1 January you switch to あけましておめでとうございます.
 * 2. Matsunouchi. New Year greetings run only to the end of matsunouchi: 7 January in
 *    the Kanto region, 15 January in much of Kansai. After that the correct card is
 *    kanchu-mimai (寒中見舞い) up to risshun (about 4 February), then yokan-mimai
 *    (余寒見舞い) to the end of February.
 * 3. Gashi length. Two-character new-year words (賀正, 迎春) are abbreviations and are
 *    considered too casual for a superior or a client; four-character forms
 *    (謹賀新年, 恭賀新年) or a full sentence are the polite choice.
 * 4. Imikotoba. On a nengajo, 去年 is avoided because 去 carries a sense of parting;
 *    昨年 or 旧年 is written instead.
 */

/** Politeness registers offered. */
export const POLITENESS_LEVELS = [
  { id: "keigo", label: "Keigo — business, clients, superiors" },
  { id: "polite", label: "Polite — desu/masu, safe for anyone" },
  { id: "casual", label: "Casual — friends and close family" },
];

export const TIMINGS = [
  { id: "before", label: "Before 1 January (良いお年を)" },
  { id: "after", label: "On or after 1 January (あけましておめでとう)" },
];

/** Recipients, with the register and honorific Japanese speakers would normally use. */
export const RECIPIENTS = [
  { id: "client", label: "Client or business partner", politeness: "keigo", honorific: "sama" },
  { id: "boss", label: "Boss or senior colleague", politeness: "keigo", honorific: "sama" },
  { id: "colleague", label: "Colleague", politeness: "polite", honorific: "san" },
  { id: "teacher", label: "Teacher or professor", politeness: "keigo", honorific: "sensei" },
  { id: "senpai", label: "Senpai or club senior", politeness: "polite", honorific: "senpai" },
  { id: "friend", label: "Friend", politeness: "casual", honorific: "san" },
  { id: "family", label: "Family", politeness: "casual", honorific: "none" },
];

/** Honorific suffixes. `sensei` and `senpai` are titles used in place of a suffix. */
export const HONORIFICS = [
  { id: "sama", label: "様 (sama) — formal, standard on cards", suffix: "様", romaji: "-sama" },
  { id: "san", label: "さん (san) — everyday polite", suffix: "さん", romaji: "-san" },
  { id: "sensei", label: "先生 (sensei) — teachers, doctors", suffix: "先生", romaji: "-sensei" },
  { id: "senpai", label: "先輩 (senpai) — a senior", suffix: "先輩", romaji: "-senpai" },
  { id: "kun", label: "くん (kun)", suffix: "くん", romaji: "-kun" },
  { id: "chan", label: "ちゃん (chan)", suffix: "ちゃん", romaji: "-chan" },
  { id: "none", label: "No suffix", suffix: "", romaji: "" },
];

/**
 * Opening greeting (賀詞, gashi). `superiorSafe: false` marks the two-character
 * abbreviations that should not be sent upward.
 */
export const GASHI = [
  {
    id: "kinga-shinnen",
    timing: "after",
    levels: ["keigo", "polite"],
    superiorSafe: true,
    native: "謹賀新年",
    romaji: "Kinga Shinnen",
    english: "Respectfully, a happy New Year.",
    note: "Four-character greeting — the standard formal choice for bosses and clients.",
  },
  {
    id: "kyoga-shinnen",
    timing: "after",
    levels: ["keigo"],
    superiorSafe: true,
    native: "恭賀新年",
    romaji: "Kyōga Shinnen",
    english: "Reverently, a happy New Year.",
    note: "Four-character greeting, slightly more literary than 謹賀新年.",
  },
  {
    id: "tsutsushinde",
    timing: "after",
    levels: ["keigo"],
    superiorSafe: true,
    native: "謹んで新年のお慶びを申し上げます",
    romaji: "Tsutsushinde shinnen no oyorokobi o mōshiagemasu",
    english: "I respectfully offer my congratulations on the New Year.",
    note: "A full sentence — the safest opening for a client card.",
  },
  {
    id: "akemashite-polite",
    timing: "after",
    levels: ["keigo", "polite"],
    superiorSafe: true,
    native: "あけましておめでとうございます",
    romaji: "Akemashite omedetō gozaimasu",
    english: "Happy New Year.",
    note: "Universal polite form. Works spoken or written.",
  },
  {
    id: "gasho",
    timing: "after",
    levels: ["casual"],
    superiorSafe: false,
    native: "賀正",
    romaji: "Gashō",
    english: "Celebrating the New Year.",
    note: "Two-character abbreviation — for peers and juniors only, not for a boss.",
  },
  {
    id: "geishun",
    timing: "after",
    levels: ["casual"],
    superiorSafe: false,
    native: "迎春",
    romaji: "Geishun",
    english: "Welcoming the spring (the New Year).",
    note: "Two-character abbreviation — same restriction as 賀正.",
  },
  {
    id: "akemashite-casual",
    timing: "after",
    levels: ["casual"],
    superiorSafe: false,
    native: "あけましておめでとう",
    romaji: "Akemashite omedetō",
    english: "Happy New Year!",
    note: "Plain form, for friends and family.",
  },
  {
    id: "akeome",
    timing: "after",
    levels: ["casual"],
    superiorSafe: false,
    native: "あけおめ！",
    romaji: "Akeome!",
    english: "Happy New Year! (slang)",
    note: "Chat slang. Never on a printed card.",
  },
  {
    id: "yoi-otoshi-keigo",
    timing: "before",
    levels: ["keigo", "polite"],
    superiorSafe: true,
    native: "良いお年をお迎えください",
    romaji: "Yoi otoshi o omukae kudasai",
    english: "Please have a good New Year.",
    note: "Said up to 31 December, never after the year turns.",
  },
  {
    id: "yoi-otoshi-casual",
    timing: "before",
    levels: ["casual"],
    superiorSafe: false,
    native: "良いお年を！",
    romaji: "Yoi otoshi o!",
    english: "Have a good one — see you next year!",
    note: "The shortened everyday version.",
  },
  {
    id: "honnen-osewa",
    timing: "before",
    levels: ["keigo"],
    superiorSafe: true,
    native: "本年は大変お世話になりました",
    romaji: "Honnen wa taihen osewa ni narimashita",
    english: "Thank you very much for all your help this year.",
    note: "The standard year-end opening in business email.",
  },
];

/** Line two: thanks for the year that is ending. */
export const THANKS = [
  {
    id: "kyunenchu-keigo",
    timing: "after",
    levels: ["keigo"],
    native: "旧年中は格別のご高配を賜り、厚く御礼申し上げます。",
    romaji: "Kyūnenchū wa kakubetsu no gokōhai o tamawari, atsuku onrei mōshiagemasu.",
    english: "Thank you sincerely for your exceptional consideration during the past year.",
  },
  {
    id: "sakunen-polite",
    timing: "after",
    levels: ["keigo", "polite"],
    native: "昨年は大変お世話になりました。",
    romaji: "Sakunen wa taihen osewa ni narimashita.",
    english: "Thank you for everything you did for me last year.",
  },
  {
    id: "kyunenchu-polite",
    timing: "after",
    levels: ["polite"],
    native: "旧年中はお世話になり、ありがとうございました。",
    romaji: "Kyūnenchū wa osewa ni nari, arigatō gozaimashita.",
    english: "Thank you for your support during the past year.",
  },
  {
    id: "sakunen-casual",
    timing: "after",
    levels: ["casual"],
    native: "昨年はいろいろありがとう。",
    romaji: "Sakunen wa iroiro arigatō.",
    english: "Thanks for everything last year.",
  },
  {
    id: "honnen-keigo",
    timing: "before",
    levels: ["keigo"],
    native: "本年中は格別のお引き立てを賜り、誠にありがとうございました。",
    romaji: "Honnen-chū wa kakubetsu no ohikitate o tamawari, makoto ni arigatō gozaimashita.",
    english: "Thank you most sincerely for your custom throughout this year.",
  },
  {
    id: "kotoshi-polite",
    timing: "before",
    levels: ["polite"],
    native: "今年一年、大変お世話になりました。",
    romaji: "Kotoshi ichinen, taihen osewa ni narimashita.",
    english: "Thank you for all your help over the past twelve months.",
  },
  {
    id: "kotoshi-casual",
    timing: "before",
    levels: ["casual"],
    native: "今年もありがとう！",
    romaji: "Kotoshi mo arigatō!",
    english: "Thanks for this year too!",
  },
];

/** Line three: the request to keep the relationship going. */
export const REQUESTS = [
  {
    id: "honnen-keigo",
    timing: "after",
    levels: ["keigo"],
    native: "本年もどうぞよろしくお願い申し上げます。",
    romaji: "Honnen mo dōzo yoroshiku onegai mōshiagemasu.",
    english: "I look forward to your continued favour this year as well.",
  },
  {
    id: "kotoshi-polite",
    timing: "after",
    levels: ["keigo", "polite"],
    native: "今年もよろしくお願いいたします。",
    romaji: "Kotoshi mo yoroshiku onegai itashimasu.",
    english: "Looking forward to working with you again this year.",
  },
  {
    id: "kotoshi-casual",
    timing: "after",
    levels: ["casual"],
    native: "今年もよろしくね！",
    romaji: "Kotoshi mo yoroshiku ne!",
    english: "Let's keep it going this year too!",
  },
  {
    id: "rainen-keigo",
    timing: "before",
    levels: ["keigo"],
    native: "来年も変わらぬお引き立てのほど、お願い申し上げます。",
    romaji: "Rainen mo kawaranu ohikitate no hodo, onegai mōshiagemasu.",
    english: "I hope for your unchanging support next year as well.",
  },
  {
    id: "rainen-polite",
    timing: "before",
    levels: ["polite"],
    native: "来年もよろしくお願いします。",
    romaji: "Rainen mo yoroshiku onegai shimasu.",
    english: "Looking forward to next year too.",
  },
  {
    id: "rainen-casual",
    timing: "before",
    levels: ["casual"],
    native: "来年もよろしくね！",
    romaji: "Rainen mo yoroshiku ne!",
    english: "See you next year!",
  },
];

/** Closing wish. */
export const WISHES = [
  {
    id: "kenko-keigo",
    timing: "after",
    levels: ["keigo"],
    native: "皆様のご健康とご多幸を心よりお祈り申し上げます。",
    romaji: "Minasama no gokenkō to gotakō o kokoro yori oinori mōshiagemasu.",
    english: "I sincerely wish you all good health and every happiness.",
  },
  {
    id: "hatten-keigo",
    timing: "after",
    levels: ["keigo"],
    native: "貴社のますますのご発展をお祈り申し上げます。",
    romaji: "Kisha no masumasu no gohatten o oinori mōshiagemasu.",
    english: "Wishing your company continued growth.",
  },
  {
    id: "subarashii-polite",
    timing: "after",
    levels: ["keigo", "polite"],
    native: "素晴らしい一年になりますように。",
    romaji: "Subarashii ichinen ni narimasu yō ni.",
    english: "May it be a wonderful year.",
  },
  {
    id: "saiko-casual",
    timing: "after",
    levels: ["casual"],
    native: "最高の一年にしようね！",
    romaji: "Saikō no ichinen ni shiyō ne!",
    english: "Let's make it the best year yet!",
  },
  {
    id: "asobou-casual",
    timing: "after",
    levels: ["casual"],
    native: "今年もいっぱい会おうね！",
    romaji: "Kotoshi mo ippai aō ne!",
    english: "Let's see lots of each other this year!",
  },
  {
    id: "omukae-keigo",
    timing: "before",
    levels: ["keigo", "polite"],
    native: "ご家族おそろいで良いお年をお迎えください。",
    romaji: "Gokazoku osoroide yoi otoshi o omukae kudasai.",
    english: "May you and your family see in the New Year well.",
  },
  {
    id: "goziai-keigo",
    timing: "before",
    levels: ["keigo"],
    native: "寒さ厳しき折、どうぞご自愛くださいませ。",
    romaji: "Samusa kibishiki ori, dōzo gojiai kudasaimase.",
    english: "In this deep cold, please take good care of yourself.",
  },
  {
    id: "mata-casual",
    timing: "before",
    levels: ["casual"],
    native: "また来年ね！",
    romaji: "Mata rainen ne!",
    english: "See you next year!",
  },
];

/**
 * Words avoided on a nengajo (忌み言葉). Informational; shown next to the result.
 */
export const IMIKOTOBA = [
  ["去年", "昨年 / 旧年", "去 carries the sense of leaving or parting."],
  ["忙しい", "多用", "The kanji 忙 contains 亡, 'to perish'."],
  ["終わる", "結ぶ", "Words for ending are avoided in a celebratory message."],
  ["落ちる・倒れる", "leave the sentence out", "Words about falling or collapsing are unlucky on a New Year card."],
  ["病む", "leave the sentence out", "Words about illness are inauspicious on a card meant to wish for good health."],
  ["、。 (punctuation)", "a space or a line break", "Nengajo are traditionally written without full stops, which suggest an ending."],
];

/** Matsunouchi (the New Year period) ends on different days by region. */
export const MATSUNOUCHI_END = { kanto: 7, kansai: 15 };
export const REGIONS = [
  { id: "kanto", label: "Kanto and most of Japan — matsunouchi ends 7 January" },
  { id: "kansai", label: "Kansai — matsunouchi ends 15 January" },
];

/** Risshun, the start of spring, falls on 3-4 February; 4 February is the usual date. */
export const RISSHUN_MONTH = 2;
export const RISSHUN_DAY = 4;

export const MAX_MESSAGES = 5;
export const MAX_NAME_LENGTH = 40;
/** Heisei ran 8 Jan 1989 - 30 Apr 2019; Reiwa began 1 May 2019. */
export const MIN_YEAR = 1989;
export const MAX_YEAR = 2100;

/**
 * Japanese era year for 1 January of a Gregorian year.
 * 1 January 2019 was still Heisei 31 because Reiwa began on 1 May 2019.
 * 1 January 1989 was still Showa 64: Emperor Showa died 7 January 1989 and
 * Heisei only began the next day, so New Year's Day 1989 predates Heisei.
 */
export function japaneseEraYear(year) {
  if (!Number.isInteger(year)) return null;
  if (year >= 2020 && year <= MAX_YEAR) {
    return { era: "令和", eraRomaji: "Reiwa", eraYear: year - 2018 };
  }
  if (year === 1989) {
    return { era: "昭和", eraRomaji: "Showa", eraYear: 64 };
  }
  if (year >= 1990 && year <= 2019) {
    return { era: "平成", eraRomaji: "Heisei", eraYear: year - 1988 };
  }
  return null;
}

/**
 * Which New Year card is correct on a given date.
 * @param {{month:number, day:number, region?:"kanto"|"kansai"}} input
 */
export function greetingWindow({ month, day, region = "kanto" } = {}) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { error: "Month must be a whole number from 1 to 12." };
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return { error: "Day must be a whole number from 1 to 31." };
  }
  const end = MATSUNOUCHI_END[region] ?? MATSUNOUCHI_END.kanto;

  if (month === 12) {
    return {
      phase: "before",
      label: "Year-end greeting",
      guidance: "Say 良いお年を (yoi otoshi o). Do not use あけましておめでとう yet.",
      matsunouchiEnd: end,
    };
  }
  if (month === 1 && day <= end) {
    return {
      phase: "newyear",
      label: "Nengajo season (matsunouchi)",
      guidance: `あけましておめでとうございます is correct until ${end} January in this region.`,
      matsunouchiEnd: end,
    };
  }
  const beforeRisshun =
    month === 1 || (month === RISSHUN_MONTH && day <= RISSHUN_DAY);
  if (beforeRisshun) {
    return {
      phase: "kanchu",
      label: "Kanchu-mimai (寒中見舞い)",
      guidance: `Matsunouchi has ended. Send a kanchu-mimai instead, up to risshun on ${RISSHUN_DAY} February.`,
      matsunouchiEnd: end,
    };
  }
  if (month === RISSHUN_MONTH) {
    return {
      phase: "yokan",
      label: "Yokan-mimai (余寒見舞い)",
      guidance: "After risshun, a late-winter yokan-mimai is the correct card, until the end of February.",
      matsunouchiEnd: end,
    };
  }
  return {
    phase: "outside",
    label: "Outside the New Year season",
    guidance: "New Year cards run from late December to the end of February.",
    matsunouchiEnd: end,
  };
}

/** Deterministic 32-bit PRNG (mulberry32). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seed) {
  const out = items.slice();
  const random = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Next seed in a fixed sequence, so a shuffle button stays reproducible. */
export function nextSeed(seed) {
  const current = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 1;
  return (current * 1664525 + 1013904223) % 2147483647 || 1;
}

export function cleanName(raw) {
  if (raw === undefined || raw === null) return "";
  return String(raw).replace(/\s+/g, " ").trim();
}

const pick = (list, seed, offset) => {
  if (list.length === 0) return null;
  const shuffled = seededShuffle(list, seed + offset * 7919);
  return shuffled[0];
};

/**
 * Compose Japanese New Year messages.
 *
 * @param {object} input
 * @param {string} [input.name]
 * @param {string} [input.honorificId]
 * @param {string} [input.recipientId]
 * @param {"keigo"|"polite"|"casual"} [input.politeness]
 * @param {"before"|"after"} [input.timing]
 * @param {number} [input.year] the incoming year
 * @param {boolean} [input.includeDateLine] add the 令和X年 元旦 line
 * @param {number} [input.count]
 * @param {number} [input.seed]
 * @returns {{messages:Array, ...}|{error:string}}
 */
export function generateJapaneseNewYearWishes({
  name = "",
  honorificId = "sama",
  recipientId = "client",
  politeness = "keigo",
  timing = "after",
  year = 2027,
  includeDateLine = true,
  count = 3,
  seed = 1,
} = {}) {
  const recipient = RECIPIENTS.find((item) => item.id === recipientId);
  if (!recipient) return { error: "Choose who the greeting is for." };

  const honorific = HONORIFICS.find((item) => item.id === honorificId);
  if (!honorific) return { error: "Choose an honorific, or choose 'No suffix'." };

  if (!POLITENESS_LEVELS.some((item) => item.id === politeness)) {
    return { error: "Choose keigo, polite or casual." };
  }
  if (!TIMINGS.some((item) => item.id === timing)) {
    return { error: "Choose whether you are sending before or after 1 January." };
  }
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_MESSAGES) {
    return { error: `Ask for between 1 and ${MAX_MESSAGES} messages.` };
  }
  if (!Number.isFinite(seed)) return { error: "The shuffle seed must be a number." };

  const cleanedName = cleanName(name);
  if (cleanedName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }

  const matches = (item) => item.timing === timing && item.levels.includes(politeness);
  const gashiPool = GASHI.filter(matches);
  if (gashiPool.length === 0) {
    return { error: "No opening greeting fits that combination — try another politeness level." };
  }
  const thanksPool = THANKS.filter(matches);
  const requestPool = REQUESTS.filter(matches);
  const wishPool = WISHES.filter(matches);

  const safeSeed = Math.abs(Math.trunc(seed)) || 1;
  const openings = seededShuffle(gashiPool, safeSeed).slice(0, Math.min(count, gashiPool.length));

  const era = japaneseEraYear(year);
  // 元旦 means the morning of 1 January, so it never belongs on a year-end greeting.
  const dateLine =
    includeDateLine && era && timing === "after"
      ? {
          native: `${era.era}${era.eraYear}年 元旦`,
          romaji: `${era.eraRomaji} ${era.eraYear}-nen Gantan`,
          english: `New Year's Day, ${era.eraRomaji} ${era.eraYear} (${year})`,
        }
      : null;

  const addressee = cleanedName
    ? {
        native: `${cleanedName}${honorific.suffix}`,
        romaji: `${cleanedName}${honorific.romaji}`,
        english: `To ${cleanedName}`,
      }
    : null;

  const messages = openings.map((opening, index) => {
    const thanks = pick(thanksPool, safeSeed, index + 1);
    const request = pick(requestPool, safeSeed, index + 2);
    const wish = pick(wishPool, safeSeed, index + 3);
    const parts = [addressee, opening, thanks, request, wish, dateLine].filter(Boolean);

    return {
      id: opening.id,
      superiorSafe: opening.superiorSafe,
      note: opening.note,
      opening: {
        native: opening.native,
        romaji: opening.romaji,
        english: opening.english,
      },
      lines: parts.map((part) => ({
        native: part.native,
        romaji: part.romaji,
        english: part.english,
      })),
      native: parts.map((part) => part.native).join("\n"),
      romaji: parts.map((part) => part.romaji).join("\n"),
      english: parts.map((part) => part.english).join(" "),
    };
  });

  const warnUpward =
    (recipient.politeness === "keigo" || politeness === "keigo") &&
    messages.some((item) => item.superiorSafe === false);

  return {
    messages,
    recipient,
    honorific,
    politeness,
    timing,
    year,
    era,
    dateLine,
    requested: count,
    delivered: messages.length,
    poolSize: gashiPool.length,
    registerMismatch: politeness !== recipient.politeness,
    suggestedPoliteness: recipient.politeness,
    warnUpward,
  };
}
