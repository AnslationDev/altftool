/**
 * Telugu birthday wishes composer.
 *
 * Pure data + pure functions. Two real rules drive the output:
 *
 * 1. T-V distinction. Telugu has నువ్వు (familiar) and మీరు (respectful). The choice
 *    changes the possessive (నీ / మీ) and the verb ending, so each wording is written
 *    out twice rather than word-swapped. Relationships carry the register a Telugu
 *    speaker would normally use, and the caller can override it.
 * 2. SMS length. Telugu script falls outside the GSM 03.38 7-bit alphabet, so the text
 *    is sent as UCS-2: 70 characters in a single SMS and 67 per part once concatenated
 *    (3GPP TS 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Telugu",
  nativeName: "తెలుగు",
  script: "Telugu",
  iso: "te",
};

export const REGISTERS = [
  { id: "respectful", label: "మీరు — respectful", pronoun: "మీరు" },
  { id: "casual", label: "నువ్వు — familiar", pronoun: "నువ్వు" },
];

export const TONES = [
  { id: "any", label: "Any tone" },
  { id: "warm", label: "Warm and personal" },
  { id: "formal", label: "Formal and respectful" },
  { id: "blessing", label: "Blessing" },
  { id: "funny", label: "Light-hearted" },
];

export const RELATIONSHIPS = [
  {
    id: "friend",
    label: "Friend",
    register: "casual",
    salutation: { native: "ప్రియమైన {name},", roman: "Priyamaina {name}," },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "casual",
    salutation: { native: "{name} అన్నయ్యా,", roman: "{name} annayyā," },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "casual",
    salutation: { native: "{name} అక్కా,", roman: "{name} akkā," },
  },
  {
    id: "younger-sibling",
    label: "Younger brother or sister",
    register: "casual",
    salutation: { native: "ప్రియమైన {name},", roman: "Priyamaina {name}," },
  },
  {
    id: "mother",
    label: "Mother",
    register: "respectful",
    // Telugu greets a parent as "Dear Mom," not by given name — the name field
    // has no placeholder to fill for this relationship.
    usesName: false,
    salutation: { native: "ప్రియమైన అమ్మా,", roman: "Priyamaina ammā," },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    usesName: false,
    salutation: { native: "ప్రియమైన నాన్నా,", roman: "Priyamaina nānnā," },
  },
  {
    id: "partner",
    label: "Partner or spouse",
    register: "casual",
    salutation: { native: "ప్రియమైన {name},", roman: "Priyamaina {name}," },
  },
  {
    id: "child",
    label: "Son or daughter",
    register: "casual",
    salutation: { native: "ప్రియమైన {name},", roman: "Priyamaina {name}," },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "respectful",
    salutation: { native: "{name} గారూ,", roman: "{name} gārū," },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "respectful",
    salutation: { native: "గౌరవనీయులైన {name} గారూ,", roman: "Gauravanīyulaina {name} gārū," },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "respectful",
    // Addressed by the respectful "Teacher" title rather than a given name.
    usesName: false,
    salutation: { native: "గౌరవనీయులైన గురువుగారూ,", roman: "Gauravanīyulaina guruvugārū," },
  },
];

export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    respectful: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! ఈ సంవత్సరం మీకు ఆనందం, మంచి ఆరోగ్యం కలగాలని కోరుకుంటున్నాను.",
      roman:
        "Puṭṭinarōju śubhākāṅkṣalu! Ī saṁvatsaraṁ mīku ānandaṁ, man̄ci ārōgyaṁ kalagālani kōrukuṇṭunnānu.",
    },
    casual: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! ఈ సంవత్సరం నీకు ఆనందం, మంచి ఆరోగ్యం కలగాలని కోరుకుంటున్నాను.",
      roman:
        "Puṭṭinarōju śubhākāṅkṣalu! Ī saṁvatsaraṁ nīku ānandaṁ, man̄ci ārōgyaṁ kalagālani kōrukuṇṭunnānu.",
    },
    english: "Happy birthday! I hope this year brings you joy and good health.",
  },
  {
    id: "warm-wishes",
    tone: "warm",
    respectful: {
      native: "జన్మదిన శుభాకాంక్షలు! మీ కోరికలన్నీ నెరవేరాలి.",
      roman: "Janmadina śubhākāṅkṣalu! Mī kōrikalannī neraverāli.",
    },
    casual: {
      native: "జన్మదిన శుభాకాంక్షలు! నీ కోరికలన్నీ నెరవేరాలి.",
      roman: "Janmadina śubhākāṅkṣalu! Nī kōrikalannī neraverāli.",
    },
    english: "Birthday wishes! May all your wishes come true.",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    respectful: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! నా జీవితంలో అత్యుత్తమ భాగం మీరే.",
      roman: "Puṭṭinarōju śubhākāṅkṣalu! Nā jīvitanlō atyuttama bhāgaṁ mīrē.",
    },
    casual: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! నా జీవితంలో అత్యుత్తమ భాగం నువ్వే.",
      roman: "Puṭṭinarōju śubhākāṅkṣalu! Nā jīvitanlō atyuttama bhāgaṁ nuvvē.",
    },
    english: "Happy birthday! You are the best part of my life.",
  },
  {
    id: "warm-smile",
    tone: "warm",
    respectful: {
      native: "మీ నవ్వు ఎప్పటికీ చెరగకూడదు. జన్మదిన శుభాకాంక్షలు!",
      roman: "Mī navvu eppaṭikī ceragakūḍadu. Janmadina śubhākāṅkṣalu!",
    },
    casual: {
      native: "నీ నవ్వు ఎప్పటికీ చెరగకూడదు. జన్మదిన శుభాకాంక్షలు!",
      roman: "Nī navvu eppaṭikī ceragakūḍadu. Janmadina śubhākāṅkṣalu!",
    },
    english: "May your smile never fade. Happy birthday!",
  },
  {
    id: "formal-work",
    tone: "formal",
    respectful: {
      native:
        "మీ పుట్టినరోజు సందర్భంగా హృదయపూర్వక శుభాకాంక్షలు. మీ కృషి మరింత విజయవంతం కావాలని కోరుకుంటున్నాను.",
      roman:
        "Mī puṭṭinarōju sandarbhaṅgā hr̥dayapūrvaka śubhākāṅkṣalu. Mī kr̥ṣi marinta vijayavantaṁ kāvālani kōrukuṇṭunnānu.",
    },
    casual: {
      native:
        "నీ పుట్టినరోజు సందర్భంగా హృదయపూర్వక శుభాకాంక్షలు. నీ కృషి మరింత విజయవంతం కావాలని కోరుకుంటున్నాను.",
      roman:
        "Nī puṭṭinarōju sandarbhaṅgā hr̥dayapūrvaka śubhākāṅkṣalu. Nī kr̥ṣi marinta vijayavantaṁ kāvālani kōrukuṇṭunnānu.",
    },
    english: "Heartfelt wishes on your birthday. May your work grow more successful still.",
  },
  {
    id: "formal-health",
    tone: "formal",
    respectful: {
      native: "దీర్ఘాయుష్షు, మంచి ఆరోగ్యం కలగాలని కోరుకుంటున్నాను. పుట్టినరోజు శుభాకాంక్షలు!",
      roman:
        "Dīrghāyuṣṣu, man̄ci ārōgyaṁ kalagālani kōrukuṇṭunnānu. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    casual: {
      native: "దీర్ఘాయుష్షు, మంచి ఆరోగ్యం కలగాలని కోరుకుంటున్నాను. పుట్టినరోజు శుభాకాంక్షలు!",
      roman:
        "Dīrghāyuṣṣu, man̄ci ārōgyaṁ kalagālani kōrukuṇṭunnānu. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    english: "Wishing you a long life and good health. Happy birthday!",
  },
  {
    id: "blessing-god",
    tone: "blessing",
    respectful: {
      native: "దేవుడు మీకు దీర్ఘాయుష్షు, ప్రశాంతత ప్రసాదించాలి. పుట్టినరోజు శుభాకాంక్షలు!",
      roman: "Dēvuḍu mīku dīrghāyuṣṣu, praśāntata prasādin̄cāli. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    casual: {
      native: "దేవుడు నీకు దీర్ఘాయుష్షు, ప్రశాంతత ప్రసాదించాలి. పుట్టినరోజు శుభాకాంక్షలు!",
      roman: "Dēvuḍu nīku dīrghāyuṣṣu, praśāntata prasādin̄cāli. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    english: "May God grant you long life and peace. Happy birthday!",
  },
  {
    id: "blessing-life",
    tone: "blessing",
    respectful: {
      native: "మీ జీవితం సంతోషంతో, విజయాలతో నిండాలి. పుట్టినరోజు శుభాకాంక్షలు!",
      roman: "Mī jīvitaṁ santōṣantō, vijayālatō niṇḍāli. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    casual: {
      native: "నీ జీవితం సంతోషంతో, విజయాలతో నిండాలి. పుట్టినరోజు శుభాకాంక్షలు!",
      roman: "Nī jīvitaṁ santōṣantō, vijayālatō niṇḍāli. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    english: "May your life be filled with happiness and success. Happy birthday!",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    respectful: {
      native: "మీ ఆశీస్సులతోనే మా ఇల్లు నిలిచింది. పుట్టినరోజు శుభాకాంక్షలు — ఆరోగ్యంగా, ఆనందంగా ఉండండి.",
      roman:
        "Mī āśīssulatōnē mā illu nilicindi. Puṭṭinarōju śubhākāṅkṣalu — ārōgyaṅgā, ānandaṅgā uṇḍaṇḍi.",
    },
    casual: {
      native: "నీ తోడుతోనే మా ఇల్లు నిలిచింది. పుట్టినరోజు శుభాకాంక్షలు — ఆరోగ్యంగా, ఆనందంగా ఉండు.",
      roman:
        "Nī tōḍutōnē mā illu nilicindi. Puṭṭinarōju śubhākāṅkṣalu — ārōgyaṅgā, ānandaṅgā uṇḍu.",
    },
    english: "Our home stands on you. Happy birthday — stay healthy and happy.",
  },
  {
    id: "funny-cake",
    tone: "funny",
    respectful: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! కేక్ మీరు కట్ చెయ్యండి, తినేది మేము — ఇదే నిజమైన ఆప్యాయత.",
      roman:
        "Puṭṭinarōju śubhākāṅkṣalu! Cake mīru cut ceyyaṇḍi, tinēdi mēmu — idē nijamaina āpyāyata.",
    },
    casual: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! కేక్ నువ్వు కట్ చెయ్, తినేది మేము — ఇదే నిజమైన స్నేహం.",
      roman: "Puṭṭinarōju śubhākāṅkṣalu! Cake nuvvu cut cey, tinēdi mēmu — idē nijamaina snēhaṁ.",
    },
    english: "Happy birthday! You cut the cake, we'll eat it — that's real friendship.",
  },
  {
    id: "funny-number",
    tone: "funny",
    respectful: {
      native: "వయసు ఒక సంఖ్య మాత్రమే — మీ సంఖ్య ప్రతి సంవత్సరం ఇంకా బాగుంటోంది. పుట్టినరోజు శుభాకాంక్షలు!",
      roman:
        "Vayasu oka saṅkhya mātramē — mī saṅkhya prati saṁvatsaraṁ iṅkā bāguṇṭōndi. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    casual: {
      native: "వయసు ఒక సంఖ్య మాత్రమే — నీ సంఖ్య ప్రతి సంవత్సరం ఇంకా బాగుంటోంది. పుట్టినరోజు శుభాకాంక్షలు!",
      roman:
        "Vayasu oka saṅkhya mātramē — nī saṅkhya prati saṁvatsaraṁ iṅkā bāguṇṭōndi. Puṭṭinarōju śubhākāṅkṣalu!",
    },
    english: "Age is just a number — and yours gets better every year. Happy birthday!",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    respectful: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! మీ జీవితంలో సంతోషం వై-ఫై లాగా ఎప్పుడూ కనెక్ట్ అయి ఉండాలి.",
      roman:
        "Puṭṭinarōju śubhākāṅkṣalu! Mī jīvitanlō santōṣaṁ Wi-Fi lāgā eppuḍū connect ayi uṇḍāli.",
    },
    casual: {
      native: "పుట్టినరోజు శుభాకాంక్షలు! నీ జీవితంలో సంతోషం వై-ఫై లాగా ఎప్పుడూ కనెక్ట్ అయి ఉండాలి.",
      roman:
        "Puṭṭinarōju śubhākāṅkṣalu! Nī jīvitanlō santōṣaṁ Wi-Fi lāgā eppuḍū connect ayi uṇḍāli.",
    },
    english: "Happy birthday! May joy stay connected to your life like Wi-Fi.",
  },
];

export const CLOSINGS = {
  respectful: { native: "శుభాకాంక్షలతో,", roman: "Śubhākāṅkṣalatō," },
  casual: { native: "ఎంతో ప్రేమతో,", roman: "Entō prēmatō," },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/** GSM 03.38 basic alphabet. Anything outside it (all Telugu script) forces UCS-2. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Extension characters cost two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€";

/** Single-part and concatenated limits from 3GPP TS 23.038 / 23.040. */
export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

/** How many SMS parts a message needs. Telugu script always lands in UCS-2. */
export function smsSegments(text) {
  const value = typeof text === "string" ? text : "";
  if (value.length === 0) {
    return { encoding: "GSM-7", units: 0, segments: 0, limit: GSM7_SINGLE };
  }

  let gsmUnits = 0;
  let isGsm = true;
  for (const char of value) {
    if (GSM_BASIC.includes(char)) gsmUnits += 1;
    else if (GSM_EXTENDED.includes(char)) gsmUnits += 2;
    else {
      isGsm = false;
      break;
    }
  }

  if (isGsm) {
    const segments = gsmUnits <= GSM7_SINGLE ? 1 : Math.ceil(gsmUnits / GSM7_CONCAT);
    return {
      encoding: "GSM-7",
      units: gsmUnits,
      segments,
      limit: segments === 1 ? GSM7_SINGLE : GSM7_CONCAT,
    };
  }

  const units = value.length;
  const segments = units <= UCS2_SINGLE ? 1 : Math.ceil(units / UCS2_CONCAT);
  return {
    encoding: "UCS-2",
    units,
    segments,
    limit: segments === 1 ? UCS2_SINGLE : UCS2_CONCAT,
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

function cleanName(raw) {
  if (raw === undefined || raw === null) return "";
  return String(raw).replace(/\s+/g, " ").trim();
}

function applyName(template, name) {
  if (name) return template.replaceAll("{name}", name);
  return template.replaceAll("{name}", "").replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
}

/**
 * Compose Telugu birthday messages.
 *
 * @param {object} input
 * @param {string} [input.name]
 * @param {string} [input.relationshipId]
 * @param {"auto"|"respectful"|"casual"} [input.register]
 * @param {string} [input.tone]
 * @param {number} [input.count] 1..MAX_MESSAGES
 * @param {number} [input.seed]
 * @param {string} [input.senderName]
 * @returns {{messages:Array, ...}|{error:string}}
 */
export function generateTeluguBirthdayWishes({
  name = "",
  relationshipId = "friend",
  register = "auto",
  tone = "any",
  count = 3,
  seed = 1,
  senderName = "",
} = {}) {
  const relationship = RELATIONSHIPS.find((item) => item.id === relationshipId);
  if (!relationship) return { error: "Choose who the message is for." };
  if (!TONES.some((item) => item.id === tone)) return { error: "Choose a valid tone." };
  if (register !== "auto" && !REGISTERS.some((item) => item.id === register)) {
    return { error: "Choose మీరు, నువ్వు or automatic." };
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_MESSAGES) {
    return { error: `Ask for between 1 and ${MAX_MESSAGES} messages.` };
  }
  if (!Number.isFinite(seed)) return { error: "The shuffle seed must be a number." };

  const cleanedName = cleanName(name);
  if (cleanedName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }
  const cleanedSender = cleanName(senderName);
  if (cleanedSender.length > MAX_NAME_LENGTH) {
    return { error: `Keep your own name under ${MAX_NAME_LENGTH} characters.` };
  }

  const usedRegister = register === "auto" ? relationship.register : register;
  let pool = TEMPLATES;
  if (tone !== "any") {
    const toned = TEMPLATES.filter((item) => item.tone === tone);
    if (toned.length > 0) pool = toned;
  }
  if (pool.length === 0) return { error: "No wording matches that tone." };

  const safeSeed = Math.abs(Math.trunc(seed)) || 1;
  const picked = seededShuffle(pool, safeSeed).slice(0, Math.min(count, pool.length));

  const salutation = {
    native: applyName(relationship.salutation.native, cleanedName),
    roman: applyName(relationship.salutation.roman, cleanedName),
  };
  const closing = CLOSINGS[usedRegister];
  const signature = {
    native: cleanedSender ? `${closing.native}\n${cleanedSender}` : closing.native,
    roman: cleanedSender ? `${closing.roman}\n${cleanedSender}` : closing.roman,
  };

  const messages = picked.map((item) => {
    const variant = item[usedRegister];
    const full = `${salutation.native}\n${variant.native}\n${signature.native}`;
    return {
      id: item.id,
      tone: item.tone,
      native: variant.native,
      roman: variant.roman,
      english: item.english,
      full,
      fullRoman: `${salutation.roman}\n${variant.roman}\n${signature.roman}`,
      sms: smsSegments(full),
    };
  });

  return {
    messages,
    language: LANGUAGE,
    relationship,
    register: usedRegister,
    autoRegister: relationship.register,
    registerOverridden: register !== "auto" && register !== relationship.register,
    tone,
    salutation,
    closing,
    requested: count,
    delivered: messages.length,
    poolSize: pool.length,
  };
}
