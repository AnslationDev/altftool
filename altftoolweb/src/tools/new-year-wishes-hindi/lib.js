/**
 * Hindi New Year Wishes — data + pure logic.
 *
 * Covers both new years a Hindi-speaking household keeps: 1 January on the
 * Gregorian calendar, and Nav Varsh on Chaitra shukla pratipada, which starts
 * the Vikram Samvat year in March or April.
 *
 * No React, no DOM, no Date.now(). Invalid input returns { error }.
 */

export const OCCASIONS = [
  {
    id: "gregorian",
    label: "1 January (Gregorian)",
    hindi: "अंग्रेज़ी नववर्ष",
    date: "1 January",
  },
  {
    id: "navVarsh",
    label: "Hindu Nav Varsh (Chaitra shukla pratipada)",
    hindi: "हिंदू नववर्ष",
    date: "Chaitra shukla pratipada, in March or April",
  },
];

export const AUDIENCES = [
  { id: "family", label: "Family" },
  { id: "friends", label: "Friends" },
  { id: "senior", label: "Elders, boss or teacher" },
  { id: "clients", label: "Clients & business" },
  { id: "caption", label: "Status / caption" },
  { id: "shayari", label: "Shayari style" },
];

export const SALUTATION = "प्रिय {name},";

/** TEMPLATES[occasion] = [{ text, tags }] */
export const TEMPLATES = {
  gregorian: [
    {
      text: "नया साल आपके और आपके परिवार के लिए सेहत, सुकून और ढेर सारी अच्छी ख़बरें लेकर आए. नववर्ष की हार्दिक शुभकामनाएँ!",
      tags: ["family", "friends"],
    },
    {
      text: "आपके आशीर्वाद से बीता साल आसान रहा. नए साल में भी आपका मार्गदर्शन यूँ ही मिलता रहे. नववर्ष मंगलमय हो.",
      tags: ["family", "senior"],
    },
    {
      text: "पुराना कैलेंडर उतर गया — अब बहाने भी उतार दीजिए. नया साल मुबारक!",
      tags: ["friends", "caption"],
    },
    {
      text: "बीते वर्ष आपके सहयोग और भरोसे के लिए हार्दिक धन्यवाद. नववर्ष आपके व्यवसाय के लिए वृद्धि और सफलता लेकर आए.",
      tags: ["clients"],
    },
    {
      text: "नववर्ष की शुभकामनाएँ. आने वाला वर्ष आपके और आपकी टीम के लिए नए अवसर और स्थिर प्रगति लेकर आए.",
      tags: ["clients", "senior"],
    },
    { text: "नया साल, नया पन्ना, वही ज़िद. शुभ नववर्ष! #नयासाल", tags: ["caption"] },
    {
      text: "हर सुबह हो नई उम्मीदों वाली, हर रात हो चैन की — बस यही दुआ है इस नए साल की. नववर्ष की शुभकामनाएँ.",
      tags: ["shayari"],
    },
    {
      text: "इस साल कम वादे, ज़्यादा काम — और थोड़ी नींद भी. नया साल मुबारक हो!",
      tags: ["friends", "family"],
    },
    {
      text: "बीते बरस की थकान वहीं छोड़ दीजिए; नया बरस आपको हल्का और ख़ुश रखे.",
      tags: ["shayari", "friends"],
    },
  ],
  navVarsh: [
    {
      text: "चैत्र शुक्ल प्रतिपदा से नववर्ष का आरंभ. नया विक्रम संवत आपके घर में आरोग्य, समृद्धि और शांति लाए.",
      tags: ["family"],
    },
    {
      text: "हिंदू नववर्ष की हार्दिक शुभकामनाएँ. आपके आशीर्वाद से यह संवत्सर मंगलमय हो.",
      tags: ["family", "senior"],
    },
    {
      text: "नीम की कड़वाहट और गुड़ की मिठास — नए संवत्सर की हर चुनौती और हर ख़ुशी का स्वागत. शुभ नववर्ष!",
      tags: ["friends", "caption"],
    },
    {
      text: "विक्रम संवत के नववर्ष पर आपको और आपके प्रतिष्ठान को हार्दिक शुभकामनाएँ. यह वर्ष व्यापार में वृद्धि लाए.",
      tags: ["clients"],
    },
    { text: "नया संवत्सर, नया पंचांग, नई शुरुआत. #हिंदूनववर्ष", tags: ["caption"] },
    {
      text: "नए संवत्सर की पहली किरण आपके हर संकल्प को बल दे. नववर्ष की शुभकामनाएँ.",
      tags: ["shayari"],
    },
    {
      text: "चैत्र नवसंवत्सर की शुभकामनाएँ. आने वाला वर्ष आपके हर निर्णय को सही दिशा दे.",
      tags: ["clients", "senior"],
    },
    { text: "बही-खाते भी नए, इरादे भी नए. हिंदू नववर्ष मुबारक!", tags: ["friends"] },
    {
      text: "नए वर्ष की हर सुबह आपके नाम एक अच्छी ख़बर लाए — यही कामना है.",
      tags: ["shayari", "family"],
    },
  ],
};

export const MAX_MESSAGES = 6;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;

/**
 * Era offsets, both counted from Chaitra shukla pratipada.
 *
 * Vikram Samvat runs 57 years ahead of the Common Era: on the Chaitra new year
 * of Gregorian year Y the Vikram year becomes Y + 57, so the months of Y before
 * that date still belong to Vikram year Y + 56.
 *
 * Shaka Samvat, the era of the Indian national calendar, runs 78 years behind:
 * from the Chaitra new year of Y it is Y - 78, and before it Y - 79.
 */
export const VIKRAM_OFFSET_AFTER_NAV_VARSH = 57;
export const SHAKA_OFFSET_AFTER_NAV_VARSH = -78;

/**
 * Vikram and Shaka years for a Gregorian year.
 *
 * @param {object} options
 * @param {number} options.gregorianYear
 * @param {boolean} [options.afterNavVarsh] true for dates on or after Chaitra
 *   shukla pratipada of that year, false for January to early March.
 */
export function samvatFor({ gregorianYear, afterNavVarsh = true } = {}) {
  const year = Number(gregorianYear);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  const shift = afterNavVarsh ? 0 : -1;
  return {
    gregorianYear: year,
    afterNavVarsh: Boolean(afterNavVarsh),
    vikramSamvat: year + VIKRAM_OFFSET_AFTER_NAV_VARSH + shift,
    shakaSamvat: year + SHAKA_OFFSET_AFTER_NAV_VARSH + shift,
  };
}

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
 * Build the personalised Hindi new year messages.
 *
 * @param {object} options
 * @param {string} options.occasion  OCCASIONS[].id
 * @param {string} options.audience  AUDIENCES[].id
 * @param {string} [options.recipientName]
 * @param {string} [options.senderName]
 * @param {number} [options.count]   1..MAX_MESSAGES
 * @param {number} [options.seed]
 */
export function generateWishes({
  occasion,
  audience,
  recipientName = "",
  senderName = "",
  count = 3,
  seed = 1,
} = {}) {
  const bank = TEMPLATES[occasion];
  if (!bank) return { error: "Pick which new year you are greeting for." };
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
    return { error: "No wording fits that audience for this new year yet." };
  }

  const safeSeed = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 1;
  const rng = mulberry32(safeSeed + 1);
  const picked = shuffle(pool, rng).slice(0, Math.min(Math.trunc(wanted), pool.length));

  const name = cleanName(recipientName);
  const sender = cleanName(senderName);

  const messages = picked.map((item, index) => {
    const parts = [];
    if (name) parts.push(SALUTATION.replace("{name}", name));
    parts.push(item.text);
    if (sender) parts.push(`— ${sender}`);
    const text = parts.join("\n");
    const sms = countSmsSegments(text);
    return {
      id: `${occasion}-${audience}-${safeSeed}-${index}`,
      text,
      characters: [...text].length,
      encoding: sms.encoding,
      smsSegments: sms.segments,
    };
  });

  return {
    occasion,
    audience,
    requested: Math.trunc(wanted),
    available: pool.length,
    messages,
  };
}
