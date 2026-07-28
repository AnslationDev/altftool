/**
 * Prayer meet / memorial invitation wording composer.
 *
 * Two jobs:
 *  1. Work out which calendar day an observance falls on, counting the way the
 *     tradition counts (day of passing = day one in most Indian customs).
 *  2. Compose the invitation text in the chosen language and tone.
 *
 * Pure: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

/** Six drafts is already more than a grieving family wants to read. */
export const MAX_VARIANTS = 6;
export const MAX_NAME_LENGTH = 80;
export const MAX_VENUE_LENGTH = 160;

/* ------------------------------------------------------------------ *
 * Observances
 *
 * `dayNumber` is the ordinal the tradition uses, counting the day of
 * passing as day 1. `offsetDays` is therefore dayNumber - 1, except for
 * anniversaries which are counted in years.
 * ------------------------------------------------------------------ */

export const OCCASIONS = [
  {
    id: "prayer-meet",
    label: "Prayer Meet (Shok Sabha)",
    dayNumber: null,
    yearOffset: 0,
    note: "Held on a day that suits the family, often within the first two weeks.",
  },
  {
    id: "soyem",
    label: "Soyem / Teeja (3rd day)",
    dayNumber: 3,
    yearOffset: 0,
    note: "Third day, counting the day of passing as the first.",
  },
  {
    id: "uthala",
    label: "Uthala / Rasam Pagri (4th day)",
    dayNumber: 4,
    yearOffset: 0,
    note: "North Indian fourth-day gathering; the turban is tied on the eldest son.",
  },
  {
    id: "chautha",
    label: "Chautha (4th day)",
    dayNumber: 4,
    yearOffset: 0,
    note: "Fourth-day prayer gathering.",
  },
  {
    id: "antim-ardas",
    label: "Antim Ardas / Sahaj Path Bhog",
    dayNumber: 11,
    yearOffset: 0,
    note: "Sikh families usually complete the Sahaj Path around the tenth or eleventh day.",
  },
  {
    id: "tehravin",
    label: "Tehravin (13th day)",
    dayNumber: 13,
    yearOffset: 0,
    note: "Thirteenth day, the close of the main mourning period in many Hindu families.",
  },
  {
    id: "chehlum",
    label: "Chehlum / Chaliswan (40th day)",
    dayNumber: 40,
    yearOffset: 0,
    note: "Fortieth day, observed by many Muslim families.",
  },
  {
    id: "memorial-service",
    label: "Memorial Service",
    dayNumber: null,
    yearOffset: 0,
    note: "Church or hall service arranged on a date convenient to the family.",
  },
  {
    id: "uthamna",
    label: "Uthamna (4th day)",
    dayNumber: 4,
    yearOffset: 0,
    note: "Parsi fourth-day ceremony.",
  },
  {
    id: "barsi",
    label: "Barsi / First Death Anniversary",
    dayNumber: null,
    yearOffset: 1,
    note: "First anniversary of the date of passing.",
  },
];

export const TONES = [
  { id: "solemn", label: "Solemn" },
  { id: "traditional", label: "Traditional" },
  { id: "brief", label: "Brief notice" },
];

export const LANGUAGES = [
  { id: "en", label: "English", locale: "en-IN" },
  { id: "hinglish", label: "Hinglish (Roman)", locale: "en-IN" },
  { id: "hi", label: "हिन्दी", locale: "hi-IN" },
  { id: "mr", label: "मराठी", locale: "mr-IN" },
  { id: "gu", label: "ગુજરાતી", locale: "gu-IN" },
];

export const HONORIFICS = [
  { id: "late", label: "Late" },
  { id: "shri", label: "Late Shri" },
  { id: "smt", label: "Late Smt." },
  { id: "sardar", label: "Late Sardar" },
  { id: "marhoom", label: "Marhoom" },
  { id: "none", label: "(no honorific)" },
];

/* ------------------------------------------------------------------ *
 * Date maths
 * ------------------------------------------------------------------ */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK = /^(\d{1,2}):(\d{2})$/;
const MS_PER_DAY = 86400000;

function parseISO(value) {
  const match = ISO_DATE.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const dt = new Date(stamp);
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

/**
 * Which calendar date does an observance fall on?
 *
 * Indian custom counts the day of passing as day one, so the Nth-day
 * observance lands on passing + (N - 1) days. Anniversaries add whole years.
 *
 * @returns {{iso:string,dayNumber:number|null,offsetDays:number|null}|{error:string}}
 */
export function observanceDate(passingISO, occasionId) {
  const occasion = OCCASIONS.find((item) => item.id === occasionId);
  if (!occasion) return { error: "Pick an observance." };
  const start = parseISO(passingISO);
  if (!start) return { error: "Enter a valid date of passing." };

  if (occasion.yearOffset > 0) {
    const year = start.getUTCFullYear() + occasion.yearOffset;
    const month = start.getUTCMonth();
    // 29 February has no counterpart in a common year — clamp to the last day
    // of the same month rather than rolling into the next one.
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const day = Math.min(start.getUTCDate(), lastDayOfMonth);
    const target = new Date(Date.UTC(year, month, day));
    return { iso: toISO(target), dayNumber: null, offsetDays: null };
  }

  if (occasion.dayNumber == null) {
    return { iso: toISO(start), dayNumber: null, offsetDays: 0 };
  }

  const offsetDays = occasion.dayNumber - 1;
  const target = new Date(start.getTime() + offsetDays * MS_PER_DAY);
  return { iso: toISO(target), dayNumber: occasion.dayNumber, offsetDays };
}

/** Whole days from one ISO date to another (b - a). */
export function daysBetween(aISO, bISO) {
  const a = parseISO(aISO);
  const b = parseISO(bISO);
  if (!a || !b) return { error: "Both dates must be valid." };
  return { days: Math.round((b.getTime() - a.getTime()) / MS_PER_DAY) };
}

/** Long localised date text, formatted in UTC so it never shifts by timezone. */
export function formatLongDate(dateISO, locale = "en-IN") {
  const dt = parseISO(dateISO);
  if (!dt) return { error: "Enter a valid date." };
  let text;
  try {
    text = new Intl.DateTimeFormat(locale, {
      weekday: "long",
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

/** 24-hour HH:MM to 12-hour clock text. */
export function formatClock(raw) {
  const match = CLOCK.exec(String(raw ?? "").trim());
  if (!match) return { error: "Enter the time as HH:MM." };
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return { error: "Enter a real clock time (00:00 to 23:59)." };
  const suffix = hours < 12 ? "AM" : "PM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return { text: `${h12}:${String(minutes).padStart(2, "0")} ${suffix}` };
}

/* ------------------------------------------------------------------ *
 * Wording banks
 * ------------------------------------------------------------------ */

const PACKS = {
  en: {
    labels: {
      date: "Date",
      time: "Time",
      venue: "Venue",
      contact: "Contact",
      passedOn: "Passed away on",
      family: "The bereaved family",
    },
    openers: {
      solemn: [
        "With profound sorrow we inform you of the passing of {name}.",
        "It is with a heavy heart that we share the news of {name}'s passing.",
        "We are deeply saddened to inform you that {name} is no more.",
      ],
      traditional: [
        "With deep grief we inform you that {name} left for the heavenly abode.",
        "It is our sad duty to inform you of the sad demise of {name}.",
        "With sorrow we announce the sad demise of {name}.",
      ],
      brief: [
        "{name} passed away peacefully.",
        "We regret to inform you of the demise of {name}.",
        "{name} is no more.",
      ],
    },
    bodies: {
      solemn: [
        "The {occasion} will be held as follows. Your presence would be a comfort to the family.",
        "We invite you to join us for the {occasion} to remember and pray for the departed soul.",
        "The family requests the honour of your presence at the {occasion}.",
      ],
      traditional: [
        "The {occasion} will be observed as detailed below. Kindly join the family in prayer.",
        "You are requested to attend the {occasion} and offer your prayers for the departed soul.",
        "The {occasion} will take place as follows; the family seeks your prayers.",
      ],
      brief: [
        "{occasion} details are below.",
        "The {occasion} will be held as follows.",
        "Please note the {occasion} details.",
      ],
    },
    closings: {
      solemn: "Your prayers and presence mean a great deal to us.",
      traditional: "Kindly treat this as a personal invitation.",
      brief: "Kindly treat this as a personal intimation.",
    },
  },

  hinglish: {
    labels: {
      date: "Din",
      time: "Samay",
      venue: "Sthan",
      contact: "Sampark",
      passedOn: "Nidhan",
      family: "Shokakul parivaar",
    },
    openers: {
      solemn: [
        "Atyant dukh ke saath suchit karte hain ki {name} ka nidhan ho gaya hai.",
        "Bhaari man se soochna de rahe hain ki {name} humare beech nahi rahe.",
        "Gehre shok ke saath suchit karte hain ki {name} nahi rahe.",
      ],
      traditional: [
        "Atyant dukh ke saath suchit karte hain ki {name} swargwas ho gaye.",
        "Dukhad soochna hai ki {name} ka dehant ho gaya hai.",
        "Shok ke saath {name} ke dehavsan ki soochna de rahe hain.",
      ],
      brief: [
        "{name} ka nidhan ho gaya hai.",
        "Dukh ke saath soochit kiya jaata hai ki {name} nahi rahe.",
        "{name} humare beech nahi rahe.",
      ],
    },
    bodies: {
      solemn: [
        "{occasion} nimn anusaar rakha gaya hai. Aapki upasthiti parivaar ke liye sambal hogi.",
        "Divangat aatma ki shanti hetu {occasion} mein shaamil hone ki prarthna hai.",
        "Parivaar aapse {occasion} mein upasthit hone ki vinamra prarthna karta hai.",
      ],
      traditional: [
        "{occasion} nimn vivaran ke anusaar rakha gaya hai. Kripya prarthna mein shaamil hon.",
        "Divangat aatma ki shanti ke liye {occasion} mein padharne ka kasht karein.",
        "{occasion} nimn anusaar hoga; parivaar aapki prarthnaon ka abhilashi hai.",
      ],
      brief: [
        "{occasion} ka vivaran neeche diya gaya hai.",
        "{occasion} nimn anusaar rakha gaya hai.",
        "Kripya {occasion} ka vivaran dekhein.",
      ],
    },
    closings: {
      solemn: "Aapki prarthna aur upasthiti hamare liye bahut maayne rakhti hai.",
      traditional: "Kripya ise vyaktigat nimantran samjhein.",
      brief: "Kripya ise vyaktigat soochna samjhein.",
    },
  },

  hi: {
    labels: {
      date: "दिनांक",
      time: "समय",
      venue: "स्थान",
      contact: "संपर्क",
      passedOn: "निधन",
      family: "शोकाकुल परिवार",
    },
    openers: {
      solemn: [
        "अत्यंत दुःख के साथ सूचित करते हैं कि {name} का निधन हो गया है।",
        "भारी मन से सूचना दे रहे हैं कि {name} हमारे बीच नहीं रहे।",
        "गहरे शोक के साथ सूचित करते हैं कि {name} नहीं रहे।",
      ],
      traditional: [
        "अत्यंत दुःख के साथ सूचित करते हैं कि {name} स्वर्गवासी हो गए।",
        "दुःखद सूचना है कि {name} का देहांत हो गया है।",
        "शोक के साथ {name} के देहावसान की सूचना दे रहे हैं।",
      ],
      brief: [
        "{name} का निधन हो गया है।",
        "दुःख के साथ सूचित किया जाता है कि {name} नहीं रहे।",
        "{name} हमारे बीच नहीं रहे।",
      ],
    },
    bodies: {
      solemn: [
        "{occasion} निम्नानुसार रखा गया है। आपकी उपस्थिति परिवार के लिए संबल होगी।",
        "दिवंगत आत्मा की शांति हेतु {occasion} में सम्मिलित होने की प्रार्थना है।",
        "परिवार आपसे {occasion} में उपस्थित होने की विनम्र प्रार्थना करता है।",
      ],
      traditional: [
        "{occasion} निम्न विवरण के अनुसार रखा गया है। कृपया प्रार्थना में सम्मिलित हों।",
        "दिवंगत आत्मा की शांति के लिए {occasion} में पधारने का कष्ट करें।",
        "{occasion} निम्नानुसार होगा; परिवार आपकी प्रार्थनाओं का अभिलाषी है।",
      ],
      brief: [
        "{occasion} का विवरण नीचे दिया गया है।",
        "{occasion} निम्नानुसार रखा गया है।",
        "कृपया {occasion} का विवरण देखें।",
      ],
    },
    closings: {
      solemn: "आपकी प्रार्थना और उपस्थिति हमारे लिए बहुत मायने रखती है।",
      traditional: "कृपया इसे व्यक्तिगत निमंत्रण समझें।",
      brief: "कृपया इसे व्यक्तिगत सूचना समझें।",
    },
  },

  mr: {
    labels: {
      date: "दिनांक",
      time: "वेळ",
      venue: "ठिकाण",
      contact: "संपर्क",
      passedOn: "निधन",
      family: "शोकाकुल परिवार",
    },
    openers: {
      solemn: [
        "अत्यंत दुःखाने कळवीत आहोत की {name} यांचे निधन झाले आहे.",
        "जड अंतःकरणाने कळवीत आहोत की {name} आपल्यात राहिले नाहीत.",
        "खोल शोकाने कळवीत आहोत की {name} यांचे देहावसान झाले.",
      ],
      traditional: [
        "अत्यंत दुःखाने कळवीत आहोत की {name} अनंतात विलीन झाले.",
        "दुःखद वार्ता आहे की {name} यांचे निधन झाले आहे.",
        "शोकाने {name} यांच्या देहावसानाची वार्ता कळवीत आहोत.",
      ],
      brief: [
        "{name} यांचे निधन झाले आहे.",
        "दुःखाने कळवीत आहोत की {name} राहिले नाहीत.",
        "{name} आपल्यात राहिले नाहीत.",
      ],
    },
    bodies: {
      solemn: [
        "{occasion} पुढीलप्रमाणे ठेवला आहे. आपली उपस्थिती कुटुंबाला आधार देईल.",
        "दिवंगत आत्म्याच्या शांतीसाठी {occasion} मध्ये सहभागी होण्याची विनंती.",
        "कुटुंब आपणास {occasion} प्रसंगी उपस्थित राहण्याची नम्र विनंती करते.",
      ],
      traditional: [
        "{occasion} पुढील तपशिलानुसार ठेवला आहे. कृपया प्रार्थनेत सहभागी व्हा.",
        "दिवंगत आत्म्याच्या शांतीसाठी {occasion} ला उपस्थित राहावे.",
        "{occasion} पुढीलप्रमाणे होईल; कुटुंब आपल्या प्रार्थनांची अपेक्षा करते.",
      ],
      brief: [
        "{occasion} चा तपशील खाली दिला आहे.",
        "{occasion} पुढीलप्रमाणे ठेवला आहे.",
        "कृपया {occasion} चा तपशील पहा.",
      ],
    },
    closings: {
      solemn: "आपली प्रार्थना आणि उपस्थिती आमच्यासाठी खूप मोलाची आहे.",
      traditional: "कृपया हे वैयक्तिक निमंत्रण समजावे.",
      brief: "कृपया ही वैयक्तिक सूचना समजावी.",
    },
  },

  gu: {
    labels: {
      date: "તારીખ",
      time: "સમય",
      venue: "સ્થળ",
      contact: "સંપર્ક",
      passedOn: "અવસાન",
      family: "શોકગ્રસ્ત પરિવાર",
    },
    openers: {
      solemn: [
        "અત્યંત દુઃખ સાથે જણાવીએ છીએ કે {name}નું અવસાન થયું છે.",
        "ભારે હૃદયે જણાવીએ છીએ કે {name} આપણી વચ્ચે રહ્યા નથી.",
        "ઊંડા શોક સાથે જણાવીએ છીએ કે {name}નું દેહાવસાન થયું છે.",
      ],
      traditional: [
        "અત્યંત દુઃખ સાથે જણાવીએ છીએ કે {name} સ્વર્ગવાસી થયા છે.",
        "દુઃખદ સમાચાર છે કે {name}નું અવસાન થયું છે.",
        "શોક સાથે {name}ના દેહાવસાનની જાણ કરીએ છીએ.",
      ],
      brief: [
        "{name}નું અવસાન થયું છે.",
        "દુઃખ સાથે જણાવીએ છીએ કે {name} રહ્યા નથી.",
        "{name} આપણી વચ્ચે રહ્યા નથી.",
      ],
    },
    bodies: {
      solemn: [
        "{occasion} નીચે મુજબ રાખવામાં આવ્યો છે. આપની ઉપસ્થિતિ પરિવારને આધાર આપશે.",
        "દિવંગત આત્માની શાંતિ અર્થે {occasion}માં જોડાવા વિનંતી.",
        "પરિવાર આપને {occasion} પ્રસંગે ઉપસ્થિત રહેવા નમ્ર વિનંતી કરે છે.",
      ],
      traditional: [
        "{occasion} નીચેની વિગત મુજબ રાખવામાં આવ્યો છે. કૃપા કરી પ્રાર્થનામાં જોડાવ.",
        "દિવંગત આત્માની શાંતિ માટે {occasion}માં પધારવા વિનંતી.",
        "{occasion} નીચે મુજબ યોજાશે; પરિવાર આપની પ્રાર્થનાની અપેક્ષા રાખે છે.",
      ],
      brief: [
        "{occasion}ની વિગત નીચે આપી છે.",
        "{occasion} નીચે મુજબ રાખવામાં આવ્યો છે.",
        "કૃપા કરી {occasion}ની વિગત જુઓ.",
      ],
    },
    closings: {
      solemn: "આપની પ્રાર્થના અને ઉપસ્થિતિ અમારા માટે ખૂબ મૂલ્યવાન છે.",
      traditional: "કૃપા કરી આને વ્યક્તિગત આમંત્રણ ગણશો.",
      brief: "કૃપા કરી આને વ્યક્તિગત જાણ ગણશો.",
    },
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

function clean(value, limit) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function fill(template, tokens) {
  return String(template).replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : whole,
  );
}

/** The honorific written before the name, in each supported language. */
const HONORIFIC_BY_LANG = {
  en: {
    late: "Late",
    shri: "Late Shri",
    smt: "Late Smt.",
    sardar: "Late Sardar",
    marhoom: "Marhoom",
    none: "",
  },
  hinglish: {
    late: "Swargiya",
    shri: "Swargiya Shri",
    smt: "Swargiya Smt.",
    sardar: "Swargiya Sardar",
    marhoom: "Marhoom",
    none: "",
  },
  hi: {
    late: "स्वर्गीय",
    shri: "स्वर्गीय श्री",
    smt: "स्वर्गीया श्रीमती",
    sardar: "स्वर्गीय सरदार",
    marhoom: "मरहूम",
    none: "",
  },
  mr: {
    late: "कै.",
    shri: "कै. श्री",
    smt: "कै. सौ.",
    sardar: "कै. सरदार",
    marhoom: "मरहूम",
    none: "",
  },
  gu: {
    late: "સ્વ.",
    shri: "સ્વ. શ્રી",
    smt: "સ્વ. શ્રીમતી",
    sardar: "સ્વ. સરદાર",
    marhoom: "મરહૂમ",
    none: "",
  },
};

/** The name each observance goes by in the language of the invitation. */
const OCCASION_BY_LANG = {
  en: {
    "prayer-meet": "Prayer Meet",
    soyem: "Soyem (third day)",
    uthala: "Uthala",
    chautha: "Chautha",
    "antim-ardas": "Antim Ardas",
    tehravin: "Tehravin (thirteenth day)",
    chehlum: "Chehlum (fortieth day)",
    "memorial-service": "Memorial Service",
    uthamna: "Uthamna",
    barsi: "first death anniversary",
  },
  hinglish: {
    "prayer-meet": "Shok Sabha",
    soyem: "Soyem / Teeja",
    uthala: "Uthala / Rasam Pagri",
    chautha: "Chautha",
    "antim-ardas": "Antim Ardas",
    tehravin: "Tehravin",
    chehlum: "Chehlum / Chaliswan",
    "memorial-service": "Smriti Sabha",
    uthamna: "Uthamna",
    barsi: "Barsi",
  },
  hi: {
    "prayer-meet": "शोक सभा",
    soyem: "सोयम / तीजा",
    uthala: "उठाला / रस्म पगड़ी",
    chautha: "चौथा",
    "antim-ardas": "अंतिम अरदास",
    tehravin: "तेरहवीं",
    chehlum: "चेहलुम / चालीसवाँ",
    "memorial-service": "स्मृति सभा",
    uthamna: "उथमना",
    barsi: "बरसी",
  },
  mr: {
    "prayer-meet": "शोक सभा",
    soyem: "तिसरा दिवस",
    uthala: "उठावणे",
    chautha: "चौथा",
    "antim-ardas": "अंतिम अरदास",
    tehravin: "तेरावे",
    chehlum: "चाळिसावा",
    "memorial-service": "स्मृती सभा",
    uthamna: "उथमना",
    barsi: "प्रथम पुण्यतिथी",
  },
  gu: {
    "prayer-meet": "શોક સભા",
    soyem: "ત્રીજો દિવસ",
    uthala: "ઉઠમણું",
    chautha: "ચોથું",
    "antim-ardas": "અંતિમ અરદાસ",
    tehravin: "તેરમું",
    chehlum: "ચાળીસમું",
    "memorial-service": "સ્મૃતિ સભા",
    uthamna: "ઉથમણું",
    barsi: "પ્રથમ પુણ્યતિથિ",
  },
};

/**
 * Build the invitation drafts.
 *
 * @returns {{variants:Array<{id:number,text:string,chars:number,words:number}>,
 *            fullName:string, occasion:string, eventDateText:string,
 *            eventTimeText:string, dayNumber:number|null,
 *            daysFromPassing:number|null}|{error:string}}
 */
export function buildPrayerMeetInvitations({
  deceasedName = "",
  honorific = "shri",
  occasion = "prayer-meet",
  tone = "solemn",
  language = "en",
  passingISO = "",
  eventISO = "",
  time = "",
  venue = "",
  familyName = "",
  contact = "",
  seed = 1,
  count = 3,
} = {}) {
  const pack = PACKS[language] ?? PACKS.en;
  const localeEntry = LANGUAGES.find((item) => item.id === language) ?? LANGUAGES[0];
  const occasionEntry = OCCASIONS.find((item) => item.id === occasion) ?? OCCASIONS[0];
  const toneId = TONES.some((item) => item.id === tone) ? tone : "solemn";

  const name = clean(deceasedName, MAX_NAME_LENGTH);
  if (!name) return { error: "Add the name of the person who has passed away." };

  const honorificPack = HONORIFIC_BY_LANG[language] ?? HONORIFIC_BY_LANG.en;
  const occasionPack = OCCASION_BY_LANG[language] ?? OCCASION_BY_LANG.en;
  const occasionName = occasionPack[occasionEntry.id] ?? occasionEntry.label;
  const prefix = honorificPack[honorific] ?? "";
  const fullName = prefix ? `${prefix} ${name}` : name;

  const venueText = clean(venue, MAX_VENUE_LENGTH);
  if (!venueText) return { error: "Add the venue so people know where to come." };

  const passingResult = passingISO ? formatLongDate(passingISO, localeEntry.locale) : null;
  if (passingResult && passingResult.error) return { error: passingResult.error };

  const eventResult = formatLongDate(eventISO, localeEntry.locale);
  if (eventResult.error) return { error: "Enter a valid date for the gathering." };

  const timeResult = formatClock(time);
  if (timeResult.error) return { error: timeResult.error };

  let daysFromPassing = null;
  if (passingISO) {
    const gap = daysBetween(passingISO, eventISO);
    if (!gap.error) daysFromPassing = gap.days;
    if (daysFromPassing != null && daysFromPassing < 0) {
      return { error: "The gathering cannot be dated before the date of passing." };
    }
  }

  const familyText = clean(familyName, MAX_NAME_LENGTH);
  const contactText = clean(contact, MAX_NAME_LENGTH);

  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const openOffset = Math.floor(rng() * 997);
  const bodyOffset = Math.floor(rng() * 997);

  const tokens = { name: fullName, occasion: occasionName };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const lines = [
      fill(rotate(pack.openers[toneId], openOffset, step), tokens),
    ];
    if (passingResult) lines.push(`${pack.labels.passedOn}: ${passingResult.text}`);
    lines.push("", fill(rotate(pack.bodies[toneId], bodyOffset, step), tokens), "");
    lines.push(`${pack.labels.date}: ${eventResult.text}`);
    lines.push(`${pack.labels.time}: ${timeResult.text}`);
    lines.push(`${pack.labels.venue}: ${venueText}`);
    if (contactText) lines.push(`${pack.labels.contact}: ${contactText}`);
    lines.push("", pack.closings[toneId]);
    if (familyText) lines.push(`${pack.labels.family}: ${familyText}`);

    const text = lines.join("\n");
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
    fullName,
    occasion: occasionName,
    occasionLabel: occasionEntry.label,
    occasionNote: occasionEntry.note,
    eventDateText: eventResult.text,
    eventTimeText: timeResult.text,
    dayNumber: occasionEntry.dayNumber,
    daysFromPassing,
  };
}
