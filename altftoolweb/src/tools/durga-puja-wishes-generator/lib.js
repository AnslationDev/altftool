/**
 * Durga Puja wishes generator - pure, deterministic text composition.
 *
 * No React, no DOM, no Math.random and no Date.now: variety comes from a caller
 * supplied integer seed, so the same inputs always produce the same greetings.
 *
 * Festival facts used in the day descriptions:
 *  - Durga Puja is counted in the bright fortnight (Shukla Paksha) of the month
 *    of Ashwin. Mahalaya marks the end of Pitri Paksha and the start of Devi
 *    Paksha, a week before Shashthi.
 *  - The four main puja days are Maha Shashthi (6th tithi), Maha Saptami (7th),
 *    Maha Ashtami (8th) and Maha Navami (9th); Bijoya Dashami (10th) is the
 *    immersion day.
 *  - Sandhi Puja is performed in the 48-minute window straddling the end of
 *    Ashtami and the start of Navami: the last 24 minutes of Ashtami and the
 *    first 24 minutes of Navami, with 108 earthen lamps lit.
 *  - In 2025 Durga Puja fell in late September (Shashthi on 28 September); in
 *    2026 the tithis fall in October. Exact dates change every year because the
 *    festival follows the lunar calendar, so no date is hard-coded here.
 *
 * Message length rules used by the counter:
 *  - GSM-7 encoded SMS fits 160 characters in a single segment.
 *  - Any Bengali (or other non-Latin) character forces UCS-2 encoding, which
 *    fits only 70 characters in a single segment.
 *  - WhatsApp text status allows up to 700 characters.
 */

/** Single-segment SMS length when the whole message is GSM-7 (Latin) text. */
export const SMS_GSM7_LIMIT = 160;

/** Single-segment SMS length once any non-Latin character forces UCS-2. */
export const SMS_UNICODE_LIMIT = 70;

/** Maximum length of a WhatsApp text status. */
export const WHATSAPP_STATUS_LIMIT = 700;

/** Number of earthen lamps lit during Sandhi Puja. */
export const SANDHI_PUJA_LAMPS = 108;

/** Length of the Sandhi Puja window, in minutes (24 + 24). */
export const SANDHI_PUJA_WINDOW_MINUTES = 48;

export const MIN_WISHES = 1;
export const MAX_WISHES = 8;

export const SCRIPTS = [
  { id: "bengali", label: "Bengali script (বাংলা)" },
  { id: "banglish", label: "Banglish (Bengali in Roman letters)" },
  { id: "english", label: "English" },
];

export const PUJA_DAYS = [
  {
    id: "sharodiya",
    label: "General Sharadiya wish",
    greeting: {
      bengali: "শুভ শারদীয়া",
      banglish: "Shubho Sharodiya",
      english: "Happy Durga Puja",
    },
    ritual: {
      bengali: "মা দুর্গা এসেছেন, চারদিকে ঢাকের আওয়াজ আর শিউলি ফুলের গন্ধ।",
      banglish: "Maa Durga esechen - charidike dhaker awaaj aar shiuli phuler gondho.",
      english:
        "The dhak is playing, the shiuli is in bloom and Maa Durga has arrived at her father's home.",
    },
  },
  {
    id: "mahalaya",
    label: "Mahalaya",
    greeting: {
      bengali: "শুভ মহালয়া",
      banglish: "Shubho Mahalaya",
      english: "Happy Mahalaya",
    },
    ritual: {
      bengali: "ভোরের চণ্ডীপাঠে দেবীপক্ষের সূচনা, মায়ের আগমনী বার্তা এল।",
      banglish:
        "Bhorer Chandipath diye Debipokkho shuru holo - Maa-er agomoni barta ese gelo.",
      english:
        "Devi Paksha opens with the dawn recital of Mahishasura Mardini, and the countdown to the goddess's arrival begins.",
    },
  },
  {
    id: "shashthi",
    label: "Maha Shashthi",
    greeting: {
      bengali: "শুভ ষষ্ঠী",
      banglish: "Shubho Shashthi",
      english: "Happy Maha Shashthi",
    },
    ritual: {
      bengali: "বোধনের দিনে মায়ের মুখ উন্মোচিত হল, পুজো শুরু।",
      banglish: "Bodhon-er dine Maa-er mukh unmochito holo - pujo shuru.",
      english:
        "On Bodhon the goddess's face is unveiled and the five days of worship formally begin.",
    },
  },
  {
    id: "saptami",
    label: "Maha Saptami",
    greeting: {
      bengali: "শুভ সপ্তমী",
      banglish: "Shubho Saptami",
      english: "Happy Maha Saptami",
    },
    ritual: {
      bengali: "ভোরে নবপত্রিকা স্নান, নয়টি গাছে মায়ের নয় রূপের আবাহন।",
      banglish:
        "Bhore Nabapatrika snan - noyti gachhe Maa-er noy rup-er abahan.",
      english:
        "Saptami opens with the Nabapatrika bath at dawn, where nine plants stand for nine forms of the goddess.",
    },
  },
  {
    id: "ashtami",
    label: "Maha Ashtami",
    greeting: {
      bengali: "শুভ অষ্টমী",
      banglish: "Shubho Ashtami",
      english: "Happy Maha Ashtami",
    },
    ritual: {
      bengali:
        "অঞ্জলি, নতুন জামা আর সন্ধিপুজোর ১০৮টি প্রদীপ - অষ্টমীর দিনটাই আলাদা।",
      banglish:
        "Anjali, notun jama ar Sandhi Pujor 108 prodeep - Ashtami-r din-tai alada.",
      english:
        "Pushpanjali in new clothes, and then Sandhi Puja with 108 earthen lamps in the 48-minute window between Ashtami and Navami.",
    },
  },
  {
    id: "navami",
    label: "Maha Navami",
    greeting: {
      bengali: "শুভ নবমী",
      banglish: "Shubho Nabami",
      english: "Happy Maha Navami",
    },
    ritual: {
      bengali:
        "নবমীর আরতি, ধুনুচি নাচ আর ভোগ - পুজোর শেষ পূর্ণ দিনটা জমিয়ে কাটুক।",
      banglish:
        "Nabami-r aarti, dhunuchi naach ar bhog - pujor shesh purno din-ta jomiye katuk.",
      english:
        "Navami brings the maha aarti, the dhunuchi naach and the bhog queue - the last full day of the puja.",
    },
  },
  {
    id: "dashami",
    label: "Bijoya Dashami",
    greeting: {
      bengali: "শুভ বিজয়া দশমী",
      banglish: "Shubho Bijoya Dashami",
      english: "Happy Bijoya Dashami",
    },
    ritual: {
      bengali:
        "দেবীবরণ, সিঁদুর খেলা আর মিষ্টিমুখ - মা ফিরছেন, আসছে বছর আবার হবে।",
      banglish:
        "Debi boron, sindoor khela ar mishti mukh - Maa firchhen, asche bochor abar hobe.",
      english:
        "Devi Boron, sindoor khela and sweets - the goddess leaves for Kailash, and we say asche bochor abar hobe.",
    },
    // Dashami is a farewell, so it needs its own captions - an arrival line
    // like "Maa is home" would be wrong on immersion day.
    statusLines: {
      bengali: [
        "আসছে বছর আবার হবে।",
        "শুভ বিজয়া।",
        "মিষ্টিমুখ হয়ে গেছে?",
        "মা চললেন।",
        "কোলাকুলি বাকি আছে।",
      ],
      banglish: [
        "Asche bochor abar hobe.",
        "Shubho Bijoya.",
        "Mishti mukh hoye gechhe?",
        "Maa chollen.",
        "Kolakuli baaki achhe.",
      ],
      english: [
        "Asche bochor abar hobe.",
        "See you next year, Maa.",
        "Sindoor, sweets and a lump in the throat.",
        "She has gone home.",
        "Shubho Bijoya.",
      ],
    },
  },
];

export const TONES = [
  {
    id: "traditional",
    label: "Traditional and devotional",
    lines: {
      bengali: [
        "মা দুর্গার আশীর্বাদে আপনার জীবন সুখ, শান্তি ও সমৃদ্ধিতে ভরে উঠুক।",
        "অশুভ শক্তির বিনাশ হোক, শুভশক্তির জয় হোক।",
        "মায়ের চরণে আপনার সব প্রার্থনা পূর্ণ হোক।",
      ],
      banglish: [
        "Maa Durgar ashirbade apnar jibon sukh, shanti o somriddhite bhore uthuk.",
        "Oshubho shokti-r binash hok, shubho shokti-r joy hok.",
        "Maa-er chorone apnar shob prarthona purno hok.",
      ],
      english: [
        "May Maa Durga's blessings fill your home with peace, health and prosperity.",
        "May every difficulty be defeated the way Mahishasura was, and may good win.",
        "May the goddess grant everything you have quietly prayed for this year.",
      ],
    },
  },
  {
    id: "family",
    label: "Family and close friends",
    lines: {
      bengali: [
        "পুজোর কটা দিন খুব ভালো কাটুক, প্রচুর ঠাকুর দেখা আর খাওয়াদাওয়া হোক।",
        "ঢাকের তাল, আলোর রোশনাই আর বন্ধুদের আড্ডায় ভরে উঠুক এই পুজো।",
        "দূরে থাকলেও মনটা তো প্যান্ডেলেই - খুব ভালো থেকো।",
      ],
      banglish: [
        "Pujor kota din khub bhalo katuk - onek thakur dekha ar khawa-dawa hok.",
        "Dhaker taal, alor roshnai ar bondhuder addaya bhore uthuk ei pujo.",
        "Dure thakleo mon-ta to pandel-ei - khub bhalo theko.",
      ],
      english: [
        "Wishing you five days of pandal hopping, new clothes and far too much food.",
        "May the adda be long, the queues short and the bhog exactly as you remember it.",
        "Wherever you are this year, may it still feel like home when the dhak starts.",
      ],
    },
  },
  {
    id: "professional",
    label: "Colleagues and clients",
    lines: {
      bengali: [
        "আপনাকে ও আপনার পরিবারকে শারদীয়ার আন্তরিক শুভেচ্ছা।",
        "আগামী বছরটি আপনার ও আপনার প্রতিষ্ঠানের জন্য সাফল্যে ভরা হোক।",
        "উৎসবের দিনগুলি আনন্দে ও সুস্থতায় কাটুক।",
      ],
      banglish: [
        "Apnake o apnar poribar-ke Sharodiya-r antorik shubhechha.",
        "Agami bochor-ti apnar o apnar protishthan-er jonno shafollye bhora hok.",
        "Utsob-er din-guli anonde o susthotay katuk.",
      ],
      english: [
        "Warm Durga Puja greetings to you and your family from all of us.",
        "May the year ahead bring steady growth to you and your team.",
        "Wishing you a restful festive break and a strong quarter after it.",
      ],
    },
  },
  {
    id: "status",
    label: "Short status or caption",
    lines: {
      bengali: [
        "ঢাকে কাঠি পড়ে গেছে।",
        "পুজো এসে গেছে, মন ভালো।",
        "মা এসেছেন।",
        "শিউলি ফুটেছে, বাকিটা বুঝে নিন।",
        "প্যান্ডেলে দেখা হচ্ছে।",
      ],
      banglish: [
        "Dhaake kathi pore gechhe.",
        "Pujo eshe gechhe, mon bhalo.",
        "Maa esechen.",
        "Shiuli phutechhe, baki-ta bujhe nin.",
        "Pandel-e dekha hochhe.",
      ],
      english: [
        "The dhak has started.",
        "Puja is here. Everything else can wait.",
        "Maa is home.",
        "Shiuli in the air, sindoor on the way.",
        "Out of office. In the pandal queue.",
      ],
    },
  },
];

const CLOSERS = {
  bengali: ["শুভ শারদীয়া!", "ভালো থাকবেন।", "মা-এর আশীর্বাদ সঙ্গে থাকুক।"],
  banglish: ["Shubho Sharodiya!", "Bhalo thakben.", "Maa-er ashirbad shonge thakuk."],
  english: ["Shubho Sharodiya!", "Take care and enjoy every day of it.", "May her blessings stay with you."],
};

const byId = (list, id) => list.find((item) => item.id === id) || null;

const clean = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");

/** Deterministic 32-bit mixer - same seed always gives the same stream. */
function mix(seed, salt) {
  let h = (Math.trunc(seed) ^ (salt * 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Count SMS segments. Any character outside the Latin/GSM range forces UCS-2,
 * which drops the single-segment budget from 160 to 70 characters.
 */
export function measureMessage(text) {
  const characters = Array.from(String(text || ""));
  const length = characters.length;
  const isUnicode = characters.some((ch) => ch.codePointAt(0) > 0x7f);
  const limit = isUnicode ? SMS_UNICODE_LIMIT : SMS_GSM7_LIMIT;
  const segments = length === 0 ? 0 : Math.ceil(length / limit);
  return {
    length,
    isUnicode,
    smsLimit: limit,
    smsSegments: segments,
    fitsOneSms: length > 0 && length <= limit,
    fitsWhatsAppStatus: length <= WHATSAPP_STATUS_LIMIT,
  };
}

/** Body lines for a day + tone + script; a day may override the caption set. */
function linesFor(day, tone, script) {
  if (tone.id === "status" && day.statusLines) return day.statusLines[script] || [];
  return (tone.lines && tone.lines[script]) || [];
}

/** How many distinct messages a day + tone + script combination produces. */
export function variantCountFor(dayId, toneId, script) {
  const day = byId(PUJA_DAYS, dayId);
  const tone = byId(TONES, toneId);
  if (!day || !tone || !CLOSERS[script]) return 0;
  const lines = linesFor(day, tone, script);
  if (lines.length === 0) return 0;
  if (tone.id === "status") return lines.length;
  return lines.length * CLOSERS[script].length;
}

/**
 * Build a list of Durga Puja greetings.
 *
 * @param {object} input
 * @param {string} [input.dayId]         One of PUJA_DAYS ids.
 * @param {string} [input.toneId]        One of TONES ids.
 * @param {string} [input.script]        One of SCRIPTS ids.
 * @param {string} [input.recipientName] Inserted after the greeting.
 * @param {string} [input.senderName]    Signed at the end.
 * @param {number} [input.count]         How many variants, 1 to 8.
 * @param {number} [input.seed]          Integer that shuffles the variants.
 * @returns {{error:string}|{day:object,tone:object,script:string,wishes:Array}}
 */
export function generateDurgaPujaWishes(input) {
  const data = input && typeof input === "object" ? input : {};

  const day = byId(PUJA_DAYS, data.dayId);
  if (!day) return { error: "Pick which day of the puja the message is for." };

  const tone = byId(TONES, data.toneId);
  if (!tone) return { error: "Pick a tone for the message." };

  const script = byId(SCRIPTS, data.script) ? data.script : null;
  if (!script) return { error: "Pick Bengali, Banglish or English." };

  const recipient = clean(data.recipientName);
  const sender = clean(data.senderName);

  if (recipient.length > 40) return { error: "Recipient name is too long - keep it under 40 characters." };
  if (sender.length > 40) return { error: "Your name is too long - keep it under 40 characters." };

  const countRaw = data.count == null || data.count === "" ? 3 : Number(data.count);
  if (!Number.isFinite(countRaw)) return { error: "Number of messages must be a whole number." };
  const count = Math.round(countRaw);
  if (count < MIN_WISHES || count > MAX_WISHES) {
    return { error: `Choose between ${MIN_WISHES} and ${MAX_WISHES} messages at a time.` };
  }

  const seedRaw = data.seed == null || data.seed === "" ? 1 : Number(data.seed);
  if (!Number.isFinite(seedRaw)) return { error: "Seed must be a number." };
  const seed = Math.trunc(seedRaw);

  const toneLines = linesFor(day, tone, script);
  const closers = CLOSERS[script];
  const greeting = day.greeting[script];
  const ritual = day.ritual[script];
  const isShort = tone.id === "status";
  if (toneLines.length === 0) return { error: "No wording is available for that combination yet." };

  // Every generated message must be different, so cap the request at the number
  // of distinct line combinations this tone can actually produce.
  const maxVariants = isShort ? toneLines.length : toneLines.length * closers.length;
  if (count > maxVariants) {
    return {
      error: `This tone has ${maxVariants} distinct messages - lower the count or pick another tone.`,
    };
  }

  // Deterministic walk: the tone line advances every step and the closer advances
  // once per full pass, so the first maxVariants messages never repeat.
  const toneOffset = mix(seed, 1) % toneLines.length;
  const closerOffset = mix(seed, 101) % closers.length;

  const wishes = [];
  for (let index = 0; index < count; index += 1) {
    const toneLine = toneLines[(toneOffset + index) % toneLines.length];
    const closer =
      closers[(closerOffset + Math.floor((toneOffset + index) / toneLines.length)) % closers.length];

    // A status caption stands on its own; prefixing the greeting would repeat it.
    const head = recipient ? `${greeting}, ${recipient}!` : `${greeting}!`;
    const parts = isShort ? [toneLine] : [head, ritual, toneLine, closer];
    let text = parts.join(" ");
    if (sender) text += `\n\n- ${sender}`;

    wishes.push({
      id: `${day.id}-${tone.id}-${script}-${index}`,
      text,
      ...measureMessage(text),
    });
  }

  const longestLength = wishes.reduce((max, wish) => (wish.length > max ? wish.length : max), 0);

  return {
    day,
    tone,
    script,
    seed,
    count,
    wishes,
    longestLength,
    variantsAvailable: maxVariants,
    greetingUsed: greeting,
  };
}
