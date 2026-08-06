/**
 * Exam best-wishes composer plus a small revision-time budget.
 *
 * Pure: no React, no DOM, no Date.now(). The "message date" is supplied by the
 * caller so the countdown stays a function of its inputs.
 */

export const MAX_VARIANTS = 6;
export const MAX_NAME_LENGTH = 60;

/** Nobody usefully studies more than this in a day; used as an input ceiling. */
export const MAX_STUDY_HOURS_PER_DAY = 16;
/** More than this many papers in one sitting is almost certainly a typo. */
export const MAX_SUBJECTS = 30;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86400000;

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

/** Whole days from one ISO date to another (exam - today). */
export function daysUntil(fromISO, toISOValue) {
  const from = parseISO(fromISO);
  const to = parseISO(toISOValue);
  if (!from || !to) return { error: "Enter both dates in a valid calendar format." };
  return { days: Math.round((to.getTime() - from.getTime()) / MS_PER_DAY) };
}

/**
 * Revision time budget.
 *
 * totalHours = days remaining x study hours per day
 * hoursPerSubject = totalHours / number of subjects
 *
 * Returns an error rather than Infinity when there are no subjects, and
 * treats a past exam date as zero remaining hours rather than a negative.
 */
export function revisionBudget({ daysLeft, hoursPerDay, subjects }) {
  const days = Number(daysLeft);
  const hours = Number(hoursPerDay);
  const papers = Number(subjects);

  if (!Number.isFinite(days)) return { error: "Days left is not a number." };
  if (!Number.isFinite(hours) || hours <= 0) {
    return { error: "Enter how many hours a day you can realistically study." };
  }
  if (hours > MAX_STUDY_HOURS_PER_DAY) {
    return { error: `Study hours per day should be ${MAX_STUDY_HOURS_PER_DAY} or fewer.` };
  }
  if (!Number.isFinite(papers) || papers < 1) {
    return { error: "There has to be at least one subject or paper." };
  }
  if (papers > MAX_SUBJECTS) {
    return { error: `Enter ${MAX_SUBJECTS} subjects or fewer.` };
  }

  const effectiveDays = Math.max(0, days);
  const totalHours = effectiveDays * hours;
  const perSubject = totalHours / papers;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    hoursPerSubject: Math.round(perSubject * 10) / 10,
    minutesPerSubjectPerDay:
      effectiveDays === 0 ? 0 : Math.round((perSubject / effectiveDays) * 60),
    effectiveDays,
  };
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
  { id: "gu", label: "ગુજરાતી", locale: "gu-IN" },
  { id: "ta", label: "தமிழ்", locale: "ta-IN" },
];

export const EXAMS = [
  { id: "board10", label: "Class 10 board exam" },
  { id: "board12", label: "Class 12 board exam" },
  { id: "jee", label: "JEE" },
  { id: "neet", label: "NEET" },
  { id: "upsc", label: "UPSC / State PSC" },
  { id: "cat", label: "CAT / MBA entrance" },
  { id: "semester", label: "University semester exam" },
  { id: "unittest", label: "School unit test" },
  { id: "govt", label: "Government recruitment exam" },
];

export const RELATIONSHIPS = [
  { id: "child", label: "Your child" },
  { id: "sibling", label: "Sibling" },
  { id: "friend", label: "Friend" },
  { id: "student", label: "Your student" },
  { id: "relative", label: "Niece, nephew or cousin" },
];

export const TONES = [
  { id: "motivating", label: "Motivating" },
  { id: "calm", label: "Calming" },
  { id: "blessing", label: "Blessing" },
  { id: "funny", label: "Light-hearted" },
];

/* ------------------------------------------------------------------ *
 * Wording banks. Tokens: {name} {exam} {days}
 * ------------------------------------------------------------------ */

const PACKS = {
  en: {
    greeting: "{name},",
    openings: [
      "All the best for your {exam}.",
      "Wishing you a steady, calm {exam}.",
      "Good luck for the {exam} — you have put in the work.",
    ],
    countdown: "{days} days to go. That is still plenty if you use it properly.",
    dayOf: "It is today. Read the paper twice, then start with what you know.",
    tones: {
      motivating: [
        "You do not need luck as much as you need your own notes and a clear head.",
        "Every hour you already put in is sitting there waiting to be used.",
      ],
      calm: [
        "Sleep properly the night before; a rested brain beats one more revision.",
        "Nerves are normal. They settle about ten minutes into the paper.",
      ],
      blessing: [
        "May you write with a calm mind and a steady hand.",
        "May your effort be rewarded exactly as it deserves.",
      ],
      funny: [
        "Remember to write your roll number. Genuinely, people forget.",
        "The paper is scared of you, not the other way around.",
      ],
    },
    closings: [
      "Go get it.",
      "Rooting for you.",
      "Whatever the result, the effort already counts.",
    ],
    signoff: "- {sender}",
  },

  hinglish: {
    greeting: "{name},",
    openings: [
      "Aapke {exam} ke liye dher saari shubhkamnayein.",
      "{exam} shaant man se dijiye, yahi kamna hai.",
      "{exam} ke liye best of luck — mehnat aapne kar li hai.",
    ],
    countdown: "{days} din baaki hain. Sahi tarah use karein to kaafi hain.",
    dayOf: "Aaj hi hai. Paper do baar padhiye, phir jo aata hai usse shuru kijiye.",
    tones: {
      motivating: [
        "Kismat se zyada aapke apne notes aur shaant dimaag kaam aayenge.",
        "Jo ghante aap laga chuke hain, wo waise hi wahan maujood hain.",
      ],
      calm: [
        "Ek raat pehle theek se soiye; taaza dimaag ek aur revision se behtar hai.",
        "Ghabrahat normal hai. Paper shuru hone ke das minute mein baith jaati hai.",
      ],
      blessing: [
        "Shaant man aur sthir haath se likhein, yahi ashirvaad.",
        "Aapki mehnat ka poora phal mile.",
      ],
      funny: [
        "Roll number likhna mat bhooliye. Sach mein log bhool jaate hain.",
        "Paper aapse dara hua hai, aap paper se nahi.",
      ],
    },
    closings: [
      "Jaakar kar dikhaiye.",
      "Hum saath hain.",
      "Result jo bhi ho, mehnat apni jagah hai.",
    ],
    signoff: "- {sender}",
  },

  hi: {
    greeting: "{name},",
    openings: [
      "आपकी {exam} के लिए ढेर सारी शुभकामनाएँ।",
      "{exam} शांत मन से दीजिए, यही कामना है।",
      "{exam} के लिए शुभकामनाएँ — मेहनत आप कर चुके हैं।",
    ],
    countdown: "{days} दिन बाकी हैं। सही ढंग से उपयोग करें तो पर्याप्त हैं।",
    dayOf: "आज ही है। प्रश्नपत्र दो बार पढ़िए, फिर जो आता है उससे शुरू कीजिए।",
    tones: {
      motivating: [
        "भाग्य से अधिक आपके अपने नोट्स और शांत मस्तिष्क काम आएँगे।",
        "जो घंटे आप लगा चुके हैं, वे वहीं मौजूद हैं।",
      ],
      calm: [
        "एक रात पहले ठीक से सोइए; ताज़ा दिमाग़ एक और दोहराव से बेहतर है।",
        "घबराहट स्वाभाविक है। पेपर शुरू होने के दस मिनट में बैठ जाती है।",
      ],
      blessing: [
        "शांत मन और स्थिर हाथ से लिखें, यही आशीर्वाद।",
        "आपके परिश्रम का पूरा फल मिले।",
      ],
      funny: [
        "रोल नंबर लिखना मत भूलिए। सचमुच लोग भूल जाते हैं।",
        "प्रश्नपत्र आपसे डरा हुआ है, आप उससे नहीं।",
      ],
    },
    closings: [
      "जाइए और कर दिखाइए।",
      "हम आपके साथ हैं।",
      "परिणाम जो भी हो, मेहनत अपनी जगह है।",
    ],
    signoff: "- {sender}",
  },

  mr: {
    greeting: "{name},",
    openings: [
      "तुमच्या {exam} साठी खूप खूप शुभेच्छा.",
      "{exam} शांत मनाने द्या, हीच सदिच्छा.",
      "{exam} साठी शुभेच्छा — मेहनत तुम्ही केली आहेच.",
    ],
    countdown: "{days} दिवस बाकी आहेत. नीट वापरले तर पुरेसे आहेत.",
    dayOf: "आजच आहे. पेपर दोनदा वाचा, मग येते ते आधी लिहा.",
    tones: {
      motivating: [
        "नशिबापेक्षा तुमच्या नोट्स आणि शांत डोके जास्त उपयोगी पडतील.",
        "तुम्ही घातलेले तास तिथेच तुमची वाट पाहत आहेत.",
      ],
      calm: [
        "आदल्या रात्री नीट झोपा; ताजे डोके आणखी एका उजळणीपेक्षा चांगले.",
        "धाकधूक स्वाभाविक आहे. पेपर सुरू झाल्यावर दहा मिनिटांत ती जाते.",
      ],
      blessing: [
        "शांत मनाने आणि स्थिर हाताने लिहा, हाच आशीर्वाद.",
        "तुमच्या कष्टाचे पूर्ण फळ मिळो.",
      ],
      funny: [
        "रोल नंबर लिहायला विसरू नका. खरंच लोक विसरतात.",
        "पेपर तुम्हाला घाबरतो, तुम्ही पेपरला नाही.",
      ],
    },
    closings: [
      "जा आणि करून दाखवा.",
      "आम्ही तुमच्यासोबत आहोत.",
      "निकाल काहीही असो, मेहनत जागेवर आहे.",
    ],
    signoff: "- {sender}",
  },

  bn: {
    greeting: "{name},",
    openings: [
      "তোমার {exam}-এর জন্য অনেক শুভেচ্ছা।",
      "{exam} শান্ত মনে দাও, এটাই কামনা।",
      "{exam}-এর জন্য শুভকামনা — পরিশ্রম তো তুমি করেই ফেলেছ।",
    ],
    countdown: "{days} দিন বাকি। ঠিকমতো কাজে লাগালে যথেষ্ট।",
    dayOf: "আজই। প্রশ্নপত্র দু'বার পড়ো, তারপর যেটা জানো সেটা দিয়ে শুরু করো।",
    tones: {
      motivating: [
        "ভাগ্যের চেয়ে তোমার নিজের নোট আর ঠান্ডা মাথা বেশি কাজে দেবে।",
        "যে ঘণ্টাগুলো তুমি দিয়েছ, সেগুলো ঠিক সেখানেই আছে।",
      ],
      calm: [
        "আগের রাতে ভালো করে ঘুমিও; তাজা মাথা আরেকটা রিভিশনের চেয়ে ভালো।",
        "ঘাবড়ে যাওয়া স্বাভাবিক। পরীক্ষা শুরুর দশ মিনিটেই তা কেটে যায়।",
      ],
      blessing: [
        "শান্ত মনে আর স্থির হাতে লেখো, এই আশীর্বাদ।",
        "তোমার পরিশ্রমের পূর্ণ ফল মিলুক।",
      ],
      funny: [
        "রোল নম্বর লিখতে ভুলো না। সত্যিই লোকে ভোলে।",
        "প্রশ্নপত্র তোমাকে ভয় পাচ্ছে, তুমি ওকে নয়।",
      ],
    },
    closings: [
      "যাও, করে দেখাও।",
      "আমরা তোমার পাশে আছি।",
      "ফল যাই হোক, পরিশ্রমটা থেকেই যাবে।",
    ],
    signoff: "- {sender}",
  },

  gu: {
    greeting: "{name},",
    openings: [
      "તમારી {exam} માટે ખૂબ ખૂબ શુભેચ્છા.",
      "{exam} શાંત મને આપો, એ જ કામના.",
      "{exam} માટે શુભેચ્છા — મહેનત તો તમે કરી જ લીધી છે.",
    ],
    countdown: "{days} દિવસ બાકી છે. બરાબર વાપરો તો પૂરતા છે.",
    dayOf: "આજે જ છે. પેપર બે વાર વાંચો, પછી જે આવડે તેનાથી શરૂ કરો.",
    tones: {
      motivating: [
        "નસીબ કરતાં તમારી પોતાની નોંધ અને શાંત મગજ વધુ કામ આવશે.",
        "તમે આપેલા કલાકો ત્યાં જ તમારી રાહ જુએ છે.",
      ],
      calm: [
        "આગલી રાતે બરાબર ઊંઘો; તાજું મગજ વધુ એક ઉજાળી કરતાં સારું.",
        "ગભરાટ સ્વાભાવિક છે. પેપર શરૂ થયાની દસ મિનિટમાં શમી જાય છે.",
      ],
      blessing: [
        "શાંત મન અને સ્થિર હાથે લખો, એ જ આશીર્વાદ.",
        "તમારી મહેનતનું પૂરું ફળ મળે.",
      ],
      funny: [
        "રોલ નંબર લખવાનું ભૂલશો નહીં. ખરેખર લોકો ભૂલી જાય છે.",
        "પેપર તમારાથી ડરે છે, તમે પેપરથી નહીં.",
      ],
    },
    closings: [
      "જાઓ અને કરી બતાવો.",
      "અમે તમારી સાથે છીએ.",
      "પરિણામ જે હોય, મહેનત પોતાની જગ્યાએ છે.",
    ],
    signoff: "- {sender}",
  },

  ta: {
    greeting: "{name},",
    openings: [
      "உங்கள் {exam} தேர்வுக்கு நல்வாழ்த்துக்கள்.",
      "{exam} தேர்வை அமைதியான மனதுடன் எழுதுங்கள்.",
      "{exam} தேர்வுக்கு வாழ்த்துக்கள் — உழைப்பை நீங்கள் ஏற்கனவே போட்டுவிட்டீர்கள்.",
    ],
    countdown: "இன்னும் {days} நாட்கள். சரியாகப் பயன்படுத்தினால் இது போதும்.",
    dayOf: "இன்றுதான். வினாத்தாளை இருமுறை படியுங்கள், தெரிந்ததில் இருந்து தொடங்குங்கள்.",
    tones: {
      motivating: [
        "அதிர்ஷ்டத்தை விட உங்கள் குறிப்புகளும் அமைதியான மனமும் அதிகம் உதவும்.",
        "நீங்கள் போட்ட ஒவ்வொரு மணி நேரமும் அங்கேயே காத்திருக்கிறது.",
      ],
      calm: [
        "முதல் நாள் இரவு நன்றாக தூங்குங்கள்; புத்துணர்ச்சி மேலும் ஒரு திருப்புதலை விட சிறந்தது.",
        "பதற்றம் இயல்பானது. தேர்வு தொடங்கிய பத்து நிமிடத்தில் அது அடங்கிவிடும்.",
      ],
      blessing: [
        "அமைதியான மனதுடனும் நிலையான கையுடனும் எழுதுங்கள்.",
        "உங்கள் உழைப்புக்கு முழு பலன் கிடைக்கட்டும்.",
      ],
      funny: [
        "பதிவெண் எழுத மறந்துவிடாதீர்கள். உண்மையிலேயே பலர் மறக்கிறார்கள்.",
        "வினாத்தாள்தான் உங்களைக் கண்டு பயப்படுகிறது.",
      ],
    },
    closings: [
      "போய் செய்து காட்டுங்கள்.",
      "நாங்கள் உங்கள் பக்கம் இருக்கிறோம்.",
      "முடிவு எதுவாக இருந்தாலும், உழைப்பு அப்படியே இருக்கும்.",
    ],
    signoff: "- {sender}",
  },
};

/** Exam names as they read in each language. */
const EXAM_BY_LANG = {
  en: {
    board10: "Class 10 board exam",
    board12: "Class 12 board exam",
    jee: "JEE",
    neet: "NEET",
    upsc: "UPSC exam",
    cat: "CAT",
    semester: "semester exam",
    unittest: "unit test",
    govt: "recruitment exam",
  },
  hinglish: {
    board10: "10th board exam",
    board12: "12th board exam",
    jee: "JEE",
    neet: "NEET",
    upsc: "UPSC exam",
    cat: "CAT",
    semester: "semester exam",
    unittest: "unit test",
    govt: "sarkari exam",
  },
  hi: {
    board10: "दसवीं बोर्ड परीक्षा",
    board12: "बारहवीं बोर्ड परीक्षा",
    jee: "जेईई परीक्षा",
    neet: "नीट परीक्षा",
    upsc: "यूपीएससी परीक्षा",
    cat: "कैट परीक्षा",
    semester: "सेमेस्टर परीक्षा",
    unittest: "इकाई परीक्षा",
    govt: "सरकारी भर्ती परीक्षा",
  },
  mr: {
    board10: "दहावीची बोर्ड परीक्षा",
    board12: "बारावीची बोर्ड परीक्षा",
    jee: "जेईई परीक्षा",
    neet: "नीट परीक्षा",
    upsc: "यूपीएससी परीक्षा",
    cat: "कॅट परीक्षा",
    semester: "सत्र परीक्षा",
    unittest: "घटक चाचणी",
    govt: "शासकीय भरती परीक्षा",
  },
  bn: {
    board10: "দশম শ্রেণির বোর্ড পরীক্ষা",
    board12: "দ্বাদশ শ্রেণির বোর্ড পরীক্ষা",
    jee: "জেইই পরীক্ষা",
    neet: "নিট পরীক্ষা",
    upsc: "ইউপিএসসি পরীক্ষা",
    cat: "ক্যাট পরীক্ষা",
    semester: "সেমিস্টার পরীক্ষা",
    unittest: "ইউনিট টেস্ট",
    govt: "সরকারি নিয়োগ পরীক্ষা",
  },
  gu: {
    board10: "ધોરણ ૧૦ બોર્ડ પરીક્ષા",
    board12: "ધોરણ ૧૨ બોર્ડ પરીક્ષા",
    jee: "જેઈઈ પરીક્ષા",
    neet: "નીટ પરીક્ષા",
    upsc: "યુપીએસસી પરીક્ષા",
    cat: "કેટ પરીક્ષા",
    semester: "સેમેસ્ટર પરીક્ષા",
    unittest: "યુનિટ ટેસ્ટ",
    govt: "સરકારી ભરતી પરીક્ષા",
  },
  ta: {
    board10: "பத்தாம் வகுப்பு பொதுத்தேர்வு",
    board12: "பன்னிரண்டாம் வகுப்பு பொதுத்தேர்வு",
    jee: "ஜேஈஈ",
    neet: "நீட்",
    upsc: "யுபிஎஸ்சி தேர்வு",
    cat: "கேட் தேர்வு",
    semester: "செமஸ்டர் தேர்வு",
    unittest: "அலகுத் தேர்வு",
    govt: "அரசுப் பணி தேர்வு",
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
 * Build exam best-wishes drafts and the revision budget.
 *
 * @returns {{variants:Array<{id:number,text:string,chars:number,words:number}>,
 *            daysLeft:number|null, budget:object|null, exam:string}|{error:string}}
 */
export function buildExamWishes({
  name = "",
  exam = "board12",
  relationship = "child",
  tone = "motivating",
  language = "en",
  todayISO = "",
  examISO = "",
  hoursPerDay = 4,
  subjects = 5,
  sender = "",
  seed = 1,
  count = 3,
} = {}) {
  const pack = PACKS[language] ?? PACKS.en;
  const examPack = EXAM_BY_LANG[language] ?? EXAM_BY_LANG.en;
  const examEntry = EXAMS.find((item) => item.id === exam) ?? EXAMS[0];
  const toneId = TONES.some((item) => item.id === tone) ? tone : "motivating";
  const relEntry = RELATIONSHIPS.find((item) => item.id === relationship) ?? RELATIONSHIPS[0];

  const student = clean(name);
  if (!student) return { error: "Add the name of the student you are writing to." };

  let daysLeft = null;
  if (todayISO && examISO) {
    const gap = daysUntil(todayISO, examISO);
    if (gap.error) return { error: gap.error };
    // A negative gap means the exam date is before the message date -- that
    // is not "the exam is today" (daysLeft === 0), it is an invalid date
    // combination, and generating "It is today..." text for it would be
    // factually wrong for an exam that has already happened.
    if (gap.days < 0) {
      return { error: "The first exam date can't be before the message date." };
    }
    daysLeft = gap.days;
  }

  // A bad revision-budget input (e.g. the hours-per-day or subjects field
  // is momentarily empty while the user retypes it) should not block the
  // wish messages themselves -- name/exam/tone/dates are independently
  // valid, so the budget stats just fall back to unavailable instead of
  // wiping out `variants` entirely.
  let budget = null;
  let budgetError = null;
  if (daysLeft != null) {
    const plan = revisionBudget({ daysLeft, hoursPerDay, subjects });
    if (plan.error) {
      budgetError = plan.error;
    } else {
      budget = plan;
    }
  }

  const senderName = clean(sender);
  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const openOffset = Math.floor(rng() * 997);
  const toneOffset = Math.floor(rng() * 997);
  const closeOffset = Math.floor(rng() * 997);

  const examName = examPack[examEntry.id] ?? examEntry.label;
  const tokens = {
    name: student,
    exam: examName,
    sender: senderName,
    days: daysLeft == null ? "" : String(Math.max(0, daysLeft)),
  };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const parts = [
      fill(pack.greeting, tokens),
      fill(rotate(pack.openings, openOffset, step), tokens),
    ];
    if (daysLeft != null) {
      // daysLeft is guaranteed >= 0 here (a negative gap is rejected above),
      // so 0 unambiguously means "the exam is today".
      parts.push(daysLeft === 0 ? pack.dayOf : fill(pack.countdown, tokens));
    }
    parts.push(rotate(pack.tones[toneId], toneOffset, step));
    parts.push(rotate(pack.closings, closeOffset, step));
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
    daysLeft,
    budget,
    budgetError,
    exam: examName,
    examLabel: examEntry.label,
    relationship: relEntry.label,
    tone: toneId,
  };
}
