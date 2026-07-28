/**
 * Gujarati birthday wishes composer.
 *
 * Pure data + pure functions. Two real rules drive the output:
 *
 * 1. T-V distinction. Gujarati has તું (familiar) and તમે (respectful). The choice
 *    changes the possessive (તારું / તમારું) and the verb ending, so each wording is
 *    written out twice rather than word-swapped. Relationships carry the register a
 *    Gujarati speaker would normally use, and the caller can override it.
 * 2. SMS length. Gujarati script falls outside the GSM 03.38 7-bit alphabet, so the text
 *    is sent as UCS-2: 70 characters in a single SMS and 67 per part once concatenated
 *    (3GPP TS 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Gujarati",
  nativeName: "ગુજરાતી",
  script: "Gujarati",
  iso: "gu",
};

export const REGISTERS = [
  { id: "respectful", label: "તમે — respectful", pronoun: "તમે" },
  { id: "casual", label: "તું — familiar", pronoun: "તું" },
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
    salutation: { native: "પ્રિય {name},", roman: "Priya {name}," },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "casual",
    salutation: { native: "{name} ભાઈ,", roman: "{name} bhāī," },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "casual",
    salutation: { native: "{name} બહેન,", roman: "{name} bahen," },
  },
  {
    id: "younger-sibling",
    label: "Younger brother or sister",
    register: "casual",
    salutation: { native: "પ્રિય {name},", roman: "Priya {name}," },
  },
  {
    id: "mother",
    label: "Mother",
    register: "respectful",
    salutation: { native: "પ્રિય મમ્મી,", roman: "Priya mammī," },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    salutation: { native: "પ્રિય પપ્પા,", roman: "Priya pappā," },
  },
  {
    id: "partner",
    label: "Partner or spouse",
    register: "casual",
    salutation: { native: "પ્રિય {name},", roman: "Priya {name}," },
  },
  {
    id: "child",
    label: "Son or daughter",
    register: "casual",
    salutation: { native: "પ્રિય {name},", roman: "Priya {name}," },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "respectful",
    salutation: { native: "પ્રિય {name},", roman: "Priya {name}," },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "respectful",
    salutation: { native: "આદરણીય {name},", roman: "Ādaraṇīya {name}," },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "respectful",
    salutation: { native: "આદરણીય ગુરુજી,", roman: "Ādaraṇīya gurujī," },
  },
];

export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    respectful: {
      native: "જન્મદિવસની હાર્દિક શુભેચ્છા! તમારું આ વર્ષ આનંદ અને સારા આરોગ્યથી ભરેલું રહે.",
      roman:
        "Janmadivasnī hārdik shubhecchā! Tamāruṁ ā varṣa ānand ane sārā ārogyathī bharelũ rahe.",
    },
    casual: {
      native: "જન્મદિવસની હાર્દિક શુભેચ્છા! તારું આ વર્ષ આનંદ અને સારા આરોગ્યથી ભરેલું રહે.",
      roman: "Janmadivasnī hārdik shubhecchā! Tāruṁ ā varṣa ānand ane sārā ārogyathī bharelũ rahe.",
    },
    english: "Heartfelt birthday wishes! May this year be full of joy and good health.",
  },
  {
    id: "warm-mubarak",
    tone: "warm",
    respectful: {
      native: "જન્મદિન મુબારક! તમારી દરેક ઇચ્છા પૂરી થાય.",
      roman: "Janmadin mubārak! Tamārī darek icchā pūrī thāy.",
    },
    casual: {
      native: "જન્મદિન મુબારક! તારી દરેક ઇચ્છા પૂરી થાય.",
      roman: "Janmadin mubārak! Tārī darek icchā pūrī thāy.",
    },
    english: "Happy birthday! May every wish of yours be fulfilled.",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    respectful: {
      native: "જન્મદિવસની શુભેચ્છા! તમે મારા જીવનનો સૌથી સુંદર ભાગ છો.",
      roman: "Janmadivasnī shubhecchā! Tame mārā jīvanno sauthī sundar bhāg cho.",
    },
    casual: {
      native: "જન્મદિવસની શુભેચ્છા! તું મારા જીવનનો સૌથી સુંદર ભાગ છે.",
      roman: "Janmadivasnī shubhecchā! Tuṁ mārā jīvanno sauthī sundar bhāg che.",
    },
    english: "Happy birthday! You are the loveliest part of my life.",
  },
  {
    id: "warm-smile",
    tone: "warm",
    respectful: {
      native: "તમારા ચહેરા પરનું સ્મિત ક્યારેય ઓછું ન થાય. જન્મદિવસની શુભેચ્છા!",
      roman: "Tamārā caherā parnuṁ smit kyārey ochhuṁ na thāy. Janmadivasnī shubhecchā!",
    },
    casual: {
      native: "તારા ચહેરા પરનું સ્મિત ક્યારેય ઓછું ન થાય. જન્મદિવસની શુભેચ્છા!",
      roman: "Tārā caherā parnuṁ smit kyārey ochhuṁ na thāy. Janmadivasnī shubhecchā!",
    },
    english: "May the smile on your face never dim. Happy birthday!",
  },
  {
    id: "formal-career",
    tone: "formal",
    respectful: {
      native: "આપના જન્મદિવસ નિમિત્તે હાર્દિક શુભેચ્છા. આપની આગામી કારકિર્દી વધુ સફળ રહે.",
      roman:
        "Āpnā janmadivas nimitte hārdik shubhecchā. Āpnī āgāmī kārkirdī vadhu saphaḷ rahe.",
    },
    casual: {
      native: "તારા જન્મદિવસ નિમિત્તે હાર્દિક શુભેચ્છા. તારી આગામી કારકિર્દી વધુ સફળ રહે.",
      roman: "Tārā janmadivas nimitte hārdik shubhecchā. Tārī āgāmī kārkirdī vadhu saphaḷ rahe.",
    },
    english: "Heartfelt wishes on your birthday. May the career ahead of you be even more successful.",
  },
  {
    id: "formal-health",
    tone: "formal",
    respectful: {
      native: "લાંબું આયુષ્ય અને ઉત્તમ આરોગ્યની શુભકામના. જન્મદિવસની શુભેચ્છા!",
      roman: "Lāmbuṁ āyuṣya ane uttam ārogyanī shubhkāmnā. Janmadivasnī shubhecchā!",
    },
    casual: {
      native: "લાંબું આયુષ્ય અને ઉત્તમ આરોગ્યની શુભકામના. જન્મદિવસની શુભેચ્છા!",
      roman: "Lāmbuṁ āyuṣya ane uttam ārogyanī shubhkāmnā. Janmadivasnī shubhecchā!",
    },
    english: "Wishing you a long life and excellent health. Happy birthday!",
  },
  {
    id: "blessing-god",
    tone: "blessing",
    respectful: {
      native: "ઈશ્વર તમને લાંબું આયુષ્ય અને સારું આરોગ્ય આપે. જન્મદિવસની હાર્દિક શુભેચ્છા!",
      roman: "Īshvar tamne lāmbuṁ āyuṣya ane sāruṁ ārogya āpe. Janmadivasnī hārdik shubhecchā!",
    },
    casual: {
      native: "ઈશ્વર તને લાંબું આયુષ્ય અને સારું આરોગ્ય આપે. જન્મદિવસની હાર્દિક શુભેચ્છા!",
      roman: "Īshvar tane lāmbuṁ āyuṣya ane sāruṁ ārogya āpe. Janmadivasnī hārdik shubhecchā!",
    },
    english: "May God grant you a long life and good health. Heartfelt birthday wishes!",
  },
  {
    id: "blessing-life",
    tone: "blessing",
    respectful: {
      native: "તમારું જીવન સુખ, શાંતિ અને સફળતાથી ભરેલું રહે. જન્મદિવસની શુભેચ્છા!",
      roman: "Tamāruṁ jīvan sukh, shānti ane saphaḷtāthī bharelũ rahe. Janmadivasnī shubhecchā!",
    },
    casual: {
      native: "તારું જીવન સુખ, શાંતિ અને સફળતાથી ભરેલું રહે. જન્મદિવસની શુભેચ્છા!",
      roman: "Tāruṁ jīvan sukh, shānti ane saphaḷtāthī bharelũ rahe. Janmadivasnī shubhecchā!",
    },
    english: "May your life stay full of happiness, peace and success. Happy birthday!",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    respectful: {
      native: "તમારા આશીર્વાદથી જ અમારું ઘર છે. જન્મદિવસની હાર્દિક શુભેચ્છા — સ્વસ્થ અને પ્રસન્ન રહો.",
      roman:
        "Tamārā āshīrvādthī ja amāruṁ ghar che. Janmadivasnī hārdik shubhecchā — svasth ane prasann raho.",
    },
    casual: {
      native: "તારા સાથથી જ અમારું ઘર છે. જન્મદિવસની હાર્દિક શુભેચ્છા — સ્વસ્થ અને પ્રસન્ન રહે.",
      roman:
        "Tārā sāththī ja amāruṁ ghar che. Janmadivasnī hārdik shubhecchā — svasth ane prasann rahe.",
    },
    english: "Our home stands on you. Heartfelt birthday wishes — stay well and happy.",
  },
  {
    id: "funny-cake",
    tone: "funny",
    respectful: {
      native: "જન્મદિવસની શુભેચ્છા! કેક તમે કાપો, ખાઈશું અમે — આ જ સાચો પ્રેમ.",
      roman: "Janmadivasnī shubhecchā! Cake tame kāpo, khāīshuṁ ame — ā ja sāco prem.",
    },
    casual: {
      native: "જન્મદિવસની શુભેચ્છા! કેક તું કાપ, ખાઈશું અમે — આ જ સાચી દોસ્તી.",
      roman: "Janmadivasnī shubhecchā! Cake tuṁ kāp, khāīshuṁ ame — ā ja sācī dostī.",
    },
    english: "Happy birthday! You cut the cake, we'll eat it — that's real friendship.",
  },
  {
    id: "funny-number",
    tone: "funny",
    respectful: {
      native: "ઉંમર તો ફક્ત એક આંકડો છે — અને તમારો આંકડો દર વર્ષે વધુ સારો થતો જાય છે. જન્મદિન મુબારક!",
      roman:
        "Uṁmar to phakt ek āṁkaḍo che — ane tamāro āṁkaḍo dar varṣe vadhu sāro thato jāy che. Janmadin mubārak!",
    },
    casual: {
      native: "ઉંમર તો ફક્ત એક આંકડો છે — અને તારો આંકડો દર વર્ષે વધુ સારો થતો જાય છે. જન્મદિન મુબારક!",
      roman:
        "Uṁmar to phakt ek āṁkaḍo che — ane tāro āṁkaḍo dar varṣe vadhu sāro thato jāy che. Janmadin mubārak!",
    },
    english: "Age is just a number — and yours gets better every year. Happy birthday!",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    respectful: {
      native: "જન્મદિવસની શુભેચ્છા! તમારા જીવનમાં ખુશી વાઈ-ફાઈની જેમ હંમેશા કનેક્ટ રહે.",
      roman: "Janmadivasnī shubhecchā! Tamārā jīvanmāṁ khushī Wi-Fi nī jem hammeshā connect rahe.",
    },
    casual: {
      native: "જન્મદિવસની શુભેચ્છા! તારા જીવનમાં ખુશી વાઈ-ફાઈની જેમ હંમેશા કનેક્ટ રહે.",
      roman: "Janmadivasnī shubhecchā! Tārā jīvanmāṁ khushī Wi-Fi nī jem hammeshā connect rahe.",
    },
    english: "Happy birthday! May joy stay connected to your life like Wi-Fi.",
  },
];

export const CLOSINGS = {
  respectful: { native: "શુભેચ્છા સહ,", roman: "Shubhecchā saha," },
  casual: { native: "ખૂબ પ્રેમ સાથે,", roman: "Khūb prem sāthe," },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/** GSM 03.38 basic alphabet. Anything outside it (all Gujarati script) forces UCS-2. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Extension characters cost two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€";

/** Single-part and concatenated limits from 3GPP TS 23.038 / 23.040. */
export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

/** How many SMS parts a message needs. Gujarati script always lands in UCS-2. */
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
 * Compose Gujarati birthday messages.
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
export function generateGujaratiBirthdayWishes({
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
    return { error: "Choose તમે, તું or automatic." };
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
