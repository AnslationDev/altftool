/**
 * Mothers Day message generator - pure, deterministic text builder.
 *
 * No React, no DOM, no Math.random, no Date.now. Variety comes from an integer
 * seed supplied by the caller, so identical input gives identical output.
 *
 * Date rules referenced:
 *  - In India, the United States, Australia, Canada, Japan and most of Europe,
 *    Mother's Day falls on the second Sunday of May, so its calendar date moves
 *    every year. It is computed here from a year rather than hard-coded.
 *  - In the United Kingdom and Ireland the day is Mothering Sunday, the fourth
 *    Sunday of Lent, which is a different date entirely.
 *  - In much of the Arab world it is 21 March; in Indonesia, Hari Ibu is
 *    22 December. Those fixed dates are listed for reference only.
 *
 * Message length rules used by the counter:
 *  - GSM-7 encoded SMS fits 160 characters in one segment.
 *  - Any non-Latin character forces UCS-2, which fits 70 per segment.
 *  - WhatsApp text status allows up to 700 characters.
 */

/** Ordinal of the Sunday in May that most countries observe (second Sunday). */
export const MOTHERS_DAY_SUNDAY_OF_MAY = 2;

/** Single-segment SMS length for plain Latin (GSM-7) text. */
export const SMS_GSM7_LIMIT = 160;

/** Single-segment SMS length once any non-Latin character forces UCS-2. */
export const SMS_UNICODE_LIMIT = 70;

/** Maximum length of a WhatsApp text status. */
export const WHATSAPP_STATUS_LIMIT = 700;

export const MIN_MESSAGES = 1;
export const MAX_MESSAGES = 6;

/**
 * Tone controls the shape of the message and whether the affectionate closing
 * line is used at all. Every tone addresses your own mother directly - the
 * wording uses the familiar register, which is what a message to your own
 * mother takes in each of these languages.
 */
export const TONES = [
  { id: "oneliner", label: "One-liner", lineCount: 1, useAddress: true, useCloser: false, allowAffection: true },
  { id: "heartfelt", label: "Heartfelt", lineCount: 2, useAddress: true, useCloser: true, allowAffection: true },
  {
    id: "card",
    label: "Full card",
    lineCount: 3,
    useAddress: true,
    useCloser: true,
    allowAffection: true,
    // A card uses every line, so it must keep the authored order - the
    // affectionate line belongs last. Variety comes from the closing line only.
    fixedOrder: true,
  },
  {
    id: "understated",
    label: "Understated - skips the “I love you” line",
    lineCount: 2,
    useAddress: false,
    useCloser: true,
    allowAffection: false,
  },
];

/**
 * Punctuation differs by language: Spanish opens an exclamation with an
 * inverted mark, French puts a space before it, and Japanese uses full-width
 * marks, an ideographic comma and no spaces between sentences.
 */
const DEFAULT_PUNCT = {
  open: "",
  bang: "!",
  beforeBang: "",
  comma: ", ",
  joiner: " ",
  addressFirst: false,
  salutationSuffix: ",",
};

const PUNCT_OVERRIDES = {
  es: { open: "¡" },
  fr: { beforeBang: " " },
  ja: {
    bang: "！",
    comma: "、",
    joiner: "",
    addressFirst: true,
    salutationSuffix: "へ",
  },
};

export const LANGUAGES = [
  {
    id: "en",
    label: "English",
    motherWord: "Mom",
    greeting: "Happy Mother's Day",
    lines: [
      "Thank you for everything you do without ever being asked.",
      "Most of what I manage today, I learnt by watching you.",
      "I do not say it often enough - thank you, and I love you.",
    ],
    closers: ["Happy Mother's Day.", "With all my love."],
  },
  {
    id: "hi",
    label: "Hindi (हिन्दी)",
    motherWord: "माँ",
    greeting: "मातृ दिवस की हार्दिक शुभकामनाएं",
    lines: [
      "बिना कहे आप जो कुछ करती हैं, उसके लिए धन्यवाद।",
      "आज मैं जो कुछ कर पाता हूँ, वह आपको देखकर ही सीखा है।",
      "मैं यह अक्सर नहीं कहता - धन्यवाद, और मैं आपसे बहुत प्यार करता हूँ।",
    ],
    closers: ["मातृ दिवस की शुभकामनाएं।", "ढेर सारा प्यार।"],
  },
  {
    id: "mr",
    label: "Marathi (मराठी)",
    motherWord: "आई",
    greeting: "मातृदिनाच्या हार्दिक शुभेच्छा",
    lines: [
      "न सांगता तू जे सगळं करतेस, त्याबद्दल मनापासून आभार.",
      "आज मला जे जमतं, ते तुला बघूनच शिकलो.",
      "मी हे नेहमी बोलत नाही - धन्यवाद, आणि माझं तुझ्यावर खूप प्रेम आहे.",
    ],
    closers: ["मातृदिनाच्या शुभेच्छा.", "खूप सारं प्रेम."],
  },
  {
    id: "bn",
    label: "Bengali (বাংলা)",
    motherWord: "মা",
    greeting: "মাতৃ দিবসের আন্তরিক শুভেচ্ছা",
    lines: [
      "না বলতেই তুমি যা কিছু করো, তার জন্য ধন্যবাদ।",
      "আজ আমি যা কিছু পারি, তোমাকে দেখেই শিখেছি।",
      "এটা আমি প্রায়ই বলি না - ধন্যবাদ, আর তোমাকে খুব ভালোবাসি।",
    ],
    closers: ["শুভ মাতৃ দিবস।", "অনেক ভালোবাসা।"],
  },
  {
    id: "ta",
    label: "Tamil (தமிழ்)",
    motherWord: "அம்மா",
    greeting: "அன்னையர் தின வாழ்த்துக்கள்",
    lines: [
      "சொல்லாமலேயே நீ செய்யும் அனைத்திற்கும் நன்றி.",
      "இன்று நான் செய்யக்கூடிய பெரும்பாலானவை உன்னைப் பார்த்தே கற்றுக்கொண்டேன்.",
      "இதை நான் அடிக்கடி சொல்வதில்லை - நன்றி, உன்னை ரொம்ப நேசிக்கிறேன்.",
    ],
    closers: ["இனிய அன்னையர் தினம்.", "நிறைய அன்புடன்."],
  },
  {
    id: "te",
    label: "Telugu (తెలుగు)",
    motherWord: "అమ్మ",
    greeting: "మాతృ దినోత్సవ శుభాకాంక్షలు",
    lines: [
      "చెప్పకుండానే నువ్వు చేసే ప్రతిదానికీ ధన్యవాదాలు.",
      "ఈరోజు నేను చేయగలిగినవన్నీ నిన్ను చూసే నేర్చుకున్నాను.",
      "ఇది నేను తరచుగా చెప్పను - ధన్యవాదాలు, నిన్ను చాలా ప్రేమిస్తున్నాను.",
    ],
    closers: ["మాతృ దినోత్సవ శుభాకాంక్షలు.", "ఎంతో ప్రేమతో."],
  },
  {
    id: "kn",
    label: "Kannada (ಕನ್ನಡ)",
    motherWord: "ಅಮ್ಮ",
    greeting: "ಮಾತೃ ದಿನದ ಶುಭಾಶಯಗಳು",
    lines: [
      "ಹೇಳದೆಯೇ ನೀನು ಮಾಡುವ ಎಲ್ಲದಕ್ಕೂ ಧನ್ಯವಾದಗಳು.",
      "ಇಂದು ನನಗೆ ಸಾಧ್ಯವಾಗುವ ಬಹುಪಾಲು ನಿನ್ನನ್ನು ನೋಡಿಯೇ ಕಲಿತದ್ದು.",
      "ಇದನ್ನು ನಾನು ಆಗಾಗ ಹೇಳುವುದಿಲ್ಲ - ಧನ್ಯವಾದಗಳು, ನಿನ್ನನ್ನು ತುಂಬಾ ಪ್ರೀತಿಸುತ್ತೇನೆ.",
    ],
    closers: ["ಶುಭ ಮಾತೃ ದಿನ.", "ಬಹಳ ಪ್ರೀತಿಯಿಂದ."],
  },
  {
    id: "ml",
    label: "Malayalam (മലയാളം)",
    motherWord: "അമ്മ",
    greeting: "മാതൃദിന ആശംസകൾ",
    lines: [
      "പറയാതെ തന്നെ നീ ചെയ്യുന്ന എല്ലാത്തിനും നന്ദി.",
      "ഇന്ന് എനിക്ക് ചെയ്യാൻ കഴിയുന്നതിൽ ഏറെയും നിന്നെ കണ്ടു പഠിച്ചതാണ്.",
      "ഇത് ഞാൻ പലപ്പോഴും പറയാറില്ല - നന്ദി, നിന്നെ ഒരുപാട് സ്നേഹിക്കുന്നു.",
    ],
    closers: ["മാതൃദിന ആശംസകൾ.", "ഒരുപാട് സ്നേഹത്തോടെ."],
  },
  {
    id: "gu",
    label: "Gujarati (ગુજરાતી)",
    motherWord: "મમ્મી",
    greeting: "માતૃ દિનની હાર્દિક શુભેચ્છા",
    lines: [
      "કહ્યા વગર તું જે બધું કરે છે, તે માટે આભાર.",
      "આજે હું જે કંઈ કરી શકું છું, તે તને જોઈને જ શીખ્યો છું.",
      "હું આ વારંવાર કહેતો નથી - આભાર, અને તને ખૂબ પ્રેમ કરું છું.",
    ],
    closers: ["શુભ માતૃ દિન.", "ખૂબ પ્રેમ સાથે."],
  },
  {
    id: "pa",
    label: "Punjabi (ਪੰਜਾਬੀ)",
    motherWord: "ਮਾਂ",
    greeting: "ਮਾਂ ਦਿਵਸ ਦੀਆਂ ਦਿਲੋਂ ਸ਼ੁਭਕਾਮਨਾਵਾਂ",
    lines: [
      "ਬਿਨਾਂ ਕਹੇ ਤੂੰ ਜੋ ਕੁਝ ਕਰਦੀ ਹੈਂ, ਉਸ ਲਈ ਸ਼ੁਕਰੀਆ।",
      "ਅੱਜ ਮੈਂ ਜੋ ਕੁਝ ਕਰ ਸਕਦਾ ਹਾਂ, ਉਹ ਤੈਨੂੰ ਵੇਖ ਕੇ ਹੀ ਸਿੱਖਿਆ ਹੈ।",
      "ਮੈਂ ਇਹ ਅਕਸਰ ਨਹੀਂ ਕਹਿੰਦਾ - ਸ਼ੁਕਰੀਆ, ਤੇ ਮੈਂ ਤੈਨੂੰ ਬਹੁਤ ਪਿਆਰ ਕਰਦਾ ਹਾਂ।",
    ],
    closers: ["ਮਾਂ ਦਿਵਸ ਮੁਬਾਰਕ।", "ਬਹੁਤ ਸਾਰੇ ਪਿਆਰ ਨਾਲ।"],
  },
  {
    id: "ur",
    label: "Urdu (اردو)",
    motherWord: "امی",
    greeting: "یومِ مادر مبارک",
    lines: [
      "بغیر کہے آپ جو کچھ کرتی ہیں، اس کے لیے شکریہ۔",
      "آج میں جو کچھ کر پاتا ہوں، وہ آپ کو دیکھ کر ہی سیکھا ہے۔",
      "میں یہ اکثر نہیں کہتا - شکریہ، اور مجھے آپ سے بہت محبت ہے۔",
    ],
    closers: ["یومِ مادر مبارک۔", "ڈھیر سارا پیار۔"],
  },
  {
    id: "ne",
    label: "Nepali (नेपाली)",
    motherWord: "आमा",
    greeting: "मातृ दिवसको हार्दिक शुभकामना",
    lines: [
      "नभनिकनै तपाईंले गर्नुहुने सबै कुराका लागि धन्यवाद।",
      "आज म जे गर्न सक्छु, त्यो तपाईंलाई हेरेरै सिकेको हुँ।",
      "म यो बारम्बार भन्दिनँ - धन्यवाद, र म तपाईंलाई धेरै माया गर्छु।",
    ],
    closers: ["मातृ दिवसको शुभकामना।", "धेरै मायाका साथ।"],
  },
  {
    id: "es",
    label: "Spanish (Español)",
    motherWord: "Mamá",
    greeting: "Feliz Día de la Madre",
    lines: [
      "Gracias por todo lo que haces sin que nadie te lo pida.",
      "Casi todo lo que sé hacer hoy lo aprendí mirándote.",
      "No lo digo lo suficiente: gracias, y te quiero mucho.",
    ],
    closers: ["Feliz Día de la Madre.", "Con todo mi cariño."],
  },
  {
    id: "fr",
    label: "French (Français)",
    motherWord: "Maman",
    greeting: "Bonne fête des Mères",
    lines: [
      "Merci pour tout ce que tu fais sans qu'on te le demande.",
      "Presque tout ce que je sais faire aujourd'hui, je l'ai appris en te regardant.",
      "Je ne le dis pas assez : merci, et je t'aime beaucoup.",
    ],
    closers: ["Bonne fête des Mères.", "Avec tout mon amour."],
  },
  {
    id: "de",
    label: "German (Deutsch)",
    motherWord: "Mama",
    greeting: "Alles Liebe zum Muttertag",
    lines: [
      "Danke für alles, was du tust, ohne dass jemand darum bittet.",
      "Das meiste, was ich heute kann, habe ich gelernt, indem ich dir zugesehen habe.",
      "Ich sage es zu selten: danke, und ich habe dich sehr lieb.",
    ],
    closers: ["Alles Liebe zum Muttertag.", "In Liebe."],
  },
  {
    id: "pt",
    label: "Portuguese (Português)",
    motherWord: "Mãe",
    greeting: "Feliz Dia das Mães",
    lines: [
      "Obrigado por tudo o que você faz sem ninguém pedir.",
      "Quase tudo o que sei fazer hoje aprendi olhando para você.",
      "Não digo isto o suficiente: obrigado, e amo muito você.",
    ],
    closers: ["Feliz Dia das Mães.", "Com todo o meu amor."],
  },
  {
    id: "it",
    label: "Italian (Italiano)",
    motherWord: "Mamma",
    greeting: "Buona Festa della Mamma",
    lines: [
      "Grazie per tutto quello che fai senza che nessuno te lo chieda.",
      "Quasi tutto quello che so fare oggi l'ho imparato guardando te.",
      "Non lo dico abbastanza spesso: grazie, e ti voglio tanto bene.",
    ],
    closers: ["Buona Festa della Mamma.", "Con tutto il mio affetto."],
  },
  {
    id: "nl",
    label: "Dutch (Nederlands)",
    motherWord: "Mama",
    greeting: "Fijne Moederdag",
    lines: [
      "Bedankt voor alles wat je doet zonder dat iemand erom vraagt.",
      "Bijna alles wat ik nu kan, heb ik geleerd door naar jou te kijken.",
      "Ik zeg het te weinig: bedankt, en ik hou heel veel van je.",
    ],
    closers: ["Fijne Moederdag.", "Met veel liefs."],
  },
  {
    id: "id",
    label: "Indonesian (Bahasa Indonesia)",
    motherWord: "Ibu",
    greeting: "Selamat Hari Ibu",
    lines: [
      "Terima kasih untuk semua yang Ibu lakukan tanpa diminta.",
      "Hampir semua yang bisa saya lakukan sekarang, saya pelajari dari melihat Ibu.",
      "Saya jarang mengatakannya: terima kasih, dan saya sangat menyayangi Ibu.",
    ],
    closers: ["Selamat Hari Ibu.", "Dengan penuh sayang."],
  },
  {
    id: "ja",
    label: "Japanese (日本語)",
    motherWord: "お母さん",
    greeting: "母の日おめでとう",
    lines: [
      "何も言わなくてもしてくれること、本当にありがとう。",
      "今の私ができることのほとんどは、お母さんを見て覚えました。",
      "あまり言わないけれど、ありがとう。大好きです。",
    ],
    closers: ["いつもありがとう。", "感謝を込めて。"],
  },
];

// GSM 03.38 / 3GPP TS 23.038 7-bit default alphabet (basic table) plus the
// extension table reached with the escape character. Every character below
// fits a GSM-7 SMS; anything outside this set is what actually forces UCS-2.
// This includes accented Latin letters that are natively part of GSM-7 - such
// as u-umlaut, a-umlaut, o-umlaut, sharp s, a-grave, e-acute, e-grave and the
// rest of the accented set used by French, German, Spanish and Portuguese.
const GSM_7BIT_BASIC_CHARS =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_7BIT_EXTENDED_CHARS = "\f^{}\\[~]|€";
const GSM_7BIT_CHARS = new Set([...GSM_7BIT_BASIC_CHARS, ...GSM_7BIT_EXTENDED_CHARS]);

const byId = (list, id) => list.find((item) => item.id === id) || null;

const clean = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");

/** Deterministic 32-bit mixer - the same seed always yields the same stream. */
function mix(seed, salt) {
  let h = (Math.trunc(seed) ^ (salt * 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** Character count plus SMS segment count under GSM-7 / UCS-2 rules. */
export function measureMessage(text) {
  const characters = Array.from(String(text || ""));
  const length = characters.length;
  const isUnicode = characters.some((ch) => !GSM_7BIT_CHARS.has(ch));
  const smsLimit = isUnicode ? SMS_UNICODE_LIMIT : SMS_GSM7_LIMIT;
  return {
    length,
    isUnicode,
    smsLimit,
    smsSegments: length === 0 ? 0 : Math.ceil(length / smsLimit),
    fitsOneSms: length > 0 && length <= smsLimit,
    fitsWhatsAppStatus: length <= WHATSAPP_STATUS_LIMIT,
  };
}

/**
 * The date of Mother's Day in a given year for countries that use the second
 * Sunday of May. Returns "YYYY-MM-DD", or an empty string for a bad year.
 */
export function secondSundayOfMay(year) {
  const value = Number(year);
  if (!Number.isFinite(value)) return "";
  const y = Math.trunc(value);
  if (y < 1583 || y > 4000) return "";
  const firstOfMay = new Date(Date.UTC(y, 4, 1));
  const firstSundayDay = 1 + ((7 - firstOfMay.getUTCDay()) % 7);
  const day = firstSundayDay + 7 * (MOTHERS_DAY_SUNDAY_OF_MAY - 1);
  return `${y}-05-${String(day).padStart(2, "0")}`;
}

/** How many distinct messages a language + tone combination produces. */
export function variantCountFor(languageId, toneId) {
  const language = byId(LANGUAGES, languageId);
  const tone = byId(TONES, toneId);
  if (!language || !tone) return 0;
  const poolSize = tone.allowAffection ? language.lines.length : language.lines.length - 1;
  if (poolSize < tone.lineCount) return 0;
  if (tone.fixedOrder) return tone.useCloser ? language.closers.length : 1;
  return tone.useCloser ? poolSize * language.closers.length : poolSize;
}

/**
 * Build Mothers Day messages.
 *
 * @param {object} input
 * @param {string} [input.languageId]  One of LANGUAGES ids.
 * @param {string} [input.toneId]      One of TONES ids.
 * @param {string} [input.address]     How you address her; defaults to the language's word.
 * @param {string} [input.senderName]  Signed at the end.
 * @param {number} [input.count]       How many variants, 1 to 6.
 * @param {number} [input.seed]        Integer that shuffles the variants.
 * @returns {{error:string}|object}
 */
export function generateMothersDayMessages(input) {
  const data = input && typeof input === "object" ? input : {};

  const language = byId(LANGUAGES, data.languageId);
  if (!language) return { error: "Pick a language for the message." };

  const tone = byId(TONES, data.toneId);
  if (!tone) return { error: "Pick a tone for the message." };

  const senderName = clean(data.senderName);
  const addressInput = clean(data.address);
  if (addressInput.length > 40) return { error: "That form of address is too long - keep it under 40 characters." };
  if (senderName.length > 40) return { error: "Your name is too long - keep it under 40 characters." };

  const countRaw = data.count == null || data.count === "" ? 3 : Number(data.count);
  if (!Number.isFinite(countRaw)) return { error: "Number of messages must be a whole number." };
  const count = Math.round(countRaw);
  if (count < MIN_MESSAGES || count > MAX_MESSAGES) {
    return { error: `Choose between ${MIN_MESSAGES} and ${MAX_MESSAGES} messages at a time.` };
  }

  const seedRaw = data.seed == null || data.seed === "" ? 1 : Number(data.seed);
  if (!Number.isFinite(seedRaw)) return { error: "Seed must be a number." };
  const seed = Math.trunc(seedRaw);

  const maxVariants = variantCountFor(language.id, tone.id);
  if (maxVariants === 0) return { error: "No wording is available for that combination yet." };
  if (count > maxVariants) {
    return { error: `This language and tone give ${maxVariants} distinct messages - lower the count.` };
  }

  // The affectionate closing line is the last one; a respectful message to
  // someone else's mother must never use it.
  const pool = tone.allowAffection ? language.lines : language.lines.slice(0, language.lines.length - 1);
  const closers = language.closers;
  const address = addressInput || language.motherWord;
  const greeting = language.greeting;
  const punct = { ...DEFAULT_PUNCT, ...(PUNCT_OVERRIDES[language.id] || {}) };

  const lineOffset = mix(seed, 1) % pool.length;
  const closerOffset = mix(seed, 101) % closers.length;

  const messages = [];
  for (let index = 0; index < count; index += 1) {
    const position = tone.fixedOrder ? 0 : lineOffset + index;
    const body = [];
    for (let step = 0; step < tone.lineCount; step += 1) {
      body.push(pool[(position + step) % pool.length]);
    }
    const closer = tone.fixedOrder
      ? closers[(closerOffset + index) % closers.length]
      : closers[(closerOffset + Math.floor(position / pool.length)) % closers.length];

    const greetingWithAddress = punct.addressFirst
      ? `${punct.open}${address}${punct.comma}${greeting}${punct.beforeBang}${punct.bang}`
      : `${punct.open}${greeting}${punct.comma}${address}${punct.beforeBang}${punct.bang}`;
    const greetingAlone = `${punct.open}${greeting}${punct.beforeBang}${punct.bang}`;

    let text;
    if (tone.id === "oneliner") {
      // punct.joiner is always a defined string here (DEFAULT_PUNCT sets it,
      // and PUNCT_OVERRIDES only ever replaces it with another string) - an
      // "|| ' '" fallback would silently override Japanese's deliberate ""
      // joiner, since an empty string is falsy in JS.
      text = `${greetingWithAddress}${punct.joiner}${body[0]}`;
    } else if (tone.id === "card") {
      text = [`${address}${punct.salutationSuffix}`, greetingAlone, ...body, closer].join("\n\n");
    } else if (tone.id === "understated") {
      text = [greetingAlone, body.join(punct.joiner), closer].join("\n\n");
    } else {
      text = [greetingWithAddress, body.join(punct.joiner), closer].join("\n\n");
    }

    if (senderName) text += `\n\n- ${senderName}`;

    messages.push({
      id: `${language.id}-${tone.id}-${index}`,
      text,
      ...measureMessage(text),
    });
  }

  const longestLength = messages.reduce((max, item) => (item.length > max ? item.length : max), 0);

  return {
    language,
    tone,
    seed,
    count,
    messages,
    longestLength,
    variantsAvailable: maxVariants,
    addressUsed: tone.useAddress ? address : "",
    greetingUsed: greeting,
  };
}
