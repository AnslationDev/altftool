/**
 * Muslim baby name finder — pure logic, no React and no DOM.
 *
 * Three things live here:
 *  1. NAMES — names with the Arabic spelling, the meaning, the language of
 *     origin, and a tag where the name belongs to a prophet, a companion or the
 *     family of the Prophet Muhammad (peace be upon him).
 *  2. urduSpelling() — Urdu is written in the same Perso-Arabic script as
 *     Arabic but uses ہ where Arabic writes the final tā' marbūṭa ة, and ی
 *     where Arabic writes the final yā' ي. Applying those two conventions gives
 *     the usual Urdu form of an Arabic name.
 *  3. checkAbdName() — "ʿAbd" means "servant of", so classical scholars hold it
 *     should only be joined to a name of Allah: Abdullah, Abdul Rahman, Abdul
 *     Aziz. "Abdul" on its own is not a complete name — it is "servant of the",
 *     waiting for the second half.
 */

export const GENDERS = [
  { id: "any", label: "Any" },
  { id: "boy", label: "Boy" },
  { id: "girl", label: "Girl" },
];

export const TAGS = [
  { id: "any", label: "Any" },
  { id: "prophet", label: "Name of a prophet" },
  { id: "companion", label: "Companion of the Prophet" },
  { id: "family", label: "Family of the Prophet" },
];

/**
 * Well-known names of Allah that "ʿAbd" is commonly joined to. This is a subset
 * of the ninety-nine names, transliterated the way the compound is usually
 * written in South Asia.
 */
export const ABD_SECOND_ELEMENTS = [
  "allah",
  "rahman",
  "raheem",
  "rahim",
  "aziz",
  "kareem",
  "karim",
  "malik",
  "ghafoor",
  "ghafur",
  "qadir",
  "qadeer",
  "samad",
  "hakeem",
  "hakim",
  "wahid",
  "ahad",
  "latif",
  "lateef",
  "majeed",
  "majid",
  "sattar",
  "razzaq",
  "jabbar",
  "hafeez",
  "hafiz",
  "salam",
  "bari",
  "mannan",
  "wadud",
  "basit",
  "shakoor",
  "haleem",
  "halim",
  "khaliq",
  "muqtadir",
  "muhaimin",
  "wali",
  "nasir",
  "naseer",
  "muizz",
  "raqib",
  "rauf",
  "sabur",
  "sami",
  "shakur",
];

/** Row format: [roman, gender, arabic, origin, meaning, tag] */
const ROWS = [
  ["Aadil", "boy", "عادل", "Arabic", "Just, fair", ""],
  ["Aaliyah", "girl", "عالية", "Arabic", "High, exalted", ""],
  ["Abdullah", "boy", "عبد الله", "Arabic", "Servant of Allah", ""],
  ["Abdul Rahman", "boy", "عبد الرحمن", "Arabic", "Servant of the Most Merciful", "companion"],
  ["Adnan", "boy", "عدنان", "Arabic", "Settler, one who settles", ""],
  ["Ahmad", "boy", "أحمد", "Arabic", "Most praiseworthy", ""],
  ["Aisha", "girl", "عائشة", "Arabic", "Living, alive", "family"],
  ["Ali", "boy", "علي", "Arabic", "Exalted, high", "family"],
  ["Amina", "girl", "آمنة", "Arabic", "Trustworthy, safe", "family"],
  ["Amir", "boy", "أمير", "Arabic", "Prince, commander", ""],
  ["Anas", "boy", "أنس", "Arabic", "Affection, friendliness", "companion"],
  ["Arif", "boy", "عارف", "Arabic", "Knowing, aware", ""],
  ["Asad", "boy", "أسد", "Arabic", "Lion", ""],
  ["Asma", "girl", "أسماء", "Arabic", "Names; loftier", "companion"],
  ["Ayman", "boy", "أيمن", "Arabic", "Blessed, fortunate", ""],
  ["Azhar", "boy", "أزهر", "Arabic", "Most radiant, brightest", ""],
  ["Bilal", "boy", "بلال", "Arabic", "Moisture, water", "companion"],
  ["Burhan", "boy", "برهان", "Arabic", "Proof, clear evidence", ""],
  ["Bushra", "girl", "بشرى", "Arabic", "Good news, glad tidings", ""],
  ["Danish", "boy", "دانش", "Persian", "Knowledge, learning", ""],
  ["Ehsan", "boy", "إحسان", "Arabic", "Excellence, doing good", ""],
  ["Faisal", "boy", "فيصل", "Arabic", "Decisive, one who judges", ""],
  ["Farah", "girl", "فرح", "Arabic", "Joy, gladness", ""],
  ["Farhan", "boy", "فرحان", "Arabic", "Joyful, glad", ""],
  ["Faris", "boy", "فارس", "Arabic", "Horseman, knight", ""],
  ["Fatima", "girl", "فاطمة", "Arabic", "One who weans", "family"],
  ["Fawad", "boy", "فؤاد", "Arabic", "Heart", ""],
  ["Ghazi", "boy", "غازي", "Arabic", "One who returns victorious", ""],
  ["Habib", "boy", "حبيب", "Arabic", "Beloved", ""],
  ["Habiba", "girl", "حبيبة", "Arabic", "Beloved", ""],
  ["Hafsa", "girl", "حفصة", "Arabic", "Young lioness", "family"],
  ["Hamid", "boy", "حامد", "Arabic", "One who praises", ""],
  ["Hamza", "boy", "حمزة", "Arabic", "Strong, steadfast; lion", "companion"],
  ["Hana", "girl", "هناء", "Arabic", "Happiness, ease", ""],
  ["Haris", "boy", "حارث", "Arabic", "Cultivator, guardian", ""],
  ["Harun", "boy", "هارون", "Arabic", "The prophet Aaron", "prophet"],
  ["Hasan", "boy", "حسن", "Arabic", "Good, handsome", "family"],
  ["Hina", "girl", "حناء", "Arabic", "Henna", ""],
  ["Huda", "girl", "هدى", "Arabic", "Guidance, right path", ""],
  ["Hussain", "boy", "حسين", "Arabic", "Little good one", "family"],
  ["Ibrahim", "boy", "إبراهيم", "Arabic", "The prophet Abraham", "prophet"],
  ["Idris", "boy", "إدريس", "Arabic", "A prophet named in the Quran", "prophet"],
  ["Ilyas", "boy", "إلياس", "Arabic", "The prophet Elijah", "prophet"],
  ["Iman", "girl", "إيمان", "Arabic", "Faith, belief", ""],
  ["Imran", "boy", "عمران", "Arabic", "Father of Maryam; prosperity", ""],
  ["Inaya", "girl", "عناية", "Arabic", "Care, solicitude", ""],
  ["Irfan", "boy", "عرفان", "Arabic", "Knowledge, awareness", ""],
  ["Isa", "boy", "عيسى", "Arabic", "The prophet Jesus", "prophet"],
  ["Ishaq", "boy", "إسحاق", "Arabic", "The prophet Isaac", "prophet"],
  ["Ismail", "boy", "إسماعيل", "Arabic", "The prophet Ishmael", "prophet"],
  ["Jamal", "boy", "جمال", "Arabic", "Beauty", ""],
  ["Jamila", "girl", "جميلة", "Arabic", "Beautiful", ""],
  ["Junaid", "boy", "جنيد", "Arabic", "Young warrior", ""],
  ["Kamal", "boy", "كمال", "Arabic", "Perfection, completeness", ""],
  ["Karim", "boy", "كريم", "Arabic", "Generous, noble", ""],
  ["Khadija", "girl", "خديجة", "Arabic", "Early born", "family"],
  ["Khalid", "boy", "خالد", "Arabic", "Eternal, everlasting", "companion"],
  ["Laila", "girl", "ليلى", "Arabic", "Night", ""],
  ["Maha", "girl", "مها", "Arabic", "Wild oryx; wide beautiful eyes", ""],
  ["Mahmud", "boy", "محمود", "Arabic", "Praised, commendable", ""],
  ["Malik", "boy", "مالك", "Arabic", "Master, owner", ""],
  ["Mansoor", "boy", "منصور", "Arabic", "Victorious, divinely aided", ""],
  ["Maryam", "girl", "مريم", "Arabic", "Mother of the prophet Isa", ""],
  ["Masood", "boy", "مسعود", "Arabic", "Fortunate, happy", ""],
  ["Muhammad", "boy", "محمد", "Arabic", "Praised, praiseworthy", "prophet"],
  ["Mustafa", "boy", "مصطفى", "Arabic", "Chosen, selected", ""],
  ["Nadeem", "boy", "نديم", "Arabic", "Close companion", ""],
  ["Nadia", "girl", "نادية", "Arabic", "One who calls, announcer", ""],
  ["Naeem", "boy", "نعيم", "Arabic", "Bliss, ease", ""],
  ["Naila", "girl", "نائلة", "Arabic", "One who attains, acquirer", ""],
  ["Najma", "girl", "نجمة", "Arabic", "Star", ""],
  ["Nasir", "boy", "ناصر", "Arabic", "Helper, supporter", ""],
  ["Nasreen", "girl", "نسرين", "Persian", "Wild rose", ""],
  ["Nida", "girl", "نداء", "Arabic", "Call, appeal", ""],
  ["Noor", "girl", "نور", "Arabic", "Light", ""],
  ["Omar", "boy", "عمر", "Arabic", "Flourishing, long-lived", "companion"],
  ["Qasim", "boy", "قاسم", "Arabic", "One who distributes", "family"],
  ["Rabia", "girl", "رابعة", "Arabic", "Fourth; springtime", ""],
  ["Rahma", "girl", "رحمة", "Arabic", "Mercy, compassion", ""],
  ["Rania", "girl", "رانية", "Arabic", "Gazing, contemplating", ""],
  ["Rashid", "boy", "راشد", "Arabic", "Rightly guided", ""],
  ["Rayyan", "boy", "ريان", "Arabic", "Luxuriant, well-watered; a gate of Paradise", ""],
  ["Rehan", "boy", "ريحان", "Arabic", "Sweet basil, fragrant herb", ""],
  ["Rida", "girl", "رضا", "Arabic", "Contentment, divine pleasure", ""],
  ["Ruqayya", "girl", "رقية", "Arabic", "Ascent, rise", "family"],
  ["Saad", "boy", "سعد", "Arabic", "Good fortune, felicity", "companion"],
  ["Sadia", "girl", "سعدية", "Arabic", "Fortunate, blessed", ""],
  ["Safia", "girl", "صفية", "Arabic", "Pure, chosen friend", "family"],
  ["Sajid", "boy", "ساجد", "Arabic", "One who prostrates in prayer", ""],
  ["Sakina", "girl", "سكينة", "Arabic", "Tranquillity, calm", ""],
  ["Salim", "boy", "سليم", "Arabic", "Safe, sound, unharmed", ""],
  ["Salma", "girl", "سلمى", "Arabic", "Safe, peaceful", ""],
  ["Salman", "boy", "سلمان", "Arabic", "Safe, secure", "companion"],
  ["Samir", "boy", "سمير", "Arabic", "Companion in evening talk", ""],
  ["Samira", "girl", "سميرة", "Arabic", "Companion in evening talk", ""],
  ["Sana", "girl", "سناء", "Arabic", "Radiance, brilliance", ""],
  ["Sara", "girl", "سارة", "Arabic", "Wife of the prophet Ibrahim", ""],
  ["Shahid", "boy", "شاهد", "Arabic", "Witness", ""],
  ["Shaista", "girl", "شائستہ", "Persian", "Well-mannered, becoming", ""],
  ["Sohail", "boy", "سهيل", "Arabic", "The star Canopus", ""],
  ["Sumaiya", "girl", "سمية", "Arabic", "Elevated, lofty", "companion"],
  ["Tahir", "boy", "طاهر", "Arabic", "Pure, clean", ""],
  ["Tahira", "girl", "طاهرة", "Arabic", "Pure, clean", ""],
  ["Talha", "boy", "طلحة", "Arabic", "A kind of fruit tree", "companion"],
  ["Tariq", "boy", "طارق", "Arabic", "One who knocks; the morning star", ""],
  ["Usman", "boy", "عثمان", "Arabic", "Bustard chick", "companion"],
  ["Waleed", "boy", "وليد", "Arabic", "Newborn child", ""],
  ["Wasim", "boy", "وسيم", "Arabic", "Handsome, graceful", ""],
  ["Yahya", "boy", "يحيى", "Arabic", "The prophet John", "prophet"],
  ["Yasin", "boy", "ياسين", "Arabic", "Opening letters of Surah Ya-Sin", ""],
  ["Yasmin", "girl", "ياسمين", "Persian", "Jasmine flower", ""],
  ["Yusuf", "boy", "يوسف", "Arabic", "The prophet Joseph", "prophet"],
  ["Zahra", "girl", "زهراء", "Arabic", "Radiant, luminous", "family"],
  ["Zaid", "boy", "زيد", "Arabic", "Growth, abundance", "companion"],
  ["Zain", "boy", "زين", "Arabic", "Beauty, adornment", ""],
  ["Zainab", "girl", "زينب", "Arabic", "A fragrant flowering tree", "family"],
  ["Zakariya", "boy", "زكريا", "Arabic", "The prophet Zechariah", "prophet"],
  ["Zubair", "boy", "زبير", "Arabic", "Strong, wise", "companion"],
];

/**
 * Convert an Arabic spelling to its usual Urdu form.
 * Urdu writes the final tā' marbūṭa ة as ہ, and the final yā' ي as ی.
 */
export function urduSpelling(arabic) {
  if (typeof arabic !== "string" || !arabic) return "";
  return arabic.replace(/ة$/u, "ہ").replace(/ي$/u, "ی");
}

export const NAMES = ROWS.map(([name, gender, arabic, origin, meaning, tag]) => ({
  name,
  gender,
  arabic,
  urdu: urduSpelling(arabic),
  origin,
  meaning,
  tag,
  initial: name.charAt(0).toUpperCase(),
}));

export const ORIGINS = Array.from(new Set(NAMES.map((n) => n.origin))).sort();

/**
 * Check an "Abd" compound name.
 *
 * @param {string} name  e.g. "Abdul Rahman", "Abdullah", "Abdul Nabi"
 * @returns {{isAbd: boolean, ok: boolean|null, message: string}}
 */
export function checkAbdName(name) {
  const raw = typeof name === "string" ? name.trim().toLowerCase().replace(/[-']/g, " ") : "";
  if (!raw) return { isAbd: false, ok: null, message: "" };

  if (raw === "abdullah" || raw === "abdallah" || raw === "abd allah") {
    return { isAbd: true, ok: true, message: "Abdullah means servant of Allah — a complete name." };
  }
  if (!/^abd(ul|ur|u|us)?\b/.test(raw)) {
    return { isAbd: false, ok: null, message: "" };
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return {
      isAbd: true,
      ok: false,
      message:
        "\"Abdul\" on its own means \"servant of the\" and is not a complete name — it needs a name of Allah after it, as in Abdul Rahman.",
    };
  }

  const second = parts[1].replace(/^al/, "");
  if (ABD_SECOND_ELEMENTS.includes(second)) {
    const titled = second.charAt(0).toUpperCase() + second.slice(1);
    return {
      isAbd: true,
      ok: true,
      message: `Joined to a name of Allah, so the compound reads "servant of al-${titled}".`,
    };
  }

  return {
    isAbd: true,
    ok: false,
    message:
      "\"Abd\" means \"servant of\", and classical scholars hold it should only be joined to a name of Allah. Check the second element before using this form.",
  };
}

/**
 * Filter the name list.
 *
 * @param {object} options
 * @param {string} [options.letter]  a single letter, or "any"
 * @param {string} [options.gender]  "any" | "boy" | "girl"
 * @param {string} [options.origin]  an exact origin, or "any"
 * @param {string} [options.tag]     "any" | "prophet" | "companion" | "family"
 * @param {string} [options.meaning] substring of the meaning
 * @returns {{names: object[], matched: number, total: number}|{error: string}}
 */
export function filterNames({
  letter = "any",
  gender = "any",
  origin = "any",
  tag = "any",
  meaning = "",
} = {}) {
  if (gender !== "any" && !GENDERS.some((g) => g.id === gender)) {
    return { error: "Choose a valid gender option." };
  }
  if (tag !== "any" && !TAGS.some((t) => t.id === tag)) {
    return { error: "Choose a valid category." };
  }

  const wantedLetter = typeof letter === "string" ? letter.trim().toUpperCase() : "";
  const useLetter = wantedLetter.length === 1 && /^[A-Z]$/.test(wantedLetter);
  if (wantedLetter && wantedLetter !== "ANY" && !useLetter) {
    return { error: "Pick a single letter from A to Z." };
  }

  const needle = typeof meaning === "string" ? meaning.trim().toLowerCase() : "";

  const names = NAMES.filter((entry) => {
    if (useLetter && entry.initial !== wantedLetter) return false;
    if (gender !== "any" && entry.gender !== gender) return false;
    if (origin !== "any" && entry.origin !== origin) return false;
    if (tag !== "any" && entry.tag !== tag) return false;
    if (needle && !entry.meaning.toLowerCase().includes(needle)) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));

  return { names, matched: names.length, total: NAMES.length };
}
