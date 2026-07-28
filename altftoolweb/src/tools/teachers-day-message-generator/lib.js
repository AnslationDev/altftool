/**
 * Teachers Day message generator - pure, deterministic text builder.
 *
 * No React, no DOM, no Math.random, no Date.now. Variety comes from an integer
 * seed supplied by the caller, so identical input gives identical output.
 *
 * Dates referenced:
 *  - Teachers' Day in India is 5 September, the birthday of Dr Sarvepalli
 *    Radhakrishnan (born 5 September 1888), observed since 1962.
 *  - World Teachers' Day is 5 October, declared by UNESCO in 1994 to mark the
 *    1966 ILO/UNESCO Recommendation concerning the Status of Teachers.
 *
 * Message length rules used by the counter:
 *  - GSM-7 encoded SMS fits 160 characters in one segment.
 *  - Any Indic character forces UCS-2 encoding, which fits 70 per segment.
 *  - WhatsApp text status allows up to 700 characters.
 */

/** Teachers' Day in India, Dr Radhakrishnan's birthday. */
export const TEACHERS_DAY_INDIA = "5 September";

/** Year from which 5 September has been observed as Teachers' Day in India. */
export const TEACHERS_DAY_INDIA_SINCE = 1962;

/** World Teachers' Day, declared by UNESCO in 1994. */
export const WORLD_TEACHERS_DAY = "5 October";

/** Year of the ILO/UNESCO Recommendation the October date commemorates. */
export const ILO_UNESCO_RECOMMENDATION_YEAR = 1966;

/** Single-segment SMS length for plain Latin (GSM-7) text. */
export const SMS_GSM7_LIMIT = 160;

/** Single-segment SMS length once any non-Latin character forces UCS-2. */
export const SMS_UNICODE_LIMIT = 70;

/** Maximum length of a WhatsApp text status. */
export const WHATSAPP_STATUS_LIMIT = 700;

export const MIN_MESSAGES = 1;
export const MAX_MESSAGES = 6;

export const OCCASIONS = [
  {
    id: "india",
    label: `Teachers' Day in India (${TEACHERS_DAY_INDIA})`,
    note: `Observed on Dr Sarvepalli Radhakrishnan's birthday, 5 September, since ${TEACHERS_DAY_INDIA_SINCE}.`,
  },
  {
    id: "world",
    label: `World Teachers' Day (${WORLD_TEACHERS_DAY})`,
    note: `Declared by UNESCO in 1994 to mark the ${ILO_UNESCO_RECOMMENDATION_YEAR} ILO/UNESCO Recommendation concerning the Status of Teachers.`,
  },
];

export const MESSAGE_TYPES = [
  { id: "note", label: "Short note", linesUsed: 1 },
  { id: "card", label: "Card message", linesUsed: 2 },
  { id: "speech", label: "Speech opener", linesUsed: 1 },
  { id: "social", label: "Social post", linesUsed: 1 },
];

export const LANGUAGES = [
  {
    id: "en",
    label: "English",
    honorific: "Respected",
    greeting: { india: "Happy Teachers' Day", world: "Happy World Teachers' Day" },
    lines: [
      "Thank you for the patience you showed on the days I did not understand the first time.",
      "What you taught went well past the syllabus, and it has stayed with me.",
      "A good teacher changes how a student thinks, not just what they score - thank you for being one.",
    ],
    speechOpener:
      "Respected teachers, today we get to say out loud what we usually only think quietly.",
    closers: ["With gratitude and respect.", "Thank you, always."],
  },
  {
    id: "hi",
    label: "Hindi (हिन्दी)",
    honorific: "आदरणीय",
    greeting: {
      india: "शिक्षक दिवस की हार्दिक शुभकामनाएं",
      world: "विश्व शिक्षक दिवस की हार्दिक शुभकामनाएं",
    },
    lines: [
      "जिस दिन मुझे पहली बार समझ नहीं आया, उस दिन आपने जो धैर्य दिखाया, उसके लिए धन्यवाद।",
      "आपने जो सिखाया वह पाठ्यक्रम से कहीं आगे था, और वह आज भी मेरे साथ है।",
      "अच्छा शिक्षक अंक नहीं, सोचने का तरीका बदलता है - इसके लिए आपका आभार।",
    ],
    speechOpener:
      "आदरणीय शिक्षकों, आज हमें वह कहने का अवसर मिला है जो हम आमतौर पर केवल सोचते हैं।",
    closers: ["सादर आभार।", "हमेशा धन्यवाद।"],
  },
  {
    id: "mr",
    label: "Marathi (मराठी)",
    honorific: "आदरणीय",
    greeting: {
      india: "शिक्षक दिनाच्या हार्दिक शुभेच्छा",
      world: "जागतिक शिक्षक दिनाच्या हार्दिक शुभेच्छा",
    },
    lines: [
      "मला पहिल्यांदा समजलं नाही तेव्हा तुम्ही दाखवलेल्या संयमाबद्दल मनःपूर्वक आभार.",
      "तुम्ही शिकवलेलं अभ्यासक्रमाच्या पलीकडचं होतं, आणि ते आजही माझ्यासोबत आहे.",
      "चांगला शिक्षक गुण नाही, विचार करण्याची पद्धत बदलतो - त्याबद्दल धन्यवाद.",
    ],
    speechOpener:
      "आदरणीय शिक्षकांनो, आज आम्हाला ते बोलण्याची संधी मिळाली आहे जे आम्ही नेहमी फक्त मनात ठेवतो.",
    closers: ["सादर आभार.", "नेहमीच धन्यवाद."],
  },
  {
    id: "bn",
    label: "Bengali (বাংলা)",
    honorific: "শ্রদ্ধেয়",
    greeting: {
      india: "শিক্ষক দিবসের আন্তরিক শুভেচ্ছা",
      world: "বিশ্ব শিক্ষক দিবসের আন্তরিক শুভেচ্ছা",
    },
    lines: [
      "যেদিন প্রথমবারে বুঝিনি, সেদিন আপনি যে ধৈর্য দেখিয়েছিলেন তার জন্য ধন্যবাদ।",
      "আপনি যা শিখিয়েছেন তা সিলেবাসের অনেক বাইরে, আর তা আজও সঙ্গে আছে।",
      "ভালো শিক্ষক নম্বর নয়, ভাবনার ধরন বদলে দেন - সেজন্য কৃতজ্ঞতা।",
    ],
    speechOpener:
      "শ্রদ্ধেয় শিক্ষকগণ, আজ আমরা সেটাই বলার সুযোগ পেয়েছি যা সাধারণত শুধু মনে মনে ভাবি।",
    closers: ["সশ্রদ্ধ কৃতজ্ঞতা।", "সবসময় ধন্যবাদ।"],
  },
  {
    id: "ta",
    label: "Tamil (தமிழ்)",
    honorific: "மதிப்பிற்குரிய",
    greeting: {
      india: "ஆசிரியர் தின வாழ்த்துக்கள்",
      world: "உலக ஆசிரியர் தின வாழ்த்துக்கள்",
    },
    lines: [
      "முதல் முறையில் புரியாத நாளில் நீங்கள் காட்டிய பொறுமைக்கு நன்றி.",
      "நீங்கள் கற்றுத் தந்தது பாடத்திட்டத்தையும் தாண்டியது; அது இன்றும் என்னுடன் இருக்கிறது.",
      "நல்ல ஆசிரியர் மதிப்பெண்ணை அல்ல, சிந்திக்கும் முறையை மாற்றுகிறார் - நன்றி.",
    ],
    speechOpener:
      "மதிப்பிற்குரிய ஆசிரியர்களே, வழக்கமாக மனதில் மட்டும் நினைப்பதை இன்று சொல்ல வாய்ப்பு கிடைத்திருக்கிறது.",
    closers: ["மனமார்ந்த நன்றி.", "எப்போதும் நன்றி."],
  },
  {
    id: "te",
    label: "Telugu (తెలుగు)",
    honorific: "గౌరవనీయ",
    greeting: {
      india: "ఉపాధ్యాయ దినోత్సవ శుభాకాంక్షలు",
      world: "ప్రపంచ ఉపాధ్యాయ దినోత్సవ శుభాకాంక్షలు",
    },
    lines: [
      "మొదటిసారి అర్థం కాని రోజున మీరు చూపిన ఓర్పుకు ధన్యవాదాలు.",
      "మీరు నేర్పింది పాఠ్యపుస్తకాలను దాటినది; అది ఇప్పటికీ నాతోనే ఉంది.",
      "మంచి ఉపాధ్యాయుడు మార్కులు కాదు, ఆలోచించే విధానాన్ని మారుస్తారు - ధన్యవాదాలు.",
    ],
    speechOpener:
      "గౌరవనీయ ఉపాధ్యాయులారా, సాధారణంగా మనసులో మాత్రమే అనుకునేది ఈరోజు చెప్పే అవకాశం వచ్చింది.",
    closers: ["హృదయపూర్వక ధన్యవాదాలు.", "ఎప్పటికీ ధన్యవాదాలు."],
  },
  {
    id: "kn",
    label: "Kannada (ಕನ್ನಡ)",
    honorific: "ಗೌರವಾನ್ವಿತ",
    greeting: {
      india: "ಶಿಕ್ಷಕರ ದಿನದ ಶುಭಾಶಯಗಳು",
      world: "ವಿಶ್ವ ಶಿಕ್ಷಕರ ದಿನದ ಶುಭಾಶಯಗಳು",
    },
    lines: [
      "ಮೊದಲ ಬಾರಿಗೆ ಅರ್ಥವಾಗದ ದಿನ ನೀವು ತೋರಿದ ತಾಳ್ಮೆಗೆ ಧನ್ಯವಾದಗಳು.",
      "ನೀವು ಕಲಿಸಿದ್ದು ಪಠ್ಯಕ್ರಮವನ್ನು ಮೀರಿತ್ತು; ಅದು ಇಂದಿಗೂ ನನ್ನೊಂದಿಗಿದೆ.",
      "ಒಳ್ಳೆಯ ಶಿಕ್ಷಕರು ಅಂಕಗಳನ್ನಲ್ಲ, ಯೋಚಿಸುವ ರೀತಿಯನ್ನು ಬದಲಾಯಿಸುತ್ತಾರೆ - ಧನ್ಯವಾದಗಳು.",
    ],
    speechOpener:
      "ಗೌರವಾನ್ವಿತ ಶಿಕ್ಷಕರೇ, ಸಾಮಾನ್ಯವಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ಮಾತ್ರ ಅಂದುಕೊಳ್ಳುವುದನ್ನು ಇಂದು ಹೇಳುವ ಅವಕಾಶ ಸಿಕ್ಕಿದೆ.",
    closers: ["ಹೃತ್ಪೂರ್ವಕ ಧನ್ಯವಾದಗಳು.", "ಯಾವಾಗಲೂ ಧನ್ಯವಾದಗಳು."],
  },
  {
    id: "gu",
    label: "Gujarati (ગુજરાતી)",
    honorific: "આદરણીય",
    greeting: {
      india: "શિક્ષક દિનની હાર્દિક શુભેચ્છા",
      world: "વિશ્વ શિક્ષક દિનની હાર્દિક શુભેચ્છા",
    },
    lines: [
      "જે દિવસે પહેલી વાર સમજ ન પડી, તે દિવસે તમે બતાવેલી ધીરજ બદલ આભાર.",
      "તમે જે શીખવ્યું તે અભ્યાસક્રમથી ઘણું આગળ હતું, અને આજે પણ મારી સાથે છે.",
      "સારા શિક્ષક ગુણ નહીં, વિચારવાની રીત બદલે છે - તે માટે આભાર.",
    ],
    speechOpener:
      "આદરણીય શિક્ષકો, આજે અમને એ કહેવાની તક મળી છે જે અમે સામાન્ય રીતે માત્ર વિચારીએ છીએ.",
    closers: ["હૃદયપૂર્વક આભાર.", "હંમેશા આભાર."],
  },
];

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
  const isUnicode = characters.some((ch) => ch.codePointAt(0) > 0x7f);
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
 * How many distinct messages a language + type combination produces.
 * Types that use a closer multiply the three body lines by the two closers.
 */
export function variantCountFor(languageId, typeId) {
  const language = byId(LANGUAGES, languageId);
  const type = byId(MESSAGE_TYPES, typeId);
  if (!language || !type) return 0;
  const lineCount = language.lines.length;
  if (type.id === "note" || type.id === "social") return lineCount;
  return lineCount * language.closers.length;
}

/**
 * Build Teachers Day messages.
 *
 * @param {object} input
 * @param {string} [input.languageId]   One of LANGUAGES ids.
 * @param {string} [input.typeId]       One of MESSAGE_TYPES ids.
 * @param {string} [input.occasionId]   One of OCCASIONS ids.
 * @param {string} [input.teacherName]  Inserted after the honorific.
 * @param {string} [input.senderName]   Signed at the end.
 * @param {string} [input.subject]      Subject taught, e.g. "Physics".
 * @param {number} [input.count]        How many variants, 1 to 6.
 * @param {number} [input.seed]         Integer that shuffles the variants.
 * @returns {{error:string}|object}
 */
export function generateTeachersDayMessages(input) {
  const data = input && typeof input === "object" ? input : {};

  const language = byId(LANGUAGES, data.languageId);
  if (!language) return { error: "Pick a language for the message." };

  const type = byId(MESSAGE_TYPES, data.typeId);
  if (!type) return { error: "Pick whether you want a note, a card message, a speech opener or a post." };

  const occasion = byId(OCCASIONS, data.occasionId) || OCCASIONS[0];

  const teacherName = clean(data.teacherName);
  const senderName = clean(data.senderName);
  const subject = clean(data.subject);

  if (teacherName.length > 50) return { error: "Teacher's name is too long - keep it under 50 characters." };
  if (senderName.length > 50) return { error: "Your name is too long - keep it under 50 characters." };
  if (subject.length > 40) return { error: "Subject name is too long - keep it under 40 characters." };

  const countRaw = data.count == null || data.count === "" ? 3 : Number(data.count);
  if (!Number.isFinite(countRaw)) return { error: "Number of messages must be a whole number." };
  const count = Math.round(countRaw);
  if (count < MIN_MESSAGES || count > MAX_MESSAGES) {
    return { error: `Choose between ${MIN_MESSAGES} and ${MAX_MESSAGES} messages at a time.` };
  }

  const seedRaw = data.seed == null || data.seed === "" ? 1 : Number(data.seed);
  if (!Number.isFinite(seedRaw)) return { error: "Seed must be a number." };
  const seed = Math.trunc(seedRaw);

  const maxVariants = variantCountFor(language.id, type.id);
  if (count > maxVariants) {
    return {
      error: `This language and message type give ${maxVariants} distinct messages - lower the count.`,
    };
  }

  const lines = language.lines;
  const closers = language.closers;
  const greeting = language.greeting[occasion.id];
  const salutation = teacherName ? `${language.honorific} ${teacherName},` : "";
  const subjectTag = subject ? ` (${subject})` : "";

  // Deterministic walk: the body line advances every step and the closer once
  // per full pass, so the first maxVariants messages are all different.
  const lineOffset = mix(seed, 1) % lines.length;
  const closerOffset = mix(seed, 101) % closers.length;

  const messages = [];
  for (let index = 0; index < count; index += 1) {
    const position = lineOffset + index;
    const firstLine = lines[position % lines.length];
    const secondLine = lines[(position + 1) % lines.length];
    const closer = closers[(closerOffset + Math.floor(position / lines.length)) % closers.length];

    let parts;
    if (type.id === "note") {
      parts = [`${greeting}${teacherName ? `, ${teacherName}` : ""}!`, firstLine];
    } else if (type.id === "card") {
      parts = [salutation, `${greeting}!`, firstLine, secondLine, closer];
    } else if (type.id === "speech") {
      parts = [language.speechOpener, firstLine, closer];
    } else {
      parts = [`${greeting}${subjectTag}!`, firstLine];
    }

    let text = parts.filter(Boolean).join(type.id === "card" ? "\n\n" : " ");
    if (senderName) text += `\n\n- ${senderName}`;

    messages.push({
      id: `${language.id}-${type.id}-${occasion.id}-${index}`,
      text,
      ...measureMessage(text),
    });
  }

  const longestLength = messages.reduce((max, item) => (item.length > max ? item.length : max), 0);

  return {
    language,
    type,
    occasion,
    seed,
    count,
    messages,
    longestLength,
    variantsAvailable: maxVariants,
    greetingUsed: greeting,
  };
}
