/**
 * Nepali birthday wishes generator — pure text composition, no I/O.
 *
 * Nepali is written in Devanagari (Unicode U+0900–U+097F) and is also widely
 * typed in Roman letters on phones, so every message is stored as a matched
 * Devanagari / Roman pair.
 *
 * Nepali grammar marks respect through the second-person pronoun:
 *   तपाईं (tapai)  — polite/formal, used for elders, teachers, colleagues
 *   तिमी  (timi)   — casual, used for friends, siblings and anyone younger
 * The tone you pick decides which pronoun and which verb endings appear, which
 * is why the same greeting is written twice rather than swapped word by word.
 *
 * Selection is deterministic: `variantSeed` rotates the pool from
 * `variantSeed % poolLength`. Same input, same output.
 */

/** Longest name we echo back into a message, to keep output readable. */
export const MAX_NAME_LENGTH = 40;
/** Every tone pool holds exactly this many wordings. */
export const MAX_WISHES = 4;
/** Oldest verified human age is 122 (Jeanne Calment, 1997); 130 is a generous ceiling. */
export const MAX_AGE_YEARS = 130;

export const SCRIPTS = [
  { id: "nepali", label: "Devanagari (नेपाली)", lang: "ne" },
  { id: "roman", label: "Roman / Nepali in English letters", lang: "ne-Latn" },
];

export const TONES = [
  { id: "casual", label: "Casual & warm (timi)", pronoun: "timi" },
  { id: "formal", label: "Formal & respectful (tapai)", pronoun: "tapai" },
  { id: "blessing", label: "Blessing (tapai)", pronoun: "tapai" },
  { id: "funny", label: "Funny & teasing (timi)", pronoun: "timi" },
  { id: "short", label: "Short (status / WhatsApp)", pronoun: "neutral" },
];

/**
 * Relationship decides the form of address. Nepali distinguishes elder and
 * younger siblings lexically (dai/bhai, didi/bahini), so both appear here.
 * `useName` is false for parents, addressed as aama and buba, not by name.
 */
export const RELATIONS = [
  { id: "friend", label: "Friend", nepali: "मेरो प्रिय साथी", roman: "Mero priya sathi", useName: true },
  { id: "dai", label: "Elder brother (dai)", nepali: "प्रिय दाइ", roman: "Priya dai", useName: true },
  { id: "bhai", label: "Younger brother (bhai)", nepali: "प्रिय भाइ", roman: "Priya bhai", useName: true },
  { id: "didi", label: "Elder sister (didi)", nepali: "प्रिय दिदी", roman: "Priya didi", useName: true },
  { id: "bahini", label: "Younger sister (bahini)", nepali: "प्रिय बहिनी", roman: "Priya bahini", useName: true },
  { id: "mother", label: "Mother (aama)", nepali: "प्रिय आमा", roman: "Priya aama", useName: false },
  { id: "father", label: "Father (buba)", nepali: "प्रिय बुबा", roman: "Priya buba", useName: false },
  { id: "son", label: "Son", nepali: "मेरो प्रिय छोरा", roman: "Mero priya chhora", useName: true },
  { id: "daughter", label: "Daughter", nepali: "मेरी प्रिय छोरी", roman: "Meri priya chhori", useName: true },
  { id: "spouse", label: "Husband / wife", nepali: "मेरो जीवनसाथी", roman: "Mero jeevansathi", useName: true },
  {
    id: "teacher",
    label: "Teacher / elder",
    nepali: "आदरणीय",
    roman: "Aadaraniya",
    useName: true,
    suffixNepali: " ज्यू",
    suffixRoman: " jyu",
  },
  {
    id: "colleague",
    label: "Colleague",
    nepali: "",
    roman: "",
    useName: true,
    suffixNepali: " जी",
    suffixRoman: " ji",
  },
];

/** `{who}` is replaced by the composed form of address. */
export const MESSAGES = {
  casual: [
    {
      nepali: "{who}, जन्मदिनको हार्दिक शुभकामना! तिमीलाई दीर्घायु, राम्रो स्वास्थ्य र अपार खुसी मिलोस्।",
      roman:
        "{who}, janmadinko hardik shubhakamana! Timilai dirghayu, ramro swasthya ra apaar khusi milos.",
    },
    {
      nepali: "{who}, आजको दिन तिम्रो हो। शुभ जन्मदिन — तिम्रा सबै इच्छा पूरा होऊन्।",
      roman: "{who}, aajako din timro ho. Subha janmadin — timra sabai ichchha pura houn.",
    },
    {
      nepali: "{who}, तिम्रो हाँसोले हाम्रो घर उज्यालो हुन्छ। जन्मदिनको शुभकामना — सधैं यसरी नै हाँसिरहनू।",
      roman:
        "{who}, timro hansole hamro ghar ujyalo huncha. Janmadinko shubhakamana — sadhain yasari nai hansirahanu.",
    },
    {
      nepali: "{who}, तिमीले हामीलाई दिने खुसी भन्दा दोब्बर खुसी तिमीले पाऊ। शुभ जन्मदिन!",
      roman: "{who}, timile hamilai dine khusi bhanda dobbar khusi timile paau. Subha janmadin!",
    },
  ],
  formal: [
    {
      nepali:
        "{who}, तपाईंको जन्मदिनको उपलक्ष्यमा हार्दिक शुभकामना। तपाईंको स्वास्थ्य र सफलताको कामना गर्दछु।",
      roman:
        "{who}, tapaiko janmadinko upalakshyama hardik shubhakamana. Tapaiko swasthya ra saphalatako kamana gardachhu.",
    },
    {
      nepali: "{who}, शुभ जन्मदिन। आउने वर्षले तपाईंलाई प्रगति र नयाँ अवसर ल्याओस्।",
      roman: "{who}, subha janmadin. Aaune varshale tapailai pragati ra nayan awasar lyaos.",
    },
    {
      nepali:
        "{who}, हाम्रो सम्पूर्ण परिवारको तर्फबाट जन्मदिनको शुभकामना। स्वस्थ रहनुहोस्, खुसी रहनुहोस्।",
      roman:
        "{who}, hamro sampurna parivarko tarphabata janmadinko shubhakamana. Swastha rahanuhos, khusi rahanuhos.",
    },
    {
      nepali:
        "{who}, तपाईंको मिहिनेत र सरलता हामी सबैका लागि उदाहरण हो। जन्मदिनको हार्दिक शुभकामना।",
      roman:
        "{who}, tapaiko mihinet ra saralata hami sabaika lagi udaharan ho. Janmadinko hardik shubhakamana.",
    },
  ],
  blessing: [
    {
      nepali: "{who}, ईश्वरले तपाईंलाई सधैं सुख, शान्ति र दीर्घायु प्रदान गरून्। शुभ जन्मदिन।",
      roman:
        "{who}, ishwarle tapailai sadhain sukha, shanti ra dirghayu pradan garun. Subha janmadin.",
    },
    {
      nepali: "{who}, पशुपतिनाथले तपाईंको रक्षा गरून् र हरेक बाटो सजिलो बनाऊन्। जन्मदिनको शुभकामना।",
      roman:
        "{who}, Pashupatinathle tapaiko raksha garun ra harek bato sajilo banaun. Janmadinko shubhakamana.",
    },
    {
      nepali: "{who}, कामना छ कि तपाईंको हरेक दिन खुसी र आशिर्वादले भरियोस्। शुभ जन्मदिन।",
      roman: "{who}, kamana chha ki tapaiko harek din khusi ra ashirbadle bhariyos. Subha janmadin.",
    },
    {
      nepali: "{who}, शतायु हुनुहोस्, स्वस्थ रहनुहोस्। जन्मदिनको हार्दिक शुभकामना।",
      roman: "{who}, shatayu hunuhos, swastha rahanuhos. Janmadinko hardik shubhakamana.",
    },
  ],
  funny: [
    {
      nepali: "{who}, एक वर्ष अझै ठूलो भयौ, तर बुद्धि उही! शुभ जन्मदिन — केकको ठूलो टुक्रा मेरो।",
      roman:
        "{who}, ek varsha ajhai thulo bhayau, tara buddhi uhi! Subha janmadin — kekko thulo tukra mero.",
    },
    {
      nepali: "{who}, शुभ जन्मदिन! मैनबत्ती अब केकमा अटाउँदैन, यसपटक एउटा मात्र बाल।",
      roman: "{who}, subha janmadin! Mainbatti aba kekma ataundaina, yaspatak euta matra bala.",
    },
    {
      nepali: "{who}, पार्टी कहाँ छ? जन्मदिनको शुभकामना, तर मित्रता खानाको स्तरमा भर पर्छ।",
      roman:
        "{who}, party kahan chha? Janmadinko shubhakamana, tara mitrata khanako starma bhar parchha.",
    },
    {
      nepali: "{who}, उमेर त एउटा संख्या मात्र हो — तर तिम्रो संख्या अलि ठूलो हुँदै गयो। शुभ जन्मदिन!",
      roman:
        "{who}, umer ta euta sankhya matra ho — tara timro sankhya ali thulo hundai gayo. Subha janmadin!",
    },
  ],
  short: [
    {
      nepali: "{who}, शुभ जन्मदिन! सधैं खुसी रहनू।",
      roman: "{who}, subha janmadin! Sadhain khusi rahanu.",
    },
    {
      nepali: "{who}, जन्मदिनको हार्दिक शुभकामना!",
      roman: "{who}, janmadinko hardik shubhakamana!",
    },
    {
      nepali: "{who}, शुभ जन्मदिन — दीर्घायु होऊ।",
      roman: "{who}, subha janmadin — dirghayu hou.",
    },
    {
      nepali: "{who}, जन्मदिनको शुभकामना! स्वस्थ र सफल रहनू।",
      roman: "{who}, janmadinko shubhakamana! Swastha ra saphal rahanu.",
    },
  ],
};

/** Optional extra sentence naming the age reached. */
export const AGE_LINE = {
  nepali: "जीवनको {age} वर्ष पूरा भएकोमा शुभकामना!",
  roman: "Jeevanko {age} varsha pura bhaekoma shubhakamana!",
};

function findById(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
  }
  return null;
}

/** Build the form of address, e.g. "प्रिय दाइ रमेश" / "Priya dai Ramesh". */
export function buildAddress(relation, name, script) {
  const prefix = script === "roman" ? relation.roman : relation.nepali;
  const suffix = (script === "roman" ? relation.suffixRoman : relation.suffixNepali) || "";
  const parts = [];
  if (prefix) parts.push(prefix);
  if (relation.useName && name) parts.push(name);
  const joined = parts.join(" ").trim();
  if (!joined) return name || "";
  return `${joined}${suffix}`;
}

/**
 * Generate Nepali birthday wishes.
 *
 * @param {object} input
 * @param {string} input.name        Birthday person's name.
 * @param {string} input.relation    One of RELATIONS[].id
 * @param {string} input.tone        One of TONES[].id
 * @param {string} input.script      "nepali" | "roman"
 * @param {number} input.count       How many wishes (1..MAX_WISHES)
 * @param {number|string} input.ageYears  Optional age turned; "" to omit
 * @param {number} input.variantSeed Deterministic rotation offset
 * @returns {{wishes:Array<{id:string,text:string}>, address:string, lang:string, pronoun:string, poolSize:number, tone:string, script:string}|{error:string}}
 */
export function generateWishes({
  name = "",
  relation = "friend",
  tone = "casual",
  script = "nepali",
  count = 3,
  ageYears = "",
  variantSeed = 0,
} = {}) {
  const cleanName = String(name).replace(/\s+/g, " ").trim();
  const relationDef = findById(RELATIONS, relation);
  const toneDef = findById(TONES, tone);
  const scriptDef = findById(SCRIPTS, script);

  if (!relationDef) return { error: "Choose a relationship from the list." };
  if (!toneDef) return { error: "Choose a tone from the list." };
  if (!scriptDef) return { error: "Choose Devanagari or Roman script." };
  if (relationDef.useName && !cleanName) {
    return { error: "Enter the birthday person's name." };
  }
  if (cleanName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one wish." };
  }
  if (wanted > MAX_WISHES) {
    return { error: `You can generate at most ${MAX_WISHES} wishes at a time.` };
  }

  let ageText = "";
  const rawAge = String(ageYears ?? "").trim();
  if (rawAge !== "") {
    const age = Number(rawAge);
    if (!Number.isFinite(age) || !Number.isInteger(age)) {
      return { error: "Age must be a whole number of years, or leave it blank." };
    }
    if (age < 1 || age > MAX_AGE_YEARS) {
      return { error: `Age should be between 1 and ${MAX_AGE_YEARS} years.` };
    }
    ageText = AGE_LINE[script].replace("{age}", String(age));
  }

  const pool = MESSAGES[tone];
  const address = buildAddress(relationDef, cleanName, script);
  const seed = Number.isFinite(Number(variantSeed))
    ? Math.abs(Math.trunc(Number(variantSeed)))
    : 0;
  const total = Math.min(Math.trunc(wanted), pool.length);

  const wishes = [];
  for (let i = 0; i < total; i += 1) {
    const index = (seed + i) % pool.length;
    let text = pool[index][script].replace("{who}", address);
    if (ageText) text = `${text} ${ageText}`;
    wishes.push({ id: `${tone}-${script}-${index}`, text });
  }

  return {
    wishes,
    address,
    lang: scriptDef.lang,
    pronoun: toneDef.pronoun,
    poolSize: pool.length,
    tone,
    script,
  };
}
