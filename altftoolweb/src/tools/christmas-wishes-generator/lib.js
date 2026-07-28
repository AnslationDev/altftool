/**
 * Christmas greeting composer plus the Christmas calendar arithmetic.
 *
 * Calendar rules implemented (all standard, verifiable rules):
 *  - Christmas Day is 25 December in the Gregorian calendar.
 *  - Advent Sunday is the fourth Sunday before Christmas Day, i.e. the last Sunday on or before
 *    24 December minus 21 days.
 *  - Epiphany is 6 January; the twelve days of Christmas run from 25 December to 5 January.
 *  - Churches that still keep the Julian calendar celebrate Christmas on Julian 25 December,
 *    which currently lands on 7 January in the Gregorian calendar. The offset between the two
 *    calendars for a century c = floor(year / 100) is c - floor(c / 4) - 2 days: 13 days for
 *    1900-2099 and 14 days from 2100.
 *
 * Message length is scored with the SMS rules from 3GPP TS 23.038: text inside the GSM 03.38
 * seven-bit alphabet gets 160 characters single and 153 per concatenated part; anything else is
 * sent as UCS-2 with 70 characters single and 67 per part.
 *
 * Pure module: no DOM, no React, no clock reads.
 */

const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXTENDED = "^{}\\[~]|€";

const GSM7_BASIC_SET = new Set([...GSM7_BASIC]);
const GSM7_EXTENDED_SET = new Set([...GSM7_EXTENDED]);

export const SMS_GSM7_SINGLE = 160;
export const SMS_GSM7_CONCAT = 153;
export const SMS_UCS2_SINGLE = 70;
export const SMS_UCS2_CONCAT = 67;

/** Score a message the way a mobile network does. */
export function analyzeSms(text) {
  const value = typeof text === "string" ? text : "";
  let septets = 0;
  let gsm = true;
  for (const char of value) {
    if (GSM7_BASIC_SET.has(char)) septets += 1;
    else if (GSM7_EXTENDED_SET.has(char)) septets += 2;
    else {
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toIso(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

/** Difference in days between the Julian and Gregorian calendars for a given Gregorian year. */
export function julianGregorianOffset(year) {
  if (!Number.isInteger(year)) return null;
  const century = Math.floor(year / 100);
  return century - Math.floor(century / 4) - 2;
}

/**
 * Key Christmas dates for a Gregorian year.
 * @returns {object} dates as YYYY-MM-DD, or { error }.
 */
export function computeChristmasDates(year) {
  const y = Number(year);
  if (!Number.isInteger(y) || y < 1583 || y > 2400) {
    return { error: "Enter a Gregorian year between 1583 and 2400." };
  }

  const christmas = Date.UTC(y, 11, 25);
  const christmasEve = Date.UTC(y, 11, 24);
  const eveWeekday = new Date(christmasEve).getUTCDay(); // 0 = Sunday
  const fourthAdvent = christmasEve - eveWeekday * MS_PER_DAY;
  const firstAdvent = fourthAdvent - 21 * MS_PER_DAY;

  const offset = julianGregorianOffset(y);
  const orthodox = christmas + offset * MS_PER_DAY;

  return {
    year: y,
    christmas: toIso(christmas),
    christmasWeekday: new Date(christmas).getUTCDay(),
    adventSunday: toIso(firstAdvent),
    fourthAdvent: toIso(fourthAdvent),
    epiphany: toIso(Date.UTC(y + 1, 0, 6)),
    twelfthNight: toIso(Date.UTC(y + 1, 0, 5)),
    julianOffsetDays: offset,
    orthodoxChristmas: toIso(orthodox),
  };
}

export const TONES = [
  { id: "warm", label: "Warm — family and friends" },
  { id: "formal", label: "Formal — clients, colleagues, cards" },
  { id: "short", label: "Short — status, gift tag, subject line" },
];

export const EMOJI = "🎄✨";

/**
 * Thirty languages. `short` is the bare seasonal greeting, `warm` adds the New Year wish, and
 * `formal` uses the polite or plural address where the language has one.
 */
export const LANGUAGES = [
  {
    id: "en",
    label: "English",
    native: "English",
    short: "Merry Christmas!",
    warm: "Merry Christmas and a Happy New Year! Wishing you a warm, easy and well-fed holiday.",
    formal:
      "Wishing you and your family a peaceful Christmas and a successful year ahead. Thank you for a good year of working together.",
  },
  {
    id: "es",
    label: "Spanish",
    native: "Español",
    short: "¡Feliz Navidad!",
    warm: "¡Feliz Navidad y próspero Año Nuevo! Que pases unas fiestas llenas de familia y descanso.",
    formal: "Le deseamos una feliz Navidad y un próspero Año Nuevo.",
  },
  {
    id: "fr",
    label: "French",
    native: "Français",
    short: "Joyeux Noël !",
    warm: "Joyeux Noël et bonne année ! Passe de belles fêtes en famille.",
    formal: "Nous vous souhaitons un joyeux Noël et une excellente nouvelle année.",
  },
  {
    id: "de",
    label: "German",
    native: "Deutsch",
    short: "Frohe Weihnachten!",
    warm: "Frohe Weihnachten und ein gutes neues Jahr! Geniess die Feiertage.",
    formal: "Wir wünschen Ihnen frohe Weihnachten und ein erfolgreiches neues Jahr.",
  },
  {
    id: "it",
    label: "Italian",
    native: "Italiano",
    short: "Buon Natale!",
    warm: "Buon Natale e felice Anno Nuovo! Buone feste a te e ai tuoi.",
    formal: "Le auguriamo un sereno Natale e un felice Anno Nuovo.",
  },
  {
    id: "pt",
    label: "Portuguese",
    native: "Português",
    short: "Feliz Natal!",
    warm: "Feliz Natal e um próspero Ano Novo! Boas festas para si e para a família.",
    formal: "Desejamos-lhe um Feliz Natal e um próspero Ano Novo.",
  },
  {
    id: "nl",
    label: "Dutch",
    native: "Nederlands",
    short: "Vrolijk kerstfeest!",
    warm: "Vrolijk kerstfeest en een gelukkig nieuwjaar! Fijne dagen gewenst.",
    formal: "Wij wensen u fijne kerstdagen en een voorspoedig nieuwjaar.",
  },
  {
    id: "sv",
    label: "Swedish",
    native: "Svenska",
    short: "God jul!",
    warm: "God jul och gott nytt år! Ha en riktigt skön helg.",
    formal: "Vi önskar er en god jul och ett gott nytt år.",
  },
  {
    id: "no",
    label: "Norwegian",
    native: "Norsk",
    short: "God jul!",
    warm: "God jul og godt nytt år! Ha en fin høytid.",
    formal: "Vi ønsker dere en god jul og et godt nytt år.",
  },
  {
    id: "da",
    label: "Danish",
    native: "Dansk",
    short: "Glædelig jul!",
    warm: "Glædelig jul og godt nytår! Ha en dejlig højtid.",
    formal: "Vi ønsker jer en glædelig jul og et godt nytår.",
  },
  {
    id: "fi",
    label: "Finnish",
    native: "Suomi",
    short: "Hyvää joulua!",
    warm: "Hyvää joulua ja onnellista uutta vuotta! Rauhallista joulunaikaa.",
    formal: "Toivotamme teille hyvää joulua ja onnellista uutta vuotta.",
  },
  {
    id: "pl",
    label: "Polish",
    native: "Polski",
    short: "Wesołych Świąt!",
    warm: "Wesołych Świąt i szczęśliwego Nowego Roku! Spokojnych dni w gronie najbliższych.",
    formal: "Życzymy Państwu wesołych Świąt Bożego Narodzenia i szczęśliwego Nowego Roku.",
  },
  {
    id: "cs",
    label: "Czech",
    native: "Čeština",
    short: "Veselé Vánoce!",
    warm: "Veselé Vánoce a šťastný nový rok! Užij si klidné svátky.",
    formal: "Přejeme Vám veselé Vánoce a šťastný nový rok.",
  },
  {
    id: "ro",
    label: "Romanian",
    native: "Română",
    short: "Crăciun fericit!",
    warm: "Crăciun fericit și un An Nou fericit! Sărbători liniștite alături de cei dragi.",
    formal: "Vă dorim Crăciun fericit și un An Nou plin de realizări.",
  },
  {
    id: "hu",
    label: "Hungarian",
    native: "Magyar",
    short: "Boldog karácsonyt!",
    warm: "Boldog karácsonyt és boldog új évet! Pihentető ünnepeket kívánok.",
    formal: "Kellemes karácsonyi ünnepeket és boldog új évet kívánunk.",
  },
  {
    id: "hr",
    label: "Croatian",
    native: "Hrvatski",
    short: "Sretan Božić!",
    warm: "Sretan Božić i sretna Nova godina! Mirne i tople blagdane.",
    formal: "Želimo Vam sretan Božić i uspješnu Novu godinu.",
  },
  {
    id: "tr",
    label: "Turkish",
    native: "Türkçe",
    short: "Mutlu Noeller!",
    warm: "Mutlu Noeller ve mutlu yıllar! Keyifli bir tatil geçir.",
    formal: "Mutlu Noeller ve mutlu bir yeni yıl dileriz.",
  },
  {
    id: "el",
    label: "Greek",
    native: "Ελληνικά",
    short: "Καλά Χριστούγεννα!",
    warm: "Καλά Χριστούγεννα και ευτυχισμένο το νέο έτος!",
    formal: "Σας ευχόμαστε καλά Χριστούγεννα και ευτυχισμένο το νέο έτος.",
    roman: {
      short: "Kala Christougenna!",
      warm: "Kala Christougenna kai eftychismeno to neo etos!",
      formal: "Sas efchomaste kala Christougenna kai eftychismeno to neo etos.",
    },
  },
  {
    id: "ru",
    label: "Russian",
    native: "Русский",
    short: "С Рождеством!",
    warm: "С Рождеством и Новым годом! Тепла и радости твоему дому.",
    formal: "Поздравляем Вас с Рождеством и Новым годом!",
    roman: {
      short: "S Rozhdestvom!",
      warm: "S Rozhdestvom i Novym godom! Tepla i radosti tvoyemu domu.",
      formal: "Pozdravlyaem Vas s Rozhdestvom i Novym godom!",
    },
  },
  {
    id: "uk",
    label: "Ukrainian",
    native: "Українська",
    short: "З Різдвом!",
    warm: "З Різдвом Христовим і Новим роком! Миру та тепла твоїй родині.",
    formal: "Вітаємо Вас із Різдвом Христовим та Новим роком!",
    roman: {
      short: "Z Rizdvom!",
      warm: "Z Rizdvom Khrystovym i Novym rokom! Myru ta tepla tvoyij rodyni.",
      formal: "Vitaiemo Vas iz Rizdvom Khrystovym ta Novym rokom!",
    },
  },
  {
    id: "fil",
    label: "Filipino",
    native: "Filipino",
    short: "Maligayang Pasko!",
    warm: "Maligayang Pasko at Manigong Bagong Taon! Sana masaya ang handaan ninyo.",
    formal: "Maligayang Pasko at masaganang Bagong Taon po sa inyo at sa inyong pamilya.",
  },
  {
    id: "id",
    label: "Indonesian",
    native: "Bahasa Indonesia",
    short: "Selamat Natal!",
    warm: "Selamat Natal dan Tahun Baru! Semoga harimu hangat dan penuh sukacita.",
    formal: "Selamat Hari Natal dan Tahun Baru. Semoga tahun depan membawa keberhasilan.",
  },
  {
    id: "vi",
    label: "Vietnamese",
    native: "Tiếng Việt",
    short: "Chúc mừng Giáng sinh!",
    warm: "Chúc mừng Giáng sinh và Năm mới! Chúc bạn một mùa lễ ấm áp.",
    formal: "Kính chúc quý vị Giáng sinh an lành và Năm mới thành công.",
  },
  {
    id: "th",
    label: "Thai",
    native: "ไทย",
    short: "สุขสันต์วันคริสต์มาส!",
    warm: "สุขสันต์วันคริสต์มาสและสวัสดีปีใหม่!",
    formal: "ขอให้มีความสุขในวันคริสต์มาสและตลอดปีใหม่",
    roman: {
      short: "Suksan wan Christmas!",
      warm: "Suksan wan Christmas lae sawasdee pi mai!",
      formal: "Kho hai mi khwam suk nai wan Christmas lae talot pi mai.",
    },
  },
  {
    id: "ja",
    label: "Japanese",
    native: "日本語",
    short: "メリークリスマス！",
    warm: "メリークリスマス！良いお年を！",
    formal: "メリークリスマス。良いお年をお迎えください。",
    roman: {
      short: "Merii Kurisumasu!",
      warm: "Merii Kurisumasu! Yoi otoshi o!",
      formal: "Merii Kurisumasu. Yoi otoshi o omukae kudasai.",
    },
  },
  {
    id: "zh",
    label: "Chinese (Simplified)",
    native: "简体中文",
    short: "圣诞快乐！",
    warm: "圣诞快乐，新年快乐！",
    formal: "恭祝圣诞快乐，新年万事如意。",
    roman: {
      short: "Shengdan kuaile!",
      warm: "Shengdan kuaile, xinnian kuaile!",
      formal: "Gongzhu shengdan kuaile, xinnian wanshi ruyi.",
    },
  },
  {
    id: "ko",
    label: "Korean",
    native: "한국어",
    short: "메리 크리스마스!",
    warm: "메리 크리스마스, 새해 복 많이 받으세요!",
    formal: "메리 크리스마스. 새해 복 많이 받으시길 바랍니다.",
    roman: {
      short: "Meri Keuriseumaseu!",
      warm: "Meri Keuriseumaseu, saehae bok mani badeuseyo!",
      formal: "Meri Keuriseumaseu. Saehae bok mani badeusigil baramnida.",
    },
  },
  {
    id: "hi",
    label: "Hindi",
    native: "हिन्दी",
    short: "क्रिसमस की शुभकामनाएँ!",
    warm: "क्रिसमस की हार्दिक शुभकामनाएँ और नववर्ष मंगलमय हो!",
    formal: "आपको और आपके परिवार को क्रिसमस तथा नववर्ष की हार्दिक शुभकामनाएँ।",
    roman: {
      short: "Christmas ki shubhkamnayein!",
      warm: "Christmas ki hardik shubhkamnayein aur navvarsh mangalmay ho!",
      formal: "Aapko aur aapke parivaar ko Christmas tatha navvarsh ki hardik shubhkamnayein.",
    },
  },
  {
    id: "ta",
    label: "Tamil",
    native: "தமிழ்",
    short: "இனிய கிறிஸ்துமஸ்!",
    warm: "இனிய கிறிஸ்துமஸ் மற்றும் புத்தாண்டு வாழ்த்துக்கள்!",
    formal: "தங்களுக்கும் தங்கள் குடும்பத்தினருக்கும் இனிய கிறிஸ்துமஸ் மற்றும் புத்தாண்டு வாழ்த்துக்கள்.",
    roman: {
      short: "Iniya Christmas!",
      warm: "Iniya Christmas matrum Puthandu vazhthukkal!",
      formal: "Thangalukkum thangal kudumbathinarukkum iniya Christmas matrum Puthandu vazhthukkal.",
    },
  },
  {
    id: "ml",
    label: "Malayalam",
    native: "മലയാളം",
    short: "ക്രിസ്മസ് ആശംസകൾ!",
    warm: "ക്രിസ്മസ് ആശംസകളും പുതുവത്സരാശംസകളും!",
    formal: "താങ്കൾക്കും കുടുംബത്തിനും ക്രിസ്മസ് - പുതുവത്സര ആശംസകൾ.",
    roman: {
      short: "Christmas ashamsakal!",
      warm: "Christmas ashamsakalum puthuvatsaraashamsakalum!",
      formal: "Thankalkkum kudumbathinum Christmas - puthuvatsara ashamsakal.",
    },
  },
];

const TONE_IDS = TONES.map((tone) => tone.id);

export const MAX_NAME_LENGTH = 40;

function cleanName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

/**
 * Compose one Christmas greeting.
 * @returns {object} greeting, or { error }.
 */
export function buildChristmasWish({
  languageId = "en",
  tone = "warm",
  recipient = "",
  sender = "",
  includeRoman = true,
  includeEmoji = false,
} = {}) {
  const language = LANGUAGES.find((item) => item.id === languageId);
  if (!language) return { error: "Choose a language from the list." };
  if (!TONE_IDS.includes(tone)) return { error: "Choose a warm, formal or short tone." };

  const body = language[tone];
  if (!body) return { error: "That tone is not available for this language yet." };

  const to = cleanName(recipient);
  const from = cleanName(sender);

  const lines = [];
  if (to) lines.push(`${to},`);
  lines.push(includeEmoji ? `${body} ${EMOJI}` : body);
  const roman = language.roman ? language.roman[tone] : "";
  if (includeRoman && roman) lines.push(`(${roman})`);
  // A hyphen keeps a Latin-script greeting inside the GSM-7 alphabet; an em dash would not.
  if (from) lines.push(`- ${from}`);

  const text = lines.join("\n");

  return {
    text,
    lines,
    languageId: language.id,
    languageLabel: language.label,
    languageNative: language.native,
    tone,
    toneLabel: TONES.find((item) => item.id === tone)?.label ?? tone,
    roman,
    characters: [...text].length,
    words: text.split(/\s+/).filter(Boolean).length,
    sms: analyzeSms(text),
  };
}

/** The same greeting in every tone, for side-by-side comparison. */
export function buildChristmasWishSet(options = {}) {
  const results = [];
  for (const tone of TONE_IDS) {
    const wish = buildChristmasWish({ ...options, tone });
    if (!wish.error) results.push(wish);
  }
  return results;
}
