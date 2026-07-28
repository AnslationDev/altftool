/**
 * Hindi birthday wishes composer.
 *
 * Pure data + pure functions. Two real rules drive the output:
 *
 * 1. T-V distinction. Hindi has आप (respectful) and तुम (familiar). The pronoun changes
 *    the possessive (आपका / तुम्हारा) and the verb ending, so every wording is written
 *    out twice rather than word-swapped. Relationships carry the register a Hindi
 *    speaker would normally use, and the caller can override it.
 * 2. SMS length. Devanagari falls outside the GSM 03.38 7-bit alphabet, so a message
 *    containing it is sent as UCS-2: 70 characters in a single SMS and 67 per part once
 *    the message is concatenated (GSM 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Hindi",
  nativeName: "हिन्दी",
  script: "Devanagari",
  iso: "hi",
};

/** Politeness registers. */
export const REGISTERS = [
  { id: "respectful", label: "आप — respectful", pronoun: "आप" },
  { id: "casual", label: "तुम — familiar", pronoun: "तुम" },
];

export const TONES = [
  { id: "any", label: "Any tone" },
  { id: "warm", label: "Warm and personal" },
  { id: "formal", label: "Formal and respectful" },
  { id: "blessing", label: "Blessing" },
  { id: "funny", label: "Light-hearted" },
];

/** Who the message is for. `register` is the pronoun a Hindi speaker would default to. */
export const RELATIONSHIPS = [
  {
    id: "friend",
    label: "Friend",
    register: "casual",
    salutation: { native: "प्रिय दोस्त {name},", roman: "Priya dost {name}," },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "casual",
    salutation: { native: "{name} भैया,", roman: "{name} bhaiyā," },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "casual",
    salutation: { native: "{name} दीदी,", roman: "{name} dīdī," },
  },
  {
    id: "younger-sibling",
    label: "Younger brother or sister",
    register: "casual",
    salutation: { native: "प्रिय {name},", roman: "Priya {name}," },
  },
  {
    id: "mother",
    label: "Mother",
    register: "respectful",
    salutation: { native: "प्रिय माँ,", roman: "Priya mā̃," },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    salutation: { native: "प्रिय पापा,", roman: "Priya pāpā," },
  },
  {
    id: "partner",
    label: "Partner or spouse",
    register: "casual",
    salutation: { native: "प्रिय {name},", roman: "Priya {name}," },
  },
  {
    id: "child",
    label: "Son or daughter",
    register: "casual",
    salutation: { native: "प्रिय {name},", roman: "Priya {name}," },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "respectful",
    salutation: { native: "प्रिय {name} जी,", roman: "Priya {name} jī," },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "respectful",
    salutation: { native: "आदरणीय {name} जी,", roman: "Ādaraṇīya {name} jī," },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "respectful",
    salutation: { native: "आदरणीय {name} जी,", roman: "Ādaraṇīya {name} jī," },
  },
];

/** Message bodies, written out once per register. */
export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    respectful: {
      native: "जन्मदिन की हार्दिक शुभकामनाएँ! आपका यह वर्ष खुशियों और अच्छी सेहत से भरा रहे।",
      roman: "Janmadin kī hārdik shubhkāmnāeṁ! Āpkā yah varṣ khushiyoṁ aur acchī sehat se bharā rahe.",
    },
    casual: {
      native: "जन्मदिन की हार्दिक शुभकामनाएँ! तुम्हारा यह साल खुशियों और अच्छी सेहत से भरा रहे।",
      roman: "Janmadin kī hārdik shubhkāmnāeṁ! Tumhārā yah sāl khushiyoṁ aur acchī sehat se bharā rahe.",
    },
    english: "Warmest wishes on your birthday! May this year be full of happiness and good health.",
  },
  {
    id: "warm-mubarak",
    tone: "warm",
    respectful: {
      native: "जन्मदिन मुबारक हो! ईश्वर आपको लंबी उम्र और अच्छी सेहत दे।",
      roman: "Janmadin mubārak ho! Īshvar āpko lambī umr aur acchī sehat de.",
    },
    casual: {
      native: "जन्मदिन मुबारक हो! भगवान तुम्हें लंबी उम्र और अच्छी सेहत दे।",
      roman: "Janmadin mubārak ho! Bhagvān tumheṁ lambī umr aur acchī sehat de.",
    },
    english: "Happy birthday! May you be granted a long life and good health.",
  },
  {
    id: "warm-badhai",
    tone: "warm",
    respectful: {
      native: "आपको जन्मदिन की बहुत-बहुत बधाई! आपकी हर इच्छा पूरी हो।",
      roman: "Āpko janmadin kī bahut-bahut badhāī! Āpkī har icchā pūrī ho.",
    },
    casual: {
      native: "तुम्हें जन्मदिन की बहुत-बहुत बधाई! तुम्हारी हर इच्छा पूरी हो।",
      roman: "Tumheṁ janmadin kī bahut-bahut badhāī! Tumhārī har icchā pūrī ho.",
    },
    english: "Many happy returns of the day! May every wish of yours come true.",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    respectful: {
      native: "जन्मदिन मुबारक! आप मेरी ज़िंदगी का सबसे अच्छा हिस्सा हैं।",
      roman: "Janmadin mubārak! Āp merī zindagī kā sabse acchā hissā haiṁ.",
    },
    casual: {
      native: "जन्मदिन मुबारक! तुम मेरी ज़िंदगी का सबसे अच्छा हिस्सा हो।",
      roman: "Janmadin mubārak! Tum merī zindagī kā sabse acchā hissā ho.",
    },
    english: "Happy birthday! You are the best part of my life.",
  },
  {
    id: "formal-shubh-avsar",
    tone: "formal",
    respectful: {
      native: "जन्मदिन के इस शुभ अवसर पर आपको हार्दिक शुभकामनाएँ। आपका जीवन यश और सफलता से भरा रहे।",
      roman:
        "Janmadin ke is shubh avsar par āpko hārdik shubhkāmnāeṁ. Āpkā jīvan yash aur safaltā se bharā rahe.",
    },
    casual: {
      native: "जन्मदिन के इस शुभ अवसर पर तुम्हें हार्दिक शुभकामनाएँ। तुम्हारा जीवन यश और सफलता से भरा रहे।",
      roman:
        "Janmadin ke is shubh avsar par tumheṁ hārdik shubhkāmnāeṁ. Tumhārā jīvan yash aur safaltā se bharā rahe.",
    },
    english:
      "Heartfelt wishes on this auspicious birthday. May your life be filled with honour and success.",
  },
  {
    id: "formal-progress",
    tone: "formal",
    respectful: {
      native: "आपको जन्मदिन की हार्दिक शुभकामनाएँ। आने वाला वर्ष आपके लिए स्वास्थ्य, शांति और प्रगति लाए।",
      roman:
        "Āpko janmadin kī hārdik shubhkāmnāeṁ. Āne vālā varṣ āpke lie svāsthya, shānti aur pragati lāe.",
    },
    casual: {
      native: "तुम्हें जन्मदिन की हार्दिक शुभकामनाएँ। आने वाला साल तुम्हारे लिए स्वास्थ्य, शांति और प्रगति लाए।",
      roman:
        "Tumheṁ janmadin kī hārdik shubhkāmnāeṁ. Āne vālā sāl tumhāre lie svāsthya, shānti aur pragati lāe.",
    },
    english: "Heartfelt birthday wishes. May the coming year bring you health, peace and progress.",
  },
  {
    id: "blessing-shatayu",
    tone: "blessing",
    respectful: {
      native: "जन्मदिन की शुभकामनाएँ! आप शतायु हों और जीवन में यश-कीर्ति प्राप्त करें।",
      roman: "Janmadin kī shubhkāmnāeṁ! Āp shatāyu hoṁ aur jīvan meṁ yash-kīrti prāpt kareṁ.",
    },
    casual: {
      native: "जन्मदिन की शुभकामनाएँ! तुम शतायु हो और जीवन में यश-कीर्ति प्राप्त करो।",
      roman: "Janmadin kī shubhkāmnāeṁ! Tum shatāyu ho aur jīvan meṁ yash-kīrti prāpt karo.",
    },
    english: "Birthday blessings! May you live a hundred years and earn honour and renown.",
  },
  {
    id: "blessing-diya",
    tone: "blessing",
    respectful: {
      native: "आपका जीवन दीपक की तरह रोशन रहे और हर दिन नई खुशी लाए। जन्मदिन मुबारक!",
      roman: "Āpkā jīvan dīpak kī tarah roshan rahe aur har din naī khushī lāe. Janmadin mubārak!",
    },
    casual: {
      native: "तुम्हारा जीवन दीपक की तरह रोशन रहे और हर दिन नई खुशी लाए। जन्मदिन मुबारक!",
      roman: "Tumhārā jīvan dīpak kī tarah roshan rahe aur har din naī khushī lāe. Janmadin mubārak!",
    },
    english: "May your life shine like a lamp and every day bring new joy. Happy birthday!",
  },
  {
    id: "funny-cake",
    tone: "funny",
    respectful: {
      native: "जन्मदिन मुबारक! केक आप काटिए, खाएँगे हम — यही तो असली रिश्ता है।",
      roman: "Janmadin mubārak! Cake āp kāṭie, khāeṁge ham — yahī to aslī rishtā hai.",
    },
    casual: {
      native: "जन्मदिन मुबारक! केक तुम काटो, खाएँगे हम — यही तो दोस्ती है।",
      roman: "Janmadin mubārak! Cake tum kāṭo, khāeṁge ham — yahī to dostī hai.",
    },
    english: "Happy birthday! You cut the cake, we'll eat it — that's what we're here for.",
  },
  {
    id: "funny-number",
    tone: "funny",
    respectful: {
      native: "जन्मदिन मुबारक! उम्र सिर्फ़ एक नंबर है — और आपका नंबर हर साल बेहतर होता जा रहा है।",
      roman: "Janmadin mubārak! Umr sirf ek number hai — aur āpkā number har sāl behtar hotā jā rahā hai.",
    },
    casual: {
      native: "जन्मदिन मुबारक! उम्र सिर्फ़ एक नंबर है — और तुम्हारा नंबर हर साल बेहतर होता जा रहा है।",
      roman:
        "Janmadin mubārak! Umr sirf ek number hai — aur tumhārā number har sāl behtar hotā jā rahā hai.",
    },
    english: "Happy birthday! Age is just a number — and yours keeps getting better every year.",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    respectful: {
      native: "जन्मदिन मुबारक! आपकी ज़िंदगी में खुशियाँ वाई-फ़ाई की तरह हमेशा जुड़ी रहें।",
      roman: "Janmadin mubārak! Āpkī zindagī meṁ khushiyā̃ Wi-Fi kī tarah hamesha juṛī raheṁ.",
    },
    casual: {
      native: "जन्मदिन मुबारक! तुम्हारी ज़िंदगी में खुशियाँ वाई-फ़ाई की तरह हमेशा जुड़ी रहें।",
      roman: "Janmadin mubārak! Tumhārī zindagī meṁ khushiyā̃ Wi-Fi kī tarah hamesha juṛī raheṁ.",
    },
    english: "Happy birthday! May happiness stay connected to your life like Wi-Fi.",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    respectful: {
      native: "आपके आशीर्वाद से ही हमारा घर है। जन्मदिन की हार्दिक शुभकामनाएँ — आप स्वस्थ और प्रसन्न रहें।",
      roman:
        "Āpke āshīrvād se hī hamārā ghar hai. Janmadin kī hārdik shubhkāmnāeṁ — āp svasth aur prasann raheṁ.",
    },
    casual: {
      native: "तुम्हारे साथ से ही हमारा घर है। जन्मदिन की हार्दिक शुभकामनाएँ — तुम स्वस्थ और प्रसन्न रहो।",
      roman:
        "Tumhāre sāth se hī hamārā ghar hai. Janmadin kī hārdik shubhkāmnāeṁ — tum svasth aur prasann raho.",
    },
    english: "Our home rests on your blessing. Heartfelt birthday wishes — stay well and happy.",
  },
];

/** Sign-offs, chosen by register. */
export const CLOSINGS = {
  respectful: { native: "सादर शुभकामनाओं सहित,", roman: "Sādar shubhkāmnāoṁ sahit," },
  casual: { native: "ढेर सारा प्यार,", roman: "Ḍher sārā pyār," },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/**
 * GSM 03.38 basic alphabet. Anything outside it (all Devanagari) forces UCS-2 encoding.
 */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Extension characters cost two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€";

/** Single-part and concatenated limits from 3GPP TS 23.038 / 23.040. */
export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

/**
 * How many SMS parts a message needs.
 * Devanagari is not in the GSM alphabet, so Hindi text is always UCS-2.
 */
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

  // UCS-2 counts 16-bit code units, which is exactly String#length in JavaScript.
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

/** Drop a dangling "{name}" and tidy the spacing left behind when no name is given. */
function applyName(template, name) {
  if (name) return template.replaceAll("{name}", name);
  return template.replaceAll("{name}", "").replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
}

/**
 * Compose Hindi birthday messages.
 *
 * @param {object} input
 * @param {string} [input.name] the birthday person
 * @param {string} [input.relationshipId] one of RELATIONSHIPS
 * @param {"auto"|"respectful"|"casual"} [input.register]
 * @param {string} [input.tone] one of TONES
 * @param {number} [input.count] 1..MAX_MESSAGES
 * @param {number} [input.seed] integer; same seed gives the same messages
 * @param {string} [input.senderName] signed under the closing
 * @returns {{messages:Array, ...}|{error:string}}
 */
export function generateHindiBirthdayWishes({
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
    return { error: "Choose आप, तुम or automatic." };
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
