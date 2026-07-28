/**
 * Marathi birthday wishes composer.
 *
 * Pure data + pure functions. Two real rules drive the output:
 *
 * 1. T-V distinction. Marathi has तू (familiar) and तुम्ही (respectful). The choice
 *    changes the possessive (तुझं / तुमचं) and the verb agreement, so each wording is
 *    written out twice rather than word-swapped. Relationships carry the register a
 *    Marathi speaker would normally use, and the caller can override it.
 * 2. SMS length. Devanagari falls outside the GSM 03.38 7-bit alphabet, so Marathi text
 *    is sent as UCS-2: 70 characters in a single SMS and 67 per part once concatenated
 *    (3GPP TS 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Marathi",
  nativeName: "मराठी",
  script: "Devanagari",
  iso: "mr",
};

export const REGISTERS = [
  { id: "respectful", label: "तुम्ही — respectful", pronoun: "तुम्ही" },
  { id: "casual", label: "तू — familiar", pronoun: "तू" },
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
    salutation: { native: "प्रिय {name},", roman: "Priya {name}," },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "casual",
    salutation: { native: "{name} दादा,", roman: "{name} dādā," },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "casual",
    salutation: { native: "{name} ताई,", roman: "{name} tāī," },
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
    salutation: { native: "प्रिय आई,", roman: "Priya āī," },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    salutation: { native: "प्रिय बाबा,", roman: "Priya bābā," },
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
    salutation: { native: "प्रिय {name},", roman: "Priya {name}," },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "respectful",
    salutation: { native: "आदरणीय {name},", roman: "Ādaraṇīya {name}," },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "respectful",
    salutation: { native: "आदरणीय गुरुजी,", roman: "Ādaraṇīya gurujī," },
  },
];

export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    respectful: {
      native: "वाढदिवसाच्या हार्दिक शुभेच्छा! तुमचं हे वर्ष आनंदाने आणि उत्तम आरोग्याने भरून जावो.",
      roman:
        "Vāḍhadivasācyā hārdik shubhecchā! Tumcaṁ he varṣa ānandāne āṇi uttam ārogyāne bharūn jāvo.",
    },
    casual: {
      native: "वाढदिवसाच्या हार्दिक शुभेच्छा! तुझं हे वर्ष आनंदाने आणि उत्तम आरोग्याने भरून जावो.",
      roman:
        "Vāḍhadivasācyā hārdik shubhecchā! Tujhaṁ he varṣa ānandāne āṇi uttam ārogyāne bharūn jāvo.",
    },
    english: "Heartfelt birthday wishes! May this year be full of joy and good health.",
  },
  {
    id: "warm-lakh",
    tone: "warm",
    respectful: {
      native: "जन्मदिनाच्या लाख लाख शुभेच्छा! तुमच्या सर्व इच्छा पूर्ण होवोत.",
      roman: "Janmadinācyā lākh lākh shubhecchā! Tumcyā sarva icchā pūrṇa hovot.",
    },
    casual: {
      native: "जन्मदिनाच्या लाख लाख शुभेच्छा! तुझ्या सर्व इच्छा पूर्ण होवोत.",
      roman: "Janmadinācyā lākh lākh shubhecchā! Tujhyā sarva icchā pūrṇa hovot.",
    },
    english: "A hundred thousand birthday wishes! May all your wishes come true.",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    respectful: {
      native: "वाढदिवसाच्या शुभेच्छा! तुम्ही माझ्या आयुष्यातला सर्वात सुंदर भाग आहात.",
      roman: "Vāḍhadivasācyā shubhecchā! Tumhī mājhyā āyuṣyātlā sarvāt sundar bhāg āhāt.",
    },
    casual: {
      native: "वाढदिवसाच्या शुभेच्छा! तू माझ्या आयुष्यातला सर्वात सुंदर भाग आहेस.",
      roman: "Vāḍhadivasācyā shubhecchā! Tū mājhyā āyuṣyātlā sarvāt sundar bhāg āhes.",
    },
    english: "Happy birthday! You are the loveliest part of my life.",
  },
  {
    id: "warm-smile",
    tone: "warm",
    respectful: {
      native: "तुमच्या चेहऱ्यावरचं हसू कधीही कमी होऊ नये. वाढदिवसाच्या शुभेच्छा!",
      roman: "Tumcyā cehaṟyāvarcaṁ hasū kadhīhī kamī hoū naye. Vāḍhadivasācyā shubhecchā!",
    },
    casual: {
      native: "तुझ्या चेहऱ्यावरचं हसू कधीही कमी होऊ नये. वाढदिवसाच्या शुभेच्छा!",
      roman: "Tujhyā cehaṟyāvarcaṁ hasū kadhīhī kamī hoū naye. Vāḍhadivasācyā shubhecchā!",
    },
    english: "May the smile on your face never fade. Happy birthday!",
  },
  {
    id: "formal-manapurvak",
    tone: "formal",
    respectful: {
      native: "वाढदिवसानिमित्त मनःपूर्वक शुभेच्छा. तुम्हाला उत्तम आरोग्य आणि दीर्घायुष्य लाभो.",
      roman:
        "Vāḍhadivasānimitta manaḥpūrvak shubhecchā. Tumhālā uttam ārogya āṇi dīrghāyuṣya lābho.",
    },
    casual: {
      native: "वाढदिवसानिमित्त मनःपूर्वक शुभेच्छा. तुला उत्तम आरोग्य आणि दीर्घायुष्य लाभो.",
      roman: "Vāḍhadivasānimitta manaḥpūrvak shubhecchā. Tulā uttam ārogya āṇi dīrghāyuṣya lābho.",
    },
    english: "Sincere wishes on your birthday. May you have excellent health and a long life.",
  },
  {
    id: "formal-career",
    tone: "formal",
    respectful: {
      native: "आपल्या वाढदिवसानिमित्त हार्दिक शुभेच्छा. आपल्या पुढील वाटचालीस मनःपूर्वक शुभेच्छा.",
      roman:
        "Āpalyā vāḍhadivasānimitta hārdik shubhecchā. Āpalyā puḍhīl vāṭcālīs manaḥpūrvak shubhecchā.",
    },
    casual: {
      native: "तुझ्या वाढदिवसानिमित्त हार्दिक शुभेच्छा. तुझ्या पुढील वाटचालीस मनःपूर्वक शुभेच्छा.",
      roman:
        "Tujhyā vāḍhadivasānimitta hārdik shubhecchā. Tujhyā puḍhīl vāṭcālīs manaḥpūrvak shubhecchā.",
    },
    english: "Heartfelt wishes on your birthday, and every success in what comes next.",
  },
  {
    id: "blessing-udand",
    tone: "blessing",
    respectful: {
      native: "देव तुम्हाला उदंड आयुष्य देवो. वाढदिवसाच्या हार्दिक शुभेच्छा!",
      roman: "Dev tumhālā udaṇḍ āyuṣya devo. Vāḍhadivasācyā hārdik shubhecchā!",
    },
    casual: {
      native: "देव तुला उदंड आयुष्य देवो. वाढदिवसाच्या हार्दिक शुभेच्छा!",
      roman: "Dev tulā udaṇḍ āyuṣya devo. Vāḍhadivasācyā hārdik shubhecchā!",
    },
    english: "May God grant you a long life. Heartfelt birthday wishes!",
  },
  {
    id: "blessing-sukh",
    tone: "blessing",
    respectful: {
      native: "तुमचं आयुष्य सुख, समाधान आणि यशाने भरून जावो. वाढदिवसाच्या शुभेच्छा!",
      roman: "Tumcaṁ āyuṣya sukh, samādhān āṇi yashāne bharūn jāvo. Vāḍhadivasācyā shubhecchā!",
    },
    casual: {
      native: "तुझं आयुष्य सुख, समाधान आणि यशाने भरून जावो. वाढदिवसाच्या शुभेच्छा!",
      roman: "Tujhaṁ āyuṣya sukh, samādhān āṇi yashāne bharūn jāvo. Vāḍhadivasācyā shubhecchā!",
    },
    english: "May your life fill with happiness, contentment and success. Happy birthday!",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    respectful: {
      native: "तुमच्या आशीर्वादानेच आमचं घर उभं आहे. वाढदिवसाच्या हार्दिक शुभेच्छा — निरोगी आणि आनंदी राहा.",
      roman:
        "Tumcyā āshīrvādānec āmcaṁ ghar ubhaṁ āhe. Vāḍhadivasācyā hārdik shubhecchā — nirogī āṇi ānandī rāhā.",
    },
    casual: {
      native: "तुझ्या साथीनेच आमचं घर उभं आहे. वाढदिवसाच्या हार्दिक शुभेच्छा — निरोगी आणि आनंदी राहा.",
      roman:
        "Tujhyā sāthīnec āmcaṁ ghar ubhaṁ āhe. Vāḍhadivasācyā hārdik shubhecchā — nirogī āṇi ānandī rāhā.",
    },
    english: "Our home stands on you. Heartfelt birthday wishes — stay healthy and happy.",
  },
  {
    id: "funny-cake",
    tone: "funny",
    respectful: {
      native: "वाढदिवसाच्या शुभेच्छा! केक तुम्ही कापा, खाणार आम्ही — हेच तर खरं प्रेम.",
      roman: "Vāḍhadivasācyā shubhecchā! Cake tumhī kāpā, khāṇār āmhī — hec tar kharaṁ prem.",
    },
    casual: {
      native: "वाढदिवसाच्या शुभेच्छा! केक तू कापायचा, खायचा आम्ही — हीच तर खरी मैत्री.",
      roman: "Vāḍhadivasācyā shubhecchā! Cake tū kāpāycā, khāycā āmhī — hīc tar kharī maitrī.",
    },
    english: "Happy birthday! You cut the cake, we eat it — that's what friendship is.",
  },
  {
    id: "funny-number",
    tone: "funny",
    respectful: {
      native: "वाढदिवसाच्या शुभेच्छा! वय हा फक्त एक आकडा आहे — आणि तुमचा आकडा दरवर्षी अजून छान होतोय.",
      roman:
        "Vāḍhadivasācyā shubhecchā! Vaya hā phakta ek ākaḍā āhe — āṇi tumcā ākaḍā darvarṣī ajūn chān hotoy.",
    },
    casual: {
      native: "वाढदिवसाच्या शुभेच्छा! वय हा फक्त एक आकडा आहे — आणि तुझा आकडा दरवर्षी अजून छान होतोय.",
      roman:
        "Vāḍhadivasācyā shubhecchā! Vaya hā phakta ek ākaḍā āhe — āṇi tujhā ākaḍā darvarṣī ajūn chān hotoy.",
    },
    english: "Happy birthday! Age is just a number — and yours gets better every year.",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    respectful: {
      native: "वाढदिवसाच्या शुभेच्छा! तुमच्या आयुष्यात आनंद वाय-फायसारखा नेहमी कनेक्ट राहो.",
      roman: "Vāḍhadivasācyā shubhecchā! Tumcyā āyuṣyāt ānand Wi-Fi sārkhā nehmī connect rāho.",
    },
    casual: {
      native: "वाढदिवसाच्या शुभेच्छा! तुझ्या आयुष्यात आनंद वाय-फायसारखा नेहमी कनेक्ट राहो.",
      roman: "Vāḍhadivasācyā shubhecchā! Tujhyā āyuṣyāt ānand Wi-Fi sārkhā nehmī connect rāho.",
    },
    english: "Happy birthday! May joy stay connected to your life like Wi-Fi.",
  },
];

export const CLOSINGS = {
  respectful: { native: "शुभेच्छांसह,", roman: "Shubhecchāṁsaha," },
  casual: { native: "खूप सारं प्रेम,", roman: "Khūp sāraṁ prem," },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/** GSM 03.38 basic alphabet. Anything outside it (all Devanagari) forces UCS-2. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Extension characters cost two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€";

/** Single-part and concatenated limits from 3GPP TS 23.038 / 23.040. */
export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

/** How many SMS parts a message needs. Devanagari always lands in UCS-2. */
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
 * Compose Marathi birthday messages.
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
export function generateMarathiBirthdayWishes({
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
    return { error: "Choose तुम्ही, तू or automatic." };
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
