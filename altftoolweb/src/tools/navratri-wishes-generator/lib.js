/**
 * Navratri Wishes Generator — data + pure logic.
 *
 * No React, no DOM, no Date.now(). generateWishes is total: bad input returns
 * { error }, never NaN or a half-built object, and a given seed always yields
 * the same set of messages.
 */

/**
 * Sharad Navratri runs from Ashwin shukla pratipada for nine nights and is
 * followed by Vijayadashami (Dussehra) on the tenth day, landing in Sep-Oct.
 * Chaitra Navratri (Mar-Apr) ends on Ram Navami. Two further "gupt" Navratris
 * in Magha and Ashadha make four in the Hindu year.
 */
export const FESTIVAL_FACTS = {
  nights: 9,
  navratrisPerYear: 4,
  sharadWindow: "September to October",
  chaitraWindow: "March to April",
  concludingDay: "Vijayadashami (Dussehra), the tenth day",
};

/** Language ids and the script bucket each one reads its nouns from. */
export const LANGUAGES = [
  { id: "hindi", label: "Hindi", native: "हिन्दी", script: "hi" },
  { id: "marathi", label: "Marathi", native: "मराठी", script: "hi" },
  { id: "gujarati", label: "Gujarati", native: "ગુજરાતી", script: "gu" },
  { id: "english", label: "English", native: "English", script: "en" },
  { id: "telugu", label: "Telugu", native: "తెలుగు", script: "te" },
];

export const AUDIENCES = [
  { id: "family", label: "Family & elders" },
  { id: "friends", label: "Friends" },
  { id: "work", label: "Colleagues & clients" },
  { id: "social", label: "Status / caption" },
];

/**
 * The nine forms of Durga (Nava Durga) worshipped one per night — this order is
 * fixed by the Devi Mahatmya tradition and does not change year to year.
 *
 * `colour` is the widely published Navratri colour sequence used in Gujarat and
 * Maharashtra. It is a popular convention, not scripture: the list is rotated
 * each year according to the weekday the festival starts on, so treat it as a
 * suggestion rather than a rule.
 *
 * `bhog` is the naivedya traditionally offered on that night.
 */
export const NAVRATRI_DAYS = [
  {
    day: 1,
    goddess: { en: "Shailaputri", hi: "शैलपुत्री", gu: "શૈલપુત્રી", te: "శైలపుత్రి" },
    colour: { en: "Orange", hi: "नारंगी", gu: "કેસરી", te: "నారింజ" },
    bhog: "Ghee",
  },
  {
    day: 2,
    goddess: { en: "Brahmacharini", hi: "ब्रह्मचारिणी", gu: "બ્રહ્મચારિણી", te: "బ్రహ్మచారిణి" },
    colour: { en: "White", hi: "सफ़ेद", gu: "સફેદ", te: "తెలుపు" },
    bhog: "Sugar",
  },
  {
    day: 3,
    goddess: { en: "Chandraghanta", hi: "चंद्रघंटा", gu: "ચંદ્રઘંટા", te: "చంద్రఘంట" },
    colour: { en: "Red", hi: "लाल", gu: "લાલ", te: "ఎరుపు" },
    bhog: "Kheer",
  },
  {
    day: 4,
    goddess: { en: "Kushmanda", hi: "कूष्मांडा", gu: "કૂષ્માંડા", te: "కూష్మాండ" },
    colour: { en: "Royal blue", hi: "गहरा नीला", gu: "ઘેરો વાદળી", te: "ముదురు నీలం" },
    bhog: "Malpua",
  },
  {
    day: 5,
    goddess: { en: "Skandamata", hi: "स्कंदमाता", gu: "સ્કંદમાતા", te: "స్కందమాత" },
    colour: { en: "Yellow", hi: "पीला", gu: "પીળો", te: "పసుపు" },
    bhog: "Banana",
  },
  {
    day: 6,
    goddess: { en: "Katyayani", hi: "कात्यायनी", gu: "કાત્યાયની", te: "కాత్యాయని" },
    colour: { en: "Green", hi: "हरा", gu: "લીલો", te: "ఆకుపచ్చ" },
    bhog: "Honey",
  },
  {
    day: 7,
    goddess: { en: "Kalaratri", hi: "कालरात्रि", gu: "કાલરાત્રિ", te: "కాళరాత్రి" },
    colour: { en: "Grey", hi: "स्लेटी", gu: "રાખોડી", te: "బూడిద" },
    bhog: "Jaggery",
  },
  {
    day: 8,
    goddess: { en: "Mahagauri", hi: "महागौरी", gu: "મહાગૌરી", te: "మహాగౌరి" },
    colour: { en: "Purple", hi: "बैंगनी", gu: "જાંબલી", te: "ఊదా" },
    bhog: "Coconut",
  },
  {
    day: 9,
    goddess: { en: "Siddhidatri", hi: "सिद्धिदात्री", gu: "સિદ્ધિદાત્રી", te: "సిద్ధిదాత్రి" },
    colour: { en: "Peacock green", hi: "मोरपंखी हरा", gu: "મોરપીંછ લીલો", te: "నెమలి ఆకుపచ్చ" },
    bhog: "Sesame seeds",
  },
];

export const SALUTATIONS = {
  hindi: "प्रिय {name},",
  marathi: "प्रिय {name},",
  gujarati: "પ્રિય {name},",
  english: "Dear {name},",
  telugu: "ప్రియమైన {name},",
};

/** Day-specific wordings. Tokens: {day} {goddess} {colour} */
export const DAY_TEMPLATES = {
  hindi: [
    "नवरात्रि का {day}वाँ दिन माँ {goddess} को समर्पित है. आज का रंग {colour} — माँ की कृपा आप पर सदा बनी रहे.",
    "आज नवरात्रि दिन {day}: माँ {goddess} की आराधना, {colour} रंग और मन में भक्ति. शुभ नवरात्रि!",
  ],
  marathi: [
    "नवरात्रीचा {day}वा दिवस माँ {goddess} यांना समर्पित आहे. आजचा रंग {colour} — देवीचा आशीर्वाद तुमच्यावर राहो.",
    "आज नवरात्रीचा दिवस {day}: माँ {goddess} ची आराधना आणि {colour} रंगाची शोभा. शुभ नवरात्री!",
  ],
  gujarati: [
    "નવરાત્રિનો {day}મો દિવસ મા {goddess}ને સમર્પિત છે. આજનો રંગ {colour} — માની કૃપા તમારા પર રહે.",
    "આજે નવરાત્રિ દિવસ {day}: મા {goddess}ની આરાધના અને {colour} રંગનો ગરબો. શુભ નવરાત્રિ!",
  ],
  english: [
    "Day {day} of Navratri belongs to Maa {goddess}, and today's colour is {colour}. May her blessings stay with you.",
    "Navratri day {day}: wear {colour}, offer your prayers to Maa {goddess}, and let the garba run late.",
  ],
  telugu: [
    "నవరాత్రుల {day}వ రోజు {goddess} అమ్మవారికి అంకితం. ఈ రోజు రంగు {colour} — అమ్మ ఆశీస్సులు మీపై ఉండాలి.",
    "నేడు నవరాత్రి {day}వ రోజు: {goddess} అమ్మవారి ఆరాధన, {colour} రంగు. శుభ నవరాత్రులు!",
  ],
};

/** Wordings that work on any night of the festival. */
export const TEMPLATES = {
  hindi: [
    {
      text: "नवरात्रि की हार्दिक शुभकामनाएँ! माँ दुर्गा आपके घर में सुख, शक्ति और समृद्धि लेकर आएँ.",
      tags: ["family", "friends"],
    },
    {
      text: "नौ रातें, नौ रूप, अनगिनत आशीर्वाद. माँ आदिशक्ति आपकी हर मनोकामना पूरी करें.",
      tags: ["family", "work"],
    },
    {
      text: "गरबा, ढोल और नौ रातों की रौनक — इस बार जमकर नाचिए. शुभ नवरात्रि!",
      tags: ["friends", "social"],
    },
    {
      text: "नवरात्रि के इस पावन अवसर पर आपको और आपकी पूरी टीम को शुभकामनाएँ. यह वर्ष नई शक्ति और सफलता लाए.",
      tags: ["work"],
    },
    {
      text: "माँ दुर्गा आपको हर चुनौती से लड़ने की शक्ति और सही निर्णय लेने का विवेक दें.",
      tags: ["work", "family"],
    },
    { text: "जय माता दी! नौ दिन, नौ रंग, एक ही भक्ति. #नवरात्रि", tags: ["social"] },
    {
      text: "उपवास भी, गरबा भी — नवरात्रि का असली मज़ा यही है. आप सबको शुभकामनाएँ.",
      tags: ["friends", "social"],
    },
    {
      text: "माँ के चरणों में आपके परिवार के लिए स्वास्थ्य, शांति और समृद्धि की प्रार्थना. शुभ नवरात्रि.",
      tags: ["family"],
    },
  ],
  marathi: [
    {
      text: "नवरात्रीच्या हार्दिक शुभेच्छा! माँ दुर्गा तुमच्या घरात सुख, शक्ती आणि समृद्धी आणो.",
      tags: ["family", "friends"],
    },
    {
      text: "नऊ रात्री, नऊ रूपे, असंख्य आशीर्वाद. आदिशक्ती तुमच्या सर्व इच्छा पूर्ण करो.",
      tags: ["family", "work"],
    },
    {
      text: "गरबा, दांडिया आणि नऊ रात्रींचा जल्लोष — यंदा मनसोक्त नाचा! शुभ नवरात्री.",
      tags: ["friends", "social"],
    },
    {
      text: "नवरात्रीच्या शुभ पर्वावर आपणास व आपल्या सहकाऱ्यांना शुभेच्छा. हे वर्ष नवी ऊर्जा आणि यश देवो.",
      tags: ["work"],
    },
    {
      text: "देवी दुर्गा तुम्हाला प्रत्येक अडचणीशी लढण्याची शक्ती आणि योग्य निर्णयाचा विवेक देवो.",
      tags: ["work", "family"],
    },
    { text: "बोला अंबे माता की जय! नऊ दिवस, नऊ रंग, एकच भक्ती. #नवरात्री", tags: ["social"] },
    {
      text: "देवीच्या चरणी तुमच्या कुटुंबासाठी आरोग्य, शांती आणि भरभराटीची प्रार्थना.",
      tags: ["family"],
    },
    {
      text: "दिवसा उपवास, रात्री गरबा — नवरात्रीची खरी मजा हीच. सर्वांना शुभेच्छा!",
      tags: ["friends", "social"],
    },
  ],
  gujarati: [
    {
      text: "નવરાત્રિની હાર્દિક શુભકામનાઓ! મા દુર્ગા તમારા ઘરમાં સુખ, શક્તિ અને સમૃદ્ધિ લાવે.",
      tags: ["family", "friends"],
    },
    {
      text: "નવ રાત, નવ સ્વરૂપ, અગણિત આશીર્વાદ. મા આદ્યશક્તિ તમારી દરેક મનોકામના પૂર્ણ કરે.",
      tags: ["family", "work"],
    },
    {
      text: "ગરબા, ઢોલ અને નવ રાતની રોનક — આ વખતે દિલ ખોલીને રમો. શુભ નવરાત્રિ!",
      tags: ["friends", "social"],
    },
    {
      text: "નવરાત્રિના પાવન અવસરે આપને અને આપની ટીમને શુભકામનાઓ. આ વર્ષ નવી શક્તિ અને સફળતા લાવે.",
      tags: ["work"],
    },
    {
      text: "મા દુર્ગા તમને દરેક પડકાર સામે લડવાની શક્તિ અને સાચો નિર્ણય લેવાની સમજ આપે.",
      tags: ["work", "family"],
    },
    { text: "જય માતાજી! નવ દિવસ, નવ રંગ, એક જ ભક્તિ. #નવરાત્રિ", tags: ["social"] },
    {
      text: "માના ચરણોમાં તમારા પરિવાર માટે આરોગ્ય, શાંતિ અને સમૃદ્ધિની પ્રાર્થના.",
      tags: ["family"],
    },
  ],
  english: [
    {
      text: "Happy Navratri! May Maa Durga fill your home with strength, peace and prosperity through all nine nights.",
      tags: ["family", "friends"],
    },
    {
      text: "Nine nights, nine forms, countless blessings. May Adi Shakti grant everything you are praying for.",
      tags: ["family", "work"],
    },
    {
      text: "Garba, dhol and nine nights of noise — dance like you mean it. Happy Navratri!",
      tags: ["friends", "social"],
    },
    {
      text: "Warm Navratri wishes to you and your team. May the year ahead bring fresh energy and steady growth.",
      tags: ["work"],
    },
    {
      text: "May the Goddess give you the strength to face every challenge and the clarity to make the right call.",
      tags: ["work", "family"],
    },
    { text: "Nine days, nine colours, one devotion. Jai Mata Di. #Navratri", tags: ["social"] },
    {
      text: "Praying at the Devi's feet for your family's health, peace and prosperity this Navratri.",
      tags: ["family"],
    },
    {
      text: "Fasting by day, garba by night — that is the whole point of Navratri. Wishes to everyone.",
      tags: ["friends", "social"],
    },
  ],
  telugu: [
    {
      text: "శరన్నవరాత్రుల శుభాకాంక్షలు! అమ్మవారు మీ ఇంటికి శక్తి, శాంతి, సంపదలు ప్రసాదించాలి.",
      tags: ["family", "friends"],
    },
    {
      text: "తొమ్మిది రాత్రులు, తొమ్మిది రూపాలు, లెక్కలేనన్ని ఆశీస్సులు. ఆదిశక్తి మీ కోరికలన్నీ తీర్చాలి.",
      tags: ["family", "work"],
    },
    {
      text: "బతుకమ్మ, కోలాటం, తొమ్మిది రాత్రుల సందడి — ఈసారి మనసారా ఆనందించండి. శుభ నవరాత్రులు!",
      tags: ["friends", "social"],
    },
    {
      text: "నవరాత్రుల సందర్భంగా మీకు, మీ బృందానికి శుభాకాంక్షలు. ఈ ఏడాది కొత్త శక్తిని, విజయాన్ని ఇవ్వాలి.",
      tags: ["work"],
    },
    {
      text: "అమ్మవారు మీకు ప్రతి సవాలును ఎదుర్కొనే శక్తిని, సరైన నిర్ణయం తీసుకునే వివేకాన్ని ఇవ్వాలి.",
      tags: ["work", "family"],
    },
    { text: "తొమ్మిది రోజులు, తొమ్మిది రంగులు, ఒకే భక్తి. #నవరాత్రి", tags: ["social"] },
    {
      text: "అమ్మవారి పాదాల చెంత మీ కుటుంబ ఆరోగ్యం, శాంతి, సమృద్ధి కోసం ప్రార్థన.",
      tags: ["family"],
    },
  ],
};

export const MAX_MESSAGES = 8;

/** Day 0 means "any night of the festival" — no day-specific line is added. */
export const ANY_DAY = 0;

/**
 * GSM 03.38 fits 160 characters in one SMS and 153 per part when concatenated.
 * Indic scripts force UCS-2, which allows 70 and 67 respectively.
 */
export const SMS_LIMITS = {
  gsm7: { single: 160, concatenated: 153 },
  ucs2: { single: 70, concatenated: 67 },
};

const GSM7_SAFE = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅå_ÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/;
const GSM7_EXTENDED = /[\^{}\\[\]~|€]/g;

/** Count SMS segments for a message body. */
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

/** mulberry32 — deterministic 32-bit PRNG so a seed always reproduces a set. */
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

/** Look up one night. Returns null for ANY_DAY or an out-of-range day. */
export function getDayInfo(day) {
  const n = Number(day);
  if (!Number.isInteger(n) || n < 1 || n > FESTIVAL_FACTS.nights) return null;
  return NAVRATRI_DAYS[n - 1];
}

/**
 * Build the personalised greetings.
 *
 * @param {object} options
 * @param {string} options.language   LANGUAGES[].id
 * @param {string} options.audience   AUDIENCES[].id
 * @param {number} [options.day]      0 for any night, or 1..9
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]    1..MAX_MESSAGES
 * @param {number} [options.seed]
 */
export function generateWishes({
  language,
  audience,
  day = ANY_DAY,
  recipientName = "",
  senderName = "",
  count = 3,
  seed = 1,
} = {}) {
  const meta = LANGUAGES.find((item) => item.id === language);
  if (!meta) return { error: "Pick a language from the list." };
  if (!AUDIENCES.some((item) => item.id === audience)) {
    return { error: "Pick who the message is for." };
  }

  const dayNumber = Number(day);
  if (!Number.isInteger(dayNumber) || dayNumber < 0 || dayNumber > FESTIVAL_FACTS.nights) {
    return { error: `Choose a night from 1 to ${FESTIVAL_FACTS.nights}, or "any night".` };
  }

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one message." };
  }
  if (wanted > MAX_MESSAGES) {
    return { error: `Ask for ${MAX_MESSAGES} messages or fewer in one go.` };
  }

  const generic = TEMPLATES[language].filter((item) => item.tags.includes(audience));
  if (generic.length === 0) {
    return { error: "No wording in this language fits that audience yet." };
  }

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 1;
  const rng = mulberry32(safeSeed + dayNumber * 101 + 1);

  const dayInfo = getDayInfo(dayNumber);
  const bodies = [];
  if (dayInfo) {
    const dayLine = shuffle(DAY_TEMPLATES[language], rng)[0]
      .replace("{day}", String(dayInfo.day))
      .replace("{goddess}", dayInfo.goddess[meta.script])
      .replace("{colour}", dayInfo.colour[meta.script]);
    bodies.push(dayLine);
  }
  for (const item of shuffle(generic, rng)) bodies.push(item.text);

  const picked = bodies.slice(0, Math.min(Math.trunc(wanted), bodies.length));
  const name = cleanName(recipientName);
  const sender = cleanName(senderName);
  const salutation = SALUTATIONS[language];

  const messages = picked.map((body, index) => {
    const parts = [];
    if (name) parts.push(salutation.replace("{name}", name));
    parts.push(body);
    if (sender) parts.push(`— ${sender}`);
    const text = parts.join("\n");
    const sms = countSmsSegments(text);
    return {
      id: `${language}-${audience}-${dayNumber}-${safeSeed}-${index}`,
      text,
      characters: [...text].length,
      encoding: sms.encoding,
      smsSegments: sms.segments,
      daySpecific: Boolean(dayInfo) && index === 0,
    };
  });

  return {
    language,
    audience,
    day: dayNumber,
    dayInfo: dayInfo
      ? {
          day: dayInfo.day,
          goddess: dayInfo.goddess[meta.script],
          goddessRoman: dayInfo.goddess.en,
          colour: dayInfo.colour[meta.script],
          colourRoman: dayInfo.colour.en,
          bhog: dayInfo.bhog,
        }
      : null,
    requested: Math.trunc(wanted),
    available: bodies.length,
    messages,
  };
}
