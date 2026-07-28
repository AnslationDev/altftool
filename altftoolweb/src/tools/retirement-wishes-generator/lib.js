/**
 * Retirement wishes composer.
 *
 * Two jobs:
 *  1. Work out the superannuation date and completed years of service.
 *  2. Compose farewell wording that can quote those figures.
 *
 * Pure: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

export const MAX_VARIANTS = 6;
export const MAX_NAME_LENGTH = 60;

/* ------------------------------------------------------------------ *
 * Superannuation ages actually used in India
 * ------------------------------------------------------------------ */

/**
 * Central Government civil posts superannuate at 60 under Fundamental Rule
 * 56(a). Many State Governments and PSUs use 58 or 60, and most private
 * employment contracts specify 58, 60 or 62 — so the age is selectable.
 */
export const RETIREMENT_AGES = [
  { id: 58, label: "58 (many State Govt & PSU cadres)" },
  { id: 60, label: "60 (Central Govt, FR 56(a))" },
  { id: 62, label: "62 (some private / academic posts)" },
  { id: 65, label: "65 (university teachers, some professions)" },
];

export const DEFAULT_RETIREMENT_AGE = 60;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86400000;
/** Mean days in a Gregorian year (365.2425) — used only for the years figure. */
const DAYS_PER_YEAR = 365.2425;

function parseISO(value) {
  const match = ISO_DATE.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return null;
  }
  return dt;
}

function toISO(dt) {
  const year = String(dt.getUTCFullYear()).padStart(4, "0");
  const month = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function lastDayOfMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0));
}

/**
 * Superannuation date under the Fundamental Rule 56(a) pattern.
 *
 * The rule: a Government servant retires on the afternoon of the last day of
 * the month in which they attain the retirement age. The proviso: someone born
 * on the first day of a month retires on the last day of the *preceding*
 * month, because they attain the age on the first.
 *
 * @returns {{iso:string, attainsOn:string, bornOnFirst:boolean}|{error:string}}
 */
export function superannuationDate(dobISO, age = DEFAULT_RETIREMENT_AGE) {
  const dob = parseISO(dobISO);
  if (!dob) return { error: "Enter a valid date of birth." };
  const years = Math.round(Number(age));
  if (!Number.isFinite(years) || years < 40 || years > 80) {
    return { error: "Retirement age should be between 40 and 80." };
  }

  const attainYear = dob.getUTCFullYear() + years;
  const monthIndex = dob.getUTCMonth();
  const lastOfBirthMonth = lastDayOfMonth(attainYear, monthIndex).getUTCDate();
  const attainDay = Math.min(dob.getUTCDate(), lastOfBirthMonth);
  const attainsOn = new Date(Date.UTC(attainYear, monthIndex, attainDay));

  const bornOnFirst = dob.getUTCDate() === 1;
  const retire = bornOnFirst
    ? lastDayOfMonth(attainYear, monthIndex - 1)
    : lastDayOfMonth(attainYear, monthIndex);

  return { iso: toISO(retire), attainsOn: toISO(attainsOn), bornOnFirst };
}

/**
 * Add whole months to a UTC date, clamping the day to the end of the target
 * month — 31 January plus one month is 28/29 February, not 2/3 March.
 */
function addMonths(dt, monthsToAdd) {
  const total = dt.getUTCFullYear() * 12 + dt.getUTCMonth() + monthsToAdd;
  const year = Math.floor(total / 12);
  const monthIndex = ((total % 12) + 12) % 12;
  const day = Math.min(dt.getUTCDate(), lastDayOfMonth(year, monthIndex).getUTCDate());
  return new Date(Date.UTC(year, monthIndex, day));
}

/**
 * Completed years, months and days between two ISO dates, calendar-accurate
 * (not a division), plus the raw day count.
 *
 * Whole months are counted first (clamping short months), then the leftover
 * days, so 31 Jan to 1 Mar reads as 1 month 1 day rather than a negative.
 */
export function serviceLength(fromISO, toISOValue) {
  const from = parseISO(fromISO);
  const to = parseISO(toISOValue);
  if (!from || !to) return { error: "Both dates must be valid." };
  if (to.getTime() < from.getTime()) {
    return { error: "The retirement date cannot fall before the joining date." };
  }

  let totalMonths =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  let anchor = addMonths(from, totalMonths);
  if (anchor.getTime() > to.getTime()) {
    totalMonths -= 1;
    anchor = addMonths(from, totalMonths);
  }

  const days = Math.round((to.getTime() - anchor.getTime()) / MS_PER_DAY);
  const totalDays = Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    totalDays,
    decimalYears: Math.round((totalDays / DAYS_PER_YEAR) * 100) / 100,
  };
}

/** Long localised date text, formatted in UTC so it never shifts by timezone. */
export function formatLongDate(dateISO, locale = "en-IN") {
  const dt = parseISO(dateISO);
  if (!dt) return { error: "Enter a valid date." };
  let text;
  try {
    text = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(dt);
  } catch {
    text = toISO(dt);
  }
  return { text };
}

/* ------------------------------------------------------------------ *
 * Options
 * ------------------------------------------------------------------ */

export const LANGUAGES = [
  { id: "en", label: "English", locale: "en-IN" },
  { id: "hinglish", label: "Hinglish (Roman)", locale: "en-IN" },
  { id: "hi", label: "हिन्दी", locale: "hi-IN" },
  { id: "mr", label: "मराठी", locale: "mr-IN" },
  { id: "bn", label: "বাংলা", locale: "bn-IN" },
  { id: "ta", label: "தமிழ்", locale: "ta-IN" },
];

export const RELATIONSHIPS = [
  { id: "colleague", label: "Colleague", group: "work" },
  { id: "teammate", label: "Someone on your team", group: "work" },
  { id: "boss", label: "Manager or senior", group: "formal" },
  { id: "teacher", label: "Teacher or mentor", group: "formal" },
  { id: "parent", label: "Parent", group: "personal" },
  { id: "relative", label: "Family elder", group: "personal" },
  { id: "friend", label: "Friend", group: "personal" },
];

export const TONES = [
  { id: "heartfelt", label: "Heartfelt" },
  { id: "formal", label: "Formal" },
  { id: "funny", label: "Light-hearted" },
  { id: "poetic", label: "Poetic" },
];

/* ------------------------------------------------------------------ *
 * Wording banks. {name} {years} are filled at compose time.
 * ------------------------------------------------------------------ */

const PACKS = {
  en: {
    greeting: "Dear {name},",
    openings: [
      "Congratulations on your retirement.",
      "So the last working day is finally here.",
      "Wishing you a very happy retirement.",
    ],
    serviceLine: "{years} years of service is not a number on a file — it is a whole career.",
    tones: {
      heartfelt: [
        "Thank you for everything you taught the people around you.",
        "The place will feel different without you in it.",
      ],
      formal: [
        "Your contribution over the years has been valued by everyone here.",
        "We wish you good health and contentment in the years ahead.",
      ],
      funny: [
        "No more alarms, no more approvals, no more month-end. Enjoy it.",
        "You are now permanently out of office, and no one can mark it urgent.",
      ],
      poetic: [
        "One chapter closes quietly so a slower, kinder one can begin.",
        "The work ends; the respect it earned does not.",
      ],
    },
    closings: {
      work: ["Do stay in touch — the team would love to hear from you.", "Wishing you a wonderful next innings."],
      formal: ["With sincere respect and best wishes for the years ahead.", "Please accept our warmest wishes on your superannuation."],
      personal: ["Now finally take the rest you kept postponing.", "Here is to long mornings and no deadlines."],
    },
    signoff: "- {sender}",
  },

  hinglish: {
    greeting: "Priya {name},",
    openings: [
      "Aapki retirement par hardik badhai.",
      "To aakhirkar aakhri working day aa hi gaya.",
      "Aapko sukhad retirement ki shubhkamnayein.",
    ],
    serviceLine: "{years} saal ki sewa sirf ek number nahi, poora career hai.",
    tones: {
      heartfelt: [
        "Aapne jo sikhaya, uske liye dil se dhanyavaad.",
        "Aapke bina yeh jagah alag lagegi.",
      ],
      formal: [
        "In varshon mein aapka yogdaan sabne saraha hai.",
        "Aage ke varshon ke liye uttam swasthya aur santosh ki kamna.",
      ],
      funny: [
        "Ab na alarm, na approval, na month-end. Bilkul enjoy kijiye.",
        "Aap ab permanently out of office hain, aur koi ise urgent nahi mark kar sakta.",
      ],
      poetic: [
        "Ek adhyay chupchap band hota hai taaki ek shaant adhyay shuru ho sake.",
        "Kaam khatam hota hai; uska samman nahi.",
      ],
    },
    closings: {
      work: ["Sampark mein rahiyega — team ko achha lagega.", "Aapki agli innings shandaar ho."],
      formal: ["Sadar samman ke saath, aane wale varshon ke liye shubhkamnayein.", "Aapki sewanivrutti par hamari hardik shubhkamnayein sweekar karein."],
      personal: ["Ab woh aaram kijiye jo aap hamesha taalte rahe.", "Lambi subhein aur koi deadline nahi — cheers!"],
    },
    signoff: "- {sender}",
  },

  hi: {
    greeting: "प्रिय {name},",
    openings: [
      "आपकी सेवानिवृत्ति पर हार्दिक बधाई।",
      "तो आख़िरकार अंतिम कार्यदिवस आ ही गया।",
      "आपको सुखद सेवानिवृत्ति की शुभकामनाएँ।",
    ],
    serviceLine: "{years} वर्ष की सेवा केवल एक संख्या नहीं, एक पूरा करियर है।",
    tones: {
      heartfelt: [
        "आपने जो सिखाया, उसके लिए हृदय से धन्यवाद।",
        "आपके बिना यह जगह अलग लगेगी।",
      ],
      formal: [
        "इन वर्षों में आपका योगदान सभी ने सराहा है।",
        "आगामी वर्षों के लिए उत्तम स्वास्थ्य और संतोष की कामना।",
      ],
      funny: [
        "अब न अलार्म, न अप्रूवल, न महीने का अंत। खुलकर आनंद लीजिए।",
        "आप अब स्थायी रूप से आउट ऑफ़ ऑफ़िस हैं, और कोई इसे अर्जेंट नहीं कर सकता।",
      ],
      poetic: [
        "एक अध्याय चुपचाप बंद होता है ताकि एक शांत अध्याय शुरू हो सके।",
        "काम समाप्त होता है; उससे अर्जित सम्मान नहीं।",
      ],
    },
    closings: {
      work: ["संपर्क में रहिएगा — टीम को अच्छा लगेगा।", "आपकी अगली पारी शानदार हो।"],
      formal: ["सादर सम्मान सहित, आगामी वर्षों के लिए शुभकामनाएँ।", "आपकी सेवानिवृत्ति पर हमारी हार्दिक शुभकामनाएँ स्वीकार करें।"],
      personal: ["अब वह आराम कीजिए जिसे आप सदा टालते रहे।", "लंबी सुबहें और कोई समय-सीमा नहीं — यही कामना है।"],
    },
    signoff: "- {sender}",
  },

  mr: {
    greeting: "प्रिय {name},",
    openings: [
      "आपल्या सेवानिवृत्तीबद्दल हार्दिक अभिनंदन.",
      "अखेर शेवटचा कामाचा दिवस आलाच.",
      "आपल्याला सुखद सेवानिवृत्तीच्या शुभेच्छा.",
    ],
    serviceLine: "{years} वर्षांची सेवा हा फक्त आकडा नाही, संपूर्ण कारकीर्द आहे.",
    tones: {
      heartfelt: [
        "तुम्ही जे शिकवले त्याबद्दल मनापासून आभार.",
        "तुमच्याशिवाय ही जागा वेगळी वाटेल.",
      ],
      formal: [
        "या वर्षांतील तुमचे योगदान सर्वांनी नोंदवले आहे.",
        "पुढील वर्षांसाठी उत्तम आरोग्य आणि समाधानाच्या शुभेच्छा.",
      ],
      funny: [
        "आता ना गजर, ना मंजुरी, ना महिनाअखेर. मनसोक्त आनंद घ्या.",
        "तुम्ही आता कायमचे आउट ऑफ ऑफिस आहात, आणि कोणी ते अर्जंट करू शकत नाही.",
      ],
      poetic: [
        "एक अध्याय शांतपणे संपतो, म्हणून दुसरा निवांत अध्याय सुरू होतो.",
        "काम संपते; त्यातून मिळालेला आदर संपत नाही.",
      ],
    },
    closings: {
      work: ["संपर्कात राहा — टीमला आनंद होईल.", "तुमची पुढील इनिंग दमदार होवो."],
      formal: ["सादर आदरपूर्वक, पुढील वर्षांसाठी शुभेच्छा.", "आपल्या सेवानिवृत्तीनिमित्त आमच्या हार्दिक शुभेच्छा स्वीकाराव्यात."],
      personal: ["आता तो आराम करा जो तुम्ही नेहमी पुढे ढकलत होतात.", "निवांत सकाळ आणि कोणतीही डेडलाइन नाही — हीच शुभेच्छा."],
    },
    signoff: "- {sender}",
  },

  bn: {
    greeting: "প্রিয় {name},",
    openings: [
      "আপনার অবসরগ্রহণে আন্তরিক অভিনন্দন।",
      "শেষ পর্যন্ত শেষ কর্মদিবসটি এসেই গেল।",
      "আপনাকে সুখী অবসরজীবনের শুভেচ্ছা।",
    ],
    serviceLine: "{years} বছরের চাকরি নিছক একটি সংখ্যা নয়, একটি গোটা কর্মজীবন।",
    tones: {
      heartfelt: [
        "আপনি যা শিখিয়েছেন, তার জন্য অন্তর থেকে ধন্যবাদ।",
        "আপনাকে ছাড়া জায়গাটা অন্যরকম লাগবে।",
      ],
      formal: [
        "এই বছরগুলিতে আপনার অবদান সকলেই স্বীকার করেন।",
        "আগামী দিনের জন্য সুস্বাস্থ্য ও প্রশান্তি কামনা করি।",
      ],
      funny: [
        "আর অ্যালার্ম নেই, অনুমোদন নেই, মাসের শেষ নেই। উপভোগ করুন।",
        "আপনি এখন স্থায়ীভাবে আউট অফ অফিস, কেউ একে আর্জেন্ট করতে পারবে না।",
      ],
      poetic: [
        "একটি অধ্যায় নিঃশব্দে শেষ হয়, যাতে একটি শান্ত অধ্যায় শুরু হতে পারে।",
        "কাজ শেষ হয়; তা থেকে অর্জিত সম্মান শেষ হয় না।",
      ],
    },
    closings: {
      work: ["যোগাযোগ রাখবেন — টিম খুশি হবে।", "আপনার পরবর্তী ইনিংস দুর্দান্ত হোক।"],
      formal: ["সশ্রদ্ধ সম্মানসহ, আগামী দিনের জন্য শুভেচ্ছা।", "আপনার অবসরগ্রহণে আমাদের আন্তরিক শুভেচ্ছা গ্রহণ করুন।"],
      personal: ["এবার সেই বিশ্রামটা নিন যা বরাবর পিছিয়ে দিয়েছেন।", "লম্বা সকাল আর কোনো ডেডলাইন নয় — এটাই কামনা।"],
    },
    signoff: "- {sender}",
  },

  ta: {
    greeting: "அன்புள்ள {name},",
    openings: [
      "உங்கள் ஓய்வுபெறுதலுக்கு மனமார்ந்த வாழ்த்துக்கள்.",
      "இறுதியாக கடைசி வேலை நாள் வந்துவிட்டது.",
      "இனிய ஓய்வுகால வாழ்வுக்கு வாழ்த்துக்கள்.",
    ],
    serviceLine: "{years} ஆண்டு பணி என்பது வெறும் எண் அல்ல, ஒரு முழு பணிவாழ்க்கை.",
    tones: {
      heartfelt: [
        "நீங்கள் கற்றுத் தந்த அனைத்திற்கும் மனமார்ந்த நன்றி.",
        "நீங்கள் இல்லாமல் இந்த இடம் வேறு மாதிரி இருக்கும்.",
      ],
      formal: [
        "இந்த ஆண்டுகளில் உங்கள் பங்களிப்பை அனைவரும் பாராட்டுகிறார்கள்.",
        "வரும் ஆண்டுகளில் நல்ல ஆரோக்கியமும் நிறைவும் அமையட்டும்.",
      ],
      funny: [
        "இனி அலாரம் இல்லை, ஒப்புதல் இல்லை, மாத இறுதி இல்லை. நன்றாக அனுபவியுங்கள்.",
        "நீங்கள் இப்போது நிரந்தரமாக அவுட் ஆஃப் ஆஃபீஸ், யாரும் அதை அவசரம் என்று குறிக்க முடியாது.",
      ],
      poetic: [
        "ஒரு அத்தியாயம் அமைதியாக முடிகிறது, மற்றொரு நிதானமான அத்தியாயம் தொடங்க.",
        "வேலை முடிகிறது; அது ஈட்டிய மரியாதை முடிவதில்லை.",
      ],
    },
    closings: {
      work: ["தொடர்பில் இருங்கள் — குழுவுக்கு மகிழ்ச்சியாக இருக்கும்.", "உங்கள் அடுத்த இன்னிங்ஸ் சிறப்பாக அமையட்டும்."],
      formal: ["மரியாதையுடன், வரும் ஆண்டுகளுக்கு வாழ்த்துக்கள்.", "உங்கள் ஓய்வுபெறுதலுக்கு எங்கள் மனமார்ந்த வாழ்த்துகளை ஏற்றுக் கொள்ளுங்கள்."],
      personal: ["எப்போதும் தள்ளிப்போட்ட ஓய்வை இப்போது எடுத்துக் கொள்ளுங்கள்.", "நீண்ட காலைப்பொழுதுகள், காலக்கெடு இல்லை — அதுவே வாழ்த்து."],
    },
    signoff: "- {sender}",
  },
};

/* ------------------------------------------------------------------ *
 * Compose
 * ------------------------------------------------------------------ */

/** mulberry32 — deterministic 32-bit PRNG. */
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

function rotate(list, offset, step) {
  if (!Array.isArray(list) || list.length === 0) return "";
  return list[(offset + step) % list.length];
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

function fill(template, tokens) {
  return String(template).replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : whole,
  );
}

/**
 * Build retirement message drafts.
 *
 * @returns {{variants:Array<{id:number,text:string,chars:number,words:number}>,
 *            service:object|null, retirementDateText:string|null}|{error:string}}
 */
export function buildRetirementWishes({
  name = "",
  relationship = "colleague",
  tone = "heartfelt",
  language = "en",
  joiningISO = "",
  retirementISO = "",
  sender = "",
  seed = 1,
  count = 3,
} = {}) {
  const pack = PACKS[language] ?? PACKS.en;
  const localeEntry = LANGUAGES.find((item) => item.id === language) ?? LANGUAGES[0];
  const relEntry = RELATIONSHIPS.find((item) => item.id === relationship) ?? RELATIONSHIPS[0];
  const toneId = TONES.some((item) => item.id === tone) ? tone : "heartfelt";

  const person = clean(name);
  if (!person) return { error: "Add the name of the person retiring." };

  let service = null;
  if (joiningISO && retirementISO) {
    const span = serviceLength(joiningISO, retirementISO);
    if (span.error) return { error: span.error };
    service = span;
  }

  let retirementDateText = null;
  if (retirementISO) {
    const formatted = formatLongDate(retirementISO, localeEntry.locale);
    if (formatted.error) return { error: "Enter a valid retirement date." };
    retirementDateText = formatted.text;
  }

  const senderName = clean(sender);
  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const openOffset = Math.floor(rng() * 997);
  const toneOffset = Math.floor(rng() * 997);
  const closeOffset = Math.floor(rng() * 997);

  const tokens = { name: person, sender: senderName, years: service ? String(service.years) : "" };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const parts = [fill(pack.greeting, tokens), rotate(pack.openings, openOffset, step)];
    if (service && service.years > 0) parts.push(fill(pack.serviceLine, tokens));
    parts.push(rotate(pack.tones[toneId], toneOffset, step));
    parts.push(rotate(pack.closings[relEntry.group], closeOffset, step));
    if (senderName) parts.push(fill(pack.signoff, tokens));

    const text = parts.join("\n");
    const trimmed = text.trim();
    variants.push({
      id: step + 1,
      text,
      chars: [...text].length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
    });
  }

  return {
    variants,
    service,
    retirementDateText,
    relationship: relEntry.label,
    tone: toneId,
  };
}
