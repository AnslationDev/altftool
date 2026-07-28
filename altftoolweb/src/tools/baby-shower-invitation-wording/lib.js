/**
 * Baby shower / godh bharai invitation wording composer.
 *
 * Pure text composition: no React, no DOM, no Date.now(). Every variant is a
 * deterministic function of (inputs, seed), so the same seed always rebuilds
 * the same invitation.
 */

/* ------------------------------------------------------------------ *
 * Limits
 * ------------------------------------------------------------------ */

/** Most invitation cards read badly past six wording options; cap the list. */
export const MAX_VARIANTS = 6;
/** Guest-facing names longer than this are almost always a paste accident. */
export const MAX_NAME_LENGTH = 80;
/** Free-text note cap, roughly one printed line on a 5x7 card. */
export const MAX_NOTE_LENGTH = 200;

/* ------------------------------------------------------------------ *
 * SMS sizing — GSM 03.38 / 3GPP TS 23.038
 * ------------------------------------------------------------------ */

/** Single-part SMS in the 7-bit GSM default alphabet. */
export const GSM7_SINGLE = 160;
/** Per-part payload once a GSM-7 message is concatenated (6-byte UDH header). */
export const GSM7_CONCAT = 153;
/** Single-part SMS once any character forces UCS-2 (16-bit) encoding. */
export const UCS2_SINGLE = 70;
/** Per-part payload for a concatenated UCS-2 message. */
export const UCS2_CONCAT = 67;

/** Basic GSM 03.38 alphabet (each character costs one septet). */
const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** GSM 03.38 extension table — each of these costs two septets (ESC + char). */
const GSM7_EXTENDED = "^{}\\[~]|€";

/**
 * Character count, word count and SMS part count for a finished message.
 * Indic scripts are not in the GSM alphabet, so any Devanagari/Tamil/Bengali
 * text falls back to UCS-2 at 70 characters per part.
 */
export function messageStats(text) {
  const value = String(text ?? "");
  const chars = [...value].length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const lines = value.trim() ? value.trim().split(/\n/).length : 0;

  let septets = 0;
  let gsmSafe = true;
  for (const ch of value) {
    if (GSM7_BASIC.includes(ch)) septets += 1;
    else if (GSM7_EXTENDED.includes(ch)) septets += 2;
    else {
      gsmSafe = false;
      break;
    }
  }

  let encoding;
  let units;
  let single;
  let concat;
  if (gsmSafe) {
    encoding = "GSM-7";
    units = septets;
    single = GSM7_SINGLE;
    concat = GSM7_CONCAT;
  } else {
    encoding = "UCS-2";
    units = chars;
    single = UCS2_SINGLE;
    concat = UCS2_CONCAT;
  }

  const smsParts = units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / concat);
  return { chars, words, lines, encoding, smsParts };
}

/* ------------------------------------------------------------------ *
 * Deterministic variant picker
 * ------------------------------------------------------------------ */

/** mulberry32 — small, fast, fully deterministic 32-bit PRNG. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 6), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rotate(list, offset, step) {
  if (!Array.isArray(list) || list.length === 0) return "";
  return list[(offset + step) % list.length];
}

/* ------------------------------------------------------------------ *
 * Ceremonies — real regional pre-birth rituals
 * ------------------------------------------------------------------ */

export const CEREMONIES = [
  { id: "baby-shower", label: "Baby Shower", note: "General, no ritual framing" },
  { id: "godh-bharai", label: "Godh Bharai", note: "North & Central India, 7th–9th month" },
  { id: "seemantham", label: "Seemantham", note: "Telugu & Tamil, Seemantonnayana rite" },
  { id: "valaikappu", label: "Valaikappu", note: "Tamil Nadu, bangle ceremony" },
  { id: "dohale-jevan", label: "Dohale Jevan", note: "Maharashtra, cravings feast" },
  { id: "shaad", label: "Shaad", note: "Bengal, 'Sadh' rice-feeding ceremony" },
  { id: "srimantham", label: "Srimantham", note: "Kerala & coastal Karnataka" },
  { id: "sip-and-see", label: "Sip & See", note: "After the baby arrives" },
];

export const TONES = [
  { id: "warm", label: "Warm" },
  { id: "traditional", label: "Traditional" },
  { id: "playful", label: "Playful" },
  { id: "formal", label: "Formal" },
];

export const LANGUAGES = [
  { id: "en", label: "English", locale: "en-IN" },
  { id: "hinglish", label: "Hinglish (Roman)", locale: "en-IN" },
  { id: "hi", label: "हिन्दी", locale: "hi-IN" },
  { id: "mr", label: "मराठी", locale: "mr-IN" },
  { id: "bn", label: "বাংলা", locale: "bn-IN" },
  { id: "gu", label: "ગુજરાતી", locale: "gu-IN" },
  { id: "ta", label: "தமிழ்", locale: "ta-IN" },
];

/* ------------------------------------------------------------------ *
 * Wording banks. {honoree} {hosts} {ceremony} are filled at compose time.
 * ------------------------------------------------------------------ */

const PACKS = {
  en: {
    labels: {
      date: "Date",
      time: "Time",
      venue: "Venue",
      rsvp: "RSVP",
      hostedBy: "With love,",
    },
    openers: {
      warm: [
        "A little one is on the way, and our hearts are full.",
        "There is a new story beginning in our family.",
      ],
      traditional: [
        "With gratitude to the elders and blessings all around, we invite you to the {ceremony} of {honoree}.",
        "By the grace of the divine, the {ceremony} of {honoree} will be observed at our home.",
      ],
      playful: [
        "Tiny socks, big appetite, zero sleep — the countdown has begun!",
        "We are one bump closer to chaos, and you are invited to it.",
      ],
      formal: [
        "You are cordially invited to the {ceremony} of {honoree}.",
        "We request the pleasure of your company at the {ceremony} of {honoree}.",
      ],
    },
    blessings: [
      "Come bless the mother-to-be and share a meal with us.",
      "Your blessings mean more to us than any gift.",
      "Bring your good wishes; that is the only gift we are asking for.",
      "Please join us for lunch, laughter and a lot of baby talk.",
    ],
    closings: {
      warm: "We would love to have you with us.",
      traditional: "Kindly grace the occasion with your presence and blessings.",
      playful: "Come hungry, leave happy. No gifts, only good vibes.",
      formal: "Your presence would be deeply appreciated.",
    },
  },

  hinglish: {
    labels: {
      date: "Date",
      time: "Time",
      venue: "Jagah",
      rsvp: "RSVP",
      hostedBy: "Pyaar ke saath,",
    },
    openers: {
      warm: [
        "Ghar mein ek nanhi si khushi aane wali hai.",
        "Hamare parivaar mein ek nayi shuruaat hone ja rahi hai.",
      ],
      traditional: [
        "Bado ke aashirvaad se {honoree} ka {ceremony} rakha gaya hai.",
        "Ishwar ki kripa se {honoree} ka {ceremony} hamare ghar par manaya jayega.",
      ],
      playful: [
        "Chhote kapde, badi bhookh, aur neend gayab — ulti ginti shuru!",
        "Ek nanha sa toofan aane wala hai, aap invited ho.",
      ],
      formal: [
        "Aapko {honoree} ke {ceremony} mein sadar aamantrit kiya jaata hai.",
        "Hum aapse {honoree} ke {ceremony} mein shaamil hone ka anurodh karte hain.",
      ],
    },
    blessings: [
      "Aakar hone wali maa ko aashirvaad dijiye.",
      "Aapka aashirvaad hi hamare liye sabse bada tohfa hai.",
      "Sirf apni shubhkaamnayein laaiye, aur kuch nahi chahiye.",
      "Khaana, hansi aur baaton ke liye zaroor aaiye.",
    ],
    closings: {
      warm: "Aapka aana hamare liye bahut maayne rakhta hai.",
      traditional: "Kripya padhaar kar apna aashirvaad dijiye.",
      playful: "Bhookh lagakar aaiye, khush hokar jaaiye. Gift mana hai!",
      formal: "Aapki upasthiti hamare liye saubhagya ki baat hogi.",
    },
  },

  hi: {
    labels: {
      date: "दिनांक",
      time: "समय",
      venue: "स्थान",
      rsvp: "सूचना हेतु",
      hostedBy: "सप्रेम,",
    },
    openers: {
      warm: [
        "हमारे घर में एक नन्ही सी खुशी दस्तक देने वाली है।",
        "हमारे परिवार में एक नई कहानी शुरू होने जा रही है।",
      ],
      traditional: [
        "बड़ों के आशीर्वाद से {honoree} का {ceremony} रखा गया है।",
        "ईश्वर की कृपा से {honoree} का {ceremony} हमारे निवास पर सम्पन्न होगा।",
      ],
      playful: [
        "नन्हे कपड़े, बड़ी भूख और नींद गायब — उल्टी गिनती शुरू!",
        "एक नन्हा सा तूफ़ान आने वाला है, और आप आमंत्रित हैं।",
      ],
      formal: [
        "आपको {honoree} के {ceremony} में सादर आमंत्रित किया जाता है।",
        "हम आपसे {honoree} के {ceremony} में सम्मिलित होने का अनुरोध करते हैं।",
      ],
    },
    blessings: [
      "आइए और होने वाली माँ को आशीर्वाद दीजिए।",
      "आपका आशीर्वाद ही हमारे लिए सबसे बड़ा उपहार है।",
      "केवल अपनी शुभकामनाएँ लाइए, और कुछ नहीं चाहिए।",
      "भोजन, हँसी और ढेर सारी बातों के लिए अवश्य पधारें।",
    ],
    closings: {
      warm: "आपका आना हमें बहुत प्रिय होगा।",
      traditional: "कृपया पधारकर अपना आशीर्वाद प्रदान करें।",
      playful: "भूख लेकर आइए, खुशी लेकर जाइए। उपहार मना है!",
      formal: "आपकी उपस्थिति हमारे लिए सौभाग्य की बात होगी।",
    },
  },

  mr: {
    labels: {
      date: "दिनांक",
      time: "वेळ",
      venue: "ठिकाण",
      rsvp: "संपर्क",
      hostedBy: "स्नेहपूर्वक,",
    },
    openers: {
      warm: [
        "आमच्या घरी एक चिमुकला आनंद येतो आहे.",
        "आमच्या कुटुंबात एक नवी सुरुवात होते आहे.",
      ],
      traditional: [
        "वडीलधाऱ्यांच्या आशीर्वादाने {honoree} यांचा {ceremony} योजिला आहे.",
        "देवाच्या कृपेने {honoree} यांचा {ceremony} आमच्या निवासस्थानी संपन्न होणार आहे.",
      ],
      playful: [
        "छोटे कपडे, मोठी भूक आणि झोप गायब — उलटी गिनती सुरू!",
        "एक चिमुकले वादळ येते आहे, आणि तुम्ही आमंत्रित आहात.",
      ],
      formal: [
        "आपणास {honoree} यांच्या {ceremony} साठी सादर निमंत्रण.",
        "{honoree} यांच्या {ceremony} प्रसंगी आपण उपस्थित राहावे ही विनंती.",
      ],
    },
    blessings: [
      "या आणि होणाऱ्या आईला आशीर्वाद द्या.",
      "तुमचा आशीर्वाद हीच आमच्यासाठी सर्वात मोठी भेट.",
      "फक्त तुमच्या शुभेच्छा घेऊन या, दुसरे काही नको.",
      "जेवण, हास्य आणि गप्पांसाठी नक्की या.",
    ],
    closings: {
      warm: "तुम्ही आलात तर खूप आनंद होईल.",
      traditional: "कृपया उपस्थित राहून आशीर्वाद द्यावा.",
      playful: "भूक घेऊन या, आनंद घेऊन जा. भेटवस्तू नकोत!",
      formal: "आपली उपस्थिती आमच्यासाठी भाग्याची ठरेल.",
    },
  },

  bn: {
    labels: {
      date: "তারিখ",
      time: "সময়",
      venue: "স্থান",
      rsvp: "যোগাযোগ",
      hostedBy: "ভালোবাসা সহ,",
    },
    openers: {
      warm: [
        "আমাদের ঘরে এক ছোট্ট আনন্দ আসতে চলেছে।",
        "আমাদের পরিবারে একটি নতুন গল্প শুরু হচ্ছে।",
      ],
      traditional: [
        "গুরুজনদের আশীর্বাদে {honoree}-এর {ceremony} আয়োজন করা হয়েছে।",
        "ঈশ্বরের কৃপায় {honoree}-এর {ceremony} আমাদের বাড়িতে অনুষ্ঠিত হবে।",
      ],
      playful: [
        "ছোট জামা, বড় খিদে আর ঘুম উধাও — গোনা শুরু!",
        "এক ছোট্ট ঝড় আসছে, আর আপনি আমন্ত্রিত।",
      ],
      formal: [
        "{honoree}-এর {ceremony} অনুষ্ঠানে আপনাকে সাদর আমন্ত্রণ জানাই।",
        "{honoree}-এর {ceremony} অনুষ্ঠানে আপনার উপস্থিতি কামনা করি।",
      ],
    },
    blessings: [
      "আসুন, হবু মাকে আশীর্বাদ করুন।",
      "আপনার আশীর্বাদই আমাদের সবচেয়ে বড় উপহার।",
      "শুধু শুভেচ্ছা নিয়ে আসুন, আর কিছু চাই না।",
      "খাওয়া, হাসি আর গল্পের জন্য অবশ্যই আসুন।",
    ],
    closings: {
      warm: "আপনি এলে আমরা ভীষণ খুশি হব।",
      traditional: "অনুগ্রহ করে উপস্থিত থেকে আশীর্বাদ করবেন।",
      playful: "খিদে নিয়ে আসুন, আনন্দ নিয়ে ফিরুন। উপহার নয়!",
      formal: "আপনার উপস্থিতি আমাদের সৌভাগ্য।",
    },
  },

  gu: {
    labels: {
      date: "તારીખ",
      time: "સમય",
      venue: "સ્થળ",
      rsvp: "સંપર્ક",
      hostedBy: "સ્નેહ સહ,",
    },
    openers: {
      warm: [
        "અમારા ઘરે એક નાનકડી ખુશી આવી રહી છે.",
        "અમારા પરિવારમાં એક નવી શરૂઆત થઈ રહી છે.",
      ],
      traditional: [
        "વડીલોના આશીર્વાદથી {honoree}નો {ceremony} રાખવામાં આવ્યો છે.",
        "ઈશ્વરની કૃપાથી {honoree}નો {ceremony} અમારા નિવાસસ્થાને યોજાશે.",
      ],
      playful: [
        "નાનાં કપડાં, મોટી ભૂખ અને ઊંઘ ગાયબ — ગણતરી શરૂ!",
        "એક નાનકડું તોફાન આવી રહ્યું છે, અને તમે આમંત્રિત છો.",
      ],
      formal: [
        "{honoree}ના {ceremony} પ્રસંગે આપને સાદર આમંત્રણ.",
        "{honoree}ના {ceremony} પ્રસંગે આપની ઉપસ્થિતિની વિનંતી છે.",
      ],
    },
    blessings: [
      "આવો અને થનારી માતાને આશીર્વાદ આપો.",
      "તમારા આશીર્વાદ જ અમારા માટે સૌથી મોટી ભેટ છે.",
      "માત્ર શુભેચ્છા લઈને આવો, બીજું કંઈ ન જોઈએ.",
      "ભોજન, હાસ્ય અને વાતો માટે અવશ્ય પધારો.",
    ],
    closings: {
      warm: "તમે આવશો તો અમને ખૂબ આનંદ થશે.",
      traditional: "કૃપા કરી પધારીને આશીર્વાદ આપશો.",
      playful: "ભૂખ લઈને આવો, ખુશી લઈને જાઓ. ભેટ નહીં!",
      formal: "આપની ઉપસ્થિતિ અમારા માટે સૌભાગ્ય હશે.",
    },
  },

  ta: {
    labels: {
      date: "நாள்",
      time: "நேரம்",
      venue: "இடம்",
      rsvp: "தொடர்புக்கு",
      hostedBy: "அன்புடன்,",
    },
    openers: {
      warm: [
        "எங்கள் வீட்டில் ஒரு சிறு மகிழ்ச்சி வரவிருக்கிறது.",
        "எங்கள் குடும்பத்தில் ஒரு புதிய கதை தொடங்குகிறது.",
      ],
      traditional: [
        "பெரியோர்களின் ஆசியுடன் {honoree} அவர்களின் {ceremony} நடைபெறுகிறது.",
        "இறைவன் அருளால் {honoree} அவர்களின் {ceremony} எங்கள் இல்லத்தில் நடைபெறும்.",
      ],
      playful: [
        "சின்ன உடைகள், பெரிய பசி, தூக்கம் காணவில்லை — எண்ணிக்கை தொடங்கியது!",
        "ஒரு சின்ன புயல் வரப்போகிறது, நீங்கள் அழைக்கப்படுகிறீர்கள்.",
      ],
      formal: [
        "{honoree} அவர்களின் {ceremony} விழாவிற்கு தங்களை அன்புடன் அழைக்கிறோம்.",
        "{honoree} அவர்களின் {ceremony} விழாவில் தாங்கள் கலந்து கொள்ள வேண்டுகிறோம்.",
      ],
    },
    blessings: [
      "வந்து வருங்கால அன்னைக்கு ஆசி வழங்குங்கள்.",
      "உங்கள் ஆசியே எங்களுக்கு மிகப்பெரிய பரிசு.",
      "வாழ்த்துக்களை மட்டும் கொண்டு வாருங்கள், வேறு எதுவும் வேண்டாம்.",
      "விருந்து, சிரிப்பு, பேச்சு — கட்டாயம் வாருங்கள்.",
    ],
    closings: {
      warm: "நீங்கள் வந்தால் மிக்க மகிழ்ச்சி.",
      traditional: "தயவுசெய்து வருகை தந்து ஆசி வழங்குங்கள்.",
      playful: "பசியுடன் வாருங்கள், மகிழ்ச்சியுடன் செல்லுங்கள். பரிசு வேண்டாம்!",
      formal: "தங்கள் வருகை எங்களுக்குப் பெருமை.",
    },
  },
};

/* ------------------------------------------------------------------ *
 * Date & time formatting (pure — the caller supplies the values)
 * ------------------------------------------------------------------ */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK = /^(\d{1,2}):(\d{2})$/;

/** Format an ISO date (YYYY-MM-DD) as a long localised date, in UTC. */
export function formatEventDate(dateISO, locale = "en-IN") {
  const match = ISO_DATE.exec(String(dateISO ?? "").trim());
  if (!match) return { error: "Pick the event date." };
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const dt = new Date(stamp);
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return { error: "That calendar date does not exist." };
  }
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
    text = `${day}/${month}/${year}`;
  }
  return { text, weekday: dt.getUTCDay() };
}

/** Format a 24-hour HH:MM string as 12-hour clock text. */
export function formatEventTime(raw) {
  const match = CLOCK.exec(String(raw ?? "").trim());
  if (!match) return { error: "Enter the start time as HH:MM." };
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return { error: "Enter a real clock time (00:00 to 23:59)." };
  const suffix = hours < 12 ? "AM" : "PM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return { text: `${h12}:${String(minutes).padStart(2, "0")} ${suffix}`, hours24: hours };
}

/* ------------------------------------------------------------------ *
 * Compose
 * ------------------------------------------------------------------ */

function clean(value, limit) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function fill(template, tokens) {
  return String(template).replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : whole,
  );
}

/**
 * Build up to MAX_VARIANTS complete invitations.
 *
 * @returns {{variants: Array<{id:number,text:string,stats:object}>, ceremony:string,
 *            dateText:string, timeText:string}|{error:string}}
 */
export function buildInvitations({
  honoree = "",
  hosts = "",
  ceremony = "godh-bharai",
  tone = "warm",
  language = "en",
  dateISO = "",
  time = "",
  venue = "",
  rsvp = "",
  note = "",
  seed = 1,
  count = 3,
} = {}) {
  const pack = PACKS[language] ?? PACKS.en;
  const localeEntry = LANGUAGES.find((item) => item.id === language) ?? LANGUAGES[0];
  const ceremonyEntry = CEREMONIES.find((item) => item.id === ceremony) ?? CEREMONIES[0];
  const toneId = TONES.some((item) => item.id === tone) ? tone : "warm";

  const honoreeName = clean(honoree, MAX_NAME_LENGTH);
  if (!honoreeName) return { error: "Add the mother-to-be's name (or the couple's names)." };

  const hostNames = clean(hosts, MAX_NAME_LENGTH);
  const venueText = clean(venue, MAX_NAME_LENGTH * 2);
  if (!venueText) return { error: "Add a venue so guests know where to come." };

  const rsvpText = clean(rsvp, MAX_NAME_LENGTH);
  const noteText = clean(note, MAX_NOTE_LENGTH);

  const dateResult = formatEventDate(dateISO, localeEntry.locale);
  if (dateResult.error) return { error: dateResult.error };
  const timeResult = formatEventTime(time);
  if (timeResult.error) return { error: timeResult.error };

  const wanted = Math.max(1, Math.min(MAX_VARIANTS, Math.round(Number(count) || 1)));
  const rng = mulberry32(Math.abs(Math.round(Number(seed) || 0)) + 1);
  const openerOffset = Math.floor(rng() * 997);
  const blessingOffset = Math.floor(rng() * 997);

  const tokens = {
    honoree: honoreeName,
    hosts: hostNames,
    ceremony: ceremonyEntry.label,
  };

  const variants = [];
  for (let step = 0; step < wanted; step += 1) {
    const opener = fill(rotate(pack.openers[toneId], openerOffset, step), tokens);
    const blessing = fill(rotate(pack.blessings, blessingOffset, step), tokens);
    const closing = fill(pack.closings[toneId], tokens);

    const lines = [
      `${ceremonyEntry.label} — ${honoreeName}`,
      "",
      opener,
      blessing,
      "",
      `${pack.labels.date}: ${dateResult.text}`,
      `${pack.labels.time}: ${timeResult.text}`,
      `${pack.labels.venue}: ${venueText}`,
    ];
    if (rsvpText) lines.push(`${pack.labels.rsvp}: ${rsvpText}`);
    if (noteText) lines.push("", noteText);
    lines.push("", closing);
    if (hostNames) lines.push(`${pack.labels.hostedBy} ${hostNames}`);

    const text = lines.join("\n");
    variants.push({ id: step + 1, text, stats: messageStats(text) });
  }

  return {
    variants,
    ceremony: ceremonyEntry.label,
    ceremonyNote: ceremonyEntry.note,
    dateText: dateResult.text,
    timeText: timeResult.text,
  };
}
