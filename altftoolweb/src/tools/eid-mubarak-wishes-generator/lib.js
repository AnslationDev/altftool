/**
 * Eid greeting composer.
 *
 * Calendar facts used in the notes below (informational, not religious guidance):
 *  - Eid al-Fitr falls on 1 Shawwal, the day after Ramadan ends; Eid al-Adha falls on
 *    10 Dhu al-Hijjah, during the days of Hajj.
 *  - The Hijri year is lunar and runs about 354 days, roughly 11 days shorter than the
 *    Gregorian year, so both Eids move about 10 to 11 days earlier every Gregorian year.
 *  - The exact date in each country still depends on the local moon sighting, which is why
 *    neighbouring countries can celebrate a day apart.
 *  - Zakat al-Fitr is given before the Eid al-Fitr prayer.
 *
 * Message length is scored with the real SMS rules from 3GPP TS 23.038: text that fits the
 * GSM 03.38 seven-bit alphabet gets 160 characters in a single message and 153 per part when
 * concatenated; anything containing other characters (Urdu, Devanagari, Bengali, emoji and so
 * on) is sent as UCS-2, which allows 70 characters single and 67 per concatenated part.
 *
 * Pure module: no DOM, no React, no clock reads, no unseeded randomness.
 */

/** GSM 03.38 default alphabet — one septet each. */
const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/** GSM 03.38 extension table — two septets each (escape + character). */
const GSM7_EXTENDED = "^{}\\[~]|€";

const GSM7_BASIC_SET = new Set([...GSM7_BASIC]);
const GSM7_EXTENDED_SET = new Set([...GSM7_EXTENDED]);

export const SMS_GSM7_SINGLE = 160;
export const SMS_GSM7_CONCAT = 153;
export const SMS_UCS2_SINGLE = 70;
export const SMS_UCS2_CONCAT = 67;

/** Approximate drift of the Hijri lunar year against the Gregorian year, in days. */
export const HIJRI_DRIFT_DAYS_PER_YEAR = 11;

/**
 * Score a message the way a mobile network does.
 * @returns {{encoding:string, units:number, segments:number, perSegment:number, remaining:number}}
 */
export function analyzeSms(text) {
  const value = typeof text === "string" ? text : "";
  let septets = 0;
  let gsm = true;
  for (const char of value) {
    if (GSM7_BASIC_SET.has(char)) {
      septets += 1;
    } else if (GSM7_EXTENDED_SET.has(char)) {
      septets += 2;
    } else {
      gsm = false;
      break;
    }
  }

  if (gsm) {
    const segments = septets <= SMS_GSM7_SINGLE ? 1 : Math.ceil(septets / SMS_GSM7_CONCAT);
    const perSegment = segments === 1 ? SMS_GSM7_SINGLE : SMS_GSM7_CONCAT;
    return {
      encoding: "GSM-7",
      units: septets,
      segments: Math.max(1, segments),
      perSegment,
      remaining: Math.max(0, perSegment * Math.max(1, segments) - septets),
    };
  }

  // UCS-2 counts UTF-16 code units, so an emoji outside the BMP costs two.
  const units = value.length;
  const segments = units <= SMS_UCS2_SINGLE ? 1 : Math.ceil(units / SMS_UCS2_CONCAT);
  const perSegment = segments === 1 ? SMS_UCS2_SINGLE : SMS_UCS2_CONCAT;
  return {
    encoding: "UCS-2",
    units,
    segments: Math.max(1, segments),
    perSegment,
    remaining: Math.max(0, perSegment * Math.max(1, segments) - units),
  };
}

export const TONES = [
  { id: "formal", label: "Formal — elders, clients, seniors" },
  { id: "warm", label: "Warm — family and close friends" },
  { id: "short", label: "Short — status, broadcast, card" },
  { id: "devotional", label: "Devotional — prayer and blessing" },
];

export const OCCASIONS = [
  {
    id: "fitr",
    label: "Eid al-Fitr (after Ramadan)",
    note: "Eid al-Fitr falls on 1 Shawwal, the day after Ramadan ends. Zakat al-Fitr is given before the Eid prayer.",
  },
  {
    id: "adha",
    label: "Eid al-Adha / Bakrid (Hajj days)",
    note: "Eid al-Adha falls on 10 Dhu al-Hijjah, during the days of Hajj, and is followed by the three days of Tashriq.",
  },
];

export const EMOJI = "🌙✨";

/**
 * Greetings by language. Every entry carries the native text and a Roman transliteration.
 * "Eid Mubarak" is used for both Eids, which is why the occasion does not change the wording.
 */
export const LANGUAGES = [
  {
    id: "en",
    label: "English",
    native: "English",
    dir: "ltr",
    messages: {
      formal:
        "Eid Mubarak. May this Eid bring you and your family peace, good health and quiet prosperity through the year ahead.",
      warm: "Eid Mubarak! Wishing you a table full of sewaiyan, a house full of laughter and a year full of good news.",
      short: "Eid Mubarak to you and your family.",
      devotional:
        "Eid Mubarak. May your fasts, prayers and charity be accepted, and may the blessings of this day stay with your home.",
    },
  },
  {
    id: "ur",
    label: "Urdu",
    native: "اردو",
    dir: "rtl",
    messages: {
      formal: "عید مبارک۔ اللہ آپ کو اور آپ کے اہلِ خانہ کو صحت، سکون اور برکتوں سے نوازے۔",
      warm: "عید مبارک! آپ کا دن سویوں، ہنسی اور اپنوں کے ساتھ گزرے۔",
      short: "آپ کو عید مبارک ہو۔",
      devotional: "تقبل اللہ منا و منکم۔ عید مبارک۔",
    },
    roman: {
      formal: "Eid Mubarak. Allah aap ko aur aap ke ahl-e-khana ko sehat, sukoon aur barkaton se nawaze.",
      warm: "Eid Mubarak! Aap ka din sewaiyon, hansi aur apnon ke saath guzre.",
      short: "Aap ko Eid Mubarak ho.",
      devotional: "Taqabbal Allahu minna wa minkum. Eid Mubarak.",
    },
  },
  {
    id: "hi",
    label: "Hindi",
    native: "हिन्दी",
    dir: "ltr",
    messages: {
      formal: "ईद मुबारक। यह ईद आपके और आपके परिवार के लिए सेहत, सुकून और बरकत लेकर आए।",
      warm: "ईद मुबारक! आपका दिन सिवइयों, हँसी और अपनों के साथ बीते।",
      short: "आपको और आपके परिवार को ईद मुबारक।",
      devotional: "ईद मुबारक। आपकी दुआएँ, रोज़े और ज़कात क़ुबूल हों।",
    },
    roman: {
      formal: "Eid Mubarak. Yah Eid aapke aur aapke parivaar ke liye sehat, sukoon aur barkat lekar aaye.",
      warm: "Eid Mubarak! Aapka din sivaiyon, hansi aur apnon ke saath beete.",
      short: "Aapko aur aapke parivaar ko Eid Mubarak.",
      devotional: "Eid Mubarak. Aapki duaayen, roze aur zakat qubool hon.",
    },
  },
  {
    id: "ar",
    label: "Arabic",
    native: "العربية",
    dir: "rtl",
    messages: {
      formal: "عيد مبارك. كل عام وأنتم بخير.",
      warm: "عيد سعيد! أعاده الله عليكم بالصحة والسعادة.",
      short: "عيد مبارك.",
      devotional: "تقبل الله منا ومنكم صالح الأعمال.",
    },
    roman: {
      formal: "Eid Mubarak. Kullu 'aam wa antum bi-khair.",
      warm: "Eid sa'eed! A'adahu Allahu 'alaykum bis-sihha was-sa'ada.",
      short: "Eid Mubarak.",
      devotional: "Taqabbal Allahu minna wa minkum salih al-a'mal.",
    },
  },
  {
    id: "bn",
    label: "Bengali",
    native: "বাংলা",
    dir: "ltr",
    messages: {
      formal: "ঈদ মোবারক। এই ঈদ আপনার ও আপনার পরিবারের জন্য শান্তি ও সুস্থতা বয়ে আনুক।",
      warm: "ঈদ মোবারক! সেমাই, হাসি আর প্রিয়জনে ভরে উঠুক আপনার দিন।",
      short: "ঈদ মোবারক।",
      devotional: "ঈদ মোবারক। আল্লাহ আপনার রোজা ও দোয়া কবুল করুন।",
    },
    roman: {
      formal: "Eid Mobarak. Ei Eid apnar o apnar poribarer jonno shanti o sushthota boye anuk.",
      warm: "Eid Mobarak! Semai, hasi ar priyojone bhore uthuk apnar din.",
      short: "Eid Mobarak.",
      devotional: "Eid Mobarak. Allah apnar roja o doa kobul korun.",
    },
  },
  {
    id: "ta",
    label: "Tamil",
    native: "தமிழ்",
    dir: "ltr",
    messages: {
      formal:
        "ஈத் நல்வாழ்த்துக்கள். இந்த ஈத் உங்களுக்கும் உங்கள் குடும்பத்திற்கும் நலமும் அமைதியும் தரட்டும்.",
      warm: "ஈத் நல்வாழ்த்துக்கள்! உங்கள் நாள் இனிப்பும் சிரிப்பும் நிறைந்ததாக இருக்கட்டும்.",
      short: "ஈத் முபாரக்.",
      devotional: "ஈத் முபாரக். உங்கள் நோன்பும் தொழுகையும் ஏற்கப்படட்டும்.",
    },
    roman: {
      formal:
        "Eid nalvazhthukkal. Indha Eid ungalukkum ungal kudumbathirkum nalamum amaidhiyum tharattum.",
      warm: "Eid nalvazhthukkal! Ungal naal inippum sirippum niraindhadhaaga irukkattum.",
      short: "Eid Mubarak.",
      devotional: "Eid Mubarak. Ungal nonbum tholugaiyum erkappadattum.",
    },
  },
  {
    id: "te",
    label: "Telugu",
    native: "తెలుగు",
    dir: "ltr",
    messages: {
      formal: "ఈద్ ముబారక్. ఈ పండుగ మీకు, మీ కుటుంబానికి ఆరోగ్యం, శాంతి తీసుకురావాలి.",
      warm: "ఈద్ శుభాకాంక్షలు! మీ ఇల్లు నవ్వులతో, తీపితో నిండిపోవాలి.",
      short: "ఈద్ ముబారక్.",
      devotional: "ఈద్ ముబారక్. మీ ఉపవాసాలు, ప్రార్థనలు స్వీకరించబడాలి.",
    },
    roman: {
      formal: "Eid Mubarak. Ee panduga meeku, mee kutumbaniki aarogyam, shanti teesukuravaali.",
      warm: "Eid shubhakankshalu! Mee illu navvulato, teepito nindipovaali.",
      short: "Eid Mubarak.",
      devotional: "Eid Mubarak. Mee upavaasalu, prarthanalu sweekarinchabadaali.",
    },
  },
  {
    id: "ml",
    label: "Malayalam",
    native: "മലയാളം",
    dir: "ltr",
    messages: {
      formal: "ഈദ് ആശംസകൾ. ഈ ഈദ് നിങ്ങൾക്കും കുടുംബത്തിനും ആരോഗ്യവും സമാധാനവും നൽകട്ടെ.",
      warm: "ഈദ് ആശംസകൾ! നിങ്ങളുടെ വീട് ചിരിയും മധുരവും കൊണ്ട് നിറയട്ടെ.",
      short: "ഈദ് മുബാറക്.",
      devotional: "ഈദ് മുബാറക്. നിങ്ങളുടെ നോമ്പും പ്രാർത്ഥനയും സ്വീകരിക്കപ്പെടട്ടെ.",
    },
    roman: {
      formal: "Eid ashamsakal. Ee Eid ningalkkum kudumbathinum aarogyavum samaadhaanavum nalkatte.",
      warm: "Eid ashamsakal! Ningalude veedu chiriyum madhuravum kondu nirayatte.",
      short: "Eid Mubarak.",
      devotional: "Eid Mubarak. Ningalude nombum prarthanayum sweekarikkappedatte.",
    },
  },
  {
    id: "mr",
    label: "Marathi",
    native: "मराठी",
    dir: "ltr",
    messages: {
      formal: "ईद मुबारक. ही ईद तुम्हाला आणि तुमच्या कुटुंबाला आरोग्य आणि शांती देवो.",
      warm: "ईद च्या हार्दिक शुभेच्छा! तुमचा दिवस गोडवा आणि हास्याने भरून जावो.",
      short: "ईद मुबारक.",
      devotional: "ईद मुबारक. तुमचे रोजे आणि प्रार्थना स्वीकारल्या जावोत.",
    },
    roman: {
      formal: "Eid Mubarak. Hi Eid tumhala ani tumchya kutumbala aarogya ani shanti devo.",
      warm: "Eid chya hardik shubhechha! Tumcha divas godva ani hasyane bharun jaavo.",
      short: "Eid Mubarak.",
      devotional: "Eid Mubarak. Tumche roje ani prarthana sweekaralya jaavot.",
    },
  },
  {
    id: "gu",
    label: "Gujarati",
    native: "ગુજરાતી",
    dir: "ltr",
    messages: {
      formal: "ઈદ મુબારક. આ ઈદ તમને અને તમારા પરિવારને આરોગ્ય અને શાંતિ આપે.",
      warm: "ઈદ મુબારક! તમારો દિવસ મીઠાશ અને હાસ્યથી ભરેલો રહે.",
      short: "ઈદ મુબારક.",
      devotional: "ઈદ મુબારક. તમારા રોજા અને દુઆ કબૂલ થાય.",
    },
    roman: {
      formal: "Eid Mubarak. Aa Eid tamne ane tamara parivaar ne aarogya ane shanti aape.",
      warm: "Eid Mubarak! Tamaro divas mithash ane hasya thi bharelo rahe.",
      short: "Eid Mubarak.",
      devotional: "Eid Mubarak. Tamara roja ane dua kabool thaay.",
    },
  },
  {
    id: "pa",
    label: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    dir: "ltr",
    messages: {
      formal: "ਈਦ ਮੁਬਾਰਕ। ਇਹ ਈਦ ਤੁਹਾਨੂੰ ਅਤੇ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਨੂੰ ਸਿਹਤ ਅਤੇ ਸ਼ਾਂਤੀ ਦੇਵੇ।",
      warm: "ਈਦ ਮੁਬਾਰਕ! ਤੁਹਾਡਾ ਦਿਨ ਮਿਠਾਸ ਅਤੇ ਹਾਸੇ ਨਾਲ ਭਰਿਆ ਰਹੇ।",
      short: "ਈਦ ਮੁਬਾਰਕ।",
      devotional: "ਈਦ ਮੁਬਾਰਕ। ਤੁਹਾਡੇ ਰੋਜ਼ੇ ਅਤੇ ਦੁਆਵਾਂ ਕਬੂਲ ਹੋਣ।",
    },
    roman: {
      formal: "Eid Mubarak. Eh Eid tuhanu ate tuhade parivaar nu sehat ate shanti deve.",
      warm: "Eid Mubarak! Tuhada din mithaas ate haase naal bharya rahe.",
      short: "Eid Mubarak.",
      devotional: "Eid Mubarak. Tuhade roze ate duawan kabool hon.",
    },
  },
  {
    id: "kn",
    label: "Kannada",
    native: "ಕನ್ನಡ",
    dir: "ltr",
    messages: {
      formal: "ಈದ್ ಮುಬಾರಕ್. ಈ ಹಬ್ಬ ನಿಮಗೆ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಆರೋಗ್ಯ ಮತ್ತು ಶಾಂತಿ ತರಲಿ.",
      warm: "ಈದ್ ಶುಭಾಶಯಗಳು! ನಿಮ್ಮ ಮನೆ ನಗು ಮತ್ತು ಸಿಹಿಯಿಂದ ತುಂಬಲಿ.",
      short: "ಈದ್ ಮುಬಾರಕ್.",
      devotional: "ಈದ್ ಮುಬಾರಕ್. ನಿಮ್ಮ ಉಪವಾಸ ಮತ್ತು ಪ್ರಾರ್ಥನೆ ಸ್ವೀಕಾರವಾಗಲಿ.",
    },
    roman: {
      formal: "Eid Mubarak. Ee habba nimage mattu nimma kutumbakke aarogya mattu shanti tarali.",
      warm: "Eid shubhashayagalu! Nimma mane nagu mattu sihiyinda tumbali.",
      short: "Eid Mubarak.",
      devotional: "Eid Mubarak. Nimma upavaasa mattu prarthane sweekaaravaagali.",
    },
  },
];

const TONE_IDS = TONES.map((tone) => tone.id);

function findLanguage(id) {
  return LANGUAGES.find((language) => language.id === id) || null;
}

/** Names are limited so a pasted paragraph cannot become the greeting. */
export const MAX_NAME_LENGTH = 40;

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/**
 * Compose one greeting.
 *
 * @param {object} input
 * @param {string} input.languageId   One of LANGUAGES ids.
 * @param {string} input.tone         One of TONES ids.
 * @param {string} [input.recipient]  Name placed on the first line.
 * @param {string} [input.sender]     Name placed on the signature line.
 * @param {boolean} [input.includeRoman]  Add the Roman transliteration line.
 * @param {boolean} [input.includeEmoji]  Add the crescent emoji to the greeting.
 * @param {string} [input.occasion]   "fitr" or "adha" — controls the calendar note only.
 * @returns {object} greeting, or { error }.
 */
export function buildEidWish({
  languageId = "en",
  tone = "warm",
  recipient = "",
  sender = "",
  includeRoman = true,
  includeEmoji = false,
  occasion = "fitr",
} = {}) {
  const language = findLanguage(languageId);
  if (!language) return { error: "Choose a language from the list." };
  if (!TONE_IDS.includes(tone)) return { error: "Choose one of the four tones." };

  const occasionEntry = OCCASIONS.find((item) => item.id === occasion);
  if (!occasionEntry) return { error: "Choose Eid al-Fitr or Eid al-Adha." };

  const body = language.messages[tone];
  if (!body) return { error: "That tone is not available for this language yet." };

  const to = cleanName(recipient);
  const from = cleanName(sender);

  const lines = [];
  if (to) lines.push(`${to},`);
  lines.push(includeEmoji ? `${body} ${EMOJI}` : body);
  const roman = language.roman ? language.roman[tone] : "";
  if (includeRoman && roman) lines.push(`(${roman})`);
  // A hyphen is kept instead of an em dash so a plain English greeting stays inside GSM-7.
  if (from) lines.push(`- ${from}`);

  const text = lines.join("\n");
  const sms = analyzeSms(text);
  const words = text.split(/\s+/).filter(Boolean).length;

  return {
    text,
    lines,
    languageId: language.id,
    languageLabel: language.label,
    languageNative: language.native,
    direction: language.dir,
    tone,
    toneLabel: TONES.find((item) => item.id === tone)?.label ?? tone,
    occasion: occasionEntry.id,
    occasionLabel: occasionEntry.label,
    occasionNote: occasionEntry.note,
    roman,
    characters: [...text].length,
    words,
    sms,
  };
}

/**
 * One greeting per tone, in the order TONES is declared, for the chosen language.
 * Useful for "give me a few options" without any randomness.
 */
export function buildEidWishSet(options = {}) {
  const results = [];
  for (const tone of TONE_IDS) {
    const wish = buildEidWish({ ...options, tone });
    if (!wish.error) results.push(wish);
  }
  return results;
}
