/**
 * Ugadi and Gudi Padwa Wishes Generator — data + pure logic.
 *
 * Both festivals fall on the same tithi, Chaitra shukla pratipada, the first
 * day of the bright fortnight of Chaitra. It opens the luni-solar new year in
 * the Deccan and lands in March or April. Telugu and Kannada speakers call it
 * Ugadi (yuga + adi, "the start of an age"); Marathi speakers call it Gudi
 * Padwa, after the gudi raised at the door.
 *
 * No React, no DOM, no Date.now(). Invalid input returns { error }.
 */

export const FESTIVAL_FACTS = {
  tithi: "Chaitra shukla pratipada",
  gregorianWindow: "late March to mid April",
  /** The Hindu almanac names years in a repeating cycle of sixty samvatsaras. */
  samvatsaraCycle: 60,
  panchangaReading: "Panchanga Sravanam, the public reading of the year's almanac",
};

/** The six tastes of Ugadi Pachadi (shadruchulu) and what each one stands for. */
export const PACHADI_TASTES = [
  { taste: "Bitter", ingredient: "Neem flowers", stands: "Sadness and setbacks" },
  { taste: "Sweet", ingredient: "Jaggery", stands: "Happiness" },
  { taste: "Tangy", ingredient: "Raw mango", stands: "Surprise" },
  { taste: "Sour", ingredient: "Tamarind", stands: "Distaste" },
  { taste: "Salty", ingredient: "Salt", stands: "Fear" },
  { taste: "Spicy", ingredient: "Green chilli or pepper", stands: "Anger" },
];

/** What a gudi is assembled from, bottom to top. */
export const GUDI_PARTS = [
  "A long bamboo pole",
  "Bright silk or khan cloth tied at the top",
  "Neem and mango leaves",
  "A gathi garland of sugar crystals",
  "An inverted copper or silver kalash",
];

/** Each tradition only accepts the languages its message bank covers. */
export const TRADITIONS = [
  {
    id: "ugadi",
    label: "Ugadi",
    regions: "Andhra Pradesh, Telangana and Karnataka",
    languages: ["telugu", "kannada", "hindi", "english"],
  },
  {
    id: "gudiPadwa",
    label: "Gudi Padwa",
    regions: "Maharashtra and Goa",
    languages: ["marathi", "hindi", "english"],
  },
];

export const LANGUAGES = [
  { id: "telugu", label: "Telugu", native: "తెలుగు" },
  { id: "kannada", label: "Kannada", native: "ಕನ್ನಡ" },
  { id: "marathi", label: "Marathi", native: "मराठी" },
  { id: "hindi", label: "Hindi", native: "हिन्दी" },
  { id: "english", label: "English", native: "English" },
];

export const AUDIENCES = [
  { id: "family", label: "Family & elders" },
  { id: "friends", label: "Friends" },
  { id: "work", label: "Colleagues & clients" },
  { id: "caption", label: "Status / caption" },
];

export const SALUTATIONS = {
  telugu: "ప్రియమైన {name},",
  kannada: "ಪ್ರಿಯ {name},",
  marathi: "प्रिय {name},",
  hindi: "प्रिय {name},",
  english: "Dear {name},",
};

/** TEMPLATES[tradition][language] = [{ text, tags }] */
export const TEMPLATES = {
  ugadi: {
    telugu: [
      {
        text: "ఉగాది శుభాకాంక్షలు! కొత్త సంవత్సరం మీ ఇంటికి ఆరోగ్యం, ఐశ్వర్యం, ఆనందం తీసుకురావాలి.",
        tags: ["family", "work"],
      },
      {
        text: "వేపపువ్వు, బెల్లం, మామిడి, చింతపండు — ఉగాది పచ్చడిలా జీవితంలోని అన్ని రుచులనూ సమానంగా స్వీకరిద్దాం. శుభాకాంక్షలు!",
        tags: ["family", "friends"],
      },
      {
        text: "కొత్త పంచాంగం, కొత్త ఆశలు, కొత్త ఆరంభం. ఉగాది శుభాకాంక్షలు!",
        tags: ["friends", "caption"],
      },
      {
        text: "ఉగాది సందర్భంగా మీకు, మీ కుటుంబానికి, మీ బృందానికి హృదయపూర్వక శుభాకాంక్షలు.",
        tags: ["work", "caption"],
      },
    ],
    kannada: [
      {
        text: "ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ಹೊಸ ವರ್ಷ ನಿಮ್ಮ ಮನೆಗೆ ಆರೋಗ್ಯ, ಸಂಪತ್ತು ಮತ್ತು ಸಂತೋಷ ತರಲಿ.",
        tags: ["family", "work"],
      },
      {
        text: "ಬೇವು-ಬೆಲ್ಲದಂತೆ ಸುಖ ಮತ್ತು ದುಃಖ ಎರಡನ್ನೂ ಸಮನಾಗಿ ಸ್ವೀಕರಿಸೋಣ. ಯುಗಾದಿಯ ಶುಭಾಶಯಗಳು!",
        tags: ["family", "friends"],
      },
      {
        text: "ಹೊಸ ಪಂಚಾಂಗ, ಹೊಸ ಆಸೆ, ಹೊಸ ಆರಂಭ. ಯುಗಾದಿ ಶುಭಾಶಯಗಳು!",
        tags: ["friends", "caption"],
      },
      {
        text: "ಯುಗಾದಿಯ ಸಂದರ್ಭದಲ್ಲಿ ನಿಮಗೆ ಮತ್ತು ನಿಮ್ಮ ತಂಡಕ್ಕೆ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು.",
        tags: ["work", "caption"],
      },
    ],
    hindi: [
      {
        text: "उगादि की हार्दिक शुभकामनाएँ! नया संवत्सर आपके घर में आरोग्य, समृद्धि और आनंद लाए.",
        tags: ["family", "work"],
      },
      {
        text: "नीम और गुड़ की तरह जीवन के हर स्वाद को बराबर अपनाएँ — उगादि पच्चड़ी की यही सीख है. शुभकामनाएँ!",
        tags: ["family", "friends"],
      },
      { text: "नया पंचांग, नई उम्मीदें, नई शुरुआत. उगादि की शुभकामनाएँ!", tags: ["friends", "caption"] },
      {
        text: "उगादि के अवसर पर आपको, आपके परिवार और आपकी पूरी टीम को हार्दिक शुभकामनाएँ.",
        tags: ["work", "caption"],
      },
    ],
    english: [
      {
        text: "Happy Ugadi! May the new samvatsara bring your home health, prosperity and steady good news.",
        tags: ["family", "work"],
      },
      {
        text: "Neem and jaggery in the same spoon — Ugadi Pachadi asks you to take all six tastes of the year as they come. Warm wishes.",
        tags: ["family", "friends"],
      },
      { text: "New panchanga, new hopes, a clean first page. Happy Ugadi!", tags: ["friends", "caption"] },
      {
        text: "Ugadi greetings to you, your family and your team. May this year read well in the panchanga.",
        tags: ["work", "caption"],
      },
    ],
  },
  gudiPadwa: {
    marathi: [
      {
        text: "गुढीपाडव्याच्या हार्दिक शुभेच्छा! नववर्ष तुमच्या घरात आरोग्य, समृद्धी आणि आनंद घेऊन येवो.",
        tags: ["family", "work"],
      },
      {
        text: "दारात उभी गुढी, ताटात श्रीखंड-पुरी आणि मनात नवा उत्साह — शुभ गुढीपाडवा!",
        tags: ["family", "friends"],
      },
      {
        text: "कडुनिंब आणि गूळ — आयुष्यातल्या दोन्ही चवी सारख्याच स्वीकारूया. गुढीपाडव्याच्या शुभेच्छा!",
        tags: ["friends", "caption"],
      },
      {
        text: "गुढीपाडव्यानिमित्त आपणास, आपल्या कुटुंबास व सहकाऱ्यांना हार्दिक शुभेच्छा.",
        tags: ["work", "caption"],
      },
    ],
    hindi: [
      {
        text: "गुड़ी पड़वा की हार्दिक शुभकामनाएँ! नववर्ष आपके घर में आरोग्य, समृद्धि और आनंद लाए.",
        tags: ["family", "work"],
      },
      {
        text: "दरवाज़े पर गुड़ी, थाली में श्रीखंड-पूरी और मन में नया उत्साह — शुभ गुड़ी पड़वा!",
        tags: ["family", "friends"],
      },
      {
        text: "नीम और गुड़ — ज़िंदगी के दोनों स्वाद बराबर अपनाएँ. गुड़ी पड़वा की शुभकामनाएँ!",
        tags: ["friends", "caption"],
      },
      {
        text: "गुड़ी पड़वा के अवसर पर आपको, आपके परिवार और आपकी टीम को हार्दिक शुभकामनाएँ.",
        tags: ["work", "caption"],
      },
    ],
    english: [
      {
        text: "Happy Gudi Padwa! May the new year stand as tall and as bright as the gudi at your door.",
        tags: ["family", "work"],
      },
      {
        text: "Gudi at the window, shrikhand on the plate, and a clean page to start on. Warm wishes on Gudi Padwa.",
        tags: ["family", "friends"],
      },
      {
        text: "Neem with jaggery — take the bitter and the sweet of the year in the same bite. Happy Gudi Padwa!",
        tags: ["friends", "caption"],
      },
      {
        text: "Gudi Padwa greetings to you, your family and your team. May this samvatsara be a productive one.",
        tags: ["work", "caption"],
      },
    ],
  },
};

export const MAX_MESSAGES = 4;

/**
 * GSM 03.38 fits 160 characters in one SMS and 153 per concatenated part.
 * Telugu, Kannada and Devanagari force UCS-2 at 70 and 67 respectively.
 */
export const SMS_LIMITS = {
  gsm7: { single: 160, concatenated: 153 },
  ucs2: { single: 70, concatenated: 67 },
};

const GSM7_SAFE = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅå_ÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/;
const GSM7_EXTENDED = /[\^{}\\[\]~|€]/g;

export function countSmsSegments(text) {
  const body = typeof text === "string" ? text : "";
  const isGsm = GSM7_SAFE.test(body.replace(GSM7_EXTENDED, ""));
  const limits = isGsm ? SMS_LIMITS.gsm7 : SMS_LIMITS.ucs2;
  const units = isGsm
    ? [...body].length + (body.match(GSM7_EXTENDED) || []).length
    : [...body].length;
  const segments =
    units === 0 ? 1 : units <= limits.single ? 1 : Math.ceil(units / limits.concatenated);
  return { encoding: isGsm ? "GSM-7" : "UCS-2", units, segments };
}

/** Languages the given tradition has wordings for. */
export function languagesFor(traditionId) {
  const tradition = TRADITIONS.find((item) => item.id === traditionId);
  if (!tradition) return [];
  return LANGUAGES.filter((item) => tradition.languages.includes(item.id));
}

/** mulberry32 — deterministic 32-bit PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function cleanName(raw) {
  return String(raw == null ? "" : raw)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/**
 * Build the personalised new year greetings.
 *
 * @param {object} options
 * @param {string} options.tradition  TRADITIONS[].id
 * @param {string} options.language   LANGUAGES[].id, must be allowed by the tradition
 * @param {string} options.audience   AUDIENCES[].id
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]    1..MAX_MESSAGES
 * @param {number} [options.seed]
 */
export function generateWishes({
  tradition,
  language,
  audience,
  recipientName = "",
  senderName = "",
  count = 2,
  seed = 1,
} = {}) {
  const traditionMeta = TRADITIONS.find((item) => item.id === tradition);
  if (!traditionMeta) return { error: "Pick Ugadi or Gudi Padwa." };

  if (!LANGUAGES.some((item) => item.id === language)) {
    return { error: "Pick a language from the list." };
  }
  if (!traditionMeta.languages.includes(language)) {
    const allowed = languagesFor(tradition)
      .map((item) => item.label)
      .join(", ");
    return { error: `${traditionMeta.label} wordings are available in ${allowed}.` };
  }
  if (!AUDIENCES.some((item) => item.id === audience)) {
    return { error: "Pick who the message is for." };
  }

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one message." };
  }
  if (wanted > MAX_MESSAGES) {
    return { error: `Ask for ${MAX_MESSAGES} messages or fewer in one go.` };
  }

  const pool = TEMPLATES[tradition][language].filter((item) => item.tags.includes(audience));
  if (pool.length === 0) {
    return { error: "No wording in this language fits that audience yet." };
  }

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 1;
  const rng = mulberry32(safeSeed + 1);
  const picked = shuffle(pool, rng).slice(0, Math.min(Math.trunc(wanted), pool.length));

  const name = cleanName(recipientName);
  const sender = cleanName(senderName);
  const salutation = SALUTATIONS[language];

  const messages = picked.map((item, index) => {
    const parts = [];
    if (name) parts.push(salutation.replace("{name}", name));
    parts.push(item.text);
    if (sender) parts.push(`— ${sender}`);
    const text = parts.join("\n");
    const sms = countSmsSegments(text);
    return {
      id: `${tradition}-${language}-${audience}-${safeSeed}-${index}`,
      text,
      characters: [...text].length,
      encoding: sms.encoding,
      smsSegments: sms.segments,
    };
  });

  return {
    tradition,
    language,
    audience,
    requested: Math.trunc(wanted),
    available: pool.length,
    messages,
  };
}
