/**
 * Chhath Puja Wishes Generator — data + pure logic.
 *
 * Chhath is a four-day festival addressed to Surya and Chhathi Maiya, running
 * from Kartika shukla chaturthi to saptami (October or November). A second,
 * smaller Chaiti Chhath is kept in Chaitra. The vrat on the middle two days is
 * nirjala — without water — and runs about 36 hours from the Kharna prasad to
 * the Usha Arghya the next morning.
 *
 * No React, no DOM, no Date.now(). Invalid input returns { error }.
 */

export const FESTIVAL_FACTS = {
  totalDays: 4,
  /** Hours of the nirjala vrat, from Kharna prasad to Usha Arghya. */
  fastHours: 36,
  startTithi: "Kartika shukla chaturthi",
  endTithi: "Kartika shukla saptami",
  gregorianWindow: "late October to November",
  secondObservance: "Chaiti Chhath in Chaitra (March or April)",
  regions: "Bihar, Jharkhand, eastern Uttar Pradesh and the Nepal Terai",
  prasad: ["Thekua", "Kasar laddu", "Sugarcane", "Coconut", "Seasonal fruit"],
};

/** The four days, in order, with the tithi each one falls on. */
export const CHHATH_DAYS = [
  {
    id: "nahayKhay",
    day: 1,
    label: "Nahay Khay",
    tithi: "Chaturthi",
    ritual: "A bath, then a single sattvik meal of kaddu-bhat, chana dal and arwa rice",
  },
  {
    id: "kharna",
    day: 2,
    label: "Kharna (Lohanda)",
    tithi: "Panchami",
    ritual: "A day-long fast broken at dusk with gud ki kheer and roti; the nirjala vrat starts here",
  },
  {
    id: "sandhyaArghya",
    day: 3,
    label: "Sandhya Arghya",
    tithi: "Shashthi",
    ritual: "Offerings from a soop to the setting sun, standing in the water at the ghat",
  },
  {
    id: "ushaArghya",
    day: 4,
    label: "Usha Arghya and Parana",
    tithi: "Saptami",
    ritual: "Offerings to the rising sun at dawn, after which the fast is broken",
  },
];

/** Choose this instead of a day for a greeting that works on any of the four. */
export const ANY_DAY = "any";

export const LANGUAGES = [
  { id: "bhojpuri", label: "Bhojpuri", native: "भोजपुरी" },
  { id: "maithili", label: "Maithili", native: "मैथिली" },
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
  bhojpuri: "प्रिय {name},",
  maithili: "प्रिय {name},",
  hindi: "प्रिय {name},",
  english: "Dear {name},",
};

/** One line per language per day, used as the featured message. */
export const DAY_LINES = {
  bhojpuri: {
    nahayKhay:
      "नहाय-खाय से छठ के शुरुआत हो गइल. कद्दू-भात के परसाद ग्रहण करीं आ चार दिन के ई महापर्व मंगलमय होखे.",
    kharna:
      "आज खरना बा — गुड़ के खीर आ रोटी के परसाद, आ ओकरा बाद छत्तीस घंटा के निर्जला उपवास. छठी मईया सभके सहायक होखस.",
    sandhyaArghya: "आज संझा के अरघ बा. डूबत सूरज के नमन करत रउवा सभ के मनोकामना पूरा होखे.",
    ushaArghya:
      "उगत सूरज के अरघ के साथे छठ पूरा भइल. छठी मईया रउवा घर में सुख, शांति आ समृद्धि दीहस.",
  },
  maithili: {
    nahayKhay:
      "नहाय-खाय सँ छठि पाबनिक शुरुआत भेल. कद्दू-भात केर प्रसाद ग्रहण करू, चारि दिनक ई महापर्व मंगलमय होअय.",
    kharna:
      "आइ खरना अछि — गुड़क खीर आ रोटीक प्रसाद, ओकर बाद छत्तीस घंटाक निर्जला व्रत आरंभ. छठि मैया अहाँ सभ पर कृपा करथि.",
    sandhyaArghya: "आइ सांझक अर्घ्य अछि. डूबैत सूर्यकेँ प्रणाम करैत अहाँक सभ मनोरथ पूर्ण होअय.",
    ushaArghya:
      "उगैत सूर्यकेँ अर्घ्य दैत छठि पाबनि सम्पन्न भेल. छठि मैया अहाँक घर सुख, शान्ति आ समृद्धि देथिन.",
  },
  hindi: {
    nahayKhay:
      "नहाय-खाय के साथ छठ महापर्व शुरू. कद्दू-भात का प्रसाद ग्रहण करें और चार दिन का यह पर्व मंगलमय हो.",
    kharna:
      "आज खरना है — गुड़ की खीर और रोटी का प्रसाद, और उसके बाद छत्तीस घंटे का निर्जला व्रत. छठी मैया सबका साथ दें.",
    sandhyaArghya: "आज संध्या अर्घ्य है. डूबते सूर्य को नमन करते हुए आपकी हर मनोकामना पूरी हो.",
    ushaArghya:
      "उगते सूर्य को अर्घ्य के साथ छठ संपन्न. छठी मैया आपके घर सुख, शांति और समृद्धि दें.",
  },
  english: {
    nahayKhay:
      "Chhath begins with Nahay Khay today — a bath, one sattvik meal of kaddu-bhat, and four days of discipline ahead. Best wishes to every vrati.",
    kharna:
      "Kharna today: gud ki kheer and roti at dusk, and then a 36-hour fast without water. Strength to everyone keeping it.",
    sandhyaArghya:
      "Sandhya Arghya this evening — offerings from the soop to the setting sun. May Chhathi Maiya grant what you have asked for.",
    ushaArghya:
      "Usha Arghya at first light and the vrat is complete. May Chhathi Maiya keep your home in health and plenty.",
  },
};

/** Wordings that work on any day of the festival. */
export const TEMPLATES = {
  bhojpuri: [
    {
      text: "छठ पूजा के हार्दिक शुभकामना! छठी मईया रउवा सभ पर आपन आशीर्वाद बनवले रहस.",
      tags: ["family", "work"],
    },
    {
      text: "सूरज देव आ छठी मईया के किरपा से रउवा घर में खुशहाली आवे. छठ के बधाई.",
      tags: ["family", "friends"],
    },
    { text: "घाट पर दीया, हाथ में सूप आ मन में आस्था — छठ के शुभकामना!", tags: ["friends", "caption"] },
    {
      text: "छठ महापर्व के अवसर पर रउवा आ रउवा परिवार के हार्दिक शुभकामना.",
      tags: ["work", "caption"],
    },
    {
      text: "ठेकुआ के मिठास आ अरघ के उजास — छठी मईया सभके मनोकामना पूरा करस.",
      tags: ["family", "caption"],
    },
  ],
  maithili: [
    {
      text: "छठि पाबनिक हार्दिक शुभकामना! छठि मैया अहाँ सभ पर अपन आशीर्वाद बनौने रहथि.",
      tags: ["family", "work"],
    },
    {
      text: "सूर्यदेव आ छठि मैयाक कृपा सँ अहाँक घर मे खुशहाली आबय. छठि पाबनिक बधाइ.",
      tags: ["family", "friends"],
    },
    {
      text: "घाट पर दीप, हाथ मे सूप आ मन मे आस्था — छठि पाबनिक शुभकामना!",
      tags: ["friends", "caption"],
    },
    {
      text: "छठ महापर्वक अवसर पर अहाँ आ अहाँक परिवारकेँ हार्दिक शुभकामना.",
      tags: ["work", "caption"],
    },
    {
      text: "ठेकुआक मिठास आ अर्घ्यक इजोत — छठि मैया सभक मनोकामना पूर्ण करथि.",
      tags: ["family", "caption"],
    },
  ],
  hindi: [
    {
      text: "छठ पूजा की हार्दिक शुभकामनाएँ! छठी मैया आप सब पर अपना आशीर्वाद बनाए रखें.",
      tags: ["family", "work"],
    },
    {
      text: "सूर्य देव और छठी मैया की कृपा से आपके घर में खुशहाली आए. छठ की बधाई.",
      tags: ["family", "friends"],
    },
    {
      text: "घाट पर दीये, हाथ में सूप और मन में आस्था — छठ की शुभकामनाएँ!",
      tags: ["friends", "caption"],
    },
    {
      text: "छठ महापर्व के अवसर पर आपको और आपके परिवार को हार्दिक शुभकामनाएँ.",
      tags: ["work", "caption"],
    },
    {
      text: "ठेकुए की मिठास और अर्घ्य का उजाला — छठी मैया सबकी मनोकामना पूरी करें.",
      tags: ["family", "caption"],
    },
  ],
  english: [
    {
      text: "Chhath Puja greetings. May Chhathi Maiya keep her blessings on you and your family.",
      tags: ["family", "work"],
    },
    {
      text: "May Surya Dev and Chhathi Maiya bring light and plenty to your home this Chhath.",
      tags: ["family", "friends"],
    },
    {
      text: "Lamps on the ghat, a soop in hand and complete faith. Happy Chhath Puja!",
      tags: ["friends", "caption"],
    },
    {
      text: "Warm wishes on Chhath, to you, your family and your team.",
      tags: ["work", "caption"],
    },
    {
      text: "The sweetness of thekua and the light of the arghya — may every prayer be answered.",
      tags: ["family", "caption"],
    },
  ],
};

export const MAX_MESSAGES = 4;

/**
 * GSM 03.38 fits 160 characters in one SMS and 153 per concatenated part.
 * Devanagari forces UCS-2 at 70 and 67 respectively.
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

/** Look up one of the four days. Returns null for ANY_DAY or an unknown id. */
export function getDayInfo(dayId) {
  return CHHATH_DAYS.find((item) => item.id === dayId) || null;
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
 * Build the personalised Chhath greetings.
 *
 * @param {object} options
 * @param {string} options.language  LANGUAGES[].id
 * @param {string} options.audience  AUDIENCES[].id
 * @param {string} [options.day]     CHHATH_DAYS[].id or ANY_DAY
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]   1..MAX_MESSAGES
 * @param {number} [options.seed]
 */
export function generateWishes({
  language,
  audience,
  day = ANY_DAY,
  recipientName = "",
  senderName = "",
  count = 2,
  seed = 1,
} = {}) {
  const bank = TEMPLATES[language];
  if (!bank) return { error: "Pick a language from the list." };
  if (!AUDIENCES.some((item) => item.id === audience)) {
    return { error: "Pick who the message is for." };
  }

  const dayInfo = getDayInfo(day);
  if (!dayInfo && day !== ANY_DAY) {
    return { error: "Pick one of the four Chhath days, or choose any day." };
  }

  const wanted = Number(count);
  if (!Number.isFinite(wanted) || wanted < 1) {
    return { error: "Ask for at least one message." };
  }
  if (wanted > MAX_MESSAGES) {
    return { error: `Ask for ${MAX_MESSAGES} messages or fewer in one go.` };
  }

  const generic = bank.filter((item) => item.tags.includes(audience));
  if (generic.length === 0) {
    return { error: "No wording in this language fits that audience yet." };
  }

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 1;
  const rng = mulberry32(safeSeed + 1);

  const bodies = [];
  if (dayInfo) bodies.push(DAY_LINES[language][dayInfo.id]);
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
      id: `${language}-${audience}-${dayInfo ? dayInfo.id : ANY_DAY}-${safeSeed}-${index}`,
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
    day: dayInfo ? dayInfo.id : ANY_DAY,
    dayInfo,
    requested: Math.trunc(wanted),
    available: bodies.length,
    messages,
  };
}
