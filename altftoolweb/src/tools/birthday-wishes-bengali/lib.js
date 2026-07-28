/**
 * Bengali birthday wishes composer.
 *
 * Pure data + pure functions. Three real rules drive the output:
 *
 * 1. T-V distinction. Bengali has তুমি (familiar) and আপনি (respectful) — plus তুই for
 *    the very closest relationships, which this tool leaves out. The choice changes the
 *    possessive (তোমার / আপনার) and the verb ending, so every wording is written out
 *    twice rather than word-swapped.
 * 2. Punctuation. Bengali sentences end with the দাঁড়ি (U+0964 danda), not a full stop.
 * 3. SMS length. Bengali script falls outside the GSM 03.38 7-bit alphabet, so the text
 *    is sent as UCS-2: 70 characters in a single SMS and 67 per part once concatenated
 *    (3GPP TS 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Bengali",
  nativeName: "বাংলা",
  script: "Bengali",
  iso: "bn",
};

export const REGISTERS = [
  { id: "respectful", label: "আপনি — respectful", pronoun: "আপনি" },
  { id: "casual", label: "তুমি — familiar", pronoun: "তুমি" },
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
    salutation: { native: "প্রিয় {name},", roman: "Priyo {name}," },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "casual",
    salutation: { native: "{name} দাদা,", roman: "{name} dada," },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "casual",
    salutation: { native: "{name} দিদি,", roman: "{name} didi," },
  },
  {
    id: "younger-sibling",
    label: "Younger brother or sister",
    register: "casual",
    salutation: { native: "প্রিয় {name},", roman: "Priyo {name}," },
  },
  {
    id: "mother",
    label: "Mother",
    register: "respectful",
    salutation: { native: "প্রিয় মা,", roman: "Priyo ma," },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    salutation: { native: "প্রিয় বাবা,", roman: "Priyo baba," },
  },
  {
    id: "partner",
    label: "Partner or spouse",
    register: "casual",
    salutation: { native: "প্রিয় {name},", roman: "Priyo {name}," },
  },
  {
    id: "child",
    label: "Son or daughter",
    register: "casual",
    salutation: { native: "প্রিয় {name},", roman: "Priyo {name}," },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "respectful",
    salutation: { native: "প্রিয় {name},", roman: "Priyo {name}," },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "respectful",
    salutation: { native: "শ্রদ্ধেয় {name},", roman: "Shroddheyo {name}," },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "respectful",
    salutation: { native: "শ্রদ্ধেয় শিক্ষকমশাই,", roman: "Shroddheyo shikkhokmoshai," },
  },
];

export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    respectful: {
      native: "শুভ জন্মদিন! এই বছরটা আপনার আনন্দ আর সুস্থতায় ভরে উঠুক।",
      roman: "Shubho jonmodin! Ei bochhorṭa apnar anondo ar shusthotay bhore uṭhuk.",
    },
    casual: {
      native: "শুভ জন্মদিন! এই বছরটা তোমার আনন্দ আর সুস্থতায় ভরে উঠুক।",
      roman: "Shubho jonmodin! Ei bochhorṭa tomar anondo ar shusthotay bhore uṭhuk.",
    },
    english: "Happy birthday! May this year fill with joy and good health for you.",
  },
  {
    id: "warm-wishes",
    tone: "warm",
    respectful: {
      native: "জন্মদিনের অনেক অনেক শুভেচ্ছা! আপনার সব ইচ্ছে পূরণ হোক।",
      roman: "Jonmodiner onek onek shubhechchha! Apnar shob icchhe puron hok.",
    },
    casual: {
      native: "জন্মদিনের অনেক অনেক শুভেচ্ছা! তোমার সব ইচ্ছে পূরণ হোক।",
      roman: "Jonmodiner onek onek shubhechchha! Tomar shob icchhe puron hok.",
    },
    english: "Very many birthday wishes! May all your wishes be fulfilled.",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    respectful: {
      native: "শুভ জন্মদিন! আপনি আমার জীবনের সবচেয়ে ভালো অংশ।",
      roman: "Shubho jonmodin! Apni amar jiboner shobcheye bhalo ongsho.",
    },
    casual: {
      native: "শুভ জন্মদিন! তুমি আমার জীবনের সবচেয়ে ভালো অংশ।",
      roman: "Shubho jonmodin! Tumi amar jiboner shobcheye bhalo ongsho.",
    },
    english: "Happy birthday! You are the best part of my life.",
  },
  {
    id: "warm-smile",
    tone: "warm",
    respectful: {
      native: "আপনার মুখের হাসি কখনও যেন না মেলায়। জন্মদিনের শুভেচ্ছা!",
      roman: "Apnar mukher hashi kokhono jeno na melay. Jonmodiner shubhechchha!",
    },
    casual: {
      native: "তোমার মুখের হাসি কখনও যেন না মেলায়। জন্মদিনের শুভেচ্ছা!",
      roman: "Tomar mukher hashi kokhono jeno na melay. Jonmodiner shubhechchha!",
    },
    english: "May the smile on your face never fade. Birthday wishes!",
  },
  {
    id: "formal-antorik",
    tone: "formal",
    respectful: {
      native: "আপনার জন্মদিনে আন্তরিক শুভেচ্ছা। আগামী বছর আপনার সুস্থতা ও সাফল্যে ভরে উঠুক।",
      roman:
        "Apnar jonmodine antorik shubhechchha. Agami bochhor apnar shusthota o shaphollye bhore uṭhuk.",
    },
    casual: {
      native: "তোমার জন্মদিনে আন্তরিক শুভেচ্ছা। আগামী বছর তোমার সুস্থতা ও সাফল্যে ভরে উঠুক।",
      roman:
        "Tomar jonmodine antorik shubhechchha. Agami bochhor tomar shusthota o shaphollye bhore uṭhuk.",
    },
    english: "Sincere wishes on your birthday. May the coming year be full of health and success.",
  },
  {
    id: "formal-health",
    tone: "formal",
    respectful: {
      native: "দীর্ঘ জীবন আর সুস্বাস্থ্য কামনা করি। শুভ জন্মদিন!",
      roman: "Dirgho jibon ar shushasthyo kamona kori. Shubho jonmodin!",
    },
    casual: {
      native: "দীর্ঘ জীবন আর সুস্বাস্থ্য কামনা করি। শুভ জন্মদিন!",
      roman: "Dirgho jibon ar shushasthyo kamona kori. Shubho jonmodin!",
    },
    english: "Wishing you a long life and good health. Happy birthday!",
  },
  {
    id: "blessing-life",
    tone: "blessing",
    respectful: {
      native: "আপনার জীবন সুখ, শান্তি আর সাফল্যে ভরে থাকুক। শুভ জন্মদিন!",
      roman: "Apnar jibon shukh, shanti ar shaphollye bhore thakuk. Shubho jonmodin!",
    },
    casual: {
      native: "তোমার জীবন সুখ, শান্তি আর সাফল্যে ভরে থাকুক। শুভ জন্মদিন!",
      roman: "Tomar jibon shukh, shanti ar shaphollye bhore thakuk. Shubho jonmodin!",
    },
    english: "May your life stay full of happiness, peace and success. Happy birthday!",
  },
  {
    id: "blessing-day",
    tone: "blessing",
    respectful: {
      native: "আজকের দিনটা আপনার নামে লেখা থাকুক। শুভ জন্মদিন!",
      roman: "Ajker dinṭa apnar name lekha thakuk. Shubho jonmodin!",
    },
    casual: {
      native: "আজকের দিনটা তোমার নামে লেখা থাকুক। শুভ জন্মদিন!",
      roman: "Ajker dinṭa tomar name lekha thakuk. Shubho jonmodin!",
    },
    english: "May today be written in your name. Happy birthday!",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    respectful: {
      native: "আপনার আশীর্বাদেই আমাদের ঘর। শুভ জন্মদিন — ভালো থাকুন, সুস্থ থাকুন।",
      roman: "Apnar ashirbadei amader ghor. Shubho jonmodin — bhalo thakun, shustho thakun.",
    },
    casual: {
      native: "তোমার জন্যই আমাদের ঘর। শুভ জন্মদিন — ভালো থেকো, সুস্থ থেকো।",
      roman: "Tomar jonyoi amader ghor. Shubho jonmodin — bhalo theko, shustho theko.",
    },
    english: "Our home rests on you. Happy birthday — stay well and healthy.",
  },
  {
    id: "funny-cake",
    tone: "funny",
    respectful: {
      native: "শুভ জন্মদিন! কেক আপনি কাটবেন, খাব আমরা — এটাই তো ভালোবাসা।",
      roman: "Shubho jonmodin! Cake apni kaṭben, khabo amra — eṭai to bhalobasha.",
    },
    casual: {
      native: "শুভ জন্মদিন! কেক তুমি কাটবে, খাব আমরা — এটাই তো বন্ধুত্ব।",
      roman: "Shubho jonmodin! Cake tumi kaṭbe, khabo amra — eṭai to bondhutto.",
    },
    english: "Happy birthday! You'll cut the cake and we'll eat it — that's friendship.",
  },
  {
    id: "funny-number",
    tone: "funny",
    respectful: {
      native: "বয়স তো শুধু একটা সংখ্যা — আর আপনার সংখ্যাটা প্রতি বছর আরও সুন্দর হচ্ছে। শুভ জন্মদিন!",
      roman:
        "Boyosh to shudhu ekṭa shongkhya — ar apnar shongkhyaṭa proti bochhor aro shundor hochchhe. Shubho jonmodin!",
    },
    casual: {
      native: "বয়স তো শুধু একটা সংখ্যা — আর তোমার সংখ্যাটা প্রতি বছর আরও সুন্দর হচ্ছে। শুভ জন্মদিন!",
      roman:
        "Boyosh to shudhu ekṭa shongkhya — ar tomar shongkhyaṭa proti bochhor aro shundor hochchhe. Shubho jonmodin!",
    },
    english: "Age is only a number — and yours gets lovelier every year. Happy birthday!",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    respectful: {
      native: "শুভ জন্মদিন! আপনার জীবনে আনন্দ ওয়াই-ফাইয়ের মতো সব সময় কানেক্টেড থাকুক।",
      roman: "Shubho jonmodin! Apnar jibone anondo Wi-Fi-er moto shob shomoy connected thakuk.",
    },
    casual: {
      native: "শুভ জন্মদিন! তোমার জীবনে আনন্দ ওয়াই-ফাইয়ের মতো সব সময় কানেক্টেড থাকুক।",
      roman: "Shubho jonmodin! Tomar jibone anondo Wi-Fi-er moto shob shomoy connected thakuk.",
    },
    english: "Happy birthday! May joy stay connected to your life like Wi-Fi.",
  },
];

export const CLOSINGS = {
  respectful: { native: "শুভেচ্ছান্তে,", roman: "Shubhechchhante," },
  casual: { native: "অনেক ভালোবাসা,", roman: "Onek bhalobasha," },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/** GSM 03.38 basic alphabet. Anything outside it (all Bengali script) forces UCS-2. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Extension characters cost two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€";

/** Single-part and concatenated limits from 3GPP TS 23.038 / 23.040. */
export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

/** How many SMS parts a message needs. Bengali script always lands in UCS-2. */
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
 * Compose Bengali birthday messages.
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
export function generateBengaliBirthdayWishes({
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
    return { error: "Choose আপনি, তুমি or automatic." };
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
