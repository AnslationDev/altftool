/**
 * Morse Code Translator — pure encode/decode plus transmission timing.
 *
 * Character set and element timing follow International Morse Code as codified in
 * ITU-R Recommendation M.1677-1 (International Morse code, 2009):
 *   - a dash is three times the length of a dot
 *   - the space between elements of one character is one dot
 *   - the space between two characters is three dots
 *   - the space between two words is seven dots
 */

/** Letters, per ITU-R M.1677-1 section 1.1.1. */
export const MORSE_LETTERS = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
};

/** Figures, per ITU-R M.1677-1 section 1.1.2. */
export const MORSE_DIGITS = {
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
  5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
};

/** Punctuation and miscellaneous signs, per ITU-R M.1677-1 section 1.1.3. */
export const MORSE_PUNCTUATION = {
  ".": ".-.-.-",
  ",": "--..--",
  ":": "---...",
  "?": "..--..",
  "'": ".----.",
  "-": "-....-",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  '"': ".-..-.",
  "=": "-...-",
  "+": ".-.-.",
  "@": ".--.-.",
  "!": "-.-.--",
  "&": ".-...",
  ";": "-.-.-.",
  _: "..--.-",
  $: "...-..-",
};

/** Full encoding table: character -> morse. */
export const MORSE_TABLE = {
  ...MORSE_LETTERS,
  ...MORSE_DIGITS,
  ...MORSE_PUNCTUATION,
};

/** Decoding table: morse -> character. First definition wins, so letters beat prosigns. */
export const REVERSE_MORSE_TABLE = Object.entries(MORSE_TABLE).reduce((table, [char, code]) => {
  if (!(code in table)) table[code] = char;
  return table;
}, {});

/** Well-known procedure signals, sent as one unbroken character string. */
export const PROSIGNS = [
  { code: "...---...", name: "SOS", meaning: "International distress signal" },
  { code: ".-.-.", name: "AR", meaning: "End of message" },
  { code: "-.-", name: "K", meaning: "Invitation to transmit — go ahead" },
  { code: "...-.-", name: "SK", meaning: "End of contact" },
  { code: "........", name: "HH", meaning: "Error — disregard the last word" },
  { code: "-...-", name: "BT", meaning: "New paragraph / break" },
];

/** ITU element lengths in dot units. */
export const UNIT_DOT = 1;
export const UNIT_DASH = 3;
export const UNIT_ELEMENT_GAP = 1;
export const UNIT_CHAR_GAP = 3;
export const UNIT_WORD_GAP = 7;

/**
 * The standard word "PARIS" is exactly 50 dot units including the trailing word gap,
 * which is what defines words-per-minute in Morse practice. So one dot lasts
 * 60 / (50 x wpm) seconds = 1.2 / wpm seconds.
 */
export const PARIS_UNITS_PER_WORD = 50;

/** Practical speed range accepted by this tool, in words per minute. */
export const MIN_WPM = 1;
export const MAX_WPM = 60;

/** Guard so a paste of a whole book does not lock the tab. */
export const MAX_INPUT_LENGTH = 20000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Encodes plain text to Morse.
 * Letters are separated by a single space, words by a forward slash with spaces (" / ").
 *
 * @param {string} text
 * @returns {{morse:string, unsupported:string[], characters:number, words:number}|{error:string}}
 */
export function textToMorse(text) {
  if (typeof text !== "string") return { error: "Enter some text to translate." };
  const trimmed = text.trim();
  if (trimmed === "") return { error: "Enter some text to translate." };
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { error: `Input is limited to ${MAX_INPUT_LENGTH} characters.` };
  }

  const words = trimmed.toUpperCase().split(/\s+/);
  const unsupported = [];
  const encodedWords = [];

  for (const word of words) {
    const codes = [];
    for (const char of word) {
      const code = MORSE_TABLE[char];
      if (code) codes.push(code);
      else if (!unsupported.includes(char)) unsupported.push(char);
    }
    if (codes.length > 0) encodedWords.push(codes.join(" "));
  }

  if (encodedWords.length === 0) {
    return { error: "None of those characters exist in International Morse code." };
  }

  const morse = encodedWords.join(" / ");
  return {
    morse,
    unsupported,
    characters: morse.replace(/[^.\-]/g, "").length,
    words: encodedWords.length,
  };
}

/**
 * Decodes Morse back to text. Accepts "." or "·" for dots, "-", "–" or "_" for dashes,
 * one or more spaces between characters, and "/" or a double space between words.
 *
 * @param {string} morse
 * @returns {{text:string, unknown:string[]}|{error:string}}
 */
export function morseToText(morse) {
  if (typeof morse !== "string") return { error: "Enter Morse code to decode." };
  const normalised = morse
    .replace(/[·•]/g, ".")
    .replace(/[–—_]/g, "-")
    .replace(/\|/g, "/")
    .trim();
  if (normalised === "") return { error: "Enter Morse code to decode." };
  if (normalised.length > MAX_INPUT_LENGTH) {
    return { error: `Input is limited to ${MAX_INPUT_LENGTH} characters.` };
  }
  if (/[^.\-/\s]/.test(normalised)) {
    return { error: "Morse input may only contain dots, dashes, spaces and / between words." };
  }

  const words = normalised.split(/\s*\/+\s*|\s{2,}/).filter((word) => word.trim() !== "");
  const unknown = [];
  const decodedWords = [];

  for (const word of words) {
    const letters = word.trim().split(/\s+/).filter(Boolean);
    let decoded = "";
    for (const letter of letters) {
      const char = REVERSE_MORSE_TABLE[letter];
      if (char) decoded += char;
      else {
        decoded += "?";
        if (!unknown.includes(letter)) unknown.push(letter);
      }
    }
    if (decoded !== "") decodedWords.push(decoded);
  }

  if (decodedWords.length === 0) {
    return { error: "No Morse characters found in that input." };
  }

  return { text: decodedWords.join(" "), unknown };
}

/**
 * Counts the dot units a Morse string occupies, including the gaps between
 * elements, characters and words, per the ITU timing rules above.
 *
 * @param {string} morse Morse in the "... --- ... / ..." form.
 * @returns {number} total dot units, 0 for empty input.
 */
export function morseUnits(morse) {
  if (typeof morse !== "string") return 0;
  const words = morse.split(/\s*\/+\s*/).filter((word) => word.trim() !== "");
  if (words.length === 0) return 0;

  let units = 0;
  words.forEach((word, wordIndex) => {
    const letters = word.trim().split(/\s+/).filter(Boolean);
    letters.forEach((letter, letterIndex) => {
      let letterUnits = 0;
      for (const element of letter) {
        if (element === ".") letterUnits += UNIT_DOT;
        else if (element === "-") letterUnits += UNIT_DASH;
      }
      // one intra-character gap between each pair of elements
      letterUnits += Math.max(0, letter.length - 1) * UNIT_ELEMENT_GAP;
      units += letterUnits;
      if (letterIndex < letters.length - 1) units += UNIT_CHAR_GAP;
    });
    if (wordIndex < words.length - 1) units += UNIT_WORD_GAP;
  });

  return units;
}

/**
 * Converts a unit count into a transmission time at a given speed.
 *
 * @param {string} morse
 * @param {number} wpm Words per minute on the PARIS standard.
 * @returns {{units:number, dotSeconds:number, seconds:number, wpm:number}|{error:string}}
 */
export function morseTiming(morse, wpm) {
  if (!isNum(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Speed must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }
  const units = morseUnits(morse);
  if (units <= 0) return { units: 0, dotSeconds: 0, seconds: 0, wpm };
  const dotSeconds = 60 / (PARIS_UNITS_PER_WORD * wpm);
  return {
    units,
    dotSeconds,
    seconds: units * dotSeconds,
    wpm,
  };
}

/** Formats seconds as "1m 12.4s" / "8.6s". */
export function formatSeconds(seconds) {
  if (!isNum(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${minutes}m ${rest.toFixed(1)}s`;
}
