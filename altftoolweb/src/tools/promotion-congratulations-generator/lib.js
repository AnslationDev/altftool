/**
 * Promotion / new job congratulations composer.
 *
 * Also checks the finished message against the real character limits of the
 * channels people actually post congratulations on.
 *
 * Pure: no React, no DOM, no Date.now(). Dates arrive as ISO strings.
 */

export const MAX_VARIANTS = 6;
export const MAX_NAME_LENGTH = 80;

/* ------------------------------------------------------------------ *
 * Channel character limits (public, documented platform limits)
 * ------------------------------------------------------------------ */

export const CHANNELS = [
  { id: "sms", label: "SMS (single part, GSM-7)", limit: 160 },
  { id: "x", label: "X / Twitter post", limit: 280 },
  { id: "linkedin-comment", label: "LinkedIn comment", limit: 1250 },
  { id: "linkedin-post", label: "LinkedIn post", limit: 3000 },
  { id: "whatsapp", label: "WhatsApp message", limit: 65536 },
];

/**
 * How the message measures up against each channel limit.
 * @returns {Array<{id:string,label:string,limit:number,fits:boolean,over:number}>}
 */
export function channelFit(text) {
  const chars = [...String(text ?? "")].length;
  return CHANNELS.map((channel) => ({
    id: channel.id,
    label: channel.label,
    limit: channel.limit,
    fits: chars <= channel.limit,
    over: Math.max(0, chars - channel.limit),
  }));
}

/* ------------------------------------------------------------------ *
 * Time in the previous role
 * ------------------------------------------------------------------ */

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

function lastDayOfMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Add whole months to a UTC date, clamping the day to the end of the target
 * month — 31 January plus one month is 28/29 February, not 2/3 March.
 */
function addMonths(dt, monthsToAdd) {
  const total = dt.getUTCFullYear() * 12 + dt.getUTCMonth() + monthsToAdd;
  const year = Math.floor(total / 12);
  const monthIndex = ((total % 12) + 12) % 12;
  const day = Math.min(dt.getUTCDate(), lastDayOfMonth(year, monthIndex));
  return new Date(Date.UTC(year, monthIndex, day));
}

/**
 * Calendar-accurate years, months and days between two ISO dates.
 *
 * Counts whole months first (clamping short months), then the leftover days,
 * so 31 Jan to 1 Mar reads as 1 month 1 day rather than a negative day count.
 */
export function timeInRole(fromISO, toISOValue) {
  const from = parseISO(fromISO);
  const to = parseISO(toISOValue);
  if (!from || !to) return { error: "Both dates must be valid." };
  if (to.getTime() < from.getTime()) {
    return { error: "The promotion date cannot fall before the date the role started." };
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
    totalMonths,
  };
}

/* ------------------------------------------------------------------ *
 * Options
 * ------------------------------------------------------------------ */

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "hinglish", label: "Hinglish (Roman)" },
  { id: "hi", label: "हिन्दी" },
  { id: "mr", label: "मराठी" },
  { id: "bn", label: "বাংলা" },
  { id: "ta", label: "தமிழ்" },
];

export const EVENTS = [
  { id: "promotion", label: "Promotion" },
  { id: "new-job", label: "New job" },
  { id: "first-job", label: "First job" },
  { id: "career-switch", label: "Career switch" },
  { id: "award", label: "Award or recognition" },
];

export const RELATIONSHIPS = [
  { id: "friend", label: "Friend", group: "personal" },
  { id: "family", label: "Family member", group: "personal" },
  { id: "colleague", label: "Colleague", group: "work" },
  { id: "teammate", label: "Someone on your team", group: "work" },
  { id: "boss", label: "Manager or senior", group: "formal" },
  { id: "client", label: "Client or partner", group: "formal" },
  { id: "mentee", label: "Someone you mentored", group: "work" },
];

export const TONES = [
  { id: "warm", label: "Warm" },
  { id: "professional", label: "Professional" },
  { id: "funny", label: "Light-hearted" },
  { id: "admiring", label: "Admiring" },
];

/* ------------------------------------------------------------------ *
 * Wording banks. Tokens: {name} {role} {company} {years}
 * ------------------------------------------------------------------ */

const PACKS = {
  en: {
    greeting: "{name},",
    events: {
      promotion: "Congratulations on the promotion to {role}.",
      "new-job": "Congratulations on the new role as {role}.",
      "first-job": "Congratulations on your first job as {role}.",
      "career-switch": "Congratulations on making the move into {role}.",
      award: "Congratulations on being recognised as {role}.",
    },
    companyLine: "{company} has picked well.",
    tenureLine: "{years} years in the previous role, and every one of them showed.",
    tones: {
      warm: [
        "Nobody who has worked with you is surprised.",
        "Thoroughly deserved, and about time too.",
      ],
      professional: [
        "It is a well-earned recognition of consistent work.",
        "Wishing you every success in the new responsibility.",
      ],
      funny: [
        "More responsibility, same coffee budget. Congratulations anyway.",
        "New title, new inbox, same excellent you.",
      ],
      admiring: [
        "You made the hard part look ordinary, which is the real skill.",
        "Watching you grow into this has been genuinely good to see.",
      ],
    },
    closings: {
      personal: ["Celebration is on you now.", "So proud of you — go enjoy this."],
      work: ["Looking forward to working with you in the new role.", "The team is lucky to have you leading this."],
      formal: ["My best wishes for the road ahead.", "Wishing you continued success."],
    },
    signoff: "- {sender}",
  },

  hinglish: {
    greeting: "{name},",
    events: {
      promotion: "{role} ke roop mein promotion ke liye badhai.",
      "new-job": "{role} ki nayi bhoomika ke liye badhai.",
      "first-job": "{role} ke roop mein aapki pehli naukri ki badhai.",
      "career-switch": "{role} mein naya safar shuru karne ke liye badhai.",
      award: "{role} ke roop mein sammanit hone par badhai.",
    },
    companyLine: "{company} ne bilkul sahi chuna hai.",
    tenureLine: "Pichhli bhoomika mein {years} saal, aur har saal dikhta hai.",
    tones: {
      warm: [
        "Jisne bhi aapke saath kaam kiya hai, use hairani nahi hui.",
        "Poori tarah haqdaar the aap, bas thoda der se hua.",
      ],
      professional: [
        "Yeh lagatar mehnat ki uchit pehchaan hai.",
        "Nayi zimmedari mein safalta ki shubhkamnayein.",
      ],
      funny: [
        "Zimmedari zyada, coffee budget wahi. Phir bhi badhai!",
        "Naya title, naya inbox, wahi shandaar aap.",
      ],
      admiring: [
        "Mushkil kaam ko aasan dikha dena hi asli hunar hai.",
        "Aapko yahan tak badhte dekhna sach mein achha laga.",
      ],
    },
    closings: {
      personal: ["Ab party aapki taraf se.", "Bahut garv hai — jee bhar ke enjoy kijiye."],
      work: ["Nayi bhoomika mein saath kaam karne ka intezaar hai.", "Team khush-kismat hai ki aap lead kar rahe hain."],
      formal: ["Aage ke safar ke liye shubhkamnayein.", "Nirantar safalta ki kamna."],
    },
    signoff: "- {sender}",
  },

  hi: {
    greeting: "{name},",
    events: {
      promotion: "{role} के पद पर पदोन्नति के लिए बधाई।",
      "new-job": "{role} की नई भूमिका के लिए बधाई।",
      "first-job": "{role} के रूप में आपकी पहली नौकरी की बधाई।",
      "career-switch": "{role} में नई शुरुआत के लिए बधाई।",
      award: "{role} के रूप में सम्मानित होने पर बधाई।",
    },
    companyLine: "{company} ने बिल्कुल सही चुना है।",
    tenureLine: "पिछली भूमिका में {years} वर्ष, और हर वर्ष दिखाई देता है।",
    tones: {
      warm: [
        "जिसने भी आपके साथ काम किया है, उसे आश्चर्य नहीं हुआ।",
        "पूरी तरह हक़दार थे आप, बस थोड़ी देर से हुआ।",
      ],
      professional: [
        "यह निरंतर परिश्रम की उचित पहचान है।",
        "नई ज़िम्मेदारी में सफलता की शुभकामनाएँ।",
      ],
      funny: [
        "ज़िम्मेदारी ज़्यादा, कॉफ़ी बजट वही। फिर भी बधाई!",
        "नया पद, नया इनबॉक्स, वही शानदार आप।",
      ],
      admiring: [
        "कठिन काम को आसान दिखा देना ही असली हुनर है।",
        "आपको यहाँ तक बढ़ते देखना सचमुच अच्छा लगा।",
      ],
    },
    closings: {
      personal: ["अब दावत आपकी ओर से।", "बहुत गर्व है — जी भर कर आनंद लीजिए।"],
      work: ["नई भूमिका में साथ काम करने की प्रतीक्षा है।", "टीम भाग्यशाली है कि आप नेतृत्व कर रहे हैं।"],
      formal: ["आगे के सफ़र के लिए शुभकामनाएँ।", "निरंतर सफलता की कामना।"],
    },
    signoff: "- {sender}",
  },

  mr: {
    greeting: "{name},",
    events: {
      promotion: "{role} पदावर बढतीबद्दल अभिनंदन.",
      "new-job": "{role} या नव्या भूमिकेबद्दल अभिनंदन.",
      "first-job": "{role} म्हणून तुमच्या पहिल्या नोकरीबद्दल अभिनंदन.",
      "career-switch": "{role} मध्ये नवी सुरुवात केल्याबद्दल अभिनंदन.",
      award: "{role} म्हणून गौरव झाल्याबद्दल अभिनंदन.",
    },
    companyLine: "{company} ने अगदी योग्य निवड केली आहे.",
    tenureLine: "मागील भूमिकेत {years} वर्षे, आणि प्रत्येक वर्ष जाणवते.",
    tones: {
      warm: [
        "ज्यांनी तुमच्यासोबत काम केले त्यांना आश्चर्य वाटले नाही.",
        "पूर्णपणे पात्र होतात, फक्त थोडा उशीर झाला.",
      ],
      professional: [
        "ही सातत्यपूर्ण कामाची योग्य दखल आहे.",
        "नव्या जबाबदारीत यशासाठी शुभेच्छा.",
      ],
      funny: [
        "जबाबदारी जास्त, कॉफी बजेट तेच. तरीही अभिनंदन!",
        "नवे पद, नवा इनबॉक्स, तेच जबरदस्त तुम्ही.",
      ],
      admiring: [
        "अवघड गोष्ट सोपी दाखवणे हेच खरे कौशल्य.",
        "तुम्हाला इथवर वाढताना पाहणे खरोखर छान वाटले.",
      ],
    },
    closings: {
      personal: ["आता पार्टी तुमच्याकडून.", "खूप अभिमान वाटतो — मनसोक्त आनंद घ्या."],
      work: ["नव्या भूमिकेत सोबत काम करण्याची उत्सुकता आहे.", "टीम भाग्यवान आहे की तुम्ही नेतृत्व करत आहात."],
      formal: ["पुढील वाटचालीसाठी शुभेच्छा.", "सातत्यपूर्ण यशासाठी शुभेच्छा."],
    },
    signoff: "- {sender}",
  },

  bn: {
    greeting: "{name},",
    events: {
      promotion: "{role} পদে পদোন্নতির জন্য অভিনন্দন।",
      "new-job": "{role} নতুন ভূমিকার জন্য অভিনন্দন।",
      "first-job": "{role} হিসেবে আপনার প্রথম চাকরির জন্য অভিনন্দন।",
      "career-switch": "{role} ক্ষেত্রে নতুন শুরুর জন্য অভিনন্দন।",
      award: "{role} হিসেবে স্বীকৃতি পাওয়ার জন্য অভিনন্দন।",
    },
    companyLine: "{company} একদম ঠিক লোককেই বেছে নিয়েছে।",
    tenureLine: "আগের ভূমিকায় {years} বছর, এবং প্রতিটি বছর টের পাওয়া যায়।",
    tones: {
      warm: [
        "যাঁরা আপনার সঙ্গে কাজ করেছেন, কেউই অবাক হননি।",
        "সম্পূর্ণ প্রাপ্য ছিল, শুধু একটু দেরি হল।",
      ],
      professional: [
        "এটি ধারাবাহিক পরিশ্রমের যথাযথ স্বীকৃতি।",
        "নতুন দায়িত্বে সাফল্য কামনা করি।",
      ],
      funny: [
        "দায়িত্ব বেশি, কফির বাজেট একই। তবু অভিনন্দন!",
        "নতুন পদ, নতুন ইনবক্স, সেই দুর্দান্ত আপনিই।",
      ],
      admiring: [
        "কঠিন কাজকে সহজ দেখানোই আসল দক্ষতা।",
        "আপনাকে এই জায়গায় পৌঁছতে দেখে সত্যিই ভালো লেগেছে।",
      ],
    },
    closings: {
      personal: ["এবার পার্টিটা আপনার দিক থেকে।", "ভীষণ গর্বিত — প্রাণ ভরে উপভোগ করুন।"],
      work: ["নতুন ভূমিকায় একসঙ্গে কাজ করার অপেক্ষায়।", "টিম ভাগ্যবান যে আপনি নেতৃত্ব দিচ্ছেন।"],
      formal: ["আগামী পথের জন্য শুভকামনা।", "ধারাবাহিক সাফল্য কামনা করি।"],
    },
    signoff: "- {sender}",
  },

  ta: {
    greeting: "{name},",
    events: {
      promotion: "{role} பதவி உயர்வுக்கு வாழ்த்துக்கள்.",
      "new-job": "{role} என்ற புதிய பொறுப்புக்கு வாழ்த்துக்கள்.",
      "first-job": "{role} ஆக உங்கள் முதல் வேலைக்கு வாழ்த்துக்கள்.",
      "career-switch": "{role} துறையில் புதிய தொடக்கத்திற்கு வாழ்த்துக்கள்.",
      award: "{role} என அங்கீகரிக்கப்பட்டதற்கு வாழ்த்துக்கள்.",
    },
    companyLine: "{company} சரியான தேர்வையே செய்திருக்கிறது.",
    tenureLine: "முந்தைய பொறுப்பில் {years} ஆண்டுகள், ஒவ்வொரு ஆண்டும் தெரிகிறது.",
    tones: {
      warm: [
        "உங்களுடன் பணியாற்றிய யாருக்கும் இது ஆச்சரியமல்ல.",
        "முழுமையாக தகுதியானது, கொஞ்சம் தாமதமாகத்தான் வந்தது.",
      ],
      professional: [
        "இது தொடர்ச்சியான உழைப்பின் தகுந்த அங்கீகாரம்.",
        "புதிய பொறுப்பில் வெற்றி பெற வாழ்த்துக்கள்.",
      ],
      funny: [
        "பொறுப்பு அதிகம், காபி பட்ஜெட் அதே. இருந்தாலும் வாழ்த்துக்கள்!",
        "புதிய பதவி, புதிய இன்பாக்ஸ், அதே அருமையான நீங்கள்.",
      ],
      admiring: [
        "கடினமானதை எளிதாகக் காட்டுவதே உண்மையான திறமை.",
        "நீங்கள் இந்த இடத்திற்கு வளர்ந்ததைப் பார்ப்பது மகிழ்ச்சியாக இருந்தது.",
      ],
    },
    closings: {
      personal: ["இப்போது விருந்து உங்கள் தரப்பில்.", "பெருமையாக இருக்கிறது — நன்றாக அனுபவியுங்கள்."],
      work: ["புதிய பொறுப்பில் இணைந்து பணியாற்ற ஆவலாக உள்ளேன்.", "நீங்கள் வழிநடத்துவது குழுவின் அதிர்ஷ்டம்."],
      formal: ["வரும் பயணத்திற்கு வாழ்த்துக்கள்.", "தொடர் வெற்றி பெற வாழ்த்துகிறேன்."],
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
 * Build congratulations drafts.
 *
 * @returns {{variants:Array<{id:number,text:string,chars:number,words:number,
 *            channels:Array<object>}>, tenure:object|null}|{error:string}}
 */
export function buildCongratulations({
  name = "",
  role = "",
  company = "",
  event = "promotion",
  relationship = "colleague",
  tone = "warm",
  language = "en",
  roleStartISO = "",
  promotionISO = "",
  sender = "",
  seed = 1,
  count = 3,
} = {}) {
  const pack = PACKS[language] ?? PACKS.en;
  const eventEntry = EVENTS.find((item) => item.id === event) ?? EVENTS[0];
  const relEntry = RELATIONSHIPS.find((item) => item.id === relationship) ?? RELATIONSHIPS[0];
  const toneId = TONES.some((item) => item.id === tone) ? tone : "warm";

  const person = clean(name);
  if (!person) return { error: "Add the name of the person you are congratulating." };

  const roleTitle = clean(role);
  if (!roleTitle) return { error: "Add the new role or title." };

  const companyName = clean(company);
  const senderName = clean(sender);

  let tenure = null;
  if (roleStartISO && promotionISO) {
    const span = timeInRole(roleStartISO, promotionISO);
    if (span.error) return { error: span.error };
    tenure = span;
  }

  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const toneOffset = Math.floor(rng() * 997);
  const closeOffset = Math.floor(rng() * 997);

  const tokens = {
    name: person,
    role: roleTitle,
    company: companyName,
    sender: senderName,
    years: tenure ? String(tenure.years) : "",
  };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const parts = [fill(pack.greeting, tokens), fill(pack.events[eventEntry.id], tokens)];
    if (companyName) parts.push(fill(pack.companyLine, tokens));
    if (tenure && tenure.years > 0) parts.push(fill(pack.tenureLine, tokens));
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
      channels: channelFit(text),
    });
  }

  return {
    variants,
    tenure,
    event: eventEntry.label,
    relationship: relEntry.label,
    tone: toneId,
  };
}
