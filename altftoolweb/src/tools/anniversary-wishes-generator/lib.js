/**
 * Anniversary wishes generator — pure text composition plus the standard
 * wedding-anniversary symbol tables. No I/O, no randomness.
 *
 * Two symbol lists are in general use:
 *   - The TRADITIONAL list (paper, cotton, leather, ...), popularised in the
 *     English-speaking world through the 19th century and codified by Emily Post.
 *   - The MODERN list (clocks, china, crystal, ...), published by the American
 *     National Retail Jeweler Association in 1937.
 * Both are conventions, not standards, so regional lists differ — the UK list
 * uses linen at year 4 where the US list uses fruit and flowers, for example.
 *
 * Only the years that actually carry a conventional symbol are listed: every year
 * from 1 to 15, then each fifth year to 75. Any other year returns no symbol
 * rather than an invented one.
 */

/** Anniversary years we accept. Year 0 is the wedding day, not an anniversary. */
export const MIN_YEARS = 1;
/** The longest verified marriage on record ran 86 years; 100 is a generous ceiling. */
export const MAX_YEARS = 100;
/** Longest name string we echo into a message. */
export const MAX_NAMES_LENGTH = 60;
/** Every tone pool holds exactly this many wordings per language. */
export const MAX_WISHES = 3;

/**
 * year -> { traditional, modern }
 * traditional = Emily Post / classic Western list.
 * modern = American National Retail Jeweler Association list, 1937.
 */
export const ANNIVERSARY_SYMBOLS = {
  1: { traditional: "Paper", modern: "Clocks" },
  2: { traditional: "Cotton", modern: "China" },
  3: { traditional: "Leather", modern: "Crystal or glass" },
  4: { traditional: "Fruit and flowers", modern: "Appliances" },
  5: { traditional: "Wood", modern: "Silverware" },
  6: { traditional: "Iron", modern: "Wood" },
  7: { traditional: "Wool or copper", modern: "Desk sets" },
  8: { traditional: "Bronze", modern: "Linens or lace" },
  9: { traditional: "Pottery or willow", modern: "Leather" },
  10: { traditional: "Tin or aluminium", modern: "Diamond jewellery" },
  11: { traditional: "Steel", modern: "Fashion jewellery" },
  12: { traditional: "Silk or linen", modern: "Pearls" },
  13: { traditional: "Lace", modern: "Textiles or furs" },
  14: { traditional: "Ivory", modern: "Gold jewellery" },
  15: { traditional: "Crystal", modern: "Watches" },
  20: { traditional: "China", modern: "Platinum" },
  25: { traditional: "Silver", modern: "Silver" },
  30: { traditional: "Pearl", modern: "Diamond" },
  35: { traditional: "Coral", modern: "Jade" },
  40: { traditional: "Ruby", modern: "Ruby" },
  45: { traditional: "Sapphire", modern: "Sapphire" },
  50: { traditional: "Gold", modern: "Gold" },
  55: { traditional: "Emerald", modern: "Emerald" },
  60: { traditional: "Diamond", modern: "Diamond" },
  65: { traditional: "Blue sapphire", modern: "Blue sapphire" },
  70: { traditional: "Platinum", modern: "Platinum" },
  75: { traditional: "Diamond", modern: "Diamond" },
};

/** Years that carry a named jubilee, with the Indian-language equivalents. */
export const JUBILEES = {
  25: { en: "Silver Jubilee", hi: "रजत जयंती", hinglish: "Rajat Jayanti (Silver Jubilee)" },
  40: { en: "Ruby Anniversary", hi: "रूबी वर्षगाँठ", hinglish: "Ruby varshganth" },
  50: { en: "Golden Jubilee", hi: "स्वर्ण जयंती", hinglish: "Swarn Jayanti (Golden Jubilee)" },
  60: { en: "Diamond Jubilee", hi: "हीरक जयंती", hinglish: "Heerak Jayanti (Diamond Jubilee)" },
  70: { en: "Platinum Jubilee", hi: "प्लैटिनम जयंती", hinglish: "Platinum Jayanti" },
};

export const LANGUAGES = [
  { id: "en", label: "English", lang: "en" },
  { id: "hi", label: "Hindi (हिन्दी)", lang: "hi" },
  { id: "hinglish", label: "Hinglish (Hindi in English letters)", lang: "hi-Latn" },
];

export const TONES = [
  { id: "heartfelt", label: "Heartfelt" },
  { id: "funny", label: "Funny" },
  { id: "formal", label: "Formal" },
  { id: "short", label: "Short (card / status)" },
];

/** Salutation word placed before the names, per relationship and language. */
export const RELATIONS = [
  {
    id: "spouse",
    label: "My husband / wife",
    salutation: { en: "My dearest", hi: "मेरे प्रिय", hinglish: "Mere pyare" },
    closing: {
      en: "Thank you for {years} years of putting up with me — here is to many more.",
      hi: "इन {years} सालों के लिए शुक्रिया — आगे और भी कई साल साथ।",
      hinglish: "In {years} saalon ke liye shukriya — aage aur bhi kai saal saath.",
    },
  },
  {
    id: "parents",
    label: "My parents",
    salutation: { en: "Dear", hi: "प्रिय", hinglish: "Priya" },
    closing: {
      en: "Thank you for showing us what a marriage actually looks like.",
      hi: "आप दोनों ने हमें दिखाया कि एक अच्छा रिश्ता कैसा होता है।",
      hinglish: "Aap dono ne humein dikhaya ki ek achha rishta kaisa hota hai.",
    },
  },
  {
    id: "grandparents",
    label: "My grandparents",
    salutation: { en: "Respected", hi: "आदरणीय", hinglish: "Aadarniya" },
    closing: {
      en: "{years} years together is a record this whole family is proud of.",
      hi: "{years} साल का साथ — पूरे परिवार के लिए गर्व की बात।",
      hinglish: "{years} saal ka saath — poore parivar ke liye garv ki baat.",
    },
  },
  {
    id: "sibling",
    label: "Brother / sister and their partner",
    salutation: { en: "Dear", hi: "प्रिय", hinglish: "Priya" },
    closing: {
      en: "Wishing you both many more years exactly like these.",
      hi: "आप दोनों को ऐसे ही कई और साल मिलें।",
      hinglish: "Aap dono ko aise hi kai aur saal milein.",
    },
  },
  {
    id: "friends",
    label: "Friends / a couple we know",
    salutation: { en: "Dear", hi: "प्रिय", hinglish: "Priya" },
    closing: {
      en: "Glad we get to watch you two keep choosing each other.",
      hi: "खुशी है कि हम आप दोनों का साथ देखते आ रहे हैं।",
      hinglish: "Khushi hai ki hum aap dono ka saath dekhte aa rahe hain.",
    },
  },
  {
    id: "colleague",
    label: "Colleague / client",
    salutation: { en: "Dear", hi: "आदरणीय", hinglish: "Aadarniya" },
    closing: {
      en: "Wishing you both a very happy anniversary and a great year ahead.",
      hi: "आप दोनों को सालगिरह की हार्दिक शुभकामनाएँ।",
      hinglish: "Aap dono ko saalgirah ki hardik shubhkamnayein.",
    },
  },
];

/**
 * Message bodies keyed by language then tone.
 * Placeholders: {ordinal} for "25th" / "25वीं", {years} for the plain number.
 */
export const BODIES = {
  en: {
    heartfelt: [
      "Happy {ordinal} wedding anniversary! {years} years of choosing each other every single day is no small thing.",
      "Wishing you a very happy {ordinal} anniversary. May this year bring the same laughter and patience the last {years} did.",
      "Congratulations on {years} years together. A marriage that lasts this long is built one ordinary day at a time.",
    ],
    funny: [
      "Happy {ordinal} anniversary! {years} years and neither of you has filed a formal complaint yet — impressive.",
      "Congratulations on {years} years of agreeing on what to watch. That alone deserves a medal.",
      "Happy {ordinal} anniversary. Still married, still speaking to each other — clearly you are doing something right.",
    ],
    formal: [
      "Warmest congratulations on your {ordinal} wedding anniversary. Wishing you continued health and happiness together.",
      "On the occasion of your {ordinal} anniversary, please accept our sincere good wishes for the years ahead.",
      "Congratulations on completing {years} years of married life. May the coming year bring you both joy and good health.",
    ],
    short: [
      "Happy {ordinal} anniversary! Here is to many more.",
      "{years} years together — congratulations!",
      "Happy anniversary! Wishing you both the very best.",
    ],
  },
  hi: {
    heartfelt: [
      "{ordinal} सालगिरह की हार्दिक शुभकामनाएँ! {years} साल तक एक-दूसरे का साथ निभाना छोटी बात नहीं है।",
      "सालगिरह मुबारक हो। यह साल भी उतनी ही हँसी और सब्र के साथ बीते जितने पिछले {years} साल बीते।",
      "{years} साल पूरे होने पर बधाई। ऐसा रिश्ता एक-एक दिन जोड़कर बनता है।",
    ],
    funny: [
      "{ordinal} सालगिरह मुबारक! {years} साल हो गए और अब तक किसी ने शिकायत दर्ज नहीं कराई — कमाल है।",
      "{years} साल तक यह तय करना कि आज क्या देखना है — इसी के लिए बधाई बनती है।",
      "सालगिरह मुबारक। अब भी साथ हैं और अब भी बात करते हैं — मतलब सब ठीक चल रहा है।",
    ],
    formal: [
      "आपकी {ordinal} विवाह वर्षगाँठ पर हार्दिक बधाई। आप दोनों स्वस्थ और प्रसन्न रहें।",
      "{ordinal} वर्षगाँठ के शुभ अवसर पर हमारी ओर से हार्दिक शुभकामनाएँ स्वीकार करें।",
      "वैवाहिक जीवन के {years} वर्ष पूर्ण होने पर बधाई। आने वाला वर्ष आप दोनों के लिए मंगलमय हो।",
    ],
    short: [
      "{ordinal} सालगिरह मुबारक! और भी कई साल साथ रहें।",
      "{years} साल का साथ — बहुत-बहुत बधाई!",
      "सालगिरह की हार्दिक शुभकामनाएँ!",
    ],
  },
  hinglish: {
    heartfelt: [
      "{ordinal} saalgirah ki hardik shubhkamnayein! {years} saal tak ek-doosre ka saath nibhana chhoti baat nahin hai.",
      "Saalgirah mubarak ho. Yeh saal bhi utni hi hansi aur sabr ke saath beete jitne pichhle {years} saal beete.",
      "{years} saal poore hone par badhai. Aisa rishta ek-ek din jodkar banta hai.",
    ],
    funny: [
      "{ordinal} saalgirah mubarak! {years} saal ho gaye aur ab tak kisi ne shikayat darj nahin karayi — kamaal hai.",
      "{years} saal tak yeh tay karna ki aaj kya dekhna hai — isi ke liye badhai banti hai.",
      "Saalgirah mubarak. Ab bhi saath hain aur ab bhi baat karte hain — matlab sab theek chal raha hai.",
    ],
    formal: [
      "Aapki {ordinal} vivah varshganth par hardik badhai. Aap dono swasth aur prasann rahein.",
      "{ordinal} varshganth ke shubh avsar par hamari or se hardik shubhkamnayein sweekar karein.",
      "Vaivahik jeevan ke {years} varsh poorn hone par badhai. Aane wala varsh aap dono ke liye mangalmay ho.",
    ],
    short: [
      "{ordinal} saalgirah mubarak! Aur bhi kai saal saath rahein.",
      "{years} saal ka saath — bahut-bahut badhai!",
      "Saalgirah ki hardik shubhkamnayein!",
    ],
  },
};

/** Sentence added when the year carries a named jubilee. */
export const JUBILEE_LINE = {
  en: "This is your {jubilee} — a milestone worth marking properly.",
  hi: "यह आपकी {jubilee} है — यह पड़ाव खास है।",
  hinglish: "Yeh aapki {jubilee} hai — yeh padav khaas hai.",
};

/** Optional sentence naming the traditional gift symbol (English names). */
export const SYMBOL_LINE = {
  en: "The {ordinal} anniversary is traditionally the {traditional} anniversary.",
  hi: "परंपरा के अनुसार {ordinal} वर्षगाँठ का प्रतीक {traditional} है।",
  hinglish: "Parampara ke anusaar {ordinal} varshganth ka prateek {traditional} hai.",
};

/** English ordinal suffix: 11, 12 and 13 always take "th". */
export function englishOrdinal(n) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

/** Hindi feminine ordinals used with वर्षगाँठ / सालगिरह; numerals beyond these take वीं. */
const HINDI_ORDINAL_WORDS = { 1: "पहली", 2: "दूसरी", 3: "तीसरी", 4: "चौथी", 6: "छठी" };

export function hindiOrdinal(n) {
  return HINDI_ORDINAL_WORDS[n] || `${n}वीं`;
}

/** Hinglish keeps the English ordinal, which is how people actually write it. */
export function ordinalFor(n, language) {
  if (language === "hi") return hindiOrdinal(n);
  return englishOrdinal(n);
}

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
  }
  return null;
}

/**
 * Look up the milestone facts for an anniversary year.
 *
 * @param {number} years
 * @returns {{years:number, ordinalEn:string, traditional:string|null, modern:string|null, jubilee:object|null}|{error:string}}
 */
export function anniversaryFacts(years) {
  const value = Number(years);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { error: "Years married must be a whole number." };
  }
  if (value < MIN_YEARS) {
    return { error: `An anniversary starts at ${MIN_YEARS} year — year 0 is the wedding day itself.` };
  }
  if (value > MAX_YEARS) {
    return { error: `Enter ${MAX_YEARS} years or fewer.` };
  }
  const symbols = ANNIVERSARY_SYMBOLS[value] || null;
  return {
    years: value,
    ordinalEn: englishOrdinal(value),
    traditional: symbols ? symbols.traditional : null,
    modern: symbols ? symbols.modern : null,
    jubilee: JUBILEES[value] || null,
  };
}

/**
 * Generate anniversary messages.
 *
 * @param {object} input
 * @param {string} input.names        Name or names on the card, e.g. "Rahul & Priya".
 * @param {string} input.relation     One of RELATIONS[].id
 * @param {number|string} input.years Completed years of marriage (1..MAX_YEARS)
 * @param {string} input.language     "en" | "hi" | "hinglish"
 * @param {string} input.tone         One of TONES[].id
 * @param {boolean} input.includeSymbol  Append the traditional gift symbol line
 * @param {number} input.count        How many message variants (1..MAX_WISHES)
 * @param {number} input.variantSeed  Deterministic rotation offset
 * @returns {{messages:Array<{id:string,text:string}>, facts:object, salutation:string, lang:string, poolSize:number}|{error:string}}
 */
export function generateAnniversaryWishes({
  names = "",
  relation = "friends",
  years = 25,
  language = "en",
  tone = "heartfelt",
  includeSymbol = true,
  count = 3,
  variantSeed = 0,
} = {}) {
  const cleanNames = String(names).replace(/\s+/g, " ").trim();
  const relationDef = findById(RELATIONS, relation);
  const languageDef = findById(LANGUAGES, language);
  const toneDef = findById(TONES, tone);

  if (!relationDef) return { error: "Choose a relationship from the list." };
  if (!languageDef) return { error: "Choose a language from the list." };
  if (!toneDef) return { error: "Choose a tone from the list." };
  if (!cleanNames) return { error: "Enter the name or names for the card." };
  if (cleanNames.length > MAX_NAMES_LENGTH) {
    return { error: `Keep the names under ${MAX_NAMES_LENGTH} characters.` };
  }

  const facts = anniversaryFacts(years);
  if (facts.error) return { error: facts.error };

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one message." };
  }
  if (wanted > MAX_WISHES) {
    return { error: `You can generate at most ${MAX_WISHES} messages at a time.` };
  }

  const ordinal = ordinalFor(facts.years, language);
  const salutation = `${relationDef.salutation[language]} ${cleanNames}`.trim();
  const closing = relationDef.closing[language].replace(/\{years\}/g, String(facts.years));

  const jubileeLine = facts.jubilee
    ? JUBILEE_LINE[language].replace("{jubilee}", facts.jubilee[language])
    : "";
  const symbolLine =
    includeSymbol && facts.traditional
      ? SYMBOL_LINE[language]
          .replace("{ordinal}", ordinal)
          .replace("{traditional}", facts.traditional)
      : "";

  const pool = BODIES[language][tone];
  const seed = Number.isFinite(Number(variantSeed))
    ? Math.abs(Math.trunc(Number(variantSeed)))
    : 0;
  const total = Math.min(Math.trunc(wanted), pool.length);

  const messages = [];
  for (let i = 0; i < total; i += 1) {
    const index = (seed + i) % pool.length;
    const body = pool[index]
      .replace(/\{ordinal\}/g, ordinal)
      .replace(/\{years\}/g, String(facts.years));
    const lines = [`${salutation},`, body];
    if (jubileeLine) lines.push(jubileeLine);
    if (symbolLine) lines.push(symbolLine);
    lines.push(closing);
    messages.push({ id: `${language}-${tone}-${index}`, text: lines.join("\n") });
  }

  return {
    messages,
    facts,
    salutation,
    lang: languageDef.lang,
    poolSize: pool.length,
  };
}
