/**
 * Hebrew alphabet reference plus the two number systems built on it:
 * gematria (adding a word's letter values) and Hebrew numerals (writing a
 * number with letters).
 *
 * Plain data and pure functions — no React, no DOM.
 */

/**
 * The 22 letters of the Hebrew alphabet, in order.
 *
 * `value` is the standard gematria value (mispar hechrachi).
 * `finalValue` is the value the final form takes in the expanded system
 * (mispar gadol), where ך is 500 through ץ at 900.
 * `begadkefat` marks the letters whose sound hardens when a dagesh dot is
 * written inside them — in modern Hebrew only bet, kaf and pe still change.
 */
export const HEBREW_LETTERS = [
  { id: "alef", char: "א", final: "", name: "Alef", hebrewName: "אָלֶף", translit: "ʾ", value: 1, finalValue: null, begadkefat: false, sound: "Silent — a placeholder that carries whatever vowel point is written under it." },
  { id: "bet", char: "ב", final: "", name: "Bet / Vet", hebrewName: "בֵּית", translit: "b", value: 2, finalValue: null, begadkefat: true, sound: "'b' with a dagesh (בּ), 'v' without it (ב)." },
  { id: "gimel", char: "ג", final: "", name: "Gimel", hebrewName: "גִּימֶל", translit: "g", value: 3, finalValue: null, begadkefat: true, sound: "Hard 'g' as in go." },
  { id: "dalet", char: "ד", final: "", name: "Dalet", hebrewName: "דָּלֶת", translit: "d", value: 4, finalValue: null, begadkefat: true, sound: "'d' as in dog." },
  { id: "he", char: "ה", final: "", name: "He", hebrewName: "הֵא", translit: "h", value: 5, finalValue: null, begadkefat: false, sound: "'h' as in hat; silent at the end of a word." },
  { id: "vav", char: "ו", final: "", name: "Vav", hebrewName: "וָו", translit: "v", value: 6, finalValue: null, begadkefat: false, sound: "'v'; also serves as the vowel o (וֹ) or u (וּ)." },
  { id: "zayin", char: "ז", final: "", name: "Zayin", hebrewName: "זַיִן", translit: "z", value: 7, finalValue: null, begadkefat: false, sound: "'z' as in zoo." },
  { id: "het", char: "ח", final: "", name: "Het", hebrewName: "חֵית", translit: "ch", value: 8, finalValue: null, begadkefat: false, sound: "A rasped 'ch' as in Bach or loch." },
  { id: "tet", char: "ט", final: "", name: "Tet", hebrewName: "טֵית", translit: "t", value: 9, finalValue: null, begadkefat: false, sound: "'t' as in stop." },
  { id: "yod", char: "י", final: "", name: "Yod", hebrewName: "יוֹד", translit: "y", value: 10, finalValue: null, begadkefat: false, sound: "'y' as in yes; the smallest letter, and also a vowel marker." },
  { id: "kaf", char: "כ", final: "ך", name: "Kaf / Khaf", hebrewName: "כַּף", translit: "k", value: 20, finalValue: 500, begadkefat: true, sound: "'k' with a dagesh (כּ), a rasped 'kh' without it. Final form ך." },
  { id: "lamed", char: "ל", final: "", name: "Lamed", hebrewName: "לָמֶד", translit: "l", value: 30, finalValue: null, begadkefat: false, sound: "'l' as in lamp; the tallest letter." },
  { id: "mem", char: "מ", final: "ם", name: "Mem", hebrewName: "מֵם", translit: "m", value: 40, finalValue: 600, begadkefat: false, sound: "'m' as in map. Final form ם." },
  { id: "nun", char: "נ", final: "ן", name: "Nun", hebrewName: "נוּן", translit: "n", value: 50, finalValue: 700, begadkefat: false, sound: "'n' as in net. Final form ן." },
  { id: "samekh", char: "ס", final: "", name: "Samekh", hebrewName: "סָמֶךְ", translit: "s", value: 60, finalValue: null, begadkefat: false, sound: "'s' as in sit." },
  { id: "ayin", char: "ע", final: "", name: "Ayin", hebrewName: "עַיִן", translit: "ʿ", value: 70, finalValue: null, begadkefat: false, sound: "Silent in modern Israeli Hebrew; a throat consonant in Mizrahi and Arabic-influenced pronunciation." },
  { id: "pe", char: "פ", final: "ף", name: "Pe / Fe", hebrewName: "פֵּא", translit: "p", value: 80, finalValue: 800, begadkefat: true, sound: "'p' with a dagesh (פּ), 'f' without it. Final form ף." },
  { id: "tsadi", char: "צ", final: "ץ", name: "Tsadi", hebrewName: "צָדִי", translit: "ts", value: 90, finalValue: 900, begadkefat: false, sound: "'ts' as in cats. Final form ץ." },
  { id: "qof", char: "ק", final: "", name: "Qof", hebrewName: "קוֹף", translit: "k", value: 100, finalValue: null, begadkefat: false, sound: "'k' — identical to kaf in modern Israeli Hebrew." },
  { id: "resh", char: "ר", final: "", name: "Resh", hebrewName: "רֵישׁ", translit: "r", value: 200, finalValue: null, begadkefat: false, sound: "A guttural 'r' made at the back of the throat in modern Israeli Hebrew." },
  { id: "shin", char: "ש", final: "", name: "Shin / Sin", hebrewName: "שִׁין", translit: "sh", value: 300, finalValue: null, begadkefat: false, sound: "'sh' with a dot on the right (שׁ), 's' with a dot on the left (שׂ)." },
  { id: "tav", char: "ת", final: "", name: "Tav", hebrewName: "תָּו", translit: "t", value: 400, finalValue: null, begadkefat: true, sound: "'t' as in stop." },
];

/** Niqqud — the vowel points written above, below or inside a letter. */
export const NIQQUD = [
  { id: "kamatz", mark: "ָ", name: "Kamatz", sound: "a", note: "Historically a long a; identical to patach in modern Israeli speech." },
  { id: "patach", mark: "ַ", name: "Patach", sound: "a", note: "Short a, as in father." },
  { id: "tzere", mark: "ֵ", name: "Tzere", sound: "e", note: "A closed e, as in they." },
  { id: "segol", mark: "ֶ", name: "Segol", sound: "e", note: "An open e, as in bed. Three dots in a triangle." },
  { id: "hirik", mark: "ִ", name: "Hirik", sound: "i", note: "'ee' as in machine. A single dot underneath." },
  { id: "holam", mark: "ֹ", name: "Holam", sound: "o", note: "'o' as in more. A dot above and to the left." },
  { id: "kubutz", mark: "ֻ", name: "Kubutz", sound: "u", note: "'oo' as in boot. Three diagonal dots." },
  {
    id: "shuruk",
    mark: "ּ",
    name: "Shuruk",
    sound: "u",
    note: "'oo' written as a vav with a dot inside it (וּ).",
    // Unlike the other marks, shuruk only ever attaches to vav — showing it on
    // bet would be indistinguishable from dagesh (same combining dot, U+05BC).
    host: "ו",
  },
  { id: "sheva", mark: "ְ", name: "Sheva", sound: "ə or silent", note: "Two vertical dots. Either a very short vowel or no vowel at all." },
  { id: "dagesh", mark: "ּ", name: "Dagesh", sound: "—", note: "Not a vowel: a dot inside a letter that hardens bet, kaf and pe." },
];

/**
 * Every combining mark in the Hebrew block, used to strip pointing — plus the
 * geresh (U+05F3) and gershayim (U+05F4) punctuation marks, which sit outside
 * the U+0591-U+05C7 diacritic range but are documented as stripped by
 * stripNiqqud() below (abbreviations like צה"ל, בג"ץ use them).
 */
const NIQQUD_RANGE = /[֑-ׇ׳״]/g;

export const GEMATRIA_METHODS = [
  { id: "hechrachi", label: "Mispar hechrachi (standard)", note: "Final forms carry the same value as the ordinary letter." },
  { id: "gadol", label: "Mispar gadol (expanded finals)", note: "Final forms carry 500 to 900, extending the count past 400." },
];

const LETTER_BY_CHAR = (() => {
  const map = new Map();
  for (const letter of HEBREW_LETTERS) {
    map.set(letter.char, letter);
    if (letter.final) map.set(letter.final, letter);
  }
  return map;
})();

/** Remove niqqud, cantillation marks and the geresh/gershayim punctuation. */
export function stripNiqqud(text) {
  if (typeof text !== "string") return "";
  return text.replace(NIQQUD_RANGE, "");
}

/**
 * Add up the letter values of a Hebrew word.
 *
 * @param {string} text
 * @param {"hechrachi"|"gadol"} method
 */
export function gematria(text, method = "hechrachi") {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Type a Hebrew word to add up its letters." };
  }
  if (method !== "hechrachi" && method !== "gadol") {
    return { error: "Choose either the standard or the expanded gematria method." };
  }

  const bare = stripNiqqud(text);
  const breakdown = [];
  let total = 0;
  for (const char of bare) {
    const letter = LETTER_BY_CHAR.get(char);
    if (!letter) continue;
    const isFinal = letter.final === char;
    const value =
      method === "gadol" && isFinal && letter.finalValue !== null ? letter.finalValue : letter.value;
    total += value;
    breakdown.push({ char, name: letter.name, value, isFinal });
  }

  if (breakdown.length === 0) {
    return { error: "No Hebrew letters found in that text." };
  }

  return { total, letterCount: breakdown.length, breakdown, method };
}

export const MIN_NUMERAL = 1;
export const MAX_NUMERAL = 999;

const UNIT_CHARS = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TEN_CHARS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDRED_CHARS = ["", "ק", "ר", "ש", "ת"];

/**
 * Write a number 1-999 in Hebrew numerals.
 *
 * Two rules matter:
 *   - Hundreds above 400 are built by repeating ת (400), so 500 is תק and
 *     900 is תתק.
 *   - 15 and 16 are written טו and טז rather than יה and יו, because those
 *     spellings would form part of the divine name.
 */
export function toHebrewNumeral(value) {
  if (!Number.isInteger(value)) return { error: "Hebrew numerals only write whole numbers." };
  if (value < MIN_NUMERAL || value > MAX_NUMERAL) {
    return { error: `This converter covers ${MIN_NUMERAL} to ${MAX_NUMERAL}; the system has no zero.` };
  }

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  let text = "";
  let left = hundreds;
  while (left > 4) {
    text += "ת";
    left -= 4;
  }
  text += HUNDRED_CHARS[left];

  let substituted = false;
  if (remainder === 15) {
    text += "טו";
    substituted = true;
  } else if (remainder === 16) {
    text += "טז";
    substituted = true;
  } else {
    text += TEN_CHARS[Math.floor(remainder / 10)] + UNIT_CHARS[remainder % 10];
  }

  return { value, numeral: text, substituted };
}

/** Read a Hebrew numeral back into a number, using standard letter values. */
export function fromHebrewNumeral(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Enter a Hebrew numeral such as רמח." };
  }
  const bare = stripNiqqud(text).replace(/['"׳״\s]/g, "");
  let total = 0;
  let matched = 0;
  for (const char of bare) {
    const letter = LETTER_BY_CHAR.get(char);
    if (!letter) return { error: `"${char}" is not a Hebrew letter.` };
    total += letter.value;
    matched += 1;
  }
  if (matched === 0) return { error: "No Hebrew letters found." };
  return { value: total, letters: matched };
}

/** Simple modern-Israeli transliteration; final forms map to their base sound. */
export function transliterate(text) {
  if (typeof text !== "string") return "";
  let output = "";
  for (const char of stripNiqqud(text)) {
    const letter = LETTER_BY_CHAR.get(char);
    output += letter ? letter.translit : char;
  }
  return output;
}

/** The five letters that change shape at the end of a word. */
export function finalFormLetters() {
  return HEBREW_LETTERS.filter((letter) => letter.final !== "");
}

/** Case-insensitive search across name, sound and value. */
export function searchLetters(query) {
  const needle = String(query || "").trim().toLowerCase();
  if (needle === "") return HEBREW_LETTERS;
  return HEBREW_LETTERS.filter((letter) =>
    [letter.char, letter.final, letter.name, letter.hebrewName, letter.translit, letter.sound, String(letter.value)]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
