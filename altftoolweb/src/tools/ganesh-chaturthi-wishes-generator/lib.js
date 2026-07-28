/**
 * Ganesh Chaturthi Wishes Generator — data + pure logic.
 *
 * No React, no DOM, no Date.now(). Every exported function is total: the same
 * arguments always produce the same result, and invalid input returns
 * { error: "<reason>" } rather than NaN, Infinity or a partial object.
 */

/**
 * Calendar and ritual facts used in the UI copy.
 * Ganesh Chaturthi falls on the chaturthi (4th tithi) of the shukla paksha of
 * Bhadrapada in the Hindu luni-solar calendar, which lands in Aug-Sep.
 * The public utsav runs up to ten days and ends with visarjan on Anant
 * Chaturdashi (the 14th tithi of the same shukla paksha).
 */
export const FESTIVAL_FACTS = {
  tithi: "Bhadrapada shukla chaturthi",
  gregorianWindow: "late August to mid September",
  /** Longest observance: chaturthi to Anant Chaturdashi = 10 days of utsav. */
  maxUtsavDays: 10,
  /** Traditional naivedya count offered to Ganesha. */
  modakOffering: 21,
};

/** Languages the message bank covers. */
export const LANGUAGES = [
  { id: "marathi", label: "Marathi", native: "मराठी" },
  { id: "hindi", label: "Hindi", native: "हिन्दी" },
  { id: "english", label: "English", native: "English" },
  { id: "gujarati", label: "Gujarati", native: "ગુજરાતી" },
  { id: "kannada", label: "Kannada", native: "ಕನ್ನಡ" },
  { id: "telugu", label: "Telugu", native: "తెలుగు" },
];

/** Who the message is for. Each template is tagged with the audiences it suits. */
export const AUDIENCES = [
  { id: "family", label: "Family & elders" },
  { id: "friends", label: "Friends" },
  { id: "work", label: "Colleagues & clients" },
  { id: "social", label: "Status / caption" },
];

/** Vocative opener used only when a recipient name is supplied. */
export const SALUTATIONS = {
  marathi: "प्रिय {name},",
  hindi: "प्रिय {name},",
  english: "Dear {name},",
  gujarati: "પ્રિય {name},",
  kannada: "ಪ್ರಿಯ {name},",
  telugu: "ప్రియమైన {name},",
};

/** Message bank: { text, tags } where tags are AUDIENCES ids. */
export const TEMPLATES = {
  marathi: [
    {
      text: "गणपती बाप्पा मोरया! बाप्पाच्या आगमनाने तुमच्या घरात सुख, समृद्धी आणि आरोग्य नांदो.",
      tags: ["family", "friends"],
    },
    {
      text: "विघ्नहर्ता गणराय तुमच्या वाटेतील सर्व अडचणी दूर करो. गणेश चतुर्थीच्या हार्दिक शुभेच्छा!",
      tags: ["family", "work"],
    },
    {
      text: "मोदकांचा गोडवा, आरतीचा सूर आणि बाप्पांचा आशीर्वाद — तुमचा गणेशोत्सव असाच आनंदात जावो.",
      tags: ["friends", "social", "family"],
    },
    {
      text: "ढोल-ताशांच्या गजरात बाप्पा घरी आले. गणेशोत्सवाच्या मन:पूर्वक शुभेच्छा!",
      tags: ["friends", "social"],
    },
    {
      text: "गणेश चतुर्थीनिमित्त आपणास आणि आपल्या सहकाऱ्यांना हार्दिक शुभेच्छा. पुढील वर्ष यशाचे आणि भरभराटीचे जावो.",
      tags: ["work"],
    },
    {
      text: "बुद्धीची देवता श्री गणेश आपल्या कामात यश आणि नवे विचार देवो. गणेशोत्सवाच्या शुभेच्छा.",
      tags: ["work", "family"],
    },
    {
      text: "गणपती बाप्पा मोरया, पुढच्या वर्षी लवकर या!",
      tags: ["social", "friends"],
    },
    {
      text: "एकदंत, लंबोदर, गजानन — बाप्पाच्या चरणी नतमस्तक. #गणपतीबाप्पामोरया",
      tags: ["social"],
    },
  ],
  hindi: [
    {
      text: "गणपति बप्पा मोरया! बप्पा की कृपा से आपके घर में सुख, समृद्धि और स्वास्थ्य बना रहे.",
      tags: ["family", "friends"],
    },
    {
      text: "विघ्नहर्ता श्री गणेश आपके जीवन के सभी विघ्न हरें और हर काम निर्विघ्न पूरा हो. गणेश चतुर्थी की हार्दिक शुभकामनाएँ!",
      tags: ["family", "work"],
    },
    {
      text: "मोदक की मिठास, आरती की गूँज और बप्पा का आशीर्वाद — आपका गणेशोत्सव मंगलमय हो.",
      tags: ["friends", "social", "family"],
    },
    {
      text: "बुद्धि और विवेक के देवता गणपति आपको हर निर्णय में सही राह दिखाएँ. गणेशोत्सव की शुभकामनाएँ.",
      tags: ["work"],
    },
    {
      text: "आपको और आपकी पूरी टीम को गणेश चतुर्थी की हार्दिक शुभकामनाएँ. यह वर्ष आपके लिए सफलता और समृद्धि लेकर आए.",
      tags: ["work"],
    },
    {
      text: "गणपति बप्पा मोरया, मंगलमूर्ति मोरया!",
      tags: ["social", "friends"],
    },
    {
      text: "एकदंत, लंबोदर, गजानन — बप्पा के चरणों में शत शत नमन. #गणपतिबप्पामोरया",
      tags: ["social"],
    },
    {
      text: "बप्पा आ गए हैं. दस दिन भक्ति, ढोल और मोदक के नाम. आप सबको गणेशोत्सव की बधाई.",
      tags: ["friends", "social"],
    },
  ],
  english: [
    {
      text: "Ganpati Bappa Morya! May Lord Ganesha bless your home with health, harmony and prosperity this Ganesh Chaturthi.",
      tags: ["family", "friends"],
    },
    {
      text: "Wishing you a joyful Ganesh Chaturthi. May Vighnaharta clear every obstacle on your path and let your plans finish without a hitch.",
      tags: ["family", "work"],
    },
    {
      text: "Ten days of aarti, dhol and modaks — enjoy every one of them. Happy Ganesh Chaturthi!",
      tags: ["friends", "social"],
    },
    {
      text: "May the lord of wisdom guide your decisions and the lord of beginnings bless your new ventures. Warm wishes on Ganesh Chaturthi.",
      tags: ["work"],
    },
    {
      text: "Ganesh Chaturthi greetings to you and the entire team. May the year ahead bring growth without hurdles.",
      tags: ["work"],
    },
    {
      text: "Ekadanta, Lambodara, Gajanana — bowing to Bappa today and every day. #GanpatiBappaMorya",
      tags: ["social"],
    },
    {
      text: "Ganpati Bappa Morya, Pudhchya Varshi Laukar Ya. See you next year, Bappa.",
      tags: ["social", "friends"],
    },
    {
      text: "May the 21 modaks offered today come back to you as 21 reasons to smile. Happy Ganesh Chaturthi.",
      tags: ["friends", "family"],
    },
  ],
  gujarati: [
    {
      text: "ગણપતિ બાપ્પા મોરિયા! બાપ્પાના આશીર્વાદથી તમારા ઘરમાં સુખ, શાંતિ અને સમૃદ્ધિ રહે.",
      tags: ["family", "friends"],
    },
    {
      text: "વિઘ્નહર્તા શ્રી ગણેશ તમારા દરેક વિઘ્ન દૂર કરે. ગણેશ ચતુર્થીની હાર્દિક શુભકામનાઓ!",
      tags: ["family", "work"],
    },
    {
      text: "મોદકની મીઠાશ અને આરતીના સૂર સાથે તમારો ગણેશોત્સવ મંગલમય રહે.",
      tags: ["friends", "social", "family"],
    },
    {
      text: "બુદ્ધિના દેવતા ગણપતિ તમને દરેક નિર્ણયમાં સાચો માર્ગ બતાવે. ગણેશોત્સવની શુભકામનાઓ.",
      tags: ["work"],
    },
    {
      text: "ગણેશ ચતુર્થી નિમિત્તે આપને અને આપની સમગ્ર ટીમને હાર્દિક શુભકામનાઓ.",
      tags: ["work"],
    },
    {
      text: "ગણપતિ બાપ્પા મોરિયા, મંગલમૂર્તિ મોરિયા! #ગણપતિબાપ્પામોરિયા",
      tags: ["social", "friends"],
    },
  ],
  kannada: [
    {
      text: "ಗಣೇಶ ಚತುರ್ಥಿಯ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ವಿಘ್ನೇಶ್ವರನು ನಿಮ್ಮ ಮನೆಗೆ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಸಮೃದ್ಧಿಯನ್ನು ತರಲಿ.",
      tags: ["family", "friends"],
    },
    {
      text: "ವಿಘ್ನಗಳನ್ನು ದೂರ ಮಾಡುವ ಗಣಪತಿ ನಿಮ್ಮ ಎಲ್ಲಾ ಕೆಲಸಗಳನ್ನು ನಿರ್ವಿಘ್ನವಾಗಿ ಪೂರೈಸಲಿ.",
      tags: ["family", "work"],
    },
    {
      text: "ಮೋದಕದ ಸಿಹಿ, ಆರತಿಯ ಸ್ವರ ಮತ್ತು ಬಪ್ಪನ ಆಶೀರ್ವಾದ ನಿಮ್ಮ ಜೊತೆ ಇರಲಿ. ಗಣೇಶ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು.",
      tags: ["friends", "social", "family"],
    },
    {
      text: "ಬುದ್ಧಿ ಮತ್ತು ವಿವೇಕದ ದೇವರಾದ ಗಣಪತಿ ನಿಮ್ಮ ಪ್ರತಿ ನಿರ್ಧಾರಕ್ಕೂ ದಾರಿ ತೋರಲಿ.",
      tags: ["work"],
    },
    {
      text: "ಗಣೇಶ ಚತುರ್ಥಿಯ ಸಂದರ್ಭದಲ್ಲಿ ನಿಮಗೆ ಮತ್ತು ನಿಮ್ಮ ತಂಡಕ್ಕೆ ಶುಭಾಶಯಗಳು.",
      tags: ["work"],
    },
    {
      text: "ಗಣಪತಿ ಬಪ್ಪ ಮೋರ್ಯ! #ಗಣೇಶಚತುರ್ಥಿ",
      tags: ["social", "friends"],
    },
  ],
  telugu: [
    {
      text: "వినాయక చవితి శుభాకాంక్షలు! విఘ్నేశ్వరుడు మీ ఇంటిని సుఖం, శాంతి, సంపదలతో నింపాలి.",
      tags: ["family", "friends"],
    },
    {
      text: "విఘ్నాలను తొలగించే గణపతి మీ ప్రతి పనిని నిర్విఘ్నంగా పూర్తి చేయాలి. వినాయక చవితి శుభాకాంక్షలు.",
      tags: ["family", "work"],
    },
    {
      text: "ఉండ్రాళ్ల తీపి, హారతి వెలుగు, బప్ప ఆశీర్వాదం — మీ పండుగ ఆనందంగా సాగాలి.",
      tags: ["friends", "social", "family"],
    },
    {
      text: "బుద్ధికి అధిపతి అయిన గణపతి మీ ప్రతి నిర్ణయానికి సరైన దారి చూపాలి.",
      tags: ["work"],
    },
    {
      text: "వినాయక చవితి సందర్భంగా మీకు, మీ బృందానికి హృదయపూర్వక శుభాకాంక్షలు.",
      tags: ["work"],
    },
    {
      text: "గణపతి బప్ప మోరియా! #వినాయకచవితి",
      tags: ["social", "friends"],
    },
  ],
};

/** Hard cap on how many messages one run may return. */
export const MAX_MESSAGES = 8;

/**
 * GSM 03.38 7-bit alphabet holds 160 characters in a single SMS and 153 per
 * part once a message is concatenated. Anything outside it (all Indic scripts,
 * the em dash, most emoji) forces UCS-2, which allows 70 and 67 respectively.
 */
export const SMS_LIMITS = {
  gsm7: { single: 160, concatenated: 153 },
  ucs2: { single: 70, concatenated: 67 },
};

/** Characters that survive GSM 03.38 encoding, as a conservative subset. */
const GSM7_SAFE = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅå_ÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/;

/** Characters that occupy two GSM-7 slots via the escape table. */
const GSM7_EXTENDED = /[\^{}\\[\]~|€]/g;

/**
 * Count SMS segments for a message body.
 * Returns { encoding, units, segments, perSegment }.
 */
export function countSmsSegments(text) {
  const body = typeof text === "string" ? text : "";
  const isGsm = GSM7_SAFE.test(body.replace(GSM7_EXTENDED, ""));
  const limits = isGsm ? SMS_LIMITS.gsm7 : SMS_LIMITS.ucs2;
  // Count code points, not UTF-16 units, so surrogate pairs are not double counted.
  const units = isGsm
    ? [...body].length + (body.match(GSM7_EXTENDED) || []).length
    : [...body].length;
  const segments =
    units === 0 ? 1 : units <= limits.single ? 1 : Math.ceil(units / limits.concatenated);
  return {
    encoding: isGsm ? "GSM-7" : "UCS-2",
    units,
    segments,
    perSegment: units <= limits.single ? limits.single : limits.concatenated,
  };
}

/**
 * mulberry32 — a 32-bit deterministic PRNG. Used so a given seed always yields
 * the same shuffle, keeping generateWishes pure.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by the seeded PRNG. */
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

/** Collapse whitespace and trim a free-text field. */
export function cleanName(raw) {
  return String(raw == null ? "" : raw)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/**
 * Build the personalised greetings.
 *
 * @param {object} options
 * @param {string} options.language  one of LANGUAGES[].id
 * @param {string} options.audience  one of AUDIENCES[].id
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]   1..MAX_MESSAGES
 * @param {number} [options.seed]    any integer; same seed = same output
 * @returns {{error:string}|{language:string,audience:string,requested:number,available:number,messages:Array}}
 */
export function generateWishes({
  language,
  audience,
  recipientName = "",
  senderName = "",
  count = 3,
  seed = 1,
} = {}) {
  const bank = TEMPLATES[language];
  if (!bank) return { error: "Pick a language from the list." };
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

  const pool = bank.filter((item) => item.tags.includes(audience));
  if (pool.length === 0) {
    return { error: "No message in this language fits that audience yet." };
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
      id: `${language}-${audience}-${safeSeed}-${index}`,
      text,
      characters: [...text].length,
      encoding: sms.encoding,
      smsSegments: sms.segments,
    };
  });

  return {
    language,
    audience,
    requested: Math.trunc(wanted),
    available: pool.length,
    messages,
  };
}
