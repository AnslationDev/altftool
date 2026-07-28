/**
 * Russian Cyrillic alphabet reference plus two standard romanisations.
 *
 * `iso9` is ISO 9:1995 System A — a strict one letter to one letter mapping
 * with diacritics, reversible by design.
 * `icao` is the romanisation used on Russian international passports, taken
 * from ICAO Doc 9303 / GOST R 52535.1-2006 — no diacritics, so ж becomes zh
 * and я becomes ia.
 *
 * Plain data and pure functions — no React, no DOM.
 */

export const TRANSLIT_SYSTEMS = [
  {
    id: "icao",
    label: "ICAO passport (Russian passports since 2013)",
    note: "No diacritics. Used for names in Russian international passports and airline tickets.",
  },
  {
    id: "iso9",
    label: "ISO 9:1995 System A (scholarly)",
    note: "One Latin letter per Cyrillic letter, using diacritics. Fully reversible.",
  },
];

/**
 * The 33 letters of the modern Russian alphabet in dictionary order.
 * `type` follows Russian school grammar: й counts as a consonant
 * ("и краткое"), ъ and ь are silent signs with no sound of their own.
 */
export const CYRILLIC_LETTERS = [
  { id: "a", upper: "А", lower: "а", name: "а", english: "a", type: "vowel", iso9: "a", icao: "a", sound: "'a' as in father.", lookalike: "Same shape and roughly the same sound as Latin A." },
  { id: "be", upper: "Б", lower: "б", name: "бэ", english: "be", type: "consonant", iso9: "b", icao: "b", sound: "'b' as in bat.", lookalike: "" },
  { id: "ve", upper: "В", lower: "в", name: "вэ", english: "ve", type: "consonant", iso9: "v", icao: "v", sound: "'v' as in van.", lookalike: "Looks like Latin B but sounds like V — the classic first trap." },
  { id: "ge", upper: "Г", lower: "г", name: "гэ", english: "ge", type: "consonant", iso9: "g", icao: "g", sound: "Hard 'g' as in go.", lookalike: "" },
  { id: "de", upper: "Д", lower: "д", name: "дэ", english: "de", type: "consonant", iso9: "d", icao: "d", sound: "'d' as in dog.", lookalike: "" },
  { id: "ye", upper: "Е", lower: "е", name: "е", english: "ye", type: "vowel", iso9: "e", icao: "e", sound: "'ye' as in yes when stressed; softens the consonant before it.", lookalike: "Looks like Latin E but usually carries a 'y' glide." },
  { id: "yo", upper: "Ё", lower: "ё", name: "ё", english: "yo", type: "vowel", iso9: "ë", icao: "e", sound: "'yo' as in yonder, and always stressed.", lookalike: "Often printed as plain е, which is why Russians sometimes disagree on spellings." },
  { id: "zhe", upper: "Ж", lower: "ж", name: "жэ", english: "zhe", type: "consonant", iso9: "ž", icao: "zh", sound: "The 's' of measure.", lookalike: "" },
  { id: "ze", upper: "З", lower: "з", name: "зэ", english: "ze", type: "consonant", iso9: "z", icao: "z", sound: "'z' as in zoo.", lookalike: "Looks like the digit 3." },
  { id: "i", upper: "И", lower: "и", name: "и", english: "i", type: "vowel", iso9: "i", icao: "i", sound: "'ee' as in machine.", lookalike: "Looks like a reversed Latin N." },
  { id: "i-kratkoye", upper: "Й", lower: "й", name: "и краткое", english: "i kratkoye", type: "consonant", iso9: "j", icao: "i", sound: "The 'y' of boy — a glide, not a full vowel.", lookalike: "И with a breve on top; easy to miss in handwriting." },
  { id: "ka", upper: "К", lower: "к", name: "ка", english: "ka", type: "consonant", iso9: "k", icao: "k", sound: "'k' as in skin.", lookalike: "" },
  { id: "el", upper: "Л", lower: "л", name: "эль", english: "el", type: "consonant", iso9: "l", icao: "l", sound: "'l' as in lamp, darker before hard vowels.", lookalike: "" },
  { id: "em", upper: "М", lower: "м", name: "эм", english: "em", type: "consonant", iso9: "m", icao: "m", sound: "'m' as in map.", lookalike: "" },
  { id: "en", upper: "Н", lower: "н", name: "эн", english: "en", type: "consonant", iso9: "n", icao: "n", sound: "'n' as in net.", lookalike: "Looks like Latin H but sounds like N." },
  { id: "o", upper: "О", lower: "о", name: "о", english: "o", type: "vowel", iso9: "o", icao: "o", sound: "'o' as in more when stressed; reduces to an 'a' sound when not.", lookalike: "" },
  { id: "pe", upper: "П", lower: "п", name: "пэ", english: "pe", type: "consonant", iso9: "p", icao: "p", sound: "'p' as in spin.", lookalike: "" },
  { id: "er", upper: "Р", lower: "р", name: "эр", english: "er", type: "consonant", iso9: "r", icao: "r", sound: "A tapped or trilled 'r'.", lookalike: "Looks like Latin P but sounds like R." },
  { id: "es", upper: "С", lower: "с", name: "эс", english: "es", type: "consonant", iso9: "s", icao: "s", sound: "'s' as in sit.", lookalike: "Looks like Latin C but sounds like S." },
  { id: "te", upper: "Т", lower: "т", name: "тэ", english: "te", type: "consonant", iso9: "t", icao: "t", sound: "'t' as in stop.", lookalike: "" },
  { id: "u", upper: "У", lower: "у", name: "у", english: "u", type: "vowel", iso9: "u", icao: "u", sound: "'oo' as in boot.", lookalike: "Looks like Latin Y but sounds like OO." },
  { id: "ef", upper: "Ф", lower: "ф", name: "эф", english: "ef", type: "consonant", iso9: "f", icao: "f", sound: "'f' as in fan.", lookalike: "" },
  { id: "ha", upper: "Х", lower: "х", name: "ха", english: "kha", type: "consonant", iso9: "h", icao: "kh", sound: "The 'ch' of Scottish loch.", lookalike: "Looks like Latin X but sounds like a rasped H." },
  { id: "tse", upper: "Ц", lower: "ц", name: "цэ", english: "tse", type: "consonant", iso9: "c", icao: "ts", sound: "'ts' as in cats.", lookalike: "" },
  { id: "che", upper: "Ч", lower: "ч", name: "че", english: "che", type: "consonant", iso9: "č", icao: "ch", sound: "'ch' as in church.", lookalike: "Looks like the digit 4." },
  { id: "sha", upper: "Ш", lower: "ш", name: "ша", english: "sha", type: "consonant", iso9: "š", icao: "sh", sound: "'sh' as in shop.", lookalike: "" },
  { id: "shcha", upper: "Щ", lower: "щ", name: "ща", english: "shcha", type: "consonant", iso9: "ŝ", icao: "shch", sound: "A long soft 'sh', as in fresh sheets run together.", lookalike: "Ш with a tail — the only difference from ш." },
  { id: "hard-sign", upper: "Ъ", lower: "ъ", name: "твёрдый знак", english: "hard sign", type: "sign", iso9: "ʺ", icao: "ie", sound: "Silent. Blocks softening, separating a prefix from the vowel after it.", lookalike: "Never starts a word, so you only meet it mid-word." },
  { id: "y", upper: "Ы", lower: "ы", name: "ы", english: "y", type: "vowel", iso9: "y", icao: "y", sound: "A back unrounded 'i', with the tongue pulled back — no English equivalent.", lookalike: "" },
  { id: "soft-sign", upper: "Ь", lower: "ь", name: "мягкий знак", english: "soft sign", type: "sign", iso9: "ʹ", icao: "", sound: "Silent. Softens (palatalises) the consonant before it.", lookalike: "Dropped entirely in passport romanisation, which is why мать becomes mat." },
  { id: "e-oborotnoye", upper: "Э", lower: "э", name: "э", english: "e", type: "vowel", iso9: "è", icao: "e", sound: "'e' as in met, with no 'y' glide.", lookalike: "A mirrored Е; the plain-e counterpart of е." },
  { id: "yu", upper: "Ю", lower: "ю", name: "ю", english: "yu", type: "vowel", iso9: "û", icao: "iu", sound: "'yu' as in universe.", lookalike: "" },
  { id: "ya", upper: "Я", lower: "я", name: "я", english: "ya", type: "vowel", iso9: "â", icao: "ia", sound: "'ya' as in yard.", lookalike: "Looks like a reversed Latin R but sounds like YA." },
];

export const DEFAULT_SYSTEM = "icao";

const round1 = (value) => Math.round(value * 10) / 10;

const buildMap = (system) => {
  const map = new Map();
  for (const letter of CYRILLIC_LETTERS) {
    map.set(letter.lower, letter[system]);
    map.set(letter.upper, letter[system]);
  }
  return map;
};

const MAPS = { iso9: buildMap("iso9"), icao: buildMap("icao") };

const isUpper = (char) => char !== char.toLowerCase() && char === char.toUpperCase();

const capitaliseFirst = (text) =>
  text.length === 0 ? text : text[0].toUpperCase() + text.slice(1);

/**
 * Romanise Cyrillic text.
 *
 * Case rule: a capital Cyrillic letter followed by another capital is written
 * fully capitalised (ЩИ becomes SHCHI), otherwise only the first Latin letter
 * is capitalised (Щи becomes Shchi).
 */
export function transliterate(text, system = DEFAULT_SYSTEM) {
  if (typeof text !== "string") return "";
  const map = MAPS[system];
  if (!map) return "";

  let output = "";
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (!map.has(char)) {
      output += char;
      continue;
    }
    const latin = map.get(char);
    if (latin === "") continue;
    if (!isUpper(char)) {
      output += latin;
      continue;
    }
    const next = text[index + 1] || "";
    const nextIsUpperCyrillic = map.has(next) && isUpper(next);
    output += nextIsUpperCyrillic ? latin.toUpperCase() : capitaliseFirst(latin);
  }
  return output;
}

/** Count vowels, consonants and silent signs. Russian: 10 + 21 + 2 = 33. */
export function letterCounts() {
  const counts = { vowel: 0, consonant: 0, sign: 0, total: CYRILLIC_LETTERS.length };
  for (const letter of CYRILLIC_LETTERS) counts[letter.type] += 1;
  return counts;
}

/** Letters whose shape is borrowed from Latin but whose sound is different. */
export function falseFriends() {
  return CYRILLIC_LETTERS.filter((letter) => letter.lookalike !== "");
}

/**
 * How much of a passage is already readable if you only know the letters that
 * look and sound like Latin ones.
 */
const FAMILIAR_SHAPES = new Set(["а", "е", "к", "м", "о", "т"]);

export function readabilityScore(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Type or paste some Cyrillic text to score it." };
  }
  const letters = [...text.toLowerCase()].filter((char) => MAPS.icao.has(char));
  if (letters.length === 0) {
    return { error: "No Cyrillic letters found in that text." };
  }
  const familiar = letters.filter((char) => FAMILIAR_SHAPES.has(char)).length;
  return {
    letters: letters.length,
    familiar,
    unfamiliar: letters.length - familiar,
    familiarPct: round1((familiar / letters.length) * 100),
  };
}

/** Case-insensitive search across letter, name, sound and lookalike note. */
export function searchLetters(query) {
  const needle = String(query || "").trim().toLowerCase();
  if (needle === "") return CYRILLIC_LETTERS;
  return CYRILLIC_LETTERS.filter((letter) =>
    [
      letter.upper,
      letter.lower,
      letter.name,
      letter.english,
      letter.sound,
      letter.lookalike,
      letter.iso9,
      letter.icao,
      letter.type,
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
