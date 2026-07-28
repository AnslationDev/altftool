/**
 * Bihu Wishes Generator — data + pure logic.
 *
 * Assam keeps three Bihus in a year. They follow the Assamese solar calendar,
 * so the Gregorian dates barely drift, but they can still land a day either
 * side of the typical date recorded here.
 *
 * No React, no DOM, no Date.now(): the countdown takes its reference date as an
 * argument. Invalid input returns { error }, never NaN.
 */

export const BIHU_TYPES = [
  {
    id: "rongali",
    label: "Rongali (Bohag) Bihu",
    assamese: "ৰঙালী বিহু",
    month: "Bohag",
    /** Manuh Bihu, the new-year day proper; Goru Bihu falls the day before. */
    typicalMonth: 4,
    typicalDay: 15,
    typicalDate: "15 April (Goru Bihu on 14 April)",
    days: 7,
    meaning: "Assamese new year and the start of the sowing season",
    marks: ["Husori singing", "Bihu dance", "Gamosa gifting", "Pitha and laru"],
  },
  {
    id: "bhogali",
    label: "Bhogali (Magh) Bihu",
    assamese: "ভোগালী বিহু",
    month: "Magh",
    typicalMonth: 1,
    typicalDay: 15,
    typicalDate: "15 January (Uruka feast on 14 January)",
    days: 2,
    meaning: "the harvest feast at the end of the reaping season",
    marks: ["Uruka night feast", "Meji and bhelaghar", "Pitha, laru, doi-chira"],
  },
  {
    id: "kongali",
    label: "Kongali (Kati) Bihu",
    assamese: "কঙালী বিহু",
    month: "Kati",
    typicalMonth: 10,
    typicalDay: 18,
    typicalDate: "17 or 18 October",
    days: 1,
    meaning: "the austere Bihu, kept when the granary is empty and the paddy is still standing",
    marks: ["Saki lamps at the tulsi", "Akax Banti over the fields", "Prayers for the crop"],
  },
];

/** The seven days of Rongali Bihu. Names and order vary a little by district. */
export const RONGALI_DAYS = [
  { day: 1, name: "Goru Bihu", note: "Cattle are bathed and fed; the day before the new year" },
  { day: 2, name: "Manuh Bihu", note: "New year day: new clothes, gamosa given to elders" },
  { day: 3, name: "Gosai Bihu", note: "Household deities are honoured" },
  { day: 4, name: "Tator Bihu", note: "The loom and the weaver's craft" },
  { day: 5, name: "Nangolar Bihu", note: "The plough and farm implements" },
  { day: 6, name: "Ghora Bihu", note: "Livestock and cattle sheds" },
  { day: 7, name: "Chera Bihu", note: "The closing day of the week" },
];

export const LANGUAGES = [
  { id: "assamese", label: "Assamese", native: "অসমীয়া" },
  { id: "assameseRoman", label: "Assamese (Roman)", native: "Axomiya" },
  { id: "english", label: "English", native: "English" },
  { id: "hindi", label: "Hindi", native: "हिन्दी" },
];

export const AUDIENCES = [
  { id: "family", label: "Family & elders" },
  { id: "friends", label: "Friends" },
  { id: "work", label: "Colleagues & clients" },
  { id: "caption", label: "Status / caption" },
];

export const SALUTATIONS = {
  assamese: "প্ৰিয় {name},",
  assameseRoman: "Priyo {name},",
  english: "Dear {name},",
  hindi: "प्रिय {name},",
};

/** TEMPLATES[language][bihuType] = [{ text, tags }] */
export const TEMPLATES = {
  assamese: {
    rongali: [
      {
        text: "ৰঙালী বিহুৰ আন্তৰিক শুভেচ্ছা! নতুন বছৰে আপোনালোকৰ ঘৰত সুখ, শান্তি আৰু সমৃদ্ধি আনক।",
        tags: ["family", "work"],
      },
      {
        text: "বহাগৰ বতৰত নতুন আশা, নতুন সুৰ। ৰঙালী বিহুৰ শুভকামনা!",
        tags: ["family", "friends"],
      },
      {
        text: "ঢোল, পেঁপা আৰু গগনাৰ সুৰত এই বিহু আৰু ৰঙীন হওক। শুভ ৰঙালী বিহু!",
        tags: ["friends", "caption"],
      },
      {
        text: "গামোছাৰ সৈতে মৰম আৰু শুভেচ্ছা — বহাগ বিহুৰ শুভকামনা।",
        tags: ["work", "caption"],
      },
    ],
    bhogali: [
      {
        text: "ভোগালী বিহুৰ শুভেচ্ছা! মেজিৰ উম আৰু পিঠাৰ মিঠা আপোনাৰ ঘৰত সদায় থাকক।",
        tags: ["family", "work"],
      },
      {
        text: "উৰুকাৰ ৰাতি ভোজ, ৰাতিপুৱা মেজি — ভোগালী বিহুৰ আন্তৰিক শুভকামনা!",
        tags: ["family", "friends"],
      },
      {
        text: "নতুন ধানৰ পিঠা, লাৰু আৰু দৈ-চিৰা — ভোগালী বিহু ৰং লাগক!",
        tags: ["friends", "caption"],
      },
      {
        text: "মাঘ বিহুৰ শুভেচ্ছা। এই বছৰটোৱে আপোনাক সমৃদ্ধি আৰু সুস্বাস্থ্য দিয়ক।",
        tags: ["work", "caption"],
      },
    ],
    kongali: [
      {
        text: "কঙালী বিহুৰ শুভেচ্ছা। তুলসীৰ তলত জ্বলা চাকিয়ে আপোনাৰ জীৱনৰ আন্ধাৰ দূৰ কৰক।",
        tags: ["family", "work"],
      },
      {
        text: "কাতি বিহুত পথাৰত আকাশ বন্তি — আশা আৰু ধৈৰ্যৰ পৰ্ব। শুভকামনা।",
        tags: ["family", "friends"],
      },
      { text: "কম উৎসৱ, বেছি প্ৰাৰ্থনা — কঙালী বিহুৰ শুভেচ্ছা।", tags: ["friends", "caption"] },
      {
        text: "কাতি বিহুৰ শুভেচ্ছা। পথাৰৰ শস্য আৰু ঘৰৰ শান্তি দুয়োটাই বাঢ়ক।",
        tags: ["work", "caption"],
      },
    ],
  },
  assameseRoman: {
    rongali: [
      {
        text: "Rongali Bihur antarik xubhessa! Natun bosore apunalokor ghorot xukh, xanti aru xomriddhi anok.",
        tags: ["family", "work"],
      },
      {
        text: "Bohagor botorot natun axa, natun xur. Rongali Bihur xubhokamona!",
        tags: ["family", "friends"],
      },
      {
        text: "Dhol, pepa aru gagona xurot ei Bihu aru rongin hauk. Xubh Rongali Bihu!",
        tags: ["friends", "caption"],
      },
      {
        text: "Gamosar xoite morom aru xubhessa — Bohag Bihur xubhokamona.",
        tags: ["work", "caption"],
      },
    ],
    bhogali: [
      {
        text: "Bhogali Bihur xubhessa! Mejir um aru pithar mitha apunar ghorot xoday thakok.",
        tags: ["family", "work"],
      },
      {
        text: "Urukar rati bhoj, ratipuwa meji — Bhogali Bihur antarik xubhokamona!",
        tags: ["family", "friends"],
      },
      {
        text: "Natun dhanor pitha, laru aru doi-sira — Bhogali Bihu rong lagok!",
        tags: ["friends", "caption"],
      },
      {
        text: "Magh Bihur xubhessa. Ei bosore apunak xomriddhi aru xuxwasthya diyok.",
        tags: ["work", "caption"],
      },
    ],
    kongali: [
      {
        text: "Kongali Bihur xubhessa. Tulosir tolot jwola sakiye apunar jiwonor andhar dur korok.",
        tags: ["family", "work"],
      },
      {
        text: "Kati Bihut potharot Akax Banti — axa aru dhairyar porbo. Xubhokamona.",
        tags: ["family", "friends"],
      },
      { text: "Kom utsav, besi prarthona — Kongali Bihur xubhessa.", tags: ["friends", "caption"] },
      {
        text: "Kati Bihur xubhessa. Potharor xosyo aru ghoror xanti duyotai barhok.",
        tags: ["work", "caption"],
      },
    ],
  },
  english: {
    rongali: [
      {
        text: "Happy Rongali Bihu! May the Assamese new year bring your home peace, health and a generous harvest.",
        tags: ["family", "work"],
      },
      {
        text: "Bohag is here — new season, new songs, new beginnings. Warm wishes on Rongali Bihu.",
        tags: ["family", "friends"],
      },
      {
        text: "Dhol, pepa and gogona until the sun comes up. Have a wonderful Rongali Bihu!",
        tags: ["friends", "caption"],
      },
      {
        text: "A gamosa, a hug and every good wish for the year ahead. Happy Bohag Bihu.",
        tags: ["work", "caption"],
      },
    ],
    bhogali: [
      {
        text: "Happy Bhogali Bihu! May the warmth of the meji and a table full of pitha stay with you all year.",
        tags: ["family", "work"],
      },
      {
        text: "Uruka feast tonight, meji at dawn tomorrow. Wishing you a very happy Magh Bihu.",
        tags: ["family", "friends"],
      },
      {
        text: "Pitha, laru and doi-chira — the entire festival on one plate. Happy Bhogali Bihu!",
        tags: ["friends", "caption"],
      },
      {
        text: "Warm Magh Bihu wishes to you and your team. May this harvest year be a generous one.",
        tags: ["work", "caption"],
      },
    ],
    kongali: [
      {
        text: "Kongali Bihu greetings. May the lamp lit at the tulsi keep every shadow out of your year.",
        tags: ["family", "work"],
      },
      {
        text: "Akax Banti over the paddy fields — Kati Bihu is the quiet festival of patience and hope. Best wishes.",
        tags: ["family", "friends"],
      },
      {
        text: "Less feasting, more prayer. Wishing you a calm and hopeful Kongali Bihu.",
        tags: ["friends", "caption"],
      },
      {
        text: "Kati Bihu wishes — may the crop in the field and the calm at home both keep growing.",
        tags: ["work", "caption"],
      },
    ],
  },
  hindi: {
    rongali: [
      {
        text: "रंगाली बिहू की हार्दिक शुभकामनाएँ! असमिया नववर्ष आपके घर में सुख और समृद्धि लाए.",
        tags: ["family", "work"],
      },
      {
        text: "बहाग का महीना आ गया — नया मौसम, नए गीत, नई शुरुआत. बिहू की शुभकामनाएँ.",
        tags: ["family", "friends"],
      },
      {
        text: "ढोल, पेपा और गगना की धुन पर यह बिहू और रंगीन हो. शुभ रंगाली बिहू!",
        tags: ["friends", "caption"],
      },
      {
        text: "गमोछा के साथ ढेर सारा प्यार और शुभकामनाएँ. बहाग बिहू मुबारक.",
        tags: ["work", "caption"],
      },
    ],
    bhogali: [
      {
        text: "भोगाली बिहू की शुभकामनाएँ! मेजी की गर्माहट और पीठा की मिठास आपके घर बनी रहे.",
        tags: ["family", "work"],
      },
      {
        text: "उरुका की रात भोज, सुबह मेजी — मघ बिहू की हार्दिक बधाई!",
        tags: ["family", "friends"],
      },
      {
        text: "पीठा, लारू और दोई-चिरा — पूरा त्योहार एक थाली में. शुभ भोगाली बिहू!",
        tags: ["friends", "caption"],
      },
      {
        text: "मघ बिहू की शुभकामनाएँ. यह फ़सल का साल आपके लिए भरपूर हो.",
        tags: ["work", "caption"],
      },
    ],
    kongali: [
      {
        text: "कंगाली बिहू की शुभकामनाएँ. तुलसी के नीचे जलता दीया आपके जीवन का अंधेरा दूर करे.",
        tags: ["family", "work"],
      },
      {
        text: "खेतों पर आकाश बंती — काति बिहू धैर्य और उम्मीद का पर्व है. शुभकामनाएँ.",
        tags: ["family", "friends"],
      },
      {
        text: "कम उत्सव, ज़्यादा प्रार्थना — कंगाली बिहू की शुभकामनाएँ.",
        tags: ["friends", "caption"],
      },
      {
        text: "काति बिहू की शुभकामनाएँ. खेत की फ़सल और घर की शांति दोनों बढ़ें.",
        tags: ["work", "caption"],
      },
    ],
  },
};

export const MAX_MESSAGES = 4;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;

/**
 * GSM 03.38 fits 160 characters in one SMS and 153 per concatenated part.
 * Assamese and Devanagari force UCS-2 at 70 and 67 respectively.
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

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86400000;

/**
 * Days from a reference date to the next occurrence of a Bihu, using the
 * typical Gregorian date recorded in BIHU_TYPES. The Assamese solar calendar
 * can move the observance by a day, so treat the answer as a planning figure.
 *
 * @param {string} fromIsoDate "YYYY-MM-DD"
 * @param {string} bihuType    BIHU_TYPES[].id
 */
export function daysUntilBihu(fromIsoDate, bihuType) {
  const bihu = BIHU_TYPES.find((item) => item.id === bihuType);
  if (!bihu) return { error: "Pick which Bihu you are counting down to." };

  const match = ISO_DATE.exec(String(fromIsoDate == null ? "" : fromIsoDate).trim());
  if (!match) return { error: "Enter the reference date as YYYY-MM-DD." };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  const from = Date.UTC(year, month - 1, day);
  const check = new Date(from);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return { error: "That is not a real calendar date." };
  }

  let targetYear = year;
  let target = Date.UTC(targetYear, bihu.typicalMonth - 1, bihu.typicalDay);
  if (target < from) {
    targetYear += 1;
    target = Date.UTC(targetYear, bihu.typicalMonth - 1, bihu.typicalDay);
  }

  return {
    fromDate: `${match[1]}-${match[2]}-${match[3]}`,
    bihu: bihu.id,
    targetYear,
    targetDate: `${targetYear}-${String(bihu.typicalMonth).padStart(2, "0")}-${String(
      bihu.typicalDay,
    ).padStart(2, "0")}`,
    daysAway: Math.round((target - from) / MS_PER_DAY),
    approximate: true,
  };
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
 * Build the personalised Bihu greetings.
 *
 * @param {object} options
 * @param {string} options.language  LANGUAGES[].id
 * @param {string} options.bihuType  BIHU_TYPES[].id
 * @param {string} options.audience  AUDIENCES[].id
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]   1..MAX_MESSAGES
 * @param {number} [options.seed]
 */
export function generateWishes({
  language,
  bihuType,
  audience,
  recipientName = "",
  senderName = "",
  count = 2,
  seed = 1,
} = {}) {
  const bank = TEMPLATES[language];
  if (!bank) return { error: "Pick a language from the list." };
  const bihu = BIHU_TYPES.find((item) => item.id === bihuType);
  if (!bihu) return { error: "Pick which Bihu you are greeting for." };
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

  const pool = bank[bihuType].filter((item) => item.tags.includes(audience));
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
      id: `${language}-${bihuType}-${audience}-${safeSeed}-${index}`,
      text,
      characters: [...text].length,
      encoding: sms.encoding,
      smsSegments: sms.segments,
    };
  });

  return {
    language,
    bihuType,
    audience,
    requested: Math.trunc(wanted),
    available: pool.length,
    messages,
  };
}
