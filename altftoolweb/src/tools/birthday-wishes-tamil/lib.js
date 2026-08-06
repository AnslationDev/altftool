/**
 * Tamil birthday wishes composer.
 *
 * Pure data + pure functions. Two real rules drive the output:
 *
 * 1. T-V distinction. Tamil has நீ (familiar) and நீங்கள் (respectful). The choice
 *    changes the possessive (உன் / உங்கள்) and the verb ending, so each wording is
 *    written out twice rather than word-swapped. Relationships carry the register a
 *    Tamil speaker would normally use, and the caller can override it.
 * 2. SMS length. Tamil script falls outside the GSM 03.38 7-bit alphabet, so the text is
 *    sent as UCS-2: 70 characters in a single SMS and 67 per part once concatenated
 *    (3GPP TS 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Tamil",
  nativeName: "தமிழ்",
  script: "Tamil",
  iso: "ta",
};

export const REGISTERS = [
  { id: "respectful", label: "நீங்கள் — respectful", pronoun: "நீங்கள்" },
  { id: "casual", label: "நீ — familiar", pronoun: "நீ" },
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
    salutation: { native: "அன்புள்ள {name},", roman: "Aṉpuḷḷa {name}," },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "casual",
    salutation: { native: "{name} அண்ணா,", roman: "{name} aṇṇā," },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "casual",
    salutation: { native: "{name} அக்கா,", roman: "{name} akkā," },
  },
  {
    id: "younger-sibling",
    label: "Younger brother or sister",
    register: "casual",
    salutation: { native: "அன்புள்ள {name},", roman: "Aṉpuḷḷa {name}," },
  },
  {
    id: "mother",
    label: "Mother",
    register: "respectful",
    salutation: { native: "அன்புள்ள அம்மா,", roman: "Aṉpuḷḷa ammā," },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    salutation: { native: "அன்புள்ள அப்பா,", roman: "Aṉpuḷḷa appā," },
  },
  {
    id: "partner",
    label: "Partner or spouse",
    register: "casual",
    salutation: { native: "அன்புள்ள {name},", roman: "Aṉpuḷḷa {name}," },
  },
  {
    id: "child",
    label: "Son or daughter",
    register: "casual",
    salutation: { native: "அன்புள்ள {name},", roman: "Aṉpuḷḷa {name}," },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "respectful",
    salutation: { native: "{name} அவர்களே,", roman: "{name} avarkaḷē," },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "respectful",
    salutation: { native: "மதிப்பிற்குரிய {name} அவர்களே,", roman: "Matippiṟkuriya {name} avarkaḷē," },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "respectful",
    salutation: { native: "மதிப்பிற்குரிய {name} ஆசிரியரே,", roman: "Matippiṟkuriya {name} āciriyarē," },
  },
];

export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    respectful: {
      native:
        "இனிய பிறந்தநாள் நல்வாழ்த்துக்கள்! இந்த ஆண்டு உங்களுக்கு மகிழ்ச்சியும் நல்ல ஆரோக்கியமும் நிறைந்ததாக அமையட்டும்.",
      roman:
        "Iniya piṟantanāḷ nalvāḻttukkaḷ! Inta āṇṭu uṅkaḷukku makiḻcciyum nalla ārōkkiyamum niṟaintatāka amaiyaṭṭum.",
    },
    casual: {
      native:
        "இனிய பிறந்தநாள் நல்வாழ்த்துக்கள்! இந்த ஆண்டு உனக்கு மகிழ்ச்சியும் நல்ல ஆரோக்கியமும் நிறைந்ததாக அமையட்டும்.",
      roman:
        "Iniya piṟantanāḷ nalvāḻttukkaḷ! Inta āṇṭu uṉakku makiḻcciyum nalla ārōkkiyamum niṟaintatāka amaiyaṭṭum.",
    },
    english: "Happy birthday! May this year be full of joy and good health for you.",
  },
  {
    id: "warm-wishes",
    tone: "warm",
    respectful: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! உங்கள் ஆசைகள் அனைத்தும் நிறைவேற வாழ்த்துகிறேன்.",
      roman: "Piṟantanāḷ vāḻttukkaḷ! Uṅkaḷ ācaikaḷ aṉaittum niṟaivēṟa vāḻttukiṟēṉ.",
    },
    casual: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! உன் ஆசைகள் அனைத்தும் நிறைவேற வாழ்த்துகிறேன்.",
      roman: "Piṟantanāḷ vāḻttukkaḷ! Uṉ ācaikaḷ aṉaittum niṟaivēṟa vāḻttukiṟēṉ.",
    },
    english: "Birthday wishes! May every one of your wishes be fulfilled.",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    respectful: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! என் வாழ்க்கையின் மிக அழகான பகுதி நீங்கள் தான்.",
      roman: "Piṟantanāḷ vāḻttukkaḷ! Eṉ vāḻkkaiyiṉ mika aḻakāṉa pakuti nīṅkaḷ tāṉ.",
    },
    casual: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! என் வாழ்க்கையின் மிக அழகான பகுதி நீ தான்.",
      roman: "Piṟantanāḷ vāḻttukkaḷ! Eṉ vāḻkkaiyiṉ mika aḻakāṉa pakuti nī tāṉ.",
    },
    english: "Happy birthday! You are the loveliest part of my life.",
  },
  {
    id: "warm-smile",
    tone: "warm",
    respectful: {
      native: "உங்கள் முகத்தில் உள்ள புன்னகை என்றும் மாறாமல் இருக்கட்டும். இனிய பிறந்தநாள்!",
      roman: "Uṅkaḷ mukattil uḷḷa puṉṉakai eṉṟum māṟāmal irukkaṭṭum. Iniya piṟantanāḷ!",
    },
    casual: {
      native: "உன் முகத்தில் உள்ள புன்னகை என்றும் மாறாமல் இருக்கட்டும். இனிய பிறந்தநாள்!",
      roman: "Uṉ mukattil uḷḷa puṉṉakai eṉṟum māṟāmal irukkaṭṭum. Iniya piṟantanāḷ!",
    },
    english: "May the smile on your face never fade. Happy birthday!",
  },
  {
    id: "formal-work",
    tone: "formal",
    respectful: {
      native:
        "தங்களின் பிறந்தநாளை முன்னிட்டு எனது மனமார்ந்த வாழ்த்துக்கள். தங்கள் பணி மேலும் சிறக்க வாழ்த்துகிறேன்.",
      roman:
        "Taṅkaḷiṉ piṟantanāḷai muṉṉiṭṭu eṉatu maṉamārnta vāḻttukkaḷ. Taṅkaḷ paṇi mēlum ciṟakka vāḻttukiṟēṉ.",
    },
    casual: {
      native: "உன் பிறந்தநாளை முன்னிட்டு எனது மனமார்ந்த வாழ்த்துக்கள். உன் பணி மேலும் சிறக்க வாழ்த்துகிறேன்.",
      roman:
        "Uṉ piṟantanāḷai muṉṉiṭṭu eṉatu maṉamārnta vāḻttukkaḷ. Uṉ paṇi mēlum ciṟakka vāḻttukiṟēṉ.",
    },
    english: "My sincere wishes on your birthday. May your work go from strength to strength.",
  },
  {
    id: "formal-health",
    tone: "formal",
    respectful: {
      native: "நீண்ட ஆயுளும் நல்ல உடல்நலமும் பெற்று வாழ வாழ்த்துகிறேன். பிறந்தநாள் வாழ்த்துக்கள்!",
      roman: "Nīṇṭa āyuḷum nalla uṭalnalamum peṟṟu vāḻa vāḻttukiṟēṉ. Piṟantanāḷ vāḻttukkaḷ!",
    },
    casual: {
      native: "நீண்ட ஆயுளும் நல்ல உடல்நலமும் பெற்று வாழ வாழ்த்துகிறேன். பிறந்தநாள் வாழ்த்துக்கள்!",
      roman: "Nīṇṭa āyuḷum nalla uṭalnalamum peṟṟu vāḻa vāḻttukiṟēṉ. Piṟantanāḷ vāḻttukkaḷ!",
    },
    english: "Wishing you a long life and good health. Happy birthday!",
  },
  {
    id: "blessing-god",
    tone: "blessing",
    respectful: {
      native: "இறைவன் உங்களுக்கு நீண்ட ஆயுளையும் அமைதியையும் அருள்வாராக. இனிய பிறந்தநாள் நல்வாழ்த்துக்கள்!",
      roman:
        "Iṟaivaṉ uṅkaḷukku nīṇṭa āyuḷaiyum amaitiyaiyum aruḷvārāka. Iniya piṟantanāḷ nalvāḻttukkaḷ!",
    },
    casual: {
      native: "இறைவன் உனக்கு நீண்ட ஆயுளையும் அமைதியையும் அருள்வாராக. இனிய பிறந்தநாள் நல்வாழ்த்துக்கள்!",
      roman:
        "Iṟaivaṉ uṉakku nīṇṭa āyuḷaiyum amaitiyaiyum aruḷvārāka. Iniya piṟantanāḷ nalvāḻttukkaḷ!",
    },
    english: "May God grant you long life and peace. Happy birthday!",
  },
  {
    id: "blessing-life",
    tone: "blessing",
    respectful: {
      native: "உங்கள் வாழ்க்கை மகிழ்ச்சியாலும் வெற்றியாலும் நிறையட்டும். பிறந்தநாள் வாழ்த்துக்கள்!",
      roman: "Uṅkaḷ vāḻkkai makiḻcciyālum veṟṟiyālum niṟaiyaṭṭum. Piṟantanāḷ vāḻttukkaḷ!",
    },
    casual: {
      native: "உன் வாழ்க்கை மகிழ்ச்சியாலும் வெற்றியாலும் நிறையட்டும். பிறந்தநாள் வாழ்த்துக்கள்!",
      roman: "Uṉ vāḻkkai makiḻcciyālum veṟṟiyālum niṟaiyaṭṭum. Piṟantanāḷ vāḻttukkaḷ!",
    },
    english: "May your life be filled with joy and success. Happy birthday!",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    respectful: {
      native: "உங்கள் ஆசியால்தான் எங்கள் வீடு நிற்கிறது. இனிய பிறந்தநாள் — நலமுடனும் மகிழ்ச்சியுடனும் வாழுங்கள்.",
      roman:
        "Uṅkaḷ āciyāltāṉ eṅkaḷ vīṭu niṟkiṟatu. Iniya piṟantanāḷ — nalamuṭaṉum makiḻcciyuṭaṉum vāḻuṅkaḷ.",
    },
    casual: {
      native: "உன் அன்பால்தான் எங்கள் வீடு நிற்கிறது. இனிய பிறந்தநாள் — நலமுடனும் மகிழ்ச்சியுடனும் வாழு.",
      roman:
        "Uṉ aṉpāltāṉ eṅkaḷ vīṭu niṟkiṟatu. Iniya piṟantanāḷ — nalamuṭaṉum makiḻcciyuṭaṉum vāḻu.",
    },
    english: "Our home stands on your love. Happy birthday — live in health and joy.",
  },
  {
    id: "funny-cake",
    tone: "funny",
    respectful: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! கேக்கை நீங்கள் வெட்டுங்கள், சாப்பிடுவது நாங்கள் — இதுதான் உண்மையான பாசம்.",
      roman:
        "Piṟantanāḷ vāḻttukkaḷ! Kēkkai nīṅkaḷ veṭṭuṅkaḷ, cāppiṭuvatu nāṅkaḷ — itutāṉ uṇmaiyāṉa pācam.",
    },
    casual: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! கேக்கை நீ வெட்டு, சாப்பிடுவது நாங்கள் — இதுதான் உண்மையான நட்பு.",
      roman: "Piṟantanāḷ vāḻttukkaḷ! Kēkkai nī veṭṭu, cāppiṭuvatu nāṅkaḷ — itutāṉ uṇmaiyāṉa naṭpu.",
    },
    english: "Happy birthday! You cut the cake, we'll eat it — that's real friendship.",
  },
  {
    id: "funny-number",
    tone: "funny",
    respectful: {
      native: "வயது வெறும் ஒரு எண் மட்டுமே — உங்கள் எண் ஒவ்வொரு ஆண்டும் இன்னும் அழகாகிறது. பிறந்தநாள் வாழ்த்துக்கள்!",
      roman:
        "Vayatu veṟum oru eṇ maṭṭumē — uṅkaḷ eṇ ovvoru āṇṭum iṉṉum aḻakākiṟatu. Piṟantanāḷ vāḻttukkaḷ!",
    },
    casual: {
      native: "வயது வெறும் ஒரு எண் மட்டுமே — உன் எண் ஒவ்வொரு ஆண்டும் இன்னும் அழகாகிறது. பிறந்தநாள் வாழ்த்துக்கள்!",
      roman:
        "Vayatu veṟum oru eṇ maṭṭumē — uṉ eṇ ovvoru āṇṭum iṉṉum aḻakākiṟatu. Piṟantanāḷ vāḻttukkaḷ!",
    },
    english: "Age is only a number — and yours looks better every year. Happy birthday!",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    respectful: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! உங்கள் வாழ்க்கையில் மகிழ்ச்சி வை-ஃபை போல எப்போதும் இணைந்திருக்கட்டும்.",
      roman:
        "Piṟantanāḷ vāḻttukkaḷ! Uṅkaḷ vāḻkkaiyil makiḻcci Wi-Fi pōla eppōtum iṇaintirukkaṭṭum.",
    },
    casual: {
      native: "பிறந்தநாள் வாழ்த்துக்கள்! உன் வாழ்க்கையில் மகிழ்ச்சி வை-ஃபை போல எப்போதும் இணைந்திருக்கட்டும்.",
      roman: "Piṟantanāḷ vāḻttukkaḷ! Uṉ vāḻkkaiyil makiḻcci Wi-Fi pōla eppōtum iṇaintirukkaṭṭum.",
    },
    english: "Happy birthday! May joy stay connected to your life like Wi-Fi.",
  },
];

export const CLOSINGS = {
  respectful: { native: "வாழ்த்துக்களுடன்,", roman: "Vāḻttukkaḷuṭaṉ," },
  casual: { native: "நிறைய அன்புடன்,", roman: "Niṟaiya aṉpuṭaṉ," },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/** GSM 03.38 basic alphabet. Anything outside it (all Tamil script) forces UCS-2. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Extension characters cost two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€";

/** Single-part and concatenated limits from 3GPP TS 23.038 / 23.040. */
export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

/** How many SMS parts a message needs. Tamil script always lands in UCS-2. */
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
 * Compose Tamil birthday messages.
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
export function generateTamilBirthdayWishes({
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
    return { error: "Choose நீங்கள், நீ or automatic." };
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
